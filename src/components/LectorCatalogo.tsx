import { useEffect, useState } from 'react';
import type { CatalogoOficial } from '../config/catalog.config';
import { Icono } from './ui/Icono';

/**
 * Visor de un catalogo en PDF.
 *
 * Estrategia por dispositivo, porque el soporte de PDF embebido es muy
 * desigual:
 *
 *   - ESCRITORIO: se muestra dentro de un <iframe>. Chrome, Edge y Firefox
 *     traen visor nativo, asi que se lee sin salir de la web.
 *   - MOVIL: iOS y la mayoria de navegadores Android NO renderizan PDF en un
 *     iframe (muestran solo la primera pagina o nada). Ahi se da un boton
 *     grande para abrirlo en el visor del sistema.
 *   - SIEMPRE: enlaces de "abrir en pestana nueva" y "descargar" como salida
 *     de emergencia.
 *
 * No se usa ninguna libreria de PDF: eso pesaria ~1 MB y no aporta nada
 * frente al visor que ya trae el navegador.
 */
export function LectorCatalogo({
  catalogo,
  onCerrar,
}: {
  catalogo: CatalogoOficial;
  onCerrar: () => void;
}) {
  // Se decide una sola vez, al abrir.
  const [esMovil] = useState(
    () =>
      typeof window !== 'undefined' &&
      (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768),
  );

  // Cerrar con Escape y bloquear el scroll del fondo mientras esta abierto.
  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alTeclear);
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = previo;
    };
  }, [onCerrar]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm">
      {/* Barra superior: titulo + acciones */}
      <div className="bg-brand-navy text-white px-3 sm:px-4 py-2.5 flex items-center gap-2 shrink-0">
        <Icono nombre="address-card" className="w-4 h-4 text-brand-lime shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-bold leading-tight truncate">{catalogo.titulo}</p>
          <p className="text-[10px] text-slate-300 truncate hidden sm:block">{catalogo.sub}</p>
        </div>

        <a
          href={catalogo.archivo}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] sm:text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition shrink-0"
        >
          Abrir en pestaña
        </a>
        <a
          href={catalogo.archivo}
          download
          className="text-[10px] sm:text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-2.5 py-1.5 rounded-full transition shrink-0 hidden sm:inline-block"
        >
          Descargar
        </a>
        <button
          type="button"
          onClick={onCerrar}
          aria-label="Cerrar catálogo"
          className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition shrink-0"
        >
          <Icono nombre="close" className="w-4 h-4" />
        </button>
      </div>

      {/* Contenido */}
      {esMovil ? (
        <div className="flex-1 flex items-center justify-center p-6 bg-slate-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 max-w-sm w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-brand-navy flex items-center justify-center mx-auto">
              <Icono nombre="address-card" className="w-7 h-7 text-brand-lime" />
            </div>
            <div>
              <p className="text-sm font-black text-brand-navy">{catalogo.titulo}</p>
              <p className="text-[11px] text-slate-500 mt-1">
                En el teléfono el PDF se abre en el visor del sistema, que se ve mejor y
                permite hacer zoom.
              </p>
            </div>
            <a
              href={catalogo.archivo}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-sm py-3 rounded-xl transition min-h-[48px] flex items-center justify-center"
            >
              Abrir catálogo
            </a>
            <a
              href={catalogo.archivo}
              download
              className="block w-full bg-white border border-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl hover:border-brand-navy hover:text-brand-navy transition min-h-[44px] flex items-center justify-center"
            >
              Descargar PDF
            </a>
          </div>
        </div>
      ) : (
        <div className="flex-1 p-3 sm:p-4 min-h-0">
          <iframe
            src={catalogo.archivo}
            title={catalogo.titulo}
            className="w-full h-full rounded-xl bg-white border border-slate-300 shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
