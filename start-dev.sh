#!/bin/bash

# ROJUDGER CPP Development Startup Script
# This script starts both backend and frontend servers

set -e

echo "🚀 Starting ROJUDGER CPP Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${YELLOW}📊 Checking PostgreSQL...${NC}"
if ! pg_isready -q; then
    echo -e "${RED}❌ PostgreSQL is not running!${NC}"
    echo "Please start PostgreSQL and try again."
    echo "On macOS: brew services start postgresql"
    echo "On Linux: sudo systemctl start postgresql"
    exit 1
fi
echo -e "${GREEN}✅ PostgreSQL is running${NC}"

# Check if database exists
echo -e "${YELLOW}📊 Checking database...${NC}"
if ! psql -lqt | cut -d \| -f 1 | grep -qw rojudger_cpp; then
    echo -e "${YELLOW}⚠️  Database 'rojudger_cpp' not found. Creating...${NC}"
    createdb rojudger_cpp
    echo -e "${GREEN}✅ Database created${NC}"

    echo -e "${YELLOW}📝 Initializing schema...${NC}"
    if [ -f "backend/init_db.sql" ]; then
        psql -d rojudger_cpp -f backend/init_db.sql
        echo -e "${GREEN}✅ Schema initialized${NC}"
    else
        echo -e "${YELLOW}⚠️  init_db.sql not found, skipping schema initialization${NC}"
    fi
else
    echo -e "${GREEN}✅ Database exists${NC}"
fi

# Function to kill background processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down servers...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo -e "\n${YELLOW}🔧 Starting Backend Server...${NC}"
cd backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found, copying from .env.example${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
    fi
fi

# Build backend
echo -e "${YELLOW}🔨 Building backend...${NC}"
go build -o bin/server ./cmd/server
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend built successfully${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

# Start backend in background
./bin/server &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started on port 8083 (PID: $BACKEND_PID)${NC}"

cd ..

# Wait a bit for backend to start
sleep 2

# Start Frontend
echo -e "\n${YELLOW}🎨 Starting Frontend Server...${NC}"
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env not found, creating default${NC}"
    echo "VITE_API_URL=http://localhost:8083/api" > .env
    echo "VITE_ROJUDGER_API_URL=http://localhost:8080/api/v1" >> .env
fi

# Start frontend in background
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

cd ..

# Print status
echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         🎉 ROJUDGER CPP is now running! 🎉                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${YELLOW}Backend:${NC}  http://localhost:8083/api"
echo -e "${YELLOW}Frontend:${NC} http://localhost:5173"
echo -e "${YELLOW}Health:${NC}   http://localhost:8083/api/health"
echo -e ""
echo -e "${YELLOW}📝 API Endpoints:${NC}"
echo -e "   POST   /api/auth/register"
echo -e "   POST   /api/auth/login"
echo -e "   GET    /api/auth/me"
echo -e "   GET    /api/users/:username"
echo -e "   GET    /api/leaderboard"
echo -e "   GET    /api/problems"
echo -e ""
echo -e "${RED}Press Ctrl+C to stop all servers${NC}"
echo -e ""

# Wait for all background jobs
wait
