import { useEffect, useState } from 'react';
import { CombatView } from '../features/combat/CombatView';
import { DungeonView } from '../features/dungeon/DungeonView';
import { EquipmentView } from '../features/equipment/EquipmentView';
import { SettingsView } from '../features/settings/SettingsView';
import { useGameStore } from '../store/gameStore';
import { type AppTab, NAV_ITEMS } from './navigation';

export function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('combat');
  const loadSavedGame = useGameStore((state) => state.loadSavedGame);

  useEffect(() => {
    loadSavedGame(Date.now());
  }, [loadSavedGame]);

  return (
    <main className="app-layout">
      <nav className="app-nav" aria-label="主导航">
        <div className="brand">
          <span>暗黑刷宝</span>
          <strong>增量地下城</strong>
        </div>
        {NAV_ITEMS.map((item) => (
          <button
            className={item.id === activeTab ? 'nav-button active' : 'nav-button'}
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <section className="app-content">{renderTab(activeTab)}</section>
    </main>
  );
}

function renderTab(tab: AppTab) {
  switch (tab) {
    case 'combat':
      return <CombatView />;
    case 'equipment':
      return <EquipmentView />;
    case 'dungeon':
      return <DungeonView />;
    case 'settings':
      return <SettingsView />;
  }
}
