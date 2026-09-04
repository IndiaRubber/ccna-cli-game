import test from 'node:test';
import assert from 'node:assert/strict';

import { recordActivity, recordObservation } from '../src/engine/activity.js';
import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import { advanceMissionZero } from '../src/quests/mission0/mission0Runtime.js';
import { advanceMissionOne } from '../src/quests/mission1/mission1Runtime.js';
import { advanceMissionTwo } from '../src/quests/mission2/mission2Runtime.js';
import { advanceMissionThree, prepareMissionThreeScenario } from '../src/quests/mission3/mission3Runtime.js';
import { advanceMissionFour, prepareMissionFourScenario } from '../src/quests/mission4/mission4Runtime.js';
import { advanceMissionFive, prepareMissionFiveScenario } from '../src/quests/mission5/mission5Runtime.js';

function startMission(state, missionId) {
  state.currentQuestId = missionId;
  state.questCompleted = false;
  state.observations = [];
}

function inspectInterface(state, interfaceName) {
  const port = state.interfaces[interfaceName];
  const power = state.inlinePower.find((entry) => entry.interface === interfaceName);
  recordObservation(state, {
    type: 'interface-config',
    interfaceName,
    description: port.description,
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    linkUp: port.linkUp,
    powerInline: power?.admin,
    powerOper: power?.oper,
    powerWatts: power?.powerWatts
  });
}

function mutateInterface(state, interfaceName, changes) {
  Object.assign(state.interfaces[interfaceName], changes);
  state.configurationChanges += 1;
  state.saved = false;
  recordActivity(state, {
    type: 'configuration-mutation',
    targetType: 'interface',
    target: interfaceName,
    field: Object.keys(changes).join(',')
  });
}

function saveConfiguration(state) {
  state.saved = true;
  state.lastSavedConfigurationChanges = state.configurationChanges;
  const activity = recordActivity(state, { type: 'configuration-saved' });
  state.lastSavedSequence = activity.sequence;
}

test('a perfect Mission 0-5 campaign awards 550 XP and 135 credits exactly once', () => {
  const state = createD8SW1();

  startMission(state, 'mission-0');
  recordObservation(state, {
    type: 'interfaces-status',
    interfaces: {
      'g0/12': {
        description: state.interfaces['g0/12'].description,
        linkUp: true,
        shutdown: false
      }
    }
  });
  assert.equal(advanceMissionZero(state).evaluation.perfect, true);

  startMission(state, 'mission-1');
  inspectInterface(state, 'g0/12');
  mutateInterface(state, 'g0/12', {
    mode: 'access',
    accessVlan: '10',
    description: 'Office 4B Workstation'
  });
  inspectInterface(state, 'g0/12');
  saveConfiguration(state);
  assert.equal(advanceMissionOne(state).evaluation.perfect, true);

  startMission(state, 'mission-2');
  inspectInterface(state, 'g0/12');
  mutateInterface(state, 'g0/12', { voiceVlan: '20' });
  inspectInterface(state, 'g0/12');
  saveConfiguration(state);
  assert.equal(advanceMissionTwo(state).evaluation.perfect, true);

  startMission(state, 'mission-3');
  prepareMissionThreeScenario(state);
  recordObservation(state, {
    type: 'interfaces-status',
    interfaces: {
      'g0/6': { linkUp: false },
      'g0/13': { linkUp: true }
    }
  });
  inspectInterface(state, 'g0/6');
  inspectInterface(state, 'g0/13');
  mutateInterface(state, 'g0/13', {
    mode: 'access',
    accessVlan: '15',
    description: 'Records Printer'
  });
  mutateInterface(state, 'g0/6', { shutdown: true });
  inspectInterface(state, 'g0/13');
  saveConfiguration(state);
  assert.equal(advanceMissionThree(state).evaluation.perfect, true);

  startMission(state, 'mission-4');
  prepareMissionFourScenario(state);
  recordObservation(state, {
    type: 'mac-address-table',
    query: { kind: 'address', value: '00aa.bbcc.dd21' },
    entries: [{ mac: '00aa.bbcc.dd21', interface: 'g0/21', vlan: '10', type: 'DYNAMIC' }]
  });
  inspectInterface(state, 'g0/21');
  mutateInterface(state, 'g0/21', { description: 'Warehouse Scanner Station' });
  inspectInterface(state, 'g0/21');
  saveConfiguration(state);
  assert.equal(advanceMissionFour(state).evaluation.perfect, true);

  startMission(state, 'mission-5');
  prepareMissionFiveScenario(state);
  recordObservation(state, { type: 'environment', status: { ...state.environment } });
  const power = state.inlinePower.find((entry) => entry.interface === 'g0/20');
  recordObservation(state, {
    type: 'inline-power',
    query: { kind: 'interface', value: 'g0/20' },
    entries: [{ ...power }]
  });
  power.admin = 'auto';
  power.oper = 'on';
  power.powerWatts = 7;
  mutateInterface(state, 'g0/20', { linkUp: true });
  recordObservation(state, {
    type: 'inline-power',
    query: { kind: 'interface', value: 'g0/20' },
    entries: [{ ...power }]
  });
  saveConfiguration(state);
  assert.equal(advanceMissionFive(state).evaluation.perfect, true);

  assert.deepEqual([state.xp, state.credits], [550, 135]);
  advanceMissionFive(state);
  assert.deepEqual([state.xp, state.credits], [550, 135]);
});
