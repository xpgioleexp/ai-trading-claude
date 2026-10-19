// The Little Us features for two, each opened from a place in the jar:
// bench (Today), mailbox, notice board, calendar, wishing well and journal.
import { C, questionFor, missionFor, ritualFor, weekOf, mondayOf } from './content.js';
import { cloud, setDoc, updateDoc, deleteDoc, newId, now, namesFor, privatePath } from './cloud.js';
import { S, partnerId, couple, answerFor, submitAnswer, setAnswerState, myPrivateAnswer, bothRevealed, discover, leaveWellLight, startRain, stopRain, rainingNow } from './shared.js';
import { openSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { addItem } from './rules.js';
import { iconURL } from './sprites.js';
import { RECIPE_BY_ID } from './cooking.js';

// ---------- names (looked up from the platform, never stored) ----------

const names = {};
export async function refreshNames() {
  Object.assign(names, await namesFor(couple()));
}
export function nameOf(id) {
  if (!id) return 'Someone';
  return names[id] || (id === cloud.me ? 'You' : 'Your partner');
}
// For use mid-sentence: the partner's name, or "your partner" when it isn't known.
function partnerName() {
  const id = partnerId();
  return (id && names[id] && names[id] !== 'Your partner') ? names[id] : 'your partner';
}

const fmtDate = ts => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const fmtWhen = iso => {
  const d = new Date(iso);
  if (Number.isNaN(+d)) return 'Date not set';
  return d.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};

function reward(g, key, amount, message) {
  g.state.rewards = g.state.rewards || {};
  if (g.state.rewards[key]) return false;
  g.state.rewards[key] = true;
  g.state.pebbles += amount;
  g.save();
  toast(`${message} +${amount} pebbles`);
  return true;
}

function world() {
  return S.world || { seed: 'local', startDay: 0 };
}

// ---------- sealed answer block, used by every question ----------
// key: where the answers live; prompt: the words being answered.

function answerBlock(key, prompt, opts = {}) {
  const mine = answerFor(key, cloud.me);
  const partner = partnerId();
  const theirs = partner ? answerFor(key, partner) : null;
  const id = 'ans-' + key.replace(/[^a-z0-9]/gi, '');
  let body;
  if (mine?.state === 'answered') {
    if (theirs?.text != null && mine.text != null) {
      body = `<div class="pair">
        <div class="said"><span class="label">${esc(nameOf(cloud.me))}</span><p>${esc(mine.text)}</p></div>
        <div class="said them"><span class="label">${esc(nameOf(partner))}</span><p>${esc(theirs.text)}</p></div></div>`;
    } else {
      const waiting = partner
        ? theirs?.state === 'answered' ? 'Both answered. Opening your answers…' : `Your answer is saved privately. It opens when ${esc(partnerName())} answers too.`
        : 'Your answer is saved. When your partner joins the jar, you\'ll see each other\'s answers here.';
      body = `<p class="detail waiting">${waiting}</p><div class="said" data-mine="${esc(key)}"><span class="label">Your answer</span><p class="mine-text">…</p></div>`;
    }
  } else {
    const later = mine?.state === 'later' ? '<span class="chip-note">Saved for later</span>' : mine?.state === 'skip' ? '<span class="chip-note">Skipped</span>' : '';
    const partnerNote = theirs?.state === 'answered' ? `<p class="detail">${esc(partnerName())} has answered. Their answer opens when you answer.</p>` : '';
    body = `${partnerNote}${later}
      <label class="sr" for="${id}">Your answer</label>
      <textarea id="${id}" rows="3" maxlength="2000" placeholder="Write your answer…"></textarea>
      <div class="row-actions">
        <button class="btn" data-answer="${esc(key)}" data-for="${id}">Answer</button>
        ${opts.later === false ? '' : `<button class="btn ghost" data-later="${esc(key)}">Later</button><button class="btn ghost" data-skip="${esc(key)}">Skip</button>`}
      </div>`;
  }
  return `<article class="qcard" data-key="${esc(key)}"><p class="prompt">${esc(prompt)}</p>${opts.meta ? `<p class="meta">${esc(opts.meta)}</p>` : ''}${body}</article>`;
}

function bindAnswers(body, g, extraFor, onDone) {
  body.querySelectorAll('[data-answer]').forEach(b => b.addEventListener('click', async () => {
    const key = b.dataset.answer;
    const text = body.querySelector('#' + b.dataset.for).value.trim();
    if (!text) return toast('Write something first.');
    b.disabled = true;
    try {
      await submitAnswer(key, text, extraFor(key));
      onDone?.(key);
    } catch {
      b.disabled = false;
      toast('Could not save your answer. Try again.');
    }
  }));
  body.querySelectorAll('[data-later]').forEach(b => b.addEventListener('click', () => {
    setAnswerState(b.dataset.later, 'later', extraFor(b.dataset.later));
    toast('Saved for later. Find it in Today.');
  }));
  body.querySelectorAll('[data-skip]').forEach(b => b.addEventListener('click', () => {
    setAnswerState(b.dataset.skip, 'skip', extraFor(b.dataset.skip));
    toast('Skipped. A new question comes tomorrow.');
  }));
  // Fill in your own private words where they're waiting to be revealed.
  body.querySelectorAll('[data-mine]').forEach(async el => {
    const mine = await myPrivateAnswer(el.dataset.mine);
    const p = el.querySelector('.mine-text');
    if (p) p.textContent = mine?.text || '';
  });
}

// ---------- Today (the bench) ----------

export function openToday(g) {
  const w = world();
  const day = g.today;
  const key = 'day-' + day;
  const q = questionFor(w.seed, w.startDay, day);
  const week = weekOf(day);
  const saved = Object.values(S.answers)
    .filter(a => a.uid === cloud.me && a.state === 'later' && a.key !== key)
    .sort((a, b) => b.at - a.at).slice(0, 10);
  const waitingOnMe = Object.values(S.answers)
    .filter(a => a.uid === partnerId() && a.state === 'answered' && a.key.startsWith('day-') && a.key !== key && answerFor(a.key, cloud.me)?.state !== 'answered')
    .slice(0, 5);
  const ritual = ritualFor(week);
  const html = `
    <section>
      <h3>Today's question</h3>
      ${answerBlock(key, q.text, { meta: `${q.category} · ${q.topic}` })}
    </section>
    ${saved.length || waitingOnMe.length ? `<section><h3>Earlier questions</h3>
      ${[...waitingOnMe, ...saved].map(a => answerBlock(a.key, a.prompt || 'An earlier question', { meta: a.state === 'later' ? 'Saved for later' : `${partnerName()} answered this` })).join('')}
    </section>` : ''}
    <section id="checkin-section"><h3>How are you today?</h3><div id="checkin-slot"><p class="detail">Loading…</p></div></section>
    <section>
      <h3>This week's ritual: ${esc(ritual.title)}</h3>
      <p class="detail">${esc(ritual.description)} About ${ritual.minutes} minutes.</p>
      <button class="btn" id="open-ritual">Open the ritual</button>
    </section>
    <section class="row-actions">
      <button class="btn ghost" id="open-board">This week's mission</button>
      <button class="btn ghost" id="rain">${rainingNow() ? 'Stop the rain' : 'Make it rain'}</button>
    </section>`;
  openSheet('Today', html, body => {
    bindAnswers(body, g, k => ({ prompt: k === key ? q.text : (answerFor(k, cloud.me)?.prompt || answerFor(k, partnerId())?.prompt || '') }), k => {
      if (k.startsWith('day-')) reward(g, 'q-' + k, 25, 'Answered.');
    });
    body.querySelector('#open-ritual').addEventListener('click', () => openRitual(g));
    body.querySelector('#open-board').addEventListener('click', () => openBoard(g));
    body.querySelector('#rain').addEventListener('click', () => {
      if (rainingNow()) stopRain();
      else { startRain(); toast('A little rain for a minute.'); }
      setTimeout(() => openToday(g), 300);
    });
    renderCheckin(body.querySelector('#checkin-slot'), g);
  }, null, () => openToday(g));
}

// ---------- mood check-in ----------

async function renderCheckin(slot, g) {
  const day = g.today;
  const snap = await cloud.db.doc(privatePath('checkin-' + day)).get().catch(() => null);
  const mine = snap?.exists ? snap.data() : null;
  const partner = partnerId();
  const theirs = partner ? S.checkins[`${day}--${partner}`] : null;
  const look = mine || { mood: null, energy: 3, needs: [], note: '', shared: false };
  const moods = C.moods.map(m => `<button class="mood ${look.mood === m.id ? 'on' : ''}" data-mood="${m.id}" aria-pressed="${look.mood === m.id}" style="--mood:${m.color}" title="${esc(m.description)}"><span class="dot"></span>${esc(m.label)}</button>`).join('');
  const needs = C.needs.map(n => `<button class="chip ${look.needs.includes(n.id) ? 'on' : ''}" data-need="${n.id}" aria-pressed="${look.needs.includes(n.id)}" title="${esc(n.hint)}">${esc(n.label)}</button>`).join('');
  const theirMood = theirs && C.moods.find(m => m.id === theirs.mood);
  const acked = theirs?.acks?.[cloud.me] === theirs?.version;
  slot.innerHTML = `
    ${theirs ? `<div class="their-checkin"><span class="label">${esc(nameOf(partner))} today</span>
      <p><span class="dot" style="background:${theirMood?.color || '#ccc'}"></span> ${esc(theirMood?.label || '')} · energy ${theirs.energy}/5${theirs.needs?.length ? ' · ' + theirs.needs.map(id => esc(C.needs.find(n => n.id === id)?.label || '')).join(', ') : ''}</p>
      ${theirs.note ? `<p class="note">${esc(theirs.note)}</p>` : ''}
      <button class="btn small" id="ack" ${acked ? 'disabled' : ''}>${acked ? 'You let them know you saw this' : 'I see you'}</button></div>` : ''}
    <div class="moods">${moods}</div>
    <label class="label" for="energy">Energy <span id="energy-val">${look.energy}</span>/5</label>
    <input type="range" id="energy" min="1" max="5" step="1" value="${look.energy}">
    <span class="label">What would help (up to 3)</span>
    <div class="choices">${needs}</div>
    <label class="sr" for="checkin-note">A note</label>
    <textarea id="checkin-note" rows="2" maxlength="500" placeholder="Anything you want to add (optional)">${esc(look.note || '')}</textarea>
    <label class="check"><input type="checkbox" id="checkin-share" ${look.shared ? 'checked' : ''}> Share with ${esc(partnerName())}</label>
    <p class="detail small">Check-ins are private unless you share them.${mine?.acks && Object.keys(mine.acks).length ? ' Your partner saw your check-in.' : ''}</p>
    <div class="row-actions"><button class="btn" id="save-checkin">${mine ? 'Update check-in' : 'Save check-in'}</button></div>`;
  slot.querySelectorAll('[data-mood]').forEach(b => b.addEventListener('click', () => {
    look.mood = b.dataset.mood;
    slot.querySelectorAll('[data-mood]').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
  }));
  slot.querySelectorAll('[data-need]').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.need;
    if (look.needs.includes(id)) look.needs = look.needs.filter(n => n !== id);
    else if (look.needs.length < 3) look.needs = [...look.needs, id];
    else return toast('Pick up to three.');
    b.classList.toggle('on', look.needs.includes(id));
    b.setAttribute('aria-pressed', look.needs.includes(id));
  }));
  const energy = slot.querySelector('#energy');
  energy.addEventListener('input', () => { slot.querySelector('#energy-val').textContent = energy.value; });
  slot.querySelector('#ack')?.addEventListener('click', () => {
    updateDoc(`checkins/${day}--${partner}`, { acks: { [cloud.me]: theirs.version } }).catch(() => {});
    toast('They\'ll see that you noticed.');
  });
  slot.querySelector('#save-checkin').addEventListener('click', async () => {
    if (!look.mood) return toast('Pick a mood first.');
    const doc = {
      day, uid: cloud.me, mood: look.mood, energy: +energy.value, needs: look.needs,
      note: slot.querySelector('#checkin-note').value.trim(), shared: slot.querySelector('#checkin-share').checked,
      version: (mine?.version || 0) + 1, at: now(),
    };
    await setDoc(privatePath('checkin-' + day), doc).catch(() => {});
    if (doc.shared) await setDoc(`checkins/${day}--${cloud.me}`, { ...doc, acks: {} }).catch(() => {});
    else if (S.checkins[`${day}--${cloud.me}`]) await deleteDoc(`checkins/${day}--${cloud.me}`).catch(() => {});
    toast(doc.shared ? `Shared with ${partnerName()}.` : 'Saved, just for you.');
    renderCheckin(slot, g);
  });
}

// ---------- weekly ritual ----------

export function openRitual(g) {
  const week = weekOf(g.today);
  const ritual = ritualFor(week);
  const doc = S.rituals[String(week)] || null;
  const partner = partnerId();
  const prompts = ritual.prompts.map(p => answerBlock(`ritual-${week}-${p.id}`, p.question, { meta: p.label, later: false })).join('');
  const version = doc?.version || 0;
  const confirms = doc?.confirms || {};
  const bothConfirmed = partner && version && confirms[cloud.me] === version && confirms[partner] === version;
  const html = `
    <p class="detail">${esc(ritual.description)} Answer on your own; you'll see each other's words once you've both answered.</p>
    ${prompts}
    <section class="qcard">
      <p class="prompt">One small shared intention for the week</p>
      <label class="sr" for="intention">Intention</label>
      <textarea id="intention" rows="2" maxlength="300" placeholder="Something small you both want to do">${esc(doc?.intention || '')}</textarea>
      <p class="detail small">${doc?.intention ? `Written by ${esc(nameOf(doc.by))}. ` : ''}${version ? `${confirms[cloud.me] === version ? 'You agreed' : 'You haven\'t agreed yet'}${partner ? ` · ${confirms[partner] === version ? `${esc(partnerName())} agreed` : `${esc(partnerName())} hasn't agreed yet`}` : ''}` : ''}</p>
      <div class="row-actions">
        <button class="btn ghost" id="save-intention">Save intention</button>
        ${version ? `<button class="btn" id="agree" ${confirms[cloud.me] === version ? 'disabled' : ''}>Agree to this</button>` : ''}
      </div>
      ${bothConfirmed ? '<p class="detail done">You both agreed. Ritual complete.</p>' : ''}
    </section>`;
  openSheet(ritual.title, html, body => {
    bindAnswers(body, g, k => ({ prompt: ritual.prompts.find(p => k.endsWith('-' + p.id))?.question || '' }));
    body.querySelector('#save-intention').addEventListener('click', async () => {
      const text = body.querySelector('#intention').value.trim();
      if (!text) return toast('Write an intention first.');
      const v = version + 1;
      await setDoc(`rituals/${week}`, { week, intention: text, by: cloud.me, version: v, confirms: { [cloud.me]: v }, at: now() }).catch(() => {});
      toast('Saved. Changing it asks you both to agree again.');
      openRitual(g);
    });
    body.querySelector('#agree')?.addEventListener('click', async () => {
      await updateDoc(`rituals/${week}`, { confirms: { [cloud.me]: version } }).catch(() => {});
      openRitual(g);
    });
    if (bothConfirmed) reward(g, 'ritual-' + week, 40, 'Ritual complete.');
  }, null, () => openRitual(g));
}

// ---------- notice board: weekly mission + pinboard ----------

export function openBoard(g) {
  const w = world();
  const week = weekOf(g.today);
  const m = missionFor(w.seed, w.startDay, week);
  const partner = partnerId();
  const mine = S.missions[`${week}--${cloud.me}`];
  const theirs = partner ? S.missions[`${week}--${partner}`] : null;
  const both = mine?.state === 'done' && theirs?.state === 'done';
  const status = who => who?.state === 'done' ? 'done' : who?.state === 'started' ? 'started' : 'not started';
  const past = Object.values(S.missions).filter(x => x.uid === cloud.me && x.week !== week && x.state === 'done').sort((a, b) => b.week - a.week).slice(0, 8);
  const next = Object.values(S.dates).filter(d => !d.done && new Date(d.when) > new Date()).sort((a, b) => new Date(a.when) - new Date(b.when))[0];
  const dream = Object.values(S.dreams).find(d => d.stage === 'doing' || d.stage === 'next');
  const memory = Object.values(S.scrapbook).sort((a, b) => b.at - a.at)[0];
  const html = `
    <section class="qcard mission">
      <p class="meta">This week's mission · ${esc(m.category)} · from ${esc(fmtDate(mondayOf(week) * 86400000))}</p>
      <p class="prompt">${esc(m.title)}</p>
      <p>${esc(m.description)}</p>
      <ul class="facts"><li>${m.minutes} minutes</li><li>${esc(m.cost === 'free' ? 'No extra cost' : 'Small budget')}</li><li>${esc(m.where || '')}</li><li>${esc(m.supplies)}</li></ul>
      <ol class="steps">${m.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
      <p><strong>Finish:</strong> ${esc(m.finish)}</p>
      ${m.apart ? `<p class="detail"><strong>Apart:</strong> ${esc(m.apart)}</p>` : ''}
      <p class="detail">You: ${status(mine)}${partner ? ` · ${esc(partnerName())}: ${status(theirs)}` : ''}</p>
      ${mine?.state !== 'done' ? `
        <div class="row-actions">${mine?.state !== 'started' ? '<button class="btn ghost" id="m-start">We\'re doing this</button>' : ''}</div>
        <label class="sr" for="m-memory">A memory</label>
        <textarea id="m-memory" rows="2" maxlength="600" placeholder="How did it go? (optional)"></textarea>
        <div class="row-actions"><button class="btn" id="m-done">We did it</button></div>`
      : `<p class="detail done">${both ? 'You both finished it!' : `Waiting for ${esc(partnerName())} to mark it done.`}</p>${mine.memory ? `<p class="note">${esc(mine.memory)}</p>` : ''}${theirs?.memory ? `<p class="note">${esc(theirs.memory)}</p>` : ''}`}
    </section>
    <section><h3>On the board</h3>
      <ul class="pins">
        <li><span class="label">Our next date</span>${next ? `${esc(next.title)} · ${esc(fmtWhen(next.when))}` : 'Nothing planned yet'}</li>
        <li><span class="label">A dream in progress</span>${dream ? esc(dream.title) : 'Add one at the wishing well'}</li>
        <li><span class="label">A memory to keep</span>${memory ? esc(memory.text || 'A photo') : 'Add one in the journal'}</li>
        <li><span class="label">How we are today</span>${couple().map(id => { const c = S.checkins[`${g.today}--${id}`]; const mood = c && C.moods.find(x => x.id === c.mood); return `${esc(nameOf(id))}: ${mood ? esc(mood.label) : '…'}`; }).join(' · ')}</li>
      </ul>
    </section>
    ${past.length ? `<section><h3>Missions you've done</h3><ul class="list">${past.map(p => `<li><span class="name">${esc(p.title)}<small>${esc(p.memory || '')}</small></span></li>`).join('')}</ul></section>` : ''}`;
  openSheet('Notice board', html, body => {
    body.querySelector('#m-start')?.addEventListener('click', async () => {
      await setDoc(`missions/${week}--${cloud.me}`, { week, uid: cloud.me, state: 'started', title: m.title, missionId: m.id, at: now() }).catch(() => {});
      toast('Good luck!');
    });
    body.querySelector('#m-done')?.addEventListener('click', async () => {
      const memory = body.querySelector('#m-memory').value.trim();
      await setDoc(`missions/${week}--${cloud.me}`, { week, uid: cloud.me, state: 'done', title: m.title, missionId: m.id, memory, at: now() }).catch(() => {});
      toast(partner ? `Marked done. When ${partnerName()} does too, you both get pebbles.` : 'Marked done.');
    });
    if (both) reward(g, 'mission-' + week, 20, 'Mission complete.');
  }, null, () => openBoard(g));
}

// ---------- mailbox: notes and appreciation cards ----------

export function unreadNotes(g) {
  const seen = g.state.mailSeen || 0;
  const gifts = Object.values(S.gifts).filter(x => x.to === cloud.me && !x.opened).length;
  return Object.values(S.notes).filter(n => n.by !== cloud.me && n.at > seen).length + gifts;
}

export function openMailbox(g, letters) {
  const notes = Object.entries(S.notes).map(([id, n]) => ({ id, ...n })).sort((a, b) => b.at - a.at);
  const seen = g.state.mailSeen || 0;
  g.state.mailSeen = now();
  g.state.mailRead = g.today;
  g.save();
  const cards = C.appreciations.map(a => `<button class="chip" data-card="${a.id}">${esc(a.label)}</button>`).join('');
  const gifts = Object.entries(S.gifts).filter(([, x]) => x.to === cloud.me && !x.opened);
  const giftHtml = gifts.length ? `<section><h3>Gifts for you</h3><ul class="list">${gifts.map(([id, x]) => `<li><img class="icon" src="${iconURL(x.item)}" alt=""><span class="name">${esc(ITEMS[x.item]?.name || 'A gift')}<small>From ${esc(nameOf(x.from))}</small></span><button class="btn small" data-open-gift="${id}">Open</button></li>`).join('')}</ul></section>` : '';
  const html = `${giftHtml}
    <section class="compose">
      <label class="label" for="note-text">Write to ${esc(partnerName())}</label>
      <textarea id="note-text" rows="3" maxlength="1000" placeholder="A little note…"></textarea>
      <div class="choices"><span class="label">Or start a card:</span>${cards}</div>
      <div class="row-actions"><button class="btn" id="send-note">Send note</button></div>
    </section>
    <section><h3>Letters</h3>
      ${notes.map(n => {
        const card = n.kind === 'card' ? C.appreciations.find(a => a.id === n.style) : null;
        return `<article class="letter ${card ? 'card-' + esc(card.color) : ''} ${n.at > seen && n.by !== cloud.me ? 'new' : ''}">
          ${card ? `<h3>${esc(card.label)}</h3>` : ''}<p>${esc(n.text)}</p>
          <p class="from">${n.by === cloud.me ? 'You' : esc(nameOf(n.by))} · ${esc(fmtDate(n.at))}${n.by === cloud.me ? ` · <button class="link" data-del="${esc(n.id)}">Delete</button>` : ''}</p></article>`;
      }).join('')}
      ${letters.map(l => `<article class="letter"><h3>${esc(l.title)}</h3><p>${esc(l.body)}</p><p class="from">${esc(l.from)}</p></article>`).join('')}
    </section>`;
  let style = null;
  openSheet('Mailbox', html, body => {
    const text = body.querySelector('#note-text');
    body.querySelectorAll('[data-card]').forEach(b => b.addEventListener('click', () => {
      style = b.dataset.card;
      const a = C.appreciations.find(x => x.id === style);
      body.querySelectorAll('[data-card]').forEach(x => x.classList.toggle('on', x === b));
      if (!text.value.trim()) text.value = a.starter + ' ';
      text.focus();
    }));
    body.querySelector('#send-note').addEventListener('click', async () => {
      const t = text.value.trim();
      if (!t) return toast('Write something first.');
      await setDoc(`notes/${newId()}`, { by: cloud.me, kind: style ? 'card' : 'note', style, text: t, at: now() }).catch(() => toast('Could not send. Try again.'));
      toast(partnerId() ? 'Sent to the mailbox.' : 'Saved. Your partner will see it when they join.');
      openMailbox(g, letters);
    });
    body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteDoc(`notes/${b.dataset.del}`)));
    body.querySelectorAll('[data-open-gift]').forEach(b => b.addEventListener('click', async () => {
      const gift = S.gifts[b.dataset.openGift];
      if (!gift || gift.opened || !ITEMS[gift.item]) return;
      if (!addItem(g.state, gift.item, gift.n || 1)) return toast('Your bag is full.');
      g.save();
      S.gifts[b.dataset.openGift] = { ...gift, opened: true };
      await updateDoc(`gifts/${b.dataset.openGift}`, { opened: true }).catch(() => {});
      toast(`You got a ${ITEMS[gift.item].name.toLowerCase()}!`, gift.item);
      openMailbox(g, letters);
    }));
  }, null, () => openMailbox(g, letters));
}

// ---------- calendar: dates ----------

export function openCalendar(g, view = 'list', editing = null) {
  const partner = partnerId();
  const list = Object.entries(S.dates).map(([id, d]) => ({ id, ...d })).sort((a, b) => new Date(a.when) - new Date(b.when));
  const upcoming = list.filter(d => !d.done);
  const done = list.filter(d => d.done).reverse();
  if (view === 'new') return dateForm(g, editing);
  const row = d => {
    const mineOk = d.confirms?.[cloud.me] === d.version;
    const theirsOk = partner && d.confirms?.[partner] === d.version;
    return `<li class="date"><div class="name"><strong>${esc(d.title)}</strong>
      <small>${esc(fmtWhen(d.when))} · ${d.minutes || 60} min · ${esc(d.together ? 'Together' : 'Apart')}${d.place ? ' · ' + esc(d.place) : ''} · ${esc({ free: 'Free', small: 'Small budget', treat: 'A treat' }[d.budget] || 'Free')}</small>
      <small>${mineOk ? 'You confirmed' : 'You haven\'t confirmed'}${partner ? ` · ${theirsOk ? `${esc(partnerName())} confirmed` : `Waiting for ${esc(partnerName())}`}` : ''}</small></div>
      <div class="btns">
        ${!d.done && !mineOk ? `<button class="btn small" data-confirm="${d.id}" data-v="${d.version}">Confirm</button>` : ''}
        ${!d.done ? `<button class="btn small ghost" data-edit="${d.id}">Edit</button><button class="btn small ghost" data-done="${d.id}">Done</button>` : ''}
        <button class="btn small ghost" data-ics="${d.id}">Add to calendar</button>
        ${d.by === cloud.me ? `<button class="btn small ghost" data-del="${d.id}">Delete</button>` : ''}
      </div></li>`;
  };
  const html = `
    <div class="row-actions"><button class="btn" id="new-date">Plan a date</button><button class="btn ghost" id="surprise">Surprise idea</button></div>
    <h3>Coming up</h3>
    ${upcoming.length ? `<ul class="list">${upcoming.map(row).join('')}</ul>` : '<p class="detail">No dates planned. Pick one of 160 ideas or make your own.</p>'}
    ${done.length ? `<h3>Dates you've had</h3><ul class="list">${done.slice(0, 12).map(row).join('')}</ul>` : ''}
    <p class="detail small">Times use the jar's time zone (${esc(S.world?.timeZone || 'your device')}). Changing a date asks you both to confirm again.</p>`;
  openSheet('Calendar', html, body => {
    body.querySelector('#new-date').addEventListener('click', () => dateForm(g, null));
    body.querySelector('#surprise').addEventListener('click', () => {
      const idea = C.dateIdeas[Math.floor(Math.random() * C.dateIdeas.length)];
      dateForm(g, { title: idea.title, ideaId: idea.id, minutes: idea.minutes, note: idea.description });
    });
    body.querySelectorAll('[data-confirm]').forEach(b => b.addEventListener('click', () => {
      updateDoc(`dates/${b.dataset.confirm}`, { confirms: { [cloud.me]: +b.dataset.v } }).catch(() => {});
    }));
    body.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => dateForm(g, { id: b.dataset.edit, ...S.dates[b.dataset.edit] })));
    body.querySelectorAll('[data-done]').forEach(b => b.addEventListener('click', () => {
      updateDoc(`dates/${b.dataset.done}`, { done: true, doneAt: now() }).catch(() => {});
      toast('Kept in your journal.');
    }));
    body.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => deleteDoc(`dates/${b.dataset.del}`)));
    body.querySelectorAll('[data-ics]').forEach(b => b.addEventListener('click', () => {
      const d = S.dates[b.dataset.ics];
      saveFile(`${d.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'date'}.ics`, icsFor([d]), 'text/calendar');
    }));
  }, null, () => openCalendar(g));
}

function dateForm(g, d) {
  const base = d || {};
  const when = base.when ? new Date(base.when) : new Date(Date.now() + 86400000);
  const localDate = `${when.getFullYear()}-${String(when.getMonth() + 1).padStart(2, '0')}-${String(when.getDate()).padStart(2, '0')}`;
  const localTime = base.when ? `${String(when.getHours()).padStart(2, '0')}:${String(when.getMinutes()).padStart(2, '0')}` : '19:00';
  const cats = [...new Set(C.dateIdeas.map(i => i.category))];
  const html = `
    <form id="date-form" class="form">
      <label class="label" for="d-title">What</label>
      <input id="d-title" maxlength="120" required value="${esc(base.title || '')}" placeholder="Name your date">
      ${base.note ? `<p class="detail">${esc(base.note)}</p>` : ''}
      <div class="grid2">
        <div><label class="label" for="d-date">Day</label><input id="d-date" type="date" required value="${localDate}"></div>
        <div><label class="label" for="d-time">Time</label><input id="d-time" type="time" required value="${localTime}"></div>
        <div><label class="label" for="d-min">Minutes</label><input id="d-min" type="number" min="5" max="1440" value="${base.minutes || 60}"></div>
        <div><label class="label" for="d-budget">Budget</label><select id="d-budget">
          ${[['free', 'Free'], ['small', 'Small budget'], ['treat', 'A treat']].map(([v, l]) => `<option value="${v}" ${base.budget === v ? 'selected' : ''}>${l}</option>`).join('')}</select></div>
      </div>
      <label class="label" for="d-place">Where</label>
      <input id="d-place" maxlength="120" value="${esc(base.place || '')}" placeholder="Optional">
      <label class="check"><input type="checkbox" id="d-together" ${base.together === false ? '' : 'checked'}> Together in the same place</label>
      <div class="row-actions"><button class="btn" type="submit">${base.id ? 'Save changes' : 'Plan it'}</button><button class="btn ghost" type="button" id="d-cancel">Cancel</button></div>
    </form>
    ${base.id ? '' : `<details class="ideas"><summary>Browse 160 date ideas</summary>
      ${cats.map(cat => `<h3>${esc(cat)}</h3><ul class="list">${C.dateIdeas.filter(i => i.category === cat).map(i => `<li><span class="name">${esc(i.title)}<small>${esc(i.description)}</small></span><button class="btn small ghost" data-idea="${i.id}">Use</button></li>`).join('')}</ul>`).join('')}
    </details>`}`;
  openSheet(base.id ? 'Edit date' : 'Plan a date', html, body => {
    body.querySelector('#d-cancel').addEventListener('click', () => openCalendar(g));
    body.querySelectorAll('[data-idea]').forEach(b => b.addEventListener('click', () => {
      const idea = C.dateIdeas.find(i => i.id === b.dataset.idea);
      dateForm(g, { title: idea.title, ideaId: idea.id, minutes: idea.minutes, note: idea.description });
    }));
    body.querySelector('#date-form').addEventListener('submit', async e => {
      e.preventDefault();
      const iso = new Date(`${body.querySelector('#d-date').value}T${body.querySelector('#d-time').value}`).toISOString();
      const id = base.id || newId();
      const version = (base.version || 0) + 1;
      await setDoc(`dates/${id}`, {
        title: body.querySelector('#d-title').value.trim() || 'A date', ideaId: base.ideaId || null, when: iso,
        minutes: Math.max(5, +body.querySelector('#d-min').value || 60), place: body.querySelector('#d-place').value.trim(),
        budget: body.querySelector('#d-budget').value, together: body.querySelector('#d-together').checked,
        by: base.by || cloud.me, version, confirms: { [cloud.me]: version }, done: false, at: base.at || now(),
      }).catch(() => toast('Could not save. Try again.'));
      toast(partnerId() ? `Planned. ${partnerName()} can confirm it.` : 'Planned.');
      openCalendar(g);
    });
  });
}

// ---------- iCalendar export ----------

function icsEscape(text) {
  return String(text || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}
function icsFold(line) {
  const out = [];
  let rest = line;
  while (rest.length > 73) { out.push(rest.slice(0, 73)); rest = ' ' + rest.slice(73); }
  out.push(rest);
  return out.join('\r\n');
}
const icsTime = d => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

export function icsFor(dates, extra = []) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Little Us//Terrarium//EN', 'CALSCALE:GREGORIAN'];
  for (const d of dates) {
    const start = new Date(d.when);
    const end = new Date(start.getTime() + (d.minutes || 60) * 60000);
    lines.push('BEGIN:VEVENT', `UID:${icsEscape((d.id || d.title) + '@little-us')}`, `DTSTAMP:${icsTime(Date.now())}`,
      `DTSTART:${icsTime(start)}`, `DTEND:${icsTime(end)}`, `SUMMARY:${icsEscape(d.title)}`);
    if (d.place) lines.push(`LOCATION:${icsEscape(d.place)}`);
    lines.push('BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(d.title)}`, 'TRIGGER:-PT30M', 'END:VALARM', 'END:VEVENT');
  }
  lines.push(...extra, 'END:VCALENDAR');
  return lines.map(icsFold).join('\r\n') + '\r\n';
}

// Daily reminders for the question and Monday reminders for the mission.
export function reminderIcs(timeHHMM) {
  const [h, m] = timeHHMM.split(':').map(Number);
  const start = new Date();
  start.setHours(h, m, 0, 0);
  const monday = new Date(start);
  monday.setDate(monday.getDate() + ((8 - monday.getDay()) % 7));
  const ev = (uid, when, rule, title) => ['BEGIN:VEVENT', `UID:${uid}@little-us`, `DTSTAMP:${icsTime(Date.now())}`, `DTSTART:${icsTime(when)}`,
    `DTEND:${icsTime(new Date(when.getTime() + 600000))}`, `RRULE:${rule}`, `SUMMARY:${icsEscape(title)}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${icsEscape(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'];
  return icsFor([], [...ev('daily-question', start, 'FREQ=DAILY', 'Little Us: today\'s question'), ...ev('weekly-mission', monday, 'FREQ=WEEKLY;BYDAY=MO', 'Little Us: a new mission')]);
}

export async function saveFile(filename, text, type) {
  const blob = new Blob([text], { type });
  if (cloud.downloads) {
    try {
      await cloud.downloads.save({ filename, data: blob });
      return;
    } catch (e) {
      if (e?.code === 'cancelled' || e?.code === 'declined') return;
    }
  }
  try {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  } catch {
    toast('Downloads are not available here.');
  }
}

// ---------- wishing well: dreams ----------

export function openDreams(g, openId = null) {
  if (openId) return dreamDetail(g, openId);
  const list = Object.entries(S.dreams).map(([id, d]) => ({ id, ...d })).filter(d => d.stage !== 'archived');
  const stages = [['someday', 'Someday'], ['next', 'Next'], ['doing', 'Doing'], ['done', 'Done']];
  const well = S.discoveries['old-well'];
  const lights = Object.keys(well?.lights || {}).length;
  const html = `
    <section class="qcard">
      <p class="prompt">${well?.at ? 'Two little lights, one shared wish.' : 'The wishing well'}</p>
      <p class="detail">${well?.at ? 'The well remembers you both.' : `Each of you can leave a little light here. ${lights} of 2 lit.`}</p>
      ${well?.lights?.[cloud.me] ? '' : '<button class="btn ghost" id="light">Leave a light</button>'}
    </section>
    <form id="dream-form" class="form">
      <label class="label" for="dream-title">A new dream</label>
      <input id="dream-title" maxlength="100" placeholder="Something you hope for">
      <div class="choices">${C.dreamStarters.slice(0, 6).map(s => `<button type="button" class="chip" data-starter="${s.id}">${esc(s.title)}</button>`).join('')}</div>
      <div class="grid2">
        <div><label class="label" for="dream-cat">Kind</label><select id="dream-cat">${C.dreamCategories.map(c => `<option>${esc(c)}</option>`).join('')}</select></div>
        <div><label class="label" for="dream-owner">Whose</label><select id="dream-owner"><option value="shared">Ours</option><option value="me">Just mine</option></select></div>
      </div>
      <div class="row-actions"><button class="btn" type="submit">Add dream</button></div>
    </form>
    ${stages.map(([st, label]) => {
      const items = list.filter(d => d.stage === st);
      return items.length ? `<h3>${label}</h3><ul class="list">${items.map(d => `<li><span class="name">${esc(d.title)}<small>${esc(d.category)} · ${d.owner === 'shared' ? 'Ours' : esc(nameOf(d.owner)) + '\'s'} · ${(d.steps || []).filter(s => s.done).length}/${(d.steps || []).length} steps${d.target ? ' · by ' + esc(d.target) : ''}</small></span><button class="btn small ghost" data-open="${d.id}">Open</button></li>`).join('')}</ul>` : '';
    }).join('')}`;
  openSheet('Wishing well', html, body => {
    body.querySelector('#light')?.addEventListener('click', () => {
      const r = leaveWellLight();
      toast(r.done ? 'Two little lights, one shared wish.' : 'Your light is in the well. It waits for your partner\'s.');
      setTimeout(() => openDreams(g), 300);
    });
    body.querySelectorAll('[data-starter]').forEach(b => b.addEventListener('click', () => {
      const s = C.dreamStarters.find(x => x.id === b.dataset.starter);
      body.querySelector('#dream-title').value = s.title;
      body.querySelector('#dream-cat').value = s.category;
    }));
    body.querySelector('#dream-form').addEventListener('submit', async e => {
      e.preventDefault();
      const title = body.querySelector('#dream-title').value.trim();
      if (!title) return toast('Give your dream a name.');
      const id = newId();
      await setDoc(`dreams/${id}`, {
        title, text: C.dreamStarters.find(s => s.title === title)?.text || '', category: body.querySelector('#dream-cat').value,
        owner: body.querySelector('#dream-owner').value === 'me' ? cloud.me : 'shared', stage: 'someday', steps: [], target: '',
        by: cloud.me, at: now(), version: 1,
      }).catch(() => {});
      dreamDetail(g, id);
    });
    body.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => dreamDetail(g, b.dataset.open)));
  }, null, () => openDreams(g));
}

function dreamDetail(g, id) {
  const d = S.dreams[id];
  if (!d) return openDreams(g);
  const steps = d.steps || [];
  const html = `
    <p class="detail">${esc(d.category)} · ${d.owner === 'shared' ? 'Ours' : esc(nameOf(d.owner)) + '\'s'}</p>
    ${d.text ? `<p>${esc(d.text)}</p>` : ''}
    <div class="grid2">
      <div><label class="label" for="dr-stage">Stage</label><select id="dr-stage">${C.dreamStates.map(s => `<option value="${s}" ${d.stage === s ? 'selected' : ''}>${esc({ someday: 'Someday', next: 'Next', doing: 'Doing', done: 'Done', archived: 'Put away' }[s])}</option>`).join('')}</select></div>
      <div><label class="label" for="dr-target">Hope to by</label><input id="dr-target" type="date" value="${esc(d.target || '')}"></div>
    </div>
    <h3>Next steps (${steps.filter(s => s.done).length} of ${steps.length})</h3>
    <ul class="steps-list">${steps.map((s, i) => `<li><label class="check"><input type="checkbox" data-step="${i}" ${s.done ? 'checked' : ''}> ${esc(s.text)}</label><button class="link" data-rm="${i}">Remove</button></li>`).join('')}</ul>
    ${steps.length < 50 ? `<form id="step-form" class="inline"><label class="sr" for="step-text">New step</label><input id="step-text" maxlength="140" placeholder="A small next step"><button class="btn small" type="submit">Add</button></form>` : ''}
    <div class="row-actions"><button class="btn ghost" id="back">All dreams</button>${d.by === cloud.me ? '<button class="btn ghost" id="del">Delete dream</button>' : ''}</div>`;
  const save = patch => setDoc(`dreams/${id}`, { ...S.dreams[id], ...patch, version: (S.dreams[id].version || 0) + 1, at: now() }).catch(() => {});
  openSheet(d.title, html, body => {
    body.querySelector('#dr-stage').addEventListener('change', e => {
      save({ stage: e.target.value });
      if (e.target.value === 'done') toast('A dream come true.');
    });
    body.querySelector('#dr-target').addEventListener('change', e => save({ target: e.target.value }));
    body.querySelectorAll('[data-step]').forEach(b => b.addEventListener('change', () => {
      const next = steps.map((s, i) => (i === +b.dataset.step ? { ...s, done: b.checked } : s));
      save({ steps: next });
    }));
    body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => save({ steps: steps.filter((_, i) => i !== +b.dataset.rm) })));
    body.querySelector('#step-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const t = body.querySelector('#step-text').value.trim();
      if (t) save({ steps: [...steps, { text: t, done: false }] });
    });
    body.querySelector('#back').addEventListener('click', () => openDreams(g));
    body.querySelector('#del')?.addEventListener('click', () => { deleteDoc(`dreams/${id}`); openDreams(g); });
  }, null, () => dreamDetail(g, id));
}

// ---------- journal: moments, conversations, scrapbook, discoveries ----------

export function openJournal(g, tab = 'moments', arg = null) {
  const tabs = [['moments', 'Moments'], ['talk', 'Conversations'], ['scrapbook', 'Scrapbook'], ['found', 'Discoveries']]
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  let inner = '';
  if (tab === 'moments') inner = momentsHtml(g, arg || 40);
  if (tab === 'talk') inner = arg ? packHtml(arg) : packsHtml();
  if (tab === 'scrapbook') inner = scrapbookHtml();
  if (tab === 'found') inner = discoveriesHtml();
  openSheet('Journal', `<div class="tabs">${tabs}</div>${inner}`, body => {
    body.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => openJournal(g, b.dataset.tab)));
    if (tab === 'moments') body.querySelector('#older')?.addEventListener('click', () => openJournal(g, 'moments', (arg || 40) + 40));
    if (tab === 'talk') bindPacks(body, g, arg);
    if (tab === 'scrapbook') bindScrapbook(body, g);
  }, null, () => openJournal(g, tab, arg));
}

function momentsHtml(g, limit) {
  const partner = partnerId();
  const items = [];
  const keys = new Set(Object.values(S.answers).map(a => a.key));
  for (const key of keys) {
    if (!partner || !bothRevealed(key)) continue;
    const a = answerFor(key, cloud.me), b = answerFor(key, partner);
    items.push({ at: Math.max(a.at, b.at), html: `<p class="prompt">${esc(a.prompt || b.prompt || 'A question')}</p><div class="pair"><div class="said"><span class="label">${esc(nameOf(cloud.me))}</span><p>${esc(a.text)}</p></div><div class="said them"><span class="label">${esc(nameOf(partner))}</span><p>${esc(b.text)}</p></div></div>`, kind: 'Answers' });
  }
  for (const c of Object.values(S.checkins)) {
    const mood = C.moods.find(m => m.id === c.mood);
    items.push({ at: c.at, kind: 'Check-in', html: `<p><strong>${esc(nameOf(c.uid))}</strong> felt ${esc(mood?.label?.toLowerCase() || '')}, energy ${c.energy}/5.</p>${c.note ? `<p class="note">${esc(c.note)}</p>` : ''}` });
  }
  for (const n of Object.values(S.notes)) {
    const card = n.kind === 'card' ? C.appreciations.find(a => a.id === n.style) : null;
    items.push({ at: n.at, kind: card ? card.label : 'Note', html: `<p>${esc(n.text)}</p><p class="from">${esc(nameOf(n.by))}</p>` });
  }
  for (const m of Object.values(S.missions)) if (m.state === 'done') items.push({ at: m.at, kind: 'Mission', html: `<p><strong>${esc(nameOf(m.uid))}</strong> finished “${esc(m.title)}”.</p>${m.memory ? `<p class="note">${esc(m.memory)}</p>` : ''}` });
  for (const r of Object.values(S.rituals)) if (r.intention) items.push({ at: r.at, kind: 'Intention', html: `<p>${esc(r.intention)}</p>` });
  for (const d of Object.values(S.dates)) if (d.done) items.push({ at: d.doneAt || d.at, kind: 'Date', html: `<p>${esc(d.title)}</p>` });
  for (const d of Object.values(S.dreams)) if (d.stage === 'done') items.push({ at: d.at, kind: 'Dream come true', html: `<p>${esc(d.title)}</p>` });
  for (const [id, d] of Object.entries(S.discoveries)) if (d.at) items.push({ at: d.at, kind: 'Discovery', html: `<p>${esc(C.landmarks.find(l => l.id === id)?.secret || id)}</p>` });
  for (const m of Object.values(S.meals)) items.push({ at: m.at, kind: 'Cooked together', html: `<p>You made ${esc((RECIPE_BY_ID[m.recipeId]?.name || 'a mystery stew').toLowerCase())} together.</p>` });
  const nights = {};
  for (const n of Object.values(S.goodnights)) (nights[n.day] = nights[n.day] || []).push(n);
  for (const list of Object.values(nights)) if (new Set(list.map(n => n.uid)).size >= 2) items.push({ at: Math.max(...list.map(n => n.at)), kind: 'Goodnight', html: '<p>You both said goodnight from your bedroom.</p>' });
  items.sort((a, b) => b.at - a.at);
  if (!items.length) return '<p class="detail">Your shared moments will collect here: answers you\'ve both opened, shared check-ins, notes, missions, dates, dreams and discoveries.</p>';
  return `<ul class="moments">${items.slice(0, limit).map(i => `<li><span class="label">${esc(i.kind)} · ${esc(fmtDate(i.at))}</span>${i.html}</li>`).join('')}</ul>
    ${items.length > limit ? '<div class="row-actions"><button class="btn ghost" id="older">Show older</button></div>' : ''}`;
}

// Question packs: 306 sets of questions, answered the same sealed way.
function packsHtml() {
  const cats = [...new Set(C.packs.map(p => p.category))];
  return `<p class="detail">${C.packs.length} question packs. Answer on your own; each answer opens when you've both answered.</p>
    <label class="sr" for="pack-search">Search packs</label><input id="pack-search" placeholder="Search packs">
    <div id="pack-list">${cats.map(c => `<details><summary>${esc(c)} <small>(${C.packs.filter(p => p.category === c).length})</small></summary><ul class="list">${C.packs.filter(p => p.category === c).map(packRow).join('')}</ul></details>`).join('')}</div>`;
}

function packRow(p) {
  const answered = p.questions.filter((_, i) => answerFor(`pack-${p.id}-${i}`, cloud.me)?.state === 'answered').length;
  return `<li><span class="name">${esc(p.title)}<small>${esc(p.level || p.subtitle || '')} · ${answered}/${p.questions.length} answered</small></span><button class="btn small ghost" data-pack="${esc(p.id)}">Open</button></li>`;
}

function packHtml(id) {
  const p = C.packById[id];
  return `<div class="row-actions"><button class="btn ghost small" id="all-packs">All packs</button></div>
    <h3>${esc(p.title)}</h3><p class="detail">${esc(p.subtitle || '')} · ${esc(p.minutes || '')} minutes</p>
    ${p.questions.map((q, i) => answerBlock(`pack-${p.id}-${i}`, q, { meta: `Question ${i + 1} of ${p.questions.length}`, later: false })).join('')}`;
}

function bindPacks(body, g, packId) {
  body.querySelectorAll('[data-pack]').forEach(b => b.addEventListener('click', () => openJournal(g, 'talk', b.dataset.pack)));
  body.querySelector('#all-packs')?.addEventListener('click', () => openJournal(g, 'talk'));
  const search = body.querySelector('#pack-search');
  search?.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    const list = body.querySelector('#pack-list');
    if (!term) { openJournal(g, 'talk'); return; }
    const hits = C.packs.filter(p => (p.title + ' ' + (p.subtitle || '') + ' ' + p.questions.join(' ')).toLowerCase().includes(term)).slice(0, 40);
    list.innerHTML = hits.length ? `<ul class="list">${hits.map(packRow).join('')}</ul>` : '<p class="detail">No packs match.</p>';
    list.querySelectorAll('[data-pack]').forEach(b => b.addEventListener('click', () => openJournal(g, 'talk', b.dataset.pack)));
  });
  if (packId) {
    const p = C.packById[packId];
    bindAnswers(body, g, k => ({ prompt: p.questions[+k.split('-').pop()] || '' }));
  }
}

function scrapbookHtml() {
  const entries = Object.entries(S.scrapbook).map(([id, e]) => ({ id, ...e })).sort((a, b) => b.at - a.at);
  return `<form id="scrap-form" class="form">
      <label class="label" for="scrap-text">Keep a memory</label>
      <textarea id="scrap-text" rows="2" maxlength="1000" placeholder="Something you want to remember"></textarea>
      ${cloud.canUpload ? `<label class="label" for="scrap-file">Add a photo or a voice recording (optional)</label>
        <input id="scrap-file" type="file" accept="image/jpeg,image/png,image/webp,audio/*">` : '<p class="detail small">Photos and voice recordings can be added when the jar is open on claude.ai.</p>'}
      <div class="row-actions"><button class="btn" type="submit">Keep it</button></div>
    </form>
    <ul class="scrap">${entries.map(e => `<li>
      ${e.kind === 'photo' && e.url ? `<img src="${esc(e.url)}" alt="" loading="lazy">` : ''}
      ${e.kind === 'audio' && e.url ? `<audio controls preload="none" src="${esc(e.url)}"></audio>` : ''}
      ${e.text ? `<p>${esc(e.text)}</p>` : ''}
      <p class="from">${esc(nameOf(e.by))} · ${esc(fmtDate(e.at))}
        ${['♡', '✿', '☺'].map(r => `<button class="react ${e.reactions?.[cloud.me] === r ? 'on' : ''}" data-react="${e.id}" data-r="${r}" aria-label="React ${r}">${r}${Object.values(e.reactions || {}).filter(x => x === r).length || ''}</button>`).join('')}
        ${e.by === cloud.me ? `<button class="link" data-rm="${e.id}">Delete</button>` : ''}</p>
    </li>`).join('')}</ul>`;
}

function bindScrapbook(body, g) {
  body.querySelector('#scrap-form').addEventListener('submit', async e => {
    e.preventDefault();
    const text = body.querySelector('#scrap-text').value.trim();
    const file = body.querySelector('#scrap-file')?.files?.[0];
    if (!text && !file) return toast('Write something or choose a file.');
    let upload = null;
    if (file) {
      if (file.size > 12 * 1024 * 1024) return toast('That file is over 12 MB. Choose a smaller one.');
      toast('Uploading…');
      try {
        upload = await cloud.assets.upload(file);
      } catch {
        return toast('The upload did not work. Try again.');
      }
    }
    await setDoc(`scrapbook/${newId()}`, {
      by: cloud.me, text, at: now(), kind: upload ? (file.type.startsWith('audio') ? 'audio' : 'photo') : 'text',
      assetId: upload?.id || null, url: upload?.url || null, reactions: {},
    }).catch(() => toast('Could not save. Try again.'));
    openJournal(g, 'scrapbook');
  });
  body.querySelectorAll('[data-react]').forEach(b => b.addEventListener('click', () => {
    const entry = S.scrapbook[b.dataset.react];
    const same = entry.reactions?.[cloud.me] === b.dataset.r;
    updateDoc(`scrapbook/${b.dataset.react}`, { reactions: { [cloud.me]: same ? null : b.dataset.r } }).catch(() => {});
  }));
  body.querySelectorAll('[data-rm]').forEach(b => b.addEventListener('click', () => deleteDoc(`scrapbook/${b.dataset.rm}`)));
}

// Where each of the ten discoveries hides in this jar.
export const DISCOVERY_HINTS = {
  'hollow-log': 'Place a mossy log and tap it.',
  'mushroom-ring': 'Forage a mushroom from the meadow.',
  'moon-cave': 'Go down into the cave.',
  spring: 'Catch five fish in the pond.',
  'seed-garden': 'Grow something from a seed and pick it.',
  'firefly-grove': 'Visit the jar at night.',
  'old-well': 'Each of you leaves a light at the wishing well.',
  'rain-pool': 'Be in the jar while it rains.',
  'picnic-oak': 'Sit on the picnic blanket.',
  'crystal-pool': 'Dig down to the Crystal layers.',
};

function discoveriesHtml() {
  const found = C.landmarks.filter(l => S.discoveries[l.id]?.at).length;
  return `<p class="detail">${found} of ${C.landmarks.length} found. Discoveries are kept for both of you.</p>
    <ul class="list">${C.landmarks.map(l => {
      const d = S.discoveries[l.id];
      return `<li class="${d?.at ? 'got' : 'missing'}"><span class="name">${d?.at ? esc(l.secret) : '???'}<small>${d?.at ? esc(l.description) : esc(DISCOVERY_HINTS[l.id] || l.hint)}</small></span></li>`;
    }).join('')}</ul>`;
}

export function noticeDiscovery(id) {
  if (!C.ready || !S.ready) return;
  const l = C.landmarks.find(x => x.id === id);
  if (l && discover(id)) toast(`Discovery: ${l.secret}. ${l.description}`);
}

