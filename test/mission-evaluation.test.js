import test from 'node:test';
import assert from 'node:assert/strict';

import { recordActivity, recordObservation } from '../src/engine/activity.js';
import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import { getMission } from '../src/quests/missionRegistry.js';
import { advanceMissionTwo } from '../src/quests/mission2/mission2Runtime.js';

function missionTwoState() {
  const state = createD8SW1();
  state.currentQuestId = 'mission-2';
  Object.assign(state.interfaces['g0/12'], {
    mode: 'access',
    accessVlan: '10',
    description: 'Office 4B Workstation',
    voiceVlan: null
  });
  return state;
}

function inspectOfficePort(state) {
  const port = state.interfaces['g0/12'];
  recordObservation(state, {
    type: 'interface-config',
    interfaceName: 'g0/12',
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    linkUp: port.linkUp
  });
}

function mutation(state, target = 'g0/12') {
  state.configurationChanges += 1;
  state.saved = false;
  recordActivity(state, {
    type: 'configuration-mutation',
    targetType: 'interface',
    target,
    field: 'voiceVlan'
  });
}

function save(state) {
  state.saved = true;
  state.lastSavedConfigurationChanges = state.configurationChanges;
  const entry = recordActivity(state, { type: 'configuration-saved' });
  state.lastSavedSequence = entry.sequence;
}

function perfectRepair() {
  const state = missionTwoState();
  inspectOfficePort(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  mutation(state);
  inspectOfficePort(state);
  save(state);
  return state;
}

test('Missions 0-5 expose configurable maximum-XP evaluations', () => {
  for (let index = 0; index <= 5; index += 1) {
    const definition = getMission(`mission-${index}`).definition;
    assert.equal(typeof definition.evaluation.maximumXp, 'number');
    assert.ok(Array.isArray(definition.evaluation.criteria));
    assert.ok(Array.isArray(definition.evaluation.mistakes));
  }
});

test('working saved state completes with less-than-perfect evaluation', () => {
  const state = missionTwoState();
  state.interfaces['g0/12'].voiceVlan = '20';
  state.saved = true;

  const result = advanceMissionTwo(state);

  assert.equal(result.type, 'completed');
  assert.equal(result.evaluation.awardedXp, 70);
  assert.equal(result.evaluation.maximumXp, 100);
  assert.equal(state.credits, 25);
});

test('professional chronology earns a perfect evaluation', () => {
  const state = perfectRepair();
  const result = advanceMissionTwo(state);

  assert.equal(result.evaluation.perfect, true);
  assert.equal(result.evaluation.awardedXp, 100);
  assert.deepEqual(result.evaluation.deductions, []);
});

test('repeating inspection commands cannot farm additional XP', () => {
  const state = perfectRepair();
  for (let count = 0; count < 8; count += 1) inspectOfficePort(state);

  const result = advanceMissionTwo(state);

  assert.equal(result.evaluation.awardedXp, 100);
  assert.equal(state.xp, 100);
  assert.equal(advanceMissionTwo(state).type, 'already-completed');
  assert.equal(state.xp, 100);
});

test('verification after saving is distinguished from verification before saving', () => {
  const state = missionTwoState();
  inspectOfficePort(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  mutation(state);
  save(state);
  inspectOfficePort(state);

  const result = advanceMissionTwo(state);

  assert.equal(result.evaluation.awardedXp, 90);
  assert.deepEqual(result.evaluation.deductions.map((item) => item.id), ['verifiedBeforeSave']);
});

test('unrelated interface mutation receives a collateral-damage deduction', () => {
  const state = missionTwoState();
  inspectOfficePort(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  mutation(state);
  mutation(state, 'g0/9');
  inspectOfficePort(state);
  save(state);

  const result = advanceMissionTwo(state);

  assert.equal(result.evaluation.awardedXp, 75);
  assert.ok(result.evaluation.deductions.some((item) => item.id === 'unrelatedInterfaceModified'));
});

test('creating and repairing an outage on the target port cannot earn maximum XP', () => {
  const state = missionTwoState();
  inspectOfficePort(state);

  state.interfaces['g0/12'].shutdown = true;
  state.configurationChanges += 1;
  recordActivity(state, {
    type: 'configuration-mutation',
    targetType: 'interface',
    target: 'g0/12',
    field: 'shutdown',
    before: false,
    after: true
  });

  state.interfaces['g0/12'].shutdown = false;
  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges += 1;
  recordActivity(state, {
    type: 'configuration-mutation',
    targetType: 'interface',
    target: 'g0/12',
    field: 'shutdown',
    before: true,
    after: false
  });
  inspectOfficePort(state);
  save(state);

  const result = advanceMissionTwo(state);
  assert.equal(result.evaluation.awardedXp, 80);
  assert.deepEqual(result.evaluation.deductions.map((item) => item.id), ['causedAdditionalOutage']);
});

test('working state without a current save cannot complete', () => {
  const state = missionTwoState();
  state.interfaces['g0/12'].voiceVlan = '20';
  mutation(state);

  assert.equal(advanceMissionTwo(state).type, 'blocked');
  assert.equal(state.xp, 0);
  assert.equal(state.questCompleted, false);
});
