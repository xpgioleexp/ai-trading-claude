// Wild animals: visitors that wander through the meadow and the jars at their
// own times (see conditions.js). Walk up and tap one to spot it; it goes in
// your wildlife journal, with pebbles the first time. Up to six are out at
// once, the same ones for both of you.
import { rngFor, pickWeighted } from './rng.js';
import { conditionsMet } from './conditions.js';
import { timeBlock } from './bugs.js';

const SP = ['spring'], SU = ['summer'], AU = ['autumn'], WI = ['winter'];

// [id, name, shape, colour, accent, behaviour, rarity, places, conditions]
// Swimmers need water: conditions.water is the pond or jar water they swim in.
const ROWS = [
  // the meadow
  ['red_fox', 'Red fox', 'fox', '#D9803A', '#F2EDE4', 'shy', 'uncommon', ['meadow'], { time: 'dusk' }],
  ['roe_deer', 'Roe deer', 'deer', '#B88D60', '#F2EDE4', 'shy', 'uncommon', ['meadow'], { time: 'dawn' }],
  ['fawn', 'Fawn', 'deer', '#C9A272', '#F2EDE4', 'shy', 'rare', ['meadow'], { seasons: SP, time: 'day' }],
  ['wild_rabbit', 'Wild rabbit', 'bunny', '#9C8266', null, 'hopper', 'common', ['meadow'], { time: 'day' }],
  ['hare', 'Brown hare', 'bunny', '#B88D60', null, 'hopper', 'uncommon', ['meadow'], { seasons: SP }],
  ['badger', 'Badger', 'bear', '#5A5A60', '#F2F4F6', 'digger', 'uncommon', ['meadow'], { time: 'night' }],
  ['wild_hedgehog', 'Wild hedgehog', 'hedgehog', '#7A5A40', null, 'scuttle', 'common', ['meadow'], { time: 'night', seasons: ['spring', 'summer', 'autumn'] }],
  ['field_mouse', 'Field mouse', 'mouse', '#9C7A5A', null, 'scuttle', 'common', ['meadow', 'flower'], {}],
  ['dormouse', 'Dormouse', 'mouse', '#D9A25A', null, 'lazy', 'rare', ['meadow'], { seasons: AU }],
  ['mole_wild', 'Mole', 'mole', '#3A3A40', null, 'digger', 'uncommon', ['meadow'], { needs: 'puddles' }],
  ['red_squirrel', 'Red squirrel', 'squirrel', '#C9603A', null, 'darter', 'common', ['meadow'], { time: 'day' }],
  ['grey_squirrel', 'Grey squirrel', 'squirrel', '#8A8A90', null, 'darter', 'common', ['meadow', 'glade'], { time: 'day' }],
  ['robin_wild', 'Wild robin', 'bird', '#8A6448', '#D9533C', 'hopper', 'common', ['meadow'], { seasons: ['autumn', 'winter'] }],
  ['blue_tit', 'Blue tit', 'bird', '#6F97C9', '#F0DA6A', 'flitter', 'common', ['meadow'], { time: 'day' }],
  ['wren', 'Wren', 'bird', '#9C7046', '#C9A272', 'flitter', 'uncommon', ['meadow'], { time: 'dawn' }],
  ['magpie', 'Magpie', 'bird', '#2A2A30', '#F2F4F6', 'hopper', 'common', ['meadow'], { time: 'day' }],
  ['woodpecker', 'Woodpecker', 'bird', '#2A2A30', '#C9283A', 'darter', 'uncommon', ['meadow', 'glade'], { time: 'day' }],
  ['kingfisher', 'Kingfisher', 'bird', '#3F8FD9', '#E0873A', 'flyer', 'rare', ['meadow'], { time: 'dawn' }],
  ['barn_owl', 'Barn owl', 'owl', '#E9D7A8', '#F2F4F6', 'sitter', 'uncommon', ['meadow'], { time: 'night' }],
  ['tawny_owl', 'Tawny owl', 'owl', '#9C7046', '#E9D7A8', 'sitter', 'uncommon', ['meadow', 'glade'], { time: 'night' }],
  ['pipistrelle', 'Pipistrelle bat', 'bat', '#5A4A40', null, 'orbit', 'common', ['meadow'], { time: 'dusk' }],
  ['mallard', 'Mallard', 'duck', '#7A5A40', null, 'swimmer', 'common', ['meadow'], { water: 'pond' }],
  ['swan', 'Mute swan', 'duck', '#F2F4F6', null, 'swimmer', 'rare', ['meadow'], { water: 'pond', seasons: ['autumn', 'winter', 'spring'] }],
  ['heron', 'Grey heron', 'crane', '#9AA4B0', '#E8C25A', 'sitter', 'uncommon', ['meadow'], { time: 'dawn' }],
  ['otter_wild', 'River otter', 'otter', '#7A5A40', null, 'swimmer', 'rare', ['meadow'], { water: 'pond', time: 'dusk' }],
  ['common_frog', 'Common frog', 'toad', '#7A9A5A', null, 'hopper', 'common', ['meadow'], { weather: 'rain' }],
  ['toad_wild', 'Common toad', 'toad', '#9A8A5A', null, 'hopper', 'common', ['meadow'], { time: 'night', seasons: ['spring', 'summer'] }],
  ['grass_snake', 'Grass snake', 'snake', '#5E8A4A', '#E8C25A', 'slider', 'uncommon', ['meadow'], { seasons: SU, time: 'day' }],
  ['slow_worm', 'Slow worm', 'snake', '#B5853A', null, 'slider', 'uncommon', ['meadow'], { weather: 'rain' }],
  ['pond_turtle', 'Pond turtle', 'turtle', '#5E7A4A', null, 'lazy', 'uncommon', ['meadow'], { seasons: SU }],
  ['garden_snail_wild', 'Giant snail', 'snail', '#C9A272', null, 'lazy', 'common', ['meadow'], { needs: 'puddles' }],
  ['stoat', 'Stoat', 'fox', '#B5653A', '#F2F4F6', 'darter', 'rare', ['meadow'], { seasons: SU }],
  ['ermine', 'Ermine', 'fox', '#F2F4F6', '#2A2A30', 'darter', 'rare', ['meadow', 'snow'], { seasons: WI }],
  ['white_stag', 'White stag', 'deer', '#F2F4F6', '#E8C25A', 'shy', 'legend', ['meadow'], { needs: 'fullmoon' }],
  ['rainbow_bird', 'Rainbow lorikeet', 'bird', '#6FAF5B', '#E8707A', 'flitter', 'rare', ['meadow', 'flower'], { needs: 'rainbow' }],
  ['storm_crow', 'Storm crow', 'bird', '#2A2A40', '#4F5F8A', 'hopper', 'uncommon', ['meadow', 'beach'], { weather: 'storm' }],
  ['frost_fox', 'Frost-touched fox', 'fox', '#E9F2F6', '#9FC3D0', 'shy', 'rare', ['meadow'], { needs: 'frost' }],
  ['wind_kite', 'Red kite', 'bird', '#B5653A', '#2A2A30', 'flyer', 'uncommon', ['meadow'], { weather: 'wind' }],
  ['fog_hound', 'Misty hound', 'fox', '#C9C9CF', null, 'shy', 'rare', ['meadow', 'glade'], { weather: 'fog' }],
  // the beach
  ['seal', 'Harbour seal', 'seal', '#9AA4B0', null, 'lazy', 'uncommon', ['beach'], {}],
  ['sea_lion', 'Sea lion', 'seal', '#9C7046', null, 'lazy', 'rare', ['beach'], { time: 'day' }],
  ['sea_otter', 'Sea otter', 'otter', '#7A5A40', null, 'swimmer', 'rare', ['beach'], { water: 'water' }],
  ['dolphin', 'Dolphin', 'seal', '#7D8796', null, 'swimmer', 'rare', ['beach'], { water: 'water', time: 'day' }],
  ['sea_turtle', 'Sea turtle', 'turtle', '#5E8A6A', null, 'swimmer', 'rare', ['beach'], { water: 'water', time: 'night' }],
  ['puffin', 'Puffin', 'penguin', '#2A2A30', '#E0873A', 'hopper', 'uncommon', ['beach'], {}],
  ['seagull_wild', 'Herring gull', 'bird', '#F2F4F6', '#9AA4B0', 'hopper', 'common', ['beach'], {}],
  ['sandpiper', 'Sandpiper', 'bird', '#C9A272', null, 'scuttle', 'common', ['beach'], { time: 'day' }],
  ['flamingo', 'Flamingo', 'crane', '#F2A0B0', '#2A2A30', 'sitter', 'rare', ['beach', 'desert'], { time: 'day' }],
  ['fiddler_crab', 'Fiddler crab', 'crab', '#E0703A', null, 'scuttle', 'common', ['beach'], {}],
  ['blue_crab', 'Blue crab', 'crab', '#5F7FB5', null, 'scuttle', 'uncommon', ['beach'], { time: 'night' }],
  ['frigatebird', 'Frigatebird', 'bird', '#2A2A30', '#C9283A', 'flyer', 'uncommon', ['beach'], { weather: 'wind' }],
  ['albatross', 'Albatross', 'pelican', '#F2F4F6', '#E8C25A', 'flyer', 'rare', ['beach'], { weather: 'storm' }],
  ['beach_iguana', 'Marine iguana', 'lizard', '#3A3A40', null, 'lazy', 'uncommon', ['beach'], { time: 'day' }],
  ['moon_whale', 'Moon whale', 'seal', '#3F4A6A', '#DCE6F2', 'swimmer', 'legend', ['beach'], { water: 'water', needs: 'fullmoon' }],
  // the snow jar
  ['arctic_fox_wild', 'Arctic fox', 'fox', '#F2F4F6', null, 'pouncer', 'uncommon', ['snow'], {}],
  ['snow_hare', 'Snowshoe hare', 'bunny', '#F2F4F6', null, 'hopper', 'common', ['snow'], {}],
  ['reindeer', 'Reindeer', 'deer', '#9C7046', '#F2EDE4', 'wander', 'uncommon', ['snow'], { time: 'day' }],
  ['polar_bear_cub', 'Polar bear cub', 'bear', '#F2F4F6', null, 'lazy', 'rare', ['snow'], {}],
  ['snowy_owl', 'Snowy owl', 'owl', '#F2F4F6', '#2A2A30', 'sitter', 'rare', ['snow'], { time: 'night' }],
  ['emperor_penguin', 'Emperor penguin', 'penguin', '#2A2A30', '#E8C25A', 'slider', 'uncommon', ['snow'], {}],
  ['chick_penguin', 'Penguin chick', 'penguin', '#9AA4B0', null, 'follower', 'rare', ['snow'], { time: 'day' }],
  ['walrus', 'Walrus', 'seal', '#9C7A5A', '#F2EDE4', 'lazy', 'rare', ['snow'], { time: 'day' }],
  ['harp_seal_pup', 'Harp seal pup', 'seal', '#F2F4F6', null, 'lazy', 'uncommon', ['snow'], {}],
  ['lemming', 'Lemming', 'mouse', '#C9A272', null, 'scuttle', 'common', ['snow'], {}],
  ['ptarmigan', 'Ptarmigan', 'bird', '#F2F4F6', '#C9283A', 'hopper', 'common', ['snow'], {}],
  ['snow_leopard', 'Snow leopard', 'cat', '#E9E6E0', '#5A5A60', 'shy', 'legend', ['snow', 'springs'], { hours: [[4, 6]] }],
  ['wolverine', 'Wolverine', 'bear', '#5A3A2A', '#C9A272', 'darter', 'rare', ['snow'], { time: 'night' }],
  ['musk_ox', 'Musk ox', 'bear', '#5A4130', '#E9D7A8', 'wander', 'uncommon', ['snow'], {}],
  // the flower jar
  ['hummingbird', 'Hummingbird', 'bird', '#3FA87A', '#C9283A', 'orbit', 'uncommon', ['flower'], { time: 'day' }],
  ['bee_eater', 'Bee-eater', 'bird', '#3FA8A0', '#F0DA6A', 'flitter', 'rare', ['flower'], { time: 'day' }],
  ['goldfinch', 'Goldfinch', 'bird', '#F0DA6A', '#C9283A', 'flitter', 'common', ['flower', 'meadow'], { time: 'day' }],
  ['harvest_mouse', 'Harvest mouse', 'mouse', '#E0A060', null, 'scuttle', 'common', ['flower'], {}],
  ['lamb', 'Spring lamb', 'bunny', '#F2F4F6', null, 'hopper', 'uncommon', ['flower'], { time: 'day' }],
  ['peacock', 'Peacock', 'crane', '#3F6FD9', '#3FA87A', 'wander', 'rare', ['flower'], { time: 'day' }],
  ['flower_deer', 'Spotted deer', 'deer', '#D9A272', '#F2F4F6', 'shy', 'uncommon', ['flower'], { time: 'dawn' }],
  ['tortoise', 'Garden tortoise', 'turtle', '#9C7A4A', null, 'lazy', 'common', ['flower', 'desert'], { time: 'day' }],
  ['white_swan', 'Lotus swan', 'duck', '#F2F4F6', '#F2C4C8', 'swimmer', 'rare', ['flower'], { water: 'water' }],
  ['mandarin_duck', 'Mandarin duck', 'duck', '#E0873A', '#3F6FD9', 'swimmer', 'uncommon', ['flower', 'springs'], { water: 'water' }],
  ['fairy_wren', 'Fairy wren', 'bird', '#3F8FD9', '#2A2A30', 'flitter', 'rare', ['flower'], { time: 'dawn' }],
  ['petal_bunny', 'Petal bunny', 'bunny', '#F2C4C8', null, 'hopper', 'legend', ['flower'], { needs: 'rainbow' }],
  // the desert
  ['camel_wild', 'Wild camel', 'camel', '#C9A272', null, 'wander', 'uncommon', ['desert'], { time: 'day' }],
  ['fennec_fox', 'Fennec fox', 'fox', '#E9C9A0', null, 'shy', 'uncommon', ['desert'], { time: 'night' }],
  ['meerkat', 'Meerkat', 'mouse', '#C9A272', null, 'peeker', 'common', ['desert'], { time: 'day' }],
  ['jerboa', 'Jerboa', 'mouse', '#E9D7A8', null, 'hopper', 'common', ['desert'], { time: 'night' }],
  ['roadrunner', 'Roadrunner', 'bird', '#9C7A5A', '#3F6FD9', 'darter', 'uncommon', ['desert'], { time: 'day' }],
  ['gila_monster', 'Gila monster', 'lizard', '#E0873A', '#2A2A30', 'lazy', 'rare', ['desert'], { time: 'dusk' }],
  ['horned_lizard', 'Horned lizard', 'lizard', '#C9A272', null, 'lazy', 'common', ['desert'], { time: 'day' }],
  ['rattlesnake', 'Rattlesnake', 'snake', '#B88D60', '#5A4130', 'slider', 'uncommon', ['desert'], { time: 'dusk' }],
  ['desert_tortoise', 'Desert tortoise', 'turtle', '#B88D60', null, 'lazy', 'uncommon', ['desert'], {}],
  ['vulture', 'Vulture', 'pelican', '#5A4130', '#E9C9B0', 'sitter', 'uncommon', ['desert'], { weather: 'heat' }],
  ['desert_owl', 'Elf owl', 'owl', '#B88D60', '#E9D7A8', 'sitter', 'rare', ['desert'], { time: 'night' }],
  ['caracal', 'Caracal', 'cat', '#C9783A', '#2A2A30', 'pouncer', 'rare', ['desert'], { time: 'dusk' }],
  ['golden_camel', 'Golden camel', 'camel', '#E8C25A', '#F7EDC0', 'wander', 'legend', ['desert'], { needs: 'fullmoon' }],
  // the rainforest
  ['toucan', 'Toucan', 'bird', '#2A2A30', '#F0A040', 'flitter', 'uncommon', ['rainforest'], { time: 'day' }],
  ['macaw', 'Scarlet macaw', 'bird', '#C9283A', '#3F6FD9', 'flyer', 'uncommon', ['rainforest'], { time: 'day' }],
  ['tree_frog', 'Red-eyed tree frog', 'toad', '#5EBF4A', '#C9283A', 'hopper', 'common', ['rainforest'], { time: 'night' }],
  ['poison_frog', 'Poison dart frog', 'toad', '#3F6FD9', '#2A2A30', 'hopper', 'uncommon', ['rainforest'], {}],
  ['jaguar', 'Jaguar', 'cat', '#E8B83A', '#2A2A30', 'shy', 'legend', ['rainforest'], { time: 'night', hours: [[1, 4]] }],
  ['tapir', 'Tapir', 'bear', '#3A3A40', '#F2F4F6', 'wander', 'rare', ['rainforest'], { time: 'dusk' }],
  ['capuchin', 'Capuchin monkey', 'monkey', '#5A4130', '#E9C9B0', 'darter', 'common', ['rainforest'], { time: 'day' }],
  ['howler', 'Howler monkey', 'monkey', '#7A3A2A', null, 'sitter', 'uncommon', ['rainforest'], { time: 'dawn' }],
  ['three_toed_sloth', 'Three-toed sloth', 'sloth', '#9C8266', null, 'lazy', 'uncommon', ['rainforest'], {}],
  ['anaconda', 'Anaconda', 'snake', '#5E7A3A', '#2A2A30', 'slider', 'rare', ['rainforest'], { water: 'water' }],
  ['caiman', 'Caiman', 'lizard', '#5E7A4A', null, 'lazy', 'rare', ['rainforest'], { time: 'night' }],
  ['coati', 'Coati', 'fox', '#9C7046', null, 'scuttle', 'common', ['rainforest'], { time: 'day' }],
  ['okapi', 'Okapi', 'deer', '#5A3A2A', '#F2F4F6', 'shy', 'rare', ['rainforest'], { time: 'dawn' }],
  ['quetzal', 'Quetzal', 'bird', '#3FA87A', '#C9283A', 'flyer', 'rare', ['rainforest'], { weather: 'rain' }],
  // the mushroom glade
  ['pine_marten', 'Pine marten', 'fox', '#7A4A30', '#F0DA6A', 'darter', 'uncommon', ['glade'], {}],
  ['wild_boar', 'Wild boar', 'bear', '#5A4130', null, 'digger', 'uncommon', ['glade'], { time: 'dusk' }],
  ['wood_mouse', 'Wood mouse', 'mouse', '#9C7A5A', null, 'scuttle', 'common', ['glade'], { time: 'night' }],
  ['glow_toad', 'Glow toad', 'toad', '#9FF0C0', null, 'hopper', 'uncommon', ['glade'], { time: 'night' }],
  ['moss_tortoise', 'Moss tortoise', 'turtle', '#5E7A4A', '#9FF0C0', 'lazy', 'rare', ['glade'], {}],
  ['long_eared_owl', 'Long-eared owl', 'owl', '#7A5A40', '#E0873A', 'sitter', 'uncommon', ['glade'], { time: 'night' }],
  ['fairy_fox', 'Fairy fox', 'fox', '#C9A0E8', '#F2F4F6', 'shy', 'legend', ['glade'], { hours: [[0, 2]] }],
  ['spore_deer', 'Spore deer', 'deer', '#9C8266', '#9FF0C0', 'shy', 'rare', ['glade'], { time: 'dawn' }],
  ['salamander', 'Fire salamander', 'lizard', '#2A2A30', '#F0DA6A', 'lazy', 'uncommon', ['glade'], { weather: 'fog' }],
  ['noctule_bat', 'Noctule bat', 'bat', '#7A5A40', null, 'orbit', 'common', ['glade'], { time: 'dusk' }],
  // the hot springs
  ['snow_monkey', 'Snow monkey', 'monkey', '#B9A890', '#E8A0B0', 'sitter', 'uncommon', ['springs'], {}],
  ['red_panda', 'Red panda', 'fox', '#C9603A', '#F2F4F6', 'darter', 'rare', ['springs'], {}],
  ['tanuki', 'Tanuki', 'bear', '#7A6A5A', '#2A2A30', 'scuttle', 'common', ['springs'], { time: 'dusk' }],
  ['crane_wild', 'Red-crowned crane', 'crane', '#F2F4F6', '#C9283A', 'sitter', 'rare', ['springs'], { time: 'dawn' }],
  ['serow', 'Serow', 'deer', '#5A5A60', null, 'shy', 'uncommon', ['springs'], {}],
  ['flying_squirrel', 'Flying squirrel', 'squirrel', '#9C8266', '#F2EDE4', 'darter', 'uncommon', ['springs', 'glade'], { time: 'night' }],
  ['panda', 'Giant panda', 'bear', '#F2F4F6', '#2A2A30', 'lazy', 'legend', ['springs'], { hours: [[6, 7]] }],
  ['koi_heron', 'Night heron', 'crane', '#5A6A80', '#E8C25A', 'sitter', 'uncommon', ['springs'], { time: 'night' }],
  ['white_fox', 'Nine-tailed fox', 'fox', '#F7F2E8', '#E8C25A', 'shy', 'legend', ['springs'], { needs: 'fullmoon' }],
  ['mountain_hare', 'Mountain hare', 'bunny', '#C9C2B5', null, 'hopper', 'common', ['springs'], {}],
  // Starlight isle
  ['star_bunny', 'Star bunny', 'bunny', '#F2E48A', null, 'hopper', 'uncommon', ['stars'], {}],
  ['moon_cat', 'Moon cat', 'cat', '#DCE6F2', '#3F4A6A', 'sitter', 'rare', ['stars'], {}],
  ['comet_bird', 'Comet bird', 'bird', '#F2E48A', '#E0873A', 'flyer', 'uncommon', ['stars'], {}],
  ['nebula_owl', 'Nebula owl', 'owl', '#9C82C9', '#F2E48A', 'sitter', 'rare', ['stars'], {}],
  ['star_deer', 'Star deer', 'deer', '#3F4A6A', '#F2E48A', 'shy', 'rare', ['stars'], {}],
  ['dream_sheep', 'Dream sheep', 'bunny', '#F2F4F6', '#C9A0E8', 'lazy', 'common', ['stars'], {}],
  ['cloud_whale', 'Cloud whale', 'seal', '#DCE6F2', '#9FC3D9', 'lazy', 'legend', ['stars'], { hours: [[3, 4]] }],
  ['galaxy_fox', 'Galaxy fox', 'fox', '#2A2A50', '#9C82C9', 'shy', 'rare', ['stars'], { needs: 'fullmoon' }],
  ['meteor_hedgehog', 'Meteor hedgehog', 'hedgehog', '#5A5066', '#F2E48A', 'scuttle', 'uncommon', ['stars'], {}],
  ['moon_bat', 'Moon bat', 'bat', '#3F4A6A', '#DCE6F2', 'orbit', 'common', ['stars'], {}],
  // more, here and there
  ['pheasant', 'Pheasant', 'bird', '#B5653A', '#3F8F5A', 'scuttle', 'uncommon', ['meadow'], { seasons: AU }],
  ['partridge', 'Partridge', 'bird', '#9C8266', '#C9603A', 'scuttle', 'common', ['meadow'], { seasons: ['autumn', 'winter'] }],
  ['skylark', 'Skylark', 'bird', '#B88D60', null, 'flyer', 'common', ['meadow'], { seasons: SP, time: 'dawn' }],
  ['swallow', 'Barn swallow', 'bird', '#2A3A6A', '#E8A07A', 'orbit', 'common', ['meadow'], { seasons: SU }],
  ['nightingale', 'Nightingale', 'bird', '#9C7A5A', null, 'sitter', 'rare', ['meadow', 'flower'], { seasons: SP, time: 'night' }],
  ['weasel', 'Weasel', 'fox', '#B5653A', '#F2EDE4', 'darter', 'uncommon', ['meadow'], {}],
  ['vole', 'Water vole', 'mouse', '#7A5A40', null, 'scuttle', 'common', ['meadow'], { needs: 'puddles' }],
  ['moorhen', 'Moorhen', 'duck', '#2A2A30', '#C9283A', 'swimmer', 'common', ['meadow'], { water: 'pond6' }],
  ['great_crested_grebe', 'Great crested grebe', 'duck', '#9C7A5A', '#E0873A', 'swimmer', 'uncommon', ['meadow'], { water: 'pond3', seasons: SP }],
  ['lizard_wild', 'Common lizard', 'lizard', '#8A7A5A', null, 'lazy', 'common', ['meadow'], { weather: 'heat' }],
  ['beaver', 'Beaver', 'otter', '#7A4A30', null, 'swimmer', 'rare', ['meadow'], { water: 'pond4', time: 'dusk' }],
  ['hermit_crab_wild', 'Big hermit crab', 'crab', '#E9C9B0', null, 'scuttle', 'common', ['beach'], { time: 'night' }],
  ['pelican_wild', 'Brown pelican', 'pelican', '#9C7A5A', '#E8C25A', 'sitter', 'uncommon', ['beach'], { time: 'day' }],
  ['arctic_tern', 'Arctic tern', 'bird', '#F2F4F6', '#C9283A', 'flyer', 'common', ['snow', 'beach'], {}],
  ['snow_goose', 'Snow goose', 'duck', '#F2F4F6', '#E0873A', 'wander', 'common', ['snow'], { time: 'day' }],
  ['axolotl_wild', 'Wild axolotl', 'lizard', '#F2B5C0', null, 'lazy', 'rare', ['springs', 'glade'], { time: 'night' }],
  ['quokka', 'Quokka', 'bunny', '#9C7A5A', null, 'hopper', 'rare', ['flower', 'desert'], { time: 'day' }],
  ['armadillo', 'Armadillo', 'hedgehog', '#9C8A70', null, 'digger', 'uncommon', ['desert'], { time: 'night' }],
  ['chameleon', 'Chameleon', 'lizard', '#7FAF5B', '#E8B83A', 'lazy', 'uncommon', ['rainforest'], {}],
  ['pangolin', 'Pangolin', 'hedgehog', '#9C7046', null, 'scuttle', 'rare', ['rainforest'], { time: 'night' }],
  ['hedgehog_star', 'Stargazer hedgehog', 'hedgehog', '#3F4A6A', '#F2E48A', 'sitter', 'legend', ['meadow'], { hours: [[2, 3]] }],
];

export const WILD = ROWS.map(([id, name, shape, color, accent, behavior, rarity, places, conds]) => ({
  id, name, species: name.toLowerCase(), shape, color, accent, behavior, rarity, places, ...conds, wild: true, lines: [],
}));
export const WILD_BY_ID = Object.fromEntries(WILD.map(w => [w.id, w]));
export const WILD_AT_ONCE = 6;
const WEIGHT = { common: 60, uncommon: 25, rare: 7, legend: 2 };
export const SPOT_PEBBLES = { common: 20, uncommon: 50, rare: 150, legend: 500 };

// Who's out right now in this place. ctx: { season, hour, weather, wx, day }.
export function wildOut(place, ctx) {
  return WILD.filter(w => w.places.includes(place) && conditionsMet(w, { ...ctx, place }));
}

// Which ones you'll meet this time block: the same for both of you.
export function wildVisitors(seed, day, place, ctx) {
  const pool = wildOut(place, { ...ctx, day });
  if (!pool.length) return [];
  const rand = rngFor(seed, 'wild', place, day, timeBlock(ctx.hour));
  const out = [];
  const left = [...pool];
  for (let i = 0; i < WILD_AT_ONCE && left.length; i++) {
    const w = pickWeighted(rand, left, x => WEIGHT[x.rarity]);
    out.push(w);
    left.splice(left.indexOf(w), 1);
  }
  return out;
}

// Spotting one. Returns { first, pebbles, count } or null if you already spotted it today.
export function spotAnimal(state, id, day) {
  const w = WILD_BY_ID[id];
  if (!w) return null;
  const log = (state.log.animals ||= {});
  const entry = log[id] || { count: 0, first: day, last: null };
  if (entry.last === day) return null;
  const first = entry.count === 0;
  entry.count++;
  entry.last = day;
  log[id] = entry;
  const pebbles = first ? SPOT_PEBBLES[w.rarity] : 0;
  state.pebbles += pebbles;
  return { first, pebbles, count: entry.count };
}

