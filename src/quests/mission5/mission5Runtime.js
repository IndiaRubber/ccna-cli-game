import {
  hasUnrelatedInterfaceMutation,
  getObservedInterface,
  isCurrentConfigurationSaved,
  wasCurrentObservationBeforeSave,
  wasObservedAtCurrentRevision,
  wasObservedBeforeFirstMutation
} from '../../engine/activity.js';
import { completeEvaluatedMission } from '../missionEvaluation.js';
import { mission5 } from './mission5.js';

export const MISSION_FIVE_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

const FRONT_CAMERA_INTERFACE = 'g0/19';
const REAR_CAMERA_INTERFACE = 'g0/20';

function getPowerEntry(state, interfaceName) {
  return state.inlinePower?.find((entry) => entry.interface === interfaceName) ?? null;
}

function isHealthyEnvironment(observation) {
  const status = observation?.status;
  return observation?.type === 'environment' &&
    status?.temperature === 'OK' &&
    status?.fans === 'OK' &&
    status?.powerSupply1 === 'OK' &&
    status?.powerSupply2 === 'OK' &&
    status?.overall === 'OK';
}

function hasCameraObservation(observation) {
  return Boolean(
    observation?.type === 'interfaces-status' && observation.interfaces?.[REAR_CAMERA_INTERFACE] ||
    observation?.type === 'interface-config' && observation.interfaceName === REAR_CAMERA_INTERFACE
  );
}

function hasFailedPowerEvidence(observation) {
  return observation?.type === 'inline-power' && observation.entries?.some((entry) =>
    entry.interface === REAR_CAMERA_INTERFACE &&
    entry.admin === 'never' &&
    entry.oper === 'off' &&
    entry.powerWatts === 0
  );
}

function hasFailedInterfaceEvidence(observation) {
  return observation?.type === 'interface-config' &&
    observation.interfaceName === REAR_CAMERA_INTERFACE &&
    observation.powerInline === 'never';
}

function hasRestoredPowerEvidence(observation, configurationChanges) {
  return observation?.type === 'inline-power' &&
    observation.entries?.some((entry) =>
      entry.interface === REAR_CAMERA_INTERFACE &&
      entry.admin === 'auto' &&
      entry.oper === 'on' &&
      entry.powerWatts > 0
    ) && observation.configurationChanges === configurationChanges;
}

export function prepareMissionFiveScenario(state) {
  if (state.mission5ScenarioPrepared) return false;

  const rearCamera = state.interfaces?.[REAR_CAMERA_INTERFACE];
  const powerEntry = getPowerEntry(state, REAR_CAMERA_INTERFACE);
  if (!rearCamera || !powerEntry) return false;

  powerEntry.admin = 'never';
  powerEntry.oper = 'off';
  powerEntry.powerWatts = 0;
  if (powerEntry.requiredForLink) rearCamera.linkUp = false;
  state.mission5ScenarioPrepared = true;
  return true;
}

export function evaluateMissionFive(state) {
  const rearCamera = state.interfaces?.[REAR_CAMERA_INTERFACE] ?? null;
  const frontCamera = state.interfaces?.[FRONT_CAMERA_INTERFACE] ?? null;
  const rearPower = getPowerEntry(state, REAR_CAMERA_INTERFACE);
  const observations = state.observations ?? [];
  const environmentHealthy = observations.some(isHealthyEnvironment);
  const investigated = observations.some(hasCameraObservation) ||
    observations.some((observation) =>
      observation.type === 'inline-power' && observation.entries?.some(
        (entry) => entry.interface === REAR_CAMERA_INTERFACE
      )
    );
  const identifiedFault = observations.some(hasFailedPowerEvidence) ||
    observations.some(hasFailedInterfaceEvidence);
  const restored = Boolean(
    rearCamera &&
    rearCamera.mode === 'access' &&
    String(rearCamera.accessVlan) === '10' &&
    rearCamera.voiceVlan === null &&
    rearCamera.shutdown === false &&
    rearCamera.linkUp === true &&
    rearPower?.admin === 'auto' &&
    rearPower.oper === 'on' &&
    rearPower.powerWatts > 0
  );
  const finalPowerInspection = (observation) => {
    if (hasRestoredPowerEvidence(observation, state.configurationChanges ?? 0)) return true;
    const observed = getObservedInterface(observation, REAR_CAMERA_INTERFACE);
    return observed?.linkUp === true &&
      observed.powerInline === 'auto' &&
      observed.powerOper === 'on' &&
      observed.powerWatts > 0;
  };
  const verified = restored && wasObservedAtCurrentRevision(state, finalPowerInspection);
  const saved = isCurrentConfigurationSaved(state);

  const objectiveStates = {
    'investigate-camera-outage': investigated,
    'confirm-environment-health': environmentHealthy,
    'identify-power-fault': identifiedFault,
    'restore-camera-service': restored,
    'verify-power-connectivity': verified,
    save: saved
  };
  const evaluationSignals = {
    environmentChecked: environmentHealthy,
    powerFaultObserved: identifiedFault && wasObservedBeforeFirstMutation(
      state,
      (observation) => hasFailedPowerEvidence(observation) || hasFailedInterfaceEvidence(observation)
    ),
    postChangeVerification: verified,
    verifiedBeforeSave: !verified || wasCurrentObservationBeforeSave(state, finalPowerInspection),
    unrelatedInterfaceModified: hasUnrelatedInterfaceMutation(state, [REAR_CAMERA_INTERFACE])
  };

  return {
    rearCamera,
    frontCamera,
    rearPower,
    environmentHealthy,
    investigated,
    identifiedFault,
    restored,
    verified,
    objectiveStates,
    evaluationSignals,
    readyToSubmit: restored && saved
  };
}

export function advanceMissionFive(state) {
  const progress = evaluateMissionFive(state);

  if (!progress.rearCamera || !progress.rearPower) {
    return { type: MISSION_FIVE_EVENTS.DEVICE_MISSING, progress };
  }
  if (state.questCompleted) {
    return { type: MISSION_FIVE_EVENTS.ALREADY_COMPLETED, progress };
  }
  if (progress.readyToSubmit) {
    const evaluation = completeEvaluatedMission(state, mission5, progress);
    return { type: MISSION_FIVE_EVENTS.COMPLETED, progress, evaluation };
  }
  return { type: MISSION_FIVE_EVENTS.BLOCKED, progress };
}
