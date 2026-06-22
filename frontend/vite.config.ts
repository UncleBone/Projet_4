import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import istanbul from 'vite-plugin-istanbul';

export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    istanbul({
      include: ['src/*'],
      extension: ['.js', '.ts', '.jsx', '.tsx'],
      cypress: true,
      requireEnv: false, // selon besoin, active la couverture seulement pour Cypress
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
