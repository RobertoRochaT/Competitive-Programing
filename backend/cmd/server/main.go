package main

import (
    "log"
    "net/http"
    "os"
    "github.com/gorilla/mux"
    "github.com/RobertoRochaT/cpp-backend/internal/handlers"
    "github.com/RobertoRochaT/cpp-backend/internal/middleware"
    "github.com/RobertoRochaT/cpp-backend/internal/services"
)

func main() {
    // Inicializar servicios
    leetcodeService := services.NewLeetCodeService()

    // Inicializar handlers
    problemHandler := handlers.NewProblemHandler(leetcodeService)

    // Crear router
    r := mux.NewRouter()

    // Aplicar middleware CORS
    r.Use(middleware.CORS)

    // Rutas
    api := r.PathPrefix("/api").Subrouter()
    api.HandleFunc("/health", problemHandler.HealthCheck).Methods("GET")
    api.HandleFunc("/problems", problemHandler.GetProblems).Methods("GET")
    api.HandleFunc("/problems/{slug}", problemHandler.GetProblemBySlug).Methods("GET")

    // Puerto del servidor
    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    log.Printf("🚀 Server starting on port %s", port)
    log.Printf("📡 API available at http://localhost:%s/api", port)
    log.Printf("🏥 Health check at http://localhost:%s/api/health", port)

    if err := http.ListenAndServe(":"+port, r); err != nil {
        log.Fatalf("Server failed to start: %v", err)
    }
}
