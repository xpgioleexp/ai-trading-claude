// How the animals and people in the jars move and act. Each creature has a
// behaviour, so a crab scuttles, a gull flies off when you run at it, a sloth
// barely moves and a monkey tags along behind you.
//
// An actor: { def, c, r, x, y, z, flip, hidden, pose, ... } in world pixels.
// env: { t, dt, player: { c, r, x, y, moving, sneaking }, walkable(c, r),
//        water(c, r), anchors: { trees, water, flowers }, hour, night, actors, friend(def) }
// updateActor returns a list of events, e.g. { type: 'arrive', action }.
const TILE = 16, GX = 24, GY = 100, FEET = 5;
const center = (c, r) => ({ x: GX + c * TILE + TILE / 2, y: GY + r * TILE + TILE / 2 + FEET });
const tileOf = (x, y) => ({ c: Math.floor((x - GX) / TILE), r: Math.floor((y - FEET - GY) / TILE) });
const dist = (a, b) => Math.max(Math.abs(a.c - b.c), Math.abs(a.r - b.r));
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = list => list[Math.floor(Math.random() * list.length)];

export const BEHAVIOR_TEXT = {
  wander: 'potters about',
  scuttle: 'scuttles sideways in quick bursts',
  hopper: 'hops from spot to spot',
  flyer: 'flies off if you rush at it, then lands somewhere else',
  flitter: 'flits about, never landing',
  orbit: 'circles round and round',
  shy: 'runs off if you move fast; walk slowly to get close',
  follower: 'follows you around once you\'re friends',
  lazy: 'naps most of the day',
  slider: 'slides on its tummy',
  digger: 'stops to dig every so often',
  pouncer: 'stalks, then pounces',
  peeker: 'hides when you come close, then peeks out',
  swimmer: 'paddles around the water',
  darter: 'dashes between the trees and climbs them',
  chaser: 'plays tag',
  routine: 'keeps to a daily routine',
  sitter: 'sits in their favourite spot',
};

export function makeActor(def, tile, t) {
  const p = center(tile.c, tile.r);
  return { def, c: tile.c, r: tile.r, x: p.x, y: p.y, z: 0, flip: false, hidden: false, pose: null, home: { ...tile },
    wait: t + rnd(0.5, 3), goal: null, speed: 0, state: 'idle', phase: Math.random() * 6 };
}

// Is this creature out right now? Some only come out at night, some keep hours.
export function isOut(def, hour, night) {
  if (def.night && !night) return false;
  if (def.day && night) return false;
  if (def.hours) return def.hours.some(([a, b]) => hour >= a && hour < b);
  return true;
}

function moveToward(a, x, y, speed, dt) {
  const dx = x - a.x, dy = y - a.y, d = Math.hypot(dx, dy);
  if (d < 0.6) { a.x = x; a.y = y; return true; }
  const step = Math.min(d, speed * dt);
  a.x += (dx / d) * step;
  a.y += (dy / d) * step;
  if (Math.abs(dx) > 0.3) a.flip = dx < 0;
  return false;
}

// A tile to walk to: up to `range` away, open, and preferring a direction.
function nearbyTile(a, env, range, filter = () => true, from = a) {
  const options = [];
  for (let dc = -range; dc <= range; dc++) for (let dr = -range; dr <= range; dr++) {
    const c = from.c + dc, r = from.r + dr;
    if ((dc || dr) && env.walkable(c, r) && filter(c, r)) options.push({ c, r });
  }
  return options.length ? pick(options) : null;
}

// Walks one tile at a time toward a goal tile (good enough in a small jar).
function stepToward(a, goal, env) {
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => ({ c: a.c + dc, r: a.r + dr }))
    .filter(s => env.walkable(s.c, s.r) && !(s.c === env.player.c && s.r === env.player.r));
  if (!steps.length) return null;
  steps.sort((p, q) => (Math.abs(p.c - goal.c) + Math.abs(p.r - goal.r)) - (Math.abs(q.c - goal.c) + Math.abs(q.r - goal.r)));
  return steps[0];
}

function walk(a, env, dt, speed) {
  // Glide to the current tile's centre; returns true once there.
  const p = center(a.c, a.r);
  return moveToward(a, p.x, p.y, speed, dt);
}

export function updateActor(a, env) {
  const { t, dt } = env;
  const def = a.def;
  const events = [];
  const out = isOut(def, env.hour, env.night);
  a.hidden = !out;
  if (!out) return events;
  const B = BEHAVIORS[def.behavior] || BEHAVIORS.wander;
  B(a, env, dt, t, events);
  return events;
}

const BEHAVIORS = {
  wander(a, env, dt, t) {
    if (!walk(a, env, dt, 30)) return;
    if (t < a.wait) return;
    a.wait = t + rnd(2, 5);
    const n = nearbyTile(a, env, 1);
    if (n && Math.random() < 0.7) { a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip; a.c = n.c; a.r = n.r; }
  },
  scuttle(a, env, dt, t) {
    // Quick sideways dashes of a few tiles, then a pause. Crabs don't turn around.
    if (!walk(a, env, dt, 70)) return;
    if (a.run > 0) {
      const n = { c: a.c + a.dir, r: a.r };
      if (env.walkable(n.c, n.r)) { a.c = n.c; a.run--; return; }
      a.run = 0;
    }
    if (t < a.wait) return;
    a.wait = t + rnd(0.8, 2.5);
    a.dir = Math.random() < 0.5 ? -1 : 1;
    a.run = 1 + Math.floor(Math.random() * 3);
  },
  hopper(a, env, dt, t) {
    // One hop at a time, with a little arc.
    if (a.hop) {
      a.hop.t += dt;
      const k = Math.min(1, a.hop.t / 0.35);
      a.x = a.hop.x0 + (a.hop.x1 - a.hop.x0) * k;
      a.y = a.hop.y0 + (a.hop.y1 - a.hop.y0) * k;
      a.z = Math.sin(k * Math.PI) * 7;
      if (k >= 1) { a.hop = null; a.z = 0; }
      return;
    }
    if (t < a.wait) return;
    a.wait = t + rnd(0.6, 2.2);
    const n = nearbyTile(a, env, Math.random() < 0.3 ? 2 : 1);
    if (!n) return;
    const p = center(n.c, n.r);
    a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip;
    a.hop = { t: 0, x0: a.x, y0: a.y, x1: p.x, y1: p.y };
    a.c = n.c;
    a.r = n.r;
  },
  flyer(a, env, dt, t) {
    // Perches somewhere, takes off if you rush at it, lands far away.
    const close = dist(a, env.player) <= 2 && env.player.moving && !env.player.sneaking;
    if (a.flying) {
      a.z = Math.min(14, a.z + dt * 40);
      const p = center(a.c, a.r);
      if (moveToward(a, p.x, p.y, 75, dt)) { a.flying = false; a.wait = t + rnd(2, 6); }
      return;
    }
    a.z = Math.max(0, a.z - dt * 40);
    if (!close && t < a.wait) return;
    const perches = (env.anchors.trees || []).filter(x => dist(x, env.player) > 3);
    const n = (Math.random() < 0.5 && perches.length ? pick(perches) : null) || nearbyTile(a, env, 6, (c, r) => dist({ c, r }, env.player) > 3);
    if (!n) return;
    a.c = n.c;
    a.r = n.r;
    a.flying = true;
  },
  flitter(a, env, dt, t) {
    // Always in the air, zipping between nearby spots.
    a.z = 7 + Math.sin(t * 9 + a.phase) * 2;
    if (!a.goal || moveToward(a, a.goal.x, a.goal.y, 45, dt)) {
      const anchor = (env.anchors.flowers?.length ? pick(env.anchors.flowers) : a.home);
      const near = Math.random() < 0.3 ? anchor : a;
      const g = center(near.c + Math.round(rnd(-1, 1)), near.r + Math.round(rnd(-1, 1)));
      a.goal = { x: g.x + rnd(-5, 5), y: g.y + rnd(-5, 5) };
    }
    const tile = tileOf(a.x, a.y);
    a.c = tile.c;
    a.r = tile.r;
  },
  orbit(a, env, dt, t) {
    // Slow circles around its home spot.
    const p = center(a.home.c, a.home.r);
    const ang = t * 0.9 + a.phase;
    a.x = p.x + Math.cos(ang) * 20;
    a.y = p.y + Math.sin(ang) * 10;
    a.z = 10 + Math.sin(t * 3) * 2;
    a.flip = Math.sin(ang) > 0;
    const tile = tileOf(a.x, a.y);
    a.c = tile.c;
    a.r = tile.r;
  },
  shy(a, env, dt, t) {
    // Runs off if you come near quickly; stays if you sneak up.
    const scared = dist(a, env.player) <= 3 && env.player.moving && !env.player.sneaking;
    const speed = a.fleeing ? 80 : 26;
    if (!walk(a, env, dt, speed)) return;
    if (scared) {
      a.fleeing = true;
      const away = nearbyTile(a, env, 1, (c, r) => dist({ c, r }, env.player) > dist(a, env.player));
      if (away) { a.flip = away.c < a.c; a.c = away.c; a.r = away.r; }
      return;
    }
    a.fleeing = false;
    BEHAVIORS.wander(a, env, dt, t);
  },
  follower(a, env, dt, t) {
    // Trots after you, a couple of tiles behind, once you're friends.
    if (!env.friend(a.def)) return BEHAVIORS.wander(a, env, dt, t);
    if (!walk(a, env, dt, 55)) return;
    if (dist(a, env.player) <= 2) { a.pose = null; return; }
    const n = stepToward(a, env.player, env);
    if (n) { a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip; a.c = n.c; a.r = n.r; }
  },
  lazy(a, env, dt, t) {
    // Sleeps, wakes up, shuffles a tile, sleeps again.
    walk(a, env, dt, 12);
    if (t < a.wait) return;
    if (a.pose === 'sleep') { a.pose = null; a.wait = t + rnd(3, 6); return; }
    if (Math.random() < 0.4) {
      const n = nearbyTile(a, env, 1);
      if (n) { a.flip = n.c < a.c; a.c = n.c; a.r = n.r; }
    }
    a.pose = 'sleep';
    a.wait = t + rnd(8, 18);
  },
  slider(a, env, dt, t) {
    // Waddles, then belly-slides in a straight line.
    const speed = a.sliding ? 90 : 22;
    if (!walk(a, env, dt, speed)) return;
    if (a.sliding) {
      const n = { c: a.c + a.dir, r: a.r };
      if (a.run > 0 && env.walkable(n.c, n.r)) { a.c = n.c; a.run--; return; }
      a.sliding = false;
      a.pose = null;
      a.wait = t + rnd(1.5, 4);
      return;
    }
    if (t < a.wait) return;
    if (Math.random() < 0.5) return BEHAVIORS.wander(a, env, dt, t);
    a.dir = Math.random() < 0.5 ? -1 : 1;
    a.flip = a.dir < 0;
    a.run = 3 + Math.floor(Math.random() * 3);
    a.sliding = true;
    a.pose = 'slide';
  },
  digger(a, env, dt, t, events) {
    // Wanders, and every so often stops to dig.
    if (a.pose === 'dig') {
      if (t > a.wait) { a.pose = null; a.wait = t + rnd(3, 7); }
      return;
    }
    if (!walk(a, env, dt, 32)) return;
    if (t < a.wait) return;
    if (Math.random() < 0.35) {
      a.pose = 'dig';
      a.wait = t + 2.2;
      events.push({ type: 'dig' });
      return;
    }
    BEHAVIORS.wander(a, env, dt, t);
  },
  pouncer(a, env, dt, t) {
    // Creeps slowly, crouches, then leaps two tiles.
    if (a.hop) return BEHAVIORS.hopper(a, env, dt, t);
    if (!walk(a, env, dt, 14)) return;
    if (t < a.wait) return;
    if (a.pose === 'crouch') {
      a.pose = null;
      const dir = a.flip ? -1 : 1;
      const n = env.walkable(a.c + dir * 2, a.r) && env.walkable(a.c + dir, a.r) ? { c: a.c + dir * 2, r: a.r } : nearbyTile(a, env, 2);
      if (n) {
        const p = center(n.c, n.r);
        a.hop = { t: 0, x0: a.x, y0: a.y, x1: p.x, y1: p.y };
        a.c = n.c;
        a.r = n.r;
      }
      a.wait = t + rnd(2, 4);
      return;
    }
    if (Math.random() < 0.4) { a.pose = 'crouch'; a.wait = t + 1.2; return; }
    BEHAVIORS.wander(a, env, dt, t);
  },
  peeker(a, env, dt, t) {
    // Ducks down out of sight when you're close, unless you stand still.
    const close = dist(a, env.player) <= 2;
    if (close && env.player.moving) { a.pose = 'hide'; a.wait = t + 2; return; }
    if (a.pose === 'hide' && t < a.wait) return;
    a.pose = null;
    BEHAVIORS.wander(a, env, dt, t);
  },
  swimmer(a, env, dt, t) {
    // Paddles slowly round the water; ducklings follow their mother.
    const leader = a.def.follows && env.actors.find(o => o.def.id === a.def.follows);
    if (leader) {
      const lp = { x: leader.x - (leader.flip ? -1 : 1) * 10 * (a.def.order || 1), y: leader.y + 2 };
      moveToward(a, lp.x, lp.y, 28, dt);
      const tile = tileOf(a.x, a.y);
      a.c = tile.c;
      a.r = tile.r;
      return;
    }
    if (!a.goal || moveToward(a, a.goal.x, a.goal.y, 14, dt)) {
      const water = env.anchors.water || [];
      const near = water.filter(w => dist(w, a) <= 2);
      const n = near.length ? pick(near) : water.length ? pick(water) : a;
      const p = center(n.c, n.r);
      a.goal = { x: p.x + rnd(-4, 4), y: p.y + rnd(-3, 3) };
    }
    const tile = tileOf(a.x, a.y);
    a.c = tile.c;
    a.r = tile.r;
  },
  darter(a, env, dt, t) {
    // Dashes to a tree, scampers up (out of sight), comes back down.
    if (a.pose === 'climb') {
      if (t > a.wait) { a.pose = null; a.wait = t + rnd(1, 3); }
      return;
    }
    if (!walk(a, env, dt, 85)) return;
    if (a.goal) {
      if (dist(a, a.goal) <= 1) { a.goal = null; a.pose = 'climb'; a.wait = t + rnd(2, 5); return; }
      const n = stepToward(a, a.goal, env);
      if (n) { a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip; a.c = n.c; a.r = n.r; }
      return;
    }
    if (t < a.wait) return;
    const trees = env.anchors.trees || [];
    // A different tree each time: not the one she's just come down from.
    const others = trees.filter(x => dist(x, a) >= 3 && dist(x, a) <= 14);
    a.goal = others.length && Math.random() < 0.7 ? pick(others) : nearbyTile(a, env, 3);
  },
  chaser(a, env, dt, t) {
    // Two of them play tag: "it" chases, the other runs, and they swap on a catch.
    const other = env.actors.find(o => o !== a && o.def.tag === a.def.tag && !o.hidden);
    if (!other) return BEHAVIORS.wander(a, env, dt, t);
    if (a.it === undefined) a.it = a.def.id < other.def.id;
    if (!walk(a, env, dt, a.it ? 48 : 44)) return;
    if (a.it && dist(a, other) <= 0) { a.it = false; other.it = true; a.wait = t + 1; return; }
    if (t < a.wait) return;
    const goal = a.it ? other : nearbyTile(a, env, 2, (c, r) => dist({ c, r }, other) > dist(a, other)) || a;
    const n = stepToward(a, goal, env);
    if (n) { a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip; a.c = n.c; a.r = n.r; }
  },
  sitter(a, env, dt, t) {
    // Stays put at their spot doing their thing (fishing, painting).
    walk(a, env, dt, 30);
    a.pose = a.def.pose || 'sit';
  },
  routine(a, env, dt, t, events) {
    // People with a day: a list of stops, walked one after another.
    const stops = a.def.route || [];
    if (!stops.length) return BEHAVIORS.wander(a, env, dt, t);
    if (a.stop === undefined) a.stop = 0;
    if (!walk(a, env, dt, 34)) return;
    if (a.pose === 'busy') {
      if (t < a.wait) return;
      a.pose = null;
      a.stop = (a.stop + 1) % stops.length;
    }
    const goal = stops[a.stop];
    if (a.c === goal.c && a.r === goal.r || (goal.near && dist(a, goal) <= 1)) {
      a.pose = 'busy';
      a.path = null;
      a.wait = t + (goal.stay || 3);
      if (goal.action) events.push({ type: 'arrive', action: goal.action, stop: goal });
      return;
    }
    // Plan a real path (around ponds and beds) to the next stop.
    if (!a.path || !a.path.length) a.path = env.route ? env.route({ c: a.c, r: a.r }, goal, !!goal.near) : null;
    const n = a.path?.length ? a.path.shift() : stepToward(a, goal, env);
    if (n && env.walkable(n.c, n.r)) { a.flip = n.c < a.c ? true : n.c > a.c ? false : a.flip; a.c = n.c; a.r = n.r; }
    else { a.path = null; a.stop = (a.stop + 1) % stops.length; }
  },
};
export const BEHAVIOR_IDS = Object.keys(BEHAVIORS);
