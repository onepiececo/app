package auth

import (
	"errors"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Claims is the registered-claims subset we validate and read the subject from.
type Claims struct {
	jwt.RegisteredClaims
}

// VerifyBearer validates an Authorization Bearer JWT and returns its subject, with a missing header yielding ErrMissingToken so it stays out of logs.
func VerifyBearer(jwks *JWKSStore, header string) (string, error) {
	scheme, tokenString, ok := strings.Cut(strings.TrimSpace(header), " ")
	if !ok || !strings.EqualFold(scheme, "Bearer") || strings.TrimSpace(tokenString) == "" {
		return "", ErrMissingToken
	}
	tokenString = strings.TrimSpace(tokenString)

	var claims Claims
	token, err := jwt.ParseWithClaims(tokenString, &claims, jwks.Keyfunc,
		jwt.WithValidMethods([]string{jwt.SigningMethodEdDSA.Alg()}))
	if err != nil || !token.Valid {
		return "", ErrInvalidToken
	}
	if claims.Subject == "" {
		return "", ErrInvalidToken
	}
	return claims.Subject, nil
}

var (
	ErrMissingToken = errors.New("missing bearer token")
	ErrInvalidToken = errors.New("invalid bearer token")
)
