package handlers

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"

	"github.com/RobertoRochaT/CPP-backend/internal/middleware"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/RobertoRochaT/CPP-backend/internal/services"
	"github.com/gorilla/mux"
)

// Helper functions
func decodeJSON(r io.Reader, v interface{}) error {
	return json.NewDecoder(r).Decode(v)
}

func respondJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

type PvPHandler struct {
	pvpService *services.PvPService
}

func NewPvPHandler(pvpService *services.PvPService) *PvPHandler {
	return &PvPHandler{
		pvpService: pvpService,
	}
}

// CreateSession crea una nueva sesión PvP
// CreateSession creates a new PvP session
func (h *PvPHandler) CreateSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req models.CreateSessionRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	session, err := h.pvpService.CreateSession(int64(claims.UserID), req)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusCreated, session)
}

// GetSessionByCode gets a session by its code
func (h *PvPHandler) GetSessionByCode(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	code := vars["code"]
	if code == "" {
		http.Error(w, `{"error":"code is required"}`, http.StatusBadRequest)
		return
	}

	session, err := h.pvpService.GetSessionByCode(code)
	if err != nil {
		http.Error(w, `{"error":"session not found"}`, http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, session)
}

// GetSessionByID gets a session by its ID
func (h *PvPHandler) GetSessionByID(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	session, err := h.pvpService.GetSessionByID(id)
	if err != nil {
		http.Error(w, `{"error":"session not found"}`, http.StatusNotFound)
		return
	}

	respondJSON(w, http.StatusOK, session)
}

// JoinSession joins a user to a session
func (h *PvPHandler) JoinSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req models.JoinSessionRequest
	if err := decodeJSON(r.Body, &req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Get session by code
	session, err := h.pvpService.GetSessionByCode(req.Code)
	if err != nil {
		http.Error(w, `{"error":"session not found"}`, http.StatusNotFound)
		return
	}

	// Join session
	err = h.pvpService.JoinSession(session.ID, int64(claims.UserID))
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Get updated session
	updatedSession, err := h.pvpService.GetSessionByID(session.ID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, updatedSession)
}

// StartSession starts a PvP session
func (h *PvPHandler) StartSession(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	sessionID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	err = h.pvpService.StartSession(sessionID, int64(claims.UserID))
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Get updated session
	session, err := h.pvpService.GetSessionByID(sessionID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, session)
}

// GetLeaderboard gets the leaderboard for a session
func (h *PvPHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	leaderboard, err := h.pvpService.GetLeaderboard(sessionID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, leaderboard)
}

// SubmitSolution submits a solution in a PvP session
func (h *PvPHandler) SubmitSolution(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	sessionID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		models.PvPSubmitRequest
		Status      string `json:"status"`
		Runtime     int    `json:"runtime"`
		Memory      int    `json:"memory"`
		PassedTests int    `json:"passed_tests"`
		TotalTests  int    `json:"total_tests"`
	}
	if err := decodeJSON(r.Body, &req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Prepare result map
	resultMap := map[string]interface{}{
		"status":       req.Status,
		"runtime":      req.Runtime,
		"memory":       req.Memory,
		"passed_tests": req.PassedTests,
		"total_tests":  req.TotalTests,
	}

	// Save submission
	submission, err := h.pvpService.SubmitSolution(sessionID, int64(claims.UserID), req.PvPSubmitRequest, resultMap)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, submission)
}

// GetSessionProblems gets the problems for a session
func (h *PvPHandler) GetSessionProblems(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	sessionID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	problems, err := h.pvpService.GetSessionProblems(sessionID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, problems)
}

// GetUserSessions gets all sessions for a user
func (h *PvPHandler) GetUserSessions(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	sessions, err := h.pvpService.GetUserSessions(int64(claims.UserID))
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, sessions)
}

// GetPublicSessions gets all public sessions with optional filters
func (h *PvPHandler) GetPublicSessions(w http.ResponseWriter, r *http.Request) {
	// Parse query parameters
	query := r.URL.Query()
	status := query.Get("status")         // waiting, active, finished
	difficulty := query.Get("difficulty") // easy, medium, hard, mixed
	search := query.Get("search")         // search by title

	limit := 20
	if limitStr := query.Get("limit"); limitStr != "" {
		if parsedLimit, err := strconv.Atoi(limitStr); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	offset := 0
	if offsetStr := query.Get("offset"); offsetStr != "" {
		if parsedOffset, err := strconv.Atoi(offsetStr); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	sessions, err := h.pvpService.GetPublicSessions(status, difficulty, search, limit, offset)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, sessions)
}

// JoinSessionByID joins a user to a session by session ID (for public sessions)
func (h *PvPHandler) JoinSessionByID(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	sessionID, err := strconv.ParseInt(vars["id"], 10, 64)
	if err != nil {
		http.Error(w, `{"error":"invalid session id"}`, http.StatusBadRequest)
		return
	}

	// Get session to verify it's public
	session, err := h.pvpService.GetSessionByID(sessionID)
	if err != nil {
		http.Error(w, `{"error":"session not found"}`, http.StatusNotFound)
		return
	}

	// Verify session is public or user has code
	if !session.IsPublic {
		http.Error(w, `{"error":"This is a private session. Use the session code to join."}`, http.StatusForbidden)
		return
	}

	// Join session
	err = h.pvpService.JoinSession(sessionID, int64(claims.UserID))
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Get updated session
	updatedSession, err := h.pvpService.GetSessionByID(sessionID)
	if err != nil {
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusInternalServerError)
		return
	}

	respondJSON(w, http.StatusOK, updatedSession)
}
