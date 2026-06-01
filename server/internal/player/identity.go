package player

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"errors"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{pool: pool}
}

// Identity is a player's stable handle in this app, whether anonymous or signed in.
type Identity struct {
	ID                uuid.UUID  `json:"id"`
	UserID            *string    `json:"userId,omitempty"`
	AnonymousPlayerID *uuid.UUID `json:"anonymousPlayerId,omitempty"`
}

// HashAnonymousKey reduces a client supplied opaque key to a 64 char hex digest.
// The server only ever stores the digest, callers keep the raw key client side.
func HashAnonymousKey(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}

// ResolveAnonymous upserts the anonymous_player and matching player_identity, returns the identity.
func (s *Store) ResolveAnonymous(ctx context.Context, keyHash string) (*Identity, error) {
	if keyHash == "" {
		return nil, errors.New("empty key hash")
	}
	var anonID uuid.UUID
	if err := s.pool.QueryRow(ctx, `
		INSERT INTO anonymous_player (anonymous_key_hash)
		VALUES ($1)
		ON CONFLICT (anonymous_key_hash) DO UPDATE SET anonymous_key_hash = EXCLUDED.anonymous_key_hash
		RETURNING id
	`, keyHash).Scan(&anonID); err != nil {
		return nil, err
	}

	id, err := s.findOrCreateIdentity(ctx, "anonymous_player_id", anonID)
	if err != nil {
		return nil, err
	}
	return &Identity{ID: id, AnonymousPlayerID: &anonID}, nil
}

// ResolveUser upserts the player_identity for a signed in Better Auth user id.
func (s *Store) ResolveUser(ctx context.Context, userID string) (*Identity, error) {
	if userID == "" {
		return nil, errors.New("empty user id")
	}
	id, err := s.findOrCreateIdentity(ctx, "user_id", userID)
	if err != nil {
		return nil, err
	}
	return &Identity{ID: id, UserID: &userID}, nil
}

func (s *Store) findOrCreateIdentity(ctx context.Context, column string, value any) (uuid.UUID, error) {
	var id uuid.UUID
	err := s.pool.QueryRow(ctx, `SELECT id FROM player_identity WHERE `+column+` = $1`, value).Scan(&id)
	if err == nil {
		return id, nil
	}
	if !errors.Is(err, pgx.ErrNoRows) {
		return uuid.Nil, err
	}

	err = s.pool.QueryRow(ctx, `
		INSERT INTO player_identity (`+column+`) VALUES ($1) RETURNING id
	`, value).Scan(&id)
	if err == nil {
		return id, nil
	}

	// Race lost, another connection inserted first. Re query.
	if err := s.pool.QueryRow(ctx, `SELECT id FROM player_identity WHERE `+column+` = $1`, value).Scan(&id); err != nil {
		return uuid.Nil, err
	}
	return id, nil
}
