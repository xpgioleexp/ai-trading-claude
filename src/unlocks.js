// Things open up over your first week in a jar, so a new couple isn't handed
// everything at once. Counted in days since the jar was made (the same for
// you both); a jar older than a week has everything open. Pure rules.

// Phone apps (and the places in the world that open them), by the day they open.
export const UNLOCK_DAY = {
  today: 0, questions: 0, mail: 0, bag: 0, log: 0, shop: 0, wardrobe: 0, weather: 0, settings: 0,
  missions: 1, dates: 1, hangout: 1, cooking: 1, friends: 1,
  mine: 2, tools: 2, diy: 2,
  build: 3, home: 3, dreams: 3, journal: 3, scrapbook: 3,
  museum: 4, map: 4, discoveries: 4,
  lore: 5, events: 5,
  jars: 6,
};

// What each day brings, for the morning note.
export const UNLOCK_NOTES = {
  1: 'Missions, dates, the hangout, cooking and your friends.',
  2: 'The mine, tool upgrades and DIY crafting.',
  3: 'Building, your house, dreams, the journal and the scrapbook.',
  4: 'The museum, the map and your discoveries.',
  5: 'The old journal and seasonal events.',
  6: 'The jar shelf: other jars to open and visit.',
};

export function jarDay(world, today) {
  if (!world || typeof world.startDay !== 'number') return Infinity;
  return Math.max(0, today - world.startDay);
}

export const unlockDay = id => UNLOCK_DAY[id] ?? 0;
export const isUnlocked = (id, day) => day >= unlockDay(id);
export const daysUntil = (id, day) => Math.max(0, unlockDay(id) - day);

export function lockedText(id, day, name) {
  const n = daysUntil(id, day);
  return `${name} opens ${n === 1 ? 'tomorrow' : `in ${n} days`}. Something new opens every day this first week.`;
}
