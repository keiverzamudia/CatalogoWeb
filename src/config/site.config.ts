/* ============================================================================
   CONFIGURACION CENTRAL DE MARCA
   Unico lugar donde viven los datos comerciales: WhatsApp, email, evento,
   redes, hero y ubicacion. NO repetirlos en componentes.

   ⚠ DATO PROVISIONAL
   WhatsApp (WHATSAPP_E164) SI esta cargado por el cliente; telefono, email,
   anio del evento y el 2do Instagram siguen siendo datos del mockup y NO
   estan confirmados. Ver DATOS_PROVISIONALES abajo.
   Para cambiar el WhatsApp se edita UNA SOLA linea: WHATSAPP_E164, abajo.
   En desarrollo la consola lista todos los valores pendientes.
   ========================================================================== */

export interface CanalRedes {
  id: string;
  label: string;
  /** Texto secundario de la tile (handler o descriptor). */
  sublabel: string;
  href: string;
  /** Clases del cuadrado de icono 32x32 con el color de la marca del canal. */
  iconoClases: string;
  /** Path SVG inline del glifo. */
  icono: string;
}

export interface ConfigSitio {
  empresa: string;
  empresaLinea2: string;
  unidadNegocio: string;
  eslogan: string;
  evento: string;
  eventoAnio: string;
  ubicacion: string;
  direccion: string;
  email: string;
  telefono: string;
  whatsappE164: string;
  horario: string;
  redes: CanalRedes[];
  /** Metricas del hero navy. */
  hero: { valor: string; label: string }[];
  copyrightAnio: string;
}

/**
 * Numero de WhatsApp del stand. UNICO PUNTO DE CAMBIO: alimenta
 * SITE.whatsappE164, la tile de redes, el FAB flotante y todos los CTA
 * (src/lib/whatsapp.ts), que anaden el mensaje contextual con ?text=.
 *
 * Si se quisiera forzar un link corto de QR de WhatsApp en la tile,
 * reemplazar WHATSAPP_URL por ese link (siempre derivado, sin llaves raras):
 *   const WHATSAPP_URL = 'https://wa.me/qr/CODIGO';
 */
const WHATSAPP_E164 = '584129640810';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}`;

/** Display legible de un E.164: 584129640810 -> +58 412 964 0810 */
function formatoTelefono(e164: string): string {
  const n = e164.replace(/\D/g, '');
  if (n.length < 12) return `+${n}`;
  return `+${n.slice(0, 2)} ${n.slice(2, 5)} ${n.slice(5, 8)} ${n.slice(8)}`;
}

export const SITE: ConfigSitio = {
  empresa: 'GRUPO SAN LUIS',
  empresaLinea2: 'LUBRICANTES',
  unidadNegocio: 'Lubricantes y Repuestos',
  eslogan: 'Energía • Lubricantes • Transporte de Carga',
  evento: 'EXPO',
  eventoAnio: '2025', // mock: confirmar año real del evento
  ubicacion: 'Barquisimeto, Estado Lara, Venezuela',
  direccion: 'Barquisimeto, Estado Lara, Venezuela. Despachos a nivel nacional.',
  email: 'ventassanluis.sl@gmail.com.ve', // mock: dato tomado del sitio institucional
  telefono: formatoTelefono(WHATSAPP_E164), // derivado del WhatsApp: sin numeros mock
  whatsappE164: WHATSAPP_E164, // ver WHATSAPP_E164 arriba (unico punto de cambio)
  horario: 'Lun–Vie 7:00–17:00',
  redes: [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      sublabel: 'Atención Stand',
      href: WHATSAPP_URL, // derivada de WHATSAPP_E164, no literales
      iconoClases: 'bg-brand-whatsapp',
      icono: 'whatsapp',
    },
    {
      id: 'instagram-suministros',
      label: 'Instagram',
      sublabel: '@suministrossanluis',
      href: 'https://www.instagram.com/suministrossanluis/',
      iconoClases: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
      icono: 'instagram',
    },
    {
      id: 'instagram-grupo',
      label: 'Instagram',
      sublabel: '@sanluishidrocarburo', // PROVISIONAL: handle del mockup de Stitch
      href: 'https://www.instagram.com/sanluishidrocarburo/',
      iconoClases: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
      icono: 'instagram',
    },
  ],
  hero: [
    { valor: '+1.200', label: 'Referencias' },
    { valor: '48 HORAS', label: 'Despacho' },
    { valor: '100% OFICIAL', label: 'Motul • PDV' },
  ],
  copyrightAnio: '2025', // mock: se alinea con SITE.eventoAnio en produccion
};

/** Marca del administrador. Visible solo en /admin. */
export const MARCA_HEADER = {
  /** Letra del monograma del logo del header. */
  inicial: 'G',
  wordmark: 'SAN LUIS',
  subwordmark: 'LUBRICANTES',
  badge: 'STAND OFICIAL',
};

/** Texto legal / institucional del footer. */
export const FOOTER = {
  lineaCatalogo: 'Catálogo Digital Oficial para Stand de Exposición',
};

/**
 * Datos marcados como provisionales. Se muestran en consola en desarrollo
 * para que nadie publique un numero de telefono inventado por error.
 */
export const DATOS_PROVISIONALES = [
  'SITE.eventoAnio',
  'SITE.email',
  'SITE.redes[2].href — 2do Instagram (@gruposanluis.ve)',
  'SITE.hero[0].valor',
  'WHATSAPP_E164 — cargado por el cliente: verificar digitos antes de imprimir el QR',
] as const;

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    '[config] Valores PROVISIONALES pendientes de confirmar antes del deploy:\n  - ' +
      DATOS_PROVISIONALES.join('\n  - '),
  );
}