import { resolve } from 'node:path';
import { defineConfig } from 'vite';

// Builds the popup page and copies public/ (manifest, icons) into dist/.
// The content script is built separately (vite.content.config.ts) because
// Chrome loads content scripts as classic scripts, so it must be a single IIFE.
export default defineConfig({
  root: resolve(__dirname, 'src'),
  publicDir: resolve(__dirname, 'public'),
  base: '',
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: { popup: resolve(__dirname, 'src/popup/popup.html') },
    },
  },
});
