import { getEquipmentScore } from '../../game/equipment';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function EquipmentView() {
  const game = useGameStore((state) => state.game);
  const equipItem = useGameStore((state) => state.equipItem);

  return (
    <div className="view-grid">
      <Panel title="已装备">
        {(['weapon', 'armor', 'accessory'] as const).map((slot) => {
          const item = game.equipment[slot];
          return (
            <div className="item-row" key={slot}>
              <span>{slotLabel(slot)}</span>
              <strong>{item ? item.name : '空'}</strong>
              <em>{item ? `评分 ${getEquipmentScore(item)}` : '无装备'}</em>
            </div>
          );
        })}
      </Panel>
      <Panel title="背包">
        {game.inventory.length === 0 ? <p>还没有装备掉落。</p> : null}
        {game.inventory.map((item) => (
          <button
            className={`item-row rarity-${item.rarity}`}
            key={item.id}
            type="button"
            onClick={() => equipItem(item.id, Date.now())}
          >
            <span>{item.name}</span>
            <strong>等级 {item.itemLevel}</strong>
            <em>装备</em>
          </button>
        ))}
      </Panel>
    </div>
  );
}

function slotLabel(slot: 'weapon' | 'armor' | 'accessory'): string {
  return {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品'
  }[slot];
}
