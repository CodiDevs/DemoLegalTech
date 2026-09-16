package adminmock

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"
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

func fixtureDesk() []deskCase {
	return []deskCase{
		{
			ID: 8, Status: "03", Client: "Elena", Product: "divorcio360",
			Created: time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC), Days: 4, SLA: true,
		},
		{
			ID: 15, Status: "05", Client: "Carlos", Product: "divorcio360",
			Created: time.Date(2026, 9, 12, 0, 0, 0, 0, time.UTC), Days: 6,
		},
		{
			ID: 12, Status: "04", Client: "Carlos", Product: "divorcio360",
			Created: time.Date(2026, 9, 5, 0, 0, 0, 0, time.UTC), Days: 1, HasMinuta: true,
		},
		{
			ID: 9, Status: "10", Client: "Ana", Product: "divorcio360",
			Created: time.Date(2026, 7, 1, 0, 0, 0, 0, time.UTC),
		},
	}
}

func TestDeskChatPriorityOldestIntake(t *testing.T) {
	reply := deskChat(fixtureDesk(), 0, "¿Cuál va primero?")
	if !strings.Contains(reply, "#8") {
		t.Fatalf("want oldest intake #8, got %q", reply)
	}
	if !strings.Contains(reply, "1 ago") {
		t.Fatalf("want intake date, got %q", reply)
	}
	low := strings.ToLower(reply)
	if strings.Contains(low, "legible") || strings.Contains(low, "cédula") || strings.Contains(low, "cedula") {
		t.Fatalf("document claim: %q", reply)
	}
}

func TestDeskChatPendingAndBall(t *testing.T) {
	pending := deskChat(fixtureDesk(), 0, "¿Qué está pendiente?")
	if !strings.Contains(pending, "Te toca") || !strings.Contains(pending, "#8") {
		t.Fatalf("pending=%q", pending)
	}
	if !strings.Contains(pending, "Espera al cliente") || !strings.Contains(pending, "#15") {
		t.Fatalf("pending client=%q", pending)
	}
	ball := deskChat(fixtureDesk(), 0, "¿Quién espera?")
	if !strings.Contains(ball, "te espera") || !strings.Contains(ball, "cliente") {
		t.Fatalf("ball=%q", ball)
	}
}

func TestDeskChatRefusesPdf(t *testing.T) {
	reply := deskChat(fixtureDesk(), 8, "¿Qué dice el PDF de la cédula?")
	if !strings.Contains(reply, "No leo") {
		t.Fatalf("%q", reply)
	}
	if strings.Contains(reply, "coinciden") || strings.Contains(strings.ToLower(reply), "legible") {
		t.Fatalf("fake read: %q", reply)
	}
}

func TestDeskChatMinutaIsStage(t *testing.T) {
	ready := deskChat(fixtureDesk(), 12, "¿Listo para minuta?")
	if !strings.Contains(ready, "Minuta") || !strings.Contains(ready, "No leo el archivo") {
		t.Fatalf("minuta ready=%q", ready)
	}
	early := deskChat(fixtureDesk(), 8, "¿Listo para minuta?")
	if !strings.Contains(early, "viene después") {
		t.Fatalf("minuta early=%q", early)
	}
}

func TestAIAnalyzeUsesBandejaNotCrossCheck(t *testing.T) {
	s := &Service{}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(`{"case_id":0}`))
	s.AIAnalyze(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("code=%d body=%s", rec.Code, rec.Body.String())
	}
	var out struct {
		Summary    string `json:"summary"`
		Source     string `json:"source"`
		CrossCheck any    `json:"cross_check"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out.Source != "bandeja" {
		t.Fatalf("source=%q", out.Source)
	}
	if out.CrossCheck != nil {
		t.Fatalf("cross_check=%v", out.CrossCheck)
	}
	if !strings.Contains(out.Summary, "bandeja") && !strings.Contains(out.Summary, "expedientes") {
		t.Fatalf("summary=%q", out.Summary)
	}
	if strings.Contains(strings.ToLower(out.Summary), "legible") {
		t.Fatalf("document claim: %q", out.Summary)
	}
}

func TestAIChatFromSQLiteBandeja(t *testing.T) {
	db := openTestDB(t)
	now := time.Now().UTC()
	old := now.Add(-12 * 24 * time.Hour).Format(time.RFC3339)
	mid := now.Add(-2 * 24 * time.Hour).Format(time.RFC3339)
	abogado, err := db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"abogado@demo.ec", "x", "Ana", "", "abogado", now.Format(time.RFC3339),
	)
	if err != nil {
		t.Fatal(err)
	}
	lawyerID, _ := abogado.LastInsertId()
	cliente, err := db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"cliente@demo.ec", "x", "Elena", "", "cliente", now.Format(time.RFC3339),
	)
	if err != nil {
		t.Fatal(err)
	}
	clientID, _ := cliente.LastInsertId()
	if _, err := db.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		clientID, lawyerID, "03", "apto", "Quito", 1, 34900, "divorcio360", "{}", old, old,
	); err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		clientID, lawyerID, "05", "apto", "Quito", 1, 34900, "divorcio360", "{}", mid, mid,
	); err != nil {
		t.Fatal(err)
	}

	s := &Service{DB: db}
	rec := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/", bytes.NewBufferString(`{"case_id":0,"message":"¿Cuál va primero?"}`))
	s.AIChat(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("code=%d body=%s", rec.Code, rec.Body.String())
	}
	var out struct {
		Reply  string `json:"reply"`
		Source string `json:"source"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatal(err)
	}
	if out.Source != "bandeja" || !strings.Contains(out.Reply, "#1") {
		t.Fatalf("reply=%q source=%q", out.Reply, out.Source)
	}
	if strings.Contains(strings.ToLower(out.Reply), "legible") {
		t.Fatalf("document claim: %q", out.Reply)
	}
}
