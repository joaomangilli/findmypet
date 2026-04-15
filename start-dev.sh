#!/bin/bash
set -e

echo "🐾 FindMyPet — Iniciando ambiente de desenvolvimento"

# Start Docker services
echo "🐳 Iniciando PostgreSQL e Redis..."
docker compose up -d db redis

# Wait for PostgreSQL
echo "⏳ Aguardando PostgreSQL..."
until PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -c "SELECT 1" >/dev/null 2>&1; do
  sleep 1
done

echo "✅ PostgreSQL pronto"

# Start Rails API (background)
echo "🚀 Iniciando Rails API na porta 3001..."
cd "$(dirname "$0")/api"
source ~/.rvm/scripts/rvm
rvm use 3.2.2 --quiet 2>/dev/null || true
export DB_HOST=localhost
export DB_PORT=5434
export DB_USER=postgres
export DB_PASSWORD=postgres
export REDIS_URL=redis://localhost:6379/0
export CORS_ORIGINS=http://localhost:3000
export APP_URL=http://localhost:3000
export DEVISE_JWT_SECRET_KEY="${DEVISE_JWT_SECRET_KEY:-dev_secret_change_me}"
bundle exec rails server -p 3001 -b 0.0.0.0 &
RAILS_PID=$!

# Start Next.js (foreground)
echo "🌐 Iniciando Next.js na porta 3000..."
cd "$(dirname "$0")/web"
npm run dev -- --port 3000

# Cleanup on exit
kill $RAILS_PID 2>/dev/null || true
