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
