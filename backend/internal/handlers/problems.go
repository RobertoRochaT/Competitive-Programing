package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/RobertoRochaT/CPP-backend/internal/services"
	"github.com/gorilla/mux"
)

type ProblemHandler struct {
	leetcodeService *services.LeetCodeService
}

func NewProblemHandler(leetcodeService *services.LeetCodeService) *ProblemHandler {
	return &ProblemHandler{
		leetcodeService: leetcodeService,
	}
}

// GET /api/problems
func (h *ProblemHandler) GetProblems(w http.ResponseWriter, r *http.Request) {
	// Obtener parámetros de query
	limitStr := r.URL.Query().Get("limit")
	skipStr := r.URL.Query().Get("skip")

	limit := 50
	skip := 0

	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil {
			limit = l
		}
	}

	if skipStr != "" {
		if s, err := strconv.Atoi(skipStr); err == nil {
			skip = s
		}
	}

	// Try to get problems from LeetCode, fallback to sample problems
	problems, err := h.leetcodeService.FetchProblems(limit, skip)
	if err != nil {
		log.Printf("Error fetching problems from LeetCode: %v, using sample problems", err)

		// Use sample problems with test cases
		sampleProblems := services.GetSampleProblems()

		// Apply pagination
		start := skip
		end := skip + limit
		if start >= len(sampleProblems) {
			start = len(sampleProblems)
		}
		if end > len(sampleProblems) {
			end = len(sampleProblems)
		}

		paginatedProblems := sampleProblems[start:end]

		response := models.ProblemListResponse{
			Problems: paginatedProblems,
			Total:    len(sampleProblems),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(problems)
}

// GET /api/problems/{slug}
func (h *ProblemHandler) GetProblemBySlug(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	slug := vars["slug"]

	// Try to get problem from LeetCode
	problem, err := h.leetcodeService.FetchProblemBySlug(slug)
	if err != nil {
		log.Printf("Error fetching problem from LeetCode: %v, trying sample problems", err)

		// Try to find in sample problems
		sampleProblem := services.GetProblemBySlug(slug)
		if sampleProblem == nil {
			http.Error(w, "Problem not found", http.StatusNotFound)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(sampleProblem)
		return
	}

	// If we got the problem from LeetCode, merge with sample problem test cases
	sampleProblem := services.GetProblemBySlug(slug)
	if sampleProblem != nil {
		// Merge test cases and examples from sample problem
		problem.TestCases = sampleProblem.TestCases
		problem.Examples = sampleProblem.Examples
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(problem)
}

// GET /api/health
func (h *ProblemHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "ok",
		"service": "cpp-backend",
	})
}
