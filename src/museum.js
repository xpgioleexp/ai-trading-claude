// The museum: give it one of every fish, bug, mineral and gem, fossil and
// artifact. The collection is shared, so either of you can fill a spot, and
// you both see who gave what. Fossils with several pieces get pieced together
// into a skeleton once every piece is in. Pure rules; the panels are in
// museum-ui.js and the shared docs live in the `museum` collection:
//   museum/<item id>        { item, by, at, quality }
//   museum/mount-<specimen> { specimen, by, at }
import { ITEMS } from './data.js';
import { FURNITURE, FURNITURE_BY_TYPE } from './home.js';
import { addItem, removeItem, countItem } from './rules.js';
import { SPECIMENS, SPECIMEN_BY_ID, PART_INFO, FOSSIL_PART_IDS, specimenComplete, assemblyRight, ASSEMBLE_REWARD, betterQuality, RELIC_IDS } from './fossils.js';
import { furnitureItem } from './visitors.js';

const WING_DEFS = [
  { id: 'fish', name: 'Aquarium', icon: '🐟', fits: i => i.cat === 'fish' },
  { id: 'bugs', name: 'Insect hall', icon: '🦋', fits: i => i.cat === 'bug' },
  { id: 'minerals', name: 'Minerals and gems', icon: '💎', fits: i => i.cat === 'mineral' && i.shape !== 'geode' && i.id !== 'stone' },
  { id: 'fossils', name: 'Fossil hall', icon: '🦴', fits: i => i.cat === 'fossil' },
  { id: 'artifacts', name: 'Artifacts', icon: '🏺', fits: i => i.cat === 'artifact' },
];

// Which items go in each wing. Worked out when first asked, after every
// module has added its items.
let wingCache = null;
export function wings() {
  if (wingCache) return wingCache;
  const items = Object.values(ITEMS);
  wingCache = WING_DEFS.map(w => ({ ...w, items: items.filter(w.fits).map(i => i.id) }));
  return wingCache;
}
export const wingOf = id => wings().find(w => w.items.includes(id)) || null;

// docs: the shared museum docs (S.museum).
export function donatedSet(docs) {
  return new Set(Object.values(docs || {}).filter(d => d.item).map(d => d.item));
}

export function wingProgress(docs, wing) {
  const have = donatedSet(docs);
  const n = wing.items.filter(id => have.has(id)).length;
  return { have: n, total: wing.items.length, pct: wing.items.length ? n / wing.items.length : 0 };
}

export function museumProgress(docs) {
  const all = wings().reduce((t, w) => t + w.items.length, 0);
  const have = donatedSet(docs);
  const n = wings().reduce((t, w) => t + w.items.filter(id => have.has(id)).length, 0);
  return { have: n, total: all };
}

// Things in your bag the museum doesn't have yet (or a better dig of a fossil it has).
export function donatable(state, docs) {
  const have = donatedSet(docs);
  const seen = new Set();
  const out = [];
  for (const slot of state.bag) {
    if (seen.has(slot.id) || !wingOf(slot.id)) continue;
    seen.add(slot.id);
    const doc = docs?.[slot.id];
    const better = doc && PART_INFO[slot.id] && betterQuality(state.fossilQuality?.[slot.id], doc.quality);
    if (!have.has(slot.id) || better) out.push({ id: slot.id, upgrade: !!doc });
  }
  return out;
}

// Gives one to the museum. Returns the doc to save, or null.
export function donate(state, docs, id, me, at) {
  if (!donatable(state, docs).some(d => d.id === id)) return null;
  if (!removeItem(state, id, 1)) return null;
  state.donations = (state.donations || 0) + 1;
  return { item: id, by: me, at, quality: state.fossilQuality?.[id] || null };
}

// ---------- milestones ----------

// When a wing is a quarter, half, three quarters and all the way full, you
// each get a thank-you from the curator, once.
export const MILESTONES = [0.25, 0.5, 0.75, 1];
const MILESTONE_PEBBLES = [200, 500, 1000, 3000];

// [type, name, w, h, form, colour, accent] — the museum's thank-you pieces.
const REWARD_PIECES = {
  fish: [['fish_model', 'Carved fish model', 1, 1, 'vase', '#5FA8C9', '#E8C25A'], ['grand_aquarium', 'Grand aquarium', 2, 1, 'tv', '#3F7F95', '#9FD3E0']],
  bugs: [['bug_case', 'Bug display case', 1, 1, 'shelf', '#7A5A3A', '#E8C25A'], ['butterfly_cabinet', 'Butterfly cabinet', 1, 1, 'tall_cabinet', '#5E4A3A', '#E07A9B']],
  minerals: [['gem_display', 'Gem display', 1, 1, 'jar_lamp', '#B9DDE6', '#9C82C9'], ['crystal_cluster', 'Giant crystal cluster', 1, 1, 'salt_lamp', '#C9A0E8', '#F2F4F6']],
  fossils: [['mini_skeleton', 'Little dino skeleton', 1, 1, 'coat_rack', '#EFE6D2', '#B9A88A'], ['trex_skull_display', 'T. rex skull display', 2, 1, 'chest', '#EFE6D2', '#7A5A3A']],
  artifacts: [['artifact_pedestal', 'Artifact pedestal', 1, 1, 'stool', '#B9B4A8', '#D9A53A'], ['ancient_vase', 'Ancient vase', 1, 1, 'vase', '#C9783A', '#3A3A40']],
};
for (const [wing, pieces] of Object.entries(REWARD_PIECES)) {
  for (const [type, name, w, h, form, color, accent] of pieces) {
    if (FURNITURE_BY_TYPE[type]) continue;
    const def = { type, name, category: 'Special', price: 400, w, h, form, color, accent, special: true, museum: wing };
    FURNITURE.push(def);
    FURNITURE_BY_TYPE[type] = def;
  }
}

export function milestoneReward(wing, i) {
  const piece = i === 1 ? REWARD_PIECES[wing][0][0] : i === 3 ? REWARD_PIECES[wing][1][0] : null;
  return { pebbles: MILESTONE_PEBBLES[i], piece };
}

// Milestones reached that you haven't collected yet.
export function milestonesDue(state, docs) {
  const got = state.museumRewards || {};
  const out = [];
  for (const w of wings()) {
    const { pct } = wingProgress(docs, w);
    MILESTONES.forEach((m, i) => { if (pct >= m && !(got[w.id] || []).includes(i)) out.push({ wing: w.id, i }); });
  }
  return out;
}

export function claimMilestone(state, docs, wing, i) {
  if (!milestonesDue(state, docs).some(m => m.wing === wing && m.i === i)) return null;
  const reward = milestoneReward(wing, i);
  if (reward.piece && !addItem(state, furnitureItem(reward.piece), 1)) return null;
  state.pebbles += reward.pebbles;
  const got = (state.museumRewards ||= {});
  (got[wing] ||= []).push(i);
  return reward;
}

// ---------- skeletons ----------

export const isMounted = (docs, specimenId) => !!docs?.['mount-' + specimenId];

// Skeletons with every piece in, waiting to be put together.
export function readyToMount(docs) {
  const have = donatedSet(docs);
  return SPECIMENS.filter(s => s.parts.length > 1 && specimenComplete(s, have) && !isMounted(docs, s.id));
}

// Puts a skeleton together. placed: piece ids in the order you put them in their spots.
export function mount(state, docs, specimenId, placed, me, at) {
  const s = SPECIMEN_BY_ID[specimenId];
  if (!s || !readyToMount(docs).includes(s) || !assemblyRight(s, placed)) return null;
  state.pebbles += ASSEMBLE_REWARD(s.parts.length);
  return { specimen: s.id, by: me, at };
}

// ---------- spare fossils ----------

// Fossil pieces in your bag that the museum already has.
export function spareFossils(state, docs) {
  const have = donatedSet(docs);
  return state.bag.filter(slot => PART_INFO[slot.id] && have.has(slot.id)).flatMap(slot => Array(slot.n).fill(slot.id));
}

export const SPARES_PER_TRADE = 3;

// The curator swaps three spare pieces for one the museum is missing.
export function tradeSpares(state, docs, rand) {
  const spares = spareFossils(state, docs);
  if (spares.length < SPARES_PER_TRADE) return null;
  const have = donatedSet(docs);
  const missing = FOSSIL_PART_IDS.filter(id => !have.has(id) && !countItem(state, id));
  if (!missing.length) return null;
  const got = missing[Math.floor(rand() * missing.length)];
  for (const id of spares.slice(0, SPARES_PER_TRADE)) removeItem(state, id, 1);
  if (!addItem(state, got, 1)) {
    for (const id of spares.slice(0, SPARES_PER_TRADE)) addItem(state, id, 1);
    return null;
  }
  return got;
}

// Pieces nobody has given yet, so digs lean toward them (see fossils.pickPart).
export function missingFossils(docs) {
  const have = donatedSet(docs);
  return new Set([...FOSSIL_PART_IDS, ...RELIC_IDS].filter(id => !have.has(id)));
}
