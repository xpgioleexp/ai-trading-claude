// Panels, toasts and the HUD: the parts of the game drawn as HTML over the jar.
import {
  ITEMS, FISH, CROPS, FORAGE, TREE_FRUIT, MINERALS, BAG_SLOTS, TOOL_TIERS, ROD_ZONE, PICK_POWER,
  SKIN_TONES, HAIR_COLORS, HAIR_STYLES, OUTFIT_COLORS, OUTFIT_STYLES,
} from './data.js';
import { HATS, MATERIALS_FOR_SALE } from './crafting.js';
import * as R from './rules.js';
import { iconURL } from './sprites.js';
import { avatarSprite } from './avatar.js';
import { dayOfSeason } from './clock.js';
import { S, partnerId } from './shared.js';
import { cloud, setDoc, newId, now } from './cloud.js';
import { rngFor } from './rng.js';

const $ = s => document.querySelector(s);

export function esc(text) {
  return String(text ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// ---------- toasts ----------

export function toast(text, iconId) {
  const box = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = (iconId ? `<img src="${iconURL(iconId)}" alt="">` : '') + `<span>${esc(text)}</span>`;
  box.append(el);
  while (box.children.length > 3) box.firstChild.remove();
  setTimeout(() => el.classList.add('out'), 2600);
  setTimeout(() => el.remove(), 3000);
}

// ---------- sheet ----------

let onClose = null;
let opener = null;
let refresher = null;
let sheetKey = null;

// refresh: called again when shared data changes, to redraw the open panel.
export function openSheet(title, html, bind, close, refresh) {
  const sheet = $('#sheet');
  const body = $('#sheet-body');
  const same = !sheet.hidden && refresh && sheetKey === title;
  if (!sheet.hidden && onClose) onClose();
  if (!same) opener = document.activeElement;
  const scroll = same ? body.scrollTop : 0;
  $('#sheet-title').textContent = title;
  body.innerHTML = html;
  sheet.hidden = false;
  onClose = close || null;
  refresher = refresh || null;
  sheetKey = title;
  if (bind) bind(body);
  body.scrollTop = scroll;
  if (!same) $('#sheet-close').focus({ preventScroll: true });
}

// Redraw the open panel unless the person is typing in it.
export function refreshSheet() {
  if ($('#sheet').hidden || !refresher) return;
  const a = document.activeElement;
  if (a && a.closest && a.closest('#sheet') && /INPUT|TEXTAREA|SELECT/.test(a.tagName)) return;
  refresher();
}

export function closeSheet() {
  const sheet = $('#sheet');
  if (sheet.hidden) return;
  sheet.hidden = true;
  $('#sheet-body').innerHTML = '';
  if (onClose) onClose();
  onClose = null;
  refresher = null;
  sheetKey = null;
  if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
}

export function sheetOpen() {
  return !$('#sheet').hidden;
}

function icon(id, cls = '') {
  return `<img class="icon ${cls}" src="${iconURL(id)}" alt="" width="32" height="32">`;
}

// ---------- HUD ----------

export function updateHud(g) {
  $('#pebbles').textContent = g.state.pebbles.toLocaleString();
  const h = g.date.getHours(), m = g.date.getMinutes();
  const time = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
  const weather = { sun: 'Clear', rain: 'Rain', snow: 'Snow', fog: 'Fog' }[g.weather];
  const when = `${cap(g.season)} ${dayOfSeason(g.today)} · ${g.debugHour != null ? `${g.debugHour}:00 (test)` : time}`;
  $('#clock').textContent = g.scene === 'mine'
    ? `${R.BAND_NAMES[R.bandOf(g.layer)]} layer ${g.layer} of 30`
    : g.scene === 'home'
      ? `${g.room?.name || 'Home'} · tap Build to furnish`
      : `${cap(g.season)} ${dayOfSeason(g.today)} · ${weather} · ${g.debugHour != null ? `${g.debugHour}:00 (test)` : time}`;
  const leave = $('#btn-leave');
  // Inside your home you leave through the door mat; in the cave there's also a button.
  leave.hidden = g.scene !== 'mine';
  leave.textContent = g.scene === 'home' ? 'Go outside' : 'Leave cave';
}

// ---------- bag ----------

export function openBag(g) {
  const s = g.state;
  const slots = [];
  for (let i = 0; i < BAG_SLOTS; i++) {
    const slot = s.bag[i];
    slots.push(slot
      ? `<button class="slot" data-i="${i}" aria-label="${esc(ITEMS[slot.id].name)}, ${slot.n}">${icon(slot.id)}<span class="count">${slot.n}</span></button>`
      : '<div class="slot empty" aria-hidden="true"></div>');
  }
  const html = `
    <div class="bag-grid">${slots.join('')}</div>
    <p class="detail" id="bag-detail">Tap an item to see what it is. Sell things in the shipping crate.</p>
    <div class="tools">
      <div><span class="label">Fishing rod</span><strong>${TOOL_TIERS[s.tools.rod]}</strong></div>
      <div><span class="label">Pickaxe</span><strong>${TOOL_TIERS[s.tools.pick]}</strong></div>
      <div><span class="label">Bites left today</span><strong>${s.daily.bites}</strong></div>
    </div>
    <div class="row-actions" id="bag-actions"></div>
    <div class="row-actions"><button class="btn" id="open-log">Collection log</button><button class="btn" id="open-kitchen">Cook</button><button class="btn" id="open-craft">Craft</button></div>`;
  openSheet('Bag', html, body => {
    body.querySelectorAll('.slot[data-i]').forEach(btn => btn.addEventListener('click', () => {
      body.querySelectorAll('.slot').forEach(b => b.classList.remove('picked'));
      btn.classList.add('picked');
      const slot = s.bag[+btn.dataset.i];
      const item = ITEMS[slot.id];
      const extra = item.cat === 'fish' && s.log.fish[item.id] ? ` · Best ${s.log.fish[item.id].best} cm` : '';
      body.querySelector('#bag-detail').textContent = `${item.name} · ${catName(item.cat)} · Sells for ${item.price} pebbles${extra}`;
      const actions = body.querySelector('#bag-actions');
      actions.innerHTML = partnerId() ? `<button class="btn ghost" id="give">Give 1 to your partner</button>` : '';
      actions.querySelector('#give')?.addEventListener('click', async () => {
        if (!R.removeItem(s, item.id, 1)) return;
        g.save();
        await setDoc(`gifts/${newId()}`, { from: cloud.me, to: partnerId(), item: item.id, n: 1, at: now(), opened: false }).catch(() => {});
        toast(`Sent a ${item.name.toLowerCase()} to their mailbox.`, item.id);
        openBag(g);
      });
    }));
    body.querySelector('#open-log').addEventListener('click', () => openLog(g));
    body.querySelector('#open-kitchen').addEventListener('click', () => g.openKitchen?.());
    body.querySelector('#open-craft').addEventListener('click', () => g.openCrafting?.());
  });
}

function catName(cat) {
  return { fish: 'Fish', junk: 'Junk', crop: 'Crop', seed: 'Seeds', forage: 'Forage', mineral: 'Mineral', fossil: 'Fossil', dish: 'Dish', material: 'Material', toy: 'Toy', gift: 'Gift', made: 'Made by you' }[cat];
}

// ---------- collection log ----------

export function openLog(g, tab = 'fish') {
  const s = g.state;
  const groups = {
    fish: FISH.map(f => f.id),
    finds: MINERALS.map(m => m.id),
    nature: [...CROPS.map(c => c.id), ...FORAGE.map(f => f.id), ...Object.values(TREE_FRUIT).map(f => f.id)],
  };
  const ids = groups[tab];
  const found = ids.filter(id => s.log.found[id]).length;
  const cells = ids.map(id => {
    const item = ITEMS[id];
    const have = s.log.found[id];
    let note = '';
    if (tab === 'fish' && have) note = `${s.log.fish[id]?.best ?? '?'} cm`;
    else if (tab === 'fish') note = fishHint(item);
    else if (!have) note = item.season ? cap(item.season) : '';
    return `<li class="${have ? 'got' : 'missing'}">${icon(id, have ? '' : 'silhouette')}<span class="name">${have ? esc(item.name) : '???'}</span><span class="note">${esc(note)}</span></li>`;
  }).join('');
  const tabs = [['fish', 'Fish'], ['finds', 'Mine finds'], ['nature', 'Garden & forage']]
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  openSheet('Collection log', `
    <div class="tabs">${tabs}</div>
    <p class="detail">${found} of ${ids.length} found</p>
    <ul class="log">${cells}</ul>`, body => {
    body.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => openLog(g, b.dataset.tab)));
  });
}

function fishHint(f) {
  const bits = [];
  if (f.seasons) bits.push(f.seasons.map(cap).join('/'));
  if (f.time === 'night') bits.push('Night');
  if (f.time === 'day') bits.push('Day');
  if (f.weather === 'rain') bits.push('Rain');
  return bits.join(' · ') || 'Any time';
}

// ---------- shop ----------

export function openShop(g) {
  const s = g.state;
  const stock = [...R.shopStock(g.season), ...MATERIALS_FOR_SALE];
  const rows = stock.map(item => {
    const it = ITEMS[item.id];
    return `<li>${icon(item.id)}<span class="name">${esc(it.name)}<small>${esc(it.crop ? growText(it.crop) : 'For crafting')}</small></span>
      <button class="btn small" data-id="${item.id}" data-price="${item.price}" ${s.pebbles < item.price ? 'disabled' : ''}>Buy · ${item.price}</button></li>`;
  }).join('');
  openSheet('Beetle shop', `
    <p class="detail">“Fresh ${cap(g.season)} seeds today. Plant them in your garden beds and water them every day.”</p>
    <ul class="list">${rows}</ul>
    <p class="detail">You have <strong>${s.pebbles}</strong> pebbles.</p>`, body => {
    body.querySelectorAll('button[data-id]').forEach(b => b.addEventListener('click', () => {
      if (R.buy(s, b.dataset.id, +b.dataset.price)) {
        g.save();
        toast('Bought ' + ITEMS[b.dataset.id].name, b.dataset.id);
        openShop(g);
      } else toast(R.bagFull(s, b.dataset.id) ? 'Your bag is full.' : 'Not enough pebbles.');
    }));
  });
}

function growText(cropId) {
  const c = CROPS.find(x => x.id === cropId);
  return `${c.days} days${c.regrow ? `, then every ${c.regrow}` : ''} · sells for ${c.price}`;
}

// ---------- shipping crate ----------

export function openCrate(g) {
  const s = g.state;
  const sellable = s.bag.filter(slot => ITEMS[slot.id].cat !== 'seed')
    .reduce((acc, slot) => { acc[slot.id] = (acc[slot.id] || 0) + slot.n; return acc; }, {});
  const bagRows = Object.entries(sellable).map(([id, n]) => `
    <li>${icon(id)}<span class="name">${esc(ITEMS[id].name)}<small>${n} in bag · ${ITEMS[id].price} each</small></span>
      <span class="btns"><button class="btn small" data-add="${id}" data-n="1">Add 1</button>${n > 1 ? `<button class="btn small" data-add="${id}" data-n="${n}">All</button>` : ''}</span></li>`).join('');
  const crateRows = s.crate.map(slot => `
    <li>${icon(slot.id)}<span class="name">${esc(ITEMS[slot.id].name)}<small>${slot.n} × ${ITEMS[slot.id].price}</small></span>
      <button class="btn small ghost" data-take="${slot.id}">Take back</button></li>`).join('');
  openSheet('Shipping crate', `
    <p class="detail">Things in the crate are collected overnight. You'll get <strong>${R.crateValue(s)}</strong> pebbles tomorrow morning.</p>
    ${s.crate.length ? `<h3>In the crate</h3><ul class="list">${crateRows}</ul>` : ''}
    <h3>From your bag</h3>
    ${bagRows ? `<ul class="list">${bagRows}</ul>` : '<p class="detail">Nothing to sell yet. Go fishing, dig in the cave or pick things in the meadow.</p>'}`, body => {
    body.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
      R.putInCrate(s, b.dataset.add, +b.dataset.n);
      g.save();
      openCrate(g);
    }));
    body.querySelectorAll('[data-take]').forEach(b => b.addEventListener('click', () => {
      if (!R.takeFromCrate(s, b.dataset.take)) toast('Your bag is full.');
      g.save();
      openCrate(g);
    }));
  });
}

// ---------- workbench ----------

export function openWorkbench(g) {
  const s = g.state;
  const card = (tool, label, stat) => {
    const up = R.nextUpgrade(s, tool);
    if (!up) return `<li><span class="name">${label}<small>${TOOL_TIERS[s.tools[tool]]} · fully upgraded</small></span></li>`;
    const have = R.countItem(s, up.ore);
    const ok = have >= up.count && s.pebbles >= up.pebbles;
    return `<li>${icon(up.ore)}<span class="name">${label}: ${TOOL_TIERS[s.tools[tool]]} → ${up.name}<small>${stat(up.tier)} · needs ${up.count} ${esc(ITEMS[up.ore].name)} (you have ${have}) and ${up.pebbles} pebbles</small></span>
      <button class="btn small" data-tool="${tool}" ${ok ? '' : 'disabled'}>Upgrade</button></li>`;
  };
  openSheet('Workbench', `
    <p class="detail">Bring ore up from the cave to make better tools.</p>
    <ul class="list">
      ${card('rod', 'Fishing rod', t => `Catch zone ${ROD_ZONE[s.tools.rod]} → ${ROD_ZONE[t]}`)}
      ${card('pick', 'Pickaxe', t => `Power ${PICK_POWER[s.tools.pick]} → ${PICK_POWER[t]}`)}
    </ul>
    <div class="row-actions"><button class="btn ghost" id="to-craft">Back to crafting</button></div>`, body => {
    body.querySelector('#to-craft').addEventListener('click', () => g.openCrafting?.());
    body.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => {
      if (R.upgradeTool(s, b.dataset.tool)) {
        g.save();
        toast(`Your ${b.dataset.tool === 'rod' ? 'fishing rod' : 'pickaxe'} is now ${TOOL_TIERS[s.tools[b.dataset.tool]]}!`);
        openWorkbench(g);
      }
    }));
  });
}

// ---------- garden ----------

export function openSeedPicker(g, bedIndex, onPlant) {
  const s = g.state;
  const seeds = [...new Set(s.bag.filter(slot => ITEMS[slot.id].cat === 'seed').map(slot => slot.id))];
  const rows = seeds.map(id => `<li>${icon(id)}<span class="name">${esc(ITEMS[id].name)}<small>${R.countItem(s, id)} in bag · ${esc(growText(ITEMS[id].crop))}</small></span>
    <button class="btn small" data-seed="${id}">Plant</button></li>`).join('');
  openSheet('Plant a seed', seeds.length
    ? `<ul class="list">${rows}</ul><p class="detail">Water once a day. Plants grow overnight, and they never wilt if you miss a day.</p>`
    : '<p class="detail">You have no seeds. The beetle shop at the back of the jar sells them.</p>', body => {
    body.querySelectorAll('[data-seed]').forEach(b => b.addEventListener('click', () => {
      if (R.plantBed(s, bedIndex, b.dataset.seed)) {
        g.save();
        closeSheet();
        onPlant(b.dataset.seed);
      }
    }));
  });
}

// ---------- mine elevator ----------

export function openElevator(g, onPick) {
  const stops = R.elevatorStops(g.state.mine.deepest);
  openSheet('Into the cave', `
    <p class="detail">The deepest you've dug is layer ${g.state.mine.deepest}. Where do you want to start?</p>
    <div class="row-actions">${stops.map(s => `<button class="btn" data-layer="${s}">${R.BAND_NAMES[R.bandOf(s)]} · layer ${s}</button>`).join('')}</div>`, body => {
    body.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      onPick(+b.dataset.layer);
    }));
  });
}

// ---------- mailbox ----------

const TIPS = [
  'Rain waters every garden bed for you. Fish bite differently in the rain too.',
  'Eels and catfish only come out at night.',
  'Every layer of the cave has a ladder hidden under one plain stone.',
  'Copper ore makes a copper pickaxe at the workbench. It breaks rocks twice as fast.',
  'The shipping crate pays out the next morning. Put in anything you want to sell.',
  'Shake the fruit tree once a day. Each season it grows something different.',
  'A golden carp has been seen in the pond. It is very hard to reel in.',
  'Hold the screen to lift the green catch zone while reeling. Let go to drop it.',
  'Seasons change every week. Seeds from the shop change with them.',
  'Forage appears in new spots each morning. Look for the little glints.',
  'Deeper cave layers are darker and the rocks are tougher, but the gems are better.',
];

export function letters(g) {
  const tip = TIPS[Math.floor(rngFor(g.state.seed, 'tip', g.today)() * TIPS.length)];
  return [
    {
      from: 'The beetle shopkeeper',
      title: `${cap(g.season)}, day ${dayOfSeason(g.today)}`,
      body: tip,
    },
    {
      from: 'Little Us',
      title: 'Welcome to your jar',
      body: 'This little world is yours. Fish in the pond, dig down through the soil, grow a garden and fill your collection log. Your partner will be able to join you here once the jar is connected to your Little Us account. Notes and gifts between you will arrive in this mailbox.',
    },
  ];
}

export function openMail(g) {
  g.state.mailRead = g.today;
  g.save();
  const html = letters(g).map(l => `<article class="letter"><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p><p class="from">${esc(l.from)}</p></article>`).join('');
  openSheet('Mailbox', html);
}

// ---------- wardrobe ----------

export function openWardrobe(g, firstTime = false) {
  const s = g.state;
  const look = { ...s.avatar };
  const swatches = (key, colors) => colors.map((c, i) =>
    `<button class="swatch ${look[key] === i ? 'on' : ''}" data-key="${key}" data-v="${i}" style="background:${c}" aria-label="${key} option ${i + 1}" aria-pressed="${look[key] === i}"></button>`).join('');
  const unlocked = s.unlocked || {};
  const words = (key, names, allowed = () => true) => names.map((n, i) => (allowed(i)
    ? `<button class="chip ${(look[key] || 0) === i ? 'on' : ''}" data-key="${key}" data-v="${i}" aria-pressed="${(look[key] || 0) === i}">${n}</button>` : '')).join('');
  const hatChoices = words('hat', HATS, i => i === 0 || unlocked['hat' + i]);
  const lockedNote = Object.keys(unlocked).length ? '' : '<p class="detail small">Craft hats and a cozy sweater at the workbench to add them here.</p>';
  const html = `
    ${firstTime ? '<p class="detail">Make your little you. You can change this any time from More, or at a wardrobe in your home.</p>' : ''}
    <div class="wardrobe">
      <canvas id="preview" width="64" height="96" aria-label="Your avatar"></canvas>
      <div class="options">
        <div class="opt"><span class="label">Skin</span><div class="choices">${swatches('skin', SKIN_TONES)}</div></div>
        <div class="opt"><span class="label">Hair</span><div class="choices">${words('hairStyle', HAIR_STYLES)}</div></div>
        <div class="opt"><span class="label">Hair colour</span><div class="choices">${swatches('hairColor', HAIR_COLORS)}</div></div>
        <div class="opt"><span class="label">Outfit</span><div class="choices">${words('outfitStyle', OUTFIT_STYLES, i => i < 3 || unlocked['style' + i])}</div></div>
        <div class="opt"><span class="label">Hat</span><div class="choices">${hatChoices}</div>${lockedNote}</div>
        <div class="opt"><span class="label">Outfit colour</span><div class="choices">${swatches('outfit', OUTFIT_COLORS)}</div></div>
      </div>
    </div>
    <div class="row-actions"><button class="btn" id="save-look">Save look</button></div>`;
  let spin = 0;
  let timer = null;
  const draw = () => {
    const c = document.querySelector('#preview');
    if (!c) return;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 64, 96);
    ctx.drawImage(avatarSprite(look, [0, 3, 1, 2][spin % 4], 0), 0, 0, 64, 96);
  };
  openSheet(firstTime ? 'Welcome to your jar' : 'Wardrobe', html, body => {
    draw();
    timer = setInterval(() => { spin++; draw(); }, 900);
    body.querySelectorAll('[data-key]').forEach(b => b.addEventListener('click', () => {
      look[b.dataset.key] = +b.dataset.v;
      body.querySelectorAll(`[data-key="${b.dataset.key}"]`).forEach(x => {
        const on = x === b;
        x.classList.toggle('on', on);
        x.setAttribute('aria-pressed', on);
      });
      draw();
    }));
    body.querySelector('#save-look').addEventListener('click', () => {
      s.avatar = { ...look, made: true };
      g.save();
      closeSheet();
      toast(firstTime ? 'Tap the meadow to walk around.' : 'Look saved.');
    });
  }, () => clearInterval(timer));
}
