// Exercise the painters directly so a subtle finishing filter cannot hide an old fallback.
export async function painterCoverage(base, all) {
  const get = (name) => import(base + 'src/' + name + '.js');
  const [
    { paintFurniture, paintWall },
    { paintItem },
    { paintOutdoor },
    { paintNature },
    { paintSmallDecor, paintJarObject },
    { paintLandmark },
    { paintTile },
    { paintAnimal },
    outdoor,
    wild,
    visitors,
  ] = await Promise.all([
    get('furniture-art'),
    get('item-art'),
    get('outdoor-art'),
    get('nature-art'),
    get('world-props'),
    get('landmark-details'),
    get('tile-art'),
    get('animal-art'),
    get('outdoor-data'),
    get('wild'),
    get('visitors'),
  ]);
  const { home, data, regions, biomes } = all.data,
    rows = new Map(all.rows.map((r) => [r.id, r.canvas])),
    failures = [],
    counts = {};
  const check = (group, id, W, H, draw) => {
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const c = canvas.getContext('2d');
    if (!draw(c)) failures.push(group + ': no redesigned painter for ' + id);
    if (!c.getImageData(0, 0, W, H).data.some((v, i) => i % 4 === 3 && v))
      failures.push(group + ': empty painter for ' + id);
    counts[group] = (counts[group] || 0) + 1;
  };
  for (const def of Object.values(home.FURNITURE_BY_TYPE)) {
    const s = rows.get('furniture:' + def.type);
    check('furniture', def.type, s.width, s.height, (c) =>
      paintFurniture(c, def, s.width, s.height),
    );
  }
  for (const def of Object.values(home.WALL_BY_TYPE))
    check('wall', def.type, 20, 18, (c) => paintWall(c, def));
  for (const def of Object.values(data.ITEMS))
    check('item', def.id, 16, 16, (c) => paintItem(c, def));
  for (const def of Object.values(outdoor.OUTDOOR_BY_TYPE)) {
    const s = rows.get('decor:' + def.type + ':spring');
    check('outdoor', def.type, s.width, s.height, (c) => paintOutdoor(c, def, s.width, s.height));
  }
  for (const art of Object.keys(regions.SCENERY)) {
    const s = rows.get('scenery:' + art + ':spring');
    check('scenery', art, s.width, s.height, (c) =>
      paintNature(c, art, s.width, s.height, 'spring'),
    );
  }
  const legacy = [
    'pine',
    'oak',
    'birch',
    'willow',
    'cherry',
    'sapling',
    'bush',
    'lavender',
    'pumpkin',
    'reeds',
    'pathstone',
    'pathwood',
    'fence',
    'bridge',
    'birdhouse',
    'hammock',
    'picnic',
    'tent',
    'cabin',
    'treehouse',
    'campfire',
    'windchime',
    'mailbox',
    'signpost',
    'waterbowl',
    'foodbowl',
    'petbed',
    'tunnel',
    'butterflies',
    'crystal',
    'fern',
    'mushroom',
    'daisy',
    'flower',
    'lantern',
    'stone',
    'moss',
    'clover',
    'blueflower',
    'bellflower',
    'tallmushroom',
    'riverstone',
    'log',
    'stump',
    'fireflyjar',
    'fairylights',
    'puddle',
    'lilypad',
    'seat',
    'coop',
    'goat_pen',
    'bee_box',
    'mushroom_log',
  ];
  for (const id of legacy) {
    const s = rows.get('decor:' + id + ':spring');
    check('decoration', id, s.width, s.height, (c) =>
      paintSmallDecor(c, id, s.width, s.height, 'spring'),
    );
  }
  for (const art of regions.LANDMARK_ART) {
    const s = rows.get('landmark:' + art + ':2:2');
    check('landmark', art, s.width, s.height, (c) => paintLandmark(c, art, s.width, s.height));
  }
  const jars = all.rows.filter((r) => r.id.startsWith('jar:') && r.id.endsWith(':0'));
  for (const { id, canvas } of jars) {
    const kind = id.split(':')[1];
    check('jar', kind, canvas.width, canvas.height, (c) =>
      paintJarObject(c, kind, canvas.width, canvas.height, 0),
    );
  }
  for (const def of [...Object.values(home.WALLPAPER_BY_ID), ...Object.values(home.FLOOR_BY_ID)])
    check('pattern', def.id, 16, 16, (c) => paintTile(c, def.pattern || def.id, ...def.colors));
  const animals = [
    ...biomes.CRITTERS,
    ...Object.values(biomes.SHOPS),
    ...wild.WILD,
    ...visitors.VISITORS.map((v) => ({ ...v, shape: v.species })),
  ];
  for (const def of animals)
    check('animal', def.id || def.shape, 16, 18, (c) =>
      paintAnimal(c, def.shape, def.color, def.accent, 0),
    );
  return { failures, counts };
}
