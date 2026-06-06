package middleware

import (
	"context"
	"net/http"
	"time"
)

// requestTimeout bounds handler and database work so a slow query cannot pin a pooled connection until the write timeout.
const requestTimeout = 10 * time.Second

func Timeout(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, cancel := context.WithTimeout(r.Context(), requestTimeout)
		defer cancel()
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
