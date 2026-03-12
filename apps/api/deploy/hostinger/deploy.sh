#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
RELEASE_FILE="${RELEASE_FILE:-current-release.env}"
PREVIOUS_RELEASE_FILE="${PREVIOUS_RELEASE_FILE:-previous-release.env}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-blih-system-prod}"
export COMPOSE_PROJECT_NAME

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1"
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    echo "Missing required file: $1"
    exit 1
  fi
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    echo "Missing required environment variable: $name"
    exit 1
  fi
}

write_release_file() {
  cat >"$RELEASE_FILE" <<EOF
API_IMAGE=${API_IMAGE}
API_MIGRATOR_IMAGE=${API_MIGRATOR_IMAGE}
KEYCLOAK_IMAGE=${KEYCLOAK_IMAGE}
GIT_SHA=${GIT_SHA:-unknown}
DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF
}

rollback() {
  if [[ ! -f "$PREVIOUS_RELEASE_FILE" ]]; then
    echo "No previous release marker found. Rollback not available."
    return 1
  fi

  echo "Starting rollback using $PREVIOUS_RELEASE_FILE"
  # shellcheck disable=SC1090
  source "$PREVIOUS_RELEASE_FILE"

  require_env API_IMAGE
  require_env KEYCLOAK_IMAGE

  export API_IMAGE
  export KEYCLOAK_IMAGE

  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans
  ./healthcheck.sh
  cp "$PREVIOUS_RELEASE_FILE" "$RELEASE_FILE"
  echo "Rollback finished successfully."
}

require_cmd docker
require_cmd curl
require_file "$COMPOSE_FILE"
require_file "$ENV_FILE"

require_env API_IMAGE
require_env API_MIGRATOR_IMAGE
require_env KEYCLOAK_IMAGE
require_env GHCR_USERNAME
require_env GHCR_TOKEN

if [[ -f "$RELEASE_FILE" ]]; then
  cp "$RELEASE_FILE" "$PREVIOUS_RELEASE_FILE"
fi

echo "Logging in to GHCR"
printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin

export API_IMAGE
export API_MIGRATOR_IMAGE
export KEYCLOAK_IMAGE

echo "Pulling release images"
docker pull "$API_IMAGE"
docker pull "$API_MIGRATOR_IMAGE"
docker pull "$KEYCLOAK_IMAGE"

deploy_ok=false
if docker run --rm --env-file "$ENV_FILE" "$API_MIGRATOR_IMAGE"; then
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans; then
    if ./healthcheck.sh; then
      deploy_ok=true
    fi
  fi
fi

if [[ "$deploy_ok" == true ]]; then
  write_release_file

  echo "Cleaning up unused Docker resources..."
  docker system prune -af || true

  docker logout ghcr.io >/dev/null 2>&1 || true
  echo "Deployment completed successfully."
  exit 0
fi

echo "Deployment failed, attempting automatic rollback."
rollback || true

echo "Cleaning up unused Docker resources..."
docker system prune -af || true

docker logout ghcr.io >/dev/null 2>&1 || true
exit 1
