import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        task1: resolve(fileURLToPath(new URL('.', import.meta.url)), 'task1.html'),
        task1Debug: resolve(fileURLToPath(new URL('.', import.meta.url)), 'task1-debug.html')
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      allow: [fileURLToPath(new URL('../..', import.meta.url))]
    }
  }
});
