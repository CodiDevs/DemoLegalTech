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
