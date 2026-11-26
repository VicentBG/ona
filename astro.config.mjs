import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://vicentbg.github.io',
  // Raíz en local; CI y la revisión de Pages seleccionan explícitamente /ona/.
  base: process.env.ONA_BASE || '/',
});
