import type { GameState } from './types';

export const SAVE_KEY = 'incremental-dungeon-save-v1';

export function encodeSaveCode(state: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function decodeSaveCode(code: string): GameState {
  try {
    const json = decodeURIComponent(escape(atob(code)));
    const data = JSON.parse(json);
    if (!validateSaveData(data)) {
      throw new Error('存档码缺少必要字段');
    }
    return data;
  } catch {
    throw new Error('存档码无效');
  }
}

export function validateSaveData(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<GameState>;
  return (
    candidate.schemaVersion === 1 &&
    !!candidate.character &&
    !!candidate.dungeon &&
    !!candidate.currentEnemy &&
    !!candidate.skills &&
    Array.isArray(candidate.inventory) &&
    Array.isArray(candidate.recentDrops) &&
    typeof candidate.lastSavedAt === 'number'
  );
}

export function saveToLocalStorage(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadFromLocalStorage(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return validateSaveData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
