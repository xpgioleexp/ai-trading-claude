import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { ITEMS, FISH, CROPS, MINE_LAYERS, BAG_SLOTS, STACK, DAILY_BITES } from '../src/data.js';
import { seasonOf, weatherOf, dayNumber, SEASONS } from '../src/clock.js';
import { pathTo, pathNextTo } from '../src/path.js';
import { isWalkable, OBJECTS, BEDS, forageTiles, footprintTiles, START_TILE } from '../src/world.js';

// Find a day with the season and weather a test needs.
function dayWith(seed, season, weatherTest) {
  for (let d = 20000; d < 21000; d++) {
    if (seasonOf(d) === season && weatherTest(weatherOf(seed, d))) return d;
  }
  throw new Error('no such day');
}

test('every item has a name, price and known category', () => {
  for (const item of Object.values(ITEMS)) {
    assert.ok(item.name, item.id);
    assert.ok(item.price > 0, item.id);
    assert.ok(['fish', 'junk', 'crop', 'seed', 'forage', 'mineral', 'fossil', 'artifact', 'loot'].includes(item.cat), item.id);
  }
  assert.equal(FISH.length, 25);
  assert.equal(CROPS.length, 16);
});

test('every season and time of day has fish to catch', () => {
  for (const season of SEASONS) {
    for (const hour of [3, 12]) {
      for (const weather of ['sun', 'rain', 'snow', 'fog']) {
        assert.ok(R.biteableFish(season, hour, weather).length >= 5, `${season} ${hour} ${weather}`);
      }
    }
  }
});

test('night and rain fish only bite at the right time', () => {
  const eel = FISH.find(f => f.id === 'eel');
  assert.equal(R.fishAvailable(eel, 'summer', 12, 'rain'), false);
  assert.equal(R.fishAvailable(eel, 'summer', 22, 'sun'), false);
  assert.equal(R.fishAvailable(eel, 'summer', 22, 'rain'), true);
});

test('day numbers follow the local calendar', () => {
  assert.equal(dayNumber(new Date(2026, 9, 18, 0, 5)), dayNumber(new Date(2026, 9, 18, 23, 55)));
  assert.equal(dayNumber(new Date(2026, 9, 19, 0, 1)) - dayNumber(new Date(2026, 9, 18, 23, 59)), 1);
});

test('a new day resets bites, pays the crate and keeps forage stable', () => {
  const s = R.newState('seed-a', 20000);
  R.rollover(s, 20000);
  assert.equal(s.daily.bites, DAILY_BITES);
  assert.equal(s.daily.forage.length, 4);
  assert.deepEqual(s.daily.forage, R.forageSpots('seed-a', 20000));
  R.addItem(s, 'carp', 2);
  R.putInCrate(s, 'carp', 2);
  const before = s.pebbles;
  assert.deepEqual(R.rollover(s, 20000), [], 'same day does nothing');
  const events = R.rollover(s, 20001);
  assert.equal(s.pebbles, before + ITEMS.carp.price * 2);
  assert.equal(events[0].type, 'payout');
  assert.equal(s.crate.length, 0);
});

test('bag stacks items and stops when full', () => {
  const s = R.newState('seed-b', 20000);
  s.bag = [];
  assert.equal(R.addItem(s, 'stone', 150), 150);
  assert.equal(s.bag.length, 2);
  assert.equal(s.bag[0].n, STACK);
  for (let i = 0; s.bag.length < BAG_SLOTS; i++) R.addItem(s, FISH[i].id, 1);
  assert.equal(R.addItem(s, 'diamond', 1), 0);
  assert.ok(R.bagFull(s, 'diamond'));
  assert.ok(R.removeItem(s, 'stone', 120));
  assert.equal(R.countItem(s, 'stone'), 30);
  assert.equal(R.removeItem(s, 'stone', 31), false);
});

test('crops grow one stage per watered day, from the next day on', () => {
  const s = R.newState('seed-c', 20000);
  s.bag = [{ id: 'radish_seed', n: 1 }];
  assert.ok(R.plantBed(s, 0, 'radish_seed'));
  assert.equal(R.countItem(s, 'radish_seed'), 0);
  let day = 20000;
  for (let i = 0; i < 3; i++, day++) {
    assert.ok(R.waterBed(s, 0, day));
    assert.equal(R.waterBed(s, 0, day), false, 'once per day');
  }
  assert.equal(R.bedStage(s.garden[0], day - 1), 2, 'not ready the same day as the last watering');
  assert.equal(R.bedStage(s.garden[0], day), 3);
  assert.equal(R.harvestBed(s, 0, day), 'radish');
  assert.equal(s.garden[0].crop, null);
});

test('unwatered crops wait instead of dying, and regrowing crops come back', () => {
  const s = R.newState('seed-d', 20000);
  s.bag = [{ id: 'strawberry_seed', n: 1 }];
  R.plantBed(s, 1, 'strawberry_seed');
  for (let d = 20000; d < 20004; d++) R.waterBed(s, 1, d);
  assert.equal(R.bedStage(s.garden[1], 20100), 3, 'still ready long after');
  R.harvestBed(s, 1, 20100);
  assert.equal(s.garden[1].crop, 'strawberry');
  assert.equal(R.bedStage(s.garden[1], 20100), 2, 'regrows from halfway');
  R.waterBed(s, 1, 20100);
  R.waterBed(s, 1, 20101);
  assert.equal(R.bedStage(s.garden[1], 20102), 3);
});

test('rainy days water the garden', () => {
  const seed = 'seed-e';
  const rainy = dayWith(seed, 'spring', w => w === 'rain');
  const s = R.newState(seed, rainy - 1);
  R.rollover(s, rainy - 1);
  s.bag = [{ id: 'radish_seed', n: 1 }];
  R.plantBed(s, 0, 'radish_seed');
  const events = R.rollover(s, rainy);
  assert.equal(s.garden[0].last, rainy);
  assert.ok(events.some(e => e.type === 'rain-watered'));
});

test('catches are always fish that can bite right now, or junk', () => {
  const s = R.newState('seed-f', 20000);
  R.rollover(s, 20000);
  let rand = 0.37;
  const fake = () => (rand = (rand * 9301 + 0.49297) % 1);
  for (let i = 0; i < 300; i++) {
    const c = R.rollCatch(fake, 'winter', 23, 'snow');
    const item = ITEMS[c.id];
    if (item.cat === 'junk') continue;
    assert.ok(R.fishAvailable(item, 'winter', 23, 'snow'), c.id);
    assert.ok(c.size >= item.size[0] && c.size <= item.size[1]);
  }
  for (let i = 0; i < DAILY_BITES; i++) assert.ok(R.useBite(s));
  assert.equal(R.useBite(s), false);
});

test('the fish log keeps the biggest catch', () => {
  const s = R.newState('seed-g', 20000);
  assert.equal(R.recordCatch(s, 'carp', 30), false);
  assert.equal(R.recordCatch(s, 'carp', 45), true);
  assert.equal(R.recordCatch(s, 'carp', 40), false);
  assert.deepEqual(s.log.fish.carp, { count: 3, best: 45 });
});

test('mine layers are stable for a day and always have a way down', () => {
  for (let layer = 1; layer <= MINE_LAYERS; layer++) {
    const a = R.layerRocks('seed-h', 20000, layer);
    assert.deepEqual(a, R.layerRocks('seed-h', 20000, layer));
    assert.equal(a.filter(r => r.ladder).length, layer < MINE_LAYERS ? 1 : 0, 'layer ' + layer);
    assert.ok(!a.some(r => r.c === R.MINE_START.c && r.r === R.MINE_START.r));
  }
  assert.notDeepEqual(R.layerRocks('seed-h', 20000, 3), R.layerRocks('seed-h', 20001, 3));
});

test('breaking rocks fills the bag once per rock per day', () => {
  const s = R.newState('seed-i', 20000);
  R.rollover(s, 20000);
  s.bag = [];
  const rock = R.layerRocks(s.seed, 20000, 1)[0];
  const got = R.breakRock(s, 1, rock);
  assert.ok(got.length > 0);
  assert.equal(R.breakRock(s, 1, rock), null);
  R.rollover(s, 20001);
  assert.deepEqual(s.daily.mine, {}, 'rocks come back the next day');
});

test('better pickaxes need fewer hits', () => {
  const rock = { hp: 6 };
  assert.deepEqual([0, 1, 2, 3].map(t => R.rockHits(rock, t)), [6, 3, 2, 2]);
  assert.deepEqual(R.elevatorStops(0), [1]);
  assert.deepEqual(R.elevatorStops(15), [1, 11]);
});

test('upgrades cost ore and pebbles', () => {
  const s = R.newState('seed-j', 20000);
  s.pebbles = 1000;
  assert.equal(R.upgradeTool(s, 'pick'), false);
  R.addItem(s, 'copper_ore', 5);
  assert.ok(R.upgradeTool(s, 'pick'));
  assert.equal(s.tools.pick, 1);
  assert.equal(s.pebbles, 850);
  assert.equal(R.countItem(s, 'copper_ore'), 0);
});

test('the shop sells this season\'s seeds and buying costs pebbles', () => {
  const s = R.newState('seed-k', 20000);
  const stock = R.shopStock('autumn');
  assert.equal(stock.length, 4);
  assert.ok(stock.every(i => ITEMS[i.id].season === 'autumn'));
  s.pebbles = 20;
  assert.ok(R.buy(s, 'carrot_seed', 15));
  assert.equal(s.pebbles, 5);
  assert.equal(R.buy(s, 'carrot_seed', 15), false);
});

test('tree fruit and forage can be picked once a day', () => {
  const s = R.newState('seed-l', 20000);
  R.rollover(s, 20000);
  assert.equal(R.shakeTree(s, 20000).n, 2);
  assert.equal(R.shakeTree(s, 20000), null);
  const id = R.pickForage(s, 0);
  assert.equal(ITEMS[id].cat, 'forage');
  assert.equal(R.pickForage(s, 0), null);
});

test('every spot in the jar can be reached from the start', () => {
  const walk = (c, r) => isWalkable(c, r);
  for (const t of forageTiles()) assert.ok(pathTo(walk, START_TILE, t), `${t.c},${t.r}`);
  for (const o of OBJECTS) {
    const p = o.walkable ? pathTo(walk, START_TILE, o) : pathNextTo(walk, START_TILE, footprintTiles(o));
    assert.ok(p, o.id);
  }
  for (const b of BEDS) assert.ok(pathNextTo(walk, START_TILE, [b]), 'bed');
});

test('old or broken saves fall back to a fresh state', () => {
  const fresh = R.migrate(null, 'x', 20000);
  assert.equal(fresh.pebbles, 150);
  const kept = R.migrate({ ...fresh, pebbles: 999, avatar: { skin: 3 } }, 'x', 20000);
  assert.equal(kept.pebbles, 999);
  assert.equal(kept.avatar.skin, 3);
  assert.equal(kept.avatar.hairStyle, 0);
});
