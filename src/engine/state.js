import { createD8SW1 } from '../devices/catalyst2960x.js';

export const GameState = createD8SW1();

export function createGameStateSnapshot() {
  return JSON.parse(JSON.stringify(GameState));
}

export function restoreGameState(savedState) {
  if (!savedState || typeof savedState !== 'object' || Array.isArray(savedState)) {
    return resetGameState();
  }

  const freshState = createD8SW1();
  const savedInterfaces = savedState.interfaces ?? {};
  const savedInlinePower = savedState.inlinePower ?? [];
  const restoredInterfaces = Object.fromEntries(
    Object.entries(freshState.interfaces).map(([name, freshInterface]) => [
      name,
      {
        ...freshInterface,
        ...(savedInterfaces[name] ?? {})
      }
    ])
  );

  const restoredState = {
    ...freshState,
    ...savedState,
    management: {
      ...freshState.management,
      ...(savedState.management ?? {})
    },
    vlans: {
      ...freshState.vlans,
      ...(savedState.vlans ?? {})
    },
    inlinePower: freshState.inlinePower.map((entry) => ({
      ...entry,
      ...(savedInlinePower.find((savedEntry) => savedEntry.interface === entry.interface) ?? {})
    })),
    environment: {
      ...freshState.environment,
      ...(savedState.environment ?? {})
    },
    interfaces: restoredInterfaces
  };

  for (const key of Object.keys(GameState)) {
    delete GameState[key];
  }

  Object.assign(GameState, restoredState);

  return GameState;
}

export function resetGameState() {
  const freshState = createD8SW1();

  for (const key of Object.keys(GameState)) {
    delete GameState[key];
  }

  Object.assign(GameState, freshState);

  return GameState;
}
