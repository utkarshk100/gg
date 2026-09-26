import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Allow GitHub Codespaces' forwarded preview URLs (*.app.github.dev).
    allowedHosts: ['.app.github.dev'],
    // The Express API runs on :3001 in dev; the browser only ever talks to Vite.
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
