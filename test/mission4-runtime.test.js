import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import { getMission } from '../src/quests/missionRegistry.js';
import {
  MISSION_FOUR_EVENTS,
  advanceMissionFour,
  evaluateMissionFour,
  prepareMissionFourScenario
} from '../src/quests/mission4/mission4Runtime.js';

const targetMac = '00aa.bbcc.dd21';

function preparedState() {
  const state = createD8SW1();
  state.currentQuestId = 'mission-4';
  prepareMissionFourScenario(state);
  return state;
}

function macObservation(state, entries) {
  state.observations.push({
    type: 'mac-address-table',
    query: { kind: 'all', value: null },
    entries: entries.map((entry) => ({ ...entry }))
  });
}

function inspectTarget(state) {
  const port = state.interfaces['g0/21'];
  state.observations.push({
    type: 'interface-config',
    interfaceName: 'g0/21',
    description: port.description,
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    linkUp: port.linkUp,
    configurationChanges: state.configurationChanges
  });
}

function completeState(discoveryKind = 'all') {
  const state = preparedState();
  const tableEntry = state.macAddressTable.find((entry) => entry.mac === targetMac);
  macObservation(state, discoveryKind === 'address' ? [tableEntry] : state.macAddressTable);

  state.interfaces['g0/21'].description = 'Warehouse Scanner Station';
  state.configurationChanges = 1;
  state.saved = true;
  inspectTarget(state);
  return state;
}

test('Mission 4 preparation is idempotent and preserves scanner service', () => {
  const state = createD8SW1();
  const before = { ...state.interfaces['g0/21'] };

  assert.equal(prepareMissionFourScenario(state), true);
  assert.equal(prepareMissionFourScenario(state), false);
  assert.equal(state.interfaces['g0/21'].description, 'Warehouse Drop - Unverified');
  assert.equal(state.interfaces['g0/21'].linkUp, before.linkUp);
  assert.equal(state.interfaces['g0/21'].mode, 'access');
  assert.equal(state.interfaces['g0/21'].accessVlan, '10');
  assert.equal(state.interfaces['g0/21'].voiceVlan, null);
  assert.equal(state.interfaces['g0/21'].shutdown, false);
  assert.equal(state.macAddressTable.find((entry) => entry.mac === targetMac).interface, 'g0/21');
});

test('full and targeted MAC evidence both discover the scanner', () => {
  for (const discoveryKind of ['all', 'address']) {
    const state = completeState(discoveryKind);
    const progress = evaluateMissionFour(state);
    assert.equal(progress.macEvidence, true);
    assert.equal(progress.readyToSubmit, true);
  }
});

test('unrelated or absent MAC evidence does not discover the scanner', () => {
  const state = preparedState();
  macObservation(state, [{
    vlan: '10',
    mac: '0011.2233.4402',
    type: 'DYNAMIC',
    interface: 'g0/2'
  }]);
  state.interfaces['g0/21'].description = 'Warehouse Scanner Station';
  inspectTarget(state);

  assert.equal(evaluateMissionFour(state).macEvidence, false);
  assert.equal(advanceMissionFour(state).type, MISSION_FOUR_EVENTS.BLOCKED);
});

test('configuration alone or an incomplete final state cannot complete Mission 4', () => {
  const state = preparedState();
  state.interfaces['g0/21'].description = 'Warehouse Scanner Station';
  inspectTarget(state);
  assert.equal(evaluateMissionFour(state).macEvidence, false);

  macObservation(state, state.macAddressTable);
  state.interfaces['g0/21'].accessVlan = '15';
  assert.equal(evaluateMissionFour(state).readyToSubmit, false);
  state.interfaces['g0/21'].accessVlan = '10';
  state.interfaces['g0/21'].shutdown = true;
  assert.equal(evaluateMissionFour(state).readyToSubmit, false);
  state.interfaces['g0/21'].shutdown = false;
  state.interfaces['g0/21'].voiceVlan = '20';
  assert.equal(evaluateMissionFour(state).readyToSubmit, false);
});

test('correct final state, evidence, verification, and save completes once', () => {
  const state = completeState();
  const result = advanceMissionFour(state);
  assert.equal(result.type, MISSION_FOUR_EVENTS.COMPLETED);
  assert.deepEqual([state.xp, state.credits], [90, 25]);
  assert.equal(result.evaluation.deductions[0].id, 'preChangeInspection');
  assert.equal(advanceMissionFour(state).type, MISSION_FOUR_EVENTS.ALREADY_COMPLETED);
  assert.deepEqual([state.xp, state.credits], [90, 25]);
});

test('Mission 4 is registered after Mission 3 and requires it', () => {
  assert.equal(getMission('mission-4').definition.requires, 'mission-3');
  assert.equal(getMission('mission-3').definition.id, 'mission-3');
});
