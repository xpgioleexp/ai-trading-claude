// The couple content carried over from Little Us: 3,000 questions, 500
// missions, 306 question packs, 160 date ideas, moods, needs, rituals,
// dream starters, decorations, animal actions and discoveries.
import { rngFor, shuffle } from './rng.js';
import { FARM_BUILDINGS } from './farm-data.js';

export const C = { ready: false };

// Small decorations from the original jar, added to the 30 forest ones (50 in all).
const SMALL_DECOR = [
  ['fern', 'Fern', 'Plants', 15], ['mushroom', 'Mushroom', 'Plants', 20], ['daisy', 'Daisies', 'Flowers', 15],
  ['flower', 'Wildflowers', 'Flowers', 20], ['lantern', 'Lantern', 'Lights', 30], ['stone', 'Smooth stone', 'Treasures', 10],
  ['moss', 'Moss patch', 'Plants', 10], ['clover', 'Clover', 'Plants', 10], ['blueflower', 'Blue flowers', 'Flowers', 15],
  ['bellflower', 'Bellflowers', 'Flowers', 20], ['tallmushroom', 'Tall mushroom', 'Plants', 20], ['riverstone', 'River stones', 'Treasures', 15],
  ['log', 'Mossy log', 'Furniture', 25], ['stump', 'Tree stump', 'Furniture', 20], ['fireflyjar', 'Firefly jar', 'Lights', 30],
  ['fairylights', 'Fairy lights', 'Lights', 35], ['puddle', 'Little puddle', 'Plants', 35], ['lilypad', 'Lily pad', 'Plants', 15],
  ['seat', 'Garden seat', 'Furniture', 30], ['sapling', 'Sapling', 'Trees', 30],
];

export async function loadContent(base = '') {
  const [lib, extra] = await Promise.all([
    fetch(base + 'content/library.json').then(r => r.json()),
    fetch(base + 'content/extras.json').then(r => r.json()),
  ]);
  Object.assign(C, extra);
  C.questions = lib.questions;
  C.missions = lib.missions;
  C.missionTopics = lib.missionTopics;
  C.packs = [...extra.starterPacks.map(p => ({ ...p, category: 'Start here' })), ...lib.packs];
  C.dateIdeas = lib.dateIdeas;
  C.decorations = [...extra.decorations, ...SMALL_DECOR.map(([type, name, category, price]) => ({ type, name, category, price }))];
  C.decorByType = Object.fromEntries(C.decorations.map(d => [d.type, d]));
  // Farm buildings and fruit trees are placed like decorations but bought in the shop's Farm tab.
  for (const f of FARM_BUILDINGS) C.decorByType[f.type] = { type: f.type, name: f.name, category: 'Farm', price: f.price, farm: true };
  C.packById = Object.fromEntries(C.packs.map(p => [p.id, p]));
  C.ready = true;
  return C;
}

// Weeks start on Monday. Day 4 (1970-01-05) was a Monday.
export function weekOf(day) {
  return Math.floor((day + 3) / 7);
}

export function mondayOf(week) {
  return week * 7 - 3;
}

const orderCache = new Map();
function order(seed, kind, n) {
  const key = seed + kind;
  if (!orderCache.has(key)) orderCache.set(key, shuffle(rngFor(seed, kind), [...Array(n).keys()]));
  return orderCache.get(key);
}

// The day's question: the same for both of you, never repeating until all
// 3,000 have come up.
export function questionFor(seed, startDay, day) {
  const idx = order(seed, 'questions', C.questions.length);
  const n = ((day - startDay) % idx.length + idx.length) % idx.length;
  return C.questions[idx[n]];
}

// One mission per week from the 500, without repeats until the bank runs out.
export function missionFor(seed, startDay, week) {
  const idx = order(seed, 'missions', C.missions.length);
  const n = ((week - weekOf(startDay)) % idx.length + idx.length) % idx.length;
  return C.missions[idx[n]];
}

export function ritualFor(week) {
  return C.rituals[week % C.rituals.length];
}

export function promptFor(t) {
  return C.prompts[Math.floor(t) % C.prompts.length];
}
