import test from 'node:test';
import assert from 'node:assert/strict';
import { OBJECTS, MEADOW_REGIONS, PONDS, isWalkable, forageTiles, START_TILE, MEADOW_WEST, MEADOW_COLS, MEADOW_NORTH, MEADOW_SOUTH } from '../src/world.js';
import { MAPS, MAP_ORDER } from '../src/maps.js';
import '../src/biomes.js';
import { regionAt } from '../src/regions.js';
import { newState, rollover } from '../src/rules.js';
import {
  CHAPTERS, PAGE_SPOTS, PAGE_COUNT, myHalf, spotsForMe, spotAtLandmark, spotInMine, spotForFish, spotDoc, pageFound, chapterDone, finalOpen,
  rewardDue, claimReward,
} from '../src/lore.js';
import { explore, isExplored, exploredShare } from '../src/world-map.js';

test('the meadow and jars are huge, with named regions and landmarks', () => {
  assert.ok(MEADOW_WEST + MEADOW_COLS >= 130 && MEADOW_NORTH + 12 + MEADOW_SOUTH >= 60);
  assert.ok(MEADOW_REGIONS.length >= 9 && OBJECTS.filter(o => o.kind === 'landmark').length >= 25);
  assert.ok(PONDS.length >= 9);
  assert.equal(regionAt(MEADOW_REGIONS, -40, 0).name, 'Whispering woods');
  assert.equal(regionAt(MEADOW_REGIONS, 0, 30).name, 'The old ruins');
  for (const id of MAP_ORDER) {
    const map = MAPS[id];
    assert.ok(map.regions?.length >= 9 && map.west >= 40 && map.north >= 20, id);
    assert.ok(map.objects.filter(o => o.kind === 'landmark').length >= 8, id);
  }
  assert.ok(forageTiles().length > 6000);
  assert.ok(isWalkable(START_TILE.c, START_TILE.r));
});

test('every lore spot is somewhere real', () => {
  const ids = new Set([...OBJECTS.map(o => o.id), ...Object.values(MAPS).flatMap(m => m.objects.map(o => o.id))]);
  for (const s of PAGE_SPOTS) if (s.where.landmark) assert.ok(ids.has(s.where.landmark), s.where.landmark);
  assert.ok(PAGE_COUNT >= 35 && CHAPTERS.length >= 7);
});

test('torn pages: each of you finds your own half, and the page is whole with both', () => {
  assert.equal(myHalf('a', 'b'), 0);
  assert.equal(myHalf('b', 'a'), 1);
  assert.equal(myHalf('a', null), null);
  const docs = {};
  const a = spotAtLandmark(docs, 'a', 'b', 'orchard_well');
  assert.ok(a && a.half === 0);
  assert.equal(spotAtLandmark(docs, 'a', 'b', 'windmill'), null, 'the other half is your partner\'s');
  assert.ok(spotAtLandmark(docs, 'b', 'a', 'windmill'));
  const one = spotDoc(a, 'a', 1);
  docs[one.id] = one.doc;
  assert.ok(!pageFound(docs, 'p4'));
  const two = spotDoc(spotAtLandmark(docs, 'b', 'a', 'windmill'), 'b', 2);
  docs[two.id] = two.doc;
  assert.ok(pageFound(docs, 'p4'));
  // On your own, you can find both halves.
  assert.ok(spotAtLandmark({}, 'a', null, 'windmill'));
});

test('mine and fish pages, chapters, rewards and the last letter', () => {
  assert.equal(spotInMine({}, 'a', null, 5), null);
  assert.equal(spotInMine({}, 'a', null, 12).page, 'd1');
  assert.equal(spotForFish({}, 'a', null, 'sturgeon').page, 'w4');
  const docs = {};
  assert.ok(!finalOpen(docs));
  assert.ok(!spotsForMe(docs, 'a', null).some(s => s.chapter === 'letter'), 'the last letter waits');
  for (const s of PAGE_SPOTS) if (s.chapter !== 'letter') { const d = spotDoc(s, 'a', 1); docs[d.id] = d.doc; }
  assert.ok(finalOpen(docs) && chapterDone(docs, 'keepers'));
  assert.ok(spotsForMe(docs, 'a', null).some(s => s.chapter === 'letter'));
  const st = newState('l', 20000);
  rollover(st, 20000);
  const before = st.pebbles;
  assert.ok(rewardDue(st, docs, 'keepers'));
  assert.equal(claimReward(st, docs, 'keepers'), 300);
  assert.equal(st.pebbles, before + 300);
  assert.equal(claimReward(st, docs, 'keepers'), 0);
});

test('the map fills in as you explore', () => {
  const st = newState('m', 20000);
  assert.ok(!isExplored(st, 'meadow', 5, 3));
  assert.ok(explore(st, 'meadow', 5, 3));
  assert.ok(isExplored(st, 'meadow', 5, 3) && isExplored(st, 'meadow', 12, 10));
  assert.ok(!explore(st, 'meadow', 6, 3), 'nothing new a step away');
  assert.ok(exploredShare(st, 'meadow') > 0 && exploredShare(st, 'meadow') < 0.2);
});
