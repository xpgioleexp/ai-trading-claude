// The old journal's panel, and finding pages as you go (see lore.js).
import { cloud, setDoc, now } from './cloud.js';
import { S, partnerId } from './shared.js';
import { openSheet, toast, esc, updateHud } from './ui.js';
import { nameOf } from './together.js';
import { OBJECTS, MEADOW_REGIONS } from './world.js';
import { MAPS } from './maps.js';
import { FURNITURE, FURNITURE_BY_TYPE } from './home.js';
import { addItem } from './rules.js';
import { furnitureItem } from './visitors.js';
import {
  CHAPTERS, PAGE_BY_ID, PAGE_COUNT, pageFound, chapterDone, finalOpen, spotsForMe, spotAtLandmark, spotInMine, spotForDigs,
  spotForFish, spotDoc, rewardDue, claimReward, myHalf,
} from './lore.js';

const docs = () => S.lore || {};
const me = () => cloud.me || 'me';

// The keepers' gift under the hollow oak, once the last letter is whole.
if (!FURNITURE_BY_TYPE.keepers_lanterns) {
  const def = { type: 'keepers_lanterns', name: 'The keepers\' twin lanterns', category: 'Special', price: 500, w: 1, h: 1, form: 'lantern', color: '#B5853A', accent: '#F2E48A', special: true, lore: true };
  FURNITURE.push(def);
  FURNITURE_BY_TYPE.keepers_lanterns = def;
}

// Where a landmark is, for hints: "The hollow oak, in Whispering woods".
function whereIs(id) {
  const o = OBJECTS.find(x => x.id === id);
  if (o) return `${o.name}, in ${MEADOW_REGIONS.find(r => r.id === o.region)?.name || 'the meadow'}`;
  for (const map of Object.values(MAPS)) {
    const m = map.objects.find(x => x.id === id);
    if (m) return `${m.name}, ${map.regions?.find(r => r.id === m.region)?.name || ''} (${map.name})`;
  }
  return 'somewhere';
}
const hintFor = where => (where.landmark ? whereIs(where.landmark) : where.mine ? `layer ${where.mine} of the mine` : where.digs ? `dig up ${where.digs} things` : where.fish ? 'with a very old fish in the big pond' : '');

// Landmarks where a page (or your half) is still waiting, for the glint.
export function refreshLoreSpots(g) {
  g.loreSpots = new Set(spotsForMe(docs(), me(), partnerId()).map(s => s.where.landmark).filter(Boolean));
}

function found(g, spot) {
  const { id, doc } = spotDoc(spot, me(), now());
  S.lore = { ...docs(), [id]: doc };
  setDoc(`lore/${id}`, doc).catch(() => {});
  refreshLoreSpots(g);
  const page = PAGE_BY_ID[spot.page];
  const whole = pageFound(docs(), spot.page);
  toast(spot.half == null ? `You found a page of the old journal: “${page.title}”.`
    : whole ? `You found the other half! “${page.title}” is whole again.` : 'You found half of a torn page. The other half is for someone else to find.');
  openJournal(g, spot.chapter);
}

// Hooks: call these when you tap a landmark, reach a mine layer, finish a dig or catch a fish.
export function loreAtLandmark(g, o) {
  if (o.id === 'hollow_oak' && finalOpen(docs()) && chapterDone(docs(), 'letter') && !g.state.keepersGift) {
    if (!addItem(g.state, furnitureItem('keepers_lanterns'), 1)) { toast('Your bag is full.'); return true; }
    g.state.keepersGift = true;
    g.save();
    toast('Inside the hollow oak: two little lanterns, one for each of you. The keepers\' gift.');
    return true;
  }
  const spot = spotAtLandmark(docs(), me(), partnerId(), o.id);
  if (!spot) return false;
  found(g, spot);
  return true;
}
export function loreInMine(g) {
  const spot = spotInMine(docs(), me(), partnerId(), g.state.mine.deepest || 0);
  if (spot) found(g, spot);
}
export function loreAfterDig(g) {
  const spot = spotForDigs(docs(), me(), partnerId(), g.state.fossilsDug || 0);
  if (spot) found(g, spot);
}
export function loreWithFish(g, fishId) {
  const spot = spotForFish(docs(), me(), partnerId(), fishId);
  if (spot) found(g, spot);
}

export function openJournal(g, open = null) {
  const d = docs();
  const total = CHAPTERS.flatMap(c => c.pages).filter(p => pageFound(d, p.id)).length;
  const mine = myHalf(me(), partnerId());
  const chapters = CHAPTERS.map(ch => {
    if (ch.final && !finalOpen(d)) return `<h3>${esc(ch.name)}</h3><p class="detail">Finish every other chapter first.</p>`;
    const done = chapterDone(d, ch.id);
    const pages = ch.pages.map(p => {
      if (pageFound(d, p.id)) {
        const by = p.halves ? p.halves.map((_, h) => nameOf(d[`${p.id}-${h}`]?.by)).join(' and ') : nameOf(d[p.id]?.by);
        const text = Array.isArray(p.text) ? p.text.join(' ') : p.text;
        return `<li class="page"><span class="name">“${esc(p.title)}”<small>${esc(text)}</small><small class="by">Found by ${esc(by)}</small></span></li>`;
      }
      if (p.halves) {
        const halves = p.halves.map((where, h) => {
          const got = d[`${p.id}-${h}`];
          if (got) return `<small>${esc(p.text[h])}</small>`;
          const yours = mine == null || mine === h;
          return `<small>${yours ? `Your half is at: ${esc(hintFor(where))}` : `Your partner's half is at: ${esc(hintFor(where))}`}</small>`;
        }).join('');
        return `<li class="page missing"><span class="name">A torn page${halves}</span></li>`;
      }
      return `<li class="page missing"><span class="name">A missing page<small>Look: ${esc(hintFor(p.where))}</small></span></li>`;
    }).join('');
    const due = rewardDue(g.state, d, ch.id);
    return `<details ${open === ch.id || (!open && !done) ? 'open' : ''}><summary><strong>${esc(ch.name)}</strong> · ${ch.pages.filter(p => pageFound(d, p.id)).length} of ${ch.pages.length}${done ? ' ✓' : ''}</summary>
      <ul class="list">${pages}</ul>
      ${due ? `<p><button class="btn small" data-reward="${ch.id}">Collect ${ch.reward} pebbles</button></p>` : ''}</details>`;
  }).join('');
  openSheet('The old journal', `
    <p class="detail">The story of the two keepers who made the jars, torn into pages and hidden all over the world. ${total} of ${PAGE_COUNT} pages found. Every page either of you finds goes in here for you both. A glint over a landmark means a page is waiting there for you.</p>
    ${chapters}`, root => {
    root.querySelectorAll('[data-reward]').forEach(b => b.addEventListener('click', () => {
      const n = claimReward(g.state, docs(), b.dataset.reward);
      if (!n) return;
      g.save();
      updateHud(g);
      toast(`+${n} pebbles from the keepers.`);
      openJournal(g, b.dataset.reward);
    }));
  });
}
