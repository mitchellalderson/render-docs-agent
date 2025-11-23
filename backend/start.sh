#!/bin/sh
# Startup script for production deployment
set -e

echo "🚀 Starting Render Docs Agent Backend..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Initialize database (create indexes, etc.)
echo "🔧 Initializing database..."
npm run db:init || echo "⚠️  Database initialization failed or already done"

# Start the application
echo "✅ Starting application..."
exec node dist/index.js

