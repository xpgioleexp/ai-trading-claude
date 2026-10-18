# Little Us Terrarium

A tiny pixel world in a glass jar, inspired by Animal Crossing and Stardew Valley. You fish in the pond, dig down through the soil, grow a garden, forage, and sell what you find to buy seeds and better tools.

It also carries over everything from the original Little Us app: 3,000 daily questions, 500 weekly missions, 306 question packs, mood check-ins, appreciation cards, weekly rituals, notes, dates, dreams, a scrapbook, a live hangout, five animals with all 43 care actions, 50 decorations and 10 discoveries. All of it lives in places inside the jar.

**Playing together:**
- **On claude.ai,** the jar is shared. Invite your partner from the page's Share menu, by email, as an **Editor**. You'll see each other walking around live, and you share the garden, decorations, animals, notes, answers and plans.
- **Answers stay sealed.** Yours are private until you've both answered.
- **Anywhere else,** the jar saves on the device only, for one person.

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
| Bench | **Today**: the daily question (answer, later or skip), mood check-in, the weekly ritual |
| Mailbox | Notes and appreciation cards between you, plus tips |
| Notice board | This week's mission, which you both mark done, and a pinboard of what's coming up |
| Calendar | Plan dates from 160 ideas or your own, both confirm, and add them to your phone's calendar |
| Wishing well | Dreams with stages and steps, and a light you each leave |
| Picnic blanket | Hangout: live chat, a shared drawing pad, a timer and conversation questions |
| Animals | Care, play and explore (43 actions across five species) |
| Tray | Bag, Today, Mail, Journal (moments, question packs, scrapbook, discoveries), Build (decorations and residents), More (settings, reminders, download your data) |

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
| `src/main.js` | Game loop, tapping, walking, fishing, mining, building and your partner's live avatar |
| `src/cloud.js` | Shared storage on claude.ai, with a device-only stand-in elsewhere |
| `src/shared.js` | Live shared state: the jar, people, garden, sealed answers, discoveries, rain |
| `src/content.js` | Loads `content/` and picks the day's question and the week's mission |
| `src/together.js` | Today, check-ins, rituals, notice board, mailbox, calendar, dreams, journal |
| `src/places.js` | Build mode, animal care and settings |
| `src/hangout.js` | The live picnic hangout |
| `src/animals.js` | Residents: needs, the 43 actions and wandering |
| `src/sprites-more.js` | Placeholder art for the couple places, animals and 50 decorations |
| `content/` | The question, mission, pack and date banks, and the other carried-over content |
| `play.html` / `index.html` | The page (`play.html` is the published version, `index.html` the local one) |

Run the tests with `npm test`.

**Not carried over:**
- **Voice and video calls:** pages on claude.ai can't make calls. The hangout keeps chat and drawing.
- **Recording audio in the page:** voice notes are added as audio files in the scrapbook instead.
- **Invite codes:** the Share menu takes their place.

## Art

All art is currently drawn in code as placeholders. To replace a piece with real art, drop a PNG in `assets/` and list it in `assets/manifest.json`. The game uses it instead. [docs/ASSETS.md](docs/ASSETS.md) lists every sprite name, size and rule for ChatGPT.
