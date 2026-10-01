import type { CategoriaId } from '../config/catalog.config';
import type { Producto } from '../data/tipos';

/* ============================================================================
   BUSQUEDA
   Campos indexados: codigo, sku, nombre, marca, categoria, descripcion.
   (linea, presentacion, aplicacion y subcategoria tambien se buscan: son
    terminos que un visitador escribe en un stand.)
   ========================================================================== */

/** Quita acentos y pasa a minusculas para comparar sin sorpresas. */
export function normalizarTexto(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Version "plana" de un codigo: sin guiones ni espacios (M102-985 -> m102985). */
function plano(s: string): string {
  return normalizarTexto(s).replace(/[^a-z0-9]/g, '');
}

/** Cache de indexado por producto, construida una sola vez. */
interface Indice {
  id: string;
  texto: string;
  /** Texto sin separadores: permite que "15w40" encuentre "15W-40". */
  textoPlano: string;
  codigo: string;
}

const cache = new WeakMap<Producto, Indice>();

function indice(p: Producto): Indice {
  let i = cache.get(p);
  if (!i) {
    const texto = normalizarTexto(
      [
        p.nombre,
        p.codigo,
        p.sku,
        p.marca,
        p.categoria,
        p.subcategoria,
        p.linea,
        p.presentacion,
        p.aplicacion,
        p.descripcion,
        p.etiqueta,
      ].join(' '),
    );
    i = {
      id: p.id,
      texto,
      textoPlano: texto.replace(/[^a-z0-9]+/g, ''),
      codigo: plano(p.codigo || p.sku),
    };
    cache.set(p, i);
  }
  return i;
}

/**
 * Devuelve true si el producto coincide con la consulta.
 * Regla: TODOS los términos deben aparecer (AND), en cualquier campo.
 * Un término numérico busca primero coincidencia por codigo/SKU.
 */
export function coincide(p: Producto, consulta: string): boolean {
  const q = normalizarTexto(consulta);
  if (!q) return true;

  const terminos = q.split(/\s+/).filter(Boolean);
  const i = indice(p);

  return terminos.every((t) => {
    const tPlano = t.replace(/[^a-z0-9]/g, '');
    if (tPlano.length < 2) return i.texto.includes(t);

    // 1) Codigo / SKU: prefijo o inclusion. Es la busqueda mas frecuente
    //    en un stand ("dame el M102985").
    if (/^[a-z0-9]+$/.test(tPlano) && i.codigo) {
      if (i.codigo.startsWith(tPlano) || i.codigo.includes(tPlano)) return true;
    }

    // 2) Texto tal cual: cubre acentos, espacios y palabras.
    if (i.texto.includes(t)) return true;

    // 3) Texto sin separadores: cubre "15w40" -> "15W-40", "ca12x1l" -> "CAJA 12 X 1L".
    return i.textoPlano.includes(tPlano);
  });
}

export interface ResultadoCatalogo {
  productos: Producto[];
  total: number;
}

/** Aplica busqueda + filtro de categoria y marca. Es la unica funcion de filtrado. */
export function filtrarCatalogo(
  productos: Producto[],
  consulta: string,
  categoria: CategoriaId,
  marca: string = 'TODAS',
): ResultadoCatalogo {
  const filtrados = productos.filter(
    (p) =>
      (categoria === 'TODOS' || p.categoria === categoria) &&
      (marca === 'TODAS' || p.marca === marca) &&
      coincide(p, consulta),
  );
  return { productos: filtrados, total: filtrados.length };
}