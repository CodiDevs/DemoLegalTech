package adminmock

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type templatesPayload struct {
	Templates []map[string]any `json:"templates"`
	Versions  []map[string]any `json:"versions"`
}

func openTestDB(t *testing.T) *store.DB {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	return db
}

func decodeJSON(t *testing.T, rec *httptest.ResponseRecorder, dest any) {
	t.Helper()
	if err := json.Unmarshal(rec.Body.Bytes(), dest); err != nil {
		t.Fatalf("json: %v body=%s", err, rec.Body.String())
	}
}

func withID(r *http.Request, id string) *http.Request {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, rctx))
}

func withUser(r *http.Request) *http.Request {
	u := &auth.User{ID: 2, FullName: "Ana Operador", Role: "abogado"}
	return r.WithContext(context.WithValue(r.Context(), auth.UserCtxKey, u))
}

func getTemplates(t *testing.T, svc *Service) templatesPayload {
	t.Helper()
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodGet, "/api/v1/mock/templates", nil)
	svc.Templates(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("GET status %d body=%s", rec.Code, rec.Body.String())
	}
	var p templatesPayload
	decodeJSON(t, rec, &p)
	return p
}

func TestDocumentTemplatesCRUD(t *testing.T) {
	svc := &Service{DB: openTestDB(t)}

	t.Run("GET seeds two templates into sqlite", func(t *testing.T) {
		p := getTemplates(t, svc)
		if len(p.Templates) != 2 {
			t.Fatalf("templates=%d want 2", len(p.Templates))
		}
		var n int
		if err := svc.DB.QueryRow(`SELECT COUNT(*) FROM mock_document_templates`).Scan(&n); err != nil {
			t.Fatal(err)
		}
		if n != 2 {
			t.Fatalf("db count=%d want 2", n)
		}
		ids := map[string]bool{}
		for _, tmpl := range p.Templates {
			id, _ := tmpl["id"].(string)
			ids[id] = true
			if _, ok := tmpl["source_id"]; !ok {
				t.Fatalf("missing source_id on %s", id)
			}
		}
		if !ids["divorcio-notarial"] || !ids["sucesion"] {
			t.Fatalf("seed ids=%v", ids)
		}
	})

	t.Run("POST duplicate creates a named copy", func(t *testing.T) {
		rec := httptest.NewRecorder()
		req := withID(httptest.NewRequest(http.MethodPost, "/api/v1/mock/templates/divorcio-notarial/duplicate", nil), "divorcio-notarial")
		svc.DuplicateTemplate(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("duplicate status %d body=%s", rec.Code, rec.Body.String())
		}
		var created map[string]any
		decodeJSON(t, rec, &created)
		name, _ := created["name"].(string)
		if !strings.Contains(name, "(copia)") {
			t.Fatalf("name=%q want suffix (copia)", name)
		}
		src, _ := created["source_id"].(string)
		if src != "divorcio-notarial" {
			t.Fatalf("source_id=%q", src)
		}
		st, _ := created["status"].(string)
		if st != "diseno" {
			t.Fatalf("status=%q want diseno", st)
		}
		copyID, _ := created["id"].(string)
		if copyID == "" || copyID == "divorcio-notarial" {
			t.Fatalf("id=%q", copyID)
		}

		p := getTemplates(t, svc)
		if len(p.Templates) != 3 {
			t.Fatalf("after dup templates=%d want 3", len(p.Templates))
		}
	})

	t.Run("PATCH persists name and preview_html", func(t *testing.T) {
		p := getTemplates(t, svc)
		var copyID string
		for _, tmpl := range p.Templates {
			if src, _ := tmpl["source_id"].(string); src != "" {
				copyID, _ = tmpl["id"].(string)
				break
			}
		}
		if copyID == "" {
			t.Fatal("no copy to patch")
		}
		body, _ := json.Marshal(map[string]any{
			"name":         "Minuta Quito custom",
			"preview_html": "<p>Cuerpo editado</p>",
		})
		rec := httptest.NewRecorder()
		req := withUser(withID(httptest.NewRequest(http.MethodPatch, "/api/v1/mock/templates/"+copyID, bytes.NewReader(body)), copyID))
		svc.PatchTemplate(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("patch status %d body=%s", rec.Code, rec.Body.String())
		}
		again := getTemplates(t, svc)
		found := false
		for _, tmpl := range again.Templates {
			id, _ := tmpl["id"].(string)
			if id != copyID {
				continue
			}
			found = true
			if tmpl["name"] != "Minuta Quito custom" {
				t.Fatalf("name=%v", tmpl["name"])
			}
			html, _ := tmpl["preview_html"].(string)
			if !strings.Contains(html, "Cuerpo editado") {
				t.Fatalf("preview_html=%q", html)
			}
		}
		if !found {
			t.Fatal("copy missing after patch")
		}
	})

	t.Run("DELETE copy then reject delete seed", func(t *testing.T) {
		p := getTemplates(t, svc)
		var copyID string
		for _, tmpl := range p.Templates {
			if src, _ := tmpl["source_id"].(string); src != "" {
				copyID, _ = tmpl["id"].(string)
				break
			}
		}
		rec := httptest.NewRecorder()
		req := withID(httptest.NewRequest(http.MethodDelete, "/api/v1/mock/templates/"+copyID, nil), copyID)
		svc.DeleteTemplate(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("delete copy status %d body=%s", rec.Code, rec.Body.String())
		}
		after := getTemplates(t, svc)
		if len(after.Templates) != 2 {
			t.Fatalf("after delete templates=%d want 2", len(after.Templates))
		}

		rec2 := httptest.NewRecorder()
		req2 := withID(httptest.NewRequest(http.MethodDelete, "/api/v1/mock/templates/divorcio-notarial", nil), "divorcio-notarial")
		svc.DeleteTemplate(rec2, req2)
		if rec2.Code != http.StatusConflict {
			t.Fatalf("delete seed status %d want 409 body=%s", rec2.Code, rec2.Body.String())
		}
	})
}
