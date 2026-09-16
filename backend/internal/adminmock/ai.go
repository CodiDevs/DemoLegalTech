package adminmock

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"time"

	"github.com/codidevs/divorcio360/internal/cases"
)

const deskListCap = 4

type deskCase struct {
	ID        int
	Status    string
	Client    string
	Product   string
	Created   time.Time
	Days      int
	SLA       bool
	HasMinuta bool
}

// keep in sync with frontend/src/app/shared/case-status.data.ts
var statusShort = map[string]string{
	"01": "Recepción", "02": "Documentos", "03": "Revisión", "04": "Minuta",
	"05": "Firma", "06": "Notaría", "07": "Cita", "08": "Acta",
	"09": "Registro", "10": "Cierre",
}

var lawyerHint = map[string]string{
	"01": "Caso recibido. Espera el pago o la carga inicial.",
	"02": "El cliente debe subir los documentos.",
	"03": "Revisa y aprueba cada documento.",
	"04": "Carga la minuta del notario.",
	"05": "El cliente firma. Puedes reenviar el aviso.",
	"06": "Registra el envío a notaría.",
	"07": "Registra la comparecencia.",
	"08": "Registra el acta emitida.",
	"09": "Inscribe en Registro Civil y cierra.",
	"10": "Trámite cerrado.",
}

func (s *Service) AIAnalyze(w http.ResponseWriter, r *http.Request) {
	var body struct {
		CaseID int `json:"case_id"`
	}
	_ = json.NewDecoder(io.LimitReader(r.Body, 4096)).Decode(&body)
	list := s.listDeskCases()
	summary, recs, risk := deskBrief(list, body.CaseID)
	risks := []string{}
	if risk != "" {
		risks = []string{risk}
	}
	write(w, map[string]any{
		"demo": true, "case_id": body.CaseID, "source": "bandeja",
		"summary": summary, "risks": risks, "recommendations": recs,
	})
}

func (s *Service) AIChat(w http.ResponseWriter, r *http.Request) {
	var body struct {
		CaseID  int    `json:"case_id"`
		Message string `json:"message"`
	}
	_ = json.NewDecoder(io.LimitReader(r.Body, 4096)).Decode(&body)
	msg := strings.TrimSpace(body.Message)
	if msg == "" {
		writeErr(w, http.StatusBadRequest, "message requerido")
		return
	}
	write(w, map[string]any{
		"demo": true, "case_id": body.CaseID, "source": "bandeja",
		"reply": deskChat(s.listDeskCases(), body.CaseID, msg),
	})
}

func (s *Service) listDeskCases() []deskCase {
	if s == nil || s.DB == nil {
		return nil
	}
	rows, err := s.DB.Query(`
		SELECT c.id, c.status, c.product, c.created_at, c.updated_at, u.full_name,
		       COALESCE((
		         SELECT e.created_at FROM case_events e
		         WHERE e.case_id = c.id AND e.status = c.status
		         ORDER BY e.id DESC LIMIT 1
		       ), c.updated_at),
		       (SELECT COUNT(*) FROM case_outputs o WHERE o.case_id = c.id AND o.output_type = 'minuta')
		FROM cases c
		JOIN users u ON u.id = c.client_id
		ORDER BY c.id ASC`)
	if err != nil {
		return nil
	}
	defer rows.Close()
	out := []deskCase{}
	for rows.Next() {
		var id, minutaN int
		var status, product, created, updated, client, statusAt string
		if rows.Scan(&id, &status, &product, &created, &updated, &client, &statusAt, &minutaN) != nil {
			continue
		}
		days := daysSince(statusAt)
		out = append(out, deskCase{
			ID: id, Status: status, Client: strings.TrimSpace(client), Product: product,
			Created: parseTime(created), Days: days,
			SLA: status == "03" && days >= 2, HasMinuta: minutaN > 0,
		})
	}
	return out
}

func daysSince(raw string) int {
	t := parseTime(raw)
	if t.IsZero() {
		return 0
	}
	d := int(time.Since(t).Hours() / 24)
	if d < 0 {
		return 0
	}
	return d
}

func foldQuery(s string) string {
	r := strings.NewReplacer("á", "a", "é", "e", "í", "i", "ó", "o", "ú", "u", "ü", "u", "ñ", "n")
	return r.Replace(strings.ToLower(strings.TrimSpace(s)))
}

func (c deskCase) short() string {
	if s, ok := statusShort[c.Status]; ok {
		return s
	}
	if s, ok := cases.StatusLabels[c.Status]; ok {
		return s
	}
	return c.Status
}

func (c deskCase) hint() string {
	if h, ok := lawyerHint[c.Status]; ok {
		return h
	}
	return "Abrir el expediente."
}

func (c deskCase) ball() string {
	switch c.Status {
	case "10":
		return "cerrado"
	case "03", "04", "06", "07", "08", "09":
		return "te toca"
	default:
		return "espera al cliente"
	}
}

func (c deskCase) lawyer() bool {
	switch c.Status {
	case "03", "04", "06", "07", "08", "09":
		return true
	default:
		return false
	}
}

func (c deskCase) late() bool {
	return c.SLA || c.Days >= 5
}

func (c deskCase) ref() string {
	return fmt.Sprintf("#%d · %s · %s · %s", c.ID, c.short(), daysES(c.Days), c.ball())
}

func daysES(n int) string {
	if n <= 0 {
		return "hoy"
	}
	if n == 1 {
		return "1 día"
	}
	return fmt.Sprintf("%d días", n)
}

func intakeES(t time.Time) string {
	if t.IsZero() {
		return "sin fecha de ingreso"
	}
	months := []string{"ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"}
	u := t.UTC()
	return fmt.Sprintf("%d %s", u.Day(), months[u.Month()-1])
}

func productES(p string) string {
	switch p {
	case "traslado360":
		return "Traslado360"
	case "bienraiz360":
		return "BienRaíz360"
	default:
		return "Divorcio360"
	}
}

func openDesk(list []deskCase) []deskCase {
	out := make([]deskCase, 0, len(list))
	for _, c := range list {
		if c.Status != "10" {
			out = append(out, c)
		}
	}
	return out
}

func lawyerDesk(list []deskCase) []deskCase {
	out := make([]deskCase, 0, len(list))
	for _, c := range list {
		if c.lawyer() {
			out = append(out, c)
		}
	}
	return out
}

func clientDesk(list []deskCase) []deskCase {
	out := make([]deskCase, 0, len(list))
	for _, c := range list {
		if c.Status != "10" && !c.lawyer() {
			out = append(out, c)
		}
	}
	return out
}

func sortDesk(list []deskCase) []deskCase {
	out := append([]deskCase(nil), list...)
	sort.SliceStable(out, func(i, j int) bool { return deskLess(out[i], out[j]) })
	return out
}

func deskLess(a, b deskCase) bool {
	if a.SLA != b.SLA {
		return a.SLA
	}
	if a.late() != b.late() {
		return a.late()
	}
	if !a.Created.Equal(b.Created) {
		if a.Created.IsZero() {
			return false
		}
		if b.Created.IsZero() {
			return true
		}
		return a.Created.Before(b.Created)
	}
	if a.Days != b.Days {
		return a.Days > b.Days
	}
	return a.ID < b.ID
}

func findDesk(list []deskCase, id int) (deskCase, bool) {
	if id <= 0 {
		return deskCase{}, false
	}
	for _, c := range list {
		if c.ID == id {
			return c, true
		}
	}
	return deskCase{}, false
}

func cappedDesk(list []deskCase) string {
	if len(list) == 0 {
		return ""
	}
	n := len(list)
	if n > deskListCap {
		n = deskListCap
	}
	parts := make([]string, 0, n+1)
	for i := 0; i < n; i++ {
		parts = append(parts, list[i].ref())
	}
	if extra := len(list) - n; extra > 0 {
		parts = append(parts, fmt.Sprintf("y %d más", extra))
	}
	return strings.Join(parts, "; ")
}

func lateDesk(list []deskCase) string {
	late := make([]deskCase, 0)
	for _, c := range openDesk(list) {
		if c.late() {
			late = append(late, c)
		}
	}
	late = sortDesk(late)
	if len(late) == 0 {
		return ""
	}
	return "Fuera de plazo: " + cappedDesk(late) + "."
}

func deskBrief(list []deskCase, caseID int) (summary string, recs []string, risk string) {
	if c, ok := findDesk(list, caseID); ok {
		summary = fmt.Sprintf("#%d · %s · %s. Ingreso %s. %s en esta etapa. %s",
			c.ID, productES(c.Product), c.short(), intakeES(c.Created), daysES(c.Days), c.hint())
		recs = []string{c.hint()}
		if c.late() {
			risk = fmt.Sprintf("Fuera de plazo: %s en %s.", daysES(c.Days), c.short())
		}
		return
	}
	ranked := sortDesk(openDesk(list))
	if len(list) == 0 {
		return "No hay expedientes en la bandeja.", nil, ""
	}
	if len(ranked) == 0 {
		return "Todos los expedientes están cerrados.", nil, ""
	}
	first := ranked[0]
	summary = fmt.Sprintf("Primero por ingreso: %s (ingreso %s).", first.ref(), intakeES(first.Created))
	mine := sortDesk(lawyerDesk(list))
	waiting := sortDesk(clientDesk(list))
	if len(mine) > 0 {
		recs = []string{"Te toca: " + cappedDesk(mine) + "."}
	} else if len(waiting) > 0 {
		recs = []string{"Espera al cliente: " + cappedDesk(waiting) + "."}
	}
	risk = strings.TrimSuffix(lateDesk(list), ".")
	return
}

func deskChat(list []deskCase, caseID int, msg string) string {
	q := foldQuery(msg)
	if q == "" {
		return "Escribe una pregunta sobre pendiente, prioridad o quién espera."
	}
	c, hasSel := findDesk(list, caseID)
	readsDoc := strings.Contains(q, "pdf") || strings.Contains(q, "ocr") ||
		strings.Contains(q, "cedula") || strings.Contains(q, "partida") ||
		strings.Contains(q, "lee el") || strings.Contains(q, "leer") ||
		strings.Contains(q, "leyo") || strings.Contains(q, "leiste") ||
		(strings.Contains(q, "documento") && !strings.Contains(q, "pendiente"))
	if readsDoc {
		return replyDocsGo(list, hasSel, c)
	}
	if strings.Contains(q, "minuta") {
		return replyMinutaGo(hasSel, c)
	}
	if strings.Contains(q, "quien") || strings.Contains(q, "pelota") || strings.Contains(q, "a quien") {
		return replyBallGo(list)
	}
	if strings.Contains(q, "primero") || strings.Contains(q, "priorid") || strings.Contains(q, "important") ||
		strings.Contains(q, "antigu") || strings.Contains(q, "ingreso") || strings.Contains(q, "viejo") ||
		strings.Contains(q, "plazo") || strings.Contains(q, "atras") {
		return replyPriorityGo(list)
	}
	if strings.Contains(q, "pendiente") || strings.Contains(q, "detenid") ||
		strings.Contains(q, "me toca") || strings.Contains(q, "te toca") {
		return replyPendingGo(list)
	}
	if strings.Contains(q, "sigue") || strings.Contains(q, "siguiente") || strings.Contains(q, "ahora") {
		if hasSel {
			return replyCaseGo(c)
		}
		return replyPendingGo(list)
	}
	if hasSel {
		return replyCaseGo(c)
	}
	return replyPriorityGo(list)
}

func replyDocsGo(list []deskCase, hasSel bool, c deskCase) string {
	ranked := sortDesk(openDesk(list))
	extra := ""
	if len(ranked) > 0 {
		extra = " Primero por ingreso: " + ranked[0].ref() + "."
	}
	here := ""
	if hasSel {
		here = " Este folio está en " + c.short() + "."
	}
	return "No leo el contenido de los documentos." + here + extra + " Pregunta por pendiente, prioridad o quién espera."
}

func replyMinutaGo(hasSel bool, c deskCase) string {
	if !hasSel {
		return "Elige un expediente o pregunta qué está pendiente. La minuta es una etapa, no un PDF leído."
	}
	if c.Status == "04" || c.HasMinuta {
		return fmt.Sprintf("#%d está en %s. %s No leo el archivo de la minuta.", c.ID, c.short(), c.hint())
	}
	if c.Status < "04" {
		return fmt.Sprintf("#%d sigue en %s. La minuta viene después. %s", c.ID, c.short(), c.hint())
	}
	return fmt.Sprintf("#%d ya pasó de minuta. Ahora: %s. %s", c.ID, c.short(), c.hint())
}

func replyPendingGo(list []deskCase) string {
	mine := sortDesk(lawyerDesk(list))
	waiting := sortDesk(clientDesk(list))
	if len(mine) == 0 && len(waiting) == 0 {
		if len(openDesk(list)) > 0 {
			return "Nada pendiente con etapa abierta."
		}
		return "No hay expedientes en la bandeja."
	}
	parts := make([]string, 0, 3)
	if len(mine) > 0 {
		parts = append(parts, "Te toca: "+cappedDesk(mine)+".")
	}
	if len(waiting) > 0 {
		parts = append(parts, "Espera al cliente: "+cappedDesk(waiting)+".")
	}
	if late := lateDesk(list); late != "" {
		parts = append(parts, late)
	}
	return strings.Join(parts, " ")
}

func replyPriorityGo(list []deskCase) string {
	ranked := sortDesk(openDesk(list))
	if len(ranked) == 0 {
		return "No hay expedientes abiertos."
	}
	first := ranked[0]
	out := fmt.Sprintf("Primero #%d: ingreso %s, %s.", first.ID, intakeES(first.Created), first.ref())
	if first.late() {
		out += " Fuera de plazo."
	}
	rest := ranked[1:]
	if len(rest) > deskListCap {
		rest = rest[:deskListCap]
	}
	if len(rest) > 0 {
		refs := make([]string, len(rest))
		for i, c := range rest {
			refs[i] = c.ref()
		}
		out += " Siguen: " + strings.Join(refs, "; ") + "."
	}
	return out
}

func replyBallGo(list []deskCase) string {
	mine := lawyerDesk(list)
	waiting := clientDesk(list)
	closed := len(list) - len(openDesk(list))
	parts := make([]string, 0, 2)
	if n := len(mine); n == 1 {
		parts = append(parts, "1 folio te espera")
	} else if n > 1 {
		parts = append(parts, fmt.Sprintf("%d folios te esperan", n))
	}
	if n := len(waiting); n == 1 {
		parts = append(parts, "1 espera al cliente")
	} else if n > 1 {
		parts = append(parts, fmt.Sprintf("%d esperan al cliente", n))
	}
	if len(parts) == 0 {
		if closed > 0 {
			return "Nada en juego: todo cerrado."
		}
		return "No hay expedientes en la bandeja."
	}
	out := strings.Join(parts, ". ") + "."
	if m := sortDesk(mine); len(m) > 0 {
		out += " Te toca empezar por " + m[0].ref() + "."
	} else if w := sortDesk(waiting); len(w) > 0 {
		out += " El más viejo del cliente: " + w[0].ref() + "."
	}
	return out
}

func replyCaseGo(c deskCase) string {
	late := ""
	if c.late() {
		late = " Fuera de plazo."
	}
	return fmt.Sprintf("#%d · %s · %s. Ingreso %s. %s en esta etapa. %s%s",
		c.ID, productES(c.Product), c.short(), intakeES(c.Created), daysES(c.Days), c.hint(), late)
}
