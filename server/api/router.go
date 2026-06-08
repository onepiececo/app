package api

import (
	"log/slog"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kgrahammatzen/onepiece-server/api/handlers"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/games"
	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
	"github.com/kgrahammatzen/onepiece-server/internal/middleware"
	"github.com/kgrahammatzen/onepiece-server/internal/player"
)

type RouterConfig struct {
	Pool   *pgxpool.Pool
	JWKS   *auth.JWKSStore
	Logger *slog.Logger
	WebURL string
}

func NewRouter(cfg RouterConfig) http.Handler {
	mux := http.NewServeMux()

	animeStore := anime.NewStore(cfg.Pool)
	playerStore := player.NewStore(cfg.Pool)
	gamesStore := games.NewStore(cfg.Pool)

	animeH := handlers.NewAnimeHandler(animeStore)
	playerH := handlers.NewPlayerHandler(playerStore, cfg.JWKS)
	catalogH := handlers.NewCatalogHandler(cfg.Pool)
	puzzleH := handlers.NewPuzzleHandler(gamesStore, animeStore, playerStore, cfg.JWKS)

	jwksAuth := auth.JWKSAuth(cfg.JWKS)
	authed := func(pattern string, fn http.HandlerFunc) {
		mux.Handle(pattern, wrap(fn, jwksAuth))
	}

	mux.HandleFunc("GET /healthz", handlers.Health)

	mux.HandleFunc("GET /v1/anime", animeH.Search)
	mux.HandleFunc("GET /v1/anime/browse", animeH.Browse)
	mux.HandleFunc("GET /v1/anime/count", animeH.Count)
	mux.HandleFunc("GET /v1/anime/by-id/{id}", animeH.GetByID)
	mux.HandleFunc("GET /v1/anime/{slug}", animeH.GetBySlug)

	mux.HandleFunc("GET /v1/games", catalogH.Games)
	mux.HandleFunc("GET /v1/days", catalogH.Days)

	mux.HandleFunc("GET /v1/puzzles", puzzleH.Today)
	mux.HandleFunc("GET /v1/puzzles/statuses", puzzleH.Statuses)
	mux.HandleFunc("POST /v1/puzzles/{id}/guess", puzzleH.Guess)

	mux.HandleFunc("GET /v1/players/me", playerH.Me)

	authed("GET /v1/me", handlers.Me)

	mux.HandleFunc("/", notFound)

	return middleware.RequestID(
		middleware.Logging(cfg.Logger)(
			middleware.Timeout(
				middleware.CORS(cfg.WebURL)(
					middleware.Gzip(mux),
				),
			),
		),
	)
}

func notFound(w http.ResponseWriter, r *http.Request) {
	httpx.WriteError(w, httpx.APIError{Status: http.StatusNotFound, Code: "not_found", Message: "route not found"})
}

// wrap applies the middleware chain in reverse so callers can list outermost to innermost.
func wrap(h http.HandlerFunc, mw ...func(http.Handler) http.Handler) http.Handler {
	var handler http.Handler = h
	for i := len(mw) - 1; i >= 0; i-- {
		handler = mw[i](handler)
	}
	return handler
}
