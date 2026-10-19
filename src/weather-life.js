// The weather in the meadow and the jars: where puddles, fallen branches,
// lightning glass, the rainbow's pot and frost flowers are today, the leaves
// on the wind, lightning flashes and splashing. Rules are in weather.js.
import { MAPS, mapOpenTiles } from './maps.js';
import { OBJECTS, forageTiles } from './world.js';
import { tileCenter, W, H } from './scene.js';
import {
  weatherNow, puddleSpots, branchSpots, strikeSpot, rainbowEnd, frostSpots, isStormy,
  pickBranch, splashPuddle, takeStrike, takeRainbow, pickFrost, catchLeaf, wxDaily, LEAVES_PER_DAY,
} from './weather.js';

const FEET = 5;

export const placeOf = g => (g.scene === 'map' ? g.mapId : 'meadow');

// Today's weather where you are. Jars with their own weather keep it.
export function weatherHere(g, homeWeather, mapWeather) {
  const wx = weatherNow(g.state.seed, g.today, g.hour);
  if (g.scene !== 'map') return { ...wx, frost: wx.frost && g.season === 'winter' };
  const map = MAPS[g.mapId];
  if (map.weather) return { kind: map.weather, base: map.weather, puddles: map.weather === 'rain', rainbow: false, sunshower: false, frost: false, clearAt: null };
  return { ...wx, kind: mapWeather(map, homeWeather), base: mapWeather(map, wx.base), frost: wx.frost && map.season === 'winter' };
}

function treeTilesFor(g, open, treeHabitat) {
  if (g.scene === 'map') return treeHabitat;
  const trees = OBJECTS.filter(o => o.kind === 'tree' || o.id === 'tree');
  return open.filter(t => trees.some(o => Math.abs(t.c - o.c) <= 1 && t.r >= o.r && t.r <= o.r + 1));
}

// Works out today's weather spots. taken: tiles to keep clear ("c,r").
export function syncWeather(g, treeHabitat, taken) {
  const wx = g.wx;
  const place = placeOf(g);
  const key = [g.state.seed, g.today, place, wx.puddles, wx.base, !!wx.rainbow, !!wx.frost].join('|');
  if (key === g.wxKey) return;
  g.wxKey = key;
  const open = g.scene === 'map' ? mapOpenTiles(MAPS[g.mapId]) : forageTiles();
  const seed = g.state.seed, day = g.today;
  const spots = { puddles: [], branches: [], strike: null, pot: null, frost: [] };
  const clear = new Set(taken);
  const keep = list => { for (const t of list) clear.add(t.c + ',' + t.r); return list; };
  if (isStormy(wx.base)) {
    spots.branches = keep(branchSpots(seed, day, place, treeTilesFor(g, open, treeHabitat), clear));
    if (wx.base === 'storm') spots.strike = keep([strikeSpot(seed, day, place, open, clear)].filter(Boolean))[0] || null;
  }
  if (wx.puddles) spots.puddles = keep(puddleSpots(seed, day, place, open, clear));
  if (wx.rainbow) spots.pot = keep([rainbowEnd(seed, day, place, open, clear)].filter(Boolean))[0] || null;
  if (wx.frost) spots.frost = keep(frostSpots(seed, day, place, open, clear));
  g.wxSpots = spots;
}

// Something you can pick up on this tile.
export function weatherSpotAt(g, c, r) {
  const s = g.wxSpots;
  if (!s || !g.state.daily) return null;
  const d = wxDaily(g.state, placeOf(g));
  const at = t => t && t.c === c && t.r === r;
  let i = s.branches.findIndex((t, j) => at(t) && !d.branches.includes(j));
  if (i >= 0) return { type: 'branch', i };
  if (at(s.strike) && !d.strike) return { type: 'strike' };
  if (at(s.pot) && !d.rainbow) return { type: 'pot' };
  i = s.frost.findIndex((t, j) => at(t) && !d.frost.includes(j));
  if (i >= 0) return { type: 'frost', i };
  return null;
}

// Picks it up. Returns the item ids you got, or null.
export function useWeatherSpot(g, spot) {
  const place = placeOf(g);
  if (spot.type === 'branch') return pickBranch(g.state, place, spot.i, g.wxSpots.branches[spot.i]);
  if (spot.type === 'strike') return takeStrike(g.state, place) ? ['lightning_glass'] : null;
  if (spot.type === 'pot') return takeRainbow(g.state, place) ? ['rainbow_shard'] : null;
  if (spot.type === 'frost') return pickFrost(g.state, place, spot.i) ? ['frost_flower'] : null;
  return null;
}

export const puddleAt = (g, c, r) => (g.wxSpots?.puddles || []).findIndex(t => t.c === c && t.r === r);

// ---------- every frame ----------

// Leaves blow across the screen in wind and storms (screen space, like the
// shooting stars). Lightning flashes in storms. Walking into a puddle splashes.
// hooks.splash(find, i) is called the first time you splash in each puddle today.
export function updateWeather(g, dt, hooks) {
  const outside = g.scene === 'jar' || g.scene === 'map';
  const w = g.weather;
  g.gusts = (g.gusts || []).filter(l => l.x < W + 20 && outside);
  if (outside && (w === 'wind' || isStormy(w))) {
    // Pretty leaves all the time; a catchable one every few seconds on windy days.
    if (Math.random() < dt * (isStormy(w) ? 5 : 3)) g.gusts.push(leaf(false, w));
    const catchable = w === 'wind' && (g.state.daily?.leaves || 0) < LEAVES_PER_DAY;
    if (catchable && g.t > (g.nextLeaf || 0)) {
      g.nextLeaf = g.t + 4 + Math.random() * 5;
      g.gusts.push(leaf(true, w));
    }
  }
  for (const l of g.gusts) {
    l.x += l.vx * dt;
    l.y = l.y0 + Math.sin(g.t * l.wobble + l.phase) * 10 + (l.x / W) * l.fall;
  }
  // Lightning.
  if (outside && w === 'storm' && g.t > (g.nextFlash || 0)) {
    g.nextFlash = g.t + 5 + Math.random() * 9;
    g.flashAt = g.t;
    g.bolt = { x: 40 + Math.random() * (W - 80), seed: Math.random() * 1000 };
  }
  // Splashing.
  if (!outside) return;
  const key = placeOf(g) + ':' + g.player.c + ',' + g.player.r;
  if (key === g.lastStep) return;
  g.lastStep = key;
  const i = puddleAt(g, g.player.c, g.player.r);
  if (i < 0) return;
  const p = tileCenter(g.player.c, g.player.r);
  for (let k = 0; k < 6; k++) g.effects.push({ kind: 'splash', x: p.x + (k - 2.5) * 3, y: p.y + 4, vx: (k - 2.5) * 14, t0: g.t });
  const find = splashPuddle(g.state, placeOf(g), i, g.wxSpots.puddles[i]);
  if (find !== null) hooks.splash(find, i);
}

function leaf(catchable, weather) {
  const y0 = 50 + Math.random() * (H - 140);
  return { x: -10, y0, y: y0, vx: (weather === 'wind' ? 50 : 90) + Math.random() * 40, wobble: 1.5 + Math.random() * 2,
    phase: Math.random() * 6, fall: 20 + Math.random() * 40, catchable, golden: false, hue: Math.floor(Math.random() * 3) };
}

// Tapping a leaf on the wind. Screen coordinates.
export function tapLeaf(g, x, y) {
  const i = g.gusts?.findIndex(l => l.catchable && Math.hypot(l.x - x, l.y - y) < 14) ?? -1;
  if (i < 0) return null;
  const got = catchLeaf(g.state, Math.random);
  g.gusts.splice(i, 1);
  return got;
}

// Is your partner in this place, close to you?
export function partnerClose(g, d = 2) {
  const place = placeOf(g);
  return g.others.some(o => {
    const there = place === 'meadow' ? o.scene === 'jar' : o.scene === 'map' && o.mapId === g.mapId;
    if (!there) return false;
    const oc = Math.round((o.x - 24 - 8) / 16), or = Math.round((o.y - FEET - 100 - 8) / 16);
    return Math.abs(oc - g.player.c) <= d && Math.abs(or - g.player.r) <= d;
  });
}
