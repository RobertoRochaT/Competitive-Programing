package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/RobertoRochaT/CPP-backend/internal/middleware"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/RobertoRochaT/CPP-backend/internal/services"
	"github.com/gorilla/mux"
)

type SubmissionHandler struct {
	submissionService *services.SubmissionService
	userService       *services.UserService
	problemService    *services.LeetCodeService
}

func NewSubmissionHandler(
	submissionService *services.SubmissionService,
	userService *services.UserService,
	problemService *services.LeetCodeService,
) *SubmissionHandler {
	return &SubmissionHandler{
		submissionService: submissionService,
		userService:       userService,
		problemService:    problemService,
	}
}

// CreateSubmission creates a new submission
func (h *SubmissionHandler) CreateSubmission(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req models.SubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode submission request: %v", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// If problemId or title not provided, fetch from service
	problemID := req.ProblemID
	problemTitle := req.ProblemTitle

	if problemID == 0 || problemTitle == "" {
		problem, err := h.problemService.FetchProblemBySlug(req.ProblemSlug)
		if err != nil {
			log.Printf("Failed to get problem %s: %v", req.ProblemSlug, err)
			http.Error(w, `{"error":"Problem not found"}`, http.StatusNotFound)
			return
		}
		problemID = problem.ID
		problemTitle = problem.Title
	}

	// Create submission record
	submission, err := h.submissionService.CreateSubmission(
		claims.UserID,
		req,
		problemID,
		problemTitle,
	)
	if err != nil {
		log.Printf("Failed to create submission: %v", err)
		http.Error(w, `{"error":"Failed to create submission"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(submission)

	log.Printf("Submission created: ID %d for user %s on problem %s (status: %s)", submission.ID, claims.Username, req.ProblemSlug, req.Status)
}

// UpdateSubmissionResult updates a submission with execution results
func (h *SubmissionHandler) UpdateSubmissionResult(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	submissionID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid submission ID"}`, http.StatusBadRequest)
		return
	}

	var req struct {
		Status       models.SubmissionStatus `json:"status"`
		Runtime      int                     `json:"runtime"`
		Memory       int                     `json:"memory"`
		PassedTests  int                     `json:"passedTests"`
		TotalTests   int                     `json:"totalTests"`
		ErrorMessage string                  `json:"errorMessage"`
		TestResults  []models.TestResult     `json:"testResults"`
		Difficulty   models.Difficulty       `json:"difficulty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode update request: %v", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Get submission to verify ownership
	submission, err := h.submissionService.GetSubmissionByID(submissionID)
	if err != nil {
		http.Error(w, `{"error":"Submission not found"}`, http.StatusNotFound)
		return
	}

	if submission.UserID != claims.UserID {
		http.Error(w, `{"error":"Not authorized to update this submission"}`, http.StatusForbidden)
		return
	}

	// Update submission
	err = h.submissionService.UpdateSubmission(
		submissionID,
		req.Status,
		req.Runtime,
		req.Memory,
		req.PassedTests,
		req.TotalTests,
		req.ErrorMessage,
		req.TestResults,
	)
	if err != nil {
		log.Printf("Failed to update submission %d: %v", submissionID, err)
		http.Error(w, `{"error":"Failed to update submission"}`, http.StatusInternalServerError)
		return
	}

	// Update user stats if submission is complete
	if req.Status != models.StatusPending && req.Status != models.StatusRunning {
		submission.Status = req.Status
		submission.Runtime = req.Runtime
		submission.Memory = req.Memory
		submission.PassedTests = req.PassedTests
		submission.TotalTests = req.TotalTests

		err = h.userService.UpdateUserStats(claims.UserID, &submission.Submission, req.Difficulty)
		if err != nil {
			log.Printf("Failed to update user stats for user %d: %v", claims.UserID, err)
			// Don't fail the request, just log the error
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Submission updated successfully",
	})

	log.Printf("Submission %d updated with status %s", submissionID, req.Status)
}

// GetSubmission retrieves a submission by ID
func (h *SubmissionHandler) GetSubmission(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	submissionID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid submission ID"}`, http.StatusBadRequest)
		return
	}

	submission, err := h.submissionService.GetSubmissionByID(submissionID)
	if err != nil {
		log.Printf("Failed to get submission %d: %v", submissionID, err)
		http.Error(w, `{"error":"Submission not found"}`, http.StatusNotFound)
		return
	}

	// Check if user is authenticated to see full code
	claims, ok := middleware.GetUserFromContext(r)
	if !ok || (claims.UserID != submission.UserID) {
		// Hide code for other users
		submission.Code = ""
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(submission)
}

// GetMySubmissions retrieves submissions for the authenticated user
func (h *SubmissionHandler) GetMySubmissions(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	// Get pagination params
	page := 1
	pageSize := 20
	status := r.URL.Query().Get("status")

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if sizeStr := r.URL.Query().Get("pageSize"); sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 && s <= 100 {
			pageSize = s
		}
	}

	submissions, err := h.submissionService.GetUserSubmissions(claims.UserID, page, pageSize, status)
	if err != nil {
		log.Printf("Failed to get submissions for user %d: %v", claims.UserID, err)
		http.Error(w, `{"error":"Failed to get submissions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(submissions)
}

// GetUserSubmissions retrieves submissions for a specific user by username
func (h *SubmissionHandler) GetUserSubmissions(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	// Get pagination params
	page := 1
	pageSize := 20
	status := r.URL.Query().Get("status")

	if pageStr := r.URL.Query().Get("page"); pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	if sizeStr := r.URL.Query().Get("pageSize"); sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 && s <= 100 {
			pageSize = s
		}
	}

	submissions, err := h.submissionService.GetUserSubmissions(user.ID, page, pageSize, status)
	if err != nil {
		log.Printf("Failed to get submissions for user %s: %v", username, err)
		http.Error(w, `{"error":"Failed to get submissions"}`, http.StatusInternalServerError)
		return
	}

	// Check if requester is the owner
	claims, ok := middleware.GetUserFromContext(r)
	hideCode := !ok || claims.UserID != user.ID

	if hideCode {
		// Hide code for other users
		for i := range submissions.Submissions {
			submissions.Submissions[i].Code = ""
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(submissions)
}

// GetProblemSubmissions retrieves all submissions for a specific problem by the authenticated user
func (h *SubmissionHandler) GetProblemSubmissions(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	problemSlug := vars["slug"]

	submissions, err := h.submissionService.GetProblemSubmissions(claims.UserID, problemSlug)
	if err != nil {
		log.Printf("Failed to get problem submissions for user %d, problem %s: %v", claims.UserID, problemSlug, err)
		http.Error(w, `{"error":"Failed to get submissions"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"submissions": submissions,
		"total":       len(submissions),
	})
}

// GetSubmissionStats retrieves submission statistics for the authenticated user
func (h *SubmissionHandler) GetSubmissionStats(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	stats, err := h.submissionService.GetSubmissionStats(claims.UserID)
	if err != nil {
		log.Printf("Failed to get submission stats for user %d: %v", claims.UserID, err)
		http.Error(w, `{"error":"Failed to get submission stats"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetRecentSubmissions retrieves recent accepted submissions across all users
func (h *SubmissionHandler) GetRecentSubmissions(w http.ResponseWriter, r *http.Request) {
	limit := 20
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	submissions, err := h.submissionService.GetRecentSubmissions(limit)
	if err != nil {
		log.Printf("Failed to get recent submissions: %v", err)
		http.Error(w, `{"error":"Failed to get recent submissions"}`, http.StatusInternalServerError)
		return
	}

	// Hide code for all submissions
	for i := range submissions {
		submissions[i].Code = ""
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"submissions": submissions,
		"total":       len(submissions),
	})
}

// DeleteSubmission deletes a submission
func (h *SubmissionHandler) DeleteSubmission(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	submissionID, err := strconv.Atoi(vars["id"])
	if err != nil {
		http.Error(w, `{"error":"Invalid submission ID"}`, http.StatusBadRequest)
		return
	}

	err = h.submissionService.DeleteSubmission(submissionID, claims.UserID)
	if err != nil {
		log.Printf("Failed to delete submission %d for user %d: %v", submissionID, claims.UserID, err)
		http.Error(w, `{"error":"Failed to delete submission"}`, http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Submission deleted successfully",
	})

	log.Printf("Submission %d deleted by user %s", submissionID, claims.Username)
}
