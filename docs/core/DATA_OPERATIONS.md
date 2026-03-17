# BLIH Data Operations Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** DBAs, DevOps, System Administrators

---

## Table of Contents

1. [Backup Strategies](#1-backup-strategies)
2. [Disaster Recovery](#2-disaster-recovery)
3. [Data Migration](#3-data-migration)
4. [Data Retention](#4-data-retention)
5. [Database Maintenance](#5-database-maintenance)
6. [Data Security](#6-data-security)
7. [Performance Optimization](#7-performance-optimization)
8. [Audit & Compliance](#8-audit--compliance)

---

## 1. Backup Strategies

### 1.1 Backup Types

| Type                | Frequency    | Retention | Purpose                   |
| ------------------- | ------------ | --------- | ------------------------- |
| **Full Backup**     | Daily (2 AM) | 30 days   | Complete system snapshot  |
| **Incremental**     | Hourly       | 7 days    | Changes since last backup |
| **Transaction Log** | Continuous   | 7 days    | Point-in-time recovery    |
| **Configuration**   | On change    | 90 days   | System settings           |

### 1.2 Automated Backup Script

**`scripts/backup-all.sh`:**

```bash
#!/bin/bash
#===========================================
# BLIH Automated Backup Script
#===========================================

set -e

# Configuration
BACKUP_DIR="/opt/blih/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30
S3_BUCKET="${BACKUP_S3_BUCKET:-blih-backups}"

# Ensure backup directory exists
mkdir -p "$BACKUP_DIR"/{postgres,qdrant,configs}

echo "🔄 Starting BLIH backup - $DATE"

#-------------------------------------------
# 1. PostgreSQL Backup
#-------------------------------------------
echo "📦 Backing up PostgreSQL..."
docker exec blih-postgres pg_dumpall -U blih_user > "$BACKUP_DIR/postgres/postgres_$DATE.sql"
gzip "$BACKUP_DIR/postgres/postgres_$DATE.sql"
echo "✅ PostgreSQL backup complete"

#-------------------------------------------
# 3. Qdrant Backup
#-------------------------------------------
echo "📦 Backing up Qdrant..."
docker exec blih-qdrant tar -czf /tmp/qdrant_$DATE.tar.gz /qdrant/storage
docker cp blih-qdrant:/tmp/qdrant_$DATE.tar.gz "$BACKUP_DIR/qdrant/"
echo "✅ Qdrant backup complete"

#-------------------------------------------
# 4. Redis Backup (RDB Snapshot)
#-------------------------------------------
echo "📦 Backing up Redis..."
docker exec blih-redis redis-cli BGSAVE
sleep 5 # Wait for save to complete
docker cp blih-redis:/data/dump.rdb "$BACKUP_DIR/redis/redis_$DATE.rdb"
echo "✅ Redis backup complete"

#-------------------------------------------
# 5. Configuration Files
#-------------------------------------------
echo "📦 Backing up configuration files..."
tar -czf "$BACKUP_DIR/configs/configs_$DATE.tar.gz" \
  .env \
  docker-compose.yml \
  nginx/nginx.conf \
  prometheus/prometheus.yml
echo "✅ Configuration backup complete"

#-------------------------------------------
# 6. File Storage (MinIO) Backup
#-------------------------------------------
echo "📦 Backing up MinIO files..."
docker exec blih-minio mc mirror /data "$BACKUP_DIR/minio/minio_$DATE"
tar -czf "$BACKUP_DIR/minio/minio_$DATE.tar.gz" -C "$BACKUP_DIR/minio" "minio_$DATE"
rm -rf "$BACKUP_DIR/minio/minio_$DATE"
echo "✅ MinIO backup complete"

#-------------------------------------------
# 7. Upload to S3 (Optional)
#-------------------------------------------
if [ -n "$S3_BUCKET" ]; then
  echo "☁️ Uploading backups to S3..."
  aws s3 sync "$BACKUP_DIR" "s3://$S3_BUCKET/blih-backups/$DATE/" \
    --storage-class STANDARD_IA
  echo "✅ S3 upload complete"
fi

#-------------------------------------------
# 8. Cleanup Old Backups
#-------------------------------------------
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -type f -name "*.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -type f -name "*.rdb" -mtime +$RETENTION_DAYS -delete
echo "✅ Cleanup complete"

#-------------------------------------------
# 9. Verify Backups
#-------------------------------------------
echo "🔍 Verifying backups..."
for file in "$BACKUP_DIR"/*/*.gz; do
  if gzip -t "$file" 2>/dev/null; then
    echo "✅ $file is valid"
  else
    echo "❌ $file is corrupted!"
    exit 1
  fi
done

#-------------------------------------------
# 10. Summary
#-------------------------------------------
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "───────────────────────────────────────"
echo "✅ Backup Complete - $DATE"
echo "📊 Total backup size: $BACKUP_SIZE"
echo "📁 Location: $BACKUP_DIR"
echo "☁️  S3 Bucket: s3://$S3_BUCKET/blih-backups/$DATE/"
echo "───────────────────────────────────────"

# Send notification (optional)
if [ -n "$SLACK_WEBHOOK" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"✅ BLIH Backup Complete ($BACKUP_SIZE)\"}" \
    "$SLACK_WEBHOOK"
fi
```

**Make executable and schedule:**

```bash
chmod +x scripts/backup-all.sh

# Add to crontab for daily 2 AM backups
crontab -e
# Add: 0 2 * * * /opt/blih/scripts/backup-all.sh >> /var/log/blih-backup.log 2>&1
```

### 1.3 Incremental Backup (Hourly)

**`scripts/backup-incremental.sh`:**

```bash
#!/bin/bash
# Incremental backup (WAL archiving for PostgreSQL)

ARCHIVE_DIR="/opt/blih/backups/wal-archive"
mkdir -p "$ARCHIVE_DIR"

# Archive WAL files
docker exec blih-postgres pg_basebackup \
  -U blih_user \
  -D "$ARCHIVE_DIR/$(date +%Y%m%d_%H%M%S)" \
  -F tar \
  -z \
  -P

echo "✅ Incremental backup complete"
```

---

## 2. Disaster Recovery

### 2.1 Recovery Point Objective (RPO) & Recovery Time Objective (RTO)

| Scenario                | RPO       | RTO     | Strategy                   |
| ----------------------- | --------- | ------- | -------------------------- |
| **Database Corruption** | 1 hour    | 2 hours | Restore from hourly backup |
| **Server Failure**      | 24 hours  | 4 hours | Restore to new server      |
| **Data Center Loss**    | 24 hours  | 8 hours | Restore from S3 backup     |
| **Accidental Deletion** | Real-time | 1 hour  | Transaction logs           |

### 2.2 PostgreSQL Recovery

**Full Database Restore:**

```bash
#!/bin/bash
# Restore PostgreSQL from backup

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
  echo "Usage: $0 <backup-file.sql.gz>"
  exit 1
fi

echo "🔄 Restoring PostgreSQL from $BACKUP_FILE"

# Stop dependent services
docker-compose stop api frontend

# Drop and recreate database
docker exec -it blih-postgres psql -U postgres -c "DROP DATABASE blih_prod;"
docker exec -it blih-postgres psql -U postgres -c "CREATE DATABASE blih_prod OWNER blih_user;"

# Restore from backup
gunzip -c "$BACKUP_FILE" | docker exec -i blih-postgres psql -U blih_user -d blih_prod

# Restart services
docker-compose start api frontend

echo "✅ PostgreSQL restore complete"
```

**Point-in-Time Recovery:**

```bash
# Restore to specific timestamp
docker exec blih-postgres pg_restore \
  -U blih_user \
  -d blih_prod \
  --target-time='2026-02-10 12:00:00' \
  /backups/postgres_20260210.backup
```

### 2.3 Qdrant Recovery

**`scripts/disaster-recovery.sh`:**

```bash
#!/bin/bash
set -e

BACKUP_DATE="$1"

if [ -z "$BACKUP_DATE" ]; then
  echo "Usage: $0 <YYYYMMDD_HHMMSS>"
  exit 1
fi

echo "🚨 DISASTER RECOVERY - Restoring from $BACKUP_DATE"

# 1. Stop all services
docker-compose down

# 2. Restore PostgreSQL
./scripts/restore-postgres.sh "/opt/blih/backups/postgres/postgres_${BACKUP_DATE}.sql.gz"

# 3. Restore Qdrant
tar -xzf "/opt/blih/backups/qdrant/qdrant_${BACKUP_DATE}.tar.gz" -C /
docker volume create qdrant_data
docker run --rm -v qdrant_data:/dest -v /qdrant/storage:/src alpine cp -r /src/. /dest/

# 5. Restore Redis
docker volume create redis_data
docker run --rm -v redis_data:/data -v "/opt/blih/backups/redis/redis_${BACKUP_DATE}.rdb":/dump.rdb \
  alpine cp /dump.rdb /data/

# 6. Restore MinIO
tar -xzf "/opt/blih/backups/minio/minio_${BACKUP_DATE}.tar.gz" -C /tmp/
docker volume create minio_data
docker run --rm -v minio_data:/data -v /tmp/minio_${BACKUP_DATE}:/src alpine cp -r /src/. /data/

# 7. Restore configurations
tar -xzf "/opt/blih/backups/configs/configs_${BACKUP_DATE}.tar.gz"

# 8. Start all services
docker-compose up -d

# 9. Verify system health
sleep 30
curl -f http://localhost:3000/api/health || { echo "Health check failed!"; exit 1; }

echo "✅ DISASTER RECOVERY COMPLETE"
```

---

## 3. Data Migration

### 3.1 Zero-Downtime Migration Strategy

```
┌─────────────────────────────────────────────────┐
│ Phase 1: Dual-Write (Old + New DB)             │
│ • Write to both databases                       │
│ • Read from old database                        │
│ Duration: 1 week                                │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│ Phase 2: Gradual Read Migration                │
│ • Write to both databases                       │
│ • Read from new database (10% → 100%)          │
│ Duration: 1 week                                │
└─────────────────────────────────────────────────┘
          ↓
┌─────────────────────────────────────────────────┐
│ Phase 3: New DB Only                            │
│ • Write to new database only                    │
│ • Read from new database                        │
│ • Keep old DB for rollback (1 month)           │
└─────────────────────────────────────────────────┘
```

### 3.2 Database Migration Script

```typescript
// Migration coordinator
export class DataMigrationService {
  async migrateEmployeeData() {
    const batchSize = 1000;
    let offset = 0;
    let totalMigrated = 0;

    while (true) {
      // Fetch batch from old database
      const employees = await this.oldDb.query(
        'SELECT * FROM employees_old LIMIT $1 OFFSET $2',
        [batchSize, offset],
      );

      if (employees.length === 0) break;

      // Transform data
      const transformed = employees.map(this.transformEmployee);

      // Write to new database
      await this.newDb.insertMany(transformed);

      // Verify migration
      await this.verifyBatch(transformed);

      totalMigrated += employees.length;
      offset += batchSize;

      console.log(`Migrated ${totalMigrated} employees`);
    }

    console.log(`✅ Migration complete: ${totalMigrated} records`);
  }

  private transformEmployee(old: OldEmployee): NewEmployee {
    return {
      id: old.employee_id,
      firstName: old.first_name,
      lastName: old.last_name,
      email: old.email_address,
      // ... map all fields
      migratedAt: new Date(),
    };
  }

  private async verifyBatch(records: NewEmployee[]) {
    for (const record of records) {
      const exists = await this.newDb.findOne({ id: record.id });
      if (!exists) {
        throw new Error(`Migration verification failed for ${record.id}`);
      }
    }
  }
}
```

---

## 4. Data Retention

### 4.1 Retention Policies

| Data Type             | Retention Period  | Archive After          | Delete After              |
| --------------------- | ----------------- | ---------------------- | ------------------------- |
| **Audit Logs**        | Indefinite        | 1 year                 | Never                     |
| **Employee Records**  | 7 years (legal)   | 2 years                | 7 years post-termination  |
| **Financial Records** | 7 years (tax law) | 1 year                 | 7 years                   |
| **CRM Data**          | Active + 5 years  | 2 years                | 5 years post-last-contact |
| **Session Data**      | 24 hours          | N/A                    | 24 hours                  |
| **Temporary Files**   | 7 days            | N/A                    | 7 days                    |
| **Backups**           | 30 days           | 30 days (cold storage) | 90 days                   |

### 4.2 Automated Data Archival

**`scripts/archive-old-data.sh`:**

```bash
#!/bin/bash
# Archive data older than retention period

ARCHIVE_DATE=$(date -d "2 years ago" +%Y-%m-%d)

echo "📦 Archiving data older than $ARCHIVE_DATE"

# Archive old employees
docker exec blih-postgres psql -U blih_user -d blih_prod << EOF
  -- Move to archive table
  INSERT INTO employees_archive
  SELECT * FROM employees
  WHERE status = 'TERMINATED'
    AND termination_date < '$ARCHIVE_DATE';

  -- Delete from active table
  DELETE FROM employees
  WHERE status = 'TERMINATED'
    AND termination_date < '$ARCHIVE_DATE';
EOF

# Archive PostgreSQL records
docker exec blih-postgres psql -U blih_user -d blih_prod -c "
  INSERT INTO audit_logs_archived
  SELECT * FROM audit_logs
  WHERE created_at < '$ARCHIVE_DATE'
    AND termination_date < '$ARCHIVE_DATE';

  DELETE FROM audit_logs
  WHERE created_at < '$ARCHIVE_DATE'
    AND termination_date < '$ARCHIVE_DATE';
EOF
    db.activities_archive.insert(doc);
    db.activities.remove({ _id: doc._id });
  });
"

echo "✅ Archival complete"
```

---

## 5. Database Maintenance

### 5.1 PostgreSQL Maintenance

**Weekly maintenance script:**

```bash
#!/bin/bash
# PostgreSQL maintenance tasks

echo "🔧 Running PostgreSQL maintenance..."

# Vacuum all databases
docker exec blih-postgres vacuumdb -U blih_user --all --analyze --verbose

# Reindex
docker exec blih-postgres reindexdb -U blih_user --all

# Update statistics
docker exec blih-postgres psql -U blih_user -d blih_prod -c "ANALYZE;"

# Check for bloat
docker exec blih-postgres psql -U blih_user -d blih_prod << EOF
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
  FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 10;
EOF

echo "✅ PostgreSQL maintenance complete"
```

---

## 6. Data Security

### 6.1 Encryption at Rest

```bash
# PostgreSQL encryption
docker run -v postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_PASSWORD_ENCRYPTED=true \
  postgres:16 -c ssl=on \
  -c ssl_cert_file=/etc/ssl/certs/server.crt \
  -c ssl_key_file=/etc/ssl/private/server.key
```

### 6.2 Data Masking for Development

```sql
-- Create masked view for development
CREATE OR REPLACE VIEW employees_masked AS
SELECT
  id,
  first_name,
  last_name,
  CONCAT(SUBSTRING(email, 1, 3), '***@***.com') AS email,
  '251-***-****' AS phone,
  department_id,
  position,
  status
FROM employees;

-- Grant access to dev users
GRANT SELECT ON employees_masked TO dev_users;
```

---

## 7. Performance Optimization

### 7.1 Index Optimization

```sql
-- Find missing indexes
SELECT
  schemaname,
  tablename,
  attname,
  n_distinct,
  correlation
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
  AND n_distinct > 100
  AND correlation < 0.1;

-- Create recommended indexes
CREATE INDEX CONCURRENTLY idx_employees_email ON employees(email);
CREATE INDEX CONCURRENTLY idx_employees_status_dept ON employees(status, department_id);
```

### 7.2 Query Optimization

```sql
-- Find slow queries
SELECT
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;
```

---

## 8. Audit & Compliance

### 8.1 Audit Log Retention

```typescript
// Immutable audit logs
export class AuditService {
  async log(event: AuditEvent): Promise<void> {
    const record = {
      ...event,
      timestamp: new Date(),
      signature: this.sign(event),
    };

    // Store in append-only log
    await this.auditRepo.insert(record);

    // Archive to cold storage after 1 year
    if (this.isOlderThan(record, 365)) {
      await this.archiveService.archive(record);
    }
  }
}
```

### 8.2 Compliance Reports

```sql
-- Generate GDPR compliance report
SELECT
  user_id,
  COUNT(*) as total_records,
  COUNT(CASE WHEN consent_given THEN 1 END) as consented,
  MAX(last_accessed) as last_access
FROM user_data_access_log
GROUP BY user_id;
```

---

## Quick Reference

### Backup Commands

```bash
# Full backup
./scripts/backup-all.sh

# Restore
./scripts/disaster-recovery.sh 20260210_020000

# Verify backups
find /opt/blih/backups -name "*.gz" -exec gzip -t {} \;
```

### Maintenance Schedule

```
Daily    (2 AM): Full backup
Hourly   (0:00): Incremental backup (WAL)
Weekly   (Sun): Database maintenance (VACUUM, REINDEX)
Monthly  (1st):  Archive old data
Quarterly:       Disaster recovery test
```

---

**Last Updated:** February 2026  
**Responsible:** Database Team
