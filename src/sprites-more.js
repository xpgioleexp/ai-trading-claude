import { paintProp } from './prop-art.js';
import { paintSmallDecor, paintJarObject } from './world-props.js';
import { paintOutdoor } from './outdoor-art.js';

import { R, oval, line, box, plank, roof, paintTree } from './art-style.js';
import { paintCritter, paintResident } from './creature-art.js';
import { paintBug } from './collectible-art.js';
// Placeholder art for the couple places, the animals and the 50 decorations.
// Same rules as sprites.js: a PNG in assets/manifest.json with the same name replaces any of these.
import { PAL, px, sprite } from './sprites.js';
import { OUTDOOR_BY_TYPE, FLAT_OUTDOOR } from './outdoor-data.js';

// ---------- places ----------

export function boardSprite(hasNew) {
  return sprite('board_' + (hasNew ? 'new' : 'plain'), 18, 26, (ctx) => {
    plank(ctx, 2, 12, 2, 14, PAL.woodShade);
    plank(ctx, 14, 12, 2, 14, PAL.woodShade);
    box(ctx, 0, 2, 18, 15, PAL.woodShade);
    R(ctx, 2, 4, 12, 10, '#C9A272');
    R(ctx, 2, 4, 12, 1, PAL.woodHi);
    for (const [x, y, w, h] of [
      [3, 6, 5, 6],
      [9, 7, 5, 7],
    ]) {
      R(ctx, x + 1, y + 1, w, h, PAL.woodShade);
      R(ctx, x, y, w, h, PAL.linenHi);
      R(ctx, x + 1, y + 2, w - 2, 1, PAL.linenShade);
      R(ctx, x + 1, y + h - 2, w - 3, 1, PAL.linenShade);
      R(ctx, x + 2, y - 1, 1, 2, PAL.rose);
    }
    if (hasNew) {
      box(ctx, 13, 0, 4, 4, '#C68F89');
      R(ctx, 14, 1, 1, 1, PAL.roseHi);
    }
  });
}

export function wellSprite(lights) {
  return sprite('well_' + lights, 20, 28, (ctx) => {
    plank(ctx, 2, 6, 2, 16, PAL.woodShade);
    plank(ctx, 16, 6, 2, 16, PAL.woodShade);
    roof(ctx, 0, 0, 20, 7, PAL.rose);
    plank(ctx, 4, 10, 12, 2, PAL.wood);
    line(ctx, 10, 12, 10, 19, PAL.woodShade);
    box(ctx, 8, 15, 4, 4, PAL.woodHi);
    oval(ctx, 10, 23, 9, 4, PAL.stoneShade);
    R(ctx, 1, 20, 18, 4, PAL.stone);
    R(ctx, 2, 24, 15, 1, PAL.stoneShade);
    for (const [x, y] of [
      [3, 21],
      [8, 23],
      [13, 21],
    ]) {
      R(ctx, x, y, 4, 1, PAL.stoneHi);
      R(ctx, x + 4, y, 1, 2, PAL.stoneShade);
    }
    oval(ctx, 10, 20, 9, 3, PAL.stoneHi);
    oval(ctx, 10, 20, 6, 2, PAL.stoneShade);
    oval(ctx, 10, 20, 5, 1, '#2F3E44');
    for (let i = 0; i < lights; i++) {
      oval(ctx, 7 + i * 6, 19, 1, 1, '#FFE7A8');
      R(ctx, 7 + i * 6, 18, 1, 1, PAL.linenHi);
    }
  });
}

export function picnicSprite() {
  return sprite('picnic', 32, 14, (ctx) => {
    for (let y = 0; y < 12; y++) {
      for (let x = 0; x < 32; x++) {
        const on = (Math.floor(x / 4) + Math.floor(y / 4)) % 2;
        px(ctx, x, y + 2, 1, 1, on ? PAL.rose : PAL.linenHi);
      }
    }
    px(ctx, 0, 13, 32, 1, PAL.roseShade);
    oval(ctx, 7, 2, 3, 2, PAL.woodShade);
    oval(ctx, 7, 2, 2, 1, PAL.linenHi);
    box(ctx, 3, 3, 9, 6, PAL.wood);
    R(ctx, 4, 4, 6, 1, PAL.woodHi);
    for (const x of [5, 8]) R(ctx, x, 5, 1, 3, PAL.woodShade);
    R(ctx, 4, 6, 7, 1, PAL.woodHi);
    box(ctx, 22, 3, 4, 4, PAL.linen);
    R(ctx, 23, 3, 2, 1, PAL.woodShade);
    R(ctx, 26, 4, 1, 2, PAL.linen);
  });
}

export function easelSprite() {
  return sprite('easel', 16, 26, (ctx) => {
    line(ctx, 5, 12, 2, 25, PAL.woodShade, 2);
    line(ctx, 10, 12, 13, 25, PAL.woodShade, 2);
    plank(ctx, 7, 3, 2, 22, PAL.wood);
    box(ctx, 1, 2, 14, 14, PAL.woodShade);
    R(ctx, 2, 3, 11, 11, PAL.linenHi);
    R(ctx, 2, 3, 11, 2, PAL.rose);
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 4; c++)
        px(ctx, 2 + c * 3, 6 + r * 3, 2, 2, r === 1 && c === 2 ? '#D9533C' : PAL.linenShade);
    plank(ctx, 0, 16, 16, 2, PAL.wood);
  });
}

// ---------- animals ----------

// frame: 0/1 movement, sleeping draws closed eyes. Frog and turtle swim when inWater.
export function animalSprite(species, frame, sleeping, inWater) {
  const key = `animal_${species}_${frame}_${sleeping ? 1 : 0}_${inWater ? 1 : 0}`;
  const size = { frog: [14, 12], turtle: [16, 12], snail: [14, 11], marimo: [12, 12] }[species];
  return sprite(key, size[0], size[1], (c) => paintResident(c, species, frame, sleeping, inWater));
}

export function noteSprite() {
  return sprite('fx_note', 6, 8, (ctx) => paintProp(ctx, 'note', 6, 8, 0));
}

export function bubbleSprite() {
  return sprite('fx_bubble', 6, 6, (ctx) => paintProp(ctx, 'bubble', 6, 6, 0));
}

export function sparkleSprite() {
  return sprite('fx_sparkle', 7, 7, (ctx) => paintProp(ctx, 'sparkle', 7, 7, 0));
}

export function zzzSprite() {
  return sprite('fx_zzz', 6, 6, (ctx) => paintProp(ctx, 'zzz', 6, 6, 0));
}

// ---------- decorations ----------

// Decorations that lie flat on the ground can be walked over.
const FLAT_BASE = new Set([
  'pathstone',
  'pathwood',
  'picnic',
  'moss',
  'clover',
  'puddle',
  'lilypad',
  'waterbowl',
]);
// Flat decorations you can walk over. Outdoor pieces can be added later (catalog-data.js), so check them live.
export const FLAT_DECOR = { has: (type) => FLAT_BASE.has(type) || FLAT_OUTDOOR.includes(type) };

const TREE_SIZE = [24, 34];

function tree(ctx, kind, season) {
  paintTree(ctx, 24, 34, { kind, season });
}

function drawDecor(ctx, type, season) {
  if (['pine', 'oak', 'birch', 'willow', 'cherry', 'sapling'].includes(type))
    return tree(ctx, type, season);
  return paintSmallDecor(ctx, type, ctx.canvas.width, ctx.canvas.height, season);
}

// Farm buildings and fruit trees.
const FRUIT_COLOR = {
  tree_pear: '#C9C25A',
  tree_plum: '#7A3A6A',
  tree_lemon: '#F0DA4A',
  tree_mango: '#F0A040',
  tree_banana: '#F0DA6A',
};

function drawFarm(c, type) {
  if (type.startsWith('tree_'))
    return paintTree(c, 24, 34, { season: 'summer', fruit: true, fruitColor: FRUIT_COLOR[type] });
  return paintSmallDecor(c, type);
}

// Outdoor crafts, drawn from their form and two colours (see outdoor-data.js).
const TALL_OUTDOOR = new Set([
  'lamppost',
  'torch',
  'lanternpost',
  'stringpole',
  'scarecrow',
  'arch',
  'heartarch',
  'signpost',
  'flag',
  'windmill',
  'chime',
  'totem',
  'feeder',
]);

function drawOutdoor(c, def, w, h) {
  return paintOutdoor(c, def, w, h);
}

export function decorSprite(type, season) {
  const od = OUTDOOR_BY_TYPE[type];
  if (od) {
    const h = TALL_OUTDOOR.has(od.form) ? 28 : 16;
    return sprite('decor_' + type, 16, h, (ctx) => drawOutdoor(ctx, od, 16, h));
  }
  if (type.startsWith('tree_') && FRUIT_COLOR[type])
    return sprite('decor_' + type, TREE_SIZE[0], TREE_SIZE[1], (ctx) => drawFarm(ctx, type));
  if (['coop', 'goat_pen', 'bee_box', 'mushroom_log'].includes(type))
    return sprite('decor_' + type, 16, 16, (ctx) => drawFarm(ctx, type));
  const isTree = ['pine', 'oak', 'birch', 'willow', 'cherry', 'sapling'].includes(type);
  const seasonal = isTree;
  const [w, h] = isTree ? TREE_SIZE : [16, 16];
  return sprite(`decor_${type}${seasonal ? '_' + season : ''}`, w, h, (ctx) =>
    drawDecor(ctx, type, season),
  );
}

// ---------- bugs ----------

export function bugSprite(kind, color, frame) {
  return sprite(`bug_${kind}_${color}_${frame}`, 10, 8, (ctx) =>
    paintBug(ctx, kind, color, frame, 10, 8),
  );
}

// ---------- the other jars ----------

export function doorSprite() {
  return sprite('jar_door', 16, 26, (ctx) => paintProp(ctx, 'door', 16, 26, 0));
}

export function palmSprite(hasFruit) {
  return sprite('palm_' + (hasFruit ? 1 : 0), 32, 44, (ctx) =>
    paintProp(ctx, 'palm', 32, 44, hasFruit),
  );
}

export function hiveSprite(hasHoney) {
  return sprite('hive_' + (hasHoney ? 1 : 0), 16, 24, (ctx) =>
    paintProp(ctx, 'hive', 16, 24, hasHoney),
  );
}

export function pineSprite() {
  return sprite('snow_pine', 20, 32, (c) =>
    paintTree(c, 20, 32, { kind: 'pine', season: 'winter' }),
  );
}

export function snowmanSprite() {
  return sprite('snowman', 16, 24, (ctx) => paintProp(ctx, 'snowman', 16, 24, 0));
}

export function archSprite() {
  return sprite('rose_arch', 32, 32, (ctx) => paintProp(ctx, 'rose_arch', 32, 32, 0));
}

// ---------- visitors and the merchant ----------

// An upright little animal visitor, 16 x 20. frame 1 bobs up a pixel.
export function visitorSprite(species, color, frame) {
  return sprite(`visitor_${species}_${frame}`, 16, 20, (c) => {
    paintCritter(c, species, color, PAL.linen, frame);
    box(c, 4, 11, 8, 6, PAL.leaf);
    R(c, 5, 12, 6, 1, PAL.leafHi);
    R(c, 8, 14, 1, 1, PAL.woodHi);
    R(c, 4, 18, 3, 2, PAL.woodShade);
    R(c, 9, 18, 3, 2, PAL.woodShade);
  });
}

export function requestMarkSprite() {
  return sprite('request_mark', 7, 9, (ctx) => paintProp(ctx, 'request', 7, 9, 0));
}

// The traveling merchant in a hooded cloak with a big pack, 20 x 26.
export function merchantSprite(frame) {
  return sprite('merchant_' + frame, 20, 26, (ctx) => paintProp(ctx, 'merchant', 20, 26, frame));
}

// The rug the merchant lays goods out on, 32 x 16, drawn flat on the ground.
export function merchantRugSprite() {
  return sprite('merchant_rug', 32, 16, (ctx) => paintProp(ctx, 'merchant_rug', 32, 16, 0));
}

// ---------- seasonal events ----------

// The little striped stand where events are run, 24 x 28.
export function eventStandSprite() {
  return sprite('event_stand', 24, 28, (ctx) => paintProp(ctx, 'event_stand', 24, 28, 0));
}

// ---------- the biome jars ----------

// The animals who live in the jars, and the shopkeepers. 16 x 18, two frames.
export function critterSprite(shape, color, accent, frame) {
  return sprite(`critter_${shape}_${color}_${accent || ''}_${frame}`, 16, 18, (c) =>
    paintCritter(c, shape, color, accent, frame),
  );
}

export function jarStallSprite(color) {
  return sprite('jar_stall_' + color, 32, 22, (ctx) => paintProp(ctx, 'jar_stall', 32, 22, color));
}

// Everything else in the jars, by kind. Sizes vary; feet sit on the bottom row.
export function jarThingSprite(kind, state = 0) {
  const sizes = {
    cactus: [14, 22],
    bigtree: [36, 44],
    fern: [16, 14],
    bigshroom: [20, 26],
    bamboo: [10, 30],
    lantern: [12, 20],
    cloud: [32, 14],
    sandcastle: [16, 16],
    bottle: [10, 8],
    igloo: [18, 14],
    swing: [16, 24],
    bouquet: [16, 14],
    steamer: [14, 12],
    telescope: [14, 18],
    star_bench: [28, 12],
    vine: [10, 30],
    dig: [12, 8],
    ring: [44, 40],
    dune: [30, 10],
    rink: [46, 12],
  };
  const [w, h] = sizes[kind] || [16, 16];
  return sprite(`jar_${kind}_${state}`, w, h, (c) => paintJarObject(c, kind, w, h, state));
}
