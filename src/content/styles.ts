import { CHAT_LIST, CONVERSATION, UNREAD_LABEL_FRAGMENTS } from './selectors';

// State classes set on <html> by the controller.
export const CLASS_HIDDEN = 'wwr-hidden';
export const CLASS_SEARCHING = 'wwr-searching';
export const CLASS_CONVERSATION_ALLOWED = 'wwr-conversation-allowed';
export const CLASS_HIDE_UNREAD = 'wwr-hide-unread';
export const PLACEHOLDER_CLASS = 'wwr-placeholder';

const unreadBadges = UNREAD_LABEL_FRAGMENTS.map(
  (fragment) => `html.${CLASS_HIDE_UNREAD} span[aria-label*="${fragment}" i]:not(${CONVERSATION} *)`,
).join(',\n');

export const CSS = `
html.${CLASS_HIDDEN}:not(.${CLASS_SEARCHING}) ${CHAT_LIST} {
  display: none !important;
}

html.${CLASS_HIDDEN}:not(.${CLASS_CONVERSATION_ALLOWED}) ${CONVERSATION} {
  visibility: hidden !important;
}

html:not(.${CLASS_HIDDEN}) .${PLACEHOLDER_CLASS},
html.${CLASS_SEARCHING} .${PLACEHOLDER_CLASS} {
  display: none !important;
}

${unreadBadges} {
  display: none !important;
}

/* Unread chats are drawn in a heavier weight; flatten every row. */
html.${CLASS_HIDE_UNREAD} ${CHAT_LIST} [role="row"] *,
html.${CLASS_HIDE_UNREAD} ${CHAT_LIST} [role="listitem"] * {
  font-weight: normal !important;
}

.${PLACEHOLDER_CLASS} {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px 24px;
  text-align: center;
  font-family: inherit;
  color: inherit;
}

.${PLACEHOLDER_CLASS}__title {
  margin: 0;
  font-size: 17px;
  font-weight: 500;
}

.${PLACEHOLDER_CLASS}__hint {
  margin: 0;
  max-width: 260px;
  font-size: 14px;
  line-height: 1.4;
  opacity: 0.7;
}

.${PLACEHOLDER_CLASS}__button {
  margin-top: 4px;
  padding: 10px 24px;
  border: 0;
  border-radius: 24px;
  background: #00a884;
  color: #fff;
  font: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.${PLACEHOLDER_CLASS}__button:hover {
  background: #008f72;
}

.${PLACEHOLDER_CLASS}__button:focus-visible {
  outline: 2px solid #00a884;
  outline-offset: 3px;
}
`;
