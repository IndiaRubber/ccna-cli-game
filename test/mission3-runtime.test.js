import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import {
  MISSION_THREE_EVENTS,
  advanceMissionThree,
  evaluateMissionThree,
  prepareMissionThreeScenario
} from '../src/quests/mission3/mission3Runtime.js';

function status(state) {
  state.observations.push({
    type: 'interfaces-status',
    interfaces: {
      'g0/6': { linkUp: state.interfaces['g0/6'].linkUp },
      'g0/13': { linkUp: state.interfaces['g0/13'].linkUp }
    }
  });
}

function inspect(state, interfaceName) {
  const port = state.interfaces[interfaceName];
  state.observations.push({
    type: 'interface-config',
    interfaceName,
    description: port.description,
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    configurationChanges: state.configurationChanges
  });
}

function preparedState() {
  const state = createD8SW1();
  state.currentQuestId = 'mission-3';
  prepareMissionThreeScenario(state);
  return state;
}

test('Mission 3 preparation models the moved physical connection once', () => {
  const state = createD8SW1();
  state.interfaces['g0/13'].description = 'Player change must survive';

  assert.equal(prepareMissionThreeScenario(state), true);
  assert.equal(state.interfaces['g0/6'].linkUp, false);
  assert.equal(state.interfaces['g0/13'].linkUp, true);
  assert.equal(state.interfaces['g0/6'].accessVlan, '15');
  assert.equal(state.interfaces['g0/13'].accessVlan, '1');
  assert.equal(state.interfaces['g0/13'].voiceVlan, null);
  assert.equal(state.interfaces['g0/13'].shutdown, false);
  assert.equal(state.mission3ScenarioPrepared, true);

  state.interfaces['g0/13'].accessVlan = '10';
  assert.equal(prepareMissionThreeScenario(state), false);
  assert.equal(state.interfaces['g0/13'].accessVlan, '10');
});

test('Mission 3 requires physical evidence and both old/new inspections', () => {
  const state = preparedState();
  status(state);
  assert.equal(evaluateMissionThree(state).objectiveStates['locate-new-printer-connection'], true);
  assert.equal(advanceMissionThree(state).type, MISSION_THREE_EVENTS.BLOCKED);

  inspect(state, 'g0/6');
  inspect(state, 'g0/13');
  assert.equal(evaluateMissionThree(state).investigated, true);
});

test('printer operation depends on port state, not description', () => {
  const state = preparedState();
  const port = state.interfaces['g0/13'];
  port.mode = 'access';
  port.accessVlan = '15';
  port.description = 'Spare Office Jack';
  state.configurationChanges = 1;
  inspect(state, 'g0/6');
  inspect(state, 'g0/13');

  assert.equal(evaluateMissionThree(state).printerOperational, true);
  assert.equal(evaluateMissionThree(state).descriptionComplete, false);
});

test('Mission 3 requires the dedicated Printer VLAN 15', () => {
  const state = preparedState();
  const port = state.interfaces['g0/13'];
  port.mode = 'access';
  port.accessVlan = '10';
  port.linkUp = true;

  assert.equal(evaluateMissionThree(state).printerOperational, false);
  assert.deepEqual(state.vlans['15'], { name: 'PRINTER' });
});

test('Mission 3 allows a working saved repair while scoring omitted practices', () => {
  const state = preparedState();
  status(state);
  inspect(state, 'g0/6');
  inspect(state, 'g0/13');

  const port = state.interfaces['g0/13'];
  port.mode = 'access';
  port.accessVlan = '15';
  port.description = 'Records Printer';
  state.configurationChanges = 1;
  state.saved = true;
  assert.equal(evaluateMissionThree(state).verified, false);
  assert.equal(evaluateMissionThree(state).readyToSubmit, true);

  assert.equal(evaluateMissionThree(state).objectiveStates['shutdown-old-printer-port'], false);
  const result = advanceMissionThree(state);
  assert.equal(result.type, MISSION_THREE_EVENTS.COMPLETED);
  assert.ok(result.evaluation.awardedXp < result.evaluation.maximumXp);
  assert.equal(advanceMissionThree(state).type, MISSION_THREE_EVENTS.ALREADY_COMPLETED);
});

test('Mission 3 accepts required operations in any order', () => {
  const state = preparedState();
  const port = state.interfaces['g0/13'];

  port.mode = 'access';
  port.accessVlan = '15';
  port.description = 'Records Printer';
  state.configurationChanges = 1;

  inspect(state, 'g0/13');
  inspect(state, 'g0/6');
  state.interfaces['g0/6'].shutdown = true;
  status(state);
  state.saved = true;

  assert.equal(evaluateMissionThree(state).investigated, true);
  assert.equal(evaluateMissionThree(state).readyToSubmit, true);
});
