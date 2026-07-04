import { generateEquipmentDrop } from './equipment';
import {
  calculateAttackDamage,
  calculateEnemyForFloor,
  getStableFarmingFloor,
  isBossFloor
} from './formulas';
import { createInitialSkills } from './skills';
import type { GameState } from './types';

export function createInitialGameState(now: number): GameState {
  const firstEnemy = calculateEnemyForFloor(1, false);
  return {
    schemaVersion: 1,
    character: {
      level: 1,
      experience: 0,
      gold: 0,
      stats: {
        attack: 8,
        maxHealth: 100,
        criticalChance: 0.05,
        criticalDamage: 1.5,
        attackSpeed: 1
      },
      upgradeLevels: {
        attack: 1,
        maxHealth: 1,
        criticalChance: 1,
        criticalDamage: 1,
        attackSpeed: 1
      }
    },
    dungeon: {
      currentFloor: 1,
      highestUnlockedFloor: 1,
      highestStableFloor: 1
    },
    currentEnemy: firstEnemy,
    equipment: {},
    inventory: [],
    skills: createInitialSkills(),
    recentDrops: [],
    lastSavedAt: now
  };
}

export function runCombatTick(state: GameState, elapsedMs: number, now: number): GameState {
  const attacks = (elapsedMs / 1000) * state.character.stats.attackSpeed;
  const damage = calculateAttackDamage({
    attack: state.character.stats.attack,
    criticalChance: 0,
    criticalDamage: state.character.stats.criticalDamage,
    multiplier: attacks
  });
  return applyDamage(state, damage, now);
}

export function performClickAttack(state: GameState, now: number): GameState {
  const damage = calculateAttackDamage({
    attack: state.character.stats.attack,
    criticalChance: state.character.stats.criticalChance,
    criticalDamage: state.character.stats.criticalDamage,
    multiplier: 0.65
  });
  return applyDamage(state, damage, now);
}

function applyDamage(state: GameState, damage: number, now: number): GameState {
  const remainingHealth = state.currentEnemy.health - damage;
  if (remainingHealth > 0) {
    return {
      ...state,
      currentEnemy: { ...state.currentEnemy, health: remainingHealth },
      lastSavedAt: now
    };
  }
  return defeatEnemy(state, now);
}

function defeatEnemy(state: GameState, now: number): GameState {
  const nextFloor = state.dungeon.currentFloor + 1;
  const highestUnlockedFloor = Math.max(state.dungeon.highestUnlockedFloor, nextFloor);
  const shouldDropEquipment = state.currentEnemy.isBoss || nextFloor % 4 === 0;
  const droppedItem = shouldDropEquipment
    ? generateEquipmentDrop({ floor: state.dungeon.currentFloor, seed: now })
    : null;
  const inventory = droppedItem ? [droppedItem, ...state.inventory].slice(0, 60) : state.inventory;
  const dropText = droppedItem
    ? [`获得 ${droppedItem.name}`, ...state.recentDrops].slice(0, 8)
    : [`获得 ${state.currentEnemy.goldReward} 金币`, ...state.recentDrops].slice(0, 8);

  return {
    ...state,
    character: {
      ...state.character,
      gold: state.character.gold + state.currentEnemy.goldReward,
      experience: state.character.experience + state.currentEnemy.experienceReward
    },
    dungeon: {
      currentFloor: nextFloor,
      highestUnlockedFloor,
      highestStableFloor: getStableFarmingFloor(nextFloor)
    },
    currentEnemy: calculateEnemyForFloor(nextFloor, isBossFloor(nextFloor)),
    inventory,
    recentDrops: dropText,
    lastSavedAt: now
  };
}
