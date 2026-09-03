export const MISSION_ZERO_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  COMPLETED: 'completed',
  ALREADY_COMPLETED: 'already-completed',
  BLOCKED: 'blocked'
};

export function evaluateMissionZero(state) {
  const officePort = state.interfaces?.['g0/12'] ?? null;
  const statusObservation = (state.observations ?? []).find(
    (observation) => observation.type === 'interfaces-status'
  );
  const observedPort = statusObservation?.interfaces?.['g0/12'];
  const identified = Boolean(
    observedPort?.description?.toLowerCase().includes('office 4b') &&
    observedPort.linkUp === true &&
    observedPort.shutdown === false
  );
  const unchanged = (state.configurationChanges ?? 0) === 0;
  const objectiveStates = {
    'review-office4b-assignment': state.currentQuestId === 'mission-0',
    'inspect-switch': Boolean(statusObservation),
    'identify-office4b-interface': identified,
    'confirm-office4b-finding': identified && unchanged
  };

  return {
    officePort,
    statusObservation,
    identified,
    unchanged,
    objectiveStates,
    readyToSubmit: identified && unchanged
  };
}

export function advanceMissionZero(state) {
  const progress = evaluateMissionZero(state);

  if (!progress.officePort) {
    return { type: MISSION_ZERO_EVENTS.DEVICE_MISSING, progress };
  }

  if (state.questCompleted) {
    return { type: MISSION_ZERO_EVENTS.ALREADY_COMPLETED, progress };
  }

  if (progress.readyToSubmit) {
    state.questCompleted = true;
    state.xp = (state.xp ?? 0) + 50;
    state.credits = (state.credits ?? 0) + 10;
    return { type: MISSION_ZERO_EVENTS.COMPLETED, progress };
  }

  return { type: MISSION_ZERO_EVENTS.BLOCKED, progress };
}
