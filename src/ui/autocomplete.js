export function getAutocomplete(input, mode) {
  const commandsByMode = {
    user: ['enable', 'help'],
    privileged: [
      'configure terminal',
      'show vlan brief',
      'show running-config',
      'show running-config interface',
      'show interfaces status',
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
      'switchport voice vlan',
      'description',
      'no shutdown',
      'shutdown',
      'exit',
      'help'
    ],
  };

  const commands = commandsByMode[mode] || [];
  const normalizedInput = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalizedInput) return null;

  const inputTokens = normalizedInput.split(' ');

  const tokenMatches = (command) => {
    const commandTokens = command.split(' ');

    if (inputTokens.length > commandTokens.length) return false;

    return inputTokens.every((token, index) =>
      commandTokens[index].startsWith(token)
    );
  };

  const matches = commands.filter(tokenMatches);

  if (matches.length === 1) return matches[0];

  return null;
}
