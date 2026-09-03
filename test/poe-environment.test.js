import test from 'node:test';
import assert from 'node:assert/strict';

const output = [];
let persistenceRequests = 0;

globalThis.document = {
  getElementById: () => null,
  querySelectorAll: () => []
};

globalThis.window = {
  CiscoUI: {
    print: (line = '') => output.push(String(line)),
    updateObjectives: () => {},
    persistProgress: () => {
      persistenceRequests += 1;
    }
  }
};

const { getInvalidCommandPosition, runCommand } = await import('../src/engine/cli.js');
const { getAutocomplete } = await import('../src/ui/autocomplete.js');
const { GameState, resetGameState, restoreGameState } = await import('../src/engine/state.js');

function resetHarness() {
  resetGameState();
  output.length = 0;
  persistenceRequests = 0;
}

test('factory rear camera is powered and operational', () => {
  resetHarness();
  const camera = GameState.interfaces['g0/20'];
  const power = GameState.inlinePower.find((entry) => entry.interface === 'g0/20');

  assert.equal(camera.linkUp, true);
  assert.equal(power.admin, 'auto');
  assert.equal(power.oper, 'on');
  assert.equal(power.powerWatts, 7.0);
  assert.equal(power.requiredForLink, true);
});

test('show power inline displays known devices and supports targeted lookup', () => {
  resetHarness();
  runCommand('enable');
  runCommand('show power inline');

  assert.ok(output.some((line) => line.includes('Gi1/0/8') && line.includes('AP-D8-01')));
  assert.ok(output.some((line) => line.includes('Gi1/0/20') && line.includes('Security Camera Rear Door')));
  assert.equal(GameState.observations[0].type, 'inline-power');
  assert.equal(GameState.observations[0].query.kind, 'all');

  output.length = 0;
  runCommand('show power inline interface gi1/0/20');
  assert.ok(output.some((line) => line.includes('Gi1/0/20')));
  assert.equal(GameState.observations[1].query.value, 'g0/20');
  assert.equal(GameState.observations[1].entries.length, 1);
});

test('interface status observations include modeled inline-power state', () => {
  resetHarness();
  runCommand('enable');
  runCommand('show interfaces status');

  assert.deepEqual(GameState.observations[0].interfaces['g0/20'], {
    description: 'Security Camera Rear Door',
    linkUp: true,
    shutdown: false,
    mode: 'access',
    accessVlan: '10',
    voiceVlan: null,
    powerInline: 'auto',
    powerOper: 'on',
    powerWatts: 7
  });
});

test('short targeted power syntax and invalid interfaces behave cleanly', () => {
  resetHarness();
  runCommand('enable');
  runCommand('show pow in g1/0/20');
  assert.equal(GameState.observations[0].entries[0].interface, 'g0/20');

  runCommand('show power inline gi1/0/99');
  assert.ok(output.some((line) => line.includes('Invalid interface type and number')));
  assert.equal(GameState.observations.length, 1);
});

test('inline power observations are snapshots', () => {
  resetHarness();
  runCommand('enable');
  runCommand('show power inline interface gi1/0/20');
  const observed = GameState.observations[0].entries[0];

  GameState.inlinePower.find((entry) => entry.interface === 'g0/20').admin = 'never';
  assert.equal(observed.admin, 'auto');
});

test('power inline never disables a camera and auto restores it', () => {
  resetHarness();
  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/20');
  runCommand('power inline never');

  const camera = GameState.interfaces['g0/20'];
  const power = GameState.inlinePower.find((entry) => entry.interface === 'g0/20');
  assert.equal(power.admin, 'never');
  assert.equal(power.oper, 'off');
  assert.equal(power.powerWatts, 0);
  assert.equal(camera.linkUp, false);
  assert.equal(GameState.saved, false);
  assert.equal(GameState.configurationChanges, 1);

  runCommand('power inline auto');
  assert.equal(power.admin, 'auto');
  assert.equal(power.oper, 'on');
  assert.equal(power.powerWatts, 7.0);
  assert.equal(camera.linkUp, true);
  assert.equal(GameState.configurationChanges, 2);
});

test('running config and interface observations include non-default power state', () => {
  resetHarness();
  runCommand('enable');
  runCommand('configure terminal');
  runCommand('interface gi1/0/20');
  runCommand('power inline never');
  runCommand('end');
  runCommand('show running-config interface gi1/0/20');

  assert.ok(output.includes(' power inline never'));
  const observation = GameState.observations[0];
  assert.equal(observation.powerInline, 'never');
  assert.equal(observation.powerOper, 'off');
  assert.equal(observation.powerWatts, 0);
});

test('show environment and env create healthy snapshots', () => {
  resetHarness();
  runCommand('enable');
  runCommand('show env');
  assert.ok(output.includes('SYSTEM TEMPERATURE is OK'));
  assert.equal(GameState.observations[0].type, 'environment');
  const observed = GameState.observations[0].status;

  GameState.environment.temperature = 'ALARM';
  assert.equal(observed.temperature, 'OK');

  runCommand('show environment all');
  assert.equal(GameState.observations[1].type, 'environment');
});

test('reset and legacy restore provide factory PoE and environment defaults', () => {
  resetHarness();
  GameState.inlinePower[0].admin = 'never';
  GameState.environment.temperature = 'ALARM';
  resetGameState();
  assert.equal(GameState.inlinePower[0].admin, 'auto');
  assert.equal(GameState.environment.temperature, 'OK');

  restoreGameState({ hostname: 'LEGACY-SW', interfaces: {} });
  assert.ok(GameState.inlinePower.some((entry) => entry.interface === 'g0/20'));
  assert.equal(GameState.environment.overall, 'OK');
});

test('autocomplete includes PoE and environment diagnostics', () => {
  assert.equal(getAutocomplete('show power in', 'privileged'), null);
  assert.equal(getAutocomplete('show power inline', 'privileged'), 'show power inline');
  assert.equal(getAutocomplete('show env', 'privileged'), 'show environment');
  assert.equal(getAutocomplete('pow in ne', 'interface'), 'power inline never');
  assert.equal(getInvalidCommandPosition('power mystery', 'interface'), 6);
});
