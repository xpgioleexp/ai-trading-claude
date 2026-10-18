// Real-time clock for the jar: day numbers, seasons, weather and time of day.
import { rngFor } from './rng.js';

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'];
// One season per real week (plan decision 4, recommended option).
export const DAYS_PER_SEASON = 7;

// Days since 1970-01-01 in the given time zone (the device's when none is set).
// Both partners use the jar's shared time zone, so a new day starts for both at once.
export function dayNumber(date, timeZone) {
  if (timeZone) {
    try {
      const [y, m, d] = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
        .format(date).split('-').map(Number);
      return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
    } catch {
      // Unknown zone: fall back to the device calendar.
    }
  }
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

export function deviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

// Seasons follow Monday-to-Sunday weeks. Day 4 (1970-01-05) was a Monday.
export function seasonOf(day) {
  return SEASONS[Math.floor((day + 3) / DAYS_PER_SEASON) % SEASONS.length];
}

export function dayOfSeason(day) {
  return ((day + 3) % DAYS_PER_SEASON) + 1;
}

export function dateOfDay(day) {
  return new Date(day * 86400000).toISOString().slice(0, 10);
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
