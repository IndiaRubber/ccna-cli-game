import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import {
  MISSION_TWO_EVENTS,
  advanceMissionTwo,
  evaluateMissionTwo
} from '../src/quests/mission2/mission2Runtime.js';

function createMissionTwoState() {
  const state = createD8SW1();
  const port = state.interfaces['g0/12'];

  port.mode = 'access';
  port.accessVlan = '10';
  port.description = 'Office 4B Workstation';
  state.currentQuestId = 'mission-2';
  state.xp = 100;
  state.credits = 25;
  state.saved = true;

  return state;
}

function inspect(state) {
  const port = state.interfaces['g0/12'];
  state.observations.push({
    type: 'interface-config',
    interfaceName: 'g0/12',
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    configurationChanges: state.configurationChanges ?? 0
  });
}

test('Mission 2 recognizes a working repair even without pre-change investigation', () => {
  const state = createMissionTwoState();
  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges = 1;
  state.saved = false;
  inspect(state);

  const progress = evaluateMissionTwo(state);

  assert.equal(progress.phoneOperational, true);
  assert.equal(progress.investigated, false);
  assert.equal(progress.verified, true);
  assert.equal(progress.readyToSubmit, false);
  assert.equal(progress.evaluationSignals.preChangeInspection, false);
});

test('Mission 2 accepts a pre-remediation interface-status inspection as investigation', () => {
  const state = createMissionTwoState();
  state.observations.push({
    type: 'interfaces-status',
    interfaces: {
      'g0/12': {
        linkUp: true,
        shutdown: false,
        accessVlan: '10',
        voiceVlan: null
      }
    }
  });

  assert.equal(evaluateMissionTwo(state).investigated, true);
  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges = 1;
  assert.equal(evaluateMissionTwo(state).objectiveStates['correct-switchport-configuration'], true);
});

test('Mission 2 distinguishes inspection before repair from verification after it', () => {
  const state = createMissionTwoState();
  inspect(state);

  let progress = evaluateMissionTwo(state);
  assert.equal(progress.objectiveStates['investigate-phone-connectivity'], true);
  assert.equal(progress.objectiveStates['correct-switchport-configuration'], false);

  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges = 1;
  state.saved = false;
  progress = evaluateMissionTwo(state);
  assert.equal(progress.objectiveStates['correct-switchport-configuration'], true);
  assert.equal(progress.objectiveStates['verify-phone-operational'], false);

  inspect(state);
  progress = evaluateMissionTwo(state);
  assert.equal(progress.objectiveStates['verify-phone-operational'], true);
  assert.equal(progress.readyToSubmit, false);

  state.configurationChanges = 2;
  assert.equal(evaluateMissionTwo(state).objectiveStates['verify-phone-operational'], false);

  state.saved = true;
  inspect(state);
  assert.equal(evaluateMissionTwo(state).readyToSubmit, true);
});

test('Mission 2 derives phone operation from the complete interface state', () => {
  const state = createMissionTwoState();
  inspect(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges = 1;

  for (const property of ['mode', 'accessVlan', 'shutdown', 'linkUp']) {
    const original = state.interfaces['g0/12'][property];
    state.interfaces['g0/12'][property] = property === 'shutdown' ? true : null;
    assert.equal(evaluateMissionTwo(state).phoneOperational, false);
    state.interfaces['g0/12'][property] = original;
  }
});

test('Mission 2 completion requires working saved state and awards once', () => {
  const state = createMissionTwoState();
  inspect(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  state.configurationChanges = 1;
  state.saved = false;
  inspect(state);

  assert.equal(advanceMissionTwo(state).type, MISSION_TWO_EVENTS.BLOCKED);

  state.saved = true;
  assert.equal(advanceMissionTwo(state).type, MISSION_TWO_EVENTS.COMPLETED);
  assert.equal(state.xp, 200);
  assert.equal(state.credits, 50);
  assert.equal(advanceMissionTwo(state).type, MISSION_TWO_EVENTS.ALREADY_COMPLETED);
  assert.equal(state.xp, 200);
  assert.equal(state.credits, 50);
});
