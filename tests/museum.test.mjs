import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, rollover, countItem, addItem, rockDrops } from '../src/rules.js';
import { ITEMS } from '../src/data.js';
import { forageTiles } from '../src/world.js';
import '../src/biomes.js';
import '../src/mine-data.js';
import '../src/weather.js';
import { FURNITURE_BY_TYPE } from '../src/home.js';
import {
  SPECIMENS, PART_INFO, FOSSIL_PART_IDS, DIG_PLACES, partsAt, pickFind, RELIC_IDS, digSites, makeExcavation, excavate,
  fossilFree, claimExcavation, buyKit, DIG_W, DIG_H,
} from '../src/fossils.js';
import {
  wings, donatable, donate, wingProgress, milestonesDue, claimMilestone, readyToMount, mount, tradeSpares, missingFossils,
} from '../src/museum.js';
import { rngFor } from '../src/rng.js';

const fresh = () => { const s = newState('m1', 20000); rollover(s, 20000); s.bag = []; return s; };

test('there are lots of fossils, every piece is an item, and every place has some', () => {
  assert.ok(SPECIMENS.length >= 120 && FOSSIL_PART_IDS.length >= 350);
  assert.equal(new Set(SPECIMENS.map(s => s.id)).size, SPECIMENS.length);
  for (const id of FOSSIL_PART_IDS) assert.ok(ITEMS[id]?.cat === 'fossil' && PART_INFO[id], id);
  for (const p of DIG_PLACES) assert.ok(partsAt(p).length >= 10, p);
  for (const s of SPECIMENS) assert.ok(s.places.every(p => DIG_PLACES.includes(p)), s.id);
  assert.ok(RELIC_IDS.length >= 30 && RELIC_IDS.every(id => ITEMS[id].cat === 'artifact'));
});

test('dig sites are the same for both of you and finds come from the place', () => {
  const tiles = forageTiles();
  assert.deepEqual(digSites('m1', 20001, 'meadow', tiles), digSites('m1', 20001, 'meadow', tiles));
  assert.equal(digSites('m1', 20001, 'meadow', tiles).length, 6);
  for (let i = 0; i < 200; i++) {
    const id = pickFind(rngFor('m1', 'find', i), 'beach');
    const s = PART_INFO[id] && SPECIMENS.find(x => x.id === PART_INFO[id].specimen);
    assert.ok(s ? s.places.includes('beach') : RELIC_IDS.includes(id), id);
  }
});

test('brushing frees a fossil without cracks; hammering bare bone cracks it', () => {
  const ex = makeExcavation(rngFor('m1', 'ex'), 'fossil_trex_skull', 2);
  assert.equal(ex.cells.length, DIG_W * DIG_H);
  ex.energy = 999;
  ex.cells.forEach((c, i) => { while (c.fossil && c.depth > 0) excavate(ex, 'brush', i); });
  assert.ok(fossilFree(ex) && ex.done && ex.quality === 'perfect');
  const ex2 = makeExcavation(rngFor('m1', 'ex2'), 'fossil_trex_skull', 1);
  const bone = ex2.cells.findIndex(c => c.fossil);
  ex2.cells[bone].depth = 0;
  excavate(ex2, 'hammer', bone);
  assert.ok(ex2.cracks >= 1);
  const s = fresh();
  assert.ok(!buyKit(s, 2).ok, 'kit first');
  s.pebbles = 5000;
  assert.ok(buyKit(s, 1).ok && buyKit(s, 2).ok && s.digKit === 2);
  const before = s.pebbles;
  assert.ok(claimExcavation(s, ex, addItem));
  assert.ok(!claimExcavation(s, ex, addItem), 'only once');
  assert.equal(countItem(s, 'fossil_trex_skull'), 1);
  assert.equal(s.fossilQuality.fossil_trex_skull, 'perfect');
  assert.ok(s.pebbles > before);
});

test('giving to the museum, milestones, skeletons and the spare swap', () => {
  const s = fresh();
  const docs = {};
  const trex = SPECIMENS.find(x => x.id === 'trex');
  for (const id of trex.parts) addItem(s, id, 1);
  for (const id of trex.parts) {
    const d = donate(s, docs, id, 'me', 1);
    assert.ok(d && d.item === id);
    docs[id] = d;
  }
  assert.equal(donate(s, docs, trex.parts[0], 'me', 1), null, 'no doubles');
  assert.deepEqual(readyToMount(docs).map(x => x.id), ['trex']);
  assert.equal(mount(s, docs, 'trex', [...trex.parts].reverse(), 'me', 2), null, 'pieces in the wrong spots');
  const m = mount(s, docs, 'trex', trex.parts, 'me', 2);
  assert.ok(m);
  docs['mount-trex'] = m;
  assert.equal(readyToMount(docs).length, 0);
  // fill a quarter of the artifact wing for a milestone
  const art = wings().find(w => w.id === 'artifacts');
  for (const id of art.items.slice(0, Math.ceil(art.items.length / 4))) docs[id] = { item: id, by: 'you' };
  assert.ok(wingProgress(docs, art).pct >= 0.25);
  const due = milestonesDue(s, docs).find(x => x.wing === 'artifacts' && x.i === 0);
  assert.ok(due);
  assert.ok(claimMilestone(s, docs, 'artifacts', 0));
  assert.equal(claimMilestone(s, docs, 'artifacts', 0), null, 'once each');
  // spares
  for (const id of trex.parts.slice(0, 3)) addItem(s, id, 1);
  const got = tradeSpares(s, docs, () => 0);
  assert.ok(got && missingFossils(docs).has(got) && countItem(s, got) === 1);
  for (const w of wings()) assert.ok(w.items.length > 0, w.id);
  for (const t of ['fish_model', 'grand_aquarium', 'trex_skull_display']) assert.ok(FURNITURE_BY_TYPE[t]);
});

test('donatable only lists things the museum wants', () => {
  const s = fresh();
  addItem(s, 'wood', 3);
  addItem(s, 'fossil_dodo_skull', 1);
  assert.deepEqual(donatable(s, {}).map(d => d.id), ['fossil_dodo_skull']);
});

test('fossil rocks in the mine sometimes give skeleton pieces', () => {
  let pieces = 0;
  for (let i = 0; i < 200; i++) {
    const [d] = rockDrops('m1', 20000 + i, 3, { id: 'r' + i, kind: 'fossil' });
    if (PART_INFO[d.id]) pieces++;
  }
  assert.ok(pieces > 40 && pieces < 140, String(pieces));
});
