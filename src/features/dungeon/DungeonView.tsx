import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';
import { StatLine } from '../shared/StatLine';

export function DungeonView() {
  const dungeon = useGameStore((state) => state.game.dungeon);
  const selectDungeonFloor = useGameStore((state) => state.selectDungeonFloor);
  const canGoDown = dungeon.currentFloor > 1;
  const canGoUp = dungeon.currentFloor < dungeon.highestUnlockedFloor;

  return (
    <Panel title="地下城">
      <StatLine label="当前层数" value={dungeon.currentFloor} />
      <StatLine label="最高解锁" value={dungeon.highestUnlockedFloor} />
      <StatLine label="稳定刷怪层" value={dungeon.highestStableFloor} />

      <div className="dungeon-controls">
        <button
          disabled={!canGoDown}
          type="button"
          onClick={() => selectDungeonFloor(dungeon.currentFloor - 1, Date.now())}
        >
          上一层
        </button>
        <button
          type="button"
          onClick={() => selectDungeonFloor(dungeon.highestStableFloor, Date.now())}
        >
          稳定刷怪
        </button>
        <button
          disabled={!canGoUp}
          type="button"
          onClick={() => selectDungeonFloor(dungeon.currentFloor + 1, Date.now())}
        >
          下一层
        </button>
      </div>

      <div className="floor-jump-grid">
        {makeFloorButtons(dungeon.highestUnlockedFloor).map((floor) => (
          <button
            className={floor === dungeon.currentFloor ? 'floor-button active' : 'floor-button'}
            key={floor}
            type="button"
            onClick={() => selectDungeonFloor(floor, Date.now())}
          >
            {floor}
          </button>
        ))}
      </div>

      <p className="hint">每 10 层会出现 Boss。回到低层可以更稳定地刷金币、经验和装备。</p>
    </Panel>
  );
}

function makeFloorButtons(highestUnlockedFloor: number): number[] {
  const start = Math.max(1, highestUnlockedFloor - 23);
  return Array.from({ length: highestUnlockedFloor - start + 1 }, (_, index) => start + index);
}
