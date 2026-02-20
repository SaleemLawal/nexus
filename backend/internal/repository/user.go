package repository

import (
	"context"
	"crypto/rand"
	"encoding/hex"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type UserRepo struct {
	db *pgxpool.Pool
}

func NewUserRepo(db *pgxpool.Pool) *UserRepo {
	return &UserRepo{db: db}
}

func generateToken() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func (r *UserRepo) Create(ctx context.Context, req model.CreateUserRequest) (*model.User, error) {
	token, err := generateToken()
	if err != nil {
		return nil, err
	}
	color := req.AvatarColor
	if color == "" {
		color = "#6366f1"
	}
	var u model.User
	err = r.db.QueryRow(ctx,
		`INSERT INTO users (display_name, avatar_color, token)
		 VALUES ($1, $2, $3)
		 RETURNING id, display_name, avatar_color, token, created_at`,
		req.DisplayName, color, token,
	).Scan(&u.ID, &u.DisplayName, &u.AvatarColor, &u.Token, &u.CreatedAt)
	return &u, err
}

func (r *UserRepo) GetByToken(ctx context.Context, token string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRow(ctx,
		`SELECT id, display_name, avatar_color, token, created_at FROM users WHERE token = $1`,
		token,
	).Scan(&u.ID, &u.DisplayName, &u.AvatarColor, &u.Token, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *UserRepo) GetByID(ctx context.Context, id string) (*model.User, error) {
	var u model.User
	err := r.db.QueryRow(ctx,
		`SELECT id, display_name, avatar_color, created_at FROM users WHERE id = $1`,
		id,
	).Scan(&u.ID, &u.DisplayName, &u.AvatarColor, &u.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &u, nil
}
