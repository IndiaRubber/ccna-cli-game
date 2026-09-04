export const mission4 = {
  id: 'mission-4',
  requires: 'mission-3',
  name: 'Warehouse Endpoint Trace',
  completionEmailId: 'mission4-debrief',
  completionMessage: 'Warehouse Endpoint Trace',
  rewardXp: 100,
  rewardCredits: 25,
  evaluation: {
    maximumXp: 100,
    summary: 'Endpoint documented. Existing service preserved. Configuration saved.',
    criteria: [
      { id: 'macEvidenceReviewed', deduction: 15, label: 'The scanner location was not confirmed from switch evidence.', feedback: 'The correct port was selected. The audit trail would like to know why.' },
      { id: 'preChangeInspection', deduction: 10, label: 'The target interface was not inspected before editing.', feedback: 'Working service is a poor place for speculative changes.' },
      { id: 'postChangeVerification', deduction: 10, label: 'The final scanner port was not verified.', feedback: 'Documentation changes are still changes.' },
      { id: 'verifiedBeforeSave', deduction: 10, label: 'The configuration was saved before final verification.', feedback: 'The typo, if any, has now been made durable.' }
    ],
    mistakes: [
      { id: 'causedAdditionalOutage', deduction: 20, label: 'Working scanner service was disrupted during documentation.', feedback: 'The assignment was to improve the record, not make the record briefly accurate about an outage.' },
      { id: 'unrelatedInterfaceModified', deduction: 25, label: 'An unrelated interface was modified.', feedback: 'The MAC table pointed at one port. Creativity was unnecessary.' }
    ]
  },
  title: 'Quest: Warehouse Endpoint Trace',
  description:
    'Warehouse support has a scanner that is online, but the switchport records are incomplete. Use its MAC address to identify and document the active connection without disturbing working service.',
  objectives: [
    { id: 'investigate-warehouse-endpoint', text: 'Investigate the warehouse endpoint record' },
    { id: 'locate-scanner-connection', text: 'Locate the scanner\'s switch connection' },
    { id: 'document-scanner-port', text: 'Document the scanner switchport' },
    { id: 'verify-scanner-connection', text: 'Verify the documented connection' },
    { id: 'save', text: 'Save the configuration' }
  ],
  hint: 'The scanner is working. Use its MAC address to find which switch interface learned it before changing anything.',
  hints: [
    'The switch can tell you where it learned a device MAC address.',
    'Inspect the MAC address table for the warehouse scanner.',
    'You already know the scanner MAC: 00aa.bbcc.dd21.',
    'Use show mac address-table address 00aa.bbcc.dd21 to locate the interface.',
    'Inspect the resulting interface, correct only its documentation, verify, and save.'
  ],
  notes: [
    'Switch: D8SW1',
    'Scanner MAC: 00aa.bbcc.dd21',
    'The scanner should remain operational on access VLAN 10.',
    'The final interface description must include both warehouse and scanner.'
  ]
};
