#!/bin/bash

python3 -m venv venv

source venv/bin/activate

pip install -r requirements.txt

if [ ! -f ".env" ]; then
    echo "Warning: Please create .env file with database connection strings"
    echo "Check the main project .env file for reference"
else
    echo "OK: .env file found"
fi

echo "Backend setup complete!"
echo "Please ensure the .env file has your database connection strings"
echo "Then run: source venv/bin/activate && python main.py"
