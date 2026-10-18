// Little Us terrarium: game loop, input and the actions for each place in the jar.
import * as R from './rules.js';
import { ITEMS, ROD_ZONE, MINE_LAYERS, FORAGE } from './data.js';
import { dayNumber, seasonOf, weatherOf, isNightHour, partOfDay, deviceTimeZone } from './clock.js';
import { isWalkable, inBounds, objectAt, bedAt, footprintTiles, OBJECTS, START_TILE, tileKey, BEDS } from './world.js';
import { pathTo, pathNextTo } from './path.js';
import { drawScene, tileCenter, pointToTile, W, H } from './scene.js';
import { loadOverrides, clearIconURLs } from './sprites.js';
import { DIRS } from './avatar.js';
import * as UI from './ui.js';
import { C, loadContent, weekOf } from './content.js';
import { cloud, connect, setDoc, privatePath } from './cloud.js';
import { S, startShared, onShared, partnerId, saveBed, shareLook, rainingNow } from './shared.js';
import { adopted, makeResident, updateResident, startMotion, adopt } from './animals.js';
import { FLAT_DECOR } from './sprites-more.js';
import * as T from './together.js';
import { openBuild, placeDecor, openAnimal, openMore } from './places.js';
import { openHangout, startHangout } from './hangout.js';

const SAVE_KEY = 'little-us-terrarium';
const SPEED = 52; // pixels per second
const FEET = 5; // feet sit a little below the tile centre

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const debug = location.hash === '#debug';
let g;

// ---------- saving ----------

function loadSave() {
  try {
    return JSON.parse(localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

let cloudTimer = null;
function save() {
  g.state.savedAt = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(g.state));
  } catch {
    // Storage can be blocked (private windows). The game still plays.
  }
  // Your own progress also follows you to your other devices.
  if (cloud.mode === 'cloud') {
    clearTimeout(cloudTimer);
    cloudTimer = setTimeout(() => setDoc(privatePath('game'), { state: g.state, savedAt: g.state.savedAt }).catch(() => {}), 1500);
  }
  shareLook(g.state.avatar);
}

function newSeed() {
  return Math.random().toString(36).slice(2, 10);
}

// ---------- time ----------

function refreshClock() {
  g.date = new Date();
  const hour = g.debugHour ?? g.date.getHours();
  g.today = dayNumber(g.date, S.world?.timeZone) + (g.state.dayOffset || 0);
  g.season = seasonOf(g.today);
  g.weather = rainingNow() ? (g.season === 'winter' ? 'snow' : 'rain') : weatherOf(g.state.seed, g.today);
  g.hour = hour;
  g.night = isNightHour(hour);
  g.part = partOfDay(hour);
  g.unreadMail = g.state.mailRead !== g.today || (C.ready && T.unreadNotes(g) > 0);
  const week = weekOf(g.today);
  g.boardNew = C.ready && S.missions[`${week}--${cloud.me}`]?.state !== 'done';
  g.wellLights = Math.min(2, Object.keys(S.discoveries['old-well']?.lights || {}).length);
}

function checkNewDay() {
  refreshClock();
  const events = R.rollover(g.state, g.today);
  if (g.scene === 'jar') {
    if (g.night) T.noticeDiscovery('firefly-grove');
    if (g.weather === 'rain') T.noticeDiscovery('rain-pool');
  }
  if (!events.length && g.state.daily.day === g.today && g.lastDay === g.today) return;
  g.lastDay = g.today;
  if (g.scene === 'mine') leaveMine();
  for (const e of events) {
    if (e.type === 'payout') UI.toast(`Good morning! The crate paid ${e.amount} pebbles.`);
    if (e.type === 'rain-watered') {
      UI.toast('The rain watered your garden.');
      g.state.garden.forEach((bed, i) => { if (bed.crop) saveSharedBed(i); });
    }
  }
  save();
}

// ---------- shared garden ----------

function saveSharedBed(i) {
  if (cloud.mode === 'cloud') saveBed(i, g.state.garden[i]);
}

function pullGarden() {
  if (cloud.mode !== 'cloud') return;
  const beds = Object.keys(S.garden);
  if (!beds.length) {
    // First person to connect brings their garden along.
    g.state.garden.forEach((bed, i) => { if (bed.crop) saveSharedBed(i); });
    return;
  }
  BEDS.forEach((b, i) => {
    const doc = S.garden['bed-' + i];
    g.state.garden[i] = doc ? { crop: doc.crop ?? null, count: doc.count || 0, last: doc.last ?? -1 } : { crop: null, count: 0, last: -1 };
  });
}

// ---------- player movement ----------

function placePlayer(c, r) {
  const p = tileCenter(c, r);
  Object.assign(g.player, { c, r, x: p.x, y: p.y + FEET, path: [], onArrive: null, pose: 'walk', frame: 0 });
}

function walkable(c, r) {
  if (g.scene === 'mine') {
    if (!inBounds(c, r)) return false;
    return !g.rocks.some(rock => rock.c === c && rock.r === r && !g.mineBroken.has(rock.id));
  }
  return isWalkable(c, r, g.decorBlocked);
}

function walkPath(path, onArrive) {
  cancelAction();
  if (!path) {
    UI.toast("You can't get there.");
    return;
  }
  g.player.path = path;
  g.player.onArrive = onArrive || null;
  g.player.pose = 'walk';
  if (!path.length && onArrive) {
    g.player.onArrive = null;
    onArrive();
  }
}

function from() {
  return { c: g.player.c, r: g.player.r };
}

function walkTo(c, r, onArrive) {
  walkPath(pathTo(walkable, from(), { c, r }), onArrive);
}

function walkNextTo(tiles, onArrive) {
  walkPath(pathNextTo(walkable, from(), tiles), () => {
    face(tiles);
    if (onArrive) onArrive();
  });
}

function face(tiles) {
  const cx = tiles.reduce((s, t) => s + t.c, 0) / tiles.length;
  const cy = tiles.reduce((s, t) => s + t.r, 0) / tiles.length;
  const dx = cx - g.player.c, dy = cy - g.player.r;
  if (Math.abs(dx) > Math.abs(dy)) g.player.dir = dx < 0 ? DIRS.left : DIRS.right;
  else g.player.dir = dy < 0 ? DIRS.up : DIRS.down;
}

function updatePlayer(dt) {
  const p = g.player;
  if (!p.path.length) return;
  const next = p.path[0];
  const target = tileCenter(next.c, next.r);
  const tx = target.x, ty = target.y + FEET;
  const dx = tx - p.x, dy = ty - p.y;
  const dist = Math.hypot(dx, dy);
  const step = SPEED * dt;
  if (Math.abs(dx) > Math.abs(dy) + 0.5) p.dir = dx < 0 ? DIRS.left : DIRS.right;
  else if (Math.abs(dy) > 0.5) p.dir = dy < 0 ? DIRS.up : DIRS.down;
  p.walked = (p.walked || 0) + Math.min(step, dist);
  p.frame = Math.floor(p.walked / 5) % 4;
  if (dist <= step) {
    p.x = tx;
    p.y = ty;
    p.c = next.c;
    p.r = next.r;
    p.path.shift();
    if (!p.path.length) {
      p.frame = 0;
      const done = p.onArrive;
      p.onArrive = null;
      if (done) done();
    }
  } else {
    p.x += (dx / dist) * step;
    p.y += (dy / dist) * step;
  }
}

// ---------- your partner, live ----------

let lastPresence = '';
function sendPresence() {
  const room = cloud.room;
  if (!room) return;
  const p = g.player;
  const data = { scene: g.scene, layer: g.layer, x: Math.round(p.x), y: Math.round(p.y), dir: p.dir, frame: p.frame, pose: p.pose, look: g.state.avatar, uid: cloud.me };
  const key = JSON.stringify(data);
  if (key === lastPresence) return;
  lastPresence = key;
  room.presence(data).catch(() => {});
}

function readOthers() {
  const room = cloud.room;
  if (!room) { g.others = []; return; }
  const out = [];
  const seen = new Set();
  for (const peer of room.peers()) {
    if (peer.isMe || peer.kind !== 'viewer') continue;
    const pr = peer.presence || {};
    if (typeof pr.x !== 'number' || typeof pr.y !== 'number' || !pr.look) continue;
    const id = peer.by || pr.uid || peer.peer;
    if (seen.has(id)) continue;
    seen.add(id);
    // Glide toward the latest position instead of jumping.
    const prev = g.others.find(o => o.id === id);
    const o = prev || { id, x: pr.x, y: pr.y };
    Object.assign(o, {
      tx: Math.max(0, Math.min(W, pr.x)), ty: Math.max(0, Math.min(H, pr.y)), dir: pr.dir | 0, frame: pr.frame | 0,
      pose: ['walk', 'sit', 'cast', 'swing', 'crouch'].includes(pr.pose) ? pr.pose : 'walk',
      scene: pr.scene === 'mine' ? 'mine' : 'jar', layer: pr.layer | 0, look: cleanLook(pr.look),
    });
    out.push(o);
  }
  g.others = out;
  const hereNow = out.length > 0;
  const chip = document.querySelector('#partner');
  if (chip) {
    chip.hidden = !hereNow;
    chip.textContent = hereNow ? `${T.nameOf(out[0].id)} is here` : '';
  }
}

function cleanLook(l) {
  const n = (v, max) => Math.max(0, Math.min(max, v | 0));
  return { skin: n(l.skin, 4), hairStyle: n(l.hairStyle, 5), hairColor: n(l.hairColor, 6), outfit: n(l.outfit, 5), outfitStyle: n(l.outfitStyle, 2) };
}

function updateOthers(dt) {
  for (const o of g.others) {
    o.x += (o.tx - o.x) * Math.min(1, dt * 10);
    o.y += (o.ty - o.y) * Math.min(1, dt * 10);
  }
}

// ---------- residents ----------

function syncResidents() {
  const want = adopted();
  g.residents = g.residents.filter(a => want.includes(a.species));
  for (const sp of want) if (!g.residents.some(a => a.species === sp)) g.residents.push(makeResident(sp));
}

function animalReacts(a, motion, actionId) {
  startMotion(a, motion, g.t);
  const x = a.x, y = a.y - 14;
  if (motion === 'notes') for (let i = 0; i < 3; i++) g.effects.push({ kind: 'note', x: x + i * 4 - 4, y: y - i * 3, t0: g.t + i * 0.15 });
  else if (motion === 'bubbles') for (let i = 0; i < 4; i++) g.effects.push({ kind: 'bubble', x: x + i * 3 - 5, y, t0: g.t + i * 0.12 });
  else g.effects.push({ kind: 'heart', x, y, t0: g.t });
  if ((actionId === 'dig' || actionId === 'forage') && Math.random() < 0.35) {
    const pool = FORAGE.filter(f => f.season === g.season && !f.rare);
    const find = pool[Math.floor(Math.random() * pool.length)];
    if (find && R.addItem(g.state, find.id, 1)) {
      save();
      popItem(find.id, x, y);
      UI.toast(`${S.animals[a.species]?.name || 'Your friend'} found a ${find.name.toLowerCase()} for you!`, find.id);
    }
  }
}

// ---------- effects ----------

function popItem(id, x, y) {
  g.effects.push({ kind: 'item', id, x, y, t0: g.t });
}

function gained(id, n = 1) {
  popItem(id, g.player.x, g.player.y - 26);
  UI.toast(`+${n} ${ITEMS[id].name}`, id);
}

// ---------- jar actions ----------

function residentAt(x, y) {
  return g.residents.find(a => !a.hidden && Math.hypot(x - a.x, y - a.y + 4) < 12);
}

function tapJar(c, r, x, y) {
  if (g.build) return placeTap(c, r);
  // Animals
  const a = residentAt(x, y);
  if (a) {
    const near = a.inWater ? footprintTiles(OBJECTS.find(o => o.id === 'pond')) : [{ c: a.c, r: a.r }];
    walkNextTo(near, () => openAnimal(g, a));
    return;
  }
  // Forage
  const fi = g.state.daily.forage.findIndex((f, i) => f.c === c && f.r === r && !g.state.daily.picked.includes(i));
  if (fi >= 0 && walkable(c, r)) {
    walkTo(c, r, () => {
      const id = R.pickForage(g.state, fi);
      if (id) {
        save();
        gained(id);
        if (id === 'morel' || id === 'chanterelle') T.noticeDiscovery('mushroom-ring');
      } else UI.toast('Your bag is full.');
    });
    return;
  }
  // Garden bed
  const bi = bedAt(c, r);
  if (bi >= 0) {
    walkNextTo([{ c, r }], () => useBed(bi));
    return;
  }
  // Decorations
  const deco = g.decor.find(d => d.c === c && d.r === r);
  if (deco && !FLAT_DECOR.has(deco.type)) {
    walkNextTo([{ c, r }], () => {
      if (deco.type === 'log') T.noticeDiscovery('hollow-log');
      else UI.toast(C.decorByType[deco.type]?.name || 'A decoration');
    });
    return;
  }
  // Places
  const o = objectAt(c, r);
  if (o) {
    if (o.walkable) walkTo(o.c, o.r, () => useObject(o));
    else walkNextTo(footprintTiles(o), () => useObject(o));
    return;
  }
  if (inBounds(c, r)) walkTo(c, r);
}

function useBed(i) {
  const bed = g.state.garden[i];
  const stage = R.bedStage(bed, g.today);
  crouch();
  if (stage < 0) {
    UI.openSeedPicker(g, i, seed => {
      saveSharedBed(i);
      UI.toast(`Planted ${ITEMS[seed].name.replace(' seeds', '')}. Water it every day.`, seed);
    });
  } else if (stage === 3) {
    const id = R.harvestBed(g.state, i, g.today);
    if (id) {
      save();
      saveSharedBed(i);
      gained(id);
      T.noticeDiscovery('seed-garden');
    } else UI.toast('Your bag is full.');
  } else if (R.waterBed(g.state, i, g.today)) {
    save();
    saveSharedBed(i);
    UI.toast('Watered. It will grow overnight.');
  } else UI.toast('Already watered today. Come back tomorrow.');
}

function crouch() {
  g.player.pose = 'crouch';
  g.poseUntil = g.t + 0.5;
}

function ready() {
  if (C.ready && S.ready) return true;
  UI.toast('The jar is still waking up. Try again in a moment.');
  return false;
}

function useObject(o) {
  switch (o.id) {
    case 'tent': return UI.openWardrobe(g);
    case 'mailbox': return ready() && T.openMailbox(g, UI.letters(g));
    case 'crate': return UI.openCrate(g);
    case 'workbench': return UI.openWorkbench(g);
    case 'stall': return UI.openShop(g);
    case 'board': return ready() && T.openBoard(g);
    case 'well': return ready() && T.openDreams(g);
    case 'easel': return ready() && T.openCalendar(g);
    case 'picnic':
      g.player.pose = 'sit';
      g.player.dir = DIRS.down;
      if (!ready()) return;
      T.noticeDiscovery('picnic-oak');
      return openHangout(g);
    case 'tree': {
      const got = R.shakeTree(g.state, g.today);
      if (got) {
        save();
        gained(got.id, got.n);
      } else UI.toast(g.state.daily.shook ? 'No more fruit today. It grows back overnight.' : 'Your bag is full.');
      return;
    }
    case 'bench':
      g.player.pose = 'sit';
      g.player.dir = DIRS.down;
      return ready() && T.openToday(g);
    case 'pond': return startFishing(o);
    case 'cave':
      if (g.state.mine.deepest >= 11) return UI.openElevator(g, enterMine);
      return enterMine(1);
  }
}

// ---------- building ----------

function decorTaken(c, r, ignoreId) {
  return g.decor.some(d => d.id !== ignoreId && d.c === c && d.r === r);
}

function startPlacing(opts) {
  g.build = { ...opts, ghost: null };
  document.querySelector('#btn-cancel').hidden = false;
  UI.toast(`Tap a free spot for the ${(C.decorByType[opts.type]?.name || 'decoration').toLowerCase()}, then tap it again to place it.`);
}

function stopPlacing() {
  g.build = null;
  document.querySelector('#btn-cancel').hidden = true;
}

function placeTap(c, r) {
  const b = g.build;
  const forage = g.state.daily.forage.some((f, i) => f.c === c && f.r === r && !g.state.daily.picked.includes(i));
  const ok = isWalkable(c, r) && !decorTaken(c, r, b.moveId) && !forage && !(g.player.c === c && g.player.r === r);
  if (b.ghost && b.ghost.c === c && b.ghost.r === r && ok) {
    if (placeDecor(g, b, c, r)) UI.toast(b.moveId ? 'Moved.' : 'Placed!');
    stopPlacing();
    return;
  }
  b.ghost = { type: b.type, c, r, ok };
  if (!ok) UI.toast('That spot is taken. Try an open patch of grass.');
}

function syncDecor() {
  g.decor = Object.entries(S.decor).map(([id, d]) => ({ id, type: d.type, c: d.c | 0, r: d.r | 0 })).filter(d => C.decorByType[d.type]);
  g.decorBlocked = new Set(g.decor.filter(d => !FLAT_DECOR.has(d.type)).map(d => tileKey(d.c, d.r)));
}

// ---------- fishing ----------

function startFishing(pond) {
  if (g.state.daily.bites <= 0) {
    UI.toast('The fish have stopped biting today. Try again tomorrow.');
    return;
  }
  const px0 = 24 + pond.c * 16, py0 = 100 + pond.r * 16;
  const pw = pond.w * 16, ph = pond.h * 16;
  const cx = px0 + pw / 2, cy = py0 + ph / 2;
  let bx = Math.min(Math.max(g.player.x, px0 + 10), px0 + pw - 10);
  let by = Math.min(Math.max(g.player.y - 6, py0 + 10), py0 + ph - 14);
  bx += Math.sign(cx - bx) * 10;
  by += Math.sign(cy - by) * 6;
  g.player.pose = 'cast';
  g.fishing = { phase: 'cast', t: 0, bobber: { x: Math.round(bx), y: Math.round(by) }, wait: 1.2 + Math.random() * 3 };
}

function endFishing(message, iconId) {
  g.fishing = null;
  g.player.pose = 'walk';
  g.hold = false;
  if (message) UI.toast(message, iconId);
}

function tapWhileFishing() {
  const f = g.fishing;
  if (f.phase === 'cast' || f.phase === 'wait') return endFishing('Too soon. Wait for the ! before you tap.');
  if (f.phase !== 'bite') return;
  R.useBite(g.state);
  const c = R.rollCatch(Math.random, g.season, g.hour, g.weather);
  const item = ITEMS[c.id];
  if (item.cat === 'junk') {
    const n = R.addItem(g.state, c.id, 1);
    save();
    if (n) popItem(c.id, f.bobber.x, f.bobber.y - 8);
    return endFishing(n ? `You reeled in a ${item.name.toLowerCase()}.` : 'Your bag is full.', c.id);
  }
  f.phase = 'reel';
  f.catch = c;
  f.game = {
    zone: ROD_ZONE[g.state.tools.rod] / 160,
    zoneY: 0.25, zoneV: 0,
    fishY: 0.4, fishTarget: 0.5, timer: 0,
    progress: 0.3, overlap: false, difficulty: item.difficulty,
  };
}

function updateFishing(dt) {
  const f = g.fishing;
  if (!f) return;
  f.t += dt;
  if (f.phase === 'cast' && f.t > 0.5) Object.assign(f, { phase: 'wait', t: 0 });
  else if (f.phase === 'wait' && f.t > f.wait) {
    Object.assign(f, { phase: 'bite', t: 0 });
    if (navigator.vibrate) try { navigator.vibrate(40); } catch { /* not allowed */ }
  } else if (f.phase === 'bite' && f.t > 1.0) {
    R.useBite(g.state);
    save();
    endFishing('It got away. Tap as soon as you see the !');
  } else if (f.phase === 'reel') {
    const m = f.game;
    m.zoneV += (g.hold ? 2.2 : -1.7) * dt;
    m.zoneV *= Math.pow(0.35, dt);
    m.zoneY += m.zoneV * dt;
    if (m.zoneY < 0) { m.zoneY = 0; m.zoneV = 0; }
    if (m.zoneY > 1 - m.zone) { m.zoneY = 1 - m.zone; m.zoneV = 0; }
    m.timer -= dt;
    if (m.timer <= 0) {
      m.fishTarget = 0.05 + Math.random() * 0.9;
      m.timer = 0.35 + Math.random() * (1.7 - m.difficulty * 0.25);
    }
    m.fishY += (m.fishTarget - m.fishY) * Math.min(1, dt * (0.8 + m.difficulty * 0.7));
    m.overlap = m.fishY >= m.zoneY && m.fishY <= m.zoneY + m.zone;
    m.progress += m.overlap ? 0.3 * dt : -(0.1 + 0.035 * m.difficulty) * dt;
    if (m.progress >= 1) landFish(f);
    else if (m.progress <= 0) endFishing('The fish slipped away.');
  }
}

function landFish(f) {
  const { id, size } = f.catch;
  const item = ITEMS[id];
  if (!R.addItem(g.state, id, 1)) return endFishing('Your bag is full, so you let it go.');
  const isNew = !g.state.log.fish[id];
  const record = R.recordCatch(g.state, id, size);
  save();
  popItem(id, f.bobber.x, f.bobber.y - 8);
  const note = isNew ? ' New to your log!' : record ? ' A new record!' : '';
  endFishing(`You caught a ${item.name.toLowerCase()}! ${size} cm.${note}`, id);
  const caught = Object.values(g.state.log.fish).reduce((s, e) => s + e.count, 0);
  if (caught >= 5) T.noticeDiscovery('spring');
}

// ---------- mine ----------

function enterMine(layer) {
  closeSheetQuietly();
  g.scene = 'mine';
  g.layer = layer;
  g.rocks = R.layerRocks(g.state.seed, g.today, layer);
  g.mineBroken = new Set(R.layerState(g.state, layer).broken);
  g.hits = new Map();
  R.reachLayer(g.state, layer);
  save();
  placePlayer(R.MINE_START.c, R.MINE_START.r);
  UI.updateHud(g);
  T.noticeDiscovery('moon-cave');
  if (layer >= 21) T.noticeDiscovery('crystal-pool');
}

function leaveMine() {
  cancelAction();
  g.scene = 'jar';
  const cave = OBJECTS.find(o => o.id === 'cave');
  placePlayer(cave.c, cave.r - 1);
  UI.updateHud(g);
}

function tapMine(c, r) {
  if (c === R.MINE_ENTRY.c && r === R.MINE_ENTRY.r) {
    walkTo(c, r, leaveMine);
    return;
  }
  const rock = g.rocks.find(k => k.c === c && k.r === r);
  if (rock && !g.mineBroken.has(rock.id)) {
    walkNextTo([{ c, r }], () => { g.action = { kind: 'mine', rock, timer: 0 }; });
    return;
  }
  if (rock && rock.ladder) {
    walkTo(c, r, () => {
      if (g.layer >= MINE_LAYERS) return;
      enterMine(g.layer + 1);
      if (g.layer === MINE_LAYERS) UI.toast('You reached the bottom of the jar!');
    });
    return;
  }
  if (inBounds(c, r)) walkTo(c, r);
}

function updateAction(dt) {
  const a = g.action;
  if (!a) return;
  a.timer -= dt;
  if (a.timer > 0) return;
  const rock = a.rock;
  const done = (g.hits.get(rock.id) || 0) + 1;
  g.hits.set(rock.id, done);
  g.player.pose = 'swing';
  g.player.frame = done % 2;
  g.shakeRock = rock.id;
  a.timer = 0.32;
  if (done < R.rockHits(rock, g.state.tools.pick)) return;
  g.action = null;
  g.shakeRock = null;
  g.player.pose = 'walk';
  g.player.frame = 0;
  const got = R.breakRock(g.state, g.layer, rock);
  g.mineBroken.add(rock.id);
  save();
  const p = tileCenter(rock.c, rock.r);
  for (const d of got || []) popItem(d.id, p.x, p.y - 6);
  if (got && got.length) {
    const best = got[got.length - 1];
    UI.toast(`+${best.n} ${ITEMS[best.id].name}`, best.id);
  } else if (got) UI.toast('Your bag is full.');
  if (rock.ladder) UI.toast(g.layer < MINE_LAYERS ? 'You found a ladder down! Tap it to go deeper.' : 'This is the bottom.');
}

function cancelAction() {
  if (g.action) {
    g.action = null;
    g.shakeRock = null;
  }
  if (g.player.pose !== 'walk') g.player.pose = 'walk';
}

function closeSheetQuietly() {
  if (UI.sheetOpen()) UI.closeSheet();
}

// ---------- input ----------

function canvasPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: ((e.clientX - rect.left) / rect.width) * W, y: ((e.clientY - rect.top) / rect.height) * H };
}

function onPointerDown(e) {
  if (e.button > 0) return;
  if (g.fishing) {
    e.preventDefault();
    if (g.fishing.phase === 'reel') g.hold = true;
    else tapWhileFishing();
    return;
  }
  const { x, y } = canvasPoint(e);
  const { c, r } = pointToTile(x, y);
  if (g.scene === 'mine') tapMine(c, r);
  else tapJar(c, r, x, y);
}

function onPointerUp() {
  g.hold = false;
}

function onKey(e) {
  if (UI.sheetOpen()) {
    if (e.key === 'Escape') UI.closeSheet();
    return;
  }
  if (e.key === 'Escape' && g.build) {
    stopPlacing();
    return;
  }
  if (e.key === ' ' || e.key === 'Enter') {
    if (g.fishing) {
      e.preventDefault();
      if (e.type === 'keydown' && !e.repeat) {
        if (g.fishing.phase === 'reel') g.hold = true;
        else tapWhileFishing();
      }
    }
    return;
  }
  const move = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key];
  if (move && !g.fishing && !g.player.path.length) {
    e.preventDefault();
    const c = g.player.c + move[0], r = g.player.r + move[1];
    if (walkable(c, r)) walkTo(c, r);
    else g.player.dir = move[0] < 0 ? DIRS.left : move[0] > 0 ? DIRS.right : move[1] < 0 ? DIRS.up : DIRS.down;
  }
}

// ---------- layout ----------

function fitCanvas() {
  const stage = document.querySelector('#stage');
  const box = stage.getBoundingClientRect();
  let scale = Math.min(box.width / W, box.height / H);
  if (scale >= 2) scale = Math.floor(scale);
  canvas.style.width = Math.floor(W * scale) + 'px';
  canvas.style.height = Math.floor(H * scale) + 'px';
  // Draw at a whole-number multiple of the screen's pixels so the art stays crisp.
  const backing = Math.max(1, Math.round(scale * (window.devicePixelRatio || 1)));
  if (canvas.width !== W * backing) {
    canvas.width = W * backing;
    canvas.height = H * backing;
  }
  ctx.setTransform(backing, 0, 0, backing, 0, 0);
  ctx.imageSmoothingEnabled = false;
}

// ---------- loop ----------

let last = 0;
let clockTimer = 0;
let presenceTimer = 0;

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000 || 0);
  last = now;
  g.t += dt;
  clockTimer -= dt;
  if (clockTimer <= 0) {
    clockTimer = 2;
    checkNewDay();
    UI.updateHud(g);
  }
  presenceTimer -= dt;
  if (presenceTimer <= 0) {
    presenceTimer = 0.1;
    sendPresence();
    readOthers();
  }
  if (g.poseUntil && g.t > g.poseUntil) {
    g.poseUntil = 0;
    if (g.player.pose === 'crouch') g.player.pose = 'walk';
  }
  updatePlayer(dt);
  updateOthers(dt);
  if (g.scene === 'jar') {
    const ctxRes = { night: g.night, player: { c: g.player.c, r: g.player.r }, blocked: g.decorBlocked };
    for (const a of g.residents) updateResident(a, dt, g.t, ctxRes);
  }
  updateFishing(dt);
  updateAction(dt);
  g.effects = g.effects.filter(e => g.t - e.t0 < 1.3);
  drawScene(ctx, g);
  requestAnimationFrame(frame);
}

// ---------- start ----------

async function bootShared() {
  try {
    await loadContent();
  } catch {
    UI.toast('Could not load the questions and missions. Reload to try again.');
    return;
  }
  await connect();
  if (cloud.mode === 'cloud') {
    // Pick up your progress from another device if it's newer.
    const snap = await cloud.db.doc(privatePath('game')).get().catch(() => null);
    const remote = snap?.exists ? snap.data() : null;
    if (remote?.state && (remote.savedAt || 0) > (g.state.savedAt || 0)) {
      g.state = R.migrate(remote.state, remote.state.seed, g.today);
    }
  }
  onShared(kind => {
    if (kind === 'world' || kind === 'ready') adoptWorldSeed();
    if (kind === 'garden') pullGarden();
    if (kind === 'decor' || kind === 'ready') syncDecor();
    if (kind === 'animals' || kind === 'ready') syncResidents();
    if (kind === 'people') T.refreshNames().then(() => UI.refreshSheet());
    refreshClock();
    UI.updateHud(g);
    UI.refreshSheet();
  });
  await startShared({ seed: g.state.seed, today: g.today, timeZone: deviceTimeZone() });
  cloud.onRoom = room => { if (room) startHangout(room); };
  if (cloud.room) startHangout(cloud.room);
  await T.refreshNames();
  pullGarden();
  // Every new jar starts with one resident.
  setTimeout(() => {
    if (!Object.keys(S.animals).length) adopt('bunny', g.state).then(ok => { if (ok) save(); });
  }, 2500);
  shareLook(g.state.avatar);
  save();
}

// Both partners use the jar's seed, so weather, forage and questions match.
function adoptWorldSeed() {
  const seed = S.world?.seed;
  if (!seed || seed === g.state.seed) return;
  g.state.seed = seed;
  g.state.daily = null;
  checkNewDay();
}

function resetMine() {
  const keep = { avatar: g.state.avatar, seed: g.state.seed, reminder: g.state.reminder, mailSeen: g.state.mailSeen };
  g.state = { ...R.newState(keep.seed, g.today), ...keep, rewards: g.state.rewards };
  R.rollover(g.state, g.today);
  pullGarden();
  if (g.scene === 'mine') leaveMine();
  save();
}

function start(hotData = {}) {
  const saved = hotData.state || loadSave();
  const seed = saved?.seed || newSeed();
  const today = dayNumber(new Date()) + (saved?.dayOffset || 0);
  g = {
    state: R.migrate(saved, seed, today),
    scene: 'jar', layer: 0, rocks: [], mineBroken: new Set(), hits: new Map(),
    player: { c: START_TILE.c, r: START_TILE.r, x: 0, y: 0, dir: DIRS.down, frame: 0, pose: 'walk', path: [] },
    residents: [], decor: [], decorBlocked: new Set(), others: [], selected: null, build: null,
    fishing: null, action: null, effects: [], hold: false, t: 0, today,
    debugHour: null, save, startPlacing, animalReacts, resetMine,
  };
  placePlayer(START_TILE.c, START_TILE.r);
  checkNewDay();
  UI.updateHud(g);

  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keydown', onKey);
  window.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') g.hold = false; });
  window.addEventListener('resize', fitCanvas);
  if (window.ResizeObserver) new ResizeObserver(fitCanvas).observe(document.querySelector('#stage'));
  fitCanvas();

  const on = (sel, fn) => document.querySelector(sel).addEventListener('click', fn);
  on('#sheet-close', UI.closeSheet);
  on('#btn-bag', () => UI.openBag(g));
  on('#btn-today', () => ready() && T.openToday(g));
  on('#btn-mail', () => ready() && T.openMailbox(g, UI.letters(g)));
  on('#btn-journal', () => ready() && T.openJournal(g));
  on('#btn-build', () => ready() && openBuild(g));
  on('#btn-more', () => ready() && openMore(g));
  on('#btn-leave', leaveMine);
  on('#btn-cancel', stopPlacing);

  if (debug) {
    const tools = document.querySelector('#debug');
    tools.hidden = false;
    tools.querySelector('[data-debug="day"]').addEventListener('click', () => {
      g.state.dayOffset = (g.state.dayOffset || 0) + 1;
      checkNewDay();
      UI.updateHud(g);
    });
    tools.querySelector('[data-debug="night"]').addEventListener('click', () => {
      g.debugHour = g.debugHour == null ? 13 : g.debugHour === 13 ? 22 : null;
      refreshClock();
      UI.updateHud(g);
    });
    tools.querySelector('[data-debug="pebbles"]').addEventListener('click', () => {
      g.state.pebbles += 500;
      save();
      UI.updateHud(g);
    });
  }

  window.claude?.hot?.snapshot?.(() => ({ state: g.state }));
  if (!g.state.avatar.made) UI.openWardrobe(g, true);

  loadOverrides().then(n => {
    if (n) clearIconURLs();
  });
  requestAnimationFrame(frame);
  bootShared();
}

// Lets tests and the browser console look at the running game.
window.littleUs = { get game() { return g; }, S, cloud, C, partnerId };

const hot = window.claude?.hot;
if (hot?.ready) hot.ready(start);
else start(hot?.data ?? {});
