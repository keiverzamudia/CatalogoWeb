/* ============================================================================
   ALMACEN DEL PANEL INTERNO (/admin)
   --------------------------------------------------------------------------
   Dos backings elegidos en runtime; el codigo de los handlers es igual para
   los dos:

   1. PRODUCCION (Vercel): si existe BLOB_READ_WRITE_TOKEN usamos Vercel Blob
      (plan Hobby: 1 GB y 2.000 escrituras/mes, gratuitos).

      Diseno pensado para NO gastar operaciones de mas:
        - una visita   = un archivo por (fecha, visitante)  -> 1 escritura
        - un contacto  = un archivo con clave aleatoria     -> 1 escritura
      Nunca hay que "leer antes de escribir" (read-modify-write), que es lo
      que dispara las operaciones avanzadas. El conteo se reconstruye leyendo
      los NOMBRES de los archivos, que es una sola operacion de listado.

   2. DEV LOCAL / TESTS: si no hay token, se guarda en memoria del proceso.
      Se pierde al reiniciar `npm run dev`. Sirve para probar el panel sin
      tocar Vercel.

   PRIVACIDAD: cada contacto vive en un archivo con id aleatorio, asi su URL
   publica no es deducible. Solo se puede leer con el token de servidor.
   ========================================================================== */

import { del, list, put } from '@vercel/blob';

export interface Contacto {
  id: string;
  /** ISO completo, sirve para ordenar. */
  ts: string;
  nombre: string;
  telefono: string;
  interes: string;
  productos: string;
  /** De donde vino: formulario del catalogo. */
  fuente: string;
}

export interface DiaVisitas {
  fecha: string;
  total: number;
}

export interface ResumenVisitas {
  /** Registros dentro de la retencion (90 dias). */
  total: number;
  hoy: number;
  /** Navegadores distintos en 30 dias: aproximacion de "personas". */
  unicos30: number;
  /** Serie diaria de los ultimos 30 dias, dias vacios incluidos. */
  porDia: DiaVisitas[];
  ultima: string | null;
}

export interface DatosPanel {
  visitas: ResumenVisitas;
  contactos: Contacto[];
  /** De donde salen los datos ahora mismo. */
  almacen: 'blob' | 'memoria';
}

const PREFIJO_VISITA = 'visitas/';
const PREFIJO_CONTACTO = 'contactos/';
const RETENCION_DIAS = 90;
const VENTANA_DIAS = 30;

interface Archivo {
  clave: string;
  /** null en memoria: el cuerpo ya esta en `cuerpo`. */
  url: string | null;
  cuerpo: string | null;
}

/** Backing local cuando no hay token de Blob. */
const memoria = new Map<string, string>();

function hayBlob(): boolean {
  return typeof process !== 'undefined' && !!process.env.BLOB_READ_WRITE_TOKEN;
}

async function guardar(clave: string, cuerpo: string): Promise<void> {
  if (hayBlob()) {
    await put(clave, cuerpo, {
      access: 'public',
      allowOverwrite: true,
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
    });
    return;
  }
  memoria.set(clave, cuerpo);
}

/** Listado paginado. En memoria filtra el Map local. */
async function listar(prefijo: string): Promise<Archivo[]> {
  if (!hayBlob()) {
    return [...memoria.entries()]
      .filter(([clave]) => clave.startsWith(prefijo))
      .map(([clave, cuerpo]) => ({ clave, url: null, cuerpo }));
  }

  const salida: Archivo[] = [];
  let cursor: string | undefined;
  for (let pagina = 0; pagina < 50; pagina++) {
    const r = await list({
      prefix: prefijo,
      limit: 1000,
      ...(cursor ? { cursor } : {}),
    });
    for (const b of r.blobs) salida.push({ clave: b.pathname, url: b.url, cuerpo: null });
    if (!r.hasMore || !r.cursor || r.cursor === cursor) break;
    cursor = r.cursor;
  }
  return salida;
}

async function leerCuerpo(a: Archivo): Promise<string | null> {
  if (a.cuerpo !== null) return a.cuerpo;
  if (!a.url) return null;
  try {
    const r = await fetch(a.url);
    if (!r.ok) return null;
    return await r.text();
  } catch {
    return null;
  }
}

/* -- fechas -------------------------------------------------------------- */

function diaIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function diaHace(dias: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - dias);
  return diaIso(d);
}

/** `visitas/2026-10-01/sid` -> `2026-10-01` (null si la clave no vale). */
function fechaDeClave(clave: string): string | null {
  const posible = clave.slice(PREFIJO_VISITA.length, PREFIJO_VISITA.length + 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(posible) ? posible : null;
}

function sidDeClave(clave: string): string {
  return clave.slice(PREFIJO_VISITA.length + 11);
}

function idAleatorio(): string {
  const c = globalThis.crypto;
  if (c && 'randomUUID' in c) return c.randomUUID().replace(/-/g, '').slice(0, 20);
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

/* -- escritura ----------------------------------------------------------- */

/** 1 archivo por (fecha, visitante). Sin lectura previa. */
export async function registrarVisita(sid: string, fecha: string): Promise<void> {
  await guardar(`${PREFIJO_VISITA}${fecha}/${sid}`, fecha);
}

/** 1 archivo por contacto, con id aleatorio. Sin lectura previa. */
export async function guardarContacto(
  datos: Omit<Contacto, 'id'>,
): Promise<Contacto> {
  const contacto: Contacto = { ...datos, id: idAleatorio() };
  const sello = datos.ts.replace(/[:.]/g, '-');
  await guardar(`${PREFIJO_CONTACTO}${sello}-${contacto.id}.json`, JSON.stringify(contacto));
  return contacto;
}

/* -- lectura ------------------------------------------------------------- */

export async function leerPanel(): Promise<DatosPanel> {
  const almacen = hayBlob() ? 'blob' : 'memoria';
  const limite = diaHace(RETENCION_DIAS);
  const inicio = diaHace(VENTANA_DIAS);
  const hoy = diaIso(new Date());

  /* Visitas: se cuentan por nombre de archivo, sin bajar cuerpos. */
  const todas = await listar(PREFIJO_VISITA);
  const viejas = todas
    .filter((a) => {
      const f = fechaDeClave(a.clave);
      return f !== null && f < limite;
    })
    .map((a) => a.clave);

  if (viejas.length > 0 && hayBlob()) {
    // del() es gratis en Vercel Blob.
    try {
      await del(viejas);
    } catch {
      /* si falla seguimos: solo es poda */
    }
  }

  const porDiaMap = new Map<string, number>();
  const sids = new Set<string>();
  let total = 0;
  let hoyTotal = 0;
  let ultima: string | null = null;

  for (const a of todas) {
    const f = fechaDeClave(a.clave);
    if (f === null || f < limite) continue;
    total++;
    porDiaMap.set(f, (porDiaMap.get(f) ?? 0) + 1);
    if (f === hoy) hoyTotal++;
    if (ultima === null || f > ultima) ultima = f;
    if (f >= inicio) sids.add(sidDeClave(a.clave));
  }

  const porDia: DiaVisitas[] = [];
  for (let i = VENTANA_DIAS - 1; i >= 0; i--) {
    const fecha = diaHace(i);
    porDia.push({ fecha, total: porDiaMap.get(fecha) ?? 0 });
  }

  /* Contactos: si hay que bajar los cuerpos (1 peticion c/u). */
  const archivosContacto = await listar(PREFIJO_CONTACTO);
  const contactos = (
    await Promise.all(
      archivosContacto.map(async (a) => {
        const texto = await leerCuerpo(a);
        if (!texto) return null;
        try {
          return JSON.parse(texto) as Contacto;
        } catch {
          return null;
        }
      }),
    )
  )
    .filter((c): c is Contacto => c !== null)
    .sort((a, b) => b.ts.localeCompare(a.ts));

  return {
    visitas: {
      total,
      hoy: hoyTotal,
      unicos30: sids.size,
      porDia,
      ultima,
    },
    contactos,
    almacen,
  };
}

/** Solo para desarrollo: cuanto hay en memoria. */
export function estadoMemoria(): number {
  return memoria.size;
}
