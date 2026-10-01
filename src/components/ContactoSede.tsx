import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { CotizacionForm } from './CotizacionForm';
import { Icono } from './ui/Icono';

/** Card de contacto: sede, email y formulario voluntario de cotizacion. */
export function ContactoSede({ productosSeleccionados = [] }: { productosSeleccionados?: string[] }) {
  return (
    <section className="px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 scroll-mt-4" id="contacto">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-sm max-w-3xl">
        <div className="flex items-center space-x-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg bg-brand-navy flex items-center justify-center text-brand-lime text-xs">
            <Icono nombre="address-card" className="w-4 h-4" />
          </div>
          <h3 className="text-xs sm:text-sm lg:text-base font-black uppercase text-brand-navy tracking-[0.14em]">
            {COPY.contacto.titulo}
          </h3>
        </div>

        <div className="space-y-2.5 mb-4 text-xs">
          <div className="flex items-start space-x-2.5">
            <Icono nombre="map-pin" className="w-4 h-4 text-brand-lime mt-0.5 shrink-0" />
            <span className="text-slate-600 text-xs sm:text-[13px]">
              <strong className="text-slate-800">Sede Principal:</strong> {SITE.direccion}
            </span>
          </div>
          <div className="flex items-start space-x-2.5">
            <Icono nombre="paper-plane" className="w-4 h-4 text-brand-lime mt-0.5 shrink-0" />
            <span className="text-slate-600 text-xs sm:text-[13px] break-all">
              <strong className="text-slate-800">Email:</strong>{' '}
              <a href={`mailto:${SITE.email}`} className="underline decoration-slate-300">
                {SITE.email}
              </a>
            </span>
          </div>
        </div>

        <CotizacionForm productosSeleccionados={productosSeleccionados} />
      </div>
    </section>
  );
}