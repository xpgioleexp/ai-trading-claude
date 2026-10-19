// The wider world: named regions around the meadow (and around each jar, see
// jar-regions.js), each with its own ground, scattered scenery and a few
// landmarks. Everything is placed from a fixed seed, so the world looks the
// same for everyone. Pure data and helpers; no drawing.
import { rngFor, shuffle } from './rng.js';

// Scenery that dots a region. tree: drawn as a tree (squirrels climb it).
// flat: you can walk over it.
export const SCENERY = {
  rock: { name: 'Boulder' }, pebbles: { name: 'Pebbles', flat: true }, bush: { name: 'Bush' }, berrybush: { name: 'Berry bush' },
  reeds: { name: 'Reeds' }, cattail: { name: 'Cattails' }, pillar: { name: 'Old pillar' }, rubble: { name: 'Rubble', flat: true },
  glowshroom: { name: 'Glowing mushroom' }, stump: { name: 'Stump' }, flowers: { name: 'Wildflowers', flat: true },
  tallgrass: { name: 'Tall grass', flat: true }, crystal: { name: 'Crystal' }, bones: { name: 'Old bones', flat: true },
  shell: { name: 'Shell', flat: true }, icerock: { name: 'Ice rock' }, lantern: { name: 'Old lantern' }, log: { name: 'Fallen log' },
  hay: { name: 'Hay bale' }, beehive: { name: 'Beehive' }, gravestone: { name: 'Mossy stone' }, sunflower: { name: 'Sunflowers' },
  driftwood: { name: 'Driftwood', flat: true }, cactus_small: { name: 'Little cactus' }, coral: { name: 'Coral' }, starstone: { name: 'Star stone' },
};

// Landmarks: one-off places with a name, a size and a picture (art).
// walkable ones (rings, bridges) can be stood on.
export const LANDMARK_ART = ['cottage', 'big_tree', 'statue', 'stone_circle', 'watchtower', 'cairn', 'windmill', 'gazebo', 'lighthouse',
  'boathouse', 'barn', 'apiary', 'temple', 'obelisk', 'arch', 'fairy_ring', 'signpost', 'pyramid', 'pagoda', 'shrine', 'igloo',
  'shipwreck', 'observatory', 'totem', 'bridge', 'well', 'campfire', 'tent', 'market', 'sundial', 'fountain', 'treehouse'];

// The meadow's regions, in tile columns and rows. The meadow you started on is
// the middle (-17..50 by -8..19); these surround it.
export const MEADOW_REGIONS = [
  { id: 'heart', name: 'The heart of the meadow', c0: -17, c1: 50, r0: -8, r1: 19, scatter: 0 },
  { id: 'woods', name: 'Whispering woods', c0: -50, c1: -18, r0: -8, r1: 19, scatter: 0.11,
    trees: ['oak', 'pine', 'birch', 'willow'], kinds: ['bush', 'stump', 'log', 'tallgrass', 'berrybush'],
    landmarks: [['woodcutter_hut', 'Woodcutter\'s hut', 'cottage', -40, 2, 3, 2], ['hollow_oak', 'The hollow oak', 'big_tree', -27, 10, 2, 2],
      ['woods_camp', 'Old campfire', 'campfire', -33, 15, 1, 1, true]] },
  { id: 'bog', name: 'Bramble bog', ground: 'moss', c0: -50, c1: -18, r0: -26, r1: -9, scatter: 0.08,
    trees: ['willow'], kinds: ['reeds', 'cattail', 'bush', 'log', 'gravestone'],
    landmarks: [['sunken_statue', 'The sunken statue', 'statue', -30, -20, 2, 2], ['bog_lantern', 'Will-o\'-wisp lantern', 'shrine', -44, -12, 1, 1]],
    ponds: [['pond7', 'Bog pool', 6, 4, -42, -24]] },
  { id: 'peaks', name: 'Misty peaks', ground: 'stone', c0: -17, c1: 20, r0: -26, r1: -9, scatter: 0.1,
    trees: ['pine'], kinds: ['rock', 'rock', 'pebbles', 'icerock', 'crystal'],
    landmarks: [['stone_circle', 'The stone circle', 'stone_circle', -6, -22, 3, 3], ['watchtower', 'Old watchtower', 'watchtower', 12, -24, 2, 2],
      ['peak_cairn', 'Summit cairn', 'cairn', 2, -26, 1, 1]] },
  { id: 'orchard', name: 'Orchard hills', ground: 'blossom', c0: 21, c1: 83, r0: -26, r1: -9, scatter: 0.09,
    trees: ['cherry', 'oak', 'cherry', 'birch'], kinds: ['flowers', 'beehive', 'hay', 'bush'],
    landmarks: [['windmill', 'The old windmill', 'windmill', 40, -22, 2, 2], ['gazebo', 'Hilltop gazebo', 'gazebo', 62, -16, 3, 2],
      ['orchard_well', 'Orchard well', 'well', 74, -24, 1, 1]] },
  { id: 'lakeside', name: 'Lakeside', ground: 'sand', c0: 51, c1: 83, r0: -8, r1: 19, scatter: 0.06,
    trees: ['willow', 'birch'], kinds: ['reeds', 'driftwood', 'shell', 'pebbles', 'rock'],
    landmarks: [['lighthouse', 'The lake lighthouse', 'lighthouse', 78, -6, 2, 2], ['boathouse', 'Boathouse', 'boathouse', 58, 15, 3, 2],
      ['lake_bridge', 'Rope bridge', 'bridge', 65, 4, 3, 1, true]],
    ponds: [['pond8', 'The great lake', 12, 7, 62, -3]] },
  { id: 'fields', name: 'Wildflower fields', c0: 21, c1: 83, r0: 20, r1: 37, scatter: 0.12,
    trees: ['cherry'], kinds: ['flowers', 'flowers', 'sunflower', 'tallgrass', 'beehive', 'hay'],
    landmarks: [['old_barn', 'The old barn', 'barn', 45, 26, 3, 2], ['apiary', 'Bee garden', 'apiary', 66, 31, 2, 1],
      ['scarecrow_hill', 'Picnic spot', 'tent', 30, 34, 2, 1]] },
  { id: 'ruins', name: 'The old ruins', ground: 'stone', c0: -17, c1: 20, r0: 20, r1: 37, scatter: 0.1,
    trees: ['pine'], kinds: ['pillar', 'pillar', 'rubble', 'rock', 'gravestone'],
    landmarks: [['ruined_temple', 'The ruined temple', 'temple', 0, 27, 4, 3], ['obelisk', 'The obelisk', 'obelisk', 14, 33, 1, 1],
      ['broken_arch', 'Broken archway', 'arch', -12, 24, 3, 1]] },
  { id: 'hollow', name: 'Moonlit hollow', ground: 'moss', c0: -50, c1: -18, r0: 20, r1: 37, scatter: 0.1,
    trees: ['willow', 'pine'], kinds: ['glowshroom', 'glowshroom', 'stump', 'lantern', 'crystal'],
    landmarks: [['ancient_tree', 'The ancient tree', 'big_tree', -34, 26, 2, 2], ['fairy_ring', 'Fairy ring', 'fairy_ring', -44, 32, 3, 3, true],
      ['moon_shrine', 'Moon shrine', 'shrine', -22, 34, 1, 1]],
    ponds: [['pond9', 'Moon pool', 4, 3, -28, 31]] },
];

// Which region a tile is in.
export function regionAt(regions, c, r) {
  for (let i = regions.length - 1; i >= 0; i--) {
    const g = regions[i];
    if (c >= g.c0 && c <= g.c1 && r >= g.r0 && r <= g.r1) return g;
  }
  return null;
}

// Fills regions with landmarks, ponds, signposts and scattered scenery.
// taken(c, r): true where something already is. Returns the new objects.
// treeKind: how trees are made ('tree' with a tree type in the meadow,
// or a jar's own kind like 'palm').
export function fillRegions(seedName, regions, taken, opts = {}) {
  const out = [];
  const used = new Set();
  const mark = (c, r, w, h, pad = 1) => { for (let x = c - pad; x < c + w + pad; x++) for (let y = r - pad; y < r + h + pad; y++) used.add(x + ',' + y); };
  const free = (c, r, w, h, pad = 1) => {
    for (let x = c - pad; x < c + w + pad; x++) for (let y = r - pad; y < r + h + pad; y++) if (used.has(x + ',' + y) || taken(x, y)) return false;
    return true;
  };
  // A spot somewhere in the region where w × h fits, for things without a set place.
  const place = (g, w, h, rand) => {
    for (let tries = 0; tries < 200; tries++) {
      const c = g.c0 + 1 + Math.floor(rand() * Math.max(1, g.c1 - g.c0 - w - 1));
      const r = g.r0 + 1 + Math.floor(rand() * Math.max(1, g.r1 - g.r0 - h - 1));
      if (free(c, r, w, h, 2)) return { c, r };
    }
    return null;
  };
  for (const g of regions) {
    const rand = rngFor('world', seedName, g.id, 'places');
    for (const [id, name, w, h, cc, rr] of g.ponds || []) {
      const at = cc != null ? { c: cc, r: rr } : place(g, w, h, rand);
      if (!at) continue;
      out.push({ id, name, c: at.c, r: at.r, w, h, pond: true, region: g.id, ...(opts.water ? { kind: opts.water } : {}) });
      mark(at.c, at.r, w, h);
    }
    for (const [id, name, art, cc, rr, w, h, walkable] of g.landmarks || []) {
      const at = cc != null ? { c: cc, r: rr } : place(g, w, h, rand);
      if (!at) continue;
      out.push({ id, name, kind: 'landmark', art, c: at.c, r: at.r, w, h, region: g.id, ...(walkable ? { walkable: true } : {}) });
      mark(at.c, at.r, w, h);
    }
  }
  for (const g of regions) {
    if (!g.scatter) continue;
    const rand = rngFor('world', seedName, g.id);
    // A signpost near the edge closest to the middle.
    const sc = Math.max(g.c0 + 1, Math.min(g.c1 - 1, Math.round((g.c0 + g.c1) / 2)));
    const sr = g.r0 > 0 ? g.r0 + 1 : g.r1 < 0 ? g.r1 - 1 : Math.round((g.r0 + g.r1) / 2);
    const scc = g.c0 > 0 ? g.c0 + 1 : g.c1 < 0 ? g.c1 - 1 : sc;
    if (free(scc, sr, 1, 1, 0)) {
      out.push({ id: `${g.id}_sign`, name: `Signpost: ${g.name}`, kind: 'landmark', art: 'signpost', c: scc, r: sr, w: 1, h: 1, region: g.id, sign: g.name });
      mark(scc, sr, 1, 1);
    }
    const tiles = [];
    for (let c = g.c0; c <= g.c1; c++) for (let r = g.r0; r <= g.r1; r++) tiles.push({ c, r });
    const n = Math.round(tiles.length * g.scatter);
    let i = 0;
    for (const t of shuffle(rand, tiles)) {
      if (i >= n) break;
      if (!free(t.c, t.r, 1, 1)) continue;
      const tree = g.trees && rand() < 0.45;
      if (tree) {
        const type = g.trees[Math.floor(rand() * g.trees.length)];
        out.push(opts.makeTree ? { id: `${g.id}_${i}`, ...opts.makeTree(type), c: t.c, r: t.r, w: 1, h: 1, region: g.id }
          : { id: `${g.id}_${i}`, kind: 'tree', tree: type, name: type === 'cherry' ? 'Cherry tree' : type[0].toUpperCase() + type.slice(1), c: t.c, r: t.r, w: 1, h: 1, region: g.id });
      } else {
        const art = g.kinds[Math.floor(rand() * g.kinds.length)];
        const def = SCENERY[art];
        out.push({ id: `${g.id}_${i}`, kind: 'scenery', art, name: def.name, c: t.c, r: t.r, w: 1, h: 1, region: g.id, ...(def.flat ? { walkable: true, flat: true } : {}) });
      }
      // Leave a gap around blocking things so paths stay open.
      mark(t.c, t.r, 1, 1, out[out.length - 1].walkable ? 0 : 1);
      i++;
    }
  }
  return out;
}

// Removes scattered pieces until every open tile can be reached from start.
// walkable(c, r, blocked): open ground. objects: the list to trim (only
// kind 'scenery' and trees made by fillRegions are ever removed).
export function keepReachable(objects, start, bounds, isOpenBase) {
  for (let pass = 0; pass < 20; pass++) {
    const blocked = new Set();
    for (const o of objects) if (!o.walkable) for (let c = o.c; c < o.c + o.w; c++) for (let r = o.r; r < o.r + o.h; r++) blocked.add(c + ',' + r);
    const open = (c, r) => c >= bounds.c0 && c <= bounds.c1 && r >= bounds.r0 && r <= bounds.r1 && isOpenBase(c, r) && !blocked.has(c + ',' + r);
    const seen = new Set([start.c + ',' + start.r]);
    const queue = [start];
    while (queue.length) {
      const { c, r } = queue.shift();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const k = (c + dc) + ',' + (r + dr);
        if (!seen.has(k) && open(c + dc, r + dr)) { seen.add(k); queue.push({ c: c + dc, r: r + dr }); }
      }
    }
    // Any open tile we couldn't reach: drop the scenery next to it.
    const drop = new Set();
    for (let c = bounds.c0; c <= bounds.c1; c++) for (let r = bounds.r0; r <= bounds.r1; r++) {
      if (!open(c, r) || seen.has(c + ',' + r)) continue;
      for (const o of objects) {
        if (!o.region || o.pond || o.kind === 'landmark') continue;
        if (Math.abs(o.c - c) <= 1 && Math.abs(o.r - r) <= 1) drop.add(o);
      }
    }
    if (!drop.size) return objects;
    for (let i = objects.length - 1; i >= 0; i--) if (drop.has(objects[i])) objects.splice(i, 1);
  }
  return objects;
}
