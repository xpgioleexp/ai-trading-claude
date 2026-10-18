# Little Us: Game System Plan

A tiny living terrarium for two people, inspired by Animal Crossing and Stardew Valley. The whole game happens inside a small glass jar: a little patch of grass, a pond, a garden, a cave and your tiny avatars. You fish, mine, farm, forage, cook, craft, decorate and collect together. The existing relationship features (daily questions, missions, notes, journal, dates, dreams, hangouts) live inside the jar as little objects you tap.

**Who does what**
- **ChatGPT** makes the art (sprites, tiles, icons, panels) to the specs in this plan.
- **Claude** writes all the code: game systems, server rules, database, syncing and tests, and fits the art in.

---

## 1. Design pillars

1. **Small and cozy.** The whole jar fits on one phone screen. There's no big map to pan around, and everything is a tap or two away.
2. **Small but full of things to do.** Every day there are fish in the pond, rocks in the cave, crops to water and things to find. The jar is small, but it's packed.
3. **Grow by adding jars, not a bigger map.** New areas are new terrariums on a shelf, like a beach jar for sea fishing or a crystal jar for deep mining.
4. **Better together.** Most activities work solo, but doing them together gives bonuses. Nothing important is locked behind both people being online.
5. **No punishment.** Crops don't die while you're away. Animals don't suffer. Nothing breaks or streaks reset.
6. **Real time, shared clock.** Like Animal Crossing, the jar follows the real clock in your shared time zone. Day, night, weather and seasons are the same for both of you.
7. **Daily rhythm.** Each jar refreshes once a day, with a set number of fish bites, rocks and forage spots. Visits stay short and sweet.
8. **The relationship features stay first-class.** The mailbox, bench and journal are always reachable and never locked behind progress or purchases.

---

## 2. What the screen looks like

```
┌───────────────────────────────┐
│ Little Us   🪨 120     👥  ⚙  │   ← name, pebbles, partner, settings
│      ╭─────────────────╮      │
│     ╱  ☁  glass lid     ╲     │
│    │  🌲  🏠 📮    🌲     │    │   ← cabin, mailbox, trees
│    │   🌱🌱   🧑 👩  💧💧 │    │   ← garden, both avatars, pond
│    │  🪑      🐇    🐢 🕳 │    │   ← bench, animals, cave entrance
│    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│    │   ← soil layer seen through the glass
│    │▒▒ ⛏ mine floors ▒▒▒▒│    │
│     ╲___________________╱     │
│     [🎒 Bag] [🔨 Build] [🫙 Shelf]   ← tool tray
└───────────────────────────────┘
```

- **The jar:** one fixed scene, about 20 × 12 tiles of ground in a slightly angled view inside a glass jar. You can zoom in, but there's no panning across a big map.
- **The soil cross-section:** the bottom of the jar shows soil layers through the glass. That's where the mine is. You can see your avatar digging down.
- **The shelf:** zoom out to see all your jars on a wooden shelf, and tap one to step inside.
- **The glass:** reflections, condensation on rainy days, a glowing lid light at night and snow on the lid in winter. Weather happens inside the jar.

---

## 3. The core loop

```
Open the app → you're looking at your jar
 → Check the mailbox (notes, gifts, the daily question)
 → Water the garden, collect forage, pet the animals
 → Fish in the pond, dig in the cave, catch bugs
 → Sell extras in the shipping crate, or cook and craft with them
 → Spend pebbles on seeds, furniture, upgrades and new jars
 → Donate rare finds to the collection book, decorate, leave your partner a gift
 → Tomorrow: crops grow, rocks respawn, new fish are biting
```

Longer goals: fill the collection book, upgrade your tools, dig to the bottom of the mine, decorate the jar, grow the cabin, and collect every jar for the shelf.

---

## 4. Game systems

Each system lists **what you do**, **the rules** and **what makes it a couples game**.

### 4.1 Avatars (foundation)
- Tiny customizable chibi pixel people: skin tone, hair style and colour, outfit, hat and accessory. No gender-locked options.
- **Moving:** tap a spot in the jar to walk there. The jar is small, so a walk takes a second or two.
- **Tapping objects:** your avatar walks over and does the action, like casting at the pond or digging at the cave.
- **Together:** your partner's avatar appears when they're online and moves in sync. You can wave, sit on the bench together and hand over gifts. An offline partner is never faked as moving; their avatar is shown asleep in the cabin instead.
- **Animations:** idle and walk (4 directions), plus wave, sit, sleep, and one pose per tool (cast, dig, water, net swing, eat).

### 4.2 Bag, items and tools (foundation)
- **Bag:** personal inventory with 20 slots, upgradeable to 30 and then 40. Items stack up to 99.
- **Shared chest:** a little chest in the jar that both people can use.
- **Item registry:** one master list of every item (ID, name, category, sell price, stack size, season, art). Every other system reads from it.
- **Tools:** fishing rod, pickaxe, watering can, trowel and bug net.
- **Tool tiers:** Basic, Copper, Iron, Gold and Crystal. Better tools are faster and unlock harder content.

### 4.3 Fishing
- **What you do:** tap the pond, cast, wait for a bite, then play a short one-thumb timing minigame.
- **What's biting:** depends on time of day, season and weather. Rain brings rare fish, night brings glowing ones.
- **About 25 pond fish at launch**, plus more in the beach jar later. Each has a rarity, size range and sell price. Junk catches too: tiny boots, bottle messages and lost buttons.
- **Fish log:** every species, your biggest catch and when it's caught.
- **Daily limit:** the pond has a set number of bites each day.
- **Together:** fishing side by side gives faster bites. One legendary fish needs both of you to reel it in.

### 4.4 Mining (the soil layer)
- **What you do:** go into the little cave and dig down through the soil layers you can see through the glass. Each layer is one small screen: tap rocks to break them and find the way down.
- **Layers:** 3 bands with 10 layers each: Soil, Stone and Crystal. More bands come with new jars.
- **Finds:** stone, copper, iron, gold, gems, geodes and fossils. Tiny fossils fit the miniature theme, like a beetle in amber.
- **No combat.** Gentle puzzles instead: dark layers need a lantern, and roots or crumbly rock block the way.
- **Daily rhythm:** rocks refill each day, and your deepest layer is saved.
- **Together:** both partners can dig the same layer at once. "Twin roots" need both of you to pull them out.

### 4.5 Garden
- **What you do:** plant seeds in a few garden beds, water them daily, harvest.
- **Size:** starts at 6 beds, and you can buy up to 16 with pebbles.
- **Crops:** about 16 at launch, 4 per season. Some regrow after harvest. Crops grow over real days.
- **No dying:** an unwatered crop just pauses growth.
- **Quality:** normal, silver and gold, from fertilizer and care. A craftable mister (sprinkler) waters automatically.
- **Builds on what exists:** the current seed garden becomes the first bed.
- **Together:** watering your partner's plants counts too, and you get a bonus when you both tend the garden on the same day.

### 4.6 Foraging
- **Forage:** a few spots in the jar grow something new each day: berries, mushrooms, flowers, pebbles, feathers and acorns.
- **Fruit:** shake the little tree for fruit.
- **Digging:** dig spots with the trowel for buried treasures.

### 4.7 Bug catching
- Bugs appear by season, time and weather: butterflies, ladybugs, fireflies at night (the firefly grove already exists), beetles and dragonflies over the pond.
- About 20 bugs at launch, with a bug log.

### 4.8 Cooking and crafting
- **Workbench:** tool upgrades, misters, bait, lanterns, chests, fences and furniture.
- **Little stove:** recipes combining crops, fish and forage.
- **Recipes:** unlocked through mail, the collection book and your partner. About 20 crafting and 20 cooking recipes at launch.
- **What food does:** no stamina system (see decision 1). Food is for gifting, selling and filling the recipe book.
- **Together:** couple recipes need both of you to add an ingredient.

### 4.9 Collection book
- Covers fish, bugs, fossils, gems, crops, forage, recipes and furniture.
- Donate one of each to fill it. Milestones reward furniture, outfits, recipes and **new jars**.

### 4.10 Economy and shop
- **One currency: pebbles.** They already exist, they're server-controlled and the daily rewards already pay them out.
- **Earn by:** selling items in the shipping crate (paid the next morning), daily questions, missions and rituals. The existing rewards stay the same.
- **Spend on:** seeds, furniture, tool upgrades, garden beds, cabin upgrades, outfits and new jars.
- **Shop:** a tiny shop stall, or a traveling beetle merchant who visits the jar, with stock that changes daily.
- **Balance:** all prices and payouts are decided on the server, so nobody can edit their pebbles.

### 4.11 Cabin and decorating
- **Cabin:** a tiny cabin in the corner of the jar, upgraded from a tent to a cabin to a cottage.
- **Inside:** tap it to see the interior as its own small screen, and decorate it with furniture.
- **Outside:** the existing 50 decorations and placement system (with move, layers and conflict protection) are reused for furniture and garden decorations.

### 4.12 Animals
- **Residents:** the existing bunny, frog, turtle, snail and Marimo stay with all 43 interactions. They wander the jar.
- **Later:** tiny chickens or ducks that give eggs and feathers. They never get sick or die.

### 4.13 Seasons, weather and time
- **Seasons:** grass colour, trees and crops change with the season (length is decision 4).
- **Day and night:** follow your shared time zone. The lid light glows at night and fireflies come out.
- **Weather inside the jar:** rain from a little cloud under the lid, snow, fog and sunbeams through the glass. The existing shared rain stays.

### 4.14 The shelf and more jars
- **Your first jar:** the Forest jar, with the pond, garden, cave and cabin.
- **Unlockable jars:** each is a small new place with its own fish, bugs, forage and mine band:
  - **Beach jar:** sea fishing, shells and a tide pool
  - **Crystal jar:** deep mining and glowing gems
  - **Snow jar:** ice fishing and winter forage
  - **Flower jar:** rare crops, bees and honey
- **Unlocking:** earn jars through the collection book and pebbles. The shelf view shows every jar with its little lights on.

### 4.15 Events
- **Monthly mini-events:** a flower festival, a fishing contest in the pond, a harvest and winter lights in the jar.
- **Special dates:** your anniversary and both birthdays become in-game events, with decorations and a gift.
- **Surprises:** a shooting star seen through the glass, or a rare visitor bug.

### 4.16 Relationship features inside the jar

| Object | Opens |
|---|---|
| Mailbox | Notes, appreciation cards, voice notes, **item gifts with a letter** (new) |
| Bench | Daily question, mood check-in, weekly ritual |
| Little notice board | This week's mission |
| Journal (bag tool) | Answers, memories, scrapbook, photos |
| Calendar (on the cabin wall) | Dates and schedule |
| Wishing flower | Dreams |
| Picnic blanket | Hangout (chat, drawing, voice and video) |
| Gear | Account, partner, time zone, export, reset |

Every relationship feature also stays in the bag, so you can always reach it in one tap.

### 4.17 Later ideas (not in the first versions)
- Little visitor characters with dialogue
- Swapping or visiting each other's decorated jars
- A pet that follows your avatar
- Native phone app and push notifications

---

## 5. How it's built (technical)

The existing app already has strong foundations, and the new systems reuse them:

- **Smaller is simpler.** One fixed jar scene means no camera panning, simple walking paths and fewer things to sync.
- **The original app already had a jar.** The first version showed a terrarium jar on a shelf (`drawJar` in the current art code). This plan brings that back as the main view.
- **Server decides everything that matters:** catches, ore drops, crop growth, prices and pebbles. The browser shows animations and sends actions, the same way the current app handles pebbles and decorations.
- **Daily seeds:** each couple and day gets a random seed that decides that day's mine layers, forage and fish. Both devices see the same jar.
- **Actions are safe to retry:** every action has an ID, so a laggy connection can't duplicate items. The current outbox system already works this way.
- **Live presence:** avatar positions use the real-time connection the hangout room already has.
- **Data files:** fish, bugs, crops, recipes, ores, furniture and jars each live in their own simple data file, the way questions and missions already do.
- **New database tables** (added safely, existing data untouched):
  - `jar`: which jars you own, plus the layout of each
  - `avatar`: appearance and position
  - `inventory_item`
  - `shared_chest_item`
  - `tool`
  - `garden_bed`
  - `world_node`: rocks and forage, plus respawn day
  - `mine_progress`
  - `collection_entry`
  - `recipe_known`
  - `log_entry`: fish and bugs
  - `shipping_crate`
  - `cabin`
- **Tests:** every system gets server tests and two-account browser tests, like the existing ones.

---

## 6. Build phases

Each phase ends with something you can play. The game stays working the whole time.

| Phase | What gets built | You can then… |
|---|---|---|
| **0. Setup** | Code into GitHub, run the app and tests, tidy the code formatting, decide hosting | See the current game running |
| **1. The jar** | Jar as the home screen, shrink the forest to fit, your avatar with customization, tap to walk, bag and item registry, mailbox | Walk around your jar and send a note from the mailbox |
| **2. Together** | Partner avatar with live presence, synced walking, sitting together, item gifts by mail | See each other in the jar and send gifts |
| **3. Fishing + selling** | Rod, minigame, 25 fish, fish log, shipping crate, shop | Fish and earn pebbles |
| **4. Garden + seasons** | Garden beds, 16 crops, seasons, jar weather, foraging, fruit tree | Grow a little garden through the year |
| **5. Mining + crafting** | Soil-layer mine with 30 layers, ore, gems, fossils, workbench, tool upgrades | Dig deep and upgrade your gear |
| **6. Cooking + collections** | Stove, recipes, bug net and 20 bugs, collection book | Cook together and complete sets |
| **7. Cabin + shelf** | Cabin upgrades and interior, the shelf view, the first extra jar (Beach) | Decorate your home and open a second jar |
| **8. Events + more jars** | Mini-events, anniversary and birthdays, Crystal/Snow/Flower jars | Celebrate and collect jars |
| **Throughout** | Move each existing feature into its jar object, then remove the old menus | Use everything without leaving the jar |

---

## 7. Art list for ChatGPT

**The same rules apply to every asset:**
- PNG with a transparent background, pixel art, no blur, no anti-aliasing.
- **Sizes:** ground tiles are 16×16 (the jar is small, so small tiles), avatars 16×24, item icons 16×16. Larger objects use multiples of 16, for example the cabin at 48×48.
- Light comes from the upper left. Palette: grass `#A8BE7C`, foliage `#6F925B`, wood `#B88D60`, water `#79AAA4`, panels `#F3E9CF`, outlines `#38493D`, rose accent `#C68F89`.
- Each animation is a horizontal strip of equal frames. The character's feet stay on the same pixel row in every frame.
- One file per asset or strip, named as in the lists below (for example `avatar_walk_down.png`).
- No text drawn inside images. All text comes from code.

ChatGPT-style image generators often drift between frames. Claude checks every delivery and lists anything misaligned before it goes in the game.

**Phase 1–2: the jar and avatars**
- **The jar:** glass jar frame (front and back layers, so things can appear inside the glass), lid, glass shine, plus rain-condensation and night-glow overlays
- **Shelf:** a wooden shelf for the shelf view
- **Ground:** grass tiles (4 variants), dirt, pond edges, small rocks, flowers, and soil cross-section layers at the bottom of the jar
- **Avatar base:** idle and walk in 4 directions, 4 frames each, 16×24
- **Avatar layers:** hair (8 styles), outfits (6), hats (4) and accessories (4), each lined up with the base frames
- **Avatar poses:** wave, sit and sleep
- **Objects and interface:** mailbox (closed and with mail), tent, chest, bag and tool icons, panel borders and buttons

**Phase 3: fishing**
- Cast, wait and reel poses; bobber, ripple and splash; fish shadow
- 25 fish icons, junk items, minigame bar parts, shipping crate, shop stall or beetle merchant

**Phase 4: garden**
- Watering pose, garden bed (dry and watered)
- 16 crops × 4 growth stages, seed packets, forage items, fruit tree
- Seasonal grass and tree versions, rain cloud, snow

**Phase 5: mining**
- Dig pose, soil-layer backgrounds for 3 bands
- Rocks and ore (with break frames), roots, lantern
- Ores, gems, fossils, workbench, tool icons for each tier

**Phase 6–8**
- Net pose and 20 bugs, stove, 20 food icons
- Collection book interface, cabin stages and interior, furniture
- The Beach, Crystal, Snow and Flower jars, plus event decorations

---

## 8. Decisions needed from you

1. **Stamina/energy?** **Recommendation: no stamina.** Daily resource limits already pace the game.
2. **Personal or shared bag?** **Recommendation: a personal bag plus a shared chest.** Gifts feel special because you choose what to give.
3. **Separate or shared progress?** **Recommendation: shared jars, garden, cabin and collection book, with personal tools, bag, fish log and outfit.**
4. **Season length?** **Recommendation: one season per real week**, so you see everything sooner.
5. **Hosting:** stay on ChatGPT Sites or move to a host you control. This decides whether a new sign-in system is needed first.
