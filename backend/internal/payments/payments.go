package payments

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/products"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	DB    *store.DB
	Cases *cases.Service
}

func (s *Service) MockCheckout(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var clientID int64
	var paid int
	var amount int
	var product string
	err := s.DB.QueryRow(`SELECT client_id, paid, amount_cents, COALESCE(product,'divorcio360') FROM cases WHERE id=?`, caseID).Scan(&clientID, &paid, &amount, &product)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && clientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	if paid == 1 {
		writeErr(w, http.StatusConflict, "caso ya pagado")
		return
	}
	var body struct {
		CardLast4 string `json:"card_last4"`
		Holder    string `json:"holder"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.CardLast4 == "" {
		body.CardLast4 = "4242"
	}
	now := store.Now()
	ref := fmt.Sprintf("PP-MOCK-%d-%d", caseID, store.NowUnix())
	_, err = s.DB.Exec(
		`INSERT INTO payments (case_id, provider, amount_cents, status, reference, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "payphone_mock", amount, "paid", ref, now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "payment error")
		return
	}
	_, _ = s.DB.Exec(`UPDATE cases SET paid=1, updated_at=? WHERE id=?`, now, caseID)
	_ = s.Cases.SetStatus(caseID, "01", fmt.Sprintf("Pago mock Payphone confirmado (%s) — ****%s", ref, body.CardLast4), &u.ID)
	_ = s.Cases.SetStatus(caseID, "02", products.UploadStatusMessage(product), &u.ID)

	writeJSON(w, http.StatusOK, map[string]any{
		"status":        "paid",
		"provider":      "payphone_mock",
		"reference":     ref,
		"amount_cents":  amount,
		"amount_usd":    float64(amount) / 100,
		"card_last4":    body.CardLast4,
		"holder":        body.Holder,
		"message":       "Cobro simulado exitoso (demo)",
		"case_status":   "02",
	})
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
