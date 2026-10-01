/* ============================================================================
   HELPERS DE LAS FUNCIONES /api/*
   Formato clasico de Vercel (Node): (req, res) => void
   ========================================================================== */
import type { IncomingMessage, ServerResponse } from 'node:http';

export function json(res: ServerResponse, datos: unknown, estado = 200): void {
  res.statusCode = estado;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(datos));
}

/** Lee y parsea el cuerpo JSON. Devuelve undefined si no hay o esta roto. */
export async function cuerpoJson<T>(req: IncomingMessage): Promise<T | undefined> {
  const partes: Buffer[] = [];
  for await (const parte of req) partes.push(parte as Buffer);
  const crudo = Buffer.concat(partes).toString('utf8').trim();
  if (!crudo) return undefined;
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return undefined;
  }
}

/**
 * Comprueba que la peticion viene del propio sitio. No es seguridad: solo
 * evita que un script de otro dominio infle el contador a distancia.
 */
export function mismoOrigen(req: IncomingMessage): boolean {
  const origen = req.headers.origin;
  const host = req.headers.host;
  if (!origen || !host) return true;
  try {
    return new URL(origen).host === host;
  } catch {
    return false;
  }
}

/** Valor de una cabecera normalizado a string. */
export function cabecera(req: IncomingMessage, nombre: string): string {
  const valor = req.headers[nombre.toLowerCase()];
  if (Array.isArray(valor)) return valor[0] ?? '';
  return valor ?? '';
}

/** Comparacion que no corta en el primer caracter distinto. */
export function coincide(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let dif = 0;
  for (let i = 0; i < a.length; i++) dif |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return dif === 0;
}
