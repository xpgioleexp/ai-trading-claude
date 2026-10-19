// The crafting panel at the workbench.
import { openSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { iconURL } from './sprites.js';
import { CRAFTS, CATEGORIES, CRAFT_BY_ID, planCraft, haveFor, craft, alreadyUnlocked, producedItem, HATS } from './crafting.js';

const WHERE = {
  Materials: 'Cloth is used for furniture, toys and outfits.',
  Furniture: 'Goes into your bag. Place it from Build: inside your home for furniture, outside for meadow pieces.',
  Lamps: 'Goes into your bag. Place it from Build.',
  Toys: 'Goes into your bag. Tap an animal and play with it.',
  Outfits: 'Unlocks a new look in the wardrobe.',
  Gifts: 'Goes into your bag. Tap it in the Bag to give it to your partner.',
};

function needLabel(need) {
  if (need === '#flower') return 'any flower';
  if (need === '#gem') return 'any gem';
  return ITEMS[need]?.name || need;
}

export function openCrafting(g, category = 'Furniture') {
  const s = g.state;
  const tabs = CATEGORIES.map(c => `<button class="tab ${c === category ? 'on' : ''}" data-cat="${esc(c)}" aria-pressed="${c === category}">${esc(c)}</button>`).join('');
  const rows = CRAFTS.filter(c => c.category === category).map(c => {
    const done = alreadyUnlocked(s, c);
    const ready = !done && !!planCraft(s, c);
    const out = producedItem(c);
    const needs = Object.entries(c.needs).map(([need, n]) => {
      const have = haveFor(s, need);
      return `<span class="need-chip ${have >= n ? 'ok' : ''}">${esc(needLabel(need))} ${Math.min(have, n)}/${n}</span>`;
    }).join('');
    const label = c.makes.hat != null ? `Hat: ${HATS[c.makes.hat]}` : c.name;
    return `<li>${out ? `<img class="icon" src="${iconURL(out)}" alt="">` : ''}<span class="name">${esc(label)}<small class="needs-row">${needs}</small></span>
      <button class="btn small" data-craft="${c.id}" ${ready ? '' : 'disabled'}>${done ? 'Made' : 'Craft'}</button></li>`;
  }).join('');
  openSheet('Crafting', `
    <div class="tabs">${tabs}</div>
    <p class="detail small">${esc(WHERE[category])} Wood comes from shaking the fruit tree; fiber from foraging and harvesting. The beetle shop sells both.</p>
    <ul class="list">${rows}</ul>
    <div class="row-actions"><button class="btn ghost" id="tools">Tool upgrades</button></div>`, body => {
    body.querySelectorAll('[data-cat]').forEach(b => b.addEventListener('click', () => openCrafting(g, b.dataset.cat)));
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
