const autocompleteCommands = [
  'enable',
  'configure terminal',
  'hostname',
  'vlan',
  'name',
  'interface',
  'switchport mode access',
  'switchport access vlan',
  'show vlan brief',
  'copy running-config startup-config',
  'write memory',
  'exit',
  'help',
  'show running-config',
  'show run',
  'show interfaces status',
  'show int status',
];

export function getAutocomplete(input, mode) {
  const commandsByMode = {
    user: ['enable', 'help'],
    privileged: [
      'configure terminal',
      'show vlan brief',
      'show running-config',
      'write memory',
      'copy running-config startup-config',
      'exit',
      'help'
    ],
    global: ['hostname', 'vlan', 'interface', 'exit', 'help'],
    vlan: ['name', 'exit', 'help'],
    interface: [
      'switchport mode access',
      'switchport access vlan',
      'exit',
      'help'
    ],
  };

  const commands = commandsByMode[mode] || [];
  const lower = input.toLowerCase();

  const matches = commands.filter((cmd) => cmd.startsWith(lower));

  if (matches.length === 1) return matches[0];

  return null;
}