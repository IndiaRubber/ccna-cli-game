import { GameState } from './state.js';

function normalizeInterfaceName(input = '') {
  const compact = input.toLowerCase().replace(/\s+/g, '');
  const match = compact.match(/^(?:g0\/|gi1\/0\/|gigabitethernet1\/0\/)(\d{1,2})$/);

  if (!match) return null;

  const portNumber = Number(match[1]);
  if (portNumber < 1 || portNumber > 24) return null;

  return `g0/${portNumber}`;
}

export function cmdEnable() {
  if (GameState.mode === 'user') {
    GameState.mode = 'privileged';
    return { success: null };
  }

  if (GameState.mode === 'privileged') return { success: null };

  return { error: '% Command rejected: already in privileged mode.' };
}

export function cmdConfigureTerminal() {
  if (GameState.mode === 'privileged') {
    GameState.mode = 'global';
    return { success: 'Enter configuration commands, one per line. End with CNTL/Z.' };
  }

  return { error: '% Invalid command from the current mode.' };
}

export function cmdHostname(command) {
  if (GameState.mode !== 'global') {
    return { error: '% Command rejected: enter global configuration mode first.' };
  }

  GameState.hostname =
    command.split(/\s+/)[1] || GameState.hostname;
}

export function cmdVlan(command) {
  if (GameState.mode !== 'global') {
    return { error: '% Command rejected: enter global configuration mode first.' };
  }

  const vlanId = command.split(/\s+/)[1];

  if (!/^\d+$/.test(vlanId) || Number(vlanId) < 1 || Number(vlanId) > 4094) {
    return { error: '% Invalid VLAN ID. Valid range is 1-4094.' };
  }

  GameState.vlans[vlanId] =
    GameState.vlans[vlanId] || { name: `VLAN${vlanId}` };

  GameState.currentVlan = vlanId;
  GameState.mode = 'vlan';
}

export function cmdVlanName(command) {
  if (GameState.mode !== 'vlan') {
    return { error: '% Command rejected: not in VLAN configuration mode.' };
  }

  const name = command.substring(5).trim().toUpperCase();

  GameState.vlans[GameState.currentVlan].name = name;
}

export function cmdExit() {
  if (
    GameState.mode === 'vlan' ||
    GameState.mode === 'interface'
  ) {
    GameState.mode = 'global';
  } else if (GameState.mode === 'global') {
    GameState.mode = 'privileged';
  } else if (GameState.mode === 'privileged') {
    GameState.mode = 'user';
  }
}

export function cmdEnd() {
  if (
    GameState.mode === 'global' ||
    GameState.mode === 'vlan' ||
    GameState.mode === 'interface'
  ) {
    GameState.mode = 'privileged';
  }
}

export function cmdInterface(command) {
  if (GameState.mode !== 'global') {
    return { error: '% Command rejected: enter global configuration mode first.' };
  }

  const requestedName = command.split(/\s+/).slice(1).join('');
  const interfaceName = normalizeInterfaceName(requestedName);

  if (!interfaceName || !GameState.interfaces?.[interfaceName]) {
    return { error: `% Invalid interface type and number: ${requestedName}` };
  }

  GameState.currentInterface = interfaceName;
  GameState.mode = 'interface';

  return { success: null };
}

export function cmdSwitchportModeAccess() {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  intf.mode = 'access';

  return {
    success: 'Access mode configured.'
  };
}

export function cmdSwitchportAccessVlan(command) {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  const vlanId = command.split(/\s+/).pop();

  if (!GameState.vlans[vlanId]) {
    return {
      error: `% Access VLAN does not exist. Create VLAN ${vlanId} first.`
    };
  }

  intf.accessVlan = vlanId;

  return {
    success: `Interface ${GameState.currentInterface} assigned to VLAN ${vlanId}.`
  };
}

export function cmdSwitchportVoiceVlan(command) {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  const vlanId = command.split(/\s+/).pop();

  if (!GameState.vlans[vlanId]) {
    return { error: `% VLAN ${vlanId} does not exist.` };
  }

  intf.voiceVlan = vlanId;

  return {
    success: `Interface ${GameState.currentInterface} assigned to voice VLAN ${vlanId}.`
  };
}

export function cmdDescription(command) {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  const description = command.replace(/^description\s+/i, '').trim();

  if (!description) {
    return { error: '% Description cannot be empty.' };
  }

  intf.description = description;

  return {
    success: `Description set to "${description}".`
  };
}

export function cmdNoShutdown() {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  intf.shutdown = false;

  return {
    success: `Interface ${GameState.currentInterface} enabled.`
  };
}

export function cmdShutdown() {
  if (GameState.mode !== 'interface') {
    return { error: '% Command rejected: not in interface configuration mode.' };
  }

  const intf = GameState.interfaces[GameState.currentInterface];

  if (!intf) {
    return { error: '% No interface selected.' };
  }

  intf.shutdown = true;

  return {
    success: `Interface ${GameState.currentInterface} disabled.`
  };
}

export function cmdSaveConfig() {
  if (GameState.mode !== 'privileged') return;

  GameState.saved = true;

  return [
    'Building configuration...',
    '[OK]'
  ];
}

export function cmdShowVlanBrief() {
  if (GameState.mode !== 'privileged') return null;

  const lines = [
    'VLAN Name                             Status    Ports',
    '---- -------------------------------- --------- -------------------------------'
  ];

  const vlanIds = Object.keys(GameState.vlans || {}).sort(
    (a, b) => Number(a) - Number(b)
  );

  if (vlanIds.length === 0) {
    lines.push('1    default                          active');
    return lines;
  }

  for (const vlanId of vlanIds) {
    const vlan = GameState.vlans[vlanId] || {};
    const vlanName = String(vlan.name || `VLAN${vlanId}`);

    const ports = Object.entries(GameState.interfaces || {})
      .filter(([, intf]) => intf && String(intf.accessVlan) === String(vlanId))
      .map(([name]) => name)
      .join(', ');

    lines.push(
      `${String(vlanId).padEnd(4)} ${vlanName.padEnd(32)} active    ${ports}`
    );
  }

  return lines;
}

export function cmdShowRunningConfig() {
  if (GameState.mode === 'user') return null;

  const lines = [];

  lines.push(`hostname ${GameState.hostname}`);
  lines.push('');

  for (const [vlanId, vlan] of Object.entries(GameState.vlans)) {
    lines.push(`vlan ${vlanId}`);
    lines.push(` name ${vlan.name}`);
    lines.push('');
  }

  for (const [intName, intf] of Object.entries(GameState.interfaces || {})) {
    lines.push(`interface ${intf.displayName || intName}`);

    if (intf.description) {
      lines.push(` description ${intf.description}`);
    }

    if (intf.mode === 'access') {
      lines.push(' switchport mode access');
    }

    if (intf.accessVlan) {
      lines.push(` switchport access vlan ${intf.accessVlan}`);
    }

    if (intf.voiceVlan) {
      lines.push(` switchport voice vlan ${intf.voiceVlan}`);
    }

    if (intf.shutdown) {
      lines.push(' shutdown');
    }

    lines.push('');
  }

  return lines;
}

export function cmdShowInterfacesStatus() {
  if (GameState.mode === 'user') return null;

  const lines = [];

  lines.push('Port      Name               Status       Vlan       Duplex  Speed Type');
  lines.push('--------- ------------------ ------------ ---------- ------  ----- --------');

  for (const [intName, rawIntf] of Object.entries(GameState.interfaces || {})) {
    const intf = rawIntf || {};

    const port = String(intf.displayName || intName).padEnd(9);
    const name = String(intf.description || '').substring(0, 18).padEnd(18);
    const status = intf.shutdown
      ? 'disabled'
      : intf.linkUp
        ? 'connected'
        : 'notconnect';

    const vlanValue =
      intf.mode === 'trunk'
        ? 'trunk'
        : String(intf.accessVlan || '1');

    lines.push(
      `${port} ${name} ${status.padEnd(12)} ${vlanValue.padEnd(10)} ${(intf.duplex || 'auto').padEnd(6)} ${(intf.speed || 'auto').padEnd(6)} ${intf.mediaType || '10/100/1000BaseTX'}`
    );
  }

  return lines;
}
