package store

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
}

func Open(path string) (*DB, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, err
	}
	// WAL + busy_timeout: evita cuelgues cuando hay lecturas/escrituras concurrentes.
	dsn := path + "?_pragma=foreign_keys(1)&_pragma=journal_mode(WAL)&_pragma=busy_timeout(5000)"
	sqlDB, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, err
	}
	sqlDB.SetMaxOpenConns(4)
	db := &DB{sqlDB}
	if err := db.migrate(); err != nil {
		_ = sqlDB.Close()
		return nil, err
	}
	return db, nil
}

func (db *DB) migrate() error {
	schema := `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL CHECK(role IN ('cliente','abogado','notario')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES users(id),
  lawyer_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT '01',
  result TEXT NOT NULL DEFAULT 'apto',
  city TEXT DEFAULT '',
  paid INTEGER NOT NULL DEFAULT 0,
  amount_cents INTEGER NOT NULL DEFAULT 34900,
  product TEXT NOT NULL DEFAULT 'divorcio360',
  questionnaire_json TEXT NOT NULL DEFAULT '{}',
  notary_name TEXT DEFAULT '',
  appointment_at TEXT DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT DEFAULT '',
  actor_id INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  mime TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  review_status TEXT NOT NULL DEFAULT 'pending',
  review_note TEXT DEFAULT '',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'payphone_mock',
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL,
  reference TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS signatures (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  signer_id INTEGER NOT NULL REFERENCES users(id),
  image_path TEXT NOT NULL,
  ip TEXT NOT NULL,
  user_agent TEXT DEFAULT '',
  signed_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS case_outputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  generated_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);
`
	if _, err := db.Exec(schema); err != nil {
		return fmt.Errorf("migrate schema: %w", err)
	}
	return db.migrateColumns()
}

func (db *DB) migrateColumns() error {
	alters := []string{
		`ALTER TABLE cases ADD COLUMN product TEXT NOT NULL DEFAULT 'divorcio360'`,
		`ALTER TABLE cases ADD COLUMN questionnaire_json TEXT NOT NULL DEFAULT '{}'`,
		`ALTER TABLE cases ADD COLUMN notary_name TEXT DEFAULT ''`,
		`ALTER TABLE cases ADD COLUMN appointment_at TEXT DEFAULT ''`,
		`ALTER TABLE cases ADD COLUMN consultation_at TEXT DEFAULT ''`,
		`ALTER TABLE documents ADD COLUMN review_status TEXT NOT NULL DEFAULT 'pending'`,
		`ALTER TABLE documents ADD COLUMN review_note TEXT DEFAULT ''`,
		`ALTER TABLE documents ADD COLUMN reviewed_by INTEGER REFERENCES users(id)`,
		`ALTER TABLE documents ADD COLUMN reviewed_at TEXT DEFAULT ''`,
	}
	for _, q := range alters {
		if _, err := db.Exec(q); err != nil {
			if !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
				return fmt.Errorf("migrate column: %w", err)
			}
		}
	}
	_, err := db.Exec(`
CREATE TABLE IF NOT EXISTS case_outputs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  output_type TEXT NOT NULL,
  filename TEXT NOT NULL,
  stored_path TEXT NOT NULL,
  generated_by INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
)`)
	if err != nil {
		return err
	}
	extra := []string{
		`ALTER TABLE users ADD COLUMN lopdp_consent_at TEXT DEFAULT ''`,
		`ALTER TABLE users ADD COLUMN lopdp_version TEXT DEFAULT 'demo-v1'`,
		`ALTER TABLE case_notes ADD COLUMN visible_to_client INTEGER NOT NULL DEFAULT 0`,
	}
	for _, q := range extra {
		if _, err := db.Exec(q); err != nil && !strings.Contains(strings.ToLower(err.Error()), "duplicate column") {
			return fmt.Errorf("migrate column: %w", err)
		}
	}
	mockTables := `
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id INTEGER REFERENCES cases(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mock_satje_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  case_id INTEGER NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  cause_no TEXT NOT NULL,
  court TEXT DEFAULT '',
  confidence REAL DEFAULT 0,
  linked_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mock_tenant (
  id INTEGER PRIMARY KEY CHECK(id=1),
  org_name TEXT NOT NULL DEFAULT 'LegalStation Demo Organization',
  plan_id TEXT NOT NULL DEFAULT 'b2b-pro',
  cases_used INTEGER NOT NULL DEFAULT 18,
  cases_limit INTEGER NOT NULL DEFAULT 50,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mock_master_template_edits (
  template_id TEXT PRIMARY KEY,
  version TEXT NOT NULL,
  note TEXT DEFAULT '',
  updated_at TEXT NOT NULL
);
`
	if _, err := db.Exec(mockTables); err != nil {
		return err
	}
	_, _ = db.Exec(`INSERT OR IGNORE INTO mock_tenant (id, org_name, plan_id, cases_used, cases_limit, updated_at) VALUES (1, 'LegalStation Demo Organization', 'b2b-pro', 18, 50, ?)`, Now())
	return db.migrateNotarioRole()
}

func (db *DB) migrateNotarioRole() error {
	var n int
	_ = db.QueryRow(`SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='users'`).Scan(&n)
	if n == 0 {
		return nil
	}
	// Recreate users table if notario role not supported (legacy CHECK).
	_, err := db.Exec(`INSERT INTO users (email, password_hash, full_name, phone, role, created_at) VALUES ('__role_test__','x','x','','notario','2000-01-01T00:00:00Z')`)
	if err == nil {
		_, _ = db.Exec(`DELETE FROM users WHERE email='__role_test__'`)
		return nil
	}
	_, _ = db.Exec(`PRAGMA foreign_keys=off`)
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT NOT NULL CHECK(role IN ('cliente','abogado','notario')),
  created_at TEXT NOT NULL,
  lopdp_consent_at TEXT DEFAULT '',
  lopdp_version TEXT DEFAULT 'demo-v1'
)`,
		`INSERT INTO users_new (id, email, password_hash, full_name, phone, role, created_at, lopdp_consent_at, lopdp_version)
 SELECT id, email, password_hash, full_name, phone, role, created_at,
        COALESCE(lopdp_consent_at,''), COALESCE(lopdp_version,'demo-v1') FROM users`,
		`DROP TABLE users`,
		`ALTER TABLE users_new RENAME TO users`,
	}
	for _, q := range stmts {
		if _, err := tx.Exec(q); err != nil {
			_ = tx.Rollback()
			_, _ = db.Exec(`PRAGMA foreign_keys=on`)
			return fmt.Errorf("migrate notario role: %w", err)
		}
	}
	if err := tx.Commit(); err != nil {
		return err
	}
	_, _ = db.Exec(`PRAGMA foreign_keys=on`)
	return nil
}

func Now() string {
	return time.Now().UTC().Format(time.RFC3339)
}

func NowUnix() int64 {
	return time.Now().Unix()
}
