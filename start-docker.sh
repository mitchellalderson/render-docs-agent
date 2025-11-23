#!/bin/bash
# Quick start script for Docker Compose

set -e

echo "🚀 Starting Render Docs Agent with Docker Compose"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found!"
    echo ""
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "🔑 IMPORTANT: Edit .env and add your API keys:"
    echo "   - ANTHROPIC_API_KEY"
    echo "   - OPENAI_API_KEY"
    echo ""
    echo "Get your keys from:"
    echo "   - Anthropic: https://console.anthropic.com/"
    echo "   - OpenAI: https://platform.openai.com/api-keys"
    echo ""
    read -p "Press Enter after adding your API keys to .env..."
fi

# Check if API keys are set
if grep -q "your-anthropic-key-here" .env || grep -q "your-openai-key-here" .env; then
    echo "⚠️  WARNING: API keys not configured in .env"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "📦 Starting Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Wait for database
echo "   Checking database..."
until docker-compose exec -T database pg_isready -U docsagent > /dev/null 2>&1; do
    echo "   Database not ready, waiting..."
    sleep 2
done
echo "   ✅ Database ready"

# Wait for backend
echo "   Checking backend..."
until curl -sf http://localhost:3001/health > /dev/null 2>&1; do
    echo "   Backend not ready, waiting..."
    sleep 2
done
echo "   ✅ Backend ready"

echo ""
echo "🎉 All services are running!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo "   Health:   http://localhost:3001/health"
echo ""
echo "📊 View logs:"
echo "   All:      docker-compose logs -f"
echo "   Backend:  docker-compose logs -f backend"
echo "   Frontend: docker-compose logs -f frontend"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""

# Initialize database if needed
read -p "Initialize database with indexes? (Y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo "Initializing database..."
    docker-compose exec backend npm run db:migrate
    docker-compose exec backend npm run db:init
    echo "✅ Database initialized"
fi

echo ""
echo "✨ Ready to go! Open http://localhost:3000"

