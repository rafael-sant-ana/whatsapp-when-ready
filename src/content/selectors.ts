// Every lookup into WhatsApp Web's DOM lives here. WhatsApp ships obfuscated,
// frequently-changing class names, so we only rely on ids, roles and
// attributes that have stayed stable across redesigns. When WhatsApp breaks
// the extension, this is the file to fix.

/** Left column: header, search box, filter chips and the chat list. */
export const SIDE = '#side';

/** The scrollable chat list. Search results are also rendered in here. */
export const CHAT_LIST = '#pane-side';

/** The open conversation on the right. */
export const CONVERSATION = '#main';

/** The search box at the top of the left column. */
export const SEARCH_INPUT = `${SIDE} input[type="text"], ${SIDE} input:not([type]), ${SIDE} [contenteditable="true"]`;

/**
 * Clickable rows that open a conversation outside the chat list, e.g. in the
 * "New chat" drawer, which is another way to reach a specific person.
 */
export const CONTACT_ROW = '[role="listitem"], [role="row"]';

/**
 * Unread badges carry an aria-label such as "3 unread messages". The label is
 * localized, so we match a fragment per language (case-insensitive).
 */
export const UNREAD_LABEL_FRAGMENTS = [
  'unread', // English
  'não lida', // Portuguese
  'no leído', // Spanish
  'non lu', // French
  'ungelesen', // German
  'non lett', // Italian
];

export const FAVICON = 'link[rel~="icon"]';

/** WhatsApp's plain favicon, without the unread-count badge. */
export const PLAIN_FAVICON_URL = 'https://web.whatsapp.com/favicon.ico';
