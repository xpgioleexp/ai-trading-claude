// The big catalogue: dozens more furniture sets, pieces for the walls,
// wallpapers and floors in every pattern, and lots more for outside. Each
// piece is drawn from a shape (form) and its set's colours, so a set is just
// a palette and a list of "role Name" entries.
import { FURNITURE, FURNITURE_BY_TYPE, WALL_ITEMS, WALL_BY_TYPE, WALLPAPERS, WALLPAPER_BY_ID, FLOORS, FLOOR_BY_ID } from './home.js';
import { FURNITURE_SETS } from './furniture-data.js';
import { OUTDOOR_BY_TYPE, addOutdoor } from './outdoor-data.js';
import { CRAFTS, CRAFT_BY_ID } from './crafting.js';
import { ITEMS } from './data.js';

// role: [form, w, h, use, price, colours]. colours: M main+accent, W wood+main, A accent+main.
const ROLES = {
  bed: ['bed', 2, 2, 'sleep', 160, 'M'], single: ['bed', 1, 2, 'sleep', 110, 'M'], bunk: ['bunk', 1, 2, 'sleep', 150, 'W'],
  futon: ['futon', 2, 2, 'sleep', 120, 'M'], canopy: ['canopy', 2, 2, 'sleep', 260, 'M'], cradle: ['cradle', 1, 1, null, 70, 'W'],
  sofa: ['sofa', 2, 1, 'sit', 140, 'M'], armchair: ['armchair', 1, 1, 'sit', 80, 'M'], chair: ['chair', 1, 1, 'sit', 45, 'W'],
  stool: ['stool', 1, 1, 'sit', 20, 'W'], beanbag: ['beanbag', 1, 1, 'sit', 50, 'A'], cushion: ['cushion', 1, 1, 'sit', 20, 'A'],
  throne: ['throne', 1, 1, 'sit', 220, 'M'], swing: ['hanging_chair', 1, 1, 'sit', 130, 'M'], bench: ['bench', 2, 1, 'sit', 70, 'W'],
  table: ['table', 2, 1, null, 80, 'W'], round: ['round_table', 1, 1, null, 60, 'W'], low: ['low_table', 1, 1, null, 50, 'W'],
  desk: ['desk', 2, 1, 'calendar', 100, 'W'], counter: ['counter', 1, 1, null, 70, 'W'], kotatsu: ['kotatsu', 2, 1, 'sit', 120, 'M'],
  shelf: ['shelf', 1, 1, 'journal', 80, 'W'], lowshelf: ['low_shelf', 2, 1, null, 60, 'W'], cabinet: ['cabinet', 2, 1, 'wardrobe', 90, 'W'],
  wardrobe: ['tall_cabinet', 1, 1, 'wardrobe', 100, 'W'], chest: ['chest', 1, 1, null, 55, 'W'], books: ['bookstack', 1, 1, 'journal', 25, 'A'],
  lamp: ['lamp', 1, 1, null, 40, 'A'], tlamp: ['table_lamp', 1, 1, null, 30, 'A'], lava: ['lava_lamp', 1, 1, null, 45, 'A'],
  lantern: ['lantern', 1, 1, null, 35, 'A'], candles: ['candles', 1, 1, null, 20, 'A'], saltlamp: ['salt_lamp', 1, 1, null, 40, 'A'],
  jarlamp: ['jar_lamp', 1, 1, null, 35, 'A'], plant: ['plant', 1, 1, null, 25, 'M'], tallplant: ['tall_plant', 1, 1, null, 45, 'M'],
  cactus: ['cactus_pot', 1, 1, null, 25, 'M'], succulents: ['succulents', 1, 1, null, 30, 'M'], flowers: ['flower_box', 1, 1, null, 35, 'A'],
  vase: ['vase', 1, 1, null, 30, 'A'], rug: ['rug', 3, 1, null, 50, 'M'], roundrug: ['round_rug', 2, 2, null, 55, 'A'],
  mat: ['mat', 1, 1, null, 15, 'A'], tatami: ['tatami', 2, 1, null, 40, 'M'], tv: ['tv', 2, 1, null, 180, 'W'],
  speaker: ['speaker', 1, 1, 'music', 60, 'M'], computer: ['computer', 1, 1, null, 150, 'M'], fridge: ['fridge', 1, 1, 'cook', 130, 'M'],
  stove: ['stove', 1, 1, 'cook', 120, 'M'], washer: ['washer', 1, 1, null, 110, 'M'], machine: ['machine', 1, 1, null, 90, 'M'],
  tub: ['tub', 2, 1, null, 140, 'M'], vanity: ['vanity', 1, 1, 'wardrobe', 90, 'W'], rack: ['rack', 1, 1, null, 35, 'W'],
  basket: ['basket', 1, 1, null, 20, 'A'], teddy: ['teddy', 1, 1, null, 40, 'A'], blocks: ['blocks', 1, 1, null, 25, 'A'],
  horse: ['rocking_horse', 1, 1, 'sit', 90, 'M'], duck: ['duck', 1, 1, null, 15, 'A'], ballpit: ['ball_pit', 2, 1, null, 120, 'A'],
  tent: ['tent', 2, 1, null, 110, 'M'], guitar: ['guitar', 1, 1, 'music', 90, 'W'], drums: ['drums', 2, 1, 'music', 200, 'M'],
  harp: ['harp', 1, 1, 'music', 260, 'W'], piano: ['upright_piano', 2, 1, 'music', 320, 'W'], sewing: ['sewing', 1, 1, null, 90, 'M'],
  pottery: ['pottery', 1, 1, null, 90, 'W'], board: ['board', 1, 1, 'calendar', 40, 'W'], cart: ['cart', 1, 1, null, 70, 'W'],
  ladder: ['ladder', 1, 1, null, 40, 'W'], coatrack: ['coat_rack', 1, 1, null, 35, 'W'], firewood: ['firewood', 1, 1, null, 40, 'W'],
  wheel: ['wheel', 1, 1, null, 90, 'W'], mushroom: ['mushroom', 1, 1, 'sit', 35, 'M'], phone: ['phone', 1, 1, null, 45, 'M'],
  lighthouse: ['lighthouse', 1, 1, null, 60, 'M'], train: ['train', 2, 1, 'train', 90, 'M'], screen: ['screen', 2, 1, null, 70, 'W'],
  arcade: ['arcade', 1, 1, null, 240, 'M'], pillar: ['pillar', 1, 1, null, 90, 'M'], statue: ['statue', 1, 1, null, 150, 'M'],
  tank: ['fishtank', 2, 1, null, 180, 'W'], gramophone: ['gramophone', 1, 1, 'music', 140, 'W'], vending: ['vending', 1, 1, null, 200, 'M'],
  easel: ['easel', 1, 1, null, 70, 'W'], clock: ['grandfather', 1, 1, null, 160, 'W'], fountain: ['fountain_in', 1, 1, null, 170, 'M'],
  mirror: ['mirror', 1, 1, 'wardrobe', 60, 'W'], globe: ['globe_stand', 1, 1, null, 90, 'A'], telescope: ['telescope_stand', 1, 1, null, 140, 'M'], dollhouse: ['dollhouse', 1, 1, null, 110, 'M'],
};

// Wall pieces: role: [form, price, colours].
const WALL_ROLES = {
  window: ['window', 55, 'W'], roundwin: ['round_window', 50, 'W'], frame: ['frame', 30, 'M'], frames: ['frames', 40, 'W'],
  cuckoo: ['cuckoo', 60, 'W'], clock: ['clock', 35, 'M'], wreath: ['wreath', 30, 'M'], dream: ['dreamcatcher', 25, 'A'],
  hanging: ['hanging', 30, 'M'], hlantern: ['hanging_lantern', 35, 'A'], neon: ['neon', 70, 'M'], board: ['board', 30, 'W'],
  plantshelf: ['plant_shelf', 40, 'W'], hoop: ['hoop', 25, 'W'], tapestry: ['tapestry', 50, 'M'], banner: ['banner', 35, 'M'],
  sconce: ['sconce', 40, 'A'], wallshelf: ['wall_shelf', 45, 'W'], fish: ['mounted_fish', 60, 'W'], mosaic: ['mosaic', 55, 'M'],
  quilt: ['quilt', 45, 'M'], lights: ['string_lights', 35, 'M'],
};

// What it takes to make each kind of piece at the workbench.
const CRAFT_NEEDS = {
  chair: { wood: 3 }, stool: { wood: 2 }, bench: { wood: 5 }, table: { wood: 6 }, round: { wood: 4 }, low: { wood: 3 },
  desk: { wood: 6, iron_ore: 1 }, shelf: { wood: 5 }, lowshelf: { wood: 4 }, cabinet: { wood: 7 }, wardrobe: { wood: 8 },
  chest: { wood: 4, iron_ore: 1 }, books: { fiber: 3 }, basket: { fiber: 4 }, firewood: { wood: 6 }, ladder: { wood: 4 },
  coatrack: { wood: 3 }, rack: { wood: 2, fiber: 1 }, cushion: { cloth: 2 }, mat: { fiber: 3 }, rug: { fiber: 6 },
  roundrug: { fiber: 5, cloth: 1 }, tatami: { fiber: 8 }, candles: { fiber: 2, honey: 1 }, vase: { stone: 2 }, plant: { fiber: 3 },
  tallplant: { fiber: 4, wood: 1 }, flowers: { wood: 2, '#flower': 2 }, lantern: { wood: 1, quartz: 1 }, teddy: { cloth: 3, fiber: 2 },
  blocks: { wood: 3 }, cradle: { wood: 5, cloth: 1 }, armchair: { wood: 3, cloth: 3 }, sofa: { wood: 4, cloth: 5 },
  bed: { wood: 8, cloth: 4 }, single: { wood: 5, cloth: 3 }, futon: { cloth: 6, fiber: 2 }, easel: { wood: 4 }, beanbag: { cloth: 4, fiber: 2 },
  mushroom: { wood: 2, fiber: 2 }, duck: { fiber: 2 }, horse: { wood: 6, cloth: 1 }, cart: { wood: 4, iron_ore: 1 }, screen: { wood: 4, cloth: 3 },
};

// [set, main, accent, wood, furniture, wall]
const SETS = [
  ['Strawberry café', '#E0707A', '#F7E8E0', '#B88D60',
    'round Strawberry café table|chair Heart-back café chair|counter Pastry counter|fridge Cake fridge|stool Strawberry stool|tlamp Berry lamp|vase Strawberry vase|sofa Strawberry booth|flowers Strawberry planter|rug Gingham rug|shelf Teacup shelf|vending Milk tea machine|cushion Strawberry cushion|machine Coffee machine',
    'frame Strawberry poster|clock Strawberry clock|lights Berry string lights|banner Café banner'],
  ['Mint dream', '#9DD3BE', '#F2F7F2', '#E9E3D6',
    'bed Mint dream bed|sofa Mint sofa|armchair Mint armchair|low Mint coffee table|lamp Mint floor lamp|shelf Mint shelf|wardrobe Mint wardrobe|rug Mint rug|plant Mint pot|desk Mint desk|chair Mint chair|vanity Mint vanity|beanbag Mint beanbag|tlamp Mint table lamp',
    'frame Mint print|mosaic Mint tiles art|clock Mint clock|sconce Mint wall light'],
  ['Lavender fields', '#B9A0D9', '#F2EAF7', '#9C82C9',
    'bed Lavender bed|armchair Lavender armchair|sofa Lavender loveseat|vase Lavender bunch|flowers Lavender box|table Lavender table|chair Lavender chair|rug Lavender rug|candles Lavender candles|wardrobe Lavender wardrobe|lamp Lavender lamp|cushion Lavender cushion|swing Lavender swing chair|books Lavender books',
    'wreath Lavender wreath|frame Lavender field painting|quilt Lavender quilt|hanging Dried lavender'],
  ['Honey bee', '#E8B83A', '#3A3020', '#C9A272',
    'sofa Honeycomb sofa|armchair Bumble armchair|round Hexagon table|shelf Honey jar shelf|lamp Hive lamp|jarlamp Honey jar lamp|rug Honeycomb rug|stool Bee stool|cushion Bee cushion|bed Honeycomb bed|counter Honey counter|plant Clover pot|flowers Wildflower box|chest Honey chest',
    'mosaic Honeycomb tiles|frame Bee poster|clock Sunflower clock|banner Bee banner'],
  ['Cat café', '#E8C29A', '#7A5A40', '#B88D60',
    'beanbag Cat bed cushion|chair Cat ear chair|round Paw print table|shelf Cat tree shelf|tlamp Cat lamp|counter Cat café counter|sofa Kitten sofa|basket Cat basket|stool Fish stool|rug Paw rug|teddy Cat plush|vase Fish vase|plant Cat grass|cushion Paw cushion',
    'frame Cat portrait|clock Cat clock|wallshelf Cat walk shelf|neon Cat sign'],
  ['Puppy palace', '#C9A272', '#5F9FB5', '#9C7046',
    'bed Bone bed|sofa Puppy sofa|beanbag Dog bed|chair Paw chair|round Bone table|chest Toy chest|basket Ball basket|lamp Doghouse lamp|rug Bone rug|shelf Treat shelf|teddy Puppy plush|stool Paw stool|duck Squeaky duck|cushion Dog cushion',
    'frame Good dog poster|clock Bone clock|board Walk schedule|banner Puppy banner'],
  ['Bunny burrow', '#F2EDE4', '#E8A0B0', '#B88D60',
    'bed Bunny bed|armchair Bunny ear armchair|beanbag Carrot beanbag|round Burrow table|stool Carrot stool|lamp Moon bunny lamp|rug Clover rug|basket Carrot basket|teddy Bunny plush|plant Carrot pot|shelf Burrow shelf|cushion Bunny cushion|vase Clover vase|chest Burrow chest',
    'frame Bunny print|clock Carrot clock|wreath Carrot wreath|dream Bunny dreamcatcher'],
  ['Frog pond', '#7FAF5B', '#5FA8C9', '#6F925B',
    'sofa Lily pad sofa|beanbag Frog beanbag|stool Toadstool|round Lily pad table|lamp Firefly lamp|rug Pond rug|tank Tadpole tank|plant Reed pot|tallplant Cattails|bed Lily bed|teddy Frog plush|cushion Lily cushion|fountain Frog fountain|vase Lotus vase',
    'frame Frog poster|fish Mounted carp|clock Lily clock|mosaic Pond mosaic'],
  ['Woodland critters', '#9C7046', '#E07A3A', '#7A5A3A',
    'bed Log bed|armchair Fox armchair|stool Acorn stool|round Stump table|shelf Acorn shelf|lamp Owl lamp|rug Leaf rug|chest Squirrel chest|teddy Fox plush|plant Fern pot|sofa Moss sofa|mushroom Toadstool seat|firewood Log pile|lantern Woodland lantern',
    'wreath Pinecone wreath|frame Forest painting|cuckoo Owl cuckoo clock|tapestry Woodland tapestry'],
  ['Mushroom cottage', '#D9533C', '#F2EDE4', '#9C7046',
    'bed Mushroom bed|mushroom Toadstool stool|round Mushroom table|lamp Mushroom lamp|shelf Mushroom shelf|wardrobe Mushroom wardrobe|rug Spotted rug|armchair Cap armchair|tlamp Little mushroom lamp|plant Moss pot|chest Mushroom chest|sofa Spotted sofa|vase Spore vase|stove Mushroom stove',
    'frame Mushroom print|clock Toadstool clock|hanging Hanging mushrooms|wreath Moss wreath'],
  ['Seashell cove', '#F2D6C9', '#79AAA4', '#E9D7A8',
    'bed Seashell bed|armchair Clam chair|round Coral table|vase Shell vase|lamp Pearl lamp|rug Sand rug|tank Reef tank|shelf Driftwood shelf|chest Treasure chest|plant Sea grass pot|sofa Wave sofa|lighthouse Little lighthouse|cushion Starfish cushion|jarlamp Pearl jar',
    'roundwin Porthole|fish Mounted swordfish|frame Shell print|hanging Shell chime'],
  ['Pirate ship', '#7A5A3A', '#D9533C', '#5A4130',
    'bed Hammock bunk|chest Pirate chest|wheel Ship wheel|table Captain\'s table|chair Barrel stool|lantern Ship lantern|globe Treasure globe|rug Map rug|shelf Rum barrel rack|telescope Brass spyglass|cabinet Captain\'s cabinet|throne Captain\'s chair|cart Cannon cart|stool Rope stool',
    'banner Jolly flag|roundwin Ship porthole|frame Treasure map|clock Ship clock'],
  ['Under the sea', '#3F7F95', '#F0A55A', '#5F9FB5',
    'bed Coral reef bed|beanbag Jellyfish beanbag|round Clam table|lamp Anglerfish lamp|tank Big aquarium|rug Kelp rug|plant Coral pot|tallplant Kelp tower|sofa Whale sofa|chest Sunken chest|statue Mermaid statue|cushion Pufferfish cushion|stool Sea urchin stool|fountain Bubble fountain',
    'fish Mounted tuna|roundwin Submarine window|mosaic Fish mosaic|lights Bubble lights'],
  ['Tropical tiki', '#B88D60', '#E07A3A', '#9C7046',
    'sofa Bamboo sofa|armchair Rattan chair|round Tiki table|counter Tiki bar|lamp Tiki torch lamp|tallplant Potted palm|rug Palm rug|stool Coconut stool|swing Rattan egg chair|statue Tiki statue|vase Pineapple vase|bed Bamboo bed|plant Monstera|speaker Tiki speaker',
    'banner Surf banner|frame Sunset poster|hanging Shell garland|lights Tiki lights'],
  ['Desert adobe', '#D9A272', '#5FA8A0', '#B5653A',
    'bed Adobe bed|sofa Woven sofa|round Clay table|vase Clay pot|cactus Barrel cactus|succulents Desert succulents|rug Kilim rug|lantern Tin lantern|chest Painted chest|stool Clay stool|lowshelf Adobe shelf|armchair Leather chair|candles Desert candles|pottery Potter\'s wheel',
    'tapestry Woven blanket|dream Desert dreamcatcher|mosaic Tile mosaic|frame Mesa painting'],
  ['Ski lodge', '#B5324A', '#F2F4F6', '#7A5A3A',
    'bed Chalet bed|sofa Fireside sofa|armchair Fur armchair|low Lodge table|firewood Firewood stack|lamp Antler lamp|rug Fur rug|chest Ski chest|coatrack Ski rack|shelf Lodge shelf|stool Log stool|cushion Knit cushion|lantern Snow lantern|tv Lodge TV',
    'frame Mountain poster|clock Lodge clock|wreath Pine wreath|quilt Knit blanket'],
  ['Winter wonderland', '#DCEFF6', '#9FC3D0', '#F2F4F6',
    'bed Snowflake bed|sofa Ice sofa|armchair Frost armchair|round Ice table|lamp Icicle lamp|tallplant Snowy pine|rug Snow rug|statue Snowman statue|chest Ice chest|cushion Snowball cushion|vase Frost vase|jarlamp Snow globe lamp|stool Ice stool|throne Ice throne',
    'wreath Snow wreath|lights Icicle lights|frame Snow poster|clock Snowflake clock'],
  ['Spring blossom', '#F2C4C8', '#7FAF5B', '#E9D7A8',
    'bed Blossom bed|sofa Petal sofa|armchair Blossom armchair|round Garden table|vase Cherry vase|flowers Tulip box|tallplant Blossom tree|rug Petal rug|lamp Blossom lamp|chair Garden chair|swing Blossom swing|cushion Petal cushion|shelf Seed shelf|basket Picnic basket',
    'wreath Blossom wreath|frame Blossom painting|lights Petal lights|hanging Paper blossoms'],
  ['Summer picnic', '#E0707A', '#F2EDE4', '#B88D60',
    'table Picnic table|bench Picnic bench|basket Picnic basket|cushion Picnic cushion|rug Gingham blanket|stool Melon stool|counter Lemonade stand|tlamp Lemon lamp|vase Daisy vase|sofa Deck sofa|plant Sunflower pot|chair Folding chair|fridge Cool box|speaker Picnic radio',
    'banner Picnic bunting|frame Beach poster|lights Summer lights|clock Sun clock'],
  ['Autumn harvest', '#E0873A', '#8A3A2A', '#9C7046',
    'table Harvest table|bench Harvest bench|armchair Plaid armchair|sofa Harvest sofa|basket Apple basket|vase Wheat vase|candles Spiced candles|rug Maple rug|lamp Pumpkin lamp|chest Root chest|cart Apple cart|firewood Kindling pile|plant Mum pot|stool Hay stool',
    'wreath Harvest wreath|frame Orchard painting|quilt Patchwork quilt|banner Harvest banner'],
  ['Halloween night', '#3A2E40', '#E0873A', '#2A2A30',
    'bed Coffin bed|armchair Bat armchair|round Cauldron table|lamp Jack-o-lantern lamp|candles Spooky candles|rug Spider rug|shelf Potion shelf|chest Spooky chest|statue Gargoyle|clock Haunted clock|sofa Velvet sofa|tallplant Dead tree|mirror Spooky mirror|cushion Pumpkin cushion',
    'frame Haunted portrait|lights Spooky lights|banner Bat banner|wreath Spooky wreath'],
  ['Festive holiday', '#B5324A', '#4F8A4A', '#F2EDE4',
    'tallplant Holiday tree|sofa Cosy holiday sofa|armchair Velvet armchair|low Cookie table|candles Holiday candles|rug Holiday rug|chest Present pile|lamp Candy cane lamp|stool Gift stool|train Holiday train|teddy Reindeer plush|cushion Star cushion|vase Poinsettia|fridge Eggnog fridge',
    'wreath Holiday wreath|lights Holiday lights|banner Joy banner|clock Holiday clock'],
  ['Red lantern', '#C9283A', '#E8C25A', '#7A2A2A',
    'table Red lacquer table|chair Lacquer chair|lantern Red lantern|screen Folding screen|vase Plum blossom vase|rug Cloud rug|cabinet Lacquer cabinet|lamp Lantern lamp|statue Lion statue|stool Drum stool|tallplant Plum tree|sofa Silk sofa|bed Silk bed|cushion Silk cushion',
    'hlantern Hanging red lantern|banner Good luck banner|frame Ink painting|tapestry Silk scroll'],
  ['Zen retreat', '#C9C27A', '#5E7A4A', '#9C8A6A',
    'futon Zen futon|tatami Tatami mat|low Tea table|cushion Zen cushion|lantern Paper lantern|plant Bonsai|screen Paper screen|fountain Bamboo fountain|candles Incense|lowshelf Low shelf|vase Ikebana vase|succulents Stone garden|statue Stone lantern|tallplant Bamboo pot',
    'frame Calligraphy scroll|hanging Wind bell|tapestry Mountain scroll|wallshelf Tea shelf'],
  ['Spa day', '#F2EDE4', '#9FC9C0', '#C9C2B5',
    'tub Spa tub|vanity Spa vanity|rack Towel rack|plant Eucalyptus pot|candles Spa candles|rug Pebble rug|basket Towel basket|lamp Salt lamp|fountain Pebble fountain|stool Bamboo stool|shelf Lotion shelf|saltlamp Pink salt lamp|beanbag Massage cushion|vase Orchid vase',
    'mosaic Pebble mosaic|frame Lotus print|sconce Spa light|wallshelf Oil shelf'],
  ['Greenhouse', '#7FAF5B', '#F2F4F6', '#5E7A4A',
    'tallplant Fiddle fig|plant Pothos|cactus Cactus pot|succulents Succulent tray|flowers Seedling tray|shelf Plant shelf|table Potting table|lamp Grow lamp|chair Garden chair|basket Tool basket|rack Watering rack|bench Potting bench|vase Fern vase|fountain Mist fountain',
    'plantshelf Hanging planters|frame Botanical print|hanging Hanging fern|wallshelf Herb shelf'],
  ['Grand library', '#7A3A2A', '#E8C25A', '#5A4130',
    'shelf Tall bookcase|books Book pile|desk Reading desk|armchair Wingback chair|lamp Reading lamp|globe Old globe|ladder Library ladder|rug Library rug|clock Library clock|tlamp Green banker lamp|chair Library chair|chest Map chest|sofa Chesterfield sofa|statue Bust statue',
    'frame Old map|clock Library wall clock|wallshelf Book ledge|tapestry Library tapestry'],
  ['Bakery', '#E9C9A0', '#B5653A', '#C9A272',
    'counter Bread counter|stove Bread oven|table Baker\'s table|shelf Bread shelf|basket Bread basket|stool Baker\'s stool|fridge Cream fridge|vase Wheat vase|cart Pastry cart|lamp Bakery lamp|machine Mixer|chair Café chair|rug Flour rug|round Cake stand',
    'banner Bakery sign|board Today\'s menu|clock Bakery clock|wallshelf Jar shelf'],
  ['Retro diner', '#D9533C', '#F2F4F6', '#79AAA4',
    'sofa Diner booth|table Diner table|stool Diner stool|counter Diner counter|fridge Milkshake fridge|machine Soda fountain|tv Retro TV|speaker Jukebox speaker|lamp Neon lamp|rug Checker rug|vending Soda machine|chair Chrome chair|phone Retro phone|round Chrome table',
    'neon Diner sign|clock Diner clock|frame Burger poster|lights Neon lights'],
  ['Arcade', '#3F4F7A', '#E8607A', '#2A2A40',
    'arcade Space arcade|arcade Racing arcade|arcade Puzzle arcade|vending Prize machine|beanbag Gamer beanbag|tv Big screen|speaker Arcade speaker|rug Pixel rug|lava Neon lava lamp|stool Arcade stool|counter Token counter|sofa Gamer sofa|computer Gaming computer|machine Claw machine',
    'neon Game over sign|frame Pixel poster|lights Neon strip|clock Pixel clock'],
  ['Space station', '#E9F2F6', '#5A7AF0', '#9AA4B0',
    'bed Sleep pod|chair Captain\'s chair|desk Control desk|computer Mission computer|lamp Orbit lamp|globe Planet globe|telescope Star telescope|rug Galaxy rug|fridge Space fridge|lava Nebula lamp|statue Astronaut statue|shelf Space shelf|beanbag Moon beanbag|vending Space snacks',
    'roundwin Space window|frame Galaxy poster|neon Rocket sign|clock Planet clock'],
  ['Starlight observatory', '#2A2A50', '#E8C25A', '#3F4A6A',
    'telescope Grand telescope|globe Star globe|desk Astronomer\'s desk|bed Starry bed|armchair Night armchair|lamp Star lamp|rug Constellation rug|shelf Star chart shelf|chair Night chair|candles Star candles|jarlamp Firefly jar|clock Moon clock|books Star books|swing Moon swing',
    'frame Star chart|neon Moon sign|lights Star lights|roundwin Dome window'],
  ['Cloud kingdom', '#F2F4F6', '#B9DDE6', '#DCE6F2',
    'bed Cloud bed|sofa Cloud sofa|beanbag Cloud beanbag|round Cloud table|lamp Rainbow lamp|rug Sky rug|cushion Cloud cushion|swing Cloud swing|statue Angel statue|vase Sky vase|throne Cloud throne|pillar Sky pillar|fountain Rainbow fountain|stool Puff stool',
    'frame Rainbow print|lights Rainbow lights|neon Rainbow sign|clock Sky clock'],
  ['Royal palace', '#9C2A4A', '#E8C25A', '#F2EDE4',
    'canopy Royal canopy bed|throne Royal throne|table Banquet table|chair Royal chair|pillar Marble pillar|statue Marble statue|rug Royal rug|lamp Gold candelabra|cabinet Royal cabinet|clock Royal clock|sofa Velvet chaise|vase Royal vase|fountain Palace fountain|chest Crown chest',
    'frame Royal portrait|banner Royal banner|tapestry Palace tapestry|sconce Gold sconce'],
  ['Fairy tale castle', '#C9A0E8', '#F2C4C8', '#B9B4A8',
    'canopy Princess bed|throne Castle throne|vanity Magic mirror vanity|wardrobe Gown wardrobe|lamp Tower lamp|rug Castle rug|chest Glass slipper chest|pillar Castle pillar|swing Tower swing|dollhouse Tiny castle|cushion Crown cushion|vase Rose vase|clock Midnight clock|harp Castle harp',
    'banner Castle banner|frame Fairy tale painting|roundwin Tower window|hanging Star mobile'],
  ['Wizard tower', '#3F2A5A', '#7FD0E0', '#5A4130',
    'bed Wizard bed|desk Spell desk|shelf Potion shelf|books Spell books|chest Magic chest|globe Crystal ball|candles Wizard candles|rug Rune rug|armchair Wizard armchair|telescope Star scope|lamp Floating lamp|cart Potion cart|statue Owl statue|clock Hourglass clock',
    'frame Star map|tapestry Rune tapestry|wallshelf Potion ledge|sconce Magic sconce'],
  ['Robot lab', '#9AA4B0', '#E8C25A', '#5A5A60',
    'desk Lab bench|computer Lab computer|chair Lab chair|shelf Parts shelf|machine Robot builder|statue Robot statue|lamp Desk arm lamp|rug Circuit rug|chest Parts chest|teddy Robot plush|vending Battery machine|fridge Lab fridge|stool Lab stool|tv Monitor wall',
    'board Blueprint board|frame Robot poster|clock Digital clock|neon Bolt sign'],
  ['Dino den', '#7FAF5B', '#E0873A', '#9C7046',
    'bed Dino bed|beanbag Dino egg beanbag|teddy Dino plush|statue Dino skeleton|rug Footprint rug|lamp Volcano lamp|tallplant Fern tree|chest Fossil chest|chair Dino chair|shelf Fossil shelf|stool Dino egg stool|sofa Dino sofa|blocks Dino blocks|globe Dino globe',
    'frame Dino poster|fish Mounted fossil fish|clock Dino clock|banner Dino banner'],
  ['Gallery', '#F2F4F6', '#3A3A40', '#C9C9CF',
    'statue Modern sculpture|statue Marble bust|pillar Plinth|easel Gallery easel|bench Gallery bench|rug Gallery rug|lamp Spotlight|vase Gallery vase|screen Gallery screen|chair Gallery chair|lowshelf Catalogue shelf|tallplant Gallery plant|round Gallery table|clock Gallery clock',
    'frame Abstract painting|frames Gallery wall|mosaic Modern mosaic|sconce Gallery light'],
  ['Art studio', '#F2EDE4', '#E07A9B', '#B88D60',
    'easel Painter\'s easel|easel Little easel|table Art table|stool Painter\'s stool|shelf Paint shelf|chest Supply chest|lamp Studio lamp|rug Paint splash rug|pottery Pottery wheel|sewing Craft table|basket Yarn basket|vase Brush jar|sofa Studio sofa|cart Art cart',
    'frames Sketch wall|board Mood board|frame Self portrait|lights Studio lights'],
  ['Music room', '#3A3A40', '#E8C25A', '#7A5A3A',
    'piano Upright piano|guitar Acoustic guitar|drums Drum kit|harp Golden harp|gramophone Gramophone|speaker Big speaker|stool Piano stool|rug Music rug|shelf Record shelf|lamp Stage lamp|chair Music chair|sofa Listening sofa|tv Concert TV|cushion Note cushion',
    'frame Concert poster|neon Music sign|clock Metronome clock|wallshelf Vinyl ledge'],
  ['Toy box', '#E8607A', '#5FA8C9', '#E8C25A',
    'chest Toy box|blocks Block tower|horse Toy rocking horse|teddy Big teddy|train Toy train|ballpit Ball pit|tent Play tent|dollhouse Dollhouse|duck Rubber duck|beanbag Toy beanbag|rug Road rug|bunk Bunk bed|shelf Toy shelf|cradle Doll cradle',
    'banner Toy bunting|frame Crayon drawing|clock Toy clock|hanging Toy mobile'],
  ['Nursery', '#F2EDE4', '#B9DDE6', '#E9D7A8',
    'cradle Wooden cradle|cradle Little cradle|armchair Rocking armchair|chest Nursery chest|rug Cloud rug|lamp Night light|teddy Sleepy bear|basket Nappy basket|shelf Nursery shelf|vanity Changing table|cushion Moon cushion|blocks Soft blocks|horse Little rocking horse|duck Bath duck',
    'hanging Star mobile|frame Nursery print|clock Moon clock|lights Soft lights'],
  ['Farmhouse', '#F2EDE4', '#7A9A5A', '#9C7046',
    'bed Farmhouse bed|table Farmhouse table|bench Farm bench|chair Spindle chair|cabinet Farm dresser|stove Farm stove|basket Egg basket|vase Milk jug vase|rug Braided rug|lamp Oil lamp|chest Blanket chest|sofa Farm sofa|clock Farm clock|cart Milk cart',
    'quilt Farm quilt|wreath Wheat wreath|frame Barn painting|board Chalk menu'],
  ['Industrial loft', '#5A5A60', '#C9783A', '#7A5A3A',
    'sofa Leather sofa|armchair Leather armchair|low Pallet table|shelf Pipe shelf|lamp Edison lamp|desk Metal desk|chair Metal chair|rug Concrete rug|tallplant Loft plant|stool Bar stool|counter Metal counter|cabinet Locker cabinet|tv Loft TV|speaker Loft speaker',
    'frame City poster|clock Factory clock|lights Edison lights|neon Loft sign'],
  ['Mid-century', '#E0873A', '#5F8A86', '#9C7046',
    'sofa Mid-century sofa|armchair Lounge chair|low Kidney table|lowshelf Credenza|lamp Arc floor lamp|chair Shell chair|rug Atomic rug|tv Console TV|tlamp Mushroom lamp|tallplant Snake plant|desk Writing desk|round Tulip table|stool Peg stool|speaker Hi-fi',
    'frame Atomic print|clock Sunburst clock|mosaic Geometric art|sconce Brass sconce'],
  ['Boho', '#C9A272', '#D9603A', '#B88D60',
    'swing Macramé chair|beanbag Floor pouf|rug Boho rug|tallplant Pampas grass|plant Trailing plant|lamp Rattan lamp|low Boho table|sofa Boho daybed|basket Woven basket|cushion Tassel cushion|candles Boho candles|vase Clay vase|bed Boho bed|lantern Moroccan lantern',
    'dream Boho dreamcatcher|tapestry Macramé hanging|plantshelf Plant ledge|hanging Feather hanging'],
  ['Nordic', '#E9E6E0', '#7D8796', '#D9C9A8',
    'bed Nordic bed|sofa Nordic sofa|armchair Sheepskin chair|low Birch table|lamp Nordic lamp|lowshelf Birch shelf|rug Wool rug|chair Birch chair|tallplant Olive tree|candles Hygge candles|cushion Wool cushion|basket Log basket|desk Birch desk|vase Nordic vase',
    'frame Mountain print|clock Nordic clock|wallshelf Birch ledge|lights Hygge lights'],
  ['Victorian', '#5A2A3A', '#C9A0A0', '#5A4130',
    'bed Victorian bed|sofa Fainting couch|armchair Velvet wingback|table Parlour table|clock Grandfather clock|lamp Tiffany lamp|vanity Victorian vanity|rug Parlour rug|cabinet Curio cabinet|chair Parlour chair|gramophone Victorian gramophone|vase Victorian vase|globe Parlour globe|candles Candelabra',
    'frame Victorian portrait|cuckoo Ornate clock|sconce Gas lamp|tapestry Damask hanging'],
  ['Camping', '#5E8A6A', '#E07A3A', '#9C7046',
    'tent Camp tent|bench Log bench|stool Camp stool|lantern Camp lantern|chest Cooler|firewood Campfire wood|rug Camp mat|chair Camp chair|table Camp table|basket Fishing basket|lamp Bug lamp|cart Gear cart|guitar Camp guitar|beanbag Sleeping bag',
    'banner Camp pennant|frame Trail map|lights Camp lights|board Camp board'],
  ['Kawaii', '#F2C4C8', '#B9DDE6', '#F7F2E8',
    'bed Kawaii bed|beanbag Cloud beanbag|teddy Bear plush|teddy Bunny plush|lamp Star lamp|rug Heart rug|vanity Heart vanity|chair Bow chair|cushion Heart cushion|lava Glitter lamp|shelf Plush shelf|stool Cupcake stool|round Heart table|desk Kawaii desk',
    'neon Heart sign|lights Heart lights|frame Kawaii poster|clock Bunny clock'],
  ['Gamer room', '#2A2A40', '#7FE0D0', '#3A3A40',
    'desk Gaming desk|chair Gaming chair|computer Gaming rig|tv Big TV|beanbag Gamer beanbag|speaker Surround speaker|lava RGB lamp|rug Gamer rug|shelf Game shelf|bed Gamer bed|arcade Retro cabinet|fridge Snack fridge|stool Gamer stool|lowshelf Console stand',
    'neon Controller sign|lights RGB strip|frame Game poster|clock LED clock'],
  ['Office', '#7D8796', '#E9E6E0', '#9C7046',
    'desk Office desk|chair Office chair|computer Office computer|cabinet Filing cabinet|shelf Binder shelf|lamp Desk lamp|tallplant Office plant|rug Office rug|sofa Waiting sofa|vending Coffee machine|board Whiteboard|stool Office stool|phone Office phone|clock Office clock',
    'clock Office wall clock|board Planner board|frame Motivational poster|wallshelf File ledge'],
  ['Laundry day', '#79AAA4', '#F2F4F6', '#C9C2B5',
    'washer Washing machine|machine Dryer|basket Laundry basket|rack Drying rack|counter Folding counter|shelf Soap shelf|stool Laundry stool|rug Laundry rug|vanity Ironing board|cabinet Linen cupboard|plant Laundry plant|lamp Laundry lamp|chest Sock chest|duck Bath duck',
    'wallshelf Soap ledge|clock Laundry clock|frame Laundry print|lights Clothesline'],
  ['Bathhouse', '#9FC3D0', '#F2EDE4', '#C9C2B5',
    'tub Clawfoot tub|tub Wooden tub|vanity Bath vanity|rack Towel warmer|stool Bath stool|plant Fern pot|candles Bath candles|rug Bath rug|basket Bath basket|shelf Bath shelf|fountain Rain fountain|duck Rubber duck|saltlamp Bath salt lamp|cabinet Bath cabinet',
    'mosaic Bath tiles|sconce Bath sconce|frame Wave print|wallshelf Bath ledge'],
  ['Kitchen deluxe', '#F2F4F6', '#5F8A86', '#9C7046',
    'stove Range oven|fridge Big fridge|counter Kitchen island|counter Sink counter|machine Espresso machine|table Kitchen table|chair Kitchen chair|stool Kitchen stool|shelf Spice shelf|cabinet Pantry cupboard|rack Pot rack|basket Fruit bowl|rug Kitchen rug|cart Kitchen cart',
    'wallshelf Plate shelf|clock Kitchen clock|board Recipe board|hanging Hanging herbs'],
  ['Sunflower', '#F0C040', '#6F925B', '#9C7046',
    'bed Sunflower bed|sofa Sunflower sofa|armchair Sunny armchair|round Sunflower table|vase Sunflower vase|flowers Sunflower box|rug Sunflower rug|lamp Sun lamp|chair Sunny chair|cushion Sunflower cushion|tallplant Tall sunflower|shelf Sunny shelf|basket Seed basket|stool Sunny stool',
    'frame Sunflower painting|clock Sunflower clock|wreath Sunflower wreath|lights Sunny lights'],
  ['Moonlight', '#3A3A6A', '#DCE6F2', '#2A2A50',
    'bed Moon bed|swing Crescent swing|lamp Moon lamp|rug Moon rug|armchair Midnight armchair|sofa Night sofa|round Moon table|vase Moon vase|candles Moon candles|beanbag Moon beanbag|jarlamp Moon jar|shelf Night shelf|wardrobe Midnight wardrobe|cushion Moon cushion',
    'neon Moon sign|lights Moon lights|frame Moon phases print|dream Moon dreamcatcher'],
  ['Rainbow', '#E8707A', '#6FA9D9', '#F0DA6A',
    'bed Rainbow bed|sofa Rainbow sofa|beanbag Rainbow beanbag|rug Rainbow rug|lamp Rainbow lamp|chair Rainbow chair|round Rainbow table|shelf Rainbow shelf|cushion Rainbow cushion|vase Rainbow vase|stool Rainbow stool|wardrobe Rainbow wardrobe|lava Rainbow lava lamp|blocks Rainbow blocks',
    'neon Rainbow sign|lights Rainbow lights|banner Rainbow banner|frame Rainbow print'],
];

const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const colours = (pick, [c, a, w]) => (pick === 'W' ? [w, c] : pick === 'A' ? [a, c] : [c, a]);

export const CATALOG_SETS = [];
export const CATALOG_FURNITURE = [];
export const CATALOG_WALL = [];
for (const [set, c, a, w, furn, wall] of SETS) {
  const pal = [c, a, w];
  const key = slug(set);
  CATALOG_SETS.push(set);
  if (!FURNITURE_SETS.includes(set)) FURNITURE_SETS.push(set);
  for (const entry of furn.split('|')) {
    const [role, ...words] = entry.trim().split(' ');
    const name = words.join(' ');
    const [form, fw, fh, use, price] = ROLES[role] || [];
    if (!form) throw new Error(`Unknown role ${role} in ${set}`);
    let type = `${key}_${slug(name)}`;
    if (FURNITURE_BY_TYPE[type]) continue;
    const [color, accent] = colours(ROLES[role][5], pal);
    const flat = ['rug', 'round_rug', 'tatami', 'mat', 'train'].includes(form);
    const def = { type, name, category: set, set, price, w: fw, h: fh, form, color, accent, ...(use ? { use } : {}), ...(flat ? { flat: true } : {}) };
    FURNITURE.push(def);
    FURNITURE_BY_TYPE[type] = def;
    CATALOG_FURNITURE.push(def);
    // Most simple pieces can be made at the workbench as well as bought.
    if (CRAFT_NEEDS[role]) {
      ITEMS['made_' + type] = { id: 'made_' + type, name, cat: 'made', shape: 'seed', color, price: Math.round(price / 3), furniture: type };
      const craft = { id: 'home_' + type, name, category: 'Home', group: set, needs: CRAFT_NEEDS[role], makes: { furniture: type } };
      CRAFTS.push(craft);
      CRAFT_BY_ID[craft.id] = craft;
    }
  }
  for (const entry of wall.split('|')) {
    const [role, ...words] = entry.trim().split(' ');
    const name = words.join(' ');
    const [form, price, pick] = WALL_ROLES[role] || [];
    if (!form) throw new Error(`Unknown wall role ${role} in ${set}`);
    const type = `${key}_${slug(name)}`;
    if (WALL_BY_TYPE[type]) continue;
    const [color, accent] = colours(pick, pal);
    const def = { type, name, price, form, color, accent, set };
    WALL_ITEMS.push(def);
    WALL_BY_TYPE[type] = def;
    CATALOG_WALL.push(def);
  }
}

// ---------- wallpapers and floors ----------

// Patterns drawn in home-art.js (wallpaperTile / floorTile, by `pattern`).
export const WALL_PATTERNS = ['plain', 'stripe', 'thin_stripe', 'dots', 'big_dots', 'check', 'plaid', 'floral', 'stars', 'hearts', 'waves',
  'brick', 'panel', 'diamond', 'zigzag', 'scallop', 'leaves', 'grid', 'wainscot', 'damask', 'clouds', 'moons', 'rainbow', 'herringbone'];
export const FLOOR_PATTERNS = ['planks', 'herringbone', 'parquet', 'checker', 'tiles', 'big_tiles', 'stone', 'carpet', 'marble', 'terrazzo',
  'tatami', 'grass', 'sand', 'hex', 'mosaic', 'cobble', 'stripes', 'dots'];

// [name, light, dark]
const PALETTES = [
  ['Cream', '#F2EAD8', '#E2D3B4'], ['Rose', '#F2D3D6', '#D99AA3'], ['Sage', '#D3E0C4', '#A9BE91'], ['Sky', '#D6E6F0', '#9FC3D9'],
  ['Lilac', '#E3D9F0', '#B9A0D9'], ['Butter', '#F7EDC0', '#E8C96A'], ['Peach', '#F7DCC8', '#E8A07A'], ['Mint', '#D6F0E3', '#9DD3BE'],
  ['Charcoal', '#4A4A52', '#2E2E36'], ['Navy', '#3A4A6A', '#24304A'], ['Berry', '#C9506A', '#8A2A4A'], ['Forest', '#5E7A4A', '#3F5A34'],
  ['Cocoa', '#9C7A60', '#6A5040'], ['Coral', '#F0A090', '#D9705A'], ['Teal', '#79AAA4', '#4F7F7A'], ['Gold', '#E8C25A', '#B5853A'],
];

// Wallpapers: every pattern in a few palettes, and plain colours in all of them.
const WALL_COMBOS = {
  plain: PALETTES.map(p => p[0]), stripe: ['Cream', 'Rose', 'Sage', 'Sky', 'Mint', 'Navy', 'Berry', 'Butter'], thin_stripe: ['Cream', 'Lilac', 'Peach', 'Charcoal', 'Teal'],
  dots: ['Rose', 'Sky', 'Butter', 'Mint', 'Navy', 'Coral'], big_dots: ['Peach', 'Lilac', 'Berry', 'Teal'], check: ['Sky', 'Rose', 'Sage', 'Butter', 'Charcoal'],
  plaid: ['Berry', 'Forest', 'Navy', 'Cocoa', 'Sage'], floral: ['Cream', 'Rose', 'Lilac', 'Sage', 'Navy', 'Butter'], stars: ['Navy', 'Charcoal', 'Sky', 'Lilac'],
  hearts: ['Rose', 'Peach', 'Lilac', 'Berry'], waves: ['Sky', 'Teal', 'Mint', 'Navy'], brick: ['Coral', 'Cream', 'Charcoal', 'Cocoa'],
  panel: ['Cocoa', 'Cream', 'Sage', 'Navy', 'Forest'], diamond: ['Gold', 'Lilac', 'Teal', 'Charcoal'], zigzag: ['Butter', 'Coral', 'Mint', 'Navy'],
  scallop: ['Peach', 'Sky', 'Rose', 'Mint'], leaves: ['Sage', 'Forest', 'Mint', 'Cream'], grid: ['Cream', 'Charcoal', 'Sky'],
  wainscot: ['Sage', 'Navy', 'Rose', 'Cream', 'Forest'], damask: ['Berry', 'Gold', 'Navy', 'Cream'], clouds: ['Sky', 'Lilac', 'Peach'],
  moons: ['Navy', 'Charcoal', 'Lilac'], rainbow: ['Cream', 'Sky'], herringbone: ['Cream', 'Cocoa', 'Charcoal'],
};
const FLOOR_COMBOS = {
  planks: ['Cocoa', 'Cream', 'Gold', 'Charcoal', 'Rose', 'Sage'], herringbone: ['Cocoa', 'Gold', 'Cream', 'Charcoal'], parquet: ['Cocoa', 'Gold', 'Cream'],
  checker: ['Rose', 'Sky', 'Charcoal', 'Mint', 'Butter', 'Berry'], tiles: ['Cream', 'Sky', 'Mint', 'Teal', 'Peach'], big_tiles: ['Cream', 'Charcoal', 'Sage'],
  stone: ['Cream', 'Charcoal', 'Sage'], carpet: PALETTES.map(p => p[0]).slice(0, 12), marble: ['Cream', 'Charcoal', 'Rose', 'Sage'],
  terrazzo: ['Cream', 'Peach', 'Sky'], tatami: ['Sage', 'Butter'], grass: ['Sage', 'Forest'], sand: ['Butter', 'Peach'], hex: ['Mint', 'Charcoal', 'Gold', 'Cream'],
  mosaic: ['Teal', 'Coral', 'Sky'], cobble: ['Charcoal', 'Cream', 'Cocoa'], stripes: ['Navy', 'Rose', 'Sage'], dots: ['Rose', 'Sky', 'Butter'],
};
const PATTERN_NAMES = {
  plain: 'paint', stripe: 'stripes', thin_stripe: 'pinstripe', dots: 'dots', big_dots: 'polka dots', check: 'check', plaid: 'plaid', floral: 'flowers',
  stars: 'stars', hearts: 'hearts', waves: 'waves', brick: 'brick', panel: 'panels', diamond: 'diamonds', zigzag: 'zigzag', scallop: 'scallops',
  leaves: 'leaves', grid: 'grid', wainscot: 'wainscoting', damask: 'damask', clouds: 'clouds', moons: 'moons', rainbow: 'rainbow stripes',
  herringbone: 'herringbone', planks: 'planks', parquet: 'parquet', checker: 'checker tiles', tiles: 'tiles', big_tiles: 'big tiles', stone: 'flagstones',
  carpet: 'carpet', marble: 'marble', terrazzo: 'terrazzo', tatami: 'tatami', grass: 'grass carpet', sand: 'sandy floor', hex: 'hex tiles',
  mosaic: 'mosaic', cobble: 'cobbles', stripes: 'striped carpet',
};
const PAL_BY_NAME = Object.fromEntries(PALETTES.map(p => [p[0], p]));

export const CATALOG_WALLPAPERS = [];
export const CATALOG_FLOORS = [];
function addSurfaces(combos, list, byId, out, prefix) {
  for (const [pattern, names] of Object.entries(combos)) {
    for (const n of names) {
      const [pname, light, dark] = PAL_BY_NAME[n];
      const id = `${prefix}_${pattern}_${slug(pname)}`;
      if (byId[id]) continue;
      const def = { id, name: `${pname} ${PATTERN_NAMES[pattern]}`, price: pattern === 'plain' ? 15 : 30 + (pattern.length % 4) * 5, colors: [light, dark], pattern };
      list.push(def);
      byId[id] = def;
      out.push(def);
    }
  }
}
addSurfaces(WALL_COMBOS, WALLPAPERS, WALLPAPER_BY_ID, CATALOG_WALLPAPERS, 'wp');
addSurfaces(FLOOR_COMBOS, FLOORS, FLOOR_BY_ID, CATALOG_FLOORS, 'fl');

// ---------- outside ----------

// More outdoor pieces: new colours and styles of each outdoor shape. Each one
// costs the same materials as the first piece of its shape.
// [form, group, [name, colour, accent], ...]
const OUTDOOR_STYLES = [
  ['path', 'Paths', ['Pink stone path', '#E8B0B8', '#F2D3D6'], ['Slate path', '#5A5A66', '#7D7D8A'], ['Sandstone path', '#D9B47A', '#E9D0A0'], ['Moss stone path', '#7A9A5A', '#9DBA74'], ['Moonstone path', '#B9C7D9', '#DCE6F2']],
  ['bricks', 'Paths', ['Red brick path', '#B5453A', '#C9605A'], ['Yellow brick road', '#E8C25A', '#F0DA6A'], ['Grey brick path', '#8A8A90', '#A9A9B0'], ['Pastel brick path', '#E3D9F0', '#F2D3D6']],
  ['deck', 'Paths', ['Dark wood deck', '#6A4A34', '#5A4130'], ['White wood deck', '#F2EDE4', '#D9D6CF'], ['Bamboo deck', '#C9C27A', '#A9A25A']],
  ['tiles', 'Paths', ['Blue garden tiles', '#9FC3D9', '#79AAC9'], ['Terracotta tiles', '#C9783A', '#B5653A'], ['Marble tiles', '#F2F4F6', '#C9C9CF'], ['Black and white tiles', '#2E2E36', '#F2F4F6']],
  ['mosaic', 'Paths', ['Rainbow mosaic', '#E8707A', '#6FA9D9'], ['Sea mosaic', '#5F9FB5', '#F2EDE4'], ['Sunset mosaic', '#F0A55A', '#C9506A'], ['Star mosaic', '#2A2A50', '#E8C25A']],
  ['flowerbed', 'Paths', ['Tulip bed', '#7A5A3A', '#E8607A'], ['Sunflower bed', '#7A5A3A', '#F0C040'], ['Lavender bed', '#7A5A3A', '#B9A0D9'], ['Rose bed', '#7A5A3A', '#C9283A'], ['Daisy bed', '#7A5A3A', '#F2F4F6'], ['Bluebell bed', '#7A5A3A', '#6F97C9']],
  ['steps', 'Paths', ['Log steps', '#9C7046', '#C9A272'], ['Shell steps', '#F2D6C9', '#F7EDE4'], ['Star steps', '#E8C25A', '#F7EDC0']],
  ['clover', 'Paths', ['Daisy lawn', '#7FAF5B', '#F7F2E8'], ['Moss lawn', '#6F925B', '#9DBA74'], ['Bluebell lawn', '#7FAF5B', '#6F97C9']],
  ['fence', 'Fences', ['Pink picket fence', '#F2C4C8', '#E8A0B0'], ['Blue picket fence', '#B9DDE6', '#9FC3D9'], ['Mint picket fence', '#C9E8DA', '#9DD3BE'], ['Black picket fence', '#3A3A40', '#5A5A60'], ['Rainbow fence', '#E8707A', '#6FA9D9']],
  ['wall', 'Fences', ['Brick wall', '#B5453A', '#9A3A30'], ['Mossy wall', '#8A9A7A', '#6F925B'], ['Sandstone wall', '#D9B47A', '#C9A25A']],
  ['hedge', 'Fences', ['Flower hedge', '#4F8A4A', '#E07A9B'], ['Topiary hedge', '#3F7A3A', '#5E9A4A'], ['Autumn hedge', '#C9603A', '#E0873A'], ['Snowy hedge', '#4F8A4A', '#F2FAFF']],
  ['railing', 'Fences', ['Gold railing', '#B5853A', '#E8C25A'], ['White railing', '#F2F4F6', '#D9D6CF']],
  ['rope', 'Fences', ['Ship rope fence', '#7A5A3A', '#E9D7A8'], ['Candy rope fence', '#F2F4F6', '#E8607A']],
  ['lamppost', 'Lights', ['Victorian lamp post', '#2A2A30', '#F2C46A'], ['Mint lamp post', '#79AAA4', '#F2E48A'], ['Pink lamp post', '#E8A0B0', '#F7EDC0'], ['Gold lamp post', '#B5853A', '#F2E48A']],
  ['torch', 'Lights', ['Bamboo torch', '#C9C27A', '#F08A3A'], ['Blue flame torch', '#5A5A60', '#6FA9D9']],
  ['lanternpost', 'Lights', ['Paper lantern post', '#9C7046', '#E8607A'], ['Star lantern post', '#3F4A6A', '#E8C25A'], ['Moon lantern post', '#5A5A66', '#DCE6F2']],
  ['smalllight', 'Lights', ['Mushroom light', '#D9533C', '#F2E48A'], ['Star light', '#E8C25A', '#F7EDC0'], ['Heart light', '#E8607A', '#F2C4C8'], ['Flower light', '#7FAF5B', '#F2C4C8']],
  ['stringpole', 'Lights', ['Rainbow string lights', '#7A5A3A', '#E8707A'], ['Warm string lights', '#7A5A3A', '#F2C46A'], ['Star string lights', '#3F4A6A', '#E8C25A']],
  ['stonelantern', 'Lights', ['Mossy stone lantern', '#8A9A7A', '#F2C46A'], ['Snow lantern', '#DCEFF6', '#F2E48A']],
  ['crystal', 'Lights', ['Amethyst lamp', '#B9A0D9', '#E3D9F0'], ['Rose quartz lamp', '#F2C4C8', '#F7E8E0'], ['Moonstone lamp', '#DCE6F2', '#FFFFFF']],
  ['bench', 'Seats', ['Pink bench', '#E8A0B0', '#C9808A'], ['White bench', '#F2F4F6', '#C9C9CF'], ['Blue bench', '#6F97C9', '#5F7FB5'], ['Iron bench', '#3A3A40', '#5A5A60'], ['Birch bench', '#E9E3D6', '#C9C2B5']],
  ['heartbench', 'Seats', ['Red heart bench', '#C9283A', '#E8607A'], ['Lilac heart bench', '#B9A0D9', '#E3D9F0']],
  ['log', 'Seats', ['Birch log seat', '#E9E3D6', '#3A3A40'], ['Mossy log seat', '#7A5A3A', '#7FAF5B']],
  ['deckchair', 'Seats', ['Striped deck chair', '#B88D60', '#E8607A'], ['Sunny deck chair', '#B88D60', '#F0C040'], ['Mint deck chair', '#F2F4F6', '#9DD3BE']],
  ['picnictable', 'Seats', ['White picnic table', '#F2F4F6', '#D9D6CF'], ['Blue picnic table', '#6F97C9', '#5F7FB5']],
  ['parasol', 'Seats', ['Beach parasol table', '#F2EDE4', '#5FA8C9'], ['Mint parasol table', '#F2EDE4', '#9DD3BE'], ['Lemon parasol table', '#F2EDE4', '#F0DA6A']],
  ['swing', 'Seats', ['Flower swing', '#7A5A3A', '#F2C4C8'], ['Moon swing', '#3F4A6A', '#DCE6F2'], ['Rope swing', '#9C7046', '#C9A272']],
  ['hammock', 'Seats', ['Rainbow hammock', '#9C7046', '#E8707A'], ['Blue hammock', '#9C7046', '#6F97C9']],
  ['planter', 'Garden', ['Herb planter', '#B88D60', '#7FAF5B'], ['Tulip planter', '#B88D60', '#E8607A'], ['Strawberry planter', '#B88D60', '#D9533C']],
  ['pots', 'Garden', ['Blue pots', '#5F7FB5', '#F2F4F6'], ['Terracotta pots', '#C9783A', '#7FAF5B'], ['Rainbow pots', '#E8707A', '#6FA9D9']],
  ['birdbath', 'Garden', ['Shell birdbath', '#F2D6C9', '#9FD3E0'], ['Golden birdbath', '#E8C25A', '#9FD3E0']],
  ['sundial', 'Garden', ['Moon sundial', '#9AA4B0', '#DCE6F2'], ['Copper sundial', '#B5653A', '#E8C25A']],
  ['scarecrow', 'Garden', ['Cheerful scarecrow', '#D9B47A', '#E8607A'], ['Witch scarecrow', '#D9B47A', '#3A2E40'], ['Snow scarecrow', '#F2FAFF', '#5F7FB5']],
  ['wheelbarrow', 'Garden', ['Red wheelbarrow', '#C9283A', '#7A5A3A'], ['Flower wheelbarrow', '#7FAF5B', '#E07A9B']],
  ['barrel', 'Garden', ['Flower barrel', '#7A5A3A', '#E07A9B'], ['Blue barrel', '#5F7FB5', '#3A3A40']],
  ['gnome', 'Garden', ['Fishing gnome', '#5F7FB5', '#D9533C'], ['Pink gnome', '#E8607A', '#F2F4F6'], ['Gold gnome', '#E8C25A', '#B5853A'], ['Sleepy gnome', '#7A9A5A', '#F2F4F6']],
  ['feeder', 'Garden', ['Birdhouse', '#B5453A', '#E9D7A8'], ['Blue birdhouse', '#5F97C9', '#F2F4F6'], ['Bird table', '#9C7046', '#E8C25A']],
  ['pumpkins', 'Garden', ['White pumpkin pile', '#F2EDE4', '#7FAF5B'], ['Squash pile', '#E8B83A', '#4F8A4A']],
  ['arch', 'Fun', ['Rose arch', '#F2F4F6', '#C9283A'], ['Wisteria arch', '#7A5A3A', '#B9A0D9'], ['Ivy arch', '#5A5A60', '#4F8A4A'], ['Snowy arch', '#F2FAFF', '#9FC3D0']],
  ['heartarch', 'Fun', ['Golden heart arch', '#E8C25A', '#F7EDC0']],
  ['signpost', 'Fun', ['Welcome sign', '#B88D60', '#7FAF5B'], ['Love sign', '#B88D60', '#E8607A'], ['Jar signpost', '#7A5A3A', '#B7D4BD']],
  ['flag', 'Fun', ['Rainbow flag', '#9A958A', '#6FA9D9'], ['Star flag', '#9A958A', '#E8C25A'], ['Heart flag', '#9A958A', '#C9283A']],
  ['windmill', 'Fun', ['Blue windmill', '#F2F4F6', '#5F7FB5'], ['Pink windmill', '#F2F4F6', '#E8A0B0']],
  ['chime', 'Fun', ['Shell chime', '#B88D60', '#F2D6C9'], ['Bamboo chime', '#C9C27A', '#A9A25A'], ['Star chime', '#3F4A6A', '#E8C25A']],
  ['fountain', 'Fun', ['Grand fountain', '#F2F4F6', '#9FD3E0'], ['Mossy fountain', '#8A9A7A', '#9FD3E0'], ['Golden fountain', '#E8C25A', '#9FD3E0']],
  ['catstatue', 'Fun', ['Dog statue', '#B9B4A8', '#7D7A74'], ['Bunny statue', '#B9B4A8', '#E8A0B0'], ['Frog statue', '#7A9A5A', '#5E7A4A'], ['Owl statue', '#9C8266', '#7A6A4A'], ['Fox statue', '#D9803A', '#B5653A'], ['Bear statue', '#7A5A40', '#5A4130']],
  ['totem', 'Fun', ['Bird totem', '#9C7046', '#5F97C9'], ['Bear totem', '#7A5A3A', '#E8C25A']],
  ['sandbox', 'Fun', ['Castle sandbox', '#B88D60', '#F2D6C9']],
  ['tent', 'Fun', ['Pink camp tent', '#E8A0B0', '#F7EDC0'], ['Blue camp tent', '#5F97C9', '#F2C46A'], ['Star camp tent', '#2A2A50', '#E8C25A']],
  ['wishstone', 'Fun', ['Moon wishing stone', '#5A5A66', '#DCE6F2'], ['Heart wishing stone', '#7D8796', '#E8607A']],
];

export const CATALOG_OUTDOOR = [];
const firstOfForm = form => Object.values(OUTDOOR_BY_TYPE).find(d => d.form === form);
const outRows = [];
for (const [form, group, ...styles] of OUTDOOR_STYLES) {
  const base = firstOfForm(form);
  if (!base) throw new Error('No outdoor shape ' + form);
  for (const [name, color, accent] of styles) {
    const extra = { ...(base.light ? { light: true } : {}), ...(base.sit ? { sit: true } : {}), ...(base.swing ? { swing: true } : {}) };
    outRows.push([slug(name), name, group, form, color, accent, base.needs, extra]);
    CATALOG_OUTDOOR.push(slug(name));
  }
}
addOutdoor(outRows);
