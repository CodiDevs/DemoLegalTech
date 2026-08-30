# Divorcio360 (demo)

Plataforma demo de divorcio notarial por mutuo consentimiento — Miguel López & Cía / CodiDevs.

**Stack:** Go (chi + SQLite) + Angular. Pagos Payphone y firma electrónica son **mocks**. Sin WhatsApp.

## Requisitos

- Go 1.22+
- Node 20+ / npm

## Arranque

### API

```bash
cd backend
go mod tidy
go run ./cmd/api
```

API: `http://localhost:8080` — health: `GET /api/v1/health`

### Frontend

```bash
cd frontend
npm install
npm start
```

App: `http://localhost:4200`

## Usuarios seed

| Email | Password | Rol |
|-------|----------|-----|
| `cliente@demo.ec` | `demo1234` | Cliente |
| `abogado@demo.ec` | `demo1234` | Abogado |

Hay un caso seed del cliente en estado **03 Revisión jurídica** con cédula y partida listos para que el abogado apruebe.

**Importante:** si ya tenías DB antigua, borra `backend/data/divorcio360.db` y reinicia la API para cargar el seed nuevo.

## Demo walkthrough

1. Landing → Cuestionario (respuestas aptas) → Registro o login cliente
2. Pago mock Payphone $349 → subir cédula + partida
3. Login **abogado** → Bandeja → filtro Revisión → `/abogado/caso/1`
4. Aprobar documentos → Generar minuta → Enviar a firma
5. Login **cliente** → Firmar → abogado confirma firma → completar notaría (06–10)
6. Menú Fase 2 → pantallas mock

Ver `docs/DEMO_GOALS.md` y `docs/PRD_SCOPE.md`.
