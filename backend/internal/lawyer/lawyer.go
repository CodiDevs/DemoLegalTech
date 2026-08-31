package lawyer

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"text/template"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/notifications"
	"github.com/codidevs/divorcio360/internal/products"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	DB        *store.DB
	Cases     *cases.Service
	UploadDir string
}

type ActionDef struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description,omitempty"`
}

type Workspace struct {
	Case          cases.Case              `json:"case"`
	Events        []cases.Event           `json:"events"`
	Notes         []cases.Note            `json:"notes"`
	Documents     []Document              `json:"documents"`
	Signatures    []Signature             `json:"signatures"`
	Outputs       []Output                `json:"outputs"`
	States        map[string]string       `json:"states"`
	NextActions   []ActionDef             `json:"next_actions"`
	Blockers      []string                `json:"blockers"`
	Questionnaire map[string]any          `json:"questionnaire"`
	RequiredDocs  []products.RequiredDoc  `json:"required_docs"`
	StageHint     string                  `json:"stage_hint"`
}

type Document struct {
	ID           int64  `json:"id"`
	CaseID       int64  `json:"case_id"`
	DocType      string `json:"doc_type"`
	Filename     string `json:"filename"`
	Mime         string `json:"mime"`
	SizeBytes    int64  `json:"size_bytes"`
	ReviewStatus string `json:"review_status"`
	ReviewNote   string `json:"review_note,omitempty"`
	URL          string `json:"url"`
	CreatedAt    string `json:"created_at"`
}

type Signature struct {
	ID        int64  `json:"id"`
	ImageURL  string `json:"image_url"`
	IP        string `json:"ip"`
	SignedAt  string `json:"signed_at"`
}

type Output struct {
	ID         int64  `json:"id"`
	OutputType string `json:"output_type"`
	Filename   string `json:"filename"`
	URL        string `json:"url"`
	CreatedAt  string `json:"created_at"`
}

func (s *Service) ListOutputs(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	outs, err := s.listOutputs(caseID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	writeJSON(w, http.StatusOK, outs)
}

func (s *Service) Workspace(w http.ResponseWriter, r *http.Request) {
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	ws, err := s.buildWorkspace(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	writeJSON(w, http.StatusOK, ws)
}

func (s *Service) ReviewDocument(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	docID, _ := strconv.ParseInt(chi.URLParam(r, "docId"), 10, 64)
	var body struct {
		Status string `json:"status"`
		Note   string `json:"note"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	if body.Status != "approved" && body.Status != "rejected" {
		writeErr(w, http.StatusBadRequest, "status debe ser approved o rejected")
		return
	}
	if body.Status == "rejected" && strings.TrimSpace(body.Note) == "" {
		writeErr(w, http.StatusBadRequest, "nota requerida al rechazar")
		return
	}
	var docCaseID int64
	err := s.DB.QueryRow(`SELECT case_id FROM documents WHERE id=?`, docID).Scan(&docCaseID)
	if err != nil || docCaseID != caseID {
		writeErr(w, http.StatusNotFound, "documento no encontrado")
		return
	}
	now := store.Now()
	_, err = s.DB.Exec(
		`UPDATE documents SET review_status=?, review_note=?, reviewed_by=?, reviewed_at=? WHERE id=?`,
		body.Status, body.Note, u.ID, now, docID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "error al revisar")
		return
	}
	label := "Documento aprobado"
	if body.Status == "rejected" {
		label = "Documento rechazado: " + body.Note
		_ = s.Cases.SetStatus(caseID, "02", label+" — cliente debe volver a cargar", &u.ID)
	} else {
		var status string
		_ = s.DB.QueryRow(`SELECT status FROM cases WHERE id=?`, caseID).Scan(&status)
		_, _ = s.DB.Exec(
			`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
			caseID, status, label, u.ID, now,
		)
	}
	ws, _ := s.buildWorkspace(caseID)
	writeJSON(w, http.StatusOK, ws)
}

func (s *Service) GenerateMinuta(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if b := s.docBlockers(c, true, false, false); len(b) > 0 {
		writeJSON(w, http.StatusConflict, map[string]any{"error": "documentos incompletos", "blockers": b})
		return
	}
	var q map[string]any
	_ = json.Unmarshal([]byte(c.QuestionnaireJSON), &q)
	data := map[string]any{
		"ClientName":  c.ClientName,
		"City":        c.City,
		"AmountUSD":   fmt.Sprintf("%.2f", float64(c.AmountCents)/100),
		"Date":        store.Now(),
		"BothDivorce": boolLabel(q, "both_want_divorce"),
		"MarriageEC":  boolLabel(q, "marriage_in_ecuador"),
		"HaveChildren": boolLabel(q, "have_children"),
		"HaveAssets":  boolLabel(q, "have_assets"),
		"IDsValid":    boolLabel(q, "ids_valid"),
	}
	tmplPath := filepath.Join(s.UploadDir, "..", "internal", "lawyer", "templates", "minuta.html")
	if _, err := os.Stat(tmplPath); err != nil {
		// Fallback when API cwd is repo root instead of backend/
		tmplPath = filepath.Join(s.UploadDir, "..", "backend", "internal", "lawyer", "templates", "minuta.html")
	}
	tmpl, err := template.ParseFiles(tmplPath)
	if err != nil {
		tmpl = template.Must(template.New("minuta").Parse(minutaFallback))
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		writeErr(w, http.StatusInternalServerError, "error generando minuta")
		return
	}
	_ = os.MkdirAll(s.UploadDir, 0o755)
	stored := fmt.Sprintf("minuta_case%d_%d.html", caseID, store.NowUnix())
	path := filepath.Join(s.UploadDir, stored)
	if err := os.WriteFile(path, buf.Bytes(), 0o644); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar minuta")
		return
	}
	now := store.Now()
	productLabel := minutaProductLabel(c.Product)
	filename := fmt.Sprintf("Minuta_%s_Caso%d.html", productLabel, caseID)
	res, err := s.DB.Exec(
		`INSERT INTO case_outputs (case_id, output_type, filename, stored_path, generated_by, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "minuta", filename, stored, u.ID, now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	outID, _ := res.LastInsertId()
	_, _ = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, c.Status, "Minuta generada (mock) — "+productLabel, u.ID, now,
	)
	if c.Status == "03" {
		_ = s.Cases.SetStatus(caseID, "04", "Minuta generada — lista para firma virtual", &u.ID)
	}
	notifications.NotifyClient(s.DB, c.ClientID, caseID, "status", "Minuta lista para firmar",
		"Firma virtual desde tu expediente — sin trámites presenciales.")
	writeJSON(w, http.StatusCreated, Output{
		ID: outID, OutputType: "minuta", Filename: filename,
		URL: "/api/v1/files/" + stored, CreatedAt: now,
	})
}

func (s *Service) PerformAction(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var body struct {
		Action  string         `json:"action"`
		Payload map[string]any `json:"payload"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Action == "" {
		writeErr(w, http.StatusBadRequest, "action requerida")
		return
	}
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if b := blockersForAction(body.Action, c, s); len(b) > 0 {
		writeJSON(w, http.StatusConflict, map[string]any{"error": "acción bloqueada", "blockers": b})
		return
	}
	note := ""
	next := ""
	switch body.Action {
	case "approve_and_prepare":
		if c.Status != "03" {
			writeErr(w, http.StatusBadRequest, "acción solo en revisión jurídica")
			return
		}
		next, note = "04", "Documentos aprobados — minuta en preparación"
	case "notify_client_sign", "send_for_signature":
		if c.Status != "04" && c.Status != "05" {
			writeErr(w, http.StatusBadRequest, "acción solo con minuta preparada (estados 04–05)")
			return
		}
		if s.hasSignature(c.ID) {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":    "El cliente ya firmó",
				"blockers": []string{"Revisa la pestaña Firmas y usa «Confirmar firma recibida»"},
			})
			return
		}
		now := store.Now()
		notifications.NotifyClient(s.DB, c.ClientID, caseID, "status", "Tu minuta está lista",
			"Entra a tu expediente y firma virtualmente — sin filas ni trámites presenciales.")
		_, _ = s.DB.Exec(
			`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
			caseID, c.Status, "Cliente notificado para firma virtual", u.ID, now,
		)
		ws, _ := s.buildWorkspace(caseID)
		writeJSON(w, http.StatusOK, ws)
		return
	case "confirm_signature":
		if c.Status != "05" {
			writeErr(w, http.StatusBadRequest, "acción solo cuando el cliente ya firmó (estado 05)")
			return
		}
		if !s.hasSignature(c.ID) {
			writeJSON(w, http.StatusConflict, map[string]any{
				"error":    "Sin firma del cliente",
				"blockers": []string{"El cliente debe subir su firma antes de confirmar"},
			})
			return
		}
		next, note = "06", "Firma del cliente confirmada — listo para notaría virtual"
		c2, _ := s.Cases.GetCasePublic(caseID)
		notifications.NotifyNotaries(s.DB, caseID, "notary", "Expediente listo para notaría", "Caso #"+strconv.FormatInt(caseID, 10)+" — "+c2.ClientName)
	case "register_notary_send":
		if c.Status != "06" {
			writeErr(w, http.StatusBadRequest, "acción solo en enviado a notaría")
			return
		}
		name, _ := body.Payload["notary_name"].(string)
		if strings.TrimSpace(name) == "" {
			writeErr(w, http.StatusBadRequest, "notary_name requerido")
			return
		}
		_, _ = s.DB.Exec(`UPDATE cases SET notary_name=? WHERE id=?`, name, caseID)
		next, note = "07", "Reunión notarial virtual agendada: "+name
	case "register_appointment":
		if c.Status != "07" {
			writeErr(w, http.StatusBadRequest, "acción solo en comparecencia")
			return
		}
		at, _ := body.Payload["appointment_at"].(string)
		if strings.TrimSpace(at) == "" {
			writeErr(w, http.StatusBadRequest, "appointment_at requerido")
			return
		}
		_, _ = s.DB.Exec(`UPDATE cases SET appointment_at=? WHERE id=?`, at, caseID)
		next, note = "08", "Comparecencia virtual registrada: "+at
	case "register_acta":
		if c.Status != "08" {
			writeErr(w, http.StatusBadRequest, "acción solo tras acta pendiente")
			return
		}
		next, note = "09", "Acta de divorcio emitida por la notaría"
	case "register_civil_registry":
		if c.Status != "09" {
			writeErr(w, http.StatusBadRequest, "acción solo en registro civil")
			return
		}
		next, note = "10", "Trámite inscrito en Registro Civil — finalizado"
	case "revert_step":
		prev, ok := prevStatus[c.Status]
		if !ok {
			writeErr(w, http.StatusBadRequest, "no se puede revertir desde este estado")
			return
		}
		next = prev
		note = "Estado revertido manualmente a " + cases.StatusLabels[prev]
	default:
		writeErr(w, http.StatusBadRequest, "acción desconocida")
		return
	}
	if err := s.Cases.SetStatus(caseID, next, note, &u.ID); err != nil {
		writeErr(w, http.StatusInternalServerError, "error al avanzar")
		return
	}
	c2, _ := s.Cases.GetCasePublic(caseID)
	if body.Action == "revert_step" {
		notifications.NotifyClient(s.DB, c2.ClientID, caseID, "status", "Estado actualizado", note)
	} else if next != "" {
		notifications.NotifyClient(s.DB, c2.ClientID, caseID, "status", "Tu trámite avanzó", cases.StatusLabels[next])
	}
	ws, _ := s.buildWorkspace(caseID)
	writeJSON(w, http.StatusOK, ws)
}

var prevStatus = map[string]string{
	"04": "03", "05": "04", "06": "05", "07": "06", "08": "07", "09": "08", "10": "09",
}

func (s *Service) buildWorkspace(caseID int64) (Workspace, error) {
	c, err := s.Cases.GetCasePublic(caseID)
	if err != nil {
		return Workspace{}, err
	}
	events, _ := s.Cases.ListEventsPublic(caseID)
	notes, _ := s.Cases.ListNotesPublic(caseID)
	docs, _ := s.listDocuments(caseID)
	sigs, _ := s.listSignatures(caseID)
	outs, _ := s.listOutputs(caseID)
	blockers := s.computeBlockers(c)
	next := s.nextActions(c, blockers)
	var q map[string]any
	_ = json.Unmarshal([]byte(c.QuestionnaireJSON), &q)
	if q == nil {
		q = map[string]any{}
	}
	return Workspace{
		Case: c, Events: events, Notes: notes, Documents: docs,
		Signatures: sigs, Outputs: outs, States: cases.StatusLabels,
		NextActions: next, Blockers: blockers, Questionnaire: q,
		RequiredDocs: products.RequiredDocs(c.Product),
		StageHint:    products.StageHint(c.Status, c.Product),
	}, nil
}

func (s *Service) computeBlockers(c cases.Case) []string {
	switch c.Status {
	case "01", "02", "06", "07", "08", "09", "10":
		return []string{}
	case "03":
		return s.docBlockers(c, true, false, false)
	case "04":
		return s.docBlockers(c, false, true, false)
	case "05":
		return s.docBlockers(c, false, false, true)
	default:
		return []string{}
	}
}

func (s *Service) docBlockers(c cases.Case, includeDocs, includeMinuta, includeSignature bool) []string {
	req := products.DocRequirement(c.Product)
	var b []string
	if includeDocs {
		d1 := s.latestDocReview(c.ID, req.Type1)
		d2 := s.latestDocReview(c.ID, req.Type2)
		if d1 == "" {
			b = append(b, "Falta "+req.Label1)
		} else if d1 != "approved" {
			b = append(b, req.Label1+" pendiente de aprobación")
		}
		if d2 == "" {
			b = append(b, "Falta "+req.Label2)
		} else if d2 != "approved" {
			b = append(b, req.Label2+" pendiente de aprobación")
		}
	}
	if includeMinuta && !s.hasMinuta(c.ID) {
		b = append(b, "Minuta no generada")
	}
	if includeSignature && !s.hasSignature(c.ID) {
		b = append(b, "Sin firma del cliente")
	}
	if len(b) == 0 {
		return []string{}
	}
	return b
}

func blockersForAction(action string, c cases.Case, s *Service) []string {
	switch action {
	case "approve_and_prepare":
		return s.docBlockers(c, true, false, false)
	case "send_for_signature", "notify_client_sign":
		if !s.hasMinuta(c.ID) {
			return []string{"Minuta no generada"}
		}
	case "confirm_signature":
		if !s.hasSignature(c.ID) {
			return []string{"Sin firma del cliente"}
		}
	}
	return nil
}

func (s *Service) nextActions(c cases.Case, blockers []string) []ActionDef {
	hasBlock := func(keys ...string) bool {
		for _, b := range blockers {
			for _, k := range keys {
				if b == k {
					return true
				}
			}
		}
		return false
	}
	switch c.Status {
	case "03":
		return []ActionDef{{ID: "approve_and_prepare", Label: "Aprobar documentos y preparar minuta", Description: products.ApproveActionDescription(c.Product)}}
	case "04":
		if hasBlock("Minuta no generada") {
			return revertAction(c.Status)
		}
		actions := revertAction(c.Status)
		return append(actions, ActionDef{
			ID:          "notify_client_sign",
			Label:       "Notificar al cliente",
			Description: "Aviso de firma virtual — el cliente también puede firmar solo desde su expediente",
		})
	case "05":
		actions := revertAction(c.Status)
		if !s.hasSignature(c.ID) {
			return append(actions, ActionDef{
				ID:          "notify_client_sign",
				Label:       "Notificar al cliente",
				Description: "Aún sin firma — reenvía el aviso para firma virtual",
			})
		}
		return append(actions, ActionDef{
			ID:          "confirm_signature",
			Label:       "Confirmar firma recibida",
			Description: "Revisa la firma en la pestaña Firmas y valida para continuar a notaría virtual",
		})
	case "06":
		return append(revertAction(c.Status), ActionDef{ID: "register_notary_send", Label: "Registrar envío a notaría", Description: "Indica notaría seleccionada"})
	case "07":
		return append(revertAction(c.Status), ActionDef{ID: "register_appointment", Label: "Registrar comparecencia", Description: "Fecha de cita ante notario"})
	case "08":
		return append(revertAction(c.Status), ActionDef{ID: "register_acta", Label: "Registrar acta emitida", Description: "Notaría emitió acta de divorcio"})
	case "09":
		return append(revertAction(c.Status), ActionDef{ID: "register_civil_registry", Label: "Registrar inscripción Registro Civil", Description: "Cierra el trámite"})
	default:
		return []ActionDef{}
	}
}

func revertAction(status string) []ActionDef {
	if _, ok := prevStatus[status]; ok {
		prev := prevStatus[status]
		return []ActionDef{{
			ID:          "revert_step",
			Label:       "Revertir al estado anterior",
			Description: "Vuelve a " + cases.StatusLabels[prev] + " (queda en historial)",
		}}
	}
	return []ActionDef{}
}

func (s *Service) latestDocReview(caseID int64, docType string) string {
	var status sql.NullString
	err := s.DB.QueryRow(
		`SELECT review_status FROM documents WHERE case_id=? AND doc_type=? ORDER BY id DESC LIMIT 1`,
		caseID, docType,
	).Scan(&status)
	if err != nil {
		return ""
	}
	return status.String
}

func (s *Service) hasMinuta(caseID int64) bool {
	var n int
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM case_outputs WHERE case_id=? AND output_type='minuta'`, caseID).Scan(&n)
	return n > 0
}

func (s *Service) hasSignature(caseID int64) bool {
	var n int
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM signatures WHERE case_id=?`, caseID).Scan(&n)
	return n > 0
}

func (s *Service) listDocuments(caseID int64) ([]Document, error) {
	rows, err := s.DB.Query(
		`SELECT id, case_id, doc_type, filename, mime, size_bytes, COALESCE(review_status,'pending'), COALESCE(review_note,''), stored_path, created_at
		 FROM documents WHERE case_id=? ORDER BY id`, caseID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Document{}
	for rows.Next() {
		var d Document
		var path string
		if err := rows.Scan(&d.ID, &d.CaseID, &d.DocType, &d.Filename, &d.Mime, &d.SizeBytes, &d.ReviewStatus, &d.ReviewNote, &path, &d.CreatedAt); err != nil {
			return nil, err
		}
		d.URL = "/api/v1/files/" + path
		out = append(out, d)
	}
	return out, nil
}

func (s *Service) listSignatures(caseID int64) ([]Signature, error) {
	rows, err := s.DB.Query(`SELECT id, image_path, ip, signed_at FROM signatures WHERE case_id=? ORDER BY id`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Signature{}
	for rows.Next() {
		var sg Signature
		var path string
		if err := rows.Scan(&sg.ID, &path, &sg.IP, &sg.SignedAt); err != nil {
			return nil, err
		}
		sg.ImageURL = "/api/v1/files/" + path
		out = append(out, sg)
	}
	return out, nil
}

func (s *Service) listOutputs(caseID int64) ([]Output, error) {
	rows, err := s.DB.Query(`SELECT id, output_type, filename, stored_path, created_at FROM case_outputs WHERE case_id=? ORDER BY id`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Output{}
	for rows.Next() {
		var o Output
		var path string
		if err := rows.Scan(&o.ID, &o.OutputType, &o.Filename, &path, &o.CreatedAt); err != nil {
			return nil, err
		}
		o.URL = "/api/v1/files/" + path
		out = append(out, o)
	}
	return out, nil
}

func minutaProductLabel(product string) string {
	switch product {
	case "traslado360":
		return "Traslado360"
	case "bienraiz360":
		return "BienRaiz360"
	default:
		return "Divorcio360"
	}
}

func boolLabel(q map[string]any, key string) string {
	if q == nil {
		return "—"
	}
	v, ok := q[key]
	if !ok {
		return "—"
	}
	switch t := v.(type) {
	case bool:
		if t {
			return "Sí"
		}
		return "No"
	default:
		return fmt.Sprint(v)
	}
}

const minutaFallback = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Minuta Divorcio360</title></head>
<body><h1>Minuta de divorcio notarial</h1>
<p>Cliente: {{.ClientName}} · Ciudad: {{.City}} · Honorarios: ${{.AmountUSD}}</p>
<p>Mutuo consentimiento: {{.BothDivorce}} · Matrimonio EC: {{.MarriageEC}}</p>
<p>Hijos: {{.HaveChildren}} · Bienes: {{.HaveAssets}} · IDs vigentes: {{.IDsValid}}</p>
<p><em>Documento mock generado {{.Date}} — LegalStation / Divorcio360</em></p></body></html>`

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
