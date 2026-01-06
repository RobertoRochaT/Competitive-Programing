package models

import "time"

// PvPSessionStatus representa el estado de una sesión PvP
type PvPSessionStatus string

const (
	SessionWaiting  PvPSessionStatus = "waiting"
	SessionActive   PvPSessionStatus = "active"
	SessionFinished PvPSessionStatus = "finished"
)

// PvPSession representa una sesión/lobby de competencia PvP
type PvPSession struct {
	ID          int64            `json:"id" db:"id"`
	Code        string           `json:"code" db:"code"`
	AdminUserID int64            `json:"admin_user_id" db:"admin_user_id"`
	Title       string           `json:"title" db:"title"`
	Topics      []string         `json:"topics" db:"topics"`
	Difficulty  string           `json:"difficulty" db:"difficulty"`
	Status      PvPSessionStatus `json:"status" db:"status"`
	MaxProblems int              `json:"max_problems" db:"max_problems"`
	Duration    int              `json:"duration" db:"duration"` // en minutos
	IsPublic    bool             `json:"is_public" db:"is_public"`
	CreatedAt   time.Time        `json:"created_at" db:"created_at"`
	StartedAt   *time.Time       `json:"started_at,omitempty" db:"started_at"`
	EndedAt     *time.Time       `json:"ended_at,omitempty" db:"ended_at"`
}

// PvPParticipant representa un participante en una sesión PvP
type PvPParticipant struct {
	ID             int64     `json:"id" db:"id"`
	SessionID      int64     `json:"session_id" db:"session_id"`
	UserID         int64     `json:"user_id" db:"user_id"`
	Username       string    `json:"username" db:"username"`
	JoinedAt       time.Time `json:"joined_at" db:"joined_at"`
	Score          int       `json:"score" db:"score"`
	ProblemsSolved int       `json:"problems_solved" db:"problems_solved"`
	TotalPenalty   int       `json:"total_penalty" db:"total_penalty"` // en minutos
}

// PvPProblem representa un problema asignado a una sesión PvP
type PvPProblem struct {
	ID                int64  `json:"id" db:"id"`
	SessionID         int64  `json:"session_id" db:"session_id"`
	ProblemID         int64  `json:"problem_id" db:"problem_id"`
	ProblemSlug       string `json:"problem_slug" db:"problem_slug"`
	ProblemTitle      string `json:"problem_title" db:"problem_title"`
	ProblemDifficulty string `json:"problem_difficulty" db:"problem_difficulty"`
	Letter            string `json:"letter" db:"letter"` // A, B, C, D, etc.
	Points            int    `json:"points" db:"points"`
}

// PvPSubmission representa un envío en una sesión PvP
type PvPSubmission struct {
	ID          int64     `json:"id" db:"id"`
	SessionID   int64     `json:"session_id" db:"session_id"`
	UserID      int64     `json:"user_id" db:"user_id"`
	ProblemID   int64     `json:"problem_id" db:"problem_id"`
	ProblemSlug string    `json:"problem_slug" db:"problem_slug"`
	Code        string    `json:"code" db:"code"`
	Language    string    `json:"language" db:"language"`
	Status      string    `json:"status" db:"status"`
	Runtime     *int      `json:"runtime,omitempty" db:"runtime"` // ms
	Memory      *int      `json:"memory,omitempty" db:"memory"`   // KB
	PassedTests int       `json:"passed_tests" db:"passed_tests"`
	TotalTests  int       `json:"total_tests" db:"total_tests"`
	SubmittedAt time.Time `json:"submitted_at" db:"submitted_at"`
	TimePenalty int       `json:"time_penalty" db:"time_penalty"` // minutos desde inicio
	IsAccepted  bool      `json:"is_accepted" db:"is_accepted"`
}

// LeaderboardEntry representa una entrada en el leaderboard
type LeaderboardEntry struct {
	Rank           int                  `json:"rank"`
	UserID         int64                `json:"user_id"`
	Username       string               `json:"username"`
	ProblemsSolved int                  `json:"problems_solved"`
	TotalPenalty   int                  `json:"total_penalty"` // en minutos
	Problems       map[string]ProblemAC `json:"problems"`      // letra -> info
	LastACTime     *time.Time           `json:"last_ac_time,omitempty"`
}

// ProblemAC representa el estado de un problema para un usuario
type ProblemAC struct {
	Letter      string     `json:"letter"`
	Accepted    bool       `json:"accepted"`
	Attempts    int        `json:"attempts"`
	AcceptedAt  *time.Time `json:"accepted_at,omitempty"`
	TimePenalty int        `json:"time_penalty"` // minutos desde inicio
}

// CreateSessionRequest representa la petición para crear una sesión
type CreateSessionRequest struct {
	Title       string   `json:"title" binding:"required"`
	Topics      []string `json:"topics"`
	Difficulty  string   `json:"difficulty"` // easy, medium, hard, o vacío para mixed
	MaxProblems int      `json:"max_problems" binding:"required,min=1,max=26"`
	Duration    int      `json:"duration" binding:"required,min=5,max=300"` // minutos
	IsPublic    bool     `json:"is_public"`                                 // true = pública, false = privada
}

// JoinSessionRequest representa la petición para unirse a una sesión
type JoinSessionRequest struct {
	Code string `json:"code" binding:"required"`
}

// PvPSubmitRequest representa la petición para enviar una solución en PvP
type PvPSubmitRequest struct {
	ProblemID   int64  `json:"problem_id" binding:"required"`
	ProblemSlug string `json:"problem_slug" binding:"required"`
	Code        string `json:"code" binding:"required"`
	Language    string `json:"language" binding:"required"`
}

// SessionWithDetails incluye información adicional de la sesión
type SessionWithDetails struct {
	PvPSession
	AdminUsername    string           `json:"admin_username"`
	ParticipantCount int              `json:"participant_count"`
	Problems         []PvPProblem     `json:"problems,omitempty"`
	Participants     []PvPParticipant `json:"participants,omitempty"`
}
