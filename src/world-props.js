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
  windowPane,
  paintTree,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintNature } from './nature-art.js';
import { star } from './furniture-details.js';

export function paintSmallDecor(c, type, W = 16, H = 16, season = 'spring') {
  if (['oak', 'pine', 'birch', 'willow', 'cherry', 'sapling'].includes(type)) {
    paintTree(c, W, H, { kind: type, season });
    return true;
  }
  if (paintNature(c, type, W, H, season)) return true;
  const r = (x, y, w, h, col) => R(c, x, y, w, h, col);
  switch (type) {
    case 'pathstone': {
      for (const [x, y, w, h] of [
        [1, 2, 7, 5],
        [9, 4, 6, 5],
        [3, 10, 8, 5],
      ]) {
        box(c, x, y, w, h, '#9A958A');
        r(x + 1, y + 1, w - 3, 1, '#C4BFB3');
      }
      return true;
    }
    case 'pathwood': {
      for (let y = 0; y < 16; y += 4) {
        plank(c, 1, y, 14, 3, WOOD);
        r(3, y + 1, 1, 1, WOOD_D);
        r(12, y + 1, 1, 1, WOOD_D);
      }
      return true;
    }
    case 'fence': {
      for (const x of [1, 7, 13]) {
        plank(c, x, 3, 2, 13, WOOD);
        poly(
          c,
          [
            [x - 1, 3],
            [x + 1, 0],
            [x + 3, 3],
          ],
          WOOD_L,
        );
      }
      plank(c, 0, 6, 16, 2, WOOD);
      plank(c, 0, 12, 16, 2, WOOD);
      return true;
    }
    case 'bridge': {
      for (let x = 0; x < W; x += 4) plank(c, x, 6, 3, H - 7, WOOD);
      for (const y of [4, H - 3]) plank(c, 0, y, W, 2, WOOD_D);
      for (const x of [1, W - 3]) plank(c, x, 2, 2, H - 2, WOOD_L);
      return true;
    }
    case 'birdhouse': {
      plank(c, 7, 10, 2, 6, WOOD_D);
      box(c, 3, 4, 10, 8, WOOD);
      roof(c, 1, 0, 14, 5, '#A96E75');
      oval(c, 8, 8, 2, 2, INK);
      r(7, 11, 5, 1, WOOD_L);
      return true;
    }
    case 'hammock': {
      for (const x of [1, 13]) plank(c, x, 2, 2, 14, WOOD_D);
      for (let x = 3; x < 13; x++) {
        const y = 5 + Math.round(Math.sin(((x - 3) / 10) * Math.PI) * 5);
        r(x, y, 1, 3, '#C68F89');
        r(x, y, 1, 1, '#E4B4A3');
      }
      return true;
    }
    case 'picnic': {
      for (let y = 5; y < 16; y++)
        for (let x = 0; x < 16; x++)
          r(x, y, 1, 1, ((x >> 2) + (y >> 2)) % 2 ? '#C68F89' : '#F3E9CF');
      box(c, 2, 3, 6, 5, WOOD);
      r(3, 2, 4, 1, WOOD_D);
      r(3, 4, 4, 1, WOOD_L);
      return true;
    }
    case 'tent': {
      poly(
        c,
        [
          [0, 15],
          [6, 1],
          [10, 3],
          [16, 15],
        ],
        '#A96E75',
      );
      poly(
        c,
        [
          [2, 14],
          [6, 2],
          [9, 14],
        ],
        '#E4B4A3',
      );
      poly(
        c,
        [
          [10, 5],
          [7, 15],
          [13, 15],
        ],
        INK,
      );
      line(c, 6, 2, 9, 14, CREAM);
      r(0, 15, 16, 1, WOOD_D);
      return true;
    }
    case 'cabin':
    case 'coop': {
      box(c, 1, 7, 14, 9, WOOD);
      poly(
        c,
        [
          [11, 8],
          [15, 6],
          [15, 14],
          [11, 16],
        ],
        WOOD_D,
      );
      roof(c, 0, 1, 16, 7, '#A96E75');
      box(c, 6, 10, 4, 6, WOOD_D);
      r(7, 11, 2, 5, INK);
      windowPane(c, 2, 9, 4, 4);
      r(12, 9, 2, 2, CREAM);
      r(6, 15, 6, 1, WOOD_L);
      return true;
    }
    case 'treehouse': {
      paintTree(c, 16, 16, { kind: 'oak', season });
      box(c, 4, 6, 9, 6, WOOD);
      roof(c, 2, 2, 13, 5, '#A96E75');
      r(7, 8, 3, 4, INK);
      line(c, 12, 10, 12, 15, WOOD_D);
      for (let y = 11; y < 16; y += 2) r(11, y, 3, 1, WOOD_L);
      return true;
    }
    case 'campfire': {
      for (let n = 0; n < 8; n++) {
        const t = (n * Math.PI) / 4;
        oval(c, 8 + Math.cos(t) * 6, 12 + Math.sin(t) * 2, 2, 1, '#9A958A');
      }
      line(c, 3, 13, 12, 10, WOOD_D, 2);
      line(c, 4, 10, 12, 13, WOOD, 2);
      poly(
        c,
        [
          [4, 11],
          [6, 6],
          [8, 2],
          [9, 6],
          [12, 10],
          [10, 13],
        ],
        '#C98A44',
      );
      poly(
        c,
        [
          [6, 11],
          [8, 6],
          [10, 11],
        ],
        '#F2D39A',
      );
      r(6, 5, 1, 1, '#E8C25A');
      return true;
    }
    case 'windchime': {
      plank(c, 3, 2, 10, 2, WOOD);
      line(c, 8, 0, 8, 2, WOOD_D);
      for (const [x, h] of [
        [4, 7],
        [7, 10],
        [10, 8],
        [12, 11],
      ]) {
        line(c, x, 4, x, h, '#9A958A');
        box(c, x - 1, h, 3, 3, '#79AAA4');
        r(x - 1, h, 1, 1, CREAM);
      }
      return true;
    }
    case 'mailbox': {
      plank(c, 7, 10, 2, 6, WOOD);
      box(c, 2, 3, 11, 8, '#C68F89');
      oval(c, 7, 3, 5, 2, '#C68F89');
      r(3, 5, 7, 1, '#A96E75');
      r(12, 1, 1, 7, WOOD_D);
      r(13, 1, 3, 2, '#A96E75');
      r(4, 8, 5, 1, CREAM);
      return true;
    }
    case 'signpost': {
      plank(c, 7, 1, 2, 15, WOOD_D);
      plank(c, 1, 3, 13, 5, WOOD);
      plank(c, 3, 10, 12, 4, WOOD);
      r(3, 5, 6, 1, WOOD_D);
      r(6, 12, 5, 1, WOOD_L);
      return true;
    }
    case 'fireflyjar': {
      box(c, 4, 3, 8, 12, '#507F83');
      r(5, 5, 6, 9, '#79AAA4');
      r(4, 2, 8, 3, WOOD);
      r(5, 5, 1, 7, CREAM);
      for (const [x, y] of [
        [8, 7],
        [10, 11],
        [7, 12],
      ])
        r(x, y, 1, 1, '#F2D39A');
      return true;
    }
    case 'fairylights': {
      for (const x of [1, 14]) plank(c, x, 2, 1, 14, WOOD_D);
      for (let x = 2; x < 15; x++) {
        const y = 3 + Math.round(Math.sin(((x - 2) / 13) * Math.PI) * 4);
        r(x, y, 1, 1, WOOD_D);
        if (x % 3 === 0) {
          oval(c, x, y + 2, 1, 1, '#F2D39A');
          r(x, y + 1, 1, 1, CREAM);
        }
      }
      return true;
    }
    case 'seat': {
      for (const x of [2, 12]) plank(c, x, 4, 2, 12, WOOD_D);
      plank(c, 1, 3, 14, 4, WOOD);
      plank(c, 0, 10, 16, 3, WOOD);
      r(2, 11, 11, 1, WOOD_L);
      box(c, 8, 8, 6, 4, '#C68F89');
      return true;
    }
    case 'goat_pen': {
      oval(c, 7, 7, 4, 2, CREAM);
      box(c, 10, 3, 3, 5, '#D5C5A4');
      r(11, 4, 1, 1, INK);
      r(10, 1, 1, 3, WOOD_D);
      r(12, 2, 1, 2, WOOD_D);
      r(5, 8, 1, 4, WOOD_D);
      r(9, 8, 1, 4, WOOD_D);
      for (const x of [0, 5, 10, 15]) plank(c, x, 9, 1, 7, WOOD_D);
      plank(c, 0, 11, 16, 2, WOOD);
      r(2, 11, 11, 1, WOOD_L);
      return true;
    }
    case 'bee_box': {
      box(c, 3, 4, 10, 11, '#D9B783');
      roof(c, 1, 1, 14, 4, WOOD_D);
      for (const y of [7, 10, 13]) r(4, y, 8, 1, WOOD);
      r(7, 13, 3, 1, INK);
      r(4, 5, 1, 6, '#F2D39A');
      r(12, 15, 2, 1, WOOD_D);
      return true;
    }
    default:
      return false;
  }
}

export function paintJarObject(c, kind, W, H, state = 0) {
  const r = (x, y, w, h, col) => R(c, x, y, w, h, col);
  if (kind === 'bigtree') {
    paintTree(c, W, H, { kind: 'oak', season: 'summer', fruit: !!state, fruitColor: '#7A3A6A' });
    return true;
  }
  if (['cactus', 'fern', 'bigshroom'].includes(kind)) return paintNature(c, kind, W, H, 'spring');
  switch (kind) {
    case 'bamboo': {
      for (const [x, top] of [
        [1, 3],
        [6, 0],
      ]) {
        box(c, x, top, 3, H - top, '#6F925B');
        r(x, top + 1, 1, H - top - 2, '#9DBA74');
        for (let y = top + 4; y < H; y += 7) r(x, y, 3, 1, '#3F604A');
      }
      for (const [x, y] of [
        [3, 7],
        [6, 15],
        [2, 24],
      ])
        leaf(c, x, y, 3, 1, '#6F925B');
      return true;
    }
    case 'lantern': {
      box(c, 4, H - 8, 4, 8, '#9A958A');
      box(c, 2, 5, 8, 6, '#8E897E');
      r(4, 6, 4, 4, '#F2D39A');
      r(4, 6, 1, 3, CREAM);
      roof(c, 0, 1, 12, 5, '#9A958A');
      plank(c, 1, H - 9, 10, 2, '#C4BFB3');
      return true;
    }
    case 'cloud': {
      for (const [x, y, rx, ry] of [
        [7, 9, 6, 4],
        [15, 7, 7, 6],
        [25, 9, 6, 4],
      ]) {
        oval(c, x, y, rx, ry, '#C5BDD4');
        oval(c, x - 1, y - 1, rx - 1, ry - 1, '#E7E2ED');
        oval(c, x - 2, y - 2, rx - 3, 1, CREAM);
      }
      r(6, H - 2, W - 13, 1, '#F3E9CF');
      return true;
    }
    case 'sandcastle': {
      oval(c, 8, 14, 7, 1, '#D5C08A');
      if (state === 0) {
        oval(c, 7, 13, 4, 2, '#E9D7A8');
        r(6, 11, 1, 1, WOOD_D);
        return true;
      }
      box(c, 1, 10, 14, 5, '#D5C08A');
      r(2, 11, 11, 1, '#F5E8C4');
      if (state > 1) {
        for (const x of [2, 10]) {
          box(c, x, 5, 4, 8, '#E9D7A8');
          r(x, 4, 1, 2, '#F5E8C4');
          r(x + 3, 4, 1, 2, '#F5E8C4');
        }
        r(7, 9, 2, 4, '#775B46');
      }
      if (state > 2) {
        box(c, 6, 2, 4, 8, '#E9D7A8');
        r(8, 0, 1, 4, WOOD_D);
        r(9, 0, 3, 2, '#C68F89');
        r(7, 5, 1, 2, WOOD_D);
      }
      return true;
    }
    case 'bottle': {
      poly(
        c,
        [
          [1, 3],
          [3, 2],
          [7, 3],
          [8, 4],
          [10, 4],
          [10, 6],
          [7, 6],
          [5, 7],
          [1, 6],
        ],
        '#507F83',
      );
      r(2, 3, 5, 3, '#79AAA4');
      r(3, 4, 3, 1, CREAM);
      r(8, 4, 2, 2, WOOD);
      return true;
    }
    case 'igloo': {
      const ry = Math.min(H - 3, Math.round(W * 0.48)),
        cy = H - 2;
      oval(c, W / 2, cy, W / 2 - 1, ry, '#B5CDD0');
      oval(c, W / 2 - 1, cy - 1, W / 2 - 2, ry - 1, '#E6EDEE');
      for (let y = Math.ceil(cy - ry + 3); y < H - 1; y += 3) {
        const half = Math.floor(
          (W / 2 - 2) * Math.sqrt(Math.max(0, 1 - ((y - cy) * (y - cy)) / (ry * ry))),
        );
        r(W / 2 - half, y, half * 2, 1, '#C5D3D8');
        r(W / 2 + (y % 2 ? -half * 0.3 : half * 0.35), y, 1, 3, '#C5D3D8');
      }
      oval(c, W / 2, H - 3, 4, 4, '#C5D3D8');
      box(c, W / 2 - 3, H - 5, 6, 5, INK);
      r(3, H - 4, 2, 1, CREAM);
      return true;
    }
    case 'swing': {
      plank(c, 1, 0, 14, 3, WOOD);
      for (const [x, y] of [
        [2, 1],
        [8, 0],
        [13, 2],
      ]) {
        leaf(c, x, y, 2, 1);
        flower(c, x, y, '#E4B4A3');
      }
      for (const x of [3, 12]) line(c, x, 3, x, H - 6, WOOD_D);
      plank(c, 2, H - 6, 12, 3, WOOD);
      r(3, H - 6, 9, 1, WOOD_L);
      return true;
    }
    case 'bouquet': {
      plank(c, 0, 7, 16, 3, WOOD);
      for (const x of [2, 12]) plank(c, x, 10, 2, H - 10, WOOD_D);
      box(c, 6, 4, 4, 4, '#C68F89');
      for (const [x, y, v] of [
        [5, 3, '#E4B4A3'],
        [9, 1, '#A99CC9'],
        [11, 4, '#E8C25A'],
      ])
        flower(c, x, y, v);
      return true;
    }
    case 'steamer': {
      oval(c, 7, H - 3, 6, 3, '#6E6A62');
      oval(c, 6, H - 4, 5, 2, '#9A958A');
      oval(c, 7, H - 4, 3, 1, '#507F83');
      if (state % 2)
        for (const [x, y] of [
          [4, 1],
          [9, 0],
        ]) {
          r(x, y, 1, 4, '#D5C5A4');
          r(x + 1, y + 1, 1, 2, CREAM);
        }
      r(3, H - 5, 2, 1, '#C4BFB3');
      return true;
    }
    case 'telescope': {
      line(c, 7, 10, 3, H - 1, WOOD_D);
      line(c, 7, 10, 11, H - 1, WOOD_D);
      r(7, 10, 1, H - 10, WOOD);
      line(c, 2, 10, 11, 3, WOOD_D, 4);
      line(c, 2, 9, 10, 3, '#D9B783', 2);
      box(c, 10, 1, 4, 5, '#507F83');
      r(11, 2, 1, 3, CREAM);
      return true;
    }
    case 'star_bench': {
      for (const x of [3, W - 5]) plank(c, x, 2, 2, H - 2, WOOD_D);
      plank(c, 1, 1, W - 2, 3, WOOD);
      plank(c, 0, 7, W, 3, WOOD);
      star(c, W / 2, 4, 3, '#D9B783');
      r(2, 7, W - 4, 1, WOOD_L);
      return true;
    }
    case 'vine': {
      for (let y = 0; y < H - 2; y++) {
        const x = 4 + Math.round(Math.sin(y / 4) * 2);
        r(x, y, 1, 1, '#3F604A');
        if (y % 5 === 0) {
          leaf(c, x - 2, y + 1, 2, 1);
          leaf(c, x + 2, y + 3, 2, 1, '#9DBA74');
        }
      }
      plank(c, 1, H - 3, W - 2, 3, WOOD);
      return true;
    }
    case 'dig': {
      line(c, 1, 1, 6, 4, WOOD_D);
      line(c, 10, 1, 6, 4, WOOD_D);
      line(c, 6, 4, 2, H - 1, WOOD_D);
      line(c, 6, 4, 10, H - 1, WOOD_D);
      r(5, 4, 2, 1, '#D9B783');
      r(3, 2, 1, 1, '#C4BFB3');
      return true;
    }
    case 'ring': {
      for (let n = 0; n < 12; n++) {
        const t = (n * Math.PI) / 6,
          x = W / 2 + Math.cos(t) * (W / 2 - 4),
          y = H / 2 + Math.sin(t) * (H / 2 - 5);
        r(x, y, 2, 4, '#D5C5A4');
        oval(c, x, y - 1, 3, 2, n % 2 ? '#C68F89' : '#E4B4A3');
        r(x - 1, y - 2, 1, 1, CREAM);
      }
      for (const [x, y] of [
        [15, 15],
        [25, 24],
        [22, 10],
      ])
        r(x, y, 1, 1, '#D9B783');
      return true;
    }
    case 'dune': {
      for (let x = 0; x < W; x++) {
        const y = H - Math.round(Math.sin((x / W) * Math.PI) * (H - 2));
        r(x, y, 1, H - y, '#D5B181');
        r(x, y, 1, 1, '#F2DEB1');
        if (x % 6 === 0) r(x, y + 2, 3, 1, '#E9C994');
      }
      return true;
    }
    case 'rink': {
      oval(c, W / 2, H / 2, W / 2 - 1, H / 2 - 1, '#8DAFB8');
      oval(c, W / 2 - 1, H / 2 - 1, W / 2 - 3, H / 2 - 2, '#B9D7DC');
      line(c, 6, 5, W - 10, 2, CREAM);
      line(c, 15, 8, W - 5, 5, '#DCEFF0');
      r(5, H - 3, W - 12, 1, '#C5E1E2');
      return true;
    }
    default:
      return false;
  }
}
