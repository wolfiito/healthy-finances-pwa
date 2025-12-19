import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Esto elimina el error 404 en desarrollo
      devOptions: {
        enabled: false 
      },
      manifest: {
        name: 'Healthy Finances',
        short_name: 'Finances',
        description: 'Control de gastos y proyección'
      }
    })
  ],
});