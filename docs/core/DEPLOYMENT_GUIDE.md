# BLIH Deployment Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**Target Environment:** VPS (CPU-based), Docker, CI/CD

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Environment Setup](#2-environment-setup)
3. [Docker Deployment](#3-docker-deployment)
4. [VPS Deployment (CPU)](#4-vps-deployment-cpu)
5. [Database Initialization](#5-database-initialization)
6. [Service Configuration](#6-service-configuration)
7. [SSL/TLS Setup](#7-ssltls-setup)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Monitoring & Health Checks](#9-monitoring--health-checks)
10. [Backup & Recovery](#10-backup--recovery)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Prerequisites

### 1.1 Hardware Requirements

#### Minimum (Development/Testing)

- **CPU:** 4 cores
- **RAM:** 8 GB
- **Storage:** 50 GB SSD
- **Network:** 100 Mbps

#### Recommended (Production VPS)

- **CPU:** 8 cores (CPU-only, no GPU required)
- **RAM:** 16 GB
- **Storage:** 100 GB SSD
- **Network:** 1 Gbps
- **OS:** Ubuntu 22.04 LTS or Rocky Linux 9

### 1.2 Software Requirements

```bash
# Required software
- Docker Engine 24.0+
- Docker Compose 2.20+
- Git 2.40+
- Node.js 20 LTS (for frontend build)
- Python 3.11+ (for AI services)

# Optional (for CI/CD)
- GitHub/GitLab account
- Docker Hub/Container Registry access
```

### 1.3 Domain & DNS Setup

```bash
# Example DNS configuration
blih.yourcompany.com        A      YOUR_VPS_IP
api.blih.yourcompany.com    A      YOUR_VPS_IP
*.blih.yourcompany.com      A      YOUR_VPS_IP
```

---

## 2. Environment Setup

### 2.1 Install Docker on VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 2.2 Clone Repository

```bash
# Create application directory
sudo mkdir -p /opt/blih
sudo chown $USER:$USER /opt/blih
cd /opt/blih

# Clone repository
git clone https://github.com/yourorg/BLIH-Business-Lifecycle-Integrated-Hub-.git .

# Checkout production branch
git checkout main
```

### 2.3 Environment Variables

Create `.env` file in project root:

```bash
# Copy example environment file
cp .env.example .env

# Edit with your configuration
nano .env
```

**`.env` Configuration:**

```bash
# ========================================
# BLIH Environment Configuration
# ========================================

# Environment
NODE_ENV=production
DEPLOYMENT_ENV=production

# Company Context
COMPANY_ID=BLIH
COMPANY_NAME="Your Company Name"

# ========================================
# Database Configuration
# ========================================

# PostgreSQL (Transactional Data)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=blih_prod
POSTGRES_USER=blih_user
POSTGRES_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# Redis (Cache & Sessions)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE

# Qdrant (Vector Database)
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_API_KEY=CHANGE_ME_STRONG_API_KEY_HERE

# ========================================
# Authentication & Security
# ========================================

# Keycloak (IAM)
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=blih
KEYCLOAK_CLIENT_ID=blih-api
KEYCLOAK_CLIENT_SECRET=CHANGE_ME_STRONG_SECRET_HERE

# JWT Configuration
JWT_SECRET=CHANGE_ME_ULTRA_SECURE_RANDOM_STRING_MIN_64_CHARS
JWT_EXPIRATION=24h
REFRESH_TOKEN_SECRET=CHANGE_ME_ANOTHER_ULTRA_SECURE_RANDOM_STRING
REFRESH_TOKEN_EXPIRATION=7d

# Encryption
ENCRYPTION_KEY=CHANGE_ME_32_BYTE_HEX_STRING
ENCRYPTION_ALGORITHM=aes-256-gcm

# ========================================
# ========================================
# AI Services
# ========================================

# Ollama (Local LLM)
OLLAMA_HOST=ollama
OLLAMA_PORT=11434
OLLAMA_MODEL=llama3.2
OLLAMA_BASE_URL=http://${OLLAMA_HOST}:${OLLAMA_PORT}

# ========================================
# Frontend Configuration
# ========================================

# Next.js
NEXT_PUBLIC_API_URL=https://api.blih.yourcompany.com
NEXT_PUBLIC_WS_URL=wss://api.blih.yourcompany.com
NEXT_PUBLIC_APP_URL=https://blih.yourcompany.com

# ========================================
# Backend Configuration
# ========================================

# NestJS API
API_PORT=3000
API_HOST=0.0.0.0
API_PREFIX=/api/v1
CORS_ORIGIN=https://blih.yourcompany.com

# ========================================
# Email Configuration
# ========================================

# SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@yourcompany.com
SMTP_PASSWORD=CHANGE_ME_APP_PASSWORD
EMAIL_FROM="BLIH <noreply@yourcompany.com>"

# ========================================
# File Storage
# ========================================

# MinIO (S3-compatible)
MINIO_HOST=minio
MINIO_PORT=9000
MINIO_ROOT_USER=blih_admin
MINIO_ROOT_PASSWORD=CHANGE_ME_STRONG_PASSWORD_HERE
MINIO_BUCKET=blih-files
MINIO_URL=http://${MINIO_HOST}:${MINIO_PORT}

# ========================================
# Monitoring & Logging
# ========================================

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Health Check
HEALTH_CHECK_ENABLED=true
HEALTH_CHECK_INTERVAL=30s

# ========================================
# Module Enablement
# ========================================

# Enable/Disable Modules
MODULE_HR_ENABLED=true
MODULE_CRM_ENABLED=true
MODULE_PROJECTS_ENABLED=true
MODULE_FINANCE_ENABLED=true
MODULE_BRAIN_ENABLED=true

# ========================================
# Backup Configuration
# ========================================

BACKUP_ENABLED=true
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
BACKUP_RETENTION_DAYS=30
BACKUP_S3_BUCKET=blih-backups
```

---

## 3. Docker Deployment

### 3.1 Docker Compose Configuration

**`docker-compose.yml`** (Production-ready):

```yaml
version: '3.9'

services:
  # ========================================
  # Frontend - Next.js
  # ========================================
  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile.prod
    container_name: blih-frontend
    restart: unless-stopped
    ports:
      - '3001:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - api
    networks:
      - blih-network
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # ========================================
  # Backend API - NestJS
  # ========================================
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile.prod
    container_name: blih-api
    restart: unless-stopped
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - blih-network
    volumes:
      - ./logs:/app/logs
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/api/health']
      interval: 30s
      timeout: 10s
      retries: 5

  # ========================================
  # PostgreSQL - Transactional Database
  # ========================================
  postgres:
    image: postgres:16-alpine
    container_name: blih-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/postgres/init:/docker-entrypoint-initdb.d
    networks:
      - blih-network
    ports:
      - '5432:5432'
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}']
      interval: 10s
      timeout: 5s
      retries: 5

  # ========================================
  # Redis - Cache & Sessions
  # ========================================
  redis:
    image: redis:7-alpine
    container_name: blih-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - blih-network
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', '--raw', 'incr', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  # ========================================
  # Qdrant - Vector Database
  # ========================================
  qdrant:
    image: qdrant/qdrant:latest
    container_name: blih-qdrant
    restart: unless-stopped
    environment:
      QDRANT__SERVICE__API_KEY: ${QDRANT_API_KEY}
    volumes:
      - qdrant_data:/qdrant/storage
    networks:
      - blih-network
    ports:
      - '6333:6333'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:6333/health']
      interval: 30s
      timeout: 10s
      retries: 3

  # ========================================
  # Ollama - Local LLM (CPU-optimized)
  # ========================================
  ollama:
    image: ollama/ollama:latest
    container_name: blih-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    networks:
      - blih-network
    ports:
      - '11434:11434'
    environment:
      - OLLAMA_NUM_THREADS=4 # Adjust based on CPU cores
      - OLLAMA_MAX_LOADED_MODELS=1
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:11434/api/tags']
      interval: 60s
      timeout: 30s
      retries: 3

  # ========================================
  # Keycloak - Identity & Access Management
  # ========================================
  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    container_name: blih-keycloak
    restart: unless-stopped
    command: start --optimized
    environment:
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: ${POSTGRES_USER}
      KC_DB_PASSWORD: ${POSTGRES_PASSWORD}
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD:-admin}
      KC_HOSTNAME: blih.yourcompany.com
      KC_PROXY: edge
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - blih-network
    ports:
      - '8080:8080'
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:8080/health']
      interval: 30s
      timeout: 10s
      retries: 5

  # ========================================
  # MinIO - Object Storage (S3-compatible)
  # ========================================
  minio:
    image: minio/minio:latest
    container_name: blih-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    volumes:
      - minio_data:/data
    networks:
      - blih-network
    ports:
      - '9000:9000'
      - '9001:9001' # Console UI
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:9000/minio/health/live']
      interval: 30s
      timeout: 10s
      retries: 3

  # ========================================
  # Nginx - Reverse Proxy
  # ========================================
  nginx:
    image: nginx:alpine
    container_name: blih-nginx
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - nginx_logs:/var/log/nginx
    depends_on:
      - frontend
      - api
    networks:
      - blih-network
    healthcheck:
      test: ['CMD', 'nginx', '-t']
      interval: 30s
      timeout: 10s
      retries: 3

# ========================================
# Volumes
# ========================================
volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  qdrant_data:
    driver: local
  ollama_data:
    driver: local
  minio_data:
    driver: local
  nginx_logs:
    driver: local

# ========================================
# Networks
# ========================================
networks:
  blih-network:
    driver: bridge
```

### 3.2 Start the Stack

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps

# Stop all services
docker-compose down

# Stop and remove volumes (CAUTION: Data loss!)
docker-compose down -v
```

---

## 4. VPS Deployment (CPU)

### 4.1 VPS Initial Setup

```bash
# SSH into your VPS
ssh root@YOUR_VPS_IP

# Update system
apt update && apt upgrade -y

# Install essential packages
apt install -y curl wget git vim htop ufw fail2ban

# Configure firewall
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Install fail2ban for security
systemctl enable fail2ban
systemctl start fail2ban
```

### 4.2 Ollama Model Download (CPU-optimized)

```bash
# Enter Ollama container
docker exec -it blih-ollama bash

# Download recommended CPU-friendly model
ollama pull llama3.2:3b    # Smaller, faster on CPU

# OR for better quality (requires more resources)
ollama pull llama3.2:7b

# List installed models
ollama list

# Test the model
ollama run llama3.2:3b "Hello, BLIH!"

# Exit container
exit
```

**CPU Optimization Tips:**

- Use smaller models (3B or 7B parameters)
- Limit concurrent requests
- Set `OLLAMA_NUM_THREADS` to match your CPU cores
- Consider caching responses in Redis

---

## 5. Database Initialization

### 5.1 PostgreSQL Setup

```bash
# Create database initialization script
cat > database/postgres/init/01-init.sql << 'EOF'
-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS hr;
CREATE SCHEMA IF NOT EXISTS crm;
CREATE SCHEMA IF NOT EXISTS projects;
CREATE SCHEMA IF NOT EXISTS finance;
CREATE SCHEMA IF NOT EXISTS audit;

-- Grant permissions
GRANT ALL PRIVILEGES ON SCHEMA hr TO blih_user;
GRANT ALL PRIVILEGES ON SCHEMA crm TO blih_user;
GRANT ALL PRIVILEGES ON SCHEMA projects TO blih_user;
GRANT ALL PRIVILEGES ON SCHEMA finance TO blih_user;
GRANT ALL PRIVILEGES ON SCHEMA audit TO blih_user;
EOF

# Run migrations
docker-compose exec api npm run migration:run
```

---

## 6. Service Configuration

### 6.1 Nginx Reverse Proxy

**`nginx/nginx.conf`:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream api {
        server api:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general_limit:10m rate=5r/s;

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name blih.yourcompany.com api.blih.yourcompany.com;
        return 301 https://$server_name$request_uri;
    }

    # Frontend (Main Application)
    server {
        listen 443 ssl http2;
        server_name blih.yourcompany.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;
        ssl_prefer_server_ciphers on;

        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # API Server
    server {
        listen 443 ssl http2;
        server_name api.blih.yourcompany.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # API rate limiting
        limit_req zone=api_limit burst=20 nodelay;

        location / {
            proxy_pass http://api;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS headers
            add_header Access-Control-Allow-Origin https://blih.yourcompany.com always;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;

            # Timeouts for long-running operations
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }
    }
}
```

---

## 7. SSL/TLS Setup

### 7.1 Using Let's Encrypt (Certbot)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx to free port 80
docker-compose stop nginx

# Obtain certificate
sudo certbot certonly --standalone \
  -d blih.yourcompany.com \
  -d api.blih.yourcompany.com \
  --email admin@yourcompany.com \
  --agree-tos

# Copy certificates to nginx directory
sudo mkdir -p ./nginx/ssl
sudo cp /etc/letsencrypt/live/blih.yourcompany.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/blih.yourcompany.com/privkey.pem ./nginx/ssl/

# Fix permissions
sudo chown $USER:$USER ./nginx/ssl/*

# Restart nginx
docker-compose up -d nginx

# Auto-renewal (add to crontab)
sudo crontab -e
# Add: 0 0 * * 0 certbot renew --quiet && docker-compose restart nginx
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy BLIH to VPS

on:
  push:
    branches: [main, production]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  # ========================================
  # Test & Build
  # ========================================
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

  # ========================================
  # Build & Push Docker Images
  # ========================================
  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write

    strategy:
      matrix:
        service: [frontend, api]

    steps:
      - uses: actions/checkout@v4

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}/${{ matrix.service }}
          tags: |
            type=ref,event=branch
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/${{ matrix.service }}
          file: ./apps/${{ matrix.service }}/Dockerfile.prod
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  # ========================================
  # Deploy to VPS
  # ========================================
  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'

    steps:
      - name: Deploy to VPS via SSH
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USERNAME }}
          key: ${{ secrets.VPS_SSH_KEY }}
          port: ${{ secrets.VPS_PORT || 22 }}
          script: |
            cd /opt/blih

            # Pull latest code
            git pull origin main

            # Pull latest images
            docker-compose pull

            # Restart services with zero-downtime
            docker-compose up -d --no-deps --build

            # Clean up old images
            docker image prune -f

            # Run database migrations
            docker-compose exec -T api npm run migration:run

            # Health check
            sleep 10
            curl -f http://localhost:3000/api/health || exit 1

      - name: Slack Notification
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'BLIH Deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 8.2 GitLab CI/CD

**`.gitlab-ci.yml`:**

```yaml
stages:
  - test
  - build
  - deploy

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: '/certs'

# ========================================
# Test Stage
# ========================================
test:
  stage: test
  image: node:20-alpine
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run lint
    - npm run test:ci
  artifacts:
    reports:
      junit: junit.xml
      coverage: coverage/

# ========================================
# Build Stage
# ========================================
build-frontend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  only:
    - main
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA ./apps/frontend
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE/frontend:latest
    - docker push $CI_REGISTRY_IMAGE/frontend:latest

build-api:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  only:
    - main
  script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker build -t $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA ./apps/api
    - docker push $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA
    - docker tag $CI_REGISTRY_IMAGE/api:$CI_COMMIT_SHA $CI_REGISTRY_IMAGE/api:latest
    - docker push $CI_REGISTRY_IMAGE/api:latest

# ========================================
# Deploy Stage
# ========================================
deploy-production:
  stage: deploy
  image: alpine:latest
  only:
    - main
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | tr -d '\r' | ssh-add -
    - mkdir -p ~/.ssh
    - chmod 700 ~/.ssh
    - ssh-keyscan $VPS_HOST >> ~/.ssh/known_hosts
  script:
    - |
      ssh $VPS_USERNAME@$VPS_HOST << 'ENDSSH'
        cd /opt/blih
        git pull origin main
        docker-compose pull
        docker-compose up -d --no-deps --build
        docker image prune -f
        docker-compose exec -T api npm run migration:run
        sleep 10
        curl -f http://localhost:3000/api/health || exit 1
      ENDSSH
  environment:
    name: production
    url: https://blih.yourcompany.com
```

### 8.3 Setup CI/CD Secrets

**GitHub Secrets:**

```bash
# Navigate to GitHub repository
# Settings > Secrets and variables > Actions > New repository secret

# Add these secrets:
VPS_HOST=your-vps-ip-address
VPS_USERNAME=your-ssh-username
VPS_SSH_KEY=<paste-your-private-key-here>
VPS_PORT=22
SLACK_WEBHOOK=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

**GitLab CI/CD Variables:**

```bash
# Navigate to GitLab project
# Settings > CI/CD > Variables > Add variable

# Add these variables:
VPS_HOST=your-vps-ip-address
VPS_USERNAME=your-ssh-username
SSH_PRIVATE_KEY=<paste-your-private-key-here>
```

---

## 9. Monitoring & Health Checks

### 9.1 Health Check Endpoints

```bash
# API Health Check
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" }
  },
  "timestamp": "2026-02-10T13:30:00Z"
}

# Frontend Health Check
curl http://localhost:3001/api/health
```

### 9.2 Docker Health Status

```bash
# Check all container health
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# View specific container health
docker inspect blih-api --format='{{.State.Health.Status}}'

# View health check logs
docker inspect blih-api --format='{{json .State.Health}}' | jq
```

### 9.3 Monitoring Script

**`scripts/monitor.sh`:**

```bash
#!/bin/bash

# BLIH Health Monitoring Script

SERVICES=("frontend" "api" "postgres" "redis" "qdrant" "ollama")
WEBHOOK_URL="${SLACK_WEBHOOK}"

check_service() {
    local service=$1
    local status=$(docker inspect blih-$service --format='{{.State.Health.Status}}' 2>/dev/null || echo "not_found")

    if [ "$status" != "healthy" ] && [ "$status" != "not_found" ]; then
        echo "⚠️ Service $service is $status"
        notify_slack "⚠️ BLIH Alert: Service $service is $status"
    fi
}

notify_slack() {
    local message=$1
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"$message\"}" \
        $WEBHOOK_URL
}

echo "🔍 Checking BLIH services..."
for service in "${SERVICES[@]}"; do
    check_service $service
done

echo "✅ Health check complete"
```

**Add to crontab:**

```bash
# Run every 5 minutes
*/5 * * * * /opt/blih/scripts/monitor.sh >> /var/log/blih-monitor.log 2>&1
```

---

## 10. Backup & Recovery

### 10.1 Automated Backup Script

**`scripts/backup.sh`:**

```bash
#!/bin/bash

# BLIH Backup Script

BACKUP_DIR="/opt/blih/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

echo "🔄 Starting BLIH backup - $DATE"

# Backup PostgreSQL
docker exec blih-postgres pg_dumpall -U blih_user > $BACKUP_DIR/postgres_$DATE.sql
gzip $BACKUP_DIR/postgres_$DATE.sql

# Backup MongoDB
docker exec blih-mongodb mongodump --uri="mongodb://blih_user:${MONGODB_PASSWORD}@localhost:27017" --out=/tmp/mongodump_$DATE
docker cp blih-mongodb:/tmp/mongodump_$DATE $BACKUP_DIR/
tar -czf $BACKUP_DIR/mongodb_$DATE.tar.gz -C $BACKUP_DIR mongodump_$DATE
rm -rf $BACKUP_DIR/mongodump_$DATE

# Backup Qdrant
docker exec blih-qdrant tar -czf /tmp/qdrant_$DATE.tar.gz /qdrant/storage
docker cp blih-qdrant:/tmp/qdrant_$DATE.tar.gz $BACKUP_DIR/

# Backup .env and configs
tar -czf $BACKUP_DIR/configs_$DATE.tar.gz .env docker-compose.yml nginx/

# Delete old backups
find $BACKUP_DIR -name "*.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "✅ Backup complete - $DATE"
```

**Schedule daily backups:**

```bash
# Add to crontab
crontab -e

# Add line: Daily at 2 AM
0 2 * * * /opt/blih/scripts/backup.sh >> /var/log/blih-backup.log 2>&1
```

### 10.2 Restore from Backup

```bash
# Restore PostgreSQL
gunzip -c /opt/blih/backups/postgres_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i blih-postgres psql -U blih_user

# Restore MongoDB
tar -xzf /opt/blih/backups/mongodb_YYYYMMDD_HHMMSS.tar.gz
docker cp mongodump_YYYYMMDD_HHMMSS blih-mongodb:/tmp/
docker exec blih-mongodb mongorestore /tmp/mongodump_YYYYMMDD_HHMMSS
```

---

## 11. Troubleshooting

### 11.1 Common Issues

**Service Won't Start:**

```bash
# Check logs
docker-compose logs service-name

# Check service health
docker inspect blih-service-name --format='{{json .State.Health}}' | jq

# Restart single service
docker-compose restart service-name
```

**Database Connection Issues:**

```bash
# Test PostgreSQL connection
docker exec -it blih-postgres psql -U blih_user -d blih_prod

# Test MongoDB connection
docker exec -it blih-mongodb mongosh -u blih_user -p

# Check network connectivity
docker network inspect blih-network
```

**Out of Disk Space:**

```bash
# Check disk usage
df -h

# Clean Docker resources
docker system prune -a --volumes

# Clean old logs
find /var/log -type f -name "*.log" -mtime +30 -delete
```

**Performance Issues (CPU):**

```bash
# Check container resource usage
docker stats

# Limit Ollama CPU usage
# Edit docker-compose.yml:
services:
  ollama:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 8G
```

---

## Quick Reference

### Essential Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f [service-name]

# Restart service
docker-compose restart [service-name]

# Check status
docker-compose ps

# Execute command in container
docker-compose exec [service] [command]

# Backup
./scripts/backup.sh

# Health check
curl http://localhost:3000/api/health
```

---

_Last Updated: February 2026_  
_For support: devops@yourcompany.com_
