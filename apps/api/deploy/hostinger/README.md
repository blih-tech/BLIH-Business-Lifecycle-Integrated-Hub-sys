# BLIH System - Production Deployment Guide

## Overview

This directory contains production-ready deployment configurations for the BLIH System on your VPS server.

## 🚀 Quick Start

### 1. Configure Environment

```bash
# Copy and customize the production environment file
cp .env.production.template .env.production

# Edit with your production values
nano .env.production
```

### 2. Deploy

```bash
# Make scripts executable
chmod +x deploy.sh healthcheck.sh

# Run deployment
./deploy.sh
```

## 📁 Files Overview

### `.env.production`

- **Purpose**: Production environment configuration
- **Security**: Contains sensitive credentials and secrets
- **Port Management**: Configurable API port (5000-5010 range recommended)
- **Key Settings**:
  - `API_PORT`: External API port (change if conflicts occur)
  - `CORS_ORIGIN`: Your frontend domain
  - `KEYCLOAK_URL`: Production auth URL
  - Database credentials (CHANGE ALL passwords)
  - SMTP settings for production email

### `docker-compose.prod.yml`

- **Purpose**: Production Docker orchestration
- **Network Isolation**: Custom bridge network (172.20.0.0/16)
- **Resource Limits**: Memory and CPU constraints
- **Health Checks**: Comprehensive service monitoring
- **Port Binding**:
  - API: `${API_PORT:-5000}:5000` (external)
  - Keycloak: `127.0.0.1:8080:8080` (internal only)
  - MailHog: `127.0.0.1:1025:1025`, `127.0.0.1:8025:8025` (internal)

### `deploy.sh`

- **Purpose**: Enhanced production deployment script
- **Features**:
  - Environment validation
  - Pre-deployment checks
  - Automatic rollback on failure
  - Comprehensive logging
  - Resource cleanup
- **Usage**: `./deploy.sh`

### `healthcheck.sh`

- **Purpose**: Production health monitoring
- **Features**:
  - System resource monitoring
  - Service health validation
  - Database connectivity checks
  - API response validation
- **Usage**: `./healthcheck.sh`

## 🔧 Port Configuration

### Avoiding Port Conflicts

The system is designed to minimize port conflicts:

1. **API Port**: Configurable (default 5000)
   - Change via `API_PORT` environment variable
   - Recommended range: 5000-5010
   - Check availability: `netstat -tuln | grep :5000`

2. **Keycloak Port**: Internal only (127.0.0.1:8080)
   - No external conflicts
   - Not accessible from outside VPS

3. **MailHog Ports**: Internal only (127.0.0.1)
   - SMTP: 1025 (internal)
   - Web UI: 8025 (internal)

### Port Change Example

```bash
# Change API port to 5001
export API_PORT=5001
./deploy.sh
```

## 🔒 Security Configuration

### Required Security Changes

1. **Database Passwords**

   ```bash
   POSTGRES_PASSWORD=your_strong_postgres_password
   KEYCLOAK_DB_PASSWORD=your_strong_keycloak_password
   ```

2. **Keycloak Configuration**

   ```bash
   KEYCLOAK_CLIENT_SECRET=your_generated_client_secret
   KEYCLOAK_ADMIN_PASSWORD=your_strong_admin_password
   ```

3. **Domain Configuration**

   ```bash
   CORS_ORIGIN=https://yourdomain.com
   KEYCLOAK_URL=https://yourdomain.com/auth
   ```

4. **Email Configuration**
   ```bash
   SMTP_HOST=smtp.yourprovider.com
   SMTP_USER=noreply@yourdomain.com
   SMTP_PASSWORD=your_smtp_password
   ```

## 🏥️‍♂️ Deployment Process

### Automated Deployment (GitHub Actions)

1. Push to `main` branch
2. GitHub Actions builds and pushes images
3. Automatic deployment to VPS
4. Health checks validate deployment

### Manual Deployment

1. Ensure prerequisites are installed
2. Configure environment variables
3. Run deployment script
4. Monitor health checks

### Pre-deployment Checks

- Docker daemon running
- Sufficient disk space (2GB+)
- Docker Compose available
- Port availability validation

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

- **API**: `http://localhost:${API_PORT}/api/v1/health`
- **Keycloak**: `http://127.0.0.1:8080/realms/blih`

### System Monitoring

The health check script monitors:

- Disk usage (>85% warning)
- Memory availability (<20% warning)
- Service connectivity
- API response validation

### Logs

```bash
# View application logs
docker logs blih-api -f

# View database logs
docker logs blih-postgres -f

# View Keycloak logs
docker logs blih-keycloak -f
```

## 🔄 Rollback Procedure

### Automatic Rollback

If deployment fails, the script automatically:

1. Detects failure
2. Restores previous release
3. Validates rollback
4. Reports status

### Manual Rollback

```bash
# If automatic rollback fails
./deploy.sh rollback
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port Conflicts**

   ```bash
   # Check port usage
   netstat -tuln | grep :5000

   # Change API port
   export API_PORT=5001
   ./deploy.sh
   ```

2. **Database Connection Issues**

   ```bash
   # Check database logs
   docker logs blih-postgres

   # Test connectivity
   docker exec blih-postgres pg_isready -U postgres -d blih_system_prod
   ```

3. **Insufficient Resources**

   ```bash
   # Check disk space
   df -h

   # Check memory
   free -h

   # Check Docker resources
   docker stats
   ```

4. **Health Check Failures**

   ```bash
   # Run manual health check
   ./healthcheck.sh

   # Check individual services
   curl http://localhost:5000/api/v1/health
   curl http://127.0.0.1:8080/realms/blih
   ```

## 📋 Deployment Checklist

### Pre-deployment

- [ ] VPS requirements met (Docker, Docker Compose)
- [ ] Sufficient disk space (2GB+ available)
- [ ] Environment file configured
- [ ] Ports checked for conflicts
- [ ] SSL certificates ready (if using HTTPS)
- [ ] Database backups planned

### Post-deployment

- [ ] All services running
- [ ] Health checks passing
- [ ] SSL/TLS working (if configured)
- [ ] Monitoring enabled
- [ ] Backup schedule configured
- [ ] Log rotation configured

## 🚨 Emergency Procedures

### Service Recovery

```bash
# Restart all services
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker restart blih-api
docker restart blih-postgres
docker restart blih-keycloak
```

### Complete Reset

```bash
# Stop and remove all containers
docker compose -f docker-compose.prod.yml down -v

# Clean up resources
docker system prune -af

# Redeploy
./deploy.sh
```

## 📞 Support

### Log Collection

```bash
# Collect deployment logs
./deploy.sh > deploy.log 2>&1
./healthcheck.sh > healthcheck.log 2>&1

# Collect Docker logs
docker logs blih-api > api.log 2>&1 &
docker logs blih-postgres > postgres.log 2>&1 &
docker logs blih-keycloak > keycloak.log 2>&1 &
```

## 🔄 GitHub Actions Integration

### Required GitHub Secrets

- `HOSTINGER_SSH_HOST`: VPS IP/hostname
- `HOSTINGER_SSH_PORT`: SSH port (default 22)
- `HOSTINGER_SSH_USER`: SSH username
- `HOSTINGER_SSH_KEY`: SSH private key
- `HOSTINGER_DEPLOY_PATH`: Deployment directory path
- `GHCR_PULL_USERNAME`: GitHub Container Registry username
- `GHCR_PULL_TOKEN`: GitHub Container Registry token

### Deployment Images

The workflow builds and deploys:

- `ghcr.io/<owner>/blih-api-runtime:<sha>`
- `ghcr.io/<owner>/blih-api-migrator:<sha>`
- `ghcr.io/<owner>/blih-keycloak:<sha>`

### Release Markers

- `current-release.env`: Active deployment information
- `previous-release.env`: Previous working release for rollback

---

**Note**: This deployment configuration is production-ready and includes security hardening, monitoring, and automatic rollback capabilities.
