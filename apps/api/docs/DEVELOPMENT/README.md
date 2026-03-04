# BLIH System Development Guide

## Overview

This guide provides comprehensive information for developers working on the BLIH System, including setup instructions, development workflows, testing strategies, and best practices.

## Prerequisites

### System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 10.9.2 or higher
- **Docker**: Latest version for local development
- **Docker Compose**: For infrastructure services
- **Git**: For version control

### Development Tools

- **IDE**: Visual Studio Code (recommended)
- **Extensions**:
  - TypeScript and JavaScript Language Features
  - ESLint
  - Prettier
  - Docker
  - Prisma

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/blih-tech/blih-system.git
cd blih-system
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies
npm install

# Or install for specific workspace
npm install --workspace blih-system-backend
npm install --workspace @repo/types
```

### 3. Environment Configuration

#### Backend Environment

```bash
# Copy environment template
cp apps/api/.env.example apps/api/.env.local

# Edit environment variables
nano apps/api/.env.local
```

#### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/blih-system-dev"

# Keycloak Configuration
KEYCLOAK_REALM="blih"
KEYCLOAK_CLIENT_ID="blih-backend"
KEYCLOAK_CLIENT_SECRET="your-client-secret"
KEYCLOAK_URL="http://localhost:8080"

# JWT Configuration
JWT_SECRET="your-jwt-secret"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# API Configuration
API_PREFIX="api/v1"
PORT="5000"
API_HOST="localhost"
CORS_ORIGIN="*"
SWAGGER_ENABLED="true"

# Notification Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### 4. Database Setup

#### Start Database Services

```bash
# Start PostgreSQL and Keycloak
npm run docker:api:infra:up

# Check service status
npm run docker:api:infra:status
```

#### Run Database Migrations

```bash
cd apps/api

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate:dev

# Seed database (optional)
npm run prisma:seed
```

### 5. Start Development Server

```bash
# Start all services in development mode
npm run dev

# Or start only the API
npm run dev:api
```

The API will be available at `http://localhost:5000`
Swagger documentation at `http://localhost:5000/api/docs`

## Development Workflow

### Branch Strategy

The project follows GitFlow with these main branches:

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/\***: Feature branches
- **hotfix/\***: Critical fixes
- **release/\***: Release preparation

### Creating a Feature Branch

```bash
# Create and checkout feature branch
git checkout -b feature/user-management

# Make changes and commit
git add .
git commit -m "feat: add user management functionality"

# Push to remote
git push origin feature/user-management
```

### Commit Message Convention

Follow conventional commits format:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions
- `chore`: Maintenance tasks

**Examples:**

```bash
feat(auth): add JWT token refresh mechanism
fix(users): resolve email validation issue
docs(api): update authentication endpoints
```

### Code Quality Checks

#### Pre-commit Hooks

The project uses Husky for pre-commit hooks:

```bash
# Lint and format code
npm run lint:fix

# Type checking
npm run typecheck

# Run tests
npm run test
```

#### Manual Quality Checks

```bash
# Lint all packages
npm run lint

# Type check all packages
npm run check-types

# Run all tests
npm run test:ci

# Full verification
npm run verify:full
```

## Architecture Understanding

### Module Structure

```
src/
├── config/              # Environment configuration
├── core/                # Core platform services
│   ├── audit/           # Audit logging
│   ├── auth/            # Authentication
│   ├── rbac/            # Role-based access control
│   ├── users/           # User management
│   └── notifications/   # Notification system
├── domains/             # Business domains
│   ├── crm/             # Customer management
│   ├── finance/         # Financial management
│   ├── hr/              # Human resources
│   └── project/         # Project management
├── platform/            # Infrastructure
│   ├── prisma/          # Database ORM
│   └── keycloak/        # Identity provider
└── shared/              # Shared utilities
    ├── guards/          # Authentication guards
    ├── interceptors/     # Request/response interceptors
    └── decorators/      # Custom decorators
```

### Design Patterns

#### Clean Architecture

- **Controllers**: Handle HTTP requests/responses
- **Use Cases**: Business logic implementation
- **Services**: Domain-specific operations
- **Repositories**: Data access abstraction

#### Dependency Injection

```typescript
// Service registration in module
@Module({
  providers: [
    UsersService,
    {
      provide: 'USERS_REPOSITORY',
      useClass: UsersRepository,
    },
  ],
})
export class UsersModule {}
```

#### Interceptors for Cross-Cutting Concerns

```typescript
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // Audit logging logic
    return next.handle();
  }
}
```

## Testing Strategy

### Test Structure

```
src/
├── **/*.spec.ts          # Unit tests
├── **/*.e2e-spec.ts     # End-to-end tests
└── test/                 # Integration tests
    ├── integration/
    └── e2e/
```

### Unit Testing

#### Example Service Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from '../repositories/users.repository';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UsersRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: 'USERS_REPOSITORY',
          useValue: {
            create: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get('USERS_REPOSITORY');
  });

  it('should create a user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
    };

    repository.create.mockResolvedValue({ id: '1', ...userData });

    const result = await service.create(userData);

    expect(result).toEqual({ id: '1', ...userData });
    expect(repository.create).toHaveBeenCalledWith(userData);
  });
});
```

#### Controller Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get(UsersService);
  });

  it('should create a user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
    };

    service.create.mockResolvedValue({ id: '1', ...userData });

    const result = await controller.create(userData);

    expect(result).toEqual({ id: '1', ...userData });
    expect(service.create).toHaveBeenCalledWith(userData);
  });
});
```

### Integration Testing

#### Database Integration

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../platform/prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService Integration', () => {
  let module: TestingModule;
  let service: UsersService;
  let prisma: PrismaService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create and retrieve user from database', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
    };

    const created = await service.create(userData);
    const found = await service.findOne(created.id);

    expect(found).toEqual(created);
    expect(found.username).toBe(userData.username);
  });
});
```

### End-to-End Testing

#### API E2E Test

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Users API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/users (POST)', () => {
    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
      })
      .expect(201)
      .expect((res) => {
        expect(res.body.data.username).toBe('testuser');
        expect(res.body.data.email).toBe('test@example.com');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

## Database Development

### Prisma Workflow

#### Schema Management

```prisma
// prisma/schema.prisma
model User {
  id          String   @id @default(cuid())
  username    String   @unique
  email       String   @unique
  firstName   String?
  lastName    String?
  status      UserStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("users")
}

enum UserStatus {
  ACTIVE
  DISABLED
  PENDING
}
```

#### Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name add-user-status

# Apply migrations to database
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# View database
npx prisma studio
```

#### Database Seeding

```typescript
// src/platform/prisma/prisma.seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'System administrator',
    },
  });

  // Create default permissions
  const userReadPermission = await prisma.permission.upsert({
    where: { name: 'users:read' },
    update: {},
    create: {
      name: 'users:read',
      resource: 'users',
      action: 'read',
      description: 'Read user information',
    },
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Query Optimization

#### Efficient Queries

```typescript
// Good: Use select for specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    email: true,
  },
});

// Good: Use include for relations
const userWithRoles = await prisma.user.findMany({
  include: {
    roles: {
      select: {
        name: true,
      },
    },
  },
});

// Avoid: Selecting all fields when not needed
const allUsers = await prisma.user.findMany(); // Bad for performance
```

#### Pagination

```typescript
async function findUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return {
    items: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## API Development

### Controller Best Practices

#### Request Validation

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
}
```

#### DTO Validation

```typescript
// dto/create-user.dto.ts
import { IsEmail, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  username: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

#### Error Handling

```typescript
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';

@Controller('users')
export class UsersController {
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

### Service Layer Patterns

#### Use Case Pattern

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async execute(userData: CreateUserDto): Promise<UserResponseDto> {
    // Business logic validation
    await this.validateBusinessRules(userData);

    // Create user
    const user = await this.usersService.create(userData);

    // Send welcome notification
    await this.notificationsService.sendWelcomeEmail(user.email);

    return user;
  }

  private async validateBusinessRules(userData: CreateUserDto): Promise<void> {
    // Custom business validation
    if (userData.email.endsWith('@spam.com')) {
      throw new BadRequestException('Invalid email domain');
    }
  }
}
```

#### Repository Pattern

```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(userData: CreateUserDto): Promise<User> {
    return this.prisma.user.create({
      data: userData,
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: userData,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
```

## Security Development

### Authentication Implementation

#### JWT Guard

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
```

#### RBAC Guard

```typescript
@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rbacService: RbacService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.rbacService.hasPermissions(user.id, requiredPermissions);
  }
}
```

### Input Validation

#### Custom Validators

```typescript
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isStrongPassword', async: false })
export class IsStrongPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string) {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasNonalphas = /\W/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasNonalphas;
  }

  defaultMessage() {
    return 'Password must contain uppercase, lowercase, numbers, and special characters';
  }
}
```

#### Sanitization

```typescript
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class CreatePostDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  content: string;
}
```

## Performance Optimization

### Caching Strategies

#### Redis Cache

```typescript
@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }

  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

#### Cache Interceptor

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private cacheService: CacheService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.method}-${request.url}`;

    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (response) => {
        await this.cacheService.set(cacheKey, response, 300); // 5 minutes
      }),
    );
  }
}
```

### Database Optimization

#### Connection Pooling

```typescript
// prisma.config.ts
export const prismaConfig = {
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'pretty',
};

// In service
@Injectable()
export class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient({
      log: ['query'],
      errorFormat: 'pretty',
    });
  }
}
```

#### Query Optimization

```typescript
// Use transactions for multiple operations
async function transferFunds(fromId: string, toId: string, amount: number) {
  return this.prisma.$transaction(async (tx) => {
    // Debit from account
    await tx.account.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } },
    });

    // Credit to account
    await tx.account.update({
      where: { id: toId },
      data: { balance: { increment: amount } },
    });
  });
}
```

## Debugging and Troubleshooting

### Logging Strategy

#### Structured Logging

```typescript
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  async create(userData: CreateUserDto): Promise<User> {
    this.logger.log(`Creating user: ${userData.username}`);

    try {
      const user = await this.usersRepository.create(userData);
      this.logger.log(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(`Failed to create user: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

#### Request Correlation

```typescript
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId = req.headers['x-correlation-id'] || uuidv4();
    req.correlationId = correlationId;
    res.setHeader('x-correlation-id', correlationId);
    next();
  }
}
```

### Common Issues and Solutions

#### Database Connection Issues

```bash
# Check database connection
npm run db:health

# Reset database connection
npm run db:restart

# Check database logs
npm run db:logs
```

#### Memory Leaks

```typescript
// Proper cleanup in services
@OnModuleDestroy()
async onModuleDestroy() {
  await this.prisma.$disconnect();
  await this.redis.disconnect();
}
```

#### Performance Issues

```typescript
// Monitor query performance
@Injectable()
export class QueryLogger implements Logger {
  log(message: string) {
    console.log(`[QUERY] ${message}`);
  }

  // Log slow queries
  warn(message: string) {
    console.warn(`[SLOW QUERY] ${message}`);
  }
}
```

## Deployment

### Docker Configuration

#### Dockerfile

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

RUN npm run build
RUN npm run prisma:generate

EXPOSE 5000

CMD ["node", "dist/main"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - '5000:5000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/blih-system
    depends_on:
      - postgres
      - keycloak

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: blih-system
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  keycloak:
    image: quay.io/keycloak/keycloak:latest
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
    ports:
      - '8080:8080'

volumes:
  postgres_data:
```

### Environment-Specific Configurations

#### Production Environment

```bash
# Production .env
NODE_ENV=production
DATABASE_URL="${DATABASE_URL}"
KEYCLOAK_URL="${KEYCLOAK_URL}"
JWT_SECRET="${JWT_SECRET}"
API_PREFIX="api/v1"
PORT="5000"
CORS_ORIGIN="https://blih-app.com"
SWAGGER_ENABLED="false"
```

#### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy API

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
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

      - name: Deploy to production
        run: |
          # Deployment commands
```

## Best Practices

### Code Organization

1. **Single Responsibility**: Each class/module has one clear purpose
2. **Dependency Injection**: Use constructor injection for dependencies
3. **Interface Segregation**: Create specific interfaces for different use cases
4. **Don't Repeat Yourself (DRY)**: Extract common functionality

### Error Handling

1. **Specific Exceptions**: Use specific exception types
2. **Error Logging**: Log errors with context
3. **User-Friendly Messages**: Provide meaningful error messages
4. **Graceful Degradation**: Handle failures gracefully

### Security

1. **Principle of Least Privilege**: Grant minimum necessary permissions
2. **Input Validation**: Validate all inputs
3. **Output Encoding**: Encode outputs to prevent XSS
4. **Secure Defaults**: Use secure default configurations

### Performance

1. **Lazy Loading**: Load data only when needed
2. **Caching**: Cache frequently accessed data
3. **Connection Pooling**: Reuse database connections
4. **Async Operations**: Use async/await for I/O operations

This development guide provides a comprehensive foundation for working with the BLIH System. Follow these practices to ensure high-quality, maintainable code.
