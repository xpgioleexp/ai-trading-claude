// Placeholder art for your home: the house at each level, furniture, wall
// items, wallpapers and floors. PNGs in assets/manifest.json with the same names replace these.
import { PAL, px, disc, shade, sprite, tentSprite } from './sprites.js';
import { FURNITURE_BY_TYPE, WALLPAPER_BY_ID, FLOOR_BY_ID, WALL_BY_TYPE } from './home.js';
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
    if (wp.pattern) return drawPattern(ctx, wp.pattern, a, b);
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
    if (fl.pattern) return drawPattern(ctx, fl.pattern, a, b);
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

// Wallpaper and floor patterns for the big catalogue (catalog-data.js). One
// 16 × 16 tile in two colours that repeats across the wall or floor.
function drawPattern(ctx, pattern, a, b) {
  const P = (x, y, w, h, col = b) => px(ctx, x, y, w, h, col);
  const mid = shade(a, -0.08);
  switch (pattern) {
    case 'stripe': P(0, 0, 6, 16); return;
    case 'thin_stripe': P(3, 0, 1, 16); P(11, 0, 1, 16); return;
    case 'dots': disc(ctx, 4, 4, 1.4, b); disc(ctx, 12, 12, 1.4, b); return;
    case 'big_dots': disc(ctx, 4, 4, 3, b); disc(ctx, 12, 12, 3, b); return;
    case 'check': P(0, 0, 8, 8); P(8, 8, 8, 8); return;
    case 'plaid': P(0, 5, 16, 3); P(5, 0, 3, 16); P(0, 12, 16, 1, mid); P(12, 0, 1, 16, mid); return;
    case 'floral': disc(ctx, 4, 4, 2, b); disc(ctx, 12, 12, 2, b); P(4, 4, 1, 1, a); P(12, 12, 1, 1, a); P(3, 7, 1, 2, '#7FAF5B'); P(11, 15, 1, 1, '#7FAF5B'); return;
    case 'stars': P(3, 3, 1, 1); P(2, 4, 3, 1); P(3, 5, 1, 1); P(11, 10, 1, 1); P(10, 11, 3, 1); P(11, 12, 1, 1); P(13, 3, 1, 1); P(6, 13, 1, 1); return;
    case 'hearts': for (const [x, y] of [[4, 4], [12, 12]]) { P(x - 2, y - 1, 2, 2); P(x + 1, y - 1, 2, 2); P(x - 2, y + 1, 5, 1); P(x - 1, y + 2, 3, 1); P(x, y + 3, 1, 1); } return;
    case 'waves': for (let x = 0; x < 16; x++) { P(x, 4 + Math.round(Math.sin(x / 2.5) * 1.5), 1, 2); P(x, 12 + Math.round(Math.sin(x / 2.5 + 2) * 1.5), 1, 2); } return;
    case 'brick': for (let y = 0; y < 16; y += 4) { P(0, y + 3, 16, 1); P((y / 4) % 2 ? 4 : 12, y, 1, 3); } return;
    case 'panel': P(7, 0, 1, 16); P(15, 0, 1, 16); P(1, 2, 5, 12, mid); P(9, 2, 5, 12, mid); return;
    case 'diamond': for (let i = 0; i < 8; i++) { P(8 - i, i, 1, 1); P(8 + i, i, 1, 1); P(i, 8 + i, 1, 1); P(15 - i, 8 + i, 1, 1); } return;
    case 'zigzag': for (let x = 0; x < 16; x++) { const y = x % 8 < 4 ? x % 4 : 3 - (x % 4); P(x, y + 2, 1, 2); P(x, y + 10, 1, 2); } return;
    case 'scallop': for (const [x, y] of [[4, 6], [12, 6], [0, 14], [8, 14], [16, 14]]) disc(ctx, x, y, 4, b); for (const [x, y] of [[4, 5], [12, 5], [0, 13], [8, 13], [16, 13]]) disc(ctx, x, y, 3, a); return;
    case 'leaves': for (const [x, y] of [[3, 3], [11, 11]]) { P(x, y, 3, 2); P(x + 1, y + 2, 2, 1); P(x + 1, y - 1, 1, 1); } P(7, 9, 1, 3, mid); return;
    case 'grid': P(0, 0, 16, 1); P(0, 0, 1, 16); return;
    case 'wainscot': P(0, 9, 16, 7); P(0, 9, 16, 1, shade(b, 0.2)); P(7, 10, 1, 6, shade(b, -0.15)); P(15, 10, 1, 6, shade(b, -0.15)); return;
    case 'damask': disc(ctx, 8, 8, 3, b); P(7, 2, 2, 12); P(2, 7, 12, 2); disc(ctx, 8, 8, 1.5, a); return;
    case 'clouds': disc(ctx, 4, 5, 2.5, '#FFFFFF'); disc(ctx, 7, 4, 3, '#FFFFFF'); disc(ctx, 13, 12, 2.5, '#FFFFFF'); disc(ctx, 10, 12, 2, '#FFFFFF'); return;
    case 'moons': disc(ctx, 5, 5, 2.5, b); disc(ctx, 6, 4, 2.2, a); P(12, 11, 1, 1); P(10, 13, 1, 1); return;
    case 'rainbow': ['#E8707A', '#F0A55A', '#F0DA6A', '#8DC76A', '#6FA9D9', '#9C82C9'].forEach((c, i) => P(0, 2 + i * 2, 16, 1, c)); return;
    case 'herringbone': for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) { const up = ((x + y) / 4) % 2; P(x, y + (up ? 3 : 0), 4, 1); P(x + (up ? 3 : 0), y, 1, 4); } return;
    case 'planks': P(0, 7, 16, 1); P(0, 15, 16, 1); P(5, 0, 1, 7); P(11, 8, 1, 7); return;
    case 'parquet': P(0, 0, 8, 8, mid); P(8, 8, 8, 8, mid); for (let i = 2; i < 8; i += 2) { P(0, i, 8, 1); P(8 + i, 8, 1, 8); P(8 + i, 0, 1, 8, mid); P(0, 8 + i, 8, 1, mid); } return;
    case 'checker': P(0, 0, 8, 8); P(8, 8, 8, 8); return;
    case 'tiles': P(0, 0, 16, 1); P(0, 8, 16, 1); P(0, 0, 1, 16); P(8, 0, 1, 16); return;
    case 'big_tiles': P(0, 0, 16, 1); P(0, 0, 1, 16); P(2, 2, 3, 3, shade(a, 0.1)); return;
    case 'stone': P(0, 7, 16, 1); P(7, 0, 1, 7); P(12, 8, 1, 8); P(3, 11, 2, 1, mid); return;
    case 'carpet': for (let i = 0; i < 8; i++) P((i * 5 + 2) % 15, (i * 7 + 1) % 15, 1, 1); return;
    case 'marble': for (let x = 0; x < 16; x++) P(x, Math.round(8 + Math.sin(x / 2) * 3 + x / 4), 1, 1); P(2, 2, 3, 1, mid); return;
    case 'terrazzo': for (const [x, y, c] of [[2, 3, b], [9, 2, '#E07A9B'], [13, 9, b], [5, 11, '#79AAA4'], [10, 13, b], [1, 14, '#E8C25A']]) P(x, y, 2, 2, c); return;
    case 'tatami': P(0, 0, 16, 1, shade(b, -0.2)); P(0, 15, 16, 1, shade(b, -0.2)); for (let y = 2; y < 15; y += 2) P(0, y, 16, 1, mid); return;
    case 'grass': for (let i = 0; i < 10; i++) P((i * 7 + 3) % 16, (i * 5 + 2) % 15, 1, 2); return;
    case 'sand': for (let i = 0; i < 9; i++) P((i * 9 + 1) % 16, (i * 4 + 3) % 16, 1, 1); return;
    case 'hex': for (const [x, y] of [[4, 4], [12, 12]]) { P(x - 2, y - 3, 4, 1); P(x - 3, y - 2, 1, 4); P(x + 2, y - 2, 1, 4); P(x - 2, y + 2, 4, 1); } return;
    case 'mosaic': for (let y = 0; y < 16; y += 4) for (let x = 0; x < 16; x += 4) P(x, y, 3, 3, (x * 3 + y) % 8 ? mid : b); return;
    case 'cobble': for (const [x, y, w, h] of [[0, 0, 7, 5], [8, 0, 8, 6], [0, 6, 5, 5], [6, 7, 6, 5], [13, 7, 3, 5], [0, 12, 8, 4], [9, 13, 7, 3]]) { P(x, y, w, h, mid); P(x, y, w, 1, b); } return;
    case 'stripes': P(0, 0, 16, 4); P(0, 8, 16, 4); return;
    default: return;
  }
}

// ---------- furniture ----------

function drawFurniture(ctx, type, w, h) {
  const W = w, H = h;
  const wood = PAL.wood, woodD = PAL.woodShade, woodH = PAL.woodHi;
  const formDef = FURNITURE_BY_TYPE[type];
  if (formDef?.form) return drawForm(ctx, formDef, W, H);
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
    case 'fish_trophy':
      px(ctx, 4, 12, 8, 4, woodD); px(ctx, 6, 9, 4, 3, '#E8C25A');
      disc(ctx, 8, 5, 4.5, '#E8C25A'); px(ctx, 3, 4, 10, 2, '#5E8AA0'); px(ctx, 12, 3, 2, 4, '#5E8AA0');
      return;
    case 'mushroom_lamp':
      px(ctx, 6, 8, 4, 8, PAL.linenHi); disc(ctx, 8, 6, 6, '#D9533C');
      for (const [x, y] of [[5, 4], [10, 3], [8, 7]]) px(ctx, x, y, 2, 2, PAL.linenHi);
      return;
    case 'surfboard':
      disc(ctx, 8, 4, 3.5, '#5FA8C9'); px(ctx, 5, 4, 7, 11, '#5FA8C9'); px(ctx, 7, 1, 2, 14, '#F2EDE4'); px(ctx, 4, 15, 8, 1, woodD);
      return;
    case 'snow_globe':
      px(ctx, 3, 12, 10, 4, woodD); disc(ctx, 8, 7, 5.5, '#C9E3EC'); px(ctx, 6, 8, 4, 3, '#F2FAFF'); px(ctx, 7, 6, 2, 2, '#4F8A4A');
      px(ctx, 5, 4, 1, 1, '#FFFFFF'); px(ctx, 10, 6, 1, 1, '#FFFFFF');
      return;
    case 'trellis':
      for (let x = 2; x < 15; x += 4) px(ctx, x, 1, 1, 15, wood);
      for (let y = 3; y < 15; y += 4) px(ctx, 1, y, 14, 1, wood);
      for (const [x, y] of [[3, 2], [9, 5], [5, 9], [12, 11], [2, 13]]) px(ctx, x, y, 2, 2, PAL.rose);
      return;
    case 'brass_lantern':
      px(ctx, 7, 0, 2, 2, '#B5853A'); px(ctx, 4, 2, 8, 2, '#D9A53A'); px(ctx, 5, 4, 6, 9, '#B5853A'); px(ctx, 6, 5, 4, 7, '#F2C46A');
      px(ctx, 4, 13, 8, 2, '#D9A53A');
      return;
    case 'hammock':
      px(ctx, 1, 2, 2, 14, woodD); px(ctx, W - 3, 2, 2, 14, woodD);
      for (let x = 3; x < W - 3; x++) px(ctx, x, 6 + Math.round(Math.sin(((x - 3) / (W - 6)) * Math.PI) * 4), 1, 3, x % 4 < 2 ? '#E07A7A' : '#F2EDE4');
      return;
    case 'spore_lamp':
      px(ctx, 7, 7, 2, 9, '#F2EDE4'); disc(ctx, 8, 6, 6, '#7FD0B0'); disc(ctx, 8, 6, 3.5, '#B9F0D0');
      return;
    case 'paper_screen':
      px(ctx, 1, 1, W - 2, H - 2, woodD);
      for (let i = 0; i < 3; i++) px(ctx, 2 + i * ((W - 4) / 3), 2, (W - 4) / 3 - 1, H - 4, '#F5EED8');
      px(ctx, 2, H / 2, W - 4, 1, woodD);
      return;
    case 'star_lamp':
      px(ctx, 7, 9, 2, 6, woodD); px(ctx, 4, 15, 8, 1, woodD);
      for (const [x, y, w, h] of [[7, 0, 2, 9], [4, 3, 8, 2], [3, 4, 10, 1], [5, 6, 6, 2]]) px(ctx, x, y, w, h, '#F2E48A');
      return;
    default:
      if (type.startsWith('plush_')) {
        const def = FURNITURE_BY_TYPE[type]?.plush;
        const c = def?.color || PAL.rose;
        disc(ctx, 8, 11, 5, c); disc(ctx, 8, 5, 4, c);
        px(ctx, 4, 1, 2, 3, c); px(ctx, 10, 1, 2, 3, c);
        px(ctx, 6, 4, 1, 1, PAL.inkDeep); px(ctx, 9, 4, 1, 1, PAL.inkDeep); px(ctx, 7, 6, 2, 1, PAL.rose);
        px(ctx, 6, 13, 4, 1, shade(c, -0.3));
        return;
      }
      px(ctx, 2, 4, 12, 12, PAL.rose);
  }
}

// Furniture drawn from a shape and two colours (see furniture-data.js).
// Each shape fills W x H, with the floor at the bottom.
function drawForm(ctx, def, W, H) {
  const c = def.color, a = def.accent;
  const d = shade(c, -0.3), l = shade(c, 0.3), ad = shade(a, -0.25), al = shade(a, 0.35);
  const P = (x, y, w, h, col) => px(ctx, Math.round(x), Math.round(y), Math.round(w), Math.round(h), col);
  const legs = (y, col = d) => { P(2, y, 2, H - y, col); P(W - 4, y, 2, H - y, col); };
  const glow = (x, y, r) => { ctx.fillStyle = 'rgba(255,230,160,0.25)'; ctx.fillRect(x - r, y - r, r * 2, r * 2); };
  switch (def.form) {
    case 'bed': case 'futon': {
      const low = def.form === 'futon';
      if (!low) { P(1, 1, W - 2, 8, d); P(2, 2, W - 4, 6, c); }
      P(1, low ? 4 : 8, W - 2, H - (low ? 6 : 10), low ? c : PAL.linenHi);
      const pillows = W > 20 ? 2 : 1;
      for (let i = 0; i < pillows; i++) P(3 + i * ((W - 4) / 2), low ? 6 : 10, (W - 8) / pillows - 1, 5, '#FFFFFF');
      P(1, low ? 13 : 16, W - 2, H - (low ? 15 : 19), a);
      for (let x = 3; x < W - 3; x += 6) P(x, low ? 15 : 18, 3, H - (low ? 19 : 23), al);
      if (!low) P(1, H - 3, W - 2, 3, d);
      return;
    }
    case 'bunk':
      P(1, 0, 2, H, d); P(W - 3, 0, 2, H, d);
      for (const y of [4, H / 2 + 2]) { P(2, y, W - 4, 3, PAL.linenHi); P(2, y + 3, W - 4, 6, a); P(1, y + 9, W - 2, 2, c); }
      P(W - 6, 6, 1, H - 8, d);
      return;
    case 'chair':
      P(3, 0, 10, 8, c); P(4, 1, 8, 6, l); P(2, 8, 12, 4, a); legs(12);
      return;
    case 'armchair':
      P(1, 2, 14, 12, d); P(2, 3, 12, 10, c); P(1, 6, 3, 9, c); P(12, 6, 3, 9, c); P(4, 9, 8, 4, a); P(5, 4, 6, 3, l);
      return;
    case 'stool':
      disc(ctx, 8, 6, 5, c); disc(ctx, 8, 5.5, 3.5, a); P(4, 8, 2, H - 8, d); P(10, 8, 2, H - 8, d);
      return;
    case 'stump':
      P(3, 4, 10, H - 4, d); disc(ctx, 8, 5, 5, c); disc(ctx, 8, 5, 3, a); disc(ctx, 8, 5, 1.5, c);
      return;
    case 'sofa':
      P(0, 2, W, H - 4, d); P(1, 3, W - 2, H - 6, c); P(0, 6, 3, H - 7, c); P(W - 3, 6, 3, H - 7, c);
      for (let x = 3; x < W - 4; x += (W - 6) / 2) P(x, 8, (W - 6) / 2 - 1, 5, a);
      P(2, H - 2, 2, 2, d); P(W - 4, H - 2, 2, 2, d);
      return;
    case 'beanbag':
      disc(ctx, 8, 10, 6.5, d); disc(ctx, 8, 9.5, 6, c); disc(ctx, 6, 7, 2.5, l);
      return;
    case 'cushion':
      P(2, 6, 12, 9, d); P(3, 7, 10, 7, c); P(7, 10, 2, 2, a);
      return;
    case 'table': case 'desk': case 'counter':
      P(0, 4, W, 4, c); P(0, 4, W, 1, l); legs(8);
      if (def.form === 'desk') { P(W - 9, 8, 6, 5, d); P(W - 7, 10, 2, 1, a); }
      if (def.form === 'counter') { P(0, 8, W, H - 8, d); P(2, 10, W - 4, 4, shade(c, -0.15)); P(W / 2 - 1, 11, 2, 1, a); }
      if (def.form === 'table') { P(W / 2 - 3, 1, 6, 3, a); }
      return;
    case 'round_table':
      disc(ctx, 8, 6, 7, d); disc(ctx, 8, 5.5, 6.5, c); P(7, 9, 2, H - 9, d); P(4, H - 2, 8, 2, d); P(6, 3, 4, 2, a);
      return;
    case 'low_table': case 'kotatsu':
      P(0, 7, W, 4, c); P(0, 7, W, 1, l);
      if (def.form === 'kotatsu') { P(0, 11, W, H - 11, a); P(0, 11, W, 1, ad); } else legs(11);
      P(W / 2 - 3, 4, 6, 3, a);
      return;
    case 'shelf': case 'low_shelf': {
      const top = def.form === 'low_shelf' ? 6 : 0;
      P(0, top, W, H - top, d); P(1, top + 1, W - 2, H - top - 2, c);
      for (let y = top + 3; y < H - 3; y += 6) {
        P(1, y + 4, W - 2, 1, d);
        for (let x = 2; x < W - 3; x += 3) P(x, y, 2, 4, (x / 3) % 2 ? a : al);
      }
      return;
    }
    case 'cabinet': case 'tall_cabinet':
      P(0, 0, W, H, d); P(1, 1, W - 2, H - 2, c);
      if (def.form === 'tall_cabinet') { P(W / 2, 2, 1, H - 4, d); P(W / 2 - 3, H / 2, 2, 2, a); P(W / 2 + 2, H / 2, 2, 2, a); }
      else for (let y = 3; y < H - 3; y += 5) { P(2, y + 3, W - 4, 1, d); P(W / 2 - 1, y + 1, 2, 1, a); }
      return;
    case 'chest':
      P(1, 5, 14, 10, d); P(2, 6, 12, 8, c); P(1, 4, 14, 3, l); P(1, 9, 14, 1, a); P(7, 8, 2, 3, a);
      return;
    case 'lamp':
      P(7, 8, 2, H - 9, c); P(4, H - 2, 8, 2, d); P(3, 1, 10, 7, a); P(4, 2, 8, 5, al); glow(8, 5, 7);
      return;
    case 'table_lamp':
      P(3, 9, 10, 3, c); P(4, 12, 2, 4, d); P(10, 12, 2, 4, d); P(7, 5, 2, 4, d); P(4, 1, 8, 5, a); glow(8, 4, 6);
      return;
    case 'lava_lamp':
      P(6, 0, 4, 3, c); P(5, 3, 6, 9, shade(a, 0.5)); disc(ctx, 8, 6, 1.5, a); disc(ctx, 7, 10, 1.2, a); P(5, 12, 6, 4, c);
      return;
    case 'lantern':
      P(4, 2, 8, 2, c); P(3, 4, 10, 10, a); for (let y = 6; y < 14; y += 3) P(3, y, 10, 1, shade(a, -0.1)); P(4, 14, 8, 2, c); glow(8, 9, 7);
      return;
    case 'candles':
      for (const [x, h] of [[3, 7], [7, 10], [11, 6]]) { P(x, 16 - h, 3, h, c); P(x + 1, 14 - h, 1, 2, a); }
      glow(8, 8, 6);
      return;
    case 'salt_lamp':
      disc(ctx, 8, 8, 5.5, c); disc(ctx, 7, 6, 2.5, a); P(4, 13, 8, 3, PAL.woodShade); glow(8, 8, 7);
      return;
    case 'jar_lamp':
      P(5, 2, 6, 2, PAL.woodShade); P(4, 4, 8, 11, c); for (const [x, y] of [[6, 7], [9, 9], [7, 12]]) P(x, y, 1, 1, a); glow(8, 9, 6);
      return;
    case 'lighthouse':
      P(5, 4, 6, 12, c); P(5, 7, 6, 2, a); P(5, 12, 6, 2, a); P(6, 1, 4, 3, '#F2E48A'); P(5, 0, 6, 1, a); glow(8, 2, 5);
      return;
    case 'plant': case 'tall_plant': {
      const tall = def.form === 'tall_plant';
      P(4, H - 6, 8, 6, c); P(3, H - 7, 10, 2, d);
      if (tall) { P(7, 6, 2, H - 12, PAL.woodShade); for (const [x, y, r] of [[5, 5, 4], [11, 4, 4], [8, 1, 3.5], [4, 10, 3], [12, 10, 3]]) disc(ctx, x, y, r, a); }
      else for (const [x, y, r] of [[5, 7, 3], [11, 6, 3], [8, 4, 3]]) disc(ctx, x, y, r, a);
      if (def.type === 'lemon_tree_pot') for (const [x, y] of [[5, 4], [10, 7]]) P(x, y, 2, 2, '#F0DA4A');
      return;
    }
    case 'cactus_pot':
      P(4, 11, 8, 5, c); P(6, 2, 4, 9, a); P(3, 5, 3, 4, a); P(10, 4, 3, 4, a); P(7, 1, 2, 1, '#E07A9B');
      return;
    case 'succulents':
      P(1, 10, 14, 5, c); for (const x of [4, 8, 12]) disc(ctx, x, 9, 2.5, a);
      return;
    case 'flower_box':
      P(0, 8, W, 7, c); P(0, 8, W, 1, shade(c, 0.2)); for (let x = 2; x < W - 1; x += 4) { P(x, 4, 1, 4, '#4F8A4A'); disc(ctx, x + 0.5, 3, 1.6, a); }
      return;
    case 'vase':
      P(5, 8, 6, 8, c); P(6, 6, 4, 2, c); for (const [x, y] of [[5, 3], [9, 2], [7, 1], [11, 4]]) { P(x, y + 2, 1, 4, '#4F8A4A'); disc(ctx, x, y, 1.6, a); }
      return;
    case 'rug':
      P(0, 1, W, H - 2, a); P(2, 3, W - 4, H - 6, c);
      for (let x = 4; x < W - 4; x += 6) P(x, 5, 3, H - 10, a);
      for (let x = 1; x < W - 1; x += 3) { P(x, 0, 1, 1, a); P(x, H - 1, 1, 1, a); }
      return;
    case 'round_rug':
      disc(ctx, W / 2, H / 2, W / 2 - 1, c); disc(ctx, W / 2, H / 2, W / 2 - 5, a); disc(ctx, W / 2, H / 2, W / 2 - 9, c);
      return;
    case 'tatami':
      P(0, 0, W, H, c); P(0, 0, W, 1, a); P(0, H - 1, W, 1, a); P(0, 0, 1, H, a); P(W - 1, 0, 1, H, a); P(W / 2, 0, 1, H, a);
      for (let y = 3; y < H; y += 3) P(1, y, W - 2, 1, shade(c, -0.08));
      return;
    case 'mat':
      P(1, 1, W - 2, H - 2, c); P(2, 2, W - 4, H - 4, a); P(1, 1, W - 2, 1, shade(c, 0.2));
      return;
    case 'train':
      P(1, 1, W - 2, H - 2, '#5E8A4A'); P(4, 4, W - 8, 2, a); P(4, H - 6, W - 8, 2, a); P(4, 4, 2, H - 8, a); P(W - 6, 4, 2, H - 8, a);
      P(8, 2, 8, 5, c); P(9, 1, 3, 2, '#3A3A40');
      return;
    case 'tv':
      P(1, H - 5, W - 2, 5, c); P(2, 1, W - 4, H - 7, '#2A2A30'); P(3, 2, W - 6, H - 9, a); P(4, 3, 3, 2, al);
      return;
    case 'speaker':
      P(4, 3, 8, 13, c); disc(ctx, 8, 7, 2.5, a); disc(ctx, 8, 12, 2, a);
      return;
    case 'fridge': case 'washer': case 'machine':
      P(1, 0, 14, H, d); P(2, 1, 12, H - 2, c);
      if (def.form === 'fridge') { P(2, H * 0.4, 12, 1, d); P(11, 4, 1, 4, a); P(11, H * 0.5, 1, 6, a); }
      if (def.form === 'washer') { disc(ctx, 8, H * 0.6, 4.5, a); disc(ctx, 8, H * 0.6, 3, al); P(3, 2, 10, 2, d); }
      if (def.form === 'machine') { P(4, 3, 8, 4, '#2A2A30'); P(5, 9, 6, 3, a); P(5, 13, 6, 2, d); }
      return;
    case 'stove':
      P(0, 1, 16, 15, d); P(1, 2, 14, 13, c); P(2, 7, 12, 7, shade(c, -0.15)); P(4, 9, 8, 3, a);
      disc(ctx, 5, 4, 1.5, '#2A2A30'); disc(ctx, 11, 4, 1.5, '#2A2A30');
      return;
    case 'tub':
      P(1, 2, W - 2, H - 5, c); P(2, 3, W - 4, 4, a); P(1, 2, W - 2, 1, shade(c, 0.1)); P(3, H - 3, 2, 3, '#D9A53A'); P(W - 5, H - 3, 2, 3, '#D9A53A');
      return;
    case 'vanity':
      P(2, 0, 12, 7, PAL.woodShade); P(3, 1, 10, 5, a); P(1, 8, 14, 3, c); P(1, 11, 14, 5, shade(c, -0.1)); P(6, 9, 4, 1, '#9A958A');
      return;
    case 'rack':
      P(2, 2, 1, 14, c); P(13, 2, 1, 14, c); P(2, 3, 12, 1, c); P(3, 4, 10, 7, a); P(3, 9, 10, 1, al);
      return;
    case 'basket':
      P(2, 6, 12, 10, c); for (let y = 8; y < 16; y += 2) P(2, y, 12, 1, shade(c, -0.15)); P(4, 3, 8, 4, a);
      return;
    case 'duck':
      disc(ctx, 8, 11, 5, c); disc(ctx, 10, 5, 3.5, c); P(13, 5, 3, 2, a); P(10, 4, 1, 1, PAL.inkDeep);
      return;
    case 'teddy':
      disc(ctx, 8, 11, 5, c); disc(ctx, 8, 5, 4, c); disc(ctx, 5, 2, 1.5, c); disc(ctx, 11, 2, 1.5, c);
      P(6, 4, 1, 1, PAL.inkDeep); P(9, 4, 1, 1, PAL.inkDeep); P(6, 9, 4, 1, a); disc(ctx, 8, 11, 2, l);
      return;
    case 'blocks':
      P(1, 9, 6, 6, c); P(8, 9, 6, 6, a); P(4, 3, 6, 6, shade(a, 0.4)); P(3, 11, 2, 2, PAL.linenHi);
      return;
    case 'rocking_horse':
      for (let x = 1; x < 15; x++) P(x, 14 + (Math.abs(x - 8) > 5 ? -1 : 0), 1, 1, PAL.woodShade);
      P(3, 7, 9, 5, c); P(10, 2, 4, 6, c); P(4, 12, 1, 2, d); P(10, 12, 1, 2, d); P(9, 2, 2, 7, a); P(12, 3, 1, 1, PAL.inkDeep);
      return;
    case 'tent':
      for (let y = 0; y < H - 2; y++) { const w = Math.round((y / (H - 2)) * (W - 2)); P(W / 2 - w / 2, y + 1, w, 1, (Math.floor(y / 3) % 2) ? c : a); }
      P(W / 2 - 3, H - 10, 6, 9, shade(c, -0.4));
      return;
    case 'ball_pit':
      P(0, 6, W, H - 6, a); P(2, 8, W - 4, H - 10, c);
      for (let i = 0; i < 18; i++) disc(ctx, 4 + (i * 7) % (W - 8), 10 + (i * 5) % (H - 14), 2, ['#E07A7A', '#5F9FB5', '#F0DA4A', '#7FC95A'][i % 4]);
      return;
    case 'mushroom':
      P(6, 8, 4, 8, a); disc(ctx, 8, 6, 7, c); P(1, 6, 14, 2, c); for (const [x, y] of [[4, 3], [10, 2], [8, 6]]) P(x, y, 2, 2, PAL.linenHi);
      return;
    case 'wheel':
      disc(ctx, 8, 7, 6.5, c); disc(ctx, 8, 7, 4.5, PAL.linenHi); disc(ctx, 8, 7, 1.5, c);
      for (const [x, y] of [[8, 0], [8, 13], [1, 7], [14, 7]]) P(x - 1, y, 2, 2, a); P(7, 13, 2, 3, PAL.woodShade);
      return;
    case 'firewood':
      P(1, 2, 2, 14, c); P(13, 2, 2, 14, c); for (let y = 4; y < 15; y += 3) for (let x = 3; x < 13; x += 3) disc(ctx, x + 1, y + 1, 1.5, a);
      return;
    case 'coat_rack':
      P(7, 2, 2, 13, c); P(4, 15, 8, 1, c); P(4, 3, 3, 1, c); P(9, 3, 3, 1, c); P(3, 4, 4, 7, a);
      return;
    case 'phone':
      P(2, 8, 12, 2, c); P(3, 10, 1, 6, d); P(12, 10, 1, 6, d); P(4, 4, 8, 4, a); P(4, 3, 8, 1, shade(a, -0.3));
      return;
    case 'ladder':
      P(3, 0, 2, 16, c); P(11, 0, 2, 16, c); for (let y = 2; y < 16; y += 4) P(3, y, 10, 1, a);
      return;
    case 'board':
      P(1, 0, 14, 11, c); P(2, 1, 12, 9, a); P(4, 3, 6, 1, '#F2F4F6'); P(4, 5, 4, 1, '#F2F4F6'); P(3, 11, 2, 5, c); P(11, 11, 2, 5, c);
      return;
    case 'cart':
      P(1, 5, 14, 2, c); P(1, 11, 14, 2, c); P(1, 5, 1, 9, d); P(14, 5, 1, 9, d); disc(ctx, 3, 15, 1.2, d); disc(ctx, 13, 15, 1.2, d);
      P(4, 2, 3, 3, a); P(9, 2, 3, 3, a);
      return;
    case 'sewing':
      P(0, 7, 16, 3, c); P(1, 10, 2, 6, d); P(13, 10, 2, 6, d); P(3, 2, 9, 5, a); P(9, 1, 3, 2, a); P(5, 6, 1, 2, PAL.inkDeep);
      return;
    case 'guitar':
      disc(ctx, 8, 11, 4.5, c); disc(ctx, 8, 7, 3.2, c); disc(ctx, 8, 10, 1.3, a); P(7, 0, 2, 7, a); P(6, 0, 4, 2, d);
      return;
    case 'drums':
      disc(ctx, 8, 10, 5, a); disc(ctx, 8, 10, 4, c); disc(ctx, 20, 9, 4, a); disc(ctx, 20, 9, 3, c); disc(ctx, 26, 4, 3, '#E8C25A'); P(26, 4, 1, 12, '#9A958A');
      return;
    case 'pottery':
      P(2, 9, 12, 7, c); disc(ctx, 8, 8, 5, d); P(5, 2, 6, 6, a); P(6, 1, 4, 1, shade(a, -0.2));
      return;
    case 'computer':
      P(0, 7, W, 3, c); P(1, 10, 2, 6, d); P(W - 3, 10, 2, 6, d); P(W / 2 - 6, 0, 12, 7, '#2A2A30'); P(W / 2 - 5, 1, 10, 5, a); P(W / 2 - 4, 6, 8, 1, '#5A5A60');
      return;
    case 'harp':
      P(3, 1, 2, 15, c); for (let x = 5; x < 13; x++) P(x, 1 + (x - 5) * 0.4, 1, 1, c); P(12, 4, 2, 12, c);
      for (let x = 6; x < 12; x += 2) P(x, 3, 1, 12, a);
      return;
    case 'mirror':
      P(3, 0, 10, 14, c); P(4, 1, 8, 12, a); P(5, 2, 2, 4, PAL.linenHi); P(4, 14, 2, 2, c); P(10, 14, 2, 2, c);
      return;
    case 'screen':
      for (let i = 0; i < 4; i++) { P(i * (W / 4), 1, W / 4 - 1, H - 2, c); P(i * (W / 4) + 1, 2, W / 4 - 3, H - 4, a); }
      return;
    // ---- shapes for the big catalogue (catalog-data.js) ----
    case 'arcade':
      P(2, 0, 12, H, d); P(3, 1, 10, H - 2, c); P(4, 3, 8, 7, '#1E2430'); P(5, 4, 3, 2, a); P(9, 7, 2, 2, al);
      P(3, 12, 10, 3, l); P(5, 12, 1, 2, '#3A3A40'); disc(ctx, 5.5, 11.5, 1.2, a); P(9, 13, 2, 1, ad); P(11, 13, 1, 1, al);
      return;
    case 'throne':
      P(3, 0, 10, H - 8, d); P(4, 1, 8, H - 10, a); P(2, H - 9, 12, 3, c); P(3, H - 6, 2, 6, d); P(11, H - 6, 2, 6, d);
      P(1, H - 12, 2, 6, c); P(13, H - 12, 2, 6, c); disc(ctx, 8, 3, 1.5, '#E8C25A');
      return;
    case 'hanging_chair':
      P(7, 0, 2, 4, d); P(2, 0, 12, 1, d); disc(ctx, 8, H - 8, 6, c); disc(ctx, 8, H - 8, 4.5, a); P(2, H - 7, 12, 2, c); P(6, H - 2, 4, 2, d);
      return;
    case 'pillar':
      P(3, 0, 10, 3, l); P(4, 3, 8, H - 6, c); for (let x = 5; x < 12; x += 2) P(x, 3, 1, H - 6, d); P(2, H - 3, 12, 3, l);
      return;
    case 'statue':
      P(3, H - 6, 10, 6, d); P(4, H - 7, 8, 2, l); disc(ctx, 8, H - 12, 3.5, c); disc(ctx, 8, H - 18, 2.5, c); P(6, H - 15, 4, 4, c); P(9, H - 19, 1, 1, l);
      return;
    case 'fishtank':
      P(1, 1, W - 2, H - 5, d); P(2, 2, W - 4, H - 7, '#9FD3E0'); P(2, 2, W - 4, 2, al); P(1, H - 4, W - 2, 4, c);
      for (const [x, y] of [[6, 7], [W - 10, 10], [W / 2, 5]]) { P(x, y, 4, 2, a); P(x + 4, y - 1, 1, 4, a); }
      for (let x = 4; x < W - 4; x += 5) P(x, H - 8, 1, 3, '#4F8A4A');
      return;
    case 'bookstack':
      for (const [y, w, col] of [[H - 3, 12, c], [H - 6, 10, a], [H - 9, 11, d], [H - 12, 8, al]]) { P(8 - w / 2, y, w, 3, col); P(8 - w / 2, y, 1, 3, shade(col, -0.3)); }
      return;
    case 'gramophone':
      P(3, H - 6, 10, 6, c); P(4, H - 5, 8, 1, d); P(7, H - 11, 2, 5, d);
      for (let i = 0; i < 6; i++) P(8 + i, H - 12 - i, 2 + i, 2 + i * 0.8, i % 2 ? a : al);
      return;
    case 'vending':
      P(1, 0, 14, H, d); P(2, 1, 12, H - 2, c); P(3, 2, 7, H - 8, '#E9F2F6');
      for (let y = 3; y < H - 7; y += 4) for (let x = 4; x < 10; x += 3) P(x, y, 2, 2, (x + y) % 2 ? a : al);
      P(11, 4, 2, 6, ad); P(3, H - 5, 7, 2, '#1E2430');
      return;
    case 'easel':
      P(3, 2, 1, H - 2, d); P(12, 2, 1, H - 2, d); P(7, 0, 2, H, d); P(2, 3, 12, 9, '#F2EDE4'); P(3, 4, 10, 7, a); disc(ctx, 6, 7, 2, al); P(9, 6, 3, 4, c);
      return;
    case 'grandfather':
      P(4, 0, 8, H, d); P(5, 1, 6, H - 2, c); disc(ctx, 8, 5, 3, '#F2EDE4'); P(8, 3, 1, 2, d); P(8, 5, 2, 1, d);
      P(6, 10, 4, H - 14, shade(c, -0.15)); P(7.5, 12, 1, H - 20, '#E8C25A'); disc(ctx, 8, H - 7, 1.5, '#E8C25A');
      return;
    case 'bench':
      P(1, H - 9, W - 2, 3, c); P(1, H - 13, W - 2, 3, a); P(2, H - 6, 2, 6, d); P(W - 4, H - 6, 2, 6, d);
      return;
    case 'fountain_in':
      P(1, H - 6, 14, 6, d); P(2, H - 5, 12, 3, '#9FD3E0'); P(7, H - 12, 2, 7, c); P(4, H - 13, 8, 2, c);
      P(5, H - 15, 1, 2, '#DCF2F6'); P(10, H - 15, 1, 2, '#DCF2F6');
      return;
    case 'canopy':
      P(1, 0, 2, H, d); P(W - 3, 0, 2, H, d); P(1, 0, W - 2, 3, a); P(3, 3, 3, 10, al); P(W - 6, 3, 3, 10, al);
      P(2, H - 18, W - 4, 6, d); P(3, H - 17, W - 6, 4, c); P(2, H - 12, W - 4, 12, PAL.linenHi); P(2, H - 8, W - 4, 8, a);
      return;
    case 'cradle':
      P(2, H - 10, 12, 7, c); P(3, H - 9, 10, 3, PAL.linenHi); for (let x = 3; x < 13; x += 3) P(x, H - 13, 1, 4, d);
      P(1, H - 3, 14, 2, d);
      return;
    case 'upright_piano':
      P(1, 2, W - 2, H - 4, c); P(1, 2, W - 2, 2, l); P(2, H - 10, W - 4, 3, '#F2F4F6');
      for (let x = 3; x < W - 3; x += 3) P(x, H - 10, 1, 2, '#1E2430'); P(2, H - 2, 2, 2, d); P(W - 4, H - 2, 2, 2, d); P(W / 2 - 3, 5, 6, 3, a);
      return;
    case 'globe_stand':
      disc(ctx, 8, 6, 5, a); P(5, 4, 3, 2, c); P(9, 7, 3, 2, c); P(7, 11, 2, H - 13, d); P(4, H - 2, 8, 2, d);
      return;
    case 'telescope_stand':
      for (let i = 0; i < 10; i++) P(3 + i, 9 - i * 0.6, 3, 3, i < 8 ? c : a);
      P(7, 9, 1, H - 9, d); P(4, H - 1, 1, 1, d); P(10, H - 1, 1, 1, d); P(5, H - 4, 1, 3, d); P(9, H - 4, 1, 3, d);
      return;
    case 'dollhouse':
      P(2, 6, 12, H - 6, c); for (let i = 0; i < 6; i++) P(2 + i, 6 - i, 12 - i * 2, 1, a);
      P(4, 9, 3, 3, '#B7D4BD'); P(9, 9, 3, 3, '#B7D4BD'); P(6, H - 5, 4, 5, d);
      return;
  }
  P(2, 4, 12, 12, c);
}

// How far each shape rises above its floor tiles.
const FORM_RISE = { arcade: 10, throne: 8, hanging_chair: 8, pillar: 10, statue: 8, fishtank: 4, gramophone: 4, vending: 10, easel: 8, grandfather: 12,
  fountain_in: 2, canopy: 8, upright_piano: 6, globe_stand: 4, telescope_stand: 6, dollhouse: 6, bookstack: 0, bench: 0, cradle: 0,
  shelf: 10, tall_cabinet: 10, lamp: 8, tall_plant: 10, fridge: 10, washer: 2, vanity: 6, lava_lamp: 2, lighthouse: 4, coat_rack: 6,
  ladder: 8, board: 4, mirror: 6, guitar: 4, harp: 6, computer: 2, tent: 4, bunk: 10, speaker: 0, machine: 0, teddy: 2, lantern: 2 };

// Height of each piece's art above its floor tiles.
const RISE = { tall_clock: 8, canopy_bed: 0, jukebox: 2, wardrobe: 10, bookshelf: 10, double_bed: 0, single_bed: 0, icebox: 4, floor_lamp: 6, fireplace: 6, piano: 4 };

export function furnitureSprite(type) {
  const f = FURNITURE_BY_TYPE[type];
  const w = (f?.w || 1) * 16;
  const h = f?.flat ? (f.h || 1) * 16 : (f?.h || 1) * 16 + (RISE[type] ?? FORM_RISE[f?.form] ?? 0);
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

function drawWallForm(ctx, def) {
  const c = def.color, a = def.accent, P = (x, y, w, h, col) => px(ctx, x, y, w, h, col);
  switch (def.form) {
    case 'window': P(1, 0, 18, 17, PAL.woodShade); P(2, 1, 16, 15, '#B7D4BD'); P(9, 1, 2, 15, PAL.woodShade); P(1, 0, 4, 17, a); P(15, 0, 4, 17, a); P(0, 0, 20, 2, c); return;
    case 'round_window': disc(ctx, 10, 9, 8, c); disc(ctx, 10, 9, 6.5, a); P(9, 2, 2, 14, c); P(3, 8, 14, 2, c); return;
    case 'frame': P(2, 0, 16, 18, c); P(3, 1, 14, 16, a); P(6, 4, 3, 3, shade(a, 0.5)); P(11, 9, 4, 5, shade(a, 0.3)); return;
    case 'frames': for (const [x, y, w, h] of [[0, 1, 8, 7], [10, 0, 9, 9], [3, 10, 7, 7], [12, 11, 7, 6]]) { P(x, y, w, h, c); P(x + 1, y + 1, w - 2, h - 2, a); } return;
    case 'cuckoo': P(4, 4, 12, 11, c); for (let i = 0; i < 6; i++) P(4 + i, 4 - i * 0.6, 12 - i * 2, 1, shade(c, -0.2)); disc(ctx, 10, 9, 3, a); P(9, 15, 1, 3, '#D9A53A'); P(11, 15, 1, 2, '#D9A53A'); return;
    case 'clock': disc(ctx, 10, 9, 8, c); disc(ctx, 10, 9, 6.5, a); P(10, 4, 1, 5, c); P(10, 9, 4, 1, c); return;
    case 'wreath': for (let i = 0; i < 14; i++) { const t = (i / 14) * Math.PI * 2; disc(ctx, 10 + Math.cos(t) * 6, 9 + Math.sin(t) * 6, 2.4, c); } P(8, 14, 4, 3, a); P(6, 4, 2, 2, a); P(13, 7, 2, 2, a); return;
    case 'dreamcatcher': for (let i = 0; i < 16; i++) { const t = (i / 16) * Math.PI * 2; P(Math.round(10 + Math.cos(t) * 6), Math.round(7 + Math.sin(t) * 6), 1, 1, c); } P(9, 6, 2, 2, a); P(5, 13, 1, 5, a); P(10, 13, 1, 5, a); P(15, 13, 1, 5, a); return;
    case 'hanging': P(10, 0, 1, 5, PAL.woodShade); P(5, 5, 10, 5, c); for (let x = 4; x < 16; x += 3) P(x, 9, 2, 3 + (x % 5), a); disc(ctx, 10, 4, 3, a); return;
    case 'hanging_lantern': P(10, 0, 1, 4, c); P(6, 4, 8, 2, c); P(5, 6, 10, 9, a); P(6, 15, 8, 2, c); return;
    case 'neon': P(0, 0, 20, 18, c); for (const [x, y] of [[6, 5], [14, 5]]) disc(ctx, x, y, 3.5, a); for (let y = 0; y < 8; y++) P(3 + y, 7 + y, 14 - y * 2, 1, a); disc(ctx, 6, 5, 2, c); disc(ctx, 14, 5, 2, c); for (let y = 0; y < 5; y++) P(6 + y, 8 + y, 8 - y * 2, 1, c); return;
    case 'neon_moon': P(0, 0, 20, 18, c); disc(ctx, 10, 9, 6.5, a); disc(ctx, 13, 7, 5.5, c); return;
    case 'board': P(0, 1, 20, 16, c); P(1, 2, 18, 14, a); P(3, 4, 5, 4, '#F2F4F6'); P(10, 6, 6, 5, '#E8C25A'); P(5, 10, 4, 4, '#B7D4BD'); return;
    case 'plant_shelf': P(0, 12, 20, 2, c); for (const x of [2, 8, 14]) { P(x, 8, 4, 4, '#C9783A'); disc(ctx, x + 2, 6, 2.5, a); } return;
    case 'hoop': disc(ctx, 10, 9, 8, c); disc(ctx, 10, 9, 7, '#F2EDE4'); disc(ctx, 8, 8, 2, a); disc(ctx, 12, 10, 2, a); P(10, 10, 1, 4, '#4F8A4A'); return;
    case 'tapestry': P(2, 0, 16, 2, PAL.woodShade); P(3, 2, 14, 14, c); for (let y = 4; y < 14; y += 4) P(4, y, 12, 2, a); for (let x = 4; x < 17; x += 2) P(x, 16, 1, 2, c); return;
    case 'wall_guitar': disc(ctx, 10, 13, 4, c); disc(ctx, 10, 9, 3, c); P(9, 0, 2, 8, a); disc(ctx, 10, 12, 1.2, a); return;
    // ---- shapes for the big catalogue (catalog-data.js) ----
    case 'banner': P(3, 0, 14, 2, PAL.woodShade); P(4, 2, 12, 12, c); for (let x = 4; x < 16; x += 4) P(x, 14, 2, 3, c); P(7, 5, 6, 5, a); return;
    case 'sconce': P(8, 8, 4, 8, c); P(6, 6, 8, 3, a); disc(ctx, 10, 4, 2.5, '#F2E48A'); P(9, 16, 2, 2, c); return;
    case 'wall_shelf': P(1, 12, 18, 2, c); P(2, 14, 2, 2, c); P(16, 14, 2, 2, c); P(3, 7, 3, 5, a); P(8, 9, 4, 3, shade(a, 0.3)); disc(ctx, 15, 10, 2, a); return;
    case 'mounted_fish': P(2, 3, 16, 12, PAL.woodShade); P(3, 4, 14, 10, c); P(5, 7, 8, 4, a); P(13, 6, 3, 6, a); P(6, 8, 1, 1, '#1E2430'); return;
    case 'mosaic': for (let y = 2; y < 16; y += 3) for (let x = 2; x < 18; x += 3) P(x, y, 2, 2, (x * 3 + y) % 4 ? c : a); return;
    case 'quilt': for (let y = 1; y < 17; y += 4) for (let x = 2; x < 18; x += 4) P(x, y, 4, 4, ((x + y) / 4) % 2 ? c : a); P(2, 0, 16, 1, PAL.woodShade); return;
    case 'string_lights': for (let x = 0; x < 20; x++) P(x, 3 + Math.round(Math.sin(x / 3) * 2), 1, 1, PAL.woodShade); for (let x = 2; x < 20; x += 4) disc(ctx, x, 6 + Math.round(Math.sin(x / 3) * 2), 1.5, x % 8 ? c : a); return;
  }
  P(2, 2, 16, 14, c);
}

export function wallItemSprite(type) {
  return sprite('wall_' + type, 20, 18, ctx => {
    const frame = (c = PAL.woodShade) => { px(ctx, 1, 1, 18, 15, c); px(ctx, 2, 2, 16, 13, PAL.linenHi); };
    if (WALL_BY_TYPE[type]?.form) return drawWallForm(ctx, WALL_BY_TYPE[type]);
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
