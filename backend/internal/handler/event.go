package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type EventHandler struct {
	repo *repository.EventRepo
}

func NewEventHandler(repo *repository.EventRepo) *EventHandler {
	return &EventHandler{repo: repo}
}

func (h *EventHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaceID := chi.URLParam(r, "spaceID")
	var req model.CreateEventRequest
	if err := ParseJSON(r, &req); err != nil || req.Title == "" {
		Error(w, http.StatusBadRequest, "title is required")
		return
	}
	event, err := h.repo.Create(r.Context(), spaceID, userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, event)
}

func (h *EventHandler) List(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "spaceID")
	events, err := h.repo.ListBySpace(r.Context(), spaceID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if events == nil {
		events = []model.Event{}
	}
	JSON(w, http.StatusOK, events)
}

func (h *EventHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "eventID")
	if err := h.repo.Delete(r.Context(), id); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]bool{"ok": true})
}
