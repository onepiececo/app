package handlers

import (
	"net/http"

	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
)

func Me(w http.ResponseWriter, r *http.Request) {
	userID := apiutil.UserIDFromContext(r.Context())
	if userID == "" {
		apiutil.WriteError(w, apiutil.APIError{
			Status:  http.StatusUnauthorized,
			Code:    "missing_user",
			Message: "no user in context",
		})
		return
	}
	apiutil.WriteJSON(w, http.StatusOK, map[string]string{"userId": userID})
}
