/* ============================================================================
   CLIENTE DEL PANEL
   Llamadas a /api/*. Todo es fire-and-forget: si el endpoint no existe o
   falla, el catalogo sigue funcionando igual. Nunca bloquea la UI.
   ========================================================================== */

import type { DatosPanel } from '../../shared/panel';

const CLAVE_KEY = 'gs_panel_clave';
const VISITANTE_KEY = 'gs_visitante';
const VISITA_DIA_KEY = 'gs_ultima_visita';
/* -- clave del panel (guardada en el navegador del administrador) -------- */

export function claveGuardada(): string {
  try {
    return sessionStorage.getItem(CLAVE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function guardarClave(clave: string): void {
  try {
    sessionStorage.setItem(CLAVE_KEY, clave);
  } catch {
    /* modo privado */
  }
}

export function olvidarClave(): void {
  try {
    sessionStorage.removeItem(CLAVE_KEY);
  } catch {
    /* modo privado */
  }
}

/* -- visitas ------------------------------------------------------------- */

/**
 * Identificador del navegador. SE PERSISTE: sin eso cada dia saldria un id
 * nuevo y "navegadores distintos" valdria lo mismo que "visitas".
 * No se usa huella de dispositivo ni nada que permita seguir al usuario en
 * otros sitios: solo un numero aleatorio en este navegador.
 */
function idVisitante(): string {
  const nuevo = () => {
    const c = globalThis.crypto;
    if (c && 'randomUUID' in c) return c.randomUUID().replace(/-/g, '').slice(0, 32);
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  };
  try {
    const guardado = localStorage.getItem(VISITANTE_KEY);
    if (guardado) return guardado;
    const id = nuevo();
    localStorage.setItem(VISITANTE_KEY, id);
    return id;
  } catch {
    return nuevo();
  }
}

/**
 * Cuenta el navegador actual, COMO MAXIMO UNA VEZ POR DIA.
 * Si no hay localStorage (modo privado / bloqueo) simplemente no se cuenta:
 * no se usa ninguna alternativa que permita seguir al usuario.
 */
export function registrarVisita(): void {
  try {
    if (typeof window === 'undefined') return;
    const hoy = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(VISITA_DIA_KEY) === hoy) return;
    localStorage.setItem(VISITA_DIA_KEY, hoy);
    const sid = idVisitante();

    void fetch('/api/visita', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ sid, fecha: hoy, trampa: '' }),
    }).catch(() => undefined);
  } catch {
    /* sin storage: no contamos */
  }
}

/* -- contactos ----------------------------------------------------------- */

export interface ContactoNuevo {
  nombre: string;
  telefono: string;
  interes: string;
  productos: string;
}

/** Devuelve true si quedo guardado. La pagina nunca espera por esto. */
export async function guardarContacto(datos: ContactoNuevo): Promise<boolean> {
  try {
    const r = await fetch('/api/contacto', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ ...datos, trampa: '' }),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/* -- panel --------------------------------------------------------------- */

export type ResultadoPanel =
  | { ok: true; datos: DatosPanel }
  | { ok: false; error: string };

export async function cargarPanel(clave: string): Promise<ResultadoPanel> {
  try {
    const r = await fetch('/api/panel', {
      headers: { 'x-panel-clave': clave, accept: 'application/json' },
      cache: 'no-store',
    });
    const data = (await r.json().catch(() => null)) as
      | ({ ok?: boolean; error?: string } & DatosPanel)
      | null;

    if (!r.ok || !data || data.ok === false) {
      if (r.status === 401) return { ok: false, error: 'Clave incorrecta' };
      if (r.status === 404 || r.status === 200) {
        // Un HTML (SPA rewrite) en vez de JSON: el endpoint no esta publicado.
        return {
          ok: false,
          error:
            'El panel todavia no esta publicado. Despliega el proyecto en Vercel con las variables PANEL_CLAVE y BLOB_READ_WRITE_TOKEN.',
        };
      }
      return { ok: false, error: data?.error ?? `Error ${r.status}` };
    }

    return {
      ok: true,
      datos: { visitas: data.visitas, contactos: data.contactos, almacen: data.almacen },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Sin conexion con /api/panel' };
  }
}
