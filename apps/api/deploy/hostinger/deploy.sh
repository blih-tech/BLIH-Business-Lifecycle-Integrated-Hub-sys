#!/usr/bin/env bash
set -euo pipefail

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
  require_env "GHCR_USERNAME"
  require_env "GHCR_TOKEN"
  
  # Validate port configuration
  if [[ -n "${API_PORT:-}" ]]; then
    if [[ "$API_PORT" -lt 1024 || "$API_PORT" -gt 65535 ]]; then
      log_error "Invalid API port: $API_PORT (must be 1024-65535)"
      exit 1
    fi
    log_info "API port configured: $API_PORT"
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
  AVAILABLE_SPACE=$(df . | tail -1 | awk '{print $4}')
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
  require_env KEYCLOAK_IMAGE

  export API_IMAGE
  export KEYCLOAK_IMAGE

  log_info "Pulling previous images..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" pull
  
  log_info "Starting previous containers..."
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans
  
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
  
  # Remove unused containers
  docker container prune -f >/dev/null 2>&1 || true
  
  # Remove unused networks (except blih-network)
  docker network prune -f --filter "name!=blih-network" >/dev/null 2>&1 || true
  
  log_info "Docker cleanup completed"
}

reconcile_compose_network() {
  local network_name="${1:-blih-network}"
  local compose_label

  if ! docker network inspect "$network_name" >/dev/null 2>&1; then
    return 0
  fi

  compose_label="$(docker network inspect "$network_name" --format '{{ index .Labels "com.docker.compose.network" }}' 2>/dev/null || true)"

  if [[ "$compose_label" == "$network_name" ]]; then
    log_info "Docker network '$network_name' is already managed by Compose"
    return 0
  fi

  log_warn "Docker network '$network_name' exists but is not managed by Compose. Removing stale network so Compose can recreate it."
  if ! docker network rm "$network_name" >/dev/null 2>&1; then
    log_error "Failed to remove stale Docker network '$network_name'. Stop containers using it and rerun deployment."
    exit 1
  fi
}

# Main deployment function
deploy() {
  log_info "Starting BLIH Production Deployment"
  log_info "=================================="
  
  # Validation
  validate_environment
  pre_deployment_checks
  backup_current_release
  
  # Login to registry
  log_step "Logging in to GitHub Container Registry..."
  printf '%s' "$GHCR_TOKEN" | docker login ghcr.io -u "$GHCR_USERNAME" --password-stdin
  
  # Export variables for compose
  export API_IMAGE
  export API_MIGRATOR_IMAGE
  export KEYCLOAK_IMAGE
  
  # Pull images
  log_step "Pulling release images..."
  docker pull "$API_IMAGE"
  docker pull "$API_MIGRATOR_IMAGE"
  docker pull "$KEYCLOAK_IMAGE"

  # Remove only stale unmanaged networks. Compose will create the network if needed.
  reconcile_compose_network "blih-network"
  
  # Start PostgreSQL first for migrations
  log_step "Starting PostgreSQL service..."
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d postgres; then
    log_info "PostgreSQL service started successfully"
  else
    log_error "Failed to start PostgreSQL service"
    return 1
  fi
  
  # Wait for PostgreSQL to be healthy
  log_step "Waiting for PostgreSQL to be ready..."
  for i in {1..30}; do
    if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" >/dev/null 2>&1; then
      log_info "PostgreSQL is ready"
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
  if docker run --rm --env-file "$ENV_FILE" --network blih-network "$API_MIGRATOR_IMAGE"; then
    log_info "Database migrations completed successfully"
  else
    log_error "Database migrations failed"
    return 1
  fi
  
  # Start remaining services
  log_step "Starting remaining production services..."
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans; then
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
    cleanup_docker_resources
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
  log_error "Deployment failed, attempting automatic rollback..."
  rollback || true
  cleanup_docker_resources
  docker logout ghcr.io >/dev/null 2>&1 || true
  exit 1
}

# Main execution
main() {
  require_cmd docker
  require_cmd curl
  require_file "$COMPOSE_FILE"
  require_file "$ENV_FILE"
  
  # Set up error handling
  trap handle_failure ERR
  
  # Execute deployment
  deploy
}

# Execute main function
main "$@"
