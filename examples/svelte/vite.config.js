import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: {
      '@uikit/core': '../../packages/ui-core/src/index.js',
      '@uikit/svelte': '../../packages/ui-svelte/src/index.js',
    }
  }
});