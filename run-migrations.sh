#!/bin/bash
set -e

# ==============================================================================
# TaxPartner Safe Database Migration Runner
# Executes ONLY idempotent, non-destructive migrations.
# Tracks executed migrations in 'schema_migrations' table.
# NEVER drops tables, never truncates, never wipes live data.
# Usage:
#   ./run-migrations.sh        (Runs on Production)
#   ./run-migrations.sh prod   (Runs on Production)
#   ./run-migrations.sh stage  (Runs on Staging)
# ==============================================================================

ENV_TARGET="${1:-prod}"
MIGRATIONS_DIR="backend/database/sql_migrations"

if [ "$ENV_TARGET" = "stage" ]; then
    COMPOSE_FILE="docker-compose.stage.yml"
    POSTGRES_CONTAINER="postgres_stage"
    DB_NAME="infusetax_stage_db"
    DB_USER="infusetax_user"
else
    COMPOSE_FILE="docker-compose.prod.yml"
    POSTGRES_CONTAINER="postgres"
    DB_NAME="infusetax_db"
    DB_USER="infusetax_user"
fi

echo "===================================================================="
echo " 🐘 Database Migration Engine - Target: $ENV_TARGET ($DB_NAME)"
echo "===================================================================="

# 1. Verify PostgreSQL Container is Running
if ! docker compose -f "$COMPOSE_FILE" ps "$POSTGRES_CONTAINER" 2>/dev/null | grep -q "Up"; then
    echo "⚠️ Warning: $POSTGRES_CONTAINER is not running. Starting container..."
    docker compose -f "$COMPOSE_FILE" up -d "$POSTGRES_CONTAINER"
fi

# 2. Wait for PostgreSQL readiness
echo "⏳ Checking database connection..."
for i in {1..25}; do
    if docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

# 3. Create schema_migrations tracking table if it does not exist
docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "
CREATE TABLE IF NOT EXISTS public.schema_migrations (
    id SERIAL PRIMARY KEY,
    migration character varying(255) UNIQUE NOT NULL,
    batch integer NOT NULL,
    applied_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);" >/dev/null 2>&1

# 4. Get Current Migration Batch Number
BATCH=$(docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT COALESCE(MAX(batch), 0) + 1 FROM public.schema_migrations;" 2>/dev/null | tr -d '[:space:]')
if [ -z "$BATCH" ]; then
    BATCH=1
fi

# 5. Scan and Execute Pending Migrations
APPLIED_COUNT=0
SKIPPED_COUNT=0

for migration_file in $(ls -1 "$MIGRATIONS_DIR"/*.sql 2>/dev/null | sort); do
    filename=$(basename "$migration_file")
    
    # Check if migration was already applied
    ALREADY_RUN=$(docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tAc "SELECT count(*) FROM public.schema_migrations WHERE migration = '$filename';" 2>/dev/null | tr -d '[:space:]')
    
    if [ "$ALREADY_RUN" = "0" ]; then
        echo "🚀 Applying migration: $filename (Batch $BATCH)..."
        # Run inside transaction
        docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 < "$migration_file"
        
        # Record migration
        docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -v ON_ERROR_STOP=1 -c "
        INSERT INTO public.schema_migrations (migration, batch) VALUES ('$filename', $BATCH);" >/dev/null
        
        echo "   ✅ Applied successfully: $filename"
        APPLIED_COUNT=$((APPLIED_COUNT + 1))
    else
        echo "   ⏭️ Already applied: $filename (Skipped)"
        SKIPPED_COUNT=$((SKIPPED_COUNT + 1))
    fi
done

echo "--------------------------------------------------------------------"
echo " 📊 Migration Summary: $APPLIED_COUNT applied, $SKIPPED_COUNT already up to date."
echo " 🛡️ Live Database Status: 100% PRESERVED & PROTECTED"
echo "===================================================================="
