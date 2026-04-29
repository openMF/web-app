#!/usr/bin/env bash
# E2E Docker Runner — boots Fineract stack, runs Playwright, tears down.
#
# Usage:
#   npm run e2e:docker                      # Run all tests
#   npm run e2e:docker -- --grep login      # Filter tests
#   npm run e2e:docker -- --headed          # See the browser
#   npm run e2e:docker -- --debug           # Step through
set -euo pipefail

# GNU timeout is required (not available by default on macOS).
# Install via: brew install coreutils
if ! command -v timeout &>/dev/null; then
  echo "❌ 'timeout' command not found. On macOS: brew install coreutils" >&2
  exit 1
fi

COMPOSE_FILE="docker-compose.e2e.yml"

cleanup() {
  local exit_code=$?
  echo ""
  echo "🧹 Tearing down E2E infrastructure..."
  docker compose -f "$COMPOSE_FILE" down -v --remove-orphans 2>/dev/null || true
  echo "✅ Cleanup complete"
  exit $exit_code
}
trap cleanup EXIT

echo "🚀 Starting E2E infrastructure..."
docker compose -f "$COMPOSE_FILE" up -d --build

echo "⏳ Waiting for services..."

# Phase 1: PostgreSQL
timeout 60 bash -c '
  until docker exec e2e-postgres pg_isready -U postgres 2>/dev/null; do sleep 2; done
'
echo "✅ PostgreSQL ready"

# Phase 2: Fineract actuator
timeout 300 bash -c '
  until docker ps --filter "health=healthy" --filter "name=e2e-fineract" | grep -q healthy; do
    echo "  … waiting for Fineract"
    sleep 10
  done
'
echo "✅ Fineract healthy"

# Phase 2.5: Liquibase seeding (Head Office)
E2E_USERNAME="${E2E_USERNAME:-mifos}"
E2E_PASSWORD="${E2E_PASSWORD:-password}"
E2E_TENANT_ID="${E2E_TENANT_ID:-default}"
# Portable base64: tr -d '\n' handles macOS/Linux newline differences
AUTH_HEADER=$(echo -n "${E2E_USERNAME}:${E2E_PASSWORD}" | base64 | tr -d '\n')

timeout 120 bash -c "
  until curl -fsk \
    -H 'Fineract-Platform-TenantId: ${E2E_TENANT_ID}' \
    -H 'Authorization: Basic ${AUTH_HEADER}' \
    https://localhost:8443/fineract-provider/api/v1/offices 2>/dev/null | grep -q 'Head Office'; do
    echo '  … waiting for Liquibase seed data'
    sleep 5
  done
"
echo "✅ Liquibase seed data ready"

# Phase 3: Web-app
curl -f --retry 20 --retry-all-errors --connect-timeout 5 --retry-delay 3 \
  http://localhost:4200 > /dev/null 2>&1
echo "✅ Web-app ready"

echo ""
echo "🧪 Running Playwright tests..."
# "$@" forwards flags from: npm run e2e:docker -- --grep login
npx playwright test --workers=1 "$@"
