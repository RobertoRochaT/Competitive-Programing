package main

import (
	"log"
	"net/http"
	"os"

	"math/rand"
	"time"

	"github.com/RobertoRochaT/CPP-backend/internal/database"
	"github.com/RobertoRochaT/CPP-backend/internal/handlers"
	"github.com/RobertoRochaT/CPP-backend/internal/middleware"
	"github.com/RobertoRochaT/CPP-backend/internal/services"
	"github.com/gorilla/mux"
)

func main() {
	// Initialize random seed for PvP code generation
	rand.Seed(time.Now().UnixNano())

	// Initialize database
	db, err := database.NewDatabase()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Get JWT secret from environment
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		log.Println("⚠️  Warning: JWT_SECRET not set, using random secret (development only)")
	}

	// Initialize services
	leetcodeService := services.NewLeetCodeService()
	authService := services.NewAuthService(db, jwtSecret)
	userService := services.NewUserService(db)
	submissionService := services.NewSubmissionService(db)
	pvpService := services.NewPvPService(db)

	// Initialize handlers
	problemHandler := handlers.NewProblemHandler(leetcodeService)
	authHandler := handlers.NewAuthHandler(authService)
	userHandler := handlers.NewUserHandler(userService)
	submissionHandler := handlers.NewSubmissionHandler(submissionService, userService, leetcodeService)
	pvpHandler := handlers.NewPvPHandler(pvpService)

	// Create router
	r := mux.NewRouter()

	// Apply global middleware
	r.Use(middleware.CORS)

	// API routes
	api := r.PathPrefix("/api").Subrouter()

	// Health check
	api.HandleFunc("/health", problemHandler.HealthCheck).Methods("GET", "OPTIONS")

	// Public routes (no authentication required)
	public := api.PathPrefix("").Subrouter()
	public.HandleFunc("/auth/register", authHandler.Register).Methods("POST", "OPTIONS")
	public.HandleFunc("/auth/login", authHandler.Login).Methods("POST", "OPTIONS")
	public.HandleFunc("/auth/validate", authHandler.ValidateToken).Methods("POST", "OPTIONS")
	public.HandleFunc("/problems", problemHandler.GetProblems).Methods("GET", "OPTIONS")
	public.HandleFunc("/problems/{slug}", problemHandler.GetProblemBySlug).Methods("GET", "OPTIONS")
	public.HandleFunc("/leaderboard", userHandler.GetLeaderboard).Methods("GET", "OPTIONS")
	public.HandleFunc("/submissions/recent", submissionHandler.GetRecentSubmissions).Methods("GET", "OPTIONS")
	public.HandleFunc("/users/{username}", userHandler.GetProfile).Methods("GET", "OPTIONS")
	public.HandleFunc("/users/{username}/stats", userHandler.GetUserStats).Methods("GET", "OPTIONS")
	public.HandleFunc("/users/{username}/solved", userHandler.GetSolvedProblems).Methods("GET", "OPTIONS")
	public.HandleFunc("/users/{username}/submissions", submissionHandler.GetUserSubmissions).Methods("GET", "OPTIONS")
	public.HandleFunc("/users/{username}/languages", userHandler.GetLanguageStats).Methods("GET", "OPTIONS")

	// Protected routes (authentication required)
	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.AuthMiddleware(authService))

	// Auth routes (authenticated)
	protected.HandleFunc("/auth/me", authHandler.GetMe).Methods("GET", "OPTIONS")

	// User routes
	protected.HandleFunc("/me/profile", userHandler.GetMyProfile).Methods("GET", "OPTIONS")
	protected.HandleFunc("/me/profile", userHandler.UpdateProfile).Methods("PUT", "OPTIONS")

	// Submission routes
	protected.HandleFunc("/submissions", submissionHandler.CreateSubmission).Methods("POST", "OPTIONS")
	protected.HandleFunc("/submissions/{id}", submissionHandler.GetSubmission).Methods("GET", "OPTIONS")
	protected.HandleFunc("/submissions/{id}", submissionHandler.UpdateSubmissionResult).Methods("PUT", "OPTIONS")
	protected.HandleFunc("/submissions/{id}", submissionHandler.DeleteSubmission).Methods("DELETE", "OPTIONS")
	protected.HandleFunc("/me/submissions", submissionHandler.GetMySubmissions).Methods("GET", "OPTIONS")
	protected.HandleFunc("/me/submissions/stats", submissionHandler.GetSubmissionStats).Methods("GET", "OPTIONS")
	protected.HandleFunc("/problems/{slug}/submissions", submissionHandler.GetProblemSubmissions).Methods("GET", "OPTIONS")

	// PvP routes (protected)
	protected.HandleFunc("/pvp/sessions", pvpHandler.CreateSession).Methods("POST", "OPTIONS")
	protected.HandleFunc("/pvp/sessions/join", pvpHandler.JoinSession).Methods("POST", "OPTIONS")
	protected.HandleFunc("/pvp/sessions/{id}/join", pvpHandler.JoinSessionByID).Methods("POST", "OPTIONS")
	protected.HandleFunc("/pvp/my-sessions", pvpHandler.GetUserSessions).Methods("GET", "OPTIONS")
	protected.HandleFunc("/pvp/sessions/{id}/start", pvpHandler.StartSession).Methods("POST", "OPTIONS")
	protected.HandleFunc("/pvp/sessions/{id}/submit", pvpHandler.SubmitSolution).Methods("POST", "OPTIONS")

	// PvP routes (public - can view sessions and leaderboard)
	public.HandleFunc("/pvp/public", pvpHandler.GetPublicSessions).Methods("GET", "OPTIONS")
	public.HandleFunc("/pvp/sessions/id/{id}", pvpHandler.GetSessionByID).Methods("GET", "OPTIONS")
	public.HandleFunc("/pvp/sessions/{code}", pvpHandler.GetSessionByCode).Methods("GET", "OPTIONS")
	public.HandleFunc("/pvp/sessions/{id}/leaderboard", pvpHandler.GetLeaderboard).Methods("GET", "OPTIONS")
	public.HandleFunc("/pvp/sessions/{id}/problems", pvpHandler.GetSessionProblems).Methods("GET", "OPTIONS")

	// Get port from environment
	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	log.Printf("🚀 Server starting on port %s", port)
	log.Printf("📡 API available at http://localhost:%s/api", port)
	log.Printf("🏥 Health check at http://localhost:%s/api/health", port)
	log.Printf("🔐 Auth endpoints:")
	log.Printf("   - POST /api/auth/register")
	log.Printf("   - POST /api/auth/login")
	log.Printf("   - GET  /api/auth/me (protected)")
	log.Printf("👤 User endpoints:")
	log.Printf("   - GET  /api/users/{username}")
	log.Printf("   - GET  /api/me/profile (protected)")
	log.Printf("   - PUT  /api/me/profile (protected)")
	log.Printf("📝 Submission endpoints:")
	log.Printf("   - POST /api/submissions (protected)")
	log.Printf("   - GET  /api/me/submissions (protected)")
	log.Printf("   - GET  /api/submissions/{id}")
	log.Printf("🏆 Leaderboard: GET /api/leaderboard")
	log.Printf("⚔️  PvP endpoints:")
	log.Printf("   - POST /api/pvp/sessions (protected)")
	log.Printf("   - POST /api/pvp/sessions/join (protected)")
	log.Printf("   - POST /api/pvp/sessions/{id}/join (protected)")
	log.Printf("   - GET  /api/pvp/public (public sessions list)")
	log.Printf("   - GET  /api/pvp/sessions/{code}")
	log.Printf("   - GET  /api/pvp/sessions/{id}/leaderboard")

	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
