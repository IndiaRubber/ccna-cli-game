import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildingHotspots,
  getCampaignHotspots
} from '../src/ui/buildingHub.js';

test('building hotspot definitions expose reusable location data', () => {
  const office = buildingHotspots.find((hotspot) => hotspot.id === 'office-4b');

  assert.equal(office.floor, 'floor-3');
  assert.equal(typeof office.x, 'number');
  assert.equal(typeof office.y, 'number');
  assert.ok(office.label);
});

test('campaign state activates and resolves the appropriate building hotspot', () => {
  const active = getCampaignHotspots({
    currentQuestId: 'mission-3',
    completedQuests: ['mission-0', 'mission-1', 'mission-2'],
    questCompleted: false
  });
  const printer = active.find((hotspot) => hotspot.id === 'relocated-printer');
  const office = active.find((hotspot) => hotspot.id === 'office-4b');

  assert.equal(printer.active, true);
  assert.equal(printer.status, 'warning');
  assert.equal(office.status, 'resolved');

  const resolved = getCampaignHotspots({
    currentQuestId: 'mission-3',
    completedQuests: ['mission-0', 'mission-1', 'mission-2'],
    questCompleted: true
  });

  assert.equal(
    resolved.find((hotspot) => hotspot.id === 'relocated-printer').status,
    'resolved'
  );
});
