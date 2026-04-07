#!/usr/bin/env sh
set -eu

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-admin1234}"

KEYCLOAK_DB_NAME="${KEYCLOAK_DB_NAME:-keycloak}"
KEYCLOAK_DB_USERNAME="${KEYCLOAK_DB_USERNAME:-$POSTGRES_USER}"
KEYCLOAK_DB_PASSWORD="${KEYCLOAK_DB_PASSWORD:-$POSTGRES_PASSWORD}"

# Try to parse API DB name from DATABASE_URL if not provided
if [ -z "${API_DB_NAME:-}" ] && [ -n "${DATABASE_URL:-}" ]; then
  db_url="${DATABASE_URL#postgresql://}"
  db_url="${db_url#postgres://}"
  db_target="${db_url#*@}"
  api_db_from_url="${db_target#*/}"
  api_db_from_url="${api_db_from_url%%\?*}"
  api_db_from_url="${api_db_from_url%%\#*}"
  API_DB_NAME="$api_db_from_url"
fi

API_DB_NAME="${API_DB_NAME:-blih-system}"
API_DB_USERNAME="${API_DB_USERNAME:-$POSTGRES_USER}"
API_DB_PASSWORD="${API_DB_PASSWORD:-$POSTGRES_PASSWORD}"

echo "Initializing databases..."
echo "- Keycloak DB: $KEYCLOAK_DB_NAME (Owner: $KEYCLOAK_DB_USERNAME)"
echo "- API DB: $API_DB_NAME (Owner: $API_DB_USERNAME)"

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" \
  --set=keycloak_db_name="$KEYCLOAK_DB_NAME" \
  --set=keycloak_db_user="$KEYCLOAK_DB_USERNAME" \
  --set=keycloak_db_password="$KEYCLOAK_DB_PASSWORD" \
  --set=api_db_name="$API_DB_NAME" \
  --set=api_db_user="$API_DB_USERNAME" \
  --set=api_db_password="$API_DB_PASSWORD" <<'EOSQL'
DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'keycloak_db_user') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'keycloak_db_user', :'keycloak_db_password');
  END IF;
END
$$;

SELECT format(
  'CREATE DATABASE %I OWNER %I ENCODING ''UTF8''',
  :'keycloak_db_name',
  :'keycloak_db_user'
)
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = :'keycloak_db_name'
) \gexec

SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'keycloak_db_name', :'keycloak_db_user') \gexec

DO
$$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = :'api_db_user') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', :'api_db_user', :'api_db_password');
  END IF;
END
$$;

SELECT format(
  'CREATE DATABASE %I OWNER %I ENCODING ''UTF8''',
  :'api_db_name',
  :'api_db_user'
)
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = :'api_db_name'
) \gexec

SELECT format('GRANT ALL PRIVILEGES ON DATABASE %I TO %I', :'api_db_name', :'api_db_user') \gexec
EOSQL

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$KEYCLOAK_DB_NAME" \
  --set=keycloak_db_user="$KEYCLOAK_DB_USERNAME" <<'EOSQL'
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'keycloak_db_user') \gexec
EOSQL

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$API_DB_NAME" \
  --set=api_db_user="$API_DB_USERNAME" <<'EOSQL'
SELECT format('GRANT ALL ON SCHEMA public TO %I', :'api_db_user') \gexec
EOSQL

echo 'Database initialization completed successfully'
