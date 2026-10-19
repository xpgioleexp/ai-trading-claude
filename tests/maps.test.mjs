import test from 'node:test';
import assert from 'node:assert/strict';
import { MAPS, MAP_ORDER, mapWalkable, mapForageSpots, mapCatch, mapOpenTiles, mapDaily, MAP_FISH_IDS } from '../src/maps.js';
import { ITEMS } from '../src/data.js';
import { isWalkable, OBJECTS } from '../src/world.js';
import { pathTo } from '../src/path.js';
import { rngFor } from '../src/rng.js';
import { newState, rollover } from '../src/rules.js';
import { bugsOut } from '../src/bugs.js';

test('the meadow door is walkable and reachable', () => {
  const door = OBJECTS.find(o => o.id === 'door');
  assert.ok(isWalkable(door.c, door.r));
  assert.ok(isWalkable(door.c - 1, door.r));
});

test('every jar can be walked from its door to every open tile', () => {
  for (const id of MAP_ORDER) {
    const map = MAPS[id];
    const door = map.objects.find(o => o.id === 'door');
    assert.ok(mapWalkable(map, door.c, door.r), id);
    assert.ok(mapWalkable(map, 1, 5), `${id} start tile`);
    for (const t of mapOpenTiles(map)) {
      const path = pathTo((c, r) => mapWalkable(map, c, r), { c: 1, r: 5 }, t);
      assert.ok(path && (path.length || (t.c === 1 && t.r === 5)), `${id} ${t.c},${t.r}`);
    }
  }
});

test('forage spots are the same for both of you and sit on open ground', () => {
  for (const id of MAP_ORDER) {
    const a = mapForageSpots('seed', 40, id);
    assert.deepEqual(a, mapForageSpots('seed', 40, id));
    assert.equal(a.length, 5);
    for (const f of a) {
      assert.ok(ITEMS[f.id], f.id);
      assert.ok(mapWalkable(MAPS[id], f.c, f.r));
    }
  }
});

test('a jar only has its own fish (or junk)', () => {
  for (const id of MAP_ORDER) {
    const rand = rngFor('x', id);
    for (let i = 0; i < 200; i++) {
      const c = mapCatch(rand, id, 12);
      const item = ITEMS[c.id];
      if (item.cat === 'junk') continue;
      assert.equal(item.map, id);
      assert.ok(MAP_FISH_IDS.includes(c.id));
      assert.ok(c.size >= item.size[0] && c.size <= item.size[1]);
    }
  }
});

test('each jar keeps its own daily bites and forage', () => {
  const s = newState('seed', 10);
  rollover(s, 10);
  const d = mapDaily(s, 'beach', 10, 'seed', 10);
  d.bites = 3;
  assert.equal(mapDaily(s, 'beach', 10, 'seed', 10).bites, 3);
  assert.equal(mapDaily(s, 'snow', 10, 'seed', 10).bites, 10);
  assert.equal(s.daily.bites, 10);
});

test('jar-only bugs stay in their jar', () => {
  assert.ok(bugsOut('summer', 12, 'sun', 'beach').some(b => b.id === 'hermit_crab'));
  assert.ok(!bugsOut('summer', 12, 'sun').some(b => b.id === 'hermit_crab'));
  assert.ok(!bugsOut('winter', 12, 'snow', 'snow').some(b => b.id === 'hermit_crab'));
});
