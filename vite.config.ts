import { fileURLToPath, URL } from 'node:url';
import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// Served to a phone on the same Wi-Fi (PHONE=1 npm run dev:web): over
// https, with a certificate made on the spot, as a browser gives a page
// its camera only on a secure connection
const phone = Boolean(process.env.PHONE);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), ...(phone ? [basicSsl()] : [])],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: phone || undefined,
    // The API runs separately in dev (npm run dev starts both); same origin
    // for the browser, so the session cookie just works
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
});
