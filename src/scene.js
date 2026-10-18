// Draws the jar, its world and the mine onto the game canvas.
import { COLS, ROWS, TILE, OBJECTS, BEDS } from './world.js';
import { bedStage, bandOf, MINE_ENTRY } from './rules.js';
import {
  PAL, px, disc, shade, grassTile, itemIcon, tentSprite, mailboxSprite, crateSprite, workbenchSprite,
  stallSprite, treeSprite, benchSprite, caveSprite, bedSprite, cropSprite, rockSprite, ladderHoleSprite,
  ladderUpSprite, bunnySprite, heartSprite,
} from './sprites.js';
import { avatarSprite, DIRS } from './avatar.js';
import { hashString } from './rng.js';

export const W = 320;
export const H = 352;
export const GX = 24;
export const GY = 100;
export const SOIL_TOP = GY + ROWS * TILE;
const JAR = { x: 12, y: 40, w: 296, h: 300, r: 24 };

export function tileCenter(c, r) {
  return { x: GX + c * TILE + TILE / 2, y: GY + r * TILE + TILE / 2 };
}

export function pointToTile(x, y) {
  return { c: Math.floor((x - GX) / TILE), r: Math.floor((y - GY) / TILE) };
}

function jarPath(ctx) {
  const { x, y, w, h, r } = JAR;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const SKY = { morning: '#E6E4CC', day: '#D9E8E1', evening: '#EBCDB4', night: '#36425C' };

export function drawScene(ctx, g) {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  jarPath(ctx);
  ctx.clip();
  if (g.scene === 'mine') drawMine(ctx, g);
  else drawJarWorld(ctx, g);
  drawEffects(ctx, g);
  ctx.restore();
  drawGlass(ctx, g);
  if (g.fishing) drawFishingUi(ctx, g);
}

// ---------- the forest jar ----------

function drawJarWorld(ctx, g) {
  const { season } = g;
  px(ctx, 0, 0, W, H, g.weather === 'fog' ? shade(SKY[g.part], 0.3) : SKY[g.part]);
  drawBackdrop(ctx, g);

  // Grass, including the strips beside the tile grid.
  const [base, dark] = [grassTile(season, 0), grassTile(season, 1)];
  for (let x = 0; x < W; x += TILE) {
    for (let y = GY - 8; y < SOIL_TOP; y += TILE) ctx.drawImage((x + y) % 32 ? base : dark, x, y);
  }
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const v = hashString(c + ':' + r) % 4;
      ctx.drawImage(grassTile(season, v), GX + c * TILE, GY + r * TILE);
    }
  }
  px(ctx, 0, GY - 9, W, 2, shade(SEASON_EDGE[season], -0.2));

  drawPond(ctx, g);
  const cave = OBJECTS.find(o => o.id === 'cave');
  ctx.drawImage(caveSprite(), GX + cave.c * TILE, GY + cave.r * TILE);
  BEDS.forEach((b, i) => ctx.drawImage(bedSprite(g.state.garden[i].last === g.today), GX + b.c * TILE, GY + b.r * TILE));

  // Forage on the ground, with a small glint.
  g.state.daily.forage.forEach((f, i) => {
    if (g.state.daily.picked.includes(i)) return;
    const p = tileCenter(f.c, f.r);
    ctx.drawImage(itemIcon(f.id), p.x - 8, p.y - 10);
    if (Math.floor(g.t * 2 + i) % 3 === 0) px(ctx, p.x + 4, p.y - 10, 1, 1, PAL.linenHi);
  });

  // Everything that stands up is sorted by where it touches the ground.
  const items = [];
  const at = (o, img, dx = 0, dy = 0) => {
    const x = GX + (o.c + o.w / 2) * TILE - img.width / 2 + dx;
    const y = GY + (o.r + o.h) * TILE - img.height + dy;
    items.push({ y: GY + (o.r + o.h) * TILE, draw: () => ctx.drawImage(img, x, y) });
  };
  for (const o of OBJECTS) {
    if (o.id === 'tent') at(o, tentSprite(), 0, 2);
    if (o.id === 'mailbox') at(o, mailboxSprite(g.unreadMail), 0, -2);
    if (o.id === 'crate') at(o, crateSprite(g.state.crate.length > 0), 0, -1);
    if (o.id === 'workbench') at(o, workbenchSprite(), 0, -2);
    if (o.id === 'stall') at(o, stallSprite(), 0, 2);
    if (o.id === 'tree') at(o, treeSprite(g.season, !g.state.daily.shook), 0, -2);
    if (o.id === 'bench') at(o, benchSprite(), 0, -1);
  }
  BEDS.forEach((b, i) => {
    const bed = g.state.garden[i];
    const stage = bedStage(bed, g.today);
    if (stage < 0) return;
    const img = cropSprite(bed.crop, stage);
    items.push({ y: GY + (b.r + 1) * TILE - 1, draw: () => ctx.drawImage(img, GX + b.c * TILE, GY + b.r * TILE - 6) });
    if (stage === 3 && Math.floor(g.t * 1.5 + i) % 4 === 0) {
      items.push({ y: 999, draw: () => px(ctx, GX + b.c * TILE + 12, GY + b.r * TILE - 6, 2, 2, PAL.linenHi) });
    }
  });
  if (g.bunny) {
    const b = g.bunny;
    const img = bunnySprite(b.frame, g.night);
    items.push({
      y: b.y,
      draw: () => {
        ctx.save();
        if (b.flip) {
          ctx.translate(Math.round(b.x), 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -7, Math.round(b.y) - 11);
        } else ctx.drawImage(img, Math.round(b.x) - 7, Math.round(b.y) - 11);
        ctx.restore();
      },
    });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  if (g.fishing) drawLine(ctx, g);

  drawSoil(ctx, g);
  drawWeather(ctx, g);
  if (g.night) drawNight(ctx, g);
}

const SEASON_EDGE = { spring: PAL.grass, summer: '#9DB86E', autumn: '#C2B070', winter: '#E6EDEE' };

function drawBackdrop(ctx, g) {
  // Small pines and hills behind the meadow, inside the glass.
  const winter = g.season === 'winter';
  const far = winter ? '#B9C7C9' : g.season === 'autumn' ? '#A88F5E' : '#8EA889';
  const near = winter ? '#8FA3A4' : g.season === 'autumn' ? '#8A6F45' : PAL.leaf;
  for (let x = 6; x < W; x += 22) disc(ctx, x, GY - 2, 16, far);
  for (let i = 0; i < 14; i++) {
    const x = 18 + i * 21 + (hashString('pine' + i) % 9);
    const h = 18 + (hashString('h' + i) % 14);
    for (let y = 0; y < h; y++) {
      const w = Math.floor((y / h) * 12) + 1;
      px(ctx, x - w / 2, GY - 10 - h + y, w, 1, y % 4 === 3 ? shade(near, -0.2) : near);
    }
    if (winter) px(ctx, x - 2, GY - 10 - h + 2, 4, 2, PAL.linenHi);
  }
}

function drawPond(ctx, g) {
  const pond = OBJECTS.find(o => o.id === 'pond');
  const x = GX + pond.c * TILE, y = GY + pond.r * TILE, w = pond.w * TILE, h = pond.h * TILE;
  const frozen = g.season === 'winter';
  const water = frozen ? '#A9C9CE' : PAL.water;
  roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 14, shade(SEASON_EDGE[g.season], -0.25));
  roundRect(ctx, x, y, w, h, 12, '#CDBB8E');
  roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 10, water);
  roundRect(ctx, x + 3, y + h - 10, w - 6, 7, 4, frozen ? '#93B8BE' : PAL.waterShade);
  // ripples
  for (let i = 0; i < 5; i++) {
    const rx = x + 10 + ((i * 23 + Math.floor(g.t * 6)) % (w - 26));
    const ry = y + 10 + ((i * 17) % (h - 24));
    px(ctx, rx, ry, 6, 1, frozen ? PAL.linenHi : PAL.waterHi);
  }
  // lily pads and the marimo moss ball
  if (!frozen) {
    for (const [lx, ly] of [[x + 12, y + 14], [x + 54, y + 40]]) {
      disc(ctx, lx, ly, 4, PAL.leaf);
      px(ctx, lx, ly - 4, 1, 4, PAL.water);
      if (g.season === 'summer') disc(ctx, lx + 2, ly - 1, 1.5, PAL.roseHi);
    }
  }
  const mx = x + 40 + Math.sin(g.t * 0.6) * 6, my = y + 30;
  disc(ctx, mx, my, 4, frozen ? shade('#4F7A44', 0.2) : '#4F7A44');
  px(ctx, mx - 2, my - 2, 2, 1, '#79A35F');
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawPlayer(ctx, g) {
  const p = g.player;
  const look = g.state.avatar;
  const x = Math.round(p.x) - 8, y = Math.round(p.y) - 22;
  ctx.fillStyle = 'rgba(41,55,47,0.25)';
  ctx.fillRect(x + 3, Math.round(p.y) + 1, 10, 2);
  ctx.drawImage(avatarSprite(look, p.dir, p.frame, p.pose), x, y);
  // Tools in hand
  if (p.pose === 'swing') {
    const up = p.frame === 0;
    const hx = p.dir === DIRS.left ? x + 1 : x + 13;
    px(ctx, hx, y + (up ? 6 : 12), 1, 7, PAL.woodShade);
    px(ctx, hx - 3, y + (up ? 5 : 18), 7, 2, PAL.stoneHi);
  }
}

function rodTip(g) {
  const p = g.player;
  const dx = p.dir === DIRS.left ? -12 : p.dir === DIRS.right ? 12 : 6;
  const dy = p.dir === DIRS.up ? -26 : -20;
  return { x: p.x + dx, y: p.y + dy };
}

function drawLine(ctx, g) {
  const f = g.fishing;
  const tip = rodTip(g);
  const p = g.player;
  const hand = { x: p.x + (p.dir === DIRS.left ? -4 : 4), y: p.y - 10 };
  ctx.strokeStyle = PAL.woodShade;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  if (f.phase === 'cast' && f.t < 0.35) return;
  const b = f.bobber;
  const dip = f.phase === 'bite' ? Math.sin(g.t * 30) * 1.5 + 1 : Math.sin(g.t * 3) * 0.5;
  ctx.strokeStyle = 'rgba(243,233,207,0.85)';
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.quadraticCurveTo((tip.x + b.x) / 2, Math.max(tip.y, b.y) + 6, b.x, b.y + dip);
  ctx.stroke();
  px(ctx, b.x - 1, b.y - 2 + dip, 3, 2, '#D9533C');
  px(ctx, b.x - 1, b.y + dip, 3, 1, PAL.linenHi);
  if (f.phase === 'bite') {
    const ring = (g.t * 8) % 6;
    ctx.strokeStyle = PAL.waterHi;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 2, 3 + ring, 1 + ring / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSoil(ctx, g) {
  const bands = [['#8A6A4A', 22], ['#7F7A70', 26], ['#5E6A7A', 40]];
  let y = SOIL_TOP;
  px(ctx, 0, y, W, 3, PAL.leafShade);
  y += 3;
  bands.forEach(([color, h], i) => {
    px(ctx, 0, y, W, h, color);
    for (let k = 0; k < 26; k++) {
      const hx = hashString('soil' + i + ':' + k);
      px(ctx, hx % W, y + ((hx >>> 9) % (h - 2)), 2, 1, shade(color, k % 2 ? -0.18 : 0.15));
    }
    if (i === 2) {
      for (let k = 0; k < 7; k++) {
        const hx = hashString('gem' + k);
        const gx = 30 + (hx % 260), gy = y + 8 + ((hx >>> 8) % (h - 14));
        const on = Math.floor(g.t * 2 + k) % 4 !== 0;
        px(ctx, gx, gy, 2, 2, on ? '#A9E0E8' : '#7FB3C0');
      }
    }
    y += h;
  });
  // The mine shaft below the cave, as deep as you've dug.
  const cave = OBJECTS.find(o => o.id === 'cave');
  const sx = GX + cave.c * TILE + 4;
  const depth = Math.round((g.state.mine.deepest / 30) * (bands.reduce((s, b) => s + b[1], 0) - 4));
  if (depth > 0) {
    px(ctx, sx, SOIL_TOP, 8, depth + 3, '#2A2420');
    px(ctx, sx + 1, SOIL_TOP, 1, depth + 3, PAL.woodShade);
    px(ctx, sx + 6, SOIL_TOP, 1, depth + 3, PAL.woodShade);
    for (let k = 4; k < depth; k += 4) px(ctx, sx + 1, SOIL_TOP + k, 6, 1, PAL.wood);
  }
}

function drawWeather(ctx, g) {
  const w = g.weather;
  if (w === 'rain' || w === 'snow') {
    // a little cloud under the lid
    for (const [cx, cy, r] of [[130, 56, 10], [146, 52, 12], [164, 55, 11], [180, 58, 8], [112, 60, 7]]) {
      disc(ctx, cx, cy, r, w === 'rain' ? '#AEB6B8' : '#E3E8EA');
    }
    const n = w === 'rain' ? 46 : 34;
    for (let i = 0; i < n; i++) {
      const hx = hashString('drop' + i);
      const speed = w === 'rain' ? 140 : 18;
      const floor = GY + (hx % (ROWS * TILE));
      const span = floor - 50;
      const yy = 50 + ((g.t * speed + (hx >>> 7) % span) % span);
      const xx = 20 + ((hx >>> 3) % 280) + (w === 'snow' ? Math.sin(g.t + i) * 4 : 0);
      if (w === 'rain') px(ctx, xx, yy, 1, 4, 'rgba(183,212,189,0.8)');
      else px(ctx, xx, yy, 2, 2, 'rgba(255,255,255,0.9)');
    }
  }
  if (w === 'fog') {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(243,240,232,0.22)';
      ctx.fillRect(((g.t * (6 + i * 3)) % 400) - 120, 110 + i * 34, 220, 14);
    }
  }
}

function drawNight(ctx, g) {
  ctx.fillStyle = 'rgba(22,30,58,0.48)';
  ctx.fillRect(0, 0, W, H);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, a) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(255,214,140,${a})`);
    grad.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(160, 46, 70, 0.28);
  const tent = OBJECTS.find(o => o.id === 'tent');
  glow(GX + (tent.c + 2.2) * TILE, GY + tent.r * TILE + 20, 26, 0.35);
  if (g.season === 'summer' || g.season === 'spring') {
    for (let i = 0; i < 9; i++) {
      const fx = 40 + ((i * 37 + Math.sin(g.t * 0.7 + i) * 18) % 250);
      const fy = GY + 20 + ((i * 29 + Math.cos(g.t * 0.5 + i * 2) * 14) % 130);
      if (Math.floor(g.t * 3 + i) % 3) glow(fx, fy, 4, 0.9);
    }
  }
  ctx.restore();
}

// ---------- the mine ----------

const BAND_COLORS = [
  { wall: '#5A4332', floor: '#7A5A3E', speck: '#8E6C4C' },
  { wall: '#4E4A45', floor: '#6E6A62', speck: '#827D73' },
  { wall: '#33394A', floor: '#4B5468', speck: '#5D6880' },
];

function drawMine(ctx, g) {
  const band = bandOf(g.layer);
  const col = BAND_COLORS[band];
  px(ctx, 0, 0, W, H, col.wall);
  // ceiling with hanging rock
  for (let i = 0; i < 16; i++) {
    const hx = hashString('stal' + g.layer + ':' + i);
    const x = i * 20 + (hx % 8), len = 10 + (hx >>> 6) % 22;
    for (let y = 0; y < len; y++) px(ctx, x + y / 4, GY - 46 + y, Math.max(1, 6 - y / 4), 1, shade(col.wall, -0.15));
  }
  px(ctx, 0, GY - 6, W, ROWS * TILE + 12, col.floor);
  for (let k = 0; k < 120; k++) {
    const hx = hashString('floor' + g.layer + ':' + k);
    px(ctx, hx % W, GY - 6 + ((hx >>> 9) % (ROWS * TILE + 12)), 2, 1, col.speck);
  }
  px(ctx, 0, SOIL_TOP + 6, W, H, shade(col.wall, -0.2));

  const items = [];
  const up = ladderUpSprite();
  const entry = tileCenter(MINE_ENTRY.c, MINE_ENTRY.r);
  ctx.drawImage(up, entry.x - 8, entry.y - 30);
  const broken = g.mineBroken;
  for (const rock of g.rocks) {
    const p = tileCenter(rock.c, rock.r);
    if (broken.has(rock.id)) {
      if (rock.ladder) ctx.drawImage(ladderHoleSprite(), p.x - 8, p.y - 8);
      continue;
    }
    const img = rockSprite(rock.kind, band);
    const hits = g.hits.get(rock.id) || 0;
    items.push({
      y: p.y + 6,
      draw: () => {
        const shake = g.shakeRock === rock.id ? Math.round(Math.sin(g.t * 60)) : 0;
        ctx.drawImage(img, p.x - 8 + shake, p.y - 9);
        if (hits) {
          px(ctx, p.x - 3, p.y - 5, 1, 4, PAL.inkDeep);
          px(ctx, p.x - 2, p.y - 2, 3, 1, PAL.inkDeep);
          if (hits > 1) px(ctx, p.x + 2, p.y - 6, 1, 5, PAL.inkDeep);
        }
      },
    });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());

  // Deeper bands are darker; the lantern lights around you.
  if (band > 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(g.player.x, g.player.y - 8, 20, g.player.x, g.player.y - 8, 150);
    grad.addColorStop(0, 'rgba(10,8,12,0)');
    grad.addColorStop(1, `rgba(10,8,12,${band === 1 ? 0.45 : 0.62})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
}

// ---------- effects, glass and fishing UI ----------

function drawEffects(ctx, g) {
  for (const e of g.effects) {
    const age = g.t - e.t0;
    const y = e.y - age * 18;
    if (e.kind === 'heart') ctx.drawImage(heartSprite(), Math.round(e.x) - 3, Math.round(y));
    if (e.kind === 'item') {
      ctx.globalAlpha = Math.max(0, 1 - age / 1.2);
      ctx.drawImage(itemIcon(e.id), Math.round(e.x) - 8, Math.round(y) - 8);
      ctx.globalAlpha = 1;
    }
  }
  const p = g.player;
  if (g.fishing?.phase === 'bite') bubble(ctx, p.x, p.y - 30, '!');
  if (g.player.thinking) bubble(ctx, p.x, p.y - 30, '…');
}

function bubble(ctx, x, y, text) {
  px(ctx, x - 5, y - 9, 11, 10, PAL.linenHi);
  px(ctx, x - 6, y - 8, 13, 8, PAL.linenHi);
  px(ctx, x - 1, y + 1, 3, 2, PAL.linenHi);
  ctx.fillStyle = text === '!' ? '#D9533C' : PAL.ink;
  if (text === '!') {
    px(ctx, x, y - 7, 2, 5, '#D9533C');
    px(ctx, x, y - 1, 2, 1, '#D9533C');
  } else {
    for (let i = 0; i < 3; i++) px(ctx, x - 3 + i * 3, y - 4, 2, 2, PAL.ink);
  }
}

function drawGlass(ctx, g) {
  const { x, y, w, h } = JAR;
  // shelf
  px(ctx, 0, y + h - 6, W, 18, PAL.wood);
  px(ctx, 0, y + h - 6, W, 2, PAL.woodHi);
  px(ctx, 0, y + h + 10, W, 2, PAL.woodShade);
  // glass outline and shine
  ctx.save();
  jarPath(ctx);
  ctx.strokeStyle = 'rgba(56,73,61,0.85)';
  ctx.lineWidth = 3;
  ctx.stroke();
  jarPath(ctx);
  ctx.strokeStyle = 'rgba(255,247,228,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(x + 8, y + 26, 4, h - 80);
  ctx.fillRect(x + 15, y + 34, 2, 46);
  ctx.fillRect(x + w - 14, y + 60, 3, 60);
  if (g.weather === 'rain' && g.scene === 'jar') {
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 18; i++) {
      const hx = hashString('fogdot' + i);
      ctx.fillRect(x + 6 + (hx % (w - 12)), y + 10 + ((hx >>> 8) % 60), 2, 2);
    }
  }
  // neck and lid
  px(ctx, 44, 32, 232, 10, 'rgba(220,232,228,0.55)');
  px(ctx, 44, 32, 232, 1, 'rgba(56,73,61,0.7)');
  px(ctx, 38, 14, 244, 20, PAL.wood);
  px(ctx, 38, 14, 244, 3, PAL.woodHi);
  px(ctx, 38, 31, 244, 3, PAL.woodShade);
  for (let i = 0; i < 12; i++) px(ctx, 46 + i * 20, 20, 8, 1, PAL.woodShade);
  px(ctx, 152, 8, 16, 7, PAL.woodShade);
  px(ctx, 154, 6, 12, 3, PAL.wood);
  if (g.night && g.scene === 'jar') {
    disc(ctx, 160, 46, 4, '#FFE7A8');
    px(ctx, 159, 41, 2, 3, PAL.woodShade);
  }
  if (g.season === 'winter') {
    for (let i = 0; i < 10; i++) disc(ctx, 46 + i * 24, 14, 5 + (i % 3), '#F7FAFA');
  }
}

function drawFishingUi(ctx, g) {
  const f = g.fishing;
  if (f.phase !== 'reel') return;
  const m = f.game;
  const x = 276, y = 92, w = 22, h = 160;
  px(ctx, x - 3, y - 3, w + 6, h + 6, PAL.woodShade);
  px(ctx, x - 2, y - 2, w + 4, h + 4, PAL.linen);
  px(ctx, x, y, 14, h, PAL.waterShade);
  const zh = m.zone * h;
  const zy = y + h - m.zoneY * h - zh;
  ctx.fillStyle = m.overlap ? 'rgba(157,186,116,0.85)' : 'rgba(157,186,116,0.55)';
  ctx.fillRect(x + 1, zy, 12, zh);
  px(ctx, x + 1, zy, 12, 1, PAL.leafHi);
  px(ctx, x + 1, zy + zh - 1, 12, 1, PAL.leafShade);
  const fy = y + h - m.fishY * h;
  const icon = itemIcon(f.catch.id);
  ctx.drawImage(icon, x - 1, fy - 8);
  // progress
  px(ctx, x + 16, y, 4, h, PAL.inkDeep);
  const ph = Math.round(m.progress * h);
  px(ctx, x + 16, y + h - ph, 4, ph, m.progress > 0.3 ? '#9DBA74' : '#D9A55B');
}
