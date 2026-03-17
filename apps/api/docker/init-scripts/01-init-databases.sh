#!/usr/bin/env sh
set -eu

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-postgres}"
KEYCLOAK_DB_NAME="${KEYCLOAK_DB_NAME:-keycloak}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Missing required environment variable: DATABASE_URL" >&2
  exit 1
fi

db_url="${DATABASE_URL#postgresql://}"
db_url="${db_url#postgres://}"
db_creds="${db_url%%@*}"
db_target="${db_url#*@}"

api_user_from_url="${db_creds%%:*}"
api_password_from_url="${db_creds#*:}"
if [ "$api_password_from_url" = "$db_creds" ]; then
  api_password_from_url=""
fi

api_db_from_url="${db_target#*/}"
api_db_from_url="${api_db_from_url%%\?*}"
api_db_from_url="${api_db_from_url%%\#*}"

API_DB_NAME="${API_DB_NAME:-$api_db_from_url}"
API_DB_USERNAME="${API_DB_USERNAME:-$api_user_from_url}"
API_DB_PASSWORD="${API_DB_PASSWORD:-$api_password_from_url}"

required_vars="
POSTGRES_USER
POSTGRES_DB
KEYCLOAK_DB_NAME
KEYCLOAK_DB_USERNAME
KEYCLOAK_DB_PASSWORD
API_DB_NAME
API_DB_USERNAME
API_DB_PASSWORD
"

for var in $required_vars; do
  eval "value=\${$var:-}"
  if [ -z "$value" ]; then
    echo "Missing required environment variable: $var" >&2
    exit 1
  fi
done

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
