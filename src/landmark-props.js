import {
  R,
  oval,
  poly,
  line,
  box,
  plank,
  leaf,
  roof,
  windowPane,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintJarObject, paintSmallDecor } from './world-props.js';

export function paintLandmarkProp(c, art, W, H) {
  const stone = '#C4BFB3',
    shade = '#8E897E',
    r = (x, y, w, h, col) => R(c, x, y, w, h, col);
  if (['temple', 'gazebo', 'shrine'].includes(art)) {
    box(c, 0, H - 4, W, 4, shade);
    r(1, H - 4, W - 2, 1, stone);
    box(c, 2, H - 7, W - 4, 3, stone);
    const top = H * 0.28,
      wooden = art === 'shrine',
      color = wooden ? WOOD : stone;
    poly(
      c,
      [
        [1, top],
        [W * 0.48, 1],
        [W - 2, top],
      ],
      tint(color, -0.2),
    );
    poly(
      c,
      [
        [2, top - 1],
        [W * 0.48, 3],
        [W - 4, top - 1],
      ],
      color,
    );
    r(1, top, W - 2, 3, shade);
    r(2, top, W - 4, 1, CREAM);
    r(4, top + 3, W - 8, H - top - 10, wooden ? '#775B46' : '#6F786A');
    const cols = W < 25 ? [3, W - 6] : [4, W / 2 - 2, W - 8];
    for (const x of cols) {
      box(c, x, top + 3, 3, H - top - 9, color);
      r(x, top + 4, 1, H - top - 12, CREAM);
      r(x - 1, top + 3, 5, 2, color);
      r(x - 1, H - 8, 5, 2, color);
    }
    if (art === 'gazebo') {
      for (let x = 4; x < W - 4; x += 4) line(c, x, H - 14, x + 3, H - 9, WOOD_L);
      r(3, H - 15, W - 6, 1, WOOD);
    } else if (wooden) windowPane(c, W / 2 - 2, top + 5, 5, 7, true);
    else {
      poly(
        c,
        [
          [W * 0.5, top * 0.3],
          [W * 0.6, top * 0.6],
          [W * 0.5, top * 0.8],
          [W * 0.4, top * 0.6],
        ],
        CREAM,
      );
      leaf(c, 3, H - 5, 3, 1);
      leaf(c, W - 4, top + 1, 3, 1);
    }
    return true;
  }
  if (['watchtower', 'windmill', 'lighthouse', 'obelisk'].includes(art)) {
    const cx = W / 2,
      ww = art === 'obelisk' ? Math.max(5, W * 0.35) : Math.max(10, W * 0.6),
      top = art === 'obelisk' ? 5 : 14,
      color = art === 'lighthouse' ? '#F3E9CF' : art === 'windmill' ? '#D5C5A4' : stone;
    poly(
      c,
      [
        [cx - ww / 2, top],
        [cx + ww / 2 - 1, top],
        [cx + ww / 2 + 1, H - 3],
        [cx - ww / 2 - 2, H - 3],
      ],
      shade,
    );
    poly(
      c,
      [
        [cx - ww / 2 + 1, top + 1],
        [cx + ww * 0.15, top + 1],
        [cx + ww * 0.25, H - 4],
        [cx - ww / 2, H - 4],
      ],
      color,
    );
    for (let y = top + 4; y < H - 4; y += 5) {
      r(cx - ww / 2, y, ww, 1, tint(color, -0.15));
      r(cx - ww * 0.35 + (y % 2) * 3, y - 3, 1, 3, tint(color, -0.18));
    }
    box(c, cx - ww / 2 - 2, H - 4, ww + 4, 4, shade);
    r(cx - ww / 2 - 1, H - 4, ww + 1, 1, stone);
    box(c, cx - 2, H - 11, 5, 8, WOOD_D);
    r(cx - 1, H - 10, 2, 6, WOOD);
    if (art === 'watchtower') {
      box(c, cx - ww / 2 - 2, 8, ww + 4, 7, stone);
      for (let x = cx - ww / 2 - 2; x < cx + ww / 2 + 2; x += 4) box(c, x, 4, 3, 5, stone);
      windowPane(c, cx - 2, 20, 5, 7);
      r(cx, 0, 1, 4, WOOD_D);
      r(cx + 1, 0, 4, 2, '#C68F89');
    }
    if (art === 'lighthouse') {
      for (let y = 22; y < H - 9; y += 11) r(cx - ww / 2, y, ww, 3, '#C68F89');
      box(c, cx - 6, 5, 12, 10, WOOD_D);
      r(cx - 4, 7, 8, 5, '#F2D39A');
      r(cx - 3, 7, 2, 4, CREAM);
      r(cx, 6, 1, 7, WOOD_D);
      r(cx - 7, 15, 14, 2, shade);
      roof(c, cx - 7, 0, 14, 5, '#6F8590');
    }
    if (art === 'windmill') {
      roof(c, cx - 8, 7, 16, 9, '#A96E75');
      for (const [dx, dy] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        line(c, cx, 13, cx + dx * 11, 13 + dy * 11, WOOD_D);
        poly(
          c,
          [
            [cx + dx * 3, 13 + dy * 2],
            [cx + dx * 10, 13 + dy * 9],
            [cx + dx * 7, 13 + dy * 11],
            [cx + dx, 13 + dy * 4],
          ],
          CREAM,
        );
        line(c, cx + dx * 4, 13 + dy * 4, cx + dx * 8, 13 + dy * 8, '#D5C5A4');
      }
      oval(c, cx, 13, 2, 2, WOOD_L);
    }
    if (art === 'obelisk') {
      poly(
        c,
        [
          [cx - ww / 2, 5],
          [cx, 0],
          [cx + ww / 2 - 1, 5],
        ],
        stone,
      );
      for (let y = 10; y < H - 8; y += 6) {
        r(cx - 1, y, 2, 1, shade);
        r(cx, y + 1, 1, 2, shade);
      }
    }
    return true;
  }
  switch (art) {
    case 'statue': {
      const x = W / 2;
      box(c, 1, H - 6, W - 2, 6, shade);
      box(c, 3, H - 9, W - 6, 3, stone);
      poly(
        c,
        [
          [x - 4, H - 24],
          [x + 3, H - 25],
          [x + 6, H - 10],
          [x - 6, H - 10],
        ],
        shade,
      );
      poly(
        c,
        [
          [x - 3, H - 23],
          [x + 1, H - 24],
          [x + 2, H - 11],
          [x - 4, H - 11],
        ],
        stone,
      );
      oval(c, x, H - 29, 4, 5, shade);
      oval(c, x - 1, H - 30, 3, 4, stone);
      r(x - 2, H - 30, 1, 1, '#6E6A62');
      r(x + 1, H - 30, 1, 1, '#6E6A62');
      r(x, H - 27, 1, 1, CREAM);
      line(c, x - 4, H - 23, x - 7, H - 17, stone, 2);
      line(c, x + 4, H - 22, x + 7, H - 25, shade, 2);
      r(x - 2, H - 20, 1, 7, CREAM);
      leaf(c, 3, H - 7, 3, 1);
      return true;
    }
    case 'cairn': {
      for (let n = 0; n < 4; n++) {
        const ww = Math.max(3, Math.min(W - 2, 12 - n * 2)),
          x = (W - ww) / 2 + (n % 2),
          y = H - 5 - n * 5;
        poly(
          c,
          [
            [x, y + 2],
            [x + 2, y],
            [x + ww - 2, y],
            [x + ww, y + 2],
            [x + ww - 1, y + 4],
            [x + 1, y + 4],
          ],
          shade,
        );
        r(x + 1, y + 1, ww - 3, 2, stone);
        r(x + 2, y + 1, Math.max(1, ww - 5), 1, CREAM);
      }
      leaf(c, 3, H - 2, 2, 1);
      return true;
    }
    case 'apiary': {
      const count = W < 25 ? 2 : 3,
        bw = Math.floor((W - 2) / count);
      for (let n = 0; n < count; n++) {
        const x = 1 + n * bw;
        box(c, x, H - 13, bw - 1, 11, '#D9B783');
        r(x - 1, H - 14, bw + 1, 2, WOOD_D);
        r(x + 1, H - 12, bw - 3, 1, CREAM);
        for (const y of [H - 9, H - 6]) r(x + 1, y, bw - 3, 1, WOOD);
        r(x + bw / 2, H - 4, 2, 1, INK);
        r(x + 1, H - 2, 1, 2, WOOD_D);
      }
      return true;
    }
    case 'fairy_ring': {
      for (let n = 0; n < 10; n++) {
        const t = (n * Math.PI) / 5,
          x = W / 2 + Math.cos(t) * (W / 2 - 3),
          y = H / 2 + Math.sin(t) * (H / 2 - 4);
        r(x, y, 1, 3, CREAM);
        oval(c, x, y - 1, 2, 2, n % 2 ? '#C68F89' : '#E4B4A3');
        r(x - 1, y - 2, 1, 1, CREAM);
      }
      return true;
    }
    case 'signpost': {
      plank(c, W / 2 - 1, 2, 2, H - 2, WOOD_D);
      poly(
        c,
        [
          [2, 5],
          [W - 4, 5],
          [W - 1, 7],
          [W - 4, 10],
          [2, 10],
        ],
        WOOD,
      );
      poly(
        c,
        [
          [W - 2, 13],
          [5, 13],
          [2, 15],
          [5, 18],
          [W - 2, 18],
        ],
        WOOD,
      );
      r(4, 6, W - 10, 1, WOOD_L);
      r(7, 15, W - 11, 1, WOOD_D);
      return true;
    }
    case 'igloo':
      return paintJarObject(c, 'igloo', W, H, 0);
    case 'totem': {
      plank(c, W / 2 - 5, 3, 10, H - 3, WOOD_D);
      for (let n = 0; n < 3; n++) {
        const y = H - 9 - n * 8,
          col = ['#C68F89', '#79AAA4', '#D9B783'][n];
        box(c, W / 2 - 4, y, 8, 7, col);
        r(W / 2 - 3, y + 2, 2, 1, INK);
        r(W / 2 + 1, y + 2, 2, 1, INK);
        r(W / 2 - 1, y + 4, 2, 1, CREAM);
      }
      poly(
        c,
        [
          [0, H - 22],
          [W / 2 - 4, H - 19],
          [W / 2 - 4, H - 16],
          [0, H - 19],
        ],
        WOOD,
      );
      poly(
        c,
        [
          [W - 1, H - 22],
          [W / 2 + 4, H - 19],
          [W / 2 + 4, H - 16],
          [W - 1, H - 19],
        ],
        WOOD,
      );
      return true;
    }
    case 'bridge': {
      for (let x = 0; x < W; x += 4) plank(c, x, H - 11, 3, 9, WOOD);
      for (const y of [H - 15, H - 3]) plank(c, 0, y, W, 2, WOOD_D);
      for (let x = 1; x < W; x += 8) plank(c, x, H - 16, 2, 15, WOOD_L);
      return true;
    }
    case 'well': {
      for (const x of [2, W - 4]) plank(c, x, 5, 2, H - 9, WOOD_D);
      roof(c, 0, 0, W, 8, '#A96E75');
      plank(c, 4, 11, W - 8, 2, WOOD);
      line(c, W / 2, 12, W / 2, H - 8, WOOD_D);
      oval(c, W / 2, H - 5, W / 2 - 1, 5, shade);
      r(2, H - 7, W - 4, 5, stone);
      oval(c, W / 2, H - 8, W / 2 - 1, 3, stone);
      oval(c, W / 2, H - 8, W / 2 - 4, 1, INK);
      r(3, H - 4, 3, 1, CREAM);
      return true;
    }
    case 'campfire':
      return paintSmallDecor(c, 'campfire', W, H);
    case 'sundial':
    case 'fountain': {
      box(c, 2, H - 4, W - 4, 4, shade);
      box(c, W / 2 - 3, H - 12, 6, 9, stone);
      oval(c, W / 2, H - 12, W / 2 - 2, 3, shade);
      oval(c, W / 2 - 1, H - 13, W / 2 - 3, 2, stone);
      if (art === 'sundial') {
        poly(
          c,
          [
            [W / 2, H - 14],
            [W / 2, H - 21],
            [W / 2 + 5, H - 14],
          ],
          shade,
        );
        line(c, W / 2, H - 13, W - 4, H - 11, WOOD_D);
      } else {
        r(W / 2 - 1, H - 22, 2, 10, stone);
        oval(c, W / 2, H - 22, 4, 2, stone);
        r(W / 2 - 4, H - 21, 1, 5, '#79AAA4');
        r(W / 2 + 3, H - 21, 1, 5, '#79AAA4');
        r(4, H - 4, W - 8, 1, '#79AAA4');
      }
      return true;
    }
    default:
      return false;
  }
}
