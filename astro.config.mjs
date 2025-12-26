import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://jncoe.github.io',
	outDir: 'dist',
	build: {
		format: 'directory',
	},
	trailingSlash: 'always',
});
