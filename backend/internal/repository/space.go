package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type SpaceRepo struct {
	db *pgxpool.Pool
}

func NewSpaceRepo(db *pgxpool.Pool) *SpaceRepo {
	return &SpaceRepo{db: db}
}

func (r *SpaceRepo) Create(ctx context.Context, userID string, req model.CreateSpaceRequest) (*model.Space, error) {
	emoji := req.Emoji
	if emoji == "" {
		emoji = "🗓️"
	}
	var s model.Space
	err := r.db.QueryRow(ctx,
		`INSERT INTO spaces (name, description, emoji, created_by)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, name, description, cover_image_url, emoji, invite_code, created_by, created_at`,
		req.Name, req.Description, emoji, userID,
	).Scan(&s.ID, &s.Name, &s.Description, &s.CoverImageURL, &s.Emoji, &s.InviteCode, &s.CreatedBy, &s.CreatedAt)
	if err != nil {
		return nil, err
	}
	// Add creator as owner
	_, err = r.db.Exec(ctx,
		`INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, 'owner')`,
		s.ID, userID,
	)
	return &s, err
}

func (r *SpaceRepo) GetByID(ctx context.Context, id string) (*model.Space, error) {
	var s model.Space
	err := r.db.QueryRow(ctx,
		`SELECT s.id, s.name, s.description, s.cover_image_url, s.emoji, s.invite_code, s.created_by, s.created_at,
		        COUNT(DISTINCT sm.id) as member_count,
		        COUNT(DISTINCT b.id) as board_count
		 FROM spaces s
		 LEFT JOIN space_members sm ON sm.space_id = s.id
		 LEFT JOIN boards b ON b.space_id = s.id
		 WHERE s.id = $1
		 GROUP BY s.id`,
		id,
	).Scan(&s.ID, &s.Name, &s.Description, &s.CoverImageURL, &s.Emoji, &s.InviteCode, &s.CreatedBy, &s.CreatedAt,
		&s.MemberCount, &s.BoardCount)
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *SpaceRepo) GetByInviteCode(ctx context.Context, code string) (*model.Space, error) {
	var s model.Space
	err := r.db.QueryRow(ctx,
		`SELECT id, name, description, cover_image_url, emoji, invite_code, created_by, created_at
		 FROM spaces WHERE invite_code = $1`,
		code,
	).Scan(&s.ID, &s.Name, &s.Description, &s.CoverImageURL, &s.Emoji, &s.InviteCode, &s.CreatedBy, &s.CreatedAt)
	return &s, err
}

func (r *SpaceRepo) ListForUser(ctx context.Context, userID string) ([]model.Space, error) {
	rows, err := r.db.Query(ctx,
		`SELECT s.id, s.name, s.description, s.cover_image_url, s.emoji, s.invite_code, s.created_by, s.created_at,
		        COUNT(DISTINCT sm2.id) as member_count,
		        COUNT(DISTINCT b.id) as board_count
		 FROM spaces s
		 JOIN space_members sm ON sm.space_id = s.id AND sm.user_id = $1
		 LEFT JOIN space_members sm2 ON sm2.space_id = s.id
		 LEFT JOIN boards b ON b.space_id = s.id
		 GROUP BY s.id
		 ORDER BY s.created_at DESC`,
		userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var spaces []model.Space
	for rows.Next() {
		var s model.Space
		if err := rows.Scan(&s.ID, &s.Name, &s.Description, &s.CoverImageURL, &s.Emoji, &s.InviteCode,
			&s.CreatedBy, &s.CreatedAt, &s.MemberCount, &s.BoardCount); err != nil {
			return nil, err
		}
		spaces = append(spaces, s)
	}
	return spaces, nil
}

func (r *SpaceRepo) Join(ctx context.Context, spaceID, userID string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO space_members (space_id, user_id, role) VALUES ($1, $2, 'member')
		 ON CONFLICT (space_id, user_id) DO NOTHING`,
		spaceID, userID,
	)
	return err
}

func (r *SpaceRepo) GetMembers(ctx context.Context, spaceID string) ([]model.SpaceMember, error) {
	rows, err := r.db.Query(ctx,
		`SELECT sm.id, sm.space_id, sm.user_id, sm.role, sm.joined_at,
		        u.display_name, u.avatar_color
		 FROM space_members sm
		 JOIN users u ON u.id = sm.user_id
		 WHERE sm.space_id = $1
		 ORDER BY sm.joined_at ASC`,
		spaceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var members []model.SpaceMember
	for rows.Next() {
		var m model.SpaceMember
		m.User = &model.User{}
		if err := rows.Scan(&m.ID, &m.SpaceID, &m.UserID, &m.Role, &m.JoinedAt,
			&m.User.DisplayName, &m.User.AvatarColor); err != nil {
			return nil, err
		}
		m.User.ID = m.UserID
		members = append(members, m)
	}
	return members, nil
}

func (r *SpaceRepo) IsMember(ctx context.Context, spaceID, userID string) (bool, error) {
	var count int
	err := r.db.QueryRow(ctx,
		`SELECT COUNT(*) FROM space_members WHERE space_id = $1 AND user_id = $2`,
		spaceID, userID,
	).Scan(&count)
	return count > 0, err
}
