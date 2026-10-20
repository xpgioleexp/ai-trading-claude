import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/mine-data.js';
import '../src/events.js';
import '../src/cooking.js';
import '../src/biomes.js';
import { ITEMS } from '../src/data.js';
import { FURNITURE, FURNITURE_BY_TYPE, WALL_ITEMS, WALL_BY_TYPE, canPlace } from '../src/home.js';
import { NEW_FURNITURE, FURNITURE_SETS, NEW_WALL_TYPES } from '../src/furniture-data.js';
import { OUTDOOR_BY_TYPE, OUTDOOR_GROUPS, LIGHT_DECOR } from '../src/outdoor-data.js';
import { CRAFTS, CATEGORIES, planCraft, craft } from '../src/crafting.js';
import * as R from '../src/rules.js';

// Painter support is exercised with real canvases in test:art. Source-text case
// searches cannot validate a family painter composed from several art modules.

test('over 100 new pieces of furniture in themed sets, each placeable', () => {
  assert.ok(NEW_FURNITURE.length >= 100, `${NEW_FURNITURE.length}`);
  assert.ok(FURNITURE_SETS.length >= 14);
  const uses = new Set(['sleep', 'sit', 'wardrobe', 'calendar', 'journal', 'bag', 'cook', 'music']);
  for (const f of NEW_FURNITURE) {
    assert.equal(typeof f.form, 'string', f.type);
    assert.ok(f.price > 0 && f.w >= 1 && f.h >= 1, f.type);
    if (f.use) assert.ok(uses.has(f.use), f.type);
    assert.ok(canPlace(f.type, 3, 4, []), `${f.type} fits in a room`);
  }
  for (const set of FURNITURE_SETS)
    assert.ok(
      FURNITURE.some((f) => f.set === set),
      set,
    );
  assert.equal(new Set(FURNITURE.map((f) => f.type)).size, FURNITURE.length, 'no duplicate types');
});

test('twenty new things for the walls', () => {
  assert.equal(NEW_WALL_TYPES.length, 20);
  for (const w of WALL_ITEMS.filter((x) => x.form)) {
    assert.equal(WALL_BY_TYPE[w.type], w, w.type);
    assert.ok(w.price > 0 && typeof w.form === 'string', w.type);
  }
});

test('over 50 outdoor crafts in six groups, with real materials', () => {
  const list = Object.values(OUTDOOR_BY_TYPE);
  assert.ok(list.length >= 50, `${list.length}`);
  for (const gr of OUTDOOR_GROUPS)
    assert.ok(
      list.some((d) => d.group === gr),
      gr,
    );
  for (const d of list) {
    assert.equal(typeof d.form, 'string', d.type);
    assert.ok(ITEMS['made_' + d.type]?.decor === d.type);
  }
  assert.ok(LIGHT_DECOR.size >= 8);
  for (const c of CRAFTS.filter((c) => ['Outdoor', 'Home'].includes(c.category))) {
    for (const need of Object.keys(c.needs))
      assert.ok(need.startsWith('#') || ITEMS[need], `${c.id} needs ${need}`);
    if (c.makes.furniture) assert.ok(FURNITURE_BY_TYPE[c.makes.furniture], c.id);
  }
  assert.ok(CATEGORIES.includes('Outdoor') && CATEGORIES.includes('Home'));
  assert.ok(CRAFTS.filter((c) => c.category === 'Home').length >= 30);
});

test('crafting a lamp post and a teddy bear puts them in the bag', () => {
  const s = R.newState('seed', 20000);
  R.rollover(s, 20000);
  R.addItem(s, 'iron_ore', 2);
  R.addItem(s, 'quartz', 1);
  const lamp = CRAFTS.find((c) => c.id === 'out_lamp_post');
  assert.ok(planCraft(s, lamp));
  assert.ok(craft(s, lamp).ok);
  assert.equal(R.countItem(s, 'made_lamp_post'), 1);
  R.addItem(s, 'cloth', 4);
  R.addItem(s, 'fiber', 2);
  assert.ok(
    craft(
      s,
      CRAFTS.find((c) => c.id === 'home_teddy_bear'),
    ).ok,
  );
  assert.equal(R.countItem(s, 'made_teddy_bear'), 1);
});
