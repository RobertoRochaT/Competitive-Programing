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

type UserHandler struct {
	userService *services.UserService
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		userService: userService,
	}
}

// GetProfile returns the complete user profile with stats
func (h *UserHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	// Get user by username
	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		log.Printf("Failed to get user by username %s: %v", username, err)
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	// Get complete profile
	profile, err := h.userService.GetUserProfile(user.ID)
	if err != nil {
		log.Printf("Failed to get user profile for %s: %v", username, err)
		http.Error(w, `{"error":"Failed to get user profile"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// GetMyProfile returns the authenticated user's profile
func (h *UserHandler) GetMyProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	profile, err := h.userService.GetUserProfile(claims.UserID)
	if err != nil {
		log.Printf("Failed to get profile for user %d: %v", claims.UserID, err)
		http.Error(w, `{"error":"Failed to get profile"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

// UpdateProfile updates the authenticated user's profile
func (h *UserHandler) UpdateProfile(w http.ResponseWriter, r *http.Request) {
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req models.UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode update profile request: %v", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	user, err := h.userService.UpdateProfile(claims.UserID, req)
	if err != nil {
		log.Printf("Failed to update profile for user %d: %v", claims.UserID, err)
		http.Error(w, `{"error":"Failed to update profile"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)

	log.Printf("Profile updated for user %s (ID: %d)", user.Username, user.ID)
}

// GetUserStats returns statistics for a user
func (h *UserHandler) GetUserStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	stats, err := h.userService.GetUserStats(user.ID)
	if err != nil {
		log.Printf("Failed to get stats for user %s: %v", username, err)
		http.Error(w, `{"error":"Failed to get user stats"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// GetSolvedProblems returns all solved problems for a user
func (h *UserHandler) GetSolvedProblems(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	problems, err := h.userService.GetSolvedProblems(user.ID)
	if err != nil {
		log.Printf("Failed to get solved problems for user %s: %v", username, err)
		http.Error(w, `{"error":"Failed to get solved problems"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"problems": problems,
		"total":    len(problems),
	})
}

// GetLeaderboard returns the top users by total solved
func (h *UserHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	// Get limit from query params (default 100)
	limitStr := r.URL.Query().Get("limit")
	limit := 100
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 500 {
			limit = l
		}
	}

	profiles, err := h.userService.GetLeaderboard(limit)
	if err != nil {
		log.Printf("Failed to get leaderboard: %v", err)
		http.Error(w, `{"error":"Failed to get leaderboard"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users": profiles,
		"total": len(profiles),
	})
}

// GetLanguageStats returns language usage statistics for a user
func (h *UserHandler) GetLanguageStats(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	username := vars["username"]

	user, err := h.userService.GetUserByUsername(username)
	if err != nil {
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	languages, err := h.userService.GetLanguageStats(user.ID)
	if err != nil {
		log.Printf("Failed to get language stats for user %s: %v", username, err)
		http.Error(w, `{"error":"Failed to get language stats"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(languages)
}
