// The museum's panels: giving things, walking the wings, the fossil hall and
// its skeletons, the dig shop, the excavation game and piecing skeletons
// together. Rules are in museum.js and fossils.js.
import { cloud, setDoc, now } from './cloud.js';
import { S } from './shared.js';
import { openSheet, closeSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { addItem } from './rules.js';
import { iconURL } from './sprites.js';
import { nameOf } from './together.js';
import { rngFor, shuffle } from './rng.js';
import {
  wings, wingProgress, museumProgress, donatable, donate, milestonesDue, claimMilestone, milestoneReward, MILESTONES,
  readyToMount, isMounted, mount, spareFossils, tradeSpares, SPARES_PER_TRADE, donatedSet,
} from './museum.js';
import {
  SPECIMENS, SPECIMEN_BY_ID, PART_INFO, PART_NAMES, ERAS, DIG_KITS, buyKit, DIG_W, excavate, claimExcavation,
  QUALITY_NAMES, QUALITY_BONUS, ASSEMBLE_REWARD,
} from './fossils.js';
import { FURNITURE_BY_TYPE } from './home.js';
import { skeletonURL } from './museum-art.js';

const CURATOR = 'Hazel';
const icon = (id, cls = '') => `<img class="icon ${cls}" src="${iconURL(id)}" alt="" width="32" height="32">`;
const docs = () => S.museum || {};
const pct = p => Math.floor(p * 100) + '%';

const TABS = [['give', 'Give'], ['fish', 'Fish'], ['bugs', 'Bugs'], ['minerals', 'Gems'], ['fossils', 'Fossils'], ['artifacts', 'Artifacts'], ['shop', 'Dig shop']];

// atMuseum: you're standing in it, so you can give things and put skeletons
// together. From the phone you can only look.
export function openMuseum(g, tab = 'give', atMuseum = true) {
  if (!atMuseum && tab === 'give') tab = 'fossils';
  const total = museumProgress(docs());
  const due = atMuseum ? milestonesDue(g.state, docs()) : [];
  const tabs = TABS.filter(([id]) => atMuseum || id !== 'give')
    .map(([id, label]) => `<button class="tab ${id === tab ? 'on' : ''}" data-tab="${id}" aria-pressed="${id === tab}">${label}</button>`).join('');
  const body = {
    give: () => giveTab(g), fossils: () => fossilTab(g, atMuseum), shop: () => shopTab(g, atMuseum),
  }[tab]?.() ?? wingTab(tab);
  const rewards = due.map(m => {
    const w = wings().find(x => x.id === m.wing), r = milestoneReward(m.wing, m.i);
    return `<li><span class="name">${esc(w.name)} is ${pct(MILESTONES[m.i])} full!<small>${r.pebbles} pebbles${r.piece ? ` and a ${esc(FURNITURE_BY_TYPE[r.piece].name.toLowerCase())}` : ''}</small></span>
      <button class="btn small" data-claim="${m.wing}:${m.i}">Collect</button></li>`;
  }).join('');
  openSheet('Museum', `
    <p class="detail">${atMuseum ? `<strong>${CURATOR} the curator:</strong> “` : ''}${total.have} of ${total.total} things on display.${atMuseum ? ' Everything you two give goes up for both of you.”' : ' Visit the museum in the north of the meadow to give things.'}</p>
    ${rewards ? `<ul class="list">${rewards}</ul>` : ''}
    <div class="tabs">${tabs}</div>
    ${body}`, root => {
    root.querySelectorAll('.tab').forEach(b => b.addEventListener('click', () => openMuseum(g, b.dataset.tab, atMuseum)));
    root.querySelectorAll('[data-claim]').forEach(b => b.addEventListener('click', () => {
      const [wing, i] = b.dataset.claim.split(':');
      const got = claimMilestone(g.state, docs(), wing, Number(i));
      if (!got) return toast('Your bag is full.');
      g.save();
      toast(`+${got.pebbles} pebbles${got.piece ? ` and a ${FURNITURE_BY_TYPE[got.piece].name.toLowerCase()} for your home` : ''}. Thank you!`);
      openMuseum(g, tab, atMuseum);
    }));
    root.querySelectorAll('[data-give]').forEach(b => b.addEventListener('click', () => {
      give(g, b.dataset.give);
      openMuseum(g, 'give', atMuseum);
    }));
    root.querySelector('[data-give-all]')?.addEventListener('click', () => {
      const n = donatable(g.state, docs()).filter(d => !d.upgrade).map(d => give(g, d.id, true)).filter(Boolean).length;
      toast(`${CURATOR}: “${n} new things for the museum! Wonderful.”`);
      openMuseum(g, 'give', atMuseum);
    });
    root.querySelectorAll('[data-mount]').forEach(b => b.addEventListener('click', () => openAssembly(g, b.dataset.mount)));
    root.querySelectorAll('[data-kit]').forEach(b => b.addEventListener('click', () => {
      const r = buyKit(g.state, Number(b.dataset.kit));
      if (!r.ok) return toast(r.reason);
      g.save();
      toast(`You got the ${DIG_KITS[Number(b.dataset.kit)].name.toLowerCase()}. Tap a crack in the ground to dig.`);
      openMuseum(g, 'shop', atMuseum);
    }));
    root.querySelector('[data-trade]')?.addEventListener('click', () => {
      const got = tradeSpares(g.state, docs(), Math.random);
      if (!got) return toast('Nothing to trade right now.');
      g.save();
      toast(`${CURATOR} swapped your spares for a ${ITEMS[got].name}.`, got);
      openMuseum(g, 'shop', atMuseum);
    });
  });
}

// Gives one thing. Returns true if it went in.
function give(g, id, quiet = false) {
  const doc = donate(g.state, docs(), id, cloud.me, now());
  if (!doc) return false;
  S.museum = { ...docs(), [id]: doc };
  setDoc(`museum/${id}`, doc).catch(() => {});
  g.save();
  if (!quiet) toast(`${CURATOR}: “${ITEMS[id].name}! I'll put it on display right away.”`, id);
  return true;
}

function giveTab(g) {
  const list = donatable(g.state, docs());
  if (!list.length) return '<p class="detail">Nothing new in your bag for the museum. Fish, bugs, gems, fossils and artifacts all have a place here.</p>';
  const fresh = list.filter(d => !d.upgrade).length;
  return `${fresh > 1 ? '<p><button class="btn" data-give-all>Give everything new</button></p>' : ''}
    <ul class="list">${list.map(d => `<li>${icon(d.id)}<span class="name">${esc(ITEMS[d.id].name)}<small>${d.upgrade ? `A better dig than the one on display (${esc(QUALITY_NAMES[g.state.fossilQuality[d.id]])})` : esc(wings().find(w => w.items.includes(d.id)).name)}</small></span>
      <button class="btn small" data-give="${d.id}">${d.upgrade ? 'Swap in' : 'Give'}</button></li>`).join('')}</ul>`;
}

function wingTab(id) {
  const wing = wings().find(w => w.id === id);
  const p = wingProgress(docs(), wing);
  const cells = wing.items.map(item => {
    const d = docs()[item];
    return `<li class="${d ? 'got' : 'missing'}">${icon(item, d ? '' : 'silhouette')}<span class="name">${d ? esc(ITEMS[item].name) : '???'}</span><span class="note">${d ? `From ${esc(nameOf(d.by))}` : ''}</span></li>`;
  }).join('');
  return `<p class="detail">${wing.icon} ${esc(wing.name)}: ${p.have} of ${p.total} (${pct(p.pct)})</p><ul class="log">${cells}</ul>`;
}

function fossilTab(g, atMuseum) {
  const have = donatedSet(docs());
  const ready = new Set(readyToMount(docs()).map(s => s.id));
  const wing = wings().find(w => w.id === 'fossils');
  const p = wingProgress(docs(), wing);
  const mounted = SPECIMENS.filter(s => s.parts.length > 1 && isMounted(docs(), s.id)).length;
  const big = SPECIMENS.filter(s => s.parts.length > 1).length;
  const groups = ERAS.map(era => {
    const list = SPECIMENS.filter(s => s.era === era.id);
    if (!list.length) return '';
    const rows = list.map(s => {
      const n = s.parts.filter(id => have.has(id)).length;
      if (s.parts.length === 1) {
        const d = docs()[s.parts[0]];
        return `<li class="${d ? 'got' : 'missing'}">${icon(s.parts[0], d ? '' : 'silhouette')}<span class="name">${d ? esc(s.name) : '???'}<small>${d ? `From ${esc(nameOf(d.by))}` : esc(placeHint(s))}</small></span></li>`;
      }
      const keys = s.partKeys, img = skeletonURL(s.plan, keys, k => have.has(s.parts[keys.indexOf(k)]));
      const status = isMounted(docs(), s.id) ? '<small>On display ✓</small>'
        : ready.has(s.id) ? `<small>Every piece is in!${atMuseum ? '' : ' Put it together at the museum.'}</small>`
          : `<small>${n} of ${s.parts.length} pieces · ${esc(placeHint(s))}</small>`;
      const btn = ready.has(s.id) && atMuseum ? `<button class="btn small" data-mount="${s.id}">Put it together</button>` : '';
      return `<li class="${n ? 'got' : 'missing'}"><img class="skeleton" src="${img}" alt="" width="96" height="60"><span class="name">${n ? esc(s.name) : '???'}${status}</span>${btn}</li>`;
    }).join('');
    return `<h3>${esc(era.name)}</h3><ul class="list">${rows}</ul>`;
  }).join('');
  return `<p class="detail">🦴 ${p.have} of ${p.total} fossil pieces · ${mounted} of ${big} skeletons put together. Dig up fossils at the cracks in the ground in the meadow and every jar, or break fossil rocks in the mine.</p>${groups}`;
}

const PLACE_NAMES = { meadow: 'Meadow', desert: 'Desert', beach: 'Beach', snow: 'Snow jar', springs: 'Hot springs', rainforest: 'Rainforest', glade: 'Glade', flower: 'Flower jar', stars: 'Starlight isle', mine: 'Mine' };
const placeHint = s => s.places.map(p => PLACE_NAMES[p]).join(', ');

function shopTab(g, atMuseum) {
  const kit = g.state.digKit || 0;
  const kits = DIG_KITS.slice(1).map(k => `<li><span class="name">${esc(k.name)}<small>${esc(k.text)} ${k.energy} taps per dig.</small></span>
    ${kit >= k.id ? '<small>Yours</small>' : atMuseum ? `<button class="btn small" data-kit="${k.id}">${k.price} pebbles</button>` : `<small>${k.price} pebbles</small>`}</li>`).join('');
  const spares = spareFossils(g.state, docs()).length;
  return `<ul class="list">${kits}</ul>
    <h3>Fossil swap</h3>
    <p class="detail">${CURATOR} swaps ${SPARES_PER_TRADE} spare fossil pieces (ones already on display) for one the museum is missing. You have ${spares}.</p>
    ${atMuseum && spares >= SPARES_PER_TRADE ? '<p><button class="btn" data-trade>Swap 3 spares</button></p>' : ''}
    <p class="detail small">A careful dig earns a bonus: ${QUALITY_BONUS.perfect} pebbles for a perfect one, ${QUALITY_BONUS.good} for a good one.</p>`;
}

// ---------- the excavation game ----------

// ex: from fossils.makeExcavation. onTake(): after the fossil is in your bag.
export function openExcavation(g, ex, onTake) {
  let tool = 'brush';
  const draw = () => {
    const cells = ex.cells.map((c, i) => {
      const bare = c.fossil && c.depth === 0;
      const hint = ex.xray && c.fossil && !bare ? ' hint' : '';
      return `<button class="dig-cell d${c.depth}${bare ? ' bone' : ''}${hint}" data-i="${i}" aria-label="Dirt ${c.depth}"></button>`;
    }).join('');
    const done = ex.done ? `<div class="result">${icon(ex.part)}<strong>${esc(ITEMS[ex.part].name)}</strong>
      <p class="detail">${esc(QUALITY_NAMES[ex.quality])}${ex.cracks ? ` · ${ex.cracks} crack${ex.cracks > 1 ? 's' : ''}` : ''}${QUALITY_BONUS[ex.quality] ? ` · +${QUALITY_BONUS[ex.quality]} pebbles` : ''}</p>
      <button class="btn" data-take>Take it</button></div>` : '';
    openSheet('Dig site', `
      <p class="detail">Brush the dirt away to free what's buried. The hammer clears more at once, but it cracks the fossil if it hits bare bone.</p>
      <div class="dig-tools">
        <button class="tab ${tool === 'brush' ? 'on' : ''}" data-tool="brush">🖌️ Brush</button>
        <button class="tab ${tool === 'hammer' ? 'on' : ''}" data-tool="hammer">🔨 Hammer</button>
        <span class="dig-energy">Energy ${ex.energy} / ${ex.maxEnergy}</span>
      </div>
      <div class="dig-grid" style="grid-template-columns: repeat(${DIG_W}, 1fr)">${cells}</div>
      ${done}`, root => {
      root.querySelectorAll('[data-tool]').forEach(b => b.addEventListener('click', () => { tool = b.dataset.tool; draw(); }));
      if (!ex.done) root.querySelectorAll('.dig-cell').forEach(b => b.addEventListener('click', () => { excavate(ex, tool, Number(b.dataset.i)); draw(); }));
      root.querySelector('[data-take]')?.addEventListener('click', () => {
        if (!claimExcavation(g.state, ex, addItem)) return toast('Your bag is full.');
        g.save();
        closeSheet();
        onTake();
      });
    });
  };
  draw();
}

// ---------- piecing a skeleton together ----------

// One spot on the skeleton glows at a time; pick the piece that goes there.
export function openAssembly(g, specimenId) {
  const s = SPECIMEN_BY_ID[specimenId];
  const placed = [];
  const choices = shuffle(rngFor(specimenId, cloud.me || 'me'), s.parts);
  const draw = () => {
    const k = placed.length;
    const done = k === s.parts.length;
    const img = skeletonURL(s.plan, s.partKeys, key => s.partKeys.indexOf(key) < k, done ? null : s.partKeys[k]);
    const buttons = choices.filter(id => !placed.includes(id))
      .map(id => `<button class="btn small" data-piece="${id}">${esc(PART_NAMES[PART_INFO[id].key])}</button>`).join(' ');
    openSheet('Put it together', `
      <p class="detail">${esc(s.name)} · ${esc(s.eraName)}. ${done ? 'All done!' : 'Which piece goes in the glowing spot?'}</p>
      <div class="result"><img class="skeleton big" src="${img}" alt="" width="256" height="160"></div>
      <p>${done ? `<button class="btn" data-finish>Put it on display</button>` : buttons}</p>`, root => {
      root.querySelectorAll('[data-piece]').forEach(b => b.addEventListener('click', () => {
        if (b.dataset.piece !== s.parts[k]) return toast('That doesn\'t fit there. Try another piece.');
        placed.push(b.dataset.piece);
        draw();
      }));
      root.querySelector('[data-finish]')?.addEventListener('click', () => {
        const doc = mount(g.state, docs(), s.id, placed, cloud.me, now());
        if (!doc) return toast('Someone already put it together!');
        S.museum = { ...docs(), ['mount-' + s.id]: doc };
        setDoc(`museum/mount-${s.id}`, doc).catch(() => {});
        g.save();
        toast(`The ${s.name} is on display! +${ASSEMBLE_REWARD(s.parts.length)} pebbles.`);
        openMuseum(g, 'fossils');
      });
    });
  };
  draw();
}
