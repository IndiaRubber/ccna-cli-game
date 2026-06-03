export function createD8SW1() {
  return {
    mode: 'user',
    hostname: 'D8SW1',
    model: 'Cisco Catalyst 2960X-24PS-L',
    district: 8,

    management: {
      vlan: '99',
      ip: '10.8.99.2',
      mask: '255.255.255.0',
      gateway: '10.8.99.1'
    },

    vlans: {
      '10': { name: 'DATA' },
      '20': { name: 'VOICE' },
      '99': { name: 'MGMT' }
    },

    interfaces: {
      'g0/1': {
        description: 'Uplink to D8CORE1',
        mode: 'trunk',
        accessVlan: null,
        voiceVlan: null,
        shutdown: false
      },

      'g0/2': {
        description: 'Office 1A Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/3': {
        description: 'Office 1B Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/4': {
        description: 'Accounting Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/5': {
        description: 'Reception Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/6': {
        description: 'Lobby Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/7': {
        description: 'Conference Room Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/8': {
        description: 'AP-D8-01',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/9': {
        description: 'ERR-DISABLED - Water Damage',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      },

      'g0/10': {
        description: 'Facilities Office Workstation',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/11': {
        description: 'Office 4A Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/12': {
        description: 'Office 4B New Hire - Pending Setup',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: false
      },

      'g0/13': {
        description: 'Spare Office Jack',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: false
      },

      'g0/14': {
        description: 'Timeclock Terminal',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/15': {
        description: 'Records Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/16': {
        description: 'Breakroom Wall Jack',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/17': {
        description: 'Badge Reader Controller',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/18': {
        description: 'FLAPPING LINK - Facilities Pending',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      },

      'g0/19': {
        description: 'Security Camera Front Door',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/20': {
        description: 'Security Camera Rear Door',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/21': {
        description: 'Warehouse Scanner Station',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        shutdown: false
      },

      'g0/22': {
        description: 'Shipping Office Workstation',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        shutdown: false
      },

      'g0/23': {
        description: 'Reserved Maintenance Laptop',
        mode: 'access',
        accessVlan: '99',
        voiceVlan: null,
        shutdown: false
      },

      'g0/24': {
        description: 'Secondary Uplink - Disabled',
        mode: 'trunk',
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      }
    },

    currentVlan: null,
    currentInterface: null,
    saved: false,
    xp: 0,
    questCompleted: false
  };
}