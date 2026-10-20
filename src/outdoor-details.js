import {
  R,
  oval,
  poly,
  line,
  box,
  plank,
  leaf,
  flower,
  tint,
  INK,
  CREAM,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintSpecialFurniture } from './furniture-details.js';

export function paintOutdoorDetail(c, def, W, H) {
  const f = def.form,
    col = def.color || '#B88D60',
    a = def.accent || '#C68F89',
    d = tint(col, -0.3),
    l = tint(col, 0.3),
    B = H - 16,
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    b = (x, y, w, h, v = col) => box(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v);
  switch (f) {
    case 'catstatue':
      return paintSpecialFurniture(c, def, W, H, 'lucky_cat');
    case 'cans': {
      for (const [x, y] of [
        [1, B + 9],
        [8, B + 7],
      ]) {
        box(c, x, y, 5, 6, col);
        oval(c, x + 2, y, 2, 1, d);
        line(c, x + 4, y + 2, x + 7, y, a);
        r(x + 6, y, 2, 1, a);
        r(x + 1, y + 1, 1, 3, l);
      }
      return true;
    }
    case 'wishstone': {
      poly(
        c,
        [
          [2, B + 8],
          [6, B + 4],
          [12, B + 5],
          [15, B + 10],
          [12, B + 15],
          [3, B + 15],
        ],
        d,
      );
      poly(
        c,
        [
          [3, B + 8],
          [6, B + 5],
          [11, B + 6],
          [12, B + 12],
          [4, B + 13],
        ],
        col,
      );
      r(5, B + 6, 4, 1, l);
      r(8, B + 8, 1, 4, a);
      r(6, B + 10, 5, 1, a);
      return true;
    }
    case 'path':
    case 'steps': {
      for (const [x, y, w, h] of f === 'steps'
        ? [
            [2, 1, 6, 4],
            [9, 6, 6, 4],
            [3, 11, 7, 4],
          ]
        : [
            [1, 1, 6, 5],
            [9, 2, 6, 5],
            [2, 9, 6, 6],
            [10, 10, 5, 5],
          ]) {
        poly(
          c,
          [
            [x, y + 1],
            [x + 2, y],
            [x + w, y + 1],
            [x + w, y + h - 1],
            [x + 1, y + h],
          ],
          d,
        );
        r(x + 1, y + 1, w - 2, h - 2, col);
        r(x + 2, y + 1, w - 3, 1, l);
        r(x + w - 2, y + 2, 1, h - 3, a);
      }
      return true;
    }
    case 'bricks':
    case 'deck':
    case 'tiles':
    case 'mosaic': {
      if (f === 'deck') {
        for (let x = 0; x < 16; x += 4) {
          plank(c, x, 0, 4, 16, col);
          r(x + 1, 2, 1, 1, a);
          r(x + 1, 13, 1, 1, a);
        }
      } else {
        const size = f === 'mosaic' ? 4 : 8;
        for (let y = 0; y < 16; y += size)
          for (let x = f === 'bricks' && (y / size) % 2 ? -4 : 0; x < 16; x += size) {
            r(x, y, size, size, d);
            r(x + 1, y + 1, size - 2, size - 2, f === 'mosaic' && (x + y) % 8 === 0 ? a : col);
            r(x + 1, y + 1, size - 2, 1, l);
            r(x + size - 2, y + 2, 1, size - 3, tint(col, -0.15));
          }
      }
      return true;
    }
    case 'flowerbed':
    case 'clover': {
      if (f === 'flowerbed') {
        b(0, 3, 16, 13, col);
        r(2, 5, 12, 9, WOOD_D);
      }
      for (const [x, y] of [
        [3, 6],
        [8, 4],
        [12, 7],
        [6, 12],
        [13, 13],
      ]) {
        leaf(c, x, y + 2, 2, 1, '#6F925B');
        if (f === 'flowerbed') flower(c, x, y, a);
        else {
          oval(c, x - 1, y, 1, 1, col);
          oval(c, x + 1, y, 1, 1, col);
          oval(c, x, y + 1, 1, 1, l);
          r(x, y + 3, 1, 1, d);
        }
      }
      return true;
    }
    case 'crystal': {
      for (const [x, y, hh, v] of [
        [2, B + 7, 9, a],
        [6, B + 1, 15, col],
        [11, B + 5, 11, l],
      ]) {
        poly(
          c,
          [
            [x, y + 3],
            [x + 2, y],
            [x + 4, y + 3],
            [x + 3, y + hh],
            [x, y + hh],
          ],
          tint(v, -0.3),
        );
        r(x + 1, y + 3, 1, hh - 4, v);
        r(x + 1, y + 3, 1, 2, CREAM);
      }
      return true;
    }
    case 'log': {
      plank(c, 1, B + 8, 13, 7, d);
      oval(c, 13, B + 11, 3, 4, a);
      oval(c, 13, B + 11, 2, 2, col);
      r(13, B + 10, 1, 2, d);
      r(3, B + 8, 7, 1, l);
      r(4, B + 12, 5, 1, col);
      leaf(c, 5, B + 6, 3, 1, '#6F925B');
      return true;
    }
    case 'deckchair': {
      line(c, 2, B + 15, 7, B + 5, d, 2);
      line(c, 13, B + 15, 5, B + 7, d, 2);
      poly(
        c,
        [
          [3, B + 2],
          [7, B + 3],
          [11, B + 11],
          [6, B + 11],
        ],
        col,
      );
      line(c, 4, B + 3, 8, B + 10, l);
      plank(c, 6, B + 10, 8, 3, a);
      r(12, B + 13, 2, 3, d);
      return true;
    }
    case 'parasol': {
      plank(c, 7, B + 3, 2, 13, d);
      poly(
        c,
        [
          [1, B + 6],
          [3, B + 2],
          [8, B],
          [13, B + 2],
          [15, B + 6],
        ],
        d,
      );
      poly(
        c,
        [
          [2, B + 5],
          [4, B + 2],
          [8, B + 1],
          [12, B + 2],
          [14, B + 5],
        ],
        col,
      );
      poly(
        c,
        [
          [7, B + 1],
          [4, B + 5],
          [10, B + 5],
        ],
        a,
      );
      r(2, B + 6, 3, 1, a);
      r(11, B + 6, 3, 1, a);
      oval(c, 8, B + 13, 6, 2, col);
      r(4, B + 12, 5, 1, l);
      return true;
    }
    case 'hammock': {
      for (const x of [1, 13]) plank(c, x, B + 1, 2, 15, col);
      for (let x = 3; x < 13; x++) {
        const y = B + 5 + Math.round(Math.sin(((x - 3) / 10) * Math.PI) * 5);
        r(x, y, 1, 3, a);
        r(x, y, 1, 1, tint(a, 0.3));
        if (x % 3 === 0) r(x, y + 2, 1, 1, d);
      }
      return true;
    }
    case 'scarecrow': {
      plank(c, 7, 6, 2, H - 6, WOOD_D);
      line(c, 2, 10, 13, 10, WOOD_D, 2);
      oval(c, 8, 6, 3, 3, '#D9B783');
      r(6, 5, 1, 1, INK);
      r(9, 5, 1, 1, INK);
      r(7, 7, 2, 1, '#A96E75');
      box(c, 4, 10, 8, 9, a);
      r(5, 11, 2, 5, tint(a, 0.3));
      r(7, 12, 2, 2, col);
      r(3, 2, 10, 2, col);
      box(c, 5, 0, 6, 3, col);
      r(5, 3, 7, 1, d);
      for (const x of [4, 7, 10]) r(x, 18, 1, 3, WOOD_L);
      return true;
    }
    case 'wheelbarrow': {
      oval(c, 4, B + 13, 3, 3, INK);
      oval(c, 4, B + 13, 1, 1, a);
      poly(
        c,
        [
          [1, B + 5],
          [14, B + 5],
          [11, B + 11],
          [4, B + 11],
        ],
        d,
      );
      poly(
        c,
        [
          [2, B + 5],
          [13, B + 5],
          [11, B + 8],
          [4, B + 8],
        ],
        col,
      );
      r(4, B + 6, 6, 1, WOOD_D);
      line(c, 10, B + 10, 15, B + 8, a);
      line(c, 10, B + 10, 12, B + 15, d);
      r(2, B + 5, 9, 1, l);
      return true;
    }
    case 'gnome': {
      oval(c, 8, B + 9, 3, 3, '#E4B4A3');
      poly(
        c,
        [
          [3, B + 6],
          [7, B],
          [12, B + 6],
        ],
        col,
      );
      r(6, B + 2, 1, 3, l);
      oval(c, 8, B + 11, 3, 3, CREAM);
      r(5, B + 12, 6, 3, a);
      r(3, B + 15, 4, 1, INK);
      r(9, B + 15, 4, 1, INK);
      r(7, B + 8, 2, 2, '#D9B783');
      return true;
    }
    case 'pumpkins':
    case 'jack': {
      for (const [x, y, rx] of f === 'jack'
        ? [[8, B + 10, 6]]
        : [
            [5, B + 11, 4],
            [11, B + 12, 3],
            [9, B + 6, 3],
          ]) {
        e(x, y, rx, 4, d);
        e(x - 1, y - 1, rx - 1, 3, col);
        line(c, x, y - 3, x, y + 2, a);
        r(x, y - 5, 1, 2, '#3F604A');
        r(x - 2, y - 2, 1, 3, l);
        if (f === 'jack') {
          r(x - 3, y - 1, 2, 2, a);
          r(x + 1, y - 1, 2, 2, a);
          r(x - 2, y + 2, 4, 1, a);
        }
      }
      return true;
    }
    case 'totem': {
      for (let n = 0; n < 3; n++) {
        const y = 2 + n * 7;
        b(4, y, 8, 7, n % 2 ? col : a);
        r(5, y + 2, 2, 1, INK);
        r(9, y + 2, 2, 1, INK);
        r(7, y + 4, 2, 1, CREAM);
        r(5, y, 4, 1, l);
      }
      poly(
        c,
        [
          [1, 8],
          [4, 10],
          [4, 13],
          [0, 11],
        ],
        col,
      );
      poly(
        c,
        [
          [12, 10],
          [15, 8],
          [15, 11],
          [12, 13],
        ],
        col,
      );
      r(3, H - 3, 10, 3, d);
      return true;
    }
    case 'tent': {
      poly(
        c,
        [
          [1, B + 15],
          [6, B + 1],
          [10, B + 3],
          [15, B + 15],
        ],
        d,
      );
      poly(
        c,
        [
          [2, B + 14],
          [6, B + 2],
          [9, B + 14],
        ],
        col,
      );
      poly(
        c,
        [
          [10, B + 5],
          [7, B + 15],
          [13, B + 15],
        ],
        a,
      );
      line(c, 6, B + 2, 9, B + 14, l);
      r(0, B + 15, 16, 1, d);
      return true;
    }
    case 'snowbunny': {
      oval(c, 8, B + 12, 6, 4, '#B7CBCD');
      oval(c, 7, B + 11, 5, 3, col);
      oval(c, 8, B + 6, 4, 3, col);
      box(c, 4, B, 2, 5, col);
      box(c, 10, B + 1, 2, 4, col);
      r(5, B + 1, 1, 2, a);
      r(6, B + 6, 1, 1, INK);
      r(10, B + 6, 1, 1, INK);
      r(8, B + 8, 1, 1, a);
      r(4, B + 10, 2, 1, CREAM);
      return true;
    }
    case 'torch': {
      plank(c, 7, 10, 2, H - 10, col);
      box(c, 5, 9, 6, 4, d);
      poly(
        c,
        [
          [4, 9],
          [6, 5],
          [7, 0],
          [10, 5],
          [12, 9],
        ],
        a,
      );
      poly(
        c,
        [
          [6, 9],
          [8, 4],
          [10, 9],
        ],
        CREAM,
      );
      return true;
    }
    default:
      return false;
  }
}
