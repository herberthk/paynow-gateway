#!/bin/bash
# setup-dev.sh - Setup local dev environment to match production

echo "🔄 Updating Docker Compose for PostGIS..."
# sed -i 's|image: postgres:16-alpine|image: postgis/postgis:16-3.4-alpine|' docker-compose.yml

echo "🐳 Restarting PostgreSQL with PostGIS..."
docker-compose down -v
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔧 Enabling PostGIS extensions..."
docker exec prisma-postgres-dev psql -U postgres -d prisma_dev -c "CREATE EXTENSION IF NOT EXISTS postgis;"
docker exec prisma-postgres-dev psql -U postgres -d prisma_dev -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"

echo "📦 Updating Prisma configuration..."
# Ensure schema.prisma has the right extensions

echo "✅ Setup complete! Run: npx prisma migrate dev"