package handlers

import (
	"net/http"

	"github.com/kgrahammatzen/onepiece-server/internal/httpx"
)

func Me(w http.ResponseWriter, r *http.Request) {
	userID := httpx.UserIDFromContext(r.Context())
	if userID == "" {
		httpx.WriteError(w, httpx.APIError{
			Status:  http.StatusUnauthorized,
			Code:    "missing_user",
			Message: "no user in context",
		})
		return
	}
	httpx.WriteJSON(w, http.StatusOK, map[string]string{"userId": userID})
}
