export interface Clock {
  now(): number;
  setTimeout(callback: () => void, ms: number): number;
  clearTimeout(id: number): void;
}

const browserClock: Clock = {
  now: () => Date.now(),
  setTimeout: (callback, ms) => window.setTimeout(callback, ms),
  clearTimeout: (id) => window.clearTimeout(id),
};

/**
 * Tracks whether the chat list is temporarily revealed. State is kept in
 * memory only, so reloading WhatsApp Web always starts hidden again.
 */
export class RevealTimer {
  private until: number | null = null;
  private timeoutId: number | null = null;

  constructor(
    private readonly onChange: () => void,
    private readonly clock: Clock = browserClock,
  ) {}

  get revealedUntil(): number | null {
    return this.until;
  }

  get isRevealed(): boolean {
    return this.until !== null;
  }

  reveal(minutes: number): void {
    this.cancelTimeout();
    const ms = minutes * 60_000;
    this.until = this.clock.now() + ms;
    this.timeoutId = this.clock.setTimeout(() => this.hide(), ms);
    this.onChange();
  }

  hide(): void {
    const wasRevealed = this.isRevealed;
    this.cancelTimeout();
    this.until = null;
    if (wasRevealed) this.onChange();
  }

  private cancelTimeout(): void {
    if (this.timeoutId !== null) this.clock.clearTimeout(this.timeoutId);
    this.timeoutId = null;
  }
}
