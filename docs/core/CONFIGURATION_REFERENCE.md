# BLIH Configuration Reference

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** DevOps, System Administrators, Developers

---

## Table of Contents

1. [Environment Variables](#1-environment-variables)
2. [Database Configuration](#2-database-configuration)
3. [Authentication Configuration](#3-authentication-configuration)
4. [Module Configuration](#4-module-configuration)
5. [Performance Tuning](#5-performance-tuning)
6. [Feature Flags](#6-feature-flags)
7. [Logging Configuration](#7-logging-configuration)
8. [Security Settings](#8-security-settings)

---

## 1. Environment Variables

### 1.1 Complete Environment Reference

```bash
# ========================================
# BLIH Configuration Reference
# ========================================

# -----------------------------------------
# Environment
# -----------------------------------------
NODE_ENV=production|development|test
# Description: Application environment
# Default: development
# Required: Yes

DEPLOYMENT_ENV=production|staging|local
# Description: Deployment environment
# Default: local
# Required: Yes

# -----------------------------------------
# Company Context
# -----------------------------------------
COMPANY_ID=BLIH
# Description: Unique company identifier (uppercase)
# Default: BLIH
# Required: Yes
# Validation: Must be uppercase, max 10 chars

COMPANY_NAME="Your Company Name"
# Description: Company display name
# Default: BLIH
# Required: Yes

# -----------------------------------------
# PostgreSQL (Transactional Database)
# -----------------------------------------
POSTGRES_HOST=postgres
# Description: PostgreSQL server hostname
# Default: postgres (Docker service name)
# Required: Yes

POSTGRES_PORT=5432
# Description: PostgreSQL server port
# Default: 5432
# Required: Yes
# Range: 1-65535

POSTGRES_DB=blih_prod
# Description: Database name
# Default: blih_dev
# Required: Yes
# Pattern: [a-z0-9_]+

POSTGRES_USER=blih_user
# Description: Database username
# Default: postgres
# Required: Yes
# Min length: 3

POSTGRES_PASSWORD=<strong-password>
# Description: Database password
# Default: None
# Required: Yes
# Min length: 12
# Security: Must be strong (uppercase, lowercase, numbers, symbols)

DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}
# Description: Full PostgreSQL connection string
# Required: No (auto-generated from above)

# PostgreSQL Connection Pool
POSTGRES_POOL_MIN=5
# Description: Minimum connection pool size
# Default: 5
# Range: 1-20

POSTGRES_POOL_MAX=20
# Description: Maximum connection pool size
# Default: 20
# Range: 5-100

POSTGRES_CONNECTION_TIMEOUT=5000
# Description: Connection timeout in milliseconds
# Default: 5000
# Range: 1000-30000

# -----------------------------------------
# MongoDB (Document Database)
# -----------------------------------------
MONGODB_HOST=mongodb
# Description: MongoDB server hostname
# Default: mongodb
# Required: Yes

MONGODB_PORT=27017
# Description: MongoDB server port
# Default: 27017
# Required: Yes

MONGODB_DB=blih_prod
# Description: MongoDB database name
# Default: blih_dev
# Required: Yes

MONGODB_USER=blih_user
# Description: MongoDB username
# Default: None
# Required: Yes

MONGODB_PASSWORD=<strong-password>
# Description: MongoDB password
# Default: None
# Required: Yes
# Min length: 12

MONGODB_URL=mongodb://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DB}?authSource=admin
# Description: MongoDB connection string
# Required: No (auto-generated)

# MongoDB Options
MONGODB_POOL_SIZE=10
# Description: Connection pool size
# Default: 10
# Range: 5-50

MONGODB_AUTO_INDEX=true
# Description: Auto-create indexes
# Default: true
# Values: true, false

# -----------------------------------------
# Redis (Cache & Sessions)
# -----------------------------------------
REDIS_HOST=redis
# Description: Redis server hostname
# Default: redis
# Required: Yes

REDIS_PORT=6379
# Description: Redis server port
# Default: 6379
# Required: Yes

REDIS_PASSWORD=<password>
# Description: Redis password (leave empty for no auth)
# Default: None
# Required: No

REDIS_DB=0
# Description: Redis database number
# Default: 0
# Range: 0-15

REDIS_TTL=3600
# Description: Default cache TTL in seconds
# Default: 3600 (1 hour)
# Range: 60-86400

# -----------------------------------------
#RabbitMQ (Message Queue / Event Bus)
# -----------------------------------------
RABBITMQ_HOST=rabbitmq
# Description: RabbitMQ server hostname
# Default: rabbitmq
# Required: Yes

RABBITMQ_PORT=5672
# Description: RabbitMQ AMQP port
# Default: 5672
# Required: Yes

RABBITMQ_USER=blih_user
# Description: RabbitMQ username
# Default: guest
# Required: Yes

RABBITMQ_PASSWORD=<password>
# Description: RabbitMQ password
# Default: guest
# Required: Yes

RABBITMQ_VHOST=/blih
# Description: RabbitMQ virtual host
# Default: /
# Required: No

RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${RABBITMQ_VHOST}
# Description: Full AMQP connection string
# Required: No (auto-generated)

# -----------------------------------------
# Qdrant (Vector Database for AI)
# -----------------------------------------
QDRANT_HOST=qdrant
# Description: Qdrant server hostname
# Default: qdrant
# Required: Yes (if Brain module enabled)

QDRANT_PORT=6333
# Description: Qdrant HTTP port
# Default: 6333
# Required: Yes

QDRANT_API_KEY=<api-key>
# Description: Qdrant API key
# Default: None
# Required: Yes (production)
# Min length: 32

# -----------------------------------------
# Ollama (Local LLM)
# -----------------------------------------
OLLAMA_HOST=ollama
# Description: Ollama server hostname
# Default: ollama
# Required: Yes (if Brain module enabled)

OLLAMA_PORT=11434
# Description: Ollama HTTP port
# Default: 11434
# Required: Yes

OLLAMA_MODEL=llama3.2
# Description: Default LLM model
# Default: llama3.2
# Options: llama3.2, llama3.2:3b, llama3.2:7b
# Required: Yes

OLLAMA_BASE_URL=http://${OLLAMA_HOST}:${OLLAMA_PORT}
# Description: Ollama base URL
# Required: No (auto-generated)

OLLAMA_TIMEOUT=30000
# Description: Request timeout in milliseconds
# Default: 30000
# Range: 10000-120000

# -----------------------------------------
# Authentication & Security
# -----------------------------------------

# Keycloak (IAM)
KEYCLOAK_URL=http://keycloak:8080
# Description: Keycloak server URL
# Default: http://keycloak:8080
# Required: Yes

KEYCLOAK_REALM=blih
# Description: Keycloak realm name
# Default: blih
# Required: Yes

KEYCLOAK_CLIENT_ID=blih-api
# Description: Keycloak client ID
# Default: blih-api
# Required: Yes

KEYCLOAK_CLIENT_SECRET=<client-secret>
# Description: Keycloak client secret
# Default: None
# Required: Yes
# Security: Strong random string

# JWT Configuration
JWT_SECRET=<ultra-secure-random-string>
# Description: JWT signing secret
# Default: None
# Required: Yes
# Min length: 64
# Security: CRITICAL - Use cryptographically secure random string

JWT_EXPIRATION=15m
# Description: Access token expiration
# Default: 15m
# Options: 5m, 10m, 15m, 30m, 1h
# Recommended: 15m for security

REFRESH_TOKEN_SECRET=<another-ultra-secure-string>
# Description: Refresh token signing secret
# Default: None
# Required: Yes
# Min length: 64
# Security: MUST be different from JWT_SECRET

REFRESH_TOKEN_EXPIRATION=7d
# Description: Refresh token expiration
# Default: 7d
# Options: 1d, 7d, 14d, 30d
# Recommended: 7d

# Encryption
ENCRYPTION_KEY=<32-byte-hex-string>
# Description: AES-256 encryption key
# Default: None
# Required: Yes
# Length: Exactly 64 hex characters (32 bytes)
# Generation: openssl rand -hex 32

ENCRYPTION_ALGORITHM=aes-256-gcm
# Description: Encryption algorithm
# Default: aes-256-gcm
# Options: aes-256-gcm, aes-256-cbc
# Required: Yes

# -----------------------------------------
# Frontend Configuration
# -----------------------------------------
NEXT_PUBLIC_API_URL=https://api.blih.yourcompany.com
# Description: Public API base URL
# Default: http://localhost:3000
# Required: Yes
# Note: Must be accessible from browser

NEXT_PUBLIC_WS_URL=wss://api.blih.yourcompany.com
# Description: WebSocket URL
# Default: ws://localhost:3000
# Required: Yes

NEXT_PUBLIC_APP_URL=https://blih.yourcompany.com
# Description: Frontend application URL
# Default: http://localhost:3001
# Required: Yes

# -----------------------------------------
# Backend Configuration
# -----------------------------------------
API_PORT=3000
# Description: API server port
# Default: 3000
# Range: 1024-65535

API_HOST=0.0.0.0
# Description: API server bind address
# Default: 0.0.0.0
# Options: 0.0.0.0 (all interfaces), 127.0.0.1 (localhost only)

API_PREFIX=/api/v1
# Description: API route prefix
# Default: /api/v1
# Pattern: /[a-z0-9/-]+

CORS_ORIGIN=https://blih.yourcompany.com
# Description: Allowed CORS origins (comma-separated)
# Default: http://localhost:3001
# Format: https://example.com,https://app.example.com

# -----------------------------------------
# Email Configuration (SMTP)
# -----------------------------------------
SMTP_HOST=smtp.gmail.com
# Description: SMTP server hostname
# Default: None
# Required: Yes (if email enabled)

SMTP_PORT=587
# Description: SMTP server port
# Default: 587
# Options: 25, 465 (SSL), 587 (TLS)

SMTP_SECURE=false
# Description: Use SSL/TLS
# Default: false
# Values: true (port 465), false (port 587)

SMTP_USER=noreply@yourcompany.com
# Description: SMTP username/email
# Default: None
# Required: Yes

SMTP_PASSWORD=<app-password>
# Description: SMTP password or app-specific password
# Default: None
# Required: Yes

EMAIL_FROM="BLIH <noreply@yourcompany.com>"
# Description: Default from address
# Default: None
# Required: Yes
# Format: "Name <email@example.com>"

# -----------------------------------------
# File Storage (MinIO / S3)
# -----------------------------------------
MINIO_HOST=minio
# Description: MinIO server hostname
# Default: minio
# Required: Yes

MINIO_PORT=9000
# Description: MinIO API port
# Default: 9000
# Required: Yes

MINIO_ROOT_USER=blih_admin
# Description: MinIO root username
# Default: minioadmin
# Required: Yes
# Min length: 3

MINIO_ROOT_PASSWORD=<strong-password>
# Description: MinIO root password
# Default: minioadmin
# Required: Yes
# Min length: 8

MINIO_BUCKET=blih-files
# Description: Default storage bucket
# Default: blih-files
# Required: Yes

MINIO_USE_SSL=false
# Description: Use HTTPS for MinIO
# Default: false
# Values: true, false

# -----------------------------------------
# Logging Configuration
# -----------------------------------------
LOG_LEVEL=info
# Description: Application log level
# Default: info
# Options: error, warn, info, debug, trace
# Production: info or warn

LOG_FORMAT=json
# Description: Log output format
# Default: json
# Options: json, pretty
# Production: json

LOG_MAX_FILES=5
# Description: Maximum log file count
# Default: 5
# Range: 1-30

LOG_MAX_SIZE=5242880
# Description: Max log file size in bytes (5MB)
# Default: 5242880
# Range: 1048576-104857600

# -----------------------------------------
# Health Check
# -----------------------------------------
HEALTH_CHECK_ENABLED=true
# Description: Enable /health endpoint
# Default: true
# Values: true, false

HEALTH_CHECK_INTERVAL=30s
# Description: Health check interval
# Default: 30s
# Format: 10s, 30s, 1m, 5m

# -----------------------------------------
# Module Enablement
# -----------------------------------------
MODULE_HR_ENABLED=true
# Description: Enable HR module
# Default: true
# Values: true, false

MODULE_CRM_ENABLED=true
# Description: Enable CRM module
# Default: true
# Values: true, false

MODULE_PROJECTS_ENABLED=true
# Description: Enable Projects module
# Default: true
# Values: true, false

MODULE_FINANCE_ENABLED=true
# Description: Enable Finance module
# Default: true
# Values: true, false

MODULE_BRAIN_ENABLED=true
# Description: Enable Brain (AI) module
# Default: true
# Values: true, false
# Note: Requires Qdrant and Ollama

# -----------------------------------------
# Feature Flags
# -----------------------------------------
FEATURE_ATTENDANCE_GPS=true
# Description: Enable GPS-based attendance
# Default: false
# Values: true, false

FEATURE_AI_SUGGESTIONS=true
# Description: Enable AI-powered suggestions
# Default: false
# Values: true, false

FEATURE_ETHIOPIAN_CALENDAR=true
# Description: Enable Ethiopian calendar support
# Default: true
# Values: true, false

FEATURE_MOBILE_APP=false
# Description: Enable mobile app API
# Default: false
# Values: true, false

# -----------------------------------------
# Backup Configuration
# -----------------------------------------
BACKUP_ENABLED=true
# Description: Enable automated backups
# Default: true
# Values: true, false

BACKUP_SCHEDULE="0 2 * * *"
# Description: Backup cron schedule
# Default: "0 2 * * *" (Daily at 2 AM)
# Format: Cron expression

BACKUP_RETENTION_DAYS=30
# Description: Backup retention period in days
# Default: 30
# Range: 7-365

BACKUP_S3_BUCKET=blih-backups
# Description: S3 bucket for backups
# Default: blih-backups
# Required: Yes (if using S3)

# -----------------------------------------
# Performance Tuning
# -----------------------------------------
MAX_REQUEST_SIZE=10mb
# Description: Maximum request body size
# Default: 10mb
# Options: 1mb, 10mb, 50mb, 100mb

RATE_LIMIT_WINDOW=15m
# Description: Rate limiting time window
# Default: 15m
# Options: 1m, 5m, 15m, 1h

RATE_LIMIT_MAX=100
# Description: Max requests per window
# Default: 100
# Range: 10-1000

# -----------------------------------------
# Monitoring & Observability
# -----------------------------------------
METRICS_ENABLED=true
# Description: Enable Prometheus metrics
# Default: true
# Values: true, false

TRACING_ENABLED=false
# Description: Enable distributed tracing
# Default: false
# Values: true, false

JAEGER_ENDPOINT=http://jaeger:14268/api/traces
# Description: Jaeger collector endpoint
# Default: None
# Required: Yes (if tracing enabled)
```

---

## 2. Database Configuration

### 2.1 PostgreSQL Tuning

**`postgresql.conf` recommended settings:**

```ini
# Connection Settings
max_connections = 200
shared_buffers = 2GB
effective_cache_size = 6GB
maintenance_work_mem = 512MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 10485kB
min_wal_size = 1GB
max_wal_size = 4GB

# Query Tuning
max_worker_processes = 8
max_parallel_workers_per_gather = 4
max_parallel_workers = 8
```

### 2.2 MongoDB Tuning

**`mongod.conf`:**

```yaml
storage:
  dbPath: /data/db
  wiredTiger:
    engineConfig:
      cacheSizeGB: 2
      journalCompressor: snappy

net:
  port: 27017
  bindIp: 0.0.0.0
  maxIncomingConnections: 1000

replication:
  replSetName: rs0

security:
  authorization: enabled
```

---

## 3. Authentication Configuration

### 3.1 Keycloak Realm Configuration

```json
{
  "realm": "blih",
  "enabled": true,
  "sslRequired": "external",
  "registrationAllowed": false,
  "bruteForceProtected": true,
  "permanentLockout": false,
  "maxFailureWaitSeconds": 900,
  "minimumQuickLoginWaitSeconds": 60,
  "passwordPolicy": "length(12) and digits(1) and lowerCase(1) and upperCase(1) and specialChars(1)"
}
```

---

## 4. Module Configuration

### 4.1 HR Module Settings

```typescript
export const HR_CONFIG = {
  recruitment: {
    autoApprove: false,
    requireManagerApproval: true,
    jobPostingDuration: 30, // days
  },
  attendance: {
    gpsEnabled: process.env.FEATURE_ATTENDANCE_GPS === 'true',
    gpsRadius: 100, // meters
    gracePeriod: 15, // minutes
  },
  leave: {
    autoApprove: false,
    maxDaysPerRequest: 30,
    requiresApproval: true,
  },
};
```

---

## 5. Performance Tuning

### 5.1 Node.js Performance

```bash
# Memory
NODE_OPTIONS="--max-old-space-size=2048"

# GC
NODE_OPTIONS="--optimize-for-size --max-old-space-size=2048"

# Clustering
PM2_INSTANCES=4
```

---

## 6. Feature Flags

```typescript
export const FEATURE_FLAGS = {
  ATTENDANCE_GPS: process.env.FEATURE_ATTENDANCE_GPS === 'true',
  AI_SUGGESTIONS: process.env.FEATURE_AI_SUGGESTIONS === 'true',
  ETHIOPIAN_CALENDAR: process.env.FEATURE_ETHIOPIAN_CALENDAR === 'true',
  MOBILE_APP: process.env.FEATURE_MOBILE_APP === 'true',
};
```

---

## 7. Logging Configuration

```typescript
export const LOGGING_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  format: process.env.LOG_FORMAT || 'json',
  maxFiles: parseInt(process.env.LOG_MAX_FILES) || 5,
  maxSize: parseInt(process.env.LOG_MAX_SIZE) || 5242880,
};
```

---

## 8. Security Settings

```typescript
export const SECURITY_CONFIG = {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRATION || '15m',
  },
  encryption: {
    algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-gcm',
    key: Buffer.from(process.env.ENCRYPTION_KEY, 'hex'),
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
};
```

---

**Last Updated:** February 2026  
**Configuration Version:** 1.0
