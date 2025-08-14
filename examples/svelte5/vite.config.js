import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	build: {
		rollupOptions: {
			external: []
		}
	},
	resolve: {
		alias: {
			'@uip/core': path.resolve('../../packages/core/src/index.js'),
			'@uip/adapter-svelte': path.resolve('../../packages/adapters/svelte/src/index.js'),
			'@uip/plugin-gesture': path.resolve('../../packages/plugins/gesture/src/index.js')
		}
	}
});