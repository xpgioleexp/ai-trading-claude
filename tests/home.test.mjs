import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { HOUSE_LEVELS, FURNITURE, nextLevel, missingFor, payFor, addableRooms, maxRooms, canPlace, blockedTiles, roomWalkable, DOOR, ROOM } from '../src/home.js';

test('the tent grows into a cottage with a loft', () => {
  assert.deepEqual(HOUSE_LEVELS.map(l => l.name), ['Tent', 'Cabin', 'Cottage', 'Cottage with a loft']);
  assert.deepEqual([0, 1, 2, 3].map(maxRooms), [1, 2, 4, 6]);
  assert.equal(nextLevel(3), null);
});

test('upgrades need pebbles and materials from the cave', () => {
  const s = R.newState('h', 20000);
  s.bag = [];
  s.pebbles = 300;
  const cabin = nextLevel(0).cost;
  assert.deepEqual(missingFor(s, cabin).map(m => m.id), ['stone']);
  assert.equal(payFor(s, cabin), false);
  R.addItem(s, 'stone', 20);
  assert.ok(payFor(s, cabin));
  assert.equal(s.pebbles, 50);
  assert.equal(R.countItem(s, 'stone'), 5);
});

test('the shared bedroom comes with the cabin and there is only one', () => {
  assert.ok(!addableRooms(0, [{ type: 'living' }]).length, 'a tent has one room');
  const cabin = addableRooms(1, [{ type: 'living' }]).map(t => t.id);
  assert.ok(cabin.includes('bedroom'));
  assert.ok(!cabin.includes('loft'));
  const cottage = addableRooms(2, [{ type: 'living' }, { type: 'bedroom' }]).map(t => t.id);
  assert.ok(!cottage.includes('bedroom'));
  assert.ok(cottage.includes('study'));
  assert.ok(addableRooms(3, [{ type: 'living' }]).some(t => t.id === 'loft'));
});

test('furniture must fit on the floor, keep the door clear and not overlap', () => {
  assert.equal(FURNITURE.length, 31);
  const bed = { id: 'b', type: 'double_bed', c: 3, r: 4 };
  assert.ok(canPlace('double_bed', 3, 4, []));
  assert.equal(canPlace('double_bed', ROOM.c1, 4, []), false, 'hangs off the side');
  assert.equal(canPlace('armchair', 4, 5, [bed]), false, 'overlaps the bed');
  assert.ok(canPlace('rug_round', 3, 4, [bed]), 'rugs go under furniture');
  assert.equal(canPlace('armchair', DOOR.c, DOOR.r, []), false, 'door stays clear');
  assert.ok(canPlace('double_bed', 3, 6, [bed], 'b'), 'moving ignores itself');
  const blocked = blockedTiles([bed, { id: 'r', type: 'rug_long', c: 6, r: 7 }]);
  assert.equal(roomWalkable(4, 5, blocked), false);
  assert.ok(roomWalkable(6, 7, blocked), 'you can walk on rugs');
  assert.equal(roomWalkable(ROOM.c0 - 1, 5, blocked), false);
});
