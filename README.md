# LegalStation — Demo jurídica multi-producto

Demo de plataforma jurídica virtual para walkthrough con stakeholder. Marca UI: **LegalStation** · Productos live: **Divorcio360**, **Traslado360**, **BienRaiz360**.

> *Servicios jurídicos al mismo costo, sin filas ni trámites.*

**Stack:** Go (chi + JWT + SQLite) + Angular 19. Pagos Payphone y firma documental son **demostraciones**. Sin WhatsApp.

Documentación extendida: [`docs/HANDOFF.md`](docs/HANDOFF.md) · Metas demo: [`docs/DEMO_GOALS.md`](docs/DEMO_GOALS.md) · Alcance PRD: [`docs/PRD_SCOPE.md`](docs/PRD_SCOPE.md)

---

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| [Bun](https://bun.sh) | 1.0+ (recomendado para orquestación) |
| Go | 1.22+ (recomendado 1.26+) |
| Node.js / npm | 20+ (opcional si usas Bun) |

---

## Arranque rápido con Bun (Recomendado)

Todo el entorno (API Go + Frontend Angular) se puede levantar con un único comando:

```bash
# 1. Configurar dependencias (primera vez)
bun run setup

# 2. Levantar entorno completo (Backend :8080 + Frontend :4200)
bun run dev
# o directamente: ./dev.sh (Linux/macOS) o .\dev.ps1 (Windows)
```

- **Frontend:** http://localhost:4200 (con proxy hacia `:8080` y Hot-Reload)
- **Backend API:** http://localhost:8080
- **Health check:** `GET http://localhost:8080/api/v1/health`

### Comandos disponibles en Bun

| Comando | Descripción |
|---------|-------------|
| `bun run dev` | Levanta API Go + Angular en paralelo con logs unificados y apagado limpio |
| `bun run dev:clean` | Resetea la base de datos SQLite y levanta todo el entorno |
| `bun run dev:backend` | Levanta únicamente el backend Go (`:8080`) |
| `bun run dev:frontend` | Levanta únicamente el frontend Angular (`:4200`) |
| `bun run doctor` | Diagnostica puertos, Go, dependencias y base de datos |
| `bun run db:reset` | Resetea la base de datos y recrea el seed limpio |
| `bun run setup` | Instala dependencias de frontend y módulos de Go |
| `bun run build` | Compila frontend y backend para producción |
| `bun run test` | Ejecuta suites de prueba de backend y frontend |

---

## Arranque manual (Alternativo)

### Backend (API)

```powershell
cd backend
go mod tidy
go run ./cmd/api
```

- API: http://localhost:8080  
- Health: `GET /api/v1/health`

### Frontend

```powershell
cd frontend
bun install   # o npm install
bun start     # o npm start
```

- App: http://localhost:4200 (proxy → `:8080`)

### Reset de base de datos manual

```bash
bun run db:reset
```


---

## Usuarios demo

| Email | Password | Rol |
|-------|----------|-----|
| `cliente@demo.ec` | `demo1234` | Cliente |
| `abogado@demo.ec` | `demo1234` | Abogado |
| `notario@demo.ec` | `demo1234` | Notario |

**Seed:** caso **#1** (Divorcio360) en estado **03 — Revisión jurídica**, con cédula y partida pendientes de aprobación — punto de entrada para demo del abogado.

---

## Productos y documentos

| Producto | Ruta landing | Honorario demo | Documentos requeridos |
|----------|--------------|----------------|------------------------|
| **Divorcio360** | `/productos/divorcio360` | $349 | Cédula + partida de matrimonio |
| **Traslado360** (vehículo) | `/productos/traslado360` | $199 | Matrícula vehicular + acuerdo de traslado |
| **BienRaiz360** | `/productos/bienraiz360` | $299 | Título del inmueble + acuerdo mutuo |

La lógica de documentos por producto vive en `backend/internal/products/` (fuente única para upload, revisión abogado y pagos).

---

## Flujo del trámite (10 estados)

```
Cuestionario → Registro + LOPDP → Pago mock → Upload docs
→ Revisión abogado (03) → Minuta (04) → Firma cliente (05)
→ Confirmación abogado → Notaría virtual (06–10) → Finalizado
```

### Cliente

1. Elegir producto en LegalStation (`/`) o landing del producto  
2. Cuestionario → registro/login → checkout Payphone mock  
3. **Documentos** (`/upload/:id`) — checklist, drag & drop, reemplazar sin borrar  
4. Consulta virtual (`/consulta/:id`)  
5. Firma virtual (`/firma/:id`) — revisar minuta → subir documento firmado → confirmación → opcional «Firmar de nuevo»  
6. Reunión notarial (`/reunion-notarial/:id`)

### Abogado

- Bandeja: `/abogado` (filtros por estado)  
- Workspace: **`/abogado/caso/:id`** (no usar `/caso/:id` como operador)  
- Tabs: Resumen · Documentos · Minuta · Firmas · Historial  
- Orden: ver y aprobar cada doc (auto pasa a 04) → subir minuta del notario (PDF) → (opcional) notificar cliente → cliente sube documento firmado → confirmar en tab Firmas  

**Blockers por etapa:** en 03 solo docs; en 04 solo minuta; en 05 solo firma — no se mezclan pendientes futuros.

---

## Demo walkthrough (15 min)

### LegalStation + Divorcio360

1. `/` — catálogo LegalStation  
2. `/productos/divorcio360` → cuestionario → registro → pago $349  
3. Upload cédula + partida → consulta → firma  
4. Abogado: `/abogado/caso/1` → ver/aprobar docs → subir minuta notario → cliente sube doc firmado → confirmar → notaría hasta estado 10  

### Traslado360 (carro)

1. `/productos/traslado360/cuestionario` → registro → pago $199  
2. Upload matrícula + acuerdo  
3. Abogado aprueba ambos (auto 04) → sube minuta PDF → cliente sube documento firmado → confirmar  

### Fase 2 (mock)

Rutas abogado: `/fase2/admin`, `/templates`, `/ai`, `/satje`, `/billing`, `/mobile` — badge «Fase 2 · mock».

---

## Verificación automatizada (opcional)

Con la API en `:8080`:

```powershell
powershell -File backend\scripts\verify-flow.ps1
```

---

## Estructura del repo

```
backend/
  cmd/api/              # Entrypoint API
  internal/
    products/           # Docs requeridos por producto
    cases/              # Motor 10 estados + can_sign
    lawyer/             # Workspace abogado, minuta, gates
    docs/               # Upload multipart
    signatures/         # Firma canvas mock
    payments/           # Payphone mock
frontend/src/app/
  pages/saas/           # Landing LegalStation + Divorcio360
  pages/product-site/   # Traslado360 / BienRaiz360
  pages/upload/         # Carga documental
  pages/sign/           # Firma virtual
  pages/lawyer-case/    # Workspace abogado
docs/
  HANDOFF.md            # Memoria técnica completa
  DEMO_GOALS.md         # Log de slices demo
```

---

## Integraciones (demo vs producción)

| Área | Demo | Producción (PRD) |
|------|------|------------------|
| Pagos | Payphone mock UI | Payphone real |
| Firma | Upload PDF/imagen + IP/fecha | ECI / firma en la nube |
| WhatsApp | Excluido | FR-09 en PRD |
| Notaría | Videollamada mock | Comparecencia virtual real |

---

## Desarrollo

- Reglas Cursor: `.cursor/rules/demo-goals.mdc`, `no-patch-stacking.mdc`  
- Al shippear un slice demo → actualizar `docs/DEMO_GOALS.md`  
- Build frontend prod: `cd frontend && npm run build`  
- Build API: `cd backend && go build -o bin/api.exe ./cmd/api`

---

**CodiDevs** · Demo agosto 2026 · No es producción.
