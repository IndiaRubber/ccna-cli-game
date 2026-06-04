const NOTEBOOK_KEY = 'ciscoCliNotebookEntries';

export function initDocsPanel() {
  setupDocsTabs();
  renderNotebook();
}

function setupDocsTabs() {
  const tabs = document.querySelectorAll('.docs-tab');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const targetPanelId = tab.dataset.docsTab;

      document.querySelectorAll('.docs-tab').forEach((item) => {
        item.classList.toggle('active-docs-tab', item === tab);
      });

      document.querySelectorAll('.docs-tab-panel').forEach((panel) => {
        const isActive = panel.id === targetPanelId;

        panel.classList.toggle('active-docs-panel', isActive);
        panel.classList.toggle('hidden', !isActive);
      });
    });
  });
}

export function addNotebookEntry(entry) {
  const entries = loadNotebookEntries();

  const alreadyExists = entries.some((item) => item.id === entry.id);

  if (!alreadyExists) {
    entries.push({
      id: entry.id,
      title: entry.title,
      body: entry.body
    });

    saveNotebookEntries(entries);
  }

  renderNotebook();
  openNotebookTab();
}

export function loadNotebookEntries() {
  const rawEntries = localStorage.getItem(NOTEBOOK_KEY);

  if (!rawEntries) {
    return [];
  }

  try {
    return JSON.parse(rawEntries);
  } catch (error) {
    console.error('Notebook entries could not be loaded:', error);
    return [];
  }
}

export function resetNotebook() {
  localStorage.removeItem(NOTEBOOK_KEY);
  renderNotebook();
}

function saveNotebookEntries(entries) {
  localStorage.setItem(NOTEBOOK_KEY, JSON.stringify(entries));
}

function renderNotebook() {
  const notebookNotes = document.getElementById('notebook-notes');

  if (!notebookNotes) return;

  const entries = loadNotebookEntries();

  if (entries.length === 0) {
    notebookNotes.innerHTML = `
      <p class="empty-notebook-message">
        No notebook entries yet. Training briefs can be added from Home Base emails.
      </p>
    `;

    return;
  }

  notebookNotes.innerHTML = entries.map((entry) => {
    return `
      <article class="notebook-entry">
        <h3>${entry.title}</h3>
        <div>${entry.body}</div>
      </article>
    `;
  }).join('');
}

function openNotebookTab() {
  const notebookTabButton = document.querySelector('[data-docs-tab="notebook-tab"]');

  if (notebookTabButton) {
    notebookTabButton.click();
  }
}