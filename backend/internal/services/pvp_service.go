package services

import (
	"database/sql"
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/RobertoRochaT/CPP-backend/internal/database"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/lib/pq"
)

type PvPService struct {
	db *database.Database
}

func NewPvPService(db *database.Database) *PvPService {
	return &PvPService{db: db}
}

// GenerateSessionCode genera un código único de 6 caracteres
func (s *PvPService) GenerateSessionCode() (string, error) {
	const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	const codeLength = 6

	for i := 0; i < 10; i++ { // intentar 10 veces
		code := make([]byte, codeLength)
		for j := range code {
			code[j] = charset[rand.Intn(len(charset))]
		}
		codeStr := string(code)

		// Verificar si el código ya existe
		var count int
		err := s.db.DB.QueryRow("SELECT COUNT(*) FROM pvp_sessions WHERE code = $1", codeStr).Scan(&count)
		if err != nil {
			return "", err
		}
		if count == 0 {
			return codeStr, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique code")
}

// CreateSession crea una nueva sesión PvP
func (s *PvPService) CreateSession(adminUserID int64, req models.CreateSessionRequest) (*models.SessionWithDetails, error) {
	code, err := s.GenerateSessionCode()
	if err != nil {
		return nil, err
	}

	// Ensure topics is never nil
	topics := req.Topics
	if topics == nil {
		topics = []string{}
	}

	// Crear la sesión
	query := `
		INSERT INTO pvp_sessions (code, admin_user_id, title, topics, difficulty, max_problems, duration, is_public)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, code, admin_user_id, title, topics, difficulty, status, max_problems, duration, is_public, created_at, started_at, ended_at
	`

	var session models.PvPSession
	err = s.db.DB.QueryRow(query, code, adminUserID, req.Title, pq.Array(topics), req.Difficulty, req.MaxProblems, req.Duration, req.IsPublic).Scan(
		&session.ID, &session.Code, &session.AdminUserID, &session.Title, pq.Array(&session.Topics),
		&session.Difficulty, &session.Status, &session.MaxProblems, &session.Duration, &session.IsPublic,
		&session.CreatedAt, &session.StartedAt, &session.EndedAt,
	)
	if err != nil {
		return nil, err
	}

	// Seleccionar problemas basados en topics y difficulty
	problems, err := s.SelectProblemsForSession(session.ID, topics, req.Difficulty, req.MaxProblems)
	if err != nil {
		return nil, err
	}

	// El admin se une automáticamente
	err = s.JoinSession(session.ID, adminUserID)
	if err != nil {
		return nil, err
	}

	// Obtener username del admin
	var adminUsername string
	err = s.db.DB.QueryRow("SELECT username FROM users WHERE id = $1", adminUserID).Scan(&adminUsername)
	if err != nil {
		adminUsername = "Unknown"
	}

	return &models.SessionWithDetails{
		PvPSession:       session,
		AdminUsername:    adminUsername,
		ParticipantCount: 1,
		Problems:         problems,
	}, nil
}

// SelectProblemsForSession selecciona problemas para una sesión
func (s *PvPService) SelectProblemsForSession(sessionID int64, topics []string, difficulty string, maxProblems int) ([]models.PvPProblem, error) {
	// Ensure topics is never nil
	if topics == nil {
		topics = []string{}
	}

	// Query para seleccionar problemas
	query := `
		SELECT id, title, difficulty, slug
		FROM problems
		WHERE 1=1
	`
	args := []interface{}{}
	argCount := 1

	// Filtrar por difficulty si se especifica
	if difficulty != "" && difficulty != "mixed" {
		query += fmt.Sprintf(" AND LOWER(difficulty) = LOWER($%d)", argCount)
		args = append(args, difficulty)
		argCount++
	}

	// Filtrar por topics si se especifica
	if len(topics) > 0 {
		query += fmt.Sprintf(" AND topics && $%d", argCount)
		args = append(args, pq.Array(topics))
		argCount++
	}

	query += fmt.Sprintf(" ORDER BY RANDOM() LIMIT $%d", argCount)
	args = append(args, maxProblems)

	rows, err := s.db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var selectedProblems []struct {
		ID         int64
		Title      string
		Difficulty string
		Slug       string
	}

	for rows.Next() {
		var p struct {
			ID         int64
			Title      string
			Difficulty string
			Slug       string
		}
		if err := rows.Scan(&p.ID, &p.Title, &p.Difficulty, &p.Slug); err != nil {
			return nil, err
		}
		selectedProblems = append(selectedProblems, p)
	}

	// Asignar letras A, B, C, etc.
	problems := make([]models.PvPProblem, 0, len(selectedProblems))
	letters := "ABCDEFGHIJKLMNOPQRSTUVWXYZ"

	insertQuery := `
		INSERT INTO pvp_problems (session_id, problem_id, problem_slug, problem_title, problem_difficulty, letter, points)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`

	for i, p := range selectedProblems {
		letter := string(letters[i])
		points := 100 // puntos base

		var id int64
		err := s.db.DB.QueryRow(insertQuery, sessionID, p.ID, p.Slug, p.Title, p.Difficulty, letter, points).Scan(&id)
		if err != nil {
			return nil, err
		}

		problems = append(problems, models.PvPProblem{
			ID:                id,
			SessionID:         sessionID,
			ProblemID:         p.ID,
			ProblemSlug:       p.Slug,
			ProblemTitle:      p.Title,
			ProblemDifficulty: p.Difficulty,
			Letter:            letter,
			Points:            points,
		})
	}

	return problems, nil
}

// GetSessionByCode obtiene una sesión por su código
func (s *PvPService) GetSessionByCode(code string) (*models.SessionWithDetails, error) {
	var session models.PvPSession
	query := `
		SELECT id, code, admin_user_id, title, topics, difficulty, status, max_problems, duration, is_public, created_at, started_at, ended_at
		FROM pvp_sessions
		WHERE code = $1
	`
	err := s.db.DB.QueryRow(query, strings.ToUpper(code)).Scan(
		&session.ID, &session.Code, &session.AdminUserID, &session.Title, pq.Array(&session.Topics),
		&session.Difficulty, &session.Status, &session.MaxProblems, &session.Duration, &session.IsPublic,
		&session.CreatedAt, &session.StartedAt, &session.EndedAt,
	)
	if err != nil {
		return nil, err
	}

	return s.enrichSessionDetails(&session)
}

// GetSessionByID obtiene una sesión por su ID
func (s *PvPService) GetSessionByID(sessionID int64) (*models.SessionWithDetails, error) {
	query := `
		SELECT id, code, admin_user_id, title, topics, difficulty, status, max_problems, duration, is_public, created_at, started_at, ended_at
		FROM pvp_sessions
		WHERE id = $1
	`

	var session models.PvPSession
	err := s.db.DB.QueryRow(query, sessionID).Scan(
		&session.ID, &session.Code, &session.AdminUserID, &session.Title, pq.Array(&session.Topics),
		&session.Difficulty, &session.Status, &session.MaxProblems, &session.Duration, &session.IsPublic,
		&session.CreatedAt, &session.StartedAt, &session.EndedAt,
	)
	if err != nil {
		return nil, err
	}

	return s.enrichSessionDetails(&session)
}

// enrichSessionDetails añade información adicional a la sesión
func (s *PvPService) enrichSessionDetails(session *models.PvPSession) (*models.SessionWithDetails, error) {
	details := &models.SessionWithDetails{
		PvPSession: *session,
	}

	// Obtener username del admin
	err := s.db.DB.QueryRow("SELECT username FROM users WHERE id = $1", session.AdminUserID).Scan(&details.AdminUsername)
	if err != nil {
		details.AdminUsername = "Unknown"
	}

	// Contar participantes
	err = s.db.DB.QueryRow("SELECT COUNT(*) FROM pvp_participants WHERE session_id = $1", session.ID).Scan(&details.ParticipantCount)
	if err != nil {
		details.ParticipantCount = 0
	}

	// Obtener problemas
	problems, err := s.GetSessionProblems(session.ID)
	if err == nil {
		details.Problems = problems
	}

	// Obtener participantes
	participants, err := s.GetSessionParticipants(session.ID)
	if err == nil {
		details.Participants = participants
	}

	return details, nil
}

// JoinSession une a un usuario a una sesión
func (s *PvPService) JoinSession(sessionID, userID int64) error {
	// Verificar que la sesión existe y está en estado waiting
	var status string
	err := s.db.DB.QueryRow("SELECT status FROM pvp_sessions WHERE id = $1", sessionID).Scan(&status)
	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("session not found")
		}
		return err
	}

	if status != string(models.SessionWaiting) {
		return fmt.Errorf("session has already started or finished")
	}

	// Insertar participante
	query := `
		INSERT INTO pvp_participants (session_id, user_id)
		VALUES ($1, $2)
		ON CONFLICT (session_id, user_id) DO NOTHING
	`
	_, err = s.db.DB.Exec(query, sessionID, userID)
	return err
}

// StartSession inicia una sesión (solo el admin puede hacerlo)
func (s *PvPService) StartSession(sessionID, userID int64) error {
	// Verificar que el usuario es el admin
	var adminID int64
	err := s.db.DB.QueryRow("SELECT admin_user_id FROM pvp_sessions WHERE id = $1", sessionID).Scan(&adminID)
	if err != nil {
		return err
	}

	if adminID != userID {
		return fmt.Errorf("only the admin can start the session")
	}

	// Actualizar estado
	query := `
		UPDATE pvp_sessions
		SET status = $1, started_at = $2
		WHERE id = $3 AND status = $4
	`
	result, err := s.db.DB.Exec(query, models.SessionActive, time.Now().UTC(), sessionID, models.SessionWaiting)
	if err != nil {
		return err
	}

	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rows == 0 {
		return fmt.Errorf("session has already started or finished")
	}

	return nil
}

// GetSessionProblems obtiene los problemas de una sesión
func (s *PvPService) GetSessionProblems(sessionID int64) ([]models.PvPProblem, error) {
	query := `
		SELECT id, session_id, problem_id, problem_slug, problem_title, problem_difficulty, letter, points
		FROM pvp_problems
		WHERE session_id = $1
		ORDER BY letter
	`
	rows, err := s.db.DB.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var problems []models.PvPProblem
	for rows.Next() {
		var p models.PvPProblem
		err := rows.Scan(&p.ID, &p.SessionID, &p.ProblemID, &p.ProblemSlug, &p.ProblemTitle, &p.ProblemDifficulty, &p.Letter, &p.Points)
		if err != nil {
			return nil, err
		}
		problems = append(problems, p)
	}
	return problems, rows.Err()
}

// GetSessionParticipants obtiene los participantes de una sesión
func (s *PvPService) GetSessionParticipants(sessionID int64) ([]models.PvPParticipant, error) {
	query := `
		SELECT pp.id, pp.session_id, pp.user_id, u.username, pp.joined_at, pp.score, pp.problems_solved, pp.total_penalty
		FROM pvp_participants pp
		JOIN users u ON pp.user_id = u.id
		WHERE pp.session_id = $1
		ORDER BY pp.joined_at
	`
	rows, err := s.db.DB.Query(query, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var participants []models.PvPParticipant
	for rows.Next() {
		var p models.PvPParticipant
		err := rows.Scan(&p.ID, &p.SessionID, &p.UserID, &p.Username, &p.JoinedAt, &p.Score, &p.ProblemsSolved, &p.TotalPenalty)
		if err != nil {
			return nil, err
		}
		participants = append(participants, p)
	}
	return participants, rows.Err()
}

// SubmitSolution envía una solución en una sesión PvP
func (s *PvPService) SubmitSolution(sessionID, userID int64, req models.PvPSubmitRequest, result map[string]interface{}) (*models.PvPSubmission, error) {
	// Verificar que la sesión está activa
	var session models.PvPSession
	query := "SELECT id, code, admin_user_id, title, topics, difficulty, status, max_problems, duration, created_at, started_at, ended_at FROM pvp_sessions WHERE id = $1"
	err := s.db.DB.QueryRow(query, sessionID).Scan(
		&session.ID, &session.Code, &session.AdminUserID, &session.Title, pq.Array(&session.Topics),
		&session.Difficulty, &session.Status, &session.MaxProblems, &session.Duration,
		&session.CreatedAt, &session.StartedAt, &session.EndedAt,
	)
	if err != nil {
		return nil, err
	}

	if session.Status != models.SessionActive {
		return nil, fmt.Errorf("session is not active")
	}

	// Calcular penalty time (minutos desde el inicio)
	timePenalty := 0
	if session.StartedAt != nil {
		timePenalty = int(time.Since(*session.StartedAt).Minutes())
	}

	// Determinar si es accepted
	status := result["status"].(string)
	isAccepted := strings.ToLower(status) == "accepted"

	// Guardar submission
	insertQuery := `
		INSERT INTO pvp_submissions (session_id, user_id, problem_id, problem_slug, code, language, status, runtime, memory, passed_tests, total_tests, time_penalty, is_accepted)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
		RETURNING id, session_id, user_id, problem_id, problem_slug, code, language, status, runtime, memory, passed_tests, total_tests, submitted_at, time_penalty, is_accepted
	`

	var runtime, memory *int
	if r, ok := result["runtime"].(int); ok {
		runtime = &r
	}
	if m, ok := result["memory"].(int); ok {
		memory = &m
	}

	passedTests := 0
	totalTests := 0
	if pt, ok := result["passed_tests"].(int); ok {
		passedTests = pt
	}
	if tt, ok := result["total_tests"].(int); ok {
		totalTests = tt
	}

	var submission models.PvPSubmission
	var runtimeVal, memoryVal sql.NullInt32
	err = s.db.DB.QueryRow(insertQuery, sessionID, userID, req.ProblemID, req.ProblemSlug, req.Code, req.Language, status, runtime, memory, passedTests, totalTests, timePenalty, isAccepted).Scan(
		&submission.ID, &submission.SessionID, &submission.UserID, &submission.ProblemID, &submission.ProblemSlug,
		&submission.Code, &submission.Language, &submission.Status, &runtimeVal, &memoryVal,
		&submission.PassedTests, &submission.TotalTests, &submission.SubmittedAt, &submission.TimePenalty, &submission.IsAccepted,
	)
	if err != nil {
		return nil, err
	}

	if runtimeVal.Valid {
		r := int(runtimeVal.Int32)
		submission.Runtime = &r
	}
	if memoryVal.Valid {
		m := int(memoryVal.Int32)
		submission.Memory = &m
	}

	// Si es accepted, actualizar estadísticas del participante
	if isAccepted {
		err = s.UpdateParticipantStats(sessionID, userID, req.ProblemID, timePenalty)
		if err != nil {
			// Log error pero no fallar
			fmt.Printf("Error updating participant stats: %v\n", err)
		}
	}

	return &submission, nil
}

// UpdateParticipantStats actualiza las estadísticas de un participante
func (s *PvPService) UpdateParticipantStats(sessionID, userID, problemID int64, timePenalty int) error {
	// Verificar si ya había resuelto este problema
	var count int
	err := s.db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM pvp_submissions
		WHERE session_id = $1 AND user_id = $2 AND problem_id = $3 AND is_accepted = true AND id < (
			SELECT MAX(id) FROM pvp_submissions WHERE session_id = $1 AND user_id = $2 AND problem_id = $3
		)
	`, sessionID, userID, problemID).Scan(&count)
	if err != nil {
		return err
	}
	alreadySolved := count > 0

	// Si ya lo había resuelto, no actualizar
	if alreadySolved {
		return nil
	}

	// Contar intentos fallidos previos (cada uno suma 20 minutos de penalización)
	var failedAttempts int
	err = s.db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM pvp_submissions
		WHERE session_id = $1 AND user_id = $2 AND problem_id = $3 AND is_accepted = false
	`, sessionID, userID, problemID).Scan(&failedAttempts)
	if err != nil {
		failedAttempts = 0
	}

	// Penalización total = tiempo de AC + (20 * intentos fallidos)
	totalPenalty := timePenalty + (failedAttempts * 20)

	// Actualizar participante
	updateQuery := `
		UPDATE pvp_participants
		SET problems_solved = problems_solved + 1,
		    total_penalty = total_penalty + $1
		WHERE session_id = $2 AND user_id = $3
	`
	_, err = s.db.DB.Exec(updateQuery, totalPenalty, sessionID, userID)
	return err
}

// GetLeaderboard obtiene el leaderboard de una sesión
func (s *PvPService) GetLeaderboard(sessionID int64) ([]models.LeaderboardEntry, error) {
	// Obtener participantes con sus stats
	participants, err := s.GetSessionParticipants(sessionID)
	if err != nil {
		return nil, err
	}

	// Obtener problemas de la sesión
	problems, err := s.GetSessionProblems(sessionID)
	if err != nil {
		return nil, err
	}

	// Crear mapa de problemID -> letter
	problemLetters := make(map[int64]string)
	for _, p := range problems {
		problemLetters[p.ProblemID] = p.Letter
	}

	// Construir leaderboard
	entries := make([]models.LeaderboardEntry, 0, len(participants))

	for _, p := range participants {
		entry := models.LeaderboardEntry{
			UserID:         p.UserID,
			Username:       p.Username,
			ProblemsSolved: p.ProblemsSolved,
			TotalPenalty:   p.TotalPenalty,
			Problems:       make(map[string]models.ProblemAC),
		}

		// Obtener estado de cada problema para este usuario
		for _, prob := range problems {
			ac := s.GetProblemStatusForUser(sessionID, p.UserID, prob.ProblemID, prob.Letter)
			entry.Problems[prob.Letter] = ac

			// Actualizar último AC time
			if ac.Accepted && (entry.LastACTime == nil || (ac.AcceptedAt != nil && ac.AcceptedAt.After(*entry.LastACTime))) {
				entry.LastACTime = ac.AcceptedAt
			}
		}

		entries = append(entries, entry)
	}

	// Ordenar leaderboard (más problemas resueltos, menos penalty)
	// Implementar sorting
	for i := 0; i < len(entries); i++ {
		for j := i + 1; j < len(entries); j++ {
			if entries[j].ProblemsSolved > entries[i].ProblemsSolved ||
				(entries[j].ProblemsSolved == entries[i].ProblemsSolved && entries[j].TotalPenalty < entries[i].TotalPenalty) {
				entries[i], entries[j] = entries[j], entries[i]
			}
		}
	}

	// Asignar ranks
	for i := range entries {
		entries[i].Rank = i + 1
	}

	return entries, nil
}

// GetProblemStatusForUser obtiene el estado de un problema para un usuario
func (s *PvPService) GetProblemStatusForUser(sessionID, userID, problemID int64, letter string) models.ProblemAC {
	ac := models.ProblemAC{
		Letter:   letter,
		Accepted: false,
		Attempts: 0,
	}

	// Contar intentos
	s.db.DB.QueryRow(`
		SELECT COUNT(*)
		FROM pvp_submissions
		WHERE session_id = $1 AND user_id = $2 AND problem_id = $3
	`, sessionID, userID, problemID).Scan(&ac.Attempts)

	// Ver si está aceptado
	var acceptedAt time.Time
	var timePenalty int
	err := s.db.DB.QueryRow(`
		SELECT submitted_at, time_penalty
		FROM pvp_submissions
		WHERE session_id = $1 AND user_id = $2 AND problem_id = $3 AND is_accepted = true
		ORDER BY submitted_at
		LIMIT 1
	`, sessionID, userID, problemID).Scan(&acceptedAt, &timePenalty)

	if err == nil {
		ac.Accepted = true
		ac.AcceptedAt = &acceptedAt
		ac.TimePenalty = timePenalty
	}

	return ac
}

// GetUserSessions obtiene las sesiones de un usuario
func (s *PvPService) GetUserSessions(userID int64) ([]models.SessionWithDetails, error) {
	query := `
		SELECT DISTINCT s.id, s.code, s.admin_user_id, s.title, s.topics, s.difficulty, s.status, s.max_problems, s.duration, s.is_public, s.created_at, s.started_at, s.ended_at
		FROM pvp_sessions s
		JOIN pvp_participants p ON s.id = p.session_id
		WHERE p.user_id = $1
		ORDER BY s.created_at DESC
		LIMIT 50
	`

	rows, err := s.db.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.PvPSession
	for rows.Next() {
		var s models.PvPSession
		err := rows.Scan(&s.ID, &s.Code, &s.AdminUserID, &s.Title, pq.Array(&s.Topics), &s.Difficulty,
			&s.Status, &s.MaxProblems, &s.Duration, &s.IsPublic, &s.CreatedAt, &s.StartedAt, &s.EndedAt)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	result := make([]models.SessionWithDetails, 0, len(sessions))
	for _, session := range sessions {
		details, err := s.enrichSessionDetails(&session)
		if err == nil {
			result = append(result, *details)
		}
	}

	return result, nil
}

// GetPublicSessions obtiene las sesiones públicas disponibles con filtros opcionales
func (s *PvPService) GetPublicSessions(status string, difficulty string, search string, limit int, offset int) ([]models.SessionWithDetails, error) {
	if limit <= 0 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}

	// Build dynamic query
	query := `
		SELECT s.id, s.code, s.admin_user_id, s.title, s.topics, s.difficulty, s.status, s.max_problems, s.duration, s.is_public, s.created_at, s.started_at, s.ended_at
		FROM pvp_sessions s
		WHERE s.is_public = TRUE
	`
	args := []interface{}{}
	argPos := 1

	// Filter by status
	if status != "" {
		query += fmt.Sprintf(" AND s.status = $%d", argPos)
		args = append(args, status)
		argPos++
	}

	// Filter by difficulty
	if difficulty != "" && difficulty != "mixed" {
		query += fmt.Sprintf(" AND s.difficulty = $%d", argPos)
		args = append(args, difficulty)
		argPos++
	}

	// Search by title
	if search != "" {
		query += fmt.Sprintf(" AND s.title ILIKE $%d", argPos)
		args = append(args, "%"+search+"%")
		argPos++
	}

	// Order and pagination
	query += fmt.Sprintf(" ORDER BY s.created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := s.db.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []models.PvPSession
	for rows.Next() {
		var session models.PvPSession
		err := rows.Scan(&session.ID, &session.Code, &session.AdminUserID, &session.Title, pq.Array(&session.Topics),
			&session.Difficulty, &session.Status, &session.MaxProblems, &session.Duration, &session.IsPublic,
			&session.CreatedAt, &session.StartedAt, &session.EndedAt)
		if err != nil {
			return nil, err
		}
		sessions = append(sessions, session)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}

	// Enrich each session with details
	result := make([]models.SessionWithDetails, 0, len(sessions))
	for _, session := range sessions {
		details, err := s.enrichSessionDetails(&session)
		if err == nil {
			result = append(result, *details)
		}
	}

	return result, nil
}
