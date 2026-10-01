import { useState } from 'react';
import { COPY } from '../config/catalog.config';
import { SITE } from '../config/site.config';
import { guardarContacto } from '../lib/panel.api';
import { urlContactoConDatos } from '../lib/whatsapp';
import { Icono } from './ui/Icono';

/**
 * Formulario de contacto. UN solo formulario, DOS destinos:
 *
 *   1. guarda el contacto en el panel /admin
 *   2. abre WhatsApp con los mismos datos ya escritos
 *
 * REGLA DEL BRIEF: el contacto es VOLUNTARIO y el CTA principal sigue siendo
 * WhatsApp. Para no obligar a escribir, basta con UN dato: nombre, telefono o
 * interes. Antes exigia el mensaje y dejaba el boton gris a quien solo queria
 * dejar su telefono, asi que el contacto se perdia.
 */
export function CotizacionForm({ productosSeleccionados = [] }: { productosSeleccionados?: string[] }) {
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [mensaje, setMensaje] = useState(
    productosSeleccionados.length ? `Productos de interés: ${productosSeleccionados.join(', ')}` : '',
  );
  const [enviado, setEnviado] = useState(false);

  const puedeEnviar =
    nombre.trim().length > 0 || telefono.trim().length > 0 || mensaje.trim().length > 0;

  // Solo se incluyen las lineas con contenido: nada de "Nombre: " vacio.
  const cuerpo = [
    productosSeleccionados.length
      ? `Productos: ${productosSeleccionados.join(', ')}`
      : mensaje.trim()
        ? `Productos de interés: ${mensaje.trim()}`
        : '',
    nombre.trim() ? `Nombre: ${nombre.trim()}` : '',
    telefono.trim() ? `Teléfono: ${telefono.trim()}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const href = urlContactoConDatos(cuerpo.split('\n').filter(Boolean));

  return (
    <div className="border-t border-slate-100 pt-3">
      <h4 className="text-xs font-bold text-brand-navy mb-1">{COPY.contacto.formTitulo}</h4>
      <p className="text-[11px] text-slate-500 mb-2.5">{COPY.contacto.formParrafo}</p>

      {enviado ? (
        <div className="bg-brand-lime/10 border border-brand-lime/40 rounded-lg p-3 text-center">
          <p className="text-xs font-bold text-brand-navy flex items-center justify-center gap-1.5">
            <Icono nombre="check" className="w-3.5 h-3.5" />
            Datos recibidos
          </p>
          <p className="text-[11px] text-slate-600 mt-1">
            Si WhatsApp no se abrió solo,{' '}
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-brand-navy"
            >
              pulsa aquí para escribirnos
            </a>
            .
          </p>
          <button
            type="button"
            onClick={() => setEnviado(false)}
            className="text-[10px] text-slate-500 underline mt-2"
          >
            Dejar otro contacto
          </button>
        </div>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (!puedeEnviar) return;
            // DOS destinos en la misma accion:
            //  1) el panel /admin, para que quede en la lista de contactos
            //  2) WhatsApp, el canal inmediato de siempre
            // El guardado es fire-and-forget: si /api falla, WhatsApp se abre igual.
            void guardarContacto({
              nombre: nombre.trim(),
              telefono: telefono.trim(),
              interes: mensaje.trim(),
              productos: productosSeleccionados.join(', '),
            });
            setEnviado(true);
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
            <input
              id="empresa-trampa"
              name="empresa"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <button
            type="submit"
            disabled={!puedeEnviar}
            className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold text-xs py-2.5 rounded-lg shadow-xs transition active:scale-[.98] flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed min-h-[42px]"
          >
            <Icono nombre="paper-plane" className="w-3 h-3 mr-1.5 text-brand-lime" />
            Enviar y escribir por WhatsApp
          </button>

          <p className="text-[9px] text-slate-400 leading-relaxed text-center">
            Solo necesitas dejar un dato. Guardamos tu contacto y te respondemos por WhatsApp
            al <span className="font-semibold text-slate-600">{SITE.telefono}</span> en{' '}
            {SITE.horario}.
          </p>
        </form>
      )}
    </div>
  );
}
