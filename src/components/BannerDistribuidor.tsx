import { BANNER_STAND } from '../config/catalog.config';

/** Banner del distribuidor autorizado: navy con filete lime a la izquierda. */
export function BannerDistribuidor() {
  return (
    <section className="px-4 mt-4">
      <div className="bg-gradient-to-r from-brand-navy to-brand-navy-dark p-2.5 rounded-xl border-l-4 border-brand-lime flex items-center justify-between gap-2 text-white shadow-xs">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="w-8 h-8 rounded bg-red-600 text-white font-black text-[10px] italic flex items-center justify-center tracking-tighter shrink-0">
            {BANNER_STAND.logo}
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold leading-tight truncate">{BANNER_STAND.titulo}</p>
            <p className="text-[9px] text-slate-300 truncate">{BANNER_STAND.sub}</p>
          </div>
        </div>
        <span className="text-[9px] bg-brand-lime/20 text-brand-lime border border-brand-lime/40 px-1.5 py-0.5 rounded font-bold shrink-0">
          {BANNER_STAND.badge}
        </span>
      </div>
    </section>
  );
}