package database

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "github.com/lib/pq"
)

type Database struct {
	DB *sql.DB
}

func NewDatabase() (*Database, error) {
	// Get database connection parameters from environment
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "postgres"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "rojudger_cpp"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	// Build connection string
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	// Connect to database
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	database := &Database{DB: db}

	// Initialize schema
	// TEMPORARILY DISABLED: Commented out to avoid conflicts with existing tables
	// if err := database.InitSchema(); err != nil {
	// 	return nil, fmt.Errorf("failed to initialize schema: %w", err)
	// }

	log.Printf("✅ Database connected successfully: %s@%s:%s/%s", user, host, port, dbname)

	return database, nil
}

func (d *Database) InitSchema() error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id SERIAL PRIMARY KEY,
		username VARCHAR(50) UNIQUE NOT NULL,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		full_name VARCHAR(255),
		avatar TEXT,
		bio TEXT,
		country VARCHAR(100),
		school VARCHAR(255),
		ranking INTEGER DEFAULT 0,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- User statistics table
	CREATE TABLE IF NOT EXISTS user_stats (
		user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
		total_solved INTEGER DEFAULT 0,
		easy_solved INTEGER DEFAULT 0,
		medium_solved INTEGER DEFAULT 0,
		hard_solved INTEGER DEFAULT 0,
		total_submissions INTEGER DEFAULT 0,
		accepted_submissions INTEGER DEFAULT 0,
		acceptance_rate DOUBLE PRECISION DEFAULT 0.0,
		streak INTEGER DEFAULT 0,
		max_streak INTEGER DEFAULT 0,
		last_solved_at TIMESTAMP
	);

	-- Submissions table
	CREATE TABLE IF NOT EXISTS submissions (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		problem_id INTEGER NOT NULL,
		problem_slug VARCHAR(255) NOT NULL,
		problem_title VARCHAR(255) NOT NULL,
		language VARCHAR(50) NOT NULL,
		code TEXT NOT NULL,
		status VARCHAR(50) NOT NULL,
		runtime INTEGER DEFAULT 0,
		memory INTEGER DEFAULT 0,
		passed_tests INTEGER DEFAULT 0,
		total_tests INTEGER DEFAULT 0,
		error_message TEXT,
		test_results TEXT,
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);

	-- Solved problems table (to track unique solves)
	CREATE TABLE IF NOT EXISTS solved_problems (
		id SERIAL PRIMARY KEY,
		user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		problem_id INTEGER NOT NULL,
		problem_slug VARCHAR(255) NOT NULL,
		problem_title VARCHAR(255) NOT NULL,
		difficulty VARCHAR(20) NOT NULL,
		first_solved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		best_runtime INTEGER,
		best_memory INTEGER,
		UNIQUE(user_id, problem_slug)
	);

	-- Create indexes for better performance
	CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
	CREATE INDEX IF NOT EXISTS idx_submissions_problem_slug ON submissions(problem_slug);
	CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
	CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
	CREATE INDEX IF NOT EXISTS idx_solved_problems_user_id ON solved_problems(user_id);
	CREATE INDEX IF NOT EXISTS idx_solved_problems_problem_slug ON solved_problems(problem_slug);
	CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

	-- Trigger to update user_stats when a new user is created
	CREATE OR REPLACE FUNCTION create_user_stats()
	RETURNS TRIGGER AS $$
	BEGIN
		INSERT INTO user_stats (user_id) VALUES (NEW.id);
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;

	DROP TRIGGER IF EXISTS trigger_create_user_stats ON users;
	CREATE TRIGGER trigger_create_user_stats
	AFTER INSERT ON users
	FOR EACH ROW
	EXECUTE FUNCTION create_user_stats();

	-- Trigger to update updated_at on users table
	CREATE OR REPLACE FUNCTION update_updated_at_column()
	RETURNS TRIGGER AS $$
	BEGIN
		NEW.updated_at = CURRENT_TIMESTAMP;
		RETURN NEW;
	END;
	$$ LANGUAGE plpgsql;

	DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
	CREATE TRIGGER trigger_update_users_updated_at
	BEFORE UPDATE ON users
	FOR EACH ROW
	EXECUTE FUNCTION update_updated_at_column();
	`

	_, err := d.DB.Exec(schema)
	if err != nil {
		return fmt.Errorf("failed to execute schema: %w", err)
	}

	log.Println("✅ Database schema initialized successfully")
	return nil
}

func (d *Database) Close() error {
	return d.DB.Close()
}
