package signatures

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
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

const (
	ChannelUpload    = "upload"
	ChannelPlatform  = "platform"
	PlatformFeeCents = 1500 // keep in sync with frontend ESIGN_FEE_CENTS
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
	Channel   string `json:"channel"`
	FeeCents  int    `json:"fee_cents,omitempty"`
}

type clientError string

func (e clientError) Error() string { return string(e) }

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
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		if err := r.ParseForm(); err != nil {
			writeErr(w, http.StatusBadRequest, "formulario inválido (máx 10MB)")
			return
		}
	}
	channel := strings.ToLower(strings.TrimSpace(r.FormValue("channel")))
	if channel == "" {
		channel = ChannelUpload
	}
	if channel != ChannelUpload && channel != ChannelPlatform {
		writeErr(w, http.StatusBadRequest, "channel debe ser upload o platform")
		return
	}

	payload, ext, err := s.readSignedPayload(r, channel)
	if err != nil {
		code := http.StatusInternalServerError
		var ce clientError
		if errors.As(err, &ce) {
			code = http.StatusBadRequest
		} else if channel == ChannelPlatform {
			writeErr(w, http.StatusInternalServerError, "no se pudo aplicar la firma de plataforma")
			return
		}
		writeErr(w, code, err.Error())
		return
	}

	if err := s.clearSignatures(caseID); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo reemplazar documento anterior")
		return
	}
	_ = os.MkdirAll(s.UploadDir, 0o755)
	name := fmt.Sprintf("sig_case%d_user%d_%d%s", caseID, u.ID, store.NowUnix(), ext)
	if err := os.WriteFile(filepath.Join(s.UploadDir, name), payload, 0o644); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar documento")
		return
	}

	ip := clientIP(r)
	ua := r.UserAgent()
	now := store.Now()
	feeCents := 0
	if channel == ChannelPlatform {
		feeCents = PlatformFeeCents
		ref := fmt.Sprintf("ESIGN-MOCK-%d-%d", caseID, store.NowUnix())
		_, err = s.DB.Exec(
			`INSERT INTO payments (case_id, provider, amount_cents, status, reference, created_at) VALUES (?,?,?,?,?,?)`,
			caseID, "payphone_esign_mock", PlatformFeeCents, "paid", ref, now,
		)
		if err != nil {
			writeErr(w, http.StatusInternalServerError, "no se pudo registrar el cobro de firma")
			return
		}
	}
	res, err := s.DB.Exec(
		`INSERT INTO signatures (case_id, signer_id, image_path, ip, user_agent, signed_at, channel) VALUES (?,?,?,?,?,?,?)`,
		caseID, u.ID, name, ip, ua, now, channel,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	id, _ := res.LastInsertId()
	note := fmt.Sprintf("Documento firmado recibido — IP %s — %s", ip, now)
	notifyTitle := "Documento firmado recibido"
	notifyBody := fmt.Sprintf("Cliente subió documento firmado — expediente #%d", caseID)
	if channel == ChannelPlatform {
		note = fmt.Sprintf("Firma LegalStation aplicada (demo, $%d) — IP %s — %s", PlatformFeeCents/100, ip, now)
		notifyTitle = "Firma LegalStation aplicada"
		notifyBody = fmt.Sprintf("Cliente usó firma de plataforma ($%d aparte) — expediente #%d", PlatformFeeCents/100, caseID)
	}
	_, _ = s.DB.Exec(
		`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, status, note, u.ID, now,
	)
	if status == "03" || status == "04" {
		_ = s.Cases.SetStatus(caseID, "05", "Documento firmado recibido — pendiente confirmación del abogado", &u.ID)
	}
	notifications.NotifyLawyersForCase(s.DB, caseID, "signature", notifyTitle, notifyBody)
	writeJSON(w, http.StatusCreated, Signature{
		ID: id, CaseID: caseID, SignerID: u.ID, ImageURL: "/api/v1/files/" + name,
		IP: ip, UserAgent: ua, SignedAt: now, Channel: channel, FeeCents: feeCents,
	})
}

func (s *Service) readSignedPayload(r *http.Request, channel string) ([]byte, string, error) {
	if channel == ChannelPlatform {
		src := filepath.Join(filepath.Dir(s.UploadDir), "demo-fixtures", "firma-demo.pdf")
		b, err := os.ReadFile(src)
		return b, ".pdf", err
	}
	file, hdr, err := r.FormFile("file")
	if err != nil {
		return nil, "", clientError("file requerido")
	}
	defer file.Close()
	ext := strings.ToLower(filepath.Ext(hdr.Filename))
	okExt := map[string]bool{".pdf": true, ".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !okExt[ext] {
		return nil, "", clientError("solo PDF o imagen")
	}
	b, err := io.ReadAll(file)
	if err != nil {
		return nil, "", fmt.Errorf("error al leer archivo")
	}
	return b, ext, nil
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
		`SELECT id, case_id, signer_id, image_path, ip, user_agent, signed_at, COALESCE(channel,'upload') FROM signatures WHERE case_id=? ORDER BY id DESC LIMIT 1`, caseID,
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
		if err := rows.Scan(&sg.ID, &sg.CaseID, &sg.SignerID, &path, &sg.IP, &sg.UserAgent, &sg.SignedAt, &sg.Channel); err != nil {
			writeErr(w, http.StatusInternalServerError, "scan")
			return
		}
		sg.ImageURL = "/api/v1/files/" + path
		if sg.Channel == ChannelPlatform {
			sg.FeeCents = PlatformFeeCents
		}
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
