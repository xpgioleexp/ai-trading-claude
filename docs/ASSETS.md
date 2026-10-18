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
