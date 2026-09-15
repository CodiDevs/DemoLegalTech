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
bun run test:frontend               # 109 specs, todas verdes
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

## Tercera pasada — espacio y contrato visual (workspace)

Disparada por un reporte concreto del cliente: *"en Tus trámites hay un espacio ridículo donde dice Firma tu minuta"*.

### La causa, medida en el DOM real

El contenido de la tarjeta arrancaba en `x=444` cuando su caja empieza en `x=296` con 32px de padding: debía arrancar en 328. La medición de la app logueada (no de una maqueta) fue:

```
.dossier       x=296  w=756  padL=32  cols=459.266px  justI=start  display=grid
.dossier-hint  x=444  w=459.266  maxW=459.266px
.dossier-cta   x=444  w=139
```

**`.dossier` es un `<button>`.** El estilo del navegador para los controles de formulario centra su contenido, y como el componente le pone `display: grid`, eso entra como **`justify-content: center` sobre la columna**. La cuenta cierra exacta: 328 + (692 − 459) / 2 = 444. La columna mide solo los `52ch` del hint, así que el resto quedaba como hueco: **345px por lado** a 1560px de ancho, 116px a 1100px.

`justify-items: start` no lo evita: alinea los ítems **dentro** de la columna, no la columna dentro del contenedor. El CSS del proyecto nunca declara `justify-content` ahí: el valor lo aporta la hoja del navegador, y por eso no aparecía leyendo el componente.

Es una clase de bug, no un caso suelto: cualquier control de formulario al que este repo le ponga `display: grid`/`flex` y cuyos tracks no llenen el ancho queda flotando centrado.

### Cambios

- `justify-content: stretch` en `.dossier` para desactivar el centrado heredado.
- La tarjeta pasó a dos columnas (`minmax(0, 1fr) auto`, `align-items: center`): el texto a la izquierda y la CTA al extremo derecho, que es lo que el usuario eligió. El contenido ahora arranca en `x=329` (el borde del padding) y la CTA cierra en `x=1019` (el borde interno derecho). La tarjeta bajó de **301px a 210px** de alto.
- El texto se agrupó en `<div class="dossier-body">` para que la CTA no dependa de `grid-row: 1 / -1` sobre filas implícitas, que se rompe cuando cambia el número de líneas.
- Fuera el kicker **"Te toca"** de la tarjeta y los dos del desk (`Pago`/`Firma`… sobre un título que ya empieza con esa palabra). El craft floor los prohíbe explícitamente y el marketing ya los había perdido: el workspace era el último lugar donde quedaban. Con ellos se fue el campo `kicker` de `productEmptyCopy` y el getter `stepKicker`.
- **`cta-banner` del home**: sus dos hijos pedían 568 + 24 + ~452 = 1044px en una caja de 964, así que los botones caían a una segunda fila dejando **396px vacíos** en la primera. El flexbox decide el salto de línea **antes** de encoger, por eso el texto no cedía: `.cta-text` pasó a `flex: 1 1 24rem; min-width: 0`.
- **Superficies del navegador**: `::selection`, `caret-color` y `scrollbar-color` salen ahora de la paleta en `tokens.scss`. Eran las únicas piezas sin tematizar (el foco, el subrayado y el `accent-color` ya lo estaban).

### Cómo se encontró (y cómo revalidar)

Script de auditoría sobre el DOM renderizado: recorre los contenedores `grid`/`flex`, compara la unión de las cajas de sus hijos contra su caja de contenido y reporta el sobrante por lado con el selector y el `justify-content` computado. Sobre la app logueada (token inyectado en `index.html` un momento y restaurado después) y con un clic inyectado para abrir el desk, que de otro modo no se alcanza sin navegador.

Resultados después de los arreglos:

| Ruta | Hallazgos | Qué son |
| --- | --- | --- |
| `/cliente` @1560 | 0 | `overflow-x: 0px` |
| `/cliente` @492 | 1 | La CTA a todo el ancho con su etiqueta centrada, que es el layout móvil buscado |
| `/` @1560 | 5 | Cinco `justify-content: center` **autorados** (escenas del hero, etiquetas de botón) |
| `/productos/divorcio360` @1560 | 2 | Una caja de video centrada y la barra de título del mock |

Los cinco sospechosos que la misma auditoría descartó en el panel: `.archive-row`, `.side-item`, `.side-step`, `.seg-btn` y `.desk-file-btn` (llenan el ancho o centran a propósito).

### Observado y no tocado

Las tarjetas de paso del desk (`Sube la minuta firmada…` y las de pago y consulta) tienen la acción a la izquierda bajo el texto, con la mitad derecha libre. **No se reescribieron**: en una tarjeta de paso el aire alrededor de una acción alineada a la izquierda es layout de tarjeta, no una caja vacía como la fila de lista del panel, donde el patrón correcto sí es "info a la izquierda, acción a la derecha". Queda como decisión de diseño si se quiere replicar ahí el patrón del panel.

## Cuarta pasada — el lienzo del workspace cliente

Pedido: *"corrige el tema de espacio, queda muy amplio sin usar, por ejemplo el panel de trámite"*.

### Diagnóstico

No era un margen mal puesto: era estructura. En 1560x1000 el panel mostraba una sola columna angosta dentro de un lienzo de 1216px. La última tarjeta terminaba en y≈472: **528px (53% del alto) vacíos**, con el ancho del lienzo desaprovechado. El desk del trámite reemplazaba la lista (intercambio de pantalla completa) y sus tarjetas de paso ponían la acción a la izquierda dejando media tarjeta libre.

### Cambios

- **Lista + caso en paralelo.** `.client-main` pasa a grilla de dos columnas cuando el producto abierto tiene expedientes: la lista a la izquierda (`minmax(18rem, 21rem)`) y el desk a la derecha (`1fr`). Se reusa la selección que ya existía (`activateCase` / `setProduct`): el desk dejó de sustituir la lista. Medido: `.inbox-split w=1216`, lista 336, desk 848.
- **La vista de archivo** se queda a todo el ancho cuando el producto no tiene expedientes: es una tabla de 5 columnas y en 320px no se lee.
- **Abajo de 1100px** el reparto no existe: el caso toma la pantalla y la barra lateral sigue siendo la vuelta, que es como funciona hoy en móvil. Sin dos columnas apretadas.
- **Consultas de contenedor.** La misma tarjeta de expediente vive en dos anchos (la lista a todo lo ancho y la columna de 20rem), así que su variante compacta depende de **su contenedor** y no del viewport: con un `@media` de pantalla, en la columna angosta quedaba apretada aunque la ventana fuera grande (el hint en seis líneas y la CTA apretada). Igual la fila del archivo y las tarjetas del desk.
- **Cabecera del trámite.** El estado (`Pagado · $349 · Etapa 4: Minuta`) al extremo derecho de la fila del título; antes el título quedaba solo contra un aire grande al lado.
- **Fila de firma.** Los dos botones cierran la tarjeta contra su borde derecho, donde antes quedaban pegados a la izquierda con ~330px libres al lado. Siguen midiendo 224px cada uno: eso ya se había validado y no se toca.

### La falsa alarma que costó una ronda

Dos capturas seguidas mostraron la columna derecha vacía y pareció que el desk no se montaba. El DOM medido decía lo contrario: `.inbox-desk w=848` y `app-client-divorcio-desk total=1`, con `cols=336px 848px`. Era el arnés de captura headless: bajo `--virtual-time-budget`, el clic inyectado y el momento de la captura son impredecibles, así que una corrida agarró la animación de entrada `desk-in` a mitad de camino (`opacity: 0`, `blur(6px)`) y otra hizo clic antes de que cargaran los expedientes. Para verificar layout con este arnés hay que neutralizar las animaciones o esperar de sobra; el motion de la app no se toca.

### Auditoría de tinta contra caja

Complemento del barrido anterior, que solo miraba cajas de hijos y por eso no veía los huecos internos: para cada superficie con fondo o borde visible compara la unión de los rectángulos de texto contra su caja de contenido y reporta las que queden por debajo del 70% con más de 150px libres a la derecha.

| Ruta | Hallazgos |
| --- | --- |
| `/cliente` con el trámite abierto | 0 |
| `/` | 0 |
| `/productos/divorcio360` | 0 |
| `/cuestionario` | 0 |
| `/abogado` | 0 |
| `/abogado/caso/2` | 0 |

### Lo que no se toca, con la razón

- **Marketing**: secciones capadas a 1120px dentro de un shell de 1280px. Es el ancho estándar de marketing, no un hueco.
- **Flujo cliente** (checkout, upload, firma): columna centrada de 44rem sobre el escenario cinematográfico. El aire lateral es el lenguaje del brief (`docs/design.md`).
- **Workspace abogado**: ya es denso y usa el ancho (`.case-row` con 6 columnas que llenan, `workspace-head` con `space-between`, `lawyer-case` con cuerpo más riel). La auditoría lo confirma.
- **El aire bajo la lista**: el demo tiene un expediente. La estructura ya usa el lienzo; llenarlo más sería inventar contenido.

## Quinta pasada — la ficha del expediente

Pedido: *"el panel donde está tus trámites sigue dejando demasiado espacio, podría agregarse algo más o cambiar la disposición"*.

El panel ya repartía el ancho (lista + caso en paralelo), pero el alto seguía sobrando: con un expediente, el contenido del desk terminaba en y≈390 de 1000.

### Criterio

Llenar con información **real** que el cliente no veía en ninguna otra parte del panel, sin inventar métricas. Se inventariaron primero los datos disponibles (endpoints del cliente, `backend/internal/cases`) y se descartó todo lo que no se puede mostrar sin tocar el backend.

### Cambios

- **Ficha del expediente en el desk** (`client-divorcio-desk.component.ts`): tres bloques bajo el paso actual, en fila cuando el contenedor llega a 48rem y apilados si no.
  - **Historial**: los últimos 5 eventos con su fecha (`GET /cases/{id}` → `events[]`), en el vocabulario de la app (`caseShort`) y no en el `note` del servidor.
  - **Documentos**: los archivos cargados con su estado de revisión (`GET /cases/{id}/documents`, que el desk ya pedía y solo usaba para los casilleros del paso Documentos). Se omite en ese paso para no repetir los mismos archivos dos veces.
  - **Expediente**: abierto el, minuta, notaría y comparecencia (`created_at`, `has_minuta`, `notary_name`, `appointment_at`). Ninguno se repite con lo que ya muestra la cabecera.
- **Una sola petición por acción**: `refreshCase()` ya traía el detalle completo y descartaba `events`; ahora los guarda, así que firmar o subir un documento actualiza el historial sin pedir de nuevo.
- **Línea de pasos en las tarjetas de la lista**: cinco segmentos con el estado real que ya calcula `buildProductSteps` (hecho, en curso, pendiente, bloqueado) y una etiqueta accesible ("Paso 2 de 5: Documentos"). El avance deja de existir solo en la barra lateral.

### Dos cosas que costaron una ronda

- **Los segmentos medían 0px**: el cuerpo de la tarjeta no estira a sus hijos, así que la grilla se encogía a su contenido (medido: `.dossier-track` 16px de ancho, cada segmento 0px). Se resuelve con ancho explícito (`width: 100%`, tope 22rem).
- **El historial del demo comparte timestamp**: los eventos del fixture se crearon todos a la misma hora, así que las filas repiten la fecha. Es la verdad de los datos; con un expediente real las fechas difieren.

### Lo que se decide no mostrar, con la razón

- El `note` de cada evento: en el demo trae internos ("Pago mock confirmado (fixture firma)") y un guion largo. La etiqueta de estado ya cuenta el qué.
- El nombre del abogado asignado, el historial de pagos y un resumen de cuenta: el backend no los expone al cliente, y el alcance es solo frontend.
- La evaluación del caso (`result`): no hay vocabulario de cara al cliente y agregarlo sería inventar copy.

## Sexta pasada — el hueco de la derecha y el medio del paso documentos

Pedido: *"no está mal lo del estado de documentos pero qué tal si lo usamos para rellenar el espacio en medio de subir documentos y luego el botón que está al fondo a la derecha"* y *"bajo y cuando ya no se ve el proceso en el que estoy queda un espacio fuerte a la derecha… va extendiéndose un proceso, luego bajo más y se extiende otro"*.

### Diagnóstico medido

Con 6 expedientes, la lista (336px) llegaba a y≈1100 y el desk (848px) terminaba en y≈545: toda la mitad derecha por debajo de y≈560 quedaba vacía. En el paso documentos, el soltar archivos ocupaba los 784px del panel con una caja punteada de 112px, y "Continuar a consulta" se estiraba a todo el ancho sin nada al lado.

### Cambios

- **Grilla con el expediente abierto extendido** (`client-panel.component.ts`): se fue `.inbox-split` (lista de 336px + desk de 848px). Las tarjetas van en grilla de dos columnas desde 1101px y la abierta cruza las dos con el trámite adentro. Usa el estado que ya existía (`deskCaseId`, `openDesk`, `deskCase`): no se agregó lógica de selección.
- **La lista se ordena por urgencia** (`caseUrgency` en `divorcio-steps.ts`, extraída del ranking que ya usaba `pickProductCase`): el desk elegía el caso por urgencia pero la lista se ordenaba por id, así que el expediente abierto caía último. Ahora coinciden y la tarjeta extendida es la primera.
- **Paso documentos en dos columnas**: subida a la izquierda (casillero y soltar archivos) y estado real a la derecha, con fecha, peso, estado de revisión, motivo si lo rechazaron y el botón de continuar al fondo. El nombre del archivo y el badge se mudaron de un lado al otro para no decir lo mismo dos veces.
- **`docState`**: una fila por casillero del producto, subido o no, en lugar de una por archivo recibido. La ficha usa lo mismo, así que ahora también muestra lo que falta.
- **`embedded` en el desk**: dentro de la tarjeta extendida el hero no se repite y las tarjetas internas sueltan marco, borde y sombra. Sin esto la misma identidad aparecía cuatro veces y se veía tarjeta dentro de tarjeta.

### Lo que se descarta

- **Expansión automática por scroll** (la variante literal de "va extendiéndose un proceso al bajar"): al abrirse una tarjeta cambia el alto de la página y el contenido de abajo salta en cada tramo. Se conserva el resultado —una sola tarjeta extendida por vez, la del expediente que te toca— pero la dispara el clic, que es predecible y no pelea con la rueda.
- **Aire de las cajas punteadas**: el soltar archivos es ancho a propósito (zona de soltar), no un hueco. La auditoría mide la tarjeta abierta como una sola caja y da 0 hallazgos.

### Una trampa del arnés, otra vez

La captura mostraba el cuerpo del trámite vacío. El DOM probó que estaba completo (dos columnas de 890px y 288px) y el sondeo de estilos dio la causa: `opacity: 0` con `animation: desk-in ... both`. Las tarjetas insertadas **después** del clic quedaban congeladas en el 0% de su animación porque el arnés acortaba la duración a 0.001s en vez de anularla. Con `animation: none` se ve todo: no era un defecto del CSS.

## Séptima pasada — tarjetas parejas y última línea completa

Pedido: *"si yo tengo otro trámite el primero se queda más grande, se debería adaptar"* y *"cuando tuve 5 se veían los 3 bien pero los 2 de la derecha pequeño; debería completar ese espacio vacío"*.

### Diagnóstico medido

Dos reglas del mismo componente, ninguna de datos.

- `.dossier.is-hero` daba **más** padding a la primera tarjeta (`clamp(1.5rem, 3.5vw, 2rem)`) y `.dossier:not(.is-hero)` se lo **quitaba** a todas las demás (`clamp(1rem, 2.5vw, 1.35rem)`, título en `--text-xl` y gap más chico). Era un hero invertido que quedó de cuando la lista ocupaba una columna entera: el template marcaba `[class.is-hero]="i === 0"`, así que la primera salía más grande y el resto más chicas.
- `.dossier-grid` era `grid-template-columns: repeat(2, minmax(0, 1fr))` con el abierto en `grid-column: 1 / -1`. Con un número impar de tarjetas la última quedaba sola en la columna izquierda. Reproducido con 6 expedientes: `[abierta] / [602 | 602] / [602 sola]`, con media línea vacía.

### Cambios

- **Fuera el hero invertido** (template y estilos): todas las tarjetas usan la escala base de `.dossier`. Medido después: 602px de ancho, título de 20px y padding idénticos.
- **La grilla pasa a `flex-wrap`**, base `calc(50% - var(--space-3) / 2)` por celda y `flex-basis: 100%` en la abierta. Medido después: las tres líneas suman 1216px, el ancho del lienzo — `[1216] / [602 | 602] / [1216]`. La tarjeta sola llena su línea.
- **Una sola señal en la celda abierta**: se fue la sombra que sumaba encima del borde tintado. Las tarjetas ya traen su elevación y la elevación se declara una vez.

### Por qué flex y no grid

El grid no estira un ítem suelto sin spans calculados a mano, y el hueco puede quedar antes o después del abierto según cuál se abra, o entre los dos. Flex reparte el sobrante de cada línea y cubre los tres casos sin lógica en el componente.

## Octava pasada — tarjetas del mismo alto y datos en la cabecera del abierto

Pedido: *"sigo viendo en el caso donde va 'firma tu minuta' más grande que el resto, deben ser todos del mismo tamaño, en ese caso como pusiste 4 ejemplos"* y *"en caso de que sea un solo trámite tenga más especificaciones, ya que volvimos al espacio de en medio: podés poner entre el nombre del trámite y la barra de progresión los datos extras para llenar"*.

### Diagnóstico medido

- Las tarjetas se estiraban dentro de su propia fila, no entre filas: con cuatro en pantalla, la que tiene la pista de dos líneas medía ~197px y las de la otra fila ~165px. La primera ("Firma tu minuta", #2, la que abre) era la más alta y se leía como más grande que el resto.
- La cabecera del abierto medía 1188px de ancho con el título y la pista a la izquierda y el estado al extremo derecho: entre la pista (que termina en x≈515) y el estado (x≈1015) quedaban ~500px vacíos. Con un solo trámite, el panel es esa tarjeta y nada más, así que el hueco se ve entero.

### Cambios

- **`min-height: 12.5rem`** en las tarjetas de la lista. Medido después: las tres tarjetas a 200px exactos (`h=200 w=602`, `h=200 w=602` y la sola `h=200 w=1216`), y la cabecera del abierto en 195px.
- **Fila de datos en la cabecera del abierto** (`caseFacts` en el panel), entre la pista y la línea de pasos: "Abierto el **15 sept 2026** · Minuta **Lista** · Notaría **Por definir** · Comparecencia **Por agendar**". Ocupa el ancho del cuerpo (`justify-self: stretch`, porque el cuerpo es un grid con `justify-items: start` y sin eso la fila medía 624px y `space-between` no hacía nada) y reparte los pares hasta donde empieza el estado. Medido después: 1188px.
- **El bloque Expediente de la ficha se fue**: eran los mismos cuatro datos. La ficha queda con historial y documentos, que su grilla de columnas automáticas reparte sin dejar hueco. Con eso desaparecieron los cuatro getters de la ficha, su `dateLong` privado (que pasó a `formatDateLong` compartido en `divorcio-steps.ts`) y las cuatro reglas CSS de `.ficha-rows`.

## Novena pasada — línea de pasos y especificaciones en las tarjetas

Pedido: *"no has hecho que en todos mis trámites la barra de progreso esté en medio con un poco más de especificaciones; podrías usar tipo documentos ya subido debajo de una barra"* y la aclaración *"esto solo es para cuando hay un trámite con dos o más, ya no aplica"*.

### Diagnóstico medido

La línea de pasos de cada tarjeta tenía `max-width: 22rem` y quedaba pegada a la izquierda del cuerpo: en una tarjeta de 602px la barra medía 352 y dejaba el resto del ancho sin usar. Debajo no había nada más que aire.

### Cambios

- **La línea cruza el ancho del cuerpo** en las tarjetas de la lista (`max-width: none`): medido, 389px en una tarjeta de 602 y 1003 en la sola que llena la línea.
- **Especificaciones debajo de la barra** (`tileSpecs`): "Documentos **En curso** · Abierto el **15 sept**". El estado de documentos sale de la misma línea de pasos que pinta la tarjeta (`productSteps`), así que no hace falta pedir los archivos ni agregar llamadas. Los pares se reparten con el mismo `space-between` de la fila de datos, que ahora arranca a los 34rem de contenedor en vez de estar atado al abierto.
- **Solo en las tarjetas**: el expediente abierto ya lleva sus cuatro datos en la cabecera, y con un solo trámite no hay tarjetas, así que ese estado no muestra especificaciones.
- **Consolidación**: la fecha corta del desk pasó a ser `formatDateShort` compartida en `divorcio-steps.ts`, al lado de la larga; su copia privada se fue.

## Décima pasada — la tarjeta impar completa la línea (y la vuelta atrás)

Pedido: *"revierte el hecho de que sea pequeño… si son 2 son del mismo tamaño, si son 3 uno es más grande; en números impares uno es más grande nomás para completar el tamaño que ocuparían los demás"*.

Antes de esta pasada hubo dos estados y los dos estaban mal por lados distintos: con `flex-grow` la tarjeta sola llenaba la línea y se veía como una tarjeta de otra clase; sin `flex-grow` quedaba a medio ancho con el hueco al lado. La regla que queda es la que describió el usuario: **con dos, parejas; con número impar, la que cae sola completa el ancho de las demás**.

- `flex: 1 1 calc(50% - var(--space-3) / 2)` en las tarjetas y `flex-basis: 100%` en la abierta: el estado del séptimo paso, restaurado. La medición de entonces vale: `[1216 (abierta)] / [602 | 602] / [1216]`, cada línea sumando el lienzo completo.
- Sin `justify-content: center`: con el reparto no sobra nada que centrar.
- El `min-height` que iguala las alturas queda: era el problema del pedido anterior.

La confusión, para el registro: la queja de *"el documento que no está del mismo tamaño que los demás"* era por el **ancho** de la impar, y la de *"los 2 de la derecha pequeño"* era por la **altura** de la fila. La primera se revirtió acá; la segunda se resolvió con el `min-height` y se mantiene.

Queda registrado además un error propio: un comentario de SCSS con un término entre backticks rompió el array de estilos del componente, porque el SCSS vive dentro de un template literal y el backtick cerró la cadena. El build lo dijo en el acto y no llegó a la demo.

## Undécima pasada — todas las tarjetas del mismo alto

Pedido: *"las card del módulo de clientes en el módulo de todos aparecen de diferentes tamaños, haz que sean iguales"*.

### Diagnóstico

En el filtro "Todos" se ven todas las tarjetas a la vez, y ahí conviven la que tiene la pista de dos líneas ("Firma registrada — puedes volver a firmar si lo necesitas (100% virtual)") con las de una línea. El `min-height` que se había puesto es un **piso**, no un techo: sube la tarjeta baja hasta 12.5rem pero no baja la alta. En la vista de producto el defecto quedaba tapado porque la tarjeta abierta ocupa la fila entera y el resto caía en filas parejas.

### Cambio

- **La pista reserva dos líneas** en las tarjetas de la lista (`min-height: 2lh`). Medido con pistas mixtas en "Todos": `alturas distintas: 1 -> 236px x5`, las cinco iguales, con la línea de pasos y las especificaciones alineadas entre tarjetas.

### Verificación

Con datos de prueba (tres expedientes extra, con pistas de una y dos líneas), barrido en "Todos" a 1560px, y la base de vuelta en un solo caso. Build limpio y 110/110 specs.

## Duodécima pasada — todas del mismo tamaño, también la impar

Pedido: *"me arrepiento con lo de la card más grande: si está en número impar, dejala del mismo tamaño a todas"*.

Cierra el ida y vuelta de las pasadas 7, 10 y 11 sobre la tarjeta que cae sola en una línea impar. Lo que queda es la regla simple: **todas del mismo ancho, siempre**.

- `flex: 0 1 calc(50% - var(--space-3) / 2)` en las tarjetas y `flex-basis: 100%` en la abierta. Sin `flex-grow` y sin `justify-content`.
- La impar **queda en su columna**, alineada con las tarjetas de arriba: el lugar que no ocupa queda libre, en lugar de centrarla o estirarla, que son las dos cosas que se probaron antes.
- El `min-height` y la reserva de dos líneas en la pista quedan: eso iguala las **alturas**, el otro problema, que sigue resuelto.

Verificado en el render: `grow=0`, `justify=normal` y la pista reservando dos líneas (`alto=45 lineas=2`).

La lección, para el registro: el mismo elemento pasó por tres reglas distintas en cuatro pasadas porque cada pedido miraba una dimensión diferente (la altura de la fila, el ancho de la impar, el tamaño de todas). Fijar la regla completa antes de tocar el CSS habría ahorrado el recorrido.

## Decimotercera pasada — el cuestionario como folio (Divorcio360)

Pedido: *"cambiemos el formulario de divorcio 360: no me refiero al orden de las preguntas ni si pongo que sí me da más, eso no; solo quiero que cambies la forma en que se hace porque se ve demasiado básica"*, con libertad para buscar referencias.

### Diagnóstico

El sistema ya habla de un expediente sobre papel: detrás del panel corren las fibras de papel (`paper-fibers.svg`), un glow de acento y los **renglones de folio** (`folio-ruling.svg`, ritmo de 3rem) animados, y el veredicto tiene un sello (`.ob-verdict-stamp`). La pantalla de la pregunta se salía de ese mundo: un cuadro de 3rem con el icono, el `h1`, la pista y dos filas blancas con un chevron. Es el patrón por defecto de la categoría, y es exactamente lo que el playbook diagnostica: una sección que se autoexcluye de los movimientos más fuertes del sistema.

Las referencias no aportaron nada: los resultados son "formularios conversacionales" y "una pregunta por paso", los defaults que el piso de craft manda rechazar. La dirección salió del propio sistema.

### Cambios

- **La pregunta manda**: el `h1` pasa a `clamp(1.7rem, 4.4vw, 3.2rem)` con `text-wrap: balance` (antes 1.6–2.3rem). La display del sistema (Fraunces) a tamaño pleno.
- **La pista baja la voz**: `--text-muted` y `--text-xs`. El salto de tamaño es lo que hace titular a la pregunta.
- **El icono se muda**: deja de ser un cuadro de 3rem dentro del panel y pasa a la línea del folio, chico y en la tinta del acento. Conserva la señal y desaparece el badge.
- **La marca del folio**: la línea de progreso se conserva y debajo aparece `01 / 07 · PACTO` — número tabular, sección y el icono. La categoría ya existía en el componente (`currentCategory`) y no se mostraba en ninguna parte. Es el "skeleton test": sin leer una palabra, la página dice "expediente con secciones".
- **La respuesta se sella**: el elegido muestra el check dibujado (no Unicode), girado -8°, en el acento. El chevron de las opciones se retira porque era decoración. El comportamiento no cambia: hover con el borde acento, `scale(0.985)` al presionar, avance inmediato.
- **Un solo momento de movimiento**: la entrada de la pregunta (`ob-sheet-in`, ya documentada en `design.md`) se conserva y se le suma **uno**: el sello al elegir. Nada más se mueve.
- **El folio respira**: bajo el flujo de divorcio el renglón sube de 0.75 a 0.95 de opacidad y las fibras de 0.6 a 0.72 — mismo asset, misma animación, solo presencia.
- **Coherencia en las tres pantallas**: la escala de pregunta y la pista en voz baja valen también para la revisión y el veredicto, que ya tenían su línea que corre al pasar y su sello.

### Alcance

Todo anclado a `.landing-page.product-flow.theme-divorcio` y `body.divorcio-flow-mode`, los dos ganchos que solo pone este flujo. **Traslado360 y BienRaiz360 quedan intactos**, porque comparten las clases `.ob-*`: verificado por captura, el cuestionario de Traslado360 sigue con "Paso 1 de 6", su badge de 3rem y su h1 chico.

### Verificación

123/123 specs, capturas de escritorio y móvil de las tres pantallas del formulario, y el cuestionario de Traslado360 como control del alcance. Sin cambios de comportamiento: el orden, la ramificación, las claves de respuestas y la API quedan igual.

## Pendiente

- **Overflow horizontal real por debajo de ~400px**: el corte de las capturas headless es un artefacto de Edge en Windows (impone un ancho de layout mínimo cercano a 500px y recorta el PNG). Falta medirlo en un dispositivo o DevTools reales para descartarlo del todo.
- **`Fase 2 · Vista previa`**: el badge vivía en `fase2-shell`, que era inalcanzable, así que las pantallas mock de Fase 2 no muestran hoy ninguna etiqueta de vista previa. Es decisión de producto, no de slop: si se quiere el rótulo, hay que montarlo en el shell que sí se usa.
- **No se tocó el backend**, por pedido explícito.
