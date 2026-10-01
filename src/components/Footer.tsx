import { FOOTER, MARCA_HEADER, SITE } from '../config/site.config';

/** Footer navy redondeado. Copy literal de code.html. */
export function Footer() {
  return (
    <footer className="mt-6 pt-5 pb-6 px-4 bg-brand-navy text-white text-center rounded-t-2xl">
      <div className="inline-flex items-center justify-center space-x-1.5 mb-1.5">
        <span className="text-brand-lime font-black text-xl italic tracking-tighter">
          {MARCA_HEADER.inicial}
        </span>
        <span className="font-rubik-extrabold-italic text-sm tracking-wider text-white">
          {SITE.empresa}
        </span>
      </div>

      <p className="text-[10px] text-slate-300 font-medium">{SITE.eslogan}</p>
      <p className="text-[9px] text-slate-400 mt-1">{SITE.ubicacion}</p>

      <div className="border-t border-white/10 mt-3 pt-2.5 text-[8.5px] text-slate-400">
        <p>
          © {SITE.copyrightAnio} {SITE.empresa}. Todos los derechos reservados.
        </p>
        <p className="text-brand-lime font-semibold mt-0.5">{FOOTER.lineaCatalogo}</p>
      </div>
    </footer>
  );
}