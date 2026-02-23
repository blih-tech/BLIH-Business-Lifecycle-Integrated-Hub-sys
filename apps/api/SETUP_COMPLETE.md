# 🎉 BLIH System - Database Setup Complete!

Your local development database environment has been configured successfully.

## 📦 What Was Created

### 1. Docker Compose Configuration
- **File**: `docker-compose.local.yml`
- **Services**: PostgreSQL, Keycloak, RabbitMQ, MailHog
- **Databases**: `keycloak` and `blih-system-dev`

### 2. Database Initialization Scripts
- **Directory**: `docker/init-scripts/`
- **Script**: `01-init-databases.sql`
- **Creates**: Both databases with dedicated users and permissions

### 3. Environment Configuration
- **File**: `.env.local`
- **Configured**: All connection strings with non-standard ports
- **Ready**: Can be copied to `.env` for use

### 4. Management Scripts
- **Script**: `scripts/db-local.sh` (main management tool)
- **Script**: `scripts/check-ports.sh` (port availability checker)
- **Added**: npm scripts for easy database management

### 5. Documentation
- **Guide**: `docker/DATABASE_SETUP.md` (comprehensive setup guide)
- **Guide**: `docker/QUICKSTART.md` (quick start instructions)
- **Guide**: `docker/README.md` (Docker configuration overview)

## 🚀 Getting Started (3 Steps)

### Step 1: Check Ports
```bash
npm run db:check-ports
```

### Step 2: Start Services
```bash
npm run db:start
# or
./scripts/db-local.sh start
```

### Step 3: Verify Setup
```bash
npm run db:status
# or
./scripts/db-local.sh health
```

That's it! Your databases are ready.

## 🔌 Connection Details

### Main Application Database (blih-system-dev)
```bash
Host: localhost
Port: 5433
Database: blih-system-dev
User: blih_dev_user
Password: blih_dev_pass_2024

# Connection string (already in .env.local):
postgresql://blih_dev_user:blih_dev_pass_2024@localhost:5433/blih-system-dev
```

### Keycloak Database
```bash
Host: localhost
Port: 5433
Database: keycloak
User: keycloak_user
Password: keycloak_pass_2024

# Used internally by Keycloak container
```

## 🎯 Service Access Points

| Service | URL | Credentials |
|---------|-----|-------------|
| Keycloak Admin | http://localhost:9080 | admin / admin |
| RabbitMQ Management | http://localhost:15673 | blih_user / blih_pass_2024 |
| MailHog Web UI | http://localhost:8026 | (no auth) |
| API Swagger Docs | http://localhost:5000/api/v1/docs | (after starting app) |

## 🛠️ Common Commands

### Database Management (via npm)
```bash
npm run db:start          # Start all services
npm run db:stop           # Stop all services
npm run db:restart        # Restart all services
npm run db:status         # Show service status
npm run db:logs           # View logs
npm run db:reset          # Reset everything (⚠️ destroys data)
npm run db:check-ports    # Check port availability
npm run db:psql           # Connect to blih-system-dev database
```

### Database Management (via script)
```bash
./scripts/db-local.sh start           # Start all services
./scripts/db-local.sh stop            # Stop all services
./scripts/db-local.sh restart         # Restart all services
./scripts/db-local.sh status          # Show detailed status
./scripts/db-local.sh logs [service]  # View logs
./scripts/db-local.sh psql [database] # Connect to PostgreSQL
./scripts/db-local.sh health          # Check health of all services
./scripts/db-local.sh backup [db]     # Backup database
./scripts/db-local.sh reset           # Reset everything (⚠️ destroys data)
```

### Application Development
```bash
npm install              # Install dependencies
npm run start:dev        # Start NestJS in development mode
npm run prisma:migrate:dev  # Run database migrations
npm run prisma:generate  # Generate Prisma client
```

## 🎨 Port Configuration (Non-Standard)

All ports are configured to avoid conflicts with commonly used services:

| Service | Standard Port | Our Port | Reason |
|---------|--------------|----------|---------|
| PostgreSQL | 5432 | **5433** | Avoid conflicts with other PostgreSQL instances |
| Keycloak | 8080 | **9080** | Avoid conflicts with common dev servers |
| RabbitMQ AMQP | 5672 | **5673** | Avoid conflicts with other RabbitMQ instances |
| RabbitMQ Mgmt | 15672 | **15673** | Avoid conflicts with other RabbitMQ instances |
| MailHog SMTP | 1025 | **1026** | Avoid conflicts with MailHog instances |
| MailHog Web | 8025 | **8026** | Avoid conflicts with MailHog instances |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────┐
│              BLIH System Local Development               │
└──────────────────────────────────────────────────────────┘

    ┌─────────────────┐
    │   NestJS App    │
    │   Port: 5000    │
    │  (localhost)    │
    └────────┬────────┘
             │
    ┌────────┴────────────────────────────────────┐
    │                                             │
    ▼                                             ▼
┌─────────────────────────────┐      ┌──────────────────────┐
│    PostgreSQL (Port 5433)   │      │  Keycloak (8081)     │
│  ┌───────────────────────┐  │      │  Authentication &    │
│  │ Database: keycloak    │◄─┼──────┤  Authorization       │
│  │ Owner: keycloak_user  │  │      └──────────────────────┘
│  └───────────────────────┘  │
│  ┌───────────────────────┐  │
│  │ Database:             │◄─┼───────── Your Application
│  │ blih-system-dev       │  │
│  │ Owner: blih_dev_user  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
             │
    ┌────────┴────────────────────┐
    │                             │
    ▼                             ▼
┌─────────────────┐    ┌──────────────────┐
│    RabbitMQ     │    │     MailHog      │
│  5673 / 15673   │    │   1026 / 8026    │
│  Message Broker │    │  Email Testing   │
└─────────────────┘    └──────────────────┘
```

## 📚 Database Credentials Reference

### PostgreSQL Admin Access
```bash
User: postgres
Password: postgres_admin_2024
Port: 5433
```

### Keycloak Database
```bash
Database: keycloak
User: keycloak_user
Password: keycloak_pass_2024
Purpose: Keycloak authentication data
Managed by: Keycloak service
```

### BLIH System Database
```bash
Database: blih-system-dev
User: blih_dev_user
Password: blih_dev_pass_2024
Purpose: Main application data
Managed by: Your NestJS application
```

### RabbitMQ
```bash
User: blih_user
Password: blih_pass_2024
VHost: blih
AMQP Port: 5673
Management Port: 15673
```

## ✅ Verification Checklist

Run these commands to verify everything is working:

```bash
# 1. Check ports are available
npm run db:check-ports

# 2. Start services
npm run db:start

# 3. Wait 30-60 seconds for services to initialize

# 4. Check service health
./scripts/db-local.sh health

# 5. Verify databases exist
npm run db:psql
# Inside psql, run: \l
# You should see both keycloak and blih-system-dev databases
# Exit with: \q

# 6. Access Keycloak Admin Console
# Open: http://localhost:9080
# Login: admin / admin

# 7. Start your application
npm run start:dev

# 8. Check API is running
# Open: http://localhost:5000/api/v1/docs
```

## 🔧 Troubleshooting

### Services Won't Start

1. Check Docker is running: `docker info`
2. Check port conflicts: `npm run db:check-ports`
3. View logs: `npm run db:logs`
4. Try resetting: `npm run db:reset` (⚠️ destroys data)

### Cannot Connect to Database

1. Wait 10-15 seconds after starting (PostgreSQL needs to initialize)
2. Check if PostgreSQL is ready:
   ```bash
   docker exec blih-postgres-local pg_isready -U postgres
   ```
3. Verify container is running:
   ```bash
   docker ps | grep blih-postgres-local
   ```

### Keycloak Not Accessible

1. Keycloak takes 30-60 seconds to start (wait longer)
2. Check logs:
   ```bash
   npm run db:logs
   # or
   docker logs blih-keycloak-local
   ```
3. Verify Keycloak database connection in logs

## 🎓 Next Steps

1. **Start the services**: `npm run db:start`
2. **Copy environment file**: `cp .env.local .env` (if not already done)
3. **Run migrations**: `npm run prisma:migrate:dev`
4. **Seed database**: `npm run prisma:seed` (if you have seed data)
5. **Start application**: `npm run start:dev`
6. **Configure Keycloak**: Access admin console and set up realms/clients
7. **Test authentication**: Try logging in via your application

## 📖 Documentation

- **Quick Start**: [docker/QUICKSTART.md](docker/QUICKSTART.md)
- **Detailed Setup**: [docker/DATABASE_SETUP.md](docker/DATABASE_SETUP.md)
- **Docker Info**: [docker/README.md](docker/README.md)
- **Main README**: [README.md](README.md)

## 🌟 Key Features

### ✓ Two Isolated Databases
- Separate databases for Keycloak and your application
- Independent users with appropriate permissions
- No data leakage between services

### ✓ Non-Standard Ports
- All ports configured to avoid common conflicts
- Easy to change in docker-compose.local.yml
- Documented in all configuration files

### ✓ Cloud-like Architecture
- Container-based services
- Network isolation
- Persistent storage via Docker volumes
- Health checks and auto-restart
- Ready for cloud deployment

### ✓ Developer-Friendly
- Simple npm commands
- Comprehensive bash scripts
- Detailed documentation
- Easy backup/restore
- One-command reset

## 🔐 Security Reminder

⚠️ **IMPORTANT**: All credentials in this setup are for LOCAL DEVELOPMENT ONLY.

**Never use these passwords in production!**

For production:
- Use strong, randomly generated passwords
- Store credentials in a secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.)
- Enable SSL/TLS for all database connections
- Use managed database services
- Enable database backups and point-in-time recovery
- Restrict network access with security groups/firewalls

## 🆘 Need Help?

1. **Check the guides**: See documentation links above
2. **View logs**: `npm run db:logs`
3. **Check health**: `./scripts/db-local.sh health`
4. **Reset and retry**: `npm run db:reset` (⚠️ destroys data)

## 🎯 Summary

You now have a complete local development database setup with:

✅ PostgreSQL with two databases (keycloak and blih-system-dev)  
✅ Keycloak authentication server with database persistence  
✅ RabbitMQ message broker  
✅ MailHog email testing  
✅ Non-standard ports to avoid conflicts  
✅ Easy management via npm scripts and bash tools  
✅ Comprehensive documentation  
✅ Cloud-like architecture  

**You're ready to start developing!** 🚀
