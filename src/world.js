import { MEADOW_REGIONS, fillRegions, keepReachable } from './regions.js';
// The jar's layout: a small grid of ground tiles and the objects on it.
// Pure data and helpers so the server can share it later.

// COLS is how many columns fit on screen (and the size of the mine and the
// other jars). The meadow is wider: the view slides as you walk.
export const COLS = 17;
// Columns run from -MEADOW_WEST (the west woods) to MEADOW_COLS - 1 (the east
// wall), so the meadow you started with keeps its spot in the middle.
export const MEADOW_WEST = 50;
export const MEADOW_COLS = 84;
// ROWS is how many rows fit on screen. The meadow also runs MEADOW_NORTH rows
// above row 0 (toward the hills) and MEADOW_SOUTH rows below the last one, and
// the view slides up and down as you walk.
export const ROWS = 12;
export const MEADOW_NORTH = 26;
export const MEADOW_SOUTH = 26;
export const TILE = 16;

// Each object covers a block of tiles (c, r, w, h). Blocked tiles can't be walked on.
export const OBJECTS = [
  { id: 'tent', name: 'Tent', c: 1, r: 0, w: 3, h: 2 },
  { id: 'mailbox', name: 'Mailbox', c: 4, r: 1, w: 1, h: 1 },
  { id: 'crate', name: 'Shipping crate', c: 5, r: 1, w: 1, h: 1 },
  { id: 'workbench', name: 'Workbench', c: 6, r: 1, w: 1, h: 1 },
  { id: 'stall', name: 'Beetle shop', c: 9, r: 0, w: 2, h: 1 },
  { id: 'board', name: 'Notice board', c: 12, r: 1, w: 1, h: 1 },
  { id: 'tree', name: 'Fruit tree', c: 15, r: 1, w: 1, h: 1 },
  { id: 'well', name: 'Wishing well', c: 14, r: 3, w: 1, h: 1 },
  { id: 'bench', name: 'Bench', c: 7, r: 4, w: 2, h: 1 },
  { id: 'pond', name: 'Pond', c: 11, r: 5, w: 5, h: 4 },
  { id: 'easel', name: 'Calendar', c: 12, r: 10, w: 1, h: 1 },
  { id: 'picnic', name: 'Picnic blanket', c: 3, r: 10, w: 2, h: 1, walkable: true },
  { id: 'cave', name: 'Cave', c: 8, r: 11, w: 1, h: 1, walkable: true },
  // The east meadow, past the edge of the first screen.
  { id: 'pond2', name: 'Lily pond', c: 25, r: 6, w: 4, h: 3 },
  { id: 'oak1', kind: 'tree', tree: 'oak', name: 'Old oak', c: 19, r: 1, w: 1, h: 1 },
  { id: 'oak2', kind: 'tree', tree: 'birch', name: 'Birch', c: 30, r: 2, w: 1, h: 1 },
  { id: 'oak3', kind: 'tree', tree: 'willow', name: 'Willow', c: 29, r: 10, w: 1, h: 1 },
  { id: 'oak4', kind: 'tree', tree: 'pine', name: 'Pine', c: 21, r: 10, w: 1, h: 1 },
  // The far east: more trees, and the door on the far wall.
  { id: 'oak5', kind: 'tree', tree: 'oak', name: 'Oak', c: 37, r: 2, w: 1, h: 1 },
  { id: 'oak6', kind: 'tree', tree: 'cherry', name: 'Cherry tree', c: 42, r: 8, w: 1, h: 1 },
  { id: 'oak7', kind: 'tree', tree: 'pine', name: 'Pine', c: 47, r: 1, w: 1, h: 1 },
  { id: 'oak8', kind: 'tree', tree: 'birch', name: 'Birch', c: 45, r: 10, w: 1, h: 1 },
  { id: 'pond3', name: 'Reed pond', c: 39, r: 4, w: 3, h: 3 },
  { id: 'door', name: 'Door to the other jars', c: 50, r: 3, w: 1, h: 1, walkable: true },
  // The west woods, past the garden.
  { id: 'west1', kind: 'tree', tree: 'pine', name: 'Pine', c: -3, r: 1, w: 1, h: 1 },
  { id: 'west2', kind: 'tree', tree: 'oak', name: 'Old oak', c: -8, r: 3, w: 1, h: 1 },
  { id: 'west3', kind: 'tree', tree: 'willow', name: 'Willow', c: -12, r: 8, w: 1, h: 1 },
  { id: 'west4', kind: 'tree', tree: 'birch', name: 'Birch', c: -15, r: 2, w: 1, h: 1 },
  { id: 'west5', kind: 'tree', tree: 'pine', name: 'Pine', c: -6, r: 10, w: 1, h: 1 },
  { id: 'west6', kind: 'tree', tree: 'cherry', name: 'Cherry tree', c: -16, r: 10, w: 1, h: 1 },
  { id: 'pond4', name: 'Forest pool', c: -11, r: 4, w: 4, h: 3 },
  // The north hills, above the tent (negative rows).
  { id: 'museum', name: 'Museum', c: 4, r: -5, w: 3, h: 2 },
  { id: 'north1', kind: 'tree', tree: 'pine', name: 'Pine', c: 2, r: -7, w: 1, h: 1 },
  { id: 'north2', kind: 'tree', tree: 'birch', name: 'Birch', c: 9, r: -5, w: 1, h: 1 },
  { id: 'north3', kind: 'tree', tree: 'oak', name: 'Old oak', c: 15, r: -7, w: 1, h: 1 },
  { id: 'north4', kind: 'tree', tree: 'pine', name: 'Pine', c: 27, r: -4, w: 1, h: 1 },
  { id: 'north5', kind: 'tree', tree: 'cherry', name: 'Cherry tree', c: 40, r: -6, w: 1, h: 1 },
  { id: 'north6', kind: 'tree', tree: 'willow', name: 'Willow', c: -9, r: -5, w: 1, h: 1 },
  { id: 'pond5', name: 'Hill spring', c: 19, r: -7, w: 4, h: 3 },
  // The south fields, below the cave.
  { id: 'south1', kind: 'tree', tree: 'oak', name: 'Oak', c: 3, r: 16, w: 1, h: 1 },
  { id: 'south2', kind: 'tree', tree: 'willow', name: 'Willow', c: 14, r: 18, w: 1, h: 1 },
  { id: 'south3', kind: 'tree', tree: 'birch', name: 'Birch', c: 33, r: 15, w: 1, h: 1 },
  { id: 'south4', kind: 'tree', tree: 'pine', name: 'Pine', c: 46, r: 17, w: 1, h: 1 },
  { id: 'south5', kind: 'tree', tree: 'cherry', name: 'Cherry tree', c: -13, r: 15, w: 1, h: 1 },
  { id: 'pond6', name: 'Meadow marsh', c: 7, r: 14, w: 5, h: 3 },
];

// The regions all around (regions.js): woods, bog, peaks, orchard, lakeside,
// fields, ruins and the hollow, with their landmarks, ponds and scenery.
export { MEADOW_REGIONS };
OBJECTS.push(...fillRegions('meadow', MEADOW_REGIONS, (c, r) => OBJECTS.some(o => c >= o.c - 1 && c < o.c + o.w + 1 && r >= o.r - 1 && r < o.r + o.h + 1)
  || (c >= -1 && c <= 4 && r >= 5 && r <= 11) || (Math.abs(c - 5) <= 1 && Math.abs(r - 3) <= 1)));

// Every pond you can fish in.
export const PONDS = OBJECTS.filter(o => /^pond\d*$/.test(o.id)).map(o => o.id);

// Garden beds, rows of three. The first six are open; the garden upgrades open the rest.
export const BEDS = [];
for (let r = 6; r <= 7; r++) for (let c = 1; c <= 3; c++) BEDS.push({ c, r });
// The second plot sits below, with a path in between so every bed can be reached.
for (let r = 9; r <= 10; r++) for (let c = 0; c <= 2; c++) BEDS.push({ c, r });

export const START_TILE = { c: 5, r: 3 };

export function tileKey(c, r) {
  return c + ',' + r;
}

function buildBlocked() {
  const blocked = new Set();
  for (const o of OBJECTS) {
    if (o.walkable) continue;
    for (let c = o.c; c < o.c + o.w; c++) for (let r = o.r; r < o.r + o.h; r++) blocked.add(tileKey(c, r));
  }
  for (const b of BEDS) blocked.add(tileKey(b.c, b.r));
  return blocked;
}

keepReachable(OBJECTS, { c: 5, r: 3 }, { c0: -MEADOW_WEST, c1: MEADOW_COLS - 1, r0: -MEADOW_NORTH, r1: ROWS + MEADOW_SOUTH - 1 },
  (c, r) => !BEDS.some(b => b.c === c && b.r === r));
export const BLOCKED = buildBlocked();

export function inBounds(c, r, cols = MEADOW_COLS, from = -MEADOW_WEST, top = -MEADOW_NORTH, rows = ROWS + MEADOW_SOUTH) {
  return c >= from && r >= top && c < cols && r < rows;
}

export function isWalkable(c, r, extraBlocked) {
  if (!inBounds(c, r)) return false;
  const k = tileKey(c, r);
  return !BLOCKED.has(k) && !(extraBlocked && extraBlocked.has(k));
}

// Open tiles where forage can appear: walkable, not next to the start or cave.
// The world doesn't change, so this is worked out once.
let forageCache = null;
export function forageTiles() {
  if (forageCache) return forageCache;
  const onWalkable = new Set();
  for (const o of OBJECTS) if (o.walkable) for (let c = o.c; c < o.c + o.w; c++) for (let r = o.r; r < o.r + o.h; r++) onWalkable.add(tileKey(c, r));
  const out = [];
  for (let r = -MEADOW_NORTH; r < ROWS + MEADOW_SOUTH; r++) {
    for (let c = -MEADOW_WEST; c < MEADOW_COLS; c++) {
      if (!isWalkable(c, r)) continue;
      if (onWalkable.has(tileKey(c, r))) continue;
      if (c === START_TILE.c && r === START_TILE.r) continue;
      out.push({ c, r });
    }
  }
  forageCache = out;
  return out;
}

// Which object covers a tile. With hundreds of objects, look it up by tile.
let objectIndex = null;
export function objectAt(c, r) {
  if (!objectIndex) {
    objectIndex = new Map();
    for (const o of OBJECTS) for (let x = o.c; x < o.c + o.w; x++) for (let y = o.r; y < o.r + o.h; y++) if (!objectIndex.has(tileKey(x, y))) objectIndex.set(tileKey(x, y), o);
  }
  return objectIndex.get(tileKey(c, r)) || null;
}

export function bedAt(c, r) {
  return BEDS.findIndex(b => b.c === c && b.r === r);
}

export function footprintTiles(o) {
  const out = [];
  for (let c = o.c; c < o.c + (o.w || 1); c++) for (let r = o.r; r < o.r + (o.h || 1); r++) out.push({ c, r });
  return out;
}
