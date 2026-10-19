// The player's pixel avatar: a 16x24 chibi person built from layers
// (body, outfit, hair) so every option lines up on every frame.
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from './data.js';
import { sprite, px, shade, PAL } from './sprites.js';

export const DIRS = { down: 0, up: 1, left: 2, right: 3 };
export const AVATAR_W = 16;
export const AVATAR_H = 24;

// pose: 'walk' (frames 0-3), 'sit', 'cast', 'swing' (frames 0-1), 'crouch'
export function avatarSprite(look, dir, frame, pose = 'walk') {
  const key = `avatar_${look.skin}_${look.hairStyle}_${look.hairColor}_${look.outfit}_${look.outfitStyle}_${look.hat || 0}_${dir}_${pose}_${frame}`;
  return sprite(key, AVATAR_W, AVATAR_H, ctx => drawAvatar(ctx, look, dir, frame, pose));
}

function drawAvatar(ctx, look, dir, frame, pose) {
  const skin = SKIN_TONES[look.skin];
  const skinShade = shade(skin, -0.18);
  const hair = HAIR_COLORS[look.hairColor];
  const hairShade = shade(hair, -0.3);
  const outfit = OUTFIT_COLORS[look.outfit];
  const outfitShade = shade(outfit, -0.28);
  const pants = look.outfitStyle === 1 ? outfit : shade(outfit, -0.45);
  const side = dir === DIRS.left || dir === DIRS.right;
  const flip = dir === DIRS.left;
  const rect = (x, y, w, h, c) => px(ctx, flip ? 16 - x - w : x, y, w, h, c);

  const bob = pose === 'walk' && (frame === 1 || frame === 3) ? 1 : 0;
  const sit = pose === 'sit' || pose === 'crouch';
  const top = bob + (sit ? 3 : 0);

  // Legs and shoes
  if (sit) {
    rect(4, 19, 8, 2, pants);
    rect(4, 21, 3, 2, PAL.woodShade);
    rect(9, 21, 3, 2, PAL.woodShade);
  } else if (side) {
    const step = pose === 'walk' ? [0, 2, 0, -2][frame] : 0;
    rect(6 + step, 19, 2, 3, pants);
    rect(8 - step, 19, 2, 3, shade(pants, -0.15));
    rect(6 + step, 22, 3, 2, PAL.woodShade);
    rect(8 - step, 22, 3, 2, PAL.inkDeep);
  } else {
    const lift = pose === 'walk' ? [0, 1, 0, -1][frame] : 0;
    rect(5, 19, 2, 3 - Math.max(0, lift), pants);
    rect(9, 19, 2, 3 + Math.min(0, lift), pants);
    rect(5, 22 - Math.max(0, lift), 2, 2, PAL.woodShade);
    rect(9, 22 + Math.min(0, lift), 2, 2, PAL.woodShade);
  }

  // Body
  const bodyTop = 12 + top;
  if (look.outfitStyle === 2) {
    // dress
    rect(4, bodyTop, 8, 5, outfit);
    rect(3, bodyTop + 5, 10, 3 - (sit ? 1 : 0), outfit);
    rect(3, bodyTop + 7 - (sit ? 1 : 0), 10, 1, outfitShade);
  } else if (look.outfitStyle === 1) {
    // overalls over a linen shirt
    rect(4, bodyTop, 8, 7, PAL.linen);
    rect(5, bodyTop + 2, 6, 5, outfit);
    rect(5, bodyTop, 1, 2, outfit);
    rect(10, bodyTop, 1, 2, outfit);
    rect(6, bodyTop + 3, 4, 1, outfitShade);
  } else if (look.outfitStyle === 3) {
    // cozy sweater with stripes
    rect(4, bodyTop, 8, 7, outfit);
    rect(4, bodyTop + 2, 8, 1, PAL.linenHi);
    rect(4, bodyTop + 5, 8, 1, PAL.linenHi);
    rect(6, bodyTop, 4, 1, outfitShade);
  } else {
    rect(4, bodyTop, 8, 7, outfit);
    rect(4, bodyTop + 6, 8, 1, outfitShade);
    rect(7, bodyTop, 2, 1, skin);
  }

  // Arms
  const swing = pose === 'walk' ? [0, 1, 0, -1][frame] : 0;
  if (pose === 'cast' || pose === 'swing') {
    const up = pose === 'swing' && frame === 0;
    if (side) {
      rect(10, bodyTop + (up ? -2 : 1), 3, 2, skin);
    } else {
      rect(12, bodyTop + (up ? -3 : 0), 2, 4, skin);
      rect(2, bodyTop + 1, 2, 4, skin);
    }
  } else if (side) {
    rect(7 + swing, bodyTop + 1, 2, 5, skinShade);
  } else {
    rect(2, bodyTop + 1 + swing, 2, 5, skin);
    rect(12, bodyTop + 1 - swing, 2, 5, skin);
    rect(2, bodyTop, 2, 2, look.outfitStyle === 1 ? PAL.linen : outfit);
    rect(12, bodyTop, 2, 2, look.outfitStyle === 1 ? PAL.linen : outfit);
  }

  // Head
  const headTop = 2 + top;
  rect(4, headTop + 1, 8, 9, skin);
  rect(5, headTop, 6, 1, skin);
  rect(4, headTop + 9, 8, 1, skinShade);

  // Face
  if (dir === DIRS.down) {
    rect(5, headTop + 5, 1, 2, PAL.inkDeep);
    rect(10, headTop + 5, 1, 2, PAL.inkDeep);
    rect(4, headTop + 7, 2, 1, PAL.roseHi);
    rect(10, headTop + 7, 2, 1, PAL.roseHi);
    rect(7, headTop + 8, 2, 1, shade(skin, -0.3));
  } else if (side) {
    rect(10, headTop + 5, 1, 2, PAL.inkDeep);
    rect(10, headTop + 7, 2, 1, PAL.roseHi);
    rect(12, headTop + 5, 1, 2, skin);
  }

  // Hair
  drawHair(rect, look.hairStyle, dir, headTop, hair, hairShade, side);
  drawHat(rect, look.hat || 0, headTop);
}

// Crafted hats sit over the hair.
function drawHat(rect, hat, top) {
  if (hat === 1) {
    // flower crown
    rect(3, top, 10, 1, PAL.leaf);
    for (const [x, c] of [[3, PAL.rose], [6, '#E8C25A'], [9, PAL.roseHi], [12, '#9C82C9']]) rect(x, top - 1, 2, 2, c);
  } else if (hat === 2) {
    // straw hat
    rect(1, top + 1, 14, 2, '#E3C27A');
    rect(4, top - 3, 8, 4, '#E9CF8A');
    rect(4, top, 8, 1, PAL.rose);
  } else if (hat === 3) {
    // beanie
    rect(3, top - 3, 10, 5, PAL.rose);
    rect(3, top + 1, 10, 1, PAL.roseShade);
    rect(7, top - 5, 2, 2, PAL.linenHi);
  } else if (hat === 4) {
    // bow
    rect(9, top - 2, 2, 2, PAL.roseShade);
    rect(7, top - 3, 2, 3, PAL.rose);
    rect(11, top - 3, 2, 3, PAL.rose);
  }
}

function drawHair(rect, style, dir, top, hair, dark, side) {
  const back = dir === DIRS.up;
  // Every style has a cap over the top of the head.
  if (style === 5) {
    rect(4, top, 8, 2, hair);
    rect(5, top - 1, 6, 1, hair);
    if (back) rect(4, top + 2, 8, 3, dark);
    return;
  }
  rect(3, top - 1, 10, 3, hair);
  rect(4, top - 2, 8, 1, hair);
  rect(5, top - 1, 4, 1, shade(hair, 0.25));
  if (back) {
    rect(3, top + 2, 10, style === 2 ? 11 : style === 1 ? 7 : 5, hair);
    rect(3, top + 2, 10, 1, dark);
  } else if (side) {
    rect(3, top + 2, 4, style === 2 ? 10 : style === 1 ? 6 : 3, hair);
    rect(8, top + 2, 4, 1, hair);
  } else {
    // fringe and sides
    rect(4, top + 2, 3, 2, hair);
    rect(9, top + 2, 3, 1, hair);
    if (style === 1) {
      rect(3, top + 2, 2, 6, hair);
      rect(11, top + 2, 2, 6, hair);
    }
    if (style === 2) {
      rect(2, top + 2, 2, 11, hair);
      rect(12, top + 2, 2, 11, hair);
      rect(2, top + 12, 2, 1, dark);
      rect(12, top + 12, 2, 1, dark);
    }
  }
  if (style === 3) {
    // curls
    for (const [x, y] of [[2, 0], [12, 0], [3, -2], [11, -2], [7, -3], [2, 3], [12, 3]]) rect(x, top + y, 2, 2, hair);
    rect(5, top - 3, 2, 1, dark);
    rect(9, top - 3, 2, 1, dark);
  }
  if (style === 4) {
    // bun
    rect(6, top - 5, 4, 3, hair);
    rect(6, top - 5, 4, 1, shade(hair, 0.25));
    rect(6, top - 3, 4, 1, dark);
  }
}
