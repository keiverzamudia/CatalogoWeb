import type { IncomingMessage, ServerResponse } from 'node:http';
import { cabecera, coincide, json } from '../shared/http';
import { leerPanel } from '../shared/panel';

/**
 * GET /api/panel
 * Devuelve el resumen de visitas + el listado de contactos.
 *
 * Requiere la cabecera `x-panel-clave` contra la variable de entorno
 * PANEL_CLAVE. OJO: esto NO es seguridad real (la clave viaja por HTTP y
 * cualquier persona que la conozca entra). Solo evita que alguien que
 * adivine la URL lea los telefonos de los contactos por accidente.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    json(res, { ok: false, error: 'metodo no permitido' }, 405);
    return;
  }

  const esperada = process.env.PANEL_CLAVE;
  if (!esperada) {
    json(
      res,
      {
        ok: false,
        error:
          'Falta la variable de entorno PANEL_CLAVE. Definela en Vercel > Settings > Environment Variables.',
      },
      503,
    );
    return;
  }

  if (!coincide(cabecera(req, 'x-panel-clave'), esperada)) {
    json(res, { ok: false, error: 'Clave incorrecta' }, 401);
    return;
  }

  try {
    const panel = await leerPanel();
    json(res, { ok: true, ...panel });
  } catch (e) {
    console.error('[api/panel]', e);
    json(
      res,
      {
        ok: false,
        error:
          'No se pudo leer el almacen. Revisa que la tienda de Blob este conectada (BLOB_READ_WRITE_TOKEN).',
      },
      503,
    );
  }
}
