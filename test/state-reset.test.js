import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GameState,
  createGameStateSnapshot,
  resetGameState,
  restoreGameState
} from '../src/engine/state.js';

test('resetGameState restores a configured mission switch in place', () => {
  const originalReference = GameState;

  GameState.mode = 'interface';
  GameState.hostname = 'PLAYER-SWITCH';
  GameState.currentInterface = 'g0/12';
  GameState.interfaces['g0/12'].mode = 'access';
  GameState.interfaces['g0/12'].accessVlan = '10';
  GameState.interfaces['g0/12'].voiceVlan = '20';
  GameState.interfaces['g0/12'].description = 'Completed Office 4B Port';
  GameState.saved = true;
  GameState.hiddenObjectiveRevealed = true;
  GameState.ticketSubmitted = true;
  GameState.questCompleted = true;
  GameState.xp = 100;
  GameState.credits = 25;

  const resetState = resetGameState();

  assert.equal(resetState, originalReference);
  assert.equal(GameState, originalReference);
  assert.equal(GameState.mode, 'user');
  assert.equal(GameState.hostname, 'D8SW1');
  assert.equal(GameState.currentInterface, null);
  assert.equal(GameState.interfaces['g0/12'].mode, null);
  assert.equal(GameState.interfaces['g0/12'].accessVlan, '1');
  assert.equal(GameState.interfaces['g0/12'].voiceVlan, null);
  assert.equal(GameState.interfaces['g0/12'].description, 'Office 4B New Hire - Pending Setup');
  assert.equal(GameState.saved, false);
  assert.equal(GameState.configurationChanges, 0);
  assert.ok(GameState.macAddressTable.length >= 15);
  assert.equal(GameState.macAddressTable[0].interface, 'g0/2');
  assert.equal(GameState.questCompleted, false);
  assert.equal(GameState.xp, 0);
  assert.equal('hiddenObjectiveRevealed' in GameState, false);
  assert.equal('ticketSubmitted' in GameState, false);
  assert.equal('credits' in GameState, false);
});

test('a saved device and mission snapshot can be restored', () => {
  resetGameState();

  GameState.mode = 'privileged';
  GameState.interfaces['g0/12'].mode = 'access';
  GameState.interfaces['g0/12'].accessVlan = '10';
  GameState.interfaces['g0/12'].voiceVlan = '20';
  GameState.saved = true;
  GameState.hiddenObjectiveRevealed = true;
  GameState.ticketSubmitted = true;
  GameState.rank = 'Helpdesk Refugee';
  GameState.mission4ScenarioPrepared = true;
  GameState.currentQuestId = 'mission-5';
  GameState.mission5ScenarioPrepared = true;

  const snapshot = createGameStateSnapshot();

  GameState.interfaces['g0/12'].accessVlan = '99';
  GameState.hiddenObjectiveRevealed = false;
  GameState.rank = 'Corrupted';

  restoreGameState(snapshot);

  assert.equal(GameState.mode, 'privileged');
  assert.equal(GameState.interfaces['g0/12'].mode, 'access');
  assert.equal(GameState.interfaces['g0/12'].accessVlan, '10');
  assert.equal(GameState.interfaces['g0/12'].voiceVlan, '20');
  assert.equal(GameState.saved, true);
  assert.equal(GameState.hiddenObjectiveRevealed, true);
  assert.equal(GameState.ticketSubmitted, true);
  assert.equal(GameState.rank, 'Helpdesk Refugee');
  assert.equal(GameState.currentQuestId, 'mission-5');
  assert.equal(GameState.mission4ScenarioPrepared, true);
  assert.equal(GameState.mission5ScenarioPrepared, true);
});

test('restoreGameState keeps new factory fields when loading an older snapshot', () => {
  const olderSnapshot = {
    hostname: 'LEGACY-SW',
    interfaces: {
      'g0/12': {
        description: 'Saved by an older release',
        accessVlan: '10'
      }
    }
  };

  restoreGameState(olderSnapshot);

  assert.equal(GameState.hostname, 'LEGACY-SW');
  assert.equal(GameState.interfaces['g0/12'].description, 'Saved by an older release');
  assert.equal(GameState.interfaces['g0/12'].accessVlan, '10');
  assert.equal(GameState.interfaces['g0/12'].displayName, 'Gi1/0/12');
  assert.equal(GameState.interfaces['g0/12'].mediaType, '10/100/1000BaseTX');
  assert.equal(GameState.interfaces['g0/13'].displayName, 'Gi1/0/13');
  assert.ok(GameState.macAddressTable.length >= 15);
  assert.equal(GameState.macAddressTable[0].mac, '0011.2233.4402');
});
