package products

import "database/sql"

// RequiredDocsApproved reports whether both required doc types exist and are approved.
func RequiredDocsApproved(db *sql.DB, caseID int64, product string) bool {
	req := DocRequirement(product)
	return latestReview(db, caseID, req.Type1) == "approved" &&
		latestReview(db, caseID, req.Type2) == "approved"
}

func latestReview(db *sql.DB, caseID int64, docType string) string {
	var status sql.NullString
	err := db.QueryRow(
		`SELECT review_status FROM documents WHERE case_id=? AND doc_type=? ORDER BY id DESC LIMIT 1`,
		caseID, docType,
	).Scan(&status)
	if err != nil {
		return ""
	}
	return status.String
}
