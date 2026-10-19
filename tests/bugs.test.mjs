import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { BUGS, bugsOut, spawnBugs, catchBug, alertRate, timeBlock, BUGS_AT_ONCE } from '../src/bugs.js';
import { ITEMS } from '../src/data.js';
import { forageTiles } from '../src/world.js';
import { SEASONS } from '../src/clock.js';

const tiles = { flower: forageTiles(), ground: forageTiles(), tree: forageTiles().slice(0, 6), pond: forageTiles().slice(6, 12) };

test('there is always something to catch, in every season, day and night', () => {
  for (const season of SEASONS) {
    for (const hour of [3, 13]) {
      for (const weather of ['sun', 'rain', 'snow', 'fog']) {
        assert.ok(bugsOut(season, hour, weather).length >= 2, `${season} ${hour} ${weather}`);
      }
    }
  }
  assert.ok(BUGS.length >= 24);
  for (const b of BUGS) assert.equal(ITEMS[b.id].cat, 'bug');
});

test('fireflies come out at night, butterflies by day, pill bugs in the rain', () => {
  assert.ok(bugsOut('summer', 22, 'sun').some(b => b.id === 'firefly'));
  assert.ok(!bugsOut('summer', 13, 'sun').some(b => b.id === 'firefly'));
  assert.ok(bugsOut('spring', 13, 'sun').some(b => b.id === 'cabbage_white'));
  assert.ok(bugsOut('autumn', 13, 'rain').some(b => b.id === 'pill_bug'));
  assert.ok(!bugsOut('autumn', 13, 'sun').some(b => b.id === 'pill_bug'));
});

test('both of you see the same bugs, and they change every two hours', () => {
  const a = spawnBugs('seed', 20000, 14, 'summer', 'sun', tiles);
  assert.deepEqual(a, spawnBugs('seed', 20000, 15, 'summer', 'sun', tiles));
  assert.equal(a.length, BUGS_AT_ONCE);
  assert.notDeepEqual(a, spawnBugs('seed', 20000, 16, 'summer', 'sun', tiles));
  assert.equal(timeBlock(15), timeBlock(14));
  assert.equal(new Set(a.map(b => b.c + ',' + b.r)).size, a.length, 'one bug per tile');
});

test('sneaking keeps bugs calmer than walking up to them', () => {
  const butterfly = BUGS.find(b => b.id === 'swallowtail');
  assert.ok(alertRate(butterfly, true) < alertRate(butterfly, false) / 3);
});

test('a caught bug goes in the bag and the log, once', () => {
  const s = R.newState('b', 20000);
  R.rollover(s, 20000);
  assert.ok(catchBug(s, '20000-7-0', 'ladybug'));
  assert.equal(catchBug(s, '20000-7-0', 'ladybug'), false);
  assert.equal(R.countItem(s, 'ladybug'), 1);
  assert.deepEqual(s.log.bugs.ladybug, { count: 1 });
  assert.equal(s.log.found.ladybug, true);
});
