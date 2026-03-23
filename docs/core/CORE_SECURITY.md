# BLIH Core Security Documentation

**Version:** 1.0  
**Last Updated:** February 2026  
**Classification:** Internal - Security Sensitive

---

## Table of Contents

1. [Security Architecture](#1-security-architecture)
2. [Authentication & Authorization](#2-authentication--authorization)
3. [Data Protection](#3-data-protection)
4. [Network Security](#4-network-security)
5. [API Security](#5-api-security)
6. [Application Security](#6-application-security)
7. [Infrastructure Security](#7-infrastructure-security)
8. [Compliance & Standards](#8-compliance--standards)
9. [Security Monitoring](#9-security-monitoring)
10. [Incident Response](#10-incident-response)
11. [Security Best Practices](#11-security-best-practices)
12. [Security Checklist](#12-security-checklist)

---

## 1. Security Architecture

### 1.1 Defense in Depth Strategy

BLIH implements a **layered security approach** with multiple defensive layers:

```
┌─────────────────────────────────────────────────────────────┐
│ Layer 7: Security Monitoring & Audit                        │
│ • Real-time alerting                                        │
│ • Immutable audit logs                                      │
│ • SIEM integration                                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 6: Application Security                               │
│ • Input validation                                          │
│ • Output encoding                                           │
│ • CSRF protection                                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 5: Authentication & Authorization                     │
│ • Keycloak SSO                                              │
│ • MFA enforcement                                           │
│ • RBAC with fine-grained permissions                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 4: API Security                                        │
│ • JWT validation                                            │
│ • Rate limiting                                             │
│ • API gateway filtering                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 3: Data Protection                                     │
│ • Encryption at rest (AES-256)                              │
│ • Encryption in transit (TLS 1.3)                           │
│ • Database encryption                                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 2: Network Security                                    │
│ • Firewall rules                                            │
│ • Network segmentation                                      │
│ • VPC isolation                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ Layer 1: Infrastructure Security                            │
│ • OS hardening                                              │
│ • Container security                                        │
│ • Secrets management                                        │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Security Principles

| Principle                | Implementation                                      |
| ------------------------ | --------------------------------------------------- |
| **Least Privilege**      | Users/services granted minimum required permissions |
| **Separation of Duties** | Critical actions require multiple approvals         |
| **Fail Secure**          | System fails to secure state, not open state        |
| **Zero Trust**           | Verify all requests, regardless of source           |
| **Security by Design**   | Security integrated from architecture phase         |
| **Defense in Depth**     | Multiple layers of security controls                |

---

## 2. Authentication & Authorization

### 2.1 Keycloak Integration

**Configuration:**

```yaml
# Keycloak Realm Configuration
realm: blih
clients:
  - clientId: blih-api
    protocol: openid-connect
    publicClient: false
    standardFlowEnabled: true
    directAccessGrantsEnabled: false
    serviceAccountsEnabled: true

# Security Settings
sslRequired: external
bruteForceProtection: enabled
permanentLockout: false
maxFailureWaitSeconds: 900
minimumQuickLoginWaitSeconds: 60
```

### 2.2 Multi-Factor Authentication (MFA)

**Enforcement Policy:**

```typescript
// MFA Required for:
const MFA_REQUIRED_ROLES = [
  'ADMIN',
  'FINANCE_MANAGER',
  'HR_MANAGER',
  'SYSTEM_ADMIN',
];

// MFA Methods Supported:
enum MFAMethod {
  TOTP = 'TOTP', // Time-based OTP (Google Authenticator)
  SMS = 'SMS', // SMS verification
  EMAIL = 'EMAIL', // Email verification
  WEBAUTHN = 'WEBAUTHN', // Hardware security keys
}
```

**Implementation:**

```typescript
class MFAService {
  async enforceMFA(user: User): Promise<boolean> {
    // Check if user role requires MFA
    if (this.requiresMFA(user.roles)) {
      if (!user.mfaEnabled) {
        throw new MFARequiredError('MFA must be enabled for this role');
      }

      // Validate MFA token
      return await this.validateMFAToken(user, token);
    }
    return true;
  }

  private requiresMFA(roles: string[]): boolean {
    return roles.some((role) => MFA_REQUIRED_ROLES.includes(role));
  }
}
```

### 2.3 JWT Security

**Token Configuration:**

```typescript
// JWT Settings
const JWT_CONFIG = {
  algorithm: 'RS256', // Asymmetric encryption
  accessTokenExpiry: '15m', // Short-lived access tokens
  refreshTokenExpiry: '7d', // Longer refresh tokens
  issuer: 'blih-api',
  audience: 'blih-frontend',

  // Security headers
  headers: {
    typ: 'JWT',
    alg: 'RS256',
  },
};

// Token Rotation Strategy
async function rotateToken(refreshToken: string): Promise<TokenPair> {
  // Validate refresh token
  const decoded = await verifyRefreshToken(refreshToken);

  // Check token family for replay detection
  await validateTokenFamily(decoded.jti);

  // Issue new token pair
  const newTokens = await issueTokenPair(decoded.userId);

  // Invalidate old refresh token
  await revokeRefreshToken(refreshToken);

  return newTokens;
}
```

### 2.4 Role-Based Access Control (RBAC)

**Permission Structure:**

```typescript
// Permission Format: module:resource:action:scope
type Permission = string; // e.g., "HR:employee:read:own"

interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  inherits?: string[]; // Role hierarchy
}

// Example Roles
const ROLES: Role[] = [
  {
    id: 'employee',
    name: 'Employee',
    permissions: [
      'HR:employee:read:own',
      'HR:leave:create:own',
      'HR:attendance:read:own',
    ],
  },
  {
    id: 'hr_manager',
    name: 'HR Manager',
    inherits: ['employee'],
    permissions: [
      'HR:employee:*:department', // All actions, department scope
      'HR:recruitment:*:all',
      'HR:payroll:read:department',
    ],
  },
  {
    id: 'admin',
    name: 'System Administrator',
    permissions: [
      '*:*:*:*', // All permissions
    ],
  },
];
```

**Permission Check Implementation:**

```typescript
class PermissionService {
  async checkPermission(
    user: User,
    resource: string,
    action: string,
    scope: string,
  ): Promise<boolean> {
    const userPermissions = await this.getUserPermissions(user);

    // Check exact match
    if (userPermissions.includes(`${resource}:${action}:${scope}`)) {
      return true;
    }

    // Check wildcard permissions
    if (this.matchesWildcard(userPermissions, resource, action, scope)) {
      return true;
    }

    // Log unauthorized attempt
    await this.auditService.logUnauthorizedAccess({
      userId: user.id,
      resource,
      action,
      scope,
      timestamp: new Date(),
    });

    return false;
  }
}
```

---

## 3. Data Protection

### 3.1 Encryption at Rest

**Database Encryption:**

```yaml
# PostgreSQL Encryption
postgresql:
  encryption:
    enabled: true
    method: AES-256-GCM
    keyRotation: 90days

  # Transparent Data Encryption (TDE)
  tde:
    enabled: true
    masterKey: ${POSTGRES_MASTER_KEY}

# MongoDB Encryption
mongodb:
  security:
    enableEncryption: true
    encryptionCipherMode: AES256-CBC
    kmip:
      serverName: key-management-server
      port: 5696
```

**Field-Level Encryption:**

```typescript
// Sensitive fields encrypted at application level
class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyDerivation = 'pbkdf2';

  async encryptField(plaintext: string): Promise<EncryptedField> {
    const iv = crypto.randomBytes(16);
    const salt = crypto.randomBytes(32);

    // Derive encryption key
    const key = crypto.pbkdf2Sync(
      process.env.ENCRYPTION_KEY,
      salt,
      100000,
      32,
      'sha256',
    );

    // Encrypt
    const cipher = crypto.createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return {
      ciphertext: encrypted.toString('base64'),
      iv: iv.toString('base64'),
      salt: salt.toString('base64'),
      authTag: authTag.toString('base64'),
      algorithm: this.algorithm,
    };
  }
}

// Fields requiring encryption:
const ENCRYPTED_FIELDS = [
  'employee.nationalId',
  'employee.taxId',
  'employee.bankAccount',
  'employee.salary',
  'deal.contractTerms',
  'invoice.paymentDetails',
];
```

### 3.2 Encryption in Transit

**TLS Configuration:**

```nginx
# Nginx TLS Configuration
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305';
ssl_prefer_server_ciphers on;

# Perfect Forward Secrecy
ssl_dhparam /etc/nginx/ssl/dhparam.pem;

# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/nginx/ssl/chain.pem;

# Session Configuration
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

**Internal Service Communication:**

```yaml
# mTLS for Service-to-Service Communication
services:
  api:
    tls:
      enabled: true
      cert: /certs/api.crt
      key: /certs/api.key
      ca: /certs/ca.crt
      verifyClient: true

  database:
    ssl:
      mode: require
      ca: /certs/ca.crt
      cert: /certs/client.crt
      key: /certs/client.key
```

### 3.3 Secrets Management

**HashiCorp Vault Integration:**

```typescript
import * as vault from 'node-vault';

class SecretsManager {
  private vault: vault.client;

  constructor() {
    this.vault = vault({
      apiVersion: 'v1',
      endpoint: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
    });
  }

  async getSecret(path: string): Promise<any> {
    const result = await this.vault.read(path);
    return result.data;
  }

  async rotateSecret(path: string): Promise<void> {
    // Generate new secret
    const newSecret = crypto.randomBytes(32).toString('hex');

    // Store in vault
    await this.vault.write(path, { value: newSecret });

    // Trigger application reload
    await this.reloadServices();
  }
}

// Environment-specific secrets
const SECRETS_PATH = {
  database: 'secret/data/blih/prod/database',
  jwt: 'secret/data/blih/prod/jwt',
  encryption: 'secret/data/blih/prod/encryption',
  smtp: 'secret/data/blih/prod/smtp',
};
```

**Secret Rotation Policy:**

| Secret Type        | Rotation Frequency      | Auto-Rotation |
| ------------------ | ----------------------- | ------------- |
| Database passwords | 90 days                 | ✅ Yes        |
| JWT signing keys   | 180 days                | ✅ Yes        |
| Encryption keys    | 365 days                | ⚠️ Manual     |
| API keys           | 30 days                 | ✅ Yes        |
| SSL certificates   | 90 days (Let's Encrypt) | ✅ Yes        |

---

## 4. Network Security

### 4.1 Firewall Rules

**UFW Configuration:**

```bash
#!/bin/bash
# BLIH Firewall Setup

# Default policies
ufw default deny incoming
ufw default allow outgoing

# Allow SSH (from specific IPs only)
ufw allow from 203.0.113.0/24 to any port 22 proto tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Allow database access (internal network only)
ufw allow from 10.0.0.0/8 to any port 5432 proto tcp  # PostgreSQL
ufw allow from 10.0.0.0/8 to any port 27017 proto tcp # MongoDB

# Deny all other database ports from external
ufw deny 5432/tcp
ufw deny 27017/tcp
ufw deny 6379/tcp  # Redis
ufw deny 5672/tcp  # RabbitMQ

# Enable firewall
ufw enable
```

### 4.2 Network Segmentation

```yaml
# Docker Network Configuration
networks:
  frontend_network:
    driver: bridge
    internal: false
    ipam:
      config:
        - subnet: 172.20.0.0/24

  backend_network:
    driver: bridge
    internal: true # No external access
    ipam:
      config:
        - subnet: 172.21.0.0/24

  database_network:
    driver: bridge
    internal: true # Completely isolated
    ipam:
      config:
        - subnet: 172.22.0.0/24

# Service Network Assignment
services:
  nginx:
    networks:
      - frontend_network

  frontend:
    networks:
      - frontend_network
      - backend_network

  api:
    networks:
      - backend_network
      - database_network

  postgres:
    networks:
      - database_network
```

### 4.3 DDoS Protection

```nginx
# Rate Limiting
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;

# Connection Limiting
limit_conn_zone $binary_remote_addr zone=addr:10m;
limit_conn addr 10;

# Request Size Limits
client_max_body_size 10M;
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 8k;

# Timeout Configuration
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;

# Slow Request Mitigation
limit_rate_after 10m;
limit_rate 500k;
```

---

## 5. API Security

### 5.1 Input Validation

```typescript
import {
  IsString,
  IsEmail,
  Length,
  Matches,
  IsNotEmpty,
} from 'class-validator';

class CreateEmployeeDto {
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'Name can only contain letters and spaces',
  })
  firstName: string;

  @IsNotEmpty()
  @IsEmail()
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
  email: string;

  @IsNotEmpty()
  @Matches(/^\+251[0-9]{9}$/, { message: 'Invalid Ethiopian phone number' })
  phone: string;
}

// Sanitization Middleware
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Sanitize all string inputs
    this.sanitizeObject(req.body);
    this.sanitizeObject(req.query);
    next();
  }

  private sanitizeObject(obj: any) {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potential XSS
        obj[key] = this.sanitize(obj[key]);
      } else if (typeof obj[key] === 'object') {
        this.sanitizeObject(obj[key]);
      }
    }
  }

  private sanitize(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}
```

### 5.2 Output Encoding

```typescript
// Prevent XSS in responses
class ResponseSanitizer {
  static sanitizeResponse(data: any): any {
    if (typeof data === 'string') {
      return this.encodeHTML(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeResponse(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const key in data) {
        sanitized[key] = this.sanitizeResponse(data[key]);
      }
      return sanitized;
    }

    return data;
  }

  static encodeHTML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }
}
```

### 5.3 CSRF Protection

```typescript
// CSRF Token Generation
@Injectable()
export class CSRFService {
  private readonly tokenStore = new Map<string, string>();

  generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    this.tokenStore.set(sessionId, token);
    return token;
  }

  validateToken(sessionId: string, token: string): boolean {
    const storedToken = this.tokenStore.get(sessionId);
    if (!storedToken || storedToken !== token) {
      return false;
    }
    // Token is single-use
    this.tokenStore.delete(sessionId);
    return true;
  }
}

// CSRF Guard
@Injectable()
export class CSRFGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const csrfToken = request.headers['x-csrf-token'];
    const sessionId = request.session.id;

    return this.csrfService.validateToken(sessionId, csrfToken);
  }
}
```

### 5.4 SQL Injection Prevention

```typescript
// ALWAYS use parameterized queries
class EmployeeRepository {
  // ✅ CORRECT - Parameterized query
  async findByEmail(email: string): Promise<Employee> {
    return await this.dataSource.query(
      'SELECT * FROM employees WHERE email = $1',
      [email],
    );
  }

  // ❌ WRONG - String concatenation (SQL injection risk!)
  async findByEmailWrong(email: string): Promise<Employee> {
    return await this.dataSource.query(
      `SELECT * FROM employees WHERE email = '${email}'`,
    );
  }

  // ✅ CORRECT - ORM with parameterization
  async findActive(): Promise<Employee[]> {
    return await this.employeeRepo.find({
      where: { status: 'ACTIVE', company_id: 'BLIH' },
    });
  }
}
```

---

## 6. Application Security

### 6.1 Security Headers

```typescript
// Helmet Configuration
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.blih.yourcompany.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true,
    frameguard: { action: 'deny' },
  }),
);
```

### 6.2 Session Management

```typescript
// Secure Session Configuration
app.use(
  session({
    name: 'blih.sid', // Don't use default name
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true, // HTTPS only
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
      domain: '.blih.yourcompany.com',
    },
    store: new RedisStore({
      client: redisClient,
      prefix: 'sess:',
      ttl: 3600,
    }),
  }),
);

// Session Security Middleware
export class SessionSecurityMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Regenerate session ID on privilege escalation
    if (req.session.privilegeChanged) {
      req.session.regenerate((err) => {
        if (err) return next(err);
        next();
      });
    }

    // Check for session fixation
    if (this.isSessionFixationAttempt(req)) {
      req.session.destroy();
      return res.status(401).json({ error: 'Session security violation' });
    }

    next();
  }
}
```

---

## 7. Infrastructure Security

### 7.1 Container Security

**Docker Security Best Practices:**

```dockerfile
# Secure Dockerfile Example
FROM node:20-alpine AS builder

# Run as non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nodejs:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy application code
COPY --chown=nodejs:nodejs . .

# Build application
RUN npm run build

# Production image
FROM node:20-alpine

# Security updates
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Drop privileges
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/main.js"]
```

**Docker Compose Security:**

```yaml
services:
  api:
    # Read-only root filesystem
    read_only: true
    tmpfs:
      - /tmp

    # Drop capabilities
    cap_drop:
      - ALL
    cap_add:
      - NET_BIND_SERVICE

    # Security options
    security_opt:
      - no-new-privileges:true
      - apparmor=docker-default

    # Resource limits
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### 7.2 OS Hardening

```bash
#!/bin/bash
# Ubuntu Server Hardening Script

# Disable unused filesystems
echo "install cramfs /bin/true" >> /etc/modprobe.d/disable-filesystems.conf

# Configure sysctl security settings
cat >> /etc/sysctl.conf << EOF
# IP Forwarding
net.ipv4.ip_forward = 0

# SYN Cookies
net.ipv4.tcp_syncookies = 1

# Ignore ICMP redirects
net.ipv4.conf.all.accept_redirects = 0
net.ipv6.conf.all.accept_redirects = 0

# Disable source packet routing
net.ipv4.conf.all.accept_source_route = 0
net.ipv6.conf.all.accept_source_route = 0

# Log Martians
net.ipv4.conf.all.log_martians = 1
EOF

sysctl -p

# SSH Hardening
sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
echo "AllowUsers blih-admin" >> /etc/ssh/sshd_config

systemctl restart sshd

# Automatic security updates
apt install -y unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades
```

---

## 8. Compliance & Standards

### 8.1 ISO 27001 Controls

| Control                                       | Implementation              |
| --------------------------------------------- | --------------------------- |
| **A.9.1 Access Control**                      | Keycloak IAM with MFA       |
| **A.9.2 User Access Management**              | RBAC with least privilege   |
| **A.10.1 Cryptographic Controls**             | AES-256 encryption, TLS 1.3 |
| **A.12.4 Logging and Monitoring**             | Immutable audit logs        |
| **A.14.2 Security in Development**            | Security code reviews, SAST |
| **A.16.1 Information Security Incidents**     | Incident response plan      |
| **A.17.1 Information Backup**                 | Automated daily backups     |
| **A.18.1 Compliance with Legal Requirements** | Data retention policies     |

### 8.2 GDPR Compliance

```typescript
// Data Subject Rights Implementation
class GDPRService {
  // Right to Access
  async exportUserData(userId: string): Promise<PersonalDataExport> {
    return {
      profile: await this.userService.getProfile(userId),
      activities: await this.auditService.getUserActivities(userId),
      files: await this.fileService.getUserFiles(userId),
      // ... all personal data
    };
  }

  // Right to Erasure ("Right to be Forgotten")
  async deleteUserData(userId: string): Promise<void> {
    // Anonymize instead of delete for audit trail
    await this.anonymizeUser(userId);
    await this.auditService.log({
      action: 'USER_DATA_ERASED',
      userId,
      timestamp: new Date(),
    });
  }

  // Right to Data Portability
  async exportDataPortable(userId: string): Promise<Buffer> {
    const data = await this.exportUserData(userId);
    return JSON.stringify(data, null, 2);
  }
}
```

---

## 9. Security Monitoring

### 9.1 Audit Logging

```typescript
// Comprehensive Audit Logger
class AuditLogger {
  async log(event: AuditEvent): Promise<void> {
    const auditRecord = {
      id: uuid(),
      timestamp: new Date().toISOString(),
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      result: event.result,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      requestId: event.requestId,
      metadata: event.metadata,
      // Immutable signature
      signature: await this.signRecord(event),
    };

    // Store in append-only log
    await this.auditRepo.insert(auditRecord);

    // Forward to SIEM
    await this.forwardToSIEM(auditRecord);
  }
}

// Events to Audit:
const AUDIT_EVENTS = [
  'USER_LOGIN',
  'USER_LOGOUT',
  'USER_CREATED',
  'USER_DELETED',
  'PERMISSION_CHANGED',
  'DATA_ACCESSED',
  'DATA_MODIFIED',
  'DATA_DELETED',
  'FAILED_LOGIN_ATTEMPT',
  'UNAUTHORIZED_ACCESS_ATTEMPT',
  'CONFIGURATION_CHANGED',
  'BACKUP_CREATED',
  'BACKUP_RESTORED',
];
```

### 9.2 Intrusion Detection

```bash
# Fail2Ban Configuration for BLIH
cat > /etc/fail2ban/jail.d/blih.conf << EOF
[blih-api]
enabled = true
port = 3000
filter = blih-api
logpath = /opt/blih/logs/api.log
maxretry = 5
findtime = 600
bantime = 3600

[blih-login]
enabled = true
port = 3000
filter = blih-login
logpath = /opt/blih/logs/auth.log
maxretry = 3
findtime = 300
bantime = 7200
EOF

# Create fail2ban filter
cat > /etc/fail2ban/filter.d/blih-api.conf << EOF
[Definition]
failregex = ^.*"Failed authentication attempt".*"ip":"<HOST>".*$
ignoreregex =
EOF
```

---

## 10. Incident Response

### 10.1 Incident Response Plan

```yaml
phases:
  1_preparation:
    - Maintain incident response team contacts
    - Regular security drills
    - Keep backup systems ready

  2_detection:
    - Monitor security alerts
    - Review audit logs daily
    - User-reported incidents

  3_containment:
    - Isolate affected systems
    - Preserve evidence
    - Implement temporary fixes

  4_eradication:
    - Remove threat
    - Patch vulnerabilities
    - Update security controls

  5_recovery:
    - Restore from clean backups
    - Verify system integrity
    - Monitor for reinfection

  6_lessons_learned:
    - Post-incident review
    - Update procedures
    - Security awareness training
```

---

## 11. Security Best Practices

### 11.1 Development Security

**Secure Coding Checklist:**

- [ ] All inputs validated and sanitized
- [ ] Parameterized queries used (no string concatenation)
- [ ] Output properly encoded
- [ ] Authentication required for all protected endpoints
- [ ] Authorization checked before data access
- [ ] Secrets stored in environment variables/vault
- [ ] Error messages don't leak sensitive information
- [ ] Dependencies regularly updated
- [ ] Code reviewed for security issues
- [ ] SAST tools run in CI/CD

### 11.2 Deployment Security

**Pre-Deployment Checklist:**

- [ ] All default passwords changed
- [ ] SSL/TLS certificates valid and configured
- [ ] Firewall rules properly configured
- [ ] Database credentials rotated
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Backup systems tested
- [ ] Monitoring alerts configured
- [ ] Incident response plan in place
- [ ] Security scan completed (no critical vulnerabilities)

---

## 12. Security Checklist

### Production Deployment Security Checklist

```markdown
## Authentication & Authorization

- [ ] MFA enabled for admin accounts
- [ ] Password policy enforced (min 12 chars, complexity)
- [ ] Session timeout configured (15 minutes idle)
- [ ] JWT tokens use RS256 algorithm
- [ ] Refresh tokens rotated on use
- [ ] RBAC permissions properly assigned

## Data Protection

- [ ] Database encryption at rest enabled
- [ ] TLS 1.3 enforced for all connections
- [ ] Sensitive fields encrypted at application level
- [ ] Secrets stored in vault/secrets manager
- [ ] Backup encryption enabled
- [ ] Data retention policies configured

## Network Security

- [ ] Firewall rules configured and tested
- [ ] Network segmentation implemented
- [ ] Database ports not exposed externally
- [ ] SSH access restricted to admin IPs
- [ ] DDoS protection enabled
- [ ] VPN configured for administrative access

## Application Security

- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] CSRF protection enabled
- [ ] Input validation on all endpoints
- [ ] Output encoding implemented
- [ ] Rate limiting configured
- [ ] File upload restrictions in place

## Infrastructure Security

- [ ] OS hardening applied
- [ ] Containers run as non-root
- [ ] Unnecessary services disabled
- [ ] Security updates automated
- [ ] Log aggregation configured
- [ ] Intrusion detection system active

## Monitoring & Logging

- [ ] Audit logging enabled for all critical actions
- [ ] Log retention policy configured (365 days)
- [ ] Security alerts configured
- [ ] Failed login attempts monitored
- [ ] Unusual activity detection enabled
- [ ] SIEM integration completed

## Compliance

- [ ] Data privacy policies documented
- [ ] User consent mechanisms in place
- [ ] Data subject rights implemented
- [ ] Audit trail immutable
- [ ] Compliance reports automated
- [ ] Security training completed

## Incident Response

- [ ] Incident response plan documented
- [ ] Contact list updated
- [ ] Backup restoration tested
- [ ] Disaster recovery plan in place
- [ ] Security incident reporting process defined
- [ ] Post-incident review process established
```

---

**Document Classification:** Internal - Security Sensitive  
**Last Security Review:** February 2026  
**Next Review Date:** August 2026  
**Contact:** security@yourcompany.com
