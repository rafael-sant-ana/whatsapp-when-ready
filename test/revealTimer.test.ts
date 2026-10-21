import { describe, expect, it, vi } from 'vitest';
import { RevealTimer, type Clock } from '../src/content/revealTimer';

function fakeClock() {
  let now = 1_000;
  let nextId = 1;
  const timers = new Map<number, { at: number; callback: () => void }>();
  const clock: Clock = {
    now: () => now,
    setTimeout: (callback, ms) => {
      timers.set(nextId, { at: now + ms, callback });
      return nextId++;
    },
    clearTimeout: (id) => void timers.delete(id),
  };
  const advance = (ms: number) => {
    now += ms;
    for (const [id, timer] of timers) {
      if (timer.at <= now) {
        timers.delete(id);
        timer.callback();
      }
    }
  };
  return { clock, advance, pending: () => timers.size };
}

describe('RevealTimer', () => {
  it('starts hidden', () => {
    const timer = new RevealTimer(() => {}, fakeClock().clock);
    expect(timer.isRevealed).toBe(false);
    expect(timer.revealedUntil).toBeNull();
  });

  it('reveals for the given minutes, then hides', () => {
    const { clock, advance } = fakeClock();
    const onChange = vi.fn();
    const timer = new RevealTimer(onChange, clock);

    timer.reveal(5);
    expect(timer.revealedUntil).toBe(1_000 + 5 * 60_000);
    expect(onChange).toHaveBeenCalledTimes(1);

    advance(5 * 60_000 - 1);
    expect(timer.isRevealed).toBe(true);
    advance(1);
    expect(timer.isRevealed).toBe(false);
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('restarts the countdown when revealed again', () => {
    const { clock, advance, pending } = fakeClock();
    const timer = new RevealTimer(() => {}, clock);
    timer.reveal(5);
    advance(60_000);
    timer.reveal(5);
    expect(pending()).toBe(1);
    advance(4 * 60_000);
    expect(timer.isRevealed).toBe(true);
  });

  it('hides early and only notifies on a real change', () => {
    const { clock, pending } = fakeClock();
    const onChange = vi.fn();
    const timer = new RevealTimer(onChange, clock);
    timer.hide();
    expect(onChange).not.toHaveBeenCalled();
    timer.reveal(5);
    timer.hide();
    expect(timer.isRevealed).toBe(false);
    expect(pending()).toBe(0);
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
