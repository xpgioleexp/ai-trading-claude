// Game rules. Every function here is pure logic on the saved state, with no
// drawing or browser code, so it can be tested and later run on the server.
import {
  ITEMS, FISH, JUNK, CROP_BY_ID, CROPS, FORAGE, TREE_FRUIT, FOSSILS, RARITY_WEIGHT,
  BAG_SLOTS, STACK, DAILY_BITES, MINE_LAYERS, START_PEBBLES, UPGRADE_COST, PICK_POWER, TOOL_TIERS,
} from './data.js';
import { rngFor, randInt, pickWeighted, shuffle } from './rng.js';
import { seasonOf, weatherOf, isWet, isNightHour, weatherMatches } from './clock.js';
import { pickPart } from './fossils.js';
import { BEDS, COLS, ROWS, forageTiles } from './world.js';
import {
  BANDS, ROCKS, ROCK_TABLE, FOSSILS_BY_BAND, ARTIFACTS_BY_BAND, GEODE_CONTENTS, GROTTO_BY_BAND, CAVE_FISH_IDS, CAVE_BITES,
  MONSTERS, monstersOfBand, bossOfBand, START_HP, BOSS_HP_BONUS, SWORD_DAMAGE, healOf,
} from './mine-data.js';
import { FERTILIZER_BY_ID, BED_LEVELS } from './farm-data.js';

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
    tools: { rod: 0, pick: 0, sword: 0 },
    garden: BEDS.map(() => ({ crop: null, count: 0, last: -1 })),
    farm: { beds: BED_LEVELS[0], sprinkler: false },
    crate: [],
    log: { fish: {}, found: {} },
    mine: { deepest: 0, bosses: {} },
    hp: START_HP,
    daily: null,
    dayOffset: 0,
    rewards: {},
    mailSeen: 0,
    reminder: '19:00',
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
  state.hp = maxHp(state);
  if (isWet(weatherOf(state.seed, today))) {
    let watered = 0;
    state.garden.forEach((bed, i) => { if (waterBed(state, i, today)) watered++; });
    if (watered) events.push({ type: 'rain-watered', count: watered });
  } else {
    // The sprinkler waters every bed; water-keeping soil waters its own.
    let watered = 0;
    state.garden.forEach((bed, i) => {
      if ((state.farm?.sprinkler || bed.fert === 'water_soil') && waterBed(state, i, today)) watered++;
    });
    if (watered) events.push({ type: 'sprinkler', count: watered });
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
// Days a crop needs in this bed. Speed-gro takes about a third off.
export function daysFor(bed) {
  const crop = CROP_BY_ID[bed.crop];
  return bed.fert === 'speed_gro' ? Math.max(1, Math.ceil(crop.days * 0.67)) : crop.days;
}

export function bedStage(bed, today) {
  if (!bed.crop) return -1;
  const days = daysFor(bed);
  const g = bedGrowth(bed, today);
  if (g >= days) return 3;
  if (g <= 0) return 0;
  return g < days / 2 ? 1 : 2;
}

export function bedOpen(state, i) {
  return i < (state.farm?.beds || BED_LEVELS[0]);
}

export function plantBed(state, i, seedId, fertId = null) {
  const bed = state.garden[i];
  const seed = ITEMS[seedId];
  if (!bed || bed.crop || !seed || seed.cat !== 'seed' || !bedOpen(state, i)) return false;
  if (fertId && (!FERTILIZER_BY_ID[fertId] || countItem(state, fertId) < 1)) return false;
  if (!removeItem(state, seedId, 1)) return false;
  if (fertId) removeItem(state, fertId, 1);
  state.garden[i] = { crop: seed.crop, count: 0, last: -1, ...(fertId ? { fert: fertId } : {}) };
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
  addItem(state, crop.id, bed.fert === 'fertilizer' ? 2 : 1);
  if (crop.regrow) {
    bed.count = daysFor(bed) - crop.regrow + (bed.last === today ? 1 : 0);
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
  if (!weatherMatches(fish.weather, weather)) return false;
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
  // The meadow is twice as wide now, so there's a little more to find.
  return shuffle(rand, forageTiles()).slice(0, 6).map(t => ({
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
// Six zones of ten layers (see mine-data.js). Each layer is a little cave map:
// walls, rocks, and sometimes monsters, a treasure room, a grotto or a lake.

export function bandOf(layer) {
  return Math.min(BANDS.length - 1, Math.floor((layer - 1) / 10));
}

export const BAND_NAMES = BANDS.map(b => b.name);

export const MINE_ENTRY = { c: 8, r: 0 };
export const MINE_START = { c: 8, r: 1 };
const key = (c, r) => c + ',' + r;
const nearEntry = (c, r) => Math.abs(c - MINE_ENTRY.c) <= 1 && r <= 2;

export const ROOM_NAMES = { normal: '', treasure: 'Treasure room', grotto: 'Mushroom grotto', lake: 'Underground lake', den: 'Monster den', boss: 'Boss cave' };

// Layers ending in 0 hold the zone's boss. Layers ending in 5 are a special room, different each day.
export function layerKind(seed, day, layer) {
  if (layer % 10 === 0) return 'boss';
  if (layer % 5 === 0) {
    const rooms = ['treasure', 'grotto', 'lake', 'den'];
    return rooms[Math.floor(rngFor(seed, 'room', day, layer)() * rooms.length)];
  }
  return 'normal';
}

export const POOL = { c: 5, r: 5, w: 7, h: 3 };
const inPool = (c, r) => c >= POOL.c && c < POOL.c + POOL.w && r >= POOL.r && r < POOL.r + POOL.h;

// Clumps of cave wall, then anything walls cut off from the ladder up becomes wall too,
// so every open tile can be reached.
function caveWalls(rand, band, kind) {
  const walls = new Set();
  if (kind === 'treasure' || kind === 'grotto') return walls;
  const clumps = Math.round(COLS * ROWS * BANDS[band].walls / 2.5);
  for (let i = 0; i < clumps; i++) {
    let c = randInt(rand, 0, COLS - 1), r = randInt(rand, 0, ROWS - 1);
    for (let k = randInt(rand, 2, 6); k > 0; k--) {
      if (!nearEntry(c, r) && !(kind === 'lake' && inPool(c, r))) walls.add(key(c, r));
      if (rand() < 0.5) c += rand() < 0.5 ? -1 : 1; else r += rand() < 0.5 ? -1 : 1;
      c = Math.max(0, Math.min(COLS - 1, c));
      r = Math.max(0, Math.min(ROWS - 1, r));
    }
  }
  const blocked = (c, r) => walls.has(key(c, r)) || (kind === 'lake' && inPool(c, r));
  const seen = new Set([key(MINE_START.c, MINE_START.r)]);
  const todo = [MINE_START];
  while (todo.length) {
    const t = todo.pop();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const c = t.c + dc, r = t.r + dr, k = key(c, r);
      if (c < 0 || r < 0 || c >= COLS || r >= ROWS || seen.has(k) || blocked(c, r)) continue;
      seen.add(k);
      todo.push({ c, r });
    }
  }
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!seen.has(key(c, r)) && !(kind === 'lake' && inPool(c, r))) walls.add(key(c, r));
  }
  return walls;
}

// One layer for one day. Same seed, day and layer give the same cave for both of you.
export function layerMap(seed, day, layer) {
  const rand = rngFor(seed, 'mine', day, layer);
  const band = bandOf(layer);
  const kind = layerKind(seed, day, layer);
  const walls = caveWalls(rand, band, kind);
  let open = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (nearEntry(c, r) || walls.has(key(c, r)) || (kind === 'lake' && inPool(c, r))) continue;
      open.push({ c, r });
    }
  }
  open = shuffle(rand, open);
  const take = n => open.splice(0, n);
  const counts = { normal: [14, 22], den: [18, 26], boss: [6, 9], treasure: [5, 7], grotto: [6, 8], lake: [7, 10] }[kind];
  const table = Object.entries(ROCK_TABLE[band]);
  const rocks = take(randInt(rand, counts[0], counts[1])).map((t, id) => {
    const rk = pickWeighted(rand, table, ([, w]) => w)[0];
    // The den is rich in ore.
    const kindOf = kind === 'den' && rk === table[0][0] && rand() < 0.4 ? table[2][0] : rk;
    return { id, c: t.c, r: t.r, kind: kindOf, hp: ROCKS[kindOf].hp * (band + 1), ladder: false };
  });
  if (layer < MINE_LAYERS) {
    const plain = rocks.filter(r => ROCKS[r.kind].style === 'plain');
    const pick = plain.length ? plain : rocks;
    pick[Math.floor(rand() * pick.length)].ladder = true;
  }
  const chests = kind === 'treasure' ? take(3).map((t, id) => ({ id, c: t.c, r: t.r })) : [];
  const forage = kind === 'grotto'
    ? take(7).map((t, i) => ({ c: t.c, r: t.r, id: GROTTO_BY_BAND[band][rand() < 0.7 ? 0 : 1] }))
    : [];
  // Monsters stay away from the ladder you came down.
  const far = open.filter(t => Math.max(Math.abs(t.c - MINE_START.c), Math.abs(t.r - MINE_START.r)) >= 4);
  const kinds = monstersOfBand(band);
  let n = { normal: layer <= 2 ? 1 : 2 + Math.min(3, Math.floor((layer % 10) / 3)), den: 7, boss: 1 }[kind] || 0;
  const monsters = [];
  if (kind === 'boss' && far.length) {
    const t = far.shift();
    monsters.push({ id: 0, kind: bossOfBand(band), c: t.c, r: t.r });
  }
  for (const t of far.slice(0, n)) {
    const k = layer <= 2 ? kinds[0] : kinds[Math.floor(rand() * kinds.length)];
    monsters.push({ id: monsters.length, kind: k, c: t.c, r: t.r });
  }
  return { layer, band, kind, walls: [...walls], rocks, chests, forage, monsters, pool: kind === 'lake' ? POOL : null };
}

export function layerRocks(seed, day, layer) {
  return layerMap(seed, day, layer).rocks;
}

export function rockHits(rock, pickTier) {
  return Math.ceil(rock.hp / PICK_POWER[pickTier]);
}

export function rockDrops(seed, day, layer, rock) {
  const rand = rngFor(seed, 'drop', day, layer, rock.id);
  const band = bandOf(layer);
  const def = ROCKS[rock.kind];
  if (def.drop === 'fossil') {
    // Fossil rocks sometimes hold a piece of a skeleton for the museum.
    if (rand() < 0.4) return [{ id: pickPart(rand, 'mine'), n: 1 }];
    return [{ id: FOSSILS_BY_BAND[band][Math.floor(rand() * FOSSILS_BY_BAND[band].length)], n: 1 }];
  }
  if (def.drop === 'artifact') return [{ id: ARTIFACTS_BY_BAND[band][Math.floor(rand() * ARTIFACTS_BY_BAND[band].length)], n: 1 }];
  const drops = [{ id: def.drop, n: def.n ? randInt(rand, def.n[0], def.n[1]) : 1 }];
  if (def.style === 'plain' && rand() < 0.1) {
    const ores = Object.keys(ROCK_TABLE[band]).filter(k => ROCKS[k].style === 'ore');
    drops.push({ id: ROCKS[ores[Math.floor(rand() * ores.length)]].drop, n: 1 });
  }
  return drops;
}

export function layerState(state, layer) {
  if (!state.daily.mine[layer]) state.daily.mine[layer] = { broken: [] };
  const ls = state.daily.mine[layer];
  ls.slain = ls.slain || [];
  ls.opened = ls.opened || [];
  ls.picked = ls.picked || [];
  return ls;
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

// Layers you can start from: the top of each zone you've reached.
export function elevatorStops(deepest) {
  return BANDS.map((b, i) => i * 10 + 1).filter(s => s === 1 || deepest >= s);
}

// ---------- treasure, grottos and lakes ----------

export function chestLoot(seed, day, layer, chestId) {
  const rand = rngFor(seed, 'chest', day, layer, chestId);
  const band = bandOf(layer);
  const good = Object.keys(ROCK_TABLE[band]).filter(k => ['gem', 'ore', 'geode'].includes(ROCKS[k].style));
  const items = [];
  for (let i = randInt(rand, 2, 3); i > 0; i--) {
    const rk = good[Math.floor(rand() * good.length)];
    items.push({ id: ROCKS[rk].drop, n: ROCKS[rk].style === 'ore' ? randInt(rand, 2, 4) : 1 });
  }
  if (rand() < 0.4) items.push({ id: ARTIFACTS_BY_BAND[band][Math.floor(rand() * ARTIFACTS_BY_BAND[band].length)], n: 1 });
  return { pebbles: randInt(rand, 20, 60) * (band + 1), items };
}

export function openChest(state, layer, chestId) {
  const ls = layerState(state, layer);
  if (ls.opened.includes(chestId)) return null;
  ls.opened.push(chestId);
  const loot = chestLoot(state.seed, state.daily.day, layer, chestId);
  state.pebbles += loot.pebbles;
  const got = [];
  for (const d of loot.items) {
    const n = addItem(state, d.id, d.n);
    if (n) got.push({ id: d.id, n });
  }
  return { pebbles: loot.pebbles, got };
}

export function pickGrotto(state, layer, index, id) {
  const ls = layerState(state, layer);
  if (ls.picked.includes(index) || bagFull(state, id)) return false;
  ls.picked.push(index);
  addItem(state, id, 1);
  return true;
}

export function caveBites(state) {
  if (!state.daily.cave) state.daily.cave = { bites: CAVE_BITES };
  return state.daily.cave;
}

export function caveCatch(rand, band) {
  const pool = CAVE_FISH_IDS.map(id => ITEMS[id]).filter(f => f.bands.includes(band));
  const fish = pickWeighted(rand, pool, f => RARITY_WEIGHT[f.rarity]);
  const size = Math.round((fish.size[0] + rand() * (fish.size[1] - fish.size[0])) * 10) / 10;
  return { id: fish.id, size };
}

// Cracks one geode open. Returns what was inside, or null.
export function crackGeode(state, geodeId, rand = Math.random) {
  const inside = GEODE_CONTENTS[geodeId];
  if (!inside || countItem(state, geodeId) < 1) return null;
  const id = inside[Math.floor(rand() * inside.length)];
  removeItem(state, geodeId, 1);
  if (!addItem(state, id, 1)) {
    addItem(state, geodeId, 1);
    return null;
  }
  return id;
}

// ---------- health and monsters ----------

export function maxHp(state) {
  return START_HP + Object.keys(state.mine.bosses || {}).length * BOSS_HP_BONUS;
}

export function hurt(state, dmg) {
  state.hp = Math.max(0, (state.hp ?? maxHp(state)) - dmg);
  return state.hp;
}

// Eats one of something. Returns how much it healed, or 0.
export function eat(state, id) {
  const heal = healOf(ITEMS[id]);
  const max = maxHp(state);
  if (!heal || (state.hp ?? max) >= max || !removeItem(state, id, 1)) return 0;
  const before = state.hp ?? max;
  state.hp = Math.min(max, before + heal);
  return state.hp - before;
}

export function swordDamage(state) {
  return SWORD_DAMAGE[state.tools.sword || 0];
}

// Records a defeated monster and gives its drops. A boss also raises your health the first time.
export function defeatMonster(state, layer, monster, rand = Math.random) {
  const ls = layerState(state, layer);
  if (ls.slain.includes(monster.id)) return null;
  ls.slain.push(monster.id);
  const def = MONSTERS[monster.kind];
  state.log.monsters = state.log.monsters || {};
  state.log.monsters[monster.kind] = (state.log.monsters[monster.kind] || 0) + 1;
  const got = [];
  for (const [id, chance] of def.drops) {
    if (rand() < chance) {
      const n = addItem(state, id, 1);
      if (n) got.push({ id, n });
    }
  }
  let firstBoss = false;
  if (def.boss) {
    state.mine.bosses = state.mine.bosses || {};
    firstBoss = !state.mine.bosses[monster.kind];
    state.mine.bosses[monster.kind] = true;
    if (firstBoss) state.hp = maxHp(state);
  }
  return { got, firstBoss };
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
    farm: { ...fresh.farm, ...saved.farm },
    log: { ...fresh.log, ...saved.log },
    mine: { ...fresh.mine, ...saved.mine },
    garden: fresh.garden.map((b, i) => saved.garden?.[i] || b),
  };
}
