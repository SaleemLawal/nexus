package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type BoardHandler struct {
	repo *repository.BoardRepo
}

func NewBoardHandler(repo *repository.BoardRepo) *BoardHandler {
	return &BoardHandler{repo: repo}
}

func (h *BoardHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaceID := chi.URLParam(r, "spaceID")
	var req model.CreateBoardRequest
	if err := ParseJSON(r, &req); err != nil || req.Title == "" {
		Error(w, http.StatusBadRequest, "title is required")
		return
	}
	board, err := h.repo.Create(r.Context(), spaceID, userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, board)
}

func (h *BoardHandler) List(w http.ResponseWriter, r *http.Request) {
	spaceID := chi.URLParam(r, "spaceID")
	boards, err := h.repo.ListBySpace(r.Context(), spaceID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if boards == nil {
		boards = []model.Board{}
	}
	JSON(w, http.StatusOK, boards)
}

func (h *BoardHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "boardID")
	board, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		Error(w, http.StatusNotFound, "board not found")
		return
	}
	JSON(w, http.StatusOK, board)
}

func (h *BoardHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "boardID")
	if err := h.repo.Delete(r.Context(), id); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, map[string]bool{"ok": true})
}
