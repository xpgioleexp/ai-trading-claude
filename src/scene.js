// Draws the jar, its world and the mine onto the game canvas.
import { COLS, MEADOW_COLS, MEADOW_WEST, MEADOW_NORTH, MEADOW_SOUTH, ROWS, TILE, OBJECTS, BEDS, PONDS } from './world.js';
import { EVENT_SPOT, SNOWMAN_SPOT, meteorAt } from './events.js';
import { LIGHT_DECOR } from './outdoor-data.js';
import { bedStage, bandOf, MINE_ENTRY } from './rules.js';
import { BANDS, MONSTERS } from './mine-data.js';
import {
  PAL, px, disc, shade, grassTile, itemIcon, mailboxSprite, crateSprite, workbenchSprite,
  stallSprite, treeSprite, benchSprite, caveSprite, bedSprite, cropSprite, rockSprite, caveWallSprite, chestSprite, monsterSprite, ladderHoleSprite,
  ladderUpSprite, bunnySprite, heartSprite,
} from './sprites.js';
import { avatarSprite, DIRS } from './avatar.js';
import { boardSprite, wellSprite, picnicSprite, easelSprite, animalSprite, noteSprite, bubbleSprite, sparkleSprite, zzzSprite, decorSprite, FLAT_DECOR, bugSprite, visitorSprite, merchantSprite, merchantRugSprite, requestMarkSprite, eventStandSprite } from './sprites-more.js';
import { BUG_BY_ID } from './bugs.js';
import { doorSprite, palmSprite, hiveSprite, pineSprite, snowmanSprite, archSprite, critterSprite, jarStallSprite, jarThingSprite } from './sprites-more.js';
import { SHOPS } from './biomes.js';
import { MAPS } from './maps.js';
import { wxDaily, isStormy } from './weather.js';
import { sitesDug } from './fossils.js';
import { museumSprite, digSiteSprite } from './museum-art.js';
import { hashString } from './rng.js';
import { houseSprite, wallpaperTile, floorTile, furnitureSprite, wallItemSprite, sleeperSprite } from './home-art.js';
import { ROOM, DOOR, WALL_SLOTS, FURNITURE_BY_TYPE } from './home.js';

export const W = 320;
// The canvas is 384 px tall at least; on tall screens it grows (see setHeight)
// so the jar fills the space. The meadow and the jars show more rows; home and
// the mine stay their size, in the middle.
export const BASE_H = 384;
export const MAX_H = 640;
export let H = BASE_H;
export const GX = 24;
export const GY = 100;
export const SOIL_TOP = GY + ROWS * TILE;
// The meadow is wider than the screen; the view slides with you (see g.camX).
export const MEADOW_LEFT = -MEADOW_WEST * TILE;
export const MEADOW_W = GX * 2 + MEADOW_COLS * TILE;
// How far the camera can slide either way.
export const CAM_MIN = MEADOW_LEFT;
export const CAM_MAX = MEADOW_W - W;
// ...and up and down (see g.camY): the hills sit higher, the soil lower.
export const CAMY_MIN = -MEADOW_NORTH * TILE;
export const CAMY_MAX = MEADOW_SOUTH * TILE;

// Where the camera can go in the scene you're in, or null when it stays still.
export function camBounds(g) {
  if (g.scene === 'jar') return { minX: CAM_MIN, maxX: CAM_MAX, minY: CAMY_MIN, maxY: Math.max(CAMY_MIN, CAMY_MAX - (H - BASE_H)) };
  const map = g.scene === 'map' ? MAPS[g.mapId] : null;
  if (!map || !(map.west || map.north || map.south)) return null;
  return {
    minX: -(map.west || 0) * TILE, maxX: GX * 2 + (map.cols || COLS) * TILE - W,
    minY: -(map.north || 0) * TILE, maxY: Math.max(-(map.north || 0) * TILE, (map.south || 0) * TILE - (H - BASE_H)),
  };
}
const JAR = { x: 12, y: 40, w: 296, h: BASE_H - 52, r: 24 };

export function setHeight(h) {
  H = Math.max(BASE_H, Math.min(MAX_H, Math.round(h)));
  JAR.h = H - 52;
  return H;
}

// How far home and the mine sit down from the top, so they're centred.
export const roomOffset = () => Math.round((H - BASE_H) / 2);

export function tileCenter(c, r) {
  return { x: GX + c * TILE + TILE / 2, y: GY + r * TILE + TILE / 2 };
}

export function pointToTile(x, y) {
  return { c: Math.floor((x - GX) / TILE), r: Math.floor((y - GY) / TILE) };
}

function jarPath(ctx) {
  const { x, y, w, h, r } = JAR;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

const SKY = { morning: '#E6E4CC', day: '#D9E8E1', evening: '#EBCDB4', night: '#36425C' };

function skyColor(g) {
  const sky = SKY[g.part];
  if (g.weather === 'fog') return shade(sky, 0.3);
  if (isStormy(g.weather)) return shade(sky, -0.35);
  if (g.weather === 'heat' && !g.night) return '#EFE0B8';
  return sky;
}

export function drawScene(ctx, g) {
  ctx.clearRect(0, 0, W, H);
  ctx.save();
  jarPath(ctx);
  ctx.clip();
  if (g.scene === 'mine' || g.scene === 'home') {
    // On a tall screen these sit in the middle, with their own colour above and below.
    ctx.save();
    px(ctx, 0, 0, W, H, g.scene === 'home' ? '#3A2E28' : '#2A2420');
    ctx.translate(0, roomOffset());
    if (g.scene === 'mine') drawMine(ctx, g);
    else drawHome(ctx, g);
    drawEffects(ctx, g);
    ctx.restore();
  }
  const cam = camBounds(g);
  if (g.scene === 'map' && cam) {
    ctx.save();
    ctx.translate(-Math.round(g.camX || 0), -Math.round(g.camY || 0));
    drawMapWorld(ctx, g);
    drawEffects(ctx, g);
    ctx.restore();
  } else if (g.scene === 'map') {
    drawMapWorld(ctx, g);
    drawEffects(ctx, g);
  }
  if (g.scene === 'jar') {
    // The meadow is drawn in world space and slid by the camera.
    ctx.save();
    ctx.translate(-Math.round(g.camX || 0), -Math.round(g.camY || 0));
    drawJarWorld(ctx, g);
    drawEffects(ctx, g);
    ctx.restore();
  }
  ctx.restore();
  drawGlass(ctx, g);
  if (cam) drawEdgeHints(ctx, g, cam);
  if (g.fishing) drawFishingUi(ctx, g);
}

// Little arrows at the glass when there's more world that way.
function drawEdgeHints(ctx, g, b) {
  const cx = g.camX || 0, cy = g.camY || 0;
  const y = GY + (ROWS * TILE) / 2, x = W / 2, pulse = Math.floor(g.t * 2) % 2;
  ctx.fillStyle = 'rgba(255,250,235,0.7)';
  const side = (x, dir) => { for (let i = 0; i < 5; i++) ctx.fillRect(x + dir * (i < 3 ? i : 4 - i), y - 4 + i * 2, 2, 2); };
  const updown = (y, dir) => { for (let i = 0; i < 5; i++) ctx.fillRect(x - 4 + i * 2, y + dir * (i < 3 ? i : 4 - i), 2, 2); };
  if (cx > b.minX + 2) side(18 - pulse, -1);
  if (cx < b.maxX - 2) side(300 + pulse, 1);
  if (cy > b.minY + 2) updown(48 - pulse, -1);
  if (cy < b.maxY - 2) updown(H - 22 + pulse, 1);
}

// The animals and people who live in a jar (see behaviors.js): hops and flights
// get a shadow, sleepers get a z, hiders and climbers vanish for a moment.
function drawCritters(ctx, g, items) {
  for (const a of [...(g.critters || []), ...(g.wild || [])]) {
    if (a.hidden || a.pose === 'climb') continue;
    const frame = a.pose === 'sleep' ? 0 : Math.floor(g.t * (a.z > 0 ? 6 : 2) + a.phase) % 2;
    const img = critterSprite(a.def.shape, a.def.color, a.def.accent, frame);
    const z = Math.round(a.z || 0);
    items.push({ y: a.y, draw: () => {
      const x = Math.round(a.x), y = Math.round(a.y);
      if (z > 0) { ctx.fillStyle = 'rgba(40,30,20,0.25)'; ctx.fillRect(x - 4, y - 1, 8, 2); }
      if (a.pose === 'hide') { px(ctx, x - 3, y - 3, 6, 3, shade(a.def.color, -0.2)); return; }
      ctx.save();
      const top = y - img.height + 2 - z + (a.pose === 'crouch' || a.pose === 'slide' ? 3 : 0);
      if (a.flip) { ctx.translate(x, 0); ctx.scale(-1, 1); ctx.drawImage(img, -8, top); }
      else ctx.drawImage(img, x - 8, top);
      ctx.restore();
      if (a.pose === 'sleep' && Math.floor(g.t) % 2 === 0) ctx.drawImage(zzzSprite(), x + 4, top - 6);
      if (a.pose === 'dig') for (let i = 0; i < 3; i++) px(ctx, x - 6 + i * 5 + Math.round(Math.sin(g.t * 9 + i) * 2), y - 3 - (Math.floor(g.t * 8 + i) % 3), 2, 2, '#C9A272');
      if (a.pose === 'fish') {
        ctx.strokeStyle = PAL.woodShade;
        ctx.beginPath(); ctx.moveTo(x + 4, top + 6); ctx.lineTo(x + 16, top - 4); ctx.lineTo(x + 20, y + 10); ctx.stroke();
      }
      if (a.pose === 'paint') ctx.drawImage(easelSprite(), x + 8, y - 26);
      if (a.pose === 'busy' && a.def.id === 'poppy') px(ctx, x + 6, top + 8, 3, 3, '#5FA8C9');
    } });
  }
}

// ---------- the forest jar ----------

function drawJarWorld(ctx, g) {
  const { season } = g;
  const X0 = MEADOW_LEFT, WW = MEADOW_W - MEADOW_LEFT, cam = Math.round(g.camX || 0), camY = Math.round(g.camY || 0);
  // North rows sit above row 0, so the sky and hills move up; the soil moves down.
  const NT = MEADOW_NORTH * TILE, ST = MEADOW_SOUTH * TILE;
  px(ctx, X0, -NT, WW, H + NT + ST, skyColor(g));
  ctx.save();
  ctx.translate(0, -NT);
  drawBackdrop(ctx, g, WW, X0);
  ctx.restore();

  // Grass, including the strips beside the tile grid.
  const [base, dark] = [grassTile(season, 0), grassTile(season, 1)];
  for (let x = X0; x < X0 + WW; x += TILE) {
    for (let y = GY - 8 - NT; y < SOIL_TOP + ST; y += TILE) ctx.drawImage((x + y) % 32 ? base : dark, x, y);
  }
  for (let r = -MEADOW_NORTH; r < ROWS + MEADOW_SOUTH; r++) {
    for (let c = -MEADOW_WEST; c < MEADOW_COLS; c++) {
      const v = hashString(c + ':' + r) % 4;
      ctx.drawImage(grassTile(season, v), GX + c * TILE, GY + r * TILE);
    }
  }
  px(ctx, X0, GY - 9 - NT, WW, 2, shade(SEASON_EDGE[season], -0.2));

  for (const id of PONDS) drawPond(ctx, g, id);
  drawWeatherGround(ctx, g);
  drawDigSites(ctx, g);
  const cave = OBJECTS.find(o => o.id === 'cave');
  ctx.drawImage(caveSprite(), GX + cave.c * TILE, GY + cave.r * TILE);
  BEDS.forEach((b, i) => {
    // Beds you haven't opened yet are a faint outline with a little sign.
    const open = i < (g.state.farm?.beds || 6);
    if (!open) ctx.globalAlpha = 0.3;
    ctx.drawImage(bedSprite(open && g.state.garden[i].last === g.today), GX + b.c * TILE, GY + b.r * TILE);
    ctx.globalAlpha = 1;
    if (!open && i % 3 === 1) {
      px(ctx, GX + b.c * TILE + 7, GY + b.r * TILE + 4, 2, 9, PAL.woodShade);
      px(ctx, GX + b.c * TILE + 3, GY + b.r * TILE + 2, 10, 5, PAL.wood);
    }
  });
  const picnic = OBJECTS.find(o => o.id === 'picnic');
  ctx.drawImage(picnicSprite(), GX + picnic.c * TILE, GY + picnic.r * TILE + 2);
  for (const d of g.decor) {
    if (FLAT_DECOR.has(d.type)) ctx.drawImage(decorSprite(d.type, g.season), GX + d.c * TILE, GY + d.r * TILE);
  }
  for (const v of g.visitors || []) {
    if (v.kind === 'merchant') ctx.drawImage(merchantRugSprite(), GX + v.c * TILE + 4, GY + v.r * TILE + 2);
  }

  // Forage on the ground, with a small glint.
  g.state.daily.forage.forEach((f, i) => {
    if (g.state.daily.picked.includes(i)) return;
    const p = tileCenter(f.c, f.r);
    ctx.drawImage(itemIcon(f.id), p.x - 8, p.y - 10);
    if (Math.floor(g.t * 2 + i) % 3 === 0) px(ctx, p.x + 4, p.y - 10, 1, 1, PAL.linenHi);
  });

  (g.mushrooms || []).forEach((m, i) => {
    if ((g.state.daily.mushrooms || []).includes(i)) return;
    const p = tileCenter(m.c, m.r);
    ctx.drawImage(itemIcon(m.id), p.x - 8, p.y - 10);
  });

  // Everything that stands up is sorted by where it touches the ground.
  const items = [];
  const at = (o, img, dx = 0, dy = 0) => {
    const x = GX + (o.c + o.w / 2) * TILE - img.width / 2 + dx;
    const y = GY + (o.r + o.h) * TILE - img.height + dy;
    items.push({ y: GY + (o.r + o.h) * TILE, draw: () => ctx.drawImage(img, x, y) });
  };
  for (const o of OBJECTS) {
    if (o.id === 'tent') at(o, houseSprite(g.houseLevel || 0, g.night), 0, 2);
    if (o.id === 'museum') at(o, museumSprite(), 0, 2);
    if (o.id === 'mailbox') at(o, mailboxSprite(g.unreadMail), 0, -2);
    if (o.id === 'crate') at(o, crateSprite(g.state.crate.length > 0), 0, -1);
    if (o.id === 'workbench') at(o, workbenchSprite(), 0, -2);
    if (o.id === 'stall') at(o, stallSprite(), 0, 2);
    if (o.id === 'tree') at(o, treeSprite(g.season, !g.state.daily.shook), 0, -2);
    if (o.id === 'bench') at(o, benchSprite(), 0, -1);
    if (o.id === 'board') at(o, boardSprite(g.boardNew), 0, -2);
    if (o.id === 'well') at(o, wellSprite(g.wellLights), 0, -1);
    if (o.id === 'easel') at(o, easelSprite(), 0, -2);
    if (o.id === 'door') at(o, doorSprite(), 0, -1);
    if (o.kind === 'tree') at(o, decorSprite(o.tree, g.season), 0, -1);
  }
  for (const d of g.decor) {
    if (FLAT_DECOR.has(d.type)) continue;
    const img = decorSprite(d.type, g.season);
    const x = GX + d.c * TILE + 8 - img.width / 2, y = GY + (d.r + 1) * TILE - img.height;
    items.push({ y: GY + (d.r + 1) * TILE - 2, draw: () => ctx.drawImage(img, x, y) });
  }
  BEDS.forEach((b, i) => {
    const bed = g.state.garden[i];
    const stage = bedStage(bed, g.today);
    if (stage < 0) return;
    const img = cropSprite(bed.crop, stage);
    items.push({ y: GY + (b.r + 1) * TILE - 1, draw: () => ctx.drawImage(img, GX + b.c * TILE, GY + b.r * TILE - 6) });
    if (stage === 3 && Math.floor(g.t * 1.5 + i) % 4 === 0) {
      items.push({ y: 999, draw: () => px(ctx, GX + b.c * TILE + 12, GY + b.r * TILE - 6, 2, 2, PAL.linenHi) });
    }
  });
  for (const a of g.residents) {
    if (a.hidden) continue;
    const sleeping = g.night || a.mode === 'sleep';
    const img = a.species === 'bunny' ? bunnySprite(a.frame, sleeping) : animalSprite(a.species, a.frame, sleeping, a.inWater);
    items.push({
      y: a.inWater ? a.y - 40 : a.y,
      draw: () => {
        ctx.save();
        const top = Math.round(a.y) - img.height + 1;
        if (a.flip) {
          ctx.translate(Math.round(a.x), 0);
          ctx.scale(-1, 1);
          ctx.drawImage(img, -Math.round(img.width / 2), top);
        } else ctx.drawImage(img, Math.round(a.x) - Math.round(img.width / 2), top);
        ctx.restore();
        if (sleeping && Math.floor(g.t) % 2 === 0) ctx.drawImage(zzzSprite(), Math.round(a.x) + 4, top - 6);
        if (g.selected === a) px(ctx, Math.round(a.x) - 1, top - 5, 3, 3, PAL.rose);
      },
    });
  }
  for (const b of g.bugs) {
    const def = BUG_BY_ID[b.id];
    const flap = Math.floor(g.t * (def.kind === 'beetle' || def.kind === 'small' ? 2 : 8) + b.phase) % 2;
    const flying = ['butterfly', 'bee', 'dragonfly', 'firefly'].includes(def.kind);
    const bx = Math.round(b.x + (flying ? Math.sin(g.t * 1.3 + b.phase) * 3 : 0));
    const by = Math.round(b.y - (flying ? 8 + Math.sin(g.t * 2 + b.phase) * 2 : 0));
    items.push({ y: b.y, draw: () => {
      if (def.kind === 'firefly' && g.night && flap) {
        ctx.fillStyle = 'rgba(255,240,150,0.35)';
        ctx.fillRect(bx - 4, by - 3, 10, 8);
      }
      ctx.drawImage(bugSprite(def.kind, def.color, flap), bx - 5, by - 6);
      if (b.alert > 0.4) px(ctx, bx, by - 12, 2, 4 + Math.round(b.alert * 2), b.alert > 0.75 ? '#D9533C' : '#E8C25A');
    } });
  }
  drawCritters(ctx, g, items);
  if (g.eventsToday?.length) at({ ...EVENT_SPOT, w: 1, h: 1 }, eventStandSprite(), 0, -1);
  if (g.snowman) at({ ...SNOWMAN_SPOT, w: 1, h: 1 }, snowmanSprite(), 0, -1);
  for (const v of g.visitors || []) {
    const frame = Math.floor(g.t * 1.2 + v.phase) % 2;
    const img = v.kind === 'merchant' ? merchantSprite(frame) : visitorSprite(v.def.species, v.def.color, frame);
    const x = Math.round(v.x - img.width / 2), y = Math.round(v.y - img.height + 1 - (v.z || 0));
    items.push({ y: v.y, draw: () => {
      ctx.drawImage(img, x, y);
      if (v.ask) ctx.drawImage(requestMarkSprite(), x + img.width - 4, y - 8 - (Math.floor(g.t * 2) % 2));
    } });
  }
  for (const o of g.others) {
    if (o.scene !== 'jar') continue;
    items.push({ y: o.y, draw: () => drawAvatarAt(ctx, o, o.look, false, g.t) });
  }
  if (g.build?.ghost) {
    const gh = g.build.ghost;
    const img = decorSprite(gh.type, g.season);
    items.push({
      y: 998,
      draw: () => {
        ctx.globalAlpha = 0.65;
        ctx.drawImage(img, GX + gh.c * TILE + 8 - img.width / 2, GY + (gh.r + 1) * TILE - img.height);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = gh.ok ? '#9DBA74' : '#D9533C';
        ctx.lineWidth = 1;
        ctx.strokeRect(GX + gh.c * TILE + 0.5, GY + gh.r * TILE + 0.5, TILE - 1, TILE - 1);
      },
    });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  if (g.fishing) drawLine(ctx, g);

  ctx.save();
  ctx.translate(0, ST);
  drawSoil(ctx, g, WW, X0);
  ctx.restore();
  // Weather, the night sky and shooting stars stay put on screen.
  ctx.save();
  ctx.translate(cam, camY);
  drawWeather(ctx, g);
  ctx.restore();
  if (g.night) drawNight(ctx, g);
  ctx.save();
  ctx.translate(cam, camY);
  drawStormFlash(ctx, g);
  ctx.restore();
  ctx.save();
  ctx.translate(cam, camY);
  drawEventSky(ctx, g);
  ctx.restore();
}

// Lanterns drifting up and shooting stars, drawn over the night tint so they glow.
function drawEventSky(ctx, g) {
  const on = id => (g.events || []).some(e => e.id === id);
  if (on('lanterns')) {
    const ours = g.lanternCount || 0;
    for (let i = 0; i < 14 + ours; i++) {
      const hx = hashString('lantern' + i);
      const span = 250;
      const y = 290 - ((g.t * (6 + (hx % 5)) + (hx >>> 5) % span) % span);
      const x = 30 + ((hx >>> 3) % 260) + Math.sin(g.t * 0.6 + i) * 5;
      const yours = i >= 14;
      ctx.fillStyle = yours ? 'rgba(255,200,120,0.35)' : 'rgba(255,190,110,0.22)';
      ctx.fillRect(x - 4, y - 4, 11, 12);
      px(ctx, x, y, 4, 5, yours ? '#FFD27A' : '#F2A65A');
      px(ctx, x + 1, y + 1, 2, 3, '#FFF1C4');
      px(ctx, x, y + 5, 4, 1, '#B5653A');
    }
  }
  for (const m of g.meteors || []) {
    const p = meteorAt(m, g.t);
    const fade = Math.max(0, 1 - p.age / m.life);
    for (let k = 0; k < 10; k++) {
      ctx.fillStyle = `rgba(255,250,210,${(fade * (1 - k / 10)).toFixed(2)})`;
      ctx.fillRect(Math.round(p.x + k * 2.2), Math.round(p.y - k), 2, 2);
    }
    px(ctx, Math.round(p.x) - 1, Math.round(p.y) - 1, 3, 3, '#FFFFFF');
  }
}

const SEASON_EDGE = { spring: PAL.grass, summer: '#9DB86E', autumn: '#C2B070', winter: '#E6EDEE' };

function drawBackdrop(ctx, g, width = W, x0 = 0) {
  // Small pines and hills behind the meadow, inside the glass.
  const winter = g.season === 'winter';
  const far = winter ? '#B9C7C9' : g.season === 'autumn' ? '#A88F5E' : '#8EA889';
  const near = winter ? '#8FA3A4' : g.season === 'autumn' ? '#8A6F45' : PAL.leaf;
  for (let x = x0 + 6; x < x0 + width; x += 22) disc(ctx, x, GY - 2, 16, far);
  for (let i = 0; i < Math.ceil(width / 21) - 1; i++) {
    const x = x0 + 18 + i * 21 + (hashString('pine' + i) % 9);
    const h = 18 + (hashString('h' + i) % 14);
    for (let y = 0; y < h; y++) {
      const w = Math.floor((y / h) * 12) + 1;
      px(ctx, x - w / 2, GY - 10 - h + y, w, 1, y % 4 === 3 ? shade(near, -0.2) : near);
    }
    if (winter) px(ctx, x - 2, GY - 10 - h + 2, 4, 2, PAL.linenHi);
  }
}

function drawPond(ctx, g, id = 'pond') {
  const pond = OBJECTS.find(o => o.id === id);
  const x = GX + pond.c * TILE, y = GY + pond.r * TILE, w = pond.w * TILE, h = pond.h * TILE;
  const frozen = g.season === 'winter';
  const water = frozen ? '#A9C9CE' : PAL.water;
  roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 14, shade(SEASON_EDGE[g.season], -0.25));
  roundRect(ctx, x, y, w, h, 12, '#CDBB8E');
  roundRect(ctx, x + 3, y + 3, w - 6, h - 6, 10, water);
  roundRect(ctx, x + 3, y + h - 10, w - 6, 7, 4, frozen ? '#93B8BE' : PAL.waterShade);
  // ripples
  for (let i = 0; i < 5; i++) {
    const rx = x + 10 + ((i * 23 + Math.floor(g.t * 6)) % (w - 26));
    const ry = y + 10 + ((i * 17) % (h - 24));
    px(ctx, rx, ry, 6, 1, frozen ? PAL.linenHi : PAL.waterHi);
  }
  // lily pads and the marimo moss ball
  if (!frozen) {
    for (const [lx, ly] of id === 'pond' ? [[x + 12, y + 14], [x + 54, y + 40]] : [[x + 14, y + 12], [x + 46, y + 30], [x + 30, y + 22]]) {
      disc(ctx, lx, ly, 4, PAL.leaf);
      px(ctx, lx, ly - 4, 1, 4, PAL.water);
      if (g.season === 'summer') disc(ctx, lx + 2, ly - 1, 1.5, PAL.roseHi);
    }
  }
  if (id !== 'pond') return;
  const mx = x + 40 + Math.sin(g.t * 0.6) * 6, my = y + 30;
  disc(ctx, mx, my, 4, frozen ? shade('#4F7A44', 0.2) : '#4F7A44');
  px(ctx, mx - 2, my - 2, 2, 1, '#79A35F');
}

function roundRect(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fill();
}

function drawPlayer(ctx, g) {
  drawAvatarAt(ctx, g.player, g.state.avatar, true, g.t);
}

function drawAvatarAt(ctx, p, look, isMe, t) {
  if (!look) return;
  const x = Math.round(p.x) - 8, y = Math.round(p.y) - 22;
  ctx.fillStyle = 'rgba(41,55,47,0.25)';
  ctx.fillRect(x + 3, Math.round(p.y) + 1, 10, 2);
  if (p.sleeping) return;
  ctx.drawImage(avatarSprite(look, p.dir || 0, p.frame || 0, p.pose || 'walk'), x, y);
  // Tools in hand
  if (p.pose === 'swing') {
    const up = p.frame === 0;
    const hx = p.dir === DIRS.left ? x + 1 : x + 13;
    px(ctx, hx, y + (up ? 6 : 12), 1, 7, PAL.woodShade);
    px(ctx, hx - 3, y + (up ? 5 : 18), 7, 2, PAL.stoneHi);
  }
  if (!isMe) {
    // a small heart over your partner
    const bob = Math.round(Math.sin(t * 3) * 1);
    ctx.drawImage(heartSprite(), x + 5, y - 9 + bob);
  }
}

function rodTip(g) {
  const p = g.player;
  const dx = p.dir === DIRS.left ? -12 : p.dir === DIRS.right ? 12 : 6;
  const dy = p.dir === DIRS.up ? -26 : -20;
  return { x: p.x + dx, y: p.y + dy };
}

function drawLine(ctx, g) {
  const f = g.fishing;
  const tip = rodTip(g);
  const p = g.player;
  const hand = { x: p.x + (p.dir === DIRS.left ? -4 : 4), y: p.y - 10 };
  ctx.strokeStyle = PAL.woodShade;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(hand.x, hand.y);
  ctx.lineTo(tip.x, tip.y);
  ctx.stroke();
  if (f.phase === 'cast' && f.t < 0.35) return;
  const b = f.bobber;
  const dip = f.phase === 'bite' ? Math.sin(g.t * 30) * 1.5 + 1 : Math.sin(g.t * 3) * 0.5;
  ctx.strokeStyle = 'rgba(243,233,207,0.85)';
  ctx.beginPath();
  ctx.moveTo(tip.x, tip.y);
  ctx.quadraticCurveTo((tip.x + b.x) / 2, Math.max(tip.y, b.y) + 6, b.x, b.y + dip);
  ctx.stroke();
  px(ctx, b.x - 1, b.y - 2 + dip, 3, 2, '#D9533C');
  px(ctx, b.x - 1, b.y + dip, 3, 1, PAL.linenHi);
  if (f.phase === 'bite') {
    const ring = (g.t * 8) % 6;
    ctx.strokeStyle = PAL.waterHi;
    ctx.beginPath();
    ctx.ellipse(b.x, b.y + 2, 3 + ring, 1 + ring / 3, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawSoil(ctx, g, width = W, x0 = 0) {
  const bands = [['#8A6A4A', 22], ['#7F7A70', 26], ['#5E6A7A', 40]];
  let y = SOIL_TOP;
  px(ctx, x0, y, width, 3, PAL.leafShade);
  y += 3;
  bands.forEach(([color, h], i) => {
    px(ctx, x0, y, width, h, color);
    for (let k = 0; k < Math.round(26 * width / W); k++) {
      const hx = hashString('soil' + i + ':' + k);
      px(ctx, x0 + hx % width, y + ((hx >>> 9) % (h - 2)), 2, 1, shade(color, k % 2 ? -0.18 : 0.15));
    }
    if (i === 2) {
      for (let k = 0; k < 7; k++) {
        const hx = hashString('gem' + k);
        const gx = 30 + (hx % 260), gy = y + 8 + ((hx >>> 8) % (h - 14));
        const on = Math.floor(g.t * 2 + k) % 4 !== 0;
        px(ctx, gx, gy, 2, 2, on ? '#A9E0E8' : '#7FB3C0');
      }
    }
    y += h;
  });
  // The mine shaft below the cave, as deep as you've dug.
  const cave = OBJECTS.find(o => o.id === 'cave');
  const sx = GX + cave.c * TILE + 4;
  const depth = Math.round((g.state.mine.deepest / 30) * (bands.reduce((s, b) => s + b[1], 0) - 4));
  if (depth > 0) {
    px(ctx, sx, SOIL_TOP, 8, depth + 3, '#2A2420');
    px(ctx, sx + 1, SOIL_TOP, 1, depth + 3, PAL.woodShade);
    px(ctx, sx + 6, SOIL_TOP, 1, depth + 3, PAL.woodShade);
    for (let k = 4; k < depth; k += 4) px(ctx, sx + 1, SOIL_TOP + k, 6, 1, PAL.wood);
  }
}

function drawWeather(ctx, g) {
  const w = g.weather, wx = g.wx || {};
  const storm = w === 'storm', blizzard = w === 'blizzard';
  // Storms darken the whole jar.
  if (storm || blizzard) {
    ctx.fillStyle = storm ? 'rgba(30,40,60,0.28)' : 'rgba(200,215,225,0.22)';
    ctx.fillRect(0, 0, W, H);
  }
  if (wx.rainbow) drawRainbow(ctx, g);
  if (w === 'rain' || w === 'snow' || storm || blizzard) {
    // a little cloud under the lid (none in a sunshower)
    if (!wx.sunshower) {
      for (const [cx, cy, r] of [[130, 56, 10], [146, 52, 12], [164, 55, 11], [180, 58, 8], [112, 60, 7], ...(storm || blizzard ? [[90, 58, 9], [200, 56, 11], [220, 60, 8]] : [])]) {
        disc(ctx, cx, cy, r, storm ? '#7E8790' : w === 'rain' ? '#AEB6B8' : '#E3E8EA');
      }
    }
    const wet = w === 'rain' || storm;
    const n = storm ? 90 : blizzard ? 80 : wet ? 46 : 34;
    for (let i = 0; i < n; i++) {
      const hx = hashString('drop' + i);
      const speed = storm ? 220 : blizzard ? 70 : wet ? 140 : 18;
      const floor = GY + (hx % (H - GY - 20));
      const span = floor - 50;
      const yy = 50 + ((g.t * speed + (hx >>> 7) % span) % span);
      const slant = storm ? (yy - 50) * 0.25 : blizzard ? (yy - 50) * 0.6 : 0;
      const xx = (20 + ((hx >>> 3) % 300) + slant + (w === 'snow' ? Math.sin(g.t + i) * 4 : 0)) % W;
      if (wet) px(ctx, xx, yy, 1, storm ? 6 : 4, 'rgba(183,212,189,0.8)');
      else px(ctx, xx, yy, 2, 2, 'rgba(255,255,255,0.9)');
    }
  }
  if (w === 'fog') {
    for (let i = 0; i < 4; i++) {
      ctx.fillStyle = 'rgba(243,240,232,0.22)';
      ctx.fillRect(((g.t * (6 + i * 3)) % 400) - 120, 110 + i * 34, 220, 14);
    }
  }
  if (w === 'heat' && !g.night) {
    // Heat shimmer rising off the ground.
    ctx.fillStyle = 'rgba(255,240,200,0.18)';
    for (let i = 0; i < 7; i++) {
      const y = 120 + i * 40 + Math.sin(g.t * 2 + i) * 4;
      for (let x = 0; x < W; x += 8) ctx.fillRect(x, y + Math.round(Math.sin(g.t * 3 + x / 20 + i) * 2), 6, 1);
    }
  }
  drawGusts(ctx, g);
}

// Leaves on the wind (see weather-life.js). The ones you can catch are bigger and glint.
const LEAF_COLORS = {
  spring: ['#F2C4C8', '#E8A0B0', '#F7E0E3'], summer: ['#6FAF5B', '#4F8A4A', '#9DC76A'],
  autumn: ['#D0603A', '#E0873A', '#C9A25A'], winter: ['#F2FAFF', '#DCEFF6', '#FFFFFF'],
};
function drawGusts(ctx, g) {
  const cols = LEAF_COLORS[g.season] || LEAF_COLORS.autumn;
  for (const l of g.gusts || []) {
    const x = Math.round(l.x), y = Math.round(l.y), flip = Math.floor(g.t * 6 + l.phase) % 2;
    if (l.catchable) {
      px(ctx, x - 3, y - 2, 7, flip ? 4 : 3, '#E8B83A');
      px(ctx, x - 2, y - 1, 5, 2, cols[0]);
      if (Math.floor(g.t * 4) % 2) px(ctx, x + 3, y - 4, 2, 2, '#FFFFFF');
    } else px(ctx, x, y, flip ? 3 : 2, 2, cols[l.hue]);
  }
}

// A soft rainbow arc in the sky after the rain.
function drawRainbow(ctx, g) {
  const colors = ['#E8707A', '#F0A55A', '#F0DA6A', '#8DC76A', '#6FA9D9', '#9C82C9'];
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 3;
  colors.forEach((c, i) => {
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(200, 260, 170 - i * 3, Math.PI * 1.08, Math.PI * 1.92);
    ctx.stroke();
  });
  ctx.restore();
}

// Lightning: a bolt and a flash of light, then darkness again.
function drawStormFlash(ctx, g) {
  if (g.flashAt == null || g.weather !== 'storm') return;
  const age = g.t - g.flashAt;
  if (age > 0.45) return;
  if (age < 0.18 && g.bolt) {
    let x = g.bolt.x, y = 46;
    ctx.fillStyle = '#FFF8D8';
    for (let k = 0; k < 9; k++) {
      const nx = x + ((hashString('bolt' + g.bolt.seed + k) % 15) - 7);
      for (let s = 0; s < 10; s++) ctx.fillRect(Math.round(x + (nx - x) * s / 10), y + s, 2, 1);
      x = nx; y += 10;
    }
  }
  ctx.fillStyle = `rgba(255,255,240,${(0.45 * (1 - age / 0.45)).toFixed(2)})`;
  ctx.fillRect(0, 0, W, H);
}

// Cracks in the ground where a fossil or relic is buried (see fossils.js).
function drawDigSites(ctx, g) {
  if (!g.fossilSites || !g.state.daily) return;
  const dug = sitesDug(g.state, g.scene === 'map' ? g.mapId : 'meadow');
  for (const t of g.fossilSites) if (!dug.includes(t.i)) ctx.drawImage(digSiteSprite(), GX + t.c * TILE, GY + t.r * TILE);
}

// Puddles, fallen branches, lightning glass, the rainbow's pot and frost flowers.
function drawWeatherGround(ctx, g) {
  const s = g.wxSpots;
  if (!s || !g.state.daily) return;
  const d = wxDaily(g.state, g.scene === 'map' ? g.mapId : 'meadow');
  const raining = g.weather === 'rain' || g.weather === 'storm';
  for (const t of s.puddles) {
    const x = GX + t.c * TILE, y = GY + t.r * TILE;
    ctx.fillStyle = 'rgba(70,100,110,0.35)';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 8, 4, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(160,200,215,0.55)';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 6.5, 3, 0, 0, Math.PI * 2); ctx.fill();
    px(ctx, x + 4, y + 9, 3, 1, 'rgba(255,255,255,0.7)');
    if (raining) {
      // Puddles can sit on negative rows and columns; keep the ripple between 0 and 1.
      const ring = (((g.t * 2 + t.c * 0.37 + t.r * 0.21) % 1) + 1) % 1;
      ctx.strokeStyle = `rgba(255,255,255,${(0.6 * (1 - ring)).toFixed(2)})`;
      ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 1 + ring * 5, 0.5 + ring * 2, 0, 0, Math.PI * 2); ctx.stroke();
    }
  }
  s.branches.forEach((t, i) => {
    if (d.branches.includes(i)) return;
    const x = GX + t.c * TILE, y = GY + t.r * TILE;
    px(ctx, x + 2, y + 10, 12, 2, '#6A4A30');
    px(ctx, x + 5, y + 7, 2, 3, '#6A4A30'); px(ctx, x + 10, y + 12, 2, 2, '#6A4A30');
    px(ctx, x + 3, y + 6, 3, 2, '#5E8A4A'); px(ctx, x + 11, y + 8, 3, 2, '#4F7A3A');
    if (t.nest) px(ctx, x + 7, y + 8, 4, 2, '#B88D60');
  });
  if (s.strike && !d.strike) {
    const x = GX + s.strike.c * TILE, y = GY + s.strike.r * TILE;
    ctx.fillStyle = 'rgba(40,30,25,0.45)';
    ctx.beginPath(); ctx.ellipse(x + 8, y + 10, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
    px(ctx, x + 6, y + 6, 4, 5, '#C9E8F2'); px(ctx, x + 7, y + 4, 2, 2, '#E9F7FB');
    if (Math.floor(g.t * 3) % 2) px(ctx, x + 10, y + 4, 2, 2, '#FFFFFF');
  }
  if (s.pot && !d.rainbow) {
    const x = GX + s.pot.c * TILE, y = GY + s.pot.r * TILE;
    ['#E8707A', '#F0DA6A', '#8DC76A', '#6FA9D9'].forEach((c, i) => px(ctx, x + 7 + i, y - 10 + i * 4, 2, 6, c));
    px(ctx, x + 3, y + 7, 10, 7, '#3A3A40'); px(ctx, x + 2, y + 6, 12, 2, '#5A5A60');
    px(ctx, x + 5, y + 4, 6, 3, '#E8C25A');
    if (Math.floor(g.t * 3) % 2) px(ctx, x + 12, y + 3, 2, 2, '#FFFFFF');
  }
  s.frost.forEach((t, i) => {
    if (d.frost.includes(i)) return;
    const x = GX + t.c * TILE, y = GY + t.r * TILE;
    px(ctx, x + 7, y + 8, 2, 6, '#5F8A9A');
    for (const [dx, dy] of [[0, -3], [3, 0], [0, 3], [-3, 0]]) px(ctx, x + 7 + dx, y + 5 + dy, 2, 2, '#7FB3C9');
    px(ctx, x + 7, y + 5, 2, 2, '#FFFFFF');
    if (Math.floor(g.t * 2 + i) % 3 === 0) px(ctx, x + 12, y + 2, 1, 1, '#FFFFFF');
  });
  if (g.wx?.frost) {
    // Frost glints on the grass you can see.
    const cx = Math.round(g.camX || 0), cy = Math.round(g.camY || 0);
    for (let i = 0; i < 60; i++) {
      const hx = hashString('frost' + i);
      if ((Math.floor(g.t * 1.5) + i) % 5 === 0) continue;
      const fx = cx + 20 + hx % 280, fy = cy + GY + (hx >>> 9) % (H - GY - 40);
      px(ctx, fx, fy, 1, 1, '#8FC3D9');
      px(ctx, fx - 1, fy + 1, 3, 1, 'rgba(143,195,217,0.6)');
    }
  }
}

function drawNight(ctx, g) {
  // In the meadow the camera has moved the drawing; the dark and the moon stay on screen.
  const ox = Math.round(g.camX || 0), oy = Math.round(g.camY || 0);
  ctx.fillStyle = 'rgba(22,30,58,0.48)';
  ctx.fillRect(ox, oy, W, H);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const glow = (x, y, r, a) => {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, `rgba(255,214,140,${a})`);
    grad.addColorStop(1, 'rgba(255,214,140,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  glow(ox + 160, oy + 46, 70, 0.28);
  const tent = OBJECTS.find(o => o.id === 'tent');
  glow(GX + (tent.c + 2.2) * TILE, GY + tent.r * TILE + 20, 26, 0.35);
  // Lamps, torches and lanterns you've made glow at night.
  if (g.scene === 'jar') for (const d of g.decor) if (LIGHT_DECOR.has(d.type)) glow(GX + d.c * TILE + 8, GY + d.r * TILE - 2, 22, 0.4);
  if (g.season === 'summer' || g.season === 'spring') {
    for (let i = 0; i < 9; i++) {
      const fx = ox + 40 + ((i * 37 + Math.sin(g.t * 0.7 + i) * 18) % 250);
      const fy = oy + GY + 20 + ((i * 29 + Math.cos(g.t * 0.5 + i * 2) * 14) % 130);
      if (Math.floor(g.t * 3 + i) % 3) glow(fx, fy, 4, 0.9);
    }
  }
  ctx.restore();
}

// ---------- the other jars ----------

const WATER = {
  sea: ['#5F9FB5', '#3F7F95', '#B7E0E8'],
  pool: ['#79AAA4', '#507F83', '#B7D4BD'],
  ice: ['#B9D9E2', '#93B8C4', '#F2FAFF'],
  pond: ['#79AAA4', '#507F83', '#B7D4BD'],
  oasis: ['#5FB5B0', '#3F8F8A', '#B7E8E0'],
  falls: ['#5FA8B5', '#3F8095', '#DCF2F6'],
  glow: ['#3F7A6A', '#2A5A4A', '#9FF0C0'],
  moon: ['#3A3A6A', '#2A2A50', '#DCE6F2'],
  spring: ['#8FC9C0', '#6FA9A0', '#F2FAFF'],
};

function drawMapWorld(ctx, g) {
  const map = MAPS[g.mapId];
  // Wide jars are drawn in world space; drawScene slides them by the camera.
  const X0 = -(map.west || 0) * TILE, WW = GX * 2 + (map.cols || COLS) * TILE - X0, cam = Math.round(g.camX || 0), camY = Math.round(g.camY || 0);
  const NT = (map.north || 0) * TILE, ST = (map.south || 0) * TILE;
  px(ctx, X0, -NT, WW, H + NT + ST, skyColor(g));
  ctx.save();
  ctx.translate(0, -NT);
  drawBackdrop(ctx, g, WW, X0);
  ctx.restore();
  const ground = map.ground;
  for (let x = X0; x < X0 + WW; x += TILE) for (let y = GY - 8 - NT; y < SOIL_TOP + ST; y += TILE) ctx.drawImage(grassTile(ground, (x + y) % 32 ? 0 : 1), x, y);
  for (let r = -(map.north || 0); r < ROWS + (map.south || 0); r++) for (let c = -(map.west || 0); c < (map.cols || COLS); c++) ctx.drawImage(grassTile(ground, hashString(map.id + c + ':' + r) % 4), GX + c * TILE, GY + r * TILE);
  // water
  for (const o of map.objects) {
    const kind = o.spot === 'hot_spring' ? 'spring' : o.kind;
    if (!WATER[kind]) continue;
    const [base, deep, hi] = WATER[kind];
    const x = GX + o.c * TILE, y = GY + o.r * TILE, w = o.w * TILE, h = o.h * TILE;
    if (o.kind === 'sea') {
      px(ctx, X0, y, WW, SOIL_TOP + ST - y, base);
      px(ctx, X0, y, WW, 3, hi);
      px(ctx, X0, y + h - 14, WW, 14, deep);
    } else {
      roundRect(ctx, x - 2, y - 2, w + 4, h + 4, 10, shade(base, -0.3));
      roundRect(ctx, x, y, w, h, 9, base);
    }
    for (let i = 0; i < 5; i++) {
      const rx = (o.kind === 'sea' ? X0 + 10 : x + 6) + ((i * 37 + Math.floor(g.t * 6)) % Math.max(20, (o.kind === 'sea' ? WW : w) - 20));
      px(ctx, rx, y + 6 + ((i * 11) % Math.max(8, h - 12)), 6, 1, hi);
    }
  }
  drawWeatherGround(ctx, g);
  drawDigSites(ctx, g);
  // forage
  const daily = g.mapDaily;
  daily?.forage.forEach((f, i) => {
    if (daily.picked.includes(i)) return;
    const p = tileCenter(f.c, f.r);
    ctx.drawImage(itemIcon(f.id), p.x - 8, p.y - 10);
  });
  // Treasure marks in the desert, and flat spots drawn on the ground.
  daily?.digs?.forEach((t, i) => {
    if (daily.dug.includes(i)) return;
    ctx.drawImage(jarThingSprite('dig'), GX + t.c * TILE + 2, GY + t.r * TILE + 4);
  });
  for (const o of map.objects) {
    const flat = { fairy_ring: 'ring', sunset: 'dune', rink: 'rink' }[o.spot];
    if (!flat) continue;
    const img = jarThingSprite(flat);
    ctx.drawImage(img, GX + (o.c + o.w / 2) * TILE - img.width / 2, GY + (o.r + o.h) * TILE - img.height - (flat === 'ring' ? 4 : 0));
  }
  const items = [];
  const at = (o, img) => {
    const x = GX + (o.c + o.w / 2) * TILE - img.width / 2;
    const yb = GY + (o.r + o.h) * TILE;
    items.push({ y: yb, draw: () => ctx.drawImage(img, x, yb - img.height) });
  };
  for (const o of map.objects) {
    if (o.id === 'door') at(o, doorSprite());
    if (o.id === 'palm') at(o, palmSprite(!daily?.shaken?.[o.id]));
    if (o.id === 'hive') at(o, hiveSprite(!daily?.shaken?.[o.id]));
    if (o.kind === 'pine') at(o, pineSprite());
    if (o.id === 'snowman') at(o, snowmanSprite());
    if (o.id === 'arch') at(o, archSprite());
    if (o.kind === 'palm' && o.fruit) at(o, palmSprite(!daily?.shaken?.[o.id]));
    if (['cactus', 'bigtree'].includes(o.kind)) at(o, jarThingSprite(o.kind, o.fruit && !daily?.shaken?.[o.id] ? 1 : 0));
    if (['fern', 'bigshroom', 'bamboo', 'lantern', 'cloud'].includes(o.kind)) at(o, jarThingSprite(o.kind));
    if (o.kind === 'decotree') at(o, decorSprite(o.tree, map.season));
    if (o.kind === 'shop') {
      const shop = SHOPS[map.id];
      at(o, jarStallSprite(shop.color));
      const keeper = critterSprite(shop.shape, shop.color, shop.accent, Math.floor(g.t * 1.5) % 2);
      const kx = GX + (o.c + o.w / 2) * TILE - 8, ky = GY + o.r * TILE + 2;
      items.push({ y: GY + (o.r + o.h) * TILE - 1, draw: () => ctx.drawImage(keeper, kx, ky - keeper.height + 6) });
    }
    if (o.kind === 'spot') {
      const st = daily ? (g.state.daily.spots?.[o.id] ?? 0) : 0;
      const thing = { sandcastle: ['sandcastle', typeof st === 'number' ? st : 0], bottle: st ? null : ['bottle'], igloo: ['igloo'], swing: ['swing'], bouquet: ['bouquet'],
        vine: ['vine'], bounce: null, steamer: ['steamer', Math.floor(g.t * 2)], telescope: ['telescope'], star_bench: ['star_bench'] }[o.spot];
      if (o.spot === 'bounce') at(o, jarThingSprite('bigshroom'));
      else if (thing) at(o, jarThingSprite(thing[0], thing[1] || 0));
    }
  }
  // The waterfall pours into its pool.
  const falls = map.objects.find(o => o.spot === 'waterfall');
  if (falls) {
    const x = GX + falls.c * TILE, y = GY - 20 - NT, fh = (falls.r + 2) * TILE + 20 + NT;
    px(ctx, x, y, falls.w * TILE, fh, '#9FD3E0');
    for (let i = 0; i < 6; i++) px(ctx, x + 4 + i * 7, y + ((g.t * 60 + i * 13) % (fh - 4)), 2, 6, '#F2FAFF');
  }
  drawCritters(ctx, g, items);
  for (const b of g.bugs) {
    const def = BUG_BY_ID[b.id];
    const flap = Math.floor(g.t * 6 + b.phase) % 2;
    items.push({ y: b.y, draw: () => {
      ctx.drawImage(bugSprite(def.kind, def.color, flap), Math.round(b.x) - 5, Math.round(b.y) - 12);
      if (b.alert > 0.4) px(ctx, Math.round(b.x), Math.round(b.y) - 18, 2, 5, b.alert > 0.75 ? '#D9533C' : '#E8C25A');
    } });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  for (const o of g.others) if (o.scene === 'map' && o.mapId === g.mapId) items.push({ y: o.y, draw: () => drawAvatarAt(ctx, o, o.look, false, g.t) });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  if (g.fishing) drawLine(ctx, g);
  px(ctx, X0, SOIL_TOP + ST, WW, H - SOIL_TOP, map.soil || (map.id === 'beach' ? '#C9B07A' : map.id === 'snow' ? '#8E9AA0' : '#8A6A4A'));
  // Steam over the hot spring.
  for (const o of map.objects) {
    if (o.spot !== 'hot_spring') continue;
    for (let i = 0; i < 6; i++) {
      const sx = GX + o.c * TILE + 8 + i * 12, sy = GY + o.r * TILE + 10 - ((g.t * 10 + i * 9) % 30);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.fillRect(sx + Math.sin(g.t + i) * 3, sy, 5, 5);
    }
  }
  // Weather, night, stars and mist stay put on screen.
  ctx.save();
  ctx.translate(cam, camY);
  drawWeather(ctx, g);
  ctx.restore();
  if (g.night) drawNight(ctx, g);
  ctx.save();
  ctx.translate(cam, camY);
  drawStormFlash(ctx, g);
  ctx.restore();
  ctx.save();
  ctx.translate(cam, camY);
  if (map.night) {
    for (let i = 0; i < 40; i++) {
      const hx = hashString('star' + i);
      if ((Math.floor(g.t * 2) + i) % 7) px(ctx, 20 + hx % 280, 20 + (hx >>> 8) % 70, 1, 1, '#FFFFFF');
    }
  }
  if (map.dim) {
    ctx.fillStyle = 'rgba(40,60,50,0.25)';
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 12; i++) {
      const hx = hashString('spore' + i);
      px(ctx, (hx % 300 + g.t * 4 * ((i % 3) + 1)) % W, GY + (hx >>> 9) % 180 - Math.sin(g.t + i) * 6, 2, 2, 'rgba(180,255,200,0.8)');
    }
  }
  ctx.restore();
}

// ---------- inside your home ----------

function drawHome(ctx, g) {
  const room = g.room || {};
  const x0 = GX + ROOM.c0 * TILE, x1 = GX + (ROOM.c1 + 1) * TILE;
  const wallTop = 46, wallBottom = GY + ROOM.r0 * TILE, floorBottom = GY + (ROOM.r1 + 1) * TILE;
  px(ctx, 0, 0, W, H, '#3A2E28');
  // back wall
  const wp = wallpaperTile(room.wallpaper || 'linen');
  for (let x = x0 - 16; x < x1 + 16; x += TILE) for (let y = wallTop; y < wallBottom; y += TILE) ctx.drawImage(wp, x, y);
  px(ctx, x0 - 16, wallTop, x1 - x0 + 32, 3, PAL.woodShade);
  // floor
  const fl = floorTile(room.floor || 'planks');
  for (let c = ROOM.c0 - 1; c <= ROOM.c1 + 1; c++) for (let r = ROOM.r0; r <= ROOM.r1; r++) ctx.drawImage(fl, GX + c * TILE, GY + r * TILE);
  // side walls, slightly in shadow
  ctx.fillStyle = 'rgba(41,30,24,0.55)';
  ctx.fillRect(0, wallTop, x0 - 16, floorBottom - wallTop);
  ctx.fillRect(x1 + 16, wallTop, W - x1 - 16, floorBottom - wallTop);
  ctx.fillStyle = 'rgba(41,30,24,0.25)';
  ctx.fillRect(x0 - 16, wallTop, 16, floorBottom - wallTop);
  ctx.fillRect(x1, wallTop, 16, floorBottom - wallTop);
  // baseboard
  px(ctx, x0 - 16, wallBottom - 4, x1 - x0 + 32, 4, PAL.wood);
  px(ctx, x0 - 16, wallBottom - 4, x1 - x0 + 32, 1, PAL.woodHi);
  // below the floor: the house's foundations in the soil
  px(ctx, 0, floorBottom, W, H - floorBottom, '#5A4332');
  px(ctx, 0, floorBottom, W, 3, PAL.woodShade);
  // the door out, at the front
  const door = tileCenter(DOOR.c, DOOR.r);
  px(ctx, door.x - 10, floorBottom - 3, 20, 6, '#2A2420');
  px(ctx, door.x - 8, door.y - 2, 16, 9, PAL.rose);
  px(ctx, door.x - 6, door.y, 12, 5, PAL.roseHi);
  const bob = Math.round(Math.sin(g.t * 4) * 1.5);
  for (let i = 0; i < 4; i++) px(ctx, door.x - 4 + i, door.y + 8 + i + bob, 8 - i * 2, 1, PAL.linenHi);

  // wall items
  for (const w of g.wallitems) {
    const col = WALL_SLOTS[w.slot];
    if (col == null) continue;
    ctx.drawImage(wallItemSprite(w.type), GX + col * TILE + 8 - 10, wallTop + 34);
  }
  // rugs first, then everything standing, sorted by where it meets the floor
  const items = [];
  for (const f of g.furniture) {
    const def = FURNITURE_BY_TYPE[f.type];
    if (!def) continue;
    const img = furnitureSprite(f.type);
    const x = GX + f.c * TILE, bottom = GY + (f.r + def.h) * TILE;
    if (def.flat) ctx.drawImage(img, x, GY + f.r * TILE);
    else items.push({ y: bottom - 2, draw: () => {
      ctx.drawImage(img, x, bottom - img.height);
      if (def.use === 'sleep') drawSleepers(ctx, g, f, x, bottom - img.height);
    } });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  for (const o of g.others) {
    if (o.scene === 'home' && o.roomId === g.roomId) items.push({ y: o.y, draw: () => drawAvatarAt(ctx, o, o.look, false, g.t) });
  }
  if (g.build?.ghost && g.build.furniture) {
    const gh = g.build.ghost;
    const def = FURNITURE_BY_TYPE[gh.type];
    const img = furnitureSprite(gh.type);
    items.push({ y: 999, draw: () => {
      ctx.globalAlpha = 0.65;
      ctx.drawImage(img, GX + gh.c * TILE, def.flat ? GY + gh.r * TILE : GY + (gh.r + def.h) * TILE - img.height);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = gh.ok ? '#9DBA74' : '#D9533C';
      ctx.strokeRect(GX + gh.c * TILE + 0.5, GY + gh.r * TILE + 0.5, def.w * TILE - 1, def.h * TILE - 1);
    } });
  }
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());

  // evening light from lamps, candles and the fire
  if (g.night) {
    ctx.fillStyle = 'rgba(22,30,58,0.38)';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const f of g.furniture) {
      if (!['floor_lamp', 'fireplace', 'nightstand', 'desk', 'stove'].includes(f.type)) continue;
      const def = FURNITURE_BY_TYPE[f.type];
      const cx = GX + (f.c + def.w / 2) * TILE, cy = GY + f.r * TILE;
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 46);
      grad.addColorStop(0, 'rgba(255,214,140,0.4)');
      grad.addColorStop(1, 'rgba(255,214,140,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 46, cy - 46, 92, 92);
    }
    ctx.restore();
  }
}

// Heads on the pillows: you, and your partner if they're tucked in too.
function drawSleepers(ctx, g, bed, x, y) {
  const sleepers = [];
  if (g.player.sleeping && g.player.bedId === bed.id) sleepers.push({ look: g.state.avatar, side: g.player.side || 0 });
  for (const o of g.others) if (o.sleeping && o.bedId === bed.id && o.roomId === g.roomId) sleepers.push({ look: o.look, side: o.side || 0 });
  for (const s of sleepers) {
    ctx.drawImage(sleeperSprite(s.look), x + 4 + s.side * 14, y + 8);
  }
  if (sleepers.length && Math.floor(g.t) % 2 === 0) px(ctx, x + 10, y + 2, 3, 1, PAL.ink);
}

// ---------- the mine ----------

const POOL_COLORS = ['#4F7A8A', '#4F6F8A', '#6A5FA0', '#7FB5C9', '#D9603A', '#3A2F66'];

function drawMine(ctx, g) {
  const band = bandOf(g.layer);
  const col = BANDS[band];
  const m = g.mine;
  px(ctx, 0, 0, W, H, col.wall);
  // ceiling with hanging rock
  for (let i = 0; i < 16; i++) {
    const hx = hashString('stal' + g.layer + ':' + i);
    const x = i * 20 + (hx % 8), len = 10 + (hx >>> 6) % 22;
    for (let y = 0; y < len; y++) px(ctx, x + y / 4, GY - 46 + y, Math.max(1, 6 - y / 4), 1, shade(col.wall, -0.15));
  }
  px(ctx, 0, GY - 6, W, ROWS * TILE + 12, col.floor);
  for (let k = 0; k < 120; k++) {
    const hx = hashString('floor' + g.layer + ':' + k);
    px(ctx, hx % W, GY - 6 + ((hx >>> 9) % (ROWS * TILE + 12)), 2, 1, col.speck);
  }
  px(ctx, 0, SOIL_TOP + 6, W, H, shade(col.wall, -0.2));

  if (m?.pool) {
    const p = m.pool, x = GX + p.c * TILE, y = GY + p.r * TILE;
    roundRect(ctx, x - 2, y - 2, p.w * TILE + 4, p.h * TILE + 4, 10, shade(col.wall, 0.1));
    roundRect(ctx, x, y, p.w * TILE, p.h * TILE, 8, POOL_COLORS[band]);
    for (let i = 0; i < 5; i++) px(ctx, x + 10 + i * 20, y + 10 + (i % 2) * 18 + Math.round(Math.sin(g.t + i) * 2), 6, 1, shade(POOL_COLORS[band], 0.35));
  }
  for (const k of m?.walls || []) {
    const [c, r] = k.split(',').map(Number);
    ctx.drawImage(caveWallSprite(band), GX + c * TILE, GY + r * TILE);
  }
  (m?.forage || []).forEach((f, i) => {
    if (g.minePicked?.has(i)) return;
    const p = tileCenter(f.c, f.r);
    ctx.drawImage(itemIcon(f.id), p.x - 8, p.y - 10);
    if (Math.floor(g.t * 2 + i) % 3 === 0) px(ctx, p.x + 4, p.y - 10, 1, 1, PAL.linenHi);
  });

  const items = [];
  const up = ladderUpSprite();
  const entry = tileCenter(MINE_ENTRY.c, MINE_ENTRY.r);
  ctx.drawImage(up, entry.x - 8, entry.y - 30);
  const broken = g.mineBroken;
  for (const rock of g.rocks) {
    const p = tileCenter(rock.c, rock.r);
    if (broken.has(rock.id)) {
      if (rock.ladder) ctx.drawImage(ladderHoleSprite(), p.x - 8, p.y - 8);
      continue;
    }
    const img = rockSprite(rock.kind, band);
    const hits = g.hits.get(rock.id) || 0;
    items.push({
      y: p.y + 6,
      draw: () => {
        const shake = g.shakeRock === rock.id ? Math.round(Math.sin(g.t * 60)) : 0;
        ctx.drawImage(img, p.x - 8 + shake, p.y - 9);
        if (hits) {
          px(ctx, p.x - 3, p.y - 5, 1, 4, PAL.inkDeep);
          px(ctx, p.x - 2, p.y - 2, 3, 1, PAL.inkDeep);
          if (hits > 1) px(ctx, p.x + 2, p.y - 6, 1, 5, PAL.inkDeep);
        }
      },
    });
  }
  for (const c of m?.chests || []) {
    const p = tileCenter(c.c, c.r);
    items.push({ y: p.y + 6, draw: () => ctx.drawImage(chestSprite(g.mineOpened?.has(c.id)), p.x - 8, p.y - 9) });
  }
  for (const mo of g.monsters || []) {
    const def = MONSTERS[mo.kind];
    const flash = g.t < (mo.flashUntil || 0);
    // A hidden rock crab looks just like a rock.
    const img = mo.hidden ? rockSprite('stone', band) : monsterSprite(mo.kind, Math.floor(g.t * 3 + mo.id) % 2, flash);
    items.push({ y: mo.y, draw: () => {
      const bob = def.flies && !mo.hidden ? Math.round(Math.sin(g.t * 4 + mo.id) * 2) - 4 : 0;
      ctx.drawImage(img, Math.round(mo.x - img.width / 2), Math.round(mo.y - img.height + 2 + bob));
      if (mo.hp < mo.maxHp) {
        const w = def.boss ? 24 : 14;
        px(ctx, Math.round(mo.x - w / 2), Math.round(mo.y - img.height - 3 + bob), w, 2, PAL.inkDeep);
        px(ctx, Math.round(mo.x - w / 2), Math.round(mo.y - img.height - 3 + bob), Math.round(w * mo.hp / mo.maxHp), 2, '#D9533C');
      }
    } });
  }
  items.push({ y: g.player.y, draw: () => drawPlayer(ctx, g) });
  for (const o of g.others) {
    if (o.scene === 'mine' && o.layer === g.layer) items.push({ y: o.y, draw: () => drawAvatarAt(ctx, o, o.look, false, g.t) });
  }
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  if (g.fishing) drawLine(ctx, g);

  // Deeper zones are darker; the lantern lights around you.
  if (band > 0) {
    ctx.save();
    const grad = ctx.createRadialGradient(g.player.x, g.player.y - 8, 20, g.player.x, g.player.y - 8, 150);
    grad.addColorStop(0, 'rgba(10,8,12,0)');
    grad.addColorStop(1, `rgba(10,8,12,${Math.min(0.75, 0.35 + band * 0.08)})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  // You got hit: a quick red flash.
  if (g.t < (g.hurtUntil || 0)) {
    ctx.fillStyle = 'rgba(217,83,60,0.25)';
    ctx.fillRect(0, 0, W, H);
  }
  // Health, top left.
  const max = g.maxHp || 100, hp = Math.max(0, g.state.hp ?? max);
  px(ctx, 30, 62, 62, 7, PAL.inkDeep);
  px(ctx, 31, 63, Math.round(60 * hp / max), 5, hp / max < 0.3 ? '#D9533C' : '#7FC95A');
}

// ---------- effects, glass and fishing UI ----------

function drawEffects(ctx, g) {
  for (const e of g.effects) {
    const age = g.t - e.t0;
    const y = e.y - age * 18;
    if (e.kind === 'heart') ctx.drawImage(heartSprite(), Math.round(e.x) - 3, Math.round(y));
    if (e.kind === 'note') ctx.drawImage(noteSprite(), Math.round(e.x + Math.sin(age * 6) * 3) - 3, Math.round(y));
    if (e.kind === 'bubble') ctx.drawImage(bubbleSprite(), Math.round(e.x + Math.sin(age * 4 + e.x) * 4) - 3, Math.round(y));
    if (e.kind === 'splash') {
      const t = age;
      if (t < 0.5) px(ctx, Math.round(e.x + e.vx * t), Math.round(e.y - 30 * t + 70 * t * t), 2, 2, 'rgba(183,224,236,0.9)');
    }
    if (e.kind === 'sparkle' && Math.floor(age * 8) % 2 === 0) ctx.drawImage(sparkleSprite(), Math.round(e.x) - 3, Math.round(e.y) - 3);
    if (e.kind === 'item') {
      ctx.globalAlpha = Math.max(0, 1 - age / 1.2);
      ctx.drawImage(itemIcon(e.id), Math.round(e.x) - 8, Math.round(y) - 8);
      ctx.globalAlpha = 1;
    }
  }
  const p = g.player;
  if (g.fishing?.phase === 'bite') bubble(ctx, p.x, p.y - 30, '!');
  if (g.player.thinking) bubble(ctx, p.x, p.y - 30, '…');
}

function bubble(ctx, x, y, text) {
  px(ctx, x - 5, y - 9, 11, 10, PAL.linenHi);
  px(ctx, x - 6, y - 8, 13, 8, PAL.linenHi);
  px(ctx, x - 1, y + 1, 3, 2, PAL.linenHi);
  ctx.fillStyle = text === '!' ? '#D9533C' : PAL.ink;
  if (text === '!') {
    px(ctx, x, y - 7, 2, 5, '#D9533C');
    px(ctx, x, y - 1, 2, 1, '#D9533C');
  } else {
    for (let i = 0; i < 3; i++) px(ctx, x - 3 + i * 3, y - 4, 2, 2, PAL.ink);
  }
}

function drawGlass(ctx, g) {
  const { x, y, w, h } = JAR;
  // shelf
  px(ctx, 0, y + h - 6, W, 18, PAL.wood);
  px(ctx, 0, y + h - 6, W, 2, PAL.woodHi);
  px(ctx, 0, y + h + 10, W, 2, PAL.woodShade);
  // glass outline and shine
  ctx.save();
  jarPath(ctx);
  ctx.strokeStyle = 'rgba(56,73,61,0.85)';
  ctx.lineWidth = 3;
  ctx.stroke();
  jarPath(ctx);
  ctx.strokeStyle = 'rgba(255,247,228,0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.fillRect(x + 8, y + 26, 4, h - 80);
  ctx.fillRect(x + 15, y + 34, 2, 46);
  ctx.fillRect(x + w - 14, y + 60, 3, 60);
  if (g.weather === 'rain' && g.scene === 'jar') {
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    for (let i = 0; i < 18; i++) {
      const hx = hashString('fogdot' + i);
      ctx.fillRect(x + 6 + (hx % (w - 12)), y + 10 + ((hx >>> 8) % 60), 2, 2);
    }
  }
  // neck and lid
  px(ctx, 44, 32, 232, 10, 'rgba(220,232,228,0.55)');
  px(ctx, 44, 32, 232, 1, 'rgba(56,73,61,0.7)');
  px(ctx, 38, 14, 244, 20, PAL.wood);
  px(ctx, 38, 14, 244, 3, PAL.woodHi);
  px(ctx, 38, 31, 244, 3, PAL.woodShade);
  for (let i = 0; i < 12; i++) px(ctx, 46 + i * 20, 20, 8, 1, PAL.woodShade);
  px(ctx, 152, 8, 16, 7, PAL.woodShade);
  px(ctx, 154, 6, 12, 3, PAL.wood);
  if (g.night && g.scene === 'jar') {
    disc(ctx, 160, 46, 4, '#FFE7A8');
    px(ctx, 159, 41, 2, 3, PAL.woodShade);
  }
  if (g.season === 'winter') {
    for (let i = 0; i < 10; i++) disc(ctx, 46 + i * 24, 14, 5 + (i % 3), '#F7FAFA');
  }
}

function drawFishingUi(ctx, g) {
  const f = g.fishing;
  if (f.phase !== 'reel') return;
  const m = f.game;
  const x = 276, y = 92, w = 22, h = 160;
  px(ctx, x - 3, y - 3, w + 6, h + 6, PAL.woodShade);
  px(ctx, x - 2, y - 2, w + 4, h + 4, PAL.linen);
  px(ctx, x, y, 14, h, PAL.waterShade);
  const zh = m.zone * h;
  const zy = y + h - m.zoneY * h - zh;
  ctx.fillStyle = m.overlap ? 'rgba(157,186,116,0.85)' : 'rgba(157,186,116,0.55)';
  ctx.fillRect(x + 1, zy, 12, zh);
  px(ctx, x + 1, zy, 12, 1, PAL.leafHi);
  px(ctx, x + 1, zy + zh - 1, 12, 1, PAL.leafShade);
  const fy = y + h - m.fishY * h;
  const icon = itemIcon(f.catch.id);
  ctx.drawImage(icon, x - 1, fy - 8);
  // progress
  px(ctx, x + 16, y, 4, h, PAL.inkDeep);
  const ph = Math.round(m.progress * h);
  px(ctx, x + 16, y + h - ph, 4, ph, m.progress > 0.3 ? '#9DBA74' : '#D9A55B');
}
