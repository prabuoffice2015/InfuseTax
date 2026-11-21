#!/bin/bash
set -e

# ==============================================================================
# TaxPartner Local Environment Playwright Automation Test Runner
# Tests the full end-to-end user workflows against the local environment
# ==============================================================================

BASE_URL="${PLAYWRIGHT_TEST_BASE_URL:-http://localhost:8888}"

echo "===================================================================="
echo " 🎭 TaxPartner Playwright Automation Test Suite (Local Environment)"
echo " Target Base URL: $BASE_URL"
echo "===================================================================="

# 1. Check if Local Service is Running
if ! curl -s -f "$BASE_URL/api/v1/health" >/dev/null 2>&1; then
    echo "⚠️ Target service at $BASE_URL/api/v1/health is not responding."
    echo "Attempting to test direct frontend port at http://localhost:3080..."
    if curl -s -f "http://localhost:3080" >/dev/null 2>&1; then
        BASE_URL="http://localhost:3080"
        export PLAYWRIGHT_TEST_BASE_URL="$BASE_URL"
        echo "✓ Found direct frontend at $BASE_URL"
    else
        echo "❌ Error: Neither http://localhost:8888 nor http://localhost:3080 is reachable."
        echo "Please ensure the local docker stack is running with: ./start.sh"
        exit 1
    fi
fi

echo "✓ Local environment is active and healthy!"
echo "🚀 Executing Playwright E2E Test Suite..."
echo ""

cd frontend-web
npx playwright test "$@"

echo ""
echo "===================================================================="
echo " 🎉 All Playwright Automation Tests Completed Successfully!"
echo " • To view detailed HTML report: cd frontend-web && npx playwright show-report"
echo " • To run with interactive UI:   cd frontend-web && npx playwright test --ui"
echo " • To run in headed browser:     cd frontend-web && npx playwright test --headed"
echo "===================================================================="
