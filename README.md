# LegalStation — Demo jurídica multi-producto

Demo de plataforma jurídica virtual para walkthrough con stakeholder. Marca UI: **LegalStation** · Productos live: **Divorcio360**, **Traslado360**, **BienRaiz360**.

> *Servicios jurídicos al mismo costo, sin filas ni trámites.*

**Stack:** Go (chi + JWT + SQLite) + Angular 19. Pagos Payphone y firma electrónica son **mocks**. Sin WhatsApp.

Documentación extendida: [`docs/HANDOFF.md`](docs/HANDOFF.md) · Metas demo: [`docs/DEMO_GOALS.md`](docs/DEMO_GOALS.md) · Alcance PRD: [`docs/PRD_SCOPE.md`](docs/PRD_SCOPE.md)

---

## Requisitos

| Herramienta | Versión |
|-------------|---------|
| Go | 1.22+ (recomendado 1.27) |
| Node.js / npm | 20+ |

---

## Arranque rápido

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
npm install
npm start
```

- App: http://localhost:4200 (proxy → `:8080`)

### Parar la API

```powershell
# Ctrl+C en la terminal del backend, o:
Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

### Reset de base de datos (seed limpio)

```powershell
# Parar la API primero
Remove-Item backend\data\divorcio360.db -ErrorAction SilentlyContinue
go run ./cmd/api
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
5. Firma virtual (`/firma/:id`) — enviar firma → confirmación → opcional «Firmar de nuevo»  
6. Reunión notarial (`/reunion-notarial/:id`)

### Abogado

- Bandeja: `/abogado` (filtros por estado)  
- Workspace: **`/abogado/caso/:id`** (no usar `/caso/:id` como operador)  
- Tabs: Resumen · Documentos · Minuta · Firmas · Historial  
- Orden: aprobar docs → «Aprobar documentos y preparar minuta» → generar minuta → (opcional) notificar cliente → confirmar firma en tab Firmas  

**Blockers por etapa:** en 03 solo docs; en 04 solo minuta; en 05 solo firma — no se mezclan pendientes futuros.

---

## Demo walkthrough (15 min)

### LegalStation + Divorcio360

1. `/` — catálogo LegalStation  
2. `/productos/divorcio360` → cuestionario → registro → pago $349  
3. Upload cédula + partida → consulta → firma  
4. Abogado: `/abogado/caso/1` → aprobar → minuta → confirmar firma → notaría hasta estado 10  

### Traslado360 (carro)

1. `/productos/traslado360/cuestionario` → registro → pago $199  
2. Upload matrícula + acuerdo  
3. Abogado aprueba ambos → minuta → cliente firma → confirmar  

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
| Firma | Canvas + IP/fecha | ECI / firma en la nube |
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
