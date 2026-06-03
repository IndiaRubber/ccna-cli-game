export const mission1 = {
  id: 'mission-1',
  title: 'Quest: New Hire Port Activation',
  description:
    'A new hire is starting in Office 4B. Find the correct switchport, configure their workstation network access, then save your work.',

  objectives: [
    {
      id: 'identify-office4b-port',
      text: 'Identify the Office 4B switchport'
    },
    {
      id: 'g012-mode-access',
      text: 'Configure the Office 4B port as an access port'
    },
    {
      id: 'g012-access-vlan10',
      text: 'Assign the Office 4B port to DATA VLAN 10'
    },
    {
      id: 'g012-description',
      text: 'Update the Office 4B port description'
    },
    {
      id: 'save',
      text: 'Save the configuration'
    }
  ],

  hiddenObjectives: [
    {
      id: 'g012-voice-vlan20',
      text: 'Hidden Objective: Assign the Office 4B port to VOICE VLAN 20'
    }
  ],

  hint:
    'Use show interfaces status to identify the correct port. Look for Office 4B in the interface descriptions.',

  notes: [
    'District: 8',
    'Switch: D8SW1',
    'Model: Cisco Catalyst 2960X-24PS-L',
    'Ticket location: Office 4B',
    'DATA VLAN: 10',
    'VOICE VLAN: 20',
    'MGMT VLAN: 99',
    'D8SW1 management IP: 10.8.99.2',
    'Default gateway: 10.8.99.1',
    'Uplink: g0/1 to D8CORE1',
    'Known bad port: g0/9 water damage',
    'Known bad port: g0/18 flapping link',
    'Do not use g0/23. It is reserved for maintenance access on VLAN 99.'
  ]
};