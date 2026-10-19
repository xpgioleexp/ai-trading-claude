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

Open `http://127.0.0.1:4173/`. Add `#debug` to the address to get test buttons for skipping to the next day or the next seasonal event, switching between day and night, and adding pebbles.

Any static file server works. There is no build step.

## What's in the jar

**A wider meadow:** the meadow is four screens wide, with the one you started on second from the left. Walk toward the glass on either side and the view slides with you; little arrows at the edges show there's more that way. **West woods:** a forest pool to fish in and six trees. **East meadow:** a lily pond, a reed pond, eight trees, and the door to the other jars on the far east wall. There's lots of open room for decorations, farm buildings and crafts.

**A taller meadow:** it also runs 8 rows above the first screen and 8 below. Walk toward the lid or the soil and the view slides up or down; arrows at the top and bottom show there's more. **North hills:** a hill spring to fish in and six trees. **South fields:** a meadow marsh to fish in and five trees. Your home and the mine still fit on one screen.

**Fills tall screens:** on a tall screen (an iPad or a phone held upright) the jar stretches down to fill the space, so you see more of the meadow or jar at once. Your home and the mine stay their size, in the middle of the jar.

**Wider jars:** every jar is three screens wide too, with the jar you know in the middle (door and all), so each one opens up to the left and the right. Each side has scenery that fits the jar and an extra place to fish:

| Jar | Extra pond | Scenery |
|---|---|---|
| Beach | rock pool | five more palms, two with coconuts; the sea runs the whole way along |
| Snow | little frozen pond | six snowy pines |
| Flower | lotus pond | cherry trees, a willow, ferns |
| Desert | small oasis | four cacti (two with fruit), two date palms |
| Rainforest | jungle pool | another giant tree (with passion fruit), lots of ferns |
| Mushroom glade | glowing pool | four giant mushrooms, ferns |
| Hot springs | koi stream | bamboo groves and stone lanterns |
| Starlight isle | moon pool | more clouds |

Wider jars have 8 forage spots a day instead of 5.

**Taller jars:** every jar also runs 8 rows north and 8 rows south, with its own trees up and down, plus one more pond: a tide pool (beach), a high frozen lake (snow), a lily stream (flower), a hidden oasis (desert), a river pool (rainforest), a deep glow pool (glade), a mountain spring (hot springs) and a comet pool (starlight isle). The beach's sea runs all the way down.

**Neighbours and wildlife in the meadow:** they each have their own way of moving and their own hours. Tap any of them to chat, pet, play or give a gift. Friendship works like the jar animals': 5 hearts, a daily present at 3, and a plush at 5.

| Who | What they do |
|---|---|
| Nutmeg the squirrel | Dashes from tree to tree and scampers up them |
| Mama Duck, Pip-pip and Puddle | Paddle round the lily pond, the ducklings in a line behind her |
| Rosie the robin | Hops about, flies off if you rush at her, lands somewhere else |
| Willow the deer | West woods, mornings and evenings. Runs off if you move fast; walk slowly to get close |
| Prickles the hedgehog | Night only. Hides when you come near, then peeks out |
| Mittens the cat | Follows you around once you've petted her |
| Hoot the owl | Night only, perched in the west woods |
| Croaky the frog | Hops around the reed pond |
| Captain Shellby (turtle) | Fishes at the reed pond 7am–7pm and tells you what's biting right now, rare fish too |
| Poppy (mole) | Morning garden rounds: waters one of your beds each day, then visits the woods |
| Percy (pelican) | Walks in from the east wall each morning with the mail |
| Iris (cat) | Paints in the west woods in the afternoon, a different scene each day |
| Bo and Bea (bunnies) | Play tag in the east meadow in the afternoon |

The jar animals each have their own behaviour too:
- **Beach:** Pinch scuttles sideways and Sky flies off.
- **Snow:** Pebble belly-slides and Frost stalks and pounces.
- **Flower:** Bumble flits about and Fawn is shy.
- **Desert:** Sahara digs and Humphrey naps.
- **Rainforest:** Tico flies between trees and Mo the sloth barely moves.
- **Mushroom glade:** Puff hides when you come near and Luna circles the pond.
- **Hot springs:** Mochi paddles in the hot spring and Yuki follows you.
- **Starlight isle:** Comet hops and Nova circles the telescope.

The daily visitor strolls around their spot in their own way.

**For testing:** every jar on the shelf is open for now (`PREVIEW_ALL_JARS` in `src/travel.js`). Set it to `false` to make jars cost pebbles again.


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
| Door (far east wall) | The jar shelf: open and visit the other jars |
| Lily pond, reed pond, forest pool | More places to fish in the meadow |
| Tent / your home | Go inside. **Build** inside furnishes the room you're in |
| Bench | **Today**: the daily question (answer, later or skip), mood check-in, the weekly ritual |
| Mailbox | Notes and appreciation cards between you, plus tips |
| Notice board | This week's mission, which you both mark done, and a pinboard of what's coming up |
| Calendar | Plan dates from 160 ideas or your own, both confirm, and add them to your phone's calendar |
| Wishing well | Dreams with stages and steps, and a light you each leave |
| Picnic blanket | Hangout: live chat, a shared drawing pad, a timer and conversation questions |
| Animals | Care, play and explore (43 actions across five species) |
| 📱 Phone | Everything else, as apps. See **The phone** below |

**The phone:** the button at the bottom opens your phone, like in Animal Crossing. Every panel in the game is an app on it, and a red dot means something new. Each app has a **📱 Phone** button to go back, and Escape closes the phone.

| App | What's in it |
|---|---|
| Today | The daily question (answer, later or skip), mood check-in, the weekly ritual |
| Questions | 306 question packs, answered the same sealed way |
| Missions | This week's mission (you both mark it done) and the pinboard |
| Mail | Notes, appreciation cards and gifts |
| Dates | Plan dates from 160 ideas or your own, and add them to your calendar |
| Dreams | Dreams with stages and steps, and the well light |
| Journal · Scrapbook · Discoveries | Your moments together, the scrapbook and the secret places you've found |
| Hangout | Live chat, a drawing pad, a timer and conversation prompts |
| Bag · Collection | Your things, tools and health; fish, bugs, finds, monsters and plants |
| Cooking · DIY · Tools | The kitchen and recipe book; crafting; tool upgrades and geodes |
| Wardrobe · Build · House | Your look; decorate the meadow or furnish the room you're in; house upgrades and rooms |
| Shopping | The beetle shop's seeds, pantry, farm, kitchen tools and furniture |
| Jars · Events | The jar shelf and travel; seasonal events today and coming up |
| Friends | Today's visitor and their request, the merchant, your meadow animals, jar friends' hearts and visitors you know |
| Mine | How deep you've been, zones, bosses beaten, health and gear |
| Settings | Your partner, the jar's name and time zone, reminders, rain, download everything, start over |

Things you do in a place stay in that place: fishing, mining, the garden, foraging, bugs, the shipping crate, visitors' deliveries, the merchant, the jar shops, jar animals and spots, and farm buildings.

**Building your home:**
- **Upgrade the house:** tent → cabin → cottage → cottage with a loft. Upgrades cost pebbles, plus stone and ore from the cave. Each level allows more rooms (1, 2, 4, then 6).
- **Add rooms:** living room, our bedroom (one, from the cabin on), kitchen, study, bathroom, sunroom and loft.
- **Furnish:** 147 pieces in 15 sets: Classic, Cottage, Modern, Cabin, Japanese, Seaside, Fairy, Retro, Study, Kitchen, Bathroom, Playroom, Plants, Lights and Hobbies. Pick a set to browse it. There are also special pieces from shops, visitors, events and the jar animals' plushes. Tap twice to place, then move or return them later; returning gives back the full price.
- **Decorate:** 30 things for the six spots on the back wall (windows, posters, clocks, a wreath, a dreamcatcher, neon signs, hanging plants and more), 8 wallpapers and 6 floors, chosen per room.
- **Furniture you can use:** beds (sleep), wardrobe and dresser (change your look), seats (sit), desk (calendar), bookshelf (journal), chest (bag), record player and piano (music).
- **Saying goodnight:** in the shared bedroom you can each get into the double bed and say goodnight. When you both do on the same day, you each get 15 pebbles, and it's kept in the journal.
- **Shared:** the home belongs to both of you, and you see each other walking around in the same room.

**Farming:**
- **Crops (48):** 12 for each season, including lettuce, potatoes, garlic, tea, wheat, rice, chilies, basil, pineapple, grapes, soybeans, oats, leeks, ginger, cocoa and vanilla. Many regrow after you pick them. The beetle shop sells this season's seeds, and they grow in any season.
- **Garden:** 6 beds to start. Open 3 more, then 3 more after that, in the shop's **Farm** tab. You need pebbles, wood and stone. Tap a locked bed to go straight there.
- **Sprinkler:** waters every bed each morning.
- **Fertilizers:** pick one when you plant. Fertilizer gives an extra crop at every harvest, Speed-gro grows about a third faster, and water-keeping soil waters itself.
- **Farm buildings:** a chicken coop (eggs), goat pen (milk), bee box (honey) and mushroom log (shiitake).
- **Fruit trees:** pear, plum, lemon, mango and banana. They grow for a few days, then give fruit daily.
- **Placing and collecting:** buy buildings and trees in the Farm tab, place them in the meadow from **Build**, and tap them each day to collect.
- **Shared:** the garden, its upgrades and the buildings belong to both of you.

**Cooking:**
- **Where:** the stove or kitchen counter in your home, a campfire decoration outside, or **Cook** in the Bag.
- **Tools (8):** each cooks in two steps, with its own minigame:
  - **Cutting board** (free): chop, then toss
  - **Cooking pot** (free): chop, then simmer
  - **Frying pan:** chop, then flip
  - **Grill:** chop, then turn
  - **Oven:** mix, then bake
  - **Tea kettle:** steep, then pour
  - **Blender:** chop, then blend
  - **Ice cream maker:** churn, then keep it cold
- **Buying tools:** the kitchen tools other than the board and pot are in the shop's **Kitchen** tab. Each is bought once, for both of you.
- **How:** pick a tool and up to 3 ingredients: crops, fish, forage, fruit, farm produce or pantry staples. The **Pantry** tab sells flour, sugar, butter, cheese, oil, eggs and milk.
- **Recipes (142):** some examples:
  - Pot: ramen, risotto, curry, miso soup
  - Pan: pancakes, fried rice, tempura
  - Oven: pizza, apple pie, chocolate cake, quiche
  - Kettle: milk tea, chai, hot cocoa
  - Blender: smoothies and lassis
  - Ice cream maker: ice creams and sorbets
- **Same ingredients, different tools:** the same ingredients can make different dishes with different tools. The kitchen tells you when a dish you already know needs another tool.
- **Recipe book:** shared, and grouped by tool. Undiscovered recipes show a hint like "Oven: flour, an egg, something sweet". Anything else becomes mystery stew.
- **Together:** when your partner is in the jar, you each do one of the tool's two steps, live. You each get the dish, plus an extra star, and it's kept in the journal.
- **Dishes:** eat them to heal in the mine, sell them in the crate, or give them through the mailbox.

**Crafting:**
- **Where:** the workbench, or **Craft** in the Bag.
- **Materials:** wood (2 each time you shake the fruit tree), fiber (from every forage pick and harvest), cloth (made from fiber), plus stone, ore, gems and flowers. The beetle shop also sells wood and fiber.
- **Furniture (10) and lamps (5):** go into your bag as "Made by you". Place them for free from **Build**: home furniture inside the home, meadow pieces outside. Returning one puts it back in your bag.
- **Toys (4):** an animal's panel then has a "Play with a toy" row, which gives a big happiness boost. Toys aren't used up.
- **Outfits:** 4 hats and a cozy sweater, unlocked in the wardrobe once made.
- **Gifts (6):** a bouquet, bracelet, carved heart, flower card, crystal charm or gem ring. Give them from the Bag; your partner opens them in the mailbox, and handmade gifts are kept in the journal.
- **Home (34):** cosy pieces from the furniture sets that you can make instead of buy, such as a teddy bear, rocking horse, tatami mat, ship's wheel, fairy light jar and salt lamp.
- **Outdoor (56):** for the meadow, in six groups:
  - **Paths:** stone, brick, deck, tiles, mosaic, flower beds, stepping stones and clover. You can walk over these.
  - **Fences:** picket, stone wall, hedge, bamboo, iron and rope.
  - **Lights:** lamp post, tiki torch, lantern post, string lights, stone lantern and crystal lamp. These glow at night.
  - **Seats:** benches, a heart bench, log seat, deck chair, picnic table, parasol table, garden swing and hammock. Tap one to sit.
  - **Garden:** planters, birdbath, sundial, scarecrow, wheelbarrow, hay bales, gnome, bird feeder and more.
  - **Fun:** arches, a signpost, your own flag, a windmill, wind chime, fountain, cat statue, totem, sandbox, tent, pumpkin lantern and a wishing stone.
- **Finding a recipe:** the long lists are grouped, with what you can make right now at the top.

**Bug catching:**
- **What:** 27 bugs, including butterflies, moths, bees, beetles, fireflies, glow-worms, dragonflies and crickets. Each has its seasons, time of day, weather and favorite place: flowers, ground, the fruit tree or the pond.
- **Spawns:** four are out at a time. They change every two hours, and both of you see the same ones.
- **Sneaking:** tap a bug to creep up on it slowly, then swing the net when you reach it. A bug gets nervous when you move near it. A yellow mark means careful and red means about to go. Walk normally nearby and it flies off to somewhere else.
- **Collecting:** caught bugs go in the bag (sell them in the crate) and in the **Bugs** tab of the collection log.

**Seasonal events:** each season is one week (Monday to Sunday), and events fall on set days of it. A striped event stand appears in the meadow on event days. Tap it for what's on and what's coming up, and the top bar shows the event's name.
- **Lantern nights (spring, Saturday and Sunday, from 6pm):** paper lanterns float up through the night. Let yours go with a wish. When you both do, you see each other's wish and each get 20 pebbles.
- **Fishing festival (summer, Saturday):** 10 extra bites at the pond. Your best catch is scored by size against the biggest of its kind, plus a bonus for rarer fish. Enter it once at the stand for pebbles, plus a fishing trophy the first time. You see each other's entries, and the higher one gets a 🏆.
- **Meteor showers (summer Wednesday night, autumn Sunday night):** tap shooting stars to catch up to 3 star fragments a night.
- **Mushroom season (autumn, Monday to Friday):** 5 extra mushroom spots a day, including puffballs and the rare glowcap and truffle. Fill a basket of 10 for a mushroom lamp.
- **Snow days (winter, Tuesday and Friday):** deep snow all day. Roll the four parts of a snowman (you can each roll some), and it stands in the meadow until tomorrow. Everyone who helped gets 40 pebbles.
- **Clear skies:** lantern and meteor nights are always clear.
- **Testing:** `#debug` has a **Next event** button that jumps to the next event, at night if it's a night event.

**Shops and visitors:**
- **Rotating furniture:** the beetle shop has four new pieces every morning: two special pieces you can't get from the catalogue, and two catalogue pieces at 20% off. One of each per day. They go in your bag; place them from **Build** inside your home.
- **Traveling merchant:** stops by two days a week on a rug in the meadow. Sells seeds from other seasons (they grow in any season), one merchant-only piece (telescope, aquarium or lucky cat) and two hard-to-find goods, one of each. They also pay double for one thing that day.
- **Visitors:** a different animal visits each day of the week, from eight: Pip, Maple, Bram, Lulu, Juniper, Otis, Fern and Dot. Tap them to chat.
- **Delivery requests:** each visitor asks for something from this season, such as forage, fish, crops, minerals, bugs or materials, and pays pebbles. A **!** shows while it's open. Either of you can deliver it, and it's only open that day.
- **Friendship:** after three deliveries from either of you, a visitor gives each of you a thank-you piece of special furniture.
- **Shared:** you both see the same merchant, visitor, request and stock.

**Other jars:** the door on the right of the meadow opens the jar shelf. You open new jars with pebbles, once for both of you, and travel between them. Each jar keeps to a few things done well: two animals who live there, one shopkeeper with a small stock, and two special spots, plus its own fish, bugs and forage.

| Jar | Price | Lives here | Shop | Special spots |
|---|---|---|---|---|
| Beach | 300 | Pinch the crab, Sky the seagull | Coral the otter's shell shack | Build a sandcastle in three steps · a message in a bottle on the tideline each day |
| Snow | 500 | Pebble the penguin, Frost the arctic fox | Bjorn the polar bear's cocoa cabin | Ice rink · igloo to warm up |
| Flower | 700 | Bumble the bumblebee, Fawn the deer | Mrs. Moss the snail's bloom stall | Flower swing · bouquet table (any 3 flowers make a bouquet) |
| Desert oasis | 900 | Sahara the fennec fox, Humphrey the camel | Kasim the gecko's caravan | 3 treasure marks to dig each day · a sunset dune (best 5–8 pm) |
| Rainforest | 1,200 | Tico the toucan, Mo the sloth | Kiki the monkey's fruit stand | Vine swing · waterfall |
| Mushroom glade | 1,500 | Puff the mushroom sprite, Luna the luna moth | Bramble the toad's apothecary | Bouncy mushroom · fairy ring for a daily wish |
| Hot springs | 1,800 | Mochi the capybara, Yuki the snow monkey | Grandma Tsuru the crane's tea house | Hot spring · steam vent that turns eggs into onsen eggs |
| Starlight isle | 2,500 | Comet the star bunny, Nova the moon moth | Orion the owl's night market | Telescope (12 constellations, one a night) · stargazing bench |

- **Animals:** tap one to pet it, play with it or give it a treat, once each a day. Treats it loves count most.
  - **Friendship:** goes up to 5 hearts, and both of your visits count toward it.
  - **At 3 hearts:** it gives you a little present each day.
  - **At 5 hearts:** you each get a plush of it for your home.
- **Shops:** each sells one piece of furniture you can't get anywhere else, plus a few goods from that jar. Examples are sea salt, saffron, coffee beans, matcha, moon pies and gifts.
  - **The apothecary's tonics:** a healing tonic, a lucky brew (5 extra fishing bites today) and a garden tonic (waters every bed). Use them from the Bag.
- **Spots:** most reward you once a day. Soaking spots (igloo, waterfall, hot spring) restore your health.
- **Doing things together:** when you do something with your partner standing next to you (skating, soaking, the swing, the sunset, the telescope and more), you both get extra. It's kept in the journal as a moment together.
- **Fish:** each jar has 3 of its own, and the first three jars have more.
- **Bugs:** 2 found only in that jar.
- **Weather and time:** each jar has its own weather. The rainforest rains, the glade is misty, and Starlight isle is always night.
- **Recipes:** the new ingredients go into 10 new recipes, including coffee, mocha, matcha latte, yuzu tea, saffron rice and sticky date cake.

**Seasonal events:** each season is one week (Monday to Sunday), and events fall on set days of it. A striped event stand appears in the meadow on event days. Tap it for what's on and what's coming up, and the top bar shows the event's name.
- **Lantern nights (spring, Saturday and Sunday, from 6pm):** paper lanterns float up through the night. Let yours go with a wish. When you both do, you see each other's wish and each get 20 pebbles.
- **Fishing festival (summer, Saturday):** 10 extra bites at the pond. Your best catch is scored by size against the biggest of its kind, plus a bonus for rarer fish. Enter it once at the stand for pebbles, plus a fishing trophy the first time. You see each other's entries, and the higher one gets a 🏆.
- **Meteor showers (summer Wednesday night, autumn Sunday night):** tap shooting stars to catch up to 3 star fragments a night.
- **Mushroom season (autumn, Monday to Friday):** 5 extra mushroom spots a day, including puffballs and the rare glowcap and truffle. Fill a basket of 10 for a mushroom lamp.
- **Snow days (winter, Tuesday and Friday):** deep snow all day. Roll the four parts of a snowman (you can each roll some), and it stands in the meadow until tomorrow. Everyone who helped gets 40 pebbles.
- **Clear skies:** lantern and meteor nights are always clear.
- **Testing:** `#debug` has a **Next event** button that jumps to the next event, at night if it's a night event.

**Shops and visitors:**
- **Rotating furniture:** the beetle shop has four new pieces every morning: two special pieces you can't get from the catalogue, and two catalogue pieces at 20% off. One of each per day. They go in your bag; place them from **Build** inside your home.
- **Traveling merchant:** stops by two days a week on a rug in the meadow. Sells seeds from other seasons (they grow in any season), one merchant-only piece (telescope, aquarium or lucky cat) and two hard-to-find goods, one of each. They also pay double for one thing that day.
- **Visitors:** a different animal visits each day of the week, from eight: Pip, Maple, Bram, Lulu, Juniper, Otis, Fern and Dot. Tap them to chat.
- **Delivery requests:** each visitor asks for something from this season, such as forage, fish, crops, minerals, bugs or materials, and pays pebbles. A **!** shows while it's open. Either of you can deliver it, and it's only open that day.
- **Friendship:** after three deliveries from either of you, a visitor gives each of you a thank-you piece of special furniture.
- **Shared:** you both see the same merchant, visitor, request and stock.

**Other jars:**
- **The door:** on the right of the meadow. It opens the jar shelf, where you open new terrariums with pebbles and travel between them. Opening a jar opens it for both of you.
- **Beach jar (300 pebbles):** always summer. Sea and tide-pool fishing, shells, sea glass, starfish and coral, and a palm tree with coconuts (plus 2 wood).
- **Snow jar (500):** always winter and snowing. Fishing on a frozen lake, icicles and frost lilies.
- **Flower jar (700):** always spring. A koi pond, wild roses, lilies and lavender, and a beehive with honey.
- **What's different:** each jar has its own fish (15 in all), forage (5 new spots a day), 10 fishing bites a day and bugs found nowhere else (5 in all). The weather follows the meadow's, except in the snow jar.
- **Together:** you see each other when you're in the same jar. Building only works in the forest jar.

**The mine:**
- **Ores (11):** coal, copper, tin, iron, silver, gold, cobalt, mythril, obsidian, emberite and starmetal, plus meteorites.
- **Gems (18):** quartz up to diamonds, plus garnet, jade, opal, aquamarine, sapphire, moonstone, onyx, fire opal, sunstone, star sapphire and the very rare prismatic shard.
- **Fossils and artifacts:** 10 fossils and 5 artifacts (old coins, a clay pot, a lost ring, an ancient doll and a star map), different in each zone.
- **Geodes:** 4 kinds. Crack them open at the workbench for a random gem or ore.
- **Special rooms:** layers ending in 5 are a different room each day:
  - **Treasure room:** 3 chests of pebbles and loot.
  - **Mushroom grotto:** cave plants to pick.
  - **Underground lake:** 5 bites a day, with cave fish such as the blind cavefish, ghost shrimp, crystal carp, ice eel, lava eel and void angler.
  - **Monster den:** extra monsters and ore.
- **Monsters (12) and bosses (6):** slimes, grubs, bats, rock crabs (they look like rocks until you get close), crystal sprites, wisps, magma slimes, fire bats, star jellies and void moths. Layers ending in 0 hold the zone's boss: the king slime, stone golem, crystal wyrm, cave yeti, ember golem and star guardian.
- **Fighting:** tap a monster to fight it with your sword. Monsters come at you when you're close. They drop loot to sell, and boss loot is worth a lot. The first time you beat each boss, your max health goes up by 20.
- **Health:** shown in the top bar and on screen in the mine. It refills each morning. Eat dishes, crops, fruit, berries or mushrooms from the Bag to heal. If it runs out you faint and wake up by the cave with half your health, and you keep everything.
- **Tools:** the rod, pickaxe and the new sword each have 7 tiers: Basic, Copper, Iron, Gold, Cobalt, Obsidian and Starmetal. Upgrade them at the workbench with ore.
- **Collection log:** a new **Monsters** tab, plus cave fish, grotto plants and all the new finds.
- **Playing together:** you both get the same cave layout each day. Monsters move separately on each of your screens.

**The rules:**
- **Real time:** the jar follows the real clock, so mornings, nights and new days happen when they do for you.
- **Seasons:** each season lasts one real week.
- **Weather:** changes daily. Rain waters the garden for you.
- **Fish:** 25 kinds. Which ones bite depends on the season, the time of day and the weather. The pond gives 10 bites a day.
- **Garden:** 48 crops. A crop grows one step each day after it's watered, and it never dies if you skip a day.
- **Mine:** 60 layers in 6 zones that each look different: Soil, Stone, Crystal, Frost, Ember and Starfall. Every layer is a small cave with walls and rocks. One plain rock per layer hides the ladder down. Rocks come back every day, and the elevator in the cave takes you to the top of any zone you've reached.
- **Collection log:** tracks every fish, find and crop you've collected, plus your biggest catch of each fish.

**Weather you can feel:** every day has its weather, the same for both of you. The phone's **Weather** app shows today, what's happening right now, tomorrow's forecast and the weather-only fish and bugs. Jars with their own weather (rainforest, glade, hot springs, desert, starlight isle, snow) keep it; the others get the meadow's.
- **Thunderstorms (spring to autumn) and blizzards (winter):** the jar goes dark, the rain comes down sideways and lightning flashes. The wind knocks 4 to 7 branches off the trees (some have an empty bird nest in them). Lightning leaves one piece of lightning glass where it struck. People stay indoors, and the birds and butterflies shelter. Storms water the garden like rain. The thunderfin and the storm beetle only come out in storms.
- **Rain and puddles:** puddles appear on rainy days and stay until 11 the next morning. Walk through one to splash (with a heart if your partner is close). Some hide a shiny pebble.
- **Rainbows:** half the rainy days and every storm clear up in the afternoon, and a rainbow comes out for two hours. Find the pot at the rainbow's end for a rainbow shard and 100 pebbles.
- **Sunshowers (spring and summer):** a short shower while the sun shines, then a rainbow.
- **Windy days:** leaves blow across the jar all day. Tap the glinting ones to catch them, up to 12 a day; one in twelve is a golden leaf. The kite moth and the breeze minnow only come out when it's windy.
- **Heatwaves (summer):** heat shimmer and a warm sky. Everyone moves slowly, and the golden carp and heat cicada come out.
- **Frosty mornings (winter, clear days, 5 to 10am):** frost glints on the grass and frost flowers grow, to pick before they melt.
- **Crafts from the weather:** branch fence, twig arch, storm lantern, rainbow arch, leaf pile, golden leaf lamp, frost lamp, shiny pebble path, bird nest box and weathervane.
- **Testing:** with `#debug` on the address, the **Next weather** button jumps to each kind of weather in turn.

**The museum:** a white building in the north hills of the meadow, run by Hazel the curator. Give it one of everything: fish, bugs, minerals and gems, fossils and artifacts (551 spots in all). The collection is shared, so either of you can fill a spot, and each spot shows who gave it. Tap the museum to give things; the phone's **Museum** app lets you look around from anywhere.
- **Wings:** Aquarium, Insect hall, Minerals and gems, Fossil hall and Artifacts. When a wing is a quarter, half, three quarters and all the way full, you each collect a thank-you: pebbles, plus a piece of museum furniture at half (a fish model, bug case, gem display, little dino skeleton, artifact pedestal) and at full (a grand aquarium, butterfly cabinet, giant crystal cluster, T. rex skull display, ancient vase).
- **Fossils:** 132 prehistoric animals and plants in seven eras (dinosaurs, ancient seas, the ice age, ancient jungles, first life, ancient plants and amber), 375 pieces in all. 97 of them come in 2 to 5 pieces (a T. rex has a skull, ribcage, tail, legs and arms); the rest are found whole. Each one is found in particular places: dinosaurs in the desert and meadow, sea reptiles at the beach, mammoths in the snow, amber in the rainforest, and so on.
- **Digging:** three cracks appear in the meadow and two in every jar each day. Buy a **dig kit** (150 pebbles) at the museum, then tap a crack to dig. It's a little excavation game: brush the dirt away one layer at a time, or use the hammer to clear more at once, but the hammer cracks the fossil if it hits bare bone. A perfect dig earns 25 pebbles, a good one 10. The **expert dig kit** (1500 pebbles) gives more energy and shows where the fossil lies. A third of the time you dig up a piece the museum is still missing. Fossil rocks in the mine hold pieces too.
- **Relics:** one dig in five turns up a relic instead: 32 old things like a pirate coin, a jade mask, a bone flute or a moon compass, each from its own place, for the artifact wing.
- **Piecing skeletons together:** once every piece of an animal is in, put it together at the museum. One spot on the skeleton glows at a time; pick the piece that goes there. It's then on display for you both, with 60 pebbles per piece for whoever put it together.
- **Fossil swap:** Hazel swaps 3 spare pieces (ones already on display) for one the museum is missing.

## Code

| File | What it does |
|---|---|
| `src/data.js` | All content: fish, crops, forage, minerals, tools, avatar options. Add a row to add content |
| `src/rules.js` | Game rules (bag, garden, fishing, mine layers, monsters and health, shop, crate, upgrades, new day). No drawing code, so it's tested and can move to the server later |
| `src/world.js` | The jar's layout: tile grid and where each object sits |
| `src/clock.js` | Day numbers, seasons, weather, time of day |
| `src/fossils.js` | Fossils: every animal and its pieces, relics, dig sites, the dig kit, the excavation game |
| `src/museum.js` | Museum rules: wings, giving, milestones, skeletons, the fossil swap |
| `src/museum-ui.js` | The museum's panels, the excavation game and piecing skeletons together |
| `src/museum-art.js` | Placeholder art: the museum, dig sites, skeletons drawn from each body plan |
| `src/weather.js` | Weather rules: storms, wind, heatwaves, puddles, rainbows, sunshowers, frost, and what you find |
| `src/weather-life.js` | The weather in the meadow and jars: today's spots, leaves on the wind, lightning, splashing |
| `src/rng.js` | Seeded randomness, so a day's forage, weather and mine layers are the same on every device |
| `src/path.js` | Walking routes on the tile grid |
| `src/sprites.js` | Placeholder pixel art drawn in code, and loading of real PNG art |
| `src/avatar.js` | The layered player avatar |
| `src/scene.js` | Draws the jar, the other jars, the mine, weather, night and the fishing minigame |
| `src/ui.js` | Panels: bag, log, shop, crate, workbench, mailbox, wardrobe |
| `src/main.js` | Game loop, tapping, walking, fishing, mining, building and your partner's live avatar |
| `src/cloud.js` | Shared storage on claude.ai, with a device-only stand-in elsewhere |
| `src/shared.js` | Live shared state: the jar, people, garden, sealed answers, discoveries, rain |
| `src/content.js` | Loads `content/` and picks the day's question and the week's mission |
| `src/together.js` | Today, check-ins, rituals, notice board, mailbox, calendar, dreams, journal |
| `src/places.js` | Build mode, animal care and settings |
| `src/home.js` | Your home: house levels, room types, furniture, wall items, wallpapers, floors and placement rules |
| `src/home-ui.js` | Home panels: upgrade, rooms, furnishing, walls, wallpaper and floors |
| `src/cooking.js` | Kitchen tools and their steps, 142 recipes, ingredient kinds, matching and star ratings |
| `src/kitchen.js` | The kitchen: picking a tool and ingredients, the five minigames, cooking together |
| `src/crafting.js` | Crafting recipes, materials, and crafted furniture, toys, outfits and gifts |
| `src/crafting-ui.js` | The crafting panel |
| `src/maps.js` | The other jars: layouts, their fish, forage and daily state |
| `src/travel.js` | The jar shelf: opening and travelling between jars |
| `src/visitors.js` | The traveling merchant, visitors, delivery requests and the rotating furniture stock |
| `src/visitors-ui.js` | Their panels |
| `src/events.js` | Seasonal events: the calendar, mushrooms, festival scoring, meteors and the snowman |
| `src/events-ui.js` | The event stand and each event's panel |
| `src/mine-data.js` | The mine's zones, rocks, ores, gems, fossils, artifacts, geodes, cave fish, grotto plants and monsters |
| `src/farm-data.js` | New crops, farm buildings, fruit trees, fertilizers, pantry staples and garden upgrades |
| `src/farm.js` | Farm rules: collecting from buildings and trees, opening beds, the sprinkler |
| `src/biomes.js` | The jars' animals, shopkeepers and special spots, the five newer jars, and their rules |
| `src/jar-life.js` | Panels for the animals, jar shops and spots, and the animals wandering |
| `src/furniture-data.js` | The furniture sets and wall items, each drawn from a shape and two colours |
| `src/outdoor-data.js` | Outdoor crafts and the craftable home pieces |
| `src/phone.js` | The phone: every panel as an app, plus the Friends and Mine apps |
| `src/behaviors.js` | How animals and people move: scuttling, hopping, flying, shy, following, napping, sliding, digging, pouncing, hiding, swimming, climbing, tag, sitting and daily routines |
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
