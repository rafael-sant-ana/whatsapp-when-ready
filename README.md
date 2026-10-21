# WhatsApp When Ready

A Chrome extension that hides your WhatsApp Web chat list until you're ready for it, in the spirit of [Inbox When Ready](https://inboxwhenready.org/) for Gmail.

## What it does

- **Hides the chat list by default.** A "Show chats" button takes its place. Once shown, the list hides again after a timer (5 minutes by default) or when you reload the page.
- **Hides unread signals.** Unread badges, bold chat names, the `(N)` count in the tab title and the badged favicon are removed, even while the list is showing.
- **Keeps search working.** Type in the search box to find someone and message them without seeing the rest of your inbox. A conversation you open this way stays visible.
- **Hides the open conversation** while the list is hidden, so a chat left open doesn't become a back door into your inbox.
- **Toolbar popup** to turn it on or off, show or hide chats (with a countdown), turn unread hiding on or off, and set the timer length.

New messages never surface while the list is hidden. There are no notifications or counts.

## Install (unpacked)

```sh
npm install
npm run build
```

Then open `chrome://extensions`, turn on **Developer mode**, click **Load unpacked** and select the `dist/` folder. Reload any open WhatsApp Web tab.

Works in Chrome and other Chromium browsers (Edge, Brave, Arc).

## Development

| Command | What it does |
| --- | --- |
| `npm run build` | Type-check, then build the popup and content script into `dist/` |
| `npm run dev` | Rebuild the popup on change (re-run `npm run build` for content script changes) |
| `npm test` | Unit tests (Vitest) |
| `npm run typecheck` | TypeScript only |
| `npm run icons` | Regenerate `public/icons/*.png` (needs Python with Pillow) |

After rebuilding, click the reload icon on the extension card in `chrome://extensions`, then reload WhatsApp Web.

### Layout

```
public/manifest.json      MV3 manifest (copied into dist/)
src/content/              Runs on web.whatsapp.com
  index.ts                Controller: state classes on <html>, observers, popup messages
  selectors.ts            Every WhatsApp DOM selector, in one place
  styles.ts               Injected CSS, driven by the state classes
  revealTimer.ts          In-memory "show chats for N minutes" timer
  placeholder.ts          The "Chats are hidden" panel
src/popup/                Toolbar popup
src/shared/               Settings (chrome.storage.sync) and message types
```

The content script is built as a single IIFE (`vite.content.config.ts`) because Chrome loads content scripts as classic scripts.

## When WhatsApp changes its page

WhatsApp Web uses scrambled class names that change often. The extension relies only on long-stable ids and attributes (`#side`, `#pane-side`, `#main`, `aria-label`s). If something stops being hidden after a WhatsApp update, the fix almost always belongs in `src/content/selectors.ts`.

Unread badges are matched by their localized `aria-label`. English, Portuguese, Spanish, French, German and Italian are covered. Add a fragment to `UNREAD_LABEL_FRAGMENTS` for other languages.

## Privacy

Everything runs locally in your browser. The extension reads no messages, makes no network requests, and only stores its own three settings in `chrome.storage.sync`.
