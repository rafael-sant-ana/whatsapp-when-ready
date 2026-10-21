import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, clampRevealMinutes, normalizeSettings } from '../src/shared/settings';

describe('normalizeSettings', () => {
  it('fills in defaults', () => {
    expect(normalizeSettings({})).toEqual(DEFAULT_SETTINGS);
  });

  it('repairs invalid values', () => {
    expect(normalizeSettings({ enabled: 'yes', revealMinutes: 0 })).toEqual({
      ...DEFAULT_SETTINGS,
      revealMinutes: 1,
    });
  });
});

describe('clampRevealMinutes', () => {
  it('keeps the timer between 1 and 120 whole minutes', () => {
    expect(clampRevealMinutes(0)).toBe(1);
    expect(clampRevealMinutes(500)).toBe(120);
    expect(clampRevealMinutes(2.6)).toBe(3);
    expect(clampRevealMinutes(Number.NaN)).toBe(DEFAULT_SETTINGS.revealMinutes);
  });
});
