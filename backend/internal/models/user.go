package models

import "time"

type User struct {
	ID        int       `json:"id" db:"id"`
	Username  string    `json:"username" db:"username"`
	Email     string    `json:"email" db:"email"`
	Password  string    `json:"-" db:"password"` // Never send password in JSON
	FullName  string    `json:"fullName" db:"full_name"`
	Avatar    string    `json:"avatar,omitempty" db:"avatar"`
	Bio       string    `json:"bio,omitempty" db:"bio"`
	Country   string    `json:"country,omitempty" db:"country"`
	School    string    `json:"school,omitempty" db:"school"`
	Ranking   int       `json:"ranking" db:"ranking"`
	CreatedAt time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time `json:"updatedAt" db:"updated_at"`
}

type UserStats struct {
	UserID              int        `json:"userId" db:"user_id"`
	TotalSolved         int        `json:"totalSolved" db:"total_solved"`
	EasySolved          int        `json:"easySolved" db:"easy_solved"`
	MediumSolved        int        `json:"mediumSolved" db:"medium_solved"`
	HardSolved          int        `json:"hardSolved" db:"hard_solved"`
	TotalSubmissions    int        `json:"totalSubmissions" db:"total_submissions"`
	AcceptedSubmissions int        `json:"acceptedSubmissions" db:"accepted_submissions"`
	AcceptanceRate      float64    `json:"acceptanceRate" db:"acceptance_rate"`
	Streak              int        `json:"streak" db:"streak"`
	MaxStreak           int        `json:"maxStreak" db:"max_streak"`
	LastSolvedAt        *time.Time `json:"lastSolvedAt,omitempty" db:"last_solved_at"`
}

type UserProfile struct {
	User      User           `json:"user"`
	Stats     UserStats      `json:"stats"`
	RecentACs []Submission   `json:"recentACs"`
	Languages map[string]int `json:"languages"` // language -> count
	TagStats  map[string]int `json:"tagStats"`  // tag -> count
}

type RegisterRequest struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	FullName string `json:"fullName"`
}

type LoginRequest struct {
	UsernameOrEmail string `json:"username_or_email" binding:"required"`
	Password        string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type UpdateProfileRequest struct {
	FullName string `json:"fullName"`
	Bio      string `json:"bio"`
	Country  string `json:"country"`
	School   string `json:"school"`
	Avatar   string `json:"avatar"`
}
