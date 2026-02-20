package repository

import (
	"context"
	"encoding/json"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type MessageRepo struct {
	db *pgxpool.Pool
}

func NewMessageRepo(db *pgxpool.Pool) *MessageRepo {
	return &MessageRepo{db: db}
}

func (r *MessageRepo) Create(ctx context.Context, spaceID, userID string, req model.CreateMessageRequest) (*model.Message, error) {
	msgType := req.MessageType
	if msgType == "" {
		msgType = "text"
	}
	meta := req.Metadata
	if meta == nil {
		meta = json.RawMessage(`{}`)
	}
	var m model.Message
	var uName, uColor string
	err := r.db.QueryRow(ctx,
		`WITH ins AS (
		   INSERT INTO messages (space_id, user_id, content, message_type, metadata)
		   VALUES ($1, $2, $3, $4, $5)
		   RETURNING id, space_id, user_id, content, message_type, metadata, created_at
		 )
		 SELECT ins.*, u.display_name, u.avatar_color
		 FROM ins JOIN users u ON u.id = ins.user_id`,
		spaceID, userID, req.Content, msgType, meta,
	).Scan(&m.ID, &m.SpaceID, &m.UserID, &m.Content, &m.MessageType, &m.Metadata, &m.CreatedAt,
		&uName, &uColor)
	if err != nil {
		return nil, err
	}
	m.User = &model.User{DisplayName: uName, AvatarColor: uColor}
	if m.UserID != nil {
		m.User.ID = *m.UserID
	}
	return &m, nil
}

func (r *MessageRepo) ListBySpace(ctx context.Context, spaceID string, limit, offset int) ([]model.Message, error) {
	if limit == 0 {
		limit = 50
	}
	rows, err := r.db.Query(ctx,
		`SELECT m.id, m.space_id, m.user_id, m.content, m.message_type, m.metadata, m.created_at,
		        u.display_name, u.avatar_color
		 FROM messages m
		 LEFT JOIN users u ON u.id = m.user_id
		 WHERE m.space_id = $1
		 ORDER BY m.created_at DESC
		 LIMIT $2 OFFSET $3`,
		spaceID, limit, offset,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var messages []model.Message
	for rows.Next() {
		var m model.Message
		var uName, uColor *string
		if err := rows.Scan(&m.ID, &m.SpaceID, &m.UserID, &m.Content, &m.MessageType, &m.Metadata, &m.CreatedAt,
			&uName, &uColor); err != nil {
			return nil, err
		}
		if uName != nil {
			m.User = &model.User{DisplayName: *uName}
			if uColor != nil {
				m.User.AvatarColor = *uColor
			}
			if m.UserID != nil {
				m.User.ID = *m.UserID
			}
		}
		messages = append(messages, m)
	}
	// Reverse to chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}
	return messages, nil
}
