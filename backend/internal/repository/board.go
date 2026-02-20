package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type BoardRepo struct {
	db *pgxpool.Pool
}

func NewBoardRepo(db *pgxpool.Pool) *BoardRepo {
	return &BoardRepo{db: db}
}

func (r *BoardRepo) Create(ctx context.Context, spaceID, userID string, req model.CreateBoardRequest) (*model.Board, error) {
	color := req.CoverColor
	if color == "" {
		color = "#6366f1"
	}
	var b model.Board
	err := r.db.QueryRow(ctx,
		`INSERT INTO boards (space_id, title, description, cover_color, created_by,
		                      position)
		 VALUES ($1, $2, $3, $4, $5,
		         COALESCE((SELECT MAX(position)+1 FROM boards WHERE space_id=$1), 0))
		 RETURNING id, space_id, title, description, cover_color, position, created_by, created_at`,
		spaceID, req.Title, req.Description, color, userID,
	).Scan(&b.ID, &b.SpaceID, &b.Title, &b.Description, &b.CoverColor, &b.Position, &b.CreatedBy, &b.CreatedAt)
	return &b, err
}

func (r *BoardRepo) ListBySpace(ctx context.Context, spaceID string) ([]model.Board, error) {
	rows, err := r.db.Query(ctx,
		`SELECT b.id, b.space_id, b.title, b.description, b.cover_color, b.position, b.created_by, b.created_at,
		        COUNT(p.id) as pin_count
		 FROM boards b
		 LEFT JOIN pins p ON p.board_id = b.id
		 WHERE b.space_id = $1
		 GROUP BY b.id
		 ORDER BY b.position ASC`,
		spaceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var boards []model.Board
	for rows.Next() {
		var b model.Board
		if err := rows.Scan(&b.ID, &b.SpaceID, &b.Title, &b.Description, &b.CoverColor,
			&b.Position, &b.CreatedBy, &b.CreatedAt, &b.PinCount); err != nil {
			return nil, err
		}
		boards = append(boards, b)
	}
	return boards, nil
}

func (r *BoardRepo) GetByID(ctx context.Context, id string) (*model.Board, error) {
	var b model.Board
	err := r.db.QueryRow(ctx,
		`SELECT id, space_id, title, description, cover_color, position, created_by, created_at
		 FROM boards WHERE id = $1`,
		id,
	).Scan(&b.ID, &b.SpaceID, &b.Title, &b.Description, &b.CoverColor, &b.Position, &b.CreatedBy, &b.CreatedAt)
	return &b, err
}

func (r *BoardRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM boards WHERE id = $1`, id)
	return err
}
