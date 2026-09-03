import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import {
  MISSION_ONE_EVENTS,
  advanceMissionOne,
  evaluateMissionOne
} from '../src/quests/mission1/mission1Runtime.js';

function createPhaseOneState() {
  const state = createD8SW1();
  const officePort = state.interfaces['g0/12'];

  state.currentInterface = 'g0/12';
  officePort.mode = 'access';
  officePort.accessVlan = '10';
  officePort.description = 'Office 4B Workstation and Phone';
  state.saved = true;

  return state;
}

test('the factory port description does not satisfy the update objective', () => {
  const progress = evaluateMissionOne(createD8SW1());

  assert.equal(progress.objectiveStates['g012-description'], false);
  assert.equal(progress.phaseOneComplete, false);
  assert.equal(progress.readyToSubmit, false);
});

test('completing the workstation configuration finishes Mission 1', () => {
  const state = createPhaseOneState();
  const result = advanceMissionOne(state);

  assert.equal(result.type, MISSION_ONE_EVENTS.COMPLETED);
  assert.equal(state.questCompleted, true);
  assert.equal(state.interfaces['g0/12'].voiceVlan, null);
  assert.equal(state.xp, 100);
  assert.equal(state.credits, 25);
});

test('a completed mission cannot award completion repeatedly', () => {
  const state = createPhaseOneState();
  advanceMissionOne(state);

  const result = advanceMissionOne(state);

  assert.equal(result.type, MISSION_ONE_EVENTS.ALREADY_COMPLETED);
  assert.equal(state.xp, 100);
  assert.equal(state.credits, 25);
});

test('Mission 1 does not complete with an out-of-scope voice VLAN', () => {
  const state = createPhaseOneState();
  state.interfaces['g0/12'].voiceVlan = '20';

  assert.equal(evaluateMissionOne(state).readyToSubmit, false);
  assert.equal(advanceMissionOne(state).type, MISSION_ONE_EVENTS.BLOCKED);

  state.interfaces['g0/12'].voiceVlan = null;
  assert.equal(advanceMissionOne(state).type, MISSION_ONE_EVENTS.COMPLETED);
});
