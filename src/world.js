// The jar's layout: a small grid of ground tiles and the objects on it.
// Pure data and helpers so the server can share it later.

export const COLS = 17;
export const ROWS = 12;
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
];

// Garden beds, two rows of three.
export const BEDS = [];
for (let r = 6; r <= 7; r++) for (let c = 1; c <= 3; c++) BEDS.push({ c, r });

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

export const BLOCKED = buildBlocked();

export function inBounds(c, r) {
  return c >= 0 && r >= 0 && c < COLS && r < ROWS;
}

export function isWalkable(c, r, extraBlocked) {
  if (!inBounds(c, r)) return false;
  const k = tileKey(c, r);
  return !BLOCKED.has(k) && !(extraBlocked && extraBlocked.has(k));
}

// Open tiles where forage can appear: walkable, not next to the start or cave.
export function forageTiles() {
  const out = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!isWalkable(c, r)) continue;
      if (OBJECTS.some(o => o.walkable && c >= o.c && c < o.c + o.w && r >= o.r && r < o.r + o.h)) continue;
      if (c === START_TILE.c && r === START_TILE.r) continue;
      out.push({ c, r });
    }
  }
  return out;
}

export function objectAt(c, r) {
  return OBJECTS.find(o => c >= o.c && c < o.c + o.w && r >= o.r && r < o.r + o.h) || null;
}

export function bedAt(c, r) {
  return BEDS.findIndex(b => b.c === c && b.r === r);
}

export function footprintTiles(o) {
  const out = [];
  for (let c = o.c; c < o.c + (o.w || 1); c++) for (let r = o.r; r < o.r + (o.h || 1); r++) out.push({ c, r });
  return out;
}
