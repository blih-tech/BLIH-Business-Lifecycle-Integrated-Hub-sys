#!/usr/bin/env bash
set -euo pipefail

# Production Health Check Script for BLIH System
# Enhanced with comprehensive monitoring and validation

API_PREFIX_VALUE="${API_PREFIX:-api/v1}"
API_PREFIX_VALUE="${API_PREFIX_VALUE#/}"
DEFAULT_API_URL="http://127.0.0.1:${API_PORT:-5000}/${API_PREFIX_VALUE}/health"

API_HEALTHCHECK_URL="${API_HEALTHCHECK_URL:-${DEFAULT_API_URL}}"
KEYCLOAK_HEALTHCHECK_URL="${KEYCLOAK_HEALTHCHECK_URL:-http://127.0.0.1:${KEYCLOAK_PORT:-8180}/realms/${KEYCLOAK_HEALTH_REALM:-master}}"
POSTGRES_HEALTHCHECK_URL="${POSTGRES_HEALTHCHECK_URL:-http://127.0.0.1:${API_PORT:-5000}/${API_PREFIX_VALUE}/health/db}"
RETRIES="${HEALTHCHECK_RETRIES:-30}"
KEYCLOAK_RETRIES="${HEALTHCHECK_KEYCLOAK_RETRIES:-72}"
SLEEP_SECONDS="${HEALTHCHECK_SLEEP_SECONDS:-5}"
TIMEOUT="${HEALTHCHECK_TIMEOUT:-10}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    log_error "Missing required command: $1"
    exit 1
  fi
}

check_system_resources() {
  log_info "Checking system resources..."
  
  # Check disk space
  DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
  if [ "$DISK_USAGE" -gt 85 ]; then
    log_warn "Disk usage is high: ${DISK_USAGE}%"
  else
    log_info "Disk usage: ${DISK_USAGE}%"
  fi
  
  # Check memory
  MEM_AVAILABLE=$(free -m | awk 'NR==2{printf "%.0f", $7*100/$2}')
  if [ "$MEM_AVAILABLE" -lt 20 ]; then
    log_warn "Available memory is low: ${MEM_AVAILABLE}%"
  else
    log_info "Available memory: ${MEM_AVAILABLE}%"
  fi
}

check_database_connectivity() {
  log_info "Checking database connectivity..."
  
  if docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
    pg_isready -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-blih_system_prod}" >/dev/null 2>&1; then
    log_info "Database connectivity: OK"
    return 0
  else
    log_error "Database connectivity: FAILED"
    return 1
  fi
}

wait_for_url() {
  local name="$1"
  local url="$2"
  local attempts="$3"
  local delay="$4"
  local timeout="$5"

  log_info "Checking $name health at: $url"
  
  for ((i = 1; i <= attempts; i++)); do
    if curl -fsS --max-time "$timeout" "$url" >/tmp/"${name}".health 2>/dev/null; then
      log_info "$name health check passed (attempt $i/$attempts)"
      return 0
    fi
    log_warn "$name health check attempt $i/$attempts failed"
    sleep "$delay"
  done

  log_error "$name did not become healthy in time"
  return 1
}

validate_api_response() {
  log_info "Validating API response payload..."
  
  if [ ! -f /tmp/api.health ]; then
    log_error "API health response file not found"
    return 1
  fi
  
  # Check for status up
  if grep -q '"status":"up"' /tmp/api.health; then
    log_info "API status: UP"
  else
    log_error "API status: NOT UP"
    cat /tmp/api.health
    return 1
  fi
  
  # Log additional info but don't fail on warnings
  if grep -q '"database":"up"' /tmp/api.health || grep -q '"database":"connected"' /tmp/api.health; then
    log_info "Database connection: OK"
  else
    log_warn "Database connection status unclear"
  fi
  
  if grep -q '"keycloak":"up"' /tmp/api.health || grep -q '"keycloak":"connected"' /tmp/api.health; then
    log_info "Keycloak connection: OK"
  else
    log_warn "Keycloak connection status unclear"
  fi
  
  return 0
}

cleanup() {
  rm -f /tmp/*.health
}

# Main execution
main() {
  log_info "Starting BLIH Production Health Check"
  log_info "====================================="
  
  # Set up cleanup on exit
  trap cleanup EXIT
  
  require_cmd curl
  require_cmd docker
  
  # System resource checks
  check_system_resources
  
  # Database connectivity check
  check_database_connectivity
  
  # Service health checks
  wait_for_url "keycloak" "$KEYCLOAK_HEALTHCHECK_URL" "$KEYCLOAK_RETRIES" "$SLEEP_SECONDS" "$TIMEOUT"
  wait_for_url "api" "$API_HEALTHCHECK_URL" "$RETRIES" "$SLEEP_SECONDS" "$TIMEOUT"
  
  # Validate API response
  validate_api_response
  
  log_info "====================================="
  log_info "All production health checks passed ✅"
  log_info "System is ready for production traffic"
}

# Execute main function
main "$@"
