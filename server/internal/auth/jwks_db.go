package auth

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"sync/atomic"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrJWKSNotLoaded is returned by Keyfunc before the first successful key load.
var ErrJWKSNotLoaded = errors.New("jwks keyfunc not loaded")

// ErrNoJWKSKeys means the jwks table is empty, the expected cold-start state until Better Auth mints its first key.
var ErrNoJWKSKeys = errors.New("no jwks keys found")

// JWKSStore reads JWKS public keys from the shared postgres jwks table written by Better Auth and verifies tokens against them.
type JWKSStore struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
	kf     atomic.Pointer[keyfunc.Keyfunc]
}

func NewJWKSStore(pool *pgxpool.Pool, logger *slog.Logger) *JWKSStore {
	return &JWKSStore{pool: pool, logger: logger}
}

// jwk is the Ed25519 public key shape Better Auth stores plus the JOSE fields we stamp on for verification.
type jwk struct {
	Kty string `json:"kty"`
	Crv string `json:"crv"`
	X   string `json:"x"`
	Kid string `json:"kid"`
	Alg string `json:"alg"`
	Use string `json:"use"`
}

// Load rebuilds the keyfunc from the DB and swaps it in only on success so a failed refresh keeps the previous keys.
func (s *JWKSStore) Load(ctx context.Context) error {
	kf, err := s.buildKeyfunc(ctx)
	if err != nil {
		return err
	}
	s.kf.Store(&kf)
	return nil
}

// Keyfunc resolves the signing key for a token against the cached public keys.
func (s *JWKSStore) Keyfunc(token *jwt.Token) (any, error) {
	kf := s.kf.Load()
	if kf == nil {
		return nil, ErrJWKSNotLoaded
	}
	return (*kf).Keyfunc(token)
}

// StartRefresh re-reads keys from the DB on a timer until ctx is cancelled, each refresh bounded by its own timeout so a stalled DB cannot hang the loop.
func (s *JWKSStore) StartRefresh(ctx context.Context, interval time.Duration) {
	t := time.NewTicker(interval)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			refreshCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
			err := s.Load(refreshCtx)
			cancel()
			if errors.Is(err, ErrNoJWKSKeys) {
				s.logger.Debug("jwks refresh, no keys yet")
			} else if err != nil {
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

		var k jwk
		if err := json.Unmarshal([]byte(pubKey), &k); err != nil {
			s.logger.Warn("skipping malformed jwk", "id", id, "error", err)
			continue
		}
		k.Kid = id
		k.Alg = "EdDSA"
		k.Use = "sig"

		raw, _ := json.Marshal(k)
		keys = append(keys, raw)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if len(keys) == 0 {
		return nil, ErrNoJWKSKeys
	}

	raw, err := json.Marshal(struct {
		Keys []json.RawMessage `json:"keys"`
	}{Keys: keys})
	if err != nil {
		return nil, err
	}

	return keyfunc.NewJWKSetJSON(raw)
}
