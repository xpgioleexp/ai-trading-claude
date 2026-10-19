// Fossils and digging them up. Over a hundred prehistoric animals and plants,
// most in several pieces (a skull, a torso, a tail...). Each piece is its own
// item. Dig sites crack open in the meadow and every jar each day; digging one
// is a little excavation game. Bring every piece of an animal to the museum
// and you can piece its skeleton together. Pure rules, no drawing.
import { ITEMS } from './data.js';
import { rngFor, shuffle, randInt } from './rng.js';

// What each piece is called.
export const PART_NAMES = {
  skull: 'skull', neck: 'neck', torso: 'ribcage', tail: 'tail', legs: 'legs', arms: 'arms', wings: 'wings', sail: 'sail',
  plates: 'back plates', frill: 'frill', armor: 'armour', club: 'tail club', flippers: 'flippers', tusks: 'tusks',
  antlers: 'antlers', shell: 'shell', jaw: 'jaw', body: 'body', claws: 'claws', spine: 'spine', horn: 'horn', fin: 'fin',
};

// Where to dig: the meadow, each jar, and the mine.
export const DIG_PLACES = ['meadow', 'desert', 'beach', 'snow', 'springs', 'rainforest', 'glade', 'flower', 'stars', 'mine'];

// [id, name, plan, places, parts, rarity, era]
// plan: the body shape used to draw the skeleton. era decides the stone colour.
const SPECIMENS_RAW = [
  // dinosaurs: the desert, the meadow and the flower jar
  ['trex', 'T. rex', 'theropod', ['desert', 'meadow'], ['skull', 'torso', 'tail', 'legs', 'arms'], 'rare', 'dino'],
  ['allosaurus', 'Allosaurus', 'theropod', ['desert', 'meadow'], ['skull', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['spinosaurus', 'Spinosaurus', 'theropod', ['desert', 'beach'], ['skull', 'sail', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['carnotaurus', 'Carnotaurus', 'theropod', ['desert'], ['skull', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['dilophosaurus', 'Dilophosaurus', 'theropod', ['meadow', 'flower'], ['skull', 'torso', 'tail'], 'common', 'dino'],
  ['giganotosaurus', 'Giganotosaurus', 'theropod', ['desert'], ['skull', 'jaw', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['ceratosaurus', 'Ceratosaurus', 'theropod', ['meadow'], ['skull', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['baryonyx', 'Baryonyx', 'theropod', ['beach', 'rainforest'], ['skull', 'claws', 'torso', 'tail'], 'uncommon', 'dino'],
  ['velociraptor', 'Velociraptor', 'raptor', ['desert', 'meadow'], ['skull', 'torso', 'tail', 'claws'], 'common', 'dino'],
  ['deinonychus', 'Deinonychus', 'raptor', ['meadow', 'glade'], ['skull', 'torso', 'tail', 'claws'], 'uncommon', 'dino'],
  ['utahraptor', 'Utahraptor', 'raptor', ['desert'], ['skull', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['compsognathus', 'Compsognathus', 'raptor', ['meadow', 'flower'], ['skull', 'body'], 'common', 'dino'],
  ['microraptor', 'Microraptor', 'raptor', ['rainforest', 'glade'], ['skull', 'wings', 'tail'], 'uncommon', 'dino'],
  ['oviraptor', 'Oviraptor', 'raptor', ['desert'], ['skull', 'torso', 'tail'], 'common', 'dino'],
  ['gallimimus', 'Gallimimus', 'raptor', ['desert', 'meadow'], ['skull', 'neck', 'torso', 'legs'], 'common', 'dino'],
  ['therizinosaurus', 'Therizinosaurus', 'theropod', ['glade', 'rainforest'], ['skull', 'claws', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['brachiosaurus', 'Brachiosaurus', 'sauropod', ['meadow', 'flower'], ['skull', 'neck', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['diplodocus', 'Diplodocus', 'sauropod', ['meadow', 'desert'], ['skull', 'neck', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['apatosaurus', 'Apatosaurus', 'sauropod', ['meadow'], ['skull', 'neck', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['argentinosaurus', 'Argentinosaurus', 'sauropod', ['desert'], ['skull', 'neck', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['mamenchisaurus', 'Mamenchisaurus', 'sauropod', ['springs', 'flower'], ['skull', 'neck', 'torso', 'tail'], 'uncommon', 'dino'],
  ['triceratops', 'Triceratops', 'horned', ['meadow', 'desert'], ['skull', 'frill', 'horn', 'torso', 'tail'], 'rare', 'dino'],
  ['styracosaurus', 'Styracosaurus', 'horned', ['meadow'], ['skull', 'frill', 'torso', 'tail'], 'uncommon', 'dino'],
  ['protoceratops', 'Protoceratops', 'horned', ['desert'], ['skull', 'frill', 'torso'], 'common', 'dino'],
  ['chasmosaurus', 'Chasmosaurus', 'horned', ['flower', 'meadow'], ['skull', 'frill', 'torso', 'tail'], 'uncommon', 'dino'],
  ['psittacosaurus', 'Psittacosaurus', 'horned', ['springs', 'glade'], ['skull', 'body'], 'common', 'dino'],
  ['stegosaurus', 'Stegosaurus', 'plated', ['meadow', 'flower'], ['skull', 'plates', 'torso', 'tail', 'legs'], 'rare', 'dino'],
  ['kentrosaurus', 'Kentrosaurus', 'plated', ['desert'], ['skull', 'plates', 'tail'], 'uncommon', 'dino'],
  ['ankylosaurus', 'Ankylosaurus', 'armored', ['meadow', 'desert'], ['skull', 'armor', 'torso', 'club'], 'rare', 'dino'],
  ['nodosaurus', 'Nodosaurus', 'armored', ['beach', 'meadow'], ['skull', 'armor', 'tail'], 'uncommon', 'dino'],
  ['parasaurolophus', 'Parasaurolophus', 'duckbill', ['meadow', 'rainforest'], ['skull', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['iguanodon', 'Iguanodon', 'duckbill', ['meadow', 'flower'], ['skull', 'torso', 'tail', 'arms'], 'common', 'dino'],
  ['maiasaura', 'Maiasaura', 'duckbill', ['flower'], ['skull', 'torso', 'tail'], 'common', 'dino'],
  ['edmontosaurus', 'Edmontosaurus', 'duckbill', ['snow', 'meadow'], ['skull', 'torso', 'tail', 'legs'], 'uncommon', 'dino'],
  ['corythosaurus', 'Corythosaurus', 'duckbill', ['rainforest'], ['skull', 'torso', 'tail'], 'uncommon', 'dino'],
  ['pachycephalosaurus', 'Pachycephalosaurus', 'dome', ['meadow', 'glade'], ['skull', 'torso', 'tail'], 'uncommon', 'dino'],
  ['stygimoloch', 'Stygimoloch', 'dome', ['glade'], ['skull', 'body'], 'common', 'dino'],
  // flying reptiles and the first birds: up on Starlight isle, the flower jar and the beach
  ['pteranodon', 'Pteranodon', 'flyer', ['stars', 'beach'], ['skull', 'wings', 'torso'], 'uncommon', 'dino'],
  ['quetzalcoatlus', 'Quetzalcoatlus', 'flyer', ['stars', 'desert'], ['skull', 'neck', 'wings', 'torso'], 'rare', 'dino'],
  ['rhamphorhynchus', 'Rhamphorhynchus', 'flyer', ['stars', 'flower'], ['skull', 'wings', 'tail'], 'common', 'dino'],
  ['dimorphodon', 'Dimorphodon', 'flyer', ['beach', 'stars'], ['skull', 'wings'], 'common', 'dino'],
  ['tapejara', 'Tapejara', 'flyer', ['stars'], ['skull', 'wings', 'torso'], 'uncommon', 'dino'],
  ['archaeopteryx', 'Archaeopteryx', 'bird', ['stars', 'rainforest'], ['skull', 'wings', 'tail'], 'rare', 'dino'],
  ['confuciusornis', 'Confuciusornis', 'bird', ['springs', 'stars'], ['skull', 'wings'], 'uncommon', 'dino'],
  ['hesperornis', 'Hesperornis', 'bird', ['beach', 'snow'], ['skull', 'body', 'legs'], 'uncommon', 'dino'],
  // the sea: the beach and the hot springs
  ['plesiosaurus', 'Plesiosaurus', 'marine', ['beach'], ['skull', 'neck', 'flippers', 'torso'], 'uncommon', 'sea'],
  ['elasmosaurus', 'Elasmosaurus', 'marine', ['beach', 'springs'], ['skull', 'neck', 'flippers', 'torso', 'tail'], 'rare', 'sea'],
  ['liopleurodon', 'Liopleurodon', 'marine', ['beach'], ['skull', 'jaw', 'flippers', 'torso'], 'rare', 'sea'],
  ['kronosaurus', 'Kronosaurus', 'marine', ['beach'], ['skull', 'flippers', 'torso'], 'uncommon', 'sea'],
  ['mosasaurus', 'Mosasaurus', 'marine', ['beach', 'springs'], ['skull', 'jaw', 'torso', 'flippers', 'tail'], 'rare', 'sea'],
  ['tylosaurus', 'Tylosaurus', 'marine', ['beach'], ['skull', 'torso', 'tail'], 'uncommon', 'sea'],
  ['ichthyosaurus', 'Ichthyosaurus', 'fish', ['beach', 'springs'], ['skull', 'torso', 'tail', 'fin'], 'uncommon', 'sea'],
  ['shonisaurus', 'Shonisaurus', 'fish', ['springs'], ['skull', 'torso', 'tail'], 'rare', 'sea'],
  ['megalodon', 'Megalodon', 'shark', ['beach'], ['jaw', 'spine', 'fin'], 'rare', 'sea'],
  ['helicoprion', 'Helicoprion', 'shark', ['beach', 'mine'], ['jaw', 'body'], 'uncommon', 'sea'],
  ['cretoxyrhina', 'Cretoxyrhina', 'shark', ['beach'], ['jaw', 'body'], 'common', 'sea'],
  ['dunkleosteus', 'Dunkleosteus', 'fish', ['beach', 'mine'], ['skull', 'jaw', 'body'], 'rare', 'sea'],
  ['coelacanth', 'Coelacanth', 'fish', ['springs', 'beach'], ['skull', 'body', 'fin'], 'uncommon', 'sea'],
  ['xiphactinus', 'Xiphactinus', 'fish', ['beach'], ['skull', 'body'], 'common', 'sea'],
  ['leedsichthys', 'Leedsichthys', 'fish', ['beach', 'springs'], ['skull', 'body', 'tail'], 'rare', 'sea'],
  ['archelon', 'Archelon', 'turtle', ['beach'], ['skull', 'shell', 'flippers'], 'uncommon', 'sea'],
  ['basilosaurus', 'Basilosaurus', 'snake', ['beach', 'springs'], ['skull', 'spine', 'tail'], 'rare', 'sea'],
  ['ambulocetus', 'Ambulocetus', 'mammal', ['springs', 'beach'], ['skull', 'torso', 'legs'], 'uncommon', 'sea'],
  ['eurypterid', 'Sea scorpion', 'bug', ['beach', 'mine'], ['body', 'tail'], 'common', 'early'],
  // the ice age: the snow jar and the hot springs
  ['mammoth', 'Woolly mammoth', 'mammal', ['snow'], ['skull', 'tusks', 'torso', 'legs', 'tail'], 'rare', 'ice'],
  ['mastodon', 'Mastodon', 'mammal', ['snow', 'springs'], ['skull', 'tusks', 'torso', 'legs'], 'uncommon', 'ice'],
  ['sabertooth', 'Sabre-toothed cat', 'mammal', ['snow', 'meadow'], ['skull', 'torso', 'legs', 'tail'], 'rare', 'ice'],
  ['ground_sloth', 'Giant ground sloth', 'mammal', ['rainforest', 'snow'], ['skull', 'claws', 'torso', 'legs'], 'uncommon', 'ice'],
  ['woolly_rhino', 'Woolly rhino', 'mammal', ['snow'], ['skull', 'horn', 'torso', 'legs'], 'uncommon', 'ice'],
  ['cave_bear', 'Cave bear', 'mammal', ['snow', 'glade'], ['skull', 'torso', 'legs'], 'common', 'ice'],
  ['dire_wolf', 'Dire wolf', 'mammal', ['snow', 'meadow'], ['skull', 'torso', 'legs', 'tail'], 'common', 'ice'],
  ['irish_elk', 'Giant deer', 'mammal', ['snow', 'springs'], ['skull', 'antlers', 'torso', 'legs'], 'rare', 'ice'],
  ['glyptodon', 'Glyptodon', 'armored', ['desert', 'snow'], ['skull', 'shell', 'tail'], 'uncommon', 'ice'],
  ['cave_lion', 'Cave lion', 'mammal', ['snow'], ['skull', 'torso', 'legs'], 'uncommon', 'ice'],
  ['megaloceros_calf', 'Giant deer calf', 'mammal', ['springs'], ['skull', 'body'], 'common', 'ice'],
  ['arctic_horse', 'Ice age horse', 'mammal', ['snow', 'flower'], ['skull', 'torso', 'legs'], 'common', 'ice'],
  ['steppe_bison', 'Steppe bison', 'mammal', ['snow', 'meadow'], ['skull', 'horn', 'torso', 'legs'], 'uncommon', 'ice'],
  ['paraceratherium', 'Paraceratherium', 'mammal', ['desert'], ['skull', 'neck', 'torso', 'legs'], 'rare', 'ice'],
  ['andrewsarchus', 'Andrewsarchus', 'mammal', ['desert'], ['skull', 'body'], 'uncommon', 'ice'],
  ['terror_bird', 'Terror bird', 'bird', ['desert', 'meadow'], ['skull', 'body', 'legs'], 'uncommon', 'ice'],
  ['moa', 'Moa', 'bird', ['springs', 'flower'], ['skull', 'neck', 'body', 'legs'], 'uncommon', 'ice'],
  ['dodo', 'Dodo', 'bird', ['beach', 'flower'], ['skull', 'body'], 'common', 'ice'],
  ['elephant_bird', 'Elephant bird', 'bird', ['rainforest'], ['skull', 'body', 'legs'], 'rare', 'ice'],
  // the jungle: the rainforest and the glade
  ['titanoboa', 'Titanoboa', 'snake', ['rainforest'], ['skull', 'spine', 'tail'], 'rare', 'jungle'],
  ['sarcosuchus', 'Sarcosuchus', 'croc', ['rainforest', 'beach'], ['skull', 'torso', 'tail'], 'rare', 'jungle'],
  ['deinosuchus', 'Deinosuchus', 'croc', ['rainforest'], ['skull', 'jaw', 'torso', 'tail'], 'uncommon', 'jungle'],
  ['dimetrodon', 'Dimetrodon', 'croc', ['glade', 'mine'], ['skull', 'sail', 'torso', 'tail'], 'uncommon', 'early'],
  ['edaphosaurus', 'Edaphosaurus', 'croc', ['glade'], ['skull', 'sail', 'torso'], 'common', 'early'],
  ['gigantopithecus', 'Gigantopithecus', 'mammal', ['rainforest', 'springs'], ['skull', 'jaw', 'torso'], 'rare', 'jungle'],
  ['megatherium_cub', 'Little sloth', 'mammal', ['rainforest'], ['skull', 'body'], 'common', 'jungle'],
  ['tiktaalik', 'Tiktaalik', 'fish', ['glade', 'rainforest'], ['skull', 'body', 'fin'], 'uncommon', 'early'],
  ['eryops', 'Eryops', 'croc', ['glade'], ['skull', 'body'], 'common', 'early'],
  ['diplocaulus', 'Diplocaulus', 'croc', ['glade', 'springs'], ['skull', 'body'], 'common', 'early'],
  ['meganeura', 'Meganeura', 'bug', ['rainforest', 'glade'], ['wings', 'body'], 'uncommon', 'jungle'],
  ['arthropleura', 'Arthropleura', 'bug', ['glade', 'mine'], ['skull', 'body', 'tail'], 'uncommon', 'early'],
  ['anomalocaris', 'Anomalocaris', 'bug', ['mine', 'beach'], ['skull', 'body'], 'rare', 'early'],
  ['giant_scorpion', 'Pulmonoscorpius', 'bug', ['rainforest', 'mine'], ['claws', 'body', 'tail'], 'uncommon', 'early'],
  // small fossils, found in one piece
  ['crinoid', 'Sea lily', 'single', ['beach', 'mine'], ['body'], 'common', 'early'],
  ['nautiloid', 'Nautilus fossil', 'single', ['beach', 'springs'], ['shell'], 'common', 'sea'],
  ['belemnite', 'Belemnite', 'single', ['beach', 'meadow'], ['body'], 'common', 'sea'],
  ['horseshoe_crab', 'Horseshoe crab fossil', 'single', ['beach'], ['shell'], 'common', 'sea'],
  ['sand_dollar', 'Fossil sand dollar', 'single', ['beach', 'desert'], ['shell'], 'common', 'sea'],
  ['sea_urchin', 'Fossil sea urchin', 'single', ['beach', 'mine'], ['shell'], 'common', 'sea'],
  ['brachiopod', 'Brachiopod', 'single', ['mine', 'meadow'], ['shell'], 'common', 'early'],
  ['orthoceras', 'Orthoceras', 'single', ['mine', 'desert'], ['shell'], 'uncommon', 'early'],
  ['opabinia', 'Opabinia', 'single', ['mine'], ['body'], 'rare', 'early'],
  ['hallucigenia', 'Hallucigenia', 'single', ['mine', 'glade'], ['body'], 'rare', 'early'],
  ['petrified_wood', 'Petrified wood', 'single', ['desert', 'meadow'], ['body'], 'common', 'plant'],
  ['ginkgo_leaf', 'Ginkgo leaf fossil', 'single', ['springs', 'flower'], ['body'], 'common', 'plant'],
  ['seed_fern', 'Seed fern fossil', 'single', ['glade', 'rainforest'], ['body'], 'common', 'plant'],
  ['cycad_cone', 'Cycad cone fossil', 'single', ['desert', 'rainforest'], ['body'], 'uncommon', 'plant'],
  ['horsetail', 'Giant horsetail fossil', 'single', ['glade'], ['body'], 'common', 'plant'],
  ['lepidodendron', 'Scale tree bark', 'single', ['mine', 'glade'], ['body'], 'uncommon', 'plant'],
  ['amber_mosquito', 'Mosquito in amber', 'single', ['rainforest'], ['body'], 'uncommon', 'amber'],
  ['amber_spider', 'Spider in amber', 'single', ['rainforest', 'glade'], ['body'], 'uncommon', 'amber'],
  ['amber_feather', 'Feather in amber', 'single', ['rainforest', 'stars'], ['body'], 'rare', 'amber'],
  ['amber_flower', 'Flower in amber', 'single', ['flower', 'rainforest'], ['body'], 'uncommon', 'amber'],
  ['amber_lizard', 'Lizard in amber', 'single', ['rainforest'], ['body'], 'rare', 'amber'],
  ['dino_egg', 'Dinosaur egg', 'single', ['desert', 'meadow'], ['shell'], 'uncommon', 'dino'],
  ['egg_nest', 'Nest of eggs', 'single', ['desert'], ['body'], 'rare', 'dino'],
  ['footprint', 'Dinosaur footprint', 'single', ['meadow', 'flower', 'desert'], ['body'], 'common', 'dino'],
  ['coprolite', 'Coprolite', 'single', ['meadow', 'desert', 'glade'], ['body'], 'common', 'dino'],
  ['raptor_claw', 'Raptor claw', 'single', ['desert', 'meadow'], ['claws'], 'uncommon', 'dino'],
  ['shark_tooth', 'Shark tooth', 'single', ['beach'], ['jaw'], 'common', 'sea'],
  ['mammoth_tooth', 'Mammoth tooth', 'single', ['snow'], ['jaw'], 'common', 'ice'],
  ['cave_painting', 'Painted cave stone', 'single', ['snow', 'mine'], ['body'], 'rare', 'ice'],
  ['star_fossil', 'Starfish fossil', 'single', ['stars', 'beach'], ['body'], 'uncommon', 'sea'],
  ['meteor_fossil', 'Fossil from the stars', 'single', ['stars'], ['body'], 'rare', 'early'],
  ['moon_shell', 'Moonlit ammonite', 'single', ['stars'], ['shell'], 'rare', 'sea'],
  ['frozen_beetle', 'Beetle in ice', 'single', ['snow', 'springs'], ['body'], 'uncommon', 'ice'],
  ['glow_mushroom', 'Fossil glow mushroom', 'single', ['glade'], ['body'], 'uncommon', 'plant'],
  ['petal_print', 'Petal print', 'single', ['flower'], ['body'], 'common', 'plant'],
];

const ERA_COLORS = { dino: '#D9C9A8', sea: '#C9B79A', ice: '#E6DCC8', jungle: '#B9A07A', early: '#9A8A70', plant: '#A7B08F', amber: '#E3A23A' };
const ERA_NAMES = { dino: 'Age of dinosaurs', sea: 'Ancient seas', ice: 'Ice age', jungle: 'Ancient jungles', early: 'First life', plant: 'Ancient plants', amber: 'Amber' };
const RARITY_PRICE = { common: 40, uncommon: 80, rare: 150 };
const RARITY_WEIGHT = { common: 10, uncommon: 5, rare: 2 };

export const SPECIMENS = SPECIMENS_RAW.map(([id, name, plan, places, parts, rarity, era]) => ({
  id, name, plan, places, rarity, era, eraName: ERA_NAMES[era], color: ERA_COLORS[era],
  parts: parts.map(p => (plan === 'single' ? 'fossil_' + id : `fossil_${id}_${p}`)),
  partKeys: parts,
}));
export const SPECIMEN_BY_ID = Object.fromEntries(SPECIMENS.map(s => [s.id, s]));
export const ERAS = Object.keys(ERA_NAMES).map(id => ({ id, name: ERA_NAMES[id] }));

// Every piece is an item. PART_INFO: which animal and which piece.
export const PART_INFO = {};
for (const s of SPECIMENS) {
  s.partKeys.forEach((key, i) => {
    const id = s.parts[i];
    const name = s.plan === 'single' ? s.name : `${s.name} ${PART_NAMES[key]}`;
    ITEMS[id] = { id, name, cat: 'fossil', shape: 'fossil', color: s.color, price: RARITY_PRICE[s.rarity] + (s.parts.length > 1 ? 20 : 0), specimen: s.id };
    PART_INFO[id] = { specimen: s.id, key, index: i };
  });
}
export const FOSSIL_PART_IDS = Object.keys(PART_INFO);

// The pieces you can find in a place, weighted by rarity.
export function partsAt(place) {
  return SPECIMENS.filter(s => s.places.includes(place)).flatMap(s => s.parts.map(id => ({ id, w: RARITY_WEIGHT[s.rarity] })));
}

// Picks a piece. missing: pieces nobody has given the museum yet; a third of
// the time you get one of those, so the collection keeps moving.
export function pickPart(rand, place, missing = null) {
  const pool = partsAt(place);
  const wanted = missing ? pool.filter(p => missing.has(p.id)) : [];
  const from = wanted.length && rand() < 0.35 ? wanted : pool;
  let roll = rand() * from.reduce((t, p) => t + p.w, 0);
  for (const p of from) if ((roll -= p.w) < 0) return p.id;
  return from[from.length - 1].id;
}

// ---------- relics ----------

// Old things people left behind, found at dig sites now and then. They go in
// the museum's artifact wing. [id, name, shape, colour, price, places]
const RELICS = [
  ['arrowhead', 'Flint arrowhead', 'stone', '#5A5A60', 60, ['meadow', 'desert']],
  ['old_horseshoe', 'Old horseshoe', 'ore', '#7D7A74', 50, ['meadow', 'flower']],
  ['clay_pipe', 'Clay pipe', 'bottle', '#D9C9A8', 55, ['meadow']],
  ['tin_soldier', 'Tin soldier', 'button', '#5F7FB5', 90, ['meadow', 'flower']],
  ['bronze_key', 'Bronze key', 'ore', '#B5853A', 80, ['meadow', 'springs']],
  ['ships_bell', 'Ship\'s bell', 'ore', '#D9A53A', 160, ['beach']],
  ['pirate_coin', 'Pirate coin', 'button', '#E8C25A', 120, ['beach']],
  ['old_compass', 'Old compass', 'button', '#B88D60', 140, ['beach', 'stars']],
  ['message_tablet', 'Clay tablet', 'stone', '#C9A272', 110, ['desert']],
  ['oil_lamp', 'Clay oil lamp', 'bottle', '#C9783A', 90, ['desert', 'springs']],
  ['sun_disc', 'Golden sun disc', 'gem', '#F0C040', 220, ['desert']],
  ['sand_glass', 'Ancient hourglass', 'bottle', '#E9D7A8', 130, ['desert', 'stars']],
  ['bone_flute', 'Bone flute', 'fossil', '#EFE6D2', 120, ['snow']],
  ['carved_tusk', 'Carved tusk', 'fossil', '#E6DCC8', 160, ['snow']],
  ['fur_needle', 'Bone needle', 'fossil', '#EFE6D2', 70, ['snow', 'springs']],
  ['bronze_bell', 'Bronze temple bell', 'ore', '#B5853A', 150, ['springs']],
  ['tea_bowl', 'Old tea bowl', 'bottle', '#7FAF8A', 100, ['springs']],
  ['stone_mirror', 'Stone mirror', 'gem', '#3A3A40', 140, ['springs', 'glade']],
  ['jade_mask', 'Jade mask', 'gem', '#5FAF7A', 240, ['rainforest']],
  ['stone_head', 'Little carved head', 'stone', '#8A8A70', 130, ['rainforest']],
  ['feather_charm', 'Feather charm', 'leaf', '#E07A3A', 90, ['rainforest', 'flower']],
  ['fairy_stone', 'Fairy ring stone', 'stone', '#9C82C9', 110, ['glade']],
  ['tiny_door', 'Tiny wooden door', 'seed', '#9C7046', 150, ['glade']],
  ['acorn_cup', 'Silver acorn cup', 'button', '#D8DEE6', 120, ['glade', 'meadow']],
  ['silver_brooch', 'Silver brooch', 'gem', '#D8DEE6', 140, ['flower']],
  ['perfume_bottle', 'Perfume bottle', 'bottle', '#E8A0B0', 110, ['flower']],
  ['pressed_locket', 'Locket with a pressed flower', 'button', '#E8C25A', 170, ['flower', 'meadow']],
  ['meteor_pendant', 'Meteor pendant', 'gem', '#5A5066', 200, ['stars']],
  ['moon_compass', 'Moon compass', 'button', '#DCE6F2', 230, ['stars']],
  ['star_chart_piece', 'Piece of a star chart', 'seed', '#3F5A7A', 150, ['stars', 'mine']],
  ['miners_lamp', 'Old miner\'s lamp', 'bottle', '#7D7A74', 90, ['mine']],
  ['dwarf_pick', 'Tiny ancient pick', 'ore', '#9A958A', 130, ['mine']],
];
export const RELIC_IDS = [];
const RELIC_PLACES = {};
for (const [id, name, shape, color, price, places] of RELICS) {
  ITEMS[id] = { id, name, cat: 'artifact', shape, color, price, relic: true };
  RELIC_IDS.push(id);
  RELIC_PLACES[id] = places;
}
export const relicsAt = place => RELIC_IDS.filter(id => RELIC_PLACES[id].includes(place));

// What's under a dig site: usually a fossil piece, sometimes a relic.
export function pickFind(rand, place, missing = null) {
  const relics = relicsAt(place);
  if (relics.length && rand() < 0.2) {
    const want = missing ? relics.filter(id => missing.has(id)) : [];
    const from = want.length && rand() < 0.5 ? want : relics;
    return from[Math.floor(rand() * from.length)];
  }
  return pickPart(rand, place, missing);
}

// ---------- dig sites ----------

// Cracks in the ground: three in the meadow and two in each jar every day,
// the same spots for both of you. Each of you digs your own.
export function digSites(seed, day, place, tiles, taken = new Set()) {
  const rand = rngFor(seed, 'fossil-sites', place, day);
  const n = place === 'meadow' ? 3 : 2;
  return shuffle(rand, tiles.filter(t => !taken.has(t.c + ',' + t.r))).slice(0, n).map(t => ({ c: t.c, r: t.r }));
}

export function sitesDug(state, place) {
  const all = (state.daily.fossils ||= {});
  return (all[place] ||= []);
}

// ---------- the dig kit ----------

export const DIG_KITS = [
  { id: 0, name: 'No dig kit', energy: 0, price: 0 },
  { id: 1, name: 'Dig kit', energy: 16, price: 150, text: 'A brush and a little hammer.' },
  { id: 2, name: 'Expert dig kit', energy: 22, price: 1500, text: 'More energy, and you can see where the fossil is.' },
];

export function buyKit(state, tier) {
  const kit = DIG_KITS[tier];
  if (!kit || (state.digKit || 0) >= tier) return { ok: false, reason: 'You already have that.' };
  if ((state.digKit || 0) < tier - 1) return { ok: false, reason: 'Get the dig kit first.' };
  if (state.pebbles < kit.price) return { ok: false, reason: 'Not enough pebbles.' };
  state.pebbles -= kit.price;
  state.digKit = tier;
  return { ok: true };
}

// ---------- the excavation game ----------

// A 7 × 6 patch of ground. Each cell has some dirt on it (depth); the fossil
// lies under some of the cells. Brush away one layer at a time, or use the
// hammer to clear a cross of dirt at once. Hit the fossil itself with the
// hammer and it cracks. Each tap uses energy.
export const DIG_W = 7, DIG_H = 6;

export function makeExcavation(rand, partId, kitTier = 1) {
  const s = PART_INFO[partId] && SPECIMEN_BY_ID[PART_INFO[partId].specimen];
  const size = !s || s.plan === 'single' ? randInt(rand, 3, 5) : randInt(rand, 5, 8);
  const fossil = new Set();
  let c = randInt(rand, 2, DIG_W - 3), r = randInt(rand, 1, DIG_H - 2);
  fossil.add(r * DIG_W + c);
  // A wandering blob, so each fossil has its own shape.
  for (let tries = 0; fossil.size < size && tries < 80; tries++) {
    const [dc, dr] = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rand() * 4)];
    const nc = c + dc, nr = r + dr;
    if (nc < 0 || nr < 0 || nc >= DIG_W || nr >= DIG_H) continue;
    c = nc; r = nr;
    fossil.add(r * DIG_W + c);
  }
  const cells = [];
  for (let i = 0; i < DIG_W * DIG_H; i++) {
    const f = fossil.has(i);
    cells.push({ fossil: f, depth: f ? randInt(rand, 2, 3) : randInt(rand, 1, 3) });
  }
  const energy = DIG_KITS[kitTier]?.energy || DIG_KITS[1].energy;
  return { part: partId, cells, energy, maxEnergy: energy, cracks: 0, done: false, quality: null, xray: kitTier >= 2 };
}

const neighbours = i => {
  const c = i % DIG_W, r = Math.floor(i / DIG_W);
  return [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dc, dr]) => c + dc >= 0 && c + dc < DIG_W && r + dr >= 0 && r + dr < DIG_H)
    .map(([dc, dr]) => (r + dr) * DIG_W + c + dc);
};

function dig(ex, i, amount) {
  const cell = ex.cells[i];
  if (cell.fossil && amount > cell.depth) ex.cracks++;
  cell.depth = Math.max(0, cell.depth - amount);
}

export const fossilFree = ex => ex.cells.every(c => !c.fossil || c.depth === 0);

function finish(ex) {
  if (fossilFree(ex)) ex.done = true;
  else if (ex.energy <= 0) ex.done = true;
  if (ex.done) ex.quality = !fossilFree(ex) || ex.cracks > 3 ? 'rough' : ex.cracks === 0 ? 'perfect' : 'good';
  return ex;
}

// tool: 'brush' (one cell, one layer, never cracks) or 'hammer' (two layers
// here and one on each side, cracks the fossil if it hits bare bone).
export function excavate(ex, tool, i) {
  if (ex.done || ex.energy <= 0) return ex;
  if (tool === 'hammer') {
    dig(ex, i, 2);
    for (const n of neighbours(i)) dig(ex, n, 1);
  } else {
    if (ex.cells[i].depth === 0) return ex;
    dig(ex, i, 1);
  }
  ex.energy--;
  return finish(ex);
}

export const QUALITY_NAMES = { perfect: 'Perfect', good: 'Good', rough: 'A bit rough' };
const QUALITY_RANK = { rough: 1, good: 2, perfect: 3 };
// Pebbles for a careful dig.
export const QUALITY_BONUS = { perfect: 25, good: 10, rough: 0 };

// Takes the fossil home. Remembers your best dig of each piece.
export function claimExcavation(state, ex, addItem) {
  if (!ex.done || ex.claimed) return false;
  if (!addItem(state, ex.part, 1)) return false;
  ex.claimed = true;
  const best = (state.fossilQuality ||= {});
  if ((QUALITY_RANK[ex.quality] || 0) > (QUALITY_RANK[best[ex.part]] || 0)) best[ex.part] = ex.quality;
  state.pebbles += QUALITY_BONUS[ex.quality] || 0;
  state.fossilsDug = (state.fossilsDug || 0) + 1;
  return true;
}

export const betterQuality = (a, b) => (QUALITY_RANK[a] || 0) > (QUALITY_RANK[b] || 0);

// ---------- piecing a skeleton together ----------

// donated: a Set of piece ids the museum has.
export const specimenComplete = (s, donated) => s.parts.every(id => donated.has(id));

// The assembly puzzle: put each piece in its place on the skeleton.
// order: the pieces in the order you placed them; it must match.
export function assemblyRight(s, placed) {
  return s.parts.every((id, i) => placed[i] === id);
}
export const ASSEMBLE_REWARD = n => 60 * n;
