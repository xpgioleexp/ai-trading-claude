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
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { star } from './furniture-details.js';

export function paintProp(c, name, W, H, state = 0) {
  const r = (x, y, w, h, col) => R(c, x, y, w, h, col);
  switch (name) {
    case 'palm': {
      for (let y = 14; y < H; y++) {
        const x = 14 + Math.round(Math.sin(y / 12) * 3);
        r(x, y, 4, 1, WOOD_D);
        r(x, y, 2, 1, y % 5 === 0 ? WOOD_D : WOOD);
        r(x, y, 1, 1, WOOD_L);
      }
      for (const [dx, dy] of [
        [-13, 6],
        [-12, -3],
        [-7, -10],
        [4, -11],
        [12, -5],
        [14, 5],
      ]) {
        for (let n = 0; n < 13; n++) {
          const t = n / 12,
            x = 16 + dx * t,
            y = 13 + dy * t + t * t * 7;
          r(x, y, 2, 2, '#3F604A');
          r(x, y - 1, 2, 1, n < 8 ? '#6F925B' : '#9DBA74');
          if (n > 2 && n < 11) {
            line(c, x, y, x - 1, y + 3, '#6F925B');
            r(x + 1, y + 1, 1, 2, '#3F604A');
          }
        }
      }
      if (state) {
        for (const x of [13, 19]) {
          oval(c, x, 17, 3, 3, WOOD_D);
          oval(c, x - 1, 16, 2, 2, WOOD);
          r(x - 1, 15, 1, 1, WOOD_L);
        }
      }
      r(12, H - 1, 10, 1, WOOD_D);
      return true;
    }
    case 'cave':
    case 'ladder_down': {
      poly(
        c,
        [
          [1, 5],
          [5, 2],
          [11, 2],
          [15, 6],
          [14, 13],
          [10, 15],
          [3, 14],
          [0, 10],
        ],
        '#6E6A62',
      );
      poly(
        c,
        [
          [3, 5],
          [7, 4],
          [12, 5],
          [13, 11],
          [10, 14],
          [4, 12],
        ],
        '#29372F',
      );
      r(2, 4, 4, 1, '#C4BFB3');
      r(12, 11, 2, 1, '#9A958A');
      for (const x of [5, 10]) plank(c, x, 4, 1, 11, WOOD_L);
      for (const y of [5, 8, 11, 14]) {
        r(5, y, 6, 1, WOOD);
        r(6, y, 3, 1, WOOD_L);
      }
      if (name === 'cave') {
        leaf(c, 2, 12, 2, 1);
        r(13, 4, 1, 2, '#A9A397');
      }
      return true;
    }
    case 'ladder_up': {
      for (const x of [4, 10]) plank(c, x, 0, 2, H, WOOD);
      for (let y = 2; y < H; y += 4) {
        plank(c, 4, y, 8, 2, WOOD);
        r(5, y, 6, 1, WOOD_L);
        r(5, y + 2, 6, 1, WOOD_D);
      }
      r(3, H - 1, 3, 1, WOOD_D);
      r(10, H - 1, 3, 1, WOOD_D);
      return true;
    }
    case 'bed': {
      box(c, 0, 1, 16, 15, WOOD_D);
      r(1, 2, 13, 1, WOOD_L);
      r(2, 4, 11, 10, state ? '#5A4130' : '#7A5A3E');
      for (let y = 5; y < 14; y += 4) {
        r(3, y, 9, 1, state ? '#352A23' : '#5A4130');
        r(3, y + 1, 8, 1, state ? '#6D523A' : '#9C7650');
        for (const x of [4, 9]) r(x, y + 2, 1, 1, state ? '#B7D4BD' : '#B88D60');
      }
      r(1, 14, 13, 1, WOOD);
      return true;
    }
    case 'chest': {
      box(c, 1, 7, 14, 9, WOOD_D);
      r(2, 8, 11, 6, WOOD);
      for (const x of [3, 11]) r(x, 8, 2, 7, '#D9B783');
      r(4, 9, 1, 1, INK);
      r(12, 12, 1, 1, INK);
      if (state) {
        box(c, 1, 0, 14, 6, WOOD);
        r(2, 1, 11, 3, WOOD_L);
        r(3, 7, 10, 2, INK);
        r(5, 7, 2, 1, '#E8C25A');
        r(9, 6, 2, 2, '#79AAA4');
      } else {
        poly(
          c,
          [
            [1, 7],
            [2, 3],
            [5, 2],
            [12, 2],
            [15, 5],
            [15, 8],
          ],
          WOOD_D,
        );
        r(3, 3, 10, 3, WOOD);
        r(4, 3, 7, 1, WOOD_L);
        r(3, 4, 2, 4, '#D9B783');
        r(11, 4, 2, 4, '#D9B783');
        box(c, 7, 7, 3, 4, '#E8C25A');
        r(8, 8, 1, 2, WOOD_D);
      }
      return true;
    }
    case 'door': {
      box(c, 1, 2, 14, 24, WOOD_D);
      r(3, 4, 10, 20, '#79AAA4');
      r(4, 5, 7, 7, '#B7D4BD');
      r(4, 14, 7, 9, WOOD);
      r(7, 4, 1, 8, CREAM);
      r(3, 8, 10, 1, CREAM);
      r(4, 15, 1, 6, WOOD_L);
      r(10, 17, 1, 1, '#E8C25A');
      plank(c, 0, 0, 16, 3, WOOD);
      plank(c, 0, 24, 16, 2, '#9A958A');
      leaf(c, 1, 12, 2, 3);
      flower(c, 2, 8, '#E4B4A3');
      return true;
    }
    case 'hive': {
      plank(c, 7, 14, 2, 10, WOOD_D);
      for (let n = 0; n < 4; n++) {
        oval(c, 8, 4 + n * 3, 4 + (n === 1 || n === 2 ? 1 : 0), 2, n % 2 ? '#C9A05B' : '#D9B783');
        r(5, 3 + n * 3, 4, 1, '#F2D39A');
      }
      oval(c, 8, 12, 2, 1, INK);
      if (state) {
        r(6, 16, 4, 2, '#D9AC52');
        r(7, 17, 2, 2, '#E8C25A');
      }
      return true;
    }
    case 'snowman': {
      oval(c, 8, 18, 6, 5, '#C5D3D8');
      oval(c, 7, 17, 5, 4, '#E6EDEE');
      oval(c, 8, 8, 5, 4, '#C5D3D8');
      oval(c, 7, 7, 4, 3, '#F7FAFA');
      r(5, 7, 1, 1, INK);
      r(9, 7, 1, 1, INK);
      r(8, 9, 3, 1, '#D8A060');
      r(3, 12, 10, 2, '#C68F89');
      r(10, 13, 2, 4, '#A96E75');
      box(c, 4, 1, 8, 3, INK);
      r(2, 4, 12, 1, INK);
      r(5, 2, 4, 1, '#607674');
      for (const y of [16, 19]) r(8, y, 1, 1, INK);
      line(c, 2, 14, 0, 11, WOOD_D);
      line(c, 13, 14, 15, 11, WOOD_D);
      return true;
    }
    case 'rose_arch': {
      for (const x of [2, W - 5]) plank(c, x, 8, 3, H - 8, WOOD_D);
      for (let x = 3; x < W - 3; x++) {
        const y = 8 - Math.round(Math.sin(((x - 3) / (W - 6)) * Math.PI) * 6);
        r(x, y, 1, 3, WOOD);
      }
      for (const [x, y] of [
        [3, 10],
        [W - 4, 16],
        [8, 3],
        [W / 2, 1],
        [W - 9, 4],
        [3, H - 6],
        [W - 4, H - 3],
      ]) {
        leaf(c, x, y + 1, 3, 2);
        flower(c, x, y, '#C68F89');
      }
      return true;
    }
    case 'merchant': {
      const u = state ? 1 : 0;
      box(c, 11, 7 - u, 8, 13, WOOD_D);
      r(12, 8 - u, 5, 9, WOOD);
      r(14, 8 - u, 1, 8, WOOD_L);
      r(12, 4 - u, 5, 3, '#C68F89');
      poly(
        c,
        [
          [3, 21],
          [4, 13 - u],
          [12, 12 - u],
          [15, 24],
          [2, 24],
        ],
        '#66557C',
      );
      poly(
        c,
        [
          [4, 13 - u],
          [8, 11 - u],
          [9, 23],
          [4, 22],
        ],
        '#8E7FA0',
      );
      oval(c, 8, 7 - u, 6, 6, '#4C405D');
      oval(c, 8, 8 - u, 4, 4, '#D9B783');
      r(6, 8 - u, 1, 1, INK);
      r(10, 8 - u, 1, 1, INK);
      r(7, 10 - u, 2, 1, '#B88D60');
      r(4, 3 - u, 5, 1, '#8E7FA0');
      r(6, 14 - u, 3, 1, '#D9B783');
      r(5, 24, 3, 2, INK);
      r(10, 24, 3, 2, INK);
      return true;
    }
    case 'merchant_rug': {
      box(c, 1, 3, W - 2, H - 4, '#A96E75');
      r(3, 5, W - 6, H - 8, '#D9B783');
      r(5, 6, W - 10, H - 10, '#C68F89');
      for (let x = 1; x < W - 1; x += 3) {
        r(x, 2, 1, 1, WOOD_L);
        r(x, H - 1, 1, 1, WOOD_L);
      }
      oval(c, 8, 9, 3, 2, '#79AAA4');
      r(7, 8, 2, 1, CREAM);
      box(c, 14, 6, 5, 5, '#F3E9CF');
      r(15, 7, 3, 1, '#C68F89');
      star(c, 25, 9, 3, '#D9B783');
      return true;
    }
    case 'event_stand':
    case 'jar_stall': {
      const col = typeof state === 'string' ? state : '#C68F89';
      for (const x of [2, W - 4]) plank(c, x, 5, 2, H - 5, WOOD_D);
      poly(
        c,
        [
          [0, 7],
          [3, 2],
          [W - 3, 2],
          [W, 7],
        ],
        tint(col, -0.25),
      );
      for (let x = 1; x < W - 1; x += 4) {
        r(x, 4, 4, 4, x % 8 === 1 ? col : CREAM);
        r(x, 8, 4, 2, x % 8 === 1 ? tint(col, -0.2) : '#D5C5A4');
      }
      plank(c, 0, H - 7, W, 3, WOOD);
      box(c, 1, H - 4, W - 2, 4, WOOD);
      for (let x = 5; x < W - 3; x += 5) r(x, H - 3, 1, 2, WOOD_D);
      for (const [x, y, v] of [
        [5, H - 10, '#79AAA4'],
        [W / 2, H - 9, '#C68F89'],
        [W - 6, H - 11, '#D9B783'],
      ]) {
        oval(c, x, y, 2, 2, v);
        r(x - 1, y - 1, 1, 1, CREAM);
      }
      if (name === 'event_stand') {
        line(c, W / 2, 0, W / 2, 3, WOOD_D);
        r(W / 2 + 1, 0, 4, 2, '#D9B783');
      }
      return true;
    }
    case 'heart': {
      for (const [x, y, w, v] of [
        [1, 0, 2, '#C68F89'],
        [4, 0, 2, '#C68F89'],
        [0, 1, 7, '#A96E75'],
        [0, 2, 7, '#C68F89'],
        [1, 3, 5, '#C68F89'],
        [2, 4, 3, '#A96E75'],
        [3, 5, 1, '#A96E75'],
      ])
        r(x, y, w, 1, v);
      r(1, 1, 2, 1, '#F3D6C4');
      r(1, 2, 1, 1, '#E4B4A3');
      r(4, 3, 1, 1, '#E4B4A3');
      return true;
    }
    case 'note': {
      line(c, 2, 5, 2, 1, INK);
      r(2, 0, 4, 2, INK);
      r(3, 0, 2, 1, '#6F925B');
      oval(c, 1, 6, 1, 1, INK);
      oval(c, 4, 5, 1, 1, INK);
      r(5, 2, 1, 3, INK);
      return true;
    }
    case 'bubble': {
      oval(c, 3, 3, 2, 2, '#507F83');
      oval(c, 3, 3, 1, 1, '#79AAA4');
      r(1, 2, 1, 2, CREAM);
      r(2, 1, 2, 1, CREAM);
      r(3, 4, 1, 1, '#B7D4BD');
      return true;
    }
    case 'sparkle': {
      poly(
        c,
        [
          [3, 0],
          [4, 2],
          [7, 3],
          [4, 4],
          [3, 7],
          [2, 4],
          [0, 3],
          [2, 2],
        ],
        '#D9B783',
      );
      r(3, 1, 1, 5, '#F3E9CF');
      r(1, 3, 5, 1, '#F3E9CF');
      r(3, 2, 1, 2, CREAM);
      return true;
    }
    case 'zzz': {
      r(1, 0, 5, 1, '#9DBA74');
      r(0, 1, 5, 1, INK);
      r(3, 2, 1, 1, INK);
      r(2, 3, 1, 1, INK);
      r(1, 4, 5, 1, INK);
      r(0, 5, 5, 1, '#6F925B');
      return true;
    }
    case 'request': {
      box(c, 0, 0, 7, 7, '#D5C5A4');
      r(1, 1, 5, 4, CREAM);
      r(3, 1, 1, 3, '#A96E75');
      r(3, 5, 1, 1, '#C68F89');
      r(2, 7, 3, 1, '#D5C5A4');
      r(3, 8, 1, 1, '#D5C5A4');
      return true;
    }
    case 'dig_site': {
      poly(
        c,
        [
          [2, 8],
          [5, 6],
          [12, 7],
          [15, 11],
          [10, 15],
          [3, 13],
          [0, 11],
        ],
        '#775B46',
      );
      r(3, 8, 8, 1, '#B88D60');
      line(c, 2, 10, 12, 12, '#29372F');
      line(c, 6, 8, 9, 14, '#29372F');
      line(c, 5, 7, 11, 8, '#D5C5A4', 2);
      oval(c, 5, 7, 1, 1, CREAM);
      oval(c, 11, 8, 1, 1, CREAM);
      r(12, 6, 2, 1, '#D9B783');
      return true;
    }
    default:
      return false;
  }
}
