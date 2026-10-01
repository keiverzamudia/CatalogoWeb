# Catálogo Digital QR — Grupo San Luis

Catálogo móvil para el stand de exposición. Entra por QR, busca, filtra,
consulta producto y escribe por WhatsApp. **Sin registro, sin login, sin carrito.**

## Estado actual

El **catálogo público sigue siendo 100 % estático**: sin base de datos, sin cookies
de terceros y sin analítica de ningún proveedor. Se entrega en dos capas:

| Capa | Qué es | Dónde vive |
|---|---|---|
| Catálogo (el producto) | 217 fichas en un JSON versionado en Git | `src/data/productos.json` → CDN de Vercel |
| Panel interno `/admin` | contador de visitas + contactos del formulario, exportables a PDF y Excel | 3 funciones de Vercel + Vercel Blob |

| Área | Estado | Nota |
|---|---|---|
| Andamiaje + tokens | ✅ | Vite 7 + React 19 + TS + Tailwind 4, Rubik auto-hospedada |
| Catálogo público | ✅ | 217 productos reales, orden de secciones idéntico al Stitch |
| Búsqueda + filtros | ✅ | 6 campos indexados, conteos derivados de los datos |
| Detalle de producto | ✅ | Bottom sheet + deep link `#p/<id>` |
| WhatsApp | ✅ | Todo desde config, cero números literales en componentes |
| Panel `/admin` | ✅ | Visitas + contactos, export PDF/Excel, clave simple |
| Analítica de terceros | ✅ | **No existe** (solo un contador propio de una cifra) |

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build -> dist/
npm run preview    # sirve dist/ localmente
npm run check:ssr  # humo: render en Node + busquedas verificadas
npm run api:local  # prueba las funciones de /api en http://localhost:4321
```

## Despliegue en Vercel

El **catálogo funciona sin configurar nada**. Solo el panel `/admin` necesita
dos pasos manuales:

1. Subir el repo a GitHub.
2. Importarlo en Vercel con framework **Vite**.
3. Build command `npm run build`, output `dist`.
4. `vercel.json` ya trae el rewrite de SPA (todas las rutas → `index.html`) y las
   cabeceras de caché.
5. *(Solo para `/admin`)* **Storage → Blob → Create database → Connect Project**.
   Vercel inyecta `BLOB_READ_WRITE_TOKEN` automáticamente.
6. *(Solo para `/admin`)* **Settings → Environment Variables** → `PANEL_CLAVE`
   con la clave que quieras. Sin ella, `/api/panel` responde con un aviso claro.

Sin los pasos 5 y 6 el catálogo funciona igual: el contador de visitas y el
guardado de contactos fallan en silencio y no afectan al visitante.

## Estructura

```
catalogo/            ← assets originales (NO se tocan). Copia servida en public/catalogo/
code.html            ← referencia Stitch (NO es el código de la app)
DESIGN.md            ← design system
screen.png           ← referencia visual
vercel.json          ← rewrites de SPA + caché + cabeceras de seguridad

api/                 ← 3 funciones Vercel: /api/visita, /api/contacto, /api/panel
shared/              ← logica compartida servidor: almacen del panel + respuestas
scripts/prueba-api.ts ← arnes local (npm run api:local), no entra en el build

src/
├── config/
│   ├── site.config.ts      ← empresa, WhatsApp, email, evento, redes. ÚNICO lugar.
│   └── catalog.config.ts   ← categorías, badges, colores de marca, copy
├── data/
│   ├── tipos.ts            ← interfaz Producto
│   └── productos.json      ← 217 fichas = LA base de datos (versionada en Git)
├── lib/
│   ├── catalogo.repository.ts  ← CatalogoLocal sobre el JSON + helpers/estadísticas
│   ├── busqueda.ts             ← normalización + matching
│   ├── panel.api.ts            ← llamadas a /api (visitas y contactos)
│   └── whatsapp.ts             ← mensajes contextuales
├── components/           ← uno por sección del Stitch
├── pages/CatalogoPage.tsx
├── pages/admin/          ← ruta aislada, lazy, sin enlaces públicos
└── styles/index.css      ← @theme con los tokens del design system
```

## Referencia de Stitch

El diseño viene de tres fuentes y **no se rediseña**:

- `code.html` — DOM y clases exactas
- `DESIGN.md` — design system (tokens, responsive, elevación)
- `screen.png` — referencia visual a 390px

Las ambigüedades entre las tres se resolvieron y están documentadas en
[`DECISIONES.md`](./DECISIONES.md). La más relevante: la paleta del frontmatter de
`DESIGN.md` (Material 3) **no** se usa; manda la de `code.html` + `screen.png`
(navy `#003366` + lime `#95c800`).

## ⚠ Datos pendientes de confirmar antes del evento

Concentrados en `src/config/site.config.ts`, marcados como provisorios:

| Campo | Valor actual | Estado |
|---|---|---|
| `SITE.whatsappE164` | `584129640810` | Cargado por el cliente. Verificar dígitos antes de imprimir el QR |
| `SITE.telefono` | `+58 412 964 0810` | Derivado del WhatsApp: ya no hay número mock |
| `SITE.email` | `ventassanluis.sl@gmail.com.ve` | Revisar el sufijo `.ve` en un dominio gmail |
| `SITE.eventoAnio` | `2025` | Confirmar el año real del evento |
| `SITE.redes` | WhatsApp + `@suministrossanluis` + `@sanluishidrocarburo` | Instagram reales; LinkedIn y YouTube se retiraron |
| `SITE.hero[0].valor` | `+1.200` Referencias | Afirmación comercial del cliente |
| `SITE.copyrightAnio` | `2025` | Alinear con `eventoAnio` |

En desarrollo la consola lista estos campos al cargar.

## Añadir o cambiar productos

Editar `src/data/productos.json` y volver a desplegar. No hay otra fuente de datos.

Agregar una categoría: una entrada en `CATEGORIAS` (`catalog.config.ts`) más el
`categoria` correspondiente en las fichas.

## Privacidad

Catálogo público: sin cookies de terceros, sin fingerprinting, sin analítica de
ningún proveedor, sin Google Fonts ni ningún otro CDN externo.

Lo único propio que se guarda es un **número aleatorio en `localStorage`** del
navegador (`gs_visitante`) y la fecha de su último acceso, para poder decir
«cuántos navegadores distintos entraron» sin poder seguir a nadie entre sitios.
Si el navegador bloquea el almacenamiento, simplemente no se cuenta.

## Panel administrativo

`/admin` — cuadro de mando interno, ruta separada y cargada bajo demanda,
**sin ningún enlace, botón ni menú público que la mencione**, y bloqueada en
`robots.txt`.

Muestra:

- **Visitas**: registros de los últimos 90 días, navegadores distintos de los
  últimos 30, accesos de hoy y la serie diaria de 30 días en barras.
- **Contactos**: las personas que dejaron sus datos en el formulario del
  catálogo, con buscador y botón para responderles por WhatsApp.

Ambas secciones se exportan a **PDF** y a **Excel** (`jspdf` + `write-excel-file`,
cargados solo al pulsar el botón, nunca en la página pública).

Cómo funciona y qué **no** es:

- Los datos viven en **Vercel Blob** (plan Hobby: 1 GB y 2.000 escrituras al mes).
  Una visita = 1 archivo por día y navegador; un contacto = 1 archivo con id
  aleatorio, para que su URL no sea deducible.
- El formulario del catálogo **sigue abriendo WhatsApp** igual que antes: guardar
  el contacto es un destino extra, nunca lo reemplaza.
- La clave que protege `/admin` **no es autenticación real**: viaja en cada
  petición y cualquiera que la conozca entra. Solo evita que alguien que adivine
  la URL lea los teléfonos por accidente.
- Sin `PANEL_CLAVE` o sin tienda de Blob conectada, el panel muestra un aviso
  claro y el catálogo público no se ve afectado en absoluto.
