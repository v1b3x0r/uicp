import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@uikit/core': '../../packages/ui-core/src/index.js',
      '@uikit/react': '../../packages/ui-react/src/index.js',
    }
  }
});