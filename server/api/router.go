package api

import (
	"log/slog"
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/kgrahammatzen/onepiece-server/api/handlers"
	"github.com/kgrahammatzen/onepiece-server/internal/anime"
	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/middleware"
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
	animeH := handlers.NewAnimeHandler(animeStore)

	jwksAuth := auth.JWKSAuth(cfg.JWKS)
	authed := func(pattern string, fn http.HandlerFunc) {
		mux.Handle(pattern, wrap(fn, jwksAuth))
	}

	mux.HandleFunc("GET /healthz", handlers.Health)
	mux.HandleFunc("GET /v1/anime/search", animeH.Search)
	mux.HandleFunc("GET /v1/anime/{slug}", animeH.GetBySlug)
	authed("GET /v1/me", handlers.Me)

	mux.HandleFunc("/", notFound)

	return middleware.RequestID(
		middleware.Logging(cfg.Logger)(
			middleware.CORS(cfg.WebURL)(mux),
		),
	)
}

func notFound(w http.ResponseWriter, r *http.Request) {
	apiutil.WriteError(w, apiutil.APIError{Status: http.StatusNotFound, Code: "not_found", Message: "route not found"})
}

// wrap applies the middleware chain in reverse so callers can list outermost to innermost.
func wrap(h http.HandlerFunc, mw ...func(http.Handler) http.Handler) http.Handler {
	var handler http.Handler = h
	for i := len(mw) - 1; i >= 0; i-- {
		handler = mw[i](handler)
	}
	return handler
}
