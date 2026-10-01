import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 5173, host: true },
  build: {
    target: 'es2020',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // React en su propio chunk: cachea entre deploys y no se re-descarga
        // cuando solo cambia el catalogo.
        manualChunks(id: string) {
          if (/node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'vendor';
          return undefined;
        },
      },
    },
  },
});