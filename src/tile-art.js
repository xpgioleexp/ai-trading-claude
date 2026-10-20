import { R, oval, poly, line, leaf, flower, tint } from './art-style.js';
import { star } from './furniture-details.js';

// Native 16 px repeat units. Decorative detail wraps; no dark square is baked around a tile.
export function paintTile(c, pattern, a, b) {
  const alias = {
      linen: 'plain',
      sage_stripe: 'stripe',
      rose_floral: 'floral',
      wood_panel: 'panel',
      blue_check: 'check',
      starry: 'stars',
      mint_dots: 'dots',
      dark_wood: 'planks',
      rose_carpet: 'carpet',
      moss: 'grass',
    },
    p = alias[pattern] || pattern,
    mid = tint(a, -0.08),
    hi = tint(a, 0.12),
    r = (x, y, w, h, v = b) => R(c, x, y, w, h, v);
  r(0, 0, 16, 16, a);
  switch (p) {
    case 'plain': {
      for (const [x, y] of [
        [2, 4],
        [10, 12],
        [6, 8],
        [14, 0],
      ]) {
        r(x, y, 2, 1, hi);
        r(x, y + 1, 1, 1, mid);
      }
      return true;
    }
    case 'stripe':
    case 'thin_stripe':
    case 'stripes': {
      const horizontal = p === 'stripes',
        width = p === 'thin_stripe' ? 1 : 4;
      for (const n of [2, 10]) {
        if (horizontal) {
          r(0, n, 16, width);
          r(0, n, 16, 1, tint(b, 0.15));
          r(0, n + width, 16, 1, mid);
        } else {
          r(n, 0, width, 16);
          r(n, 0, 1, 16, tint(b, 0.15));
          r(n + width, 0, 1, 16, mid);
        }
      }
      return true;
    }
    case 'dots':
    case 'big_dots': {
      for (const [x, y] of [
        [4, 4],
        [12, 12],
      ]) {
        oval(c, x, y, p === 'dots' ? 1 : 3, p === 'dots' ? 1 : 3, b);
        r(x - 1, y - 1, 1, 1, tint(b, 0.25));
      }
      return true;
    }
    case 'check':
    case 'checker':
    case 'plaid': {
      for (const [x, y] of [
        [0, 0],
        [8, 8],
      ]) {
        r(x, y, 8, 8, b);
        r(x, y, 8, 1, tint(b, 0.13));
        r(x, y, 1, 8, tint(b, 0.13));
      }
      if (p === 'plaid') {
        r(0, 3, 16, 1, hi);
        r(3, 0, 1, 16, hi);
        r(0, 11, 16, 1, hi);
        r(11, 0, 1, 16, hi);
      }
      return true;
    }
    case 'floral':
    case 'leaves': {
      for (const [x, y] of [
        [4, 4],
        [12, 12],
      ]) {
        line(c, x, y + 2, x + 1, y + 6, tint(b, -0.2));
        leaf(c, x + 2, y + 4, 2, 1, p === 'floral' ? '#9DBA74' : b);
        if (p === 'floral') {
          flower(c, x, y, b);
          r(x - 1, y - 1, 1, 1, tint(b, 0.4));
        } else {
          leaf(c, x - 1, y, 3, 2, b);
          r(x - 2, y - 1, 1, 1, tint(b, 0.25));
        }
      }
      return true;
    }
    case 'stars':
    case 'hearts':
    case 'moons': {
      for (const [x, y] of [
        [4, 4],
        [12, 12],
      ]) {
        if (p === 'stars') star(c, x, y, 2, b);
        else if (p === 'moons') {
          oval(c, x, y, 3, 3, b);
          oval(c, x + 1, y - 1, 2, 2, a);
          r(x - 2, y + 1, 1, 1, tint(b, 0.2));
        } else {
          r(x - 2, y - 1, 2, 2);
          r(x + 1, y - 1, 2, 2);
          r(x - 2, y + 1, 5, 1);
          r(x - 1, y + 2, 3, 1);
          r(x, y + 3, 1, 1);
          r(x - 1, y - 1, 1, 1, tint(b, 0.3));
        }
      }
      return true;
    }
    case 'waves':
    case 'zigzag': {
      for (let x = 0; x < 16; x++) {
        const dy =
          p === 'waves' ? Math.round(Math.sin((x * Math.PI) / 8) * 2) : Math.abs((x % 8) - 4) - 2;
        for (const y of [4, 12]) {
          r(x, y + dy, 1, 2);
          r(x, y + dy, 1, 1, tint(b, 0.25));
          r(x, y + dy + 2, 1, 1, mid);
        }
      }
      return true;
    }
    case 'brick':
    case 'stone':
    case 'cobble': {
      const blocks =
        p === 'brick'
          ? [
              [0, 0, 8, 4],
              [8, 0, 8, 4],
              [-4, 4, 8, 4],
              [4, 4, 8, 4],
              [12, 4, 8, 4],
              [0, 8, 8, 4],
              [8, 8, 8, 4],
              [-4, 12, 8, 4],
              [4, 12, 8, 4],
              [12, 12, 8, 4],
            ]
          : [
              [0, 0, 7, 6],
              [8, 0, 8, 7],
              [0, 7, 5, 8],
              [6, 8, 6, 8],
              [13, 8, 5, 7],
            ];
      for (const [x, y, w, h] of blocks) {
        r(x, y, w - 1, h - 1, b);
        r(x + 1, y + 1, w - 3, h - 3, a);
        r(x + 1, y + 1, w - 3, 1, hi);
        r(x + 1, y + h - 2, w - 3, 1, mid);
        if (p !== 'brick') r(x + 2, y + 3, 2, 1, tint(a, -0.04));
      }
      return true;
    }
    case 'panel':
    case 'wainscot': {
      const y = p === 'wainscot' ? 8 : 0;
      if (y) r(0, y, 16, 8, b);
      for (const x of [0, 8]) {
        r(x, y, 1, 16 - y, tint(b, -0.2));
        r(x + 1, y + 1, 6, 1, tint(b, 0.3));
        r(x + 1, y + 1, 1, 14 - y, tint(b, 0.2));
        r(x + 6, y + 2, 1, 13 - y, tint(b, -0.15));
        r(x + 2, y + 3, 3, 1, mid);
      }
      return true;
    }
    case 'diamond':
    case 'damask': {
      for (const [x, y] of [
        [4, 4],
        [12, 12],
      ]) {
        poly(
          c,
          [
            [x, y - 4],
            [x + 4, y],
            [x, y + 4],
            [x - 4, y],
          ],
          b,
        );
        poly(
          c,
          [
            [x, y - 2],
            [x + 2, y],
            [x, y + 2],
            [x - 2, y],
          ],
          a,
        );
        if (p === 'damask') {
          r(x, y - 3, 1, 6);
          r(x - 2, y, 5, 1);
          r(x - 1, y - 2, 1, 1, tint(b, 0.3));
        }
      }
      return true;
    }
    case 'scallop': {
      for (const [x, y] of [
        [-4, 6],
        [4, 6],
        [12, 6],
        [0, 14],
        [8, 14],
        [16, 14],
      ]) {
        oval(c, x, y, 4, 4, b);
        oval(c, x, y - 1, 3, 3, a);
        r(x - 1, y - 3, 2, 1, tint(b, 0.35));
      }
      return true;
    }
    case 'grid':
    case 'tiles':
    case 'big_tiles':
    case 'hex': {
      const n = p === 'big_tiles' ? 16 : 8;
      for (let y = 0; y < 16; y += n)
        for (let x = 0; x < 16; x += n) {
          r(x, y, n, 1, b);
          r(x, y, 1, n, b);
          r(x + 1, y + 1, n - 2, 1, hi);
          r(x + 1, y + 2, 1, n - 3, hi);
          r(x + n - 1, y + 1, 1, n - 1, mid);
          if (p === 'hex') {
            r(x, y, 2, 2, b);
            r(x + n - 2, y + n - 2, 2, 2, b);
          }
        }
      return true;
    }
    case 'clouds': {
      for (const [x, y] of [
        [3, 4],
        [11, 12],
      ]) {
        oval(c, x, y, 3, 2, tint(b, -0.08));
        oval(c, x + 2, y - 1, 3, 2, b);
        r(x - 1, y - 2, 2, 1, hi);
        r(x - 2, y + 1, 7, 1, b);
      }
      return true;
    }
    case 'rainbow': {
      const colors = ['#C68F89', '#D5A476', '#E1C679', '#9DBA74', '#79AAA4', '#A99CC9'];
      colors.forEach((v, n) => {
        for (let x = 0; x < 16; x++)
          r(x, 2 + n * 2 + Math.round(Math.sin((x * Math.PI) / 8)), 1, 1, v);
      });
      return true;
    }
    case 'planks':
    case 'herringbone':
    case 'parquet': {
      for (let y = 0; y < 16; y += 4)
        for (let x = -8; x < 16; x += 8) {
          const dx = x + ((y / 4) % 2) * 4;
          r(dx, y, 8, 1, b);
          r(dx, y, 1, 4, b);
          r(dx + 1, y + 1, 6, 1, hi);
          r(dx + 2, y + 3, 3, 1, mid);
          if (p !== 'planks') {
            line(c, dx + 1, y + 1, dx + 4, y + 3, tint(a, -0.06));
            r(dx + 6, y + 2, 1, 1, tint(b, 0.2));
          }
        }
      return true;
    }
    case 'carpet':
    case 'tatami': {
      for (let y = 0; y < 16; y += 2)
        for (let x = y % 4 ? 0 : 1; x < 16; x += 2) r(x, y, 1, 1, (x + y) % 4 ? hi : mid);
      if (p === 'tatami') {
        r(0, 0, 16, 1, b);
        r(0, 15, 16, 1, b);
        r(0, 1, 16, 1, tint(b, 0.25));
      }
      return true;
    }
    case 'marble': {
      for (let x = 0; x < 16; x++) {
        const y = Math.round(3 + Math.sin(x / 3) * 2 + x * 0.6) % 16;
        r(x, y, 1, 1, b);
        r(x, (y + 1) % 16, 1, 1, tint(a, -0.05));
        if (x % 4 === 0) r(x, (y + 9) % 16, 2, 1, hi);
      }
      return true;
    }
    case 'terrazzo':
    case 'mosaic': {
      for (let y = 0; y < 16; y += 4)
        for (let x = 0; x < 16; x += 4) {
          const v = (x + y) % 8 ? b : hi;
          if (p === 'mosaic') {
            r(x + 1, y + 1, 3, 3, v);
            r(x + 1, y + 1, 2, 1, tint(v, 0.2));
          } else {
            poly(
              c,
              [
                [x + 1, y + 1],
                [x + 3, y],
                [x + 3, y + 2],
              ],
              v,
            );
            r(x, y + 3, 1, 1, mid);
          }
        }
      return true;
    }
    case 'grass':
    case 'sand': {
      for (const [x, y] of [
        [3, 4],
        [11, 12],
        [7, 8],
      ]) {
        r(x, y, 2, 1, b);
        r(x + 1, y - 1, 1, 1, hi);
        if (p === 'grass') {
          r(x, y - 2, 1, 2, b);
          r(x - 1, y - 1, 1, 1, mid);
        }
      }
      return true;
    }
    default:
      return false;
  }
}

export function paintGround(c, kind, variant, colors) {
  const [base, ,] = colors,
    light = tint(base, 0.12),
    dark = tint(base, -0.13),
    r = (x, y, w, h, v) => R(c, x, y, w, h, v),
    x = 3 + ((variant * 5) % 9),
    y = 4 + ((variant * 3) % 8);
  r(0, 0, 16, 16, base);
  if (['sand', 'dune'].includes(kind)) {
    line(c, 1, 4 + variant, 5, 3 + variant, tint(base, -0.06));
    r(9, 11, 3, 1, tint(base, 0.1));
    r(x, y, 1, 1, dark);
    r(x + 1, y + 1, 1, 1, light);
    if (variant === 3) r(4, 12, 2, 1, '#F3E9CF');
  } else if (kind === 'winter') {
    r(x, y, 4, 1, tint(base, -0.06));
    r(x - 1, y + 1, 6, 1, tint(base, -0.03));
    r(x, y - 1, 3, 1, light);
    if (variant === 3) {
      r(10, 5, 1, 3, light);
      r(9, 6, 3, 1, light);
    }
  } else if (kind === 'stone') {
    for (const [xx, yy] of [
      [2, 5],
      [10, 12],
    ]) {
      poly(
        c,
        [
          [xx, yy],
          [xx + 4, yy - 1],
          [xx + 5, yy + 2],
          [xx + 1, yy + 3],
        ],
        tint(base, -0.04),
      );
      r(xx + 1, yy, 2, 1, tint(base, 0.08));
    }
    r(x, y, 2, 1, tint(base, -0.12));
  } else if (kind === 'cloud') {
    r(x, y, 1, 3, light);
    r(x - 1, y + 1, 3, 1, light);
    r(13 - x, 14 - y, 1, 1, tint(base, 0.2));
  } else {
    r(x, y - 2, 1, 3, dark);
    r(x - 1, y - 1, 1, 1, tint(base, -0.07));
    r(x + 1, y - 3, 1, 3, light);
    r(x + 2, y - 1, 1, 1, dark);
    r((x + 7) % 14, (y + 6) % 14, 2, 1, tint(base, 0.07));
    if (variant === 3) {
      r(5, 10, 1, 2, tint(base, -0.1));
      flower(c, 5, 8, kind === 'blossom' ? '#E4B4A3' : '#F3E9CF');
    }
  }
}
