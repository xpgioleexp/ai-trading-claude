import { paintAnimal } from './animal-art.js';
import { R, oval, poly, box, tint, INK, CREAM } from './art-style.js';
// Small creatures have real head/body/limb silhouettes; the colour options remain data-driven.
export function paintCritter(c, shape, col, accent, frame) {
  return paintAnimal(c, shape, col, accent, frame);
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
