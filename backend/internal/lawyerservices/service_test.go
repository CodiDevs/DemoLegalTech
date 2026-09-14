package lawyerservices

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

func openTestDB(t *testing.T) (*store.DB, int64) {
	t.Helper()
	db, err := store.Open(filepath.Join(t.TempDir(), "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })
	res, err := db.Exec(`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"abogado@demo.ec", "x", "Dra. Ana Ruiz", "", "abogado", store.Now())
	if err != nil {
		t.Fatal(err)
	}
	id, err := res.LastInsertId()
	if err != nil {
		t.Fatal(err)
	}
	return db, id
}

func withUser(r *http.Request, id int64) *http.Request {
	u := &auth.User{ID: id, FullName: "Dra. Ana Ruiz", Role: "abogado"}
	return r.WithContext(context.WithValue(r.Context(), auth.UserCtxKey, u))
}

func withID(r *http.Request, id string) *http.Request {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, rctx))
}

func decodeJSON(t *testing.T, rec *httptest.ResponseRecorder, dest any) {
	t.Helper()
	if err := json.Unmarshal(rec.Body.Bytes(), dest); err != nil {
		t.Fatalf("json: %v body=%s", err, rec.Body.String())
	}
}

func TestLawyerServicesCRUD(t *testing.T) {
	db, lawyerID := openTestDB(t)
	svc := &Service{DB: db}

	t.Run("GET seeds denuncia electronica", func(t *testing.T) {
		rec := httptest.NewRecorder()
		svc.ListMine(rec, withUser(httptest.NewRequest(http.MethodGet, "/api/v1/lawyer/services", nil), lawyerID))
		if rec.Code != http.StatusOK {
			t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
		}
		var p struct {
			Services []Offering `json:"services"`
		}
		decodeJSON(t, rec, &p)
		if len(p.Services) != 1 || p.Services[0].Slug != "denuncia-electronica" {
			t.Fatalf("seed=%v", p.Services)
		}
		if p.Services[0].PriceCents != 18900 {
			t.Fatalf("price=%d", p.Services[0].PriceCents)
		}
	})

	t.Run("POST creates and PATCH updates", func(t *testing.T) {
		body := []byte(`{"name":"Amparo constitucional","category":"administrativo","status":"borrador","price_usd":420,"pitch":"Acción de amparo.","docs":[{"label":"Cédula"}],"questions":[{"prompt":"¿Hay acto lesivo?","kind":"si_no"}]}`)
		rec := httptest.NewRecorder()
		svc.Create(rec, withUser(httptest.NewRequest(http.MethodPost, "/api/v1/lawyer/services", bytes.NewReader(body)), lawyerID))
		if rec.Code != http.StatusCreated {
			t.Fatalf("create %d %s", rec.Code, rec.Body.String())
		}
		var created Offering
		decodeJSON(t, rec, &created)
		if created.Slug != "amparo-constitucional" || created.PriceCents != 42000 {
			t.Fatalf("created=%+v", created)
		}

		patch := []byte(`{"name":"Amparo constitucional","category":"administrativo","status":"publicado","price_usd":450,"pitch":"Acción de amparo.","docs":[{"label":"Cédula"}],"questions":[]}`)
		rec = httptest.NewRecorder()
		req := withUser(withID(httptest.NewRequest(http.MethodPatch, "/api/v1/lawyer/services/"+created.ID, bytes.NewReader(patch)), created.ID), lawyerID)
		svc.Patch(rec, req)
		if rec.Code != http.StatusOK {
			t.Fatalf("patch %d %s", rec.Code, rec.Body.String())
		}
		var updated Offering
		decodeJSON(t, rec, &updated)
		if updated.Status != "publicado" || updated.PriceCents != 45000 {
			t.Fatalf("updated=%+v", updated)
		}
	})

	t.Run("duplicate then delete copy", func(t *testing.T) {
		rec := httptest.NewRecorder()
		svc.Duplicate(rec, withUser(withID(httptest.NewRequest(http.MethodPost, "/api/v1/lawyer/services/svc-denuncia-electronica/duplicate", nil), "svc-denuncia-electronica"), lawyerID))
		if rec.Code != http.StatusCreated {
			t.Fatalf("dup %d %s", rec.Code, rec.Body.String())
		}
		var copy Offering
		decodeJSON(t, rec, &copy)
		if copy.Status != "borrador" || copy.ID == "svc-denuncia-electronica" {
			t.Fatalf("copy=%+v", copy)
		}
		rec = httptest.NewRecorder()
		svc.Delete(rec, withUser(withID(httptest.NewRequest(http.MethodDelete, "/api/v1/lawyer/services/"+copy.ID, nil), copy.ID), lawyerID))
		if rec.Code != http.StatusOK {
			t.Fatalf("delete %d %s", rec.Code, rec.Body.String())
		}
	})

	t.Run("rejects empty name", func(t *testing.T) {
		rec := httptest.NewRecorder()
		svc.Create(rec, withUser(httptest.NewRequest(http.MethodPost, "/api/v1/lawyer/services", bytes.NewReader([]byte(`{"name":""}`))), lawyerID))
		if rec.Code != http.StatusBadRequest {
			t.Fatalf("want 400 got %d", rec.Code)
		}
	})
}

func TestSlugify(t *testing.T) {
	if got := slugify("Denuncia electrónica"); got != "denuncia-electronica" {
		t.Fatalf("got %q", got)
	}
}
