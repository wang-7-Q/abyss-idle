export type AppTab = 'combat' | 'equipment' | 'skills' | 'dungeon' | 'character' | 'settings';

export interface NavItem {
  id: AppTab;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'combat', label: '战斗' },
  { id: 'equipment', label: '装备' },
  { id: 'skills', label: '技能' },
  { id: 'dungeon', label: '地下城' },
  { id: 'character', label: '角色' },
  { id: 'settings', label: '设置' }
];
