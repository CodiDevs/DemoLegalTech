package adminmock

import (
	"database/sql"
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"time"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type Service struct {
	DB *store.DB
}

func (s *Service) Metrics(w http.ResponseWriter, r *http.Request) {
	active, finished := 0, 0
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM cases WHERE status NOT IN ('00','10')`).Scan(&active)
	_ = s.DB.QueryRow(`SELECT COUNT(*) FROM cases WHERE status='10'`).Scan(&finished)

	recent := s.queryRecentCases()
	if len(recent) == 0 {
		recent = defaultRecentCases()
	}

	master := s.loadMasterTemplates()

	write(w, map[string]any{
		"demo":  true,
		"label": "LegalStation Admin (mock Fase 2)",
		"metrics": map[string]any{
			"casos_activos":           active,
			"casos_finalizados":       finished,
			"conversion_cuestionario": 0.61,
			"ingreso_mes_usd":         18420,
			"tiempo_promedio_dias":    18.4,
		},
		"funnel": []map[string]any{
			{"step": "Cuestionario", "count": 820, "pct": 100},
			{"step": "Registro", "count": 502, "pct": 61},
			{"step": "Pago", "count": 418, "pct": 51},
			{"step": "Finalizado", "count": max(finished, 1), "pct": 16},
		},
		"revenue_breakdown": []map[string]any{
			{"product": "Divorcio360 ($349)", "amount_usd": 12250, "cases": 35},
			{"product": "Evaluación ($749+)", "amount_usd": 6170, "cases": 7},
		},
		"recent_cases": recent,
		"team": []map[string]any{
			{"name": "Ana Operador", "role": "Senior counsel", "active_cases": active, "status": "online"},
			{"name": "Carlos Review", "role": "Operator", "active_cases": 4, "status": "online"},
			{"name": "Patricia Admin", "role": "Org admin", "active_cases": 2, "status": "away"},
		},
		"activity": []map[string]any{
			{"at": time.Now().Add(-2 * time.Hour).UTC().Format(time.RFC3339), "text": "Minuta generada — expediente demo"},
			{"at": time.Now().Add(-5 * time.Hour).UTC().Format(time.RFC3339), "text": "Sync SATJE simulada — 3 registros"},
			{"at": time.Now().Add(-8 * time.Hour).UTC().Format(time.RFC3339), "text": "Documentos aprobados"},
		},
		"master_templates": master,
		"generated_at":     time.Now().UTC().Format(time.RFC3339),
	})
}

func (s *Service) PatchMasterTemplate(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Version string `json:"version"`
		Note    string `json:"note"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil || body.Version == "" {
		writeErr(w, http.StatusBadRequest, "version requerida")
		return
	}
	now := store.Now()
	_, _ = s.DB.Exec(
		`INSERT INTO mock_master_template_edits (template_id, version, note, updated_at) VALUES (?,?,?,?)
		 ON CONFLICT(template_id) DO UPDATE SET version=excluded.version, note=excluded.note, updated_at=excluded.updated_at`,
		id, body.Version, body.Note, now,
	)
	write(w, map[string]any{"ok": true, "template_id": id, "version": body.Version})
}

func (s *Service) AIAnalyze(w http.ResponseWriter, r *http.Request) {
	var body struct {
		CaseID int `json:"case_id"`
	}
	_ = json.NewDecoder(io.LimitReader(r.Body, 4096)).Decode(&body)
	summary := "Análisis mock LegalStation: documentos legibles, sin inconsistencias detectadas."
	recs := []string{"Aprobar documentos y preparar minuta"}
	if body.CaseID == 1 {
		summary = "Expediente #1: apto vía notarial. Pendiente aprobación jurídica."
		recs = []string{"Aprobar cédula y partida", "Generar minuta", "Enviar a firma"}
	}
	write(w, map[string]any{
		"demo": true, "case_id": body.CaseID, "summary": summary,
		"risks":           []string{"Verificar mediación si hay menores"},
		"recommendations": recs, "confidence": 0.87,
		"cross_check": []map[string]any{{"field": "Cédula vs partida", "status": "ok", "detail": "Coinciden"}},
		"chat":        []map[string]string{{"role": "user", "text": "¿Listo para minuta?"}, {"role": "assistant", "text": summary}},
	})
}

func (s *Service) SatjeSync(w http.ResponseWriter, r *http.Request) {
	now := time.Now().UTC()
	links, _ := s.listAllLinks()
	write(w, map[string]any{
		"demo": true, "status": "simulated",
		"message":   "Sincronización SATJE simulada — LegalStation demo",
		"last_sync": now.Format(time.RFC3339), "next_scheduled": now.Add(6 * time.Hour).Format(time.RFC3339),
		"records_pulled": 3,
		"records": []map[string]any{
			{"cause_no": "17234-2024-00123", "court": "Unidad Judicial Familia Quito", "status": "En trámite", "match_case_id": 1},
			{"cause_no": "09102-2023-00456", "court": "Unidad Judicial Civil Guayaquil", "status": "Archivado", "match_case_id": 0},
		},
		"suggested_matches": []map[string]any{
			{"case_id": 1, "cause_no": "17234-2024-00123", "confidence": 0.92, "label": "Expediente #1 ↔ 17234-2024-00123"},
		},
		"saved_links": links,
	})
}

func (s *Service) SatjeLink(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	var body struct {
		CaseID     int64   `json:"case_id"`
		CauseNo    string  `json:"cause_no"`
		Court      string  `json:"court"`
		Confidence float64 `json:"confidence"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil || body.CaseID == 0 || body.CauseNo == "" {
		writeErr(w, http.StatusBadRequest, "case_id y cause_no requeridos")
		return
	}
	now := store.Now()
	_, _ = s.DB.Exec(
		`INSERT INTO mock_satje_links (case_id, cause_no, court, confidence, linked_by, created_at) VALUES (?,?,?,?,?,?)`,
		body.CaseID, body.CauseNo, body.Court, body.Confidence, u.ID, now,
	)
	links, _ := s.listLinksForCase(body.CaseID)
	write(w, map[string]any{"ok": true, "links": links})
}

func (s *Service) SatjeLinks(w http.ResponseWriter, r *http.Request) {
	caseID, _ := strconv.ParseInt(r.URL.Query().Get("case_id"), 10, 64)
	if caseID > 0 {
		links, _ := s.listLinksForCase(caseID)
		write(w, map[string]any{"links": links})
		return
	}
	links, _ := s.listAllLinks()
	write(w, map[string]any{"links": links})
}

func (s *Service) BillingRecurring(w http.ResponseWriter, r *http.Request) {
	u := auth.UserFrom(r.Context())
	tenant := s.loadTenant()
	planID, _ := tenant["plan"].(string)
	tenant["plan_label"] = planLabel(planID)
	tenant["referral_link"] = "http://localhost:4200/productos/divorcio360?ref=abogado" + strconv.FormatInt(u.ID, 10)
	tenant["commission_pct"] = 15
	tenant["platform_pct"] = 85
	tenant["suggested_client_price_usd"] = 349
	write(w, map[string]any{
		"demo": true, "note": "Licencia LegalStation para bufetes — el cliente final paga honorarios por trámite, no esta suscripción.",
		"current_tenant": tenant,
		"plans":          defaultPlans(),
		"invoices": []map[string]any{
			{"id": "INV-2026-08", "date": "2026-08-01", "amount_usd": 249, "status": "pagada"},
		},
	})
}

func (s *Service) PatchBillingPlan(w http.ResponseWriter, r *http.Request) {
	var body struct {
		PlanID string `json:"plan_id"`
	}
	if json.NewDecoder(r.Body).Decode(&body) != nil || body.PlanID == "" {
		writeErr(w, http.StatusBadRequest, "plan_id requerido")
		return
	}
	now := store.Now()
	_, _ = s.DB.Exec(`UPDATE mock_tenant SET plan_id=?, updated_at=? WHERE id=1`, body.PlanID, now)
	write(w, map[string]any{"ok": true, "current_tenant": s.loadTenant()})
}

func (s *Service) loadTenant() map[string]any {
	var name, plan string
	var used, limit int
	_ = s.DB.QueryRow(`SELECT org_name, plan_id, cases_used, cases_limit FROM mock_tenant WHERE id=1`).Scan(&name, &plan, &used, &limit)
	if name == "" {
		name = "LegalStation Demo Organization"
		plan = "b2b-pro"
		used, limit = 18, 50
	}
	return map[string]any{"name": name, "plan": plan, "plan_label": planLabel(plan), "cases_used": used, "cases_limit": limit}
}

func planLabel(planID string) string {
	switch planID {
	case "b2b-basic":
		return "Starter"
	case "b2b-pro":
		return "Professional"
	case "b2b-enterprise":
		return "Enterprise"
	default:
		return planID
	}
}

func (s *Service) loadMasterTemplates() []map[string]any {
	base := []map[string]any{
		{"id": "divorcio-notarial", "name": "Divorcio notarial", "version": "v1.0", "status": "activa"},
		{"id": "minuta-base", "name": "Minuta base", "version": "v1.1-borrador", "status": "borrador"},
	}
	rows, err := s.DB.Query(`SELECT template_id, version, note FROM mock_master_template_edits`)
	if err != nil {
		return base
	}
	defer rows.Close()
	edits := map[string]map[string]any{}
	for rows.Next() {
		var id, ver, note string
		if rows.Scan(&id, &ver, &note) == nil {
			edits[id] = map[string]any{"version": ver, "note": note}
		}
	}
	for i, t := range base {
		id, _ := t["id"].(string)
		if e, ok := edits[id]; ok {
			base[i]["version"] = e["version"]
			if note, ok := e["note"].(string); ok && note != "" {
				base[i]["note"] = note
			}
		}
	}
	return base
}

func (s *Service) queryRecentCases() []map[string]any {
	rows, err := s.DB.Query(`
		SELECT c.id, u.full_name, c.status, c.updated_at FROM cases c
		JOIN users u ON u.id = c.client_id ORDER BY c.updated_at DESC LIMIT 5`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	out := []map[string]any{}
	for rows.Next() {
		var id int64
		var client, status, updated string
		if rows.Scan(&id, &client, &status, &updated) != nil {
			continue
		}
		days := int(time.Since(parseTime(updated)).Hours() / 24)
		if days < 0 {
			days = 0
		}
		out = append(out, map[string]any{
			"id": id, "client": client, "status": status,
			"status_label": cases.StatusLabels[status], "lawyer": "Ana Operador", "days": days,
		})
	}
	return out
}

func (s *Service) listLinksForCase(caseID int64) ([]map[string]any, error) {
	rows, err := s.DB.Query(`SELECT case_id, cause_no, court, confidence, created_at FROM mock_satje_links WHERE case_id=? ORDER BY id DESC`, caseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanLinks(rows)
}

func (s *Service) listAllLinks() ([]map[string]any, error) {
	rows, err := s.DB.Query(`SELECT case_id, cause_no, court, confidence, created_at FROM mock_satje_links ORDER BY id DESC LIMIT 20`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanLinks(rows)
}

func scanLinks(rows *sql.Rows) ([]map[string]any, error) {
	out := []map[string]any{}
	for rows.Next() {
		var caseID int64
		var cause, court, created string
		var conf float64
		if rows.Scan(&caseID, &cause, &court, &conf, &created) != nil {
			continue
		}
		out = append(out, map[string]any{
			"case_id": caseID, "cause_no": cause, "court": court,
			"confidence": conf, "created_at": created,
			"label": "Expediente #" + strconv.FormatInt(caseID, 10) + " ↔ " + cause,
		})
	}
	return out, nil
}

func defaultRecentCases() []map[string]any {
	return []map[string]any{
		{"id": 1, "client": "María Demo", "status": "03", "status_label": "Revisión jurídica", "lawyer": "Ana Operador", "days": 2},
	}
}

func defaultPlans() []map[string]any {
	return []map[string]any{
		{"id": "b2b-basic", "name": "Starter", "price_usd": 99, "interval": "monthly", "features": map[string]any{"users": 3, "cases_per_month": 15, "ai": false, "satje": false}},
		{"id": "b2b-pro", "name": "Professional", "price_usd": 249, "interval": "monthly", "features": map[string]any{"users": 10, "cases_per_month": 50, "ai": true, "satje": true}},
		{"id": "b2b-enterprise", "name": "Enterprise", "price_usd": 799, "interval": "monthly", "features": map[string]any{"users": "Ilimitados", "cases_per_month": "Ilimitados", "ai": true, "satje": true}},
	}
}

func parseTime(s string) time.Time {
	t, _ := time.Parse(time.RFC3339, s)
	return t
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func write(w http.ResponseWriter, v any) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(map[string]string{"error": msg})
}
