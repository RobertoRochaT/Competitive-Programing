package services

import (
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"time"

	"github.com/RobertoRochaT/CPP-backend/internal/database"
	"github.com/RobertoRochaT/CPP-backend/internal/models"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	db        *database.Database
	jwtSecret []byte
}

func NewAuthService(db *database.Database, jwtSecret string) *AuthService {
	// If no secret provided, generate one (for development)
	secret := []byte(jwtSecret)
	if jwtSecret == "" {
		secret = make([]byte, 32)
		rand.Read(secret)
		fmt.Println("⚠️  Warning: Using random JWT secret (for development only)")
	}

	return &AuthService{
		db:        db,
		jwtSecret: secret,
	}
}

type Claims struct {
	UserID   int    `json:"userId"`
	Username string `json:"username"`
	Email    string `json:"email"`
	jwt.RegisteredClaims
}

// Register creates a new user
func (s *AuthService) Register(req models.RegisterRequest) (*models.User, error) {
	// Validate input
	if req.Username == "" || req.Email == "" || req.Password == "" {
		return nil, errors.New("username, email, and password are required")
	}

	if len(req.Password) < 6 {
		return nil, errors.New("password must be at least 6 characters")
	}

	// Check if username or email already exists
	var exists bool
	err := s.db.DB.QueryRow(
		"SELECT EXISTS(SELECT 1 FROM users WHERE username = $1 OR email = $2)",
		req.Username, req.Email,
	).Scan(&exists)
	if err != nil {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if exists {
		return nil, errors.New("username or email already exists")
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Generate default avatar (you can use gravatar or a service)
	avatar := s.generateDefaultAvatar(req.Email)

	// Insert user
	var user models.User
	var bio, country, school sql.NullString
	err = s.db.DB.QueryRow(`
		INSERT INTO users (username, email, password_hash, full_name, avatar)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, username, email, full_name, avatar, bio, country, school, ranking, created_at, updated_at
	`, req.Username, req.Email, string(hashedPassword), req.FullName, avatar).Scan(
		&user.ID, &user.Username, &user.Email, &user.FullName, &user.Avatar,
		&bio, &country, &school, &user.Ranking, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
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

// Login authenticates a user and returns a JWT token
func (s *AuthService) Login(req models.LoginRequest) (*models.LoginResponse, error) {
	// Get user by username or email
	var user models.User
	var hashedPassword string
	var bio, country, school sql.NullString

	err := s.db.DB.QueryRow(`
		SELECT id, username, email, password_hash, full_name, avatar, bio, country, school, ranking, created_at, updated_at
		FROM users
		WHERE username = $1 OR email = $1
	`, req.UsernameOrEmail).Scan(
		&user.ID, &user.Username, &user.Email, &hashedPassword, &user.FullName, &user.Avatar,
		&bio, &country, &school, &user.Ranking, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, errors.New("invalid username/email or password")
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

	// Verify password
	err = bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(req.Password))
	if err != nil {
		return nil, errors.New("invalid username/email or password")
	}

	// Generate JWT token
	token, err := s.GenerateToken(&user)
	if err != nil {
		return nil, fmt.Errorf("failed to generate token: %w", err)
	}

	return &models.LoginResponse{
		Token: token,
		User:  user,
	}, nil
}

// GenerateToken creates a JWT token for a user
func (s *AuthService) GenerateToken(user *models.User) (string, error) {
	// Token expires in 7 days
	expirationTime := time.Now().Add(7 * 24 * time.Hour)

	claims := &Claims{
		UserID:   user.ID,
		Username: user.Username,
		Email:    user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "rojudger-cpp",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(s.jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// ValidateToken validates a JWT token and returns the claims
func (s *AuthService) ValidateToken(tokenString string) (*Claims, error) {
	claims := &Claims{}

	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		// Verify signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.jwtSecret, nil
	})

	if err != nil {
		return nil, err
	}

	if !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

// GetUserByID retrieves a user by ID
func (s *AuthService) GetUserByID(userID int) (*models.User, error) {
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

// generateDefaultAvatar creates a default avatar URL (using gravatar or initials)
func (s *AuthService) generateDefaultAvatar(email string) string {
	// Use UI Avatars service for default avatars
	encoded := base64.URLEncoding.EncodeToString([]byte(email))
	if len(encoded) > 2 {
		initials := string(encoded[0]) + string(encoded[1])
		return fmt.Sprintf("https://ui-avatars.com/api/?name=%s&background=random&size=200", initials)
	}
	return "https://ui-avatars.com/api/?name=U&background=random&size=200"
}
