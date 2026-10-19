// Bug catching: who's out depends on the season, time and weather.
// Pure rules; the jar draws the bugs and handles sneaking up on them.
import { ITEMS } from './data.js';
import { rngFor, pickWeighted, shuffle } from './rng.js';
import { isNightHour, weatherMatches } from './clock.js';
import { addItem } from './rules.js';

// where: flower (open grass), ground, tree, pond. skittish: 0 calm .. 1 very jumpy.
// seasons/time/weather null = any.
export const BUGS = [
  { id: 'cabbage_white', name: 'Cabbage white', kind: 'butterfly', color: '#F2EDE4', seasons: ['spring', 'summer'], time: 'day', where: 'flower', rarity: 'common', price: 15, skittish: 0.5 },
  { id: 'peacock_butterfly', name: 'Peacock butterfly', kind: 'butterfly', color: '#B5324A', seasons: ['spring'], time: 'day', where: 'flower', rarity: 'uncommon', price: 50, skittish: 0.6 },
  { id: 'swallowtail', name: 'Swallowtail', kind: 'butterfly', color: '#E8C25A', seasons: ['summer'], time: 'day', where: 'flower', rarity: 'uncommon', price: 60, skittish: 0.7 },
  { id: 'monarch', name: 'Monarch', kind: 'butterfly', color: '#E0873A', seasons: ['autumn'], time: 'day', where: 'flower', rarity: 'uncommon', price: 70, skittish: 0.7 },
  { id: 'blue_morpho', name: 'Blue morpho', kind: 'butterfly', color: '#4F6FB3', seasons: ['summer'], time: 'day', where: 'flower', rarity: 'rare', price: 150, skittish: 0.9 },
  { id: 'moth', name: 'Moth', kind: 'butterfly', color: '#B5A48A', seasons: ['spring', 'summer', 'autumn'], time: 'night', where: 'flower', rarity: 'common', price: 20, skittish: 0.4 },
  { id: 'luna_moth', name: 'Luna moth', kind: 'butterfly', color: '#B9E0A0', seasons: ['summer'], time: 'night', where: 'tree', rarity: 'rare', price: 160, skittish: 0.8 },
  { id: 'winter_moth', name: 'Winter moth', kind: 'butterfly', color: '#C9C2B8', seasons: ['winter'], time: 'night', where: 'flower', rarity: 'common', price: 25, skittish: 0.4 },
  { id: 'honeybee', name: 'Honeybee', kind: 'bee', color: '#E8B83A', seasons: ['spring', 'summer'], time: 'day', where: 'flower', rarity: 'common', price: 25, skittish: 0.5 },
  { id: 'bumblebee', name: 'Bumblebee', kind: 'bee', color: '#D9A53A', seasons: ['spring'], time: 'day', where: 'flower', rarity: 'common', price: 22, skittish: 0.4 },
  { id: 'ladybug', name: 'Ladybug', kind: 'beetle', color: '#C9483A', seasons: ['spring', 'summer', 'autumn'], time: 'day', where: 'ground', rarity: 'common', price: 12, skittish: 0.3 },
  { id: 'jewel_beetle', name: 'Jewel beetle', kind: 'beetle', color: '#3FA86A', seasons: ['summer'], time: 'day', where: 'tree', rarity: 'uncommon', price: 80, skittish: 0.7 },
  { id: 'rhino_beetle', name: 'Rhino beetle', kind: 'beetle', color: '#5A4130', seasons: ['summer'], time: 'night', where: 'tree', rarity: 'uncommon', price: 90, skittish: 0.5 },
  { id: 'stag_beetle', name: 'Stag beetle', kind: 'beetle', color: '#3A2A24', seasons: ['summer'], time: 'night', where: 'tree', rarity: 'rare', price: 180, skittish: 0.6 },
  { id: 'frost_beetle', name: 'Frost beetle', kind: 'beetle', color: '#9CC3E0', seasons: ['winter'], time: 'day', where: 'ground', rarity: 'uncommon', price: 60, skittish: 0.5 },
  { id: 'pill_bug', name: 'Pill bug', kind: 'beetle', color: '#7D8796', time: null, weather: 'rain', where: 'ground', rarity: 'common', price: 10, skittish: 0.2 },
  { id: 'firefly', name: 'Firefly', kind: 'firefly', color: '#E9F08A', seasons: ['spring', 'summer'], time: 'night', where: 'flower', rarity: 'common', price: 30, skittish: 0.5 },
  { id: 'frost_glow', name: 'Frost glow-worm', kind: 'firefly', color: '#CFE8F0', seasons: ['winter'], time: 'night', where: 'ground', rarity: 'uncommon', price: 65, skittish: 0.4 },
  { id: 'glow_worm', name: 'Glow-worm', kind: 'firefly', color: '#C7F0A0', seasons: ['autumn'], time: 'night', where: 'ground', rarity: 'uncommon', price: 55, skittish: 0.4 },
  { id: 'dragonfly', name: 'Dragonfly', kind: 'dragonfly', color: '#5FA8C9', seasons: ['summer', 'autumn'], time: 'day', where: 'pond', rarity: 'common', price: 35, skittish: 0.8 },
  { id: 'damselfly', name: 'Damselfly', kind: 'dragonfly', color: '#79C9B5', seasons: ['spring'], time: 'day', where: 'pond', rarity: 'common', price: 25, skittish: 0.7 },
  { id: 'water_strider', name: 'Water strider', kind: 'small', color: '#6E6A62', seasons: ['spring', 'summer'], time: 'day', where: 'pond', rarity: 'common', price: 20, skittish: 0.6 },
  { id: 'grasshopper', name: 'Grasshopper', kind: 'small', color: '#8DBA5C', seasons: ['summer'], time: 'day', where: 'ground', rarity: 'common', price: 18, skittish: 0.8 },
  { id: 'cricket', name: 'Cricket', kind: 'small', color: '#6B5440', seasons: ['autumn'], time: 'night', where: 'ground', rarity: 'common', price: 22, skittish: 0.6 },
  { id: 'cicada', name: 'Cicada', kind: 'small', color: '#8E9A5A', seasons: ['summer'], time: 'day', where: 'tree', rarity: 'common', price: 30, skittish: 0.5 },
  { id: 'stick_insect', name: 'Stick insect', kind: 'small', color: '#9C7046', seasons: ['autumn'], time: 'day', where: 'tree', rarity: 'rare', price: 120, skittish: 0.3 },
  { id: 'snow_flea', name: 'Snow flea', kind: 'small', color: '#4A5A6A', seasons: ['winter'], time: 'day', where: 'ground', rarity: 'common', price: 15, skittish: 0.3 },
  { id: 'hermit_crab', name: 'Hermit crab', kind: 'small', color: '#D9806A', map: 'beach', time: null, where: 'pond', rarity: 'common', price: 35, skittish: 0.5 },
  { id: 'sand_beetle', name: 'Sand beetle', kind: 'beetle', color: '#C9A272', map: 'beach', time: 'day', where: 'ground', rarity: 'uncommon', price: 60, skittish: 0.6 },
  { id: 'ice_beetle', name: 'Ice beetle', kind: 'beetle', color: '#A9E0E8', map: 'snow', time: null, where: 'tree', rarity: 'uncommon', price: 75, skittish: 0.5 },
  { id: 'rose_chafer', name: 'Rose chafer', kind: 'beetle', color: '#3FA86A', map: 'flower', time: 'day', where: 'flower', rarity: 'uncommon', price: 70, skittish: 0.5 },
  { id: 'orchid_mantis', name: 'Orchid mantis', kind: 'small', color: '#F2C4C8', map: 'flower', time: 'day', where: 'flower', rarity: 'rare', price: 200, skittish: 0.7 },
];
export const BUG_BY_ID = Object.fromEntries(BUGS.map(b => [b.id, b]));
for (const b of BUGS) ITEMS[b.id] = { id: b.id, name: b.name, cat: 'bug', shape: 'bug', kind: b.kind, color: b.color, price: b.price };

// Adds jar-only bugs (see biomes.js).
export function addBugs(list) {
  for (const b of list) {
    BUGS.push(b);
    BUG_BY_ID[b.id] = b;
    ITEMS[b.id] = { id: b.id, name: b.name, cat: 'bug', shape: 'bug', kind: b.kind, color: b.color, price: b.price };
  }
}

const RARITY = { common: 60, uncommon: 22, rare: 6 };
export const BUGS_AT_ONCE = 4;

export function bugAvailable(bug, season, hour, weather, mapId = null) {
  if ((bug.map || null) !== mapId && bug.map) return false;
  if (bug.seasons && !bug.seasons.includes(season)) return false;
  if (bug.time === 'night' && !isNightHour(hour)) return false;
  if (bug.time === 'day' && isNightHour(hour)) return false;
  if (!weatherMatches(bug.weather, weather)) return false;
  return true;
}

export function bugsOut(season, hour, weather, mapId = null) {
  return BUGS.filter(b => bugAvailable(b, season, hour, weather, mapId));
}

// Bugs change every two hours. The same seed, day and time give the same bugs,
// so both of you see them in the same spots.
export function timeBlock(hour) {
  return Math.floor(hour / 2);
}

// tiles: { flower, ground, tree, pond } lists of open tiles for each kind of place.
export function spawnBugs(seed, day, hour, season, weather, tiles, mapId = null) {
  const block = timeBlock(hour);
  const rand = rngFor(seed, 'bugs', mapId || 'forest', day, block);
  const pool = bugsOut(season, hour, weather, mapId);
  if (!pool.length) return [];
  const taken = new Set();
  const out = [];
  for (let i = 0; i < BUGS_AT_ONCE; i++) {
    // A jar's own bugs turn up more often than the visitors from the seasons.
    const bug = pickWeighted(rand, pool, b => RARITY[b.rarity] * (b.map ? 4 : 1));
    const spots = shuffle(rand, tiles[bug.where]?.length ? tiles[bug.where] : tiles.ground);
    const spot = spots.find(t => !taken.has(t.c + ',' + t.r));
    if (!spot) continue;
    taken.add(spot.c + ',' + spot.r);
    out.push({ sid: `${mapId ? mapId + '-' : ''}${day}-${block}-${i}`, id: bug.id, c: spot.c, r: spot.r });
  }
  return out;
}

// How fast a bug gets nervous while you move close: sneaking is slow and quiet.
export function alertRate(bug, sneaking) {
  return bug.skittish * (sneaking ? 0.45 : 2.4);
}

export const NOTICE_TILES = 3;

export function catchBug(state, spawnId, bugId) {
  state.daily.bugs = state.daily.bugs || [];
  if (state.daily.bugs.includes(spawnId)) return false;
  if (!addItem(state, bugId, 1)) return false;
  state.daily.bugs.push(spawnId);
  state.log.bugs = state.log.bugs || {};
  const entry = state.log.bugs[bugId] || { count: 0 };
  state.log.bugs[bugId] = { count: entry.count + 1 };
  return true;
}
