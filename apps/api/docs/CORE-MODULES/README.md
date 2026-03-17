# BLIH System Core Modules Documentation

## Overview

The core modules provide essential platform services that form the foundation of the BLIH System. These modules handle authentication, authorization, user management, audit logging, notifications, and system configuration.

## Module Architecture

```
src/core/
├── audit/              # Comprehensive audit logging system
├── auth/               # Authentication and JWT token management
├── jobs/               # Scheduled background jobs
├── notifications/      # Multi-channel notification system
├── rbac/               # Role-based access control engine
├── system-config/      # Governance and policy management
├── users/              # User profile and preference management
└── health/             # Application health monitoring
```

## Authentication Module (`auth/`)

### Purpose

Handles user authentication, JWT token management, and session tracking.

### Key Components

#### Controllers

- **AuthController**: Authentication endpoints and token management

#### Services

- **AuthService**: Core authentication logic
- **TokenService**: JWT token generation and validation
- **SessionService**: User session management

#### Features

- JWT-based authentication
- Token refresh mechanism
- Session tracking and management
- Multi-factor authentication support
- Keycloak integration

### Key Endpoints

#### Token Exchange

```http
POST /api/v1/auth/token-exchange
Authorization: Bearer {token}
Content-Type: application/json
```

#### Token Refresh

```http
POST /api/v1/auth/refresh
Content-Type: application/json
```

#### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### Configuration

```typescript
// auth.config.ts
export default {
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  keycloak: {
    realm: process.env.KEYCLOAK_REALM,
    clientId: process.env.KEYCLOAK_CLIENT_ID,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET,
  },
};
```

## RBAC Module (`rbac/`)

### Purpose

Implements Role-Based Access Control (RBAC) for fine-grained authorization.

### Key Components

#### Controllers

- **RolesController**: Role management endpoints
- **PermissionsController**: Permission management
- **ActionsController**: Action management
- **ResourcesController**: Resource management
- **EvaluateAccessController**: Access evaluation

#### Services

- **RolesService**: Role CRUD operations
- **PermissionsService**: Permission management
- **ActionsService**: Action management
- **ResourcesService**: Resource management
- **UserPermissionSnapshotService**: User permission caching

#### Features

- Hierarchical role system
- Granular permission control
- Resource-based access control
- Action-based permissions
- Permission caching and snapshots
- Access evaluation engine

### RBAC Model

#### Roles

```typescript
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Permissions

```typescript
interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
  isActive: boolean;
}
```

#### Access Evaluation

```typescript
interface AccessEvaluationRequest {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

interface AccessEvaluationResponse {
  allowed: boolean;
  reason?: string;
  permissions: string[];
}
```

### Key Endpoints

#### Evaluate Access

```http
POST /api/v1/rbac/evaluate-access
Authorization: Bearer {token}
Content-Type: application/json
```

#### List User Permissions

```http
GET /api/v1/rbac/users/{userId}/permissions
Authorization: Bearer {token}
```

#### Create Role

```http
POST /api/v1/rbac/roles
Authorization: Bearer {token}
Content-Type: application/json
```

## Users Module (`users/`)

### Purpose

Manages user profiles, preferences, and user-related operations.

### Key Components

#### Controllers

- **UsersController**: User CRUD operations
- **UserProfilesController**: User profile management
- **UserPreferencesController**: User preferences

#### Services

- **UsersService**: User management logic
- **UserProfilesService**: Profile management
- **UserPreferencesService**: Preference management
- **PasswordResetService**: Password reset functionality

#### Features

- User profile management
- User preferences and settings
- Password reset functionality
- User status management
- Department associations
- User search and filtering

### User Model

```typescript
interface User {
  id: string;
  keycloakId: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: UserStatus;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  PENDING = 'PENDING',
}
```

### Key Endpoints

#### List Users

```http
GET /api/v1/users?page=1&limit=10&search=john&status=ACTIVE
Authorization: Bearer {token}
```

#### Create User

```http
POST /api/v1/users
Authorization: Bearer {token}
Content-Type: application/json
```

#### Update User Profile

```http
PUT /api/v1/users/{userId}/profile
Authorization: Bearer {token}
Content-Type: application/json
```

#### Reset Password

```http
POST /api/v1/users/{userId}/reset-password
Authorization: Bearer {token}
Content-Type: application/json
```

## Audit Module (`audit/`)

### Purpose

Provides comprehensive audit logging for compliance and security monitoring.

### Key Components

#### Controllers

- **AuditController**: Audit log retrieval and management

#### Services

- **AuditService**: Audit logging operations
- **AuditCleanupService**: Automated log cleanup

#### Features

- Comprehensive audit trail
- Structured log format
- Log retention policies
- Audit log search and filtering
- Compliance reporting
- Automated cleanup jobs

### Audit Model

```typescript
interface AuditLog {
  id: string;
  userId: string;
  resource: string;
  action: string;
  result: AuditResult;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  correlationId: string;
}

enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
}
```

### Key Endpoints

#### List Audit Logs

```http
GET /api/v1/audit/logs?page=1&limit=10&userId=user-uuid&resource=users
Authorization: Bearer {token}
```

#### Get Audit Statistics

```http
GET /api/v1/audit/statistics?fromDate=2024-01-01&toDate=2024-01-31
Authorization: Bearer {token}
```

### Audit Interceptors

The audit system uses interceptors to automatically log all API requests:

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Log request details
    // Execute request
    // Log response details
    return next.handle();
  }
}
```

## Notifications Module (`notifications/`)

### Purpose

Manages multi-channel notifications including email, webhook, and in-app notifications.

### Key Components

#### Controllers

- **NotificationsController**: Notification management
- **NotificationTemplatesController**: Template management

#### Services

- **NotificationsService**: Notification delivery logic
- **EmailService**: Email delivery via Nodemailer
- **WebhookService**: Webhook delivery
- **NotificationTemplateService**: Template management

#### Features

- Multi-channel delivery (email, webhook, in-app)
- Template-based notifications
- Notification scheduling
- Delivery tracking
- Failed notification retry
- Notification preferences

### Notification Model

```typescript
interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  subject: string;
  content: string;
  status: NotificationStatus;
  metadata: Record<string, any>;
  sentAt?: Date;
  createdAt: Date;
}

enum NotificationChannel {
  EMAIL = 'EMAIL',
  WEBHOOK = 'WEBHOOK',
  IN_APP = 'IN_APP',
}

enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
}
```

### Key Endpoints

#### Send Notification

```http
POST /api/v1/notifications
Authorization: Bearer {token}
Content-Type: application/json
```

#### List User Notifications

```http
GET /api/v1/notifications?page=1&limit=10&status=PENDING
Authorization: Bearer {token}
```

#### Create Notification Template

```http
POST /api/v1/notifications/templates
Authorization: Bearer {token}
Content-Type: application/json
```

## System Config Module (`system-config/`)

### Purpose

Manages system-wide configuration, governance policies, and administrative settings.

### Key Components

#### Controllers

- **SystemConfigController**: Configuration management

#### Services

- **SystemConfigService**: Configuration CRUD operations
- **PolicyService**: Policy management
- **GovernanceService**: Governance rules

#### Features

- System-wide configuration
- Governance policies
- Configuration versioning
- Environment-specific settings
- Configuration validation
- Policy enforcement

### Configuration Model

```typescript
interface SystemConfig {
  id: string;
  key: string;
  value: any;
  description: string;
  category: string;
  isEncrypted: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Key Endpoints

#### Get Configuration

```http
GET /api/v1/system-config/{key}
Authorization: Bearer {token}
```

#### Update Configuration

```http
PUT /api/v1/system-config/{key}
Authorization: Bearer {token}
Content-Type: application/json
```

#### List Configurations

```http
GET /api/v1/system-config?category=security
Authorization: Bearer {token}
```

## Health Module (`health/`)

### Purpose

Provides application health monitoring and diagnostics.

### Key Components

#### Controllers

- **HealthController**: Health check endpoints

#### Services

- **HealthService**: Health check logic
- **DatabaseHealthService**: Database connectivity checks
- **ExternalServiceHealthService**: External service checks

#### Features

- Application health status
- Database connectivity
- External service availability
- System metrics
- Health check aggregation
- Detailed diagnostics

### Health Check Model

```typescript
interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: {
    database: HealthCheckResult;
    keycloak: HealthCheckResult;
    memory: HealthCheckResult;
    disk: HealthCheckResult;
  };
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded';
  details?: Record<string, any>;
  responseTime?: number;
}
```

### Key Endpoints

#### Health Check

```http
GET /api/v1/health
```

#### Detailed Health

```http
GET /api/v1/health/detailed
Authorization: Bearer {token}
```

## Background Jobs (`jobs/`)

### Purpose

Handles scheduled background tasks for system maintenance and data synchronization.

### Key Jobs

#### CleanupAuditJob

- **Purpose**: Clean up old audit logs based on retention policy
- **Schedule**: Daily at 2:00 AM
- **Configuration**: Retention period configurable

#### RotateClientSecretsJob

- **Purpose**: Rotate Keycloak client secrets for security
- **Schedule**: Monthly
- **Configuration**: Rotation frequency and notification settings

#### SyncRolesJob

- **Purpose**: Synchronize roles with Keycloak
- **Schedule**: Every 5 minutes
- **Configuration**: Sync interval and conflict resolution

#### SyncUsersJob

- **Purpose**: Synchronize users with Keycloak
- **Schedule**: Every 10 minutes
- **Configuration**: Sync interval and user attribute mapping

### Job Configuration

```typescript
// job.config.ts
export const jobConfig = {
  cleanupAudit: {
    schedule: '0 2 * * *', // Daily at 2:00 AM
    retentionDays: 90,
  },
  rotateClientSecrets: {
    schedule: '0 0 1 * *', // Monthly on 1st day
    notifyBefore: 7, // Days before rotation
  },
  syncRoles: {
    schedule: '*/5 * * * *', // Every 5 minutes
    conflictResolution: 'keycloak_wins',
  },
  syncUsers: {
    schedule: '*/10 * * * *', // Every 10 minutes
    attributeMapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
    },
  },
};
```

## Module Dependencies

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Auth Module   │────│   RBAC Module   │────│  Users Module   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Audit Module   │────│ Notifications   │────│ System Config   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                 │
                                 ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Health Module  │────│ Background Jobs │────│  Platform Layer  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Security Considerations

### Authentication Security

- JWT token validation and expiration
- Secure token storage
- Session management
- Multi-factor authentication

### Authorization Security

- Principle of least privilege
- Permission-based access control
- Resource-level authorization
- Action-specific permissions

### Audit Security

- Immutable audit logs
- Comprehensive logging coverage
- Tamper detection
- Compliance reporting

### Data Protection

- Sensitive data encryption
- PII protection
- Data retention policies
- Secure data transmission

## Performance Considerations

### Caching Strategy

- User permission caching
- Configuration caching
- Session caching
- Audit log aggregation

### Database Optimization

- Indexed queries
- Connection pooling
- Query optimization
- Batch operations

### Background Processing

- Asynchronous job processing
- Queue management
- Error handling and retry
- Resource monitoring

## Testing Strategy

### Unit Tests

- Service layer testing
- Business logic validation
- Edge case handling
- Error scenarios

### Integration Tests

- Database integration
- External service integration
- Module interactions
- End-to-end workflows

### Performance Tests

- Load testing
- Stress testing
- Database performance
- Memory usage

## Monitoring and Observability

### Metrics Collection

- Request/response times
- Error rates
- Authentication failures
- Authorization denials

### Logging Strategy

- Structured logging
- Log levels and filtering
- Correlation ID tracking
- Performance logging

### Health Monitoring

- Service health checks
- Database connectivity
- External service availability
- System resource monitoring

The core modules provide a robust foundation for the BLIH System, ensuring security, compliance, and operational excellence while maintaining clean architecture principles and high performance standards.
