import { heliosSay } from './helios.js';
import { heliosCommandComments } from '../data/heliosCommandComments.js';

let lastCommentKey = null;
let lastCommentTime = 0;

const COMMENT_COOLDOWN_MS = 2500;

function pickRandom(lines) {
  return lines[Math.floor(Math.random() * lines.length)];
}

function getCommentKey(rawCommand) {
  const command = rawCommand.trim().toLowerCase();

  if (!command) return null;

  if (command === 'enable' || command === 'en') {
    return 'enable';
  }

  if (command === 'configure terminal' || command === 'conf t') {
    return 'configure terminal';
  }

  if (
    command === 'show vlan brief' ||
    command === 'sh vlan brief' ||
    command === 'sh vlan'
  ) {
    return 'show vlan brief';
  }

  if (
    command === 'show interfaces status' ||
    command === 'sh interfaces status' ||
    command === 'show int status' ||
    command === 'sh int status'
  ) {
    return 'show interfaces status';
  }

  if (
    command === 'show interfaces brief' ||
    command === 'sh interfaces brief' ||
    command === 'show int brief' ||
    command === 'sh int brief'
  ) {
    return 'show interfaces brief';
  }

  if (
    command === 'show running-config' ||
    command === 'show run' ||
    command === 'sh run'
  ) {
    return 'show running-config';
  }

  if (command === 'write memory' || command === 'wr') {
    return 'write memory';
  }

  if (
    command === 'copy running-config startup-config' ||
    command === 'copy run start'
  ) {
    return 'copy running-config startup-config';
  }

  if (command.startsWith('hostname ')) {
    return 'hostname';
  }

  if (command.startsWith('vlan ')) {
    return 'vlan';
  }

  if (command.startsWith('name ')) {
    return 'name';
  }

  if (command.startsWith('interface ')) {
    return 'interface';
  }

  if (command === 'switchport mode access') {
    return 'switchport mode access';
  }

  if (command.startsWith('switchport access vlan ')) {
    return 'switchport access vlan';
  }

  if (command.startsWith('switchport voice vlan ')) {
    return 'switchport voice vlan';
  }

  if (command.startsWith('description ')) {
    return 'description';
  }

  if (command === 'no shutdown' || command === 'no shut') {
    return 'no shutdown';
  }

  if (command === 'shutdown') {
    return 'shutdown';
  }

  if (command === 'exit') {
    return 'exit';
  }

  if (command === 'end') {
    return 'end';
  }

  if (command === 'help' || command === '?') {
    return 'help';
  }

  return null;
}

export function triggerHeliosCommandComment(rawCommand) {
  console.log('[HELIOS commentary] Raw command:', rawCommand);

  const now = Date.now();

  if (now - lastCommentTime < COMMENT_COOLDOWN_MS) {
    console.log('[HELIOS commentary] Cooldown active.');
    return;
  }

  const key = getCommentKey(rawCommand);

  console.log('[HELIOS commentary] Matched key:', key);

  if (!key) return;

  if (key === lastCommentKey) {
    console.log('[HELIOS commentary] Same command key as last time. Skipping.');
    return;
  }

  const comments = heliosCommandComments[key];

  console.log('[HELIOS commentary] Comments found:', comments);

  if (!comments?.length) return;

  lastCommentKey = key;
  lastCommentTime = now;

  const line = pickRandom(comments);

  console.log('[HELIOS commentary] Saying:', line);

  heliosSay(line);
}