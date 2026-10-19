// Weather you can feel: storms that knock branches down, windy days that blow
// leaves past, puddles after rain, rainbows when it clears, sunshowers, frosty
// winter mornings and summer heatwaves. Pure rules. Everything comes from the
// jar's seed, so you both get the same weather, puddles and fallen branches;
// what you pick up is your own (state.daily.wx).
import { ITEMS, FISH } from './data.js';
import { addBugs } from './bugs.js';
import { rngFor, shuffle, randInt } from './rng.js';
import { seasonOf, weatherOf, isWet, isNightHour } from './clock.js';
import { addItem } from './rules.js';

export const WEATHER_NAMES = {
  sun: 'Clear', rain: 'Rain', snow: 'Snow', fog: 'Fog', wind: 'Windy', storm: 'Thunderstorm', blizzard: 'Blizzard', heat: 'Heatwave',
};

export const WEATHER_TEXT = {
  sun: 'Clear skies.',
  rain: 'Rain waters every garden bed. Rain fish and bugs come out, and puddles appear.',
  snow: 'Snow waters every garden bed.',
  fog: 'A soft fog over the jar.',
  wind: 'Leaves blow past all day. Tap one to catch it.',
  storm: 'Thunder and lightning! The wind knocks branches down from the trees, and lightning can leave glass where it strikes. People stay indoors.',
  blizzard: 'Heavy snow and wind. Branches come down, and people stay indoors.',
  heat: 'A summer heatwave. Everyone moves slowly, and a golden carp swims near the surface.',
};

// ---------- what you can find ----------

const NEW_ITEMS = [
  ['branch', 'Fallen branch', 'material', 'root', '#7A5A3A', 5],
  ['birds_nest', 'Empty bird nest', 'forage', 'round', '#B88D60', 45],
  ['lightning_glass', 'Lightning glass', 'forage', 'crystal', '#C9E8F2', 160],
  ['rainbow_shard', 'Rainbow shard', 'forage', 'gem', '#F2A6C9', 120],
  ['shiny_pebble', 'Shiny pebble', 'forage', 'stone', '#9FB7C2', 15],
  ['gust_leaf', 'Windblown leaf', 'forage', 'leaf', '#C9A25A', 6],
  ['golden_leaf', 'Golden leaf', 'forage', 'leaf', '#E8C25A', 80],
  ['frost_flower', 'Frost flower', 'forage', 'flower', '#DCEFF6', 30],
];
for (const [id, name, cat, shape, color, price] of NEW_ITEMS) ITEMS[id] = { id, name, cat, shape, color, price, weatherFind: true };

// Weather-only fish (meadow ponds) and bugs.
const WEATHER_FISH = [
  { id: 'thunderfin', name: 'Thunderfin', color: '#4F5F8A', rarity: 'rare', weather: 'storm', size: [30, 70], price: 180, difficulty: 4 },
  { id: 'golden_carp', name: 'Golden carp', color: '#E8B83A', rarity: 'rare', seasons: ['summer'], weather: 'heat', size: [25, 50], price: 150, difficulty: 3 },
  { id: 'breeze_minnow', name: 'Breeze minnow', color: '#9FC9C0', rarity: 'common', weather: 'wind', size: [4, 9], price: 30, difficulty: 1 },
];
for (const f of WEATHER_FISH) {
  FISH.push(f);
  ITEMS[f.id] = { ...f, cat: 'fish', shape: 'fish' };
}
addBugs([
  { id: 'kite_moth', name: 'Kite moth', kind: 'butterfly', color: '#E0873A', time: 'day', weather: 'wind', where: 'flower', rarity: 'uncommon', price: 70, skittish: 0.7 },
  { id: 'storm_beetle', name: 'Storm beetle', kind: 'beetle', color: '#3F4F7A', weather: 'storm', where: 'tree', rarity: 'rare', price: 160, skittish: 0.4 },
  { id: 'heat_cicada', name: 'Heat cicada', kind: 'small', color: '#7A8A4A', seasons: ['summer'], time: 'day', weather: 'heat', where: 'tree', rarity: 'uncommon', price: 65, skittish: 0.3 },
]);

// ---------- the weather right now ----------

const STORMY = new Set(['storm', 'blizzard']);
export const isStormy = w => STORMY.has(w);

// The day's weather, plus what it's doing this hour.
// kind: what's falling or blowing now. base: the day's weather.
// rainbow: one is out. puddles: there are puddles. sunshower: rain in the sun.
// frost: a frosty winter morning. clearAt: the hour the rain stops (or null).
export function weatherNow(seed, day, hour) {
  const base = weatherOf(seed, day);
  const season = seasonOf(day);
  const rand = rngFor(seed, 'weather-detail', day);
  const night = isNightHour(hour);
  let kind = base, rainbow = false, sunshower = false;
  // Half the rainy days and every storm clear up in the afternoon, and a rainbow follows.
  const clears = (base === 'rain' && rand() < 0.5) || base === 'storm';
  const clearAt = clears ? randInt(rand, 14, 17) : null;
  if (clearAt != null && hour >= clearAt) {
    kind = 'sun';
    rainbow = hour < clearAt + 2 && !night;
  }
  // Now and then a spring or summer day has a short sunshower, then a rainbow.
  const showerAt = base === 'sun' && (season === 'spring' || season === 'summer') && rand() < 0.2 ? randInt(rand, 10, 16) : null;
  if (showerAt != null && hour === showerAt) { kind = 'rain'; sunshower = true; }
  if (showerAt != null && hour === showerAt + 1) rainbow = true;
  const wetYesterday = ['rain', 'storm'].includes(weatherOf(seed, day - 1));
  const puddles = base === 'rain' || base === 'storm' || sunshower || (showerAt != null && hour > showerAt) || (wetYesterday && hour < 11);
  const frost = season === 'winter' && !isWet(base) && hour >= 5 && hour < 10;
  return { kind, base, rainbow, puddles, sunshower, frost, clearAt, showerAt };
}

// Tomorrow's weather, for the forecast.
export function forecast(seed, day) {
  return weatherOf(seed, day + 1);
}

// ---------- spots ----------

// tiles: open tiles to pick from. taken: "c,r" keys to keep clear.
function pickTiles(rand, tiles, n, taken) {
  return shuffle(rand, tiles.filter(t => !taken.has(t.c + ',' + t.r))).slice(0, n).map(t => ({ c: t.c, r: t.r }));
}

// Puddles on open ground. Some have a shiny pebble in them.
export function puddleSpots(seed, day, place, tiles, taken = new Set()) {
  const rand = rngFor(seed, 'puddles', place, day);
  return pickTiles(rand, tiles, randInt(rand, 6, 9), taken).map(t => ({ ...t, find: rand() < 0.3 }));
}

// Storms knock branches down near the trees.
export function branchSpots(seed, day, place, treeTiles, taken = new Set()) {
  const rand = rngFor(seed, 'branches', place, day);
  return pickTiles(rand, treeTiles, randInt(rand, 4, 7), taken).map(t => ({ ...t, nest: rand() < 0.12 }));
}

// Where the lightning struck (storms only).
export function strikeSpot(seed, day, place, tiles, taken = new Set()) {
  return pickTiles(rngFor(seed, 'strike', place, day), tiles, 1, taken)[0] || null;
}

// The end of the rainbow: a little pot of treasure on the ground.
export function rainbowEnd(seed, day, place, tiles, taken = new Set()) {
  return pickTiles(rngFor(seed, 'rainbow-end', place, day), tiles, 1, taken)[0] || null;
}

// Frost flowers on frosty mornings.
export function frostSpots(seed, day, place, tiles, taken = new Set()) {
  const rand = rngFor(seed, 'frost', place, day);
  return pickTiles(rand, tiles, randInt(rand, 2, 4), taken);
}

// ---------- picking things up ----------

// Your own record of what you've picked up today, for one place.
export function wxDaily(state, place) {
  const all = (state.daily.wx ||= {});
  return (all[place] ||= { branches: [], splashed: [], frost: [], rainbow: false, strike: false });
}

export const LEAVES_PER_DAY = 12;
export const RAINBOW_PEBBLES = 100;

const give = (state, id, n = 1) => addItem(state, id, n);

export function pickBranch(state, place, i, spot) {
  const d = wxDaily(state, place);
  if (d.branches.includes(i)) return null;
  if (!give(state, 'branch', 1)) return null;
  d.branches.push(i);
  const got = ['branch'];
  if (spot.nest && give(state, 'birds_nest', 1)) got.push('birds_nest');
  return got;
}

// Jumping in a puddle. Returns the find, '' for a plain splash, or null if
// you already splashed in this one today.
export function splashPuddle(state, place, i, spot) {
  const d = wxDaily(state, place);
  if (d.splashed.includes(i)) return null;
  d.splashed.push(i);
  if (spot.find && give(state, 'shiny_pebble', 1)) return 'shiny_pebble';
  return '';
}

export function takeStrike(state, place) {
  const d = wxDaily(state, place);
  if (d.strike || !give(state, 'lightning_glass', 1)) return false;
  d.strike = true;
  return true;
}

export function takeRainbow(state, place) {
  const d = wxDaily(state, place);
  if (d.rainbow || !give(state, 'rainbow_shard', 1)) return false;
  d.rainbow = true;
  state.pebbles += RAINBOW_PEBBLES;
  return true;
}

export function pickFrost(state, place, i) {
  const d = wxDaily(state, place);
  if (d.frost.includes(i) || !give(state, 'frost_flower', 1)) return false;
  d.frost.push(i);
  return true;
}

// Catching a leaf on the wind. One in twelve is golden.
export function catchLeaf(state, rand) {
  state.daily.leaves = state.daily.leaves || 0;
  if (state.daily.leaves >= LEAVES_PER_DAY) return null;
  const id = rand() < 1 / 12 ? 'golden_leaf' : 'gust_leaf';
  if (!give(state, id, 1)) return null;
  state.daily.leaves++;
  return id;
}
