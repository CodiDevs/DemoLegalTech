package notifications

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
)

type Notification struct {
	ID        int64  `json:"id"`
	UserID    int64  `json:"user_id"`
	CaseID    int64  `json:"case_id"`
	Kind      string `json:"kind"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	Read      bool   `json:"read"`
	CreatedAt string `json:"created_at"`
}

func Notify(db *store.DB, userID, caseID int64, kind, title, body string) {
	if userID == 0 {
		return
	}
	_, _ = db.Exec(
		`INSERT INTO notifications (user_id, case_id, kind, title, body, read, created_at) VALUES (?,?,?,?,?,0,?)`,
		userID, nullCase(caseID), kind, title, body, store.Now(),
	)
}

func NotifyLawyersForCase(db *store.DB, caseID int64, kind, title, body string) {
	rows, err := db.Query(`SELECT id FROM users WHERE role='abogado'`)
	if err != nil {
		return
	}
	var lawyerIDs []int64
	for rows.Next() {
		var id int64
		if rows.Scan(&id) == nil {
			lawyerIDs = append(lawyerIDs, id)
		}
	}
	_ = rows.Close()
	for _, id := range lawyerIDs {
		Notify(db, id, caseID, kind, title, body)
	}
}

func NotifyClient(db *store.DB, clientID, caseID int64, kind, title, body string) {
	Notify(db, clientID, caseID, kind, title, body)
}

func List(w http.ResponseWriter, r *http.Request, db *store.DB) {
	u := auth.UserFrom(r.Context())
	rows, err := db.Query(
		`SELECT id, user_id, case_id, kind, title, body, read, created_at FROM notifications WHERE user_id=? ORDER BY id DESC LIMIT 50`,
		u.ID,
	)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	defer rows.Close()
	out := []Notification{}
	for rows.Next() {
		var n Notification
		var read int
		var cid int64
		if err := rows.Scan(&n.ID, &n.UserID, &cid, &n.Kind, &n.Title, &n.Body, &read, &n.CreatedAt); err != nil {
			continue
		}
		n.CaseID = cid
		n.Read = read == 1
		out = append(out, n)
	}
	writeJSON(w, http.StatusOK, out)
}

func MarkRead(w http.ResponseWriter, r *http.Request, db *store.DB) {
	u := auth.UserFrom(r.Context())
	id, _ := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	_, _ = db.Exec(`UPDATE notifications SET read=1 WHERE id=? AND user_id=?`, id, u.ID)
	writeJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func nullCase(id int64) any {
	if id == 0 {
		return nil
	}
	return id
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
