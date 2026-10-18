// Seeded randomness. The same seed and the same inputs always give the same
// results, so a day's fish, forage and mine layers match on every device.

export function hashString(text) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngFor(...parts) {
  return mulberry32(hashString(parts.join('|')));
}

export function randInt(rand, min, max) {
  return min + Math.floor(rand() * (max - min + 1));
}

export function pickWeighted(rand, list, weightOf) {
  const total = list.reduce((sum, item) => sum + weightOf(item), 0);
  if (total <= 0) return null;
  let roll = rand() * total;
  for (const item of list) {
    roll -= weightOf(item);
    if (roll < 0) return item;
  }
  return list[list.length - 1];
}

export function shuffle(rand, list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
