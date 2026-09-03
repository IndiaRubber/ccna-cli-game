export function getAutocomplete(input, mode) {
  const commandsByMode = {
    user: ['enable', 'help'],
    privileged: [
      'configure terminal',
      'show vlan brief',
      'show running-config',
      'show running-config interface',
      'show interfaces status',
      'show mac address-table',
      'show mac address-table address',
      'show mac address-table interface',
      'show mac address-table vlan',
      'show power inline',
      'show power inline interface',
      'show environment',
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
      'power inline auto',
      'power inline never',
      'exit',
      'help'
    ],
  };

  const commands = commandsByMode[mode] || [];
  const normalizedInput = input.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalizedInput) return null;

  const inputTokens = normalizedInput.split(' ');

  const exactMatch = commands.find((command) => command === normalizedInput);
  if (exactMatch) return exactMatch;

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
