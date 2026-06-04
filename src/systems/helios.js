import { heliosResponses } from '../data/heliosResponses.js';

const activeTypingTimers = {};

function isElementVisible(element) {
  if (!element) return false;

  // If the element itself or any parent screen/panel has .hidden, treat it as hidden.
  if (element.closest('.hidden')) {
    return false;
  }

  return true;
}

function getVisibleHeliosTarget(targetId = null) {
  // If a specific target was requested and it exists, use it.
  // But only if it is currently visible.
  if (targetId) {
    const requestedTarget = document.getElementById(targetId);

    if (requestedTarget && isElementVisible(requestedTarget)) {
      return requestedTarget;
    }
  }

  // Otherwise, find the visible HELIOS panel.
  const panels = document.querySelectorAll('[data-helios-panel]');

  for (const panel of panels) {
    if (isElementVisible(panel)) {
      return panel;
    }
  }

  // Fallback: if none are visible, return the requested target if it exists.
  // This prevents older code from failing completely during screen transitions.
  if (targetId) {
    const requestedTarget = document.getElementById(targetId);

    if (requestedTarget) {
      return requestedTarget;
    }
  }

  // Final fallback: first HELIOS panel on the page.
  return panels[0] ?? null;
}

export function heliosSay(message, targetId = null, speed = 24) {
  const target = getVisibleHeliosTarget(targetId);

  console.log('HELIOS SAY:', {
    requestedTarget: targetId,
    resolvedTarget: target?.id || target?.className || 'unknown',
    message
  });

  if (!target) {
    console.warn('HELIOS target not found.');
    return;
  }

  if (!message) {
    console.warn('HELIOS message was empty.');
    return;
  }

  typeHeliosMessage(target, message, speed);
}

export function heliosSayRandom(category, targetId = null, speed = 24) {
  console.log('HELIOS RANDOM CALLED:', category);
  console.log('Available HELIOS categories:', Object.keys(heliosResponses));

  const responses = heliosResponses[category];

  if (!responses || responses.length === 0) {
    console.warn(`HELIOS response category not found: ${category}`);
    return;
  }

  const randomIndex = Math.floor(Math.random() * responses.length);
  const message = responses[randomIndex];

  console.log('Selected HELIOS message:', message);

  heliosSay(message, targetId, speed);
}

function typeHeliosMessage(element, message, speed = 24) {
  const elementKey =
    element.id ||
    element.getAttribute('data-helios-panel') ||
    'visible-helios-target';

  if (activeTypingTimers[elementKey]) {
    clearInterval(activeTypingTimers[elementKey]);
  }

  element.textContent = '';

  let index = 0;

  activeTypingTimers[elementKey] = setInterval(() => {
    element.textContent += message[index];
    index++;

    if (index >= message.length) {
      clearInterval(activeTypingTimers[elementKey]);
      activeTypingTimers[elementKey] = null;
    }
  }, speed);
}