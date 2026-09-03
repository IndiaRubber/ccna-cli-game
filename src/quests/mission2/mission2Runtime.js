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
  const inspections = (state.observations ?? []).filter(
    (observation) =>
      observation.type === 'interface-config' &&
      observation.interfaceName === 'g0/12'
  );
  const investigated = inspections.some((observation) => String(observation.voiceVlan) !== '20') ||
    (state.observations ?? []).some((observation) =>
      observation.type === 'interfaces-status' &&
      String(observation.interfaces?.['g0/12']?.voiceVlan) !== '20'
    );
  const phoneOperational = officePhoneIsOperational(officePort);
  const verified = investigated && phoneOperational && inspections.some(
    (observation) =>
      observation.mode === 'access' &&
      String(observation.accessVlan) === '10' &&
      String(observation.voiceVlan) === '20' &&
      observation.shutdown === false &&
      (observation.configurationChanges ?? 0) === (state.configurationChanges ?? 0)
  );

  const objectiveStates = {
    'investigate-phone-connectivity': investigated,
    'correct-switchport-configuration': investigated && phoneOperational,
    'verify-phone-operational': verified,
    save: state.saved === true
  };

  return {
    officePort,
    objectiveStates,
    investigated,
    phoneOperational,
    verified,
    readyToSubmit: verified && objectiveStates.save
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
    state.questCompleted = true;
    state.xp = (state.xp ?? 0) + 100;
    state.credits = (state.credits ?? 0) + 25;

    return { type: MISSION_TWO_EVENTS.COMPLETED, progress };
  }

  return { type: MISSION_TWO_EVENTS.BLOCKED, progress };
}
