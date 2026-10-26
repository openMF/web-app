#!/bin/bash
# Creates the two databases Fineract requires at first boot.
# POSTGRES_USER (postgres) is the default superuser — no CREATE USER needed.
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE fineract_tenants;
    CREATE DATABASE fineract_default;
EOSQL

echo "✓ E2E databases created: fineract_tenants, fineract_default"
