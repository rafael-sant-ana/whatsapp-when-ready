import { PLACEHOLDER_CLASS } from './styles';

/** The panel shown where the chat list would be. */
export function createPlaceholder(onShowChats: () => void): HTMLElement {
  const root = document.createElement('div');
  root.className = PLACEHOLDER_CLASS;

  const title = document.createElement('p');
  title.className = `${PLACEHOLDER_CLASS}__title`;
  title.textContent = 'Chats are hidden';

  const hint = document.createElement('p');
  hint.className = `${PLACEHOLDER_CLASS}__hint`;
  hint.textContent = 'Search above to message someone without seeing the rest of your chats.';

  const button = document.createElement('button');
  button.type = 'button';
  button.className = `${PLACEHOLDER_CLASS}__button`;
  button.textContent = 'Show chats';
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onShowChats();
  });

  root.append(title, hint, button);
  return root;
}
