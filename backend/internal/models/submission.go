package models

import "time"

type SubmissionStatus string

const (
	StatusPending  SubmissionStatus = "pending"
	StatusRunning  SubmissionStatus = "running"
	StatusAccepted SubmissionStatus = "accepted"
	StatusWrong    SubmissionStatus = "wrong_answer"
	StatusTLE      SubmissionStatus = "time_limit_exceeded"
	StatusMLE      SubmissionStatus = "memory_limit_exceeded"
	StatusRE       SubmissionStatus = "runtime_error"
	StatusCE       SubmissionStatus = "compilation_error"
)

type Submission struct {
	ID           int              `json:"id" db:"id"`
	UserID       int              `json:"userId" db:"user_id"`
	ProblemID    int              `json:"problemId" db:"problem_id"`
	ProblemSlug  string           `json:"problemSlug" db:"problem_slug"`
	ProblemTitle string           `json:"problemTitle" db:"problem_title"`
	Language     string           `json:"language" db:"language"`
	Code         string           `json:"code" db:"code"`
	Status       SubmissionStatus `json:"status" db:"status"`
	Runtime      int              `json:"runtime,omitempty" db:"runtime"` // milliseconds
	Memory       int              `json:"memory,omitempty" db:"memory"`   // KB
	PassedTests  int              `json:"passedTests" db:"passed_tests"`
	TotalTests   int              `json:"totalTests" db:"total_tests"`
	ErrorMessage string           `json:"errorMessage,omitempty" db:"error_message"`
	TestResults  string           `json:"testResults,omitempty" db:"test_results"` // JSON array
	CreatedAt    time.Time        `json:"createdAt" db:"created_at"`
}

type SubmissionDetail struct {
	Submission
	Username    string       `json:"username"`
	TestCases   []TestResult `json:"testCases,omitempty"`
	ProblemTags []string     `json:"problemTags,omitempty"`
	Difficulty  Difficulty   `json:"difficulty,omitempty"`
}

type TestResult struct {
	TestNumber     int    `json:"testNumber"`
	Input          string `json:"input"`
	ExpectedOutput string `json:"expectedOutput"`
	ActualOutput   string `json:"actualOutput"`
	Passed         bool   `json:"passed"`
	Runtime        int    `json:"runtime,omitempty"`
	Memory         int    `json:"memory,omitempty"`
	Error          string `json:"error,omitempty"`
}

type SubmissionRequest struct {
	ProblemID    int    `json:"problemId"`
	ProblemSlug  string `json:"problemSlug" binding:"required"`
	ProblemTitle string `json:"problemTitle"`
	Language     string `json:"language" binding:"required"`
	Code         string `json:"code" binding:"required"`
	Status       string `json:"status"`
	Runtime      int    `json:"runtime"`
	Memory       int    `json:"memory"`
	PassedTests  int    `json:"passedTests"`
	TotalTests   int    `json:"totalTests"`
	ErrorMessage string `json:"errorMessage"`
	TestResults  string `json:"testResults"`
}

type SubmissionListResponse struct {
	Submissions []SubmissionDetail `json:"submissions"`
	Total       int                `json:"total"`
	Page        int                `json:"page"`
	PageSize    int                `json:"pageSize"`
}

type SubmissionStats struct {
	TotalSubmissions int                      `json:"totalSubmissions"`
	ByStatus         map[SubmissionStatus]int `json:"byStatus"`
	ByLanguage       map[string]int           `json:"byLanguage"`
	ByDifficulty     map[Difficulty]int       `json:"byDifficulty"`
	RecentActivity   []SubmissionActivityDay  `json:"recentActivity"`
}

type SubmissionActivityDay struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}
