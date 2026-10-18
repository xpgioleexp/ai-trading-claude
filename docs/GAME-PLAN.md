# Little Us: Game System Plan

A cozy pixel world for two people, inspired by Animal Crossing and Stardew Valley. You fish, mine, farm, forage, cook, craft, decorate and collect together. The existing relationship features (daily questions, missions, notes, journal, dates, dreams, hangouts) live inside the world as objects you walk up to.

**Who does what**
- **ChatGPT** makes the art (sprites, tiles, icons, panels) to the specs in this plan.
- **Claude** writes all the code: game systems, server rules, database, syncing and tests, and fits the art in.

---

## 1. Design pillars

1. **There's always something to do.** Every day offers fish to catch, rocks to break, crops to water, things to find and people to write to.
2. **Better together.** Most activities work solo, but doing them together gives bonuses: double bites, shared mine floors, combo harvests. Nothing important is locked behind both people being online.
3. **No punishment.** Crops don't die while you're away. Animals don't suffer. Nothing breaks or streaks reset. Missing a day just means things wait for you.
4. **Real time, shared clock.** Like Animal Crossing, the world follows the real clock in the couple's time zone. Mornings, nights, seasons and holidays are the same for both of you.
5. **Daily rhythm, not grinding.** Resources refresh each day, with a set number of rocks, fish bites and forage spots. That keeps visits short and fun and stops one partner from racing ahead.
6. **The relationship features stay first-class.** A mailbox, bench and journal sit in the world, and they're never locked behind progress or purchases.

---

## 2. The core loop

```
Wake up (new day in your time zone)
 → Check the mailbox (notes, gifts, the daily question)
 → Water crops, collect forage, check the animals
 → Go fishing / mining / bug catching
 → Sell extras in the shipping bin, or cook and craft with them
 → Spend pebbles on seeds, tools, furniture and house upgrades
 → Donate rare finds to the collection, decorate, leave your partner a gift
 → Tomorrow: crops grow, rocks respawn, new fish are biting
```

Longer goals: fill the collection book, upgrade your tools, reach the bottom of the mine, grow the house, finish seasonal sets, and complete the weekly mission together.

---

## 3. Game systems

Each system lists **what you do**, **the rules** and **what makes it a couples game**.

### 3.1 Avatars and movement (foundation)
- Customizable chibi pixel humans: skin tone, hair style and colour, outfit, shoes, hat and accessory. No gender-locked options.
- Tap to walk, drag to pan, pinch to zoom. Walking routes go around water, trees and buildings.
- **Together:** your partner's avatar appears when they're online and moves in sync. You can wave, sit together and give gifts. An offline partner is never faked as moving.
- Animations: idle and walk (4 directions), plus wave, sit, and one pose per tool (cast, swing pickaxe, swing axe, water, net swing, eat).

### 3.2 Bag, items and tools (foundation)
- **Bag:** personal inventory with 24 slots, upgradeable to 36 and then 48. Items stack up to 99.
- **Shared chest:** placeable storage both people can use.
- **Item registry:** one master list of every item (ID, name, category, sell price, stack size, season, art). Every other system reads from it.
- **Tools:** fishing rod, pickaxe, axe, watering can, hoe, bug net and shovel.
- **Tool tiers:** Basic, Copper, Iron, Gold and Crystal. Each tier is faster or covers more ground and unlocks harder content, like deeper mine floors, tougher fish and bigger watering areas. Upgrades cost ore and pebbles at the workbench.

### 3.3 Fishing
- **What you do:** stand at water, cast, wait for a bite, then play a short timing minigame. Keep the fish inside a moving bar, Stardew-style but simpler and touch-friendly.
- **Where:** pond, river and, later, the sea. Each has its own fish.
- **What's biting:** depends on location, time of day, season and weather. Rain brings rare fish, night brings eels and catfish.
- **About 40 fish at launch.** Each has a rarity, difficulty, size range and sell price. Junk catches too: boots, lost letters and bottles that sometimes hold a message.
- **Fish log:** every species, your biggest catch and when it's caught.
- **Bait and tackle:** crafted items that improve bites or the minigame.
- **Daily limit:** each water spot has a set number of bites per day so it stays special.
- **Together:** fishing side by side gives both people faster bites. There's also a "Tandem catch" for legendary fish that needs both of you, and a weekly couple fishing challenge.

### 3.4 Mining
- **What you do:** enter the cave (it already exists in the game), go down floors, break rocks with the pickaxe, and find the ladder down.
- **Floors:** generated for each day. There are 4 zones of 15 floors each: Earth, Frost, Crystal and Ember. Every 5th floor is an elevator checkpoint.
- **Finds:** stone, copper, iron, gold and crystal ore, plus gems, geodes (cracked open at the workbench) and fossils.
- **No combat at first.** Instead there are gentle hazards: collapsing rocks, dark floors that need a lantern, and puzzle floors. Cute slime enemies could come later if you want them.
- **Daily rhythm:** the mine resets each day. Your deepest floor reached is saved.
- **Together:** both partners on the same floor share it and can split up rocks. Some "Twin lock" doors need both of you to stand on two switches.

### 3.5 Farming
- **What you do:** till soil with the hoe, plant seeds, water daily, harvest.
- **Crops:** about 24 at launch, 6 per season. Some regrow after harvest. Crops grow in real days.
- **No dying:** an unwatered crop just pauses growth. The out-of-season wilt from Stardew is off.
- **Quality:** normal, silver and gold, based on fertilizer and care streaks. Quality is only a bonus.
- **Expansion:** buy more farmland with pebbles. Craft sprinklers (with ore from the mine) to water automatically.
- **Builds on what exists:** the current seed garden becomes the first plot.
- **Together:** watering your partner's crops counts too, a "Shared harvest" bonus applies when both of you tend a plot in the same day, and you can gift crops.

### 3.6 Foraging and trees
- Spots around the map spawn seasonal items each day: berries, mushrooms, flowers, shells, feathers and pinecones.
- Chop trees with the axe for wood. Trees regrow, and you can plant new ones. Some trees drop fruit when shaken (Animal Crossing).
- Dig spots with the shovel for buried items and fossils.

### 3.7 Bug catching
- Swing the bug net at insects that appear by season, time and weather: butterflies, beetles, fireflies (the firefly grove already exists) and dragonflies.
- About 30 bugs at launch, with a bug log like the fish log.

### 3.8 Cooking and crafting
- **Workbench:** tools, tool upgrades, sprinklers, bait, chests, fences, paths, lanterns and furniture.
- **Kitchen:** recipes combining crops, fish, forage and eggs.
- **Recipes:** unlocked from mail, the collection book, festivals and your partner. About 30 crafting and 30 cooking recipes at launch.
- **What food does:** no stamina system (see decision 1). Food is for gifting, selling, decorating plates and filling a "Recipe book" collection.
- **Together:** a "Cook together" recipe needs both people to add an ingredient, and only couple recipes make the special dishes.

### 3.9 Collections (museum)
- A collection book covering fish, bugs, fossils, gems, crops, forage, recipes and furniture sets.
- Donate one of each to fill it. Milestones reward furniture, recipes and outfits.
- Later, this can become a small museum building you place in the world.

### 3.10 Economy and shop
- **One currency: pebbles.** They already exist, they're server-controlled and the daily rewards already pay them out.
- **Earn by:** selling items (Stardew-style shipping bin, paid out the next morning), daily questions, missions and rituals. The rewards that already exist stay the same.
- **Spend on:** seeds, furniture, tool upgrades, farmland, house upgrades, outfits and decorations.
- **Shop stock:** changes daily, with seasonal items, Animal Crossing-style.
- **Balance:** all prices and payouts live on the server, as now. Nobody can edit their pebbles in the browser.

### 3.11 House and buildings
- **Cabin:** starts as a tent and grows into a cabin, then a two-room cabin, then a cottage with a loft.
- **Inside:** decorate with furniture, wallpaper and floors.
- **Outside:** place buildings like the workshop, coop, greenhouse and museum.
- **Builds on what exists:** the current 50 decorations and placement system (with move, layers and conflict protection) are reused for furniture.

### 3.12 Animals
- **Forest residents:** the existing bunny, frog, turtle, snail and Marimo stay as they are, with all 43 interactions.
- **Farm animals (later):** chickens and ducks in a coop give eggs and feathers. Pet them daily for happiness. They never get sick or die.

### 3.13 Seasons, weather and time
- **Seasons:** spring, summer, autumn and winter follow the real calendar (option: one season per real week, see decision 4).
- **Day and night:** follow the couple's time zone. Lamps glow at night, fireflies come out and different fish bite.
- **Weather:** sun, rain, storm, snow and fog. It affects fish, bugs and forage. The existing shared rain stays as well.

### 3.14 Events and festivals
- **Monthly festivals:** spring flower fair, summer fishing tournament, autumn harvest, winter lights.
- **Special dates:** your anniversary and both birthdays become in-game events if you set them, with a gift from the world.
- **Meteor showers and rare visitors:** occasional surprises that make a daily visit worth it.

### 3.15 Relationship features inside the world

| Object | Opens |
|---|---|
| Mailbox | Notes, appreciation cards, voice notes, **item gifts with a letter** (new) |
| Bench | Daily question, mood check-in, weekly ritual |
| Notice board | This week's mission |
| Journal (bag tool) | Answers, memories, scrapbook, photos |
| Calendar | Dates and schedule |
| Wishing tree | Dreams |
| Picnic blanket | Hangout (chat, drawing, voice and video) |
| Gear | Account, partner, time zone, export, reset |

Every relationship feature also stays in the bag, so you never have to walk anywhere to reach one.

### 3.16 Later ideas (not in the first versions)
- Visiting characters (NPCs) with dialogue and friendship
- A second island or world
- A sea and a boat
- Slime combat in the mine
- Native phone app and push notifications
- Pet dog or cat that follows your avatar

---

## 4. How it's built (technical)

The existing app already has strong foundations, and the new systems reuse them:

- **Server decides everything that matters:** catches, ore drops, crop growth, prices and pebbles. The browser shows animations and sends actions. This is how the current app already handles pebbles and decorations.
- **Daily seeds:** each couple and day gets a random seed. It decides that day's mine floors, forage spawns and fish. The same day looks the same on both devices and after a reload.
- **Actions are safe to retry:** every action (catch, break rock, plant) has an ID, so a laggy connection can't duplicate items. The current outbox system already works this way.
- **Live presence:** avatar positions use the real-time connection the hangout room already has, not the slower 2-second polling.
- **Data files:** new content lives in simple data files, the way questions and missions already do (fish, bugs, crops, recipes, ores and furniture). Adding a fish means adding a line, not writing code.
- **New database tables** (added safely, existing data untouched):
  - `avatar`: appearance and position
  - `inventory_item`: per person, with item ID and count
  - `shared_chest_item`
  - `tool`: type and tier
  - `farm_plot`: crop, planted day, watered days, quality
  - `world_node`: rock, tree or forage spot, and when it respawns
  - `mine_progress`
  - `collection_entry`
  - `recipe_known`
  - `log_entry`: fish and bug records, with biggest size
  - `shipping_bin`
  - `house`: level and interior layout
- **Tests:** every system gets server tests (rules, no duplicates, privacy) and browser tests on two accounts, like the existing ones.

---

## 5. Build phases

Each phase ends with something you can play. The game stays working the whole time.

| Phase | What gets built | You can then… |
|---|---|---|
| **0. Setup** | Code into GitHub, run the app and tests, tidy the code formatting, decide hosting | See the current game running |
| **1. Your world** | Full-screen world as the home screen, your avatar with customization, tap to walk, bag and item registry, mailbox in the world | Walk around as yourself and send a note from the mailbox |
| **2. Together** | Partner avatar with live presence and synced walking, wave, item gifts by mail | See each other in the world and send gifts |
| **3. Fishing + selling** | Rod, fishing minigame, 40 fish, fish log, shipping bin, daily shop | Fish, fill the log, earn pebbles |
| **4. Farming + seasons** | Hoe, watering can, 24 crops, seasons, weather effects, foraging, trees and axe | Run a little farm through the year |
| **5. Mining + crafting** | Mine floors and zones, ore, gems, geodes, workbench, tool upgrades, sprinklers | Dig deep and upgrade your gear |
| **6. Cooking + collections** | Kitchen, recipes, bug net and 30 bugs, collection book and rewards | Cook together and complete sets |
| **7. Home** | House upgrades, interiors, furniture, buildings, coop and chickens | Build your dream cottage |
| **8. Events** | Festivals, fishing tournament, anniversary and birthday events, meteor showers | Celebrate special days in the game |
| **Throughout** | Move each existing feature (questions, missions, journal, dates, dreams, hangouts) into its world object, then remove the old menus | Use everything without leaving the world |

---

## 6. Art list for ChatGPT

**The same rules apply to every asset:**
- PNG with a transparent background, pixel art, no blur, no anti-aliasing
- Exact sizes as listed. Tiles are 32×32, characters 32×48.
- Light comes from the upper left. Palette: grass `#A8BE7C`, foliage `#6F925B`, wood `#B88D60`, water `#79AAA4`, panels `#F3E9CF`, outlines `#38493D`, rose accent `#C68F89`.
- Each animation is a horizontal strip of equal frames. The character's feet stay on the same pixel row in every frame.
- One file per asset or strip, named as in the lists below (for example `avatar_walk_down.png`).
- No text drawn inside images. All text comes from code.

ChatGPT-style image generators often drift between frames. Claude checks every delivery and lists anything misaligned before it goes in the game.

**Phase 1–2: avatars and world**
- Avatar base body: idle and walk in 4 directions, 4 frames each, 32×48
- Hair (8 styles), outfits (6), hats (4), accessories (4), each drawn as layers that line up with the base frames
- Wave and sit poses
- Grass tiles (4 variants), dirt, water edges and corners, flowers, small rocks
- Mailbox (closed and with mail), tent, chest, the bag and tool tray icons, panel borders and buttons

**Phase 3: fishing**
- Cast, wait and reel poses
- Bobber and splash, fish shadow in water
- 40 fish icons (32×32), junk items
- Minigame bar parts, shipping bin, shop stall

**Phase 4: farming**
- Hoe and watering can poses, tilled and watered soil
- 24 crops × 4 growth stages, seed bags
- Tree chop and fall frames, stumps, forage items
- Seasonal versions of grass and trees, snow and rain overlays

**Phase 5: mining**
- Pickaxe pose, mine floor and wall tiles for 4 zones
- Rocks and ore nodes (break frames), ladder, elevator
- Ores, gems, geodes, fossils, workbench, tool icons for each tier

**Phase 6–8**
- Bug net pose and 30 bugs, kitchen, 30 food icons
- Collection book UI, house stages and interiors, furniture
- Coop, chickens, festival decorations

---

## 7. Decisions needed from you

1. **Stamina/energy?** Stardew limits how much you can do per day with stamina, and Animal Crossing has no limit. **Recommendation: no stamina.** Daily resource limits already pace the game, and stamina can feel stressful.
2. **Personal or shared bag?** **Recommendation: a personal bag plus a shared chest.** Gifts feel special because you choose what to give.
3. **Separate or shared progress?** **Recommendation: shared world, farm, house and collection book, with personal tools, bag, fish log and outfit.** Each person gets their own little achievements, and you build the world together.
4. **Season length?** Real-calendar seasons (3 months each) or one season per real week. **Recommendation: one season per week**, so you see all the content sooner.
5. **Hosting:** stay on ChatGPT Sites or move to a host you control. This decides whether a new sign-in system is needed first.
