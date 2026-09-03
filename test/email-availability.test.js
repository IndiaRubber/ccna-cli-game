import test from 'node:test';
import assert from 'node:assert/strict';

import { emails } from '../src/data/emails.js';
import {
  archiveMissionEmails,
  getNextActionableOffice4bTicket,
  getAvailableEmails,
  isEmailAvailable
} from '../src/systems/emailSystem.js';

const debrief = emails.find((email) => email.id === 'mission1-debrief');
const missionZeroTicket = emails.find((email) => email.id === 'ticket-office4b-observation');
const missionZeroDebrief = emails.find((email) => email.id === 'mission0-debrief');
const missionOneTicket = emails.find((email) => email.id === 'ticket-office4b');
const missionTwoTicket = emails.find((email) => email.id === 'ticket-office4b-phone');
const missionTwoDebrief = emails.find((email) => email.id === 'mission2-debrief');
const missionThreeTicket = emails.find((email) => email.id === 'ticket-relocated-printer');
const missionThreeDebrief = emails.find((email) => email.id === 'mission3-debrief');

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

test('Mission 0 is available first and unlocks the Mission 1 ticket', () => {
  assert.equal(isEmailAvailable(missionZeroTicket, {
    currentQuestId: 'mission-0',
    questCompleted: false,
    completedQuests: []
  }), true);
  assert.equal(isEmailAvailable(missionOneTicket, {
    currentQuestId: 'mission-0',
    questCompleted: false,
    completedQuests: []
  }), false);

  const afterMissionZero = {
    currentQuestId: 'mission-0',
    questCompleted: true,
    completedQuests: ['mission-0']
  };

  assert.equal(isEmailAvailable(missionZeroDebrief, afterMissionZero), true);
  assert.equal(isEmailAvailable(missionOneTicket, afterMissionZero), true);
  assert.equal(missionZeroTicket.notebookEntry, undefined);
  assert.ok(missionZeroDebrief.notebookEntry);
});

test('the Office 4B map action advances to the next actionable ticket', () => {
  assert.equal(getNextActionableOffice4bTicket({
    currentQuestId: 'mission-0',
    questCompleted: true,
    completedQuests: ['mission-0']
  }).id, 'ticket-office4b');

  assert.equal(getNextActionableOffice4bTicket({
    currentQuestId: 'mission-1',
    questCompleted: true,
    completedQuests: ['mission-0', 'mission-1']
  }).id, 'ticket-office4b-phone');

  assert.equal(getNextActionableOffice4bTicket({
    currentQuestId: 'mission-2',
    questCompleted: true,
    completedQuests: ['mission-0', 'mission-1', 'mission-2']
  }), null);
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

test('Mission 3 ticket follows Mission 2 and its debrief waits for Mission 3', () => {
  assert.equal(isEmailAvailable(missionThreeTicket, {
    currentQuestId: 'mission-2',
    questCompleted: true,
    completedQuests: ['mission-0', 'mission-1', 'mission-2']
  }), true);
  assert.equal(isEmailAvailable(missionThreeDebrief, {
    currentQuestId: 'mission-3',
    questCompleted: false,
    completedQuests: ['mission-0', 'mission-1', 'mission-2']
  }), false);
});

test('completing a mission archives its ticket but leaves the debrief available', () => {
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
  globalThis.document = { getElementById: () => null };

  archiveMissionEmails('mission-3');

  const archived = JSON.parse(values.get('ciscoCliEmailState')).archivedEmailIds;
  assert.ok(archived.includes('ticket-relocated-printer'));
  assert.equal(archived.includes('mission3-debrief'), false);
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
