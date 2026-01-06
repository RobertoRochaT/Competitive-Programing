package services

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/RobertoRochaT/CPP-backend/internal/database"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
)

type UserService struct {
	db *database.Database
}

func NewUserService(db *database.Database) *UserService {
	return &UserService{
		db: db,
	}
}

// GetUserProfile retrieves complete user profile with stats
func (s *UserService) GetUserProfile(userID int) (*models.UserProfile, error) {
	var profile models.UserProfile

	// Get user info
	user, err := s.GetUserByID(userID)
	if err != nil {
		return nil, err
	}
	profile.User = *user

	// Get user stats
	stats, err := s.GetUserStats(userID)
	if err != nil {
		return nil, err
	}
	profile.Stats = *stats

	// Get recent accepted submissions
	recentACs, err := s.GetRecentAcceptedSubmissions(userID, 10)
	if err != nil {
		return nil, err
	}
	profile.RecentACs = recentACs

	// Get language distribution
	languages, err := s.GetLanguageStats(userID)
	if err != nil {
		return nil, err
	}
	profile.Languages = languages

	// Get tag statistics
	tagStats, err := s.GetTagStats(userID)
	if err != nil {
		return nil, err
	}
	profile.TagStats = tagStats

	return &profile, nil
}

// GetUserByID retrieves a user by ID
func (s *UserService) GetUserByID(userID int) (*models.User, error) {
	var user models.User
	var bio, country, school sql.NullString

	err := s.db.DB.QueryRow(`
		SELECT id, username, email, full_name, avatar, bio, country, school, ranking, created_at, updated_at
		FROM users
		WHERE id = $1
	`, userID).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, &user.Avatar,
		&bio, &country, &school, &user.Ranking, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if bio.Valid {
		user.Bio = bio.String
	}
	if country.Valid {
		user.Country = country.String
	}
	if school.Valid {
		user.School = school.String
	}

	return &user, nil
}

// GetUserByUsername retrieves a user by username
func (s *UserService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	var bio, country, school sql.NullString

	err := s.db.DB.QueryRow(`
		SELECT id, username, email, full_name, avatar, bio, country, school, ranking, created_at, updated_at
		FROM users
		WHERE username = $1
	`, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, &user.Avatar,
		&bio, &country, &school, &user.Ranking, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if bio.Valid {
		user.Bio = bio.String
	}
	if country.Valid {
		user.Country = country.String
	}
	if school.Valid {
		user.School = school.String
	}

	return &user, nil
}

// UpdateProfile updates user profile information
func (s *UserService) UpdateProfile(userID int, req models.UpdateProfileRequest) (*models.User, error) {
	var user models.User
	var bio, country, school sql.NullString

	err := s.db.DB.QueryRow(`
		UPDATE users
		SET full_name = $1, bio = $2, country = $3, school = $4, avatar = $5
		WHERE id = $6
		RETURNING id, username, email, full_name, avatar, bio, country, school, ranking, created_at, updated_at
	`, req.FullName, req.Bio, req.Country, req.School, req.Avatar, userID).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, &user.Avatar,
		&bio, &country, &school, &user.Ranking, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update profile: %w", err)
	}

	if bio.Valid {
		user.Bio = bio.String
	}
	if country.Valid {
		user.Country = country.String
	}
	if school.Valid {
		user.School = school.String
	}

	return &user, nil
}

// GetUserStats retrieves user statistics
func (s *UserService) GetUserStats(userID int) (*models.UserStats, error) {
	var stats models.UserStats

	err := s.db.DB.QueryRow(`
		SELECT user_id, total_solved, easy_solved, medium_solved, hard_solved,
			   total_submissions, accepted_submissions, acceptance_rate,
			   streak, max_streak, last_solved_at
		FROM user_stats
		WHERE user_id = $1
	`, userID).Scan(
		&stats.UserID, &stats.TotalSolved, &stats.EasySolved, &stats.MediumSolved, &stats.HardSolved,
		&stats.TotalSubmissions, &stats.AcceptedSubmissions, &stats.AcceptanceRate,
		&stats.Streak, &stats.MaxStreak, &stats.LastSolvedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get user stats: %w", err)
	}

	return &stats, nil
}

// GetRecentAcceptedSubmissions gets recent AC submissions
func (s *UserService) GetRecentAcceptedSubmissions(userID int, limit int) ([]models.Submission, error) {
	rows, err := s.db.DB.Query(`
		SELECT id, user_id, problem_id, problem_slug, problem_title, language,
			   code, status, runtime, memory, passed_tests, total_tests,
			   error_message, test_results, created_at
		FROM submissions
		WHERE user_id = $1 AND LOWER(status) = 'accepted'
		ORDER BY created_at DESC
		LIMIT $2
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []models.Submission
	for rows.Next() {
		var s models.Submission
		var errorMsg, testResults sql.NullString

		err := rows.Scan(
			&s.ID, &s.UserID, &s.ProblemID, &s.ProblemSlug, &s.ProblemTitle, &s.Language,
			&s.Code, &s.Status, &s.Runtime, &s.Memory, &s.PassedTests, &s.TotalTests,
			&errorMsg, &testResults, &s.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if errorMsg.Valid {
			s.ErrorMessage = errorMsg.String
		}
		if testResults.Valid {
			s.TestResults = testResults.String
		}

		submissions = append(submissions, s)
	}

	return submissions, nil
}

// GetLanguageStats gets language usage statistics
func (s *UserService) GetLanguageStats(userID int) (map[string]int, error) {
	rows, err := s.db.DB.Query(`
		SELECT language, COUNT(*) as count
		FROM submissions
		WHERE user_id = $1 AND LOWER(status) = 'accepted'
		GROUP BY language
		ORDER BY count DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	languages := make(map[string]int)
	for rows.Next() {
		var lang string
		var count int
		if err := rows.Scan(&lang, &count); err != nil {
			return nil, err
		}
		languages[lang] = count
	}

	return languages, nil
}

// GetTagStats gets problem tag statistics (would need to join with problems table)
func (s *UserService) GetTagStats(userID int) (map[string]int, error) {
	// For now, return empty map
	// In production, you'd join with a problems table that has tags
	return make(map[string]int), nil
}

// UpdateUserStats updates user statistics after a submission
func (s *UserService) UpdateUserStats(userID int, submission *models.Submission, difficulty models.Difficulty) error {
	tx, err := s.db.DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Increment total submissions
	_, err = tx.Exec(`
		UPDATE user_stats
		SET total_submissions = total_submissions + 1
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return err
	}

	// If accepted, update accepted count and difficulty counts
	if submission.Status == models.StatusAccepted {
		// Check if this is a new problem solve
		var alreadySolved bool
		err = tx.QueryRow(`
			SELECT EXISTS(SELECT 1 FROM solved_problems WHERE user_id = $1 AND problem_slug = $2)
		`, userID, submission.ProblemSlug).Scan(&alreadySolved)
		if err != nil {
			return err
		}

		if !alreadySolved {
			// Insert into solved_problems
			_, err = tx.Exec(`
				INSERT INTO solved_problems (user_id, problem_id, problem_slug, problem_title, difficulty, best_runtime, best_memory)
				VALUES ($1, $2, $3, $4, $5, $6, $7)
			`, userID, submission.ProblemID, submission.ProblemSlug, submission.ProblemTitle, difficulty, submission.Runtime, submission.Memory)
			if err != nil {
				return err
			}

			// Update difficulty count
			difficultyColumn := "total_solved"
			switch difficulty {
			case models.Easy:
				difficultyColumn = "easy_solved"
			case models.Medium:
				difficultyColumn = "medium_solved"
			case models.Hard:
				difficultyColumn = "hard_solved"
			}

			query := fmt.Sprintf(`
				UPDATE user_stats
				SET total_solved = total_solved + 1,
					%s = %s + 1,
					accepted_submissions = accepted_submissions + 1,
					last_solved_at = $2
				WHERE user_id = $1
			`, difficultyColumn, difficultyColumn)

			_, err = tx.Exec(query, userID, time.Now())
			if err != nil {
				return err
			}

			// Update streak
			err = s.updateStreak(tx, userID)
			if err != nil {
				return err
			}
		} else {
			// Just update accepted count
			_, err = tx.Exec(`
				UPDATE user_stats
				SET accepted_submissions = accepted_submissions + 1
				WHERE user_id = $1
			`, userID)
			if err != nil {
				return err
			}

			// Update best runtime/memory if better
			_, err = tx.Exec(`
				UPDATE solved_problems
				SET best_runtime = LEAST(best_runtime, $3),
					best_memory = LEAST(best_memory, $4)
				WHERE user_id = $1 AND problem_slug = $2
			`, userID, submission.ProblemSlug, submission.Runtime, submission.Memory)
			if err != nil {
				return err
			}
		}
	}

	// Update acceptance rate
	_, err = tx.Exec(`
		UPDATE user_stats
		SET acceptance_rate = CASE
			WHEN total_submissions > 0 THEN (accepted_submissions::FLOAT / total_submissions::FLOAT) * 100
			ELSE 0
		END
		WHERE user_id = $1
	`, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

// updateStreak updates the user's solve streak
func (s *UserService) updateStreak(tx *sql.Tx, userID int) error {
	var lastSolvedAt sql.NullTime
	var currentStreak int

	err := tx.QueryRow(`
		SELECT last_solved_at, streak
		FROM user_stats
		WHERE user_id = $1
	`, userID).Scan(&lastSolvedAt, &currentStreak)
	if err != nil {
		return err
	}

	now := time.Now()
	newStreak := 1

	if lastSolvedAt.Valid {
		lastSolved := lastSolvedAt.Time
		daysDiff := int(now.Sub(lastSolved).Hours() / 24)

		if daysDiff == 0 {
			// Same day, keep streak
			newStreak = currentStreak
		} else if daysDiff == 1 {
			// Consecutive day, increment streak
			newStreak = currentStreak + 1
		}
		// else: gap > 1 day, reset to 1
	}

	_, err = tx.Exec(`
		UPDATE user_stats
		SET streak = $2,
			max_streak = GREATEST(max_streak, $2)
		WHERE user_id = $1
	`, userID, newStreak)

	return err
}

// GetSolvedProblems gets all solved problems for a user
func (s *UserService) GetSolvedProblems(userID int) ([]models.Submission, error) {
	rows, err := s.db.DB.Query(`
		SELECT sp.problem_id, sp.problem_slug, sp.problem_title, sp.difficulty,
			   sp.first_solved_at, sp.best_runtime, sp.best_memory,
			   s.id, s.language, s.code, s.status, s.passed_tests, s.total_tests
		FROM solved_problems sp
		LEFT JOIN LATERAL (
			SELECT id, language, code, status, passed_tests, total_tests, runtime, memory
			FROM submissions
			WHERE user_id = sp.user_id AND problem_slug = sp.problem_slug AND LOWER(status) = 'accepted'
			ORDER BY created_at DESC
			LIMIT 1
		) s ON true
		WHERE sp.user_id = $1
		ORDER BY sp.first_solved_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var submissions []models.Submission
	for rows.Next() {
		var s models.Submission
		var difficulty string
		var submissionID sql.NullInt64
		var language, code, status sql.NullString
		var passedTests, totalTests sql.NullInt64

		err := rows.Scan(
			&s.ProblemID, &s.ProblemSlug, &s.ProblemTitle, &difficulty,
			&s.CreatedAt, &s.Runtime, &s.Memory,
			&submissionID, &language, &code, &status, &passedTests, &totalTests,
		)
		if err != nil {
			return nil, err
		}

		if submissionID.Valid {
			s.ID = int(submissionID.Int64)
			s.Language = language.String
			s.Code = code.String
			s.Status = models.SubmissionStatus(status.String)
			s.PassedTests = int(passedTests.Int64)
			s.TotalTests = int(totalTests.Int64)
		}

		submissions = append(submissions, s)
	}

	return submissions, nil
}

// GetLeaderboard gets top users by total solved
func (s *UserService) GetLeaderboard(limit int) ([]models.UserProfile, error) {
	rows, err := s.db.DB.Query(`
		SELECT u.id, u.username, u.full_name, u.avatar, u.country, u.ranking,
			   us.total_solved, us.easy_solved, us.medium_solved, us.hard_solved,
			   us.acceptance_rate, us.streak
		FROM users u
		JOIN user_stats us ON u.id = us.user_id
		WHERE us.total_solved > 0
		ORDER BY us.total_solved DESC, us.acceptance_rate DESC
		LIMIT $1
	`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var profiles []models.UserProfile
	for rows.Next() {
		var profile models.UserProfile
		err := rows.Scan(
			&profile.User.ID, &profile.User.Username, &profile.User.FullName,
			&profile.User.Avatar, &profile.User.Country, &profile.User.Ranking,
			&profile.Stats.TotalSolved, &profile.Stats.EasySolved,
			&profile.Stats.MediumSolved, &profile.Stats.HardSolved,
			&profile.Stats.AcceptanceRate, &profile.Stats.Streak,
		)
		if err != nil {
			return nil, err
		}
		profile.Stats.UserID = profile.User.ID
		profiles = append(profiles, profile)
	}

	return profiles, nil
}
