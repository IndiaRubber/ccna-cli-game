import {
  hasUnrelatedInterfaceMutation,
  getObservedInterface,
  isCurrentConfigurationSaved,
  wasCurrentObservationBeforeSave,
  wasObservedAtCurrentRevision,
  wasObservedBeforeFirstMutation
} from '../../engine/activity.js';
import { completeEvaluatedMission } from '../missionEvaluation.js';
import { mission3 } from './mission3.js';

export const MISSION_THREE_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

const OLD_PRINTER_INTERFACE = 'g0/6';
const NEW_PRINTER_INTERFACE = 'g0/13';

export function prepareMissionThreeScenario(state) {
  if (state.mission3ScenarioPrepared) return false;

  const oldPort = state.interfaces?.[OLD_PRINTER_INTERFACE];
  const newPort = state.interfaces?.[NEW_PRINTER_INTERFACE];

  if (!oldPort || !newPort) return false;

  oldPort.linkUp = false;
  newPort.linkUp = true;
  state.mission3ScenarioPrepared = true;
  return true;
}

function hasPrinterDescription(description = '') {
  const normalized = description.toLowerCase();
  return normalized.includes('printer') && (
    normalized.includes('records') ||
    normalized.includes('annex') ||
    normalized.includes('office')
  );
}

function printerIsOperational(port) {
  return Boolean(
    port &&
    port.mode === 'access' &&
       port.accessVlan === '15' &&
    port.voiceVlan === null &&
    port.shutdown === false &&
    port.linkUp === true
  );
}

export function evaluateMissionThree(state) {
  const oldPort = state.interfaces?.[OLD_PRINTER_INTERFACE] ?? null;
  const newPort = state.interfaces?.[NEW_PRINTER_INTERFACE] ?? null;
  const statusObservation = (state.observations ?? []).find(
    (observation) => observation.type === 'interfaces-status'
  );
  const oldInspections = (state.observations ?? []).filter(
    (observation) => observation.type === 'interface-config' && observation.interfaceName === OLD_PRINTER_INTERFACE
  );
  const newInspections = (state.observations ?? []).filter(
    (observation) => observation.type === 'interface-config' && observation.interfaceName === NEW_PRINTER_INTERFACE
  );
  const statusEvidence = Boolean(
    statusObservation?.interfaces?.[OLD_PRINTER_INTERFACE]?.linkUp === false &&
    statusObservation?.interfaces?.[NEW_PRINTER_INTERFACE]?.linkUp === true
  );
  const knownGoodInspection = oldInspections.some((observation) =>
    observation.mode === 'access' &&
    observation.accessVlan === '15' &&
    observation.voiceVlan === null &&
    observation.shutdown === false
  );
  const newPortInspected = newInspections.length > 0;
  const oldPortShutdown = oldPort?.shutdown === true;
  const printerOperational = printerIsOperational(newPort);
  const descriptionComplete = hasPrinterDescription(newPort?.description);
  const finalInspection = (observation) => {
    const observed = getObservedInterface(observation, NEW_PRINTER_INTERFACE);
    return observed?.mode === 'access' &&
      observed.accessVlan === '15' &&
      observed.voiceVlan === null &&
      observed.shutdown === false &&
      observed.linkUp === true;
  };
  const verified = printerOperational && wasObservedAtCurrentRevision(state, finalInspection);
  const investigated = statusEvidence && knownGoodInspection && newPortInspected;
  const saved = isCurrentConfigurationSaved(state);
  const objectiveStates = {
    'investigate-printer-outage': Boolean(statusObservation),
    'locate-new-printer-connection': statusEvidence,
    'shutdown-old-printer-port': oldPortShutdown,
    'restore-printer-service': printerOperational,
    'verify-printer-repair': verified,
    'document-printer-port': descriptionComplete,
    save: saved
  };
  const evaluationSignals = {
    moveEvidenceReviewed: statusEvidence,
    knownGoodInspected: knownGoodInspection,
    newPortInspectedBeforeChange: wasObservedBeforeFirstMutation(
      state,
      (observation) => Boolean(getObservedInterface(observation, NEW_PRINTER_INTERFACE))
    ),
    descriptionUpdated: descriptionComplete,
    postChangeVerification: verified,
    verifiedBeforeSave: !verified || wasCurrentObservationBeforeSave(state, finalInspection),
    abandonedPortSecured: oldPortShutdown,
    unrelatedInterfaceModified: hasUnrelatedInterfaceMutation(state, [OLD_PRINTER_INTERFACE, NEW_PRINTER_INTERFACE])
  };

  return {
    oldPort,
    newPort,
    statusObservation,
    investigated,
    printerOperational,
    descriptionComplete,
    verified,
    objectiveStates,
    evaluationSignals,
    readyToSubmit: printerOperational && saved
  };
}

export function advanceMissionThree(state) {
  const progress = evaluateMissionThree(state);

  if (!progress.oldPort || !progress.newPort) {
    return { type: MISSION_THREE_EVENTS.DEVICE_MISSING, progress };
  }
  if (state.questCompleted) {
    return { type: MISSION_THREE_EVENTS.ALREADY_COMPLETED, progress };
  }
  if (progress.readyToSubmit) {
    const evaluation = completeEvaluatedMission(state, mission3, progress);
    return { type: MISSION_THREE_EVENTS.COMPLETED, progress, evaluation };
  }
  return { type: MISSION_THREE_EVENTS.BLOCKED, progress };
}
