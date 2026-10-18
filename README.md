# Little Us Terrarium

A tiny pixel world in a glass jar, inspired by Animal Crossing and Stardew Valley. You fish in the pond, dig down through the soil, grow a garden, forage, and sell what you find to buy seeds and better tools.

This is the first playable version of the plan in [docs/GAME-PLAN.md](docs/GAME-PLAN.md). It runs fully in the browser and saves on the device. Partner features (seeing each other, notes, gifts) come when the jar is connected to the Little Us accounts backend.

## Play it

```sh
npm start          # serves the folder at http://127.0.0.1:4173
```

Open `http://127.0.0.1:4173/`. Add `#debug` to the address to get test buttons for skipping to the next day, switching between day and night, and adding pebbles.

Any static file server works. There is no build step.

## What's in the jar

| Tap | What happens |
|---|---|
| The ground | Walk there |
| Pond | Cast, wait for the **!**, tap, then hold to keep the green zone on the fish |
| Garden bed | Plant a seed, water it, or pick it when it's ready |
| Cave (under the bench) | Go down into the mine. Break rocks for ore, gems and fossils. One plain rock per layer hides the ladder down |
| Beetle shop | Buy this season's seeds |
| Shipping crate | Sell things; you get paid the next morning |
| Workbench | Upgrade the fishing rod and pickaxe with ore |
| Fruit tree | Shake once a day for fruit |
| Glints on the ground | Forage, new spots every day |
| Tent | Change your look |
| Mailbox | Letters and tips |
| Bunny | Pet it |

**The rules:**
- **Real time:** the jar follows the real clock, so mornings, nights and new days happen when they do for you.
- **Seasons:** each season lasts one real week.
- **Weather:** changes daily. Rain waters the garden for you.
- **Fish:** 25 kinds. Which ones bite depends on the season, the time of day and the weather. The pond gives 10 bites a day.
- **Garden:** 16 crops. A crop grows one step each day after it's watered, and it never dies if you skip a day.
- **Mine:** 30 layers in 3 bands (Soil, Stone, Crystal). Rocks come back every day, and the deepest layer you've reached is saved.
- **Collection log:** tracks every fish, find and crop you've collected, plus your biggest catch of each fish.

## Code

| File | What it does |
|---|---|
| `src/data.js` | All content: fish, crops, forage, minerals, tools, avatar options. Add a row to add content |
| `src/rules.js` | Game rules (bag, garden, fishing, mine, shop, crate, upgrades, new day). No drawing code, so it's tested and can move to the server later |
| `src/world.js` | The jar's layout: tile grid and where each object sits |
| `src/clock.js` | Day numbers, seasons, weather, time of day |
| `src/rng.js` | Seeded randomness, so a day's forage, weather and mine layers are the same on every device |
| `src/path.js` | Walking routes on the tile grid |
| `src/sprites.js` | Placeholder pixel art drawn in code, and loading of real PNG art |
| `src/avatar.js` | The layered player avatar |
| `src/scene.js` | Draws the jar, the mine, weather, night and the fishing minigame |
| `src/ui.js` | Panels: bag, log, shop, crate, workbench, mailbox, wardrobe |
| `src/main.js` | Game loop, tapping, walking, fishing and mining |
| `play.html` / `index.html` | The page (`play.html` is the published version, `index.html` the local one) |

Run the tests with `npm test`.

## Art

All art is currently drawn in code as placeholders. To replace a piece with real art, drop a PNG in `assets/` and list it in `assets/manifest.json`. The game uses it instead. [docs/ASSETS.md](docs/ASSETS.md) lists every sprite name, size and rule for ChatGPT.
