import { sprite } from './sprites.js';
import {
  R,
  oval,
  poly,
  line,
  box,
  flower,
  roof,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
const urls = new Map();
export function phoneIconURL(id) {
  if (urls.has(id)) return urls.get(id);
  const c = sprite('phone_' + id, 26, 26, (ctx) => {
    const r = (x, y, w, h, col = CREAM) => R(ctx, x, y, w, h, col);
    if (['journal', 'questions', 'log', 'lore', 'scrapbook'].includes(id)) {
      box(ctx, 4, 4, 18, 19, WOOD_D);
      box(
        ctx,
        4,
        3,
        16,
        18,
        id === 'scrapbook' ? '#C68F89' : id === 'questions' ? '#A99CC9' : '#B88D60',
      );
      r(6, 4, 1, 15, WOOD_L);
      r(9, 7, 8, 8, CREAM);
      if (id === 'scrapbook') {
        r(10, 8, 6, 5, '#79AAA4');
        poly(
          ctx,
          [
            [10, 13],
            [12, 9],
            [16, 13],
          ],
          '#6F925B',
        );
      } else {
        r(11, 9, 5, 1, WOOD);
        r(11, 12, 3, 1, WOOD);
      }
      return;
    }
    if (['mail', 'today', 'hangout'].includes(id)) {
      box(ctx, 3, 7, 20, 14, CREAM);
      line(ctx, 4, 8, 13, 15, '#C68F89');
      line(ctx, 13, 15, 22, 8, '#C68F89');
      r(11, 9, 4, 3, '#C68F89');
      r(12, 12, 2, 1, '#A96E75');
      return;
    }
    if (['home', 'jars', 'build', 'shop'].includes(id)) {
      box(ctx, 5, 11, 16, 12, '#F3E9CF');
      roof(ctx, 2, 3, 22, 10, '#C68F89');
      box(ctx, 11, 16, 5, 7, WOOD_D);
      box(ctx, 7, 13, 4, 4, '#79AAA4');
      if (id === 'build') r(18, 8, 2, 5, WOOD);
      return;
    }
    if (['dates', 'events', 'missions'].includes(id)) {
      box(ctx, 4, 5, 18, 18, CREAM);
      r(5, 6, 16, 4, '#C68F89');
      r(8, 3, 2, 5, WOOD_D);
      r(17, 3, 2, 5, WOOD_D);
      for (let x = 7; x < 20; x += 5)
        for (let y = 12; y < 21; y += 4) r(x, y, 2, 2, id === 'missions' ? '#9DBA74' : '#D5C5A4');
      return;
    }
    if (['dreams', 'discoveries', 'map'].includes(id)) {
      box(ctx, 3, 5, 20, 17, '#F3E9CF');
      line(ctx, 9, 6, 9, 20, '#D5C5A4');
      line(ctx, 16, 6, 16, 20, '#D5C5A4');
      line(ctx, 5, 17, 12, 11, '#79AAA4', 2);
      line(ctx, 12, 11, 20, 16, '#79AAA4', 2);
      flower(ctx, 18, 10, '#C68F89');
      return;
    }
    if (['cooking', 'diy', 'tools', 'mine'].includes(id)) {
      if (id === 'cooking') {
        oval(ctx, 12, 15, 9, 7, WOOD_D);
        oval(ctx, 12, 13, 8, 5, CREAM);
        r(7, 11, 11, 5, '#79AAA4');
        r(11, 6, 3, 5, CREAM);
        r(6, 14, 2, 2, '#C68F89');
      } else {
        line(ctx, 7, 21, 18, 6, WOOD_L, 3);
        poly(
          ctx,
          [
            [9, 7],
            [14, 3],
            [22, 5],
            [23, 9],
            [17, 7],
            [12, 11],
          ],
          CREAM,
        );
        r(13, 5, 5, 1, '#D5C5A4');
      }
      return;
    }
    if (['friends', 'bag'].includes(id)) {
      box(ctx, 5, 8, 17, 15, WOOD);
      box(ctx, 9, 4, 8, 5, WOOD_D);
      box(ctx, 9, 15, 9, 6, '#C68F89');
      r(11, 15, 5, 1, '#E4B4A3');
      r(6, 10, 1, 9, WOOD_L);
      return;
    }
    if (id === 'wardrobe') {
      poly(
        ctx,
        [
          [8, 5],
          [11, 7],
          [15, 7],
          [18, 5],
          [24, 10],
          [20, 14],
          [17, 12],
          [18, 23],
          [7, 23],
          [8, 12],
          [5, 14],
          [2, 10],
        ],
        '#F3E9CF',
      );
      r(9, 10, 8, 10, '#C68F89');
      r(10, 9, 1, 3, '#E4B4A3');
      return;
    }
    if (id === 'weather') {
      oval(ctx, 10, 9, 5, 5, '#D9B783');
      for (const [x, y] of [
        [3, 8],
        [9, 2],
        [16, 7],
      ])
        r(x, y, 2, 2, CREAM);
      oval(ctx, 14, 14, 7, 4, CREAM);
      oval(ctx, 10, 15, 6, 4, CREAM);
      for (const x of [7, 13, 19]) r(x, 20, 1, 3, '#79AAA4');
      return;
    }
    if (id === 'museum') {
      roof(ctx, 3, 3, 20, 7, '#C68F89');
      r(4, 10, 18, 2, CREAM);
      for (const x of [6, 12, 18]) r(x, 12, 3, 9, CREAM);
      r(3, 22, 21, 2, '#D5C5A4');
      return;
    }
    // Settings: a deliberately pixel-stepped gear.
    for (const [x, y, w, h] of [
      [10, 3, 6, 4],
      [10, 20, 6, 4],
      [3, 10, 4, 6],
      [20, 10, 4, 6],
      [6, 6, 14, 14],
    ])
      r(x, y, w, h, CREAM);
    oval(ctx, 13, 13, 6, 6, CREAM);
    oval(ctx, 13, 13, 3, 3, WOOD_D);
  });
  const url = c.toDataURL();
  urls.set(id, url);
  return url;
}
