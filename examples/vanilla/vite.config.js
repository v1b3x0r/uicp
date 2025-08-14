import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@uikit/core': resolve(__dirname, '../../packages/ui-core/dist/index.js'),
    }
  },
  server: {
    port: 8080,
    fs: {
      allow: ['../..']
    }
  },
  optimizeDeps: {
    include: ['@uikit/core']
  }
});