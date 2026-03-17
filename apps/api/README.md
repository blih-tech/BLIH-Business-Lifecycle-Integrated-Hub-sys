# BLIH System Backend

**A production-ready NestJS monolithic application serving as the central platform for the BLIH ecosystem, providing enterprise-grade authentication, authorization, audit capabilities, and modular business domain services.**

## 🏗️ Architecture Overview

### System Architecture

This is a **modular monolithic NestJS application** designed with clean architecture principles, ready to evolve into microservices. The codebase follows a domain-driven design pattern with clear separation of concerns.

### Directory Structure

```
src/
├── config/              # Environment configuration and validation
│   ├── env.config.ts    # Joi-based environment validation schema
│   └── index.ts         # Configuration loaders and exports
├── core/                # Core platform services and business logic
│   ├── audit/           # Comprehensive audit logging system
│   ├── auth/            # Authentication and JWT token management
│   ├── jobs/            # Scheduled background jobs (cleanup, sync)
│   ├── notifications/   # Multi-channel notification system
│   ├── rbac/            # Role-based access control engine
│   ├── realms/          # Multi-realm configuration
│   ├── system-config/   # Governance and policy management
│   └── users/           # User profile and preference management
├── domains/             # Business domain modules (extensible)
│   ├── ai/              # AI services and knowledge management
│   ├── brain/           # Knowledge base and cognitive services
│   ├── chatbot/         # AI-powered assistance
│   ├── crm/             # Customer relationship management
│   ├── finance/         # Financial management
│   ├── hr/              # Human resources management
│   └── project/         # Project management
├── platform/           # Infrastructure and cross-cutting concerns
│   ├── prisma/          # Database ORM and migrations
│   ├── keycloak/        # Identity provider integration
│   ├── messaging/       # Message broker integration (optional)
│   ├── realm/           # Realm context management
│   └── platform.module.ts
├── shared/              # Shared utilities and common code
│   ├── decorators/      # Custom decorators and annotations
│   ├── filters/         # Global exception filters
│   ├── interceptors/    # Request/response interceptors
│   ├── middlewares/     # Express middlewares
│   ├── pipes/           # Data transformation pipes
│   └── utils/           # Common utility functions
├── app.module.ts        # Root application module
└── main.ts              # Application bootstrap and configuration
```

### Technology Stack

- **Framework**: NestJS 11 (Node.js 22+, TypeScript 5.7+)
- **Database**: PostgreSQL 16 with Prisma ORM 6.19+
- **Identity Provider**: Keycloak 26.0 with OpenID Connect
- **Email Service**: MailHog (dev), SMTP (production)
- **API Documentation**: Swagger/OpenAPI 3.0 with NestJS Swagger
- **Testing**: Jest for unit, integration, and E2E tests
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint 9, Prettier 3, Husky 9, lint-staged
- **Validation**: Joi for environment validation, class-validator for DTOs
- **Security**: Helmet, CORS, rate limiting, JWT validation

## 🚀 Quick Start

### Prerequisites

- **Node.js 22+** - Required runtime environment
- **Docker & Docker Compose** - For infrastructure services
- **PostgreSQL Client** (optional) - For direct database access
- **Git** - For version control

### 1️⃣ Repository Setup

```bash
# Clone the repository
git clone <repository-url>
cd blih-system-backend

# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

### 2️⃣ Environment Configuration

The application uses a sophisticated environment configuration system with Joi validation.

```bash
# Copy environment templates
cp .env.example .env
cp .env.local.template .env.local.detailed

# Edit configuration (required)
nano .env
```

**Critical Configuration Steps:**

1. **Database Connection**: Update `DATABASE_URL` with PostgreSQL credentials
2. **Keycloak Integration**: Configure `KEYCLOAK_CLIENT_SECRET` after Keycloak setup
3. **Realm Configuration**: Set `KEYCLOAK_REALM` to match your Keycloak realm
4. **JWT Settings**: Update `KEYCLOAK_JWKS_URL` with correct realm URL
5. **Security**: Set `INTERNAL_AUTH_SHARED_SECRET` for trusted proxy communication

### 3️⃣ Infrastructure Services

```bash
# Start all infrastructure services
docker compose -f docker-compose.yml up -d

# Verify services are running
docker compose -f docker-compose.yml ps

# Wait for services (30-60 seconds)
docker compose -f docker-compose.yml logs -f postgres
```

`docker-compose.yml` reads runtime values from `.env`; never commit real secrets.

**Services Started:**

- **PostgreSQL**: `localhost:5432` (credentials from `.env`)
- **Keycloak**: `localhost:8080` (admin credentials from `.env`)
- **MailHog**: `localhost:8025` (email testing)

### 4️⃣ Database Setup

```bash
# Run database migrations
npm run prisma:migrate:dev

# Seed database with initial data
npm run prisma:seed

# Optional: View database in Prisma Studio
npx prisma studio
```

### 5️⃣ Application Startup

```bash
# Development mode with hot reload
npm run start:dev

# Development with debugging
npm run start:debug

# Production mode
npm run build
npm run start:prod
```

### 6️⃣ Verification

Once running, verify these endpoints:

| Service            | URL                                   | Credentials |
| ------------------ | ------------------------------------- | ----------- |
| **API Base**       | `http://localhost:5000`               | -           |
| **Swagger Docs**   | `http://localhost:5000/api/docs`      | -           |
| **Health Check**   | `http://localhost:5000/api/v1/health` | -           |
| **Keycloak Admin** | `http://localhost:8080`               | admin/admin |
| **MailHog**        | `http://localhost:8025`               | -           |

## 🔧 Configuration System

### Environment Variables

The application uses a comprehensive environment configuration system with Joi validation. All runtime variables are defined in `src/config/env.config.ts`:

```typescript
// Core Application (4 variables)
NODE_ENV=development|test|production
PORT=5000
API_PREFIX=api/v1
SKIP_DATABASE_CONNECT=false

// Database (1 variable)
DATABASE_URL=postgresql://blih_dev_user:blih_dev_pass_2024@postgres:5432/blih-system-dev

// Keycloak Authentication
KEYCLOAK_ENABLED=true
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=blih-dev
KEYCLOAK_CLIENT_ID=blih-system-api
KEYCLOAK_CLIENT_SECRET=my-blih-api-secret-2026
KEYCLOAK_AUTH_CLIENT_ID=blih-system-auth
KEYCLOAK_AUTH_CLIENT_SECRET=my-blih-auth-secret-2026
KEYCLOAK_AUTHORIZATION_URL=http://keycloak:8080/realms/blih-dev/protocol/openid-connect/auth
KEYCLOAK_TOKEN_URL=http://keycloak:8080/realms/blih-dev/protocol/openid-connect/token
KEYCLOAK_LOGOUT_URL=http://keycloak:8080/realms/blih-dev/protocol/openid-connect/logout
KEYCLOAK_USERINFO_URL=http://keycloak:8080/realms/blih-dev/protocol/openid-connect/userinfo
KEYCLOAK_JWKS_URL=http://keycloak:8080/realms/blih-dev/protocol/openid-connect/certs
KEYCLOAK_AUTH_REDIRECT_URI=http://localhost:5000/api/v1/auth/callback
KEYCLOAK_AUTH_SCOPES=openid profile email
KEYCLOAK_ADMIN_CLIENT_ID=admin-cli
KEYCLOAK_ADMIN_USERNAME=
KEYCLOAK_ADMIN_PASSWORD=
TRUST_PROXY_PRINCIPAL_HEADERS=false

// Security & Authorization
INTERNAL_AUTH_SHARED_SECRET=
ENFORCE_MFA_FOR_PRIVILEGED=false
AUTH_POLICY_VERSION=1.0
AUTH_LOGIN_ERROR_REDIRECT_URI=/login
AUTH_POST_LOGIN_REDIRECT_URI=/
AUTH_POST_LOGOUT_REDIRECT_URI=/login
AUTH_STATE_TTL_SECONDS=600
AUTH_REFRESH_TOKEN_TTL_SECONDS=2592000
AUTH_COOKIE_HTTP_ONLY=true
AUTH_COOKIE_SECURE=false
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_PATH=/
AUTH_COOKIE_SAME_SITE=lax
AUTH_NONCE_ENABLED=true
AUTH_PKCE_ENABLED=true
AUTH_PKCE_METHOD=S256
JWKS_CACHE_TTL_SECONDS=3600
JWKS_CACHE_MAX_KEYS=5
JWT_EXPECTED_AUDIENCE=blih-system-api
JWT_EXPECTED_ISSUER=http://keycloak:8080/realms/blih-dev

// Messaging (optional, disabled by default)
RABBITMQ_ENABLED=false
RABBITMQ_URL=amqp://guest:guest@rabbitmq:5672
RABBITMQ_EXCHANGE=blih.events
RABBITMQ_DLQ=system.dlq
EVENT_CONTRACT_VERSION=1.0
EVENT_SCHEMA_PREFIX=blih.event
EVENT_SUPPORTED_MAJOR_VERSION=1

// Email Service (5 variables)
SMTP_ENABLED=false
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@blih.local
SMTP_PASSWORD=password
EMAIL_FROM=BLIH <noreply@blih.local>

// Application Features (2 variables)
SWAGGER_ENABLED=true
CORS_ORIGIN=*

// Logging & Monitoring (1 variable)
VERBOSE_REQUEST_LOGGING=false

// System Configuration (4 variables)
AUDIT_RETENTION_DAYS=2555
MAX_RETRY_ATTEMPTS=3
RETRY_BACKOFF_MS=1000
PRINCIPAL_CONTEXT_TTL_MS=30000

// Synchronization (1 variable)
SYNC_ROLES_FROM_KEYCLOAK=false
```

### Configuration Validation

All environment variables are validated on startup using Joi schemas. Invalid configurations prevent application startup with detailed error messages.

## 📡 API Reference

### Base URL Structure

All controllers are versioned under `/api/v1/`:

| Module         | Endpoint                | Status         | Description                                        |
| -------------- | ----------------------- | -------------- | -------------------------------------------------- |
| Authentication | `/api/v1/auth`          | ✅ Implemented | JWT token management, validation, introspection    |
| RBAC           | `/api/v1/rbac`          | ✅ Implemented | Roles, permissions, access evaluation              |
| Users          | `/api/v1/users`         | ✅ Implemented | User management, profiles, preferences             |
| Realms         | `/api/v1/realms`        | ✅ Implemented | Multi-realm configuration                          |
| System Config  | `/api/v1/system-config` | ✅ Implemented | Governance settings, policies                      |
| Notifications  | `/api/v1/notifications` | ✅ Implemented | Notification management and delivery               |
| Audit          | `/api/v1/audit`         | ✅ Implemented | Audit logs, compliance reports                     |
| Health         | `/api/v1/health`        | ✅ Implemented | Service health checks                              |
| AI Services    | `/api/v1/ai`            | 🚧 Scaffold    | AI services foundation (empty controller)          |
| Brain          | `/api/v1/brain`         | 🚧 Scaffold    | Knowledge base foundation (empty controller)       |
| Chatbot        | `/api/v1/chatbot`       | 🚧 Scaffold    | AI assistance foundation (empty controller)        |
| CRM            | `/api/v1/crm`           | 🚧 Scaffold    | Customer management foundation (empty controller)  |
| Finance        | `/api/v1/finance`       | 🚧 Scaffold    | Financial management foundation (empty controller) |
| HR             | `/api/v1/hr`            | 🚧 Scaffold    | HR management foundation (empty controller)        |
| Project        | `/api/v1/project`       | 🚧 Scaffold    | Project management foundation (empty controller)   |

**Legend:**

- ✅ **Implemented**: Fully functional with business logic
- 🚧 **Scaffold**: Basic structure exists, awaiting implementation

### Authentication Flow

Browser OIDC login/logout endpoints (backend-owned):

1. **Login Initiation**: GET `/api/v1/auth/login` - Generate PKCE/state and redirect to Keycloak `/authorize`
2. **Callback Handling**: GET `/api/v1/auth/callback` - Validate state and nonce, exchange authorization code, set auth cookies
3. **Logout**: GET `/api/v1/auth/logout` - Clear cookies, revoke refresh token (best effort), redirect to Keycloak end-session

Token utility and profile endpoints:

1. **Token Validation**: POST `/api/v1/auth/validate`
2. **Token Introspection**: POST `/api/v1/auth/introspect`
3. **Token Exchange**: POST `/api/v1/auth/exchange`
4. **Token Refresh**: POST `/api/v1/auth/refresh`
5. **Session Revocation**: POST `/api/v1/auth/revoke-session`
6. **User Profile**: GET `/api/v1/auth/me`

Browser cookie rules:

1. `kc_access` is the primary authentication artifact and the only cookie accepted for request authorization.
2. `kc_refresh` is refresh-only and must rotate after every successful refresh.
3. `kc_id` is optional identity/logout support and never authorizes requests.

### OIDC Sequence Diagram

```mermaid
sequenceDiagram
    participant FE as Frontend
    participant API as Backend API
    participant KC as Keycloak

    FE->>API: GET /api/v1/auth/login?redirect=/dashboard
    API->>API: Generate state + PKCE verifier/challenge + nonce
    API-->>FE: 302 to KC /authorize + set kc_state/kc_verifier/kc_redirect/kc_nonce cookies

    FE->>KC: GET /realms/{realm}/protocol/openid-connect/auth
    KC-->>FE: Login UI
    FE->>KC: Credentials + consent
    KC-->>API: GET /api/v1/auth/callback?code=...&state=...

    API->>API: Validate state + verifier + nonce cookies
    API->>KC: POST /protocol/openid-connect/token (authorization_code)
    KC-->>API: access_token + refresh_token + id_token
    API->>API: Validate id_token signature + issuer + audience + nonce
    API-->>FE: 302 to app + set kc_access/kc_refresh/kc_id cookies

    FE->>API: API requests with kc_access cookie

    FE->>API: POST /api/v1/auth/refresh
    API->>KC: POST /protocol/openid-connect/token (refresh_token)
    KC-->>API: rotated access_token + rotated refresh_token + optional id_token
    API-->>FE: 201 + rotated kc_access/kc_refresh cookies

    FE->>API: GET /api/v1/auth/logout
    API->>KC: POST /protocol/openid-connect/revoke (best effort)
    API-->>FE: 302 to KC end-session (or local logout redirect)
```

```bash
# Example browser login initiation
curl -i "http://localhost:5000/api/v1/auth/login?redirect=/dashboard"
```

## 🗄️ Database Architecture

### Prisma Configuration

- **Schema**: `packages/database/schema/`
- **Migrations**: `packages/database/migrations/`
- **Seed**: `packages/database/seed/prisma.seed.ts`
- **Client**: Auto-generated Prisma Client

### Core Models

- **Realm**: Multi-tenant isolation and configuration
- **User**: User profiles, authentication, and preferences
- **Role & Permission**: Granular RBAC implementation
- **Department**: Functional units used across staffing and workflow features
- **AuditLog**: Comprehensive audit trail with metadata
- **Notification**: Multi-channel notification delivery
- **SystemConfig**: Governance and policy configuration

### Database Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate:dev

# Deploy migrations (production)
npm run prisma:migrate:deploy

# Seed database with initial data
npm run prisma:seed

# Reset database (development only)
npx prisma migrate reset

# View database
npx prisma studio
```

## 🔐 Authentication & Authorization

### Keycloak Integration

The system integrates with Keycloak for identity and access management:

- **OpenID Connect**: Standard OIDC implementation
- **JWT Validation**: Token verification with JWKS
- **Multi-Realm Support**: Isolated tenant environments
- **Role Synchronization**: Automatic role/permission sync
- **MFA Support**: Multi-factor authentication enforcement

### RBAC System

Granular role-based access control with:

- **Hierarchical Roles**: Parent-child role inheritance
- **Permission Scopes**: Global, department, self
- **Dynamic Evaluation**: Real-time permission checking
- **Audit Integration**: All access decisions logged
- **Policy Engine**: Configurable authorization policies

### Permission Model

```typescript
// Permission structure
{
  resource: string;     // e.g., 'users', 'departments'
  action: string;       // e.g., 'create', 'read', 'update', 'delete'
  scope: RoleDataScope; // GLOBAL, DEPARTMENT, SELF
  conditions?: any[];   // Additional conditions
}
```

## 📡 Event System

### Event-Driven Architecture

The system can publish domain events to a message broker when messaging is enabled:

```json
{
  "eventType": "user.created",
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "timestamp": "2026-02-21T12:00:00.000Z",
  "source": "blih-system-core",
  "data": {
    "userId": "user-123",
    "email": "user@example.com",
    "realm": "blih"
  },
  "metadata": {
    "version": "1.0",
    "correlationId": "550e8400-e29b-41d4-a716-446655440001",
    "userId": "system",
    "realm": "blih"
  }
}
```

### Event Types

- **User Events**: `user.created`, `user.updated`, `user.disabled`
- **RBAC Events**: `role.assigned`, `role.revoked`, `permission.granted`
- **Audit Events**: `audit.log.created`, `audit.export.completed`
- **Notification Events**: `notification.sent`, `notification.failed`

## 🧪 Testing Strategy

### Test Suites

```bash
# Unit tests - Fast, isolated component tests
npm run test

# Integration tests - Database and external service integration
npm run test:integration

# E2E tests - Full application workflow tests
npm run test:e2e

# Coverage report
npm run test:cov

# Watch mode for development
npm run test:watch
```

### Test Configuration

- **Unit Tests**: Jest with in-memory database mocking
- **Integration Tests**: Test database with real service connections
- **E2E Tests**: Full Docker stack with all services
- **Coverage**: Minimum 80% coverage required

### Test Structure

```
test/
├── unit/           # Component and service unit tests
├── integration/    # Database and API integration tests
├── e2e/           # End-to-end workflow tests
└── fixtures/      # Test data and mock configurations
```

## 📋 Background Jobs

### Scheduled Tasks

The system includes several scheduled jobs for maintenance:

1. **SyncUsersJob** - Synchronize users from Keycloak
2. **SyncRolesJob** - Synchronize roles and permissions
3. **RotateClientSecretsJob** - Rotate Keycloak client secrets
4. **CleanupAuditJob** - Clean up old audit logs based on retention

### Job Configuration

Jobs use NestJS Task Scheduling with configurable schedules:

```typescript
// Example job configuration
@Cron('0 2 * * *') // Daily at 2 AM
async handleSyncUsers() {
  // Sync logic
}
```

## 🔒 Security Features

### Security Layers

1. **Application Security**: Helmet, CORS, rate limiting
2. **Authentication**: JWT token validation with Keycloak
3. **Authorization**: RBAC engine with granular permissions
4. **Data Security**: Input validation, SQL injection prevention
5. **Audit Security**: Comprehensive audit trail
6. **Infrastructure Security**: Docker security best practices

### Security Headers

- **Helmet**: Security header middleware
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: Configurable request rate limits
- **Input Validation**: Joi and class-validator integration

## 📊 Monitoring & Observability

### Health Checks

Comprehensive health monitoring at `/api/v1/health`:

- **Application Health**: Service status and uptime
- **Database Connectivity**: PostgreSQL connection status
- **External Services**: Keycloak connectivity
- **Memory Usage**: Application memory metrics
- **Disk Space**: Available disk space monitoring

### Logging

- **Structured Logging**: JSON format with correlation IDs
- **Request/Response Logging**: HTTP request/response capture
- **Audit Logging**: All data modifications tracked
- **Error Tracking**: Comprehensive error logging and alerting
- **Performance Logging**: Request timing and performance metrics

### Metrics

- **Application Metrics**: Request counts, response times
- **Database Metrics**: Query performance, connection pool status
- **Authentication Metrics**: Login success/failure rates
- **Messaging Metrics**: Queue depth, processing rates (if enabled)

## 🚀 Deployment

### Docker Deployment

```bash
# Build production image
docker build -t blih-system-backend:latest .

# Run with environment file
docker run -p 5000:5000 --env-file .env.local blih-system-backend:latest

# Or use Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

### Production Considerations

- **Environment Management**: Use environment-specific configs
- **SSL/TLS**: Enable HTTPS termination
- **Database**: Configure connection pooling and read replicas
- **Monitoring**: Set up application and infrastructure monitoring
- **Backups**: Implement database and audit log backup strategies
- **Secrets Management**: Use proper secrets management (AWS Secrets Manager, etc.)
- **Scaling**: Horizontal scaling with load balancers
- **CI/CD**: Automated testing and deployment pipelines

## 🤝 Development Guidelines

### Code Standards

- **TypeScript**: Strict mode enabled, comprehensive typing
- **ESLint**: Configured with TypeScript rules and NestJS best practices
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks for code quality
- **Lint-staged**: Run linters on staged files

### Development Workflow

1. **Branch Strategy**: Feature branches from `main`
2. **Commits**: Conventional commit format
3. **Code Review**: Required for all changes
4. **Testing**: Comprehensive test coverage required
5. **Documentation**: Update docs for API changes

### Architecture Principles

- **Domain-Driven Design**: Clear domain boundaries
- **SOLID Principles**: Single responsibility, open/closed, etc.
- **Clean Architecture**: Separation of concerns
- **Event-Driven**: Loose coupling through events
- **Testability**: Dependency injection and mocking

### Module Structure

Each module follows this pattern:

```
module/
├── controllers/     # HTTP request handlers
├── services/        # Business logic
├── repositories/    # Data access layer
├── dto/            # Data transfer objects
├── entities/       # Database entities
├── events/         # Domain events
├── tests/          # Module tests
└── module.ts       # NestJS module definition
```

## 🛠️ Development Commands

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging
npm run start:prod         # Start production build

# Building
npm run build              # Build for production
npm run build:watch        # Build with watch mode

# Code Quality
npm run lint               # Run ESLint with auto-fix
npm run lint:check         # Check linting without fixes
npm run format             # Format code with Prettier
npm run typecheck          # TypeScript type checking

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev  # Run development migrations
npm run prisma:migrate:deploy # Deploy migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio

# Testing
npm run test               # Run unit tests
npm run test:integration   # Run integration tests
npm run test:e2e          # Run E2E tests
npm run test:cov          # Run with coverage
npm run test:watch        # Watch mode

# Validation
npm run validate:rbac-catalog  # Validate RBAC constants
npm run validate:branch-name  # Validate git branch names
npm run validate:commits      # Validate commit messages
npm run verify               # Run all validation checks
```

### Git Hooks

The project uses Husky for Git hooks:

- **Pre-commit**: Run linting and formatting
- **Pre-push**: Run tests and validation
- **Commit-msg**: Validate commit message format

## 📚 API Documentation

### Swagger/OpenAPI

Comprehensive API documentation available at `/api/docs`:

- **Interactive API Explorer**: Try endpoints directly
- **Schema Documentation**: Request/response models
- **Authentication Examples**: Bearer token examples
- **Error Responses**: Standardized error formats

### OpenAPI Specification

- **JSON**: `/api/docs/openapi.json`
- **YAML**: `/api/docs/openapi.yaml`

## 🔄 Version Management

### Semantic Versioning

The project follows semantic versioning:

- **Major**: Breaking changes
- **Minor**: New features, backward compatible
- **Patch**: Bug fixes, backward compatible

### Release Process

1. **Version Bump**: Update package.json version
2. **Changelog**: Update CHANGELOG.md
3. **Tag**: Create Git tag with version
4. **Release**: Deploy to production
5. **Documentation**: Update documentation

## 🆘 Troubleshooting

### Common Issues

**Database Connection Issues:**

```bash
# Check PostgreSQL status
docker compose -f docker-compose.yml logs postgres

# Reset database (development only)
npx prisma migrate reset
```

**Keycloak Issues:**

```bash
# Check Keycloak logs
docker compose -f docker-compose.yml logs keycloak

# Re-import realm
docker compose -f docker-compose.yml down keycloak
docker compose -f docker-compose.yml up -d keycloak
```

### Debug Mode

Enable verbose logging:

```bash
# Set environment variable
export VERBOSE_REQUEST_LOGGING=true

# Or in .env.local
VERBOSE_REQUEST_LOGGING=true

# Start with debug
npm run start:debug
```

## 📄 License

This project is licensed under the BLIH System License. See LICENSE file for details.

## 🤝 Contributing

### Contribution Guidelines

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes with tests
4. **Ensure** all tests pass and code quality checks pass
5. **Submit** a pull request with detailed description

### Code Review Process

- All changes require code review
- Automated checks must pass
- Documentation updates required for API changes
- Test coverage must be maintained or improved

## 📞 Support

For support and questions:

- **Documentation**: This README and inline code documentation
- **Issues**: Create GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Technical Support**: Contact the BLIH development team

---

**Built with ❤️ by the BLIH Development Team**
