#!/bin/bash

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install requirements
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

echo "Backend setup complete!"
echo "Please update the .env file with your database connection strings"
echo "Then run: source venv/bin/activate && python main.py"
