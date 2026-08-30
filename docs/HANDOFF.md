# Handoff — Divorcio360 Demo

> Memoria para retomar el proyecto en un chat nuevo. Última actualización: **2026-08-29** (LegalStation UI + hero scroll).

---

## Contexto del proyecto

### Cliente y producto

| Campo | Valor |
|-------|--------|
| **Cliente comercial** | Miguel López & Cía Abogados S.A. *(stakeholder real — no aparece en UI demo)* |
| **Marca demo UI** | **LegalStation** (SaaS) + producto live **Divorcio360** |
| **Desarrollador** | CodiDevs |
| **Producto** | Divorcio360 — plataforma digital de trámite de **divorcio notarial por mutuo consentimiento** (Ecuador) |
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
| 04 | Documentos preparados | Abogado |
| 05 | Firmas | Cliente / Abogado |
| 06 | Enviado a notaría | Abogado |
| 07 | Comparecencia | Abogado |
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
| Frontend | Angular 19 standalone, SCSS, Inter (marketing), proxy → `:8080` |
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
- Error `bind :8080` → API ya corre; no levantar dos veces. `netstat -ano | findstr :8080` + `taskkill /PID <pid> /F` si hace falta.

## Usuarios seed

| Email | Password | Rol |
|-------|----------|-----|
| `cliente@demo.ec` | `demo1234` | Cliente |
| `abogado@demo.ec` | `demo1234` | Abogado |

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

## Flujo automático vs manual (IMPORTANTE)

```
Cuestionario → Registro → Pago mock → estados 01, 02
Upload cédula+partida → estados 02, 03 (automático)
Estado 03: abogado aprueba/rechaza docs → acción "Aprobar y preparar minuta" → 04
Estado 04: generar minuta → "Enviar a firma" → 05
Estado 05: cliente firma → abogado "Confirmar firma" → 06
Estados 06–10: acciones contextuales (notaría, comparecencia, acta, registro)
```

### Panel abogado (post-mejora)

- **Bandeja** `/abogado` — filtros: Todos, Revisión, Firma, Notaría, Cerrados
- **Workspace** `/abogado/caso/:id` — cuestionario, revisión docs, minuta mock, acciones con gates
- Ya **no** existe botón genérico "Avanzar estado"
- APIs: `GET /cases/{id}/workspace`, `POST .../documents/{docId}/review`, `POST .../generate-minuta`, `POST .../actions`

### Por qué el expediente #1 se queda en “Revisión jurídica” (03)

**Es el punto de entrada del demo abogado.** Seed crea caso #1 en `03` con cédula + partida **pending** listos para aprobar.

**Flujo demo abogado:**
1. Login `abogado@demo.ec` → Bandeja → Revisión → Caso #1
2. Aprobar cédula y partida → "Aprobar documentos y preparar minuta"
3. Generar minuta → "Enviar a firma del cliente"
4. Cliente firma → abogado confirma → completar notaría hasta 10

**Reset seed** (si DB vieja sin docs): borrar `backend/data/divorcio360.db` y reiniciar API.

## Estructura clave

```
backend/
  cmd/api/main.go
  internal/auth|cases|questionnaire|payments|docs|signatures|adminmock|lawyer/
  internal/lawyer/templates/minuta.html
  internal/seed/seed.go
frontend/src/app/
  pages/saas/saas-landing.component.ts      — landing LegalStation (Talking Tree layout)
  pages/saas/marketing-hero.component.ts    — hero collage estilo hero-section-9
  pages/saas/landing-icon.component.ts      — iconos SVG productos (sin emojis)
  pages/saas/divorcio-landing.component.ts  — landing producto (terracota)
  layout/shell.component.ts                 — header marketing 3 cols + footer
  styles/landing-shared.scss                — tokens compartidos marketing
  pages/fase2/* (shell + 6 screens)
  shared/ (MetricCard, StatusBadge, ProgressSteps, DataTable, MockBadge)
  core/auth.service.ts, api.service.ts, guards.ts
```

## Última sesión (2026-08-29)

### Hecho — MVP demo inicial
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
- **LegalStation (`/`):** paleta índigo `#4455c4` + `#fdfcfa`. **Divorcio360** producto: terracota `#c45c4a` + `#fffaf8`.
- **Header marketing:** logo | nav centrado (Plataforma, Productos, Precios) | Ingresar + Comenzar. Sin Divorcio360 en nav global.
- **Hero:** `MarketingHeroComponent` — collage 3 imágenes + stats (port Angular de hero-section-9 / 21st.dev). Iconos SVG en productos (`landing-icon.component.ts`), sin emojis.
- **Cajas elevadas:** hover lift en steps, catálogo, capabilities, pricing. CTA panel verde oscuro redondeado (“¿Listo para transformar…?”).
- **Productos:** grid 3×2 tipo botones; carrusel conectado por producto; trust bar grande; footer 4 columnas.
- **Sesión compartida:** login en LegalStation aplica a Divorcio360 (JWT `d360_token`).
- **Regla Cursor:** `.cursor/rules/frontend-design-angular.mdc` — directivas diseño adaptadas a Angular (no shadcn/Tailwind en este repo).

### Stack UI — importante
| Prompt / componente externo | Decisión en este repo |
|----------------------------|------------------------|
| React + shadcn + Tailwind + framer-motion | **No adoptado.** Demo ya es Angular 19 + SCSS. |
| `hero-section-9` (21st.dev) | Portado → `marketing-hero.component.ts` (collage + stats, sin framer-motion). |
| Plugins Cursor `component-curator`, `21st-dev-bridge` | Instalar manualmente desde **Cursor Marketplace** (no son paquetes npm). |

### Pendiente explícito (próximo chat)
- SaaS multi-tenant (solo columna `product` preparada)
- PDF real minuta, notificaciones, editor minuta
- Deploy Docker, tests E2E

### Cómo retomar en chat nuevo (Cursor)

1. Abrir carpeta `C:\Users\alech\chamba\divorcio360` en Cursor
2. **New Chat** (Ctrl+L o botón + en panel chat)
3. Primer mensaje sugerido:

   > Lee `docs/HANDOFF.md` y `docs/DEMO_GOALS.md`. Continúa Divorcio360 desde ahí. [tu tarea]

4. Cursor rules del proyecto ya cargan: demo-goals + no-patch-stacking
5. Docs clave: `HANDOFF.md` (contexto), `DEMO_GOALS.md` (demo checklist), `PRD_SCOPE.md` (alcance)

No hace falta copiar todo el chat — el handoff tiene el estado del proyecto.

## Decisiones tomadas con el cliente/usuario

- Carpeta: `chamba/divorcio360`
- Pagos + firma: **full mock** (sin keys Payphone/ECI)
- WhatsApp: **excluido** del demo
- Comunicación agente: modo caveman cuando pidan
- Plan file: `~/.cursor/plans/divorcio360_demo_mvp_*.plan.md` — **no editar** salvo iteración de plan

## Problemas conocidos / tips

| Problema | Solución |
|----------|----------|
| `go run` bloqueado por Windows Application Control | Usar `.\bin\api.exe` tras `go build -o bin\api.exe .\cmd\api`, desactivar Smart App Control, o WSL/Docker |
| `go` no reconoce | Refrescar PATH o `.\bin\api.exe` |
| Puerto 8080 ocupado | API ya corre; `netstat -ano \| findstr :8080` → `taskkill /PID <pid> /F` |
| No puedo borrar `.db` | Parar API primero (`Ctrl+C` o taskkill puerto 8080), luego `Remove-Item ...` |
| Imágenes firma/docs | `/api/v1/files/{name}` es **público** (sin JWT) a propósito |
| Seed no re-ejecuta | Parar API → borrar `backend/data/divorcio360.db` → `go run ./cmd/api` |

## Checklist demo 10 min (LegalStation → Divorcio360)

1. `/` LegalStation — hero scroll + pills 3×2 + carrusel productos + pricing
2. Divorcio360 → cuestionario → registro con LOPDP → flujo cliente (pago, docs)
3. Login abogado → bandeja SLA → caso #1 → confirmaciones + revert → campana notificaciones
4. Fase 2: Admin híbrido (editar plantilla) → SATJE sync + Vincular → B2B upgrade
5. Cliente: expediente → Mensajes de LegalStation; abogado completa minuta → firma → notaría hasta 10

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
