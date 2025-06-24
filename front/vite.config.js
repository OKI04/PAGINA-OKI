import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'dashboardAdmin.html')
      }
    },
    outDir: 'dist'
  },
  server: {
    proxy: {
      '/admin': {
        target: 'https://pagina-back-oki.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});