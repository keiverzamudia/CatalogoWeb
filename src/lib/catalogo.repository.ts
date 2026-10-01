import { CATEGORIAS, type CategoriaId } from '../config/catalog.config';
import type { Producto, ProductoInput } from '../data/tipos';
import productosCrudos from '../data/productos.json';

/* ============================================================================
   REPOSITORIO DE CATALOGO
   Unica capa que sabe de donde vienen los productos.

   Arquitectura definitiva: ESTATICA. El JSON vive en el repositorio, Vite lo
   empaqueta en JavaScript durante `npm run build` y Vercel lo sirve desde CDN.
   No hay API, backend ni base de datos externa.

       src/data/productos.json -> vite build -> dist/assets/*.js -> Vercel CDN
   ========================================================================== */

export interface CatalogoRepository {
  listar(): Promise<Producto[]>;
  buscarPorId(id: string): Promise<Producto | null>;
}

/** Normaliza la entrada cruda del JSON y descarta productos desactivados. */
function normalizar(p: ProductoInput): Producto {
  return {
    ...p,
    imagen: p.imagen ?? null,
    ancho: p.ancho ?? null,
    alto: p.alto ?? null,
  };
}

function activo(p: Producto): boolean {
  return p.estado === 'ACTIVO';
}

/** Implementacion local sobre el JSON versionado en Git. */
export class CatalogoLocal implements CatalogoRepository {
  private readonly cache: Producto[];

  constructor(crudos: ProductoInput[] = productosCrudos as ProductoInput[]) {
    this.cache = crudos.map(normalizar).filter(activo).sort((a, b) => a.orden - b.orden);
  }

  async listar(): Promise<Producto[]> {
    return this.cache;
  }

  async buscarPorId(id: string): Promise<Producto | null> {
    return this.cache.find((p) => p.id === id) ?? null;
  }
}

export const catalogoRepo = new CatalogoLocal();

/* --- helpers de dominio ------------------------------------------------- */

export interface ConteoCategoria {
  id: CategoriaId;
  label: string;
  total: number;
}

/**
 * Conteos por categoria, derivados de los datos reales.
 * El texto "Todos (94)" del Stitch pasa a ser el conteo verdadero.
 */
export function conteoPorCategoria(productos: Producto[]): ConteoCategoria[] {
  const porId = new Map<CategoriaId, number>([['TODOS', productos.length]]);
  for (const c of CATEGORIAS) if (!c.esTodos) porId.set(c.id, 0);
  for (const p of productos) porId.set(p.categoria, (porId.get(p.categoria) ?? 0) + 1);
  return CATEGORIAS.map((c) => ({
    id: c.id,
    label: c.label,
    total: porId.get(c.id) ?? 0,
  }));
}

/* --- estadisticas para el panel /admin (visual, solo lectura) ---------- */

export interface ResumenCatalogo {
  total: number;
  porCategoria: ConteoCategoria[];
  porMarca: { marca: string; total: number }[];
  sinDescripcion: { id: string; nombre: string; marca: string }[];
  sinImagen: { id: string; nombre: string; marca: string }[];
  codigosRepetidos: { codigo: string; total: number }[];
  imagenes: number;
}

export function resumenCatalogo(productos: Producto[]): ResumenCatalogo {
  const porMarca = new Map<string, number>();
  const porCodigo = new Map<string, number>();

  for (const p of productos) {
    porMarca.set(p.marca, (porMarca.get(p.marca) ?? 0) + 1);
    if (p.codigo) porCodigo.set(p.codigo, (porCodigo.get(p.codigo) ?? 0) + 1);
  }

  return {
    total: productos.length,
    porCategoria: conteoPorCategoria(productos),
    porMarca: [...porMarca.entries()]
      .map(([marca, total]) => ({ marca, total }))
      .sort((a, b) => b.total - a.total),
    sinDescripcion: productos
      .filter((p) => !p.descripcion.trim())
      .map((p) => ({ id: p.id, nombre: p.nombre, marca: p.marca })),
    sinImagen: productos
      .filter((p) => !p.imagen)
      .map((p) => ({ id: p.id, nombre: p.nombre, marca: p.marca })),
    codigosRepetidos: [...porCodigo.entries()]
      .filter(([, total]) => total > 1)
      .map(([codigo, total]) => ({ codigo, total }))
      .sort((a, b) => b.total - a.total),
    imagenes: productos.filter((p) => p.imagen).length,
  };
}