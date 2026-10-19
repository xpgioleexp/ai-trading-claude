import test from 'node:test';
import assert from 'node:assert/strict';
import { ITEMS } from '../src/data.js';
import '../src/biomes.js';
import '../src/weather.js';
import '../src/events.js';
import '../src/mine-data.js';
import '../src/farm-data.js';
import { FURNITURE, FURNITURE_BY_TYPE, WALL_ITEMS, WALLPAPERS, FLOORS } from '../src/home.js';
import { FURNITURE_SETS } from '../src/furniture-data.js';
import { OUTDOOR_BY_TYPE, outdoorPrice } from '../src/outdoor-data.js';
import { CRAFTS } from '../src/crafting.js';
import { CATALOG_FURNITURE, CATALOG_WALL, CATALOG_WALLPAPERS, CATALOG_FLOORS, CATALOG_OUTDOOR, CATALOG_SETS, WALL_PATTERNS, FLOOR_PATTERNS } from '../src/catalog-data.js';

test('the big catalogue is big', () => {
  assert.ok(FURNITURE.length >= 900 && CATALOG_FURNITURE.length >= 800);
  assert.ok(WALL_ITEMS.length >= 250 && WALLPAPERS.length >= 120 && FLOORS.length >= 75);
  assert.ok(Object.keys(OUTDOOR_BY_TYPE).length >= 200 && CRAFTS.length >= 800);
  assert.ok(CATALOG_SETS.length >= 50 && CATALOG_SETS.every(s => FURNITURE_SETS.includes(s)));
});

test('every piece has a unique id, a size, a price and a shape', () => {
  const types = FURNITURE.map(f => f.type);
  assert.equal(new Set(types).size, types.length);
  for (const f of CATALOG_FURNITURE) {
    assert.ok(f.form && f.w >= 1 && f.h >= 1 && f.price > 0 && f.name && /^#[0-9A-F]{6}$/i.test(f.color), f.type);
  }
  for (const w of CATALOG_WALL) assert.ok(w.form && w.price > 0, w.type);
  for (const p of CATALOG_WALLPAPERS) assert.ok(WALL_PATTERNS.includes(p.pattern), p.id);
  for (const p of CATALOG_FLOORS) assert.ok(FLOOR_PATTERNS.includes(p.pattern), p.id);
  for (const id of CATALOG_OUTDOOR) assert.ok(OUTDOOR_BY_TYPE[id] && outdoorPrice(OUTDOOR_BY_TYPE[id]) >= 20, id);
});

test('every recipe uses real materials and makes something real', () => {
  for (const c of CRAFTS) {
    for (const need of Object.keys(c.needs)) assert.ok(need.startsWith('#') || ITEMS[need], `${c.id} needs ${need}`);
    if (c.makes.furniture) assert.ok(FURNITURE_BY_TYPE[c.makes.furniture], c.id);
    if (c.makes.decor && c.category === 'Outdoor') assert.ok(OUTDOOR_BY_TYPE[c.makes.decor], c.id);
  }
  assert.equal(new Set(CRAFTS.map(c => c.id)).size, CRAFTS.length);
});
