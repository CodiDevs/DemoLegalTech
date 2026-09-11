package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/codidevs/divorcio360/internal/adminmock"
	"github.com/codidevs/divorcio360/internal/auth"
	"github.com/codidevs/divorcio360/internal/cases"
	"github.com/codidevs/divorcio360/internal/docs"
	"github.com/codidevs/divorcio360/internal/lawyer"
	"github.com/codidevs/divorcio360/internal/notary"
	"github.com/codidevs/divorcio360/internal/notifications"
	"github.com/codidevs/divorcio360/internal/payments"
	"github.com/codidevs/divorcio360/internal/questionnaire"
	"github.com/codidevs/divorcio360/internal/seed"
	"github.com/codidevs/divorcio360/internal/signatures"
	"github.com/codidevs/divorcio360/internal/store"
	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

func main() {
	root, _ := os.Getwd()
	dataDir := filepath.Join(root, "data")
	uploadDir := filepath.Join(root, "uploads")
	_ = os.MkdirAll(dataDir, 0o755)
	_ = os.MkdirAll(uploadDir, 0o755)

	db, err := store.Open(filepath.Join(dataDir, "divorcio360.db"))
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()
	if err := seed.Run(db, uploadDir); err != nil {
		log.Fatal("seed:", err)
	}

	secret := []byte(env("JWT_SECRET", "divorcio360-demo-secret-change-me"))
	authSvc := &auth.Service{DB: db, JWTSecret: secret}
	caseSvc := &cases.Service{DB: db}
	docSvc := &docs.Service{DB: db, Cases: caseSvc, UploadDir: uploadDir}
	paySvc := &payments.Service{DB: db, Cases: caseSvc}
	sigSvc := &signatures.Service{DB: db, Cases: caseSvc, UploadDir: uploadDir}
	lawyerSvc := &lawyer.Service{DB: db, Cases: caseSvc, UploadDir: uploadDir}
	notarySvc := &notary.Service{DB: db, Cases: caseSvc}
	mockSvc := &adminmock.Service{DB: db}

	r := chi.NewRouter()
	r.Use(chimw.Logger)
	r.Use(chimw.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200", "http://127.0.0.1:4200"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	r.Get("/api/v1/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		_, _ = w.Write([]byte(`{"ok":true,"service":"legalstation"}`))
	})
	r.Get("/api/v1/files/{name}", docSvc.ServeFile)

	r.Post("/api/v1/questionnaire", questionnaire.Handle)
	r.Post("/api/v1/auth/register", authSvc.Register)
	r.Post("/api/v1/auth/login", authSvc.Login)

	r.Route("/api/v1", func(api chi.Router) {
		api.Group(func(pr chi.Router) {
			pr.Use(authSvc.Middleware)
			pr.Get("/me", authSvc.Me)
			pr.Get("/notifications", func(w http.ResponseWriter, r *http.Request) { notifications.List(w, r, db) })
			pr.Post("/notifications/read-all", func(w http.ResponseWriter, r *http.Request) { notifications.MarkAllRead(w, r, db) })
			pr.Post("/notifications/{id}/read", func(w http.ResponseWriter, r *http.Request) { notifications.MarkRead(w, r, db) })
			pr.Get("/cases", caseSvc.ListMine)
			pr.Post("/cases", caseSvc.Create)
			pr.Get("/cases/{id}", caseSvc.Get)
			pr.Post("/cases/{id}/notes", caseSvc.AddNote)
			pr.Post("/cases/{id}/documents", docSvc.Upload)
			pr.Get("/cases/{id}/documents", docSvc.List)
			pr.Delete("/cases/{id}/documents/{docId}", docSvc.Delete)
			pr.Get("/cases/{id}/outputs", lawyerSvc.ListOutputs)
			pr.Post("/cases/{id}/payments/mock", paySvc.MockCheckout)
			pr.Post("/cases/{id}/signatures", sigSvc.Sign)
			pr.Get("/cases/{id}/signatures", sigSvc.List)
			pr.Post("/cases/{id}/appointment", notarySvc.ScheduleAppointment)
			pr.Post("/cases/{id}/consultation/schedule", caseSvc.ScheduleConsultation)
			pr.Post("/cases/{id}/consultation", caseSvc.CompleteConsultation)
			pr.Post("/meeting-requests", caseSvc.RequestMeeting)

			pr.With(authSvc.RequireRole("abogado")).Get("/cases/{id}/workspace", lawyerSvc.Workspace)
			pr.With(authSvc.RequireRole("abogado")).Post("/cases/{id}/documents/{docId}/review", lawyerSvc.ReviewDocument)
			pr.With(authSvc.RequireRole("abogado")).Post("/cases/{id}/minuta/upload", lawyerSvc.UploadMinutaNotarial)
			pr.With(authSvc.RequireRole("abogado")).Post("/cases/{id}/actions", lawyerSvc.PerformAction)

			pr.With(authSvc.RequireRole("notario")).Get("/notary/queue", notarySvc.ListQueue)
			pr.With(authSvc.RequireRole("notario")).Post("/notary/cases/{id}/actions", notarySvc.PerformAction)

			pr.With(authSvc.RequireRole("abogado")).Get("/mock/admin/metrics", mockSvc.Metrics)
			pr.With(authSvc.RequireRole("abogado")).Patch("/mock/templates/master/{id}", mockSvc.PatchMasterTemplate)
			pr.With(authSvc.RequireRole("abogado")).Get("/mock/templates", mockSvc.Templates)
			pr.With(authSvc.RequireRole("abogado")).Post("/mock/templates/{id}/duplicate", mockSvc.DuplicateTemplate)
			pr.With(authSvc.RequireRole("abogado")).Patch("/mock/templates/{id}", mockSvc.PatchTemplate)
			pr.With(authSvc.RequireRole("abogado")).Delete("/mock/templates/{id}", mockSvc.DeleteTemplate)
			pr.With(authSvc.RequireRole("abogado")).Post("/mock/ai/analyze", mockSvc.AIAnalyze)
			pr.With(authSvc.RequireRole("abogado")).Post("/mock/satje/sync", mockSvc.SatjeSync)
			pr.With(authSvc.RequireRole("abogado")).Post("/mock/satje/link", mockSvc.SatjeLink)
			pr.With(authSvc.RequireRole("abogado")).Get("/mock/satje/links", mockSvc.SatjeLinks)
			pr.With(authSvc.RequireRole("abogado")).Get("/mock/billing/recurring", mockSvc.BillingRecurring)
			pr.With(authSvc.RequireRole("abogado")).Patch("/mock/billing/plan", mockSvc.PatchBillingPlan)
		})
	})

	addr := env("ADDR", ":8080")
	log.Println("LegalStation API listening on", addr)
	log.Fatal(http.ListenAndServe(addr, r))
}

func env(k, def string) string {
	if v := os.Getenv(k); v != "" {
		return v
	}
	return def
}
