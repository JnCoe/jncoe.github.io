import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://jncoe.github.io',
	outDir: 'blog',
	build: {
		format: 'directory',
	},
	trailingSlash: 'always',
});
