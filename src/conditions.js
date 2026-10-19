// When and where a fish, bug or wild animal turns up. Every field is optional;
// leave it out and it doesn't matter.
//   seasons: ['spring', ...]       time: 'day' | 'night' | 'dawn' | 'dusk'
//   hours: [[from, to], ...]       weather: 'rain' (rain counts storms too), 'wind', ...
//   ponds: ['pond5', ...] or jar water ids ('water3')   bands: mine zones [0..5]
//   layers: [min, max] mine layers  needs: 'rainbow' | 'frost' | 'puddles' | 'fullmoon'
//   places: ['meadow', 'beach', ...]
import { isNightHour, weatherMatches } from './clock.js';

export const TIME_NAMES = { day: 'Daytime', night: 'Night', dawn: 'Dawn (5 to 8am)', dusk: 'Dusk (5 to 8pm)' };

export function timeFits(time, hour) {
  if (!time) return true;
  if (time === 'night') return isNightHour(hour);
  if (time === 'day') return !isNightHour(hour);
  if (time === 'dawn') return hour >= 5 && hour < 8;
  if (time === 'dusk') return hour >= 17 && hour < 20;
  return true;
}

// The moon is full every 8th day.
export const fullMoon = day => day % 8 === 0;

// ctx: { season, hour, weather, wx, pond, band, layer, place, day }. Unknown parts of
// ctx (say, no pond given) don't rule anything out, so lists of "what's around"
// still show pond-only fish.
export function conditionsMet(def, ctx) {
  if (def.seasons && ctx.season && !def.seasons.includes(ctx.season)) return false;
  if (!timeFits(def.time, ctx.hour)) return false;
  if (def.hours && !def.hours.some(([a, b]) => (a <= b ? ctx.hour >= a && ctx.hour < b : ctx.hour >= a || ctx.hour < b))) return false;
  if (def.weather && ctx.weather !== undefined && !weatherMatches(def.weather, ctx.weather)) return false;
  if (def.ponds && ctx.pond && !def.ponds.includes(ctx.pond)) return false;
  if (def.bands && ctx.band != null && !def.bands.includes(ctx.band)) return false;
  if (def.layers && ctx.layer != null && (ctx.layer < def.layers[0] || ctx.layer > def.layers[1])) return false;
  if (def.places && ctx.place && !def.places.includes(ctx.place)) return false;
  if (def.needs && ctx.wx) {
    if (def.needs === 'rainbow' && !ctx.wx.rainbow) return false;
    if (def.needs === 'frost' && !ctx.wx.frost) return false;
    if (def.needs === 'puddles' && !ctx.wx.puddles) return false;
  }
  if (def.needs === 'fullmoon' && ctx.day != null && !(fullMoon(ctx.day) && isNightHour(ctx.hour))) return false;
  return true;
}

// A short line saying when to look, for the collection log.
const PLACE_NAMES = { meadow: 'Meadow', beach: 'Beach jar', snow: 'Snow jar', flower: 'Flower jar', desert: 'Desert', rainforest: 'Rainforest', glade: 'Mushroom glade', springs: 'Hot springs', stars: 'Starlight isle' };
const NEED_NAMES = { rainbow: 'while a rainbow is out', frost: 'on frosty mornings', puddles: 'by puddles', fullmoon: 'under a full moon' };
export function whenText(def) {
  const bits = [];
  if (def.places) bits.push(def.places.map(p => PLACE_NAMES[p] || p).join(', '));
  if (def.seasons) bits.push(def.seasons.map(s => s[0].toUpperCase() + s.slice(1)).join(', '));
  if (def.time) bits.push(TIME_NAMES[def.time]);
  if (def.hours) bits.push(def.hours.map(([a, b]) => `${a}:00 to ${b}:00`).join(', '));
  if (def.weather) bits.push({ rain: 'Rain', storm: 'Storms', wind: 'Windy days', heat: 'Heatwaves', snow: 'Snow', fog: 'Fog', sun: 'Clear days', blizzard: 'Blizzards' }[def.weather] || def.weather);
  if (def.needs) bits.push(NEED_NAMES[def.needs]);
  return bits.join(' · ');
}
