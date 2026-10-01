import type { CategoriaId, Disponibilidad, EstadoProducto } from '../config/catalog.config';

/**
 * Modelo de producto del catalogo.
 * Los campos obligatorios del brief estan todos presentes; los opcionales
 * reflejan lo que las fichas reales de la marca traen.
 *
 * `imagen` es una ruta bajo /catalogo/** (assets reales). Si un producto llega
 * sin imagen, `imagen` es null y la UI cae al placeholder documentado.
 */
export interface Producto {
  /** id estable y slugificado; se usa en rutas y como clave de React. */
  id: string;
  /** Codigo visible del fabricante (p.ej. "M102985", "ML-68356"). */
  codigo: string;
  /** SKU. Mismo valor que codigo en la fuente actual; separado para el futuro. */
  sku: string;
  /** Marca en mayusculas (p.ej. "MOTUL"). */
  marca: string;
  /** Id de marca, util para agrupar y filtrar (p.ej. "motul"). */
  marcaId: string;
  /** Nombre comercial. */
  nombre: string;
  /** Categoria de alto nivel (ver CATEGORIAS en catalog.config.ts). */
  categoria: CategoriaId;
  /** Subcategoria visible (p.ej. "Filtros de aceite", "Carga pesada"). */
  subcategoria: string;
  /** Id crudo de subcategoria, para filtros futuros. */
  subcategoriaId: string;
  /** Linea / familia dentro de la marca (p.ej. "Motul Care", "Signature Series"). */
  linea: string;
  /** Descripcion corta o recomendacion de uso. */
  descripcion: string;
  /** Presentacion comercial (p.ej. "CAJA 12 X 946ml", "208 LTS"). */
  presentacion: string;
  /** Aplicacion / tipo de motor. */
  aplicacion: string;
  /** Etiqueta de rol para el badge (p.ej. "AUTOS", "CAMIONES"). */
  etiqueta: string;
  /** Ruta del asset real, o null si falta la imagen. */
  imagen: string | null;
  /** Ancho intrinseco del asset, para reservar espacio y evitar CLS. */
  ancho: number | null;
  /** Alto intrinseco del asset. */
  alto: number | null;
  disponibilidad: Disponibilidad;
  estado: EstadoProducto;
  /** Orden curado para el stand. */
  orden: number;
}

export type ProductoInput = Omit<Producto, 'ancho' | 'alto'> & {
  ancho?: number | null;
  alto?: number | null;
};