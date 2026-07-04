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
