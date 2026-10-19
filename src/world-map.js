// The map in the phone: a drawn map of wherever you are (the meadow or a jar)
// that fills in as you explore, with the regions' names, the landmarks you've
// found, you, your partner, and pins you both drop on places that matter.
// Pins are shared: pins/<id> { place, c, r, label, by, at }.
import { OBJECTS, MEADOW_WEST, MEADOW_COLS, MEADOW_NORTH, MEADOW_SOUTH, ROWS, MEADOW_REGIONS } from './world.js';
import { MAPS, mapLeft, mapRight, mapTop, mapBottom } from './maps.js';
import { regionAt } from './regions.js';
import { SEASON_GROUND } from './sprites.js';
import { S } from './shared.js';
import { cloud, setDoc, deleteDoc, newId, now } from './cloud.js';
import { openSheet, toast, esc } from './ui.js';
import { nameOf } from './together.js';

export const CHUNK = 8;

// The size, objects and regions of a place.
export function placeInfo(place) {
  if (place === 'meadow') {
    return { name: 'The meadow', c0: -MEADOW_WEST, c1: MEADOW_COLS - 1, r0: -MEADOW_NORTH, r1: ROWS + MEADOW_SOUTH - 1, objects: OBJECTS, regions: MEADOW_REGIONS };
  }
  const map = MAPS[place];
  return { name: map.name, c0: mapLeft(map), c1: mapRight(map) - 1, r0: mapTop(map), r1: mapBottom(map) - 1, objects: map.objects, regions: map.regions || [], ground: map.ground };
}

const chunkKey = (c, r) => Math.floor(c / CHUNK) + ',' + Math.floor(r / CHUNK);

// Marks the bit of the world around you as explored. Returns true if it's new.
export function explore(state, place, c, r) {
  const all = (state.explored ||= {});
  const seen = (all[place] ||= {});
  let added = false;
  // You can see a little way around you: this chunk and the ones touching it.
  for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
    const k = chunkKey(c + dc * CHUNK, r + dr * CHUNK);
    if (!seen[k]) { seen[k] = 1; added = true; }
  }
  return added;
}

export const isExplored = (state, place, c, r) => !!state.explored?.[place]?.[chunkKey(c, r)];

// How much of a place you've seen, 0..1.
export function exploredShare(state, place) {
  const p = placeInfo(place);
  const total = Math.ceil((p.c1 - p.c0 + 1) / CHUNK + 1) * Math.ceil((p.r1 - p.r0 + 1) / CHUNK + 1);
  return Math.min(1, Object.keys(state.explored?.[place] || {}).length / total);
}

// Landmarks you've come across in a place.
export function landmarksFound(state, place) {
  return placeInfo(place).objects.filter(o => o.kind === 'landmark' && !o.sign && isExplored(state, place, o.c, o.r));
}

// ---------- the panel ----------

const TREE_KINDS = new Set(['tree', 'palm', 'pine', 'cactus', 'decotree', 'bamboo', 'fern', 'bigshroom', 'bigtree', 'cloud']);
const WATER_COLORS = { sea: '#5F9FB5', ice: '#B9D9E2', oasis: '#5FB5B0', falls: '#5FA8B5', glow: '#3F7A6A', moon: '#3A3A6A', spring: '#8FC9C0' };

function drawMap(canvas, g, place, scale) {
  const p = placeInfo(place);
  const ctx = canvas.getContext('2d');
  const X = c => (c - p.c0) * scale, Y = r => (r - p.r0) * scale;
  const season = place === 'meadow' ? g.season : MAPS[place].season;
  // ground
  for (let r = p.r0; r <= p.r1; r++) for (let c = p.c0; c <= p.c1; c++) {
    const ground = regionAt(p.regions, c, r)?.ground || p.ground || season;
    ctx.fillStyle = (SEASON_GROUND[ground] || SEASON_GROUND.spring)[(c + r) % 7 ? 0 : 1];
    ctx.fillRect(X(c), Y(r), scale, scale);
  }
  // water, trees, buildings and landmarks
  for (const o of p.objects) {
    const water = /^pond|^water/.test(o.id) || o.pond;
    if (water) {
      ctx.fillStyle = WATER_COLORS[o.kind] || '#79AAA4';
      ctx.fillRect(X(o.c), Y(o.r), o.w * scale, o.h * scale);
    } else if (TREE_KINDS.has(o.kind)) {
      ctx.fillStyle = 'rgba(46,86,52,0.75)';
      ctx.fillRect(X(o.c) + scale * 0.15, Y(o.r) + scale * 0.15, scale * 0.7, scale * 0.7);
    } else if (o.kind === 'scenery' && !o.flat) {
      ctx.fillStyle = 'rgba(80,70,60,0.35)';
      ctx.fillRect(X(o.c) + scale * 0.3, Y(o.r) + scale * 0.3, scale * 0.4, scale * 0.4);
    } else if (o.kind !== 'scenery' && o.kind !== 'landmark') {
      ctx.fillStyle = '#9C7046';
      ctx.fillRect(X(o.c), Y(o.r), Math.max(1, o.w) * scale, Math.max(1, o.h) * scale);
    }
  }
  // fog over what you haven't seen
  ctx.fillStyle = 'rgba(233,220,192,0.94)';
  for (let r = Math.floor(p.r0 / CHUNK) * CHUNK; r <= p.r1; r += CHUNK) for (let c = Math.floor(p.c0 / CHUNK) * CHUNK; c <= p.c1; c += CHUNK) {
    if (!isExplored(g.state, place, c, r)) ctx.fillRect(X(c), Y(r), CHUNK * scale, CHUNK * scale);
  }
  // landmarks you've found
  for (const o of p.objects) {
    if (o.kind !== 'landmark' || !isExplored(g.state, place, o.c, o.r)) continue;
    const x = X(o.c + o.w / 2), y = Y(o.r + o.h / 2), s = Math.max(4, scale * 1.6);
    ctx.fillStyle = o.sign ? '#7A5A3A' : '#B5653A';
    ctx.fillRect(x - s / 2, y - s / 2, s, s);
    ctx.fillStyle = o.sign ? '#C9A272' : '#F2E48A';
    ctx.fillRect(x - s / 4, y - s / 4, s / 2, s / 2);
  }
  // region names
  ctx.font = `bold ${Math.max(9, Math.round(scale * 3))}px sans-serif`;
  ctx.textAlign = 'center';
  for (const reg of p.regions) {
    const cx = (reg.c0 + reg.c1) / 2, cy = (reg.r0 + reg.r1) / 2;
    if (!isExplored(g.state, place, Math.round(cx), Math.round(cy)) && !isExplored(g.state, place, reg.c0 + 4, reg.r0 + 4) && !isExplored(g.state, place, reg.c1 - 4, reg.r1 - 4)) continue;
    ctx.fillStyle = 'rgba(255,250,235,0.85)';
    const w = ctx.measureText(reg.name).width + 8;
    ctx.fillRect(X(cx) - w / 2, Y(cy) - scale * 2.4, w, scale * 3.4);
    ctx.fillStyle = '#4A3A2A';
    ctx.fillText(reg.name, X(cx), Y(cy));
  }
  // pins
  for (const pin of Object.values(S.pins || {})) {
    if (pin.place !== place) continue;
    const x = X(pin.c + 0.5), y = Y(pin.r + 0.5);
    ctx.fillStyle = '#C9283A';
    ctx.beginPath(); ctx.arc(x, y - 6, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 1, y - 6, 2, 6);
  }
  // you and your partner
  const here = g.scene === 'jar' ? 'meadow' : g.scene === 'map' ? g.mapId : null;
  const dot = (c, r, col) => { ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(X(c + 0.5), Y(r + 0.5), 5, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(c + 0.5), Y(r + 0.5), 3.5, 0, Math.PI * 2); ctx.fill(); };
  for (const o of g.others || []) {
    const there = o.scene === 'jar' ? 'meadow' : o.scene === 'map' ? o.mapId : null;
    if (there === place) dot(Math.round((o.x - 32) / 16), Math.round((o.y - 113) / 16), '#5F7FB5');
  }
  if (here === place) dot(g.player.c, g.player.r, '#E0703A');
}

let mapPlace = null;
let pending = null;

export function openMap(g, place = null) {
  const here = g.scene === 'jar' ? 'meadow' : g.scene === 'map' ? g.mapId : 'meadow';
  mapPlace = place || mapPlace || here;
  const p = placeInfo(mapPlace);
  const cols = p.c1 - p.c0 + 1, rows = p.r1 - p.r0 + 1;
  const scale = Math.max(3, Math.floor(640 / cols));
  const visited = ['meadow', ...Object.keys(MAPS).filter(id => g.state.explored?.[id])];
  if (!visited.includes(mapPlace)) visited.push(mapPlace);
  const found = landmarksFound(g.state, mapPlace);
  const pins = Object.entries(S.pins || {}).filter(([, pin]) => pin.place === mapPlace);
  const byRegion = {};
  for (const o of found) (byRegion[p.regions.find(r => r.id === o.region)?.name || p.name] ||= []).push(o.name);
  openSheet('Map', `
    <div class="picker"><label class="sr" for="map-place">Place</label>
      <select id="map-place">${visited.map(id => `<option value="${id}" ${id === mapPlace ? 'selected' : ''}>${esc(placeInfo(id).name)}</option>`).join('')}</select></div>
    <p class="detail">${Math.round(exploredShare(g.state, mapPlace) * 100)}% explored · ${found.length} landmarks found. The map fills in as you walk. Tap anywhere on it to drop a pin for a place that matters to you both.</p>
    <div class="map-wrap"><canvas id="world-map" width="${cols * scale}" height="${rows * scale}"></canvas></div>
    <p class="detail small"><span class="map-key you"></span> You <span class="map-key partner"></span> Your partner <span class="map-key pin"></span> Pins <span class="map-key mark"></span> Landmarks</p>
    ${pending ? `<form id="pin-form" class="inline"><label class="sr" for="pin-label">Name this place</label>
      <input id="pin-label" maxlength="40" placeholder="Where we had our first picnic" autocomplete="off"><button class="btn small" type="submit">Drop pin</button></form>` : ''}
    ${pins.length ? `<h3>Your pins</h3><ul class="list">${pins.map(([id, pin]) => `<li><span class="name">📍 ${esc(pin.label)}<small>Dropped by ${esc(nameOf(pin.by))}</small></span><button class="btn small ghost" data-unpin="${id}">Remove</button></li>`).join('')}</ul>` : ''}
    ${found.length ? `<h3>Landmarks found</h3><ul class="list">${Object.entries(byRegion).map(([reg, names]) => `<li><span class="name">${esc(reg)}<small>${esc(names.join(' · '))}</small></span></li>`).join('')}</ul>` : ''}`, body => {
    const canvas = body.querySelector('#world-map');
    drawMap(canvas, g, mapPlace, scale);
    canvas.addEventListener('click', e => {
      const rect = canvas.getBoundingClientRect();
      const c = p.c0 + Math.floor(((e.clientX - rect.left) / rect.width) * cols);
      const r = p.r0 + Math.floor(((e.clientY - rect.top) / rect.height) * rows);
      pending = { place: mapPlace, c, r };
      openMap(g, mapPlace);
      document.querySelector('#pin-label')?.focus();
    });
    body.querySelector('#map-place')?.addEventListener('change', e => { pending = null; openMap(g, e.target.value); });
    body.querySelector('#pin-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const label = body.querySelector('#pin-label').value.trim();
      if (!label || !pending) return;
      const id = newId();
      const pin = { ...pending, label, by: cloud.me, at: now() };
      S.pins = { ...(S.pins || {}), [id]: pin };
      setDoc(`pins/${id}`, pin).catch(() => {});
      pending = null;
      toast(`Pinned “${label}” on the map.`);
      openMap(g, mapPlace);
    });
    body.querySelectorAll('[data-unpin]').forEach(b => b.addEventListener('click', () => {
      const pins = { ...(S.pins || {}) };
      delete pins[b.dataset.unpin];
      S.pins = pins;
      deleteDoc(`pins/${b.dataset.unpin}`)?.catch?.(() => {});
      openMap(g, mapPlace);
    }));
  });
}

// Opening the map fresh forgets a pin you started but didn't name.
export function openMapFresh(g) {
  pending = null;
  mapPlace = null;
  openMap(g);
}
