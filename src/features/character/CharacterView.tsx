import { calculateGoldUpgradeCost } from '../../game/formulas';
import type { StatKey } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';
import { StatLine } from '../shared/StatLine';

const labels: Record<StatKey, string> = {
  attack: '攻击力',
  maxHealth: '生命值',
  criticalChance: '暴击率',
  criticalDamage: '暴击伤害',
  attackSpeed: '攻击速度'
};

export function CharacterView() {
  const game = useGameStore((state) => state.game);
  const upgradeStat = useGameStore((state) => state.upgradeStat);
  const statKeys = Object.keys(labels) as StatKey[];

  return (
    <div className="view-grid">
      <Panel title="角色">
        <StatLine label="等级" value={game.character.level} />
        <StatLine label="经验" value={game.character.experience} />
        <StatLine label="金币" value={game.character.gold} />
      </Panel>
      <Panel title="属性升级">
        {statKeys.map((key) => {
          const level = game.character.upgradeLevels[key];
          const cost = calculateGoldUpgradeCost(level);
          return (
            <button
              className="upgrade-row"
              key={key}
              type="button"
              onClick={() => upgradeStat(key, Date.now())}
            >
              <span>{labels[key]}</span>
              <strong>{game.character.stats[key]}</strong>
              <em>{cost} 金币</em>
            </button>
          );
        })}
      </Panel>
    </div>
  );
}
