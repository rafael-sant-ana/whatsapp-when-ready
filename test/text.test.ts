import { describe, expect, it } from 'vitest';
import { hasSearchQuery, stripUnreadCount } from '../src/content/text';
import { formatRemaining } from '../src/shared/time';

describe('stripUnreadCount', () => {
  it('removes a leading unread count', () => {
    expect(stripUnreadCount('(3) WhatsApp')).toBe('WhatsApp');
    expect(stripUnreadCount('(99+) WhatsApp')).toBe('WhatsApp');
  });

  it('leaves other titles alone', () => {
    expect(stripUnreadCount('WhatsApp')).toBe('WhatsApp');
    expect(stripUnreadCount('WhatsApp (beta)')).toBe('WhatsApp (beta)');
  });
});

describe('hasSearchQuery', () => {
  it('ignores empty, whitespace and zero-width values', () => {
    expect(hasSearchQuery(null)).toBe(false);
    expect(hasSearchQuery('')).toBe(false);
    expect(hasSearchQuery('  \n')).toBe(false);
    expect(hasSearchQuery('​')).toBe(false);
  });

  it('detects a real query', () => {
    expect(hasSearchQuery('mom')).toBe(true);
  });
});

describe('formatRemaining', () => {
  it('formats as m:ss, rounding up and never negative', () => {
    expect(formatRemaining(300_000)).toBe('5:00');
    expect(formatRemaining(61_001)).toBe('1:02');
    expect(formatRemaining(-5)).toBe('0:00');
  });
});
