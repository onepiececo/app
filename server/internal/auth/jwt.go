package auth

import (
	"errors"
	"net/http"

	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
)

// JWKSAuth verifies a Bearer JWT issued by Better Auth and puts the token subject in the request context as the user id.
func JWKSAuth(jwks *JWKSStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			sub, err := VerifyBearer(jwks, r.Header.Get("Authorization"))
			if err != nil {
				code, msg := "invalid_token", "invalid or expired token"
				if errors.Is(err, ErrMissingToken) {
					code, msg = "missing_token", "Authorization Bearer token is required"
				}
				httpx.WriteError(w, httpx.APIError{Status: http.StatusUnauthorized, Code: code, Message: msg})
				return
			}
			next.ServeHTTP(w, r.WithContext(httpx.WithUserID(r.Context(), sub)))
		})
	}
}
