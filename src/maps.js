// More terrariums, reached through the door in the meadow. Each jar is its own
// small map with a fixed season, its own water, fish, forage and a few places.
import { ITEMS, FORAGE, RARITY_WEIGHT, JUNK } from './data.js';
import { COLS, ROWS } from './world.js';
import { rngFor, shuffle, pickWeighted } from './rng.js';
import { isNightHour } from './clock.js';

// Fish only found in these jars.
const MAP_FISH = {
  beach: [
    ['sardine', 'Sardine', '#9FB3C8', 'common', [10, 20], 20, 1],
    ['mackerel', 'Mackerel', '#5E8AA0', 'common', [20, 40], 30, 2],
    ['flounder', 'Flounder', '#B39A70', 'uncommon', [20, 45], 55, 3],
    ['sea_bream', 'Sea bream', '#D9A0A0', 'uncommon', [25, 50], 60, 3],
    ['pufferfish', 'Pufferfish', '#E8C25A', 'uncommon', [10, 30], 70, 3],
    ['octopus', 'Octopus', '#C96A6A', 'uncommon', [30, 70], 80, 4],
    ['clownfish', 'Clownfish', '#E8873A', 'rare', [6, 11], 120, 4],
    ['bluefin_tuna', 'Bluefin tuna', '#3F5A7A', 'rare', [100, 200], 250, 5],
  ],
  snow: [
    ['ice_smelt', 'Ice smelt', '#C7D9E0', 'common', [8, 15], 25, 2],
    ['arctic_char', 'Arctic char', '#D9806A', 'common', [25, 50], 40, 2],
    ['snow_trout', 'Snow trout', '#E9EEF0', 'uncommon', [30, 60], 75, 3],
    ['glacier_pike', 'Glacier pike', '#7FA3B8', 'rare', [60, 110], 220, 5],
  ],
  flower: [
    ['petal_minnow', 'Petal minnow', '#E4B4A3', 'common', [3, 7], 20, 1],
    ['rose_koi', 'Rose koi', '#E07A9B', 'uncommon', [30, 60], 90, 3],
    ['blossom_carp', 'Blossom carp', '#F2C4C8', 'rare', [40, 80], 160, 4],
  ],
};

const MAP_FORAGE = {
  beach: [['seashell', 'Seashell', 'round', '#F2E4D0', 15], ['sea_glass', 'Sea glass', 'crystal', '#9FD3C0', 25], ['starfish', 'Starfish', 'flower', '#E8873A', 30], ['coral', 'Coral', 'leaf', '#E07A7A', 45, true]],
  snow: [['icicle', 'Icicle', 'crystal', '#DCEEF7', 18], ['frost_lily', 'Frost lily', 'flower', '#E9F2F6', 35, true]],
  flower: [['rose', 'Wild rose', 'flower', '#D9506E', 25], ['lily', 'Lily', 'flower', '#F2EDE4', 25], ['lavender_sprig', 'Lavender sprig', 'flower', '#9C82C9', 20]],
};

for (const [map, list] of Object.entries(MAP_FISH)) {
  for (const [id, name, color, rarity, size, price, difficulty] of list) {
    ITEMS[id] = { id, name, cat: 'fish', shape: 'fish', color, rarity, size, price, difficulty, map };
  }
}
for (const [map, list] of Object.entries(MAP_FORAGE)) {
  for (const [id, name, shape, color, price, rare] of list) ITEMS[id] = { id, name, cat: 'forage', shape, color, price, rare: !!rare, map };
}
ITEMS.coconut = { id: 'coconut', name: 'Coconut', cat: 'forage', shape: 'round', color: '#8A6448', price: 35, map: 'beach' };
ITEMS.honey = { id: 'honey', name: 'Honey', cat: 'forage', shape: 'bottle', color: '#E8B83A', price: 40, map: 'flower' };

export const MAP_FISH_IDS = Object.values(MAP_FISH).flat().map(f => f[0]);
export const MAP_FORAGE_IDS = [...Object.values(MAP_FORAGE).flat().map(f => f[0]), 'coconut', 'honey'];

// Layouts on the same 17 x 12 grid as the meadow. Water and trees block walking.
export const MAPS = {
  beach: {
    id: 'beach', name: 'Beach jar', price: 300, season: 'summer', ground: 'sand',
    blurb: 'Always summer. Sea fishing, shells and a palm tree.',
    objects: [
      { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
      { id: 'water', kind: 'sea', name: 'The sea', c: 0, r: 9, w: 17, h: 3 },
      { id: 'water2', kind: 'pool', name: 'Tide pool', c: 11, r: 2, w: 3, h: 2 },
      { id: 'palm', name: 'Palm tree', c: 4, r: 1, w: 1, h: 1, fruit: 'coconut' },
    ],
  },
  snow: {
    id: 'snow', name: 'Snow jar', price: 500, season: 'winter', ground: 'winter', weather: 'snow',
    blurb: 'Always winter. Ice fishing on a frozen lake.',
    objects: [
      { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
      { id: 'water', kind: 'ice', name: 'Frozen lake', c: 6, r: 4, w: 6, h: 4 },
      { id: 'pine1', kind: 'pine', name: 'Snowy pine', c: 2, r: 1, w: 1, h: 1 },
      { id: 'pine2', kind: 'pine', name: 'Snowy pine', c: 14, r: 2, w: 1, h: 1 },
      { id: 'pine3', kind: 'pine', name: 'Snowy pine', c: 3, r: 9, w: 1, h: 1 },
      { id: 'snowman', name: 'Snowman', c: 13, r: 9, w: 1, h: 1 },
    ],
  },
  flower: {
    id: 'flower', name: 'Flower jar', price: 700, season: 'spring', ground: 'blossom',
    blurb: 'Always spring. Flower fields, a beehive and a koi pond.',
    objects: [
      { id: 'door', name: 'Door home', c: 0, r: 5, w: 1, h: 1, walkable: true },
      { id: 'water', kind: 'pond', name: 'Koi pond', c: 10, r: 6, w: 4, h: 3 },
      { id: 'hive', name: 'Beehive', c: 4, r: 2, w: 1, h: 1, fruit: 'honey' },
      { id: 'arch', name: 'Rose arch', c: 8, r: 1, w: 2, h: 1 },
    ],
  },
};
export const MAP_ORDER = ['beach', 'snow', 'flower'];

export function mapObjectAt(map, c, r) {
  return map.objects.find(o => c >= o.c && c < o.c + o.w && r >= o.r && r < o.r + o.h) || null;
}

export function mapWalkable(map, c, r, blocked) {
  if (c < 0 || r < 0 || c >= COLS || r >= ROWS) return false;
  if (blocked && blocked.has(c + ',' + r)) return false;
  const o = mapObjectAt(map, c, r);
  return !o || !!o.walkable;
}

export function mapOpenTiles(map) {
  const out = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (mapWalkable(map, c, r) && !mapObjectAt(map, c, r)) out.push({ c, r });
  }
  return out;
}

// Tiles next to an object (for bugs by the water, under trees).
export function mapNear(map, kinds, d = 1) {
  const open = mapOpenTiles(map);
  const objs = map.objects.filter(o => kinds.includes(o.id) || kinds.includes(o.kind));
  return open.filter(t => objs.some(o => t.c >= o.c - d && t.c < o.c + o.w + d && t.r >= o.r - d && t.r < o.r + o.h + d));
}

export function mapForageSpots(seed, day, mapId) {
  const map = MAPS[mapId];
  const rand = rngFor(seed, 'forage', mapId, day);
  const own = MAP_FORAGE[mapId].map(([id, , , , , rare]) => ({ id, rare: !!rare }));
  const seasonal = FORAGE.filter(f => f.season === map.season).map(f => ({ id: f.id, rare: f.rare }));
  const pool = [...own, ...own, ...seasonal];
  return shuffle(rand, mapOpenTiles(map)).slice(0, 5).map(t => ({ c: t.c, r: t.r, id: pickWeighted(rand, pool, f => (f.rare ? 1 : 6)).id }));
}

export function mapCatch(rand, mapId, hour) {
  if (rand() < 0.08) {
    const junk = JUNK[Math.floor(rand() * JUNK.length)];
    return { id: junk.id, size: null };
  }
  const pool = MAP_FISH[mapId].map(f => ITEMS[f[0]]);
  // Rare ones are a little easier to find at night.
  const night = isNightHour(hour);
  const fish = pickWeighted(rand, pool, f => RARITY_WEIGHT[f.rarity] * (night && f.rarity === 'rare' ? 2 : 1));
  const size = Math.round((fish.size[0] + rand() * (fish.size[1] - fish.size[0])) * 10) / 10;
  return { id: fish.id, size };
}

export function mapWeather(map, homeWeather) {
  if (map.weather) return map.weather;
  return homeWeather === 'snow' ? 'rain' : homeWeather;
}

// Each jar keeps its own daily forage, fruit and fishing bites.
export function mapDaily(state, mapId, day, seed, bites) {
  state.daily.maps = state.daily.maps || {};
  if (!state.daily.maps[mapId]) state.daily.maps[mapId] = { forage: mapForageSpots(seed, day, mapId), picked: [], shook: false, bites };
  return state.daily.maps[mapId];
}
