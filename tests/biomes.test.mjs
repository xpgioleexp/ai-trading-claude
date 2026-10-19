import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/mine-data.js';
import '../src/crafting.js';
import '../src/events.js';
import '../src/cooking.js';
import * as R from '../src/rules.js';
import { ITEMS } from '../src/data.js';
import { MAPS, MAP_ORDER, mapWalkable, mapDaily, digSpots, mapCatch } from '../src/maps.js';
import { pathTo, pathNextTo } from '../src/path.js';
import {
  CRITTERS, SHOPS, crittersIn, befriend, dailyGift, keepsake, heartsOf, pointsFor, useSpot, dig, usePotion, buyFromJarShop, CONSTELLATIONS,
} from '../src/biomes.js';
import { FURNITURE_BY_TYPE } from '../src/home.js';

const fresh = (day = 20000) => { const s = R.newState('seed', day); R.rollover(s, day); s.pebbles = 9999; return s; };

test('eight jars, each with two animals, one shop and two special spots', () => {
  assert.equal(MAP_ORDER.length, 8);
  for (const id of MAP_ORDER) {
    const m = MAPS[id];
    assert.equal(crittersIn(id).length, 2, id);
    assert.ok(SHOPS[id], id);
    assert.equal(m.objects.filter(o => o.kind === 'shop').length, 1, id);
    assert.equal(m.objects.filter(o => o.kind === 'spot').length + (m.digs ? 1 : 0), 2, id);
    assert.ok(mapCatch(Math.random, id, 12).id);
  }
  assert.equal(CRITTERS.filter(c => c.jar !== 'forest').length, 16);
  assert.ok(CRITTERS.filter(c => c.jar === 'forest').length >= 14);
});

test('every spot, shop, tree and pond in every jar can be reached from the door', () => {
  for (const id of MAP_ORDER) {
    const m = MAPS[id];
    const walk = (c, r) => mapWalkable(m, c, r);
    const door = m.objects.find(o => o.id === 'door');
    const start = { c: door.c + 1, r: door.r };
    assert.ok(m.west && m.cols, `${id} is wide`);
    for (const o of m.objects) {
      const tiles = [];
      for (let c = o.c; c < o.c + o.w; c++) for (let r = o.r; r < o.r + o.h; r++) tiles.push({ c, r });
      const ok = o.walkable ? tiles.some(t => pathTo(walk, start, t)) : pathNextTo(walk, start, tiles);
      assert.ok(ok, `${id} ${o.id}`);
    }
  }
});

test('everything the shops sell and the animals like or give is a real item', () => {
  for (const [jar, s] of Object.entries(SHOPS)) {
    for (const [id, price] of s.stock) assert.ok(ITEMS[id] && price > 0, `${jar} ${id}`);
    assert.ok(s.stock.some(([id]) => FURNITURE_BY_TYPE[ITEMS[id].furniture]), `${jar} sells one piece of furniture`);
  }
  for (const c of CRITTERS) {
    for (const id of [...c.likes, ...c.gifts]) assert.ok(ITEMS[id], `${c.id} ${id}`);
    assert.ok(FURNITURE_BY_TYPE['plush_' + c.id]);
  }
  const s = fresh();
  assert.ok(buyFromJarShop(s, 'glade', 1).ok);
  assert.equal(R.countItem(s, 'healing_tonic'), 1);
});

test('friendship: once a day each, treats they love count most, together counts more', () => {
  const s = fresh();
  const pinch = CRITTERS.find(c => c.id === 'pinch');
  assert.equal(befriend(s, pinch, 'pet').points, 3);
  assert.equal(befriend(s, pinch, 'pet').ok, false);
  assert.equal(befriend(s, pinch, 'play', { together: true }).points, 6);
  R.addItem(s, 'sardine', 1);
  const t = befriend(s, pinch, 'treat', { itemId: 'sardine' });
  assert.ok(t.liked && t.points === 8);
  assert.equal(befriend(s, pinch, 'treat', { itemId: 'sardine' }).ok, false);
  assert.equal(befriend(fresh(), pinch, 'treat', { itemId: 'stone' }).ok, false);
  const docs = { 'pinch--a': { points: 20 }, 'pinch--b': { points: 15 }, 'sky--a': { points: 99 } };
  assert.equal(pointsFor(docs, 'pinch'), 35);
  assert.equal(heartsOf(35), 3);
  assert.ok(dailyGift(s, pinch, 3, 20000));
  assert.equal(dailyGift(s, pinch, 3, 20000), null, 'once a day');
  assert.equal(keepsake(s, pinch, 4), null);
  assert.equal(keepsake(s, pinch, 5), 'made_plush_pinch');
  assert.equal(keepsake(s, pinch, 5), null, 'once');
});

test('spots: sandcastles in three steps, a letter a day, constellations, wishes, steam and bouquets', () => {
  const s = fresh();
  const spot = id => Object.values(MAPS).flatMap(m => m.objects).find(o => o.spot === id);
  const ctx = { day: 20000, hour: 12 };
  assert.equal(useSpot(s, spot('sandcastle'), ctx).stage, 1);
  useSpot(s, spot('sandcastle'), ctx);
  const done = useSpot(s, spot('sandcastle'), { ...ctx, together: true });
  assert.ok(done.stage === 3 && done.pebbles === 40 && done.moment);
  assert.equal(useSpot(s, spot('sandcastle'), ctx).ok, false);
  assert.ok(useSpot(s, spot('bottle'), ctx).letter);
  assert.equal(useSpot(s, spot('bottle'), ctx).ok, false);
  const star = useSpot(s, spot('telescope'), ctx);
  assert.ok(star.constellation && s.constellations.length === 1);
  assert.equal(useSpot(s, spot('telescope'), ctx).ok, false);
  assert.ok(useSpot(s, spot('fairy_ring'), ctx).ok);
  assert.equal(useSpot(s, spot('fairy_ring'), ctx).ok, false);
  assert.equal(useSpot(s, spot('steamer'), ctx).ok, false, 'needs an egg');
  R.addItem(s, 'egg', 1);
  assert.ok(useSpot(s, spot('steamer'), ctx).ok);
  assert.equal(R.countItem(s, 'onsen_egg'), 1);
  assert.equal(useSpot(s, spot('bouquet'), ctx).ok, false);
  R.addItem(s, 'rose', 2);
  R.addItem(s, 'lily', 1);
  assert.ok(useSpot(s, spot('bouquet'), ctx).ok);
  assert.equal(R.countItem(s, 'gift_bouquet'), 1);
  assert.ok(useSpot(s, spot('hot_spring'), ctx).heal);
  assert.equal(useSpot(s, spot('sunset'), ctx).pebbles, 0, 'not sunset yet');
  assert.ok(useSpot(s, spot('sunset'), { day: 20000, hour: 18 }).pebbles > 0);
  assert.equal(CONSTELLATIONS.length, 12);
});

test('desert digging: the same marks for both of you, each dug once', () => {
  const s = fresh();
  assert.deepEqual(digSpots('seed', 20000, 'desert'), digSpots('seed', 20000, 'desert'));
  const d = mapDaily(s, 'desert', 20000, 'seed', 10);
  assert.equal(d.digs.length, 3);
  assert.ok(dig(s, d, 0, () => 0.1));
  assert.equal(dig(s, d, 0), null);
  for (const t of d.digs) assert.ok(mapWalkable(MAPS.desert, t.c, t.r));
});

test('tonics: luck adds bites, the garden tonic waters beds', () => {
  const s = fresh();
  R.addItem(s, 'lucky_brew', 1);
  R.addItem(s, 'garden_tonic', 1);
  R.addItem(s, 'radish_seed', 1);
  R.plantBed(s, 0, 'radish_seed');
  const bites = s.daily.bites;
  assert.equal(usePotion(s, 'lucky_brew', 20000), 'luck');
  assert.equal(s.daily.bites, bites + 5);
  usePotion(s, 'garden_tonic', 20000);
  assert.equal(s.garden[0].last, 20000);
  assert.equal(R.countItem(s, 'lucky_brew'), 0);
});
