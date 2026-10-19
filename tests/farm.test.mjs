import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { ITEMS, CROPS } from '../src/data.js';
import { BEDS, isWalkable, START_TILE } from '../src/world.js';
import { pathNextTo } from '../src/path.js';
import { FARM_BUILDINGS, FERTILIZERS, PANTRY, BED_LEVELS } from '../src/farm-data.js';
import { buildingState, collect, upgradeBeds, nextBedUpgrade, buySprinkler } from '../src/farm.js';
import '../src/crafting.js';

const fresh = (day = 20000) => { const s = R.newState('seed', day); R.rollover(s, day); return s; };

test('48 crops, 12 for each season, and every crop and seed is an item', () => {
  for (const season of ['spring', 'summer', 'autumn', 'winter']) assert.equal(CROPS.filter(c => c.season === season).length, 12, season);
  for (const c of CROPS) {
    assert.ok(ITEMS[c.id] && ITEMS[c.id + '_seed'], c.id);
    assert.ok(c.days > 0 && c.price > 0);
  }
  for (const f of FARM_BUILDINGS) assert.ok(ITEMS[f.makes] && ITEMS['made_' + f.type], f.type);
  for (const p of PANTRY) assert.ok(ITEMS[p.id], p.id);
});

test('all 12 beds can be reached, but only 6 are open at first', () => {
  assert.equal(BEDS.length, 12);
  for (const b of BEDS) assert.ok(pathNextTo((c, r) => isWalkable(c, r), START_TILE, [b]), `${b.c},${b.r}`);
  const s = fresh();
  R.addItem(s, 'radish_seed', 2);
  assert.equal(R.plantBed(s, 8, 'radish_seed'), false, 'locked');
  assert.ok(R.plantBed(s, 0, 'radish_seed'));
});

test('opening beds and the sprinkler', () => {
  const s = fresh();
  s.pebbles = 5000;
  assert.equal(upgradeBeds(s), false, 'needs wood');
  R.addItem(s, 'wood', 30);
  R.addItem(s, 'stone', 20);
  assert.ok(upgradeBeds(s));
  assert.equal(s.farm.beds, 9);
  assert.ok(upgradeBeds(s));
  assert.equal(s.farm.beds, 12);
  assert.equal(nextBedUpgrade(s), null);
  R.addItem(s, 'copper_ore', 5);
  R.addItem(s, 'iron_ore', 3);
  assert.ok(buySprinkler(s));
  // The sprinkler waters planted beds every morning.
  R.addItem(s, 'radish_seed', 1);
  R.plantBed(s, 0, 'radish_seed');
  R.rollover(s, 20001);
  assert.equal(s.garden[0].count, 1);
});

test('fertilizers: extra crops, faster growth, and soil that waters itself', () => {
  const s = fresh();
  for (const f of FERTILIZERS) R.addItem(s, f.id, 1);
  R.addItem(s, 'potato_seed', 3);
  assert.ok(R.plantBed(s, 0, 'potato_seed', 'fertilizer'));
  assert.ok(R.plantBed(s, 1, 'potato_seed', 'speed_gro'));
  assert.ok(R.plantBed(s, 2, 'potato_seed', 'water_soil'));
  assert.equal(R.countItem(s, 'fertilizer'), 0);
  assert.ok(R.daysFor(s.garden[1]) < R.daysFor(s.garden[0]));
  let day = 20000;
  for (let i = 0; i < 6; i++) {
    R.waterBed(s, 0, day);
    day++;
    R.rollover(s, day);
  }
  assert.equal(R.bedStage(s.garden[2], day), 3, 'water-keeping soil waters itself');
  assert.equal(R.bedStage(s.garden[0], day), 3);
  R.harvestBed(s, 0, day);
  assert.equal(R.countItem(s, 'potato'), 2, 'fertilizer gives an extra one');
});

test('farm buildings make things every day, and trees grow first', () => {
  const s = fresh();
  const coop = { id: 'c1', type: 'coop', placedDay: 20000 };
  assert.ok(collect(s, coop, 20000).ok);
  assert.equal(R.countItem(s, 'egg'), 2);
  assert.equal(collect(s, coop, 20000).state, 'collected');
  const tree = { id: 't1', type: 'tree_lemon', placedDay: 20000 };
  assert.equal(buildingState(s, tree, 20001).state, 'growing');
  assert.equal(buildingState(s, tree, 20003).state, 'ready');
  const bees = { id: 'b1', type: 'bee_box', placedDay: 20000 };
  assert.equal(buildingState(s, bees, 20001).state, 'resting');
  R.rollover(s, 20001);
  assert.ok(collect(s, coop, 20001).ok, 'again the next day');
});

test('old saves get the new farm fields', () => {
  const old = R.newState('x', 20000);
  delete old.farm;
  old.garden = old.garden.slice(0, 6);
  const m = R.migrate(old, 'x', 20000);
  assert.equal(m.farm.beds, BED_LEVELS[0]);
  assert.equal(m.garden.length, 12);
});
