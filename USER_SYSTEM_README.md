# ROJUDGER User System Documentation

## Overview

This document describes the complete user authentication and profile system implemented for ROJUDGER, inspired by LeetCode and Codeforces.

## Features

### ✅ Implemented Features

1. **User Authentication**
   - User registration with email verification
   - JWT-based login system
   - Secure password hashing with bcrypt
   - Token-based authentication
   - Session management

2. **User Profiles**
   - Public user profiles with stats
   - Editable profile information (bio, country, school, avatar)
   - User ranking system
   - Profile pictures (UI Avatars integration)

3. **Statistics & Analytics**
   - Total problems solved (Easy/Medium/Hard breakdown)
   - Acceptance rate calculation
   - Solve streak tracking (current and max)
   - Language usage statistics
   - Submission activity heatmap data

4. **Submission Management**
   - Complete submission history
   - Per-problem submission tracking
   - Code viewing for solved problems
   - Test case results visualization
   - Submission filtering by status

5. **Leaderboard**
   - Global ranking based on problems solved
   - Sort by acceptance rate and total solved
   - User search and filtering

6. **Security**
   - JWT token authentication
   - Protected API routes
   - Password hashing with bcrypt
   - SQL injection prevention with parameterized queries

## Architecture

### Backend Stack
- **Language**: Go 1.25
- **Framework**: Gorilla Mux (HTTP router)
- **Database**: PostgreSQL
- **Authentication**: JWT (golang-jwt/jwt/v5)
- **Password Hashing**: bcrypt (golang.org/x/crypto)

### Frontend Stack
- **Framework**: React 18 + TypeScript
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Build Tool**: Vite

### Database Schema

#### Users Table
```sql
- id (SERIAL PRIMARY KEY)
- username (VARCHAR UNIQUE)
- email (VARCHAR UNIQUE)
- password (VARCHAR - bcrypt hashed)
- full_name (VARCHAR)
- avatar (TEXT)
- bio (TEXT)
- country (VARCHAR)
- school (VARCHAR)
- ranking (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### User Stats Table
```sql
- user_id (INTEGER FK -> users.id)
- total_solved (INTEGER)
- easy_solved (INTEGER)
- medium_solved (INTEGER)
- hard_solved (INTEGER)
- total_submissions (INTEGER)
- accepted_submissions (INTEGER)
- acceptance_rate (DOUBLE PRECISION)
- streak (INTEGER)
- max_streak (INTEGER)
- last_solved_at (TIMESTAMP)
```

#### Submissions Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK -> users.id)
- problem_id (INTEGER)
- problem_slug (VARCHAR)
- problem_title (VARCHAR)
- language (VARCHAR)
- code (TEXT)
- status (VARCHAR)
- runtime (INTEGER)
- memory (INTEGER)
- passed_tests (INTEGER)
- total_tests (INTEGER)
- error_message (TEXT)
- test_results (TEXT - JSON)
- created_at (TIMESTAMP)
```

#### Solved Problems Table
```sql
- id (SERIAL PRIMARY KEY)
- user_id (INTEGER FK -> users.id)
- problem_id (INTEGER)
- problem_slug (VARCHAR)
- problem_title (VARCHAR)
- difficulty (VARCHAR)
- first_solved_at (TIMESTAMP)
- best_runtime (INTEGER)
- best_memory (INTEGER)
- UNIQUE(user_id, problem_slug)
```

## Setup Instructions

### Prerequisites

- Go 1.25 or higher
- PostgreSQL 12 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd CPP/backend
   go mod download
   ```

2. **Setup PostgreSQL Database**
   ```bash
   # Create database
   createdb rojudger_cpp
   
   # Initialize schema
   psql -d rojudger_cpp -f init_db.sql
   ```

3. **Configure Environment Variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   Required environment variables:
   ```env
   PORT=8083
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_NAME=rojudger_cpp
   DB_SSLMODE=disable
   JWT_SECRET=your-super-secret-key-change-in-production
   ```

   **Important**: Generate a secure JWT secret for production:
   ```bash
   openssl rand -base64 32
   ```

4. **Build and Run**
   ```bash
   # Build
   go build -o bin/server ./cmd/server
   
   # Run
   ./bin/server
   
   # Or run directly
   go run ./cmd/server/main.go
   ```

   The backend will start on port 8083 (or PORT from .env)

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd CPP/frontend
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create or edit .env
   echo "VITE_API_URL=http://localhost:8083/api" > .env
   echo "VITE_ROJUDGER_API_URL=http://localhost:8080/api/v1" >> .env
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

   The frontend will start on http://localhost:5173

### Database Migration (Manual)

If you need to reset the database:
```bash
# Drop and recreate
dropdb rojudger_cpp
createdb rojudger_cpp
psql -d rojudger_cpp -f CPP/backend/init_db.sql
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }
  ```

- `POST /api/auth/login` - Login user
  ```json
  {
    "usernameOrEmail": "john_doe",
    "password": "password123"
  }
  ```
  Returns: `{ "token": "jwt_token", "user": {...} }`

- `GET /api/auth/me` - Get current user (protected)
  Headers: `Authorization: Bearer <token>`

### User Profile

- `GET /api/users/:username` - Get public profile
- `GET /api/users/:username/stats` - Get user statistics
- `GET /api/users/:username/solved` - Get solved problems
- `GET /api/users/:username/submissions` - Get user submissions
- `GET /api/users/:username/languages` - Get language stats
- `GET /api/me/profile` - Get own profile (protected)
- `PUT /api/me/profile` - Update profile (protected)
  ```json
  {
    "fullName": "John Doe",
    "bio": "Competitive programmer",
    "country": "USA",
    "school": "MIT",
    "avatar": "https://..."
  }
  ```

### Submissions

- `POST /api/submissions` - Create submission (protected)
  ```json
  {
    "problemSlug": "two-sum",
    "language": "python",
    "code": "def solution()..."
  }
  ```

- `GET /api/submissions/:id` - Get submission details
- `PUT /api/submissions/:id` - Update submission result (protected)
- `DELETE /api/submissions/:id` - Delete submission (protected)
- `GET /api/me/submissions` - Get my submissions (protected)
- `GET /api/me/submissions/stats` - Get submission stats (protected)
- `GET /api/problems/:slug/submissions` - Get problem submissions (protected)
- `GET /api/submissions/recent` - Get recent accepted submissions (public)

### Leaderboard

- `GET /api/leaderboard?limit=100` - Get top users

## Frontend Usage

### Authentication Flow

1. **Register/Login**
   - Navigate to `/register` or `/login`
   - Fill in credentials
   - Upon success, JWT token is stored in localStorage
   - User is redirected to home page

2. **Protected Routes**
   - Profile page (`/profile`)
   - Submissions page (`/submissions`)
   - Automatically redirect to login if not authenticated

3. **Logout**
   - Click logout button in navbar
   - Token is removed from localStorage
   - User state is cleared

### Using the Auth Context

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  
  if (!isAuthenticated) {
    return <div>Please login</div>;
  }
  
  return <div>Welcome {user?.username}!</div>;
}
```

### Making Authenticated API Calls

```typescript
import { userService } from '../services/userService';

// Get profile
const profile = await userService.getMyProfile();

// Update profile
await userService.updateProfile({
  fullName: "New Name",
  bio: "Updated bio"
});

// Get submissions
const submissions = await userService.getMySubmissions(1, 20);
```

## Integration with Existing Editor

To integrate submission tracking with the existing editor:

1. **After successful submission to ROJUDGER**, call:
   ```typescript
   import { userService } from '../services/userService';
   
   const submission = await userService.createSubmission({
     problemSlug: problemSlug,
     language: selectedLanguage,
     code: code
   });
   ```

2. **After execution completes**, update with results:
   ```typescript
   await userService.updateSubmissionResult(submission.id, {
     status: 'accepted', // or 'wrong_answer', etc.
     runtime: executionTime,
     memory: memoryUsed,
     passedTests: passed,
     totalTests: total,
     testResults: testCaseResults,
     difficulty: problem.difficulty
   });
   ```

3. **This will automatically**:
   - Update user statistics
   - Track solve streaks
   - Update problem-solved counts
   - Update acceptance rate
   - Add to solved problems (if first AC)

## Features in Detail

### Solve Streak Calculation

- **Streak increments** when user solves a problem on consecutive days
- **Streak resets** if more than 1 day gap between solves
- **Max streak** tracks the longest streak ever achieved
- Solving multiple problems in one day doesn't increment streak multiple times

### Acceptance Rate

```
acceptance_rate = (accepted_submissions / total_submissions) * 100
```

Updated automatically after each submission.

### Ranking System

Currently ranks users by:
1. Total problems solved (primary)
2. Acceptance rate (tiebreaker)

Future enhancement: Implement ELO-based ranking or points system.

### Language Statistics

Tracks all submissions by language (even non-accepted ones) and displays:
- Total count per language
- Percentage distribution
- Visual progress bars

## Security Considerations

### Production Checklist

- [ ] Use strong JWT secret (32+ random bytes)
- [ ] Enable HTTPS/TLS
- [ ] Set secure cookie flags if using cookies
- [ ] Implement rate limiting on auth endpoints
- [ ] Add CAPTCHA to registration
- [ ] Enable PostgreSQL SSL mode
- [ ] Validate and sanitize all inputs
- [ ] Implement password strength requirements
- [ ] Add email verification
- [ ] Implement account recovery
- [ ] Set up CORS properly for production domain
- [ ] Add logging and monitoring
- [ ] Implement session expiration and refresh tokens

### Current Security Measures

✅ Password hashing with bcrypt (cost 10)
✅ JWT token authentication
✅ SQL parameterized queries (injection prevention)
✅ CORS middleware
✅ Protected routes with authentication middleware
✅ User-specific data access controls

## Troubleshooting

### Backend won't start

1. Check PostgreSQL is running: `pg_isready`
2. Verify database exists: `psql -l | grep rojudger_cpp`
3. Check environment variables in `.env`
4. Check port 8083 is not in use: `lsof -i :8083`

### Frontend can't connect to backend

1. Verify backend is running: `curl http://localhost:8083/api/health`
2. Check `.env` has correct `VITE_API_URL`
3. Check browser console for CORS errors
4. Restart frontend dev server after changing `.env`

### Login returns 401

1. Verify user exists in database
2. Check password is correct
3. Verify JWT_SECRET is set
4. Check backend logs for detailed error

### Database connection fails

1. Check PostgreSQL service: `sudo systemctl status postgresql`
2. Verify connection string in `.env`
3. Check database exists: `psql -d rojudger_cpp -c "SELECT 1"`
4. Verify user has permissions

## Next Steps / Future Enhancements

- [ ] Add email verification for registration
- [ ] Implement password reset functionality
- [ ] Add OAuth2 login (Google, GitHub)
- [ ] Implement submissions list page
- [ ] Add submission heatmap calendar (like GitHub)
- [ ] Create dashboard with charts/graphs
- [ ] Add friend system and following
- [ ] Implement discussion/comments on problems
- [ ] Add achievements/badges system
- [ ] Implement contest mode
- [ ] Add real-time notifications
- [ ] Export submission history as PDF/CSV
- [ ] Add API rate limiting
- [ ] Implement caching (Redis)
- [ ] Add full-text search for users/problems
- [ ] Mobile responsive improvements

## Contributing

When adding new features:

1. Update database schema in `internal/database/database.go`
2. Add migrations to `init_db.sql`
3. Create models in `internal/models/`
4. Implement services in `internal/services/`
5. Add handlers in `internal/handlers/`
6. Register routes in `cmd/server/main.go`
7. Update TypeScript types in `frontend/src/types/`
8. Create/update frontend services
9. Add UI components and pages
10. Update this README

## License

[Your License Here]

## Support

For issues or questions, please create an issue on GitHub or contact the development team.