# Catálogo Digital QR — Grupo San Luis

Catálogo móvil para el stand de exposición. Entra por QR, busca, filtra,
consulta producto y escribe por WhatsApp. **Sin registro, sin login, sin carrito.**

## Estado actual

**Entrega final.** Arquitectura **100 % estática**: sin backend, sin API, sin base de
datos externa, sin Vercel Functions, sin analítica y sin autenticación.

| Área | Estado | Nota |
|---|---|---|
| Andamiaje + tokens | ✅ | Vite 7 + React 19 + TS + Tailwind 4, Rubik auto-hospedada |
| Catálogo público | ✅ | 217 productos reales, orden de secciones idéntico al Stitch |
| Búsqueda + filtros | ✅ | 6 campos indexados, conteos derivados de los datos |
| Detalle de producto | ✅ | Bottom sheet + deep link `#p/<id>` |
| WhatsApp | ✅ | Todo desde config, cero números literales en componentes |
| Panel `/admin` | ✅ | Solo lectura, visual, sin login y sin backend |
| Analítica | ✅ | **No existe** (fuera de alcance deliberadamente) |
| Backend / BD / API | ✅ | **No existen** (fuera de alcance deliberadamente) |

## Comandos

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build -> dist/
npm run preview    # sirve dist/ localmente
npm run check:ssr  # humo: render en Node + busquedas verificadas
```

## Despliegue en Vercel

No hay que configurar **ninguna** variable ni secreto.

1. Subir el repo a GitHub.
2. Importarlo en Vercel con framework **Vite**.
3. Build command `npm run build`, output `dist`.
4. `vercel.json` ya trae el rewrite de SPA (todas las rutas → `index.html`) y las
   cabeceras de caché.

## Estructura

```
catalogo/            ← assets originales (NO se tocan). Copia servida en public/catalogo/
code.html            ← referencia Stitch (NO es el código de la app)
DESIGN.md            ← design system
screen.png           ← referencia visual
vercel.json          ← rewrites de SPA + caché + cabeceras de seguridad

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
| `SITE.whatsappE164` | `582510000000` | **Número de ejemplo. No confirmado.** |
| `SITE.telefono` | `+58 (251) 000-0000` | Ejemplo |
| `SITE.email` | `comercial@gruposanluis.com` | Del sitio institucional |
| `SITE.eventoAnio` | `2025` | Confirmar año real |
| `SITE.redes[1..3].href` | Instagram `@gruposanluis.ve`, LinkedIn y YouTube sin URL | Instagram parcial; los otros dos son `#` |
| `SITE.hero[0].valor` | `+1.200` Referencias | Afirmación comercial del cliente |

En desarrollo la consola lista estos campos al cargar.

## Añadir o cambiar productos

Editar `src/data/productos.json` y volver a desplegar. No hay otra fuente de datos.

Agregar una categoría: una entrada en `CATEGORIAS` (`catalog.config.ts`) más el
`categoria` correspondiente en las fichas.

## Privacidad

Catálogo público: sin cookies de terceros, sin fingerprinting, sin analítica,
sin Google Fonts ni ningún otro CDN externo.

## Panel administrativo

`/admin` — herramienta visual interna de **solo lectura**, ruta separada y cargada
bajo demanda, **sin ningún enlace, botón ni menú público que la mencione**, y
bloqueada en `robots.txt`.

Muestra: total de productos, desglose por categoría y por marca, productos sin
descripción / sin imagen, códigos repetidos, la configuración comercial vigente
(WhatsApp, evento, redes) y los valores provisionales.

**No tiene servidor, base de datos ni login, y no lo pretende.** No es un sistema
de seguridad ni un CMS: es una consulta del propio frontend sobre
`src/data/productos.json`. Para editar productos se modifica ese archivo y se
vuelve a desplegar.