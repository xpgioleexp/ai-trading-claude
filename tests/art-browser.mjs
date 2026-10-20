import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, extname, sep } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const root = fileURLToPath(new URL('..', import.meta.url));
// The pre-art commit is the reference, not a second implementation of the size rules.
const baseRef = process.env.ART_BASE_REF || 'ef67b2f72cbe4d325adcc559d68d3e740ca0c9c1';
const temp = await mkdtemp(join(tmpdir(), 'little-us-art-')),
  baseline = join(temp, 'base');
let browser, server;
try {
  await mkdir(baseline);
  const archive = join(temp, 'base.tar');
  execFileSync('git', ['archive', '--output', archive, baseRef], { cwd: root });
  execFileSync('tar', ['-xf', archive, '-C', baseline]);
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost'),
        isBase = url.pathname.startsWith('/base/'),
        structural = url.pathname.startsWith('/structural/'),
        prefix = isBase ? '/base/' : structural ? '/structural/' : '/current/';
      if (!url.pathname.startsWith(prefix)) {
        res.writeHead(404);
        res.end();
        return;
      }
      const folder = isBase ? baseline : root,
        relative = decodeURIComponent(url.pathname.slice(prefix.length)) || 'index.html',
        path = resolve(folder, relative);
      if (!path.startsWith(resolve(folder) + sep)) {
        res.writeHead(403);
        res.end();
        return;
      }
      let body = await readFile(path);
      if (structural && relative === 'src/art-style.js') {
        const source = body.toString(),
          stripped = source.replace(
            /(export function finishPixels\([^)]*\)\s*\{)/,
            '$1\nreturn;\n',
          );
        if (stripped === source) throw new Error('Could not disable the shared material finish');
        body = Buffer.from(stripped);
      }
      res.writeHead(200, {
        'content-type':
          {
            '.js': 'text/javascript',
            '.mjs': 'text/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.html': 'text/html',
            '.css': 'text/css',
          }[extname(path)] || 'application/octet-stream',
      });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(origin + '/current/assets/manifest.json');
  const result = await page.evaluate(async () => {
    const { artCases } = await import('/current/tests/art-cases.mjs'),
      before = await artCases('/base/'),
      after = await artCases('/current/'),
      old = new Map(before.rows.map((r) => [r.id, r.canvas])),
      failures = [];
    let changed = 0;
    const hash = (canvas) => {
      const d = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      let h = 2166136261,
        pixels = 0;
      for (let i = 0; i < d.length; i++) {
        h = Math.imul(h ^ d[i], 16777619);
        if (i % 4 === 3 && d[i]) pixels++;
      }
      return { hash: h >>> 0, pixels };
    };
    for (const { id, canvas } of after.rows) {
      const original = old.get(id);
      if (!original) {
        failures.push('Missing baseline: ' + id);
        continue;
      }
      if (canvas.width !== original.width || canvas.height !== original.height)
        failures.push('Dimensions: ' + id);
      const a = hash(original),
        b = hash(canvas);
      if (a.pixels && !b.pixels) failures.push('Blank art: ' + id);
      if (a.hash !== b.hash) changed++;
    }
    if (after.rows.length !== before.rows.length) failures.push('Variant count changed');
    for (const name of Object.keys(before.modules))
      if (
        Object.keys(before.modules[name]).sort().join() !==
        Object.keys(after.modules[name]).sort().join()
      )
        failures.push('Exports: ' + name);
    const { phoneIconURL } = await import('/current/src/phone-art.js');
    const phoneImages = new Set();
    for (const id of [
      'today',
      'questions',
      'missions',
      'mail',
      'dates',
      'dreams',
      'journal',
      'scrapbook',
      'discoveries',
      'hangout',
      'bag',
      'log',
      'cooking',
      'diy',
      'tools',
      'wardrobe',
      'build',
      'home',
      'shop',
      'jars',
      'events',
      'friends',
      'weather',
      'lore',
      'map',
      'museum',
      'mine',
      'settings',
    ]) {
      const icon = phoneIconURL(id);
      if (!icon.startsWith('data:image/png')) failures.push('Phone icon ' + id);
      phoneImages.add(icon);
    }
    if (phoneImages.size !== 28) failures.push('Each phone app must have its own distinct picture');
    const raw = await artCases('/structural/');
    const structuralUnchanged = raw.rows
      .filter(({ id, canvas }) => hash(canvas).hash === hash(old.get(id)).hash)
      .map((r) => r.id);
    const { painterCoverage } = await import('/current/tests/art-coverage.mjs');
    const coverage = await painterCoverage('/current/', after);
    return { variants: after.rows.length, changed, failures, structuralUnchanged, coverage };
  });
  assert.deepEqual(result.failures, []);
  assert.ok(result.variants > 6500);
  assert.equal(result.changed, result.variants);
  assert.deepEqual(
    result.structuralUnchanged,
    [],
    'Every variant must change before the shared material finish',
  );
  assert.deepEqual(
    result.coverage.failures,
    [],
    'Every registered form needs a nonblank redesigned painter',
  );
  console.log(
    `PASS ${result.variants} sprite variants: original dimensions and exports; no new blanks; ${result.changed} updated renders; 28 pixel phone icons.`,
  );
  console.log(
    'PASS every variant also differs with the shared finish disabled; zero old-painter fallbacks.',
  );
  console.log('Painter coverage: ' + JSON.stringify(result.coverage.counts));
  // Exercise the PNG override path: the painted style must never alter supplied image files.
  const image = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 48;
    c.height = 40;
    c.getContext('2d').fillRect(0, 0, 48, 40);
    return c.toDataURL();
  });
  await page.route('**/art-fixture/manifest.json', (r) =>
    r.fulfill({ json: { sprites: { tent: 'tent.png' } } }),
  );
  await page.route('**/art-fixture/tent.png', (r) =>
    r.fulfill({ contentType: 'image/png', body: Buffer.from(image.split(',')[1], 'base64') }),
  );
  assert.equal(
    await page.evaluate(async () => {
      const m = await import('/current/src/sprites.js');
      await m.loadOverrides('/art-fixture/');
      const image = m.tentSprite();
      return image instanceof HTMLImageElement && image.width === 48 && image.height === 40;
    }),
    true,
  );
  console.log('PASS PNG overrides bypass procedural painting and preserve their dimensions.');
  await page.goto(origin + '/current/docs/art-preview/index.html');
  await page.waitForFunction(() => document.querySelector('#status').textContent.includes('6,980'));
  const first = await page.locator('figcaption').first().textContent();
  await page.click('#next');
  assert.notEqual(await page.locator('figcaption').first().textContent(), first);
  await page.selectOption('#family', 'furniture');
  await page.fill('#search', 'furniture:jukebox');
  assert.equal(await page.locator('figure').count(), 1);
  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
    );
  }
  console.log('PASS art gallery search, family filter, pagination, and mobile/desktop layout.');
} finally {
  await browser?.close();
  await new Promise((resolve) => (server ? server.close(resolve) : resolve()));
  await rm(temp, { recursive: true, force: true });
}
