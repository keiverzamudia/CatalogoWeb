import { useEffect, useState } from 'react';
import { Icono } from './ui/Icono';

/**
 * Boton flotante para volver al inicio.
 *
 * Reglas del Stitch que se respetan: aparece solo cuando el visitante ya bajo
 * (a partir de 500 px), nunca tapa nada importante y usa la pareja de marca
 * (navy + lime).
 *
 * Posicion: va ENCIMA del boton de WhatsApp (que vive en bottom-4 right-4),
 * por eso su bottom es mayor. Los dos comparten z-40, y quedan por debajo del
 * bottom sheet del producto (z-50), que es lo correcto: el detalle manda.
 */
const APARECE_A_PX = 500;

export function BotonSubir() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const alScrollar = () => setVisible(window.scrollY > APARECE_A_PX);
    alScrollar(); // por si el navegador restaura la posicion al recargar
    window.addEventListener('scroll', alScrollar, { passive: true });
    return () => window.removeEventListener('scroll', alScrollar);
  }, []);

  const subir = () => {
    // Respeta a quien pidio menos movimiento en su sistema.
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={subir}
      aria-label="Subir al inicio de la pagina"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      className={`fixed z-40 right-4 sm:right-6 bottom-20 sm:bottom-[4.5rem] w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-brand-navy hover:bg-brand-navy-light text-brand-lime flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(0,51,102,0.35)] transition-all duration-200 active:scale-95 ${
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-2'
      }`}
    >
      <Icono nombre="flecha-arriba" className="w-5 h-5" />
    </button>
  );
}
