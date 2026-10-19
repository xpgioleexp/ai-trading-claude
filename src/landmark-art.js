import {paintLandmark} from './landmark-details.js';
import {paintNature} from './nature-art.js';
import {roof,box} from './art-style.js';
// Placeholder art for the wider world (regions.js): landmarks and the
// scenery scattered through each region. Real art goes in as
// `landmark_<art>` and `scenery_<art>`.
import { PAL, px, disc, shade, sprite } from './sprites.js';

// How tall each landmark stands above its tiles.
const RISE = { lighthouse: 34, watchtower: 30, windmill: 30, obelisk: 22, big_tree: 22, temple: 12, pagoda: 26, observatory: 18,
  statue: 12, cottage: 14, barn: 14, boathouse: 10, gazebo: 14, pyramid: 16, treehouse: 26, totem: 14, signpost: 6, shrine: 8,
  shipwreck: 8, igloo: 4, market: 10, tent: 8, cairn: 8, well: 6, sundial: 2, fountain: 6, arch: 14, apiary: 4 };

export function landmarkSprite(art, w = 1, h = 1) {
  const W = w * 16, H = h * 16 + (RISE[art] || 0);
  return sprite(`landmark_${art}_${w}x${h}`, W, H, ctx => drawLandmark(ctx, art, W, H));
}

function drawLandmark(ctx, art, W, H) {
  if(paintLandmark(ctx,art,W,H))return;
  const P = (x, y, w, h, c) => px(ctx, Math.round(x), Math.round(y), Math.round(w), Math.round(h), c);
  const stone = '#B9B4A8', stoneD = '#8E897E', wood = PAL.wood, woodD = PAL.woodShade, roof = '#B5653A';
  const roofLine = (x0, x1, top, base, col) => { for (let y = top; y < base; y++) { const t = (y - top) / (base - top); P(x0 + (x1 - x0) / 2 - t * (x1 - x0) / 2, y, t * (x1 - x0), 1, y % 3 ? col : shade(col, -0.2)); } };
  switch (art) {
    case 'cottage':
      P(3, H - 20, W - 6, 20, '#E9D7A8'); roofLine(0, W, H - 34, H - 18, roof);
      P(W / 2 - 4, H - 12, 8, 12, woodD); P(8, H - 16, 8, 6, '#B7D4BD'); P(W - 16, H - 16, 8, 6, '#B7D4BD'); P(W - 12, H - 32, 4, 8, stoneD);
      return;
    case 'big_tree':
      P(W / 2 - 5, H - 22, 10, 22, woodD); P(W / 2 - 3, H - 14, 6, 8, '#3A2A20');
      disc(ctx, W / 2, H - 30, 14, PAL.leafShade); disc(ctx, W / 2 - 6, H - 34, 9, PAL.leaf); disc(ctx, W / 2 + 7, H - 32, 9, PAL.leaf); disc(ctx, W / 2, H - 40, 8, PAL.leafHi || PAL.leaf);
      return;
    case 'statue':
      P(4, H - 8, W - 8, 8, stoneD); P(6, H - 10, W - 12, 3, stone); disc(ctx, W / 2, H - 22, 5, stone); disc(ctx, W / 2, H - 30, 4, stone);
      P(W / 2 - 7, H - 20, 14, 3, stone); P(W / 2 - 1, H - 31, 1, 1, stoneD); for (let i = 0; i < 4; i++) P(5 + i * 6, H - 12 - (i % 2), 3, 2, '#6F925B');
      return;
    case 'stone_circle':
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2, x = W / 2 + Math.cos(a) * (W / 2 - 5), y = H / 2 + 2 + Math.sin(a) * (H / 2 - 7); P(x - 2, y - 7, 5, 9, stoneD); P(x - 1, y - 6, 3, 7, stone); }
      disc(ctx, W / 2, H / 2 + 2, 3, '#A9E0E8');
      return;
    case 'watchtower':
      P(6, 12, W - 12, H - 12, stoneD); P(8, 14, W - 16, H - 14, stone); for (let x = 6; x < W - 6; x += 4) P(x, 8, 3, 4, stoneD);
      P(W / 2 - 3, H - 10, 6, 10, woodD); P(W / 2 - 2, 20, 4, 6, '#2A2A30'); P(W / 2, 0, 1, 8, woodD); P(W / 2 + 1, 0, 6, 4, '#C9283A');
      return;
    case 'cairn':
      for (const [x, y, r] of [[8, H - 4, 5], [7, H - 10, 4], [9, H - 15, 3], [8, H - 19, 2]]) disc(ctx, x, y, r, (y % 2) ? stone : stoneD);
      return;
    case 'windmill':
      P(W / 2 - 7, 18, 14, H - 18, '#E9D7A8'); roofLine(W / 2 - 9, W / 2 + 9, 10, 20, roof); P(W / 2 - 3, H - 9, 6, 9, woodD);
      for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) for (let i = 0; i < 12; i++) P(W / 2 + dx * i, 14 + dy * i, 3, 3, i > 3 ? '#F2EDE4' : woodD);
      return;
    case 'gazebo':
      roofLine(0, W, 0, 12, '#F2EDE4'); P(2, 12, W - 4, 2, '#D9D6CF'); for (const x of [3, W / 2 - 1, W - 5]) P(x, 14, 2, H - 16, '#F2EDE4');
      P(0, H - 3, W, 3, stone); disc(ctx, W / 2, 4, 2, '#E8C25A');
      return;
    case 'lighthouse':
      P(W / 2 - 6, 14, 12, H - 14, '#F2F4F6'); for (let y = 20; y < H - 6; y += 10) P(W / 2 - 6, y, 12, 4, '#C9283A');
      P(W / 2 - 5, 6, 10, 8, '#F2E48A'); P(W / 2 - 7, 4, 14, 2, '#3A3A40'); roofLine(W / 2 - 6, W / 2 + 6, 0, 5, '#3A3A40'); P(W / 2 - 2, H - 7, 4, 7, woodD);
      return;
    case 'boathouse':
      P(2, H - 18, W - 4, 18, '#7A9AB0'); roofLine(0, W, H - 28, H - 16, '#5A6A80'); P(W / 2 - 8, H - 12, 16, 12, '#2A3A4A');
      for (let x = 4; x < W - 4; x += 4) P(x, H - 18, 1, 6, shade('#7A9AB0', -0.2));
      return;
    case 'barn':
      P(2, H - 22, W - 4, 22, '#B5453A'); roofLine(0, W, H - 34, H - 20, '#7A2A2A'); P(W / 2 - 7, H - 14, 14, 14, '#F2EDE4'); P(W / 2 - 6, H - 13, 12, 13, '#8A3A2A');
      for (let i = 0; i < 12; i++) { P(W / 2 - 6 + i, H - 13 + i, 1, 1, '#F2EDE4'); P(W / 2 + 5 - i, H - 13 + i, 1, 1, '#F2EDE4'); } P(W / 2 - 3, H - 30, 6, 5, '#F2EDE4');
      return;
    case 'apiary':
      for (const x of [2, 12, 22]) { P(x, H - 12, 8, 10, '#E8C25A'); P(x, H - 13, 8, 2, '#F2EDE4'); P(x + 3, H - 6, 2, 1, '#3A3020'); P(x + 1, H - 2, 1, 2, woodD); P(x + 6, H - 2, 1, 2, woodD); }
      return;
    case 'temple':
      P(0, H - 4, W, 4, stoneD); P(2, H - 7, W - 4, 3, stone); for (let x = 5; x < W - 4; x += 10) { P(x, 14, 5, H - 21, stone); P(x + 4, 14, 1, H - 21, stoneD); }
      P(0, 8, W, 6, stone); roofLine(0, W, 0, 9, stoneD); P(W - 14, 0, 10, 8, '#7FAF5B'); P(W - 20, H - 12, 6, 5, stoneD);
      return;
    case 'obelisk':
      P(3, H - 4, 10, 4, stoneD); P(5, 8, 6, H - 12, stone); roofLine(5, 11, 2, 9, stone); for (let y = 14; y < H - 8; y += 5) P(7, y, 2, 2, '#5A5A66');
      return;
    case 'arch':
      P(1, 10, 7, H - 10, stone); P(W - 8, 18, 7, H - 18, stone); P(1, 4, 20, 7, stone); P(1, 4, 20, 1, stoneD); P(W - 10, 10, 3, 6, stoneD);
      for (let x = 2; x < 20; x += 6) P(x, 6, 4, 3, stoneD); P(W - 7, H - 4, 6, 4, stoneD);
      return;
    case 'fairy_ring':
      for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2, x = W / 2 + Math.cos(a) * (W / 2 - 4), y = H / 2 + Math.sin(a) * (H / 2 - 4); disc(ctx, x, y, 2.4, '#D9533C'); P(x - 1, y - 1, 1, 1, '#F2F4F6'); P(x, y + 1, 1, 2, '#F2EDE4'); }
      return;
    case 'signpost':
      P(7, 4, 2, H - 4, woodD); P(1, 5, 13, 5, wood); P(14, 5, 2, 3, wood); P(3, 12, 11, 4, wood); P(1, 13, 2, 2, wood); P(3, 7, 9, 1, woodD);
      return;
    case 'pyramid':
      for (let y = 0; y < H; y++) { const t = y / H; P(W / 2 - t * W / 2, y, t * W, 1, y % 4 ? '#E3C28A' : '#CFA86E'); } P(W / 2 - 3, H - 8, 6, 8, '#5A4130');
      return;
    case 'pagoda':
      for (let i = 0; i < 3; i++) { const y = 6 + i * 13, wd = 10 + i * 5; P(W / 2 - wd / 2 + 1, y + 3, wd - 2, 10, '#C9283A'); P(W / 2 - wd / 2 - 3, y, wd + 6, 3, '#3A3A40'); }
      P(W / 2, 0, 1, 6, '#E8C25A'); P(W / 2 - 3, H - 8, 6, 8, woodD);
      return;
    case 'shrine':
      P(2, H - 4, 12, 4, stoneD); P(4, H - 14, 8, 10, '#C9283A'); P(1, H - 17, 14, 3, '#3A3A40'); P(6, H - 10, 4, 4, '#F2E48A');
      return;
    case 'igloo':
      disc(ctx, W / 2, H - 2, W / 2 - 1, '#F2FAFF'); for (let y = H - 14; y < H; y += 4) P(2, y, W - 4, 1, '#C5D3D8'); P(W / 2 - 3, H - 6, 6, 6, '#7D8796');
      return;
    case 'shipwreck':
      for (let x = 0; x < W; x++) P(x, H - 10 + Math.round(Math.abs(x - W / 2) / 6), 1, 10, x % 5 ? '#7A5A3A' : '#5A4130');
      P(W / 2 - 1, 0, 2, H - 8, woodD); P(W / 2 + 1, 4, 10, 8, '#E9E3D6'); P(W / 2 + 3, 6, 2, 2, '#C9C2B5');
      return;
    case 'observatory':
      P(3, H - 18, W - 6, 18, stone); disc(ctx, W / 2, H - 18, W / 2 - 4, '#9AA4B0'); P(W / 2 - 1, H - 30, 3, 10, '#2A2A50');
      for (let i = 0; i < 8; i++) P(W / 2 + 2 + i, H - 26 - i, 3, 3, '#5A5A66'); P(W / 2 - 3, H - 8, 6, 8, woodD);
      return;
    case 'totem':
      for (let i = 0; i < 4; i++) { const y = H - 8 - i * 7; P(4, y, 8, 7, ['#C9283A', '#3F6FD9', '#E8C25A', '#7FAF5B'][i]); P(6, y + 2, 1, 1, '#2A2A30'); P(9, y + 2, 1, 1, '#2A2A30'); }
      P(1, H - 30, 14, 3, wood);
      return;
    case 'bridge':
      P(0, H - 10, W, 6, wood); for (let x = 0; x < W; x += 4) P(x, H - 10, 1, 6, woodD); P(0, H - 14, W, 1, woodD); for (let x = 0; x < W; x += 8) P(x, H - 14, 1, 5, woodD);
      return;
    case 'well':
      P(2, H - 8, 12, 8, stone); P(3, H - 9, 10, 2, stoneD); P(2, H - 20, 2, 12, woodD); P(12, H - 20, 2, 12, woodD); roofLine(0, 16, H - 26, H - 19, roof);
      return;
    case 'campfire':
      for (const [x, y] of [[3, 12], [8, 13], [13, 12], [5, 14], [11, 14]]) P(x - 1, y, 3, 2, stoneD);
      P(4, 11, 8, 2, woodD); P(6, 6, 4, 5, '#F08A3A'); P(7, 4, 2, 3, '#F2E48A');
      return;
    case 'tent':
      roofLine(0, W, 0, H - 2, '#5E8A6A'); P(W / 2 - 3, H - 10, 6, 10, '#2A3A2A'); P(0, H - 2, W, 2, woodD);
      return;
    case 'market':
      P(2, 8, W - 4, H - 8, wood); for (let x = 0; x < W; x += 6) P(x, 2, 6, 6, (x / 6) % 2 ? '#F2EDE4' : '#C9283A');
      return;
    case 'sundial':
      disc(ctx, W / 2, H - 6, 6, stone); P(W / 2, H - 14, 1, 8, stoneD); P(W / 2 - 4, H - 6, 8, 1, stoneD);
      return;
    case 'fountain':
      P(1, H - 8, 14, 8, stone); P(2, H - 7, 12, 4, '#9FD3E0'); P(7, H - 16, 2, 9, stone); P(5, H - 18, 6, 2, stone); P(6, H - 21, 1, 3, '#DCF2F6'); P(9, H - 21, 1, 3, '#DCF2F6');
      return;
    case 'treehouse':
      P(W / 2 - 3, 14, 6, H - 14, woodD); disc(ctx, W / 2, 12, 12, PAL.leaf); P(W / 2 - 8, 14, 16, 10, wood); roofLine(W / 2 - 10, W / 2 + 10, 6, 14, roof); P(W / 2 - 2, 18, 4, 6, '#2A2A30');
      for (let y = 26; y < H - 2; y += 3) P(W / 2 + 4, y, 4, 1, wood);
      return;
    default:
      P(2, H - 14, W - 4, 14, stone);
  }
}

// Scattered scenery, 16 wide.
const SCENERY_H = { pillar: 26, crystal: 22, beehive: 20, lantern: 22, cattail: 20, reeds: 18, sunflower: 24, cactus_small: 18, coral: 18, starstone: 20, glowshroom: 18, gravestone: 18, icerock: 18 };
export function scenerySprite(art, season = 'spring') {
  const H = SCENERY_H[art] || 16;
  const seasonal = ['bush', 'berrybush', 'tallgrass', 'flowers', 'reeds'].includes(art);
  return sprite(`scenery_${art}${seasonal ? '_' + season : ''}`, 16, H, ctx => drawScenery(ctx, art, H, season));
}

function drawScenery(ctx, art, H, season) {
  if(paintNature(ctx,art,16,H,season))return;
  const P = (x, y, w, h, c) => px(ctx, x, y, w, h, c);
  const leaf = season === 'autumn' ? '#C9783A' : season === 'winter' ? '#9AB0A0' : PAL.leaf, leafD = shade(leaf, -0.25);
  const B = H - 16;
  switch (art) {
    case 'rock': disc(ctx, 8, B + 11, 6, '#8E897E'); disc(ctx, 7, B + 10, 5, '#A9A397'); P(5, B + 7, 3, 1, '#C4BFB3'); return;
    case 'pebbles': for (const [x, y, r] of [[4, 10, 1.6], [9, 12, 2], [12, 8, 1.4], [6, 5, 1.2]]) disc(ctx, x, y, r, '#A9A397'); return;
    case 'bush': disc(ctx, 8, B + 10, 6, leafD); disc(ctx, 7, B + 9, 5, leaf); return;
    case 'berrybush': disc(ctx, 8, B + 10, 6, leafD); disc(ctx, 7, B + 9, 5, leaf); for (const [x, y] of [[5, 8], [9, 7], [10, 11], [6, 12]]) P(x, B + y, 2, 2, '#9C2A4A'); return;
    case 'reeds': for (let x = 3; x < 14; x += 3) P(x, B + 4 + (x % 2), 1, 12, leafD); for (let x = 4; x < 14; x += 3) P(x, B + 2, 1, 14, leaf); return;
    case 'cattail': for (let x = 4; x < 13; x += 4) { P(x, B + 6, 1, 14, '#5E7A4A'); P(x - 1, B + 4, 3, 5, '#7A4A30'); } return;
    case 'pillar': P(4, B + 1, 8, 3, '#C4BFB3'); P(5, B + 4, 6, H - 7, '#B9B4A8'); P(7, B + 4, 1, H - 7, '#8E897E'); P(3, H - 3, 10, 3, '#A9A397'); P(9, B, 3, 3, '#8E897E'); return;
    case 'rubble': for (const [x, y, w, h] of [[2, 10, 4, 3], [7, 12, 5, 2], [11, 8, 3, 3], [5, 6, 3, 2]]) { P(x, y, w, h, '#A9A397'); P(x, y, w, 1, '#C4BFB3'); } return;
    case 'glowshroom': P(7, B + 8, 2, 8, '#E9E3D6'); disc(ctx, 8, B + 7, 5, '#5FD9C9'); P(5, B + 5, 2, 1, '#DCF2F6'); P(10, B + 6, 1, 1, '#DCF2F6'); return;
    case 'stump': P(3, B + 7, 10, 8, '#7A5A3A'); P(3, B + 6, 10, 2, '#C9A272'); P(6, B + 6, 4, 1, '#9C7046'); return;
    case 'flowers': for (const [x, y, c] of [[3, 5, '#E07A9B'], [9, 3, '#F0DA6A'], [12, 10, '#9C82C9'], [5, 11, '#F2F4F6']]) { P(x, y + 2, 1, 3, '#4F8A4A'); disc(ctx, x + 0.5, y, 1.6, season === 'winter' ? '#F2F4F6' : c); } return;
    case 'tallgrass': for (let x = 1; x < 15; x += 2) P(x, 6 + (x % 3), 1, 10 - (x % 3), x % 4 ? leaf : leafD); return;
    case 'crystal': P(6, B + 4, 4, H - 6, '#A9E0E8'); P(3, B + 9, 3, H - 11, '#C9A0E8'); P(10, B + 7, 3, H - 9, '#B9DDE6'); P(7, B + 5, 1, 6, '#F2FAFF'); return;
    case 'bones': P(3, 8, 9, 2, '#EFE6D2'); disc(ctx, 3, 8, 1.5, '#EFE6D2'); disc(ctx, 12, 9, 1.5, '#EFE6D2'); P(6, 11, 6, 1, '#E6DCC8'); return;
    case 'shell': disc(ctx, 8, 9, 4, '#F2D6C9'); for (let x = 5; x < 12; x += 2) P(x, 6, 1, 6, '#E0B0A0'); return;
    case 'icerock': disc(ctx, 8, B + 10, 6, '#9FC3D0'); disc(ctx, 7, B + 9, 5, '#DCEFF6'); P(5, B + 6, 3, 1, '#FFFFFF'); return;
    case 'lantern': P(7, B + 6, 2, H - 6, '#3A3A40'); P(5, B + 2, 6, 6, '#F2E48A'); P(4, B + 1, 8, 2, '#3A3A40'); return;
    case 'log': P(1, 9, 14, 6, '#7A5A3A'); disc(ctx, 14, 12, 3, '#C9A272'); P(4, 9, 6, 1, '#5E8A4A'); return;
    case 'hay': P(2, 7, 12, 8, '#E3C27A'); P(2, 9, 12, 1, '#C9A25A'); P(2, 12, 12, 1, '#C9A25A'); return;
    case 'beehive': P(7, B + 12, 2, 8, '#7A5A3A'); for (let i = 0; i < 4; i++) P(4 + (i % 2), B + 3 + i * 3, 8 - (i % 2) * 2, 3, i % 2 ? '#D9A53A' : '#E8C25A'); P(7, B + 9, 2, 1, '#3A3020'); return;
    case 'gravestone': P(4, B + 4, 8, 12, '#9A958A'); disc(ctx, 8, B + 5, 4, '#9A958A'); P(4, B + 9, 3, 3, '#6F925B'); P(6, B + 7, 4, 1, '#7D7A74'); return;
    case 'sunflower': for (const x of [4, 11]) { P(x, B + 8, 1, 16, '#4F8A4A'); disc(ctx, x + 0.5, B + 6, 3, '#F0C040'); disc(ctx, x + 0.5, B + 6, 1.4, '#7A4A30'); } return;
    case 'driftwood': P(2, 10, 12, 3, '#C9B79A'); P(10, 8, 3, 2, '#C9B79A'); P(3, 11, 9, 1, '#A99A80'); return;
    case 'cactus_small': P(6, B + 4, 4, H - 4, '#5E8A4A'); P(3, B + 8, 3, 2, '#5E8A4A'); P(3, B + 5, 2, 4, '#5E8A4A'); P(10, B + 9, 3, 2, '#5E8A4A'); P(11, B + 6, 2, 4, '#5E8A4A'); return;
    case 'coral': for (const [x, c] of [[4, '#E8707A'], [8, '#F0A55A'], [11, '#C9A0E8']]) { P(x, B + 6, 2, H - 6, c); P(x - 2, B + 4 + (x % 3), 2, 4, c); } return;
    case 'starstone': P(4, B + 6, 8, H - 6, '#3F4A6A'); P(6, B + 4, 4, 3, '#3F4A6A'); P(7, B + 9, 2, 2, '#F2E48A'); P(5, B + 13, 1, 1, '#F2E48A'); return;
    default: disc(ctx, 8, 10, 5, '#8E897E');
  }
}
