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

const {
  formatInvalidCommand,
  getInvalidCommandPosition,
  runCommand
} = await import('../src/engine/cli.js');
const { GameState, resetGameState } = await import('../src/engine/state.js');
const { advanceMissionTwo, evaluateMissionTwo } = await import(
  '../src/quests/mission2/mission2Runtime.js'
);
const { getAutocomplete } = await import('../src/ui/autocomplete.js');

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

test('show interfaces status records the switch observation used by Mission 0', () => {
  resetHarness();

  runCommand('enable');
  runCommand('show interfaces status');

  assert.equal(GameState.observations.length, 1);
  assert.equal(GameState.observations[0].type, 'interfaces-status');
  assert.equal(
    GameState.observations[0].interfaces['g0/12'].description,
    'Office 4B New Hire - Pending Setup'
  );
  assert.equal(GameState.observations[0].interfaces['g0/12'].linkUp, true);
  assert.equal(GameState.configurationChanges, 0);
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

test('interface running-config inspection records the observed network state', () => {
  resetHarness();

  runCommand('enable');
  runCommand('show running-config interface gi1/0/12');

  assert.ok(output.includes('interface Gi1/0/12'));
  assert.ok(output.includes(' description Office 4B New Hire - Pending Setup'));
  assert.equal(GameState.observations.length, 1);
  assert.deepEqual(GameState.observations[0], {
    type: 'interface-config',
    interfaceName: 'g0/12',
    mode: null,
    accessVlan: '1',
    voiceVlan: null,
    shutdown: false,
    configurationChanges: 0
  });
});

test('premature voice VLAN configuration can be removed with Cisco no syntax', () => {
  resetHarness();

  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('switchport voice vlan 20');
  runCommand('no switchport voice vlan');

  assert.equal(GameState.interfaces['g0/12'].voiceVlan, null);
  assert.ok(output.includes('Voice VLAN removed from Gi1/0/12.'));
});

test('interface running-config rejects invalid interfaces', () => {
  resetHarness();

  runCommand('enable');
  runCommand('show running-config interface gi1/0/99');

  assert.ok(output.some((line) => line.includes('Invalid interface type and number')));
  assert.equal(GameState.observations.length, 0);
});

test('contextual question-mark help exposes only supported switchport branches', () => {
  resetHarness();

  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('switchport ?');

  assert.ok(output.some((line) => line.includes('access')));
  assert.ok(output.some((line) => line.includes('mode')));
  assert.ok(output.some((line) => line.includes('voice')));

  output.length = 0;
  runCommand('switchport voice ?');
  assert.deepEqual(output.filter(Boolean), ['  vlan    Set the voice VLAN']);

  output.length = 0;
  runCommand('sw vo vl ?');
  assert.deepEqual(output.filter(Boolean), ['  <1-4094>  Voice VLAN ID']);
});

test('Cisco-style abbreviations cover every supported command family', () => {
  resetHarness();

  runCommand('e');
  runCommand('sh int');
  assert.ok(output.some((line) => line.startsWith('Port')));

  output.length = 0;
  runCommand('sh vl');
  assert.ok(output.some((line) => line.startsWith('VLAN Name')));

  output.length = 0;
  runCommand('sh ru int gi1/0/12');
  assert.ok(output.includes('interface Gi1/0/12'));

  runCommand('c t');
  runCommand('i gi1/0/12');
  runCommand('sw m a');
  runCommand('sw a v 10');
  runCommand('sw v v 20');
  runCommand('des Office 4B Abbreviated Commands');
  runCommand('sh');
  runCommand('no sh');
  runCommand('end');
  runCommand('w');

  const officePort = GameState.interfaces['g0/12'];
  assert.equal(officePort.mode, 'access');
  assert.equal(officePort.accessVlan, '10');
  assert.equal(officePort.voiceVlan, '20');
  assert.equal(officePort.description, 'Office 4B Abbreviated Commands');
  assert.equal(officePort.shutdown, false);
  assert.equal(GameState.saved, true);

  runCommand('c t');
  runCommand('v 30');
  runCommand('n GUEST');
  runCommand('ex');
  runCommand('h D8SW1');
  runCommand('end');
  runCommand('cop r s');

  assert.equal(GameState.vlans['30'].name, 'GUEST');
  assert.equal(GameState.hostname, 'D8SW1');
  assert.equal(GameState.saved, true);
});

test('Mission 2 can be investigated, repaired, verified, and saved through the CLI', () => {
  resetHarness();
  const officePort = GameState.interfaces['g0/12'];
  officePort.mode = 'access';
  officePort.accessVlan = '10';
  officePort.description = 'Office 4B Workstation';
  GameState.currentQuestId = 'mission-2';
  GameState.xp = 100;
  GameState.credits = 25;
  GameState.saved = true;

  runCommand('enable');
  runCommand('show running-config interface gi1/0/12');
  assert.equal(evaluateMissionTwo(GameState).investigated, true);

  runCommand('configure terminal');
  runCommand('interface gi1/0/12');
  runCommand('switchport voice vlan 20');
  assert.equal(evaluateMissionTwo(GameState).phoneOperational, true);
  assert.equal(evaluateMissionTwo(GameState).verified, false);

  runCommand('do show running-config interface gi1/0/12');
  assert.equal(evaluateMissionTwo(GameState).verified, true);
  assert.equal(evaluateMissionTwo(GameState).readyToSubmit, false);

  runCommand('end');
  runCommand('write memory');
  assert.equal(evaluateMissionTwo(GameState).readyToSubmit, true);
  assert.equal(advanceMissionTwo(GameState).type, 'completed');
});

test('invalid command caret points at the first unrecognized command segment', () => {
  assert.equal(getInvalidCommandPosition('show interfaces nonsense', 'privileged'), 16);
  assert.equal(getInvalidCommandPosition('switchport mystery vlan 20', 'interface'), 11);
  assert.equal(getInvalidCommandPosition('totally-wrong command', 'privileged'), 0);
  assert.deepEqual(formatInvalidCommand('show interfaces nonsense', 'privileged'), {
    position: 16,
    caret: '                ^'
  });
});

test('tab completion resolves unique Cisco-style command prefixes', () => {
  assert.equal(getAutocomplete('sh int', 'privileged'), 'show interfaces status');
  assert.equal(getAutocomplete('sh ru int', 'privileged'), 'show running-config interface');
  assert.equal(getAutocomplete('conf t', 'privileged'), 'configure terminal');
  assert.equal(getAutocomplete('sw vo', 'interface'), 'switchport voice vlan');
  assert.equal(getAutocomplete('sw', 'interface'), null);
  assert.equal(getAutocomplete('show', 'privileged'), null);
});
