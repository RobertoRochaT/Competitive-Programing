package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/RobertoRochaT/CPP-backend/internal/middleware"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/RobertoRochaT/CPP-backend/internal/services"
)

type AuthHandler struct {
	authService *services.AuthService
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Register handles user registration
func (h *AuthHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req models.RegisterRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode register request: %v", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Create user
	user, err := h.authService.Register(req)
	if err != nil {
		log.Printf("Failed to register user: %v", err)
		http.Error(w, `{"error":"`+err.Error()+`"}`, http.StatusBadRequest)
		return
	}

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		log.Printf("Failed to generate token: %v", err)
		http.Error(w, `{"error":"Failed to generate authentication token"}`, http.StatusInternalServerError)
		return
	}

	// Return response
	response := models.LoginResponse{
		Token: token,
		User:  *user,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)

	log.Printf("User registered successfully: %s (ID: %d)", user.Username, user.ID)
}

// Login handles user authentication
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Failed to decode login request: %v", err)
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Authenticate user
	response, err := h.authService.Login(req)
	if err != nil {
		log.Printf("Login failed for %s: %v", req.UsernameOrEmail, err)
		http.Error(w, `{"error":"Invalid username/email or password"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)

	log.Printf("User logged in successfully: %s (ID: %d)", response.User.Username, response.User.ID)
}

// GetMe returns the current authenticated user
func (h *AuthHandler) GetMe(w http.ResponseWriter, r *http.Request) {
	// Get user from context (set by auth middleware)
	claims, ok := middleware.GetUserFromContext(r)
	if !ok {
		http.Error(w, `{"error":"Unauthorized"}`, http.StatusUnauthorized)
		return
	}

	// Get full user details
	user, err := h.authService.GetUserByID(claims.UserID)
	if err != nil {
		log.Printf("Failed to get user by ID %d: %v", claims.UserID, err)
		http.Error(w, `{"error":"User not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(user)
}

// ValidateToken validates a JWT token
func (h *AuthHandler) ValidateToken(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Token string `json:"token"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"Invalid request body"}`, http.StatusBadRequest)
		return
	}

	claims, err := h.authService.ValidateToken(req.Token)
	if err != nil {
		http.Error(w, `{"error":"Invalid or expired token"}`, http.StatusUnauthorized)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"valid":    true,
		"userId":   claims.UserID,
		"username": claims.Username,
		"email":    claims.Email,
	})
}
