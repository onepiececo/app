package middleware

import (
	"net/http"
	"strings"
)

// CORS allows the configured comma separated list of origins to call this server with credentials.
func CORS(origins string) func(http.Handler) http.Handler {
	allowedMethods := "GET, POST, PUT, DELETE, OPTIONS"
	allowedHeaders := "Content-Type, Authorization, X-Request-ID, X-Anonymous-Key"
	exposedHeaders := "X-Request-ID"

	allowed := make(map[string]struct{})
	for _, raw := range strings.Split(origins, ",") {
		o := strings.TrimRight(strings.TrimSpace(raw), "/")
		if o != "" {
			allowed[o] = struct{}{}
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("Vary", "Origin")
			o := r.Header.Get("Origin")
			if o != "" {
				if _, ok := allowed[strings.TrimRight(o, "/")]; ok {
					w.Header().Set("Access-Control-Allow-Origin", o)
					w.Header().Set("Access-Control-Allow-Credentials", "true")
					w.Header().Set("Access-Control-Allow-Methods", allowedMethods)
					w.Header().Set("Access-Control-Allow-Headers", allowedHeaders)
					w.Header().Set("Access-Control-Expose-Headers", exposedHeaders)
				}
			}

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
