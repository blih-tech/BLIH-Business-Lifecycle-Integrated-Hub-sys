# BLIH Developer Onboarding Guide

**Welcome to the BLIH development team!** 🎉

This guide will help you get up and running with the BLIH codebase quickly and efficiently.

---

## Table of Contents

1. [First Day Setup](#1-first-day-setup)
2. [Development Environment](#2-development-environment)
3. [Codebase Overview](#3-codebase-overview)
4. [Development Workflow](#4-development-workflow)
5. [Common Patterns](#5-common-patterns)
6. [Testing](#6-testing)
7. [Debugging](#7-debugging)
8. [Your First Tasks](#8-your-first-tasks)
9. [Resources & Contacts](#9-resources--contacts)

---

## 1. First Day Setup

### 1.1 Essential Access

Before you begin, make sure you have:

- [ ] **GitHub/GitLab Access** - Repository access granted
- [ ] **Slack/Teams** - Join #blih-dev channel
- [ ] **Email Account** - Company email configured
- [ ] **VPN Access** - If working remotely
- [ ] **Docker Hub** - Access to container registry
- [ ] **Development Server** - SSH access (if applicable)

### 1.2 Required Reading (30 minutes)

Start with these documents:

1. **[System Documentation](./SYSTEM_DOCUMENTATION.md)** (15 min) - Understand what BLIH does
2. **[Architecture Overview](./ARCHITECTURE.md#executive-overview)** (10 min) - High-level tech stack
3. **[Security Guidelines](./CORE_SECURITY.md#11-security-best-practices)** (5 min) - Security standards

### 1.3 Team Introductions

| Role | Name | Contact | Specialty |
|------|------|---------|-----------|
| Tech Lead | [Name] | @slack | Architecture decisions |
| Frontend Lead | [Name] | @slack | Next.js, UI/UX |
| Backend Lead | [Name] | @slack | NestJS, APIs |
| DevOps Lead | [Name] | @slack | Deployment, CI/CD |
| QA Lead | [Name] | @slack | Testing strategies |

---

## 2. Development Environment

### 2.1 Hardware Requirements

**Minimum:**
- 16 GB RAM
- 4-core CPU
- 50 GB free disk space
- Stable internet connection

**Recommended:**
- 32 GB RAM
- 8-core CPU
- 100 GB SSD
- 100 Mbps+ internet

### 2.2 Software Installation

#### Step 1: Install Core Tools

```bash
# macOS
brew install git node@20 docker docker-compose

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs git docker.io docker-compose

# Verify installations
node --version    # Should be v20.x.x
npm --version     # Should be 10.x.x
docker --version  # Should be 24.x.x
git --version     # Should be 2.40+
```

#### Step 2: Install Development Tools

```bash
# VS Code (recommended)
# Download from https://code.visualstudio.com/

# OR use your preferred IDE:
# - WebStorm
# - IntelliJ IDEA
# - Cursor
```

#### Step 3: Install VS Code Extensions

```bash
# Essential Extensions
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension EditorConfig.EditorConfig

# Recommended Extensions
code --install-extension eamodio.gitlens
code --install-extension streetsidesoftware.code-spell-checker
code --install-extension usernamehw.errorlens
code --install-extension yoavbls.pretty-ts-errors
code --install-extension ms-azuretools.vscode-docker
```

### 2.3 Clone Repository

```bash
# Create workspace directory
mkdir -p ~/workspace
cd ~/workspace

# Clone repository
git clone https://github.com/yourorg/BLIH-Business-Lifecycle-Integrated-Hub-.git blih
cd blih

# Create your feature branch
git checkout -b feat/your-name-setup

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

### 2.4 Environment Configuration

Edit `.env.local` with development settings:

```bash
# Development Environment
NODE_ENV=development
DEPLOYMENT_ENV=local

# Company Context
COMPANY_ID=BLIH
COMPANY_NAME="BLIH Dev"

# Database (Docker Compose will handle these)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=blih_dev
POSTGRES_USER=blih_dev
POSTGRES_PASSWORD=dev_password_123

MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DB=blih_dev
MONGODB_USER=blih_dev
MONGODB_PASSWORD=dev_password_123

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=dev_password_123

# API URLs (local development)
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# JWT (development keys - DO NOT USE IN PRODUCTION!)
JWT_SECRET=dev_secret_key_do_not_use_in_production_12345678901234567890
REFRESH_TOKEN_SECRET=dev_refresh_secret_key_do_not_use_in_production

# Feature Flags (enable all modules in dev)
MODULE_HR_ENABLED=true
MODULE_CRM_ENABLED=true
MODULE_PROJECTS_ENABLED=true
MODULE_FINANCE_ENABLED=true
MODULE_BRAIN_ENABLED=true

# Logging
LOG_LEVEL=debug
LOG_FORMAT=pretty
```

### 2.5 Start Development Environment

```bash
# Start infrastructure services (databases, cache, etc.)
docker-compose -f docker-compose.dev.yml up -d

# Verify services are running
docker ps

# Expected output:
# - blih-postgres
# - blih-mongodb
# - blih-redis
# - blih-rabbitmq
# - blih-qdrant

# Run database migrations
cd apps/api
npm run migration:run
cd ../..

# Seed development data
npm run seed:dev

# Start development servers (in separate terminals)

# Terminal 1: Backend API
cd apps/api
npm run start:dev

# Terminal 2: Frontend
cd apps/frontend
npm run dev

# Terminal 3: Watch for changes
npm run test:watch
```

### 2.6 Verify Setup

Open your browser and test:

- ✅ **Frontend**: http://localhost:3001
- ✅ **API Health**: http://localhost:3000/api/health
- ✅ **API Docs**: http://localhost:3000/api/docs (Swagger)
- ✅ **RabbitMQ Management**: http://localhost:15672 (guest/guest)

**Expected Response:**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" },
    "redis": { "status": "up" },
    "rabbitmq": { "status": "up" }
  },
  "timestamp": "2026-02-10T13:40:00Z"
}
```

**🎉 Success!** If all services are green, you're ready to code!

---

## 3. Codebase Overview

### 3.1 Repository Structure

```
BLIH-Business-Lifecycle-Integrated-Hub-/
├── apps/
│   ├── frontend/              # Next.js 16 App Router
│   │   ├── src/
│   │   │   ├── app/          # App Router pages
│   │   │   ├── components/   # React components
│   │   │   ├── lib/          # Utilities, hooks
│   │   │   └── styles/       # CSS, Tailwind
│   │   └── public/           # Static assets
│   │
│   └── api/                   # NestJS Backend
│       ├── src/
│       │   ├── modules/      # Business modules
│       │   │   ├── hr/
│       │   │   ├── crm/
│       │   │   ├── projects/
│       │   │   ├── finance/
│       │   │   └── brain/
│       │   ├── core/         # Core services
│       │   │   ├── auth/
│       │   │   ├── audit/
│       │   │   └── events/
│       │   └── common/       # Shared code
│       └── test/             # E2E tests
│
├── packages/                  # Shared packages
│   ├── types/                # TypeScript types
│   ├── validation/           # Validation schemas
│   └── utils/                # Shared utilities
│
├── database/
│   ├── migrations/           # Database migrations
│   ├── seeds/                # Seed data
│   └── schemas/              # Schema documentation
│
├── docs/                     # Documentation
│   ├── core/                 # Core docs
│   ├── modules/              # Module docs
│   └── api/                  # API docs
│
├── scripts/                  # Utility scripts
│   ├── backup.sh
│   ├── monitor.sh
│   └── setup-dev.sh
│
├── .github/                  # GitHub Actions
│   └── workflows/
│
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
└── package.json              # Root package file
```

### 3.2 Tech Stack Quick Reference

| Layer | Technology | Location | Purpose |
|-------|-----------|----------|---------|
| **Frontend** | Next.js 16 | `apps/frontend` | Server & Client components |
| **UI** | Tailwind CSS + shadcn/ui | `apps/frontend/src/components` | Styled components |
| **State** | TanStack Query + Zustand | `apps/frontend/src/lib` | Server & client state |
| **Backend** | NestJS | `apps/api` | REST API, WebSockets |
| **Auth** | Keycloak | External service | SSO, OAuth2, OIDC |
| **Database** | PostgreSQL | Docker | Transactional data |
| **Documents** | MongoDB | Docker | Flexible schemas |
| **Cache** | Redis | Docker | Sessions, caching |
| **Queue** | RabbitMQ | Docker | Event bus |
| **Vectors** | Qdrant | Docker | AI embeddings |
| **LLM** | Ollama | Docker | Local AI model |

### 3.3 Key Directories Explained

#### Frontend (`apps/frontend/src/`)

```
app/
├── (auth)/                   # Auth routes (no sidebar)
│   ├── login/
│   └── layout.tsx
│
├── (dashboard)/              # Main app routes (with sidebar)
│   ├── layout.tsx           # Dashboard shell
│   ├── page.tsx             # Dashboard home
│   ├── hr/                  # HR module pages
│   │   ├── employees/
│   │   ├── recruitment/
│   │   └── ...
│   ├── crm/                 # CRM module pages
│   ├── projects/            # Projects module pages
│   ├── finance/             # Finance module pages
│   └── brain/               # Brain module pages
│
└── api/                     # API routes (serverless)
    └── [...handlers].ts

components/
├── ui/                      # shadcn/ui components
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
│
├── forms/                   # Form components
│   ├── employee-form.tsx
│   └── ...
│
├── layouts/                 # Layout components
│   ├── dashboard-shell.tsx
│   └── sidebar.tsx
│
└── modules/                 # Module-specific components
    ├── hr/
    ├── crm/
    └── ...

lib/
├── api/                     # API client
│   ├── client.ts
│   └── endpoints/
│
├── hooks/                   # Custom hooks
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   └── ...
│
└── utils/                   # Utility functions
    ├── date.ts
    ├── money.ts
    └── ...
```

#### Backend (`apps/api/src/`)

```
modules/
├── hr/
│   ├── hr.module.ts         # Module definition
│   ├── hr.controller.ts     # REST endpoints
│   ├── hr.service.ts        # Business logic
│   ├── entities/            # TypeORM entities
│   ├── dto/                 # Data Transfer Objects
│   ├── repositories/        # Data access
│   └── events/              # Event handlers
│
├── crm/                     # Same structure
├── projects/
├── finance/
└── brain/

core/
├── auth/                    # Authentication
├── audit/                   # Audit logging
├── events/                  # Event bus
├── notifications/           # Notifications
└── permissions/             # RBAC

common/
├── decorators/              # Custom decorators
├── filters/                 # Exception filters
├── guards/                  # Route guards
├── interceptors/            # Request/response interceptors
├── pipes/                   # Validation pipes
└── utils/                   # Shared utilities
```

### 3.4 Module Architecture Pattern

Every module follows this structure:

```typescript
// 1. Controller (HTTP layer)
@Controller('hr/employees')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Post()
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('HR:employee:create:all')
  async create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }
}

// 2. Service (Business logic)
@Injectable()
export class EmployeeService {
  constructor(
    private employeeRepo: EmployeeRepository,
    private eventBus: EventBusService,
    private auditService: AuditService
  ) {}

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    // Validate
    // Execute business logic
    const employee = await this.employeeRepo.save(dto);
    
    // Publish event
    await this.eventBus.publish('hr.employee.created', employee);
    
    // Audit
    await this.auditService.log({ action: 'EMPLOYEE_CREATED', ...});
    
    return employee;
  }
}

// 3. Repository (Data access)
@Injectable()
export class EmployeeRepository {
  constructor(
    @InjectRepository(Employee) private repo: Repository<Employee>
  ) {}

  async save(data: Partial<Employee>): Promise<Employee> {
    return this.repo.save({ ...data, company_id: 'BLIH' });
  }
}

// 4. Event Handler (Cross-module integration)
@EventHandler('hr.employee.created')
export class EmployeeCreatedHandler {
  async handle(event: EmployeeCreatedEvent) {
    // Trigger side effects
    // e.g., Create user account, send welcome email
  }
}
```

---

## 4. Development Workflow

### 4.1 Git Workflow

We use **Git Flow** with feature branches:

```bash
# Always start from main
git checkout main
git pull origin main

# Create feature branch
git checkout -b feat/hr-attendance-tracking

# Make changes, commit frequently
git add .
git commit -m "feat(hr): add attendance check-in endpoint"

# Keep your branch up to date
git fetch origin main
git rebase origin/main

# Push your branch
git push origin feat/hr-attendance-tracking

# Create Pull Request on GitHub/GitLab
```

**Commit Message Convention:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(hr): add employee onboarding checklist"
git commit -m "fix(crm): resolve deal value calculation error"
git commit -m "docs(api): update HR endpoints documentation"
```

### 4.2 Code Review Process

**Before Creating PR:**
- [ ] Code compiles without errors
- [ ] All tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] No console.log statements
- [ ] Comments added for complex logic
- [ ] Types properly defined

**PR Template:**

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How to test this change:
1. Step 1
2. Step 2
3. Expected result

## Screenshots (if applicable)
[Add screenshots here]

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added/updated
- [ ] Documentation updated
```

**Review Timeline:**
- Small PRs (< 200 lines): 24 hours
- Medium PRs (200-500 lines): 48 hours
- Large PRs (> 500 lines): Should be split up!

### 4.3 Local Development Commands

```bash
# Install dependencies
npm install

# Development servers
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:api          # API only

# Building
npm run build            # Build all
npm run build:frontend   # Build frontend
npm run build:api        # Build API

# Testing
npm run test             # Run all tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
npm run test:cov         # Coverage report

# Code quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix issues
npm run format           # Run Prettier
npm run type-check       # TypeScript check

# Database
npm run migration:create -- MigrationName
npm run migration:run
npm run migration:revert
npm run seed:dev         # Seed development data

# Docker
npm run docker:up        # Start infrastructure
npm run docker:down      # Stop infrastructure
npm run docker:reset     # Reset all data
npm run docker:logs      # View logs
```

---

## 5. Common Patterns

### 5.1 API Call Pattern (Frontend)

```typescript
// lib/api/endpoints/hr.ts
import { apiClient } from '../client';

export const hrApi = {
  getEmployees: (params?: EmployeeQueryParams) =>
    apiClient.get<Employee[]>('/hr/employees', { params }),
  
  createEmployee: (data: CreateEmployeeDto) =>
    apiClient.post<Employee>('/hr/employees', data),
  
  updateEmployee: (id: string, data: UpdateEmployeeDto) =>
    apiClient.patch<Employee>(`/hr/employees/${id}`, data),
};

// components/employees/employee-list.tsx
import { useQuery } from '@tanstack/react-query';
import { hrApi } from '@/lib/api/endpoints/hr';

export function EmployeeList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrApi.getEmployees(),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <DataTable columns={columns} data={data} />
  );
}
```

### 5.2 Form Handling Pattern

```typescript
// Using react-hook-form + zod
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const employeeSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().regex(/^\+251[0-9]{9}$/),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

export function EmployeeForm() {
  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const mutation = useMutation({
    mutationFn: hrApi.createEmployee,
    onSuccess: () => {
      toast.success('Employee created successfully');
      router.push('/hr/employees');
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(mutation.mutate)}>
        <FormField name="firstName" control={form.control} render={...} />
        <Button type="submit" loading={mutation.isPending}>
          Create Employee
        </Button>
      </form>
    </Form>
  );
}
```

### 5.3 Backend Endpoint Pattern

```typescript
// hr.controller.ts
@Controller('hr/employees')
export class EmployeeController {
  @Get()
  @ApiOperation({ summary: 'Get all employees' })
  @ApiResponse({ status: 200, type: [Employee] })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('HR:employee:read:all')
  async findAll(@Query() query: EmployeeQueryDto) {
    return this.employeeService.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create employee' })
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('HR:employee:create:all')
  async create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: User) {
    return this.employeeService.create(dto, user);
  }
}

// hr.service.ts
@Injectable()
export class EmployeeService {
  async create(dto: CreateEmployeeDto, user: User): Promise<Employee> {
    // 1. Validate business rules
    await this.validateEmployee(dto);
    
    // 2. Execute
    const employee = await this.employeeRepo.create(dto);
    
    // 3. Publish event
    await this.eventBus.publish('hr.employee.created', {
      employeeId: employee.id,
      createdBy: user.id,
    });
    
    // 4. Audit
    await this.auditService.log({
      action: 'EMPLOYEE_CREATED',
      userId: user.id,
      resourceId: employee.id,
    });
    
    return employee;
  }
}
```

---

## 6. Testing

### 6.1 Testing Philosophy

- **Unit Tests**: Test individual functions/methods
- **Integration Tests**: Test module interactions
- **E2E Tests**: Test full user workflows

**Coverage Goals:**
- Critical business logic: 90%+
- Services: 80%+
- Controllers: 70%+
- Overall: 75%+

### 6.2 Writing Tests

```typescript
// __tests__/employee.service.spec.ts
describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockRepo: jest.Mocked<EmployeeRepository>;
  let mockEventBus: jest.Mocked<EventBusService>;

  beforeEach(() => {
    mockRepo = createMock<EmployeeRepository>();
    mockEventBus = createMock<EventBusService>();
    service = new EmployeeService(mockRepo, mockEventBus, ...);
  });

  describe('create', () => {
    it('should create employee and publish event', async () => {
      // Arrange
      const dto: CreateEmployeeDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      };
      const expectedEmployee = { id: '123', ...dto };
      mockRepo.create.mockResolvedValue(expectedEmployee);

      // Act
      const result = await service.create(dto, mockUser);

      // Assert
      expect(result).toEqual(expectedEmployee);
      expect(mockEventBus.publish).toHaveBeenCalledWith(
        'hr.employee.created',
        expect.objectContaining({ employeeId: '123' })
      );
    });

    it('should throw error if email already exists', async () => {
      mockRepo.findByEmail.mockResolvedValue(mockEmployee);

      await expect(service.create(dto, mockUser))
        .rejects
        .toThrow('Email already exists');
    });
  });
});
```

### 6.3 E2E Testing

```typescript
// test/hr/employees.e2e-spec.ts
describe('Employees (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    authToken = await getTestAuthToken(app);
  });

  it('/hr/employees (POST)', () => {
    return request(app.getHttpServer())
      .post('/hr/employees')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      })
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.firstName).toBe('John');
      });
  });
});
```

---

## 7. Debugging

### 7.1 VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug API",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "start:debug"],
      "cwd": "${workspaceFolder}/apps/api",
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:3001",
      "webRoot": "${workspaceFolder}/apps/frontend",
      "sourceMapPathOverrides": {
        "webpack:///./~/*": "${webRoot}/node_modules/*",
        "webpack:///./*": "${webRoot}/*"
      }
    }
  ]
}
```

### 7.2 Logging Best Practices

```typescript
// Use structured logging
import { Logger } from '@nestjs/common';

@Injectable()
export class EmployeeService {
  private readonly logger = new Logger(EmployeeService.name);

  async create(dto: CreateEmployeeDto) {
    this.logger.log(`Creating employee: ${dto.email}`);
    
    try {
      const employee = await this.employeeRepo.create(dto);
      this.logger.log(`Employee created: ${employee.id}`);
      return employee;
    } catch (error) {
      this.logger.error(
        `Failed to create employee: ${dto.email}`,
        error.stack
      );
      throw error;
    }
  }
}
```

### 7.3 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| **Port already in use** | `lsof -ti:3000 \| xargs kill -9` |
| **Database connection failed** | Check Docker containers: `docker ps` |
| **TypeScript errors** | `npm run type-check` |
| **Module not found** | `rm -rf node_modules && npm install` |
| **Stale cache** | `npm run clean && npm run build` |

---

## 8. Your First Tasks

### 8.1 Week 1: Orientation

**Day 1-2: Setup & Exploration**
- [ ] Complete environment setup
- [ ] Browse codebase structure
- [ ] Run application locally
- [ ] Read core documentation
- [ ] Meet the team

**Day 3-5: First Contribution**
- [ ] Pick a "good first issue" from GitHub
- [ ] Implement the fix/feature
- [ ] Write tests
- [ ] Create PR
- [ ] Address review feedback

### 8.2 Good First Issues

Look for issues tagged with `good-first-issue`:

**Example Starter Tasks:**
1. **Add validation to form field** (Frontend)
   - File: `apps/frontend/src/components/forms/employee-form.tsx`
   - Add phone number format validation
   - Difficulty: Easy

2. **Implement new API endpoint** (Backend)
   - Create GET `/hr/departments/:id/employees` endpoint
   - Follow existing patterns in EmployeeController
   - Difficulty: Easy

3. **Write missing tests** (Testing)
   - Add tests for `MoneyService.convert()` method
   - Achieve 90% coverage for the service
   - Difficulty: Easy

4. **Update documentation** (Docs)
   - Document the Permission system
   - Add examples for each permission scope
   - Difficulty: Easy

### 8.3 Week 2: Module Deep Dive

Pick ONE module to specialize in:

- **HR**: Employee management, recruitment, payroll
- **CRM**: Sales pipeline, deals, customer relationships
- **Projects**: Project tracking, resources, timesheets
- **Finance**: Invoicing, payments, accounting
- **Brain**: AI, knowledge base, RAG search

**Tasks:**
- [ ] Read module documentation
- [ ] Understand module data models
- [ ] Review existing code
- [ ] Implement 2-3 features
- [ ] Become the go-to person for this module

---

## 9. Resources & Contacts

### 9.1 Documentation Links

- **System Docs**: [/docs/core/SYSTEM_DOCUMENTATION.md](./SYSTEM_DOCUMENTATION.md)
- **Architecture**: [/docs/core/ARCHITECTURE.md](./ARCHITECTURE.md)
- **User Flows**: [/docs/core/USER_FLOWS.md](./USER_FLOWS.md)
- **Security**: [/docs/core/CORE_SECURITY.md](./CORE_SECURITY.md)
- **Deployment**: [/docs/core/DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

### 9.2 External Resources

**Official Docs:**
- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com/)
- [TypeScript](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

**Tutorials:**
- [Next.js App Router](https://nextjs.org/learn)
- [NestJS Fundamentals](https://learn.nestjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

### 9.3 Communication Channels

| Channel | Purpose | Response Time |
|---------|---------|---------------|
| **#blih-dev** | General development | 1-2 hours |
| **#blih-support** | Technical issues | 30 mins |
| **#blih-deployments** | Deployment notifications | FYI only |
| **#blih-incidents** | Production incidents | Immediate |

### 9.4 Meeting Schedule

- **Daily Standup**: 9:30 AM (15 min)
- **Sprint Planning**: Monday 10:00 AM (1 hour)
- **Sprint Review**: Friday 2:00 PM (1 hour)
- **Retrospective**: Friday 3:00 PM (1 hour)
- **Tech Talk**: Thursday 4:00 PM (30 min)

---

## Quick Reference Card

**Start Development:**
```bash
docker-compose -f docker-compose.dev.yml up -d
cd apps/api && npm run start:dev
cd apps/frontend && npm run dev
```

**Run Tests:**
```bash
npm run test
npm run test:watch
npm run test:e2e
```

**Common Commands:**
```bash
npm run lint           # Check code style
npm run format         # Format code
npm run type-check     # Check TypeScript
npm run migration:run  # Run migrations
```

**Helpful Aliases:** (Add to `~/.bashrc` or `~/.zshrc`)
```bash
alias blih-dev="cd ~/workspace/blih"
alias blih-up="docker-compose -f docker-compose.dev.yml up -d"
alias blih-down="docker-compose -f docker-compose.dev.yml down"
alias blih-logs="docker-compose -f docker-compose.dev.yml logs -f"
```

---

**Welcome to the team!** 🚀

If you have any questions, don't hesitate to reach out on Slack or during standup.

*Last Updated: February 2026*  
*Maintained by: Tech Lead*
