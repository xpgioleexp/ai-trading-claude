// Build mode (decorations and residents), the animal care panel, and settings.
import { C } from './content.js';
import { cloud, setDoc, updateDoc, deleteDoc, now } from './cloud.js';
import { S, partnerId, startRain, stopRain, rainingNow } from './shared.js';
import { openSheet, closeSheet, toast, esc, openLog, openWardrobe } from './ui.js';
import { SPECIES_ORDER, SPECIES_INFO, ADOPT_PRICE, actionsFor, currentNeeds, moodWord, cooldownLeft, adopt, care, rename } from './animals.js';
import { nameOf, saveFile, reminderIcs } from './together.js';
import { decorSprite } from './sprites-more.js';
import { makeCanvas } from './sprites.js';
import { openHome } from './home-ui.js';
import { ITEMS } from './data.js';
import { addItem, removeItem } from './rules.js';

// Toys you've crafted (they aren't used up).
function toysIn(g) {
  return [...new Set(g.state.bag.filter(s => ITEMS[s.id]?.cat === 'toy').map(s => s.id))];
}

const decorIcons = new Map();
function decorIcon(type, season) {
  const key = type + season;
  if (!decorIcons.has(key)) {
    const src = decorSprite(type, season);
    const c = makeCanvas(32, 34);
    c.getContext('2d').drawImage(src, Math.round(16 - src.width / 2), 34 - src.height);
    decorIcons.set(key, c.toDataURL());
  }
  return decorIcons.get(key);
}

// ---------- build ----------

export function openBuild(g, tab = 'shop') {
  const tabs = [['shop', 'Decorations'], ['placed', 'In the jar'], ['residents', 'Residents']]
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  let inner = '';
  if (tab === 'shop') {
    const cats = [...new Set(C.decorations.map(d => d.category))];
    const made = g.state.bag.filter(slot => ITEMS[slot.id]?.decor && C.decorByType[ITEMS[slot.id].decor]);
    inner = `${made.length ? `<h3>Made by you</h3><div class="decor-grid">${made.map(slot => `
        <button class="decor" data-place-made="${slot.id}"><img src="${decorIcon(ITEMS[slot.id].decor, g.season)}" alt="" width="48" height="51"><span>${esc(ITEMS[slot.id].name)}</span><small>${slot.n} in bag</small></button>`).join('')}</div>` : ''}
      <p class="detail">You have <strong>${g.state.pebbles}</strong> pebbles. Pick something, then tap a free spot in the jar.</p>
      ${cats.map(cat => `<h3>${esc(cat)}</h3><div class="decor-grid">${C.decorations.filter(d => d.category === cat).map(d => `
        <button class="decor" data-buy="${d.type}" ${g.state.pebbles < d.price ? 'disabled' : ''}>
          <img src="${decorIcon(d.type, g.season)}" alt="" width="48" height="51"><span>${esc(d.name)}</span><small>${d.price}</small></button>`).join('')}</div>`).join('')}`;
  } else if (tab === 'placed') {
    const list = Object.entries(S.decor).map(([id, d]) => ({ id, ...d }));
    inner = list.length ? `<ul class="list">${list.map(d => `<li><img class="icon" src="${decorIcon(d.type, g.season)}" alt=""><span class="name">${esc(C.decorByType[d.type]?.name || d.type)}<small>Placed by ${esc(nameOf(d.by))}</small></span>
        <span class="btns"><button class="btn small ghost" data-move="${d.id}">Move</button><button class="btn small ghost" data-return="${d.id}">Return</button></span></li>`).join('')}</ul>
      <p class="detail small">Returning a decoration gives back what it cost.</p>`
      : '<p class="detail">Nothing placed yet. Decorations stay in the jar for both of you.</p>';
  } else {
    inner = `<ul class="list">${SPECIES_ORDER.map(sp => {
      const doc = S.animals[sp];
      const price = ADOPT_PRICE[sp];
      return `<li><span class="name">${esc(doc?.name || C.species[sp].name)} the ${esc(SPECIES_INFO[sp].label.toLowerCase())}<small>${doc?.adopted ? 'Lives in your jar' : price ? `${price} pebbles to welcome` : 'Free to welcome'}</small></span>
        ${doc?.adopted ? '' : `<button class="btn small" data-adopt="${sp}" ${g.state.pebbles < price ? 'disabled' : ''}>Welcome</button>`}</li>`;
    }).join('')}</ul><p class="detail small">Residents are shared. Their needs never drop very low while you're away.</p>`;
  }
  const home = '<div class="row-actions"><button class="btn" id="build-home">Build your home</button></div>';
  openSheet('Build', `${home}<div class="tabs">${tabs}</div>${inner}`, body => {
    body.querySelector('#build-home').addEventListener('click', () => openHome(g));
    body.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => openBuild(g, b.dataset.tab)));
    body.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: b.dataset.buy });
    }));
    body.querySelectorAll('[data-move]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: S.decor[b.dataset.move].type, moveId: b.dataset.move });
    }));
    body.querySelectorAll('[data-place-made]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      g.startPlacing({ type: ITEMS[b.dataset.placeMade].decor, fromBag: b.dataset.placeMade });
    }));
    body.querySelectorAll('[data-return]').forEach(b => b.addEventListener('click', () => {
      const d = S.decor[b.dataset.return];
      if (d.made && addItem(g.state, d.made, 1)) toast('Back in your bag.');
      else {
        g.state.pebbles += C.decorByType[d.type]?.price || 0;
        toast(`Returned. +${C.decorByType[d.type]?.price || 0} pebbles`);
      }
      g.save();
      deleteDoc(`decor/${b.dataset.return}`);
      setTimeout(() => openBuild(g, 'placed'), 200);
    }));
    body.querySelectorAll('[data-adopt]').forEach(b => b.addEventListener('click', async () => {
      if (await adopt(b.dataset.adopt, g.state)) {
        g.save();
        toast(`${C.species[b.dataset.adopt].name} moved into the jar!`);
        setTimeout(() => openBuild(g, 'residents'), 200);
      }
    }));
  }, null, () => openBuild(g, tab));
}

export function placeDecor(g, { type, moveId, fromBag }, c, r) {
  if (moveId) {
    updateDoc(`decor/${moveId}`, { c, r }).catch(() => {});
    return true;
  }
  if (fromBag) {
    if (!removeItem(g.state, fromBag, 1)) return false;
    g.save();
    setDoc(`decor/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, { type, c, r, by: cloud.me, at: now(), made: fromBag }).catch(() => {});
    return true;
  }
  const price = C.decorByType[type]?.price || 0;
  if (g.state.pebbles < price) {
    toast('Not enough pebbles.');
    return false;
  }
  g.state.pebbles -= price;
  g.save();
  setDoc(`decor/${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, { type, c, r, by: cloud.me, at: now() }).catch(() => {});
  return true;
}

// ---------- animal care ----------

export function openAnimal(g, resident, group = 'care') {
  const sp = resident.species;
  const doc = S.animals[sp];
  if (!doc) return;
  const needs = currentNeeds(doc);
  const bar = (label, v) => `<div class="need"><span class="label">${label}</span><span class="bar"><span style="width:${v}%"></span></span></div>`;
  const groups = [['care', 'Care'], ['play', 'Play'], ['explore', 'Explore']];
  const acts = actionsFor(sp).filter(a => a.group === group);
  const html = `
    <p class="detail">${esc(moodWord(needs))}</p>
    <div class="needs">${bar('Full', needs.full)}${bar('Happy', needs.happy)}${bar('Rested', needs.rested)}${bar('Clean', needs.clean)}</div>
    <div class="tabs">${groups.map(([id, label]) => `<button class="tab ${id === group ? 'on' : ''}" data-group="${id}" aria-pressed="${id === group}">${label}</button>`).join('')}</div>
    <div class="actions">${acts.map(a => {
      const wait = cooldownLeft(doc, a.id);
      return `<button class="btn small" data-act="${a.id}" ${wait ? 'disabled' : ''}>${esc(a.label)}</button>`;
    }).join('')}</div>
    ${sp !== 'marimo' && toysIn(g).length ? `<span class="label">Play with a toy</span><div class="actions">${toysIn(g).map(id => `<button class="btn small" data-toy="${id}" ${cooldownLeft(doc, 'toy') ? 'disabled' : ''}>${esc(ITEMS[id].name)}</button>`).join('')}</div>` : ''}
    <form id="rename" class="inline"><label class="sr" for="pet-name">Name</label><input id="pet-name" maxlength="24" value="${esc(doc.name)}"><button class="btn small ghost" type="submit">Rename</button></form>`;
  openSheet(`${doc.name} the ${SPECIES_INFO[sp].label.toLowerCase()}`, html, body => {
    body.querySelectorAll('[data-group]').forEach(b => b.addEventListener('click', () => openAnimal(g, resident, b.dataset.group)));
    body.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', () => {
      const motion = care(sp, b.dataset.act);
      g.animalReacts(resident, motion, b.dataset.act);
      openAnimal(g, resident, group);
    }));
    body.querySelectorAll('[data-toy]').forEach(b => b.addEventListener('click', () => {
      const motion = care(sp, 'toy');
      g.animalReacts(resident, motion, 'toy');
      toast(`${doc.name} loves the ${ITEMS[b.dataset.toy].name.toLowerCase()}!`);
      openAnimal(g, resident, group);
    }));
    body.querySelector('#rename').addEventListener('submit', e => {
      e.preventDefault();
      const name = body.querySelector('#pet-name').value.trim();
      if (name) { rename(sp, name); toast('Renamed.'); }
    });
  }, () => { g.selected = null; }, () => openAnimal(g, resident, group));
  g.selected = resident;
}

// ---------- settings ----------

const ZONES = ['UTC', 'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Africa/Lagos', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Manila', 'Asia/Singapore', 'Asia/Tokyo', 'Australia/Sydney', 'Pacific/Auckland'];

export function openMore(g) {
  const partner = partnerId();
  const w = S.world || {};
  const zones = [...new Set([w.timeZone, ...ZONES].filter(Boolean))];
  const html = `
    <section><h3>Your partner</h3>
      ${cloud.mode !== 'cloud'
        ? '<p class="detail">This copy of the jar is saved only on this device. Open the jar on claude.ai to share it with your partner.</p>'
        : partner
          ? `<p class="detail">You share this jar with <strong>${esc(nameOf(partner))}</strong>.</p>`
          : '<p class="detail">To invite your partner, open the <strong>Share</strong> menu at the top of this page and invite them by email as an <strong>Editor</strong>. When they open the jar, they\'ll appear here and in the meadow.</p>'}
    </section>
    <section class="form"><h3>The jar</h3>
      <label class="label" for="jar-name">Name</label>
      <form id="name-form" class="inline"><input id="jar-name" maxlength="40" value="${esc(w.name || 'Our little jar')}"><button class="btn small ghost" type="submit">Save</button></form>
      <label class="label" for="tz">Shared time zone (new days start at midnight here)</label>
      <select id="tz">${zones.map(z => `<option ${z === w.timeZone ? 'selected' : ''}>${esc(z)}</option>`).join('')}</select>
    </section>
    <section class="form"><h3>Reminders</h3>
      <p class="detail small">Add calendar alerts for the daily question and Monday missions. Import the file into your calendar app and allow its notifications.</p>
      <form id="remind" class="inline"><label class="sr" for="remind-time">Reminder time</label><input id="remind-time" type="time" value="${esc(g.state.reminder || '19:00')}"><button class="btn small" type="submit">Add calendar alerts</button></form>
    </section>
    <section><h3>More</h3>
      <div class="row-actions">
        <button class="btn ghost" id="m-wardrobe">Wardrobe</button>
        <button class="btn ghost" id="m-log">Collection log</button>
        <button class="btn ghost" id="m-rain">${rainingNow() ? 'Stop the rain' : 'Make it rain'}</button>
        <button class="btn ghost" id="m-export">Download everything</button>
      </div>
    </section>
    <section><h3>Start over</h3>
      <p class="detail small">Resets your own bag, tools, pebbles and logs. Shared things (the garden, decorations, residents, answers and notes) stay.</p>
      <div class="row-actions" id="reset-row"><button class="btn ghost" id="m-reset">Reset my progress</button></div>
    </section>`;
  openSheet('Settings', html, body => {
    body.querySelector('#name-form').addEventListener('submit', e => {
      e.preventDefault();
      updateDoc('world/meta', { name: body.querySelector('#jar-name').value.trim() || 'Our little jar' }).catch(() => {});
      toast('Saved.');
    });
    body.querySelector('#tz').addEventListener('change', e => {
      updateDoc('world/meta', { timeZone: e.target.value }).catch(() => {});
      toast('Time zone saved for both of you.');
    });
    body.querySelector('#remind').addEventListener('submit', e => {
      e.preventDefault();
      g.state.reminder = body.querySelector('#remind-time').value || '19:00';
      g.save();
      saveFile('little-us-reminders.ics', reminderIcs(g.state.reminder), 'text/calendar');
    });
    body.querySelector('#m-wardrobe').addEventListener('click', () => openWardrobe(g));
    body.querySelector('#m-log').addEventListener('click', () => openLog(g));
    body.querySelector('#m-rain').addEventListener('click', () => {
      if (rainingNow()) stopRain(); else startRain();
      closeSheet();
    });
    body.querySelector('#m-export').addEventListener('click', () => {
      const shared = {};
      for (const [k, v] of Object.entries(S)) if (v && typeof v === 'object') shared[k] = v;
      const data = { exportedAt: new Date().toISOString(), mine: g.state, shared };
      saveFile('little-us-jar.json', JSON.stringify(data, null, 2), 'application/json');
    });
    body.querySelector('#m-reset').addEventListener('click', () => {
      const row = body.querySelector('#reset-row');
      row.innerHTML = '<span class="detail">Reset your bag, tools, pebbles and logs?</span><button class="btn" id="m-reset-yes">Yes, reset</button><button class="btn ghost" id="m-reset-no">Keep them</button>';
      row.querySelector('#m-reset-no').addEventListener('click', () => openMore(g));
      row.querySelector('#m-reset-yes').addEventListener('click', () => {
        g.resetMine();
        closeSheet();
        toast('Your progress was reset.');
      });
    });
  });
}
