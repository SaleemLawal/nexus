package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/model"
	"nexus/backend/internal/repository"
)

type SpaceHandler struct {
	repo *repository.SpaceRepo
}

func NewSpaceHandler(repo *repository.SpaceRepo) *SpaceHandler {
	return &SpaceHandler{repo: repo}
}

func (h *SpaceHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	var req model.CreateSpaceRequest
	if err := ParseJSON(r, &req); err != nil || req.Name == "" {
		Error(w, http.StatusBadRequest, "name is required")
		return
	}
	space, err := h.repo.Create(r.Context(), userID, req)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusCreated, space)
}

func (h *SpaceHandler) List(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	spaces, err := h.repo.ListForUser(r.Context(), userID)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if spaces == nil {
		spaces = []model.Space{}
	}
	JSON(w, http.StatusOK, spaces)
}

func (h *SpaceHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "spaceID")
	space, err := h.repo.GetByID(r.Context(), id)
	if err != nil {
		Error(w, http.StatusNotFound, "space not found")
		return
	}
	JSON(w, http.StatusOK, space)
}

func (h *SpaceHandler) GetByInvite(w http.ResponseWriter, r *http.Request) {
	code := chi.URLParam(r, "code")
	space, err := h.repo.GetByInviteCode(r.Context(), code)
	if err != nil {
		Error(w, http.StatusNotFound, "space not found")
		return
	}
	JSON(w, http.StatusOK, space)
}

func (h *SpaceHandler) Join(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r)
	code := chi.URLParam(r, "code")
	space, err := h.repo.GetByInviteCode(r.Context(), code)
	if err != nil {
		Error(w, http.StatusNotFound, "space not found")
		return
	}
	if err := h.repo.Join(r.Context(), space.ID, userID); err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	JSON(w, http.StatusOK, space)
}

func (h *SpaceHandler) Members(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "spaceID")
	members, err := h.repo.GetMembers(r.Context(), id)
	if err != nil {
		Error(w, http.StatusInternalServerError, err.Error())
		return
	}
	if members == nil {
		members = []model.SpaceMember{}
	}
	JSON(w, http.StatusOK, members)
}
