import { SITE } from '../config/site.config';
import type { Producto } from '../data/tipos';

/* ============================================================================
   WHATSAPP
   Todo numero y mensaje de WhatsApp sale de aca y de SITE. No hay literales
   "wa.me/..." sueltos en los componentes.
   ========================================================================== */

/** Formato internacional sin +, tal como lo exige wa.me */
function e164(numero: string): string {
  return numero.replace(/\D/g, '');
}

function link(mensaje: string): string {
  return `https://wa.me/${e164(SITE.whatsappE164)}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Mensaje contextual de producto. Formato tomado literalmente del patron
 * que Stitch ya traia en cada CTA:
 *   "Consultar {nombre} (Cod: {codigo})"
 */
export function mensajeProducto(p: Producto): string {
  const partes = [`Hola, estoy interesado en:`, p.nombre.toUpperCase(), `Código: ${p.sku || p.codigo}`];
  const extra: string[] = [];
  if (p.presentacion) extra.push(`Presentación: ${p.presentacion}`);
  if (p.marca) extra.push(`Marca: ${p.marca}`);
  return partes.concat(extra).join('\n');
}

export function urlProducto(p: Producto): string {
  return link(mensajeProducto(p));
}

/** Mensaje de atencion de stand (sin producto). */
export function urlStand(): string {
  return link('Hola, visito el stand y deseo atención.');
}

/** Link de contacto generico para la tarjeta de WhatsApp. */
export function urlContacto(): string {
  return link('Hola, deseo información sobre lubricantes y repuestos.');
}

/**
 * Link de contacto con los datos que el visitante escribio en el formulario.
 * Se usa el encabezado de contacto (no el de cotizacion) porque el visitante
 * puede no haber indicado ningun producto: solo dejo su telefono.
 */
export function urlContactoConDatos(lineas: string[]): string {
  const limpio = lineas.filter((l) => l.trim().length > 0);
  const cuerpo = limpio.length ? `Hola, dejo mis datos:\n${limpio.join('\n')}` : 'Hola, deseo información.';
  return link(cuerpo);
}

/** Link de cotizacion a partir de una lista de productos del formulario. */
export function urlCotizacion(nombres: string[]): string {
  const lista = nombres.length ? nombres.join('\n- ') : 'sin producto especificado';
  return link(`Hola, solicito cotización de:\n- ${lista}`);
}