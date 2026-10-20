import {
  R,
  oval,
  poly,
  line,
  box,
  plank,
  leaf,
  flower,
  roof,
  tint,
  CREAM,
  WOOD,
  WOOD_D,
} from './art-style.js';
import { paintFurniture } from './furniture-art.js';
import { paintOutdoorDetail } from './outdoor-details.js';
export function paintOutdoor(c, def, W, H) {
  if (paintOutdoorDetail(c, def, W, H)) return true;
  const f = def.form,
    col = def.color || WOOD,
    a = def.accent || '#C68F89',
    d = tint(col, -0.25),
    l = tint(col, 0.25),
    B = H - 16,
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v);
  const furniture = {
    bench: 'bench',
    heartbench: 'bench',
    deckchair: 'chair',
    picnictable: 'table',
    parasol: 'round_table',
    planter: 'flower_box',
    pots: 'plant',
    catstatue: 'statue',
  }[f];
  if (
    furniture &&
    paintFurniture(c, { type: def.type, form: furniture, color: col, accent: a }, W, H)
  ) {
    if (f === 'heartbench') {
      r(6, 4, 2, 1, a);
      r(9, 4, 2, 1, a);
      r(7, 5, 3, 1, a);
      r(8, 6, 1, 1, a);
    }
    return true;
  }
  if (['fence', 'wall', 'hedge', 'railing', 'rope'].includes(f)) {
    if (f === 'hedge') {
      for (const x of [3, 8, 13]) leaf(c, x, 10, 4, 4, col);
      r(1, 15, 14, 1, d);
      return true;
    }
    if (f === 'wall') {
      for (let yy = 6; yy < 16; yy += 4)
        for (let xx = yy % 8 ? 0 : -3; xx < 16; xx += 7) box(c, xx, yy, 6, 4, col);
      return true;
    }
    for (const x of [1, 7, 13]) {
      plank(c, x, 4, 2, 12, col);
      r(x, 3, 2, 1, l);
    }
    if (f === 'rope') {
      line(c, 2, 7, 7, 9, a);
      line(c, 7, 9, 14, 7, a);
    } else {
      plank(c, 0, 7, 16, 2, col);
      plank(c, 0, 12, 16, 2, col);
    }
    return true;
  }
  if (
    ['lamppost', 'lanternpost', 'torch', 'stonelantern', 'smalllight', 'stringpole'].includes(f)
  ) {
    const by = H - 3;
    box(c, 5, by, 6, 3, d);
    plank(c, 7, 8, 2, by - 8, col);
    if (f === 'stringpole') {
      line(c, 0, 4, 15, 7, WOOD_D);
      for (const x of [2, 7, 12]) oval(c, x, 6, 1, 2, a);
    } else {
      box(c, 4, 3, 8, 8, col);
      r(5, 4, 6, 5, a);
      r(5, 4, 2, 3, tint(a, 0.3));
      r(7, 4, 1, 6, d);
      roof(c, 2, 0, 12, 4, col);
      r(4, 11, 8, 1, d);
    }
    return true;
  }
  if (
    ['arch', 'heartarch', 'swing', 'feeder', 'signpost', 'flag', 'windmill', 'chime'].includes(f)
  ) {
    if (f === 'signpost') {
      plank(c, 7, 2, 2, H - 2, col);
      plank(c, 1, 4, 13, 5, a);
      plank(c, 3, 12, 12, 4, a);
      r(3, 6, 6, 1, d);
      r(5, 14, 6, 1, d);
    } else if (f === 'flag') {
      plank(c, 2, 0, 2, H, col);
      poly(
        c,
        [
          [4, 2],
          [14, 3],
          [12, 9],
          [4, 8],
        ],
        a,
      );
      flower(c, 8, 5, CREAM);
    } else if (f === 'chime') {
      plank(c, 3, 2, 10, 2, col);
      for (const [x, hh] of [
        [4, 9],
        [7, 13],
        [10, 11],
        [13, 8],
      ]) {
        line(c, x, 4, x, hh, col);
        box(c, x - 1, hh, 3, 3, a);
      }
      line(c, 8, 0, 8, 2, d);
    } else if (f === 'windmill') {
      box(c, 5, 11, 6, H - 11, col);
      roof(c, 3, 6, 10, 7, a);
      for (const [dx, dy] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ])
        line(c, 8, 10, 8 + dx * 6, 10 + dy * 6, CREAM, 2);
      r(7, 9, 2, 2, d);
    } else if (f === 'feeder') {
      plank(c, 7, 9, 2, H - 9, col);
      box(c, 3, 4, 10, 6, a);
      r(5, 6, 6, 3, d);
      roof(c, 1, 0, 14, 5, col);
      r(3, 10, 10, 2, l);
    } else {
      for (const x of [1, 13]) plank(c, x, 5, 2, H - 5, col);
      for (let x = 2; x < 14; x++) {
        const y = 5 - Math.round(Math.sin(((x - 2) / 12) * Math.PI) * 4);
        r(x, y, 1, 2, col);
      }
      for (const [x, y] of [
        [2, 8],
        [12, 13],
        [5, 2],
        [10, 3],
      ]) {
        leaf(c, x, y, 2, 2);
        r(x, y, 1, 1, a);
      }
      if (f === 'swing') {
        line(c, 5, 3, 5, H - 7, d);
        line(c, 10, 3, 10, H - 7, d);
        plank(c, 4, H - 7, 8, 2, a);
      }
    }
    return true;
  }
  if (['barrel', 'compost', 'hay', 'sandbox', 'planter', 'cans'].includes(f)) {
    box(c, 2, B + 5, 12, 11, col);
    r(3, B + 6, 10, 1, l);
    if (f === 'barrel') {
      oval(c, 8, B + 4, 5, 2, d);
      oval(c, 8, B + 4, 4, 1, '#79AAA4');
      r(2, B + 8, 12, 1, a);
      r(2, B + 13, 12, 1, a);
    } else if (f === 'sandbox') {
      r(3, B + 7, 10, 7, a);
      box(c, 5, B + 8, 3, 3, col);
      r(10, B + 11, 2, 2, '#C68F89');
    } else {
      for (let y = B + 8; y < H - 1; y += 3) r(3, y, 10, 1, d);
      if (f === 'compost') r(4, B + 3, 8, 3, '#775B46');
    }
    return true;
  }
  if (['birdbath', 'sundial', 'fountain', 'wishstone'].includes(f)) {
    box(c, 4, H - 3, 8, 3, d);
    box(c, 6, H - 10, 4, 8, col);
    oval(c, 8, H - 10, 7, 3, d);
    oval(c, 7, H - 11, 6, 2, col);
    if (f === 'sundial') {
      line(c, 8, H - 12, 8, H - 16, a);
      line(c, 8, H - 12, 12, H - 10, d);
    } else {
      oval(c, 8, H - 11, 4, 1, a);
      r(5, H - 12, 3, 1, CREAM);
      if (f === 'fountain') {
        r(7, H - 16, 2, 5, col);
        r(6, H - 17, 4, 2, col);
        r(5, H - 16, 1, 3, CREAM);
        r(10, H - 16, 1, 3, CREAM);
      }
    }
    return true;
  }
  return false;
}
