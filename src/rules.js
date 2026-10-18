// Game rules. Every function here is pure logic on the saved state, with no
// drawing or browser code, so it can be tested and later run on the server.
import {
  ITEMS, FISH, JUNK, CROP_BY_ID, CROPS, FORAGE, TREE_FRUIT, FOSSILS, RARITY_WEIGHT,
  BAG_SLOTS, STACK, DAILY_BITES, MINE_LAYERS, START_PEBBLES, UPGRADE_COST, PICK_POWER, TOOL_TIERS,
} from './data.js';
import { rngFor, randInt, pickWeighted, shuffle } from './rng.js';
import { seasonOf, weatherOf, isWet, isNightHour } from './clock.js';
import { BEDS, COLS, ROWS, forageTiles } from './world.js';

export const STATE_VERSION = 1;

export function newState(seed, today) {
  const season = seasonOf(today);
  const starter = CROPS.find(c => c.season === season);
  return {
    version: STATE_VERSION,
    seed,
    pebbles: START_PEBBLES,
    bag: [{ id: starter.id + '_seed', n: 3 }],
    avatar: { skin: 1, hairStyle: 0, hairColor: 1, outfit: 0, outfitStyle: 1, made: false },
    tools: { rod: 0, pick: 0 },
    garden: BEDS.map(() => ({ crop: null, count: 0, last: -1 })),
    crate: [],
    log: { fish: {}, found: {} },
    mine: { deepest: 0 },
    daily: null,
    dayOffset: 0,
  };
}

// ---------- New day ----------

// Starts a new day when the date has changed. Returns a list of things that
// happened overnight so the game can tell the player.
export function rollover(state, today) {
  if (state.daily && state.daily.day === today) return [];
  const events = [];
  if (state.daily && state.crate.length) {
    const amount = crateValue(state);
    state.pebbles += amount;
    state.crate = [];
    events.push({ type: 'payout', amount });
  }
  state.daily = {
    day: today,
    bites: DAILY_BITES,
    forage: forageSpots(state.seed, today),
    picked: [],
    shook: false,
    mine: {},
  };
  if (isWet(weatherOf(state.seed, today))) {
    let watered = 0;
    state.garden.forEach((bed, i) => { if (waterBed(state, i, today)) watered++; });
    if (watered) events.push({ type: 'rain-watered', count: watered });
  }
  return events;
}

// ---------- Bag ----------

export function countItem(state, id) {
  return state.bag.filter(s => s.id === id).reduce((sum, s) => sum + s.n, 0);
}

// Adds up to n items, stacking first. Returns how many fit.
export function addItem(state, id, n = 1) {
  if (!ITEMS[id]) throw new Error('Unknown item ' + id);
  let left = n;
  for (const slot of state.bag) {
    if (slot.id !== id || slot.n >= STACK) continue;
    const take = Math.min(left, STACK - slot.n);
    slot.n += take;
    left -= take;
    if (!left) break;
  }
  while (left > 0 && state.bag.length < BAG_SLOTS) {
    const take = Math.min(left, STACK);
    state.bag.push({ id, n: take });
    left -= take;
  }
  if (n - left > 0) markFound(state, id);
  return n - left;
}

export function removeItem(state, id, n = 1) {
  if (countItem(state, id) < n) return false;
  let left = n;
  for (let i = state.bag.length - 1; i >= 0 && left; i--) {
    const slot = state.bag[i];
    if (slot.id !== id) continue;
    const take = Math.min(left, slot.n);
    slot.n -= take;
    left -= take;
    if (!slot.n) state.bag.splice(i, 1);
  }
  return true;
}

export function bagFull(state, id) {
  if (state.bag.length < BAG_SLOTS) return false;
  return !state.bag.some(s => s.id === id && s.n < STACK);
}

export function markFound(state, id) {
  state.log.found[id] = true;
}

// ---------- Garden ----------

// Days of growth so far. Watering today only counts from tomorrow.
export function bedGrowth(bed, today) {
  return bed.count - (bed.last === today ? 1 : 0);
}

// 0 = seeds, 1 = sprout, 2 = growing, 3 = ready to pick.
export function bedStage(bed, today) {
  if (!bed.crop) return -1;
  const crop = CROP_BY_ID[bed.crop];
  const g = bedGrowth(bed, today);
  if (g >= crop.days) return 3;
  if (g <= 0) return 0;
  return g < crop.days / 2 ? 1 : 2;
}

export function plantBed(state, i, seedId) {
  const bed = state.garden[i];
  const seed = ITEMS[seedId];
  if (!bed || bed.crop || !seed || seed.cat !== 'seed') return false;
  if (!removeItem(state, seedId, 1)) return false;
  state.garden[i] = { crop: seed.crop, count: 0, last: -1 };
  return true;
}

export function waterBed(state, i, today) {
  const bed = state.garden[i];
  if (!bed || !bed.crop || bed.last === today || bedStage(bed, today) === 3) return false;
  bed.count += 1;
  bed.last = today;
  return true;
}

export function harvestBed(state, i, today) {
  const bed = state.garden[i];
  if (!bed || bedStage(bed, today) !== 3) return null;
  const crop = CROP_BY_ID[bed.crop];
  if (bagFull(state, crop.id)) return null;
  addItem(state, crop.id, 1);
  if (crop.regrow) {
    bed.count = crop.days - crop.regrow + (bed.last === today ? 1 : 0);
  } else {
    state.garden[i] = { crop: null, count: 0, last: -1 };
  }
  return crop.id;
}

// ---------- Fishing ----------

export function fishAvailable(fish, season, hour, weather) {
  if (fish.seasons && !fish.seasons.includes(season)) return false;
  if (fish.time === 'night' && !isNightHour(hour)) return false;
  if (fish.time === 'day' && isNightHour(hour)) return false;
  if (fish.weather === 'rain' && weather !== 'rain') return false;
  return true;
}

export function biteableFish(season, hour, weather) {
  return FISH.filter(f => fishAvailable(f, season, hour, weather));
}

// Decides what is on the hook. Returns { id, size } (size is null for junk).
export function rollCatch(rand, season, hour, weather) {
  if (rand() < 0.08) {
    const junk = JUNK[Math.floor(rand() * JUNK.length)];
    return { id: junk.id, size: null };
  }
  const pool = biteableFish(season, hour, weather);
  const fish = pickWeighted(rand, pool, f => RARITY_WEIGHT[f.rarity]);
  const size = Math.round((fish.size[0] + rand() * (fish.size[1] - fish.size[0])) * 10) / 10;
  return { id: fish.id, size };
}

export function useBite(state) {
  if (state.daily.bites <= 0) return false;
  state.daily.bites -= 1;
  return true;
}

// Records a landed catch. Returns true when it beat the previous best size.
export function recordCatch(state, id, size) {
  if (size == null) return false;
  const entry = state.log.fish[id] || { count: 0, best: 0 };
  const record = size > entry.best;
  state.log.fish[id] = { count: entry.count + 1, best: Math.max(entry.best, size) };
  return record && entry.count > 0;
}

// ---------- Forage and fruit ----------

export function forageSpots(seed, day) {
  const rand = rngFor(seed, 'forage', day);
  const season = seasonOf(day);
  const pool = FORAGE.filter(f => f.season === season);
  return shuffle(rand, forageTiles()).slice(0, 4).map(t => ({
    c: t.c, r: t.r, id: pickWeighted(rand, pool, f => (f.rare ? 1 : 6)).id,
  }));
}

export function pickForage(state, index) {
  const spot = state.daily.forage[index];
  if (!spot || state.daily.picked.includes(index)) return null;
  if (bagFull(state, spot.id)) return null;
  state.daily.picked.push(index);
  addItem(state, spot.id, 1);
  return spot.id;
}

export function shakeTree(state, today) {
  if (state.daily.shook) return null;
  const fruit = TREE_FRUIT[seasonOf(today)];
  if (bagFull(state, fruit.id)) return null;
  state.daily.shook = true;
  const n = addItem(state, fruit.id, 2);
  return { id: fruit.id, n };
}

// ---------- Mine ----------

export function bandOf(layer) {
  return Math.min(2, Math.floor((layer - 1) / 10));
}

export const BAND_NAMES = ['Soil', 'Stone', 'Crystal'];

const ROCK_TABLE = [
  { stone: 60, copper: 25, quartz: 6, fossil: 5, geode: 4 },
  { stone: 50, copper: 10, iron: 25, amethyst: 5, topaz: 4, geode: 4, fossil: 2 },
  { stone: 45, iron: 15, gold: 20, crystal: 8, emerald: 4, ruby: 3, diamond: 1, geode: 4 },
];

const ROCK_HP = { stone: 2, copper: 3, iron: 4, gold: 5, quartz: 3, amethyst: 4, topaz: 4, crystal: 5, emerald: 5, ruby: 5, diamond: 6, geode: 3, fossil: 3 };

export const MINE_ENTRY = { c: 8, r: 0 };
export const MINE_START = { c: 8, r: 1 };

// The rocks on one mine layer for one day. Same seed, day and layer give the same rocks.
export function layerRocks(seed, day, layer) {
  const rand = rngFor(seed, 'mine', day, layer);
  const band = bandOf(layer);
  const open = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (Math.abs(c - MINE_ENTRY.c) <= 1 && r <= 2) continue;
      open.push({ c, r });
    }
  }
  const table = Object.entries(ROCK_TABLE[band]);
  const count = 14 + randInt(rand, 0, 8);
  const rocks = shuffle(rand, open).slice(0, count).map((t, id) => {
    const kind = pickWeighted(rand, table, ([, w]) => w)[0];
    return { id, c: t.c, r: t.r, kind, hp: ROCK_HP[kind] * (band + 1), ladder: false };
  });
  if (layer < MINE_LAYERS) {
    const stones = rocks.filter(r => r.kind === 'stone');
    const pick = stones.length ? stones : rocks;
    pick[Math.floor(rand() * pick.length)].ladder = true;
  }
  return rocks;
}

export function rockHits(rock, pickTier) {
  return Math.ceil(rock.hp / PICK_POWER[pickTier]);
}

const ORE_ITEM = { copper: 'copper_ore', iron: 'iron_ore', gold: 'gold_ore' };
const GEM_ITEM = { quartz: 'quartz', amethyst: 'amethyst', topaz: 'topaz', crystal: 'crystal_shard', emerald: 'emerald', ruby: 'ruby', diamond: 'diamond' };

export function rockDrops(seed, day, layer, rock) {
  const rand = rngFor(seed, 'drop', day, layer, rock.id);
  if (rock.kind === 'stone') {
    const drops = [{ id: 'stone', n: randInt(rand, 1, 2) }];
    if (rand() < 0.08) drops.push({ id: 'copper_ore', n: 1 });
    return drops;
  }
  if (ORE_ITEM[rock.kind]) return [{ id: ORE_ITEM[rock.kind], n: randInt(rand, 1, 3) }];
  if (GEM_ITEM[rock.kind]) return [{ id: GEM_ITEM[rock.kind], n: 1 }];
  if (rock.kind === 'geode') return [{ id: 'geode', n: 1 }];
  return [{ id: FOSSILS[Math.floor(rand() * FOSSILS.length)], n: 1 }];
}

export function layerState(state, layer) {
  if (!state.daily.mine[layer]) state.daily.mine[layer] = { broken: [] };
  return state.daily.mine[layer];
}

// Breaks a rock and puts its drops in the bag. Returns the drops that fit.
export function breakRock(state, layer, rock) {
  const ls = layerState(state, layer);
  if (ls.broken.includes(rock.id)) return null;
  ls.broken.push(rock.id);
  const got = [];
  for (const d of rockDrops(state.seed, state.daily.day, layer, rock)) {
    const n = addItem(state, d.id, d.n);
    if (n) got.push({ id: d.id, n });
  }
  return got;
}

export function reachLayer(state, layer) {
  state.mine.deepest = Math.max(state.mine.deepest, layer);
}

// Layers you can start from: the top of each band you've reached.
export function elevatorStops(deepest) {
  return [1, 11, 21].filter(s => s === 1 || deepest >= s);
}

// ---------- Shop, crate and upgrades ----------

export function shopStock(season) {
  return CROPS.filter(c => c.season === season).map(c => ({ id: c.id + '_seed', price: c.seedPrice }));
}

export function buy(state, id, price) {
  if (state.pebbles < price || bagFull(state, id)) return false;
  state.pebbles -= price;
  addItem(state, id, 1);
  return true;
}

export function crateValue(state) {
  return state.crate.reduce((sum, s) => sum + ITEMS[s.id].price * s.n, 0);
}

export function putInCrate(state, id, n) {
  if (!removeItem(state, id, n)) return false;
  const slot = state.crate.find(s => s.id === id);
  if (slot) slot.n += n;
  else state.crate.push({ id, n });
  return true;
}

export function takeFromCrate(state, id) {
  const i = state.crate.findIndex(s => s.id === id);
  if (i < 0) return false;
  const slot = state.crate[i];
  const n = addItem(state, id, slot.n);
  slot.n -= n;
  if (!slot.n) state.crate.splice(i, 1);
  return n > 0;
}

export function nextUpgrade(state, tool) {
  const tier = state.tools[tool] + 1;
  if (tier >= TOOL_TIERS.length) return null;
  return { tier, name: TOOL_TIERS[tier], ...UPGRADE_COST[tier] };
}

export function upgradeTool(state, tool) {
  const up = nextUpgrade(state, tool);
  if (!up || state.pebbles < up.pebbles || countItem(state, up.ore) < up.count) return false;
  state.pebbles -= up.pebbles;
  removeItem(state, up.ore, up.count);
  state.tools[tool] = up.tier;
  return true;
}

// Fills in anything missing from an older save.
export function migrate(saved, seed, today) {
  const fresh = newState(seed, today);
  if (!saved || saved.version !== STATE_VERSION) return fresh;
  return {
    ...fresh, ...saved,
    avatar: { ...fresh.avatar, ...saved.avatar },
    tools: { ...fresh.tools, ...saved.tools },
    log: { ...fresh.log, ...saved.log },
    mine: { ...fresh.mine, ...saved.mine },
    garden: fresh.garden.map((b, i) => saved.garden?.[i] || b),
  };
}
