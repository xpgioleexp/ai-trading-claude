import test from 'node:test';
import assert from 'node:assert/strict';
import * as R from '../src/rules.js';
import { ITEMS, MINE_LAYERS } from '../src/data.js';
import { ROCKS, ROCK_TABLE, MONSTERS, GEODE_CONTENTS, FOSSILS_BY_BAND, ARTIFACTS_BY_BAND, BANDS } from '../src/mine-data.js';
import { ROWS } from '../src/world.js';

const fresh = () => { const s = R.newState('seed', 20000); R.rollover(s, 20000); return s; };

test('every rock, fossil, artifact, geode and monster drop is a real item', () => {
  for (const [k, def] of Object.entries(ROCKS)) if (!['fossil', 'artifact'].includes(def.drop)) assert.ok(ITEMS[def.drop], k);
  for (const t of ROCK_TABLE) for (const k of Object.keys(t)) assert.ok(ROCKS[k], k);
  for (const list of [...FOSSILS_BY_BAND, ...ARTIFACTS_BY_BAND, ...Object.values(GEODE_CONTENTS)]) for (const id of list) assert.ok(ITEMS[id], id);
  for (const [k, m] of Object.entries(MONSTERS)) for (const [id] of m.drops) assert.ok(ITEMS[id], `${k} ${id}`);
  assert.equal(ROCK_TABLE.length, BANDS.length);
  assert.equal(MINE_LAYERS, BANDS.length * 10);
});

test('every layer can be walked from the ladder, and the way down is reachable', () => {
  for (const day of [20000, 20001, 20002]) {
    for (let layer = 1; layer <= MINE_LAYERS; layer++) {
      const m = R.layerMap('seed', day, layer);
      const walls = new Set(m.walls);
      const p = m.pool;
      const blocked = (c, r) => walls.has(c + ',' + r) || (p && c >= p.c && c < p.c + p.w && r >= p.r && r < p.r + p.h)
        || m.chests.some(ch => ch.c === c && ch.r === r);
      const seen = new Set(['8,1']);
      const todo = [{ c: 8, r: 1 }];
      while (todo.length) {
        const t = todo.pop();
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const c = t.c + dc, r = t.r + dr;
          if (c < 0 || r < 0 || c >= 17 || r >= ROWS || seen.has(c + ',' + r) || blocked(c, r)) continue;
          seen.add(c + ',' + r);
          todo.push({ c, r });
        }
      }
      for (const rock of m.rocks) assert.ok(seen.has(rock.c + ',' + rock.r), `layer ${layer} rock ${rock.c},${rock.r}`);
      for (const mo of m.monsters) assert.ok(seen.has(mo.c + ',' + mo.r), `layer ${layer} monster`);
      for (const ch of m.chests) assert.ok([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dc, dr]) => seen.has(`${ch.c + dc},${ch.r + dr}`)), `layer ${layer} chest`);
      assert.equal(m.rocks.filter(r => r.ladder).length, layer < MINE_LAYERS ? 1 : 0);
    }
  }
});

test('bosses on every tenth layer, special rooms on every fifth', () => {
  for (let layer = 10; layer <= MINE_LAYERS; layer += 10) {
    const m = R.layerMap('seed', 20000, layer);
    assert.equal(m.kind, 'boss');
    assert.ok(m.monsters.some(mo => MONSTERS[mo.kind].boss && MONSTERS[mo.kind].band === R.bandOf(layer)));
  }
  const kinds = new Set();
  for (let day = 0; day < 30; day++) kinds.add(R.layerKind('seed', 20000 + day, 15));
  assert.deepEqual([...kinds].sort(), ['den', 'grotto', 'lake', 'treasure']);
  assert.equal(R.layerMap('seed', 20000, 1).monsters.length, 1, 'gentle start');
});

test('monsters start away from the ladder', () => {
  for (let layer = 1; layer <= MINE_LAYERS; layer++) {
    for (const mo of R.layerMap('seed', 20003, layer).monsters) assert.ok(Math.max(Math.abs(mo.c - 8), Math.abs(mo.r - 1)) >= 4);
  }
});

test('chests open once and pay out', () => {
  const s = fresh();
  let layer = 5, day = 20000;
  while (R.layerKind(s.seed, day, layer) !== 'treasure') layer += 10;
  const before = s.pebbles;
  const res = R.openChest(s, layer, 0);
  assert.ok(res.pebbles > 0 && s.pebbles === before + res.pebbles);
  assert.equal(R.openChest(s, layer, 0), null);
  assert.deepEqual(R.chestLoot(s.seed, day, layer, 1), R.chestLoot(s.seed, day, layer, 1));
});

test('geodes crack into something from their list', () => {
  const s = fresh();
  R.addItem(s, 'magma_geode', 1);
  const got = R.crackGeode(s, 'magma_geode', () => 0.5);
  assert.ok(GEODE_CONTENTS.magma_geode.includes(got));
  assert.equal(R.countItem(s, 'magma_geode'), 0);
  assert.equal(R.crackGeode(s, 'magma_geode'), null);
});

test('cave lakes have their zone\'s fish', () => {
  for (let band = 0; band < BANDS.length; band++) {
    for (let i = 0; i < 30; i++) {
      const c = R.caveCatch(Math.random, band);
      assert.ok(ITEMS[c.id].bands.includes(band));
    }
  }
});

test('health: hurt, eat to heal, bosses raise your max once', () => {
  const s = fresh();
  assert.equal(s.hp, 100);
  R.hurt(s, 70);
  assert.equal(s.hp, 30);
  R.addItem(s, 'radish', 1);
  assert.equal(R.eat(s, 'radish'), 12);
  assert.equal(R.eat(s, 'stone'), 0);
  const res = R.defeatMonster(s, 10, { id: 0, kind: 'big_slime' }, () => 0);
  assert.ok(res.firstBoss);
  assert.equal(R.maxHp(s), 120);
  assert.equal(s.hp, 120);
  assert.equal(R.defeatMonster(s, 10, { id: 0, kind: 'big_slime' }), null, 'once per day');
  assert.equal(s.log.monsters.big_slime, 1);
  R.rollover(s, 20001);
  assert.equal(s.hp, 120, 'a new day heals you');
});

test('a sword and new tool tiers', () => {
  const s = fresh();
  assert.equal(R.swordDamage(s), 3);
  s.pebbles = 99999;
  R.addItem(s, 'copper_ore', 5);
  assert.ok(R.upgradeTool(s, 'sword'));
  assert.equal(R.swordDamage(s), 5);
  assert.deepEqual(R.elevatorStops(45), [1, 11, 21, 31, 41]);
});
