import { useEffect, useMemo, useState } from 'react';
import { CATEGORIAS, DISPONIBILIDAD, type Disponibilidad } from '../../config/catalog.config';
import { SITE, DATOS_PROVISIONALES } from '../../config/site.config';
import type { Producto } from '../../data/tipos';
import { catalogoRepo, resumenCatalogo } from '../../lib/catalogo.repository';

/* ============================================================================
   PANEL /admin — HERRAMIENTA VISUAL DE CONSULTA (solo lectura)

   Alcance honesto, sin prometer de mas:
     - ES una herramienta interna del frontend para ver el estado del catalogo.
     - NO tiene backend, NO tiene base de datos, NO tiene login.
     - NO guarda ni modifica nada: todo sale del JSON versionado en Git.
     - NO debe presentarse como un sistema de seguridad ni como un CMS.

   Edicion de productos = editar src/data/productos.json y volver a desplegar.
   ========================================================================== */

function Tarjeta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-navy px-3 py-2 border-b border-slate-100">
        {titulo}
      </h2>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Metrica({ valor, label }: { valor: React.ReactNode; label: string }) {
  return (
    <div className="bg-brand-navy text-white rounded-lg p-3">
      <div className="font-black text-xl italic leading-none">{valor}</div>
      <div className="text-[9px] text-slate-300 mt-1 uppercase tracking-wide">{label}</div>
    </div>
  );
}

export function AdminApp() {
  const [productos, setProductos] = useState<Producto[]>([]);

  useEffect(() => {
    let vivo = true;
    catalogoRepo.listar().then((list) => {
      if (vivo) setProductos(list);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const resumen = useMemo(() => resumenCatalogo(productos), [productos]);

  const porEstado = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of productos) m.set(p.disponibilidad, (m.get(p.disponibilidad) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [productos]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Barra de herramientas: sin logo publico, solo contexto */}
      <header className="bg-brand-navy text-white px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-navy-dark shadow-inner flex items-center justify-center -skew-x-6">
          <span className="text-brand-lime font-black text-lg italic">G</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight leading-none">
            Consulta de catálogo
          </p>
          <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-0.5">
            {SITE.empresa} · herramienta interna
          </p>
        </div>
        <a
          className="ml-auto text-[11px] font-bold bg-brand-lime text-brand-navy px-3 py-1.5 rounded-full hover:bg-brand-lime-dark transition min-h-[32px] inline-flex items-center"
          href="/"
        >
          Ver catálogo
        </a>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <p className="text-[11px] text-slate-500 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong className="text-amber-800">Solo consulta.</strong> Este panel es una
          herramienta visual del propio frontend: no tiene servidor, base de datos ni
          autenticación. Muestra el estado del archivo{' '}
          <code className="font-mono text-amber-900">src/data/productos.json</code>, que es
          la única fuente de datos. Para editar productos se modifica ese archivo y se
          vuelve a desplegar.
        </p>

        {/* Estado general */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Metrica valor={resumen.total} label="Productos" />
          <Metrica valor={CATEGORIAS.length - 1} label="Categorías" />
          <Metrica valor={resumen.porMarca.length} label="Marcas" />
          <Metrica valor={resumen.imagenes} label="Con imagen" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Tarjeta titulo="Por categoría">
            <ul className="text-xs space-y-1.5">
              {resumen.porCategoria
                .filter((c) => c.id !== 'TODOS')
                .map((c) => (
                  <li key={c.id} className="flex items-center gap-2">
                    <span className="font-semibold">{c.label}</span>
                    <span className="flex-1 border-b border-dotted border-slate-200" />
                    <span className="font-mono font-bold text-brand-navy">{c.total}</span>
                  </li>
                ))}
            </ul>
          </Tarjeta>

          <Tarjeta titulo="Por marca">
            <ul className="text-xs space-y-1.5">
              {resumen.porMarca.map((m) => (
                <li key={m.marca} className="flex items-center gap-2">
                  <span className="font-semibold">{m.marca}</span>
                  <span className="flex-1 border-b border-dotted border-slate-200" />
                  <span className="font-mono font-bold text-brand-navy">{m.total}</span>
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta titulo="Disponibilidad">
            <ul className="text-xs space-y-1.5">
              {porEstado.map(([d, total]) => {
                const info = DISPONIBILIDAD[d as Disponibilidad];
                return (
                  <li key={d} className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border ${info.clases}`}
                    >
                      {info.label}
                    </span>
                    <span className="flex-1 border-b border-dotted border-slate-200" />
                    <span className="font-mono font-bold text-brand-navy">{total}</span>
                  </li>
                );
              })}
              {porEstado.length === 0 && (
                <li className="text-slate-400 text-[11px]">Sin datos todavía.</li>
              )}
            </ul>
          </Tarjeta>

          <Tarjeta titulo="Cobertura de fichas">
            <ul className="text-xs space-y-2">
              <li className="flex items-center gap-2">
                <span>Sin imagen</span>
                <span className="flex-1 border-b border-dotted border-slate-200" />
                <span
                  className={`font-mono font-bold ${resumen.sinImagen.length ? 'text-red-600' : 'text-lime-700'}`}
                >
                  {resumen.sinImagen.length}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span>Sin descripción</span>
                <span className="flex-1 border-b border-dotted border-slate-200" />
                <span
                  className={`font-mono font-bold ${resumen.sinDescripcion.length ? 'text-amber-600' : 'text-lime-700'}`}
                >
                  {resumen.sinDescripcion.length}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span>Códigos repetidos</span>
                <span className="flex-1 border-b border-dotted border-slate-200" />
                <span
                  className={`font-mono font-bold ${resumen.codigosRepetidos.length ? 'text-amber-600' : 'text-lime-700'}`}
                >
                  {resumen.codigosRepetidos.length}
                </span>
              </li>
            </ul>

            {resumen.sinImagen.length > 0 && (
              <ul className="mt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
                {resumen.sinImagen.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    {p.marca} · {p.nombre}
                  </li>
                ))}
              </ul>
            )}
            {resumen.sinDescripcion.length > 0 && (
              <ul className="mt-2 text-[10px] text-slate-500 space-y-0.5 border-t border-slate-100 pt-2">
                {resumen.sinDescripcion.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    {p.marca} · {p.nombre}
                  </li>
                ))}
              </ul>
            )}
          </Tarjeta>

          <Tarjeta titulo="Configuración comercial">
            <dl className="text-xs space-y-2">
              <div>
                <dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Empresa
                </dt>
                <dd className="font-semibold">
                  {SITE.empresa} · {SITE.unidadNegocio}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Evento
                </dt>
                <dd className="font-semibold">
                  {SITE.evento} {SITE.eventoAnio}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  WhatsApp
                </dt>
                <dd className="font-semibold font-mono break-all">
                  {SITE.telefono}
                  <br />
                  wa.me/{SITE.whatsappE164}
                </dd>
              </div>
              <div>
                <dt className="text-[9px] font-black uppercase tracking-wider text-slate-500">
                  Email
                </dt>
                <dd className="font-semibold break-all">{SITE.email}</dd>
              </div>
            </dl>
          </Tarjeta>

          <Tarjeta titulo="Redes sociales">
            <ul className="text-xs space-y-2">
              {SITE.redes.map((r) => (
                <li key={r.id} className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold w-24 shrink-0">{r.label}</span>
                  <a
                    href={r.id === 'whatsapp' ? `https://wa.me/${SITE.whatsappE164}` : r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand-navy underline decoration-slate-300 truncate"
                  >
                    {r.id === 'whatsapp' ? `wa.me/${SITE.whatsappE164}` : r.href}
                  </a>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
              Héroes: {SITE.hero.map((h) => `${h.valor} ${h.label}`).join(' · ')}
            </p>
          </Tarjeta>

          <Tarjeta titulo="Valores provisionales">
            <p className="text-[11px] text-slate-600 mb-2">
              Confirmar antes de publicar el QR definitivo. Todos están en{' '}
              <code className="font-mono text-[10px]">src/config/site.config.ts</code>:
            </p>
            <ul className="text-[11px] font-mono text-amber-700 space-y-0.5">
              {DATOS_PROVISIONALES.map((d) => (
                <li key={d}>· {d}</li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta titulo="Categorías definidas">
            <ul className="text-xs space-y-1.5">
              {CATEGORIAS.map((c) => (
                <li key={c.id} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{c.id}</span>
                  <span className="flex-1 border-b border-dotted border-slate-200" />
                  <span className="font-semibold">{c.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-[10px] text-slate-500 mt-3 border-t border-slate-100 pt-2">
              Se definen en{' '}
              <code className="font-mono text-[10px]">src/config/catalog.config.ts</code>.
            </p>
          </Tarjeta>
        </div>

        <p className="text-[10px] text-slate-400 text-center pb-6">
          {resumen.total} productos · {resumen.porMarca.length} marcas · fuente{' '}
          <code className="font-mono">src/data/productos.json</code> ·{' '}
          <a href="/" className="underline">
            catálogo público
          </a>
        </p>
      </div>
    </div>
  );
}