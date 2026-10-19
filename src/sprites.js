import {paintResident,paintMonster} from './creature-art.js';
// Placeholder pixel art, drawn in code. Each sprite has a stable name, and a PNG
// listed in assets/manifest.json with the same name replaces it (see docs/ASSETS.md).
import {R,oval,poly,line,box,plank,leaf,roof,paintTree,finishPixels} from './art-style.js';
import {paintItem} from './item-art.js';
import { ITEMS, CROP_BY_ID } from './data.js';
import { hashString } from './rng.js';
import { ROCKS, BANDS, MONSTERS } from './mine-data.js';

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
  sand: ['#E9D7A8', '#D5C08A', '#F5E8C4'],
  blossom: ['#B9CC86', '#9DB86E', '#E4B4A3'],
  dune: ['#E3C28A', '#CFA86E', '#F0D9A8'],
  jungle: ['#5E9A4A', '#4A7F3A', '#7FB55A'],
  moss: ['#5E7A5A', '#4A634A', '#7F9A6E'],
  cloud: ['#4A4670', '#3E3A62', '#6A66A0'],
  stone: ['#A9A397', '#8E897E', '#C4BFB3'],
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
    finishPixels(c,name);
    cache.set(name, c);
  }
  return c;
}

// ---------- ground ----------

export function grassTile(season, variant) {
  return sprite(`ground_${season}_${variant}`, 16, 16, ctx => {
    const [base, dark, light] = SEASON_GROUND[season];
    px(ctx, 0, 0, 16, 16, base);
    const seed=hashString(season+variant),x=2+seed%10,y=3+(seed>>>8)%9;
    px(ctx,x,y,1,2,shade(base,-.09));px(ctx,x+1,y+1,2,1,shade(base,.07));
    if(variant%2===0){px(ctx,(x+7)%14,(y+5)%14,1,1,shade(base,.08));}
    if (variant === 3 && season !== 'winter') {
      px(ctx, 5, 9, 1, 1, PAL.linenHi);
      px(ctx, 11, 4, 1, 1, PAL.roseHi);
    }
  });
}

// ---------- item icons ----------

function drawShape(ctx, item) {
  if(paintItem(ctx,item))return;
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
    case 'bug':
      if (item.kind === 'butterfly') { px(ctx, 7, 4, 2, 8, PAL.inkDeep); px(ctx, 2, 3, 5, 5, c); px(ctx, 9, 3, 5, 5, c); px(ctx, 3, 8, 4, 3, dark); px(ctx, 9, 8, 4, 3, dark); }
      else if (item.kind === 'dragonfly') { px(ctx, 2, 8, 12, 2, c); px(ctx, 12, 7, 3, 4, dark); px(ctx, 5, 4, 3, 3, PAL.linenHi); px(ctx, 9, 4, 3, 3, PAL.linenHi); px(ctx, 5, 11, 3, 3, PAL.linenHi); px(ctx, 9, 11, 3, 3, PAL.linenHi); }
      else if (item.kind === 'firefly') { px(ctx, 7, 4, 2, 5, PAL.inkDeep); disc(ctx, 8, 11, 3, c); px(ctx, 4, 4, 3, 3, PAL.linenHi); px(ctx, 9, 4, 3, 3, PAL.linenHi); }
      else if (item.kind === 'bee') { disc(ctx, 8, 9, 4, c); px(ctx, 6, 6, 1, 6, PAL.inkDeep); px(ctx, 9, 6, 1, 6, PAL.inkDeep); px(ctx, 3, 3, 4, 3, PAL.linenHi); px(ctx, 9, 3, 4, 3, PAL.linenHi); }
      else if (item.kind === 'beetle') { disc(ctx, 8, 9, 5, c); px(ctx, 8, 4, 1, 10, dark); px(ctx, 6, 3, 5, 1, PAL.inkDeep); px(ctx, 5, 7, 2, 2, light); }
      else { px(ctx, 3, 8, 10, 3, c); px(ctx, 11, 6, 3, 3, dark); for (const x of [4, 7, 10]) px(ctx, x, 11, 1, 3, PAL.inkDeep); }
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
  return sprite('tent',48,40,c=>{
    poly(c,[[3,35],[15,9],[32,6],[46,34],[42,38],[8,39]],PAL.roseShade);
    poly(c,[[5,34],[16,10],[31,8],[22,36]],PAL.roseHi);
    poly(c,[[23,35],[32,9],[44,34]],PAL.rose);
    for(const [x,y]of[[12,20],[16,13],[9,27]])line(c,x,y,x+4,y+12,PAL.roseShade);
    poly(c,[[22,36],[31,16],[38,35]],'#38493D');
    poly(c,[[31,17],[29,34],[23,35]],PAL.linenShade);poly(c,[[32,18],[37,34],[34,32]],PAL.linen);
    line(c,15,9,32,6,PAL.linenHi);line(c,4,35,42,37,PAL.roseShade,2);
    line(c,15,10,1,38,PAL.woodShade);line(c,42,32,47,38,PAL.woodShade);
    R(c,0,38,3,2,PAL.wood);R(c,45,38,3,2,PAL.wood);R(c,30,2,1,6,PAL.woodShade);R(c,31,2,5,3,PAL.leafHi);
    box(c,36,25,5,8,PAL.woodShade);R(c,37,27,3,4,'#F2D39A');R(c,37,27,1,3,PAL.linenHi);
  });
}

export function mailboxSprite(hasMail) {
 return sprite('mailbox_'+(hasMail?'full':'empty'),16,26,c=>{
  plank(c,7,12,3,14,PAL.wood);R(c,8,16,1,7,PAL.woodHi);plank(c,3,14,12,2,PAL.woodShade);
  poly(c,[[1,5],[3,2],[11,2],[14,5],[14,13],[1,13]],PAL.roseShade);
  box(c,2,4,11,9,PAL.rose);R(c,3,4,7,1,PAL.roseHi);R(c,3,7,7,1,PAL.roseShade);R(c,9,10,2,1,PAL.woodShade);
  if(hasMail){R(c,12,0,1,9,PAL.woodShade);R(c,13,0,3,3,'#C93A4A');box(c,3,7,7,4,PAL.linenHi);line(c,4,8,6,9,PAL.rose);line(c,6,9,9,8,PAL.rose)}else R(c,13,7,3,1,PAL.roseShade);
 });
}

export function crateSprite(full) {
 return sprite('crate_'+(full?'full':'empty'),16,18,c=>{
  if(full){oval(c,5,5,3,3,'#C68F89');oval(c,11,4,3,3,'#9DBA74');R(c,9,0,1,3,PAL.leafShade);R(c,4,2,1,1,PAL.roseHi)}
  box(c,1,6,14,12,PAL.woodShade);R(c,2,6,12,2,PAL.woodHi);R(c,3,8,10,8,'#8E6B4F');
  for(const y of[8,12,16])plank(c,1,y,14,2,PAL.wood);
  R(c,2,8,2,9,PAL.woodHi);R(c,12,8,2,9,PAL.woodShade);R(c,3,9,1,1,PAL.ink);R(c,12,14,1,1,PAL.ink);
 });
}

export function workbenchSprite() {
 return sprite('workbench',16,20,c=>{
  plank(c,1,9,3,11,PAL.woodShade);plank(c,12,9,3,11,PAL.woodShade);plank(c,1,15,14,2,PAL.wood);
  plank(c,0,6,16,5,PAL.wood);R(c,1,6,14,1,PAL.woodHi);R(c,3,9,1,1,PAL.ink);R(c,12,9,1,1,PAL.ink);
  R(c,4,2,1,5,PAL.woodShade);box(c,2,1,6,3,PAL.stone);R(c,3,1,3,1,PAL.stoneHi);
  poly(c,[[9,3],[13,2],[15,4],[13,6],[10,6]],PAL.stoneShade);R(c,10,3,3,1,PAL.stoneHi);R(c,8,6,3,1,PAL.linen);
 });
}

export function stallSprite() {
 return sprite('stall',32,34,c=>{
  for(const x of[2,28])plank(c,x,7,2,27,PAL.woodShade);
  poly(c,[[0,7],[4,1],[28,1],[32,7]],PAL.roseShade);
  for(let x=2;x<30;x+=4){R(c,x,3,4,5,x%8===2?PAL.rose:PAL.linen);R(c,x,8,4,2,x%8===2?PAL.roseShade:PAL.linenShade)}
  R(c,4,1,24,1,PAL.linenHi);R(c,0,10,32,1,PAL.woodShade);
  oval(c,16,18,5,6,'#384952');oval(c,15,16,3,4,'#607674');line(c,16,13,16,22,PAL.inkDeep);R(c,12,16,1,1,PAL.linenHi);R(c,19,16,1,1,PAL.linenHi);R(c,12,11,1,3,PAL.ink);R(c,19,11,1,3,PAL.ink);
  plank(c,0,23,32,4,PAL.wood);box(c,2,27,28,7,PAL.woodShade);R(c,3,28,25,4,PAL.wood);
  for(let x=7;x<28;x+=6)R(c,x,28,1,4,PAL.woodShade);
  oval(c,6,22,3,2,PAL.rose);R(c,5,20,1,1,PAL.roseHi);box(c,22,18,5,5,PAL.linen);R(c,23,19,3,1,'#E8C25A');R(c,10,21,3,2,PAL.leafHi);
 });
}

export function treeSprite(season, hasFruit) {
  return sprite(`tree_${season}_${hasFruit ? 1 : 0}`, 40, 52, ctx => paintTree(ctx,40,52,{season,fruit:hasFruit}));
}

export function benchSprite() {
 return sprite('bench',32,18,c=>{
  for(const x of[3,26])plank(c,x,4,3,14,PAL.woodShade);
  plank(c,1,1,30,4,PAL.wood);plank(c,1,6,30,3,PAL.wood);plank(c,0,10,32,4,PAL.wood);
  R(c,2,10,28,1,PAL.woodHi);R(c,2,14,28,1,PAL.woodShade);
  box(c,18,8,10,5,PAL.rose);R(c,20,9,5,1,PAL.roseHi);R(c,23,11,1,1,PAL.roseShade);
  for(const x of[4,27])R(c,x,2,1,1,PAL.ink);
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

// Rock base colour for each mine zone.
const ROCK_BASE = [PAL.stone, '#8A8378', '#7D8796', '#A9C3CC', '#5A4440', '#4A4466'];

export function rockSprite(kind, band) {
  return sprite(`rock_${kind}_${band}`, 16, 16, ctx => {
    const def = ROCKS[kind] || ROCKS.stone;
    const look = ITEMS[def.drop]?.color;
    const fill = def.tint || (def.style === 'fossil' ? '#CDBF9F' : def.style === 'geode' ? shade(look || '#857B70', -0.15) : ROCK_BASE[band]);
    poly(ctx,[[2,7],[5,3],[10,2],[14,6],[15,11],[12,15],[4,15],[1,12]],shade(fill,-.35));
    poly(ctx,[[3,7],[6,4],[10,3],[13,6],[12,12],[5,13],[2,11]],fill);
    poly(ctx,[[3,7],[6,4],[10,3],[9,6],[5,8]],shade(fill,.25));
    line(ctx,9,7,12,10,shade(fill,-.18));

    px(ctx, 2, 14, 12, 1, PAL.inkDeep);
    if (def.style === 'fossil') {
      px(ctx, 6, 8, 4, 1, '#8F7F62');
      px(ctx, 6, 9, 1, 2, '#8F7F62');
      px(ctx, 7, 11, 4, 1, '#8F7F62');
    } else if (def.style === 'geode') {
      px(ctx, 7, 7, 2, 4, '#5E5650');
      px(ctx, 8, 8, 1, 2, '#B7A6D9');
    } else if (def.style === 'ore') {
      for (const [x, y] of [[4, 8], [9, 6], [7, 11], [11, 10]]) px(ctx, x, y, 2, 2, look);
    } else if (def.style === 'gem') {
      px(ctx, 7, 3, 3, 6, look);
      px(ctx, 6, 5, 5, 3, look);
      px(ctx, 7, 4, 1, 3, PAL.linenHi);
      px(ctx, 10, 9, 2, 3, look);
    }
  });
}

// A tile of cave wall for each zone.
export function caveWallSprite(band) {
  return sprite('cave_wall_' + band, 16, 16, ctx => {
    const wall = BANDS[band].wall;
    px(ctx, 0, 0, 16, 16, shade(wall, 0.15));
    px(ctx,0,12,16,4,shade(wall,-.2));
    for(const [x,y,w,h]of [[0,1,6,5],[7,0,9,6],[1,7,9,5],[11,7,5,5]]){
      box(ctx,x,y,w,h,shade(wall,.13));px(ctx,x+1,y+1,Math.max(1,w-3),1,shade(wall,.26));
    }
    px(ctx, 2, 3, 5, 3, shade(wall, 0.3));
    px(ctx, 9, 7, 4, 2, shade(wall, 0.3));
    if (band === 2) { px(ctx, 10, 2, 2, 5, '#B9A8E0'); px(ctx, 12, 4, 2, 3, '#A9E0E8'); }
    if (band === 3) { px(ctx, 1, 0, 14, 2, '#E9F2F6'); px(ctx, 4, 2, 1, 3, '#E9F2F6'); }
    if (band === 4) { px(ctx, 3, 9, 6, 2, '#E8603A'); px(ctx, 5, 10, 2, 1, '#F2C46A'); }
    if (band === 5) { px(ctx, 4, 5, 1, 1, '#F2E48A'); px(ctx, 11, 2, 1, 1, '#FFFFFF'); px(ctx, 8, 10, 1, 1, '#F2E48A'); }
  });
}

export function chestSprite(open) {
  return sprite('chest_' + (open ? 1 : 0), 16, 16, ctx => {
    px(ctx, 1, 6, 14, 9, PAL.woodShade);
    px(ctx, 2, 7, 12, 7, PAL.wood);
    px(ctx, 1, 9, 14, 1, '#E8C25A');
    if (open) {
      px(ctx, 1, 2, 14, 4, PAL.woodShade);
      px(ctx, 3, 6, 10, 2, '#1E1A18');
    } else {
      px(ctx, 1, 3, 14, 4, PAL.wood);
      px(ctx, 1, 3, 14, 1, PAL.woodHi);
      px(ctx, 7, 8, 2, 3, '#E8C25A');
    }
  });
}

// Monsters, by shape. Bosses are drawn bigger.
export function monsterSprite(kind,frame,flash) {
 const def=MONSTERS[kind],size=def.boss?26:16;
 return sprite(`monster_${kind}_${frame}_${flash?1:0}`,size,size,c=>paintMonster(c,def,size,frame,flash));
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

export function bunnySprite(frame,sleeping) {
 return sprite(`bunny_${frame}_${sleeping?1:0}`,14,12,c=>paintResident(c,'bunny',frame,sleeping,false));
}

export function heartSprite() {
  return sprite('fx_heart', 7, 6, ctx => {
    px(ctx, 1, 0, 2, 1, PAL.rose);
    px(ctx, 4, 0, 2, 1, PAL.rose);
    px(ctx, 0, 1, 7, 2, PAL.rose);
    px(ctx, 1, 3, 5, 1, PAL.rose);
    px(ctx, 2, 4, 3, 1, PAL.rose);
    px(ctx, 3, 5, 1, 1, PAL.rose);
    px(ctx,1,1,2,1,PAL.roseHi);px(ctx,3,4,1,1,PAL.roseShade);
  });
}
