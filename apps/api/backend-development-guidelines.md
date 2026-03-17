# Backend Development Guidelines

## Overview

This document provides comprehensive development guidelines for the BLIH System backend, built with NestJS and following Domain-Driven Design (DDD) principles.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Domain-Driven Design](#domain-driven-design)
6. [Database Guidelines](#database-guidelines)
7. [API Development](#api-development)
8. [Testing Guidelines](#testing-guidelines)
9. [Security Guidelines](#security-guidelines)
10. [Deployment Guidelines](#deployment-guidelines)

## Architecture Overview

### Technology Stack

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Keycloak
- **Message Queue**: RabbitMQ (optional)
- **Containerization**: Docker
- **Testing**: Jest
- **Linting**: ESLint with TypeScript support

### Core Principles

- **Domain-Driven Design**: Business logic organized by domains
- **Event-Driven Architecture**: Domains communicate via events
- **Clean Architecture**: Separation of concerns with clear boundaries
- **Microservices Ready**: Modular design for future scaling

## Development Setup

### Prerequisites

- Node.js >= 18
- Docker & Docker Compose
- PostgreSQL client (optional)

### Initial Setup

1. **Clone and Install Dependencies**

   ```bash
   git clone <repository-url>
   cd blih-system
   npm install
   ```

2. **Start Infrastructure Services**

   ```bash
   npm run docker:api:up
   ```

3. **Environment Configuration**

   ```bash
   cp apps/api/.env.example apps/api/.env
   # Edit .env with your configuration
   ```

4. **Database Setup**

   ```bash
   cd apps/api
   npm run prisma:migrate:dev
   npm run prisma:seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev:api
   ```

### Development Commands

```bash
# Development
npm run dev:api              # Start API in development mode
npm run start:dev           # Start with watch mode

# Building
npm run build               # Build for production
npm run start:prod          # Start production build

# Code Quality
npm run lint                # Run ESLint
npm run lint:fix            # Fix linting issues
npm run lint:check          # Full lint check with RBAC validation
npm run format              # Format code with Prettier

# Type Checking
npm run typecheck           # TypeScript type checking

# Testing
npm run test                # Run unit tests
npm run test:watch          # Run tests in watch mode
npm run test:cov            # Run tests with coverage
npm run test:integration    # Run integration tests
npm run test:e2e            # Run end-to-end tests

# Database
npm run prisma:generate     # Generate Prisma client
npm run prisma:migrate:dev  # Run database migrations
npm run prisma:seed         # Seed database
npm run db:start            # Start database services
npm run db:stop             # Stop database services

# Full Verification
npm run api:verify          # Run lint + typecheck + tests
```

## Project Structure

```
apps/api/src/
├── app.module.ts           # Root application module
├── main.ts                 # Application entry point
├── config/                 # Configuration files
├── core/                   # Core application logic
│   ├── auth/              # Authentication & authorization
│   ├── rbac/              # Role-based access control
│   └── ...
├── domains/                # Business domains
│   ├── hr/                # Human resources domain
│   ├── crm/               # Customer relationship management
│   ├── finance/           # Finance domain
│   ├── project/           # Project management
│   ├── brain/             # AI/ML services
│   ├── chatbot/           # Chatbot services
│   └── ai/                # AI integration
├── platform/              # Platform services
│   ├── prisma/            # Database configuration
│   ├── rabbitmq/          # Message queue setup
│   └── ...
├── shared/                # Shared utilities
│   ├── decorators/        # Custom decorators
│   ├── dto/               # Data transfer objects
│   ├── entities/          # Base entities
│   ├── exceptions/        # Custom exceptions
│   ├── filters/           # Exception filters
│   ├── guards/            # Auth guards
│   ├── interceptors/     # Response interceptors
│   ├── middleware/        # Custom middleware
│   ├── pipes/             # Validation pipes
│   └── utils/             # Utility functions
└── tests/                 # Test files
```

### Domain Structure

Each domain follows this structure:

```
domains/{domain}/
├── {domain}.module.ts     # Domain module
├── {domain}.controller.ts # HTTP controllers
├── {domain}.service.ts    # Business logic
├── dto/                   # Domain DTOs
├── entities/              # Domain entities
├── events/                # Domain events
└── repositories/          # Data access layer
```

## Coding Standards

### TypeScript Guidelines

1. **Strict Type Checking**

   ```typescript
   // Enable strict mode in tsconfig.json
   "strict": true,
   "noImplicitAny": true,
   "strictNullChecks": true
   ```

2. **Interface vs Type**

   ```typescript
   // Use interfaces for object shapes
   interface User {
     id: string;
     name: string;
   }

   // Use types for unions, primitives, or complex types
   type UserRole = 'admin' | 'user' | 'guest';
   type ApiResponse<T> = {
     data: T;
     status: number;
   };
   ```

3. **Naming Conventions**
   - **Files**: kebab-case (`user-service.ts`)
   - **Classes**: PascalCase (`UserService`)
   - **Methods**: camelCase (`getUserById`)
   - **Constants**: UPPER_SNAKE_CASE (`MAX_RETRY_ATTEMPTS`)
   - **Interfaces**: PascalCase with 'I' prefix optional (`IUserRepository`)

### Code Organization

1. **Import Order**

   ```typescript
   // 1. Node.js imports
   import { Module } from '@nestjs/common';

   // 2. Third-party imports
   import { PrismaClient } from '@prisma/client';

   // 3. Internal imports (shared, core, domains)
   import { UserEntity } from '../shared/entities';
   import { AuthGuard } from '../core/guards';
   import { UserService } from './user.service';
   ```

2. **Class Organization**

   ```typescript
   export class UserService {
     // 1. Dependencies (constructor)
     constructor(private readonly userRepository: UserRepository) {}

     // 2. Public methods
     async createUser(createUserDto: CreateUserDto): Promise<User> {
       // Implementation
     }

     // 3. Private methods
     private validateUserData(data: CreateUserDto): void {
       // Implementation
     }
   }
   ```

### Error Handling

1. **Custom Exceptions**

   ```typescript
   // shared/exceptions/user.exception.ts
   export class UserNotFoundException extends NotFoundException {
     constructor(id: string) {
       super(`User with ID ${id} not found`);
     }
   }

   // Usage
   throw new UserNotFoundException(userId);
   ```

2. **Global Exception Filter**
   ```typescript
   @Catch()
   export class GlobalExceptionFilter implements ExceptionFilter {
     catch(exception: unknown, host: ArgumentsHost) {
       // Centralized error handling
     }
   }
   ```

## Domain-Driven Design

### Domain Boundaries

- **Strict Separation**: Domains cannot directly import from other domains
- **Event-Driven Communication**: Use EventBusService for cross-domain communication
- **Bounded Contexts**: Each domain has its own models and business logic

### Domain Events

```typescript
// domains/hr/events/employee-created.event.ts
export class EmployeeCreatedEvent {
  constructor(
    public readonly employeeId: string,
    public readonly departmentId: string,
    public readonly createdAt: Date,
  ) {}
}

// Publishing events
await this.eventBus.publish(
  new EmployeeCreatedEvent(employee.id, department.id, new Date()),
);
```

### Aggregates and Entities

```typescript
// domains/hr/entities/employee.aggregate.ts
export class Employee {
  constructor(
    private readonly id: string,
    private name: string,
    private email: string,
    private departmentId: string,
  ) {}

  // Business logic methods
  changeDepartment(newDepartmentId: string): void {
    if (newDepartmentId === this.departmentId) {
      throw new Error('Employee already in this department');
    }
    this.departmentId = newDepartmentId;
  }

  // Getters
  getId(): string {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
}
```

## Database Guidelines

### Prisma Best Practices

1. **Schema Organization**

   ```prisma
   // platform/prisma/schema.prisma
   generator client {
     provider = "prisma-client-js"
   }

   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }

   // Group models by domain
   model User {
     id        String   @id @default(cuid())
     email     String   @unique
     name      String
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     // Relations
     profile   UserProfile?
     posts     Post[]

     @@map("users")
   }
   ```

2. **Migration Workflow**

   ```bash
   # Create migration
   npx prisma migrate dev --name add_user_profile

   # Generate client
   npx prisma generate

   # Deploy to production
   npx prisma migrate deploy
   ```

3. **Database Service Pattern**

   ```typescript
   @Injectable()
   export class DatabaseService {
     private readonly prisma: PrismaClient;

     constructor() {
       this.prisma = new PrismaClient();
     }

     async onModuleInit() {
       await this.prisma.$connect();
     }

     async onModuleDestroy() {
       await this.prisma.$disconnect();
     }

     get client(): PrismaClient {
       return this.prisma;
     }
   }
   ```

### Query Optimization

1. **Efficient Queries**

   ```typescript
   // Bad: N+1 query problem
   const users = await this.prisma.user.findMany();
   for (const user of users) {
     const posts = await this.prisma.post.findMany({
       where: { userId: user.id },
     });
   }

   // Good: Use include or join
   const usersWithPosts = await this.prisma.user.findMany({
     include: { posts: true },
   });
   ```

2. **Pagination**

   ```typescript
   async getUsers(page: number, limit: number): Promise<PaginatedResult<User>> {
     const skip = (page - 1) * limit;
     const [users, total] = await Promise.all([
       this.prisma.user.findMany({ skip, take: limit }),
       this.prisma.user.count()
     ]);

     return {
       data: users,
       total,
       page,
       totalPages: Math.ceil(total / limit)
     };
   }
   ```

## API Development

### RESTful API Guidelines

1. **Controller Structure**

   ```typescript
   @Controller('users')
   @ApiTags('users')
   @UseGuards(AuthGuard)
   export class UserController {
     constructor(private readonly userService: UserService) {}

     @Get()
     @ApiOperation({ summary: 'Get all users' })
     @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
     async getUsers(): Promise<User[]> {
       return this.userService.findAll();
     }

     @Post()
     @ApiOperation({ summary: 'Create a new user' })
     @ApiResponse({ status: 201, description: 'User created successfully' })
     async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
       return this.userService.create(createUserDto);
     }
   }
   ```

2. **DTO Validation**

   ```typescript
   // dto/create-user.dto.ts
   export class CreateUserDto {
     @ApiProperty()
     @IsEmail()
     @IsNotEmpty()
     email: string;

     @ApiProperty()
     @IsString()
     @MinLength(2)
     @MaxLength(50)
     name: string;

     @ApiProperty()
     @IsOptional()
     @IsEnum(UserRole)
     role?: UserRole;
   }
   ```

3. **Response Formatting**
   ```typescript
   // shared/interceptors/response.interceptor.ts
   @Injectable()
   export class ResponseInterceptor implements NestInterceptor {
     intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
       return next.handle().pipe(
         map((data) => ({
           success: true,
           data,
           timestamp: new Date().toISOString(),
         })),
       );
     }
   }
   ```

### Authentication & Authorization

1. **JWT Strategy**

   ```typescript
   @Injectable()
   export class JwtStrategy extends PassportStrategy(Strategy) {
     constructor() {
       super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: process.env.JWT_SECRET,
       });
     }

     async validate(payload: any): Promise<any> {
       return { userId: payload.sub, email: payload.email };
     }
   }
   ```

2. **Role-Based Access Control**

   ```typescript
   @Injectable()
   export class RolesGuard implements CanActivate {
     constructor(private readonly reflector: Reflector) {}

     canActivate(context: ExecutionContext): boolean {
       const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
         ROLES_KEY,
         [context.getHandler(), context.getClass()],
       );

       if (!requiredRoles) {
         return true;
       }

       const { user } = context.switchToHttp().getRequest();
       return requiredRoles.some((role) => user.roles?.includes(role));
     }
   }
   ```

## Testing Guidelines

### Unit Testing

1. **Service Testing**

   ```typescript
   describe('UserService', () => {
     let service: UserService;
     let repository: jest.Mocked<UserRepository>;

     beforeEach(async () => {
       const module = await Test.createTestingModule({
         providers: [
           UserService,
           {
             provide: UserRepository,
             useValue: {
               findById: jest.fn(),
               create: jest.fn(),
               update: jest.fn(),
               delete: jest.fn(),
             },
           },
         ],
       }).compile();

       service = module.get<UserService>(UserService);
       repository = module.get(UserRepository);
     });

     describe('findById', () => {
       it('should return user when found', async () => {
         const userId = 'user-id';
         const expectedUser = { id: userId, name: 'John Doe' };
         repository.findById.mockResolvedValue(expectedUser);

         const result = await service.findById(userId);

         expect(result).toEqual(expectedUser);
         expect(repository.findById).toHaveBeenCalledWith(userId);
       });
     });
   });
   ```

2. **Controller Testing**

   ```typescript
   describe('UserController', () => {
     let controller: UserController;
     let service: jest.Mocked<UserService>;

     beforeEach(async () => {
       const module = await Test.createTestingModule({
         controllers: [UserController],
         providers: [
           {
             provide: UserService,
             useValue: {
               findAll: jest.fn(),
               create: jest.fn(),
             },
           },
         ],
       }).compile();

       controller = module.get<UserController>(UserController);
       service = module.get(UserService);
     });

     it('should return all users', async () => {
       const users = [{ id: '1', name: 'John' }];
       service.findAll.mockResolvedValue(users);

       const result = await controller.getUsers();

       expect(result).toEqual(users);
     });
   });
   ```

### Integration Testing

1. **Database Testing**

   ```typescript
   describe('UserRepository Integration', () => {
     let prisma: PrismaClient;
     let repository: UserRepository;

     beforeAll(async () => {
       prisma = new PrismaClient({
         datasources: {
           db: { url: process.env.TEST_DATABASE_URL },
         },
       });
       await prisma.$connect();
       repository = new UserRepository(prisma);
     });

     afterAll(async () => {
       await prisma.$disconnect();
     });

     beforeEach(async () => {
       await prisma.user.deleteMany();
     });

     it('should create and retrieve user', async () => {
       const userData = { name: 'John', email: 'john@example.com' };
       const created = await repository.create(userData);
       const found = await repository.findById(created.id);

       expect(found).toEqual(created);
     });
   });
   ```

### E2E Testing

1. **API Testing**

   ```typescript
   describe('Users API (e2e)', () => {
     let app: INestApplication;

     beforeAll(async () => {
       const moduleFixture = await Test.createTestingModule({
         imports: [AppModule],
       }).compile();

       app = moduleFixture.createNestApplication();
       await app.init();
     });

     it('/users (POST)', () => {
       return request(app.getHttpServer())
         .post('/users')
         .send({ name: 'John', email: 'john@example.com' })
         .expect(201)
         .expect((res) => {
           expect(res.body.data.name).toBe('John');
         });
     });
   });
   ```

## Security Guidelines

### Authentication Security

1. **Password Security**

   ```typescript
   import * as bcrypt from 'bcrypt';

   export class PasswordService {
     async hashPassword(password: string): Promise<string> {
       const saltRounds = 12;
       return bcrypt.hash(password, saltRounds);
     }

     async comparePassword(password: string, hash: string): Promise<boolean> {
       return bcrypt.compare(password, hash);
     }
   }
   ```

2. **JWT Security**
   ```typescript
   export class JwtService {
     generateToken(payload: any): string {
       return jwt.sign(payload, process.env.JWT_SECRET, {
         expiresIn: '1h',
         issuer: 'blih-system',
         audience: 'blih-users',
       });
     }
   }
   ```

### Input Validation

1. **Sanitization**

   ```typescript
   import { Transform } from 'class-transformer';
   import { sanitize } from 'sanitize-html';

   export class CreatePostDto {
     @ApiProperty()
     @IsString()
     @Transform(({ value }) => sanitize(value))
     content: string;
   }
   ```

2. **Rate Limiting**

   ```typescript
   import { RateLimiterGuard } from 'nestjs-rate-limiter';

   @Controller('auth')
   @UseGuards(RateLimiterGuard)
   export class AuthController {
     @Post('login')
     @RateLimit({
       keyPrefix: 'login',
       points: 5,
       duration: 60, // 60 seconds
       blockDuration: 300, // 5 minutes
     })
     async login() {
       // Login logic
     }
   }
   ```

### Data Protection

1. **PII Handling**

   ```typescript
   export class UserEntity {
     @Exclude() // Exclude from JSON serialization
     password: string;

     @Transform(({ value }) => maskEmail(value))
     email: string;

     @Expose()
     get maskedEmail(): string {
       return this.email.replace(/(.{2}).*(@.*)/, '$1***$2');
     }
   }
   ```

## Deployment Guidelines

### Docker Configuration

1. **Multi-stage Dockerfile**

   ```dockerfile
   # Build stage
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build

   # Production stage
   FROM node:18-alpine AS production
   WORKDIR /app
   COPY --from=builder /app/dist ./dist
   COPY --from=builder /app/node_modules ./node_modules
   COPY --from=builder /app/package.json ./package.json

   EXPOSE 5000
   CMD ["node", "dist/main"]
   ```

2. **Health Checks**
   ```dockerfile
   HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
     CMD curl -f http://localhost:5000/health || exit 1
   ```

### Environment Configuration

1. **Configuration Service**

   ```typescript
   @Injectable()
   export class ConfigService {
     constructor() {
       this.validateConfig();
     }

     private validateConfig(): void {
       const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'KEYCLOAK_URL'];

       requiredEnvVars.forEach((varName) => {
         if (!process.env[varName]) {
           throw new Error(`Missing required environment variable: ${varName}`);
         }
       });
     }
   }
   ```

### Monitoring and Logging

1. **Structured Logging**

   ```typescript
   import { Logger } from 'nestjs-pino';

   export class UserService {
     private readonly logger = new Logger(UserService.name);

     async createUser(data: CreateUserDto): Promise<User> {
       this.logger.log({ action: 'create_user', data: { email: data.email } });

       try {
         const user = await this.repository.create(data);
         this.logger.log({ action: 'user_created', userId: user.id });
         return user;
       } catch (error) {
         this.logger.error({
           action: 'create_user_failed',
           error: error.message,
         });
         throw error;
       }
     }
   }
   ```

2. **Metrics Collection**

   ```typescript
   import { Counter, Histogram, register } from 'prom-client';

   export const httpRequestsTotal = new Counter({
     name: 'http_requests_total',
     help: 'Total number of HTTP requests',
     labelNames: ['method', 'route', 'status_code'],
   });

   export const httpRequestDuration = new Histogram({
     name: 'http_request_duration_seconds',
     help: 'Duration of HTTP requests in seconds',
     labelNames: ['method', 'route'],
   });
   ```

## Best Practices Summary

### Do's

- ✅ Follow domain-driven design principles
- ✅ Write comprehensive tests for all business logic
- ✅ Use TypeScript strict mode
- ✅ Implement proper error handling
- ✅ Use environment variables for configuration
- ✅ Follow RESTful API conventions
- ✅ Implement proper authentication and authorization
- ✅ Use structured logging
- ✅ Write meaningful commit messages
- ✅ Keep dependencies updated

### Don'ts

- ❌ Hardcode configuration values
- ❌ Ignore TypeScript errors
- ❌ Skip testing
- ❌ Use console.log for production logging
- ❌ Expose sensitive data in responses
- ❌ Ignore security best practices
- ❌ Create circular dependencies
- ❌ Use synchronous operations for I/O
- ❌ Skip database migrations
- ❌ Commit sensitive information

## Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Domain-Driven Design](https://learn.microsoft.com/en-us/azure/architecture/patterns/category/domain-driven-design)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Jest Testing Framework](https://jestjs.io/docs/getting-started)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

This document is a living guide. Please contribute to keeping it updated with the latest best practices and project-specific conventions.
