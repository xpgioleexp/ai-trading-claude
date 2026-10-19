import test from 'node:test';
import assert from 'node:assert/strict';
import { RECIPES, matchRecipe, tagsOf, isIngredient, starsFor, hintFor, dishPrice } from '../src/cooking.js';
import '../src/maps.js';
import '../src/mine-data.js';
import { ITEMS } from '../src/data.js';

test('fish, crops, forage and fruit are ingredients; stone and seeds are not', () => {
  assert.deepEqual(tagsOf('carp'), ['fish']);
  assert.deepEqual(tagsOf('apple'), ['fruit']);
  assert.ok(tagsOf('carrot').includes('root'));
  assert.ok(tagsOf('morel').includes('mushroom'));
  assert.equal(isIngredient('stone'), false);
  assert.equal(isIngredient('radish_seed'), false);
  assert.equal(isIngredient('tiny_boot'), false);
});

test('every recipe can be made from things in the game', () => {
  const all = Object.keys(ITEMS).filter(isIngredient);
  for (const r of RECIPES) {
    const pick = [];
    for (const need of r.needs) {
      const id = all.find(x => (!need.startsWith('#') || !pick.includes(x)) && (need.startsWith('#') ? tagsOf(x).includes(need.slice(1)) : x === need));
      assert.ok(id, `${r.id} needs ${need}`);
      pick.push(id);
    }
    assert.ok(matchRecipe(pick, r.tool), r.id);
    assert.equal(ITEMS[r.id].cat, 'dish');
  }
});

test('ingredient order does not matter and exact recipes win over general ones', () => {
  assert.equal(matchRecipe(['carrot', 'carp'], 'pot').id, 'fish_soup');
  assert.equal(matchRecipe(['carp', 'carrot'], 'pot').id, 'fish_soup');
  assert.equal(matchRecipe(['strawberry', 'flour', 'milk'], 'oven').id, 'strawberry_cake');
  assert.equal(matchRecipe(['blackberry', 'acorn'], 'oven').id, 'blackberry_crumble');
  assert.equal(matchRecipe(['raspberry', 'blackberry'], 'pot').id, 'berry_jam');
  assert.equal(matchRecipe(['tomato', 'kale'], 'pot').id, 'tomato_soup');
  assert.equal(matchRecipe(['radish', 'kale'], 'board').id, 'garden_salad');
  assert.equal(matchRecipe(['carp', 'carp', 'carp'], 'pot'), null);
  assert.equal(matchRecipe(['carp'], 'grill').id, 'grilled_fish');
  assert.equal(matchRecipe(['chamomile'], 'kettle').id, 'chamomile_tea', 'exact beats any flower');
});

test('cooking together adds a star', () => {
  assert.equal(starsFor(1, 1, false), 3);
  assert.equal(starsFor(0.6, 0.6, false), 2);
  assert.equal(starsFor(0.2, 0.3, false), 1);
  assert.equal(starsFor(0.2, 0.3, true), 2);
  assert.equal(starsFor(1, 1, true), 3);
});

test('hints describe a recipe without naming it', () => {
  const hint = hintFor(RECIPES.find(r => r.id === 'fish_soup'));
  assert.equal(hint, 'Cooking pot: a fish, a root vegetable');
  assert.ok(dishPrice(RECIPES[0], ['carp']) >= 10);
});
