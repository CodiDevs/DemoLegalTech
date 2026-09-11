package adminmock

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAIChatRequiresMessage(t *testing.T) {
	s := &Service{}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(`{"case_id":1}`))
	s.AIChat(rec, req)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("code=%d body=%s", rec.Code, rec.Body.String())
	}
}

func TestAIChatMinutaOnCase1(t *testing.T) {
	s := &Service{}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(`{"case_id":1,"message":"¿Listo para minuta?"}`))
	s.AIChat(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("code=%d body=%s", rec.Code, rec.Body.String())
	}
	var out struct {
		Reply string `json:"reply"`
		Demo  bool   `json:"demo"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if !out.Demo {
		t.Fatal("expected demo")
	}
	if out.Reply == "" || !bytes.Contains(rec.Body.Bytes(), []byte("Minuta")) {
		t.Fatalf("reply=%q", out.Reply)
	}
}
