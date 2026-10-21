// A type alias (not an interface) so it satisfies chrome.storage's
// index-signature parameter types.
export type Settings = {
  /** Master switch. When off, WhatsApp Web is left completely untouched. */
  enabled: boolean;
  /** Strip unread badges, bold names and the "(N)" tab-title count. */
  hideUnread: boolean;
  /** How long the chat list stays visible after "Show chats". */
  revealMinutes: number;
  /** Silence incoming-message sounds and make desktop notifications silent. */
  muteSounds: boolean;
};

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  hideUnread: true,
  revealMinutes: 5,
  muteSounds: true,
};

export const MIN_REVEAL_MINUTES = 1;
export const MAX_REVEAL_MINUTES = 120;

export function clampRevealMinutes(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SETTINGS.revealMinutes;
  return Math.min(MAX_REVEAL_MINUTES, Math.max(MIN_REVEAL_MINUTES, Math.round(value)));
}

/** Fills in defaults and repairs invalid values from storage. */
export function normalizeSettings(raw: Partial<Record<keyof Settings, unknown>>): Settings {
  return {
    enabled: typeof raw.enabled === 'boolean' ? raw.enabled : DEFAULT_SETTINGS.enabled,
    hideUnread: typeof raw.hideUnread === 'boolean' ? raw.hideUnread : DEFAULT_SETTINGS.hideUnread,
    revealMinutes:
      typeof raw.revealMinutes === 'number'
        ? clampRevealMinutes(raw.revealMinutes)
        : DEFAULT_SETTINGS.revealMinutes,
    muteSounds: typeof raw.muteSounds === 'boolean' ? raw.muteSounds : DEFAULT_SETTINGS.muteSounds,
  };
}

export async function loadSettings(): Promise<Settings> {
  const raw = await chrome.storage.sync.get(DEFAULT_SETTINGS);
  return normalizeSettings(raw);
}

export async function saveSettings(patch: Partial<Settings>): Promise<void> {
  await chrome.storage.sync.set(patch);
}

export function onSettingsChanged(listener: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((_changes, area) => {
    if (area === 'sync') void loadSettings().then(listener);
  });
}
