import { useEffect, useState } from 'react';
import { catalogoRepo } from '../lib/catalogo.repository';
import { registrarVisita } from '../lib/panel.api';
import { urlContacto } from '../lib/whatsapp';
import type { Producto } from '../data/tipos';
import { BannerDistribuidor } from '../components/BannerDistribuidor';
import { CanalesOficiales } from '../components/CanalesOficiales';
import { CatalogSection } from '../components/CatalogSection';
import { ContactoSede } from '../components/ContactoSede';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { HeroStand } from '../components/HeroStand';
import { ProductSheet } from '../components/ProductSheet';

export function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null);

  useEffect(() => {
    let vivo = true;
    catalogoRepo.listar().then((list) => {
      if (vivo) setProductos(list);
    });
    return () => {
      vivo = false;
    };
  }, []);

  // Contador del panel: una sola llamada por navegador al dia, sin bloquear
  // el render. Si /api no existe la promesa se traga sola.
  useEffect(() => {
    registrarVisita();
  }, []);

  // El detalle abre como sheet; el deep link /p/:id lo resuelve el router.
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#p/')) return;
    const id = decodeURIComponent(hash.slice(3));
    void catalogoRepo.buscarPorId(id).then((p) => {
      if (p) setSeleccionado(p);
    });
  }, []);

  return (
    <>
      {/* Contenedor: la maqueta de Stitch es de 390px centrados con marco.
          En tablet/desktop el mismo contenido se ensancha (DISPLAY.md:
          12 columnas, max 1280px, rail de filtros en >=1024px). */}
      <div className="w-full sm:max-w-[680px] lg:max-w-[1100px] xl:max-w-[1280px] mx-auto bg-slate-50 min-h-screen shadow-2xl relative flex flex-col border-x border-slate-200">
        <Header />

        <main className="flex-1">
          <HeroStand />
          <CanalesOficiales />
          <BannerDistribuidor />

          <CatalogSection
            productos={productos}
            onSelect={setSeleccionado}
          />

          <ContactoSede productosSeleccionados={seleccionado ? [seleccionado.nombre] : []} />
        </main>

        <Footer />
      </div>

      <ProductSheet producto={seleccionado} onCerrar={() => setSeleccionado(null)} />

      {/* Boton flotante de WhatsApp: el Stitch dejo el hueco marcado
          "Floating WhatsApp Widget". Se implementa como pastilla fija abajo
          a la derecha, verde de marca, con elevacion Level 2. */}
      <a
        href={urlContacto()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed z-40 bottom-4 right-4 sm:right-6 w-12 h-12 rounded-full bg-brand-whatsapp hover:bg-brand-whatsapp-dark text-white flex items-center justify-center shadow-[0_8px_20px_-4px_rgba(0,51,102,0.08),0_2px_8px_rgba(37,211,102,0.4)] transition active:scale-95"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="w-6 h-6" fill="currentColor">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m0 1.67c2.2 0 4.27.86 5.83 2.42a8.2 8.2 0 0 1 2.41 5.82c0 4.54-3.7 8.24-8.25 8.24a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24M9.1 7.6c-.15 0-.4.06-.6.29-.21.22-.8.78-.8 1.9s.82 2.2.93 2.36c.11.15 1.6 2.44 3.88 3.42.54.24.97.38 1.29.48.55.17 1.04.15 1.43.09.44-.06 1.35-.55 1.54-1.09.19-.53.19-.99.13-1.08-.06-.09-.2-.15-.44-.26-.22-.11-1.34-.66-1.55-.74-.2-.07-.36-.11-.51.12-.15.22-.58.73-.71.88-.13.15-.26.17-.48.06-.22-.11-.94-.35-1.79-1.11-.66-.59-1.11-1.31-1.24-1.53-.13-.22-.01-.34.1-.45.1-.1.22-.26.33-.39.11-.13.15-.22.22-.37.07-.15.04-.28-.02-.39-.06-.11-.5-1.24-.7-1.7-.18-.44-.37-.38-.51-.39h-.43" />
        </svg>
      </a>
    </>
  );
}