# Registro de decisiones — Catálogo Digital QR

Cada decisión que resolved una ambigüedad entre `code.html`, `DESIGN.md` y `screen.png`,
con el criterio aplicado. Si algo se revisa, se documenta acá abajo.

---

## D-01 · Paleta: gana `code.html` + `screen.png` sobre el frontmatter de `DESIGN.md`

**Conflicto.** El frontmatter YAML de `DESIGN.md` define una paleta **Material 3**
(`primary: #001e40`, `secondary-container: #bbf23d`, `tertiary: #381300`, escala
`surface-container-*`). El `code.html` usa otra paleta: `brand.navy #003366`,
`brand.lime #95C800`, `bgLight #F8FAFC`. La prosa del *propio* `DESIGN.md` describe
la navy/lime, no la Material.

**Criterio.** Tres criterios en orden:
1. `screen.png` muestra navy `#003366` y lime `#95C800`. Es la referencia visual real.
2. El `code.html` implementa esa paleta y su DOM coincide 1:1 con `screen.png`.
3. El frontmatter parece un leftover de otro theme (Material 3 genérico) que no
   se aplicó nunca al output.

**Decisión.** Se implementa la paleta de `code.html`. Del frontmatter de `DESIGN.md`
solo se toman las **escalas tipográficas y de espaciado** (headline/body/label,
spacing 4/8px, radios), porque sus valores sí son coherentes y se usan.

**Dónde vive.** `src/styles/index.css` (`@theme`) y `src/config/site.config.ts`.

---

## D-02 · Se elimina el clamp `max-w-[390px]` del wrapper

**Conflicto.** El `code.html` envuelve todo en `max-w-[390px]` con fondo
`bg-slate-100`, `shadow-2xl` y bordes laterales: es una **maqueta de stand** pensada
para verse en una pantalla de escritorio mostrando un móvil.

**Criterio.** El DESIGN define escalones reales (`<768px` 1 col, `768–1024` 8 col,
`>1024` 12 col hasta 1280px) y el brief exige "375px / 390px / 414px" y que
"desktop debe ser responsive, pero NO debe sacrificar la experiencia móvil".

**Decisión.** El contenedor mantiene `w-full` en móvil (375/390/414 se ven
idénticos al Stitch) y se ensancha a `sm:max-w-[680px] lg:max-w-[1100px]
xl:max-w-[1280px]`. La estética de maqueta (`shadow-2xl`, `border-x`) se conserva.
El grid de productos pasa de 2 columnas fijas a `2 / 3 / 4 / 5` columnas.

**Dónde.** `src/pages/CatalogoPage.tsx`, `src/components/CatalogSection.tsx`.

---

## D-03 · Las fotos reales reemplazan los pictogramas FontAwesome

**Conflicto.** El Stitch no tenía fotos: el *image bed* de cada tarjeta contenía un
ícono FA de 3xl (`fa-spray-can`, `fa-oil-can`…) sobre cama `bg-slate-100`. El brief
exige no reemplazar assets reales por placeholders y dice que las imágenes de la
carpeta `catalogo/` son las que hay que usar.

**Decisión.** El *image bed* conserva el mismo marco, radio, altura de línea, chip de
línea en la esquina y `group-hover:scale`. Dentro va la **foto real** con
`object-contain`. El ícono FA se conserva como **placeholder explícito** para
productos sin imagen, rotulado "SIN IMAGEN" (hoy: 0 de 217).

**Altura del frame.** `h-24` (96px) en Stitch estaba calibrado para un ícono de 48px.
Con fotos verticales reales (305×420, 253×420) el producto quedaba ilegible, así que
el frame sube a `h-28`. Es el **único ajuste de dimensión** respecto al Stitch y está
justificado por el cambio de contenido, no por gusto.

**Dónde.** `src/components/ProductCard.tsx`.

---

## D-04 · El detalle de producto es un bottom sheet, no una página

**Conflicto.** El Stitch **no tiene** vista de detalle: el flujo salta directo a
WhatsApp. El DESIGN sí define "Surface Level 3 (Drawers, Bottom Sheets)".

**Decisión.** Bottom sheet (`0 -4px 24px rgba(0,0,0,.10)` sobre blanco), que es un
componente que el design system ya define, en vez de inventar una página nueva que
rompería la composición de columna única del Stitch. Se abre al tocar la tarjeta y
tiene deep link `#p/<id>`.

**Dónde.** `src/components/ProductSheet.tsx`.

---

## D-05 · Los contadores salen de los datos, no del texto del mock

**Conflicto.** El Stitch muestra "8 de 94 ítems", "Todos (94)" y "+1.200 Referencias".
Con 217 productos reales, "94" y "+1.200" serían afirmaciones falsas en un stand.

**Decisión.**
- "X de Y ítems" y "(N)" de las pills → **conteos reales derivados de los datos**.
- "+1.200 Referencias" en el hero navy → **se mantiene literal** porque es una
  afirmación comercial del cliente presente en ambas referencias (Stitch *y* sitio
  institucional), y borrarla sería rediseñar. Queda anotado en `site.config.ts` como
  dato a confirmar.

**Dónde.** `conteoPorCategoria()` en `src/lib/catalogo.repository.ts`.

---

## D-06 · Categorías: las 4 de Stitch + 2 que exigen los datos

**Conflicto.** El brief fija las categorías iniciales en *Todos / Lubricantes /
Filtros / Mantenimiento*. El catálogo real tiene además **MICHELIN** (4 neumáticos)
y **VOLKER** (8 amortiguadores).

**Decisión.** Se mantienen **las 4 del Stitch, en el mismo orden y con las mismas
etiquetas**, y se agregan *Neumáticos* y *Repuestos* al final del scroller. Las
categorías son datos en `CATEGORIAS` (`catalog.config.ts`): agregar una séptima es
agregar una entrada, no tocar el componente.

**Mapeo de las fichas heredadas** (`s` → categoría):

| `s` original | Categoría |
|---|---|
| `autos` `motos` `pesado` `carga` `nautica` | LUBRICANTES |
| `aceite` `combustible` `aire` | FILTROS |
| `general` `especial` `aditivos` | MANTENIMIENTO |
| marca `michelin` | NEUMATICOS |
| marca `volker` | REPUESTOS |

Resultado: LUBRICANTES 127 · FILTROS 23 · MANTENIMIENTO 55 · NEUMATICOS 4 · REPUESTOS 8.

---

## D-07 · Colores de badge de etiqueta

El DESIGN asigna color **por rol** (navy = carga pesada, lime = automotriz,
ámbar = seguridad/mantenimiento). `screen.png` muestra los literales:
`MOTOS` navy · `CAMIÓN` amber-600 · `AUTOS` blue-600 · `FRENOS` red-700.

**Decisión.** Los cuatro literales de `screen.png` se respetan tal cual. Las otras
16 etiquetas se asignan por rol según el DESIGN. Todo el mapa está en `ETIQUETAS`.

**El rojo de MOTUL en la marca** (`text-red-600`) es color de marca real, no un
token del sistema: se conserva. Las otras 6 marcas usan su color corporativo.

---

## D-08 · El formulario de contacto es 100 % opcional

**Conflicto.** El Stitch marca `required` en nombre y teléfono. El brief dice
explícitamente: "El contacto es OPCIONAL… No obligar a introducir nombre, teléfono,
email, empresa".

**Decisión.** Se aplica el brief: **ningún campo es obligatorio**. El `required`
del Stitch se elimina. El botón se habilita solo con el mensaje de interés (único
campo realmente necesario para cotizar), y el bloque completo puede ignorarse: el
catálogo se usa entero sin escribir nada. Hay un aviso explícito bajo el botón.

---

## D-09 · WhatsApp: cero números literales en componentes

El Stitch traía `https://wa.me/582510000000?text=…` repetido en 12 sitios.

**Decisión.** Todo pasa por `src/lib/whatsapp.ts` + `SITE.whatsappE164`. El formato
del mensaje conserva el patrón que el Stitch ya usaba (`Consultar {nombre}
(Cod: {código})`), extendido con presentación y marca. **El número `582510000000` es
de ejemplo y NO está confirmado**: vive en un solo lugar y está marcado como
provisional en `site.config.ts`.

---

## D-10 · Se elimina FontAwesome, Tailwind CDN y Google Fonts

El Stitch cargaba tres CDNs en runtime (~300 KB y 3 dominios externos por visita,
justo el peor escenario para tráfico de QR).

| Antes | Ahora | Ahorro |
|---|---|---|
| `cdn.tailwindcss.com` (runtime) | Tailwind 4 en build | ~110 KB JS + 1 dominio |
| FontAwesome 6.4 CDN (CSS + webfonts) | 13 SVG inline | ~70 KB + 1 dominio |
| Google Fonts Rubik (9 pesos) | 4 woff2 auto-hospedados (variable 400–900, subconjunto latin + latin-ext) | ~90 KB + 1 dominio, y sinokies para terceros |

Rubik se descarga como **fuente variable**: 2 archivos (normal + italic) cubren los
pesos 400–900. Se preinlinan los `latin` porque son los del primer render.

---

## D-11 · Se implementan los dos huecos que Stitch dejó marcados

El `code.html` traía dos bloques **vacíos**:
`<!-- BEGIN: Floating WhatsApp Widget -->` y `<!-- BEGIN: Fixed Mobile Bottom Navigation Bar -->`.

**Decisión.**
- **Widget flotante de WhatsApp: sí**, en verde de marca `#25D366`, 48px,
  `bottom-right`, con la elevación Level 2 del DESIGN. Es el CTA de alta intención
  del stand y el DESIGN lo pide.
- **Bottom navigation fija: no.** Ninguna de las dos referencias la muestra
  (`screen.png` termina en el footer, sin barra), y con el catálogo en una sola
  columna no aporta navegación. Se deja para más adelante si hace falta.

---

## D-12 · Los datos vienen del catálogo ya curado del sitio institucional

Las 217 fichas no se inventaron: se extrajeron programáticamente de
`PaginaWeb/js/marcas/*.js`, que es donde ya vive el catálogo real con sus assets.
Los `.webp` de `catalogo/` están **copiados** a `public/catalogo/` para servirlos
estáticos; la carpeta original queda **intacta**.

**Deuda conocida:** 4 de 217 productos vienen sin descripción en la fuente
(son los que no tenían nota). Se detectan con `descripcion === ''`.

---

## D-13 · Arquitectura final: 100 % estática

**Decisión (fase definitiva).** El proyecto es una SPA estática. **No hay** backend,
API, base de datos externa, Vercel Functions, analítica propia ni autenticación.

La "base de datos" del catálogo es `src/data/productos.json`, versionado en Git:

```
src/data/productos.json → vite build → dist/assets/*.js → CDN de Vercel
```

Se eliminaron las implementaciones `CatalogoApi` y la variable `VITE_API_BASE`
porque la app debe desplegarse sin configurar **nada** en Vercel. Solo queda
`CatalogoLocal`, cuya interfaz (`CatalogoRepository`) se conserva para que conectar
una fuente real de datos en el futuro no obligue a tocar ningún componente visual.

**Sobre el panel `/admin`:** es una herramienta visual interna de solo lectura.
Muestra totales, desgloses, cobertura de fichas y la configuración vigente.
No tiene servidor, ni base de datos, ni login: **no promete seguridad ni
persistencia**. Editar productos = editar el JSON y volver a desplegar.
Está fuera de la navegación pública y bloqueado en `robots.txt`.

---

## D-14 — Panel de visitas y contactos (revierte parte de D-13)

**Pedido posterior del cliente.** `/admin` deja de mostrar estadísticas del catálogo
y pasa a mostrar: (1) cuántas personas entraron y (2) la lista de personas que
dejaron sus datos para ser contactadas, con exportación a PDF y Excel.

**Se levanta la restricción de D-13 por decisión explícita del cliente.** Un
contador agregado entre dispositivos y una lista de contactos compartida **no se
pueden hacer sin almacenamiento**: `localStorage` solo vería lo del propio equipo
y no serviría para un stand.

**Decisión.** Tres funciones de Vercel + Vercel Blob (plan Hobby, gratuito):

```
POST /api/visita    -> 1 archivo por (día, navegador)
POST /api/contacto  -> 1 archivo por contacto, con id aleatorio
GET  /api/panel     -> resumen + contactos (cabecera x-panel-clave)
```

El diseño evita el "leer antes de escribir": el conteo se reconstruye leyendo los
**nombres** de los archivos, así que cada visita cuesta 1 escritura y no 2-3. La
retención es de 90 días. El catálogo público no cambia: las llamadas son
fire-and-forget y si `/api` no está disponible el visitante no nota nada.

**Se descartó Nitro.** Era la ruta que recomienda la documentación de Vercel para
«añadir backend a una app Vite», pero al construir se comprobó que **no escaneaba
`api/`**: la función salía con 6 KB y sin ninguna ruta. Además movía la salida de
`dist/` a `.vercel/output/`, lo que ponía en riesgo un despliegue ya verificado.
Se volvió a `dist/` y a `vercel.json` intactos.

**Sobre la honestidad de lo que se muestra** (va escrito en la propia pantalla):

- «Navegadores distintos» es una **aproximación** de personas, no una medición.
- La clave de `/admin` **no es autenticación**: solo evita que alguien que adivine
  la URL lea teléfonos por accidente.
- El aviso del plan Hobby («non-commercial, personal use») también se dejó
  documentado; este sitio lo usa una empresa real.
