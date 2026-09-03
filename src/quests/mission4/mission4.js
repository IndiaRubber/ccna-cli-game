export const mission4 = {
  id: 'mission-4',
  requires: 'mission-3',
  name: 'Warehouse Endpoint Trace',
  completionEmailId: 'mission4-debrief',
  completionMessage: 'Warehouse Endpoint Trace',
  rewardXp: 100,
  rewardCredits: 25,
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
    'The scanner should remain operational on access VLAN 10.'
  ]
};
