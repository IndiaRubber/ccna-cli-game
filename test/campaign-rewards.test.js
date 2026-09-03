import test from 'node:test';
import assert from 'node:assert/strict';

import { createD8SW1 } from '../src/devices/catalyst2960x.js';
import { advanceMissionZero } from '../src/quests/mission0/mission0Runtime.js';
import { advanceMissionOne } from '../src/quests/mission1/mission1Runtime.js';
import { advanceMissionTwo } from '../src/quests/mission2/mission2Runtime.js';

function inspectInterface(state) {
  const port = state.interfaces['g0/12'];
  state.observations.push({
    type: 'interface-config',
    interfaceName: 'g0/12',
    mode: port.mode,
    accessVlan: port.accessVlan,
    voiceVlan: port.voiceVlan,
    shutdown: port.shutdown,
    configurationChanges: state.configurationChanges
  });
}

test('the complete Mission 0-2 campaign awards 250 XP and 60 credits exactly once', () => {
  const state = createD8SW1();
  state.currentQuestId = 'mission-0';
  state.observations.push({
    type: 'interfaces-status',
    interfaces: {
      'g0/12': {
        description: state.interfaces['g0/12'].description,
        linkUp: true,
        shutdown: false
      }
    }
  });

  advanceMissionZero(state);
  assert.deepEqual([state.xp, state.credits], [50, 10]);

  state.currentQuestId = 'mission-1';
  state.questCompleted = false;
  const port = state.interfaces['g0/12'];
  port.mode = 'access';
  port.accessVlan = '10';
  port.description = 'Office 4B Workstation';
  state.saved = true;
  advanceMissionOne(state);
  assert.deepEqual([state.xp, state.credits], [150, 35]);

  state.currentQuestId = 'mission-2';
  state.questCompleted = false;
  state.saved = true;
  inspectInterface(state);
  port.voiceVlan = '20';
  state.configurationChanges += 1;
  state.saved = false;
  inspectInterface(state);
  state.saved = true;
  advanceMissionTwo(state);

  assert.deepEqual([state.xp, state.credits], [250, 60]);
  advanceMissionTwo(state);
  assert.deepEqual([state.xp, state.credits], [250, 60]);
});
