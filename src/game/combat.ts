import { applyEquipmentBonuses, generateEquipmentDrop } from './equipment';
import {
  calculateAttackDamage,
  calculateEnemyForFloor,
  calculateExperienceForLevel,
  getStableFarmingFloor,
  isBossFloor
} from './formulas';
import {
  createInitialSkills,
  grantRandomSkillReward,
  getBurstClickMultiplier,
  getComboDamageMultiplier,
  getDragonSlayerDamageMultiplier,
  getDragonSlayerRewardMultiplier,
  getExecuteDamageMultiplier,
  getFortuneRewardMultiplier,
  getHasteAttackSpeedMultiplier,
  getInsightExperienceMultiplier,
  getTreasureDropInterval,
  normalizeSkills
} from './skills';
import type { CharacterState, CharacterStats, GameState } from './types';

interface ExperienceRewardResult {
  character: CharacterState;
  gainedLevels: number;
  statGains: CharacterStats;
}

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
  const skills = normalizeSkills(state.skills);
  const stats = applyEquipmentBonuses(state.character.stats, state.equipment);
  const attacks =
    (elapsedMs / 1000) *
    stats.attackSpeed *
    getHasteAttackSpeedMultiplier(skills.haste);
  const healthPercent = state.currentEnemy.health / state.currentEnemy.maxHealth;
  const damage = calculateAttackDamage({
    attack: stats.attack,
    criticalChance: 0,
    criticalDamage: stats.criticalDamage,
    multiplier:
      attacks *
      getComboDamageMultiplier(skills.combo) *
      getExecuteDamageMultiplier(skills.execute, healthPercent) *
      getDragonSlayerDamageMultiplier(skills.dragonSlayer, state.currentEnemy.isBoss)
  });
  return applyDamage(state, damage, now);
}

export function performClickAttack(state: GameState, now: number): GameState {
  const skills = normalizeSkills(state.skills);
  const stats = applyEquipmentBonuses(state.character.stats, state.equipment);
  const healthPercent = state.currentEnemy.health / state.currentEnemy.maxHealth;
  const damage = calculateAttackDamage({
    attack: stats.attack,
    criticalChance: stats.criticalChance,
    criticalDamage: stats.criticalDamage,
    multiplier:
      0.65 *
      getBurstClickMultiplier(skills.burst) *
      getComboDamageMultiplier(skills.combo) *
      getExecuteDamageMultiplier(skills.execute, healthPercent) *
      getDragonSlayerDamageMultiplier(skills.dragonSlayer, state.currentEnemy.isBoss)
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
  const skills = normalizeSkills(state.skills);
  const nextFloor = state.dungeon.currentFloor + 1;
  const highestUnlockedFloor = Math.max(state.dungeon.highestUnlockedFloor, nextFloor);
  const rewardMultiplier =
    getFortuneRewardMultiplier(skills.fortune) *
    getDragonSlayerRewardMultiplier(skills.dragonSlayer, state.currentEnemy.isBoss);
  const goldReward = Math.floor(state.currentEnemy.goldReward * rewardMultiplier);
  const experienceRewardAmount = Math.floor(
    state.currentEnemy.experienceReward *
      rewardMultiplier *
      getInsightExperienceMultiplier(skills.insight)
  );
  const treasureDropInterval = getTreasureDropInterval(skills.treasure);
  const shouldDropEquipment =
    state.currentEnemy.isBoss ||
    nextFloor % 4 === 0 ||
    (skills.fortune.level >= 5 && nextFloor % 6 === 0) ||
    (treasureDropInterval !== null && nextFloor % treasureDropInterval === 0);
  const droppedItem = shouldDropEquipment
    ? generateEquipmentDrop({ floor: state.dungeon.currentFloor, seed: now })
    : null;
  const inventory = droppedItem ? [droppedItem, ...state.inventory].slice(0, 60) : state.inventory;
  const experienceReward = applyExperienceReward(state.character, experienceRewardAmount);
  const skillReward = state.currentEnemy.isBoss
    ? grantRandomSkillReward(skills, now + state.currentEnemy.floor)
    : null;
  const rewardMessages = [`获得 ${goldReward} 金币，${experienceRewardAmount} 经验`];

  if (droppedItem) {
    rewardMessages.unshift(`获得 ${droppedItem.name}`);
  }

  if (skillReward) {
    rewardMessages.unshift(skillReward.message);
  }

  if (experienceReward.gainedLevels > 0) {
    const gains = experienceReward.statGains;
    rewardMessages.unshift(
      `升级到 Lv.${experienceReward.character.level}：攻击 +${gains.attack}，生命 +${
        gains.maxHealth
      }，暴击率 +${(gains.criticalChance * 100).toFixed(1)}%，暴击伤害 +${(
        gains.criticalDamage * 100
      ).toFixed(0)}%，攻速 +${gains.attackSpeed.toFixed(2)}`
    );
  }

  return {
    ...state,
    character: {
      ...experienceReward.character,
      gold: experienceReward.character.gold + goldReward
    },
    dungeon: {
      currentFloor: nextFloor,
      highestUnlockedFloor,
      highestStableFloor: getStableFarmingFloor(nextFloor)
    },
    currentEnemy: calculateEnemyForFloor(nextFloor, isBossFloor(nextFloor)),
    skills: skillReward ? skillReward.skills : skills,
    inventory,
    recentDrops: [...rewardMessages, ...state.recentDrops].slice(0, 8),
    lastSavedAt: now
  };
}

function applyExperienceReward(
  character: CharacterState,
  reward: number
): ExperienceRewardResult {
  let level = character.level;
  let experience = character.experience + reward;

  while (experience >= calculateExperienceForLevel(level)) {
    experience -= calculateExperienceForLevel(level);
    level += 1;
  }

  const gainedLevels = level - character.level;
  const statGains = calculateLevelUpStatGains(character.level, level);
  if (gainedLevels === 0) {
    return {
      character: { ...character, experience },
      gainedLevels,
      statGains
    };
  }

  return {
    character: {
      ...character,
      level,
      experience,
      stats: {
        ...character.stats,
        attack: character.stats.attack + statGains.attack,
        maxHealth: character.stats.maxHealth + statGains.maxHealth,
        criticalChance: Number(
          (character.stats.criticalChance + statGains.criticalChance).toFixed(3)
        ),
        criticalDamage: Number(
          (character.stats.criticalDamage + statGains.criticalDamage).toFixed(3)
        ),
        attackSpeed: Number((character.stats.attackSpeed + statGains.attackSpeed).toFixed(3))
      }
    },
    gainedLevels,
    statGains
  };
}

function calculateLevelUpStatGains(fromLevel: number, toLevel: number): CharacterStats {
  const gains: CharacterStats = {
    attack: 0,
    maxHealth: 0,
    criticalChance: 0,
    criticalDamage: 0,
    attackSpeed: 0
  };

  for (let nextLevel = fromLevel + 1; nextLevel <= toLevel; nextLevel += 1) {
    gains.attack += Math.floor(1.5 + nextLevel * 0.8);
    gains.maxHealth += Math.floor(8 + nextLevel * 2.5);
    gains.criticalChance += 0.001 + nextLevel * 0.00025;
    gains.criticalDamage += 0.012 + nextLevel * 0.0025;
    gains.attackSpeed += 0.004 + nextLevel * 0.0008;
  }

  return {
    attack: gains.attack,
    maxHealth: gains.maxHealth,
    criticalChance: Number(gains.criticalChance.toFixed(3)),
    criticalDamage: Number(gains.criticalDamage.toFixed(3)),
    attackSpeed: Number(gains.attackSpeed.toFixed(3))
  };
}
