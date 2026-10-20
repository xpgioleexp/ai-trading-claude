import { paintSmallDecor } from './world-props.js';
import {
  R,
  oval,
  poly,
  line,
  box,
  leaf,
  flower,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
import { paintFurniture } from './furniture-art.js';
import { dressFurniture, star } from './furniture-details.js';
import { paintOutdoor } from './outdoor-art.js';

import { FURNITURE_BY_TYPE } from './home.js';
import { OUTDOOR_BY_TYPE } from './outdoor-data.js';
import { PART_INFO, SPECIMEN_BY_ID } from './fossils.js';
import { paintEveryday } from './everyday-art.js';

const fingerprint = (s) =>
  Array.from(s).reduce((a, ch) => Math.imul(a ^ ch.charCodeAt(0), 16777619) >>> 0, 2166136261);
export function paintCollectible(c, item) {
  if (paintEveryday(c, item)) return true;
  const id = item.id || '',
    col = item.color || WOOD,
    d = tint(col, -0.3),
    l = tint(col, 0.3),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v);
  // Craft output icons show the actual thing you made, rather than a seed envelope.
  if (item.furniture && FURNITURE_BY_TYPE[item.furniture]) {
    const def = FURNITURE_BY_TYPE[item.furniture],
      form = def.form || def.type;
    const source = document.createElement('canvas');
    source.width = (def.w || 1) * 16;
    source.height =
      (def.h || 1) * 16 + (/shelf|cabinet|lamp|fridge|plant|clock|grandfather/.test(form) ? 10 : 0);
    const ctx = source.getContext('2d');
    paintFurniture(ctx, def, source.width, source.height);
    dressFurniture(ctx, def, source.width, source.height);
    const z = Math.min(14 / source.width, 14 / source.height),
      w = Math.max(1, Math.round(source.width * z)),
      h = Math.max(1, Math.round(source.height * z));
    c.imageSmoothingEnabled = false;
    c.drawImage(source, Math.floor((16 - w) / 2), 15 - h, w, h);
    return true;
  }
  if (item.decor) {
    const def = OUTDOOR_BY_TYPE[item.decor];
    if (def) {
      const source = document.createElement('canvas');
      source.width = 16;
      source.height = /post|torch|pole|arch|scarecrow|flag|windmill|chime|totem|feeder/.test(
        def.form,
      )
        ? 28
        : 16;
      paintOutdoor(source.getContext('2d'), def, 16, source.height);
      c.imageSmoothingEnabled = false;
      const scale = Math.min(14 / source.width, 14 / source.height);
      const width = Math.round(source.width * scale),
        height = Math.round(source.height * scale);
      c.drawImage(source, Math.floor((16 - width) / 2), 15 - height, width, height);
      return true;
    }
    if (paintSmallDecor(c, item.decor, 16, 16)) return true;
  }
  if (item.shape === 'fish') {
    paintFish(c, id, col);
    return true;
  }
  if (item.shape === 'bug') {
    paintBug(c, item.kind || 'beetle', col, 0, 16, 16, id);
    return true;
  }
  if (item.shape === 'fossil') {
    paintFossil(c, item);
    return true;
  }
  if (item.shape === 'dish') {
    paintDish(c, id, col);
    return true;
  }
  if (item.relic) {
    if (/coin|medal|token|disc|mirror/.test(id)) {
      oval(c, 8, 9, 6, 5, d);
      oval(c, 7, 8, 5, 4, col);
      oval(c, 8, 9, 3, 2, l);
      star(c, 8, 8, 2, d);
      r(4, 5, 3, 1, CREAM);
    } else if (/vase|urn|pot|jug|bottle/.test(id)) {
      poly(
        c,
        [
          [5, 2],
          [11, 2],
          [10, 5],
          [13, 9],
          [11, 14],
          [5, 14],
          [3, 9],
          [6, 5],
        ],
        d,
      );
      poly(
        c,
        [
          [6, 3],
          [9, 3],
          [9, 6],
          [11, 9],
          [10, 13],
          [5, 13],
          [4, 9],
          [7, 5],
        ],
        col,
      );
      r(5, 8, 7, 2, l);
      r(6, 4, 1, 3, CREAM);
    } else if (/crown|helm|mask/.test(id)) {
      poly(
        c,
        [
          [2, 4],
          [5, 6],
          [8, 2],
          [11, 6],
          [14, 4],
          [12, 13],
          [4, 13],
        ],
        col,
      );
      r(4, 10, 8, 2, d);
      r(7, 7, 2, 2, l);
      r(4, 5, 1, 2, CREAM);
    } else if (/tablet|map|scroll|page/.test(id)) {
      box(c, 2, 2, 12, 13, col);
      for (let y = 5; y < 12; y += 3) {
        r(4, y, 7, 1, d);
        r(5, y + 1, 2, 1, l);
      }
      r(3, 3, 1, 9, l);
    } else {
      box(c, 3, 3, 10, 11, col);
      poly(
        c,
        [
          [3, 3],
          [6, 1],
          [13, 3],
          [10, 6],
        ],
        l,
      );
      star(c, 8, 8, 4, d);
      r(4, 5, 1, 5, CREAM);
    }
    return true;
  }
  if (/gift_|toy_|cloth|fertilizer/.test(id)) {
    if (/bouquet/.test(id)) {
      for (const [x, y, v] of [
        [4, 4, col],
        [10, 3, '#E4B4A3'],
        [8, 7, '#E8C25A'],
      ])
        flower(c, x, y, v);
      poly(
        c,
        [
          [2, 7],
          [13, 7],
          [9, 15],
          [6, 15],
        ],
        '#F3E9CF',
      );
      r(6, 11, 4, 2, '#C68F89');
    } else if (/ring|bracelet|charm/.test(id)) {
      oval(c, 8, 10, 5, 4, WOOD_D);
      oval(c, 8, 9, 4, 3, '#D9B783');
      oval(c, 8, 9, 2, 2, CREAM);
      poly(
        c,
        [
          [5, 4],
          [10, 3],
          [12, 6],
          [8, 9],
          [4, 6],
        ],
        col,
      );
      r(6, 4, 3, 1, l);
    } else if (/card/.test(id)) {
      box(c, 2, 3, 12, 11, '#D5C5A4');
      r(3, 4, 10, 8, CREAM);
      line(c, 8, 6, 8, 11, '#6F925B');
      flower(c, 8, 6, col);
    } else if (/heart/.test(id)) {
      oval(c, 5, 6, 4, 3, col);
      oval(c, 11, 6, 4, 3, col);
      poly(
        c,
        [
          [1, 7],
          [14, 7],
          [8, 15],
        ],
        col,
      );
      r(3, 4, 3, 1, l);
      line(c, 9, 11, 12, 8, d);
    } else if (/boat/.test(id)) {
      poly(
        c,
        [
          [1, 10],
          [14, 10],
          [11, 14],
          [4, 14],
        ],
        col,
      );
      line(c, 8, 1, 8, 11, WOOD_D);
      poly(
        c,
        [
          [7, 2],
          [7, 9],
          [2, 9],
        ],
        CREAM,
      );
      poly(
        c,
        [
          [9, 3],
          [13, 9],
          [9, 9],
        ],
        '#C68F89',
      );
    } else if (/wand/.test(id)) {
      line(c, 3, 14, 11, 3, WOOD_D);
      leaf(c, 10, 4, 3, 2, col);
      r(12, 1, 1, 3, l);
      r(9, 3, 2, 1, CREAM);
    } else if (/cloth/.test(id)) {
      poly(
        c,
        [
          [2, 3],
          [11, 2],
          [14, 6],
          [13, 14],
          [3, 14],
        ],
        col,
      );
      r(3, 4, 8, 2, l);
      line(c, 11, 5, 11, 12, d);
      r(5, 12, 7, 1, d);
    } else if (/fertilizer/.test(id)) {
      box(c, 3, 2, 10, 13, '#D5C5A4');
      r(4, 4, 8, 9, col);
      leaf(c, 8, 8, 3, 2, '#6F925B');
      r(4, 12, 8, 1, d);
      r(5, 2, 6, 1, WOOD_D);
    } else {
      oval(c, 8, 9, 6, 5, d);
      oval(c, 7, 8, 5, 4, col);
      for (let y = 5; y < 13; y += 3) line(c, 4, y, 11, y + 2, l);
      r(4, 5, 2, 1, CREAM);
    }
    return true;
  }
  if (item.shape === 'boot') {
    poly(
      c,
      [
        [4, 2],
        [10, 2],
        [10, 9],
        [13, 10],
        [14, 13],
        [12, 15],
        [3, 15],
      ],
      d,
    );
    r(4, 3, 5, 9, col);
    box(c, 5, 10, 9, 4, col);
    r(5, 3, 2, 5, l);
    r(3, 14, 11, 1, INK);
    r(5, 2, 4, 1, l);
    return true;
  }
  if (item.shape === 'bottle') {
    box(c, 6, 1, 4, 3, WOOD_D);
    poly(
      c,
      [
        [6, 4],
        [10, 4],
        [11, 6],
        [13, 8],
        [12, 14],
        [4, 14],
        [3, 8],
        [5, 6],
      ],
      d,
    );
    r(5, 7, 6, 6, col);
    r(5, 9, 6, 3, '#F3E9CF');
    r(5, 6, 1, 7, CREAM);
    r(7, 10, 3, 1, d);
    r(7, 2, 2, 1, WOOD_L);
    return true;
  }
  if (item.shape === 'button') {
    oval(c, 8, 9, 6, 5, d);
    oval(c, 7, 8, 5, 4, col);
    oval(c, 8, 8, 3, 3, l);
    for (const [x, y] of [
      [6, 7],
      [9, 7],
      [6, 10],
      [9, 10],
    ])
      r(x, y, 1, 1, d);
    r(4, 5, 3, 1, CREAM);
    return true;
  }
  if (item.shape === 'seed') {
    box(c, 3, 1, 10, 14, '#B9A787');
    r(4, 2, 8, 11, '#F3E9CF');
    r(4, 3, 8, 2, col);
    r(4, 12, 8, 1, d);
    if (/flower|tulip|lily|rose|snowdrop/.test(id)) flower(c, 8, 8, col);
    else if (/root|carrot|radish|turnip|beet/.test(id)) {
      poly(
        c,
        [
          [5, 7],
          [10, 7],
          [8, 12],
        ],
        col,
      );
      leaf(c, 8, 6, 2, 1);
    } else {
      oval(c, 8, 9, 3, 2, col);
      r(7, 8, 2, 1, l);
      leaf(c, 8, 6, 2, 1);
    }
    r(5, 1, 6, 1, CREAM);
    return true;
  }
  return false;
}

export function paintFish(c, id, col) {
  const d = tint(col, -0.3),
    l = tint(col, 0.32),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v),
    eye = (x, y) => {
      r(x, y, 1, 1, INK);
      r(x - 1, y - 1, 1, 1, CREAM);
    };
  if (/crab|crayfish|lobster|shrimp|prawn/.test(id)) {
    const crab = /crab/.test(id);
    e(8, 9, crab ? 4 : 3, crab ? 3 : 5, d);
    e(7, 8, crab ? 3 : 2, 3, col);
    for (const x of [3, 12]) {
      line(c, 8, 10, x, 12, d);
      line(c, x, 12, x - 1, 14, d);
      box(c, x - 2, 4, 4, 3, col);
      r(x, 3, 1, 2, l);
    }
    r(6, 5, 1, 2, INK);
    r(10, 5, 1, 2, INK);
    if (!crab) {
      line(c, 5, 5, 2, 2, d);
      line(c, 10, 5, 13, 2, d);
      for (let y = 8; y < 14; y += 2) r(6, y, 4, 1, l);
    }
    return;
  }
  if (/octopus|squid|jelly/.test(id)) {
    e(8, 6, 5, 4, d);
    e(7, 5, 4, 3, col);
    for (let x = 3; x < 14; x += 3) {
      line(c, x, 8, x + 1, 12, col, 2);
      line(c, x + 1, 12, x - 1, 14, d);
    }
    eye(6, 6);
    eye(10, 6);
    r(5, 3, 3, 1, l);
    return;
  }
  if (/seahorse/.test(id)) {
    line(c, 8, 3, 6, 8, col, 3);
    line(c, 6, 8, 10, 11, col, 2);
    line(c, 10, 11, 8, 14, col, 2);
    r(6, 12, 3, 1, l);
    r(8, 3, 5, 2, col);
    eye(9, 3);
    r(7, 1, 1, 2, d);
    return;
  }
  if (/axolotl|newt|tadpole/.test(id)) {
    e(6, 8, 4, 3, d);
    e(5, 7, 3, 2, col);
    line(c, 8, 8, 14, 11, col, 2);
    if (!/tadpole/.test(id)) {
      for (const x of [3, 8]) {
        line(c, x, 9, x - 1, 13, d);
        r(x - 2, 12, 2, 1, col);
      }
      for (const y of [4, 6, 8]) {
        r(1, y, 2, 1, l);
        r(8, y, 2, 1, l);
      }
    }
    eye(4, 6);
    return;
  }
  if (/ray|skate|flounder|sole|halibut/.test(id)) {
    poly(
      c,
      [
        [8, 3],
        [15, 8],
        [10, 12],
        [2, 11],
        [0, 7],
      ],
      d,
    );
    poly(
      c,
      [
        [7, 4],
        [13, 8],
        [9, 11],
        [2, 9],
        [1, 7],
      ],
      col,
    );
    line(c, 11, 10, 15, 14, d);
    eye(4, 6);
    eye(7, 5);
    for (const [x, y] of [
      [5, 8],
      [8, 9],
      [10, 7],
    ])
      r(x, y, 1, 1, l);
    return;
  }
  if (/(?:^|_)eel(?:_|$)|loach|ribbon|oarfish|snake/.test(id)) {
    for (let x = 1; x < 15; x++) {
      const y = 7 + Math.round(Math.sin(x / 2.3) * 2);
      r(x, y, 1, 3, d);
      r(x, y, 1, 2, col);
      if (x % 3 === 0) r(x, y, 1, 1, l);
    }
    eye(2, 8);
    return;
  }
  const round = /puffer|sunfish|moonfish|discus|butterfly|angelfish/.test(id),
    long = /pike|gar|barracuda|sturgeon|needle/.test(id),
    shark = /shark|tuna|sword/.test(id),
    h = round ? 5 : long ? 2 : 3;
  poly(
    c,
    [
      [10, 8],
      [15, 4],
      [14, 8],
      [15, 13],
    ],
    d,
  );
  poly(
    c,
    [
      [11, 8],
      [14, 6],
      [13, 8],
      [14, 11],
    ],
    col,
  );
  if (round) e(7, 8, 5, h, d);
  else
    poly(
      c,
      [
        [1, 8],
        [4, 8 - h],
        [9, 7 - h],
        [12, 8],
        [10, 9 + h],
        [4, 9 + h],
      ],
      d,
    );
  e(6, 8, round ? 4 : long ? 5 : 4, h - 1, col);
  line(c, 4, 8 + h - 1, 9, 8 + h - 1, tint(col, 0.5));
  poly(
    c,
    [
      [5, 7 - h],
      [8, shark ? 1 : 4 - h / 2],
      [10, 7 - h],
    ],
    col,
  );
  poly(
    c,
    [
      [7, 10],
      [10, 13],
      [11, 10],
    ],
    d,
  );
  if (/koi|clown|tiger|perch|barb|zebra|salmon/.test(id))
    for (const x of [5, 8, 10]) r(x, 6, 1, 4, /koi|clown/.test(id) ? CREAM : l);
  else {
    const n = fingerprint(id);
    for (let k = 0; k < 3; k++) r(4 + ((n >> (k * 3)) % 6), 7 + ((n >> (k * 4)) % 3), 1, 1, l);
  }
  if (/catfish/.test(id)) {
    line(c, 2, 9, 0, 12, d);
    line(c, 4, 10, 3, 13, d);
  }
  if (/angler|lantern/.test(id)) {
    line(c, 4, 5, 3, 1, d);
    r(1, 1, 3, 2, '#E8C25A');
  }
  if (/puffer/.test(id))
    for (const [x, y] of [
      [3, 3],
      [9, 3],
      [1, 7],
      [3, 12],
      [9, 13],
    ])
      r(x, y, 1, 1, l);
  if (/sword|gar|needle/.test(id)) r(0, 7, 3, 1, col);
  eye(3, 7);
  r(2, 9, 2, 1, d);
}

export function paintBug(c, kind, col, frame = 0, W = 16, H = 16, id = '') {
  // A separate tiny rendition gives flying bugs clean 10 × 8 animation frames.
  const sx = W / 16,
    sy = H / 16,
    r = (x, y, w, h, v) =>
      R(
        c,
        Math.round(x * sx),
        Math.round(y * sy),
        Math.max(1, Math.round(w * sx)),
        Math.max(1, Math.round(h * sy)),
        v,
      ),
    p = (pts, v) =>
      poly(
        c,
        pts.map(([x, y]) => [Math.round(x * sx), Math.round(y * sy)]),
        v,
      ),
    e = (x, y, rx, ry, v) =>
      oval(
        c,
        Math.round(x * sx),
        Math.round(y * sy),
        Math.max(1, Math.round(rx * sx)),
        Math.max(1, Math.round(ry * sy)),
        v,
      ),
    d = tint(col, -0.35),
    l = tint(col, 0.4),
    wing = '#D8E7D7',
    up = frame ? 2 : 0;
  if (/butterfly|moth/.test(kind) || /moth|butterfly/.test(id)) {
    for (const flip of [-1, 1]) {
      const x = 8 + flip * 4;
      p(
        [
          [8, 7],
          [x + flip * 3, 2 + up],
          [x + flip * 3, 8],
          [8, 10],
        ],
        d,
      );
      e(x, 6 + up, 3, 3 - up * 0.5, col);
      e(x, 11 - up, 2, 2, col);
      r(x - 1, 5 + up, 2, 2, l);
      r(x, 10 - up, 1, 1, CREAM);
    }
    r(7, 5, 2, 8, INK);
    r(5, 2, 1, 2, INK);
    r(10, 2, 1, 2, INK);
    return;
  }
  if (kind === 'dragonfly') {
    for (const [x, y] of [
      [4, 4 + up],
      [10, 4 + up],
      [4, 11 - up],
      [10, 11 - up],
    ])
      e(x, y, 3, 1, wing);
    r(7, 3, 2, 11, d);
    r(7, 5, 1, 8, col);
    e(8, 3, 2, 1, l);
    return;
  }
  if (kind === 'bee' || kind === 'firefly') {
    e(4, 5 + up, 3, 2, wing);
    e(11, 5 + up, 3, 2, wing);
    e(8, 9, 4, 4, d);
    e(7, 8, 3, 3, col);
    for (const y of [7, 10]) r(5, y, 6, 1, INK);
    r(7, 3, 3, 2, INK);
    if (kind === 'firefly') {
      e(8, 12, 3, 2, col);
      r(7, 11, 2, 1, CREAM);
    }
    r(5, 7, 1, 1, CREAM);
    return;
  }
  if (kind === 'beetle') {
    for (const y of [6, 10, 13]) {
      r(2, y, 3, 1, INK);
      r(11, y, 3, 1, INK);
    }
    e(8, 9, 5, 5, d);
    e(7, 8, 4, 4, col);
    r(8, 5, 1, 8, d);
    e(8, 4, 3, 2, INK);
    r(5, 6, 2, 2, l);
    if (/stag|hercules|horn|rhinoceros/.test(id)) {
      r(5, 0, 1, 4, d);
      r(10, 0, 1, 4, d);
      r(6, 0, 4, 1, d);
    } else {
      r(5, 2, 1, 2, INK);
      r(11, 2, 1, 2, INK);
    }
    return;
  }
  // Mantises, grasshoppers, stick insects and ground crawlers keep jointed legs.
  const thin = /stick|mantis/.test(id),
    many = /centipede|millipede/.test(id);
  r(thin ? 7 : 4, 7, thin ? 2 : 8, 3, col);
  e(11, 6, 2, 2, d);
  r(11, 5, 1, 1, INK);
  for (const x of many ? [2, 4, 6, 8, 10, 12] : [4, 8, 11]) {
    r(x, 10, 1, 3 + ((frame + x) % 2), d);
    r(x - 1, 13, 2, 1, d);
  }
  r(12, 2, 1, 3, d);
  r(14, 3, 1, 3, d);
  r(4, 7, 5, 1, l);
}

export function paintFossil(c, item) {
  const info = PART_INFO[item.id],
    spec = SPECIMEN_BY_ID[item.specimen],
    key = info?.key || item.id.split('_').at(-1),
    plan = spec?.plan || 'single',
    col = item.color,
    d = tint(col, -0.32),
    bone = '#FFF0CE';
  poly(
    c,
    [
      [3, 3],
      [9, 2],
      [13, 5],
      [14, 11],
      [10, 15],
      [3, 13],
      [1, 7],
    ],
    d,
  );
  poly(
    c,
    [
      [3, 4],
      [9, 3],
      [12, 5],
      [12, 11],
      [9, 13],
      [3, 11],
      [2, 7],
    ],
    col,
  );
  const r = (x, y, w, h, v = bone) => R(c, x, y, w, h, v),
    ln = (x, y, xx, yy, w = 1) => line(c, x, y, xx, yy, bone, w),
    skull = () => {
      const snout = /croc|marine|fish|shark/.test(plan) ? 4 : 2;
      box(c, 4, 5, 6 + snout, 5, bone);
      r(6, 6, 2, 2, d);
      r(10, 7, snout, 1, d);
      for (let x = 5; x < 12; x += 2) r(x, 10, 1, 1, bone);
      r(4, 9, 7, 1, tint(bone, -0.2));
    };
  if (plan === 'single' && /ammonite|shell|snail|spiral/.test(item.id)) {
    oval(c, 8, 8, 5, 4, bone);
    oval(c, 8, 8, 3, 2, d);
    r(6, 6, 4, 1);
    r(9, 7, 1, 4);
    r(6, 10, 3, 1);
    r(6, 8, 1, 2);
    r(7, 8, 2, 1);
  } else if (plan === 'single' && /tooth|claw/.test(item.id)) {
    poly(
      c,
      [
        [4, 5],
        [11, 4],
        [10, 8],
        [6, 13],
        [7, 8],
      ],
      bone,
    );
    r(5, 5, 4, 1, tint(bone, -0.2));
  } else if (!info && /bone/.test(item.id)) {
    ln(4, 5, 11, 11, 2);
    for (const [x, y] of [
      [4, 4],
      [3, 6],
      [11, 10],
      [10, 12],
    ])
      oval(c, x, y, 1, 1, bone);
  } else if (/skull|head|jaw/.test(key)) {
    skull();
    if (/horned|duckbill/.test(plan)) ln(5, 5, 4, 2);
  } else if (/antlers|horn|tusks/.test(key)) {
    ln(7, 12, 4, 5, 2);
    ln(9, 12, 11, 4, 2);
    ln(4, 6, 6, 3);
    ln(11, 6, 13, 5);
  } else if (/shell/.test(key)) {
    oval(c, 8, 8, 5, 4, bone);
    oval(c, 8, 8, 3, 2, d);
    r(7, 7, 3, 1, bone);
    r(9, 8, 1, 3, bone);
    r(6, 10, 3, 1, bone);
  } else if (/wings|flippers|fin/.test(key)) {
    for (const y of [5, 8, 11]) {
      ln(7, 8, 3, y);
      ln(8, 8, 12, y);
    }
    ln(7, 5, 8, 12, 2);
  } else if (/legs|arms|claws/.test(key)) {
    for (const x of [5, 10]) {
      ln(x, 5, x - 1, 8, 2);
      ln(x - 1, 8, x + 1, 12, 2);
      r(x, 12, 3, 1);
      r(x, 4, 2, 1);
    }
    if (key === 'claws') for (let x = 4; x < 12; x += 3) ln(x, 10, x - 1, 12);
  } else if (/tail|spine|neck/.test(key)) {
    for (let n = 0; n < 6; n++) {
      const x = 3 + n * 2,
        y = 8 + Math.round(Math.sin(n * 0.8) * 2);
      r(x, y, 2, 2);
      r(x, y - 1, 1, 1, tint(bone, -0.2));
    }
  } else if (/sail|plates|armor|frill/.test(key)) {
    for (let x = 3; x < 13; x += 3) {
      poly(
        c,
        [
          [x, 11],
          [x + 1, 4 + (x % 3)],
          [x + 3, 10],
        ],
        bone,
      );
      r(x + 1, 8, 1, 2, d);
    }
  } else if (plan === 'single' && /fern|leaf|petal|wood|mushroom/.test(item.id)) {
    ln(8, 4, 8, 12);
    for (let y = 5; y < 11; y += 2) {
      ln(8, y, 4, y - 2);
      ln(8, y + 1, 12, y - 1);
    }
  } else if (plan === 'single' && /amber|beetle|bug|trilobite/.test(item.id)) {
    oval(c, 8, 8, 3, 4, bone);
    for (let y = 5; y < 12; y += 2) {
      r(4, y, 2, 1, bone);
      r(10, y, 2, 1, bone);
      r(7, y, 2, 1, d);
    }
  } else {
    ln(3, 6, 12, 6, 2);
    for (let x = 4; x < 12; x += 2) {
      ln(x, 7, x - 1, 10);
      ln(x - 1, 10, x + 1, 12);
    }
    r(4, 5, 6, 1, tint(bone, 0.2));
  }
  R(c, 3, 4, 2, 1, tint(col, 0.3));
}

export function paintDish(c, id, col) {
  const d = tint(col, -0.3),
    l = tint(col, 0.35),
    r = (x, y, w, h, v = col) => R(c, x, y, w, h, v),
    e = (x, y, rx, ry, v = col) => oval(c, x, y, rx, ry, v);
  e(8, 12, 7, 3, '#B9AA90');
  e(7, 11, 6, 2, CREAM);
  if (
    /(?:^|_)(?:tea|coffee|cocoa|latte|juice|smoothie|cider|lassi|lemonade|milk)(?:_|$)/.test(id) &&
    !/cake|pie|bread|cookie|mousse|pudding|ice_cream/.test(id)
  ) {
    box(c, 3, 3, 8, 9, '#D5C5A4');
    r(4, 4, 6, 7, CREAM);
    e(7, 4, 2, 1, col);
    box(c, 11, 5, 3, 5, '#D5C5A4');
    r(12, 6, 1, 3, CREAM);
    line(c, 6, 0, 7, 2, '#D5C5A4');
    r(5, 6, 1, 4, '#FFF7E4');
    return;
  }
  if (/soup|stew|curry|ramen|noodle|risotto|porridge|chowder/.test(id)) {
    e(8, 9, 6, 4, '#D5C5A4');
    e(8, 7, 6, 3, CREAM);
    e(8, 7, 5, 2, col);
    for (const [x, y, v] of [
      [5, 6, '#6F925B'],
      [9, 7, '#E4B4A3'],
      [7, 8, l],
    ])
      r(x, y, 2, 1, v);
    line(c, 12, 6, 14, 2, WOOD_D);
    return;
  }
  if (/cake|pie|tart|cheesecake|brownie|lasagna/.test(id)) {
    poly(
      c,
      [
        [3, 6],
        [9, 3],
        [13, 6],
        [12, 12],
        [4, 12],
      ],
      d,
    );
    poly(
      c,
      [
        [3, 6],
        [9, 3],
        [13, 6],
        [7, 8],
      ],
      l,
    );
    r(4, 8, 8, 3, col);
    r(4, 9, 8, 1, CREAM);
    e(9, 4, 1, 1, '#C68F89');
    r(4, 7, 1, 3, CREAM);
    return;
  }
  if (/pizza|pancake|omelet|frittata|crepe/.test(id)) {
    e(8, 9, 6, 3, d);
    e(7, 8, 5, 2, col);
    for (const [x, y, v] of [
      [5, 7, l],
      [9, 8, '#C68F89'],
      [7, 9, '#6F925B'],
    ])
      r(x, y, 2, 1, v);
    if (/pancake/.test(id)) {
      e(8, 6, 5, 2, col);
      box(c, 7, 4, 3, 2, '#E8C25A');
    }
    return;
  }
  if (/salad|greens|slaw/.test(id)) {
    for (const [x, y] of [
      [4, 9],
      [8, 7],
      [12, 9],
    ])
      leaf(c, x, y, 3, 2, col);
    for (const [x, y] of [
      [5, 8],
      [10, 9],
      [8, 11],
    ])
      e(x, y, 1, 1, '#C68F89');
    return;
  }
  if (/sushi|roll|maki|onigiri|dumpling/.test(id)) {
    for (const [x, y] of [
      [4, 10],
      [10, 10],
      [7, 6],
    ]) {
      e(x, y, 3, 2, INK);
      e(x, y - 1, 2, 2, CREAM);
      r(x, y - 1, 1, 1, col);
    }
    return;
  }
  if (/bread|toast|sandwich|burger|waffle|bun|croissant/.test(id)) {
    e(8, 7, 5, 4, d);
    e(7, 6, 4, 3, col);
    r(3, 8, 10, 4, col);
    r(4, 10, 8, 1, l);
    for (const x of [5, 8, 10]) r(x, 4 + (x % 2), 1, 2, l);
    if (/sandwich|burger/.test(id)) {
      r(3, 9, 10, 1, '#6F925B');
      r(4, 10, 8, 1, '#C68F89');
      r(4, 11, 8, 1, CREAM);
    }
    return;
  }
  if (/cookie|biscuit|mochi|macaron|truffle/.test(id)) {
    for (const [x, y] of [
      [5, 9],
      [11, 10],
      [8, 6],
    ]) {
      e(x, y, 3, 2, d);
      e(x - 1, y - 1, 2, 1, col);
      r(x, y - 1, 1, 1, l);
    }
    return;
  }
  if (/skewer|kebab|grill/.test(id)) {
    line(c, 3, 14, 12, 3, WOOD_D);
    for (const [x, y, v] of [
      [5, 11, col],
      [8, 8, l],
      [11, 5, '#6F925B'],
    ])
      box(c, x - 2, y - 2, 4, 4, v);
    return;
  }
  if (/jam|pickle|honey|preserve|sauce/.test(id)) {
    box(c, 4, 4, 8, 9, d);
    r(5, 5, 6, 7, col);
    r(4, 2, 8, 3, '#D5C5A4');
    r(5, 7, 6, 3, CREAM);
    e(8, 8, 1, 1, col);
    r(5, 5, 1, 6, l);
    return;
  }
  // Roasted dishes, rice and pasta have separate portions and visible garnish.
  e(7, 8, 5, 3, d);
  e(6, 7, 4, 2, col);
  e(11, 10, 2, 1, l);
  for (const [x, y] of [
    [4, 7],
    [7, 6],
    [8, 9],
  ])
    r(x, y, 2, 1, l);
  leaf(c, 11, 6, 2, 1, '#6F925B');
}
