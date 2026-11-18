#!/bin/bash
set -e

echo "===================================================================="
echo " 🚀 InfuseTax Production Deployment Script (Domain: taxpartner.in) "
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

# 5. Build and Start Production Docker Stack
echo "🐳 Launching Production Docker Containers on Ports 80 & 443..."
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

# 6. Wait for PostgreSQL
echo "⏳ Waiting for PostgreSQL database to initialize..."
sleep 6

# 7. Initialize Database Tables & RLS Security
echo "🐘 Verifying & Initializing Database Schema and Data..."
if [ -f "supabase_schema_and_data.sql" ]; then
    docker compose -f docker-compose.prod.yml exec -T postgres psql -U infusetax_user -d infusetax_db < supabase_schema_and_data.sql 2>/dev/null || true
fi
if [ -f "supabase_security_fix_rls.sql" ]; then
    docker compose -f docker-compose.prod.yml exec -T postgres psql -U infusetax_user -d infusetax_db < supabase_security_fix_rls.sql 2>/dev/null || true
fi

# 8. Copy PDFs for public serving
echo "📄 Syncing Official PDF Guides..."
cp *.pdf backend/public/ 2>/dev/null || true

echo ""
echo "===================================================================="
echo " 🎉 InfuseTax is LIVE on Production for taxpartner.in!"
echo "===================================================================="
echo " • Main Website & Portals: https://taxpartner.in (or http://SERVER_IP)"
echo " • REST API Health Check:  https://taxpartner.in/api/v1/health"
echo " • Super Admin Portal:     https://taxpartner.in/dashboard/company"
echo " • Master Distributor Hub: https://taxpartner.in/dashboard/distributor"
echo " • Retailer POS Desk:      https://taxpartner.in/dashboard/retailer"
echo " • Operator Counter Desk:  https://taxpartner.in/dashboard/operator"
echo "===================================================================="
echo ""
echo "🔑 Default Production Credentials:"
echo " • Super Admin:  superadmin@infusetax.com  | Password: SuperAdmin@1234"
echo " • Distributor:  sengu@infusetax.com       | Password: Admin@123"
echo " • Retailer:     retailer@infusetax.com    | Password: Admin@123"
echo " • Operator:     counter@infusetax.com     | Password: Admin@123"
echo "===================================================================="
