export const mission0 = {
  id: 'mission-0',
  requires: null,
  name: 'First Day: Office 4B Observation',
  completionEmailId: 'mission0-debrief',
  completionMessage: 'First Day: Office 4B Observation',
  completionHeliosMessage: 'Nothing changed, and that is the point. We verified the physical path before touching the configuration.',
  rewardXp: 50,
  rewardCredits: 10,
  evaluation: {
    maximumXp: 50,
    summary: 'Physical connection identified. No configuration changed.',
    criteria: [],
    mistakes: [],
    perfectComments: ['Nothing changed, the connection was identified, and the evidence survived contact with the ticket. Acceptable.']
  },
  title: 'Mission 0: First Day Observation',
  description:
    'Facilities says the new Office 4B workstation is physically connected. Inspect D8SW1 and identify the switch interface before anyone changes its configuration.',
  objectives: [
    { id: 'review-office4b-assignment', text: 'Review the Office 4B assignment' },
    { id: 'inspect-switch', text: 'Inspect the switch' },
    { id: 'identify-office4b-interface', text: 'Identify the interface connected to Office 4B' },
    { id: 'confirm-office4b-finding', text: 'Confirm the finding' }
  ],
  hiddenObjectives: [],
  hint: 'Before changing anything, use enable and show interfaces status to see what D8SW1 can observe.',
  hints: [
    'Before changing anything, use enable and show interfaces status to see what D8SW1 can observe.',
    'Each row represents a switch interface. Look for a connected description mentioning Office 4B.',
    'The Office 4B connection is Gi1/0/12.'
  ],
  notes: [
    'Switch: D8SW1',
    'Location: IDF-3A',
    'Assignment: verify the physical Office 4B connection before activation.',
    'The observed interface description must mention Office 4B.'
  ]
};
