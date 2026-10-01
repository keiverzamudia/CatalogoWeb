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
    <section className="px-4 -mt-3 relative z-10">
      <div className="bg-white rounded-2xl p-3 shadow-lg border border-slate-200/90">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase text-brand-navy tracking-wider flex items-center">
            <span className="w-1.5 h-3 bg-brand-lime rounded-xs mr-1.5 inline-block" />
            {COPY.canales.titulo}
          </span>
          <span className="text-[9px] bg-brand-lime/15 text-brand-navy border border-brand-lime/30 px-1.5 py-0.2 rounded font-bold">
            {COPY.canales.badge}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {SITE.redes.map((c) => (
            <a
              key={c.id}
              className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 flex items-center space-x-2.5 transition group min-h-[44px]"
              href={c.id === 'whatsapp' ? urlStand() : c.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                className={`w-8 h-8 rounded-lg ${c.iconoClases} text-white flex items-center justify-center shrink-0 shadow-xs`}
              >
                <Icono nombre={c.icono as NombreIcono} className="w-4 h-4" />
              </div>
              <div className="overflow-hidden min-w-0">
                <span className="block text-xs font-bold text-slate-800 leading-none group-hover:text-brand-navy truncate">
                  {c.label}
                </span>
                <span className="text-[9px] text-slate-500 font-medium truncate block mt-0.5">
                  {c.sublabel}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}