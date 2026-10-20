import { sprite } from './sprites.js';
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
  paintHouse,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { star } from './furniture-details.js';
const urls = new Map();

// Every app has its own silhouette, not just a recoloured shared pictogram.
export function phoneIconURL(id) {
  if (urls.has(id)) return urls.get(id);
  const src = sprite('phone_' + id, 26, 26, (c) => {
    const r = (x, y, w, h, col) => R(c, x, y, w, h, col),
      b = (x, y, w, h, col) => box(c, x, y, w, h, col),
      e = (x, y, rx, ry, col) => oval(c, x, y, rx, ry, col),
      heart = (x, y) => {
        e(x - 2, y, 2, 2, '#C68F89');
        e(x + 2, y, 2, 2, '#C68F89');
        poly(
          c,
          [
            [x - 4, y],
            [x + 4, y],
            [x, y + 5],
          ],
          '#C68F89',
        );
        r(x - 2, y - 1, 1, 1, '#E4B4A3');
      };
    switch (id) {
      case 'today':
        b(2, 3, 20, 15, '#D5C5A4');
        b(3, 3, 18, 13, CREAM);
        poly(
          c,
          [
            [7, 15],
            [12, 15],
            [7, 21],
          ],
          '#F3E9CF',
        );
        heart(12, 8);
        r(20, 17, 3, 3, '#9DBA74');
        r(19, 20, 2, 2, '#6F925B');
        break;
      case 'questions':
        poly(
          c,
          [
            [2, 5],
            [10, 4],
            [13, 6],
            [16, 4],
            [24, 5],
            [24, 21],
            [16, 20],
            [13, 22],
            [10, 20],
            [2, 21],
          ],
          WOOD_D,
        );
        r(3, 6, 8, 13, CREAM);
        r(15, 6, 8, 13, '#F3E9CF');
        r(12, 7, 2, 14, WOOD);
        for (const y of [9, 12, 15]) {
          r(5, y, 5, 1, '#D5C5A4');
          r(16, y, 5, 1, '#D5C5A4');
        }
        heart(18, 8);
        break;
      case 'missions':
        line(c, 6, 2, 6, 23, WOOD_D, 2);
        poly(
          c,
          [
            [8, 3],
            [22, 4],
            [19, 9],
            [22, 13],
            [8, 12],
          ],
          '#79AAA4',
        );
        star(c, 14, 7, 3, CREAM);
        plank(c, 3, 22, 9, 2, WOOD);
        r(18, 18, 2, 3, '#E8C25A');
        r(17, 19, 4, 1, '#E8C25A');
        break;
      case 'mail':
        b(2, 8, 22, 15, '#D5C5A4');
        r(3, 9, 19, 11, CREAM);
        line(c, 3, 9, 13, 16, '#C68F89');
        line(c, 13, 16, 23, 9, '#C68F89');
        line(c, 3, 20, 9, 15, '#D5C5A4');
        line(c, 22, 20, 17, 15, '#D5C5A4');
        heart(13, 5);
        break;
      case 'dates':
        b(4, 5, 19, 19, '#D5C5A4');
        r(5, 6, 16, 15, CREAM);
        r(5, 6, 16, 4, '#C68F89');
        for (const x of [8, 17]) b(x, 3, 2, 5, WOOD_D);
        heart(13, 15);
        r(7, 12, 2, 2, '#D5C5A4');
        r(18, 12, 2, 2, '#D5C5A4');
        break;
      case 'dreams':
        e(8, 17, 6, 4, '#D5C5A4');
        e(14, 14, 7, 6, '#F3E9CF');
        e(20, 17, 5, 4, CREAM);
        star(c, 12, 7, 6, '#D9B783');
        r(20, 3, 1, 3, CREAM);
        r(19, 4, 3, 1, CREAM);
        break;
      case 'journal':
        b(4, 3, 18, 21, WOOD_D);
        b(4, 2, 16, 20, WOOD);
        r(6, 3, 1, 17, WOOD_L);
        b(10, 7, 7, 8, '#F3E9CF');
        leaf(c, 13, 10, 3, 2, '#6F925B');
        r(17, 16, 2, 7, '#C68F89');
        break;
      case 'scrapbook':
        b(2, 6, 16, 18, WOOD_D);
        r(3, 7, 14, 14, CREAM);
        r(4, 9, 12, 8, '#79AAA4');
        poly(
          c,
          [
            [4, 16],
            [9, 11],
            [15, 16],
          ],
          '#6F925B',
        );
        b(10, 2, 14, 16, '#D5C5A4');
        r(11, 3, 12, 11, CREAM);
        r(12, 4, 10, 8, '#E4B4A3');
        heart(17, 6);
        break;
      case 'discoveries':
        line(c, 4, 23, 10, 16, WOOD_D, 4);
        e(15, 10, 9, 9, WOOD_D);
        e(14, 9, 7, 7, '#B7D4BD');
        leaf(c, 14, 10, 4, 2, '#6F925B');
        r(10, 5, 2, 2, CREAM);
        flower(c, 17, 8, '#C68F89');
        break;
      case 'hangout':
        e(8, 21, 7, 2, '#D5C5A4');
        e(19, 21, 6, 2, '#D5C5A4');
        b(3, 10, 9, 10, CREAM);
        b(14, 10, 9, 10, '#E4B4A3');
        e(7, 10, 3, 1, WOOD);
        e(18, 10, 3, 1, WOOD_D);
        r(12, 12, 2, 5, '#D5C5A4');
        line(c, 6, 4, 8, 7, '#D5C5A4');
        line(c, 17, 3, 18, 7, '#E4B4A3');
        heart(13, 4);
        break;
      case 'bag':
        b(5, 8, 17, 16, WOOD);
        b(9, 3, 8, 6, WOOD_D);
        r(10, 4, 5, 3, '#F3E9CF');
        b(8, 15, 11, 7, '#C68F89');
        r(10, 15, 7, 1, '#E4B4A3');
        r(6, 10, 1, 11, WOOD_L);
        r(21, 10, 2, 11, WOOD_D);
        break;
      case 'log':
        b(3, 3, 19, 21, '#507F83');
        r(5, 4, 1, 17, '#B7D4BD');
        b(8, 7, 11, 11, CREAM);
        e(12, 12, 4, 2, '#79AAA4');
        poly(
          c,
          [
            [15, 12],
            [19, 9],
            [19, 15],
          ],
          '#507F83',
        );
        r(10, 11, 1, 1, INK);
        r(8, 20, 10, 1, '#B7D4BD');
        break;
      case 'cooking':
        b(3, 11, 20, 11, '#507F83');
        e(13, 11, 10, 4, '#D5C5A4');
        e(12, 10, 8, 2, CREAM);
        e(12, 10, 6, 1, '#C68F89');
        r(2, 14, 3, 3, WOOD_D);
        r(22, 14, 3, 3, WOOD_D);
        line(c, 8, 3, 9, 7, '#D5C5A4');
        line(c, 16, 2, 17, 7, '#D5C5A4');
        r(5, 14, 2, 5, '#B7D4BD');
        break;
      case 'diy':
        plank(c, 2, 16, 22, 7, WOOD);
        r(4, 17, 17, 1, WOOD_L);
        line(c, 8, 16, 17, 4, WOOD_D, 3);
        poly(
          c,
          [
            [10, 5],
            [14, 1],
            [22, 4],
            [23, 8],
            [17, 6],
            [13, 10],
          ],
          '#9A958A',
        );
        r(14, 3, 5, 1, '#C4BFB3');
        r(5, 13, 1, 5, INK);
        r(4, 13, 3, 1, INK);
        break;
      case 'tools':
        line(c, 5, 23, 17, 7, '#9A958A', 3);
        poly(
          c,
          [
            [14, 8],
            [13, 3],
            [17, 0],
            [17, 5],
            [20, 6],
            [24, 3],
            [23, 9],
            [18, 11],
          ],
          '#C4BFB3',
        );
        line(c, 21, 22, 7, 5, WOOD_D, 2);
        b(3, 2, 5, 7, '#C68F89');
        r(4, 3, 1, 4, '#E4B4A3');
        break;
      case 'wardrobe':
        poly(
          c,
          [
            [8, 4],
            [11, 6],
            [15, 6],
            [18, 4],
            [24, 9],
            [20, 14],
            [17, 12],
            [18, 24],
            [7, 24],
            [8, 12],
            [5, 14],
            [2, 9],
          ],
          CREAM,
        );
        r(9, 10, 8, 11, '#C68F89');
        r(10, 8, 1, 5, '#A96E75');
        r(15, 8, 1, 5, '#A96E75');
        r(12, 15, 3, 1, '#E4B4A3');
        break;
      case 'build':
        b(6, 3, 15, 10, WOOD);
        r(8, 5, 10, 5, '#C68F89');
        plank(c, 5, 14, 17, 4, WOOD);
        for (const x of [7, 18]) plank(c, x, 18, 2, 6, WOOD_D);
        r(2, 2, 2, 21, '#D9B783');
        for (const y of [4, 8, 12, 16, 20]) r(2, y, 2, 1, WOOD_D);
        break;
      case 'home':
        c.save();
        c.translate(1, 1);
        paintHouse(c, 24, 24, { wall: '#E9DCC0', roofColor: '#A96E75' });
        c.restore();
        break;
      case 'shop':
        for (const x of [4, 21]) plank(c, x, 7, 2, 17, WOOD_D);
        poly(
          c,
          [
            [2, 8],
            [5, 2],
            [21, 2],
            [24, 8],
          ],
          '#A96E75',
        );
        for (let x = 3; x < 23; x += 4) {
          r(x, 4, 4, 5, x % 8 === 3 ? '#C68F89' : CREAM);
          r(x, 9, 4, 2, x % 8 === 3 ? '#A96E75' : '#D5C5A4');
        }
        plank(c, 2, 18, 22, 6, WOOD);
        e(9, 17, 3, 2, '#9DBA74');
        e(17, 17, 3, 2, '#C68F89');
        break;
      case 'jars':
        b(4, 4, 18, 20, '#507F83');
        r(6, 6, 14, 15, '#B7D4BD');
        r(5, 3, 16, 3, WOOD);
        r(6, 18, 14, 4, WOOD);
        leaf(c, 11, 14, 4, 2, '#6F925B');
        leaf(c, 16, 11, 3, 2, '#9DBA74');
        r(12, 12, 1, 7, '#3F604A');
        r(6, 7, 1, 9, CREAM);
        break;
      case 'events':
        line(c, 2, 3, 24, 3, WOOD_D);
        for (const [x, v] of [
          [3, '#C68F89'],
          [9, '#79AAA4'],
          [15, '#D9B783'],
          [21, '#A99CC9'],
        ])
          poly(
            c,
            [
              [x, 4],
              [x + 3, 4],
              [x + 1, 9],
            ],
            v,
          );
        poly(
          c,
          [
            [3, 23],
            [13, 10],
            [23, 23],
          ],
          '#C68F89',
        );
        poly(
          c,
          [
            [9, 23],
            [13, 15],
            [17, 23],
          ],
          INK,
        );
        r(13, 8, 1, 3, WOOD_D);
        break;
      case 'friends':
        for (const [x, y, v] of [
          [8, 9, '#D9B783'],
          [18, 16, '#79AAA4'],
        ]) {
          e(x, y, 5, 4, v);
          e(x - 3, y - 4, 2, 2, v);
          e(x + 3, y - 4, 2, 2, v);
          r(x - 2, y, 1, 1, INK);
          r(x + 2, y, 1, 1, INK);
          r(x, y + 2, 1, 1, INK);
        }
        break;
      case 'weather':
        e(9, 8, 5, 5, '#D9B783');
        for (const [x, y] of [
          [2, 7],
          [8, 1],
          [15, 4],
        ])
          r(x, y, 2, 2, CREAM);
        e(15, 13, 7, 4, CREAM);
        e(10, 15, 6, 4, '#F3E9CF');
        for (const x of [7, 13, 19]) r(x, 20, 1, 4, '#79AAA4');
        break;
      case 'lore':
        b(5, 4, 16, 19, '#D5C5A4');
        r(7, 5, 12, 15, '#F3E9CF');
        b(3, 3, 5, 5, CREAM);
        b(17, 19, 6, 5, CREAM);
        for (const y of [8, 11, 14]) r(9, y, 8 - (y % 3), 1, WOOD_L);
        r(12, 5, 1, 16, '#C68F89');
        r(11, 13, 3, 3, '#A96E75');
        break;
      case 'map':
        poly(
          c,
          [
            [2, 6],
            [9, 3],
            [17, 6],
            [24, 3],
            [24, 21],
            [17, 24],
            [9, 21],
            [2, 24],
          ],
          WOOD_L,
        );
        poly(
          c,
          [
            [3, 7],
            [9, 5],
            [9, 19],
            [3, 22],
          ],
          '#F3E9CF',
        );
        poly(
          c,
          [
            [10, 5],
            [16, 7],
            [16, 22],
            [10, 20],
          ],
          '#D5C5A4',
        );
        poly(
          c,
          [
            [17, 7],
            [23, 5],
            [23, 20],
            [17, 22],
          ],
          CREAM,
        );
        line(c, 5, 17, 11, 11, '#79AAA4', 2);
        line(c, 11, 11, 18, 16, '#79AAA4', 2);
        star(c, 19, 10, 3, '#C68F89');
        break;
      case 'museum':
        roof(c, 2, 2, 22, 7, '#C68F89');
        r(3, 9, 20, 3, '#D5C5A4');
        for (const x of [5, 12, 19]) b(x, 12, 3, 10, CREAM);
        plank(c, 2, 22, 23, 3, '#D5C5A4');
        r(10, 6, 7, 1, CREAM);
        e(10, 6, 1, 1, CREAM);
        e(17, 6, 1, 1, CREAM);
        break;
      case 'mine':
        poly(
          c,
          [
            [1, 23],
            [4, 9],
            [10, 3],
            [17, 3],
            [23, 10],
            [25, 23],
          ],
          '#8E897E',
        );
        poly(
          c,
          [
            [6, 23],
            [8, 12],
            [12, 8],
            [17, 9],
            [20, 23],
          ],
          INK,
        );
        poly(
          c,
          [
            [4, 16],
            [6, 12],
            [9, 16],
            [8, 23],
            [4, 23],
          ],
          '#A99CC9',
        );
        r(5, 16, 1, 5, '#D5C5A4');
        r(19, 9, 3, 2, '#C4BFB3');
        r(14, 10, 1, 8, WOOD);
        r(11, 16, 7, 1, WOOD_L);
        break;
      case 'settings':
        for (const [x, y, w, h] of [
          [10, 2, 6, 5],
          [10, 20, 6, 5],
          [2, 10, 5, 6],
          [20, 10, 5, 6],
          [5, 5, 4, 4],
          [17, 5, 4, 4],
          [5, 17, 4, 4],
          [17, 17, 4, 4],
        ])
          r(x, y, w, h, '#D5C5A4');
        e(13, 13, 9, 9, CREAM);
        e(13, 13, 5, 5, WOOD_D);
        e(12, 12, 3, 3, '#79AAA4');
        r(8, 7, 3, 1, '#FFF7E4');
        break;
      default:
        return;
    }
  });
  const url = src instanceof HTMLImageElement ? src.src : src.toDataURL();
  urls.set(id, url);
  return url;
}
