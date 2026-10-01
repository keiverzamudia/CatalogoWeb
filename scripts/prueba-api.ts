/**
 * Arnes local para probar las funciones de /api sin desplegar.
 * Uso:  npx tsx scripts/prueba-api.ts
 * Levanta http://localhost:4321 y enruta a los mismos handlers que usa Vercel.
 * No forma parte del build.
 */
import { createServer } from 'node:http';

process.env.PANEL_CLAVE ||= 'demo-123';

const rutas: Record<string, () => Promise<{ default: Function }>> = {
  '/api/visita': () => import('../api/visita.js'),
  '/api/contacto': () => import('../api/contacto.js'),
  '/api/panel': () => import('../api/panel.js'),
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const cargar = rutas[url.pathname];
  if (!cargar) {
    res.statusCode = 404;
    res.end('sin ruta');
    return;
  }
  const mod = await cargar();
  await mod.default(req, res);
});

server.listen(4321, () => console.log('api local en http://localhost:4321'));
