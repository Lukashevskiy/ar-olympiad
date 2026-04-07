import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        index: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        debug: resolve(fileURLToPath(new URL('.', import.meta.url)), 'debug.html'),
        task1: resolve(fileURLToPath(new URL('.', import.meta.url)), 'task1.html'),
        task1Debug: resolve(fileURLToPath(new URL('.', import.meta.url)), 'task1-debug.html'),
        task2Debug: resolve(fileURLToPath(new URL('.', import.meta.url)), 'task2-debug.html')
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
