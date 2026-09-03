import { mission1 } from './mission1/mission1.js';
import {
  advanceMissionOne,
  evaluateMissionOne
} from './mission1/mission1Runtime.js';

const missions = {
  [mission1.id]: {
    definition: mission1,
    evaluate: evaluateMissionOne,
    advance: advanceMissionOne
  }
};

export function getMission(missionId) {
  return missions[missionId] ?? null;
}
