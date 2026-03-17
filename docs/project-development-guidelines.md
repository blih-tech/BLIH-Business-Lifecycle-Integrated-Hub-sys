# Project Development Guidelines

## Overview

This document provides comprehensive development guidelines for the entire BLIH System project, covering monorepo management, team collaboration, and project-wide standards.

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Development Environment Setup](#development-environment-setup)
3. [Monorepo Management](#monorepo-management)
4. [Git Workflow](#git-workflow)
5. [Code Quality Standards](#code-quality-standards)
6. [Testing Strategy](#testing-strategy)
7. [Documentation Standards](#documentation-standards)
8. [Security Guidelines](#security-guidelines)
9. [Performance Guidelines](#performance-guidelines)
10. [Deployment Guidelines](#deployment-guidelines)
11. [Team Collaboration](#team-collaboration)
12. [Troubleshooting](#troubleshooting)

## Project Architecture

### Technology Stack Overview

```
BLIH System Monorepo
├── Backend (NestJS)
│   ├── TypeScript
│   ├── Prisma ORM
│   ├── PostgreSQL
│   ├── Keycloak (Auth)
│   └── RabbitMQ (Messaging)
├── Frontend (Next.js)
│   ├── TypeScript
│   ├── React 19
│   ├── CSS Modules
│   └── App Router
├── Shared Packages
│   ├── @repo/types (Type definitions)
│   ├── @repo/eslint-config (ESLint configs)
│   └── @repo/typescript-config (TS configs)
└── Infrastructure
    ├── Docker Compose
    ├── GitHub Actions
    └── Turborepo
```

### System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (NestJS)      │◄──►│  (PostgreSQL)   │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 5432    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Keycloak      │
                       │   (Auth)        │
                       │   Port: 8080    │
                       └─────────────────┘
```

## Development Environment Setup

### Prerequisites

- **Node.js**: >= 18.x
- **npm**: >= 10.9.2
- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **Git**: >= 2.x
- **VS Code** (recommended) with extensions:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - GitLens

### Initial Setup

1. **Clone Repository**

   ```bash
   git clone <repository-url>
   cd blih-system
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Backend environment
   cp apps/api/.env.example apps/api/.env

   # Frontend environment
   cp apps/web/.env.example apps/web/.env.local

   # Edit environment files with your configuration
   ```

4. **Start Infrastructure**

   ```bash
   npm run docker:api:up
   ```

5. **Database Setup**

   ```bash
   cd apps/api
   npm run prisma:migrate:dev
   npm run prisma:seed
   cd ../..
   ```

6. **Start Development**

   ```bash
   # Start all services
   npm run dev

   # Or start specific services
   npm run dev:api    # Backend only
   npm run dev:web    # Frontend only
   ```

### Development Commands

```bash
# Project-wide commands
npm run build              # Build all packages
npm run dev                # Start all in development
npm run lint               # Lint all packages
npm run test               # Test all packages
npm run check-types        # Type check all packages

# Backend-specific
npm run dev:api            # Start backend
npm run lint:api           # Lint backend
npm run test:api           # Test backend
npm run typecheck:api      # Type check backend

# Frontend-specific
npm run dev:web            # Start frontend
npm run lint:web           # Lint frontend
npm run test:web           # Test frontend
npm run check-types:web    # Type check frontend

# Infrastructure
npm run docker:api:up      # Start infrastructure
npm run docker:api:down    # Stop infrastructure
npm run docker:api:reset   # Reset infrastructure
```

## Monorepo Management

### Turborepo Configuration

The project uses Turborepo for efficient build orchestration:

```json
// turbo.json
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "inputs": ["$TURBO_DEFAULT$", ".env*"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "check-types": {
      "dependsOn": ["^check-types", "^build"]
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

### Package Management

1. **Shared Dependencies**

   ```json
   // package.json (root)
   {
     "workspaces": ["apps/*", "packages/*"]
   }
   ```

2. **Adding Dependencies**

   ```bash
   # Add to specific package
   npm install <package> --workspace=blih-system-backend
   npm install <package> --workspace=web

   # Add to all packages
   npm install <package> -w

   # Add dev dependency
   npm install <package> --save-dev --workspace=blih-system-backend
   ```

3. **Shared Packages**
   ```
   packages/
   ├── types/              # Shared TypeScript definitions
   ├── eslint-config/      # ESLint configurations
   └── typescript-config/  # TypeScript configurations
   ```

### Build Pipeline

1. **Dependency Graph**

   ```
   web (frontend)
   └── @repo/types

   api (backend)
   └── @repo/types

   @repo/eslint-config
   @repo/typescript-config
   ```

2. **Build Order**
   1. Shared packages build first
   2. Applications build after dependencies
   3. Tests run after builds
   4. Linting runs in parallel where possible

## Git Workflow

### Branch Strategy

1. **Main Branches**
   - `main`: Production-ready code
   - `develop`: Integration branch for features

2. **Feature Branches**
   - `feature/user-authentication`
   - `feature/dashboard-ui`
   - `fix/login-validation`

3. **Release Branches**
   - `release/v1.2.0`
   - `hotfix/critical-security-fix`

### Commit Message Convention

Follow Conventional Commits specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no functional changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add JWT token refresh mechanism
fix(api): resolve user profile update validation error
docs(readme): update installation instructions
test(user): add unit tests for user service
refactor(database): optimize query performance
```

### Pull Request Process

1. **PR Template**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   - [ ] Unit tests pass
   - [ ] Integration tests pass
   - [ ] Manual testing completed

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-review completed
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   ```

2. **PR Requirements**
   - All tests must pass
   - Code coverage must not decrease
   - Linting must pass
   - At least one approval required
   - PR description must be complete

3. **Merge Strategy**
   - Use squash merge for feature branches
   - Use merge commit for release branches
   - Never rebase main or develop

### Git Hooks

The project uses Husky for Git hooks:

```json
// package.json
{
  "scripts": {
    "prepare": "husky"
  }
}
```

**Available Hooks:**

- `pre-commit`: Run lint-staged
- `commit-msg`: Validate commit message
- `pre-push`: Run tests and type checking

## Code Quality Standards

### Linting Configuration

1. **ESLint Configuration**

   ```javascript
   // .eslintrc.js (root)
   module.exports = {
     extends: [
       '@repo/eslint-config/base.js',
       '@repo/eslint-config/next.js',
       '@repo/eslint-config/node.js',
     ],
   };
   ```

2. **Lint-staged Configuration**
   ```javascript
   // .lintstagedrc.cjs
   module.exports = {
     '*.{js,jsx,ts,tsx}': ['eslint --fix', 'prettier --write'],
     '*.{json,md,yml,yaml}': ['prettier --write'],
   };
   ```

### Code Formatting

1. **Prettier Configuration**

   ```json
   // .prettierrc
   {
     "semi": false,
     "trailingComma": "es5",
     "singleQuote": true,
     "printWidth": 80,
     "tabWidth": 2,
     "useTabs": false
   }
   ```

2. **EditorConfig**

   ```ini
   # .editorconfig
   root = true

   [*]
   indent_style = space
   indent_size = 2
   end_of_line = lf
   charset = utf-8
   trim_trailing_whitespace = true
   insert_final_newline = true
   ```

### TypeScript Standards

1. **Strict Configuration**

   ```json
   // tsconfig.json (base)
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true
     }
   }
   ```

2. **Type Definitions**

   ```typescript
   // packages/types/src/index.ts
   export interface User {
     id: string;
     name: string;
     email: string;
   }

   export interface ApiResponse<T> {
     data: T;
     success: boolean;
     message?: string;
   }
   ```

## Testing Strategy

### Testing Pyramid

```
        ┌─────────────────┐
        │   E2E Tests     │  ← Few, high-level
        └─────────────────┘
      ┌─────────────────────┐
      │  Integration Tests  │  ← Moderate number
      └─────────────────────┘
    ┌─────────────────────────┐
    │     Unit Tests          │  ← Many, fast
    └─────────────────────────┘
```

### Test Coverage Requirements

- **Backend**: Minimum 80% coverage
- **Frontend**: Minimum 70% coverage
- **Critical Business Logic**: 100% coverage

### Testing Tools

1. **Backend Testing**

   ```bash
   npm run test              # Unit tests
   npm run test:integration # Integration tests
   npm run test:e2e         # End-to-end tests
   npm run test:cov         # Coverage report
   ```

2. **Frontend Testing**
   ```bash
   npm run test              # Unit tests
   npm run test:e2e         # E2E tests (Playwright)
   npm run test:coverage    # Coverage report
   ```

### CI/CD Testing

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linting
        run: npm run lint

      - name: Run type checking
        run: npm run check-types

      - name: Run tests
        run: npm run test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

## Documentation Standards

### Documentation Structure

```
docs/
├── backend-development-guidelines.md
├── frontend-development-guidelines.md
├── project-development-guidelines.md
├── api/                     # API documentation
├── deployment/              # Deployment guides
├── architecture/            # Architecture docs
└── onboarding/             # New developer guides
```

### Documentation Requirements

1. **Code Documentation**

   ````typescript
   /**
    * Creates a new user in the system
    * @param userData - User creation data
    * @returns Promise resolving to created user
    * @throws {ValidationError} When validation fails
    * @example
    * ```typescript
    * const user = await userService.createUser({
    *   name: 'John Doe',
    *   email: 'john@example.com'
    * });
    * ```
    */
   async createUser(userData: CreateUserDto): Promise<User> {
     // Implementation
   }
   ````

2. **API Documentation**
   - Use OpenAPI/Swagger for backend APIs
   - Document all endpoints with examples
   - Include authentication requirements

3. **README Standards**
   Each package should have a README with:
   - Purpose and description
   - Installation instructions
   - Usage examples
   - API reference (if applicable)
   - Contributing guidelines

## Security Guidelines

### Security Best Practices

1. **Environment Variables**

   ```bash
   # Never commit secrets to version control
   # Use .env files for local development
   # Use CI/CD secrets for production

   # .env.example (committed)
   API_URL=
   JWT_SECRET=
   DATABASE_URL=
   ```

2. **Dependency Security**

   ```bash
   # Regular security audits
   npm audit
   npm audit fix

   # Automated security updates
   npm install -g npm-check-updates
   npx npm-check-updates -u
   ```

3. **Code Security**
   - No hardcoded secrets
   - Input validation on all inputs
   - Proper error handling (no information leakage)
   - HTTPS in production
   - Security headers implementation

### Security Tools

1. **ESLint Security Rules**

   ```javascript
   // .eslintrc.js
   module.exports = {
     extends: ['plugin:security/recommended'],
   };
   ```

2. **Dependency Scanning**

   ```yaml
   # .github/workflows/security.yml
   name: Security Scan
   on: [schedule, push]

   jobs:
     security:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Run security audit
           run: npm audit --audit-level moderate
   ```

## Performance Guidelines

### Performance Monitoring

1. **Backend Performance**
   - Response time monitoring
   - Database query optimization
   - Caching strategies
   - Memory usage monitoring

2. **Frontend Performance**
   - Core Web Vitals monitoring
   - Bundle size optimization
   - Image optimization
   - Lazy loading implementation

### Optimization Strategies

1. **Database Optimization**

   ```typescript
   // Use efficient queries
   const users = await this.prisma.user.findMany({
     include: { posts: true }, // Instead of N+1 queries
     take: 20,
     skip: (page - 1) * 20,
   });
   ```

2. **Frontend Optimization**

   ```typescript
   // Code splitting
   const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
     loading: () => <div>Loading...</div>,
   });

   // Image optimization
   <Image
     src="/image.jpg"
     alt="Description"
     width={500}
     height={300}
     priority
   />
   ```

## Deployment Guidelines

### Environment Management

1. **Development Environment**
   - Local development with Docker
   - Hot reload enabled
   - Debug mode enabled
   - Mock services for external dependencies

2. **Staging Environment**
   - Production-like setup
   - Automated testing
   - Performance monitoring
   - Data anonymization

3. **Production Environment**
   - High availability setup
   - Monitoring and alerting
   - Backup and recovery
   - Security hardening

### Deployment Process

1. **CI/CD Pipeline**

   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy
   on:
     push:
       branches: [main]

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Setup Node.js
           uses: actions/setup-node@v3
         - name: Install dependencies
           run: npm ci
         - name: Run tests
           run: npm run test
         - name: Build
           run: npm run build
         - name: Deploy
           run: npm run deploy:prod
   ```

2. **Rollback Strategy**
   - Blue-green deployment
   - Database migration rollback
   - Feature flags for gradual rollout
   - Monitoring for quick issue detection

## Team Collaboration

### Communication Channels

1. **Slack Channels**
   - `#development`: General development discussions
   - `#backend`: Backend-specific discussions
   - `#frontend`: Frontend-specific discussions
   - `#devops`: Infrastructure and deployment
   - `#code-review`: PR reviews and discussions

2. **Meeting Schedule**
   - **Daily Standup**: 15 minutes, development progress
   - **Sprint Planning**: Bi-weekly, upcoming work planning
   - **Retrospective**: Bi-weekly, process improvement
   - **Architecture Review**: Monthly, technical decisions

### Code Review Process

1. **Review Guidelines**
   - Check for functionality and correctness
   - Verify code quality and style
   - Ensure test coverage
   - Check security implications
   - Verify documentation

2. **Review Checklist**
   - [ ] Code follows project standards
   - [ ] Tests are comprehensive
   - [ ] Documentation is updated
   - [ ] Performance considerations addressed
   - [ ] Security implications considered
   - [ ] No breaking changes (or documented)

### Onboarding Process

1. **New Developer Setup**

   ```bash
   # 1. Repository access and setup
   git clone <repository>
   cd blih-system

   # 2. Environment setup
   npm install
   npm run docker:api:up

   # 3. Database setup
   cd apps/api
   npm run prisma:migrate:dev
   npm run prisma:seed

   # 4. Start development
   cd ../..
   npm run dev
   ```

2. **Knowledge Transfer**
   - Architecture overview session
   - Codebase walkthrough
   - Development environment setup
   - First task assignment with mentorship

## Troubleshooting

### Common Issues

1. **Docker Issues**

   ```bash
   # Container won't start
   docker logs <container-name>
   docker-compose down -v
   docker-compose up -d

   # Port conflicts
   lsof -i :5432  # Check what's using the port
   docker-compose down  # Stop services
   ```

2. **Dependency Issues**

   ```bash
   # Clean install
   rm -rf node_modules package-lock.json
   npm install

   # Clear Turborepo cache
   npx turbo clean
   ```

3. **Database Issues**

   ```bash
   # Reset database
   npm run db:reset

   # Check migrations
   npx prisma migrate status
   npx prisma migrate deploy
   ```

### Debugging Tools

1. **Backend Debugging**

   ```typescript
   // Enable debug logging
   process.env.DEBUG = 'app:*';

   // Use VS Code debugger
   // .vscode/launch.json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug NestJS",
     "program": "${workspaceFolder}/apps/api/src/main.ts",
     "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"]
   }
   ```

2. **Frontend Debugging**
   - React Developer Tools
   - Redux DevTools (if using Redux)
   - Chrome DevTools Performance tab
   - Network tab for API debugging

### Performance Issues

1. **Backend Performance**

   ```bash
   # Profile Node.js application
   node --prof apps/api/dist/main.js
   node --prof-process isolate-*.log > processed.txt

   # Database query analysis
   npx prisma studio
   EXPLAIN ANALYZE <query>;
   ```

2. **Frontend Performance**
   - Lighthouse audits
   - Bundle analyzer
   - Performance monitoring tools
   - Memory leak detection

## Best Practices Summary

### Do's

- ✅ Follow commit message conventions
- ✅ Write comprehensive tests
- ✅ Document code and APIs
- ✅ Use TypeScript strictly
- ✅ Follow security best practices
- ✅ Optimize for performance
- ✅ Participate in code reviews
- ✅ Keep dependencies updated
- ✅ Use meaningful variable names
- ✅ Handle errors gracefully

### Don'ts

- ❌ Commit secrets to version control
- ❌ Skip testing
- ❌ Ignore security vulnerabilities
- ❌ Create overly complex code
- ❌ Skip documentation
- ❌ Ignore performance issues
- ❌ Merge without review
- ❌ Use hardcoded configurations
- ❌ Ignore accessibility
- ❌ Break backward compatibility without notice

## Resources

### Documentation

- [Backend Guidelines](./backend-development-guidelines.md)
- [Frontend Guidelines](./frontend-development-guidelines.md)
- [API Documentation](./api/)
- [Deployment Guides](./deployment/)

### Tools and Libraries

- [NestJS Documentation](https://docs.nestjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Turborepo Documentation](https://turbo.build/repo/docs)

### External Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

This document is a living guide. Please contribute to keeping it updated with the latest best practices and project-specific conventions.
