# BLIH System Architecture Documentation

## Overview

The BLIH System is a **modular monolithic NestJS application** designed with clean architecture principles, ready to evolve into microservices. The system follows domain-driven design patterns with clear separation of concerns, serving as the central platform for the BLIH ecosystem.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    BLIH System                              │
│                  (NestJS Backend)                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Core      │ │  Domains    │ │    Platform        │   │
│  │   Modules   │ │   Modules   │ │    Infrastructure   │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │    Shared   │ │   Config    │ │      Jobs           │   │
│  │ Components  │ │ Management  │ │   (Background)      │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                    Infrastructure Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐   │
│  │   Prisma    │ │  Keycloak   │ │    PostgreSQL       │   │
│  │    ORM      │ │   Auth      │ │     Database        │   │
│  └─────────────┘ └─────────────┘ └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Monorepo Structure

The project uses **Turborepo** for monorepo management with the following structure:

```
blih-system/
├── apps/
│   ├── api/                    # Main NestJS backend application
│   ├── web/                    # Next.js frontend application
│   └── rag-service/           # RAG (Retrieval-Augmented Generation) service
├── packages/
│   ├── types/                 # Shared TypeScript type definitions
│   ├── eslint-config/        # ESLint configurations
│   └── typescript-config/     # TypeScript configurations
└── docs/                      # Documentation files
```

## Technology Stack

### Backend Framework

- **NestJS**: Progressive Node.js framework for building efficient, scalable applications
- **TypeScript**: Static type checking for enhanced developer experience
- **Prisma**: Next-generation ORM for database management
- **PostgreSQL**: Primary database for persistent storage

### Authentication & Authorization

- **Keycloak**: Open-source identity and access management solution
- **JWT**: JSON Web Tokens for stateless authentication
- **RBAC**: Role-Based Access Control for fine-grained permissions

### Development Tools

- **Turborepo**: High-performance build system for monorepos
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **Jest**: Testing framework
- **Docker**: Containerization for deployment

### API Documentation

- **Swagger/OpenAPI**: Interactive API documentation
- **NestJS Swagger**: Automatic API documentation generation

## Architectural Principles

### 1. Clean Architecture

The system follows clean architecture principles with clear separation between:

- **Core Business Logic**: Domain-specific rules and business processes
- **Application Services**: Use cases and application-specific logic
- **Infrastructure**: External dependencies and technical concerns
- **Presentation**: API controllers and request/response handling

### 2. Domain-Driven Design (DDD)

- **Bounded Contexts**: Each domain module represents a bounded context
- **Ubiquitous Language**: Consistent terminology across domains
- **Domain Models**: Rich domain models with business logic
- **Repositories**: Data access abstraction layer

### 3. Modular Design

- **Loose Coupling**: Modules depend on abstractions, not concrete implementations
- **High Cohesion**: Related functionality grouped together
- **Single Responsibility**: Each module has a single, well-defined purpose
- **Open/Closed Principle**: Open for extension, closed for modification

### 4. Dependency Injection

- **Inversion of Control**: Dependencies are injected rather than created
- **Provider Pattern**: Services registered as providers in NestJS modules
- **Module Dependencies**: Clear dependency hierarchy between modules

## Module Architecture

### Core Modules

Core modules provide essential platform services:

- **Auth Module**: Authentication, JWT management, token validation
- **RBAC Module**: Role-based access control, permissions management
- **Users Module**: User management, profiles, preferences
- **Audit Module**: Comprehensive audit logging and compliance
- **Notifications Module**: Multi-channel notification system
- **System Config Module**: Governance, policies, configuration management
- **Health Module**: Application health monitoring and diagnostics

### Domain Modules

Domain modules represent business-specific functionality:

- **AI Module**: AI services, machine learning integration
- **Brain Module**: Knowledge base, cognitive services
- **Chatbot Module**: AI-powered conversational interfaces
- **CRM Module**: Customer relationship management
- **Finance Module**: Financial management, accounting
- **HR Module**: Human resources management
- **Project Module**: Project management and collaboration

### Platform Modules

Platform modules provide infrastructure support:

- **Prisma Module**: Database ORM, migrations, connection management
- **Keycloak Module**: Identity provider integration, user federation
- **Messaging Module**: Message broker integration, event handling

## Request Lifecycle

### 1. Request Reception

```
Client Request → Middleware → Guards → Interceptors → Controller
```

### 2. Authentication & Authorization

```
Request → Correlation ID → Keycloak Auth → RBAC Check → Resource Access
```

### 3. Business Logic Processing

```
Controller → Use Case → Domain Service → Repository → Database
```

### 4. Response Generation

```
Database → Repository → Domain Service → Use Case → Interceptors → Response
```

## Security Architecture

### Authentication Flow

1. **Client Authentication**: JWT token validation via Keycloak
2. **Token Verification**: Signature and expiration checks
3. **User Context**: User information extraction and caching
4. **Session Management**: Active session tracking

### Authorization Flow

1. **Permission Extraction**: User roles and permissions from token
2. **Resource Access**: RBAC evaluation against requested resource
3. **Action Validation**: Specific action permission verification
4. **Audit Logging**: All access attempts logged for compliance

### Data Protection

- **Encryption**: Sensitive data encryption at rest and in transit
- **Input Validation**: Comprehensive input sanitization and validation
- **SQL Injection Prevention**: Parameterized queries via Prisma ORM
- **XSS Protection**: Output encoding and Content Security Policy

## Scalability Considerations

### Horizontal Scaling

- **Stateless Design**: JWT tokens enable stateless scaling
- **Database Connection Pooling**: Efficient database resource management
- **Caching Strategy**: Redis integration for session and data caching
- **Load Balancing**: Ready for horizontal scaling behind load balancers

### Microservices Evolution

- **Module Boundaries**: Clear module boundaries for future extraction
- **API Contracts**: Well-defined interfaces between modules
- **Event-Driven Architecture**: Ready for event-driven communication
- **Database per Service**: Prisma schema designed for future separation

## Monitoring & Observability

### Logging Strategy

- **Structured Logging**: JSON-formatted logs with correlation IDs
- **Log Levels**: Debug, Info, Warn, Error with appropriate filtering
- **Audit Trail**: Comprehensive audit logging for compliance
- **Performance Metrics**: Request timing and resource utilization

### Health Monitoring

- **Health Checks**: Database, external service, and application health
- **Metrics Collection**: Application performance metrics
- **Alerting**: Automated alerts for critical failures
- **Distributed Tracing**: Request tracing across module boundaries

## Development Workflow

### Local Development

1. **Environment Setup**: Docker Compose for local infrastructure
2. **Database Migrations**: Prisma migration workflow
3. **Seed Data**: Automated database seeding for development
4. **Hot Reload**: Development server with automatic reloading

### Testing Strategy

- **Unit Tests**: Jest-based unit testing with high coverage
- **Integration Tests**: Database and external service integration
- **E2E Tests**: End-to-end API testing
- **Contract Tests**: API contract validation

### Code Quality

- **TypeScript**: Static type checking and IDE support
- **ESLint**: Code quality and style enforcement
- **Prettier**: Consistent code formatting
- **Pre-commit Hooks**: Automated code quality checks

This architecture provides a solid foundation for the BLIH System, balancing current needs with future scalability requirements while maintaining clean code principles and developer productivity.
