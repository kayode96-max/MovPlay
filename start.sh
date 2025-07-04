#!/bin/bash

# MovPlay Quick Start Script
echo "🎬 Starting MovPlay Development Environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18+ first."
    exit 1
fi

# Check if MongoDB is running (optional check)
echo "📊 Checking MongoDB connection..."

# Navigate to backend directory
echo "🔧 Setting up backend..."
cd backend

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📋 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit backend/.env file with your MongoDB URI and TMDB API key"
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Start backend server in background
echo "🚀 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Navigate to frontend directory
cd ../frontend

# Check if .env exists, if not copy from example
if [ ! -f .env ]; then
    echo "📋 Creating frontend .env file from example..."
    cp .env.example .env
fi

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Wait a moment for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend server
echo "🚀 Starting frontend server..."
npm run dev

# Cleanup function
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Trap CTRL+C and call cleanup
trap cleanup INT

# Keep script running
wait
