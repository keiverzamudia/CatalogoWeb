import { useDeferredValue, useMemo, useState } from 'react';
import { COPY, type CategoriaId } from '../config/catalog.config';
import type { Producto } from '../data/tipos';
import type { ConteoCategoria } from '../lib/catalogo.repository';
import { filtrarCatalogo } from '../lib/busqueda';
import { Icono } from './ui/Icono';
import { ProductCard, VacioCatalogo } from './ProductCard';

interface Props {
  productos: Producto[];
  conteos: ConteoCategoria[];
  onSelect: (p: Producto) => void;
}

const PAGINA_MOBILE = 6;
const PAGINA_TABLING = 24;

/**
 * Seccion del catalogo. Conserva la composicion del Stitch:
 * header con contador -> buscador -> pills de categoria con scroll -> grid.
 * El contador y el "(N)" de las pills salen de los datos reales.
 */
export function CatalogSection({ productos, conteos, onSelect }: Props) {
  const [consulta, setConsulta] = useState('');
  const [categoria, setCategoria] = useState<CategoriaId>('TODOS');
  const [visibles, setVisibles] = useState(PAGINA_MOBILE);

  // Búsqueda diferida: mantiene el input fluido con 200+ productos.
  const q = useDeferredValue(consulta);

  const { productos: filtrados, total } = useMemo(
    () => filtrarCatalogo(productos, q, categoria),
    [productos, q, categoria],
  );

  // Al cambiar filtro vuelve al primer bloque.
  const lista = useMemo(
    () => filtrados.slice(0, Math.min(visibles, PAGINA_TABLING)),
    [filtrados, visibles],
  );

  const restantes = Math.max(0, filtrados.length - lista.length);

  function alCambiarCategoria(id: CategoriaId) {
    setCategoria(id);
    setVisibles(PAGINA_MOBILE);
  }

  function alBuscar(v: string) {
    setConsulta(v);
    setVisibles(PAGINA_MOBILE);
  }

  return (
    <section className="px-4 mt-4" id="catalogo-seccion">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-black uppercase text-brand-navy tracking-wider flex items-center">
          <span className="w-1.5 h-3.5 bg-brand-lime rounded-xs mr-1.5 inline-block" />
          {COPY.catalogo.titulo}
        </h2>
        <span className="text-[10px] text-slate-500 font-medium tabular-nums">
          {lista.length} de {total} ítems
        </span>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-2 mb-2.5">
        <div className="relative flex items-center">
          <Icono
            nombre="search"
            className="w-3 h-3 text-slate-400 absolute left-3"
          />
          <input
            type="search"
            value={consulta}
            onChange={(e) => alBuscar(e.target.value)}
            className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-navy focus:bg-white font-medium min-h-[38px]"
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
              className="absolute right-2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-brand-navy"
            >
              <Icono nombre="close" className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Pills de categoría: horizontal scroller con snap, tal como el DESIGN */}
      <div
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pill-scroller pb-1 mb-3 text-xs"
        role="tablist"
        aria-label="Categorías del catálogo"
      >
        {conteos.map((c) => {
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
                  ? 'shrink-0 bg-brand-navy text-white px-3 py-1.5 rounded-full font-bold text-[11px] border border-brand-navy min-h-[32px]'
                  : c.total === 0
                    ? 'shrink-0 bg-white border border-slate-200 text-slate-400 px-3 py-1.5 rounded-full font-medium text-[11px] min-h-[32px] cursor-not-allowed'
                    : 'shrink-0 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 px-3 py-1.5 rounded-full font-medium text-[11px] min-h-[32px]'
              }
            >
              {c.label}
              {c.total > 0 && ` (${c.total})`}
            </button>
          );
        })}
      </div>

      {/* Grid: 2 columnas en mobile (como screen.png), mas columnas en tablet/desktop */}
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {lista.map((p, i) => (
          <ProductCard
            key={p.id}
            producto={p}
            onSelect={onSelect}
            priority={i < 4}
          />
        ))}
        {lista.length === 0 && <VacioCatalogo consulta={q} />}
      </ul>

      {restantes > 0 && (
        <div className="mt-3 text-center">
          <button
            type="button"
            onClick={() => setVisibles((v) => v + PAGINA_MOBILE)}
            className="w-full py-2.5 bg-slate-200/80 hover:bg-slate-300 active:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center min-h-[40px]"
          >
            <Icono nombre="refresh" className="w-[10px] h-[10px] mr-2" />
            {COPY.verTodas} ({restantes} más)
          </button>
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {total} referencias encontradas
      </p>
    </section>
  );
}