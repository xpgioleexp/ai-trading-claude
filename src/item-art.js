import {
  R,
  oval,
  poly,
  line,
  box,
  leaf,
  flower,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
// All item silhouettes stay in the same 16 × 16 slot. Shape follows the item family.
export function paintItem(c, item) {
  const col = item.color || WOOD,
    d = tint(col, -0.28),
    l = tint(col, 0.3),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    id = item.id || '';
  switch (item.shape) {
    case 'fish': {
      if (/eel|loach|pike|ribbon/.test(id)) {
        for (let x = 2; x < 14; x++) r(x, 7 + Math.round(Math.sin(x * 0.6) * 1.5), 2, 3);
        r(3, 6, 1, 1, CREAM);
        r(2, 7, 1, 1, INK);
        return true;
      }
      const tall = /carp|bream|sunfish|puffer|moon|tuna/.test(id),
        ry = tall ? 4 : 3;
      poly(
        c,
        [
          [11, 8],
          [15, 4],
          [14, 8],
          [15, 12],
          [11, 10],
        ],
        d,
      );
      oval(c, 7, 8, 5, ry, d);
      oval(c, 7, 7, 5, ry - 1, col);
      line(c, 4, 6, 8, 5, l);
      poly(
        c,
        [
          [6, 5],
          [8, 2],
          [10, 5],
        ],
        d,
      );
      r(3, 7, 1, 1, INK);
      r(3, 6, 1, 1, CREAM);
      r(5, 9, 5, 1, l);
      r(8, 7, 1, 2, d);
      r(9, 10, 2, 1, d);
      return true;
    }
    case 'round':
      oval(c, 8, 10, 5, 5, d);
      oval(c, 7, 9, 5, 4, col);
      r(4, 7, 2, 2, l);
      line(c, 8, 5, 9, 2, WOOD_D);
      leaf(c, 11, 4, 2, 1);
      return true;
    case 'berry':
      for (const [x, y] of [
        [5, 10],
        [10, 10],
        [8, 6],
      ]) {
        oval(c, x, y, 3, 3, d);
        oval(c, x - 1, y - 1, 2, 2, col);
        r(x - 1, y - 2, 1, 1, l);
      }
      leaf(c, 8, 2, 3, 1);
      return true;
    case 'flower':
      line(c, 7, 8, 8, 14, '#3F604A');
      leaf(c, 10, 11, 3, 1);
      leaf(c, 5, 12, 2, 1);
      flower(c, 8, 5, col);
      r(8, 5, 1, 1, '#E8C25A');
      return true;
    case 'leaf':
      poly(
        c,
        [
          [8, 1],
          [13, 5],
          [13, 9],
          [8, 14],
          [3, 10],
          [2, 6],
        ],
        d,
      );
      poly(
        c,
        [
          [8, 2],
          [11, 5],
          [11, 9],
          [7, 12],
          [3, 8],
          [4, 5],
        ],
        col,
      );
      line(c, 7, 5, 8, 14, l);
      line(c, 7, 7, 4, 6, l);
      line(c, 8, 9, 11, 7, l);
      return true;
    case 'root':
      poly(
        c,
        [
          [4, 6],
          [11, 5],
          [12, 8],
          [9, 12],
          [7, 15],
          [5, 11],
        ],
        d,
      );
      poly(
        c,
        [
          [5, 6],
          [10, 6],
          [10, 9],
          [7, 13],
          [6, 10],
        ],
        col,
      );
      r(5, 8, 3, 1, l);
      r(7, 11, 2, 1, d);
      leaf(c, 6, 3, 2, 2);
      leaf(c, 10, 3, 2, 2);
      return true;
    case 'mushroom':
      box(c, 6, 8, 5, 7, '#D5C5A4');
      r(7, 9, 2, 5, CREAM);
      oval(c, 8, 7, 7, 4, d);
      oval(c, 7, 6, 6, 4, col);
      r(2, 8, 12, 1, d);
      for (const [x, y] of [
        [5, 4],
        [10, 5],
        [7, 7],
      ])
        r(x, y, 2, 1, l);
      return true;
    case 'pod':
      poly(
        c,
        [
          [2, 9],
          [4, 5],
          [11, 4],
          [14, 6],
          [12, 10],
          [5, 12],
        ],
        d,
      );
      line(c, 4, 9, 11, 6, col, 3);
      for (const [x, y] of [
        [5, 8],
        [8, 7],
        [11, 6],
      ])
        oval(c, x, y, 1, 1, l);
      line(c, 13, 5, 14, 2, '#3F604A');
      return true;
    case 'cone':
      for (let n = 0; n < 5; n++) {
        const y = 3 + n * 2,
          ww = 3 + Math.min(n, 3) * 2;
        r(8 - ww / 2, y, ww, 2, n % 2 ? col : d);
        r(7 - ww / 2, y, 2, 1, l);
      }
      r(7, 1, 2, 2, WOOD_D);
      return true;
    case 'crystal':
    case 'gem':
      poly(
        c,
        [
          [4, 3],
          [11, 3],
          [14, 7],
          [8, 14],
          [1, 7],
        ],
        d,
      );
      poly(
        c,
        [
          [4, 4],
          [7, 4],
          [5, 7],
          [2, 7],
        ],
        l,
      );
      poly(
        c,
        [
          [8, 4],
          [11, 4],
          [13, 7],
          [6, 7],
        ],
        col,
      );
      poly(
        c,
        [
          [6, 8],
          [11, 8],
          [8, 13],
        ],
        col,
      );
      r(4, 4, 1, 1, CREAM);
      line(c, 6, 8, 8, 13, l);
      return true;
    case 'stone':
    case 'ore':
    case 'geode': {
      const rock = item.shape === 'ore' ? '#9A958A' : item.shape === 'geode' ? '#8F8579' : col;
      poly(
        c,
        [
          [3, 6],
          [6, 3],
          [11, 4],
          [14, 8],
          [13, 13],
          [4, 14],
          [1, 11],
        ],
        tint(rock, -0.3),
      );
      poly(
        c,
        [
          [3, 6],
          [6, 4],
          [11, 5],
          [12, 8],
          [9, 12],
          [3, 11],
        ],
        rock,
      );
      poly(
        c,
        [
          [3, 6],
          [6, 4],
          [10, 5],
          [6, 7],
        ],
        tint(rock, 0.28),
      );
      if (item.shape === 'ore')
        for (const [x, y] of [
          [5, 8],
          [10, 7],
          [9, 11],
        ]) {
          r(x, y, 3, 2, col);
          r(x, y, 1, 1, l);
        }
      if (item.shape === 'geode') {
        oval(c, 9, 9, 3, 3, '#775B6A');
        r(8, 7, 1, 3, '#C3ACD9');
        r(10, 9, 1, 2, '#B7D4BD');
        r(8, 7, 1, 1, CREAM);
      }
      return true;
    }
    case 'fossil': {
      poly(
        c,
        [
          [3, 5],
          [7, 3],
          [12, 5],
          [14, 10],
          [11, 14],
          [4, 13],
          [2, 9],
        ],
        d,
      );
      poly(
        c,
        [
          [4, 5],
          [8, 4],
          [12, 7],
          [12, 11],
          [9, 13],
          [4, 11],
        ],
        col,
      );
      const bone = '#F3E9CF',
        key = id.split('_').at(-1);
      if (/skull|head/.test(key)) {
        box(c, 5, 6, 7, 5, bone);
        r(8, 7, 2, 2, d);
        r(5, 10, 1, 1, d);
      } else if (/legs|arms|claws|bone|horn|tusks/.test(key)) {
        line(c, 5, 6, 10, 11, bone, 2);
        oval(c, 5, 6, 1, 1, bone);
        oval(c, 10, 11, 1, 1, bone);
      } else if (/tail|spine|neck/.test(key)) {
        for (let x = 4; x < 12; x += 2) r(x, 7 + Math.round(Math.sin(x * 0.6) * 2), 2, 2, bone);
      } else {
        line(c, 5, 7, 11, 7, bone);
        for (let x = 5; x < 12; x += 2) {
          r(x, 8, 1, 3, bone);
          r(x + 1, 10, 1, 1, bone);
        }
        r(7, 6, 1, 1, l);
      }
      return true;
    }
    case 'seed':
      box(c, 3, 1, 10, 14, '#D5C5A4');
      r(4, 3, 8, 10, '#F3E9CF');
      r(4, 2, 8, 1, WOOD_D);
      oval(c, 8, 9, 3, 3, col);
      leaf(c, 8, 5, 2, 1);
      r(5, 12, 5, 1, WOOD_L);
      return true;
    case 'bug': {
      if (item.kind === 'beetle') {
        oval(c, 8, 9, 5, 5, d);
        oval(c, 7, 8, 4, 4, col);
        r(8, 5, 1, 8, d);
        r(5, 6, 2, 1, '#D5C5A4');
        r(6, 3, 4, 2, INK);
        for (const x of [3, 12]) {
          r(x, 7, 1, 2, d);
          r(x, 11, 1, 2, d);
        }
        return true;
      }
      return false;
    }
    case 'dish': {
      oval(c, 8, 11, 7, 3, '#D5C5A4');
      oval(c, 8, 10, 6, 2, CREAM);
      if (/tea|coffee|cocoa|juice|smoothie|latte|lassi/.test(id)) {
        box(c, 4, 3, 7, 9, '#F3E9CF');
        oval(c, 7, 4, 2, 1, col);
        r(11, 5, 2, 4, '#D5C5A4');
        r(12, 6, 1, 2, CREAM);
        line(c, 6, 1, 7, 2, '#D5C5A4');
      } else if (/pie|cake|pizza|toast|bread/.test(id)) {
        poly(
          c,
          [
            [3, 5],
            [12, 4],
            [12, 10],
            [4, 11],
          ],
          d,
        );
        r(4, 5, 8, 4, col);
        r(4, 5, 7, 1, l);
        r(4, 9, 8, 1, CREAM);
        r(9, 4, 2, 1, '#C68F89');
      } else {
        oval(c, 8, 8, 5, 3, d);
        oval(c, 7, 7, 4, 3, col);
        for (const [x, y] of [
          [5, 6],
          [9, 7],
          [7, 9],
        ])
          r(x, y, 2, 1, l);
        r(6, 5, 2, 1, '#9DBA74');
      }
      return true;
    }
    default:
      return false;
  }
}
