package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type PollHandler struct {
	repo *repository.PollRepo
}

func NewPollHandler(repo *repository.PollRepo) *PollHandler {
	return &PollHandler{repo: repo}
}

func (h *PollHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaceID := chi.URLParam(r, "spaceID")
	var req model.CreatePollRequest
	if err := ParseJSON(r, &req); err != nil || req.Question == "" {
		Error(w, http.StatusBadRequest, "question is required")
		return
	}
	poll, err := h.repo.Create(r.Context(), spaceID, userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, poll)
}

func (h *PollHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaceID := chi.URLParam(r, "spaceID")
	polls, err := h.repo.ListBySpace(r.Context(), spaceID, userID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if polls == nil {
		polls = []model.Poll{}
	}
	JSON(w, http.StatusOK, polls)
}

func (h *PollHandler) Vote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	pollID := chi.URLParam(r, "pollID")
	optionID := chi.URLParam(r, "optionID")
	if err := h.repo.Vote(r.Context(), optionID, userID); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	poll, err := h.repo.GetByID(r.Context(), pollID, userID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, poll)
}

func (h *PollHandler) Unvote(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	pollID := chi.URLParam(r, "pollID")
	optionID := chi.URLParam(r, "optionID")
	if err := h.repo.Unvote(r.Context(), optionID, userID); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	poll, err := h.repo.GetByID(r.Context(), pollID, userID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, poll)
}
