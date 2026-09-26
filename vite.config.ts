import { cloudflare } from '@cloudflare/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  // The Cloudflare plugin runs the API Worker (server/index.ts) inside Vite,
  // with a local D1 database, so one dev server handles the site and /api.
  plugins: [react(), tailwindcss(), cloudflare()],
  server: {
    port: 3000,
    // Allow GitHub Codespaces' forwarded preview URLs (*.app.github.dev).
    allowedHosts: ['.app.github.dev'],
  },
});
