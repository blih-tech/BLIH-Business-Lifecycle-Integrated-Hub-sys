# BLIH System - Quick Start Guide

Get your local development environment up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- Ports available: 5433, 8081, 5673, 15673, 1026, 8026

## Step 1: Start Database Services

```bash
# From the project root
./scripts/db-local.sh start
```

This will start:
- PostgreSQL with two databases (keycloak and blih-system-dev)
- Keycloak authentication server
- RabbitMQ message broker
- MailHog email testing

## Step 2: Verify Services

```bash
# Check if all services are running
./scripts/db-local.sh status

# Check health of services
./scripts/db-local.sh health
```

## Step 3: Configure Environment

The `.env.local` file is already configured with the correct settings. Copy it to `.env` if needed:

```bash
cp .env.local .env
```

## Step 4: Run Your Application

```bash
# Install dependencies
npm install

# Run database migrations (if any)
npm run migration:run

# Start the application in development mode
npm run start:dev
```

Your API will be available at: http://localhost:5000

## Access Web Interfaces

Once services are running:

### Keycloak Admin Console
- URL: http://localhost:9080
- Username: `admin`
- Password: `admin`

### RabbitMQ Management
- URL: http://localhost:15673
- Username: `blih_user`
- Password: `blih_pass_2024`

### MailHog (Email Testing)
- URL: http://localhost:8026

### Swagger API Documentation
- URL: http://localhost:5000/api/v1/docs

## Useful Commands

```bash
# View all logs
./scripts/db-local.sh logs

# View specific service logs
./scripts/db-local.sh logs postgres
./scripts/db-local.sh logs keycloak

# Connect to PostgreSQL
./scripts/db-local.sh psql blih-system-dev

# Stop services
./scripts/db-local.sh stop

# Restart services
./scripts/db-local.sh restart
```

## Database Connections

### Main Application Database

```
Host: localhost
Port: 5433
Database: blih-system-dev
User: blih_dev_user
Password: blih_dev_pass_2024
```

### Connect via psql

```bash
# Using the helper script
./scripts/db-local.sh psql blih-system-dev

# Or directly with psql
psql -h localhost -p 5433 -U blih_dev_user -d blih-system-dev
```

### Connect via Database Client

Use any PostgreSQL client (pgAdmin, DBeaver, DataGrip, etc.) with the connection details above.

## Troubleshooting

### Port Conflicts

If you get port conflict errors, check which process is using the port:

```bash
# Check PostgreSQL port
lsof -i :5433

# Check Keycloak port
lsof -i :9080
```

### Services Not Starting

View the logs to see what went wrong:

```bash
./scripts/db-local.sh logs
```

### Reset Everything

If things are broken, reset the entire environment:

```bash
./scripts/db-local.sh reset
```

⚠️ **Warning**: This will delete all data!

## Next Steps

1. **Configure Keycloak Realm**: Import or create your realm configuration
2. **Run Migrations**: Set up your database schema
3. **Create Test Users**: Use Keycloak admin console or API
4. **Test Authentication**: Try logging in via your application
5. **Test Events**: Publish and consume messages via RabbitMQ

## Additional Help

For more detailed information, see:
- [Database Setup Guide](./DATABASE_SETUP.md)
- [Main README](../README.md)

## Support

If you encounter issues:
1. Check the logs: `./scripts/db-local.sh logs`
2. Verify health: `./scripts/db-local.sh health`
3. Review the [Database Setup Guide](./DATABASE_SETUP.md)
4. Check Docker resources: `docker system df`
