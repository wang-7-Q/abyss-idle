import { describe, expect, it } from 'vitest';
import {
  calculateAttackDamage,
  calculateEnemyForFloor,
  calculateGoldUpgradeCost,
  getStableFarmingFloor
} from './formulas';

describe('game formulas', () => {
  it('calculates non-critical and critical damage', () => {
    expect(
      calculateAttackDamage({
        attack: 10,
        criticalChance: 0,
        criticalDamage: 1.5,
        multiplier: 1
      })
    ).toBe(10);

    expect(
      calculateAttackDamage({
        attack: 10,
        criticalChance: 1,
        criticalDamage: 1.5,
        multiplier: 2
      })
    ).toBe(30);
  });

  it('scales enemies by floor', () => {
    const floor1 = calculateEnemyForFloor(1, false);
    const floor10Boss = calculateEnemyForFloor(10, true);

    expect(floor1.maxHealth).toBeGreaterThan(0);
    expect(floor10Boss.maxHealth).toBeGreaterThan(floor1.maxHealth);
    expect(floor10Boss.goldReward).toBeGreaterThan(floor1.goldReward);
  });

  it('increases upgrade costs by level', () => {
    expect(calculateGoldUpgradeCost(1)).toBeLessThan(calculateGoldUpgradeCost(10));
  });

  it('uses the previous normal floor as stable floor when current floor is a boss gate', () => {
    expect(getStableFarmingFloor(1)).toBe(1);
    expect(getStableFarmingFloor(10)).toBe(9);
    expect(getStableFarmingFloor(21)).toBe(21);
  });
});
