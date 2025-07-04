# MovPlay Quick Start Script for Windows
Write-Host "🎬 Starting MovPlay Development Environment..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js v18+ first." -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Write-Host "🔧 Setting up backend..." -ForegroundColor Yellow
Set-Location backend

# Check if .env exists, if not copy from example
if (-not (Test-Path .env)) {
    Write-Host "📋 Creating .env file from example..." -ForegroundColor Blue
    Copy-Item .env.example .env
    Write-Host "⚠️  Please edit backend/.env file with your MongoDB URI and TMDB API key" -ForegroundColor Yellow
}

# Install backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
npm install

# Start backend server in background
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock { Set-Location $using:PWD; npm run dev }

# Navigate to frontend directory
Set-Location ../frontend

# Check if .env exists, if not copy from example
if (-not (Test-Path .env)) {
    Write-Host "📋 Creating frontend .env file from example..." -ForegroundColor Blue
    Copy-Item .env.example .env
}

# Install frontend dependencies
Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
npm install

# Wait a moment for backend to start
Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep 5

# Start frontend server
Write-Host "🚀 Starting frontend server..." -ForegroundColor Green
Write-Host "📱 Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host "🔌 Backend API will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Yellow

try {
    npm run dev
} finally {
    Write-Host "🛑 Shutting down servers..." -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
}
