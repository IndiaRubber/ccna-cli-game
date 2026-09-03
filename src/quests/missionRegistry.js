import { mission1 } from './mission1/mission1.js';
import { mission2 } from './mission2/mission2.js';
import { mission0 } from './mission0/mission0.js';
import {
  advanceMissionOne,
  evaluateMissionOne
} from './mission1/mission1Runtime.js';
import {
  advanceMissionTwo,
  evaluateMissionTwo
} from './mission2/mission2Runtime.js';
import {
  advanceMissionZero,
  evaluateMissionZero
} from './mission0/mission0Runtime.js';

const missions = {
  [mission0.id]: {
    definition: mission0,
    evaluate: evaluateMissionZero,
    advance: advanceMissionZero
  },
  [mission1.id]: {
    definition: mission1,
    evaluate: evaluateMissionOne,
    advance: advanceMissionOne
  },
  [mission2.id]: {
    definition: mission2,
    evaluate: evaluateMissionTwo,
    advance: advanceMissionTwo
  }
};

const missionOrder = ['mission-0', 'mission-1', 'mission-2'];

export function getMission(missionId) {
  return missions[missionId] ?? null;
}

export function getNextMission(missionId) {
  const nextId = missionOrder[missionOrder.indexOf(missionId) + 1];
  return nextId ? getMission(nextId) : null;
}
