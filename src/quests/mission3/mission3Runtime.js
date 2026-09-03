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
    observation.accessVlan === '10' &&
    observation.voiceVlan === null &&
    observation.shutdown === false
  );
  const newPortInspected = newInspections.length > 0;
  const oldPortShutdown = oldPort?.shutdown === true;
  const printerOperational = printerIsOperational(newPort);
  const descriptionComplete = hasPrinterDescription(newPort?.description);
  const verified = printerOperational && newInspections.some((observation) =>
    observation.mode === 'access' &&
       observation.accessVlan === '15' &&
    observation.voiceVlan === null &&
    observation.shutdown === false &&
    observation.description === newPort.description &&
    (observation.configurationChanges ?? 0) === (state.configurationChanges ?? 0)
  );
  const investigated = statusEvidence && knownGoodInspection && newPortInspected;
  const objectiveStates = {
    'investigate-printer-outage': Boolean(statusObservation),
    'locate-new-printer-connection': statusEvidence,
    'shutdown-old-printer-port': oldPortShutdown,
    'restore-printer-service': investigated && printerOperational,
    'verify-printer-repair': investigated && verified,
    'document-printer-port': descriptionComplete,
    save: state.saved === true
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
    readyToSubmit: investigated && oldPortShutdown && verified && descriptionComplete && objectiveStates.save
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
    state.questCompleted = true;
    state.xp = (state.xp ?? 0) + 100;
    state.credits = (state.credits ?? 0) + 25;
    return { type: MISSION_THREE_EVENTS.COMPLETED, progress };
  }
  return { type: MISSION_THREE_EVENTS.BLOCKED, progress };
}
