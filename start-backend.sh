#!/bin/bash

echo "🚀 Starting Face Recognition Benchmark Backend..."

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo "❌ Backend directory not found. Please run setup-backend.sh first."
    exit 1
fi

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-backend.sh first."
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if requirements are installed
if ! python -c "import fastapi, uvicorn, insightface" 2>/dev/null; then
    echo "⚠️  Some dependencies might be missing. Installing requirements..."
    pip install -r requirements.txt
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please copy .env.example to .env and configure DATABASE_URL"
    if [ -f ".env.example" ]; then
        echo "💡 Run: cp .env.example .env"
        echo "💡 Then edit .env with your database URL"
    fi
    exit 1
fi

# Pre-download InsightFace models if needed
echo "🧠 Checking InsightFace models..."
python download_models.py

if [ $? -ne 0 ]; then
    echo "❌ Failed to download InsightFace models"
    echo "💡 You can continue, but ArcFace features may timeout on first use"
    echo "⏱️  Press Ctrl+C to stop, or wait 10 seconds to continue anyway..."
    sleep 10
fi

# Start the FastAPI server
echo ""
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📊 Backend will handle ArcFace face recognition"
echo "🔄 Press Ctrl+C to stop the server"
echo "📝 Logs will show model initialization progress"
echo ""

python main.py
