/**
 * Render de humo en Node: monta la pagina del catalogo sin navegador y
 * verifica que el arbol de componentes produce HTML con los datos reales.
 * Sirve para detectar errores de render que `tsc` no ve.
 * No forma parte de la app; se borra tras la verificacion o queda como util
 * de diagnostico.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { CatalogoLocal } from './lib/catalogo.repository';
import { conteoPorCategoria } from './lib/catalogo.repository';
import { filtrarCatalogo, coincide } from './lib/busqueda';
import { urlProducto } from './lib/whatsapp';

async function main() {
  const repo = new CatalogoLocal();
  const productos = await repo.listar();
  const conteos = conteoPorCategoria(productos);

  console.log('productos:', productos.length);
  console.log('conteos:', conteos.map((c) => `${c.label}=${c.total}`).join(' '));

  // busquedas clave del stand
  const pruebas: [string, string[]][] = [
    ['102985', ['A1 Air Filter Clean']],
    ['m102985', ['A1 Air Filter Clean']],
    ['motul', []],
    ['supra', ['Supra Premium SAE 15W-40']],
    ['15w40', ['Supra Premium SAE 15W-40']],
    ['filtro de aceite', []],
    ['amortiguador', []],
  ];
  let fallos = 0;
  for (const [q, esperados] of pruebas) {
    const r = filtrarCatalogo(productos, q, 'TODOS');
    const ok = esperados.every((e) => r.productos.some((p) => p.nombre === e));
    if (!ok) fallos++;
    console.log(
      `  busqueda "${q}" -> ${r.total} resultados ${ok ? 'OK' : 'FALLA (esperaba ' + esperados.join(',') + ')'}`,
    );
  }

  // coincidencia por codigo con padding/guiones
  const p1 = productos.find((p) => p.id === 'motul-a1-air-filter-clean');
  if (!p1) { console.log('FALTA producto de referencia'); fallos++; }
  else {
    for (const q of ['M102985', 'm102985', '102985', 'A1', 'air filter', 'motul care']) {
      console.log(`  match "${q}" -> ${coincide(p1, q) ? 'si' : 'NO'}`);
      if (!coincide(p1, q)) fallos++;
    }
    console.log('  url WA:', urlProducto(p1));
    if (!urlProducto(p1).startsWith('https://wa.me/')) fallos++;
  }

  // render de humo de la pagina
  const { CatalogoPage } = await import('./pages/CatalogoPage');
  const html = renderToStaticMarkup(<CatalogoPage /> as never);
  console.log('html inicial bytes:', html.length);
  const esperados: string[] = [
    'SAN LUIS',
    'STAND OFICIAL',
    'Catálogo en Exhibición',
    'Lubricantes, filtros y repuestos',
    '@suministrossanluis',
    '@sanluishidrocarburo',
  ];
  for (const s of esperados) {
    const ok = html.includes(s);
    if (!ok) fallos++;
    console.log(`  contiene "${s}" -> ${ok ? 'si' : 'NO'}`);
  }

  // Canales: 2 Instagram + 1 WhatsApp, sin LinkedIn ni YouTube.
  const canales: [string, boolean][] = [
    ['Instagram x2', (html.match(/@/g) ?? []).length >= 2 && !html.includes('LinkedIn')],
    ['sin LinkedIn', !html.includes('LinkedIn')],
    ['sin YouTube', !html.includes('YouTube')],
    ['cta WhatsApp presente', html.includes('Atención Stand') && html.includes('wa.me')],
  ];
  for (const [nombre, ok] of canales) {
    if (!ok) fallos++;
    console.log(`  canales ${nombre} -> ${ok ? 'si' : 'NO'}`);
  }

  console.log(fallos === 0 ? '\nOK: sin fallos' : `\nFALLOS: ${fallos}`);
  if (fallos > 0) process.exitCode = 1;
}

void main();