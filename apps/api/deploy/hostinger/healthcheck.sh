#!/usr/bin/env bash
set -euo pipefail

API_PREFIX_VALUE="${API_PREFIX:-api/v1}"
API_PREFIX_VALUE="${API_PREFIX_VALUE#/}"
DEFAULT_API_URL="http://127.0.0.1:${API_PORT:-5000}/${API_PREFIX_VALUE}/health"

API_HEALTHCHECK_URL="${API_HEALTHCHECK_URL:-${DEFAULT_API_URL}}"
KEYCLOAK_HEALTHCHECK_URL="${KEYCLOAK_HEALTHCHECK_URL:-http://127.0.0.1:${KEYCLOAK_PORT:-8080}/realms/${KEYCLOAK_HEALTH_REALM:-master}}"
RETRIES="${HEALTHCHECK_RETRIES:-30}"
SLEEP_SECONDS="${HEALTHCHECK_SLEEP_SECONDS:-5}"

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts="$3"
  local delay="$4"

  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS "$url" >/tmp/"${name}".health 2>/dev/null; then
      echo "$name health check passed ($url)"
      return 0
    fi
    echo "$name health check attempt $i/$attempts failed ($url)"
    sleep "$delay"
  done

  echo "$name did not become healthy in time."
  return 1
}

require_cmd curl

wait_for_url "keycloak" "$KEYCLOAK_HEALTHCHECK_URL" "$RETRIES" "$SLEEP_SECONDS"
wait_for_url "api" "$API_HEALTHCHECK_URL" "$RETRIES" "$SLEEP_SECONDS"

if ! grep -q '"status":"up"' /tmp/api.health; then
  echo "API health payload does not report status up."
  cat /tmp/api.health
  exit 1
fi

echo "All production health checks passed."
