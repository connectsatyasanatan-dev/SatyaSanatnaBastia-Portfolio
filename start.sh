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

# 2. Wait for Flask Backend to be ready
echo "Waiting for Flask Backend to become available on 127.0.0.1:5000..."
for i in $(seq 1 15); do
  if curl -s http://127.0.0.1:5000/ > /dev/null 2>&1; then
    echo "✅ Flask Backend is listening and responsive!"
    break
  fi
  sleep 1
done

# 3. Start Next.js Frontend on the public port ($APP_PORT)
echo "Starting Next.js Frontend on port $APP_PORT..."
cd /app/frontend
export PORT=$APP_PORT
export BACKEND_URL="http://127.0.0.1:5000"

exec npx next start -p $APP_PORT
