// Rules for the couple features, kept pure so they can be tested: the
// weekly mission choice, the daily answer streak and the rewards.
import { C, missionFor } from './content.js';

export const ANSWER_REWARD = 40;
export const RITUAL_REWARD = 100;
export const MISSION_REWARD = 150;
export const DATE_REWARD = 60;
export const DREAM_REWARD = 120;
export const NOTE_REWARD = 15;
// A bonus each time your streak of both-answered days reaches a multiple of 7.
export const STREAK_STEP = 7;
export const STREAK_BONUS = 100;
export const MISSION_CHOICES = 3;

// This week's three missions to pick from. The first is the one the week
// always had, so a mission already started keeps its place. The other two
// come from further along the same order, and at least one of the three
// works when you're apart.
export function missionChoices(seed, startDay, week) {
  const first = missionFor(seed, startDay, week);
  const out = [first];
  const n = C.missions.length;
  const half = Math.floor(n / 2);
  for (let k = 1; out.length < MISSION_CHOICES && k < n; k++) {
    const m = missionFor(seed, startDay, week + k * Math.floor(half / MISSION_CHOICES) + k);
    if (out.some(x => x.id === m.id || x.category === m.category)) continue;
    out.push(m);
  }
  const apartOk = m => m.location !== 'together' || !!m.apart;
  if (!out.some(apartOk)) {
    for (let k = 1; k < n; k++) {
      const m = missionFor(seed, startDay, week + 97 * k);
      if (apartOk(m) && !out.some(x => x.id === m.id)) { out[out.length - 1] = m; break; }
    }
  }
  return out;
}

// The mission the two of you are doing this week: one either of you started,
// else the one you picked, else none yet. docs: S.missions.
export function chosenMission(docs, choices, week, couple) {
  const byId = id => C.missions.find(m => m.id === id);
  for (const uid of couple) {
    const d = docs[`${week}--${uid}`];
    if (d?.missionId && byId(d.missionId)) return byId(d.missionId);
  }
  const pick = docs[`${week}--pick`];
  return (pick?.missionId && byId(pick.missionId)) || null;
}

// Days in a row you have both answered the daily question, counting back from
// today (or from yesterday, when today isn't answered by both yet).
export function answerStreak(answered, today) {
  let day = answered(today) ? today : today - 1;
  let n = 0;
  while (answered(day) && n < 3660) { n++; day--; }
  return n;
}

export const streakBonusDue = streak => streak > 0 && streak % STREAK_STEP === 0;
