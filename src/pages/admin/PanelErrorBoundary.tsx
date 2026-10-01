import { Component, type ReactNode } from 'react';

/**
 * Barrera de errores para el panel.
 * React 19 desmonta TODO el arbol si un render lanza, y sin esto el usuario
 * se queda con la pantalla en blanco y un error minificado en consola.
 * Preferimos mostrar que fallo y como salir.
 */
export class PanelErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-red-200 shadow-sm p-6 space-y-3">
          <h1 className="text-sm font-black text-red-700 uppercase tracking-wider">
            El panel falló al cargar
          </h1>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            Esto es un problema del panel, no del catálogo. El catálogo público
            sigue funcionando: entra en la raíz del sitio.
          </p>
          <pre className="text-[10px] font-mono bg-slate-50 border border-slate-200 rounded-lg p-2 overflow-x-auto whitespace-pre-wrap">
            {String(error.message || error.name || 'Error desconocido')}
          </pre>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => this.setState({ error: null })}
              className="text-[11px] font-bold px-3 py-2 rounded-lg bg-brand-navy text-white hover:bg-brand-navy-light transition"
            >
              Reintentar
            </button>
            <a
              href="/"
              className="text-[11px] font-bold px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-brand-navy hover:text-brand-navy transition"
            >
              Ir al catálogo
            </a>
          </div>
        </div>
      </div>
    );
  }
}
