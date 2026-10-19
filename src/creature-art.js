import { R, oval, poly, line, box, tint, INK, CREAM, WOOD_D } from './art-style.js';
// Small creatures have real head/body/limb silhouettes; the colour options remain data-driven.
export function paintCritter(c, shape, col, accent, frame) {
  const d = tint(col, -0.25),
    l = tint(col, 0.25),
    a = accent || '#E4B4A3',
    up = frame ? 1 : 0,
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v),
    eye = (x, y) => r(x, y - up, 1, 1, INK);
  const body = (x, y, rx, ry) => {
      e(x, y, rx, ry, d);
      e(x - 1, y - 1, rx - 1, ry - 1, col);
    },
    face = (x, y) => {
      e(x, y - up, 3, 3, col);
      eye(x + 1, y - 1);
      r(x + 2, y + 1 - up, 1, 1, a);
    };
  switch (shape) {
    case 'bird':
    case 'duck':
    case 'duckling':
    case 'penguin':
    case 'owl':
    case 'crane':
    case 'pelican': {
      const sm = shape === 'duckling';
      body(7, 12 - up, sm ? 4 : 5, sm ? 3 : 4);
      face(10, sm ? 9 : 6);
      r(12, (sm ? 9 : 6) - up, shape === 'pelican' ? 4 : 3, shape === 'pelican' ? 3 : 1, a);
      e(5, 11 - up, 3, 2, l);
      r(5, 16, 2, 2, '#B88D60');
      r(9, 16, 2, 2, '#B88D60');
      if (shape === 'owl') {
        e(6, 6 - up, 2, 2, CREAM);
        e(10, 6 - up, 2, 2, CREAM);
        eye(6, 6);
        eye(10, 6);
        r(4, 2 - up, 2, 2, d);
        r(10, 2 - up, 2, 2, d);
      }
      if (shape === 'penguin') e(8, 12 - up, 2, 3, CREAM);
      if (shape === 'crane') {
        r(7, 2 - up, 3, 2, a);
        r(6, 15, 1, 3, WOOD_D);
        r(10, 15, 1, 3, WOOD_D);
      }
      return true;
    }
    case 'squirrel':
      body(10, 13, 3, 4);
      face(11, 8);
      e(4, 8 - up, 4, 6, d);
      e(3, 7 - up, 3, 4, l);
      e(4, 8 - up, 1, 2, col);
      r(10, 3 - up, 2, 3, col);
      r(8, 16, 2, 2, d);
      r(12, 16, 2, 2, d);
      r(10, 11 - up, 2, 2, CREAM);
      return true;
    case 'hedgehog':
      body(7, 12, 6, 5);
      for (let x = 2; x < 12; x += 2) {
        r(x, 7 - up + (x % 4), 1, 2, d);
        r(x, 10, 1, 1, l);
      }
      e(12, 12, 3, 2, '#D9C9A0');
      eye(12, 11);
      r(15, 12, 1, 1, INK);
      r(4, 16, 2, 2, d);
      r(10, 16, 2, 2, d);
      return true;
    case 'cat':
      body(7, 13 - up, 4, 4);
      face(8, 6);
      poly(
        c,
        [
          [4, 4 - up],
          [4, 0],
          [7, 3 - up],
        ],
        col,
      );
      poly(
        c,
        [
          [9, 3 - up],
          [12, 0],
          [12, 4 - up],
        ],
        col,
      );
      r(5, 2, 1, 1, a);
      r(10, 2, 1, 1, a);
      eye(6, 6);
      eye(9, 6);
      r(6, 9 - up, 4, 1, a);
      line(c, 11, 14, 14, 12, d, 2);
      line(c, 14, 12, 14, 8, col);
      r(4, 16, 3, 2, d);
      r(8, 16, 3, 2, d);
      return true;
    case 'turtle':
      e(7, 11, 6, 5, d);
      e(6, 10, 5, 4, accent || '#8E7A4E');
      e(12, 8 - up, 3, 3, col);
      eye(13, 7);
      r(3, 15, 2, 3, col);
      r(10, 15, 2, 3, col);
      r(5, 8, 3, 1, l);
      r(7, 10, 2, 2, l);
      r(4, 12, 2, 1, l);
      r(9, 12, 2, 1, l);
      return true;
    case 'snail':
      r(1, 15, 14, 2, '#D5C5A4');
      r(11, 10 - up, 1, 5, '#D5C5A4');
      eye(11, 9);
      e(6, 10, 5, 5, d);
      e(5, 9, 4, 4, col);
      e(6, 10, 2, 2, d);
      r(5, 9, 2, 1, l);
      r(6, 10, 1, 2, col);
      return true;
    case 'crab':
      body(8, 12 - up, 5, 3);
      for (const x of [2, 5, 10, 13]) line(c, x, 14, x - 1, 17, d);
      box(c, 0, 8 - up, 4, 4, col);
      box(c, 12, 8 - up, 4, 4, col);
      r(5, 7 - up, 1, 3, d);
      r(10, 7 - up, 1, 3, d);
      eye(5, 7);
      eye(10, 7);
      return true;
    case 'bee':
    case 'moth': {
      const yy = up ? 2 : 5;
      for (const x of [3, 11]) {
        e(x, yy + 3, 3, 4, shape === 'bee' ? '#B7D4BD' : l);
        e(x, yy + 6, 2, 2, col);
      }
      e(8, 10 - up, 3, 4, d);
      e(8, 9 - up, 2, 3, col);
      r(6, 9 - up, 5, 1, INK);
      r(6, 12 - up, 4, 1, INK);
      r(6, 4 - up, 1, 3, d);
      r(10, 4 - up, 1, 3, d);
      eye(8, 6);
      return true;
    }
    case 'bat':
      e(8, 9 - up, 3, 4, col);
      for (const sign of [-1, 1])
        poly(
          c,
          [
            [8 + sign * 2, 6],
            [8 + sign * 7, 3 + up * 4],
            [8 + sign * 6, 11 - up],
            [8 + sign * 3, 10],
          ],
          d,
        );
      r(6, 3, 1, 3, col);
      r(10, 3, 1, 3, col);
      eye(7, 8);
      eye(9, 8);
      return true;
    case 'snake':
      for (let x = 1; x < 13; x++)
        r(x, 13 + Math.round(Math.sin(x * 0.55 + up) * 2), 2, 3, x % 4 === 0 ? a : col);
      face(12, 11);
      r(15, 12, 1, 1, '#C68F89');
      return true;
    case 'shroom':
      r(5, 9 - up, 6, 8, CREAM);
      e(8, 7 - up, 7, 5, d);
      e(7, 6 - up, 6, 4, col);
      r(4, 4 - up, 2, 2, CREAM);
      r(10, 5 - up, 2, 1, CREAM);
      eye(6, 12);
      eye(9, 12);
      r(5, 17, 2, 1, WOOD_D);
      r(9, 17, 2, 1, WOOD_D);
      return true;
    default: {
      const low = [
          'capybara',
          'lizard',
          'toad',
          'otter',
          'seal',
          'mole',
          'mouse',
          'sloth',
        ].includes(shape),
        hx = low ? 11 : 9,
        hy = low ? 10 : 6;
      body(low ? 7 : 8, 13 - up, low ? 6 : 4, 4);
      face(hx, hy);
      r(3, 16, 3, 2, d);
      r(10, 16, 3, 2, d);
      r(6, 12 - up, 3, 2, l);
      if (['bunny', 'fox', 'deer'].includes(shape)) {
        const hh = shape === 'bunny' ? 5 : 3;
        r(hx - 3, hy - 5 - up, 2, hh, col);
        r(hx + 1, hy - 5 - up, 2, hh, col);
        r(hx - 2, hy - 4 - up, 1, hh - 1, a);
        if (shape === 'deer') {
          r(5, 0, 1, 3, WOOD_D);
          r(11, 0, 1, 3, WOOD_D);
        }
      } else {
        e(hx - 2, hy - 3 - up, 1, 2, d);
        e(hx + 2, hy - 3 - up, 1, 2, d);
      }
      if (shape === 'fox') {
        poly(
          c,
          [
            [1, 10],
            [4, 13],
            [4, 16],
            [0, 14],
          ],
          l,
        );
        r(0, 11, 1, 2, CREAM);
      }
      if (shape === 'mouse') line(c, 1, 16, 4, 14, a);
      if (shape === 'bear') e(8, 13, 2, 2, l);
      if (shape === 'sloth') {
        r(8, hy - 1 - up, 4, 2, l);
        eye(8, hy);
        eye(11, hy);
      }
      if (shape === 'camel') e(6, 8 - up, 3, 3, d);
      if (shape === 'seal') {
        r(1, 15, 3, 2, d);
        r(6, 17, 3, 1, d);
      }
      return true;
    }
  }
}
export function paintResident(c, species, frame, sleeping, water) {
  const up = frame ? 1 : 0,
    r = (x, y, w, h, col) => R(c, x, y, w, h, col);
  if (species === 'marimo') {
    oval(c, 6, 7, 5, 5, '#3F604A');
    oval(c, 5, 6, 4, 4, '#6F925B');
    for (const [x, y] of [
      [3, 4],
      [6, 3],
      [7, 6],
      [4, 7],
      [8, 8],
    ])
      r(x, y, 2, 1, '#9DBA74');
    r(5, 9, 2, 1, '#3F604A');
  } else if (species === 'frog') {
    oval(c, 7, 8 - up, 5, 4, '#3F604A');
    oval(c, 6, 7 - up, 4, 3, '#6F925B');
    oval(c, 4, 4 - up, 2, 2, '#9DBA74');
    oval(c, 10, 4 - up, 2, 2, '#9DBA74');
    r(3, 4 - up, sleeping ? 2 : 1, 1, INK);
    r(9, 4 - up, sleeping ? 2 : 1, 1, INK);
    r(5, 8 - up, 4, 2, '#C2CE95');
    r(1, 10, 4, 2, '#6F925B');
    r(9, 10, 4, 2, '#6F925B');
    r(6, 7 - up, 2, 1, '#3F604A');
  } else if (species === 'turtle') {
    for (const x of [2, 10]) r(x, 9, 3, 3, '#9DBA74');
    oval(c, 13, 7, 3, 3, '#9DBA74');
    r(14, 6, sleeping ? 2 : 1, 1, INK);
    oval(c, 7, 7, 6, 5, '#775B46');
    oval(c, 6, 6, 5, 4, '#B88D60');
    r(4, 4, 4, 1, '#D9B783');
    r(7, 6, 2, 2, '#D9B783');
    r(4, 8, 2, 1, '#D9B783');
    r(10, 8, 1, 2, '#775B46');
  } else if (species === 'snail') {
    r(1, 9, 13, 2, '#D5C5A4');
    r(11, 5 - up, 1, 4, '#F3E9CF');
    r(13, 4 - up, 1, 5, '#F3E9CF');
    r(11, 4 - up, 1, 1, INK);
    r(13, 3 - up, 1, 1, INK);
    oval(c, 6, 5, 5, 5, '#A96E75');
    oval(c, 5, 4, 4, 4, '#C68F89');
    oval(c, 6, 5, 2, 2, '#A96E75');
    r(5, 4, 2, 1, '#E4B4A3');
    r(6, 5, 1, 2, '#C68F89');
  } else if (species === 'bunny') {
    oval(c, 6, 8 - up, 5, 4, '#D5C5A4');
    oval(c, 5, 7 - up, 4, 3, CREAM);
    oval(c, 10, 5 - up, 3, 3, CREAM);
    oval(c, 2, 7 - up, 2, 2, CREAM);
    r(3, 11, 4, 1, '#D5C5A4');
    r(8, 10, 4, 2, CREAM);
    r(9, 0, 1, 4, CREAM);
    r(12, 0, 1, 4, CREAM);
    r(12, 1, 1, 2, '#E4B4A3');
    r(11, 5 - up, sleeping ? 2 : 1, 1, INK);
    r(13, 6 - up, 1, 1, '#C68F89');
  } else return false;
  if (water)
    for (let x = 1; x < (species === 'turtle' ? 15 : 11); x += 3) r(x, 10, 2, 1, '#B7D4BD');
  return true;
}
export function paintMonster(c, def, size, frame, flash) {
  const s = size / 16,
    r = (x, y, w, h, col) => R(c, x * s, y * s, w * s, h * s, col),
    e = (x, y, rx, ry, col) =>
      oval(
        c,
        Math.round(x * s),
        Math.round(y * s),
        Math.max(1, Math.round(rx * s)),
        Math.max(1, Math.round(ry * s)),
        col,
      ),
    p = (pts, col) =>
      poly(
        c,
        pts.map(([x, y]) => [Math.round(x * s), Math.round(y * s)]),
        col,
      );
  const col = flash ? '#FFFFFF' : def.color,
    d = flash ? '#FFFFFF' : tint(col, -0.27),
    l = flash ? '#FFFFFF' : tint(col, 0.28),
    up = frame ? 1 : 0,
    eye = (y) => {
      r(5, y, 1, 1, INK);
      r(10, y, 1, 1, INK);
    };
  switch (def.shape) {
    case 'slime':
      p(
        [
          [1, 13],
          [2, 8 - up],
          [5, 5 - up],
          [10, 4],
          [14, 8],
          [15, 14],
          [10, 15],
          [5, 14],
        ],
        d,
      );
      e(8, 10 - up, 5, 4, col);
      r(4, 7 - up, 3, 1, l);
      r(3, 13, 2, 2, col);
      r(12, 13, 2, 2, col);
      eye(10);
      break;
    case 'grub':
    case 'wyrm':
      for (let n = 0; n < 5; n++) {
        const x = 2 + n * 2.5,
          y = 11 + Math.sin(n + up) * 1.5;
        e(x, y, 2.5, 3, d);
        e(x - 1, y - 1, 1.5, 2, col);
        r(x, y + 3, 1, 1, d);
      }
      e(13, 8, 2, 3, col);
      r(13, 7, 1, 1, INK);
      if (def.shape === 'wyrm') {
        p(
          [
            [11, 4],
            [13, 2],
            [14, 5],
          ],
          l,
        );
        r(10, 11, 1, 2, l);
      }
      break;
    case 'bat':
      for (const sign of [-1, 1])
        p(
          [
            [8 + sign * 2, 6],
            [8 + sign * 7, 2 + up * 3],
            [8 + sign * 6, 11 - up],
            [8 + sign * 3, 9],
          ],
          d,
        );
      e(8, 8, 3, 4, col);
      r(6, 3, 1, 3, col);
      r(10, 3, 1, 3, col);
      eye(8);
      break;
    case 'crab':
      e(8, 10, 5, 4, d);
      e(7, 9, 4, 3, col);
      for (const x of [2, 5, 11, 14]) r(x, 13, 1, 3, d);
      box(c, 0, Math.round((6 - up) * s), Math.round(3 * s), Math.round(4 * s), col);
      r(12, 6 - up, 3, 4, col);
      eye(8);
      r(6, 6, 3, 1, l);
      break;
    case 'wisp':
      p(
        [
          [7, 1],
          [12, 4],
          [13, 9],
          [10, 12],
          [11, 15],
          [7, 13],
          [4, 14],
          [3, 8],
          [5, 5],
        ],
        d,
      );
      e(8, 7 - up, 4, 5, col);
      r(5, 4, 2, 2, l);
      eye(7);
      break;
    case 'golem':
      for (const [x, y, w, h] of [
        [3, 4, 10, 8],
        [0, 7, 4, 6],
        [12, 7, 4, 6],
        [3, 12, 4, 4],
        [9, 12, 4, 4],
      ]) {
        box(c, Math.round(x * s), Math.round(y * s), Math.round(w * s), Math.round(h * s), col);
      }
      r(5, 7, 2, 2, l);
      r(10, 7, 2, 2, l);
      r(7, 10, 2, 1, d);
      break;
    case 'jelly':
      e(8, 6 - up, 6, 5, d);
      e(7, 5 - up, 5, 4, col);
      for (const [x, yy] of [
        [3, 13],
        [6, 15],
        [10, 14],
        [13, 12],
      ]) {
        r(x, 8 - up, 1, yy - 8, col);
        r(x + up, yy, 1, 1, col);
      }
      r(4, 3 - up, 3, 1, l);
      eye(5 - up);
      break;
    case 'moth':
      for (const sign of [-1, 1]) {
        e(8 + sign * 4, 6 - up, 3, 4, d);
        e(8 + sign * 4, 10, 2, 3, col);
        e(8 + sign * 4, 6 - up, 1, 2, l);
      }
      r(7, 4, 2, 9, col);
      r(6, 2, 1, 2, d);
      r(10, 2, 1, 2, d);
      eye(5);
      break;
  }
}
