#!/bin/bash
# =============================================================================
# BLIH System - Port Availability Checker
# =============================================================================
# This script checks if the required ports are available before starting services
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Ports to check
declare -A PORTS=(
    ["5433"]="PostgreSQL"
    ["9080"]="Keycloak"
    ["5673"]="RabbitMQ AMQP"
    ["15673"]="RabbitMQ Management"
    ["1026"]="MailHog SMTP"
    ["8026"]="MailHog Web UI"
)

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

check_port() {
    local port=$1
    local service=$2
    
    # Check if port is in use (works on Linux and macOS)
    if command -v lsof > /dev/null 2>&1; then
        # Using lsof
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            local process=$(lsof -Pi :$port -sTCP:LISTEN | tail -n 1)
            print_error "Port $port ($service) is already in use"
            echo "         Process: $process"
            return 1
        fi
    elif command -v netstat > /dev/null 2>&1; then
        # Using netstat (fallback)
        if netstat -tuln 2>/dev/null | grep -q ":$port "; then
            print_error "Port $port ($service) is already in use"
            return 1
        fi
    elif command -v ss > /dev/null 2>&1; then
        # Using ss (fallback)
        if ss -tuln 2>/dev/null | grep -q ":$port "; then
            print_error "Port $port ($service) is already in use"
            return 1
        fi
    else
        print_warning "Cannot check port $port - no port checking tool available"
        return 0
    fi
    
    print_success "Port $port ($service) is available"
    return 0
}

main() {
    print_info "Checking port availability for BLIH System services..."
    echo ""
    
    local all_available=true
    
    for port in "${!PORTS[@]}"; do
        if ! check_port "$port" "${PORTS[$port]}"; then
            all_available=false
        fi
    done
    
    echo ""
    
    if [ "$all_available" = true ]; then
        print_success "All required ports are available!"
        exit 0
    else
        print_error "Some ports are in use. Please stop the conflicting services or modify the port configuration."
        echo ""
        print_info "To modify ports, edit: docker-compose.local.yml"
        exit 1
    fi
}

main
