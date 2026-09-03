import test from 'node:test';
import assert from 'node:assert/strict';

const output = [];
let objectiveUpdates = 0;
let persistenceRequests = 0;

globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

globalThis.window = {
  CiscoUI: {
    print: (line = '') => output.push(String(line)),
    showHelp: () => {},
    updateObjectives: () => {
      objectiveUpdates += 1;
    },
    persistProgress: () => {
      persistenceRequests += 1;
    }
  }
};

const { runCommand } = await import('../src/engine/cli.js');
const { GameState, resetGameState } = await import('../src/engine/state.js');

function resetHarness() {
  resetGameState();
  output.length = 0;
  objectiveUpdates = 0;
  persistenceRequests = 0;
}

test('player command flow configures and saves the Office 4B port', () => {
  resetHarness();

  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('switchport mode access');
  runCommand('switchport access vlan 10');
  runCommand('switchport voice vlan 20');
  runCommand('description Office 4B Workstation and Phone');
  runCommand('end');
  runCommand('write memory');

  const officePort = GameState.interfaces['g0/12'];

  assert.equal(GameState.mode, 'privileged');
  assert.equal(officePort.mode, 'access');
  assert.equal(officePort.accessVlan, '10');
  assert.equal(officePort.voiceVlan, '20');
  assert.equal(officePort.description, 'Office 4B Workstation and Phone');
  assert.equal(GameState.saved, true);
  assert.equal(persistenceRequests, 1);
  assert.ok(objectiveUpdates >= 5);
  assert.ok(output.includes('Building configuration...'));
  assert.ok(output.includes('[OK]'));
});

test('shorthand interface names work but nonexistent ports are rejected', () => {
  resetHarness();

  runCommand('en');
  runCommand('conf t');
  runCommand('int g0/12');

  assert.equal(GameState.mode, 'interface');
  assert.equal(GameState.currentInterface, 'g0/12');

  runCommand('exit');
  runCommand('interface gi1/0/99');

  assert.equal(GameState.mode, 'global');
  assert.ok(output.some((line) => line.includes('Invalid interface type and number')));
  assert.equal(Object.hasOwn(GameState.interfaces, 'g0/99'), false);
});

test('privileged show commands are rejected from user EXEC mode', () => {
  resetHarness();

  runCommand('show interfaces status');

  assert.ok(output.includes('% Command not available in this mode.'));
});

test('configuration changes made after saving require another save', () => {
  resetHarness();

  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('description Office 4B Workstation');
  runCommand('end');
  runCommand('write memory');

  assert.equal(GameState.saved, true);
  assert.equal(persistenceRequests, 1);

  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('switchport access vlan 10');

  assert.equal(GameState.saved, false);
  assert.equal(persistenceRequests, 1);

  runCommand('end');
  runCommand('write memory');

  assert.equal(GameState.saved, true);
  assert.equal(persistenceRequests, 2);
});
