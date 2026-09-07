# ============================================================
# CryptoTrace-I4C Backend Dockerfile — Member 6
# Python 3.11-slim, production-ready, minimal image
# ============================================================
FROM python:3.11-slim

# Metadata
LABEL maintainer="CryptoTrace-I4C Team | SIH 2026 PS26183"
LABEL description="CryptoTrace-I4C FastAPI Backend"

# System deps (needed for reportlab PDF generation)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Working directory
WORKDIR /app

# Install Python dependencies first (layer caching)
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend/

# Copy .env if present (optional, can override via docker-compose env_file)
COPY .env.example .env.example

# Expose FastAPI port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/health')" || exit 1

# Run with uvicorn
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
