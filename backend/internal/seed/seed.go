package seed

import (
	"database/sql"
	"os"
	"path/filepath"

	"github.com/codidevs/divorcio360/internal/store"
	"golang.org/x/crypto/bcrypt"
)

func Run(db *store.DB, uploadDir string) error {
	var n int
	if err := db.QueryRow(`SELECT COUNT(*) FROM users`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte("demo1234"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	now := store.Now()
	res, err := db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"abogado@demo.ec", string(hash), "Dra. Ana Ruiz", "0991112233", "abogado", now,
	)
	if err != nil {
		return err
	}
	lawyerID, _ := res.LastInsertId()

	res, err = db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"cliente@demo.ec", string(hash), "Carlos Mendoza", "0987654321", "cliente", now,
	)
	if err != nil {
		return err
	}
	clientID, _ := res.LastInsertId()

	qJSON := `{"both_want_divorce":true,"marriage_in_ecuador":true,"have_children":false,"minor_dependents":false,"custody_regulated":false,"has_mediation_acta":false,"someone_abroad":false,"have_assets":true,"conjugal_society":false,"ids_valid":true,"want_liquidate_assets":false,"city":"Quito"}`

	cres, err := db.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		clientID, lawyerID, "03", "apto", "Quito", 1, 34900, "divorcio360", qJSON, now, now,
	)
	if err != nil {
		return err
	}
	caseID, _ := cres.LastInsertId()

	_, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "01", "Pago mock confirmado (seed)", clientID, now)
	if err != nil {
		return err
	}
	_, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "02", "Documentos cargados (seed)", clientID, now)
	if err != nil {
		return err
	}
	_, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "03", "En revisión jurídica — listo para demo abogado", lawyerID, now)
	if err != nil {
		return err
	}
	_, err = db.Exec(
		`INSERT INTO payments (case_id, provider, amount_cents, status, reference, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "payphone_mock", 34900, "paid", "SEED-PAY-001", now,
	)
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	_ = os.MkdirAll(uploadDir, 0o755)
	cedulaPath := filepath.Join(uploadDir, "seed_case1_cedula.txt")
	partidaPath := filepath.Join(uploadDir, "seed_case1_partida.txt")
	_ = os.WriteFile(cedulaPath, []byte("CEDULA DEMO — Carlos Mendoza\nDocumento placeholder seed"), 0o644)
	_ = os.WriteFile(partidaPath, []byte("PARTIDA MATRIMONIO DEMO — placeholder seed"), 0o644)

	_, _ = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "cedula", "cedula_carlos_demo.txt", "seed_case1_cedula.txt", "text/plain", 64, clientID, "pending", now,
	)
	_, _ = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "partida", "partida_matrimonio_demo.txt", "seed_case1_partida.txt", "text/plain", 48, clientID, "pending", now,
	)

	return nil
}
