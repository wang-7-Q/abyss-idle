import { useEffect, useRef, useState } from 'react';
import { applyEquipmentBonuses, calculateEquipmentBonuses } from '../../game/equipment';
import { calculateGoldUpgradeCost, calculateStatUpgradeGain } from '../../game/formulas';
import {
  SKILL_DEFINITIONS,
  getBurstClickMultiplier,
  getComboDamageMultiplier,
  getDragonSlayerDamageMultiplier,
  getFortuneRewardMultiplier,
  getHasteAttackSpeedMultiplier,
  getInsightExperienceMultiplier,
  getSmeltingGoldMultiplier,
  getSkillUpgradeCost
} from '../../game/skills';
import type { SkillId, SkillState, StatKey } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';
import { StatLine } from '../shared/StatLine';
import { getExperienceProgress } from './playerSummary';

const statLabels: Record<StatKey, string> = {
  attack: '攻击力',
  maxHealth: '生命值',
  criticalChance: '暴击率',
  criticalDamage: '暴击伤害',
  attackSpeed: '攻击速度'
};

export function CombatView() {
  const game = useGameStore((state) => state.game);
  const tick = useGameStore((state) => state.tick);
  const clickEnemy = useGameStore((state) => state.clickEnemy);
  const upgradeStat = useGameStore((state) => state.upgradeStat);
  const upgradeSkill = useGameStore((state) => state.upgradeSkill);
  const [autoCombat, setAutoCombat] = useState(false);
  const lastTick = useRef(Date.now());
  const hoverAttackInterval = useRef<number | null>(null);

  const enemy = game.currentEnemy;
  const equipmentBonuses = calculateEquipmentBonuses(game.equipment);
  const effectiveStats = applyEquipmentBonuses(game.character.stats, game.equipment);
  const attackSpeed = effectiveStats.attackSpeed * getHasteAttackSpeedMultiplier(game.skills.haste);
  const healthPercent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);
  const experienceProgress = getExperienceProgress(game.character);
  const statKeys = Object.keys(statLabels) as StatKey[];
  const attackEnemy = () => clickEnemy(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      tick(now - lastTick.current, now);
      lastTick.current = now;
    }, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (!autoCombat) return undefined;
    attackEnemy();
    const intervalMs = Math.max(120, Math.round(1000 / attackSpeed));
    const id = window.setInterval(attackEnemy, intervalMs);
    return () => window.clearInterval(id);
  }, [autoCombat, attackSpeed, clickEnemy]);

  useEffect(() => {
    return () => {
      if (hoverAttackInterval.current !== null) {
        window.clearInterval(hoverAttackInterval.current);
      }
    };
  }, []);

  const stopHoverAttack = () => {
    if (hoverAttackInterval.current === null) return;
    window.clearInterval(hoverAttackInterval.current);
    hoverAttackInterval.current = null;
  };

  const startHoverAttack = () => {
    if (hoverAttackInterval.current !== null || autoCombat) return;
    attackEnemy();
    const intervalMs = Math.max(120, Math.round(1000 / attackSpeed));
    hoverAttackInterval.current = window.setInterval(attackEnemy, intervalMs);
  };

  return (
    <div className="combat-view">
      <div className="combat-status-bar" aria-label="角色状态">
        <div className="status-chip">
          <span>等级</span>
          <strong>{game.character.level}</strong>
        </div>
        <div className="experience-summary">
          <div className="experience-copy">
            <span>经验</span>
            <strong>
              {experienceProgress.current} / {experienceProgress.required}
            </strong>
          </div>
          <div className="experience-bar" aria-label="经验进度">
            <div style={{ width: `${experienceProgress.percent}%` }} />
          </div>
        </div>
        <div className="status-chip">
          <span>金币</span>
          <strong>{game.character.gold}</strong>
        </div>
      </div>

      <div className="view-grid combat-grid">
        <Panel title={`第 ${game.dungeon.currentFloor} 层`}>
          <button
            className={autoCombat ? 'auto-combat-toggle active' : 'auto-combat-toggle'}
            type="button"
            onClick={() => setAutoCombat((current) => !current)}
          >
            {autoCombat ? '自动战斗：开启' : '自动战斗：关闭'}
          </button>
          <button
            className="enemy-button"
            type="button"
            onClick={attackEnemy}
            onMouseEnter={startHoverAttack}
            onMouseLeave={stopHoverAttack}
          >
            <span>{enemy.isBoss ? 'Boss' : '怪物'}</span>
            <strong>{enemy.name}</strong>
            <em>{autoCombat ? '自动攻击中' : '悬停自动攻击'}</em>
          </button>
          <div className="health-bar" aria-label="敌人生命值">
            <div style={{ width: `${healthPercent}%` }} />
          </div>
          <StatLine label="生命" value={`${Math.ceil(enemy.health)} / ${enemy.maxHealth}`} />
          <StatLine label="金币奖励" value={enemy.goldReward} />
          <StatLine label="经验奖励" value={enemy.experienceReward} />
        </Panel>

        <Panel title="最近奖励">
          <div className="list">
            {game.recentDrops.length === 0 ? <p>暂无奖励。</p> : null}
            {game.recentDrops.map((drop, index) => (
              <p key={`${drop}-${index}`}>{drop}</p>
            ))}
          </div>
        </Panel>
      </div>

      <div className="view-grid main-upgrade-grid">
        <Panel title="属性升级">
          {statKeys.map((key) => {
            const level = game.character.upgradeLevels[key];
            const cost = calculateGoldUpgradeCost(level);
            const gain = calculateStatUpgradeGain(key, level);
            const nextValue = effectiveStats[key] + gain;
            return (
              <button
                className="upgrade-row"
                key={key}
                type="button"
                onClick={() => upgradeStat(key, Date.now())}
              >
                <span>{statLabels[key]}</span>
                <strong>
                  {formatStatValue(key, effectiveStats[key])} {'->'} {formatStatValue(key, nextValue)}
                </strong>
                <em>
                  {equipmentBonuses[key] > 0
                    ? `装备 +${formatStatValue(key, equipmentBonuses[key])} / ${cost} 金币`
                    : `${cost} 金币`}
                </em>
              </button>
            );
          })}
        </Panel>

        <Panel title="技能升级">
          {Object.values(game.skills).map((skill) => {
            const definition = SKILL_DEFINITIONS[skill.id];
            const isLocked = skill.level <= 0;
            return (
              <button
                className="item-row"
                disabled={isLocked}
                key={skill.id}
                type="button"
                onClick={() => upgradeSkill(skill.id, Date.now())}
              >
                <span>{definition.name}</span>
                <strong>{isLocked ? '未获得' : `等级 ${skill.level}`}</strong>
                <em>
                  {isLocked
                    ? '每 10 层有机会获得'
                    : `${skillEffectText(skill)} / ${getSkillUpgradeCost(skill)} 金币`}
                </em>
              </button>
            );
          })}
        </Panel>
      </div>
    </div>
  );
}

function skillEffectText(skill: SkillState): string {
  if (skill.id === 'burst') {
    return `点击 x${getBurstClickMultiplier(skill).toFixed(2)}`;
  }
  if (skill.id === 'haste') {
    return `攻速 x${getHasteAttackSpeedMultiplier(skill).toFixed(2)}`;
  }
  if (skill.id === 'fortune') {
    return `收益 x${getFortuneRewardMultiplier(skill).toFixed(2)}`;
  }
  if (skill.id === 'execute') {
    return `低血增伤`;
  }
  if (skill.id === 'combo') {
    return `连击 x${getComboDamageMultiplier(skill).toFixed(2)}`;
  }
  if (skill.id === 'insight') {
    return `经验 x${getInsightExperienceMultiplier(skill).toFixed(2)}`;
  }
  if (skill.id === 'treasure') {
    return '更多掉落';
  }
  if (skill.id === 'smelting') {
    return `出售 x${getSmeltingGoldMultiplier(skill).toFixed(2)}`;
  }
  return `Boss x${getDragonSlayerDamageMultiplier(skill, true).toFixed(2)}`;
}

function formatStatValue(stat: StatKey, value: number): string {
  if (stat === 'criticalChance' || stat === 'criticalDamage') {
    return `${(value * 100).toFixed(1)}%`;
  }
  if (stat === 'attackSpeed') {
    return value.toFixed(2);
  }
  return `${value}`;
}
