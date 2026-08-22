#!/bin/bash
set -e

echo "========================================================"
echo " Starting InfuseTax Multi-Container Docker Stack..."
echo "========================================================"

docker compose up -d

echo ""
echo "========================================================"
echo " ✓ InfuseTax is LIVE and Running in Docker!"
echo "========================================================"
echo " • Local Web Gateway (Nginx): http://localhost:8888"
echo " • Local Frontend (Direct):   http://localhost:3080"
echo " • Unified Sign-In:           http://localhost:8888/sign-in"
echo " • Super Admin Portal:        http://localhost:8888/dashboard/company"
echo " • Master Distributor Hub:    http://localhost:8888/dashboard/distributor"
echo " • Retailer Services POS:     http://localhost:8888/dashboard/retailer"
echo " • Operator Counter Desk:     http://localhost:8888/dashboard/operator"
echo " • REST API Healthcheck:      http://localhost:8888/api/v1/health"
echo "========================================================"
echo ""
echo "Fetching your live Public Cloudflare HTTPS URL..."
sleep 2
docker compose logs tunnel | grep -E "https://[a-zA-Z0-9-]+\.trycloudflare\.com" | tail -n 1 || echo "Tunnel initializing..."
echo "========================================================"
