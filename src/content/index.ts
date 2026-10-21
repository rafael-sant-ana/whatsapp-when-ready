import type { Request, TabState } from '../shared/messages';
import { DEFAULT_SETTINGS, loadSettings, onSettingsChanged, type Settings } from '../shared/settings';
import { createPlaceholder } from './placeholder';
import { RevealTimer } from './revealTimer';
import {
  CHAT_LIST,
  CONTACT_ROW,
  CONVERSATION,
  FAVICON,
  PLAIN_FAVICON_URL,
  SEARCH_INPUT,
} from './selectors';
import {
  CLASS_CONVERSATION_ALLOWED,
  CLASS_HIDDEN,
  CLASS_HIDE_UNREAD,
  CLASS_SEARCHING,
  CSS,
} from './styles';
import { hasSearchQuery, stripUnreadCount } from './text';

const root = document.documentElement;
// Start from the defaults (hidden) so the inbox never flashes while the
// stored settings load.
let settings: Settings = DEFAULT_SETTINGS;
// Set once the person opens a chat on purpose (via search or the new-chat
// drawer) while the list is hidden; cleared whenever the list hides again.
let conversationAllowed = false;
let syncScheduled = false;

const reveal = new RevealTimer(() => {
  if (!reveal.isRevealed) conversationAllowed = false;
  sync();
});
const placeholder = createPlaceholder(() => reveal.reveal(settings.revealMinutes));

function isHidden(): boolean {
  return settings.enabled && !reveal.isRevealed;
}

function isSearching(): boolean {
  return Array.from(document.querySelectorAll<HTMLElement>(SEARCH_INPUT)).some((el) =>
    hasSearchQuery(el instanceof HTMLInputElement ? el.value : el.textContent),
  );
}

function hideUnread(): boolean {
  return settings.enabled && settings.hideUnread;
}

/** Keeps the placeholder sitting right after the (hidden) chat list. */
function placePlaceholder(): void {
  const list = document.querySelector(CHAT_LIST);
  if (!isHidden() || !list?.parentElement) {
    placeholder.remove();
    return;
  }
  if (placeholder.previousElementSibling !== list) list.after(placeholder);
}

function fixTitle(): void {
  if (!hideUnread()) return;
  const stripped = stripUnreadCount(document.title);
  if (stripped !== document.title) document.title = stripped;
}

function fixFavicon(): void {
  for (const link of document.querySelectorAll<HTMLLinkElement>(FAVICON)) {
    if (hideUnread()) {
      if (link.href === PLAIN_FAVICON_URL) continue;
      link.dataset.wwrOriginalHref = link.href;
      link.href = PLAIN_FAVICON_URL;
    } else if (link.dataset.wwrOriginalHref) {
      link.href = link.dataset.wwrOriginalHref;
      delete link.dataset.wwrOriginalHref;
    }
  }
}

function sync(): void {
  syncScheduled = false;
  const hidden = isHidden();
  root.classList.toggle(CLASS_HIDDEN, hidden);
  root.classList.toggle(CLASS_SEARCHING, hidden && isSearching());
  root.classList.toggle(CLASS_CONVERSATION_ALLOWED, hidden && conversationAllowed);
  root.classList.toggle(CLASS_HIDE_UNREAD, hideUnread());
  placePlaceholder();
  fixTitle();
  fixFavicon();
}

function scheduleSync(): void {
  if (syncScheduled) return;
  syncScheduled = true;
  // setTimeout rather than requestAnimationFrame: rAF never fires in
  // background tabs, which is exactly when the title count changes.
  window.setTimeout(sync, 0);
}

function allowConversation(): void {
  if (!isHidden() || conversationAllowed) return;
  conversationAllowed = true;
  sync();
}

function injectStyles(): void {
  const style = document.createElement('style');
  style.id = 'whatsapp-when-ready';
  style.textContent = CSS;
  (document.head ?? root).append(style);
}

function listenForIntentionalChats(): void {
  document.addEventListener(
    'click',
    (event) => {
      if (!isHidden() || !(event.target instanceof Element)) return;
      const target = event.target;
      // The list is only clickable while searching, so any click in it is a
      // search result. Rows elsewhere (outside the conversation) belong to
      // drawers such as "New chat".
      const inList = target.closest(CHAT_LIST) !== null;
      const inDrawerRow = target.closest(CONTACT_ROW) !== null && target.closest(CONVERSATION) === null;
      if (inList || inDrawerRow) allowConversation();
    },
    true,
  );
  document.addEventListener(
    'keydown',
    (event) => {
      // Enter in the search box opens the top result.
      if (event.key === 'Enter' && event.target instanceof Element && event.target.matches(SEARCH_INPUT)) {
        allowConversation();
      }
    },
    true,
  );
  document.addEventListener('input', scheduleSync, true);
}

function listenForPopup(): void {
  chrome.runtime.onMessage.addListener((message: Request, _sender, sendResponse) => {
    switch (message.type) {
      case 'reveal':
        reveal.reveal(settings.revealMinutes);
        break;
      case 'hide':
        reveal.hide();
        break;
      case 'getState':
        break;
    }
    const state: TabState = { revealedUntil: reveal.revealedUntil };
    sendResponse(state);
  });
}

function observePage(): void {
  new MutationObserver(() => {
    // Fix the title synchronously so the unread count never flashes.
    fixTitle();
    scheduleSync();
  }).observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['href'],
  });
}

async function main(): Promise<void> {
  injectStyles();
  listenForIntentionalChats();
  listenForPopup();
  observePage();
  sync();

  settings = await loadSettings();
  sync();

  onSettingsChanged((next) => {
    if (!next.enabled) reveal.hide();
    settings = next;
    sync();
  });
}

void main();
