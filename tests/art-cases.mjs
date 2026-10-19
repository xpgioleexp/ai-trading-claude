// Enumerate the real registries, including late-added catalog and wildlife entries.
// This runs in Chromium so it exercises the same canvas API as the game.
export async function artCases(base = '/') {
  const get = (name) => import(base + 'src/' + name + '.js');
  for (const name of [
    'mine-data',
    'crafting',
    'cooking',
    'farm-data',
    'bugs',
    'visitors',
    'biomes',
    'events',
    'weather',
    'wildlife-data',
    'catalog-data',
    'fossils',
    'museum',
  ])
    await get(name);
  const data = await get('data'),
    s = await get('sprites'),
    more = await get('sprites-more'),
    home = await get('home'),
    ha = await get('home-art'),
    la = await get('landmark-art'),
    ma = await get('museum-art'),
    av = await get('avatar'),
    regions = await get('regions'),
    jars = await get('jar-regions'),
    maps = await get('maps'),
    biomes = await get('biomes'),
    wild = await get('wild'),
    outdoor = await get('outdoor-data'),
    mine = await get('mine-data'),
    fossils = await get('fossils'),
    visitors = await get('visitors'),
    bugs = await get('bugs');
  const rows = [],
    add = (id, canvas) => rows.push({ id, canvas });
  for (const id of Object.keys(data.ITEMS).sort()) add('item:' + id, s.itemIcon(id));
  for (const season of Object.keys(s.SEASON_GROUND))
    for (let v = 0; v < 4; v++) add(`ground:${season}:${v}`, s.grassTile(season, v));
  for (const season of ['spring', 'summer', 'autumn', 'winter'])
    for (const fruit of [false, true]) add(`tree:${season}:${fruit}`, s.treeSprite(season, fruit));
  for (const id of Object.keys(data.CROP_BY_ID))
    for (let stage = 0; stage < 4; stage++) add(`crop:${id}:${stage}`, s.cropSprite(id, stage));
  for (const [fn, args] of [
    ['tentSprite', []],
    ['mailboxSprite', [false]],
    ['mailboxSprite', [true]],
    ['crateSprite', [false]],
    ['crateSprite', [true]],
    ['workbenchSprite', []],
    ['stallSprite', []],
    ['benchSprite', []],
    ['caveSprite', []],
    ['bedSprite', [false]],
    ['bedSprite', [true]],
    ['chestSprite', [false]],
    ['chestSprite', [true]],
    ['ladderHoleSprite', []],
    ['ladderUpSprite', []],
    ['heartSprite', []],
  ])
    add(fn + ':' + args, s[fn](...args));
  for (const band of [0, 1, 2, 3, 4, 5]) {
    add('cavewall:' + band, s.caveWallSprite(band));
    for (const id of Object.keys(mine.ROCKS)) add(`rock:${id}:${band}`, s.rockSprite(id, band));
  }
  for (const id of Object.keys(mine.MONSTERS))
    for (const frame of [0, 1])
      for (const flash of [false, true])
        add(`monster:${id}:${frame}:${flash}`, s.monsterSprite(id, frame, flash));
  for (const f of home.FURNITURE) add('furniture:' + f.type, ha.furnitureSprite(f.type));
  for (const f of home.WALL_ITEMS) add('wall:' + f.type, ha.wallItemSprite(f.type));
  for (const f of home.WALLPAPERS) add('wallpaper:' + f.id, ha.wallpaperTile(f.id));
  for (const f of home.FLOORS) add('floor:' + f.id, ha.floorTile(f.id));
  for (let level = 0; level < 4; level++)
    for (const night of [false, true]) add(`house:${level}:${night}`, ha.houseSprite(level, night));
  const decor = [
    'pine',
    'oak',
    'birch',
    'willow',
    'cherry',
    'sapling',
    'bush',
    'lavender',
    'sunflower',
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
    'tree_pear',
    'tree_plum',
    'tree_lemon',
    'tree_mango',
    'tree_banana',
    'coop',
    'goat_pen',
    'bee_box',
    'mushroom_log',
    ...Object.keys(outdoor.OUTDOOR_BY_TYPE),
  ];
  for (const type of new Set(decor))
    for (const season of ['spring', 'summer', 'autumn', 'winter'])
      add(`decor:${type}:${season}`, more.decorSprite(type, season));
  for (const species of ['frog', 'turtle', 'snail', 'marimo'])
    for (const frame of [0, 1])
      for (const sleeping of [false, true])
        for (const water of [false, true])
          add(
            `resident:${species}:${frame}:${sleeping}:${water}`,
            more.animalSprite(species, frame, sleeping, water),
          );
  for (const frame of [0, 1])
    for (const sleeping of [false, true])
      add(`bunny:${frame}:${sleeping}`, s.bunnySprite(frame, sleeping));
  for (const who of [...biomes.CRITTERS, ...wild.WILD])
    for (const frame of [0, 1])
      add(
        `critter:${who.id}:${frame}`,
        more.critterSprite(who.shape, who.color, who.accent, frame),
      );
  for (const who of visitors.VISITORS)
    for (const frame of [0, 1])
      add(`visitor:${who.id}:${frame}`, more.visitorSprite(who.species, who.color, frame));
  for (const who of bugs.BUGS)
    for (const frame of [0, 1])
      add(`bug:${who.id}:${frame}`, more.bugSprite(who.kind, who.color, frame));
  for (const art of regions.LANDMARK_ART)
    for (const [w, h] of [
      [1, 1],
      [2, 2],
      [3, 2],
    ])
      add(`landmark:${art}:${w}:${h}`, la.landmarkSprite(art, w, h));
  for (const art of Object.keys(regions.SCENERY))
    for (const season of ['spring', 'summer', 'autumn', 'winter'])
      add(`scenery:${art}:${season}`, la.scenerySprite(art, season));
  for (const fn of [
    'noteSprite',
    'bubbleSprite',
    'sparkleSprite',
    'zzzSprite',
    'doorSprite',
    'snowmanSprite',
    'archSprite',
    'requestMarkSprite',
    'merchantRugSprite',
    'eventStandSprite',
  ])
    add(fn, more[fn]());
  for (const frame of [0, 1]) {
    add('merchant:' + frame, more.merchantSprite(frame));
    add('hive:' + frame, more.hiveSprite(!!frame));
    add('palm:' + frame, more.palmSprite(!!frame));
    add('board:' + frame, more.boardSprite(!!frame));
  }
  for (const n of [0, 1, 2]) add('well:' + n, more.wellSprite(n));
  add('picnic', more.picnicSprite());
  add('easel', more.easelSprite());
  add('pine', more.pineSprite());
  for (const col of ['#C68F89', '#79AAA4', '#B88D60'])
    add('jarstall:' + col, more.jarStallSprite(col));
  for (const kind of [
    'cactus',
    'bigtree',
    'fern',
    'bigshroom',
    'bamboo',
    'lantern',
    'cloud',
    'sandcastle',
    'bottle',
    'igloo',
    'swing',
    'bouquet',
    'steamer',
    'telescope',
    'star_bench',
    'vine',
    'dig',
    'ring',
    'dune',
    'rink',
  ])
    for (let state = 0; state < 4; state++)
      add(`jar:${kind}:${state}`, more.jarThingSprite(kind, state));
  add('museum', ma.museumSprite());
  add('digsite', ma.digSiteSprite());
  for (const f of fossils.SPECIMENS)
    if (f.plan !== 'single')
      for (const mode of ['complete', 'missing', 'highlight'])
        add(
          `skeleton:${f.id}:${mode}`,
          ma.skeletonCanvas(
            f.plan,
            f.partKeys,
            (key) => mode === 'complete' || key === f.partKeys[0],
            mode === 'highlight' ? f.partKeys.at(-1) : null,
          ),
        );
  // Every skin/hair/outfit option, plus each direction, walk frame, tool pose and hat.
  for (let hairStyle = 0; hairStyle < 6; hairStyle++)
    for (let dir = 0; dir < 4; dir++)
      for (let frame = 0; frame < 4; frame++) {
        const look = {
          skin: hairStyle % 5,
          hairColor: hairStyle % 7,
          hairStyle,
          outfit: hairStyle % 6,
          outfitStyle: hairStyle % 4,
        };
        add(`avatar:walk:${hairStyle}:${dir}:${frame}`, av.avatarSprite(look, dir, frame));
      }
  for (let hat = 0; hat < 5; hat++)
    for (const pose of ['sit', 'crouch', 'cast', 'swing'])
      for (let dir = 0; dir < 4; dir++)
        for (let frame = 0; frame < 2; frame++)
          add(
            `avatar:${pose}:${hat}:${dir}:${frame}`,
            av.avatarSprite(
              { skin: hat, hairColor: hat, hairStyle: hat, outfit: hat, outfitStyle: hat % 4, hat },
              dir,
              frame,
              pose,
            ),
          );
  for (let skin = 0; skin < 5; skin++)
    for (let hairColor = 0; hairColor < 7; hairColor++)
      add(`sleeper:${skin}:${hairColor}`, ha.sleeperSprite({ skin, hairColor }));
  return {
    rows,
    modules: { sprites: s, more, home: ha, landmarks: la, museum: ma, avatar: av },
    data: { home, data, regions, biomes },
  };
}
