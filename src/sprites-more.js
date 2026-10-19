// Placeholder art for the couple places, the animals and the 50 decorations.
// Same rules as sprites.js: a PNG in assets/manifest.json with the same name replaces any of these.
import { PAL, px, disc, shade, sprite } from './sprites.js';

// ---------- places ----------

export function boardSprite(hasNew) {
  return sprite('board_' + (hasNew ? 'new' : 'plain'), 18, 26, ctx => {
    px(ctx, 2, 8, 2, 18, PAL.woodShade);
    px(ctx, 14, 8, 2, 18, PAL.woodShade);
    px(ctx, 0, 2, 18, 14, PAL.wood);
    px(ctx, 1, 3, 16, 12, '#C9A272');
    px(ctx, 0, 2, 18, 1, PAL.woodHi);
    px(ctx, 3, 5, 6, 5, PAL.linenHi);
    px(ctx, 10, 6, 5, 6, PAL.linen);
    px(ctx, 5, 4, 2, 2, PAL.rose);
    px(ctx, 12, 5, 1, 2, '#4F6FB3');
    if (hasNew) px(ctx, 13, 0, 4, 4, '#D9533C');
  });
}

export function wellSprite(lights) {
  return sprite('well_' + lights, 20, 28, ctx => {
    px(ctx, 2, 4, 2, 14, PAL.woodShade);
    px(ctx, 16, 4, 2, 14, PAL.woodShade);
    for (let x = 0; x < 20; x++) px(ctx, x, 2 - Math.floor(Math.abs(x - 10) / 5), 1, 3, PAL.rose);
    px(ctx, 4, 8, 12, 1, PAL.woodShade);
    px(ctx, 9, 9, 2, 4, PAL.stoneShade);
    disc(ctx, 10, 21, 9, PAL.stoneShade);
    disc(ctx, 10, 20, 8.5, PAL.stone);
    for (const [x, y] of [[4, 18], [9, 16], [14, 19], [7, 23], [13, 24]]) px(ctx, x, y, 3, 2, PAL.stoneHi);
    disc(ctx, 10, 18, 5, '#2F3E44');
    for (let i = 0; i < lights; i++) {
      disc(ctx, 7 + i * 6, 17, 2, '#FFE7A8');
      px(ctx, 7 + i * 6, 16, 1, 1, '#FFFFFF');
    }
  });
}

export function picnicSprite() {
  return sprite('picnic', 32, 14, ctx => {
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 32; x++) {
        const on = (Math.floor(x / 4) + Math.floor(y / 4)) % 2;
        px(ctx, x, y + 2, 1, 1, on ? PAL.rose : PAL.linenHi);
      }
    }
    px(ctx, 0, 13, 32, 1, PAL.roseShade);
    px(ctx, 4, 0, 7, 6, PAL.wood);
    px(ctx, 5, 0, 5, 1, PAL.woodHi);
    px(ctx, 22, 3, 4, 4, PAL.linen);
    px(ctx, 26, 4, 1, 2, PAL.linen);
  });
}

export function easelSprite() {
  return sprite('easel', 16, 26, ctx => {
    px(ctx, 3, 8, 1, 18, PAL.woodShade);
    px(ctx, 12, 8, 1, 18, PAL.woodShade);
    px(ctx, 7, 4, 2, 22, PAL.wood);
    px(ctx, 1, 2, 14, 13, PAL.linenHi);
    px(ctx, 1, 2, 14, 3, PAL.rose);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) px(ctx, 2 + c * 3, 6 + r * 3, 2, 2, r === 1 && c === 2 ? '#D9533C' : PAL.linenShade);
    px(ctx, 1, 15, 14, 1, PAL.woodShade);
  });
}

// ---------- animals ----------

// frame: 0/1 movement, sleeping draws closed eyes. Frog and turtle swim when inWater.
export function animalSprite(species, frame, sleeping, inWater) {
  const key = `animal_${species}_${frame}_${sleeping ? 1 : 0}_${inWater ? 1 : 0}`;
  const size = { frog: [14, 12], turtle: [16, 12], snail: [14, 11], marimo: [12, 12] }[species];
  return sprite(key, size[0], size[1], ctx => {
    const lift = frame === 1 ? 1 : 0;
    if (species === 'frog') {
      const g = '#7FAF5B', d = '#557F3C';
      if (inWater) {
        disc(ctx, 7, 8, 4.5, g);
        px(ctx, 2, 10, 10, 2, 'rgba(183,212,189,0.8)');
      } else {
        disc(ctx, 7, 8 - lift, 4.5, g);
        px(ctx, 2, 10 - lift, 3, 2, d);
        px(ctx, 9, 10 - lift, 3, 2, d);
        px(ctx, 4, 9 - lift, 6, 2, '#C9D98A');
      }
      disc(ctx, 4.5, 4.5 - lift, 2, g);
      disc(ctx, 9.5, 4.5 - lift, 2, g);
      if (sleeping) {
        px(ctx, 3, 4 - lift, 3, 1, PAL.inkDeep);
        px(ctx, 8, 4 - lift, 3, 1, PAL.inkDeep);
      } else {
        px(ctx, 4, 4 - lift, 1, 1, PAL.inkDeep);
        px(ctx, 9, 4 - lift, 1, 1, PAL.inkDeep);
      }
      px(ctx, 6, 7 - lift, 2, 1, d);
    } else if (species === 'turtle') {
      const shell = '#8E7A4E', shellHi = '#B39A60', skin = '#9DBA74';
      if (!inWater) {
        px(ctx, 2 + lift, 9, 2, 3, skin);
        px(ctx, 11 - lift, 9, 2, 3, skin);
      }
      disc(ctx, 13.5, 7 - (inWater ? 0 : lift * 0), 2.5, skin);
      px(ctx, 14, 6, 1, 1, sleeping ? skin : PAL.inkDeep);
      disc(ctx, 7.5, 7, 5.5, shell);
      px(ctx, 4, 4, 7, 1, shellHi);
      px(ctx, 5, 6, 2, 2, shellHi);
      px(ctx, 9, 6, 2, 2, shellHi);
      px(ctx, 7, 8, 2, 2, shellHi);
      if (inWater) px(ctx, 0, 10, 16, 2, 'rgba(183,212,189,0.8)');
    } else if (species === 'snail') {
      const shell = '#C68F89', body = '#D9C9A0';
      px(ctx, 1, 8, 12, 3, body);
      px(ctx, 11, 4 - lift, 1, 5, body);
      px(ctx, 13, 4 - lift, 1, 4, body);
      px(ctx, 11, 3 - lift, 1, 1, PAL.inkDeep);
      px(ctx, 13, 3 - lift, 1, 1, PAL.inkDeep);
      disc(ctx, 6, 5.5, 4.5, shell);
      disc(ctx, 6, 5.5, 2.5, shade(shell, -0.2));
      disc(ctx, 6, 5.5, 1, shell);
      px(ctx, 3, 3, 2, 1, PAL.roseHi);
    } else {
      // marimo: a textured moss ball, not a furry animal
      disc(ctx, 6, 6.5, 5, '#4F7A44');
      for (const [x, y] of [[3, 4], [7, 3], [9, 6], [4, 8], [7, 9], [2, 6]]) px(ctx, x, y, 1, 1, '#79A35F');
      px(ctx, 3, 3, 2, 1, '#8FB872');
      if (inWater) px(ctx, 0, 10, 12, 2, 'rgba(183,212,189,0.7)');
    }
  });
}

// ---------- effects ----------

export function noteSprite() {
  return sprite('fx_note', 6, 8, ctx => {
    px(ctx, 3, 0, 1, 6, PAL.ink);
    px(ctx, 3, 0, 3, 1, PAL.ink);
    disc(ctx, 2, 6, 1.8, PAL.ink);
  });
}

export function bubbleSprite() {
  return sprite('fx_bubble', 6, 6, ctx => {
    disc(ctx, 3, 3, 2.6, 'rgba(183,212,189,0.6)');
    px(ctx, 2, 1, 1, 1, '#FFFFFF');
  });
}

export function sparkleSprite() {
  return sprite('fx_sparkle', 7, 7, ctx => {
    px(ctx, 3, 0, 1, 7, '#FFF2B0');
    px(ctx, 0, 3, 7, 1, '#FFF2B0');
    px(ctx, 3, 3, 1, 1, '#FFFFFF');
  });
}

export function zzzSprite() {
  return sprite('fx_zzz', 6, 6, ctx => {
    px(ctx, 0, 0, 5, 1, PAL.ink);
    px(ctx, 3, 1, 1, 1, PAL.ink);
    px(ctx, 2, 2, 1, 1, PAL.ink);
    px(ctx, 1, 3, 1, 1, PAL.ink);
    px(ctx, 0, 4, 5, 1, PAL.ink);
  });
}

// ---------- decorations ----------

// Decorations that lie flat on the ground can be walked over.
export const FLAT_DECOR = new Set(['pathstone', 'pathwood', 'picnic', 'moss', 'clover', 'puddle', 'lilypad', 'waterbowl']);

const TREE_SIZE = [24, 34];

function tree(ctx, kind, season) {
  const winter = season === 'winter';
  const autumn = season === 'autumn';
  if (kind === 'pine') {
    px(ctx, 11, 26, 3, 8, PAL.woodShade);
    for (let y = 0; y < 27; y++) {
      const w = Math.min(22, Math.floor(y * 0.8) + 2 - (y % 7 === 6 ? 3 : 0));
      px(ctx, 12 - w / 2, y, w, 1, y % 7 > 4 ? PAL.leafShade : winter && y % 7 < 2 ? '#F2F6F6' : '#4F7A54');
    }
    return;
  }
  const trunk = kind === 'birch' ? '#E9E4D8' : PAL.woodShade;
  px(ctx, 10, 18, 4, 16, trunk);
  if (kind === 'birch') for (let y = 20; y < 34; y += 4) px(ctx, 10, y, 2, 1, PAL.inkDeep);
  if (winter) {
    disc(ctx, 12, 12, 8, '#7D8F7C');
    disc(ctx, 12, 9, 7, '#F2F6F6');
    return;
  }
  const colors = {
    oak: autumn ? ['#C98A44', '#9A5E30'] : [PAL.leaf, PAL.leafShade],
    birch: autumn ? ['#E3B266', '#B5853A'] : ['#9DBA74', '#6F925B'],
    willow: ['#8FB06A', '#5E8A4A'],
    cherry: season === 'spring' ? ['#E4B4A3', '#C68F89'] : [PAL.leaf, PAL.leafShade],
    sapling: [PAL.leafHi, PAL.leaf],
  }[kind];
  if (kind === 'sapling') {
    px(ctx, 11, 22, 2, 12, PAL.wood);
    disc(ctx, 12, 20, 5, colors[1]);
    disc(ctx, 12, 19, 4, colors[0]);
    return;
  }
  disc(ctx, 12, 13, 11, colors[1]);
  disc(ctx, 12, 12, 10, colors[0]);
  disc(ctx, 8, 9, 4, shade(colors[0], 0.2));
  if (kind === 'willow') for (let x = 3; x < 22; x += 3) px(ctx, x, 14, 1, 12, colors[1]);
}

function drawDecor(ctx, type, season) {
  const c = ctx;
  switch (type) {
    case 'pine': case 'oak': case 'birch': case 'willow': case 'cherry': case 'sapling':
      return tree(c, type, season);
    case 'bush':
      disc(c, 8, 9, 6.5, PAL.leafShade); disc(c, 8, 8, 6, PAL.leaf);
      for (const [x, y] of [[5, 6], [10, 8], [7, 11]]) px(c, x, y, 2, 2, '#4F6FB3');
      return;
    case 'lavender': case 'butterflies': case 'sunflower': case 'daisy': case 'flower': case 'blueflower': case 'bellflower': {
      const color = { lavender: '#9C82C9', butterflies: '#E8B83A', sunflower: '#E8B83A', daisy: '#F5F2E6', flower: '#E07A9B', blueflower: '#6F97C9', bellflower: '#B08FD9' }[type];
      const tall = type === 'sunflower';
      for (const x of [3, 7, 11]) {
        px(c, x + 1, tall ? 4 : 8, 1, tall ? 12 : 8, PAL.leaf);
        disc(c, x + 1.5, tall ? 4 : 7, tall ? 2.5 : 1.8, color);
        if (tall) px(c, x + 1, 3, 1, 1, PAL.woodShade);
      }
      px(c, 2, 14, 12, 2, PAL.leafShade);
      if (type === 'butterflies') { px(c, 1, 2, 2, 2, PAL.roseHi); px(c, 3, 2, 2, 2, PAL.roseHi); }
      return;
    }
    case 'pumpkin':
      disc(c, 8, 10, 5.5, '#E0873A'); px(c, 7, 4, 2, 3, PAL.leafShade); px(c, 5, 8, 1, 5, '#B5642A'); px(c, 10, 8, 1, 5, '#B5642A');
      return;
    case 'reeds':
      for (const x of [4, 7, 10, 12]) { px(c, x, 3, 1, 13, PAL.leaf); px(c, x, 3, 1, 3, PAL.woodShade); }
      return;
    case 'pathstone':
      for (const [x, y] of [[2, 3], [9, 8], [3, 11]]) { disc(c, x + 2.5, y + 2, 2.5, PAL.stone); px(c, x + 1, y + 1, 2, 1, PAL.stoneHi); }
      return;
    case 'pathwood':
      for (let x = 1; x < 16; x += 5) { px(c, x, 3, 4, 10, PAL.wood); px(c, x, 3, 4, 1, PAL.woodHi); px(c, x, 12, 4, 1, PAL.woodShade); }
      return;
    case 'fence':
      px(c, 0, 7, 16, 2, PAL.wood); px(c, 0, 11, 16, 2, PAL.wood);
      for (const x of [1, 7, 13]) { px(c, x, 3, 2, 13, PAL.woodShade); px(c, x, 3, 2, 1, PAL.woodHi); }
      return;
    case 'bridge':
      for (let x = 0; x < 16; x += 3) px(c, x, 7 - (x > 4 && x < 12 ? 2 : 0), 2, 6, PAL.wood);
      px(c, 0, 4, 16, 1, PAL.woodShade);
      return;
    case 'birdhouse':
      px(c, 7, 9, 2, 7, PAL.woodShade); px(c, 3, 3, 10, 7, PAL.rose); disc(c, 8, 6, 1.5, PAL.inkDeep);
      for (let x = 2; x < 14; x++) px(c, x, 2 - Math.floor(Math.abs(x - 8) / 3), 1, 2, PAL.woodShade);
      return;
    case 'hammock':
      px(c, 0, 3, 2, 13, PAL.woodShade); px(c, 14, 3, 2, 13, PAL.woodShade);
      for (let x = 2; x < 14; x++) px(c, x, 6 + Math.round(Math.sin(((x - 2) / 11) * Math.PI) * 4), 1, 2, PAL.linen);
      return;
    case 'picnic':
      for (let y = 6; y < 15; y++) for (let x = 1; x < 15; x++) px(c, x, y, 1, 1, (Math.floor(x / 3) + Math.floor(y / 3)) % 2 ? PAL.rose : PAL.linenHi);
      return;
    case 'tent':
      for (let y = 2; y < 15; y++) { const h = Math.floor((y - 2) * 0.55) + 1; px(c, 8 - h, y, h * 2, 1, PAL.linen); }
      px(c, 7, 9, 2, 6, '#4A3A34');
      return;
    case 'cabin':
      px(c, 1, 7, 14, 9, PAL.wood);
      for (let y = 8; y < 16; y += 2) px(c, 1, y, 14, 1, PAL.woodShade);
      for (let x = 0; x < 16; x++) px(c, x, 6 - Math.floor(Math.abs(x - 8) * 0.6), 1, 3, '#6E5A4E');
      px(c, 6, 10, 4, 6, PAL.woodShade); px(c, 11, 9, 3, 3, '#FFE7A8');
      return;
    case 'treehouse':
      px(c, 7, 8, 3, 8, PAL.woodShade); disc(c, 8, 5, 7, PAL.leaf);
      px(c, 3, 6, 10, 5, PAL.wood); px(c, 6, 7, 3, 3, '#FFE7A8');
      return;
    case 'campfire':
      for (const [x, y] of [[3, 12], [10, 12], [6, 13]]) px(c, x, y, 4, 2, PAL.woodShade);
      disc(c, 8, 9, 3, '#E8873A'); disc(c, 8, 8, 1.8, '#FFE07A');
      return;
    case 'windchime':
      px(c, 3, 2, 10, 1, PAL.woodShade);
      for (const x of [4, 7, 10]) px(c, x, 3, 1, 6 + (x % 3), PAL.stoneHi);
      px(c, 7, 0, 1, 2, PAL.woodShade);
      return;
    case 'mailbox':
      px(c, 7, 8, 2, 8, PAL.woodShade); px(c, 3, 3, 10, 6, '#6F97B5'); px(c, 3, 2, 10, 1, '#9DBBD0');
      return;
    case 'signpost':
      px(c, 7, 4, 2, 12, PAL.woodShade); px(c, 2, 3, 12, 4, PAL.wood); px(c, 3, 8, 10, 3, PAL.wood);
      return;
    case 'waterbowl': case 'foodbowl':
      px(c, 3, 9, 10, 5, type === 'waterbowl' ? '#6F97B5' : PAL.rose); px(c, 4, 8, 8, 2, type === 'waterbowl' ? PAL.water : '#C9A272');
      return;
    case 'petbed':
      disc(c, 8, 10, 6.5, PAL.leafShade); disc(c, 8, 10, 4.5, '#79A35F');
      return;
    case 'tunnel':
      disc(c, 8, 10, 6.5, PAL.wood); disc(c, 8, 11, 4, '#3A2A1E');
      return;
    case 'crystal': case 'stone': case 'riverstone': {
      if (type === 'crystal') { px(c, 6, 3, 4, 11, '#A9E0E8'); px(c, 4, 7, 3, 7, '#7FC3D0'); px(c, 10, 6, 3, 8, '#7FC3D0'); px(c, 7, 4, 1, 6, '#FFFFFF'); return; }
      const n = type === 'riverstone' ? [[4, 10, 2.5], [10, 11, 2], [7, 7, 2]] : [[8, 10, 4.5]];
      for (const [x, y, r] of n) { disc(c, x, y, r, PAL.stone); px(c, x - 1, y - 2, 2, 1, PAL.stoneHi); }
      return;
    }
    case 'fern':
      for (let i = 0; i < 5; i++) px(c, 2 + i * 2, 4 + Math.abs(2 - i), 2, 10 - Math.abs(2 - i), i % 2 ? PAL.leaf : PAL.leafHi);
      return;
    case 'mushroom': case 'tallmushroom': {
      const tall = type === 'tallmushroom';
      px(c, 7, tall ? 6 : 10, 2, tall ? 10 : 6, PAL.linen);
      for (let y = 0; y < 4; y++) px(c, 4 + (3 - y), (tall ? 3 : 7) + y, 8 - (3 - y) * 2 + 2, 1, '#C9483A');
      px(c, 6, tall ? 4 : 8, 1, 1, PAL.linenHi);
      return;
    }
    case 'lantern':
      px(c, 7, 6, 2, 10, PAL.woodShade); px(c, 5, 2, 6, 5, '#FFE7A8'); px(c, 5, 1, 6, 1, PAL.woodShade);
      return;
    case 'moss': case 'clover':
      for (const [x, y] of [[3, 9], [8, 11], [11, 8], [6, 7]]) disc(c, x, y, 2.5, type === 'moss' ? '#79A35F' : '#6FAF5B');
      return;
    case 'log':
      px(c, 0, 8, 16, 7, PAL.wood); disc(c, 14, 11.5, 3.5, PAL.woodHi); disc(c, 14, 11.5, 1.5, PAL.woodShade); px(c, 2, 8, 8, 2, '#79A35F');
      return;
    case 'stump':
      px(c, 3, 8, 10, 7, PAL.woodShade); px(c, 3, 6, 10, 3, PAL.woodHi); px(c, 6, 7, 4, 1, PAL.wood);
      return;
    case 'fireflyjar':
      px(c, 5, 5, 6, 10, 'rgba(220,232,228,0.7)'); px(c, 5, 4, 6, 1, PAL.woodShade);
      for (const [x, y] of [[6, 8], [9, 11], [7, 12]]) px(c, x, y, 1, 1, '#FFF2B0');
      return;
    case 'fairylights':
      for (let x = 0; x < 16; x++) px(c, x, 4 + Math.round(Math.sin(x / 2.5) * 2), 1, 1, PAL.inkDeep);
      for (let x = 1; x < 16; x += 3) px(c, x, 5 + Math.round(Math.sin(x / 2.5) * 2), 2, 2, ['#FFE7A8', PAL.roseHi, '#B7D4BD'][x % 3]);
      return;
    case 'puddle': case 'lilypad':
      disc(c, 8, 10, 6, type === 'puddle' ? PAL.water : PAL.leaf);
      if (type === 'puddle') px(c, 5, 9, 4, 1, PAL.waterHi); else { px(c, 8, 4, 1, 6, PAL.water); disc(c, 10, 9, 1.5, PAL.roseHi); }
      return;
    case 'seat':
      px(c, 1, 6, 14, 3, PAL.wood); px(c, 1, 9, 2, 6, PAL.woodShade); px(c, 13, 9, 2, 6, PAL.woodShade); px(c, 3, 2, 10, 4, PAL.woodHi);
      return;
    default:
      disc(c, 8, 9, 5, PAL.rose);
  }
}

export function decorSprite(type, season) {
  const isTree = ['pine', 'oak', 'birch', 'willow', 'cherry', 'sapling'].includes(type);
  const seasonal = isTree;
  const [w, h] = isTree ? TREE_SIZE : [16, 16];
  return sprite(`decor_${type}${seasonal ? '_' + season : ''}`, w, h, ctx => drawDecor(ctx, type, season));
}

// ---------- bugs ----------

export function bugSprite(kind, color, frame) {
  return sprite(`bug_${kind}_${color}_${frame}`, 10, 8, ctx => {
    const up = frame === 1;
    if (kind === 'butterfly') {
      px(ctx, 4, 2, 2, 5, PAL.inkDeep);
      const h = up ? 3 : 4;
      px(ctx, 0, up ? 0 : 1, 4, h, color); px(ctx, 6, up ? 0 : 1, 4, h, color);
      px(ctx, 1, 5, 3, 2, shade(color, -0.15)); px(ctx, 6, 5, 3, 2, shade(color, -0.15));
    } else if (kind === 'bee') {
      disc(ctx, 5, 5, 2.6, color); px(ctx, 4, 4, 1, 3, PAL.inkDeep); px(ctx, 6, 4, 1, 3, PAL.inkDeep);
      px(ctx, 2, up ? 1 : 2, 3, 2, 'rgba(255,255,255,0.8)'); px(ctx, 6, up ? 1 : 2, 3, 2, 'rgba(255,255,255,0.8)');
    } else if (kind === 'beetle') {
      disc(ctx, 5, 5, 3, color); px(ctx, 5, 2, 1, 6, shade(color, -0.35)); px(ctx, 4, 1, 3, 1, PAL.inkDeep);
      px(ctx, 3, 4, 1, 1, shade(color, 0.4));
    } else if (kind === 'firefly') {
      px(ctx, 4, 3, 2, 3, PAL.inkDeep); disc(ctx, 5, 6, 2, up ? color : shade(color, -0.2));
      px(ctx, 2, 2, 2, 2, 'rgba(255,255,255,0.6)'); px(ctx, 6, 2, 2, 2, 'rgba(255,255,255,0.6)');
    } else if (kind === 'dragonfly') {
      px(ctx, 1, 4, 8, 1, color); px(ctx, 8, 3, 2, 3, shade(color, -0.2));
      px(ctx, 3, up ? 1 : 2, 2, 2, 'rgba(255,255,255,0.75)'); px(ctx, 5, up ? 1 : 2, 2, 2, 'rgba(255,255,255,0.75)');
      px(ctx, 3, up ? 6 : 5, 2, 2, 'rgba(255,255,255,0.75)'); px(ctx, 5, up ? 6 : 5, 2, 2, 'rgba(255,255,255,0.75)');
    } else {
      px(ctx, 2, 4, 6, 2, color); px(ctx, 7, 3, 2, 2, shade(color, -0.2));
      px(ctx, 2, 6, 1, 2, PAL.inkDeep); px(ctx, 5, 6, 1, 2, PAL.inkDeep); px(ctx, 1, up ? 2 : 3, 2, 1, PAL.inkDeep);
    }
  });
}

// ---------- the other jars ----------

export function doorSprite() {
  return sprite('jar_door', 16, 26, ctx => {
    px(ctx, 1, 2, 14, 24, PAL.woodShade);
    px(ctx, 3, 4, 10, 22, '#B7D4BD');
    px(ctx, 3, 4, 10, 2, 'rgba(255,255,255,0.7)');
    px(ctx, 7, 4, 2, 22, PAL.woodShade);
    px(ctx, 10, 15, 2, 2, '#E8C25A');
    px(ctx, 0, 0, 16, 3, PAL.wood);
  });
}

export function palmSprite(hasFruit) {
  return sprite('palm_' + (hasFruit ? 1 : 0), 32, 44, ctx => {
    for (let y = 16; y < 44; y++) px(ctx, 15 + Math.round(Math.sin(y / 9) * 2), y, 3, 1, y % 4 ? PAL.wood : PAL.woodShade);
    for (const [dx, dy] of [[-12, 4], [12, 4], [-9, -2], [9, -2], [0, -5]]) {
      for (let i = 0; i < 12; i++) px(ctx, 16 + Math.round(dx * i / 12), 16 + Math.round(dy * i / 12) + Math.round((i * i) / 30), 3, 2, i % 3 ? PAL.leaf : PAL.leafShade);
    }
    if (hasFruit) { disc(ctx, 14, 18, 2.2, '#8A6448'); disc(ctx, 19, 18, 2.2, '#8A6448'); }
  });
}

export function hiveSprite(hasHoney) {
  return sprite('hive_' + (hasHoney ? 1 : 0), 16, 24, ctx => {
    px(ctx, 7, 14, 2, 10, PAL.woodShade);
    for (let i = 0; i < 4; i++) px(ctx, 3 + (i % 2), 3 + i * 3, 10 - (i % 2) * 2, 3, i % 2 ? '#D9A53A' : '#E8C25A');
    px(ctx, 7, 11, 2, 2, PAL.inkDeep);
    if (hasHoney) px(ctx, 6, 15, 4, 2, '#E8B83A');
  });
}

export function pineSprite() {
  return sprite('snow_pine', 20, 32, ctx => {
    px(ctx, 9, 24, 3, 8, PAL.woodShade);
    for (let y = 0; y < 25; y++) {
      const w = Math.min(18, Math.floor(y * 0.75) + 2);
      px(ctx, 10 - w / 2, y, w, 1, y % 6 < 2 ? '#F2F6F6' : '#4F7A54');
    }
  });
}

export function snowmanSprite() {
  return sprite('snowman', 16, 24, ctx => {
    disc(ctx, 8, 17, 6, '#F7FAFA'); disc(ctx, 8, 8, 4.5, '#F7FAFA');
    px(ctx, 6, 7, 1, 1, PAL.inkDeep); px(ctx, 9, 7, 1, 1, PAL.inkDeep); px(ctx, 8, 9, 3, 1, '#E8873A');
    px(ctx, 4, 12, 8, 2, PAL.rose); px(ctx, 5, 1, 6, 3, PAL.inkDeep);
  });
}

export function archSprite() {
  return sprite('rose_arch', 32, 32, ctx => {
    px(ctx, 2, 8, 3, 24, PAL.leafShade); px(ctx, 27, 8, 3, 24, PAL.leafShade);
    for (let x = 2; x < 30; x++) px(ctx, x, 8 - Math.round(Math.sin(((x - 2) / 27) * Math.PI) * 7), 1, 3, PAL.leaf);
    for (const [x, y] of [[4, 12], [27, 16], [8, 3], [16, 1], [24, 3], [3, 22], [28, 26]]) disc(ctx, x, y, 1.8, '#D9506E');
  });
}

// ---------- visitors and the merchant ----------

// An upright little animal visitor, 16 x 20. frame 1 bobs up a pixel.
export function visitorSprite(species, color, frame) {
  return sprite(`visitor_${species}_${frame}`, 16, 20, ctx => {
    const up = frame ? 1 : 0;
    const d = shade(color, -0.25), l = shade(color, 0.3);
    // ears / head shapes by species
    if (species === 'fox') { px(ctx, 4, 1 - up, 2, 3, color); px(ctx, 10, 1 - up, 2, 3, color); px(ctx, 12, 13, 3, 3, l); }
    if (species === 'bear' || species === 'mouse') { disc(ctx, 4.5, 3.5 - up, species === 'mouse' ? 2.5 : 2, color); disc(ctx, 11.5, 3.5 - up, species === 'mouse' ? 2.5 : 2, color); }
    if (species === 'deer') { px(ctx, 3, 0 - up, 1, 3, PAL.woodShade); px(ctx, 12, 0 - up, 1, 3, PAL.woodShade); px(ctx, 2, 1 - up, 2, 1, PAL.woodShade); px(ctx, 12, 1 - up, 2, 1, PAL.woodShade); }
    if (species === 'owl') { px(ctx, 4, 2 - up, 2, 2, d); px(ctx, 10, 2 - up, 2, 2, d); }
    if (species === 'hedgehog') for (let x = 2; x < 14; x += 2) px(ctx, x, 2 - up + (x % 4 ? 1 : 0), 2, 3, d);
    disc(ctx, 8, 7 - up, 5, color);
    if (species === 'duck') px(ctx, 6, 8 - up, 4, 2, '#E8A03A');
    else if (species === 'owl') { disc(ctx, 6, 6 - up, 1.8, PAL.linenHi); disc(ctx, 10, 6 - up, 1.8, PAL.linenHi); px(ctx, 7, 8 - up, 2, 1, '#E8A03A'); }
    else px(ctx, 6, 8 - up, 4, 2, l);
    px(ctx, 6, 6 - up, 1, 1, PAL.inkDeep);
    px(ctx, 9, 6 - up, 1, 1, PAL.inkDeep);
    // body
    px(ctx, 4, 11 - up, 8, 6, color);
    px(ctx, 6, 12 - up, 4, 4, l);
    px(ctx, 4, 17, 3, 2, d);
    px(ctx, 9, 17, 3, 2, d);
  });
}

// A request bubble above a visitor.
export function requestMarkSprite() {
  return sprite('request_mark', 7, 9, ctx => {
    px(ctx, 0, 0, 7, 7, PAL.linenHi);
    px(ctx, 3, 1, 1, 3, '#D9533C');
    px(ctx, 3, 5, 1, 1, '#D9533C');
    px(ctx, 2, 7, 3, 1, PAL.linenHi);
    px(ctx, 3, 8, 1, 1, PAL.linenHi);
  });
}

// The traveling merchant in a hooded cloak with a big pack, 20 x 26.
export function merchantSprite(frame) {
  return sprite('merchant_' + frame, 20, 26, ctx => {
    const up = frame ? 1 : 0;
    px(ctx, 11, 6 - up, 8, 12, PAL.woodShade);
    px(ctx, 12, 7 - up, 6, 10, PAL.wood);
    px(ctx, 13, 3 - up, 4, 3, '#C9483A');
    disc(ctx, 8, 7 - up, 5, '#5E4A7A');
    disc(ctx, 8, 8 - up, 3, '#E8B994');
    px(ctx, 7, 8 - up, 1, 1, PAL.inkDeep);
    px(ctx, 9, 8 - up, 1, 1, PAL.inkDeep);
    for (let y = 12; y < 24; y++) px(ctx, 8 - Math.floor((y - 10) / 3), y - up, 2 + Math.floor((y - 10) / 3) * 2, 1, '#5E4A7A');
    px(ctx, 5, 24, 3, 2, PAL.inkDeep);
    px(ctx, 9, 24, 3, 2, PAL.inkDeep);
  });
}

// The rug the merchant lays goods out on, 32 x 16, drawn flat on the ground.
export function merchantRugSprite() {
  return sprite('merchant_rug', 32, 16, ctx => {
    px(ctx, 1, 3, 30, 11, '#B5324A');
    px(ctx, 3, 5, 26, 7, '#D9A53A');
    px(ctx, 5, 6, 22, 5, '#B5324A');
    for (let x = 1; x < 31; x += 3) { px(ctx, x, 2, 1, 1, '#D9A53A'); px(ctx, x, 14, 1, 1, '#D9A53A'); }
    disc(ctx, 9, 8, 2, '#A9E0E8');
    px(ctx, 15, 6, 4, 4, PAL.linenHi);
    disc(ctx, 24, 8, 2, '#E8C25A');
  });
}
