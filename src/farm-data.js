// More farming: extra crops for every season, farm buildings that make things
// every day, fruit trees, fertilizers, garden upgrades and pantry staples.
// Add a row to add content.
import { ITEMS, CROPS, CROP_BY_ID } from './data.js';

// tags: what kind of ingredient it is in the kitchen (see cooking.js).
const NEW_CROPS = [
  // spring
  { id: 'lettuce', name: 'Lettuce', season: 'spring', days: 3, price: 28, seedPrice: 12, color: '#9DC76A', shape: 'leaf', tags: ['greens'] },
  { id: 'spinach', name: 'Spinach', season: 'spring', days: 3, regrow: 2, price: 24, seedPrice: 15, color: '#4F8A4A', shape: 'leaf', tags: ['greens'] },
  { id: 'potato', name: 'Potato', season: 'spring', days: 5, price: 45, seedPrice: 20, color: '#C9A272', shape: 'root', tags: ['root'] },
  { id: 'garlic', name: 'Garlic', season: 'spring', days: 4, price: 40, seedPrice: 18, color: '#EDEBD8', shape: 'root', tags: ['herb'] },
  { id: 'rhubarb', name: 'Rhubarb', season: 'spring', days: 6, price: 80, seedPrice: 35, color: '#C9485A', shape: 'pod', tags: ['veg'] },
  { id: 'green_bean', name: 'Green bean', season: 'spring', days: 5, regrow: 2, price: 22, seedPrice: 25, color: '#6FAF5B', shape: 'pod', tags: ['bean', 'veg'] },
  { id: 'cauliflower', name: 'Cauliflower', season: 'spring', days: 6, price: 95, seedPrice: 40, color: '#F2EDE4', shape: 'round', tags: ['veg'] },
  { id: 'tea_leaf', name: 'Tea leaves', season: 'spring', days: 5, regrow: 2, price: 30, seedPrice: 35, color: '#5E8A4A', shape: 'leaf', tags: ['tea'] },
  // summer
  { id: 'wheat', name: 'Wheat', season: 'summer', days: 4, price: 20, seedPrice: 10, color: '#E3C27A', shape: 'pod', tags: ['grain'] },
  { id: 'rice', name: 'Rice', season: 'summer', days: 5, price: 28, seedPrice: 14, color: '#F2EDE4', shape: 'seed', tags: ['grain'] },
  { id: 'chili', name: 'Chili pepper', season: 'summer', days: 4, regrow: 2, price: 30, seedPrice: 30, color: '#D9332C', shape: 'pod', tags: ['spice'] },
  { id: 'cucumber', name: 'Cucumber', season: 'summer', days: 4, regrow: 2, price: 26, seedPrice: 25, color: '#5FA05A', shape: 'pod', tags: ['veg'] },
  { id: 'eggplant', name: 'Eggplant', season: 'summer', days: 5, regrow: 3, price: 32, seedPrice: 28, color: '#5E3A6A', shape: 'round', tags: ['veg'] },
  { id: 'bell_pepper', name: 'Bell pepper', season: 'summer', days: 5, regrow: 3, price: 34, seedPrice: 30, color: '#E8C25A', shape: 'round', tags: ['veg'] },
  { id: 'basil', name: 'Basil', season: 'summer', days: 3, regrow: 2, price: 20, seedPrice: 18, color: '#4F9A4A', shape: 'leaf', tags: ['herb'] },
  { id: 'pineapple', name: 'Pineapple', season: 'summer', days: 7, price: 150, seedPrice: 60, color: '#E8B83A', shape: 'cone', tags: ['fruit'] },
  // autumn
  { id: 'sweet_potato', name: 'Sweet potato', season: 'autumn', days: 5, price: 48, seedPrice: 22, color: '#C9683A', shape: 'root', tags: ['root'] },
  { id: 'beet', name: 'Beet', season: 'autumn', days: 4, price: 38, seedPrice: 16, color: '#8A2A4A', shape: 'root', tags: ['root'] },
  { id: 'onion', name: 'Onion', season: 'autumn', days: 4, price: 30, seedPrice: 14, color: '#D9B48A', shape: 'round', tags: ['veg'] },
  { id: 'grape', name: 'Grape', season: 'autumn', days: 6, regrow: 3, price: 40, seedPrice: 40, color: '#7A4A8A', shape: 'berry', tags: ['fruit', 'berry'] },
  { id: 'soybean', name: 'Soybean', season: 'autumn', days: 4, regrow: 2, price: 22, seedPrice: 22, color: '#A9B26A', shape: 'pod', tags: ['bean'] },
  { id: 'artichoke', name: 'Artichoke', season: 'autumn', days: 6, price: 110, seedPrice: 45, color: '#7A9A5A', shape: 'cone', tags: ['veg'] },
  { id: 'oats', name: 'Oats', season: 'autumn', days: 4, price: 18, seedPrice: 10, color: '#D9C9A0', shape: 'pod', tags: ['grain'] },
  { id: 'squash', name: 'Butternut squash', season: 'autumn', days: 5, price: 70, seedPrice: 30, color: '#E0A04A', shape: 'round', tags: ['veg'] },
  // winter
  { id: 'leek', name: 'Leek', season: 'winter', days: 4, price: 34, seedPrice: 16, color: '#A9C98A', shape: 'pod', tags: ['veg'] },
  { id: 'brussels', name: 'Brussels sprouts', season: 'winter', days: 5, regrow: 3, price: 30, seedPrice: 28, color: '#6F9A4A', shape: 'round', tags: ['greens'] },
  { id: 'parsnip', name: 'Parsnip', season: 'winter', days: 4, price: 36, seedPrice: 15, color: '#E9DFC0', shape: 'root', tags: ['root'] },
  { id: 'cabbage', name: 'Cabbage', season: 'winter', days: 5, price: 60, seedPrice: 26, color: '#8DBA6A', shape: 'round', tags: ['greens'] },
  { id: 'snow_pea', name: 'Snow pea', season: 'winter', days: 4, regrow: 2, price: 24, seedPrice: 22, color: '#B9D98A', shape: 'pod', tags: ['bean', 'veg'] },
  { id: 'ginger', name: 'Ginger', season: 'winter', days: 5, price: 44, seedPrice: 20, color: '#D9B46A', shape: 'root', tags: ['spice'] },
  { id: 'cocoa', name: 'Cocoa bean', season: 'winter', days: 7, regrow: 3, price: 60, seedPrice: 50, color: '#6B4430', shape: 'pod', tags: ['sweet'] },
  { id: 'vanilla', name: 'Vanilla', season: 'winter', days: 7, regrow: 3, price: 70, seedPrice: 55, color: '#E9DFC0', shape: 'pod', tags: ['sweet', 'spice'] },
];
for (const c of NEW_CROPS) {
  CROPS.push(c);
  CROP_BY_ID[c.id] = c;
  ITEMS[c.id] = { id: c.id, name: c.name, cat: 'crop', shape: c.shape, color: c.color, price: c.price, season: c.season, tags: c.tags };
  ITEMS[c.id + '_seed'] = {
    id: c.id + '_seed', name: c.name + ' seeds', cat: 'seed', shape: 'seed', color: c.color,
    price: Math.max(1, Math.floor(c.seedPrice / 2)), crop: c.id, season: c.season,
  };
}
export const NEW_CROP_IDS = NEW_CROPS.map(c => c.id);

// Farm produce from buildings and fruit trees, and pantry staples from the shop.
const PRODUCE = [
  ['egg', 'Egg', 'round', '#F2EDE4', 15, ['egg']],
  ['milk', 'Goat milk', 'bottle', '#F5F2E6', 25, ['dairy']],
  ['shiitake', 'Shiitake', 'mushroom', '#8A6448', 30, ['mushroom']],
  ['pear', 'Pear', 'round', '#C9C25A', 28, ['fruit']],
  ['plum', 'Plum', 'round', '#7A3A6A', 28, ['fruit']],
  ['lemon', 'Lemon', 'round', '#F0DA4A', 26, ['fruit']],
  ['mango', 'Mango', 'round', '#F0A040', 40, ['fruit']],
  ['banana', 'Banana', 'pod', '#F0DA6A', 32, ['fruit']],
];
if (!ITEMS.honey) ITEMS.honey = { id: 'honey', name: 'Honey', cat: 'forage', shape: 'bottle', color: '#E8B83A', price: 40 };
for (const [id, name, shape, color, price, tags] of PRODUCE) ITEMS[id] = { id, name, cat: 'produce', shape, color, price, tags };
export const PRODUCE_IDS = PRODUCE.map(p => p[0]);

export const PANTRY = [
  ['flour', 'Flour', 'seed', '#F2EDE4', 12, ['flour']],
  ['sugar', 'Sugar', 'crystal', '#FFFFFF', 10, ['sweet']],
  ['butter', 'Butter', 'stone', '#F2DA7A', 18, ['dairy']],
  ['cheese', 'Cheese', 'stone', '#F0C94B', 30, ['dairy']],
  ['oil', 'Cooking oil', 'bottle', '#E8C25A', 14, ['oil']],
  ['egg', null, null, null, 22],
  ['milk', null, null, null, 32],
].map(([id, name, shape, color, price, tags]) => {
  if (name) ITEMS[id] = { id, name, cat: 'pantry', shape, color, price: Math.round(price / 2), tags };
  return { id, price };
});

// Things that go on your garden beds. Each planting can have one.
export const FERTILIZERS = [
  { id: 'fertilizer', name: 'Fertilizer', price: 20, color: '#8A6448', text: 'One extra crop at every harvest.' },
  { id: 'speed_gro', name: 'Speed-gro', price: 35, color: '#6FAF5B', text: 'Grows about a third faster.' },
  { id: 'water_soil', name: 'Water-keeping soil', price: 30, color: '#5FA8C9', text: 'Waters itself every morning.' },
];
for (const f of FERTILIZERS) ITEMS[f.id] = { id: f.id, name: f.name, cat: 'farm', shape: 'seed', color: f.color, price: Math.round(f.price / 2) };
export const FERTILIZER_BY_ID = Object.fromEntries(FERTILIZERS.map(f => [f.id, f]));

// Farm buildings and fruit trees go in the meadow from Build, like decorations.
// makes: what you collect, every `every` days. Trees take `grows` days first.
export const FARM_BUILDINGS = [
  { type: 'coop', name: 'Chicken coop', price: 400, makes: 'egg', n: 2, every: 1, text: 'Two eggs every day.' },
  { type: 'goat_pen', name: 'Goat pen', price: 600, makes: 'milk', n: 1, every: 1, text: 'Fresh milk every day.' },
  { type: 'bee_box', name: 'Bee box', price: 350, makes: 'honey', n: 1, every: 2, text: 'Honey every other day.' },
  { type: 'mushroom_log', name: 'Mushroom log', price: 250, makes: 'shiitake', n: 2, every: 1, text: 'Two shiitake every day.' },
  { type: 'tree_pear', name: 'Pear tree', price: 300, makes: 'pear', n: 2, every: 1, grows: 3, text: 'Pears every day once it\'s grown (3 days).' },
  { type: 'tree_plum', name: 'Plum tree', price: 300, makes: 'plum', n: 2, every: 1, grows: 3, text: 'Plums every day once it\'s grown (3 days).' },
  { type: 'tree_lemon', name: 'Lemon tree', price: 350, makes: 'lemon', n: 2, every: 1, grows: 3, text: 'Lemons every day once it\'s grown (3 days).' },
  { type: 'tree_mango', name: 'Mango tree', price: 450, makes: 'mango', n: 1, every: 1, grows: 4, text: 'Mangoes every day once it\'s grown (4 days).' },
  { type: 'tree_banana', name: 'Banana tree', price: 450, makes: 'banana', n: 2, every: 1, grows: 4, text: 'Bananas every day once it\'s grown (4 days).' },
];
export const FARM_BY_TYPE = Object.fromEntries(FARM_BUILDINGS.map(f => [f.type, f]));
for (const f of FARM_BUILDINGS) {
  ITEMS['made_' + f.type] = { id: 'made_' + f.type, name: f.name, cat: 'farm', shape: 'seed', color: '#9DBA74', price: Math.round(f.price / 2), decor: f.type };
}

// Garden upgrades, shared by both of you.
export const BED_LEVELS = [6, 9, 12];
export const BED_UPGRADES = [null, { pebbles: 300, items: { wood: 10 } }, { pebbles: 800, items: { wood: 20, stone: 20 } }];
export const SPRINKLER = { pebbles: 500, items: { copper_ore: 5, iron_ore: 3 } };
