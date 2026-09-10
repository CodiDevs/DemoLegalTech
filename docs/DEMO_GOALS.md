# Demo goals log

Checklist of shipped vertical slices for the Divorcio360 client demo.

| Status | Goal | How to demo | Date |
|--------|------|-------------|------|
| done | Bootstrap repo | `README.md` — `go run ./cmd/api` + `npm start` | 2026-08-29 |
| done | Auth + seed users | Login `cliente@demo.ec` / `abogado@demo.ec` (`demo1234`) | 2026-08-29 |
| done | Cuestionario inteligente | Landing → Cuestionario → green/yellow/red | 2026-08-29 |
| done | Pago mock + carga docs | Green path → Payphone mock $349 → cédula + partida | 2026-08-29 |
| done | Paneles cliente/abogado | Advance states 01–10; client timeline | 2026-08-29 |
| done | Firma electrónica mock | Canvas firma; evidence fecha/hora/IP on expediente | 2026-08-29 |
| done | Fase 2 mocks | Abogado → Fase 2 → six backlog screens | 2026-08-29 |
| done | Panel abogado creíble | `/abogado` filtros → `/abogado/caso/1` revisar docs, minuta, acciones | 2026-08-29 |
| done | Fase 2 pulida + UX por rol | Abogado sin cuestionario; Fase 2 shell rico; bandeja/workspace pro; cuestionario onboarding | 2026-08-29 |
| done | LegalStation UI Talking Tree + hero scroll | `/` hero SVG scroll, header 3 cols, carrusel, español | 2026-08-29 |
| done | Demo audio: por uso + 3 roles + productos lite | Walkthrough 12 min — licencia bufete, Traslado360/BienRaiz360, notario, UI unificada | 2026-08-30 |
| done | Audio gaps: slogan + sitios producto + reuniones | Walkthrough 15 min — Traslado360/BienRaiz360 completos, consulta/notaría mock | 2026-08-30 |
| done | Firma virtual + flujo operador | notify sin cambio estado; confirm solo con firma en 05; can_sign autónomo cliente | 2026-08-30 |
| done | Flujo documental multi-producto | Traslado360 carro: upload matrícula+acuerdo → abogado aprueba → minuta → firma; blockers por etapa | 2026-08-30 |
| done | Upload documentos UX | Checklist + dropzone por producto; reemplazar sin borrar; abogado ve solo última versión | 2026-08-30 |
| done | Cuestionario UX progreso estático | `/cuestionario` — barra superior quieta; preguntas entran desde abajo | 2026-09-02 |
| done | Marketing UI polish Fase 0+1 | `/productos/divorcio360` Fraunces + teal AA + mock expediente + 6 pasos | 2026-09-03 |
| superseded | Marketing UI polish Fase 2 | `/` collage + badges — replaced by Home `/` no-slop | 2026-09-03 |
| superseded | Divorcio360 landing UI/UX | `/productos/divorcio360` hero pin con mock, CTAs por sesión, band de stats | 2026-09-06 |
| done | Divorcio360 no-slop repair | `/productos/divorcio360` — CTA above-fold, una demo, copy honesto, legales | 2026-09-06 |
| done | Cuestionario no-slop | `/cuestionario` — sin atmósfera, progreso teal, header sólido, Atrás en resultado | 2026-09-06 |
| done | Home `/` no-slop | `/` — un hero, catálogo live, CTA por rol, sin collage/KPIs/gallery | 2026-09-08 |
| done | Fase 2 admin no-slop | `abogado@demo.ec` → `/abogado/fase2/admin` — tabla de casos, métricas honestas, sin KPI theater | 2026-09-08 |
| done | Frontend audit polish | Copy producto; sidebar abogado+Fase2 unificado; pricing/stats 2-up; Divorcio360 Legora-like | 2026-09-10 |
| done | LegalStation landing premium | `/` hero video + brand lockup; secciones/container unificados; cards 3-up | 2026-09-10 |
| done | Landing layout polish | Precios 3-up; cards elevadas; a.btn hover fix; secciones soft diferenciadas | 2026-09-10 |
| done | Cards shine / tilt / FAQ | `/` productos 3D, Professional shine, FAQ post-precios; sin `#sistema` | 2026-09-10 |

## Entries

### 2026-08-29 — Bootstrap
Repo en `chamba/divorcio360`, reglas Cursor, docs de alcance, Go API + Angular scaffold.

### 2026-08-29 — Auth + seed
JWT login/register. Seed: cliente con caso en estado 03; abogado listo.

### 2026-08-29 — Cuestionario
POST `/api/v1/questionnaire` + UI condicional. CTA sin WhatsApp.

### 2026-08-29 — Pago + docs + firma
Checkout Payphone mock, upload multipart, canvas firma con evidencia IP.

### 2026-08-29 — Paneles + Fase 2
Cliente/abogado/expediente. Mocks: admin, plantillas, IA, SATJE, B2B, móvil.

### 2026-08-29 — Panel abogado funcional
Workspace abogado con revisión docs (aprobar/rechazar), generación minuta HTML mock, acciones por estado con gates (no advance genérico). Bandeja con filtros. Cuestionario persistido en caso. Seed caso #1 con docs placeholder.

**Demo abogado:** login abogado → Revisión → caso #1 → aprobar cédula+partida → preparar minuta → enviar firma → (cliente firma) → confirmar → notaría hasta 10.

**Reset seed:** borrar `backend/data/divorcio360.db` y reiniciar API.

### 2026-08-29 — Fase 2 pulida + UX por rol
- **Rol abogado:** nav sin “Cuestionario”; landing con CTAs operador; guard `clienteOrGuestGuard` bloquea abogado en `/cuestionario`; APIs `/mock/*` solo abogado.
- **Fase 2:** shell con sidebar (`/fase2/*`), admin con KPIs + embudo + tablas, plantillas con preview modal, IA con selector de caso + cross-check + chat, SATJE con registros + matches, B2B con tenant + facturas, móvil con roadmap PWA vs nativa.
- **Panel abogado:** sub-layout sidebar (Bandeja | Fase 2), stats, tabla con pipeline 01–10, workspace con tabs + header progreso.
- **Cuestionario:** wizard con grupos, resumen pre-envío, resultado con iconografía y copy bufete.
- **Shared:** `MetricCard`, `StatusBadge`, `ProgressSteps`, `DataTable`, `MockBadge`.

**Demo 8 min:**
1. Login `abogado@demo.ec` → confirmar nav sin cuestionario → bandeja con stats/tabla → caso #1 tabs.
2. Fase 2: Admin (embudo) → IA (caso #1) → SATJE sync → B2B.
3. Logout → login `cliente@demo.ec` → cuestionario rediseñado → flujo verde.

### 2026-08-29 — LegalStation SaaS + demo legal-tech funcional
- **Marca:** UI pública **LegalStation** (SaaS multi-producto); **Divorcio360** único flujo live; 5 productos fake con badge “Próximamente”.
- **Rutas:** `/` catálogo SaaS → `/productos/divorcio360` → cuestionario; tokens US legal-tech (`saas-tokens.scss`).
- **Abogado:** `revert_step` (04→03 … 10→09) + `ConfirmDialog` en avance, retroceso, docs, minuta; campana notificaciones en shell.
- **Cliente:** mensajes visibles (`case_notes.visible_to_client`); sección “Mensajes de LegalStation” en expediente; LOPDP checkbox en registro.
- **SLA:** `days_in_status` + badge en bandeja abogado.
- **Fase 2 persist:** métricas híbridas; SATJE vincular persiste + badge workspace; B2B PATCH plan; plantillas master PATCH.
- **Schema:** `notifications`, `mock_satje_links`, `mock_tenant`, `mock_master_template_edits`, `users.lopdp_consent_at`.

**Demo 10 min:**
1. `/` LegalStation — catálogo (Divorcio360 live vs fake “Notify me”).
2. Divorcio360 → cuestionario → registro con LOPDP → flujo cliente (pago, docs, firma).
3. Abogado: bandeja SLA → caso #1 → confirmaciones + revert → campana notificaciones → SATJE badge si vinculado.
4. Fase 2: Admin (embudo híbrido, editar plantilla) → SATJE sync + Vincular → B2B upgrade plan.
5. Cliente: expediente → “Mensajes de LegalStation”.

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API tras cambios de schema.

### 2026-08-29 — Auth LegalStation + UI Divorcio360 (hero roadmap, galería, stats)
- Login/registro en `/auth?returnUrl=/` con header LegalStation (sesión compartida JWT).
- Divorcio360: hero roadmap (hero-section-5), galería elástica, statistics cards; auth contextual solo post-cuestionario.
- Cómo demo: LegalStation → Ingresar (cliente@demo.ec / demo1234) → volver a `/` logueado → Divorcio360 → mismo login.
- Regla: `.cursor/rules/frontend-design-angular.mdc`.

### 2026-08-30 — Demo audio (por uso, 3 roles, productos lite, UI unificada)
- **Pricing story:** LegalStation `#precios` = licencia bufete ($/mes); Divorcio360 = honorario único sin suscripción.
- **B2B:** `/fase2/billing` — link cliente, comisión 15% demo, plan con nombre humano.
- **Productos live:** Traslado360 (`/productos/traslado360` → `/intake/traslado360`) y BienRaiz360 — pago único mock.
- **Rol notario:** `notario@demo.ec` → `/notario` — aprueba docs, comparecencia, acta.
- **Cliente:** agendar reunión notarial en expediente; checkout con recibo; upload dropzone; firma con preview minuta.
- **UI:** `ProductFlowShell` + `product-flow.scss` — mismo look landing → flujo demo.

**Demo 12 min:**
1. `/` LegalStation — licencia bufete (no suscripción cliente) → catálogo con 3 productos live.
2. Divorcio360 → cuestionario → pago único → docs → firma → agendar notaría.
3. Abogado → caso #1 → minuta/firma → Fase 2 billing (link + comisión).
4. Notario → bandeja → aprobar/comparecencia/acta.
5. Traslado360 lite — intake → pago → docs.

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (migración rol `notario`).

### 2026-08-30 — Audio gaps: slogan, sitios producto completos, reuniones virtuales
- **Slogan canónico:** *Servicios jurídicos al mismo costo, sin filas ni trámites* — LegalStation hero, Divorcio360 hero band, shell footer, flujos producto.
- **Membresía:** cliente = pago único por trámite; bufete = licencia mensual en `#precios` LegalStation y Fase 2 B2B.
- **Reuniones mock:** `/consulta/:caseId` (abogado) y `/reunion-notarial/:caseId` (notario) — videollamada simulada + chat; CTAs en expediente, upload y post-firma.
- **Traslado360 / BienRaiz360 sitios completos:** `/productos/{slug}` marketing (hero mock UI, timeline, stats, galería, precios) → `/productos/{slug}/cuestionario` (wizard 5–8 preguntas + sidebar expediente) → checkout → docs → consulta → firma → notaría.
- **Plataforma UI:** `ProductSiteShell`, `product-sites.data.ts`, `ProductLandingComponent`, `ProductQuestionnaireComponent`; rutas `/intake/*` redirigen a cuestionario.
- **Backend:** `consultation_at` + `POST /cases/{id}/consultation`; doc types `matricula`/`titulo`/`acuerdo` por producto.

**Demo 15 min:**
1. `/` — slogan completo + licencia bufete vs pago único cliente.
2. **Traslado360** sitio completo → cuestionario → registro → pago $199 → docs → consulta virtual → firma → agendar/entrar reunión notarial.
3. **Divorcio360** — mismo flujo con consulta + notaría visible en expediente.
4. Abogado + notario en paralelo (caso seed / nuevo caso producto).

**Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (columna `consultation_at`).

### 2026-08-30 — Firma virtual + panel operador (bugs demo)
- **`notify_client_sign`:** «Notificar al cliente» — solo aviso, **no cambia estado** (sigue en 04).
- **`confirm_signature`:** solo en **05** y solo si hay fila en `signatures` — revisar tab Firmas antes de confirmar.
- **Cliente autónomo:** flags API `can_sign`, `has_minuta`, `has_signature`, `sign_hint`; CTAs en `/cliente`, expediente, upload, firma.
- **Al firmar:** reemplaza firma anterior (mock); avanza caso a **05**.
- **Fix pantalla blanca abogado:** `blockers: null` en JSON → normalizar arrays + loading/error en `lawyer-case`.
- **Productos:** gates abogado por `matricula`/`acuerdo`/`titulo`; minuta `Minuta_{Producto}_CasoN.html`.

**Demo firma (5 min):**
1. Abogado genera minuta → estado 04.
2. Cliente firma solo desde `/cliente` (sin notificación).
3. Abogado ve estado 05 + imagen en Firmas → confirmar → notaría virtual.

Ver **`docs/HANDOFF.md` → Errores que NO repetir**.

### 2026-08-30 — Flujo documental multi-producto alineado
- **`internal/products`:** fuente única de docs requeridos (divorcio360 / traslado360 / bienraiz360).
- **Blockers por etapa:** estado 03 = solo docs; 04 = minuta; 05 = firma; sin mezclar pendientes futuros.
- **Gates:** `GenerateMinuta` y firma cliente exigen docs aprobados; no saltar revisión.
- **Producto en casos:** `ResolveProduct` desde body o `questionnaire.product`; auth pasa `product` al crear caso.
- **Workspace abogado:** `required_docs`, `stage_hint`, panel «Pendientes en esta etapa».
- **Demo Traslado360 (carro):** `/productos/traslado360/cuestionario` → pago $199 → upload matrícula + acuerdo → abogado `/abogado/caso/:id` aprueba → minuta → cliente firma → confirmar.
- **Reset DB:** borrar `backend/data/divorcio360.db` y reiniciar API (seed caso #1 divorcio en 03).
- **Verificación:** `backend/scripts/verify-flow.ps1` con API en `:8080`.

### 2026-08-30 — Flujo realista + UX español
- **Notificaciones:** `POST /notifications/read-all` + botón «Marcar todas como leídas» en campana del shell.
- **Abogado docs:** ver antes de aprobar (UI); sin acción bulk `approve_and_prepare`; auto **03→04** al aprobar último doc.
- **Minuta:** abogado sube PDF del notario (`POST /cases/{id}/minuta/upload`) → `case_outputs`; ya no HTML mock.
- **Firma cliente:** multipart documento (PDF/imagen), no canvas; tab Firmas abogado muestra enlace si es PDF.
- **Divorcio360 landing:** scroll a `(0,0)` al entrar + `ScrollTrigger.refresh()`.
- **Español:** copy visible (demostración, Cola de casos, por LegalStation, etc.).

**Demo abogado (5 min):**
1. `/abogado/caso/1` → tab Documentos: **Ver** cada doc → **Aprobar** (expediente pasa a 04 solo).
2. Tab Minuta → subir PDF del notario.
3. Cliente en `/firma/1` → sube documento firmado.
4. Abogado tab Firmas → «Confirmar firma recibida» → notaría virtual.

**Demo notificaciones:** campana → «Marcar todas como leídas».

**Verificación:** `backend/scripts/verify-flow.ps1`.

### 2026-08-31 — UX LegalStation: header, documentos, reuniones, Fase 2
- **Header:** «Evaluar mi caso» y «Mis expedientes» (logueado) siempre visibles; selector de productos alineado con la nav.
- **Landing `/`:** carrusel manual (sin auto-play); dots clicables.
- **Upload:** badge con más aire; botón rojo «Eliminar archivo» junto a «Ver» (`DELETE /cases/{id}/documents/{docId}`).
- **Reuniones:** solo agendar fecha/hora (días pasados bloqueados); popup «Su fecha se registró, espere el link…»; sin «Unirse a consulta virtual».
- **Cuestionario no_aplica:** bloque de agendamiento inline; login preserva `returnUrl=/cuestionario?resume=result`.
- **Fase 2:** nav en lenguaje llano; Admin/Plantillas/IA/SATJE ocultos para notario; copy minuta/acta: notaría envía → abogado sube.

**Demo cliente (5 min):**
1. `/` → header: Productos, Evaluar mi caso; login → «Mis expedientes» visible en cualquier página.
2. `/cuestionario` → respuestas → **no_aplica** → agendar reunión (si no hay sesión: login → vuelve al resultado).
3. Caso con docs → `/upload/{id}` → Eliminar archivo → resubir.
4. Expediente → agendar consulta/notaría → popup de confirmación.

**Demo abogado Fase 2:** `/fase2/admin` — menú lateral con descripciones claras; minuta en workspace explica flujo notaría→abogado.

### 2026-08-31 — Fase 2 comercial + agendamiento + pagos premium
- **Agendamiento:** popup funcional (z-index 10000); tarjeta persistente «Cita agendada»; persistencia sessionStorage; flujo auth con `d360_pending_meeting`; visible en cuestionario no_aplica y Mis expedientes.
- **Notaría eliminada:** ruta `/notario`, `/reunion-notarial`, login demo notaría, guards y nav; reunión notarial virtual removida del expediente cliente.
- **Checkout:** animación tarjeta procesando + factura generándose (CSS puro).
- **Dashboard bufete:** grid hero (ingresos + casos activos destacados), embudo, ingresos por producto, CTA «Ir a mis casos».
- **Plantillas:** variables `{{}}` → chips legibles («Nombre del cliente», etc.).
- **Notificaciones:** fix escalera (block layout); leídas vs no leídas con opacidad.
- **SATJE:** lenguaje legal natural («Sincronizar expediente judicial»).

**Demo agendamiento:** `/cuestionario` → no_aplica → confirmar → popup → tarjeta verde; `/cliente` muestra la misma cita.
**Demo pago:** `/checkout/{id}` → animación tarjeta → factura → subir documentos.

### 2026-08-31 — Pulido producción: acciones, notificaciones, copy
- **Acciones expediente:** botones centrados; acción única = CTA grande con color del producto (`--lp-accent`); todas las acciones son botones visibles.
- **Notificaciones:** layout flex robusto, sin alturas fijas; fechas ISO formateadas; textos con `break-words`.
- **Copy:** eliminado "demo/demostración" de checkout, footer, Fase 2, intake y flujos de producto.

**Demo acciones:** `/caso/{id}` — solo "Subir documentos" aparece como botón sólido centrado.
**Demo notificaciones:** campana → textos alineados, fechas legibles.
- **Citas (fix crítico):** `MeetingScheduler` autónomo con `[saveFn]`; modal en `document.body`; funciona en cuestionario no_aplica, expediente y Mis expedientes.
- **Notificaciones:** más padding/gap; solo no leídas; clic individual las quita; «Marcar todas» cierra el panel; copy sin referencias a notaría.
- **Checkout 2 columnas:** formulario izquierda; resumen del pedido derecha; post-pago → `AnimatedTicket` (recibo con confetti).
- **Fase 2 minimal:** Admin, SATJE, Plantillas y Asistente sin párrafos explicativos — solo títulos, métricas y acciones.

**Demo citas:** `/cuestionario` → no_aplica → «Confirmar reunión con abogado» → popup; `/cliente` → agendar si no hay cita.
**Demo pago:** `/checkout/{id}` → pagar → overlay oscuro → loader centrado → recibo en modal → «Subir mis documentos».
**Demo notificaciones:** campana → leer una (desaparece) o «Marcar todas» (panel se cierra).
**Demo Fase 2:** `/fase2/admin` — escaneable en 2 s, sin bloques de texto.

### 2026-08-31 — AdvancedStats dashboard Fase 2
- **Resumen del bufete** reemplazado por dashboard visual: gráfico de área animado, KPIs del bufete, tarjeta de objetivo y crecimiento de clientes.
- Datos conectados a `/mock/admin/metrics` (ingresos, casos activos, tiempo de resolución, tasa de finalización).
- Animaciones de entrada escalonadas al scroll (sin dependencias React).

**Demo:** login abogado → Fase 2 → Resumen del bufete → gráfico + 4 KPIs + progreso trámites digitales.

### 2026-09-02 — Cuestionario UX progreso lateral
- **Barra de progreso estática:** vuelve arriba del formulario (flujo normal, no fija al viewport); no se mueve ni se acorta al animar la card.
- **Animación de preguntas:** cada tarjeta entra desde abajo; al retroceder, desde arriba.
- **Slot fijo:** `ob-card-slot` con altura mínima para que el layout no salte entre preguntas.
- Mismo patrón en cuestionarios de otros productos (`product-questionnaire`).

**Demo:** `/cuestionario` → responder Sí/No; la barra superior permanece quieta mientras la pregunta sube desde abajo.

### 2026-09-02 — Cuestionario pantalla completa
- **Sin footer** en rutas de flujo Divorcio360 (`/cuestionario`, checkout, cliente, etc.).
- **Formulario arriba** bajo el header, sin pie de página.

**Demo:** `/cuestionario` → header + formulario alineado arriba, sin footer.

### 2026-09-02 — Ubicación con selects
- **País, provincia y ciudad** como tres `<select>` en el último paso del cuestionario (Ecuador + países frecuentes).
- Texto actualizado sin referencia a notaría cercana.

**Demo:** `/cuestionario` → último paso → elegir país, provincia y ciudad.

### 2026-09-02 — Checkout carrito desglosado
- **Resumen tipo carrito:** valor del trámite + valor del notario ($20 ref.) + extras según cuestionario (hijos, bienes, exterior, etc.) marcados como «Incluido».

**Demo:** `/checkout/{id}` → ver líneas del carrito y total según respuestas del cuestionario.

### 2026-09-02 — Consulta virtual tipo upload
- **Layout** igual que subir documentos: sidebar de progreso + tarjeta principal.
- **Solicitar consulta** sin elegir fecha; el abogado coordina después.

**Demo:** `/upload/{id}` → documentos → «Solicitar consulta» → botón en zona de carga.

### 2026-09-02 — Panel cliente general
- **Sin agendar consulta** en `/cliente` — la consulta se solicita desde cada expediente.
- **Tu cuenta:** expedientes por producto + facturas (pagos) en un panel unificado.

**Demo:** login cliente → `/cliente` → expedientes y facturas de todos los productos.

### 2026-09-03 — Marketing UI polish (Fase 0 + 1)
- **Tipografía:** Fraunces display + Inter 400–800, scoped a `.landing-page`.
- **Teal AA:** `--lp-accent-ink: #2e6e67` en Divorcio360; 6 pasos en grid `auto-fit`; mock UI de expediente (sin Unsplash).
- **Pricing:** “Sin costo” en Derivación; CTA primary vs tertiary; values asimétricos 1.4fr / 1fr.

**Demo:** `ng serve` → `/productos/divorcio360` (hero pin + mock + 6 pasos + precios). Spot `/` y `/productos/traslado360`.

### 2026-09-03 — Marketing UI polish (Fase 2)
- **Home accent:** `/` hereda `--primary` teal `#2f6f68`. Sin override índigo `#4455c4`.
- **Catálogo:** badges En vivo / Próximamente. Copy: Divorcio360, Traslado360 y BienRaiz360 en vivo.
- **CTA bottom:** teal compartido (sin gradiente índigo).
- **Dots:** pill activo en `landing-shared.scss`; hit-area 2.25rem.

**Demo:** `ng serve` → `/` — hero collage = 3 productos live; `#catalogo` badges; `#precios` lift hover; CTA final teal no índigo. Spot `/productos/divorcio360` (teal producto `#4a9e96` intacto).

### 2026-09-06 — Divorcio360 landing UI/UX
Superseded by “Divorcio360 no-slop repair”; do not use this section as the current walkthrough.
- **Hero:** pin revela mock del expediente (sin video Cloudinary roto). Intro ~70svh, sin outro, reveal de palabras one-shot.
- **CTAs:** cliente logueado ve “Ir a mi expediente”; operador ve el panel. Sin self-link “Volver a Divorcio360”.
- **Layout:** 6 pasos 3×2 con conectores; valores en fila editorial; stats en banda; logos en marquee.

**Demo:** `/productos/divorcio360` — scroll corto hasta el mock; logueado como Carlos: CTAs de expediente; invitados: “Evaluar mi caso”.

### 2026-09-06 — Divorcio360 no-slop repair
- Hero con un H1, contraste AA y CTA visible sin scroll.
- Una sola demo del expediente; sin marquee ni prueba social ficticia.
- Navegación coherente para invitado, cliente y abogado.
- Motion local a su componente y fallback completo para reduced motion.
- Política de datos, términos demo y footer `Hecho por CodiDevs`.

**Demo:** `/productos/divorcio360` como guest → cliente → abogado; revisar móvil 390px y reduced motion.

### 2026-09-06 — Cuestionario no-slop
- Sin `app-ob-atmosphere` (wash, papel, sellos, watermark).
- Progreso en segmentos `--primary`, radio 2px, hover de color.
- Header de flujo sólido (sin blur). Card `--radius-md`. H1 Inter.
- Resultado con Atrás a la revisión.

**Demo:** `/cuestionario` green path → review → Apto → Atrás. Spot 390px.

### 2026-09-08 — Home `/` no-slop
- Un hero (una imagen, sin collage ni KPIs). CTA: guest `#catalogo`, cliente `/cliente`, abogado `/abogado`.
- Hero editorial: Fraunces grande, bezel, wipe `clip-path` + drift lento (pausa en hover). CTA con chip y `:active` scale. Catálogo bento. Grain.
- Catálogo y pasos: stagger `--i` * 50ms solo si entran desde abajo. Secciones visibles sin JS. `prefers-reduced-motion` apaga wipe/drift/stagger.
- Un catálogo: 3 live + lista próximamente. Sin trust bar, carousel, stats grid ni galería elástica.
- Pricing: un plan featured. Footer `Hecho por CodiDevs`.

**Demo:** `/` como Carlos → Mis expedientes → `/cliente`. Guest: Ver qué puedo tramitar → `#catalogo`. Spot `/productos/divorcio360` (pin + band) y `/productos/traslado360` (gallery).

### 2026-09-08 — Fase 2 admin no-slop
- `/abogado/fase2/admin` como abogado: sidebar sólido 248px, nav por etiqueta, sin card dashed.
- Resumen: `<dl>` de conteos live + ingreso/tiempo de referencia. Tabla de `recent_cases` con Abrir → `/abogado/caso/:id`.
- Sin KPI grid, eyebrows, % inventados ni fade `opacity: 0`. Loading/error/retry.

**Demo:** `abogado@demo.ec` / `demo1234` → Fase 2 → Resumen. Abrir un caso. Spot `/abogado/fase2/templates` (chrome compartido).

### 2026-09-10 — Frontend audit polish (diseño)
**Corregido**
- Copy visible “demo / demostración / Vista previa / Cliente demo” fuera de landings, product sites, SaaS home y badge Fase 2 (legales CodiDevs se mantienen).
- Sidebar persistente: `/abogado` + `/abogado/fase2/*` en un solo shell (Casos + Herramientas). Redirects `/fase2/*` → `/abogado/fase2/*`. Aside no remonta; fade corto solo en main.
- Traslado360 / BienRaiz360: pricing 2 columnas + CTAs alineados; stats 2×2 cuando hay 4 métricas.
- Divorcio360: composición editorial (marca + promesa corta + una CTA + mock expediente); secciones sistema / flujo / prueba / precio.

**Siguiente (fuera de este slice)**
- Panel cliente: densidad y jerarquía.
- Checkout: alineación del carro.
- Páginas de contenido Fase 2: polish interno (admin/templates/AI) más allá del chrome.

**Demo:** `/productos/traslado360#precios` y `/productos/bienraiz360` (simetría). `/productos/divorcio360` guest. Login `abogado@demo.ec` → Bandeja ↔ Resumen del bufete sin salto de menú.

### 2026-09-10 — LegalStation landing premium
- Hero brand-first: video local `/videos/legalstation-hero.mp4` + overlay + mark SVG + slogan exacto; CTA por rol.
- Fallback poster + `prefers-reduced-motion` sin autoplay.
- Secciones con container 1200px, ritmo vertical, cards producto 3-up alineadas, pasos y enterprise limpios.
- Header marketing alineado al mismo container; mark SVG compartido.

**Demo:** `/` guest → Ver qué puedo tramitar → `#catalogo`. Spot 375px (sin overflow-x). Reduced motion: poster estático.

### 2026-09-10 — Landing layout polish
- Causa hueco derecho: pricing 1-col estrecha → grid 3 planes (Starter / Professional / Enterprise).
- Cards: `--shadow-md` + hover `translateY(-3px)` / `--shadow-lg` (landing only; reduced-motion sin transform).
- Secciones: base `--bg` vs soft `--bg-muted` para contraste sutil.
- Header: `a.btn` ya no hereda underline ni `a:hover` verde-sobre-verde; Ingresar ghost + Evaluar primary legible.

**Demo:** `/` guest → hover “Evaluar mi caso” (texto blanco). Scroll `#precios` — tres cards. Spot 1440 y 375.

### 2026-09-10 — Cards shine / tilt / FAQ
- Eliminada `#sistema` (redundante con `#flujo`).
- Productos live: tilt 3D sutil (desktop fine pointer; off en touch / reduced-motion).
- Pricing: Professional con shine border teal + badge “Más popular”.
- `#faq` tras precios: marquee desktop / accordion móvil; copy alineado al demo.
- Variedad: flujo tipográfico, enterprise outline, sin deps nuevas.

**Demo:** `/` guest → hover productos → `#precios` (brillo en Professional) → `#faq`. Spot 375 (accordion + pricing 1-col).
