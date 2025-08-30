#!/bin/bash

echo "Environment Configuration Verification"
echo "======================================"

if [ -f ".env" ]; then
    echo "OK: .env file exists"
    echo "File size: $(stat -f%z .env 2>/dev/null || stat -c%s .env) bytes"
    echo "Last modified: $(stat -f%Sm .env 2>/dev/null || stat -c%y .env)"
else
    echo "Error: .env file not found!"
    exit 1
fi

if [ -f ".env.example" ]; then
    echo "Warning: .env.example still exists - this should have been removed"
else
    echo "OK: .env.example properly removed"
fi

echo ""
echo "Checking key environment variables in .env:"

if grep -q "DATABASE_URL" .env; then
    echo "OK: DATABASE_URL found"
else
    echo "Error: DATABASE_URL missing"
fi

if grep -q "NEXT_PUBLIC_API_URL" .env; then
    echo "OK: NEXT_PUBLIC_API_URL found"
else
    echo "Error: NEXT_PUBLIC_API_URL missing"
fi

if grep -q "API_PORT" .env; then
    echo "OK: API_PORT found"
else
    echo "Error: API_PORT missing"
fi

if grep -q "WEB_PORT" .env; then
    echo "OK: WEB_PORT found"
else
    echo "Error: WEB_PORT missing"
fi

echo ""
echo "Security check:"
if grep -q "your-super-secret" .env; then
    echo "Warning: Default/placeholder secrets found - CHANGE THESE FOR PRODUCTION!"
else
    echo "OK: No default placeholders found"
fi

echo ""
echo "Environment file verification complete!"
echo "Remember to configure your actual values before running the application"