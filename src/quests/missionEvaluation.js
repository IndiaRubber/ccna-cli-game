const DEFAULT_PERFECT_COMMENTS = [
  'I checked twice. You actually did everything correctly. ...Fine.',
  'No deductions. Try not to make this a personality trait.',
  'Clean investigation, clean change, clean verification. Disturbingly competent.'
];

export function evaluateMissionPerformance(definition, signals = {}) {
  const config = definition.evaluation ?? {};
  const maximumXp = config.maximumXp ?? definition.rewardXp ?? 0;
  const deductions = [];

  for (const criterion of config.criteria ?? []) {
    if (signals[criterion.id] === true) continue;
    deductions.push({
      id: criterion.id,
      amount: criterion.deduction,
      label: criterion.label,
      feedback: criterion.feedback
    });
  }

  for (const mistake of config.mistakes ?? []) {
    if (signals[mistake.id] !== true) continue;
    deductions.push({
      id: mistake.id,
      amount: mistake.deduction,
      label: mistake.label,
      feedback: mistake.feedback
    });
  }

  const totalDeductions = deductions.reduce((sum, deduction) => sum + deduction.amount, 0);
  const awardedXp = Math.max(0, maximumXp - totalDeductions);
  const perfectComments = config.perfectComments ?? DEFAULT_PERFECT_COMMENTS;
  const missionNumber = Number.parseInt(definition.id.split('-').at(-1), 10);
  const perfectCommentIndex = Number.isInteger(missionNumber)
    ? missionNumber % perfectComments.length
    : 0;

  return {
    summary: config.summary ?? 'Service restored. Configuration saved.',
    maximumXp,
    awardedXp,
    totalDeductions,
    deductions,
    perfect: deductions.length === 0,
    supervisorComment: deductions.length === 0
      ? perfectComments[perfectCommentIndex]
      : config.reviewComment ?? 'Service is restored. The change record, however, has notes.'
  };
}

export function completeEvaluatedMission(state, definition, progress) {
  if (state.questCompleted) return null;

  const evaluation = evaluateMissionPerformance(definition, progress.evaluationSignals ?? {});
  state.questCompleted = true;
  state.xp = (state.xp ?? 0) + evaluation.awardedXp;
  state.credits = (state.credits ?? 0) + (definition.rewardCredits ?? 0);
  if (!state.missionEvaluations || typeof state.missionEvaluations !== 'object') {
    state.missionEvaluations = {};
  }
  state.missionEvaluations[definition.id] = {
    ...evaluation,
    creditsAwarded: definition.rewardCredits ?? 0
  };

  return state.missionEvaluations[definition.id];
}
