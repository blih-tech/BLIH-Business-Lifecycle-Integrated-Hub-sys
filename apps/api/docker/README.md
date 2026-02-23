# Docker Configuration for BLIH System

This directory contains Docker configurations for local development and deployment.

## Files

- `docker-compose.yml` - Keycloak service configuration (legacy)
- `init-scripts/` - Database initialization scripts
- `keycloak/` - Keycloak realm configuration
- `DATABASE_SETUP.md` - Detailed database setup documentation
- `QUICKSTART.md` - Quick start guide for local development

## Quick Start

### For Local Development (Recommended)

Use the comprehensive local development setup from the project root:

```bash
# From project root directory
./scripts/db-local.sh start
```

This starts all services with:
- Two PostgreSQL databases (keycloak + blih-system-dev)
- Keycloak with database persistence
- RabbitMQ message broker
- MailHog for email testing

All services use non-standard ports to avoid conflicts.

See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.

## Port Mapping

### Local Development Setup

| Service | External Port | Description |
|---------|--------------|-------------|
| PostgreSQL | 5433 | Database server |
| Keycloak | 9080 | Auth server + Admin UI |
| RabbitMQ AMQP | 5673 | Message broker |
| RabbitMQ Management | 15673 | Management UI |
| MailHog SMTP | 1026 | Email sending |
| MailHog Web UI | 8026 | Email inbox |

## Database Structure

### keycloak
- **Purpose**: Stores Keycloak authentication data
- **User**: `keycloak_user`
- **Password**: `keycloak_pass_2024`
- **Managed by**: Keycloak service
- **Access**: Read-only via Keycloak Admin API

### blih-system-dev
- **Purpose**: Main application database
- **User**: `blih_dev_user`
- **Password**: `blih_dev_pass_2024`
- **Managed by**: Your application (via migrations)
- **Access**: Direct access via your NestJS backend

## Initialization Scripts

The `init-scripts/` directory contains SQL scripts that run when PostgreSQL starts for the first time:

- `01-init-databases.sql` - Creates both databases with proper users and permissions

These scripts only run on first startup. To re-run them, you must remove the database volume:

```bash
docker-compose -f ../docker-compose.local.yml down -v
docker-compose -f ../docker-compose.local.yml up -d
```

## Keycloak Configuration

The `keycloak/` directory contains:
- `realm-export.json` - Realm configuration to import
- `data/` - Persistent Keycloak data (auto-created)

Keycloak automatically imports the realm configuration on first startup.

## Helper Scripts

Located in `../scripts/`:

- `db-local.sh` - Main database management script
- `check-ports.sh` - Check if required ports are available

### db-local.sh Commands

```bash
./scripts/db-local.sh start      # Start all services
./scripts/db-local.sh stop       # Stop all services
./scripts/db-local.sh status     # Show service status
./scripts/db-local.sh logs       # View logs
./scripts/db-local.sh psql       # Connect to database
./scripts/db-local.sh health     # Check service health
./scripts/db-local.sh backup     # Backup database
./scripts/db-local.sh reset      # Reset everything (⚠️ destroys data)
```

## Environment Variables

The local setup uses `.env.local` which is configured for the Docker services.

Key variables:
- `DATABASE_URL` - Points to blih-system-dev database on port 5433
- `KEYCLOAK_URL` - Points to Keycloak on port 8081
- `RABBITMQ_URL` - Points to RabbitMQ on port 5673
- `SMTP_PORT` - Points to MailHog on port 1026

## Data Persistence

All data is stored in Docker volumes:
- `postgres_data_local` - PostgreSQL data
- `keycloak_data_local` - Keycloak data
- `rabbitmq_data_local` - RabbitMQ data

To backup data:
```bash
./scripts/db-local.sh backup blih-system-dev
./scripts/db-local.sh backup keycloak
```

To completely remove all data:
```bash
docker-compose -f ../docker-compose.local.yml down -v
```

## Architecture

```
┌─────────────────┐
│  Your NestJS    │
│  Application    │
│  (localhost)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐ ┌─────────────────┐
│   PostgreSQL    │ │    Keycloak     │
│   Port: 5433    │ │   Port: 8081    │
├─────────────────┤ └────────┬────────┘
│ • keycloak      │          │
│ • blih-system-  │◄─────────┘
│   dev           │
└─────────────────┘

         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│    RabbitMQ     │ │     MailHog     │ │   Application   │
│  Port: 5673/    │ │  Port: 1026/    │ │   Port: 5000    │
│        15673    │ │        8026     │ │                 │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Cloud-like Local Development

This setup mimics a cloud environment:

- **Container Isolation**: Each service runs in its own container
- **Network Segmentation**: Services communicate via Docker network
- **Data Persistence**: Volumes ensure data survives container restarts
- **Health Checks**: Automatic health monitoring
- **Dependency Management**: Services start in correct order
- **Configuration**: Environment-based configuration

## Migration to Cloud

To deploy to cloud:

1. Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
2. Use managed Keycloak or deploy as container
3. Use managed RabbitMQ (AWS MQ, CloudAMQP, etc.)
4. Use actual SMTP service (SendGrid, AWS SES, etc.)
5. Update `.env.production` with production URLs and credentials
6. Enable SSL/TLS for all connections
7. Use secrets manager for sensitive data

## Troubleshooting

### PostgreSQL Not Starting

Check logs:
```bash
./scripts/db-local.sh logs postgres
```

Common issues:
- Port 5433 already in use
- Insufficient disk space
- Corrupted data volume (fix: `docker volume rm postgres_data_local`)

### Keycloak Not Starting

Check logs:
```bash
./scripts/db-local.sh logs keycloak
```

Common issues:
- PostgreSQL not ready (wait 30s after starting)
- Database connection issues
- Port 8081 already in use

### Connection Refused

Make sure services are running:
```bash
./scripts/db-local.sh status
./scripts/db-local.sh health
```

Wait for all services to be healthy (especially Keycloak takes ~30-60s to start).

## Security Notes

⚠️ **Important**: All credentials in this setup are for LOCAL DEVELOPMENT ONLY.

**Never commit**:
- `.env.local`
- `.env.production`
- Any file with real credentials

**Never use in production**:
- Default passwords
- Development ports
- Unencrypted connections
- Admin credentials in environment variables

## Additional Resources

- [Quick Start Guide](./QUICKSTART.md)
- [Detailed Database Setup](./DATABASE_SETUP.md)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Keycloak Documentation](https://www.keycloak.org/docs/latest/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
