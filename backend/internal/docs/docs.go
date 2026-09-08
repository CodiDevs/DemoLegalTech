package docs

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

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

type Document struct {
	ID           int64  `json:"id"`
	CaseID       int64  `json:"case_id"`
	DocType      string `json:"doc_type"`
	Filename     string `json:"filename"`
	Mime         string `json:"mime"`
	SizeBytes    int64  `json:"size_bytes"`
	UploadedBy   int64  `json:"uploaded_by"`
	ReviewStatus string `json:"review_status"`
	ReviewNote   string `json:"review_note,omitempty"`
	CreatedAt    string `json:"created_at"`
	URL          string `json:"url"`
}

func (s *Service) Upload(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := s.loadCase(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeErr(w, http.StatusBadRequest, "formulario inválido (máx 10MB)")
		return
	}
	docType := r.FormValue("doc_type")
	cFull, err := s.loadCaseFull(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if !validDocType(cFull.Product, docType) {
		writeErr(w, http.StatusBadRequest, "doc_type no válido para este producto")
		return
	}
	file, hdr, err := r.FormFile("file")
	if err != nil {
		writeErr(w, http.StatusBadRequest, "file requerido")
		return
	}
	defer file.Close()
	mime := hdr.Header.Get("Content-Type")
	ext := strings.ToLower(filepath.Ext(hdr.Filename))
	okExt := map[string]bool{".pdf": true, ".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !okExt[ext] {
		writeErr(w, http.StatusBadRequest, "solo PDF o imagen")
		return
	}
	_ = os.MkdirAll(s.UploadDir, 0o755)
	name := fmt.Sprintf("case%d_%s_%d%s", caseID, docType, store.NowUnix(), ext)
	path := filepath.Join(s.UploadDir, name)
	out, err := os.Create(path)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar")
		return
	}
	defer out.Close()
	n, err := io.Copy(out, file)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "error escritura")
		return
	}
	now := store.Now()
	res, err := s.DB.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, docType, hdr.Filename, name, mime, n, u.ID, "pending", now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	id, _ := res.LastInsertId()

	// If both docs present and status 01/02, move to 02 then 03 pending review
	hasDoc1, hasDoc2 := s.hasRequiredDocs(caseID, cFull.Product)
	if hasDoc1 && hasDoc2 && (c.Status == "01" || c.Status == "02" || c.Status == "00") {
		_ = s.Cases.SetStatus(caseID, "02", "Documentos cargados; pendientes de revisión", &u.ID)
		_ = s.Cases.SetStatus(caseID, "03", "Documentos completos — revisión jurídica", &u.ID)
	} else if c.Status == "01" {
		_ = s.Cases.SetStatus(caseID, "02", "Documentos pendientes (carga parcial)", &u.ID)
	}

	notifications.NotifyLawyersForCase(s.DB, caseID, "document",
		"Nuevo documento cargado",
		fmt.Sprintf("Expediente #%d — %s subido por cliente", caseID, docType))

	writeJSON(w, http.StatusCreated, Document{
		ID: id, CaseID: caseID, DocType: docType, Filename: hdr.Filename,
		Mime: mime, SizeBytes: n, UploadedBy: u.ID, CreatedAt: now,
		URL: "/api/v1/files/" + name,
	})
}

func (s *Service) Delete(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u.Role != "cliente" && u.Role != "abogado" {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	caseID, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil || caseID <= 0 {
		writeErr(w, http.StatusBadRequest, "caso inválido")
		return
	}
	docID, err := strconv.ParseInt(chi.URLParam(r, "docId"), 10, 64)
	if err != nil || docID <= 0 {
		writeErr(w, http.StatusBadRequest, "documento inválido")
		return
	}
	c, err := s.loadCase(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	var storedPath string
	err = s.DB.QueryRow(
		`SELECT stored_path FROM documents WHERE id=? AND case_id=?`, docID, caseID,
	).Scan(&storedPath)
	if err != nil {
		writeErr(w, http.StatusNotFound, "documento no encontrado")
		return
	}
	res, err := s.DB.Exec(`DELETE FROM documents WHERE id=? AND case_id=?`, docID, caseID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo borrar")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		writeErr(w, http.StatusNotFound, "documento no encontrado")
		return
	}
	_ = os.Remove(filepath.Join(s.UploadDir, storedPath))
	writeJSON(w, http.StatusOK, map[string]string{"ok": "true"})
}

func (s *Service) List(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	c, err := s.loadCase(caseID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && c.ClientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	rows, err := s.DB.Query(
		`SELECT id, case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by,
		        COALESCE(review_status,'pending'), COALESCE(review_note,''), created_at
		 FROM documents WHERE case_id=? ORDER BY id`, caseID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	list := []Document{}
	for rows.Next() {
		var d Document
		var path string
		if err := rows.Scan(&d.ID, &d.CaseID, &d.DocType, &d.Filename, &path, &d.Mime, &d.SizeBytes, &d.UploadedBy, &d.ReviewStatus, &d.ReviewNote, &d.CreatedAt); err != nil {
			writeErr(w, http.StatusInternalServerError, "scan")
			return
		}
		d.URL = "/api/v1/files/" + path
		list = append(list, d)
	}
	writeJSON(w, http.StatusOK, list)
}

func (s *Service) ServeFile(w http.ResponseWriter, r *http.Request) {
	name := chi.URLParam(r, "name")
	name = filepath.Base(name)
	path := filepath.Join(s.UploadDir, name)
	http.ServeFile(w, r, path)
}

type caseRow struct {
	ClientID int64
	Status   string
	Product  string
}

func (s *Service) loadCase(id int64) (caseRow, error) {
	var c caseRow
	err := s.DB.QueryRow(`SELECT client_id, status, COALESCE(product,'divorcio360') FROM cases WHERE id=?`, id).Scan(&c.ClientID, &c.Status, &c.Product)
	return c, err
}

func (s *Service) loadCaseFull(id int64) (caseRow, error) {
	return s.loadCase(id)
}

func validDocType(product, docType string) bool {
	types := products.ValidDocTypes(product)
	for _, t := range types {
		if t == docType {
			return true
		}
	}
	return false
}

func (s *Service) hasRequiredDocs(caseID int64, product string) (bool, bool) {
	type1, type2 := products.RequiredPair(product)
	var a, b int
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM documents WHERE case_id=? AND doc_type=?`, caseID, type1).Scan(&a)
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM documents WHERE case_id=? AND doc_type=?`, caseID, type2).Scan(&b)
	return a > 0, b > 0
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
