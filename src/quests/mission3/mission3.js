export const mission3 = {
  id: 'mission-3',
  requires: 'mission-2',
  name: 'Relocated Printer Recovery',
  completionEmailId: 'mission3-debrief',
  completionMessage: 'Relocated Printer Recovery',
  rewardXp: 100,
  rewardCredits: 25,
  evaluation: {
    maximumXp: 100,
    criteria: [
      { id: 'moveEvidenceReviewed', deduction: 10, label: 'The physical move evidence was not reviewed.', feedback: 'Facilities supplied clues. This is not a recurring courtesy.' },
      { id: 'knownGoodInspected', deduction: 10, label: 'The old known-good port was not inspected.', feedback: 'Known-good configurations are cheaper than inspired guessing.' },
      { id: 'newPortInspectedBeforeChange', deduction: 10, label: 'The new port was changed before it was inspected.', feedback: 'You repaired what you had not yet measured.' },
      { id: 'descriptionUpdated', deduction: 10, label: 'The printer location was not documented.', feedback: 'Apparently future technicians are expected to develop clairvoyance.' },
      { id: 'postChangeVerification', deduction: 10, label: 'The repaired port was not verified.', feedback: 'The printer works. The change record merely hopes so.' },
      { id: 'verifiedBeforeSave', deduction: 10, label: 'The configuration was saved before final verification.', feedback: 'Persistence is not a substitute for proof.' },
      { id: 'abandonedPortSecured', deduction: 5, label: 'The abandoned printer port remains enabled.', feedback: 'Service is restored. Cleanup has been donated to a future ticket.' }
    ],
    mistakes: [
      { id: 'unrelatedInterfaceModified', deduction: 25, label: 'An unrelated interface was modified.', feedback: 'The printer moved once. The outage did not need company.' }
    ]
  },
  title: 'Quest: Relocated Printer Recovery',
  description:
    'A department printer stopped working after an office move. Facilities confirms it is now connected to a spare jack, but the network configuration stayed behind.',
  objectives: [
    { id: 'investigate-printer-outage', text: 'Investigate the printer outage' },
    { id: 'locate-new-printer-connection', text: 'Locate the printer\'s new connection' },
    { id: 'restore-printer-service', text: 'Restore network service to the printer' },
    { id: 'verify-printer-repair', text: 'Verify the repair' }
  ],
  hiddenObjectives: [],
  hint: 'Start with interface status. A moved device leaves an old connection behind and appears on a different physical port.',
  hints: [
    'Start with show interfaces status and look for the disconnected printer port and newly connected spare jack.',
    'The old known-good printer port is Gi1/0/6. The newly connected spare jack is Gi1/0/13.',
    'Inspect both interfaces. The old printer configuration is your known-good comparison.',
    'After confirming the old port is no longer in use, consider shutting it down as operational cleanup.',
       'Configure Gi1/0/13 as an access port on the dedicated Printer VLAN 15, with a useful printer/location description.',
    'Configure Gi1/0/13 with switchport mode access and switchport access vlan 15. A Records Printer description, final verification, and old-port cleanup improve the change review. Save the working configuration.'
  ],
  notes: [
    'Switch: D8SW1',
    'Use interface status and descriptions to identify the moved printer connection.',
       'Printer network: PRINTER VLAN 15 (already present on D8SW1)',
     'The new port description must include printer and one location term: records, annex, or office.',
    'After confirming the move, shutting down abandoned Gi1/0/6 is recommended operational cleanup.'
  ]
};
