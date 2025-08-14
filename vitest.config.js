import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

const r = (p) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    alias: {
      '@uip/core': r('./packages/core/src/index.js'),
      '@uip/adapter-vanilla': r('./packages/adapters/vanilla/src/index.js'),
      '@uip/adapter-react': r('./packages/adapters/react/src/index.js'),
      '@uip/adapter-svelte': r('./packages/adapters/svelte/src/index.js'),
      '@uip/plugin-gesture': r('./packages/plugins/gesture/src/index.js'),
      '@uip/plugin-direction': r('./packages/plugins/direction/src/index.js'),
      '@uip/plugin-snap': r('./packages/plugins/snap/src/index.js')
    },
    deps: {
      moduleDirectories: ['node_modules', r('./packages')]
    }
  },
  resolve: {
    alias: [
      { find: '@uip/core', replacement: r('./packages/core/src/index.js') },
      { find: '@uip/adapter-vanilla', replacement: r('./packages/adapters/vanilla/src/index.js') },
      { find: '@uip/adapter-react', replacement: r('./packages/adapters/react/src/index.js') },
      { find: '@uip/adapter-svelte', replacement: r('./packages/adapters/svelte/src/index.js') },
      { find: '@uip/plugin-gesture', replacement: r('./packages/plugins/gesture/src/index.js') },
      { find: '@uip/plugin-direction', replacement: r('./packages/plugins/direction/src/index.js') },
      { find: '@uip/plugin-snap', replacement: r('./packages/plugins/snap/src/index.js') }
    ]
  }
});