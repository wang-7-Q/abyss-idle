import { describe, expect, it } from 'vitest';
import { createInitialGameState, performClickAttack, runCombatTick } from './combat';

describe('combat', () => {
  it('creates a playable initial state', () => {
    const state = createInitialGameState(1000);

    expect(state.character.level).toBe(1);
    expect(state.dungeon.currentFloor).toBe(1);
    expect(state.currentEnemy.health).toBeGreaterThan(0);
    expect(state.skills.burst.level).toBe(1);
  });

  it('auto attack damages the current enemy', () => {
    const state = createInitialGameState(1000);
    const next = runCombatTick(state, 1000, 2000);

    expect(next.currentEnemy.health).toBeLessThan(state.currentEnemy.health);
  });

  it('click attack damages the current enemy', () => {
    const state = createInitialGameState(1000);
    const next = performClickAttack(state, 1001);

    expect(next.currentEnemy.health).toBeLessThan(state.currentEnemy.health);
  });

  it('defeating an enemy grants rewards and advances floor', () => {
    const state = createInitialGameState(1000);
    const weakEnemyState = {
      ...state,
      currentEnemy: { ...state.currentEnemy, health: 1 }
    };
    const next = performClickAttack(weakEnemyState, 1001);

    expect(next.character.gold).toBeGreaterThan(state.character.gold);
    expect(next.character.experience).toBeGreaterThan(state.character.experience);
    expect(next.dungeon.currentFloor).toBe(2);
  });
});
