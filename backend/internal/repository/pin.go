package repository

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type PinRepo struct {
	db *pgxpool.Pool
}

func NewPinRepo(db *pgxpool.Pool) *PinRepo {
	return &PinRepo{db: db}
}

func (r *PinRepo) Create(ctx context.Context, boardID, userID string, req model.CreatePinRequest) (*model.Pin, error) {
	meta := req.Metadata
	if meta == nil {
		meta = json.RawMessage(`{}`)
	}
	var p model.Pin
	err := r.db.QueryRow(ctx,
		`INSERT INTO pins (board_id, created_by, type, title, content, image_url, link_url, metadata, position)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8,
		         COALESCE((SELECT MAX(position)+1 FROM pins WHERE board_id=$1), 0))
		 RETURNING id, board_id, created_by, type, title, content, image_url, link_url, metadata, position, created_at`,
		boardID, userID, req.Type, req.Title, req.Content, req.ImageURL, req.LinkURL, meta,
	).Scan(&p.ID, &p.BoardID, &p.CreatedBy, &p.Type, &p.Title, &p.Content,
		&p.ImageURL, &p.LinkURL, &p.Metadata, &p.Position, &p.CreatedAt)
	return &p, err
}

func (r *PinRepo) ListByBoard(ctx context.Context, boardID string) ([]model.Pin, error) {
	rows, err := r.db.Query(ctx,
		`SELECT p.id, p.board_id, p.created_by, p.type, p.title, p.content, p.image_url, p.link_url,
		        p.metadata, p.position, p.created_at,
		        u.display_name, u.avatar_color
		 FROM pins p
		 LEFT JOIN users u ON u.id = p.created_by
		 WHERE p.board_id = $1
		 ORDER BY p.position ASC`,
		boardID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var pins []model.Pin
	for rows.Next() {
		var p model.Pin
		var uName, uColor *string
		if err := rows.Scan(&p.ID, &p.BoardID, &p.CreatedBy, &p.Type, &p.Title, &p.Content,
			&p.ImageURL, &p.LinkURL, &p.Metadata, &p.Position, &p.CreatedAt,
			&uName, &uColor); err != nil {
			return nil, err
		}
		if uName != nil {
			p.Creator = &model.User{DisplayName: *uName}
			if uColor != nil {
				p.Creator.AvatarColor = *uColor
			}
			if p.CreatedBy != nil {
				p.Creator.ID = *p.CreatedBy
			}
		}
		pins = append(pins, p)
	}
	return pins, nil
}

func (r *PinRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM pins WHERE id = $1`, id)
	return err
}

func (r *PinRepo) UpdatePositions(ctx context.Context, positions []struct {
	ID       string
	Position int
}) error {
	for _, pos := range positions {
		if _, err := r.db.Exec(ctx,
			`UPDATE pins SET position = $1 WHERE id = $2`,
			pos.Position, pos.ID,
		); err != nil {
			return err
		}
	}
	return nil
}

func (r *PinRepo) GetByID(ctx context.Context, id string) (*model.Pin, error) {
	var p model.Pin
	err := r.db.QueryRow(ctx,
		`SELECT id, board_id, created_by, type, title, content, image_url, link_url, metadata, position, created_at
		 FROM pins WHERE id = $1`,
		id,
	).Scan(&p.ID, &p.BoardID, &p.CreatedBy, &p.Type, &p.Title, &p.Content,
		&p.ImageURL, &p.LinkURL, &p.Metadata, &p.Position, &p.CreatedAt)
	return &p, err
}
