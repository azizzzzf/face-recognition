#!/bin/bash

echo "Setting up Face Recognition System..."

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "Prerequisites check passed"

echo "Setting up Frontend..."
npm install

if [ -f "node_modules/.bin/prisma" ]; then
    chmod +x node_modules/.bin/prisma
fi

echo "Generating Prisma client..."
node_modules/.bin/prisma generate

if [ ! -f ".env" ]; then
    echo "Warning: .env file not found in project root"
    echo "Please ensure .env file exists with proper configuration"
else
    echo "OK: .env file found"
fi

echo "Setting up Backend..."
cd backend

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Warning: backend/.env file not found"
    echo "Please create backend/.env with database credentials (check main .env for reference)"
else
    echo "OK: backend/.env file found"
fi

cd ..

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables in .env file"
echo "2. Create backend/.env with database credentials if needed"
echo "3. Start development: pnpm run dev (or ./scripts/dev.sh)"
echo "4. Or start individually:"
echo "   - Frontend: pnpm dev --filter=@face-api-attendance/web"
echo "   - Backend: cd apps/api && source venv/bin/activate && python main.py"
echo ""
echo "Access the application:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Docs: http://localhost:8000/docs"
