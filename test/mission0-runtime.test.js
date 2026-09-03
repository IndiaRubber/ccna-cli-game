import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import {
  MISSION_ZERO_EVENTS,
  advanceMissionZero,
  evaluateMissionZero
} from '../src/quests/mission0/mission0Runtime.js';

function observeInterfaces(state) {
  state.observations.push({
    type: 'interfaces-status',
    interfaces: {
      'g0/12': {
        description: state.interfaces['g0/12'].description,
        linkUp: state.interfaces['g0/12'].linkUp,
        shutdown: state.interfaces['g0/12'].shutdown,
        mode: state.interfaces['g0/12'].mode,
        accessVlan: state.interfaces['g0/12'].accessVlan
      }
    }
  });
}

test('Mission 0 starts with the factory Office 4B connection visible but unconfigured', () => {
  const state = createD8SW1();
  state.currentQuestId = 'mission-0';

  const progress = evaluateMissionZero(state);

  assert.equal(state.interfaces['g0/12'].linkUp, true);
  assert.equal(state.interfaces['g0/12'].mode, null);
  assert.equal(state.interfaces['g0/12'].accessVlan, '1');
  assert.equal(progress.readyToSubmit, false);
});

test('Mission 0 completes from an interface-status observation without configuration changes', () => {
  const state = createD8SW1();
  state.currentQuestId = 'mission-0';
  observeInterfaces(state);

  const progress = evaluateMissionZero(state);
  assert.equal(progress.identified, true);
  assert.equal(progress.readyToSubmit, true);

  const result = advanceMissionZero(state);
  assert.equal(result.type, MISSION_ZERO_EVENTS.COMPLETED);
  assert.equal(state.questCompleted, true);
  assert.equal(state.xp, 50);
  assert.equal(state.credits, 10);
  assert.equal(state.interfaces['g0/12'].mode, null);
});

test('Mission 0 cannot complete after a configuration mutation', () => {
  const state = createD8SW1();
  state.currentQuestId = 'mission-0';
  observeInterfaces(state);
  state.configurationChanges = 1;

  const progress = evaluateMissionZero(state);
  assert.equal(progress.identified, true);
  assert.equal(progress.unchanged, false);
  assert.equal(progress.readyToSubmit, false);
  assert.equal(advanceMissionZero(state).type, MISSION_ZERO_EVENTS.BLOCKED);
});

test('Mission 0 requires the Office 4B connected description, not just any link', () => {
  const state = createD8SW1();
  state.currentQuestId = 'mission-0';
  observeInterfaces(state);
  state.observations[0].interfaces['g0/12'].description = 'Unlabeled Workstation';

  assert.equal(evaluateMissionZero(state).identified, false);
  assert.equal(advanceMissionZero(state).type, MISSION_ZERO_EVENTS.BLOCKED);
});
