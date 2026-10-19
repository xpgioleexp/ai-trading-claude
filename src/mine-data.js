// Everything in the mine: its six zones, rocks, ores, gems, fossils, artifacts,
// geodes, cave fish, grotto plants and monsters. Add a row to add content.
import { ITEMS, MINERALS } from './data.js';

// Six zones of ten layers. Each looks different and has its own rocks and monsters.
export const BANDS = [
  { name: 'Soil', wall: '#3B2E26', floor: '#6B5444', speck: '#7D6452', walls: 0.08 },
  { name: 'Stone', wall: '#34343A', floor: '#5E5B58', speck: '#6E6A66', walls: 0.1 },
  { name: 'Crystal', wall: '#2A2440', floor: '#4E4A66', speck: '#8A7FC0', walls: 0.12 },
  { name: 'Frost', wall: '#2E4452', floor: '#8FA9B5', speck: '#D6E8EE', walls: 0.12 },
  { name: 'Ember', wall: '#2A1614', floor: '#4A2E26', speck: '#C9583A', walls: 0.14 },
  { name: 'Starfall', wall: '#120F24', floor: '#2A2546', speck: '#F2E48A', walls: 0.12 },
];

// New mine items. [id, name, shape, color, price]
const NEW_MINERALS = [
  ['coal', 'Coal', 'ore', '#2E2A2A', 6],
  ['tin_ore', 'Tin ore', 'ore', '#B8B8A8', 10],
  ['silver_ore', 'Silver ore', 'ore', '#D8DEE6', 22],
  ['cobalt_ore', 'Cobalt ore', 'ore', '#3F6FD9', 40],
  ['mythril_ore', 'Mythril ore', 'ore', '#7FE0D0', 60],
  ['obsidian', 'Obsidian', 'ore', '#3A2A4A', 70],
  ['emberite', 'Emberite', 'ore', '#E8603A', 85],
  ['starmetal_ore', 'Starmetal ore', 'ore', '#F2E48A', 120],
  ['meteorite', 'Meteorite', 'stone', '#5A5066', 150],
  ['garnet', 'Garnet', 'gem', '#9A2A3A', 50],
  ['jade', 'Jade', 'gem', '#5FAF7A', 65],
  ['opal', 'Opal', 'gem', '#E8E0F0', 80],
  ['aquamarine', 'Aquamarine', 'gem', '#7FD0E0', 95],
  ['sapphire', 'Sapphire', 'gem', '#3A5FC9', 130],
  ['moonstone', 'Moonstone', 'gem', '#DCE6F2', 120],
  ['onyx', 'Onyx', 'gem', '#2A2A30', 110],
  ['fire_opal', 'Fire opal', 'gem', '#F0703A', 160],
  ['sunstone', 'Sunstone', 'gem', '#F0A040', 150],
  ['star_sapphire', 'Star sapphire', 'gem', '#5A7AF0', 260],
  ['prismatic_shard', 'Prismatic shard', 'crystal', '#FF88CC', 500],
  ['frozen_geode', 'Frozen geode', 'geode', '#9FC3D0', 45],
  ['magma_geode', 'Magma geode', 'geode', '#9A4A3A', 60],
  ['omni_geode', 'Omni geode', 'geode', '#7A6A9A', 90],
];
const NEW_FOSSILS = [
  ['trilobite', 'Trilobite', 'fossil', '#9A8A70', 90],
  ['ammonite', 'Ammonite', 'fossil', '#C9A272', 95],
  ['dino_tooth', 'Dinosaur tooth', 'fossil', '#EFE6D2', 140],
  ['mammoth_hair', 'Mammoth hair', 'fossil', '#8A6448', 120],
  ['frozen_flower', 'Frozen flower', 'fossil', '#C9E0F0', 110],
  ['ash_leaf', 'Leaf in ash', 'fossil', '#5A4A44', 130],
];
const ARTIFACTS = [
  ['old_coin', 'Old coin', 'button', '#D9A53A', 60],
  ['clay_pot', 'Clay pot', 'bottle', '#C9783A', 70],
  ['lost_ring', 'Lost ring', 'gem', '#E8C25A', 150],
  ['ancient_doll', 'Ancient doll', 'fossil', '#B88D60', 180],
  ['star_map', 'Star map', 'seed', '#3F5A7A', 300],
];
for (const [id, name, shape, color, price] of NEW_MINERALS) {
  ITEMS[id] = { id, name, cat: 'mineral', shape, color, price };
  MINERALS.push(ITEMS[id]);
}
for (const [id, name, shape, color, price] of NEW_FOSSILS) {
  ITEMS[id] = { id, name, cat: 'fossil', shape, color, price };
  MINERALS.push(ITEMS[id]);
}
for (const [id, name, shape, color, price] of ARTIFACTS) {
  ITEMS[id] = { id, name, cat: 'artifact', shape, color, price };
  MINERALS.push(ITEMS[id]);
}

// Rocks. drop: an item id, or a list to pick from by zone (fossil, artifact).
// style decides the placeholder look: plain, ore, gem, fossil, geode.
export const ROCKS = {
  stone: { hp: 2, drop: 'stone', n: [1, 2], style: 'plain' },
  ice: { hp: 2, drop: 'stone', n: [1, 2], style: 'plain', tint: '#BFDCE6' },
  basalt: { hp: 3, drop: 'stone', n: [1, 3], style: 'plain', tint: '#3E3434' },
  coal: { hp: 2, drop: 'coal', n: [1, 3], style: 'ore' },
  copper: { hp: 3, drop: 'copper_ore', n: [1, 3], style: 'ore' },
  tin: { hp: 3, drop: 'tin_ore', n: [1, 3], style: 'ore' },
  iron: { hp: 4, drop: 'iron_ore', n: [1, 3], style: 'ore' },
  silver: { hp: 4, drop: 'silver_ore', n: [1, 3], style: 'ore' },
  gold: { hp: 5, drop: 'gold_ore', n: [1, 3], style: 'ore' },
  cobalt: { hp: 5, drop: 'cobalt_ore', n: [1, 3], style: 'ore' },
  mythril: { hp: 6, drop: 'mythril_ore', n: [1, 2], style: 'ore' },
  obsidian: { hp: 6, drop: 'obsidian', n: [1, 2], style: 'ore' },
  emberite: { hp: 6, drop: 'emberite', n: [1, 2], style: 'ore' },
  starmetal: { hp: 7, drop: 'starmetal_ore', n: [1, 2], style: 'ore' },
  meteorite: { hp: 7, drop: 'meteorite', n: [1, 1], style: 'ore' },
  quartz: { hp: 3, drop: 'quartz', style: 'gem' },
  amethyst: { hp: 4, drop: 'amethyst', style: 'gem' },
  topaz: { hp: 4, drop: 'topaz', style: 'gem' },
  garnet: { hp: 4, drop: 'garnet', style: 'gem' },
  jade: { hp: 4, drop: 'jade', style: 'gem' },
  opal: { hp: 5, drop: 'opal', style: 'gem' },
  crystal: { hp: 5, drop: 'crystal_shard', style: 'gem' },
  emerald: { hp: 5, drop: 'emerald', style: 'gem' },
  ruby: { hp: 5, drop: 'ruby', style: 'gem' },
  aquamarine: { hp: 5, drop: 'aquamarine', style: 'gem' },
  sapphire: { hp: 6, drop: 'sapphire', style: 'gem' },
  moonstone: { hp: 6, drop: 'moonstone', style: 'gem' },
  onyx: { hp: 6, drop: 'onyx', style: 'gem' },
  fire_opal: { hp: 6, drop: 'fire_opal', style: 'gem' },
  sunstone: { hp: 6, drop: 'sunstone', style: 'gem' },
  star_sapphire: { hp: 7, drop: 'star_sapphire', style: 'gem' },
  prismatic: { hp: 8, drop: 'prismatic_shard', style: 'gem' },
  diamond: { hp: 6, drop: 'diamond', style: 'gem' },
  geode: { hp: 3, drop: 'geode', style: 'geode' },
  frozen_geode: { hp: 4, drop: 'frozen_geode', style: 'geode' },
  magma_geode: { hp: 5, drop: 'magma_geode', style: 'geode' },
  omni_geode: { hp: 6, drop: 'omni_geode', style: 'geode' },
  fossil: { hp: 3, drop: 'fossil', style: 'fossil' },
  artifact: { hp: 3, drop: 'artifact', style: 'fossil', tint: '#B5A48A' },
};

export const ROCK_TABLE = [
  { stone: 55, coal: 12, copper: 18, tin: 8, quartz: 4, fossil: 3, geode: 3, artifact: 2 },
  { stone: 45, coal: 8, iron: 18, tin: 6, silver: 8, amethyst: 4, topaz: 3, garnet: 3, geode: 3, fossil: 2, artifact: 2 },
  { stone: 40, iron: 8, silver: 8, gold: 14, crystal: 6, jade: 4, opal: 3, emerald: 3, ruby: 2, diamond: 1, geode: 4, artifact: 1 },
  { ice: 42, cobalt: 16, mythril: 8, silver: 6, aquamarine: 5, sapphire: 3, moonstone: 3, frozen_geode: 5, fossil: 3 },
  { basalt: 42, obsidian: 14, emberite: 12, gold: 8, fire_opal: 4, sunstone: 4, onyx: 4, ruby: 3, magma_geode: 5, fossil: 3 },
  { stone: 38, starmetal: 14, meteorite: 8, mythril: 6, star_sapphire: 4, prismatic: 1, moonstone: 4, diamond: 3, omni_geode: 6, artifact: 3 },
];

export const FOSSILS_BY_BAND = [
  ['shell_fossil', 'fern_fossil', 'tiny_bone'],
  ['amber_beetle', 'trilobite', 'ammonite'],
  ['dino_tooth', 'amber_beetle', 'ammonite'],
  ['mammoth_hair', 'frozen_flower'],
  ['ash_leaf', 'dino_tooth'],
  ['dino_tooth'],
];
export const ARTIFACTS_BY_BAND = [
  ['old_coin', 'clay_pot'], ['old_coin', 'clay_pot', 'lost_ring'], ['lost_ring', 'ancient_doll'],
  ['ancient_doll'], ['ancient_doll', 'lost_ring'], ['star_map', 'ancient_doll'],
];

// What each kind of geode can hold. Crack them at the workbench.
export const GEODE_CONTENTS = {
  geode: ['quartz', 'amethyst', 'topaz', 'garnet', 'jade', 'opal', 'coal', 'copper_ore', 'iron_ore', 'silver_ore', 'emerald'],
  frozen_geode: ['aquamarine', 'sapphire', 'moonstone', 'cobalt_ore', 'mythril_ore', 'frozen_flower', 'opal'],
  magma_geode: ['fire_opal', 'sunstone', 'onyx', 'obsidian', 'emberite', 'ruby', 'ash_leaf'],
  omni_geode: ['star_sapphire', 'moonstone', 'diamond', 'ruby', 'emerald', 'sapphire', 'fire_opal', 'starmetal_ore', 'prismatic_shard'],
};
export const GEODES = Object.keys(GEODE_CONTENTS);

// ---------- cave fish (from the underground lakes) ----------

const CAVE_FISH = [
  ['cavefish', 'Blind cavefish', '#E9D7D0', 'common', [8, 20], 40, 2, [0, 1]],
  ['ghost_shrimp', 'Ghost shrimp', '#E0EEF0', 'common', [3, 8], 50, 2, [0, 1, 2]],
  ['crystal_carp', 'Crystal carp', '#B9A8E0', 'uncommon', [20, 50], 120, 3, [2]],
  ['ice_eel', 'Ice eel', '#A9D9E8', 'uncommon', [40, 90], 160, 4, [3]],
  ['lava_eel', 'Lava eel', '#E8603A', 'rare', [40, 100], 220, 5, [4]],
  ['void_angler', 'Void angler', '#5E4A7A', 'rare', [30, 70], 320, 5, [5]],
];
for (const [id, name, color, rarity, size, price, difficulty, bands] of CAVE_FISH) {
  ITEMS[id] = { id, name, cat: 'fish', shape: 'fish', color, rarity, size, price, difficulty, bands, cave: true };
}
export const CAVE_FISH_IDS = CAVE_FISH.map(f => f[0]);
export const CAVE_BITES = 5;

// ---------- grotto plants ----------

const GROTTO = [
  ['cave_mushroom', 'Cave mushroom', 'mushroom', '#C9B48A', 30],
  ['cave_moss', 'Cave moss', 'leaf', '#6F9A5A', 20],
  ['crystal_fern', 'Crystal fern', 'leaf', '#A9C9E8', 55],
  ['frost_fern', 'Frost fern', 'leaf', '#DCEEF7', 60],
  ['ember_bloom', 'Ember bloom', 'flower', '#F0703A', 80],
  ['star_moss', 'Star moss', 'leaf', '#E9F08A', 100],
];
for (const [id, name, shape, color, price] of GROTTO) ITEMS[id] = { id, name, cat: 'forage', shape, color, price, cave: true };
export const GROTTO_IDS = GROTTO.map(g => g[0]);
export const GROTTO_BY_BAND = [
  ['cave_mushroom', 'cave_moss'], ['cave_moss', 'cave_mushroom'], ['crystal_fern', 'cave_mushroom'],
  ['frost_fern', 'cave_moss'], ['ember_bloom', 'cave_mushroom'], ['star_moss', 'crystal_fern'],
];

// ---------- monsters ----------

// shape decides the placeholder art. step: seconds per tile. rate: seconds between attacks.
// flies: crosses over rocks. hides: looks like a rock until you're close.
// drops: [item, chance]. boss: one per zone, on its last layer.
export const MONSTERS = {
  slime: { name: 'Green slime', band: 0, shape: 'slime', color: '#7FC95A', hp: 6, dmg: 4, step: 0.75, rate: 1.4, drops: [['slime_gel', 0.8]] },
  grub: { name: 'Cave grub', band: 0, shape: 'grub', color: '#D9C9A0', hp: 4, dmg: 3, step: 0.55, rate: 1.2, drops: [['grub_shell', 0.6]] },
  big_slime: { name: 'King slime', band: 0, shape: 'slime', color: '#5FAF4A', hp: 40, dmg: 8, step: 0.9, rate: 1.8, boss: true, drops: [['slime_crown', 1], ['slime_gel', 1]] },
  bat: { name: 'Cave bat', band: 1, shape: 'bat', color: '#6A5A7A', hp: 8, dmg: 6, step: 0.35, rate: 1.2, flies: true, drops: [['bat_wing', 0.7]] },
  rock_crab: { name: 'Rock crab', band: 1, shape: 'crab', color: '#8A8378', hp: 16, dmg: 7, step: 0.8, rate: 1.4, hides: true, drops: [['crab_shell', 0.8], ['iron_ore', 0.3]] },
  stone_golem: { name: 'Stone golem', band: 1, shape: 'golem', color: '#7D7A74', hp: 80, dmg: 12, step: 1, rate: 1.9, boss: true, drops: [['golem_heart', 1], ['gold_ore', 1]] },
  crystal_sprite: { name: 'Crystal sprite', band: 2, shape: 'wisp', color: '#A9E0E8', hp: 14, dmg: 9, step: 0.45, rate: 1.3, flies: true, drops: [['crystal_dust', 0.8]] },
  gem_slime: { name: 'Gem slime', band: 2, shape: 'slime', color: '#C9A0E0', hp: 18, dmg: 9, step: 0.7, rate: 1.4, drops: [['slime_gel', 0.5], ['emerald', 0.15], ['ruby', 0.1]] },
  crystal_wyrm: { name: 'Crystal wyrm', band: 2, shape: 'wyrm', color: '#8A7FC0', hp: 120, dmg: 15, step: 0.8, rate: 1.9, boss: true, drops: [['wyrm_scale', 1], ['diamond', 1]] },
  frost_slime: { name: 'Frost slime', band: 3, shape: 'slime', color: '#BFE6F2', hp: 24, dmg: 12, step: 0.75, rate: 1.4, drops: [['frost_core', 0.6]] },
  snow_wisp: { name: 'Snow wisp', band: 3, shape: 'wisp', color: '#F2FAFF', hp: 20, dmg: 13, step: 0.4, rate: 1.3, flies: true, drops: [['wisp_essence', 0.7]] },
  yeti: { name: 'Cave yeti', band: 3, shape: 'golem', color: '#E9EEF0', hp: 160, dmg: 18, step: 0.9, rate: 2, boss: true, drops: [['yeti_fur', 1], ['sapphire', 1]] },
  magma_slime: { name: 'Magma slime', band: 4, shape: 'slime', color: '#E8603A', hp: 32, dmg: 15, step: 0.7, rate: 1.4, drops: [['ember_core', 0.6]] },
  fire_bat: { name: 'Fire bat', band: 4, shape: 'bat', color: '#D9533C', hp: 26, dmg: 16, step: 0.35, rate: 1.2, flies: true, drops: [['fire_feather', 0.6], ['bat_wing', 0.3]] },
  ember_golem: { name: 'Ember golem', band: 4, shape: 'golem', color: '#8A3A2A', hp: 220, dmg: 22, step: 0.9, rate: 2, boss: true, drops: [['magma_heart', 1], ['fire_opal', 1]] },
  star_jelly: { name: 'Star jelly', band: 5, shape: 'jelly', color: '#F2E48A', hp: 40, dmg: 18, step: 0.55, rate: 1.4, flies: true, drops: [['stardust', 0.8]] },
  void_moth: { name: 'Void moth', band: 5, shape: 'moth', color: '#5E4A7A', hp: 36, dmg: 20, step: 0.4, rate: 1.3, flies: true, drops: [['void_wing', 0.7]] },
  star_guardian: { name: 'Star guardian', band: 5, shape: 'jelly', color: '#9C82C9', hp: 300, dmg: 26, step: 0.8, rate: 2, boss: true, flies: true, drops: [['star_heart', 1], ['star_sapphire', 1]] },
};
export const MONSTER_IDS = Object.keys(MONSTERS);

const LOOT = [
  ['slime_gel', 'Slime gel', 'round', '#7FC95A', 8], ['grub_shell', 'Grub shell', 'seed', '#D9C9A0', 6],
  ['bat_wing', 'Bat wing', 'leaf', '#6A5A7A', 15], ['crab_shell', 'Crab shell', 'round', '#8A8378', 20],
  ['crystal_dust', 'Crystal dust', 'crystal', '#A9E0E8', 30], ['frost_core', 'Frost core', 'crystal', '#BFE6F2', 40],
  ['wisp_essence', 'Wisp essence', 'bottle', '#F2FAFF', 45], ['ember_core', 'Ember core', 'crystal', '#E8603A', 55],
  ['fire_feather', 'Fire feather', 'leaf', '#D9533C', 60], ['stardust', 'Stardust', 'crystal', '#F2E48A', 80],
  ['void_wing', 'Void wing', 'leaf', '#5E4A7A', 90],
  ['slime_crown', 'Slime crown', 'gem', '#5FAF4A', 200], ['golem_heart', 'Golem heart', 'stone', '#7D7A74', 300],
  ['wyrm_scale', 'Wyrm scale', 'crystal', '#8A7FC0', 400], ['yeti_fur', 'Yeti fur', 'leaf', '#E9EEF0', 500],
  ['magma_heart', 'Magma heart', 'stone', '#8A3A2A', 650], ['star_heart', 'Star heart', 'gem', '#9C82C9', 900],
];
for (const [id, name, shape, color, price] of LOOT) ITEMS[id] = { id, name, cat: 'loot', shape, color, price };
export const LOOT_IDS = LOOT.map(l => l[0]);

export const monstersOfBand = band => MONSTER_IDS.filter(id => MONSTERS[id].band === band && !MONSTERS[id].boss);
export const bossOfBand = band => MONSTER_IDS.find(id => MONSTERS[id].band === band && MONSTERS[id].boss);

// ---------- you ----------

export const START_HP = 100;
export const BOSS_HP_BONUS = 20;
// The sword uses the same tiers as the other tools.
export const SWORD_DAMAGE = [3, 5, 7, 10, 13, 17, 22];

const FRUIT = new Set(['cherry', 'peach', 'apple', 'orange', 'coconut', 'honey']);

// How much eating something heals.
export function healOf(item) {
  if (!item) return 0;
  if (item.cat === 'dish') return 40;
  if (item.cat === 'crop' || item.cat === 'produce' || FRUIT.has(item.id)) return 12;
  if (item.cat === 'forage' && ['berry', 'mushroom', 'root'].includes(item.shape)) return 8;
  return 0;
}
