# BLIH Backend Repository Structure Recommendation

## Executive Summary

Based on the documentation analysis, the BLIH system consists of **7 main services** that will be organized in a **single backend repository** using **Nx** for optimal development experience and internal code sharing.

## Current System Architecture

The BLIH system includes:

1. **Core Platform** - Authentication, Audit, Events, Notifications
2. **HR Module** - Complete HR management system
3. **CRM Module** - Customer Relationship Management
4. **Finance Module** - Financial management (PostgreSQL)
5. **Projects Module** - Project execution and management
6. **Brain Module** - AI knowledge management with RAG
7. **Chatbot Module** - AI-powered assistance
8. **Keycloak Integration** - Identity and access management

## Recommended Backend Repository Structure

### **Backend Repository (`blih-backend`)**

```
blih-backend/
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy.yml
│       └── security.yml
├── docs/                           # Backend documentation
│   ├── README.md
│   ├── api/
│   ├── architecture/
│   └── deployment/
├── tools/                          # Backend development tools
│   ├── eslint-config/
│   ├── prettier-config/
│   ├── tsconfig-base.json
│   ├── jest-config/
│   └── docker/
├── packages/                       # Backend shared libraries
│   ├── shared-types/               # TypeScript interfaces
│   ├── shared-utils/               # Common utilities
│   ├── shared-auth/                # Authentication logic
│   ├── shared-audit/               # Audit logging
│   ├── shared-events/              # Event definitions
│   ├── shared-testing/             # Test utilities
│   └── shared-persistence/         # Database abstractions
├── apps/                           # Backend services
│   ├── api-gateway/                # NestJS API Gateway
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── guards/
│   │   │   │   ├── interceptors/
│   │   │   │   ├── pipes/
│   │   │   │   └── decorators/
│   │   │   ├── config/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── audit/
│   │   │   │   ├── events/
│   │   │   │   └── permissions/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   ├── hr-service/                 # HR Microservice
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── employees/
│   │   │   │   ├── attendance/
│   │   │   │   ├── leave/
│   │   │   │   ├── payroll/
│   │   │   │   ├── recruitment/
│   │   │   │   ├── performance/
│   │   │   │   ├── training/
│   │   │   │   ├── announcements/
│   │   │   │   ├── documents/
│   │   │   │   ├── org-chart/
│   │   │   │   ├── reports/
│   │   │   │   └── notifications/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   ├── messaging/
│   │   │   │   └── keycloak/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   ├── crm-service/                # CRM Microservice
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── leads/
│   │   │   │   ├── contacts/
│   │   │   │   ├── deals/
│   │   │   │   ├── accounts/
│   │   │   │   ├── activities/
│   │   │   │   ├── campaigns/
│   │   │   │   └── analytics/
│   │   │   ├── infrastructure/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   ├── finance-service/            # Finance Microservice (PostgreSQL)
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── chart-of-accounts/
│   │   │   │   ├── ledger/
│   │   │   │   ├── payroll/
│   │   │   │   ├── invoicing/
│   │   │   │   ├── expenses/
│   │   │   │   ├── tax/
│   │   │   │   └── reports/
│   │   │   ├── infrastructure/
│   │   │   │   ├── persistence/
│   │   │   │   │   ├── entities/
│   │   │   │   │   ├── migrations/
│   │   │   │   │   └── seeders/
│   │   │   │   └── messaging/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   ├── projects-service/           # Projects Microservice
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   ├── milestones/
│   │   │   │   ├── resources/
│   │   │   │   ├── timesheets/
│   │   │   │   ├── risks-issues/
│   │   │   │   └── reports/
│   │   │   ├── infrastructure/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   ├── brain-service/              # AI Knowledge Service
│   │   ├── package.json
│   │   ├── nest-cli.json
│   │   ├── Dockerfile
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── llm.config.ts
│   │   │   │   ├── qdrant.config.ts
│   │   │   │   └── rabbitmq.config.ts
│   │   │   ├── features/
│   │   │   │   ├── sops/
│   │   │   │   ├── decisions/
│   │   │   │   ├── lessons-learned/
│   │   │   │   ├── insights/
│   │   │   │   ├── risk-register/
│   │   │   │   ├── capa/
│   │   │   │   ├── management-review/
│   │   │   │   ├── org-reference/
│   │   │   │   └── search/
│   │   │   ├── infrastructure/
│   │   │   │   ├── qdrant/
│   │   │   │   ├── llm/
│   │   │   │   └── messaging/
│   │   │   └── test/
│   │   └── .env.example
│   │
│   └── chatbot-service/            # AI Chatbot Service
│       ├── package.json
│       ├── nest-cli.json
│       ├── Dockerfile
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── config/
│       │   ├── features/
│       │   │   ├── chat/
│       │   │   ├── rag/
│       │   │   ├── llm/
│       │   │   └── safety/
│       │   ├── infrastructure/
│       │   └── test/
│       └── .env.example
│
├── infrastructure/                 # Infrastructure as Code
│   ├── docker/
│   │   ├── keycloak/
│   │   │   ├── Dockerfile
│   │   │   ├── realm-export.json
│   │   │   └── themes/
│   │   ├── postgres/
│   │   ├── mongodb/
│   │   ├── qdrant/
│   │   ├── rabbitmq/
│   │   └── nginx/
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── configmaps/
│   │   ├── secrets/
│   │   ├── deployments/
│   │   ├── services/
│   │   └── ingress/
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── modules/
│   └── monitoring/
│       ├── prometheus/
│       ├── grafana/
│       └── elk/
│
├── nx.json                         # Nx configuration
├── package.json                    # Root package.json
├── tsconfig.base.json             # Base TypeScript config
├── .eslintrc.json                 # Root ESLint config
├── .prettierrc                    # Prettier config
├── jest.config.js                 # Jest config
├── docker-compose.yml            # Development environment
├── docker-compose.prod.yml        # Production environment
└── README.md                      # Backend README
```

### **Repository 3: Shared Packages (`blih-shared`)**

```
blih-shared/
├── .gitignore
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── publish.yml
├── packages/
│   ├── types/                      # TypeScript interfaces
│   ├── utils/                      # Common utilities
│   ├── auth/                       # Authentication logic
│   ├── audit/                      # Audit logging
│   ├── events/                     # Event definitions
│   └── testing/                    # Test utilities
├── package.json                    # Root package.json
├── lerna.json                      # Lerna configuration for publishing
└── README.md
```

### **Repository 4: Infrastructure (`blih-infrastructure`)**

```
blih-infrastructure/
├── .gitignore
├── docker/
│   ├── keycloak/
│   ├── postgres/
│   ├── mongodb/
│   ├── qdrant/
│   ├── rabbitmq/
│   └── nginx/
├── kubernetes/
├── terraform/
├── ansible/
├── monitoring/
├── docker-compose.yml
└── README.md
```

### **Repository 5: Documentation (`blih-docs`)**

```
blih-docs/
├── docs/
│   ├── architecture/
│   ├── api/
│   ├── deployment/
│   ├── user-guides/
│   └── development/
├── mkdocs.yml
└── README.md
```

## Repository Overview

| Repository            | Purpose          | Technology                    | Published Packages                                                             |
| --------------------- | ---------------- | ----------------------------- | ------------------------------------------------------------------------------ |
| `blih-frontend`       | User interface   | Next.js 16, React, Tailwind   | None                                                                           |
| `blih-backend`        | Backend services | NestJS, Node.js, TypeScript   | None                                                                           |
| `blih-shared`         | Shared libraries | TypeScript, Node.js           | @blih/types, @blih/utils, @blih/auth, @blih/audit, @blih/events, @blih/testing |
| `blih-infrastructure` | Infrastructure   | Docker, Kubernetes, Terraform | None                                                                           |
| `blih-docs`           | Documentation    | MkDocs, Markdown              | None                                                                           |

## Key Benefits of This Structure

### 1. **Code Sharing & Reusability**

- **Shared packages** for common functionality (auth, audit, events)
- **Type safety** across all services with shared TypeScript types
- **Consistent UI components** across the frontend
- **Common utilities** and business logic

### 2. **Unified Development Experience**

- **Single command** to start all services
- **Consistent linting** and formatting across all projects
- **Shared testing setup** and utilities
- **Unified CI/CD pipeline**

### 3. **Dependency Management**

- **Centralized dependency** management
- **Version consistency** across all services
- **Easy updates** with automated tools

### 4. **Scalability**

- **Independent deployments** for each service
- **Microservice architecture** with monorepo benefits
- **Clear module boundaries** and ownership

## Recommended Tooling

### **Nx (Recommended)**

```json
{
  "extends": "@nx/workspace/presets/npm.json",
  "tasksRunnerOptions": {
    "default": {
      "runner": "@nx/workspace/tasks-runners/default",
      "options": {
        "cacheableOperations": ["build", "test", "lint"]
      }
    }
  },
  "targetDefaults": {
    "build": {
      "dependsOn": ["^build"],
      "cache": true
    },
    "test": {
      "cache": true
    },
    "lint": {
      "cache": true
    }
  }
}
```

### **Alternative: Turborepo**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

## Development Workflow

### **1. Setup**

```bash
# Install dependencies
npm install

# Start all services in development
npm run dev

# Start specific service
nx serve hr-service
```

### **2. Building**

```bash
# Build all affected projects
nx affected --target=build

# Build specific service
nx build finance-service
```

### **3. Testing**

```bash
# Run all tests
nx test

# Run tests for specific service
nx test hr-service

# Run e2e tests
nx e2e frontend-e2e
```

### **4. Linting**

```bash
# Lint all projects
nx lint

# Lint specific service
nx lint crm-service
```

## Migration Strategy

### **Phase 1: Foundation**

1. Set up monorepo structure with Nx
2. Create shared packages (types, utils, auth)
3. Migrate frontend to monorepo

### **Phase 2: Service Migration**

1. Migrate API Gateway
2. Migrate HR service (most complex)
3. Migrate other services one by one

### **Phase 3: Infrastructure**

1. Set up unified Docker Compose
2. Configure CI/CD pipeline
3. Set up monitoring and logging

### **Phase 4: Optimization**

1. Implement caching strategies
2. Optimize build times
3. Set up automated dependency updates

## Configuration Examples

### **Root package.json**

```json
{
  "name": "blih-monorepo",
  "private": true,
  "workspaces": ["packages/*", "apps/*"],
  "scripts": {
    "dev": "nx run-many --target=dev --all --parallel",
    "build": "nx run-many --target=build --all --parallel",
    "test": "nx run-many --target=test --all --parallel",
    "lint": "nx run-many --target=lint --all --parallel",
    "docker:dev": "docker-compose -f docker-compose.dev.yml up",
    "docker:prod": "docker-compose -f docker-compose.prod.yml up"
  },
  "devDependencies": {
    "@nx/workspace": "^17.0.0",
    "@nx/node": "^17.0.0",
    "@nx/next": "^17.0.0",
    "@nx/nest": "^17.0.0",
    "typescript": "^5.0.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "jest": "^29.0.0"
  }
}
```

### **Docker Compose Development**

```yaml
version: "3.8"
services:
  # Infrastructure Services
  mongodb:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: blih_finance
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"
    volumes:
      - qdrant_data:/qdrant/storage

  rabbitmq:
    image: rabbitmq:3-management
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: password

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: password
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: postgres
      KC_DB_PASSWORD: password
    depends_on:
      - postgres

  # Application Services
  api-gateway:
    build:
      context: ./apps/api-gateway
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:password@mongodb:27017/blih_core?authSource=admin
      RABBITMQ_URI: amqp://admin:password@rabbitmq:5672
      KEYCLOAK_URL: http://keycloak:8080
    depends_on:
      - mongodb
      - rabbitmq
      - keycloak

  hr-service:
    build:
      context: ./apps/hr-service
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: development
      MONGODB_URI: mongodb://admin:password@mongodb:27017/blih_hr?authSource=admin
      RABBITMQ_URI: amqp://admin:password@rabbitmq:5672
    depends_on:
      - mongodb
      - rabbitmq

  frontend:
    build:
      context: ./apps/frontend
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3000
      NEXT_PUBLIC_KEYCLOAK_URL: http://localhost:8080
    depends_on:
      - api-gateway
      - keycloak

volumes:
  mongodb_data:
  postgres_data:
  qdrant_data:
```

## Next Steps

1. **Choose monorepo tool** (Nx recommended for NestJS ecosystem)
2. **Set up foundation** with shared packages
3. **Migrate services incrementally**
4. **Implement CI/CD pipeline**
5. **Set up monitoring and observability**

This structure provides the best balance of monorepo benefits while maintaining service autonomy and scalability.
