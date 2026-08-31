package signatures

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net"
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

type Signature struct {
	ID        int64  `json:"id"`
	CaseID    int64  `json:"case_id"`
	SignerID  int64  `json:"signer_id"`
	ImageURL  string `json:"image_url"`
	IP        string `json:"ip"`
	UserAgent string `json:"user_agent"`
	SignedAt  string `json:"signed_at"`
}

func (s *Service) Sign(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var clientID int64
	var status string
	var product string
	err := s.DB.QueryRow(`SELECT client_id, status, COALESCE(product,'divorcio360') FROM cases WHERE id=?`, caseID).Scan(&clientID, &status, &product)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && clientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	if status != "03" && status != "04" && status != "05" {
		writeErr(w, http.StatusBadRequest, "La firma se habilita cuando la minuta está lista (estados 03–05)")
		return
	}
	var minutaCount int
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM case_outputs WHERE case_id=? AND output_type='minuta'`, caseID).Scan(&minutaCount)
	if minutaCount == 0 {
		writeErr(w, http.StatusBadRequest, "Aún no hay minuta para firmar")
		return
	}
	if !products.RequiredDocsApproved(s.DB.DB, caseID, product) {
		writeErr(w, http.StatusBadRequest, "Los documentos del trámite deben estar aprobados antes de firmar")
		return
	}
	var body struct {
		ImageData string `json:"image_data"` // data:image/png;base64,...
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.ImageData == "" {
		writeErr(w, http.StatusBadRequest, "image_data requerido")
		return
	}
	raw := body.ImageData
	if i := strings.Index(raw, ","); i >= 0 {
		raw = raw[i+1:]
	}
	bin, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		writeErr(w, http.StatusBadRequest, "base64 inválido")
		return
	}
	if err := s.clearSignatures(caseID); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo reemplazar firma anterior")
		return
	}
	_ = os.MkdirAll(s.UploadDir, 0o755)
	name := fmt.Sprintf("sig_case%d_user%d_%d.png", caseID, u.ID, store.NowUnix())
	path := filepath.Join(s.UploadDir, name)
	if err := os.WriteFile(path, bin, 0o644); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar firma")
		return
	}
	ip := clientIP(r)
	ua := r.UserAgent()
	now := store.Now()
	res, err := s.DB.Exec(
		`INSERT INTO signatures (case_id, signer_id, image_path, ip, user_agent, signed_at) VALUES (?,?,?,?,?,?)`,
		caseID, u.ID, name, ip, ua, now,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	id, _ := res.LastInsertId()
	note := fmt.Sprintf("Firma electrónica mock registrada — IP %s — %s", ip, now)
	_, _ = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, status, note, u.ID, now,
	)
	if status == "03" || status == "04" {
		_ = s.Cases.SetStatus(caseID, "05", "Firma del cliente recibida — pendiente confirmación del abogado", &u.ID)
	}
	notifications.NotifyLawyersForCase(s.DB, caseID, "signature", "Firma recibida", fmt.Sprintf("Cliente firmó expediente #%d", caseID))
	writeJSON(w, http.StatusCreated, Signature{
		ID: id, CaseID: caseID, SignerID: u.ID, ImageURL: "/api/v1/files/" + name,
		IP: ip, UserAgent: ua, SignedAt: now,
	})
}

func (s *Service) clearSignatures(caseID int64) error {
	rows, err := s.DB.Query(`SELECT image_path FROM signatures WHERE case_id=?`, caseID)
	if err != nil {
		return err
	}
	defer rows.Close()
	for rows.Next() {
		var path string
		if err := rows.Scan(&path); err != nil {
			return err
		}
		_ = os.Remove(filepath.Join(s.UploadDir, path))
	}
	_, err = s.DB.Exec(`DELETE FROM signatures WHERE case_id=?`, caseID)
	return err
}

func clientIP(r *http.Request) string {
	if fwd := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-For"), ",")[0]); fwd != "" {
		return fwd
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func (s *Service) List(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	caseID, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	var clientID int64
	err := s.DB.QueryRow(`SELECT client_id FROM cases WHERE id=?`, caseID).Scan(&clientID)
	if err != nil {
		writeErr(w, http.StatusNotFound, "caso no encontrado")
		return
	}
	if u.Role == "cliente" && clientID != u.ID {
		writeErr(w, http.StatusForbidden, "acceso denegado")
		return
	}
	rows, err := s.DB.Query(
		`SELECT id, case_id, signer_id, image_path, ip, user_agent, signed_at FROM signatures WHERE case_id=? ORDER BY id DESC LIMIT 1`, caseID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	list := []Signature{}
	for rows.Next() {
		var sg Signature
		var path string
		if err := rows.Scan(&sg.ID, &sg.CaseID, &sg.SignerID, &path, &sg.IP, &sg.UserAgent, &sg.SignedAt); err != nil {
			writeErr(w, http.StatusInternalServerError, "scan")
			return
		}
		sg.ImageURL = "/api/v1/files/" + path
		list = append(list, sg)
	}
	writeJSON(w, http.StatusOK, list)
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
