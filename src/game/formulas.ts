import { BALANCE } from './balance';
import type { EnemyState } from './types';

export interface DamageInput {
  attack: number;
  criticalChance: number;
  criticalDamage: number;
  multiplier: number;
}

export function calculateAttackDamage(input: DamageInput): number {
  const isCritical = input.criticalChance >= 1;
  const criticalMultiplier = isCritical ? input.criticalDamage : 1;
  return Math.max(1, Math.floor(input.attack * input.multiplier * criticalMultiplier));
}

export function calculateEnemyForFloor(floor: number, isBoss: boolean): EnemyState {
  const safeFloor = Math.max(1, Math.floor(floor));
  const healthBase =
    BALANCE.baseEnemyHealth * Math.pow(BALANCE.enemyHealthGrowth, safeFloor - 1);
  const maxHealth = Math.floor(healthBase * (isBoss ? BALANCE.bossHealthMultiplier : 1));
  const goldReward = Math.floor(
    BALANCE.baseGoldReward * Math.pow(BALANCE.goldGrowth, safeFloor - 1) * (isBoss ? 4 : 1)
  );
  const experienceReward = Math.floor(
    BALANCE.baseExperienceReward *
      Math.pow(BALANCE.experienceGrowth, safeFloor - 1) *
      (isBoss ? 4 : 1)
  );

  return {
    id: `${isBoss ? 'boss' : 'enemy'}-${safeFloor}-${Date.now()}`,
    name: isBoss ? `第 ${safeFloor} 层守卫` : `第 ${safeFloor} 层怪物`,
    floor: safeFloor,
    isBoss,
    maxHealth,
    health: maxHealth,
    goldReward,
    experienceReward
  };
}

export function calculateGoldUpgradeCost(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.floor(BALANCE.baseUpgradeCost * Math.pow(BALANCE.upgradeCostGrowth, safeLevel - 1));
}

export function isBossFloor(floor: number): boolean {
  return floor > 0 && floor % BALANCE.bossEvery === 0;
}

export function getStableFarmingFloor(currentFloor: number): number {
  if (currentFloor <= 1) {
    return 1;
  }
  return isBossFloor(currentFloor) ? currentFloor - 1 : currentFloor;
}
