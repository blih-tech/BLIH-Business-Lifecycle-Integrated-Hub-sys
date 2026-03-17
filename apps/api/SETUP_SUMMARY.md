# 🎉 BLIH System Database Setup - COMPLETE!

## What Was Set Up

You now have a **centralized development database environment on VPS** for team collaboration.

## 📦 Files Created

### Docker Configuration

- ✅ `docker-compose.yml` - Main Docker Compose file with all services
- ✅ `docker/init-scripts/01-init-databases.sh` - Creates both databases
- ✅ `docker/init-scripts/02-configure-remote-access.sh` - Remote access setup

### Environment Files

- ✅ `.env.local` - VPS server environment (localhost connections)
- ✅ `.env.team.template` - Template for team members (remote connections)

### Management Scripts

- ✅ `scripts/db-local.sh` - Main database management tool
- ✅ `scripts/check-ports.sh` - Port availability checker
- ✅ `scripts/get-vps-info.sh` - Generate team connection info

### Documentation

- VPS_SETUP_GUIDE.md - Complete VPS setup guide
- START_HERE.md - Quick start
- TEAM_QUICKSTART.md - Team setup
- README.md - Backend overview

### Package.json Scripts

Added npm commands for easy database management:

- `npm run db:start`
- `npm run db:stop`
- `npm run db:status`
- `npm run db:logs`
- `npm run db:check-ports`
- `npm run db:reset`

## 🗄️ Database Configuration

### Two Separate Databases

#### 1. keycloak

- **Purpose**: Keycloak authentication data
- **User**: `keycloak_user`
- **Password**: `keycloak_pass_2024`
- **Managed by**: Keycloak service
- **Access**: Via Keycloak Admin API only

#### 2. blih-system-dev

- **Purpose**: Main application data
- **User**: `blih_dev_user`
- **Password**: `blih_dev_pass_2024`
- **Managed by**: Your NestJS application
- **Access**: Direct access by application

### PostgreSQL Admin

- **User**: `postgres`
- **Password**: `postgres_admin_2024`
- **Port**: `5432` (exposed to 0.0.0.0 for team access)

## 🌐 Services & Ports

All services are exposed on `0.0.0.0` so team members can connect remotely:

| Service        | Port | Access      | Credentials         |
| -------------- | ---- | ----------- | ------------------- |
| PostgreSQL     | 5432 | Team + Apps | See databases above |
| Keycloak Admin | 8080 | Team        | admin / admin       |
| MailHog SMTP   | 1025 | Apps        | (no auth)           |
| MailHog Web UI | 8025 | Team        | (no auth)           |

✅ **All ports are available and ready to use!**

## 🚀 Getting Started (2 Paths)

### Path 1: VPS Administrator (You)

#### Start the Services

```bash
cd /root/blih-system-backend

# Check ports are available
./scripts/check-ports.sh

# Start all services
./scripts/db-local.sh start

# Wait 60 seconds for initialization
sleep 60

# Check health
./scripts/db-local.sh health

# Get connection info for team
./scripts/get-vps-info.sh
```

#### Configure Firewall

```bash
# Allow team access (choose one approach)

# Approach A: Allow from anywhere (easier, less secure)
sudo ufw allow 5432/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 8025/tcp
sudo ufw enable

# Approach B: Restrict to team IPs (recommended)
sudo ufw allow from <TEAM_MEMBER_IP> to any port 5432
sudo ufw allow from <TEAM_MEMBER_IP> to any port 8080
# ... repeat for other ports and team members
sudo ufw enable
```

#### Setup Automated Backups

```bash
# Run the backup setup commands from VPS_SETUP_GUIDE.md
# This creates daily automated backups
```

#### Share Info with Team

Send team members:

1. Output from `./scripts/get-vps-info.sh`
2. The file: `TEAM_QUICKSTART.md`
3. The file: `.env.team.template`

### Path 2: Team Member Setup

Team members should follow the guide: `TEAM_QUICKSTART.md`

Quick summary:

1. Clone repository
2. Create `.env` from `.env.team.template`
3. Replace `<VPS_HOST>` with actual VPS IP
4. Run `npm install`
5. Run `npm run start:dev`

## 🔌 Connection Examples

### From VPS (localhost)

```bash
# The VPS can use localhost since services run locally
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@localhost:5432/blih-system-dev
KEYCLOAK_URL=http://localhost:8080
```

This is already configured in `.env.local`.

### From Team Member Machines (Remote)

```bash
# Team members must use VPS IP/hostname
# Example if VPS IP is 192.168.1.100:
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@192.168.1.100:5432/blih-system-dev
KEYCLOAK_URL=http://192.168.1.100:8080

# Example if VPS has domain dev.blih.com:
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@dev.blih.com:5432/blih-system-dev
KEYCLOAK_URL=http://dev.blih.com:8080
```

This is configured in `.env.team.template`.

## 🎯 Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│              VPS Server (Centralized)                    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  PostgreSQL (Port 5432)                        │    │
│  │  ├─ Database: keycloak                         │    │
│  │  └─ Database: blih-system-dev                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Keycloak (Port 8080)                          │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  MailHog (1025/8025)                           │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                      ▲  ▲  ▲
                      │  │  │
         ┌────────────┘  │  └────────────┐
         │                │               │
    ┌────▼────┐      ┌───▼────┐     ┌───▼────┐
    │ Dev 1   │      │ Dev 2  │     │ Dev 3  │
    │ (Local) │      │(Local) │     │(Local) │
    └─────────┘      └────────┘     └────────┘

    Each developer runs code locally
    All connect to shared VPS database
    Collaborative development environment
```

## ⚙️ How It Works

### Development Flow

1. **VPS Administrator**:
   - Runs Docker services on VPS
   - Manages database and services
   - Handles backups and maintenance

2. **Team Members**:
   - Clone repository to their laptop
   - Configure `.env` with VPS connection
   - Run application locally
   - Application connects to VPS database
   - Share same data with all team

3. **Benefits**:
   - No database setup on developer machines
   - Everyone sees same data
   - Easy collaboration
   - Central management
   - Cloud-like architecture

## 🔐 Security Recommendations

### Must Do (Critical)

1. ✅ **Change default passwords** - Use strong random passwords
2. ✅ **Configure firewall** - Restrict ports to known IPs
3. ✅ **Setup backups** - Automated daily backups
4. ✅ **Monitor access** - Check who's connecting regularly

### Should Do (Recommended)

1. **Setup VPN** - Use WireGuard or similar
2. **Enable SSL** - For database connections
3. **Use secrets manager** - For credential management
4. **Setup alerts** - For downtime or issues
5. **Document procedures** - Keep runbooks updated

### Nice to Have (Enhanced Security)

1. **Two-factor authentication** - For VPS access
2. **Audit logging** - Track all database access
3. **Intrusion detection** - Monitor for suspicious activity
4. **Regular security audits** - Quarterly reviews
5. **Disaster recovery drills** - Test backup restoration

## 📊 Monitoring Dashboard (Optional)

Consider setting up monitoring tools:

- **Grafana + Prometheus**: For metrics visualization
- **pgAdmin**: For database administration
- **Portainer**: For Docker management
- **Uptime Kuma**: For service uptime monitoring

## 🎓 Next Steps

### For VPS Administrator (NOW)

1. ✅ Start services: `./scripts/db-local.sh start`
2. ✅ Configure firewall
3. ✅ Generate connection info: `./scripts/get-vps-info.sh`
4. ✅ Share with team
5. ✅ Setup automated backups

### For Team Members (AFTER VPS SETUP)

1. Follow `TEAM_QUICKSTART.md`
2. Configure `.env` file
3. Test connection
4. Start developing

### For Everyone (ONGOING)

1. Coordinate database migrations
2. Regular backups
3. Monitor resources
4. Report issues promptly
5. Follow best practices

## 📞 Getting Help

- **VPS Setup Issues**: See `VPS_SETUP_GUIDE.md`
- **Team Setup Issues**: See `TEAM_QUICKSTART.md`
- **Database Questions**: See `SETUP_COMPLETE.md`
- **Quick Reference**: See `START_HERE.md`

## 🎊 Success!

Your VPS is configured as a **centralized development database** for team collaboration!

**Ready to start?**

```bash
# On VPS
cd /root/blih-system-backend
./scripts/db-local.sh start
./scripts/get-vps-info.sh
```

Then share the connection info with your team and start developing! 🚀
