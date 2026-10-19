// Your home: the tent grows into a cottage with rooms you furnish together.
// Catalogue data and pure rules; the shared copies live in the database.
import { countItem, removeItem } from './rules.js';

export const HOUSE_LEVELS = [
  { name: 'Tent', rooms: 1 },
  { name: 'Cabin', rooms: 2, cost: { pebbles: 250, items: { stone: 15 } } },
  { name: 'Cottage', rooms: 4, cost: { pebbles: 600, items: { stone: 25, copper_ore: 8 } } },
  { name: 'Cottage with a loft', rooms: 6, cost: { pebbles: 1200, items: { iron_ore: 10, gold_ore: 3 } } },
];

export const ROOM_PRICE = 150;

// Room types. `minLevel` is the house level that allows it.
export const ROOM_TYPES = [
  { id: 'living', name: 'Living room', minLevel: 0 },
  { id: 'bedroom', name: 'Our bedroom', minLevel: 1, unique: true },
  { id: 'kitchen', name: 'Kitchen', minLevel: 1, unique: true },
  { id: 'study', name: 'Study', minLevel: 2 },
  { id: 'bathroom', name: 'Bathroom', minLevel: 2, unique: true },
  { id: 'sunroom', name: 'Sunroom', minLevel: 2 },
  { id: 'loft', name: 'Loft', minLevel: 3, unique: true },
];
export const ROOM_BY_ID = Object.fromEntries(ROOM_TYPES.map(r => [r.id, r]));

// Floor space inside a room, on the jar's tile grid. The back wall sits above it.
export const ROOM = { c0: 2, c1: 14, r0: 4, r1: 10 };
export const DOOR = { c: 8, r: 10 };
export const WALL_SLOTS = [3, 5, 7, 9, 11, 13];

// Furniture: w = tiles wide (1-3), h = tiles deep, flat ones can be walked on.
// use: what tapping it does.
export const FURNITURE = [
  { type: 'double_bed', name: 'Double bed', category: 'Bedroom', price: 120, w: 2, h: 2, use: 'sleep' },
  { type: 'single_bed', name: 'Single bed', category: 'Bedroom', price: 70, w: 1, h: 2, use: 'sleep' },
  { type: 'nightstand', name: 'Nightstand', category: 'Bedroom', price: 30, w: 1, h: 1 },
  { type: 'wardrobe', name: 'Wardrobe', category: 'Bedroom', price: 80, w: 1, h: 1, use: 'wardrobe' },
  { type: 'dresser', name: 'Dresser', category: 'Bedroom', price: 60, w: 2, h: 1, use: 'wardrobe' },
  { type: 'armchair', name: 'Armchair', category: 'Seating', price: 50, w: 1, h: 1, use: 'sit' },
  { type: 'sofa', name: 'Sofa', category: 'Seating', price: 110, w: 2, h: 1, use: 'sit' },
  { type: 'stool', name: 'Stool', category: 'Seating', price: 15, w: 1, h: 1, use: 'sit' },
  { type: 'beanbag', name: 'Bean bag', category: 'Seating', price: 35, w: 1, h: 1, use: 'sit' },
  { type: 'table', name: 'Dining table', category: 'Tables', price: 70, w: 2, h: 1 },
  { type: 'coffee_table', name: 'Coffee table', category: 'Tables', price: 40, w: 1, h: 1 },
  { type: 'desk', name: 'Writing desk', category: 'Tables', price: 60, w: 2, h: 1, use: 'calendar' },
  { type: 'bookshelf', name: 'Bookshelf', category: 'Storage', price: 70, w: 1, h: 1, use: 'journal' },
  { type: 'chest', name: 'Storage chest', category: 'Storage', price: 40, w: 1, h: 1, use: 'bag' },
  { type: 'stove', name: 'Wood stove', category: 'Kitchen', price: 90, w: 1, h: 1, use: 'cook' },
  { type: 'counter', name: 'Kitchen counter', category: 'Kitchen', price: 60, w: 2, h: 1, use: 'cook' },
  { type: 'icebox', name: 'Icebox', category: 'Kitchen', price: 70, w: 1, h: 1 },
  { type: 'kitchen_sink', name: 'Kitchen sink', category: 'Kitchen', price: 50, w: 1, h: 1 },
  { type: 'bathtub', name: 'Bathtub', category: 'Bathroom', price: 100, w: 2, h: 1 },
  { type: 'washstand', name: 'Washstand', category: 'Bathroom', price: 45, w: 1, h: 1 },
  { type: 'fireplace', name: 'Fireplace', category: 'Cozy', price: 120, w: 2, h: 1 },
  { type: 'floor_lamp', name: 'Floor lamp', category: 'Cozy', price: 35, w: 1, h: 1 },
  { type: 'record_player', name: 'Record player', category: 'Cozy', price: 65, w: 1, h: 1, use: 'music' },
  { type: 'piano', name: 'Little piano', category: 'Cozy', price: 150, w: 2, h: 1, use: 'music' },
  { type: 'houseplant', name: 'Houseplant', category: 'Cozy', price: 25, w: 1, h: 1 },
  { type: 'flower_vase', name: 'Flower vase', category: 'Cozy', price: 20, w: 1, h: 1 },
  { type: 'cat_bed', name: 'Pet bed', category: 'Cozy', price: 30, w: 1, h: 1 },
  { type: 'easel_art', name: 'Painting easel', category: 'Cozy', price: 45, w: 1, h: 1 },
  { type: 'rug_round', name: 'Round rug', category: 'Rugs', price: 40, w: 2, h: 2, flat: true },
  { type: 'rug_long', name: 'Long rug', category: 'Rugs', price: 45, w: 3, h: 1, flat: true },
  { type: 'rug_heart', name: 'Heart rug', category: 'Rugs', price: 50, w: 2, h: 2, flat: true },
];
export const FURNITURE_BY_TYPE = Object.fromEntries(FURNITURE.map(f => [f.type, f]));

export const WALL_ITEMS = [
  { type: 'window', name: 'Window', price: 40 },
  { type: 'painting', name: 'Landscape painting', price: 45 },
  { type: 'portrait', name: 'Our portrait', price: 50 },
  { type: 'clock', name: 'Wall clock', price: 35 },
  { type: 'shelf', name: 'Little shelf', price: 30 },
  { type: 'mirror', name: 'Mirror', price: 40 },
  { type: 'garland', name: 'Flower garland', price: 25 },
  { type: 'pennants', name: 'Pennant string', price: 20 },
  { type: 'photo_wall', name: 'Photo wall', price: 35 },
  { type: 'heart_sign', name: '"Us" sign', price: 30 },
];
export const WALL_BY_TYPE = Object.fromEntries(WALL_ITEMS.map(w => [w.type, w]));

export const WALLPAPERS = [
  { id: 'linen', name: 'Plain linen', price: 0, colors: ['#EFE3C4', '#E5D6B2'] },
  { id: 'sage_stripe', name: 'Sage stripes', price: 25, colors: ['#C9D6AE', '#B3C493'] },
  { id: 'rose_floral', name: 'Rose flowers', price: 35, colors: ['#EBD3CC', '#C68F89'] },
  { id: 'wood_panel', name: 'Wood panels', price: 30, colors: ['#C9A272', '#A9825A'] },
  { id: 'blue_check', name: 'Blue check', price: 25, colors: ['#CFDDE2', '#A9C2CC'] },
  { id: 'starry', name: 'Starry night', price: 40, colors: ['#3F4A6A', '#F3E9CF'] },
  { id: 'mint_dots', name: 'Mint dots', price: 25, colors: ['#D3E8DA', '#9DC7AE'] },
  { id: 'brick', name: 'Painted brick', price: 35, colors: ['#D8B3A0', '#B98C78'] },
];
export const FLOORS = [
  { id: 'planks', name: 'Wood planks', price: 0, colors: ['#B88D60', '#9E7650'] },
  { id: 'dark_wood', name: 'Dark wood', price: 30, colors: ['#7E5A40', '#6A4A34'] },
  { id: 'checker', name: 'Checker tiles', price: 35, colors: ['#F3E9CF', '#8FA3A4'] },
  { id: 'stone', name: 'Stone', price: 30, colors: ['#A9A397', '#8E897E'] },
  { id: 'rose_carpet', name: 'Rose carpet', price: 40, colors: ['#D9A9A3', '#C99790'] },
  { id: 'moss', name: 'Moss carpet', price: 40, colors: ['#9DBA74', '#86A462'] },
];
export const WALLPAPER_BY_ID = Object.fromEntries(WALLPAPERS.map(w => [w.id, w]));
export const FLOOR_BY_ID = Object.fromEntries(FLOORS.map(f => [f.id, f]));

// ---------- rules ----------

export function maxRooms(level) {
  return HOUSE_LEVELS[Math.min(level, HOUSE_LEVELS.length - 1)].rooms;
}

export function nextLevel(level) {
  return level + 1 < HOUSE_LEVELS.length ? { level: level + 1, ...HOUSE_LEVELS[level + 1] } : null;
}

// What's missing to pay for an upgrade, or an empty list when you can.
export function missingFor(state, cost) {
  const missing = [];
  if (state.pebbles < cost.pebbles) missing.push({ id: 'pebbles', need: cost.pebbles, have: state.pebbles });
  for (const [id, n] of Object.entries(cost.items || {})) {
    const have = countItem(state, id);
    if (have < n) missing.push({ id, need: n, have });
  }
  return missing;
}

export function payFor(state, cost) {
  if (missingFor(state, cost).length) return false;
  state.pebbles -= cost.pebbles;
  for (const [id, n] of Object.entries(cost.items || {})) removeItem(state, id, n);
  return true;
}

// Room types you can still add to a house with these rooms.
export function addableRooms(level, rooms) {
  if (rooms.length >= maxRooms(level)) return [];
  return ROOM_TYPES.filter(t => t.minLevel <= level && !(t.unique && rooms.some(r => r.type === t.id)));
}

export function tilesOf(item) {
  const f = FURNITURE_BY_TYPE[item.type];
  const out = [];
  for (let dc = 0; dc < (f?.w || 1); dc++) for (let dr = 0; dr < (f?.h || 1); dr++) out.push({ c: item.c + dc, r: item.r + dr });
  return out;
}

export function inRoom(c, r) {
  return c >= ROOM.c0 && c <= ROOM.c1 && r >= ROOM.r0 && r <= ROOM.r1;
}

// Can this piece go here? It must fit on the floor, keep the door clear,
// and not overlap other solid furniture (rugs can sit under things).
export function canPlace(type, c, r, others, ignoreId = null) {
  const f = FURNITURE_BY_TYPE[type];
  if (!f) return false;
  const mine = tilesOf({ type, c, r });
  if (!mine.every(t => inRoom(t.c, t.r))) return false;
  if (mine.some(t => Math.abs(t.c - DOOR.c) <= 0 && t.r >= DOOR.r - 1)) return false;
  for (const o of others) {
    if (o.id === ignoreId) continue;
    const of = FURNITURE_BY_TYPE[o.type];
    if (!of || of.flat !== f.flat) continue;
    const theirs = tilesOf(o);
    if (mine.some(t => theirs.some(u => u.c === t.c && u.r === t.r))) return false;
  }
  return true;
}

export function blockedTiles(furniture) {
  const set = new Set();
  for (const item of furniture) {
    if (FURNITURE_BY_TYPE[item.type]?.flat) continue;
    for (const t of tilesOf(item)) set.add(t.c + ',' + t.r);
  }
  return set;
}

export function roomWalkable(c, r, blocked) {
  return inRoom(c, r) && !blocked.has(c + ',' + r);
}
