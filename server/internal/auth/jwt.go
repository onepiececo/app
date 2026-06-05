package auth

import (
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
)

// JWKSAuth verifies a Bearer JWT issued by Better Auth using JWKS.
// On success the token's `sub` claim is placed in the request context as the user id.
func JWKSAuth(jwks *JWKSStore) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			scheme, tokenString, ok := strings.Cut(strings.TrimSpace(r.Header.Get("Authorization")), " ")
			if !ok || !strings.EqualFold(scheme, "Bearer") || strings.TrimSpace(tokenString) == "" {
				httpx.WriteError(w, httpx.APIError{
					Status:  http.StatusUnauthorized,
					Code:    "missing_token",
					Message: "Authorization Bearer token is required",
				})
				return
			}

			tokenString = strings.TrimSpace(tokenString)

			token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
				return jwks.Keyfunc(t, t.Claims)
			})
			if err != nil || !token.Valid {
				httpx.WriteError(w, httpx.APIError{
					Status:  http.StatusUnauthorized,
					Code:    "invalid_token",
					Message: "invalid or expired token",
				})
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				httpx.WriteError(w, httpx.APIError{
					Status:  http.StatusUnauthorized,
					Code:    "invalid_token",
					Message: "invalid token claims",
				})
				return
			}

			ctx := r.Context()
			if sub, _ := claims["sub"].(string); sub != "" {
				ctx = httpx.WithUserID(ctx, sub)
			}

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
