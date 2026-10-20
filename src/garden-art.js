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

export function paintGardenDetail(c, type, W, H, season) {
  const B = H - 1,
    col = season === 'winter' ? '#C5D3C5' : season === 'autumn' ? '#B58B56' : '#6F925B',
    dark = tint(col, -0.28),
    r = (x, y, w, h, v) => R(c, x, y, w, h, v);
  switch (type) {
    case 'moss':
    case 'clover': {
      for (const [x, y, rx] of [
        [4, B - 3, 3],
        [10, B - 5, 4],
        [13, B - 2, 2],
      ]) {
        if (type === 'moss') {
          oval(c, x, y, rx, 2, dark);
          oval(c, x - 1, y - 1, rx - 1, 1, col);
          r(x, y - 1, 2, 1, '#9DBA74');
        } else {
          for (const [dx, dy] of [
            [-1, -1],
            [1, -1],
            [-1, 1],
            [1, 1],
          ])
            oval(c, x + dx, y + dy, 1, 1, col);
          r(x, y, 1, 1, dark);
          r(x + 1, y + 2, 1, 2, dark);
        }
      }
      return true;
    }
    case 'flower':
    case 'flowers':
    case 'lavender':
    case 'sunflower':
    case 'daisy':
    case 'blueflower':
    case 'bellflower': {
      const color =
        {
          lavender: '#A99CC9',
          sunflower: '#E8C25A',
          daisy: CREAM,
          blueflower: '#79AAA4',
          bellflower: '#9C82C9',
        }[type] || '#C68F89';
      const points =
        type === 'sunflower'
          ? [
              [5, B - 13],
              [12, B - 8],
            ]
          : [
              [3, B - 5],
              [8, B - 10],
              [12, B - 6],
            ];
      for (const [x, y] of points) {
        line(c, x, B, x, y + 2, dark);
        leaf(c, x - 1, y + 5, 2, 1, col);
        r(x + 1, y + 7, 2, 1, col);
        if (type === 'lavender') {
          for (let n = 0; n < 4; n++) {
            oval(c, x + (n % 2), y + n * 2, 1, 1, n % 2 ? color : tint(color, 0.3));
            r(x + 1, y + n * 2, 1, 1, tint(color, -0.2));
          }
        } else if (type === 'bellflower') {
          line(c, x, y + 2, x + 2, y, color);
          poly(
            c,
            [
              [x + 1, y],
              [x + 3, y],
              [x + 5, y + 4],
              [x, y + 4],
            ],
            color,
          );
          r(x + 1, y + 3, 2, 1, CREAM);
        } else if (type === 'sunflower') {
          for (let n = 0; n < 8; n++) {
            const t = (n * Math.PI) / 4;
            oval(c, x + Math.cos(t) * 3, y + Math.sin(t) * 3, 1, 1, color);
          }
          oval(c, x, y, 2, 2, WOOD_D);
          r(x - 1, y - 1, 1, 1, WOOD_L);
        } else {
          flower(c, x, y, color);
          r(x + 1, y + 1, 1, 1, tint(color, -0.2));
        }
      }
      return true;
    }
    case 'butterflies': {
      for (const [x, y, v] of [
        [4, 6, '#C68F89'],
        [11, 11, '#E8C25A'],
      ]) {
        oval(c, x - 2, y, 2, 2, v);
        oval(c, x + 2, y, 2, 2, v);
        r(x, y - 1, 1, 4, INK);
        r(x - 2, y - 1, 1, 1, CREAM);
      }
      return true;
    }
    case 'pumpkin':
    case 'pumpkins': {
      for (const [x, y, rx] of type === 'pumpkins'
        ? [
            [4, 12, 3],
            [11, 11, 4],
            [8, 6, 3],
          ]
        : [[8, 10, 6]]) {
        oval(c, x, y, rx, 4, '#A96F3D');
        oval(c, x - 1, y - 1, rx - 1, 3, '#D8A060');
        line(c, x, y - 3, x, y + 2, '#B88D60');
        r(x - 1, y - 4, 2, 2, WOOD_D);
        r(x - 2, y - 2, 1, 3, '#E8BB83');
      }
      return true;
    }
    case 'pillar': {
      box(c, 3, 0, 10, 4, '#C4BFB3');
      box(c, 5, 4, 6, H - 7, '#A9A397');
      r(6, 5, 1, H - 10, '#E0DCCF');
      r(9, 4, 1, H - 8, '#8E897E');
      box(c, 2, H - 4, 12, 4, '#9A958A');
      leaf(c, 4, H - 5, 3, 1, col);
      return true;
    }
    case 'gravestone': {
      oval(c, 8, 5, 5, 4, '#8E897E');
      box(c, 3, 5, 10, H - 6, '#9A958A');
      r(4, 5, 1, H - 9, '#C4BFB3');
      r(7, 6, 3, 1, '#6E6A62');
      r(8, 7, 1, 4, '#6E6A62');
      leaf(c, 4, H - 3, 3, 2, col);
      r(11, 4, 1, 2, '#6E6A62');
      return true;
    }
    case 'lantern': {
      plank(c, 7, 9, 2, H - 9, WOOD_D);
      box(c, 3, 3, 10, 9, '#775B46');
      r(5, 5, 6, 5, '#F2D39A');
      r(5, 5, 1, 4, CREAM);
      r(8, 4, 1, 7, WOOD_D);
      roof(c, 1, 0, 14, 4, '#9A958A');
      r(5, H - 2, 6, 2, WOOD_D);
      return true;
    }
    case 'hay': {
      box(c, 1, H - 10, 14, 10, '#D9B783');
      oval(c, 8, H - 10, 6, 2, '#E9CE97');
      for (let x = 3; x < 14; x += 2) line(c, x, H - 8, x - 1, H - 2, '#B88D60');
      r(3, H - 7, 10, 1, '#9F7F50');
      r(2, H - 3, 12, 1, '#9F7F50');
      return true;
    }
    case 'beehive': {
      plank(c, 7, H - 7, 2, 7, WOOD_D);
      for (let n = 0; n < 4; n++) {
        const rx = 3 + Math.min(n, 3 - n);
        oval(c, 8, 4 + n * 3, rx, 2, n % 2 ? '#C89B57' : '#D9B783');
        r(8 - rx + 1, 3 + n * 3, 3, 1, '#F2D39A');
      }
      oval(c, 8, 11, 2, 1, INK);
      r(10, 5, 1, 1, CREAM);
      return true;
    }
    case 'coral': {
      for (const [x, y, v] of [
        [4, H - 8, '#C68F89'],
        [9, H - 12, '#E4B4A3'],
        [12, H - 7, '#A99CC9'],
      ]) {
        line(c, x, H - 1, x, y, v, 2);
        line(c, x, y + 4, x - 3, y + 1, v, 2);
        line(c, x, y + 6, x + 2, y + 2, v, 2);
        r(x, y + 1, 1, 3, tint(v, 0.3));
      }
      oval(c, 8, H - 1, 7, 1, '#D5C5A4');
      return true;
    }
    case 'bones': {
      line(c, 3, B - 9, 12, B - 4, '#C5B99B', 3);
      line(c, 3, B - 10, 12, B - 5, CREAM, 2);
      for (const [x, y] of [
        [2, B - 10],
        [4, B - 9],
        [11, B - 5],
        [13, B - 4],
      ])
        oval(c, x, y, 1, 1, CREAM);
      r(5, B - 3, 5, 1, '#D5C5A4');
      return true;
    }
    case 'shell': {
      poly(
        c,
        [
          [2, B - 5],
          [3, B - 10],
          [7, B - 12],
          [12, B - 10],
          [14, B - 6],
          [10, B - 2],
          [5, B - 2],
        ],
        '#C68F89',
      );
      for (const x of [4, 7, 10, 12]) line(c, 8, B - 2, x, B - 9, '#E4B4A3');
      r(5, B - 9, 3, 1, CREAM);
      r(6, B - 2, 4, 1, '#A96E75');
      return true;
    }
    case 'waterbowl':
    case 'foodbowl': {
      const bowl = type === 'foodbowl' ? '#C68F89' : '#79AAA4';
      oval(c, 8, B - 3, 7, 3, tint(bowl, -0.3));
      oval(c, 8, B - 5, 6, 2, '#D5C5A4');
      oval(c, 8, B - 5, 4, 1, type === 'foodbowl' ? '#B88D60' : '#79AAA4');
      if (type === 'foodbowl') for (const x of [5, 8, 11]) r(x, B - 6 + (x % 2), 1, 1, WOOD_D);
      r(3, B - 4, 2, 1, CREAM);
      return true;
    }
    case 'petbed': {
      oval(c, 8, B - 4, 7, 4, dark);
      oval(c, 8, B - 5, 5, 2, '#E4B4A3');
      oval(c, 7, B - 5, 3, 1, '#F3E9CF');
      r(2, B - 4, 2, 2, col);
      r(13, B - 4, 2, 2, col);
      return true;
    }
    case 'tunnel': {
      oval(c, 8, B - 5, 7, 5, WOOD_D);
      oval(c, 8, B - 6, 6, 4, WOOD);
      oval(c, 9, B - 4, 4, 3, INK);
      r(3, B - 8, 3, 1, WOOD_L);
      line(c, 10, B - 8, 13, B - 5, WOOD_D);
      leaf(c, 3, B - 1, 3, 1, col);
      return true;
    }
    default:
      return false;
  }
}

export function paintCrop(c, crop, stage) {
  const id = crop.id || '',
    col = crop.color || '#C68F89',
    dark = '#3F604A',
    leafCol = '#6F925B',
    light = '#9DBA74';
  if (stage === 0) {
    for (const [x, y] of [
      [5, 15],
      [10, 14],
    ]) {
      oval(c, x, y, 2, 1, '#775B46');
      R(c, x - 1, y - 1, 2, 1, '#D9B783');
      R(c, x, y, 1, 1, '#F3E9CF');
    }
    return;
  }
  if (stage === 1) {
    line(c, 8, 17, 8, 12, dark);
    leaf(c, 5, 12, 3, 1, leafCol);
    leaf(c, 10, 10, 3, 2, leafCol);
    R(c, 9, 9, 2, 1, light);
    R(c, 7, 16, 3, 1, dark);
    return;
  }
  const ready = stage === 3,
    flowerCrop = crop.shape === 'flower',
    root = crop.shape === 'root',
    vine = /pea|bean|tomato|grape|cucumber|berry|pepper/.test(id),
    grain = /corn|wheat|rice|oat/.test(id),
    squash = /pumpkin|melon|squash|cabbage|lettuce|kale/.test(id);
  if (root) {
    for (const [x, y] of [
      [5, 8],
      [9, 5],
      [11, 9],
    ]) {
      line(c, 8, 17, x, y, dark);
      leaf(c, x, y, 2, 3, leafCol);
      R(c, x - 1, y - 2, 1, 2, light);
    }
    if (ready) {
      oval(c, 8, 15, 4, 3, tint(col, -0.2));
      oval(c, 7, 14, 3, 2, col);
      R(c, 6, 13, 2, 1, tint(col, 0.3));
      R(c, 8, 18, 1, 2, WOOD_D);
    }
    return;
  }
  if (squash) {
    for (const [x, y] of [
      [4, 13],
      [10, 9],
      [12, 15],
    ]) {
      leaf(c, x, y, 3, 2, leafCol);
      R(c, x - 1, y - 1, 2, 1, light);
    }
    line(c, 3, 18, 13, 16, dark);
    if (ready) {
      oval(c, 8, 13, 6, 5, tint(col, -0.25));
      oval(c, 7, 12, 5, 4, col);
      for (const x of [5, 8, 11]) line(c, x, 9, x, 16, tint(col, -0.1));
      R(c, 5, 10, 2, 1, tint(col, 0.3));
      R(c, 8, 7, 2, 3, WOOD_D);
    }
    return;
  }
  const top = flowerCrop ? 5 : grain ? 3 : 7;
  line(c, 8, 18, 8, top, dark, 2);
  for (const [x, y] of [
    [5, 13, -1],
    [11, 10, 1],
    [5, 7, -1],
  ]) {
    leaf(c, x, y, 3, 1, leafCol);
    line(c, 8, y + 2, x, y, light);
  }
  if (vine) {
    line(c, 3, 18, 3, 3, WOOD_L);
    line(c, 13, 18, 13, 3, WOOD_D);
    R(c, 2, 5, 12, 1, WOOD);
    R(c, 2, 12, 12, 1, WOOD);
  }
  if (ready) {
    if (flowerCrop) {
      flower(c, 8, 5, col);
      R(c, 7, 4, 2, 2, '#E8C25A');
      if (/sunflower/.test(id)) {
        oval(c, 8, 5, 4, 4, col);
        oval(c, 8, 5, 2, 2, WOOD_D);
        R(c, 7, 4, 1, 1, WOOD_L);
      }
    } else if (grain) {
      for (let y = 3; y < 11; y += 3) {
        leaf(c, 6, y, 2, 1, col);
        leaf(c, 10, y + 1, 2, 1, col);
      }
      R(c, 7, 2, 1, 7, tint(col, 0.35));
    } else
      for (const [x, y] of [
        [5, 9],
        [11, 7],
        [10, 14],
      ]) {
        oval(c, x, y, 2, 2, tint(col, -0.3));
        oval(c, x - 1, y - 1, 1, 1, col);
        R(c, x - 1, y - 1, 1, 1, tint(col, 0.3));
        R(c, x, y - 3, 1, 1, dark);
      }
  }
}
