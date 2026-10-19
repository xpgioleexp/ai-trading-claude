// The wider world in each jar: eight regions around the jar you know, each
// with its own name, ground, scenery, landmarks and sometimes a pool. Placed
// from a fixed seed, so every jar looks the same for everyone.
import { fillRegions, keepReachable } from './regions.js';

// Each jar: columns -JAR_WEST..JAR_COLS-1, rows -JAR_NORTH..ROWS+JAR_SOUTH-1.
export const JAR_WEST = 40;
export const JAR_COLS = 57;
export const JAR_NORTH = 20;
export const JAR_SOUTH = 20;

// The eight areas around the middle (-17..33 by -8..19).
const AREAS = {
  west: [-40, -18, -8, 19], east: [34, 56, -8, 19], north: [-17, 33, -20, -9], south: [-17, 33, 20, 31],
  northwest: [-40, -18, -20, -9], northeast: [34, 56, -20, -9], southwest: [-40, -18, 20, 31], southeast: [34, 56, 20, 31],
};

// For each jar: what its trees are, what lies around, and its eight areas:
// [area, name, ground or null, scatter, [landmarks [id, name, art, w, h]], [pools [id, name, w, h]]]
const JARS = {
  beach: {
    tree: () => ({ kind: 'palm', name: 'Palm tree' }), kinds: ['shell', 'driftwood', 'coral', 'rock', 'pebbles'], water: 'pool',
    areas: [
      ['west', 'Coconut grove', null, 0.1, [['beach_hut', 'Beach hut', 'cottage', 3, 2], ['coconut_stand', 'Coconut stand', 'market', 2, 1]]],
      ['east', 'Shipwreck cove', null, 0.07, [['shipwreck', 'The old shipwreck', 'shipwreck', 3, 2], ['cove_campfire', 'Driftwood fire', 'campfire', 1, 1]]],
      ['north', 'Dune ridge', 'dune', 0.08, [['dune_lighthouse', 'Beach lighthouse', 'lighthouse', 2, 2], ['dune_sign', 'Old ship\'s figurehead', 'statue', 2, 2]], [['water5', 'Lagoon', 6, 4]]],
      ['northwest', 'Seabird cliffs', 'dune', 0.07, [['bird_cairn', 'Gull rock', 'cairn', 1, 1]]],
      ['northeast', 'Tide caves', 'dune', 0.07, [['tide_arch', 'Sea arch', 'arch', 3, 1]]],
      ['south', 'The open sea', null, 0], ['southwest', 'The open sea', null, 0], ['southeast', 'The open sea', null, 0],
    ],
  },
  snow: {
    tree: () => ({ kind: 'pine', name: 'Snowy pine' }), kinds: ['icerock', 'rock', 'crystal', 'pebbles'], water: 'ice',
    areas: [
      ['west', 'Frozen forest', null, 0.12, [['snow_cabin', 'Snowed-in cabin', 'cottage', 3, 2]]],
      ['east', 'Igloo village', null, 0.06, [['igloo_one', 'Big igloo', 'igloo', 2, 2], ['igloo_two', 'Little igloo', 'igloo', 1, 1], ['ice_market', 'Ice market', 'market', 2, 1]]],
      ['north', 'Glacier', null, 0.08, [['ice_obelisk', 'Ice spire', 'obelisk', 1, 1]], [['water5', 'Glacier lake', 6, 4]]],
      ['south', 'Snowfields', null, 0.07, [['snow_totem', 'Snow totem', 'totem', 1, 1]]],
      ['northwest', 'Aurora peak', null, 0.08, [['aurora_watch', 'Aurora lookout', 'watchtower', 2, 2]]],
      ['northeast', 'Crystal caves', null, 0.1, [['crystal_shrine', 'Crystal shrine', 'shrine', 1, 1]]],
      ['southwest', 'Penguin point', null, 0.06, [['penguin_camp', 'Explorer\'s tent', 'tent', 2, 1]]],
      ['southeast', 'Frozen falls', null, 0.08, [['frozen_well', 'Frozen well', 'well', 1, 1]], [['water6', 'Frozen falls pool', 4, 3]]],
    ],
  },
  flower: {
    tree: () => ({ kind: 'decotree', tree: 'cherry', name: 'Cherry tree' }), kinds: ['flowers', 'tallgrass', 'sunflower', 'bush', 'beehive'], water: 'pond',
    areas: [
      ['west', 'Tulip terraces', null, 0.12, [['flower_mill', 'Tulip windmill', 'windmill', 2, 2]]],
      ['east', 'Rose maze', null, 0.14, [['rose_gazebo', 'Rose gazebo', 'gazebo', 3, 2]]],
      ['north', 'Lavender hills', 'blossom', 0.12, [['lavender_well', 'Wishing well', 'well', 1, 1], ['bee_garden', 'Bee garden', 'apiary', 2, 1]]],
      ['south', 'Sunflower field', null, 0.14, [['sun_barn', 'Flower barn', 'barn', 3, 2]], [['water5', 'Lily lake', 5, 4]]],
      ['northwest', 'Butterfly glen', 'blossom', 0.1, [['butterfly_fountain', 'Butterfly fountain', 'fountain', 1, 1]]],
      ['northeast', 'Orchid house', 'blossom', 0.08, [['orchid_temple', 'Glasshouse', 'temple', 4, 3]]],
      ['southwest', 'Picnic meadow', null, 0.08, [['picnic_tent', 'Picnic tent', 'tent', 2, 1]]],
      ['southeast', 'Petal falls', null, 0.1, [['petal_sundial', 'Flower clock', 'sundial', 1, 1]]],
    ],
  },
  desert: {
    tree: () => ({ kind: 'cactus', name: 'Cactus' }), kinds: ['bones', 'cactus_small', 'rock', 'pebbles'], water: 'oasis',
    areas: [
      ['west', 'Pyramid sands', null, 0.05, [['pyramid', 'The great pyramid', 'pyramid', 4, 3], ['sphinx', 'Sand sphinx', 'statue', 2, 2]]],
      ['east', 'Canyon', 'stone', 0.1, [['canyon_arch', 'Canyon arch', 'arch', 3, 1]]],
      ['north', 'Mirage flats', null, 0.04, [['mirage_obelisk', 'Sun obelisk', 'obelisk', 1, 1]], [['water5', 'Mirage pool', 4, 3]]],
      ['south', 'Bazaar', null, 0.05, [['bazaar', 'Desert bazaar', 'market', 2, 1], ['bazaar_tent', 'Merchant tent', 'tent', 2, 1]]],
      ['northwest', 'Bone valley', null, 0.08, [['bone_cairn', 'Old cairn', 'cairn', 1, 1]]],
      ['northeast', 'Red rocks', 'stone', 0.1, [['rock_totem', 'Rock totem', 'totem', 1, 1]]],
      ['southwest', 'Sunken city', 'stone', 0.08, [['sunken_temple', 'Sunken temple', 'temple', 4, 3]]],
      ['southeast', 'Star dunes', null, 0.04, [['desert_sundial', 'Great sundial', 'sundial', 1, 1]]],
    ],
  },
  rainforest: {
    tree: () => ({ kind: 'fern', name: 'Fern' }), kinds: ['bush', 'berrybush', 'tallgrass', 'log', 'glowshroom'], water: 'falls',
    areas: [
      ['west', 'Canopy village', null, 0.12, [['treehouse', 'Treehouse', 'treehouse', 2, 2], ['canopy_bridge', 'Rope bridge', 'bridge', 3, 1, true]]],
      ['east', 'Lost temple', null, 0.1, [['jungle_temple', 'The jungle temple', 'temple', 4, 3]]],
      ['north', 'Misty falls', null, 0.1, [['falls_shrine', 'Falls shrine', 'shrine', 1, 1]], [['water5', 'Misty pool', 5, 4]]],
      ['south', 'River delta', null, 0.08, [['river_hut', 'Stilt hut', 'boathouse', 3, 2]], [['water6', 'Delta pool', 5, 3]]],
      ['northwest', 'Orchid hollow', null, 0.12, [['orchid_totem', 'Carved totem', 'totem', 1, 1]]],
      ['northeast', 'Monkey ridge', null, 0.12, [['monkey_tree', 'Monkey tree', 'big_tree', 2, 2]]],
      ['southwest', 'Firefly marsh', 'moss', 0.1, [['marsh_lantern', 'Firefly lantern', 'shrine', 1, 1]]],
      ['southeast', 'Old ruins', 'stone', 0.1, [['vine_arch', 'Vine archway', 'arch', 3, 1]]],
    ],
  },
  glade: {
    tree: () => ({ kind: 'bigshroom', name: 'Giant mushroom' }), kinds: ['glowshroom', 'stump', 'lantern', 'crystal', 'log'], water: 'glow',
    areas: [
      ['west', 'Spore woods', null, 0.12, [['spore_cottage', 'Mushroom cottage', 'cottage', 3, 2]]],
      ['east', 'Fairy court', null, 0.1, [['fairy_ring_big', 'Great fairy ring', 'fairy_ring', 3, 3, true], ['fairy_fountain', 'Fairy fountain', 'fountain', 1, 1]]],
      ['north', 'Moonlit hill', null, 0.08, [['glade_observatory', 'Toadstool observatory', 'observatory', 3, 2]]],
      ['south', 'Glow swamp', null, 0.1, [['swamp_hut', 'Swamp hut', 'boathouse', 3, 2]], [['water5', 'Glow swamp', 5, 4]]],
      ['northwest', 'Old hollow', null, 0.1, [['hollow_tree', 'Hollow tree', 'big_tree', 2, 2]]],
      ['northeast', 'Crystal grotto', null, 0.1, [['grotto_shrine', 'Crystal shrine', 'shrine', 1, 1]]],
      ['southwest', 'Lantern path', null, 0.08, [['lantern_arch', 'Lantern arch', 'arch', 3, 1]]],
      ['southeast', 'Whisper stones', null, 0.08, [['whisper_circle', 'Whispering stones', 'stone_circle', 3, 3]]],
    ],
  },
  springs: {
    tree: () => ({ kind: 'bamboo', name: 'Bamboo' }), kinds: ['rock', 'lantern', 'bush', 'pebbles', 'stump'], water: 'spring',
    areas: [
      ['west', 'Bamboo forest', null, 0.14, [['tea_house', 'Tea house', 'cottage', 3, 2]]],
      ['east', 'Pagoda hill', null, 0.08, [['pagoda', 'The pagoda', 'pagoda', 2, 2], ['bell_shrine', 'Bell shrine', 'shrine', 1, 1]]],
      ['north', 'Snowy summit', null, 0.08, [['summit_cairn', 'Summit cairn', 'cairn', 1, 1]], [['water5', 'Summit spring', 4, 3]]],
      ['south', 'Lantern road', null, 0.08, [['lantern_market', 'Night market', 'market', 2, 1]]],
      ['northwest', 'Monkey baths', null, 0.07, [['monkey_statue', 'Monkey statue', 'statue', 2, 2]], [['water6', 'Monkey bath', 4, 3]]],
      ['northeast', 'Crane lake', null, 0.06, [['crane_bridge', 'Red bridge', 'bridge', 3, 1, true]], [['water7', 'Crane lake', 6, 4]]],
      ['southwest', 'Moss garden', 'moss', 0.1, [['zen_well', 'Garden well', 'well', 1, 1]]],
      ['southeast', 'Fox shrine', null, 0.08, [['fox_shrine', 'Fox shrine', 'shrine', 1, 1], ['fox_gate', 'Red gate', 'arch', 3, 1]]],
    ],
  },
  stars: {
    tree: () => ({ kind: 'cloud', name: 'Cloud' }), kinds: ['starstone', 'crystal', 'lantern', 'pebbles'], water: 'moon',
    areas: [
      ['west', 'Comet field', null, 0.08, [['comet_crater', 'Comet crater', 'stone_circle', 3, 3]]],
      ['east', 'Star harbour', null, 0.06, [['star_boathouse', 'Sky boathouse', 'boathouse', 3, 2]], [['water5', 'Star harbour', 6, 4]]],
      ['north', 'The observatory', null, 0.06, [['great_observatory', 'Great observatory', 'observatory', 3, 2]]],
      ['south', 'Dream meadow', null, 0.08, [['dream_tent', 'Dreamer\'s tent', 'tent', 2, 1]]],
      ['northwest', 'Moon garden', null, 0.08, [['moon_fountain', 'Moon fountain', 'fountain', 1, 1]]],
      ['northeast', 'Constellation stones', null, 0.06, [['star_circle', 'Constellation stones', 'stone_circle', 3, 3]]],
      ['southwest', 'Nebula pond', null, 0.06, [['nebula_shrine', 'Nebula shrine', 'shrine', 1, 1]], [['water6', 'Nebula pond', 4, 3]]],
      ['southeast', 'Lighthouse point', null, 0.06, [['star_lighthouse', 'Star lighthouse', 'lighthouse', 2, 2]]],
    ],
  },
};

// Adds the regions to each jar. Call after the jar has been widened.
export function addJarRegions(MAPS) {
  for (const [id, jar] of Object.entries(JARS)) {
    const map = MAPS[id];
    if (!map || map.regions) continue;
    const regions = [{ id: 'heart', name: map.name, c0: -17, c1: 33, r0: -8, r1: 19, scatter: 0 }];
    for (const [area, name, ground, scatter, landmarks = [], ponds = []] of jar.areas) {
      const [c0, c1, r0, r1] = AREAS[area];
      regions.push({
        id: area, name, c0, c1, r0, r1, scatter, kinds: jar.kinds, trees: ['t'], ...(ground ? { ground } : {}),
        landmarks: landmarks.map(([lid, lname, art, w, h, walk]) => [`${id}_${lid}`, lname, art, null, null, w, h, walk]),
        ponds,
      });
    }
    const blocked = new Set();
    for (const o of map.objects) for (let c = o.c - 1; c < o.c + (o.w || 1) + 1; c++) for (let r = o.r - 1; r < o.r + (o.h || 1) + 1; r++) blocked.add(c + ',' + r);
    const door = map.objects.find(o => o.id === 'door');
    const added = fillRegions(id, regions, (c, r) => blocked.has(c + ',' + r) || (Math.abs(c - door.c) <= 2 && Math.abs(r - door.r) <= 2),
      { water: jar.water, makeTree: jar.tree });
    map.objects.push(...added.map(o => ({ w: 1, h: 1, ...o })));
    keepReachable(map.objects, { c: door.c + 1, r: door.r }, { c0: -JAR_WEST, c1: JAR_COLS - 1, r0: -JAR_NORTH, r1: 12 + JAR_SOUTH - 1 }, () => true);
    map.regions = regions;
  }
}
