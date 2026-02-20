package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type EventRepo struct {
	db *pgxpool.Pool
}

func NewEventRepo(db *pgxpool.Pool) *EventRepo {
	return &EventRepo{db: db}
}

func (r *EventRepo) Create(ctx context.Context, spaceID, userID string, req model.CreateEventRequest) (*model.Event, error) {
	color := req.Color
	if color == "" {
		color = "#6366f1"
	}
	var e model.Event
	err := r.db.QueryRow(ctx,
		`INSERT INTO events (space_id, created_by, title, description, location, starts_at, ends_at, color)
		 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		 RETURNING id, space_id, created_by, title, description, location, starts_at, ends_at, color, created_at`,
		spaceID, userID, req.Title, req.Description, req.Location, req.StartsAt, req.EndsAt, color,
	).Scan(&e.ID, &e.SpaceID, &e.CreatedBy, &e.Title, &e.Description, &e.Location,
		&e.StartsAt, &e.EndsAt, &e.Color, &e.CreatedAt)
	return &e, err
}

func (r *EventRepo) ListBySpace(ctx context.Context, spaceID string) ([]model.Event, error) {
	rows, err := r.db.Query(ctx,
		`SELECT e.id, e.space_id, e.created_by, e.title, e.description, e.location, e.starts_at, e.ends_at, e.color, e.created_at,
		        u.display_name, u.avatar_color
		 FROM events e
		 LEFT JOIN users u ON u.id = e.created_by
		 WHERE e.space_id = $1
		 ORDER BY e.starts_at ASC`,
		spaceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var events []model.Event
	for rows.Next() {
		var e model.Event
		var uName, uColor *string
		if err := rows.Scan(&e.ID, &e.SpaceID, &e.CreatedBy, &e.Title, &e.Description, &e.Location,
			&e.StartsAt, &e.EndsAt, &e.Color, &e.CreatedAt, &uName, &uColor); err != nil {
			return nil, err
		}
		if uName != nil {
			e.Creator = &model.User{DisplayName: *uName}
			if uColor != nil {
				e.Creator.AvatarColor = *uColor
			}
			if e.CreatedBy != nil {
				e.Creator.ID = *e.CreatedBy
			}
		}
		events = append(events, e)
	}
	return events, nil
}

func (r *EventRepo) Delete(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM events WHERE id = $1`, id)
	return err
}
