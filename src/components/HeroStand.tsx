import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { Icono } from './ui/Icono';

/**
 * Hero navy con borde inferior redondeado y stats.
 * Copia y clases tomadas literalmente de code.html / screen.png.
 */
export function HeroStand() {
  return (
    <section className="bg-brand-navy text-white px-4 pt-5 pb-6 rounded-b-[24px] shadow-md relative overflow-hidden">
      {/* Blobs decorativos: aria-hidden, no aportan informacion */}
      <div
        aria-hidden="true"
        className="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-brand-lime/10 blur-2xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -left-10 bottom-0 w-36 h-36 rounded-full bg-blue-500/10 blur-xl pointer-events-none"
      />

      <div className="relative">
        <div className="flex items-center justify-between text-[10px] mb-2 text-slate-300 border-b border-white/10 pb-1.5">
          <span className="flex items-center font-semibold text-brand-lime uppercase">
            <Icono nombre="qrcode" className="w-3 h-3 mr-1.5" />
            {COPY.hero.eyebrow}
          </span>
          <span className="text-[9px] font-mono tracking-tight text-slate-400">
            {SITE.evento} {SITE.eventoAnio}
          </span>
        </div>

        <h1 className="text-xl leading-tight text-white mb-2 font-rubik-extrabold-italic uppercase tracking-tight">
          {COPY.hero.titulo}{' '}
          <span className="text-brand-lime inline-block bg-brand-lime/10 px-1.5 py-0.5 rounded border border-brand-lime/30 text-shadow-sm">
            {COPY.hero.tituloEnStock}
          </span>
        </h1>

        <p className="text-xs text-slate-300 leading-relaxed mb-3.5">{COPY.hero.parrafo}</p>

        <div className="grid grid-cols-3 gap-2 bg-brand-navy-dark/80 p-2.5 rounded-xl border border-white/10 backdrop-blur-sm">
          {SITE.hero.map((s, i) => (
            <div
              key={s.label}
              className={
                i < 2
                  ? 'text-center border-r border-white/10 ' + (i === 0 ? 'pr-1' : 'px-1')
                  : 'text-center pl-1'
              }
            >
              <div className="text-brand-lime font-black text-sm italic">{s.valor}</div>
              <div className="text-[9px] text-slate-300 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}