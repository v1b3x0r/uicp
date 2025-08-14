import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  },
  resolve: {
    alias: {
      '@uikit/core': './packages/ui-core/src/index.js',
      '@uikit/vanilla': './packages/ui-vanilla/src/index.js',
      '@uikit/react': './packages/ui-react/src/index.js',
      '@uikit/svelte': './packages/ui-svelte/src/index.js'
    }
  }
});