// A lot more furniture for your home, in themed sets, and more for the walls.
// Each piece is drawn from its `form` with two colours (see home-art.js), so
// adding a row adds a piece. use: what tapping it does in your home.
import { FURNITURE, FURNITURE_BY_TYPE, WALL_ITEMS, WALL_BY_TYPE } from './home.js';

// [type, name, price, w, h, form, colour, accent, use]
const SETS = {
  Cottage: [
    ['cottage_bed', 'Quilted cottage bed', 160, 2, 2, 'bed', '#B88D60', '#D9849A', 'sleep'],
    ['cottage_armchair', 'Floral armchair', 70, 1, 1, 'armchair', '#E9C9B0', '#D9849A', 'sit'],
    ['cottage_table', 'Farmhouse table', 80, 2, 1, 'table', '#B88D60', '#F2EDE4'],
    ['cottage_dresser', 'Painted dresser', 85, 2, 1, 'cabinet', '#C9D9C0', '#E8C25A', 'wardrobe'],
    ['cottage_shelf', 'Teacup shelf', 75, 1, 1, 'shelf', '#B88D60', '#E07A9B', 'journal'],
    ['cottage_lamp', 'Frilly lamp', 40, 1, 1, 'lamp', '#B88D60', '#F2C4C8'],
    ['cottage_rug', 'Rag rug', 45, 2, 2, 'round_rug', '#D9849A', '#E9D7A8'],
    ['rocking_stool', 'Milking stool', 20, 1, 1, 'stool', '#9C7046', '#C9A272', 'sit'],
    ['flower_basket', 'Flower basket', 30, 1, 1, 'vase', '#C9A272', '#E07A9B'],
    ['wood_stove_cottage', 'Cast-iron stove', 120, 1, 1, 'stove', '#3A3A40', '#E8603A', 'cook'],
  ],
  Modern: [
    ['modern_bed', 'Platform bed', 180, 2, 2, 'bed', '#E9E6E0', '#7D8796', 'sleep'],
    ['modern_sofa', 'Grey sofa', 150, 2, 1, 'sofa', '#9A9AA0', '#C9C9CF', 'sit'],
    ['modern_chair', 'Moulded chair', 50, 1, 1, 'chair', '#F2F2F2', '#E8C25A', 'sit'],
    ['glass_table', 'Glass coffee table', 70, 1, 1, 'low_table', '#B9DDE6', '#3A3A40'],
    ['modern_shelf', 'Cube shelf', 90, 1, 1, 'shelf', '#F2F2F2', '#79AAA4', 'journal'],
    ['arc_lamp', 'Arc lamp', 65, 1, 1, 'lamp', '#3A3A40', '#F2F2F2'],
    ['modern_rug', 'Striped rug', 55, 3, 1, 'rug', '#C9C9CF', '#3A3A40'],
    ['tv_stand', 'Big TV', 200, 2, 1, 'tv', '#3A3A40', '#5FA8C9'],
    ['speaker', 'Smart speaker', 60, 1, 1, 'speaker', '#3A3A40', '#79AAA4', 'music'],
    ['modern_desk', 'Standing desk', 110, 2, 1, 'desk', '#F2F2F2', '#3A3A40', 'calendar'],
  ],
  Cabin: [
    ['log_bed', 'Log bed', 170, 2, 2, 'bed', '#7A5A3A', '#B5324A', 'sleep'],
    ['plaid_sofa', 'Plaid sofa', 140, 2, 1, 'sofa', '#B5324A', '#3A3A40', 'sit'],
    ['log_table', 'Log table', 75, 2, 1, 'table', '#7A5A3A', '#C9A272'],
    ['stump_stool', 'Stump stool', 15, 1, 1, 'stump', '#7A5A3A', '#C9A272', 'sit'],
    ['cabin_lamp', 'Oil lamp', 35, 1, 1, 'table_lamp', '#7A5A3A', '#F2C46A'],
    ['plaid_rug', 'Plaid rug', 50, 2, 2, 'rug', '#B5324A', '#3A3A40'],
    ['firewood_rack', 'Firewood rack', 40, 1, 1, 'firewood', '#5A4130', '#B88D60'],
    ['antler_coat_rack', 'Coat rack', 35, 1, 1, 'coat_rack', '#5A4130', '#5E8A6A'],
    ['cabin_chest', 'Trunk', 60, 1, 1, 'chest', '#7A5A3A', '#9A958A', 'bag'],
  ],
  Japanese: [
    ['futon', 'Futon', 110, 2, 2, 'futon', '#F2EDE4', '#5F7FB5', 'sleep'],
    ['zabuton', 'Floor cushion', 20, 1, 1, 'cushion', '#B5324A', '#E8C25A', 'sit'],
    ['kotatsu', 'Kotatsu', 120, 2, 1, 'kotatsu', '#B88D60', '#B5324A'],
    ['tansu', 'Tansu chest', 130, 2, 1, 'cabinet', '#7A5A3A', '#3A3A40', 'wardrobe'],
    ['andon_lamp', 'Paper lamp', 45, 1, 1, 'lantern', '#B88D60', '#F5EED8'],
    ['tatami', 'Tatami mat', 60, 2, 2, 'tatami', '#C9C27A', '#5E8A4A'],
    ['ikebana', 'Ikebana vase', 40, 1, 1, 'vase', '#3A3A40', '#E07A9B'],
    ['tea_set_table', 'Tea ceremony set', 70, 1, 1, 'low_table', '#7A5A3A', '#7FAF5B'],
  ],
  Seaside: [
    ['seaside_bed', 'Seashell bed', 160, 2, 2, 'bed', '#F2F4F6', '#5F9FB5', 'sleep'],
    ['wicker_chair', 'Wicker chair', 60, 1, 1, 'armchair', '#D9B47A', '#5F9FB5', 'sit'],
    ['driftwood_table', 'Driftwood table', 70, 1, 1, 'round_table', '#B9A88A', '#F2E4D0'],
    ['ship_wheel', 'Ship\'s wheel', 80, 1, 1, 'wheel', '#7A5A3A', '#B88D60'],
    ['lighthouse_lamp', 'Lighthouse lamp', 60, 1, 1, 'lighthouse', '#F2F4F6', '#D9533C'],
    ['rope_rug', 'Rope rug', 45, 2, 2, 'round_rug', '#D9C9A0', '#B9A88A'],
    ['anchor_shelf', 'Anchor shelf', 85, 1, 1, 'shelf', '#5F7FB5', '#F2F4F6', 'journal'],
    ['shell_lamp', 'Shell night light', 30, 1, 1, 'table_lamp', '#F2E4D0', '#E8A0A0'],
  ],
  Fairy: [
    ['petal_bed', 'Petal bed', 190, 2, 2, 'bed', '#7FAF5B', '#F2A4C8', 'sleep'],
    ['mushroom_stool', 'Mushroom stool', 25, 1, 1, 'mushroom', '#D9533C', '#F2EDE4', 'sit'],
    ['toadstool_table', 'Toadstool table', 70, 1, 1, 'mushroom', '#B5728A', '#F2EDE4'],
    ['flower_lamp', 'Tulip lamp', 45, 1, 1, 'lamp', '#5E8A4A', '#F2A4C8'],
    ['vine_shelf', 'Vine shelf', 80, 1, 1, 'shelf', '#5E8A4A', '#F2A4C8', 'journal'],
    ['moss_rug', 'Moss rug', 50, 2, 2, 'round_rug', '#7FAF5B', '#5E8A4A'],
    ['leaf_chair', 'Leaf chair', 55, 1, 1, 'armchair', '#7FAF5B', '#C9E0A0', 'sit'],
    ['acorn_cabinet', 'Acorn cupboard', 90, 1, 1, 'tall_cabinet', '#9C7046', '#5E8A4A', 'wardrobe'],
  ],
  Retro: [
    ['retro_sofa', 'Orange sofa', 140, 2, 1, 'sofa', '#E0873A', '#F0C46A', 'sit'],
    ['retro_chair', 'Egg chair', 75, 1, 1, 'armchair', '#F2F2F2', '#E0873A', 'sit'],
    ['retro_tv', 'Box TV', 90, 1, 1, 'tv', '#9C7046', '#79AAA4'],
    ['lava_lamp', 'Lava lamp', 40, 1, 1, 'lava_lamp', '#3A3A40', '#E07A9B'],
    ['record_shelf', 'Record shelf', 80, 1, 1, 'shelf', '#9C7046', '#3A3A40', 'music'],
    ['shag_rug', 'Shag rug', 55, 2, 2, 'round_rug', '#E0A04A', '#E0873A'],
    ['phone_table', 'Telephone table', 45, 1, 1, 'phone', '#9C7046', '#C9333C'],
    ['bean_bag_retro', 'Teal bean bag', 40, 1, 1, 'beanbag', '#79AAA4', '#5F8A86', 'sit'],
  ],
  Study: [
    ['reading_chair', 'Leather reading chair', 110, 1, 1, 'armchair', '#7A3A2A', '#5A2A1A', 'sit'],
    ['big_bookshelf', 'Library bookshelf', 160, 2, 1, 'shelf', '#5A4130', '#5E8A6A', 'journal'],
    ['study_desk', 'Study desk', 120, 2, 1, 'desk', '#5A4130', '#5E8A6A', 'calendar'],
    ['bankers_lamp', 'Green desk lamp', 50, 1, 1, 'table_lamp', '#5A4130', '#5E8A6A'],
    ['library_ladder', 'Library ladder', 45, 1, 1, 'ladder', '#7A5A3A', '#B88D60'],
    ['chalkboard', 'Chalkboard', 60, 1, 1, 'board', '#7A5A3A', '#3A4A3A'],
    ['tea_cart', 'Tea trolley', 70, 1, 1, 'cart', '#B88D60', '#F2EDE4'],
    ['study_rug', 'Persian rug', 90, 3, 1, 'rug', '#8A2A3A', '#E8C25A'],
  ],
  Kitchen: [
    ['fridge', 'Fridge', 140, 1, 1, 'fridge', '#E9E6E0', '#9A9AA0'],
    ['range_oven', 'Range oven', 150, 1, 1, 'stove', '#E9E6E0', '#3A3A40', 'cook'],
    ['kitchen_island', 'Kitchen island', 130, 2, 1, 'counter', '#79AAA4', '#F2EDE4', 'cook'],
    ['round_dining', 'Round dining table', 85, 1, 1, 'round_table', '#B88D60', '#F2EDE4'],
    ['bar_stool', 'Bar stool', 30, 1, 1, 'stool', '#3A3A40', '#B5324A', 'sit'],
    ['spice_rack', 'Spice rack', 40, 1, 1, 'low_shelf', '#B88D60', '#E8603A'],
    ['coffee_machine', 'Coffee machine', 70, 1, 1, 'machine', '#3A3A40', '#9C7046'],
    ['pantry_cupboard', 'Pantry cupboard', 95, 1, 1, 'tall_cabinet', '#F2EDE4', '#B88D60'],
  ],
  Bathroom: [
    ['clawfoot_tub', 'Clawfoot tub', 160, 2, 1, 'tub', '#F2F4F6', '#9FD3E0'],
    ['vanity', 'Vanity mirror', 90, 1, 1, 'vanity', '#F2F4F6', '#B9DDE6'],
    ['towel_rack', 'Towel rack', 25, 1, 1, 'rack', '#9A958A', '#79AAA4'],
    ['bath_mat', 'Fluffy bath mat', 20, 1, 1, 'mat', '#B9DDE6', '#F2F4F6'],
    ['laundry_basket', 'Laundry basket', 20, 1, 1, 'basket', '#D9B47A', '#F2F4F6'],
    ['washing_machine', 'Washing machine', 120, 1, 1, 'washer', '#F2F4F6', '#79AAA4'],
    ['rubber_duck', 'Giant rubber duck', 35, 1, 1, 'duck', '#F0DA4A', '#E8A03A'],
  ],
  Playroom: [
    ['teddy_bear', 'Giant teddy bear', 60, 1, 1, 'teddy', '#B88D60', '#E07A9B'],
    ['toy_blocks', 'Toy blocks', 20, 1, 1, 'blocks', '#E07A7A', '#5F9FB5'],
    ['rocking_horse', 'Rocking horse', 70, 1, 1, 'rocking_horse', '#F2EDE4', '#B5324A'],
    ['play_tent', 'Play tent', 90, 2, 2, 'tent', '#F2C4C8', '#F2EDE4'],
    ['bunk_bed', 'Bunk bed', 150, 1, 2, 'bunk', '#B88D60', '#79AAA4', 'sleep'],
    ['toy_chest', 'Toy chest', 45, 1, 1, 'chest', '#E0873A', '#F0DA4A', 'bag'],
    ['train_set', 'Train set', 55, 2, 2, 'train', '#C9A272', '#D9533C'],
    ['ball_pit', 'Ball pit', 80, 2, 2, 'ball_pit', '#F2F4F6', '#E07A7A'],
  ],
  Plants: [
    ['monstera', 'Monstera', 55, 1, 1, 'tall_plant', '#C9A272', '#3F7A3A'],
    ['cactus_pot', 'Potted cactus', 25, 1, 1, 'cactus_pot', '#C9783A', '#5F9A4A'],
    ['fern_stand', 'Fern on a stand', 40, 1, 1, 'plant', '#7A5A3A', '#5E9A4A'],
    ['succulents', 'Succulent tray', 30, 1, 1, 'succulents', '#9A958A', '#7FAF8A'],
    ['lemon_tree_pot', 'Little lemon tree', 70, 1, 1, 'tall_plant', '#C9783A', '#F0DA4A'],
    ['palm_pot', 'Parlour palm', 50, 1, 1, 'tall_plant', '#F2EDE4', '#5E9A4A'],
    ['flower_box', 'Window box', 30, 2, 1, 'flower_box', '#B88D60', '#E07A9B'],
    ['orchid_pot', 'Orchid', 45, 1, 1, 'plant', '#F2F4F6', '#C97AD9'],
  ],
  Lights: [
    ['candle_cluster', 'Candles', 25, 1, 1, 'candles', '#F2EDE4', '#F2C46A'],
    ['floor_lantern', 'Floor lantern', 45, 1, 1, 'lantern', '#3A3A40', '#F2C46A'],
    ['salt_lamp', 'Salt lamp', 40, 1, 1, 'salt_lamp', '#E8A07A', '#F2C4A0'],
    ['night_light', 'Moon night light', 30, 1, 1, 'table_lamp', '#B9C9E8', '#F2EED0'],
    ['globe_lamp', 'Globe lamp', 55, 1, 1, 'lamp', '#E8C25A', '#F2EDE4'],
    ['fairy_jar_lamp', 'Fairy light jar', 35, 1, 1, 'jar_lamp', '#B9DDE6', '#F2E48A'],
  ],
  Hobbies: [
    ['sewing_machine', 'Sewing table', 90, 1, 1, 'sewing', '#B88D60', '#E07A9B'],
    ['guitar_stand', 'Acoustic guitar', 80, 1, 1, 'guitar', '#C9783A', '#3A3A40', 'music'],
    ['drum_set', 'Drum kit', 160, 2, 1, 'drums', '#B5324A', '#E9E6E0', 'music'],
    ['pottery_wheel', 'Pottery wheel', 100, 1, 1, 'pottery', '#9A958A', '#C9783A'],
    ['yoga_mat', 'Yoga mat', 25, 1, 2, 'mat', '#9C82C9', '#C9B9F2'],
    ['computer_desk', 'Computer desk', 150, 2, 1, 'computer', '#3A3A40', '#5FA8C9', 'calendar'],
    ['knitting_basket', 'Knitting basket', 30, 1, 1, 'basket', '#D9B47A', '#C9485A'],
    ['harp', 'Little harp', 140, 1, 1, 'harp', '#E8C25A', '#F2EDE4', 'music'],
    ['standing_mirror', 'Standing mirror', 60, 1, 1, 'mirror', '#B88D60', '#B9DDE6', 'wardrobe'],
    ['room_divider', 'Folding screen', 70, 2, 1, 'screen', '#B88D60', '#F2C4C8'],
  ],
};

export const NEW_FURNITURE = [];
for (const [set, rows] of Object.entries(SETS)) {
  for (const [type, name, price, w, h, form, color, accent, use] of rows) {
    if (FURNITURE_BY_TYPE[type]) continue;
    const flat = ['rug', 'round_rug', 'tatami', 'mat', 'train'].includes(form);
    const def = { type, name, category: set, set, price, w, h, form, color, accent, ...(use ? { use } : {}), ...(flat ? { flat: true } : {}) };
    FURNITURE.push(def);
    FURNITURE_BY_TYPE[type] = def;
    NEW_FURNITURE.push(def);
  }
}
// The original pieces are the "Classic" set.
for (const f of FURNITURE) if (!f.set && !f.special) f.set = 'Classic';
export const FURNITURE_SETS = ['Classic', ...Object.keys(SETS)];

// More for the back wall. [type, name, price, form, colour, accent]
const WALL_ROWS = [
  ['curtain_window', 'Window with curtains', 55, 'window', '#B88D60', '#E07A9B'],
  ['round_window', 'Round window', 50, 'round_window', '#7A5A3A', '#B7D4BD'],
  ['star_poster', 'Star poster', 25, 'frame', '#3A3A40', '#3F5A7A'],
  ['retro_poster', 'Retro poster', 25, 'frame', '#F2EDE4', '#E0873A'],
  ['photo_frames', 'Photo collage', 40, 'frames', '#B88D60', '#E9D7A8'],
  ['cuckoo_clock', 'Cuckoo clock', 60, 'cuckoo', '#7A5A3A', '#F2EDE4'],
  ['round_clock', 'Round clock', 35, 'clock', '#3A3A40', '#F2F4F6'],
  ['wreath', 'Wreath', 30, 'wreath', '#4F8A4A', '#C23B3B'],
  ['dreamcatcher', 'Dreamcatcher', 35, 'dreamcatcher', '#B88D60', '#9C82C9'],
  ['hanging_plant', 'Hanging plant', 35, 'hanging', '#C9A272', '#4F8A4A'],
  ['hanging_lantern', 'Hanging lantern', 40, 'hanging_lantern', '#3A3A40', '#F2C46A'],
  ['neon_heart', 'Neon heart', 70, 'neon', '#2A2A30', '#FF6FA8'],
  ['neon_moon', 'Neon moon', 70, 'neon_moon', '#2A2A30', '#7FE0F0'],
  ['corkboard', 'Corkboard', 30, 'board', '#B88D60', '#C9944A'],
  ['wall_shelf_plants', 'Plant shelf', 45, 'plant_shelf', '#B88D60', '#5E9A4A'],
  ['star_chart', 'Star chart', 55, 'frame', '#B88D60', '#2A2A50'],
  ['embroidery', 'Embroidery hoop', 25, 'hoop', '#C9A272', '#E07A9B'],
  ['tapestry', 'Woven tapestry', 50, 'tapestry', '#C9783A', '#F2EDE4'],
  ['world_map', 'Map of the jars', 50, 'frame', '#7A5A3A', '#C9D9A0'],
  ['wall_guitar', 'Guitar on the wall', 70, 'wall_guitar', '#C9783A', '#3A3A40'],
];
for (const [type, name, price, form, color, accent] of WALL_ROWS) {
  if (WALL_BY_TYPE[type]) continue;
  const def = { type, name, price, form, color, accent };
  WALL_ITEMS.push(def);
  WALL_BY_TYPE[type] = def;
}
export const NEW_WALL_TYPES = WALL_ROWS.map(r => r[0]);
