package handler

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type MessageHandler struct {
	repo *repository.MessageRepo
}

func NewMessageHandler(repo *repository.MessageRepo) *MessageHandler {
	return &MessageHandler{repo: repo}
}

func (h *MessageHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaceID := chi.URLParam(r, "spaceID")
	var req model.CreateMessageRequest
	if err := ParseJSON(r, &req); err != nil || req.Content == "" {
		Error(w, http.StatusBadRequest, "content is required")
		return
	}
	msg, err := h.repo.Create(r.Context(), spaceID, userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, msg)
}

func (h *MessageHandler) List(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "spaceID")
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	offset, _ := strconv.Atoi(r.URL.Query().Get("offset"))
	if limit == 0 {
		limit = 50
	}
	messages, err := h.repo.ListBySpace(r.Context(), spaceID, limit, offset)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if messages == nil {
		messages = []model.Message{}
	}
	JSON(w, http.StatusOK, messages)
}
