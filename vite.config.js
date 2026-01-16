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
        target: 'ws://185.185.126.198:8082',
        ws: true,
      },
      '/api': {
        target: 'http://185.185.126.198:8082',
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
