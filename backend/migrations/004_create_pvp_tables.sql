-- PvP Sessions (lobbies)
CREATE TABLE IF NOT EXISTS pvp_sessions (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    admin_user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    topics TEXT[] DEFAULT '{}',
    difficulty VARCHAR(20) DEFAULT 'mixed',
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'finished')),
    max_problems INT NOT NULL DEFAULT 5,
    duration INT NOT NULL DEFAULT 60, -- minutos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pvp_sessions_code ON pvp_sessions(code);
CREATE INDEX IF NOT EXISTS idx_pvp_sessions_status ON pvp_sessions(status);
CREATE INDEX IF NOT EXISTS idx_pvp_sessions_admin ON pvp_sessions(admin_user_id);

-- Participantes en sesiones PvP
CREATE TABLE IF NOT EXISTS pvp_participants (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES pvp_sessions(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    score INT DEFAULT 0,
    problems_solved INT DEFAULT 0,
    total_penalty INT DEFAULT 0, -- en minutos
    UNIQUE(session_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_pvp_participants_session ON pvp_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_pvp_participants_user ON pvp_participants(user_id);

-- Problemas asignados a cada sesión (problem_id es de LeetCode API)
CREATE TABLE IF NOT EXISTS pvp_problems (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES pvp_sessions(id) ON DELETE CASCADE,
    problem_id BIGINT NOT NULL, -- ID from LeetCode API
    problem_slug VARCHAR(255) NOT NULL, -- slug from LeetCode
    problem_title VARCHAR(255) NOT NULL, -- title from LeetCode
    problem_difficulty VARCHAR(50) NOT NULL, -- difficulty from LeetCode
    letter VARCHAR(1) NOT NULL, -- A, B, C, D, etc.
    points INT DEFAULT 100,
    UNIQUE(session_id, problem_id),
    UNIQUE(session_id, letter)
);

CREATE INDEX IF NOT EXISTS idx_pvp_problems_session ON pvp_problems(session_id);
CREATE INDEX IF NOT EXISTS idx_pvp_problems_slug ON pvp_problems(problem_slug);

-- Submissions en sesiones PvP
CREATE TABLE IF NOT EXISTS pvp_submissions (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES pvp_sessions(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id BIGINT NOT NULL, -- ID from LeetCode API
    problem_slug VARCHAR(255) NOT NULL,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    runtime INT, -- ms
    memory INT, -- KB
    passed_tests INT DEFAULT 0,
    total_tests INT DEFAULT 0,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    time_penalty INT DEFAULT 0, -- minutos desde el inicio de la sesión
    is_accepted BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_pvp_submissions_session ON pvp_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_pvp_submissions_user ON pvp_submissions(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_pvp_submissions_problem ON pvp_submissions(session_id, problem_id);
CREATE INDEX IF NOT EXISTS idx_pvp_submissions_status ON pvp_submissions(session_id, user_id, is_accepted);
