// Small shops and visitors: the traveling merchant, a different animal visitor
// each day with a delivery request, and the beetle shop's rotating furniture.
// Pure rules. Everything comes from the jar's seed, so you both see the same
// merchant, visitor, request and stock.
import { ITEMS, CROPS, FORAGE, FISH, TREE_FRUIT } from './data.js';
import { FURNITURE, FURNITURE_BY_TYPE } from './home.js';
import { BUGS } from './bugs.js';
import { rngFor, shuffle, randInt } from './rng.js';
import { seasonOf } from './clock.js';
import { addItem, removeItem, countItem, bagFull } from './rules.js';
import './crafting.js'; // registers wood, fiber and cloth

// Special furniture goes in the bag when you get it, then you place it from Furnish.
export const SPECIALS = FURNITURE.filter(f => f.special);
for (const f of SPECIALS) {
  ITEMS['made_' + f.type] = { id: 'made_' + f.type, name: f.name, cat: 'made', shape: 'seed', color: '#C9A0C9', price: Math.round(f.price / 2), furniture: f.type };
}
export const furnitureItem = type => {
  const id = 'made_' + type;
  if (!ITEMS[id]) ITEMS[id] = { id, name: FURNITURE_BY_TYPE[type].name, cat: 'made', shape: 'seed', color: '#B88D60', price: Math.round(FURNITURE_BY_TYPE[type].price / 2), furniture: type };
  return id;
};

const weekOf = day => Math.floor((day + 3) / 7);
const dayInWeek = day => (day + 3) % 7;

// ---------- rotating furniture stock ----------

// Four pieces a day at the beetle shop: two special pieces and two from the
// catalogue at a discount.
export function furnitureStock(seed, day) {
  const rand = rngFor(seed, 'furniture-stock', day);
  const specials = shuffle(rand, SPECIALS.filter(f => !f.merchant)).slice(0, 2);
  const regular = shuffle(rand, FURNITURE.filter(f => !f.special)).slice(0, 2);
  return [
    ...specials.map(f => ({ type: f.type, price: f.price, special: true })),
    ...regular.map(f => ({ type: f.type, price: Math.round(f.price * 0.8), special: false })),
  ];
}

export function buyFurniture(state, entry) {
  state.daily.stock = state.daily.stock || [];
  if (state.daily.stock.includes(entry.type)) return { ok: false, reason: 'You bought that one today.' };
  const id = furnitureItem(entry.type);
  if (state.pebbles < entry.price) return { ok: false, reason: 'Not enough pebbles.' };
  if (bagFull(state, id)) return { ok: false, reason: 'Your bag is full.' };
  state.pebbles -= entry.price;
  addItem(state, id, 1);
  state.daily.stock.push(entry.type);
  return { ok: true, id };
}

// ---------- traveling merchant ----------

// The merchant stops by on two days each week.
export function merchantDays(seed, day) {
  const rand = rngFor(seed, 'merchant', weekOf(day));
  return shuffle(rand, [0, 1, 2, 3, 4, 5, 6]).slice(0, 2).sort();
}

export function merchantHere(seed, day) {
  return merchantDays(seed, day).includes(dayInWeek(day));
}

export const MERCHANT_SPOT = { c: 5, r: 8 };

const RARE_GOODS = ['gold_ore', 'emerald', 'ruby', 'amethyst', 'topaz', 'clover', 'cloth', 'crystal_shard'];
const BUYS = () => [
  ...FORAGE.filter(f => !f.rare).map(f => f.id),
  ...FISH.filter(f => f.rarity === 'common').map(f => f.id),
  'copper_ore', 'iron_ore', 'quartz', ...CROPS.map(c => c.id),
];

// Seeds from other seasons, one special piece you can't find anywhere else,
// and two rare goods. The merchant also pays double for one thing.
export function merchantStock(seed, day) {
  const rand = rngFor(seed, 'merchant-stock', day);
  const season = seasonOf(day);
  const seeds = shuffle(rand, CROPS.filter(c => c.season !== season)).slice(0, 2)
    .map(c => ({ id: c.id + '_seed', price: c.seedPrice * 2, note: `${c.season === 'autumn' ? 'An' : 'A'} ${c.season} crop. It grows in any season.` }));
  const piece = shuffle(rand, SPECIALS.filter(f => f.merchant))[0];
  const goods = shuffle(rand, RARE_GOODS.filter(id => ITEMS[id])).slice(0, 2)
    .map(id => ({ id, price: Math.max(20, ITEMS[id].price * 2), note: 'Hard to find.' }));
  const wantPool = BUYS().filter(id => ITEMS[id]);
  const wants = wantPool[Math.floor(rand() * wantPool.length)];
  return {
    items: [...seeds, { id: furnitureItem(piece.type), price: piece.price, note: 'Only from the merchant.' }, ...goods],
    wants,
  };
}

export function buyFromMerchant(state, entry) {
  state.daily.merchant = state.daily.merchant || [];
  if (state.daily.merchant.includes(entry.id)) return { ok: false, reason: '“One each, friend. I travel light.”' };
  if (state.pebbles < entry.price) return { ok: false, reason: 'Not enough pebbles.' };
  if (bagFull(state, entry.id)) return { ok: false, reason: 'Your bag is full.' };
  state.pebbles -= entry.price;
  addItem(state, entry.id, 1);
  state.daily.merchant.push(entry.id);
  return { ok: true };
}

// Sells all of the wanted item at double price.
export function sellToMerchant(state, id) {
  const n = countItem(state, id);
  if (!n) return 0;
  removeItem(state, id, n);
  const paid = ITEMS[id].price * 2 * n;
  state.pebbles += paid;
  return paid;
}

// ---------- visitors ----------

// likes: what kind of thing they ask for. gift: the special piece they give
// once you've helped them three times.
export const VISITORS = [
  { id: 'pip', name: 'Pip', species: 'hedgehog', color: '#8A6448', likes: 'forage', gift: 'bonsai',
    lines: ['I rolled all the way here! Well, most of the way.', 'Your meadow smells like clover. I like it.', 'I keep a little list of every leaf I find.'] },
  { id: 'maple', name: 'Maple', species: 'fox', color: '#D9803A', likes: 'fish', gift: 'paper_lantern',
    lines: ['I heard your pond has the best fish around.', 'Do you two always look this happy?', 'I collect stories. Tell me one later?'] },
  { id: 'bram', name: 'Bram', species: 'bear', color: '#7A5A40', likes: 'crop', gift: 'rocking_chair',
    lines: ['I\'m making soup tonight. A big one.', 'Nothing beats a slow afternoon.', 'Your garden beds look well loved.'] },
  { id: 'lulu', name: 'Lulu', species: 'duck', color: '#F2EDE4', likes: 'fish', gift: 'tea_table',
    lines: ['Quack! Sorry. Hello!', 'I swam a little in your pond. I hope that\'s alright.', 'Tea is better with friends.'] },
  { id: 'juniper', name: 'Juniper', species: 'deer', color: '#B88D60', likes: 'forage', gift: 'star_rug',
    lines: ['The stars here are so clear at night.', 'I like how quiet your jar is.', 'I\'m pressing flowers into a book.'] },
  { id: 'otis', name: 'Otis', species: 'owl', color: '#9C8266', likes: 'mineral', gift: 'globe',
    lines: ['Hoo! I study rocks. Fascinating things.', 'I\'ve been to every jar on the shelf. Well, nearly.', 'Did you know quartz hums, if you listen?'] },
  { id: 'fern', name: 'Fern', species: 'frog', color: '#7FA35A', likes: 'bug', gift: 'tall_clock',
    lines: ['Ribbit. I\'m on a bug-watching holiday.', 'Rainy days are the best days.', 'I can hold my breath for a very long time.'] },
  { id: 'dot', name: 'Dot', species: 'mouse', color: '#B5A8A0', likes: 'material', gift: 'jukebox',
    lines: ['I\'m building a tiny house. Very tiny.', 'Every good thing starts with a bit of wood.', 'Your workbench is so tidy!'] },
];
export const VISITOR_BY_ID = Object.fromEntries(VISITORS.map(v => [v.id, v]));
export const GIFT_AT = 3;

// A different visitor every day of the week.
export function visitorOn(seed, day) {
  const order = shuffle(rngFor(seed, 'visitors', weekOf(day)), VISITORS);
  return order[dayInWeek(day)];
}

export const VISITOR_SPOTS = [{ c: 9, r: 7 }, { c: 6, r: 6 }, { c: 5, r: 3 }, { c: 13, r: 3 }, { c: 10, r: 9 }, { c: 2, r: 4 }, { c: 15, r: 10 }];

export function visitorSpot(seed, day, taken) {
  const rand = rngFor(seed, 'visitor-spot', day);
  return shuffle(rand, VISITOR_SPOTS).find(t => !taken.has(t.c + ',' + t.r)) || VISITOR_SPOTS[0];
}

function poolFor(likes, season) {
  const fits = x => !x.seasons || x.seasons.includes(season);
  switch (likes) {
    case 'forage': return FORAGE.filter(f => f.season === season && !f.rare).map(f => f.id);
    case 'fish': return FISH.filter(f => fits(f) && f.rarity === 'common').map(f => f.id);
    case 'crop': return [...CROPS.filter(c => c.season === season).map(c => c.id), TREE_FRUIT[season]?.id].filter(Boolean);
    case 'mineral': return ['stone', 'copper_ore', 'iron_ore', 'quartz'];
    case 'bug': return BUGS.filter(b => !b.map && b.rarity === 'common' && (!b.seasons || b.seasons.includes(season)) && !b.weather).map(b => b.id);
    default: return ['wood', 'fiber', 'cloth'];
  }
}

// What today's visitor would like you to bring, and what they'll pay.
export function requestFor(seed, day, visitor) {
  const rand = rngFor(seed, 'request', day);
  const pool = poolFor(visitor.likes, seasonOf(day)).filter(id => ITEMS[id]);
  const item = pool[Math.floor(rand() * pool.length)];
  const big = ['fish', 'bug'].includes(visitor.likes) || ITEMS[item].price >= 30;
  const n = big ? 1 : randInt(rand, 2, 3);
  return { item, n, reward: Math.max(30, ITEMS[item].price * n * 2 + 10) };
}

// deliveries: the shared deliveries docs, keyed by day.
export function heartsFor(deliveries, visitorId) {
  return Object.values(deliveries).filter(d => d.visitor === visitorId).length;
}

export function canDeliver(state, request) {
  return countItem(state, request.item) >= request.n;
}

export function deliver(state, request) {
  if (!canDeliver(state, request)) return false;
  removeItem(state, request.item, request.n);
  state.pebbles += request.reward;
  return true;
}

// Each of you gets the thank-you gift once, once the visitor has had three deliveries from either of you.
export function giftDue(state, deliveries, visitor) {
  return heartsFor(deliveries, visitor.id) >= GIFT_AT && !state.visitorGifts?.[visitor.id];
}

export function takeGift(state, visitor) {
  const id = furnitureItem(visitor.gift);
  if (bagFull(state, id)) return null;
  addItem(state, id, 1);
  state.visitorGifts = { ...(state.visitorGifts || {}), [visitor.id]: true };
  return id;
}
