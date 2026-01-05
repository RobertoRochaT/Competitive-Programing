package handlers

import (
    "encoding/json"
    "log"
    "net/http"
    "strconv"
    "github.com/gorilla/mux"
    "github.com/RobertoRochaT/cpp-backend/internal/models"
    "github.com/RobertoRochaT/cpp-backend/internal/services"
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

    // Obtener problemas de LeetCode
    problems, err := h.leetcodeService.FetchProblems(limit, skip)
    if err != nil {
        log.Printf("Error fetching problems: %v", err)
        http.Error(w, "Error fetching problems", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(problems)
}

// GET /api/problems/{slug}
func (h *ProblemHandler) GetProblemBySlug(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    slug := vars["slug"]

    // Primero obtenemos todos los problemas (podrías optimizar esto con una caché)
    problems, err := h.leetcodeService.FetchProblems(100, 0)
    if err != nil {
        log.Printf("Error fetching problems: %v", err)
        http.Error(w, "Error fetching problem", http.StatusInternalServerError)
        return
    }

    // Buscar el problema por slug
    var foundProblem *models.Problem
    for _, p := range problems.Problems {
        if p.Slug == slug {
            foundProblem = &p
            break
        }
    }

    if foundProblem == nil {
        http.Error(w, "Problem not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(foundProblem)
}

// GET /api/health
func (h *ProblemHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{
        "status": "ok",
        "service": "cpp-backend",
    })
}
