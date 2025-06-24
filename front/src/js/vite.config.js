import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5174,
    proxy: {
      '/admin': {
        target: 'http://localhost:3900',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
