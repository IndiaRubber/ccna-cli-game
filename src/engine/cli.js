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
  cmdShowRunningConfigInterface,
  cmdShowInterfacesStatus
} from './commands.js';
import { GameState } from './state.js';

import { triggerHeliosCommandComment } from '../systems/heliosCommandCommentary.js';

function abbreviates(token, word, minimumLength = 1) {
  return token.length >= minimumLength && word.startsWith(token);
}

function matches(tokens, words) {
  return tokens.length === words.length && tokens.every(
    (token, index) => abbreviates(token, words[index])
  );
}

function normalizeCommand(command, mode = GameState.mode) {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();
  const tokens = lower.split(/\s+/);

  // Cisco's "do" prefix runs EXEC commands without leaving configuration mode.
  if (tokens[0] === 'do' && tokens.length > 1) {
    return normalizeCommand(trimmed.replace(/^do\s+/i, ''), 'privileged');
  }

  if (mode === 'user' && tokens.length === 1 && abbreviates(tokens[0], 'enable')) {
    return 'enable';
  }

  if (mode === 'privileged') {
    if (tokens.length === 1 && abbreviates(tokens[0], 'enable', 2)) return 'enable';
    if (matches(tokens, ['configure', 'terminal'])) return 'configure terminal';
    if (tokens.length === 1 && abbreviates(tokens[0], 'configure', 3)) {
      return 'configure terminal';
    }
    if (tokens.length === 1 && abbreviates(tokens[0], 'write', 1)) {
      return 'write memory';
    }
    if (matches(tokens, ['write', 'memory'])) return 'write memory';
    if (matches(tokens, ['copy', 'running-config', 'startup-config'])) {
      return 'copy running-config startup-config';
    }

    if (tokens.length >= 2 && abbreviates(tokens[0], 'show')) {
      if (abbreviates(tokens[1], 'interfaces')) {
        if (
          tokens.length === 2 ||
          (tokens.length === 3 && (
            abbreviates(tokens[2], 'status') || abbreviates(tokens[2], 'brief')
          ))
        ) {
          return 'show interfaces status';
        }
      }

      if (abbreviates(tokens[1], 'vlan')) {
        if (tokens.length === 2 || (
          tokens.length === 3 && abbreviates(tokens[2], 'brief')
        )) {
          return 'show vlan brief';
        }
      }

      if (abbreviates(tokens[1], 'running-config', 1)) {
        if (tokens.length === 2) return 'show running-config';
        if (
          tokens.length >= 4 &&
          abbreviates(tokens[2], 'interface')
        ) {
          return `show running-config interface ${tokens.slice(3).join('')}`;
        }
      }
    }
  }

  if (mode === 'global') {
    if (tokens.length >= 2 && abbreviates(tokens[0], 'hostname')) {
      return `hostname ${trimmed.split(/\s+/).slice(1).join(' ')}`;
    }
    if (tokens.length === 2 && abbreviates(tokens[0], 'vlan')) {
      return `vlan ${tokens[1]}`;
    }
    if (tokens.length >= 2 && abbreviates(tokens[0], 'interface')) {
      return `interface ${tokens.slice(1).join('')}`;
    }
  }

  if (mode === 'vlan' && tokens.length >= 2 && abbreviates(tokens[0], 'name')) {
    return `name ${trimmed.split(/\s+/).slice(1).join(' ')}`;
  }

  if (mode === 'interface') {
    if (
      tokens.length === 3 &&
      matches(tokens, ['switchport', 'mode', 'access'])
    ) {
      return 'switchport mode access';
    }
    if (
      tokens.length === 4 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'access') &&
      abbreviates(tokens[2], 'vlan')
    ) {
      return `switchport access vlan ${tokens[3]}`;
    }
    if (
      tokens.length === 4 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'voice') &&
      abbreviates(tokens[2], 'vlan')
    ) {
      return `switchport voice vlan ${tokens[3]}`;
    }
    if (tokens.length >= 2 && abbreviates(tokens[0], 'description', 3)) {
      return `description ${trimmed.split(/\s+/).slice(1).join(' ')}`;
    }
    if (matches(tokens, ['no', 'shutdown'])) return 'no shutdown';
    if (tokens.length === 1 && abbreviates(tokens[0], 'shutdown', 2)) {
      return 'shutdown';
    }
  }

  if (tokens.length === 1 && abbreviates(tokens[0], 'exit', 2)) return 'exit';
  if (tokens.length === 1 && abbreviates(tokens[0], 'end', 3)) return 'end';
  if (tokens.length === 1 && abbreviates(tokens[0], 'help')) return 'help';

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
    return false;
  }

  if (Array.isArray(output)) {
    output.forEach(line => uiPrint(line));
    uiPrint();
    return true;
  }

  uiPrint(String(output));
  uiPrint();
  return true;
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

function commentOnCommand(command) {
  triggerHeliosCommandComment(command);
}

function tokenSpans(rawCommand) {
  const spans = [];
  const matcher = /\S+/g;
  let match;

  while ((match = matcher.exec(rawCommand)) !== null) {
    spans.push({
      text: match[0].toLowerCase(),
      start: match.index,
      end: matcher.lastIndex
    });
  }

  return spans;
}

function tokenMatches(span, word, minimumLength = 1) {
  return span && abbreviates(span.text, word, minimumLength);
}

export function getInvalidCommandPosition(rawCommand, mode = GameState.mode) {
  const spans = tokenSpans(rawCommand);
  if (spans.length === 0) return 0;

  const first = spans[0];
  const isShow = tokenMatches(first, 'show');
  const isConfig = tokenMatches(first, 'configure', 3);
  const isCopy = tokenMatches(first, 'copy', 3);
  const isSwitchport = tokenMatches(first, 'switchport');

  if (mode === 'user') {
    return tokenMatches(first, 'enable') || tokenMatches(first, 'help')
      ? (spans[1]?.start ?? rawCommand.length)
      : first.start;
  }

  if (isShow) {
    if (!spans[1]) return rawCommand.length;
    if (
      !tokenMatches(spans[1], 'interfaces') &&
      !tokenMatches(spans[1], 'vlan') &&
      !tokenMatches(spans[1], 'running-config')
    ) return spans[1].start;

    if (tokenMatches(spans[1], 'interfaces')) {
      if (!spans[2]) return rawCommand.length;
      return tokenMatches(spans[2], 'status') || tokenMatches(spans[2], 'brief')
        ? (spans[3]?.start ?? rawCommand.length)
        : spans[2].start;
    }

    if (tokenMatches(spans[1], 'vlan')) {
      if (!spans[2]) return rawCommand.length;
      return tokenMatches(spans[2], 'brief')
        ? (spans[3]?.start ?? rawCommand.length)
        : spans[2].start;
    }

    if (!spans[2]) return rawCommand.length;
    if (!tokenMatches(spans[2], 'interface')) return spans[2].start;
    return spans[3]?.start ?? rawCommand.length;
  }

  if (isConfig || isCopy) {
    if (!spans[1]) return rawCommand.length;
    const expected = isConfig ? 'terminal' : 'running-config';
    if (!tokenMatches(spans[1], expected)) return spans[1].start;
    if (isCopy) {
      if (!spans[2]) return rawCommand.length;
      if (!tokenMatches(spans[2], 'startup-config')) return spans[2].start;
      return spans[3]?.start ?? rawCommand.length;
    }
    return spans[2]?.start ?? rawCommand.length;
  }

  if (isSwitchport && mode === 'interface') {
    if (!spans[1]) return rawCommand.length;
    if (!tokenMatches(spans[1], 'mode') && !tokenMatches(spans[1], 'access') && !tokenMatches(spans[1], 'voice')) {
      return spans[1].start;
    }
    if (tokenMatches(spans[1], 'mode')) {
      if (!spans[2]) return rawCommand.length;
      return tokenMatches(spans[2], 'access')
        ? (spans[3]?.start ?? rawCommand.length)
        : spans[2].start;
    }
    if (!spans[2]) return rawCommand.length;
    if (!tokenMatches(spans[2], 'vlan')) return spans[2].start;
    return spans[3]?.start ?? rawCommand.length;
  }

  const knownRoots = mode === 'global'
    ? ['hostname', 'vlan', 'interface', 'exit', 'end', 'help']
    : mode === 'vlan'
      ? ['name', 'exit', 'end', 'help']
      : mode === 'interface'
        ? ['description', 'exit', 'end', 'switchport', 'shutdown', 'no', 'help']
        : ['enable', 'configure', 'copy', 'write', 'exit', 'end', 'help', 'show'];

  return knownRoots.some((root) => tokenMatches(first, root, root === 'exit' ? 2 : 1))
    ? (spans[1]?.start ?? rawCommand.length)
    : first.start;
}

export function formatInvalidCommand(rawCommand, mode = GameState.mode) {
  const position = getInvalidCommandPosition(rawCommand, mode);
  return {
    position,
    caret: `${' '.repeat(position)}^`
  };
}

export function getContextualHelp(rawCommand, mode) {
  const command = rawCommand.trim().toLowerCase().replace(/\s+/g, ' ');
  const tokens = command.split(' ');

  if (mode === 'interface') {
    if (
      tokens.length === 2 &&
      abbreviates(tokens[0], 'switchport') &&
      tokens[1] === '?'
    ) {
      return [
        '  access  Set access VLAN characteristics',
        '  mode    Set the switching mode of the interface',
        '  voice   Set voice VLAN characteristics'
      ];
    }

    if (
      tokens.length === 3 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'access') &&
      tokens[2] === '?'
    ) {
      return ['  vlan    Set VLAN when interface is in access mode'];
    }

    if (
      tokens.length === 4 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'access') &&
      abbreviates(tokens[2], 'vlan') &&
      tokens[3] === '?'
    ) {
      return ['  <1-4094>  VLAN ID'];
    }

    if (
      tokens.length === 3 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'mode') &&
      tokens[2] === '?'
    ) {
      return ['  access  Set the interface to access mode'];
    }

    if (
      tokens.length === 3 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'voice') &&
      tokens[2] === '?'
    ) {
      return ['  vlan    Set the voice VLAN'];
    }

    if (
      tokens.length === 4 &&
      abbreviates(tokens[0], 'switchport') &&
      abbreviates(tokens[1], 'voice') &&
      abbreviates(tokens[2], 'vlan') &&
      tokens[3] === '?'
    ) {
      return ['  <1-4094>  Voice VLAN ID'];
    }
  }

  return null;
}

export function runCommand(rawCommand) {
  const contextualHelp = rawCommand.trim().endsWith('?')
    ? getContextualHelp(rawCommand, GameState.mode)
    : null;

  if (contextualHelp) {
    printLines(contextualHelp);
    return;
  }

  const command = normalizeCommand(rawCommand, GameState.mode);
  const lower = command.toLowerCase();

  if (!command) return;

  if (lower === 'help' || lower === '?') {
    if (typeof window.CiscoUI?.showHelp === 'function') {
      window.CiscoUI.showHelp();
    }

    commentOnCommand(command);
    return;
  }

  if (lower === 'enable') {
    const result = cmdEnable();
    if (printResult(result)) commentOnCommand(command);
    return;
  }

  if (lower === 'configure terminal') {
    const result = cmdConfigureTerminal();
    if (printResult(result)) commentOnCommand(command);
    return;
  }

  if (lower === 'end') {
    cmdEnd();
    commentOnCommand(command);
    return;
  }

  if (lower === 'exit') {
    cmdExit();
    commentOnCommand(command);
    return;
  }

  if (lower === 'show interfaces status') {
    const output = cmdShowInterfacesStatus();

    if (printLines(output)) {
      commentOnCommand(command);
    }

    return;
  }

  if (lower === 'show vlan brief') {
    const output = cmdShowVlanBrief();

    if (printLines(output)) {
      commentOnCommand(command);
    }

    return;
  }

  if (lower.startsWith('show running-config interface ')) {
    const output = cmdShowRunningConfigInterface(command);

    if (output?.error) {
      printResult(output);
    } else if (printLines(output)) {
      updateObjectivesSafely();
      if (typeof window.CiscoUI?.persistProgress === 'function') {
        window.CiscoUI.persistProgress();
      }
      commentOnCommand('show running-config');
    }

    return;
  }

  if (lower === 'show running-config') {
    const output = cmdShowRunningConfig();

    if (printLines(output)) {
      commentOnCommand(command);
    }

    return;
  }

  if (lower.startsWith('hostname ')) {
    const result = cmdHostname(command);
    if (printResult(result)) commentOnCommand(command);
    return;
  }

  if (lower.startsWith('vlan ')) {
    const result = cmdVlan(command);
    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }
    return;
  }

  if (lower.startsWith('name ')) {
    const result = cmdVlanName(command);
    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }
    return;
  }

  if (lower.startsWith('interface ')) {
    const result = cmdInterface(command);
    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }
    return;
  }

  if (lower === 'switchport mode access') {
    const result = cmdSwitchportModeAccess();

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (lower.startsWith('switchport access vlan ')) {
    const result = cmdSwitchportAccessVlan(command);

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (lower.startsWith('switchport voice vlan ')) {
    const result = cmdSwitchportVoiceVlan(command);

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (lower.startsWith('description ')) {
    const result = cmdDescription(command);

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (lower === 'no shutdown') {
    const result = cmdNoShutdown();

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (lower === 'shutdown') {
    const result = cmdShutdown();

    if (printResult(result)) {
      updateObjectivesSafely();
      commentOnCommand(command);
    }

    return;
  }

  if (
    lower === 'copy running-config startup-config' ||
    lower === 'write memory'
  ) {
    const output = cmdSaveConfig();

    if (printLines(output, '% Save failed: you must be in privileged EXEC mode.')) {
      updateObjectivesSafely();

      if (typeof window.CiscoUI?.persistProgress === 'function') {
        window.CiscoUI.persistProgress();
      }

      commentOnCommand(command);
    }

    return;
  }

  const invalid = formatInvalidCommand(rawCommand, GameState.mode);
  if (typeof window.CiscoUI?.writeCaret === 'function') {
    window.CiscoUI.writeCaret(invalid.position);
  } else {
    uiPrint(rawCommand);
    uiPrint(invalid.caret);
  }
  uiPrint(`% Invalid input detected at '^' marker.`);
}
