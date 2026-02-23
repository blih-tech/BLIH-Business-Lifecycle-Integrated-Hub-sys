#!/bin/bash
# =============================================================================
# BLIH System - Local Database Management Script
# =============================================================================
# This script helps manage the local development database environment
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="$PROJECT_ROOT/docker-compose.local.yml"

# Print colored message
print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Start all services
start() {
    print_info "Starting BLIH System local database services..."
    check_docker
    docker-compose -f "$COMPOSE_FILE" up -d
    print_success "Services started successfully!"
    echo ""
    status
}

# Stop all services
stop() {
    print_info "Stopping BLIH System local database services..."
    check_docker
    docker-compose -f "$COMPOSE_FILE" down
    print_success "Services stopped successfully!"
}

# Restart all services
restart() {
    print_info "Restarting BLIH System local database services..."
    stop
    sleep 2
    start
}

# Show status of all services
status() {
    check_docker
    print_info "Service Status:"
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    print_info "Connection Information:"
    echo ""
    echo "  PostgreSQL:"
    echo "    Host: localhost"
    echo "    Port: 5433"
    echo "    Databases: keycloak, blih-system-dev"
    echo "    Admin User: postgres / postgres_admin_2024"
    echo ""
    echo "  Keycloak Admin Console: http://localhost:9080"
    echo "    Username: admin"
    echo "    Password: admin"
    echo ""
    echo "  RabbitMQ Management: http://localhost:15673"
    echo "    Username: blih_user"
    echo "    Password: blih_pass_2024"
    echo ""
    echo "  MailHog Web UI: http://localhost:8026"
    echo ""
}

# View logs
logs() {
    check_docker
    if [ -n "$1" ]; then
        docker-compose -f "$COMPOSE_FILE" logs -f "$1"
    else
        docker-compose -f "$COMPOSE_FILE" logs -f
    fi
}

# Connect to PostgreSQL
psql_connect() {
    check_docker
    local db="${1:-postgres}"
    print_info "Connecting to database: $db"
    docker exec -it blih-postgres-local psql -U postgres -d "$db"
}

# Reset databases (WARNING: destroys all data)
reset() {
    print_warning "⚠️  WARNING: This will destroy all data in the databases!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "Stopping services and removing volumes..."
        docker-compose -f "$COMPOSE_FILE" down -v
        print_success "All data has been removed."
        print_info "Starting services with fresh databases..."
        start
    else
        print_info "Reset cancelled."
    fi
}

# Check service health
health() {
    check_docker
    print_info "Checking service health..."
    echo ""
    
    # Check PostgreSQL
    if docker exec blih-postgres-local pg_isready -U postgres > /dev/null 2>&1; then
        print_success "PostgreSQL: Healthy"
    else
        print_error "PostgreSQL: Unhealthy"
    fi
    
    # Check Keycloak
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:9080 | grep -q "200\|303"; then
        print_success "Keycloak: Healthy"
    else
        print_error "Keycloak: Unhealthy (may still be starting up)"
    fi
    
    # Check RabbitMQ
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:15673 | grep -q "200"; then
        print_success "RabbitMQ: Healthy"
    else
        print_error "RabbitMQ: Unhealthy"
    fi
    
    # Check MailHog
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:8026 | grep -q "200"; then
        print_success "MailHog: Healthy"
    else
        print_error "MailHog: Unhealthy"
    fi
    echo ""
}

# Backup database
backup() {
    check_docker
    local db="${1:-blih-system-dev}"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$PROJECT_ROOT/backups"
    local backup_file="$backup_dir/${db}_${timestamp}.sql"
    
    mkdir -p "$backup_dir"
    
    print_info "Backing up database: $db"
    docker exec blih-postgres-local pg_dump -U postgres "$db" > "$backup_file"
    print_success "Backup saved to: $backup_file"
}

# Restore database
restore() {
    check_docker
    if [ -z "$1" ]; then
        print_error "Please provide backup file path"
        echo "Usage: $0 restore <backup_file.sql>"
        exit 1
    fi
    
    local backup_file="$1"
    if [ ! -f "$backup_file" ]; then
        print_error "Backup file not found: $backup_file"
        exit 1
    fi
    
    # Extract database name from filename (assumes format: dbname_timestamp.sql)
    local db_name=$(basename "$backup_file" | cut -d'_' -f1)
    
    print_warning "⚠️  This will restore $db_name from $backup_file"
    read -p "Continue? (yes/no): " confirm
    if [ "$confirm" = "yes" ]; then
        print_info "Restoring database: $db_name"
        docker exec -i blih-postgres-local psql -U postgres "$db_name" < "$backup_file"
        print_success "Database restored successfully!"
    else
        print_info "Restore cancelled."
    fi
}

# Show help
help() {
    echo "BLIH System - Local Database Management"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  start              Start all services"
    echo "  stop               Stop all services"
    echo "  restart            Restart all services"
    echo "  status             Show service status and connection info"
    echo "  logs [service]     View logs (optionally for specific service)"
    echo "  psql [database]    Connect to PostgreSQL (default: postgres)"
    echo "  health             Check health of all services"
    echo "  backup [database]  Backup database (default: blih-system-dev)"
    echo "  restore <file>     Restore database from backup file"
    echo "  reset              Reset all services and data (⚠️  destroys data)"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start                          # Start all services"
    echo "  $0 psql keycloak                  # Connect to keycloak database"
    echo "  $0 logs postgres                  # View PostgreSQL logs"
    echo "  $0 backup blih-system-dev         # Backup main database"
    echo "  $0 restore backups/db_backup.sql  # Restore from backup"
    echo ""
}

# Main script logic
case "${1:-help}" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    restart)
        restart
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    psql)
        psql_connect "$2"
        ;;
    health)
        health
        ;;
    backup)
        backup "$2"
        ;;
    restore)
        restore "$2"
        ;;
    reset)
        reset
        ;;
    help|--help|-h)
        help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        help
        exit 1
        ;;
esac
