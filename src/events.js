// Seasonal events on set days of each season (a season is one week, Monday to
// Sunday). Pure rules; both of you get the same events on the same days.
import { ITEMS, FISH_BY_ID, RARITY_WEIGHT } from './data.js';
import { seasonOf, dayOfSeason, isNightHour } from './clock.js';
import { rngFor, shuffle, pickWeighted } from './rng.js';
import { addItem, bagFull } from './rules.js';

// New things you can only find during events.
ITEMS.puffball = { id: 'puffball', name: 'Puffball', cat: 'forage', shape: 'mushroom', color: '#EDE4D0', price: 25, event: 'mushrooms' };
ITEMS.glowcap = { id: 'glowcap', name: 'Glowcap', cat: 'forage', shape: 'mushroom', color: '#9FE0C0', price: 70, rare: true, event: 'mushrooms' };
ITEMS.truffle = { id: 'truffle', name: 'Truffle', cat: 'forage', shape: 'mushroom', color: '#5A4130', price: 120, rare: true, event: 'mushrooms' };
ITEMS.star_fragment = { id: 'star_fragment', name: 'Star fragment', cat: 'forage', shape: 'crystal', color: '#F2E48A', price: 90, event: 'meteors' };
export const EVENT_ITEM_IDS = ['puffball', 'glowcap', 'truffle', 'star_fragment'];

// days: which days of the season (1 = Monday). night: only after dark.
export const EVENTS = [
  { id: 'lanterns', name: 'Lantern nights', season: 'spring', days: [6, 7], night: true,
    blurb: 'Paper lanterns drift up into the night sky. Let one go with a wish.' },
  { id: 'festival', name: 'Fishing festival', season: 'summer', days: [6],
    blurb: 'Twice the bites at the pond, and a prize for your biggest catch.' },
  { id: 'meteors', name: 'Meteor shower', season: 'summer', days: [3], night: true,
    blurb: 'Shooting stars all night. Tap one to catch a star fragment.' },
  { id: 'meteors', name: 'Meteor shower', season: 'autumn', days: [7], night: true,
    blurb: 'Shooting stars all night. Tap one to catch a star fragment.' },
  { id: 'mushrooms', name: 'Mushroom season', season: 'autumn', days: [1, 2, 3, 4, 5],
    blurb: 'Mushrooms pop up all over the meadow, including some you won\'t see any other time.' },
  { id: 'snow', name: 'Snow day', season: 'winter', days: [2, 5],
    blurb: 'Deep snow all day. Roll snowballs and build a snowman together.' },
];

const lanternHour = h => h >= 18 || h < 2;

// Events running at some point today, whatever the hour.
export function eventsToday(day) {
  const season = seasonOf(day), d = dayOfSeason(day);
  return EVENTS.filter(e => e.season === season && e.days.includes(d));
}

// Events happening right now. Night events run in the evening; lantern nights from 6pm.
export function eventsNow(day, hour) {
  return eventsToday(day).filter(e => !e.night || (e.id === 'lanterns' ? lanternHour(hour) : isNightHour(hour)));
}

export function isOn(day, hour, id) {
  return eventsNow(day, hour).some(e => e.id === id);
}

// The next few events after today, for the calendar on the event stand.
export function upcoming(day, n = 4) {
  const out = [];
  for (let d = day + 1; d < day + 29 && out.length < n; d++) {
    for (const e of eventsToday(d)) if (!out.some(o => o.day === d && o.event.id === e.id)) out.push({ day: d, event: e });
  }
  return out.slice(0, n);
}

// The stand for event panels sits here in the meadow, out of the way.
export const EVENT_SPOT = { c: 9, r: 10 };

// ---------- mushroom season ----------

export const MUSHROOM_GOAL = 10;

// Extra mushroom spots on top of the day's forage, on free tiles.
export function mushroomSpots(seed, day, tiles, taken) {
  const rand = rngFor(seed, 'mushrooms', day);
  const pool = [
    { id: 'chanterelle', w: 6 }, { id: 'morel', w: 4 }, { id: 'puffball', w: 6 }, { id: 'glowcap', w: 2 }, { id: 'truffle', w: 1 },
  ];
  return shuffle(rand, tiles.filter(t => !taken.has(t.c + ',' + t.r))).slice(0, 5)
    .map(t => ({ c: t.c, r: t.r, id: pickWeighted(rand, pool, p => p.w).id }));
}

// ---------- fishing festival ----------

export const FESTIVAL_BITES = 10;

// How good a catch is: its size against the biggest of its kind, with a bonus for rarer fish.
export function catchScore(id, size) {
  const f = FISH_BY_ID[id] || ITEMS[id];
  if (!f?.size || size == null) return 0;
  const bonus = { common: 0, uncommon: 15, rare: 30, legend: 50 }[f.rarity] || 0;
  return Math.round((size / f.size[1]) * 70) + bonus;
}

export function recordFestivalCatch(state, id, size) {
  const score = catchScore(id, size);
  const best = state.daily.festival;
  if (score && (!best || score > best.score)) {
    state.daily.festival = { id, size, score };
    return true;
  }
  return false;
}

export function festivalPrize(score) {
  return 30 + score * 2;
}

// ---------- meteor shower ----------

export const STARS_PER_NIGHT = 3;

// A new meteor every few seconds, streaking down-left across the sky.
export function spawnMeteor(rand, t) {
  return { x0: 120 + rand() * 190, y0: 30 + rand() * 20, t0: t, life: 1.6 + rand() * 0.6, speed: 70 + rand() * 30 };
}

export function meteorAt(m, t) {
  const age = t - m.t0;
  return { x: m.x0 - age * m.speed, y: m.y0 + age * m.speed * 0.45, age };
}

export function catchStar(state) {
  state.daily.stars = state.daily.stars || 0;
  if (state.daily.stars >= STARS_PER_NIGHT) return { ok: false, reason: 'You\'ve caught all the stars you can carry tonight.' };
  if (bagFull(state, 'star_fragment')) return { ok: false, reason: 'Your bag is full.' };
  addItem(state, 'star_fragment', 1);
  state.daily.stars += 1;
  return { ok: true, left: STARS_PER_NIGHT - state.daily.stars };
}

// ---------- snow day ----------

export const SNOWMAN_PARTS = ['base', 'middle', 'head', 'scarf and buttons'];
export const SNOWMAN_SPOT = { c: 8, r: 8 };

// rolls: the shared snow docs for today, one per person: { by, rolls }.
export function snowmanParts(rolls) {
  return Math.min(SNOWMAN_PARTS.length, rolls.reduce((t, d) => t + (d.rolls || 0), 0));
}

export const SNOWMAN_PRIZE = 40;
export const LANTERN_PRIZE = 20;
