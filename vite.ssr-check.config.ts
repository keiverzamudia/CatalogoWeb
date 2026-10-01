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
    // Sin minificar ni compartir chunks: el arnes debe llevar TODO el codigo
    // en un solo archivo. Antes, con el bundle de produccion ya construido en
    // `dist/`, Rollup reutilizaba ese grafo y dejaba `CATALOGOS_OFICIALES`
    // fuera del chunk del chequeo (falso negativo en las rutas de los PDF).
    minify: false,
    rollupOptions: {
      external: ['react', 'react-dom', 'react-dom/server'],
      output: {
        format: 'esm',
        // Un unico chunk, sin code-splitting.
        inlineDynamicImports: true,
        manualChunks: undefined,
      },
    },
  },
  ssr: { noExternal: true },
});