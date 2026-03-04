#!/bin/bash

# Script to open Prisma Studio with correct database connection
# This runs Prisma Studio from your host machine (not in Docker)

set -e

echo "🚀 Starting Prisma Studio..."
echo ""
echo "📊 Prisma Studio will open at: http://localhost:5555"
echo ""

cd "$(dirname "$0")/backend"

# Use the local database connection (not the Docker internal one)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5433/intern_website?schema=public"

# Start Prisma Studio
npx prisma studio --port 5555 --browser none
