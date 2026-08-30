# PRD scope map (demo)

## In (MVP demo)

- Landing, cuestionario inteligente, cuenta, cédula, partida
- Firma mock, pagos mock, expediente, panel cliente, panel abogado
- Motor de 10 estados

## Out

- WhatsApp / Twilio (FR-09) — no notifications, no CTAs
- Real Payphone / Stripe / ECI firma
- AES-at-rest, production backups, native mobile app

## Fase 2 (mocked only)

| Item | Demo surface |
|------|----------------|
| Panel Socio/Admin | `/fase2/admin` + `/api/v1/mock/admin/metrics` |
| Motor plantillas otros trámites | `/fase2/templates` + `/api/v1/mock/templates` |
| Agente IA expedientes | `/fase2/ai` + `/api/v1/mock/ai/analyze` |
| Sync SATJE | `/fase2/satje` + `/api/v1/mock/satje/sync` |
| Pagos recurrentes B2B | `/fase2/billing` + `/api/v1/mock/billing/recurring` |
| App móvil nativa | `/fase2/mobile` (note: use responsive web) |
