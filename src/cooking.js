// Cooking: recipes, which ingredients fit them, and how a dish turns out.
// Pure rules, no drawing, so they're testable and shared by both partners.
import { ITEMS } from './data.js';
import './farm-data.js'; // registers the new crops, produce and pantry items

// What kind of ingredient each item is. Recipes can ask for a kind ("any fish")
// or for one exact item.
export function tagsOf(id) {
  const item = ITEMS[id];
  if (!item) return [];
  if (item.cat === 'fish') return ['fish'];
  if (!['crop', 'forage', 'produce', 'pantry'].includes(item.cat)) return [];
  if (item.tags) return item.tags;
  if (['cherry', 'peach', 'apple', 'orange', 'melon', 'coconut'].includes(id)) return ['fruit'];
  if (id === 'honey') return ['sweet'];
  if (id === 'wild_garlic') return ['herb', 'root'];
  if (id === 'chamomile') return ['flower', 'herb'];
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

// Kitchen tools. Each cooks in two steps: one of you can do each step together.
// The cutting board and the pot come with the kitchen; the rest are bought once, for both of you.
export const TOOLS = [
  { id: 'board', name: 'Cutting board', price: 0, steps: ['chop', 'toss'] },
  { id: 'pot', name: 'Cooking pot', price: 0, steps: ['chop', 'simmer'] },
  { id: 'pan', name: 'Frying pan', price: 150, steps: ['chop', 'flip'] },
  { id: 'grill', name: 'Grill', price: 220, steps: ['chop', 'turn'] },
  { id: 'oven', name: 'Oven', price: 400, steps: ['mix', 'bake'] },
  { id: 'kettle', name: 'Tea kettle', price: 120, steps: ['steep', 'pour'] },
  { id: 'blender', name: 'Blender', price: 300, steps: ['chop', 'blend'] },
  { id: 'churn', name: 'Ice cream maker', price: 350, steps: ['churn', 'chill'] },
];
export const TOOL_BY_ID = Object.fromEntries(TOOLS.map(t => [t.id, t]));

// game: which minigame each step plays (chop, stove, whisk, timing).
export const STEPS = {
  chop: { game: 'chop', title: 'Chop!', button: 'Chop', text: 'Tap Chop when the knife is over the green.' },
  toss: { game: 'whisk', title: 'Toss it together', button: 'Toss', text: 'Tap as fast as you can to toss everything.' },
  simmer: { game: 'stove', title: 'Mind the stove', button: 'Fan the fire', text: 'Hold to keep the heat in the green.' },
  flip: { game: 'timing', count: 3, title: 'Flip it', button: 'Flip', text: 'Tap Flip when it turns golden (the green).' },
  turn: { game: 'timing', count: 3, title: 'Turn it on the grill', button: 'Turn', text: 'Tap Turn when it\'s nicely charred (the green).' },
  mix: { game: 'whisk', title: 'Mix the batter', button: 'Mix', text: 'Tap as fast as you can to mix it smooth.' },
  bake: { game: 'timing', count: 1, slow: true, title: 'Bake', button: 'Take it out', text: 'Take it out when it\'s in the green, not before.' },
  steep: { game: 'stove', title: 'Steep', button: 'Warm the kettle', text: 'Hold to keep the water just right.' },
  pour: { game: 'timing', count: 1, title: 'Pour', button: 'Stop pouring', text: 'Stop when the cup is full (the green).' },
  blend: { game: 'whisk', title: 'Blend', button: 'Blend', text: 'Tap as fast as you can to blend it smooth.' },
  churn: { game: 'whisk', title: 'Churn', button: 'Churn', text: 'Tap as fast as you can to churn it.' },
  chill: { game: 'stove', title: 'Keep it cold', button: 'Add ice', text: 'Hold to keep it cold, but not frozen solid.' },
};

// A requirement is an exact item id, or "#tag" for any item of that kind.
// [id, name, tool, needs, colour]
const R = [
  // cutting board
  ['fruit_salad', 'Fruit salad', 'board', ['#fruit', '#berry'], '#F0A27A'],
  ['garden_salad', 'Garden salad', 'board', ['#greens', '#veg'], '#8DBA5C'],
  ['picnic_sandwich', 'Picnic sandwich', 'board', ['#fish', '#greens', '#veg'], '#E9D7A8'],
  ['caprese', 'Caprese salad', 'board', ['tomato', 'basil', 'cheese'], '#D9533C'],
  ['cucumber_salad', 'Cucumber salad', 'board', ['cucumber', '#herb'], '#9DC76A'],
  ['coleslaw', 'Coleslaw', 'board', ['cabbage', 'carrot'], '#D9E0B0'],
  ['sushi', 'Sushi rolls', 'board', ['#fish', 'rice'], '#F2EDE4'],
  ['poke_bowl', 'Poke bowl', 'board', ['#fish', 'rice', '#veg'], '#E07A7A'],
  ['spring_rolls', 'Fresh spring rolls', 'board', ['lettuce', 'carrot', '#herb'], '#C9E0A0'],
  ['fruit_platter', 'Fruit platter', 'board', ['#fruit', '#fruit', '#fruit'], '#F0C46A'],
  ['cheese_board', 'Cheese board', 'board', ['cheese', 'grape', '#nut'], '#F0C94B'],
  ['salsa', 'Fresh salsa', 'board', ['tomato', 'onion', 'chili'], '#D9332C'],
  ['spinach_salad', 'Spinach and berry salad', 'board', ['spinach', '#nut', '#berry'], '#4F8A4A'],
  ['lettuce_wraps', 'Lettuce wraps', 'board', ['lettuce', '#fish', '#spice'], '#9DC76A'],
  ['flower_salad', 'Flower petal salad', 'board', ['#flower', '#greens'], '#E4B4A3'],
  // pot
  ['pumpkin_soup', 'Pumpkin soup', 'pot', ['pumpkin'], '#E0873A'],
  ['fish_soup', 'Fish soup', 'pot', ['#fish', '#root'], '#D9C9A0'],
  ['berry_jam', 'Berry jam', 'pot', ['#berry', '#berry'], '#B5324A'],
  ['tomato_soup', 'Tomato soup', 'pot', ['tomato', '#greens'], '#D9533C'],
  ['corn_chowder', 'Corn chowder', 'pot', ['corn', '#fish'], '#E9CF5A'],
  ['cranberry_sauce', 'Cranberry sauce', 'pot', ['cranberry', '#sweet'], '#8E2A40'],
  ['pea_soup', 'Sweet pea soup', 'pot', ['pea', '#greens'], '#9DC76A'],
  ['veggie_stew', 'Veggie stew', 'pot', ['#root', '#veg', '#greens'], '#A9825A'],
  ['potato_soup', 'Potato leek soup', 'pot', ['potato', 'leek'], '#E9DFC0'],
  ['minestrone', 'Minestrone', 'pot', ['green_bean', 'tomato', 'onion'], '#C9683A'],
  ['bean_chili', 'Bean chili', 'pot', ['soybean', 'chili', 'tomato'], '#9A3A2A'],
  ['curry', 'Vegetable curry', 'pot', ['chili', 'rice', '#veg'], '#E0A04A'],
  ['ramen', 'Ramen', 'pot', ['flour', 'egg', 'shiitake'], '#E9C98A'],
  ['rice_porridge', 'Ginger rice porridge', 'pot', ['rice', 'ginger'], '#F2EDE4'],
  ['miso_soup', 'Miso soup', 'pot', ['soybean', '#greens'], '#C9A272'],
  ['borscht', 'Borscht', 'pot', ['beet', 'cabbage'], '#8A2A4A'],
  ['onion_soup', 'French onion soup', 'pot', ['onion', 'cheese'], '#C9944A'],
  ['risotto', 'Mushroom risotto', 'pot', ['rice', '#mushroom', 'cheese'], '#D9C9A0'],
  ['fish_stew', 'Fisherman\'s stew', 'pot', ['#fish', 'potato', 'onion'], '#C9A272'],
  ['mac_cheese', 'Mac and cheese', 'pot', ['flour', 'cheese', 'milk'], '#F0C94B'],
  ['dumplings', 'Dumplings', 'pot', ['flour', 'cabbage', '#mushroom'], '#F2EDE4'],
  ['pumpkin_curry', 'Pumpkin curry', 'pot', ['pumpkin', 'chili', 'rice'], '#E0873A'],
  ['marmalade', 'Lemon marmalade', 'pot', ['lemon', '#sweet'], '#F0DA4A'],
  ['plum_jam', 'Plum jam', 'pot', ['plum', '#sweet'], '#7A3A6A'],
  ['grape_jelly', 'Grape jelly', 'pot', ['grape', '#sweet'], '#7A4A8A'],
  ['parsnip_soup', 'Creamy parsnip soup', 'pot', ['parsnip', '#dairy'], '#E9DFC0'],
  ['sweet_potato_stew', 'Sweet potato stew', 'pot', ['sweet_potato', 'ginger', '#greens'], '#C9683A'],
  ['oatmeal', 'Oatmeal', 'pot', ['oats', 'milk'], '#D9C9A0'],
  ['berry_oatmeal', 'Berry oatmeal', 'pot', ['oats', 'milk', '#berry'], '#B5728A'],
  ['squash_soup', 'Butternut soup', 'pot', ['squash', '#dairy'], '#E0A04A'],
  ['cave_chowder', 'Cave chowder', 'pot', ['#fish', 'cave_mushroom'], '#9A8A70'],
  // frying pan
  ['roasted_nuts', 'Roasted nuts', 'pan', ['#nut'], '#9C7046'],
  ['sunflower_snack', 'Sunflower seed snack', 'pan', ['sunflower'], '#E8B83A'],
  ['fried_egg', 'Fried egg', 'pan', ['egg'], '#F2DA7A'],
  ['omelette', 'Cheese omelette', 'pan', ['egg', 'cheese'], '#F0C94B'],
  ['veggie_omelette', 'Veggie omelette', 'pan', ['egg', 'cheese', '#veg'], '#E0C46A'],
  ['pancakes', 'Pancakes', 'pan', ['flour', 'egg', 'milk'], '#E9C98A'],
  ['fried_rice', 'Fried rice', 'pan', ['rice', 'egg', '#veg'], '#E0C46A'],
  ['stir_fry', 'Stir-fry', 'pan', ['#veg', '#greens', 'oil'], '#8DBA5C'],
  ['hash_browns', 'Hash browns', 'pan', ['potato', 'oil'], '#D9A55A'],
  ['crepes', 'Berry crepes', 'pan', ['flour', 'egg', '#berry'], '#E8A0B0'],
  ['buttered_mushrooms', 'Buttered mushrooms', 'pan', ['#mushroom', 'butter'], '#B58E5E'],
  ['fish_tacos', 'Fish tacos', 'pan', ['#fish', 'flour', 'chili'], '#E0C46A'],
  ['garlic_greens', 'Garlicky greens', 'pan', ['garlic', '#greens'], '#4F8A4A'],
  ['tempura', 'Tempura', 'pan', ['#fish', 'flour', 'oil'], '#E9C98A'],
  ['fritters', 'Veggie fritters', 'pan', ['#veg', 'flour', 'egg'], '#C9A272'],
  ['glazed_carrots', 'Honey-glazed carrots', 'pan', ['carrot', '#sweet'], '#E5893A'],
  ['fried_plantain', 'Fried banana', 'pan', ['banana', 'butter'], '#E8B83A'],
  ['brussels_crisp', 'Crispy sprouts', 'pan', ['brussels', 'oil'], '#6F9A4A'],
  // grill
  ['grilled_fish', 'Grilled fish', 'grill', ['#fish'], '#C9A272'],
  ['mushroom_skewer', 'Mushroom skewers', 'grill', ['#mushroom', '#mushroom'], '#B58E5E'],
  ['grilled_corn', 'Buttery grilled corn', 'grill', ['corn', 'butter'], '#E9CF5A'],
  ['kebabs', 'Veggie kebabs', 'grill', ['bell_pepper', 'onion', '#mushroom'], '#E8C25A'],
  ['grilled_eggplant', 'Grilled eggplant', 'grill', ['eggplant', 'oil'], '#5E3A6A'],
  ['grilled_peach', 'Grilled peaches', 'grill', ['peach', '#sweet'], '#F0A27A'],
  ['baked_potato', 'Campfire potato', 'grill', ['potato'], '#C9A272'],
  ['grilled_veg', 'Grilled vegetables', 'grill', ['bell_pepper', 'eggplant', 'onion'], '#9A6A3A'],
  ['shrimp_skewer', 'Shrimp skewers', 'grill', ['ghost_shrimp', 'lemon'], '#E9A08A'],
  ['grilled_pineapple', 'Grilled pineapple', 'grill', ['pineapple', '#sweet'], '#E8B83A'],
  ['lemon_fish', 'Lemon grilled fish', 'grill', ['#fish', 'lemon'], '#F0DA4A'],
  ['grilled_sweet_potato', 'Charred sweet potato', 'grill', ['sweet_potato', 'butter'], '#C9683A'],
  ['grilled_squid', 'Grilled octopus', 'grill', ['octopus', 'lemon'], '#C96A6A'],
  // oven
  ['strawberry_cake', 'Strawberry shortcake', 'oven', ['strawberry', 'flour', '#dairy'], '#F2C4C8'],
  ['herb_trout', 'Herb-baked trout', 'oven', ['trout', 'wild_garlic'], '#9C8E6E'],
  ['carrot_cake', 'Carrot cake', 'oven', ['carrot', 'flour', '#sweet'], '#E5893A'],
  ['blackberry_crumble', 'Blackberry crumble', 'oven', ['blackberry', 'acorn'], '#4A3550'],
  ['frostberry_tart', 'Frostberry tart', 'oven', ['frostberry', '#nut'], '#9CC3E0'],
  ['stuffed_pumpkin', 'Stuffed pumpkin', 'oven', ['pumpkin', '#mushroom', '#root'], '#C9783A'],
  ['winter_roast', 'Winter root roast', 'oven', ['winter_root', 'turnip', 'kale'], '#8A6844'],
  ['golden_feast', 'Golden carp feast', 'oven', ['golden_carp', 'pumpkin', '#mushroom'], '#F0C94B'],
  ['bread', 'Fresh bread', 'oven', ['flour'], '#D9A55A'],
  ['wheat_bread', 'Farmhouse loaf', 'oven', ['wheat', 'wheat'], '#C9944A'],
  ['apple_pie', 'Apple pie', 'oven', ['apple', 'flour', 'butter'], '#D9A55A'],
  ['pizza', 'Pizza', 'oven', ['flour', 'tomato', 'cheese'], '#E0703A'],
  ['banana_bread', 'Banana bread', 'oven', ['banana', 'flour', 'egg'], '#9C7046'],
  ['quiche', 'Spinach quiche', 'oven', ['egg', 'cheese', 'spinach'], '#E0C46A'],
  ['lasagna', 'Eggplant lasagna', 'oven', ['flour', 'eggplant', 'cheese'], '#C9583A'],
  ['roast_potatoes', 'Herb roast potatoes', 'oven', ['potato', '#herb'], '#D9A55A'],
  ['baked_fish', 'Lemon-baked fish', 'oven', ['#fish', 'lemon', '#herb'], '#F0DA4A'],
  ['cookies', 'Butter cookies', 'oven', ['flour', 'butter', '#sweet'], '#E9C98A'],
  ['chocolate_cake', 'Chocolate cake', 'oven', ['cocoa', 'flour', 'egg'], '#5A3A2A'],
  ['pumpkin_pie', 'Pumpkin pie', 'oven', ['pumpkin', 'flour', '#sweet'], '#E0873A'],
  ['mango_tart', 'Mango tart', 'oven', ['mango', 'flour', '#sweet'], '#F0A040'],
  ['muffins', 'Blueberry muffins', 'oven', ['flour', 'blueberry', 'egg'], '#6F7FC0'],
  ['cornbread', 'Cornbread', 'oven', ['corn', 'flour', 'milk'], '#E9CF5A'],
  ['stuffed_peppers', 'Stuffed peppers', 'oven', ['bell_pepper', 'rice', 'cheese'], '#E8C25A'],
  ['plum_cake', 'Plum cake', 'oven', ['plum', 'flour', 'butter'], '#7A3A6A'],
  ['lemon_tart', 'Lemon tart', 'oven', ['lemon', 'flour', 'egg'], '#F0DA4A'],
  ['rhubarb_crumble', 'Rhubarb crumble', 'oven', ['rhubarb', 'flour', '#sweet'], '#C9485A'],
  ['cauliflower_cheese', 'Cauliflower cheese', 'oven', ['cauliflower', 'cheese'], '#F2EDE4'],
  ['roast_artichoke', 'Roast artichoke', 'oven', ['artichoke', 'garlic'], '#7A9A5A'],
  ['pear_tart', 'Pear tart', 'oven', ['pear', 'flour', 'butter'], '#C9C25A'],
  ['oat_cookies', 'Oat cookies', 'oven', ['oats', 'butter', '#sweet'], '#C9A272'],
  ['vanilla_cake', 'Vanilla sponge', 'oven', ['vanilla', 'flour', 'egg'], '#F2E8C8'],
  ['honey_cake', 'Honey cake', 'oven', ['honey', 'flour', 'egg'], '#E8B83A'],
  // tea kettle
  ['flower_tea', 'Flower tea', 'kettle', ['#flower'], '#E4B4A3'],
  ['green_tea', 'Green tea', 'kettle', ['tea_leaf'], '#9DC76A'],
  ['milk_tea', 'Milk tea', 'kettle', ['tea_leaf', 'milk', '#sweet'], '#D9B48A'],
  ['chamomile_tea', 'Chamomile tea', 'kettle', ['chamomile'], '#F0E2A0'],
  ['ginger_tea', 'Honey ginger tea', 'kettle', ['ginger', 'honey'], '#E8B83A'],
  ['lemon_tea', 'Lemon tea', 'kettle', ['tea_leaf', 'lemon'], '#F0DA4A'],
  ['hot_cocoa', 'Hot cocoa', 'kettle', ['cocoa', 'milk'], '#6B4430'],
  ['spiced_cider', 'Spiced cider', 'kettle', ['apple', 'ginger'], '#C9783A'],
  ['rose_tea', 'Rose tea', 'kettle', ['rose'], '#D9506E'],
  ['herbal_tea', 'Herbal tea', 'kettle', ['#herb', '#flower'], '#B9C27A'],
  ['chai', 'Chai', 'kettle', ['tea_leaf', 'milk', 'ginger'], '#C9944A'],
  // blender
  ['berry_smoothie', 'Berry smoothie', 'blender', ['#berry', 'milk'], '#C9486A'],
  ['mango_lassi', 'Mango lassi', 'blender', ['mango', 'milk'], '#F0A040'],
  ['banana_shake', 'Banana milkshake', 'blender', ['banana', 'milk', '#sweet'], '#F0DA6A'],
  ['green_smoothie', 'Green smoothie', 'blender', ['spinach', '#fruit'], '#6FAF5B'],
  ['gazpacho', 'Gazpacho', 'blender', ['tomato', 'cucumber', 'bell_pepper'], '#D9533C'],
  ['pesto', 'Pesto', 'blender', ['basil', 'garlic', '#nut'], '#4F9A4A'],
  ['bean_dip', 'Bean dip', 'blender', ['soybean', 'garlic', 'oil'], '#A9B26A'],
  ['melon_juice', 'Melon juice', 'blender', ['melon'], '#C7E8B0'],
  ['carrot_juice', 'Carrot and orange juice', 'blender', ['carrot', 'orange'], '#EE9A3A'],
  ['lemonade', 'Lemonade', 'blender', ['lemon', '#sweet'], '#F5E8A0'],
  ['tropical_smoothie', 'Tropical smoothie', 'blender', ['pineapple', 'mango', 'banana'], '#F0B84A'],
  ['coconut_shake', 'Coconut shake', 'blender', ['coconut', 'milk'], '#F2EDE4'],
  // ice cream maker
  ['melon_sorbet', 'Melon sorbet', 'churn', ['melon', '#ice'], '#C7E8B0'],
  ['vanilla_ice_cream', 'Vanilla ice cream', 'churn', ['vanilla', 'milk', '#sweet'], '#F5EED0'],
  ['chocolate_ice_cream', 'Chocolate ice cream', 'churn', ['cocoa', 'milk', '#sweet'], '#6B4430'],
  ['strawberry_ice_cream', 'Strawberry ice cream', 'churn', ['strawberry', 'milk'], '#F2A4B8'],
  ['mango_sorbet', 'Mango sorbet', 'churn', ['mango', '#ice'], '#F0A040'],
  ['honey_ice_cream', 'Honey ice cream', 'churn', ['honey', 'milk'], '#E8C25A'],
  ['snow_cone', 'Snow cone', 'churn', ['#ice', '#berry'], '#C9E0F0'],
  ['lemon_sorbet', 'Lemon sorbet', 'churn', ['lemon', '#ice', '#sweet'], '#F5E8A0'],
  ['frozen_yogurt', 'Frozen berry yogurt', 'churn', ['milk', '#berry', '#sweet'], '#E8A0C0'],
];
export const RECIPES = R.map(([id, name, tool, needs, color]) => ({ id, name, tool, needs, color }));

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
export function matchRecipe(ids, tool = null) {
  let best = null;
  let bestScore = -1;
  for (const r of RECIPES) {
    if (tool && r.tool !== tool) continue;
    if (r.needs.length !== ids.length) continue;
    if (!permutations(ids).some(p => p.every((id, i) => fits(r.needs[i], id)))) continue;
    const score = r.needs.filter(n => !n.startsWith('#')).length;
    if (score > bestScore) { best = r; bestScore = score; }
  }
  return best;
}

// These ingredients make something, but with a different tool.
export function otherToolFor(ids, tool) {
  const r = matchRecipe(ids);
  return r && r.tool !== tool ? TOOL_BY_ID[r.tool] : null;
}

// A hint for a recipe you haven't found yet, without giving it away.
const WORDS = {
  fish: 'a fish', root: 'a root vegetable', berry: 'berries', fruit: 'fruit', veg: 'a vegetable', greens: 'greens', mushroom: 'a mushroom',
  flower: 'a flower', nut: 'a nut', ice: 'something icy', grain: 'a grain', herb: 'a herb', bean: 'beans', spice: 'something spicy',
  egg: 'an egg', dairy: 'something dairy', sweet: 'something sweet', flour: 'flour', oil: 'oil', tea: 'tea leaves',
};
export function hintFor(r) {
  const parts = r.needs.map(n => (n.startsWith('#') ? WORDS[n.slice(1)] || n.slice(1) : PANTRY_HINT[n] || 'something special'));
  return `${TOOL_BY_ID[r.tool].name}: ${parts.join(', ')}`;
}
const PANTRY_HINT = { flour: 'flour', egg: 'an egg', milk: 'milk', butter: 'butter', cheese: 'cheese', oil: 'oil', sugar: 'sugar' };

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
