import { create } from 'zustand';
import { createInitialGameState, performClickAttack, runCombatTick } from '../game/combat';
import { getEquipmentScore } from '../game/equipment';
import {
  calculateEnemyForFloor,
  calculateGoldUpgradeCost,
  calculateStatUpgradeGain,
  isBossFloor
} from '../game/formulas';
import {
  applyOfflineRewards,
  calculateOfflineRewards,
  type OfflineRewards
} from '../game/offline';
import {
  decodeSaveCode,
  encodeSaveCode,
  loadFromLocalStorage,
  saveToLocalStorage
} from '../game/save';
import { getSkillUpgradeCost, getSmeltingGoldMultiplier, normalizeSkills } from '../game/skills';
import type { GameState, SkillId, StatKey } from '../game/types';

interface GameStore {
  game: GameState;
  lastOfflineRewards: OfflineRewards | null;
  tick: (elapsedMs: number, now: number) => void;
  clickEnemy: (now: number) => void;
  upgradeStat: (stat: StatKey, now: number) => void;
  equipItem: (itemId: string, now: number) => void;
  sellWeakerEquipment: (now: number) => void;
  upgradeSkill: (skillId: SkillId, now: number) => void;
  selectDungeonFloor: (floor: number, now: number) => void;
  exportSave: () => string;
  importSave: (code: string) => void;
  resetGame: (now: number) => void;
  loadSavedGame: (now: number) => void;
}

function persist(game: GameState): GameState {
  saveToLocalStorage(game);
  return game;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(Date.now()),
  lastOfflineRewards: null,

  tick: (elapsedMs, now) => {
    const next = persist(runCombatTick(get().game, elapsedMs, now));
    set({ game: next });
  },

  clickEnemy: (now) => {
    const next = persist(performClickAttack(get().game, now));
    set({ game: next });
  },

  upgradeStat: (stat, now) => {
    const game = get().game;
    const currentLevel = game.character.upgradeLevels[stat];
    const cost = calculateGoldUpgradeCost(currentLevel);
    if (game.character.gold < cost) return;

    const statGain = calculateStatUpgradeGain(stat, currentLevel);

    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold - cost,
        stats: {
          ...game.character.stats,
          [stat]: Number((game.character.stats[stat] + statGain).toFixed(3))
        },
        upgradeLevels: {
          ...game.character.upgradeLevels,
          [stat]: currentLevel + 1
        }
      },
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  equipItem: (itemId, now) => {
    const game = get().game;
    const item = game.inventory.find((entry) => entry.id === itemId);
    if (!item) return;

    const skills = normalizeSkills(game.skills);
    const replacedItem = game.equipment[item.slot];
    const refundedGold = replacedItem
      ? Math.floor(getEquipmentScore(replacedItem) * getSmeltingGoldMultiplier(skills.smelting))
      : 0;
    const equipMessages = replacedItem
      ? [`已装备 ${item.name}`, `替换 ${replacedItem.name}，折算 ${refundedGold} 金币`]
      : [`已装备 ${item.name}`];

    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold + refundedGold
      },
      equipment: {
        ...game.equipment,
        [item.slot]: item
      },
      inventory: game.inventory.filter((entry) => entry.id !== itemId),
      recentDrops: [...equipMessages, ...game.recentDrops].slice(0, 8),
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  sellWeakerEquipment: (now) => {
    const game = get().game;
    const skills = normalizeSkills(game.skills);
    const soldItems = game.inventory.filter((item) => {
      const current = game.equipment[item.slot];
      return current ? getEquipmentScore(item) <= getEquipmentScore(current) : false;
    });
    if (soldItems.length === 0) return;

    const gold = Math.floor(
      soldItems.reduce((sum, item) => sum + getEquipmentScore(item), 0) *
        getSmeltingGoldMultiplier(skills.smelting)
    );
    const soldIds = new Set(soldItems.map((item) => item.id));
    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold + gold
      },
      inventory: game.inventory.filter((item) => !soldIds.has(item.id)),
      recentDrops: [`出售 ${soldItems.length} 件低分装备，获得 ${gold} 金币`, ...game.recentDrops].slice(
        0,
        8
      ),
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  upgradeSkill: (skillId, now) => {
    const game = get().game;
    const skills = normalizeSkills(game.skills);
    const skill = skills[skillId];
    if (skill.level <= 0) return;
    const cost = getSkillUpgradeCost(skill);
    if (game.character.gold < cost) return;

    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold - cost
      },
      skills: {
        ...skills,
        [skillId]: {
          ...skill,
          level: skill.level + 1
        }
      },
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  selectDungeonFloor: (floor, now) => {
    const game = get().game;
    const targetFloor = Math.min(
      game.dungeon.highestUnlockedFloor,
      Math.max(1, Math.floor(floor))
    );
    if (targetFloor === game.dungeon.currentFloor) return;

    const next: GameState = {
      ...game,
      dungeon: {
        ...game.dungeon,
        currentFloor: targetFloor
      },
      currentEnemy: calculateEnemyForFloor(targetFloor, isBossFloor(targetFloor)),
      recentDrops: [`前往第 ${targetFloor} 层`, ...game.recentDrops].slice(0, 8),
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  exportSave: () => encodeSaveCode(get().game),

  importSave: (code) => {
    const imported = persist(decodeSaveCode(code));
    set({ game: imported, lastOfflineRewards: null });
  },

  resetGame: (now) => {
    const next = persist(createInitialGameState(now));
    set({ game: next, lastOfflineRewards: null });
  },

  loadSavedGame: (now) => {
    const saved = loadFromLocalStorage();
    if (!saved) {
      const fresh = persist(createInitialGameState(now));
      set({ game: fresh, lastOfflineRewards: null });
      return;
    }
    const rewards = calculateOfflineRewards(saved, now);
    const next = persist(applyOfflineRewards(saved, rewards, now));
    set({ game: next, lastOfflineRewards: rewards });
  }
}));
