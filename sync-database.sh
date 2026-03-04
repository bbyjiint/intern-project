#!/bin/bash

# Script to sync database structure after pulling new code
# Run this whenever you pull code that has database schema changes

set -e

echo "🔄 Syncing database structure..."
echo ""

# Check if Docker is running
if ! docker compose ps postgres > /dev/null 2>&1; then
    echo "❌ Error: PostgreSQL container is not running!"
    echo "   Please start Docker containers first:"
    echo "   docker compose up -d"
    exit 1
fi

# Check if backend container is running
if ! docker compose ps backend > /dev/null 2>&1; then
    echo "❌ Error: Backend container is not running!"
    echo "   Please start Docker containers first:"
    echo "   docker compose up -d"
    exit 1
fi

echo "📦 Step 1/3: Pushing schema changes to database..."
docker compose exec backend npx prisma db push --config=./prisma.config.ts --accept-data-loss

echo ""
echo "🔧 Step 2/3: Regenerating Prisma Client..."
docker compose exec backend npm run prisma:generate

echo ""
echo "🔄 Step 3/3: Restarting backend to apply changes..."
docker compose restart backend

echo ""
echo "✅ Database structure synced successfully!"
echo ""
echo "💡 Note: Your existing data is preserved. Only the structure (tables, columns) is updated."
echo ""
