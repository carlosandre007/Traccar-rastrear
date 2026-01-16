import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => ({
  base: '/',
  server: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: [
      'dep.rastreadorautoram.com.br',
      'dev.rastreadorautoram.com.br',
      'tracker.rastreadorautoram.com.br',
      'locmottus.com.br',
      'www.locmottus.com.br'
    ],
    proxy: {
      '/api/socket': {
        target: 'wss://locmottus.com.br',
        ws: true,
      },
      '/api': {
        target: 'https://locmottus.com.br',
        changeOrigin: true,
      },
      '/gestao': {
        target: 'http://localhost:3666',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:3666',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3666',
        changeOrigin: true,
      },

    },
  },
  build: {
    outDir: 'build',
  },
  plugins: [
    svgr(),
    react(),
    VitePWA({

      workbox: {

        maximumFileSizeToCacheInBytes: 7 * 1024 * 1024,
      }
    }),
  ],
}));
