import type { IncomingMessage, ServerResponse } from 'node:http';
import { cuerpoJson, json, mismoOrigen } from '../shared/http.js';
import { registrarVisita } from '../shared/panel.js';

/**
 * POST /api/visita
 * Registra un visitante. El cliente solo lo llama UNA VEZ POR DIA por
 * navegador (localStorage), asi que en el peor caso es 1 escritura/dia/persona.
 *
 * No hay analitica propia ni beacon: esto es un contador de un solo numero.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    json(res, { ok: false, error: 'metodo no permitido' }, 405);
    return;
  }

  // Otro origen: respondemos OK sin guardar (no le damos pistas a un bot).
  if (!mismoOrigen(req)) {
    json(res, { ok: true });
    return;
  }

  const body = await cuerpoJson<Record<string, unknown>>(req);

  // Honeypot: invisible para humanos, tentador para bots -> se ignora.
  if (body?.trampa) {
    json(res, { ok: true });
    return;
  }

  const sid = String(body?.sid ?? '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 64);
  const fecha = String(body?.fecha ?? '');

  if (!sid || !/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    json(res, { ok: false, error: 'datos invalidos' }, 400);
    return;
  }

  try {
    await registrarVisita(sid, fecha);
  } catch (e) {
    // Nunca rompe la pagina del visitante: el contador es prescindible.
    console.error('[api/visita]', e);
    json(res, { ok: false, error: 'no se pudo registrar' }, 503);
    return;
  }

  json(res, { ok: true });
}
