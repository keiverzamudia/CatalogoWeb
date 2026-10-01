import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { CotizacionForm } from './CotizacionForm';
import { Icono } from './ui/Icono';

/** Card de contacto: sede, email y formulario voluntario de cotizacion. */
export function ContactoSede({ productosSeleccionados = [] }: { productosSeleccionados?: string[] }) {
  return (
    <section className="px-4 mt-5" id="contacto">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-brand-navy flex items-center justify-center text-brand-lime text-xs">
            <Icono nombre="address-card" className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-black uppercase text-brand-navy tracking-wider">
            {COPY.contacto.titulo}
          </h3>
        </div>

        <div className="space-y-2 mb-3 text-xs">
          <div className="flex items-start space-x-2">
            <Icono nombre="map-pin" className="w-3.5 h-3.5 text-brand-lime mt-0.5 shrink-0" />
            <span className="text-slate-600 text-[11px]">
              <strong className="text-slate-800">Sede Principal:</strong> {SITE.direccion}
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <Icono nombre="paper-plane" className="w-3.5 h-3.5 text-brand-lime mt-0.5 shrink-0" />
            <span className="text-slate-600 text-[11px] break-all">
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