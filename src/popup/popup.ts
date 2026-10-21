import type { Request, TabState } from '../shared/messages';
import { clampRevealMinutes, loadSettings, saveSettings, type Settings } from '../shared/settings';
import { formatRemaining } from '../shared/time';

const WHATSAPP_URL = 'https://web.whatsapp.com/';

const enabledInput = document.querySelector<HTMLInputElement>('#enabled')!;
const hideUnreadInput = document.querySelector<HTMLInputElement>('#hide-unread')!;
const muteSoundsInput = document.querySelector<HTMLInputElement>('#mute-sounds')!;
const minutesInput = document.querySelector<HTMLInputElement>('#reveal-minutes')!;
const statusText = document.querySelector<HTMLParagraphElement>('#status-text')!;
const actionButton = document.querySelector<HTMLButtonElement>('#action')!;

type View =
  | { kind: 'disabled' }
  | { kind: 'no-tab' }
  | { kind: 'needs-reload'; tabId: number }
  | { kind: 'tab'; tabId: number; state: TabState };

let settings: Settings;
let view: View = { kind: 'no-tab' };
let onAction: (() => void) | null = null;

async function findWhatsAppTab(): Promise<chrome.tabs.Tab | undefined> {
  const tabs = await chrome.tabs.query({ url: `${WHATSAPP_URL}*` });
  return tabs.find((tab) => tab.active && tab.highlighted) ?? tabs.find((tab) => tab.active) ?? tabs[0];
}

async function send(tabId: number, request: Request): Promise<TabState | null> {
  try {
    return (await chrome.tabs.sendMessage(tabId, request)) as TabState;
  } catch {
    // No content script: the tab was opened before the extension was installed.
    return null;
  }
}

async function refresh(request: Request = { type: 'getState' }): Promise<void> {
  if (!settings.enabled) {
    view = { kind: 'disabled' };
  } else {
    const tab = await findWhatsAppTab();
    if (tab?.id === undefined) {
      view = { kind: 'no-tab' };
    } else {
      const state = await send(tab.id, request);
      view = state ? { kind: 'tab', tabId: tab.id, state } : { kind: 'needs-reload', tabId: tab.id };
    }
  }
  render();
}

function setAction(label: string | null, handler: (() => void) | null, secondary = false): void {
  actionButton.hidden = label === null;
  actionButton.textContent = label ?? '';
  actionButton.classList.toggle('button--secondary', secondary);
  onAction = handler;
}

function render(): void {
  document.body.classList.toggle('disabled', !settings.enabled);
  enabledInput.checked = settings.enabled;
  hideUnreadInput.checked = settings.hideUnread;
  muteSoundsInput.checked = settings.muteSounds;
  if (document.activeElement !== minutesInput) minutesInput.value = String(settings.revealMinutes);

  switch (view.kind) {
    case 'disabled':
      statusText.textContent = 'Turned off. WhatsApp Web is shown as usual.';
      setAction(null, null);
      break;
    case 'no-tab':
      statusText.textContent = 'WhatsApp Web isn’t open.';
      setAction('Open WhatsApp Web', () => void chrome.tabs.create({ url: WHATSAPP_URL }));
      break;
    case 'needs-reload': {
      const { tabId } = view;
      statusText.textContent = 'Reload WhatsApp Web to start hiding chats.';
      setAction('Reload WhatsApp Web', () => {
        void chrome.tabs.reload(tabId);
        window.close();
      });
      break;
    }
    case 'tab': {
      const { tabId, state } = view;
      if (state.revealedUntil === null) {
        statusText.textContent = 'Chats are hidden.';
        setAction('Show chats', () => void refresh({ type: 'reveal' }).then(() => focusTab(tabId)));
      } else {
        statusText.textContent = `Chats visible · hiding in ${formatRemaining(state.revealedUntil - Date.now())}`;
        setAction('Hide now', () => void refresh({ type: 'hide' }), true);
      }
      break;
    }
  }
}

async function focusTab(tabId: number): Promise<void> {
  const tab = await chrome.tabs.update(tabId, { active: true });
  if (tab?.windowId !== undefined) await chrome.windows.update(tab.windowId, { focused: true });
}

actionButton.addEventListener('click', () => onAction?.());

enabledInput.addEventListener('change', async () => {
  settings = { ...settings, enabled: enabledInput.checked };
  await saveSettings({ enabled: settings.enabled });
  await refresh();
});

hideUnreadInput.addEventListener('change', async () => {
  settings = { ...settings, hideUnread: hideUnreadInput.checked };
  await saveSettings({ hideUnread: settings.hideUnread });
});

muteSoundsInput.addEventListener('change', async () => {
  settings = { ...settings, muteSounds: muteSoundsInput.checked };
  await saveSettings({ muteSounds: settings.muteSounds });
});

minutesInput.addEventListener('change', async () => {
  settings = { ...settings, revealMinutes: clampRevealMinutes(minutesInput.valueAsNumber) };
  minutesInput.value = String(settings.revealMinutes);
  await saveSettings({ revealMinutes: settings.revealMinutes });
});

// Tick the countdown, and re-check once it runs out.
window.setInterval(() => {
  if (view.kind !== 'tab' || view.state.revealedUntil === null) return;
  if (view.state.revealedUntil <= Date.now()) void refresh();
  else render();
}, 1000);

void loadSettings().then((loaded) => {
  settings = loaded;
  return refresh();
});
