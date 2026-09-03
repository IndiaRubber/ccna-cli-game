import {
  GameState,
  createGameStateSnapshot,
  resetGameState,
  restoreGameState
} from './engine/state.js';
import { runCommand } from './engine/cli.js';
import { getAutocomplete } from './ui/autocomplete.js';
import { createTerminal } from './ui/terminal.js';
import './style.css';

import { getMission } from './quests/missionRegistry.js';
import { renderObjectiveStates, renderQuest } from './quests/questEngine.js';
import { loadEmails, openEmail, resetEmailState } from './systems/emailSystem.js';
import { heliosSay, heliosSayRandom } from './systems/helios.js';
import { initDocsPanel, resetNotebook } from './ui/docsPanel.js';
import {
  resetMissionTutorial,
  resetNewGameTutorial,
  startNewGameTutorial,
  startMissionTutorial
} from './tutorial/newGameTutorial.js';

// ----------------------------
// Quest / Terminal Setup
// ----------------------------

let activeMission = getMission('mission-1');

if (!activeMission) {
  throw new Error('Mission 1 is not registered.');
}

renderQuest(activeMission.definition);

const terminalElement = document.getElementById('terminal');

let terminal = null;
let print = (...messages) => {
  console.log(...messages);
};

function prompt() {
  if (GameState.mode === 'user') return `${GameState.hostname}>`;
  if (GameState.mode === 'privileged') return `${GameState.hostname}#`;
  if (GameState.mode === 'global') return `${GameState.hostname}(config)#`;
  if (GameState.mode === 'vlan') return `${GameState.hostname}(config-vlan)#`;
  if (GameState.mode === 'interface') return `${GameState.hostname}(config-if)#`;

  return `${GameState.hostname}>`;
}

function initializeTerminal() {
  if (terminal) {
    window.dispatchEvent(new Event('resize'));
    return;
  }

  terminal = createTerminal({
    terminalElement,
    getPrompt: prompt,
    runCommand,
    getAutocomplete: (input) => getAutocomplete(input, GameState.mode)
  });

  print = terminal.print;

  window.CiscoUI = {
    print,
    showHelp,
    updateObjectives,
    persistProgress: saveProgressToLocalStorage,
    writeCaret: terminal.writeCaret
  };

  heliosSayRandom('terminalInitial', 'ai-message');
}

window.CiscoUI = {
  print,
  showHelp: () => {},
  updateObjectives: () => {},
  persistProgress: () => {}
};

function showHelp() {
  print('Available commands:');
  print('  enable');
  print('  configure terminal');
  print('  interface gi1/0/12');
  print('  switchport mode access');
  print('  switchport access vlan NUMBER');
  print('  switchport voice vlan NUMBER');
  print('  description TEXT');
  print('  no shutdown');
  print('  shutdown');
  print('  show interfaces status');
  print('  show vlan brief');
  print('  show running-config');
  print('  show running-config interface gi1/0/12');
  print('  copy running-config startup-config');
  print('  write memory');
  print('  end');
  print('  exit');
}

// ----------------------------
// Quest Objective Logic
// ----------------------------

function updateObjectives() {
  const progress = activeMission.evaluate(GameState);

  renderObjectiveStates(progress.objectiveStates, {
    hiddenObjectiveIds: activeMission.definition.hiddenObjectives?.map(
      (objective) => objective.id
    ),
    showHiddenObjectives: false
  });

  const questStatus = document.getElementById('quest-status');
  const nextQuestButton = document.getElementById('next-quest-button');

  if (questStatus) {
    questStatus.textContent = progress.readyToSubmit
      ? 'Ready to Submit'
      : 'In Progress';
  }

  if (nextQuestButton) {
    nextQuestButton.disabled = !progress.readyToSubmit;
  }
}

// ----------------------------
// Save Data
// ----------------------------

const SAVE_KEY = 'ciscoCliQuestSave';
const SAVE_SCHEMA_VERSION = 1;

function getDefaultSaveData() {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    hasSave: true,
    totalCredits: 0,
    currentQuestId: 'mission-1',
    currentQuestName: activeMission.definition.name,
    rank: 'Helpdesk Refugee',
    xp: 0,
    completedQuests: [],
    unlockedMiniGames: ['subnet-sprint', 'vlan-sorter'],
    deviceState: null
  };
}

function getEmptySaveData() {
  return {
    schemaVersion: SAVE_SCHEMA_VERSION,
    hasSave: false,
    totalCredits: 0,
    currentQuestId: null,
    currentQuestName: 'None',
    rank: 'Unassigned',
    xp: 0,
    completedQuests: [],
    unlockedMiniGames: ['subnet-sprint', 'vlan-sorter'],
    deviceState: null
  };
}

function loadSaveData() {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (!rawSave) {
    return getEmptySaveData();
  }

  try {
    const parsedSave = JSON.parse(rawSave);

    return {
      schemaVersion: parsedSave.schemaVersion ?? 0,
      hasSave: true,
      totalCredits: parsedSave.totalCredits ?? 0,
      currentQuestId: parsedSave.currentQuestId ?? 'mission-1',
      currentQuestName: parsedSave.currentQuestName ?? getMission(parsedSave.currentQuestId)?.definition.name ?? activeMission.definition.name,
      rank: parsedSave.rank ?? 'Helpdesk Refugee',
      xp: parsedSave.xp ?? 0,
      completedQuests: parsedSave.completedQuests ?? [],
      unlockedMiniGames: parsedSave.unlockedMiniGames ?? ['subnet-sprint', 'vlan-sorter'],
      deviceState: parsedSave.deviceState ?? null
    };
  } catch (error) {
    console.error('Save file could not be loaded:', error);

    return {
      ...getEmptySaveData(),
      currentQuestName: 'Save Error',
      rank: 'Unknown'
    };
  }
}

function saveGameData(saveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function saveProgressToLocalStorage() {
  const existingSave = loadSaveData();
  const completedQuests = new Set(existingSave.completedQuests ?? []);

  if (GameState.questCompleted && GameState.currentQuestId) {
    completedQuests.add(GameState.currentQuestId);
  }

  GameState.completedQuests = [...completedQuests];

  const updatedSave = {
    ...existingSave,
    schemaVersion: SAVE_SCHEMA_VERSION,
    hasSave: true,
    totalCredits: GameState.credits ?? existingSave.totalCredits ?? 0,
    currentQuestId: GameState.currentQuestId ?? existingSave.currentQuestId ?? 'mission-1',
    currentQuestName: GameState.currentQuestName ?? existingSave.currentQuestName ?? activeMission.definition.name,
    rank: GameState.rank ?? existingSave.rank ?? 'Helpdesk Refugee',
    xp: GameState.xp ?? existingSave.xp ?? 0,
    completedQuests: GameState.completedQuests,
    unlockedMiniGames: existingSave.unlockedMiniGames ?? ['subnet-sprint', 'vlan-sorter'],
    deviceState: createGameStateSnapshot()
  };

  saveGameData(updatedSave);
}

function applySaveToGameState(saveData) {
  GameState.credits = saveData.totalCredits ?? 0;
  GameState.currentQuestId = saveData.currentQuestId ?? 'mission-1';
  GameState.currentQuestName = saveData.currentQuestName ?? activeMission.definition.name;
  GameState.rank = saveData.rank ?? 'Helpdesk Refugee';
  GameState.xp = saveData.xp ?? 0;
  GameState.completedQuests = saveData.completedQuests ?? [];

  activeMission = getMission(GameState.currentQuestId) ?? getMission('mission-1');
  GameState.currentQuestId = activeMission.definition.id;
  GameState.currentQuestName = activeMission.definition.name;

  const xpCounter = document.getElementById('xp-counter');

  if (xpCounter) {
    xpCounter.textContent = GameState.xp;
  }
}

function renderMissionState() {
  renderQuest(activeMission.definition, {
    showHiddenObjectives: false
  });

  const questStatus = document.getElementById('quest-status');
  const nextQuestButton = document.getElementById('next-quest-button');

  if (nextQuestButton) {
    nextQuestButton.textContent = GameState.questCompleted
      ? 'Quest Complete'
      : 'Mark Ticket Complete';
  }

  updateObjectives();

  if (GameState.questCompleted) {
    if (questStatus) questStatus.textContent = 'Complete';
    if (nextQuestButton) nextQuestButton.disabled = true;
  }
}

// ----------------------------
// Ticket Button Logic
// ----------------------------

function handleTicketButtonClick() {
  const result = activeMission.advance(GameState);

  if (result.type === 'device-missing') {
    print('');
    print('Ticket system error: Office 4B port has not been identified yet.');
    return;
  }

  if (result.type === 'completed') {
    const xpCounter = document.getElementById('xp-counter');
    const questStatus = document.getElementById('quest-status');
    const nextQuestButton = document.getElementById('next-quest-button');

    if (xpCounter) {
      xpCounter.textContent = GameState.xp;
    }

    if (questStatus) {
      questStatus.textContent = 'Complete';
    }

    if (nextQuestButton) {
      nextQuestButton.textContent = 'Quest Complete';
      nextQuestButton.disabled = true;
    }

    saveProgressToLocalStorage();
    updateHomeSummary();

    print('');
    print(`*** Quest Complete: ${activeMission.definition.completionMessage} ***`);
    print(`+${activeMission.definition.rewardXp} XP`);
    print(`+${activeMission.definition.rewardCredits} Credits`);

    heliosSayRandom('missionComplete', 'ai-message');
    showHomeScreen({ openEmailId: activeMission.definition.completionEmailId });

    return;
  }

  if (result.type === 'already-completed') {
    print('');
    print('No additional quest is available yet.');
    return;
  }

  print('');
  print('Ticket cannot be completed yet.');

  heliosSay(
    'The evidence does not support closing this ticket. Which is a very polite way of saying: check your config.',
    'ai-message'
  );
}

// ----------------------------
// Launch / Home Base Screen Logic
// ----------------------------

const launchScreen = document.getElementById('launch-screen');
const homeScreen = document.getElementById('home-screen');
const gameScreen = document.getElementById('game-screen');

const newGameButton = document.getElementById('new-game-button');
const continueButton = document.getElementById('continue-button');

const mapOffice4bButton = document.getElementById('map-office-4b-button');
const mapIdf3aButton = document.getElementById('map-idf-3a-button');
const mapSwitchD8sw1Button = document.getElementById('map-switch-d8sw1-button');
const floor3Button = document.getElementById('floor-3-button');
const floor3NodeRow = document.getElementById('floor-3-node-row');

const launchTotalCredits = document.getElementById('launch-total-credits');
const launchCurrentQuest = document.getElementById('launch-current-quest');
const launchRank = document.getElementById('launch-rank');
const launchStatusMessage = document.getElementById('launch-status-message');

const subnetSprintButton = document.getElementById('subnet-sprint-button');
const vlanSorterButton = document.getElementById('vlan-sorter-button');
const cableMatchButton = document.getElementById('cable-match-button');

const homeRank = document.getElementById('home-rank');
const homeCredits = document.getElementById('home-credits');
const goToTerminalButton = document.getElementById('go-to-terminal-button');
const homeToLaunchButton = document.getElementById('home-to-launch-button');
const missionToHomeButton = document.getElementById('mission-to-home-button');

const missionRank = document.getElementById('mission-rank');
const missionCredits = document.getElementById('mission-credits');
const questHintButton = document.getElementById('quest-hint-button');

function activateMission(missionId) {
  const mission = getMission(missionId);

  if (!mission) return;

  const completedQuests = new Set(GameState.completedQuests ?? []);
  if (completedQuests.has(missionId)) {
    heliosSay('That ticket is already closed. Reopening solved incidents is a management feature, not a training feature.');
    return;
  }

  if (missionId === 'mission-2' && !completedQuests.has('mission-1')) {
    heliosSay('Mission 2 is locked until the Office 4B workstation ticket is complete.');
    return;
  }

  activeMission = mission;
  GameState.currentQuestId = mission.definition.id;
  GameState.currentQuestName = mission.definition.name;
  GameState.questCompleted = false;
  GameState.observations = [];
  GameState.hintLevel = 0;
  delete GameState.hiddenObjectiveRevealed;
  delete GameState.ticketSubmitted;

  saveProgressToLocalStorage();
  renderMissionState();

  if (terminal) terminal.reset();
  showGameScreen();

  if (missionId === 'mission-2') {
    heliosSay(
      'The workstation is online, so the physical link and data configuration are probably not our first suspects.',
      'ai-message'
    );
  }
}

function updateLaunchSummary() {
  const saveData = loadSaveData();

  if (launchTotalCredits) {
    launchTotalCredits.textContent = saveData.totalCredits;
  }

  if (launchCurrentQuest) {
    launchCurrentQuest.textContent = saveData.currentQuestName;
  }

  if (launchRank) {
    launchRank.textContent = saveData.rank;
  }

  if (continueButton) {
    continueButton.disabled = !saveData.hasSave;
  }

  if (launchStatusMessage) {
    launchStatusMessage.textContent = saveData.hasSave
      ? 'Operator profile found. Continue assignment?'
      : 'No operator profile detected. Start a new assignment.';
  }

  updateMiniGameButtons(saveData);
}

function updateMiniGameButtons(saveData) {
  const unlockedMiniGames = saveData.unlockedMiniGames ?? [];

  if (subnetSprintButton) {
    subnetSprintButton.disabled = !unlockedMiniGames.includes('subnet-sprint');
  }

  if (vlanSorterButton) {
    vlanSorterButton.disabled = !unlockedMiniGames.includes('vlan-sorter');
  }

  if (cableMatchButton) {
    cableMatchButton.disabled = !unlockedMiniGames.includes('cable-match');
  }
}

function updateHomeSummary() {
  const saveData = loadSaveData();

  if (homeRank) {
    homeRank.textContent = saveData.rank ?? 'Helpdesk Refugee';
  }

  if (homeCredits) {
    homeCredits.textContent = saveData.totalCredits ?? 0;
  }

  if (missionRank) {
    missionRank.textContent = saveData.rank ?? 'Helpdesk Refugee';
  }

  if (missionCredits) {
    missionCredits.textContent = saveData.totalCredits ?? 0;
  }
}

function showLaunchScreen() {
  launchScreen.classList.remove('hidden');
  homeScreen.classList.add('hidden');
  gameScreen.classList.add('hidden');

  launchScreen.style.display = 'flex';
  homeScreen.style.display = 'none';
  gameScreen.style.display = 'none';

  updateLaunchSummary();
}

function showHomeScreen(options = {}) {
  launchScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');

  launchScreen.style.display = 'none';
  homeScreen.style.display = 'block';
  gameScreen.style.display = 'none';

  updateHomeSummary();
  loadEmails();
  openEmail(options.openEmailId ?? 'welcome', {
    silent: !options.openEmailId
  });

  if (!options.openEmailId) {
    heliosSayRandom('homeBaseInitial');
  }
}

function showGameScreen() {
  launchScreen.classList.add('hidden');
  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  launchScreen.style.display = 'none';
  homeScreen.style.display = 'none';
  gameScreen.style.display = 'grid';

  updateHomeSummary();

  requestAnimationFrame(() => {
    initializeTerminal();

    startMissionTutorial();

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  });
}
  
function startNewGame() {
  const freshSave = getDefaultSaveData();

  resetGameState();
  resetEmailState();
  resetNotebook();
  resetNewGameTutorial();
  resetMissionTutorial();
  saveGameData(freshSave);
  applySaveToGameState(freshSave);
  saveProgressToLocalStorage();

  renderMissionState();

  if (terminal) {
    terminal.reset();
  }

  if (launchStatusMessage) {
    launchStatusMessage.textContent = 'New operator profile created. Loading Home Base...';
  }

  showHomeScreen();

  startNewGameTutorial({ force: true });
}

function continueGame() {
  const saveData = loadSaveData();

  if (!saveData.hasSave) {
    if (launchStatusMessage) {
      launchStatusMessage.textContent = 'No saved operator profile found.';
    }

    updateLaunchSummary();
    return;
  }

  if (saveData.deviceState) {
    restoreGameState(saveData.deviceState);
  } else {
    resetGameState();
  }

  applySaveToGameState(saveData);
  renderMissionState();

  if (terminal) {
    terminal.reset();
  }

  if (launchStatusMessage) {
    launchStatusMessage.textContent = 'Restoring previous assignment...';
  }

  showHomeScreen();
}

// ----------------------------
// Event Listeners
// ----------------------------

const ticketButton = document.getElementById('next-quest-button');

if (ticketButton) {
  ticketButton.addEventListener('click', handleTicketButtonClick);
}

if (questHintButton) {
  questHintButton.addEventListener('click', () => {
    const hints = activeMission.definition.hints ?? [activeMission.definition.hint];
    const hintIndex = Math.min(GameState.hintLevel ?? 0, hints.length - 1);
    const hint = hints[hintIndex];

    if (hint) {
      heliosSay(hint, 'ai-message');
      document.getElementById('quest-hint').textContent = hint;
      GameState.hintLevel = Math.min(hintIndex + 1, hints.length - 1);
      saveProgressToLocalStorage();
    }
  });
}

window.addEventListener('cisco:start-mission', (event) => {
  activateMission(event.detail?.missionId);
});

if (newGameButton) {
  newGameButton.addEventListener('click', startNewGame);
}

if (continueButton) {
  continueButton.addEventListener('click', continueGame);
}

if (subnetSprintButton) {
  subnetSprintButton.addEventListener('click', () => {
    if (launchStatusMessage) {
      launchStatusMessage.textContent = 'Subnet Sprint simulation is not built yet.';
    }
  });
}

if (vlanSorterButton) {
  vlanSorterButton.addEventListener('click', () => {
    if (launchStatusMessage) {
      launchStatusMessage.textContent = 'VLAN Sorter simulation is not built yet.';
    }
  });
}

if (cableMatchButton) {
  cableMatchButton.addEventListener('click', () => {
    if (launchStatusMessage) {
      launchStatusMessage.textContent = 'Cable Match is currently locked.';
    }
  });
}

if (goToTerminalButton) {
  goToTerminalButton.addEventListener('click', () => {
    showGameScreen();
  });
}

if (homeToLaunchButton) {
  homeToLaunchButton.addEventListener('click', () => {
    showLaunchScreen();
  });
}

if (missionToHomeButton) {
  missionToHomeButton.addEventListener('click', () => {
    showHomeScreen();
  });
}

if (mapOffice4bButton) {
  mapOffice4bButton.addEventListener('click', () => {
    openEmail('ticket-office4b');
  });
}

if (mapIdf3aButton) {
  mapIdf3aButton.addEventListener('click', () => {
    heliosSay(
      'IDF-3A selected. This closet contains access switching for the third floor, including the Office 4B drop. Please avoid storing chairs, boxes, or cursed printers in this location.'
    );
  });
}

if (mapSwitchD8sw1Button) {
  mapSwitchD8sw1Button.addEventListener('click', () => {
    showGameScreen();
  });
}

if (floor3Button && floor3NodeRow) {
  floor3Button.addEventListener('click', () => {
    floor3NodeRow.classList.toggle('hidden');

    const indicator = floor3Button.querySelector('.floor-expand-indicator');

    if (indicator) {
      indicator.textContent = floor3NodeRow.classList.contains('hidden')
        ? 'Expand'
        : 'Collapse';
    }

    const floorMessage = floor3NodeRow.classList.contains('hidden')
      ? 'Floor 3 collapsed. The infrastructure closet is once again concealed behind bureaucracy.'
      : 'Floor 3 expanded. I see Office 4B, IDF-3A, and switch D8SW1. One of these is the source of today’s preventable incident.';

    heliosSay(floorMessage);
  });
}

// ----------------------------
// Initial Screen
// ----------------------------

initDocsPanel();
showLaunchScreen();
