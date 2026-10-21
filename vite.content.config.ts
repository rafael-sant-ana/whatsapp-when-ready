import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Chrome loads content scripts as classic scripts, so each is built as its own
// IIFE. The default mode builds the isolated-world content script; `--mode
// page` builds the page-world script that silences sounds.
const ENTRIES: Record<string, { entry: string; fileName: string }> = {
  content: { entry: 'src/content/index.ts', fileName: 'content.js' },
  page: { entry: 'src/page/index.ts', fileName: 'page.js' },
};

export default defineConfig(({ mode }) => {
  const { entry, fileName } = ENTRIES[mode] ?? ENTRIES.content;
  return {
    publicDir: false,
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: false,
      lib: {
        entry: resolve(__dirname, entry),
        name: 'WhatsAppWhenReady',
        formats: ['iife'],
        fileName: () => fileName,
      },
    },
  };
});
