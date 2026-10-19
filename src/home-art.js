// Placeholder art for your home: the house at each level, furniture, wall
// items, wallpapers and floors. PNGs in assets/manifest.json with the same names replace these.
import { PAL, px, disc, shade, sprite, tentSprite } from './sprites.js';
import { FURNITURE_BY_TYPE, WALLPAPER_BY_ID, FLOOR_BY_ID } from './home.js';
import { HAIR_COLORS, SKIN_TONES } from './data.js';

// ---------- the house outside ----------

export function houseSprite(level, night) {
  if (level <= 0) return tentSprite();
  const size = [[0, 0], [52, 46], [56, 54], [60, 64]][level];
  return sprite(`house_${level}_${night ? 1 : 0}`, size[0], size[1], ctx => {
    const [w, h] = size;
    const wallTop = level === 3 ? 30 : level === 2 ? 24 : 20;
    const wall = level === 1 ? PAL.wood : '#E9DCC0';
    const wallShade = level === 1 ? PAL.woodShade : '#CDBB98';
    // walls
    px(ctx, 4, wallTop, w - 8, h - wallTop - 2, wall);
    if (level === 1) for (let y = wallTop + 3; y < h - 2; y += 4) px(ctx, 4, y, w - 8, 1, wallShade);
    else { px(ctx, 4, wallTop, 3, h - wallTop - 2, PAL.woodShade); px(ctx, w - 7, wallTop, 3, h - wallTop - 2, PAL.woodShade); }
    px(ctx, 4, h - 3, w - 8, 1, PAL.inkDeep);
    // roof
    const roof = level === 1 ? '#7A6A5A' : level === 2 ? '#8E5E54' : '#5E6E7A';
    for (let y = 0; y <= wallTop; y++) {
      const half = Math.floor((y / wallTop) * (w / 2)) + 2;
      px(ctx, w / 2 - half, y, half * 2, 1, y % 4 === 3 ? shade(roof, -0.2) : roof);
    }
    // loft window in the roof
    if (level === 3) {
      px(ctx, w / 2 - 5, 12, 10, 9, PAL.woodShade);
      px(ctx, w / 2 - 4, 13, 8, 7, night ? '#FFE7A8' : '#B7D4BD');
      px(ctx, w / 2, 13, 1, 7, PAL.woodShade);
    }
    // chimney
    px(ctx, w - 16, 2, 6, 10, PAL.stoneShade);
    px(ctx, w - 17, 1, 8, 2, PAL.stone);
    // door
    const dx = Math.floor(w / 2) - 5;
    px(ctx, dx, h - 18, 10, 15, PAL.woodShade);
    px(ctx, dx + 1, h - 17, 8, 14, '#8A6448');
    px(ctx, dx + 7, h - 10, 1, 1, '#E8C25A');
    // windows
    const win = (x, y) => {
      px(ctx, x, y, 9, 8, PAL.woodShade);
      px(ctx, x + 1, y + 1, 7, 6, night ? '#FFE7A8' : '#B7D4BD');
      px(ctx, x + 4, y + 1, 1, 6, PAL.woodShade);
      px(ctx, x, y + 8, 9, 2, '#9DBA74');
    };
    win(8, h - 18);
    win(w - 17, h - 18);
    if (level >= 2) { win(8, wallTop + 4); win(w - 17, wallTop + 4); }
    // a little step
    px(ctx, dx - 2, h - 3, 14, 3, PAL.stone);
  });
}

// ---------- wallpaper and floors ----------

export function wallpaperTile(id) {
  return sprite('wallpaper_' + id, 16, 16, ctx => {
    const wp = WALLPAPER_BY_ID[id] || WALLPAPER_BY_ID.linen;
    const [a, b] = wp.colors;
    px(ctx, 0, 0, 16, 16, a);
    switch (id) {
      case 'sage_stripe': px(ctx, 0, 0, 5, 16, b); break;
      case 'rose_floral':
        disc(ctx, 4, 4, 1.8, b); disc(ctx, 12, 12, 1.8, b);
        px(ctx, 4, 6, 1, 2, '#9DBA74'); px(ctx, 12, 14, 1, 2, '#9DBA74');
        break;
      case 'wood_panel': px(ctx, 7, 0, 1, 16, b); px(ctx, 15, 0, 1, 16, b); px(ctx, 2, 5, 3, 1, b); break;
      case 'blue_check': px(ctx, 0, 0, 8, 8, b); px(ctx, 8, 8, 8, 8, b); break;
      case 'starry': px(ctx, 3, 4, 1, 1, b); px(ctx, 11, 2, 1, 1, b); px(ctx, 8, 11, 2, 2, '#FFE7A8'); px(ctx, 14, 13, 1, 1, b); break;
      case 'mint_dots': disc(ctx, 4, 4, 1.5, b); disc(ctx, 12, 12, 1.5, b); break;
      case 'brick':
        for (let y = 0; y < 16; y += 4) {
          px(ctx, 0, y + 3, 16, 1, b);
          px(ctx, (y / 4) % 2 ? 4 : 12, y, 1, 3, b);
        }
        break;
      default: px(ctx, 0, 15, 16, 1, b);
    }
  });
}

export function floorTile(id) {
  return sprite('floor_' + id, 16, 16, ctx => {
    const fl = FLOOR_BY_ID[id] || FLOOR_BY_ID.planks;
    const [a, b] = fl.colors;
    px(ctx, 0, 0, 16, 16, a);
    switch (id) {
      case 'checker': px(ctx, 0, 0, 8, 8, b); px(ctx, 8, 8, 8, 8, b); break;
      case 'stone': px(ctx, 0, 7, 16, 1, b); px(ctx, 7, 0, 1, 7, b); px(ctx, 12, 8, 1, 8, b); break;
      case 'rose_carpet': case 'moss':
        for (let i = 0; i < 6; i++) px(ctx, (i * 5) % 15, (i * 7) % 15, 1, 1, b);
        break;
      default:
        px(ctx, 0, 7, 16, 1, b); px(ctx, 0, 15, 16, 1, b);
        px(ctx, 5, 0, 1, 7, b); px(ctx, 11, 8, 1, 7, b);
    }
  });
}

// ---------- furniture ----------

function drawFurniture(ctx, type, w, h) {
  const W = w, H = h;
  const wood = PAL.wood, woodD = PAL.woodShade, woodH = PAL.woodHi;
  switch (type) {
    case 'double_bed': case 'single_bed': {
      px(ctx, 1, 2, W - 2, 8, woodD);
      px(ctx, 2, 3, W - 4, 6, wood);
      px(ctx, 1, 9, W - 2, H - 12, PAL.linenHi);
      const pillows = type === 'double_bed' ? 2 : 1;
      for (let i = 0; i < pillows; i++) px(ctx, 3 + i * ((W - 4) / 2), 10, (W - 8) / pillows - 1, 5, '#FFFFFF');
      px(ctx, 1, 17, W - 2, H - 20, type === 'double_bed' ? PAL.rose : '#79AAA4');
      for (let x = 3; x < W - 3; x += 6) px(ctx, x, 19, 3, H - 24, shade(type === 'double_bed' ? PAL.rose : '#79AAA4', 0.25));
      px(ctx, 1, H - 4, W - 2, 3, woodD);
      return;
    }
    case 'nightstand':
      px(ctx, 2, 8, 12, 8, wood); px(ctx, 2, 8, 12, 1, woodH); px(ctx, 6, 11, 4, 1, woodD);
      px(ctx, 9, 3, 3, 5, '#FFE7A8'); px(ctx, 10, 2, 1, 1, PAL.woodShade);
      return;
    case 'wardrobe':
      px(ctx, 1, 0, 14, 22, woodD); px(ctx, 2, 1, 12, 20, wood); px(ctx, 8, 1, 1, 20, woodD);
      px(ctx, 6, 10, 1, 2, '#E8C25A'); px(ctx, 9, 10, 1, 2, '#E8C25A');
      return;
    case 'dresser':
      px(ctx, 1, 4, W - 2, 12, woodD); px(ctx, 2, 5, W - 4, 10, wood);
      for (const y of [8, 12]) px(ctx, 2, y, W - 4, 1, woodD);
      px(ctx, W / 2 - 4, 0, 8, 4, '#B7D4BD');
      return;
    case 'armchair': case 'sofa': case 'beanbag': {
      const c = type === 'beanbag' ? '#E0B45A' : type === 'sofa' ? '#79AAA4' : PAL.rose;
      if (type === 'beanbag') { disc(ctx, 8, 10, 6.5, shade(c, -0.2)); disc(ctx, 8, 9, 6, c); return; }
      px(ctx, 1, 2, W - 2, 9, shade(c, -0.2));
      px(ctx, 1, 9, W - 2, 6, c);
      px(ctx, 0, 6, 3, 9, shade(c, -0.25)); px(ctx, W - 3, 6, 3, 9, shade(c, -0.25));
      px(ctx, 2, 15, 2, 1, woodD); px(ctx, W - 4, 15, 2, 1, woodD);
      return;
    }
    case 'stool':
      px(ctx, 4, 8, 8, 3, wood); px(ctx, 5, 11, 1, 5, woodD); px(ctx, 10, 11, 1, 5, woodD);
      return;
    case 'table': case 'coffee_table': case 'desk': {
      const top = type === 'coffee_table' ? 9 : 5;
      px(ctx, 0, top, W, 3, wood); px(ctx, 0, top, W, 1, woodH);
      px(ctx, 1, top + 3, 2, 16 - top - 3, woodD); px(ctx, W - 3, top + 3, 2, 16 - top - 3, woodD);
      if (type === 'desk') { px(ctx, 4, top - 3, 6, 3, PAL.linenHi); px(ctx, W - 8, top - 5, 2, 5, '#FFE7A8'); }
      if (type === 'table') { disc(ctx, W / 2, top - 1, 2, '#E07A9B'); }
      return;
    }
    case 'bookshelf':
      px(ctx, 1, 0, 14, 22, woodD); px(ctx, 2, 1, 12, 20, '#8A6448');
      for (let s = 0; s < 3; s++) {
        px(ctx, 2, 7 + s * 7, 12, 1, woodD);
        for (let b = 0; b < 5; b++) px(ctx, 3 + b * 2, 2 + s * 7, 2, 5, ['#C68F89', '#79AAA4', '#E0B45A', '#6F925B', '#9C82C9'][(b + s) % 5]);
      }
      return;
    case 'chest':
      px(ctx, 1, 6, 14, 10, woodD); px(ctx, 2, 7, 12, 8, wood); px(ctx, 1, 9, 14, 1, woodD); px(ctx, 7, 9, 2, 3, '#E8C25A');
      return;
    case 'stove':
      px(ctx, 2, 4, 12, 12, '#4A4A4A'); px(ctx, 3, 5, 10, 4, '#5E5E5E'); px(ctx, 5, 10, 6, 4, '#E8873A');
      px(ctx, 10, 0, 3, 4, '#5E5E5E');
      return;
    case 'counter': case 'kitchen_sink':
      px(ctx, 0, 6, W, 10, '#E9DCC0'); px(ctx, 0, 5, W, 2, PAL.stoneHi);
      for (let x = 4; x < W; x += 8) px(ctx, x, 9, 2, 1, PAL.woodShade);
      if (type === 'kitchen_sink') { px(ctx, 3, 5, 10, 2, '#79AAA4'); px(ctx, 7, 1, 2, 4, PAL.stoneShade); }
      else { px(ctx, 3, 2, 5, 4, PAL.rose); disc(ctx, W - 6, 4, 2, '#C9483A'); }
      return;
    case 'icebox':
      px(ctx, 2, 0, 12, 16, '#CFDDE2'); px(ctx, 2, 7, 12, 1, '#A9C2CC'); px(ctx, 11, 3, 1, 3, PAL.stoneShade); px(ctx, 11, 9, 1, 3, PAL.stoneShade);
      return;
    case 'bathtub':
      px(ctx, 1, 7, W - 2, 8, '#F2F4EE'); px(ctx, 1, 7, W - 2, 2, '#FFFFFF'); px(ctx, 3, 8, W - 6, 2, '#B7D4BD');
      px(ctx, 2, 15, 2, 1, '#E8C25A'); px(ctx, W - 4, 15, 2, 1, '#E8C25A');
      disc(ctx, 8, 6, 2, '#FFFFFF'); disc(ctx, 12, 5, 1.5, '#FFFFFF');
      return;
    case 'washstand':
      px(ctx, 3, 8, 10, 8, wood); px(ctx, 2, 6, 12, 3, '#F2F4EE'); px(ctx, 5, 0, 6, 6, '#B7D4BD'); px(ctx, 5, 0, 6, 1, woodD);
      return;
    case 'fireplace':
      px(ctx, 0, 0, W, 16, PAL.stoneShade); px(ctx, 1, 1, W - 2, 14, PAL.stone);
      px(ctx, 6, 5, W - 12, 11, '#2A2420');
      disc(ctx, W / 2, 12, 3, '#E8873A'); disc(ctx, W / 2, 11, 1.8, '#FFE07A');
      px(ctx, 0, 0, W, 2, PAL.woodShade);
      return;
    case 'floor_lamp':
      px(ctx, 7, 6, 2, 10, PAL.woodShade); px(ctx, 4, 0, 8, 6, '#FFE7A8'); px(ctx, 5, 15, 6, 1, PAL.woodShade);
      return;
    case 'record_player':
      px(ctx, 2, 8, 12, 8, wood); disc(ctx, 8, 7, 4, '#2A2420'); disc(ctx, 8, 7, 1, '#C68F89'); px(ctx, 12, 4, 1, 4, PAL.stoneHi);
      return;
    case 'piano':
      px(ctx, 0, 0, W, 16, '#3A2A24'); px(ctx, 1, 7, W - 2, 3, '#FFFFFF');
      for (let x = 3; x < W - 2; x += 3) px(ctx, x, 7, 1, 2, '#2A2420');
      px(ctx, 2, 1, W - 4, 4, '#4E3A30');
      return;
    case 'houseplant':
      px(ctx, 5, 11, 6, 5, '#C9784A'); disc(ctx, 8, 7, 5, PAL.leaf); disc(ctx, 6, 5, 2.5, PAL.leafHi);
      return;
    case 'flower_vase':
      px(ctx, 6, 9, 4, 7, '#79AAA4');
      for (const [x, c] of [[5, '#E07A9B'], [8, '#E8C25A'], [11, '#9C82C9']]) { px(ctx, x, 4, 1, 5, PAL.leaf); disc(ctx, x + 0.5, 3, 1.6, c); }
      return;
    case 'cat_bed':
      disc(ctx, 8, 12, 6.5, PAL.rose); disc(ctx, 8, 12, 4.5, PAL.roseHi);
      return;
    case 'easel_art':
      px(ctx, 3, 4, 1, 12, woodD); px(ctx, 12, 4, 1, 12, woodD); px(ctx, 2, 0, 12, 10, PAL.linenHi);
      disc(ctx, 6, 5, 2, '#79AAA4'); px(ctx, 8, 6, 4, 3, '#9DBA74');
      return;
    case 'rug_round': case 'rug_heart': case 'rug_long': {
      const c = type === 'rug_long' ? '#79AAA4' : type === 'rug_heart' ? PAL.rose : '#C9A272';
      if (type === 'rug_heart') {
        disc(ctx, W / 2 - 6, H / 2 - 3, 8, c); disc(ctx, W / 2 + 6, H / 2 - 3, 8, c);
        for (let y = 0; y < 12; y++) px(ctx, W / 2 - 14 + y, H / 2 + y - 3, 28 - y * 2, 1, c);
      } else if (type === 'rug_round') {
        disc(ctx, W / 2, H / 2, W / 2 - 1, c); disc(ctx, W / 2, H / 2, W / 2 - 5, shade(c, 0.25)); disc(ctx, W / 2, H / 2, W / 2 - 9, c);
      } else {
        px(ctx, 1, 3, W - 2, H - 6, c); px(ctx, 3, 5, W - 6, H - 10, shade(c, 0.25));
        for (let x = 1; x < W - 1; x += 3) { px(ctx, x, 1, 1, 2, c); px(ctx, x, H - 3, 1, 2, c); }
      }
      return;
    }
    case 'canopy_bed':
      px(ctx, 1, 0, 2, H - 2, woodD); px(ctx, W - 3, 0, 2, H - 2, woodD);
      px(ctx, 1, 0, W - 2, 4, '#C9A0C9'); for (let x = 2; x < W - 2; x += 4) px(ctx, x, 4, 2, 2, '#C9A0C9');
      px(ctx, 3, 8, W - 6, 6, '#FFFFFF'); px(ctx, 3, 14, W - 6, H - 18, '#9C82C9');
      px(ctx, 3, H - 4, W - 6, 2, woodD);
      return;
    case 'rocking_chair':
      px(ctx, 3, 0, 10, 10, wood); px(ctx, 4, 1, 8, 8, woodH); px(ctx, 3, 9, 10, 4, wood);
      for (let x = 1; x < 15; x++) px(ctx, x, 14 + (Math.abs(x - 8) > 5 ? -1 : 0), 1, 1, woodD);
      return;
    case 'tall_clock':
      px(ctx, 3, 0, 10, H - 1, woodD); px(ctx, 4, 1, 8, H - 3, wood);
      disc(ctx, 8, 6, 3.5, PAL.linenHi); px(ctx, 8, 4, 1, 3, PAL.inkDeep); px(ctx, 8, 6, 2, 1, PAL.inkDeep);
      px(ctx, 7, 12, 2, 8, '#E8C25A'); disc(ctx, 8, 21, 2, '#E8C25A');
      return;
    case 'globe':
      px(ctx, 5, 13, 6, 3, woodD); px(ctx, 7, 10, 2, 3, woodD);
      disc(ctx, 8, 6, 5.5, '#5FA8C9'); px(ctx, 5, 3, 4, 3, '#8DBA5C'); px(ctx, 8, 7, 3, 3, '#8DBA5C');
      return;
    case 'tea_table':
      px(ctx, 1, 6, 14, 3, wood); px(ctx, 2, 9, 2, 6, woodD); px(ctx, 12, 9, 2, 6, woodD);
      px(ctx, 5, 2, 5, 4, PAL.linenHi); px(ctx, 10, 3, 2, 1, PAL.linenHi); px(ctx, 11, 4, 2, 2, PAL.linenHi);
      return;
    case 'paper_lantern':
      px(ctx, 7, 0, 2, 3, woodD); disc(ctx, 8, 9, 6, '#E0873A'); disc(ctx, 8, 9, 4, '#F2C46A');
      px(ctx, 5, 15, 6, 1, woodD);
      return;
    case 'bonsai':
      px(ctx, 3, 11, 10, 5, '#79AAA4'); px(ctx, 7, 6, 2, 5, woodD); px(ctx, 9, 5, 3, 1, woodD);
      disc(ctx, 6, 5, 3.5, PAL.leaf); disc(ctx, 11, 4, 3, PAL.leaf);
      return;
    case 'jukebox':
      px(ctx, 1, 2, 14, H - 3, '#B5324A'); disc(ctx, 8, 6, 6, '#E8C25A'); disc(ctx, 8, 6, 4, '#B5324A');
      px(ctx, 3, 10, 10, 6, '#3F2E36'); for (let x = 4; x < 12; x += 2) px(ctx, x, 11, 1, 4, '#E9F08A');
      return;
    case 'star_rug':
      disc(ctx, W / 2, H / 2, W / 2 - 1, '#3F5A7A');
      for (const [x, y] of [[8, 9], [20, 7], [14, 16], [24, 22], [9, 24], [18, 26]]) { px(ctx, x, y - 1, 1, 3, '#E9F08A'); px(ctx, x - 1, y, 3, 1, '#E9F08A'); }
      return;
    case 'telescope':
      px(ctx, 7, 8, 1, 8, woodD); px(ctx, 4, 15, 8, 1, woodD); px(ctx, 5, 10, 1, 6, woodD); px(ctx, 10, 10, 1, 6, woodD);
      for (let i = 0; i < 10; i++) px(ctx, 2 + i, 8 - Math.floor(i * 0.6), 3, 3, i > 7 ? PAL.inkDeep : '#B5853A');
      return;
    case 'aquarium':
      px(ctx, 1, 3, W - 2, H - 4, woodD); px(ctx, 2, 4, W - 4, H - 8, '#9FD3E0');
      px(ctx, 2, H - 7, W - 4, 3, '#E9D7A8'); px(ctx, 8, 9, 4, 3, '#E8873A'); px(ctx, 20, 7, 4, 2, '#E8C25A');
      px(ctx, 26, 8, 1, 6, PAL.leaf);
      return;
    case 'lucky_cat':
      px(ctx, 4, 6, 9, 10, PAL.linenHi); disc(ctx, 8, 6, 4.5, PAL.linenHi); px(ctx, 4, 1, 2, 3, PAL.linenHi); px(ctx, 11, 1, 2, 3, PAL.linenHi);
      px(ctx, 12, 2, 2, 6, PAL.linenHi); px(ctx, 6, 6, 1, 1, PAL.inkDeep); px(ctx, 10, 6, 1, 1, PAL.inkDeep);
      px(ctx, 6, 10, 5, 1, '#B5324A'); disc(ctx, 8, 12, 1.5, '#E8C25A');
      return;
    default:
      px(ctx, 2, 4, 12, 12, PAL.rose);
  }
}

// Height of each piece's art above its floor tiles.
const RISE = { tall_clock: 8, canopy_bed: 0, jukebox: 2, wardrobe: 10, bookshelf: 10, double_bed: 0, single_bed: 0, icebox: 4, floor_lamp: 6, fireplace: 6, piano: 4 };

export function furnitureSprite(type) {
  const f = FURNITURE_BY_TYPE[type];
  const w = (f?.w || 1) * 16;
  const h = f?.flat ? (f.h || 1) * 16 : (f?.h || 1) * 16 + (RISE[type] ?? 0);
  return sprite('furniture_' + type, w, h, ctx => drawFurniture(ctx, type, w, h));
}

// A sleeping head on a pillow, in the person's own hair and skin colours.
export function sleeperSprite(look) {
  return sprite(`sleeper_${look.skin}_${look.hairColor}`, 10, 7, ctx => {
    disc(ctx, 5, 4, 3.5, HAIR_COLORS[look.hairColor]);
    disc(ctx, 5, 5, 2.6, SKIN_TONES[look.skin]);
    px(ctx, 3, 5, 2, 1, PAL.inkDeep);
    px(ctx, 6, 5, 2, 1, PAL.inkDeep);
  });
}

// ---------- wall items ----------

export function wallItemSprite(type) {
  return sprite('wall_' + type, 20, 18, ctx => {
    const frame = (c = PAL.woodShade) => { px(ctx, 1, 1, 18, 15, c); px(ctx, 2, 2, 16, 13, PAL.linenHi); };
    switch (type) {
      case 'window':
        px(ctx, 1, 0, 18, 17, PAL.woodShade); px(ctx, 2, 1, 16, 15, '#B7D4BD'); px(ctx, 9, 1, 2, 15, PAL.woodShade); px(ctx, 2, 8, 16, 1, PAL.woodShade);
        px(ctx, 3, 2, 3, 2, '#FFFFFF'); px(ctx, 0, 16, 20, 2, PAL.wood);
        return;
      case 'painting':
        frame('#B5853A'); px(ctx, 2, 2, 16, 7, '#B7D4BD'); px(ctx, 2, 9, 16, 6, PAL.leaf); disc(ctx, 14, 5, 2, '#FFE07A');
        return;
      case 'portrait':
        frame(PAL.rose); disc(ctx, 7, 8, 3, '#5B3A29'); disc(ctx, 7, 9, 2, '#E8B994'); disc(ctx, 13, 8, 3, '#2E2420'); disc(ctx, 13, 9, 2, '#9A6544');
        px(ctx, 9, 12, 2, 2, PAL.rose);
        return;
      case 'clock':
        disc(ctx, 10, 9, 8, PAL.woodShade); disc(ctx, 10, 9, 6.5, PAL.linenHi); px(ctx, 10, 4, 1, 5, PAL.ink); px(ctx, 10, 9, 4, 1, PAL.ink);
        return;
      case 'shelf':
        px(ctx, 0, 12, 20, 2, PAL.wood); px(ctx, 2, 14, 1, 2, PAL.woodShade); px(ctx, 17, 14, 1, 2, PAL.woodShade);
        px(ctx, 3, 6, 4, 6, '#79AAA4'); disc(ctx, 11, 9, 2.5, PAL.leaf); px(ctx, 10, 10, 3, 2, '#C9784A'); px(ctx, 15, 7, 2, 5, '#E0B45A');
        return;
      case 'mirror':
        disc(ctx, 10, 9, 8, '#B5853A'); disc(ctx, 10, 9, 6.5, '#DCEEF7'); px(ctx, 7, 5, 2, 4, '#FFFFFF');
        return;
      case 'garland':
        for (let x = 0; x < 20; x++) px(ctx, x, 3 + Math.round(Math.sin(x / 3) * 2), 1, 1, PAL.leaf);
        for (let x = 1; x < 20; x += 4) disc(ctx, x + 0.5, 4 + Math.round(Math.sin(x / 3) * 2), 1.5, [PAL.rose, '#E8C25A', '#9C82C9'][x % 3]);
        return;
      case 'pennants':
        px(ctx, 0, 2, 20, 1, PAL.ink);
        for (let x = 0; x < 20; x += 5) for (let y = 0; y < 6; y++) px(ctx, x + Math.floor(y / 2), 3 + y, 4 - Math.floor(y / 1.5), 1, [PAL.rose, '#79AAA4', '#E0B45A', PAL.leaf][x / 5]);
        return;
      case 'photo_wall':
        for (const [x, y, c] of [[1, 2, '#B7D4BD'], [8, 0, '#E4B4A3'], [13, 5, '#D3E8DA'], [4, 9, '#F0D9A0']]) { px(ctx, x, y, 7, 6, PAL.linenHi); px(ctx, x + 1, y + 1, 5, 4, c); }
        return;
      case 'heart_sign':
        px(ctx, 1, 4, 18, 10, PAL.wood); px(ctx, 9, 0, 1, 4, PAL.woodShade);
        disc(ctx, 7.5, 8, 2, PAL.rose); disc(ctx, 11.5, 8, 2, PAL.rose); px(ctx, 6, 9, 8, 2, PAL.rose); px(ctx, 8, 11, 4, 1, PAL.rose);
        return;
      default:
        frame();
    }
  });
}
