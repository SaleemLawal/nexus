package repository

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
	"nexus/backend/internal/model"
)

type PollRepo struct {
	db *pgxpool.Pool
}

func NewPollRepo(db *pgxpool.Pool) *PollRepo {
	return &PollRepo{db: db}
}

func (r *PollRepo) Create(ctx context.Context, spaceID, userID string, req model.CreatePollRequest) (*model.Poll, error) {
	var p model.Poll
	err := r.db.QueryRow(ctx,
		`INSERT INTO polls (space_id, created_by, question, is_multi_select, closes_at)
		 VALUES ($1, $2, $3, $4, $5)
		 RETURNING id, space_id, created_by, question, is_multi_select, closes_at, created_at`,
		spaceID, userID, req.Question, req.IsMultiSelect, req.ClosesAt,
	).Scan(&p.ID, &p.SpaceID, &p.CreatedBy, &p.Question, &p.IsMultiSelect, &p.ClosesAt, &p.CreatedAt)
	if err != nil {
		return nil, err
	}
	for i, opt := range req.Options {
		var o model.PollOption
		if err := r.db.QueryRow(ctx,
			`INSERT INTO poll_options (poll_id, label, position) VALUES ($1, $2, $3)
			 RETURNING id, poll_id, label, position`,
			p.ID, opt.Label, i,
		).Scan(&o.ID, &o.PollID, &o.Label, &o.Position); err != nil {
			return nil, err
		}
		p.Options = append(p.Options, o)
	}
	return &p, nil
}

func (r *PollRepo) ListBySpace(ctx context.Context, spaceID, userID string) ([]model.Poll, error) {
	rows, err := r.db.Query(ctx,
		`SELECT p.id, p.space_id, p.created_by, p.question, p.is_multi_select, p.closes_at, p.created_at,
		        u.display_name, u.avatar_color
		 FROM polls p
		 LEFT JOIN users u ON u.id = p.created_by
		 WHERE p.space_id = $1
		 ORDER BY p.created_at DESC`,
		spaceID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var polls []model.Poll
	for rows.Next() {
		var p model.Poll
		var uName, uColor *string
		if err := rows.Scan(&p.ID, &p.SpaceID, &p.CreatedBy, &p.Question, &p.IsMultiSelect, &p.ClosesAt, &p.CreatedAt,
			&uName, &uColor); err != nil {
			return nil, err
		}
		if uName != nil {
			p.Creator = &model.User{DisplayName: *uName}
			if uColor != nil {
				p.Creator.AvatarColor = *uColor
			}
		}
		polls = append(polls, p)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	// Load options + vote counts for each poll
	for i := range polls {
		opts, err := r.getOptions(ctx, polls[i].ID, userID)
		if err != nil {
			return nil, err
		}
		polls[i].Options = opts
		for _, o := range opts {
			polls[i].TotalVotes += o.VoteCount
		}
	}
	return polls, nil
}

func (r *PollRepo) getOptions(ctx context.Context, pollID, userID string) ([]model.PollOption, error) {
	rows, err := r.db.Query(ctx,
		`SELECT po.id, po.poll_id, po.label, po.position,
		        COUNT(pv.id) as vote_count,
		        BOOL_OR(pv.user_id = $2) as user_voted
		 FROM poll_options po
		 LEFT JOIN poll_votes pv ON pv.poll_option_id = po.id
		 WHERE po.poll_id = $1
		 GROUP BY po.id
		 ORDER BY po.position ASC`,
		pollID, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var opts []model.PollOption
	for rows.Next() {
		var o model.PollOption
		if err := rows.Scan(&o.ID, &o.PollID, &o.Label, &o.Position, &o.VoteCount, &o.UserVoted); err != nil {
			return nil, err
		}
		opts = append(opts, o)
	}
	return opts, nil
}

func (r *PollRepo) Vote(ctx context.Context, pollOptionID, userID string) error {
	_, err := r.db.Exec(ctx,
		`INSERT INTO poll_votes (poll_option_id, user_id) VALUES ($1, $2)
		 ON CONFLICT (poll_option_id, user_id) DO NOTHING`,
		pollOptionID, userID,
	)
	return err
}

func (r *PollRepo) Unvote(ctx context.Context, pollOptionID, userID string) error {
	_, err := r.db.Exec(ctx,
		`DELETE FROM poll_votes WHERE poll_option_id = $1 AND user_id = $2`,
		pollOptionID, userID,
	)
	return err
}

func (r *PollRepo) GetByID(ctx context.Context, pollID, userID string) (*model.Poll, error) {
	var p model.Poll
	var uName, uColor *string
	err := r.db.QueryRow(ctx,
		`SELECT p.id, p.space_id, p.created_by, p.question, p.is_multi_select, p.closes_at, p.created_at,
		        u.display_name, u.avatar_color
		 FROM polls p LEFT JOIN users u ON u.id = p.created_by WHERE p.id = $1`,
		pollID,
	).Scan(&p.ID, &p.SpaceID, &p.CreatedBy, &p.Question, &p.IsMultiSelect, &p.ClosesAt, &p.CreatedAt,
		&uName, &uColor)
	if err != nil {
		return nil, err
	}
	if uName != nil {
		p.Creator = &model.User{DisplayName: *uName}
		if uColor != nil {
			p.Creator.AvatarColor = *uColor
		}
	}
	opts, err := r.getOptions(ctx, p.ID, userID)
	if err != nil {
		return nil, err
	}
	p.Options = opts
	for _, o := range opts {
		p.TotalVotes += o.VoteCount
	}
	return &p, nil
}
