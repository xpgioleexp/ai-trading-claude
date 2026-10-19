import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, rollover, countItem, fishAvailable } from '../src/rules.js';
import { ITEMS, FISH } from '../src/data.js';
import { seasonOf, weatherOf, isWet, weatherMatches } from '../src/clock.js';
import { forageTiles } from '../src/world.js';
import { BUGS, bugAvailable } from '../src/bugs.js';
import { CRAFTS } from '../src/crafting.js';
import '../src/outdoor-data.js';
import {
  weatherNow, puddleSpots, branchSpots, rainbowEnd, pickBranch, splashPuddle, takeRainbow, takeStrike, catchLeaf,
  LEAVES_PER_DAY, RAINBOW_PEBBLES, WEATHER_NAMES, WEATHER_TEXT,
} from '../src/weather.js';

const DAYS = Array.from({ length: 400 }, (_, i) => 20000 + i);

test('every kind of weather turns up, in the right seasons', () => {
  const seen = {};
  for (const d of DAYS) (seen[weatherOf('s1', d)] ||= new Set()).add(seasonOf(d));
  for (const w of ['sun', 'rain', 'snow', 'fog', 'wind', 'storm', 'blizzard', 'heat']) assert.ok(seen[w], w);
  assert.deepEqual([...seen.heat], ['summer']);
  assert.deepEqual([...seen.blizzard], ['winter']);
  assert.ok(!seen.storm.has('winter'));
  for (const w of Object.keys(seen)) assert.ok(WEATHER_NAMES[w] && WEATHER_TEXT[w], w);
  assert.ok(isWet('storm') && isWet('blizzard') && !isWet('wind'));
});

test('rain clears into a rainbow, leaves puddles, and frost only comes on winter mornings', () => {
  let rainbows = 0, showers = 0;
  for (const d of DAYS) {
    const base = weatherOf('s1', d);
    for (let h = 0; h < 24; h++) {
      const w = weatherNow('s1', d, h);
      if (w.rainbow) {
        rainbows++;
        assert.ok(h >= 6 && h < 20, 'no rainbows at night');
      }
      if (w.sunshower) showers++;
      if (base === 'rain' || base === 'storm') assert.ok(w.puddles);
      if (w.clearAt != null && h >= w.clearAt) assert.equal(w.kind, 'sun');
      if (w.frost) assert.ok(seasonOf(d) === 'winter' && h < 10 && !isWet(base));
    }
  }
  assert.ok(rainbows > 10 && showers > 3);
});

test('weather spots are the same for both of you and keep off taken tiles', () => {
  const tiles = forageTiles();
  const a = puddleSpots('s1', 20010, 'meadow', tiles), b = puddleSpots('s1', 20010, 'meadow', tiles);
  assert.deepEqual(a, b);
  const taken = new Set(a.map(t => t.c + ',' + t.r));
  const branches = branchSpots('s1', 20010, 'meadow', tiles, taken);
  assert.ok(branches.length >= 4 && branches.every(t => !taken.has(t.c + ',' + t.r)));
  assert.ok(rainbowEnd('s1', 20010, 'beach', tiles));
});

test('you can pick up each weather find once a day', () => {
  const s = newState('s1', 20000);
  rollover(s, 20000);
  const spot = { c: 1, r: 1, nest: true };
  assert.deepEqual(pickBranch(s, 'meadow', 0, spot), ['branch', 'birds_nest']);
  assert.equal(pickBranch(s, 'meadow', 0, spot), null);
  assert.ok(pickBranch(s, 'beach', 0, spot), 'each jar has its own branches');
  assert.equal(splashPuddle(s, 'meadow', 2, { find: true }), 'shiny_pebble');
  assert.equal(splashPuddle(s, 'meadow', 2, { find: true }), null);
  assert.equal(splashPuddle(s, 'meadow', 3, { find: false }), '');
  const pebbles = s.pebbles;
  assert.ok(takeRainbow(s, 'meadow'));
  assert.equal(s.pebbles, pebbles + RAINBOW_PEBBLES);
  assert.ok(!takeRainbow(s, 'meadow'));
  assert.ok(takeStrike(s, 'meadow') && !takeStrike(s, 'meadow'));
  for (let i = 0; i < LEAVES_PER_DAY; i++) assert.ok(catchLeaf(s, () => 0.5));
  assert.equal(catchLeaf(s, () => 0.5), null);
  assert.equal(countItem(s, 'gust_leaf'), LEAVES_PER_DAY);
});

test('weather fish and bugs only come out in their weather', () => {
  assert.ok(weatherMatches('rain', 'storm') && !weatherMatches('storm', 'rain') && weatherMatches(null, 'fog'));
  const thunderfin = FISH.find(f => f.id === 'thunderfin');
  assert.ok(fishAvailable(thunderfin, 'spring', 12, 'storm') && !fishAvailable(thunderfin, 'spring', 12, 'rain'));
  const kite = BUGS.find(b => b.id === 'kite_moth');
  assert.ok(bugAvailable(kite, 'autumn', 12, 'wind') && !bugAvailable(kite, 'autumn', 12, 'sun'));
});

test('the weather crafts use real items', () => {
  const weatherCrafts = CRAFTS.filter(c => Object.keys(c.needs).some(id => ITEMS[id]?.weatherFind));
  assert.ok(weatherCrafts.length >= 8);
  for (const c of weatherCrafts) for (const id of Object.keys(c.needs)) assert.ok(id.startsWith('#') || ITEMS[id], `${c.id} ${id}`);
});
