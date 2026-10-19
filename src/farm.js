// Farm rules: what buildings and fruit trees give each day, and garden upgrades.
// Pure logic on the saved state.
import { ITEMS } from './data.js';
import { addItem, removeItem, countItem, bagFull } from './rules.js';
import { FARM_BY_TYPE, BED_LEVELS, BED_UPGRADES, SPRINKLER } from './farm-data.js';

// How things stand with one building today: 'growing', 'resting', 'ready' or 'collected'.
export function buildingState(state, building, today) {
  const def = FARM_BY_TYPE[building.type];
  const age = today - building.placedDay;
  if (def.grows && age < def.grows) return { state: 'growing', daysLeft: def.grows - age };
  if (state.daily.produce?.[building.id]) return { state: 'collected' };
  if (def.every > 1 && age % def.every !== 0) return { state: 'resting' };
  return { state: 'ready' };
}

export function collect(state, building, today) {
  const def = FARM_BY_TYPE[building.type];
  const now = buildingState(state, building, today);
  if (now.state !== 'ready') return { ok: false, ...now };
  if (bagFull(state, def.makes)) return { ok: false, state: 'full' };
  const n = addItem(state, def.makes, def.n);
  state.daily.produce = { ...(state.daily.produce || {}), [building.id]: true };
  return { ok: true, id: def.makes, n };
}

function canPay(state, cost) {
  return state.pebbles >= cost.pebbles && Object.entries(cost.items || {}).every(([id, n]) => countItem(state, id) >= n);
}

function pay(state, cost) {
  if (!canPay(state, cost)) return false;
  state.pebbles -= cost.pebbles;
  for (const [id, n] of Object.entries(cost.items || {})) removeItem(state, id, n);
  return true;
}

export function costText(cost) {
  return [`${cost.pebbles} pebbles`, ...Object.entries(cost.items || {}).map(([id, n]) => `${n} ${ITEMS[id]?.name || id}`)].join(', ');
}

export function nextBedUpgrade(state) {
  const level = BED_LEVELS.indexOf(state.farm.beds);
  if (level < 0 || level >= BED_LEVELS.length - 1) return null;
  return { beds: BED_LEVELS[level + 1], cost: BED_UPGRADES[level + 1], ok: canPay(state, BED_UPGRADES[level + 1]) };
}

export function upgradeBeds(state) {
  const up = nextBedUpgrade(state);
  if (!up || !pay(state, up.cost)) return false;
  state.farm.beds = up.beds;
  return true;
}

export function sprinklerCost(state) {
  return state.farm.sprinkler ? null : { cost: SPRINKLER, ok: canPay(state, SPRINKLER) };
}

export function buySprinkler(state) {
  if (state.farm.sprinkler || !pay(state, SPRINKLER)) return false;
  state.farm.sprinkler = true;
  return true;
}
