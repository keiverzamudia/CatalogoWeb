import { useEffect, useMemo, useState } from 'react';
import { SITE } from '../../config/site.config';
import type { Contacto, DatosPanel } from '../../../shared/panel';
import { cargarPanel, claveGuardada, guardarClave, olvidarClave } from '../../lib/panel.api';
import { exportarExcel, exportarPdf, type Columna } from './exportar';

/* ============================================================================
   PANEL /admin — CUADRO DE MANDO INTERNO

   Que SÍ hace:
     - cuenta los visitantes del catalogo (una vez por navegador al dia)
     - lista las personas que dejaron sus datos en el formulario
     - exporta ambos a PDF y a Excel

   Que NO hace, y hay que decirlo en pantalla:
     - NO es una base de datos oficial ni un CRM
     - la clave es cortesía: NO es autenticación real
     - los telefonos los dejan los propios visitantes en el formulario
   ========================================================================== */

function Tarjeta({
  titulo,
  extra,
  children,
}: {
  titulo: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100">
        <h2 className="text-[10px] font-black uppercase tracking-wider text-brand-navy">
          {titulo}
        </h2>
        {extra}
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function Metrica({ valor, label, nota }: { valor: string; label: string; nota?: string }) {
  return (
    <div className="bg-brand-navy text-white rounded-lg p-3 min-w-0">
      <div className="font-black text-2xl italic leading-none truncate">{valor}</div>
      <div className="text-[9px] text-slate-300 mt-1 uppercase tracking-wide">{label}</div>
      {nota && <div className="text-[9px] text-brand-lime mt-0.5">{nota}</div>}
    </div>
  );
}

function Boton({
  children,
  onClick,
  tono = 'claro',
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tono?: 'claro' | 'oscuro';
  disabled?: boolean;
}) {
  const base =
    'text-[11px] font-bold px-3 py-2 rounded-lg transition min-h-[36px] inline-flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed';
  const estilo =
    tono === 'oscuro'
      ? 'bg-brand-navy text-white hover:bg-brand-navy-light'
      : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-navy hover:text-brand-navy';
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`${base} ${estilo}`}>
      {children}
    </button>
  );
}

/* -- utilidades ----------------------------------------------------------- */

function numero(n: number): string {
  return n.toLocaleString('es-VE');
}

function fechaHora(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function diaCorto(fecha: string): string {
  return `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}`;
}

/** 0412... -> 58412... para poder responder por WhatsApp. */
function aE164(telefono: string): string {
  const n = telefono.replace(/\D/g, '');
  if (!n) return '';
  if (n.startsWith('58')) return n;
  if (n.startsWith('0')) return `58${n.slice(1)}`;
  return n;
}

/* -- exportaciones -------------------------------------------------------- */

const COL_VISITAS: Columna<{ fecha: string; total: number }>[] = [
  { titulo: 'Fecha', ancho: 14, valor: (f) => diaCorto(f.fecha) },
  { titulo: 'Registros', ancho: 12, valor: (f) => String(f.total) },
];

const COL_CONTACTOS: Columna<Contacto>[] = [
  { titulo: 'Fecha', ancho: 20, valor: (c) => fechaHora(c.ts) },
  { titulo: 'Nombre', ancho: 30, valor: (c) => c.nombre || '-' },
  { titulo: 'Telefono', ancho: 20, valor: (c) => c.telefono || '-' },
  { titulo: 'Interes', ancho: 45, valor: (c) => c.interes || '-' },
  { titulo: 'Productos', ancho: 45, valor: (c) => c.productos || '-' },
  { titulo: 'Origen', ancho: 24, valor: (c) => c.fuente || '-' },
];

function sello(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
}

/* -- pantalla ------------------------------------------------------------- */

export function AdminApp() {
  const [entrada, setEntrada] = useState('');
  const [clave, setClave] = useState('');
  const [recarga, setRecarga] = useState(0);
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [exportando, setExportando] = useState('');

  /* Clave guardada en este navegador: entra sin volver a escribirla. */
  useEffect(() => {
    const guardada = claveGuardada();
    if (guardada) {
      setEntrada(guardada);
      setClave(guardada);
    }
  }, []);

  /* Carga del panel cada vez que cambia la clave o se pulsa "Actualizar". */
  useEffect(() => {
    if (!clave) return;
    let vivo = true;
    setCargando(true);
    setError('');
    cargarPanel(clave).then((r) => {
      if (!vivo) return;
      if (r.ok) {
        setDatos(r.datos);
        guardarClave(clave);
      } else {
        setDatos(null);
        setError(r.error);
      }
      setCargando(false);
    });
    return () => {
      vivo = false;
    };
  }, [clave, recarga]);

  const contactos = useMemo(() => {
    const lista = datos?.contactos ?? [];
    const q = busqueda.trim().toLowerCase();
    if (!q) return lista;
    return lista.filter((c) =>
      `${c.nombre} ${c.telefono} ${c.interes} ${c.productos}`.toLowerCase().includes(q),
    );
  }, [datos, busqueda]);

  const maxDia = Math.max(1, ...(datos?.visitas.porDia.map((d) => d.total) ?? [1]));

  /* -- proteger: si no hay clave activa, solo se pide la clave ------------- */
  if (!clave) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (entrada.trim()) setClave(entrada.trim());
          }}
          className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-navy shadow-inner flex items-center justify-center -skew-x-6">
              <span className="text-brand-lime font-black text-xl italic">G</span>
            </div>
            <div className="leading-tight">
              <p className="text-sm font-black text-brand-navy">Panel interno</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                {SITE.empresa}
              </p>
            </div>
          </div>

          <label className="block">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Clave del panel
            </span>
            <input
              type="password"
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              autoFocus
              className="mt-1 w-full text-sm px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
              placeholder="••••••••"
            />
          </label>

          <button
            type="submit"
            className="w-full bg-brand-navy hover:bg-brand-navy-light text-white text-sm font-bold py-2.5 rounded-lg transition min-h-[42px]"
          >
            Entrar
          </button>

          {error && <p className="text-[11px] text-red-600">{error}</p>}

          <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
            <strong className="text-slate-700">No es un inicio de sesión seguro.</strong>{' '}
            La clave solo evita que alguien que adivine la URL lea los teléfonos por
            accidente. No hay usuarios, roles ni cifrado.
          </p>

          <a href="/" className="block text-center text-[11px] text-brand-navy underline">
            Volver al catálogo
          </a>
        </form>
      </div>
    );
  }

  /* -- panel ------------------------------------------------------------- */
  const v = datos?.visitas;

  const exportar = async (
    id: string,
    tipo: 'pdf' | 'excel',
    cual: 'visitas' | 'contactos',
  ) => {
    if (!datos) return;
    setExportando(id);
    try {
      if (cual === 'visitas') {
        const filas = datos.visitas.porDia.filter((d) => d.total > 0);
        const sub = `${numero(datos.visitas.total)} registros (90 días) · ${numero(
          datos.visitas.unicos30,
        )} navegadores distintos (30 días)`;
        if (tipo === 'pdf') {
          await exportarPdf('Visitas del catálogo', sub, COL_VISITAS, filas, `visitas-${sello()}.pdf`);
        } else {
          await exportarExcel(`visitas-${sello()}.xlsx`, COL_VISITAS, filas);
        }
      } else {
        const sub = `${numero(datos.contactos.length)} contactos del formulario`;
        if (tipo === 'pdf') {
          await exportarPdf('Contactos del catálogo', sub, COL_CONTACTOS, datos.contactos, `contactos-${sello()}.pdf`);
        } else {
          await exportarExcel(`contactos-${sello()}.xlsx`, COL_CONTACTOS, datos.contactos);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo exportar');
    } finally {
      setExportando('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-brand-navy text-white px-4 py-3 flex flex-wrap items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-brand-navy-dark shadow-inner flex items-center justify-center -skew-x-6">
          <span className="text-brand-lime font-black text-lg italic">G</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-black tracking-tight leading-none">Panel de visitas y contactos</p>
          <p className="text-[10px] text-slate-300 uppercase tracking-widest mt-0.5">
            {SITE.empresa} · interno
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRecarga((n) => n + 1)}
            className="text-[11px] font-bold bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-full transition min-h-[32px]"
          >
            {cargando ? 'Cargando…' : 'Actualizar'}
          </button>
          <button
            type="button"
            onClick={() => {
              olvidarClave();
              setEntrada('');
              setClave('');
              setDatos(null);
              setError('');
            }}
            className="text-[11px] font-bold bg-brand-lime text-brand-navy px-3 py-1.5 rounded-full hover:bg-brand-lime-dark transition min-h-[32px]"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-4">
        <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50 border border-amber-200 rounded-lg p-3">
          <strong className="text-amber-800">Cómo se cuentan las visitas:</strong> se registra
          una vez por navegador al día, por tanto «navegadores distintos» es una aproximación
          de personas reales, no una medición exacta. Los contactos son los que el propio
          visitante escribió en el formulario. La clave de este panel{' '}
          <strong className="text-amber-800">no es autenticación</strong>.
        </p>

        {error && (
          <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </p>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <Metrica valor={v ? numero(v.total) : '—'} label="Visitas (90 días)" nota="un registro / navegador / día" />
          <Metrica valor={v ? numero(v.unicos30) : '—'} label="Personas (30 días)" nota="navegadores distintos" />
          <Metrica valor={v ? numero(v.hoy) : '—'} label="Hoy" />
          <Metrica valor={datos ? numero(datos.contactos.length) : '—'} label="Contactos" nota="formulario" />
        </div>

        {/* Visitas + export */}
        <Tarjeta
          titulo="Accesos por día (últimos 30)"
          extra={
            <div className="flex gap-1.5">
              <Boton
                onClick={() => void exportar('v-pdf', 'pdf', 'visitas')}
                disabled={!!exportando || !v}
              >
                {exportando === 'v-pdf' ? '…' : 'PDF'}
              </Boton>
              <Boton
                onClick={() => void exportar('v-xls', 'excel', 'visitas')}
                disabled={!!exportando || !v}
              >
                {exportando === 'v-xls' ? '…' : 'Excel'}
              </Boton>
            </div>
          }
        >
          <div className="flex items-end gap-[3px] h-28">
            {(v?.porDia ?? []).map((d) => (
              <div
                key={d.fecha}
                className="flex-1 flex flex-col items-center justify-end h-full"
                title={`${diaCorto(d.fecha)}: ${d.total}`}
              >
                <div
                  className={`w-full rounded-t ${d.total > 0 ? 'bg-brand-lime' : 'bg-slate-200'}`}
                  style={{ height: `${Math.max(3, (d.total / maxDia) * 100)}%` }}
                />
              </div>
            ))}
            {!v && <p className="text-xs text-slate-400 self-center">Sin datos todavía.</p>}
          </div>
          <div className="flex justify-between text-[9px] text-slate-400 mt-1.5 font-mono">
            <span>{v?.porDia.length ? diaCorto(v.porDia[0].fecha) : ''}</span>
            <span>{v?.ultima ? `último: ${diaCorto(v.ultima)}` : ''}</span>
            <span>{v?.porDia.length ? diaCorto(v.porDia[v.porDia.length - 1].fecha) : ''}</span>
          </div>
        </Tarjeta>

        {/* Contactos */}
        <Tarjeta
          titulo={`Contactos (${contactos.length})`}
          extra={
            <div className="flex gap-1.5">
              <Boton
                onClick={() => void exportar('c-pdf', 'pdf', 'contactos')}
                disabled={!!exportando || !datos?.contactos.length}
              >
                {exportando === 'c-pdf' ? '…' : 'PDF'}
              </Boton>
              <Boton
                onClick={() => void exportar('c-xls', 'excel', 'contactos')}
                disabled={!!exportando || !datos?.contactos.length}
              >
                {exportando === 'c-xls' ? '…' : 'Excel'}
              </Boton>
            </div>
          }
        >
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, teléfono o interés…"
            className="w-full text-xs px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none mb-3"
          />

          {contactos.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              {datos?.contactos.length
                ? 'Ningún contacto coincide con la búsqueda.'
                : 'Todavía nadie dejó sus datos en el formulario.'}
            </p>
          ) : (
            <div className="overflow-x-auto -mx-3 px-3">
              <table className="w-full text-[11px] border-collapse min-w-[640px]">
                <thead>
                  <tr className="text-left text-[9px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2 pr-2 font-black">Fecha</th>
                    <th className="py-2 pr-2 font-black">Nombre</th>
                    <th className="py-2 pr-2 font-black">Teléfono</th>
                    <th className="py-2 pr-2 font-black">Interés / productos</th>
                    <th className="py-2 font-black text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {contactos.map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 align-top">
                      <td className="py-2 pr-2 text-slate-500 whitespace-nowrap">
                        {fechaHora(c.ts)}
                      </td>
                      <td className="py-2 pr-2 font-semibold text-slate-800">
                        {c.nombre || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="py-2 pr-2 font-mono">{c.telefono || '—'}</td>
                      <td className="py-2 pr-2 text-slate-600">
                        {[c.interes, c.productos].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="py-2 text-right">
                        {aE164(c.telefono) ? (
                          <a
                            href={`https://wa.me/${aE164(c.telefono)}?text=${encodeURIComponent(
                              `Hola ${c.nombre || ''}, gracias por interesarte en el catálogo de ${SITE.empresa}.`.trim(),
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-brand-whatsapp text-white font-bold px-2 py-1 rounded-md hover:brightness-95 transition"
                          >
                            WhatsApp
                          </a>
                        ) : (
                          <span className="text-slate-300">sin teléfono</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-[10px] text-slate-400 mt-3 border-t border-slate-100 pt-2">
            Cada contacto fue escrito por el propio visitante en el formulario del catálogo.
            No se importan de ninguna parte.
          </p>
        </Tarjeta>

        {/* Notas de estado */}
        <Tarjeta titulo="Estado">
          <ul className="text-[11px] text-slate-600 space-y-1.5">
            <li>
              <strong>Almacén:</strong>{' '}
              {datos?.almacen === 'blob'
                ? 'Vercel Blob (producción)'
                : 'memoria local — solo funciona mientras corre `npm run dev`'}
              .
            </li>
            <li>
              <strong>Secretos:</strong> la clave se define en la variable de entorno{' '}
              <code className="font-mono text-[10px]">PANEL_CLAVE</code> y el token de Blob es{' '}
              <code className="font-mono text-[10px]">BLOB_READ_WRITE_TOKEN</code>. Ninguno va
              en el código.
            </li>
            <li>
              <strong>Límite del plan Hobby:</strong> 1 GB y 2.000 escrituras al mes. Al
              superarlo Vercel bloquea Blob hasta el mes siguiente.
            </li>
            <li>
              <strong>Cerrar:</strong> pulsa «Salir» para borrar la clave de este navegador.
            </li>
          </ul>
        </Tarjeta>

        <p className="text-[10px] text-slate-400 text-center pb-6">
          <a href="/" className="underline">
            catálogo público
          </a>
        </p>
      </div>
    </div>
  );
}
