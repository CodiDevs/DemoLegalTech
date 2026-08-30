package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/codidevs/divorcio360/internal/store"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type ctxKey string

const UserCtxKey ctxKey = "user"

type Claims struct {
	UserID   int64  `json:"uid"`
	Email    string `json:"email"`
	Role     string `json:"role"`
	FullName string `json:"name"`
	jwt.RegisteredClaims
}

type User struct {
	ID       int64  `json:"id"`
	Email    string `json:"email"`
	FullName string `json:"full_name"`
	Phone    string `json:"phone"`
	Role     string `json:"role"`
}

type Service struct {
	DB        *store.DB
	JWTSecret []byte
}

func (s *Service) Register(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email          string `json:"email"`
		Password       string `json:"password"`
		FullName       string `json:"full_name"`
		Phone          string `json:"phone"`
		LopdpAccepted  bool   `json:"lopdp_accepted"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	body.Email = strings.TrimSpace(strings.ToLower(body.Email))
	if body.Email == "" || len(body.Password) < 6 || body.FullName == "" {
		writeErr(w, http.StatusBadRequest, "email, password (>=6) y full_name requeridos")
		return
	}
	if !body.LopdpAccepted {
		writeErr(w, http.StatusBadRequest, "debe aceptar la política LOPDP demo de LegalStation")
		return
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "error hash")
		return
	}
	now := store.Now()
	res, err := s.DB.Exec(
		`INSERT INTO users (email, password_hash, full_name, phone, role, created_at, lopdp_consent_at, lopdp_version) VALUES (?,?,?,?,?,?,?,?)`,
		body.Email, string(hash), body.FullName, body.Phone, "cliente", now, now, "demo-v1",
	)
	if err != nil {
		writeErr(w, http.StatusConflict, "email ya registrado")
		return
	}
	id, _ := res.LastInsertId()
	token, err := s.token(id, body.Email, "cliente", body.FullName)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "token error")
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{
		"token": token,
		"user":  User{ID: id, Email: body.Email, FullName: body.FullName, Phone: body.Phone, Role: "cliente"},
	})
}

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		writeErr(w, http.StatusBadRequest, "JSON inválido")
		return
	}
	body.Email = strings.TrimSpace(strings.ToLower(body.Email))
	var u User
	var hash string
	err := s.DB.QueryRow(
		`SELECT id, email, password_hash, full_name, phone, role FROM users WHERE email = ?`, body.Email,
	).Scan(&u.ID, &u.Email, &hash, &u.FullName, &u.Phone, &u.Role)
	if errors.Is(err, sql.ErrNoRows) {
		writeErr(w, http.StatusUnauthorized, "credenciales inválidas")
		return
	}
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "db error")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(body.Password)) != nil {
		writeErr(w, http.StatusUnauthorized, "credenciales inválidas")
		return
	}
	token, err := s.token(u.ID, u.Email, u.Role, u.FullName)
	if err != nil {
		writeErr(w, http.StatusInternalServerError, "token error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"token": token, "user": u})
}

func (s *Service) Me(w http.ResponseWriter, r *http.Request) {
	u := UserFrom(r.Context())
	if u == nil {
		writeErr(w, http.StatusUnauthorized, "no auth")
		return
	}
	writeJSON(w, http.StatusOK, u)
}

func (s *Service) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		h := r.Header.Get("Authorization")
		if !strings.HasPrefix(h, "Bearer ") {
			writeErr(w, http.StatusUnauthorized, "token requerido")
			return
		}
		raw := strings.TrimPrefix(h, "Bearer ")
		claims := &Claims{}
		tok, err := jwt.ParseWithClaims(raw, claims, func(t *jwt.Token) (any, error) {
			return s.JWTSecret, nil
		})
		if err != nil || !tok.Valid {
			writeErr(w, http.StatusUnauthorized, "token inválido")
			return
		}
		u := &User{ID: claims.UserID, Email: claims.Email, Role: claims.Role, FullName: claims.FullName}
		ctx := context.WithValue(r.Context(), UserCtxKey, u)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Service) RequireRole(roles ...string) func(http.Handler) http.Handler {
	set := map[string]struct{}{}
	for _, r := range roles {
		set[r] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			u := UserFrom(r.Context())
			if u == nil {
				writeErr(w, http.StatusUnauthorized, "no auth")
				return
			}
			if _, ok := set[u.Role]; !ok {
				writeErr(w, http.StatusForbidden, "rol no permitido")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (s *Service) token(id int64, email, role, name string) (string, error) {
	claims := Claims{
		UserID:   id,
		Email:    email,
		Role:     role,
		FullName: name,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(72 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(s.JWTSecret)
}

func UserFrom(ctx context.Context) *User {
	u, _ := ctx.Value(UserCtxKey).(*User)
	return u
}

func writeJSON(w http.ResponseWriter, code int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(v)
}

func writeErr(w http.ResponseWriter, code int, msg string) {
	writeJSON(w, code, map[string]string{"error": msg})
}
