// Life in the jars: the animals who live there, the shopkeepers and the
// special spots. Rules are in biomes.js; this is the panels and the wandering.
import { cloud, setDoc, newId, now } from './cloud.js';
import { S, partnerId } from './shared.js';
import { openSheet, toast, esc, updateHud } from './ui.js';
import { ITEMS, FISH } from './data.js';
import * as R from './rules.js';
import { iconURL } from './sprites.js';
import { MAPS, mapOpenTiles } from './maps.js';
import { nameOf } from './together.js';
import { tileCenter } from './scene.js';
import {
  crittersIn, SHOPS, buyFromJarShop, befriend, dailyGift, keepsake, heartsOf, pointsFor, MAX_HEARTS, POINTS_PER_HEART,
  useSpot, SPOT_TEXT, dig, CONSTELLATIONS,
} from './biomes.js';
import { rngFor, shuffle } from './rng.js';
import { makeActor, updateActor, BEHAVIOR_TEXT } from './behaviors.js';
import { wildVisitors, spotAnimal } from './wild.js';
import { timeBlock } from './bugs.js';
import { OBJECTS, forageTiles } from './world.js';
import { pathTo, pathNextTo } from './path.js';

// Extra things people tell you.
const INFO = {
  captain: g => {
    const bite = FISH.filter(f => R.fishAvailable(f, g.season, g.hour, g.weather));
    const rare = bite.filter(f => ['rare', 'legend'].includes(f.rarity)).map(f => f.name);
    return `“Biting right now: ${esc(bite.slice(0, 5).map(f => f.name.toLowerCase()).join(', '))}${rare.length ? `. And if you're lucky: ${esc(rare.join(', ').toLowerCase())}` : ''}.”`;
  },
  poppy: g => (g.state.daily.poppy ? '“I watered one of your beds this morning.”' : '“I\'ll give your beds a drink on my rounds.”'),
  pelican: g => (g.unreadMail ? '“You\'ve got mail waiting in your mailbox!”' : '“All delivered for today.”'),
  iris: g => `“Today I'm painting ${esc(['the forest pool', 'the old oak', 'your garden', 'the mist', 'the willow', 'two little figures by the pond'][g.today % 6])}.”`,
};

const icon = id => `<img class="icon" src="${iconURL(id)}" alt="" width="32" height="32">`;
const FEET = 5;

// Your partner is standing close to this tile in the same jar.
export function partnerNear(g, c, r, d = 2) {
  return g.others.some(o => {
    if (o.scene !== 'map' || o.mapId !== g.mapId) return false;
    const oc = Math.round((o.x - 24 - 8) / 16), or = Math.round((o.y - FEET - 100 - 8) / 16);
    return Math.abs(oc - c) <= d && Math.abs(or - r) <= d;
  });
}

function saveMoment(g, text) {
  const partner = partnerId();
  if (!partner || !text) return;
  setDoc(`moments/${newId()}`, { text, jar: g.mapId, uids: [cloud.me, partner], at: now() }).catch(() => {});
}

// ---------- the animals ----------

// Each animal starts the day somewhere different (or at its favourite spot),
// then behaves in its own way (see behaviors.js). Works in the meadow ('forest') and the jars.
export function critterJar(g) {
  return g.scene === 'jar' ? 'forest' : g.scene === 'map' ? g.mapId : null;
}

function objectsHere(g) {
  return g.scene === 'jar' ? OBJECTS : MAPS[g.mapId]?.objects || [];
}

function tilesOf(o) {
  const out = [];
  for (let c = o.c; c < o.c + (o.w || 1); c++) for (let r = o.r; r < o.r + (o.h || 1); r++) out.push({ c, r });
  return out;
}

const TREE_KINDS = new Set(['tree', 'palm', 'pine', 'bigtree', 'cactus', 'decotree', 'bamboo', 'fern', 'bigshroom']);

export function syncCritters(g) {
  const jar = critterJar(g);
  if (!jar) { g.critters = []; return; }
  const open = jar === 'forest' ? forageTiles() : mapOpenTiles(MAPS[jar]).filter(t => t.c > 1);
  const spots = shuffle(rngFor(g.state.seed, 'critters', jar, g.today), open);
  const objs = objectsHere(g);
  g.critterTrees = objs.filter(o => TREE_KINDS.has(o.kind) || o.id === 'tree').flatMap(tilesOf);
  g.critters = crittersIn(jar).map((def, i) => {
    let tile = def.home && open.some(t => t.c === def.home.c && t.r === def.home.r) ? def.home : spots[i % spots.length];
    const a = makeActor(def, tile, g.t);
    if (def.water) {
      a.waterTiles = objs.filter(o => o.id === def.water).flatMap(tilesOf);
      if (a.waterTiles.length) {
        const w = a.waterTiles[(i * 3) % a.waterTiles.length];
        Object.assign(a, makeActor(def, w, g.t), { waterTiles: a.waterTiles });
      }
    }
    if (def.home) a.home = { ...def.home };
    return a;
  });
  g.critterKey = jar + '|' + g.today;
}

// onEvent(actor, event): what a creature did this frame (dug, delivered mail...).
export function updateCritters(g, dt, walkable, onEvent) {
  const jar = critterJar(g);
  if (!jar) return;
  if (g.critterKey !== jar + '|' + g.today) syncCritters(g);
  const env = {
    t: g.t, dt, hour: g.hour, night: g.night, walkable, actors: g.critters,
    storm: g.weather === 'storm' || g.weather === 'blizzard', heat: g.weather === 'heat',
    player: { c: g.player.c, r: g.player.r, x: g.player.x, y: g.player.y, moving: g.player.path.length > 0, sneaking: !!g.player.slow },
    anchors: { trees: g.critterTrees || [], water: [] },
    friend: def => pointsFor(S.critters, def.id) >= POINTS_PER_HEART || !!g.state.daily?.critters?.[def.id]?.pet,
    route: (from, goal, near) => (near ? pathNextTo(walkable, from, [goal]) : pathTo(walkable, from, goal)),
  };
  for (const a of g.critters) {
    env.anchors.water = a.waterTiles || [];
    for (const ev of updateActor(a, env)) onEvent?.(a, ev);
  }
  syncWild(g, jar);
  env.actors = [...g.critters, ...g.wild];
  for (const a of g.wild) {
    env.anchors.water = a.waterTiles || [];
    updateActor(a, env);
  }
}

// ---------- wild animals (wild.js) ----------

// Who's passing through changes with the time of day and the weather. Ones
// still around keep where they are.
function syncWild(g, jar) {
  const place = jar === 'forest' ? 'meadow' : jar;
  const key = [place, g.today, timeBlock(g.hour), g.weather, !!g.wx?.rainbow, !!g.wx?.frost, !!g.wx?.puddles].join('|');
  if (key === g.wildKey) return;
  g.wildKey = key;
  const season = g.scene === 'map' ? MAPS[g.mapId].season : g.season;
  const defs = wildVisitors(g.state.seed, g.today, place, { season, hour: g.hour, weather: g.weather, wx: g.wx });
  const open = jar === 'forest' ? forageTiles() : mapOpenTiles(MAPS[jar]).filter(t => t.c > 1);
  const spots = shuffle(rngFor(g.state.seed, 'wild-spots', place, g.today, timeBlock(g.hour)), open);
  const objs = objectsHere(g);
  const old = new Map((g.wild || []).map(a => [a.def.id, a]));
  g.wild = defs.map((def, i) => {
    if (old.has(def.id)) return old.get(def.id);
    let a = makeActor(def, spots[i % spots.length], g.t);
    if (def.water) {
      const water = objs.filter(o => o.id === def.water).flatMap(tilesOf);
      if (water.length) a = Object.assign(makeActor(def, water[(i * 5) % water.length], g.t), { waterTiles: water });
    }
    return a;
  });
}

// Spotting a wild animal you walked up to.
export function spotWild(g, a) {
  const def = a.def;
  const got = spotAnimal(g.state, def.id, g.today);
  if (!got) return toast(`You've already spotted the ${def.name.toLowerCase()} today.`);
  g.save();
  updateHud(g);
  if (got.first) toast(`New in your wildlife journal: ${def.name}! +${got.pebbles} pebbles.`);
  else toast(`You spotted the ${def.name.toLowerCase()} again (${got.count} times now).`);
  g.effects.push({ kind: 'heart', x: a.x, y: a.y - 20, t0: g.t });
}

export function critterAt(g, x, y) {
  return [...(g.critters || []), ...(g.wild || [])].find(a => !a.hidden && !['hide', 'climb'].includes(a.pose)
    && Math.abs(x - a.x) < 10 && y > a.y - (a.z || 0) - 20 && y < a.y - (a.z || 0) + 4);
}

export function openCritter(g, a) {
  const def = a.def;
  const s = g.state;
  const points = pointsFor(S.critters, def.id);
  const hearts = heartsOf(points);
  const done = s.daily.critters?.[def.id] || {};
  const together = partnerNear(g, a.c, a.r);
  const line = def.lines[(g.critterTalk = (g.critterTalk || 0) + 1) % def.lines.length];
  const food = [...new Set(s.bag.map(sl => sl.id))].filter(id => ITEMS[id] && ['crop', 'produce', 'fish', 'forage', 'dish'].includes(ITEMS[id].cat));
  food.sort((p, q) => (def.likes.includes(q) ? 1 : 0) - (def.likes.includes(p) ? 1 : 0));
  const toNext = hearts >= MAX_HEARTS ? '' : ` · ${POINTS_PER_HEART - (points % POINTS_PER_HEART)} to the next heart`;
  const gift = !done.gift && hearts >= 3;
  const plush = hearts >= MAX_HEARTS && !s.keepsakes?.[def.id];
  openSheet(`${def.name} the ${def.species}`, `
    <p class="detail">${esc(line)}</p>
    ${INFO[def.id] ? `<p class="detail">${INFO[def.id](g)}</p>` : ''}
    <p class="detail small">${esc(def.name)} ${esc(BEHAVIOR_TEXT[def.behavior] || 'potters about')}.</p>
    <p class="detail">Friendship: ${'♥'.repeat(hearts)}${'♡'.repeat(MAX_HEARTS - hearts)}${toNext}. You both make it grow.</p>
    ${together ? `<p class="detail small">${esc(nameOf(partnerId()))} is here too. Everything counts a little more together.</p>` : ''}
    <div class="row-actions">
      <button class="btn" data-act="pet" ${done.pet ? 'disabled' : ''}>${def.person ? 'Chat' : 'Pet'}</button>
      <button class="btn" data-act="play" ${done.play ? 'disabled' : ''}>${def.person ? (def.tag ? 'Play tag' : 'Help out') : 'Play'}</button>
    </div>
    <h3>${def.person ? 'Give a gift' : 'Give a treat'}${done.treat ? ' (done for today)' : ''}</h3>
    <p class="detail small">${esc(def.name)} loves ${def.likes.map(id => esc(ITEMS[id]?.name.toLowerCase() || id)).join(' and ')}.</p>
    ${done.treat ? '' : food.length ? `<div class="bag-grid">${food.slice(0, 12).map(id => `<button class="slot" data-treat="${id}" aria-label="${esc(ITEMS[id].name)}">${icon(id)}${def.likes.includes(id) ? '<span class="count">♥</span>' : ''}</button>`).join('')}</div>` : '<p class="detail">You have nothing to eat in your bag.</p>'}
    ${gift ? `<div class="row-actions"><button class="btn" id="gift">${esc(def.name)} has something for you</button></div>` : ''}
    ${plush ? `<div class="row-actions"><button class="btn" id="plush">A keepsake from ${esc(def.name)}</button></div>` : ''}`, body => {
    const act = (action, itemId) => {
      const res = befriend(s, def, action, { itemId, together: partnerNear(g, a.c, a.r) });
      if (!res.ok) return toast(res.reason);
      const key = `${def.id}--${cloud.me}`;
      const doc = { points: (S.critters[key]?.points || 0) + res.points, at: now() };
      S.critters[key] = doc;
      setDoc(`critters/${key}`, doc).catch(() => {});
      g.save();
      const words = { pet: def.person ? `You chat with ${def.name}.` : `You pet ${def.name}.`, play: def.person ? `You spend some time with ${def.name}.` : `You play with ${def.name}.`, treat: res.liked ? `${def.name} loves it!` : `${def.name} nibbles it politely.` };
      toast(`${words[action]} +${res.points} friendship`);
      g.effects.push({ kind: 'heart', x: a.x, y: a.y - 18, t0: g.t });
      const newHearts = heartsOf(pointsFor(S.critters, def.id));
      if (newHearts > hearts) setTimeout(() => toast(`${def.name}: ${'♥'.repeat(newHearts)}`), 900);
      openCritter(g, a);
    };
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => act(b.dataset.act)));
    body.querySelectorAll('[data-treat]').forEach(b => b.addEventListener('click', () => act('treat', b.dataset.treat)));
    body.querySelector('#gift')?.addEventListener('click', () => {
      const id = dailyGift(s, def, heartsOf(pointsFor(S.critters, def.id)), g.today);
      if (!id) return toast('Your bag is full.');
      g.save();
      toast(`${def.name} gives you ${ITEMS[id].name.toLowerCase()}!`, id);
      openCritter(g, a);
    });
    body.querySelector('#plush')?.addEventListener('click', () => {
      const id = keepsake(s, def, heartsOf(pointsFor(S.critters, def.id)));
      if (!id) return toast('Your bag is full.');
      g.save();
      toast(`A ${def.name} plush! Place it from Build inside your home.`, id);
      openCritter(g, a);
    });
  }, null, () => openCritter(g, a));
}

// ---------- the jar shops ----------

export function openJarShop(g, jar) {
  const shop = SHOPS[jar];
  const s = g.state;
  const rows = shop.stock.map(([id, price], i) => {
    const it = ITEMS[id];
    const note = it.furniture ? 'Furniture for your home. Place it from Build.' : it.text || (it.cat === 'gift' ? 'A gift to give from the Bag.' : it.cat === 'pantry' ? 'For the kitchen.' : it.cat === 'seed' ? 'Seeds for your garden.' : it.cat === 'dish' ? 'Ready to eat.' : '');
    return `<li>${icon(id)}<span class="name">${esc(it.name)}<small>${esc(note)}</small></span>
      <button class="btn small" data-i="${i}" ${s.pebbles < price ? 'disabled' : ''}>Buy · ${price}</button></li>`;
  }).join('');
  openSheet(`${shop.title}`, `
    <p class="detail">${esc(shop.keeper)} the ${esc(shop.species)}: “${esc(shop.greeting)}”</p>
    <ul class="list">${rows}</ul>
    <p class="detail">You have <strong>${s.pebbles}</strong> pebbles.</p>`, body => {
    body.querySelectorAll('[data-i]').forEach(b => b.addEventListener('click', () => {
      const res = buyFromJarShop(s, jar, +b.dataset.i);
      if (!res.ok) return toast(res.reason || 'You can\'t buy that.');
      g.save();
      toast(`Bought ${ITEMS[res.id].name}.`, res.id);
      openJarShop(g, jar);
    }));
  });
}

// ---------- special spots ----------

export function runSpot(g, spot) {
  const s = g.state;
  const together = partnerNear(g, spot.c, spot.r, 3);
  const res = useSpot(s, spot, { day: g.today, hour: g.hour, together });
  if (!res.ok) return toast(res.reason);
  if (res.pebbles) s.pebbles += res.pebbles;
  if (res.heal) s.hp = R.maxHp(s);
  g.save();
  g.player.pose = ['rink', 'swing', 'vine', 'bounce'].includes(spot.spot) ? 'swing' : ['hot_spring', 'igloo', 'star_bench'].includes(spot.spot) ? 'sit' : 'crouch';
  g.poseUntil = g.t + 1.2;
  if (spot.spot === 'bounce') g.effects.push({ kind: 'sparkle', x: g.player.x, y: g.player.y - 24, t0: g.t });
  if (res.moment) {
    saveMoment(g, res.moment);
    g.effects.push({ kind: 'heart', x: g.player.x, y: g.player.y - 22, t0: g.t });
  }
  const extras = [res.pebbles ? `+${res.pebbles} pebbles` : '', res.heal ? 'Health restored' : '', ...res.items.map(d => `+${d.n} ${ITEMS[d.id].name}`)].filter(Boolean);
  if (['bottle', 'telescope', 'sunset', 'star_bench', 'fairy_ring'].includes(spot.spot) || res.letter) {
    openSheet(spot.name, `<p class="detail">${esc(res.text)}</p>${extras.length ? `<p class="detail small">${esc(extras.join(' · '))}</p>` : ''}
      ${spot.spot === 'telescope' ? `<p class="detail small">${(s.constellations || []).length} of ${CONSTELLATIONS.length} constellations found.</p>` : ''}
      ${spot.spot === 'bottle' ? `<p class="detail small">${(s.letters || []).length} letters found so far.</p>` : ''}`);
  } else toast(`${res.text}${extras.length ? ' ' + extras.join(' · ') : ''}`, res.items[0]?.id);
  updateHud(g);
}

export function spotHint(spot) {
  return SPOT_TEXT[spot.spot] || spot.name;
}

export function digAt(g, index) {
  const res = dig(g.state, g.mapDaily, index);
  if (!res) return;
  g.player.pose = 'crouch';
  g.poseUntil = g.t + 0.6;
  g.save();
  if (res.full) toast('Your bag is full.');
  else if (res.pebbles) toast(`You dig up a little pouch: +${res.pebbles} pebbles!`);
  else toast(`You dig up ${ITEMS[res.id].name.toLowerCase()}!`, res.id);
  updateHud(g);
}
