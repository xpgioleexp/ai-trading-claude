import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, rollover, countItem } from '../src/rules.js';
import { ITEMS } from '../src/data.js';
import { seasonOf, dayOfSeason } from '../src/clock.js';
import { isWalkable, forageTiles } from '../src/world.js';
import { VISITOR_SPOTS, MERCHANT_SPOT } from '../src/visitors.js';
import {
  EVENTS, eventsToday, eventsNow, isOn, upcoming, mushroomSpots, catchScore, recordFestivalCatch,
  catchStar, STARS_PER_NIGHT, snowmanParts, SNOWMAN_PARTS, EVENT_SPOT, SNOWMAN_SPOT,
} from '../src/events.js';

const firstDay = (season, d) => { for (let day = 0; day < 40; day++) if (seasonOf(day) === season && dayOfSeason(day) === d) return day; };

test('every event happens on its days, and night events only after dark', () => {
  for (const e of EVENTS) for (const d of e.days) {
    const day = firstDay(e.season, d);
    assert.ok(eventsToday(day).some(x => x.id === e.id), `${e.id} ${e.season} ${d}`);
    if (e.night) {
      assert.equal(isOn(day, 13, e.id), false);
      assert.ok(isOn(day, 22, e.id));
    } else assert.ok(isOn(day, 13, e.id));
  }
  assert.equal(eventsNow(firstDay('spring', 1), 22).length, 0);
});

test('there is always something coming up within a month', () => {
  for (let day = 0; day < 28; day++) assert.ok(upcoming(day).length >= 2, `day ${day}`);
});

test('mushroom spots are the same for both of you and avoid taken tiles', () => {
  const day = firstDay('autumn', 2);
  const taken = new Set(['3,3', '4,4']);
  const a = mushroomSpots('seed', day, forageTiles(), taken);
  assert.deepEqual(a, mushroomSpots('seed', day, forageTiles(), taken));
  assert.equal(a.length, 5);
  for (const m of a) {
    assert.ok(ITEMS[m.id]);
    assert.ok(!taken.has(m.c + ',' + m.r));
  }
});

test('festival scores reward big and rare fish and keep your best', () => {
  assert.ok(catchScore('golden_carp', 40) > catchScore('minnow', 4));
  assert.ok(catchScore('carp', 60) > catchScore('carp', 30));
  const s = newState('seed', 10);
  rollover(s, 10);
  assert.ok(recordFestivalCatch(s, 'carp', 30));
  assert.equal(recordFestivalCatch(s, 'carp', 20), false);
  assert.equal(s.daily.festival.size, 30);
});

test('a few stars a night', () => {
  const s = newState('seed', 10);
  rollover(s, 10);
  for (let i = 0; i < STARS_PER_NIGHT; i++) assert.ok(catchStar(s).ok);
  assert.equal(catchStar(s).ok, false);
  assert.equal(countItem(s, 'star_fragment'), STARS_PER_NIGHT);
});

test('the snowman is built from both of your rolls', () => {
  assert.equal(snowmanParts([{ rolls: 1 }, { rolls: 2 }]), 3);
  assert.equal(snowmanParts([{ rolls: 9 }]), SNOWMAN_PARTS.length);
});

test('event spots are open ground and clear of visitors and the merchant', () => {
  for (const t of [EVENT_SPOT, SNOWMAN_SPOT]) {
    assert.ok(isWalkable(t.c, t.r));
    assert.ok(!VISITOR_SPOTS.some(v => v.c === t.c && v.r === t.r));
    assert.ok(!(t.r === MERCHANT_SPOT.r && (t.c === MERCHANT_SPOT.c || t.c === MERCHANT_SPOT.c + 1)));
  }
});
