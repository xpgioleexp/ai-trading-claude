// Game content: every item, fish, crop, forage find and mineral.
// Adding content means adding a row here; the rest of the game reads these lists.

// Fish: seasons/time/weather of null means "any".
// size is [min, max] in cm, difficulty is 1 (easy) to 5 (legendary).
export const FISH = [
  { id: 'minnow', name: 'Minnow', color: '#9FB3B8', rarity: 'common', size: [3, 7], price: 10, difficulty: 1 },
  { id: 'lily_guppy', name: 'Lily guppy', color: '#E4B4A3', rarity: 'common', seasons: ['spring'], size: [2, 5], price: 15, difficulty: 1 },
  { id: 'perch', name: 'Pond perch', color: '#A9B26A', rarity: 'common', size: [10, 25], price: 20, difficulty: 2 },
  { id: 'sunfish', name: 'Sunfish', color: '#E7C25A', rarity: 'common', seasons: ['spring', 'summer'], time: 'day', size: [8, 18], price: 25, difficulty: 1 },
  { id: 'carp', name: 'Carp', color: '#B39467', rarity: 'common', size: [25, 60], price: 30, difficulty: 2 },
  { id: 'bluegill', name: 'Bluegill', color: '#6F97B5', rarity: 'common', seasons: ['summer'], time: 'day', size: [10, 22], price: 28, difficulty: 2 },
  { id: 'bitterling', name: 'Bitterling', color: '#C9A0B8', rarity: 'common', seasons: ['autumn', 'winter'], size: [4, 9], price: 18, difficulty: 1 },
  { id: 'smelt', name: 'Pond smelt', color: '#C7D3D6', rarity: 'common', seasons: ['winter'], size: [8, 14], price: 30, difficulty: 2 },
  { id: 'loach', name: 'Loach', color: '#8C7A5B', rarity: 'common', time: 'night', size: [8, 15], price: 35, difficulty: 2 },
  { id: 'goldfish', name: 'Goldfish', color: '#E88A4A', rarity: 'uncommon', size: [5, 12], price: 45, difficulty: 2 },
  { id: 'trout', name: 'Brook trout', color: '#9C8E6E', rarity: 'uncommon', seasons: ['spring', 'autumn'], size: [20, 50], price: 50, difficulty: 3 },
  { id: 'bass', name: 'Bass', color: '#5E7F4E', rarity: 'uncommon', seasons: ['summer'], size: [25, 55], price: 55, difficulty: 3 },
  { id: 'catfish', name: 'Catfish', color: '#6B6457', rarity: 'uncommon', time: 'night', size: [30, 80], price: 60, difficulty: 3 },
  { id: 'frostfin', name: 'Frostfin', color: '#A9CFE0', rarity: 'uncommon', seasons: ['winter'], size: [12, 25], price: 75, difficulty: 3 },
  { id: 'mossback', name: 'Mossback', color: '#6F925B', rarity: 'uncommon', seasons: ['summer'], weather: 'rain', size: [20, 40], price: 70, difficulty: 3 },
  { id: 'koi', name: 'Koi', color: '#F2EDE4', rarity: 'uncommon', seasons: ['spring'], size: [30, 60], price: 80, difficulty: 3 },
  { id: 'rainbow_trout', name: 'Rainbow trout', color: '#D98FA0', rarity: 'uncommon', weather: 'rain', size: [25, 55], price: 85, difficulty: 3 },
  { id: 'pike', name: 'Pike', color: '#7B8F5A', rarity: 'uncommon', seasons: ['autumn', 'winter'], size: [40, 90], price: 90, difficulty: 4 },
  { id: 'eel', name: 'Eel', color: '#4E5A52', rarity: 'rare', time: 'night', weather: 'rain', size: [40, 90], price: 120, difficulty: 4 },
  { id: 'crystal_shrimp', name: 'Crystal shrimp', color: '#CFE8F0', rarity: 'rare', seasons: ['winter'], time: 'night', size: [3, 6], price: 140, difficulty: 4 },
  { id: 'glowfish', name: 'Glowfish', color: '#E9F08A', rarity: 'rare', seasons: ['summer'], time: 'night', size: [10, 20], price: 150, difficulty: 4 },
  { id: 'moonfish', name: 'Moonfish', color: '#D7D9EE', rarity: 'rare', seasons: ['autumn'], time: 'night', size: [15, 30], price: 160, difficulty: 4 },
  { id: 'golden_carp', name: 'Golden carp', color: '#F0C94B', rarity: 'rare', size: [30, 70], price: 200, difficulty: 5 },
  { id: 'lantern_koi', name: 'Lantern koi', color: '#F29C6B', rarity: 'rare', seasons: ['autumn', 'winter'], time: 'night', size: [30, 55], price: 180, difficulty: 4 },
  { id: 'marimo_guardian', name: 'Marimo guardian', color: '#5E8A4A', rarity: 'legend', size: [80, 120], price: 500, difficulty: 5 },
];

export const RARITY_WEIGHT = { common: 60, uncommon: 22, rare: 6, legend: 1 };

export const JUNK = [
  { id: 'tiny_boot', name: 'Tiny boot', shape: 'boot', color: '#775B46', price: 2 },
  { id: 'bottle', name: 'Bottle with a message', shape: 'bottle', color: '#B7D4BD', price: 5 },
  { id: 'button', name: 'Lost button', shape: 'button', color: '#C68F89', price: 3 },
];

// Crops: days = watered days to grow, regrow = days to grow again after harvest.
export const CROPS = [
  { id: 'radish', name: 'Radish', season: 'spring', days: 3, price: 35, seedPrice: 15, color: '#D96A7A', shape: 'round' },
  { id: 'strawberry', name: 'Strawberry', season: 'spring', days: 4, regrow: 2, price: 30, seedPrice: 25, color: '#D9474F', shape: 'berry' },
  { id: 'tulip', name: 'Tulip', season: 'spring', days: 3, price: 40, seedPrice: 18, color: '#E07A9B', shape: 'flower' },
  { id: 'pea', name: 'Sweet pea', season: 'spring', days: 4, regrow: 2, price: 25, seedPrice: 20, color: '#8DBA5C', shape: 'pod' },
  { id: 'tomato', name: 'Tomato', season: 'summer', days: 5, regrow: 3, price: 30, seedPrice: 25, color: '#D9533C', shape: 'round' },
  { id: 'blueberry', name: 'Blueberry', season: 'summer', days: 5, regrow: 2, price: 28, seedPrice: 30, color: '#4F6FB3', shape: 'berry' },
  { id: 'sunflower', name: 'Sunflower', season: 'summer', days: 4, price: 50, seedPrice: 22, color: '#E8B83A', shape: 'flower' },
  { id: 'melon', name: 'Melon', season: 'summer', days: 6, price: 120, seedPrice: 50, color: '#9CC56B', shape: 'round' },
  { id: 'pumpkin', name: 'Pumpkin', season: 'autumn', days: 6, price: 130, seedPrice: 55, color: '#E0873A', shape: 'round' },
  { id: 'carrot', name: 'Carrot', season: 'autumn', days: 3, price: 35, seedPrice: 15, color: '#E5893A', shape: 'root' },
  { id: 'corn', name: 'Corn', season: 'autumn', days: 5, regrow: 3, price: 30, seedPrice: 30, color: '#E9CF5A', shape: 'pod' },
  { id: 'cranberry', name: 'Cranberry', season: 'autumn', days: 4, regrow: 2, price: 26, seedPrice: 28, color: '#B5324A', shape: 'berry' },
  { id: 'kale', name: 'Winter kale', season: 'winter', days: 3, price: 38, seedPrice: 16, color: '#5E8A6A', shape: 'leaf' },
  { id: 'frostberry', name: 'Frostberry', season: 'winter', days: 4, regrow: 2, price: 30, seedPrice: 28, color: '#9CC3E0', shape: 'berry' },
  { id: 'snowdrop', name: 'Snowdrop', season: 'winter', days: 3, price: 45, seedPrice: 20, color: '#F2F4EE', shape: 'flower' },
  { id: 'turnip', name: 'Turnip', season: 'winter', days: 3, price: 32, seedPrice: 14, color: '#D7B7D9', shape: 'root' },
];

export const FORAGE = [
  { id: 'dandelion', name: 'Dandelion', season: 'spring', shape: 'flower', color: '#E8CF4A', price: 12 },
  { id: 'clover', name: 'Four-leaf clover', season: 'spring', shape: 'leaf', color: '#6FAF5B', price: 40, rare: true },
  { id: 'wild_garlic', name: 'Wild garlic', season: 'spring', shape: 'root', color: '#EDEBD8', price: 18 },
  { id: 'morel', name: 'Morel', season: 'spring', shape: 'mushroom', color: '#B58E5E', price: 30 },
  { id: 'raspberry', name: 'Raspberry', season: 'summer', shape: 'berry', color: '#D9506E', price: 15 },
  { id: 'daisy', name: 'Daisy', season: 'summer', shape: 'flower', color: '#F5F2E6', price: 12 },
  { id: 'feather', name: 'Blue feather', season: 'summer', shape: 'leaf', color: '#6F97C9', price: 35, rare: true },
  { id: 'chamomile', name: 'Chamomile', season: 'summer', shape: 'flower', color: '#F0E2A0', price: 16 },
  { id: 'acorn', name: 'Acorn', season: 'autumn', shape: 'round', color: '#9C7046', price: 10 },
  { id: 'chanterelle', name: 'Chanterelle', season: 'autumn', shape: 'mushroom', color: '#E3A94A', price: 30 },
  { id: 'maple_leaf', name: 'Maple leaf', season: 'autumn', shape: 'leaf', color: '#D0603A', price: 12 },
  { id: 'blackberry', name: 'Blackberry', season: 'autumn', shape: 'berry', color: '#4A3550', price: 18 },
  { id: 'pinecone', name: 'Pinecone', season: 'winter', shape: 'cone', color: '#8A6844', price: 12 },
  { id: 'holly', name: 'Holly sprig', season: 'winter', shape: 'berry', color: '#C23B3B', price: 20 },
  { id: 'snow_crystal', name: 'Snow crystal', season: 'winter', shape: 'crystal', color: '#DCEEF7', price: 35, rare: true },
  { id: 'winter_root', name: 'Winter root', season: 'winter', shape: 'root', color: '#A88A6A', price: 22 },
];

export const TREE_FRUIT = {
  spring: { id: 'cherry', name: 'Cherry', shape: 'berry', color: '#C93A4A', price: 20 },
  summer: { id: 'peach', name: 'Peach', shape: 'round', color: '#F0A27A', price: 25 },
  autumn: { id: 'apple', name: 'Apple', shape: 'round', color: '#C9483A', price: 25 },
  winter: { id: 'orange', name: 'Orange', shape: 'round', color: '#EE9A3A', price: 30 },
};

export const MINERALS = [
  { id: 'stone', name: 'Stone', shape: 'stone', color: '#9A958A', price: 2 },
  { id: 'copper_ore', name: 'Copper ore', shape: 'ore', color: '#D0844A', price: 8 },
  { id: 'iron_ore', name: 'Iron ore', shape: 'ore', color: '#C9C2B8', price: 15 },
  { id: 'gold_ore', name: 'Gold ore', shape: 'ore', color: '#EBC54A', price: 30 },
  { id: 'quartz', name: 'Quartz', shape: 'gem', color: '#EEEBE6', price: 20 },
  { id: 'amethyst', name: 'Amethyst', shape: 'gem', color: '#9C6FC0', price: 45 },
  { id: 'topaz', name: 'Topaz', shape: 'gem', color: '#E8B04A', price: 55 },
  { id: 'crystal_shard', name: 'Crystal shard', shape: 'crystal', color: '#A9E0E8', price: 60 },
  { id: 'emerald', name: 'Emerald', shape: 'gem', color: '#3FA86A', price: 90 },
  { id: 'ruby', name: 'Ruby', shape: 'gem', color: '#C92F4A', price: 110 },
  { id: 'diamond', name: 'Diamond', shape: 'gem', color: '#F2FAFF', price: 200 },
  { id: 'geode', name: 'Geode', shape: 'geode', color: '#8F8579', price: 25 },
  { id: 'amber_beetle', name: 'Beetle in amber', shape: 'fossil', color: '#E3A23A', price: 80 },
  { id: 'shell_fossil', name: 'Shell fossil', shape: 'fossil', color: '#D8CDB5', price: 60 },
  { id: 'fern_fossil', name: 'Fern fossil', shape: 'fossil', color: '#A7B08F', price: 70 },
  { id: 'tiny_bone', name: 'Tiny bone', shape: 'fossil', color: '#EFE6D2', price: 50 },
];

export const FOSSILS = ['amber_beetle', 'shell_fossil', 'fern_fossil', 'tiny_bone'];

// Tool tiers. Upgrades are made at the workbench.
export const TOOL_TIERS = ['Basic', 'Copper', 'Iron', 'Gold'];
export const UPGRADE_COST = [
  null,
  { ore: 'copper_ore', count: 5, pebbles: 150 },
  { ore: 'iron_ore', count: 5, pebbles: 400 },
  { ore: 'gold_ore', count: 5, pebbles: 900 },
];
export const ROD_ZONE = [30, 36, 42, 48]; // catch-zone height in the fishing minigame
export const PICK_POWER = [1, 2, 3, 4];

export const BAG_SLOTS = 24;
export const STACK = 99;
export const DAILY_BITES = 10;
export const MINE_LAYERS = 30;
export const START_PEBBLES = 150;

// Build one registry of everything that can sit in the bag.
export const ITEMS = {};
for (const f of FISH) ITEMS[f.id] = { ...f, cat: 'fish', shape: 'fish' };
for (const j of JUNK) ITEMS[j.id] = { ...j, cat: 'junk' };
for (const c of CROPS) {
  ITEMS[c.id] = { id: c.id, name: c.name, cat: 'crop', shape: c.shape, color: c.color, price: c.price, season: c.season };
  ITEMS[c.id + '_seed'] = {
    id: c.id + '_seed', name: c.name + ' seeds', cat: 'seed', shape: 'seed', color: c.color,
    price: Math.max(1, Math.floor(c.seedPrice / 2)), crop: c.id, season: c.season,
  };
}
for (const f of FORAGE) ITEMS[f.id] = { ...f, cat: 'forage' };
for (const f of Object.values(TREE_FRUIT)) ITEMS[f.id] = { ...f, cat: 'forage' };
for (const m of MINERALS) ITEMS[m.id] = { ...m, cat: FOSSILS.includes(m.id) ? 'fossil' : 'mineral' };

export const CROP_BY_ID = Object.fromEntries(CROPS.map(c => [c.id, c]));
export const FISH_BY_ID = Object.fromEntries(FISH.map(f => [f.id, f]));

// Avatar options. No option is tied to a gender.
export const SKIN_TONES = ['#F6D7BE', '#E8B994', '#C98E66', '#9A6544', '#6B4430'];
export const HAIR_COLORS = ['#2E2420', '#5B3A29', '#9A5B34', '#D9A55B', '#E9D7A8', '#C68F89', '#6F8FB0'];
export const HAIR_STYLES = ['Short', 'Bob', 'Long', 'Curly', 'Bun', 'Buzz'];
export const OUTFIT_COLORS = ['#6F925B', '#C68F89', '#79AAA4', '#B88D60', '#8C7BB0', '#E0B45A'];
export const OUTFIT_STYLES = ['Tee', 'Overalls', 'Dress'];
