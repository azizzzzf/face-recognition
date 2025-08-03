#!/bin/bash

echo "🎭 InsightFace Model Downloader"
echo "================================"

# Check if we're in the backend directory
if [ ! -f "download_models.py" ]; then
    echo "❌ Please run this from the backend directory"
    echo "💡 Try: cd backend && ./download-models.sh"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found."
    echo "💡 Please run setup-backend.sh first to create the virtual environment"
    exit 1
fi

# Activate virtual environment
echo "📦 Activating virtual environment..."
source venv/bin/activate

# Check if InsightFace is installed
if ! python -c "import insightface" 2>/dev/null; then
    echo "❌ InsightFace not installed."
    echo "📦 Installing InsightFace..."
    pip install insightface
fi

# Download models
echo "⬇️  Starting model download..."
python download_models.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Success! InsightFace models are ready."
    echo "🚀 You can now start the backend server without timeout issues."
else
    echo ""
    echo "❌ Model download failed."
    echo "🔧 Please check the error messages above."
    exit 1
fi
