# BLIH System - Local Database Setup Guide

This guide explains the local development database setup for the BLIH System.

## Overview

The local development environment includes:

### Databases (PostgreSQL)
- **keycloak** - Stores Keycloak authentication and authorization data
- **blih-system-dev** - Main application database for BLIH System

### Services
- **PostgreSQL 16** - Database server with both databases
- **Keycloak 26.0** - Authentication and authorization server
- **RabbitMQ 3.13** - Message broker for event-driven architecture
- **MailHog** - Email testing tool

## Port Configuration

All services use non-standard ports to avoid conflicts:

| Service | Internal Port | External Port | Purpose |
|---------|--------------|---------------|---------|
| PostgreSQL | 5432 | **5433** | Database access |
| Keycloak | 8080 | **9080** | Auth server & Admin UI |
| RabbitMQ AMQP | 5672 | **5673** | Message broker |
| RabbitMQ Management | 15672 | **15673** | Management UI |
| MailHog SMTP | 1025 | **1026** | Email sending |
| MailHog Web UI | 8025 | **8026** | Email inbox |

## Quick Start

### 1. Start the Services

```bash
# Start all services
docker-compose -f docker-compose.local.yml up -d

# Check service status
docker-compose -f docker-compose.local.yml ps

# View logs
docker-compose -f docker-compose.local.yml logs -f
```

### 2. Verify Database Setup

Connect to PostgreSQL to verify both databases were created:

```bash
# Connect to PostgreSQL
docker exec -it blih-postgres-local psql -U postgres

# Inside psql, list databases
\l

# You should see:
# - keycloak (owner: keycloak_user)
# - blih-system-dev (owner: blih_dev_user)

# Connect to keycloak database
\c keycloak

# Connect to blih-system-dev database
\c blih-system-dev

# Exit psql
\q
```

### 3. Access Services

- **Keycloak Admin Console**: http://localhost:9080
  - Username: `admin`
  - Password: `admin`
  
- **RabbitMQ Management**: http://localhost:15673
  - Username: `blih_user`
  - Password: `blih_pass_2024`
  
- **MailHog Web UI**: http://localhost:8026

### 4. Database Connections

#### Main Application Database (blih-system-dev)
```
Host: localhost
Port: 5433
Database: blih-system-dev
Username: blih_dev_user
Password: blih_dev_pass_2024
```

Connection String:
```
postgresql://blih_dev_user:blih_dev_pass_2024@localhost:5433/blih-system-dev
```

#### Keycloak Database
```
Host: localhost
Port: 5433
Database: keycloak
Username: keycloak_user
Password: keycloak_pass_2024
```

Connection String:
```
postgresql://keycloak_user:keycloak_pass_2024@localhost:5433/keycloak
```

## Management Commands

### Start Services
```bash
docker-compose -f docker-compose.local.yml up -d
```

### Stop Services
```bash
docker-compose -f docker-compose.local.yml down
```

### Stop and Remove Data (⚠️ WARNING: Destroys all data)
```bash
docker-compose -f docker-compose.local.yml down -v
```

### View Logs
```bash
# All services
docker-compose -f docker-compose.local.yml logs -f

# Specific service
docker-compose -f docker-compose.local.yml logs -f postgres
docker-compose -f docker-compose.local.yml logs -f keycloak
docker-compose -f docker-compose.local.yml logs -f rabbitmq
```

### Restart a Service
```bash
docker-compose -f docker-compose.local.yml restart postgres
docker-compose -f docker-compose.local.yml restart keycloak
```

## Database Credentials Summary

### PostgreSQL Admin
- **User**: `postgres`
- **Password**: `postgres_admin_2024`
- **Port**: `5433`

### Keycloak Database
- **Database**: `keycloak`
- **User**: `keycloak_user`
- **Password**: `keycloak_pass_2024`
- **Owner**: Keycloak service

### BLIH System Database
- **Database**: `blih-system-dev`
- **User**: `blih_dev_user`
- **Password**: `blih_dev_pass_2024`
- **Owner**: BLIH System application

## Troubleshooting

### Services Not Starting

1. **Check if ports are already in use:**
```bash
# Check PostgreSQL port
lsof -i :5433

# Check Keycloak port
lsof -i :9080

# Check RabbitMQ ports
lsof -i :5673
lsof -i :15673
```

2. **Check Docker logs:**
```bash
docker-compose -f docker-compose.local.yml logs
```

3. **Rebuild services:**
```bash
docker-compose -f docker-compose.local.yml down
docker-compose -f docker-compose.local.yml up -d --force-recreate
```

### Database Connection Issues

1. **Wait for PostgreSQL to be ready:**
```bash
# Check if PostgreSQL is ready
docker exec blih-postgres-local pg_isready -U postgres
```

2. **Verify databases were created:**
```bash
docker exec -it blih-postgres-local psql -U postgres -c "\l"
```

3. **Check Keycloak database connection:**
```bash
docker-compose -f docker-compose.local.yml logs keycloak | grep -i "database"
```

### Reset Everything

To completely reset the environment:

```bash
# Stop and remove containers, volumes, and networks
docker-compose -f docker-compose.local.yml down -v

# Remove orphaned volumes (optional)
docker volume prune

# Start fresh
docker-compose -f docker-compose.local.yml up -d
```

## Development Workflow

### Running Your Application

After starting the Docker services, run your NestJS application:

```bash
# Install dependencies (if not already done)
npm install

# Start in development mode
npm run start:dev
```

Your application will connect to:
- Database at `localhost:5433`
- Keycloak at `localhost:9080`
- RabbitMQ at `localhost:5673`
- MailHog at `localhost:1026`

### Database Migrations

Run migrations against the blih-system-dev database:

```bash
# Run migrations (adjust command based on your ORM)
npm run migration:run

# Create a new migration
npm run migration:create

# Revert last migration
npm run migration:revert
```

## Architecture Notes

### Why Two Databases?

1. **keycloak** - Managed by Keycloak service
   - Stores users, roles, realms, clients, and sessions
   - Keycloak handles all schema migrations automatically
   - Should not be accessed directly by your application

2. **blih-system-dev** - Managed by your application
   - Stores your business logic data
   - You control the schema via migrations
   - Used by your NestJS backend

### Data Isolation

- Each database has its own user with restricted permissions
- Keycloak cannot access blih-system-dev data
- Your application cannot access keycloak data directly (use Keycloak API instead)

### Cloud-like Setup

This setup mimics a cloud environment:
- Services run in isolated containers
- Network communication via Docker network
- Persistent data storage via Docker volumes
- Health checks and automatic restarts
- Can be deployed to cloud with minimal changes

## Security Notes

⚠️ **Important**: The credentials in this setup are for LOCAL DEVELOPMENT ONLY.

**Never use these credentials in production!**

For production:
- Use strong, unique passwords
- Store credentials in a secrets manager
- Enable SSL/TLS for all connections
- Restrict network access
- Enable database backups
- Use read replicas for scaling

## Additional Resources

- PostgreSQL Documentation: https://www.postgresql.org/docs/16/
- Keycloak Documentation: https://www.keycloak.org/docs/latest/
- RabbitMQ Documentation: https://www.rabbitmq.com/documentation.html
- Docker Compose Documentation: https://docs.docker.com/compose/
