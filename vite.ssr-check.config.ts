import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Config de render en Node para el chequeo de humo (src/ssr-check.tsx).
 * No se usa para la app ni para el build de produccion.
 */
export default defineConfig({
  plugins: [react()],
  build: {
    ssr: 'src/ssr-check.tsx',
    outDir: 'dist-ssr',
    emptyOutDir: true,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/server'],
      output: { format: 'esm' },
    },
  },
  ssr: { noExternal: true },
});