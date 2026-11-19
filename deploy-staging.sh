#!/bin/bash
set -e

echo "===================================================================="
echo " 🧪 InfuseTax Staging Deployment Script (Port: 8081) "
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

# 4. Build and Start Staging Docker Stack
echo "🐳 Launching Staging Docker Containers on Port 8081..."
docker compose -f docker-compose.stage.yml down 2>/dev/null || true
docker compose -f docker-compose.stage.yml up -d --build

# 5. Wait for Staging PostgreSQL
echo "⏳ Waiting for Staging PostgreSQL database to initialize..."
sleep 6

# 6. Initialize Staging Database Tables & RLS Security
echo "🐘 Initializing Staging Database Schema..."
if [ -f "supabase_schema_and_data.sql" ]; then
    docker compose -f docker-compose.stage.yml exec -T postgres_stage psql -U infusetax_user -d infusetax_stage_db < supabase_schema_and_data.sql 2>/dev/null || true
fi
if [ -f "supabase_security_fix_rls.sql" ]; then
    docker compose -f docker-compose.stage.yml exec -T postgres_stage psql -U infusetax_user -d infusetax_stage_db < supabase_security_fix_rls.sql 2>/dev/null || true
fi

echo ""
echo "===================================================================="
echo " 🎉 InfuseTax STAGING is LIVE on Port 8081!"
echo "===================================================================="
echo " • Staging Portal:         http://SERVER_IP:8081"
echo " • Staging API Health:     http://SERVER_IP:8081/api/v1/health"
echo " • Staging Subdomain:      http://stage.taxpartner.in:8081"
echo "===================================================================="
