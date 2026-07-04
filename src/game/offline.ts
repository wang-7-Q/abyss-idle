import { calculateEnemyForFloor } from './formulas';
import type { GameState } from './types';

const MAX_OFFLINE_MS = 1000 * 60 * 60 * 8;

export interface OfflineRewards {
  elapsedMs: number;
  effectiveMs: number;
  gold: number;
  experience: number;
  equipmentCount: number;
}

export function calculateOfflineRewards(state: GameState, now: number): OfflineRewards {
  const elapsedMs = Math.max(0, now - state.lastSavedAt);
  const effectiveMs = Math.min(elapsedMs, MAX_OFFLINE_MS);
  const stableFloor = Math.max(1, state.dungeon.highestStableFloor);
  const enemy = calculateEnemyForFloor(stableFloor, false);
  const killsPerMinute = Math.max(1, state.character.stats.attackSpeed * 2);
  const minutes = effectiveMs / 60000;
  const estimatedKills = Math.floor(minutes * killsPerMinute);

  return {
    elapsedMs,
    effectiveMs,
    gold: estimatedKills * enemy.goldReward,
    experience: estimatedKills * enemy.experienceReward,
    equipmentCount: Math.floor(estimatedKills / 45)
  };
}

export function applyOfflineRewards(
  state: GameState,
  rewards: OfflineRewards,
  now: number
): GameState {
  return {
    ...state,
    character: {
      ...state.character,
      gold: state.character.gold + rewards.gold,
      experience: state.character.experience + rewards.experience
    },
    recentDrops: [
      `离线获得 ${rewards.gold} 金币`,
      `离线获得 ${rewards.experience} 经验`,
      ...state.recentDrops
    ].slice(0, 8),
    lastSavedAt: now
  };
}
