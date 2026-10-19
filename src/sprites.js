// Placeholder pixel art, drawn in code. Each sprite has a stable name, and a PNG
// listed in assets/manifest.json with the same name replaces it (see docs/ASSETS.md).
import { ITEMS, CROP_BY_ID } from './data.js';
import { hashString } from './rng.js';

export const PAL = {
  grass: '#A8BE7C', grassShade: '#829D62', grassHi: '#C2CE95',
  leaf: '#6F925B', leafShade: '#3F604A', leafHi: '#9DBA74',
  wood: '#B88D60', woodShade: '#775B46', woodHi: '#D9B783',
  water: '#79AAA4', waterShade: '#507F83', waterHi: '#B7D4BD',
  linen: '#F3E9CF', linenShade: '#D5C5A4', linenHi: '#FFF7E4',
  ink: '#38493D', inkDeep: '#29372F',
  rose: '#C68F89', roseShade: '#A96E75', roseHi: '#E4B4A3',
  soil: '#7A5A3E', soilWet: '#5A4130', stone: '#9A958A', stoneShade: '#6E6A62', stoneHi: '#C4BFB3',
};

export const SEASON_GROUND = {
  spring: [PAL.grass, PAL.grassShade, PAL.grassHi],
  summer: ['#9DB86E', '#7E9A55', '#B9CC86'],
  autumn: ['#C2B070', '#A28F55', '#D6C68C'],
  winter: ['#E6EDEE', '#C5D3D8', '#F7FAFA'],
};

// ---------- helpers ----------

export function makeCanvas(w, h) {
  const c = typeof OffscreenCanvas !== 'undefined' && !globalThis.document
    ? new OffscreenCanvas(w, h)
    : Object.assign(document.createElement('canvas'), { width: w, height: h });
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  return c;
}

export function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x | 0, y | 0, w | 0, h | 0);
}

export function disc(ctx, cx, cy, rad, color) {
  ctx.fillStyle = color;
  for (let y = Math.floor(cy - rad); y <= cy + rad; y++) {
    for (let x = Math.floor(cx - rad); x <= cx + rad; x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy;
      if (dx * dx + dy * dy <= rad * rad) ctx.fillRect(x, y, 1, 1);
    }
  }
}

export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const target = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  r = Math.round(r + (target - r) * k);
  g = Math.round(g + (target - g) * k);
  b = Math.round(b + (target - b) * k);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// ---------- PNG overrides from ChatGPT's art ----------

const overrides = new Map();

export async function loadOverrides(base = 'assets/') {
  try {
    const res = await fetch(base + 'manifest.json', { cache: 'no-store' });
    if (!res.ok) return 0;
    const manifest = await res.json();
    await Promise.all(Object.entries(manifest.sprites || {}).map(([name, file]) => new Promise(resolve => {
      const img = new Image();
      img.onload = () => { overrides.set(name, img); resolve(); };
      img.onerror = resolve;
      img.src = base + file;
    })));
  } catch {
    // No manifest yet: keep the drawn placeholders.
  }
  cache.clear();
  return overrides.size;
}

const cache = new Map();

// Returns a drawable for the sprite name, from a PNG override or the drawing function.
export function sprite(name, w, h, draw) {
  if (overrides.has(name)) return overrides.get(name);
  let c = cache.get(name);
  if (!c) {
    c = makeCanvas(w, h);
    draw(c.getContext('2d'));
    cache.set(name, c);
  }
  return c;
}

// ---------- ground ----------

export function grassTile(season, variant) {
  return sprite(`ground_${season}_${variant}`, 16, 16, ctx => {
    const [base, dark, light] = SEASON_GROUND[season];
    px(ctx, 0, 0, 16, 16, base);
    let h = hashString(season + variant);
    for (let i = 0; i < 9; i++) {
      h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
      const x = h % 15, y = (h >>> 8) % 15;
      px(ctx, x, y, 1, i % 3 === 0 ? 2 : 1, i % 2 ? dark : light);
    }
    if (variant === 3 && season !== 'winter') {
      px(ctx, 5, 9, 1, 1, PAL.linenHi);
      px(ctx, 11, 4, 1, 1, PAL.roseHi);
    }
  });
}

// ---------- item icons ----------

function drawShape(ctx, item) {
  const c = item.color;
  const dark = shade(c, -0.35);
  const light = shade(c, 0.4);
  switch (item.shape) {
    case 'fish': {
      px(ctx, 3, 6, 8, 4, c);
      px(ctx, 4, 5, 6, 1, c);
      px(ctx, 4, 10, 6, 1, dark);
      px(ctx, 4, 9, 6, 1, light);
      px(ctx, 2, 7, 1, 2, c);
      px(ctx, 11, 7, 1, 2, c);
      px(ctx, 12, 5, 2, 2, dark);
      px(ctx, 12, 9, 2, 2, dark);
      px(ctx, 12, 7, 1, 2, c);
      px(ctx, 6, 4, 3, 1, dark);
      px(ctx, 4, 7, 1, 1, PAL.inkDeep);
      break;
    }
    case 'round':
      disc(ctx, 8, 9.5, 5, c);
      disc(ctx, 6.5, 8, 1.6, light);
      px(ctx, 4, 13, 8, 1, dark);
      px(ctx, 8, 2, 1, 3, PAL.woodShade);
      px(ctx, 9, 3, 3, 2, PAL.leaf);
      break;
    case 'berry':
      disc(ctx, 5.5, 10, 3, c);
      disc(ctx, 10.5, 10, 3, c);
      disc(ctx, 8, 6.5, 3, c);
      px(ctx, 4, 9, 1, 1, light);
      px(ctx, 9, 9, 1, 1, light);
      px(ctx, 7, 5, 1, 1, light);
      px(ctx, 7, 2, 2, 2, PAL.leaf);
      break;
    case 'flower':
      px(ctx, 7, 8, 2, 7, PAL.leaf);
      px(ctx, 9, 11, 3, 2, PAL.leafHi);
      disc(ctx, 8, 3.5, 2.2, c);
      disc(ctx, 4.5, 6, 2.2, c);
      disc(ctx, 11.5, 6, 2.2, c);
      disc(ctx, 8, 8, 2.2, c);
      px(ctx, 7, 5, 2, 2, '#E8C25A');
      break;
    case 'pod':
      px(ctx, 3, 7, 10, 4, c);
      px(ctx, 4, 6, 8, 1, c);
      px(ctx, 4, 11, 8, 1, dark);
      for (let x = 4; x <= 10; x += 3) disc(ctx, x + 1, 8.5, 1.2, light);
      px(ctx, 13, 5, 1, 3, PAL.leafShade);
      break;
    case 'root':
      for (let y = 5; y < 15; y++) {
        const w = Math.max(1, 7 - Math.floor((y - 5) * 0.7));
        px(ctx, 8 - Math.floor(w / 2), y, w, 1, y % 3 ? c : dark);
      }
      px(ctx, 6, 1, 1, 4, PAL.leaf);
      px(ctx, 8, 0, 1, 5, PAL.leafHi);
      px(ctx, 10, 1, 1, 4, PAL.leaf);
      break;
    case 'leaf':
      for (let y = 2; y < 14; y++) {
        const w = Math.round(Math.sin(((y - 2) / 12) * Math.PI) * 10);
        px(ctx, 8 - Math.floor(w / 2), y, w, 1, c);
      }
      px(ctx, 8, 3, 1, 12, dark);
      px(ctx, 5, 6, 3, 1, light);
      break;
    case 'mushroom':
      for (let y = 3; y < 9; y++) {
        const w = 6 + (y - 3) * 2;
        px(ctx, 8 - w / 2, y, Math.min(w, 14), 1, y < 5 ? light : c);
      }
      px(ctx, 2, 8, 12, 1, dark);
      px(ctx, 6, 9, 4, 5, PAL.linen);
      px(ctx, 6, 13, 4, 1, PAL.linenShade);
      px(ctx, 5, 5, 1, 1, PAL.linenHi);
      px(ctx, 10, 6, 1, 1, PAL.linenHi);
      break;
    case 'cone':
      disc(ctx, 8, 8.5, 5, c);
      for (let y = 5; y < 14; y += 2) px(ctx, 4 + ((y >> 1) % 2), y, 8, 1, dark);
      px(ctx, 7, 2, 2, 2, PAL.woodShade);
      break;
    case 'crystal':
      px(ctx, 6, 2, 4, 12, c);
      px(ctx, 5, 4, 6, 8, c);
      px(ctx, 7, 1, 2, 1, light);
      px(ctx, 6, 3, 1, 8, PAL.linenHi);
      px(ctx, 10, 4, 1, 8, dark);
      px(ctx, 6, 14, 4, 1, dark);
      break;
    case 'stone':
      disc(ctx, 8, 9, 5.5, c);
      disc(ctx, 6.5, 7.5, 2.5, shade(c, 0.25));
      px(ctx, 4, 13, 8, 1, dark);
      break;
    case 'ore':
      disc(ctx, 8, 9, 5.5, PAL.stone);
      px(ctx, 4, 13, 8, 1, PAL.stoneShade);
      for (const [x, y] of [[5, 6], [9, 7], [7, 10], [10, 11], [4, 9]]) px(ctx, x, y, 2, 2, c);
      px(ctx, 9, 7, 1, 1, light);
      break;
    case 'gem':
      for (let y = 3; y < 13; y++) {
        const w = y < 6 ? 6 + (y - 3) * 2 : Math.max(2, 12 - (y - 6) * 2);
        px(ctx, 8 - w / 2, y, w, 1, y < 6 ? light : y < 9 ? c : dark);
      }
      px(ctx, 6, 4, 1, 1, PAL.linenHi);
      break;
    case 'geode':
      disc(ctx, 8, 9, 5.5, '#857B70');
      disc(ctx, 8, 9, 3, '#5E5650');
      px(ctx, 7, 8, 2, 2, '#B7A6D9');
      px(ctx, 4, 13, 8, 1, '#5E5650');
      break;
    case 'fossil':
      if (item.id === 'amber_beetle') {
        disc(ctx, 8, 8.5, 5.5, c);
        disc(ctx, 6, 6.5, 1.8, light);
        px(ctx, 7, 7, 3, 4, '#3A2A1E');
        px(ctx, 6, 8, 1, 1, '#3A2A1E');
        px(ctx, 10, 8, 1, 1, '#3A2A1E');
      } else {
        disc(ctx, 8, 9, 5.5, c);
        px(ctx, 7, 7, 3, 1, dark);
        px(ctx, 6, 8, 1, 3, dark);
        px(ctx, 7, 11, 4, 1, dark);
        px(ctx, 10, 9, 1, 2, dark);
        px(ctx, 8, 9, 1, 1, dark);
      }
      break;
    case 'seed':
      px(ctx, 3, 2, 10, 12, PAL.linen);
      px(ctx, 3, 2, 10, 2, PAL.linenShade);
      px(ctx, 3, 13, 10, 1, PAL.woodShade);
      px(ctx, 2, 3, 1, 10, PAL.woodShade);
      px(ctx, 13, 3, 1, 10, PAL.woodShade);
      disc(ctx, 8, 8.5, 3, c);
      px(ctx, 7, 7, 1, 1, light);
      break;
    case 'boot':
      px(ctx, 5, 2, 5, 9, c);
      px(ctx, 5, 10, 9, 4, c);
      px(ctx, 5, 13, 9, 1, dark);
      px(ctx, 6, 3, 1, 6, light);
      break;
    case 'bottle':
      px(ctx, 7, 1, 2, 3, PAL.wood);
      px(ctx, 6, 4, 4, 2, c);
      px(ctx, 4, 6, 8, 8, c);
      px(ctx, 5, 8, 6, 3, PAL.linen);
      px(ctx, 5, 7, 1, 6, PAL.linenHi);
      break;
    case 'button':
      disc(ctx, 8, 8, 5.5, c);
      px(ctx, 6, 6, 1, 1, dark);
      px(ctx, 9, 6, 1, 1, dark);
      px(ctx, 6, 9, 1, 1, dark);
      px(ctx, 9, 9, 1, 1, dark);
      break;
    case 'dish':
      px(ctx, 2, 9, 12, 4, PAL.linenHi);
      px(ctx, 3, 13, 10, 1, PAL.linenShade);
      disc(ctx, 8, 8.5, 5, c);
      px(ctx, 3, 8, 10, 2, c);
      px(ctx, 6, 6, 2, 1, light);
      px(ctx, 2, 9, 12, 1, PAL.linenShade);
      break;
    default:
      disc(ctx, 8, 8, 5, c);
  }
}

export function itemIcon(id) {
  const item = ITEMS[id];
  return sprite('item_' + id, 16, 16, ctx => drawShape(ctx, item));
}

const iconUrls = new Map();
export function iconURL(id) {
  if (!iconUrls.has(id)) {
    const src = itemIcon(id);
    if (src instanceof HTMLImageElement) iconUrls.set(id, src.src);
    else {
      const c = makeCanvas(16, 16);
      c.getContext('2d').drawImage(src, 0, 0);
      iconUrls.set(id, c.toDataURL());
    }
  }
  return iconUrls.get(id);
}

export function clearIconURLs() {
  iconUrls.clear();
}

// ---------- jar objects ----------

export function tentSprite() {
  return sprite('tent', 48, 40, ctx => {
    for (let y = 4; y < 36; y++) {
      const half = Math.floor((y - 4) * 0.72) + 2;
      for (let x = 24 - half; x < 24 + half; x++) {
        const stripe = Math.floor((x - 24 + 40) / 6) % 2;
        px(ctx, x, y, 1, 1, stripe ? PAL.rose : PAL.roseHi);
      }
    }
    for (let y = 4; y < 36; y++) px(ctx, 24 - Math.floor((y - 4) * 0.72) - 2, y, 1, 1, PAL.roseShade);
    for (let y = 18; y < 36; y++) {
      const half = Math.floor((y - 18) * 0.5) + 1;
      px(ctx, 24 - half, y, half * 2, 1, '#4A3A34');
    }
    px(ctx, 23, 0, 2, 6, PAL.woodShade);
    px(ctx, 25, 1, 5, 3, PAL.leafHi);
    px(ctx, 0, 36, 48, 2, PAL.roseShade);
    px(ctx, 32, 26, 4, 5, '#E9C86A');
    px(ctx, 33, 27, 2, 3, PAL.linenHi);
  });
}

export function mailboxSprite(hasMail) {
  return sprite('mailbox_' + (hasMail ? 'full' : 'empty'), 16, 26, ctx => {
    px(ctx, 7, 12, 2, 14, PAL.woodShade);
    px(ctx, 2, 4, 12, 9, PAL.rose);
    px(ctx, 2, 3, 12, 2, PAL.roseHi);
    px(ctx, 2, 12, 12, 1, PAL.roseShade);
    px(ctx, 3, 7, 7, 1, PAL.roseShade);
    if (hasMail) {
      px(ctx, 13, 0, 1, 8, PAL.woodShade);
      px(ctx, 14, 0, 2, 3, '#D9533C');
      px(ctx, 4, 8, 6, 3, PAL.linenHi);
    } else {
      px(ctx, 13, 6, 3, 1, '#D9533C');
    }
  });
}

export function crateSprite(full) {
  return sprite('crate_' + (full ? 'full' : 'empty'), 16, 18, ctx => {
    if (full) {
      disc(ctx, 5, 4, 2.5, '#C9483A');
      disc(ctx, 10, 4, 2.5, PAL.water);
      disc(ctx, 8, 3, 2, '#E8B83A');
    }
    px(ctx, 1, 5, 14, 12, PAL.wood);
    for (const y of [5, 9, 13]) px(ctx, 1, y, 14, 1, PAL.woodShade);
    px(ctx, 1, 5, 1, 12, PAL.woodShade);
    px(ctx, 14, 5, 1, 12, PAL.woodShade);
    px(ctx, 2, 6, 12, 1, PAL.woodHi);
    px(ctx, 1, 17, 14, 1, PAL.inkDeep);
  });
}

export function workbenchSprite() {
  return sprite('workbench', 16, 20, ctx => {
    px(ctx, 0, 7, 16, 4, PAL.wood);
    px(ctx, 0, 7, 16, 1, PAL.woodHi);
    px(ctx, 1, 11, 2, 9, PAL.woodShade);
    px(ctx, 13, 11, 2, 9, PAL.woodShade);
    px(ctx, 3, 16, 10, 1, PAL.woodShade);
    px(ctx, 3, 3, 1, 4, PAL.woodShade);
    px(ctx, 2, 2, 4, 2, PAL.stone);
    px(ctx, 10, 4, 5, 3, PAL.stoneHi);
    px(ctx, 11, 5, 3, 1, PAL.stoneShade);
  });
}

export function stallSprite() {
  return sprite('stall', 32, 34, ctx => {
    px(ctx, 2, 6, 2, 26, PAL.woodShade);
    px(ctx, 28, 6, 2, 26, PAL.woodShade);
    for (let x = 0; x < 32; x++) px(ctx, x, 2, 1, 7, Math.floor(x / 4) % 2 ? PAL.linen : PAL.rose);
    for (let x = 0; x < 32; x += 4) px(ctx, x, 9, 4, 1, Math.floor(x / 4) % 2 ? PAL.linenShade : PAL.roseShade);
    // the beetle shopkeeper
    disc(ctx, 16, 17, 4.5, '#3F4A5E');
    px(ctx, 16, 13, 1, 9, '#2A3242');
    px(ctx, 13, 15, 1, 1, PAL.linenHi);
    px(ctx, 18, 15, 1, 1, PAL.linenHi);
    px(ctx, 13, 10, 1, 3, '#2A3242');
    px(ctx, 19, 10, 1, 3, '#2A3242');
    px(ctx, 1, 21, 30, 9, PAL.wood);
    px(ctx, 1, 21, 30, 1, PAL.woodHi);
    px(ctx, 1, 29, 30, 1, PAL.woodShade);
    disc(ctx, 7, 20, 2, '#D9533C');
    disc(ctx, 24, 20, 2, '#E8B83A');
    px(ctx, 11, 18, 3, 3, PAL.linen);
  });
}

export function treeSprite(season, hasFruit) {
  return sprite(`tree_${season}_${hasFruit ? 1 : 0}`, 40, 52, ctx => {
    px(ctx, 17, 30, 6, 22, PAL.woodShade);
    px(ctx, 18, 30, 2, 22, PAL.wood);
    if (season === 'winter') {
      px(ctx, 10, 18, 2, 14, PAL.woodShade);
      px(ctx, 28, 16, 2, 16, PAL.woodShade);
      px(ctx, 12, 28, 6, 2, PAL.woodShade);
      px(ctx, 22, 26, 6, 2, PAL.woodShade);
      disc(ctx, 20, 18, 10, '#6B8A6A');
      disc(ctx, 20, 15, 8, '#F2F6F6');
      disc(ctx, 11, 18, 3, '#F2F6F6');
      disc(ctx, 29, 16, 3, '#F2F6F6');
    } else {
      const [base, dark, light] = season === 'autumn'
        ? ['#C98A44', '#9A5E30', '#E3B266']
        : [PAL.leaf, PAL.leafShade, PAL.leafHi];
      disc(ctx, 20, 21, 15, dark);
      disc(ctx, 20, 19, 14, base);
      disc(ctx, 13, 15, 7, light);
      disc(ctx, 26, 13, 5, light);
      if (season === 'spring') {
        for (const [x, y] of [[9, 18], [24, 9], [30, 22], [15, 27], [21, 20]]) px(ctx, x, y, 2, 2, PAL.roseHi);
      }
    }
    if (hasFruit) {
      const color = { spring: '#C93A4A', summer: '#F0A27A', autumn: '#C9483A', winter: '#EE9A3A' }[season];
      for (const [x, y] of [[11, 22], [27, 19], [19, 27], [23, 12]]) {
        disc(ctx, x, y, 2, color);
        px(ctx, x - 1, y - 1, 1, 1, PAL.linenHi);
      }
    }
  });
}

export function benchSprite() {
  return sprite('bench', 32, 18, ctx => {
    px(ctx, 1, 2, 30, 3, PAL.wood);
    px(ctx, 1, 2, 30, 1, PAL.woodHi);
    px(ctx, 0, 9, 32, 3, PAL.wood);
    px(ctx, 0, 9, 32, 1, PAL.woodHi);
    px(ctx, 0, 11, 32, 1, PAL.woodShade);
    px(ctx, 3, 5, 2, 13, PAL.woodShade);
    px(ctx, 27, 5, 2, 13, PAL.woodShade);
    px(ctx, 18, 6, 9, 3, PAL.rose);
    px(ctx, 18, 6, 9, 1, PAL.roseHi);
  });
}

export function caveSprite() {
  return sprite('cave', 16, 16, ctx => {
    disc(ctx, 8, 8.5, 7.5, PAL.stoneShade);
    disc(ctx, 8, 9, 5.5, '#2A2420');
    px(ctx, 5, 4, 1, 10, PAL.woodHi);
    px(ctx, 10, 4, 1, 10, PAL.woodHi);
    for (let y = 5; y < 14; y += 3) px(ctx, 5, y, 6, 1, PAL.wood);
    px(ctx, 2, 4, 3, 2, PAL.stoneHi);
    px(ctx, 12, 12, 2, 2, PAL.stoneHi);
  });
}

export function bedSprite(wet) {
  return sprite('bed_' + (wet ? 'wet' : 'dry'), 16, 16, ctx => {
    px(ctx, 1, 1, 14, 14, PAL.woodShade);
    px(ctx, 2, 2, 12, 12, wet ? PAL.soilWet : PAL.soil);
    for (const y of [4, 8, 12]) px(ctx, 3, y, 10, 1, wet ? '#4A3426' : '#6A4C34');
    px(ctx, 1, 1, 14, 1, PAL.wood);
  });
}

export function cropSprite(cropId, stage) {
  return sprite(`crop_${cropId}_${stage}`, 16, 20, ctx => {
    const crop = CROP_BY_ID[cropId];
    if (stage === 0) {
      px(ctx, 5, 14, 2, 1, PAL.linenShade);
      px(ctx, 9, 13, 2, 1, PAL.linenShade);
      return;
    }
    if (stage === 1) {
      px(ctx, 7, 11, 2, 5, PAL.leaf);
      px(ctx, 5, 10, 2, 2, PAL.leafHi);
      px(ctx, 9, 10, 2, 2, PAL.leafHi);
      return;
    }
    px(ctx, 7, 6, 2, 10, PAL.leafShade);
    px(ctx, 3, 9, 4, 3, PAL.leaf);
    px(ctx, 9, 7, 4, 3, PAL.leaf);
    px(ctx, 4, 12, 3, 2, PAL.leafHi);
    px(ctx, 9, 11, 4, 2, PAL.leafHi);
    if (stage === 3) {
      const c = crop.color;
      if (crop.shape === 'flower') {
        disc(ctx, 8, 4, 3.2, c);
        px(ctx, 7, 3, 2, 2, '#E8C25A');
      } else if (crop.shape === 'root') {
        px(ctx, 6, 13, 4, 3, c);
        px(ctx, 5, 3, 1, 4, PAL.leafHi);
        px(ctx, 10, 3, 1, 4, PAL.leafHi);
      } else {
        disc(ctx, 5, 8, 2.2, c);
        disc(ctx, 11, 6, 2.2, c);
        if (crop.shape !== 'round') disc(ctx, 9, 11, 1.8, c);
        px(ctx, 4, 7, 1, 1, PAL.linenHi);
        px(ctx, 10, 5, 1, 1, PAL.linenHi);
      }
    }
  });
}

const ROCK_LOOK = {
  stone: null, copper: '#D0844A', iron: '#E3DED5', gold: '#EBC54A', quartz: '#F4F2EE', amethyst: '#9C6FC0',
  topaz: '#E8B04A', crystal: '#A9E0E8', emerald: '#3FA86A', ruby: '#C92F4A', diamond: '#F2FAFF', geode: 'geode', fossil: 'fossil',
};

export function rockSprite(kind, band) {
  return sprite(`rock_${kind}_${band}`, 16, 16, ctx => {
    const base = [PAL.stone, '#8A8378', '#7D8796'][band];
    const fill = kind === 'fossil' ? '#CDBF9F' : kind === 'geode' ? '#857B70' : base;
    disc(ctx, 8, 9, 7, shade(fill, -0.35));
    disc(ctx, 8, 8.5, 6.5, fill);
    disc(ctx, 6, 6, 3, shade(fill, 0.25));
    px(ctx, 2, 14, 12, 1, PAL.inkDeep);
    const look = ROCK_LOOK[kind];
    if (look === 'fossil') {
      px(ctx, 6, 8, 4, 1, '#8F7F62');
      px(ctx, 6, 9, 1, 2, '#8F7F62');
      px(ctx, 7, 11, 4, 1, '#8F7F62');
    } else if (look === 'geode') {
      px(ctx, 7, 7, 2, 4, '#5E5650');
      px(ctx, 8, 8, 1, 2, '#B7A6D9');
    } else if (look && ['copper', 'iron', 'gold'].includes(kind)) {
      for (const [x, y] of [[4, 8], [9, 6], [7, 11], [11, 10]]) px(ctx, x, y, 2, 2, look);
    } else if (look) {
      px(ctx, 7, 3, 3, 6, look);
      px(ctx, 6, 5, 5, 3, look);
      px(ctx, 7, 4, 1, 3, PAL.linenHi);
      px(ctx, 10, 9, 2, 3, look);
    }
  });
}

export function ladderHoleSprite() {
  return sprite('mine_ladder_down', 16, 16, ctx => {
    disc(ctx, 8, 8.5, 7, '#1E1A18');
    px(ctx, 5, 3, 1, 12, PAL.woodHi);
    px(ctx, 10, 3, 1, 12, PAL.woodHi);
    for (let y = 4; y < 15; y += 3) px(ctx, 5, y, 6, 1, PAL.wood);
  });
}

export function ladderUpSprite() {
  return sprite('mine_ladder_up', 16, 24, ctx => {
    px(ctx, 4, 0, 2, 24, PAL.woodShade);
    px(ctx, 10, 0, 2, 24, PAL.woodShade);
    for (let y = 2; y < 24; y += 4) px(ctx, 4, y, 8, 2, PAL.wood);
    px(ctx, 0, 20, 16, 4, 'rgba(255,240,200,0.25)');
  });
}

export function bunnySprite(frame, sleeping) {
  return sprite(`bunny_${frame}_${sleeping ? 1 : 0}`, 14, 12, ctx => {
    const lift = frame === 1 ? 1 : 0;
    const fur = '#F2EDE4', shadeFur = '#D5CCBE';
    disc(ctx, 7, 8 - lift, 4.5, fur);
    px(ctx, 3, 10 - lift, 8, 1, shadeFur);
    disc(ctx, 10, 5 - lift, 2.8, fur);
    if (sleeping) {
      px(ctx, 9, 1, 2, 3, fur);
      px(ctx, 10, 5, 2, 1, PAL.ink);
    } else {
      px(ctx, 9, 0 - lift, 1, 4, fur);
      px(ctx, 11, 0 - lift, 1, 4, fur);
      px(ctx, 11, 1 - lift, 1, 2, PAL.roseHi);
      px(ctx, 11, 5 - lift, 1, 1, PAL.inkDeep);
    }
    px(ctx, 12, 6 - lift, 1, 1, PAL.rose);
    disc(ctx, 2.5, 7 - lift, 1.5, '#FFFFFF');
  });
}

export function heartSprite() {
  return sprite('fx_heart', 7, 6, ctx => {
    px(ctx, 1, 0, 2, 1, PAL.rose);
    px(ctx, 4, 0, 2, 1, PAL.rose);
    px(ctx, 0, 1, 7, 2, PAL.rose);
    px(ctx, 1, 3, 5, 1, PAL.rose);
    px(ctx, 2, 4, 3, 1, PAL.rose);
    px(ctx, 3, 5, 1, 1, PAL.rose);
    px(ctx, 1, 1, 1, 1, PAL.roseHi);
  });
}
