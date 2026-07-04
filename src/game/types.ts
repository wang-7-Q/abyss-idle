export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type EquipmentRarity = 'common' | 'magic' | 'rare' | 'epic';
export type StatKey =
  | 'attack'
  | 'maxHealth'
  | 'criticalChance'
  | 'criticalDamage'
  | 'attackSpeed';

export interface CharacterStats {
  attack: number;
  maxHealth: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
}

export interface CharacterState {
  level: number;
  experience: number;
  gold: number;
  stats: CharacterStats;
  upgradeLevels: Record<StatKey, number>;
}

export interface EquipmentStat {
  key: StatKey;
  value: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  itemLevel: number;
  mainStat: EquipmentStat;
  secondaryStats: EquipmentStat[];
  affixes: string[];
  effect: string | null;
}

export interface EnemyState {
  id: string;
  name: string;
  floor: number;
  isBoss: boolean;
  maxHealth: number;
  health: number;
  goldReward: number;
  experienceReward: number;
}

export type SkillId = 'burst' | 'haste' | 'fortune';

export interface SkillState {
  id: SkillId;
  level: number;
  cooldownRemainingMs: number;
}

export interface DungeonState {
  currentFloor: number;
  highestUnlockedFloor: number;
  highestStableFloor: number;
}

export interface GameState {
  schemaVersion: 1;
  character: CharacterState;
  dungeon: DungeonState;
  currentEnemy: EnemyState;
  equipment: Partial<Record<EquipmentSlot, EquipmentItem>>;
  inventory: EquipmentItem[];
  skills: Record<SkillId, SkillState>;
  recentDrops: string[];
  lastSavedAt: number;
}
