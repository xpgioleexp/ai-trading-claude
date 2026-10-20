import test from 'node:test';
import assert from 'node:assert/strict';
import { UNLOCK_DAY, UNLOCK_NOTES, jarDay, isUnlocked, daysUntil, lockedText } from '../src/unlocks.js';
import { APP_IDS } from '../src/phone.js';

test('every phone app has an unlock day in the first week, and day 0 has the basics', () => {
  for (const id of APP_IDS) assert.ok(id in UNLOCK_DAY, id);
  for (const d of Object.values(UNLOCK_DAY)) assert.ok(d >= 0 && d <= 6);
  for (const id of ['today', 'mail', 'bag', 'shop', 'settings']) assert.equal(UNLOCK_DAY[id], 0);
  for (const d of new Set(Object.values(UNLOCK_DAY))) if (d > 0) assert.ok(UNLOCK_NOTES[d], `note for day ${d}`);
});

test('things open by days since the jar was made, and old jars have everything', () => {
  assert.equal(jarDay({ startDay: 100 }, 102), 2);
  assert.equal(jarDay(null, 5), Infinity);
  assert.ok(!isUnlocked('mine', 1) && isUnlocked('mine', 2));
  assert.ok(isUnlocked('jars', jarDay({ startDay: 0 }, 400)));
  assert.equal(daysUntil('jars', 4), 2);
  assert.match(lockedText('mine', 1, 'The mine'), /tomorrow/);
});
