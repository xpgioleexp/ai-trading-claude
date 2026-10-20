import { paintLandmark } from './landmark-details.js';
import { paintNature } from './nature-art.js';

// Placeholder art for the wider world (regions.js): landmarks and the
// scenery scattered through each region. Real art goes in as
// `landmark_<art>` and `scenery_<art>`.
import { sprite } from './sprites.js';

// How tall each landmark stands above its tiles.
const RISE = {
  lighthouse: 34,
  watchtower: 30,
  windmill: 30,
  obelisk: 22,
  big_tree: 22,
  temple: 12,
  pagoda: 26,
  observatory: 18,
  statue: 12,
  cottage: 14,
  barn: 14,
  boathouse: 10,
  gazebo: 14,
  pyramid: 16,
  treehouse: 26,
  totem: 14,
  signpost: 6,
  shrine: 8,
  shipwreck: 8,
  igloo: 4,
  market: 10,
  tent: 8,
  cairn: 8,
  well: 6,
  sundial: 2,
  fountain: 6,
  arch: 14,
  apiary: 4,
};

export function landmarkSprite(art, w = 1, h = 1) {
  const W = w * 16,
    H = h * 16 + (RISE[art] || 0);
  return sprite(`landmark_${art}_${w}x${h}`, W, H, (ctx) => drawLandmark(ctx, art, W, H));
}

function drawLandmark(ctx, art, W, H) {
  return paintLandmark(ctx, art, W, H);
}

// Scattered scenery, 16 wide.
const SCENERY_H = {
  pillar: 26,
  crystal: 22,
  beehive: 20,
  lantern: 22,
  cattail: 20,
  reeds: 18,
  sunflower: 24,
  cactus_small: 18,
  coral: 18,
  starstone: 20,
  glowshroom: 18,
  gravestone: 18,
  icerock: 18,
};
export function scenerySprite(art, season = 'spring') {
  const H = SCENERY_H[art] || 16;
  const seasonal = ['bush', 'berrybush', 'tallgrass', 'flowers', 'reeds'].includes(art);
  return sprite(`scenery_${art}${seasonal ? '_' + season : ''}`, 16, H, (ctx) =>
    drawScenery(ctx, art, H, season),
  );
}

function drawScenery(ctx, art, H, season) {
  return paintNature(ctx, art, 16, H, season);
}
