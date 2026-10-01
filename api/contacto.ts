import type { IncomingMessage, ServerResponse } from 'node:http';
import { cuerpoJson, json, mismoOrigen } from '../shared/http.js';
import { guardarContacto } from '../shared/panel.js';

/**
 * POST /api/contacto
 * Guarda el contacto que dejo sus datos en el formulario del catalogo.
 * El formulario tambien abre WhatsApp: esto es un DESTINO EXTRA, no lo reemplaza.
 */
function corto(v: unknown, max: number): string {
  return String(v ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    json(res, { ok: false, error: 'metodo no permitido' }, 405);
    return;
  }

  if (!mismoOrigen(req)) {
    json(res, { ok: true });
    return;
  }

  const body = await cuerpoJson<Record<string, unknown>>(req);

  if (body?.trampa) {
    json(res, { ok: true }); // honeypot: bot, no se guarda
    return;
  }

  const nombre = corto(body?.nombre, 80);
  const telefono = corto(body?.telefono, 40);
  const interes = corto(body?.interes, 400);
  const productos = corto(body?.productos, 400);

  // Sin datos no hay nada que contactar.
  if (!nombre && !telefono && !interes && !productos) {
    json(res, { ok: false, error: 'sin datos' }, 400);
    return;
  }

  try {
    await guardarContacto({
      ts: new Date().toISOString(),
      nombre,
      telefono,
      interes,
      productos,
      fuente: 'formulario del catalogo',
    });
  } catch (e) {
    console.error('[api/contacto]', e);
    json(res, { ok: false, error: 'no se pudo guardar' }, 503);
    return;
  }

  json(res, { ok: true });
}
