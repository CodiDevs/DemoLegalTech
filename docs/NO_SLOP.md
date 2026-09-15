# Anti-slop en LegalStation

Registro de la limpieza de patrones de "AI slop" en el frontend. Dos slices, ambos sobre `frontend/` únicamente: el backend nunca se tocó.

## Qué cuenta como slop acá

El repo ya tenía el contrato escrito antes de esta limpieza:

- **`AGENTS.md` §1** — H1 de 3 a 5 palabras en Fraunces; sin lenguaje inflado; rótulo "de ejemplo"/"ficticio" en lugar de "DEMO".
- **`AGENTS.md` §2** — prohibidos: pills con punto parpadeante, tiras de 3 métricas sintéticas, listas de garantías con checkmarks, barras de telemetría con códigos de expediente, retículas sci-fi.
- **`AGENTS.md` §3-§4** — teal `#2f6f68` como único acento, superficies mate, motion always-on.
- **`docs/design.md`** — tokens como fuente única: `tokens.scss`, radio `--radius-lg`, sombras de una capa, Fraunces solo en H1 y wordmark.

A eso se sumó el criterio de la skill **no-ai-slop**: em-dash como muleta retórica, inglés filtrado en copy español, preguntas retóricas, métricas y testimonios inventados, KPIs que parecen datos reales sin serlo.

## Slice 1 — Marketing del camino cliente

Superficies: `/`, `/productos/divorcio360`, `/productos/traslado360`, `/productos/bienraiz360`, cuestionarios.

**Eliminado**
- `LandingStatisticsComponent` completo y el campo `stats` del modelo de producto (la tira de 3 métricas sintéticas: `"4 min"`, `"2"`, `"Virtual"`, `"50+"`, `"100%"`).
- Checkmarks de garantías en el catálogo y en los planes de licencia; `.lp-plan li::before` y `.lp-list-check` fuera del CSS global.
- Testimonios fabricados (`'Ana R.'`, `'María V.'`, `'Bufete Ruiz'`, `'Vega & Asociados'`) y el campo `testimonials`.
- Códigos de expediente falsos: `#LS-2026-0842`, `ACT-2026-170130-00412`, `Expediente LS-014`, `Estado 04 · minuta lista`.
- Eyebrows y kickers (`.section-kicker`, `.lp-eyebrow`, `.lp-cta-eyebrow`, `.cine-kicker` de escena) y el pill `Un solo pago · sin cuotas mensuales`.
- El rótulo **"DEMO"** en los 5 SVG de `public/demo-scenes/` (ahora `DOCUMENTO FICTICIO`, `DE EJEMPLO`, `Firmante A/B`, `Expediente de ejemplo`). Esto cerró el intento del 2026-09-13, que solo había cubierto el mock del home.
- Métricas inventadas `~14 días resolución` y `Plazo estimado · 14 días`.
- Campos muertos: `featuredProduct`, `supportingProducts`, `featuredPlan`, `sidePlans`, `enterprise`, `LEGALSTATION_ENTERPRISE`, e inputs sin uso del hero.

**Copy**
- H1 a 3-5 palabras: `Divorcio por mutuo acuerdo.`, `Traslado vehicular sin filas.`, `Traslado de inmueble sin gravámenes.`
- Em-dash fuera del copy corto (ledes, precio del cuestionario, barras de mock, opciones de cuestionario).
- Slogan canónico sin la tautología "sin filas ni trámites" ni "al mismo costo" (que el propio test ya vetaba).
- "inteligente" y "en vivo" fuera del catálogo; `alt` de galería sin "DEMO"; `SLA 99.9% y soporte 24/7` reescrito.

**Guards**
- `product-sites.data.spec.ts`: recorre los 7 productos y el catálogo, y suma `—`, `inteligente`, `en vivo`, `\bSLA\b`, `kanban`, `\bsync\b`.
- `pages/saas/slop-guard.spec.ts` (nuevo): renderiza las 4 landings y asserta ausencia de kickers, checks de garantía, códigos de expediente y em-dash.

## Slice 2 — Cuestionario y resto del frontend

### El cuestionario estaba roto, no solo feo

La primera pantalla del cliente mostraba: un folio vertical gigante "01 / 09" en Fraunces rotado, una hoja de 608px de alto con el contenido centrado y ~300px de vacío arriba y abajo, y un documento SVG al 16% más un sello de agua **desbordándose** por detrás con la leyenda "EJEMPLO / DOCUMENTO FICTICIO · NO OFICIAL".

Causas encontradas leyendo el código, no adivinando:

1. **Dos sistemas compitiendo.** `styles/onboarding.scss` dedicaba 21 reglas a `.ob-card`, un componente que **ningún template usa**: los cuestionarios usan `.ob-sheet`, estilado en `styles/cinematic.scss`. Media hoja de estilos era un sistema fantasma. Peor: las reglas de veredicto (`is-apto`, `is-evaluacion`, `is-no_aplica`) apuntaban a `.ob-card`, así que el borde de color del resultado nunca se aplicaba.
2. **`.ob-sheet-slot` no existía en ningún CSS** (solo en los templates).
3. **`/* Questionnaire monument */ .theme-divorcio .ob { max-width: 72rem }`** — un formulario de una sola pregunta a 1152px de ancho, de donde salían las bandas vacías.
4. **Diez capas decorativas** detrás de una pregunta (fibras, 2 glows, barrido, renglones, sello, 5 "washes" por categoría, viñeta).

**Cambios**
- Stage de 10 capas a 3: papel, una luz y los renglones del folio. Fuera barrido, sello, viñeta y las 5 washes con su `[data-cat]`.
- Fuera el folio vertical y el hint "Toca un paso anterior para volver": queda una sola lectura de progreso (barra segmentada + "Paso N de M").
- La hoja: `background: var(--bg)`, `border-radius: var(--radius-lg)`, `box-shadow: var(--shadow-md)` de una capa (antes radio 3px + pila de papel con offset duro de 18px + sheen).
- `min-height` de la hoja de `min(70vh, 38rem)` a `min(46vh, 24rem)`; el bloque se centra en el viewport.
- Botones Sí/No: de 120px de alto y 1.85rem a 4.5rem y `--text-lg`, con un solo estado (borde + fondo). Fuera el barrido de gradiente con `clip-path`, el `translateX(6px)` al hover y el anillo-sello.
- Pregunta a `clamp(1.6rem, 3.2vw, 2.3rem)` (antes hasta 3.6rem).
- `.ob` pasa de `max-width: 32rem`/72rem a 40rem (44rem en pantallas grandes): una sola fuente de ancho.
- Borrado el sistema `.ob-card` fantasma y `.ob-card-slot`; las reglas de veredicto se portaron a `.ob-sheet`.
- Mismo tratamiento en el cuestionario de producto (`product-questionnaire`), que compartía todo el problema.

### Resto del frontend

- **KPIs de Fase 2** (`advanced-stats`): fuera los defaults fabricados que se mostraban como ingresos reales del bufete — `|| 21595`, `|| 94`, `|| 1280`, `|| 14`, `|| 18.4`, `|| 8`, `|| 64` — y el `SLA objetivo: ≤ 21 días` inventado. Ahora, sin respuesta de la API, la tarjeta dice "Sin datos" en vez de un número falso. `'María Demo'` → `'María Salazar'`, `'Cliente demo'` → `'Sin nombre'`, `'Mes en curso · Septiembre 2026'` → `'Mes en curso'`.
- **Eyebrows del flujo**: se quitó el input `eyebrow` de `product-flow-shell` y de sus 5 llamadas vivas (checkout, upload, firma, expediente, consulta). Dos eran literalmente el pill con `·` que `AGENTS.md` §2 prohíbe: `"Pago seguro · Payphone"` y `"{producto} · Carga documental"`.
- **Auth**: `Bienvenido de nuevo` → `Inicia sesión`; `Acceso rápido (demo)` → `Cuentas de ejemplo`; hint reescrito (además estaba mal conjugado: "Rellenan" sin sujeto); eyebrow `.al-visual-eye` eliminado; "Tus trámites, sin filas, ni papeleo" → "Tus trámites, sin salir de casa".
- **`index.html`**: title y meta description sin em-dash, sin "100% virtuales" y sin "al mismo costo".
- **Inglés fuera del copy español**: `timeline` → "línea de pasos", `SLA en riesgo` → "Fuera de plazo", `tipo workflow` → "tipo flujo", `zoom` → "acercar", `Ver Preview` → "Ver vista previa", `Push notifications` → "Notificaciones push", `Offline` → "Sin conexión", `Canvas mock`/`Canvas firma` → "Firma en pantalla", `Pasarela B2B mock` → "Pasarela de prueba".
- **Em-dash fuera del copy**: subtítulos de checkout y upload, separador de documento en el expediente, mensajes de servicios y plantillas de Fase 2.
- **Copy inventado**: "Duración orientativa: 30 minutos" → "Duración a coordinar con tu abogado"; "...espere el link de la reunión" → "Recibirás el enlace de la reunión por correo"; la pregunta retórica "¿Listo para hablar con tu abogado?" → "Habla con tu abogado por videollamada".

## Decisiones deliberadas

- **Motion always-on.** `demo-motion.mdc` prohíbe `prefers-reduced-motion` y prohíbe el nuke global de duraciones. La skill anti-slop lo marca como falla P0 de accesibilidad, pero el brief del repo gana: no se atenuó nada.
- **Glows de `form-stage` en las landings.** `AGENTS.md` §3 los permite como iluminación natural sobre papel. Se reducen solo en el cuestionario, donde competían con la pregunta.
- **Se conserva** el wordmark Fraunces del hero de Divorcio, las etiquetas "Cliente"/"Abogado" de la escena comparativa, `--info` azul (color de estado), las marcas Mastercard, la palabra "demostración" en prosa y el `·` como separador tipográfico en líneas descriptivas.
- **Disclaimers obligatorios intactos**: "Payphone demo/mock", página legal, "no enviamos correo real", `Fase 2 · Vista previa`.
- **`'Evaluar mi caso'` repetido** en la landing de producto: `PRODUCT.md` fija esa etiqueta como única acción primaria de invitado.

## Verificación

```bash
bun install --cwd frontend          # deps
bun run build:frontend              # compila (2 warnings NG8107 preexistentes en fase2/ai-agent)
bun run test:frontend               # 111 specs, todas verdes
```

Si Chrome no está instalado, Karma falla con `Cannot start ChromeHeadless`. Se resuelve apuntando a Edge:

```powershell
$env:CHROME_BIN = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
bun run test:frontend
```

Inspección visual: `bun run dev:frontend` y capturas de `/`, `/productos/divorcio360`, `/productos/traslado360`, `/productos/bienraiz360` y `/cuestionario` en 1440×900.

**Ojo con las capturas headless:** en Windows, Edge impone un ancho de layout mínimo (~500px) aunque el PNG salga del tamaño pedido. A 390px la imagen aparece recortada a la derecha; no es un bug de CSS. La prueba: a 430px el botón "Ingresar" (alineado a la derecha) se ve completo sin que el layout se reacomode.

## Cierre (segunda pasada)

Build y tests en verde después de cada paso.

**Estados unificados.** Seis definiciones y cuatro vocabularios para los mismos 10 estados pasaron a `shared/case-status.data.ts`: una entrada por estado con cuatro vistas (`short`, `clientHint`, `lawyerHint`, `filterLabel`) y helpers con fallback. `client-panel`, `lawyer-panel` y `lawyer-case` la consumen y se borraron sus consts locales. El estado 04 ya no se llama `Minuta` / `Docs preparados` / `Documentos preparados` según la pantalla. También se unificó la lista de códigos: `lawyer-case` tenía su propio `STATE_KEYS` además del `CASE_STATUS_KEYS` del modelo. Guard nuevo: `case-status.data.spec.ts` (10 claves sin huecos, cuatro vistas no vacías, sin jerga ni em-dash).

**Paleta a tokens.**
- `tokens.scss` sumó `--overlay` y `--overlay-strong` (tinta neutra `27 25 23`) y colapsó `--shadow-md`/`--shadow-lg` a una capa.
- Fuera los scrims azulados `oklch(... 230)` de `styles.scss`, `confirm-dialog`, `b2b-billing`, `templates`, `checkout` y `sign`.
- `case-detail` (el peor: 5 `oklch` a mano, `background: white` y los tokens viejos `--line`/`--ink-soft`/`--ok`/`--bad`) migrado a `--info-subtle`, `--warning-subtle`, `--success-subtle`, `--danger-subtle` y sus pares.
- Los dos verdes conviviendo: `#2f7d51` → `#2b7749` en `case-progress` y `auth-alert` (el token es `#2b7749`).
- `#faf7f0` ×6 → `var(--bg-subtle)` en `sign` y `cinematic.scss`.
- Confeti del recibo: violeta `#8b5cf6` y rainbow → paleta de marca.
- Bezel del mock de móvil, outline verde de B2B y fallbacks de `scheduled-meeting-card` a tokens.

**Tells de UI.**
- `backdrop-filter` fuera en los cuatro lugares: header del shell, overlays de checkout y firma, editor de servicios.
- Los seis `border-left`/`inset` de 3-4px como acento pasaron a tinte de fondo o badge (`advanced-stats` por severidad, `lawyer-panel`, `lawyer-shared`, `sign`, `landing-faq`).
- Borrado el sheen infinito del segmento activo (`ob-seg-sheen`), que había sobrevivido a la limpieza del cuestionario.

**Código muerto.** Borrados 11 componentes sin consumidor y sus carpetas: `product-site-shell`, `ui/shine-border`, `ui/tilt-card`, `metric-card`, `mock-badge`, `fase2-shell`, `pages/landing`, `pages/product-lite`, `pages/product-intake`, `pages/notary-panel`, `motion/route-curtain` y `motion/cinematic-path` (con sus dos specs). Más el CSS huérfano: `.lp-values`/`.lp-value`, `.lp-list-tt`, `.container-narrow`, `.btn-accent`, `.badge-demo`. Con las páginas muertas se fue su copy residual ("Filtro inteligente", "Pagas una sola vez", los em-dash de intake y notaría).

**Copy.** Em-dash fuera de `lawyer-case` (nota de firma), `divorcio-steps` y `question-flow-graph`; `Etapa 5 — Firma` → `Etapa 5: Firma` (con el spec actualizado); placeholders `'—'` → `'Sin indicar'`; separadores estructurales a `·`; `Rueda = zoom` → `Rueda = acercar`.

**Verificación:** `bun run build:frontend` limpio y `bun run test:frontend` 109/109 (baja de 116 porque se fueron los 7 specs de los componentes muertos).

## Pendiente

- **Overflow horizontal real por debajo de ~400px**: el corte de las capturas headless es un artefacto de Edge en Windows (impone un ancho de layout mínimo cercano a 500px y recorta el PNG). Falta medirlo en un dispositivo o DevTools reales para descartarlo del todo.
- **`Fase 2 · Vista previa`**: el badge vivía en `fase2-shell`, que era inalcanzable, así que las pantallas mock de Fase 2 no muestran hoy ninguna etiqueta de vista previa. Es decisión de producto, no de slop: si se quiere el rótulo, hay que montarlo en el shell que sí se usa.
- **No se tocó el backend**, por pedido explícito.
