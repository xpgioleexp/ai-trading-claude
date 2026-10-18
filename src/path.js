// Breadth-first pathfinding on the jar's small tile grid.
// walkable(c, r) decides which tiles are open. Diagonal steps never cut corners.

const STEPS = [
  [1, 0], [-1, 0], [0, 1], [0, -1],
  [1, 1], [1, -1], [-1, 1], [-1, -1],
];

function key(c, r) {
  return c + ',' + r;
}

function canStep(walkable, c, r, dc, dr) {
  if (!walkable(c + dc, r + dr)) return false;
  if (dc !== 0 && dr !== 0) return walkable(c + dc, r) && walkable(c, r + dr);
  return true;
}

// Returns the list of tiles from start (exclusive) to the first tile that
// satisfies isGoal, or null when no goal is reachable.
export function findPath(walkable, start, isGoal) {
  if (isGoal(start.c, start.r)) return [];
  const prev = new Map([[key(start.c, start.r), null]]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const cur = queue[i];
    for (const [dc, dr] of STEPS) {
      const c = cur.c + dc, r = cur.r + dr;
      const k = key(c, r);
      if (prev.has(k) || !canStep(walkable, cur.c, cur.r, dc, dr)) continue;
      prev.set(k, cur);
      const next = { c, r };
      if (isGoal(c, r)) {
        const path = [next];
        let back = cur;
        while (back && !(back.c === start.c && back.r === start.r)) {
          path.unshift(back);
          back = prev.get(key(back.c, back.r));
        }
        return path;
      }
      queue.push(next);
    }
  }
  return null;
}

export function pathTo(walkable, start, goal) {
  return findPath(walkable, start, (c, r) => c === goal.c && r === goal.r);
}

// Path to any open tile touching (including diagonally) one of the target tiles.
export function pathNextTo(walkable, start, targets) {
  const touching = new Set();
  for (const t of targets) {
    for (const [dc, dr] of STEPS) touching.add(key(t.c + dc, t.r + dr));
  }
  const targetKeys = new Set(targets.map(t => key(t.c, t.r)));
  return findPath(walkable, start, (c, r) => touching.has(key(c, r)) && !targetKeys.has(key(c, r)) && walkable(c, r));
}
