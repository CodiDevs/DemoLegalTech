# Template Duplicate Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Abogado can duplicate, edit, and delete (copies only) document models on `/abogado/fase2/templates`, persisted in SQLite.

**Architecture:** New `mock_document_templates` table. `GET /mock/templates` seeds if empty. POST duplicate, PATCH edit, DELETE copies. Angular modal gains preview/edit modes. No live minuta wiring.

**Tech Stack:** Go chi + SQLite (`modernc.org/sqlite`), Angular 19 standalone + FormsModule, existing tokens / ConfirmDialog.

## Global Constraints

- Role `abogado` only, same `/api/v1` auth group as other `/mock/*`.
- Status enum exact: `activa` | `diseno` | `proximamente`.
- Copy name suffix: ` (copia)`. Copy status: `diseno`. Copy id: `{id}-copy-{unixNano}`.
- Originals (`source_id` NULL) cannot be deleted (409).
- `preview_html` max 65536 bytes. Error body `{"error":"..."}` in Spanish.
- Do not touch `PatchMasterTemplate` / live minuta flow.
- UI: existing `.btn` / `.panel` / `.field`; no new route.
- Runnable check: `go test ./internal/adminmock/` from `backend/`.
- After ship: `docs/DEMO_GOALS.md` entry. Footer CodiDevs already present.

---

### Task 1: Persist templates API

**Files:**
- Modify: `backend/internal/store/sqlite.go` (CREATE TABLE)
- Create: `backend/internal/adminmock/templates.go`
- Create: `backend/internal/adminmock/templates_test.go`
- Modify: `backend/internal/adminmock/adminmock.go` (remove hardcoded `Templates`)
- Modify: `backend/cmd/api/main.go` (POST/PATCH/DELETE routes)

**Interfaces:**
- Produces: `Templates`, `DuplicateTemplate`, `PatchTemplate`, `DeleteTemplate` on `adminmock.Service`

- [ ] **Step 1:** Failing httptest (seed, duplicate, patch, delete copy, reject delete seed)
- [ ] **Step 2:** Schema + handlers + routes until `go test ./internal/adminmock/` passes

### Task 2: Frontend editor

**Files:**
- Modify: `frontend/src/app/core/api.service.ts`
- Modify: `frontend/src/app/pages/fase2/templates/templates.component.ts`
- Modify: `frontend/src/app/shared/template-field-labels.ts` (canonical token helper)

- [ ] **Step 3:** Duplicate/patch/delete API methods + modal editor (preview/edit, dirty discard, chips)
- [ ] **Step 4:** Browser: login abogado, duplicate, edit, refresh, delete copy

### Task 3: Demo log

**Files:**
- Modify: `docs/DEMO_GOALS.md`

- [ ] **Step 5:** Short walkthrough entry
