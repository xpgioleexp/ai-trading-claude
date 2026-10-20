import { paintTile } from './tile-art.js';
import { paintHouse } from './art-style.js';
import { paintFurniture, paintWall } from './furniture-art.js';
import { dressFurniture } from './furniture-details.js';
// Placeholder art for your home: the house at each level, furniture, wall
// items, wallpapers and floors. PNGs in assets/manifest.json with the same names replace these.
import { PAL, px, shade, sprite, tentSprite } from './sprites.js';
import { FURNITURE_BY_TYPE, WALLPAPER_BY_ID, FLOOR_BY_ID, WALL_BY_TYPE } from './home.js';
import { HAIR_COLORS, SKIN_TONES } from './data.js';

// ---------- the house outside ----------

export function houseSprite(level, night) {
  if (level <= 0) return tentSprite();
  const size = [
    [0, 0],
    [52, 46],
    [56, 54],
    [60, 64],
  ][level];
  return sprite(`house_${level}_${night ? 1 : 0}`, size[0], size[1], (ctx) => {
    const [w, h] = size;
    paintHouse(ctx, w, h, {
      level,
      night,
      wall: level === 1 ? PAL.wood : '#E9DCC0',
      roofColor: level === 1 ? '#7A6A5A' : level === 2 ? '#A96E75' : '#6F8590',
    });
  });
}

// ---------- wallpaper and floors ----------

export function wallpaperTile(id) {
  return sprite('wallpaper_' + id, 16, 16, (ctx) => {
    const wp = WALLPAPER_BY_ID[id] || WALLPAPER_BY_ID.linen;
    drawPattern(ctx, wp.pattern || wp.id || id, ...wp.colors);
  });
}

export function floorTile(id) {
  return sprite('floor_' + id, 16, 16, (ctx) => {
    const fl = FLOOR_BY_ID[id] || FLOOR_BY_ID.planks;
    drawPattern(ctx, fl.pattern || fl.id || id, ...fl.colors);
  });
}

// Wallpaper and floor patterns for the big catalogue (catalog-data.js). One
// 16 × 16 tile in two colours that repeats across the wall or floor.
function drawPattern(ctx, pattern, a, b) {
  return paintTile(ctx, pattern, a, b);
}

// ---------- furniture ----------

function drawFurniture(ctx, type, w, h) {
  const def = FURNITURE_BY_TYPE[type] || { type };
  if (def.form) return drawForm(ctx, def, w, h);
  paintFurniture(ctx, def, w, h);
  dressFurniture(ctx, def, w, h);
}

// Furniture drawn from a shape and two colours (see furniture-data.js).
// Each shape fills W x H, with the floor at the bottom.
function drawForm(ctx, def, W, H) {
  paintFurniture(ctx, def, W, H);
  dressFurniture(ctx, def, W, H);
}

// How far each shape rises above its floor tiles.
const FORM_RISE = {
  arcade: 10,
  throne: 8,
  hanging_chair: 8,
  pillar: 10,
  statue: 8,
  fishtank: 4,
  gramophone: 4,
  vending: 10,
  easel: 8,
  grandfather: 12,
  fountain_in: 2,
  canopy: 8,
  upright_piano: 6,
  globe_stand: 4,
  telescope_stand: 6,
  dollhouse: 6,
  bookstack: 0,
  bench: 0,
  cradle: 0,
  shelf: 10,
  tall_cabinet: 10,
  lamp: 8,
  tall_plant: 10,
  fridge: 10,
  washer: 2,
  vanity: 6,
  lava_lamp: 2,
  lighthouse: 4,
  coat_rack: 6,
  ladder: 8,
  board: 4,
  mirror: 6,
  guitar: 4,
  harp: 6,
  computer: 2,
  tent: 4,
  bunk: 10,
  speaker: 0,
  machine: 0,
  teddy: 2,
  lantern: 2,
};

// Height of each piece's art above its floor tiles.
const RISE = {
  tall_clock: 8,
  canopy_bed: 0,
  jukebox: 2,
  wardrobe: 10,
  bookshelf: 10,
  double_bed: 0,
  single_bed: 0,
  icebox: 4,
  floor_lamp: 6,
  fireplace: 6,
  piano: 4,
};

export function furnitureSprite(type) {
  const f = FURNITURE_BY_TYPE[type];
  const w = (f?.w || 1) * 16;
  const h = f?.flat ? (f.h || 1) * 16 : (f?.h || 1) * 16 + (RISE[type] ?? FORM_RISE[f?.form] ?? 0);
  return sprite('furniture_' + type, w, h, (ctx) => drawFurniture(ctx, type, w, h));
}

// A sleeping head on a pillow, in the person's own hair and skin colours.
export function sleeperSprite(look) {
  return sprite(`sleeper_${look.skin}_${look.hairColor}`, 10, 7, (ctx) => {
    const hair = HAIR_COLORS[look.hairColor],
      skin = SKIN_TONES[look.skin];
    px(ctx, 1, 1, 8, 5, shade(hair, -0.25));
    px(ctx, 2, 0, 6, 1, hair);
    px(ctx, 1, 2, 8, 3, hair);
    px(ctx, 3, 2, 5, 4, skin);
    px(ctx, 4, 2, 3, 1, shade(skin, 0.16));
    px(ctx, 2, 1, 4, 1, shade(hair, 0.25));
    px(ctx, 3, 4, 2, 1, PAL.inkDeep);
    px(ctx, 6, 4, 2, 1, PAL.inkDeep);
    px(ctx, 3, 5, 1, 1, PAL.roseHi);
    px(ctx, 7, 5, 1, 1, PAL.roseHi);
    px(ctx, 4, 6, 3, 1, shade(skin, -0.18));
  });
}

// ---------- wall items ----------

function drawWallForm(ctx, def) {
  return paintWall(ctx, def);
}

export function wallItemSprite(type) {
  return sprite('wall_' + type, 20, 18, (ctx) => drawWallForm(ctx, WALL_BY_TYPE[type] || { type }));
}
