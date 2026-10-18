// The picnic blanket hangout: live chat, a shared drawing pad, a shared timer
// and playful questions, for whoever has the jar open right now.
// Chat and drawings are live only and are not saved, unless you keep the drawing.
import { C } from './content.js';
import { cloud, setDoc, newId, now, namesFor } from './cloud.js';
import { S } from './shared.js';
import { openSheet, toast, esc } from './ui.js';
import { saveFile } from './together.js';

const chat = [];
const strokes = [];
let started = false;
let redraw = null;
let refresh = null;

const COLORS = ['#38493D', '#C68F89', '#6F925B', '#79AAA4', '#E8B83A', '#9C82C9'];

export function startHangout(room) {
  if (!room || started) return;
  started = true;
  room.on('chat', msg => {
    const text = typeof msg.data?.text === 'string' ? msg.data.text.slice(0, 500) : '';
    if (!text) return;
    chat.push({ by: msg.by, isMe: msg.isMe, text, at: Date.now() });
    if (chat.length > 80) chat.shift();
    refresh?.();
  });
  room.on('draw', msg => {
    const d = msg.data;
    if (!d || !Array.isArray(d.pts) || d.pts.length > 200) return;
    const pts = d.pts.filter(p => Array.isArray(p) && p.length === 2).map(([x, y]) => [Math.max(0, Math.min(1, +x || 0)), Math.max(0, Math.min(1, +y || 0))]);
    const color = COLORS.includes(d.color) ? d.color : COLORS[0];
    if (msg.isMe && msg.sameTab) return;
    strokes.push({ pts, color });
    redraw?.();
  });
  room.on('drawclear', () => {
    strokes.length = 0;
    redraw?.();
  });
  room.onPeers(() => refresh?.());
}

function peopleHere() {
  const room = cloud.room;
  if (!room) return [];
  const seen = new Map();
  for (const p of room.peers()) if (p.kind === 'viewer' && p.by) seen.set(p.by, p);
  return [...seen.keys()];
}

export function openHangout(g) {
  const room = cloud.room;
  const timer = S.timer && S.timer.endsAt > now() ? S.timer : null;
  const prompt = S.prompt ? C.prompts[S.prompt.i % C.prompts.length] : null;
  const html = `
    <p class="detail" id="here">${room ? 'Checking who\'s here…' : 'The hangout needs the jar open on claude.ai. Everything else still works.'}</p>
    <section><h3>Ask each other</h3>
      <p class="prompt" id="prompt-text">${prompt ? esc(prompt.text) : 'Tap for a playful question to talk about.'}</p>
      <button class="btn ghost small" id="new-prompt">New question</button></section>
    <section><h3>Draw together</h3>
      <div class="pad-wrap"><canvas id="pad" width="480" height="320" aria-label="Shared drawing pad"></canvas></div>
      <div class="choices">${COLORS.map((c, i) => `<button class="swatch ${i === 0 ? 'on' : ''}" data-color="${c}" style="background:${c}" aria-label="Pen colour ${i + 1}"></button>`).join('')}
        <button class="btn small ghost" id="clear-pad">Clear</button><button class="btn small ghost" id="keep-pad">Keep drawing</button></div></section>
    <section><h3>Chat</h3>
      <ul class="chat" id="chat-list"></ul>
      <form id="chat-form" class="inline"><label class="sr" for="chat-text">Message</label>
        <input id="chat-text" maxlength="500" autocomplete="off" placeholder="${room ? 'Say something' : 'Chat works on claude.ai'}" ${room ? '' : 'disabled'}>
        <button class="btn small" type="submit" ${room ? '' : 'disabled'}>Send</button></form>
      <p class="detail small">Chat and drawings disappear when you both leave. Voice and video calls aren't available inside this page.</p></section>
    <section><h3>Shared timer</h3>
      <p id="timer-text" class="timer">${timer ? '' : 'No timer running.'}</p>
      <div class="row-actions">${[5, 10, 20].map(m => `<button class="btn small ghost" data-min="${m}">${m} min</button>`).join('')}<button class="btn small ghost" id="stop-timer">Stop</button></div></section>`;
  let color = COLORS[0];
  let tick = null;
  openSheet('Picnic hangout', html, async body => {
    const pad = body.querySelector('#pad');
    const pctx = pad.getContext('2d');
    redraw = () => {
      pctx.fillStyle = '#FFF7E4';
      pctx.fillRect(0, 0, pad.width, pad.height);
      pctx.lineCap = 'round';
      pctx.lineJoin = 'round';
      pctx.lineWidth = 5;
      for (const s of strokes) {
        pctx.strokeStyle = s.color;
        pctx.beginPath();
        s.pts.forEach(([x, y], i) => (i ? pctx.lineTo(x * pad.width, y * pad.height) : pctx.moveTo(x * pad.width, y * pad.height)));
        pctx.stroke();
      }
    };
    redraw();
    let current = null;
    let pending = [];
    const point = e => {
      const r = pad.getBoundingClientRect();
      return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))];
    };
    const flush = () => {
      if (pending.length > 1 && room) room.emit('draw', { pts: pending.map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]), color }).catch(() => {});
      pending = pending.length ? [pending[pending.length - 1]] : [];
    };
    pad.addEventListener('pointerdown', e => {
      pad.setPointerCapture(e.pointerId);
      current = { pts: [point(e)], color };
      strokes.push(current);
      pending = [current.pts[0]];
    });
    pad.addEventListener('pointermove', e => {
      if (!current) return;
      const p = point(e);
      current.pts.push(p);
      pending.push(p);
      if (pending.length >= 12) flush();
      redraw();
    });
    const end = () => { if (current) flush(); current = null; pending = []; };
    pad.addEventListener('pointerup', end);
    pad.addEventListener('pointercancel', end);
    body.querySelectorAll('[data-color]').forEach(b => b.addEventListener('click', () => {
      color = b.dataset.color;
      body.querySelectorAll('[data-color]').forEach(x => x.classList.toggle('on', x === b));
    }));
    body.querySelector('#clear-pad').addEventListener('click', () => {
      strokes.length = 0;
      redraw();
      room?.emit('drawclear', {}).catch(() => {});
    });
    body.querySelector('#keep-pad').addEventListener('click', () => {
      pad.toBlob(async blob => {
        if (!blob) return;
        if (cloud.assets) {
          try {
            const up = await cloud.assets.upload(blob);
            await setDoc(`scrapbook/${newId()}`, { by: cloud.me, text: 'A drawing from our hangout', at: now(), kind: 'photo', assetId: up.id, url: up.url, reactions: {} });
            toast('Kept in the scrapbook.');
            return;
          } catch { /* fall back to a download */ }
        }
        saveFile('our-drawing.png', blob, 'image/png');
      }, 'image/png');
    });
    body.querySelector('#new-prompt').addEventListener('click', () => {
      setDoc('live/prompt', { i: Math.floor(Math.random() * C.prompts.length), by: cloud.me, at: now() }).catch(() => {});
    });
    const list = body.querySelector('#chat-list');
    const hereEl = body.querySelector('#here');
    const promptEl = body.querySelector('#prompt-text');
    const renderLive = async () => {
      const names = await namesFor([...chat.map(c => c.by), ...peopleHere()]);
      list.innerHTML = chat.length
        ? chat.map(c => `<li class="${c.isMe ? 'me' : ''}"><span class="label">${esc(c.isMe ? 'You' : names[c.by] || 'Your partner')}</span>${esc(c.text)}</li>`).join('')
        : '<li class="empty">No messages yet.</li>';
      list.scrollTop = list.scrollHeight;
      const others = peopleHere().filter(id => id !== cloud.me);
      if (room) hereEl.textContent = others.length ? `${others.map(id => names[id] || 'Your partner').join(', ')} is here with you.` : 'Only you are here right now. When your partner opens the jar, you can chat and draw together.';
    };
    refresh = renderLive;
    renderLive();
    body.querySelector('#chat-form').addEventListener('submit', e => {
      e.preventDefault();
      const input = body.querySelector('#chat-text');
      const text = input.value.trim();
      if (!text || !room) return;
      if (!room.connected()) return toast('Reconnecting… try again in a moment.');
      room.emit('chat', { text }).catch(() => toast('Could not send.'));
      input.value = '';
    });
    body.querySelectorAll('[data-min]').forEach(b => b.addEventListener('click', () => {
      setDoc('live/timer', { endsAt: now() + +b.dataset.min * 60000, minutes: +b.dataset.min, by: cloud.me }).catch(() => {});
    }));
    body.querySelector('#stop-timer').addEventListener('click', () => setDoc('live/timer', { endsAt: 0, by: cloud.me }).catch(() => {}));
    const timerText = body.querySelector('#timer-text');
    const showTimer = () => {
      const p = S.prompt ? C.prompts[S.prompt.i % C.prompts.length] : null;
      if (p && promptEl.textContent !== p.text) promptEl.textContent = p.text;
      const t = S.timer && S.timer.endsAt > now() ? S.timer : null;
      if (!t) { timerText.textContent = 'No timer running.'; return; }
      const left = Math.ceil((t.endsAt - now()) / 1000);
      timerText.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')} left of ${t.minutes} minutes`;
    };
    showTimer();
    tick = setInterval(showTimer, 1000);
  }, () => { clearInterval(tick); redraw = null; refresh = null; });
}
