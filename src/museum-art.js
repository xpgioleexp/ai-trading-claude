import { R, oval, box, roof, windowPane, plank, leaf, finishPixels } from './art-style.js';
// Placeholder art for the museum: the building, dig sites, and the skeletons
// you piece together. Each skeleton is drawn from its body plan, one piece at
// a time, so missing pieces show as a faint outline.
import { px, disc, sprite } from './sprites.js';

export function museumSprite() {
  return sprite('museum', 48, 44, ctx => {
    const c=ctx;
    box(c,2,39,44,5,'#8E897E');R(c,3,40,42,1,'#C4BFB3');
    box(c,5,17,38,22,'#D5C5A4');R(c,6,18,35,2,'#F3E9CF');R(c,39,19,3,19,'#B9AD92');
    roof(c,0,2,48,14,'#A96E75');R(c,1,16,46,3,'#775B46');R(c,2,16,44,1,'#D9B783');
    for(const x of[7,16,29,38]){box(c,x,20,3,18,'#F3E9CF');R(c,x,21,1,15,'#FFF7E4');R(c,x-1,37,5,2,'#C4BFB3');}
    windowPane(c,11,23,5,8);windowPane(c,33,23,5,8);
    box(c,21,24,8,15,'#775B46');R(c,22,26,5,12,'#B88D60');R(c,23,27,1,9,'#D9B783');R(c,26,32,1,1,'#E8C25A');
    oval(c,24,11,5,3,'#F3E9CF');R(c,21,10,7,2,'#FFF7E4');R(c,23,10,1,2,'#A96E75');
    for(const x of[3,42]){box(c,x-1,34,5,5,'#B88D60');leaf(c,x+1,33,3,2);R(c,x,32,1,1,'#E4B4A3');}
    R(c,20,39,10,2,'#D5C5A4');R(c,19,42,12,2,'#C4BFB3');
  });
}

// A crack in the ground with a bit of something poking out.
export function digSiteSprite() {
  return sprite('dig_site', 16, 16, ctx => {
    px(ctx, 2, 9, 12, 4, 'rgba(90,64,40,0.55)');
    for (const [x, y] of [[3, 8], [5, 10], [7, 9], [9, 11], [11, 9], [13, 10]]) px(ctx, x, y, 2, 1, '#4A3220');
    px(ctx, 6, 6, 5, 2, '#EFE6D2'); disc(ctx, 6, 6, 1.4, '#EFE6D2'); disc(ctx, 11, 7, 1.4, '#EFE6D2');
  });
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
  for (let i = 0; i <= n; i++) ctx.fillRect(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), w, w);
};

function drawPiece(ctx, plan, key) {
  const P = PLANS[plan];
  const [hx, hy] = P.h, [bx, by, bw, bh] = P.b, [tx, ty] = P.t;
  const front = bx + bw, back = bx - bw;
  switch (key) {
    case 'skull':
      ctx.fillRect(hx - 4, hy - 3, 9, 6); ctx.fillRect(hx + 4, hy - 1, 3, 3);
      ctx.clearRect(hx, hy - 2, 2, 2);
      return;
    case 'jaw': for (let i = 0; i < 4; i++) ctx.fillRect(hx - 3 + i * 2, hy + 3 + (i % 2), 2, 2); ctx.fillRect(hx - 4, hy + 4, 10, 1); return;
    case 'horn': line(ctx, hx + 2, hy - 3, hx + 6, hy - 9, 1); line(ctx, hx - 1, hy - 3, hx + 1, hy - 8, 1); return;
    case 'frill': for (let a = 0; a < 7; a++) line(ctx, hx - 4, hy, hx - 4 - Math.round(Math.cos(a / 2 - 1.5) * 8), hy - Math.round(Math.sin(a / 2) * 8), 1); return;
    case 'tusks': for (const d of [0, 3]) for (let i = 0; i < 8; i++) ctx.fillRect(hx + 4 + i - d, hy + 3 + Math.round(Math.sin(i / 3) * 4), 2, 2); return;
    case 'antlers': for (const d of [-3, 3]) { line(ctx, hx + d, hy - 3, hx + d * 2, hy - 10, 1); line(ctx, hx + d * 2, hy - 7, hx + d * 3, hy - 9, 1); } return;
    case 'neck': line(ctx, P.n ? P.n[0] : front, P.n ? P.n[1] : by - bh / 2, hx - 3, hy + 1); return;
    case 'torso': case 'body': case 'spine': {
      line(ctx, back, by - bh + 2, front, by - bh + 2);
      if (plan === 'snake') {
        for (let x = tx; x < hx - 3; x += 2) ctx.fillRect(x, by + Math.round(Math.sin(x / 5) * 4), 2, 2);
        return;
      }
      for (let x = back + 2; x < front; x += 3) line(ctx, x, by - bh + 3, x - 1, by + bh - 2, 1);
      if (key === 'body' && !P.n) line(ctx, front, by - bh + 2, hx - 4, hy, 1);
      return;
    }
    case 'tail': for (let i = 0; i <= 10; i++) ctx.fillRect(Math.round(back + (tx - back) * i / 10), Math.round(by - bh / 2 + (ty - by + bh / 2) * i / 10), i > 7 ? 1 : 2, i > 7 ? 1 : 2); return;
    case 'club': disc(ctx, tx, ty, 3, ctx.fillStyle); return;
    case 'legs': {
      const n = P.legs || 2;
      const xs = n === 2 ? [bx - 2, bx + 3] : n === 6 ? [bx - 6, bx - 1, bx + 4] : [back + 3, back + 6, front - 5, front - 2];
      for (const x of xs) {
        if (n === 6) { line(ctx, x, by + 2, x - 3, by + bh + P.leg, 1); line(ctx, x, by - 2, x - 3, by - bh - 2, 1); continue; }
        line(ctx, x, by + bh - 2, x - 2, by + bh - 2 + P.leg / 2, 2);
        line(ctx, x - 2, by + bh - 2 + P.leg / 2, x, by + bh - 2 + P.leg, 2);
      }
      return;
    }
    case 'arms': line(ctx, front - 1, by, front + 4, by + 5, 1); line(ctx, front + 4, by + 5, front + 6, by + 4, 1); return;
    case 'claws': for (let i = 0; i < 3; i++) line(ctx, front + 2 + i * 2, by + 4, front + 4 + i * 2, by + 8, 1); return;
    case 'wings':
      for (const s of [-1, 1]) {
        line(ctx, bx, by - 1, bx + s * 22, by - 12, 1);
        line(ctx, bx + s * 22, by - 12, bx + s * 10, by + 2, 1);
        for (let i = 1; i < 4; i++) line(ctx, bx, by, bx + s * 6 * i, by - 3 * i, 1);
      }
      return;
    case 'sail': for (let x = back + 2; x < front - 1; x += 2) line(ctx, x, by - bh + 1, x, by - bh - Math.round(Math.sin((x - back) / (bw * 2) * Math.PI) * 11), 1); return;
    case 'plates': for (let x = back; x < front; x += 4) { const h = 4 + Math.round(Math.sin((x - back) / (bw * 2) * Math.PI) * 4); for (let k = 0; k < h; k++) ctx.fillRect(x + Math.floor(k / 3), by - bh - k, Math.max(1, 3 - Math.floor(k / 2)), 1); } return;
    case 'armor': for (let x = back; x <= front; x += 3) for (let y = by - bh - 1; y < by; y += 3) if (Math.abs(x - bx) / bw + Math.abs(y - by) / (bh + 2) < 1.1) ctx.fillRect(x, y, 2, 2); return;
    case 'shell': { const col=ctx.fillStyle;for(let x=-bw;x<=bw;x++){const y=by-Math.sqrt(Math.max(0,1-x*x/(bw*bw)))*bh;R(ctx,bx+x,y,1,2,col);} } for (let x = back + 4; x < front - 2; x += 4) line(ctx, x, by - bh + 2, x, by - 1, 1); return;
    case 'flippers': for (const x of [front - 3, back + 3]) { line(ctx, x, by + bh - 2, x + 5, by + bh + 4, 2); line(ctx, x, by + bh - 2, x - 4, by + bh + 5, 1); } return;
    case 'fin': line(ctx, bx - 2, by - bh, bx + 3, by - bh - 7, 1); line(ctx, bx + 3, by - bh - 7, bx + 7, by - bh, 1); line(ctx, tx, ty, tx - 4, ty - 6, 1); line(ctx, tx, ty, tx - 4, ty + 6, 1); return;
    default: return;
  }
}

// keys: the pieces in the specimen. have(key): drawn solid; others faint.
// highlight: a piece to glow (the assembly puzzle).
export function skeletonCanvas(plan, keys, have, highlight = null) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 40;
  const ctx = c.getContext('2d');
  if (!PLANS[plan]) return c;
  // the stand
  plank(ctx,5,37,54,3,'#B88D60');R(ctx,8,37,47,1,'#D9B783');R(ctx,30,28,1,9,'#775B46');R(ctx,31,30,1,7,'#B88D60');
  for (const key of keys) {
    ctx.fillStyle = key === highlight ? '#E8B83A' : have(key) ? '#EFE6D2' : 'rgba(239,230,210,0.22)';
    const col=ctx.fillStyle,layer=document.createElement('canvas');layer.width=64;layer.height=40;
    const lc=layer.getContext('2d');lc.fillStyle=col;drawPiece(lc,plan,key);
    if(have(key)||key===highlight){const mask=lc.getImageData(0,0,64,40);for(let i=0;i<mask.data.length;i+=4)if(mask.data[i+3]){mask.data[i]=157;mask.data[i+1]=135;mask.data[i+2]=104;}
      const shadow=document.createElement('canvas');shadow.width=64;shadow.height=40;shadow.getContext('2d').putImageData(mask,0,0);ctx.drawImage(shadow,1,1);}
    ctx.drawImage(layer,0,0);
  }
  finishPixels(c,'skeleton');
  return c;
}

const urlCache = new Map();
export function skeletonURL(plan, keys, have, highlight = null) {
  const key = [plan, keys.map(k => k + (have(k) ? 1 : 0)).join(','), highlight].join('|');
  if (!urlCache.has(key)) urlCache.set(key, skeletonCanvas(plan, keys, have, highlight).toDataURL());
  return urlCache.get(key);
}

