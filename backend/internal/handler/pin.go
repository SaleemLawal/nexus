package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type PinHandler struct {
	repo *repository.PinRepo
}

func NewPinHandler(repo *repository.PinRepo) *PinHandler {
	return &PinHandler{repo: repo}
}

func (h *PinHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	boardID := chi.URLParam(r, "boardID")
	var req model.CreatePinRequest
	if err := ParseJSON(r, &req); err != nil || req.Type == "" {
		Error(w, http.StatusBadRequest, "type is required")
		return
	}
	pin, err := h.repo.Create(r.Context(), boardID, userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, pin)
}

func (h *PinHandler) List(w http.ResponseWriter, r *http.Request) {
	boardID := chi.URLParam(r, "boardID")
	pins, err := h.repo.ListByBoard(r.Context(), boardID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if pins == nil {
		pins = []model.Pin{}
	}
	JSON(w, http.StatusOK, pins)
}

func (h *PinHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "pinID")
	if err := h.repo.Delete(r.Context(), id); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *PinHandler) UpdatePositions(w http.ResponseWriter, r *http.Request) {
	var req model.UpdatePinPositionsRequest
	if err := ParseJSON(r, &req); err != nil {
		Error(w, http.StatusBadRequest, "invalid request")
		return
	}
	positions := make([]struct {
		ID       string
		Position int
	}, len(req.Positions))
	for i, p := range req.Positions {
		positions[i].ID = p.ID
		positions[i].Position = p.Position
	}
	if err := h.repo.UpdatePositions(r.Context(), positions); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]bool{"ok": true})
}
