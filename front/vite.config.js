import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/admin': {
        target: 'http://localhost:3900',  // tu backend Node
        changeOrigin: true,
        secure: false
      }
    }
  }
});
