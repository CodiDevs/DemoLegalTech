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
	if err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE email='abogado@demo.ec'`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		if err := ensureNotario(db); err != nil {
			return err
		}
		return ensureSignReadyCase(db, uploadDir)
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

	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "01", "Pago mock confirmado (seed)", clientID, now); err != nil {
		return err
	}
	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "02", "Documentos cargados (seed)", clientID, now); err != nil {
		return err
	}
	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "03", "En revisión jurídica — listo para demo abogado", lawyerID, now); err != nil {
		return err
	}
	if _, err = db.Exec(
		`INSERT INTO payments (case_id, provider, amount_cents, status, reference, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "payphone_mock", 34900, "paid", "SEED-PAY-001", now,
	); err != nil && err != sql.ErrNoRows {
		return err
	}

	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return err
	}
	cedulaPath := filepath.Join(uploadDir, "seed_case1_cedula.txt")
	partidaPath := filepath.Join(uploadDir, "seed_case1_partida.txt")
	if err := os.WriteFile(cedulaPath, []byte("CEDULA DEMO — Carlos Mendoza\nDocumento placeholder seed"), 0o644); err != nil {
		return err
	}
	if err := os.WriteFile(partidaPath, []byte("PARTIDA MATRIMONIO DEMO — placeholder seed"), 0o644); err != nil {
		return err
	}

	if _, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "cedula", "cedula_carlos_demo.txt", "seed_case1_cedula.txt", "text/plain", 64, clientID, "pending", now,
	); err != nil {
		return err
	}
	if _, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		caseID, "partida", "partida_matrimonio_demo.txt", "seed_case1_partida.txt", "text/plain", 48, clientID, "pending", now,
	); err != nil {
		return err
	}

	if err := ensureNotario(db); err != nil {
		return err
	}
	return ensureSignReadyCase(db, uploadDir)
}

func ensureNotario(db *store.DB) error {
	var n int
	if err := db.QueryRow(`SELECT COUNT(*) FROM users WHERE email='notario@demo.ec'`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}
	hash, err := bcrypt.GenerateFromPassword([]byte("demo1234"), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	_, err = db.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES (?,?,?,?,?,?)`,
		"notario@demo.ec", string(hash), "Dr. Luis Notario", "0998887766", "notario", store.Now(),
	)
	return err
}

func ensureSignReadyCase(db *store.DB, uploadDir string) error {
	var n int
	if err := db.QueryRow(`SELECT COUNT(*) FROM case_outputs WHERE output_type='minuta'`).Scan(&n); err != nil {
		return err
	}
	if n > 0 {
		return nil
	}

	var clientID, lawyerID int64
	if err := db.QueryRow(`SELECT id FROM users WHERE email='cliente@demo.ec'`).Scan(&clientID); err != nil {
		return err
	}
	if err := db.QueryRow(`SELECT id FROM users WHERE email='abogado@demo.ec'`).Scan(&lawyerID); err != nil {
		return err
	}

	now := store.Now()
	qJSON := `{"both_want_divorce":true,"marriage_in_ecuador":true,"have_children":false,"minor_dependents":false,"custody_regulated":false,"has_mediation_acta":false,"someone_abroad":false,"have_assets":false,"conjugal_society":false,"ids_valid":true,"want_liquidate_assets":false,"city":"Quito","demo_fixture":"sign_ready"}`
	cres, err := db.Exec(
		`INSERT INTO cases (client_id, lawyer_id, status, result, city, paid, amount_cents, product, questionnaire_json, created_at, updated_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		clientID, lawyerID, "04", "apto", "Quito", 1, 34900, "divorcio360", qJSON, now, now,
	)
	if err != nil {
		return err
	}
	caseID, _ := cres.LastInsertId()

	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "01", "Pago mock confirmado (fixture firma)", clientID, now); err != nil {
		return err
	}
	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "02", "Documentos cargados (fixture firma)", clientID, now); err != nil {
		return err
	}
	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "03", "Docs aprobados (fixture firma)", lawyerID, now); err != nil {
		return err
	}
	if _, err = db.Exec(`INSERT INTO case_events (case_id, status, note, actor_id, created_at) VALUES (?,?,?,?,?)`,
		caseID, "04", "Minuta lista — cliente puede firmar", lawyerID, now); err != nil {
		return err
	}
	if _, err = db.Exec(
		`INSERT INTO payments (case_id, provider, amount_cents, status, reference, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "payphone_mock", 34900, "paid", "SEED-PAY-SIGN", now,
	); err != nil {
		return err
	}

	cedulaSize, err := copyDemoFixture(uploadDir, "cedula-demo.pdf", "seed_sign_cedula.pdf")
	if err != nil {
		return err
	}
	partidaSize, err := copyDemoFixture(uploadDir, "partida-demo.pdf", "seed_sign_partida.pdf")
	if err != nil {
		return err
	}
	if _, err = copyDemoFixture(uploadDir, "minuta-demo.pdf", "seed_sign_minuta.pdf"); err != nil {
		return err
	}
	if _, err = copyDemoFixture(uploadDir, "firma-demo.pdf", "seed_sign_firma.pdf"); err != nil {
		return err
	}

	if _, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, reviewed_by, reviewed_at, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		caseID, "cedula", "cedula_demo.pdf", "seed_sign_cedula.pdf", "application/pdf", cedulaSize, clientID, "approved", lawyerID, now, now,
	); err != nil {
		return err
	}
	if _, err = db.Exec(
		`INSERT INTO documents (case_id, doc_type, filename, stored_path, mime, size_bytes, uploaded_by, review_status, reviewed_by, reviewed_at, created_at)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		caseID, "partida", "partida_demo.pdf", "seed_sign_partida.pdf", "application/pdf", partidaSize, clientID, "approved", lawyerID, now, now,
	); err != nil {
		return err
	}
	_, err = db.Exec(
		`INSERT INTO case_outputs (case_id, output_type, filename, stored_path, generated_by, created_at) VALUES (?,?,?,?,?,?)`,
		caseID, "minuta", "minuta_demo.pdf", "seed_sign_minuta.pdf", lawyerID, now,
	)
	return err
}

func copyDemoFixture(uploadDir, name, destName string) (int, error) {
	src := filepath.Join(filepath.Dir(uploadDir), "demo-fixtures", name)
	b, err := os.ReadFile(src)
	if err != nil {
		return 0, err
	}
	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return 0, err
	}
	if err := os.WriteFile(filepath.Join(uploadDir, destName), b, 0o644); err != nil {
		return 0, err
	}
	return len(b), nil
}
