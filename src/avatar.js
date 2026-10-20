// Layered chibi art. Native frame size, options, poses, directions and cache keys are stable.
import { SKIN_TONES, HAIR_COLORS, OUTFIT_COLORS } from './data.js';
import { sprite, px, shade, PAL } from './sprites.js';

export const DIRS = { down: 0, up: 1, left: 2, right: 3 };
export const AVATAR_W = 16;
export const AVATAR_H = 24;
export function avatarSprite(look, dir, frame, pose = 'walk') {
  const key = `avatar_${look.skin}_${look.hairStyle}_${look.hairColor}_${look.outfit}_${look.outfitStyle}_${look.hat || 0}_${dir}_${pose}_${frame}`;
  return sprite(key, AVATAR_W, AVATAR_H, (ctx) => drawAvatar(ctx, look, dir, frame, pose));
}
function drawAvatar(ctx, look, dir, frame, pose) {
  const skin = SKIN_TONES[look.skin],
    skinD = shade(skin, -0.18),
    skinL = shade(skin, 0.16),
    hair = HAIR_COLORS[look.hairColor],
    hairD = shade(hair, -0.3),
    outfit = OUTFIT_COLORS[look.outfit],
    clothD = shade(outfit, -0.28),
    clothL = shade(outfit, 0.25),
    pants = look.outfitStyle === 1 ? outfit : shade(outfit, -0.45),
    side = dir === DIRS.left || dir === DIRS.right,
    flip = dir === DIRS.left,
    back = dir === DIRS.up,
    rect = (x, y, w, h, col) => px(ctx, flip ? 16 - x - w : x, y, w, h, col),
    ellipse = (x, y, rx, ry, col) => {
      for (let dy = -ry; dy <= ry; dy++) {
        const half = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))));
        if (half) rect(x - half, y + dy, half * 2 + 1, 1, col);
      }
    },
    walking = pose === 'walk',
    step = walking ? [0, 1, 0, -1][frame] : 0,
    bob = walking && frame % 2 ? 1 : 0,
    sit = pose === 'sit' || pose === 'crouch',
    top = bob + (sit ? 3 : 0),
    by = 12 + top;
  // Boots have rounded toes, a sole, and a moving knee rather than sliding rectangles.
  if (sit) {
    rect(4, 20, 8, 2, pants);
    rect(3, 22, 4, 1, PAL.woodShade);
    rect(10, 22, 4, 1, PAL.woodShade);
    rect(4, 21, 2, 1, shade(pants, 0.2));
  } else
    for (const [x, s] of side
      ? [
          [6 + step * 2, 1],
          [8 - step * 2, -1],
        ]
      : [
          [5, 1],
          [9, -1],
        ]) {
      const lift = Math.max(0, step * s);
      rect(x, 18, 2, 4 - lift, pants);
      rect(x, 19, 1, 2, shade(pants, 0.18));
      rect(x - 1, 22 - lift, 3, 2, PAL.woodShade);
      rect(x - 1, 23 - lift, 3, 1, PAL.inkDeep);
      rect(x, 22 - lift, 1, 1, PAL.woodHi);
    }
  // Rounded shoulders, collars, cuffs and fabric volume.
  rect(4, by, 8, 1, clothD);
  rect(3, by + 1, 10, sit ? 5 : 6, clothD);
  rect(4, by + 1, 8, sit ? 4 : 5, outfit);
  rect(4, by + 1, 2, 3, clothL);
  if (look.outfitStyle === 2) {
    rect(3, by + 4, 10, sit ? 3 : 4, outfit);
    rect(2, by + 7 - (sit ? 1 : 0), 12, 1, clothD);
    rect(5, by + 4, 1, 3, clothL);
    rect(10, by + 4, 1, 3, clothD);
    rect(6, by + 1, 4, 1, skin);
    rect(6, by + 3, 4, 1, PAL.linenHi);
  } else if (look.outfitStyle === 1) {
    rect(4, by + 1, 8, 3, PAL.linen);
    rect(5, by + 1, 1, 4, outfit);
    rect(10, by + 1, 1, 4, outfit);
    rect(6, by + 3, 4, 4, outfit);
    rect(6, by + 3, 1, 1, PAL.woodHi);
    rect(9, by + 3, 1, 1, PAL.woodHi);
    rect(7, by + 5, 2, 1, clothD);
  } else if (look.outfitStyle === 3) {
    rect(4, by + 2, 8, 1, PAL.linen);
    rect(4, by + 5, 8, 1, PAL.linen);
    rect(6, by, 4, 1, clothD);
    rect(5, by + 6, 1, 1, clothL);
    rect(10, by + 6, 1, 1, clothL);
  } else {
    rect(6, by, 4, 1, skin);
    rect(7, by + 1, 2, 1, skinD);
    rect(4, by + 6, 8, 1, clothD);
    rect(9, by + 3, 2, 1, clothL);
  }
  // Arm swing follows the same original four walking frames and tool poses.
  if (pose === 'cast' || pose === 'swing') {
    const raised = pose === 'swing' && frame === 0;
    rect(side ? 10 : 12, by + (raised ? -3 : 0), 2, 4, skinD);
    rect(side ? 10 : 12, by + (raised ? -3 : 0), 1, 3, skin);
    if (!side) {
      rect(2, by + 1, 2, 4, skin);
      rect(2, by + 1, 2, 2, outfit);
    }
  } else if (side) {
    rect(7 + step, by + 1, 3, 3, outfit);
    rect(8 + step, by + 4, 2, 2, skinD);
    rect(8 + step, by + 4, 1, 1, skinL);
  } else
    for (const [x, s] of [
      [2, 1],
      [12, -1],
    ]) {
      rect(x, by + 1 + step * s, 2, 4, skin);
      rect(x, by + 1 + step * s, 2, 2, look.outfitStyle === 1 ? PAL.linen : outfit);
      rect(x, by + 4 + step * s, 1, 1, skinL);
    }
  const ht = 3 + top;
  // Stepped oval jaw, chin and ears; no smoothing at the source resolution.
  ellipse(8, ht + 4, 5, 5, skinD);
  ellipse(7, ht + 3, 4, 4, skin);
  rect(4, ht + 2, 1, 3, skinL);
  rect(11, ht + 3, 2, 3, skin);
  rect(12, ht + 4, 1, 1, skinD);
  if (!back) {
    const xs = side ? [10] : [5, 10];
    for (const x of xs) {
      rect(x, ht + 4, 1, 2, PAL.inkDeep);
      rect(x, ht + 4, 1, 1, '#29372F');
    }
    rect(side ? 10 : 4, ht + 6, 2, 1, PAL.roseHi);
    if (!side) rect(10, ht + 6, 2, 1, PAL.roseHi);
    rect(side ? 11 : 7, ht + 7, side ? 1 : 2, 1, skinD);
  }
  drawHair(rect, look.hairStyle, dir, ht, hair, hairD, side);
  drawHat(rect, look.hat || 0, ht);
}
function drawHair(rect, style, dir, top, hair, dark, side) {
  const back = dir === DIRS.up,
    light = shade(hair, 0.28),
    cap = () => {
      rect(3, top, 10, 2, hair);
      rect(4, top - 1, 8, 1, hair);
      rect(5, top - 2, 6, 1, hair);
      rect(3, top + 2, 1, 3, hair);
      rect(12, top + 1, 1, 4, dark);
      rect(5, top - 1, 4, 1, light);
      rect(4, top + 1, 2, 1, shade(hair, 0.14));
    };
  if (style === 5) {
    rect(4, top, 8, 2, hair);
    rect(5, top - 1, 6, 1, hair);
    rect(4, top + 2, 2, 1, dark);
    rect(10, top + 1, 2, 2, dark);
    rect(6, top, 3, 1, light);
    if (back) rect(4, top + 2, 8, 3, hair);
    return;
  }
  cap();
  if (back) {
    const h = style === 2 ? 11 : style === 1 ? 7 : 5;
    rect(3, top + 2, 10, h, hair);
    rect(3, top + 2, 1, h - 1, light);
    rect(11, top + 3, 2, h - 1, dark);
    rect(5, top + 4, 1, h - 2, shade(hair, 0.12));
    rect(8, top + h, 3, 1, dark);
  } else {
    rect(4, top + 2, 3, 2, hair);
    rect(7, top + 2, 2, 1, hair);
    rect(9, top + 1, 3, 3, hair);
    rect(10, top + 3, 2, 1, dark);
    rect(5, top + 2, 1, 1, light);
    if (style === 1 || style === 2) {
      const h = style === 2 ? 10 : 6;
      rect(2, top + 2, 2, h, hair);
      rect(12, top + 2, 2, h, dark);
      rect(2, top + 3, 1, h - 2, light);
      rect(3, top + h + 1, 2, 1, dark);
      rect(11, top + h + 1, 2, 1, dark);
      if (style === 2) {
        rect(2, top + 10, 3, 2, hair);
        rect(11, top + 10, 3, 2, hair);
        rect(3, top + 11, 1, 1, light);
      }
    }
    if (side) {
      rect(3, top + 2, 4, style === 2 ? 10 : style === 1 ? 6 : 4, hair);
      rect(3, top + 3, 1, 3, light);
      rect(6, top + 5, 1, 2, dark);
    }
  }
  if (style === 3)
    for (const [x, y] of [
      [2, 0],
      [11, -1],
      [3, -2],
      [7, -3],
      [12, 3],
      [2, 4],
    ]) {
      rect(x, top + y, 3, 2, hair);
      rect(x, top + y, 1, 1, light);
      rect(x + 1, top + y + 1, 2, 1, dark);
    }
  if (style === 4) {
    rect(5, top - 4, 6, 3, dark);
    rect(6, top - 5, 4, 1, hair);
    rect(6, top - 4, 3, 2, hair);
    rect(6, top - 4, 2, 1, light);
    rect(5, top - 2, 6, 1, PAL.rose);
  }
}
function drawHat(rect, hat, top) {
  if (hat === 1) {
    rect(3, top, 10, 1, PAL.leafShade);
    for (const [x, col] of [
      [3, PAL.rose],
      [6, '#D9B783'],
      [9, PAL.roseHi],
      [12, '#A99CC9'],
    ]) {
      rect(x, top - 2, 1, 3, col);
      rect(x - 1, top - 1, 3, 1, col);
      rect(x, top - 1, 1, 1, PAL.linenHi);
    }
  } else if (hat === 2) {
    rect(1, top + 1, 14, 2, '#B88D60');
    rect(2, top, 12, 2, '#D9B783');
    rect(4, top - 3, 8, 3, '#D9B783');
    rect(5, top - 4, 6, 1, '#D9B783');
    rect(5, top - 3, 5, 1, '#F3E9CF');
    rect(4, top - 1, 8, 1, PAL.rose);
    for (const x of [3, 6, 9, 12]) rect(x, top + 1, 1, 1, '#F3E9CF');
  } else if (hat === 3) {
    rect(3, top - 2, 10, 4, PAL.rose);
    rect(4, top - 3, 8, 1, PAL.rose);
    rect(5, top - 4, 6, 1, PAL.rose);
    for (const x of [4, 7, 10]) rect(x, top - 2, 1, 3, PAL.roseHi);
    rect(3, top + 1, 10, 1, PAL.roseShade);
    rect(6, top - 5, 4, 2, PAL.linen);
    rect(7, top - 5, 2, 1, PAL.linenHi);
  } else if (hat === 4) {
    rect(7, top - 3, 2, 3, PAL.rose);
    rect(11, top - 3, 3, 3, PAL.rose);
    rect(9, top - 2, 2, 2, PAL.roseShade);
    rect(7, top - 3, 1, 1, PAL.roseHi);
    rect(12, top - 3, 1, 1, PAL.roseHi);
    rect(9, top, 1, 2, PAL.rose);
    rect(12, top, 1, 2, PAL.rose);
  }
}
