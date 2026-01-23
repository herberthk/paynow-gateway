#!/usr/bin/env bash
# setup-dev.sh - Setup local dev environment to match production

echo "🔄 Updating Docker Compose with all the required extensions..."
# sed -i 's|image: postgres:16-alpine|image: postgis/postgis:16-3.4-alpine|' docker-compose.yml

echo "🐳 Restarting PostgreSQL with all the required extensions..."
docker-compose down -v
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 5

echo "🔧 Enabling all the required extensions..."
# docker exec prisma-postgres-dev psql -U postgres -d prisma_dev -c "CREATE EXTENSION IF NOT EXISTS postgis;"
# docker exec prisma-postgres-dev psql -U postgres -d prisma_dev -c "CREATE EXTENSION IF NOT EXISTS postgis_topology;"
 docker exec prisma-postgres-dev psql -U postgres -d template1 -c "CREATE EXTENSION IF NOT EXISTS postgis; CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS postgis_topology; CREATE EXTENSION IF NOT EXISTS btree_gin; CREATE EXTENSION IF NOT EXISTS pgcrypto;"

echo "📦 Updating Prisma configuration..."
# Ensure schema.prisma has the right extensions

echo "Run: npx prisma migrate deploy and npx prisma generate"
echo "⏳ Waiting for database to be ready..."
sleep 50
npx prisma migrate deploy
npx prisma generate

echo "Seeding the database..."
bun run utils/seed.ts

echo "✅ Setup complete!"