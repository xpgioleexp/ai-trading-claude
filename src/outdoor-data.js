// Crafts for outside: paths, fences, lights, seats, garden pieces and fun
// things for the meadow, all made at the workbench. Plus a set of home
// furniture you can craft instead of buy. Drawn from `form` and two colours.
import { ITEMS } from './data.js';
import { CRAFTS, CRAFT_BY_ID, CATEGORIES } from './crafting.js';
import { FURNITURE_BY_TYPE } from './home.js';
import './furniture-data.js';
import './weather.js'; // registers branches, leaves and the other weather finds

// [type, name, group, form, colour, accent, needs]
// light: glows at night. sit: you can sit on it. flat: you can walk over it.
const OUTDOOR = [
  // paths and ground
  ['stone_path', 'Stone path', 'Paths', 'path', '#9A958A', '#B9B4A8', { stone: 3 }],
  ['brick_path', 'Brick path', 'Paths', 'bricks', '#B5653A', '#C9805A', { stone: 3, coal: 1 }],
  ['wood_deck', 'Wooden deck', 'Paths', 'deck', '#B88D60', '#9C7046', { wood: 3 }],
  ['garden_tiles', 'Garden tiles', 'Paths', 'tiles', '#D9C9A0', '#B9A88A', { stone: 2, fiber: 1 }],
  ['mosaic_path', 'Mosaic path', 'Paths', 'mosaic', '#79AAA4', '#E07A9B', { stone: 2, sea_glass: 1 }],
  ['flower_bed', 'Flower bed', 'Paths', 'flowerbed', '#7A5A3A', '#E07A9B', { '#flower': 2, fiber: 1 }],
  ['stepping_stones', 'Stepping stones', 'Paths', 'steps', '#9A958A', '#B9B4A8', { stone: 2 }],
  ['clover_lawn', 'Clover lawn', 'Paths', 'clover', '#7FAF5B', '#F2F4F6', { fiber: 3 }],
  // fences and borders
  ['picket_fence', 'Picket fence', 'Fences', 'fence', '#F2F4F6', '#D9D6CF', { wood: 3 }],
  ['stone_wall', 'Stone wall', 'Fences', 'wall', '#9A958A', '#7D7A74', { stone: 4 }],
  ['hedge', 'Hedge', 'Fences', 'hedge', '#4F8A4A', '#6FAF5B', { fiber: 4 }],
  ['bamboo_fence', 'Bamboo fence', 'Fences', 'fence', '#C9C27A', '#8DBA5C', { wood: 2, fiber: 2 }],
  ['iron_fence', 'Iron railing', 'Fences', 'railing', '#3A3A40', '#5A5A60', { iron_ore: 2 }],
  ['rope_fence', 'Rope fence', 'Fences', 'rope', '#B88D60', '#D9C9A0', { wood: 1, fiber: 3 }],
  // lights
  ['lamp_post', 'Lamp post', 'Lights', 'lamppost', '#3A3A40', '#F2C46A', { iron_ore: 2, quartz: 1 }, { light: true }],
  ['garden_torch', 'Tiki torch', 'Lights', 'torch', '#9C7046', '#F08A3A', { wood: 2, coal: 1 }, { light: true }],
  ['lantern_post', 'Lantern post', 'Lights', 'lanternpost', '#7A5A3A', '#F2C46A', { wood: 3, copper_ore: 1 }, { light: true }],
  ['solar_light', 'Garden light', 'Lights', 'smalllight', '#5A5A60', '#F2E48A', { copper_ore: 1, quartz: 1 }, { light: true }],
  ['string_pole', 'String lights', 'Lights', 'stringpole', '#7A5A3A', '#F2C46A', { wood: 2, copper_ore: 2 }, { light: true }],
  ['stone_lantern_out', 'Stone lantern', 'Lights', 'stonelantern', '#9A958A', '#F2C46A', { stone: 5 }, { light: true }],
  ['crystal_lamp', 'Crystal lamp', 'Lights', 'crystal', '#A9E0E8', '#E9F2F6', { crystal_shard: 1, stone: 2 }, { light: true }],
  // seats and tables
  ['garden_bench', 'Garden bench', 'Seats', 'bench', '#B88D60', '#9C7046', { wood: 5 }, { sit: true }],
  ['heart_bench', 'Heart bench', 'Seats', 'heartbench', '#E07A9B', '#F2C4C8', { wood: 5, cloth: 1 }, { sit: true }],
  ['log_seat', 'Log seat', 'Seats', 'log', '#7A5A3A', '#C9A272', { wood: 3 }, { sit: true }],
  ['deck_chair', 'Deck chair', 'Seats', 'deckchair', '#B88D60', '#5F9FB5', { wood: 2, cloth: 2 }, { sit: true }],
  ['picnic_table', 'Picnic table', 'Seats', 'picnictable', '#B88D60', '#9C7046', { wood: 6 }, { sit: true }],
  ['parasol_table', 'Parasol table', 'Seats', 'parasol', '#F2EDE4', '#D9533C', { wood: 3, cloth: 3 }, { sit: true }],
  ['porch_swing', 'Garden swing', 'Seats', 'swing', '#7A5A3A', '#E9D7A8', { wood: 6, fiber: 2 }, { sit: true, swing: true }],
  ['hammock_stand', 'Hammock', 'Seats', 'hammock', '#9C7046', '#E07A7A', { wood: 4, cloth: 3 }, { sit: true, swing: true }],
  // garden
  ['planter_box', 'Planter box', 'Garden', 'planter', '#B88D60', '#E07A9B', { wood: 3, '#flower': 1 }],
  ['flower_pots', 'Flower pots', 'Garden', 'pots', '#C9783A', '#E8C25A', { stone: 1, '#flower': 2 }],
  ['birdbath', 'Birdbath', 'Garden', 'birdbath', '#B9B4A8', '#9FD3E0', { stone: 4 }],
  ['sundial', 'Sundial', 'Garden', 'sundial', '#B9B4A8', '#D9A53A', { stone: 3, copper_ore: 1 }],
  ['scarecrow', 'Scarecrow', 'Garden', 'scarecrow', '#D9B47A', '#5F7FB5', { wood: 3, fiber: 3, cloth: 1 }],
  ['wheelbarrow', 'Wheelbarrow', 'Garden', 'wheelbarrow', '#5F7FB5', '#7A5A3A', { wood: 2, iron_ore: 1 }],
  ['hay_bale', 'Hay bale', 'Garden', 'hay', '#E3C27A', '#C9A25A', { fiber: 5 }, { sit: true }],
  ['rain_barrel', 'Rain barrel', 'Garden', 'barrel', '#7A5A3A', '#3A3A40', { wood: 4, iron_ore: 1 }],
  ['compost_bin', 'Compost bin', 'Garden', 'compost', '#5E7A4A', '#7A5A3A', { wood: 3, fiber: 2 }],
  ['garden_gnome', 'Garden gnome', 'Garden', 'gnome', '#D9533C', '#5F7FB5', { stone: 2, cloth: 1 }],
  ['bird_feeder', 'Bird feeder', 'Garden', 'feeder', '#B88D60', '#E8C25A', { wood: 2, acorn: 1 }],
  ['watering_cans', 'Watering cans', 'Garden', 'cans', '#79AAA4', '#5F8A86', { copper_ore: 2 }],
  ['pumpkin_patch', 'Pumpkin pile', 'Garden', 'pumpkins', '#E0873A', '#4F8A4A', { pumpkin: 2 }],
  // fun things
  ['garden_arch', 'Garden arch', 'Fun', 'arch', '#F2F4F6', '#E07A9B', { wood: 4, '#flower': 3 }],
  ['heart_arch', 'Heart arch', 'Fun', 'heartarch', '#E07A9B', '#F2C4C8', { wood: 4, cloth: 2, '#flower': 2 }],
  ['signpost', 'Signpost', 'Fun', 'signpost', '#B88D60', '#F2EDE4', { wood: 3 }],
  ['flag_pole', 'Our flag', 'Fun', 'flag', '#9A958A', '#E07A9B', { iron_ore: 1, cloth: 2 }],
  ['little_windmill', 'Little windmill', 'Fun', 'windmill', '#F2EDE4', '#B5653A', { wood: 5, cloth: 2 }],
  ['wind_chime', 'Wind chime', 'Fun', 'chime', '#B88D60', '#A9E0E8', { wood: 1, quartz: 1, copper_ore: 1 }],
  ['fountain', 'Fountain', 'Fun', 'fountain', '#B9B4A8', '#9FD3E0', { stone: 8, copper_ore: 2 }],
  ['cat_statue', 'Cat statue', 'Fun', 'catstatue', '#B9B4A8', '#7D7A74', { stone: 5 }],
  ['totem', 'Wooden totem', 'Fun', 'totem', '#9C7046', '#D9533C', { wood: 6 }],
  ['sandbox', 'Sandbox', 'Fun', 'sandbox', '#B88D60', '#E9D7A8', { wood: 4, fiber: 1 }],
  ['camping_tent', 'Camping tent', 'Fun', 'tent', '#5E8A6A', '#F2C46A', { cloth: 4, wood: 2 }],
  ['jack_lantern', 'Pumpkin lantern', 'Fun', 'jack', '#E0873A', '#F2C46A', { pumpkin: 1 }, { light: true }],
  ['wishing_stone', 'Wishing stone', 'Fun', 'wishstone', '#7D8796', '#F2E48A', { stone: 3, star_fragment: 1 }, { light: true }],
  ['snow_bunny', 'Snow bunny', 'Fun', 'snowbunny', '#F2FAFF', '#E07A9B', { snow_crystal: 1 }],
  // made from what the weather leaves behind (see weather.js)
  ['branch_fence', 'Branch fence', 'Fences', 'rope', '#6A4A30', '#8A6A4A', { branch: 3 }],
  ['twig_arch', 'Twig arch', 'Fun', 'arch', '#7A5A3A', '#6FAF5B', { branch: 4, gust_leaf: 2 }],
  ['storm_lantern', 'Storm lantern', 'Lights', 'lanternpost', '#4F5F8A', '#C9E8F2', { branch: 2, lightning_glass: 1 }, { light: true }],
  ['rainbow_arch', 'Rainbow arch', 'Fun', 'heartarch', '#8DC76A', '#E8707A', { rainbow_shard: 1, wood: 3 }],
  ['leaf_pile', 'Leaf pile', 'Seats', 'hay', '#D0603A', '#E0873A', { gust_leaf: 6 }, { sit: true }],
  ['golden_tree', 'Golden leaf lamp', 'Lights', 'smalllight', '#B88D60', '#E8C25A', { golden_leaf: 1, branch: 1 }, { light: true }],
  ['frost_lamp', 'Frost lamp', 'Lights', 'crystal', '#DCEFF6', '#FFFFFF', { frost_flower: 2, quartz: 1 }, { light: true }],
  ['pebble_path', 'Shiny pebble path', 'Paths', 'path', '#9FB7C2', '#DCEFF6', { shiny_pebble: 3 }],
  ['nest_box', 'Bird nest box', 'Garden', 'feeder', '#B88D60', '#9C7046', { birds_nest: 1, branch: 2 }],
  ['weathervane', 'Weathervane', 'Fun', 'flag', '#5A5A60', '#E8C25A', { iron_ore: 1, branch: 2 }],
];

export const OUTDOOR_BY_TYPE = {};
export const OUTDOOR_GROUPS = ['Paths', 'Fences', 'Lights', 'Seats', 'Garden', 'Fun'];
export const FLAT_OUTDOOR = [];
export const LIGHT_DECOR = new Set();
const FLAT_FORMS = ['path', 'bricks', 'deck', 'tiles', 'mosaic', 'flowerbed', 'steps', 'clover'];

// Adds outdoor pieces: each is crafted at the workbench (and can be bought in Build).
export function addOutdoor(rows) {
  for (const [type, name, group, form, color, accent, needs, extra] of rows) {
    if (OUTDOOR_BY_TYPE[type]) continue;
    const flat = FLAT_FORMS.includes(form);
    const def = { type, name, group, form, color, accent, flat, needs, ...(extra || {}) };
    OUTDOOR_BY_TYPE[type] = def;
    if (flat) FLAT_OUTDOOR.push(type);
    if (def.light) LIGHT_DECOR.add(type);
    ITEMS['made_' + type] = { id: 'made_' + type, name, cat: 'made', shape: 'seed', color, price: 15, decor: type };
    const craft = { id: 'out_' + type, name, category: 'Outdoor', group, needs, makes: { decor: type } };
    CRAFTS.push(craft);
    CRAFT_BY_ID[craft.id] = craft;
  }
}
addOutdoor(OUTDOOR);

// What an outdoor piece costs to buy instead of make: about three times its materials.
export function outdoorPrice(def) {
  const total = Object.entries(def.needs || {}).reduce((t, [id, n]) => t + (id.startsWith('#') ? 12 : ITEMS[id]?.price || 10) * n, 0);
  return Math.max(20, Math.round((total * 3) / 5) * 5);
}

// Home furniture you can craft as well as buy, a few from each set.
const HOME_CRAFTS = [
  ['cottage_armchair', { wood: 4, cloth: 2 }], ['rocking_stool', { wood: 2 }], ['flower_basket', { fiber: 3, '#flower': 2 }],
  ['stump_stool', { wood: 3 }], ['log_table', { wood: 8 }], ['firewood_rack', { wood: 6 }], ['cabin_chest', { wood: 5, iron_ore: 1 }],
  ['zabuton', { cloth: 2 }], ['andon_lamp', { wood: 2, fiber: 2 }], ['tatami', { fiber: 8 }],
  ['wicker_chair', { fiber: 6 }], ['driftwood_table', { wood: 4, seashell: 1 }], ['ship_wheel', { wood: 5, iron_ore: 1 }],
  ['mushroom_stool', { wood: 2, shiitake: 1 }], ['moss_rug', { fiber: 6 }], ['leaf_chair', { wood: 2, fiber: 4 }],
  ['library_ladder', { wood: 5 }], ['chalkboard', { wood: 3, coal: 2 }], ['tea_cart', { wood: 4, copper_ore: 1 }],
  ['spice_rack', { wood: 3 }], ['towel_rack', { iron_ore: 1, cloth: 1 }], ['laundry_basket', { fiber: 4 }],
  ['teddy_bear', { cloth: 4, fiber: 2 }], ['toy_blocks', { wood: 3 }], ['rocking_horse', { wood: 6, cloth: 1 }],
  ['cactus_pot', { stone: 1, cactus_fruit: 1 }], ['flower_box', { wood: 3, '#flower': 2 }], ['succulents', { stone: 2, fiber: 2 }],
  ['candle_cluster', { fiber: 2, honey: 1 }], ['fairy_jar_lamp', { quartz: 1, copper_ore: 1 }], ['salt_lamp', { sea_salt: 2, stone: 1 }],
  ['knitting_basket', { fiber: 3, cloth: 2 }], ['yoga_mat', { cloth: 3 }], ['room_divider', { wood: 4, cloth: 3 }],
];
for (const [type, needs] of HOME_CRAFTS) {
  const f = FURNITURE_BY_TYPE[type];
  if (!f) continue;
  ITEMS['made_' + type] = ITEMS['made_' + type] || { id: 'made_' + type, name: f.name, cat: 'made', shape: 'seed', color: f.color || '#B88D60', price: Math.round(f.price / 3), furniture: type };
  const craft = { id: 'home_' + type, name: f.name, category: 'Home', group: f.set, needs, makes: { furniture: type } };
  CRAFTS.push(craft);
  CRAFT_BY_ID[craft.id] = craft;
}
for (const cat of ['Home', 'Outdoor']) if (!CATEGORIES.includes(cat)) CATEGORIES.push(cat);
