import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@uip/core': resolve(__dirname, '../../packages/core/src/index.js'),
      '@uip/adapter-vanilla': resolve(__dirname, '../../packages/adapters/vanilla/src/index.js'),
      '@uip/plugin-gesture': resolve(__dirname, '../../packages/plugins/gesture/src/index.js')
    }
  },
  server: {
    port: 8080,
    fs: {
      allow: ['../..']
    }
  }
});