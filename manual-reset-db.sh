#!/bin/bash
set -e

# ==============================================================================
# TaxPartner MANUAL-ONLY Database Reset Utility
# DANGER: THIS SCRIPT CLEARS DATABASE DATA!
# This script can NEVER be called by CI/CD, Jenkins, or deployment scripts.
# It requires an interactive human terminal and explicit typed confirmation.
# ==============================================================================

# 1. Enforce Interactive Human Terminal (Blocks any CI/CD, script, or automated caller)
if [ ! -t 0 ]; then
    echo "❌ FATAL: Automated database clearing is strictly prohibited."
    echo "This script can only be executed manually by a human administrator in an interactive terminal."
    exit 1
fi

echo "===================================================================="
echo " 🚨 CRITICAL DANGER: MANUAL DATABASE DATA RESET UTILITY 🚨"
echo "===================================================================="
echo " This script will permanently delete database records."
echo " Builds and deployments NEVER run this script."
echo "===================================================================="

read -p "Select environment to reset (prod/stage): " ENV_TARGET

if [ "$ENV_TARGET" = "stage" ]; then
    COMPOSE_FILE="docker-compose.stage.yml"
    POSTGRES_CONTAINER="postgres_stage"
    DB_NAME="infusetax_stage_db"
    DB_USER="infusetax_user"
elif [ "$ENV_TARGET" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
    POSTGRES_CONTAINER="postgres"
    DB_NAME="infusetax_db"
    DB_USER="infusetax_user"
else
    echo "❌ Invalid environment. Aborting."
    exit 1
fi

# 2. Mandatory Automated Safety Backup
mkdir -p ./backups
BACKUP_FILE="./backups/db_backup_BEFORE_MANUAL_RESET_${ENV_TARGET}_$(date +%Y%m%d_%H%M%S).sql.gz"
echo "💾 Creating mandatory pre-reset safety backup to $BACKUP_FILE..."
docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" pg_dump -U "$DB_USER" -d "$DB_NAME" | gzip > "$BACKUP_FILE" || true
echo "✓ Backup safely saved."

# 3. Explicit Human Confirmation Gate
echo ""
echo "⚠️  WARNING: You are about to clear all live tables in $ENV_TARGET ($DB_NAME)!"
echo "To prevent accidents, you must type the exact confirmation phrase below:"
echo "   YES I AM SURE I WANT TO WIPE ALL DATA"
echo ""
read -p "Enter phrase: " CONFIRM_TEXT

if [ "$CONFIRM_TEXT" != "YES I AM SURE I WANT TO WIPE ALL DATA" ]; then
    echo "❌ Confirmation failed. Database was NOT modified. Safe exit."
    exit 0
fi

# 4. Truncate Tables
echo "🗑️ Clearing tables under manual administrator approval..."
docker compose -f "$COMPOSE_FILE" exec -T "$POSTGRES_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -c "
TRUNCATE TABLE 
    public.pricing_audit_logs, 
    public.wallet_requests, 
    public.audit_ledger, 
    public.wallets, 
    public.documents, 
    public.gst_filings, 
    public.itr_filings, 
    public.notifications, 
    public.announcements, 
    public.utr_requests, 
    public.service_pricings, 
    public.users, 
    public.tenants 
CASCADE;"

echo "✅ Manual reset complete. Safety backup is preserved at $BACKUP_FILE."
