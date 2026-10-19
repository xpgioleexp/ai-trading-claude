// The event stand in the meadow: what's on today, what's coming up, and each
// event's own panel (festival entries, lantern wishes, the snowman, mushroom basket).
import { cloud, setDoc, now } from './cloud.js';
import { S, partnerId } from './shared.js';
import { openSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { dayOfSeason, seasonOf } from './clock.js';
import { iconURL } from './sprites.js';
import { nameOf } from './together.js';
import { furnitureItem } from './visitors.js';
import { addItem } from './rules.js';
import {
  eventsToday, eventsNow, upcoming, festivalPrize, MUSHROOM_GOAL, SNOWMAN_PARTS, snowmanParts,
  SNOWMAN_PRIZE, LANTERN_PRIZE, STARS_PER_NIGHT,
} from './events.js';

const cap = s => s[0].toUpperCase() + s.slice(1);
const icon = id => `<img class="icon" src="${iconURL(id)}" alt="" width="32" height="32">`;

// Shared event docs for today: "<day>-<kind>-<uid>".
export function eventDocs(day, kind) {
  const prefix = `${day}-${kind}-`;
  return Object.entries(S.events).filter(([id]) => id.startsWith(prefix)).map(([, d]) => d);
}
const mine = (day, kind) => S.events[`${day}-${kind}-${cloud.me}`];

// Mushroom season keeps a basket count for the whole event.
export function mushroomKey(day) {
  return 'mushrooms-' + (day - dayOfSeason(day) + 1);
}
export function countMushroom(state, day) {
  state.events = state.events || {};
  const k = mushroomKey(day);
  state.events[k] = { n: (state.events[k]?.n || 0) + 1, claimed: !!state.events[k]?.claimed };
  return state.events[k].n;
}

function dayName(g, day) {
  const diff = day - g.today;
  return diff === 1 ? 'Tomorrow' : `${cap(seasonOf(day))} ${dayOfSeason(day)}`;
}

export function openEventStand(g) {
  const s = g.state, day = g.today;
  const today = eventsToday(day);
  const live = new Set(eventsNow(day, g.hour).map(e => e.id));
  const sections = today.map(e => {
    const head = `<h3>${esc(e.name)}${live.has(e.id) ? '' : ' · tonight'}</h3><p class="detail">${esc(e.blurb)}</p>`;
    if (!live.has(e.id)) return head + '<p class="detail small">Come back after dark.</p>';
    return head + (SECTION[e.id]?.(g) || '');
  }).join('');
  const next = upcoming(day).map(u => `<li><span class="name">${esc(u.event.name)}<small>${esc(dayName(g, u.day))}${u.event.night ? ', at night' : ''}</small></span></li>`).join('');
  openSheet(today.length ? today.map(e => e.name).join(' · ') : 'Seasonal events', `
    ${sections || '<p class="detail">Nothing on today.</p>'}
    <h3>Coming up</h3><ul class="list">${next}</ul>`, body => {
    BIND.festival(g, body);
    BIND.lanterns(g, body);
    BIND.snow(g, body);
    BIND.mushrooms(g, body);
  }, null, () => openEventStand(g));
}

const SECTION = {
  festival(g) {
    const day = g.today, best = g.state.daily.festival, entered = mine(day, 'festival');
    const entries = eventDocs(day, 'festival').sort((a, b) => b.score - a.score);
    const rows = entries.map((e, i) => `<li>${icon(e.id)}<span class="name">${esc(nameOf(e.by))}${i === 0 && entries.length > 1 ? ' 🏆' : ''}<small>${esc(ITEMS[e.id].name)}, ${e.size} cm · ${e.score} points</small></span></li>`).join('');
    return `<p class="detail small">${g.state.daily.bites} bites left today. Your best counts by size against the biggest of its kind, plus a bonus for rarer fish.</p>
      ${best ? `<ul class="list"><li>${icon(best.id)}<span class="name">Your best: ${esc(ITEMS[best.id].name)}<small>${best.size} cm · ${best.score} points</small></span>
        ${entered ? '<span class="detail small">Entered</span>' : `<button class="btn small" data-enter>Enter it</button>`}</li></ul>`
        : '<p class="detail">Catch something in the pond to enter.</p>'}
      ${entered ? '' : '<p class="detail small">You can enter once. Your prize is pebbles, plus a fishing trophy the first time.</p>'}
      ${rows ? `<h3>Entries</h3><ul class="list">${rows}</ul>` : ''}`;
  },
  lanterns(g) {
    const day = g.today, my = mine(day, 'lantern');
    const partner = partnerId();
    const theirs = partner && S.events[`${day}-lantern-${partner}`];
    if (!my) {
      return `<label class="label" for="wish">Your wish (optional)</label>
        <textarea id="wish" rows="2" maxlength="140" placeholder="I wish…"></textarea>
        <button class="btn" data-lantern>Let your lantern go</button>
        ${theirs ? `<p class="detail small">${esc(nameOf(partner))} has let theirs go. Their wish shows once yours is up too.</p>` : ''}`;
    }
    return `<p class="detail">Your lantern is up${my.wish ? `: “${esc(my.wish)}”` : '.'}</p>
      ${theirs ? `<p class="detail">${esc(nameOf(partner))}'s lantern${theirs.wish ? `: “${esc(theirs.wish)}”` : ' is up too.'}</p>` : partner ? `<p class="detail small">Waiting for ${esc(nameOf(partner))} to let theirs go.</p>` : ''}`;
  },
  meteors(g) {
    const n = g.state.daily.stars || 0;
    return `<p class="detail">Tap a shooting star as it falls. ${n} of ${STARS_PER_NIGHT} caught tonight.</p>`;
  },
  snow(g) {
    const day = g.today, parts = snowmanParts(eventDocs(day, 'snow'));
    const done = parts >= SNOWMAN_PARTS.length;
    const helpers = eventDocs(day, 'snow').map(d => nameOf(d.by));
    return `<p class="detail">Snowman: ${parts} of ${SNOWMAN_PARTS.length} · ${SNOWMAN_PARTS.map((p, i) => (i < parts ? `<strong>${esc(p)}</strong>` : esc(p))).join(', ')}</p>
      ${helpers.length ? `<p class="detail small">Built by ${esc(helpers.join(' and '))}.</p>` : ''}
      ${done ? (mine(day, 'snow') && !g.state.daily.snowmanPrize ? '<button class="btn" data-snow-prize>Admire your snowman</button>' : '<p class="detail">It stands in the meadow until tomorrow.</p>')
        : `<button class="btn" data-roll>Roll the ${esc(SNOWMAN_PARTS[parts])}</button>`}`;
  },
  mushrooms(g) {
    const e = g.state.events?.[mushroomKey(g.today)] || { n: 0 };
    const full = e.n >= MUSHROOM_GOAL;
    return `<p class="detail">Your basket: ${Math.min(e.n, MUSHROOM_GOAL)} of ${MUSHROOM_GOAL} mushrooms. New ones pop up every day of the season.</p>
      ${full && !e.claimed ? '<button class="btn" data-basket>Trade your basket for a mushroom lamp</button>' : e.claimed ? '<p class="detail small">You got the mushroom lamp this season.</p>' : ''}`;
  },
};

function giveFurniture(state, type) {
  const id = furnitureItem(type);
  return addItem(state, id, 1) ? id : null;
}

const BIND = {
  festival(g, body) {
    body.querySelector('[data-enter]')?.addEventListener('click', async () => {
      const best = g.state.daily.festival;
      if (!best || mine(g.today, 'festival')) return;
      const doc = { ...best, by: cloud.me, at: now() };
      S.events[`${g.today}-festival-${cloud.me}`] = doc;
      await setDoc(`events/${g.today}-festival-${cloud.me}`, doc).catch(() => {});
      const prize = festivalPrize(best.score);
      g.state.pebbles += prize;
      let extra = '';
      if (!g.state.trophy) {
        if (giveFurniture(g.state, 'fish_trophy')) { g.state.trophy = true; extra = ' And a fishing trophy for your home!'; }
      }
      g.save();
      toast(`Entered! +${prize} pebbles.${extra}`);
      openEventStand(g);
    });
  },
  lanterns(g, body) {
    body.querySelector('[data-lantern]')?.addEventListener('click', async () => {
      const wish = (body.querySelector('#wish')?.value || '').trim().slice(0, 140);
      const doc = { wish, by: cloud.me, at: now() };
      S.events[`${g.today}-lantern-${cloud.me}`] = doc;
      await setDoc(`events/${g.today}-lantern-${cloud.me}`, doc).catch(() => {});
      const partner = partnerId();
      if (partner && S.events[`${g.today}-lantern-${partner}`] && !g.state.daily.lanternPrize) {
        g.state.daily.lanternPrize = true;
        g.state.pebbles += LANTERN_PRIZE;
        g.save();
        toast(`Your lanterns float up together. +${LANTERN_PRIZE} pebbles.`);
      } else toast('Your lantern drifts up into the night.');
      openEventStand(g);
    });
  },
  snow(g, body) {
    body.querySelector('[data-roll]')?.addEventListener('click', async () => {
      const key = `${g.today}-snow-${cloud.me}`;
      const doc = { by: cloud.me, rolls: (S.events[key]?.rolls || 0) + 1, at: now() };
      S.events[key] = doc;
      await setDoc(`events/${key}`, doc).catch(() => {});
      g.crouch?.();
      toast(snowmanParts(eventDocs(g.today, 'snow')) >= SNOWMAN_PARTS.length ? 'The snowman is finished!' : 'You roll a big snowball.');
      openEventStand(g);
    });
    body.querySelector('[data-snow-prize]')?.addEventListener('click', () => {
      if (g.state.daily.snowmanPrize) return;
      g.state.daily.snowmanPrize = true;
      g.state.pebbles += SNOWMAN_PRIZE;
      g.save();
      toast(`What a snowman. +${SNOWMAN_PRIZE} pebbles.`);
      openEventStand(g);
    });
  },
  mushrooms(g, body) {
    body.querySelector('[data-basket]')?.addEventListener('click', () => {
      const k = mushroomKey(g.today);
      if (g.state.events?.[k]?.claimed) return;
      if (!giveFurniture(g.state, 'mushroom_lamp')) return toast('Your bag is full.');
      g.state.events[k].claimed = true;
      g.save();
      toast('A mushroom lamp! It\'s in your bag.');
      openEventStand(g);
    });
  },
};
