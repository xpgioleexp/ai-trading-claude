import { R, oval, poly, line, tint, INK, CREAM, WOOD_D } from './art-style.js';

export const ANIMAL_SHAPES = new Set([
  'bird',
  'duck',
  'duckling',
  'penguin',
  'owl',
  'crane',
  'pelican',
  'squirrel',
  'hedgehog',
  'cat',
  'turtle',
  'snail',
  'crab',
  'bee',
  'moth',
  'bat',
  'snake',
  'shroom',
  'bunny',
  'fox',
  'deer',
  'bear',
  'camel',
  'capybara',
  'sloth',
  'monkey',
  'mouse',
  'mole',
  'otter',
  'seal',
  'lizard',
  'toad',
  'frog',
]);

// Each body plan has its own silhouette, gait, face, and appendages at 16 × 18.
export function paintAnimal(c, shape, col, accent, frame) {
  if (!ANIMAL_SHAPES.has(shape)) return false;
  const a = accent || '#E4B4A3',
    d = tint(col, -0.3),
    l = tint(col, 0.28),
    up = frame ? 1 : 0,
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v),
    ball = (x, y, rx, ry, v = col) => {
      e(x, y, rx, ry, tint(v, -0.25));
      e(x - 1, y - 1, Math.max(1, rx - 1), Math.max(1, ry - 1), v);
      r(x - rx + 2, y - ry + 1, Math.max(1, rx - 2), 1, tint(v, 0.22));
    },
    eyes = (x, y, both = true) => {
      r(x, y, 1, 2, INK);
      if (both) r(x + 4, y, 1, 2, INK);
    },
    paws = (x = 4, xx = 10, y = 16) => {
      r(x + up, y, 3, 2, d);
      r(xx - up, y, 3, 2, d);
      r(x + up, y, 2, 1, col);
    },
    ears = (x, y, long = false) => {
      for (const xx of [x, x + 6]) {
        ball(xx, y, long ? 1 : 2, long ? 4 : 2);
        r(xx, y - 1, 1, long ? 3 : 1, a);
      }
    };
  switch (shape) {
    case 'bird': {
      ball(7, 12 - up, 5, 4);
      ball(10, 6 - up, 3, 3);
      poly(
        c,
        [
          [3, 12],
          [0, 9],
          [1, 15],
          [5, 14],
        ],
        d,
      );
      ball(5, 11 - up, 3, 2, a);
      r(12, 6 - up, 3, 1, '#D9B783');
      eyes(10, 5 - up, false);
      r(7, 8 - up, 3, 1, CREAM);
      line(c, 5, 16, 5 - up, 17, WOOD_D);
      line(c, 9, 16, 10 + up, 17, WOOD_D);
      break;
    }
    case 'duck':
    case 'duckling': {
      const small = shape === 'duckling';
      ball(7, 12 - up, small ? 4 : 6, small ? 3 : 4);
      ball(10, 7 - up, small ? 2 : 3, 3);
      r(12, 7 - up, 4, 2, a);
      r(12, 8 - up, 3, 1, tint(a, -0.2));
      eyes(10, 6 - up, false);
      ball(5, 12 - up, 3, 2, l);
      r(3, 11, 1, 2, CREAM);
      r(5, 17, 3, 1, WOOD_D);
      r(10, 17, 3, 1, WOOD_D);
      break;
    }
    case 'penguin': {
      ball(8, 10 - up, 5, 7);
      e(8, 12 - up, 3, 4, CREAM);
      ball(8, 4 - up, 3, 3);
      e(6, 5 - up, 1, 2, CREAM);
      e(10, 5 - up, 1, 2, CREAM);
      eyes(6, 5 - up);
      r(7, 8 - up, 2, 1, a);
      line(c, 3, 9 - up, 1, 13 - up, d, 2);
      line(c, 13, 9 - up, 15, 13 - up, d, 2);
      r(3, 17, 4, 1, a);
      r(10, 17, 4, 1, a);
      break;
    }
    case 'owl': {
      ball(8, 10 - up, 6, 6);
      poly(
        c,
        [
          [2, 4],
          [3, 0],
          [6, 4],
        ],
        col,
      );
      poly(
        c,
        [
          [10, 4],
          [13, 0],
          [14, 4],
        ],
        col,
      );
      e(5, 7 - up, 3, 3, CREAM);
      e(11, 7 - up, 3, 3, CREAM);
      eyes(5, 7 - up, false);
      eyes(11, 7 - up, false);
      r(8, 9 - up, 1, 2, a);
      for (const [x, y] of [
        [5, 11],
        [9, 13],
        [7, 14],
      ])
        r(x, y - up, 1, 1, l);
      line(c, 3, 10, 4, 14, d);
      line(c, 13, 10, 12, 14, d);
      r(4, 17, 3, 1, WOOD_D);
      r(10, 17, 3, 1, WOOD_D);
      break;
    }
    case 'crane':
    case 'pelican': {
      const crane = shape === 'crane';
      ball(7, 11 - up, 5, 3);
      line(c, 9, 9 - up, 11, 3 - up, col, 2);
      ball(11, 3 - up, 2, 2);
      r(12, 3 - up, 4, crane ? 1 : 3, a);
      r(12, 5 - up, 3, 1, tint(a, -0.2));
      eyes(11, 2 - up, false);
      ball(5, 10 - up, 3, 2, l);
      for (const x of [6, 10]) {
        line(c, x, 14, x + (frame ? (x === 6 ? -1 : 1) : 0), 17, WOOD_D);
        r(x - 1, 17, 3, 1, WOOD_D);
      }
      if (crane) r(10, 0, 2, 1, a);
      break;
    }
    case 'bunny': {
      ears(5, 4 - up, true);
      ball(8, 12 - up, 5, 4);
      ball(8, 7 - up, 5, 4);
      eyes(5, 6 - up);
      r(7, 9 - up, 2, 1, a);
      e(3, 13, 2, 2, CREAM);
      e(11, 14 - up, 2, 2, l);
      paws();
      break;
    }
    case 'fox': {
      poly(
        c,
        [
          [1, 8],
          [5, 11],
          [5, 16],
          [1, 15],
          [0, 11],
        ],
        d,
      );
      poly(
        c,
        [
          [1, 9],
          [3, 11],
          [2, 13],
          [0, 11],
        ],
        CREAM,
      );
      ball(8, 13 - up, 4, 4);
      poly(
        c,
        [
          [5, 4 - up],
          [4, 0],
          [8, 3 - up],
          [12, 0],
          [13, 6 - up],
          [10, 10 - up],
          [6, 10 - up],
        ],
        col,
      );
      r(5, 2, 1, 2, a);
      r(11, 2, 1, 2, a);
      e(8, 8 - up, 4, 2, CREAM);
      eyes(6, 6 - up);
      r(8, 9 - up, 1, 1, INK);
      r(6, 12 - up, 4, 2, a);
      paws(5, 10);
      break;
    }
    case 'deer': {
      ball(7, 11 - up, 5, 3);
      line(c, 10, 10 - up, 11, 5 - up, col, 3);
      ball(11, 5 - up, 3, 2);
      leafEar(c, 7, 3 - up, col);
      leafEar(c, 13, 2 - up, col);
      line(c, 9, 2, 8, 0, WOOD_D);
      line(c, 12, 2, 13, 0, WOOD_D);
      r(8, 1, 1, 2, WOOD_D);
      r(13, 0, 2, 1, WOOD_D);
      eyes(12, 4 - up, false);
      r(14, 5 - up, 1, 1, INK);
      for (const x of [3, 6, 10, 12]) r(x + (x % 2 ? up : -up), 13, 1, 5, d);
      for (const [x, y] of [
        [4, 10],
        [7, 11],
        [8, 9],
      ])
        r(x, y - up, 1, 1, CREAM);
      break;
    }
    case 'bear': {
      ears(5, 3 - up);
      ball(8, 12 - up, 5, 5);
      ball(8, 6 - up, 5, 4);
      e(8, 8 - up, 3, 2, a);
      eyes(5, 5 - up);
      r(7, 7 - up, 2, 1, INK);
      e(8, 13 - up, 3, 2, l);
      r(2, 11 - up, 2, 4, col);
      r(12, 11 - up, 2, 4, d);
      paws(3, 10);
      break;
    }
    case 'cat': {
      ball(8, 12 - up, 4, 5);
      poly(
        c,
        [
          [3, 6],
          [3, 0],
          [7, 3],
          [9, 3],
          [13, 0],
          [13, 7],
          [11, 10],
          [5, 10],
        ],
        col,
      );
      r(4, 2, 1, 2, a);
      r(11, 2, 1, 2, a);
      eyes(5, 5 - up);
      r(7, 8 - up, 2, 1, a);
      line(c, 3, 8, 1, 7, l);
      line(c, 12, 8, 15, 7, l);
      line(c, 11, 15, 14, 12, d, 2);
      line(c, 14, 12, 14, 8, col, 2);
      e(8, 13 - up, 2, 2, a);
      paws(4, 9);
      break;
    }
    case 'squirrel': {
      ball(4, 8 - up, 4, 6, d);
      ball(3, 7 - up, 3, 4, l);
      e(4, 8 - up, 1, 2, col);
      ball(10, 13 - up, 4, 4);
      ball(10, 7 - up, 3, 3);
      ears(8, 3 - up);
      eyes(10, 6 - up, false);
      r(13, 8 - up, 1, 1, INK);
      e(10, 12 - up, 2, 2, CREAM);
      r(10, 11 - up, 2, 2, WOOD_D);
      paws(7, 11);
      break;
    }
    case 'hedgehog': {
      for (let x = 2; x < 12; x += 2)
        poly(
          c,
          [
            [x - 1, 10],
            [x, 5 + (x % 3)],
            [x + 2, 10],
          ],
          d,
        );
      ball(7, 12 - up, 6, 4);
      for (const [x, y] of [
        [3, 10],
        [6, 9],
        [8, 12],
        [4, 13],
      ])
        r(x, y, 1, 1, l);
      poly(
        c,
        [
          [10, 9],
          [15, 12],
          [12, 15],
          [8, 13],
        ],
        a,
      );
      eyes(12, 11, false);
      r(15, 12, 1, 1, INK);
      paws(3, 9);
      break;
    }
    case 'mouse': {
      line(c, 2, 16, 0, 13, a);
      line(c, 0, 13, 2, 12, a);
      ball(7, 12 - up, 5, 4);
      ears(6, 6 - up);
      ball(9, 9 - up, 4, 3);
      e(6, 6 - up, 1, 1, a);
      eyes(10, 8 - up, false);
      r(13, 10 - up, 1, 1, a);
      paws(4, 10);
      break;
    }
    case 'mole': {
      ball(8, 12 - up, 6, 5);
      ball(10, 9 - up, 4, 3);
      e(13, 10 - up, 2, 1, a);
      eyes(10, 8 - up, false);
      for (const x of [1, 11]) {
        e(x + 1, 15, 2, 2, a);
        r(x, 16, 3, 1, CREAM);
      }
      r(4, 9 - up, 3, 1, l);
      break;
    }
    case 'capybara': {
      ball(7, 12 - up, 6, 4);
      ball(11, 8 - up, 4, 3);
      r(10, 5 - up, 2, 2, d);
      r(13, 5 - up, 1, 2, col);
      r(12, 10 - up, 3, 1, a);
      eyes(12, 7 - up, false);
      r(14, 8 - up, 1, 1, INK);
      paws(3, 10);
      r(3, 11 - up, 3, 1, l);
      break;
    }
    case 'camel': {
      ball(7, 11 - up, 5, 3);
      ball(5, 8 - up, 2, 3);
      ball(8, 8 - up, 2, 3);
      line(c, 11, 11 - up, 12, 4 - up, col, 3);
      ball(12, 3 - up, 2, 2);
      r(13, 3 - up, 3, 2, a);
      r(11, 0, 1, 2, col);
      eyes(12, 2 - up, false);
      for (const x of [3, 6, 10, 12]) r(x + (x % 2 ? up : -up), 13, 1, 5, d);
      r(1, 12, 2, 1, d);
      break;
    }
    case 'sloth': {
      ball(8, 12 - up, 5, 5);
      ball(8, 6 - up, 5, 4);
      e(8, 7 - up, 4, 3, CREAM);
      line(c, 4, 6 - up, 6, 8 - up, d, 2);
      line(c, 12, 6 - up, 10, 8 - up, d, 2);
      eyes(5, 6 - up);
      r(8, 9 - up, 1, 1, INK);
      line(c, 3, 10, 2, 15, col, 2);
      line(c, 13, 10, 14, 15, col, 2);
      r(1, 15, 3, 1, CREAM);
      r(12, 15, 3, 1, CREAM);
      paws();
      break;
    }
    case 'monkey': {
      line(c, 3, 14, 0, 10, d, 2);
      line(c, 0, 10, 2, 7, col, 2);
      r(2, 7, 2, 1, l);
      ball(8, 12 - up, 4, 5);
      e(3, 6 - up, 2, 2, col);
      e(13, 6 - up, 2, 2, col);
      ball(8, 6 - up, 5, 4);
      e(8, 7 - up, 4, 3, a);
      eyes(5, 6 - up);
      r(8, 9 - up, 1, 1, INK);
      e(8, 13 - up, 2, 2, a);
      paws();
      break;
    }
    case 'otter': {
      ball(7, 12 - up, 5, 4);
      line(c, 3, 13, 0, 16, d, 2);
      ball(11, 7 - up, 4, 3);
      r(8, 4 - up, 2, 2, col);
      r(13, 4 - up, 1, 2, col);
      e(11, 9 - up, 3, 1, a);
      eyes(11, 6 - up, false);
      r(14, 8 - up, 1, 1, INK);
      e(8, 12 - up, 2, 2, a);
      r(8, 12 - up, 2, 1, '#9A958A');
      paws(4, 10);
      break;
    }
    case 'seal': {
      ball(8, 12 - up, 6, 4);
      ball(11, 7 - up, 4, 3);
      e(11, 9 - up, 3, 1, l);
      eyes(10, 6 - up, false);
      r(14, 8 - up, 1, 1, INK);
      poly(
        c,
        [
          [3, 13],
          [0, 10],
          [1, 16],
          [5, 15],
        ],
        d,
      );
      poly(
        c,
        [
          [9, 13],
          [12, 17],
          [6, 16],
        ],
        col,
      );
      r(4, 10 - up, 3, 1, l);
      break;
    }
    case 'lizard': {
      line(c, 4, 13, 0, 15, d, 2);
      ball(7, 12 - up, 5, 3);
      ball(12, 9 - up, 3, 2);
      eyes(12, 8 - up, false);
      for (const x of [4, 10]) {
        line(c, x, 12, x - 1, 16, col, 2);
        r(x - 2, 16, 3, 1, d);
      }
      for (const x of [4, 7, 10]) r(x, 10 - up, 1, 1, l);
      r(14, 10 - up, 2, 1, a);
      break;
    }
    case 'frog':
    case 'toad': {
      ball(8, 12 - up, 5, 4);
      e(8, 13 - up, 3, 2, a);
      for (const x of [4, 11]) {
        ball(x, 7 - up, 2, 3);
        r(x, 6 - up, 1, 2, INK);
        e(x - 1, 15, 3, 2, col);
      }
      r(6, 11 - up, 4, 1, d);
      r(5, 10 - up, 1, 1, l);
      r(11, 12 - up, 1, 1, l);
      break;
    }
    case 'turtle': {
      for (const x of [3, 11]) {
        e(x, 15, 2, 2, col);
        r(x - up, 16, 2, 2, d);
      }
      ball(7, 11, 6, 5, a);
      ball(12, 7 - up, 3, 3);
      eyes(13, 6 - up, false);
      poly(
        c,
        [
          [5, 7],
          [9, 7],
          [11, 11],
          [8, 14],
          [4, 12],
        ],
        tint(a, -0.2),
      );
      line(c, 5, 8, 8, 10, tint(a, 0.3));
      line(c, 8, 10, 8, 13, tint(a, 0.3));
      r(3, 10, 2, 1, tint(a, 0.3));
      break;
    }
    case 'snail': {
      r(1, 16, 14, 2, '#D5C5A4');
      line(c, 12, 16, 13, 10, '#D5C5A4', 2);
      r(12, 8 - up, 1, 4, WOOD_D);
      r(15, 9 - up, 1, 3, WOOD_D);
      eyes(12, 8 - up, false);
      ball(6, 11, 5, 5);
      e(6, 11, 3, 3, d);
      r(4, 9, 3, 1, l);
      r(7, 10, 1, 3, col);
      r(5, 12, 2, 1, col);
      break;
    }
    case 'crab': {
      for (const x of [2, 5, 10, 13]) line(c, x, 13, x + (x < 8 ? -1 : 1), 17, d);
      ball(8, 11 - up, 5, 3);
      for (const x of [1, 12]) {
        line(c, x + 1, 10, x + 1, 6 - up, col, 2);
        e(x + 1, 6 - up, 2, 2, col);
        r(x + 1, 4 - up, 1, 2, CREAM);
      }
      r(5, 5 - up, 1, 3, d);
      r(10, 5 - up, 1, 3, d);
      eyes(5, 5 - up, false);
      eyes(10, 5 - up, false);
      r(5, 10 - up, 3, 1, l);
      break;
    }
    case 'bee':
    case 'moth': {
      for (const x of [3, 12]) {
        ball(x, 6 + up, 3, shape === 'moth' ? 5 : 3, shape === 'moth' ? col : CREAM);
        if (shape === 'moth') {
          e(x, 11 - up, 2, 3, a);
          r(x, 5 + up, 1, 2, l);
        }
      }
      ball(8, 10, 3, 5);
      if (shape === 'bee') for (const y of [8, 11]) r(6, y, 4, 1, INK);
      r(5, 1, 1, 3, d);
      r(10, 1, 1, 3, d);
      eyes(6, 5);
      break;
    }
    case 'bat': {
      for (const s of [-1, 1]) {
        poly(
          c,
          [
            [8 + s, 7],
            [8 + s * 7, 2 + up * 3],
            [8 + s * 6, 12 - up],
            [8 + s * 4, 10],
            [8 + s * 2, 13],
          ],
          d,
        );
        line(c, 8 + s, 8, 8 + s * 6, 4 + up * 3, col);
      }
      ball(8, 9, 3, 4);
      r(5, 3, 2, 3, col);
      r(10, 3, 2, 3, col);
      eyes(6, 7);
      r(7, 11, 2, 1, a);
      break;
    }
    case 'snake': {
      for (let x = 0; x < 14; x++) {
        const y = 12 + Math.round(Math.sin(x * 0.65 + up * 0.7) * 2);
        r(x, y, 2, 3, d);
        r(x, y, 2, 2, col);
        if (x % 3 === 0) r(x, y, 1, 1, l);
      }
      ball(12, 9 - up, 3, 2);
      eyes(13, 8 - up, false);
      r(14, 11 - up, 2, 1, a);
      break;
    }
    case 'shroom': {
      boxStem(c, 5, 9, 6, 8, CREAM);
      ball(8, 6 - up, 7, 5);
      for (const [x, y] of [
        [4, 4],
        [10, 3],
        [11, 7],
      ])
        r(x, y - up, 2, 1, CREAM);
      eyes(6, 12);
      r(7, 15, 2, 1, a);
      paws(4, 10);
      break;
    }
  }
  return true;
}
function leafEar(c, x, y, col) {
  poly(
    c,
    [
      [x - 2, y + 1],
      [x, y - 2],
      [x + 2, y + 1],
    ],
    col,
  );
  R(c, x, y, 1, 1, tint(col, 0.35));
}
function boxStem(c, x, y, w, h, col) {
  R(c, x, y, w, h, '#D5C5A4');
  R(c, x + 1, y, w - 2, h, col);
  R(c, x + 1, y + 1, 1, h - 2, CREAM);
}
