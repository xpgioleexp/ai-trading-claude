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
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';

// Specialty pieces have their own construction instead of inheriting a rectangular stand-in.
export function paintSpecialFurniture(c, def, W, H, form) {
  const col = def.color || WOOD,
    a = def.accent || '#C68F89',
    d = tint(col, -0.3),
    l = tint(col, 0.3),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v),
    b = (x, y, w, h, v = col) => box(c, x, y, w, h, v),
    p = (x, y, w, h, v = col) => plank(c, x, y, w, h, v),
    foot = () => {
      p(2, H - 3, 2, 3, d);
      p(W - 4, H - 3, 2, 3, d);
    };
  if (def.type === 'star_rug') {
    const pts = [];
    for (let n = 0; n < 10; n++) {
      const t = -Math.PI / 2 + (n * Math.PI) / 5,
        rr = n % 2 ? W * 0.23 : W * 0.47;
      pts.push([W / 2 + Math.cos(t) * rr, H / 2 + Math.sin(t) * rr]);
    }
    poly(c, pts, d);
    const inner = pts.map(([x, y]) => [W / 2 + (x - W / 2) * 0.83, H / 2 + (y - H / 2) * 0.83]);
    poly(c, inner, a);
    line(c, W / 2, 3, W / 2, H - 6, tint(a, 0.3));
    return true;
  }
  if (def.type === 'star_lamp') {
    p(4, H - 3, 8, 3, col);
    r(7, H - 8, 2, 6, col);
    star(c, 8, 6, 6, '#E8C25A');
    r(5, 4, 2, 1, CREAM);
    return true;
  }
  if (def.type === 'paper_lantern') {
    e(8, 7, 6, 6, '#D5C5A4');
    e(7, 6, 5, 5, CREAM);
    for (const y of [4, 7, 10]) r(3, y, 10, 1, '#D5C5A4');
    r(7, 0, 2, 2, col);
    r(6, 13, 4, 2, col);
    r(8, 15, 1, 1, a);
    return true;
  }
  switch (form) {
    case 'gramophone':
    case 'record_player': {
      b(1, H - 7, W - 2, 7, col);
      e(W / 2, H - 8, 5, 2, INK);
      e(W / 2, H - 8, 2, 1, a);
      line(c, W - 4, H - 8, W - 4, H - 13, d);
      line(c, W - 4, H - 13, W - 8, H - 15, col, 2);
      poly(
        c,
        [
          [W - 8, H - 15],
          [W - 11, H - 19],
          [W - 2, H - 21],
          [W - 4, H - 13],
        ],
        a,
      );
      line(c, W - 10, H - 19, W - 3, H - 20, tint(a, 0.35));
      r(3, H - 4, 3, 1, l);
      return true;
    }
    case 'easel':
    case 'easel_art':
    case 'board': {
      line(c, 4, H - 10, 2, H - 1, d, 2);
      line(c, W - 5, H - 10, W - 3, H - 1, d, 2);
      p(W / 2 - 1, 0, 2, H, col);
      b(2, 2, W - 4, H - 9, d);
      r(3, 3, W - 7, H - 12, CREAM);
      if (form === 'board') {
        for (const [x, y, v] of [
          [4, 5, a],
          [W - 8, 7, '#79AAA4'],
          [5, H - 13, '#E8C25A'],
        ])
          b(x, y, 4, 4, v);
      } else {
        poly(
          c,
          [
            [4, H - 13],
            [W * 0.45, 7],
            [W - 5, H - 13],
          ],
          '#9DBA74',
        );
        r(W - 7, 5, 2, 2, a);
        line(c, 4, H - 12, W - 6, H - 12, '#79AAA4');
      }
      p(0, H - 8, W, 2, col);
      return true;
    }
    case 'fishtank':
    case 'aquarium': {
      b(0, 2, W, H - 3, d);
      r(2, 4, W - 4, H - 8, '#79AAA4');
      r(3, 4, W - 6, 2, '#B7D4BD');
      r(2, H - 5, W - 4, 2, '#D9B783');
      for (const x of [4, W - 6]) {
        line(c, x, H - 5, x - 1, H - 11, '#3F604A');
        r(x + 1, H - 10, 2, 1, '#9DBA74');
      }
      e(W * 0.55, H * 0.56, 3, 2, a);
      poly(
        c,
        [
          [W * 0.55 + 3, H * 0.56],
          [W * 0.55 + 6, H * 0.56 - 2],
          [W * 0.55 + 6, H * 0.56 + 2],
        ],
        tint(a, -0.2),
      );
      r(W * 0.55 - 1, H * 0.56 - 1, 1, 1, INK);
      r(3, 5, 1, H - 12, CREAM);
      r(W - 5, 6, 1, 1, CREAM);
      r(W - 7, 9, 1, 1, CREAM);
      return true;
    }
    case 'jukebox': {
      e(W / 2, 7, 7, 6, d);
      b(1, 7, W - 2, H - 8, col);
      e(W / 2, 7, 5, 4, a);
      e(W / 2, 7, 3, 2, INK);
      r(3, 10, W - 6, 2, l);
      b(4, 13, W - 8, H - 15, d);
      for (let x = 5; x < W - 4; x += 2) r(x, 14, 1, H - 17, a);
      r(2, 7, 1, H - 10, tint(a, 0.3));
      r(W - 3, 7, 1, H - 10, tint(a, -0.2));
      r(6, 5, 4, 1, CREAM);
      return true;
    }
    case 'mushroom':
    case 'mushroom_lamp':
    case 'spore_lamp': {
      b(W / 2 - 2, H * 0.45, 4, H * 0.55, CREAM);
      r(W / 2 + 1, H * 0.5, 1, H * 0.4, '#D5C5A4');
      e(W / 2, H * 0.42, W / 2 - 1, H * 0.25, d);
      e(W / 2 - 1, H * 0.36, W / 2 - 2, H * 0.21, col);
      r(2, H * 0.5, W - 4, 1, a);
      for (const [x, y] of [
        [W * 0.3, H * 0.25],
        [W * 0.65, H * 0.35],
        [W * 0.5, H * 0.2],
      ])
        b(x, y, 2, 2, CREAM);
      return true;
    }
    case 'snow_globe':
    case 'star_lamp': {
      p(3, H - 4, W - 6, 4, col);
      e(W / 2, H * 0.45, 6, 6, '#79AAA4');
      e(W / 2 - 1, H * 0.4, 5, 5, '#B7D4BD');
      if (form === 'star_lamp') star(c, W / 2, H * 0.45, 5, a);
      else {
        poly(
          c,
          [
            [W / 2, H * 0.25],
            [W / 2 - 4, H - 5],
            [W / 2 + 4, H - 5],
          ],
          a,
        );
        r(W / 2, H * 0.3, 1, 5, CREAM);
      }
      r(4, 3, 2, 2, CREAM);
      r(W - 5, H * 0.6, 1, 1, CREAM);
      return true;
    }
    case 'surfboard': {
      e(8, 8, 4, 7, d);
      e(7, 7, 3, 6, col);
      line(c, 7, 1, 7, 14, a);
      r(4, 4, 1, 5, l);
      r(10, 10, 1, 4, a);
      return true;
    }
    case 'trellis':
    case 'screen':
    case 'paper_screen': {
      const panels = form === 'trellis' ? 1 : Math.max(2, Math.floor(W / 9));
      for (let n = 0; n < panels; n++) {
        const x = (n * W) / panels,
          ww = W / panels - 1;
        b(x, 1, ww, H - 2, col);
        r(x + 2, 3, ww - 4, H - 7, a);
        for (let y = 5; y < H - 5; y += 4) r(x + 1, y, ww - 2, 1, d);
        r(x + ww / 2, 2, 1, H - 5, l);
      }
      if (form === 'trellis') {
        for (let y = H - 3; y > 2; y -= 4) {
          leaf(c, 4, y, 3, 2);
          leaf(c, 10, y - 2, 3, 2);
          flower(c, 5, y - 3, a);
        }
      }
      return true;
    }
    case 'hammock': {
      for (const x of [1, W - 3]) p(x, 2, 2, H - 2, d);
      for (let x = 3; x < W - 3; x++) {
        const yy = 4 + Math.sin(((x - 3) / (W - 6)) * Math.PI) * (H - 8);
        r(x, yy, 1, 3, a);
        if (x % 3 === 0) r(x, yy, 1, 1, CREAM);
      }
      r(3, 4, 3, 1, l);
      r(W - 6, 4, 3, 1, l);
      return true;
    }
    case 'brass_lantern': {
      line(c, 5, 3, 5, 1, d);
      line(c, 5, 1, 11, 1, d);
      line(c, 11, 1, 11, 3, d);
      b(3, 4, 10, H - 5, col);
      r(5, 6, 6, H - 9, a);
      r(6, 7, 1, H - 12, CREAM);
      r(8, 6, 1, H - 9, d);
      r(3, H - 3, 10, 2, l);
      return true;
    }
    case 'lighthouse': {
      poly(
        c,
        [
          [5, 5],
          [10, 5],
          [13, H - 1],
          [2, H - 1],
        ],
        col,
      );
      r(5, 6, 2, H - 9, l);
      for (let y = 9; y < H - 2; y += 5) r(4, y, 8, 2, a);
      b(4, 2, 8, 5, d);
      r(5, 3, 6, 2, CREAM);
      roof(c, 2, 0, 12, 3, a);
      r(7, H - 5, 2, 5, d);
      return true;
    }
    case 'firewood':
    case 'basket': {
      if (form === 'basket') {
        e(W / 2, H - 10, 6, 5, d);
        e(W / 2, H - 10, 4, 3, CREAM);
      }
      b(1, H - 10, W - 2, 9, col);
      e(W / 2, H - 10, W / 2 - 2, 2, d);
      for (let y = H - 8; y < H - 1; y += 2) r(2, y, W - 4, 1, l);
      for (let x = 3; x < W - 2; x += 3) r(x, H - 9, 1, 8, d);
      if (form === 'firewood')
        for (const [x, y] of [
          [5, H - 9],
          [10, H - 10],
          [8, H - 13],
        ]) {
          e(x, y, 3, 2, WOOD_D);
          e(x - 1, y, 2, 1, WOOD_L);
          r(x, y, 1, 1, WOOD_D);
        }
      return true;
    }
    case 'coat_rack':
    case 'rack': {
      p(W / 2 - 1, 2, 2, H - 2, col);
      p(3, H - 2, W - 6, 2, d);
      for (const [x, y] of [
        [3, 5],
        [W - 4, 8],
      ]) {
        line(c, W / 2, y + 2, x, y, col, 2);
        r(x, y - 2, 1, 3, l);
      }
      poly(
        c,
        [
          [2, 8],
          [6, 7],
          [8, 10],
          [7, H - 5],
          [2, H - 5],
        ],
        a,
      );
      r(3, 9, 1, H - 16, tint(a, 0.3));
      r(10, 10, 3, 5, CREAM);
      return true;
    }
    case 'wheel': {
      const cy = H / 2;
      e(W / 2, cy, 6, 6, d);
      e(W / 2, cy, 4, 4, CREAM);
      for (let n = 0; n < 8; n++) {
        const q = (n * Math.PI) / 4;
        line(c, W / 2, cy, W / 2 + Math.cos(q) * 7, cy + Math.sin(q) * 7, col);
      }
      e(W / 2, cy, 2, 2, a);
      return true;
    }
    case 'phone': {
      b(1, H - 7, W - 2, 6, col);
      e(W / 2, H - 5, 3, 2, a);
      r(7, H - 6, 2, 2, d);
      for (let x = 2; x < W - 2; x++) {
        const y = H - 10 - Math.round(Math.sin(((x - 2) / (W - 4)) * Math.PI) * 2);
        r(x, y, 1, 3, d);
        r(x, y, 1, 1, l);
      }
      r(2, H - 10, 3, 4, col);
      r(W - 5, H - 10, 3, 4, col);
      return true;
    }
    case 'ladder': {
      line(c, 4, 0, 2, H - 1, d, 2);
      line(c, W - 5, 0, W - 3, H - 1, col, 2);
      for (let y = 3; y < H; y += 4) {
        p(4 - y / H, y, W - 8 + (2 * y) / H, 2, col);
        r(5, y, W - 10, 1, l);
      }
      return true;
    }
    case 'cart':
    case 'train': {
      for (const x of [4, W - 5]) {
        e(x, H - 3, 3, 3, INK);
        e(x, H - 3, 1, 1, a);
      }
      b(1, H - 12, W - 3, 8, col);
      r(2, H - 11, W - 6, 2, l);
      if (form === 'train') {
        b(1, H - 15, 7, 5, col);
        r(2, H - 14, 4, 3, a);
        b(W - 7, H - 16, 3, 4, d);
        r(W - 8, H - 17, 5, 1, l);
      } else {
        r(W - 2, H - 12, 2, 8, d);
        for (const [x, y] of [
          [4, H - 14],
          [9, H - 13],
          [6, H - 17],
        ])
          e(x, y, 2, 2, a);
        r(0, H - 9, W, 1, d);
      }
      return true;
    }
    case 'teddy':
    case 'lucky_cat':
    case 'duck':
    case 'fish_trophy':
    case 'rocking_horse': {
      if (form === 'fish_trophy') {
        p(1, H - 4, W - 2, 4, WOOD_D);
        r(7, H - 8, 2, 4, WOOD);
        e(7, H - 10, 5, 3, col);
        poly(
          c,
          [
            [11, H - 10],
            [15, H - 14],
            [15, H - 7],
          ],
          a,
        );
        r(4, H - 11, 1, 1, INK);
        return true;
      }
      if (form === 'rocking_horse') {
        e(W / 2, H - 2, W / 2 - 1, 2, d);
        r(2, H - 4, W - 4, 1, CREAM);
        b(3, 7, W - 6, 4, col);
        b(W - 6, 2, 3, 7, col);
        r(W - 5, 3, 1, 1, INK);
        r(5, 11, 2, 3, a);
        r(W - 7, 11, 2, 3, a);
        r(2, 6, 2, 4, d);
        return true;
      }
      e(W / 2, H - 5, 5, 4, col);
      e(W / 2, H - 11, 4, 4, col);
      e(W / 2 - 1, H - 12, 2, 2, l);
      if (form === 'duck') {
        r(W / 2 + 3, H - 12, 3, 2, a);
        e(5, H - 5, 3, 2, a);
      } else {
        e(4, H - 14, 2, 2, col);
        e(W - 5, H - 14, 2, 2, col);
        r(5, H - 11, 1, 1, INK);
        r(W - 6, H - 11, 1, 1, INK);
        e(W / 2, H - 8, 2, 1, CREAM);
        r(W / 2, H - 9, 1, 1, INK);
        e(3, H - 5, 2, 2, col);
        e(W - 4, H - 5, 2, 2, col);
        r(6, H - 6, 4, 2, a);
      }
      r(4, H - 1, 3, 1, d);
      r(W - 7, H - 1, 3, 1, d);
      return true;
    }
    case 'blocks':
    case 'ball_pit': {
      if (form === 'ball_pit') {
        e(W / 2, H - 5, W / 2 - 1, 5, col);
        e(W / 2, H - 7, W / 2 - 3, 3, d);
      }
      for (const [x, y, v] of [
        [2, H - 6, col],
        [8, H - 6, a],
        [5, H - 11, tint(a, 0.3)],
        [11, H - 10, '#79AAA4'],
      ]) {
        if (form === 'blocks') b(x, y, 5, 5, v);
        else e(x, y, 2, 2, v);
      }
      return true;
    }
    case 'tent':
    case 'dollhouse': {
      if (form === 'dollhouse') {
        b(2, H * 0.4, W - 4, H * 0.6, col);
        roof(c, 0, 0, W, H * 0.43, a);
        r(W / 2, H * 0.45, 1, H * 0.5, d);
        r(3, H * 0.65, W - 6, 1, d);
        for (const [x, y] of [
          [4, H * 0.47],
          [W - 7, H * 0.47],
          [4, H * 0.76],
          [W - 7, H * 0.76],
        ])
          b(x, y, 3, 3, CREAM);
      } else {
        poly(
          c,
          [
            [1, H - 1],
            [W * 0.4, 1],
            [W * 0.64, 3],
            [W - 1, H - 1],
          ],
          a,
        );
        poly(
          c,
          [
            [2, H - 2],
            [W * 0.4, 2],
            [W * 0.54, H - 2],
          ],
          col,
        );
        poly(
          c,
          [
            [W * 0.57, H * 0.38],
            [W * 0.35, H],
            [W * 0.8, H],
          ],
          d,
        );
        line(c, W * 0.4, 2, W * 0.55, H - 2, l);
        r(1, H - 2, W - 2, 2, d);
      }
      return true;
    }
    case 'sewing': {
      p(0, H - 5, W, 3, col);
      foot();
      b(3, H - 14, 4, 9, d);
      b(5, H - 14, 8, 4, col);
      r(11, H - 11, 1, 5, a);
      e(4, H - 12, 2, 2, a);
      r(8, H - 7, 5, 2, CREAM);
      r(5, H - 14, 6, 1, l);
      return true;
    }
    case 'guitar':
    case 'harp': {
      if (form === 'guitar') {
        e(7, H - 5, 5, 4, d);
        e(7, H - 9, 4, 3, col);
        e(7, H - 5, 4, 3, col);
        e(7, H - 7, 1, 1, INK);
        p(7, 1, 2, H - 8, col);
        r(6, 0, 4, 3, a);
        line(c, 8, 3, 8, H - 3, CREAM);
      } else {
        line(c, 3, 1, 3, H - 3, col, 2);
        line(c, 3, 1, W - 3, 5, col, 2);
        line(c, W - 3, 5, W - 5, H - 3, col, 2);
        for (let x = 5; x < W - 4; x += 2) line(c, x, 4, x, H - 4, a);
        p(2, H - 3, W - 4, 3, d);
      }
      return true;
    }
    case 'drums': {
      for (const [x, y, rx] of [
        [W / 2, H - 5, 5],
        [3, H - 11, 3],
        [W - 4, H - 12, 3],
      ]) {
        b(x - rx, y, rx * 2, 5, col);
        e(x, y, rx, 2, CREAM);
        line(c, x - 1, y + 5, x - 2, H - 1, d);
      }
      line(c, 2, 2, W - 2, 7, a);
      return true;
    }
    case 'pottery': {
      e(W / 2, H - 2, 6, 2, d);
      poly(
        c,
        [
          [5, 2],
          [11, 2],
          [10, 6],
          [13, H - 5],
          [11, H - 2],
          [5, H - 2],
          [3, H - 5],
          [6, 6],
        ],
        col,
      );
      e(8, 3, 3, 1, d);
      r(5, 8, 2, 4, l);
      r(4, H - 6, 8, 1, a);
      return true;
    }
    case 'cradle': {
      foot();
      b(1, 3, W - 2, H - 6, col);
      e(W / 2, 4, W / 2 - 2, 2, CREAM);
      r(3, 6, W - 6, 3, a);
      for (let x = 3; x < W - 2; x += 3) p(x, 7, 1, H - 10, d);
      p(0, H - 4, W, 2, col);
      return true;
    }
    default:
      return false;
  }
}

export function star(c, x, y, r, col) {
  if (r <= 3) {
    R(c, x, y - r, 1, r * 2 + 1, col);
    R(c, x - r, y, r * 2 + 1, 1, col);
    R(c, x, y - 1, 1, 1, CREAM);
    return;
  }
  const points = [];
  for (let n = 0; n < 10; n++) {
    const t = -Math.PI / 2 + (n * Math.PI) / 5,
      rr = n % 2 ? r * 0.46 : r;
    points.push([x + Math.cos(t) * rr, y + Math.sin(t) * rr]);
  }
  poly(c, points, col);
  R(c, x - 1, y - 2, 1, 2, CREAM);
}

// A set's construction and textile pattern are visible in addition to its palette.
export function dressFurniture(c, def, W, H) {
  if (def.plush) return;
  const name = (def.type + ' ' + (def.name || '')).toLowerCase(),
    a = def.accent || '#C68F89',
    col = def.color || WOOD;
  const floral = /cottage|floral|rose|blossom|strawberry|garden|flower|fairy|meadow/.test(name),
    carved = /castle|royal|palace|antique|gothic|victorian|celtic/.test(name),
    metal = /space|robot|cyber|industrial|steampunk|diner|modern/.test(name),
    woven = /wicker|rattan|bamboo|coastal|seaside|boho|rustic|cabin/.test(name);
  const image = c.getImageData(0, 0, W, H),
    mask = new Uint8ClampedArray(image.data);
  const dot = (x, y, v) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 1 && x < W - 1 && y >= 1 && y < H - 2 && mask[(y * W + x) * 4 + 3] > 230)
      R(c, x, y, 1, 1, v);
  };
  if (def.flat) {
    for (let y = 3; y < H - 2; y += 3)
      for (let x = 3; x < W - 2; x += 3) {
        const cx = (x - W / 2) / W,
          cy = (y - H / 2) / H,
          ring = Math.sqrt(cx * cx + cy * cy);
        if (/star|moon|space|celestial|witch/.test(name)) {
          if ((x + y) % 6 === 0) {
            dot(x, y, a);
            dot(x + 1, y - 1, a);
            dot(x - 1, y - 1, a);
          }
        } else if (/floral|rose|flower|cottage|strawberry|garden/.test(name)) {
          if ((x + y) % 9 === 0) {
            dot(x, y, a);
            dot(x - 1, y - 1, tint(a, 0.25));
            dot(x + 1, y - 1, a);
            dot(x, y + 1, '#6F925B');
          }
        } else if (ring > 0.25 && ring < 0.44) {
          dot(x, y, tint(col, 0.22));
          dot(x + 1, y + 1, tint(a, -0.15));
        } else if ((x + y) % 9 === 0) dot(x, y, tint(col, -0.12));
      }
    return;
  }
  if (floral)
    for (let x = 4; x < W - 3; x += 7) {
      const y = Math.max(4, H - 9);
      dot(x, y, a);
      dot(x + 1, y - 1, tint(a, 0.4));
      dot(x + 2, y, a);
      dot(x + 1, y + 1, tint(a, -0.2));
      dot(x + 1, y + 2, '#6F925B');
    }
  if (carved)
    for (const x of [3, W - 4])
      for (let y = 4; y < H - 4; y += 5) {
        dot(x, y, '#D9B783');
        dot(x + 1, y + 1, '#D9B783');
        dot(x, y + 2, tint(col, -0.3));
      }
  if (metal)
    for (const [x, y] of [
      [3, 3],
      [W - 4, 3],
      [3, H - 5],
      [W - 4, H - 5],
    ]) {
      dot(x, y, CREAM);
      dot(x + 1, y + 1, tint(col, -0.4));
    }
  if (woven)
    for (let y = 5; y < H - 4; y += 4)
      for (let x = 3 + (y % 3); x < W - 3; x += 4) {
        dot(x, y, tint(col, 0.24));
        dot(x + 1, y + 1, tint(col, -0.2));
      }
}

export function paintWallDetail(c, def) {
  const form = def.form || def.type,
    col = def.color || WOOD,
    a = def.accent || '#C68F89',
    d = tint(col, -0.3),
    l = tint(col, 0.3),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v);
  switch (form) {
    case 'cuckoo': {
      box(c, 4, 5, 12, 10, col);
      roof(c, 2, 0, 16, 6, col);
      oval(c, 10, 10, 3, 3, CREAM);
      r(10, 7, 1, 3, d);
      r(10, 10, 2, 1, d);
      line(c, 8, 15, 8, 17, WOOD_D);
      line(c, 12, 15, 12, 17, WOOD_D);
      r(7, 17, 2, 1, a);
      r(11, 16, 2, 2, a);
      r(9, 4, 2, 1, INK);
      return true;
    }
    case 'board': {
      box(c, 0, 1, 20, 16, col);
      r(2, 3, 15, 12, '#C9A272');
      for (const [x, y, v] of [
        [3, 4, CREAM],
        [10, 6, '#E4B4A3'],
        [5, 10, '#B7D4BD'],
      ]) {
        box(c, x, y, 5, 5, v);
        r(x + 2, y, 1, 1, '#A96E75');
        r(x + 1, y + 2, 2, 1, '#B9AA90');
      }
      return true;
    }

    case 'wreath':
    case 'garland': {
      const ring = form === 'wreath';
      for (let n = 0; n < (ring ? 12 : 8); n++) {
        const t = (n / (ring ? 12 : 7)) * Math.PI * (ring ? 2 : 1),
          x = ring ? 10 + Math.cos(t) * 6 : 1 + n * 2.5,
          y = ring ? 8 + Math.sin(t) * 6 : 3 + Math.sin(t) * 4;
        leaf(c, x, y, 2, 2, col);
        if (n % 3 === 0) flower(c, x, y, a);
      }
      r(8, 14, 4, 2, a);
      return true;
    }
    case 'dreamcatcher':
    case 'hoop': {
      oval(c, 10, 7, 6, 6, d);
      oval(c, 10, 7, 5, 5, CREAM);
      for (let n = 0; n < 6; n++) {
        const q = (n * Math.PI) / 3;
        line(c, 10, 7, 10 + Math.cos(q) * 4, 7 + Math.sin(q) * 4, a);
      }
      if (form === 'dreamcatcher')
        for (const [x, y] of [
          [5, 12],
          [10, 13],
          [15, 12],
        ]) {
          line(c, x, y, x, 17, col);
          r(x - 1, 15, 2, 2, a);
        }
      else flower(c, 10, 7, a);
      return true;
    }
    case 'hanging':
    case 'plant_shelf':
    case 'wall_shelf':
    case 'shelf': {
      plank(c, 0, 12, 20, 3, col);
      r(2, 15, 2, 2, d);
      r(16, 15, 2, 2, d);
      if (form === 'hanging') {
        line(c, 10, 0, 2, 11, d);
        line(c, 10, 0, 18, 11, d);
      }
      for (const [x, y] of [
        [3, 8],
        [10, 6],
        [15, 9],
      ]) {
        box(c, x, y, 4, 12 - y, a);
        leaf(c, x + 2, y - 1, 3, 2, '#6F925B');
        r(x + 1, y + 1, 1, 2, tint(a, 0.3));
      }
      return true;
    }
    case 'hanging_lantern':
    case 'sconce': {
      r(9, 0, 2, 5, d);
      box(c, 5, 5, 10, 10, col);
      r(7, 7, 6, 6, a);
      r(7, 7, 1, 4, CREAM);
      r(9, 6, 1, 8, d);
      r(4, 4, 12, 2, l);
      r(6, 15, 8, 2, d);
      return true;
    }
    case 'banner':
    case 'tapestry':
    case 'quilt':
    case 'pennants': {
      plank(c, 1, 0, 18, 2, WOOD_D);
      if (form === 'pennants') {
        for (let x = 2; x < 19; x += 5)
          poly(
            c,
            [
              [x, 3],
              [x + 4, 3],
              [x + 2, 9],
            ],
            x % 2 ? a : col,
          );
        return true;
      }
      poly(
        c,
        [
          [3, 2],
          [17, 2],
          [17, 15],
          [10, 18],
          [3, 15],
        ],
        col,
      );
      r(4, 3, 1, 11, l);
      r(15, 3, 1, 11, d);
      if (form === 'quilt')
        for (let y = 4; y < 15; y += 4)
          for (let x = 5; x < 15; x += 4) box(c, x, y, 3, 3, (x + y) % 8 ? a : l);
      else {
        star(c, 10, 8, 4, a);
        r(5, 13, 10, 1, a);
      }
      return true;
    }
    case 'wall_guitar': {
      oval(c, 10, 13, 4, 4, d);
      oval(c, 9, 12, 3, 3, col);
      oval(c, 10, 8, 3, 2, col);
      r(9, 0, 2, 9, a);
      r(9, 1, 1, 13, CREAM);
      r(9, 11, 2, 2, INK);
      return true;
    }
    case 'string_lights': {
      for (let x = 0; x < 20; x++) {
        const y = 3 + Math.round(Math.sin((x / 19) * Math.PI) * 4);
        r(x, y, 1, 1, WOOD_D);
        if (x % 4 === 2) {
          r(x, y + 1, 1, 1, d);
          oval(c, x, y + 3, 1, 2, x % 8 === 2 ? col : a);
          r(x, y + 2, 1, 1, CREAM);
        }
      }
      return true;
    }
    case 'mounted_fish': {
      box(c, 1, 2, 18, 14, col);
      oval(c, 9, 9, 5, 3, a);
      poly(
        c,
        [
          [13, 9],
          [17, 6],
          [17, 12],
        ],
        tint(a, -0.2),
      );
      r(6, 8, 1, 1, INK);
      r(7, 7, 4, 1, tint(a, 0.3));
      r(4, 14, 11, 1, d);
      return true;
    }
    case 'mosaic': {
      box(c, 0, 0, 20, 18, d);
      for (let y = 2; y < 17; y += 3)
        for (let x = 2; x < 19; x += 3) {
          const wave = Math.abs(x - 10) + Math.abs(y - 8) < 7;
          R(c, x, y, 2, 2, wave ? a : col);
          R(c, x, y, 1, 1, tint(wave ? a : col, 0.3));
        }
      return true;
    }
    case 'heart_sign': {
      box(c, 1, 2, 18, 14, col);
      oval(c, 7, 7, 3, 2, a);
      oval(c, 12, 7, 3, 2, a);
      poly(
        c,
        [
          [4, 8],
          [15, 8],
          [10, 14],
        ],
        a,
      );
      r(5, 6, 2, 1, tint(a, 0.35));
      return true;
    }
    default:
      return false;
  }
}
