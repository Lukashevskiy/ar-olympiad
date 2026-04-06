import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173,
    fs: {
      allow: [fileURLToPath(new URL('../..', import.meta.url))]
    }
  }
});
