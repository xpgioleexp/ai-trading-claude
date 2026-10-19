// Your phone, like in Animal Crossing: every panel in the game is an app here.
// Opening an app closes the phone; the app's "Phone" button brings you back.
import { S, partnerId, answerFor } from './shared.js';
import { cloud } from './cloud.js';
import { C } from './content.js';
import * as UI from './ui.js';
import * as T from './together.js';
import * as R from './rules.js';
import { ITEMS, TOOL_TIERS, FISH } from './data.js';
import { openBuild, openMore, openAnimal } from './places.js';
import { openFurnish, openHome } from './home-ui.js';
import { openKitchen } from './kitchen.js';
import { openCrafting } from './crafting-ui.js';
import { openHangout } from './hangout.js';
import { openTravel, jarUnlocked } from './travel.js';
import { openEventStand } from './events-ui.js';
import { eventsToday } from './events.js';
import { MAPS, MAP_ORDER } from './maps.js';
import { visitorOn, requestFor, heartsFor, merchantHere, VISITORS } from './visitors.js';
import { CRITTERS, heartsOf, pointsFor, MAX_HEARTS } from './biomes.js';
import { MONSTERS, SWORD_DAMAGE } from './mine-data.js';
import { WEATHER_NAMES, WEATHER_TEXT, forecast, LEAVES_PER_DAY } from './weather.js';
import { BUGS } from './bugs.js';
import { openMuseum } from './museum-ui.js';
import { openMapFresh } from './world-map.js';
import { openJournal as openOldJournal } from './lore-ui.js';
import { readyToMount } from './museum.js';

const $ = sel => document.querySelector(sel);
const esc = UI.esc;

function ready(g) {
  if (C.ready && S.ready) return true;
  UI.toast('The jar is still waking up. Try again in a moment.');
  return false;
}

// Each app: what it's called, its icon, what it opens, and an optional badge.
// needs: 'ready' when it uses shared data that loads a moment after the jar opens.
const APPS = [
  { id: 'today', name: 'Today', icon: '💬', color: '#E07A9B', text: 'Daily question, mood check-in, weekly ritual', needs: 'ready',
    open: g => T.openToday(g), badge: g => S.ready && C.ready && !answerFor('day-' + g.today, cloud.me) },
  { id: 'questions', name: 'Questions', icon: '❓', color: '#9C82C9', text: '306 question packs to answer together', needs: 'ready', open: g => T.openJournal(g, 'talk') },
  { id: 'missions', name: 'Missions', icon: '🎯', color: '#E0873A', text: 'This week\'s mission and the pinboard', needs: 'ready', open: g => T.openBoard(g), badge: g => g.boardNew },
  { id: 'mail', name: 'Mail', icon: '💌', color: '#D9533C', text: 'Notes, appreciation cards and gifts', needs: 'ready', open: g => T.openMailbox(g, UI.letters(g)), badge: g => g.unreadMail },
  { id: 'dates', name: 'Dates', icon: '📅', color: '#5F9FB5', text: 'Plan dates and add them to your calendar', needs: 'ready', open: g => T.openCalendar(g) },
  { id: 'dreams', name: 'Dreams', icon: '🌠', color: '#5E4A7A', text: 'Your dreams, their steps, and the well light', needs: 'ready', open: g => T.openDreams(g) },
  { id: 'journal', name: 'Journal', icon: '📔', color: '#B88D60', text: 'Your moments together', needs: 'ready', open: g => T.openJournal(g, 'moments') },
  { id: 'scrapbook', name: 'Scrapbook', icon: '📸', color: '#C9A272', text: 'Photos, voice notes and keepsakes', needs: 'ready', open: g => T.openJournal(g, 'scrapbook') },
  { id: 'discoveries', name: 'Discoveries', icon: '🗺️', color: '#6F925B', text: 'Secret places you\'ve found', needs: 'ready', open: g => T.openJournal(g, 'found') },
  { id: 'hangout', name: 'Hangout', icon: '🧺', color: '#79AAA4', text: 'Live chat, drawing, a timer and conversation prompts', needs: 'ready', open: g => openHangout(g) },
  { id: 'bag', name: 'Bag', icon: '🎒', color: '#9C7046', text: 'Your things, tools and health', open: g => UI.openBag(g) },
  { id: 'log', name: 'Collection', icon: '📖', color: '#4F7A8A', text: 'Fish, bugs, finds, monsters and plants', open: g => UI.openLog(g) },
  { id: 'cooking', name: 'Cooking', icon: '🍳', color: '#E8B83A', text: 'Cook with your tools, and the recipe book', needs: 'ready', open: g => openKitchen(g) },
  { id: 'diy', name: 'DIY', icon: '🔨', color: '#A9825A', text: 'Craft furniture, outdoor things, toys, outfits and gifts', open: g => openCrafting(g) },
  { id: 'tools', name: 'Tools', icon: '🛠️', color: '#7D8796', text: 'Upgrade your rod, pickaxe and sword; crack geodes', open: g => UI.openWorkbench(g) },
  { id: 'wardrobe', name: 'Wardrobe', icon: '👗', color: '#C68F89', text: 'Change your look', open: g => UI.openWardrobe(g) },
  { id: 'build', name: 'Build', icon: '🪑', color: '#8DBA5C', text: 'Decorate the meadow, or furnish the room you\'re in', needs: 'ready', open: g => {
    if (g.scene === 'home') openFurnish(g);
    else if (g.scene === 'map') UI.toast('You build in your forest jar. Use the door to go home.');
    else openBuild(g);
  } },
  { id: 'home', name: 'House', icon: '🏡', color: '#B5653A', text: 'Upgrade your house and add rooms', needs: 'ready', open: g => openHome(g) },
  { id: 'shop', name: 'Shopping', icon: '🛍️', color: '#5FA05A', text: 'The beetle shop: seeds, pantry, farm, kitchen tools, furniture', open: g => UI.openShop(g) },
  { id: 'jars', name: 'Jars', icon: '🫙', color: '#5F7FB5', text: 'The jar shelf: open new jars and travel', needs: 'ready', open: g => openTravel(g) },
  { id: 'events', name: 'Events', icon: '🎪', color: '#D9466A', text: 'Seasonal events today and coming up', needs: 'ready', open: g => openEventStand(g),
    badge: g => (g.eventsToday || []).length > 0 },
  { id: 'friends', name: 'Friends', icon: '🐾', color: '#C99A6A', text: 'Your animals, visitors and jar friends', needs: 'ready', open: g => openFriends(g),
    badge: g => S.ready && !S.deliveries?.[String(g.today)] },
  { id: 'weather', name: 'Weather', icon: '🌦️', color: '#6F97C9', text: 'Today\'s weather, tomorrow\'s forecast, and what the weather brings', open: g => openWeather(g),
    badge: g => !!(g.wx?.rainbow || ['storm', 'blizzard'].includes(g.wx?.base)) },
  { id: 'lore', name: 'Old journal', icon: '📜', color: '#9C7046', text: 'The keepers\' story, torn into pages and hidden all over the world', needs: 'ready', open: g => openOldJournal(g) },
  { id: 'map', name: 'Map', icon: '🧭', color: '#7A9A5A', text: 'A map of everywhere you\'ve explored, with your pins', open: g => openMapFresh(g) },
  { id: 'museum', name: 'Museum', icon: '🦴', color: '#B9A07A', text: 'Fish, bugs, gems, fossils and artifacts on display, and skeletons to piece together', needs: 'ready',
    open: g => openMuseum(g, 'fossils', false), badge: () => readyToMount(S.museum).length > 0 },
  { id: 'mine', name: 'Mine', icon: '⛏️', color: '#5A4440', text: 'How deep you\'ve been, bosses and health', open: g => openMine(g) },
  { id: 'settings', name: 'Settings', icon: '⚙️', color: '#7A7A80', text: 'Your partner, the jar, reminders, rain and downloads', needs: 'ready', open: g => openMore(g) },
];
export const APP_IDS = APPS.map(a => a.id);

// Something new in any app: shows a dot on the phone button.
export function phoneHasNews(g) {
  return APPS.some(a => { try { return !!a.badge?.(g); } catch { return false; } });
}

export function openPhone(g) {
  UI.closeSheet();
  const phone = $('#phone');
  const d = g.date || new Date();
  const time = g.debugHour != null ? `${g.debugHour}:00` : `${((d.getHours() + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, '0')}`;
  phone.innerHTML = `
    <div class="phone-body" role="dialog" aria-label="Phone">
      <div class="phone-status"><span>${esc(time)}</span><span>${esc(String(g.state.pebbles))} pebbles</span></div>
      <div class="phone-title">${esc(S.world?.name || 'Our little jar')}</div>
      <div class="phone-grid">${APPS.map(a => `
        <button class="phone-app" type="button" data-app="${a.id}" title="${esc(a.text)}">
          <span class="phone-icon" style="background:${a.color}">${a.icon}${a.badge?.(g) ? '<i class="phone-dot" aria-label="new"></i>' : ''}</span>
          <span class="phone-name">${esc(a.name)}</span>
        </button>`).join('')}</div>
      <button class="phone-home" type="button" aria-label="Close the phone"></button>
    </div>`;
  phone.hidden = false;
  phone.querySelectorAll('[data-app]').forEach(b => b.addEventListener('click', () => openApp(g, b.dataset.app)));
  phone.querySelector('.phone-home').addEventListener('click', closePhone);
  phone.addEventListener('click', e => { if (e.target === phone) closePhone(); }, { once: true });
  phone.querySelector('[data-app]')?.focus({ preventScroll: true });
}

export function closePhone() {
  const phone = $('#phone');
  if (phone) phone.hidden = true;
}

export function phoneOpen() {
  return !$('#phone')?.hidden;
}

export function openApp(g, id) {
  const app = APPS.find(a => a.id === id);
  if (!app) return;
  if (app.needs === 'ready' && !ready(g)) return;
  closePhone();
  // The app's panel gets a "Phone" button that brings you back here.
  UI.setSheetBack(() => openPhone(g));
  app.open(g);
  if (!UI.sheetOpen()) UI.setSheetBack(null);
}

// ---------- Friends ----------

function hearts(n, max = 5) {
  return '♥'.repeat(Math.min(n, max)) + '♡'.repeat(Math.max(0, max - n));
}

export function openFriends(g) {
  const s = g.state;
  const v = visitorOn(s.seed, g.today);
  const req = requestFor(s.seed, g.today, v);
  const done = S.deliveries?.[String(g.today)];
  const residents = g.residents || [];
  const jarFriends = CRITTERS.filter(c => c.jar === 'forest' || jarUnlocked(c.jar));
  UI.openSheet('Friends', `
    <h3>Visiting today</h3>
    <ul class="list">
      <li><span class="name">${esc(v.name)} the ${esc(v.species)}<small>${done ? 'Their request is done for today.' : `Would love ${req.n} × ${esc(ITEMS[req.item].name)} (pays ${req.reward}). Find them in the meadow.`}</small></span>
        <span class="detail small">${hearts(heartsFor(S.deliveries || {}, v.id))}</span></li>
      ${merchantHere(s.seed, g.today) ? '<li><span class="name">The traveling merchant<small>On a rug in the meadow, today only.</small></span></li>' : ''}
    </ul>
    <h3>Living in your meadow</h3>
    ${residents.length ? `<ul class="list">${residents.map((a, i) => `<li><span class="name">${esc(S.animals?.[a.species]?.name || C.species?.[a.species]?.name || a.species)}<small>Lives in your meadow</small></span>
      <button class="btn small" data-resident="${i}">Visit</button></li>`).join('')}</ul>`
      : '<p class="detail">No animals yet. Invite one from Build → Residents.</p>'}
    <h3>Neighbours and wild friends</h3>
    ${jarFriends.length ? `<ul class="list">${jarFriends.map(c => `<li><span class="name">${esc(c.name)} the ${esc(c.species)}<small>${esc(c.jar === 'forest' ? 'Your meadow' : MAPS[c.jar].name)}${c.person ? ' · a neighbour' : ''}</small></span>
      <span class="detail small">${hearts(heartsOf(pointsFor(S.critters || {}, c.id)), MAX_HEARTS)}</span></li>`).join('')}</ul>`
      : '<p class="detail">Open another jar from the Jars app to meet the animals who live there.</p>'}
    <h3>Visitors you know</h3>
    <ul class="list">${VISITORS.map(x => `<li><span class="name">${esc(x.name)} the ${esc(x.species)}<small>${heartsFor(S.deliveries || {}, x.id)} deliveries</small></span>
      <span class="detail small">${hearts(heartsFor(S.deliveries || {}, x.id))}</span></li>`).join('')}</ul>`, body => {
    body.querySelectorAll('[data-resident]').forEach(b => b.addEventListener('click', () => {
      const a = residents[+b.dataset.resident];
      if (a) openAnimal(g, a);
    }));
  });
}

// ---------- Mine ----------

export function openWeather(g) {
  const wx = g.wx || {};
  const now = [
    wx.rainbow && 'A rainbow is out! Find the pot at its end for a rainbow shard and pebbles.',
    wx.sunshower && 'A sunshower: rain while the sun shines. A rainbow comes next.',
    wx.puddles && 'Puddles on the ground. Walk through them to splash; some hide a shiny pebble.',
    wx.frost && 'A frosty morning. Frost flowers grow until 10.',
    wx.clearAt != null && g.hour < wx.clearAt && `It clears up around ${wx.clearAt}:00.`,
  ].filter(Boolean);
  const tomorrow = forecast(g.state.seed, g.today);
  const caught = id => (g.state.log.fish?.[id] || g.state.log.bugs?.[id]) ? 'Caught' : 'Not yet';
  const special = [...FISH.filter(f => f.weather), ...BUGS.filter(b => b.weather && !b.map)];
  UI.openSheet('Weather', `
    <div class="tools">
      <div><span class="label">Today</span><strong>${esc(WEATHER_NAMES[wx.base] || WEATHER_NAMES[g.weather] || 'Clear')}</strong></div>
      <div><span class="label">Right now</span><strong>${esc(WEATHER_NAMES[g.weather] || 'Clear')}</strong></div>
      <div><span class="label">Tomorrow</span><strong>${esc(WEATHER_NAMES[tomorrow])}</strong></div>
      <div><span class="label">Leaves caught</span><strong>${g.state.daily?.leaves || 0} / ${LEAVES_PER_DAY}</strong></div>
    </div>
    <p class="detail">${esc(WEATHER_TEXT[wx.base] || WEATHER_TEXT[g.weather] || '')}</p>
    ${now.length ? `<ul class="list">${now.map(t => `<li><span class="name">${esc(t)}</span></li>`).join('')}</ul>` : ''}
    <h3>Tomorrow</h3>
    <p class="detail">${esc(WEATHER_TEXT[tomorrow])}</p>
    <h3>Only in some weather</h3>
    <ul class="list">${special.map(x => `<li><span class="name">${esc(x.name)}<small>${esc(WEATHER_NAMES[x.weather] || x.weather)}${x.weather === 'rain' ? ' or storms' : ''} · ${caught(x.id)}</small></span></li>`).join('')}</ul>
    <p class="detail small">Storms knock branches off the trees and lightning leaves glass where it strikes. Windy days blow leaves past to catch. Each jar with its own weather keeps it.</p>`);
}

export function openMine(g) {
  const s = g.state;
  const deepest = s.mine.deepest || 0;
  const zones = R.BAND_NAMES.map((name, i) => ({ name, reached: deepest >= i * 10 + 1 }));
  const bosses = Object.keys(s.mine.bosses || {});
  const beaten = s.log.monsters || {};
  UI.openSheet('Mine', `
    <div class="tools">
      <div><span class="label">Deepest layer</span><strong>${deepest} of 60</strong></div>
      <div><span class="label">Health</span><strong>${s.hp ?? R.maxHp(s)} / ${R.maxHp(s)}</strong></div>
      <div><span class="label">Pickaxe</span><strong>${TOOL_TIERS[s.tools.pick]}</strong></div>
      <div><span class="label">Sword</span><strong>${TOOL_TIERS[s.tools.sword || 0]} · ${SWORD_DAMAGE[s.tools.sword || 0]} damage</strong></div>
    </div>
    <h3>Zones</h3>
    <ul class="list">${zones.map(z => `<li><span class="name">${esc(z.name)}<small>${z.reached ? 'Reached' : 'Not yet'}</small></span></li>`).join('')}</ul>
    <h3>Bosses beaten</h3>
    <p class="detail">${bosses.length ? bosses.map(b => esc(MONSTERS[b]?.name || b)).join(', ') : 'None yet. Each zone has one on its last layer.'}</p>
    <p class="detail small">${Object.values(beaten).reduce((t, n) => t + n, 0)} monsters beaten in all. The cave is under the bench in the meadow.</p>`);
}
