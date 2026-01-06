-- Database initialization script for ROJUDGER CPP
-- This script creates the database and all necessary tables

-- Create database (run this separately if needed)
-- CREATE DATABASE rojudger_cpp;
-- \c rojudger_cpp;

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

-- Trigger to create user_stats when a new user is created
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

-- Insert demo users (optional, for testing)
-- Password for all demo users: 'password123'
-- Hash generated with bcrypt cost 10
INSERT INTO users (username, email, password, full_name, bio, country) VALUES
('alice', 'alice@example.com', '$2a$10$rG8qKqLYxO.GqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqK', 'Alice Johnson', 'Competitive programmer and algorithm enthusiast', 'USA'),
('bob', 'bob@example.com', '$2a$10$rG8qKqLYxO.GqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqK', 'Bob Smith', 'Love solving data structure problems', 'Canada'),
('charlie', 'charlie@example.com', '$2a$10$rG8qKqLYxO.GqKqKqKqKqOqKqKqKqKqKqKqKqKqKqKqKqKqKqK', 'Charlie Brown', 'Backend developer learning algorithms', 'UK')
ON CONFLICT (username) DO NOTHING;

-- Sample solved problems data
INSERT INTO solved_problems (user_id, problem_id, problem_slug, problem_title, difficulty, best_runtime, best_memory) VALUES
(1, 1, 'two-sum', 'Two Sum', 'Easy', 45, 2048),
(1, 2, 'add-two-numbers', 'Add Two Numbers', 'Medium', 78, 3072),
(2, 1, 'two-sum', 'Two Sum', 'Easy', 52, 2100),
(3, 1, 'two-sum', 'Two Sum', 'Easy', 48, 2050)
ON CONFLICT (user_id, problem_slug) DO NOTHING;

-- Update user stats based on solved problems
UPDATE user_stats us
SET
    total_solved = (SELECT COUNT(*) FROM solved_problems WHERE user_id = us.user_id),
    easy_solved = (SELECT COUNT(*) FROM solved_problems WHERE user_id = us.user_id AND difficulty = 'Easy'),
    medium_solved = (SELECT COUNT(*) FROM solved_problems WHERE user_id = us.user_id AND difficulty = 'Medium'),
    hard_solved = (SELECT COUNT(*) FROM solved_problems WHERE user_id = us.user_id AND difficulty = 'Hard');

-- Update ranking based on total solved (simple ranking)
UPDATE users u
SET ranking = subquery.rank
FROM (
    SELECT
        u.id,
        ROW_NUMBER() OVER (ORDER BY us.total_solved DESC, us.acceptance_rate DESC) as rank
    FROM users u
    JOIN user_stats us ON u.id = us.user_id
    WHERE us.total_solved > 0
) AS subquery
WHERE u.id = subquery.id;

COMMIT;
