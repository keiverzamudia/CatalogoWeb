/**
 * Render de humo en Node: monta la pagina del catalogo sin navegador y
 * verifica que el arbol de componentes produce HTML con los datos reales.
 * Sirve para detectar errores de render que `tsc` no ve.
 * No forma parte de la app; se borra tras la verificacion o queda como util
 * de diagnostico.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { CATALOGOS_OFICIALES } from './config/catalog.config';
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

  // Acceso al formulario y boton de subir: sin esto, los contactos del panel
  // se quedan en cero porque nadie encuentra donde dejar sus datos.
  const contacto: [string, boolean][] = [
    ['ancla #contacto presente', html.includes('id="contacto"')],
    ['CTA al formulario', html.includes('Déjanos tu contacto') || html.includes('Dejanos tu contacto')],
    ['boton subir arriba', html.includes('Subir al inicio de la pagina')],
    ['formulario con su boton', html.includes('Enviar y escribir por WhatsApp')],
    ['aviso de solo un dato', html.includes('Solo necesitas dejar un dato')],
  ];
  for (const [nombre, ok] of contacto) {
    if (!ok) fallos++;
    console.log(`  contacto ${nombre} -> ${ok ? 'si' : 'NO'}`);
  }

  // Catalogos en PDF: son la via principal, y el catalogo de productos debe
  // quedar OCULTO (no borrado) mientras el interruptor este en false.
  //
  // OJO: las rutas de los PDF NO estan en el HTML. Los botones guardan el
  // objeto del catalogo y abren el visor por onClick, asi que `archivo` vive
  // en el estado de React, no en el markup. Aqui se comprueba el markup y,
  // aparte, que el dato exista en la configuracion.
  const rutasPdfOk =
    CATALOGOS_OFICIALES.length === 2 &&
    CATALOGOS_OFICIALES.every((c) => c.archivo.startsWith('/catalogos/') && c.archivo.endsWith('.pdf'));

  const pdf: [string, boolean][] = [
    ['seccion de catalogos', html.includes('Catálogos oficiales')],
    ['2 botones de catalogo', (html.match(/Ver catálogo/g) ?? []).length === 2],
    ['rutas PDF en config', rutasPdfOk],
    ['botones son <button>', (html.match(/<button type="button"/g) ?? []).length >= 2],
    ['catalogo de productos OCULTO', !html.includes('Catálogo en Exhibición') && !html.includes('Buscar lubricante')],
    ['banner Motul retirado', !html.includes('Distribuidor Autorizado Motul')],
    ['unidades de negocio', html.includes('unidades de negocio') && html.includes('San Luis Transporte')],
  ];
  for (const [nombre, ok] of pdf) {
    if (!ok) fallos++;
    console.log(`  pdf ${nombre} -> ${ok ? 'si' : 'NO'}`);
  }

  console.log(fallos === 0 ? '\nOK: sin fallos' : `\nFALLOS: ${fallos}`);
  if (fallos > 0) process.exitCode = 1;
}

void main();