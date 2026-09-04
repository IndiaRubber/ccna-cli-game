export const mission5 = {
  id: 'mission-5',
  requires: 'mission-4',
  name: 'Rear Door Blind Spot',
  completionEmailId: 'mission5-debrief',
  completionMessage: 'Rear Door Blind Spot',
  rewardXp: 100,
  rewardCredits: 25,
  evaluation: {
    maximumXp: 100,
    criteria: [
      { id: 'environmentChecked', deduction: 10, label: 'Switch environmental health was not confirmed.', feedback: 'A shared hardware failure was worth eliminating before touching the port.' },
      { id: 'powerFaultObserved', deduction: 15, label: 'The failed power state was not observed before repair.', feedback: 'You fixed the symptom before establishing the fault.' },
      { id: 'postChangeVerification', deduction: 15, label: 'Restored power and connectivity were not verified.', feedback: 'The camera may be online. The evidence remained offline.' },
      { id: 'verifiedBeforeSave', deduction: 10, label: 'The configuration was saved before final verification.', feedback: 'Saved confidence is still confidence.' }
    ],
    mistakes: [
      { id: 'unrelatedInterfaceModified', deduction: 25, label: 'An unrelated interface was modified.', feedback: 'The rear camera failed. The rest of the building had not volunteered.' }
    ]
  },
  title: 'Quest: Rear Door Blind Spot',
  description:
    'The rear-door security camera is offline, but the front-door camera remains operational. Confirm the switch is healthy, determine why the rear camera has lost service, restore connectivity, verify the result, and save the configuration.',
  objectives: [
    { id: 'investigate-camera-outage', text: 'Investigate the rear-door camera outage' },
    { id: 'confirm-environment-health', text: 'Confirm switch environmental health' },
    { id: 'identify-power-fault', text: 'Identify the camera power fault' },
    { id: 'restore-camera-service', text: 'Restore rear-door camera service' },
    { id: 'verify-power-connectivity', text: 'Verify power and connectivity' },
    { id: 'save', text: 'Save the configuration' }
  ],
  hiddenObjectives: [],
  hint: 'Compare the two camera connections. The front camera is still online, so inspect the switch and its per-interface power state before changing anything.',
  hints: [
    'Compare what the switch reports for the two camera ports.',
    'Confirm the switch itself is healthy before blaming the camera hardware.',
    'show environment reports switch-wide hardware health.',
    'Some network devices receive electrical power through Ethernet.',
    'The switch tracks that power per interface.',
    'Compare the cameras with show power inline.',
    'Restore automatic inline power on Gi1/0/20, verify, and save.'
  ],
  notes: [
    'Switch: D8SW1',
    'Known-good comparison: Gi1/0/19, Security Camera Front Door',
    'Target: Gi1/0/20, Security Camera Rear Door',
    'Facilities confirms the rear camera remains physically connected.'
  ]
};
