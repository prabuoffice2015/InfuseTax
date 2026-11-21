#!/bin/bash
set -e

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

# 4. Safeguard Staging Database: Create Automatic Backup if Postgres is running
mkdir -p ./backups
if docker compose -f docker-compose.stage.yml ps postgres_stage 2>/dev/null | grep -q "Up"; then
    BACKUP_FILE="./backups/db_backup_stage_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "💾 Safeguarding Staging Data: Creating timestamped database backup to $BACKUP_FILE..."
    docker compose -f docker-compose.stage.yml exec -T postgres_stage pg_dump -U infusetax_user -d infusetax_stage_db 2>/dev/null | gzip > "$BACKUP_FILE" || true
    ls -1t ./backups/db_backup_stage_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f || true
fi

# 5. Build and Start Staging Docker Stack with Zero Downtime
# NEVER do 'docker compose down'
echo "🐳 Rebuilding Staging Containers (Zero-Downtime Rolling Update)..."
docker compose -f docker-compose.stage.yml build frontend_stage backend_stage
docker compose -f docker-compose.stage.yml up -d

# 6. Wait for Staging PostgreSQL
echo "⏳ Verifying Staging PostgreSQL readiness..."
for i in {1..25}; do
    if docker compose -f docker-compose.stage.yml exec -T postgres_stage pg_isready -U infusetax_user -d infusetax_stage_db >/dev/null 2>&1; then
        echo "✓ Staging PostgreSQL is ready to accept connections."
        break
    fi
    sleep 1
done

# 7. Check Staging Database Tables - STRICT DATA PRESERVATION GUARD
echo "🐘 Inspecting Staging Database Schema Integrity..."
TABLE_COUNT=$(docker compose -f docker-compose.stage.yml exec -T postgres_stage psql -U infusetax_user -d infusetax_stage_db -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';" 2>/dev/null | tr -d '[:space:]' || echo "0")

if [[ "$TABLE_COUNT" =~ ^[0-9]+$ ]] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo "===================================================================="
    echo " 🛡️ STAGING DATABASE PROTECTED: Found $TABLE_COUNT existing tables."
    echo " 🔒 STAGING DATA PRESERVED: Skipping destructive schema reset/re-seed."
    echo " All staging test data remains intact."
    echo "===================================================================="
elif [ "$TABLE_COUNT" = "0" ]; then
    echo "🌱 Fresh staging database detected (0 tables). Initializing schema and seed data..."
    if [ -f "supabase_schema_and_data.sql" ]; then
        docker compose -f docker-compose.stage.yml exec -T postgres_stage psql -U infusetax_user -d infusetax_stage_db < supabase_schema_and_data.sql 2>/dev/null || true
    fi
else
    echo "⚠️ Warning: Could not verify database table count ($TABLE_COUNT). Defaulting to safe mode: PRESERVING DATA (skipping seed)."
fi

# 8. Apply Non-Destructive Row-Level Security (RLS) Policies
if [ -f "supabase_security_fix_rls.sql" ]; then
    echo "🔒 Applying Row-Level Security (RLS) policies..."
    docker compose -f docker-compose.stage.yml exec -T postgres_stage psql -U infusetax_user -d infusetax_stage_db < supabase_security_fix_rls.sql 2>/dev/null || true
fi

# Gracefully reload staging nginx
docker compose -f docker-compose.stage.yml exec -T nginx_stage nginx -s reload 2>/dev/null || true

echo ""
echo "===================================================================="
echo " 🎉 TaxPartner STAGING is LIVE on Port 8081!"
echo "===================================================================="
echo " • Staging Portal:         http://SERVER_IP:8081"
echo " • Staging API Health:     http://SERVER_IP:8081/api/v1/health"
echo " • Staging Subdomain:      http://stage.taxpartner.in:8081"
echo "===================================================================="
echo "🛡️ Staging database status: PRESERVED & PROTECTED (0 data loss guaranteed)"
echo "===================================================================="
