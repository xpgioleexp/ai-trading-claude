import {
  R,
  oval,
  poly,
  line,
  box,
  plank,
  leaf,
  flower,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintGardenDetail } from './garden-art.js';
export function paintNature(c, type, w, h, season = 'spring') {
  if (paintGardenDetail(c, type, w, h, season)) return true;
  const base = season === 'autumn' ? '#C98A44' : season === 'winter' ? '#B7CABE' : '#6F925B',
    dark = season === 'autumn' ? '#9A5E30' : '#3F604A',
    bottom = h - 1,
    r = (x, y, ww, hh, col) => R(c, x, y, ww, hh, col);
  if (['bush', 'berrybush', 'moss', 'clover'].includes(type)) {
    const flat = ['moss', 'clover'].includes(type);
    for (const [x, y, rx, ry] of [
      [4, bottom - 4, 4, flat ? 2 : 4],
      [10, bottom - 6, 5, flat ? 2 : 5],
      [12, bottom - 3, 3, flat ? 2 : 3],
    ])
      leaf(c, x, y, rx, ry, base);
    if (type === 'berrybush' || type === 'bush')
      for (const [x, y] of [
        [4, bottom - 5],
        [10, bottom - 7],
        [11, bottom - 3],
      ]) {
        r(x, y, 2, 2, '#A96E75');
        r(x, y, 1, 1, '#E4B4A3');
      }
    return true;
  }
  if (['fern', 'tallgrass', 'reeds', 'cattail'].includes(type)) {
    for (let n = 0; n < 5; n++) {
      const x = 2 + n * 3,
        top = bottom - (6 + ((n * 7) % 8));
      line(c, x, bottom, x + (n < 2 ? -1 : 1), top, dark);
      if (type === 'fern') {
        for (let y = top + 2; y < bottom - 1; y += 3) {
          r(x - 2, y, 2, 1, base);
          r(x + 1, y + 1, 2, 1, '#9DBA74');
        }
      } else {
        r(x + 1, top + 2, 1, bottom - top - 2, base);
        if (type === 'cattail') box(c, x - 1, top - 2, 3, 4, WOOD_D);
      }
    }
    return true;
  }
  if (
    [
      'lavender',
      'sunflower',
      'daisy',
      'flower',
      'flowers',
      'blueflower',
      'bellflower',
      'butterflies',
    ].includes(type)
  ) {
    const col =
      {
        lavender: '#9C82C9',
        sunflower: '#E8C25A',
        daisy: CREAM,
        blueflower: '#79AAA4',
        bellflower: '#A99CC9',
        butterflies: '#E4B4A3',
      }[type] || '#C68F89';
    for (const [x, y] of [
      [3, bottom - 5],
      [8, bottom - 9],
      [12, bottom - 6],
    ]) {
      line(c, x, y + 2, x, bottom, dark);
      r(x + 1, y + 4, 2, 1, base);
      flower(c, x, y, col);
      if (type === 'sunflower') r(x, y, 1, 1, WOOD_D);
    }
    return true;
  }
  if (['mushroom', 'tallmushroom', 'glowshroom', 'bigshroom'].includes(type)) {
    const top = type === 'mushroom' ? bottom - 7 : Math.max(3, h * 0.23),
      col = type === 'glowshroom' ? '#79AAA4' : '#C68F89';
    box(c, w / 2 - 2, top + 3, 4, h - top - 3, '#D5C5A4');
    r(w / 2 - 1, top + 5, 1, h - top - 7, CREAM);
    oval(c, w / 2, top + 2, w / 2 - 1, Math.max(3, h * 0.17), tint(col, -0.24));
    oval(c, w / 2 - 1, top + 1, w / 2 - 2, Math.max(2, h * 0.13), col);
    r(2, top + 3, w - 4, 1, tint(col, -0.2));
    for (const [x, y] of [
      [w * 0.3, top - 1],
      [w * 0.65, top],
      [w * 0.5, top + 2],
    ])
      r(x, y, 2, 1, CREAM);
    return true;
  }
  if (
    [
      'stone',
      'rock',
      'riverstone',
      'pebbles',
      'rubble',
      'icerock',
      'wishstone',
      'starstone',
    ].includes(type)
  ) {
    const col = type === 'icerock' ? '#B7D4BD' : type === 'starstone' ? '#8586AB' : '#9A958A',
      pieces = ['riverstone', 'pebbles', 'rubble'].includes(type)
        ? [
            [2, bottom - 5, 5, 4],
            [9, bottom - 6, 6, 5],
            [5, bottom - 11, 4, 3],
          ]
        : [[2, bottom - 10, w - 4, 10]];
    for (const [x, y, ww, hh] of pieces) {
      poly(
        c,
        [
          [x, y + hh * 0.4],
          [x + ww * 0.3, y],
          [x + ww * 0.75, y + 1],
          [x + ww, y + hh * 0.6],
          [x + ww - 2, y + hh],
          [x + 1, y + hh],
        ],
        tint(col, -0.25),
      );
      poly(
        c,
        [
          [x + 1, y + hh * 0.4],
          [x + ww * 0.3, y + 1],
          [x + ww * 0.7, y + 2],
          [x + ww - 2, y + hh - 2],
          [x + 2, y + hh - 1],
        ],
        col,
      );
      r(x + 2, y + 2, Math.max(1, ww / 3), 1, tint(col, 0.3));
    }
    if (type === 'starstone') {
      r(7, bottom - 7, 1, 3, '#E8C25A');
      r(6, bottom - 6, 3, 1, '#E8C25A');
    }
    return true;
  }
  if (['log', 'driftwood', 'mushroom_log', 'stump'].includes(type)) {
    const yy = type === 'stump' ? bottom - 8 : bottom - 5;
    plank(c, 1, yy, w - 2, bottom - yy + 1, WOOD_D);
    oval(
      c,
      type === 'stump' ? 8 : w - 3,
      yy,
      type === 'stump' ? 5 : 2,
      type === 'stump' ? 2 : 3,
      WOOD_L,
    );
    oval(c, type === 'stump' ? 8 : w - 3, yy, 2, 1, WOOD_D);
    r(3, yy + 2, 4, 1, WOOD);
    leaf(c, 4, yy - 1, 3, 1, base);
    return true;
  }
  if (
    ['waterbowl', 'foodbowl', 'puddle', 'puddles', 'lilypad', 'petbed', 'tunnel'].includes(type)
  ) {
    const col = type === 'foodbowl' ? '#C68F89' : type === 'petbed' ? base : WOOD;
    oval(c, w / 2, bottom - 3, w / 2 - 1, 3, type === 'puddle' ? '#507F83' : tint(col, -0.22));
    oval(
      c,
      w / 2 - 1,
      bottom - 4,
      w / 2 - 3,
      2,
      type === 'foodbowl'
        ? WOOD_L
        : type === 'petbed'
          ? '#C2CE95'
          : type === 'tunnel'
            ? INK
            : '#79AAA4',
    );
    if (type === 'lilypad') {
      oval(c, w / 2, bottom - 4, 5, 3, base);
      line(c, w / 2, bottom - 4, w / 2 + 4, bottom - 2, dark);
    } else r(4, bottom - 5, 4, 1, CREAM);
    return true;
  }
  if (['crystal', 'crystal_cluster'].includes(type)) {
    for (const [x, y, hh, col] of [
      [3, bottom - 8, 8, '#79AAA4'],
      [7, 2, h - 2, '#B7D4BD'],
      [11, bottom - 11, 11, '#A99CC9'],
    ]) {
      poly(
        c,
        [
          [x, y + 2],
          [x + 2, y],
          [x + 4, y + 3],
          [x + 3, y + hh],
          [x, y + hh],
        ],
        tint(col, -0.2),
      );
      r(x + 1, y + 2, 1, hh - 3, col);
      r(x + 1, y + 2, 1, 2, CREAM);
    }
    return true;
  }
  if (['shell', 'bones'].includes(type)) {
    oval(c, 8, bottom - 5, 5, 4, '#D5C5A4');
    for (let n = 0; n < 4; n++) line(c, 4 + n * 2, bottom - 8, 7 + n, bottom - 2, CREAM);
    return true;
  }
  if (['cactus', 'cactus_small'].includes(type)) {
    box(c, w / 2 - 2, 2, 5, h - 2, base);
    r(w / 2 - 1, 3, 1, h - 5, '#9DBA74');
    box(c, 1, 6, 3, h * 0.4, base);
    box(c, w - 4, 4, 3, h * 0.45, base);
    r(3, h * 0.55, 3, 2, base);
    r(w - 6, h * 0.5, 3, 2, base);
    r(w / 2 + 1, 6, 1, 1, CREAM);
    return true;
  }
  return false;
}
