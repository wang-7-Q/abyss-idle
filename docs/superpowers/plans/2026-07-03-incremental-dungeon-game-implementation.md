# 暗黑刷宝增量游戏 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 搭建并实现一个可玩的暗黑刷宝增量游戏 MVP，支持电脑网页和手机响应式布局，包含战斗、成长、装备、技能、地下城、存档、导入导出和 8 小时离线收益。

**Architecture:** 使用 React + TypeScript + Vite 构建单页游戏。核心游戏逻辑放在 `src/game/`，不依赖 React；UI 放在 `src/features/` 和 `src/app/`；全局状态放在 `src/store/`。先完成纯前端网页 MVP，并为后续 Capacitor App 打包保留结构。

**Tech Stack:** React, TypeScript, Vite, Zustand, Vitest, CSS Modules 或普通 CSS, localStorage.

---

## 文件结构

本计划会创建以下主要文件：

- `package.json`：项目脚本、运行依赖、测试依赖。
- `tsconfig.json`、`tsconfig.node.json`、`vite.config.ts`：TypeScript 和 Vite 配置。
- `index.html`：Vite 入口 HTML。
- `src/main.tsx`：React 入口。
- `src/app/App.tsx`：应用外壳、响应式导航、页面切换。
- `src/app/navigation.ts`：页面 tab 定义。
- `src/styles/global.css`：全局主题、布局、响应式规则。
- `src/game/types.ts`：游戏状态、装备、敌人、技能、存档等类型。
- `src/game/balance.ts`：可调数值常量。
- `src/game/formulas.ts`：伤害、怪物成长、升级费用、收益公式。
- `src/game/equipment.ts`：装备生成、比较、穿戴判断。
- `src/game/combat.ts`：战斗 tick、点击伤害、击杀结算。
- `src/game/skills.ts`：技能定义、释放和升级。
- `src/game/offline.ts`：离线收益计算。
- `src/game/save.ts`：存档序列化、导入、导出、校验、版本迁移入口。
- `src/store/gameStore.ts`：Zustand 状态、动作、自动保存协调。
- `src/features/combat/CombatView.tsx`：战斗页。
- `src/features/equipment/EquipmentView.tsx`：装备页。
- `src/features/skills/SkillsView.tsx`：技能页。
- `src/features/dungeon/DungeonView.tsx`：地下城页。
- `src/features/character/CharacterView.tsx`：角色页。
- `src/features/settings/SettingsView.tsx`：设置页、导入导出。
- `src/features/shared/StatLine.tsx`：属性展示小组件。
- `src/features/shared/Panel.tsx`：通用面板组件。
- `src/game/*.test.ts`：核心逻辑测试。

---

## Task 1: 初始化项目骨架

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `vite.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/styles/global.css`
- Create: `.gitignore`

- [ ] **Step 1: 创建 `package.json`**

写入：

```json
{
  "name": "incremental-dungeon-game",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "lint": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "@vitejs/plugin-react": "^4.3.0",
    "vite": "^5.4.0",
    "typescript": "^5.5.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "vitest": "^2.0.5",
    "jsdom": "^24.1.1"
  }
}
```

- [ ] **Step 2: 创建 TypeScript 和 Vite 配置**

`tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

`tsconfig.node.json`：

```json
{
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

`vite.config.ts`：

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true
  }
});
```

- [ ] **Step 3: 创建最小 React 入口**

`index.html`：

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>暗黑刷宝增量</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/main.tsx`：

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/app/App.tsx`：

```tsx
export function App() {
  return (
    <main className="app-shell">
      <section className="intro-screen">
        <p className="eyebrow">暗黑刷宝增量</p>
        <h1>地下城入口</h1>
        <p>项目骨架已启动。下一步会接入游戏状态和页面。</p>
      </section>
    </main>
  );
}
```

`src/styles/global.css`：

```css
:root {
  color: #f4efe8;
  background: #12100d;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(circle at 25% 15%, rgba(126, 41, 27, 0.22), transparent 28rem),
    linear-gradient(145deg, #17130f 0%, #0c0b0a 100%);
}

button,
input,
textarea {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.intro-screen {
  display: grid;
  min-height: calc(100vh - 48px);
  place-content: center;
  text-align: center;
}

.eyebrow {
  color: #e2a15f;
  font-size: 0.78rem;
  letter-spacing: 0;
  margin: 0 0 8px;
}

h1 {
  margin: 0 0 12px;
  font-size: clamp(2rem, 7vw, 4rem);
}
```

- [ ] **Step 4: 创建 `.gitignore`**

```gitignore
node_modules/
dist/
.superpowers/
.vite/
coverage/
*.local
```

- [ ] **Step 5: 安装依赖**

Run: `npm install`

Expected: creates `node_modules/` and `package-lock.json` without dependency resolution errors.

- [ ] **Step 6: 验证骨架**

Run: `npm run build`

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 7: 提交**

如果当前目录不是 Git 仓库，先执行：

```bash
git init
```

然后执行：

```bash
git add -A
git commit -m "chore: scaffold incremental dungeon app"
```

Expected: creates the first commit with project scaffold and design docs.

---

## Task 2: 定义核心类型和数值公式

**Files:**
- Create: `src/game/types.ts`
- Create: `src/game/balance.ts`
- Create: `src/game/formulas.ts`
- Create: `src/game/formulas.test.ts`

- [ ] **Step 1: 写公式测试**

`src/game/formulas.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import {
  calculateAttackDamage,
  calculateEnemyForFloor,
  calculateGoldUpgradeCost,
  getStableFarmingFloor
} from './formulas';

describe('game formulas', () => {
  it('calculates non-critical and critical damage', () => {
    expect(
      calculateAttackDamage({
        attack: 10,
        criticalChance: 0,
        criticalDamage: 1.5,
        multiplier: 1
      })
    ).toBe(10);

    expect(
      calculateAttackDamage({
        attack: 10,
        criticalChance: 1,
        criticalDamage: 1.5,
        multiplier: 2
      })
    ).toBe(30);
  });

  it('scales enemies by floor', () => {
    const floor1 = calculateEnemyForFloor(1, false);
    const floor10Boss = calculateEnemyForFloor(10, true);

    expect(floor1.maxHealth).toBeGreaterThan(0);
    expect(floor10Boss.maxHealth).toBeGreaterThan(floor1.maxHealth);
    expect(floor10Boss.goldReward).toBeGreaterThan(floor1.goldReward);
  });

  it('increases upgrade costs by level', () => {
    expect(calculateGoldUpgradeCost(1)).toBeLessThan(calculateGoldUpgradeCost(10));
  });

  it('uses the previous normal floor as stable floor when current floor is a boss gate', () => {
    expect(getStableFarmingFloor(1)).toBe(1);
    expect(getStableFarmingFloor(10)).toBe(9);
    expect(getStableFarmingFloor(21)).toBe(21);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/game/formulas.test.ts`

Expected: FAIL because `src/game/formulas.ts` does not exist.

- [ ] **Step 3: 创建类型定义**

`src/game/types.ts`：

```ts
export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
export type EquipmentRarity = 'common' | 'magic' | 'rare' | 'epic';
export type StatKey =
  | 'attack'
  | 'maxHealth'
  | 'criticalChance'
  | 'criticalDamage'
  | 'attackSpeed';

export interface CharacterStats {
  attack: number;
  maxHealth: number;
  criticalChance: number;
  criticalDamage: number;
  attackSpeed: number;
}

export interface CharacterState {
  level: number;
  experience: number;
  gold: number;
  stats: CharacterStats;
  upgradeLevels: Record<StatKey, number>;
}

export interface EquipmentStat {
  key: StatKey;
  value: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  itemLevel: number;
  mainStat: EquipmentStat;
  secondaryStats: EquipmentStat[];
  affixes: string[];
  effect: string | null;
}

export interface EnemyState {
  id: string;
  name: string;
  floor: number;
  isBoss: boolean;
  maxHealth: number;
  health: number;
  goldReward: number;
  experienceReward: number;
}

export type SkillId = 'burst' | 'haste' | 'fortune';

export interface SkillState {
  id: SkillId;
  level: number;
  cooldownRemainingMs: number;
}

export interface DungeonState {
  currentFloor: number;
  highestUnlockedFloor: number;
  highestStableFloor: number;
}

export interface GameState {
  schemaVersion: 1;
  character: CharacterState;
  dungeon: DungeonState;
  currentEnemy: EnemyState;
  equipment: Partial<Record<EquipmentSlot, EquipmentItem>>;
  inventory: EquipmentItem[];
  skills: Record<SkillId, SkillState>;
  recentDrops: string[];
  lastSavedAt: number;
}
```

- [ ] **Step 4: 创建平衡参数和公式实现**

`src/game/balance.ts`：

```ts
export const BALANCE = {
  bossEvery: 10,
  baseEnemyHealth: 28,
  enemyHealthGrowth: 1.18,
  bossHealthMultiplier: 5,
  baseGoldReward: 6,
  goldGrowth: 1.14,
  baseExperienceReward: 4,
  experienceGrowth: 1.12,
  baseUpgradeCost: 15,
  upgradeCostGrowth: 1.2
} as const;
```

`src/game/formulas.ts`：

```ts
import { BALANCE } from './balance';
import type { EnemyState } from './types';

export interface DamageInput {
  attack: number;
  criticalChance: number;
  criticalDamage: number;
  multiplier: number;
}

export function calculateAttackDamage(input: DamageInput): number {
  const isCritical = input.criticalChance >= 1;
  const criticalMultiplier = isCritical ? input.criticalDamage : 1;
  return Math.max(1, Math.floor(input.attack * input.multiplier * criticalMultiplier));
}

export function calculateEnemyForFloor(floor: number, isBoss: boolean): EnemyState {
  const safeFloor = Math.max(1, Math.floor(floor));
  const healthBase =
    BALANCE.baseEnemyHealth * Math.pow(BALANCE.enemyHealthGrowth, safeFloor - 1);
  const maxHealth = Math.floor(healthBase * (isBoss ? BALANCE.bossHealthMultiplier : 1));
  const goldReward = Math.floor(
    BALANCE.baseGoldReward * Math.pow(BALANCE.goldGrowth, safeFloor - 1) * (isBoss ? 4 : 1)
  );
  const experienceReward = Math.floor(
    BALANCE.baseExperienceReward *
      Math.pow(BALANCE.experienceGrowth, safeFloor - 1) *
      (isBoss ? 4 : 1)
  );

  return {
    id: `${isBoss ? 'boss' : 'enemy'}-${safeFloor}-${Date.now()}`,
    name: isBoss ? `第 ${safeFloor} 层守卫` : `第 ${safeFloor} 层怪物`,
    floor: safeFloor,
    isBoss,
    maxHealth,
    health: maxHealth,
    goldReward,
    experienceReward
  };
}

export function calculateGoldUpgradeCost(level: number): number {
  const safeLevel = Math.max(1, Math.floor(level));
  return Math.floor(BALANCE.baseUpgradeCost * Math.pow(BALANCE.upgradeCostGrowth, safeLevel - 1));
}

export function isBossFloor(floor: number): boolean {
  return floor > 0 && floor % BALANCE.bossEvery === 0;
}

export function getStableFarmingFloor(currentFloor: number): number {
  if (currentFloor <= 1) {
    return 1;
  }
  return isBossFloor(currentFloor) ? currentFloor - 1 : currentFloor;
}
```

- [ ] **Step 5: 验证测试通过**

Run: `npm run test -- src/game/formulas.test.ts`

Expected: PASS.

- [ ] **Step 6: 提交**

```bash
git add src/game
git commit -m "feat: add core game formulas"
```

---

## Task 3: 实现装备生成和比较

**Files:**
- Create: `src/game/equipment.ts`
- Create: `src/game/equipment.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: 写装备测试**

`src/game/equipment.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import {
  compareEquipmentPower,
  generateEquipmentDrop,
  getEquipmentScore
} from './equipment';

describe('equipment', () => {
  it('generates an item for the requested floor', () => {
    const item = generateEquipmentDrop({ floor: 12, seed: 3 });

    expect(item.itemLevel).toBe(12);
    expect(['weapon', 'armor', 'accessory']).toContain(item.slot);
    expect(item.mainStat.value).toBeGreaterThan(0);
    expect(item.affixes).toEqual([]);
    expect(item.effect).toBeNull();
  });

  it('scores stronger equipment higher', () => {
    const weak = generateEquipmentDrop({ floor: 1, seed: 1 });
    const strong = generateEquipmentDrop({ floor: 20, seed: 1 });

    expect(getEquipmentScore(strong)).toBeGreaterThan(getEquipmentScore(weak));
  });

  it('compares equipment by score', () => {
    const current = generateEquipmentDrop({ floor: 2, seed: 2 });
    const candidate = generateEquipmentDrop({ floor: 8, seed: 2 });

    expect(compareEquipmentPower(candidate, current)).toBe('better');
    expect(compareEquipmentPower(current, candidate)).toBe('worse');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/game/equipment.test.ts`

Expected: FAIL because `src/game/equipment.ts` does not exist.

- [ ] **Step 3: 实现装备模块**

`src/game/equipment.ts`：

```ts
import type {
  EquipmentItem,
  EquipmentRarity,
  EquipmentSlot,
  EquipmentStat,
  StatKey
} from './types';

const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];
const rarities: EquipmentRarity[] = ['common', 'magic', 'rare', 'epic'];

interface GenerateEquipmentInput {
  floor: number;
  seed: number;
}

function seededIndex(seed: number, length: number): number {
  return Math.abs(Math.floor(seed)) % length;
}

function rarityForFloor(floor: number, seed: number): EquipmentRarity {
  const roll = seededIndex(seed * 17 + floor, 100);
  if (floor >= 25 && roll >= 95) return 'epic';
  if (floor >= 10 && roll >= 82) return 'rare';
  if (roll >= 55) return 'magic';
  return 'common';
}

function rarityMultiplier(rarity: EquipmentRarity): number {
  return {
    common: 1,
    magic: 1.3,
    rare: 1.7,
    epic: 2.3
  }[rarity];
}

function mainStatForSlot(slot: EquipmentSlot): StatKey {
  return {
    weapon: 'attack',
    armor: 'maxHealth',
    accessory: 'criticalChance'
  }[slot];
}

function secondaryStat(seed: number, floor: number): EquipmentStat {
  const keys: StatKey[] = ['attack', 'maxHealth', 'criticalDamage', 'attackSpeed'];
  const key = keys[seededIndex(seed, keys.length)];
  const value = key === 'attackSpeed' ? 0.02 + floor * 0.001 : Math.max(1, Math.floor(floor * 0.8));
  return { key, value };
}

export function generateEquipmentDrop(input: GenerateEquipmentInput): EquipmentItem {
  const floor = Math.max(1, Math.floor(input.floor));
  const slot = slots[seededIndex(input.seed, slots.length)];
  const rarity = rarityForFloor(floor, input.seed);
  const multiplier = rarityMultiplier(rarity);
  const mainStatKey = mainStatForSlot(slot);
  const mainValue =
    mainStatKey === 'criticalChance'
      ? Number(Math.min(0.25, 0.03 + floor * 0.002 * multiplier).toFixed(3))
      : Math.floor((8 + floor * 2) * multiplier);

  return {
    id: `item-${floor}-${input.seed}-${slot}`,
    name: `${rarityName(rarity)}${slotName(slot)}`,
    slot,
    rarity,
    itemLevel: floor,
    mainStat: { key: mainStatKey, value: mainValue },
    secondaryStats: rarity === 'common' ? [] : [secondaryStat(input.seed + 7, floor)],
    affixes: [],
    effect: null
  };
}

export function getEquipmentScore(item: EquipmentItem): number {
  const statScore = [item.mainStat, ...item.secondaryStats].reduce((sum, stat) => {
    const weight = stat.key === 'criticalChance' || stat.key === 'attackSpeed' ? 100 : 1;
    return sum + stat.value * weight;
  }, 0);
  return Math.floor(item.itemLevel * 2 + statScore * rarityMultiplier(item.rarity));
}

export function compareEquipmentPower(
  candidate: EquipmentItem,
  current: EquipmentItem | undefined
): 'better' | 'worse' | 'equal' {
  if (!current) return 'better';
  const delta = getEquipmentScore(candidate) - getEquipmentScore(current);
  if (delta > 0) return 'better';
  if (delta < 0) return 'worse';
  return 'equal';
}

function rarityName(rarity: EquipmentRarity): string {
  return {
    common: '普通',
    magic: '魔法',
    rare: '稀有',
    epic: '史诗'
  }[rarity];
}

function slotName(slot: EquipmentSlot): string {
  return {
    weapon: '武器',
    armor: '护甲',
    accessory: '饰品'
  }[slot];
}
```

- [ ] **Step 4: 验证测试通过**

Run: `npm run test -- src/game/equipment.test.ts`

Expected: PASS.

- [ ] **Step 5: 提交**

```bash
git add src/game/equipment.ts src/game/equipment.test.ts
git commit -m "feat: add equipment generation"
```

---

## Task 4: 实现技能和战斗结算

**Files:**
- Create: `src/game/skills.ts`
- Create: `src/game/combat.ts`
- Create: `src/game/combat.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: 写战斗测试**

`src/game/combat.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { createInitialGameState, performClickAttack, runCombatTick } from './combat';

describe('combat', () => {
  it('creates a playable initial state', () => {
    const state = createInitialGameState(1000);

    expect(state.character.level).toBe(1);
    expect(state.dungeon.currentFloor).toBe(1);
    expect(state.currentEnemy.health).toBeGreaterThan(0);
    expect(state.skills.burst.level).toBe(1);
  });

  it('auto attack damages the current enemy', () => {
    const state = createInitialGameState(1000);
    const next = runCombatTick(state, 1000, 2000);

    expect(next.currentEnemy.health).toBeLessThan(state.currentEnemy.health);
  });

  it('click attack damages the current enemy', () => {
    const state = createInitialGameState(1000);
    const next = performClickAttack(state, 1001);

    expect(next.currentEnemy.health).toBeLessThan(state.currentEnemy.health);
  });

  it('defeating an enemy grants rewards and advances floor', () => {
    const state = createInitialGameState(1000);
    const weakEnemyState = {
      ...state,
      currentEnemy: { ...state.currentEnemy, health: 1 }
    };
    const next = performClickAttack(weakEnemyState, 1001);

    expect(next.character.gold).toBeGreaterThan(state.character.gold);
    expect(next.character.experience).toBeGreaterThan(state.character.experience);
    expect(next.dungeon.currentFloor).toBe(2);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/game/combat.test.ts`

Expected: FAIL because `src/game/combat.ts` does not exist.

- [ ] **Step 3: 实现技能定义**

`src/game/skills.ts`：

```ts
import type { SkillId, SkillState } from './types';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  description: string;
  baseCooldownMs: number;
  baseMultiplier: number;
}

export const SKILL_DEFINITIONS: Record<SkillId, SkillDefinition> = {
  burst: {
    id: 'burst',
    name: '爆发打击',
    description: '造成一次高额伤害。',
    baseCooldownMs: 8000,
    baseMultiplier: 5
  },
  haste: {
    id: 'haste',
    name: '急速',
    description: '短时间提升攻击速度。',
    baseCooldownMs: 16000,
    baseMultiplier: 1.5
  },
  fortune: {
    id: 'fortune',
    name: '幸运',
    description: '短时间提升金币和掉落收益。',
    baseCooldownMs: 20000,
    baseMultiplier: 1.25
  }
};

export function createInitialSkills(): Record<SkillId, SkillState> {
  return {
    burst: { id: 'burst', level: 1, cooldownRemainingMs: 0 },
    haste: { id: 'haste', level: 1, cooldownRemainingMs: 0 },
    fortune: { id: 'fortune', level: 1, cooldownRemainingMs: 0 }
  };
}

export function getSkillUpgradeCost(skill: SkillState): number {
  return Math.floor(40 * Math.pow(1.45, skill.level - 1));
}
```

- [ ] **Step 4: 实现战斗模块**

`src/game/combat.ts`：

```ts
import { generateEquipmentDrop } from './equipment';
import {
  calculateAttackDamage,
  calculateEnemyForFloor,
  getStableFarmingFloor,
  isBossFloor
} from './formulas';
import { createInitialSkills } from './skills';
import type { GameState } from './types';

export function createInitialGameState(now: number): GameState {
  const firstEnemy = calculateEnemyForFloor(1, false);
  return {
    schemaVersion: 1,
    character: {
      level: 1,
      experience: 0,
      gold: 0,
      stats: {
        attack: 8,
        maxHealth: 100,
        criticalChance: 0.05,
        criticalDamage: 1.5,
        attackSpeed: 1
      },
      upgradeLevels: {
        attack: 1,
        maxHealth: 1,
        criticalChance: 1,
        criticalDamage: 1,
        attackSpeed: 1
      }
    },
    dungeon: {
      currentFloor: 1,
      highestUnlockedFloor: 1,
      highestStableFloor: 1
    },
    currentEnemy: firstEnemy,
    equipment: {},
    inventory: [],
    skills: createInitialSkills(),
    recentDrops: [],
    lastSavedAt: now
  };
}

export function runCombatTick(state: GameState, elapsedMs: number, now: number): GameState {
  const attacks = (elapsedMs / 1000) * state.character.stats.attackSpeed;
  const damage = calculateAttackDamage({
    attack: state.character.stats.attack,
    criticalChance: 0,
    criticalDamage: state.character.stats.criticalDamage,
    multiplier: attacks
  });
  return applyDamage(state, damage, now);
}

export function performClickAttack(state: GameState, now: number): GameState {
  const damage = calculateAttackDamage({
    attack: state.character.stats.attack,
    criticalChance: state.character.stats.criticalChance,
    criticalDamage: state.character.stats.criticalDamage,
    multiplier: 0.65
  });
  return applyDamage(state, damage, now);
}

function applyDamage(state: GameState, damage: number, now: number): GameState {
  const remainingHealth = state.currentEnemy.health - damage;
  if (remainingHealth > 0) {
    return {
      ...state,
      currentEnemy: { ...state.currentEnemy, health: remainingHealth },
      lastSavedAt: now
    };
  }
  return defeatEnemy(state, now);
}

function defeatEnemy(state: GameState, now: number): GameState {
  const nextFloor = state.dungeon.currentFloor + 1;
  const highestUnlockedFloor = Math.max(state.dungeon.highestUnlockedFloor, nextFloor);
  const shouldDropEquipment = state.currentEnemy.isBoss || nextFloor % 4 === 0;
  const droppedItem = shouldDropEquipment
    ? generateEquipmentDrop({ floor: state.dungeon.currentFloor, seed: now })
    : null;
  const inventory = droppedItem ? [droppedItem, ...state.inventory].slice(0, 60) : state.inventory;
  const dropText = droppedItem
    ? [`获得 ${droppedItem.name}`, ...state.recentDrops].slice(0, 8)
    : [`获得 ${state.currentEnemy.goldReward} 金币`, ...state.recentDrops].slice(0, 8);

  return {
    ...state,
    character: {
      ...state.character,
      gold: state.character.gold + state.currentEnemy.goldReward,
      experience: state.character.experience + state.currentEnemy.experienceReward
    },
    dungeon: {
      currentFloor: nextFloor,
      highestUnlockedFloor,
      highestStableFloor: getStableFarmingFloor(nextFloor)
    },
    currentEnemy: calculateEnemyForFloor(nextFloor, isBossFloor(nextFloor)),
    inventory,
    recentDrops: dropText,
    lastSavedAt: now
  };
}
```

- [ ] **Step 5: 验证测试通过**

Run: `npm run test -- src/game/combat.test.ts`

Expected: PASS.

- [ ] **Step 6: 提交**

```bash
git add src/game
git commit -m "feat: add combat loop"
```

---

## Task 5: 实现离线收益和存档

**Files:**
- Create: `src/game/offline.ts`
- Create: `src/game/save.ts`
- Create: `src/game/save.test.ts`
- Modify: `src/game/types.ts`

- [ ] **Step 1: 写存档和离线测试**

`src/game/save.test.ts`：

```ts
import { describe, expect, it } from 'vitest';
import { createInitialGameState } from './combat';
import { calculateOfflineRewards } from './offline';
import { decodeSaveCode, encodeSaveCode, validateSaveData } from './save';

describe('save and offline rewards', () => {
  it('encodes and decodes a save code', () => {
    const state = createInitialGameState(1000);
    const code = encodeSaveCode(state);
    const decoded = decodeSaveCode(code);

    expect(decoded.schemaVersion).toBe(1);
    expect(decoded.character.level).toBe(1);
  });

  it('rejects invalid save code', () => {
    expect(() => decodeSaveCode('not-a-save')).toThrow('存档码无效');
  });

  it('validates required save fields', () => {
    const state = createInitialGameState(1000);
    expect(validateSaveData(state)).toBe(true);
    expect(validateSaveData({ schemaVersion: 1 })).toBe(false);
  });

  it('clamps offline rewards to eight hours', () => {
    const state = createInitialGameState(1000);
    const rewards = calculateOfflineRewards(state, 1000 + 1000 * 60 * 60 * 24);

    expect(rewards.effectiveMs).toBe(1000 * 60 * 60 * 8);
    expect(rewards.gold).toBeGreaterThan(0);
    expect(rewards.experience).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/game/save.test.ts`

Expected: FAIL because `src/game/save.ts` does not exist.

- [ ] **Step 3: 实现离线收益**

`src/game/offline.ts`：

```ts
import { calculateEnemyForFloor } from './formulas';
import type { GameState } from './types';

const MAX_OFFLINE_MS = 1000 * 60 * 60 * 8;

export interface OfflineRewards {
  elapsedMs: number;
  effectiveMs: number;
  gold: number;
  experience: number;
  equipmentCount: number;
}

export function calculateOfflineRewards(state: GameState, now: number): OfflineRewards {
  const elapsedMs = Math.max(0, now - state.lastSavedAt);
  const effectiveMs = Math.min(elapsedMs, MAX_OFFLINE_MS);
  const stableFloor = Math.max(1, state.dungeon.highestStableFloor);
  const enemy = calculateEnemyForFloor(stableFloor, false);
  const killsPerMinute = Math.max(1, state.character.stats.attackSpeed * 2);
  const minutes = effectiveMs / 60000;
  const estimatedKills = Math.floor(minutes * killsPerMinute);

  return {
    elapsedMs,
    effectiveMs,
    gold: estimatedKills * enemy.goldReward,
    experience: estimatedKills * enemy.experienceReward,
    equipmentCount: Math.floor(estimatedKills / 45)
  };
}

export function applyOfflineRewards(state: GameState, rewards: OfflineRewards, now: number): GameState {
  return {
    ...state,
    character: {
      ...state.character,
      gold: state.character.gold + rewards.gold,
      experience: state.character.experience + rewards.experience
    },
    recentDrops: [
      `离线获得 ${rewards.gold} 金币`,
      `离线获得 ${rewards.experience} 经验`,
      ...state.recentDrops
    ].slice(0, 8),
    lastSavedAt: now
  };
}
```

- [ ] **Step 4: 实现存档编码和校验**

`src/game/save.ts`：

```ts
import type { GameState } from './types';

export const SAVE_KEY = 'incremental-dungeon-save-v1';

export function encodeSaveCode(state: GameState): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(state))));
}

export function decodeSaveCode(code: string): GameState {
  try {
    const json = decodeURIComponent(escape(atob(code)));
    const data = JSON.parse(json);
    if (!validateSaveData(data)) {
      throw new Error('存档码缺少必要字段');
    }
    return data;
  } catch {
    throw new Error('存档码无效');
  }
}

export function validateSaveData(data: unknown): data is GameState {
  if (!data || typeof data !== 'object') return false;
  const candidate = data as Partial<GameState>;
  return (
    candidate.schemaVersion === 1 &&
    !!candidate.character &&
    !!candidate.dungeon &&
    !!candidate.currentEnemy &&
    !!candidate.skills &&
    Array.isArray(candidate.inventory) &&
    Array.isArray(candidate.recentDrops) &&
    typeof candidate.lastSavedAt === 'number'
  );
}

export function saveToLocalStorage(state: GameState): void {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

export function loadFromLocalStorage(): GameState | null {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return validateSaveData(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
```

- [ ] **Step 5: 验证测试通过**

Run: `npm run test -- src/game/save.test.ts`

Expected: PASS.

- [ ] **Step 6: 提交**

```bash
git add src/game/offline.ts src/game/save.ts src/game/save.test.ts
git commit -m "feat: add save and offline rewards"
```

---

## Task 6: 创建 Zustand 游戏状态

**Files:**
- Create: `src/store/gameStore.ts`
- Create: `src/store/gameStore.test.ts`
- Modify: `src/game/combat.ts`

- [ ] **Step 1: 写 store 测试**

`src/store/gameStore.test.ts`：

```ts
import { beforeEach, describe, expect, it } from 'vitest';
import { useGameStore } from './gameStore';

describe('gameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().resetGame(1000);
  });

  it('performs click attack through store action', () => {
    const before = useGameStore.getState().game.currentEnemy.health;

    useGameStore.getState().clickEnemy(1001);

    expect(useGameStore.getState().game.currentEnemy.health).toBeLessThan(before);
  });

  it('exports and imports save code', () => {
    useGameStore.getState().clickEnemy(1001);
    const code = useGameStore.getState().exportSave();

    useGameStore.getState().resetGame(2000);
    useGameStore.getState().importSave(code);

    expect(useGameStore.getState().game.schemaVersion).toBe(1);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/store/gameStore.test.ts`

Expected: FAIL because `src/store/gameStore.ts` does not exist.

- [ ] **Step 3: 实现 store**

`src/store/gameStore.ts`：

```ts
import { create } from 'zustand';
import { createInitialGameState, performClickAttack, runCombatTick } from '../game/combat';
import { applyOfflineRewards, calculateOfflineRewards, type OfflineRewards } from '../game/offline';
import {
  decodeSaveCode,
  encodeSaveCode,
  loadFromLocalStorage,
  saveToLocalStorage
} from '../game/save';
import type { GameState, StatKey } from '../game/types';
import { calculateGoldUpgradeCost } from '../game/formulas';

interface GameStore {
  game: GameState;
  lastOfflineRewards: OfflineRewards | null;
  tick: (elapsedMs: number, now: number) => void;
  clickEnemy: (now: number) => void;
  upgradeStat: (stat: StatKey, now: number) => void;
  exportSave: () => string;
  importSave: (code: string) => void;
  resetGame: (now: number) => void;
  loadSavedGame: (now: number) => void;
}

function persist(game: GameState): GameState {
  saveToLocalStorage(game);
  return game;
}

export const useGameStore = create<GameStore>((set, get) => ({
  game: createInitialGameState(Date.now()),
  lastOfflineRewards: null,

  tick: (elapsedMs, now) => {
    const next = persist(runCombatTick(get().game, elapsedMs, now));
    set({ game: next });
  },

  clickEnemy: (now) => {
    const next = persist(performClickAttack(get().game, now));
    set({ game: next });
  },

  upgradeStat: (stat, now) => {
    const game = get().game;
    const currentLevel = game.character.upgradeLevels[stat];
    const cost = calculateGoldUpgradeCost(currentLevel);
    if (game.character.gold < cost) return;

    const statGain: Record<StatKey, number> = {
      attack: 2,
      maxHealth: 10,
      criticalChance: 0.005,
      criticalDamage: 0.05,
      attackSpeed: 0.03
    };

    const next: GameState = {
      ...game,
      character: {
        ...game.character,
        gold: game.character.gold - cost,
        stats: {
          ...game.character.stats,
          [stat]: Number((game.character.stats[stat] + statGain[stat]).toFixed(3))
        },
        upgradeLevels: {
          ...game.character.upgradeLevels,
          [stat]: currentLevel + 1
        }
      },
      lastSavedAt: now
    };
    set({ game: persist(next) });
  },

  exportSave: () => encodeSaveCode(get().game),

  importSave: (code) => {
    const imported = persist(decodeSaveCode(code));
    set({ game: imported, lastOfflineRewards: null });
  },

  resetGame: (now) => {
    const next = persist(createInitialGameState(now));
    set({ game: next, lastOfflineRewards: null });
  },

  loadSavedGame: (now) => {
    const saved = loadFromLocalStorage();
    if (!saved) {
      const fresh = persist(createInitialGameState(now));
      set({ game: fresh, lastOfflineRewards: null });
      return;
    }
    const rewards = calculateOfflineRewards(saved, now);
    const next = persist(applyOfflineRewards(saved, rewards, now));
    set({ game: next, lastOfflineRewards: rewards });
  }
}));
```

- [ ] **Step 4: 验证测试通过**

Run: `npm run test -- src/store/gameStore.test.ts`

Expected: PASS.

- [ ] **Step 5: 提交**

```bash
git add src/store
git commit -m "feat: add game store"
```

---

## Task 7: 构建 App 外壳和导航

**Files:**
- Create: `src/app/navigation.ts`
- Modify: `src/app/App.tsx`
- Modify: `src/styles/global.css`
- Create: `src/features/shared/Panel.tsx`
- Create: `src/features/shared/StatLine.tsx`

- [ ] **Step 1: 创建导航定义**

`src/app/navigation.ts`：

```ts
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
```

- [ ] **Step 2: 创建通用组件**

`src/features/shared/Panel.tsx`：

```tsx
import type { ReactNode } from 'react';

interface PanelProps {
  title: string;
  children: ReactNode;
}

export function Panel({ title, children }: PanelProps) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

`src/features/shared/StatLine.tsx`：

```tsx
interface StatLineProps {
  label: string;
  value: string | number;
}

export function StatLine({ label, value }: StatLineProps) {
  return (
    <div className="stat-line">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
```

- [ ] **Step 3: 更新 App 外壳**

`src/app/App.tsx`：

```tsx
import { useEffect, useState } from 'react';
import { CharacterView } from '../features/character/CharacterView';
import { CombatView } from '../features/combat/CombatView';
import { DungeonView } from '../features/dungeon/DungeonView';
import { EquipmentView } from '../features/equipment/EquipmentView';
import { SettingsView } from '../features/settings/SettingsView';
import { SkillsView } from '../features/skills/SkillsView';
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
    case 'skills':
      return <SkillsView />;
    case 'dungeon':
      return <DungeonView />;
    case 'character':
      return <CharacterView />;
    case 'settings':
      return <SettingsView />;
  }
}
```

- [ ] **Step 4: 添加布局 CSS**

在 `src/styles/global.css` 追加：

```css
.app-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  min-height: 100vh;
}

.app-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 18px;
  background: rgba(18, 16, 13, 0.92);
  border-right: 1px solid rgba(226, 161, 95, 0.16);
}

.brand {
  display: grid;
  gap: 4px;
  margin-bottom: 12px;
}

.brand span {
  color: #e2a15f;
  font-size: 0.8rem;
}

.brand strong {
  font-size: 1.1rem;
}

.nav-button {
  min-height: 44px;
  color: #f4efe8;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
}

.nav-button.active {
  color: #1c130c;
  background: #e2a15f;
}

.app-content {
  min-width: 0;
  padding: 18px;
  padding-bottom: 88px;
}

.panel {
  padding: 16px;
  background: rgba(255, 255, 255, 0.055);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.panel h2 {
  margin: 0 0 12px;
  font-size: 1.05rem;
}

.stat-line {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 760px) {
  .app-layout {
    display: block;
  }

  .app-nav {
    position: fixed;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 4px;
    padding: 8px;
    border-top: 1px solid rgba(226, 161, 95, 0.16);
    border-right: 0;
  }

  .brand {
    display: none;
  }

  .nav-button {
    min-height: 48px;
    padding: 4px;
    font-size: 0.78rem;
  }
}
```

- [ ] **Step 5: 创建临时页面组件**

为 `src/features/character/CharacterView.tsx` 等六个页面先创建可编译组件。每个文件使用相同模式，例如：

```tsx
import { Panel } from '../shared/Panel';

export function CharacterView() {
  return <Panel title="角色">角色成长信息会在后续任务接入。</Panel>;
}
```

对应页面名称分别为：`CombatView`、`EquipmentView`、`SkillsView`、`DungeonView`、`CharacterView`、`SettingsView`。

- [ ] **Step 6: 验证构建通过**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: 提交**

```bash
git add src
git commit -m "feat: add responsive app shell"
```

---

## Task 8: 实现六个 MVP 页面

**Files:**
- Modify: `src/features/combat/CombatView.tsx`
- Modify: `src/features/equipment/EquipmentView.tsx`
- Modify: `src/features/skills/SkillsView.tsx`
- Modify: `src/features/dungeon/DungeonView.tsx`
- Modify: `src/features/character/CharacterView.tsx`
- Modify: `src/features/settings/SettingsView.tsx`
- Modify: `src/styles/global.css`

- [ ] **Step 1: 实现战斗页**

`src/features/combat/CombatView.tsx`：

```tsx
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
```

- [ ] **Step 2: 实现角色页**

`src/features/character/CharacterView.tsx`：

```tsx
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
            <button className="upgrade-row" key={key} type="button" onClick={() => upgradeStat(key, Date.now())}>
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
```

- [ ] **Step 3: 实现装备页**

`src/features/equipment/EquipmentView.tsx`：

```tsx
import { getEquipmentScore } from '../../game/equipment';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function EquipmentView() {
  const game = useGameStore((state) => state.game);

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
          <div className={`item-row rarity-${item.rarity}`} key={item.id}>
            <span>{item.name}</span>
            <strong>等级 {item.itemLevel}</strong>
            <em>评分 {getEquipmentScore(item)}</em>
          </div>
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
```

- [ ] **Step 4: 实现技能、地下城、设置页**

`src/features/skills/SkillsView.tsx`：

```tsx
import { SKILL_DEFINITIONS, getSkillUpgradeCost } from '../../game/skills';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function SkillsView() {
  const skills = useGameStore((state) => state.game.skills);

  return (
    <Panel title="主动技能">
      {Object.values(skills).map((skill) => {
        const definition = SKILL_DEFINITIONS[skill.id];
        return (
          <div className="item-row" key={skill.id}>
            <span>{definition.name}</span>
            <strong>等级 {skill.level}</strong>
            <em>{getSkillUpgradeCost(skill)} 金币</em>
          </div>
        );
      })}
    </Panel>
  );
}
```

`src/features/dungeon/DungeonView.tsx`：

```tsx
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
```

`src/features/settings/SettingsView.tsx`：

```tsx
import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Panel } from '../shared/Panel';

export function SettingsView() {
  const exportSave = useGameStore((state) => state.exportSave);
  const importSave = useGameStore((state) => state.importSave);
  const resetGame = useGameStore((state) => state.resetGame);
  const [saveCode, setSaveCode] = useState('');
  const [message, setMessage] = useState('');

  return (
    <div className="view-grid">
      <Panel title="存档">
        <button type="button" onClick={() => setSaveCode(exportSave())}>导出存档码</button>
        <textarea value={saveCode} onChange={(event) => setSaveCode(event.target.value)} rows={6} />
        <button
          type="button"
          onClick={() => {
            try {
              importSave(saveCode);
              setMessage('导入成功');
            } catch (error) {
              setMessage(error instanceof Error ? error.message : '导入失败');
            }
          }}
        >
          导入存档码
        </button>
        <button type="button" onClick={() => resetGame(Date.now())}>重置存档</button>
        {message ? <p>{message}</p> : null}
      </Panel>
    </div>
  );
}
```

- [ ] **Step 5: 添加页面 CSS**

在 `src/styles/global.css` 追加：

```css
.view-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 14px;
}

.combat-grid {
  grid-template-columns: minmax(280px, 1.4fr) minmax(240px, 0.6fr);
}

.enemy-button {
  display: grid;
  width: 100%;
  min-height: 210px;
  place-items: center;
  gap: 8px;
  color: #f4efe8;
  background: linear-gradient(160deg, rgba(135, 38, 30, 0.8), rgba(46, 31, 24, 0.94));
  border: 1px solid rgba(226, 161, 95, 0.26);
  border-radius: 8px;
  cursor: pointer;
}

.enemy-button strong {
  font-size: 1.6rem;
}

.enemy-button em,
.item-row em,
.upgrade-row em {
  color: #cbbba7;
  font-style: normal;
}

.health-bar {
  height: 14px;
  margin: 12px 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
}

.health-bar div {
  height: 100%;
  background: #d94335;
  transition: width 160ms ease;
}

.list {
  display: grid;
  gap: 8px;
}

.item-row,
.upgrade-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  align-items: center;
  width: 100%;
  min-height: 44px;
  padding: 10px;
  color: #f4efe8;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
}

.upgrade-row {
  cursor: pointer;
}

textarea {
  width: 100%;
  margin: 10px 0;
  color: #f4efe8;
  background: rgba(0, 0, 0, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 8px;
}

.hint {
  color: #cbbba7;
}

@media (max-width: 760px) {
  .combat-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 6: 验证构建**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: 提交**

```bash
git add src
git commit -m "feat: build mvp views"
```

---

## Task 9: 完成装备穿戴和技能升级操作

**Files:**
- Modify: `src/store/gameStore.ts`
- Modify: `src/store/gameStore.test.ts`
- Modify: `src/features/equipment/EquipmentView.tsx`
- Modify: `src/features/skills/SkillsView.tsx`

- [ ] **Step 1: 扩展 store 测试**

在 `src/store/gameStore.test.ts` 增加：

```ts
import { generateEquipmentDrop } from '../game/equipment';

it('equips an item from inventory', () => {
  const item = generateEquipmentDrop({ floor: 5, seed: 1 });
  useGameStore.setState((state) => ({
    game: { ...state.game, inventory: [item] }
  }));

  useGameStore.getState().equipItem(item.id, 1002);

  expect(useGameStore.getState().game.equipment[item.slot]?.id).toBe(item.id);
});

it('upgrades a skill when enough gold is available', () => {
  useGameStore.setState((state) => ({
    game: {
      ...state.game,
      character: { ...state.game.character, gold: 1000 }
    }
  }));

  useGameStore.getState().upgradeSkill('burst', 1002);

  expect(useGameStore.getState().game.skills.burst.level).toBe(2);
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- src/store/gameStore.test.ts`

Expected: FAIL because `equipItem` and `upgradeSkill` do not exist.

- [ ] **Step 3: 在 store 增加动作**

在 `GameStore` interface 增加：

```ts
equipItem: (itemId: string, now: number) => void;
upgradeSkill: (skillId: SkillId, now: number) => void;
```

在 imports 增加：

```ts
import { getSkillUpgradeCost } from '../game/skills';
import type { GameState, SkillId, StatKey } from '../game/types';
```

在 store object 中增加：

```ts
equipItem: (itemId, now) => {
  const game = get().game;
  const item = game.inventory.find((entry) => entry.id === itemId);
  if (!item) return;

  const next: GameState = {
    ...game,
    equipment: {
      ...game.equipment,
      [item.slot]: item
    },
    inventory: game.inventory.filter((entry) => entry.id !== itemId),
    recentDrops: [`已装备 ${item.name}`, ...game.recentDrops].slice(0, 8),
    lastSavedAt: now
  };
  set({ game: persist(next) });
},

upgradeSkill: (skillId, now) => {
  const game = get().game;
  const skill = game.skills[skillId];
  const cost = getSkillUpgradeCost(skill);
  if (game.character.gold < cost) return;

  const next: GameState = {
    ...game,
    character: {
      ...game.character,
      gold: game.character.gold - cost
    },
    skills: {
      ...game.skills,
      [skillId]: {
        ...skill,
        level: skill.level + 1
      }
    },
    lastSavedAt: now
  };
  set({ game: persist(next) });
},
```

- [ ] **Step 4: 接入装备页按钮**

在 `EquipmentView` 中读取动作：

```tsx
const equipItem = useGameStore((state) => state.equipItem);
```

把背包行改为按钮：

```tsx
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
```

- [ ] **Step 5: 接入技能升级按钮**

在 `SkillsView` 中读取动作：

```tsx
const upgradeSkill = useGameStore((state) => state.upgradeSkill);
```

把技能行改为按钮：

```tsx
<button className="item-row" key={skill.id} type="button" onClick={() => upgradeSkill(skill.id, Date.now())}>
  <span>{definition.name}</span>
  <strong>等级 {skill.level}</strong>
  <em>{getSkillUpgradeCost(skill)} 金币</em>
</button>
```

- [ ] **Step 6: 验证测试和构建**

Run: `npm run test -- src/store/gameStore.test.ts`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 7: 提交**

```bash
git add src
git commit -m "feat: add equipment and skill actions"
```

---

## Task 10: 最终验证和运行

**Files:**
- Modify: `README.md`

- [ ] **Step 1: 创建 README**

`README.md`：

```md
# 暗黑刷宝增量游戏

一款电脑网页和手机 App 共用代码的暗黑刷宝增量游戏 MVP。

## 本地开发

```bash
npm install
npm run dev
```

## 验证

```bash
npm run test
npm run lint
npm run build
```

## 第一版范围

- 自动战斗和点击攻击。
- 普通怪和 Boss。
- 金币、经验、角色属性升级。
- 武器、护甲、饰品掉落。
- 技能展示和升级。
- 地下城层数推进。
- 本地存档、导入导出存档码。
- 最多 8 小时离线收益。
```

- [ ] **Step 2: 运行全部测试**

Run: `npm run test`

Expected: all tests PASS.

- [ ] **Step 3: 类型检查**

Run: `npm run lint`

Expected: TypeScript reports no errors.

- [ ] **Step 4: 生产构建**

Run: `npm run build`

Expected: Vite build completes and writes `dist/`.

- [ ] **Step 5: 启动开发服务器**

Run: `npm run dev`

Expected: Vite prints a local URL, usually `http://127.0.0.1:5173/`.

- [ ] **Step 6: 手动验证**

在电脑宽屏和手机窄屏视口验证：

- 战斗页可以点击敌人。
- 敌人会自动受伤。
- 击杀后金币和经验增加。
- 地下城层数推进。
- 背包会出现装备掉落。
- 装备可以穿戴。
- 角色属性可以升级。
- 技能可以升级。
- 设置页可以导出存档码。
- 重置后可以导入存档码恢复进度。
- 刷新页面后本地存档恢复。

- [ ] **Step 7: 提交**

```bash
git add -A
git commit -m "docs: add project usage guide"
```

---

## 自检结果

- 规格覆盖：计划覆盖战斗、角色成长、装备、技能、地下城、离线收益、存档、导入导出、响应式界面和测试策略。
- 范围控制：MVP 不包含后端、账号、云存档、付费、排行榜、完整暗黑词条、打造、洗练、套装和传奇特效。
- 类型一致：计划中的核心类型集中在 `src/game/types.ts`，后续任务统一引用这些类型。
- 验证路径：每个核心逻辑任务都有先失败后通过的测试步骤；最终任务包含测试、类型检查、构建和手动验证。
