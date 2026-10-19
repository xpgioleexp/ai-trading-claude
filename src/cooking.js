// Cooking: recipes, which ingredients fit them, and how a dish turns out.
// Pure rules, no drawing, so they're testable and shared by both partners.
import { ITEMS } from './data.js';

// What kind of ingredient each item is. Recipes can ask for a kind ("any fish")
// or for one exact item.
export function tagsOf(id) {
  const item = ITEMS[id];
  if (!item) return [];
  if (item.cat === 'fish') return ['fish'];
  if (!['crop', 'forage'].includes(item.cat)) return [];
  if (['cherry', 'peach', 'apple', 'orange', 'melon', 'coconut'].includes(id)) return ['fruit'];
  if (id === 'honey') return ['sweet'];
  const tags = [];
  const byShape = { berry: 'berry', root: 'root', round: 'veg', leaf: 'greens', mushroom: 'mushroom', flower: 'flower', pod: 'veg', cone: 'nut', crystal: 'ice' };
  if (byShape[item.shape]) tags.push(byShape[item.shape]);
  if (id === 'acorn') tags.push('nut');
  if (id === 'feather' || id === 'maple_leaf' || id === 'clover') return [];
  return [...new Set(tags)];
}

export function isIngredient(id) {
  return tagsOf(id).length > 0;
}

// A requirement is an exact item id, or "#tag" for any item of that kind.
export const RECIPES = [
  { id: 'grilled_fish', name: 'Grilled fish', needs: ['#fish'], color: '#C9A272' },
  { id: 'flower_tea', name: 'Flower tea', needs: ['#flower'], color: '#E4B4A3' },
  { id: 'roasted_nuts', name: 'Roasted nuts', needs: ['#nut'], color: '#9C7046' },
  { id: 'pumpkin_soup', name: 'Pumpkin soup', needs: ['pumpkin'], color: '#E0873A' },
  { id: 'sunflower_snack', name: 'Sunflower seed snack', needs: ['sunflower'], color: '#E8B83A' },
  { id: 'fish_soup', name: 'Fish soup', needs: ['#fish', '#root'], color: '#D9C9A0' },
  { id: 'berry_jam', name: 'Berry jam', needs: ['#berry', '#berry'], color: '#B5324A' },
  { id: 'fruit_salad', name: 'Fruit salad', needs: ['#fruit', '#berry'], color: '#F0A27A' },
  { id: 'mushroom_skewer', name: 'Mushroom skewers', needs: ['#mushroom', '#mushroom'], color: '#B58E5E' },
  { id: 'garden_salad', name: 'Garden salad', needs: ['#greens', '#veg'], color: '#8DBA5C' },
  { id: 'tomato_soup', name: 'Tomato soup', needs: ['tomato', '#greens'], color: '#D9533C' },
  { id: 'corn_chowder', name: 'Corn chowder', needs: ['corn', '#fish'], color: '#E9CF5A' },
  { id: 'strawberry_cake', name: 'Strawberry shortcake', needs: ['strawberry', '#nut'], color: '#F2C4C8' },
  { id: 'herb_trout', name: 'Herb-baked trout', needs: ['trout', 'wild_garlic'], color: '#9C8E6E' },
  { id: 'carrot_cake', name: 'Carrot cake', needs: ['carrot', '#fruit'], color: '#E5893A' },
  { id: 'cranberry_sauce', name: 'Cranberry sauce', needs: ['cranberry', '#fruit'], color: '#8E2A40' },
  { id: 'pea_soup', name: 'Sweet pea soup', needs: ['pea', '#greens'], color: '#9DC76A' },
  { id: 'blackberry_crumble', name: 'Blackberry crumble', needs: ['blackberry', 'acorn'], color: '#4A3550' },
  { id: 'melon_sorbet', name: 'Melon sorbet', needs: ['melon', '#ice'], color: '#C7E8B0' },
  { id: 'frostberry_tart', name: 'Frostberry tart', needs: ['frostberry', '#nut'], color: '#9CC3E0' },
  { id: 'veggie_stew', name: 'Veggie stew', needs: ['#root', '#veg', '#greens'], color: '#A9825A' },
  { id: 'picnic_sandwich', name: 'Picnic sandwich', needs: ['#fish', '#greens', '#veg'], color: '#E9D7A8' },
  { id: 'stuffed_pumpkin', name: 'Stuffed pumpkin', needs: ['pumpkin', '#mushroom', '#root'], color: '#C9783A' },
  { id: 'winter_roast', name: 'Winter root roast', needs: ['winter_root', 'turnip', 'kale'], color: '#8A6844' },
  { id: 'golden_feast', name: 'Golden carp feast', needs: ['golden_carp', 'pumpkin', '#mushroom'], color: '#F0C94B' },
];

export const MYSTERY = { id: 'mystery_stew', name: 'Mystery stew', color: '#8F8579' };
export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map(r => [r.id, r]));

function fits(req, id) {
  return req.startsWith('#') ? tagsOf(id).includes(req.slice(1)) : req === id;
}

function permutations(list) {
  if (list.length <= 1) return [list];
  return list.flatMap((x, i) => permutations([...list.slice(0, i), ...list.slice(i + 1)]).map(p => [x, ...p]));
}

// The recipe these ingredients make, or null. When several fit, the one that
// names the most exact items wins (strawberry + acorn is shortcake, not just "berry + nut").
export function matchRecipe(ids) {
  let best = null;
  let bestScore = -1;
  for (const r of RECIPES) {
    if (r.needs.length !== ids.length) continue;
    if (!permutations(ids).some(p => p.every((id, i) => fits(r.needs[i], id)))) continue;
    const score = r.needs.filter(n => !n.startsWith('#')).length;
    if (score > bestScore) { best = r; bestScore = score; }
  }
  return best;
}

// A hint for a recipe you haven't found yet, without giving it away.
export function hintFor(r) {
  const words = { fish: 'a fish', root: 'a root vegetable', berry: 'berries', fruit: 'fruit', veg: 'a vegetable', greens: 'greens', mushroom: 'a mushroom', flower: 'a flower', nut: 'a nut', ice: 'something icy' };
  const parts = r.needs.map(n => (n.startsWith('#') ? words[n.slice(1)] : 'something special'));
  return `${r.needs.length} ingredient${r.needs.length > 1 ? 's' : ''}: ${parts.join(', ')}`;
}

// How it turned out: scores are 0..1 from chopping and the stove.
export function starsFor(chop, stove, together) {
  const avg = (chop + stove) / 2;
  let stars = avg >= 0.85 ? 3 : avg >= 0.55 ? 2 : 1;
  if (together) stars = Math.min(3, stars + 1);
  return stars;
}

export function dishPrice(recipe, ingredientIds) {
  const base = ingredientIds.reduce((s, id) => s + (ITEMS[id]?.price || 0), 0);
  return recipe ? Math.max(10, Math.round(base * 1.6)) : 5;
}

// Dishes are bag items too, so they can be sold, gifted and logged.
for (const r of [...RECIPES, MYSTERY]) {
  const ingredients = r.needs ? r.needs.map(n => (n.startsWith('#') ? null : n)).filter(Boolean) : [];
  const guess = r.needs ? r.needs.length * 30 + ingredients.reduce((s, id) => s + (ITEMS[id]?.price || 0), 0) : 5;
  ITEMS[r.id] = { id: r.id, name: r.name, cat: 'dish', shape: 'dish', color: r.color, price: r === MYSTERY ? 5 : Math.round(guess) };
}

// Chopping: a marker sweeps back and forth; chops land when it's in the zone.
export const CHOP = { seconds: 10, perIngredient: 5, zone: [0.38, 0.62] };
// Stove: keep the heat in the band by fanning the fire.
export const STOVE = { seconds: 10, band: [0.55, 0.8] };

export function chopTarget(n) {
  return CHOP.perIngredient * n;
}
