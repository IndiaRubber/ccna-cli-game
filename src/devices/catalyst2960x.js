function createInterface(portNumber, options = {}) {
  const shutdown = options.shutdown ?? false;

  return {
    displayName: `Gi1/0/${portNumber}`,
    description: options.description ?? '',
    mode: Object.hasOwn(options, 'mode') ? options.mode : 'access',
    accessVlan: Object.hasOwn(options, 'accessVlan') ? options.accessVlan : '1',
    voiceVlan: options.voiceVlan ?? null,
    shutdown,
    linkUp: shutdown ? false : (options.linkUp ?? false),
    duplex: options.duplex ?? 'a-full',
    speed: options.speed ?? 'a-1000',
    mediaType: '10/100/1000BaseTX'
  };
}

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
      '1': { name: 'default' },
      '10': { name: 'DATA' },
      '20': { name: 'VOICE' },
      '99': { name: 'MGMT' }
    },

    interfaces: {
      'g0/1': createInterface(1, {
        description: 'Uplink to D8CORE1',
        mode: 'trunk',
        accessVlan: null,
        linkUp: true
      }),

      'g0/2': createInterface(2, {
        description: 'Office 1A Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/3': createInterface(3, {
        description: 'Office 1B Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/4': createInterface(4, {
        description: 'Accounting Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/5': createInterface(5, {
        description: 'Reception Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/6': createInterface(6, {
        description: 'Lobby Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/7': createInterface(7, {
        description: 'Conference Room Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/8': createInterface(8, {
        description: 'AP-D8-01',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/9': createInterface(9, {
        description: 'ERR-DISABLED - Water Damage',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      }),

      'g0/10': createInterface(10, {
        description: 'Facilities Office Workstation',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/11': createInterface(11, {
        description: 'Office 4A Workstation + Phone',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/12': createInterface(12, {
        description: 'Office 4B New Hire - Pending Setup',
        mode: null,
        accessVlan: '1',
        linkUp: true
      }),

      'g0/13': createInterface(13, {
        description: 'Spare Office Jack',
        linkUp: false
      }),

      'g0/14': createInterface(14, {
        description: 'Timeclock Terminal',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/15': createInterface(15, {
        description: 'Records Printer',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/16': createInterface(16, {
        description: 'Breakroom Wall Jack',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: false
      }),

      'g0/17': createInterface(17, {
        description: 'Badge Reader Controller',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/18': createInterface(18, {
        description: 'FLAPPING LINK - Facilities Pending',
        mode: null,
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      }),

      'g0/19': createInterface(19, {
        description: 'Security Camera Front Door',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/20': createInterface(20, {
        description: 'Security Camera Rear Door',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/21': createInterface(21, {
        description: 'Warehouse Scanner Station',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: null,
        linkUp: true
      }),

      'g0/22': createInterface(22, {
        description: 'Shipping Office Workstation',
        mode: 'access',
        accessVlan: '10',
        voiceVlan: '20',
        linkUp: true
      }),

      'g0/23': createInterface(23, {
        description: 'Reserved Maintenance Laptop',
        mode: 'access',
        accessVlan: '99',
        voiceVlan: null,
        linkUp: false
      }),

      'g0/24': createInterface(24, {
        description: 'Secondary Uplink - Disabled',
        mode: 'trunk',
        accessVlan: null,
        voiceVlan: null,
        shutdown: true
      })
    },

    currentVlan: null,
    currentInterface: null,
    observations: [],
    configurationChanges: 0,
    saved: false,
    xp: 0,
    questCompleted: false
  };
}
