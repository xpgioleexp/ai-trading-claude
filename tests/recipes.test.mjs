import test from 'node:test';
import assert from 'node:assert/strict';
import '../src/maps.js';
import '../src/mine-data.js';
import { ITEMS } from '../src/data.js';
import { RECIPES, TOOLS, STEPS, matchRecipe, otherToolFor, tagsOf, hintFor } from '../src/cooking.js';

test('over 140 recipes across 8 tools, each made of real ingredients', () => {
  assert.ok(RECIPES.length >= 140);
  assert.equal(TOOLS.length, 8);
  for (const t of TOOLS) {
    assert.ok(RECIPES.filter(r => r.tool === t.id).length >= 9, t.id);
    for (const st of t.steps) assert.ok(STEPS[st], st);
  }
  const all = Object.keys(ITEMS);
  for (const r of RECIPES) {
    assert.ok(ITEMS[r.id], r.id);
    for (const n of r.needs) {
      if (n.startsWith('#')) assert.ok(all.some(id => tagsOf(id).includes(n.slice(1))), `${r.id} ${n}`);
      else assert.ok(ITEMS[n], `${r.id} ${n}`);
    }
    assert.ok(hintFor(r).length > 0);
  }
});

test('the same ingredients make different things with different tools', () => {
  assert.equal(matchRecipe(['flour', 'egg', 'milk'], 'pan').id, 'pancakes');
  assert.equal(matchRecipe(['tomato', 'basil', 'cheese'], 'board').id, 'caprese');
  assert.equal(matchRecipe(['flour', 'tomato', 'cheese'], 'oven').id, 'pizza');
  assert.equal(matchRecipe(['flour', 'tomato', 'cheese'], 'pot'), null);
  assert.equal(otherToolFor(['flour', 'tomato', 'cheese'], 'pot').id, 'oven');
  assert.equal(matchRecipe(['mango', 'milk'], 'blender').id, 'mango_lassi');
  assert.equal(matchRecipe(['vanilla', 'milk', 'sugar'], 'churn').id, 'vanilla_ice_cream');
  assert.equal(matchRecipe(['tea_leaf', 'milk', 'honey'], 'kettle').id, 'milk_tea');
});

test('no two recipes on the same tool need exactly the same things', () => {
  const seen = new Set();
  for (const r of RECIPES) {
    const k = r.tool + '|' + [...r.needs].sort().join(',');
    assert.ok(!seen.has(k), r.id);
    seen.add(k);
  }
});
