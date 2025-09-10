#!/bin/bash

echo "Starting Face Recognition Backend..."

if [ ! -d "backend" ]; then
    echo "Error: Backend directory not found. Please run setup first."
    exit 1
fi

cd backend

if [ ! -d "venv" ]; then
    echo "Error: Virtual environment not found. Please run setup first."
    exit 1
fi

echo "Activating virtual environment..."
source venv/bin/activate

if ! python -c "import fastapi, uvicorn, insightface" 2>/dev/null; then
    echo "Warning: Some dependencies might be missing. Installing requirements..."
    pip install -r requirements.txt
fi

if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create .env file with DATABASE_URL configuration"
    echo "Check the main .env file in project root for reference"
    echo "Then create backend/.env with your database URL"
    exit 1
fi

echo "Checking InsightFace models..."
python download_models.py

if [ $? -ne 0 ]; then
    echo "Error: Failed to download InsightFace models"
    echo "You can continue, but ArcFace features may timeout on first use"
    echo "Press Ctrl+C to stop, or wait 10 seconds to continue anyway..."
    sleep 10
fi

echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "Backend will handle ArcFace face recognition"
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
