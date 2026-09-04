import {
  hasUnrelatedInterfaceMutation,
  getObservedInterface,
  isCurrentConfigurationSaved,
  wasCurrentObservationBeforeSave,
  wasObservedAtCurrentRevision,
  wasObservedBeforeFirstMutation
} from '../../engine/activity.js';
import { completeEvaluatedMission } from '../missionEvaluation.js';
import { mission1 } from './mission1.js';

export const MISSION_ONE_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

export function evaluateMissionOne(state) {
  const officePort = state.interfaces?.['g0/12'] ?? null;

  if (!officePort) {
    return {
      officePort: null,
      objectiveStates: {},
      phaseOneComplete: false,
      readyToSubmit: false
    };
  }

  const normalizedDescription = officePort.description?.toLowerCase() ?? '';
  const hasUpdatedDescription =
    normalizedDescription.includes('office 4b') &&
    !normalizedDescription.includes('pending setup');

  const saved = isCurrentConfigurationSaved(state);
  const workstationOperational = Boolean(
    officePort.mode === 'access' &&
    String(officePort.accessVlan) === '10' &&
    officePort.voiceVlan === null &&
    officePort.shutdown === false &&
    officePort.linkUp === true
  );
  const relevantInspection = (observation) => Boolean(getObservedInterface(observation, 'g0/12'));
  const finalInspection = (observation) => {
    const observed = getObservedInterface(observation, 'g0/12');
    return observed?.mode === 'access' &&
      String(observed.accessVlan) === '10' &&
      observed.voiceVlan === null &&
      observed.shutdown === false;
  };
  const postChangeVerification = workstationOperational && wasObservedAtCurrentRevision(state, finalInspection);

  const objectiveStates = {
    'identify-office4b-port':
      state.currentInterface === 'g0/12' ||
      officePort.mode === 'access' ||
      officePort.accessVlan === '10',
    'g012-mode-access': officePort.mode === 'access',
    'g012-access-vlan10': officePort.accessVlan === '10',
    'g012-description': hasUpdatedDescription,
    save: saved
  };

  const phaseOneComplete = workstationOperational && saved;
  const evaluationSignals = {
    descriptionUpdated: hasUpdatedDescription,
    preChangeInspection: wasObservedBeforeFirstMutation(state, relevantInspection),
    postChangeVerification,
    verifiedBeforeSave: !postChangeVerification || wasCurrentObservationBeforeSave(state, finalInspection),
    unrelatedInterfaceModified: hasUnrelatedInterfaceMutation(state, ['g0/12'])
  };

  return {
    officePort,
    objectiveStates,
    workstationOperational,
    evaluationSignals,
    phaseOneComplete,
    readyToSubmit: phaseOneComplete
  };
}

export function advanceMissionOne(state) {
  const progress = evaluateMissionOne(state);

  if (!progress.officePort) {
    return { type: MISSION_ONE_EVENTS.DEVICE_MISSING, progress };
  }

  if (state.questCompleted) {
    return { type: MISSION_ONE_EVENTS.ALREADY_COMPLETED, progress };
  }

  if (progress.phaseOneComplete) {
    const evaluation = completeEvaluatedMission(state, mission1, progress);

    return {
      type: MISSION_ONE_EVENTS.COMPLETED,
      progress: evaluateMissionOne(state),
      evaluation
    };
  }

  return { type: MISSION_ONE_EVENTS.BLOCKED, progress };
}
