import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import { getMission } from '../src/quests/missionRegistry.js';
import {
  MISSION_FIVE_EVENTS,
  advanceMissionFive,
  evaluateMissionFive,
  prepareMissionFiveScenario
} from '../src/quests/mission5/mission5Runtime.js';

const rearInterface = 'g0/20';
const frontInterface = 'g0/19';

function preparedState() {
  const state = createD8SW1();
  state.currentQuestId = 'mission-5';
  prepareMissionFiveScenario(state);
  return state;
}

function environmentObservation(state) {
  state.observations.push({
    type: 'environment',
    status: { ...state.environment }
  });
}

function powerObservation(state, interfaceName = rearInterface) {
  const entry = state.inlinePower.find((item) => item.interface === interfaceName);
  state.observations.push({
    type: 'inline-power',
    query: { kind: 'interface', value: interfaceName },
    entries: [{ ...entry }],
    configurationChanges: state.configurationChanges
  });
}

function interfaceObservation(state) {
  const port = state.interfaces[rearInterface];
  const power = state.inlinePower.find((entry) => entry.interface === rearInterface);
  state.observations.push({
    type: 'interface-config',
    interfaceName: rearInterface,
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    linkUp: port.linkUp,
    powerInline: power.admin,
    powerOper: power.oper,
    powerWatts: power.powerWatts,
    configurationChanges: state.configurationChanges
  });
}

function completeState({ diagnosis = 'power', verification = true } = {}) {
  const state = preparedState();
  environmentObservation(state);

  if (diagnosis === 'power') powerObservation(state);
  if (diagnosis === 'config') interfaceObservation(state);

  const power = state.inlinePower.find((entry) => entry.interface === rearInterface);
  power.admin = 'auto';
  power.oper = 'on';
  power.powerWatts = 7.0;
  state.interfaces[rearInterface].linkUp = true;
  state.configurationChanges = 1;

  if (verification) powerObservation(state);
  state.saved = true;
  return state;
}

test('Mission 5 preparation is idempotent and disables only rear-camera PoE', () => {
  const state = createD8SW1();
  const originalRear = { ...state.interfaces[rearInterface] };
  const originalFront = { ...state.interfaces[frontInterface] };

  assert.equal(prepareMissionFiveScenario(state), true);
  assert.equal(prepareMissionFiveScenario(state), false);

  assert.equal(state.interfaces[rearInterface].description, originalRear.description);
  assert.equal(state.interfaces[rearInterface].mode, 'access');
  assert.equal(state.interfaces[rearInterface].accessVlan, '10');
  assert.equal(state.interfaces[rearInterface].voiceVlan, null);
  assert.equal(state.interfaces[rearInterface].shutdown, false);
  assert.equal(state.interfaces[rearInterface].linkUp, false);
  assert.deepEqual(state.interfaces[frontInterface], originalFront);
  assert.equal(state.environment.overall, 'OK');
  assert.equal(state.inlinePower.find((entry) => entry.interface === rearInterface).admin, 'never');
});

test('failed full-table or targeted PoE evidence diagnoses the fault', () => {
  for (const queryKind of ['all', 'interface']) {
    const state = preparedState();
    environmentObservation(state);
    const failed = state.inlinePower.find((entry) => entry.interface === rearInterface);
    state.observations.push({
      type: 'inline-power',
      query: { kind: queryKind, value: queryKind === 'all' ? null : rearInterface },
      entries: queryKind === 'all'
        ? state.inlinePower.map((entry) => ({ ...entry }))
        : [{ ...failed }],
      configurationChanges: state.configurationChanges
    });
    assert.equal(evaluateMissionFive(state).identifiedFault, true);
  }
});

test('pre-repair interface inspection can diagnose without a PoE lookup', () => {
  const state = preparedState();
  environmentObservation(state);
  interfaceObservation(state);

  assert.equal(evaluateMissionFive(state).identifiedFault, true);
  assert.equal(evaluateMissionFive(state).environmentHealthy, true);
});

test('repairing before PoE inspection does not trap the player', () => {
  const state = preparedState();
  environmentObservation(state);
  interfaceObservation(state);
  const power = state.inlinePower.find((entry) => entry.interface === rearInterface);
  power.admin = 'auto';
  power.oper = 'on';
  power.powerWatts = 7;
  state.interfaces[rearInterface].linkUp = true;
  state.configurationChanges = 1;
  powerObservation(state);
  state.saved = true;

  assert.equal(evaluateMissionFive(state).readyToSubmit, true);
});

test('missing, unrelated, and unhealthy evidence blocks completion', () => {
  const state = completeState();
  state.observations = state.observations.filter((observation) => observation.type !== 'environment');
  assert.equal(evaluateMissionFive(state).environmentHealthy, false);
  assert.equal(advanceMissionFive(state).type, MISSION_FIVE_EVENTS.BLOCKED);

  const unrelated = preparedState();
  environmentObservation(unrelated);
  unrelated.observations.push({
    type: 'inline-power',
    query: { kind: 'interface', value: 'g0/19' },
    entries: [{ ...unrelated.inlinePower.find((entry) => entry.interface === frontInterface) }],
    configurationChanges: 0
  });
  assert.equal(evaluateMissionFive(unrelated).identifiedFault, false);
});

test('wrong VLAN, shutdown, voice VLAN, or never state blocks restored service', () => {
  for (const mutate of [
    (state) => { state.interfaces[rearInterface].accessVlan = '15'; },
    (state) => { state.interfaces[rearInterface].shutdown = true; },
    (state) => { state.interfaces[rearInterface].voiceVlan = '20'; },
    (state) => {
      const power = state.inlinePower.find((entry) => entry.interface === rearInterface);
      power.admin = 'never';
      power.oper = 'off';
      power.powerWatts = 0;
      state.interfaces[rearInterface].linkUp = false;
    }
  ]) {
    const state = completeState();
    mutate(state);
    assert.equal(evaluateMissionFive(state).restored, false);
    assert.equal(evaluateMissionFive(state).readyToSubmit, false);
  }
});

test('save and current post-repair PoE verification are required', () => {
  const state = completeState({ verification: false });
  assert.equal(evaluateMissionFive(state).verified, false);
  assert.equal(evaluateMissionFive(state).readyToSubmit, false);

  const stale = completeState();
  stale.configurationChanges = 2;
  assert.equal(evaluateMissionFive(stale).verified, false);

  const unsaved = completeState();
  unsaved.saved = false;
  assert.equal(evaluateMissionFive(unsaved).readyToSubmit, false);
});

test('correct repair completes Mission 5 and rewards only once', () => {
  const state = completeState({ diagnosis: 'config' });
  assert.equal(advanceMissionFive(state).type, MISSION_FIVE_EVENTS.COMPLETED);
  assert.deepEqual([state.xp, state.credits], [100, 25]);
  assert.equal(advanceMissionFive(state).type, MISSION_FIVE_EVENTS.ALREADY_COMPLETED);
  assert.deepEqual([state.xp, state.credits], [100, 25]);
});

test('Mission 5 is registered after Mission 4 and requires it', () => {
  const mission = getMission('mission-5');
  assert.equal(mission.definition.requires, 'mission-4');
});
