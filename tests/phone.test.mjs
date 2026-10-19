import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const phone = readFileSync(new URL('../src/phone.js', import.meta.url), 'utf8');
const page = readFileSync(new URL('../play.html', import.meta.url), 'utf8');

test('every panel in the game has an app on the phone', () => {
  const panels = [
    'T.openToday', "T.openJournal(g, 'talk')", "T.openJournal(g, 'moments')", "T.openJournal(g, 'scrapbook')", "T.openJournal(g, 'found')",
    'T.openBoard', 'T.openMailbox', 'T.openCalendar', 'T.openDreams', 'openHangout', 'UI.openBag', 'UI.openLog', 'openKitchen',
    'openCrafting', 'UI.openWorkbench', 'UI.openWardrobe', 'openBuild', 'openFurnish', 'openHome', 'UI.openShop', 'openTravel',
    'openEventStand', 'openMore', 'openFriends', 'openMine',
  ];
  for (const p of panels) assert.ok(phone.includes(p), p);
});

test('the bottom tray is just the phone, plus the leave and stop-placing buttons', () => {
  const tray = page.match(/<nav id="tray"[\s\S]*?<\/nav>/)[0];
  assert.deepEqual([...tray.matchAll(/id="(btn-[a-z]+)"/g)].map(m => m[1]), ['btn-phone', 'btn-leave', 'btn-cancel']);
  assert.ok(page.includes('id="phone"') && page.includes('id="sheet-back"'));
});
