import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';
import { StatLine } from '../shared/StatLine';

export function DungeonView() {
  const dungeon = useGameStore((state) => state.game.dungeon);

  return (
    <Panel title="地下城">
      <StatLine label="当前层数" value={dungeon.currentFloor} />
      <StatLine label="最高解锁" value={dungeon.highestUnlockedFloor} />
      <StatLine label="稳定刷怪层" value={dungeon.highestStableFloor} />
      <p className="hint">每 10 层会出现 Boss。打不过时会继续积累战力。</p>
    </Panel>
  );
}
