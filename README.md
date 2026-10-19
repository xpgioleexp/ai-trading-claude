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
| Tent / your home | Go inside. **Build** inside furnishes the room you're in |
| Bench | **Today**: the daily question (answer, later or skip), mood check-in, the weekly ritual |
| Mailbox | Notes and appreciation cards between you, plus tips |
| Notice board | This week's mission, which you both mark done, and a pinboard of what's coming up |
| Calendar | Plan dates from 160 ideas or your own, both confirm, and add them to your phone's calendar |
| Wishing well | Dreams with stages and steps, and a light you each leave |
| Picnic blanket | Hangout: live chat, a shared drawing pad, a timer and conversation questions |
| Animals | Care, play and explore (43 actions across five species) |
| Tray | Bag, Today, Mail, Journal (moments, question packs, scrapbook, discoveries), Build (decorations and residents), More (settings, reminders, download your data) |

**Building your home:**
- **Upgrade the house:** tent → cabin → cottage → cottage with a loft. Upgrades cost pebbles, plus stone and ore from the cave. Each level allows more rooms (1, 2, 4, then 6).
- **Add rooms:** living room, our bedroom (one, from the cabin on), kitchen, study, bathroom, sunroom and loft.
- **Furnish:** 31 pieces. Tap twice to place, then move or return them later; returning gives back the full price.
- **Decorate:** 10 things for the six spots on the back wall, 8 wallpapers and 6 floors, chosen per room.
- **Furniture you can use:** beds (sleep), wardrobe and dresser (change your look), seats (sit), desk (calendar), bookshelf (journal), chest (bag), record player and piano (music).
- **Saying goodnight:** in the shared bedroom you can each get into the double bed and say goodnight. When you both do on the same day, you each get 15 pebbles, and it's kept in the journal.
- **Shared:** the home belongs to both of you, and you see each other walking around in the same room.

**Cooking:**
- **Where:** the stove or kitchen counter in your home, a campfire decoration outside, or **Cook** in the Bag.
- **How:** pick up to 3 ingredients: crops, fish, forage or fruit. Then chop (tap when the knife is over the green) and mind the stove (hold to keep the heat in the green).
- **Recipes:** 25 to discover by trying combinations, kept in a recipe book you share. Undiscovered ones show a hint like "a fish, a root vegetable". Anything else becomes mystery stew.
- **Together:** when your partner is in the jar, one of you chops while the other works the stove, live, and you see each other's progress. You each get the dish, plus an extra star, and it's kept in the journal.
- **Dishes:** sell them in the crate or give them through the mailbox. Any item in the Bag can be given to your partner.

**Crafting:**
- **Where:** the workbench, or **Craft** in the Bag.
- **Materials:** wood (2 each time you shake the fruit tree), fiber (from every forage pick and harvest), cloth (made from fiber), plus stone, ore, gems and flowers. The beetle shop also sells wood and fiber.
- **Furniture (10) and lamps (5):** go into your bag as "Made by you". Place them for free from **Build**: home furniture inside the home, meadow pieces outside. Returning one puts it back in your bag.
- **Toys (4):** an animal's panel then has a "Play with a toy" row, which gives a big happiness boost. Toys aren't used up.
- **Outfits:** 4 hats and a cozy sweater, unlocked in the wardrobe once made.
- **Gifts (6):** a bouquet, bracelet, carved heart, flower card, crystal charm or gem ring. Give them from the Bag; your partner opens them in the mailbox, and handmade gifts are kept in the journal.

**Bug catching:**
- **What:** 27 bugs, including butterflies, moths, bees, beetles, fireflies, glow-worms, dragonflies and crickets. Each has its seasons, time of day, weather and favorite place: flowers, ground, the fruit tree or the pond.
- **Spawns:** four are out at a time. They change every two hours, and both of you see the same ones.
- **Sneaking:** tap a bug to creep up on it slowly, then swing the net when you reach it. A bug gets nervous when you move near it. A yellow mark means careful and red means about to go. Walk normally nearby and it flies off to somewhere else.
- **Collecting:** caught bugs go in the bag (sell them in the crate) and in the **Bugs** tab of the collection log.

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
| `src/home.js` | Your home: house levels, room types, furniture, wall items, wallpapers, floors and placement rules |
| `src/home-ui.js` | Home panels: upgrade, rooms, furnishing, walls, wallpaper and floors |
| `src/cooking.js` | Recipes, ingredient kinds, matching and star ratings |
| `src/kitchen.js` | The kitchen: picking ingredients, chopping and stove minigames, cooking together |
| `src/crafting.js` | Crafting recipes, materials, and crafted furniture, toys, outfits and gifts |
| `src/crafting-ui.js` | The crafting panel |
| `src/bugs.js` | Bugs: who's out when, where they appear and catching them |
| `src/home-art.js` | Placeholder art for the house, furniture, wall items, wallpapers and floors |
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
