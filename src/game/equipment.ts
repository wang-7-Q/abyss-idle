import type {
  EquipmentItem,
  EquipmentRarity,
  EquipmentSlot,
  EquipmentStat,
  StatKey
} from './types';

const slots: EquipmentSlot[] = ['weapon', 'armor', 'accessory'];

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
  const statsBySlot: Record<EquipmentSlot, StatKey> = {
    weapon: 'attack',
    armor: 'maxHealth',
    accessory: 'criticalChance'
  };
  return statsBySlot[slot];
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
