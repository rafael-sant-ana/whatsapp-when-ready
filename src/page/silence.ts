export interface PlayContext {
  /** The "Mute message sounds" setting is active. */
  muteEnabled: boolean;
  /** The element is already muted, so playing it is silent anyway. */
  elementMuted: boolean;
  /** The person clicked or pressed a key within the last few seconds. */
  userActive: boolean;
}

/**
 * Message sounds play on their own when a message arrives. Audio the person
 * starts themselves, like a voice note, always follows a click, so anything
 * with recent user activation is left alone.
 */
export function shouldSilence({ muteEnabled, elementMuted, userActive }: PlayContext): boolean {
  return muteEnabled && !elementMuted && !userActive;
}
