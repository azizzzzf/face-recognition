#!/bin/bash

echo "🚀 Setting up Face Recognition Benchmark System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Frontend setup
echo "📦 Setting up Frontend..."
npm install

# Fix Prisma permissions
if [ -f "node_modules/.bin/prisma" ]; then
    chmod +x node_modules/.bin/prisma
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
node_modules/.bin/prisma generate

# Setup environment file
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "📝 Created .env.local - Please update with your Supabase credentials"
fi

# Backend setup
echo "🐍 Setting up Backend..."
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Setup backend environment file
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "📝 Created backend/.env - Please update with your database credentials"
fi

cd ..

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase credentials"
echo "2. Update backend/.env with your database credentials"
echo "3. Start the frontend: npm run dev"
echo "4. Start the backend: cd backend && source venv/bin/activate && python main.py"
echo ""
echo "Access the application:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
