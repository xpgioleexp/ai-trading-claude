// The jar's residents: bunny, frog, turtle, snail and marimo.
// Needs and adoption are shared; where each one wanders is drawn on each device.
import { C } from './content.js';
import { cloud, setDoc, now } from './cloud.js';
import { S } from './shared.js';
import { isWalkable, forageTiles, OBJECTS } from './world.js';
import { pathTo } from './path.js';
import { tileCenter } from './scene.js';

export const SPECIES_ORDER = ['bunny', 'frog', 'turtle', 'snail', 'marimo'];
export const ADOPT_PRICE = { bunny: 0, frog: 30, turtle: 40, snail: 20, marimo: 25 };
export const SPECIES_INFO = {
  bunny: { label: 'Bunny', land: true, water: false, speed: 26 },
  frog: { label: 'Frog', land: true, water: true, speed: 22 },
  turtle: { label: 'Turtle', land: true, water: true, speed: 9 },
  snail: { label: 'Snail', land: true, water: false, speed: 4 },
  marimo: { label: 'Marimo', land: false, water: true, speed: 3 },
};

const NEED_KEYS = ['full', 'happy', 'rested', 'clean'];
// Needs fall slowly while someone is in the jar, and never drop below a third
// while you're away: no animal suffers because you missed a day.
const DECAY_PER_HOUR = { full: 6, happy: 4, rested: 3, clean: 2 };
const AWAY_FLOOR = 34;

// What each of the 43 actions does. Unlisted actions give a little happiness.
const EFFECTS = {
  feed: { full: 25 }, treat: { full: 10, happy: 12 }, drink: { full: 10 }, water: { full: 15, clean: 10 },
  pet: { happy: 12 }, brush: { clean: 18, happy: 5 }, bathe: { clean: 25 }, calm: { happy: 10, rested: 5 },
  sing: { happy: 8, rested: 4 }, rest: { rested: 25 }, nap: { rested: 30 }, shade: { rested: 20 }, light: { happy: 10, rested: 5 },
  train: { happy: 10, rested: -5 }, highfive: { happy: 10 },
  play: { happy: 15, rested: -6 }, fetch: { happy: 18, rested: -8 }, leaf: { happy: 14, rested: -5 }, feather: { happy: 14, rested: -4 },
  bubbles: { happy: 12 }, hide: { happy: 14, rested: -4 }, peekaboo: { happy: 10 }, trail: { happy: 14, rested: -5 },
  race: { happy: 16, rested: -10 }, gather: { happy: 10 }, groupmeal: { full: 15, happy: 10 },
  call: { happy: 5 }, forage: { full: 8, happy: 6 }, inspect: { happy: 8 }, friend: { happy: 14 }, tunnel: { happy: 12, rested: -4 },
  bask: { rested: 12, happy: 6 }, dig: { happy: 10, clean: -8 }, swim: { clean: 15, happy: 10 }, splash: { happy: 12, clean: 6 },
  croak: { happy: 8 }, shell: { happy: 8 }, cave: { happy: 10 }, return: { happy: 4 },
  roll: { happy: 10 }, toy: { happy: 30, rested: -6 }, current: { happy: 10, clean: 8 }, pond: { happy: 8 }, bowl: { happy: 6 },
};

// The little thing each action makes the animal do in the jar.
const MOTION = {
  call: 'come', gather: 'come', fetch: 'fetch', race: 'zoom', play: 'come', leaf: 'zoom', feather: 'zoom', trail: 'zoom',
  swim: 'water', splash: 'water', pond: 'water', current: 'water', bowl: 'land',
  rest: 'sleep', nap: 'sleep', shade: 'sleep',
  hide: 'hide', tunnel: 'hide', cave: 'hide', peekaboo: 'hide',
  sing: 'notes', croak: 'notes', bubbles: 'bubbles', return: 'land', toy: 'zoom',
};

export const COOLDOWN_MS = 8000;

export function actionsFor(species) {
  return C.interactions.filter(i => i.species.includes(species));
}

export function currentNeeds(doc, at = now()) {
  const base = doc?.needs || { full: 70, happy: 70, rested: 70, clean: 70 };
  const hours = Math.min(12, Math.max(0, (at - (doc?.updatedAt || at)) / 3600000));
  const out = {};
  for (const k of NEED_KEYS) {
    const start = base[k] ?? 70;
    const decayed = start - DECAY_PER_HOUR[k] * hours;
    out[k] = Math.round(Math.max(Math.min(start, AWAY_FLOOR), Math.min(100, decayed)));
  }
  return out;
}

export function applyAction(doc, actionId, at = now()) {
  const needs = currentNeeds(doc, at);
  const fx = EFFECTS[actionId] || { happy: 6 };
  for (const [k, v] of Object.entries(fx)) needs[k] = Math.max(0, Math.min(100, needs[k] + v));
  return { ...doc, needs, updatedAt: at, last: { ...(doc?.last || {}), [actionId]: at } };
}

export function cooldownLeft(doc, actionId, at = now()) {
  const last = doc?.last?.[actionId] || 0;
  return Math.max(0, COOLDOWN_MS - (at - last));
}

export function moodWord(needs) {
  const low = Object.entries(needs).sort((a, b) => a[1] - b[1])[0];
  if (low[1] > 70) return 'Very content';
  return { full: 'A bit peckish', happy: 'Wants to play', rested: 'Sleepy', clean: 'Could use a wash' }[low[0]];
}

export function adopted() {
  return SPECIES_ORDER.filter(s => S.animals[s]?.adopted);
}

export async function adopt(species, state) {
  const price = ADOPT_PRICE[species];
  if (S.animals[species]?.adopted || state.pebbles < price) return false;
  state.pebbles -= price;
  await setDoc(`animals/${species}`, {
    adopted: true, name: C.species[species].name, by: cloud.me, adoptedAt: now(),
    needs: { full: 80, happy: 80, rested: 80, clean: 80 }, updatedAt: now(), last: {},
  });
  return true;
}

export function care(species, actionId) {
  const doc = S.animals[species];
  if (!doc) return null;
  const next = applyAction(doc, actionId);
  S.animals[species] = next;
  setDoc(`animals/${species}`, next).catch(() => {});
  return MOTION[actionId] || 'happy';
}

export function rename(species, name) {
  const doc = S.animals[species];
  if (!doc) return;
  setDoc(`animals/${species}`, { ...doc, name: name.slice(0, 24) }).catch(() => {});
}

// ---------- wandering ----------

const pond = OBJECTS.find(o => o.id === 'pond');
const pondTiles = [];
for (let c = pond.c; c < pond.c + pond.w; c++) for (let r = pond.r; r < pond.r + pond.h; r++) {
  if (c > pond.c && c < pond.c + pond.w - 1 && r > pond.r && r < pond.r + pond.h - 1) pondTiles.push({ c, r });
}

export function makeResident(species) {
  const info = SPECIES_INFO[species];
  const start = info.land ? forageTiles()[(species.length * 7) % forageTiles().length] : pondTiles[0];
  const p = tileCenter(start.c, start.r);
  return { species, c: start.c, r: start.r, x: p.x, y: p.y + 3, path: [], wait: 1 + Math.random() * 3, frame: 0, flip: false, inWater: !info.land, mode: null, until: 0, hidden: false };
}

function walkableFor(a, extraBlocked) {
  return (c, r) => isWalkable(c, r, extraBlocked);
}

// mode: what the last action asked for; t: game seconds; player: {c, r}
export function updateResident(a, dt, t, ctx) {
  const info = SPECIES_INFO[a.species];
  if (a.mode && t > a.until) {
    a.mode = null;
    a.hidden = false;
  }
  if (a.mode === 'sleep' || (ctx.night && !a.mode)) {
    a.frame = 0;
    a.path = [];
    return;
  }
  if (a.mode === 'hide') {
    a.hidden = true;
    return;
  }
  // Marimo only drifts in the pond.
  if (!info.land) {
    a.drift = (a.drift || 0) + dt;
    const p = tileCenter(pondTiles[0].c, pondTiles[0].r);
    a.x = p.x + 14 + Math.sin(a.drift * 0.4) * 14;
    a.y = p.y + 10 + Math.cos(a.drift * 0.3) * 6;
    a.inWater = true;
    return;
  }
  if (!a.path.length) {
    a.frame = 0;
    a.wait -= dt;
    if (a.wait > 0) return;
    a.wait = 2 + Math.random() * 5;
    let goal;
    if (a.mode === 'come' || a.mode === 'fetch') goal = ctx.player;
    else if (a.mode === 'water' && info.water) goal = pondTiles[Math.floor(Math.random() * pondTiles.length)];
    else {
      const spots = forageTiles();
      goal = spots[Math.floor(Math.random() * spots.length)];
    }
    const swim = a.mode === 'water' && info.water;
    const walk = swim
      ? (c, r) => isWalkable(c, r, ctx.blocked) || pondTiles.some(t => t.c === c && t.r === r) || (c >= pond.c && c < pond.c + pond.w && r >= pond.r && r < pond.r + pond.h)
      : walkableFor(a, ctx.blocked);
    const path = goal ? (a.mode === 'come' || a.mode === 'fetch'
      ? pathTo(walk, { c: a.c, r: a.r }, goal)?.slice(0, -1)
      : pathTo(walk, { c: a.c, r: a.r }, goal)) : null;
    a.path = (path || []).slice(0, a.mode ? 20 : 4);
    if (a.mode === 'fetch' && !a.path.length) a.mode = null;
    return;
  }
  const next = a.path[0];
  const tp = tileCenter(next.c, next.r);
  const dx = tp.x - a.x, dy = tp.y + 3 - a.y;
  const dist = Math.hypot(dx, dy);
  const speed = info.speed * (a.mode === 'zoom' || a.mode === 'fetch' ? 2.2 : 1);
  const step = speed * dt;
  a.hop = (a.hop || 0) + dt;
  a.frame = Math.floor(a.hop * (a.species === 'bunny' || a.species === 'frog' ? 6 : 3)) % 2;
  if (Math.abs(dx) > 0.5) a.flip = dx < 0;
  if (dist <= step) {
    a.x = tp.x;
    a.y = tp.y + 3;
    a.c = next.c;
    a.r = next.r;
    a.path.shift();
    a.inWater = next.c >= pond.c && next.c < pond.c + pond.w && next.r >= pond.r && next.r < pond.r + pond.h;
  } else {
    a.x += (dx / dist) * step;
    a.y += (dy / dist) * step;
  }
}

export function startMotion(a, motion, t) {
  const duration = { sleep: 20, hide: 5, water: 25, come: 15, fetch: 15, zoom: 6, notes: 3, bubbles: 3, land: 10 }[motion] || 2;
  a.mode = motion === 'notes' || motion === 'bubbles' || motion === 'happy' ? null : motion;
  a.until = t + duration;
  a.path = [];
  a.wait = 0;
  if (motion === 'land') a.inWater = false;
}
