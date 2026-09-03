export const mission3 = {
  id: 'mission-3',
  requires: 'mission-2',
  name: 'Relocated Printer Recovery',
  completionEmailId: 'mission3-debrief',
  completionMessage: 'Relocated Printer Recovery',
  rewardXp: 100,
  rewardCredits: 25,
  title: 'Quest: Relocated Printer Recovery',
  description:
    'A department printer stopped working after an office move. Facilities confirms it is now connected to a spare jack, but the network configuration stayed behind.',
  objectives: [
    { id: 'investigate-printer-outage', text: 'Investigate the printer outage' },
    { id: 'locate-new-printer-connection', text: 'Locate the printer\'s new connection' },
    { id: 'restore-printer-service', text: 'Restore network service to the printer' },
    { id: 'verify-printer-repair', text: 'Verify the repair' }
  ],
  hiddenObjectives: [
    { id: 'document-printer-port', text: 'Document the printer port' },
    { id: 'save', text: 'Save the configuration' }
  ],
  hint: 'Start with interface status. A moved device leaves an old connection behind and appears on a different physical port.',
  hints: [
    'Start with show interfaces status and look for the disconnected printer port and newly connected spare jack.',
    'The old known-good printer port is Gi1/0/6. The newly connected spare jack is Gi1/0/13.',
    'Inspect both interfaces. The old printer configuration is your known-good comparison.',
    'Configure Gi1/0/13 like the known-good printer port: access mode, DATA VLAN 10, and a useful printer/location description.',
    'Use interface Gi1/0/13, switchport mode access, switchport access vlan 10, and description Records Printer, then verify and save.'
  ],
  notes: [
    'Switch: D8SW1',
    'Use interface status and descriptions to identify the moved printer connection.',
    'Printer network: DATA VLAN 10'
  ]
};
