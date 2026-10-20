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
  paintHouse,
  paintTree,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintLandmarkProp } from './landmark-props.js';
export function paintLandmark(c, art, W, H) {
  if (paintLandmarkProp(c, art, W, H)) return true;
  const r = (x, y, w, h, col) => R(c, x, y, w, h, col),
    stone = '#C4BFB3',
    sd = '#8E897E';
  if (['cottage', 'barn', 'boathouse'].includes(art)) {
    paintHouse(c, W, H, {
      wall: art === 'barn' ? '#C68F89' : art === 'boathouse' ? '#79AAA4' : '#E9DCC0',
      roofColor: art === 'boathouse' ? '#6F8590' : '#A96E75',
    });
    return true;
  }
  if (art === 'big_tree') {
    paintTree(c, W, H, { kind: 'oak' });
    box(c, W / 2 - 3, H - 10, 7, 10, WOOD_D);
    r(W / 2 - 1, H - 8, 3, 8, INK);
    return true;
  }
  if (['watchtower', 'lighthouse', 'windmill', 'obelisk'].includes(art)) {
    const bw = Math.min(W - 4, art === 'obelisk' ? 7 : Math.max(12, Math.round(W * 0.58))),
      cx = W / 2,
      base = H - 1,
      top = art === 'obelisk' ? 5 : 15;
    poly(
      c,
      [
        [cx - bw / 2, top],
        [cx + bw / 2 - 2, top],
        [cx + bw / 2 + 2, base],
        [cx - bw / 2 - 2, base],
      ],
      sd,
    );
    poly(
      c,
      [
        [cx - bw / 2 + 1, top + 1],
        [cx + bw / 2 - 3, top + 1],
        [cx + bw / 2, base - 1],
        [cx - bw / 2, base - 1],
      ],
      art === 'lighthouse' ? CREAM : stone,
    );
    for (let y = top + 5; y < H - 2; y += 6) {
      r(cx - bw / 2, y, bw, 1, art === 'lighthouse' ? '#C68F89' : sd);
      r(cx - 1, y - 3, 1, 2, sd);
    }
    box(c, cx - 2, H - 7, 5, 7, WOOD_D);
    r(cx - 1, H - 5, 2, 5, INK);
    if (art === 'watchtower') {
      box(c, cx - bw / 2 - 2, 8, bw + 4, 7, stone);
      for (let x = cx - bw / 2 - 2; x < cx + bw / 2 + 2; x += 4) r(x, 5, 3, 4, stone);
      windowPane(c, cx - 2, 19, 5, 7);
    }
    if (art === 'lighthouse') {
      box(c, cx - 5, 5, 10, 9, WOOD_D);
      r(cx - 4, 6, 8, 5, '#F2D39A');
      r(cx - 3, 7, 2, 3, CREAM);
      roof(c, cx - 8, 0, 16, 5, '#6F8590');
    }
    if (art === 'windmill') {
      roof(c, cx - 9, 7, 18, 9, '#A96E75');
      for (const [dx, dy] of [
        [1, 1],
        [-1, 1],
        [1, -1],
        [-1, -1],
      ]) {
        line(c, cx, 13, cx + dx * 10, 13 + dy * 10, WOOD_D, 2);
        line(c, cx + dx * 4, 13 + dy * 2, cx + dx * 11, 13 + dy * 9, CREAM, 2);
      }
      oval(c, cx, 13, 2, 2, WOOD_L);
    }
    if (art === 'obelisk') {
      poly(
        c,
        [
          [cx - 3, 6],
          [cx, 0],
          [cx + 3, 6],
        ],
        stone,
      );
      r(cx - 1, 12, 2, 2, WOOD_D);
    }
    return true;
  }
  if (['temple', 'pagoda', 'shrine', 'gazebo'].includes(art)) {
    box(c, 0, H - 4, W, 4, sd);
    r(1, H - 4, W - 2, 1, stone);
    if (art === 'pagoda') {
      box(c, W * 0.33, 7, W * 0.34, H - 11, '#C68F89');
      for (let n = 0; n < 3; n++) {
        const ww = Math.min(W, Math.round(W * 0.5 + n * W * 0.23)),
          x = (W - ww) / 2,
          y = 3 + (n * (H - 8)) / 3;
        box(c, x + 2, y + 5, ww - 4, Math.ceil((H - 8) / 3) - 3, '#C68F89');
        roof(c, x, y, ww, 6, '#6F8590');
        r(W / 2 - 1, y + 8, 3, 3, '#B7D4BD');
      }
    } else {
      const y = art === 'gazebo' ? 10 : 13;
      roof(c, 0, 1, W, y, art === 'shrine' ? '#A96E75' : stone);
      for (const x of [3, W - 6]) plank(c, x, y, 3, H - y - 4, art === 'shrine' ? WOOD : CREAM);
      if (art !== 'gazebo') {
        r(8, y + 1, W - 16, H - y - 5, WOOD_D);
        windowPane(c, W / 2 - 3, y + 3, 7, 7, true);
      }
    }
    return true;
  }
  if (['market', 'tent', 'treehouse'].includes(art)) {
    if (art === 'treehouse') {
      paintTree(c, W, H, { kind: 'oak' });
      box(c, W / 2 - 9, H * 0.35, 18, 12, WOOD);
      roof(c, W / 2 - 11, H * 0.35 - 7, 22, 8, '#A96E75');
      windowPane(c, W / 2 - 3, H * 0.35 + 2, 6, 5);
      for (let y = H * 0.6; y < H; y += 4) plank(c, W / 2 + 4, y, 4, 1, WOOD_L);
      return true;
    }
    if (art === 'market') {
      for (const x of [2, W - 4]) plank(c, x, 6, 2, H - 6, WOOD_D);
      roof(c, 0, 0, W, 9, '#C68F89');
      for (let x = 2; x < W - 2; x += 5) r(x, 6, 3, 4, CREAM);
      plank(c, 0, H - 9, W, 9, WOOD);
      for (let x = 4; x < W - 4; x += 7) oval(c, x, H - 11, 2, 2, x % 2 ? '#C68F89' : '#9DBA74');
    } else {
      poly(
        c,
        [
          [1, H - 2],
          [W * 0.4, 1],
          [W * 0.67, 3],
          [W - 1, H - 2],
        ],
        '#A96E75',
      );
      poly(
        c,
        [
          [3, H - 3],
          [W * 0.4, 3],
          [W * 0.6, H - 3],
        ],
        '#E4B4A3',
      );
      poly(
        c,
        [
          [W * 0.63, 9],
          [W * 0.48, H],
          [W * 0.8, H],
        ],
        INK,
      );
      r(1, H - 2, W - 2, 2, WOOD_D);
    }
    return true;
  }
  if (['statue', 'cairn', 'stone_circle', 'arch', 'pyramid'].includes(art)) {
    if (art === 'pyramid') {
      poly(
        c,
        [
          [W / 2, 0],
          [W - 1, H - 1],
          [0, H - 1],
        ],
        sd,
      );
      poly(
        c,
        [
          [W / 2, 1],
          [W / 2 + 3, H - 1],
          [1, H - 1],
        ],
        '#D9B783',
      );
      for (let y = 5; y < H; y += 4) r((W / 2) * (1 - y / H), y, (W * y) / H, 1, '#B88D60');
      box(c, W / 2 - 2, H - 6, 5, 6, WOOD_D);
    } else if (art === 'arch') {
      for (const x of [1, W - 7]) {
        box(c, x, 8, 6, H - 8, stone);
        for (let y = 12; y < H; y += 5) r(x + 1, y, 4, 1, sd);
      }
      box(c, 1, 3, W - 2, 7, stone);
      r(2, 4, W - 4, 1, CREAM);
      r(5, 10, W - 10, 2, sd);
    } else if (art === 'stone_circle') {
      for (let n = 0; n < 8; n++) {
        const a = (n * Math.PI) / 4,
          x = W / 2 + Math.cos(a) * (W / 2 - 4),
          y = H / 2 + Math.sin(a) * (H / 2 - 5);
        box(c, x - 2, y - 6, 5, 9, stone);
      }
    } else if (art === 'cairn') {
      for (let n = 0; n < 4; n++) oval(c, W / 2 + (n % 2), H - 3 - n * 5, 6 - n, 3, stone);
      r(W / 2 - 2, H - 19, 2, 1, CREAM);
    } else {
      box(c, 2, H - 7, W - 4, 7, sd);
      box(c, 4, H - 9, W - 8, 3, stone);
      oval(c, W / 2, H - 17, 5, 7, stone);
      oval(c, W / 2, H - 27, 4, 4, stone);
      r(W / 2 - 2, H - 28, 2, 1, CREAM);
      leaf(c, 4, H - 7, 3, 2);
    }
    return true;
  }
  if (art === 'shipwreck') {
    poly(
      c,
      [
        [0, H - 17],
        [W * 0.3, H - 12],
        [W - 1, H - 19],
        [W - 5, H - 3],
        [7, H - 1],
      ],
      WOOD_D,
    );
    for (let y = H - 13; y < H - 1; y += 3) line(c, 3, y, W - 5, y - 2, WOOD);
    plank(c, W / 2, 0, 2, H - 10, WOOD_D);
    poly(
      c,
      [
        [W / 2 + 2, 3],
        [W - 6, 7],
        [W / 2 + 2, H * 0.55],
      ],
      '#D5C5A4',
    );
    r(W / 2 + 4, 7, 2, 4, CREAM);
    return true;
  }
  if (art === 'observatory') {
    box(c, 2, H - 18, W - 4, 18, stone);
    oval(c, W / 2, H - 18, W / 2 - 3, 11, '#6F8590');
    oval(c, W / 2 - 3, H - 21, W / 2 - 8, 6, '#8FA5AF');
    r(W / 2 + 3, H - 28, 2, 12, INK);
    windowPane(c, W / 2 - 3, H - 13, 7, 8, true);
    return true;
  }
  return false;
}
