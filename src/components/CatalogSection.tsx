import { useDeferredValue, useMemo, useState } from 'react';
import { COPY, colorMarca, compararMarca, type CategoriaId } from '../config/catalog.config';
import type { Producto } from '../data/tipos';
import { conteoPorCategoria, conteoPorMarca } from '../lib/catalogo.repository';
import { filtrarCatalogo } from '../lib/busqueda';
import { Icono } from './ui/Icono';
import { ProductCard, VacioCatalogo } from './ProductCard';

interface Props {
  productos: Producto[];
  onSelect: (p: Producto) => void;
}

/** Productos iniciales en pantalla antes de pedir mas. */
const PAGINA_INICIAL = 24;
/** Cuantos productos agrega cada clic en "Ver mas referencias". */
const BLOQUE = 24;

interface GrupoMarca {
  marca: string;
  /** Total de la marca dentro del filtro activo (no solo los visibles). */
  total: number;
  productos: Producto[];
}

/**
 * Agrupa los productos por marca respetando el orden curado, conservando el
 * orden interno (que ya viene curado por `orden`). Las secciones se pintan con
 * un encabezado por marca.
 */
function agruparPorMarca(productos: Producto[]): GrupoMarca[] {
  const mapa = new Map<string, Producto[]>();
  for (const p of productos) {
    const g = mapa.get(p.marca);
    if (g) g.push(p);
    else mapa.set(p.marca, [p]);
  }
  return [...mapa.entries()]
    .map(([marca, lista]) => ({ marca, total: lista.length, productos: lista }))
    .sort((a, b) => compararMarca(a.marca, b.marca));
}

/** Recorta los grupos a `limite` productos repartidos de marca en marca. */
function recortarGrupos(grupos: GrupoMarca[], limite: number): GrupoMarca[] {
  const salida: GrupoMarca[] = [];
  let restantes = limite;
  for (const g of grupos) {
    if (restantes <= 0) break;
    salida.push({ ...g, productos: g.productos.slice(0, restantes) });
    restantes -= g.productos.length;
  }
  return salida;
}

/**
 * Seccion del catalogo. Conserva la composicion del Stitch:
 * header con contador -> buscador -> pills de categoria y marca -> grid.
 *
 * El grid se organiza por marca en secciones con encabezado, y el boton final
 * carga las referencias en bloques sin tope (antes habia un tope duro de 24
 * que impedia ver el resto del catalogo).
 */
export function CatalogSection({ productos, onSelect }: Props) {
  const [consulta, setConsulta] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId>('TODOS');
  const [marca, setMarca] = useState<string>('TODAS');
  const [visibles, setVisibles] = useState(PAGINA_INICIAL);

  // Búsqueda diferida: mantiene el input fluido con 200+ productos.
  const q = useDeferredValue(consulta);

  // Base = categoria + busqueda (sin marca). Sirve para contar marcas reales.
  const base = useMemo(
    () => filtrarCatalogo(productos, q, categoria),
    [productos, q, categoria],
  );
  const marcas = useMemo(() => conteoPorMarca(base.productos), [base]);

  // Conteos de categoria reaccionan a la marca activa (facetas cruzadas).
  const porMarcaBase = useMemo(
    () => filtrarCatalogo(productos, q, 'TODOS', marca).productos,
    [productos, q, marca],
  );
  const conteosCategoria = useMemo(
    () => conteoPorCategoria(porMarcaBase),
    [porMarcaBase],
  );

  // Resultado final aplicando tambien el filtro de marca.
  const filtrados = useMemo(
    () => filtrarCatalogo(productos, q, categoria, marca).productos,
    [productos, q, categoria, marca],
  );

  const grupos = useMemo(() => agruparPorMarca(filtrados), [filtrados]);
  const gruposVisibles = useMemo(
    () => recortarGrupos(grupos, visibles),
    [grupos, visibles],
  );

  const mostrados = gruposVisibles.reduce((n, g) => n + g.productos.length, 0);
  const restantes = Math.max(0, filtrados.length - mostrados);
  // Encabezado de marca solo cuando hay mas de una marca en pantalla.
  const conEncabezados = grupos.length > 1;

  function alCambiarCategoria(id: CategoriaId) {
    setCategoria(id);
    setMarca('TODAS');
    setVisibles(PAGINA_INICIAL);
  }

  function alCambiarMarca(m: string) {
    setMarca(m);
    setVisibles(PAGINA_INICIAL);
  }

  function alBuscar(v: string) {
    setConsulta(v);
    setVisibles(PAGINA_INICIAL);
  }

  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5 sm:mt-7" id="catalogo-seccion">
      <div className="flex items-center justify-between mb-3 gap-3">
        <h2 className="text-xs sm:text-sm lg:text-base font-black uppercase text-brand-navy tracking-[0.14em] flex items-center">
          <span className="w-1.5 h-3.5 sm:h-4 bg-brand-lime rounded-xs mr-2 inline-block" />
          {COPY.catalogo.titulo}
        </h2>
        <span className="text-[10px] sm:text-xs text-slate-500 font-semibold tabular-nums whitespace-nowrap">
          {mostrados} de {filtrados.length} ítems
        </span>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 sm:p-2.5 mb-3">
        <div className="relative flex items-center">
          <Icono
            nombre="search"
            className="w-3.5 h-3.5 text-slate-400 absolute left-3"
          />
          <input
            type="search"
            value={consulta}
            onChange={(e) => alBuscar(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy focus:bg-white font-medium min-h-[44px]"
            placeholder={COPY.buscar.placeholder}
            aria-label="Buscar en el catálogo"
            enterKeyHint="search"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          {consulta && (
            <button
              type="button"
              onClick={() => alBuscar('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 w-7 h-7 flex items-center justify-center text-slate-400 hover:text-brand-navy"
            >
              <Icono nombre="close" className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Pills de categoría: horizontal scroller con snap, tal como el DESIGN */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pill-scroller pb-1 mb-2 text-xs"
        role="tablist"
        aria-label="Categorías del catálogo"
      >
        {conteosCategoria.map((c) => {
          const activo = categoria === c.id;
          return (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={activo}
              disabled={c.total === 0}
              onClick={() => alCambiarCategoria(c.id)}
              className={
                activo
                  ? 'shrink-0 bg-brand-navy text-white px-3.5 py-2 rounded-full font-bold text-xs border border-brand-navy min-h-[36px] shadow-xs'
                  : c.total === 0
                    ? 'shrink-0 bg-white border border-slate-200 text-slate-400 px-3.5 py-2 rounded-full font-medium text-[11px] min-h-[36px] cursor-not-allowed'
                    : 'shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-2 rounded-full font-medium text-[11px] min-h-[36px]'
              }
            >
              {c.label}
              {c.total > 0 && ` (${c.total})`}
            </button>
          );
        })}
      </div>

      {/* Pills de marca: filtran el catálogo por fabricante. */}
      <div
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pill-scroller pb-1 mb-4 text-xs"
        role="tablist"
        aria-label="Marcas del catálogo"
      >
        <button
          type="button"
          role="tab"
          aria-selected={marca === 'TODAS'}
          onClick={() => alCambiarMarca('TODAS')}
          className={
            marca === 'TODAS'
              ? 'shrink-0 bg-brand-navy text-white px-3.5 py-2 rounded-full font-bold text-xs border border-brand-navy min-h-[36px] shadow-xs'
              : 'shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-2 rounded-full font-medium text-[11px] min-h-[36px]'
          }
        >
          {COPY.todasLasMarcas} ({base.total})
        </button>
        {marcas.map((m) => {
          const activo = marca === m.marca;
          return (
            <button
              key={m.marca}
              type="button"
              role="tab"
              aria-selected={activo}
              onClick={() => alCambiarMarca(m.marca)}
              className={
                activo
                  ? 'shrink-0 bg-slate-900 text-white px-3.5 py-2 rounded-full font-bold text-xs border border-slate-900 min-h-[36px] shadow-xs'
                  : `shrink-0 bg-white border border-slate-200 hover:bg-slate-100 hover:border-slate-300 px-3.5 py-2 rounded-full font-bold text-[11px] min-h-[36px] ${colorMarca(m.marca)}`
              }
            >
              {m.marca}
              {` (${m.total})`}
            </button>
          );
        })}
      </div>

      {/* Grid agrupado por marca. Cada marca es una seccion con encabezado. */}
      <div>
        {gruposVisibles.map((g, gi) => (
          <section key={g.marca} aria-label={`Marca ${g.marca}`} className="mb-5 last:mb-0">
            {conEncabezados && (
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] sm:text-xs font-black uppercase tracking-[0.14em] ${colorMarca(g.marca)}`}
                >
                  {g.marca}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tabular-nums">
                  {g.total} {g.total === 1 ? 'referencia' : 'referencias'}
                </span>
                <span className="flex-1 h-px bg-slate-200" />
              </div>
            )}

            <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {g.productos.map((p, i) => (
                <ProductCard
                  key={p.id}
                  producto={p}
                  onSelect={onSelect}
                  priority={gi === 0 && i < 4}
                />
              ))}
            </ul>
          </section>
        ))}

        {gruposVisibles.length === 0 && <VacioCatalogo consulta={q} />}
      </div>

      {restantes > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setVisibles((v) => v + BLOQUE)}
            className="w-full py-3 bg-slate-200/80 hover:bg-slate-300 active:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition flex items-center justify-center min-h-[44px]"
          >
            <Icono nombre="refresh" className="w-[10px] h-[10px] mr-2" />
            {COPY.verMas} ({restantes} más)
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {filtrados.length} referencias encontradas
      </p>
    </section>
  );
}
