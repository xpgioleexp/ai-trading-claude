// Everything the two of you share, kept live. Each person writes only their
// own documents where possible, so two devices rarely overwrite each other.
import { cloud, watchCollection, watchDoc, setDoc, updateDoc, privatePath, now } from './cloud.js';

export const S = {
  ready: false,
  world: null,
  people: {},
  garden: {},
  answers: {},
  checkins: {},
  notes: {},
  missions: {},
  rituals: {},
  dates: {},
  dreams: {},
  scrapbook: {},
  decor: {},
  animals: {},
  discoveries: {},
  rooms: {},
  furniture: {},
  wallitems: {},
  goodnights: {},
  kitchen: {},
  recipes: {},
  meals: {},
  gifts: {},
  jars: {},
  deliveries: {},
  critters: {},
  moments: {},
  events: {},
  museum: {},
  pins: {},
  lore: {},
  house: null,
  weather: null,
  timer: null,
  prompt: null,
};

const listeners = new Set();
export function onShared(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
function changed(kind) {
  listeners.forEach(fn => fn(kind));
}

const COLLECTIONS = ['people', 'garden', 'answers', 'checkins', 'notes', 'missions', 'rituals', 'dates', 'dreams', 'scrapbook', 'decor', 'animals', 'discoveries', 'rooms', 'furniture', 'wallitems', 'goodnights', 'kitchen', 'recipes', 'meals', 'gifts', 'jars', 'deliveries', 'events', 'critters', 'moments', 'museum', 'pins', 'lore'];

export async function startShared({ seed, today, timeZone }) {
  // The jar itself: one seed and time zone for both of you.
  const ref = cloud.db.doc('world/meta');
  let snap = await ref.get().catch(() => null);
  if (!snap?.exists) {
    await setDoc('world/meta', { seed, startDay: today, timeZone, name: 'Our little jar', createdAt: now() }).catch(() => {});
    snap = await ref.get().catch(() => null);
  }
  S.world = snap?.exists ? snap.data() : { seed, startDay: today, timeZone, name: 'Our little jar' };
  watchDoc('world/meta', d => { if (d) { S.world = d; changed('world'); } });
  for (const name of COLLECTIONS) {
    watchCollection(name, live => {
      S[name] = { ...live };
      changed(name);
      if (name === 'answers') revealWhenBothAnswered();
    });
  }
  watchDoc('home/house', d => { S.house = d; changed('house'); });
  watchDoc('live/weather', d => { S.weather = d; changed('weather'); });
  watchDoc('live/timer', d => { S.timer = d; changed('timer'); });
  watchDoc('live/prompt', d => { S.prompt = d; changed('prompt'); });
  S.ready = true;
  changed('ready');
}

// ---------- people ----------

export function partnerId() {
  return Object.keys(S.people).find(id => id !== cloud.me) || null;
}

export function couple() {
  return [cloud.me, partnerId()].filter(Boolean);
}

let lastLook = '';
export function shareLook(look) {
  if (!S.ready) return;
  const key = JSON.stringify(look);
  if (key === lastLook) return;
  lastLook = key;
  const existing = S.people[cloud.me];
  setDoc(`people/${cloud.me}`, { look, joinedAt: existing?.joinedAt || now() }).catch(() => {});
}

// ---------- garden (shared beds) ----------

export function saveBed(i, bed) {
  setDoc(`garden/bed-${i}`, { ...bed }).catch(() => {});
}

// ---------- sealed answers ----------
// Your words stay in your private space until you have BOTH answered; then
// each device copies its own words next to the other's.

export function answerId(key, uid) {
  return `${key}--${uid}`;
}

export function answerFor(key, uid) {
  return S.answers[answerId(key, uid)] || null;
}

export async function submitAnswer(key, text, extra = {}) {
  await setDoc(privatePath('a-' + key), { key, text, at: now(), ...extra });
  await setDoc(`answers/${answerId(key, cloud.me)}`, { key, uid: cloud.me, state: 'answered', at: now(), ...extra });
  revealWhenBothAnswered();
}

export async function setAnswerState(key, state, extra = {}) {
  const mine = answerFor(key, cloud.me);
  if (mine?.state === 'answered') return;
  await setDoc(`answers/${answerId(key, cloud.me)}`, { key, uid: cloud.me, state, at: now(), ...extra });
}

export async function myPrivateAnswer(key) {
  const snap = await cloud.db.doc(privatePath('a-' + key)).get().catch(() => null);
  return snap?.exists ? snap.data() : null;
}

let revealing = false;
async function revealWhenBothAnswered() {
  const partner = partnerId();
  if (!partner || revealing) return;
  revealing = true;
  try {
    for (const doc of Object.values(S.answers)) {
      if (doc.uid !== cloud.me || doc.state !== 'answered' || doc.text != null) continue;
      if (answerFor(doc.key, partner)?.state !== 'answered') continue;
      const mine = await myPrivateAnswer(doc.key);
      if (mine) await updateDoc(`answers/${answerId(doc.key, cloud.me)}`, { text: mine.text }).catch(() => {});
    }
  } finally {
    revealing = false;
  }
}

export function bothRevealed(key) {
  const p = partnerId();
  return !!(p && answerFor(key, cloud.me)?.text != null && answerFor(key, p)?.text != null);
}

// ---------- discoveries ----------

export function discover(id, extra = {}) {
  if (S.discoveries[id]?.at) return false;
  setDoc(`discoveries/${id}`, { by: cloud.me, at: now(), ...extra }).catch(() => {});
  return true;
}

export function leaveWellLight() {
  const doc = S.discoveries['old-well'] || {};
  const lights = { ...(doc.lights || {}), [cloud.me]: true };
  const done = Object.keys(lights).length >= 2;
  setDoc('discoveries/old-well', { lights, ...(done ? { at: doc.at || now(), by: cloud.me } : {}) }).catch(() => {});
  return { count: Object.keys(lights).length, done };
}

// ---------- shared shower ----------

export function startRain() {
  setDoc('live/weather', { rainUntil: now() + 60000, by: cloud.me }).catch(() => {});
}

export function stopRain() {
  setDoc('live/weather', { rainUntil: 0, by: cloud.me }).catch(() => {});
}

export function rainingNow() {
  return (S.weather?.rainUntil || 0) > now();
}

// ---------- goodnight ----------
// Each of you says goodnight from the bed; when you both have on the same day,
// it's kept as a little moment.

export function sayGoodnight(day) {
  setDoc(`goodnights/${day}--${cloud.me}`, { day, uid: cloud.me, at: now() }).catch(() => {});
}

export function goodnightsOn(day) {
  return Object.values(S.goodnights).filter(n => n.day === day).map(n => n.uid);
}
