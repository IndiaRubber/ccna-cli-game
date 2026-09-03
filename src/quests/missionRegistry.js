import { mission1 } from './mission1/mission1.js';
import { mission2 } from './mission2/mission2.js';
import { mission0 } from './mission0/mission0.js';
import { mission3 } from './mission3/mission3.js';
import { mission4 } from './mission4/mission4.js';
import { mission5 } from './mission5/mission5.js';
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
import {
  advanceMissionThree,
  evaluateMissionThree
} from './mission3/mission3Runtime.js';
import {
  advanceMissionFour,
  evaluateMissionFour
} from './mission4/mission4Runtime.js';
import {
  advanceMissionFive,
  evaluateMissionFive
} from './mission5/mission5Runtime.js';

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
  },
  [mission3.id]: {
    definition: mission3,
    evaluate: evaluateMissionThree,
    advance: advanceMissionThree
  },
  [mission4.id]: {
    definition: mission4,
    evaluate: evaluateMissionFour,
    advance: advanceMissionFour
  },
  [mission5.id]: {
    definition: mission5,
    evaluate: evaluateMissionFive,
    advance: advanceMissionFive
  }
};

const missionOrder = ['mission-0', 'mission-1', 'mission-2', 'mission-3', 'mission-4', 'mission-5'];

export function getMission(missionId) {
  return missions[missionId] ?? null;
}

export function getNextMission(missionId) {
  const nextId = missionOrder[missionOrder.indexOf(missionId) + 1];
  return nextId ? getMission(nextId) : null;
}
