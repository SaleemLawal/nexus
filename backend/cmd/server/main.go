package main

import (
	"context"
	"log"
	"net/http"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"

	"nexus/backend/internal/config"
	"nexus/backend/internal/handler"
	"nexus/backend/internal/middleware"
	"nexus/backend/internal/repository"
)

func main() {
	cfg := config.Load()

	ctx := context.Background()
	pool, err := repository.NewPool(ctx, cfg.SupabaseDBURL)
	if err != nil {
		log.Fatalf("DB connection error: %v", err)
	}
	defer pool.Close()

	// Repositories
	userRepo := repository.NewUserRepo(pool)
	spaceRepo := repository.NewSpaceRepo(pool)
	boardRepo := repository.NewBoardRepo(pool)
	pinRepo := repository.NewPinRepo(pool)
	pollRepo := repository.NewPollRepo(pool)
	msgRepo := repository.NewMessageRepo(pool)
	eventRepo := repository.NewEventRepo(pool)

	// Handlers
	userH := handler.NewUserHandler(userRepo)
	spaceH := handler.NewSpaceHandler(spaceRepo)
	boardH := handler.NewBoardHandler(boardRepo)
	pinH := handler.NewPinHandler(pinRepo)
	pollH := handler.NewPollHandler(pollRepo)
	msgH := handler.NewMessageHandler(msgRepo)
	eventH := handler.NewEventHandler(eventRepo)

	// Auth middleware
	authM := middleware.Auth(userRepo)

	r := chi.NewRouter()

	r.Use(chiMiddleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{cfg.CORSOrigin},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-User-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		handler.JSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	// Public: user creation, space invite lookup
	r.Post("/users", userH.Create)
	r.Get("/invite/{code}", spaceH.GetByInvite)

	// Authenticated routes
	r.Group(func(r chi.Router) {
		r.Use(authM)

		r.Get("/users/me", userH.Me)

		// Spaces
		r.Post("/spaces", spaceH.Create)
		r.Get("/spaces", spaceH.List)
		r.Get("/spaces/{spaceID}", spaceH.Get)
		r.Get("/spaces/{spaceID}/members", spaceH.Members)
		r.Post("/invite/{code}/join", spaceH.Join)

		// Boards
		r.Post("/spaces/{spaceID}/boards", boardH.Create)
		r.Get("/spaces/{spaceID}/boards", boardH.List)
		r.Get("/boards/{boardID}", boardH.Get)
		r.Delete("/boards/{boardID}", boardH.Delete)

		// Pins
		r.Post("/boards/{boardID}/pins", pinH.Create)
		r.Get("/boards/{boardID}/pins", pinH.List)
		r.Delete("/pins/{pinID}", pinH.Delete)
		r.Patch("/boards/{boardID}/pins/positions", pinH.UpdatePositions)

		// Polls
		r.Post("/spaces/{spaceID}/polls", pollH.Create)
		r.Get("/spaces/{spaceID}/polls", pollH.List)
		r.Post("/polls/{pollID}/options/{optionID}/vote", pollH.Vote)
		r.Delete("/polls/{pollID}/options/{optionID}/vote", pollH.Unvote)

		// Messages
		r.Post("/spaces/{spaceID}/messages", msgH.Create)
		r.Get("/spaces/{spaceID}/messages", msgH.List)

		// Events
		r.Post("/spaces/{spaceID}/events", eventH.Create)
		r.Get("/spaces/{spaceID}/events", eventH.List)
		r.Delete("/events/{eventID}", eventH.Delete)
	})

	log.Printf("Nexus API listening on :%s", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatal(err)
	}
}
