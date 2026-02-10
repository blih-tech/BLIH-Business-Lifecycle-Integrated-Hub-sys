# BLIH Deployment Infrastructure Guide

## Overview

This document provides comprehensive deployment infrastructure for BLIH system with RAG capabilities, optimized for CPU-only VPS environments while maintaining scalability, security, and performance requirements.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    External Users                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Load Balancer / CDN                          │
│                   (CloudFlare/HAProxy)                      │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                API Gateway                                   │
│                   (Kong/Nginx)                             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                Application Layer                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │   Frontend  │ │   Backend   │ │     RAG Service     │ │
│  │  (Next.js)  │ │  (NestJS)  │ │    (NestJS)        │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                Data Layer                                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐ │
│  │  MongoDB    │ │   Qdrant    │ │      Ollama        │ │
│  │(Documents)  │ │ (Vectors)   │ │     (LLM)          │ │
│  └─────────────┘ └─────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Hardware Requirements

### Minimum Production Setup

```yaml
CPU: 8 vCPUs (Intel Xeon or AMD EPYC with AVX-512)
RAM: 32GB DDR4 ECC
Storage: 1TB NVMe SSD (10,000+ IOPS)
Network: 1Gbps with 99.9% uptime
Bandwidth: 10TB/month transfer
```

### Recommended Production Setup

```yaml
CPU: 16 vCPUs (Intel Xeon or AMD EPYC with AVX-512)
RAM: 64GB DDR4 ECC
Storage: 2TB NVMe SSD + 5TB SATA SSD backup
Network: 10Gbps with 99.95% uptime
Bandwidth: 50TB/month transfer
```

### Development Environment

```yaml
CPU: 4-8 vCPUs
RAM: 16GB DDR4
Storage: 500GB SSD
Network: 100Mbps
Bandwidth: 2TB/month
```

## Docker Compose Deployment

### Production Docker Compose

```yaml
version: '3.8'

services:
  # Load Balancer
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Frontend Application
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.blih.company.com
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # Backend API
  backend:
    build: 
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongodb:27017/blih
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - KEYCLOAK_URL=${KEYCLOAK_URL}
    depends_on:
      - mongodb
      - redis
      - keycloak
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 4G
        reservations:
          cpus: '2.0'
          memory: 2G

  # RAG Service
  rag-service:
    build: 
      context: ./rag-service
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - QDRANT_URL=http://qdrant:6333
      - OLLAMA_URL=http://ollama:11434
      - MONGODB_URL=mongodb://mongodb:27017/blih-rag
      - CPU_AWARE=true
      - MAX_CONCURRENT_QUERIES=50
    depends_on:
      - qdrant
      - ollama
      - mongodb
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '8.0'
          memory: 8G
        reservations:
          cpus: '4.0'
          memory: 4G

  # Vector Database
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__MAX_REQUEST_SIZE_MB=32
      - QDRANT__STORAGE__PERFORMANCE__MAX_SEARCH_THREADS=4
      - QDRANT__STORAGE__PERFORMANCE__MAX_VECTOR_SIZE_BYTES=1024
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 8G
        reservations:
          cpus: '2.0'
          memory: 4G

  # Local LLM Service
  ollama:
    image: ollama/ollama:latest
    ports:
      - "11434:11434"
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_GPU=0
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_MAX_LOADED_MODELS=1
      - OLLAMA_NUM_THREAD=8
      - OLLAMA_MAX_QUEUE=512
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '8.0'
          memory: 32G
        reservations:
          cpus: '4.0'
          memory: 16G

  # Document Database
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - ./mongodb/mongod.conf:/etc/mongod.conf
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
      - MONGO_INITDB_DATABASE=blih
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 8G
        reservations:
          cpus: '1.0'
          memory: 4G

  # Cache
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
      - ./redis/redis.conf:/etc/redis/redis.conf
    command: redis-server /etc/redis/redis.conf
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 1G

  # Identity Provider
  keycloak:
    image: quay.io/keycloak/keycloak:24.0
    ports:
      - "8080:8080"
    environment:
      - KEYCLOAK_ADMIN=${KEYCLOAK_ADMIN}
      - KEYCLOAK_ADMIN_PASSWORD=${KEYCLOAK_ADMIN_PASSWORD}
      - KC_DB=postgres
      - KC_DB_URL=jdbc:postgresql://keycloak-db:5432/keycloak
      - KC_DB_USERNAME=keycloak
      - KC_DB_PASSWORD=${KEYCLOAK_DB_PASSWORD}
    depends_on:
      - keycloak-db
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

  # Keycloak Database
  keycloak-db:
    image: postgres:16
    environment:
      - POSTGRES_DB=keycloak
      - POSTGRES_USER=keycloak
      - POSTGRES_PASSWORD=${KEYCLOAK_DB_PASSWORD}
    volumes:
      - keycloak_db_data:/var/lib/postgresql/data
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Object Storage
  minio:
    image: minio/minio:latest
    ports:
      - "9000:9000"
      - "9001:9001"
    volumes:
      - minio_data:/data
    environment:
      - MINIO_ROOT_USER=${MINIO_ROOT_USER}
      - MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M

  # Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=${N8N_USER}
      - N8N_BASIC_AUTH_PASSWORD=${N8N_PASSWORD}
      - N8N_HOST=n8n.blih.company.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
    volumes:
      - n8n_data:/home/node/.n8n
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G
        reservations:
          cpus: '1.0'
          memory: 1G

volumes:
  qdrant_data:
    driver: local
  ollama_data:
    driver: local
  mongodb_data:
    driver: local
  redis_data:
    driver: local
  keycloak_db_data:
    driver: local
  minio_data:
    driver: local
  n8n_data:
    driver: local

networks:
  default:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
```

## Kubernetes Deployment

### Namespace Configuration

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: blih
  labels:
    name: blih
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: blih-config
  namespace: blih
data:
  NODE_ENV: "production"
  CPU_AWARE: "true"
  MAX_CONCURRENT_QUERIES: "100"
  EMBEDDING_MODEL: "all-MiniLM-L6-v2"
  LLM_MODEL: "llama3:8b-q4_K_M"
```

### Deployment Manifests

```yaml
# Backend Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: blih
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: blih/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          valueFrom:
            configMapKeyRef:
              name: blih-config
              key: NODE_ENV
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# RAG Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rag-service
  namespace: blih
spec:
  replicas: 2
  selector:
    matchLabels:
      app: rag-service
  template:
    metadata:
      labels:
        app: rag-service
    spec:
      containers:
      - name: rag-service
        image: blih/rag-service:latest
        ports:
        - containerPort: 3001
        env:
        - name: CPU_AWARE
          valueFrom:
            configMapKeyRef:
              name: blih-config
              key: CPU_AWARE
        resources:
          requests:
            memory: "4Gi"
            cpu: "2000m"
          limits:
            memory: "8Gi"
            cpu: "4000m"
```

### Service Configuration

```yaml
# Backend Service
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: blih
spec:
  selector:
    app: backend
  ports:
  - protocol: TCP
    port: 3000
    targetPort: 3000
  type: ClusterIP

---
# RAG Service
apiVersion: v1
kind: Service
metadata:
  name: rag-service
  namespace: blih
spec:
  selector:
    app: rag-service
  ports:
  - protocol: TCP
    port: 3001
    targetPort: 3001
  type: ClusterIP

---
# Ingress Configuration
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: blih-ingress
  namespace: blih
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/rate-limit: "100"
spec:
  tls:
  - hosts:
    - api.blih.company.com
    - app.blih.company.com
    secretName: blih-tls
  rules:
  - host: api.blih.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-service
            port:
              number: 3000
  - host: app.blih.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend-service
            port:
              number: 3000
```

## Network Configuration

### Nginx Configuration

```nginx
upstream backend {
    server backend:3000;
    keepalive 32;
}

upstream rag-service {
    server rag-service:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name api.blih.company.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.blih.company.com;
    
    ssl_certificate /etc/ssl/api.blih.company.com.crt;
    ssl_certificate_key /etc/ssl/api.blih.company.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    client_max_body_size 100M;
    
    location /api/rag/ {
        proxy_pass http://rag-service;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Security Configuration

### Firewall Rules

```bash
#!/bin/bash
# UFW Firewall Configuration

# Reset rules
ufw --force reset

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (with rate limiting)
ufw limit ssh

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow internal services
ufw allow from 172.20.0.0/16 to any port 27017  # MongoDB
ufw allow from 172.20.0.0/16 to any port 6333  # Qdrant
ufw allow from 172.20.0.0/16 to any port 11434 # Ollama
ufw allow from 172.20.0.0/16 to any port 6379  # Redis

# Enable firewall
ufw --force enable

# Show status
ufw status verbose
```

### SSL/TLS Configuration

```yaml
# Let's Encrypt Certbot Configuration
certbot:
  image: certbot/certbot:latest
  volumes:
    - ./letsencrypt:/etc/letsencrypt
    - ./certbot-webroot:/var/www/certbot
  command: >
    sh -c "certbot certonly --webroot
    --webroot-path=/var/www/certbot
    --email admin@blih.company.com
    --agree-tos
    --no-eff-email
    -d api.blih.company.com
    -d app.blih.company.com
    --rsa-key-size 4096"
```

## Monitoring & Logging

### Prometheus Configuration

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'rag-service'
    static_configs:
      - targets: ['rag-service:3001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'qdrant'
    static_configs:
      - targets: ['qdrant:6333']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']
    scrape_interval: 30s

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 30s
```

### Grafana Dashboard

```json
{
  "dashboard": {
    "title": "BLIH System Overview",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "RAG Query Performance",
        "type": "graph",
        "targets": [
          {
            "expr": "rag_query_duration_seconds",
            "legendFormat": "Query Duration"
          }
        ]
      }
    ]
  }
}
```

## Backup Strategy

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh - Automated backup script

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

# MongoDB backup
docker exec mongodb mongodump --out /tmp/backup
docker cp mongodb:/tmp/backup $BACKUP_DIR/$DATE/mongodb

# Qdrant backup
docker exec qdrant wget http://localhost:6333/snapshots -O backup.snapshot
docker cp qdrant:/backup.snapshot $BACKUP_DIR/$DATE/qdrant

# Ollama models backup
docker cp ollama:/root/.ollama $BACKUP_DIR/$DATE/ollama

# Compress backups
tar -czf $BACKUP_DIR/blih_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE

# Remove uncompressed backup
rm -rf $BACKUP_DIR/$DATE

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/blih_backup_$DATE.tar.gz s3://backups/

# Clean old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: blih_backup_$DATE.tar.gz"
```

### Cron Job Configuration

```bash
# Add to crontab with: crontab -e
# Daily backup at 2 AM
0 2 * * * /opt/blih/scripts/backup.sh >> /var/log/backup.log 2>&1

# Weekly system maintenance
0 3 * * 0 /opt/blih/scripts/maintenance.sh >> /var/log/maintenance.log 2>&1

# Log rotation
0 4 * * * /opt/blih/scripts/rotate-logs.sh >> /var/log/log-rotation.log 2>&1
```

## Performance Optimization

### System Tuning

```bash
#!/bin/bash
# optimize-system.sh - System performance tuning

# Increase file descriptor limit
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf

# Optimize network settings
echo "net.core.rmem_max = 134217728" >> /etc/sysctl.conf
echo "net.core.wmem_max = 134217728" >> /etc/sysctl.conf
echo "net.ipv4.tcp_rmem = 4096 87380 134217728" >> /etc/sysctl.conf
echo "net.ipv4.tcp_wmem = 4096 65536 134217728" >> /etc/sysctl.conf

# Apply changes
sysctl -p

# Optimize I/O scheduler
echo 'mq-deadline' > /sys/block/sda/queue/scheduler

# Disable swap for better performance
swapoff -a

# Optimize CPU governor
echo 'performance' > /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
```

### Docker Optimization

```yaml
# Docker daemon configuration
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ],
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  },
  "max-concurrent-downloads": 10,
  "max-concurrent-uploads": 5
}
```

## Deployment Scripts

### Automated Deployment

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e

# Configuration
REPO_URL="https://github.com/company/blih.git"
DEPLOY_DIR="/opt/blih"
BACKUP_DIR="/backups"
COMPOSE_FILE="docker-compose.prod.yml"

# Create backup before deployment
echo "Creating backup..."
$DEPLOY_DIR/scripts/backup.sh

# Pull latest code
echo "Pulling latest code..."
cd $DEPLOY_DIR
git pull origin main

# Build and deploy
echo "Building and deploying..."
docker-compose -f $COMPOSE_FILE down
docker-compose -f $COMPOSE_FILE build --no-cache
docker-compose -f $COMPOSE_FILE up -d

# Wait for services to be ready
echo "Waiting for services to be ready..."
sleep 30

# Health checks
echo "Performing health checks..."
curl -f http://localhost/api/health || exit 1
curl -f http://localhost/api/rag/health || exit 1

echo "Deployment completed successfully!"
```

### Rollback Script

```bash
#!/bin/bash
# rollback.sh - Rollback to previous version

set -e

BACKUP_DIR="/backups"
LATEST_BACKUP=$(ls -t $BACKUP_DIR/blih_backup_*.tar.gz | head -n1)

echo "Rolling back to: $LATEST_BACKUP"

# Stop current services
docker-compose -f docker-compose.prod.yml down

# Restore backup
tar -xzf $LATEST_BACKUP -C /

# Start services
docker-compose -f docker-compose.prod.yml up -d

echo "Rollback completed!"
```

## Environment Variables

### Production Environment

```bash
# .env.production
# Database Configuration
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=your_secure_password
DATABASE_URL=mongodb://admin:your_secure_password@mongodb:27017/blih?authSource=admin

# Authentication
JWT_SECRET=your_jwt_secret_key_here
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=your_keycloak_password
KEYCLOAK_DB_PASSWORD=your_keycloak_db_password

# Object Storage
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=your_minio_password

# Workflow Automation
N8N_USER=admin
N8N_PASSWORD=your_n8n_password

# SSL Configuration
SSL_EMAIL=admin@blih.company.com
SSL_DOMAINS=api.blih.company.com,app.blih.company.com

# Monitoring
PROMETHEUS_RETENTION=30d
GRAFANA_ADMIN_PASSWORD=your_grafana_password

# Backup
BACKUP_RETENTION_DAYS=30
CLOUD_BACKUP_ENABLED=false
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Restart memory-heavy services
   docker-compose restart rag-service
   
   # Clear Ollama cache
   docker exec ollama ollama rm unused
   ```

2. **Slow Query Performance**
   ```bash
   # Check Qdrant performance
   curl http://localhost:6333/telemetry
   
   # Optimize vector search
   docker exec qdrant qdrant-cli collections update --collection-name documents --hnsw-config '{"m": 16, "ef_construct": 128}'
   ```

3. **Database Connection Issues**
   ```bash
   # Check MongoDB status
   docker exec mongodb mongo --eval "db.adminCommand('ismaster')"
   
   # Restart MongoDB
   docker-compose restart mongodb
   ```

### Log Analysis

```bash
# View application logs
docker-compose logs -f backend
docker-compose logs -f rag-service

# View system logs
journalctl -u docker.service -f

# Monitor resource usage
htop
iotop
nethogs
```

This comprehensive deployment infrastructure guide provides everything needed to deploy and maintain the BLIH system with RAG capabilities in a production environment.
