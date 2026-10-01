import { BANNER_STAND } from '../config/catalog.config';

/** Banner del distribuidor autorizado: navy con filete lime a la izquierda. */
export function BannerDistribuidor() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-5 sm:mt-7">
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy-dark p-3 sm:p-4 rounded-xl border-l-4 border-brand-lime flex items-center justify-between gap-3 text-white shadow-xs">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded bg-red-600 text-white font-black text-[11px] italic flex items-center justify-center tracking-tighter shrink-0">
            {BANNER_STAND.logo}
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold leading-tight truncate">
              {BANNER_STAND.titulo}
            </p>
            <p className="text-[10px] sm:text-[11px] text-slate-300 truncate">
              {BANNER_STAND.sub}
            </p>
          </div>
        </div>
        <span className="text-[9px] sm:text-[10px] bg-brand-lime/20 text-brand-lime border border-brand-lime/40 px-2 py-0.5 rounded font-bold shrink-0">
          {BANNER_STAND.badge}
        </span>
      </div>
    </section>
  );
}