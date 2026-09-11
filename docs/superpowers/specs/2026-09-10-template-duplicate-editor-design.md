# Fase 2: duplicar y editar modelos de documentos

**Date:** 2026-09-10  
**Status:** Approved; implemented 2026-09-10  
**Surface:** `/abogado/fase2/templates` (rol `abogado`)  
**Goal:** El bufete (cliente de la demo) puede duplicar un modelo, editarlo de verdad, y que el cambio sobreviva refresh.

## Problem

Hoy `Duplicar plantilla` solo muestra un toast. `GET /api/v1/mock/templates` devuelve JSON hardcode. El stakeholder no puede cambiar nada. Fase 2 ya persiste SATJE links y plan B2B en SQLite; plantillas no.

## Out of scope

- No engancha la minuta real del expediente (`lawyer.UploadMinutaNotarial` / `minuta.html`).
- No toca `PATCH /mock/templates/master/{id}` ni `mock_master_template_edits` (admin, no usado en la UI actual).
- No CMS de landing, productos, ni copy de marketing.
- No rol `cliente`. Solo abogado, misma auth que el resto de `/mock/*`.
- No editor WYSIWYG. HTML es textarea + preview.

## Architecture

Una tabla SQLite + cuatro endpoints en `adminmock`. El GET existente cambia de JSON estático a filas en DB, mismo shape de respuesta para no romper el front.

```
abogado → Fase2TemplatesComponent
       → ApiService (GET/POST/PATCH/DELETE)
       → adminmock.Service
       → mock_document_templates
```

Seed en el primer GET si la tabla está vacía (las dos plantillas actuales). `bun run db:reset` borra la DB y vuelve al seed.

## Data

Tabla `mock_document_templates`:

| Column | Type | Notes |
|--------|------|--------|
| `id` | TEXT PK | Seed: `divorcio-notarial`, `sucesion`. Copias: `{idOrigen}-copy-{unixNano}` |
| `source_id` | TEXT NULL | `NULL` = original de seed. Copia: `source_id` = id duplicado (aunque ese ya sea copia). Borrar solo si no null. |
| `name` | TEXT NOT NULL | Copia: `"{name} (copia)"` |
| `category` | TEXT NOT NULL | Default `familia` |
| `status` | TEXT NOT NULL | Exactamente `activa` \| `diseno` \| `proximamente`. Copia nace `diseno`. |
| `version` | TEXT NOT NULL | Copia hereda versión del origen. Editable. |
| `fields_json` | TEXT NOT NULL | JSON array de strings, tokens `{{campo}}` o `campo` |
| `preview_html` | TEXT NOT NULL | HTML de minuta. Max 64 KiB. |
| `versions_json` | TEXT NOT NULL | JSON array `{template_id, version, date, author}` |
| `created_at` | TEXT NOT NULL | RFC3339 |
| `updated_at` | TEXT NOT NULL | RFC3339 |

GET vacío → insertar seed equivalente al JSON actual:

1. `divorcio-notarial` — Divorcio notarial mutuo consentimiento, familia, activa, v1.0, fields `{{cliente_nombre}}` `{{conyuge_nombre}}` `{{ciudad_notaria}}`, preview minuta Divorcio360, una versión 2026-08-01 LegalStation.
2. `sucesion` — Sucesión intestada, familia, proximamente, v0.1, field `{{causante}}`, preview Estate360.

`GET` response shape (sin breaking change):

```json
{
  "demo": true,
  "templates": [ { "id", "name", "category", "active", "status", "version", "fields", "preview_html", "source_id" } ],
  "versions": [ { "template_id", "version", "date", "author" } ]
}
```

`active` se deriva: `status === "activa"`. `versions` es flatten de `versions_json` de todas las filas.

## API

Todas bajo el grupo ya autenticado, `RequireRole("abogado")`.

| Method | Path | Behavior |
|--------|------|----------|
| GET | `/api/v1/mock/templates` | Seed if empty. List + versions. |
| POST | `/api/v1/mock/templates/{id}/duplicate` | Clone row. 404 if id missing. Returns the new template object. |
| PATCH | `/api/v1/mock/templates/{id}` | Partial update of name, category, status, version, fields, preview_html. 404 if missing. 400 if invalid. On success append a versions_json entry (date = today UTC, author = full_name del abogado). Returns updated template. |
| DELETE | `/api/v1/mock/templates/{id}` | 409 if `source_id` is NULL. 404 if missing. 200 `{ok: true}`. |

PATCH validation:

- `name`: required if present, non-empty after trim, max 120 chars.
- `category`: non-empty, max 40 chars.
- `status`: one of the three enums.
- `version`: non-empty, max 32 chars.
- `fields`: array of strings, max 30 items, each token max 60 chars. Store canonical `{{key}}` (strip braces then re-wrap).
- `preview_html`: string, max 65536 bytes.

Error body: `{"error": "<mensaje en español>"}` (mismo helper `writeErr` de `adminmock`).

## UI

Seguir tokens y componentes existentes: `.btn`, `.btn-primary`, `.btn-ghost`, `.panel`, `app-status-badge`, `ConfirmDialog`, `FormsModule` + `ngModel`. Misma página, mismo modal. No ruta nueva. No chrome nuevo.

**Cards**

- Click card → preview (como hoy).
- `Duplicar plantilla` → `stopPropagation` → POST duplicate → inserta card → abre editor de la copia.
- Botón `Editar` en cada card (`stopPropagation`) → abre editor.
- Botón `Borrar` solo si `source_id` no null → `ConfirmDialog` → DELETE → quita card.

**Modal**

Dos modos: `preview` y `edit`.

Preview: HTML + chips + historial + `Editar` + `Cerrar` (como hoy, más CTA Editar).

Edit: labels encima de cada control.

- Nombre (text)
- Categoría (text)
- Estado (select: Activa (MVP) / En diseño / Próximamente)
- Versión (text)
- Campos: input + botón Añadir campo; chips; click chip = quitar
- Texto de la minuta (textarea) + preview HTML al lado (stack en móvil)
- `Guardar cambios` (primary) → PATCH → vuelve a preview del mismo id, toast
- `Cancelar` → si dirty, ConfirmDialog descarte; si no, vuelve a preview
- Backdrop click / Escape: misma regla dirty

Chips visibles usan `friendlyFieldLabel`. El valor guardado es el token.

Loading: botones disabled mientras vuela el request. Error de API visible en el modal (texto, no toast-only).

Toast éxito: `Plantilla duplicada — lista para personalizar` (dup) / `Cambios guardados` (patch) / `Copia eliminada` (delete). 3s.

`[innerHTML]` del preview se mantiene como hoy (abogado autenticado, mock). No sanitizer extra en este slice.

## Errors

| Case | API | UI |
|------|-----|-----|
| id desconocido | 404 | mensaje en modal / toast si dup desde card |
| borrar original | 409 | no mostrar Borrar; si llega, mensaje |
| body inválido | 400 | mensaje bajo el form |
| red / 401 | HttpClient error | mensaje genérico, no perder draft local del form |

## Tests

Un archivo Go `backend/internal/adminmock/templates_test.go` (httptest + sqlite temp):

1. GET seeds two templates.
2. POST duplicate creates a third with `source_id` set and name suffix `(copia)`.
3. PATCH changes name + preview_html; GET reflects it.
4. DELETE copy → 200; GET count 2.
5. DELETE seed → 409.

No suite Karma nueva (ChromeHeadless ya flaky en este repo). El check runnable es `go test ./internal/adminmock/`.

## Demo

Login `abogado@demo.ec` / `demo1234` → Fase 2 → Modelos de documentos → Duplicar → cambiar nombre y un párrafo → Guardar → F5 → sigue ahí. Borrar la copia. Original sigue.

Tras ship: entrada corta en `docs/DEMO_GOALS.md`.

## Files (expected)

- `backend/internal/store/sqlite.go` — CREATE TABLE
- `backend/internal/adminmock/adminmock.go` — handlers (o archivo `templates.go` al lado si el paquete crece)
- `backend/internal/adminmock/templates_test.go`
- `backend/cmd/api/main.go` — tres rutas nuevas
- `frontend/src/app/core/api.service.ts` — duplicate / patch / delete
- `frontend/src/app/pages/fase2/templates/templates.component.ts` — editor
- `docs/DEMO_GOALS.md` — slice demo
