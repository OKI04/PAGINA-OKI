import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5174,
    proxy: {
      '/admin': {
        target: 'https://backend-oki-web.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
