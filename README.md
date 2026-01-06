# 💻 Code Practice Platform

A LeetCode-style coding practice platform with real-time code execution powered by **ROJUDGER**.

---

## 🎯 Features

- ✅ **Real Code Execution** - Execute code in Python, JavaScript, C++, Java, and Go
- ✅ **Test Case Evaluation** - Automatically validate solutions against test cases
- ✅ **Multiple Languages** - Support for 5+ programming languages
- ✅ **Retro UI** - Classic Mac OS System 7 inspired interface
- ✅ **Practice Problems** - Browse and solve coding challenges
- ✅ **Competitive Matches** - Challenge other programmers (coming soon)

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ ← React + TypeScript + Vite
│  (Port 5173)│
└──────┬──────┘
       │ API Calls
       ↓
┌─────────────┐
│  Backend    │ ← Go + Gorilla Mux
│  (Port 8080)│
└──────┬──────┘
       │ Problems API
       │
       │ Code Execution →
       ↓
┌─────────────┐
│  ROJUDGER   │ ← Code Execution Engine
│  (Port 8080)│ ← Judge0-compatible API
└─────────────┘
```

---

## 📋 Prerequisites

- **Node.js** 18+ (for frontend)
- **Go** 1.21+ (for backend)
- **Docker** (for ROJUDGER code execution)
- **Redis** (for ROJUDGER queue)
- **PostgreSQL** or **SQLite** (for ROJUDGER database)

---

## 🚀 Quick Start

### 1. Setup ROJUDGER (Code Execution Engine)

```bash
# Navigate to ROJUDGER
cd ../ROJUDGER

# Start Redis (required for queue)
docker run -d -p 6379:6379 redis:7-alpine

# Build ROJUDGER
go build -o api ./cmd/api
go build -o worker ./cmd/worker

# Start API server (in terminal 1)
export USE_QUEUE=true
./api

# Start worker (in terminal 2)
./worker
```

ROJUDGER API will be available at `http://localhost:8080`

### 2. Setup Backend (Problems API)

```bash
# Navigate to backend
cd CPP/backend

# Install dependencies
go mod download

# Run backend server
go run cmd/server/main.go
```

Backend API will be available at `http://localhost:8080/api`

### 3. Setup Frontend

```bash
# Navigate to frontend
cd CPP/frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## 🔧 Configuration

### Frontend Environment Variables

Create `CPP/frontend/.env`:

```bash
# Backend API (for problems)
VITE_API_URL=http://localhost:8080/api

# ROJUDGER API (for code execution)
VITE_ROJUDGER_API_URL=http://localhost:8080/api/v1
```

### Backend Configuration

The backend serves sample problems with test cases. No additional configuration needed for development.

### ROJUDGER Configuration

See `../ROJUDGER/README.md` for detailed configuration options.

**Important:** Make sure ROJUDGER is running before executing code!

---

## 📚 How It Works

### Code Execution Flow

```
1. User writes code in the editor
2. User clicks "Run Code" or "Submit"
3. Frontend calls ROJUDGER API with:
   - Source code
   - Language ID
   - Test case input
4. ROJUDGER queues the submission
5. Worker picks up the job
6. Worker executes code in Docker container
7. Worker returns results (stdout, stderr, exit code, time, memory)
8. Frontend displays results to user
```

### Test Case Evaluation

For each test case:
- Input is passed via stdin
- Expected output is compared with actual output
- Results are shown: ✓ PASSED or ✗ FAILED

---

## 💡 Usage Examples

### Running a Problem

1. Go to `http://localhost:5173`
2. Click "Practice Problems"
3. Select a problem (e.g., "Two Sum")
4. Write your solution in the editor
5. Click "Run Code" to test with sample inputs
6. Click "Submit" to validate against all test cases

### Supported Languages

| Language   | ROJUDGER ID | Status |
|------------|-------------|--------|
| Python 3   | 71          | ✅     |
| JavaScript | 63          | ✅     |
| C++        | 54          | ✅     |
| Java       | 62          | ✅     |
| Go         | 60          | ✅     |

---

## 🧪 Testing

### Test ROJUDGER Integration

```bash
# Quick test
curl -X POST http://localhost:8080/api/v1/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "language_id": 71,
    "source_code": "print(\"Hello ROJUDGER!\")"
  }'

# Get result
curl http://localhost:8080/api/v1/submissions/{submission_id}
```

### Test Frontend

```bash
cd CPP/frontend
npm run build
npm run preview
```

---

## 📁 Project Structure

```
CPP/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── features/
│   │   │   ├── editor/      # Code editor & execution
│   │   │   │   ├── components/
│   │   │   │   ├── pages/
│   │   │   │   └── services/
│   │   │   │       └── rojudgerService.ts  # ROJUDGER API client
│   │   │   ├── problems/    # Problem listing
│   │   │   └── match/       # Competitive matches
│   │   ├── pages/
│   │   └── routes/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/                  # Go backend
    ├── cmd/
    │   └── server/
    ├── internal/
    │   ├── handlers/         # HTTP handlers
    │   ├── models/           # Data models
    │   └── services/         # Business logic
    │       └── sample_problems.go  # Sample problems with test cases
    └── go.mod
```

---

## 🔍 API Endpoints

### Backend (Problems)

```
GET  /api/problems          - List all problems
GET  /api/problems/:slug    - Get problem details with test cases
GET  /api/health            - Health check
```

### ROJUDGER (Code Execution)

```
POST /api/v1/submissions    - Submit code for execution
GET  /api/v1/submissions/:id - Get submission result
GET  /api/v1/languages      - List supported languages
```

---

## 🐛 Troubleshooting

### "Failed to submit code" Error

**Problem:** ROJUDGER API is not running

**Solution:**
```bash
cd ../ROJUDGER
# Make sure both API and worker are running
./api &
./worker &
```

### "Submission timeout" Error

**Problem:** Worker is not processing jobs

**Solution:**
```bash
# Check Redis is running
docker ps | grep redis

# Check worker logs
cd ../ROJUDGER
./worker
```

### Code executes but shows wrong results

**Problem:** Test case format mismatch

**Solution:** Check that your code:
- Reads input from stdin
- Prints output to stdout
- Output format matches expected format exactly

### Frontend shows "Loading problems..."

**Problem:** Backend is not running

**Solution:**
```bash
cd CPP/backend
go run cmd/server/main.go
```

---

## 🎨 Sample Problems Included

1. **Two Sum** (Easy) - Array, Hash Table
2. **Add Two Numbers** (Medium) - Linked List, Math
3. **Longest Substring Without Repeating Characters** (Medium) - Hash Table, Sliding Window
4. **Reverse Integer** (Medium) - Math
5. **Palindrome Number** (Easy) - Math

Each problem includes:
- Full description
- Examples with explanations
- 3-5 test cases
- Multiple language support

---

## 🚧 Roadmap

- [ ] User authentication & profiles
- [ ] Save submission history
- [ ] Leaderboards & rankings
- [ ] Competitive match system
- [ ] More practice problems
- [ ] Discussion forum
- [ ] Solution explanations
- [ ] Video walkthroughs

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **ROJUDGER** - Code execution engine (based on Judge0 architecture)
- **LeetCode** - Inspiration for problem format
- **System 7** - Classic Mac OS UI design

---

## 📞 Support

If you encounter issues:

1. Check this README
2. Check ROJUDGER documentation: `../ROJUDGER/README.md`
3. Check ROJUDGER webhook guide: `../ROJUDGER/docs/WEBHOOKS.md`
4. Open an issue on GitHub

---

**Built with ❤️ using React, Go, and ROJUDGER**

*Happy Coding! 🚀*