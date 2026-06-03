import {
  cmdEnable,
  cmdConfigureTerminal,
  cmdHostname,
  cmdExit,
  cmdEnd,
  cmdVlan,
  cmdVlanName,
  cmdInterface,
  cmdSwitchportModeAccess,
  cmdSwitchportAccessVlan,
  cmdSwitchportVoiceVlan,
  cmdDescription,
  cmdNoShutdown,
  cmdShutdown,
  cmdSaveConfig,
  cmdShowVlanBrief,
  cmdShowRunningConfig,
  cmdShowInterfacesStatus
} from './commands.js';

const commandAliases = {
  en: 'enable',

  'conf t': 'configure terminal',
  config: 'configure terminal',

  'sh vlan': 'show vlan brief',
  'sh vlan br': 'show vlan brief',
  'show vlan': 'show vlan brief',
  'show vlan br': 'show vlan brief',

  'show int status': 'show interfaces status',
  'sh int status': 'show interfaces status',
  'show interfaces brief': 'show interfaces status',
  'show int brief': 'show interfaces status',
  'sh int brief': 'show interfaces status',

  'show run': 'show running-config',
  'sh run': 'show running-config',

  wr: 'write memory',
  'copy run start': 'copy running-config startup-config',
  'copy run startup': 'copy running-config startup-config',

  'no shut': 'no shutdown',
  shut: 'shutdown'
};

function normalizeCommand(command) {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  if (commandAliases[lower]) {
    return commandAliases[lower];
  }

  // Allow Cisco-style "do" commands from config/interface mode.
  if (lower.startsWith('do ')) {
    return normalizeCommand(trimmed.substring(3));
  }

  if (lower.startsWith('int ')) {
    return trimmed.replace(/^int\s+/i, 'interface ');
  }

  if (lower.startsWith('desc ')) {
    return trimmed.replace(/^desc\s+/i, 'description ');
  }

  if (lower.startsWith('sw mode access')) {
    return trimmed.replace(/^sw\s+mode\s+access/i, 'switchport mode access');
  }

  if (lower.startsWith('sw access vlan ')) {
    return trimmed.replace(/^sw\s+access\s+vlan\s+/i, 'switchport access vlan ');
  }

  if (lower.startsWith('sw voice vlan ')) {
    return trimmed.replace(/^sw\s+voice\s+vlan\s+/i, 'switchport voice vlan ');
  }

  if (lower.startsWith('sw vo vl ')) {
    return trimmed.replace(/^sw\s+vo\s+vl\s+/i, 'switchport voice vlan ');
  }

  return trimmed;
}

function uiPrint(line = '') {
  if (typeof window.CiscoUI?.print === 'function') {
    window.CiscoUI.print(line);
    return;
  }

  console.warn('CiscoUI.print is not available yet:', line);
}

function printLines(output, unavailableMessage = '% Command not available in this mode.') {
  if (!output) {
    uiPrint(unavailableMessage);
    return;
  }

  if (Array.isArray(output)) {
    output.forEach(line => uiPrint(line));
    uiPrint();
    return;
  }

  uiPrint(String(output));
  uiPrint();
}

function printResult(result) {
  if (result?.error) {
    uiPrint(result.error);
    return false;
  }

  if (result?.success) {
    uiPrint(result.success);
  }

  return true;
}

function updateObjectivesSafely() {
  if (window.CiscoUI?.updateObjectives) {
    window.CiscoUI.updateObjectives();
  }
}

export function runCommand(rawCommand) {
  const command = normalizeCommand(rawCommand);
  const lower = command.toLowerCase();

  if (!command) return;

  if (lower === 'help' || lower === '?') {
    if (typeof window.CiscoUI?.showHelp === 'function') {
      window.CiscoUI.showHelp();
    }
    return;
  }

  if (lower === 'enable') {
    cmdEnable();
    return;
  }

  if (lower === 'configure terminal') {
    cmdConfigureTerminal();
    return;
  }

  if (lower === 'end') {
    cmdEnd();
    return;
  }

  if (lower === 'exit') {
    cmdExit();
    return;
  }

  if (lower === 'show interfaces status') {
    const output = cmdShowInterfacesStatus();
    printLines(output);
    return;
  }

  if (lower === 'show vlan brief') {
    const output = cmdShowVlanBrief();
    printLines(output);
    return;
  }

  if (lower === 'show running-config') {
    const output = cmdShowRunningConfig();
    printLines(output);
    return;
  }

  if (lower.startsWith('hostname ')) {
    cmdHostname(command);
    return;
  }

  if (lower.startsWith('vlan ')) {
    cmdVlan(command);
    updateObjectivesSafely();
    return;
  }

  if (lower.startsWith('name ')) {
    cmdVlanName(command);
    updateObjectivesSafely();
    return;
  }

  if (lower.startsWith('interface ')) {
    cmdInterface(command);
    updateObjectivesSafely();
    return;
  }

  if (lower === 'switchport mode access') {
    const result = cmdSwitchportModeAccess();

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (lower.startsWith('switchport access vlan ')) {
    const result = cmdSwitchportAccessVlan(command);

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (lower.startsWith('switchport voice vlan ')) {
    const result = cmdSwitchportVoiceVlan(command);

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (lower.startsWith('description ')) {
    const result = cmdDescription(command);

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (lower === 'no shutdown') {
    const result = cmdNoShutdown();

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (lower === 'shutdown') {
    const result = cmdShutdown();

    if (printResult(result)) {
      updateObjectivesSafely();
    }

    return;
  }

  if (
    lower === 'copy running-config startup-config' ||
    lower === 'write memory'
  ) {
    const output = cmdSaveConfig();
    printLines(output, '% Save failed: you must be in privileged EXEC mode.');
    updateObjectivesSafely();
    return;
  }

  uiPrint(`% Invalid input detected at '^' marker.`);
}