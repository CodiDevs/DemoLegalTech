package signatures

import (
	"bytes"
	"context"
	"encoding/json"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"testing"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

func withID(r *http.Request, id string) *http.Request {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)
	return r.WithContext(context.WithValue(r.Context(), chi.RouteCtxKey, rctx))
}

func withUser(r *http.Request, u *auth.User) *http.Request {
	return r.WithContext(context.WithValue(r.Context(), auth.UserCtxKey, u))
}

func newSignEnv(t *testing.T) (*Service, *auth.User, int64) {
	t.Helper()
	root := t.TempDir()
	uploadDir := filepath.Join(root, "uploads")
	fixtures := filepath.Join(root, "demo-fixtures")
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(fixtures, 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(filepath.Join(fixtures, "firma-demo.pdf"), []byte("%PDF-1.4 demo-esign"), 0o644); err != nil {
		t.Fatal(err)
	}
	db, err := store.Open(filepath.Join(root, "t.db"))
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { _ = db.Close() })

	now := store.Now()
	res, err := db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"c@t.ec", "x", "Cliente", "", "cliente", now,
	)
	if err != nil {
		t.Fatal(err)
	}
	clientID, _ := res.LastInsertId()
	res, err = db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"a@t.ec", "x", "Abogado", "", "abogado", now,
	)
	if err != nil {
		t.Fatal(err)
	}
	lawyerID, _ := res.LastInsertId()
	res, err = db.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		clientID, lawyerID, "04", "apto", "Quito", 1, 34900, "divorcio360", "{}", now, now,
	)
	if err != nil {
		t.Fatal(err)
	}
	caseID, _ := res.LastInsertId()
	_, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "cedula", "c.pdf", "c.pdf", "application/pdf", 1, clientID, "approved", now,
	)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "partida", "p.pdf", "p.pdf", "application/pdf", 1, clientID, "approved", now,
	)
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(
		`INSERT INTO case_outputs (case_id, output_type, filename, stored_path, generated_by, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "minuta", "m.pdf", "m.pdf", lawyerID, now,
	)
	if err != nil {
		t.Fatal(err)
	}

	svc := &Service{DB: db, Cases: &cases.Service{DB: db}, UploadDir: uploadDir}
	user := &auth.User{ID: clientID, Email: "c@t.ec", FullName: "Cliente", Role: "cliente"}
	return svc, user, caseID
}

func postSign(t *testing.T, svc *Service, user *auth.User, caseID int64, body *bytes.Buffer, contentType string) *httptest.ResponseRecorder {
	t.Helper()
	rec := httptest.NewRecorder()
	id := strconv.FormatInt(caseID, 10)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/cases/"+id+"/signatures", body)
	req.Header.Set("Content-Type", contentType)
	req = withID(req, id)
	req = withUser(req, user)
	svc.Sign(rec, req)
	return rec
}

func TestSignPlatformAppliesFixtureAndCharges(t *testing.T) {
	svc, user, caseID := newSignEnv(t)
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	if err := mw.WriteField("channel", ChannelPlatform); err != nil {
		t.Fatal(err)
	}
	if err := mw.Close(); err != nil {
		t.Fatal(err)
	}
	rec := postSign(t, svc, user, caseID, &buf, mw.FormDataContentType())
	if rec.Code != http.StatusCreated {
		t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
	}
	var sg Signature
	if err := json.Unmarshal(rec.Body.Bytes(), &sg); err != nil {
		t.Fatal(err)
	}
	if sg.Channel != ChannelPlatform {
		t.Fatalf("channel=%q", sg.Channel)
	}
	if sg.FeeCents != PlatformFeeCents {
		t.Fatalf("fee=%d want %d", sg.FeeCents, PlatformFeeCents)
	}
	var amount int
	var n int
	if err := svc.DB.QueryRow(
		`SELECT COUNT(*), COALESCE(MAX(amount_cents),0) FROM payments WHERE case_id=? AND provider='payphone_esign_mock'`,
		caseID,
	).Scan(&n, &amount); err != nil {
		t.Fatal(err)
	}
	if n != 1 || amount != PlatformFeeCents {
		t.Fatalf("payments n=%d amount=%d", n, amount)
	}
	var status string
	if err := svc.DB.QueryRow(`SELECT status FROM cases WHERE id=?`, caseID).Scan(&status); err != nil {
		t.Fatal(err)
	}
	if status != "05" {
		t.Fatalf("status=%s want 05", status)
	}
	stored := filepath.Base(sg.ImageURL)
	b, err := os.ReadFile(filepath.Join(svc.UploadDir, stored))
	if err != nil {
		t.Fatal(err)
	}
	if !bytes.Contains(b, []byte("demo-esign")) {
		t.Fatalf("stored file missing fixture bytes: %q", b)
	}
}

func TestSignPlatformStoresDrawnPng(t *testing.T) {
	svc, user, caseID := newSignEnv(t)
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	if err := mw.WriteField("channel", ChannelPlatform); err != nil {
		t.Fatal(err)
	}
	fw, err := mw.CreateFormFile("file", "firma-legalstation.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("png-asset")); err != nil {
		t.Fatal(err)
	}
	if err := mw.Close(); err != nil {
		t.Fatal(err)
	}
	rec := postSign(t, svc, user, caseID, &buf, mw.FormDataContentType())
	if rec.Code != http.StatusCreated {
		t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
	}
	var sg Signature
	if err := json.Unmarshal(rec.Body.Bytes(), &sg); err != nil {
		t.Fatal(err)
	}
	if !strings.HasSuffix(sg.ImageURL, ".png") {
		t.Fatalf("image_url=%q want png", sg.ImageURL)
	}
	stored := filepath.Base(sg.ImageURL)
	b, err := os.ReadFile(filepath.Join(svc.UploadDir, stored))
	if err != nil {
		t.Fatal(err)
	}
	if string(b) != "png-asset" {
		t.Fatalf("stored=%q", b)
	}
}

func TestSignUploadRequiresFile(t *testing.T) {
	svc, user, caseID := newSignEnv(t)
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	if err := mw.WriteField("channel", ChannelUpload); err != nil {
		t.Fatal(err)
	}
	if err := mw.Close(); err != nil {
		t.Fatal(err)
	}
	rec := postSign(t, svc, user, caseID, &buf, mw.FormDataContentType())
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
	}
}

func TestSignUploadStoresFile(t *testing.T) {
	svc, user, caseID := newSignEnv(t)
	var buf bytes.Buffer
	mw := multipart.NewWriter(&buf)
	fw, err := mw.CreateFormFile("file", "firmado.png")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := fw.Write([]byte("png-bytes")); err != nil {
		t.Fatal(err)
	}
	if err := mw.Close(); err != nil {
		t.Fatal(err)
	}
	rec := postSign(t, svc, user, caseID, &buf, mw.FormDataContentType())
	if rec.Code != http.StatusCreated {
		t.Fatalf("status %d body=%s", rec.Code, rec.Body.String())
	}
	var sg Signature
	if err := json.Unmarshal(rec.Body.Bytes(), &sg); err != nil {
		t.Fatal(err)
	}
	if sg.Channel != ChannelUpload {
		t.Fatalf("channel=%q", sg.Channel)
	}
	if sg.FeeCents != 0 {
		t.Fatalf("fee=%d want 0", sg.FeeCents)
	}
	var n int
	if err := svc.DB.QueryRow(
		`SELECT COUNT(*) FROM payments WHERE case_id=? AND provider='payphone_esign_mock'`,
		caseID,
	).Scan(&n); err != nil {
		t.Fatal(err)
	}
	if n != 0 {
		t.Fatalf("unexpected esign payment count=%d", n)
	}
}
