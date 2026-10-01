import { CATALOGOS_OFICIALES, type CatalogoOficial } from '../config/catalog.config';
import { Icono } from './ui/Icono';

/**
 * Botoneras de los catalogos oficiales en PDF.
 *
 * Los archivos viven en `public/catalogos/` y se sirven desde el propio sitio,
 * sin CDN ni servicios externos. Si un PDF todavia no esta subido, el boton
 * sigue apareciendo (para no romper la maqueta) pero el visor avisara.
 */
export function BotonesCatalogos({
  onAbrir,
}: {
  onAbrir: (c: CatalogoOficial) => void;
}) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5 sm:mt-7">
      <div className="flex items-center mb-3 gap-2">
        <span className="w-1.5 h-3.5 bg-brand-lime rounded-xs inline-block" />
        <h2 className="text-[11px] sm:text-xs lg:text-sm font-black uppercase text-brand-navy tracking-[0.14em]">
          Catálogos oficiales
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATALOGOS_OFICIALES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onAbrir(c)}
            className="group text-left bg-gradient-to-br from-brand-navy to-brand-navy-dark text-white rounded-2xl p-4 sm:p-5 border-l-4 border-brand-lime shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-4 min-h-[92px] active:scale-[.99]"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 group-hover:bg-brand-lime/20 transition">
              <Icono nombre="pdf" className="w-6 h-6 sm:w-7 sm:h-7 text-brand-lime" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm sm:text-base font-black leading-tight">{c.titulo}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-1 truncate">{c.sub}</p>
              <span className="inline-flex items-center gap-1 mt-2 text-[10px] sm:text-[11px] font-bold text-brand-lime">
                {c.cta}
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </span>
            </div>
          </button>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 mt-2 text-center">
        Se abren aquí mismo, sin salir del catálogo.
      </p>
    </section>
  );
}
