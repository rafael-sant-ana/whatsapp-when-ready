import { describe, expect, it } from 'vitest';
import { shouldSilence } from '../src/page/silence';

describe('shouldSilence', () => {
  it('silences sounds that play on their own', () => {
    expect(shouldSilence({ muteEnabled: true, elementMuted: false, userActive: false })).toBe(true);
  });

  it('leaves audio the person started, like voice notes', () => {
    expect(shouldSilence({ muteEnabled: true, elementMuted: false, userActive: true })).toBe(false);
  });

  it('does nothing when muting is off or the element is already muted', () => {
    expect(shouldSilence({ muteEnabled: false, elementMuted: false, userActive: false })).toBe(false);
    expect(shouldSilence({ muteEnabled: true, elementMuted: true, userActive: false })).toBe(false);
  });
});
