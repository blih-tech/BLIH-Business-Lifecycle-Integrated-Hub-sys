#!/usr/bin/env bash
set -eEuo pipefail

# Enhanced Production Deployment Script for BLIH System
# Includes comprehensive validation, rollback, and monitoring

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
RELEASE_FILE="${RELEASE_FILE:-current-release.env}"
PREVIOUS_RELEASE_FILE="${PREVIOUS_RELEASE_FILE:-previous-release.env}"
COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-blih-system-prod}"
export COMPOSE_PROJECT_NAME

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
  echo -e "${BLUE}[STEP]${NC} $1"
}

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error "Missing required command: $1"
    exit 1
  fi
}

require_file() {
  if [[ ! -f "$1" ]]; then
    log_error "Missing required file: $1"
    exit 1
  fi
}

load_env_file() {
  local env_path="$1"
  local line
  local key
  local value

  require_file "$env_path"

  # Parse dotenv-style KEY=VALUE pairs without executing the file as shell.
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" ]] && continue
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    if [[ "$line" != *=* ]]; then
      log_error "Invalid environment line in ${env_path}: ${line}"
      exit 1
    fi

    key="${line%%=*}"
    value="${line#*=}"

    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"

    if [[ ! "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      log_error "Invalid environment variable name in ${env_path}: ${key}"
      exit 1
    fi

    # Preserve values already injected into the process environment, such as
    # image tags and secrets passed by CI for the current deployment.
    if [[ -v "$key" ]]; then
      continue
    fi

    if [[ "$value" =~ ^\".*\"$ ]] || [[ "$value" =~ ^\'.*\'$ ]]; then
      value="${value:1:${#value}-2}"
    fi

    printf -v "$key" '%s' "$value"
    export "$key"
  done <"$env_path"
}

require_env() {
  local name="$1"
  if [[ -z "${!name:-}" ]]; then
    log_error "Missing required environment variable: $name"
    exit 1
  fi
}

validate_environment() {
  log_step "Validating environment configuration..."
  
  # Check required environment variables
  require_env "API_IMAGE"
  require_env "API_MIGRATOR_IMAGE"
  require_env "KEYCLOAK_IMAGE"
  require_env "GHCR_TOKEN"
  
  # Validate port configuration
  if [[ -n "${API_PORT:-}" ]]; then
    if [[ "$API_PORT" -lt 1024 || "$API_PORT" -gt 65535 ]]; then
      log_error "Invalid API port: $API_PORT (must be 1024-65535)"
      exit 1
    fi
    log_info "API port configured: $API_PORT"
  fi

  # Validate Keycloak port configuration
  if [[ -n "${KEYCLOAK_PORT:-}" ]]; then
    if [[ "$KEYCLOAK_PORT" -lt 1024 || "$KEYCLOAK_PORT" -gt 65535 ]]; then
      log_error "Invalid Keycloak port: $KEYCLOAK_PORT (must be 1024-65535)"
      exit 1
    fi
    log_info "Keycloak port configured: $KEYCLOAK_PORT"
  fi

  # Check if ports are available (basic check)
  if command -v netstat >/dev/null 2>&1; then
    if netstat -tuln | grep -q ":${API_PORT:-5000} "; then
      log_warn "Port ${API_PORT:-5000} appears to be in use"
    fi
  fi
}

pre_deployment_checks() {
  log_step "Running pre-deployment checks..."
  
  # Check Docker daemon
  if ! docker info >/dev/null 2>&1; then
    log_error "Docker daemon is not running"
    exit 1
  fi
  
  # Check available disk space
  AVAILABLE_SPACE=$(df --output=avail -k . | tail -1)
  REQUIRED_SPACE=2097152 # 2GB in KB
  if [[ "$AVAILABLE_SPACE" -lt "$REQUIRED_SPACE" ]]; then
    log_error "Insufficient disk space. Required: 2GB, Available: $((AVAILABLE_SPACE/1024/1024))GB"
    exit 1
  fi
  
  # Check Docker Compose version
  if ! docker compose version >/dev/null 2>&1; then
    log_error "Docker Compose is not available or version is incompatible"
    exit 1
  fi
  
  log_info "Pre-deployment checks passed"
}

backup_current_release() {
  log_step "Backing up current release..."
  
  if [[ -f "$RELEASE_FILE" ]]; then
    cp "$RELEASE_FILE" "$PREVIOUS_RELEASE_FILE"
    log_info "Current release backed up to $PREVIOUS_RELEASE_FILE"
  fi
}

write_release_file() {
  cat >"$RELEASE_FILE" <<EOF
API_IMAGE=${API_IMAGE}
API_MIGRATOR_IMAGE=${API_MIGRATOR_IMAGE}
KEYCLOAK_IMAGE=${KEYCLOAK_IMAGE}
GIT_SHA=${GIT_SHA:-unknown}
DEPLOYED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
API_PORT=${API_PORT:-5000}
EOF
}

rollback() {
  if [[ ! -f "$PREVIOUS_RELEASE_FILE" ]]; then
    log_error "No previous release marker found. Rollback not available."
    return 1
  fi

  log_step "Starting rollback using $PREVIOUS_RELEASE_FILE"
  # shellcheck disable=SC1090
  source "$PREVIOUS_RELEASE_FILE"

  require_env API_IMAGE
  require_env API_MIGRATOR_IMAGE
  require_env KEYCLOAK_IMAGE

  export API_IMAGE
  export API_MIGRATOR_IMAGE
  export KEYCLOAK_IMAGE

  # Stop current (failed) deployment before rolling back
  stop_existing_services

  log_info "Starting previous containers..."
  if ! compose_start_postgres; then
    log_error "Rollback failed during postgres startup"
    return 1
  fi
  
  if ! compose_up_remaining_services; then
    log_error "Rollback failed during container startup"
    return 1
  fi
  
  log_info "Running health checks..."
  if ./healthcheck.sh; then
    cp "$PREVIOUS_RELEASE_FILE" "$RELEASE_FILE"
    log_info "Rollback finished successfully ✅"
  else
    log_error "Rollback health checks failed"
    return 1
  fi
}

cleanup_docker_resources() {
  log_step "Cleaning up Docker resources..."
  
  # Remove unused images
  docker image prune -f >/dev/null 2>&1 || true
  
  # Remove only stopped containers from this compose project.
  docker container prune -f --filter "label=com.docker.compose.project=$COMPOSE_PROJECT_NAME" >/dev/null 2>&1 || true
  
  # Remove only unused networks from this compose project.
  docker network prune -f --filter "label=com.docker.compose.project=$COMPOSE_PROJECT_NAME" >/dev/null 2>&1 || true
  
  log_info "Docker cleanup completed"
}

stop_existing_services() {
  log_step "Stopping existing services to release ports..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" down --remove-orphans --timeout 30 || true

  # Force-remove any lingering containers from this project that compose down may have missed
  # We use BOTH label and name prefix to be absolutely sure we clear the namespace.
  local lingering
  lingering=$(docker ps -a --filter "label=com.docker.compose.project=${COMPOSE_PROJECT_NAME}" -q 2>/dev/null || true)
  if [[ -n "$lingering" ]]; then
    log_warn "Force-removing lingering containers by label..."
    echo "$lingering" | xargs docker rm -f >/dev/null 2>&1 || true
  fi

  # Aggressive name-based cleanup to handle cases where labels might be missing or corrupted.
  # This targets exactly the names that cause 'Conflict' errors.
  local by_name
  by_name=$(docker ps -aq --filter "name=^/${COMPOSE_PROJECT_NAME}-" 2>/dev/null || true)
  if [[ -n "$by_name" ]]; then
    log_warn "Force-removing containers matching project name prefix: ${COMPOSE_PROJECT_NAME}-*"
    # shellcheck disable=SC2086
    docker rm -f $by_name >/dev/null 2>&1 || true
  fi

  # Explicitly remove the compose network so all port bindings are released by the kernel
  docker network rm "${COMPOSE_PROJECT_NAME}_default" >/dev/null 2>&1 || true

  # Force-remove ANY Docker container (from any project) still holding our ports.
  # This catches orphaned containers from previous failed deployments that were not
  # part of the current compose project and therefore not removed by compose down.
  local port
  for port in "${KEYCLOAK_PORT:-8180}" "${API_PORT:-5000}"; do
    while IFS= read -r cid; do
      [[ -z "$cid" ]] && continue
      log_warn "Force-removing orphaned container ${cid} holding port ${port}..."
      docker rm -f "${cid}" >/dev/null 2>&1 || true
    done < <(docker ps -aq --filter "publish=${port}" 2>/dev/null)
  done

  # Wait until all bound host ports are actually free before proceeding.
  # Docker's network teardown can take a few seconds after container removal.
  local waited
  for port in "${KEYCLOAK_PORT:-8180}" "${API_PORT:-5000}"; do
    waited=0
    while ss -tlnp 2>/dev/null | grep -q ":${port} "; do
      if [[ $waited -ge 30 ]]; then
        log_error "Port ${port} is still allocated after 30 s. Check for other services using it."
        exit 1
      fi
      log_warn "Port ${port} still bound, waiting... (${waited}s)"
      sleep 3
      waited=$((waited + 3))
    done
  done

  log_info "Existing services stopped and ports released"
}

compose_start_postgres() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --pull always postgres
}

compose_recreate_postgres() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --pull always --force-recreate postgres
}

compose_up_remaining_services() {
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --wait --pull always --remove-orphans --force-recreate api keycloak mailhog
}

# Main deployment function
deploy() {
  log_info "Starting BLIH Production Deployment"
  log_info "=================================="
  deploy_ok=false
  
  # Validation
  validate_environment
  pre_deployment_checks
  backup_current_release
  
  # Login to registry
  log_step "Logging in to GitHub Container Registry..."
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "${GITHUB_ACTOR:-github-actions[bot]}" --password-stdin

  # Stop existing services to release ports before starting new deployment
  stop_existing_services

  # Export variables for compose
  export API_IMAGE
  export API_MIGRATOR_IMAGE
  export KEYCLOAK_IMAGE
  
  # Remove all unused images to reclaim disk space before pulling new release.
  # All containers were stopped above, so no BLIH images are in use.
  log_step "Pruning unused images to free disk space..."
  docker image prune -af >/dev/null 2>&1 || true
  log_info "Unused images pruned"

  # Pull the migrator explicitly because it runs outside Compose.
  log_step "Pulling release images..."
  docker pull "$API_MIGRATOR_IMAGE"

  # Start PostgreSQL first for migrations
  log_step "Starting PostgreSQL service..."
  if compose_recreate_postgres; then
    log_info "PostgreSQL service started successfully"
  else
    log_error "Failed to start PostgreSQL service"
    return 1
  fi
  
  # Wait for PostgreSQL to be ready
  log_step "Waiting for PostgreSQL to be ready and ensuring databases exist..."
  for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_isready \
      -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-postgres}" >/dev/null 2>&1; then

      log_info "PostgreSQL is ready. Ensuring databases exist..."
      # Run the init script manually to ensure DBs are created even if volume existed
      # We pass the environment variables explicitly to ensure the script has them.
      docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T \
        -e POSTGRES_USER="${POSTGRES_USER:-postgres}" \
        -e POSTGRES_DB="${POSTGRES_DB:-postgres}" \
        -e POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-admin1234}" \
        -e DATABASE_URL="${DATABASE_URL:-}" \
        -e KEYCLOAK_DB_NAME="${KEYCLOAK_DB_NAME:-keycloak}" \
        -e API_DB_NAME="${POSTGRES_DB:-blih-system}" \
        postgres /docker-entrypoint-initdb.d/01-init-databases.sh

      log_info "Databases verified"
      break
    fi
    if [[ $i -eq 30 ]]; then
      log_error "PostgreSQL failed to become ready within 60 seconds"
      return 1
    fi
    sleep 2
  done
  
  # Run database migrations
  log_step "Running database migrations..."
  if docker run --rm --env-file "$ENV_FILE" --network "${COMPOSE_PROJECT_NAME}_default" "$API_MIGRATOR_IMAGE"; then
    log_info "Database migrations completed successfully"
  else
    log_error "Database migrations failed"
    return 1
  fi

  # Run database seed (upsert-based, safe to run on every deploy)
  log_step "Running database seed..."
  if docker run --rm --env-file "$ENV_FILE" --network "${COMPOSE_PROJECT_NAME}_default" \
    "$API_MIGRATOR_IMAGE" \
    npm run prisma:seed --workspace @repo/database; then
    log_info "Database seed completed successfully"
  else
    log_warn "Database seed failed — non-fatal, deployment will continue"
  fi
  
  # Start remaining services
  log_step "Starting remaining production services..."
  if compose_up_remaining_services; then
    log_info "All services started successfully"
  else
    log_error "Failed to start services"
    return 1
  fi
  
  # Health checks
  log_step "Running comprehensive health checks..."
  if ./healthcheck.sh; then
    log_info "Health checks passed ✅"
    deploy_ok=true
  else
    log_error "Health checks failed"
    deploy_ok=false
  fi
  
  # Post-deployment actions
  if [[ "$deploy_ok" == true ]]; then
    write_release_file
    cleanup_docker_resources || true
    docker logout ghcr.io >/dev/null 2>&1 || true
    
    log_info "=================================="
    log_info "Deployment completed successfully ✅"
    log_info "API is running on port: ${API_PORT:-5000}"
    log_info "Deployed at: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    exit 0
  fi
}

# Rollback on failure
handle_failure() {
  local rollback_result=0
  log_error "Deployment failed, attempting automatic rollback..."

  # Print all container logs BEFORE cleanup so the CI log shows the root cause
  log_step "=== CONTAINER LOGS (last 250 lines each) ==="
  docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs --no-color --tail=250 2>/dev/null || true
  log_step "=== END CONTAINER LOGS ==="

  # Extra diagnostics for Keycloak if it's the one that failed
  if docker ps -a | grep -q "${COMPOSE_PROJECT_NAME}-keycloak"; then
    log_step "=== KEYCLOAK SPECIFIC DIAGNOSTICS ==="
    docker inspect "${COMPOSE_PROJECT_NAME}-keycloak-1" --format '{{json .State.Health}}' 2>/dev/null || true
    log_warn "=== KEYCLOAK RECENT LOGS ==="
    docker compose -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" logs --tail=100 keycloak 2>/dev/null || true
    log_step "=== END DIAGNOSTICS ==="
  fi

  if ! rollback; then
    rollback_result=$?
    log_error "Rollback failed with exit code ${rollback_result}"
  fi
  
  cleanup_docker_resources || true
  docker logout ghcr.io >/dev/null 2>&1 || true
  
  # Exit with rollback status - if rollback succeeded, exit 0
  exit $rollback_result
}

# Main execution
main() {
  require_cmd docker
  require_cmd curl
  require_file "$COMPOSE_FILE"
  load_env_file "$ENV_FILE"
  
  # Set up error handling
  trap handle_failure ERR
  
  # Execute deployment
  deploy
}

# Execute main function
main "$@"
