package notary

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/notifications"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	DB    *store.DB
	Cases *cases.Service
}

func (s *Service) ListQueue(w http.ResponseWriter, r *http.Request) {
	rows, err := s.DB.Query(`
		SELECT c.id, c.client_id, c.status, c.product, c.city, c.notary_name, c.appointment_at,
		       c.updated_at, u.full_name, u.email
		FROM cases c JOIN users u ON u.id = c.client_id
		WHERE c.status IN ('06','07','08') OR (c.appointment_at != '' AND c.status >= '05')
		ORDER BY c.updated_at DESC`)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	list := []map[string]any{}
	for rows.Next() {
		var id, clientID int64
		var status, product, city, notary, appt, updated, name, email string
		if rows.Scan(&id, &clientID, &status, &product, &city, &notary, &appt, &updated, &name, &email) != nil {
			continue
		}
		list = append(list, map[string]any{
			"id": id, "client_id": clientID, "status": status,
			"status_label": cases.StatusLabels[status], "product": product,
			"city": city, "notary_name": notary, "appointment_at": appt,
			"updated_at": updated, "client_name": name, "client_email": email,
		})
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *Service) PerformAction(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var body struct {
		Action string `json:"action"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil || body.Action == "" {
		writeErr(w, http.StatusBadRequest, "action requerida")
		return
	}
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	next, note := "", ""
	switch body.Action {
	case "approve_documents":
		if c.Status != "06" && c.Status != "05" {
			writeErr(w, http.StatusBadRequest, "solo casos en firma o enviados a notaría")
			return
		}
		next, note = "07", "Notario aprobó documentos — comparecencia programada"
	case "complete_meeting":
		if c.Status != "07" {
			writeErr(w, http.StatusBadRequest, "acción solo en comparecencia")
			return
		}
		next, note = "08", "Comparecencia virtual completada por notario"
	case "emit_acta":
		if c.Status != "08" {
			writeErr(w, http.StatusBadRequest, "acción solo tras comparecencia")
			return
		}
		next, note = "09", "Acta emitida y firmada digitalmente (mock notario)"
	default:
		writeErr(w, http.StatusBadRequest, "acción desconocida")
		return
	}
	if err := s.Cases.SetStatus(caseID, next, note, &u.ID); err != nil {
		writeErr(w, http.StatusInternalServerError, "error al avanzar")
		return
	}
	notifications.NotifyClient(s.DB, c.ClientID, caseID, "status", "Actualización notarial", cases.StatusLabels[next])
	if c.LawyerID != nil {
		notifications.NotifyUser(s.DB, *c.LawyerID, caseID, "status", "Notario actualizó expediente", note)
	}
	c2, _ := s.Cases.GetCasePublic(caseID)
	writeJSON(w, http.StatusOK, c2)
}

func (s *Service) ScheduleAppointment(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var body struct {
		AppointmentAt string `json:"appointment_at"`
		NotaryName    string `json:"notary_name"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if strings.TrimSpace(body.AppointmentAt) == "" {
		writeErr(w, http.StatusBadRequest, "appointment_at requerido")
		return
	}
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	name := strings.TrimSpace(body.NotaryName)
	if name == "" {
		name = "Notaría LegalStation Demo"
	}
	_, _ = s.DB.Exec(`UPDATE cases SET notary_name=?, appointment_at=? WHERE id=?`, name, body.AppointmentAt, caseID)
	note := "Cliente agendó reunión notarial: " + body.AppointmentAt
	if c.Status == "05" || c.Status == "06" {
		_ = s.Cases.SetStatus(caseID, "06", note, &u.ID)
	} else {
		_, _ = s.DB.Exec(
			`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
			caseID, c.Status, note, u.ID, store.Now(),
		)
	}
	notifications.NotifyNotaries(s.DB, caseID, "appointment", "Nueva cita notarial", note)
	if c.LawyerID != nil {
		notifications.NotifyUser(s.DB, *c.LawyerID, caseID, "appointment", "Cliente agendó notaría", note)
	}
	c2, _ := s.Cases.GetCasePublic(caseID)
	writeJSON(w, http.StatusOK, c2)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
