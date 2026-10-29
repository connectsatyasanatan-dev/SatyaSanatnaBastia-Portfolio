# -------------------------------------------------------------
# Stage 1: Build Next.js Frontend
# -------------------------------------------------------------
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --legacy-peer-deps

COPY frontend/ ./
ENV NEXT_PUBLIC_API_URL=/api
ENV BACKEND_URL=http://127.0.0.1:5000
RUN npm run build

# -------------------------------------------------------------
# Stage 2: Final Production Container (Python + Node.js)
# -------------------------------------------------------------
FROM python:3.11-slim

RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libpq-dev \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Backend dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Backend code
COPY backend/ ./backend/

# Frontend built code
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/

# Startup script
COPY start.sh ./
RUN chmod +x start.sh

# Create non-root application user for defense-in-depth
RUN groupadd -r appuser && useradd -r -g appuser -u 1001 appuser && \
    chown -R appuser:appuser /app

# Default application HTTP port
EXPOSE 8000

ENV PORT=8000
ENV FLASK_ENV=production

USER appuser

CMD ["./start.sh"]
