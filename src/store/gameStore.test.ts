import { beforeEach, describe, expect, it } from 'vitest';
import { generateEquipmentDrop } from '../game/equipment';
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

  it('equips an item from inventory', () => {
    const item = generateEquipmentDrop({ floor: 5, seed: 1 });
    useGameStore.setState((state) => ({
      game: { ...state.game, inventory: [item] }
    }));

    useGameStore.getState().equipItem(item.id, 1002);

    expect(useGameStore.getState().game.equipment[item.slot]?.id).toBe(item.id);
  });

  it('upgrades a skill when enough gold is available', () => {
    useGameStore.setState((state) => ({
      game: {
        ...state.game,
        character: { ...state.game.character, gold: 1000 }
      }
    }));

    useGameStore.getState().upgradeSkill('burst', 1002);

    expect(useGameStore.getState().game.skills.burst.level).toBe(2);
  });
});
