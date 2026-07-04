import { getEquipmentScore } from '../../game/equipment';
import type { EquipmentItem, EquipmentSlot, EquipmentStat, StatKey } from '../../game/types';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

export function EquipmentView() {
  const game = useGameStore((state) => state.game);
  const equipItem = useGameStore((state) => state.equipItem);
  const sellWeakerEquipment = useGameStore((state) => state.sellWeakerEquipment);
  const sellableItems = game.inventory.filter((item) => {
    const current = game.equipment[item.slot];
    return current ? getEquipmentScore(item) <= getEquipmentScore(current) : false;
  });
  const sellableGold = sellableItems.reduce((sum, item) => sum + getEquipmentScore(item), 0);

  return (
    <div className="view-grid">
      <Panel title="已装备">
        {slots.map((slot) => {
          const item = game.equipment[slot];
          return (
            <div className="equipment-card" key={slot}>
              <div className="item-row">
                <span>{slotLabel(slot)}</span>
                <strong>{item ? item.name : '空'}</strong>
                <em>评分 {item ? getEquipmentScore(item) : 0}</em>
              </div>
              <p className="equipment-stats">
                {item ? formatEquipmentStats(item) : '未装备，暂无属性加成'}
              </p>
            </div>
          );
        })}
      </Panel>

      <Panel title="背包">
        <button
          className="inventory-action"
          disabled={sellableItems.length === 0}
          type="button"
          onClick={() => sellWeakerEquipment(Date.now())}
        >
          出售低分装备
          <span>
            {sellableItems.length} 件 / {sellableGold} 金币
          </span>
        </button>

        {game.inventory.length === 0 ? <p>还没有装备掉落。</p> : null}
        {game.inventory.map((item) => {
          const current = game.equipment[item.slot];
          const score = getEquipmentScore(item);
          const delta = current ? score - getEquipmentScore(current) : score;
          return (
            <button
              className={`item-row rarity-${item.rarity}`}
              key={item.id}
              type="button"
              onClick={() => equipItem(item.id, Date.now())}
            >
              <span>{item.name}</span>
              <strong>评分 {score}</strong>
              <em>{delta >= 0 ? `+${delta}` : delta} 装备</em>
            </button>
          );
        })}
      </Panel>
    </div>
  );
}

function formatEquipmentStats(item: EquipmentItem): string {
  return [item.mainStat, ...item.secondaryStats].map(formatEquipmentStat).join(' / ');
}

function formatEquipmentStat(stat: EquipmentStat): string {
  const value =
    stat.key === 'criticalChance' || stat.key === 'criticalDamage'
      ? `${(stat.value * 100).toFixed(1)}%`
      : stat.key === 'attackSpeed'
        ? stat.value.toFixed(3)
        : `${stat.value}`;
  return `${statLabel(stat.key)} +${value}`;
}

function statLabel(stat: StatKey): string {
  return {
    attack: '攻击',
    maxHealth: '生命',
    criticalChance: '暴击率',
    criticalDamage: '暴击伤害',
    attackSpeed: '攻速'
  }[stat];
}

function slotLabel(slot: EquipmentSlot): string {
  return {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品'
  }[slot];
}
