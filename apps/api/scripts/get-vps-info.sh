#!/bin/bash
# =============================================================================
# BLIH System - VPS Connection Information Generator
# =============================================================================
# This script generates connection information for team members
# Run this on the VPS to get connection details
# =============================================================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

print_info() {
    echo -e "${BLUE}$1${NC}"
}

print_warning() {
    echo -e "${YELLOW}$1${NC}"
}

# Get VPS IP address
get_ip() {
    # Try multiple methods to get external IP
    local ip=""
    
    # Method 1: hostname -I (gets local IPs)
    if command -v hostname > /dev/null 2>&1; then
        ip=$(hostname -I | awk '{print $1}')
    fi
    
    # Method 2: Try to get public IP
    if [ -z "$ip" ] || [[ $ip == 127.* ]]; then
        ip=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || curl -s ipecho.net/plain 2>/dev/null)
    fi
    
    echo "$ip"
}

# Get hostname
get_hostname() {
    hostname -f 2>/dev/null || hostname
}

# Main
main() {
    clear
    
    print_header "BLIH System - VPS Connection Information"
    
    local vps_ip=$(get_ip)
    local vps_hostname=$(get_hostname)
    
    echo "📍 VPS Information:"
    echo "   IP Address: $vps_ip"
    echo "   Hostname: $vps_hostname"
    echo ""
    
    print_warning "⚠️  Share this information with your team members securely!"
    echo ""
    
    print_header "Service Access URLs"
    
    echo "🗄️  PostgreSQL Database:"
    echo "   Host: $vps_ip"
    echo "   Port: 5433"
    echo "   Databases: keycloak, blih-system-dev"
    echo ""
    echo "   Main App Database:"
    echo "   • Database: blih-system-dev"
    echo "   • Username: blih_dev_user"
    echo "   • Password: blih_dev_pass_2024"
    echo ""
    echo "   Connection String:"
    echo "   postgresql://blih_dev_user:blih_dev_pass_2024@$vps_ip:5433/blih-system-dev"
    echo ""
    
    echo "🔐 Keycloak Admin Console:"
    echo "   URL: http://$vps_ip:9080"
    echo "   Username: admin"
    echo "   Password: admin"
    echo ""
    
    echo "🐰 RabbitMQ Management:"
    echo "   URL: http://$vps_ip:15673"
    echo "   Username: blih_user"
    echo "   Password: blih_pass_2024"
    echo ""
    echo "   Connection String:"
    echo "   amqp://blih_user:blih_pass_2024@$vps_ip:5673/blih"
    echo ""
    
    echo "📧 MailHog (Email Testing):"
    echo "   URL: http://$vps_ip:8026"
    echo "   SMTP: $vps_ip:1026"
    echo ""
    
    print_header "Environment Configuration for Team"
    
    echo "Share this .env configuration with team members:"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat << EOF
# Database Configuration
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@$vps_ip:5433/blih-system-dev

# Keycloak Configuration
KEYCLOAK_URL=http://$vps_ip:9080
KEYCLOAK_JWKS_URL=http://$vps_ip:9080/realms/blih/protocol/openid-connect/certs
JWT_EXPECTED_ISSUER=http://$vps_ip:9080/realms/blih

# RabbitMQ Configuration
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@$vps_ip:5673/blih

# Email Configuration
SMTP_HOST=$vps_ip
SMTP_PORT=1026
EOF
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    print_header "Firewall Configuration"
    
    echo "Run these commands to allow team access:"
    echo ""
    echo "  # Allow all team members (less secure)"
    echo "  sudo ufw allow 5433/tcp   # PostgreSQL"
    echo "  sudo ufw allow 9080/tcp   # Keycloak"
    echo "  sudo ufw allow 5673/tcp   # RabbitMQ AMQP"
    echo "  sudo ufw allow 15673/tcp  # RabbitMQ Management"
    echo "  sudo ufw allow 8026/tcp   # MailHog Web"
    echo ""
    echo "  # Or restrict to specific IPs (more secure)"
    echo "  sudo ufw allow from <TEAM_MEMBER_IP> to any port 5433"
    echo "  sudo ufw allow from <TEAM_MEMBER_IP> to any port 9080"
    echo "  # ... repeat for other ports"
    echo ""
    
    print_header "Quick Test Commands for Team"
    
    echo "Share these test commands with team members:"
    echo ""
    echo "  # Test VPS connectivity"
    echo "  ping $vps_ip"
    echo ""
    echo "  # Test database port"
    echo "  telnet $vps_ip 5433"
    echo "  # or"
    echo "  nc -zv $vps_ip 5433"
    echo ""
    echo "  # Test Keycloak access"
    echo "  curl http://$vps_ip:9080"
    echo ""
    echo "  # Connect to database"
    echo "  psql -h $vps_ip -p 5433 -U blih_dev_user -d blih-system-dev"
    echo ""
    
    print_header "Setup Complete"
    
    print_info "✓ VPS is configured for team development"
    print_info "✓ Share the information above with your team"
    print_info "✓ See docker/TEAM_SETUP.md for detailed team instructions"
    echo ""
}

main
