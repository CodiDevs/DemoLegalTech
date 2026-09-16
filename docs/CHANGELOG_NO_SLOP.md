# Changelog de la limpieza anti-slop

Inventario de lo que cambió, archivo por archivo. El criterio, las causas y las decisiones deliberadas están en [`NO_SLOP.md`](NO_SLOP.md); acá está el detalle para revisar de un vistazo.

**Branch:** `No-Slop` · **Base:** `origin/main` (`7aadd83`)
**Volumen:** 75 archivos, +715 / −2488 (1773 líneas netas menos)
**Verificación:** `bun run build:frontend` limpio · `bun run test:frontend` 109 specs verdes
**Alcance:** solo `frontend/` y `docs/`. El backend no se tocó.

Para regenerar la lista de archivos:

```bash
git diff --stat origin/main..No-Slop
```

## Archivos eliminados

| Archivo | Líneas | Por qué |
|---|---|---|
| `pages/saas/landing-statistics.component.ts` | 180 | La tira de 3 métricas sintéticas (`"4 min"`, `"100%"`, `"50+"`). AGENTS §2 la prohíbe |
| `pages/saas/landing-statistics.component.spec.ts` | 67 | Spec del anterior |
| `pages/notary-panel/notary-panel.component.ts` | 217 | Sin ruta ni consumidor |
| `pages/product-intake/product-intake.component.ts` | 110 | Sin ruta ni consumidor (sus rutas son redirects) |
| `pages/landing/landing.component.ts` | 120 | Sin ruta ni consumidor ("Filtro inteligente", fondos `oklch`) |
| `pages/product-lite/product-lite-landing.component.ts` | 81 | Sin ruta ni consumidor ("Pagas una sola vez") |
| `pages/fase2/fase2-shell.component.ts` | 89 | Shell inalcanzable; su nav estaba duplicada del shell del abogado |
| `shared/mock-badge.component.ts` | 23 | Solo lo importaba el shell anterior |
| `shared/product-site-shell.component.ts` | 41 | Sin consumidor |
| `shared/metric-card.component.ts` | 43 | Sin consumidor |
| `shared/ui/shine-border.component.ts` | 84 | Sin consumidor (borde cónico animado) |
| `shared/ui/tilt-card.component.ts` | 122 | Sin consumidor (tilt 3D) |
| `shared/motion/route-curtain.component.ts` + spec | 42 + 121 | Su único consumidor era su propio spec |
| `shared/motion/cinematic-path.ts` + spec | 9 + 28 | Ídem |

## Archivos nuevos

| Archivo | Qué aporta |
|---|---|
| `shared/case-status.data.ts` | Fuente única de los 10 estados con cuatro vistas por audiencia (`short`, `clientHint`, `lawyerHint`, `filterLabel`) y helpers con fallback |
| `shared/case-status.data.spec.ts` | Guard: 10 claves sin huecos, vistas no vacías, sin jerga ni em-dash, filtro de 11 opciones |
| `pages/saas/slop-guard.spec.ts` | Renderiza las 4 landings y asserta ausencia de kickers, checks de garantía, códigos de expediente y em-dash |
| `docs/NO_SLOP.md` | Criterio, causas, decisiones y pendientes |
| `docs/CHANGELOG_NO_SLOP.md` | Este archivo |

## Marketing del camino cliente

| Archivo | Qué cambió |
|---|---|
| `pages/saas/saas-landing.component.ts` | Fuera los 6 eyebrows, los checkmarks del catálogo y de los planes, la métrica inventada `~14 días resolución`, el pill `·` del CTA y los campos muertos (`featuredProduct`, `sidePlans`, `enterprise`) |
| `pages/saas/saas-landing.data.ts` | Garantías genéricas reescritas (`SLA 99.9% y soporte 24/7` fuera), `LEGALSTATION_ENTERPRISE` borrado |
| `pages/saas/marketing-hero.component.ts` | Lede por defecto sin "biometría/cobro arancelario"; inputs muertos fuera; `transition: all` → propiedades explícitas |
| `pages/saas/station-preview.component.ts` | Códigos de expediente falsos fuera (`#LS-2026-0842`, `ACT-2026-...`), plazo inventado fuera, datos rotulados como de ejemplo |
| `pages/saas/divorcio-landing.component.ts` | La escena de evidencia deriva del `workflow` y del `price` reales; kickers de escena fuera; `$349` hardcodeado → `site.price` |
| `pages/saas/hero-scroll-video-pin-reveal.component.ts` | Tira de puntos del mock fuera, rótulo sin código falso |
| `pages/product-site/product-landing.component.ts` | Eyebrows, badge pill, sección de métricas, testimonios y CSS muerto de su revisión anterior (`.ps-timeline*`, `.ps-preview*`, `.ps-screen-tag`) fuera; kicker "Recomendado" fuera |
| `pages/product-site/product-questionnaire.component.ts` | Mismo rearme que el cuestionario de divorcio (folio, capas, hoja, botones) |
| `shared/product-sites.data.ts` | `stats` y `testimonials` fuera del modelo; H1 a 3-5 palabras; em-dash fuera; `alt` sin "DEMO"; copy de catálogo sin "inteligente"/"en vivo" |
| `shared/product-sites.data.spec.ts` | El guard de copy pasa de 5 campos de un producto a los 7 productos + catálogo, y suma `—`, `inteligente`, `en vivo`, `\bSLA\b`, `kanban`, `\bsync\b` |
| `shared/demo/demo-case-window.component.ts` | `Expediente LS-014` y `Estado 04 · minuta lista` fuera; sin tira de puntos |
| `public/demo-scenes/*.svg` (5) | Rótulo "DEMO" fuera: `DOCUMENTO FICTICIO`, `DE EJEMPLO`, `Firmante A/B`, `Expediente de ejemplo` |

## Cuestionario y flujo

| Archivo | Qué cambió |
|---|---|
| `pages/questionnaire/questionnaire.component.ts` | Folio vertical y hint redundante fuera; 7 de 10 capas del stage fuera; `pad()` muerto |
| `shared/product-flow-shell.component.ts` | Input `eyebrow` y su render fuera (dos eran el pill con `·`) |
| `pages/checkout/checkout.component.ts` | Subtítulo sin em-dash; overlay con token y sin `backdrop-filter` |
| `pages/upload/upload.component.ts` | Subtítulo sin em-dash; eyebrow fuera |
| `pages/sign/sign.component.ts` | `#faf7f0` → `--bg-subtle`; `border-left: 4px` fuera; overlay con token y sin blur; eyebrow fuera; CTA "Confirmar firma" |
| `shared/virtual-meeting.component.ts` | "Duración orientativa: 30 minutos" (inventada) fuera; pregunta retórica → imperativo; eyebrow fuera |
| `shared/meeting-scheduler.component.ts` | "espere el link" → "Recibirás el enlace…" |
| `shared/scheduled-meeting-card.component.ts` | Fallbacks de color a los valores reales del token |
| `shared/animated-ticket.component.ts` | Confeti: violeta `#8b5cf6` y rainbow → paleta de marca |
| `shared/confirm-dialog.component.ts` | Scrim `oklch` → `--overlay`; `background: white` → `--surface`; tokens heredados → canónicos |
| `pages/case-detail/case-detail.component.ts` | 5 `oklch()` + `white` + tokens viejos (`--line`/`--ink-soft`/`--ok`/`--bad`) → tokens de estado; separador `·` |
| `index.html` | Title y meta description sin em-dash, sin "100% virtuales" ni "al mismo costo" |
| `styles.scss` | Scrim del modal de citas a `--overlay` |

## Paneles y Fase 2

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `STAGE_HINT`/`STAGE_SHORT` locales fuera (ahora `case-status.data`); "timeline" → "línea de pasos"; `Etapa N — X` → `Etapa N: X` |
| `pages/client-panel/client-panel.component.spec.ts` | Expectations de la etiqueta de etapa actualizadas |
| `pages/client-panel/divorcio-steps.ts` | Em-dash fuera del hint |
| `pages/client-panel/product-expediente.component.ts` | Placeholder `'—'` → `'Sin indicar'` |
| `pages/lawyer-panel/lawyer-panel.component.ts` | `STAGE_HINT`/`STAGE_SHORT`/`STATUS_OPTIONS` locales fuera (ahora `case-status.data`); "SLA en riesgo" → "Fuera de plazo"; acento `border-left` → tinte |
| `pages/lawyer-panel/lawyer-shared.scss` | `inset 3px 0` como acento fuera |
| `pages/lawyer-case/lawyer-case.component.ts` | `STATE_KEYS` y `STATE_LABELS` locales fuera (ahora `case-status.data`); em-dash fuera; placeholders `Sin indicar`; separadores `·` |
| `pages/lawyer-services/lawyer-services-editor.component.ts` | "tipo workflow"/"zoom"/"Preview" → español; `backdrop-filter` fuera |
| `pages/lawyer-services/question-flow-graph.component.ts` | "Rueda = zoom" → "acercar"; em-dash fuera |
| `pages/fase2/admin/advanced-stats.component.ts` | Defaults fabricados fuera (`|| 21595`, `|| 94`, `|| 18.4`, `|| 14`, `|| 8`, `|| 64`) y el `SLA objetivo: ≤ 21 días`; sin API dice "Sin datos"; `'María Demo'` → nombre neutro; acentos `border-left` → tinte por severidad |
| `pages/fase2/ai-agent/ai-agent.component.ts` | Separadores `—` → `·` |
| `pages/fase2/b2b-billing/b2b-billing.component.ts` | "Pasarela B2B mock" → "Pasarela de prueba"; `oklch` → tokens |
| `pages/fase2/templates/templates.component.ts` | Em-dash fuera; tokens heredados → canónicos |
| `pages/fase2/mobile-note/mobile-note.component.ts` | "Push notifications"/"Offline"/"Canvas" → español; bezels del mock a tokens |
| `pages/not-found/not-found.component.ts` | `--brand` → `--primary` |

## Auth y chrome

| Archivo | Qué cambió |
|---|---|
| `pages/auth/auth-copy.data.ts` | "Bienvenido de nuevo" → "Inicia sesión"; "Acceso rápido (demo)" → "Cuentas de ejemplo"; hint corregido (estaba mal conjugado) |
| `pages/auth/auth-layout.component.ts` | Eyebrow `.al-visual-eye` fuera; línea de la portada reescrita |
| `pages/auth/auth-alert.component.ts` | `#2f7d51` → `#2b7749` (el token real) |
| `layout/shell.component.ts` | `backdrop-filter` fuera (header sólido) y sus `none` ya redundantes |
| `shared/ui/landing-faq.component.ts` | `border-left: 3px` de acento fuera |

## Estilos globales

| Archivo | Qué cambió |
|---|---|
| `styles/tokens.scss` | `--overlay`/`--overlay-strong` nuevos; `--shadow-md`/`--shadow-lg` de una capa; bloque de alias heredados borrado (13 alias + `--font-body`, todos sin consumidor); utilities muertas fuera (`.container-narrow`, `.btn-accent`, `.badge-demo`) |
| `styles/onboarding.scss` | Sistema fantasma `.ob-card` (21 reglas) fuera; reglas de veredicto portadas a `.ob-sheet`; sheen infinito del segmento fuera; efectos del botón Sí/No reducidos a uno; `.ob` de 32rem a 40rem/44rem |
| `styles/form-stage.scss` | De 10 capas a 3 (papel, una luz, renglones): fuera barrido, sello, viñeta y las 5 washes por categoría |
| `styles/cinematic.scss` | `#faf7f0` → `--bg-subtle`; hoja con `--radius-lg` y `--shadow-md`; `min-height` de la hoja a la mitad; pregunta y botones a escala legible; `max-width: 72rem` del formulario fuera; `.ob-counter` muerto fuera |
| `styles/landing-shared.scss` | `.lp-values`/`.lp-list-tt`/`.lp-cta-eyebrow`/`.lp-badge-*` fuera; kicker `.lp-plan-tag` fuera; tira de puntos del mock fuera |
| `shared/case-progress.component.ts` | `#2f7d51` → `#2b7749`; micro-etiquetas sin mayúsculas forzadas |

## Documentación

| Archivo | Qué cambió |
|---|---|
| `docs/DEMO_GOALS.md` | 3 entradas nuevas: marketing sin slop, cuestionario rearmado + resto, y el cierre (estados/paleta/muertos) |
| `docs/NO_SLOP.md` | Criterio, causas con evidencia de código, decisiones deliberadas, verificación y pendientes |

## Espacio y contrato visual

Pasada disparada por un reporte de uso real: la tarjeta "Te toca" de `Tus trámites` dejaba un hueco de 345px por lado.

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `.dossier` pasó a dos columnas con `justify-content: stretch`, que desactiva el centrado que aporta la hoja del navegador por ser un `<button>` con `display: grid`. El contenido pasó de arrancar en `x=444` a `x=329` (el borde del padding, 32px) y la CTA cierra en `x=1019` (el borde interno derecho); la tarjeta bajó de 301 a 210px de alto. El texto se agrupó en `.dossier-body` y el colapso a una columna quedó en `max-width: 720px`. Kicker "Te toca" fuera. |
| `pages/client-panel/client-divorcio-desk.component.ts` | Kicker del hero y del estado vacío fuera, con su regla CSS; el getter `stepKicker` quedó sin consumidor y se borró |
| `pages/client-panel/divorcio-steps.ts` | Campo `kicker` fuera de `productEmptyCopy` |
| `pages/saas/saas-landing.component.ts` | `.cta-text` con `flex: 1 1 24rem; min-width: 0`: los dos botones ya no caen a una segunda fila dejando 396px vacíos en la primera (el flexbox decide el salto de línea antes de encoger, así que el texto no cedía) |
| `styles/tokens.scss` | `::selection`, `caret-color` y `scrollbar-color` desde la paleta: eran las únicas superficies del navegador sin tematizar |
| `docs/NO_SLOP.md` | Sección con la causa medida en el DOM real, los arreglos, el método de auditoría y sus resultados |

Verificación: build limpio, 109/109 specs, y auditoría renderizada sobre `/cliente` (escritorio y móvil), `/` y `/productos/divorcio360`.

## Lienzo del workspace cliente

Pasada de estructura: el panel mostraba una sola columna angosta en un lienzo de 1216px, con 528px libres abajo.

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `.client-main` con lista + caso en paralelo (`.inbox-split` / `.inbox-list` / `.inbox-desk`): la lista a la izquierda en `minmax(18rem, 21rem)` y el desk a la derecha. El desk dejó de sustituir la lista; se reusa `activateCase` / `setProduct`. Abajo de 1100px la lista se oculta y el caso toma la pantalla (el comportamiento de móvil de hoy). Las adaptaciones de tarjeta y fila del archivo pasaron de `@media` de viewport a `@container` del propio contenedor (`.dossier-stack` / `.archive`), con la contención en `.inbox-desk`. |
| `pages/client-panel/client-divorcio-desk.component.ts` | Cabecera del trámite con el estado al extremo derecho de la fila del título (`@container (min-width: 34rem)`) y la fila de firma cerrando contra el borde derecho. La contención va en `.inbox-desk` (el envoltorio que define la columna), no en `:host`. |
| `docs/design.md` | Reglas durables: lista + caso en paralelo, componentes que responden a su contenedor, y qué aire es deliberado. |
| `docs/NO_SLOP.md` | Diagnóstico medido, cambios, la falsa alarma del arnés de captura, la tabla de la auditoría de tinta y lo que se decide no tocar con su razón. |

Verificación: build limpio, 109/109 specs, y auditoría de tinta contra caja con 0 hallazgos en `/cliente`, `/`, `/productos/divorcio360`, `/cuestionario`, `/abogado` y `/abogado/caso/2`.

## Ficha del expediente en el panel del cliente

El ancho ya estaba repartido; faltaba el alto. Se llenó con datos reales que el cliente no veía en ninguna otra parte del panel.

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-divorcio-desk.component.ts` | Ficha del expediente bajo el paso actual: **historial** (últimos 5 eventos con fecha, en el vocabulario de la app vía `caseShort`), **documentos** con estado de revisión y motivo de rechazo, y **expediente** (abierto el, minuta, notaría, comparecencia). Guarda `events` del detalle que ya pedía al refrescar, así que firmar o subir un documento actualiza el historial sin una petición extra. Los badges de documento se comparten entre los casilleros del paso y la ficha. |
| `pages/client-panel/client-panel.component.ts` | Línea de pasos en cada tarjeta con el estado real de los 5 pasos (`buildProductSteps`), ancho explícito porque el cuerpo de la tarjeta no estira a sus hijos, y etiqueta accesible "Paso N de 5". |
| `docs/design.md` | Regla durable: la ficha del expediente y su reparto por contenedor (48rem). |
| `docs/NO_SLOP.md` | Criterio de datos reales, cambios, las dos rondas perdidas y lo que se decide no mostrar con su razón. |

Verificación: build limpio, 109/109 specs, y auditoría de tinta con 0 hallazgos en `/cliente` (con el trámite abierto), `/` y `/abogado`.

## Grilla del panel y paso documentos en dos columnas

El ancho ya estaba repartido; lo que sobraba era la mitad derecha al bajar por varios expedientes, y el medio del paso documentos.

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `.inbox-split` reemplazado por `.inbox-cases` con `.dossier-grid` (dos columnas desde 1101px): el expediente abierto cruza las dos con el trámite dentro (`.dossier-cell.is-open` + `.desk-shell`). `actionInView` ordena por urgencia. Helpers `openCaseId` y `openCaseInView` (el desk se renderiza suelto si el filtro dejó al caso abierto fuera de las dos listas). Fuera el `@media (max-width: 1100px)` que escondía la lista: en móvil el toque expande donde está el dedo. |
| `pages/client-panel/client-divorcio-desk.component.ts` | Paso documentos en dos columnas (`.desk-uploads` + `.desk-docstate`), `docState` por casillero con fecha y peso, `fileSize()`, y `embedded` (sin hero, sin marcos internos) para vivir dentro de la tarjeta extendida. Fuera `docRows`, `slotBadgeLabel`/`slotBadgeClass` y el selector `.desk-file`, que quedaron sin uso. |
| `pages/client-panel/divorcio-steps.ts` | `caseUrgency()` exportada; `pickProductCase` la usa en lugar de su `rank` interno. |
| `pages/client-panel/client-panel.component.spec.ts` | El orden esperado de `actionInView` pasa a ser por urgencia, y un test nuevo fija que el más urgente encabece la lista y sea el caso abierto. |
| `docs/design.md` | Reglas durables de la grilla, del cuerpo embebido, del paso documentos y del orden por urgencia. |
| `docs/NO_SLOP.md` | Diagnóstico, cambios, lo descartado con su razón, y la trampa del arnés. |

Verificación: build limpio, 110/110 specs, capturas de escritorio (abierto y paso documentos) y móvil, y auditoría de tinta con 0 hallazgos en `/cliente` (paso documentos), `/` y `/abogado`.

## Tarjetas parejas y última línea completa

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | Fuera `[class.is-hero]` y las reglas `.dossier.is-hero` / `.dossier:not(.is-hero)` y `.dossier:not(.is-hero) .dossier-body` / `.dossier-title`, que daban más padding a la primera tarjeta y menos a todas las demás. `.dossier-grid` pasa de grid a `flex-wrap` (base `calc(50% - gap/2)`, `flex-basis: 100%` en el abierto): una tarjeta sola llena su línea. La celda abierta pierde la sombra duplicada sobre el borde tintado. |
| `docs/design.md` | Las tarjetas van de a dos en flex, parejas, y la línea se llena siempre; el énfasis es el expediente abierto. |
| `docs/NO_SLOP.md` | Causa medida de los dos síntomas, el cambio con las líneas medidas y por qué flex y no grid. |

Verificación: reproducido con 6 expedientes (insertados y borrados como dato), build limpio, 110/110 specs, líneas medidas a 1216px = el lienzo completo, capturas de escritorio y móvil, y la base de vuelta en un solo caso.

## Tarjetas del mismo alto y datos en la cabecera del abierto

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `min-height: 12.5rem` en las tarjetas de la lista (todas a 200px exactos). Fila de datos en la cabecera del abierto entre la pista y la línea de pasos (`caseFacts`: apertura, minuta, notaría, comparecencia) con `justify-self: stretch` y reparto del ancho. |
| `pages/client-panel/client-divorcio-desk.component.ts` | Fuera el bloque Expediente de la ficha, sus cuatro getters (`openedLine`, `minutaLine`, `notaryLine`, `appointmentLine`), su `dateLong` privado y las cuatro reglas CSS de `.ficha-rows`, que quedaron sin uso. |
| `pages/client-panel/divorcio-steps.ts` | `formatDateLong()` compartida, que reemplaza el `dateLong` privado del desk. |
| `docs/design.md` | Reglas durables: todas las tarjetas del mismo alto, y los datos del expediente en la cabecera del abierto. |
| `docs/NO_SLOP.md` | Diagnóstico medido (197 vs 165px de alto, ~500px vacíos en la cabecera), cambios y la limpieza que arrastraron. |

Verificación: build limpio, 110/110 specs, tres tarjetas medidas a 200px, la sola ocupando la línea completa (1216px), la fila de datos a 1188px repartida, capturas de escritorio y móvil, y la base de vuelta en un solo caso.

## Línea de pasos y especificaciones en las tarjetas

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | La línea de pasos cruza el ancho del cuerpo en las tarjetas (`max-width: none`). Especificaciones debajo de la barra (`tileSpecs`: documento del paso de documentos y fecha de apertura), solo en las tarjetas. El `space-between` de la fila de datos pasa a arrancar a los 34rem de contenedor. |
| `pages/client-panel/divorcio-steps.ts` | `formatDateShort()` compartida, que reemplaza la copia privada del desk. |
| `docs/design.md` | Especificaciones de la tarjeta de la lista: qué son, dónde van y por qué no las lleva el abierto. |
| `docs/NO_SLOP.md` | Diagnóstico medido (barra de 352px en un cuerpo de 602) y los cambios. |

Verificación: barra medida a 389px en tarjetas de 602 y a 1003 en la que ocupa la línea entera, especificaciones presentes solo en las tarjetas, build limpio y 110/110 specs.

## La tarjeta impar completa la línea

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `flex: 1 1 calc(50% - gap/2)` en las tarjetas: con dos quedan parejas y la que cae sola en una línea impar se estira hasta completar el ancho que ocuparían las demás. Sin `justify-content: center`, y el `min-height` que iguala las alturas se mantiene. |
| `docs/design.md` | La regla: dos parejas, impar completa. |
| `docs/NO_SLOP.md` | La regla final, la vuelta atrás y la diferencia entre el ancho de la impar y la altura de la fila. |

Verificación: `flex-grow=1` y `justify=normal` medidos en el render, líneas que suman 1216px = el ancho del lienzo en la medición del séptimo paso, build limpio y 110/110 specs.

## Todas las tarjetas del mismo alto

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | La pista reserva dos líneas en las tarjetas de la lista (`min-height: 2lh`): el `min-height` de la tarjeta es un piso y no igualaba la pista corta con la larga. |
| `docs/design.md` | La regla completa: piso de altura más reserva de dos líneas en la pista. |
| `docs/NO_SLOP.md` | Diagnóstico medido en el filtro "Todos" (pistas mixtas) y la verificación. |

Verificación: `alturas distintas: 1 -> 236px x5` con pistas de una y dos líneas, barrido a 1560px, build limpio, 110/110 specs y la base de vuelta en un solo caso.

## Todas las tarjetas del mismo ancho

| Archivo | Qué cambió |
|---|---|
| `pages/client-panel/client-panel.component.ts` | `flex: 0 1 calc(50% - gap/2)` en las tarjetas: ninguna se estira, tampoco la que cae sola en una línea impar, que queda en su columna alineada con las de arriba. Sin `justify-content`. El `min-height` y la reserva de dos líneas de la pista se mantienen. |
| `docs/design.md` | La regla final: todas del mismo tamaño, la impar en su columna. |
| `docs/NO_SLOP.md` | El cierre del ida y vuelta de las pasadas 7, 10 y 11, y la lección. |

Verificación: `grow=0`, `justify=normal` y pista de dos líneas medidos en el render, alturas iguales de 236px con pistas mixtas (medición de la pasada anterior, mismo CSS de alturas), build limpio y 110/110 specs.

## El cuestionario como folio (Divorcio360)

| Archivo | Qué cambió |
|---|---|
| `pages/questionnaire/questionnaire.component.ts` | La marca del folio en el template (`ob-folio`: número tabular, sección y el icono mudado a esa línea), el sello (`ob-stamp`) en la opción elegida, y los getters `folioMark` y `categoryLabel`. Salen la etiqueta "Paso N de M" y el chevron de las opciones. |
| `styles/onboarding.scss` | Bloque `.landing-page.product-flow.theme-divorcio`: escala de pregunta, pista en voz baja, marca del folio y sello. El sistema `.ob-*` compartido no se toca. |
| `styles/form-stage.scss` | El renglón y las fibras con más presencia, solo bajo `body.divorcio-flow-mode`. |
| `docs/design.md` | Sección nueva: la estructura del cuestionario como folio, con su alcance. |
| `docs/NO_SLOP.md` | Diagnóstico, cambios, alcance y verificación de la pasada. |

Verificación: 123/123 specs, capturas de escritorio y móvil de las tres pantallas del formulario, y el cuestionario de Traslado360 sin cambios como control del alcance.

## Auditoría técnica del formulario y sus arreglos

| Archivo | Qué cambió |
|---|---|
| `pages/questionnaire/questionnaire.component.ts` | Las opciones pasan a `radiogroup`/`radio` con `aria-checked` y manejo de flechas (`onChoiceKey`); el progreso pasa de botones deshabilitados a una lista con botones solo en los pasos respondidos y `aria-current` en el actual; `progressLabel` reemplaza el nombre accesible viejo; sale `data-cat`. |
| `styles/onboarding.scss` | `.ob-segments` como lista real, `.ob-seg` a 44px, botón `.ob-seg-hit` para el paso navegable con su anillo de foco, y fuera la regla `.ob-seg:disabled` que quedó sin uso. |
| `styles/form-stage.scss` | Los dos `text-shadow` de `#fff` pasan a `var(--surface)`. |
| `docs/design.md` | La semántica de la pregunta y del progreso, con su alcance. |
| `docs/NO_SLOP.md` | La auditoría (17/20, detector en cero), los arreglos, lo descartado con su razón y la verificación. |

Verificación: 131/131 specs, detector de la skill en `[]`, camino completo hasta el paso 12 con el foco moviéndose por flechas, pasos a 44px y select a 16px.

## La barra de progreso vuelve a marcar el paso actual

| Archivo | Qué cambió |
|---|---|
| `pages/questionnaire/questionnaire.component.ts` | La barra es hija directa del item en todos los estados, con `[class.is-filled]="i + 1 <= position"`; el botón del paso respondido queda superpuesto y vacío. |
| `styles/onboarding.scss` | `.ob-seg-hit` pasa a `position: absolute` (envolver la barra la colapsaba a 0×0) y la tinta se marca en la barra (`.ob-seg-bar.is-filled::after`), porque el estado del item perdía la cascada y el paso actual quedaba sin llenar. Sale la regla vieja de `.is-done`/`.is-current`. |
| `docs/design.md` | La regla de la tinta del progreso y por qué vive en la barra. |
| `docs/NO_SLOP.md` | Los dos defectos propios, con la medición antes y después, y la lección. |

Verificación: medido antes `0x0` y `matrix(0,0,0,1,0,0)` en el paso actual; después la captura del paso 2 muestra los pasos 1 y 2 con tinta y el resto vacíos. 131/131 specs y detector en `[]`.

## El formulario rehecho: el folio y los sellos

| Archivo | Qué cambió |
|---|---|
| `pages/questionnaire/questionnaire.component.ts` | La marca queda en el nombre de la sección, en minúscula y sin número ni icono; sale el getter `folioMark` y los iconos de check de las opciones. El resto del template (la ramificación, la ubicación, la revisión, el veredicto) no cambia de estructura. |
| `styles/onboarding.scss` | La hoja pierde fondo, borde, radio y sombra: el formulario va sobre el folio, sin tarjeta. La pregunta sube a `clamp(2.1rem, 5vw, 4rem)`. Las opciones pasan a sellos: borde hairline al 20%, etiqueta en Fraunces al centro, inclinaciones distintas, y entintado al elegir. Salen las reglas `.ob-stamp`. |
| `docs/design.md` | El folio sin tarjeta, la sección en voz baja y la respuesta como sello. |
| `docs/NO_SLOP.md` | El plan con tokens, tipos y disposición, la revisión contra el brief, el cambio y la verificación. |

Verificación: 131/131 specs, capturas de escritorio y móvil con el sello centrado, el par legible y la barra marcando el paso actual.
