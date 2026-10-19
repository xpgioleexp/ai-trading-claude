# Art guide for Little Us Terrarium

Give this page to ChatGPT (or any artist) when asking for art. Every piece the game draws has a name. A PNG with that name replaces the placeholder the code draws today.

## How to add a finished PNG

1. Save the file in `assets/`, for example `assets/mailbox_full.png`.
2. Add it to `assets/manifest.json`:

```json
{
  "sprites": {
    "mailbox_full": "mailbox_full.png",
    "tent": "tent.png"
  }
}
```

3. Reload the game. Anything not listed keeps its placeholder.

## Rules for every image

- PNG with a transparent background.
- Pixel art at **exactly** the size listed below: 1 image pixel = 1 game pixel. Don't upscale, and don't blur or smooth the edges.
- Light comes from the upper left.
- Palette:

  | Use | Colours |
  |---|---|
  | Grass | `#A8BE7C` `#829D62` `#C2CE95` |
  | Leaves | `#6F925B` `#3F604A` `#9DBA74` |
  | Wood | `#B88D60` `#775B46` `#D9B783` |
  | Water | `#79AAA4` `#507F83` `#B7D4BD` |
  | Linen | `#F3E9CF` `#D5C5A4` `#FFF7E4` |
  | Outline | `#38493D` `#29372F` |
  | Rose | `#C68F89` `#A96E75` `#E4B4A3` |

- Objects stand on the bottom edge of the image: the bottom row of pixels is where they touch the ground.
- No text inside images.
- The concept painting is a mood reference only. The game needs clean pixel sprites at these sizes.

## Sprite list

### Ground (16 × 16)
| Name | What |
|---|---|
| `ground_spring_0` … `ground_spring_3` | Four grass tiles that tile seamlessly. `_3` can have a tiny flower |
| `ground_summer_0` … `_3`, `ground_autumn_0` … `_3`, `ground_winter_0` … `_3` | The same for each season (winter is snow) |

### Objects in the jar
| Name | Size | What |
|---|---|---|
| `tent` | 48 × 40 | Small rose-striped tent with a lantern |
| `mailbox_empty`, `mailbox_full` | 16 × 26 | Mailbox on a post; the full one has the flag up and a letter |
| `crate_empty`, `crate_full` | 16 × 18 | Wooden shipping crate; full shows produce on top |
| `workbench` | 16 × 20 | Small table with tools |
| `stall` | 32 × 34 | Shop stall with a striped awning and a beetle shopkeeper |
| `tree_<season>_1`, `tree_<season>_0` | 40 × 52 | Fruit tree with fruit (`_1`) and without (`_0`), for spring, summer, autumn and winter |
| `bench` | 32 × 18 | Wooden bench with a cushion |
| `cave` | 16 × 16 | Hole in the ground with a ladder going down |
| `bed_dry`, `bed_wet` | 16 × 16 | Garden bed seen from above: dry and watered soil |
| `crop_<crop>_0` … `_3` | 16 × 20 | Each crop at 4 stages: seeds, sprout, growing, ready. Crops: radish, strawberry, tulip, pea, tomato, blueberry, sunflower, melon, pumpkin, carrot, corn, cranberry, kale, frostberry, snowdrop, turnip |
| `bunny_0_0`, `bunny_1_0`, `bunny_0_1` | 14 × 12 | Bunny standing, mid-hop, and asleep |
| `fx_heart` | 7 × 6 | Small heart |

### Couple places
| Name | Size | What |
|---|---|---|
| `board_plain`, `board_new` | 18 × 26 | Notice board; `_new` has a red pin for an unfinished mission |
| `well_0`, `well_1`, `well_2` | 20 × 28 | Wishing well with 0, 1 or 2 little lights in it |
| `picnic` | 32 × 14 | Picnic blanket with a basket, lying flat |
| `easel` | 16 × 26 | Small easel holding a calendar page |

### Animals
| Name | Size | What |
|---|---|---|
| `animal_<species>_<frame>_<asleep>_<inWater>` | frog 14 × 12, turtle 16 × 12, snail 14 × 11, marimo 12 × 12 | `frame` 0 or 1 (moving), `asleep` 0 or 1, `inWater` 0 or 1 (frog, turtle, marimo). The bunny keeps its `bunny_*` names |
| `fx_note`, `fx_bubble`, `fx_sparkle`, `fx_zzz` | 6–7 px | Music note, bubble, sparkle, sleeping z |

### Decorations
`decor_<type>` at 16 × 16. Trees are 24 × 34 and seasonal: `decor_<type>_<season>`.
- **Trees:** pine, oak, birch, willow, cherry, sapling
- **Plants:** bush, pumpkin, reeds, fern, mushroom, tallmushroom, moss, clover, puddle, lilypad
- **Flowers:** lavender, sunflower, butterflies, daisy, flower, blueflower, bellflower
- **Paths:** pathstone, pathwood
- **Furniture:** fence, bridge, birdhouse, hammock, picnic, mailbox, signpost, log, stump, seat
- **Homes:** tent, cabin, treehouse
- **Lights:** campfire, windchime, lantern, fireflyjar, fairylights
- **Animal care:** waterbowl, foodbowl, petbed, tunnel
- **Treasures:** crystal, stone, riverstone

### Your home
| Name | Size | What |
|---|---|---|
| `house_1_0`, `house_2_0`, `house_3_0` | 52 × 46, 56 × 54, 60 × 64 | Cabin, cottage, cottage with loft (level 0 is `tent`). `_1` versions have lit windows for night |
| `wallpaper_<id>` | 16 × 16 tile | linen, sage_stripe, rose_floral, wood_panel, blue_check, starry, mint_dots, brick |
| `floor_<id>` | 16 × 16 tile | planks, dark_wood, checker, stone, rose_carpet, moss |
| `furniture_<type>` | 16 px per tile wide, 16 px per tile deep plus extra height for tall pieces | double_bed (32 × 32), single_bed, nightstand, wardrobe (16 × 26), dresser, armchair, sofa, stool, beanbag, table, coffee_table, desk, bookshelf (16 × 26), chest, stove, counter, icebox, kitchen_sink, bathtub, washstand, fireplace, floor_lamp, record_player, piano, houseplant, flower_vase, cat_bed, easel_art, rug_round (32 × 32), rug_long (48 × 16), rug_heart (32 × 32) |
| `wall_<type>` | 20 × 18 | window, painting, portrait, clock, shelf, mirror, garland, pennants, photo_wall, heart_sign |
| `sleeper_<skin>_<hairColor>` | 10 × 7 | A sleeping head on a pillow |

### Mine
| Name | Size | What |
|---|---|---|
| `rock_<kind>_<band>` | 16 × 16 | Rocks. Kinds: stone, copper, iron, gold, quartz, amethyst, topaz, crystal, emerald, ruby, diamond, geode, fossil. Band 0 = brown soil, 1 = grey stone, 2 = blue crystal |
| `mine_ladder_down` | 16 × 16 | Hole with a ladder, revealed under a rock |
| `mine_ladder_up` | 16 × 24 | Ladder going back up to the meadow |

### Item icons (16 × 16)
Named `item_<id>`. The full list of ids is in `src/data.js`:
- **Fish:** minnow, lily_guppy, perch, sunfish, carp, bluegill, bitterling, smelt, loach, goldfish, trout, bass, catfish, frostfin, mossback, koi, rainbow_trout, pike, eel, crystal_shrimp, glowfish, moonfish, golden_carp, lantern_koi, marimo_guardian
- **Junk:** tiny_boot, bottle, button
- **Crops:** each crop id above, plus `<crop>_seed` for its seed packet
- **Forage:** dandelion, clover, wild_garlic, morel, raspberry, daisy, feather, chamomile, acorn, chanterelle, maple_leaf, blackberry, pinecone, holly, snow_crystal, winter_root
- **Tree fruit:** cherry, peach, apple, orange
- **Mine:** stone, copper_ore, iron_ore, gold_ore, quartz, amethyst, topaz, crystal_shard, emerald, ruby, diamond, geode, amber_beetle, shell_fossil, fern_fossil, tiny_bone

### Other jars
The door in the meadow leads to three more jars, each with its own ground and pieces:

| Name | Size | What it is |
|---|---|---|
| `jar_door` | 16 × 26 | Little door, in the meadow and in each jar |
| `ground_sand_<0-3>` | 16 × 16 | Beach jar sand |
| `ground_blossom_<0-3>` | 16 × 16 | Flower jar grass |
| `palm_0` / `palm_1` | 32 × 44 | Palm tree, without and with coconuts |
| `snow_pine` | 20 × 32 | Snowy pine |
| `snowman` | 16 × 24 | Snowman |
| `hive_0` / `hive_1` | 16 × 24 | Beehive, without and with honey |
| `rose_arch` | 32 × 32 | Rose arch |

Item icons for the jars: sardine, mackerel, flounder, sea_bream, pufferfish, octopus, clownfish, bluefin_tuna, ice_smelt, arctic_char, snow_trout, glacier_pike, petal_minnow, rose_koi, blossom_carp, seashell, sea_glass, starfish, coral, icicle, frost_lily, rose, lily, lavender_sprig, coconut, honey. The jar bugs are hermit_crab, sand_beetle, ice_beetle, rose_chafer and orchid_mantis.

### The mine (expanded)

| Name | Size | What it is |
|---|---|---|
| `rock_<kind>_<zone 0-5>` | 16 × 16 | Every rock kind in `ROCKS` in `src/mine-data.js`, for the zone it appears in |
| `cave_wall_<zone 0-5>` | 16 × 16 | A tile of cave wall for each zone: Soil, Stone, Crystal, Frost, Ember, Starfall |
| `chest_0` / `chest_1` | 16 × 16 | Treasure chest, closed and open |
| `monster_<kind>_<frame 0-1>_<flash 0-1>` | 16 × 16 (bosses 26 × 26) | Each monster in `MONSTERS`, two frames, plus a white hit flash |

New item icons: every ore, gem, fossil, artifact, geode, cave fish, grotto plant and monster loot listed in `src/mine-data.js`. The underground lake is drawn in code in `drawMine`.

### Farming

| Name | Size | What it is |
|---|---|---|
| `crop_<id>_<0-3>` | 16 × 20 | Growth stages for all 48 crops in `src/data.js` and `src/farm-data.js` |
| `decor_coop`, `decor_goat_pen`, `decor_bee_box`, `decor_mushroom_log` | 16 × 16 | Farm buildings in the meadow |
| `decor_tree_<pear, plum, lemon, mango, banana>` | 24 × 34 | Fruit trees |

The locked garden beds are drawn faded, with a small sign, in `drawJarWorld`. New item icons: every new crop and seed, egg, milk, shiitake, the 5 fruits, flour, sugar, butter, cheese, oil, the 3 fertilizers and all 142 dishes in `src/cooking.js`.

### Biome jars

| Name | Size | What it is |
|---|---|---|
| `ground_<dune, jungle, moss, cloud>_<0-3>` | 16 × 16 | Ground for the desert, rainforest, mushroom glade and Starlight isle |
| `critter_<shape>_…_<frame>` | 16 × 18 | The 16 jar animals and 8 shopkeepers, two frames each. See `CRITTERS` and `SHOPS` in `src/biomes.js` for who's who |
| `jar_stall_<colour>` | 32 × 22 | Each jar's market stall |
| `jar_<kind>_<state>` | varies | Cactus, giant tree, fern, giant mushroom, bamboo, stone lantern, cloud, sandcastle (stages 0–3), bottle, igloo, flower swing, bouquet table, steam vent, telescope, stargazing bench, jungle vine, dig mark, fairy ring, sunset dune, ice rink |
| `furniture_<surfboard, snow_globe, trellis, brass_lantern, hammock, spore_lamp, paper_screen, star_lamp>` | 16 × 16 (hammock and paper screen 32 × 16) | One unique piece from each jar shop |
| `furniture_plush_<animal>` | 16 × 16 | A plush of each jar animal |

The waterfall, hot spring steam, starry sky and glade mist are drawn in code in `drawMapWorld`.

### Furniture sets and outdoor crafts

- **Furniture:** every piece in `src/furniture-data.js` is `furniture_<type>`. Each one is 16 px per tile wide and tall, plus a little extra height for tall pieces (shelves, lamps, fridges, tall plants).
  - The placeholder art is drawn from the piece's `form` and its two colours, in `drawForm` in `src/home-art.js`.
  - For a matching look, make each set (Cottage, Modern, Cabin, Japanese, Seaside, Fairy, Retro, Study, Kitchen, Bathroom, Playroom, Plants, Lights, Hobbies) as one sheet.
- **Wall items:** `wall_<type>`, 20 × 18, for the 20 new types in `src/furniture-data.js`.
- **Outdoor crafts:** `decor_<type>`, 16 × 16, or 16 × 28 for tall ones (lamp posts, torches, arches, signposts, flags, the windmill, wind chime, totem, scarecrow, bird feeder).
  - Paths, flower beds and lawns are flat and drawn under everything.
  - The full list is in `src/outdoor-data.js`, and the placeholders are in `drawOutdoor` in `src/sprites-more.js`.

### Visitors and the merchant

| Name | Size | What it is |
|---|---|---|
| `visitor_<species>_<0-1>` | 16 × 20 | A visitor, two idle frames. Species: hedgehog, fox, bear, duck, deer, owl, frog, mouse |
| `request_mark` | 7 × 9 | The **!** bubble over a visitor with a request |
| `merchant_<0-1>` | 20 × 26 | The traveling merchant, two idle frames |
| `merchant_rug` | 32 × 16 | The rug the merchant's goods sit on, flat on the ground |

Special furniture uses the same `furniture_<type>` names as the rest: canopy_bed (32 × 32), rocking_chair, tall_clock (16 × 24), globe, tea_table, paper_lantern, bonsai, jukebox (16 × 18), star_rug (32 × 32, flat), telescope, aquarium (32 × 16), lucky_cat.

### Seasonal events

| Name | Size | What it is |
|---|---|---|
| `event_stand` | 24 × 28 | The striped stand in the meadow on event days |

Lanterns in the sky and shooting stars are drawn as light effects in `src/scene.js` (`drawEventSky`). The snowman reuses `snowman`. New item icons: puffball, glowcap, truffle, star_fragment. New furniture: `furniture_fish_trophy` and `furniture_mushroom_lamp` (16 × 16).

### Avatar (16 × 24)
The avatar is built in layers so every hair, outfit and skin option lines up. Production avatar art should come as separate layers:

| Layer | Options |
|---|---|
| Body | 5 skin tones |
| Hair | Short, Bob, Long, Curly, Bun, Buzz, in 7 colours |
| Outfit | Tee, Overalls, Dress, in 6 colours |

Each layer needs these frames:
- **Walking:** 4 directions (down, up, left, right) × 4 frames
- **Other poses:** sit, crouch, cast, and swing (2 frames)

Feet stay on the same bottom pixel row in every frame. **Ask for the avatar last.** Wiring up layered avatar art needs a small code change, so send the sheets to Claude when they're ready.

## What to make first

Start with the pieces seen most: grass for one season, `tent`, `mailbox_*`, `stall`, `tree_*`, `bench`, the pond fish icons and the soil-band rocks. Check them in the game at phone size before making the rest.
