package lawyerservices

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
	"unicode"
	"unicode/utf8"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

const (
	maxText     = 4000
	maxPitch    = 280
	maxName     = 120
	maxDuration = 80
	maxItems    = 12
)

var slugClean = regexp.MustCompile(`[^a-z0-9]+`)

type Service struct {
	DB *store.DB
}

type DocItem struct {
	Label string `json:"label"`
}

type QuestionItem struct {
	Prompt string `json:"prompt"`
	Kind   string `json:"kind"`
}

type Offering struct {
	ID           string         `json:"id"`
	LawyerID     int64          `json:"lawyer_id"`
	Slug         string         `json:"slug"`
	Name         string         `json:"name"`
	Category     string         `json:"category"`
	Status       string         `json:"status"`
	PriceCents   int            `json:"price_cents"`
	PriceUSD     float64        `json:"price_usd"`
	Pitch        string         `json:"pitch"`
	Description  string         `json:"description"`
	DurationHint string         `json:"duration_hint"`
	Docs         []DocItem      `json:"docs"`
	Questions    []QuestionItem `json:"questions"`
	CreatedAt    string         `json:"created_at"`
	UpdatedAt    string         `json:"updated_at"`
	Seeded       bool           `json:"seeded,omitempty"`
}

type upsertBody struct {
	Name         string         `json:"name"`
	Slug         string         `json:"slug"`
	Category     string         `json:"category"`
	Status       string         `json:"status"`
	PriceUSD     *float64       `json:"price_usd"`
	PriceCents   *int           `json:"price_cents"`
	Pitch        string         `json:"pitch"`
	Description  string         `json:"description"`
	DurationHint string         `json:"duration_hint"`
	Docs         []DocItem      `json:"docs"`
	Questions    []QuestionItem `json:"questions"`
}

func (s *Service) ListMine(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	if err := s.ensureSeed(u.ID); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar los servicios")
		return
	}
	rows, err := s.listForLawyer(u.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar los servicios")
		return
	}
	write(w, map[string]any{"services": rows})
}

func (s *Service) GetMine(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	row, err := s.getOwned(chi.URLParam(r, "id"), u.ID)
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo cargar el servicio")
		return
	}
	write(w, row)
}

func (s *Service) Create(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	if err := s.ensureSeed(u.ID); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar los servicios")
		return
	}
	body, errMsg := decodeBody(r)
	if errMsg != "" {
		writeErr(w, http.StatusBadRequest, errMsg)
		return
	}
	now := store.Now()
	id := fmt.Sprintf("svc-%d", time.Now().UnixNano())
	slug, err := s.uniqueSlug(u.ID, body.Slug, "")
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo crear el servicio")
		return
	}
	row := Offering{
		ID:           id,
		LawyerID:     u.ID,
		Slug:         slug,
		Name:         body.Name,
		Category:     body.Category,
		Status:       body.Status,
		PriceCents:   body.PriceCents,
		PriceUSD:     centsToUSD(body.PriceCents),
		Pitch:        body.Pitch,
		Description:  body.Description,
		DurationHint: body.DurationHint,
		Docs:         body.Docs,
		Questions:    body.Questions,
		CreatedAt:    now,
		UpdatedAt:    now,
	}
	if err := s.insert(row); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo crear el servicio")
		return
	}
	writeStatus(w, http.StatusCreated, row)
}

func (s *Service) Patch(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	existing, err := s.getOwned(chi.URLParam(r, "id"), u.ID)
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo cargar el servicio")
		return
	}
	body, errMsg := decodeBody(r)
	if errMsg != "" {
		writeErr(w, http.StatusBadRequest, errMsg)
		return
	}
	slug, err := s.uniqueSlug(u.ID, body.Slug, existing.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar el servicio")
		return
	}
	existing.Name = body.Name
	existing.Slug = slug
	existing.Category = body.Category
	existing.Status = body.Status
	existing.PriceCents = body.PriceCents
	existing.PriceUSD = centsToUSD(body.PriceCents)
	existing.Pitch = body.Pitch
	existing.Description = body.Description
	existing.DurationHint = body.DurationHint
	existing.Docs = body.Docs
	existing.Questions = body.Questions
	existing.UpdatedAt = store.Now()
	if err := s.update(existing); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo guardar el servicio")
		return
	}
	write(w, existing)
}

func (s *Service) Delete(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	id := chi.URLParam(r, "id")
	res, err := s.DB.Exec(`DELETE FROM lawyer_services WHERE id=? AND lawyer_id=?`, id, u.ID)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo borrar el servicio")
		return
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		writeErr(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	write(w, map[string]any{"ok": true})
}

func (s *Service) Duplicate(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no autenticado")
		return
	}
	src, err := s.getOwned(chi.URLParam(r, "id"), u.ID)
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar el servicio")
		return
	}
	now := store.Now()
	copy := src
	copy.ID = fmt.Sprintf("svc-%d", time.Now().UnixNano())
	copy.Name = src.Name + " (copia)"
	copy.Status = "borrador"
	copy.Seeded = false
	slug, err := s.uniqueSlug(u.ID, src.Slug+"-copia", "")
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar el servicio")
		return
	}
	copy.Slug = slug
	copy.CreatedAt = now
	copy.UpdatedAt = now
	if err := s.insert(copy); err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo duplicar el servicio")
		return
	}
	writeStatus(w, http.StatusCreated, copy)
}

func (s *Service) ListPublic(w http.ResponseWriter, r *http.Request) {
	rows, err := s.listPublished()
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudieron cargar los servicios")
		return
	}
	write(w, map[string]any{"services": rows})
}

func (s *Service) GetPublic(w http.ResponseWriter, r *http.Request) {
	row, err := s.getPublished(chi.URLParam(r, "slug"))
	if err == sql.ErrNoRows {
		writeErr(w, http.StatusNotFound, "servicio no encontrado")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "no se pudo cargar el servicio")
		return
	}
	write(w, row)
}

func decodeBody(r *http.Request) (normalized, string) {
	var body upsertBody
	if err := json.NewDecoder(io.LimitReader(r.Body, 96<<10)).Decode(&body); err != nil {
		return normalized{}, "cuerpo inválido"
	}
	name := strings.TrimSpace(body.Name)
	if name == "" || utf8.RuneCountInString(name) > maxName {
		return normalized{}, "nombre inválido"
	}
	cat := strings.TrimSpace(body.Category)
	if cat == "" {
		cat = "penal"
	}
	if !validCategory(cat) {
		return normalized{}, "categoría inválida"
	}
	st := strings.TrimSpace(body.Status)
	if st == "" {
		st = "borrador"
	}
	if st != "borrador" && st != "publicado" {
		return normalized{}, "estado inválido"
	}
	price := 0
	if body.PriceCents != nil {
		price = *body.PriceCents
	} else if body.PriceUSD != nil {
		price = int(*body.PriceUSD*100 + 0.5)
	}
	if price < 0 || price > 9_999_900 {
		return normalized{}, "precio inválido"
	}
	pitch := strings.TrimSpace(body.Pitch)
	if utf8.RuneCountInString(pitch) > maxPitch {
		return normalized{}, "resumen demasiado largo"
	}
	desc := strings.TrimSpace(body.Description)
	if utf8.RuneCountInString(desc) > maxText {
		return normalized{}, "descripción demasiado larga"
	}
	dur := strings.TrimSpace(body.DurationHint)
	if utf8.RuneCountInString(dur) > maxDuration {
		return normalized{}, "plazo inválido"
	}
	docs, errMsg := normalizeDocs(body.Docs)
	if errMsg != "" {
		return normalized{}, errMsg
	}
	qs, errMsg := normalizeQuestions(body.Questions)
	if errMsg != "" {
		return normalized{}, errMsg
	}
	slugSrc := strings.TrimSpace(body.Slug)
	if slugSrc == "" {
		slugSrc = name
	}
	return normalized{
		Name:         name,
		Slug:         slugify(slugSrc),
		Category:     cat,
		Status:       st,
		PriceCents:   price,
		Pitch:        pitch,
		Description:  desc,
		DurationHint: dur,
		Docs:         docs,
		Questions:    qs,
	}, ""
}

type normalized struct {
	Name         string
	Slug         string
	Category     string
	Status       string
	PriceCents   int
	Pitch        string
	Description  string
	DurationHint string
	Docs         []DocItem
	Questions    []QuestionItem
}

func validCategory(c string) bool {
	switch c {
	case "familia", "penal", "administrativo", "civil", "laboral", "notarial", "transito":
		return true
	default:
		return false
	}
}

func normalizeDocs(in []DocItem) ([]DocItem, string) {
	if len(in) > maxItems {
		return nil, "demasiados documentos"
	}
	out := make([]DocItem, 0, len(in))
	for _, d := range in {
		label := strings.TrimSpace(d.Label)
		if label == "" {
			continue
		}
		if utf8.RuneCountInString(label) > 80 {
			return nil, "documento inválido"
		}
		out = append(out, DocItem{Label: label})
	}
	return out, ""
}

func normalizeQuestions(in []QuestionItem) ([]QuestionItem, string) {
	if len(in) > maxItems {
		return nil, "demasiadas preguntas"
	}
	out := make([]QuestionItem, 0, len(in))
	for _, q := range in {
		prompt := strings.TrimSpace(q.Prompt)
		if prompt == "" {
			continue
		}
		if utf8.RuneCountInString(prompt) > 200 {
			return nil, "pregunta inválida"
		}
		kind := strings.TrimSpace(q.Kind)
		if kind == "" {
			kind = "si_no"
		}
		if kind != "si_no" && kind != "texto" {
			return nil, "tipo de pregunta inválido"
		}
		out = append(out, QuestionItem{Prompt: prompt, Kind: kind})
	}
	return out, ""
}

func slugify(s string) string {
	s = strings.ToLower(strings.TrimSpace(s))
	var b strings.Builder
	for _, r := range s {
		switch r {
		case 'á', 'à', 'ä', 'â':
			b.WriteByte('a')
		case 'é', 'è', 'ë', 'ê':
			b.WriteByte('e')
		case 'í', 'ì', 'ï', 'î':
			b.WriteByte('i')
		case 'ó', 'ò', 'ö', 'ô':
			b.WriteByte('o')
		case 'ú', 'ù', 'ü', 'û':
			b.WriteByte('u')
		case 'ñ':
			b.WriteString("n")
		default:
			if unicode.IsLetter(r) || unicode.IsDigit(r) || r == ' ' || r == '-' {
				b.WriteRune(r)
			}
		}
	}
	out := slugClean.ReplaceAllString(b.String(), "-")
	out = strings.Trim(out, "-")
	if out == "" {
		out = "servicio"
	}
	if len(out) > 64 {
		out = strings.Trim(out[:64], "-")
	}
	return out
}

func centsToUSD(c int) float64 {
	return float64(c) / 100
}

func (s *Service) uniqueSlug(lawyerID int64, base, exceptID string) (string, error) {
	if base == "" {
		base = "servicio"
	}
	for i := 0; i < 40; i++ {
		try := base
		if i > 0 {
			try = fmt.Sprintf("%s-%d", base, i+1)
		}
		var n int
		q := `SELECT COUNT(*) FROM lawyer_services WHERE lawyer_id=? AND slug=?`
		args := []any{lawyerID, try}
		if exceptID != "" {
			q += ` AND id<>?`
			args = append(args, exceptID)
		}
		if err := s.DB.QueryRow(q, args...).Scan(&n); err != nil {
			return "", err
		}
		if n == 0 {
			return try, nil
		}
	}
	return fmt.Sprintf("%s-%d", base, time.Now().UnixNano()), nil
}

func (s *Service) ensureSeed(lawyerID int64) error {
	var n int
	if err := s.DB.QueryRow(`SELECT COUNT(*) FROM lawyer_services WHERE lawyer_id=?`, lawyerID).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	now := store.Now()
	docs, _ := json.Marshal([]DocItem{
		{Label: "Cédula del denunciante"},
		{Label: "Relato de los hechos"},
		{Label: "Evidencia (capturas o documentos)"},
	})
	qs, _ := json.Marshal([]QuestionItem{
		{Prompt: "¿Ya presentó una denuncia previa por este hecho?", Kind: "si_no"},
		{Prompt: "¿Hay una persona identificada como responsable?", Kind: "si_no"},
		{Prompt: "¿Es un hecho urgente o hay riesgo actual?", Kind: "si_no"},
	})
	_, err := s.DB.Exec(
		`INSERT INTO lawyer_services
		 (id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		"svc-denuncia-electronica",
		lawyerID,
		"denuncia-electronica",
		"Denuncia electrónica",
		"penal",
		"publicado",
		18900,
		"Presentación de denuncia ante Fiscalía u otras entidades, sin filas ni ventanilla.",
		"El cliente relata los hechos, adjunta cédula y evidencia, y el bufete arma el escrito para presentación electrónica. El honorario cubre revisión, redacción y carga en el canal competente. No incluye patrocinio en juicio.",
		"3 a 7 días hábiles",
		string(docs),
		string(qs),
		now,
		now,
	)
	return err
}

func (s *Service) insert(row Offering) error {
	docs, _ := json.Marshal(row.Docs)
	qs, _ := json.Marshal(row.Questions)
	_, err := s.DB.Exec(
		`INSERT INTO lawyer_services
		 (id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
		row.ID, row.LawyerID, row.Slug, row.Name, row.Category, row.Status, row.PriceCents,
		row.Pitch, row.Description, row.DurationHint, string(docs), string(qs), row.CreatedAt, row.UpdatedAt,
	)
	return err
}

func (s *Service) update(row Offering) error {
	docs, _ := json.Marshal(row.Docs)
	qs, _ := json.Marshal(row.Questions)
	_, err := s.DB.Exec(
		`UPDATE lawyer_services SET slug=?, name=?, category=?, status=?, price_cents=?, pitch=?, description=?, duration_hint=?, docs_json=?, questions_json=?, updated_at=?
		 WHERE id=? AND lawyer_id=?`,
		row.Slug, row.Name, row.Category, row.Status, row.PriceCents, row.Pitch, row.Description, row.DurationHint,
		string(docs), string(qs), row.UpdatedAt, row.ID, row.LawyerID,
	)
	return err
}

func (s *Service) listForLawyer(lawyerID int64) ([]Offering, error) {
	rows, err := s.DB.Query(
		`SELECT id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at
		 FROM lawyer_services WHERE lawyer_id=? ORDER BY updated_at DESC`,
		lawyerID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanOfferings(rows)
}

func (s *Service) listPublished() ([]Offering, error) {
	rows, err := s.DB.Query(
		`SELECT id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at
		 FROM lawyer_services WHERE status='publicado' ORDER BY updated_at DESC`,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanOfferings(rows)
}

func (s *Service) getOwned(id string, lawyerID int64) (Offering, error) {
	return scanOne(s.DB.QueryRow(
		`SELECT id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at
		 FROM lawyer_services WHERE id=? AND lawyer_id=?`,
		id, lawyerID,
	))
}

func (s *Service) getPublished(slug string) (Offering, error) {
	return scanOne(s.DB.QueryRow(
		`SELECT id, lawyer_id, slug, name, category, status, price_cents, pitch, description, duration_hint, docs_json, questions_json, created_at, updated_at
		 FROM lawyer_services WHERE slug=? AND status='publicado'`,
		slug,
	))
}

func scanOfferings(rows *sql.Rows) ([]Offering, error) {
	out := []Offering{}
	for rows.Next() {
		row, err := scanRow(rows)
		if err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func scanOne(row interface {
	Scan(dest ...any) error
}) (Offering, error) {
	return scanRow(row)
}

func scanRow(row interface {
	Scan(dest ...any) error
}) (Offering, error) {
	var o Offering
	var docsJSON, qsJSON string
	err := row.Scan(
		&o.ID, &o.LawyerID, &o.Slug, &o.Name, &o.Category, &o.Status, &o.PriceCents,
		&o.Pitch, &o.Description, &o.DurationHint, &docsJSON, &qsJSON, &o.CreatedAt, &o.UpdatedAt,
	)
	if err != nil {
		return o, err
	}
	o.PriceUSD = centsToUSD(o.PriceCents)
	o.Docs = []DocItem{}
	o.Questions = []QuestionItem{}
	_ = json.Unmarshal([]byte(docsJSON), &o.Docs)
	_ = json.Unmarshal([]byte(qsJSON), &o.Questions)
	o.Seeded = o.ID == "svc-denuncia-electronica"
	return o, nil
}

func write(w http.ResponseWriter, v any) {
	writeStatus(w, http.StatusOK, v)
}

func writeStatus(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeStatus(w, code, map[string]string{"error": msg})
}
