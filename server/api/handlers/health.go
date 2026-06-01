package handlers

import (
	"net/http"

	"github.com/kgrahammatzen/onepiece-server/internal/apiutil"
)

func Health(w http.ResponseWriter, r *http.Request) {
	apiutil.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
