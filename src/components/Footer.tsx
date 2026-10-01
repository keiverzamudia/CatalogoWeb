import { FOOTER, MARCA_HEADER, SITE } from '../config/site.config';

/** Footer navy redondeado. Copy literal de code.html. */
export function Footer() {
  return (
    <footer className="mt-7 sm:mt-9 pt-6 sm:pt-8 pb-7 px-4 sm:px-6 lg:px-8 bg-brand-navy text-white text-center rounded-t-2xl sm:rounded-t-3xl">
      <div className="inline-flex items-center justify-center space-x-2 mb-2">
        <span className="text-brand-lime font-black text-2xl italic tracking-tighter">
          {MARCA_HEADER.inicial}
        </span>
        <span className="font-rubik-extrabold-italic text-base sm:text-lg tracking-wider text-white">
          {SITE.empresa}
        </span>
      </div>

      <p className="text-[11px] sm:text-xs text-slate-300 font-medium">{SITE.eslogan}</p>
      <p className="text-[10px] text-slate-400 mt-1.5">{SITE.ubicacion}</p>

      <div className="border-t border-white/10 mt-4 pt-3 text-[9.5px] text-slate-400">
        <p>
          © {SITE.copyrightAnio} {SITE.empresa}. Todos los derechos reservados.
        </p>
        <p className="text-brand-lime font-semibold mt-0.5">{FOOTER.lineaCatalogo}</p>
      </div>
    </footer>
  );
}