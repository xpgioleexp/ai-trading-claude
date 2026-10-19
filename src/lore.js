// The old journal: the story of the two keepers who made the jars, torn into
// pages and hidden all over the world. Pages are found at landmarks, deep in
// the mine, while digging, or with a rare fish. Some pages were torn in half:
// each of you can only find your own half, and the page is whole when you both
// have. Found pages are shared: lore/<page> or lore/<page>-<half> { by, at }.
// Pure rules; the panels are in lore-ui.js.

// where: { landmark: id } | { mine: layer } | { digs: n } | { fish: id }
// split pages have halves: [where, where] instead.
export const CHAPTERS = [
  { id: 'keepers', name: 'Two keepers', reward: 300, pages: [
    { id: 'p1', where: { landmark: 'woods_camp' }, title: 'The first night',
      text: 'We found the jar empty, just glass and quiet. Ash made a fire and I wrote this by its light. Tomorrow we plant something.' },
    { id: 'p2', where: { landmark: 'woodcutter_hut' }, title: 'A roof',
      text: 'Ash built this hut from the first trees that grew. Too many nails, a crooked door. I have never loved a house more.' },
    { id: 'p3', where: { landmark: 'hollow_oak' }, title: 'The oak',
      text: 'The oak grew hollow in the middle, so we keep our letters there. If you are reading this, you found our post box.' },
    { id: 'p4', halves: [{ landmark: 'orchard_well' }, { landmark: 'windmill' }], title: 'Two halves',
      text: ['I wrote half of this page and Ash wrote the other.', 'We tore it in two and hid the pieces apart, so whoever finds it has to find it together.'] },
  ] },
  { id: 'heights', name: 'The high places', reward: 300, pages: [
    { id: 'h1', where: { landmark: 'stone_circle' }, title: 'The stones',
      text: 'The stones were here before us. Ash says they hum on full moon nights. I think it is the wind. We sat inside the circle anyway.' },
    { id: 'h2', where: { landmark: 'watchtower' }, title: 'The tower',
      text: 'From the top of the tower you can see the glass curve all the way around. The world is small. That is what makes it ours.' },
    { id: 'h3', where: { landmark: 'peak_cairn' }, title: 'A stone each',
      text: 'Every time we climb up here we each add a stone. The pile is taller than me now. That is a lot of climbs.' },
    { id: 'h4', where: { landmark: 'gazebo' }, title: 'The promise',
      text: 'Ash asked me something in the gazebo today. I said yes before the question was finished.' },
    { id: 'h5', halves: [{ landmark: 'sunken_statue' }, { landmark: 'bog_lantern' }], title: 'The statue in the bog',
      text: ['We carved a statue of the two of us. It was too heavy and the bog took it.', 'Now it sits half under the water, still holding hands. Honestly, it suits us.'] },
  ] },
  { id: 'water', name: 'Water and light', reward: 300, pages: [
    { id: 'w1', where: { landmark: 'lighthouse' }, title: 'A light',
      text: 'Ash built the lighthouse so I could always find my way back across the lake. There are no boats. Ash says that is not the point.' },
    { id: 'w2', where: { landmark: 'boathouse' }, title: 'The boathouse',
      text: 'Fine. Ash built a boat. It leaks. We go out every evening anyway and bail water and laugh.' },
    { id: 'w3', where: { landmark: 'lake_bridge' }, title: 'The bridge',
      text: 'The rope bridge sways when you cross it. Hold the rail. Better, hold a hand.' },
    { id: 'w4', where: { fish: 'sturgeon' }, title: 'A bottle in the deep',
      text: 'I put this page in a bottle and dropped it in the big pond. If a fish this old found it, it has kept our secret for a long time.' },
    { id: 'w5', where: { landmark: 'apiary' }, title: 'The bees',
      text: 'The bees arrived on their own. We think they liked the flowers. We think they liked us too.' },
  ] },
  { id: 'lost', name: 'What was lost', reward: 400, pages: [
    { id: 'l1', where: { landmark: 'ruined_temple' }, title: 'Someone before us',
      text: 'The ruins were old when we arrived. Someone kept this jar before us. We never learned their names. We hope someone learns ours.' },
    { id: 'l2', where: { landmark: 'obelisk' }, title: 'The marks',
      text: 'The obelisk has two rows of marks, one for each day, side by side. They stop at the same place. I like to think they left together.' },
    { id: 'l3', where: { landmark: 'broken_arch' }, title: 'The arch',
      text: 'We tried to fix the arch and only made it worse. Some broken things are lovely as they are.' },
    { id: 'l4', where: { landmark: 'old_barn' }, title: 'The long winter',
      text: 'The winter we spent in the barn was the hardest. The fire kept going out. We kept each other going instead.' },
    { id: 'l5', halves: [{ landmark: 'ancient_tree' }, { landmark: 'fairy_ring' }], title: 'The quarrel',
      text: ['We had our worst fight under the ancient tree. I walked off into the hollow.', 'Ash found me in the fairy ring hours later with two cups of tea. We never fought like that again.'] },
    { id: 'l6', where: { landmark: 'moon_shrine' }, title: 'For the ones before',
      text: 'We built the moon shrine for the keepers before us. Leave something here for us, if you like.' },
  ] },
  { id: 'jars', name: 'The other jars', reward: 500, pages: [
    { id: 'j1', where: { landmark: 'beach_shipwreck' }, title: 'The beach jar',
      text: 'The first jar we made together. Ash wanted the sea. I wanted the sand. We got both.' },
    { id: 'j2', where: { landmark: 'snow_aurora_watch' }, title: 'The snow jar',
      text: 'Made for the nights Ash missed the cold. We watch the lights from up here wrapped in one blanket.' },
    { id: 'j3', where: { landmark: 'flower_flower_mill' }, title: 'The flower jar',
      text: 'I planted every flower I knew the name of. Then Ash made up names for the rest.' },
    { id: 'j4', where: { landmark: 'desert_pyramid' }, title: 'The desert jar',
      text: 'We built the pyramid from one grain of sand at a time. Not really. But it felt like it.' },
    { id: 'j5', where: { landmark: 'rainforest_jungle_temple' }, title: 'The rainforest jar',
      text: 'It rains here every day because Ash loves the sound on the roof. I bought an umbrella.' },
    { id: 'j6', where: { landmark: 'glade_whisper_circle' }, title: 'The glade jar',
      text: 'Whisper into the stones and they whisper back what the last person said. Ash left me a message here. I will not tell you what it was.' },
    { id: 'j7', where: { landmark: 'springs_pagoda' }, title: 'The hot springs jar',
      text: 'For tired bones, we said. We were not old yet. We were planning ahead.' },
    { id: 'j8', where: { landmark: 'stars_great_observatory' }, title: 'Starlight isle',
      text: 'The last jar. Always night, so we never miss the stars. Every star here has a name. Most of them are jokes.' },
  ] },
  { id: 'deep', name: 'Deep down', reward: 500, pages: [
    { id: 'd1', where: { mine: 10 }, title: 'The first ladder', text: 'Ash dug the first ladder down. I said nothing good lives under the ground. I was wrong about the gems.' },
    { id: 'd2', where: { mine: 20 }, title: 'Stone', text: 'Twenty ladders down. We carved our initials on the wall. Look for them.' },
    { id: 'd3', where: { mine: 30 }, title: 'Crystal', text: 'The crystals glow just enough to read by. I am writing this one in the dark, mostly.' },
    { id: 'd4', where: { mine: 40 }, title: 'Frost', text: 'So cold down here. Ash gave me both gloves and pretended not to be freezing.' },
    { id: 'd5', where: { mine: 50 }, title: 'Ember', text: 'The rock is warm here. Ash says the jar has a heart, and it is down here. It beats very slowly.' },
    { id: 'd6', where: { mine: 60 }, title: 'The bottom', text: 'The very bottom. There is nothing here but stars in the stone. We sat a long time before climbing back up.' },
    { id: 'd7', where: { digs: 5 }, title: 'In the dirt', text: 'Ash digs up old bones and gives them names. This one is Gerald.' },
  ] },
  { id: 'letter', name: 'The last letter', reward: 1000, final: true, pages: [
    { id: 'z1', halves: [{ landmark: 'stars_star_circle' }, { landmark: 'springs_fox_shrine' }], title: 'To whoever comes next',
      text: ['We are leaving the jars to you now. Look after them. Look after each other more.', 'Plant things. Name the stars. Put a stone on the cairn every time you climb it.'] },
    { id: 'z2', halves: [{ landmark: 'scarecrow_hill' }, { landmark: 'stars_star_lighthouse' }], title: 'The key',
      text: ['There is one more thing. Under the oak where we kept our letters,', 'we left you a gift. It was always meant for two. With love, the keepers.'] },
  ] },
];

export const PAGE_BY_ID = Object.fromEntries(CHAPTERS.flatMap(ch => ch.pages.map(p => [p.id, { ...p, chapter: ch.id }])));
export const PAGE_COUNT = CHAPTERS.reduce((t, ch) => t + ch.pages.length, 0);

// Every spot a page (or half a page) can be found: [{ page, half, where }].
export const PAGE_SPOTS = CHAPTERS.flatMap(ch => ch.pages.flatMap(p => (p.halves
  ? p.halves.map((where, half) => ({ page: p.id, half, where, chapter: ch.id }))
  : [{ page: p.id, half: null, where: p.where, chapter: ch.id }])));

const docId = (page, half) => (half == null ? page : `${page}-${half}`);

// Which half of a torn page is yours. With a partner, the one with the
// earlier id finds the first halves; on your own you can find both.
export function myHalf(me, partner) {
  if (!partner) return null;
  return me < partner ? 0 : 1;
}

export const spotFound = (docs, s) => !!docs?.[docId(s.page, s.half)];

// A page is whole when it (or both its halves) has been found.
export function pageFound(docs, page) {
  const p = PAGE_BY_ID[page];
  return p.halves ? p.halves.every((_, half) => !!docs?.[docId(page, half)]) : !!docs?.[page];
}

export const chapterDone = (docs, chapter) => CHAPTERS.find(c => c.id === chapter).pages.every(p => pageFound(docs, p.id));
// The last letter only turns up once every other chapter is done.
export const finalOpen = docs => CHAPTERS.filter(c => !c.final).every(c => chapterDone(docs, c.id));

// Spots you could find right now: not found yet, your half (or not torn), and open.
export function spotsForMe(docs, me, partner) {
  const mine = myHalf(me, partner);
  const open = finalOpen(docs);
  return PAGE_SPOTS.filter(s => !spotFound(docs, s) && (s.half == null || mine == null || s.half === mine)
    && (!CHAPTERS.find(c => c.id === s.chapter).final || open));
}

// The page (or half) waiting at a landmark, the mine layer you've reached, your
// dig count or a fish you caught. Returns the spot, or null.
export function spotAtLandmark(docs, me, partner, landmarkId) {
  return spotsForMe(docs, me, partner).find(s => s.where.landmark === landmarkId) || null;
}
export function spotInMine(docs, me, partner, deepest) {
  return spotsForMe(docs, me, partner).find(s => s.where.mine && deepest >= s.where.mine) || null;
}
export function spotForDigs(docs, me, partner, digs) {
  return spotsForMe(docs, me, partner).find(s => s.where.digs && digs >= s.where.digs) || null;
}
export function spotForFish(docs, me, partner, fishId) {
  return spotsForMe(docs, me, partner).find(s => s.where.fish === fishId) || null;
}

export const spotDoc = (s, me, at) => ({ id: docId(s.page, s.half), doc: { page: s.page, half: s.half, by: me, at } });

// Chapter rewards: each of you collects once.
export function rewardDue(state, docs, chapter) {
  return chapterDone(docs, chapter) && !(state.loreRewards || {})[chapter];
}
export function claimReward(state, docs, chapter) {
  if (!rewardDue(state, docs, chapter)) return 0;
  const ch = CHAPTERS.find(c => c.id === chapter);
  state.pebbles += ch.reward;
  state.loreRewards = { ...(state.loreRewards || {}), [chapter]: true };
  return ch.reward;
}
