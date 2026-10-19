// Placeholder art for the couple places, the animals and the 50 decorations.
// Same rules as sprites.js: a PNG in assets/manifest.json with the same name replaces any of these.
import { PAL, px, disc, shade, sprite } from './sprites.js';
import { OUTDOOR_BY_TYPE, FLAT_OUTDOOR } from './outdoor-data.js';

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
const FLAT_BASE = new Set(['pathstone', 'pathwood', 'picnic', 'moss', 'clover', 'puddle', 'lilypad', 'waterbowl']);
// Flat decorations you can walk over. Outdoor pieces can be added later (catalog-data.js), so check them live.
export const FLAT_DECOR = { has: type => FLAT_BASE.has(type) || FLAT_OUTDOOR.includes(type) };

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

// Farm buildings and fruit trees.
const FRUIT_COLOR = { tree_pear: '#C9C25A', tree_plum: '#7A3A6A', tree_lemon: '#F0DA4A', tree_mango: '#F0A040', tree_banana: '#F0DA6A' };

function drawFarm(c, type) {
  if (type.startsWith('tree_')) {
    const [w, h] = TREE_SIZE;
    px(c, w / 2 - 2, h - 14, 4, 13, PAL.woodShade);
    if (type === 'tree_banana') {
      for (const [x, y, dx] of [[4, 8, 1], [14, 6, -1], [8, 2, 1], [16, 12, -1]]) for (let i = 0; i < 8; i++) px(c, x + i * dx * 0.6 + (dx < 0 ? 6 : 0), y + i * 0.6, 3, 2, i % 2 ? PAL.leaf : PAL.leafShade);
      px(c, 9, 12, 5, 3, FRUIT_COLOR[type]);
    } else {
      disc(c, w / 2, 11, 10, PAL.leafShade);
      disc(c, w / 2, 10, 9, PAL.leaf);
      for (const [x, y] of [[7, 8], [15, 7], [11, 13], [17, 12], [6, 14]]) px(c, x, y, 3, 3, FRUIT_COLOR[type]);
    }
    return;
  }
  switch (type) {
    case 'coop':
      px(c, 1, 5, 14, 10, PAL.wood); px(c, 0, 3, 16, 3, '#B5324A'); px(c, 6, 9, 4, 6, PAL.woodShade);
      disc(c, 12.5, 12, 2, PAL.linenHi); px(c, 14, 11, 1, 1, '#E8A03A');
      return;
    case 'goat_pen':
      for (let x = 0; x < 16; x += 4) px(c, x, 8, 1, 7, PAL.woodShade);
      px(c, 0, 9, 16, 1, PAL.wood); px(c, 0, 13, 16, 1, PAL.wood);
      px(c, 4, 6, 7, 4, PAL.linenHi); px(c, 10, 4, 3, 3, PAL.linenHi); px(c, 11, 3, 1, 1, '#9A958A'); px(c, 5, 10, 1, 2, PAL.ink); px(c, 9, 10, 1, 2, PAL.ink);
      return;
    case 'bee_box':
      px(c, 3, 3, 10, 12, '#E8C25A'); px(c, 3, 7, 10, 1, '#B5853A'); px(c, 3, 11, 10, 1, '#B5853A'); px(c, 2, 2, 12, 2, PAL.woodShade);
      px(c, 7, 13, 2, 1, PAL.inkDeep); px(c, 13, 5, 1, 1, PAL.inkDeep);
      return;
    case 'mushroom_log':
      px(c, 1, 9, 14, 6, PAL.woodShade); px(c, 2, 10, 12, 4, PAL.wood); disc(c, 14, 12, 2.5, '#C9A272');
      disc(c, 5, 8, 2.5, '#8A6448'); disc(c, 10, 8, 2, '#8A6448'); px(c, 5, 9, 1, 2, PAL.linenHi);
      return;
  }
}

// Outdoor crafts, drawn from their form and two colours (see outdoor-data.js).
const TALL_OUTDOOR = new Set(['lamppost', 'torch', 'lanternpost', 'stringpole', 'scarecrow', 'arch', 'heartarch', 'signpost', 'flag', 'windmill', 'chime', 'totem', 'feeder']);

function drawOutdoor(c, def, w, h) {
  const a = def.accent, col = def.color, d = shade(col, -0.3), l = shade(col, 0.3);
  const P = (x, y, ww, hh, cc) => px(c, x, y, ww, hh, cc);
  const B = h - 16; // where the ground tile starts
  switch (def.form) {
    case 'path': for (const [x, y, r] of [[4, 4, 3], [11, 5, 3.5], [5, 11, 3.5], [12, 12, 3]]) { disc(c, x, y, r, d); disc(c, x, y - 0.5, r - 0.6, col); } return;
    case 'bricks': for (let y = 0; y < 16; y += 4) for (let x = (y / 4) % 2 ? -4 : 0; x < 16; x += 8) { P(x, y, 7, 3, col); P(x, y, 7, 1, a); } return;
    case 'deck': for (let x = 0; x < 16; x += 4) { P(x, 0, 3, 16, col); P(x + 3, 0, 1, 16, a); } return;
    case 'tiles': for (const [x, y] of [[0, 0], [8, 0], [0, 8], [8, 8]]) { P(x, y, 7, 7, col); P(x, y, 7, 1, a); } return;
    case 'mosaic': for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) P(x, y, 3, 3, (x + y) % 8 ? col : a); return;
    case 'flowerbed': P(0, 4, 16, 12, col); for (const [x, y] of [[3, 5], [8, 7], [12, 5], [5, 11], [11, 12]]) { P(x, y + 1, 1, 2, '#4F8A4A'); disc(c, x, y, 1.6, a); } return;
    case 'steps': for (const [x, y] of [[3, 3], [11, 7], [5, 12]]) { disc(c, x, y, 2.8, d); disc(c, x, y - 0.5, 2.3, col); } return;
    case 'clover': for (let i = 0; i < 14; i++) { const x = (i * 7) % 15, y = (i * 5) % 15; P(x, y, 2, 2, i % 3 ? col : shade(col, -0.15)); } P(6, 6, 2, 2, a); P(12, 10, 2, 2, a); return;
    case 'fence': for (const x of [1, 6, 11]) { P(x, B + 3, 3, 12, col); P(x + 1, B + 2, 1, 1, col); } P(0, B + 6, 16, 2, a); P(0, B + 11, 16, 2, a); return;
    case 'wall': for (let y = B + 4; y < h; y += 4) for (let x = ((y - B) / 4) % 2 ? -3 : 0; x < 16; x += 6) { P(x, y, 5, 3, col); P(x, y, 5, 1, l); } return;
    case 'hedge': disc(c, 8, B + 9, 7, col); P(1, B + 9, 14, 7, col); for (const [x, y] of [[4, 5], [10, 7], [7, 11]]) P(x, B + y, 2, 2, a); return;
    case 'railing': P(0, B + 4, 16, 1, col); P(0, B + 14, 16, 1, col); for (let x = 1; x < 16; x += 3) { P(x, B + 4, 1, 11, col); P(x, B + 3, 1, 1, a); } return;
    case 'rope': P(2, B + 4, 2, 12, col); P(12, B + 4, 2, 12, col); for (let x = 4; x < 12; x++) { P(x, B + 6 + Math.round(Math.sin(((x - 4) / 8) * Math.PI) * 2), 1, 1, a); P(x, B + 11 + Math.round(Math.sin(((x - 4) / 8) * Math.PI) * 2), 1, 1, a); } return;
    case 'lamppost': P(7, 6, 2, h - 6, col); P(5, h - 2, 6, 2, col); P(4, 2, 8, 5, col); P(5, 3, 6, 3, a); P(6, 0, 4, 2, col); return;
    case 'torch': P(7, 8, 2, h - 8, col); P(6, 6, 4, 3, d); disc(c, 8, 4, 2.5, a); P(7, 0, 2, 3, '#F2E48A'); return;
    case 'lanternpost': P(3, 2, 2, h - 2, col); P(3, 2, 9, 2, col); P(10, 4, 1, 2, col); P(8, 6, 5, 6, a); P(8, 6, 5, 1, col); P(1, h - 2, 6, 2, col); return;
    case 'smalllight': P(7, B + 8, 2, 8, col); P(5, B + 5, 6, 4, a); P(5, B + 4, 6, 1, col); return;
    case 'stringpole': P(2, 2, 2, h - 2, col); P(12, 6, 2, h - 6, col); for (let x = 4; x < 12; x++) { const y = 4 + Math.round(Math.sin(((x - 4) / 8) * Math.PI) * 4); P(x, y, 1, 1, '#3A3A40'); if (x % 2) P(x, y + 1, 1, 2, a); } return;
    case 'stonelantern': P(5, B + 9, 6, 7, col); P(2, B + 6, 12, 3, d); P(4, B + 1, 8, 5, col); P(6, B + 2, 4, 3, a); P(3, B, 10, 2, d); return;
    case 'crystal': P(5, B + 12, 6, 4, '#7D7A74'); P(6, B + 2, 4, 10, col); P(4, B + 6, 3, 6, a); P(9, B + 4, 3, 8, l); return;
    case 'bench': P(1, B + 5, 14, 3, col); P(1, B + 9, 14, 2, col); P(2, B + 11, 2, 5, d); P(12, B + 11, 2, 5, d); return;
    case 'heartbench': disc(c, 5, B + 5, 3.5, col); disc(c, 11, B + 5, 3.5, col); P(2, B + 6, 12, 3, col); P(1, B + 9, 14, 2, a); P(2, B + 11, 2, 5, d); P(12, B + 11, 2, 5, d); return;
    case 'log': P(1, B + 7, 14, 8, col); disc(c, 14, B + 11, 3.5, a); disc(c, 14, B + 11, 1.5, col); return;
    case 'deckchair': for (let i = 0; i < 8; i++) P(3 + i, B + 3 + i, 2, 1, col); P(3, B + 4, 6, 8, a); P(8, B + 10, 6, 2, a); P(3, B + 12, 1, 4, d); P(13, B + 12, 1, 4, d); return;
    case 'picnictable': P(0, B + 4, 16, 3, col); P(0, B + 10, 16, 2, a); P(3, B + 7, 2, 9, d); P(11, B + 7, 2, 9, d); return;
    case 'parasol': for (let y = 0; y < 5; y++) P(8 - (y + 2) * 1.4, B + y, (y + 2) * 2.8, 1, y % 2 ? col : a); P(7, B + 5, 2, 11, d); P(2, B + 11, 12, 2, col); return;
    case 'swing': P(1, B, 2, 16, col); P(13, B, 2, 16, col); P(1, B, 14, 2, col); P(5, B + 2, 1, 8, d); P(10, B + 2, 1, 8, d); P(4, B + 10, 8, 2, a); return;
    case 'hammock': P(1, B + 2, 2, 14, col); P(13, B + 2, 2, 14, col); for (let x = 3; x < 13; x++) P(x, B + 6 + Math.round(Math.sin(((x - 3) / 10) * Math.PI) * 4), 1, 2, a); return;
    case 'planter': P(1, B + 8, 14, 8, col); P(1, B + 8, 14, 1, l); for (const x of [3, 7, 11]) { P(x + 1, B + 4, 1, 4, '#4F8A4A'); disc(c, x + 1, B + 3, 2, a); } return;
    case 'pots': for (const [x, y, s] of [[2, 10, 5], [9, 8, 6]]) { P(x, B + y, s, 16 - y, col); disc(c, x + s / 2, B + y - 1, s / 2, '#4F8A4A'); P(x + 1, B + y - 3, 2, 2, a); } return;
    case 'birdbath': P(6, B + 7, 4, 7, col); P(4, B + 14, 8, 2, col); P(1, B + 4, 14, 3, col); P(2, B + 4, 12, 1, a); return;
    case 'sundial': P(5, B + 8, 6, 8, col); disc(c, 8, B + 6, 6, col); P(8, B + 1, 1, 5, a); P(4, B + 6, 8, 1, shade(col, -0.2)); return;
    case 'scarecrow': P(7, 6, 2, h - 6, '#7A5A3A'); P(2, 9, 12, 2, '#7A5A3A'); disc(c, 8, 5, 3.5, col); P(4, 1, 8, 2, '#B88D60'); P(5, 10, 6, 8, a); P(2, 9, 2, 3, col); P(12, 9, 2, 3, col); return;
    case 'wheelbarrow': P(2, B + 6, 11, 5, col); P(3, B + 7, 9, 2, '#7A5A3A'); disc(c, 4, B + 13, 2.5, '#3A3A40'); P(12, B + 9, 4, 1, a); P(10, B + 11, 1, 4, a); return;
    case 'hay': P(1, B + 5, 14, 11, col); for (let y = B + 7; y < h; y += 3) P(1, y, 14, 1, a); P(1, B + 9, 14, 1, '#B5853A'); return;
    case 'barrel': P(3, B + 3, 10, 13, col); P(3, B + 5, 10, 1, a); P(3, B + 13, 10, 1, a); P(4, B + 3, 8, 2, '#5F9FB5'); return;
    case 'compost': P(1, B + 5, 14, 11, col); for (let x = 1; x < 16; x += 4) P(x, B + 5, 1, 11, a); P(3, B + 3, 10, 3, '#5A4130'); return;
    case 'gnome': for (let y = 0; y < 7; y++) P(8 - y * 0.7, B + 1 + y, y * 1.4 + 1, 1, col); disc(c, 8, B + 10, 2.5, '#F2C4A0'); P(5, B + 11, 6, 4, '#F2F4F6'); P(5, B + 12, 6, 4, a); return;
    case 'feeder': P(7, 7, 2, h - 7, col); P(3, 3, 10, 2, col); P(4, 5, 8, 4, a); P(4, 9, 8, 1, col); return;
    case 'cans': for (const [x, s] of [[2, 6], [9, 5]]) { P(x, B + 16 - s - 2, s, s, col); P(x + s, B + 16 - s, 3, 1, a); P(x + 1, B + 16 - s - 4, s - 2, 2, a); } return;
    case 'pumpkins': for (const [x, y, r] of [[5, 12, 4], [11, 12, 3.5], [8, 7, 3.5]]) { disc(c, x, B + y, r, col); P(x, B + y - r - 1, 1, 2, a); } return;
    case 'arch': case 'heartarch': {
      P(1, 6, 2, h - 6, col); P(13, 6, 2, h - 6, col);
      if (def.form === 'arch') for (let x = 1; x < 15; x++) P(x, 6 - Math.round(Math.sin(((x - 1) / 14) * Math.PI) * 5), 1, 2, col);
      else { disc(c, 5, 5, 4, col); disc(c, 11, 5, 4, col); disc(c, 5, 5, 2.5, 'rgba(0,0,0,0)'); }
      for (const [x, y] of [[2, 9], [13, 13], [3, 17], [12, 6], [7, 2]]) P(x, y, 2, 2, a);
      return;
    }
    case 'signpost': P(7, 4, 2, h - 4, col); P(2, 5, 12, 4, a); P(4, 12, 10, 4, a); P(3, 6, 6, 1, col); P(6, 13, 5, 1, col); return;
    case 'flag': P(2, 0, 1, h, col); P(3, 1, 10, 7, a); disc(c, 8, 4.5, 1.8, PAL.linenHi); return;
    case 'windmill': P(5, 12, 6, h - 12, col); for (let y = 8; y < 12; y++) P(5 + (12 - y) * 0.5, y, 6 - (12 - y), 1, a); P(7, 0, 2, 20, '#7A5A3A'); P(0, 9, 16, 2, '#7A5A3A'); return;
    case 'chime': P(3, 2, 10, 2, col); for (const [x, l2] of [[4, 8], [7, 11], [10, 9], [12, 7]]) { P(x, 4, 1, l2, '#9A958A'); P(x - 1, 4 + l2, 3, 3, a); } P(7, 0, 2, 2, col); return;
    case 'fountain': P(1, B + 9, 14, 7, col); P(2, B + 10, 12, 2, a); P(6, B + 3, 4, 7, col); P(4, B + 2, 8, 2, col); P(7, B, 2, 3, a); return;
    case 'catstatue': P(4, B + 9, 8, 7, d); disc(c, 8, B + 9, 4, col); disc(c, 8, B + 5, 3, col); P(5, B + 1, 2, 3, col); P(9, B + 1, 2, 3, col); P(12, B + 8, 2, 6, col); return;
    case 'totem': for (const [y, cc] of [[0, a], [8, col], [16, a]]) { P(4, y, 8, 8, cc); P(5, y + 2, 2, 2, PAL.inkDeep); P(9, y + 2, 2, 2, PAL.inkDeep); P(6, y + 5, 4, 1, PAL.inkDeep); } P(1, 9, 3, 2, col); P(12, 9, 3, 2, col); return;
    case 'sandbox': P(0, B + 6, 16, 10, col); P(2, B + 8, 12, 6, a); P(5, B + 9, 3, 3, shade(a, -0.15)); P(10, B + 10, 2, 2, '#D9533C'); return;
    case 'tent': for (let y = 0; y < 13; y++) P(8 - (y + 1) * 0.6, B + 3 + y, (y + 1) * 1.2, 1, col); P(7, B + 8, 2, 8, a); return;
    case 'jack': disc(c, 8, B + 10, 6, col); P(7, B + 3, 2, 2, '#4F8A4A'); P(5, B + 8, 2, 2, a); P(9, B + 8, 2, 2, a); P(5, B + 12, 6, 1, a); return;
    case 'wishstone': disc(c, 8, B + 11, 6, col); disc(c, 8, B + 10, 5, l); P(7, B + 7, 2, 2, a); P(5, B + 10, 1, 1, a); P(11, B + 9, 1, 1, a); return;
    case 'snowbunny': disc(c, 8, B + 12, 5, col); disc(c, 8, B + 6, 3.5, col); P(6, B, 2, 4, col); P(9, B, 2, 4, col); P(7, B + 1, 1, 2, a); P(7, B + 6, 1, 1, PAL.inkDeep); P(9, B + 6, 1, 1, PAL.inkDeep); return;
  }
  P(3, B + 3, 10, 13, col);
}

export function decorSprite(type, season) {
  const od = OUTDOOR_BY_TYPE[type];
  if (od) {
    const h = TALL_OUTDOOR.has(od.form) ? 28 : 16;
    return sprite('decor_' + type, 16, h, ctx => drawOutdoor(ctx, od, 16, h));
  }
  if (type.startsWith('tree_') && FRUIT_COLOR[type]) return sprite('decor_' + type, TREE_SIZE[0], TREE_SIZE[1], ctx => drawFarm(ctx, type));
  if (['coop', 'goat_pen', 'bee_box', 'mushroom_log'].includes(type)) return sprite('decor_' + type, 16, 16, ctx => drawFarm(ctx, type));
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

// ---------- seasonal events ----------

// The little striped stand where events are run, 24 x 28.
export function eventStandSprite() {
  return sprite('event_stand', 24, 28, ctx => {
    px(ctx, 2, 8, 2, 20, PAL.woodShade);
    px(ctx, 20, 8, 2, 20, PAL.woodShade);
    for (let x = 0; x < 24; x += 4) px(ctx, x, 4, 4, 6, x % 8 ? PAL.linenHi : '#D9533C');
    px(ctx, 0, 10, 24, 1, PAL.woodShade);
    px(ctx, 1, 18, 22, 8, PAL.wood);
    px(ctx, 1, 18, 22, 1, PAL.woodHi);
    px(ctx, 11, 0, 1, 4, PAL.woodShade);
    px(ctx, 12, 0, 4, 2, '#E8C25A');
    for (let x = 3; x < 21; x += 4) px(ctx, x, 12, 2, 2, ['#E8C25A', '#79AAA4', '#E07A9B'][x % 3]);
  });
}

// ---------- the biome jars ----------

// The animals who live in the jars, and the shopkeepers. 16 x 18, two frames.
export function critterSprite(shape, color, accent, frame) {
  return sprite(`critter_${shape}_${color}_${accent || ''}_${frame}`, 16, 18, ctx => {
    const up = frame ? 1 : 0;
    const d = shade(color, -0.25), l = shade(color, 0.3), eye = PAL.inkDeep;
    const e = (x, y) => px(ctx, x, y - up, 1, 1, eye);
    switch (shape) {
      case 'crab':
        disc(ctx, 8, 12, 5, d); disc(ctx, 8, 11.5, 4.5, color);
        px(ctx, 1, 8 - up, 3, 3, d); px(ctx, 12, 8 - up, 3, 3, d);
        px(ctx, 6, 7, 1, 2, d); px(ctx, 9, 7, 1, 2, d); e(6, 7); e(9, 7);
        for (const x of [3, 5, 10, 12]) px(ctx, x, 15, 1, 2, d);
        break;
      case 'bird': case 'penguin': case 'crane': case 'owl':
        disc(ctx, 8, 11 - up, 5, color);
        if (shape === 'penguin') px(ctx, 6, 9 - up, 4, 6, '#F2F4F6');
        disc(ctx, 8, 5 - up, 3.5, color);
        e(7, 4); if (shape === 'owl') { disc(ctx, 6.5, 5 - up, 1.6, PAL.linenHi); disc(ctx, 9.5, 5 - up, 1.6, PAL.linenHi); e(6, 5); e(9, 5); }
        px(ctx, 10, 5 - up, shape === 'crane' ? 4 : 3, 1, accent || '#E8A03A');
        if (shape === 'crane') { px(ctx, 7, 1 - up, 3, 2, accent || '#C9333C'); px(ctx, 7, 15, 1, 3, PAL.ink); px(ctx, 9, 15, 1, 3, PAL.ink); }
        else { px(ctx, 6, 15, 2, 2, '#E8A03A'); px(ctx, 9, 15, 2, 2, '#E8A03A'); }
        px(ctx, 3, 10 - up, 2, 4, d);
        break;
      case 'bee': case 'moth':
        disc(ctx, 8, 10 - up, 4, color);
        if (shape === 'bee') { px(ctx, 5, 9 - up, 7, 1, PAL.inkDeep); px(ctx, 5, 11 - up, 7, 1, PAL.inkDeep); }
        px(ctx, 2, 4 - up * 2, 5, 5, shape === 'bee' ? 'rgba(255,255,255,0.8)' : l); px(ctx, 9, 4 - up * 2, 5, 5, shape === 'bee' ? 'rgba(255,255,255,0.8)' : l);
        e(10, 9); px(ctx, 10, 5, 1, 2, d);
        break;
      case 'shroom':
        disc(ctx, 8, 6 - up, 6, color); px(ctx, 4, 4 - up, 2, 2, PAL.linenHi); px(ctx, 10, 3 - up, 2, 2, PAL.linenHi);
        px(ctx, 5, 9 - up, 6, 7, '#F2EDE4'); e(6, 12); e(9, 12);
        px(ctx, 5, 16, 2, 2, '#E9DFC0'); px(ctx, 9, 16, 2, 2, '#E9DFC0');
        break;
      case 'squirrel':
        disc(ctx, 4, 8 - up, 4, color); disc(ctx, 3, 5 - up, 3, l);
        disc(ctx, 10, 12, 3.5, color); disc(ctx, 11, 8 - up, 2.6, color);
        px(ctx, 10, 5 - up, 1, 2, color); e(12, 8);
        px(ctx, 8, 15, 2, 2, d); px(ctx, 11, 15, 2, 2, d);
        break;
      case 'duck': case 'duckling': {
        const sm = shape === 'duckling' ? 0.7 : 1;
        disc(ctx, 8, 12, 5 * sm, color); disc(ctx, 11, 7 + (1 - sm) * 4 - up, 3 * sm, shape === 'duck' ? '#4F8A4A' : color);
        px(ctx, 13, 7 + (1 - sm) * 4 - up, 3, 2, '#E8A03A'); e(11, 6 + (1 - sm) * 4);
        px(ctx, 3, 11, 3, 2, d);
        break;
      }
      case 'hedgehog':
        disc(ctx, 7, 12 - up * 0.5, 5, d);
        for (let x = 3; x < 12; x += 2) px(ctx, x, 7 - up + (x % 4 ? 1 : 0), 2, 3, d);
        disc(ctx, 12, 12, 2.5, '#D9C9A0'); e(12, 11); px(ctx, 14, 12, 1, 1, PAL.inkDeep);
        break;
      case 'cat':
        disc(ctx, 8, 12 - up * 0.5, 4.5, color); disc(ctx, 8, 6 - up, 3.5, color);
        px(ctx, 5, 2 - up, 2, 2, color); px(ctx, 9, 2 - up, 2, 2, color); e(7, 6); e(9, 6);
        px(ctx, 12, 9, 3, 1, color); px(ctx, 14, 7, 1, 3, color);
        if (accent) px(ctx, 6, 9 - up, 4, 1, accent);
        break;
      case 'turtle':
        disc(ctx, 8, 11, 6, accent || '#8E7A4E'); px(ctx, 4, 8, 8, 1, shade(accent || '#8E7A4E', 0.3));
        disc(ctx, 13, 7 - up, 3, color); e(14, 6); px(ctx, 3, 15, 2, 2, color); px(ctx, 11, 15, 2, 2, color);
        px(ctx, 10, 2 - up, 6, 2, '#5F7FB5');
        break;
      case 'mole':
        disc(ctx, 8, 11 - up * 0.5, 5.5, color); disc(ctx, 12, 9 - up, 2.5, color);
        px(ctx, 14, 9 - up, 2, 2, accent || '#E07A9B'); e(11, 8);
        px(ctx, 4, 14, 3, 2, '#E9C9B0'); px(ctx, 10, 14, 3, 2, '#E9C9B0');
        px(ctx, 6, 3 - up, 6, 2, '#D9B47A');
        break;
      case 'pelican':
        disc(ctx, 7, 11 - up, 5, color); disc(ctx, 9, 4 - up, 2.5, color); e(9, 3);
        px(ctx, 11, 4 - up, 5, 2, accent || '#E8B83A'); px(ctx, 11, 6 - up, 4, 2, shade(accent || '#E8B83A', -0.15));
        px(ctx, 5, 16, 2, 2, '#E8A03A'); px(ctx, 8, 16, 2, 2, '#E8A03A');
        px(ctx, 2, 9 - up, 4, 3, '#5F7FB5');
        break;
      case 'snail':
        px(ctx, 1, 13, 14, 3, '#D9C9A0'); disc(ctx, 7, 9, 5, color); disc(ctx, 7, 9, 2.5, d);
        px(ctx, 12, 8 - up, 1, 5, '#D9C9A0'); e(12, 7);
        break;
      default: {
        // four-legged and upright animals: fox, deer, camel, sloth, capybara, monkey, bunny, otter, bear, lizard, toad
        const low = ['capybara', 'lizard', 'toad', 'otter'].includes(shape);
        const by = low ? 12 : 11;
        disc(ctx, 8, by - up, low ? 5 : 4.5, color);
        disc(ctx, low ? 12 : 8, low ? 9 - up : 5 - up, 3.5, color);
        const hx = low ? 12 : 8, hy = low ? 9 : 5;
        if (shape === 'fox') { px(ctx, 5, 0 - up, 2, 3, color); px(ctx, 10, 0 - up, 2, 3, color); px(ctx, 12, 12, 3, 3, l); }
        if (shape === 'bunny') { px(ctx, 6, -1 - up, 2, 4, color); px(ctx, 9, -1 - up, 2, 4, color); }
        if (shape === 'deer') { px(ctx, 5, 0 - up, 1, 3, PAL.woodShade); px(ctx, 10, 0 - up, 1, 3, PAL.woodShade); }
        if (shape === 'camel') { disc(ctx, 7, 7 - up, 3, d); px(ctx, 5, 14, 1, 4, d); px(ctx, 10, 14, 1, 4, d); }
        if (shape === 'bear' || shape === 'monkey') { disc(ctx, 5, 2 - up, 1.5, d); disc(ctx, 11, 2 - up, 1.5, d); }
        if (shape === 'monkey') px(ctx, 6, 4 - up, 4, 3, accent || '#E9C9B0');
        if (shape === 'sloth') { px(ctx, 6, 4 - up, 4, 2, l); px(ctx, 6, 4 - up, 1, 1, PAL.inkDeep); px(ctx, 9, 4 - up, 1, 1, PAL.inkDeep); }
        if (shape === 'lizard') px(ctx, 1, 13, 4, 1, color);
        if (shape !== 'sloth') { e(hx - 1, hy - 1); e(hx + 1, hy - 1); }
        px(ctx, 5, 15, 2, 2, d); px(ctx, 9, 15, 2, 2, d);
      }
    }
  });
}

// A little market stall in the jar's colours, 32 x 22.
export function jarStallSprite(color) {
  return sprite('jar_stall_' + color, 32, 22, ctx => {
    px(ctx, 2, 6, 2, 16, PAL.woodShade); px(ctx, 28, 6, 2, 16, PAL.woodShade);
    for (let x = 0; x < 32; x += 4) px(ctx, x, 2, 4, 6, x % 8 ? PAL.linenHi : color);
    px(ctx, 0, 8, 32, 1, PAL.woodShade);
    px(ctx, 1, 14, 30, 8, PAL.wood); px(ctx, 1, 14, 30, 1, PAL.woodHi);
  });
}

// Everything else in the jars, by kind. Sizes vary; feet sit on the bottom row.
export function jarThingSprite(kind, state = 0) {
  const sizes = { cactus: [14, 22], bigtree: [36, 44], fern: [16, 14], bigshroom: [20, 26], bamboo: [10, 30], lantern: [12, 20], cloud: [32, 14],
    sandcastle: [16, 16], bottle: [10, 8], igloo: [18, 14], swing: [16, 24], bouquet: [16, 14], steamer: [14, 12], telescope: [14, 18], star_bench: [28, 12],
    vine: [10, 30], dig: [12, 8], ring: [44, 40], dune: [30, 10], rink: [46, 12] };
  const [w, h] = sizes[kind] || [16, 16];
  return sprite(`jar_${kind}_${state}`, w, h, c => {
    switch (kind) {
      case 'cactus':
        px(c, 5, 3, 4, 19, '#5F9A4A'); px(c, 1, 9, 3, 6, '#5F9A4A'); px(c, 10, 6, 3, 7, '#5F9A4A'); px(c, 1, 14, 4, 2, '#5F9A4A'); px(c, 9, 12, 4, 2, '#5F9A4A');
        if (state) disc(c, 7, 3, 2, '#D9466A');
        break;
      case 'bigtree':
        px(c, 14, 20, 8, 24, PAL.woodShade); px(c, 16, 20, 4, 24, PAL.wood);
        disc(c, 18, 14, 16, '#3F6F3A'); disc(c, 18, 12, 13, '#4F8A4A');
        if (state) for (const [x, y] of [[10, 12], [24, 9], [18, 18], [27, 16]]) px(c, x, y, 3, 3, '#7A3A6A');
        break;
      case 'fern':
        for (let i = 0; i < 5; i++) px(c, 2 + i * 3, 4 + Math.abs(2 - i) * 2, 2, 10 - Math.abs(2 - i) * 2, i % 2 ? '#4F8A4A' : '#6FAF5B');
        break;
      case 'bigshroom':
        px(c, 7, 12, 6, 14, '#F2EDE4'); disc(c, 10, 9, 10, '#C9483A'); px(c, 1, 9, 18, 3, '#C9483A');
        for (const [x, y] of [[5, 5], [12, 3], [15, 8], [8, 9]]) px(c, x, y, 2, 2, PAL.linenHi);
        break;
      case 'bamboo':
        for (const x of [1, 6]) { px(c, x, 0, 3, 30, '#8DBA5C'); for (let y = 4; y < 30; y += 7) px(c, x, y, 3, 1, '#5E8A4A'); }
        px(c, 3, 6, 4, 2, '#6FAF5B');
        break;
      case 'lantern':
        px(c, 4, 12, 4, 8, '#9A958A'); px(c, 1, 9, 10, 3, '#8A8378'); px(c, 3, 4, 6, 5, '#9A958A'); px(c, 5, 5, 2, 3, '#F2C46A'); px(c, 2, 2, 8, 2, '#8A8378');
        break;
      case 'cloud':
        disc(c, 8, 8, 6, '#E9E6F2'); disc(c, 16, 6, 7, '#F2F0F8'); disc(c, 25, 8, 6, '#E9E6F2'); px(c, 4, 9, 26, 5, '#E9E6F2');
        break;
      case 'sandcastle':
        if (state >= 1) px(c, 1, 10, 14, 6, '#D5C08A');
        if (state >= 2) { px(c, 2, 5, 4, 5, '#E3CC94'); px(c, 10, 5, 4, 5, '#E3CC94'); px(c, 6, 7, 4, 3, '#E3CC94'); }
        if (state >= 3) { px(c, 6, 1, 4, 6, '#E9D7A8'); px(c, 8, 0, 1, 2, PAL.woodShade); px(c, 9, 0, 3, 2, '#D9533C'); }
        if (!state) { px(c, 4, 12, 8, 3, '#D5C08A'); px(c, 6, 11, 1, 1, PAL.woodShade); }
        break;
      case 'bottle':
        px(c, 1, 3, 7, 4, '#9FD3C0'); px(c, 8, 4, 2, 2, '#B88D60'); px(c, 3, 4, 3, 2, PAL.linenHi);
        break;
      case 'igloo':
        disc(c, 9, 13, 9, '#F2FAFF'); px(c, 0, 13, 18, 1, '#C5D3D8'); px(c, 6, 8, 6, 6, '#3A4652');
        for (let y = 6; y < 13; y += 3) px(c, 1, y, 16, 1, '#DCE6EA');
        break;
      case 'swing':
        px(c, 1, 0, 14, 2, '#6FAF5B'); for (const x of [2, 6, 11]) px(c, x, 0, 2, 2, '#E07A9B');
        px(c, 3, 2, 1, 16, PAL.woodShade); px(c, 12, 2, 1, 16, PAL.woodShade); px(c, 2, 18, 12, 2, PAL.wood);
        break;
      case 'bouquet':
        px(c, 1, 6, 14, 2, PAL.wood); px(c, 2, 8, 2, 6, PAL.woodShade); px(c, 12, 8, 2, 6, PAL.woodShade);
        px(c, 6, 2, 4, 4, '#E07A9B'); px(c, 5, 3, 1, 2, '#F0DA4A'); px(c, 10, 3, 1, 2, '#B9C9F2');
        break;
      case 'steamer':
        disc(c, 7, 9, 6, '#8A8378'); disc(c, 7, 8, 4, '#5A5550');
        if (state % 2) { px(c, 4, 0, 2, 4, 'rgba(255,255,255,0.7)'); px(c, 8, 1, 2, 3, 'rgba(255,255,255,0.6)'); }
        break;
      case 'telescope':
        px(c, 6, 10, 1, 8, PAL.woodShade); px(c, 3, 17, 8, 1, PAL.woodShade); px(c, 3, 12, 1, 6, PAL.woodShade); px(c, 10, 12, 1, 6, PAL.woodShade);
        for (let i = 0; i < 9; i++) px(c, 2 + i, 9 - Math.floor(i * 0.8), 3, 3, i > 6 ? '#3F5A7A' : '#B5853A');
        break;
      case 'star_bench':
        px(c, 1, 3, 26, 3, PAL.wood); px(c, 1, 7, 26, 2, PAL.wood); px(c, 3, 9, 2, 3, PAL.woodShade); px(c, 23, 9, 2, 3, PAL.woodShade);
        break;
      case 'vine':
        for (let y = 0; y < 26; y++) px(c, 4 + Math.round(Math.sin(y / 4) * 2), y, 2, 1, '#4F8A4A');
        px(c, 1, 8, 3, 2, '#6FAF5B'); px(c, 6, 16, 3, 2, '#6FAF5B'); px(c, 2, 26, 6, 3, PAL.wood);
        break;
      case 'dig':
        px(c, 1, 1, 2, 2, '#8A5A3A'); px(c, 9, 1, 2, 2, '#8A5A3A'); px(c, 3, 3, 2, 2, '#8A5A3A'); px(c, 7, 3, 2, 2, '#8A5A3A'); px(c, 5, 4, 2, 1, '#8A5A3A');
        px(c, 3, 5, 2, 2, '#8A5A3A'); px(c, 7, 5, 2, 2, '#8A5A3A'); px(c, 1, 7, 2, 1, '#8A5A3A'); px(c, 9, 7, 2, 1, '#8A5A3A');
        break;
      case 'ring':
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2, x = 22 + Math.cos(a) * 18, y = 20 + Math.sin(a) * 16;
          disc(c, x, y, 2.4, i % 2 ? '#E9C9D9' : '#D9533C'); px(c, x - 0.5, y + 1, 1, 2, PAL.linenHi);
        }
        break;
      case 'dune':
        for (let x = 0; x < 30; x++) px(c, x, 10 - Math.round(Math.sin((x / 30) * Math.PI) * 7), 1, 10, x % 5 ? '#E9C994' : '#D9B47A');
        break;
      case 'rink':
        px(c, 1, 2, 44, 9, '#C9E3EC'); px(c, 3, 3, 40, 1, '#F2FAFF'); px(c, 12, 6, 10, 1, '#F2FAFF'); px(c, 28, 8, 8, 1, '#F2FAFF');
        break;
    }
  });
}
