/** Messages the popup sends to the content script running in a WhatsApp tab. */
export type Request = { type: 'getState' } | { type: 'reveal' } | { type: 'hide' };

export interface TabState {
  /** Epoch ms when the chat list hides again, or null while it is hidden. */
  revealedUntil: number | null;
}
