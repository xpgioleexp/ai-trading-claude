// Crafting: turn gathered materials into furniture, decorations, lamps, toys,
// outfits and gifts. Pure rules so they're testable.
import { ITEMS } from './data.js';
import { tagsOf } from './cooking.js';
import { countItem, removeItem, addItem, bagFull } from './rules.js';

// New materials: wood from the fruit tree, fiber from foraging and harvests.
ITEMS.wood = { id: 'wood', name: 'Wood', cat: 'material', shape: 'stone', color: '#B88D60', price: 4 };
ITEMS.fiber = { id: 'fiber', name: 'Plant fiber', cat: 'material', shape: 'leaf', color: '#B9C27A', price: 3 };
ITEMS.cloth = { id: 'cloth', name: 'Cloth', cat: 'material', shape: 'seed', color: '#E9D7A8', price: 14 };

export const MATERIALS_FOR_SALE = [{ id: 'wood', price: 6 }, { id: 'fiber', price: 4 }];

// Hats and the sweater are unlocked by crafting them.
export const HATS = ['None', 'Flower crown', 'Straw hat', 'Beanie', 'Bow'];
export const SWEATER_STYLE = 3;

// makes: what you get.
//   { item }           an item in your bag (gifts, toys, cloth)
//   { furniture }      a piece of home furniture, placed for free from your bag
//   { decor }          a decoration for the meadow, placed for free from your bag
//   { hat } / { outfitStyle }  a new look in the wardrobe
// needs: item ids, or "#flower" / "#gem" for any of that kind.
export const CRAFTS = [
  { id: 'cloth', name: 'Cloth', category: 'Materials', needs: { fiber: 3 }, makes: { item: 'cloth' } },

  { id: 'craft_stool', name: 'Stool', category: 'Furniture', needs: { wood: 4 }, makes: { furniture: 'stool' } },
  { id: 'craft_nightstand', name: 'Nightstand', category: 'Furniture', needs: { wood: 5 }, makes: { furniture: 'nightstand' } },
  { id: 'craft_table', name: 'Dining table', category: 'Furniture', needs: { wood: 8, stone: 2 }, makes: { furniture: 'table' } },
  { id: 'craft_bookshelf', name: 'Bookshelf', category: 'Furniture', needs: { wood: 10 }, makes: { furniture: 'bookshelf' } },
  { id: 'craft_chest', name: 'Storage chest', category: 'Furniture', needs: { wood: 6, copper_ore: 1 }, makes: { furniture: 'chest' } },
  { id: 'craft_armchair', name: 'Armchair', category: 'Furniture', needs: { wood: 5, cloth: 2 }, makes: { furniture: 'armchair' } },
  { id: 'craft_sofa', name: 'Sofa', category: 'Furniture', needs: { wood: 8, cloth: 4 }, makes: { furniture: 'sofa' } },
  { id: 'craft_double_bed', name: 'Double bed', category: 'Furniture', needs: { wood: 12, cloth: 4 }, makes: { furniture: 'double_bed' } },
  { id: 'craft_rug', name: 'Round rug', category: 'Furniture', needs: { cloth: 4 }, makes: { furniture: 'rug_round' } },
  { id: 'craft_fence', name: 'Woodland fence', category: 'Furniture', needs: { wood: 3 }, makes: { decor: 'fence' } },
  { id: 'craft_birdhouse', name: 'Bird house', category: 'Furniture', needs: { wood: 4 }, makes: { decor: 'birdhouse' } },
  { id: 'craft_bridge', name: 'Little bridge', category: 'Furniture', needs: { wood: 10 }, makes: { decor: 'bridge' } },

  { id: 'craft_lantern', name: 'Lantern', category: 'Lamps', needs: { wood: 2, copper_ore: 2 }, makes: { decor: 'lantern' } },
  { id: 'craft_floor_lamp', name: 'Floor lamp', category: 'Lamps', needs: { wood: 3, iron_ore: 1 }, makes: { furniture: 'floor_lamp' } },
  { id: 'craft_fairylights', name: 'Fairy lights', category: 'Lamps', needs: { copper_ore: 2, quartz: 1 }, makes: { decor: 'fairylights' } },
  { id: 'craft_fireflyjar', name: 'Firefly jar', category: 'Lamps', needs: { quartz: 1, wood: 1 }, makes: { decor: 'fireflyjar' } },
  { id: 'craft_campfire', name: 'Campfire', category: 'Lamps', needs: { wood: 5, stone: 3 }, makes: { decor: 'campfire' } },

  { id: 'toy_ball', name: 'Cloth ball', category: 'Toys', needs: { cloth: 2 }, makes: { item: 'toy_ball' } },
  { id: 'toy_wand', name: 'Feather wand', category: 'Toys', needs: { wood: 1, cloth: 1 }, makes: { item: 'toy_wand' } },
  { id: 'toy_yarn', name: 'Yarn ball', category: 'Toys', needs: { fiber: 6 }, makes: { item: 'toy_yarn' } },
  { id: 'toy_boat', name: 'Toy boat', category: 'Toys', needs: { wood: 3, cloth: 1 }, makes: { item: 'toy_boat' } },

  { id: 'hat_flower', name: 'Flower crown', category: 'Outfits', needs: { '#flower': 3 }, makes: { hat: 1 } },
  { id: 'hat_straw', name: 'Straw hat', category: 'Outfits', needs: { fiber: 8 }, makes: { hat: 2 } },
  { id: 'hat_beanie', name: 'Beanie', category: 'Outfits', needs: { cloth: 3 }, makes: { hat: 3 } },
  { id: 'hat_bow', name: 'Bow', category: 'Outfits', needs: { cloth: 2 }, makes: { hat: 4 } },
  { id: 'outfit_sweater', name: 'Cozy sweater', category: 'Outfits', needs: { cloth: 5 }, makes: { outfitStyle: SWEATER_STYLE } },

  { id: 'gift_bouquet', name: 'Bouquet', category: 'Gifts', needs: { '#flower': 4 }, makes: { item: 'gift_bouquet' } },
  { id: 'gift_bracelet', name: 'Friendship bracelet', category: 'Gifts', needs: { fiber: 4, quartz: 1 }, makes: { item: 'gift_bracelet' } },
  { id: 'gift_heart', name: 'Carved heart', category: 'Gifts', needs: { wood: 2 }, makes: { item: 'gift_heart' } },
  { id: 'gift_card', name: 'Pressed flower card', category: 'Gifts', needs: { '#flower': 2, fiber: 2 }, makes: { item: 'gift_card' } },
  { id: 'gift_charm', name: 'Crystal charm', category: 'Gifts', needs: { crystal_shard: 1, fiber: 2 }, makes: { item: 'gift_charm' } },
  { id: 'gift_ring', name: 'Gem ring', category: 'Gifts', needs: { gold_ore: 2, '#gem': 1 }, makes: { item: 'gift_ring' } },
];
export const CRAFT_BY_ID = Object.fromEntries(CRAFTS.map(c => [c.id, c]));
export const CATEGORIES = [...new Set(CRAFTS.map(c => c.category))];

// Crafted bag items. Furniture and decorations made here are bag items too,
// so they can be placed later (or given away).
const MADE = {
  toy_ball: ['Cloth ball', 'toy', 'round', '#E07A9B', 20],
  toy_wand: ['Feather wand', 'toy', 'leaf', '#9C82C9', 20],
  toy_yarn: ['Yarn ball', 'toy', 'round', '#C68F89', 22],
  toy_boat: ['Toy boat', 'toy', 'boot', '#79AAA4', 30],
  gift_bouquet: ['Bouquet', 'gift', 'flower', '#E07A9B', 60],
  gift_bracelet: ['Friendship bracelet', 'gift', 'button', '#9C82C9', 50],
  gift_heart: ['Carved heart', 'gift', 'round', '#B88D60', 25],
  gift_card: ['Pressed flower card', 'gift', 'seed', '#E4B4A3', 40],
  gift_charm: ['Crystal charm', 'gift', 'crystal', '#A9E0E8', 90],
  gift_ring: ['Gem ring', 'gift', 'gem', '#EBC54A', 200],
};
for (const [id, [name, cat, shape, color, price]] of Object.entries(MADE)) ITEMS[id] = { id, name, cat, shape, color, price };
for (const c of CRAFTS) {
  if (c.makes.furniture) ITEMS['made_' + c.makes.furniture] = { id: 'made_' + c.makes.furniture, name: c.name, cat: 'made', shape: 'seed', color: '#B88D60', price: 15, furniture: c.makes.furniture };
  if (c.makes.decor) ITEMS['made_' + c.makes.decor] = { id: 'made_' + c.makes.decor, name: c.name, cat: 'made', shape: 'seed', color: '#9DBA74', price: 15, decor: c.makes.decor };
}

export function producedItem(craft) {
  const m = craft.makes;
  if (m.item) return m.item;
  if (m.furniture) return 'made_' + m.furniture;
  if (m.decor) return 'made_' + m.decor;
  return null;
}

function fits(need, id) {
  if (need === '#gem') return ITEMS[id]?.shape === 'gem';
  if (need.startsWith('#')) return tagsOf(id).includes(need.slice(1));
  return id === need;
}

// Which bag items would pay for each need, or null if something's missing.
export function planCraft(state, craft) {
  const left = {};
  for (const slot of state.bag) left[slot.id] = (left[slot.id] || 0) + slot.n;
  const plan = [];
  // Exact items first, so "any flower" doesn't use up something named elsewhere.
  const needs = Object.entries(craft.needs).sort(([a], [b]) => (a.startsWith('#') ? 1 : 0) - (b.startsWith('#') ? 1 : 0));
  for (const [need, n] of needs) {
    let todo = n;
    for (const id of Object.keys(left)) {
      if (!todo || !fits(need, id) || !left[id]) continue;
      const take = Math.min(todo, left[id]);
      left[id] -= take;
      todo -= take;
      plan.push({ id, n: take });
    }
    if (todo) return null;
  }
  return plan;
}

export function haveFor(state, need) {
  if (!need.startsWith('#')) return countItem(state, need);
  return state.bag.filter(s => fits(need, s.id)).reduce((t, s) => t + s.n, 0);
}

export function alreadyUnlocked(state, craft) {
  const u = state.unlocked || {};
  if (craft.makes.hat != null) return !!u['hat' + craft.makes.hat];
  if (craft.makes.outfitStyle != null) return !!u['style' + craft.makes.outfitStyle];
  return false;
}

// Makes the thing. Returns what happened, or a reason it couldn't.
export function craft(state, craftDef) {
  if (alreadyUnlocked(state, craftDef)) return { ok: false, reason: 'You already have this.' };
  const plan = planCraft(state, craftDef);
  if (!plan) return { ok: false, reason: 'You need more materials.' };
  const out = producedItem(craftDef);
  if (out && bagFull(state, out)) return { ok: false, reason: 'Your bag is full.' };
  for (const p of plan) removeItem(state, p.id, p.n);
  if (out) addItem(state, out, 1);
  state.unlocked = state.unlocked || {};
  if (craftDef.makes.hat != null) state.unlocked['hat' + craftDef.makes.hat] = true;
  if (craftDef.makes.outfitStyle != null) state.unlocked['style' + craftDef.makes.outfitStyle] = true;
  state.crafted = (state.crafted || 0) + 1;
  return { ok: true, item: out, used: plan };
}
