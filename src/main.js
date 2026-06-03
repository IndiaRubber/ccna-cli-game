import { GameState } from './engine/state.js';
import { runCommand } from './engine/cli.js';
import { getAutocomplete } from './ui/autocomplete.js';
import { createTerminal } from './ui/terminal.js';
import './style.css';

import { mission1 } from './quests/mission1/mission1.js';
import { renderQuest } from './quests/questEngine.js';

renderQuest(mission1);

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
    updateObjectives
  };
}

window.CiscoUI = {
  print,
  showHelp: () => {},
  updateObjectives: () => {}
};

function showHelp() {
  print('Available commands:');
  print('  enable');
  print('  configure terminal');
  print('  interface g0/12');
  print('  switchport mode access');
  print('  switchport access vlan NUMBER');
  print('  switchport voice vlan NUMBER');
  print('  description TEXT');
  print('  no shutdown');
  print('  shutdown');
  print('  show interfaces status');
  print('  show vlan brief');
  print('  show running-config');
  print('  copy running-config startup-config');
  print('  write memory');
  print('  end');
  print('  exit');
}

function setObjectiveComplete(id, isComplete) {
  const element = document.getElementById(`obj-${id}`);

  if (!element) {
    console.warn(`Objective element not found: obj-${id}`);
    return;
  }

  element.className = isComplete ? 'complete' : '';
}

function updateObjectives() {
  const g012 = GameState.interfaces?.['g0/12'];

  if (!g012) return;

  const hasDescription =
    g012.description?.toLowerCase().includes('office 4b');

  const phaseOneComplete =
    g012.mode === 'access' &&
    g012.accessVlan === '10' &&
    hasDescription &&
    GameState.saved === true;

  const phaseTwoComplete =
    phaseOneComplete &&
    g012.voiceVlan === '20' &&
    GameState.saved === true;

  setObjectiveComplete(
    'identify-office4b-port',
    GameState.currentInterface === 'g0/12' ||
      g012.mode === 'access' ||
      g012.accessVlan === '10'
  );

  setObjectiveComplete(
    'g012-mode-access',
    g012.mode === 'access'
  );

  setObjectiveComplete(
    'g012-access-vlan10',
    g012.accessVlan === '10'
  );

  setObjectiveComplete(
    'g012-description',
    hasDescription
  );

  setObjectiveComplete(
    'save',
    GameState.saved === true
  );

  if (GameState.hiddenObjectiveRevealed) {
    setObjectiveComplete(
      'g012-voice-vlan20',
      g012.voiceVlan === '20'
    );
  }

  const readyToSubmit = GameState.hiddenObjectiveRevealed
    ? phaseTwoComplete
    : phaseOneComplete;

  const questStatus = document.getElementById('quest-status');
  const nextQuestButton = document.getElementById('next-quest-button');

  if (questStatus) {
    questStatus.textContent = readyToSubmit ? 'Ready to Submit' : 'In Progress';
  }

  if (nextQuestButton) {
    nextQuestButton.disabled = !readyToSubmit;

    if (GameState.hiddenObjectiveRevealed && phaseTwoComplete) {
      nextQuestButton.textContent = 'Next Quest';
    }
  }
}

function saveProgressToLocalStorage() {
  const existingSave = loadSaveData();

  const updatedSave = {
    ...existingSave,
    hasSave: true,
    totalCredits: GameState.credits ?? existingSave.totalCredits ?? 0,
    currentQuestId: GameState.currentQuestId ?? existingSave.currentQuestId ?? 'mission-1',
    currentQuestName: GameState.currentQuestName ?? existingSave.currentQuestName ?? 'Office 4B Port Assignment',
    rank: GameState.rank ?? existingSave.rank ?? 'Helpdesk Refugee',
    xp: GameState.xp ?? existingSave.xp ?? 0,
    completedQuests: existingSave.completedQuests ?? [],
    unlockedMiniGames: existingSave.unlockedMiniGames ?? ['subnet-sprint', 'vlan-sorter']
  };

  saveGameData(updatedSave);
}

function handleTicketButtonClick() {
  const g012 = GameState.interfaces?.['g0/12'];

  if (!g012) {
    print('');
    print('Ticket system error: Office 4B port has not been identified yet.');
    return;
  }

  const hasDescription =
    g012.description?.toLowerCase().includes('office 4b');

  const phaseOneComplete =
    g012.mode === 'access' &&
    g012.accessVlan === '10' &&
    hasDescription &&
    GameState.saved === true;

  const phaseTwoComplete =
    phaseOneComplete &&
    g012.voiceVlan === '20' &&
    GameState.saved === true;

  if (!GameState.hiddenObjectiveRevealed && phaseOneComplete) {
    GameState.ticketSubmitted = true;
    GameState.hiddenObjectiveRevealed = true;

    // Force the player to save again after the corrective change.
    GameState.saved = false;

    renderQuest(mission1, { showHiddenObjectives: true });

    print('');
    print('Ticket Update:');
    print('The new hire reports their workstation is online, but their desk phone says "Network Unavailable."');
    print('');
    print('Hidden Objective Revealed:');
    print('Configure the Office 4B port for VOICE VLAN 20.');
    print('');
    print('HELIOS-CLI: Classic. Data works, phone does not. Check for a missing voice VLAN.');

    const questStatus = document.getElementById('quest-status');
    const nextQuestButton = document.getElementById('next-quest-button');

    if (questStatus) {
      questStatus.textContent = 'In Progress';
    }

    if (nextQuestButton) {
      nextQuestButton.textContent = 'Mark Ticket Complete';
      nextQuestButton.disabled = true;
    }

    updateObjectives();
    return;
  }

  if (GameState.hiddenObjectiveRevealed && phaseTwoComplete) {
    GameState.questCompleted = true;

    if (!GameState.xp || GameState.xp < 100) {
      GameState.xp = 100;
    }

    if (!GameState.credits || GameState.credits < 25) {
      GameState.credits = 25;
    }

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
      nextQuestButton.textContent = 'Next Quest';
      nextQuestButton.disabled = false;
    }

    saveProgressToLocalStorage();

    print('');
    print('*** Quest Complete: New Hire Port Activation ***');
    print('+100 XP');
    print('+25 Credits');

    return;
  }

  print('');
  print('Ticket cannot be completed yet.');
  print('HELIOS-CLI: The evidence does not support closing this ticket. Which is a very polite way of saying: check your config.');
}

const ticketButton = document.getElementById('next-quest-button');

if (ticketButton) {
  ticketButton.addEventListener('click', handleTicketButtonClick);
}

window.CiscoUI = {
  print,
  showHelp,
  updateObjectives
};
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
const missionAiMessage = document.getElementById('ai-message');

const homeRank = document.getElementById('home-rank');
const homeCredits = document.getElementById('home-credits');
const goToTerminalButton = document.getElementById('go-to-terminal-button');
const homeToLaunchButton = document.getElementById('home-to-launch-button');
const missionToHomeButton = document.getElementById('mission-to-home-button');

const missionRank = document.getElementById('mission-rank');
const missionCredits = document.getElementById('mission-credits');

const emailListItems = document.querySelectorAll('.email-list-item');
const emailReadingFrom = document.getElementById('email-reading-from');
const emailReadingSubject = document.getElementById('email-reading-subject');
const emailReadingBody = document.getElementById('email-reading-body');
const homeAiMessage = document.getElementById('home-ai-message');

const SAVE_KEY = 'ciscoCliQuestSave';

const homeEmails = {
  welcome: {
    from: 'Network Engineering',
    subject: 'Welcome to District 3',
    body: `
      <p>
        Welcome to the District 3 Satellite Office. Due to a very normal and not at all concerning staffing shortage,
        you have been temporarily assigned to assist with basic network operations.
      </p>

      <p>
        HELIOS-CLI has been assigned as your infrastructure assistant. It is obsolete, overconfident, and technically
        still within support parameters.
      </p>

      <p>
        Review your inbox, read the training brief, then open your first ticket.
      </p>
    `,
    aiMessage:
      'Home Base initialized. I have reviewed the staffing situation and diagnosed the primary failure domain as: management.'
  },

  training: {
    from: 'HELIOS-CLI',
    subject: 'Training Brief: Switch Access Ports',
    body: `
      <p>
        Your first field assignment involves configuring a switchport for a relocated workstation.
      </p>

      <p>
        Useful commands may include:
      </p>

      <ul>
        <li><code>enable</code></li>
        <li><code>configure terminal</code></li>
        <li><code>interface g0/12</code></li>
        <li><code>switchport mode access</code></li>
        <li><code>switchport access vlan 10</code></li>
        <li><code>description Office 4B</code></li>
        <li><code>no shutdown</code></li>
        <li><code>write memory</code></li>
      </ul>

      <p>
        Remember: the port description is not decorative. It is evidence.
      </p>
    `,
    aiMessage:
      'A switchport is basically a tiny bureaucrat. It will only do exactly what it has been configured to do, and it will act offended if you expected otherwise.'
  },

  'ticket-office4b': {
    from: 'Helpdesk Queue',
    subject: 'Ticket: Office 4B New Hire Port',
    body: `
      <p>
        A new hire was moved into Office 4B. Their workstation has been connected to the wall jack, but they report
        no network access.
      </p>

      <p>
        The previous move request was not submitted correctly, so the exact switchport is not listed in the ticket.
        You will need to inspect the switch interface list and identify the correct port by description.
      </p>

      <p>
        Once you locate the Office 4B port, configure it for the correct access VLAN, add a useful description,
        bring the port up if needed, and save the configuration.
      </p>

      <button id="email-start-ticket-button" class="email-action-button">
        Open Terminal for This Ticket
      </button>
    `,
    aiMessage:
      'Layer 8 event detected. User moved hardware without a move ticket. The network, in protest, has chosen silence.'
  },

  corporate: {
    from: 'Facilities',
    subject: 'Reminder: Do Not Block IDF Doors',
    body: `
      <p>
        Please do not place chairs, boxes, surplus monitors, seasonal decorations, or emotionally significant office plants
        in front of IDF doors.
      </p>

      <p>
        Infrastructure closets require access. This includes emergency access, scheduled maintenance access, and the
        occasional haunted-printer investigation.
      </p>
    `,
    aiMessage:
      'I once watched a technician move six chairs, a ficus, and a laminator to reach an IDF. Humans call this “facilities coordination.”'
  }
};

function getDefaultSaveData() {
  return {
    hasSave: true,
    totalCredits: 0,
    currentQuestId: 'mission-1',
    currentQuestName: 'Office 4B Port Assignment',
    rank: 'Helpdesk Refugee',
    xp: 0,
    completedQuests: [],
    unlockedMiniGames: ['subnet-sprint', 'vlan-sorter']
  };
}

function loadSaveData() {
  const rawSave = localStorage.getItem(SAVE_KEY);

  if (!rawSave) {
    return {
      hasSave: false,
      totalCredits: 0,
      currentQuestId: null,
      currentQuestName: 'None',
      rank: 'Unassigned',
      xp: 0,
      completedQuests: [],
      unlockedMiniGames: ['subnet-sprint', 'vlan-sorter']
    };
  }

  try {
    const parsedSave = JSON.parse(rawSave);

    return {
      hasSave: true,
      totalCredits: parsedSave.totalCredits ?? 0,
      currentQuestId: parsedSave.currentQuestId ?? 'mission-1',
      currentQuestName: parsedSave.currentQuestName ?? 'Office 4B Port Assignment',
      rank: parsedSave.rank ?? 'Helpdesk Refugee',
      xp: parsedSave.xp ?? 0,
      completedQuests: parsedSave.completedQuests ?? [],
      unlockedMiniGames: parsedSave.unlockedMiniGames ?? ['subnet-sprint', 'vlan-sorter']
    };
  } catch (error) {
    console.error('Save file could not be loaded:', error);

    return {
      hasSave: false,
      totalCredits: 0,
      currentQuestId: null,
      currentQuestName: 'Save Error',
      rank: 'Unknown',
      xp: 0,
      completedQuests: [],
      unlockedMiniGames: ['subnet-sprint', 'vlan-sorter']
    };
  }
}

function saveGameData(saveData) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function updateLaunchSummary() {
  const saveData = loadSaveData();

  launchTotalCredits.textContent = saveData.totalCredits;
  launchCurrentQuest.textContent = saveData.currentQuestName;
  launchRank.textContent = saveData.rank;

  continueButton.disabled = !saveData.hasSave;

  if (saveData.hasSave) {
    launchStatusMessage.textContent = 'Operator profile found. Continue assignment?';
  } else {
    launchStatusMessage.textContent = 'No operator profile detected. Start a new assignment.';
  }

  updateMiniGameButtons(saveData);
}

function updateMiniGameButtons(saveData) {
  const unlockedMiniGames = saveData.unlockedMiniGames ?? [];

  subnetSprintButton.disabled = !unlockedMiniGames.includes('subnet-sprint');
  vlanSorterButton.disabled = !unlockedMiniGames.includes('vlan-sorter');
  cableMatchButton.disabled = !unlockedMiniGames.includes('cable-match');
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
  updateLaunchSummary();
}

function showHomeScreen() {
  launchScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  gameScreen.classList.add('hidden');

  updateHomeSummary();
  openHomeEmail('welcome');
}

function showGameScreen() {
  launchScreen.classList.add('hidden');
  homeScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  updateHomeSummary();

  requestAnimationFrame(() => {
    initializeTerminal();

    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  });
}

function applySaveToGameState(saveData) {
  GameState.credits = saveData.totalCredits ?? 0;
  GameState.currentQuestId = saveData.currentQuestId ?? 'mission-1';
  GameState.currentQuestName = saveData.currentQuestName ?? 'Office 4B Port Assignment';
  GameState.rank = saveData.rank ?? 'Helpdesk Refugee';
  GameState.xp = saveData.xp ?? 0;

  const xpCounter = document.getElementById('xp-counter');

  if (xpCounter) {
    xpCounter.textContent = GameState.xp;
  }
}

function startNewGame() {
  const freshSave = getDefaultSaveData();

  saveGameData(freshSave);
  applySaveToGameState(freshSave);

  launchStatusMessage.textContent = 'New operator profile created. Loading Home Base...';

  showHomeScreen();
}

function continueGame() {
  const saveData = loadSaveData();

  if (!saveData.hasSave) {
    launchStatusMessage.textContent = 'No saved operator profile found.';
    updateLaunchSummary();
    return;
  }

  applySaveToGameState(saveData);

  launchStatusMessage.textContent = 'Restoring previous assignment...';

  showHomeScreen();
}

function typeHeliosMessage(element, message, speed = 24) {
  if (!element) return;

  // Stop any existing typewriter animation on this element.
  if (element.typewriterTimer) {
    clearInterval(element.typewriterTimer);
  }

  element.textContent = '';

  let index = 0;

  element.typewriterTimer = setInterval(() => {
    element.textContent += message[index];
    index++;

    if (index >= message.length) {
      clearInterval(element.typewriterTimer);
      element.typewriterTimer = null;
    }
  }, speed);
}

function openHomeEmail(emailId) {
  const email = homeEmails[emailId];

  if (!email) {
    console.warn(`Home email not found: ${emailId}`);
    return;
  }

  emailReadingFrom.textContent = `From: ${email.from}`;
  emailReadingSubject.textContent = email.subject;
  emailReadingBody.innerHTML = email.body;

  typeHeliosMessage(homeAiMessage, email.aiMessage);

  emailListItems.forEach((item) => {
    item.classList.toggle('active-email', item.dataset.emailId === emailId);
  });

  const emailStartTicketButton = document.getElementById('email-start-ticket-button');

  if (emailStartTicketButton) {
    emailStartTicketButton.onclick = () => {
      showGameScreen();
    };
  }
}

newGameButton.addEventListener('click', startNewGame);
continueButton.addEventListener('click', continueGame);

subnetSprintButton.addEventListener('click', () => {
  launchStatusMessage.textContent = 'Subnet Sprint simulation is not built yet.';
});

vlanSorterButton.addEventListener('click', () => {
  launchStatusMessage.textContent = 'VLAN Sorter simulation is not built yet.';
});

cableMatchButton.addEventListener('click', () => {
  launchStatusMessage.textContent = 'Cable Match is currently locked.';
});

emailListItems.forEach((item) => {
  item.addEventListener('click', () => {
    openHomeEmail(item.dataset.emailId);
  });
});

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
    openHomeEmail('ticket-office4b');
  });
}

if (mapIdf3aButton) {
  mapIdf3aButton.addEventListener('click', () => {
    typeHeliosMessage(
      homeAiMessage,
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

    typeHeliosMessage(homeAiMessage, floorMessage);
  });
}

showLaunchScreen();