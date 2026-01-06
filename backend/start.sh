#!/bin/bash

# Backend Start Script for ROJUDGER CPP
# This script starts the backend server with the correct environment variables

set -e

echo "🚀 Starting ROJUDGER CPP Backend..."

# Load environment variables from .env file if it exists
if [ -f .env ]; then
    echo "📝 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Set defaults if not provided
export PORT=${PORT:-8083}
export DB_HOST=${DB_HOST:-localhost}
export DB_PORT=${DB_PORT:-5432}
export DB_USER=${DB_USER:-rojudger}
export DB_PASSWORD=${DB_PASSWORD:-rojudger_password}
export DB_NAME=${DB_NAME:-rojudger_cpp}
export DB_SSLMODE=${DB_SSLMODE:-disable}
export JWT_SECRET=${JWT_SECRET:-dev-secret-key-change-in-production}

# Check if binary exists
if [ ! -f bin/server ]; then
    echo "📦 Binary not found. Building..."
    go build -o bin/server ./cmd/server
    if [ $? -ne 0 ]; then
        echo "❌ Build failed!"
        exit 1
    fi
    echo "✅ Build successful!"
fi

# Start the server
echo "🎯 Starting server on port $PORT..."
echo "   Database: $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""

./bin/server
