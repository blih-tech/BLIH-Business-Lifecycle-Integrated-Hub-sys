# BLIH System - Team Development Setup Guide

## Overview

The BLIH System uses a **centralized development database** hosted on a VPS server. All team members connect to the same shared database and services for development work.

**Architecture**: Code is developed locally by each team member, but all services (database, Keycloak, RabbitMQ) run on the VPS and are shared across the team.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      VPS Server                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Port 5433)                              │   │
│  │    • Database: keycloak                              │   │
│  │    • Database: blih-system-dev                       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Keycloak (Port 9080)                                │   │
│  │    Authentication & Authorization Server             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  RabbitMQ (Ports 5673, 15673)                        │   │
│  │    Message Broker                                    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  MailHog (Ports 1026, 8026)                          │   │
│  │    Email Testing                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ▲
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐        ┌────▼───┐        ┌────▼───┐
    │ Dev 1  │        │ Dev 2  │        │ Dev 3  │
    │ Laptop │        │ Laptop │        │ Laptop │
    └────────┘        └────────┘        └────────┘
    
    Each developer:
    • Runs code locally
    • Connects to VPS database
    • Shares same data
```

## 📋 Team Member Setup

### Prerequisites

Each team member needs:
- Node.js 22+ installed
- Git installed
- Database client (optional): pgAdmin, DBeaver, or psql
- Network access to the VPS server
- VPS IP address or hostname

### Step 1: Get VPS Connection Details

Ask your team lead for:
- VPS IP address or hostname (example: `dev.blih.com` or `192.168.1.100`)
- SSH access credentials (if needed)

### Step 2: Clone Repository

```bash
git clone <repository-url>
cd blih-system-backend
npm install
```

### Step 3: Configure Environment

Create a `.env` file with VPS connection details:

```bash
cp .env.team.template .env
```

Then edit `.env` and replace `VPS_HOST` with your actual VPS hostname/IP:

```env
# Example: If VPS is at 192.168.1.100
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@192.168.1.100:5433/blih-system-dev
KEYCLOAK_URL=http://192.168.1.100:9080
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@192.168.1.100:5673/blih
SMTP_HOST=192.168.1.100
SMTP_PORT=1026

# Or if VPS has a domain name
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@dev.blih.com:5433/blih-system-dev
KEYCLOAK_URL=http://dev.blih.com:9080
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@dev.blih.com:5673/blih
SMTP_HOST=dev.blih.com
SMTP_PORT=1026
```

### Step 4: Test Connection

```bash
# Test database connection
npm run db:test-connection

# Or manually test with psql
psql -h <VPS_HOST> -p 5433 -U blih_dev_user -d blih-system-dev
# Password: blih_dev_pass_2024
```

### Step 5: Start Development

```bash
# Generate Prisma client
npm run prisma:generate

# Start your application locally
npm run start:dev
```

Your local application will connect to the shared VPS database.

## 🔌 Connection Details for Team Members

Replace `<VPS_HOST>` with your actual VPS IP or hostname.

### Main Application Database (blih-system-dev)

```
Host: <VPS_HOST>
Port: 5433
Database: blih-system-dev
Username: blih_dev_user
Password: blih_dev_pass_2024
SSL: Not required (VPN recommended)
```

**Connection String**:
```
postgresql://blih_dev_user:blih_dev_pass_2024@<VPS_HOST>:5433/blih-system-dev
```

### Keycloak Admin Console

```
URL: http://<VPS_HOST>:9080
Username: admin
Password: admin
```

### RabbitMQ Management Console

```
URL: http://<VPS_HOST>:15673
Username: blih_user
Password: blih_pass_2024
```

### MailHog Web UI

```
URL: http://<VPS_HOST>:8026
(No authentication required)
```

## 📱 Using Database Clients

### pgAdmin Configuration

1. Right-click "Servers" → Create → Server
2. General tab:
   - Name: `BLIH Dev Database (VPS)`
3. Connection tab:
   - Host: `<VPS_HOST>`
   - Port: `5433`
   - Maintenance database: `blih-system-dev`
   - Username: `blih_dev_user`
   - Password: `blih_dev_pass_2024`
4. Save

### DBeaver Configuration

1. Database → New Database Connection → PostgreSQL
2. Enter connection details:
   - Server: `<VPS_HOST>`
   - Port: `5433`
   - Database: `blih-system-dev`
   - Username: `blih_dev_user`
   - Password: `blih_dev_pass_2024`
3. Test Connection → Finish

### VSCode PostgreSQL Extension

1. Install "PostgreSQL" extension
2. Add connection:
   - Host: `<VPS_HOST>`
   - Port: `5433`
   - Database: `blih-system-dev`
   - Username: `blih_dev_user`
   - Password: `blih_dev_pass_2024`

## 🔐 Security Considerations

### Current Setup (Development)

✅ **Enabled**:
- Container isolation
- Network segmentation within Docker
- Separate database users with limited permissions
- Data persistence via Docker volumes

⚠️ **Not Enabled** (Development Trade-offs):
- SSL/TLS encryption
- Strong passwords (using dev passwords)
- IP whitelist restrictions
- Database connection encryption

### Recommendations

#### For Development VPS:

1. **Use VPN**: Set up a VPN so only team members with VPN access can reach the database
2. **Firewall Rules**: Restrict ports 5433, 9080, 5673, 15673 to known IP addresses
3. **Change Default Passwords**: Update all passwords before use (see "Changing Passwords" section)
4. **Regular Backups**: Set up automated backups of the database

#### Command to Check Who Can Access:

```bash
# On VPS, check firewall status
sudo ufw status

# Check which IPs are connected to PostgreSQL
docker exec blih-postgres-local psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

## 🔄 Team Workflow

### Daily Development Flow

1. **Team member starts work**:
   ```bash
   cd blih-system-backend
   git pull origin main
   npm install
   npm run start:dev
   ```

2. **Application connects to VPS**:
   - Database on VPS
   - Keycloak on VPS
   - RabbitMQ on VPS
   - Shared data with all team members

3. **Make changes and test**:
   - Code changes are local
   - Database changes affect all team members
   - Test using shared Keycloak users

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push
   ```

### Database Migrations

⚠️ **IMPORTANT**: Coordinate migrations with team!

```bash
# Before running migrations, announce to team in chat/Slack
# "Running migration: [description]"

# Run migration
npm run prisma:migrate:dev

# Commit migration files
git add src/prisma/migrations/
git commit -m "feat: add migration for [feature]"
git push
```

### Best Practices

1. **Coordinate migrations**: Always announce before running migrations
2. **Use feature branches**: Develop on branches, merge to main when ready
3. **Avoid data conflicts**: Coordinate when working on same features
4. **Regular pulls**: `git pull` frequently to stay updated
5. **Database backups**: Keep backups before major migrations

## 🔧 Changing Passwords (Recommended)

### For Production-like Security:

#### 1. Update PostgreSQL Passwords

```bash
# Connect to PostgreSQL
docker exec -it blih-postgres-local psql -U postgres

# Inside psql, run:
ALTER USER postgres WITH PASSWORD 'your-strong-password-1';
ALTER USER keycloak_user WITH PASSWORD 'your-strong-password-2';
ALTER USER blih_dev_user WITH PASSWORD 'your-strong-password-3';
\q
```

#### 2. Update RabbitMQ Passwords

```bash
# Connect to RabbitMQ container
docker exec -it blih-rabbitmq-local rabbitmqctl change_password blih_user your-strong-password-4
```

#### 3. Update Keycloak Admin Password

1. Access Keycloak: `http://<VPS_HOST>:9080`
2. Login with current credentials
3. Click "Admin" (top right) → Manage account → Password
4. Update password

#### 4. Update docker-compose.local.yml

Update the environment variables with new passwords.

#### 5. Update .env.local

Update connection strings with new passwords.

#### 6. Share New Credentials Securely

Use a password manager or secure channel to share with team members.

## 📊 Monitoring & Maintenance

### Check Service Health

```bash
# Via script
./scripts/db-local.sh health

# Manual checks
docker ps                                    # Check if containers are running
docker stats --no-stream                     # Check resource usage
docker-compose -f docker-compose.local.yml logs -f  # View logs
```

### Database Monitoring

```bash
# Check database size
docker exec blih-postgres-local psql -U postgres -c "
SELECT 
    datname as database,
    pg_size_pretty(pg_database_size(datname)) as size
FROM pg_database
WHERE datname IN ('keycloak', 'blih-system-dev');"

# Check active connections
docker exec blih-postgres-local psql -U postgres -c "
SELECT 
    datname,
    count(*) as connections,
    max(state) as state
FROM pg_stat_activity
WHERE datname IN ('keycloak', 'blih-system-dev')
GROUP BY datname;"

# Check long-running queries
docker exec blih-postgres-local psql -U postgres -c "
SELECT pid, usename, datname, state, query_start, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query_start < now() - interval '1 minute';"
```

### Backups

```bash
# Backup both databases
./scripts/db-local.sh backup blih-system-dev
./scripts/db-local.sh backup keycloak

# Backups are saved to: backups/
```

## 🚨 Troubleshooting for Team Members

### Cannot Connect to VPS Database

1. **Check VPS is accessible**:
   ```bash
   ping <VPS_HOST>
   telnet <VPS_HOST> 5433
   ```

2. **Check firewall**:
   - Contact DevOps/Admin to whitelist your IP
   - Or connect via VPN

3. **Verify credentials**:
   - Double-check username and password
   - Ensure you're using the correct database name

### Connection Timeout

- **Cause**: Firewall blocking connection
- **Solution**: Contact admin to whitelist your IP or set up VPN

### Authentication Failed

- **Cause**: Wrong credentials
- **Solution**: Verify username/password with team lead

### Database Appears Empty

- **Cause**: Migrations not run yet
- **Solution**: Ask team if migrations have been run, or run them yourself after coordinating

## 👥 For VPS Administrators

### Initial Setup on VPS

```bash
# 1. Clone repository
git clone <repository-url>
cd blih-system-backend

# 2. Check ports are available
./scripts/check-ports.sh

# 3. Start services
./scripts/db-local.sh start

# 4. Wait for services to initialize (60 seconds)
sleep 60

# 5. Check health
./scripts/db-local.sh health

# 6. Verify databases are created
./scripts/db-local.sh psql postgres
# In psql: \l
```

### Firewall Configuration

#### Ubuntu/Debian with UFW:

```bash
# Allow SSH (if not already allowed)
sudo ufw allow 22/tcp

# Allow database access (PostgreSQL)
sudo ufw allow 5433/tcp

# Allow Keycloak
sudo ufw allow 9080/tcp

# Allow RabbitMQ
sudo ufw allow 5673/tcp
sudo ufw allow 15673/tcp

# Allow MailHog
sudo ufw allow 1026/tcp
sudo ufw allow 8026/tcp

# Enable firewall
sudo ufw enable
```

#### Restrict to Specific IPs (Recommended):

```bash
# Replace <TEAM_MEMBER_IP> with actual IPs
sudo ufw allow from <TEAM_MEMBER_IP> to any port 5433
sudo ufw allow from <TEAM_MEMBER_IP> to any port 9080
sudo ufw allow from <TEAM_MEMBER_IP> to any port 5673
sudo ufw allow from <TEAM_MEMBER_IP> to any port 15673
```

### PostgreSQL Remote Access Configuration

Create pg_hba.conf override (already handled by Docker, but for reference):

```bash
# PostgreSQL is configured to accept password authentication
# from any IP for development. In production, restrict to specific IPs.
```

### Automated Backups

```bash
# Create backup script
cat > /root/backup-blih-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/blih-backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker exec blih-postgres-local pg_dump -U postgres blih-system-dev > "$BACKUP_DIR/blih-system-dev_$DATE.sql"
docker exec blih-postgres-local pg_dump -U postgres keycloak > "$BACKUP_DIR/keycloak_$DATE.sql"

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /root/backup-blih-db.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-blih-db.sh") | crontab -
```

### Monitoring

```bash
# Install monitoring script
cat > /root/monitor-blih.sh << 'EOF'
#!/bin/bash
cd /root/blih-system-backend
./scripts/db-local.sh health

# Check disk usage
echo ""
echo "Disk Usage:"
docker system df

# Check container stats
echo ""
echo "Container Stats:"
docker stats --no-stream
EOF

chmod +x /root/monitor-blih.sh

# Add to crontab (hourly)
(crontab -l 2>/dev/null; echo "0 * * * * /root/monitor-blih.sh >> /var/log/blih-monitor.log 2>&1") | crontab -
```

## 📝 Environment File Template for Team

Create this template and share with team members:

**File**: `.env.team.template`

```env
# =============================================================================
# BLIH System - Team Member Environment Configuration
# =============================================================================
# Replace <VPS_HOST> with the actual VPS hostname or IP address
# Example: dev.blih.com or 192.168.1.100
# =============================================================================

NODE_ENV=development
PORT=5000
API_PREFIX=api/v1
CORS_ORIGIN=*
SWAGGER_ENABLED=true

# =============================================================================
# Database Configuration (VPS Shared Database)
# =============================================================================
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@<VPS_HOST>:5433/blih-system-dev
SKIP_DATABASE_CONNECT=false

# =============================================================================
# Keycloak (VPS Shared Service)
# =============================================================================
KEYCLOAK_ENABLED=true
KEYCLOAK_URL=http://<VPS_HOST>:9080
KEYCLOAK_REALM=blih
KEYCLOAK_CLIENT_ID=blih-system-api
KEYCLOAK_CLIENT_SECRET=my-blih-dev-secret-2024
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# JWT Configuration
KEYCLOAK_JWKS_URL=http://<VPS_HOST>:9080/realms/blih/protocol/openid-connect/certs
JWT_EXPECTED_AUDIENCE=blih-system-api
JWT_EXPECTED_ISSUER=http://<VPS_HOST>:9080/realms/blih

KEYCLOAK_FRONTEND_CLIENT_ID=blih-system-frontend
KEYCLOAK_FRONTEND_REDIRECT_URI=http://localhost:3000/api/auth/callback/keycloak

# Security settings
TRUST_PROXY_PRINCIPAL_HEADERS=false
INTERNAL_AUTH_SHARED_SECRET=change-me-before-enabling-trusted-headers
ENFORCE_MFA_FOR_PRIVILEGED=false
AUTH_POLICY_VERSION=1.0

# =============================================================================
# RabbitMQ (VPS Shared Service)
# =============================================================================
RABBITMQ_ENABLED=true
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@<VPS_HOST>:5673/blih
RABBITMQ_EXCHANGE=blih.events
RABBITMQ_DLQ=system.dlq
EVENT_CONTRACT_VERSION=1.0
EVENT_SCHEMA_PREFIX=blih.event
EVENT_SUPPORTED_MAJOR_VERSION=1
MAX_RETRY_ATTEMPTS=3
RETRY_BACKOFF_MS=1000

# =============================================================================
# Email (VPS Shared MailHog)
# =============================================================================
SMTP_ENABLED=true
SMTP_HOST=<VPS_HOST>
SMTP_PORT=1026
SMTP_SECURE=false
SMTP_USER=noreply@blih.local
SMTP_PASSWORD=changeme
EMAIL_FROM=BLIH System <noreply@blih.local>

# =============================================================================
# Other Configuration (Keep defaults)
# =============================================================================
RATE_LIMIT_TTL_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
HELMET_ENABLED=true
AUDIT_RETENTION_DAYS=2555
PRINCIPAL_CONTEXT_TTL_MS=30000
SYNC_ROLES_FROM_KEYCLOAK=false
LOG_LEVEL=debug
LOG_FORMAT=json
SYNC_USERS_CRON=0 */30 * * * *
SYNC_ROLES_CRON=0 0 */2 * * *
ROTATE_SECRETS_CRON=0 0 1 * *
CLEANUP_AUDIT_CRON=0 0 2 * *
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_TIMEOUT_MS=5000
WEBSOCKET_ENABLED=true
WEBSOCKET_PORT=5001
WEBSOCKET_PATH=/socket.io
DEBUG=true
LOG_REQUESTS=true
PERFORMANCE_MONITORING=true
DATABASE_POOL_SIZE=10
DATABASE_TIMEOUT_MS=30000
KEYCLOAK_TIMEOUT_MS=10000
RABBITMQ_TIMEOUT_MS=10000
MULTI_REALM_ENABLED=true
ORGANIZATION_HIERARCHY_ENABLED=true
ADVANCED_RBAC_ENABLED=true
AUDIT_EXPORT_ENABLED=true
NOTIFICATION_BATCHING_ENABLED=true
```

## 🎯 Quick Reference

### For Team Members (Developers)

```bash
# Get latest code
git pull

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Start development server (connects to VPS)
npm run start:dev

# Your app runs locally but uses VPS database
# Access at: http://localhost:5000
```

### For VPS Administrator

```bash
# Start all services
./scripts/db-local.sh start

# Check status
./scripts/db-local.sh status

# View logs
./scripts/db-local.sh logs

# Backup databases
./scripts/db-local.sh backup blih-system-dev
./scripts/db-local.sh backup keycloak

# Check health
./scripts/db-local.sh health
```

## 📞 Getting Help

### Common Issues

| Issue | Solution |
|-------|----------|
| Cannot connect to VPS | Check VPN connection, firewall rules, VPS is running |
| Wrong credentials | Verify with team lead, check .env file |
| Database timeout | Check VPS resource usage, restart database |
| Migration conflicts | Coordinate with team, resolve in order |
| Port conflicts on VPS | Admin should change ports in docker-compose.local.yml |

### Contact

- **Database issues**: Contact VPS Administrator
- **Authentication issues**: Contact DevOps/Keycloak Admin
- **Code issues**: Create GitHub issue or ask in team chat

## ✅ Setup Checklist for Team Members

- [ ] VPS hostname/IP received from team lead
- [ ] Repository cloned
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured with VPS host
- [ ] Can ping VPS server
- [ ] Can connect to database (test with psql or db client)
- [ ] Can access Keycloak admin console
- [ ] Can start application (`npm run start:dev`)
- [ ] Can access API at `http://localhost:5000/api/v1/docs`

## 🎓 Additional Resources

- Main README: [../README.md](../README.md)
- Database Setup Guide: [DATABASE_SETUP.md](./DATABASE_SETUP.md)
- Quick Start: [QUICKSTART.md](./QUICKSTART.md)
- Docker README: [README.md](./README.md)
