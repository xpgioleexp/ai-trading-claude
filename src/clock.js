// Real-time clock for the jar: day numbers, seasons, weather and time of day.
import { rngFor } from './rng.js';

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
// One season per real week (plan decision 4, recommended option).
export const DAYS_PER_SEASON = 7;

// Days since 1970-01-01 in the device's local calendar.
export function dayNumber(date) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function seasonOf(day) {
  return SEASONS[Math.floor(day / DAYS_PER_SEASON) % SEASONS.length];
}

export function dayOfSeason(day) {
  return (day % DAYS_PER_SEASON) + 1;
}

export function weatherOf(seed, day) {
  const roll = rngFor(seed, 'weather', day)();
  const season = seasonOf(day);
  if (roll < 0.25) return season === 'winter' ? 'snow' : 'rain';
  if (roll < 0.35) return 'fog';
  return 'sun';
}

export function isWet(weather) {
  return weather === 'rain' || weather === 'snow';
}

export function isNightHour(hour) {
  return hour >= 20 || hour < 6;
}

export function partOfDay(hour) {
  if (isNightHour(hour)) return 'night';
  if (hour < 10) return 'morning';
  if (hour < 17) return 'day';
  return 'evening';
}
