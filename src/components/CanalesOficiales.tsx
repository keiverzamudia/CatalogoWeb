import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { urlStand } from '../lib/whatsapp';
import { Icono, type NombreIcono } from './ui/Icono';

/**
 * Card "Canales Oficiales": 2x2 de tiles de contacto.
 * El href de WhatsApp se construye desde config (no literal).
 */
export function CanalesOficiales() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 -mt-3 sm:-mt-4 relative z-10">
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-slate-200/90">
        <div className="flex items-center justify-between mb-3 gap-3">
          <span className="text-[11px] sm:text-xs lg:text-sm font-black uppercase text-brand-navy tracking-[0.14em] flex items-center">
            <span className="w-1.5 h-3.5 bg-brand-lime rounded-xs mr-2 inline-block" />
            {COPY.canales.titulo}
          </span>
          <span className="text-[9px] sm:text-[10px] bg-brand-lime/15 text-brand-navy border border-brand-lime/30 px-2 py-0.5 rounded font-bold shrink-0">
            {COPY.canales.badge}
          </span>
        </div>

        {/* 3 tiles: 1 columna en mobile (targets grandes), 3 en tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          {SITE.redes.map((c) => (
            <a
              key={c.id}
              className="bg-slate-50 hover:bg-slate-100 hover:border-brand-navy/30 border border-slate-200 rounded-xl p-3 flex items-center space-x-3 transition group min-h-[56px]"
              href={c.id === 'whatsapp' ? urlStand() : c.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg ${c.iconoClases} text-white flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icono nombre={c.icono as NombreIcono} className="w-5 h-5" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="block text-[13px] sm:text-sm font-bold text-slate-800 leading-none group-hover:text-brand-navy truncate">
                  {c.label}
                </span>
                <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate block mt-1">
                  {c.sublabel}
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Acceso directo al formulario. Estaba enterrado al final, despues de
            los 200+ productos, y por eso nadie dejaba sus datos. */}
        <a
          href="#contacto"
          className="mt-3 w-full bg-brand-navy hover:bg-brand-navy-light text-white rounded-xl px-3 py-3 flex items-center justify-center gap-2 transition active:scale-[.99] min-h-[48px]"
        >
          <Icono nombre="address-card" className="w-4 h-4 text-brand-lime shrink-0" />
          <span className="text-xs sm:text-sm font-bold">Dejanos tu contacto</span>
          <span className="text-[10px] text-brand-lime/90 font-medium hidden sm:inline">
            · te escribimos nosotros
          </span>
        </a>
      </div>
    </section>
  );
}