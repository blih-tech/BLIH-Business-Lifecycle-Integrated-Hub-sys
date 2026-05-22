# BLIH Troubleshooting Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** Developers, DevOps, Support Teams

---

## Table of Contents

1. [General Troubleshooting Approach](#1-general-troubleshooting-approach)
2. [Application Issues](#2-application-issues)
3. [Database Issues](#3-database-issues)
4. [Performance Issues](#4-performance-issues)
5. [Network & Connectivity](#5-network--connectivity)
6. [Docker & Container Issues](#6-docker--container-issues)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Deployment Issues](#8-deployment-issues)
9. [Data Integrity Issues](#9-data-integrity-issues)
10. [Common Error Messages](#10-common-error-messages)

---

## 1. General Troubleshooting Approach

### 1.1 The Five Whys Method

```
1. What is the problem?
2. When did it start?
3. What changed recently?
4. Can you reproduce it?
5. What do the logs say?
```

### 1.2 Troubleshooting Checklist

- [ ] Check service status (`docker ps`)
- [ ] Review logs (`docker-compose logs -f [service]`)
- [ ] Check health endpoints
- [ ] Verify environment variables
- [ ] Check resource usage (CPU, memory, disk)
- [ ] Review recent deployments/changes
- [ ] Check network connectivity
- [ ] Verify database connections

---

## 2. Application Issues

### 2.1 Application Won't Start

**Symptoms:**

- Container exits immediately
- "Application failed to start" error

**Diagnosis:**

```bash
# Check logs
docker-compose logs api

# Check container status
docker ps -a | grep blih-api

# Inspect container
docker inspect blih-api
```

**Common Causes & Solutions:**

#### Missing Environment Variables

```bash
# Check if .env file exists
ls -la .env

# Verify required variables
grep -E "POSTGRES_|MONGODB_|JWT_" .env

# Solution: Copy from example
cp .env.example .env
nano .env
```

#### Port Already in Use

```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
lsof -ti:3000 | xargs kill -9

# OR change port in .env
echo "API_PORT=3001" >> .env
```

#### Database Connection Failed

```bash
# Check if database is running
docker ps | grep postgres

# Test connection
docker exec -it blih-postgres psql -U blih_user -d blih_prod

# Solution: Restart database
docker-compose restart postgres
```

### 2.2 API Returns HTTP 500

**Symptoms:**

- Internal Server Error
- Stack traces in logs

**Diagnosis:**

```bash
# Check error logs
docker-compose logs api | grep ERROR

# Check database connectivity
docker-compose exec api npm run db:ping

# Check recent changes
git log --oneline -10
```

**Solutions:**

#### Uncaught Exception

```typescript
// Add global exception filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    logger.error('Uncaught exception', exception);

    response.status(500).json({
      statusCode: 500,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
```

#### Database Query Error

```bash
# Check database health
docker-compose exec postgres pg_isready

# Check connection pool
docker-compose exec api npm run db:pool:status

# Restart API
docker-compose restart api
```

### 2.3 Slow Response Times

**Diagnosis:**

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/health

# curl-format.txt content:
# time_total: %{time_total}s

# Monitor logs for slow queries
docker-compose logs api | grep "Query took"

# Check system resources
docker stats
```

**Solutions:**

- Add database indexes
- Implement caching (Redis)
- Optimize N+1 queries
- Enable connection pooling

---

## 3. Database Issues

### 3.1 PostgreSQL Connection Refused

**Error:**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Diagnosis:**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check PostgreSQL logs
docker-compose logs postgres

# Test connection from host
psql -h localhost -U blih_user -d blih_prod
```

**Solutions:**

```bash
# Option 1: Restart PostgreSQL
docker-compose restart postgres

# Option 2: Check port mapping
docker port blih-postgres

# Option 3: Recreate container
docker stop blih-postgres
docker rm blih-postgres
docker-compose up -d postgres
```

### 3.2 Too Many Database Connections

**Error:**

```
ERROR:  sorry, too many clients already
```

**Diagnosis:**

```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Check max connections
SHOW max_connections;

-- Find idle connections
SELECT * FROM pg_stat_activity WHERE state = 'idle';
```

**Solutions:**

```sql
-- Terminate idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
  AND state_change < NOW() - INTERVAL '10 minutes';

-- Increase max_connections (postgresql.conf)
max_connections = 200
```

```typescript
// Optimize connection pool
{
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  poolSize: 20,  // Reduce if too high
  connectionTimeoutMillis: 5000,
}
```

### 3.3 MongoDB Replica Set Issues

**Symptoms:**

- "Not master" errors
- Connection timeouts

**Diagnosis:**

```bash
# Check replica set status
docker exec -it blih-mongodb mongosh --eval "rs.status()"

# Check primary
docker exec -it blih-mongodb mongosh --eval "rs.isMaster()"
```

**Solutions:**

```bash
# Initialize replica set
docker exec -it blih-mongodb mongosh --eval "rs.initiate()"

# Force reconfiguration
docker exec -it blih-mongodb mongosh --eval '''
rs.reconfig({
  _id: "rs0",
  members: [{ _id: 0, host: "mongodb:27017" }]
}, { force: true })
'''
```

---

## 4. Performance Issues

### 4.1 High CPU Usage

**Diagnosis:**

```bash
# Check CPU usage by container
docker stats --no-stream

# Check processes inside container
docker exec -it blih-api ps aux | sort -nrk 3 | head

# Profile Node.js application
docker exec -it blih-api node --prof app.js
```

**Solutions:**

#### Infinite Loop

```typescript
// Add timeout to long operations
async function processRecords(records) {
  const timeout = setTimeout(() => {
    throw new Error('Processing timeout after 30s');
  }, 30000);

  try {
    await doProcessing(records);
  } finally {
    clearTimeout(timeout);
  }
}
```

#### N+1 Queries

```typescript
// ❌ Bad: N+1 queries
const employees = await employeeRepo.find();
for (const emp of employees) {
  emp.department = await departmentRepo.findOne(emp.departmentId);
}

// ✅ Good: Single query with join
const employees = await employeeRepo.find({
  relations: ['department'],
});
```

### 4.2 High Memory Usage

**Diagnosis:**

```bash
# Check memory usage
docker stats --no-stream | grep blih

# Check Node.js heap usage
docker exec -it blih-api node -e "console.log(process.memoryUsage())"

# Check for memory leaks
docker exec -it blih-api npm run heap:snapshot
```

**Solutions:**

```typescript
// Implement pagination
async function getEmployees(page: number, limit: number) {
  return await repository.find({
    skip: (page - 1) * limit,
    take: limit,
  });
}

// Stream large datasets
async function exportLargeDataset() {
  const stream = await repository.createQueryBuilder().stream();

  stream.on('data', (row) => {
    // Process row
  });
}

// Clear cache periodically
setInterval(() => {
  cache.clear();
}, 3600000); // Every hour
```

### 4.3 Disk Space Full

**Error:**

```
ENOSPC: no space left on device
```

**Diagnosis:**

```bash
# Check disk usage
df -h

# Find large files
du -sh /* | sort -rh | head -10

# Check Docker disk usage
docker system df
```

**Solutions:**

```bash
# Clean Docker resources
docker system prune -a --volumes

# Clean logs
find /var/log -type f -name "*.log" -mtime +30 -delete

# Rotate logs
logrotate -f /etc/logrotate.conf

# Increase disk space or mount additional volume
```

---

## 5. Network & Connectivity

### 5.1 Cannot Connect to API

**Symptoms:**

- "Connection refused" errors
- Timeout errors

**Diagnosis:**

```bash
# Check if API is listening
netstat -tlnp | grep 3000

# Test from localhost
curl http://localhost:3000/api/health

# Test from network
curl http://YOUR_SERVER_IP:3000/api/health

# Check firewall
sudo ufw status
```

**Solutions:**

```bash
# Open firewall port
sudo ufw allow 3000/tcp

# Check nginx reverse proxy
sudo nginx -t
sudo systemctl restart nginx

# Verify Docker network
docker network inspect blih-network
```

### 5.2 CORS Errors

**Error in Browser:**

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solutions:**

```typescript
// app.module.ts - Enable CORS
app.enableCors({
  origin: ['http://localhost:3001', 'https://blih.yourcompany.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

```nginx
# nginx.conf - Add CORS headers
add_header Access-Control-Allow-Origin https://blih.yourcompany.com always;
add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS" always;
add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
```

### 5.3 Slow Network Requests

**Diagnosis:**

```bash
# Test network speed
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/employees

# Check DNS resolution
time nslookup api.blih.yourcompany.com

# Check network latency
ping api.blih.yourcompany.com
```

**Solutions:**

- Use CDN for static assets
- Enable gzip compression
- Implement HTTP/2
- Add caching headers

---

## 6. Docker & Container Issues

### 6.1 Container Keeps Restarting

**Diagnosis:**

```bash
# Check restart count
docker ps -a | grep blih

# View last 100 log lines
docker logs --tail 100 blih-api

# Check exit code
docker inspect blih-api --format='{{.State.ExitCode}}'
```

**Common Exit Codes:**

- `0`: Normal exit
- `1`: Application error
- `137`: Out of memory (OOM killed)
- `139`: Segmentation fault
- `143`: Container stopped (SIGTERM)

**Solutions:**

```bash
# Increase memory limit
docker run -m 2g blih-api

# In docker-compose.yml
services:
  api:
    deploy:
      resources:
        limits:
          memory: 2G
```

### 6.2 Cannot Remove Container

**Error:**

```
Error response from daemon: removal of container is already in progress
```

**Solutions:**

```bash
# Force remove
docker rm -f blih-api

# Stop and remove
docker stop blih-api && docker rm blih-api

# If still stuck, restart Docker daemon
sudo systemctl restart docker
```

### 6.3 Image Build Fails

**Diagnosis:**

```bash
# Build with verbose output
docker build --no-cache --progress=plain -t blih-api .

# Check for syntax errors in Dockerfile
docker build -f Dockerfile .
```

**Common Issues:**

```dockerfile
# Issue: Cache invalidation
# Solution: Order commands by change frequency
FROM node:20-alpine

# Least frequently changed first
COPY package*.json ./
RUN npm ci

# Most frequently changed last
COPY . ./
RUN npm run build
```

---

## 7. Authentication & Authorization

### 7.1 "Unauthorized" (HTTP 401)

**Diagnosis:**

```bash
# Check JWT token
jwt_decode YOUR_TOKEN

# Verify token signature
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/health

# Check Keycloak
curl http://localhost:8080/auth/realms/blih
```

**Solutions:**

```typescript
// Verify JWT secret matches
if (process.env.JWT_SECRET !== expectedSecret) {
  throw new Error('JWT secret mismatch');
}

// Check token expiration
const decoded = jwt.verify(token, secret);
if (decoded.exp < Date.now() / 1000) {
  throw new UnauthorizedException('Token expired');
}
```

### 7.2 "Forbidden" (HTTP 403)

**Diagnosis:**

```typescript
// Log permission check
@Injectable()
export class PermissionGuard {
  canActivate(context: ExecutionContext): boolean {
    const required = this.getRequiredPermissions(context);
    const user = context.switchToHttp().getRequest().user;

    console.log('Required:', required);
    console.log('User permissions:', user.permissions);

    return this.hasPermission(user, required);
  }
}
```

**Solutions:**

```typescript
// Check RBAC configuration
const userRoles = await this.getUserRoles(userId);
const hasPermission = userRoles.some((role) =>
  role.permissions.includes('HR:employee:read:all'),
);
```

---

## 8. Deployment Issues

### 8.1 CI/CD Pipeline Fails

**Common Failures:**

#### Test Failures

```bash
# Run tests locally
npm run test:ci

# Check coverage
npm run test:cov

# Fix failing tests
npm run test -- --u  # Update snapshots
```

#### Build Failures

```bash
# Check TypeScript errors
npm run type-check

# Fix linting errors
npm run lint:fix

# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### 8.2 Deployment Rollback

**Symptoms:**

- New version has critical bugs
- Need to revert to previous version

**Solutions:**

```bash
# Quick rollback with Docker
docker tag blih-api:latest blih-api:rollback
docker tag blih-api:previous blih-api:latest
docker-compose up -d api

# Git-based rollback
git revert HEAD
git push origin main

# Manual rollback
docker-compose pull
docker-compose up -d --force-recreate
```

---

## 9. Data Integrity Issues

### 9.1 Database Migration Fails

**Error:**

```
Migration "CreateEmployeeTable" has already been run
```

**Solutions:**

```bash
# Revert last migration
npm run migration:revert

# Drop migration table (WARNING: Only for development)
docker exec -it blih-postgres psql -U blih_user -d blih_prod \
  -c "DROP TABLE migrations;"

# Re-run migrations
npm run migration:run
```

### 9.2 Data Inconsistency

**Symptoms:**

- Data doesn't match between DBs
- Ghost records
- Orphaned references

**Diagnosis:**

```sql
-- Find orphaned records
SELECT e.* FROM employees e
LEFT JOIN departments d ON e.department_id = d.id
WHERE d.id IS NULL;

-- Find duplicates
SELECT email, COUNT(*)
FROM employees
GROUP BY email
HAVING COUNT(*) > 1;
```

**Solutions:**

```sql
-- Clean orphaned records
DELETE FROM employees
WHERE department_id NOT IN (SELECT id FROM departments);

-- Remove duplicates (keep oldest)
DELETE FROM employees
WHERE id NOT IN (
  SELECT MIN (id)
  FROM employees
  GROUP BY email
);
```

---

## 10. Common Error Messages

### 10.1 Error Reference Table

| Error Message      | Meaning               | Solution                         |
| ------------------ | --------------------- | -------------------------------- |
| `ECONNREFUSED`     | Service not running   | Start the service                |
| `EADDRINUSE`       | Port already in use   | Change port or kill process      |
| `ENOTFOUND`        | DNS resolution failed | Check hostname/DNS               |
| `ETIMEDOUT`        | Connection timeout    | Check firewall/network           |
| `ENOSPC`           | No disk space         | Free up space                    |
| `ENOMEM`           | Out of memory         | Increase memory limit            |
| `EPERM`            | Permission denied     | Check file/directory permissions |
| `MODULE_NOT_FOUND` | Missing dependency    | Run `npm install`                |

### 10.2 PostgreSQL Errors

| Code    | Error                       | Solution                        |
| ------- | --------------------------- | ------------------------------- |
| `23505` | Unique constraint violation | Check for duplicates            |
| `23503` | Foreign key violation       | Verify referenced record exists |
| `42P01` | Table doesn't exist         | Run migrations                  |
| `42703` | Column doesn't exist        | Update schema/migration         |
| `53300` | Too many connections        | Increase max_connections        |

### 10.3 MongoDB Errors

| Code    | Error                 | Solution                       |
| ------- | --------------------- | ------------------------------ |
| `11000` | Duplicate key error   | Unique index violation         |
| `10107` | Not master            | Replica set issue              |
| `16500` | Exceeded memory limit | Add index or reduce query size |

---

## Quick Diagnostic Commands

```bash
# System Health
docker ps
docker stats
df -h
free -h

# Logs
docker-compose logs -f --tail=100
tail -f /var/log/syslog

# Network
netstat -tlnp
ss -tulpn
curl -v http://localhost:3000/api/health

# Database
docker exec -it blih-postgres psql -U blih_user -d blih_prod
docker exec -it blih-mongodb mongosh

# Process Management
lsof -ti:3000
ps aux | grep node

# Cleanup
docker system prune -a
npm cache clean --force
```

---

**Last Updated:** February 2026  
**Need More Help?** Contact: support@yourcompany.com
