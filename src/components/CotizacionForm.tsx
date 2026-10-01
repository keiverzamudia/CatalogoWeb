import { useState } from 'react';
import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { urlCotizacion } from '../lib/whatsapp';
import { Icono } from './ui/Icono';

/**
 * Formulario de cotizacion. Copia y estilos de code.html / screen.png.
 *
 * REGLA DEL BRIEF: el contacto es VOLUNTARIO. Ningun campo es obligatorio para
 * consultar el catalogo, y el CTA principal es WhatsApp (que no pide datos).
 * Solo el mensaje es obligatorio dentro del formulario, y aun asi el visitante
 * puede simplemente ignorar el bloque entero.
 */
export function CotizacionForm({ productosSeleccionados = [] }: { productosSeleccionados?: string[] }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState(
    productosSeleccionados.length ? `Productos de interés: ${productosSeleccionados.join(', ')}` : '',
  );

  const puedeEnviar = mensaje.trim().length > 0;

  // Los datos opcionales se anexan al mensaje; no se pierden por no ser obligatorios.
  const cuerpo = [
    productosSeleccionados.length
      ? `Productos: ${productosSeleccionados.join(', ')}`
      : `Productos de interés: ${mensaje.trim()}`,
    nombre.trim() ? `Nombre: ${nombre.trim()}` : '',
    telefono.trim() ? `Teléfono: ${telefono.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const href = urlCotizacion(cuerpo.split('\n'));

  return (
    <div className="border-t border-slate-100 pt-3">
      <h4 className="text-xs font-bold text-brand-navy mb-1">{COPY.contacto.formTitulo}</h4>
      <p className="text-[11px] text-slate-500 mb-2.5">{COPY.contacto.formParrafo}</p>

      <form
        className="space-y-2"
        onSubmit={(e) => {
          // Sin backend en esta fase: el CTA del form reenvia a WhatsApp con
          // los datos ya escritos. El envio real llega en la fase de contactos.
          e.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }}
      >
        <input
          className="w-full text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-1 focus:ring-brand-navy focus:border-brand-navy min-h-[40px]"
          placeholder="Nombre completo o empresa (opcional)"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
          enterKeyHint="next"
        />
        <input
          className="w-full text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-1 focus:ring-brand-navy focus:border-brand-navy min-h-[40px]"
          placeholder="Teléfono o WhatsApp (opcional)"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          type="tel"
          autoComplete="tel"
          enterKeyHint="next"
        />
        <textarea
          className="w-full text-xs px-3 py-2 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-1 focus:ring-brand-navy focus:border-brand-navy resize-none"
          placeholder="Productos de interés (ej: Aceite 15W40, filtros...)"
          rows={2}
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />

        {/* Honeypot: invisible para humanos, tentador para bots. Sin efecto visual. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor="empresa-trampa">Empresa</label>
          <input id="empresa-trampa" name="empresa" tabIndex={-1} autoComplete="off" />
        </div>

        <button
          type="submit"
          disabled={!puedeEnviar}
          className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs py-2.5 rounded-lg shadow-xs transition active:scale-[.98] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed min-h-[42px]"
        >
          <Icono nombre="paper-plane" className="w-3 h-3 mr-1.5 text-brand-lime" />
          Enviar Solicitud
        </button>

        <p className="text-[9px] text-slate-400 leading-relaxed text-center">
          Los campos son opcionales. Respondemos por WhatsApp al{' '}
          <span className="font-semibold text-slate-600">{SITE.telefono}</span> en {SITE.horario}.
        </p>
      </form>
    </div>
  );
}