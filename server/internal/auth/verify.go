package auth

import (
	"errors"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// VerifyBearer parses and validates an `Authorization: Bearer <jwt>` header value.
// Returns the `sub` claim on success. Empty header returns ErrMissingToken without surfacing an error to logs.
func VerifyBearer(jwks *JWKSStore, header string) (string, error) {
	scheme, tokenString, ok := strings.Cut(strings.TrimSpace(header), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") || strings.TrimSpace(tokenString) == "" {
		return "", ErrMissingToken
	}
	tokenString = strings.TrimSpace(tokenString)

	token, err := jwt.Parse(tokenString, func(t *jwt.Token) (any, error) {
		return jwks.Keyfunc(t, t.Claims)
	})
	if err != nil || !token.Valid {
		return "", ErrInvalidToken
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrInvalidToken
	}
	sub, _ := claims["sub"].(string)
	if sub == "" {
		return "", ErrInvalidToken
	}
	return sub, nil
}

var (
	ErrMissingToken = errors.New("missing bearer token")
	ErrInvalidToken = errors.New("invalid bearer token")
)
