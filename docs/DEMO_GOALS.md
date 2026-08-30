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
