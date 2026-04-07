import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    fs: {
      allow: [resolve(__dirname, '..', '..', '..')]
    }
  },
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        task2: resolve(__dirname, 'task2.html'),
        task3: resolve(__dirname, 'task3.html')
      }
    }
  }
});
