// The crafting panel at the workbench.
import { openSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { iconURL } from './sprites.js';
import { pic } from './home-ui.js';
import { furnitureSprite } from './home-art.js';
import { decorSprite } from './sprites-more.js';
import { CRAFTS, CATEGORIES, CRAFT_BY_ID, planCraft, haveFor, craft, alreadyUnlocked, producedItem, HATS } from './crafting.js';

const WHERE = {
  Materials: 'Cloth is used for furniture, toys and outfits.',
  Furniture: 'Goes into your bag. Place it from Build: inside your home for furniture, outside for meadow pieces.',
  Lamps: 'Goes into your bag. Place it from Build.',
  Toys: 'Goes into your bag. Tap an animal and play with it.',
  Outfits: 'Unlocks a new look in the wardrobe.',
  Gifts: 'Goes into your bag. Tap it in the Bag to give it to your partner.',
  Home: 'Furniture for your home. It goes into your bag; place it from Build inside your home.',
  Outdoor: 'For the meadow. It goes into your bag; place it outside from Build. Lights glow at night, and you can sit on benches and swings.',
};

function needLabel(need) {
  if (need === '#flower') return 'any flower';
  if (need === '#gem') return 'any gem';
  return ITEMS[need]?.name || need;
}

// Long categories (home and outdoor) show one group at a time, or search results.
const READY = 'Ready to make';
const picked = {};
let query = '';

export function openCrafting(g, category = 'Furniture') {
  const s = g.state;
  const tabs = CATEGORIES.map(c => `<button class="tab ${c === category ? 'on' : ''}" data-cat="${esc(c)}" aria-pressed="${c === category}">${esc(c)}</button>`).join('');
  const all = CRAFTS.filter(c => c.category === category);
  const allGroups = [...new Set(all.map(c => c.group || ''))];
  const long = all.length > 40;
  const q = query.trim().toLowerCase();
  const group = picked[category] || allGroups[0];
  const list = !long ? all
    : q ? all.filter(c => c.name.toLowerCase().includes(q)).slice(0, 60)
      : group === READY ? all.filter(c => !alreadyUnlocked(s, c) && planCraft(s, c))
        : all.filter(c => (c.group || '') === group);
  const groups = long && (q || group === READY) ? [''] : [...new Set(list.map(c => c.group || ''))];
  const picker = long ? `<div class="picker">
      <label class="sr" for="craft-group">Group</label>
      <select id="craft-group">${[READY, ...allGroups].map(gr => `<option value="${esc(gr)}" ${gr === group ? 'selected' : ''}>${esc(gr)}</option>`).join('')}</select>
      <label class="sr" for="craft-search">Search</label>
      <input id="craft-search" type="search" placeholder="Search ${all.length} recipes" value="${esc(query)}" autocomplete="off">
    </div>${!list.length ? `<p class="detail">${q ? 'Nothing matches that.' : 'Nothing you can make right now. Gather more wood, fiber and cloth.'}</p>` : ''}` : '';
  const row = c => {
    const done = alreadyUnlocked(s, c);
    const ready = !done && !!planCraft(s, c);
    const out = producedItem(c);
    const needs = Object.entries(c.needs).map(([need, n]) => {
      const have = haveFor(s, need);
      return `<span class="need-chip ${have >= n ? 'ok' : ''}">${esc(needLabel(need))} ${Math.min(have, n)}/${n}</span>`;
    }).join('');
    const label = c.makes.hat != null ? `Hat: ${HATS[c.makes.hat]}` : c.name;
    const it = ITEMS[out];
    const src = it?.furniture ? pic('f-' + it.furniture, furnitureSprite(it.furniture), 32, 32)
      : it?.decor ? pic('d-' + it.decor, decorSprite(it.decor, 'spring'), 32, 32) : out && iconURL(out);
    return `<li>${out ? `<img class="icon" src="${src}" alt="">` : ''}<span class="name">${esc(label)}<small class="needs-row">${needs}</small></span>
      <button class="btn small" data-craft="${c.id}" ${ready ? '' : 'disabled'}>${done ? 'Made' : 'Craft'}</button></li>`;
  };
  // Long lists (home and outdoor) are grouped, with the ones you can make right now first.
  const rows = groups.map(gr => {
    const items = list.filter(c => (c.group || '') === gr).sort((x, y) => (planCraft(s, y) ? 1 : 0) - (planCraft(s, x) ? 1 : 0));
    return `${gr && !long ? `<h3>${esc(gr)}</h3>` : ''}<ul class="list">${items.map(row).join('')}</ul>`;
  }).join('');
  openSheet('Crafting', `
    <div class="tabs">${tabs}</div>
    <p class="detail small">${esc(WHERE[category])} Wood comes from shaking the fruit tree; fiber from foraging and harvesting. The beetle shop sells both.</p>
    ${picker}
    ${rows}
    <div class="row-actions"><button class="btn ghost" id="tools">Tool upgrades</button></div>`, body => {
    body.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => { query = ''; openCrafting(g, b.dataset.cat); }));
    body.querySelector('#craft-group')?.addEventListener('change', e => { picked[category] = e.target.value; query = ''; openCrafting(g, category); });
    const search = body.querySelector('#craft-search');
    search?.addEventListener('input', () => {
      query = search.value;
      openCrafting(g, category);
      const again = document.querySelector('#craft-search');
      again?.focus();
      again?.setSelectionRange(again.value.length, again.value.length);
    });
    body.querySelectorAll('[data-craft]').forEach(b => b.addEventListener('click', () => {
      const def = CRAFT_BY_ID[b.dataset.craft];
      const result = craft(s, def);
      if (!result.ok) return toast(result.reason);
      g.save();
      const name = def.makes.hat != null ? HATS[def.makes.hat].toLowerCase() : def.name.toLowerCase();
      const a = /^[aeiou]/.test(name) ? 'an' : 'a';
      toast(def.makes.hat != null || def.makes.outfitStyle != null
        ? `You made ${a} ${name}! Wear it from the wardrobe.`
        : `You made ${a} ${name}!`, result.item || undefined);
      openCrafting(g, category);
    }));
    body.querySelector('#tools').addEventListener('click', () => g.openTools());
  }, null, () => openCrafting(g, category));
}
