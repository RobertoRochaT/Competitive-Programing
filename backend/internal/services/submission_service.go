package services

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/RobertoRochaT/CPP-backend/internal/database"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
)

type SubmissionService struct {
	db *database.Database
}

func NewSubmissionService(db *database.Database) *SubmissionService {
	return &SubmissionService{
		db: db,
	}
}

// CreateSubmission creates a new submission record
func (s *SubmissionService) CreateSubmission(userID int, req models.SubmissionRequest, problemID int, problemTitle string) (*models.Submission, error) {
	var submission models.Submission

	// Determine status - default to pending if not provided
	status := req.Status
	if status == "" {
		status = string(models.StatusPending)
	}

	// Set defaults for optional fields
	passedTests := req.PassedTests
	totalTests := req.TotalTests
	runtime := req.Runtime
	memory := req.Memory
	errorMessage := req.ErrorMessage
	testResults := req.TestResults

	err := s.db.DB.QueryRow(`
		INSERT INTO submissions (user_id, problem_id, problem_slug, problem_title, language, code, status,
								runtime, memory, passed_tests, total_tests, error_message, test_results)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, user_id, problem_id, problem_slug, problem_title, language, code, status,
				  runtime, memory, passed_tests, total_tests, error_message, test_results, created_at
	`, userID, problemID, req.ProblemSlug, problemTitle, req.Language, req.Code, status,
		runtime, memory, passedTests, totalTests, errorMessage, testResults).Scan(
		&submission.ID, &submission.UserID, &submission.ProblemID, &submission.ProblemSlug,
		&submission.ProblemTitle, &submission.Language, &submission.Code, &submission.Status,
		&submission.Runtime, &submission.Memory, &submission.PassedTests, &submission.TotalTests,
		&submission.ErrorMessage, &submission.TestResults, &submission.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create submission: %w", err)
	}

	return &submission, nil
}

// UpdateSubmission updates submission status and results
func (s *SubmissionService) UpdateSubmission(submissionID int, status models.SubmissionStatus,
	runtime, memory, passedTests, totalTests int, errorMessage string, testResults []models.TestResult) error {

	// Convert test results to JSON
	testResultsJSON, err := json.Marshal(testResults)
	if err != nil {
		return fmt.Errorf("failed to marshal test results: %w", err)
	}

	_, err = s.db.DB.Exec(`
		UPDATE submissions
		SET status = $1, runtime = $2, memory = $3, passed_tests = $4, total_tests = $5,
			error_message = $6, test_results = $7
		WHERE id = $8
	`, status, runtime, memory, passedTests, totalTests, errorMessage, string(testResultsJSON), submissionID)

	if err != nil {
		return fmt.Errorf("failed to update submission: %w", err)
	}

	return nil
}

// GetSubmissionByID retrieves a submission by ID
func (s *SubmissionService) GetSubmissionByID(submissionID int) (*models.SubmissionDetail, error) {
	var detail models.SubmissionDetail
	var errorMsg, testResults sql.NullString

	err := s.db.DB.QueryRow(`
		SELECT s.id, s.user_id, s.problem_id, s.problem_slug, s.problem_title, s.language,
			   s.code, s.status, s.runtime, s.memory, s.passed_tests, s.total_tests,
			   s.error_message, s.test_results, s.created_at,
			   u.username
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		WHERE s.id = $1
	`, submissionID).Scan(
		&detail.ID, &detail.UserID, &detail.ProblemID, &detail.ProblemSlug, &detail.ProblemTitle,
		&detail.Language, &detail.Code, &detail.Status, &detail.Runtime, &detail.Memory,
		&detail.PassedTests, &detail.TotalTests, &errorMsg, &testResults, &detail.CreatedAt,
		&detail.Username,
	)
	if err != nil {
		return nil, fmt.Errorf("submission not found: %w", err)
	}

	if errorMsg.Valid {
		detail.ErrorMessage = errorMsg.String
	}
	if testResults.Valid && testResults.String != "" {
		var results []models.TestResult
		if err := json.Unmarshal([]byte(testResults.String), &results); err == nil {
			detail.TestCases = results
		}
	}

	return &detail, nil
}

// GetUserSubmissions retrieves submissions for a user with pagination
func (s *SubmissionService) GetUserSubmissions(userID int, page, pageSize int, status string) (*models.SubmissionListResponse, error) {
	offset := (page - 1) * pageSize

	// Build query with optional status filter
	query := `
		SELECT s.id, s.user_id, s.problem_id, s.problem_slug, s.problem_title, s.language,
			   s.code, s.status, s.runtime, s.memory, s.passed_tests, s.total_tests,
			   s.error_message, s.test_results, s.created_at,
			   u.username
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		WHERE s.user_id = $1
	`
	args := []interface{}{userID}

	if status != "" {
		query += " AND s.status = $2"
		args = append(args, status)
	}

	query += " ORDER BY s.created_at DESC LIMIT $" + fmt.Sprintf("%d", len(args)+1) + " OFFSET $" + fmt.Sprintf("%d", len(args)+2)
	args = append(args, pageSize, offset)

	rows, err := s.db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []models.SubmissionDetail
	for rows.Next() {
		var detail models.SubmissionDetail
		var errorMsg, testResults sql.NullString

		err := rows.Scan(
			&detail.ID, &detail.UserID, &detail.ProblemID, &detail.ProblemSlug, &detail.ProblemTitle,
			&detail.Language, &detail.Code, &detail.Status, &detail.Runtime, &detail.Memory,
			&detail.PassedTests, &detail.TotalTests, &errorMsg, &testResults, &detail.CreatedAt,
			&detail.Username,
		)
		if err != nil {
			return nil, err
		}

		if errorMsg.Valid {
			detail.ErrorMessage = errorMsg.String
		}
		if testResults.Valid && testResults.String != "" {
			var results []models.TestResult
			if err := json.Unmarshal([]byte(testResults.String), &results); err == nil {
				detail.TestCases = results
			}
		}

		submissions = append(submissions, detail)
	}

	// Get total count
	countQuery := "SELECT COUNT(*) FROM submissions WHERE user_id = $1"
	countArgs := []interface{}{userID}
	if status != "" {
		countQuery += " AND status = $2"
		countArgs = append(countArgs, status)
	}

	var total int
	err = s.db.DB.QueryRow(countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, err
	}

	return &models.SubmissionListResponse{
		Submissions: submissions,
		Total:       total,
		Page:        page,
		PageSize:    pageSize,
	}, nil
}

// GetProblemSubmissions retrieves all submissions for a specific problem by a user
func (s *SubmissionService) GetProblemSubmissions(userID int, problemSlug string) ([]models.SubmissionDetail, error) {
	rows, err := s.db.DB.Query(`
		SELECT s.id, s.user_id, s.problem_id, s.problem_slug, s.problem_title, s.language,
			   s.code, s.status, s.runtime, s.memory, s.passed_tests, s.total_tests,
			   s.error_message, s.test_results, s.created_at,
			   u.username
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		WHERE s.user_id = $1 AND s.problem_slug = $2
		ORDER BY s.created_at DESC
	`, userID, problemSlug)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []models.SubmissionDetail
	for rows.Next() {
		var detail models.SubmissionDetail
		var errorMsg, testResults sql.NullString

		err := rows.Scan(
			&detail.ID, &detail.UserID, &detail.ProblemID, &detail.ProblemSlug, &detail.ProblemTitle,
			&detail.Language, &detail.Code, &detail.Status, &detail.Runtime, &detail.Memory,
			&detail.PassedTests, &detail.TotalTests, &errorMsg, &testResults, &detail.CreatedAt,
			&detail.Username,
		)
		if err != nil {
			return nil, err
		}

		if errorMsg.Valid {
			detail.ErrorMessage = errorMsg.String
		}
		if testResults.Valid && testResults.String != "" {
			var results []models.TestResult
			if err := json.Unmarshal([]byte(testResults.String), &results); err == nil {
				detail.TestCases = results
			}
		}

		submissions = append(submissions, detail)
	}

	return submissions, nil
}

// GetSubmissionStats retrieves submission statistics for a user
func (s *SubmissionService) GetSubmissionStats(userID int) (*models.SubmissionStats, error) {
	var stats models.SubmissionStats
	stats.ByStatus = make(map[models.SubmissionStatus]int)
	stats.ByLanguage = make(map[string]int)
	stats.ByDifficulty = make(map[models.Difficulty]int)

	// Total submissions
	err := s.db.DB.QueryRow("SELECT COUNT(*) FROM submissions WHERE user_id = $1", userID).Scan(&stats.TotalSubmissions)
	if err != nil {
		return nil, err
	}

	// By status
	rows, err := s.db.DB.Query(`
		SELECT status, COUNT(*) as count
		FROM submissions
		WHERE user_id = $1
		GROUP BY status
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var status models.SubmissionStatus
		var count int
		if err := rows.Scan(&status, &count); err != nil {
			return nil, err
		}
		stats.ByStatus[status] = count
	}

	// By language
	rows, err = s.db.DB.Query(`
		SELECT language, COUNT(*) as count
		FROM submissions
		WHERE user_id = $1
		GROUP BY language
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var language string
		var count int
		if err := rows.Scan(&language, &count); err != nil {
			return nil, err
		}
		stats.ByLanguage[language] = count
	}

	// Recent activity (last 30 days)
	rows, err = s.db.DB.Query(`
		SELECT DATE(created_at) as date, COUNT(*) as count
		FROM submissions
		WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
		GROUP BY DATE(created_at)
		ORDER BY date DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var activity models.SubmissionActivityDay
		var date time.Time
		if err := rows.Scan(&date, &activity.Count); err != nil {
			return nil, err
		}
		activity.Date = date.Format("2006-01-02")
		stats.RecentActivity = append(stats.RecentActivity, activity)
	}

	return &stats, nil
}

// GetRecentSubmissions gets recent submissions across all users (for public activity feed)
func (s *SubmissionService) GetRecentSubmissions(limit int) ([]models.SubmissionDetail, error) {
	rows, err := s.db.DB.Query(`
		SELECT s.id, s.user_id, s.problem_id, s.problem_slug, s.problem_title, s.language,
			   s.status, s.runtime, s.memory, s.passed_tests, s.total_tests, s.created_at,
			   u.username, u.avatar
		FROM submissions s
		JOIN users u ON s.user_id = u.id
		WHERE LOWER(s.status) = 'accepted'
		ORDER BY s.created_at DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []models.SubmissionDetail
	for rows.Next() {
		var detail models.SubmissionDetail
		err := rows.Scan(
			&detail.ID, &detail.UserID, &detail.ProblemID, &detail.ProblemSlug, &detail.ProblemTitle,
			&detail.Language, &detail.Status, &detail.Runtime, &detail.Memory,
			&detail.PassedTests, &detail.TotalTests, &detail.CreatedAt,
			&detail.Username, &detail.Submission.Code, // reusing Code field for avatar
		)
		if err != nil {
			return nil, err
		}
		submissions = append(submissions, detail)
	}

	return submissions, nil
}

// DeleteSubmission deletes a submission (only if owned by user)
func (s *SubmissionService) DeleteSubmission(submissionID, userID int) error {
	result, err := s.db.DB.Exec(`
		DELETE FROM submissions
		WHERE id = $1 AND user_id = $2
	`, submissionID, userID)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("submission not found or not authorized")
	}

	return nil
}
