# ✅ BLIH System - VPS Database Setup Complete!

## 🎉 Success!

Your VPS is now configured as a **centralized development database server** for team collaboration!

## 📊 What's Running

All services are **UP and HEALTHY**:

✅ **PostgreSQL** (Port 5433) - Healthy, both databases created  
✅ **Keycloak** (Port 9080) - Healthy, realm imported successfully  
✅ **RabbitMQ** (Ports 5673, 15673) - Healthy  
✅ **MailHog** (Ports 1026, 8026) - Running  

## 🗄️ Databases Created

### 1. keycloak
- **Owner**: keycloak_user  
- **Purpose**: Stores Keycloak authentication data  
- **Status**: ✅ Created and accessible  

### 2. blih-system-dev
- **Owner**: blih_dev_user  
- **Purpose**: Main application database  
- **Status**: ✅ Created and accessible  

## 🌐 Your VPS Connection Details

**VPS IP**: `89.116.22.36`  
**Hostname**: `srv854806.hstgr.cloud`

### Service URLs (Accessible Remotely)

| Service | URL/Connection | Credentials |
|---------|----------------|-------------|
| **PostgreSQL** | `89.116.22.36:5433` | blih_dev_user / blih_dev_pass_2024 |
| **Keycloak Admin** | http://89.116.22.36:9080 | admin / admin |
| **RabbitMQ Mgmt** | http://89.116.22.36:15673 | blih_user / blih_pass_2024 |
| **MailHog Web** | http://89.116.22.36:8026 | (no auth) |

## 📋 For Team Members

Share this configuration with your team members. They should add it to their `.env` file:

```env
# Database Configuration
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@89.116.22.36:5433/blih-system-dev

# Keycloak Configuration
KEYCLOAK_URL=http://89.116.22.36:9080
KEYCLOAK_JWKS_URL=http://89.116.22.36:9080/realms/blih/protocol/openid-connect/certs
JWT_EXPECTED_ISSUER=http://89.116.22.36:9080/realms/blih

# RabbitMQ Configuration
RABBITMQ_URL=amqp://blih_user:blih_pass_2024@89.116.22.36:5673/blih

# Email Configuration (MailHog)
SMTP_HOST=89.116.22.36
SMTP_PORT=1026
```

## 🔐 Security Setup (IMPORTANT!)

### Step 1: Configure Firewall

**Choose ONE approach:**

#### Option A: Open to Internet (Quick, Less Secure)

```bash
sudo ufw allow 5433/tcp   # PostgreSQL
sudo ufw allow 9080/tcp   # Keycloak
sudo ufw allow 5673/tcp   # RabbitMQ AMQP
sudo ufw allow 15673/tcp  # RabbitMQ Management
sudo ufw allow 8026/tcp   # MailHog Web UI
sudo ufw enable
sudo ufw status
```

#### Option B: Restrict to Team IPs (Recommended, More Secure)

```bash
# Replace <TEAM_MEMBER_IP> with actual team member IPs
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5433
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 9080
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 5673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 15673
sudo ufw allow from <TEAM_MEMBER_IP_1> to any port 8026

# Repeat for each team member
sudo ufw allow from <TEAM_MEMBER_IP_2> to any port 5433
# ... etc

sudo ufw enable
sudo ufw status numbered
```

#### Option C: Use VPN (Most Secure)

Set up WireGuard or OpenVPN, then only allow VPN network access to these ports.

### Step 2: Change Default Passwords (Strongly Recommended)

```bash
# Change PostgreSQL passwords
docker exec -it blih-postgres-local psql -U postgres
# In psql:
ALTER USER postgres WITH PASSWORD 'your-strong-random-password-1';
ALTER USER keycloak_user WITH PASSWORD 'your-strong-random-password-2';
ALTER USER blih_dev_user WITH PASSWORD 'your-strong-random-password-3';
\q

# Then update docker-compose.local.yml and .env.local with new passwords
# Restart services: npm run db:restart
```

### Step 3: Setup Automated Backups

```bash
# Create backup directory
mkdir -p /root/blih-backups

# Create backup script
cat > /root/backup-blih-databases.sh << 'SCRIPT'
#!/bin/bash
BACKUP_DIR="/root/blih-backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec blih-postgres-local pg_dump -U postgres blih-system-dev | gzip > "$BACKUP_DIR/blih-system-dev_$DATE.sql.gz"
docker exec blih-postgres-local pg_dump -U postgres keycloak | gzip > "$BACKUP_DIR/keycloak_$DATE.sql.gz"
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
echo "Backup completed: $DATE"
SCRIPT

chmod +x /root/backup-blih-databases.sh

# Add to crontab (daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-blih-databases.sh >> /var/log/blih-backup.log 2>&1") | crontab -
```

## 📤 Share With Team

Send the following to your team members:

### 1. Quick Start Guide
Share the file: **`TEAM_QUICKSTART.md`**

### 2. Environment Template
Share the file: **`.env.team.template`**

### 3. Connection Details (Copy-Paste Ready)

```
🎯 BLIH System - VPS Connection Info

VPS IP: 89.116.22.36

Database (blih-system-dev):
  Host: 89.116.22.36
  Port: 5433
  Database: blih-system-dev
  Username: blih_dev_user
  Password: blih_dev_pass_2024

Keycloak Admin Console:
  URL: http://89.116.22.36:9080
  Username: admin
  Password: admin

RabbitMQ Management:
  URL: http://89.116.22.36:15673
  Username: blih_user
  Password: blih_pass_2024

MailHog (Email Testing):
  URL: http://89.116.22.36:8026

Quick Setup:
1. Clone repository
2. Copy .env.team.template to .env
3. Replace <VPS_HOST> with 89.116.22.36
4. Run: npm install
5. Run: npm run start:dev

Documentation: See TEAM_QUICKSTART.md
```

## 🔧 Management Commands

```bash
cd /root/blih-system-backend

# Service management
npm run db:status          # Check service status
npm run db:health          # Check health
npm run db:logs            # View logs
npm run db:restart         # Restart all services
npm run db:stop            # Stop all services
npm run db:start           # Start all services

# Database management
npm run db:psql            # Connect to blih-system-dev
npm run vps:backup         # Backup both databases
npm run vps:info           # Re-generate connection info

# Or use the script directly
./scripts/db-local.sh <command>
```

## 📊 Monitoring

### Check Service Health

```bash
# Quick health check
npm run db:health

# Detailed status
docker-compose -f docker-compose.local.yml ps

# View logs
docker logs blih-postgres-local --tail 50
docker logs blih-keycloak-local --tail 50
docker logs blih-rabbitmq-local --tail 50
```

### Check Database Connections

```bash
# See who's connected
docker exec blih-postgres-local psql -U postgres -c "
SELECT datname, count(*), array_agg(DISTINCT client_addr::text) as ips
FROM pg_stat_activity 
WHERE datname IN ('keycloak', 'blih-system-dev')
GROUP BY datname;"

# Check database sizes
docker exec blih-postgres-local psql -U postgres -c "
SELECT datname, pg_size_pretty(pg_database_size(datname))
FROM pg_database 
WHERE datname IN ('keycloak', 'blih-system-dev');"
```

## 🎓 Next Steps

### Immediate Actions

- [x] Services are running
- [x] Databases created
- [ ] **Configure firewall** (see Security Setup above)
- [ ] **Setup automated backups** (see Security Setup above)
- [ ] **Share connection info with team**
- [ ] **Test remote connection** (from another machine or ask team member)

### Ongoing Maintenance

1. **Daily**: Check service health (`npm run db:health`)
2. **Daily**: Verify automated backups are running
3. **Weekly**: Review logs for errors
4. **Weekly**: Check disk space usage
5. **Monthly**: Review and rotate credentials
6. **Quarterly**: Test backup restoration

## 🐛 Troubleshooting

### Team Member Can't Connect

1. **Check firewall**:
   ```bash
   sudo ufw status
   ```

2. **Test from VPS**:
   ```bash
   psql -h localhost -p 5433 -U blih_dev_user -d blih-system-dev
   # Should work
   ```

3. **Test external access** (from another machine):
   ```bash
   telnet 89.116.22.36 5433
   # Should connect
   ```

4. **Check if port is listening**:
   ```bash
   netstat -tuln | grep 5433
   # Should show 0.0.0.0:5433
   ```

### Services Not Starting

```bash
# Check logs
npm run db:logs

# Check disk space
df -h
docker system df

# Restart services
npm run db:restart
```

### High Resource Usage

```bash
# Check container resources
docker stats --no-stream

# Check long-running queries
docker exec blih-postgres-local psql -U postgres -c "
SELECT pid, usename, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active' AND query_start < now() - interval '1 minute';"
```

## 📚 Documentation Files

- **START_HERE.md** - Overview and quick commands
- **SETUP_SUMMARY.md** - What was set up
- **VPS_SETUP_GUIDE.md** - Complete VPS admin guide
- **TEAM_QUICKSTART.md** - 5-minute setup for team members
- **docker/TEAM_SETUP.md** - Detailed team member guide
- **docker/DATABASE_SETUP.md** - Database documentation
- **docker/QUICKSTART.md** - Quick start guide

## ✅ Pre-Production Checklist

Before announcing to team:

- [x] All services running and healthy
- [x] Both databases created successfully
- [x] Keycloak realm imported
- [x] VPS connection info generated
- [ ] Firewall configured
- [ ] Automated backups configured
- [ ] Default passwords changed (recommended)
- [ ] Team documentation shared
- [ ] At least one team member tested connection successfully

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│          VPS: 89.116.22.36 (srv854806.hstgr.cloud)      │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Port 5433)           ✅ HEALTHY   │    │
│  │  ├─ keycloak           [keycloak_user]         │    │
│  │  └─ blih-system-dev    [blih_dev_user]         │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Keycloak (Port 9080)             ✅ HEALTHY   │    │
│  │  • Realm 'blih' imported                       │    │
│  │  • Admin console accessible                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  RabbitMQ (5673/15673)            ✅ HEALTHY   │    │
│  │  • Management UI accessible                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  MailHog (1026/8026)              ✅ RUNNING   │    │
│  │  • Web UI accessible                           │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                      ▲  ▲  ▲
                      │  │  │
         ┌────────────┘  │  └────────────┐
         │                │               │
    ┌────▼────┐      ┌───▼────┐     ┌───▼────┐
    │ Dev 1   │      │ Dev 2  │     │ Dev 3  │
    │ Laptop  │      │ Laptop │     │ Laptop │
    └─────────┘      └────────┘     └────────┘
    
    Team members run code locally
    All connect to shared VPS database
```

## 🎊 You're All Set!

Your VPS is fully configured and ready for team development!

### To share with team now:

1. **Send connection details** (see "Share With Team" section above)
2. **Send TEAM_QUICKSTART.md**
3. **Send .env.team.template**

### Access URLs (test these):

- Keycloak: http://89.116.22.36:9080
- RabbitMQ: http://89.116.22.36:15673
- MailHog: http://89.116.22.36:8026

**🚀 Ready for team collaboration!**

For questions, see the comprehensive guides:
- VPS Admin: `VPS_SETUP_GUIDE.md`
- Team Members: `docker/TEAM_SETUP.md`
