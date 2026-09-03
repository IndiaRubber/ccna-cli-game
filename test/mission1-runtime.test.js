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

test('submitting phase one reveals voice VLAN work and invalidates the save', () => {
  const state = createPhaseOneState();
  const result = advanceMissionOne(state);

  assert.equal(result.type, MISSION_ONE_EVENTS.HIDDEN_OBJECTIVE_REVEALED);
  assert.equal(state.hiddenObjectiveRevealed, true);
  assert.equal(state.ticketSubmitted, true);
  assert.equal(state.saved, false);
  assert.equal(result.progress.readyToSubmit, false);
});

test('the second phase requires voice VLAN 20 and another save', () => {
  const state = createPhaseOneState();
  advanceMissionOne(state);

  state.interfaces['g0/12'].voiceVlan = '20';
  assert.equal(evaluateMissionOne(state).phaseTwoComplete, false);

  state.saved = true;
  const result = advanceMissionOne(state);

  assert.equal(result.type, MISSION_ONE_EVENTS.COMPLETED);
  assert.equal(state.questCompleted, true);
  assert.equal(state.xp, 100);
  assert.equal(state.credits, 25);
});

test('a completed mission cannot award completion repeatedly', () => {
  const state = createPhaseOneState();
  advanceMissionOne(state);
  state.interfaces['g0/12'].voiceVlan = '20';
  state.saved = true;
  advanceMissionOne(state);

  const result = advanceMissionOne(state);

  assert.equal(result.type, MISSION_ONE_EVENTS.ALREADY_COMPLETED);
  assert.equal(state.xp, 100);
  assert.equal(state.credits, 25);
});
