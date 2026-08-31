# Handoff — Divorcio360 Demo

> Memoria para retomar el proyecto en un chat nuevo. Última actualización: **2026-08-30** (firma virtual, Traslado360/BienRaiz360, bugs panel abogado).

**Slogan canónico (toda la UI):** *Servicios jurídicos al mismo costo, sin filas ni trámites.*

---

## Contexto del proyecto

### Cliente y producto

| Campo | Valor |
|-------|--------|
| **Cliente comercial** | Miguel López & Cía Abogados S.A. *(stakeholder real — no aparece en UI demo)* |
| **Marca demo UI** | **LegalStation** (SaaS) + productos live **Divorcio360**, **Traslado360**, **BienRaiz360** |
| **Desarrollador** | CodiDevs |
| **Versión objetivo PRD** | MVP Fase 1 (v1.0, agosto 2026) |
| **Este repo** | **Demo** para walkthrough con stakeholder — no es producción |

### Problema que resuelve

El bufete hoy opera **manual**: solicitudes dispersas, plantillas Word, correos, carpetas locales. Eso genera duplicidad, errores y **mucha carga operativa** por consultas de clientes sobre el estado del caso.

Divorcio360 centraliza el flujo en un expediente electrónico y da **autoservicio** al cliente sobre el avance del trámite.

### Objetivos del producto (PRD)

1. Filtrar casos aptos para vía notarial **antes** de pedir documentos o cobrar.
2. Digitalizar captura de datos y documentos (cédula, partida de matrimonio).
3. Cobro en línea de honorarios tras calificación.
4. Expediente único con trazabilidad de estados.
5. Reducir llamadas/mensajes de seguimiento al bufete.
6. Base técnica (roles, expediente, paneles) para escalar a otros trámites en fases futuras.

### Roles

| Rol | En demo | Acciones clave |
|-----|---------|----------------|
| **Cliente final** | `cliente@demo.ec` | Cuestionario, cuenta, pago, carga docs, firma, ver expediente |
| **Abogado / operador** | `abogado@demo.ec` | Bandeja con filtros, workspace `/abogado/caso/:id`: revisar docs, generar minuta, acciones por estado |
| **Notario** | `notario@demo.ec` | Cola notarial, comparecencia, acta |
| **Socio / admin** | No MVP real | Fase 2 mock en `/fase2/admin` |

### Cuestionario inteligente — resultados

| Resultado | Criterio orientativo | Precio | CTA demo |
|-----------|---------------------|--------|----------|
| 🟢 **Apto** | Mutuo consentimiento, matrimonio EC, sin conflictos menores pendientes, IDs vigentes | **$349** | Iniciar divorcio → flujo completo |
| 🟡 **Evaluación** | Ej. menores sin regulación de alimentos/tenencia | **$749+** | Agendar evaluación |
| 🔴 **No aplica** | No apto vía notarial simplificada | — | Derivación área jurídica tradicional |

Lógica implementada en `backend/internal/questionnaire/questionnaire.go`. Preguntas condicionales en UI Angular.

### Customer journey (MVP)

```
LegalStation `/` → Divorcio360 `/productos/divorcio360` → Cuestionario → (🟢) Registro + LOPDP → Pago → Carga cédula/partida
→ Revisión abogado → Documentos preparados → Firmas → Notaría
→ Comparecencia → Acta → Registro → Finalizado
```

En demo: tramo **automático** = clasificación + cuenta + pago + carga docs. Tramo **manual** = abogado + terceros (notaría, firma legal real).

### 10 estados del trámite

| ID | Estado | Responsable |
|----|--------|-------------|
| 01 | Información recibida | Sistema (post-pago) |
| 02 | Documentos pendientes | Cliente |
| 03 | Revisión jurídica | Abogado |
| 04 | Documentos preparados (minuta lista) | Abogado |
| 05 | Firmas (cliente firmó — pendiente confirmación abogado) | Cliente → Abogado |
| 06 | Enviado a notaría virtual | Abogado |
| 07 | Comparecencia virtual | Abogado / Notario |
| 08 | Acta emitida | Abogado |
| 09 | Registro | Abogado |
| 10 | Finalizado | Abogado |

Labels en `backend/internal/cases/cases.go` → `StatusLabels`.

### Documentos de referencia (fuente de verdad)

Ubicación original en máquina del usuario:
- `C:\Users\alech\Downloads\PRD_Divorcio360_CodiDevs.docx`
- `C:\Users\alech\Downloads\Divorcio360_Firma_Pasarelas_CodiDevs.docx`

Resumen técnico del doc firma/pagos (para cuando se pase a prod):
- **Firma recomendada prod:** firma en la nube vía ECI acreditada (Security Data, UANATACA, ANF AC) — no .p12 directo al cliente final.
- **Pasarela recomendada prod:** **Payphone** (Ecuador, sin entity extranjera). Stripe descartado para MVP ecuatoriano. Kushki como backup.
- **En este demo:** ambos **mockeados** — sin keys ni integración real.

### Alcance PRD vs este demo

| Área | PRD MVP | Este repo |
|------|---------|-----------|
| Landing, cuestionario, cuenta, docs, expediente, paneles, 10 estados | ✅ | ✅ |
| Pagos Payphone | Integración real | **Mock UI + API** |
| Firma electrónica legal | ECI / API | **Canvas + evidencia IP/fecha mock** |
| WhatsApp notificaciones (FR-09) | En PRD | **Excluido** por decisión explícita del usuario |
| LOPDP, AES-256, backups 99.5% | NFR prod | LOPDP checkbox demo en registro; resto no implementado |
| Fase 2 backlog | Fuera MVP | **Pantallas mock** con datos canned |

### Fase 2 / backlog (solo mock en demo)

1. Panel Socio/Admin — métricas globales, plantillas maestras  
2. Motor plantillas — otros trámites legales  
3. Agente IA — análisis de expedientes  
4. Sync/scraping SATJE / Función Judicial  
5. Pasarela pagos recurrente B2B  
6. App móvil nativa → demo usa **web responsive**

### Convenciones de trabajo acordadas

- Documentar cada slice demo en `docs/DEMO_GOALS.md` al shippear.
- **No apilar patches:** fallo → revertir → re-leer causa → otro enfoque.
- Comunicación agente: modo **caveman** cuando el usuario lo pida.
- Stack fijado: **Go + Angular** en `C:\Users\alech\chamba\divorcio360`.

---

## Qué es (repo técnico)

Demo **LegalStation** / **Divorcio360** (CodiDevs). MVP divorcio notarial mutuo consentimiento. **No producción.** UI = SaaS LegalStation; stakeholder comercial puede ser bufete ecuatoriano internamente.

| Capa | Stack |
|------|--------|
| Ruta | `C:\Users\alech\chamba\divorcio360` |
| Backend | Go 1.27, chi, JWT, SQLite (`backend/data/divorcio360.db`) |
| Frontend | Angular 19 standalone, SCSS, Inter (marketing), **GSAP 3** (hero scroll pin), proxy → `:8080` |
| Integraciones | **Mock** Payphone + firma canvas. **Sin WhatsApp.** |
| Fase 2 | Solo UI + APIs stub con badge “Fase 2 · mock” |

## Arranque

```powershell
# Terminal 1 — API (si go no reconoce: refrescar PATH o usar bin\api.exe)
cd C:\Users\alech\chamba\divorcio360\backend
$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')
go run ./cmd/api
# alternativa: .\bin\api.exe

# Terminal 2 — Frontend
cd C:\Users\alech\chamba\divorcio360\frontend
npm start
```

- App: http://localhost:4200  
- API health: http://localhost:8080/api/v1/health  
- Error `bind :8080` → API ya corre; no levantar dos veces.

### Parar el backend

```powershell
# En la terminal donde corre go run / api.exe
Ctrl+C

# Si quedó en background (puerto 8080)
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }

# Alternativa por nombre
Stop-Process -Name api -Force -ErrorAction SilentlyContinue
```

Verificar: `Invoke-WebRequest http://localhost:8080/api/v1/health` debe fallar si está detenido.

## Usuarios seed

| Email | Password | Rol |
|-------|----------|-----|
| `cliente@demo.ec` | `demo1234` | Cliente |
| `abogado@demo.ec` | `demo1234` | Abogado |
| `notario@demo.ec` | `demo1234` | Notario |

## Qué se implementó (plan completo)

### MVP (FR-01…FR-08, FR-10…FR-12)
- [x] Landing, cuestionario (verde/amarillo/rojo), auth JWT
- [x] Casos + motor 10 estados
- [x] Pago mock Payphone (`POST .../payments/mock`)
- [x] Upload cédula + partida
- [x] Firma canvas + evidencia IP/fecha
- [x] Panel cliente, panel abogado, expediente con timeline
- [x] **Out:** WhatsApp (FR-09)

### Fase 2 (mock)
Rutas abogado: `/fase2/admin`, `/templates`, `/ai`, `/satje`, `/billing`, `/mobile`  
APIs: `/api/v1/mock/*`

### Docs / reglas
- `README.md` — runbook
- `docs/DEMO_GOALS.md` — metas demo (actualizar al shippear slices)
- `docs/PRD_SCOPE.md` — in/out/mock
- `.cursor/rules/demo-goals.mdc` — log obligatorio en `DEMO_GOALS.md`
- `.cursor/rules/no-patch-stacking.mdc` — revertir patch roto antes de otro intento

## Flujo automático vs manual (IMPORTANTE — vigente 2026-08-30)

**Principio demo:** todo es **100% virtual** — firma canvas, consulta abogado, reunión notarial. Sin trámites presenciales en copy ni flujo.

### Cliente (automático hasta revisión)

```
Cuestionario → Registro + LOPDP → Pago mock → estados 01, 02
Upload docs (por producto) → estados 02, 03 automático cuando ambos docs cargados
```

### Abogado (manual, workspace `/abogado/caso/:id`)

```
Estado 03: aprobar/rechazar docs en pestaña Documentos
           → acción «Aprobar documentos y preparar minuta» → 04
Estado 04: generar minuta (pestaña Minuta) → auto 03→04 si generas desde 03
           → opcional «Notificar al cliente» (NO cambia estado — solo aviso)
           → cliente puede firmar SOLO desde su expediente (/cliente, /caso/:id, /firma/:id)
Estado 05: solo cuando el cliente subió firma (sistema pasa 04→05 al firmar)
           → abogado revisa imagen en pestaña Firmas
           → «Confirmar firma recibida» → 06
Estados 06–10: notaría virtual, comparecencia, acta, registro
```

### Reglas de firma (backend — no invertir)

| Regla | Detalle |
|-------|---------|
| `can_sign` | `has_minuta` + estado `03`, `04` o `05` — cliente **no necesita** notificación del abogado |
| `notify_client_sign` | Solo notifica; **permanece en 04** (alias legacy: `send_for_signature`) |
| `confirm_signature` | Solo en **05** y solo si `has_signature` en DB |
| Cliente firma | Reemplaza firma anterior (mock); avanza **04→05** (o 03→05) |
| Generar minuta | Notifica cliente + si estaba en 03 pasa a **04**; nombre `Minuta_{Producto}_CasoN.html` |

### Campos API en `Case` (enriquecidos en list/get)

`has_minuta`, `has_signature`, `can_sign`, `sign_hint` — calculados en `enrichSigning()` (`backend/internal/cases/cases.go`). **Usar estos flags en UI cliente**, no reimplementar lógica en Angular.

### Documentos por producto (revisión abogado)

| Producto | doc_type 1 | doc_type 2 |
|----------|------------|------------|
| divorcio360 | cédula | partida |
| traslado360 | matricula | acuerdo |
| bienraiz360 | titulo | acuerdo |

Lógica en `productDocRequirement()` (`backend/internal/lawyer/lawyer.go`). El workspace abogado usa `docLabel()` para mostrar nombres correctos.

### Panel abogado (post-mejora)

- **Bandeja** `/abogado` — filtros: Todos, Revisión, Firma, Notaría, Cerrados
- **Workspace** `/abogado/caso/:id` — tabs: Resumen, Documentos, Minuta, **Firmas**, Historial
- **NO** usar `/caso/:id` como operador — ahí no hay generar minuta ni acciones
- Acción renombrada: **«Notificar al cliente»** (id API: `notify_client_sign`)
- APIs: `GET /cases/{id}/workspace`, `POST .../review`, `POST .../generate-minuta`, `POST .../actions`

### Por qué el expediente #1 seed está en 03

Caso #1 (Carlos Mendoza): docs **pending** — punto de entrada demo abogado. Casos reales de usuarios (ej. Ariel #2) pueden tener firmas/minutas previas; no confundir con seed.

**Reset seed:** borrar `backend/data/divorcio360.db` y reiniciar API.

## Estructura clave

```
backend/
  cmd/api/main.go
  internal/auth|cases|questionnaire|payments|docs|signatures|adminmock|lawyer/
  internal/lawyer/templates/minuta.html
  internal/seed/seed.go
frontend/src/app/
  pages/saas/saas-landing.component.ts           — landing LegalStation
  pages/saas/marketing-hero.component.ts         — hero collage LegalStation
  pages/saas/divorcio-landing.component.ts       — landing Divorcio360 (menta)
  pages/saas/hero-scroll-video-pin-reveal.component.ts — hero GSAP + video pin (Divorcio360)
  pages/saas/cinematic-logo-cloud.component.ts     — logo cloud clientes demo
  pages/saas/elastic-gallery.component.ts          — galería elástica (LegalStation + flujo D360)
  pages/saas/divorcio-roadmap-hero.component.ts    — **eliminado** (fusionado en hero GSAP)
  pages/saas/landing-statistics.component.ts
  pages/saas/saas-landing.data.ts
  pages/product-site/product-landing.component.ts       — Traslado360 / BienRaiz360 landings
  pages/product-site/product-questionnaire.component.ts — cuestionario por producto
  pages/virtual-meeting/virtual-meeting-page.component.ts — consulta + reunión notarial mock
  shared/product-sites.data.ts                          — config productos + CANONICAL_SLOGAN
  shared/virtual-meeting.component.ts
  pages/lawyer-case/lawyer-case.component.ts              — workspace abogado (tabs + acciones)
  pages/client-panel/client-panel.component.ts            — CTA firma cuando can_sign
  styles/landing-shared.scss                              — .lp-slogan-band full-width, .landing-page
backend/internal/lawyer/lawyer.go                       — workspace, notify/confirm gates, productDocRequirement
backend/internal/signatures/signatures.go               — firma virtual, reemplazo, avance a 05
backend/internal/cases/cases.go                         — enrichSigning (can_sign, sign_hint, …)
backend/internal/docs/docs.go                           — validDocType por producto
```

## Sesión 2026-08-30 — Firma virtual, productos, bugs críticos

### Hecho — Sitios producto + reuniones virtuales (plan audio_gaps)
- Slogan completo en LegalStation, Divorcio360, shell, flujos producto
- **Traslado360** `/productos/traslado360` + **BienRaiz360** `/productos/bienraiz360` — landings completas, cuestionario, `$199` / `$499`
- Rutas: `/productos/:slug`, `/productos/:slug/cuestionario`; `/intake/*` redirige
- **VirtualMeetingComponent** — `/consulta/:caseId`, `/reunion-notarial/:caseId`
- Columna `consultation_at` + `POST /cases/{id}/consultation`
- Docs por producto en upload (`matricula`/`acuerdo`, `titulo`/`acuerdo`)
- Fix layout producto: wrapper `.landing-page` + tokens `--lp-accent` (sin esto las páginas se estiraban)
- Fix slogan band: breadcrumb primero, franja full-width `.lp-slogan-band` (no pill centrado)

### Hecho — Panel abogado: minuta + firma (bugs reportados en demo)
- **Pantalla en blanco** en `/abogado/caso/:id` (caso Ariel): API devolvía `blockers: null` → Angular rompía en `ws.blockers.length`. Fix: backend `[]` vacío + frontend `normalizeWorkspace()` + estados loading/error.
- **Confusión minuta vs acciones sidebar:** generar minuta está en pestaña **Minuta**, no en panel derecho.
- **Firma desincronizada:** cliente firmaba antes de notificación → abogado veía acciones incorrectas. Refactor completo flujo firma (abajo).
- **Go build roto** por colisión `type docRequirement` + `func docRequirement()` — renombrado a `productDocReq` / `productDocRequirement()`.

### Hecho — Flujo firma virtual (estado final del código)
- **`notify_client_sign`:** notifica al cliente, **no cambia estado** (sigue en 04). Label UI: «Notificar al cliente».
- **`confirm_signature`:** solo estado **05** + firma en DB. Abogado revisa imagen en tab Firmas.
- **Cliente autónomo:** `can_sign` cuando hay minuta (estados 03–05). CTAs en `/cliente`, `/caso/:id`, `/upload/:id`, `/firma/:id`.
- **Al firmar:** reemplaza firma anterior; caso pasa a **05** automáticamente.
- **Al generar minuta:** notifica cliente; si caso en 03 → auto **04**; filename por producto.
- Copy notaría/comparecencia: «virtual» en eventos y UI expediente.

### Archivos tocados en esta sesión (referencia rápida)
| Área | Archivos |
|------|----------|
| Firma backend | `internal/signatures/signatures.go`, `internal/lawyer/lawyer.go`, `internal/cases/cases.go` |
| Firma frontend | `lawyer-case.component.ts`, `client-panel.component.ts`, `case-detail.component.ts`, `sign.component.ts`, `upload.component.ts` |
| Productos | `product-sites.data.ts`, `product-landing.component.ts`, `product-questionnaire.component.ts`, `docs/docs.go` |
| Layout | `landing-shared.scss`, `shell.component.ts`, `divorcio-landing.component.ts` |
| Rutas | `app.routes.ts` |
| Docs | `docs/DEMO_GOALS.md`, este `HANDOFF.md` |

---

## Errores que NO repetir (leer antes de tocar firma / abogado / productos)

### Backend / API

| Error | Síntoma | Causa | Fix correcto |
|-------|---------|-------|--------------|
| Slice Go nil en JSON | Panel abogado **pantalla blanca** | `var b []string` sin append → JSON `null` | Devolver `[]string{}` explícito; frontend `(w.blockers \|\| [])` |
| `notify` avanza a 05 | Tras «notificar» aparece **Confirmar firma** sin firma | `send_for_signature` hacía `next=05` | Notificar **sin** `SetStatus`; confirm solo con `has_signature` en 05 |
| `nextActions` en 05 siempre confirm | Mismo bug | No chequeaba firma | En 05: confirm **solo si** `hasSignature()` |
| Confirm en 04 con firma vieja | Flujo incoherente | Firma temprana + estado 04 | Confirm **solo en 05**; firmar avanza a 05 |
| Colisión nombre Go | `go build` falla | struct + func mismo nombre | Renombrar (`productDocReq`, `productDocRequirement`) |
| Blockers divorcio en Traslado360 | Abogado no puede avanzar | Hardcode cédula/partida | `productDocRequirement(product)` por caso |
| Firmar sin minuta | Cliente firma docs vacíos | Gate solo por estado | Verificar `case_outputs` minuta antes de aceptar firma |
| IP `[` en evidencia firma | IP rara en UI | `Split(RemoteAddr, ":")` con IPv6 | `net.SplitHostPort` en `signatures.go` |

### Frontend / UX

| Error | Síntoma | Fix |
|-------|---------|-----|
| Abogado en `/caso/:id` | No hay minuta ni acciones | Usar **`/abogado/caso/:id`** |
| `@if (ws.blockers.length)` sin guard | Crash si null | Normalizar workspace al cargar |
| Sin loading en lawyer-case | Pantalla vacía mientras carga | `@else if (!ws)` + `loadError` |
| Link «Ir a firma» en upload siempre | Cliente firma antes de minuta | Mostrar solo si `case.can_sign` |
| Product landing sin `.landing-page` | Traslado/BienRaiz **estirado** | Wrapper + clases `landing-shared.scss` |
| Slogan como pill en product shell | No match Divorcio360 | `.lp-slogan-band` full-width, crumb arriba |
| Reimplementar `can_sign` en Angular | Divergencia UI/API | Usar flags del API `can_sign`, `sign_hint` |

### Operación / demo

| Error | Síntoma | Fix |
|-------|---------|-----|
| Dos APIs en 8080 | `bind: Solo se permite un uso...` | No relanzar; usar API existente o parar proceso |
| Seed vs casos reales | Confusión Ariel/Carlos | Caso #1 = seed; otros = datos de prueba manuales |
| Docs HANDOFF desactualizado | «Enviar a firma» → 05 | Seguir tabla **Reglas de firma** arriba |
| Parche sobre parche roto | Bugs peores | Regla `.cursor/rules/no-patch-stacking.mdc`: revert → re-leer → otro enfoque |

### Anti-patrones de diseño demo

1. **No** usar cambio de estado como proxy de «cliente notificado» — notificación ≠ firma.
2. **No** mostrar confirmar firma sin fila en tabla `signatures`.
3. **No** asumir que Divorcio360 es el único producto en gates de abogado.
4. **No** bloquear firma cliente a «solo estado 05» si la minuta ya existe — el cliente debe poder adelantarse (mensaje del producto).
5. En producción real, re-firmar **no** borraría la anterior sin auditoría — aquí es mock explícito.

---

## Sesión histórica 2026-08-29 (resumen)
- Repo Go + Angular en `chamba/divorcio360`
- Landing, cuestionario, auth, pago mock, upload, firma, paneles cliente/abogado, Fase 2 mocks
- Sin WhatsApp. Payphone + firma = mock
- Go 1.27 instalado vía winget

### Hecho — Panel abogado funcional (plan `panel_abogado_funcional`)
- Schema: `product`, `questionnaire_json`, review en docs, `case_outputs`, notaría/comparecencia
- Paquete `internal/lawyer/`: workspace, review docs, generate-minuta, actions con gates
- UI: `/abogado` (filtros) + `/abogado/caso/:id` (workspace)
- Cliente: banners, estado revisión docs, descarga minuta en `/caso/:id`
- Seed caso #1: docs placeholder + cuestionario JSON en estado 03
- Eliminado botón genérico "Avanzar estado" para abogado

### Hecho — Fase 2 pulida + UX por rol (2026-08-29)
- Aislamiento rol abogado: sin link/CTA cuestionario; landing operador; guard en `/cuestionario`
- Fase 2 shell + 6 pantallas enriquecidas; stubs API ampliados en `adminmock.go`
- Panel abogado: sidebar, stats, tabla pipeline, workspace con tabs
- Cuestionario onboarding: grupos, resumen, resultado visual
- Componentes shared en `frontend/src/app/shared/`

### Hecho — LegalStation SaaS + demo funcional (2026-08-29)
- Landing SaaS `/` + sub-landing Divorcio360; rebrand global (sin bufete en UI)
- Schema: notifications, SATJE links, tenant mock, master template edits, LOPDP consent, notas visibles al cliente
- Abogado: revert_step, ConfirmDialog, SLA en bandeja, campana notificaciones
- Cliente: mensajes LegalStation, LOPDP en registro
- Fase 2: métricas híbridas, SATJE vincular persiste, B2B plan PATCH, plantillas master PATCH

### Hecho — UI marketing LegalStation (2026-08-29, sesión UI)
- **Referencia visual:** [talkingtree.app](https://talkingtree.app/) — Inter, fondo crema, secciones amplias, pills elevados, carrusel “Míralo en acción”.
- **LegalStation (`/`):** paleta índigo `#4455c4` + `#fdfcfa`. **Divorcio360** producto: menta `#4a9e96` + `#f7fcfb`.
- **Header marketing:** logo | nav centrado (Plataforma, Productos, Precios) | Ingresar + Comenzar. Sin Divorcio360 en nav global.
- **Hero:** `MarketingHeroComponent` — collage 3 imágenes + stats (port Angular de hero-section-9 / 21st.dev). Iconos SVG en productos (`landing-icon.component.ts`), sin emojis.
- **Cajas elevadas:** hover lift en steps, catálogo, capabilities, pricing. CTA panel azul índigo (`&.legalstation-landing` en SCSS).
- **Productos:** grid 3×2; carrusel; elastic gallery clientes; footer 4 columnas.
- **Sesión compartida:** login en LegalStation aplica a Divorcio360 (JWT `d360_token`).
- **Regla Cursor:** `.cursor/rules/frontend-design-angular.mdc` — directivas diseño adaptadas a Angular (no shadcn/Tailwind en este repo).

### Hecho — Divorcio360 landing + auth fix (2026-08-29, sesión tarde)
- **Auth login/registro colgaba en “Procesando…”:** deadlock SQLite en `NotifyLawyersForCase` (INSERT con rows abiertos). Fix en `notifications.go` + WAL/`busy_timeout` en `sqlite.go`. Timeout 15s en frontend auth.
- **Hero Divorcio360:** `HeroScrollVideoPinRevealComponent` — port GSAP de [hero-scroll-video-pin-reveal](https://21st.dev/@ajith66310/components/hero-scroll-video-pin-reveal). Headline *“Tu trámite con un plan claro…”* + video pin `clip-path` + texto sobre video *“Cinco pasos, un expediente, cero llamadas innecesarias.”*
- **Eliminado:** hero roadmap/carro duplicado, trust bar, pills herramientas, sección “Experiencia visual” (galería).
- **Clientes demo:** `CinematicLogoCloudComponent`. Galería elástica queda en “Cada etapa del trámite”.
- **Dep:** `gsap` ^3.15 en `frontend/package.json`.

### Stack UI — importante
| Prompt / componente externo | Decisión en este repo |
|----------------------------|------------------------|
| React + shadcn + Tailwind + framer-motion | **No adoptado.** Demo ya es Angular 19 + SCSS. |
| `hero-section-9` (21st.dev) | Portado → `marketing-hero.component.ts` (collage + stats). |
| `hero-scroll-video-pin-reveal` (Ajith / 21st) | Portado → `hero-scroll-video-pin-reveal.component.ts` con GSAP ScrollTrigger. |
| `cinematic-logo-cloud` (Nexus UI) | Portado → `cinematic-logo-cloud.component.ts`. |
| Plugins Cursor `component-curator`, `21st-dev-bridge` | Instalar manualmente desde **Cursor Marketplace** (no son paquetes npm). |

### Pendiente explícito (próximo chat)
- Video hero Divorcio360: reemplazar clip Cloudinary demo por footage propio (legal/expediente) si el cliente lo pide
- SaaS multi-tenant (solo columna `product` preparada)
- PDF real minuta, editor minuta
- Deploy Docker, tests E2E
- Reducir bundle inicial (GSAP tree-shake o lazy-load hero)

### Cómo retomar en chat nuevo (Cursor)

1. Abrir carpeta `C:\Users\alech\chamba\divorcio360` en Cursor
2. **New Chat**
3. Primer mensaje sugerido:

   > Lee `docs/HANDOFF.md` (sección **Errores que NO repetir** y **Flujo firma virtual**). Continúa desde ahí. [tu tarea]

4. Rules: `demo-goals.mdc` + `no-patch-stacking.mdc`
5. Tras shippear slice: actualizar `docs/DEMO_GOALS.md`

## Decisiones tomadas con el cliente/usuario

- Carpeta: `chamba/divorcio360`
- Pagos + firma: **full mock** (sin keys Payphone/ECI)
- WhatsApp: **excluido** del demo
- Comunicación agente: modo caveman cuando pidan
- Plan file: `~/.cursor/plans/divorcio360_demo_mvp_*.plan.md` — **no editar** salvo iteración de plan

## Problemas conocidos / tips

| Problema | Solución |
|----------|----------|
| Panel abogado pantalla blanca | Refrescar con fix `blockers`; ver tabla **Errores que NO repetir** |
| «Notificar» y luego «Confirmar» sin firma | Reiniciar API con código actual; notify ya no cambia estado |
| Traslado360 sin botón firmar | Abogado debe generar minuta; cliente ve CTA cuando `can_sign=true` |
| Login/registro en “Procesando…” infinito | Reiniciar API; causa histórica = deadlock notificaciones (corregido) |
| `go run` bloqueado por Windows Application Control | `.\bin\api.exe` tras `go build -o bin\api.exe .\cmd\api` |
| `go` no reconoce | Refrescar PATH o `.\bin\api.exe` |
| Puerto 8080 ocupado | API ya corre; ver sección **Parar el backend** |
| No puedo borrar `.db` | Parar API primero, luego `Remove-Item` |
| Imágenes firma/docs | `/api/v1/files/{name}` es **público** (sin JWT) a propósito |
| Seed no re-ejecuta | Borrar `backend/data/divorcio360.db` y reiniciar API |
| Bundle Angular > 500 kB | Warning esperado; no bloquea demo |

## Checklist demo Traslado360 + firma virtual (15 min)

**Slogan:** *Servicios jurídicos al mismo costo, sin filas ni trámites.*

### Cliente Traslado360
1. `/productos/traslado360` → cuestionario → registro → pago **$199**
2. Upload **matrícula + acuerdo** → consulta `/consulta/:id`
3. Esperar minuta del abogado (o generar en paralelo con abogado)
4. Cuando `can_sign`: **Firmar minuta** desde `/cliente` o `/firma/:id` (sin esperar notificación)
5. Reunión notarial virtual `/reunion-notarial/:id`

### Abogado (mismo u otro browser)
1. `/abogado` → caso Traslado360 → aprobar **matrícula + acuerdo**
2. «Aprobar documentos y preparar minuta» → generar minuta (tab Minuta)
3. Opcional: «**Notificar al cliente**» (estado sigue en 04)
4. Cuando cliente firma → estado **05** → revisar tab **Firmas** → «Confirmar firma recibida»
5. Notaría virtual hasta estado 10

## Checklist demo 15 min (LegalStation multi-producto)

1. `/` LegalStation — **licencia bufete** en `#precios` (no suscripción cliente) + catálogo con Divorcio360, Traslado360, BienRaiz360 live
2. Divorcio360 → cuestionario → **pago único** (recibo) → docs (dropzone) → **consulta virtual** → firma (preview minuta) → **reunión notarial** en expediente
3. Abogado → bandeja → caso #1 → Fase 2 **billing** (link cliente + comisión 15%)
4. Abogado: caso #1 → minuta → **notificar (opcional)** → cliente firma → confirmar en Firmas
5. Fase 2 billing · Notario `/notario`

**Reset DB** tras cambios schema: borrar `backend/data/divorcio360.db` y reiniciar API.

## Checklist demo 12 min (audio stakeholder — por uso + 3 roles)

1. `/` LegalStation — hero collage + catálogo `#catalogo` + pricing + CTA azul índigo
2. `/productos/divorcio360` — **scroll hero GSAP** (headline + video pin + texto sobre video) → galería etapas → clientes logo cloud → pricing
3. Cuestionario → registro con LOPDP → flujo cliente (pago, docs)
4. Login abogado → bandeja SLA → caso #1 → confirmaciones + revert → campana notificaciones
5. Fase 2: Admin híbrido → SATJE sync + Vincular → B2B upgrade
6. Cliente: expediente → Mensajes LegalStation; abogado completa minuta → firma → notaría hasta 10

## Checklist demo 8 min (legacy abogado-first)

1. Login abogado → nav **sin** cuestionario → bandeja stats/tabla → caso #1 (tabs + pipeline)
2. Fase 2: Admin embudo → IA caso #1 → SATJE sync → B2B planes
3. Logout → cliente → cuestionario (grupos + resumen) → verde → pago mock + docs
4. Abogado: aprobar docs → minuta → firma → notaría hasta 10
5. Cliente: expediente actualizado + minuta

## Pendiente / mejoras opcionales (no hechas)

- Deploy (Docker, prod build Angular servido por Go)
- Tests automatizados
- PDF minuta real, multi-tenant SaaS shell, polish visual adicional (Impeccable)

## Comandos útiles

```powershell
# Reset DB + seed limpio
Remove-Item C:\Users\alech\chamba\divorcio360\backend\data\divorcio360.db -ErrorAction SilentlyContinue
go run ./cmd/api

# Build frontend prod
cd frontend; npm run build

# Smoke API
Invoke-RestMethod http://localhost:8080/api/v1/health
```

## Contexto conversación

- PRD + doc firma/pagos leídos desde Downloads (WhatsApp excluido)
- Go instalado vía winget 1.27.0
- Panel abogado funcional implementado 2026-08-29
- Usuario pidió guardar contexto en handoff + cómo retomar chat nuevo
