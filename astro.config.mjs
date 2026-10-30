// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://yasseenh.github.io',
  integrations: [react(), sitemap()],

  vite: {
    // Keep build optimization from invalidating a running development preview.
    cacheDir: `node_modules/.vite-${process.env.NODE_ENV === "production" ? "production" : "development"}`,
    plugins: [tailwindcss()]
  }
});