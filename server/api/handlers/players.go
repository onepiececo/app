package handlers

import (
	"errors"
	"net/http"

	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
	"github.com/kgrahammatzen/onepiece-server/internal/auth"
	"github.com/kgrahammatzen/onepiece-server/internal/player"
)

type PlayerHandler struct {
	store *player.Store
	jwks  *auth.JWKSStore
}

func NewPlayerHandler(store *player.Store, jwks *auth.JWKSStore) *PlayerHandler {
	return &PlayerHandler{store: store, jwks: jwks}
}

// Me resolves the player identity for the request. Either a signed in Bearer token or
// an X-Anonymous-Key header is required. The anon key is hashed server side, never stored raw.
func (h *PlayerHandler) Me(w http.ResponseWriter, r *http.Request) {
	if bearer := r.Header.Get("Authorization"); bearer != "" {
		userID, err := auth.VerifyBearer(h.jwks, bearer)
		if err != nil && !errors.Is(err, auth.ErrMissingToken) {
			apiutil.WriteError(w, apiutil.APIError{Status: http.StatusUnauthorized, Code: "invalid_token", Message: "invalid bearer"})
			return
		}
		if userID != "" {
			id, err := h.store.ResolveUser(r.Context(), userID)
			if err != nil {
				apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "identity_failed", Message: err.Error()})
				return
			}
			apiutil.WriteJSON(w, http.StatusOK, id)
			return
		}
	}

	anonKey := r.Header.Get("X-Anonymous-Key")
	if anonKey == "" {
		apiutil.WriteError(w, apiutil.APIError{
			Status:  http.StatusUnauthorized,
			Code:    "missing_identity",
			Message: "send Authorization Bearer or X-Anonymous-Key",
		})
		return
	}
	id, err := h.store.ResolveAnonymous(r.Context(), player.HashAnonymousKey(anonKey))
	if err != nil {
		apiutil.WriteError(w, apiutil.APIError{Status: http.StatusInternalServerError, Code: "identity_failed", Message: err.Error()})
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, id)
}
