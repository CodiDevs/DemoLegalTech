package cases

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/notifications"
	"github.com/codidevs/divorcio360/internal/products"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

var StatusLabels = map[string]string{
	"01": "Información recibida",
	"02": "Documentos pendientes",
	"03": "Revisión jurídica",
	"04": "Documentos preparados",
	"05": "Firmas",
	"06": "Enviado a notaría",
	"07": "Comparecencia",
	"08": "Acta emitida",
	"09": "Registro",
	"10": "Finalizado",
}

var nextStatus = map[string]string{
	"01": "02", "02": "03", "03": "04", "04": "05",
	"05": "06", "06": "07", "07": "08", "08": "09", "09": "10",
}

type Service struct {
	DB *store.DB
}

type Case struct {
	ID                 int64  `json:"id"`
	ClientID           int64  `json:"client_id"`
	LawyerID           *int64 `json:"lawyer_id,omitempty"`
	Status             string `json:"status"`
	StatusLabel        string `json:"status_label"`
	Result             string `json:"result"`
	City               string `json:"city"`
	Paid               bool   `json:"paid"`
	AmountCents        int    `json:"amount_cents"`
	Product            string `json:"product"`
	QuestionnaireJSON  string `json:"questionnaire_json,omitempty"`
	NotaryName         string `json:"notary_name,omitempty"`
	AppointmentAt      string `json:"appointment_at,omitempty"`
	ConsultationAt     string `json:"consultation_at,omitempty"`
	CreatedAt          string `json:"created_at"`
	UpdatedAt          string `json:"updated_at"`
	ClientName         string `json:"client_name,omitempty"`
	ClientEmail        string `json:"client_email,omitempty"`
	DaysInStatus       int    `json:"days_in_status,omitempty"`
	SLAWarning         bool   `json:"sla_warning,omitempty"`
	HasMinuta          bool   `json:"has_minuta,omitempty"`
	HasSignature       bool   `json:"has_signature,omitempty"`
	CanSign            bool   `json:"can_sign,omitempty"`
	SignHint           string `json:"sign_hint,omitempty"`
}

type Event struct {
	ID        int64  `json:"id"`
	CaseID    int64  `json:"case_id"`
	Status    string `json:"status"`
	Label     string `json:"status_label"`
	Note      string `json:"note"`
	ActorID   *int64 `json:"actor_id,omitempty"`
	CreatedAt string `json:"created_at"`
}

type Note struct {
	ID         int64  `json:"id"`
	CaseID     int64  `json:"case_id"`
	AuthorID   int64  `json:"author_id"`
	AuthorName string `json:"author_name"`
	Body             string `json:"body"`
	VisibleToClient  bool   `json:"visible_to_client,omitempty"`
	CreatedAt        string `json:"created_at"`
}

func (s *Service) Create(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	var body struct {
		Result        string          `json:"result"`
		City          string          `json:"city"`
		Product       string          `json:"product"`
		Questionnaire json.RawMessage `json:"questionnaire"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if body.Result == "" {
		body.Result = "apto"
	}
	qJSON := "{}"
	if len(body.Questionnaire) > 0 {
		qJSON = string(body.Questionnaire)
	}
	now := store.Now()
	var lawyerID sql.NullInt64
	_ = s.DB.QueryRow(`SELECT id FROM users WHERE role='abogado' ORDER BY id LIMIT 1`).Scan(&lawyerID)
	product := products.ResolveProduct(body.Product, qJSON)
	amount := productAmount(product, body.Result)
	res, err := s.DB.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		u.ID, nullInt(lawyerID), "00", body.Result, body.City, 0, amount, product, qJSON, now, now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo crear caso")
		return
	}
	id, _ := res.LastInsertId()
	c, err := s.getCase(id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "caso creado sin lectura")
		return
	}
	writeJSON(w, http.StatusCreated, c)
}

func (s *Service) ListMine(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	var rows *sql.Rows
	var err error
	if u.Role == "abogado" {
		rows, err = s.DB.Query(`
			SELECT c.id, c.client_id, c.lawyer_id, c.status, c.result, c.city, c.paid, c.amount_cents,
			       c.product, c.questionnaire_json, c.notary_name, c.appointment_at, c.consultation_at,
			       c.created_at, c.updated_at, u.full_name, u.email
			FROM cases c JOIN users u ON u.id = c.client_id
			ORDER BY c.updated_at DESC`)
	} else if u.Role == "notario" {
		rows, err = s.DB.Query(`
			SELECT c.id, c.client_id, c.lawyer_id, c.status, c.result, c.city, c.paid, c.amount_cents,
			       c.product, c.questionnaire_json, c.notary_name, c.appointment_at, c.consultation_at,
			       c.created_at, c.updated_at, u.full_name, u.email
			FROM cases c JOIN users u ON u.id = c.client_id
			WHERE c.status IN ('06','07','08') OR c.appointment_at != ''
			ORDER BY c.updated_at DESC`)
	} else {
		rows, err = s.DB.Query(`
			SELECT c.id, c.client_id, c.lawyer_id, c.status, c.result, c.city, c.paid, c.amount_cents,
			       c.product, c.questionnaire_json, c.notary_name, c.appointment_at, c.consultation_at,
			       c.created_at, c.updated_at, u.full_name, u.email
			FROM cases c JOIN users u ON u.id = c.client_id
			WHERE c.client_id = ?
			ORDER BY c.updated_at DESC`, u.ID)
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	list := []Case{}
	for rows.Next() {
		c, err := scanCase(rows)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "scan error")
			return
		}
		list = append(list, enrichCaseMeta(s, c))
	}
	writeJSON(w, http.StatusOK, list)
}

func enrichCaseSLA(s *Service, c Case) Case {
	c.DaysInStatus = s.daysInStatus(c.ID, c.Status, c.UpdatedAt)
	c.SLAWarning = c.Status == "03" && c.DaysInStatus >= 2
	return c
}

func enrichCaseMeta(s *Service, c Case) Case {
	c = enrichCaseSLA(s, c)
	return enrichSigning(s, c)
}

func enrichSigning(s *Service, c Case) Case {
	var minuta, sig int
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM case_outputs WHERE case_id=? AND output_type='minuta'`, c.ID).Scan(&minuta)
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM signatures WHERE case_id=?`, c.ID).Scan(&sig)
	c.HasMinuta = minuta > 0
	c.HasSignature = sig > 0
	c.CanSign = c.HasMinuta && (c.Status == "03" || c.Status == "04" || c.Status == "05")
	switch {
	case c.CanSign && c.HasSignature:
		c.SignHint = "Firma registrada — puedes volver a firmar si lo necesitas (100% virtual)"
	case c.CanSign:
		c.SignHint = "Minuta lista — firma virtual desde tu expediente, sin ir presencialmente"
	case c.HasMinuta && c.Status < "03":
		c.SignHint = "Tu abogado prepara la minuta — te avisaremos cuando puedas firmar"
	case !c.HasMinuta && (c.Status == "03" || c.Status == "04" || c.Status == "05"):
		c.SignHint = "Esperando minuta del abogado"
	}
	return c
}

func (s *Service) daysInStatus(caseID int64, status, updatedAt string) int {
	var at string
	err := s.DB.QueryRow(
		`SELECT created_at FROM case_events WHERE case_id=? AND status=? ORDER BY id DESC LIMIT 1`,
		caseID, status,
	).Scan(&at)
	if err != nil || at == "" {
		at = updatedAt
	}
	t, err := time.Parse(time.RFC3339, at)
	if err != nil {
		return 0
	}
	d := int(time.Since(t).Hours() / 24)
	if d < 0 {
		return 0
	}
	return d
}

func (s *Service) Get(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	u := auth.UserFrom(r.Context())
	c, err := s.getCase(id)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	if u.Role == "notario" && c.Status < "05" {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	events, _ := s.listEvents(id)
	notes, _ := s.listNotes(id)
	clientMsgs, _ := s.listClientMessages(id)
	c = enrichCaseMeta(s, c)
	payload := map[string]any{
		"case":            c,
		"events":          events,
		"notes":           notes,
		"client_messages": clientMsgs,
		"states":          StatusLabels,
	}
	if u.Role == "cliente" {
		payload["notes"] = clientMsgs
	}
	writeJSON(w, http.StatusOK, payload)
}

func (s *Service) AddNote(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var body struct {
		Body            string `json:"body"`
		VisibleToClient bool   `json:"visible_to_client"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Body == "" {
		writeErr(w, http.StatusBadRequest, "body requerido")
		return
	}
	vis := 0
	if u.Role == "abogado" && body.VisibleToClient {
		vis = 1
	}
	now := store.Now()
	res, err := s.DB.Exec(
		`INSERT INTO case_notes (case_id, author_id, body, visible_to_client, created_at) VALUES (?,?,?,?,?)`,
		id, u.ID, body.Body, vis, now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "note error")
		return
	}
	nid, _ := res.LastInsertId()
	if vis == 1 {
		if c, err := s.getCase(id); err == nil {
			notifications.NotifyClient(s.DB, c.ClientID, id, "message", "Mensaje de LegalStation", body.Body)
		}
	}
	writeJSON(w, http.StatusCreated, Note{
		ID: nid, CaseID: id, AuthorID: u.ID, AuthorName: u.FullName, Body: body.Body,
		VisibleToClient: vis == 1, CreatedAt: now,
	})
}

func (s *Service) SetStatus(id int64, status, note string, actorID *int64) error {
	now := store.Now()
	_, err := s.DB.Exec(`UPDATE cases SET status=?, updated_at=? WHERE id=?`, status, now, id)
	if err != nil {
		return err
	}
	_, err = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		id, status, note, actorID, now,
	)
	return err
}

func (s *Service) GetCasePublic(id int64) (Case, error) {
	return s.getCase(id)
}

func (s *Service) ScheduleConsultation(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var body struct {
		ConsultationAt string `json:"consultation_at"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if strings.TrimSpace(body.ConsultationAt) == "" {
		writeErr(w, http.StatusBadRequest, "consultation_at requerido")
		return
	}
	c, err := s.getCase(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	_, _ = s.DB.Exec(`UPDATE cases SET consultation_at=? WHERE id=?`, body.ConsultationAt, caseID)
	note := "Cliente agendó consulta con abogado: " + body.ConsultationAt
	_, _ = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, c.Status, note, u.ID, store.Now(),
	)
	if c.LawyerID != nil {
		notifications.NotifyUser(s.DB, *c.LawyerID, caseID, "consultation", "Consulta agendada", note)
	}
	c2, _ := s.getCase(caseID)
	writeJSON(w, http.StatusOK, c2)
}

func (s *Service) RequestMeeting(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	var body struct {
		ScheduledAt string `json:"scheduled_at"`
		Product     string `json:"product"`
		Context     string `json:"context"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if strings.TrimSpace(body.ScheduledAt) == "" {
		writeErr(w, http.StatusBadRequest, "scheduled_at requerido")
		return
	}
	note := fmt.Sprintf("Solicitud de reunión (%s) — %s · producto %s", body.Context, body.ScheduledAt, body.Product)
	notifications.NotifyLawyersForCase(s.DB, 0, "meeting_request", "Nueva solicitud de reunión", note+" · cliente #"+strconv.FormatInt(u.ID, 10))
	writeJSON(w, http.StatusOK, map[string]string{"ok": "true", "message": note})
}

func (s *Service) CompleteConsultation(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := s.getCase(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	now := store.Now()
	_, _ = s.DB.Exec(`UPDATE cases SET consultation_at=? WHERE id=?`, now, caseID)
	note := "Consulta con abogado completada (videollamada demo)"
	_, _ = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, c.Status, note, u.ID, now,
	)
	if c.LawyerID != nil {
		notifications.NotifyUser(s.DB, *c.LawyerID, caseID, "consultation", "Consulta completada", note)
	}
	c2, _ := s.getCase(caseID)
	writeJSON(w, http.StatusOK, c2)
}

func (s *Service) ListEventsPublic(caseID int64) ([]Event, error) {
	return s.listEvents(caseID)
}

func (s *Service) ListNotesPublic(caseID int64) ([]Note, error) {
	return s.listNotes(caseID)
}

func (s *Service) getCase(id int64) (Case, error) {
	row := s.DB.QueryRow(`
		SELECT c.id, c.client_id, c.lawyer_id, c.status, c.result, c.city, c.paid, c.amount_cents,
		       c.product, c.questionnaire_json, c.notary_name, c.appointment_at, c.consultation_at,
		       c.created_at, c.updated_at, u.full_name, u.email
		FROM cases c JOIN users u ON u.id = c.client_id WHERE c.id = ?`, id)
	return scanCase(row)
}

type scanner interface {
	Scan(dest ...any) error
}

func scanCase(row scanner) (Case, error) {
	var c Case
	var lid sql.NullInt64
	var paid int
	err := row.Scan(&c.ID, &c.ClientID, &lid, &c.Status, &c.Result, &c.City, &paid, &c.AmountCents,
		&c.Product, &c.QuestionnaireJSON, &c.NotaryName, &c.AppointmentAt, &c.ConsultationAt,
		&c.CreatedAt, &c.UpdatedAt, &c.ClientName, &c.ClientEmail)
	if err != nil {
		return c, err
	}
	c.Paid = paid == 1
	if lid.Valid {
		v := lid.Int64
		c.LawyerID = &v
	}
	if c.Status == "00" {
		c.StatusLabel = "Pendiente de pago"
	} else {
		c.StatusLabel = StatusLabels[c.Status]
	}
	return c, nil
}

func (s *Service) listEvents(caseID int64) ([]Event, error) {
	rows, err := s.DB.Query(
		`SELECT id, case_id, status, note, actor_id, created_at FROM case_events WHERE case_id=? ORDER BY id`, caseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Event{}
	for rows.Next() {
		var e Event
		var aid sql.NullInt64
		if err := rows.Scan(&e.ID, &e.CaseID, &e.Status, &e.Note, &aid, &e.CreatedAt); err != nil {
			return nil, err
		}
		if aid.Valid {
			v := aid.Int64
			e.ActorID = &v
		}
		e.Label = StatusLabels[e.Status]
		out = append(out, e)
	}
	return out, nil
}

func (s *Service) listClientMessages(caseID int64) ([]Note, error) {
	rows, err := s.DB.Query(`
		SELECT n.id, n.case_id, n.author_id, u.full_name, n.body, n.created_at
		FROM case_notes n JOIN users u ON u.id = n.author_id
		WHERE n.case_id=? AND n.visible_to_client=1 ORDER BY n.id`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Note{}
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.CaseID, &n.AuthorID, &n.AuthorName, &n.Body, &n.CreatedAt); err != nil {
			return nil, err
		}
		n.VisibleToClient = true
		out = append(out, n)
	}
	return out, nil
}

func (s *Service) listNotes(caseID int64) ([]Note, error) {
	rows, err := s.DB.Query(`
		SELECT n.id, n.case_id, n.author_id, u.full_name, n.body, n.created_at
		FROM case_notes n JOIN users u ON u.id = n.author_id
		WHERE n.case_id=? ORDER BY n.id`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Note{}
	for rows.Next() {
		var n Note
		if err := rows.Scan(&n.ID, &n.CaseID, &n.AuthorID, &n.AuthorName, &n.Body, &n.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, n)
	}
	return out, nil
}

func nullInt(n sql.NullInt64) any {
	if n.Valid {
		return n.Int64
	}
	return nil
}

func productAmount(product, result string) int {
	switch product {
	case "traslado360":
		return 19900
	case "bienraiz360":
		return 29900
	default:
		if result == "evaluacion" {
			return 74900
		}
		return 34900
	}
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
