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
api_db_from_url="${db_target#*/}"
api_db_from_url="${api_db_from_url%%\?*}"
api_db_from_url="${api_db_from_url%%\#*}"

API_DB_NAME="${API_DB_NAME:-$api_db_from_url}"
API_DB_USERNAME="${API_DB_USERNAME:-$api_user_from_url}"

required_vars="
POSTGRES_USER
POSTGRES_DB
KEYCLOAK_DB_NAME
KEYCLOAK_DB_USERNAME
API_DB_NAME
API_DB_USERNAME
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
  --set=api_db_name="$API_DB_NAME" \
  --set=api_db_user="$API_DB_USERNAME" <<'EOSQL'
CREATE OR REPLACE VIEW active_team_connections AS
SELECT
  datname AS database,
  usename AS username,
  client_addr AS ip_address,
  state,
  query_start,
  now() - query_start AS connection_duration,
  LEFT(query, 50) AS current_query
FROM pg_stat_activity
WHERE datname IN (:'keycloak_db_name', :'api_db_name')
  AND client_addr IS NOT NULL
ORDER BY query_start DESC;

SELECT format('GRANT SELECT ON active_team_connections TO %I', :'api_db_user') \gexec
SELECT format('GRANT SELECT ON active_team_connections TO %I', :'keycloak_db_user') \gexec
EOSQL

echo 'Remote access configuration completed successfully'
