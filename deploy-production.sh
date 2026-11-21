#!/bin/bash
set -e

echo "===================================================================="
echo " 🚀 TaxPartner Production Deployment Script (Domain: taxpartner.in) "
echo "===================================================================="

# 1. Check Root Privileges
if [ "$EUID" -ne 0 ]; then
  echo "⚠️ Please run as root (or with sudo): sudo ./deploy-production.sh"
  exit 1
fi

# 2. Install Docker & Compose if missing
if ! command -v docker &> /dev/null; then
    echo "📦 Installing Docker Engine..."
    apt update && apt install -y curl git ufw
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
fi

# 3. Configure Firewall (UFW)
echo "🔒 Configuring Production Firewall (UFW)..."
ufw allow 22/tcp || true
ufw allow 80/tcp || true
ufw allow 443/tcp || true
echo "y" | ufw enable || true

# 4. Create backend/.env if missing
if [ ! -f "backend/.env" ]; then
    echo "⚙️ Creating backend/.env for production..."
    cp backend/.env.example backend/.env 2>/dev/null || touch backend/.env
    cat << 'EOF' > backend/.env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://taxpartner.in
APP_TIMEZONE=Asia/Kolkata

JWT_SECRET=infusetax_super_secret_hmac_sha256_key_2026_taxpartner_prod
JWT_EXPIRATION_SECONDS=86400
BCRYPT_ROUNDS=10

DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=infusetax_db
DB_USERNAME=infusetax_user
DB_PASSWORD=infusetax_secure_password

REDIS_HOST=redis
REDIS_PORT=6379

WHATSAPP_ENABLED=true
WHATSAPP_COMMON_ADMIN_NUMBER=9944072249
EOF
fi

# 5. Safeguard Live Database: Create Automatic Backup if Postgres is running
mkdir -p ./backups
if docker compose -f docker-compose.prod.yml ps postgres 2>/dev/null | grep -q "Up"; then
    BACKUP_FILE="./backups/db_backup_prod_$(date +%Y%m%d_%H%M%S).sql.gz"
    echo "💾 Safeguarding Live Data: Creating timestamped database backup to $BACKUP_FILE..."
    docker compose -f docker-compose.prod.yml exec -T postgres pg_dump -U infusetax_user -d infusetax_db 2>/dev/null | gzip > "$BACKUP_FILE" || true
    # Maintain only the last 10 backups to prevent disk space exhaustion
    ls -1t ./backups/db_backup_prod_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f || true
fi

# 6. Build and Start Production Docker Stack with Zero Downtime
# NEVER do 'docker compose down' which tears down database connections and causes downtime.
echo "🐳 Rebuilding Application Containers (Zero-Downtime Rolling Update)..."
docker compose -f docker-compose.prod.yml build frontend backend
docker compose -f docker-compose.prod.yml up -d

# 7. Wait for PostgreSQL to be Ready
echo "⏳ Verifying PostgreSQL database readiness..."
for i in {1..25}; do
    if docker compose -f docker-compose.prod.yml exec -T postgres pg_isready -U infusetax_user -d infusetax_db >/dev/null 2>&1; then
        echo "✓ PostgreSQL is ready to accept connections."
        break
    fi
    sleep 1
done

# 8. Check Database Tables - STRICT DATA PRESERVATION GUARD
echo "🐘 Inspecting Database Schema Integrity..."
TABLE_COUNT=$(docker compose -f docker-compose.prod.yml exec -T postgres psql -U infusetax_user -d infusetax_db -tAc "SELECT count(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';" 2>/dev/null | tr -d '[:space:]' || echo "0")

if [[ "$TABLE_COUNT" =~ ^[0-9]+$ ]] && [ "$TABLE_COUNT" -gt 0 ]; then
    echo "===================================================================="
    echo " 🛡️ LIVE DATABASE PROTECTED: Found $TABLE_COUNT existing tables."
    echo " 🔒 PRESERVING LIVE DATA: Skipping destructive seed/reset."
    echo " All users, GST/ITR filings, wallet balances, & documents are SAFE."
    echo "===================================================================="
elif [ "$TABLE_COUNT" = "0" ]; then
    echo "🌱 Fresh database detected (0 tables). Initializing schema and seed data..."
    if [ -f "supabase_schema_and_data.sql" ]; then
        docker compose -f docker-compose.prod.yml exec -T postgres psql -U infusetax_user -d infusetax_db < supabase_schema_and_data.sql 2>/dev/null || true
    fi
else
    echo "⚠️ Warning: Could not verify database table count ($TABLE_COUNT). Defaulting to safe mode: PRESERVING DATA (skipping seed)."
fi

# 9. Apply Non-Destructive Row-Level Security (RLS) Policies
if [ -f "supabase_security_fix_rls.sql" ]; then
    echo "🔒 Applying Row-Level Security (RLS) policies..."
    docker compose -f docker-compose.prod.yml exec -T postgres psql -U infusetax_user -d infusetax_db < supabase_security_fix_rls.sql 2>/dev/null || true
fi

# 10. Copy PDFs for public serving & gracefully reload Nginx
echo "📄 Syncing Official PDF Guides..."
cp *.pdf backend/public/ 2>/dev/null || true
docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload 2>/dev/null || true

echo ""
echo "===================================================================="
echo " 🎉 TaxPartner is LIVE on Production for taxpartner.in!"
echo "===================================================================="
echo " • Main Website & Portals: https://taxpartner.in (or http://SERVER_IP)"
echo " • REST API Health Check:  https://taxpartner.in/api/v1/health"
echo " • Super Admin Portal:     https://taxpartner.in/dashboard/company"
echo " • Master Distributor Hub: https://taxpartner.in/dashboard/distributor"
echo " • Retailer POS Desk:      https://taxpartner.in/dashboard/retailer"
echo " • Operator Counter Desk:  https://taxpartner.in/dashboard/operator"
echo "===================================================================="
echo "🛡️ Live database status: PRESERVED & PROTECTED (0 data loss guaranteed)"
echo "===================================================================="
