// Panels for the traveling merchant, today's visitor and the shop's furniture stock.
import { cloud, setDoc, now } from './cloud.js';
import { S } from './shared.js';
import { openSheet, toast, esc } from './ui.js';
import { ITEMS } from './data.js';
import { countItem } from './rules.js';
import { iconURL } from './sprites.js';
import { furnitureSprite } from './home-art.js';
import { FURNITURE_BY_TYPE } from './home.js';
import { pic } from './home-ui.js';
import { nameOf } from './together.js';
import {
  merchantStock, buyFromMerchant, sellToMerchant, furnitureStock, buyFurniture, furnitureItem,
  requestFor, heartsFor, canDeliver, deliver, giftDue, takeGift, GIFT_AT,
} from './visitors.js';

function icon(id) {
  const f = ITEMS[id]?.furniture;
  const src = f ? pic('f-' + f, furnitureSprite(f), 32, 32) : iconURL(id);
  return `<img class="icon" src="${src}" alt="" width="32" height="32">`;
}

const placeHint = 'It goes in your bag. Place it from Build inside your home.';

// ---------- merchant ----------

export function openMerchant(g) {
  const s = g.state;
  const { items, wants } = merchantStock(s.seed, g.today);
  const bought = s.daily.merchant || [];
  const have = countItem(s, wants);
  const rows = items.map((e, i) => `<li>${icon(e.id)}<span class="name">${esc(ITEMS[e.id].name)}<small>${esc(ITEMS[e.id].furniture ? placeHint : e.note)}</small></span>
    ${bought.includes(e.id) ? '<span class="detail small">Bought</span>'
      : `<button class="btn small" data-buy="${i}" ${s.pebbles < e.price ? 'disabled' : ''}>Buy · ${e.price}</button>`}</li>`).join('');
  openSheet('Traveling merchant', `
    <p class="detail">“Ah, travelers! I'm only here today. One of each, and you won't find these anywhere else this week.”</p>
    <ul class="list">${rows}</ul>
    <h3>Buying today</h3>
    <ul class="list"><li>${icon(wants)}<span class="name">${esc(ITEMS[wants].name)}<small>I pay double: ${ITEMS[wants].price * 2} each. You have ${have}.</small></span>
      <button class="btn small" data-sell ${have ? '' : 'disabled'}>Sell all</button></li></ul>
    <p class="detail">You have <strong>${s.pebbles}</strong> pebbles.</p>`, body => {
    body.querySelectorAll('[data-buy]').forEach(b => b.addEventListener('click', () => {
      const e = items[+b.dataset.buy];
      const r = buyFromMerchant(s, e);
      if (!r.ok) return toast(r.reason);
      g.save();
      toast(`Bought ${ITEMS[e.id].name}.`, e.id);
      openMerchant(g);
    }));
    body.querySelector('[data-sell]')?.addEventListener('click', () => {
      const paid = sellToMerchant(s, wants);
      if (!paid) return;
      g.save();
      toast(`“Splendid!” +${paid} pebbles.`);
      openMerchant(g);
    });
  });
}

// ---------- visitors ----------

export function openVisitor(g, visitor) {
  const s = g.state;
  const req = requestFor(s.seed, g.today, visitor);
  const done = S.deliveries[String(g.today)];
  const hearts = heartsFor(S.deliveries, visitor.id);
  const line = visitor.lines[(g.visitorTalks = ((g.visitorTalks || 0) + 1)) % visitor.lines.length];
  const item = ITEMS[req.item];
  const have = countItem(s, req.item);
  let ask;
  if (done) {
    ask = `<p class="detail">“${done.by === cloud.me ? 'Thank you again for the' : `${esc(nameOf(done.by))} already brought me the`} ${esc(item.name.toLowerCase())}. You two are the best.”</p>`;
  } else {
    ask = `<ul class="list"><li>${icon(req.item)}<span class="name">${req.n} × ${esc(item.name)}<small>You have ${have}. Pays ${req.reward} pebbles.</small></span>
      <button class="btn small" data-give ${canDeliver(s, req) ? '' : 'disabled'}>Give</button></li></ul>
      <p class="detail small">Either of you can bring it. It's only for today.</p>`;
  }
  const gift = giftDue(s, S.deliveries, visitor);
  const giftName = FURNITURE_BY_TYPE[visitor.gift].name;
  openSheet(`${visitor.name} the ${visitor.species}`, `
    <p class="detail">“${esc(line)}”</p>
    <p class="detail">Friendship: ${'♥'.repeat(Math.min(hearts, 5))}${'♡'.repeat(Math.max(0, 5 - hearts))}${hearts < GIFT_AT ? ` · ${GIFT_AT - hearts} more ${GIFT_AT - hearts === 1 ? 'delivery' : 'deliveries'} for a thank-you gift` : ''}</p>
    <h3>${done ? 'Today\'s request' : 'Could you bring me…'}</h3>
    ${ask}
    ${gift ? `<h3>A thank-you</h3><ul class="list"><li>${icon(furnitureItem(visitor.gift))}<span class="name">${esc(giftName)}<small>${placeHint}</small></span><button class="btn small" data-gift>Take it</button></li></ul>` : ''}`, body => {
    body.querySelector('[data-give]')?.addEventListener('click', async () => {
      if (S.deliveries[String(g.today)]) return openVisitor(g, visitor);
      if (!deliver(s, req)) return toast('You don\'t have enough yet.');
      g.save();
      const doc = { visitor: visitor.id, item: req.item, n: req.n, by: cloud.me, at: now() };
      S.deliveries[String(g.today)] = doc;
      await setDoc(`deliveries/${g.today}`, doc).catch(() => {});
      toast(`“Oh, thank you!” +${req.reward} pebbles.`);
      openVisitor(g, visitor);
    });
    body.querySelector('[data-gift]')?.addEventListener('click', () => {
      const id = takeGift(s, visitor);
      if (!id) return toast('Your bag is full.');
      g.save();
      toast(`${visitor.name} gave you a ${giftName.toLowerCase()}!`, id);
      openVisitor(g, visitor);
    });
  }, null, () => openVisitor(g, visitor));
}

// ---------- the beetle shop's furniture ----------

export function furnitureStockHtml(g) {
  const s = g.state;
  const bought = s.daily.stock || [];
  const rows = furnitureStock(s.seed, g.today).map((e, i) => {
    const f = FURNITURE_BY_TYPE[e.type];
    return `<li>${icon(furnitureItem(e.type))}<span class="name">${esc(f.name)}<small>${e.special ? 'Special piece' : `20% off (usually ${f.price})`}</small></span>
      ${bought.includes(e.type) ? '<span class="detail small">Bought</span>'
        : `<button class="btn small" data-stock="${i}" ${s.pebbles < e.price ? 'disabled' : ''}>Buy · ${e.price}</button>`}</li>`;
  }).join('');
  return `<h3>Today's furniture</h3><p class="detail small">New pieces every morning. ${placeHint}</p><ul class="list">${rows}</ul>`;
}

export function bindFurnitureStock(g, body, reopen) {
  const stock = furnitureStock(g.state.seed, g.today);
  body.querySelectorAll('[data-stock]').forEach(b => b.addEventListener('click', () => {
    const e = stock[+b.dataset.stock];
    const r = buyFurniture(g.state, e);
    if (!r.ok) return toast(r.reason);
    g.save();
    toast(`Bought a ${FURNITURE_BY_TYPE[e.type].name.toLowerCase()}. It's in your bag.`);
    reopen();
  }));
}
