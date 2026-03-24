# BLIH Realistic Implementation Guide

## Executive Summary

This guide provides a **realistic, actionable roadmap** for building BLIH Version 1.0. The 3-month timeline is aggressive but achievable with disciplined scope, parallel development, and pragmatic technology choices.

**Key Reality Check:**

- ✅ Achievable: Core Platform + 2-3 modules + Brain foundation
- ⚠️ Risky: All 5 modules fully production-ready
- ❌ Unrealistic: Full ISO certification evidence in 3 months (needs operational history)

---

## Part 1: Project Structure & Organization

### 1.1 Monorepo Structure (Recommended)

```
blih-system/
├── packages/
│   ├── core-platform/          # Core services (auth, audit)
│   │   ├── backend/            # NestJS services
│   │   ├── frontend/           # Shared UI components
│   │   └── shared/             # TypeScript types, utils
│   │
│   ├── module-hr/              # HR Module
│   │   ├── backend/
│   │   ├── frontend/
│   │   ├── database/           # PostgreSQL schemas, migrations
│   │   ├── api/                # API integration layer
│   │   └── permissions/        # RBAC definitions
│   │
│   ├── module-crm/             # CRM Module (same structure)
│   ├── module-projects/        # Projects Module
│   ├── module-finance/         # Finance Module
│   ├── module-brain/           # Brain Module (Knowledge + Compliance)
│   │
│   └── shared/                 # Common utilities
│       ├── types/              # Shared TypeScript interfaces
│       ├── contracts/          # API contract definitions
│       └── guards/             # NestJS guards (RBAC, audit)
│
├── infrastructure/
│   ├── docker/                 # Dockerfiles per service
│   ├── docker-compose.yml      # Development environment
│   ├── docker-compose.prod.yml # Production deployment
│   └── k8s/                    # Kubernetes manifests (optional)
│
├── scripts/
│   ├── setup.sh                # Initial setup
│   ├── backup-databases.sh     # Backup scripts
│   └── migrate.sh              # Migration runner
│
├── docs/
│   ├── api/                    # API documentation
│   ├── architecture/           # Architecture decisions
│   └── deployment/             # Deployment guides
│
└── tests/
    ├── e2e/                    # End-to-end tests
    └── integration/            # Integration tests
```

**Why Monorepo?**

- Shared types prevent API drift
- Easier cross-module refactoring
- Single CI/CD pipeline
- Atomic commits across modules

**Alternative: Multi-repo** (if teams are geographically distributed)

- Each module in separate repo
- Shared package registry for types
- More complex CI/CD coordination

---

## Part 2: Technology Stack Decisions

### 2.1 Backend Stack

**Core Framework: NestJS**

- ✅ Built-in dependency injection
- ✅ Modular architecture (perfect for BLIH)
- ✅ TypeScript-first
- ✅ Excellent Keycloak integration
- ✅ Built-in HTTP client for API integration

**Database Choices:**

- **PostgreSQL**: All modules (HR, CRM, Projects, Finance, Brain)
  - Use Prisma for ORM
  - Version: 16.x (latest stable)
  - ACID transactions for all data
  - Version: 16.x

**API Integration:**

- **Direct API calls** between modules
  - Use HTTP clients for synchronous communication
  - Implement retry logic and circuit breakers
  - Use shared API contracts for type safety

**Identity & Access:**

- **Keycloak** (containerized)
  - Realm: `blih-realm`
  - JWT tokens
  - RBAC via groups/roles
  - Offline token support for air-gapped

### 2.2 Frontend Stack

**Framework: Next.js 14+ (App Router)**

- ✅ Server-side rendering
- ✅ API routes (can proxy to backend)
- ✅ Built-in authentication helpers
- ✅ TypeScript support

**UI Library:**

- **shadcn/ui** (recommended) or **Ant Design**
  - shadcn: More customizable, modern
  - Ant Design: Faster to build, more components out-of-box

**State Management:**

- **TanStack Query (React Query)** for server state
- **Zustand** or **Jotai** for client state (minimal)

**Forms:**

- **React Hook Form** + **Zod** (type-safe validation)

### 2.3 Infrastructure Stack

**Containerization:**

- **Docker** + **Docker Compose** (development)
- **Docker Swarm** or **Kubernetes** (production, optional)

**Object Storage:**

- **MinIO** (S3-compatible, on-premises)
  - Encrypted buckets
  - Versioning enabled

**Vector Search:**

- **Qdrant** (for AI Brain module)
  - Local deployment
  - Embeddings via local LLM or pre-computed

**AI/LLM:**

- **Ollama** (local LLM runner)
  - Models: Llama 3 8B or Mistral 7B
  - No internet required
- **Alternative: OpenAI API** (if internet allowed, not recommended for air-gapped)

**Workflow Automation:**

- **n8n** (containerized)
  - Visual workflow builder
  - Integrates with BLIH event bus

### 2.4 Development Tools

**Package Management:**

- **pnpm** (faster, better monorepo support) or **npm workspaces**

**Code Quality:**

- **ESLint** + **Prettier**
- **Husky** (pre-commit hooks)
- **TypeScript strict mode**

**Testing:**

- **Jest** (unit tests)
- **Supertest** (API tests)
- **Playwright** (E2E tests)

---

## Part 3: Realistic Development Phases

### Phase 0: Foundation (Week 1-2)

**Goal:** Core infrastructure operational

**Deliverables:**

1. ✅ Docker Compose setup with all services
2. ✅ Keycloak realm configured
3. ✅ PostgreSQL running
4. ✅ Basic NestJS backend with health check
5. ✅ Next.js frontend with login page
6. ✅ Central audit log service (PostgreSQL table)
7. ✅ API integration layer configured

**Critical Path:**

- Day 1-3: Docker Compose + databases
- Day 4-7: Keycloak integration + JWT validation
- Day 8-10: Audit logging middleware
- Day 11-14: API integration + first cross-module call

**Team:**

- 1 Backend Lead (Core Platform)
- 1 DevOps Engineer
- 1 Frontend Dev (login UI)

---

### Phase 1: Core Platform Completion (Week 3-4)

**Goal:** Governance layer fully functional

**Deliverables:**

1. ✅ RBAC system with granular permissions
2. ✅ Permission guard (`@RequirePermission('HR:employee:view')`)
3. ✅ Company context service (single `company_id`)
4. ✅ Notification service (in-app + email)
5. ✅ User management UI
6. ✅ Role assignment UI

**RBAC Permission Format:**

```
MODULE:RESOURCE:ACTION
Examples:
- HR:employee:view
- HR:employee:create
- CRM:deal:edit
- FINANCE:invoice:approve
- BRAIN:policy:view
```

**Implementation:**

```typescript
// packages/core-platform/backend/src/permissions/permissions.decorator.ts
export const RequirePermission = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

// packages/core-platform/backend/src/permissions/permissions.guard.ts
@Injectable()
export class PermissionsGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    const user = context.switchToHttp().getRequest().user;
    // Check user roles have required permissions
    return this.permissionService.hasPermissions(user, required);
  }
}
```

**Team:**

- 2 Backend Devs (Core Platform)
- 1 Frontend Dev (Admin UI)

---

### Phase 2: Brain Foundation + HR Module (Week 5-6)

**Goal:** First business module + knowledge base foundation

**Brain Module (Week 5):**

- PostgreSQL tables: `policies`, `sops`, `decisions`, `lessons_learned`
- Version control for documents
- Basic search (PostgreSQL full-text search)
- API integration layer (consumes data from other modules)

**HR Module (Week 6):**

- Employee CRUD
- Contract management
- Basic onboarding workflow
- Makes API calls: `hr.employee.hired`, `hr.employee.updated`

**Integration:**

- HR API calls → Brain observer → stores patterns
- HR UI integrated with Core Platform RBAC

**Team:**

- 1 Backend Dev (Brain)
- 2 Backend Devs (HR)
- 1 Frontend Dev (HR UI)

---

### Phase 3: CRM + Projects (Week 7-8)

**Goal:** Sales-to-delivery pipeline operational

**CRM Module:**

- Leads, contacts, organizations
- Deals and pipelines (kanban board)
- Makes API calls: `crm.deal.won`, `crm.deal.lost`

**Projects Module:**

- Subscribes to `crm.deal.won` via API webhook
- Auto-creates project with tasks
- Time tracking basics
- Makes API calls: `project.created`, `project.completed`

**API Flow:**

```
CRM: Deal Won
  ↓ (API call: POST /projects)
Projects: Create Project
  ↓ (API call: POST /brain/observations)
Brain: Log Pattern
```

**Team:**

- 2 Backend Devs (CRM)
- 2 Backend Devs (Projects)
- 2 Frontend Devs (CRM + Projects UI)

---

### Phase 4: Finance + Full Integration (Week 9-10)

**Goal:** Financial operations + end-to-end workflows

**Finance Module:**

- PostgreSQL schema (ledger, transactions)
- Payroll calculation (basic)
- Invoice generation (from deals)
- Expense claims
- Double-entry bookkeeping enforcement

**Integration:**

- `crm.deal.won` → Finance generates invoice
- `hr.employee.hired` → Finance sets up payroll
- `project.completed` → Finance recognizes revenue

**Team:**

- 2 Backend Devs (Finance - critical, needs senior)
- 1 Frontend Dev (Finance UI)

---

### Phase 5: AI Chatbot + Compliance Extensions (Week 11-12)

**Goal:** AI assistance + compliance evidence generation

**AI Chatbot:**

- Qdrant vector store setup
- Embedding generation (local LLM via Ollama)
- Permission-gated queries
- Response logging to audit

**Compliance Extensions (Brain):**

- Risk Register (PostgreSQL table)
- CAPA lifecycle (8 stages)
- Management Review template

**Team:**

- 1 AI Engineer (Chatbot)
- 1 Backend Dev (Compliance extensions)
- 1 Frontend Dev (Compliance UI)

---

### Phase 6: Hardening + Pilot (Week 13-14)

**Goal:** Production-ready deployment

**Security:**

- Encryption at rest (MinIO, database configs)
- HTTPS enforcement
- Secrets management (Docker secrets)
- RBAC matrix testing

**Performance:**

- Database indexing
- Query optimization
- Caching (Redis) for frequent reads

**Testing:**

- E2E test suite
- Load testing (simulate 50-100 users)
- Audit trail verification

**Pilot Deployment:**

- Internal pilot with real data
- Mock audit walkthrough
- Bug fixes

**Team:**

- All hands on deck
- Focus on stability, not features

---

## Part 4: Module Implementation Patterns

### 4.1 Standard Module Structure

Every module follows this pattern:

```typescript
// module-hr/backend/src/
├── hr.module.ts              # Main module
├── hr.controller.ts         # REST endpoints
├── hr.service.ts            # Business logic
├── entities/                # PostgreSQL models
│   └── employee.entity.ts
├── dto/                     # Data transfer objects
│   └── create-employee.dto.ts
├── api/                     # API integration
│   ├── hr.api.ts          # API client definitions
│   └── hr.webhooks.ts     # Webhook handlers
└── permissions/            # RBAC definitions
    └── hr.permissions.ts
```

### 4.2 API-Based Integration Pattern

**API Client (Shared):**

```typescript
// packages/shared/clients/hr.client.ts
export class HrApiClient {
  constructor(private baseURL: string) {}

  async notifyEmployeeHired(employeeId: string, companyId: string) {
    await this.http.post('/api/v1/webhooks/employee-hired', {
      employeeId,
      companyId,
      timestamp: new Date(),
    });
  }
}
```

**Publisher (HR Module):**

```typescript
// module-hr/backend/src/hr.service.ts
@Injectable()
export class HrService {
  constructor(
    private apiClient: HrApiClient,
    private auditService: AuditService,
  ) {}

  async hireEmployee(dto: CreateEmployeeDto) {
    const employee = await this.employeeModel.create(dto);

    // Notify other modules via API
    await this.apiClient.notifyEmployeeHired(employee.id, this.companyId);

    // Audit log
    await this.auditService.log({
      userId: this.currentUser.id,
      module: 'HR',
      action: 'employee.hired',
      resourceId: employee.id,
    });

    return employee;
  }
}
```

**Webhook Handler (Finance Module):**

```typescript
// module-finance/backend/src/finance.webhook.controller.ts
@Controller('webhooks')
export class FinanceWebhookController {
  constructor(private financeService: FinanceService) {}

  @Post('employee-hired')
  async handleEmployeeHired(@Body() payload: EmployeeHiredPayload) {
    // Auto-setup payroll for new employee
    await this.financeService.setupPayroll(payload.employeeId);
  }
}
```

### 4.3 RBAC Integration Pattern

**Permission Definition:**

```typescript
// module-hr/backend/src/permissions/hr.permissions.ts
export const HR_PERMISSIONS = {
  EMPLOYEE_VIEW: 'HR:employee:view',
  EMPLOYEE_CREATE: 'HR:employee:create',
  EMPLOYEE_EDIT: 'HR:employee:edit',
  EMPLOYEE_DELETE: 'HR:employee:delete',
} as const;
```

**Controller Usage:**

```typescript
// module-hr/backend/src/hr.controller.ts
@Controller('hr/employees')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  @Get()
  @RequirePermission(HR_PERMISSIONS.EMPLOYEE_VIEW)
  async listEmployees() {
    return this.hrService.findAll();
  }

  @Post()
  @RequirePermission(HR_PERMISSIONS.EMPLOYEE_CREATE)
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.hrService.hireEmployee(dto);
  }
}
```

### 4.4 Audit Logging Pattern

**Central Audit Service:**

```typescript
// packages/core-platform/backend/src/audit/audit.service.ts
@Injectable()
export class AuditService {
  constructor(
    @InjectModel(AuditLog.name) private auditModel: Model<AuditLog>,
  ) {}

  async log(data: {
    userId: string;
    module: string;
    action: string;
    resourceId?: string;
    metadata?: Record<string, any>;
  }) {
    // Immutable log - no updates, only inserts
    await this.auditModel.create({
      ...data,
      timestamp: new Date(),
      companyId: this.getCompanyId(),
      ipAddress: this.getIpAddress(),
    });
  }
}
```

**Automatic Audit Middleware:**

```typescript
// packages/core-platform/backend/src/audit/audit.middleware.ts
@Injectable()
export class AuditMiddleware implements NestMiddleware {
  constructor(private auditService: AuditService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Log all authenticated requests
    if (req.user) {
      this.auditService.log({
        userId: req.user.id,
        module: this.extractModule(req.path),
        action: `${req.method} ${req.path}`,
      });
    }
    next();
  }
}
```

---

## Part 5: Database Design Patterns

### 5.1 PostgreSQL Schema Pattern (HR Example)

```typescript
// module-hr/backend/src/entities/employee.entity.ts
@Schema({ timestamps: true })
export class Employee {
  @Prop({ required: true, unique: true })
  employeeId: string; // "EMP-001"

  @Prop({ required: true })
  companyId: string; // Always "BLIH" (single-company)

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  email: string;

  @Prop()
  department: string;

  @Prop()
  status: 'active' | 'inactive' | 'terminated';

  @Prop({ type: Date })
  hireDate: Date;

  // Soft delete
  @Prop({ default: false })
  deleted: boolean;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);

// Indexes for performance
EmployeeSchema.index({ companyId: 1, employeeId: 1 });
EmployeeSchema.index({ email: 1 });
EmployeeSchema.index({ status: 1 });
```

### 5.2 PostgreSQL Schema Pattern (Finance Example)

```typescript
// module-finance/backend/src/entities/transaction.entity.ts
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  companyId: string; // Always "BLIH"

  @Column()
  transactionType: 'debit' | 'credit';

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column()
  account: string; // Chart of accounts code

  @Column({ nullable: true })
  reference: string; // Link to source (invoice ID, etc.)

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  transactionDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;
}

// Ensure double-entry (debit = credit)
// Enforced via database constraint or application logic
```

---

## Part 6: Frontend Implementation Patterns

### 6.1 Next.js App Router Structure

```
packages/module-hr/frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Dashboard
│   ├── hr/
│   │   ├── employees/
│   │   │   ├── page.tsx    # List view
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx # Detail view
│   │   │   └── new/
│   │   │       └── page.tsx # Create form
│   │   └── layout.tsx       # HR module layout
│   └── api/                 # API routes (if needed)
├── components/
│   ├── EmployeeList.tsx
│   └── EmployeeForm.tsx
└── lib/
    ├── api.ts              # API client
    └── permissions.ts      # Permission checks
```

### 6.2 API Client Pattern

```typescript
// packages/module-hr/frontend/lib/api.ts
import { useQuery, useMutation } from '@tanstack/react-query';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export const employeeApi = {
  list: async (): Promise<Employee[]> => {
    const res = await fetch(`${API_BASE}/hr/employees`, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    if (!res.ok) throw new Error('Failed to fetch employees');
    return res.json();
  },

  create: async (data: CreateEmployeeDto): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/hr/employees`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create employee');
    return res.json();
  },
};

// React Hook
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: employeeApi.list,
  });
};
```

### 6.3 Permission Gating in UI

```typescript
// packages/shared/frontend/components/PermissionGate.tsx
export function PermissionGate({
  permission,
  children,
  fallback,
}: {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { user } = useAuth();
  const hasPermission = user?.permissions?.includes(permission);

  if (!hasPermission) {
    return fallback || <div>Access Denied</div>;
  }

  return <>{children}</>;
}

// Usage
<PermissionGate permission="HR:employee:create">
  <Button onClick={handleCreate}>Create Employee</Button>
</PermissionGate>
```

---

## Part 7: Infrastructure & Deployment

### 7.1 Docker Compose Structure

```yaml
# docker-compose.yml
version: '3.8'

services:
  # Database
  postgres:
    image: postgres:16
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: blih
      POSTGRES_USER: blih_user
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: blih_finance

  # Infrastructure Services
  keycloak:
    image: quay.io/keycloak/keycloak:24
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: ${KEYCLOAK_ADMIN_PASSWORD}
    command: start-dev
    ports:
      - "8080:8080"


  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"
      - "9001:9001"

  qdrant:
    image: qdrant/qdrant
    volumes:
      - qdrant_data:/qdrant/storage

  # Application Services
  backend-core:
    build: ./packages/core-platform/backend
    depends_on:
      - postgres
      - keycloak
    environment:
      POSTGRES_URI: postgresql://blih_user:${POSTGRES_PASSWORD}@postgres:5432/blih
      KEYCLOAK_URL: http://keycloak:8080

  frontend:
    build: ./packages/frontend
    depends_on:
      - backend-core
    ports:
      - "3000:3000"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000

volumes:
  postgres_data:
  minio_data:
  qdrant_data:
```

### 7.2 Environment Configuration

```bash
# .env.example
COMPANY_ID=BLIH
NODE_ENV=production

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=change-me
KEYCLOAK_REALM=blih-realm

# Databases
POSTGRES_PASSWORD=change-me

# JWT
JWT_SECRET=change-me-64-chars-minimum

# Module Toggles
ENABLE_HR=true
ENABLE_CRM=true
ENABLE_PROJECTS=true
ENABLE_FINANCE=true
ENABLE_BRAIN=true

# AI
AI_LLM_MODEL=llama3:8b
OLLAMA_URL=http://ollama:11434

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change-me
```

---

## Part 8: Critical Implementation Challenges

### 8.1 API Integration Reliability

**Problem:** API calls can fail or timeout, causing data inconsistency.

**Solutions:**

- Implement retry logic with exponential backoff
- Use circuit breakers for failing services
- Implement idempotent API endpoints
- API versioning for backward compatibility

```typescript
// API client with retry logic
export class ApiClient {
  async callWithRetry(url: string, data: any, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        return await this.http.post(url, data);
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.delay(Math.pow(2, i) * 1000); // Exponential backoff
      }
    }
  }
}
```

### 8.2 Audit Log Scalability

**Problem:** Audit logs can grow to millions of records.

**Solutions:**

- Index on `timestamp`, `userId`, `module`, `action`
- Archive old logs (move to cold storage after 1 year)
- Partition by date (PostgreSQL tables per month)
- Compress archived logs

### 8.3 RBAC Performance

**Problem:** Permission checks on every request can be slow.

**Solutions:**

- Cache user permissions in JWT token (refresh on role change)
- Redis cache for permission lookups
- Pre-compute permission matrices

### 8.4 AI Chatbot Security

**Problem:** AI might leak sensitive data or bypass permissions.

**Solutions:**

- Never give AI direct database access
- Only use Brain-approved content (pre-filtered)
- Log all queries and responses
- Implement response redaction for sensitive fields
- Rate limiting per user

```typescript
// AI Chatbot security pattern
async queryChatbot(userId: string, query: string) {
  // 1. Check permissions
  if (!await this.hasPermission(userId, 'BRAIN:chatbot:use')) {
    throw new ForbiddenException();
  }

  // 2. Get only approved content
  const context = await this.brainService.getApprovedContent(userId);

  // 3. Query LLM with context only
  const response = await this.llmService.query(query, context);

  // 4. Redact sensitive info
  const safeResponse = this.redactSensitiveInfo(response);

  // 5. Log everything
  await this.auditService.log({
    userId,
    module: 'BRAIN',
    action: 'chatbot.query',
    metadata: { query, responseLength: safeResponse.length },
  });

  return safeResponse;
}
```

---

## Part 9: Testing Strategy

### 9.1 Unit Tests

```typescript
// module-hr/backend/src/hr.service.spec.ts
describe('HrService', () => {
  it('should create employee and make API call', async () => {
    const apiClient = { notifyEmployeeHired: jest.fn() };
    const service = new HrService(apiClient, auditService);

    const employee = await service.hireEmployee({ firstName: 'John' });

    expect(employee).toBeDefined();
    expect(apiClient.notifyEmployeeHired).toHaveBeenCalledWith(
      employee.id,
      'BLIH',
    );
  });
});
```

### 9.2 Integration Tests

```typescript
// tests/integration/crm-projects-integration.spec.ts
describe('CRM → Projects Integration', () => {
  it('should create project when deal is won', async () => {
    // Create deal in CRM
    const deal = await crmApi.createDeal({ name: 'Test Deal' });
    await crmApi.markDealWon(deal.id);

    // Wait for API processing
    await waitForApiCall('POST', '/projects', { sourceDealId: deal.id });

    // Verify project created
    const projects = await projectsApi.list();
    expect(projects).toHaveLength(1);
    expect(projects[0].sourceDealId).toBe(deal.id);
  });
});
```

### 9.3 E2E Tests (Playwright)

```typescript
// tests/e2e/hr-workflow.spec.ts
test('employee onboarding workflow', async ({ page }) => {
  await page.goto('/hr/employees/new');
  await page.fill('[name="firstName"]', 'John');
  await page.fill('[name="lastName"]', 'Doe');
  await page.click('button[type="submit"]');

  await expect(page.locator('.success-message')).toBeVisible();

  // Verify audit log
  const auditLogs = await auditApi.list();
  expect(auditLogs).toContainEqual(
    expect.objectContaining({
      action: 'employee.created',
      module: 'HR',
    }),
  );
});
```

---

## Part 10: Realistic Timeline & Resource Allocation

### 10.1 Revised Timeline (More Realistic)

| Phase                    | Duration | Focus                                | Team Size |
| ------------------------ | -------- | ------------------------------------ | --------- |
| Phase 0: Foundation      | 2 weeks  | Docker, Keycloak, Audit              | 3 people  |
| Phase 1: Core Platform   | 2 weeks  | RBAC, API Integration, Notifications | 3 people  |
| Phase 2: Brain + HR      | 2 weeks  | Knowledge base + First module        | 4 people  |
| Phase 3: CRM + Projects  | 2 weeks  | Sales pipeline                       | 4 people  |
| Phase 4: Finance         | 2 weeks  | Financial operations                 | 3 people  |
| Phase 5: AI + Compliance | 2 weeks  | Chatbot + Risk/CAPA                  | 3 people  |
| Phase 6: Hardening       | 2 weeks  | Security, Performance, Testing       | All hands |

**Total: 14 weeks (3.5 months)** - More realistic than 12 weeks

### 10.2 Team Composition

**Minimum Viable Team:**

- 1 Tech Lead / Architect
- 3-4 Backend Developers (NestJS)
- 2 Frontend Developers (Next.js)
- 1 DevOps Engineer
- 1 QA Engineer
- 1 Product/Compliance Specialist (part-time)

**Ideal Team:**

- 2 Senior Backend (Core + Modules)
- 3 Mid-level Backend (Modules)
- 2 Frontend (UI + Dashboards)
- 1 AI Engineer (Chatbot)
- 1 DevOps (Infrastructure)
- 1 QA (Testing)
- 1 Compliance Specialist (Standards mapping)

**Total: 11-12 people**

---

## Part 11: Risk Mitigation

### 11.1 Technical Risks

| Risk                        | Probability | Impact   | Mitigation                               |
| --------------------------- | ----------- | -------- | ---------------------------------------- |
| API integration bottleneck  | Medium      | High     | Implement circuit breakers, retry logic  |
| Audit log performance       | High        | Medium   | Indexing, archiving strategy             |
| RBAC complexity             | Medium      | High     | Start simple, iterate                    |
| Database migration failures | Low         | High     | Test migrations in staging               |
| AI chatbot security breach  | Low         | Critical | Sandbox, no DB access, extensive testing |

### 11.2 Timeline Risks

| Risk               | Mitigation                               |
| ------------------ | ---------------------------------------- |
| Scope creep        | Strict feature freeze after Week 10      |
| Integration delays | Daily stand-ups, integration tests early |
| Compliance gaps    | Compliance specialist reviews weekly     |
| Team burnout       | Realistic estimates, buffer time         |

---

## Part 12: Success Criteria

### 12.1 MVP Definition (End of 3 Months)

**Must Have:**

- ✅ Core Platform (RBAC, Audit, API Integration) operational
- ✅ 2-3 Business Modules (HR + CRM minimum)
- ✅ Brain foundation (policies, basic knowledge)
- ✅ End-to-end workflow (deal → project → invoice)
- ✅ On-premises deployment working
- ✅ Audit trail generating evidence

**Nice to Have:**

- ⚠️ All 5 modules (can defer Projects/Finance if needed)
- ⚠️ Full AI Chatbot (can start with basic search)
- ⚠️ Complete compliance extensions (Risk/CAPA can be v1.1)

### 12.2 Production Readiness Checklist

- [ ] All critical paths tested (E2E)
- [ ] Security audit passed (penetration testing)
- [ ] Performance tested (50+ concurrent users)
- [ ] Backup/restore procedures documented
- [ ] Deployment runbook complete
- [ ] Monitoring/alerting configured
- [ ] Documentation complete
- [ ] Internal pilot successful

---

## Conclusion

**Building BLIH in 3 months is ambitious but achievable if you:**

1. **Prioritize ruthlessly** - Core Platform + 2-3 modules first
2. **Build modularly** - Each module independently deployable
3. **Test continuously** - Integration tests from Week 1
4. **Accept MVP quality** - Polish comes in v1.1
5. **Focus on compliance** - Audit logging is non-negotiable

**The biggest risk is scope creep.** Stick to the plan, deliver working software incrementally, and iterate based on real usage.

**Remember:** Compliance evidence needs operational history. You can build the system in 3 months, but genuine audit readiness requires 6-12 months of operational data.

Good luck! 🚀
