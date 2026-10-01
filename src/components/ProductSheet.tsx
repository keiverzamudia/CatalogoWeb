import { useEffect } from 'react';
import { DISPONIBILIDAD, colorMarca, estiloEtiqueta } from '../config/catalog.config';
import type { Producto } from '../data/tipos';
import { urlProducto } from '../lib/whatsapp';
import { Icono } from './ui/Icono';

interface Props {
  producto: Producto | null;
  onCerrar: () => void;
}

/**
 * Detalle de producto como bottom sheet (Elevation Level 3 del DESIGN:
 * `0 -4px 24px rgba(0,0,0,.10)` sobre blanco puro).
 * Se elige sheet y no pagina nueva porque el Stitch solo definia el catalogo
 * en una sola columna movil: un sheet conserva la composicion.
 */
export function ProductSheet({ producto: p, onCerrar }: Props) {
  // Bloquea el scroll del fondo mientras el sheet esta abierto.
  useEffect(() => {
    if (!p) return;
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', onKey);
    };
  }, [p, onCerrar]);

  if (!p) return null;

  const eti = estiloEtiqueta(p.etiqueta);
  const disp = DISPONIBILIDAD[p.disponibilidad] ?? DISPONIBILIDAD.EN_STOCK;

  const ficha: [string, string][] = (
    [
      ['Código', p.codigo],
      ['SKU', p.sku !== p.codigo ? p.sku : ''],
      ['Presentación', p.presentacion],
      ['Aplicación', p.aplicacion],
      ['Línea', p.linea],
      ['Categoría', p.subcategoria],
    ] as [string, string][]
  ).filter(([, v]) => Boolean(v));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={onCerrar}
        className="absolute inset-0 bg-slate-900/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Detalle de ${p.nombre}`}
        className="relative w-full max-w-[480px] bg-white rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.10)] max-h-[88vh] overflow-y-auto"
      >
        {/* asa */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100 pt-2 pb-1.5 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {p.imagen && (
          <div className="bg-slate-100 px-4 pt-3 pb-4">
            <img
              src={p.imagen}
              alt={p.nombre}
              width={p.ancho ?? undefined}
              height={p.alto ?? undefined}
              loading="eager"
              decoding="sync"
              className="w-full max-h-[38vh] object-contain mx-auto"
            />
          </div>
        )}

        <div className="px-4 pb-5">
          <div className="flex items-start gap-2">
            {p.etiqueta && (
              <span
                className={`mt-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide shrink-0 ${eti.clases}`}
              >
                {p.etiqueta}
              </span>
            )}
            <div className="min-w-0">
              <span className={`block text-[9px] uppercase font-bold tracking-wider ${colorMarca(p.marca)}`}>
                {p.marca}
              </span>
              <h3 className="text-base font-black text-slate-900 leading-tight">{p.nombre}</h3>
            </div>
            <button
              type="button"
              onClick={onCerrar}
              aria-label="Cerrar"
              className="ml-auto w-8 h-8 -mt-1 -mr-1 flex items-center justify-center rounded-lg text-slate-400 hover:text-brand-navy hover:bg-slate-100 shrink-0"
            >
              <Icono nombre="close" className="w-4 h-4" />
            </button>
          </div>

          {p.descripcion && (
            <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{p.descripcion}</p>
          )}

          {/* Disponibilidad: badge semantico del design system */}
          <div className="mt-3">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${disp.clases}`}>
              {disp.label}
            </span>
          </div>

          {/* Ficha tecnica */}
          <dl className="mt-3 border-t border-slate-100">
            {ficha.map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 py-1.5 border-b border-slate-100 last:border-0">
                <dt className="w-[92px] shrink-0 text-[9px] uppercase font-bold tracking-wider text-slate-500 pt-0.5">
                  {k}
                </dt>
                <dd className="text-[11px] font-semibold text-slate-800 break-words min-w-0">
                  {k === 'Código' || k === 'SKU' ? <span className="font-mono">{v}</span> : v}
                </dd>
              </div>
            ))}
          </dl>

          <a
            className="w-full mt-4 bg-brand-navy hover:bg-brand-navy-light active:bg-brand-navy text-white text-xs font-bold py-3 rounded-lg text-center flex items-center justify-center transition shadow-xs min-h-[46px]"
            href={urlProducto(p)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icono nombre="paper-plane" className="w-3 h-3 mr-1.5 text-brand-lime" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}