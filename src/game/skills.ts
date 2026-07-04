import type { SkillId, SkillState } from './types';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  baseCooldownMs: number;
  baseMultiplier: number;
}

export const SKILL_IDS: SkillId[] = [
  'burst',
  'haste',
  'fortune',
  'execute',
  'combo',
  'insight',
  'treasure',
  'smelting',
  'dragonSlayer'
];

export const SKILL_DEFINITIONS: Record<SkillId, SkillDefinition> = {
  burst: {
    id: 'burst',
    name: '爆发打击',
    description: '提升点击攻击伤害。',
    baseCooldownMs: 8000,
    baseMultiplier: 5
  },
  haste: {
    id: 'haste',
    name: '急速',
    description: '提升自动攻击速度。',
    baseCooldownMs: 16000,
    baseMultiplier: 1.5
  },
  fortune: {
    id: 'fortune',
    name: '幸运',
    description: '提升金币和经验收益。',
    baseCooldownMs: 20000,
    baseMultiplier: 1.25
  },
  execute: {
    id: 'execute',
    name: '斩杀',
    description: '敌人低生命时提高伤害。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  },
  combo: {
    id: 'combo',
    name: '连击',
    description: '提升持续战斗时的伤害。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  },
  insight: {
    id: 'insight',
    name: '悟性',
    description: '提高经验获取。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  },
  treasure: {
    id: 'treasure',
    name: '寻宝',
    description: '提高装备掉落频率。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  },
  smelting: {
    id: 'smelting',
    name: '熔炼',
    description: '提高出售和替换装备获得的金币。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  },
  dragonSlayer: {
    id: 'dragonSlayer',
    name: '屠龙者',
    description: '提高对 Boss 的伤害和 Boss 奖励。',
    baseCooldownMs: 0,
    baseMultiplier: 1
  }
};

export interface SkillRewardResult {
  skills: Record<SkillId, SkillState>;
  message: string;
}

export function createInitialSkills(): Record<SkillId, SkillState> {
  return SKILL_IDS.reduce(
    (skills, id) => ({
      ...skills,
      [id]: { id, level: id === 'burst' ? 1 : 0, cooldownRemainingMs: 0 }
    }),
    {} as Record<SkillId, SkillState>
  );
}

export function normalizeSkills(
  skills: Partial<Record<SkillId, SkillState>>
): Record<SkillId, SkillState> {
  const initial = createInitialSkills();
  return SKILL_IDS.reduce(
    (normalized, id) => ({
      ...normalized,
      [id]: skills[id] ?? { ...initial[id], level: 0 }
    }),
    {} as Record<SkillId, SkillState>
  );
}

export function getSkillUpgradeCost(skill: SkillState): number {
  if (skill.level <= 0) return 0;
  return Math.floor(40 * Math.pow(1.45, skill.level - 1));
}

export function grantRandomSkillReward(
  skills: Partial<Record<SkillId, SkillState>>,
  seed: number
): SkillRewardResult {
  const normalized = normalizeSkills(skills);
  const lockedSkills = SKILL_IDS.filter((id) => normalized[id].level <= 0);

  if (lockedSkills.length > 0) {
    const skillId = pickBySeed(lockedSkills, seed);
    return {
      skills: {
        ...normalized,
        [skillId]: { ...normalized[skillId], level: 1 }
      },
      message: `获得新技能：${SKILL_DEFINITIONS[skillId].name}`
    };
  }

  const skillId = pickBySeed(SKILL_IDS, seed);
  const nextLevel = normalized[skillId].level + 5;
  return {
    skills: {
      ...normalized,
      [skillId]: { ...normalized[skillId], level: nextLevel }
    },
    message: `${SKILL_DEFINITIONS[skillId].name} 提升到 ${nextLevel} 级`
  };
}

export function getBurstClickMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.16;
}

export function getHasteAttackSpeedMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.08;
}

export function getFortuneRewardMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.06;
}

export function getExecuteDamageMultiplier(skill: SkillState, healthPercent: number): number {
  const level = Math.max(0, skill.level);
  if (level <= 0) return 1;
  const threshold = Math.min(0.4, 0.15 + level * 0.006);
  return healthPercent <= threshold ? 1 + level * 0.08 : 1;
}

export function getComboDamageMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.035;
}

export function getInsightExperienceMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.07;
}

export function getTreasureDropInterval(skill: SkillState): number | null {
  const level = Math.max(0, skill.level);
  if (level <= 0) return null;
  return Math.max(3, 10 - Math.floor(level / 2));
}

export function getSmeltingGoldMultiplier(skill: SkillState): number {
  return 1 + Math.max(0, skill.level) * 0.08;
}

export function getDragonSlayerDamageMultiplier(skill: SkillState, isBoss: boolean): number {
  return isBoss ? 1 + Math.max(0, skill.level) * 0.12 : 1;
}

export function getDragonSlayerRewardMultiplier(skill: SkillState, isBoss: boolean): number {
  return isBoss ? 1 + Math.max(0, skill.level) * 0.1 : 1;
}

function pickBySeed<T>(entries: T[], seed: number): T {
  return entries[Math.abs(Math.floor(seed)) % entries.length];
}
