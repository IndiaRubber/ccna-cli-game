export function renderQuest(quest, options = {}) {
  const showHiddenObjectives = options.showHiddenObjectives || false;

  document.getElementById('quest-title').textContent = quest.title;
  document.getElementById('quest-description').textContent = quest.description;
  document.getElementById('quest-hint').textContent = quest.hint;

  const objectivesList = document.getElementById('quest-objectives');
  objectivesList.innerHTML = '';

  const visibleObjectives = quest.objectives || [];
  const hiddenObjectives = showHiddenObjectives
    ? quest.hiddenObjectives || []
    : [];

  const allObjectives = [
    ...visibleObjectives,
    ...hiddenObjectives
  ];

  for (const objective of allObjectives) {
    const li = document.createElement('li');
    li.id = `obj-${objective.id}`;
    li.textContent = objective.text;

    if (quest.hiddenObjectives?.some(hidden => hidden.id === objective.id)) {
      li.classList.add('hidden-objective');
    }

    objectivesList.appendChild(li);
  }

  const questNotes = document.getElementById('quest-notes');
  questNotes.innerHTML = '';

  if (!quest.notes || quest.notes.length === 0) {
    questNotes.textContent = 'No documentation available for this quest.';
    return;
  }

  const ul = document.createElement('ul');

  for (const note of quest.notes) {
    const li = document.createElement('li');
    li.textContent = note;
    ul.appendChild(li);
  }

  questNotes.appendChild(ul);
}