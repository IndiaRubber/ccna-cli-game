export const mission2 = {
  id: 'mission-2',
  requires: 'mission-1',
  name: 'Office 4B Phone Recovery',
  completionEmailId: 'mission2-debrief',
  completionMessage: 'Office 4B Phone Recovery',
  rewardXp: 100,
  rewardCredits: 25,
  title: 'Quest: Office 4B Phone Recovery',
  description:
    'The Office 4B workstation is online, but the desk phone is not registering. Investigate the existing switchport before making the smallest necessary correction.',

  objectives: [
    {
      id: 'investigate-phone-connectivity',
      text: 'Investigate the phone connectivity issue'
    },
    {
      id: 'correct-switchport-configuration',
      text: 'Correct the switchport configuration'
    },
    {
      id: 'verify-phone-operational',
      text: 'Verify that the phone is operational'
    }
  ],

  hiddenObjectives: [
    {
      id: 'save',
      text: 'Save the configuration'
    }
  ],

  hint: 'The working workstation is useful evidence. Inspect the existing interface configuration before changing it.',

  hints: [
    'The workstation is online, so the physical link and data configuration are probably not the first suspects.',
    'A phone and workstation can share one switchport while using separate logical networks.',
    'Inspect Gi1/0/12 and compare its access VLAN configuration with its voice configuration.',
    'In interface configuration mode, try switchport ? if you remember the start of the command.',
    'Configure switchport voice vlan 20 on Gi1/0/12, verify the interface configuration, then save.'
  ],

  notes: [
    'District: 8',
    'Switch: D8SW1',
    'Location: Office 4B',
    'Interface: Gi1/0/12',
    'DATA VLAN: 10',
    'VOICE VLAN: 20',
    'The workstation currently has normal network connectivity.'
  ]
};
