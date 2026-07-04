import { useEffect, useRef } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';
import { StatLine } from '../shared/StatLine';

export function CombatView() {
  const game = useGameStore((state) => state.game);
  const tick = useGameStore((state) => state.tick);
  const clickEnemy = useGameStore((state) => state.clickEnemy);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const id = window.setInterval(() => {
      const now = Date.now();
      tick(now - lastTick.current, now);
      lastTick.current = now;
    }, 1000);
    return () => window.clearInterval(id);
  }, [tick]);

  const enemy = game.currentEnemy;
  const healthPercent = Math.max(0, (enemy.health / enemy.maxHealth) * 100);

  return (
    <div className="view-grid combat-grid">
      <Panel title={`第 ${game.dungeon.currentFloor} 层`}>
        <button className="enemy-button" type="button" onClick={() => clickEnemy(Date.now())}>
          <span>{enemy.isBoss ? 'Boss' : '怪物'}</span>
          <strong>{enemy.name}</strong>
          <em>点击攻击</em>
        </button>
        <div className="health-bar" aria-label="敌人生命值">
          <div style={{ width: `${healthPercent}%` }} />
        </div>
        <StatLine label="生命" value={`${Math.ceil(enemy.health)} / ${enemy.maxHealth}`} />
        <StatLine label="金币奖励" value={enemy.goldReward} />
        <StatLine label="经验奖励" value={enemy.experienceReward} />
      </Panel>

      <Panel title="最近掉落">
        <div className="list">
          {game.recentDrops.length === 0 ? <p>尚无掉落。</p> : null}
          {game.recentDrops.map((drop, index) => (
            <p key={`${drop}-${index}`}>{drop}</p>
          ))}
        </div>
      </Panel>
    </div>
  );
}
