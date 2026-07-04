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
