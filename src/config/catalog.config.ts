/* ============================================================================
   TAXONOMIA DEL CATALOGO
   Las categorias viven como datos. Agregar una categoria nueva = agregar una
   entrada aca. Ningun componenteVisual tiene if/else por categoria.
   ========================================================================== */

export type CategoriaId = 'TODOS' | 'LUBRICANTES' | 'FILTROS' | 'MANTENIMIENTO' | 'NEUMATICOS' | 'REPUESTOS';

export interface Categoria {
  id: CategoriaId;
  label: string;
  /** Solo para 'TODOS'. */
  esTodos?: boolean;
}

export const CATEGORIAS: Categoria[] = [
  { id: 'TODOS', label: 'Todos', esTodos: true },
  { id: 'LUBRICANTES', label: 'Lubricantes' },
  { id: 'FILTROS', label: 'Filtros' },
  { id: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { id: 'NEUMATICOS', label: 'Neumáticos' },
  { id: 'REPUESTOS', label: 'Repuestos' },
];

/* ---------------------------------------------------------------------------
   ETIQUETAS (badge superior izquierdo de la tarjeta)
   El diseno asigna color por ROL segun DESIGN.md "Badges & Category Tags".
   Los colores observados en screen.png se respetan literalmente.
   ------------------------------------------------------------------------- */
export type RolEtiqueta = 'pesado' | 'automotriz' | 'seguridad' | 'tecnico' | 'marino' | 'default';

export interface EstiloEtiqueta {
  clases: string;
  rol: RolEtiqueta;
}

/**
 * Mapa literal de las etiquetas que aparecen en screen.png:
 *   MOTOS   -> navy
 *   CAMIÓN  -> amber-600
 *   AUTOS   -> blue-600
 *   FRENOS  -> red-700
 * El resto se deriva del rol para mantener coherencia con el design system.
 */
export const ETIQUETAS: Record<string, EstiloEtiqueta> = {
  // --- literales de screen.png ---
  MOTOS: { clases: 'bg-brand-navy text-white', rol: 'automotriz' },
  CAMION: { clases: 'bg-amber-600 text-white', rol: 'pesado' },
  AUTOS: { clases: 'bg-blue-600 text-white', rol: 'automotriz' },
  FRENOS: { clases: 'bg-red-700 text-white', rol: 'seguridad' },

  // --- por rol (DESIGN.md) ---
  AUTO: { clases: 'bg-blue-600 text-white', rol: 'automotriz' },
  PESADO: { clases: 'bg-brand-navy text-white', rol: 'pesado' },
  CAMIONES: { clases: 'bg-brand-navy text-white', rol: 'pesado' },
  CAMIONETAS: { clases: 'bg-brand-navy text-white', rol: 'pesado' },
  'CARGA PESADA': { clases: 'bg-brand-navy text-white', rol: 'pesado' },
  NEUMATICO: { clases: 'bg-slate-800 text-white', rol: 'pesado' },
  NAUTICO: { clases: 'bg-sky-700 text-white', rol: 'marino' },
  AGRICOLA: { clases: 'bg-lime-800 text-white', rol: 'pesado' },
  JARDINERIA: { clases: 'bg-lime-800 text-white', rol: 'tecnico' },
  HIDRAULICA: { clases: 'bg-lime-800 text-white', rol: 'tecnico' },
  SIERRAS: { clases: 'bg-lime-800 text-white', rol: 'tecnico' },
  MECANISMOS: { clases: 'bg-amber-600 text-white', rol: 'tecnico' },
  PLASTICOS: { clases: 'bg-amber-600 text-white', rol: 'tecnico' },
  LIMPIADOR: { clases: 'bg-brand-lime text-slate-900', rol: 'tecnico' },
  ADITIVO: { clases: 'bg-brand-lime text-slate-900', rol: 'tecnico' },
  'USO PERSONAL': { clases: 'bg-slate-600 text-white', rol: 'default' },
};

export const ETIQUETA_DEFAULT: EstiloEtiqueta = {
  clases: 'bg-slate-600 text-white',
  rol: 'default',
};

export function estiloEtiqueta(eti?: string): EstiloEtiqueta {
  if (!eti) return ETIQUETA_DEFAULT;
  return ETIQUETAS[eti.toUpperCase()] ?? ETIQUETA_DEFAULT;
}

/* ---------------------------------------------------------------------------
   COLOR DE MARCA en la linea superior de la tarjeta.
   En screen.png MOTUL aparece en rojo (color real de marca, no un token).
   Las demas marcas usan su color corporativo reconocible.
   ------------------------------------------------------------------------- */
export const MARCA_COLOR: Record<string, string> = {
  MOTUL: 'text-red-600',
  AMSOIL: 'text-blue-700',
  PDV: 'text-blue-800',
  SENFINECO: 'text-teal-700',
  MILLARD: 'text-slate-700',
  MICHELIN: 'text-blue-700',
  VOLKER: 'text-orange-600',
};

export const MARCA_COLOR_DEFAULT = 'text-slate-600';

export function colorMarca(marca?: string): string {
  if (!marca) return MARCA_COLOR_DEFAULT;
  return MARCA_COLOR[marca.toUpperCase()] ?? MARCA_COLOR_DEFAULT;
}

/* ---------------------------------------------------------------------------
   ORDEN CURADO DE MARCAS
   Define como se agrupan y ordenan las marcas en el catalogo (secciones y
   pills de filtro). MOTUL primero por ser la marca ancla del stand; el resto
   sigue el orden de importancia comercial. Las marcas no listadas caen al
   final en orden alfabetico.
   ------------------------------------------------------------------------- */
export const MARCAS_ORDEN: string[] = [
  'MOTUL',
  'AMSOIL',
  'SENFINECO',
  'MILLARD',
  'VOLKER',
  'PDV',
  'MICHELIN',
];

export function pesoMarca(marca: string): number {
  const i = MARCAS_ORDEN.indexOf(marca.toUpperCase());
  return i === -1 ? MARCAS_ORDEN.length : i;
}

/** Comparador estable para ordenar/agrupar por marca. */
export function compararMarca(a: string, b: string): number {
  return pesoMarca(a) - pesoMarca(b) || a.localeCompare(b, 'es');
}

/* ---------------------------------------------------------------------------
   DISPONIBILIDAD
   Badge semantico. Colores segun DESIGN.md "State Semantics".
   ------------------------------------------------------------------------- */
export type Disponibilidad = 'EN_STOCK' | 'BAJO_STOCK' | 'BAJO_PEDIDO' | 'AGOTADO';

export const DISPONIBILIDAD: Record<Disponibilidad, { label: string; clases: string }> = {
  EN_STOCK: { label: 'En stock', clases: 'bg-brand-lime/15 text-lime-800 border-brand-lime/40' },
  BAJO_STOCK: { label: 'Últimas unidades', clases: 'bg-amber-50 text-amber-700 border-amber-200' },
  BAJO_PEDIDO: { label: 'Bajo pedido', clases: 'bg-slate-100 text-slate-600 border-slate-200' },
  AGOTADO: { label: 'Agotado', clases: 'bg-red-50 text-red-700 border-red-200' },
};

export type EstadoProducto = 'ACTIVO' | 'INACTIVO';

/* ---------------------------------------------------------------------------
   INTERRUPTORES DE CONTENIDO
   Nada de esto borra codigo: son puertas. Volver a `true` restaura la seccion
   tal cual estaba, con buscador, filtros y las 217 fichas.
   ------------------------------------------------------------------------- */

/**
 * Catalogo de productos (217 fichas + buscador + filtros).
 * Se oculta mientras los catalogos oficiales sean los PDF.
 */
export const MOSTRAR_CATALOGO_PRODUCTOS = false;

/**
 * Banner "Distribuidor Autorizado Motul".
 * Se retiro a pedido del cliente: ahora manda la presentacion del grupo.
 */
export const MOSTRAR_BANNER_DISTRIBUIDOR = false;

/* ---------------------------------------------------------------------------
   CATALOGOS OFICIALES (PDF)
   Los archivos van en `public/catalogos/`. El nombre de `archivo` debe
   coincidir EXACTAMENTE con el archivo (mayusculas y guiones incluidos).
   ------------------------------------------------------------------------- */
export interface CatalogoOficial {
  id: string;
  titulo: string;
  sub: string;
  archivo: string;
  cta: string;
}

/**
 * Los PDF se sirven desde `public/catalogos/`. El nombre de `archivo` debe
 * coincidir EXACTAMENTE con el archivo real (mayusculas y guiones incluidos):
 * un nombre mal escrito da un 404 silencioso.
 */
export const CATALOGOS_OFICIALES: CatalogoOficial[] = [
  {
    id: 'lubricantes',
    titulo: 'Catálogo Lubricantes San Luis',
    sub: 'Lubricantes, filtros y mantenimiento',
    archivo: '/catalogos/Lubricantes_San_Luis.pdf',
    cta: 'Ver catálogo',
  },
  {
    id: 'suministros',
    titulo: 'Catálogo San Luis Suministros',
    sub: 'Unidades, carga y suministros',
    archivo: '/catalogos/San_Luis_Suministros.pdf',
    cta: 'Ver catálogo',
  },
];

/** Secciones copiadas literalmente de code.html / screen.png. */
export const COPY = {
  canales: { titulo: 'Canales Oficiales', badge: 'CONECTA HOY' },
  catalogo: { titulo: 'Catálogo en Exhibición' },
  hero: {
    eyebrow: 'Bienvenido al Stand',
    titulo: 'Lubricantes, filtros y repuestos',
    tituloEnStock: 'en existencia',
    parrafo:
      'Somos un grupo de unidades de negocio: Distribuidora de Hidrocarburos San Luis, San Luis Lubricantes y San Luis Transporte. Disponibilidad inmediata para flotas pesadas, transporte de carga, camiones y autos.',
  },
  contacto: {
    titulo: 'Contacto y Sede',
    formTitulo: 'Solicitud de Cotización Formal',
    formParrafo: 'Dejanos tus datos y recibirás lista mayorista para tu flota o negocio:',
  },
  buscar: { placeholder: 'Buscar lubricante, filtro o código...' },
  verTodas: 'Ver todas las referencias',
  verMas: 'Ver más referencias',
  todasLasMarcas: 'Todas las marcas',
};