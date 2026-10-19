import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { ITEMS } from '../src/data.js';
import { CRAFTS, CATEGORIES, planCraft, craft, producedItem, alreadyUnlocked } from '../src/crafting.js';
import { FURNITURE_BY_TYPE } from '../src/home.js';
import { readFileSync } from 'node:fs';

const extra = JSON.parse(readFileSync(new URL('../content/extras.json', import.meta.url)));
const decorTypes = new Set([...extra.decorations.map(d => d.type), 'lantern', 'fireflyjar', 'fairylights']);

function fresh() {
  const s = R.newState('c', 20000);
  s.bag = [];
  return s;
}

test('crafting covers furniture, lamps, toys, outfits and gifts', () => {
  for (const c of ['Furniture', 'Lamps', 'Toys', 'Outfits', 'Gifts']) assert.ok(CATEGORIES.includes(c), c);
  for (const c of CRAFTS) {
    for (const need of Object.keys(c.needs)) assert.ok(need.startsWith('#') || ITEMS[need], `${c.id} needs ${need}`);
    const out = producedItem(c);
    if (out) assert.ok(ITEMS[out], `${c.id} makes ${out}`);
    if (c.makes.furniture) assert.ok(FURNITURE_BY_TYPE[c.makes.furniture], c.id);
    if (c.makes.decor) assert.ok(decorTypes.has(c.makes.decor), c.id);
  }
});

test('crafting uses up the materials and puts the thing in the bag', () => {
  const s = fresh();
  R.addItem(s, 'wood', 10);
  R.addItem(s, 'stone', 2);
  const table = CRAFTS.find(c => c.id === 'craft_table');
  assert.ok(craft(s, table).ok);
  assert.equal(R.countItem(s, 'wood'), 2);
  assert.equal(R.countItem(s, 'stone'), 0);
  assert.equal(R.countItem(s, 'made_table'), 1);
  assert.equal(ITEMS.made_table.furniture, 'table');
  const again = craft(s, table);
  assert.equal(again.ok, false);
  assert.equal(R.countItem(s, 'wood'), 2, 'nothing used when it fails');
});

test('cloth is made from fiber and goes into bigger things', () => {
  const s = fresh();
  R.addItem(s, 'fiber', 12);
  R.addItem(s, 'wood', 12);
  const cloth = CRAFTS.find(c => c.id === 'cloth');
  for (let i = 0; i < 4; i++) assert.ok(craft(s, cloth).ok);
  assert.equal(R.countItem(s, 'cloth'), 4);
  assert.ok(craft(s, CRAFTS.find(c => c.id === 'craft_double_bed')).ok);
  assert.equal(R.countItem(s, 'made_double_bed'), 1);
});

test('"any flower" and "any gem" accept any of that kind', () => {
  const s = fresh();
  R.addItem(s, 'daisy', 2);
  R.addItem(s, 'tulip', 1);
  R.addItem(s, 'sunflower', 1);
  const bouquet = CRAFTS.find(c => c.id === 'gift_bouquet');
  assert.ok(planCraft(s, bouquet));
  assert.ok(craft(s, bouquet).ok);
  assert.equal(R.countItem(s, 'gift_bouquet'), 1);
  R.addItem(s, 'gold_ore', 2);
  R.addItem(s, 'emerald', 1);
  assert.ok(craft(s, CRAFTS.find(c => c.id === 'gift_ring')).ok);
});

test('outfits unlock once and are not bag items', () => {
  const s = fresh();
  R.addItem(s, 'cloth', 10);
  const beanie = CRAFTS.find(c => c.id === 'hat_beanie');
  assert.ok(craft(s, beanie).ok);
  assert.ok(alreadyUnlocked(s, beanie));
  assert.equal(s.unlocked.hat3, true);
  assert.equal(craft(s, beanie).ok, false);
  assert.ok(craft(s, CRAFTS.find(c => c.id === 'outfit_sweater')).ok);
  assert.equal(s.unlocked.style3, true);
  assert.equal(R.countItem(s, 'cloth'), 2, '10 - 3 for the beanie - 5 for the sweater');
});
