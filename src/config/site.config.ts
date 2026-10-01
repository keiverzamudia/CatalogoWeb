/* ============================================================================
   CONFIGURACION CENTRAL DE MARCA
   Unico lugar donde viven los datos comerciales: WhatsApp, email, evento,
   redes, hero y ubicacion. NO repetirlos en componentes.

   ⚠ DATO PROVISIONAL
   WhatsApp (582510000000), telefono, email y anio del evento vienen del mockup
   o del sitio institucional: NO estan confirmados por el cliente.
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
 * PROVISIONAL — numero de WhatsApp de EJEMPLO, NO confirmado.
 * Se cambia SOLO aca: alimenta SITE.whatsappE164, la tile de redes y
 * todos los CTA (src/lib/whatsapp.ts).
 */
const WHATSAPP_E164 = '582510000000';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_E164}`;

export const SITE: ConfigSitio = {
  empresa: 'GRUPO SAN LUIS',
  empresaLinea2: 'LUBRICANTES',
  unidadNegocio: 'Lubricantes y Repuestos',
  eslogan: 'Energía • Lubricantes • Transporte de Carga',
  evento: 'EXPO',
  eventoAnio: '2025', // mock: confirmar año real del evento
  ubicacion: 'Barquisimeto, Estado Lara, Venezuela',
  direccion: 'Barquisimeto, Estado Lara, Venezuela. Despachos a nivel nacional.',
  email: 'comercial@gruposanluis.com', // mock: dato tomado del sitio institucional
  telefono: '+58 (251) 000-0000', // mock: numero de ejemplo, NO confirmado
  whatsappE164: WHATSAPP_E164, // provisional: ver WHATSAPP_E164 arriba
  horario: 'Lun–Vie 7:00–17:00',
  redes: [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      sublabel: 'Atención Stand',
      href: WHATSAPP_URL, // derivada, no literales
      iconoClases: 'bg-brand-whatsapp',
      icono: 'whatsapp',
    },
    {
      id: 'instagram',
      label: 'Instagram',
      sublabel: '@gruposanluis.ve',
      href: 'https://instagram.com/gruposanluis.ve',
      iconoClases: 'bg-gradient-to-br from-purple-600 via-pink-600 to-amber-500',
      icono: 'instagram',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      sublabel: 'Grupo San Luis',
      href: 'https://linkedin.com',
      iconoClases: 'bg-blue-600',
      icono: 'linkedin',
    },
    {
      id: 'youtube',
      label: 'YouTube / TikTok',
      sublabel: 'Videos & Casos',
      href: 'https://youtube.com',
      iconoClases: 'bg-red-600',
      icono: 'youtube',
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
  'SITE.telefono',
  'SITE.whatsappE164',
  'SITE.email',
  'SITE.redes[1].href',
  'SITE.redes[2].href',
  'SITE.redes[3].href',
  'SITE.hero[0].valor',
] as const;

if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.info(
    '[config] Valores PROVISIONALES pendientes de confirmar antes del deploy:\n  - ' +
      DATOS_PROVISIONALES.join('\n  - '),
  );
}