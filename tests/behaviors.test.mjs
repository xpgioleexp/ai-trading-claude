import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/mine-data.js';
import '../src/events.js';
import '../src/cooking.js';
import '../src/crafting.js';
import { CRITTERS } from '../src/biomes.js';
import { makeActor, updateActor, isOut, BEHAVIOR_IDS, BEHAVIOR_TEXT } from '../src/behaviors.js';
import { isWalkable, forageTiles } from '../src/world.js';
import { pathTo, pathNextTo } from '../src/path.js';

test('every animal and person has a real behaviour, described in words', () => {
  for (const c of CRITTERS) {
    assert.ok(BEHAVIOR_IDS.includes(c.behavior), `${c.id}: ${c.behavior}`);
    assert.ok(BEHAVIOR_TEXT[c.behavior], c.behavior);
  }
  assert.ok(new Set(CRITTERS.map(c => c.behavior)).size >= 14, 'lots of different behaviours');
});

test('night animals sleep in the day, people keep their hours', () => {
  assert.equal(isOut({ night: true }, 13, false), false);
  assert.equal(isOut({ night: true }, 23, true), true);
  assert.equal(isOut({ hours: [[7, 19]] }, 6, false), false);
  assert.equal(isOut({ hours: [[7, 19]] }, 12, false), true);
});

test('every behaviour runs for a while without walking into walls', () => {
  const walkable = (c, r) => isWalkable(c, r);
  const open = forageTiles();
  for (const id of BEHAVIOR_IDS) {
    const def = { id: 'x', behavior: id, route: [{ c: 6, r: 3 }, { c: 2, r: 7, near: true, action: 'water' }], tag: 't' };
    const a = makeActor(def, open[40], 0);
    const b = makeActor({ ...def, id: 'y' }, open[80], 0);
    const actors = [a, b];
    const events = [];
    for (let i = 0; i < 1200; i++) {
      const t = i / 30;
      const env = {
        t, dt: 1 / 30, hour: 12, night: false, walkable, actors,
        player: { c: 5, r: 3, x: 0, y: 0, moving: i % 50 < 25, sneaking: false },
        anchors: { trees: [{ c: 15, r: 1 }, { c: 19, r: 1 }], water: [{ c: 26, r: 7 }, { c: 27, r: 7 }] },
        friend: () => true,
        route: (from, goal, near) => (near ? pathNextTo(walkable, from, [goal]) : pathTo(walkable, from, goal)),
      };
      events.push(...updateActor(a, env));
      updateActor(b, env);
      assert.ok(Number.isFinite(a.x) && Number.isFinite(a.y), `${id} position`);
      if (['wander', 'scuttle', 'shy', 'lazy', 'slider', 'digger', 'peeker', 'chaser', 'routine', 'follower'].includes(id) && !a.hop) {
        assert.ok(walkable(a.c, a.r), `${id} stood on a wall at ${a.c},${a.r}`);
      }
    }
    if (id === 'routine') assert.ok(events.some(e => e.action === 'water'), 'reaches the garden');
    if (id === 'flyer') assert.ok(a.c !== open[40].c || a.r !== open[40].r, 'it flew somewhere');
    if (id === 'follower') assert.ok(Math.max(Math.abs(a.c - 5), Math.abs(a.r - 3)) <= 3, 'it followed you');
  }
});
