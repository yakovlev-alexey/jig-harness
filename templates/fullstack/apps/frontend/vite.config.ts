import react from '@vitejs/plugin-react';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import { defineConfig } from 'vite';

const backendUrl = process.env.VITE_BACKEND_URL ?? 'http://localhost:3001';

export default defineConfig({
  plugins: [tanstackRouter({ target: 'react' }), react()],
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
    },
  },
  preview: {
    port: 5174,
    proxy: {
      '/api': {
        changeOrigin: true,
        target: backendUrl,
      },
    },
  },
});
