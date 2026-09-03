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
  const inspections = observations.filter(
    (observation) =>
      observation.type === 'interface-config' &&
      observation.interfaceName === TARGET_INTERFACE
  );
  const macEvidence = hasTargetMacEvidence(observations);
  const scannerOperational = scannerIsOperational(scannerPort);
  const descriptionComplete = scannerDescriptionIsComplete(scannerPort?.description);
  const verified = scannerOperational && descriptionComplete && inspections.some(
    (observation) =>
      observation.mode === 'access' &&
      String(observation.accessVlan) === '10' &&
      observation.voiceVlan === null &&
      observation.shutdown === false &&
      observation.linkUp === true &&
      observation.description === scannerPort.description &&
      (observation.configurationChanges ?? 0) === (state.configurationChanges ?? 0)
  );

  const objectiveStates = {
    'investigate-warehouse-endpoint': macEvidence,
    'locate-scanner-connection': macEvidence,
    'document-scanner-port': macEvidence && descriptionComplete,
    'verify-scanner-connection': macEvidence && verified,
    save: state.saved === true
  };

  return {
    scannerPort,
    macEvidence,
    scannerOperational,
    descriptionComplete,
    verified,
    objectiveStates,
    readyToSubmit: macEvidence && verified && objectiveStates.save
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
    state.questCompleted = true;
    state.xp = (state.xp ?? 0) + 100;
    state.credits = (state.credits ?? 0) + 25;
    return { type: MISSION_FOUR_EVENTS.COMPLETED, progress };
  }
  return { type: MISSION_FOUR_EVENTS.BLOCKED, progress };
}
