import { create } from 'zustand';
import { createInitialGameState, performClickAttack, runCombatTick } from '../game/combat';
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
import type { GameState, StatKey } from '../game/types';
import { calculateGoldUpgradeCost } from '../game/formulas';

interface GameStore {
  game: GameState;
  lastOfflineRewards: OfflineRewards | null;
  tick: (elapsedMs: number, now: number) => void;
  clickEnemy: (now: number) => void;
  upgradeStat: (stat: StatKey, now: number) => void;
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

    const statGain: Record<StatKey, number> = {
      attack: 2,
      maxHealth: 10,
      criticalChance: 0.005,
      criticalDamage: 0.05,
      attackSpeed: 0.03
    };

    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold - cost,
        stats: {
          ...game.character.stats,
          [stat]: Number((game.character.stats[stat] + statGain[stat]).toFixed(3))
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
