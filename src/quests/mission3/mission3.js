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
    { id: 'shutdown-old-printer-port', text: 'Shut down the abandoned printer port' },
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
    'After confirming the old port is no longer in use, enter interface Gi1/0/6 and shut it down.',
       'Configure Gi1/0/13 as an access port on the dedicated Printer VLAN 15, with a useful printer/location description.',
    'Use interface Gi1/0/6 with shutdown, then configure Gi1/0/13 with switchport mode access, switchport access vlan 15, and description Records Printer. Verify and save.'
  ],
  notes: [
    'Switch: D8SW1',
    'Use interface status and descriptions to identify the moved printer connection.',
       'Printer network: PRINTER VLAN 15 (already present on D8SW1)',
     'The new port description must include printer and one location term: records, annex, or office.',
    'After confirming the move, shut down the abandoned old port Gi1/0/6.'
  ]
};
