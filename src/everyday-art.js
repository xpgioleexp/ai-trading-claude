import {
  R,
  oval,
  poly,
  line,
  box,
  leaf,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintGardenDetail } from './garden-art.js';
import { star } from './furniture-details.js';

// Items sharing a data shape still get the anatomy of the object they represent.
export function paintEveryday(c, item) {
  const id = item.id,
    col = item.color || WOOD,
    d = tint(col, -0.28),
    l = tint(col, 0.3),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v),
    ball = (x, y, rx, ry) => {
      e(x, y, rx, ry, d);
      e(x - 1, y - 1, rx - 1, ry - 1, col);
      r(x - rx + 2, y - ry + 1, 2, 1, l);
    };
  switch (id) {
    case 'egg': {
      poly(
        c,
        [
          [6, 2],
          [10, 2],
          [13, 8],
          [13, 11],
          [10, 14],
          [5, 14],
          [2, 11],
          [3, 7],
        ],
        '#D5C5A4',
      );
      oval(c, 7, 9, 4, 4, '#F3E9CF');
      r(6, 4, 3, 1, CREAM);
      r(4, 7, 1, 3, CREAM);
      return true;
    }
    case 'acorn': {
      ball(8, 10, 4, 4);
      oval(c, 8, 6, 5, 2, WOOD_D);
      oval(c, 7, 5, 4, 1, WOOD);
      for (const x of [4, 7, 10]) r(x, 6, 1, 1, WOOD_L);
      r(7, 2, 2, 3, WOOD_D);
      return true;
    }
    case 'slime_gel': {
      poly(
        c,
        [
          [2, 12],
          [4, 6],
          [7, 4],
          [8, 1],
          [11, 6],
          [14, 10],
          [12, 14],
          [5, 15],
        ],
        d,
      );
      oval(c, 7, 10, 4, 3, col);
      r(5, 6, 2, 3, l);
      r(5, 6, 1, 1, CREAM);
      return true;
    }
    case 'crab_shell': {
      ball(8, 10, 6, 4);
      for (const x of [2, 6, 10, 14]) r(x, 7, 1, 2, d);
      line(c, 4, 12, 12, 12, l);
      r(7, 7, 3, 1, l);
      return true;
    }
    case 'birds_nest': {
      oval(c, 8, 11, 7, 4, WOOD_D);
      oval(c, 8, 9, 6, 3, WOOD);
      oval(c, 8, 9, 4, 2, WOOD_D);
      for (const [x, y] of [
        [5, 8],
        [9, 7],
        [11, 9],
      ])
        oval(c, x, y, 1, 2, '#F3E9CF');
      for (const [x, y] of [
        [2, 11],
        [5, 13],
        [10, 12],
      ])
        line(c, x, y, x + 4, y + 1, WOOD_L);
      return true;
    }
    case 'coconut': {
      ball(8, 9, 6, 5);
      for (const [x, y] of [
        [7, 7],
        [10, 8],
        [8, 10],
      ])
        r(x, y, 1, 1, WOOD_D);
      line(c, 4, 7, 6, 4, l);
      return true;
    }
    case 'seashell':
      return paintGardenDetail(c, 'shell', 16, 16, 'spring');
    case 'radish':
    case 'onion': {
      ball(8, 10, 5, 4);
      line(c, 8, 13, 7, 15, d);
      leaf(c, 5, 4, 3, 1, '#6F925B');
      leaf(c, 9, 3, 2, 2, '#9DBA74');
      r(7, 4, 1, 3, '#3F604A');
      return true;
    }
    case 'pear': {
      ball(8, 11, 5, 3);
      ball(8, 7, 3, 4);
      r(7, 1, 1, 3, WOOD_D);
      leaf(c, 10, 3, 2, 1);
      return true;
    }
    case 'peach': {
      ball(6, 9, 4, 5);
      ball(10, 9, 4, 5);
      line(c, 8, 5, 8, 12, d);
      leaf(c, 10, 3, 3, 1);
      r(4, 6, 2, 1, l);
      return true;
    }
    case 'lemon':
    case 'yuzu': {
      poly(
        c,
        [
          [1, 9],
          [3, 5],
          [8, 4],
          [13, 6],
          [15, 8],
          [12, 12],
          [6, 14],
          [2, 12],
        ],
        d,
      );
      oval(c, 7, 8, 5, 3, col);
      r(4, 6, 4, 1, l);
      leaf(c, 12, 4, 2, 1);
      return true;
    }
    case 'mango':
    case 'eggplant': {
      poly(
        c,
        [
          [9, 2],
          [13, 4],
          [12, 9],
          [8, 14],
          [3, 14],
          [1, 11],
          [3, 7],
        ],
        d,
      );
      oval(c, 8, 8, 4, 5, col);
      r(5, 6, 1, 4, l);
      leaf(c, 11, 3, 3, 2, '#6F925B');
      r(12, 0, 1, 3, WOOD_D);
      return true;
    }
    case 'bell_pepper': {
      for (const x of [5, 8, 11]) ball(x, 9, 3, 5);
      r(7, 2, 2, 3, '#3F604A');
      r(8, 1, 3, 1, '#6F925B');
      r(4, 6, 1, 4, l);
      return true;
    }
    case 'melon':
    case 'pumpkin':
    case 'squash':
    case 'passion_fruit': {
      ball(8, 10, 6, 5);
      for (const x of [4, 8, 12]) line(c, x, 7, x, 13, d);
      r(7, 3, 2, 3, WOOD_D);
      r(4, 6, 2, 1, l);
      leaf(c, 10, 4, 2, 1);
      return true;
    }
    case 'cabbage':
    case 'brussels':
    case 'cauliflower': {
      for (const [x, y] of [
        [4, 10],
        [11, 10],
        [5, 6],
        [10, 5],
      ])
        leaf(c, x, y, 3, 3, '#6F925B');
      if (id === 'cauliflower') {
        for (const [x, y] of [
          [5, 7],
          [10, 7],
          [8, 4],
          [8, 10],
        ]) {
          e(x, y, 3, 2, '#D5C5A4');
          e(x - 1, y - 1, 2, 1, '#F3E9CF');
        }
      } else {
        ball(8, 8, 4, 4);
        line(c, 5, 6, 8, 11, l);
        line(c, 10, 5, 7, 10, l);
      }
      return true;
    }
    case 'pineapple': {
      ball(8, 10, 4, 5);
      for (let y = 7; y < 14; y += 3) for (let x = 5; x < 12; x += 3) r(x, y, 1, 1, d);
      for (const [x, y] of [
        [5, 2],
        [8, 0],
        [11, 2],
      ])
        leaf(c, x, y + 1, 1, 3, '#6F925B');
      r(5, 7, 2, 1, l);
      return true;
    }
    case 'artichoke': {
      for (const [x, y] of [
        [8, 11],
        [4, 9],
        [12, 9],
        [6, 6],
        [10, 6],
        [8, 3],
      ]) {
        poly(
          c,
          [
            [x - 2, y + 2],
            [x, y - 3],
            [x + 2, y + 2],
          ],
          d,
        );
        r(x - 1, y, 2, 2, col);
        r(x, y - 1, 1, 1, l);
      }
      r(7, 13, 2, 3, '#3F604A');
      return true;
    }
    case 'banana': {
      poly(
        c,
        [
          [2, 3],
          [4, 4],
          [5, 9],
          [9, 11],
          [13, 9],
          [14, 6],
          [15, 9],
          [13, 13],
          [8, 15],
          [3, 11],
        ],
        d,
      );
      poly(
        c,
        [
          [3, 4],
          [5, 8],
          [9, 10],
          [13, 8],
          [12, 11],
          [8, 13],
          [5, 11],
        ],
        col,
      );
      r(2, 2, 2, 2, WOOD_D);
      line(c, 5, 9, 8, 12, l);
      return true;
    }
    case 'corn': {
      box(c, 5, 3, 6, 11, d);
      r(6, 4, 4, 9, col);
      for (let y = 4; y < 13; y += 2) r(6, y, 4, 1, l);
      poly(
        c,
        [
          [1, 8],
          [6, 11],
          [7, 15],
          [3, 13],
        ],
        '#6F925B',
      );
      poly(
        c,
        [
          [14, 7],
          [10, 11],
          [8, 15],
          [13, 12],
        ],
        '#3F604A',
      );
      return true;
    }
    case 'wheat':
    case 'oats': {
      for (const x of [4, 8, 12]) {
        line(c, x, 15, x, 3, WOOD_D);
        for (let y = 4; y < 11; y += 3) {
          leaf(c, x - 1, y, 1, 2, col);
          leaf(c, x + 1, y + 1, 1, 2, l);
        }
      }
      r(3, 12, 10, 1, '#C68F89');
      return true;
    }
    case 'bamboo_shoot': {
      poly(
        c,
        [
          [7, 1],
          [11, 6],
          [14, 14],
          [2, 14],
          [4, 6],
        ],
        d,
      );
      poly(
        c,
        [
          [7, 2],
          [9, 6],
          [11, 13],
          [4, 13],
          [5, 6],
        ],
        col,
      );
      for (const y of [6, 9, 12]) r(5, y, 6, 1, l);
      return true;
    }
    case 'wool_mittens': {
      for (const [x, y] of [
        [2, 5],
        [9, 3],
      ]) {
        box(c, x, y, 5, 9, col);
        r(x, y + 6, 5, 2, l);
        r(x - 1, y + 2, 2, 3, col);
        r(x + 1, y + 1, 1, 3, CREAM);
      }
      return true;
    }
    case 'snow_crystal': {
      for (let n = 0; n < 6; n++) {
        const t = (n * Math.PI) / 3,
          x = 8 + Math.cos(t) * 6,
          y = 8 + Math.sin(t) * 6;
        line(c, 8, 8, x, y, col);
        const xx = 8 + Math.cos(t) * 4,
          yy = 8 + Math.sin(t) * 4;
        line(c, xx, yy, xx + Math.cos(t + 1) * 2, yy + Math.sin(t + 1) * 2, l);
        line(c, xx, yy, xx + Math.cos(t - 1) * 2, yy + Math.sin(t - 1) * 2, l);
      }
      r(7, 7, 2, 2, CREAM);
      return true;
    }
    case 'star_fragment':
    case 'wish_charm': {
      star(c, 8, 8, 7, d);
      star(c, 7, 7, 5, col);
      r(5, 4, 2, 1, CREAM);
      return true;
    }
    case 'stardust':
    case 'crystal_dust': {
      star(c, 4, 10, 3, col);
      star(c, 11, 5, 3, l);
      r(10, 12, 2, 1, col);
      r(4, 3, 1, 1, CREAM);
      return true;
    }
    case 'sugar':
    case 'sea_salt': {
      box(c, 3, 2, 10, 13, '#D5C5A4');
      r(4, 4, 7, 8, CREAM);
      for (const [x, y] of [
        [6, 6],
        [9, 7],
        [7, 10],
      ])
        r(x, y, 2, 1, col);
      r(4, 2, 8, 1, WOOD_L);
      r(5, 12, 5, 1, d);
      return true;
    }
    case 'bat_wing':
    case 'void_wing': {
      poly(
        c,
        [
          [1, 12],
          [2, 4],
          [5, 7],
          [8, 2],
          [10, 7],
          [14, 5],
          [13, 13],
          [9, 10],
          [6, 14],
        ],
        d,
      );
      line(c, 3, 7, 6, 11, col);
      line(c, 8, 5, 7, 11, l);
      line(c, 12, 8, 9, 11, col);
      return true;
    }
  }
  if (item.relic && /compass/.test(id)) {
    e(8, 9, 6, 5, WOOD_D);
    e(7, 8, 5, 4, WOOD_L);
    e(8, 8, 3, 3, CREAM);
    poly(
      c,
      [
        [8, 3],
        [10, 10],
        [6, 10],
      ],
      col,
    );
    poly(
      c,
      [
        [8, 13],
        [10, 10],
        [6, 10],
      ],
      d,
    );
    r(7, 8, 2, 1, INK);
    return true;
  }
  if (item.relic && /tea_bowl|clay_pot|acorn_cup/.test(id)) {
    e(8, 9, 6, 4, d);
    e(7, 7, 5, 2, col);
    e(8, 7, 4, 1, WOOD_D);
    r(4, 9, 2, 2, l);
    r(5, 13, 6, 1, WOOD_D);
    return true;
  }
  if (item.relic && /soldier|figurine/.test(id)) {
    box(c, 6, 2, 4, 4, col);
    box(c, 5, 6, 6, 7, col);
    r(5, 7, 2, 1, l);
    r(5, 13, 2, 2, d);
    r(10, 13, 2, 2, d);
    line(c, 12, 4, 12, 13, WOOD_D);
    r(7, 4, 1, 1, INK);
    return true;
  }
  return false;
}
