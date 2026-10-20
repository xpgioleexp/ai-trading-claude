import { paintCritter } from './creature-art.js';
import { paintSpecialFurniture, paintWallDetail } from './furniture-details.js';
import {
  R,
  oval,
  poly,
  line,
  box,
  plank,
  leaf,
  flower,
  windowPane,
  tint,
  INK,
  CREAM,
  WOOD,
  WOOD_D,
  WOOD_L,
} from './art-style.js';
const ALIASES = {
  double_bed: 'bed',
  single_bed: 'bed',
  canopy_bed: 'canopy',
  nightstand: 'table_lamp',
  wardrobe: 'tall_cabinet',
  dresser: 'cabinet',
  coffee_table: 'low_table',
  bookshelf: 'shelf',
  floor_lamp: 'lamp',
  houseplant: 'plant',
  flower_vase: 'vase',
  cat_bed: 'cushion',
  easel_art: 'easel',
  rug_round: 'round_rug',
  rug_long: 'rug',
  rug_heart: 'heart_rug',
  icebox: 'fridge',
  bathtub: 'tub',
  washstand: 'vanity',
  record_player: 'gramophone',
  piano: 'upright_piano',
  tall_clock: 'grandfather',
  aquarium: 'fishtank',
  globe: 'globe_stand',
  telescope: 'telescope_stand',
  mushroom_lamp: 'mushroom',
  paper_lantern: 'lantern',
  spore_lamp: 'mushroom',
  star_rug: 'round_rug',
};
export function paintFurniture(ctx, def, W, H) {
  if (def.plush) {
    const toy = document.createElement('canvas');
    toy.width = 16;
    toy.height = 18;
    paintCritter(toy.getContext('2d'), def.plush.shape, def.plush.color, def.plush.accent, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(toy, Math.floor((W - 14) / 2), H - 16, 14, 16);
    return true;
  }
  const type = def.type,
    form = def.form || ALIASES[type] || type,
    c = def.color || WOOD,
    a =
      def.accent ||
      {
        sofa: '#79AAA4',
        armchair: '#C68F89',
        bed: '#C68F89',
        lamp: '#F3E9CF',
        plant: '#6F925B',
        tall_plant: '#6F925B',
        bonsai: '#6F925B',
        succulents: '#6F925B',
        cactus_pot: '#6F925B',
      }[form] ||
      '#C68F89';
  if (paintSpecialFurniture(ctx, def, W, H, form)) return true;
  const d = tint(c, -0.27),
    l = tint(c, 0.28),
    ad = tint(a, -0.24),
    al = tint(a, 0.28),
    r = (x, y, w, h, col = c) => R(ctx, x, y, w, h, col),
    b = (x, y, w, h, col = c) => box(ctx, x, y, w, h, col),
    p = (x, y, w, h, col = c) => plank(ctx, x, y, w, h, col),
    e = (x, y, rx, ry, col = c) => oval(ctx, x, y, rx, ry, col);
  if (type === 'nightstand') {
    b(1, 10, 14, 6, c);
    r(5, 13, 4, 1, d);
    r(9, 5, 1, 5, d);
    poly(
      ctx,
      [
        [7, 2],
        [12, 2],
        [14, 7],
        [5, 7],
      ],
      a,
    );
    r(7, 3, 2, 2, al);
    return true;
  }
  const feet = (y) => {
      p(2, y, 2, H - y, d);
      p(W - 4, y, 2, H - y, d);
    },
    top = (y, h = 4) => {
      b(0, y, W, h, c);
      r(1, y + 1, W - 3, 1, l);
      r(W - 3, y + 2, 2, h - 2, d);
    };
  switch (form) {
    case 'bed':
    case 'futon':
    case 'canopy':
    case 'bunk': {
      const low = form === 'futon',
        canopy = form === 'canopy',
        y = canopy ? H - 24 : low ? H - 26 : 3;
      p(1, y, W - 2, 7, c);
      p(2, y + 1, W - 4, 4, c);
      if (!low && !canopy) {
        oval(ctx, W / 2, y + 1, W / 2 - 3, 2, d);
        oval(ctx, W / 2 - 1, y, W / 2 - 4, 1, c);
        r(4, y + 3, W - 9, 1, l);
      }
      r(4, y + 2, W - 8, 1, l);
      b(2, y + 7, W - 4, H - y - 10, '#D5C5A4');
      r(3, y + 8, W - 6, H - y - 13, CREAM);
      const pillows = W > 20 ? 2 : 1;
      for (let i = 0; i < pillows; i++) {
        const x = 4 + (i * (W - 7)) / pillows;
        b(x, y + 8, (W - 10) / pillows, 5, '#F3E9CF');
        r(x + 1, y + 9, (W - 14) / pillows, 2, CREAM);
      }
      const by = y + 15;
      b(2, by, W - 4, H - by - 3, a);
      r(3, by + 1, W - 6, 2, al);
      r(W - 5, by + 3, 2, H - by - 7, ad);
      r(3, by, W - 7, 1, '#F3E9CF');
      r(3, by + 1, 1, H - by - 6, al);
      poly(
        ctx,
        [
          [W - 5, by + 2],
          [W - 2, by],
          [W - 2, H - 5],
          [W - 5, H - 3],
        ],
        ad,
      );
      for (let x = 5; x < W - 6; x += 6) {
        r(x, by + 5, 2, 2, al);
        r(x + 1, by + 7, 2, 1, ad);
      }
      p(1, H - 4, W - 2, 4, c);
      feet(H - 2);
      if (canopy) {
        p(1, 0, 2, H, d);
        p(W - 3, 0, 2, H, d);
        b(0, 0, W, 4, a);
        poly(
          ctx,
          [
            [2, 3],
            [8, 3],
            [6, 14],
            [3, 16],
          ],
          al,
        );
        poly(
          ctx,
          [
            [W - 8, 3],
            [W - 2, 3],
            [W - 3, 16],
            [W - 6, 13],
          ],
          a,
        );
        r(4, 9, 3, 1, ad);
        r(W - 7, 9, 3, 1, ad);
      }
      if (form === 'bunk') {
        p(0, 0, 2, H, d);
        p(W - 2, 0, 2, H, d);
        b(2, 4, W - 4, 5, a);
        p(1, 9, W - 2, 2, c);
        for (let yy = 12; yy < H - 2; yy += 4) r(W - 5, yy, 4, 1, l);
        r(W - 5, 12, 1, H - 12, d);
      }
      return true;
    }
    case 'chair':
    case 'armchair':
    case 'sofa':
    case 'throne':
    case 'bench':
    case 'rocking_chair': {
      const arm = ['armchair', 'sofa', 'throne'].includes(form),
        y = form === 'throne' ? 0 : 2;
      feet(H - 4);
      b(2, y, W - 4, H - 7, c);
      b(3, y + 2, W - 7, Math.max(3, H - 12), a);
      r(4, y + 3, W - 10, 1, al);
      b(2, H - 8, W - 4, 5, a);
      r(3, H - 7, W - 7, 1, al);
      if (arm) {
        b(0, H - 11, 4, 8, c);
        b(W - 4, H - 11, 4, 8, c);
        r(1, H - 10, 2, 1, l);
        r(W - 3, H - 10, 2, 1, l);
      }
      if (W > 20) r(Math.round(W / 2), H - 7, 1, 3, ad);
      if (form === 'sofa' && W > 20) {
        box(ctx, 5, H - 12, 5, 5, al);
        r(6, H - 11, 2, 1, '#F3E9CF');
        poly(
          ctx,
          [
            [W - 10, H - 12],
            [W - 5, H - 12],
            [W - 4, H - 4],
            [W - 9, H - 4],
          ],
          a,
        );
        r(W - 8, H - 10, 1, 5, al);
        r(W - 6, H - 6, 1, 2, ad);
      }
      if (form === 'chair' || form === 'bench')
        for (let x = 5; x < W - 4; x += 4) r(x, y + 2, 1, H - 13, d);
      if (form === 'throne') {
        r(2, 0, 2, 3, l);
        r(W - 4, 0, 2, 3, l);
        r(W / 2 - 1, 2, 2, 2, '#E8C25A');
      }
      if (form === 'rocking_chair') {
        line(ctx, 1, H - 2, W / 2, H - 1, d);
        line(ctx, W / 2, H - 1, W - 2, H - 2, d);
      }
      return true;
    }
    case 'beanbag':
    case 'cushion':
    case 'hanging_chair':
    case 'stool':
    case 'stump': {
      if (form === 'stool') {
        feet(H - 7);
        e(W / 2, H - 9, 6, 3, d);
        e(W / 2 - 1, H - 10, 5, 2, c);
        r(4, H - 11, 5, 1, l);
      } else if (form === 'stump') {
        p(3, 5, W - 6, H - 5, c);
        e(W / 2, 5, 5, 3, l);
        e(W / 2, 5, 3, 1, d);
        r(6, 4, 3, 1, a);
      } else {
        const hh = form === 'hanging_chair' ? H - 8 : H - 3;
        e(W / 2, H - 6, W / 2 - 1, 5, ad);
        e(W / 2 - 1, hh - 2, W / 2 - 2, Math.min(6, hh / 2), a);
        e(W / 2 - 2, hh - 4, 3, 2, al);
        r(W / 2, H - 7, 2, 1, ad);
        if (form === 'hanging_chair') {
          line(ctx, W / 2, 0, W / 2, 5, d);
          e(W / 2, H - 10, 6, 7, c);
          e(W / 2, H - 10, 4, 5, a);
          r(2, H - 5, 12, 2, d);
        }
      }
      return true;
    }
    case 'table':
    case 'low_table':
    case 'round_table':
    case 'desk':
    case 'counter':
    case 'kotatsu':
    case 'tea_table': {
      const y = ['low_table', 'kotatsu'].includes(form) ? 8 : 5;
      feet(y + 4);
      if (form === 'round_table') {
        e(W / 2, y + 2, W / 2 - 1, 4, d);
        e(W / 2 - 1, y, W / 2 - 2, 3, c);
        r(4, y - 1, W - 10, 1, l);
      } else top(y);
      if (form === 'counter') {
        b(1, y + 4, W - 2, H - y - 4, c);
        r(3, y + 5, W - 6, 1, l);
        r(W / 2, y + 5, 1, H - y - 7, d);
        r(W / 2 - 2, H - 5, 1, 1, a);
        r(W / 2 + 2, H - 5, 1, 1, a);
      }
      if (form === 'desk') {
        b(W - 10, y + 4, 8, 5, c);
        r(W - 7, y + 6, 3, 1, a);
        r(4, y - 2, 7, 2, CREAM);
        r(5, y - 2, 3, 1, '#B7D4BD');
      }
      if (form === 'kotatsu') {
        b(0, y + 3, W, H - y - 3, a);
        r(3, y + 5, 3, H - y - 7, al);
        r(W - 7, y + 5, 3, H - y - 7, ad);
        top(y);
      }
      if (['tea_table', 'table', 'round_table'].includes(form)) {
        e(W / 2, y - 1, 3, 1, CREAM);
        b(W / 2 - 2, y - 4, 4, 3, a);
        r(W / 2 + 2, y - 3, 1, 2, ad);
      }
      return true;
    }
    case 'shelf':
    case 'low_shelf':
    case 'cabinet':
    case 'tall_cabinet':
    case 'chest': {
      const y = form === 'low_shelf' ? 5 : form === 'chest' ? 4 : 0;
      feet(H - 2);
      b(1, y, W - 2, H - y - 2, c);
      r(W - 3, y + 2, 2, H - y - 5, d);
      r(2, y + 1, W - 5, 1, l);
      if (form.includes('shelf'))
        for (let yy = y + 3; yy < H - 5; yy += 7) {
          r(3, yy, W - 7, 5, d);
          for (let x = 3, n = 0; x < W - 5; x += 3, n++) {
            r(x, yy + 1 + (n % 2), 2, 4 - (n % 2), n % 3 === 0 ? a : n % 3 === 1 ? al : '#79AAA4');
            r(x, yy + 2 + (n % 2), 1, 1, CREAM);
          }
          p(2, yy + 5, W - 5, 2, c);
        }
      else if (form === 'tall_cabinet') {
        b(3, y + 3, W / 2 - 4, H - y - 7, c);
        b(W / 2, y + 3, W / 2 - 4, H - y - 7, c);
        r(W / 2 - 2, H / 2, 1, 2, a);
        r(W / 2 + 2, H / 2, 1, 2, a);
      } else if (form === 'chest') {
        b(1, y, W - 2, 5, l);
        r(2, y + 4, W - 4, 1, d);
        r(4, y + 1, 1, H - y - 3, a);
        r(W - 5, y + 1, 1, H - y - 3, a);
        b(W / 2 - 1, y + 5, 3, 3, a);
      } else
        for (let yy = y + 3; yy < H - 4; yy += 5) {
          b(3, yy, W - 7, 4, c);
          r(W / 2 - 1, yy + 2, 3, 1, a);
        }
      return true;
    }
    case 'plant':
    case 'tall_plant':
    case 'vase':
    case 'flower_box':
    case 'succulents':
    case 'cactus_pot':
    case 'bonsai': {
      const y = H - 6;
      box(ctx, 3, y, W - 6, 6, c);
      r(2, y - 1, W - 4, 2, d);
      r(4, y, W - 8, 1, l);
      r(5, y + 2, 2, 2, l);
      if (form === 'cactus_pot') {
        b(6, 2, 4, y - 1, a);
        b(3, 4, 3, 5, a);
        b(10, 3, 3, 4, a);
        r(7, 3, 1, 5, al);
        flower(ctx, 8, 1, '#E4B4A3');
      } else if (form === 'vase' || form === 'flower_box') {
        for (let x = 4; x < W - 3; x += 4) {
          line(ctx, x, y, x + 1, y - 5, '#3F604A');
          flower(ctx, x + 1, y - 6, a);
        }
      } else {
        const leaves =
          form === 'tall_plant'
            ? [
                [6, 5, 4, 4],
                [11, 9, 4, 5],
                [5, 14, 3, 4],
              ]
            : form === 'bonsai'
              ? [
                  [5, 5, 4, 2],
                  [11, 3, 4, 2],
                ]
              : [
                  [5, y - 3, 3, 2],
                  [10, y - 5, 4, 3],
                  [7, y - 8, 3, 3],
                ];
        line(ctx, 8, y, 8, Math.min(...leaves.map((p) => p[1])), WOOD_D);
        for (const [x, yy, rx, ry] of leaves) leaf(ctx, x, yy, rx, ry, a);
      }
      return true;
    }
    case 'lamp':
    case 'table_lamp':
    case 'lantern':
    case 'jar_lamp':
    case 'lava_lamp':
    case 'salt_lamp':
    case 'candles': {
      const by = form === 'table_lamp' ? H - 6 : H - 2;
      plank(ctx, 4, by, 8, 2, c);
      r(7, 7, 2, by - 7, c);
      if (form === 'candles') {
        for (const [x, hh] of [
          [3, 6],
          [7, 10],
          [11, 7],
        ]) {
          b(x, H - hh, 3, hh, c);
          r(x + 1, H - hh - 2, 1, 2, a);
        }
      } else if (form === 'salt_lamp') {
        poly(
          ctx,
          [
            [5, 3],
            [10, 1],
            [13, 9],
            [11, H - 3],
            [4, H - 3],
            [3, 8],
          ],
          c,
        );
        r(5, 5, 2, 4, a);
      } else if (form === 'jar_lamp' || form === 'lava_lamp') {
        b(4, 3, 8, H - 5, c);
        r(5, 4, 2, H - 9, l);
        for (const [x, y] of [
          [8, 6],
          [10, 10],
          [7, H - 5],
        ])
          r(x, y, 1, 1, a);
        r(5, 1, 6, 2, d);
      } else {
        poly(
          ctx,
          [
            [4, 2],
            [11, 2],
            [14, 9],
            [2, 9],
          ],
          ad,
        );
        poly(
          ctx,
          [
            [5, 3],
            [10, 3],
            [12, 7],
            [3, 7],
          ],
          a,
        );
        r(5, 3, 2, 4, al);
        r(3, 9, 10, 1, d);
        if (form === 'lantern') for (let yy = 4; yy < 9; yy += 2) r(4, yy, 8, 1, ad);
      }
      return true;
    }
    case 'rug':
    case 'round_rug':
    case 'heart_rug':
    case 'mat':
    case 'tatami': {
      if (form === 'round_rug') {
        e(W / 2, H / 2, W / 2 - 1, H / 2 - 1, ad);
        e(W / 2 - 1, H / 2 - 1, W / 2 - 3, H / 2 - 3, c);
        e(W / 2, H / 2, W / 2 - 6, H / 2 - 6, a);
      } else if (form === 'heart_rug') {
        e(W * 0.3, H * 0.3, W * 0.22, H * 0.23, a);
        e(W * 0.7, H * 0.3, W * 0.22, H * 0.23, a);
        poly(
          ctx,
          [
            [2, H * 0.35],
            [W - 3, H * 0.35],
            [W / 2, H - 2],
          ],
          a,
        );
      } else {
        b(0, 1, W, H - 2, ad);
        r(2, 3, W - 4, H - 6, c);
        r(3, 4, W - 6, 1, l);
        for (let x = 4; x < W - 3; x += 5) r(x, 5, 2, H - 10, a);
        for (let x = 2; x < W - 1; x += 3) {
          r(x, 0, 1, 1, a);
          r(x, H - 1, 1, 1, a);
        }
      }
      return true;
    }
    case 'fridge':
    case 'washer':
    case 'machine':
    case 'stove':
    case 'kitchen_sink':
    case 'fireplace':
    case 'tub':
    case 'vanity': {
      if (form === 'tub') {
        e(W / 2, H - 5, W / 2 - 1, 5, d);
        e(W / 2, H - 7, W / 2 - 2, 4, c);
        e(W / 2, H - 8, W / 2 - 4, 2, a);
        r(3, H - 3, 2, 3, WOOD_D);
        r(W - 5, H - 3, 2, 3, WOOD_D);
        r(W - 5, 1, 1, 4, WOOD_D);
        r(W - 7, 1, 3, 1, l);
        return true;
      }
      b(1, 1, W - 2, H - 1, c);
      r(W - 3, 3, 2, H - 5, d);
      if (form === 'fridge') {
        r(2, H * 0.4, W - 5, 1, d);
        r(W - 5, 4, 1, 4, a);
        r(W - 5, H * 0.55, 1, 5, a);
        r(3, 3, 2, 2, l);
      } else if (form === 'washer') {
        b(2, 2, W - 5, 4, d);
        r(4, 3, 2, 1, a);
        e(W / 2, H * 0.65, 5, 5, d);
        e(W / 2 - 1, H * 0.65 - 1, 3, 3, a);
        r(5, H * 0.65 - 2, 2, 1, al);
      } else if (form === 'vanity') {
        b(3, 0, W - 6, 7, d);
        r(4, 1, W - 8, 5, a);
        r(5, 2, 2, 2, CREAM);
        r(2, 8, W - 4, 2, l);
        r(W / 2, H - 5, 2, 1, a);
      } else if (form === 'kitchen_sink') {
        r(2, 4, W - 4, 3, l);
        e(W / 2, 6, 4, 2, '#79AAA4');
        r(W / 2, 1, 1, 4, WOOD_D);
        r(W / 2 - 2, 1, 3, 1, WOOD_L);
      } else {
        b(3, H - 10, W - 7, 7, d);
        r(4, H - 8, W - 9, 3, a);
        r(5, H - 8, W - 11, 1, al);
        for (const x of [4, W - 6]) r(x, 3, 2, 2, d);
        r(3, 6, W - 6, 1, l);
        if (form === 'fireplace') {
          r(0, 1, W, 3, l);
          r(3, H - 6, 2, 2, '#E8C25A');
          r(W - 7, H - 5, 2, 1, '#E8C25A');
        }
      }
      return true;
    }
    case 'upright_piano':
    case 'computer':
    case 'tv':
    case 'arcade':
    case 'vending':
    case 'speaker': {
      const piano = form === 'upright_piano',
        screen = ['computer', 'tv', 'arcade', 'vending'].includes(form);
      b(1, 1, W - 2, H - 3, c);
      r(2, 2, W - 5, 1, l);
      r(W - 3, 3, 1, H - 6, d);
      feet(H - 2);
      if (piano) {
        r(2, H - 9, W - 4, 4, CREAM);
        for (let x = 3; x < W - 3; x += 3) r(x, H - 9, 1, 2, INK);
        b(W / 2 - 3, 4, 6, 3, a);
        r(3, H - 4, W - 6, 1, d);
      } else if (screen) {
        b(3, 3, W - 6, Math.max(5, H - 10), INK);
        r(4, 4, W - 8, Math.max(3, H - 13), a);
        r(5, 5, 3, 1, al);
        r(W - 8, 8, 2, 2, ad);
        r(3, H - 6, W - 6, 2, l);
        r(5, H - 5, 2, 1, a);
        r(W - 6, H - 5, 1, 1, a);
        if (form === 'arcade') {
          r(4, 1, W - 8, 2, a);
          r(4, H - 8, W - 8, 2, c);
        }
      } else {
        e(W / 2, 6, 3, 3, d);
        e(W / 2, 6, 2, 2, a);
        e(W / 2, H - 6, 4, 4, d);
        e(W / 2, H - 6, 2, 2, a);
        r(4, 4, 1, 2, l);
      }
      return true;
    }
    case 'grandfather':
    case 'mirror': {
      b(3, 1, 10, H - 2, c);
      b(4, 2, 8, H - 5, d);
      e(8, 6, 4, 4, l);
      e(8, 6, 3, 3, form === 'mirror' ? a : CREAM);
      if (form === 'grandfather') {
        r(8, 3, 1, 3, d);
        r(8, 6, 2, 1, d);
        r(7, 12, 2, H - 18, a);
        e(8, H - 7, 2, 2, a);
        r(5, H - 3, 6, 1, l);
      } else {
        r(6, 4, 1, 3, CREAM);
        r(5, H - 3, 2, 3, d);
        r(10, H - 3, 2, 3, d);
      }
      return true;
    }
    case 'bookstack': {
      for (let n = 0; n < 4; n++) {
        const yy = H - 3 - n * 3,
          ww = 12 - n;
        plank(ctx, 8 - ww / 2, yy, ww, 3, n % 2 ? c : a);
        r(9 - ww / 2, yy + 1, ww - 4, 1, CREAM);
      }
      return true;
    }
    case 'globe_stand':
    case 'telescope_stand': {
      r(7, 9, 2, H - 10, d);
      r(4, H - 2, 8, 2, d);
      r(5, H - 5, 1, 3, d);
      r(10, H - 5, 1, 3, d);
      if (form === 'globe_stand') {
        e(8, 6, 5, 5, ad);
        e(7, 5, 4, 4, a);
        r(5, 4, 3, 2, c);
        r(9, 7, 2, 2, c);
        r(5, 3, 2, 1, CREAM);
      } else {
        line(ctx, 3, 10, 12, 4, c, 3);
        line(ctx, 3, 9, 11, 3, l);
        b(11, 1, 4, 5, a);
        r(12, 2, 1, 2, CREAM);
      }
      return true;
    }
    case 'statue':
    case 'fountain_in':
    case 'pillar': {
      b(2, H - 5, W - 4, 5, d);
      r(3, H - 5, W - 6, 1, l);
      if (form === 'pillar') {
        b(4, 3, W - 8, H - 7, c);
        b(2, 0, W - 4, 4, l);
        for (let x = 6; x < W - 4; x += 3) r(x, 4, 1, H - 10, d);
      } else if (form === 'statue') {
        e(W / 2, H - 10, 4, 5, c);
        e(W / 2, H - 17, 3, 3, c);
        r(W / 2 - 2, H - 18, 2, 1, l);
        r(W / 2 - 5, H - 11, 3, 1, c);
      } else {
        r(7, H - 13, 2, 8, c);
        e(8, H - 13, 5, 2, c);
        r(4, H - 14, 1, 3, a);
        r(11, H - 14, 1, 3, a);
        r(4, H - 4, W - 8, 1, a);
      }
      return true;
    }
    default:
      return false;
  }
}
export function paintWall(ctx, def) {
  if (paintWallDetail(ctx, def)) return true;
  const form = def.form || def.type,
    c = def.color || WOOD,
    a = def.accent || '#79AAA4';
  if (form === 'window') {
    windowPane(ctx, 2, 1, 16, 14);
    box(ctx, 0, 1, 4, 14, a);
    box(ctx, 16, 1, 4, 14, a);
    R(ctx, 1, 2, 1, 10, tint(a, 0.3));
    R(ctx, 0, 16, 20, 2, c);
    return true;
  }
  if (['frame', 'painting', 'portrait', 'photo_wall', 'frames', 'board'].includes(form)) {
    const cells = ['photo_wall', 'frames'].includes(form)
      ? [
          [0, 1, 9, 8],
          [11, 0, 8, 9],
          [3, 11, 9, 7],
          [13, 11, 7, 6],
        ]
      : [[1, 1, 18, 16]];
    for (const [x, y, w, h] of cells) {
      box(ctx, x, y, w, h, c);
      R(ctx, x + 2, y + 2, w - 4, h - 4, '#B7D4BD');
      poly(
        ctx,
        [
          [x + 2, y + h - 3],
          [x + w * 0.45, y + h * 0.45],
          [x + w - 3, y + h - 3],
        ],
        a,
      );
      R(ctx, x + w - 5, y + 3, 2, 2, CREAM);
    }
    return true;
  }
  if (['clock', 'cuckoo', 'round_window', 'mirror'].includes(form)) {
    oval(ctx, 10, 9, 8, 8, tint(c, -0.25));
    oval(ctx, 9, 8, 7, 7, c);
    oval(ctx, 10, 9, 6, 6, a);
    if (form === 'clock' || form === 'cuckoo') {
      line(ctx, 10, 5, 10, 9, INK);
      line(ctx, 10, 9, 13, 10, INK);
      for (const [x, y] of [
        [10, 3],
        [10, 14],
        [5, 9],
        [15, 9],
      ])
        R(ctx, x, y, 1, 1, INK);
    } else {
      R(ctx, 7, 5, 2, 3, CREAM);
      if (form === 'round_window') {
        R(ctx, 9, 3, 1, 12, c);
        R(ctx, 4, 8, 12, 1, c);
      }
    }
    return true;
  }
  if (['neon', 'neon_moon'].includes(form)) {
    box(ctx, 0, 0, 20, 18, c);
    if (form === 'neon_moon') {
      oval(ctx, 10, 9, 6, 6, a);
      oval(ctx, 12, 7, 5, 5, c);
    } else {
      oval(ctx, 7, 7, 4, 3, a);
      oval(ctx, 13, 7, 4, 3, a);
      poly(
        ctx,
        [
          [3, 8],
          [16, 8],
          [10, 15],
        ],
        a,
      );
      oval(ctx, 7, 7, 2, 1, c);
      oval(ctx, 13, 7, 2, 1, c);
    }
    return true;
  }
  return false;
}
