# BLIH Monitoring & Observability Guide

**Version:** 1.0  
**Last Updated:** February 2026  
**For:** DevOps, SRE, Operations Teams

---

## Table of Contents

1. [Monitoring Strategy](#1-monitoring-strategy)
2. [Metrics Collection](#2-metrics-collection)
3. [Logging](#3-logging)
4. [Application Performance Monitoring](#4-application-performance-monitoring)
5. [Infrastructure Monitoring](#5-infrastructure-monitoring)
6. [Alerting](#6-alerting)
7. [Dashboards](#7-dashboards)
8. [Distributed Tracing](#8-distributed-tracing)
9. [Health Checks](#9-health-checks)
10. [SLIs, SLOs & SLAs](#10-slis-slos--slas)

---

## 1. Monitoring Strategy

### 1.1 The Four Golden Signals

```
┌─────────────────────────────────────────────────────┐
│  1. LATENCY                                         │
│  How long does it take to service a request?       │
│  Target: p95 < 500ms, p99 < 1000ms                 │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  2. TRAFFIC                                         │
│  How much demand is being placed on your system?   │
│  Target: Track req/sec, Monitor trends             │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  3. ERRORS                                          │
│  What is the rate of requests that fail?           │
│  Target: Error rate < 0.1%                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  4. SATURATION                                      │
│  How full is your service?                         │
│  Target: CPU < 70%, Memory < 80%, Disk < 80%       │
└─────────────────────────────────────────────────────┘
```

### 1.2 Observability Pillars

| Pillar | Tool | Purpose |
|--------|------|---------|
| **Metrics** | Prometheus + Grafana | Time-series data, dashboards |
| **Logs** | Loki / ELK Stack | Debug, audit, troubleshoot |
| **Traces** | Jaeger / Tempo | Request flow, bottlenecks |

---

## 2. Metrics Collection

### 2.1 Prometheus Setup

**`prometheus.yml`:**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  # BLIH API
  - job_name: 'blih-api'
    static_configs:
      - targets: ['api:3000']
    metrics_path: '/metrics'

  # Frontend
  - job_name: 'blih-frontend'
    static_configs:
      - targets: ['frontend:3001']

  # PostgreSQL
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # MongoDB
  - job_name: 'mongodb'
    static_configs:
      - targets: ['mongodb-exporter:9216']

  # Redis
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # RabbitMQ
  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq:15692']

  # Node Exporter (System metrics)
  - job_name: 'node'
    static_configs:
      - targets: ['node-exporter:9100']
```

### 2.2 Application Metrics (NestJS)

```typescript
// metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private registry: Registry;
  
  // HTTP Metrics
  public httpRequestsTotal: Counter;
  public httpRequestDuration: Histogram;
  
  // Business Metrics
  public employeesCreated: Counter;
  public dealsCreated: Counter;
  public invoicesGenerated: Counter;
  
  //System Metrics
  public activeUsers: Gauge;
  public queueSize: Gauge;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics() {
    // HTTP Request Counter
    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    // HTTP Request Duration
    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.5, 1, 2, 5],
      registers: [this.registry],
    });

    // Business Metrics
    this.employeesCreated = new Counter({
      name: 'blih_employees_created_total',
      help: 'Total employees created',
      registers: [this.registry],
    });

    this.dealsCreated = new Counter({
      name: 'blih_deals_created_total',
      help: 'Total deals created',
      labelNames: ['status'],
      registers: [this.registry],
    });

    // System Metrics
    this.activeUsers = new Gauge({
      name: 'blih_active_users',
      help: 'Number of currently active users',
      registers: [this.registry],
    });

    this.queueSize = new Gauge({
      name: 'blih_queue_size',
      help: 'Number of messages in queue',
      labelNames: ['queue_name'],
      registers: [this.registry],
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}

// metrics.controller.ts
@Controller()
export class MetricsController {
  constructor(private metricsService: MetricsService) {}

  @Get('/metrics')
  async getMetrics(): Promise<string> {
    return this.metricsService.getMetrics();
  }
}

// Metrics Middleware
@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      
      this.metrics.httpRequestsTotal.inc({
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode,
      });

      this.metrics.httpRequestDuration.observe(
        {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: res.statusCode,
        },
        duration
      );
    });

    next();
  }
}
```

### 2.3 Key Metrics to Track

#### Application Metrics
```typescript
// Track in services
async createEmployee(dto: CreateEmployeeDto) {
  const employee = await this.repository.save(dto);
  this.metrics.employeesCreated.inc();
  return employee;
}

async findAll(query: QueryDto) {
  const start = Date.now();
  const result = await this.repository.find(query);
  const duration = (Date.now() - start) / 1000;
  
  this.metrics.dbQueryDuration.observe({ operation: 'find_all' }, duration);
  return result;
}
```

#### Custom Business Metrics
- `blih_deals_created_total{status="won|lost|open"}`
- `blih_invoices_generated_total{type="sales|purchase"}`
- `blih_payroll_processed_total{status="success|failed"}`
- `blih_documents_uploaded_total{module="hr|crm|projects"}`

---

## 3. Logging

### 3.1 Structured Logging

```typescript
// logger.service.ts
import { Logger as WinstonLogger, createLogger, format, transports } from 'winston';

export class LoggerService {
  private logger: WinstonLogger;

  constructor(context: string) {
    this.logger = createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
      ),
      defaultMeta: {
        service: 'blih-api',
        context,
        environment: process.env.NODE_ENV,
        company_id: 'BLIH',
      },
      transports: [
        // Console
        new transports.Console({
          format: format.combine(
            format.colorize(),
            format.simple()
          ),
        }),
        // File - All logs
        new transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        // File - Errors only
        new transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5,
        }),
      ],
    });
  }

  log(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, trace?: string, meta?: any) {
    this.logger.error(message, { trace, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}

// Usage
export class EmployeeService {
  private logger = new LoggerService(EmployeeService.name);

  async create(dto: CreateEmployeeDto, user: User) {
    this.logger.log('Creating employee', {
      action: 'employee_create',
      userId: user.id,
      email: dto.email,
    });

    try {
      const employee = await this.repository.save(dto);
      
      this.logger.log('Employee created successfully', {
        action: 'employee_created',
        employeeId: employee.id,
        userId: user.id,
      });

      return employee;
    } catch (error) {
      this.logger.error('Failed to create employee', error.stack, {
        action: 'employee_create_failed',
        userId: user.id,
        email: dto.email,
        error: error.message,
      });
      throw error;
    }
  }
}
```

### 3.2 Log Levels

| Level | When to Use | Example |
|-------|-------------|---------|
| **ERROR** | Application errors, exceptions | Database connection failed |
| **WARN** | Warning conditions | Deprecated API usage |
| **INFO** | Important events | User logged in, Order created |
| **DEBUG** | Detailed debug info | Variable values, flow control |
| **TRACE** | Very detailed | Function entry/exit |

### 3.3 Loki Configuration

**`docker-compose.yml` addition:**

```yaml
services:
  loki:
    image: grafana/loki:latest
    container_name: blih-loki
    ports:
      - "3100:3100"
    volumes:
      - loki_data:/loki
      - ./loki/loki-config.yml:/etc/loki/local-config.yaml
    command: -config.file=/etc/loki/local-config.yaml
    networks:
      - blih-network

  promtail:
    image: grafana/promtail:latest
    container_name: blih-promtail
    volumes:
      - ./logs:/var/log
      - ./loki/promtail-config.yml:/etc/promtail/config.yml
    command: -config.file=/etc/promtail/config.yml
    networks:
      - blih-network

volumes:
  loki_data:
```

---

## 4. Application Performance Monitoring

### 4.1 Grafana Dashboards

**API Performance Dashboard:**

```json
{
  "dashboard": {
    "title": "BLIH API Performance",
    "panels": [
      {
        "title": "Request Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])"
          }
        ]
      },
      {
        "title": "Response Time (p95)",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, http_request_duration_seconds_bucket)"
          }
        ]
      },
      {
        "title": "Error Rate",
        "targets": [
          {
            "expr": "rate(http_requests_total{status_code=~\"5..\"}[5m])"
          }
        ]
      },
      {
        "title": "Active Users",
        "targets": [
          {
            "expr": "blih_active_users"
          }
        ]
      }
    ]
  }
}
```

### 4.2 Key Dashboards

1. **API Overview**
   - Request rate
   - Response times (p50, p95, p99)
   - Error rates
   - Active connections

2. **Business Metrics**
   - Employees created (daily/weekly)
   - Deals won vs lost
   - Invoice generation rate
   - User activity by module

3. **Database Performance**
   - Query duration
   - Connection pool usage
   - Slow queries (>1s)
   - Transaction rate

4. **Infrastructure**
   - CPU usage by container
   - Memory usage by container
   - Disk I/O
   - Network traffic

---

## 5. Infrastructure Monitoring

### 5.1 Docker Container Monitoring

```yaml
# Add cAdvisor to docker-compose.yml
services:
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: blih-cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
    networks:
      - blih-network
```

### 5.2 Node Exporter (System Metrics)

```yaml
services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: blih-node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - blih-network
```

---

## 6. Alerting

### 6.1 Prometheus Alert Rules

**`alerts.yml`:**

```yaml
groups:
  - name: blih_api_alerts
    interval: 30s
    rules:
      # High Error Rate
      - alert: HighErrorRate
        expr: rate(http_requests_total{status_code=~"5.."}[5m]) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} requests/sec"

      # High Response Time
      - alert: HighResponseTime
        expr: histogram_quantile(0.95, http_request_duration_seconds_bucket) > 2
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High response time"
          description: "p95 latency is {{ $value }}s"

      # Service Down
      - alert: ServiceDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Service {{ $labels.job }} is down"
          description: "Service has been down for 2 minutes"

  - name: blih_database_alerts
    rules:
      # High Database Connections
      - alert: HighDatabaseConnections
        expr: pg_stat_database_numbackends > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High number of database connections"
          description: "{{ $value }} active connections"

      # Slow Queries
      - alert: SlowQueries
        expr: rate(pg_stat_statements_mean_time_seconds[5m]) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Slow database queries detected"

  - name: blih_infrastructure_alerts
    rules:
      # High CPU Usage
      - alert: HighCPUUsage
        expr: (100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%"

      # High Memory Usage
      - alert: HighMemoryUsage
        expr: (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes) * 100 < 20
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Low memory available"
          description: "Only {{ $value }}% memory available"

      # Disk Space Low
      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 20
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Only {{ $value }}% disk space available"
```

### 6.2 Alertmanager Configuration

**`alertmanager.yml`:**

```yaml
global:
  resolve_timeout: 5m
  slack_api_url: 'YOUR_SLACK_WEBHOOK_URL'

route:
  group_by: ['alertname', 'cluster']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 12h
  receiver: 'slack-notifications'
  
  routes:
    - match:
        severity: critical
      receiver: 'slack-critical'
      continue: true
    
    - match:
        severity: warning
      receiver: 'slack-warnings'

receivers:
  - name: 'slack-notifications'
    slack_configs:
      - channel: '#blih-alerts'
        title: '{{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'

  - name: 'slack-critical'
    slack_configs:
      - channel: '#blih-critical'
        title: '🚨 CRITICAL: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
        send_resolved: true

  - name: 'slack-warnings'
    slack_configs:
      - channel: '#blih-warnings'
        title: '⚠️ WARNING: {{ .GroupLabels.alertname }}'
        text: '{{ range .Alerts }}{{ .Annotations.description }}{{ end }}'
```

---

## 7. Dashboards

### 7.1 Main Dashboard Widgets

**System Overview:**
- Total API requests (24h)
- Average response time
- Error rate
- Active users
- System uptime

**Business Metrics:**
- New employees (today/week/month)
- Active deals
- Invoices generated
- Revenue (current month)

**Resource Usage:**
- CPU usage (%)
- Memory usage (%)
- Disk usage (%)
- Network I/O

### 7.2 Grafana Dashboard Import

```bash
# Import pre-built dashboards
# Node Exporter Dashboard: 1860
# Docker Dashboard: 893
# PostgreSQL Dashboard: 9628
# MongoDB Dashboard: 2583
```

---

## 8. Distributed Tracing

### 8.1 Jaeger Setup

```yaml
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    container_name: blih-jaeger
    environment:
      COLLECTOR_ZIPKIN_HOST_PORT: :9411
    ports:
      - "5775:5775/udp"
      - "6831:6831/udp"
      - "6832:6832/udp"
      - "5778:5778"
      - "16686:16686"  # Jaeger UI
      - "14268:14268"
      - "14250:14250"
      - "9411:9411"
    networks:
      - blih-network
```

### 8.2 OpenTelemetry Integration

```typescript
// tracing.ts
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const jaegerExporter = new JaegerExporter({
  endpoint: 'http://jaeger:14268/api/traces',
});

const sdk = new NodeSDK({
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

---

## 9. Health Checks

### 9.1 Comprehensive Health Endpoint

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private rabbitmq: RabbitMQHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
      () => this.redis.check('redis'),
      () => this.rabbitmq.check('rabbitmq'),
      () => this.diskCheck(),
      () => this.memoryCheck(),
    ]);
  }

  private async diskCheck(): Promise<HealthIndicatorResult> {
    const diskUsage = await checkDiskSpace('/');
    const percentUsed = ((diskUsage.size - diskUsage.free) / diskUsage.size) * 100;
    
    return {
      disk: {
        status: percentUsed < 90 ? 'up' : 'down',
        percentUsed,
      },
    };
  }

  private async memoryCheck(): Promise<HealthIndicatorResult> {
    const usage = process.memoryUsage();
    const percentUsed = (usage.heapUsed / usage.heapTotal) * 100;
    
    return {
      memory: {
        status: percentUsed < 90 ? 'up' : 'down',
        percentUsed,
      },
    };
  }
}
```

---

## 10. SLIs, SLOs & SLAs

### 10.1 Service Level Indicators (SLIs)

| SL I | Measurement | Target |
|------|-------------|--------|
| **Availability** | Uptime % | 99.9% |
| **Latency** | p95 response time | <500ms |
| **Error Rate** | Failed requests % | <0.1% |
| **Throughput** | Requests/second | >100 |

### 10.2 Service Level Objectives (SLOs)

```yaml
slos:
  - name: api_availability
    target: 99.9%
    window: 30d
    description: "API should be available 99.9% of the time"

  - name: api_latency_p95
    target: 500ms
    window: 7d
    description: "95% of requests should complete in under 500ms"

  - name: error_rate
    target: 0.1%
    window: 24h
    description: "Error rate should be below 0.1%"
```

### 10.3 Error Budget

```
Error Budget = (100% - SLO) × Total Requests
Example: (100% - 99.9%) × 1,000,000 requests = 1,000 allowed errors
```

---

## Quick Reference

### Essential Metrics

```bash
# Check metrics endpoint
curl http://localhost:3000/metrics

# Key metrics to monitor
http_requests_total
http_request_duration_seconds
blih_active_users
blih_employees_created_total
```

### Health Checks

```bash
# API health
curl http://localhost:3000/api/health

# Prometheus
curl http://localhost:9090/-/healthy

# Grafana
curl http://localhost:3000/api/health
```

### Dashboard URLs

- **Grafana**: http://localhost:3000
- **Prometheus**: http://localhost:9090
- **Jaeger**: http://localhost:16686
- **cAdvisor**: http://localhost:8080

---

**Last Updated:** February 2026  
**Maintained by:** DevOps Team
