# 🚀 BLIH System - VPS Database Setup for Team Development

## Overview

This guide is for setting up a **centralized development database** on a VPS server that multiple team members will connect to for development.

### Architecture Model

- **VPS Server**: Hosts shared databases and services (PostgreSQL, Keycloak, RabbitMQ, MailHog)
- **Team Members**: Develop code locally on their laptops, connect to VPS services
- **Benefits**: 
  - One source of truth for data
  - No database setup needed on developer machines
  - Consistent development environment
  - Easy collaboration and data sharing

## 🎯 Quick Start (VPS Administrator)

### Step 1: Check Prerequisites

```bash
# Ensure Docker is installed
docker --version
docker-compose --version

# Check available ports
cd /root/blih-system-backend
./scripts/check-ports.sh
```

### Step 2: Start Database Services

```bash
# Start all services
./scripts/db-local.sh start

# Wait 60 seconds for initialization
sleep 60

# Check health
./scripts/db-local.sh health
```

### Step 3: Get VPS Connection Info

```bash
# Generate connection information for team
./scripts/get-vps-info.sh
```

Copy the output and share it with your team members securely.

### Step 4: Configure Firewall

```bash
# Option A: Allow from anywhere (less secure, easier for development)
sudo ufw allow 5433/tcp   # PostgreSQL
sudo ufw allow 9080/tcp   # Keycloak
sudo ufw allow 5673/tcp   # RabbitMQ AMQP
sudo ufw allow 15673/tcp  # RabbitMQ Management
sudo ufw allow 8026/tcp   # MailHog Web UI
sudo ufw enable

# Option B: Restrict to specific team member IPs (more secure)
# Replace <TEAM_MEMBER_IP> with actual IPs
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5433
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 9080
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 15673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 8026

# Repeat for other team members
sudo ufw allow from <TEAM_MEMBER_IP_2> to any port 5433
# ... etc
```

### Step 5: Verify Remote Access

From your local machine (or ask a team member to test):

```bash
# Get VPS IP first
VPS_HOST="<your-vps-ip>"

# Test connectivity
ping $VPS_HOST

# Test PostgreSQL port
telnet $VPS_HOST 5433
# or
nc -zv $VPS_HOST 5433

# Test database connection
psql -h $VPS_HOST -p 5433 -U blih_dev_user -d blih-system-dev
# Password: blih_dev_pass_2024

# Test Keycloak
curl http://$VPS_HOST:9080
```

## 📦 What Gets Deployed on VPS

### Services Running on VPS

1. **PostgreSQL** (Port 5433)
   - Database: `keycloak` - for Keycloak data
   - Database: `blih-system-dev` - for application data
   - Persistent storage via Docker volumes

2. **Keycloak** (Port 9080)
   - Authentication and authorization server
   - Admin console for user/role management
   - Connected to `keycloak` database

3. **RabbitMQ** (Ports 5673, 15673)
   - Message broker for event-driven architecture
   - Management UI for monitoring queues

4. **MailHog** (Ports 1026, 8026)
   - Email testing service
   - Web UI to view sent emails

### What Team Members Run Locally

- NestJS application code
- Node.js development server
- Their IDE/editor
- Git for version control

## 🔐 Security Setup

### Recommended Security Measures

#### 1. Change Default Passwords (IMPORTANT!)

```bash
# Connect to PostgreSQL
docker exec -it blih-postgres-local psql -U postgres

# Change passwords
ALTER USER postgres WITH PASSWORD 'your-strong-random-password-1';
ALTER USER keycloak_user WITH PASSWORD 'your-strong-random-password-2';
ALTER USER blih_dev_user WITH PASSWORD 'your-strong-random-password-3';
\q

# Update docker-compose.local.yml with new passwords
# Update .env.local with new passwords
# Then restart services
docker-compose -f docker-compose.local.yml restart postgres
```

#### 2. Setup VPN (Recommended)

Instead of exposing ports to the internet, use a VPN:

- **WireGuard** (recommended, fast and easy)
- **OpenVPN** (traditional, widely supported)
- **Tailscale** (easiest, mesh VPN)

With VPN:
- Only team members with VPN access can reach services
- Firewall can be restricted to VPN network
- More secure than exposing ports to internet

#### 3. Configure Firewall with IP Whitelist

```bash
# Install ufw if not already installed
sudo apt-get update
sudo apt-get install ufw

# Default deny all incoming
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH (important!)
sudo ufw allow 22/tcp

# Allow only from team member IPs
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5433
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 9080
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 15673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 8026

# Repeat for each team member
# ...

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status numbered
```

#### 4. Enable SSL/TLS (Optional but Recommended)

For production-like security, set up SSL certificates:

```bash
# Install certbot
sudo apt-get install certbot

# Get certificates (requires domain name)
sudo certbot certonly --standalone -d dev.yourdomain.com

# Configure reverse proxy (Nginx or Caddy)
# to handle SSL termination
```

#### 5. Setup PostgreSQL Connection Encryption

Update PostgreSQL to require SSL:

```bash
# Generate SSL certificates for PostgreSQL
# Update docker-compose.local.yml to mount certificates
# Configure PostgreSQL to require SSL connections
```

## 📊 Monitoring & Maintenance

### Regular Health Checks

```bash
# Check service health
./scripts/db-local.sh health

# Check Docker resource usage
docker stats --no-stream

# Check disk usage
docker system df

# Check PostgreSQL connections
docker exec blih-postgres-local psql -U postgres -c "
SELECT datname, count(*) as connections 
FROM pg_stat_activity 
WHERE datname IN ('keycloak', 'blih-system-dev')
GROUP BY datname;"
```

### Automated Backups

Set up automated backups (CRITICAL for team development):

```bash
# Create backup directory
mkdir -p /root/blih-backups

# Create backup script
cat > /root/backup-blih-databases.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/root/blih-backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

echo "Starting backup at $DATE"

# Backup both databases
docker exec blih-postgres-local pg_dump -U postgres blih-system-dev | gzip > "$BACKUP_DIR/blih-system-dev_$DATE.sql.gz"
docker exec blih-postgres-local pg_dump -U postgres keycloak | gzip > "$BACKUP_DIR/keycloak_$DATE.sql.gz"

# Remove old backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $DATE"
echo "Files:"
ls -lh $BACKUP_DIR/*_$DATE.sql.gz
SCRIPT

chmod +x /root/backup-blih-databases.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-blih-databases.sh >> /var/log/blih-backup.log 2>&1") | crontab -

# Verify crontab
crontab -l
```

### Log Management

```bash
# Create log rotation for Docker logs
cat > /etc/logrotate.d/blih-docker << 'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=10M
    missingok
    delaycompress
    copytruncate
}
EOF
```

### Resource Monitoring

```bash
# Create monitoring script
cat > /root/monitor-blih-resources.sh << 'SCRIPT'
#!/bin/bash
echo "=== BLIH System Resource Monitor ==="
echo "Timestamp: $(date)"
echo ""

echo "=== Docker Containers ==="
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""

echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
echo ""

echo "=== Database Sizes ==="
docker exec blih-postgres-local psql -U postgres -c "
SELECT datname, pg_size_pretty(pg_database_size(datname)) 
FROM pg_database 
WHERE datname IN ('keycloak', 'blih-system-dev');"
echo ""

echo "=== Active Connections ==="
docker exec blih-postgres-local psql -U postgres -c "
SELECT datname, count(*) 
FROM pg_stat_activity 
WHERE datname IN ('keycloak', 'blih-system-dev') 
GROUP BY datname;"
echo ""

echo "=== Disk Usage ==="
df -h /var/lib/docker
docker system df
echo ""
SCRIPT

chmod +x /root/monitor-blih-resources.sh

# Add to crontab (every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * /root/monitor-blih-resources.sh >> /var/log/blih-monitor.log 2>&1") | crontab -
```

## 👥 Team Member Onboarding

### Send to New Team Members

1. **VPS connection details** (from `./scripts/get-vps-info.sh`)
2. **Team setup guide**: `docker/TEAM_SETUP.md`
3. **Environment template**: `.env.team.template`

### New Team Member Checklist

- [ ] Received VPS hostname/IP
- [ ] VPN access configured (if using VPN)
- [ ] Repository cloned
- [ ] `.env` file created from template
- [ ] VPS connectivity tested
- [ ] Database connection tested
- [ ] Application starts successfully
- [ ] Can access Swagger docs

## 🔄 Update PostgreSQL to Allow Remote Connections

PostgreSQL in Docker already listens on all interfaces by default, but verify:

```bash
# Check PostgreSQL is listening on all interfaces
docker exec blih-postgres-local psql -U postgres -c "SHOW listen_addresses;"
# Should show: *

# Check host-based authentication
docker exec blih-postgres-local cat /var/lib/postgresql/data/pg_hba.conf | grep -v "^#"
# Should include: host all all 0.0.0.0/0 md5
```

If needed, add custom configuration:

```bash
# Create custom pg_hba.conf (if needed)
cat > /root/blih-system-backend/docker/postgres/pg_hba.conf << 'EOF'
# Allow remote connections with password authentication
host    all             all             0.0.0.0/0               md5
host    all             all             ::/0                    md5
# Local connections
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
EOF

# Update docker-compose.local.yml to mount this file
# Then restart PostgreSQL
```

## 📈 Scaling Considerations

### Current Setup (Development)
- Single PostgreSQL instance
- No connection pooling beyond application
- No replication
- No load balancing

### When to Upgrade

Consider upgrading when:
- More than 10 active developers
- Database size exceeds 10GB
- Frequent performance issues
- Need for high availability

### Upgrade Path

1. **Connection Pooler**: Add PgBouncer for connection pooling
2. **Read Replicas**: Add PostgreSQL read replicas
3. **Managed Database**: Migrate to AWS RDS, Google Cloud SQL, or similar
4. **Load Balancer**: Add HAProxy or similar for Keycloak
5. **Production Keycloak**: Move to clustered Keycloak setup

## 🛡️ Backup & Disaster Recovery

### Backup Strategy

1. **Automated Daily Backups**: 
   - Runs at 2 AM daily
   - Keeps 30 days of backups
   - Compressed SQL dumps

2. **Manual Backup Before Major Changes**:
   ```bash
   ./scripts/db-local.sh backup blih-system-dev
   ./scripts/db-local.sh backup keycloak
   ```

3. **Verify Backups**:
   ```bash
   ls -lh /root/blih-backups/
   ```

### Restore Procedure

```bash
# Stop application instances (notify team!)
# Restore database
./scripts/db-local.sh restore /root/blih-backups/blih-system-dev_20260221_020000.sql.gz

# Verify restoration
./scripts/db-local.sh psql blih-system-dev
# Run some SELECT queries to verify data
```

### Disaster Recovery Plan

1. **Database Corruption**:
   - Stop services
   - Restore from latest backup
   - Verify data integrity
   - Notify team

2. **VPS Failure**:
   - Provision new VPS
   - Install Docker
   - Clone repository
   - Restore from backup
   - Update team with new VPS IP

3. **Data Loss**:
   - Restore from backup
   - Review backup timestamps with team
   - Identify lost changes
   - Coordinate re-implementation if needed

## 📞 Team Communication

### Important Announcements

Notify team when:
- Running database migrations
- Restarting services
- Performing backups/restores
- Changing credentials
- VPS maintenance scheduled
- Performance issues detected

### Recommended Channels

- Slack/Discord channel for announcements
- GitHub issues for tracking problems
- Email for critical changes
- Documentation wiki for procedures

## 🎓 Best Practices

### For VPS Administrator

1. **Regular Backups**: Ensure automated backups are working
2. **Monitor Resources**: Check CPU, memory, disk usage weekly
3. **Update Images**: Keep Docker images updated (coordinate with team)
4. **Security Updates**: Apply OS security patches regularly
5. **Document Changes**: Keep changelog of VPS configuration changes
6. **Access Control**: Regularly review who has access
7. **Credential Rotation**: Change passwords quarterly

### For Team Members

1. **Pull Before Starting**: Always `git pull` before development
2. **Coordinate Migrations**: Announce in team chat before running migrations
3. **Clean Up Data**: Don't leave test data that others might use
4. **Report Issues**: Report connection or performance issues immediately
5. **Use Transactions**: Wrap experimental queries in transactions
6. **Respect Shared Data**: Remember other developers are using the same database

## 🔧 Troubleshooting

### VPS Administrator Troubleshooting

#### Services Not Starting

```bash
# Check Docker
docker ps -a
docker-compose -f docker-compose.local.yml ps

# Check logs
./scripts/db-local.sh logs

# Check disk space
df -h
docker system df

# Restart services
./scripts/db-local.sh restart
```

#### High Resource Usage

```bash
# Check what's using resources
docker stats

# Check PostgreSQL active queries
docker exec blih-postgres-local psql -U postgres -c "
SELECT pid, usename, client_addr, state, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND datname IN ('keycloak', 'blih-system-dev')
ORDER BY duration DESC;"

# Kill long-running query if needed
docker exec blih-postgres-local psql -U postgres -c "SELECT pg_terminate_backend(<pid>);"
```

#### Team Member Cannot Connect

1. **Check firewall**:
   ```bash
   sudo ufw status
   ```

2. **Verify services are running**:
   ```bash
   ./scripts/db-local.sh status
   ```

3. **Check if port is accessible from outside**:
   ```bash
   # On VPS
   netstat -tuln | grep 5433
   ```

4. **Test from VPS localhost**:
   ```bash
   psql -h localhost -p 5433 -U blih_dev_user -d blih-system-dev
   ```

### Team Member Troubleshooting

See [docker/TEAM_SETUP.md](docker/TEAM_SETUP.md) for team member troubleshooting guide.

## 📊 Database Management

### Managing Migrations

#### Coordinator Role (Assign one person)

The migration coordinator should:

1. **Announce migration**:
   ```
   @team Running migration: Add users table
   Please save your work and stop dev servers for 2 minutes
   ```

2. **Run migration**:
   ```bash
   npm run prisma:migrate:dev
   ```

3. **Commit migration files**:
   ```bash
   git add src/prisma/migrations/
   git commit -m "feat: add users table migration"
   git push
   ```

4. **Announce completion**:
   ```
   @team Migration complete! Pull latest code and regenerate Prisma client:
   git pull
   npm run prisma:generate
   ```

#### Other Team Members

When a migration is announced:

1. Stop your dev server (Ctrl+C)
2. Wait for migration to complete
3. Pull latest code: `git pull`
4. Regenerate client: `npm run prisma:generate`
5. Restart dev server: `npm run start:dev`

### Database Cleanup

```bash
# Clean up test data periodically
docker exec -it blih-postgres-local psql -U blih_dev_user -d blih-system-dev

-- Inside psql
DELETE FROM test_table WHERE created_at < NOW() - INTERVAL '7 days';
-- etc
```

## 🎯 Connection String Reference

Replace `<VPS_HOST>` with actual VPS IP or hostname.

### For .env File (Team Members)

```env
# Main application database
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@<VPS_HOST>:5433/blih-system-dev

# Keycloak
KEYCLOAK_URL=http://<VPS_HOST>:9080
KEYCLOAK_JWKS_URL=http://<VPS_HOST>:9080/realms/blih/protocol/openid-connect/certs
JWT_EXPECTED_ISSUER=http://<VPS_HOST>:9080/realms/blih

# RabbitMQ
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@<VPS_HOST>:5673/blih

# Email
SMTP_HOST=<VPS_HOST>
SMTP_PORT=1026
```

### For Database Clients

**Connection Name**: BLIH Dev Database (VPS)

```
Host: <VPS_HOST>
Port: 5433
Database: blih-system-dev
Username: blih_dev_user
Password: blih_dev_pass_2024
SSL Mode: prefer (or disable for development)
```

## 🚀 Advanced Configuration

### Enable Connection Pooling (For Many Users)

If you have 10+ developers, add PgBouncer:

```yaml
# Add to docker-compose.local.yml
pgbouncer:
  image: pgbouncer/pgbouncer:latest
  container_name: blih-pgbouncer
  environment:
    DATABASES_HOST: postgres
    DATABASES_PORT: 5432
    DATABASES_USER: postgres
    DATABASES_PASSWORD: postgres_admin_2024
    DATABASES_DBNAME: blih-system-dev
    PGBOUNCER_POOL_MODE: transaction
    PGBOUNCER_MAX_CLIENT_CONN: 100
    PGBOUNCER_DEFAULT_POOL_SIZE: 20
  ports:
    - '0.0.0.0:6432:6432'
  depends_on:
    - postgres
  networks:
    - blih-network

# Team members then connect to port 6432 instead of 5433
```

### Enable Read Replicas (For Heavy Read Load)

```yaml
# Add to docker-compose.local.yml
postgres-replica:
  image: postgres:16-alpine
  container_name: blih-postgres-replica
  environment:
    POSTGRES_USER: replicator
    POSTGRES_PASSWORD: replicator_pass
    PGDATA: /var/lib/postgresql/data/replica
  command: |
    postgres 
    -c wal_level=replica 
    -c hot_standby=on 
    -c max_wal_senders=10 
    -c max_replication_slots=10
  ports:
    - '0.0.0.0:5434:5432'
  volumes:
    - postgres_replica_data:/var/lib/postgresql/data
  depends_on:
    - postgres
  networks:
    - blih-network
```

## 📋 Maintenance Schedule

### Daily
- Automated backup at 2 AM
- Resource monitoring

### Weekly
- Review backup logs
- Check disk usage
- Review slow query logs
- Update team on any issues

### Monthly
- Docker image updates (coordinate with team)
- OS security updates
- Review and update firewall rules
- Audit user access
- Test backup restoration

### Quarterly
- Change database passwords
- Review security configuration
- Performance tuning
- Capacity planning

## ✅ Setup Verification Checklist

### VPS Administrator

- [ ] Docker and Docker Compose installed
- [ ] Repository cloned to `/root/blih-system-backend`
- [ ] Ports checked and available
- [ ] Services started successfully
- [ ] Health check passes
- [ ] Firewall configured
- [ ] Automated backups configured
- [ ] VPS connection info generated
- [ ] Team members notified with connection details
- [ ] Default passwords changed (recommended)

### Team Member Setup

- [ ] VPS connection details received
- [ ] Repository cloned locally
- [ ] `.env` file configured with VPS host
- [ ] Can ping VPS
- [ ] Can connect to database
- [ ] Can access Keycloak admin console
- [ ] Application starts locally
- [ ] Can access local Swagger docs

## 📚 Additional Documentation

- **For Team Members**: [docker/TEAM_SETUP.md](docker/TEAM_SETUP.md)
- **Database Details**: [docker/DATABASE_SETUP.md](docker/DATABASE_SETUP.md)
- **Quick Start**: [docker/QUICKSTART.md](docker/QUICKSTART.md)
- **Main README**: [README.md](README.md)

## 🎉 You're All Set!

Your VPS is now configured as a centralized development database server. Team members can connect to these shared services and collaborate effectively.

### Next Steps

1. Share VPS connection info with team: `./scripts/get-vps-info.sh`
2. Send team members the `TEAM_SETUP.md` guide
3. Set up VPN or firewall rules for security
4. Run initial database migrations
5. Create test users in Keycloak
6. Begin development!
