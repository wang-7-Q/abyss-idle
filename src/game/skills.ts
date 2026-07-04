import type { SkillId, SkillState } from './types';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  baseCooldownMs: number;
  baseMultiplier: number;
}

export const SKILL_DEFINITIONS: Record<SkillId, SkillDefinition> = {
  burst: {
    id: 'burst',
    name: '爆发打击',
    description: '造成一次高额伤害。',
    baseCooldownMs: 8000,
    baseMultiplier: 5
  },
  haste: {
    id: 'haste',
    name: '急速',
    description: '短时间提升攻击速度。',
    baseCooldownMs: 16000,
    baseMultiplier: 1.5
  },
  fortune: {
    id: 'fortune',
    name: '幸运',
    description: '短时间提升金币和掉落收益。',
    baseCooldownMs: 20000,
    baseMultiplier: 1.25
  }
};

export function createInitialSkills(): Record<SkillId, SkillState> {
  return {
    burst: { id: 'burst', level: 1, cooldownRemainingMs: 0 },
    haste: { id: 'haste', level: 1, cooldownRemainingMs: 0 },
    fortune: { id: 'fortune', level: 1, cooldownRemainingMs: 0 }
  };
}

export function getSkillUpgradeCost(skill: SkillState): number {
  return Math.floor(40 * Math.pow(1.45, skill.level - 1));
}
