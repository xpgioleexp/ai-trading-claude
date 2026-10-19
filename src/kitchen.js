// The kitchen: pick ingredients, chop and cook, alone or together.
// Together, one of you chops while the other works the stove, live; each
// device plays its own part and the dish lands in both bags.
import { cloud, setDoc, updateDoc, now, newId } from './cloud.js';
import { S, partnerId } from './shared.js';
import { openSheet, toast, esc } from './ui.js';
import * as R from './rules.js';
import { ITEMS } from './data.js';
import { iconURL } from './sprites.js';
import { RECIPES, RECIPE_BY_ID, MYSTERY, matchRecipe, isIngredient, hintFor, starsFor, CHOP, STOVE, chopTarget, tagsOf } from './cooking.js';
import { nameOf } from './together.js';

const SESSION = 'kitchen/session';
const STALE_MS = 15 * 60000;

let selected = [];
let playing = false;
let myProgress = 0;

// ---------- helpers ----------

function partnerHere() {
  const p = partnerId();
  return !!(p && cloud.room && cloud.room.peers().some(peer => !peer.isMe && peer.by === p));
}

function partnerPresence() {
  const p = partnerId();
  const peer = cloud.room?.peers().find(x => !x.isMe && x.by === p);
  return peer?.presence?.cook || null;
}

function setPresence(cook) {
  cloud.room?.presence({ cook }).catch(() => {});
}

export function activeSession() {
  const s = S.kitchen?.session;
  if (!s || !['waiting', 'cooking'].includes(s.state) || now() - s.at > STALE_MS) return null;
  if (s.roles.chop !== cloud.me && s.roles.stove !== cloud.me) return null;
  // Once both halves are in, the session is over and the kitchen is free again.
  if (S.kitchen[`result-${s.id}--${s.roles.chop}`] && S.kitchen[`result-${s.id}--${s.roles.stove}`]) return null;
  return s;
}

function needsText(r) {
  return r.needs.map(n => (n.startsWith('#') ? `any ${n.slice(1)}` : ITEMS[n]?.name || n)).join(' + ');
}

function stars(n) {
  return '★'.repeat(n) + '☆'.repeat(3 - n);
}

// ---------- the panel ----------

export function openKitchen(g, tab = 'cook') {
  if (playing) return;
  const tabs = [['cook', 'Cook'], ['book', 'Recipe book']]
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  const session = activeSession();
  const inner = session ? sessionHtml(session) : tab === 'book' ? bookHtml(g) : cookHtml(g);
  openSheet('Kitchen', `<div class="tabs">${tabs}</div><div id="kitchen-body">${inner}</div>`, body => {
    body.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => openKitchen(g, b.dataset.tab)));
    if (session) bindSession(g, body, session);
    else if (tab === 'book') bindBook(g, body);
    else bindCook(g, body);
  }, () => { selected = []; }, () => { if (!playing) openKitchen(g, tab); });
}

function counts(g) {
  const out = {};
  for (const slot of g.state.bag) if (isIngredient(slot.id)) out[slot.id] = (out[slot.id] || 0) + slot.n;
  return out;
}

function cookHtml(g) {
  const have = counts(g);
  const used = id => selected.filter(x => x === id).length;
  const match = selected.length ? matchRecipe(selected) : null;
  const known = match && S.recipes[match.id];
  const preview = !selected.length ? 'Pick up to three ingredients.'
    : known ? `This makes <strong>${esc(match.name)}</strong>.`
      : 'Something new? Give it a try.';
  const ids = Object.keys(have);
  return `
    <div class="pot">${[0, 1, 2].map(i => selected[i]
      ? `<button class="slot" data-unpick="${i}" aria-label="Remove ${esc(ITEMS[selected[i]].name)}"><img class="icon" src="${iconURL(selected[i])}" alt=""></button>`
      : '<div class="slot empty" aria-hidden="true"></div>').join('')}</div>
    <p class="detail">${preview}</p>
    <div class="row-actions">
      <button class="btn" id="cook-alone" ${selected.length ? '' : 'disabled'}>Cook</button>
      ${partnerHere() ? `<button class="btn ghost" id="cook-chop" ${selected.length ? '' : 'disabled'}>Cook together: I'll chop</button>
        <button class="btn ghost" id="cook-stove" ${selected.length ? '' : 'disabled'}>Cook together: I'll do the stove</button>`
        : `<span class="detail small">${partnerId() ? 'When your partner is in the jar, you can cook together.' : ''}</span>`}
    </div>
    <h3>Ingredients in your bag</h3>
    ${ids.length ? `<div class="bag-grid">${ids.map(id => `<button class="slot" data-pick="${id}" ${have[id] - used(id) <= 0 || selected.length >= 3 ? 'disabled' : ''} aria-label="${esc(ITEMS[id].name)}">
      <img class="icon" src="${iconURL(id)}" alt=""><span class="count">${have[id] - used(id)}</span></button>`).join('')}</div>`
      : '<p class="detail">No ingredients yet. Grow crops, catch fish, forage or shake the fruit tree.</p>'}`;
}

function bindCook(g, body) {
  const redraw = () => { body.querySelector('#kitchen-body').innerHTML = cookHtml(g); bindCook(g, body); };
  body.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
    if (selected.length < 3) selected.push(b.dataset.pick);
    redraw();
  }));
  body.querySelectorAll('[data-unpick]').forEach(b => b.addEventListener('click', () => {
    selected.splice(+b.dataset.unpick, 1);
    redraw();
  }));
  body.querySelector('#cook-alone')?.addEventListener('click', () => cookAlone(g, body));
  body.querySelector('#cook-chop')?.addEventListener('click', () => startTogether(g, 'chop'));
  body.querySelector('#cook-stove')?.addEventListener('click', () => startTogether(g, 'stove'));
}

function bookHtml() {
  const found = RECIPES.filter(r => S.recipes[r.id]);
  return `<p class="detail">${found.length} of ${RECIPES.length} recipes found. The recipe book is shared.</p>
    <ul class="list">${RECIPES.map(r => {
      const got = S.recipes[r.id];
      return `<li class="${got ? 'got' : 'missing'}">${got ? `<img class="icon" src="${iconURL(r.id)}" alt="">` : ''}<span class="name">${got ? esc(r.name) : '???'}
        <small>${got ? esc(needsText(r)) + (got.together ? ' · first made together' : '') : esc(hintFor(r))}</small></span>
        ${got ? `<button class="btn small ghost" data-fill="${r.id}">Use</button>` : ''}</li>`;
    }).join('')}</ul>`;
}

function bindBook(g, body) {
  body.querySelectorAll('[data-fill]').forEach(b => b.addEventListener('click', () => {
    const r = RECIPE_BY_ID[b.dataset.fill];
    const have = counts(g);
    const pick = [];
    for (const need of r.needs) {
      const id = Object.keys(have).find(x => have[x] > 0 && fitsNeed(need, x));
      if (!id) return toast(`You need ${needsText(r).toLowerCase()}.`);
      have[id]--;
      pick.push(id);
    }
    selected = pick;
    openKitchen(g, 'cook');
  }));
}

function fitsNeed(need, id) {
  return need.startsWith('#') ? tagsOf(id).includes(need.slice(1)) : id === need;
}

// ---------- cooking alone ----------

function takeIngredients(g, ids) {
  for (let i = 0; i < ids.length; i++) {
    if (!R.removeItem(g.state, ids[i], 1)) {
      for (const back of ids.slice(0, i)) R.addItem(g.state, back, 1);
      return false;
    }
  }
  g.save();
  return true;
}

async function cookAlone(g, body) {
  const ids = [...selected];
  if (!takeIngredients(g, ids)) return toast('Those ingredients aren\'t in your bag anymore.');
  playing = true;
  const box = body.querySelector('#kitchen-body');
  try {
    const chop = await runChop(box, ids.length);
    const stove = await runStove(box);
    finish(g, box, { ids, chop, stove, together: false, key: 'cook-' + newId() });
  } finally {
    playing = false;
    selected = [];
  }
}

function finish(g, box, { ids, chop, stove, together, key, recipeId }) {
  const recipe = recipeId !== undefined ? (recipeId ? RECIPE_BY_ID[recipeId] : null) : matchRecipe(ids);
  const dish = recipe || MYSTERY;
  const n = starsFor(chop, stove, together);
  g.state.rewards = g.state.rewards || {};
  if (g.state.rewards[key]) return;
  g.state.rewards[key] = true;
  const fit = R.addItem(g.state, dish.id, 1);
  const bonus = recipe ? n * 5 : 0;
  g.state.pebbles += bonus;
  g.save();
  const isNew = recipe && !S.recipes[recipe.id];
  if (isNew) setDoc(`recipes/${recipe.id}`, { by: cloud.me, together, at: now() }).catch(() => {});
  if (box?.isConnected) {
    box.innerHTML = `<section class="qcard result">
      <img class="icon big" src="${iconURL(dish.id)}" alt="">
      <p class="prompt">${esc(dish.name)}</p>
      <p class="stars" aria-label="${n} of 3 stars">${stars(n)}</p>
      <p class="detail">${recipe ? `${isNew ? 'A new recipe for your book! ' : ''}${together ? 'Made together. ' : ''}+${bonus} pebbles` : 'Not quite a recipe, but it\'s food. Try other combinations.'}${fit ? '' : ' Your bag was full, so you ate it right away.'}</p>
      <div class="row-actions"><button class="btn" id="again">Cook something else</button></div></section>`;
    box.querySelector('#again').addEventListener('click', () => openKitchen(g));
  }
  toast(`${together ? 'You cooked together: ' : 'You cooked '}${dish.name.toLowerCase()} ${stars(n)}`, dish.id);
}

// ---------- the two minigames ----------

function runChop(box, n, onProgress) {
  const target = chopTarget(n);
  box.innerHTML = `<section class="qcard game">
    <p class="prompt">Chop!</p>
    <p class="detail">Tap Chop when the knife is over the green.</p>
    <div class="track"><div class="zone" style="left:${CHOP.zone[0] * 100}%;width:${(CHOP.zone[1] - CHOP.zone[0]) * 100}%"></div><div class="marker" id="knife"></div></div>
    <div class="meter"><span id="chop-bar"></span></div>
    <p class="detail" id="chop-text">0 of ${target} · ${CHOP.seconds}s</p>
    <div id="partner-line" class="detail small"></div>
    <button class="btn big" id="chop">Chop</button></section>`;
  return new Promise(resolve => {
    const knife = box.querySelector('#knife');
    const bar = box.querySelector('#chop-bar');
    const text = box.querySelector('#chop-text');
    let good = 0, pos = 0;
    const start = performance.now();
    const tap = e => {
      e.preventDefault();
      if (pos >= CHOP.zone[0] && pos <= CHOP.zone[1]) {
        good++;
        knife.classList.add('hit');
        setTimeout(() => knife.classList.remove('hit'), 120);
      } else {
        knife.classList.add('miss');
        setTimeout(() => knife.classList.remove('miss'), 120);
      }
    };
    box.querySelector('#chop').addEventListener('pointerdown', tap);
    const loop = t => {
      const elapsed = (t - start) / 1000;
      pos = (Math.sin(elapsed * 3.2) + 1) / 2;
      knife.style.left = `calc(${pos * 100}% - 3px)`;
      const p = Math.min(1, good / target);
      bar.style.width = p * 100 + '%';
      text.textContent = `${good} of ${target} · ${Math.max(0, Math.ceil(CHOP.seconds - elapsed))}s`;
      myProgress = p;
      onProgress?.(p, box);
      if (!box.isConnected || good >= target || elapsed >= CHOP.seconds) return resolve(p);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

function runStove(box, onProgress) {
  box.innerHTML = `<section class="qcard game">
    <p class="prompt">Mind the stove</p>
    <p class="detail">Hold Fan the fire to keep the heat in the green.</p>
    <div class="track heat"><div class="zone" style="left:${STOVE.band[0] * 100}%;width:${(STOVE.band[1] - STOVE.band[0]) * 100}%"></div><div class="marker" id="heat"></div></div>
    <div class="meter"><span id="stove-bar"></span></div>
    <p class="detail" id="stove-text">${STOVE.seconds}s</p>
    <div id="partner-line" class="detail small"></div>
    <button class="btn big" id="fan">Fan the fire</button></section>`;
  return new Promise(resolve => {
    const heatEl = box.querySelector('#heat');
    const bar = box.querySelector('#stove-bar');
    const text = box.querySelector('#stove-text');
    const fan = box.querySelector('#fan');
    let holding = false, heat = 0.3, inBand = 0, last = performance.now();
    const start = last;
    fan.addEventListener('pointerdown', e => { e.preventDefault(); holding = true; });
    for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) fan.addEventListener(ev, () => { holding = false; });
    const loop = t => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      const elapsed = (t - start) / 1000;
      heat += (holding ? 0.55 : -0.32) * dt + Math.sin(elapsed * 5) * 0.004;
      heat = Math.max(0, Math.min(1, heat));
      if (heat >= STOVE.band[0] && heat <= STOVE.band[1]) inBand += dt;
      heatEl.style.left = `calc(${heat * 100}% - 3px)`;
      const score = Math.min(1, inBand / (STOVE.seconds * 0.9));
      bar.style.width = score * 100 + '%';
      text.textContent = `${Math.max(0, Math.ceil(STOVE.seconds - elapsed))}s`;
      myProgress = Math.min(1, elapsed / STOVE.seconds);
      onProgress?.(myProgress, box);
      if (!box.isConnected || elapsed >= STOVE.seconds) return resolve(score);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  });
}

// ---------- cooking together ----------

async function startTogether(g, myRole) {
  const ids = [...selected];
  const partner = partnerId();
  if (!partner) return;
  if (!takeIngredients(g, ids)) return toast('Those ingredients aren\'t in your bag anymore.');
  const recipe = matchRecipe(ids);
  const session = {
    id: newId(), by: cloud.me, ingredients: ids, recipeId: recipe ? recipe.id : null, state: 'waiting', at: now(),
    roles: myRole === 'chop' ? { chop: cloud.me, stove: partner } : { chop: partner, stove: cloud.me },
  };
  selected = [];
  await setDoc(SESSION, session).catch(() => toast('Could not start. Try again.'));
  S.kitchen = { ...S.kitchen, session };
  openKitchen(g);
}

function roleOf(session) {
  return session.roles.chop === cloud.me ? 'chop' : 'stove';
}

function sessionHtml(session) {
  const mine = roleOf(session);
  const other = session.by === cloud.me ? session.roles[mine === 'chop' ? 'stove' : 'chop'] : session.by;
  const what = session.recipeId && S.recipes[session.recipeId] ? RECIPE_BY_ID[session.recipeId].name : 'something new';
  const list = session.ingredients.map(id => `<img class="icon" src="${iconURL(id)}" alt="${esc(ITEMS[id].name)}">`).join('');
  if (session.state === 'waiting' && session.by === cloud.me) {
    return `<section class="qcard"><p class="prompt">Cooking ${esc(what)}</p><div class="pot">${list}</div>
      <p class="detail">Waiting for ${esc(nameOf(other))} to join. They'll ${mine === 'chop' ? 'work the stove' : 'chop'}.</p>
      <button class="btn ghost" id="cancel-cook">Cancel and keep the ingredients</button></section>`;
  }
  if (session.state === 'waiting') {
    return `<section class="qcard"><p class="prompt">${esc(nameOf(session.by))} wants to cook ${esc(what)} with you</p><div class="pot">${list}</div>
      <p class="detail">You'll ${mine === 'chop' ? 'chop' : 'work the stove'}.</p>
      <button class="btn" id="join-cook">Join</button></section>`;
  }
  if (S.kitchen[`result-${session.id}--${cloud.me}`]) {
    return `<section class="qcard"><p class="prompt">Cooking ${esc(what)} together</p><div class="pot">${list}</div>
      <p class="detail">Your part is done. Waiting for ${esc(nameOf(other))} to finish theirs.</p></section>`;
  }
  return `<section class="qcard"><p class="prompt">Cooking ${esc(what)} together</p><div class="pot">${list}</div>
    <button class="btn" id="play-part">Do my part: ${mine === 'chop' ? 'chop' : 'the stove'}</button></section>`;
}

function bindSession(g, body, session) {
  body.querySelector('#cancel-cook')?.addEventListener('click', async () => {
    for (const id of session.ingredients) R.addItem(g.state, id, 1);
    g.save();
    await updateDoc(SESSION, { state: 'cancelled' }).catch(() => {});
    S.kitchen.session = { ...session, state: 'cancelled' };
    openKitchen(g);
  });
  body.querySelector('#join-cook')?.addEventListener('click', async () => {
    await updateDoc(SESSION, { state: 'cooking', joinedAt: now() }).catch(() => {});
    playPart(g, body, { ...session, state: 'cooking' });
  });
  body.querySelector('#play-part')?.addEventListener('click', () => playPart(g, body, session));
}

// Both of you start your part as soon as the session is cooking.
export function maybeStartPart(g) {
  const s = activeSession();
  if (!s || s.state !== 'cooking' || playing) return;
  if (S.kitchen[`result-${s.id}--${cloud.me}`]) return;
  const body = document.querySelector('#kitchen-body')?.closest('#sheet-body');
  if (body) playPart(g, body, s);
}

async function playPart(g, body, session) {
  if (playing) return;
  playing = true;
  const role = roleOf(session);
  const box = body.querySelector('#kitchen-body');
  const showPartner = (p, el) => {
    setPresence({ session: session.id, role, progress: Math.round(p * 100) / 100 });
    const theirs = partnerPresence();
    const line = el.querySelector('#partner-line');
    if (line) line.textContent = theirs?.session === session.id
      ? `${nameOf(partnerId())} is ${theirs.role === 'chop' ? 'chopping' : 'at the stove'}: ${Math.round((theirs.progress || 0) * 100)}%`
      : `Waiting for ${nameOf(partnerId())}…`;
  };
  try {
    const score = role === 'chop' ? await runChop(box, session.ingredients.length, showPartner) : await runStove(box, showPartner);
    await setDoc(`kitchen/result-${session.id}--${cloud.me}`, { session: session.id, uid: cloud.me, role, score, at: now() }).catch(() => {});
    S.kitchen[`result-${session.id}--${cloud.me}`] = { session: session.id, uid: cloud.me, role, score };
    if (box.isConnected) box.innerHTML = '<p class="detail">Your part is done. Waiting for the other half…</p>';
  } finally {
    playing = false;
    setPresence(null);
  }
  maybeFinish(g);
}

// When both halves are in, each of you gets the dish.
export function maybeFinish(g) {
  const s = S.kitchen?.session;
  if (!s || !['cooking', 'done'].includes(s.state)) return;
  if (s.roles.chop !== cloud.me && s.roles.stove !== cloud.me) return;
  const chop = S.kitchen[`result-${s.id}--${s.roles.chop}`];
  const stove = S.kitchen[`result-${s.id}--${s.roles.stove}`];
  if (!chop || !stove) return;
  const box = document.querySelector('#kitchen-body');
  finish(g, box, { ids: s.ingredients, chop: chop.score, stove: stove.score, together: true, key: 'cook-' + s.id, recipeId: s.recipeId });
  if (s.by === cloud.me && s.state !== 'done') {
    updateDoc(SESSION, { state: 'done' }).catch(() => {});
    setDoc(`meals/${s.id}`, { recipeId: s.recipeId, uids: [s.roles.chop, s.roles.stove], at: now() }).catch(() => {});
  }
}

// A gentle nudge when your partner asks you to cook.
let lastInvite = null;
export function noticeInvite() {
  const s = activeSession();
  if (!s || s.state !== 'waiting' || s.by === cloud.me || lastInvite === s.id) return;
  lastInvite = s.id;
  toast(`${nameOf(s.by)} wants to cook with you. Open the kitchen to join.`);
}

export function progress() {
  return myProgress;
}
