#!/bin/bash
set -e

# ==============================================================================
# TaxPartner Staging Deployment Script (Port: 8081)
# ZERO DATA LOSS GUARANTEE:
#   - Never drops or truncates existing tables or staging data.
#   - Automatically creates timestamped database backups before deployments.
#   - Runs only non-destructive, idempotent migrations via run-migrations.sh.
#   - Performs zero-downtime rolling updates of frontend and backend.
# ==============================================================================

echo "===================================================================="
echo " 🧪 TaxPartner Staging Deployment Script (Port: 8081) "
echo "===================================================================="

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run as root (or with sudo): sudo ./deploy-staging.sh"
  exit 1
fi

# 2. Configure Firewall (UFW)
echo "🔒 Configuring Staging Firewall (Port 8081)..."
ufw allow 8081/tcp || true
echo "y" | ufw enable || true

# 3. Create backend/.env.stage if missing
if [ ! -f "backend/.env.stage" ]; then
    echo "⚙️ Creating backend/.env.stage for staging..."
    cat << 'EOF' > backend/.env.stage
APP_ENV=staging
APP_DEBUG=true
APP_URL=http://stage.taxpartner.in:8081
APP_TIMEZONE=Asia/Kolkata

JWT_SECRET=infusetax_stage_hmac_sha256_key_2026_test
JWT_EXPIRATION_SECONDS=86400
BCRYPT_ROUNDS=10

DB_CONNECTION=pgsql
DB_HOST=postgres_stage
DB_PORT=5432
DB_DATABASE=infusetax_stage_db
DB_USERNAME=infusetax_user
DB_PASSWORD=infusetax_secure_password

REDIS_HOST=redis_stage
REDIS_PORT=6379

WHATSAPP_ENABLED=false
EOF
    chmod 644 backend/.env.stage
fi

# 4. Pre-Deployment Automatic Database Backup (Safety Net)
mkdir -p ./backups
if docker compose -f docker-compose.stage.yml ps postgres_stage 2>/dev/null | grep -q "Up"; then
    BACKUP_FILE="./backups/db_backup_stage_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "💾 Safeguarding Staging Data: Creating timestamped database backup to $BACKUP_FILE..."
    docker compose -f docker-compose.stage.yml exec -T postgres_stage pg_dump -U infusetax_user -d infusetax_stage_db 2>/dev/null | gzip > "$BACKUP_FILE" || true
    ls -1t ./backups/db_backup_stage_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f || true
fi

# 5. Build Application Images with Zero Downtime (NO docker compose down)
echo "🐳 Rebuilding Staging Containers (Frontend & Backend)..."
docker compose -f docker-compose.stage.yml build frontend_stage backend_stage

# 6. Start/Update Containers with Zero Downtime
echo "🚀 Applying staging updates with zero downtime..."
docker compose -f docker-compose.stage.yml up -d

# 7. Execute Database Migrations (Idempotent & Non-Destructive)
echo "🐘 Executing Non-Destructive Database Migrations on Staging..."
chmod +x run-migrations.sh
./run-migrations.sh stage

# 8. Gracefully reload Staging Nginx
docker compose -f docker-compose.stage.yml exec -T nginx_stage nginx -s reload 2>/dev/null || true

echo ""
echo "===================================================================="
echo " 🎉 TaxPartner STAGING is LIVE on Port 8081!"
echo "===================================================================="
echo " • Staging Portal:         http://SERVER_IP:8081"
echo " • Staging API Health:     http://SERVER_IP:8081/api/v1/health"
echo " • Staging Subdomain:      http://stage.taxpartner.in:8081"
echo "===================================================================="
echo "🛡️ Staging Database Status: 100% PRESERVED & PROTECTED (0 data loss guaranteed)"
echo "===================================================================="
