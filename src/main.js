// Little Us terrarium: game loop, input and the actions for each place in the jar.
import * as R from './rules.js';
import { ITEMS, ROD_ZONE, MINE_LAYERS, FORAGE, DAILY_BITES } from './data.js';
import { dayNumber, seasonOf, weatherOf, isNightHour, partOfDay, deviceTimeZone } from './clock.js';
import { COLS, MEADOW_COLS, TILE } from './world.js';
import { isWalkable, inBounds, objectAt, bedAt, footprintTiles, OBJECTS, START_TILE, tileKey, BEDS, forageTiles } from './world.js';
import { pathTo, pathNextTo } from './path.js';
import { drawScene, tileCenter, pointToTile, W, H, GX, MEADOW_W, CAM_MIN, CAM_MAX } from './scene.js';
import { loadOverrides, clearIconURLs } from './sprites.js';
import { DIRS } from './avatar.js';
import * as UI from './ui.js';
import { C, loadContent, weekOf } from './content.js';
import { cloud, connect, setDoc, privatePath } from './cloud.js';
import { S, startShared, onShared, partnerId, saveBed, shareLook, rainingNow, sayGoodnight, goodnightsOn } from './shared.js';
import { adopted, makeResident, updateResident, startMotion, adopt } from './animals.js';
import { FLAT_DECOR } from './sprites-more.js';
import * as T from './together.js';
import { openBuild, placeDecor, openAnimal, openMore } from './places.js';
import { openHangout, startHangout } from './hangout.js';
import { DOOR, FURNITURE_BY_TYPE, WALL_BY_TYPE, canPlace, blockedTiles, roomWalkable, tilesOf } from './home.js';
import { openFurnish, ensureFirstRoom, roomsList, placeFurniture } from './home-ui.js';
import { openKitchen, maybeStartPart, maybeFinish, noticeInvite } from './kitchen.js';
import { openCrafting } from './crafting-ui.js';
import { BUG_BY_ID, spawnBugs, timeBlock, alertRate, NOTICE_TILES, catchBug } from './bugs.js';
import { MAPS, mapWalkable, mapObjectAt, mapOpenTiles, mapNear, mapCatch, mapWeather, mapDaily } from './maps.js';
import { openTravel } from './travel.js';
import { openPhone, closePhone, phoneOpen, phoneHasNews } from './phone.js';
import './biomes.js';
import { syncCritters, updateCritters, critterAt, openCritter, openJarShop, runSpot, digAt } from './jar-life.js';
import { makeActor, updateActor } from './behaviors.js';
import { visitorOn, visitorSpot, merchantHere, MERCHANT_SPOT } from './visitors.js';
import { openVisitor, openMerchant } from './visitors-ui.js';
import {
  eventsToday, eventsNow, isOn, EVENT_SPOT, SNOWMAN_SPOT, SNOWMAN_PARTS, snowmanParts, mushroomSpots, FESTIVAL_BITES,
  recordFestivalCatch, spawnMeteor, meteorAt, catchStar, LANTERN_PRIZE,
} from './events.js';
import { openEventStand, eventDocs, countMushroom } from './events-ui.js';
import { MONSTERS } from './mine-data.js';
import { FARM_BY_TYPE } from './farm-data.js';
import { OUTDOOR_BY_TYPE } from './outdoor-data.js';
import { collect as collectFarmItem } from './farm.js';

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
  g.eventsToday = eventsToday(g.today);
  g.events = eventsNow(g.today, hour);
  if (g.eventsToday.some(e => e.id === 'snow')) g.weather = 'snow';
  // Clear skies for lanterns and shooting stars.
  if (g.events.some(e => e.night) && g.weather !== 'snow') g.weather = 'sun';
  if (g.scene === 'map') {
    // Each jar keeps its own season; the weather follows home's unless the jar has its own.
    const map = MAPS[g.mapId];
    g.season = map.season;
    g.weather = mapWeather(map, g.weather);
    // Starlight isle is always night.
    if (map.night) {
      g.night = true;
      g.part = 'night';
    }
    if (g.state.daily) g.mapDaily = mapDaily(g.state, g.mapId, g.today, g.state.seed, DAILY_BITES);
  }
  syncBugs();
  syncVisitors();
  syncEvents();
}

// ---------- seasonal events ----------

function syncEvents() {
  const s = g.state;
  if (!s.daily) return;
  if (isOn(g.today, g.hour, 'festival') && !s.daily.festivalBites) {
    s.daily.festivalBites = true;
    s.daily.bites += FESTIVAL_BITES;
    save();
  }
  const key = [s.seed, g.today, g.eventsToday.map(e => e.id).join()].join('|');
  if (key !== g.eventKey) {
    g.eventKey = key;
    g.mushrooms = [];
    if (isOn(g.today, g.hour, 'mushrooms')) {
      const taken = new Set([...s.daily.forage.map(f => f.c + ',' + f.r), ...g.decorBlocked, ...g.visitors.map(v => v.c + ',' + v.r),
        EVENT_SPOT.c + ',' + EVENT_SPOT.r]);
      g.mushrooms = mushroomSpots(s.seed, g.today, forageTiles(), taken);
    }
  }
  g.lanternCount = eventDocs(g.today, 'lantern').length;
  // Whoever let their lantern go first gets the together prize once the other one does.
  const partner = partnerId();
  if (partner && !s.daily.lanternPrize && S.events[`${g.today}-lantern-${cloud.me}`] && S.events[`${g.today}-lantern-${partner}`]) {
    s.daily.lanternPrize = true;
    s.pebbles += LANTERN_PRIZE;
    save();
    UI.toast(`Your lanterns are up there together. +${LANTERN_PRIZE} pebbles.`);
  }
  g.snowman = g.eventsToday.some(e => e.id === 'snow') && snowmanParts(eventDocs(g.today, 'snow')) >= SNOWMAN_PARTS.length;
  for (const e of g.events) {
    const k = g.today + e.id;
    if (g.eventToasts?.has(k) || g.scene !== 'jar') continue;
    (g.eventToasts ||= new Set()).add(k);
    setTimeout(() => UI.toast(`${e.name}! ${e.blurb}`), 2500);
  }
}

function eventStandAt(x, y) {
  if (!g.eventsToday.length) return false;
  const p = tileCenter(EVENT_SPOT.c, EVENT_SPOT.r);
  return Math.abs(x - p.x) < 12 && y > p.y - 26 && y < p.y + 8;
}

function tapMushroom(c, r) {
  const i = g.mushrooms.findIndex((m, j) => m.c === c && m.r === r && !(g.state.daily.mushrooms || []).includes(j));
  if (i < 0) return false;
  walkTo(c, r, () => {
    const picked = (g.state.daily.mushrooms ||= []);
    if (picked.includes(i)) return;
    const id = g.mushrooms[i].id;
    if (!R.addItem(g.state, id, 1)) return UI.toast('Your bag is full.');
    picked.push(i);
    const n = countMushroom(g.state, g.today);
    save();
    gained(id);
    if (n === 10) UI.toast('Your mushroom basket is full! Trade it at the event stand.');
  });
  return true;
}

function updateMeteors() {
  if (g.scene !== 'jar' || !g.events.some(e => e.id === 'meteors')) {
    g.meteors = [];
    return;
  }
  g.meteors = g.meteors.filter(m => g.t - m.t0 < m.life && !m.caught);
  if (g.t > (g.nextMeteor || 0)) {
    g.meteors.push(spawnMeteor(Math.random, g.t));
    g.nextMeteor = g.t + 1.2 + Math.random() * 2.2;
  }
}

function tapMeteor(x, y) {
  const m = g.meteors.find(m => {
    const p = meteorAt(m, g.t);
    return Math.hypot(x - p.x, y - p.y) < 16;
  });
  if (!m) return false;
  m.caught = true;
  const r = catchStar(g.state);
  if (!r.ok) {
    UI.toast(r.reason);
    return true;
  }
  save();
  const p = meteorAt(m, g.t);
  popItem('star_fragment', p.x, p.y);
  UI.toast(`You caught a falling star! Make a wish.${r.left ? ` ${r.left} more tonight.` : ''}`, 'star_fragment');
  return true;
}

// ---------- visitors ----------

// Today's visitor and, on two days a week, the traveling merchant. They stand
// in the meadow without blocking the way.
function syncVisitors() {
  if (!g.state.daily) return;
  const key = [g.state.seed, g.today].join('|');
  if (key !== g.visitorKey) {
    g.visitorKey = key;
    const seed = g.state.seed;
    const list = [];
    const taken = new Set([...g.state.daily.forage.map(f => f.c + ',' + f.r), ...g.decorBlocked,
      EVENT_SPOT.c + ',' + EVENT_SPOT.r, SNOWMAN_SPOT.c + ',' + SNOWMAN_SPOT.r]);
    if (merchantHere(seed, g.today)) {
      for (const d of [0, 1]) taken.add(MERCHANT_SPOT.c + d + ',' + MERCHANT_SPOT.r);
      list.push({ kind: 'merchant', c: MERCHANT_SPOT.c, r: MERCHANT_SPOT.r });
    }
    const def = visitorOn(seed, g.today);
    const spot = visitorSpot(seed, g.today, taken);
    list.push({ kind: 'visitor', def, c: spot.c, r: spot.r });
    for (const v of list) {
      const p = tileCenter(v.c, v.r);
      Object.assign(v, { x: p.x, y: p.y + FEET, phase: Math.random() * 6 });
    }
    g.visitors = list;
    const names = list.map(v => (v.kind === 'merchant' ? 'the traveling merchant' : `${v.def.name} the ${v.def.species}`));
    if (g.visitorToast !== g.today) {
      g.visitorToast = g.today;
      const day = g.today;
      setTimeout(() => g.today === day && g.scene === 'jar' && UI.toast(`Visiting the meadow today: ${names.join(' and ')}.`), 1500);
    }
  }
  const open = !S.deliveries[String(g.today)];
  for (const v of g.visitors) v.ask = v.kind === 'visitor' && open;
}

// What the meadow's animals and people do: Poppy waters a bed, Percy brings the mail.
function onCritterEvent(a, ev) {
  if (ev.type === 'dig') g.effects.push({ kind: 'sparkle', x: a.x, y: a.y - 4, t0: g.t });
  if (ev.type !== 'arrive' || g.scene !== 'jar') return;
  const s = g.state;
  if (ev.action === 'water' && !s.daily.poppy) {
    const i = s.garden.findIndex((bed, k) => R.bedOpen(s, k) && bed.crop && bed.last !== g.today && R.bedStage(bed, g.today) < 3);
    if (i < 0) return;
    R.waterBed(s, i, g.today);
    s.daily.poppy = true;
    saveSharedBed(i);
    save();
    if (Math.abs(a.x - g.player.x) < 200) UI.toast('Poppy the mole watered one of your garden beds.');
  }
  if (ev.action === 'mail' && !s.daily.percy) {
    s.daily.percy = true;
    save();
    UI.toast('Percy the pelican dropped off the mail.');
  }
}

// Visitors don't stand still: each strolls near their spot in their own way.
const VISITOR_WAYS = { pip: 'digger', maple: 'pouncer', bram: 'lazy', lulu: 'wander', juniper: 'wander', otis: 'sitter', fern: 'hopper', dot: 'scuttle' };
function updateVisitorStroll(dt) {
  for (const v of g.visitors) {
    if (v.kind !== 'visitor') continue;
    if (!v.actor) v.actor = makeActor({ ...v.def, behavior: VISITOR_WAYS[v.def.id] || 'wander' }, { c: v.c, r: v.r }, g.t);
    const a = v.actor;
    const home = { c: v.home?.c ?? v.c, r: v.home?.r ?? v.r };
    v.home = home;
    updateActor(a, {
      t: g.t, dt, hour: g.hour, night: false, actors: [], anchors: { trees: [], water: [] }, friend: () => false,
      player: { c: g.player.c, r: g.player.r, x: g.player.x, y: g.player.y, moving: g.player.path.length > 0, sneaking: !!g.player.slow },
      walkable: (c, r) => walkable(c, r) && !objectAt(c, r) && Math.abs(c - home.c) <= 2 && Math.abs(r - home.r) <= 2,
    });
    Object.assign(v, { c: a.c, r: a.r, x: a.x, y: a.y, z: a.z, flip: a.flip, pose: a.pose });
  }
}

function visitorAt(x, y) {
  return g.visitors.find(v => Math.hypot(x - v.x, y - (v.y - 9)) < 12);
}

function talkTo(v) {
  walkNextTo([{ c: v.c, r: v.r }], () => {
    if (!ready()) return;
    if (v.kind === 'merchant') openMerchant(g);
    else openVisitor(g, v.def);
  });
}

// ---------- bugs ----------

let bugTiles = null;
const mapTiles = {};
function habitats() {
  if (g.scene === 'map') {
    const map = MAPS[g.mapId];
    if (!mapTiles[map.id]) {
      const open = mapOpenTiles(map);
      mapTiles[map.id] = {
        flower: open, ground: open,
        tree: mapNear(map, ['palm', 'pine', 'hive', 'arch', 'cactus', 'bigtree', 'bamboo', 'bigshroom', 'fern', 'decotree'], 2),
        pond: mapNear(map, ['water', 'water2', 'water3'], 1),
      };
    }
    return mapTiles[map.id];
  }
  if (bugTiles) return bugTiles;
  const open = forageTiles();
  const near = (o, d) => open.filter(t => t.c >= o.c - d && t.c < o.c + o.w + d && t.r >= o.r - d && t.r < o.r + o.h + d);
  bugTiles = {
    flower: open, ground: open,
    tree: near(OBJECTS.find(o => o.id === 'tree'), 2),
    pond: ['pond', 'pond2', 'pond3', 'pond4'].flatMap(id => near(OBJECTS.find(o => o.id === id), 1)),
  };
  return bugTiles;
}

function syncBugs() {
  if (!g.state.daily) return;
  const mapId = g.scene === 'map' ? g.mapId : null;
  const key = [g.state.seed, g.today, timeBlock(g.hour), g.season, g.weather, mapId].join('|');
  if (key === g.bugKey) return;
  g.bugKey = key;
  const caught = new Set(g.state.daily.bugs || []);
  g.bugs = spawnBugs(g.state.seed, g.today, g.hour, g.season, g.weather, habitats(), mapId)
    .filter(b => !caught.has(b.sid))
    .map(b => {
      const p = tileCenter(b.c, b.r);
      return { ...b, x: p.x, y: p.y + 4, alert: 0, phase: Math.random() * 6 };
    });
}

function bugAt(x, y) {
  return g.bugs.find(b => Math.hypot(x - b.x, y - (b.y - 6)) < 12);
}

function sneakTo(bug) {
  walkNextTo([{ c: bug.c, r: bug.r }], () => {
    if (!g.bugs.includes(bug)) return;
    g.player.pose = 'swing';
    g.player.frame = 0;
    g.poseUntil = g.t + 0.35;
    const def = BUG_BY_ID[bug.id];
    if (catchBug(g.state, bug.sid, bug.id)) {
      g.bugs = g.bugs.filter(b => b !== bug);
      save();
      popItem(bug.id, bug.x, bug.y - 12);
      const first = (g.state.log.bugs[bug.id]?.count || 0) === 1;
      UI.toast(`You caught a ${def.name.toLowerCase()}!${first ? ' New to your log!' : ''}`, bug.id);
      if (bug.id === 'firefly') T.noticeDiscovery('firefly-grove');
    } else UI.toast('Your bag is full.');
  });
  g.player.slow = true;
  g.sneak = bug;
  if (g.player.path.length) UI.toast('Sneaking… go slowly.');
}

function updateBugs(dt) {
  const p = g.player;
  const moving = p.path.length > 0;
  for (const b of [...g.bugs]) {
    const def = BUG_BY_ID[b.id];
    const d = Math.hypot(p.c - b.c, p.r - b.r);
    if (moving && d <= NOTICE_TILES) b.alert += alertRate(def, g.sneak === b) * dt * (1.2 - d / (NOTICE_TILES + 1));
    else b.alert = Math.max(0, b.alert - dt * 0.6);
    if (b.alert < 1) continue;
    // Too close, too fast: it flies off somewhere else.
    const spots = habitats()[def.where] || habitats().ground;
    const spot = spots[Math.floor(Math.random() * spots.length)];
    const t = tileCenter(spot.c, spot.r);
    Object.assign(b, { c: spot.c, r: spot.r, x: t.x, y: t.y + 4, alert: 0 });
    if (g.sneak === b) {
      p.path = [];
      p.onArrive = null;
      p.slow = false;
      g.sneak = null;
      UI.toast(`The ${def.name.toLowerCase()} got away. Sneak up more slowly.`);
    }
  }
}

function checkNewDay() {
  refreshClock();
  const events = R.rollover(g.state, g.today);
  if (events.length || g.lastDay !== g.today) syncEvents();
  if (g.scene === 'jar') {
    if (g.night) T.noticeDiscovery('firefly-grove');
    if (g.weather === 'rain') T.noticeDiscovery('rain-pool');
  }
  if (g.scene === 'map' && events.length) g.mapDaily = mapDaily(g.state, g.mapId, g.today, g.state.seed, DAILY_BITES);
  if (!events.length && g.state.daily.day === g.today && g.lastDay === g.today) return;
  g.lastDay = g.today;
  if (g.scene === 'mine') leaveMine();
  for (const e of events) {
    if (e.type === 'payout') UI.toast(`Good morning! The crate paid ${e.amount} pebbles.`);
    if (e.type === 'sprinkler') {
      UI.toast('The garden is watered for today.');
      g.state.garden.forEach((bed, i) => { if (bed.crop) saveSharedBed(i); });
    }
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
  const meta = S.garden.meta;
  if (meta) {
    g.state.farm.beds = Math.max(g.state.farm.beds, meta.beds || 0);
    g.state.farm.sprinkler = g.state.farm.sprinkler || !!meta.sprinkler;
  } else if (g.state.farm.beds > 6 || g.state.farm.sprinkler) saveFarm();
  const beds = Object.keys(S.garden);
  if (!beds.length) {
    // First person to connect brings their garden along.
    g.state.garden.forEach((bed, i) => { if (bed.crop) saveSharedBed(i); });
    return;
  }
  BEDS.forEach((b, i) => {
    const doc = S.garden['bed-' + i];
    g.state.garden[i] = doc ? { crop: doc.crop ?? null, count: doc.count || 0, last: doc.last ?? -1, ...(doc.fert ? { fert: doc.fert } : {}) } : { crop: null, count: 0, last: -1 };
  });
}

// ---------- player movement ----------

function placePlayer(c, r) {
  const p = tileCenter(c, r);
  Object.assign(g.player, { c, r, x: p.x, y: p.y + FEET, path: [], onArrive: null, pose: 'walk', frame: 0 });
}

function walkable(c, r) {
  if (g.scene === 'mine') return mineOpen(c, r, false);
  if (g.scene === 'home') return roomWalkable(c, r, g.furnitureBlocked) || (c === DOOR.c && r === DOOR.r);
  if (g.scene === 'map') return mapWalkable(MAPS[g.mapId], c, r);
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
  g.player.slow = false;
  g.sneak = null;
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
  const step = SPEED * (p.slow ? 0.45 : 1) * dt;
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
  const data = {
    scene: g.scene, layer: g.layer, roomId: g.scene === 'home' ? g.roomId : null, mapId: g.scene === 'map' ? g.mapId : null, x: Math.round(p.x), y: Math.round(p.y),
    dir: p.dir, frame: p.frame, pose: p.pose, look: g.state.avatar, uid: cloud.me,
    sleeping: !!p.sleeping, bedId: p.sleeping ? p.bedId : null, side: p.side || 0,
  };
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
      tx: Math.max(CAM_MIN, Math.min(MEADOW_W, pr.x)), ty: Math.max(0, Math.min(H, pr.y)), dir: pr.dir | 0, frame: pr.frame | 0,
      pose: ['walk', 'sit', 'cast', 'swing', 'crouch'].includes(pr.pose) ? pr.pose : 'walk',
      scene: ['mine', 'home', 'map'].includes(pr.scene) ? pr.scene : 'jar', layer: pr.layer | 0, look: cleanLook(pr.look),
      mapId: MAPS[pr.mapId] ? pr.mapId : null,
      roomId: typeof pr.roomId === 'string' ? pr.roomId : null, sleeping: !!pr.sleeping,
      bedId: typeof pr.bedId === 'string' ? pr.bedId : null, side: pr.side ? 1 : 0,
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
  return { skin: n(l.skin, 4), hairStyle: n(l.hairStyle, 5), hairColor: n(l.hairColor, 6), outfit: n(l.outfit, 5), outfitStyle: n(l.outfitStyle, 3), hat: n(l.hat, 4) };
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
  const bug = bugAt(x, y);
  if (bug) return sneakTo(bug);
  const visitor = visitorAt(x, y);
  if (visitor) return talkTo(visitor);
  const critter = critterAt(g, x, y);
  if (critter) return walkNextTo([{ c: critter.c, r: critter.r }], () => ready() && openCritter(g, critter));
  if (eventStandAt(x, y)) return walkNextTo([EVENT_SPOT], () => ready() && openEventStand(g));
  if (tapMushroom(c, r)) return;
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
        R.addItem(g.state, 'fiber', 1);
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
      const od = OUTDOOR_BY_TYPE[deco.type];
      if (od?.sit) {
        g.player.pose = 'sit';
        g.player.dir = DIRS.down;
        UI.toast(od.swing ? `You sway gently on the ${od.name.toLowerCase()}.` : `You sit on the ${od.name.toLowerCase()} for a while.`);
      } else if (FARM_BY_TYPE[deco.type]) collectFarm(deco);
      else if (deco.type === 'log') T.noticeDiscovery('hollow-log');
      else if (deco.type === 'campfire') ready() && openKitchen(g);
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

function collectFarm(deco) {
  const def = FARM_BY_TYPE[deco.type];
  const placedDay = (deco.at ? dayNumber(new Date(deco.at), S.world?.timeZone) : g.today) + (g.state.dayOffset || 0);
  const res = collectFarmItem(g.state, { id: deco.id, type: deco.type, placedDay }, g.today);
  crouch();
  if (res.ok) {
    save();
    gained(res.id, res.n);
    return;
  }
  const say = {
    growing: `The ${def.name.toLowerCase()} is still growing. ${res.daysLeft} more day${res.daysLeft === 1 ? '' : 's'}.`,
    collected: `You already collected from the ${def.name.toLowerCase()} today.`,
    resting: `Nothing yet. Come back tomorrow.`,
    full: 'Your bag is full.',
  }[res.state];
  UI.toast(say);
}

// Opening more beds and the sprinkler are shared: they go in the garden's meta doc.
function saveFarm() {
  if (cloud.mode === 'cloud') setDoc('garden/meta', { ...g.state.farm, by: cloud.me }).catch(() => {});
}

function useBed(i) {
  if (!R.bedOpen(g.state, i)) {
    UI.toast('This bed isn\'t open yet. Open more beds in the beetle shop\'s Farm tab.');
    return UI.openShop(g, 'farm');
  }
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
      R.addItem(g.state, 'fiber', 1);
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
    case 'tent': return ready() && enterHome();
    case 'mailbox': return ready() && T.openMailbox(g, UI.letters(g));
    case 'crate': return UI.openCrate(g);
    case 'workbench': return openCrafting(g);
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
        R.addItem(g.state, 'wood', 2);
        UI.toast('+2 Wood', 'wood');
        save();
        gained(got.id, got.n);
      } else UI.toast(g.state.daily.shook ? 'No more fruit today. It grows back overnight.' : 'Your bag is full.');
      return;
    }
    case 'bench':
      g.player.pose = 'sit';
      g.player.dir = DIRS.down;
      return ready() && T.openToday(g);
    case 'pond': case 'pond2': case 'pond3': case 'pond4': return startFishing(o);
    case 'door': return ready() && openTravel(g);
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
  const name = opts.furniture ? FURNITURE_BY_TYPE[opts.type]?.name : C.decorByType[opts.type]?.name;
  UI.toast(`Tap a free spot for the ${(name || 'decoration').toLowerCase()}, then tap it again to place it.`);
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
  g.decor = Object.entries(S.decor).map(([id, d]) => ({ id, type: d.type, c: d.c | 0, r: d.r | 0, at: d.at || 0 })).filter(d => C.decorByType[d.type]);
  g.decorBlocked = new Set(g.decor.filter(d => !FLAT_DECOR.has(d.type)).map(d => tileKey(d.c, d.r)));
}

// ---------- your home ----------

function syncHome() {
  g.houseLevel = S.house?.level || 0;
  g.room = S.rooms[g.roomId] || null;
  g.furniture = Object.entries(S.furniture).filter(([, f]) => f.room === g.roomId && FURNITURE_BY_TYPE[f.type]).map(([id, f]) => ({ id, type: f.type, c: f.c | 0, r: f.r | 0 }));
  g.wallitems = Object.entries(S.wallitems).filter(([, w]) => w.room === g.roomId && WALL_BY_TYPE[w.type]).map(([id, w]) => ({ id, type: w.type, slot: w.slot | 0 }));
  g.furnitureBlocked = blockedTiles(g.furniture);
  if (g.scene === 'home' && !g.room && roomsList().length) g.roomId = roomsList()[0].id;
}

async function enterHome(roomId) {
  closeSheetQuietly();
  stopPlacing();
  const first = await ensureFirstRoom();
  g.scene = 'home';
  g.roomId = roomId && S.rooms[roomId] ? roomId : (g.roomId && S.rooms[g.roomId] ? g.roomId : first);
  syncHome();
  wake();
  placePlayer(DOOR.c, DOOR.r);
  g.player.dir = DIRS.up;
  UI.updateHud(g);
  if (!g.state.homeTip) {
    g.state.homeTip = true;
    save();
    UI.toast('Welcome home! Tap Build to add furniture, walls and rooms. Tap the door mat to go outside.');
  }
}

function leaveHome() {
  wake();
  stopPlacing();
  g.scene = 'jar';
  const tent = OBJECTS.find(o => o.id === 'tent');
  placePlayer(tent.c + 1, tent.r + tent.h);
  UI.updateHud(g);
}

function wake() {
  if (!g.player.sleeping) return;
  g.player.sleeping = false;
  g.player.bedId = null;
}

function tapHome(c, r) {
  if (g.player.sleeping) {
    wake();
    UI.toast('Good morning.');
    return;
  }
  if (g.build?.furniture) return placeFurnitureTap(c, r);
  if (c === DOOR.c && r >= DOOR.r) {
    walkTo(DOOR.c, DOOR.r, leaveHome);
    return;
  }
  const item = [...g.furniture].reverse().find(f => !FURNITURE_BY_TYPE[f.type].flat && tilesOf(f).some(t => t.c === c && t.r === r));
  if (item) {
    walkNextTo(tilesOf(item), () => useFurniture(item));
    return;
  }
  if (r < 4 && r >= 1) {
    const w = g.wallitems.find(x => Math.abs([3, 5, 7, 9, 11, 13][x.slot] - c) <= 0);
    if (w) return UI.toast(w.type === 'portrait' ? 'The two of you, in a little frame.' : WALL_BY_TYPE[w.type].name);
  }
  if (walkable(c, r)) walkTo(c, r);
}

function useFurniture(item) {
  const def = FURNITURE_BY_TYPE[item.type];
  switch (def.use) {
    case 'sleep': return goToBed(item);
    case 'wardrobe': return UI.openWardrobe(g);
    case 'sit':
      g.player.pose = 'sit';
      g.player.dir = DIRS.down;
      return;
    case 'calendar': return ready() && T.openCalendar(g);
    case 'journal': return ready() && T.openJournal(g);
    case 'bag': return UI.openBag(g);
    case 'cook': return ready() && openKitchen(g);
    case 'music': {
      const x = GX_HOME(item), y = GY_HOME(item);
      for (let i = 0; i < 4; i++) g.effects.push({ kind: 'note', x: x + i * 5 - 6, y: y - i * 3, t0: g.t + i * 0.2 });
      return UI.toast(item.type === 'piano' ? 'You play a little tune.' : 'A soft song fills the room.');
    }
    default:
      return UI.toast(def.name);
  }
}

const GX_HOME = item => 24 + (item.c + FURNITURE_BY_TYPE[item.type].w / 2) * 16;
const GY_HOME = item => 100 + item.r * 16 - 4;

function goToBed(bed) {
  const def = FURNITURE_BY_TYPE[bed.type];
  const taken = g.others.some(o => o.sleeping && o.bedId === bed.id && (o.side || 0) === 0);
  g.player.sleeping = true;
  g.player.bedId = bed.id;
  g.player.side = def.w > 1 && taken ? 1 : 0;
  sayGoodnight(g.today);
  const partner = partnerId();
  const together = partner && goodnightsOn(g.today).includes(partner);
  UI.toast(together ? 'Goodnight, you two.' : partner ? 'Goodnight. Sweet dreams. Tap anywhere to get up.' : 'Goodnight. Tap anywhere to get up.');
  checkGoodnight();
}

function checkGoodnight() {
  const partner = partnerId();
  if (!partner) return;
  const said = goodnightsOn(g.today);
  if (!said.includes(cloud.me) || !said.includes(partner)) return;
  g.state.rewards = g.state.rewards || {};
  const key = 'goodnight-' + g.today;
  if (g.state.rewards[key]) return;
  g.state.rewards[key] = true;
  g.state.pebbles += 15;
  save();
  UI.toast('You both said goodnight today. +15 pebbles');
}

function placeFurnitureTap(c, r) {
  const b = g.build;
  const def = FURNITURE_BY_TYPE[b.type];
  const onPlayer = tilesOf({ type: b.type, c, r }).some(t => t.c === g.player.c && t.r === g.player.r) && !def.flat;
  const ok = canPlace(b.type, c, r, g.furniture, b.moveId) && !onPlayer;
  if (b.ghost && b.ghost.c === c && b.ghost.r === r && ok) {
    if (placeFurniture(g, b, c, r)) UI.toast(b.moveId ? 'Moved.' : 'Placed!');
    stopPlacing();
    return;
  }
  b.ghost = { type: b.type, c, r, ok };
  if (!ok) UI.toast(def.w > 1 || def.h > 1 ? `That needs ${def.w}×${def.h} free tiles on the floor, away from the door.` : 'That spot is taken.');
}

// ---------- other jars ----------

function enterMap(id) {
  if (!MAPS[id]) return;
  closeSheetQuietly();
  cancelAction();
  stopPlacing();
  g.scene = 'map';
  g.mapId = id;
  const door = MAPS[id].objects.find(o => o.id === 'door');
  placePlayer(door.c + 1, door.r);
  g.player.dir = DIRS.right;
  refreshClock();
  syncCritters(g);
  UI.updateHud(g);
}

function leaveMap() {
  closeSheetQuietly();
  cancelAction();
  g.scene = 'jar';
  g.mapId = null;
  g.mapDaily = null;
  const door = OBJECTS.find(o => o.id === 'door');
  placePlayer(door.c - 1, door.r);
  g.player.dir = DIRS.left;
  refreshClock();
  UI.updateHud(g);
}

function tapMap(c, r, x, y) {
  const map = MAPS[g.mapId];
  const day = g.mapDaily;
  const bug = bugAt(x, y);
  if (bug) return sneakTo(bug);
  const critter = critterAt(g, x, y);
  if (critter) return walkNextTo([{ c: critter.c, r: critter.r }], () => ready() && openCritter(g, critter));
  const di = day.digs.findIndex((t, i) => t.c === c && t.r === r && !day.dug.includes(i));
  if (di >= 0) return walkTo(c, r, () => digAt(g, di));
  const fi = day.forage.findIndex((f, i) => f.c === c && f.r === r && !day.picked.includes(i));
  if (fi >= 0) {
    walkTo(c, r, () => {
      if (day.picked.includes(fi)) return;
      const id = day.forage[fi].id;
      if (!R.addItem(g.state, id, 1)) return UI.toast('Your bag is full.');
      day.picked.push(fi);
      R.addItem(g.state, 'fiber', 1);
      save();
      gained(id);
    });
    return;
  }
  const o = mapObjectAt(map, c, r);
  if (o) {
    const use = () => useMapObject(map, o);
    if (o.walkable) walkTo(o.c, o.r, use);
    else walkNextTo(footprintTiles(o), use);
    return;
  }
  if (walkable(c, r)) walkTo(c, r);
}

function useMapObject(map, o) {
  const day = g.mapDaily;
  if (o.id === 'door') return ready() && openTravel(g);
  if (/^water/.test(o.id)) return startFishing(o);
  if (o.kind === 'shop') return openJarShop(g, map.id);
  if (o.kind === 'spot') return ready() && runSpot(g, o);
  if (o.fruit) {
    if (day.shaken[o.id]) return UI.toast(`Nothing more from the ${o.name.toLowerCase()} today.`);
    if (!R.addItem(g.state, o.fruit, 1)) return UI.toast('Your bag is full.');
    day.shaken[o.id] = true;
    if (o.id === 'palm') {
      R.addItem(g.state, 'wood', 2);
      UI.toast('+2 Wood', 'wood');
    }
    save();
    gained(o.fruit);
    return;
  }
  UI.toast(o.name);
}

// Fishing in another jar uses that jar's own bites.
function bites() {
  if (g.scene === 'mine') return R.caveBites(g.state);
  return g.scene === 'map' ? g.mapDaily : g.state.daily;
}

function spendBite() {
  const b = bites();
  if (b.bites > 0) b.bites -= 1;
}

// ---------- fishing ----------

function startFishing(pond) {
  if (bites().bites <= 0) {
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
  spendBite();
  const c = g.scene === 'mine' ? R.caveCatch(Math.random, R.bandOf(g.layer))
    : g.scene === 'map' ? mapCatch(Math.random, g.mapId, g.hour) : R.rollCatch(Math.random, g.season, g.hour, g.weather);
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
    spendBite();
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
  const festivalBest = g.scene === 'jar' && isOn(g.today, g.hour, 'festival') && recordFestivalCatch(g.state, id, size);
  save();
  if (festivalBest) setTimeout(() => UI.toast('A new best for the festival! Enter it at the event stand.'), 1800);
  popItem(id, f.bobber.x, f.bobber.y - 8);
  const note = isNew ? ' New to your log!' : record ? ' A new record!' : '';
  endFishing(`You caught a ${item.name.toLowerCase()}! ${size} cm.${note}`, id);
  const caught = Object.values(g.state.log.fish).reduce((s, e) => s + e.count, 0);
  if (caught >= 5) T.noticeDiscovery('spring');
}

// ---------- mine ----------

function enterMine(layer) {
  closeSheetQuietly();
  cancelAction();
  g.scene = 'mine';
  g.layer = layer;
  g.mine = R.layerMap(g.state.seed, g.today, layer);
  g.rocks = g.mine.rocks;
  g.mineWalls = new Set(g.mine.walls);
  const ls = R.layerState(g.state, layer);
  g.mineBroken = new Set(ls.broken);
  g.mineOpened = new Set(ls.opened);
  g.minePicked = new Set(ls.picked);
  g.monsters = g.mine.monsters.filter(m => !ls.slain.includes(m.id)).map(m => {
    const def = MONSTERS[m.kind];
    const p = tileCenter(m.c, m.r);
    return { ...m, x: p.x, y: p.y + FEET, hp: def.hp, maxHp: def.hp, stepAt: g.t + 1 + Math.random(), attackAt: 0, hidden: !!def.hides, from: null };
  });
  g.hits = new Map();
  g.maxHp = R.maxHp(g.state);
  if (g.state.hp == null) g.state.hp = g.maxHp;
  R.reachLayer(g.state, layer);
  save();
  placePlayer(R.MINE_START.c, R.MINE_START.r);
  UI.updateHud(g);
  T.noticeDiscovery('moon-cave');
  if (layer >= 21) T.noticeDiscovery('crystal-pool');
  const room = R.ROOM_NAMES[g.mine.kind];
  const boss = g.monsters.find(m => MONSTERS[m.kind].boss);
  if (boss) UI.toast(`${MONSTERS[boss.kind].name} lives on this layer. Careful!`);
  else if (room) UI.toast(`${room}!`);
  else if (layer % 10 === 1 && layer > 1) UI.toast(`Welcome to the ${R.BAND_NAMES[R.bandOf(layer)]} zone.`);
}

function leaveMine() {
  cancelAction();
  g.scene = 'jar';
  g.monsters = [];
  const cave = OBJECTS.find(o => o.id === 'cave');
  placePlayer(cave.c, cave.r - 1);
  UI.updateHud(g);
}

// Open floor in the mine. Rocks, walls, chests and the lake block the way.
function mineOpen(c, r, flying) {
  if (!inBounds(c, r, COLS, 0) || g.mineWalls.has(c + ',' + r)) return false;
  const p = g.mine?.pool;
  if (p && c >= p.c && c < p.c + p.w && r >= p.r && r < p.r + p.h) return false;
  if (g.mine?.chests.some(ch => ch.c === c && ch.r === r)) return false;
  if (flying) return true;
  return !g.rocks.some(rock => rock.c === c && rock.r === r && !g.mineBroken.has(rock.id));
}

function monsterAt(x, y) {
  return g.monsters.find(m => {
    const big = MONSTERS[m.kind].boss;
    return Math.abs(x - m.x) < (big ? 14 : 10) && y > m.y - (big ? 28 : 20) && y < m.y + 6;
  });
}

function tapMine(c, r, x, y) {
  const mo = monsterAt(x, y);
  if (mo && !mo.hidden) {
    fight(mo);
    return;
  }
  if (c === R.MINE_ENTRY.c && r === R.MINE_ENTRY.r) {
    walkTo(c, r, leaveMine);
    return;
  }
  const chest = g.mine.chests.find(ch => ch.c === c && ch.r === r);
  if (chest) {
    walkNextTo([{ c, r }], () => {
      const res = R.openChest(g.state, g.layer, chest.id);
      if (!res) return UI.toast('You already opened this one.');
      g.mineOpened.add(chest.id);
      save();
      const p = tileCenter(c, r);
      for (const d of res.got) popItem(d.id, p.x, p.y - 6);
      UI.toast(`Treasure! +${res.pebbles} pebbles${res.got.length ? ` and ${res.got.map(d => `${d.n} ${ITEMS[d.id].name}`).join(', ')}` : ''}.`);
    });
    return;
  }
  const fi = g.mine.forage.findIndex((f, i) => f.c === c && f.r === r && !g.minePicked.has(i));
  if (fi >= 0) {
    walkTo(c, r, () => {
      const id = g.mine.forage[fi].id;
      if (!R.pickGrotto(g.state, g.layer, fi, id)) return UI.toast('Your bag is full.');
      g.minePicked.add(fi);
      save();
      gained(id);
    });
    return;
  }
  const pool = g.mine.pool;
  if (pool && c >= pool.c && c < pool.c + pool.w && r >= pool.r && r < pool.r + pool.h) {
    walkNextTo(footprintTiles(pool), () => startFishing(pool));
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
      if (g.layer === MINE_LAYERS) UI.toast('You reached the very bottom of the jar!');
    });
    return;
  }
  if (walkable(c, r)) walkTo(c, r);
}

// ---------- monsters ----------

function fight(mo) {
  cancelAction();
  const near = Math.max(Math.abs(mo.c - g.player.c), Math.abs(mo.r - g.player.r)) <= 1;
  if (near) g.action = { kind: 'fight', monster: mo, timer: 0 };
  else walkNextTo([{ c: mo.c, r: mo.r }], () => { if (g.monsters.includes(mo)) g.action = { kind: 'fight', monster: mo, timer: 0 }; });
}

function hitMonster(mo) {
  const def = MONSTERS[mo.kind];
  mo.hp -= R.swordDamage(g.state);
  mo.flashUntil = g.t + 0.15;
  mo.stepAt = Math.max(mo.stepAt, g.t + 0.35);
  if (mo.hp > 0) return;
  g.monsters = g.monsters.filter(m => m !== mo);
  if (g.action?.monster === mo) g.action = null;
  const res = R.defeatMonster(g.state, g.layer, mo);
  save();
  for (const d of res?.got || []) popItem(d.id, mo.x, mo.y - 10);
  if (res?.firstBoss) {
    g.maxHp = R.maxHp(g.state);
    UI.toast(`You beat the ${def.name.toLowerCase()}! Your health grows to ${g.maxHp}.`);
  } else UI.toast(`You beat the ${def.name.toLowerCase()}!${res?.got.length ? ` +${ITEMS[res.got[0].id].name}` : ''}`, res?.got[0]?.id);
  UI.updateHud(g);
}

function updateMonsters(dt) {
  if (g.scene !== 'mine') return;
  const p = g.player;
  for (const mo of g.monsters) {
    const def = MONSTERS[mo.kind];
    const target = tileCenter(mo.c, mo.r);
    mo.x += (target.x - mo.x) * Math.min(1, dt / def.step * 3);
    mo.y += (target.y + FEET - mo.y) * Math.min(1, dt / def.step * 3);
    const dist = Math.max(Math.abs(mo.c - p.c), Math.abs(mo.r - p.r));
    if (mo.hidden) {
      if (dist <= 1) { mo.hidden = false; UI.toast('That rock was a rock crab!'); mo.stepAt = g.t + 0.6; }
      continue;
    }
    if (dist <= 1) {
      // A short wind-up when it first reaches you, then it attacks every so often.
      if (!mo.close) {
        mo.close = true;
        mo.attackAt = Math.max(mo.attackAt, g.t + 0.6);
      }
      if (g.t >= mo.attackAt && !g.fishing) {
        mo.attackAt = g.t + def.rate;
        hurtPlayer(def.dmg);
        if (g.scene !== 'mine') return;
      }
      continue;
    }
    mo.close = false;
    if (g.t < mo.stepAt) continue;
    mo.stepAt = g.t + def.step;
    const chase = dist <= 6;
    const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dc, dr]) => ({ c: mo.c + dc, r: mo.r + dr }))
      .filter(t => mineOpen(t.c, t.r, def.flies) && !(t.c === p.c && t.r === p.r) && !g.monsters.some(o => o !== mo && o.c === t.c && o.r === t.r));
    if (!steps.length) continue;
    let next;
    if (chase) next = steps.sort((a, b) => (Math.abs(a.c - p.c) + Math.abs(a.r - p.r)) - (Math.abs(b.c - p.c) + Math.abs(b.r - p.r)))[0];
    else if (Math.random() < 0.5) next = steps[Math.floor(Math.random() * steps.length)];
    if (next) { mo.c = next.c; mo.r = next.r; }
  }
}

function hurtPlayer(dmg) {
  const hp = R.hurt(g.state, dmg);
  g.hurtUntil = g.t + 0.2;
  if (navigator.vibrate) try { navigator.vibrate(30); } catch { /* not allowed */ }
  UI.updateHud(g);
  if (hp > 0) return;
  // Fainting: you wake up by the cave with half your health. Nothing is lost.
  g.state.hp = Math.ceil(R.maxHp(g.state) / 2);
  save();
  leaveMine();
  UI.toast('You fainted! A friendly bat carried you back up. Eat something to get your health back.');
}

function updateAction(dt) {
  const a = g.action;
  if (!a) return;
  a.timer -= dt;
  if (a.timer > 0) return;
  if (a.kind === 'fight') {
    const mo = a.monster;
    if (!g.monsters.includes(mo)) { g.action = null; return; }
    if (Math.max(Math.abs(mo.c - g.player.c), Math.abs(mo.r - g.player.r)) > 1) {
      g.action = null;
      fight(mo);
      return;
    }
    g.player.dir = Math.abs(mo.x - g.player.x) > Math.abs(mo.y - g.player.y)
      ? (mo.x < g.player.x ? DIRS.left : DIRS.right) : (mo.y < g.player.y ? DIRS.up : DIRS.down);
    g.player.pose = 'swing';
    g.player.frame = (g.player.frame + 1) % 2;
    a.timer = 0.4;
    hitMonster(mo);
    if (!g.action) g.player.pose = 'walk';
    return;
  }
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
  const screen = canvasPoint(e);
  if (g.scene === 'jar' && g.meteors.length && tapMeteor(screen.x, screen.y)) return;
  // In the meadow the view may have slid: turn the tap into a spot in the world.
  const x = screen.x + (g.scene === 'jar' || g.scene === 'map' ? Math.round(g.camX) : 0), y = screen.y;
  const { c, r } = pointToTile(x, y);
  if (g.scene === 'mine') tapMine(c, r, x, y);
  else if (g.scene === 'home') tapHome(c, r);
  else if (g.scene === 'map') tapMap(c, r, x, y);
  else tapJar(c, r, x, y);
}

function onPointerUp() {
  g.hold = false;
}

function onKey(e) {
  if (phoneOpen()) {
    if (e.key === 'Escape') closePhone();
    return;
  }
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
    document.querySelector('#btn-phone')?.classList.toggle('has-news', phoneHasNews(g));
  }
  presenceTimer -= dt;
  if (presenceTimer <= 0) {
    presenceTimer = 0.1;
    sendPresence();
    readOthers();
  }
  if (g.poseUntil && g.t > g.poseUntil) {
    g.poseUntil = 0;
    if (g.player.pose === 'crouch' || g.player.pose === 'swing') g.player.pose = 'walk';
  }
  updatePlayer(dt);
  updateCamera(dt);
  updateOthers(dt);
  if (g.scene === 'map') updateBugs(dt);
  if (g.scene === 'jar' || g.scene === 'map') {
    // Animals and people keep off the spots, stalls and doors you tap.
    const objAt = g.scene === 'map' ? (c, r) => mapObjectAt(MAPS[g.mapId], c, r) : objectAt;
    updateCritters(g, dt, (c, r) => walkable(c, r) && !objAt(c, r), onCritterEvent);
    if (g.scene === 'jar') updateVisitorStroll(dt);
  }
  if (g.scene === 'jar') {
    const ctxRes = { night: g.night, player: { c: g.player.c, r: g.player.r }, blocked: g.decorBlocked };
    for (const a of g.residents) updateResident(a, dt, g.t, ctxRes);
    updateBugs(dt);
  }
  updateMeteors();
  updateMonsters(dt);
  updateFishing(dt);
  updateAction(dt);
  g.effects = g.effects.filter(e => g.t - e.t0 < 1.3);
  drawScene(ctx, g);
  requestAnimationFrame(frame);
}

// ---------- camera ----------

// The view slides when you walk near the jar's glass, so the meadow can be
// wider than the screen. Elsewhere (home, mine, other jars) it stays still.
const EDGE = 110;
function updateCamera(dt) {
  if (g.scene !== 'jar' && !(g.scene === 'map' && MAPS[g.mapId]?.west)) {
    g.camX = 0;
    return;
  }
  // The meadow, or a jar that's wider than the screen.
  const map = g.scene === 'map' ? MAPS[g.mapId] : null;
  const min = map ? -map.west * TILE : CAM_MIN;
  const max = map ? GX * 2 + map.cols * TILE - W : CAM_MAX;
  let target = g.camX;
  if (g.player.x - target < EDGE) target = g.player.x - EDGE;
  if (g.player.x - target > W - EDGE) target = g.player.x - (W - EDGE);
  target = Math.max(min, Math.min(max, target));
  // Arriving from far away (a new scene, a jump): snap instead of gliding.
  if (Math.abs(target - g.camX) > W / 2) g.camX = target;
  else g.camX += (target - g.camX) * Math.min(1, dt * 6);
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
    if (['house', 'rooms', 'furniture', 'wallitems', 'ready'].includes(kind)) syncHome();
    if (kind === 'goodnights') checkGoodnight();
    if (kind === 'kitchen') { noticeInvite(); maybeStartPart(g); maybeFinish(g); }
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
    scene: 'jar', camX: 0, layer: 0, rocks: [], mineBroken: new Set(), hits: new Map(), mine: null, mineWalls: new Set(), monsters: [], maxHp: 100,
    player: { c: START_TILE.c, r: START_TILE.r, x: 0, y: 0, dir: DIRS.down, frame: 0, pose: 'walk', path: [] },
    residents: [], bugs: [], bugKey: '', visitors: [], visitorKey: '', critters: [], events: [], eventsToday: [], eventKey: '', mushrooms: [], meteors: [], snowman: false, crouch, sneak: null, decor: [], decorBlocked: new Set(), others: [], selected: null, build: null,
    mapId: null, mapDaily: null, enterMap, leaveMap,
    roomId: null, room: null, furniture: [], wallitems: [], furnitureBlocked: new Set(), houseLevel: 0, enterHome,
    openKitchen: () => ready() && openKitchen(g),
    openCrafting: () => openCrafting(g),
    openTools: () => UI.openWorkbench(g),
    fishing: null, action: null, effects: [], hold: false, t: 0, today,
    debugHour: null, save, saveFarm, saveBed: saveSharedBed, startPlacing, animalReacts, resetMine, enterMine,
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
  // Everything lives in the phone now.
  on('#btn-phone', () => (phoneOpen() ? closePhone() : openPhone(g)));
  on('#sheet-back', UI.sheetBack);
  on('#btn-leave', () => (g.scene === 'home' ? leaveHome() : leaveMine()));
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
    tools.querySelector('[data-debug="event"]')?.addEventListener('click', () => {
      // Jump to the next seasonal event, at night if it's a night event.
      for (let d = g.today + 1; d < g.today + 29; d++) {
        const e = eventsToday(d)[0];
        if (!e) continue;
        g.state.dayOffset = (g.state.dayOffset || 0) + (d - g.today);
        g.debugHour = e.night ? 22 : 13;
        checkNewDay();
        UI.updateHud(g);
        UI.toast(`Test: ${e.name}`);
        return;
      }
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
