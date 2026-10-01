import { MARCA_HEADER } from '../config/site.config';

/**
 * Header sticky. Reproduce 1:1 el header de code.html:
 * monograma "G" navy con skew + punto lime, wordmark ExtraBold Italic,
 * y badge pulsante "STAND OFICIAL".
 */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-2.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center">
        <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-brand-navy shadow-inner transform -skew-x-6">
          <span className="text-brand-lime font-black text-xl italic tracking-tighter">
            {MARCA_HEADER.inicial}
          </span>
          <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-brand-lime rounded-full border border-white" />
        </div>
        <div className="ml-2 flex flex-col leading-none">
          <span className="text-brand-navy font-black text-base italic tracking-tight font-rubik-extrabold-italic">
            {MARCA_HEADER.wordmark}
          </span>
          <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase -mt-0.5">
            {MARCA_HEADER.subwordmark}
          </span>
        </div>
      </div>

      <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-lime/15 border border-brand-lime text-brand-navy text-[10px] font-bold tracking-wide">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-lime mr-1.5 animate-pulse-dot" />
        {MARCA_HEADER.badge}
      </div>
    </header>
  );
}