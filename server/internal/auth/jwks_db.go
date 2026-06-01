package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log/slog"
	"sync"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// JWKSStore reads JWKS public keys directly from the shared postgres jwks table
// (written by Better Auth's jwt plugin) and provides a jwt.Keyfunc for token verification.
type JWKSStore struct {
	pool   *pgxpool.Pool
	logger *slog.Logger

	mu sync.RWMutex
	kf keyfunc.Keyfunc
}

func NewJWKSStore(pool *pgxpool.Pool, logger *slog.Logger) *JWKSStore {
	return &JWKSStore{pool: pool, logger: logger}
}

// Load reads public keys from the DB and builds a keyfunc.
// Must be called before Keyfunc().
func (s *JWKSStore) Load(ctx context.Context) error {
	kf, err := s.buildKeyfunc(ctx)
	if err != nil {
		return err
	}
	s.mu.Lock()
	s.kf = kf
	s.mu.Unlock()
	return nil
}

// Keyfunc returns a jwt.Keyfunc that verifies tokens using the cached public keys.
func (s *JWKSStore) Keyfunc(token *jwt.Token, claims jwt.Claims) (any, error) {
	s.mu.RLock()
	kf := s.kf
	s.mu.RUnlock()
	if kf == nil {
		return nil, fmt.Errorf("jwks keyfunc is not loaded")
	}
	return kf.Keyfunc(token)
}

// StartRefresh re-reads keys from the DB on a timer. Cancel ctx to stop.
func (s *JWKSStore) StartRefresh(ctx context.Context, interval time.Duration) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			if err := s.Load(ctx); err != nil {
				s.logger.Warn("jwks refresh failed", "error", err)
			}
		}
	}
}

func (s *JWKSStore) buildKeyfunc(ctx context.Context) (keyfunc.Keyfunc, error) {
	rows, err := s.pool.Query(ctx,
		`SELECT id, public_key FROM jwks WHERE expires_at IS NULL OR expires_at > now() - interval '30 days' ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var keys []json.RawMessage
	for rows.Next() {
		var id, pubKey string
		if err := rows.Scan(&id, &pubKey); err != nil {
			return nil, err
		}

		var jwk map[string]any
		if err := json.Unmarshal([]byte(pubKey), &jwk); err != nil {
			s.logger.Warn("skipping malformed jwk", "id", id, "error", err)
			continue
		}
		jwk["kid"] = id
		jwk["alg"] = "EdDSA"
		jwk["use"] = "sig"

		raw, _ := json.Marshal(jwk)
		keys = append(keys, raw)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	jwks := struct {
		Keys []json.RawMessage `json:"keys"`
	}{Keys: keys}
	if jwks.Keys == nil {
		jwks.Keys = []json.RawMessage{}
	}

	raw, err := json.Marshal(jwks)
	if err != nil {
		return nil, err
	}

	return keyfunc.NewJWKSetJSON(raw)
}
