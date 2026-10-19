import test from 'node:test';
import assert from 'node:assert/strict';
import { newState, rollover, addItem, countItem } from '../src/rules.js';
import { ITEMS } from '../src/data.js';
import { FURNITURE_BY_TYPE } from '../src/home.js';
import { isWalkable } from '../src/world.js';
import {
  merchantDays, merchantHere, merchantStock, buyFromMerchant, sellToMerchant, furnitureStock, buyFurniture,
  VISITORS, VISITOR_SPOTS, MERCHANT_SPOT, visitorOn, requestFor, deliver, heartsFor, giftDue, takeGift, GIFT_AT,
} from '../src/visitors.js';

const fresh = (day = 100) => { const s = newState('seed', day); rollover(s, day); s.pebbles = 5000; return s; };

test('the merchant comes two days a week', () => {
  for (let week = 0; week < 10; week++) {
    const monday = week * 7 - 3;
    const here = [0, 1, 2, 3, 4, 5, 6].filter(d => merchantHere('seed', monday + d));
    assert.equal(here.length, 2);
    assert.deepEqual(merchantDays('seed', monday), merchantDays('seed', monday + 6));
  }
});

test('merchant stock is the same for both of you, one each', () => {
  const a = merchantStock('seed', 50), b = merchantStock('seed', 50);
  assert.deepEqual(a, b);
  assert.equal(a.items.length, 5);
  for (const e of a.items) assert.ok(ITEMS[e.id], e.id);
  assert.ok(a.items.some(e => FURNITURE_BY_TYPE[ITEMS[e.id].furniture]?.merchant));
  const s = fresh();
  assert.ok(buyFromMerchant(s, a.items[0]).ok);
  assert.equal(buyFromMerchant(s, a.items[0]).ok, false);
  addItem(s, a.wants, 3);
  const before = s.pebbles;
  assert.equal(sellToMerchant(s, a.wants), ITEMS[a.wants].price * 6);
  assert.equal(s.pebbles, before + ITEMS[a.wants].price * 6);
  assert.equal(countItem(s, a.wants), 0);
});

test('furniture stock rotates daily and goes into the bag', () => {
  const days = new Set();
  for (let d = 0; d < 10; d++) days.add(furnitureStock('seed', d).map(e => e.type).join());
  assert.ok(days.size > 5);
  const stock = furnitureStock('seed', 3);
  assert.equal(stock.filter(e => e.special).length, 2);
  assert.ok(stock.every(e => !FURNITURE_BY_TYPE[e.type].merchant));
  const s = fresh();
  assert.ok(buyFurniture(s, stock[0]).ok);
  assert.equal(countItem(s, 'made_' + stock[0].type), 1);
  assert.equal(buyFurniture(s, stock[0]).ok, false);
});

test('a different visitor each day of the week, with a request you can fill', () => {
  for (let week = 0; week < 5; week++) {
    const monday = week * 7 - 3;
    const ids = [0, 1, 2, 3, 4, 5, 6].map(d => visitorOn('seed', monday + d).id);
    assert.equal(new Set(ids).size, 7);
  }
  for (let day = 0; day < 60; day++) {
    const v = visitorOn('seed', day);
    const r = requestFor('seed', day, v);
    assert.ok(ITEMS[r.item], `${v.id} ${r.item}`);
    assert.ok(r.n >= 1 && r.reward >= 30);
  }
});

test('visitor and merchant spots are on open ground', () => {
  for (const t of [...VISITOR_SPOTS, MERCHANT_SPOT, { c: MERCHANT_SPOT.c + 1, r: MERCHANT_SPOT.r }]) assert.ok(isWalkable(t.c, t.r), `${t.c},${t.r}`);
});

test('deliveries pay, build friendship and earn a gift once', () => {
  const s = fresh();
  const v = VISITORS[0];
  const r = { item: 'wood', n: 2, reward: 40 };
  assert.equal(deliver(s, r), false);
  addItem(s, 'wood', 2);
  const before = s.pebbles;
  assert.ok(deliver(s, r));
  assert.equal(s.pebbles, before + 40);
  const deliveries = {};
  for (let i = 0; i < GIFT_AT; i++) deliveries[i] = { visitor: v.id };
  deliveries.x = { visitor: 'someone-else' };
  assert.equal(heartsFor(deliveries, v.id), GIFT_AT);
  assert.ok(giftDue(s, deliveries, v));
  assert.equal(takeGift(s, v), 'made_' + v.gift);
  assert.equal(giftDue(s, deliveries, v), false);
});
