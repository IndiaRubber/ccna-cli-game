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
import { mission4 } from './mission4.js';

export const MISSION_FOUR_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

const TARGET_MAC = '00aa.bbcc.dd21';
const TARGET_INTERFACE = 'g0/21';

export function prepareMissionFourScenario(state) {
  if (state.mission4ScenarioPrepared) return false;

  const scannerPort = state.interfaces?.[TARGET_INTERFACE];
  if (!scannerPort) return false;

  scannerPort.description = 'Warehouse Drop - Unverified';
  state.mission4ScenarioPrepared = true;
  return true;
}

function scannerDescriptionIsComplete(description = '') {
  const normalized = description.toLowerCase();
  return normalized.includes('warehouse') && normalized.includes('scanner');
}

function scannerIsOperational(port) {
  return Boolean(
    port &&
    port.linkUp === true &&
    port.mode === 'access' &&
    String(port.accessVlan) === '10' &&
    port.voiceVlan === null &&
    port.shutdown === false
  );
}

function hasTargetMacEvidence(observations) {
  return observations.some((observation) =>
    observation.type === 'mac-address-table' &&
    observation.entries?.some((entry) =>
      entry.mac === TARGET_MAC && entry.interface === TARGET_INTERFACE
    )
  );
}

export function evaluateMissionFour(state) {
  const scannerPort = state.interfaces?.[TARGET_INTERFACE] ?? null;
  const observations = state.observations ?? [];
  const macEvidence = hasTargetMacEvidence(observations);
  const scannerOperational = scannerIsOperational(scannerPort);
  const descriptionComplete = scannerDescriptionIsComplete(scannerPort?.description);
  const finalInspection = (observation) => {
    const observed = getObservedInterface(observation, TARGET_INTERFACE);
    return observed?.mode === 'access' &&
      String(observed.accessVlan) === '10' &&
      observed.voiceVlan === null &&
      observed.shutdown === false &&
      observed.linkUp === true &&
      observed.description === scannerPort.description;
  };
  const verified = scannerOperational && descriptionComplete && wasObservedAtCurrentRevision(state, finalInspection);
  const saved = isCurrentConfigurationSaved(state);

  const objectiveStates = {
    'investigate-warehouse-endpoint': macEvidence,
    'locate-scanner-connection': macEvidence,
    'document-scanner-port': descriptionComplete,
    'verify-scanner-connection': verified,
    save: saved
  };
  const evaluationSignals = {
    macEvidenceReviewed: macEvidence,
    preChangeInspection: wasObservedBeforeFirstMutation(
      state,
      (observation) => Boolean(getObservedInterface(observation, TARGET_INTERFACE))
    ),
    postChangeVerification: verified,
    verifiedBeforeSave: !verified || wasCurrentObservationBeforeSave(state, finalInspection),
    unrelatedInterfaceModified: hasUnrelatedInterfaceMutation(state, [TARGET_INTERFACE]),
    causedAdditionalOutage: getMissionMutations(state).some((entry) =>
      entry.target === TARGET_INTERFACE && (
        entry.field === 'shutdown' && entry.after === true ||
        entry.field === 'accessVlan' && String(entry.after) !== '10' ||
        entry.field === 'voiceVlan' && entry.after !== null
      )
    )
  };

  return {
    scannerPort,
    macEvidence,
    scannerOperational,
    descriptionComplete,
    verified,
    objectiveStates,
    evaluationSignals,
    readyToSubmit: scannerOperational && descriptionComplete && saved
  };
}

export function advanceMissionFour(state) {
  const progress = evaluateMissionFour(state);

  if (!progress.scannerPort) {
    return { type: MISSION_FOUR_EVENTS.DEVICE_MISSING, progress };
  }
  if (state.questCompleted) {
    return { type: MISSION_FOUR_EVENTS.ALREADY_COMPLETED, progress };
  }
  if (progress.readyToSubmit) {
    const evaluation = completeEvaluatedMission(state, mission4, progress);
    return { type: MISSION_FOUR_EVENTS.COMPLETED, progress, evaluation };
  }
  return { type: MISSION_FOUR_EVENTS.BLOCKED, progress };
}
