import { emails } from '../data/emails.js';
import { GameState } from '../engine/state.js';
import { addNotebookEntry } from '../ui/docsPanel.js';
import { heliosSay, heliosSayRandom } from './helios.js';

const EMAIL_STATE_KEY = 'ciscoCliEmailState';

function loadEmailState() {
  const rawState = localStorage.getItem(EMAIL_STATE_KEY);

  if (!rawState) {
    return {
      archivedEmailIds: []
    };
  }

  try {
    return {
      archivedEmailIds: JSON.parse(rawState).archivedEmailIds ?? []
    };
  } catch (error) {
    console.error('Email state could not be loaded:', error);

    return {
      archivedEmailIds: []
    };
  }
}

function saveEmailState(emailState) {
  localStorage.setItem(EMAIL_STATE_KEY, JSON.stringify(emailState));
}

function isTicketEmail(email) {
  return email.id.startsWith('ticket');
}

function isTicketLocked(email) {
  if (!isTicketEmail(email)) return false;

  if (email.missionId) {
    return !(
      GameState.completedQuests?.includes(email.missionId) ||
      (GameState.currentQuestId === email.missionId && GameState.questCompleted === true)
    );
  }

  return GameState.questCompleted !== true;
}

export function isEmailAvailable(email, state = GameState) {
  if (!email.unlockAfterQuest) return true;

  return (
    state.completedQuests?.includes(email.unlockAfterQuest) ||
    (state.currentQuestId === email.unlockAfterQuest && state.questCompleted === true)
  );
}

export function getAvailableEmails(state = GameState) {
  return emails.filter((email) => isEmailAvailable(email, state));
}

export function archiveMissionEmails(missionId) {
  if (!missionId) return;

  const missionEmailIds = emails
    .filter((email) => email.missionId === missionId)
    .map((email) => email.id);

  if (missionEmailIds.length === 0) return;

  const emailState = loadEmailState();
  emailState.archivedEmailIds = [
    ...new Set([...emailState.archivedEmailIds, ...missionEmailIds])
  ];
  saveEmailState(emailState);
  loadEmails();
}

export function getNextActionableOffice4bTicket(state = GameState) {
  const ticketIds = [
    'ticket-office4b-observation',
    'ticket-office4b',
    'ticket-office4b-phone'
  ];
  const completedQuests = new Set(state.completedQuests ?? []);

  return getAvailableEmails(state).find((email) =>
    ticketIds.includes(email.id) && !completedQuests.has(email.missionId)
  ) ?? null;
}

function isArchived(emailId) {
  const emailState = loadEmailState();
  return emailState.archivedEmailIds.includes(emailId);
}

function archiveEmail(emailId) {
  const email = emails.find((item) => item.id === emailId);

  if (!email) {
    console.warn(`Email not found: ${emailId}`);
    return;
  }

  if (isTicketLocked(email)) {
    heliosSay(
      'Ticket emails cannot be archived until the ticket is closed. Paper trails: annoying, but legally nutritious.'
    );
    return;
  }

  const emailState = loadEmailState();

  if (!emailState.archivedEmailIds.includes(emailId)) {
    emailState.archivedEmailIds.push(emailId);
  }

  saveEmailState(emailState);
  loadEmails();

  const nextActiveEmail = getAvailableEmails().find(
    (item) => !isArchived(item.id)
  );

  if (nextActiveEmail) {
    openEmail(nextActiveEmail.id, { silent: true });
  } else {
    clearReadingPane();
  }

  heliosSayRandom('emailArchived');
}

function restoreEmail(emailId) {
  const emailState = loadEmailState();

  emailState.archivedEmailIds = emailState.archivedEmailIds.filter(
    (id) => id !== emailId
  );

  saveEmailState(emailState);
  loadEmails();
  openEmail(emailId, { silent: true });

  heliosSay('Email restored to inbox. Bureaucracy reversed. Rare, but not impossible.');
}

function createEmailButton(email, archived = false) {
  const button = document.createElement('button');

  button.className = 'email-list-item';
  button.dataset.emailId = email.id;

  if (archived) {
    button.classList.add('archived-email');
  }

  const newBadge = email.unlockAfterQuest && !archived
    ? '<span class="email-new-badge">NEW</span>'
    : '';

  button.innerHTML = `
    <span class="email-from">${email.from} ${newBadge}</span>
    <strong>${email.subject}</strong>
    <small>${email.preview}</small>
  `;

  button.addEventListener('click', () => {
    openEmail(email.id);
  });

  return button;
}

export function loadEmails() {
  const emailList = document.getElementById('email-list');

  if (!emailList) {
    console.warn('Email list element not found.');
    return;
  }

  const emailState = loadEmailState();
  const archivedEmailIds = emailState.archivedEmailIds ?? [];

  const availableEmails = getAvailableEmails();

  const activeEmails = availableEmails.filter(
    (email) => !archivedEmailIds.includes(email.id)
  );

  const archivedEmails = availableEmails.filter(
    (email) => archivedEmailIds.includes(email.id)
  );

  emailList.innerHTML = '';

  const activeSection = document.createElement('div');
  activeSection.className = 'email-section active-email-section';

  activeEmails.forEach((email, index) => {
    const button = createEmailButton(email, false);

    if (index === 0) {
      button.classList.add('active-email');
    }

    activeSection.appendChild(button);
  });

  emailList.appendChild(activeSection);

  const archivedSection = document.createElement('details');
  archivedSection.className = 'archived-email-section';

  archivedSection.innerHTML = `
    <summary>Archived (${archivedEmails.length})</summary>
    <div class="archived-email-list"></div>
  `;

  const archivedList = archivedSection.querySelector('.archived-email-list');

  archivedEmails.forEach((email) => {
    archivedList.appendChild(createEmailButton(email, true));
  });

  emailList.appendChild(archivedSection);
}

export function openEmail(emailId, options = {}) {
  const email = emails.find((item) => item.id === emailId);

  const emailReadingFrom = document.getElementById('email-reading-from');
  const emailReadingSubject = document.getElementById('email-reading-subject');
  const emailReadingBody = document.getElementById('email-reading-body');

  if (!email) {
    console.warn(`Email not found: ${emailId}`);
    return;
  }

  if (!isEmailAvailable(email)) {
    console.warn(`Email is not available yet: ${emailId}`);
    return;
  }

  document.querySelectorAll('.email-list-item').forEach((item) => {
    item.classList.toggle('active-email', item.dataset.emailId === emailId);
  });

  if (emailReadingFrom) {
    emailReadingFrom.textContent = `From: ${email.from}`;
  }

  if (emailReadingSubject) {
    emailReadingSubject.textContent = email.subject;
  }

  if (emailReadingBody) {
    const archived = isArchived(email.id);
    const ticketLocked = isTicketLocked(email);

    const archiveButtonLabel = archived
      ? 'Move Back to Inbox'
      : ticketLocked
        ? 'Ticket Must Be Closed First'
        : 'Mark as Read';

    const notebookButtonHtml = email.notebookEntry
      ? `
        <button id="add-to-notebook-button" class="email-action-button">
          Add to Notebook
        </button>
      `
      : '';

    emailReadingBody.innerHTML = `
      ${email.body}

      <div class="email-actions">
        ${notebookButtonHtml}

        <button
          id="mark-email-read-button"
          class="email-action-button"
          ${ticketLocked && !archived ? 'disabled' : ''}
        >
          ${archiveButtonLabel}
        </button>
      </div>
    `;

    const markReadButton = document.getElementById('mark-email-read-button');

    if (markReadButton) {
      markReadButton.addEventListener('click', () => {
        if (archived) {
          restoreEmail(email.id);
        } else {
          archiveEmail(email.id);
        }
      });
    }

    const addToNotebookButton = document.getElementById('add-to-notebook-button');

    if (addToNotebookButton && email.notebookEntry) {
      addToNotebookButton.addEventListener('click', () => {
        addNotebookEntry(email.notebookEntry);

        heliosSay(
          'Training note added to your notebook. I have converted corporate rambling into something almost useful.'
        );
      });
    }

    const emailStartTicketButton = document.getElementById('email-start-ticket-button');

    if (emailStartTicketButton) {
      emailStartTicketButton.addEventListener('click', () => {
        if (email.missionId) {
          window.dispatchEvent(new CustomEvent('cisco:start-mission', {
            detail: { missionId: email.missionId }
          }));
          return;
        }

        const goToTerminalButton = document.getElementById('go-to-terminal-button');

        if (goToTerminalButton) {
          goToTerminalButton.click();
        }
      });
    }
  }

  if (!options.silent) {
    if (email.heliosMessage) {
      heliosSay(email.heliosMessage);
    } else if (isTicketEmail(email)) {
      heliosSayRandom('missionTicketOpened');
    } else {
      heliosSayRandom('emailOpened');
    }
  }
}

function clearReadingPane() {
  const emailReadingFrom = document.getElementById('email-reading-from');
  const emailReadingSubject = document.getElementById('email-reading-subject');
  const emailReadingBody = document.getElementById('email-reading-body');

  if (emailReadingFrom) {
    emailReadingFrom.textContent = 'From:';
  }

  if (emailReadingSubject) {
    emailReadingSubject.textContent = 'Inbox Clear';
  }

  if (emailReadingBody) {
    emailReadingBody.innerHTML = `
      <p>
        No active emails remain. This is statistically suspicious, but enjoy the silence.
      </p>
    `;
  }
}

export function resetEmailState() {
  localStorage.removeItem(EMAIL_STATE_KEY);
}
