const TUTORIAL_COMPLETE_KEY = 'ciscoCliNewGameTutorialComplete';
const MISSION_TUTORIAL_COMPLETE_KEY = 'ciscoCliMissionTutorialComplete';

//Home Base Tutorial//

const tutorialSteps = [
  {
    text:
`Welcome, operator.

I am HELIOS-CLI, a legacy infrastructure assistant assigned to District 3 training operations.

This environment will teach you how to inspect tickets, read documentation, locate equipment, and configure network devices using realistic command-line workflows.`,
    target: null,
    cardPosition: 'center'
  },
  {
    text:
`Once orientation is complete, I will remain in the assistant pane.

I may provide commentary, warnings, reminders, or questionable morale support as your assignments progress.`,
    target: '#home-ai-panel',
    cardPosition: 'nearTarget'
  },
  {
    text:
`This is your message queue.

Tickets, engineering notes, policy updates, and suspiciously cheerful corporate announcements will arrive here.

Read your emails carefully. They may contain useful commands, VLAN numbers, port descriptions, or hints that are not repeated elsewhere.`,
    target: '#email-list-panel',
    cardPosition: 'leftMiddle'
  },
  {
    text:
`Selected messages appear in the reading pane.

Some assignments will be obvious. Others will require you to pull details from the message body before touching the switch.

Skipping email is an excellent way to misconfigure something important.`,
    target: '#email-reading-panel',
    cardPosition: 'topLeft'
  },
  {
    text:
`This central area represents the facility.

From here you can inspect floors, select network closets, and eventually reach switches, routers, printers, access points, and other infrastructure.`,
    target: '#building-map-panel',
    cardPosition: 'rightInside'
  },
  {
    text:
`Training note:

The terminal is only one part of the job. A good analyst reads the ticket, checks the documentation, confirms the target device, and then makes the smallest safe change.

Begin by opening your email queue and reviewing your first assignment.`,
    target: null,
    cardPosition: 'center'
  }
];

//Mission Center Tutorial//


const missionTutorialSteps = [
  {
    text:
`Terminal session initialized.

This is the active mission workspace. From here you will review objectives, consult documentation, and configure network equipment through the command line.`,
    target: null,
    cardPosition: 'center'
  },
  {
    text:
`This is the terminal window.

Commands are typed here. The prompt changes depending on your current mode, just like on real Cisco equipment.`,
    target: '#terminal',
    cardPosition: 'nearTarget'
  },
  {
    text:
`This is the mission objectives pane.

It tracks the ticket, required tasks, current progress, and whether the assignment is ready to submit.`,
    target: '.panel',
    cardPosition: 'leftTarget'
  },
  {
    text:
`This is the documentation pane.

Use it for command references, official notes, and your notebook. Some emails from Home Base can add useful information here.`,
    target: '#notes-panel',
    cardPosition: 'topLeft'
  },
  {
    text:
`Training reminder:

Do not guess your way through infrastructure changes. Read the ticket, inspect the device, confirm the target interface, make the smallest safe change, and save your work.`,
    target: null,
    cardPosition: 'center'
  }
];

const missionZeroTutorialSteps = [
  {
    text:
`First assignment workspace initialized.

This is where you will inspect the facility's network equipment and record what you find. For this assignment, observation comes before configuration.`,
    target: null,
    cardPosition: 'center'
  },
  {
    text:
`This is the terminal. Commands ask the simulated switch what it can see, and the prompt shows where you are.

Start with enable, then use show interfaces status to inspect the switch.`,
    target: '#terminal',
    cardPosition: 'nearTarget'
  },
  {
    text:
`The mission panel tracks what you need to discover.

You are not being asked to change the switch yet. Find the Office 4B connection and confirm what the device reports.`,
    target: '.panel',
    cardPosition: 'leftTarget'
  },
  {
    text:
`HELIOS will help you read the output and reason from the evidence.

If you need a reminder, check the Documentation pane or ask for another hint.`,
    target: '#notes-panel',
    cardPosition: 'topLeft'
  },
  {
    text:
`Professional habit:

Before we touch anything, let's see what the switch thinks is happening. Nothing should be configured during this assignment.`,
    target: null,
    cardPosition: 'center'
  }
];


let currentStepIndex = 0;
let typingTimer = null;
let activeTutorialSteps = tutorialSteps;
let activeTutorialCompleteKey = TUTORIAL_COMPLETE_KEY;

export function startMissionTutorial({ force = false, missionId = null } = {}) {
  const alreadyComplete =
    localStorage.getItem(MISSION_TUTORIAL_COMPLETE_KEY) === 'true';

  if (alreadyComplete && !force) {
    return;
  }

  currentStepIndex = 0;
  activeTutorialSteps = missionId === 'mission-0'
    ? missionZeroTutorialSteps
    : missionTutorialSteps;
  activeTutorialCompleteKey = MISSION_TUTORIAL_COMPLETE_KEY;

  const overlay = document.getElementById('tutorial-overlay');
  const nextButton = document.getElementById('tutorial-next-button');
  const skipButton = document.getElementById('tutorial-skip-button');

  if (!overlay || !nextButton || !skipButton) {
    console.warn('Mission tutorial elements missing from DOM.');
    return;
  }

  overlay.classList.remove('hidden');

  nextButton.onclick = showNextTutorialStep;
  skipButton.onclick = completeTutorial;

  showTutorialStep(currentStepIndex);
}

export function resetNewGameTutorial() {
  localStorage.removeItem(TUTORIAL_COMPLETE_KEY);
}

export function resetMissionTutorial() {
  localStorage.removeItem(MISSION_TUTORIAL_COMPLETE_KEY);
}

export function startNewGameTutorial({ force = false } = {}) {
  const alreadyComplete = localStorage.getItem(TUTORIAL_COMPLETE_KEY) === 'true';
  
  if (alreadyComplete && !force) {
    return;
  }

  currentStepIndex = 0;
  activeTutorialSteps = tutorialSteps;
  activeTutorialCompleteKey = TUTORIAL_COMPLETE_KEY;

  const overlay = document.getElementById('tutorial-overlay');
  const nextButton = document.getElementById('tutorial-next-button');
  const skipButton = document.getElementById('tutorial-skip-button');

  if (!overlay || !nextButton || !skipButton) {
    console.warn('Tutorial elements missing from DOM.');
    return;
  }

  overlay.classList.remove('hidden');

  nextButton.onclick = showNextTutorialStep;
  skipButton.onclick = completeTutorial;

  showTutorialStep(currentStepIndex);
}

function showNextTutorialStep() {
  currentStepIndex += 1;

  if (currentStepIndex >= activeTutorialSteps.length) {
    completeTutorial();
    return;
  }

  showTutorialStep(currentStepIndex);
}

function showTutorialStep(index) {
  const step = activeTutorialSteps[index];

  clearTutorialHighlight();
  positionSpotlight(step.target);

  typeTutorialText(step.text);
  positionTutorialCard(step);

  const nextButton = document.getElementById('tutorial-next-button');
  if (nextButton) {
    nextButton.textContent =
      index === activeTutorialSteps.length - 1 ? 'Begin Assignment' : 'Continue';
  }
}

function typeTutorialText(text) {
  const textElement = document.getElementById('tutorial-text');

  if (!textElement) return;

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  textElement.textContent = '';

  let index = 0;

  typingTimer = setInterval(() => {
    textElement.textContent += text[index];
    index += 1;

    if (index >= text.length) {
      clearInterval(typingTimer);
      typingTimer = null;
    }
  }, 16);
}

function positionSpotlight(selector) {
  const spotlight = document.getElementById('tutorial-spotlight');

  if (!spotlight) return;

  if (!selector) {
    spotlight.classList.add('hidden');
    return;
  }

  const target = document.querySelector(selector);

  if (!target) {
    spotlight.classList.add('hidden');
    return;
  }

  target.classList.add('tutorial-highlighted');

  const rect = target.getBoundingClientRect();
  const padding = 8;

  spotlight.style.top = `${rect.top - padding}px`;
  spotlight.style.left = `${rect.left - padding}px`;
  spotlight.style.width = `${rect.width + padding * 2}px`;
  spotlight.style.height = `${rect.height + padding * 2}px`;

  spotlight.classList.remove('hidden');
}

function positionTutorialCard(step) {
  const card = document.getElementById('tutorial-card');

  if (!card) return;

  card.classList.remove('tutorial-card-center');

  if (!step.target || step.cardPosition === 'center') {
    card.removeAttribute('style');
    card.classList.add('tutorial-card-center');
    return;
  }

  const target = document.querySelector(step.target);

  if (!target) {
    card.removeAttribute('style');
    card.classList.add('tutorial-card-center');
    return;
  }

  const rect = target.getBoundingClientRect();
  const cardWidth = Math.min(520, window.innerWidth - 32);
  const margin = 16;

  let top = rect.bottom + margin;
  let left = rect.left;

  if (step.cardPosition === 'nearTarget') {
    top = rect.top;
    left = rect.right + margin;
  }

  if (step.cardPosition === 'belowTarget') {
    top = rect.bottom + margin;
    left = rect.left;
  }

  if (step.cardPosition === 'leftTarget') {
    top = rect.top;
    left = rect.left - cardWidth - margin;
  }

  if (step.cardPosition === 'leftMiddle') {
    top = rect.top + 24;
    left = rect.left - cardWidth - margin;
  }

  if (step.cardPosition === 'topLeft') {
    top = 48;
    left = 48;
  }

  if (step.cardPosition === 'rightInside') {
    top = rect.top + 24;
    left = rect.right - cardWidth - 24;
  }
  
  left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));

  const cardHeight = Math.min(430, window.innerHeight - 32);

  top = Math.max(
    16,
    Math.min(
      top,
      window.innerHeight - cardHeight - 16
    )
  );

  card.style.width = `${cardWidth}px`;
  card.style.top = `${top}px`;
  card.style.left = `${left}px`;
  card.style.transform = 'none';
}

function clearTutorialHighlight() {
  document
    .querySelectorAll('.tutorial-highlighted')
    .forEach((element) => {
      element.classList.remove('tutorial-highlighted');
    });
}

function completeTutorial() {
  const overlay = document.getElementById('tutorial-overlay');

  if (typingTimer) {
    clearInterval(typingTimer);
    typingTimer = null;
  }

  clearTutorialHighlight();

  if (overlay) {
    overlay.classList.add('hidden');
  }

  localStorage.setItem(activeTutorialCompleteKey, 'true');
}

