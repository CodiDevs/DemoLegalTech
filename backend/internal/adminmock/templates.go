package adminmock

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

const maxPreviewHTML = 65536

type docVersion struct {
	TemplateID string `json:"template_id"`
	Version    string `json:"version"`
	Date       string `json:"date"`
	Author     string `json:"author"`
}

type docTemplateRow struct {
	ID          string
	SourceID    sql.NullString
	Name        string
	Category    string
	Status      string
	Version     string
	Fields      []string
	PreviewHTML string
	Versions    []docVersion
}

func (s *Service) Templates(w http.ResponseWriter, r *http.Request) {
	if err := s.ensureDocTemplates(); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	rows, versions, err := s.listDocTemplates()
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	out := make([]map[string]any, 0, len(rows))
	for _, row := range rows {
		out = append(out, row.toMap())
	}
	write(w, map[string]any{"demo": true, "templates": out, "versions": versions})
}

func (s *Service) CreateTemplate(w http.ResponseWriter, r *http.Request) {
	if err := s.ensureDocTemplates(); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	var body struct {
		Name        string   `json:"name"`
		Category    string   `json:"category"`
		Status      string   `json:"status"`
		Version     string   `json:"version"`
		Fields      []string `json:"fields"`
		PreviewHTML string   `json:"preview_html"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, 96<<10)).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || utf8.RuneCountInString(name) > 120 {
		writeErr(w, http.StatusBadRequest, "nombre inválido")
		return
	}
	cat := strings.TrimSpace(body.Category)
	if cat == "" {
		cat = "familia"
	}
	if utf8.RuneCountInString(cat) > 40 {
		writeErr(w, http.StatusBadRequest, "categoría inválida")
		return
	}
	st := strings.TrimSpace(body.Status)
	if st == "" {
		st = "diseno"
	}
	if st != "activa" && st != "diseno" && st != "proximamente" {
		writeErr(w, http.StatusBadRequest, "estado inválido")
		return
	}
	ver := strings.TrimSpace(body.Version)
	if ver == "" {
		ver = "v0.1"
	}
	if utf8.RuneCountInString(ver) > 32 {
		writeErr(w, http.StatusBadRequest, "versión inválida")
		return
	}
	if len(body.PreviewHTML) > maxPreviewHTML {
		writeErr(w, http.StatusBadRequest, "el texto de la minuta es demasiado largo")
		return
	}
	fields, ferr := normalizeFields(body.Fields)
	if ferr != "" {
		writeErr(w, http.StatusBadRequest, ferr)
		return
	}
	author := "LegalStation"
	if u := auth.UserFrom(r.Context()); u != nil && u.FullName != "" {
		author = u.FullName
	}
	now := store.Now()
	id := fmt.Sprintf("tpl-%d", time.Now().UnixNano())
	row := docTemplateRow{
		ID:          id,
		SourceID:    sql.NullString{String: "created", Valid: true},
		Name:        name,
		Category:    cat,
		Status:      st,
		Version:     ver,
		Fields:      fields,
		PreviewHTML: body.PreviewHTML,
		Versions: []docVersion{
			{TemplateID: id, Version: ver, Date: time.Now().UTC().Format("2006-01-02"), Author: author},
		},
	}
	if err := s.insertDocTemplate(row, now); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo crear")
		return
	}
	saved, err := s.getDocTemplate(id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo crear")
		return
	}
	writeStatus(w, http.StatusCreated, saved.toMap())
}

func (s *Service) DuplicateTemplate(w http.ResponseWriter, r *http.Request) {
	if err := s.ensureDocTemplates(); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	src, err := s.getDocTemplate(chi.URLParam(r, "id"))
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "Plantilla no encontrada")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar")
		return
	}
	now := store.Now()
	clone := *src
	clone.ID = fmt.Sprintf("%s-copy-%d", src.ID, time.Now().UnixNano())
	clone.SourceID = sql.NullString{String: src.ID, Valid: true}
	clone.Name = src.Name + " (copia)"
	clone.Status = "diseno"
	if err := s.insertDocTemplate(clone, now); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar")
		return
	}
	saved, err := s.getDocTemplate(clone.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar")
		return
	}
	write(w, saved.toMap())
}

func (s *Service) PatchTemplate(w http.ResponseWriter, r *http.Request) {
	if err := s.ensureDocTemplates(); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	id := chi.URLParam(r, "id")
	row, err := s.getDocTemplate(id)
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "Plantilla no encontrada")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar")
		return
	}
	var body struct {
		Name        *string   `json:"name"`
		Category    *string   `json:"category"`
		Status      *string   `json:"status"`
		Version     *string   `json:"version"`
		Fields      *[]string `json:"fields"`
		PreviewHTML *string   `json:"preview_html"`
	}
	if err := json.NewDecoder(io.LimitReader(r.Body, 96<<10)).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "cuerpo inválido")
		return
	}
	if body.Name != nil {
		name := strings.TrimSpace(*body.Name)
		if name == "" || utf8.RuneCountInString(name) > 120 {
			writeErr(w, http.StatusBadRequest, "nombre inválido")
			return
		}
		row.Name = name
	}
	if body.Category != nil {
		cat := strings.TrimSpace(*body.Category)
		if cat == "" || utf8.RuneCountInString(cat) > 40 {
			writeErr(w, http.StatusBadRequest, "categoría inválida")
			return
		}
		row.Category = cat
	}
	if body.Status != nil {
		st := strings.TrimSpace(*body.Status)
		if st != "activa" && st != "diseno" && st != "proximamente" {
			writeErr(w, http.StatusBadRequest, "estado inválido")
			return
		}
		row.Status = st
	}
	if body.Version != nil {
		ver := strings.TrimSpace(*body.Version)
		if ver == "" || utf8.RuneCountInString(ver) > 32 {
			writeErr(w, http.StatusBadRequest, "versión inválida")
			return
		}
		row.Version = ver
	}
	if body.Fields != nil {
		fields, err := normalizeFields(*body.Fields)
		if err != "" {
			writeErr(w, http.StatusBadRequest, err)
			return
		}
		row.Fields = fields
	}
	if body.PreviewHTML != nil {
		if len(*body.PreviewHTML) > maxPreviewHTML {
			writeErr(w, http.StatusBadRequest, "el texto de la minuta es demasiado largo")
			return
		}
		row.PreviewHTML = *body.PreviewHTML
	}

	author := "LegalStation"
	if u := auth.UserFrom(r.Context()); u != nil && u.FullName != "" {
		author = u.FullName
	}
	row.Versions = append(row.Versions, docVersion{
		TemplateID: row.ID,
		Version:    row.Version,
		Date:       time.Now().UTC().Format("2006-01-02"),
		Author:     author,
	})
	if err := s.updateDocTemplate(*row); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar")
		return
	}
	saved, err := s.getDocTemplate(id)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar")
		return
	}
	write(w, saved.toMap())
}

func (s *Service) DeleteTemplate(w http.ResponseWriter, r *http.Request) {
	if err := s.ensureDocTemplates(); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar las plantillas")
		return
	}
	id := chi.URLParam(r, "id")
	row, err := s.getDocTemplate(id)
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "Plantilla no encontrada")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo borrar")
		return
	}
	if !row.SourceID.Valid || row.SourceID.String == "" {
		writeErr(w, http.StatusConflict, "No se puede borrar una plantilla original")
		return
	}
	if _, err := s.DB.Exec(`DELETE FROM mock_document_templates WHERE id=?`, id); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo borrar")
		return
	}
	write(w, map[string]any{"ok": true})
}

func (s *Service) ensureDocTemplates() error {
	var n int
	if err := s.DB.QueryRow(`SELECT COUNT(*) FROM mock_document_templates`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	now := store.Now()
	seeds := []docTemplateRow{
		{
			ID:          "divorcio-notarial",
			Name:        "Divorcio notarial mutuo consentimiento",
			Category:    "familia",
			Status:      "activa",
			Version:     "v1.0",
			Fields:      []string{"{{cliente_nombre}}", "{{conyuge_nombre}}", "{{ciudad_notaria}}"},
			PreviewHTML: "<p><strong>MINUTA DE DIVORCIO</strong></p><p>LegalStation · Divorcio360</p>",
			Versions: []docVersion{
				{TemplateID: "divorcio-notarial", Version: "v1.0", Date: "2026-08-01", Author: "LegalStation"},
			},
		},
		{
			ID:          "sucesion",
			Name:        "Sucesión intestada",
			Category:    "familia",
			Status:      "proximamente",
			Version:     "v0.1",
			Fields:      []string{"{{causante}}"},
			PreviewHTML: "<p>Estate360 borrador</p>",
			Versions:    []docVersion{},
		},
	}
	for _, row := range seeds {
		if err := s.insertDocTemplate(row, now); err != nil {
			return err
		}
	}
	return nil
}

func (s *Service) insertDocTemplate(row docTemplateRow, now string) error {
	fieldsJSON, _ := json.Marshal(row.Fields)
	versionsJSON, _ := json.Marshal(row.Versions)
	var source any
	if row.SourceID.Valid {
		source = row.SourceID.String
	}
	_, err := s.DB.Exec(
		`INSERT INTO mock_document_templates
		 (id, source_id, name, category, status, version, fields_json, preview_html, versions_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		row.ID, source, row.Name, row.Category, row.Status, row.Version,
		string(fieldsJSON), row.PreviewHTML, string(versionsJSON), now, now,
	)
	return err
}

func (s *Service) updateDocTemplate(row docTemplateRow) error {
	fieldsJSON, _ := json.Marshal(row.Fields)
	versionsJSON, _ := json.Marshal(row.Versions)
	_, err := s.DB.Exec(
		`UPDATE mock_document_templates
		 SET name=?, category=?, status=?, version=?, fields_json=?, preview_html=?, versions_json=?, updated_at=?
		 WHERE id=?`,
		row.Name, row.Category, row.Status, row.Version,
		string(fieldsJSON), row.PreviewHTML, string(versionsJSON), store.Now(), row.ID,
	)
	return err
}

func (s *Service) getDocTemplate(id string) (*docTemplateRow, error) {
	row := s.DB.QueryRow(
		`SELECT id, source_id, name, category, status, version, fields_json, preview_html, versions_json
		 FROM mock_document_templates WHERE id=?`, id,
	)
	parsed, err := scanDocTemplate(row)
	if err != nil {
		return nil, err
	}
	return &parsed, nil
}

func (s *Service) listDocTemplates() ([]docTemplateRow, []docVersion, error) {
	rs, err := s.DB.Query(
		`SELECT id, source_id, name, category, status, version, fields_json, preview_html, versions_json
		 FROM mock_document_templates ORDER BY created_at, id`,
	)
	if err != nil {
		return nil, nil, err
	}
	defer rs.Close()
	out := []docTemplateRow{}
	versions := []docVersion{}
	for rs.Next() {
		row, err := scanDocTemplate(rs)
		if err != nil {
			continue
		}
		out = append(out, row)
		versions = append(versions, row.Versions...)
	}
	return out, versions, nil
}

type scanner interface {
	Scan(dest ...any) error
}

func scanDocTemplate(sc scanner) (docTemplateRow, error) {
	var row docTemplateRow
	var fieldsJSON, versionsJSON string
	if err := sc.Scan(
		&row.ID, &row.SourceID, &row.Name, &row.Category, &row.Status, &row.Version,
		&fieldsJSON, &row.PreviewHTML, &versionsJSON,
	); err != nil {
		return row, err
	}
	_ = json.Unmarshal([]byte(fieldsJSON), &row.Fields)
	if row.Fields == nil {
		row.Fields = []string{}
	}
	_ = json.Unmarshal([]byte(versionsJSON), &row.Versions)
	if row.Versions == nil {
		row.Versions = []docVersion{}
	}
	return row, nil
}

func (row docTemplateRow) toMap() map[string]any {
	var source any
	if row.SourceID.Valid && row.SourceID.String != "" {
		source = row.SourceID.String
	}
	return map[string]any{
		"id":           row.ID,
		"source_id":    source,
		"name":         row.Name,
		"category":     row.Category,
		"active":       row.Status == "activa",
		"status":       row.Status,
		"version":      row.Version,
		"fields":       row.Fields,
		"preview_html": row.PreviewHTML,
	}
}

func normalizeFields(raw []string) ([]string, string) {
	if len(raw) > 30 {
		return nil, "demasiados campos"
	}
	out := make([]string, 0, len(raw))
	seen := map[string]bool{}
	for _, item := range raw {
		tok := canonField(item)
		if tok == "{{}}" {
			continue
		}
		key := strings.TrimSuffix(strings.TrimPrefix(tok, "{{"), "}}")
		if utf8.RuneCountInString(key) > 60 {
			return nil, "campo demasiado largo"
		}
		if seen[tok] {
			continue
		}
		seen[tok] = true
		out = append(out, tok)
	}
	return out, ""
}

func canonField(raw string) string {
	s := strings.TrimSpace(raw)
	s = strings.TrimPrefix(s, "{{")
	s = strings.TrimSuffix(s, "}}")
	s = strings.TrimSpace(s)
	s = strings.ReplaceAll(s, " ", "_")
	return "{{" + s + "}}"
}
