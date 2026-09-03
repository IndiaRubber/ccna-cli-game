export const MISSION_ONE_EVENTS = {
  DEVICE_MISSING: 'device-missing',
  HIDDEN_OBJECTIVE_REVEALED: 'hidden-objective-revealed',
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
      phaseTwoComplete: false,
      readyToSubmit: false
    };
  }

  const normalizedDescription = officePort.description?.toLowerCase() ?? '';
  const hasUpdatedDescription =
    normalizedDescription.includes('office 4b') &&
    !normalizedDescription.includes('pending setup');

  const objectiveStates = {
    'identify-office4b-port':
      state.currentInterface === 'g0/12' ||
      officePort.mode === 'access' ||
      officePort.accessVlan === '10',
    'g012-mode-access': officePort.mode === 'access',
    'g012-access-vlan10': officePort.accessVlan === '10',
    'g012-description': hasUpdatedDescription,
    save: state.saved === true,
    'g012-voice-vlan20': officePort.voiceVlan === '20'
  };

  const phaseOneComplete =
    objectiveStates['g012-mode-access'] &&
    objectiveStates['g012-access-vlan10'] &&
    objectiveStates['g012-description'] &&
    objectiveStates.save;

  const phaseTwoComplete =
    phaseOneComplete && objectiveStates['g012-voice-vlan20'];

  return {
    officePort,
    objectiveStates,
    phaseOneComplete,
    phaseTwoComplete,
    readyToSubmit: state.hiddenObjectiveRevealed
      ? phaseTwoComplete
      : phaseOneComplete
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

  if (!state.hiddenObjectiveRevealed && progress.phaseOneComplete) {
    state.ticketSubmitted = true;
    state.hiddenObjectiveRevealed = true;
    state.saved = false;

    return {
      type: MISSION_ONE_EVENTS.HIDDEN_OBJECTIVE_REVEALED,
      progress: evaluateMissionOne(state)
    };
  }

  if (state.hiddenObjectiveRevealed && progress.phaseTwoComplete) {
    state.questCompleted = true;
    state.xp = Math.max(state.xp ?? 0, 100);
    state.credits = Math.max(state.credits ?? 0, 25);

    return {
      type: MISSION_ONE_EVENTS.COMPLETED,
      progress: evaluateMissionOne(state)
    };
  }

  return { type: MISSION_ONE_EVENTS.BLOCKED, progress };
}
