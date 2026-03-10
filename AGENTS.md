# AGENTS.md - BLIH System Development Guide

This file provides guidance for AI agents working in this codebase.

## Project Overview

A monorepo containing:

- **Backend**: NestJS with TypeScript, Prisma ORM, PostgreSQL, Keycloak auth
- **Frontend**: Next.js 16 with React 19, TypeScript, CSS Modules
- **Shared**: `@repo/types`, `@repo/eslint-config`, `@repo/typescript-config`

## Build/Lint/Test Commands

### Root Commands

```bash
npm run build              # Build all packages
npm run dev                # Start all in development
npm run lint               # Lint all packages
npm run test               # Test all packages
npm run test:ci            # CI mode tests (passWithNoTests)
npm run check-types        # Type check all packages
npm run verify             # lint + check-types
npm run verify:full        # lint + check-types + test:ci
npm run format             # Format all files with Prettier
```

### API Commands (apps/api/)

```bash
npm run dev                # Start with hot reload
npm run build              # Build for production
npm run lint               # Lint with ESLint
npm run lint:fix           # Lint + auto-fix
npm run lint:check         # lint + validate:rbac-catalog
npm run typecheck          # TypeScript check (tsc --noEmit)
npm run check-types        # typecheck + prisma generate

# Testing
npm run test               # Run all unit tests
npm run test:watch         # Watch mode
npm run test:cov           # With coverage
npm run test:integration   # Integration tests
npm run test:e2e           # E2E tests

# Run a single test file
npx jest path/to/file.spec.ts

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate:dev # Run migrations
npm run prisma:seed        # Seed database
```

### Web Commands (apps/web/)

```bash
npm run dev                # Start on port 3000
npm run build              # Build for production
npm run lint               # ESLint
npm run check-types        # TypeScript check
```

## Code Style Guidelines

### TypeScript

- **Strict mode**: Always enabled. Never use `any` unless absolutely necessary
- **Type definitions**: Use interfaces for objects, types for unions/primitives
- **Explicit types**: Include return types on functions, especially exported ones

### Naming Conventions

- **Files**: kebab-case (`user.service.ts`, `create-user.dto.ts`)
- **Classes/Interfaces**: PascalCase (`UserService`, `CreateUserDto`)
- **Variables/Functions**: camelCase (`getUser`, `userList`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`)
- **Tests**: `*.spec.ts` or `*.test.ts` suffix

### Import Order (Backend - NestJS)

```typescript
// 1. NestJS/External frameworks
import { Controller, Get, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// 2. Shared decorators/guards (relative paths)
import { Audit } from '../../shared/decorators/audit.decorator';

// 3. Config/constants
import { UserPermissions } from '../rbac/constants/permissions.constants';

// 4. Local DTOs
import { CreateUserDto } from './dto/create-user.dto';

// 5. Use cases
import { CreateUserUseCase } from './use-cases/create-user.usecase';
```

### Import Order (Frontend - React/Next.js)

```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react';

// 2. Third-party libraries
import axios from 'axios';

// 3. Internal imports (use @ aliases)
import { User } from '@/types';
import { Button } from '@/components/ui';

// 4. Relative imports
import styles from './Component.module.css';
```

### Component Structure (Backend)

```typescript
@Controller('users')
@UseGuards(KeycloakAuthGuard, RbacGuard)
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  @Roles(UserPermissions.CREATE)
  @Audit('user.create', 'system.user')
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }
}
```

### Component Structure (Frontend)

```typescript
interface ComponentProps {
  title: string;
  onSubmit: () => void;
}

export const Component: React.FC<ComponentProps> = ({ title, onSubmit }) => {
  const [loading, setLoading] = useState(false);

  if (loading) return <Spinner />;

  return <div>{title}</div>;
};
```

### Error Handling

- **Backend**: Use NestJS exceptions (`NotFoundException`, `BadRequestException`)
- **Frontend**: Display user-friendly error messages, log errors for debugging
- **Never expose internal error details to users**

### Module Boundaries (Critical)

Domain modules (`hr`, `crm`, `finance`, `project`, `brain`, `chatbot`, `ai`) **MUST NOT** import from each other. Use `EventBusService` for cross-module communication:

```typescript
await this.eventBus.publish({
  type: 'hr.employee.hired',
  payload: { employeeId },
  metadata: { version: '1.0' },
});
```

### Database (Prisma)

- Always use Prisma client for database operations
- Run `prisma:generate` after schema changes
- Use transactions for multi-step operations

### Git Conventions

- Follow Conventional Commits: `feat(api): add user endpoint`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pre-commit Hooks

Runs automatically: branch validation, lint-staged, `npm run verify`

### Database Docker

```bash
npm run docker:api:infra:up        # Start API infrastructure
npm run docker:api:infra:status    # Check status
npm run docker:api:infra:logs      # View logs
npm run docker:api:infra:reset     # Reset (removes volumes)
```

## Documentation

- API docs: Swagger at `/api/docs` when running locally
- Architecture docs: `docs/core/`
- Module docs: `docs/modules/`
