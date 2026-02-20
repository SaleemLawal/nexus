package model

import (
	"encoding/json"
	"time"
)

type User struct {
	ID          string    `json:"id"`
	DisplayName string    `json:"display_name"`
	AvatarColor string    `json:"avatar_color"`
	Token       string    `json:"token,omitempty"`
	CreatedAt   time.Time `json:"created_at"`
}

type Space struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Description    *string   `json:"description"`
	CoverImageURL  *string   `json:"cover_image_url"`
	Emoji          string    `json:"emoji"`
	InviteCode     string    `json:"invite_code"`
	CreatedBy      string    `json:"created_by"`
	CreatedAt      time.Time `json:"created_at"`
	MemberCount    int       `json:"member_count,omitempty"`
	BoardCount     int       `json:"board_count,omitempty"`
}

type SpaceMember struct {
	ID       string    `json:"id"`
	SpaceID  string    `json:"space_id"`
	UserID   string    `json:"user_id"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
	User     *User     `json:"user,omitempty"`
}

type Board struct {
	ID          string    `json:"id"`
	SpaceID     string    `json:"space_id"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	CoverColor  string    `json:"cover_color"`
	Position    int       `json:"position"`
	CreatedBy   *string   `json:"created_by"`
	CreatedAt   time.Time `json:"created_at"`
	PinCount    int       `json:"pin_count,omitempty"`
}

type Pin struct {
	ID        string          `json:"id"`
	BoardID   string          `json:"board_id"`
	CreatedBy *string         `json:"created_by"`
	Type      string          `json:"type"`
	Title     *string         `json:"title"`
	Content   *string         `json:"content"`
	ImageURL  *string         `json:"image_url"`
	LinkURL   *string         `json:"link_url"`
	Metadata  json.RawMessage `json:"metadata"`
	Position  int             `json:"position"`
	CreatedAt time.Time       `json:"created_at"`
	Creator   *User           `json:"creator,omitempty"`
}

type Poll struct {
	ID            string        `json:"id"`
	SpaceID       string        `json:"space_id"`
	CreatedBy     *string       `json:"created_by"`
	Question      string        `json:"question"`
	IsMultiSelect bool          `json:"is_multi_select"`
	ClosesAt      *time.Time    `json:"closes_at"`
	CreatedAt     time.Time     `json:"created_at"`
	Options       []PollOption  `json:"options,omitempty"`
	Creator       *User         `json:"creator,omitempty"`
	TotalVotes    int           `json:"total_votes,omitempty"`
}

type PollOption struct {
	ID        string `json:"id"`
	PollID    string `json:"poll_id"`
	Label     string `json:"label"`
	Position  int    `json:"position"`
	VoteCount int    `json:"vote_count,omitempty"`
	UserVoted bool   `json:"user_voted,omitempty"`
}

type PollVote struct {
	ID           string    `json:"id"`
	PollOptionID string    `json:"poll_option_id"`
	UserID       string    `json:"user_id"`
	CreatedAt    time.Time `json:"created_at"`
}

type Message struct {
	ID          string          `json:"id"`
	SpaceID     string          `json:"space_id"`
	UserID      *string         `json:"user_id"`
	Content     string          `json:"content"`
	MessageType string          `json:"message_type"`
	Metadata    json.RawMessage `json:"metadata"`
	CreatedAt   time.Time       `json:"created_at"`
	User        *User           `json:"user,omitempty"`
}

type Event struct {
	ID          string    `json:"id"`
	SpaceID     string    `json:"space_id"`
	CreatedBy   *string   `json:"created_by"`
	Title       string    `json:"title"`
	Description *string   `json:"description"`
	Location    *string   `json:"location"`
	StartsAt    time.Time `json:"starts_at"`
	EndsAt      *time.Time `json:"ends_at"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
	Creator     *User     `json:"creator,omitempty"`
}

// Request bodies
type CreateUserRequest struct {
	DisplayName string `json:"display_name"`
	AvatarColor string `json:"avatar_color"`
}

type CreateSpaceRequest struct {
	Name        string  `json:"name"`
	Description *string `json:"description"`
	Emoji       string  `json:"emoji"`
}

type CreateBoardRequest struct {
	Title       string  `json:"title"`
	Description *string `json:"description"`
	CoverColor  string  `json:"cover_color"`
}

type CreatePinRequest struct {
	Type     string          `json:"type"`
	Title    *string         `json:"title"`
	Content  *string         `json:"content"`
	ImageURL *string         `json:"image_url"`
	LinkURL  *string         `json:"link_url"`
	Metadata json.RawMessage `json:"metadata"`
}

type CreatePollRequest struct {
	Question      string       `json:"question"`
	IsMultiSelect bool         `json:"is_multi_select"`
	ClosesAt      *time.Time   `json:"closes_at"`
	Options       []struct {
		Label string `json:"label"`
	} `json:"options"`
}

type CreateMessageRequest struct {
	Content     string          `json:"content"`
	MessageType string          `json:"message_type"`
	Metadata    json.RawMessage `json:"metadata"`
}

type CreateEventRequest struct {
	Title       string     `json:"title"`
	Description *string    `json:"description"`
	Location    *string    `json:"location"`
	StartsAt    time.Time  `json:"starts_at"`
	EndsAt      *time.Time `json:"ends_at"`
	Color       string     `json:"color"`
}

type UpdatePinPositionsRequest struct {
	Positions []struct {
		ID       string `json:"id"`
		Position int    `json:"position"`
	} `json:"positions"`
}
