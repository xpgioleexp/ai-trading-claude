// The jar shelf's biomes. Each jar has only a few things, each done properly:
// two animals who live there, one shopkeeper with a small stock, and two
// special spots. Data and pure rules; jar-life.js does the panels.
import { ITEMS } from './data.js';
import { MAPS, addMap } from './maps.js';
import { ROWS } from './world.js';
import { JAR_WEST, JAR_COLS, JAR_NORTH, JAR_SOUTH, addJarRegions } from './jar-regions.js';
import { addBugs } from './bugs.js';
import { FURNITURE, FURNITURE_BY_TYPE } from './home.js';
import { rngFor, shuffle } from './rng.js';
import { addItem, removeItem, countItem, bagFull, waterBed, bedOpen } from './rules.js';
import { healOf } from './mine-data.js';
import './farm-data.js';

// ---------- new items ----------

// [id, name, cat, shape, color, price, extra]
const ITEM_ROWS = [
  ['sea_salt', 'Sea salt', 'pantry', 'crystal', '#F2F4F6', 10, { tags: ['spice'] }],
  ['shell_necklace', 'Shell necklace', 'gift', 'button', '#F2E4D0', 60],
  ['wool_mittens', 'Wool mittens', 'gift', 'leaf', '#C9485A', 50],
  ['perfume', 'Rose perfume', 'gift', 'bottle', '#E07A9B', 70],
  ['saffron', 'Saffron', 'pantry', 'flower', '#E8603A', 30, { tags: ['spice'] }],
  ['dates', 'Dates', 'produce', 'berry', '#8A5A3A', 20, { tags: ['fruit', 'sweet'] }],
  ['coffee_bean', 'Coffee beans', 'pantry', 'seed', '#5A3A2A', 25, { tags: ['coffee'] }],
  ['matcha', 'Matcha', 'pantry', 'leaf', '#7FAF5B', 30, { tags: ['tea'] }],
  ['healing_tonic', 'Healing tonic', 'potion', 'bottle', '#D9533C', 60, { heal: 60, text: 'Heals 60 health.' }],
  ['lucky_brew', 'Lucky brew', 'potion', 'bottle', '#7FC95A', 80, { use: 'luck', text: 'Five extra fishing bites today, wherever you fish.' }],
  ['garden_tonic', 'Garden tonic', 'potion', 'bottle', '#5FA8C9', 70, { use: 'garden', text: 'Waters every open garden bed right now.' }],
  ['onsen_egg', 'Onsen egg', 'dish', 'dish', '#F2E8C8', 30],
  ['moon_pie', 'Moon pie', 'dish', 'dish', '#E9DFC0', 50],
  ['wish_charm', 'Wish charm', 'gift', 'crystal', '#F2E48A', 120],
  ['scarab_charm', 'Scarab charm', 'artifact', 'gem', '#3FA8A0', 160],
  ['message_bottle', 'Message in a bottle', 'junk', 'bottle', '#9FD3C0', 15],
];
for (const [id, name, cat, shape, color, price, extra] of ITEM_ROWS) ITEMS[id] = { id, name, cat, shape, color, price, ...(extra || {}) };

// ---------- the new jars ----------

// Fish: [id, name, colour, rarity, size cm, price, difficulty]. Forage: [id, name, shape, colour, price, rare, tags].
const NEW_JARS = [
  {
    map: {
      id: 'desert', name: 'Desert oasis', price: 900, season: 'summer', ground: 'dune', weather: 'sun', soil: '#C9A26A', digs: 3,
      blurb: 'Warm dunes around a palm-shaded pool. Dig for treasure and watch the sunset.',
      objects: [
        { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
        { id: 'water', kind: 'oasis', name: 'The oasis', c: 7, r: 4, w: 4, h: 3 },
        { id: 'date_palm1', kind: 'palm', name: 'Date palm', c: 6, r: 3, w: 1, h: 1, fruit: 'dates' },
        { id: 'date_palm2', kind: 'palm', name: 'Date palm', c: 11, r: 7, w: 1, h: 1, fruit: 'dates' },
        { id: 'cactus1', kind: 'cactus', name: 'Cactus', c: 3, r: 2, w: 1, h: 1, fruit: 'cactus_fruit' },
        { id: 'cactus2', kind: 'cactus', name: 'Cactus', c: 14, r: 2, w: 1, h: 1, fruit: 'cactus_fruit' },
        { id: 'cactus3', kind: 'cactus', name: 'Cactus', c: 4, r: 10, w: 1, h: 1 },
        { id: 'shop', kind: 'shop', name: 'Caravan', c: 1, r: 8, w: 2, h: 1 },
        { id: 'dune', kind: 'spot', spot: 'sunset', name: 'Sunset dune', c: 13, r: 5, w: 2, h: 1, walkable: true },
      ],
    },
    fish: [
      ['pupfish', 'Desert pupfish', '#5F8AC9', 'common', [3, 7], 30, 2],
      ['oasis_catfish', 'Oasis catfish', '#8A7A5A', 'uncommon', [30, 70], 90, 3],
      ['mirage_fish', 'Mirage fish', '#F2D0A0', 'rare', [20, 40], 240, 5],
    ],
    forage: [
      ['desert_rose', 'Desert rose', 'flower', '#E8A0A0', 35],
      ['cactus_fruit', 'Cactus fruit', 'berry', '#D9466A', 30, false, ['fruit']],
      ['dry_sage', 'Desert sage', 'leaf', '#A9B29A', 25, false, ['herb']],
    ],
    bugs: [
      { id: 'scarab', name: 'Scarab beetle', kind: 'beetle', color: '#3FA8A0', map: 'desert', time: 'day', where: 'ground', rarity: 'uncommon', price: 90, skittish: 0.5 },
      { id: 'sand_moth', name: 'Sand moth', kind: 'butterfly', color: '#D9C9A0', map: 'desert', time: 'night', where: 'flower', rarity: 'common', price: 40, skittish: 0.5 },
    ],
  },
  {
    map: {
      id: 'rainforest', name: 'Rainforest', price: 1200, season: 'summer', ground: 'jungle', weather: 'rain', soil: '#4A3A2A',
      blurb: 'Warm rain, a waterfall pool and a huge old tree. Swing on the vines.',
      objects: [
        { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
        { id: 'falls', kind: 'spot', spot: 'waterfall', name: 'Waterfall', c: 12, r: 0, w: 3, h: 1 },
        { id: 'water', kind: 'falls', name: 'Waterfall pool', c: 11, r: 1, w: 5, h: 3 },
        { id: 'big_tree', kind: 'bigtree', name: 'Giant tree', c: 3, r: 1, w: 2, h: 2, fruit: 'passion_fruit' },
        { id: 'vine', kind: 'spot', spot: 'vine', name: 'Vine swing', c: 7, r: 2, w: 1, h: 1 },
        { id: 'fern1', kind: 'fern', name: 'Fern', c: 6, r: 9, w: 1, h: 1 },
        { id: 'fern2', kind: 'fern', name: 'Fern', c: 10, r: 8, w: 1, h: 1 },
        { id: 'fern3', kind: 'fern', name: 'Fern', c: 15, r: 6, w: 1, h: 1 },
        { id: 'shop', kind: 'shop', name: 'Fruit stand', c: 1, r: 8, w: 2, h: 1 },
      ],
    },
    fish: [
      ['neon_tetra', 'Neon tetra', '#5FC9E0', 'common', [2, 4], 35, 2],
      ['piranha', 'Piranha', '#C9583A', 'uncommon', [15, 30], 110, 4],
      ['arowana', 'Arowana', '#D9C25A', 'rare', [60, 120], 300, 5],
    ],
    forage: [
      ['orchid', 'Orchid', 'flower', '#C97AD9', 45],
      ['passion_fruit', 'Passion fruit', 'round', '#7A3A6A', 30, false, ['fruit']],
      ['cocoa_pod', 'Wild cocoa pod', 'pod', '#C9783A', 40, false, ['sweet']],
    ],
    bugs: [
      { id: 'atlas_moth', name: 'Atlas moth', kind: 'butterfly', color: '#C9683A', map: 'rainforest', time: 'night', where: 'tree', rarity: 'rare', price: 220, skittish: 0.6 },
      { id: 'glass_frog', name: 'Glass-wing butterfly', kind: 'butterfly', color: '#DCEEF7', map: 'rainforest', time: 'day', where: 'flower', rarity: 'uncommon', price: 110, skittish: 0.7 },
    ],
  },
  {
    map: {
      id: 'glade', name: 'Mushroom glade', price: 1500, season: 'autumn', ground: 'moss', weather: 'fog', soil: '#3A3428', dim: true,
      blurb: 'A misty, glowing hollow of giant mushrooms. Bounce, and make a wish in the fairy ring.',
      objects: [
        { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
        { id: 'water', kind: 'glow', name: 'Glowing pond', c: 11, r: 7, w: 4, h: 3 },
        { id: 'bounce', kind: 'spot', spot: 'bounce', name: 'Bouncy mushroom', c: 3, r: 2, w: 1, h: 1 },
        { id: 'shroom2', kind: 'bigshroom', name: 'Giant mushroom', c: 13, r: 2, w: 1, h: 1 },
        { id: 'shroom3', kind: 'bigshroom', name: 'Giant mushroom', c: 8, r: 10, w: 1, h: 1 },
        { id: 'ring', kind: 'spot', spot: 'fairy_ring', name: 'Fairy ring', c: 6, r: 5, w: 3, h: 3, walkable: true },
        { id: 'shop', kind: 'shop', name: 'Apothecary', c: 1, r: 9, w: 2, h: 1 },
      ],
    },
    fish: [
      ['glow_minnow', 'Glow minnow', '#B9F0C0', 'common', [3, 6], 40, 2],
      ['moss_carp', 'Moss carp', '#6F8A4A', 'uncommon', [30, 60], 100, 3],
      ['ghost_koi', 'Ghost koi', '#E9F2F6', 'rare', [40, 70], 280, 5],
    ],
    forage: [
      ['fairy_moss', 'Fairy moss', 'leaf', '#9FE0A0', 40],
      ['moonbell', 'Moonbell', 'flower', '#B9C9F2', 50],
      ['puffcap', 'Puffcap', 'mushroom', '#E9C9D9', 35, false, ['mushroom']],
    ],
    bugs: [
      { id: 'glow_beetle', name: 'Glow beetle', kind: 'firefly', color: '#B9F0C0', map: 'glade', time: null, where: 'ground', rarity: 'uncommon', price: 100, skittish: 0.4 },
      { id: 'fairy_fly', name: 'Fairy fly', kind: 'dragonfly', color: '#F2C4E0', map: 'glade', time: null, where: 'pond', rarity: 'rare', price: 200, skittish: 0.8 },
    ],
  },
  {
    map: {
      id: 'springs', name: 'Hot springs', price: 1800, season: 'winter', ground: 'winter', weather: 'snow', soil: '#6E6A66',
      blurb: 'A steaming spring in the snowy hills. Soak together and cook eggs in the steam.',
      objects: [
        { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
        { id: 'onsen', kind: 'spot', spot: 'hot_spring', name: 'Hot spring', c: 9, r: 2, w: 5, h: 3 },
        { id: 'steamer', kind: 'spot', spot: 'steamer', name: 'Steam vent', c: 6, r: 3, w: 1, h: 1 },
        { id: 'water', kind: 'pond', name: 'Mountain stream', c: 12, r: 8, w: 4, h: 3 },
        { id: 'bamboo1', kind: 'bamboo', name: 'Bamboo', c: 2, r: 1, w: 1, h: 1 },
        { id: 'bamboo2', kind: 'bamboo', name: 'Bamboo', c: 3, r: 1, w: 1, h: 1 },
        { id: 'bamboo3', kind: 'bamboo', name: 'Bamboo', c: 8, r: 9, w: 1, h: 1 },
        { id: 'stone_lantern', kind: 'lantern', name: 'Stone lantern', c: 15, r: 2, w: 1, h: 1 },
        { id: 'shop', kind: 'shop', name: 'Tea house', c: 1, r: 8, w: 2, h: 1 },
      ],
    },
    fish: [
      ['yamame', 'Yamame trout', '#C9B4A0', 'common', [15, 30], 45, 2],
      ['river_char', 'River char', '#D9806A', 'uncommon', [25, 50], 95, 3],
      ['golden_salamander', 'Golden salamander', '#E8B83A', 'rare', [10, 20], 260, 5],
    ],
    forage: [
      ['yuzu', 'Yuzu', 'round', '#F0DA4A', 30, false, ['fruit']],
      ['bamboo_shoot', 'Bamboo shoot', 'pod', '#C9C27A', 28, false, ['veg']],
      ['camellia', 'Camellia', 'flower', '#D9333C', 35],
    ],
    bugs: [
      { id: 'steam_cricket', name: 'Steam cricket', kind: 'small', color: '#C9C2B8', map: 'springs', time: null, where: 'ground', rarity: 'common', price: 45, skittish: 0.5 },
      { id: 'snow_firefly', name: 'Snow firefly', kind: 'firefly', color: '#DCEEF7', map: 'springs', time: 'night', where: 'pond', rarity: 'uncommon', price: 120, skittish: 0.5 },
    ],
  },
  {
    map: {
      id: 'stars', name: 'Starlight isle', price: 2500, season: 'spring', ground: 'cloud', weather: 'sun', night: true, soil: '#2A2546',
      blurb: 'A little island in the clouds where it\'s always night. Find constellations through the telescope.',
      objects: [
        { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
        { id: 'water', kind: 'moon', name: 'Moon pond', c: 6, r: 5, w: 5, h: 3 },
        { id: 'telescope', kind: 'spot', spot: 'telescope', name: 'Telescope', c: 13, r: 4, w: 1, h: 1 },
        { id: 'bench', kind: 'spot', spot: 'star_bench', name: 'Stargazing bench', c: 7, r: 1, w: 2, h: 1 },
        { id: 'cloud1', kind: 'cloud', name: 'Cloud', c: 3, r: 2, w: 2, h: 1 },
        { id: 'cloud2', kind: 'cloud', name: 'Cloud', c: 12, r: 1, w: 3, h: 1 },
        { id: 'cloud3', kind: 'cloud', name: 'Cloud', c: 13, r: 9, w: 2, h: 1 },
        { id: 'shop', kind: 'shop', name: 'Night market', c: 1, r: 8, w: 2, h: 1 },
      ],
    },
    fish: [
      ['moon_jelly', 'Moon jelly', '#DCE6F2', 'common', [5, 15], 50, 2],
      ['star_carp', 'Star carp', '#F2E48A', 'uncommon', [25, 50], 130, 3],
      ['comet_fish', 'Comet fish', '#9C82C9', 'rare', [30, 60], 350, 5],
    ],
    forage: [
      ['star_petal', 'Star petal', 'flower', '#F2E48A', 55],
      ['moon_moss', 'Moon moss', 'leaf', '#B9C9E8', 45],
    ],
    bugs: [
      { id: 'star_beetle', name: 'Star beetle', kind: 'beetle', color: '#F2E48A', map: 'stars', time: null, where: 'ground', rarity: 'uncommon', price: 150, skittish: 0.5 },
      { id: 'comet_fly', name: 'Comet firefly', kind: 'firefly', color: '#C9B9F2', map: 'stars', time: null, where: 'flower', rarity: 'rare', price: 260, skittish: 0.7 },
    ],
  },
];
for (const j of NEW_JARS) {
  addMap(j.map, j.fish, j.forage);
  addBugs(j.bugs);
}

// The first three jars get a shop and two spots too.
const MORE_OBJECTS = {
  beach: [
    { id: 'shop', kind: 'shop', name: 'Shell shack', c: 7, r: 1, w: 2, h: 1 },
    { id: 'sandcastle', kind: 'spot', spot: 'sandcastle', name: 'Sandcastle spot', c: 8, r: 6, w: 1, h: 1 },
    { id: 'bottle', kind: 'spot', spot: 'bottle', name: 'The tideline', c: 14, r: 8, w: 1, h: 1, walkable: true },
  ],
  snow: [
    { id: 'shop', kind: 'shop', name: 'Cocoa cabin', c: 9, r: 1, w: 2, h: 1 },
    { id: 'rink', kind: 'spot', spot: 'rink', name: 'Ice rink', c: 6, r: 9, w: 3, h: 1, walkable: true },
    { id: 'igloo', kind: 'spot', spot: 'igloo', name: 'Igloo', c: 15, r: 5, w: 1, h: 1 },
  ],
  flower: [
    { id: 'shop', kind: 'shop', name: 'Bloom stall', c: 1, r: 8, w: 2, h: 1 },
    { id: 'swing', kind: 'spot', spot: 'swing', name: 'Flower swing', c: 6, r: 4, w: 1, h: 1 },
    { id: 'table', kind: 'spot', spot: 'bouquet', name: 'Bouquet table', c: 14, r: 3, w: 1, h: 1 },
  ],
};
for (const [id, objs] of Object.entries(MORE_OBJECTS)) {
  for (const o of objs) if (!MAPS[id].objects.some(x => x.id === o.id)) MAPS[id].objects.push(o);
}

// ---------- wider jars ----------

// Every jar is three screens wide, like the meadow: its west side, the jar as
// it was in the middle (door and all), and its east side.
// The sizes live in jar-regions.js, with the regions all around each jar.
export { JAR_WEST, JAR_COLS, JAR_NORTH, JAR_SOUTH };
// ...and taller: rows above the top of the screen and below the bottom.
const WIDE = {
  beach: [
    { id: 'palm_w1', kind: 'palm', name: 'Palm tree', c: -6, r: 2, fruit: 'coconut' },
    { id: 'palm_w2', kind: 'palm', name: 'Palm tree', c: -13, r: 6 },
    { id: 'water3', kind: 'pool', name: 'Rock pool', c: -10, r: 3, w: 3, h: 2 },
    { id: 'palm_e1', kind: 'palm', name: 'Palm tree', c: 22, r: 2, fruit: 'coconut' },
    { id: 'palm_e2', kind: 'palm', name: 'Palm tree', c: 30, r: 6 },
    { id: 'palm_e3', kind: 'palm', name: 'Palm tree', c: 26, r: 4 },
    { id: 'palm_n1', kind: 'palm', name: 'Palm tree', c: 3, r: -6, fruit: 'coconut' }, { id: 'palm_n2', kind: 'palm', name: 'Palm tree', c: -9, r: -4 },
    { id: 'palm_n3', kind: 'palm', name: 'Palm tree', c: 24, r: -7 }, { id: 'water4', kind: 'pool', name: 'Deep tide pool', c: 10, r: -6, w: 3, h: 2 },
  ],
  snow: [
    { id: 'pine_w1', kind: 'pine', name: 'Snowy pine', c: -14, r: 2 }, { id: 'pine_w2', kind: 'pine', name: 'Snowy pine', c: -9, r: 8 },
    { id: 'pine_w3', kind: 'pine', name: 'Snowy pine', c: -4, r: 1 }, { id: 'pine_e1', kind: 'pine', name: 'Snowy pine', c: 20, r: 3 },
    { id: 'pine_e2', kind: 'pine', name: 'Snowy pine', c: 31, r: 9 }, { id: 'pine_e3', kind: 'pine', name: 'Snowy pine', c: 30, r: 2 },
    { id: 'water3', kind: 'ice', name: 'Little frozen pond', c: 23, r: 5, w: 4, h: 3 },
    { id: 'pine_n1', kind: 'pine', name: 'Snowy pine', c: 2, r: -7 }, { id: 'pine_n2', kind: 'pine', name: 'Snowy pine', c: -11, r: -5 },
    { id: 'pine_n3', kind: 'pine', name: 'Snowy pine', c: 26, r: -6 }, { id: 'water4', kind: 'ice', name: 'High frozen lake', c: 9, r: -6, w: 4, h: 3 },
    { id: 'pine_s1', kind: 'pine', name: 'Snowy pine', c: 5, r: 16 }, { id: 'pine_s2', kind: 'pine', name: 'Snowy pine', c: -8, r: 18 },
    { id: 'pine_s3', kind: 'pine', name: 'Snowy pine', c: 22, r: 15 }, { id: 'pine_s4', kind: 'pine', name: 'Snowy pine', c: 30, r: 18 },
  ],
  flower: [
    { id: 'tree_w1', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: -12, r: 2 }, { id: 'tree_w2', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: -5, r: 9 },
    { id: 'fern_w1', kind: 'fern', name: 'Fern', c: -15, r: 9 }, { id: 'water3', kind: 'pond', name: 'Lotus pond', c: -10, r: 5, w: 4, h: 3 },
    { id: 'tree_e1', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: 21, r: 3 }, { id: 'tree_e2', kind: 'decotree', tree: 'willow', name: 'Willow', c: 29, r: 8 },
    { id: 'fern_e1', kind: 'fern', name: 'Fern', c: 25, r: 1 },
    { id: 'tree_n1', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: 4, r: -6 }, { id: 'tree_n2', kind: 'decotree', tree: 'willow', name: 'Willow', c: -10, r: -4 },
    { id: 'fern_n1', kind: 'fern', name: 'Fern', c: 22, r: -7 }, { id: 'water4', kind: 'pond', name: 'Lily stream', c: 11, r: 14, w: 4, h: 3 },
    { id: 'tree_s1', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: 3, r: 17 }, { id: 'tree_s2', kind: 'decotree', tree: 'cherry', name: 'Cherry tree', c: 27, r: 16 },
    { id: 'fern_s1', kind: 'fern', name: 'Fern', c: -12, r: 15 },
  ],
  desert: [
    { id: 'cactus_w1', kind: 'cactus', name: 'Cactus', c: -14, r: 3, fruit: 'cactus_fruit' }, { id: 'cactus_w2', kind: 'cactus', name: 'Cactus', c: -7, r: 9 },
    { id: 'water3', kind: 'oasis', name: 'Small oasis', c: -10, r: 5, w: 3, h: 2 }, { id: 'palm_w1', kind: 'palm', name: 'Date palm', c: -11, r: 4, fruit: 'dates' },
    { id: 'cactus_e1', kind: 'cactus', name: 'Cactus', c: 21, r: 2 }, { id: 'cactus_e2', kind: 'cactus', name: 'Cactus', c: 28, r: 8, fruit: 'cactus_fruit' },
    { id: 'palm_e1', kind: 'palm', name: 'Date palm', c: 25, r: 4, fruit: 'dates' },
    { id: 'cactus_n1', kind: 'cactus', name: 'Cactus', c: 3, r: -6, fruit: 'cactus_fruit' }, { id: 'cactus_n2', kind: 'cactus', name: 'Cactus', c: -12, r: -3 },
    { id: 'cactus_n3', kind: 'cactus', name: 'Cactus', c: 26, r: -7 }, { id: 'water4', kind: 'oasis', name: 'Hidden oasis', c: 12, r: 15, w: 3, h: 2 },
    { id: 'palm_s1', kind: 'palm', name: 'Date palm', c: 11, r: 14, fruit: 'dates' }, { id: 'cactus_s1', kind: 'cactus', name: 'Cactus', c: -6, r: 17 },
    { id: 'cactus_s2', kind: 'cactus', name: 'Cactus', c: 29, r: 16, fruit: 'cactus_fruit' },
  ],
  rainforest: [
    { id: 'bigtree_w', kind: 'bigtree', name: 'Giant tree', c: -12, r: 1, w: 2, h: 2, fruit: 'passion_fruit' },
    { id: 'fern_w1', kind: 'fern', name: 'Fern', c: -6, r: 4 }, { id: 'fern_w2', kind: 'fern', name: 'Fern', c: -15, r: 8 }, { id: 'fern_w3', kind: 'fern', name: 'Fern', c: -3, r: 10 },
    { id: 'water3', kind: 'falls', name: 'Jungle pool', c: 24, r: 6, w: 4, h: 3 },
    { id: 'fern_e1', kind: 'fern', name: 'Fern', c: 20, r: 2 }, { id: 'fern_e2', kind: 'fern', name: 'Fern', c: 31, r: 3 },
    { id: 'bigtree_e', kind: 'bigtree', name: 'Giant tree', c: 28, r: 0, w: 2, h: 2 },
    { id: 'bigtree_n', kind: 'bigtree', name: 'Giant tree', c: 4, r: -7, w: 2, h: 2, fruit: 'passion_fruit' },
    { id: 'fern_n1', kind: 'fern', name: 'Fern', c: -8, r: -5 }, { id: 'fern_n2', kind: 'fern', name: 'Fern', c: 23, r: -3 },
    { id: 'water4', kind: 'falls', name: 'River pool', c: 10, r: 14, w: 4, h: 3 },
    { id: 'fern_s1', kind: 'fern', name: 'Fern', c: 2, r: 17 }, { id: 'fern_s2', kind: 'fern', name: 'Fern', c: -13, r: 15 },
    { id: 'bigtree_s', kind: 'bigtree', name: 'Giant tree', c: 26, r: 16, w: 2, h: 2 },
  ],
  glade: [
    { id: 'shroom_w1', kind: 'bigshroom', name: 'Giant mushroom', c: -14, r: 2 }, { id: 'shroom_w2', kind: 'bigshroom', name: 'Giant mushroom', c: -6, r: 8 },
    { id: 'shroom_e1', kind: 'bigshroom', name: 'Giant mushroom', c: 22, r: 3 }, { id: 'shroom_e2', kind: 'bigshroom', name: 'Giant mushroom', c: 30, r: 9 },
    { id: 'water3', kind: 'glow', name: 'Glowing pool', c: 25, r: 5, w: 3, h: 3 }, { id: 'fern_w1', kind: 'fern', name: 'Fern', c: -10, r: 4 },
    { id: 'shroom_n1', kind: 'bigshroom', name: 'Giant mushroom', c: 3, r: -6 }, { id: 'shroom_n2', kind: 'bigshroom', name: 'Giant mushroom', c: -11, r: -4 },
    { id: 'fern_n1', kind: 'fern', name: 'Fern', c: 24, r: -7 }, { id: 'water4', kind: 'glow', name: 'Deep glow pool', c: 10, r: 15, w: 3, h: 3 },
    { id: 'shroom_s1', kind: 'bigshroom', name: 'Giant mushroom', c: 2, r: 17 }, { id: 'shroom_s2', kind: 'bigshroom', name: 'Giant mushroom', c: 28, r: 15 },
  ],
  springs: [
    { id: 'bamboo_w1', kind: 'bamboo', name: 'Bamboo', c: -15, r: 1 }, { id: 'bamboo_w2', kind: 'bamboo', name: 'Bamboo', c: -14, r: 1 },
    { id: 'bamboo_w3', kind: 'bamboo', name: 'Bamboo', c: -8, r: 9 }, { id: 'lantern_w', kind: 'lantern', name: 'Stone lantern', c: -4, r: 3 },
    { id: 'bamboo_e1', kind: 'bamboo', name: 'Bamboo', c: 24, r: 2 }, { id: 'lantern_e', kind: 'lantern', name: 'Stone lantern', c: 20, r: 8 },
    { id: 'water3', kind: 'pond', name: 'Koi stream', c: 27, r: 4, w: 4, h: 3 },
    { id: 'bamboo_n1', kind: 'bamboo', name: 'Bamboo', c: 2, r: -7 }, { id: 'bamboo_n2', kind: 'bamboo', name: 'Bamboo', c: 3, r: -7 },
    { id: 'lantern_n', kind: 'lantern', name: 'Stone lantern', c: 14, r: -4 }, { id: 'water4', kind: 'spring', name: 'Mountain spring', c: -9, r: -6, w: 4, h: 3 },
    { id: 'bamboo_s1', kind: 'bamboo', name: 'Bamboo', c: 6, r: 17 }, { id: 'lantern_s', kind: 'lantern', name: 'Stone lantern', c: 21, r: 15 },
    { id: 'bamboo_s2', kind: 'bamboo', name: 'Bamboo', c: -12, r: 16 },
  ],
  stars: [
    { id: 'cloud_w1', kind: 'cloud', name: 'Cloud', c: -13, r: 2, w: 2 }, { id: 'cloud_w2', kind: 'cloud', name: 'Cloud', c: -6, r: 9, w: 3 },
    { id: 'cloud_e1', kind: 'cloud', name: 'Cloud', c: 21, r: 3, w: 2 }, { id: 'cloud_e2', kind: 'cloud', name: 'Cloud', c: 29, r: 8, w: 3 },
    { id: 'water3', kind: 'moon', name: 'Moon pool', c: -10, r: 5, w: 4, h: 3 },
    { id: 'cloud_n1', kind: 'cloud', name: 'Cloud', c: 3, r: -6, w: 2 }, { id: 'cloud_n2', kind: 'cloud', name: 'Cloud', c: -11, r: -4, w: 3 },
    { id: 'cloud_n3', kind: 'cloud', name: 'Cloud', c: 24, r: -7, w: 2 }, { id: 'water4', kind: 'moon', name: 'Comet pool', c: 12, r: 15, w: 4, h: 3 },
    { id: 'cloud_s1', kind: 'cloud', name: 'Cloud', c: -6, r: 17, w: 3 }, { id: 'cloud_s2', kind: 'cloud', name: 'Cloud', c: 27, r: 16, w: 2 },
  ],
};
for (const [id, extras] of Object.entries(WIDE)) {
  const map = MAPS[id];
  if (!map || map.west) continue;
  map.west = JAR_WEST;
  map.cols = JAR_COLS;
  map.north = JAR_NORTH;
  map.south = JAR_SOUTH;
  // The sea runs the whole width of the beach, and all the way down.
  for (const o of map.objects) if (o.kind === 'sea') { o.c = -JAR_WEST; o.w = JAR_WEST + JAR_COLS; o.h = ROWS + JAR_SOUTH - o.r; }
  for (const o of extras) map.objects.push({ w: 1, h: 1, ...o });
}
addJarRegions(MAPS);

// ---------- furniture from the jar shops and the animals ----------

const SHOP_FURNITURE = [
  { type: 'surfboard', name: 'Surfboard', price: 180, w: 1, h: 1 },
  { type: 'snow_globe', name: 'Snow globe', price: 160, w: 1, h: 1 },
  { type: 'trellis', name: 'Flower trellis', price: 150, w: 1, h: 1 },
  { type: 'brass_lantern', name: 'Brass lantern', price: 170, w: 1, h: 1 },
  { type: 'hammock', name: 'Hammock', price: 220, w: 2, h: 1, use: 'sit' },
  { type: 'spore_lamp', name: 'Spore lamp', price: 160, w: 1, h: 1 },
  { type: 'paper_screen', name: 'Paper screen', price: 150, w: 2, h: 1 },
  { type: 'star_lamp', name: 'Star lamp', price: 240, w: 1, h: 1 },
];

// ---------- the animals ----------

// shape: the placeholder body (see critterSprite). likes: favourite treats.
// gifts: what they give you on a 3-heart day. Each has a plush keepsake at 5 hearts.
export const CRITTERS = [
  { id: 'pinch', name: 'Pinch', species: 'crab', jar: 'beach', shape: 'crab', color: '#D9603A', likes: ['sardine', 'coconut'], gifts: ['seashell', 'sea_glass', 'coral'],
    lines: ['*click click* Pinch waves a claw at you.', 'Pinch is guarding a very important pebble.', 'Pinch scuttles sideways in a happy little circle.'] },
  { id: 'sky', name: 'Sky', species: 'seagull', jar: 'beach', shape: 'bird', color: '#F2F4F6', likes: ['mackerel', 'bread'], gifts: ['sea_glass', 'starfish', 'message_bottle'],
    lines: ['Sky tilts its head and stares at your bag. Hopefully.', 'Sky lets out a proud squawk.', 'Sky is pretending not to be interested in you.'] },
  { id: 'pebble', name: 'Pebble', species: 'penguin', jar: 'snow', shape: 'penguin', color: '#2E3440', likes: ['ice_smelt', 'sardine'], gifts: ['icicle', 'frost_lily'],
    lines: ['Pebble waddles over and leans on your leg.', 'Pebble slides past on its tummy.', 'Pebble offers you a very nice snowball.'] },
  { id: 'frost', name: 'Frost', species: 'arctic fox', jar: 'snow', shape: 'fox', color: '#F2F4F6', likes: ['arctic_char', 'egg'], gifts: ['icicle', 'snow_crystal'],
    lines: ['Frost curls its fluffy tail around its paws.', 'Frost pounces into the snow and comes up empty.', 'Frost watches you with sleepy eyes.'] },
  { id: 'bumble', name: 'Bumble', species: 'bumblebee', jar: 'flower', shape: 'bee', color: '#E8C25A', likes: ['rose', 'lavender_sprig'], gifts: ['honey', 'lily'],
    lines: ['Bumble does a little loop-the-loop.', 'Bumble buzzes a happy tune.', 'Bumble is covered in pollen and very pleased about it.'] },
  { id: 'fawn', name: 'Fawn', species: 'deer', jar: 'flower', shape: 'deer', color: '#C99A6A', likes: ['lettuce', 'apple'], gifts: ['rose', 'lily', 'lavender_sprig'],
    lines: ['Fawn nuzzles your hand gently.', 'Fawn wobbles a little on its long legs.', 'Fawn sniffs the flowers, then sneezes.'] },
  { id: 'sahara', name: 'Sahara', species: 'fennec fox', jar: 'desert', shape: 'fox', color: '#E3C27A', likes: ['dates', 'egg'], gifts: ['desert_rose', 'old_coin'],
    lines: ['Sahara\'s huge ears swivel toward you.', 'Sahara dug a little hole just for you.', 'Sahara yips and spins around.'] },
  { id: 'humphrey', name: 'Humphrey', species: 'camel', jar: 'desert', shape: 'camel', color: '#C9A272', likes: ['dates', 'wheat'], gifts: ['dry_sage', 'cactus_fruit'],
    lines: ['Humphrey chews thoughtfully.', 'Humphrey kneels down so you can pat him.', 'Humphrey gives you a long, wise look.'] },
  { id: 'tico', name: 'Tico', species: 'toucan', jar: 'rainforest', shape: 'bird', color: '#2E2A2A', accent: '#F0A040', likes: ['passion_fruit', 'mango', 'banana'], gifts: ['orchid', 'passion_fruit'],
    lines: ['Tico clacks its big bright beak.', 'Tico hops along the branch to see you.', 'Tico is showing off its colours.'] },
  { id: 'mo', name: 'Mo', species: 'sloth', jar: 'rainforest', shape: 'sloth', color: '#9A8A70', likes: ['lettuce', 'spinach'], gifts: ['cocoa_pod', 'orchid'],
    lines: ['Mo... slowly... smiles.', 'Mo is having the best nap of its life.', 'Mo reaches out to hold your hand. It takes a while.'] },
  { id: 'puff', name: 'Puff', species: 'mushroom sprite', jar: 'glade', shape: 'shroom', color: '#D9533C', likes: ['shiitake', 'puffcap'], gifts: ['fairy_moss', 'puffcap', 'glowcap'],
    lines: ['Puff wiggles its cap at you.', 'Puff leaves a trail of glowing spores.', 'Puff hides behind a stalk, then peeks out.'] },
  { id: 'luna', name: 'Luna', species: 'luna moth', jar: 'glade', shape: 'moth', color: '#B9E0A0', likes: ['moonbell', 'chamomile'], gifts: ['moonbell', 'fairy_moss'],
    lines: ['Luna flutters around your lantern.', 'Luna lands softly on your shoulder.', 'Luna\'s wings shimmer in the mist.'] },
  { id: 'mochi', name: 'Mochi', species: 'capybara', jar: 'springs', shape: 'capybara', color: '#B08A5A', likes: ['yuzu', 'cucumber'], gifts: ['yuzu', 'camellia'],
    lines: ['Mochi is completely, perfectly relaxed.', 'Mochi has a yuzu balanced on its head.', 'Mochi scoots over to make room in the warm water.'] },
  { id: 'yuki', name: 'Yuki', species: 'snow monkey', jar: 'springs', shape: 'monkey', color: '#D9CFC0', accent: '#E07A7A', likes: ['banana', 'onsen_egg'], gifts: ['bamboo_shoot', 'yuzu'],
    lines: ['Yuki gives you a warm little hug.', 'Yuki is grooming Mochi very carefully.', 'Yuki throws a tiny snowball and giggles.'] },
  { id: 'comet', name: 'Comet', species: 'star bunny', jar: 'stars', shape: 'bunny', color: '#F2EED0', likes: ['carrot', 'moon_pie'], gifts: ['star_petal', 'star_fragment'],
    lines: ['Comet\'s fur sparkles when it hops.', 'Comet thumps a foot. A tiny star falls out.', 'Comet snuggles up against your arm.'] },
  { id: 'nova', name: 'Nova', species: 'moon moth', jar: 'stars', shape: 'moth', color: '#9C82C9', likes: ['moon_pie', 'honey'], gifts: ['moon_moss', 'stardust'],
    lines: ['Nova traces little circles in the starlight.', 'Nova glows softly when you\'re near.', 'Nova lands on the telescope and looks through it too.'] },
];
// How each jar animal moves (see behaviors.js).
const JAR_BEHAVIOR = {
  pinch: 'scuttle', sky: 'flyer', pebble: 'slider', frost: 'pouncer', bumble: 'flitter', fawn: 'shy', sahara: 'digger', humphrey: 'lazy',
  tico: 'flyer', mo: 'lazy', puff: 'peeker', luna: 'orbit', mochi: 'swimmer', yuki: 'follower', comet: 'hopper', nova: 'orbit',
};
for (const c of CRITTERS) c.behavior = JAR_BEHAVIOR[c.id] || 'wander';
// Mochi soaks in the hot spring; Nova circles the telescope; Luna the glowing pond.
CRITTERS.find(c => c.id === 'mochi').water = 'onsen';
CRITTERS.find(c => c.id === 'nova').home = { c: 13, r: 3 };
CRITTERS.find(c => c.id === 'luna').home = { c: 12, r: 6 };
CRITTERS.find(c => c.id === 'luna').night = false;

// ---------- the meadow's own animals and people ----------

// jar: 'forest' is your meadow. hours: when they're out ([from, to) in 24h).
// person: they talk rather than get petted. route: a daily walk for people.
export const FOREST_CRITTERS = [
  { id: 'nutmeg', name: 'Nutmeg', species: 'squirrel', jar: 'forest', shape: 'squirrel', color: '#B5653A', behavior: 'darter', day: true, home: { c: 20, r: 2 },
    likes: ['acorn', 'blackberry'], gifts: ['acorn', 'pinecone', 'maple_leaf'],
    lines: ['Nutmeg chitters at you from behind the tree.', 'Nutmeg is stuffing her cheeks. Very busy.', 'Nutmeg buries something, then forgets where.'] },
  { id: 'mama_duck', name: 'Mama Duck', species: 'duck', jar: 'forest', shape: 'duck', color: '#F2EDE4', behavior: 'swimmer', day: true, water: 'pond2',
    likes: ['wheat', 'oats'], gifts: ['feather', 'clover'],
    lines: ['Mama Duck quacks proudly at her ducklings.', 'Mama Duck paddles over to say hello.', 'Mama Duck keeps one eye on her little ones.'] },
  { id: 'duckling1', name: 'Pip-pip', species: 'duckling', jar: 'forest', shape: 'duckling', color: '#F0DA6A', behavior: 'swimmer', day: true, water: 'pond2', follows: 'mama_duck', order: 1,
    likes: ['wheat', 'oats'], gifts: ['feather'], lines: ['Pip-pip peeps!', 'Pip-pip tries to paddle faster than Mama.'] },
  { id: 'duckling2', name: 'Puddle', species: 'duckling', jar: 'forest', shape: 'duckling', color: '#F0DA6A', behavior: 'swimmer', day: true, water: 'pond2', follows: 'mama_duck', order: 2,
    likes: ['wheat', 'oats'], gifts: ['feather'], lines: ['Puddle peeps very loudly.', 'Puddle got distracted by a lily pad.'] },
  { id: 'robin', name: 'Rosie', species: 'robin', jar: 'forest', shape: 'bird', color: '#8A6448', accent: '#E07A3A', behavior: 'flyer', day: true, home: { c: 9, r: 6 },
    likes: ['blueberry', 'raspberry'], gifts: ['feather', 'radish_seed'],
    lines: ['Rosie sings a little song.', 'Rosie tilts her head and listens to the ground.', 'Rosie puffs up her red chest.'] },
  { id: 'bramble_deer', name: 'Willow', species: 'deer', jar: 'forest', shape: 'deer', color: '#B88D60', behavior: 'shy', hours: [[5, 10], [16, 21]], home: { c: -10, r: 8 },
    likes: ['apple', 'carrot'], gifts: ['clover', 'chamomile'],
    lines: ['Willow watches you with big dark eyes.', 'Willow lets you come close. Slowly.', 'Willow nibbles the grass by the pool.'] },
  { id: 'prickles', name: 'Prickles', species: 'hedgehog', jar: 'forest', shape: 'hedgehog', color: '#8A6448', behavior: 'peeker', night: true, home: { c: -5, r: 6 },
    likes: ['blackberry', 'chanterelle'], gifts: ['chanterelle', 'acorn'],
    lines: ['Prickles snuffles about in the dark.', 'Prickles curls up, then uncurls to look at you.', 'Prickles found a beetle. Prickles is delighted.'] },
  { id: 'mittens', name: 'Mittens', species: 'cat', jar: 'forest', shape: 'cat', color: '#E0A04A', behavior: 'follower', home: { c: 5, r: 4 },
    likes: ['sardine', 'minnow', 'milk'], gifts: ['minnow', 'feather', 'button'],
    lines: ['Mittens rubs against your legs.', 'Mittens purrs like a little engine.', 'Mittens brought you a... leaf. Thank you, Mittens.'] },
  { id: 'hoot', name: 'Hoot', species: 'owl', jar: 'forest', shape: 'owl', color: '#9C8266', behavior: 'sitter', night: true, home: { c: -7, r: 3 },
    likes: ['cricket', 'moth'], gifts: ['feather', 'star_fragment'],
    lines: ['Hoot. Hoot hoot.', 'Hoot blinks one eye, then the other.', 'Hoot knows things. Hoot isn\'t telling.'] },
  { id: 'croaky', name: 'Croaky', species: 'frog', jar: 'forest', shape: 'toad', color: '#7FAF5B', behavior: 'hopper', day: true, home: { c: 38, r: 7 },
    likes: ['cricket', 'dragonfly'], gifts: ['lilypad_flower', 'clover'],
    lines: ['Croaky says: ribbit.', 'Croaky hops onto your foot.', 'Croaky is very proud of this pond.'] },
  // people
  { id: 'captain', name: 'Captain Shellby', species: 'turtle', jar: 'forest', shape: 'turtle', color: '#7A9A5A', accent: '#C9A272', behavior: 'sitter', pose: 'fish', person: true,
    hours: [[7, 19]], home: { c: 38, r: 3 }, likes: ['coffee', 'fish_stew'], gifts: ['sardine_bait', 'carp', 'tiny_boot'],
    lines: ['“Patience, young one. The fish come to those who wait.”', '“Caught a carp THIS big once. Well. This big.”', '“The reed pond\'s the best kept secret in the jar.”'] },
  { id: 'poppy', name: 'Poppy', species: 'mole', jar: 'forest', shape: 'mole', color: '#5A4A4A', accent: '#E07A9B', behavior: 'routine', person: true, hours: [[6, 12]],
    route: [{ c: 2, r: 7, near: true, action: 'water', stay: 3 }, { c: 1, r: 9, near: true, action: 'water', stay: 3 }, { c: -4, r: 6, stay: 6 }, { c: 4, r: 8, stay: 4 }],
    likes: ['carrot', 'potato'], gifts: ['fertilizer', 'speed_gro', 'carrot_seed'],
    lines: ['“Morning! Your soil is looking lovely.”', '“I give the beds a little drink on my rounds.”', '“Worms are a gardener\'s best friend, you know.”'] },
  { id: 'pelican', name: 'Percy', species: 'pelican', jar: 'forest', shape: 'pelican', color: '#F2F4F6', accent: '#E8B83A', behavior: 'routine', person: true, hours: [[7, 11]],
    route: [{ c: 49, r: 4, stay: 2 }, { c: 4, r: 2, action: 'mail', stay: 3 }, { c: 49, r: 4, stay: 30 }],
    likes: ['sardine', 'mackerel'], gifts: ['message_bottle', 'old_coin'],
    lines: ['“Special delivery! Well, regular delivery.”', '“Rain or shine, the mail gets through.”', '“My beak holds more than my bag, honestly.”'] },
  { id: 'iris', name: 'Iris', species: 'cat', jar: 'forest', shape: 'cat', color: '#9C82C9', accent: '#F2EDE4', behavior: 'sitter', pose: 'paint', person: true, hours: [[11, 18]], home: { c: -9, r: 7 },
    likes: ['flower_tea', 'peach'], gifts: ['gift_card', 'daisy'],
    lines: ['“Hold still! You\'d make a lovely painting.”', '“The light in the woods is just right today.”', '“I\'m painting the pool. Again. It\'s different every day.”'] },
  { id: 'bo', name: 'Bo', species: 'bunny', jar: 'forest', shape: 'bunny', color: '#F2EDE4', behavior: 'chaser', tag: 'kids', person: true, hours: [[13, 18]], home: { c: 23, r: 9 },
    likes: ['carrot', 'strawberry'], gifts: ['toy_ball', 'clover'], lines: ['“You\'re it! No wait, I\'m it!”', '“Bea is SO slow.”'] },
  { id: 'bea', name: 'Bea', species: 'bunny', jar: 'forest', shape: 'bunny', color: '#C9A272', behavior: 'chaser', tag: 'kids', person: true, hours: [[13, 18]], home: { c: 26, r: 9 },
    likes: ['carrot', 'strawberry'], gifts: ['toy_ball', 'daisy'], lines: ['“Bo cheats at tag.”', '“Wanna play? You can be it!”'] },
];
for (const f of FOREST_CRITTERS) CRITTERS.push(f);
ITEMS.sardine_bait = ITEMS.sardine_bait || { id: 'sardine_bait', name: 'Lucky bait', cat: 'potion', shape: 'bottle', color: '#C9A272', price: 40, use: 'luck', text: 'Five extra fishing bites today, wherever you fish.' };
ITEMS.lilypad_flower = ITEMS.lilypad_flower || { id: 'lilypad_flower', name: 'Lily pad flower', cat: 'forage', shape: 'flower', color: '#F2C4D0', price: 30 };

export const CRITTER_BY_ID = Object.fromEntries(CRITTERS.map(c => [c.id, c]));
export const crittersIn = jar => CRITTERS.filter(c => c.jar === jar);

for (const f of [...SHOP_FURNITURE, ...CRITTERS.map(c => ({ type: 'plush_' + c.id, name: `${c.name} plush`, price: 100, w: 1, h: 1, plush: c }))]) {
  if (FURNITURE_BY_TYPE[f.type]) continue;
  const def = { ...f, category: 'Special', special: true, jarShop: !f.plush };
  FURNITURE.push(def);
  FURNITURE_BY_TYPE[f.type] = def;
  ITEMS['made_' + f.type] = { id: 'made_' + f.type, name: f.name, cat: 'made', shape: 'seed', color: f.plush?.color || '#C9A0C9', price: Math.round(f.price / 2), furniture: f.type };
}

// ---------- the shopkeepers ----------

export const SHOPS = {
  beach: { keeper: 'Coral', species: 'otter', shape: 'otter', color: '#8A6448', title: 'Shell shack', greeting: 'Hiya! Everything here washed up this morning. Probably.',
    stock: [['made_surfboard', 180], ['shell_necklace', 60], ['sea_salt', 10], ['coconut', 20]] },
  snow: { keeper: 'Bjorn', species: 'polar bear', shape: 'bear', color: '#F2F4F6', title: 'Cocoa cabin', greeting: 'Come in from the cold. Cocoa\'s on.',
    stock: [['made_snow_globe', 160], ['hot_cocoa', 45], ['wool_mittens', 50], ['cocoa_seed', 50]] },
  flower: { keeper: 'Mrs. Moss', species: 'snail', shape: 'snail', color: '#C68F89', title: 'Bloom stall', greeting: 'Take your time, dears. I always do.',
    stock: [['made_trellis', 150], ['perfume', 70], ['rose', 30], ['tulip_seed', 18]] },
  desert: { keeper: 'Kasim', species: 'gecko', shape: 'lizard', color: '#7FAF5B', title: 'Caravan', greeting: 'Spices from far-off jars! Only the best for travelers.',
    stock: [['made_brass_lantern', 170], ['saffron', 30], ['dates', 20], ['chili_seed', 30]] },
  rainforest: { keeper: 'Kiki', species: 'monkey', shape: 'monkey', color: '#8A6448', title: 'Fruit stand', greeting: 'Fresh from the canopy! I picked it myself. Mostly.',
    stock: [['made_hammock', 220], ['coffee_bean', 25], ['passion_fruit', 25], ['pineapple_seed', 60]] },
  glade: { keeper: 'Bramble', species: 'toad', shape: 'toad', color: '#7A8A4A', title: 'Apothecary', greeting: 'Brews and tonics. Mind the bubbling ones.',
    stock: [['made_spore_lamp', 160], ['healing_tonic', 60], ['lucky_brew', 80], ['garden_tonic', 70]] },
  springs: { keeper: 'Grandma Tsuru', species: 'crane', shape: 'crane', color: '#F2F4F6', accent: '#C9333C', title: 'Tea house', greeting: 'Warm your hands, little ones. Tea?',
    stock: [['made_paper_screen', 150], ['matcha', 30], ['onsen_egg', 30], ['tea_leaf_seed', 35]] },
  stars: { keeper: 'Orion', species: 'owl', shape: 'owl', color: '#5E4A7A', title: 'Night market', greeting: 'Hoo. Everything here was found by starlight.',
    stock: [['made_star_lamp', 240], ['moon_pie', 50], ['wish_charm', 120], ['star_fragment', 150]] },
};

export function buyFromJarShop(state, jar, i) {
  const entry = SHOPS[jar]?.stock[i];
  if (!entry) return { ok: false };
  const [id, price] = entry;
  if (state.pebbles < price) return { ok: false, reason: 'Not enough pebbles.' };
  if (bagFull(state, id)) return { ok: false, reason: 'Your bag is full.' };
  state.pebbles -= price;
  addItem(state, id, 1);
  return { ok: true, id };
}

// ---------- friendship ----------

// Friendship is shared: each of you keeps your own points per animal
// (critters/<id>--<you>), and hearts come from both together.
export const POINTS_PER_HEART = 10;
export const MAX_HEARTS = 5;

export function heartsOf(points) {
  return Math.min(MAX_HEARTS, Math.floor(points / POINTS_PER_HEART));
}

export function pointsFor(docs, critterId) {
  return Object.entries(docs).filter(([k]) => k.startsWith(critterId + '--')).reduce((t, [, d]) => t + (d.points || 0), 0);
}

const isFood = id => healOf(ITEMS[id]) > 0 || ['crop', 'produce', 'fish', 'forage', 'dish'].includes(ITEMS[id]?.cat);

// pet, play or treat, once each a day. Being there together adds a little more.
export function befriend(state, critter, action, { itemId = null, together = false } = {}) {
  state.daily.critters = state.daily.critters || {};
  const done = state.daily.critters[critter.id] || {};
  if (done[action]) return { ok: false, reason: action === 'treat' ? 'One treat a day is plenty.' : `You already did that with ${critter.name} today.` };
  let points = action === 'pet' ? 3 : action === 'play' ? 4 : 0;
  let liked = false;
  if (action === 'treat') {
    if (!itemId || !isFood(itemId) || countItem(state, itemId) < 1) return { ok: false, reason: 'That isn\'t something to eat.' };
    removeItem(state, itemId, 1);
    liked = critter.likes.includes(itemId);
    points = liked ? 8 : 2;
  }
  if (together) points += 2;
  state.daily.critters[critter.id] = { ...done, [action]: true };
  return { ok: true, points, liked };
}

// A little present on days you visit once you're good friends (3 hearts), once a day each.
export function dailyGift(state, critter, hearts, day) {
  state.daily.critters = state.daily.critters || {};
  const done = state.daily.critters[critter.id] || {};
  if (hearts < 3 || done.gift) return null;
  const list = critter.gifts.filter(id => ITEMS[id]);
  const id = list[Math.floor(rngFor(state.seed, 'gift', critter.id, day)() * list.length)];
  if (!id || bagFull(state, id)) return null;
  addItem(state, id, 1);
  state.daily.critters[critter.id] = { ...done, gift: true };
  return id;
}

// At 5 hearts, a plush of them for your home. Once each.
export function keepsake(state, critter, hearts) {
  if (hearts < MAX_HEARTS || state.keepsakes?.[critter.id]) return null;
  const id = 'made_plush_' + critter.id;
  if (bagFull(state, id)) return null;
  addItem(state, id, 1);
  state.keepsakes = { ...(state.keepsakes || {}), [critter.id]: true };
  return id;
}

// ---------- special spots ----------

const LETTERS = [
  'To whoever finds this: someone, somewhere, is thinking about you right now.',
  'I hope your day is as warm as a sunny rock.',
  'Remember the first time you laughed together? Do it again today.',
  'The tide always comes back. So do the people who love you.',
  'Dear finder, you are doing better than you think.',
  'Make a little time for nothing today. It counts.',
  'Somewhere a crab is cheering for you.',
  'Hold hands for no reason. That is the reason.',
  'The best treasure is the one you share.',
  'Tell them something you like about them. Out loud.',
  'This bottle traveled very far just to say hello.',
  'Every wave is the sea saying: still here, still here.',
];
const SUNSETS = [
  'The dunes turn gold, then pink, then the softest purple.',
  'The sun melts into the sand. Neither of you says anything. You don\'t need to.',
  'A warm wind carries the smell of dates and dust.',
  'The oasis catches the last light like a mirror.',
];
const STAR_LINES = [
  'You count the stars. You lose count. You start again, together.',
  'A shooting star! You both wish for the same thing. Probably.',
  'The clouds below glow silver in the moonlight.',
  'It\'s so quiet you can hear each other breathing.',
  'You find two stars that are always next to each other.',
];
export const CONSTELLATIONS = [
  ['The Teapot', 'A little pot, always ready for one more cup.'],
  ['The Two Swans', 'Two birds with their necks making a heart.'],
  ['The Lantern', 'It lights the way home for lost travelers.'],
  ['The Sleeping Cat', 'Curled up, tail over its nose.'],
  ['The Mitten', 'Someone up there has cold hands.'],
  ['The Paper Boat', 'Sailing the river of the sky.'],
  ['The Old Oak', 'Its roots are made of the faintest stars.'],
  ['The Hand-hold', 'Two hands reaching across the dark.'],
  ['The Snail', 'Slow, steady, and glowing.'],
  ['The Kite', 'Its string trails off past the moon.'],
  ['The Jar', 'Somebody\'s whole little world, up there.'],
  ['The Heart Comet', 'You only see it when you look together.'],
];
const BLESSINGS = [
  { text: 'The ring sparkles. Pebbles appear in your pocket!', pebbles: 60 },
  { text: 'A spore drifts into your bag. It\'s a lucky brew!', item: 'lucky_brew' },
  { text: 'The mushrooms hum. You feel completely rested.', heal: true },
  { text: 'You find a glowing seed packet in the moss.', seeds: true },
  { text: 'A tiny voice giggles. Something shiny is in your bag.', item: 'moonstone' },
  { text: 'The mist parts. A healing tonic is waiting on a toadstool.', item: 'healing_tonic' },
];

export const SPOT_TEXT = {
  sandcastle: 'Build a sandcastle, three handfuls at a time.',
  bottle: 'Something washes up here every day.',
  rink: 'Skate on the ice.',
  igloo: 'Warm up inside.',
  swing: 'Swing under the flowers.',
  bouquet: 'Make a bouquet from any three flowers.',
  sunset: 'Watch the sunset, best between 5 and 8 in the evening.',
  waterfall: 'Stand under the waterfall.',
  vine: 'Swing on the vine.',
  bounce: 'Bounce on the giant mushroom.',
  fairy_ring: 'Make a wish in the fairy ring, once a day.',
  hot_spring: 'Soak in the hot spring.',
  steamer: 'Steam eggs into onsen eggs.',
  telescope: 'Look for a new constellation each night.',
  star_bench: 'Sit and look at the stars.',
};

// What a spot does. Returns { ok, text, pebbles, items, heal, moment, reason }.
// together: your partner is right there with you. Most spots reward you once a day.
export function useSpot(state, spot, { day, hour, together = false, rand = Math.random }) {
  state.daily.spots = state.daily.spots || {};
  const once = state.daily.spots[spot.id];
  const first = !once;
  const mark = v => { state.daily.spots[spot.id] = v ?? true; };
  const res = { ok: true, pebbles: 0, items: [], heal: false, moment: null };
  const give = (id, n = 1) => { if (addItem(state, id, n)) res.items.push({ id, n }); };
  const pick = (list, salt) => list[Math.floor(rngFor(state.seed, spot.id, salt ?? day)() * list.length)];
  switch (spot.spot) {
    case 'sandcastle': {
      const stage = typeof once === 'number' ? once : 0;
      if (stage >= 3) return { ok: false, reason: 'Your sandcastle is finished. The tide will take it tonight.' };
      mark(stage + 1);
      if (stage + 1 < 3) return { ...res, text: ['You pile up the base.', 'You add towers and a little wall.'][stage], stage: stage + 1 };
      give('seashell', 2);
      res.pebbles = together ? 40 : 20;
      res.text = together ? 'You finish the sandcastle together, with a flag on top!' : 'You finish your sandcastle and stick a shell on top.';
      res.moment = together ? 'built a sandcastle on the beach' : null;
      return { ...res, stage: 3 };
    }
    case 'bottle': {
      if (!first) return { ok: false, reason: 'Nothing new on the tideline today. Come back tomorrow.' };
      mark();
      const letter = pick(LETTERS);
      state.letters = [...new Set([...(state.letters || []), letter])];
      if (rand() < 0.4) give('sea_glass');
      return { ...res, text: `A bottle! The note inside says: “${letter}”`, letter };
    }
    case 'rink': case 'swing': case 'vine': case 'bounce': {
      const lines = {
        rink: ['You glide across the ice and only wobble a little.', 'You skate hand in hand, round and round.'],
        swing: ['You swing high under the petals.', 'One of you swings while the other pushes. Then you swap.'],
        vine: ['You grab the vine and swing over the ferns. Wheee!', 'You swing across together and land in a heap, laughing.'],
        bounce: ['Boing! You bounce higher than the treetops.', 'You bounce together and land at the exact same time.'],
      }[spot.spot];
      res.text = lines[together ? 1 : 0];
      if (first) {
        mark();
        res.pebbles = together ? 25 : 10;
        res.moment = together ? { rink: 'went ice skating', swing: 'took turns on the flower swing', vine: 'swung on the jungle vine', bounce: 'bounced on the giant mushroom' }[spot.spot] : null;
      }
      return res;
    }
    case 'igloo': case 'waterfall': case 'hot_spring': {
      res.heal = true;
      res.text = {
        igloo: together ? 'You squeeze into the igloo together. It\'s surprisingly cozy.' : 'It\'s warm inside the igloo. You feel much better.',
        waterfall: together ? 'You stand under the waterfall together, laughing at the noise.' : 'The cool water washes everything away. You feel refreshed.',
        hot_spring: together ? 'You soak side by side as the snow falls. Perfect.' : 'You sink into the warm water. Ahh.',
      }[spot.spot];
      if (first) {
        mark();
        if (together) {
          res.pebbles = 30;
          res.moment = { igloo: 'warmed up in the igloo', waterfall: 'stood under the waterfall', hot_spring: 'soaked in the hot spring' }[spot.spot];
        }
      }
      return res;
    }
    case 'bouquet': {
      const flowers = [];
      for (const slot of state.bag) {
        const it = ITEMS[slot.id];
        if (it?.shape === 'flower' && ['forage', 'crop'].includes(it.cat)) for (let i = 0; i < slot.n && flowers.length < 3; i++) flowers.push(slot.id);
      }
      if (flowers.length < 3) return { ok: false, reason: 'You need three flowers for a bouquet.' };
      if (bagFull(state, 'gift_bouquet')) return { ok: false, reason: 'Your bag is full.' };
      for (const id of flowers) removeItem(state, id, 1);
      give('gift_bouquet');
      return { ...res, text: `You arrange ${flowers.map(id => ITEMS[id].name.toLowerCase()).join(', ')} into a bouquet.` };
    }
    case 'steamer': {
      if (countItem(state, 'egg') < 1) return { ok: false, reason: 'You need an egg. The coop in your meadow lays them.' };
      removeItem(state, 'egg', 1);
      give('onsen_egg');
      return { ...res, text: 'You lower an egg into the steam. A few minutes later: a perfect onsen egg.' };
    }
    case 'sunset': {
      const golden = hour >= 17 && hour < 20;
      res.text = golden ? pick(SUNSETS) : 'The sand is warm. The sunset is best between 5 and 8 in the evening.';
      if (golden && first) {
        mark();
        res.pebbles = together ? 30 : 10;
        res.moment = together ? 'watched the sunset from the dunes' : null;
      }
      return res;
    }
    case 'star_bench': {
      res.text = pick(STAR_LINES, day + (together ? 1 : 0));
      if (first) {
        mark();
        res.pebbles = together ? 30 : 10;
        res.moment = together ? 'looked at the stars from the bench' : null;
      }
      return res;
    }
    case 'telescope': {
      if (!first) return { ok: false, reason: 'You\'ve already found tonight\'s constellation. Come back tomorrow.' };
      const found = new Set(state.constellations || []);
      const left = CONSTELLATIONS.filter(([n]) => !found.has(n));
      if (!left.length) {
        mark();
        return { ...res, text: 'You\'ve found every constellation. The sky feels like an old friend.' };
      }
      const [name, text] = left[Math.floor(rngFor(state.seed, 'stars', day)() * left.length)];
      state.constellations = [...found, name];
      mark();
      res.pebbles = 20;
      res.moment = together ? `found ${name} through the telescope` : null;
      return { ...res, text: `You found ${name}! ${text}`, constellation: name };
    }
    case 'fairy_ring': {
      if (!first) return { ok: false, reason: 'The ring is resting. Come back tomorrow.' };
      mark();
      const b = BLESSINGS[Math.floor(rngFor(state.seed, 'blessing', day)() * BLESSINGS.length)];
      if (b.pebbles) res.pebbles = b.pebbles;
      if (b.item) give(b.item);
      if (b.heal) res.heal = true;
      if (b.seeds) {
        const seeds = Object.keys(ITEMS).filter(id => ITEMS[id].cat === 'seed');
        give(shuffle(rngFor(state.seed, 'ring-seeds', day), seeds)[0], 3);
      }
      res.moment = together ? 'made a wish in the fairy ring' : null;
      return { ...res, text: b.text };
    }
  }
  return { ok: false, reason: 'Nothing happens.' };
}

// Digging for treasure in the desert. Each mark can be dug once a day.
const DIG_LOOT = [['old_coin', 30], ['clay_pot', 20], ['topaz', 15], ['gold_ore', 15], ['scarab_charm', 6], ['dates', 25], ['pebbles', 40]];
export function dig(state, mapDay, index, rand = Math.random) {
  if (mapDay.dug.includes(index) || !mapDay.digs[index]) return null;
  mapDay.dug.push(index);
  const total = DIG_LOOT.reduce((t, [, w]) => t + w, 0);
  let roll = rand() * total;
  const [id] = DIG_LOOT.find(([, w]) => (roll -= w) < 0) || DIG_LOOT[0];
  if (id === 'pebbles') {
    const n = 20 + Math.floor(rand() * 60);
    state.pebbles += n;
    return { pebbles: n };
  }
  return addItem(state, id, 1) ? { id } : { full: true };
}

// Potions and tonics from the apothecary.
export function usePotion(state, id, today) {
  const it = ITEMS[id];
  if (!it?.use || countItem(state, id) < 1) return null;
  if (it.use === 'luck') {
    state.daily.bites += 5;
    for (const d of Object.values(state.daily.maps || {})) d.bites += 5;
    if (state.daily.cave) state.daily.cave.bites += 5;
  }
  if (it.use === 'garden') {
    state.garden.forEach((bed, i) => { if (bedOpen(state, i)) waterBed(state, i, today); });
  }
  removeItem(state, id, 1);
  return it.use;
}
