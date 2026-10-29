#!/bin/bash
set -e

# Use dynamic port assigned by cloud environment or fallback to 8000
APP_PORT=${PORT:-8000}

echo "=================================================="
echo "🚀 Starting Full-Stack Application"
echo "Public Port: $APP_PORT"
echo "=================================================="

# 1. Start Python Flask Backend in the background
echo "Starting Flask Backend on http://127.0.0.1:5000..."
cd /app/backend
python -m gunicorn wsgi:app --bind 127.0.0.1:5000 --workers 2 --timeout 120 --access-logfile - --error-logfile - &

# 2. Wait 3 seconds for backend to start
sleep 3

# 3. Start Next.js Frontend on the public port (8000)
echo "Starting Next.js Frontend on port $APP_PORT..."
cd /app/frontend
export PORT=$APP_PORT
export BACKEND_URL="http://127.0.0.1:5000"

exec npx next start -p $APP_PORT
