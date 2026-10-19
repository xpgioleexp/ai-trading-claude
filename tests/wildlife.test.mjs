import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS, FISH } from '../src/data.js';
import { newState, rollover, rollCatch, caveCatch, fishAvailable } from '../src/rules.js';
import { BUGS, bugsOut } from '../src/bugs.js';
import { MAPS, MAP_ORDER, mapCatch } from '../src/maps.js';
import { OBJECTS } from '../src/world.js';
import { CAVE_FISH_IDS } from '../src/mine-data.js';
import '../src/weather.js';
import '../src/wildlife-data.js';
import { conditionsMet, timeFits, fullMoon, whenText } from '../src/conditions.js';
import { WILD, wildOut, wildVisitors, spotAnimal } from '../src/wild.js';
import { BEHAVIOR_IDS } from '../src/behaviors.js';
import { rngFor } from '../src/rng.js';

const fishItems = () => Object.values(ITEMS).filter(i => i.cat === 'fish');

test('there are lots of fish, bugs and animals', () => {
  assert.ok(fishItems().length >= 200, String(fishItems().length));
  assert.ok(BUGS.length >= 160, String(BUGS.length));
  assert.ok(WILD.length >= 140, String(WILD.length));
  assert.equal(new Set(WILD.map(w => w.id)).size, WILD.length);
  assert.equal(new Set(BUGS.map(b => b.id)).size, BUGS.length);
});

test('conditions: times, hours across midnight, ponds, full moons and rainbows', () => {
  assert.ok(timeFits('dawn', 6) && !timeFits('dawn', 9) && timeFits('dusk', 18));
  assert.ok(conditionsMet({ hours: [[23, 2]] }, { hour: 0 }) && !conditionsMet({ hours: [[23, 2]] }, { hour: 12 }));
  assert.ok(!conditionsMet({ ponds: ['pond5'] }, { pond: 'pond' }) && conditionsMet({ ponds: ['pond5'] }, {}));
  assert.ok(fullMoon(16) && !fullMoon(17));
  assert.ok(conditionsMet({ needs: 'fullmoon' }, { day: 16, hour: 23 }) && !conditionsMet({ needs: 'fullmoon' }, { day: 17, hour: 23 }));
  assert.ok(!conditionsMet({ needs: 'rainbow' }, { wx: { rainbow: false } }) && conditionsMet({ needs: 'rainbow' }, { wx: { rainbow: true } }));
  assert.ok(whenText({ time: 'dawn', seasons: ['spring'] }).includes('Dawn'));
});

test('pond-only fish only bite in their pond', () => {
  const trout = FISH.find(f => f.id === 'golden_trout');
  assert.ok(fishAvailable(trout, 'summer', 6, 'sun', { pond: 'pond5' }) && !fishAvailable(trout, 'summer', 6, 'sun', { pond: 'pond' }));
  for (let i = 0; i < 300; i++) {
    const c = rollCatch(rngFor('w', 'p', i), 'summer', 13, 'sun', { pond: 'pond' });
    const f = ITEMS[c.id];
    if (f.cat === 'fish') assert.ok(!f.ponds || f.ponds.includes('pond'), c.id);
  }
  for (const f of FISH) for (const p of f.ponds || []) assert.ok(OBJECTS.some(o => o.id === p), `${f.id} ${p}`);
});

test('every jar fish bites in a real pool, and jars still always give a fish', () => {
  for (const id of MAP_ORDER) {
    const waters = MAPS[id].objects.filter(o => /^water/.test(o.id)).map(o => o.id);
    for (const f of fishItems().filter(f => f.map === id)) for (const p of f.ponds || []) assert.ok(waters.includes(p), `${id} ${f.id} ${p}`);
    for (const pond of waters) for (const hour of [3, 12, 18]) assert.ok(mapCatch(rngFor(id, pond, hour), id, hour, { pond, weather: 'sun' }).id);
  }
});

test('the deep mine has its own fish', () => {
  assert.ok(CAVE_FISH_IDS.length >= 25);
  for (let band = 0; band < 6; band++) assert.ok(caveCatch(Math.random, band, band * 10 + 5).id);
  let deep = 0;
  for (let i = 0; i < 400; i++) if (caveCatch(rngFor('d', i), 5, 60).id === 'leviathan_fry') deep++;
  assert.ok(deep > 0, 'the little leviathan lives on layer 60');
});

test('every place has bugs and animals at every hour of the day', () => {
  for (const place of ['meadow', ...MAP_ORDER]) {
    const mapId = place === 'meadow' ? null : place;
    const season = mapId ? MAPS[mapId].season : 'summer';
    for (const hour of [1, 7, 13, 19]) {
      assert.ok(wildOut(place, { season, hour, weather: 'sun', wx: {}, day: 3 }).length >= 2, `${place} ${hour} animals`);
      assert.ok(bugsOut(season, hour, 'sun', mapId).length >= 2, `${place} ${hour} bugs`);
    }
  }
  for (const w of WILD) assert.ok(BEHAVIOR_IDS.includes(w.behavior), w.id);
});

test('animals you meet are the same for both of you, and spotting counts once a day', () => {
  const ctx = { season: 'summer', hour: 13, weather: 'sun', wx: {} };
  assert.deepEqual(wildVisitors('w', 20001, 'meadow', ctx).map(w => w.id), wildVisitors('w', 20001, 'meadow', ctx).map(w => w.id));
  const s = newState('w', 20000);
  rollover(s, 20000);
  const before = s.pebbles;
  const a = spotAnimal(s, 'red_fox', 20000);
  assert.ok(a.first && s.pebbles > before);
  assert.equal(spotAnimal(s, 'red_fox', 20000), null);
  assert.ok(!spotAnimal(s, 'red_fox', 20001).first);
});
