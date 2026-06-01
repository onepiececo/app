package games

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Scoring helpers shared by every game engine.
// Base, popularity tier, and speed bonus all feed into one StandardScore call so a new game inherits the curve for free.

// lookupAnswerPopularity reads the answer anime's popularity for a puzzle.
// Returns 0 on missing or malformed answer_key (which collapses to the niche tier, the safe default).
func lookupAnswerPopularity(ctx context.Context, pool *pgxpool.Pool, puzzleID int64) (int, error) {
	var pop int
	err := pool.QueryRow(ctx, `
		SELECT a.popularity
		FROM puzzle p
		JOIN anime a ON a.id = (p.answer_key->>'animeId')::bigint
		WHERE p.id = $1
	`, puzzleID).Scan(&pop)
	if err == pgx.ErrNoRows {
		return 0, nil
	}
	return pop, err
}

type PopularityTier string

const (
	TierViral   PopularityTier = "viral"
	TierPopular PopularityTier = "popular"
	TierKnown   PopularityTier = "known"
	TierNiche   PopularityTier = "niche"
)

// TierForPopularity buckets an AniList popularity count into a difficulty tier.
// Cutoffs are calibrated against our top-250 catalog so the median anime lands in popular or known.
func TierForPopularity(pop int) PopularityTier {
	switch {
	case pop >= 500_000:
		return TierViral
	case pop >= 100_000:
		return TierPopular
	case pop >= 30_000:
		return TierKnown
	default:
		return TierNiche
	}
}

func multiplierForTier(t PopularityTier) float64 {
	switch t {
	case TierViral:
		return 0.8
	case TierPopular:
		return 1.0
	case TierKnown:
		return 1.25
	default:
		return 1.5
	}
}

func speedBonusForMS(ms int64) int {
	switch {
	case ms <= 0:
		return 0
	case ms < 15_000:
		return 20
	case ms < 30_000:
		return 10
	case ms < 60_000:
		return 5
	default:
		return 0
	}
}

type ScoreInput struct {
	// GuessesUsed is the count up to and including the winning guess.
	GuessesUsed int
	// DurationMS is end minus start in milliseconds.
	DurationMS int64
	// AnswerPopularity is the answer anime's AniList popularity, used for the difficulty multiplier.
	AnswerPopularity int
	// Won is false for lost or abandoned attempts.
	Won bool
}

type ScoreBreakdown struct {
	Base       int     `json:"base"`
	Multiplier float64 `json:"multiplier"`
	SpeedBonus int     `json:"speedBonus"`
	Tier       string  `json:"tier"`
	Total      int     `json:"total"`
}

const scoreFloor = 10

// StandardScore combines base, popularity multiplier, and speed bonus into the final integer score.
// Lost attempts always return zero. Won attempts always return at least the score floor.
func StandardScore(in ScoreInput) (int, ScoreBreakdown) {
	tier := TierForPopularity(in.AnswerPopularity)
	if !in.Won {
		return 0, ScoreBreakdown{Tier: string(tier)}
	}

	base := max(100-(in.GuessesUsed-1)*15, scoreFloor)
	mult := multiplierForTier(tier)
	bonus := speedBonusForMS(in.DurationMS)
	total := max(int(float64(base)*mult)+bonus, scoreFloor)

	return total, ScoreBreakdown{
		Base:       base,
		Multiplier: mult,
		SpeedBonus: bonus,
		Tier:       string(tier),
		Total:      total,
	}
}
