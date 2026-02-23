# 🎯 START HERE - BLIH System Database Setup

## What Is This?

This is a **centralized VPS database setup** for the BLIH System. Multiple team members can develop code locally while sharing a common database hosted on this VPS.

## 🏗️ Architecture

- **VPS (This Server)**: Runs databases and services (PostgreSQL, Keycloak, RabbitMQ)
- **Team Members**: Develop code locally, connect to VPS services
- **One Source of Truth**: All developers share the same data

## 🚀 Quick Start Commands

### On VPS (Run These First)

```bash
cd /root/blih-system-backend

# 1. Check if ports are available
npm run db:check-ports

# 2. Start all database services
npm run db:start

# 3. Wait 60 seconds for initialization
sleep 60

# 4. Check if everything is healthy
npm run db:health

# 5. Get connection info for your team
npm run vps:info
```

### Share With Team

After running the commands above, send your team members:

1. **Connection info** (output from `npm run vps:info`)
2. **Setup guide**: `TEAM_QUICKSTART.md` (simple guide)
3. **Detailed guide**: `docker/TEAM_SETUP.md` (comprehensive guide)
4. **Environment template**: `.env.team.template`

## 📁 Key Files

| File | Purpose | Who Uses It |
|------|---------|-------------|
| `docker-compose.local.yml` | Services configuration | VPS Admin |
| `.env.local` | VPS environment (localhost) | VPS Admin |
| `.env.team.template` | Team member template | Team Members |
| `VPS_SETUP_GUIDE.md` | Complete VPS setup guide | VPS Admin |
| `TEAM_QUICKSTART.md` | Quick start for team | Team Members |
| `docker/TEAM_SETUP.md` | Detailed team guide | Team Members |

## 📊 Services & Databases

### Services on VPS
- **PostgreSQL** (Port 5433) - Database server
- **Keycloak** (Port 9080) - Authentication server
- **RabbitMQ** (Ports 5673, 15673) - Message broker
- **MailHog** (Ports 1026, 8026) - Email testing

### Databases
- **keycloak** - Keycloak authentication data
- **blih-system-dev** - Main application data

## 🔐 Security Checklist

Before sharing with team:

- [ ] Change default passwords (see `VPS_SETUP_GUIDE.md`)
- [ ] Configure firewall rules
- [ ] Setup automated backups
- [ ] Enable VPN (recommended) or IP whitelist
- [ ] Test remote connection from outside VPS

## 📚 Documentation Guide

Read documentation in this order:

### For VPS Administrator (You)

1. **START_HERE.md** (this file) - Overview
2. **SETUP_SUMMARY.md** - What was set up
3. **VPS_SETUP_GUIDE.md** - Complete admin guide
4. **docker/DATABASE_SETUP.md** - Database details

### For Team Members

Share these with your team:

1. **TEAM_QUICKSTART.md** - 5-minute setup
2. **docker/TEAM_SETUP.md** - Detailed guide
3. **.env.team.template** - Configuration template

## ⚙️ Management Commands

All commands from project root (`/root/blih-system-backend`):

```bash
# Service management
npm run db:start           # Start all services
npm run db:stop            # Stop all services
npm run db:restart         # Restart services
npm run db:status          # Show service status
npm run db:health          # Check service health
npm run db:logs            # View logs

# Database management
npm run db:psql            # Connect to blih-system-dev
npm run vps:backup         # Backup both databases
npm run db:reset           # Reset everything (⚠️ destroys data)

# Team information
npm run vps:info           # Generate connection info for team
npm run db:check-ports     # Check port availability

# Or use the helper script
./scripts/db-local.sh <command>
```

## 🎯 What's Next?

### Immediate Actions (VPS Admin)

1. ✅ **Start services**: `npm run db:start`
2. ✅ **Configure firewall**: Allow team access (see VPS_SETUP_GUIDE.md)
3. ✅ **Setup backups**: See VPS_SETUP_GUIDE.md backup section
4. ✅ **Get connection info**: `npm run vps:info`
5. ✅ **Share with team**: Send TEAM_QUICKSTART.md + connection info

### Team Member Actions

1. Follow `TEAM_QUICKSTART.md`
2. Configure `.env` with VPS host
3. Start developing

### Ongoing Maintenance

1. **Monitor health**: `npm run db:health` (daily)
2. **Check backups**: Verify backups are running (daily)
3. **Review logs**: Check for errors (weekly)
4. **Update passwords**: Rotate credentials (quarterly)

## 🆘 Troubleshooting

### Services Won't Start

```bash
# Check logs
npm run db:logs

# Check Docker
docker ps -a
docker system df

# Check ports
npm run db:check-ports

# Try restart
npm run db:restart
```

### Team Member Can't Connect

1. **Check firewall**: `sudo ufw status`
2. **Check services**: `npm run db:status`
3. **Test from VPS**: `psql -h localhost -p 5433 -U blih_dev_user -d blih-system-dev`
4. **Check their .env file**: Ensure `<VPS_HOST>` was replaced

### Need More Help?

See the detailed guides:
- **VPS issues**: `VPS_SETUP_GUIDE.md`
- **Team issues**: `docker/TEAM_SETUP.md`
- **Database issues**: `docker/DATABASE_SETUP.md`

## ✅ Pre-Flight Checklist

Before sharing with team:

- [ ] Services started successfully
- [ ] Health check passes
- [ ] Can connect to database from VPS localhost
- [ ] Firewall configured
- [ ] Automated backups configured
- [ ] Connection info generated
- [ ] Default passwords changed (recommended)
- [ ] Team documentation prepared

## 🎊 Ready to Go!

Run these commands to get started:

```bash
cd /root/blih-system-backend
npm run db:start
sleep 60
npm run db:health
npm run vps:info
```

Then share the connection info with your team! 🚀

---

**Quick Links**:
- VPS Admin Guide: [VPS_SETUP_GUIDE.md](VPS_SETUP_GUIDE.md)
- Team Quick Start: [TEAM_QUICKSTART.md](TEAM_QUICKSTART.md)
- Complete Team Guide: [docker/TEAM_SETUP.md](docker/TEAM_SETUP.md)
- Setup Summary: [SETUP_SUMMARY.md](SETUP_SUMMARY.md)
