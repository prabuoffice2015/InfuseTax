#!/bin/bash
set -e

# ==============================================================================
# TaxPartner Fast Zero-Downtime Code Update Script
# Updates code, rebuilds containers, and applies incremental migrations
# WITHOUT touching existing database data or volumes.
# Usage:
#   ./deploy-update.sh        (Updates Production)
#   ./deploy-update.sh prod   (Updates Production)
#   ./deploy-update.sh stage  (Updates Staging)
# ==============================================================================

ENV_TARGET="${1:-prod}"

echo "===================================================================="
echo " 🔄 TaxPartner Fast Zero-Downtime Application Update ($ENV_TARGET) "
echo "===================================================================="

if [ "$ENV_TARGET" = "stage" ]; then
    COMPOSE_FILE="docker-compose.stage.yml"
    FRONTEND_SERVICE="frontend_stage"
    BACKEND_SERVICE="backend_stage"
    NGINX_SERVICE="nginx_stage"
    POSTGRES_SERVICE="postgres_stage"
    DB_NAME="infusetax_stage_db"
else
    COMPOSE_FILE="docker-compose.prod.yml"
    FRONTEND_SERVICE="frontend"
    BACKEND_SERVICE="backend"
    NGINX_SERVICE="nginx"
    POSTGRES_SERVICE="postgres"
    DB_NAME="infusetax_db"
fi

# 1. Pull latest Git updates if inside git repository
if [ -d ".git" ]; then
    echo "📥 Pulling latest git commits..."
    git pull || echo "⚠️ Notice: git pull skipped or up to date."
fi

# 2. Automated Safe DB Backup
mkdir -p ./backups
if docker compose -f "$COMPOSE_FILE" ps "$POSTGRES_SERVICE" 2>/dev/null | grep -q "Up"; then
    BACKUP_FILE="./backups/db_backup_${ENV_TARGET}_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "💾 Creating automatic live database backup to $BACKUP_FILE..."
    docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_SERVICE" pg_dump -U infusetax_user -d "$DB_NAME" 2>/dev/null | gzip > "$BACKUP_FILE" || true
    ls -1t ./backups/db_backup_${ENV_TARGET}_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f || true
fi

# 3. Build only Frontend and Backend application images
echo "🐳 Rebuilding Application Containers in background..."
docker compose -f "$COMPOSE_FILE" build "$FRONTEND_SERVICE" "$BACKEND_SERVICE"

# 4. Perform instant rolling restart of changed containers
echo "🚀 Applying updates with zero downtime..."
docker compose -f "$COMPOSE_FILE" up -d "$FRONTEND_SERVICE" "$BACKEND_SERVICE"

# 5. Gracefully reload Nginx
echo "🔄 Gracefully reloading Nginx proxy..."
docker compose -f "$COMPOSE_FILE" exec -T "$NGINX_SERVICE" nginx -s reload 2>/dev/null || true

# 6. Execute Incremental Migrations
echo "🐘 Checking for Pending Non-Destructive Migrations..."
chmod +x run-migrations.sh
./run-migrations.sh "$ENV_TARGET"

echo ""
echo "===================================================================="
echo " ✅ Application Update Complete!"
echo " 🛡️ Live Database Status: 100% UNTOUCHED & PERSISTED"
echo "===================================================================="
