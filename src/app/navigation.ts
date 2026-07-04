export type AppTab = 'combat' | 'equipment' | 'dungeon' | 'settings';

export interface NavItem {
  id: AppTab;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'combat', label: '战斗' },
  { id: 'equipment', label: '装备' },
  { id: 'dungeon', label: '地下城' },
  { id: 'settings', label: '设置' }
];
