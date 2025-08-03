# Face Recognition Benchmark System

A comprehensive web application that compares the performance of Face-api.js (client-side) vs ArcFace (server-side) face recognition models with multi-angle face capture for enhanced accuracy.

## Features

- **Multi-Angle Face Registration**: Capture faces from 5 different angles (front, left, right, up, down) for improved recognition accuracy
- **Dual Model Support**: 
  - Face-api.js (client-side processing)
  - ArcFace (server-side processing with FastAPI)
- **Real-time Benchmarking**: Compare accuracy and latency between both models
- **Performance Metrics**: Track and store accuracy and latency results in database
- **Modern UI**: Built with Next.js and shadcn/ui components

## Tech Stack

### Frontend:
- Next.js 15.3.2
- React 19
- TypeScript
- shadcn/ui components
- Tailwind CSS
- face-api.js for client-side face recognition

### Backend:
- FastAPI (Python)
- ArcFace (InsightFace) for server-side face recognition
- OpenCV for image processing

### Database:
- PostgreSQL (via Supabase)
- Prisma ORM

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)     │    │   (FastAPI)     │    │   (Supabase)    │
│                 │    │                 │    │                 │
│ • Face-api.js   │◄──►│ • ArcFace       │◄──►│ • User faces    │
│ • Multi-angle   │    │ • Image proc.   │    │ • Benchmarks    │
│ • UI/UX         │    │ • Recognition   │    │ • Performance   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- PostgreSQL database (Supabase account)

### 1. Frontend Setup

```bash
# Clone and install dependencies
cd face-api-attendance
npm install

# Setup environment variables
cp .env.example .env.local

# Add your Supabase credentials to .env.local:
# DATABASE_URL="your_supabase_postgres_url"
# DIRECT_URL="your_supabase_direct_url"

# Generate Prisma client
chmod +x node_modules/.bin/prisma
node_modules/.bin/prisma generate

# Start development server
npm run dev
```

### 2. Backend Setup

**⚠️ Important: Download InsightFace models first to avoid timeouts!**

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# IMPORTANT: Download InsightFace models before starting server
./download-models.sh
# OR manually: python download_models.py

# Start FastAPI server
./start-backend.sh
# OR manually: python main.py
```

**Why download models first?**
- InsightFace models are ~100MB and download on first use
- Without pre-downloading, API calls will timeout waiting for models
- The download script ensures everything is ready before starting the server

The backend will run on `http://localhost:8001` (port 8001 to avoid conflict with Supabase)

### 3. Database Setup

1. Create a Supabase project at https://supabase.com
2. Get your PostgreSQL connection string
3. Update your `.env.local` and `backend/.env` files
4. The database schema will be created automatically when you first run the application

### 4. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

## Usage Guide

### 1. Register Faces

1. Go to "Register Face" page
2. Enter your name
3. Follow the multi-angle capture process:
   - Position your face according to each instruction
   - Capture 5 different angles (front, left, right, up, down)
4. Complete registration

### 2. Benchmark Models

1. Go to "Benchmark" page
2. Select a registered user
3. Position yourself in front of the camera
4. Choose test option:
   - **Test Face-api.js Only**: Test client-side model
   - **Test ArcFace Only**: Test server-side model  
   - **Run Comparison Benchmark**: Test both models simultaneously

### 3. View Results

Results show:
- **Accuracy**: Similarity score (0-100%)
- **Latency**: Processing time in milliseconds
- **Match Status**: Whether the face was successfully recognized
- **Comparison**: Side-by-side performance metrics

## API Endpoints

### Backend (FastAPI) - Port 8000

- `POST /register` - Register user with multi-angle images
- `POST /recognize` - Recognize face using ArcFace
- `POST /benchmark` - Run benchmark test
- `GET /users` - Get all registered users
- `GET /benchmark-results` - Get benchmark history

### Frontend (Next.js) - Port 3000

- `POST /api/register-face` - Register with face-api.js
- `POST /api/recognize-face` - Recognize with face-api.js

## Performance Comparison

| Model | Pros | Cons |
|-------|------|------|
| **Face-api.js** | • Client-side processing<br>• No server dependency<br>• Privacy-friendly<br>• Lower server load | • Limited by device performance<br>• Larger bundle size<br>• Less accurate than server models |
| **ArcFace** | • Higher accuracy<br>• Consistent performance<br>• Latest AI models<br>• Server-side optimization | • Requires server infrastructure<br>• Network latency<br>• Privacy concerns<br>• Server costs |

## Troubleshooting

### InsightFace Model Download Issues

**Problem**: Backend times out or fails to start
```
❌ Failed to initialize ArcFace: [timeout error]
```

**Solutions**:
1. **Pre-download models** (recommended):
   ```bash
   cd backend
   ./download-models.sh
   ```

2. **Manual download**:
   ```bash
   cd backend
   source venv/bin/activate
   python download_models.py
   ```

3. **Check network connection**: Models are ~100MB and need stable internet

4. **Alternative providers**: If CPU provider fails, try:
   ```python
   # In arcface_service.py, change providers
   self.app = FaceAnalysis(providers=['CPUExecutionProvider'])
   ```

### Backend Connection Issues

**Problem**: Frontend shows "Backend: Offline"

**Solutions**:
1. **Check backend is running**: Should see "Running on http://localhost:8000"
2. **Verify port**: Backend uses port 8000, frontend uses 3000
3. **Check firewall**: Ensure ports 8000 and 3000 are not blocked
4. **Test backend directly**: Visit `http://localhost:8000/health`

### Database Connection Issues

**Problem**: "DATABASE_URL environment variable is required"

**Solutions**:
1. **Create .env file**:
   ```bash
   cd backend
   cp .env.example .env
   ```
2. **Add your database URL** to `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```
3. **Test connection**: Use provided database URL from Supabase dashboard

### Face Detection Issues

**Problem**: "No face detected" during registration/testing

**Solutions**:
1. **Improve lighting**: Ensure good lighting on your face
2. **Camera position**: Center your face in the camera frame
3. **Remove obstructions**: Remove glasses, hats, or masks if possible
4. **Try different angles**: Some angles work better than others
5. **Check camera permissions**: Ensure browser has camera access

### Performance Issues

**Problem**: Slow processing or high latency

**Solutions**:
1. **Use faster hardware**: Better CPU/GPU improves processing speed
2. **Reduce image quality**: Lower camera resolution if needed
3. **Close other applications**: Free up system resources
4. **Check network**: For ArcFace, network latency affects performance

### Development Issues

**Problem**: Hot reload not working or build errors

**Solutions**:
1. **Clear cache**:
   ```bash
   rm -rf .next
   npm run dev
   ```
2. **Reinstall dependencies**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```
3. **Check Node.js version**: Requires Node.js 18+

Need more help? Check the [Issues](https://github.com/azizfrahman/face-api-attendance/issues) page or create a new issue.

### Common Issues

1. **Prisma permission denied**: Run `chmod +x node_modules/.bin/prisma`
2. **Camera not accessible**: Check browser permissions
3. **Backend connection error**: Ensure FastAPI server is running on port 8000
4. **Database connection error**: Verify Supabase credentials

## License

This project is for educational and research purposes.
