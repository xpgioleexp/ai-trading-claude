// Home panels: upgrade the house, add and switch rooms, furnish, decorate walls.
import { cloud, setDoc, updateDoc, deleteDoc, newId, now } from './cloud.js';
import { S } from './shared.js';
import { openSheet, closeSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { addItem, removeItem } from './rules.js';
import { nameOf } from './together.js';
import { makeCanvas } from './sprites.js';
import {
  HOUSE_LEVELS, ROOM_PRICE, ROOM_BY_ID, FURNITURE, FURNITURE_BY_TYPE, WALL_ITEMS, WALL_BY_TYPE, WALLPAPERS, FLOORS,
  WALL_SLOTS, nextLevel, missingFor, payFor, addableRooms, maxRooms,
} from './home.js';
import { FURNITURE_SETS } from './furniture-data.js';
import { furnitureSprite, wallItemSprite, wallpaperTile, floorTile, houseSprite } from './home-art.js';

export function houseLevel() {
  return S.house?.level || 0;
}

export function roomsList() {
  return Object.entries(S.rooms).map(([id, r]) => ({ id, ...r })).sort((a, b) => (a.order || 0) - (b.order || 0));
}

// Free pieces every home starts with, so the first room isn't bare.
const STARTER = [
  { type: 'single_bed', c: 3, r: 4 },
  { type: 'rug_round', c: 7, r: 6 },
  { type: 'armchair', c: 10, r: 5 },
  { type: 'floor_lamp', c: 4, r: 7 },
  { type: 'houseplant', c: 13, r: 4 },
];

// Every home starts with a furnished living room.
export async function ensureFirstRoom() {
  let id = roomsList()[0]?.id;
  if (!id) {
    id = 'room-living';
    const room = { type: 'living', name: 'Living room', wallpaper: 'linen', floor: 'planks', order: 0, by: cloud.me, at: now() };
    await setDoc(`rooms/${id}`, room).catch(() => {});
    S.rooms[id] = room;
  }
  const room = S.rooms[id];
  const empty = !Object.values(S.furniture).some(f => f.room === id);
  if (!room.starter && empty) {
    for (const piece of STARTER) {
      const key = 'starter-' + piece.type;
      const doc = { room: id, ...piece, by: cloud.me, at: now(), starter: true };
      S.furniture[key] = doc;
      setDoc(`furniture/${key}`, doc).catch(() => {});
    }
    S.rooms[id] = { ...room, starter: true };
    updateDoc(`rooms/${id}`, { starter: true }).catch(() => {});
  }
  return id;
}

const icons = new Map();
export function pic(key, src, w = 48, h = 48) {
  if (!icons.has(key)) {
    const c = makeCanvas(w, h);
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const scale = Math.min(w / src.width, h / src.height, 2);
    const dw = Math.round(src.width * scale), dh = Math.round(src.height * scale);
    x.drawImage(src, Math.round((w - dw) / 2), h - dh, dw, dh);
    icons.set(key, c.toDataURL());
  }
  return icons.get(key);
}

function costText(cost) {
  const parts = [`${cost.pebbles} pebbles`];
  for (const [id, n] of Object.entries(cost.items || {})) parts.push(`${n} ${ITEMS[id].name.toLowerCase()}`);
  return parts.join(', ');
}

// ---------- the house ----------

export function openHome(g) {
  const level = houseLevel();
  const next = nextLevel(level);
  const rooms = roomsList();
  const addable = addableRooms(level, rooms);
  const missing = next ? missingFor(g.state, next.cost) : [];
  const html = `
    <div class="house-card">
      <img src="${pic('house' + level, houseSprite(level, false), 96, 96)}" alt="" width="96" height="96">
      <div><p class="prompt">${esc(HOUSE_LEVELS[level].name)}</p>
        <p class="detail">${rooms.length} of ${maxRooms(level)} rooms</p></div>
    </div>
    ${next ? `<section class="qcard">
      <p class="prompt">Build a ${esc(next.name.toLowerCase())}</p>
      <p class="detail">Room for ${next.rooms} rooms. Costs ${esc(costText(next.cost))}.</p>
      ${missing.length ? `<p class="detail small">Still needed: ${missing.map(m => `${m.need - m.have} more ${m.id === 'pebbles' ? 'pebbles' : esc(ITEMS[m.id].name.toLowerCase())}`).join(', ')}. Stone and ore come from the cave.</p>` : ''}
      <button class="btn" id="upgrade" ${missing.length ? 'disabled' : ''}>Build it</button>
    </section>` : '<p class="detail done">Your home is fully built.</p>'}
    <section><h3>Rooms</h3>
      <ul class="list">${rooms.map(r => `<li><span class="name">${esc(r.name)}<small>${esc(ROOM_BY_ID[r.type]?.name || '')} · ${Object.values(S.furniture).filter(f => f.room === r.id).length} pieces</small></span>
        <span class="btns"><button class="btn small" data-go="${r.id}">Go in</button></span></li>`).join('')}</ul>
      ${addable.length ? `<div class="form"><label class="label" for="room-type">Add a room (${ROOM_PRICE} pebbles)</label>
        <div class="inline"><select id="room-type">${addable.map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')}</select>
        <button class="btn small" id="add-room" ${g.state.pebbles < ROOM_PRICE ? 'disabled' : ''}>Add</button></div></div>`
      : `<p class="detail small">${rooms.length >= maxRooms(level) ? 'Build a bigger home for more rooms.' : ''}</p>`}
    </section>`;
  openSheet('Your home', html, body => {
    body.querySelector('#upgrade')?.addEventListener('click', async () => {
      if (!payFor(g.state, next.cost)) return toast('Not enough yet.');
      g.save();
      await setDoc('home/house', { level: next.level, by: cloud.me, at: now() }).catch(() => {});
      toast(`You built a ${next.name.toLowerCase()}!`);
      setTimeout(() => openHome(g), 200);
    });
    body.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.enterHome(b.dataset.go);
    }));
    body.querySelector('#add-room')?.addEventListener('click', async () => {
      const type = body.querySelector('#room-type').value;
      if (g.state.pebbles < ROOM_PRICE) return toast('Not enough pebbles.');
      g.state.pebbles -= ROOM_PRICE;
      g.save();
      const id = 'room-' + newId();
      await setDoc(`rooms/${id}`, { type, name: ROOM_BY_ID[type].name, wallpaper: type === 'bedroom' ? 'rose_floral' : 'linen', floor: 'planks', order: rooms.length, by: cloud.me, at: now() }).catch(() => {});
      toast(`Added the ${ROOM_BY_ID[type].name.toLowerCase()}.`);
      setTimeout(() => openHome(g), 200);
    });
  }, null, () => openHome(g));
}

// ---------- furnishing a room ----------

let furnishSet = 'Classic';
let furnishQuery = '';
let wallSet = 'Classic';
const MAX_RESULTS = 60;
const matches = (name, q) => name.toLowerCase().includes(q.trim().toLowerCase());
const WALL_SETS = () => ['Classic', ...new Set(WALL_ITEMS.filter(w => w.set).map(w => w.set))];
// A style picker and a search box, for catalogues too long to show at once.
const pickerHtml = (sets, current, query, label) => `<div class="picker">
  <label class="sr" for="pick-set">${label}</label>
  <select id="pick-set">${sets.map(st => `<option value="${esc(st)}" ${st === current ? 'selected' : ''}>${esc(st)}</option>`).join('')}</select>
  <label class="sr" for="pick-search">Search</label>
  <input id="pick-search" type="search" placeholder="Search everything" value="${esc(query)}" autocomplete="off">
</div>`;

export function openFurnish(g, tab = 'furniture') {
  const room = S.rooms[g.roomId];
  if (!room) return openHome(g);
  const tabs = [['furniture', 'Furniture'], ['walls', 'Walls'], ['paper', 'Wallpaper'], ['floor', 'Floor'], ['here', 'In this room'], ['rooms', 'Rooms']]
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  let inner = '';
  if (tab === 'furniture') {
    // Sets keep the catalogue short: pick one to browse.
    const searching = furnishQuery.trim().length > 0;
    const found = searching ? FURNITURE.filter(f => !f.special && matches(f.name, furnishQuery)) : [];
    const inSet = searching ? found.slice(0, MAX_RESULTS) : FURNITURE.filter(f => !f.special && (f.set || 'Classic') === furnishSet);
    const cats = searching ? ['Results'] : [...new Set(inSet.map(f => f.category))];
    const buyable = FURNITURE.filter(f => !f.special).length;
    const made = g.state.bag.filter(slot => ITEMS[slot.id]?.furniture && FURNITURE_BY_TYPE[ITEMS[slot.id].furniture]);
    inner = `${made.length ? `<h3>In your bag</h3><div class="decor-grid">${made.map(slot => `
        <button class="decor" data-place-made="${slot.id}"><img src="${pic('f-' + ITEMS[slot.id].furniture, furnitureSprite(ITEMS[slot.id].furniture))}" alt="" width="48" height="48"><span>${esc(ITEMS[slot.id].name)}</span><small>${slot.n} in bag</small></button>`).join('')}</div>` : ''}
      <p class="detail">You have <strong>${g.state.pebbles}</strong> pebbles. ${buyable} pieces in ${FURNITURE_SETS.length} styles. Pick a piece, then tap the floor twice to place it. Lots can also be crafted at the workbench.</p>
      ${pickerHtml(FURNITURE_SETS, furnishSet, furnishQuery, 'Style')}
      ${searching ? `<p class="detail small">${found.length} found${found.length > MAX_RESULTS ? `, showing the first ${MAX_RESULTS}` : ''}.</p>` : ''}
      ${cats.map(cat => `${cats.length > 1 ? `<h3>${esc(cat)}</h3>` : ''}<div class="decor-grid">${inSet.filter(f => searching || f.category === cat).map(f => `
        <button class="decor" data-buy="${f.type}" ${g.state.pebbles < f.price ? 'disabled' : ''}>
          <img src="${pic('f-' + f.type, furnitureSprite(f.type))}" alt="" width="48" height="48"><span>${esc(f.name)}</span><small>${f.price}</small></button>`).join('')}</div>`).join('')}`;
  } else if (tab === 'walls') {
    const onWall = Object.entries(S.wallitems).filter(([, w]) => w.room === g.roomId);
    const taken = new Map(onWall.map(([id, w]) => [w.slot, { id, ...w }]));
    inner = `<p class="detail">Six spots along the back wall. Pick something, then pick a spot.</p>
      <div class="slots">${WALL_SLOTS.map((_, i) => {
        const t = taken.get(i);
        return `<div class="slot-cell">${t ? `<img src="${pic('w-' + t.type, wallItemSprite(t.type), 40, 36)}" alt="" width="40" height="36"><button class="link" data-unhang="${t.id}">Take down</button>` : `<span class="detail small">Spot ${i + 1}</span>`}</div>`;
      }).join('')}</div>
      <label class="label" for="wall-slot">Hang it on</label>
      <select id="wall-slot">${WALL_SLOTS.map((_, i) => `<option value="${i}" ${taken.has(i) ? 'disabled' : ''}>Spot ${i + 1}${taken.has(i) ? ' (taken)' : ''}</option>`).join('')}</select>
      ${pickerHtml(WALL_SETS(), wallSet, furnishQuery, 'Style')}
      <div class="decor-grid">${WALL_ITEMS.filter(w => (furnishQuery.trim() ? matches(w.name, furnishQuery) : wallSet === 'Classic' ? !w.set : w.set === wallSet)).slice(0, MAX_RESULTS * 2).map(w => `<button class="decor" data-hang="${w.type}" ${g.state.pebbles < w.price || taken.size >= WALL_SLOTS.length ? 'disabled' : ''}>
        <img src="${pic('w-' + w.type, wallItemSprite(w.type), 40, 36)}" alt="" width="40" height="36"><span>${esc(w.name)}</span><small>${w.price}</small></button>`).join('')}</div>`;
  } else if (tab === 'paper' || tab === 'floor') {
    const list = (tab === 'paper' ? WALLPAPERS : FLOORS).filter(o => !furnishQuery.trim() || matches(o.name, furnishQuery));
    const current = tab === 'paper' ? room.wallpaper : room.floor;
    inner = `<div class="picker"><label class="sr" for="pick-search">Search</label><input id="pick-search" type="search" placeholder="Search ${tab === 'paper' ? 'wallpapers' : 'floors'}" value="${esc(furnishQuery)}" autocomplete="off"></div>
      <div class="decor-grid">${list.map(o => `<button class="decor ${o.id === current ? 'on' : ''}" data-surface="${o.id}" ${o.id !== current && g.state.pebbles < o.price ? 'disabled' : ''}>
        <img src="${pic((tab === 'paper' ? 'wp-' : 'fl-') + o.id, tab === 'paper' ? tileOf(wallpaperTile(o.id)) : tileOf(floorTile(o.id)))}" alt="" width="48" height="48">
        <span>${esc(o.name)}</span><small>${o.id === current ? 'In use' : o.price ? o.price : 'Free'}</small></button>`).join('')}</div>`;
  } else if (tab === 'here') {
    const here = Object.entries(S.furniture).filter(([, f]) => f.room === g.roomId);
    inner = here.length ? `<ul class="list">${here.map(([id, f]) => `<li><img class="icon" src="${pic('f-' + f.type, furnitureSprite(f.type))}" alt=""><span class="name">${esc(FURNITURE_BY_TYPE[f.type]?.name || f.type)}<small>Placed by ${esc(nameOf(f.by))}</small></span>
      <span class="btns"><button class="btn small ghost" data-move="${id}">Move</button><button class="btn small ghost" data-return="${id}">Return</button></span></li>`).join('')}</ul>
      <p class="detail small">Returning a piece gives back what it cost.</p>` : '<p class="detail">This room is empty. Pick some furniture.</p>';
    inner += `<form id="rename-room" class="inline"><label class="sr" for="room-name">Room name</label><input id="room-name" maxlength="30" value="${esc(room.name)}"><button class="btn small ghost" type="submit">Rename room</button></form>`;
  } else {
    inner = `<ul class="list">${roomsList().map(r => `<li><span class="name">${esc(r.name)}${r.id === g.roomId ? '<small>You are here</small>' : ''}</span>${r.id === g.roomId ? '' : `<button class="btn small" data-go="${r.id}">Go</button>`}</li>`).join('')}</ul>
      <div class="row-actions"><button class="btn ghost" id="house">Build and add rooms</button></div>`;
  }
  openSheet(room.name, `<div class="tabs">${tabs}</div>${inner}`, body => {
    body.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => { furnishQuery = ''; openFurnish(g, b.dataset.tab); }));
    body.querySelector('#pick-set')?.addEventListener('change', e => {
      if (tab === 'walls') wallSet = e.target.value; else furnishSet = e.target.value;
      furnishQuery = '';
      openFurnish(g, tab);
    });
    const search = body.querySelector('#pick-search');
    search?.addEventListener('input', () => {
      furnishQuery = search.value;
      openFurnish(g, tab);
      const again = document.querySelector('#pick-search');
      again?.focus();
      again?.setSelectionRange(again.value.length, again.value.length);
    });
    body.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: b.dataset.buy, furniture: true });
    }));
    body.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: S.furniture[b.dataset.move].type, furniture: true, moveId: b.dataset.move });
    }));
    body.querySelectorAll('[data-place-made]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: ITEMS[b.dataset.placeMade].furniture, furniture: true, fromBag: b.dataset.placeMade });
    }));
    body.querySelectorAll('[data-return]').forEach(b => b.addEventListener('click', () => {
      const f = S.furniture[b.dataset.return];
      if (f.made && addItem(g.state, f.made, 1)) toast('Back in your bag.');
      else {
        const price = f.starter ? 0 : FURNITURE_BY_TYPE[f.type]?.price || 0;
        g.state.pebbles += price;
        toast(`Returned. +${price} pebbles`);
      }
      g.save();
      deleteDoc(`furniture/${b.dataset.return}`);
      setTimeout(() => openFurnish(g, 'here'), 200);
    }));
    body.querySelectorAll('[data-hang]').forEach(b => b.addEventListener('click', async () => {
      const w = WALL_BY_TYPE[b.dataset.hang];
      const slot = +body.querySelector('#wall-slot').value;
      if (Object.values(S.wallitems).some(x => x.room === g.roomId && x.slot === slot)) return toast('That spot is taken.');
      if (g.state.pebbles < w.price) return toast('Not enough pebbles.');
      g.state.pebbles -= w.price;
      g.save();
      await setDoc(`wallitems/${newId()}`, { room: g.roomId, type: w.type, slot, by: cloud.me, at: now() }).catch(() => {});
      toast(`Hung the ${w.name.toLowerCase()}.`);
      setTimeout(() => openFurnish(g, 'walls'), 200);
    }));
    body.querySelectorAll('[data-unhang]').forEach(b => b.addEventListener('click', () => {
      const w = S.wallitems[b.dataset.unhang];
      g.state.pebbles += WALL_BY_TYPE[w.type]?.price || 0;
      g.save();
      deleteDoc(`wallitems/${b.dataset.unhang}`);
      setTimeout(() => openFurnish(g, 'walls'), 200);
    }));
    body.querySelectorAll('[data-surface]').forEach(b => b.addEventListener('click', () => {
      const list = tab === 'paper' ? WALLPAPERS : FLOORS;
      const choice = list.find(o => o.id === b.dataset.surface);
      const field = tab === 'paper' ? 'wallpaper' : 'floor';
      if (room[field] === choice.id) return;
      if (g.state.pebbles < choice.price) return toast('Not enough pebbles.');
      g.state.pebbles -= choice.price;
      g.save();
      updateDoc(`rooms/${g.roomId}`, { [field]: choice.id }).catch(() => {});
      S.rooms[g.roomId] = { ...room, [field]: choice.id };
      toast(`${choice.name} it is.`);
      setTimeout(() => openFurnish(g, tab), 200);
    }));
    body.querySelector('#rename-room')?.addEventListener('submit', e => {
      e.preventDefault();
      const name = body.querySelector('#room-name').value.trim();
      if (name) { updateDoc(`rooms/${g.roomId}`, { name }).catch(() => {}); toast('Renamed.'); }
    });
    body.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => { closeSheet(); g.enterHome(b.dataset.go); }));
    body.querySelector('#house')?.addEventListener('click', () => openHome(g));
  }, null, () => openFurnish(g, tab));
}

// Show a wallpaper or floor as a 3x3 patch instead of one tile.
function tileOf(tile) {
  const c = makeCanvas(48, 48);
  const x = c.getContext('2d');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) x.drawImage(tile, i * 16, j * 16);
  return c;
}

export function placeFurniture(g, { type, moveId, fromBag }, c, r) {
  if (moveId) {
    updateDoc(`furniture/${moveId}`, { c, r }).catch(() => {});
    return true;
  }
  if (fromBag) {
    if (!removeItem(g.state, fromBag, 1)) return false;
    g.save();
    setDoc(`furniture/${newId()}`, { room: g.roomId, type, c, r, by: cloud.me, at: now(), made: fromBag }).catch(() => {});
    return true;
  }
  const price = FURNITURE_BY_TYPE[type]?.price || 0;
  if (g.state.pebbles < price) {
    toast('Not enough pebbles.');
    return false;
  }
  g.state.pebbles -= price;
  g.save();
  setDoc(`furniture/${newId()}`, { room: g.roomId, type, c, r, by: cloud.me, at: now() }).catch(() => {});
  return true;
}
