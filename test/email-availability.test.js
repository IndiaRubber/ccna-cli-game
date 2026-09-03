import test from 'node:test';
import assert from 'node:assert/strict';

import { emails } from '../src/data/emails.js';
import {
  getAvailableEmails,
  isEmailAvailable
} from '../src/systems/emailSystem.js';

const debrief = emails.find((email) => email.id === 'mission1-debrief');
const missionTwoTicket = emails.find((email) => email.id === 'ticket-office4b-phone');
const missionTwoDebrief = emails.find((email) => email.id === 'mission2-debrief');

test('post-mission email remains hidden before Mission 1 is complete', () => {
  const state = {
    currentQuestId: 'mission-1',
    questCompleted: false,
    completedQuests: []
  };

  assert.equal(isEmailAvailable(debrief, state), false);
  assert.equal(
    getAvailableEmails(state).some((email) => email.id === debrief.id),
    false
  );
});

test('Mission 2 ticket follows Mission 1 and its debrief waits for Mission 2', () => {
  const afterMissionOne = {
    currentQuestId: 'mission-1',
    questCompleted: true,
    completedQuests: ['mission-1']
  };

  assert.equal(isEmailAvailable(missionTwoTicket, afterMissionOne), true);
  assert.equal(isEmailAvailable(missionTwoDebrief, afterMissionOne), false);

  assert.equal(isEmailAvailable(missionTwoDebrief, {
    currentQuestId: 'mission-2',
    questCompleted: true,
    completedQuests: ['mission-1']
  }), true);
});

test('post-mission email unlocks from live or historical completion state', () => {
  assert.equal(isEmailAvailable(debrief, {
    currentQuestId: 'mission-1',
    questCompleted: true,
    completedQuests: []
  }), true);

  assert.equal(isEmailAvailable(debrief, {
    currentQuestId: 'mission-2',
    questCompleted: false,
    completedQuests: ['mission-1']
  }), true);
});
