import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { C, questionFor, missionFor, weekOf, mondayOf, ritualFor } from '../src/content.js';
import { currentNeeds, applyAction, cooldownLeft, actionsFor, COOLDOWN_MS } from '../src/animals.js';
import { cloud } from '../src/cloud.js';
import { icsFor } from '../src/together.js';

// Load the content the way the page does, without fetch.
const lib = JSON.parse(readFileSync(new URL('../content/library.json', import.meta.url)));
const extra = JSON.parse(readFileSync(new URL('../content/extras.json', import.meta.url)));
Object.assign(C, extra, { questions: lib.questions, missions: lib.missions, dateIdeas: lib.dateIdeas, packs: [...extra.starterPacks, ...lib.packs], ready: true });

test('all the original content came across', () => {
  assert.equal(C.questions.length, 3000);
  assert.equal(C.missions.length, 500);
  assert.equal(C.packs.length, 306);
  assert.equal(C.dateIdeas.length, 160);
  assert.equal(C.interactions.length, 43);
  assert.equal(C.landmarks.length, 10);
  assert.equal(C.decorations.length, 30, 'forest decorations (20 more are added at load)');
  assert.equal(C.moods.length, 6);
  assert.equal(C.rituals.length, 3);
  for (const m of C.missions) assert.equal(m.steps.length, 3, m.id);
});

test('the daily question never repeats until all 3,000 have come up', () => {
  const seen = new Set();
  for (let d = 0; d < 3000; d++) seen.add(questionFor('jar-seed', 20000, 20000 + d).id);
  assert.equal(seen.size, 3000);
  assert.equal(questionFor('jar-seed', 20000, 23000).id, questionFor('jar-seed', 20000, 20000).id);
  assert.notEqual(questionFor('other-seed', 20000, 20000).id + questionFor('other-seed', 20000, 20001).id,
    questionFor('jar-seed', 20000, 20000).id + questionFor('jar-seed', 20000, 20001).id);
});

test('both partners get the same question and mission', () => {
  assert.equal(questionFor('s', 20000, 20123).id, questionFor('s', 20000, 20123).id);
  assert.equal(missionFor('s', 20000, 3000).id, missionFor('s', 20000, 3000).id);
  const weeks = new Set();
  for (let w = 0; w < 500; w++) weeks.add(missionFor('s', 20000, weekOf(20000) + w).id);
  assert.equal(weeks.size, 500);
});

test('weeks start on Monday', () => {
  // 2026-10-19 is a Monday: day 20745
  const monday = Math.floor(Date.UTC(2026, 9, 19) / 86400000);
  assert.equal(weekOf(monday), weekOf(monday + 6));
  assert.equal(weekOf(monday) - 1, weekOf(monday - 1));
  assert.equal(mondayOf(weekOf(monday + 3)), monday);
  assert.ok(ritualFor(weekOf(monday)).prompts.length >= 3);
});

test('animal needs fall slowly and never below a third while you are away', () => {
  const t0 = 1_000_000_000_000;
  const doc = { needs: { full: 90, happy: 90, rested: 90, clean: 90 }, updatedAt: t0 };
  const hour = currentNeeds(doc, t0 + 3600000);
  assert.equal(hour.full, 84);
  const week = currentNeeds(doc, t0 + 7 * 86400000);
  for (const v of Object.values(week)) assert.ok(v >= 34);
  const fed = applyAction(doc, 'feed', t0);
  assert.equal(fed.needs.full, 100);
  assert.equal(cooldownLeft(fed, 'feed', t0 + 1000), COOLDOWN_MS - 1000);
  assert.equal(cooldownLeft(fed, 'pet', t0), 0);
});

test('each species gets only its own actions', () => {
  assert.ok(actionsFor('frog').some(a => a.id === 'croak'));
  assert.ok(!actionsFor('bunny').some(a => a.id === 'croak'));
  assert.ok(actionsFor('marimo').every(a => a.species.includes('marimo')));
  const total = new Set(['bunny', 'frog', 'turtle', 'snail', 'marimo'].flatMap(s => actionsFor(s).map(a => a.id)));
  assert.equal(total.size, 43);
});

test('the device-only store behaves like the shared one', async () => {
  const db = cloud.db;
  await db.doc('t/a').set({ x: 1, nested: { a: 1 } });
  await db.doc('t/a').update({ nested: { b: 2 } });
  assert.deepEqual((await db.doc('t/a').get()).data(), { x: 1, nested: { a: 1, b: 2 } });
  await assert.rejects(db.doc('t/missing').update({ y: 1 }));
  const seen = [];
  const stop = db.collection('t').onSnapshot(s => seen.push(s.size));
  await db.collection('t').doc('b').set({ y: 2 });
  await new Promise(r => setTimeout(r, 10));
  stop();
  assert.deepEqual(seen.slice(-1), [2]);
  await db.doc('t/a').delete();
  assert.equal((await db.doc('t/a').get()).exists, false);
});

test('calendar files escape text and fold long lines', () => {
  const ics = icsFor([{ id: 'd1', title: 'Picnic, games; and a very long title that keeps going well past the seventy five character limit', when: '2026-10-20T18:00:00.000Z', minutes: 90, place: 'Park' }]);
  assert.ok(ics.includes(String.raw`SUMMARY:Picnic\, games\; and`));
  assert.ok(ics.split('\r\n').every(line => line.length <= 75));
  assert.ok(ics.includes('DTSTART:20261020T180000Z'));
  assert.ok(ics.includes('DTEND:20261020T193000Z'));
});
