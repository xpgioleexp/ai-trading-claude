import { poly } from './art-style.js';
import { paintProp } from './prop-art.js';
import { R, oval, box, roof, windowPane, plank, leaf, finishPixels } from './art-style.js';
// Placeholder art for the museum: the building, dig sites, and the skeletons
// you piece together. Each skeleton is drawn from its body plan, one piece at
// a time, so missing pieces show as a faint outline.
import { sprite } from './sprites.js';

export function museumSprite() {
  return sprite('museum', 48, 44, (ctx) => {
    const c = ctx;
    box(c, 2, 39, 44, 5, '#8E897E');
    R(c, 3, 40, 42, 1, '#C4BFB3');
    box(c, 5, 17, 38, 22, '#D5C5A4');
    R(c, 6, 18, 35, 2, '#F3E9CF');
    R(c, 39, 19, 3, 19, '#B9AD92');
    roof(c, 0, 2, 48, 14, '#A96E75');
    R(c, 1, 16, 46, 3, '#775B46');
    R(c, 2, 16, 44, 1, '#D9B783');
    for (const x of [7, 16, 29, 38]) {
      box(c, x, 20, 3, 18, '#F3E9CF');
      R(c, x, 21, 1, 15, '#FFF7E4');
      R(c, x - 1, 37, 5, 2, '#C4BFB3');
    }
    windowPane(c, 11, 23, 5, 8);
    windowPane(c, 33, 23, 5, 8);
    box(c, 21, 24, 8, 15, '#775B46');
    R(c, 22, 26, 5, 12, '#B88D60');
    R(c, 23, 27, 1, 9, '#D9B783');
    R(c, 26, 32, 1, 1, '#E8C25A');
    oval(c, 24, 11, 5, 3, '#F3E9CF');
    R(c, 21, 10, 7, 2, '#FFF7E4');
    R(c, 23, 10, 1, 2, '#A96E75');
    for (const x of [3, 42]) {
      box(c, x - 1, 34, 5, 5, '#B88D60');
      leaf(c, x + 1, 33, 3, 2);
      R(c, x, 32, 1, 1, '#E4B4A3');
    }
    R(c, 20, 39, 10, 2, '#D5C5A4');
    R(c, 19, 42, 12, 2, '#C4BFB3');
  });
}

// A crack in the ground with a bit of something poking out.
export function digSiteSprite() {
  return sprite('dig_site', 16, 16, (ctx) => paintProp(ctx, 'dig_site', 16, 16, 0));
}

// ---------- skeletons ----------

// Where things go for each body plan, in a 64 × 40 box.
// h: head, b: body centre and half-size, t: tail tip, n: neck base,
// legs: 2 or 4, posture: how tall the legs are.
const PLANS = {
  theropod: { h: [50, 10], b: [32, 20, 9, 6], t: [4, 16], legs: 2, leg: 14 },
  raptor: { h: [48, 14], b: [32, 22, 7, 5], t: [6, 18], legs: 2, leg: 12 },
  sauropod: { h: [58, 4], n: [40, 19], b: [28, 24, 12, 7], t: [2, 28], legs: 4, leg: 9 },
  horned: { h: [52, 22], b: [30, 22, 11, 7], t: [6, 24], legs: 4, leg: 9 },
  plated: { h: [55, 27], b: [30, 22, 11, 7], t: [4, 22], legs: 4, leg: 9 },
  armored: { h: [55, 27], b: [30, 24, 12, 6], t: [6, 26], legs: 4, leg: 8 },
  duckbill: { h: [52, 9], b: [32, 20, 9, 7], t: [5, 18], legs: 2, leg: 14 },
  dome: { h: [50, 12], b: [32, 21, 8, 6], t: [6, 19], legs: 2, leg: 13 },
  flyer: { h: [52, 14], b: [32, 20, 5, 3], t: [24, 22], legs: 0, wings: true },
  bird: { h: [46, 9], b: [32, 20, 7, 6], t: [14, 18], legs: 2, leg: 12 },
  marine: { h: [57, 10], n: [40, 21], b: [28, 23, 10, 6], t: [6, 24], legs: 0, flippers: true },
  fish: { h: [52, 20], b: [32, 20, 14, 6], t: [8, 20], legs: 0 },
  shark: { h: [54, 20], b: [32, 20, 15, 5], t: [6, 20], legs: 0 },
  mammal: { h: [52, 13], b: [30, 19, 12, 7], t: [8, 17], legs: 4, leg: 13 },
  turtle: { h: [55, 22], b: [30, 20, 14, 8], t: [10, 22], legs: 0, flippers: true },
  croc: { h: [55, 25], b: [32, 25, 10, 4], t: [3, 25], legs: 4, leg: 5 },
  snake: { h: [57, 18], b: [32, 20, 18, 3], t: [3, 22], legs: 0 },
  bug: { h: [48, 20], b: [32, 20, 10, 4], t: [12, 20], legs: 6, leg: 6 },
};

const line = (ctx, x0, y0, x1, y1, w = 2) => {
  const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
  for (let i = 0; i <= n; i++)
    ctx.fillRect(Math.round(x0 + ((x1 - x0) * i) / n), Math.round(y0 + ((y1 - y0) * i) / n), w, w);
};

function drawPiece(ctx, plan, key) {
  const P = PLANS[plan],
    [hx, hy] = P.h,
    [bx, by, bw, bh] = P.b,
    [tx, ty] = P.t,
    front = bx + bw,
    back = bx - bw,
    col = ctx.fillStyle,
    r = (x, y, w, h) => R(ctx, x, y, w, h, col),
    e = (x, y, rx, ry) => oval(ctx, x, y, rx, ry, col),
    p = (pts) => poly(ctx, pts, col),
    ln = (x, y, xx, yy, w = 1) => line(ctx, x, y, xx, yy, w),
    bone = (x, y, xx, yy, w = 2) => {
      ln(x, y, xx, yy, w);
      e(x, y, 1, 1);
      e(xx, yy, 1, 1);
    };
  switch (key) {
    case 'skull': {
      if (['fish', 'shark', 'croc', 'marine'].includes(plan)) {
        p([
          [hx - 5, hy - 3],
          [hx + 2, hy - 2],
          [hx + 7, hy + 1],
          [hx + 5, hy + 3],
          [hx - 4, hy + 3],
        ]);
        r(hx - 5, hy - 2, 3, 4);
      } else if (['flyer', 'bird'].includes(plan)) {
        e(hx - 1, hy, 3, 3);
        p([
          [hx + 1, hy - 1],
          [hx + 8, hy + 1],
          [hx + 1, hy + 2],
        ]);
      } else {
        p([
          [hx - 5, hy - 2],
          [hx - 3, hy - 4],
          [hx + 2, hy - 3],
          [hx + 5, hy],
          [hx + 5, hy + 3],
          [hx - 3, hy + 4],
          [hx - 5, hy + 1],
        ]);
        if (plan === 'dome') e(hx - 1, hy - 4, 3, 2);
      }
      ctx.clearRect(hx - 1, hy - 2, 2, 2);
      ctx.clearRect(hx + 2, hy, 1, 1);
      for (let x = hx - 3; x < hx + 5; x += 2) r(x, hy + 3, 1, 2);
      return;
    }
    case 'jaw': {
      ln(hx - 5, hy + 5, hx + 5, hy + 5, 2);
      ln(hx - 5, hy + 4, hx - 4, hy + 1);
      for (let x = hx - 3; x < hx + 6; x += 2) r(x, hy + 3, 1, 2);
      return;
    }
    case 'horn': {
      bone(hx - 1, hy - 3, hx, hy - 9, 1);
      bone(hx + 2, hy - 3, hx + 7, hy - 8, 1);
      return;
    }
    case 'frill': {
      for (let n = 0; n < 7; n++) {
        const t = (n - 3) * 0.4;
        bone(hx - 4, hy - 1, hx - 5 - Math.cos(t) * 6, hy - Math.sin(t) * 7, 1);
      }
      return;
    }
    case 'tusks': {
      for (const off of [0, 3]) {
        for (let n = 0; n < 9; n++) {
          const t = n / 8;
          r(hx + 3 + n - off, hy + 3 + Math.sin(t * Math.PI) * 4, 2 - n / 9, 2);
        }
      }
      return;
    }
    case 'antlers': {
      for (const s of [-1, 1]) {
        bone(hx + s * 2, hy - 2, hx + s * 6, hy - 10);
        for (const t of [4, 7]) ln(hx + s * (t - 1), hy - t, hx + s * (t + 1), hy - t - 3);
      }
      return;
    }
    case 'neck': {
      const nx = P.n?.[0] || front,
        ny = P.n?.[1] || by - bh / 2;
      for (let n = 0; n < 9; n++) {
        const t = n / 8,
          x = nx + (hx - 3 - nx) * t,
          y = ny + (hy + 1 - ny) * t;
        r(x - 1, y, 3, 2);
        r(x, y - 1, 1, 1);
      }
      return;
    }
    case 'torso':
    case 'body':
    case 'spine': {
      if (plan === 'snake') {
        for (let x = tx; x < hx - 3; x += 2) {
          const y = by + Math.sin(x / 5) * 4;
          r(x, y, 2, 2);
          r(x, y - 1, 1, 1);
        }
        return;
      }
      for (let x = back; x <= front; x += 2) {
        const y = by - bh + 1 + Math.round(Math.sin(((x - back) / (bw * 2)) * Math.PI) * -1);
        r(x, y, 2, 2);
        r(x, y - 2, 1, 2);
      }
      for (let x = back + 3; x < front; x += 3) {
        const ratio = (x - bx) / bw,
          height = bh * (1 - ratio * ratio) + 2,
          top = by - bh + 3;
        ln(x, top, x - 2, top + height);
        ln(x - 2, top + height, x, top + height + 2);
        ln(x, top + height + 2, x + 2, top + height);
      }
      ln(back + 4, by + bh - 1, front - 3, by + bh - 1);
      if (key === 'body' && !P.n) bone(front, by - bh + 2, hx - 4, hy, 1);
      return;
    }
    case 'tail': {
      for (let n = 0; n < 14; n++) {
        const t = n / 13,
          x = back + (tx - back) * t,
          y = by - bh / 2 + (ty - by + bh / 2) * t + Math.sin(t * Math.PI) * -2,
          size = t > 0.7 ? 1 : 2;
        r(x, y, size, size);
        if (n % 2 === 0 && t < 0.7) r(x, y - 1, 1, 1);
      }
      return;
    }
    case 'club': {
      e(tx, ty, 4, 3);
      e(tx - 2, ty - 2, 1, 1);
      e(tx + 2, ty + 2, 1, 1);
      return;
    }
    case 'legs': {
      const n = P.legs || 2,
        xs =
          n === 2
            ? [bx - 2, bx + 3]
            : n === 6
              ? [bx - 6, bx - 1, bx + 4]
              : [back + 3, back + 6, front - 5, front - 2];
      for (const [x, index] of xs.map((x, i) => [x, i])) {
        if (n === 6) {
          bone(x, by + 2, x - 4, by + bh + P.leg, 1);
          bone(x, by - 2, x - 4, by - bh - 2, 1);
          continue;
        }
        const yy = by + bh - 2,
          kneeX = x - 3 + (index % 2),
          kneeY = yy + P.leg * 0.5;
        bone(x, yy, kneeX, kneeY);
        bone(kneeX, kneeY, x + 1, yy + P.leg - 1);
        ln(x, yy + P.leg, x + 4, yy + P.leg);
        r(x + 3, yy + P.leg, 1, 1);
      }
      return;
    }
    case 'arms': {
      bone(front - 1, by - 2, front + 3, by + 2, 1);
      bone(front + 3, by + 2, front + 4, by + 6, 1);
      r(front + 3, by + 6, 3, 1);
      return;
    }
    case 'claws': {
      for (let n = 0; n < 3; n++) {
        bone(front + 1 + n * 2, by + 4, front + 2 + n * 2, by + 7, 1);
        ln(front + 2 + n * 2, by + 7, front + n * 2, by + 9);
      }
      return;
    }
    case 'wings': {
      for (const s of [-1, 1]) {
        bone(bx, by - 1, bx + s * 10, by - 7, 2);
        bone(bx + s * 10, by - 7, bx + s * 23, by - 13, 1);
        for (let n = 1; n < 5; n++) bone(bx + s * 10, by - 7, bx + s * (8 + n * 3), by + 2 - n, 1);
      }
      return;
    }
    case 'sail': {
      for (let x = back + 1; x < front; x += 2) {
        const rise = Math.sin(((x - back) / (bw * 2)) * Math.PI) * 12;
        bone(x, by - bh + 1, x, by - bh - rise, 1);
      }
      return;
    }
    case 'plates': {
      for (let x = back; x <= front; x += 5) {
        const hh = 4 + Math.sin(((x - back) / (bw * 2)) * Math.PI) * 5;
        p([
          [x, by - bh + 1],
          [x + 2, by - bh - hh],
          [x + 5, by - bh - 2],
          [x + 4, by - bh + 1],
        ]);
      }
      return;
    }
    case 'armor': {
      for (let x = back; x <= front; x += 3)
        for (let y = by - bh; y < by; y += 3)
          if (Math.abs(x - bx) / bw + Math.abs(y - by) / (bh + 2) < 1.2) {
            p([
              [x, y - 1],
              [x + 2, y],
              [x + 1, y + 2],
              [x - 1, y + 1],
            ]);
          }
      return;
    }
    case 'shell': {
      for (let x = -bw; x <= bw; x++) {
        const yy = by - Math.sqrt(Math.max(0, 1 - (x * x) / (bw * bw))) * bh;
        r(bx + x, yy, 1, 2);
      }
      for (let x = back + 4; x < front - 2; x += 4) {
        ln(x, by - bh + 2, x - 1, by - 1);
        r(x, by - bh + 1, 2, 1);
      }
      ln(back + 1, by, front - 1, by);
      return;
    }
    case 'flippers': {
      for (const x of [front - 3, back + 3]) {
        bone(x, by + bh - 2, x + 3, by + bh + 2, 2);
        for (let n = 0; n < 3; n++) bone(x + 3, by + bh + 2, x + 5 + n, by + bh + 5, 1);
      }
      return;
    }
    case 'fin': {
      bone(bx - 3, by - bh, bx, by - bh - 8, 1);
      bone(bx, by - bh - 8, bx + 5, by - bh, 1);
      for (let n = 0; n < 5; n++) ln(bx - 2 + n, by - bh, bx, by - bh - 7);
      ln(tx, ty, tx - 4, ty - 6);
      ln(tx, ty, tx - 4, ty + 6);
      return;
    }
  }
}

// keys: the pieces in the specimen. have(key): drawn solid; others faint.
// highlight: a piece to glow (the assembly puzzle).
export function skeletonCanvas(plan, keys, have, highlight = null) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 40;
  const ctx = c.getContext('2d');
  if (!PLANS[plan]) return c;
  // the stand
  plank(ctx, 5, 37, 54, 3, '#B88D60');
  R(ctx, 8, 37, 47, 1, '#D9B783');
  R(ctx, 30, 28, 1, 9, '#775B46');
  R(ctx, 31, 30, 1, 7, '#B88D60');
  // A specimen may combine several anatomical sections into a single collectible.
  // Attach the omitted sections to that piece so a completed animal is connected.
  const core =
    keys.find((k) => ['torso', 'body', 'spine', 'shell', 'armor', 'plates', 'wings'].includes(k)) ||
    keys[0];
  const attached = new Map(keys.map((k) => [k, []]));
  const needed = ['skull', 'torso', 'tail'];
  if (PLANS[plan].n) needed.push('neck');
  if (PLANS[plan].legs) needed.push('legs');
  if (PLANS[plan].wings) needed.push('wings');
  if (PLANS[plan].flippers) needed.push('flippers');
  for (const part of needed) {
    if (
      keys.includes(part) ||
      (part === 'torso' && keys.some((k) => ['body', 'spine'].includes(k)))
    )
      continue;
    const owner = part === 'skull' && keys.includes('jaw') ? 'jaw' : core;
    attached.get(owner)?.push(part);
  }
  for (const key of keys) {
    ctx.fillStyle =
      key === highlight ? '#E8B83A' : have(key) ? '#EFE6D2' : 'rgba(239,230,210,0.22)';
    const col = ctx.fillStyle,
      layer = document.createElement('canvas');
    layer.width = 64;
    layer.height = 40;
    const lc = layer.getContext('2d');
    lc.fillStyle = col;
    for (const part of attached.get(key) || []) drawPiece(lc, plan, part);
    drawPiece(lc, plan, key);
    if (have(key) || key === highlight) {
      const mask = lc.getImageData(0, 0, 64, 40);
      for (let i = 0; i < mask.data.length; i += 4)
        if (mask.data[i + 3]) {
          mask.data[i] = 157;
          mask.data[i + 1] = 135;
          mask.data[i + 2] = 104;
        }
      const shadow = document.createElement('canvas');
      shadow.width = 64;
      shadow.height = 40;
      shadow.getContext('2d').putImageData(mask, 0, 0);
      ctx.drawImage(shadow, 1, 1);
    }
    ctx.drawImage(layer, 0, 0);
  }
  finishPixels(c, 'skeleton');
  return c;
}

const urlCache = new Map();
export function skeletonURL(plan, keys, have, highlight = null) {
  const key = [plan, keys.map((k) => k + (have(k) ? 1 : 0)).join(','), highlight].join('|');
  if (!urlCache.has(key))
    urlCache.set(key, skeletonCanvas(plan, keys, have, highlight).toDataURL());
  return urlCache.get(key);
}
