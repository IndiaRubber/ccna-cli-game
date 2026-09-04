function ensureActivityState(state) {
  if (!Array.isArray(state.activityLog)) state.activityLog = [];
  if (!Number.isInteger(state.activitySequence)) state.activitySequence = 0;
}

export function recordActivity(state, activity) {
  ensureActivityState(state);
  state.activitySequence += 1;

  const entry = {
    ...activity,
    sequence: state.activitySequence,
    missionId: state.currentQuestId ?? null,
    configurationChanges: state.configurationChanges ?? 0
  };

  state.activityLog.push(entry);
  return entry;
}

export function recordObservation(state, observation) {
  if (!Array.isArray(state.observations)) state.observations = [];
  const activity = recordActivity(state, {
    type: 'inspection',
    observationType: observation.type
  });
  const entry = {
    ...observation,
    sequence: activity.sequence,
    missionId: activity.missionId,
    configurationChanges: state.configurationChanges ?? 0
  };

  state.observations.push(entry);
  return entry;
}

export function getMissionActivity(state, missionId = state.currentQuestId) {
  return (state.activityLog ?? []).filter((entry) => entry.missionId === missionId);
}

export function getMissionMutations(state, missionId = state.currentQuestId) {
  return getMissionActivity(state, missionId).filter((entry) => entry.type === 'configuration-mutation');
}

export function getFirstMissionMutation(state, missionId = state.currentQuestId) {
  return getMissionMutations(state, missionId)[0] ?? null;
}

export function getObservedInterface(observation, interfaceName) {
  if (observation?.type === 'interface-config' && observation.interfaceName === interfaceName) {
    return observation;
  }
  if (observation?.type === 'interfaces-status' || observation?.type === 'running-config') {
    return observation.interfaces?.[interfaceName] ?? null;
  }
  return null;
}

export function wasObservedBeforeFirstMutation(state, predicate, missionId = state.currentQuestId) {
  const firstMutation = getFirstMissionMutation(state, missionId);
  return (state.observations ?? []).some((observation) => {
    if (observation.missionId && observation.missionId !== missionId) return false;
    if (!predicate(observation)) return false;
    if (firstMutation?.sequence && observation.sequence) return observation.sequence < firstMutation.sequence;
    return (observation.configurationChanges ?? 0) < (firstMutation?.configurationChanges ?? state.configurationChanges ?? 0);
  });
}

export function wasObservedAtCurrentRevision(state, predicate, missionId = state.currentQuestId) {
  return (state.observations ?? []).some((observation) =>
    (!observation.missionId || observation.missionId === missionId) &&
    predicate(observation) &&
    (observation.configurationChanges ?? 0) === (state.configurationChanges ?? 0)
  );
}

export function wasCurrentObservationBeforeSave(state, predicate, missionId = state.currentQuestId) {
  const matching = (state.observations ?? []).filter((observation) =>
    (!observation.missionId || observation.missionId === missionId) &&
    predicate(observation) &&
    (observation.configurationChanges ?? 0) === (state.configurationChanges ?? 0)
  );
  if (matching.length === 0 || state.saved !== true) return false;
  if (!Number.isInteger(state.lastSavedSequence)) return true;
  return matching.some((observation) => Number.isInteger(observation.sequence) && observation.sequence < state.lastSavedSequence);
}

export function isCurrentConfigurationSaved(state) {
  return state.saved === true && (
    !Number.isInteger(state.lastSavedConfigurationChanges) ||
    state.lastSavedConfigurationChanges === (state.configurationChanges ?? 0)
  );
}

export function hasUnrelatedInterfaceMutation(state, allowedInterfaces, missionId = state.currentQuestId) {
  const allowed = new Set(allowedInterfaces);
  return getMissionMutations(state, missionId).some((entry) =>
    entry.targetType === 'interface' && !allowed.has(entry.target)
  );
}
