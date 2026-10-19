// The jar shelf: the door in the meadow leads to your other terrariums.
// Jars are unlocked once, for both of you.
import { cloud, setDoc, now } from './cloud.js';
import { S } from './shared.js';
import { openSheet, closeSheet, toast, esc } from './ui.js';
import { MAPS, MAP_ORDER } from './maps.js';
import { nameOf } from './together.js';

export function jarUnlocked(id) {
  return !!S.jars[id]?.unlocked;
}

export function openTravel(g) {
  const here = g.scene === 'map' ? g.mapId : 'forest';
  const rows = [
    `<li><span class="name">Forest jar<small>Home: your meadow, garden, house and pond.</small></span>
      ${here === 'forest' ? '<span class="detail small">You are here</span>' : '<button class="btn small" data-go="forest">Go</button>'}</li>`,
    ...MAP_ORDER.map(id => {
      const m = MAPS[id];
      const open = jarUnlocked(id);
      const by = S.jars[id]?.by;
      return `<li><span class="name">${esc(m.name)}<small>${esc(m.blurb)}${open && by ? ` Opened by ${esc(nameOf(by))}.` : ''}</small></span>
        ${here === id ? '<span class="detail small">You are here</span>'
          : open ? `<button class="btn small" data-go="${id}">Go</button>`
            : `<button class="btn small" data-unlock="${id}" ${g.state.pebbles < m.price ? 'disabled' : ''}>Open · ${m.price}</button>`}</li>`;
    }),
  ].join('');
  openSheet('The jar shelf', `
    <p class="detail">Each jar is its own little world with its own season, fish, bugs and things to find. Opening one opens it for both of you.</p>
    <ul class="list">${rows}</ul>`, body => {
    body.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
      closeSheet();
      if (b.dataset.go === 'forest') g.leaveMap();
      else g.enterMap(b.dataset.go);
    }));
    body.querySelectorAll('[data-unlock]').forEach(b => b.addEventListener('click', async () => {
      const m = MAPS[b.dataset.unlock];
      if (g.state.pebbles < m.price) return toast('Not enough pebbles.');
      g.state.pebbles -= m.price;
      g.save();
      S.jars[m.id] = { unlocked: true, by: cloud.me, at: now() };
      await setDoc(`jars/${m.id}`, { unlocked: true, by: cloud.me, at: now() }).catch(() => {});
      toast(`The ${m.name.toLowerCase()} is open!`);
      openTravel(g);
    }));
  }, null, () => openTravel(g));
}
