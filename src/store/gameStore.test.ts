import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetGame(1000);
  });

  it('performs click attack through store action', () => {
    const before = useGameStore.getState().game.currentEnemy.health;

    useGameStore.getState().clickEnemy(1001);

    expect(useGameStore.getState().game.currentEnemy.health).toBeLessThan(before);
  });

  it('exports and imports save code', () => {
    useGameStore.getState().clickEnemy(1001);
    const code = useGameStore.getState().exportSave();

    useGameStore.getState().resetGame(2000);
    useGameStore.getState().importSave(code);

    expect(useGameStore.getState().game.schemaVersion).toBe(1);
  });
});
