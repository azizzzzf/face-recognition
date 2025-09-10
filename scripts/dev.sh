#!/bin/bash

set -e

echo "Face API Attendance - Development Setup"
echo "======================================="

if ! command -v pnpm &> /dev/null; then
    echo "Error: pnpm is not installed. Please install pnpm first:"
    echo "  npm install -g pnpm"
    exit 1
fi

echo "Installing dependencies..."
pnpm install

echo "Generating Prisma client..."
pnpm run db:generate

echo "Starting development servers..."
echo "  Frontend (Next.js): http://localhost:3000"
echo "  Backend (FastAPI): http://localhost:8000"
echo ""

pnpm run dev