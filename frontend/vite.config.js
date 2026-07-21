import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // expose on the local network so a phone on the same Wi-Fi can open it
    // Proxy /api calls to the backend during development. The proxy runs on the
    // PC, so phone requests to /api are forwarded to the backend automatically.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
});
