import {
  hasUnrelatedInterfaceMutation,
  getObservedInterface,
  getMissionMutations,
  isCurrentConfigurationSaved,
  wasCurrentObservationBeforeSave,
  wasObservedAtCurrentRevision,
  wasObservedBeforeFirstMutation
} from '../../engine/activity.js';
import { completeEvaluatedMission } from '../missionEvaluation.js';
import { mission2 } from './mission2.js';

export const MISSION_TWO_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

function officePhoneIsOperational(port) {
  return Boolean(
    port &&
    port.mode === 'access' &&
    String(port.accessVlan) === '10' &&
    String(port.voiceVlan) === '20' &&
    port.shutdown === false &&
    port.linkUp === true
  );
}

export function evaluateMissionTwo(state) {
  const officePort = state.interfaces?.['g0/12'] ?? null;
  const relevantInspection = (observation) => Boolean(getObservedInterface(observation, 'g0/12'));
  const investigated = (state.observations ?? []).some((observation) => {
    const observed = getObservedInterface(observation, 'g0/12');
    return observed && String(observed.voiceVlan) !== '20';
  });
  const phoneOperational = officePhoneIsOperational(officePort);
  const finalInspection = (observation) => {
    const observed = getObservedInterface(observation, 'g0/12');
    return observed?.mode === 'access' &&
      String(observed.accessVlan) === '10' &&
      String(observed.voiceVlan) === '20' &&
      observed.shutdown === false;
  };
  const verified = phoneOperational && wasObservedAtCurrentRevision(state, finalInspection);
  const saved = isCurrentConfigurationSaved(state);

  const objectiveStates = {
    'investigate-phone-connectivity': investigated,
    'correct-switchport-configuration': phoneOperational,
    'verify-phone-operational': verified,
    save: saved
  };

  const evaluationSignals = {
    preChangeInspection: wasObservedBeforeFirstMutation(state, relevantInspection),
    postChangeVerification: verified,
    verifiedBeforeSave: !verified || wasCurrentObservationBeforeSave(state, finalInspection),
    unrelatedInterfaceModified: hasUnrelatedInterfaceMutation(state, ['g0/12']),
    causedAdditionalOutage: getMissionMutations(state).some((entry) =>
      entry.target === 'g0/12' && (
        entry.field === 'shutdown' && entry.after === true ||
        entry.field === 'accessVlan' && String(entry.after) !== '10'
      )
    )
  };

  return {
    officePort,
    objectiveStates,
    investigated,
    phoneOperational,
    verified,
    evaluationSignals,
    readyToSubmit: phoneOperational && saved
  };
}

export function advanceMissionTwo(state) {
  const progress = evaluateMissionTwo(state);

  if (!progress.officePort) {
    return { type: MISSION_TWO_EVENTS.DEVICE_MISSING, progress };
  }

  if (state.questCompleted) {
    return { type: MISSION_TWO_EVENTS.ALREADY_COMPLETED, progress };
  }

  if (progress.readyToSubmit) {
    const evaluation = completeEvaluatedMission(state, mission2, progress);
    return { type: MISSION_TWO_EVENTS.COMPLETED, progress, evaluation };
  }

  return { type: MISSION_TWO_EVENTS.BLOCKED, progress };
}
