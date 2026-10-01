import { forwardRef } from 'react';
import { COPY } from '../config/catalog.config';
import { colorMarca, estiloEtiqueta } from '../config/catalog.config';
import type { Producto } from '../data/tipos';
import { urlProducto } from '../lib/whatsapp';
import { Icono } from './ui/Icono';

/**
 * Tarjeta de producto. Jerarquia EXACTAMENTE como en screen.png:
 *   badge de etiqueta -> image bed con chip de linea -> marca -> nombre
 *   -> chip de SKU -> presentacion/subcategoria -> CTA "Consultar"
 *
 * Nota de fidelidad: en el Stitch el image bed contenia un pictograma
 * FontAwesome porque no habia fotos. Ahora hay asset real, asi que el
 * frame, el chip y el overlay se conservan y cambia solo el contenido.
 */
interface Props {
  producto: Producto;
  /** Callback al tocar la tarjeta (abre el detalle). */
  onSelect?: (p: Producto) => void;
  /** Eager solo para las primeras tarjetas visibles. */
  priority?: boolean;
}

export const ProductCard = forwardRef<HTMLLIElement, Props>(function ProductCard(
  { producto: p, onSelect, priority = false },
  ref,
) {
  const eti = estiloEtiqueta(p.etiqueta);

  return (
    <li
      ref={ref}
      className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between overflow-hidden hover:border-brand-navy transition group"
    >
      <button
        type="button"
        onClick={() => onSelect?.(p)}
        className="p-2 relative text-left w-full block"
        aria-label={`Ver detalle de ${p.nombre}`}
      >
        {p.etiqueta && (
          <span
            className={`absolute top-2 left-2 z-10 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${eti.clases}`}
          >
            {p.etiqueta}
          </span>
        )}

        <div className="w-full h-28 bg-slate-100 rounded-lg flex items-center justify-center p-1.5 relative overflow-hidden">
          {p.imagen ? (
            <img
              src={p.imagen}
              alt={p.nombre}
              width={p.ancho ?? undefined}
              height={p.alto ?? undefined}
              loading={priority ? 'eager' : 'lazy'}
              decoding={priority ? 'sync' : 'async'}
              fetchPriority={priority ? 'high' : 'auto'}
              className="max-h-full max-w-full object-contain group-hover:scale-[1.06] transition-transform duration-300"
            />
          ) : (
            /* Placeholder coherente: el Stitch usaba un pictograma FA sobre la
               misma cama gris. Aqui se conserva la cama y se marca el faltante. */
            <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
              <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2M8.5 13.5l2.5 3.01L14.5 12l4.5 6H5z"
                />
              </svg>
              <span className="text-[8px] font-bold uppercase tracking-wide">Sin imagen</span>
            </div>
          )}

          {p.linea && (
            <div className="absolute bottom-1 right-1 bg-white/90 rounded px-1 text-[8px] font-mono text-slate-500 font-bold border border-slate-200 max-w-[70%] truncate">
              {p.linea.toUpperCase()}
            </div>
          )}
        </div>

        <div className="mt-2">
          {p.marca && (
            <span className={`text-[9px] uppercase font-bold tracking-wider ${colorMarca(p.marca)}`}>
              {p.marca}
            </span>
          )}
          <h3 className="text-xs font-bold text-slate-800 leading-tight line-clamp-1">{p.nombre}</h3>

          {p.codigo && (
            <div className="mt-1">
              <span className="text-[10px] font-mono font-bold text-brand-navy bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 inline-block">
                #{p.codigo}
              </span>
            </div>
          )}

          <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
            {[p.presentacion, p.subcategoria].filter(Boolean).join(' • ')}
          </p>
        </div>
      </button>

      <div className="p-2 pt-0">
        <a
          className="w-full bg-brand-navy hover:bg-brand-navy-light active:bg-brand-navy text-white text-[11px] font-bold py-1.5 rounded-lg text-center flex items-center justify-center transition shadow-xs min-h-[36px]"
          href={urlProducto(p)}
          target="_blank"
          rel="noopener noreferrer"
          data-producto={p.id}
          onClick={(e) => e.stopPropagation()}
        >
          <Icono nombre="paper-plane" className="w-[9px] h-[9px] mr-1 text-brand-lime" />
          Consultar
        </a>
      </div>
    </li>
  );
});

/** Estado vacio con el mismo lenguaje visual (navy + lime). */
export function VacioCatalogo({ consulta }: { consulta: string }) {
  return (
    <div className="col-span-full bg-white rounded-xl border border-slate-200 p-6 text-center">
      <div className="w-9 h-9 rounded-lg bg-brand-navy text-brand-lime flex items-center justify-center mx-auto mb-2">
        <Icono nombre="search" className="w-4 h-4" />
      </div>
      <p className="text-xs font-bold text-brand-navy uppercase tracking-wider">Sin resultados</p>
      <p className="text-[11px] text-slate-500 mt-1">
        {consulta ? (
          <>
            No encontramos referencias para <span className="font-bold">“{consulta}”</span>. Probá con
            el código, la marca o el nombre del producto.
          </>
        ) : (
          COPY.verTodas
        )}
      </p>
    </div>
  );
}