# BLIH System Architecture

## Table of Contents
1. [Executive Overview](#executive-overview)
2. [Architectural Principles](#architectural-principles)
3. [System Layers](#system-layers)
4. [Component Architecture](#component-architecture)
5. [Data Architecture](#data-architecture)
6. [Integration Architecture](#integration-architecture)
7. [Security Architecture](#security-architecture)
8. [Deployment Architecture](#deployment-architecture)
9. [Scalability & Performance](#scalability--performance)
10. [Appendix](#appendix)

---

## Executive Overview

### Architecture Style
**Modular Event-Driven Microservices** with:
- **Frontend**: Next.js 16 App Router with Server Components
- **Backend**: NestJS modular monolith with microservices capabilities
- **Data Layer**: Polyglot persistence (MongoDB + PostgreSQL + Qdrant)
- **Integration**: Event-driven architecture with RabbitMQ
- **AI**: Local LLM with RAG pattern

### Key Characteristics
| Characteristic | Implementation |
|---------------|----------------|
| **Modularity** | Self-contained business modules with clear boundaries |
| **Event-Driven** | Async communication via RabbitMQ pub/sub |
| **Single Tenant** | Company context enforced throughout (`company_id: "BLIH"`) |
| **Compliance-First** | Audit logging, RBAC, data lineage built-in |
| **Air-Gap Ready** | All services run on-premises, no external dependencies |

### System Boundaries
```
┌─────────────────────────────────────────────────────────────────────────┐
│                         BLIH SYSTEM                                      │
│                                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   HR     │  │   CRM    │  │ Projects │  │  Finance │  │  Brain   │   │
│  │  Module  │  │  Module  │  │  Module  │  │  Module  │  │ (AI/KB)  │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       │             │             │             │             │        │
│       └─────────────┴─────────────┴─────────────┴─────────────┘        │
│                         │                                                │
│              ┌──────────┴──────────┐                                   │
│              │   Core Platform      │                                   │
│              │  (Auth, Audit, Events) │                                   │
│              └──────────┬──────────┘                                   │
│                         │                                                │
│       ┌─────────────────┼─────────────────┐                          │
│       ▼                 ▼                 ▼                          │
│  ┌────────┐      ┌──────────┐      ┌────────────┐                     │
│  │MongoDB │      │ PostgreSQL│      │   Qdrant   │                     │
│  │        │      │          │      │  (Vectors) │                     │
│  └────────┘      └──────────┘      └────────────┘                     │
│                                                                          │
│  Supporting: Keycloak, RabbitMQ, MinIO, Ollama, Redis, n8n             │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Architectural Principles

### 1. Modular Autonomy
Each module is self-contained with:
- Own database schemas/collections
- Own API endpoints
- Own frontend components
- Own event definitions
- Own permission matrix

```
Module Boundary:
┌─────────────────────────────────────┐
│           HR Module                 │
│  ┌─────────┐ ┌─────────┐           │
│  │ Backend │ │Frontend │           │
│  │ Service │ │  UI     │           │
│  └────┬────┘ └────┬────┘           │
│       │           │                 │
│  ┌────┴───────────┴────┐           │
│  │   HR Database       │           │
│  │   (MongoDB)         │           │
│  └─────────────────────┘           │
│                                    │
│  Events: hr.employee.hired         │
│  Events: hr.employee.updated       │
│                                    │
└─────────────────────────────────────┘
```

### 2. Event-Driven Integration
Modules communicate via events, not direct API calls:
```
┌─────────┐    Event: crm.deal.won     ┌──────────┐
│   CRM   │ ────────────────────────▶ │ Projects │
│ Module  │                           │  Module  │
└─────────┘                           └──────────┘
     │
     │ Event: crm.deal.won
     ▼
┌──────────┐
│  Finance │ (Auto-generate invoice)
│  Module  │
└──────────┘
```

### 3. Compliance-First Design
Every action is auditable:
```
User Action → Permission Check → Business Logic → Audit Log → Response
     │                                                   │
     ▼                                                   ▼
┌────────────┐                                    ┌──────────────┐
│ RBAC Guard │                                    │ Audit Schema │
│ (Allowed?) │                                    │ (Immutable)  │
└────────────┘                                    └──────────────┘
```

### 4. Single Company Context
All data filtered by `company_id = "BLIH"`:
```typescript
// Applied at database layer
// Applied at API layer
// Applied at event layer
// Applied at audit layer
```

---

## System Layers

### Layer 1: Presentation Layer (Frontend)

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    Next.js 16 App Router                     │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Server    │  │   Client    │  │      API Routes      │  │   │
│  │  │ Components  │  │ Components  │  │    (Proxy to API)    │  │   │
│  │  │             │  │             │  │                      │  │   │
│  │  │ • SSR/SSG   │  │ • State     │  │ • File uploads      │  │   │
│  │  │ • Data fetch│  │ • Events    │  │ • Auth proxy        │  │   │
│  │  │ • SEO       │  │ • Effects   │  │ • SSE streams       │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  State Management:                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  TanStack Query (Server State)                              │   │
│  │  Zustand (Client State - minimal)                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  UI Components:                                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  shadcn/ui + Tailwind CSS + Radix Primitives                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Component Architecture:**
```
app/
├── (auth)/                    # Route group - no sidebar
│   ├── login/page.tsx        # Server Component
│   └── layout.tsx            # Auth layout
│
├── (dashboard)/               # Route group - with sidebar
│   ├── layout.tsx            # Dashboard shell
│   ├── page.tsx              # Dashboard home
│   └── hr/
│       ├── page.tsx          # HR dashboard (Server)
│       └── employees/
│           ├── page.tsx      # Employee list (Server)
│           └── EmployeeTable.tsx # Client Component (interactive)
```

### Layer 2: API Gateway Layer

```
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NestJS API Gateway                        │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │              Middleware Stack                        │   │   │
│  │  │  1. Request ID                                      │   │   │
│  │  │  2. CORS                                           │   │   │
│  │  │  3. Helmet (Security Headers)                      │   │   │
│  │  │  4. Rate Limiting                                  │   │   │
│  │  │  5. JWT Auth Guard                                 │   │   │
│  │  │  6. Company Context Guard                          │   │   │
│  │  │  7. Audit Log Interceptor                          │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │              Request Flow                          │   │   │
│  │  │                                                     │   │   │
│  │  │  Request → Guards → Pipes → Controller → Service  │   │   │
│  │  │              ↓                                      │   │   │
│  │  │         Interceptors (Audit, Transform)            │   │   │
│  │  │              ↓                                      │   │   │
│  │  │         Exception Filters                          │   │   │
│  │  │              ↓                                      │   │   │
│  │  │         Response                                  │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │  Modules:                                                    │   │
│  │  ├── AuthModule      → JWT validation, Keycloak integration   │   │
│  │  ├── AuditModule     → Audit logging service                  │   │
│  │  ├── EventModule     → Event bus abstraction                 │   │
│  │  ├── PermissionModule → RBAC enforcement                    │   │
│  │  ├── UserModule      → User management                      │   │
│  │  └── GatewayModule   → Route aggregation                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Rate Limiting: 100 requests/minute per user                        │
│  Timeout: 30 seconds default, 60 seconds for RAG queries             │
└─────────────────────────────────────────────────────────────────────┘
```

### Layer 3: Domain Layer (Business Logic)

```
┌─────────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Module Architecture                        │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  Command    │  │   Query     │  │      Event          │  │   │
│  │  │  Handler    │  │   Handler   │  │     Handler         │  │   │
│  │  │             │  │             │  │                     │  │   │
│  │  │ Write Ops   │  │ Read Ops    │  │ External Events     │  │   │
│  │  │ Validation  │  │ Optimization│  │ Integration         │  │   │
│  │  │ Business    │  │ Caching     │  │ Side Effects        │  │   │
│  │  │ Rules       │  │ Projection  │  │ Notifications       │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   │
│  │         │                │                    │            │   │
│  │         └────────────────┴────────────────────┘            │   │
│  │                          │                                 │   │
│  │              ┌───────────┴───────────┐                   │   │
│  │              │     Domain Service     │                   │   │
│  │              │                        │                   │   │
│  │              │ • Business Logic       │                   │   │
│  │              │ • Domain Rules         │                   │   │
│  │              │ • Calculations         │                   │   │
│  │              │ • Validation           │                   │   │
│  │              └───────────┬───────────┘                   │   │
│  │                          │                                 │   │
│  │              ┌───────────┴───────────┐                   │   │
│  │              │    Entity/Repository   │                   │   │
│  │              │                        │                   │   │
│  │              │ • Data Access          │                   │   │
│  │              │ • Schema Definition    │                   │   │
│  │              │ • Relationships        │                   │   │
│  │              └────────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Example: HR Domain Service**
```typescript
// Domain logic, no framework dependencies
class EmployeeDomainService {
  validateHire(employee: Employee): ValidationResult {
    // Business rules:
    // - Cannot hire if email exists
    // - Cannot hire if under 18
    // - Generate unique employee ID
  }
  
  calculateOnboardingSteps(role: string): OnboardingStep[] {
    // Role-specific onboarding flow
  }
  
  canTerminate(employee: Employee, reason: TerminationReason): boolean {
    // Check if termination allowed
  }
}
```

### Layer 4: Data Layer

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Polyglot Persistence                       │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   MongoDB    │  │  PostgreSQL  │  │     Qdrant       │  │   │
│  │  │              │  │              │  │   (Vector DB)    │  │   │
│  │  │ • HR Docs    │  │ • Finance    │  │ • Embeddings     │  │   │
│  │  │ • CRM Docs   │  │ • Accounting │  │ • RAG Search     │  │   │
│  │  │ • Projects   │  │ • Invoices   │  │ • Similarity     │  │   │
│  │  │ • Brain KB   │  │ • Payroll    │  │   Search         │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ Flexible     │  │ ACID         │  │ HNSW Index       │  │   │
│  │  │ Schema       │  │ Transactions │  │ Quantization     │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  Supporting:                                                   │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │    Redis     │  │    MinIO     │  │   Keycloak DB    │  │   │
│  │  │              │  │              │  │    (Postgres)    │  │   │
│  │  │ • Sessions   │  │ • Files      │  │ • Users          │  │   │
│  │  │ • Cache      │  │ • Backups    │  │ • Roles          │  │   │
│  │  │ • Rate Limit │  │ • Versions   │  │ • Permissions    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Core Platform Components

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CORE PLATFORM COMPONENTS                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  1. AUTHENTICATION & AUTHORIZATION                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  Keycloak   │  │   JWT       │  │   RBAC Engine       │  │   │
│  │  │             │  │   Tokens    │  │                     │  │   │
│  │  │ • SSO       │  │ • Access    │  │ • Permission Check  │  │   │
│  │  │ • MFA       │  │ • Refresh   │  │ • Role Resolution   │  │   │
│  │  │ • LDAP      │  │ • Offline   │  │ • Matrix Eval       │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   │
│  │         │                │                    │            │   │
│  │         └────────────────┴────────────────────┘            │   │
│  │                          │                                 │   │
│  │              ┌───────────┴───────────┐                   │   │
│  │              │   PermissionGuard     │                   │   │
│  │              │   @RequirePermission  │                   │   │
│  │              │   (HR:employee:view)  │                   │   │
│  │              └───────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  2. AUDIT LOGGING                                            │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  Audit      │  │  Immutable  │  │   Export/          │  │   │
│  │  │  Service    │  │  Storage    │  │   Archive          │  │   │
│  │  │             │  │             │  │                    │  │   │
│  │  │ Capture all │  │ MongoDB     │  │ • PDF Reports     │  │   │
│  │  │ actions     │  │ • No updates│  │ • CSV Export      │  │   │
│  │  │             │  │ • Append    │  │ • Compliance      │  │   │
│  │  │             │  │   only      │  │   Evidence        │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   │
│  │         │                │                    │            │   │
│  │         └────────────────┴────────────────────┘            │   │
│  │                          │                                 │   │
│  │              ┌───────────┴───────────┐                   │   │
│  │              │  AuditLogInterceptor    │                   │   │
│  │              │  Auto-log all requests  │                   │   │
│  │              └───────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  3. EVENT BUS                                                │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  RabbitMQ   │  │   Event     │  │   Dead Letter       │  │   │
│  │  │             │  │   Store     │  │   Queue             │  │   │
│  │  │ • Pub/Sub   │  │ • MongoDB   │  │ • Failed events     │  │   │
│  │  │ • Routing   │  │ • Event log │  │ • Retry logic       │  │   │
│  │  │ • Priority  │  │ • Replay    │  │ • Alerting          │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │   │
│  │         │                │                    │            │   │
│  │         └────────────────┴────────────────────┘            │   │
│  │                          │                                 │   │
│  │              ┌───────────┴───────────┐                   │   │
│  │              │   Event Definitions     │                   │   │
│  │              │   (Shared Package)      │                   │   │
│  │              └───────────────────────┘                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  4. NOTIFICATION SERVICE                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │  In-App     │  │   Email     │  │   Push (Future)     │  │   │
│  │  │             │  │             │  │                     │  │   │
│  │  │ • Realtime  │  │ • SMTP      │  │ • Web Push        │  │   │
│  │  │ • Badges    │  │ • Templates │  │ • Mobile          │  │   │
│  │  │ • Center    │  │ • Queue     │  │ • Browser         │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Module Component Interaction

```
┌─────────────────────────────────────────────────────────────────────┐
│                 MODULE COMPONENT INTERACTION                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      HR Module                               │   │
│  │                                                              │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │   │
│  │  │  Controller │───▶│   Service   │───▶│  Repository     │  │   │
│  │  │             │    │             │    │                 │  │   │
│  │  │ POST /hire  │    │ • Validate  │    │ • MongoDB       │  │   │
│  │  │             │    │ • Business  │    │ • CRUD          │  │   │
│  │  │             │    │   Logic       │    │ • Queries       │  │   │
│  │  └──────┬──────┘    └──────┬──────┘    └─────────────────┘  │   │
│  │         │                  │                                │   │
│  │         │    ┌─────────────┴─────────────┐                  │   │
│  │         │    │                           │                  │   │
│  │         ▼    ▼                           ▼                  │   │
│  │    ┌─────────┐                    ┌──────────────┐        │   │
│  │    │ Events  │───────────────────▶│ Event Bus    │        │   │
│  │    │ Publish │  hr.employee.hired  │ (RabbitMQ)   │        │   │
│  │    └─────────┘                    └──────┬───────┘        │   │
│  │                                          │                  │   │
│  │  ┌─────────────┐    ┌─────────────────────┴─────────────┐  │   │
│  │  │   Audit     │◀───│         Other Modules            │  │   │
│  │  │   Log       │    │                                │  │   │
│  │  │             │    │  ┌─────────┐  ┌──────────────┐  │  │   │
│  │  │ • Action    │    │  │ Projects│  │    Finance   │  │  │   │
│  │  │ • User      │    │  │         │  │              │  │  │   │
│  │  │ • Timestamp │    │  │ Auto-   │  │ Setup        │  │  │   │
│  │  └─────────────┘    │  │ create  │  │ payroll      │  │  │   │
│  │                     │  │ project │  │              │  │  │   │
│  │                     │  └─────────┘  └──────────────┘  │  │   │
│  │                     └─────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Architecture

### Database Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DATABASE STRATEGY                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  MONGODB (Document Store) - Primary Database                  │   │
│  │  Database: blih                                             │   │
│  │                                                              │   │
│  │  Collections:                                                 │   │
│  │  ├── audit_logs          (sharded by month)                 │   │
│  │  ├── users               (indexed by email)                 │   │
│  │  ├── roles               (small, cached)                    │   │
│  │  ├── hr_employees        (indexed by employee_id)           │   │
│  │  ├── hr_contracts        (indexed by employee_id)           │   │
│  │  ├── crm_leads           (indexed by status, assigned_to)   │   │
│  │  ├── crm_deals           (indexed by stage, organization)   │   │
│  │  ├── crm_organizations   (indexed by name)                │   │
│  │  ├── projects            (indexed by status, manager)       │   │
│  │  ├── tasks               (indexed by project_id, status)    │   │
│  │  ├── brain_policies      (text index on content)            │   │
│  │  ├── brain_decisions    (indexed by date, category)        │   │
│  │  ├── compliance_risks   (indexed by status, owner)         │   │
│  │  ├── compliance_capas    (indexed by status, due_date)        │   │
│  │  └── events              (sharded by month)                 │   │
│  │                                                              │   │
│  │  Indexes:                                                   │   │
│  │  • company_id: 1 (on ALL collections)                       │   │
│  │  • Compound: { company_id: 1, created_at: -1 }             │   │
│  │  • Text indexes for search                                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  POSTGRESQL (Relational) - Finance Module                    │   │
│  │  Database: blih_finance                                     │   │
│  │                                                              │   │
│  │  Tables:                                                      │   │
│  │  ├── accounts              (chart of accounts)              │   │
│  │  ├── transactions          (journal entries)                  │   │
│  │  ├── invoices              (accounts receivable)            │   │
│  │  ├── invoice_items         (line items)                     │   │
│  │  ├── payments              (payment records)                │   │
│  │  ├── payroll_records       (payroll runs)                   │   │
│  │  ├── payroll_items         (employee payroll)               │   │
│  │  └── expense_claims        (expense tracking)               │   │
│  │                                                              │   │
│  │  Constraints:                                               │   │
│  │  • Double-entry: SUM(debits) = SUM(credits)                 │   │
│  │  • Foreign keys to accounts                                 │   │
│  │  • Trigger: Auto-update account balances                    │   │
│  │  • company_id filter on ALL tables                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  QDRANT (Vector DB) - RAG / AI                               │   │
│  │  Collections:                                               │   │
│  │                                                              │   │
│  │  ├── brain_documents                                       │   │
│  │  │   • Vector size: 384 (all-MiniLM-L6-v2)                 │   │
│  │  │   • Distance: Cosine                                    │   │
│  │  │   • HNSW: m=16, ef=128                                  │   │
│  │  │   • Payload: { title, content, metadata, permissions }  │   │
│  │  │                                                        │   │
│  │  └── chat_history (optional)                              │   │
│  │      • Vector size: 384                                   │   │
│  │      • For conversation memory                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  REDIS (Cache/Session)                                       │   │
│  │                                                              │   │
│  │  Key Patterns:                                              │   │
│  │  • session:{token}     → User session data                  │   │
│  │  • permissions:{userId} → Cached permissions               │   │
│  │  • rate:{ip}          → Rate limiting counter             │   │
│  │  • cache:{hash}       → API response cache                │   │
│  │  • lock:{resource}    → Distributed locks                 │   │
│  │                                                              │   │
│  │  TTL:                                                        │   │
│  │  • Sessions: 24 hours                                      │   │
│  │  • Permissions: 1 hour                                     │   │
│  │  • API Cache: 5 minutes                                    │   │
│  │  • Rate limit: 1 minute                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow Patterns

**Pattern 1: Standard CRUD Flow**
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│   UI    │───▶│   API   │───▶│ Service │───▶│   DB    │
│ Action  │    │         │    │         │    │         │    │         │
└─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘
                                                 │
                                                 ▼
                                           ┌─────────┐
                                           │  Audit  │
                                           │   Log   │
                                           └─────────┘
```

**Pattern 2: Event-Driven Flow**
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Source │───▶│ Service │───▶│  Event  │───▶│  Event  │
│  Module │    │         │    │  Bus    │    │ Store   │
└─────────┘    └─────────┘    └────┬────┘    └─────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                    │
              ▼                    ▼                    ▼
        ┌─────────┐          ┌─────────┐          ┌─────────┐
        │ Module  │          │ Module  │          │  Brain  │
        │    A    │          │    B    │          │Observer │
        │Subscriber│          │Subscriber│          │         │
        └─────────┘          └─────────┘          └─────────┘
```

**Pattern 3: RAG Query Flow**
```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  User   │───▶│   API   │───▶│  Hybrid │───▶│  Vector │───▶│  LLM    │
│  Query  │    │         │    │  Search │    │  Store  │    │(Ollama) │
└─────────┘    └─────────┘    └────┬────┘    └─────────┘    └────┬────┘
                                   │                              │
                                   │    ┌─────────┐               │
                                   └───▶│ Keyword │◀──────────────┘
                                        │ Search  │   Context
                                        │(MongoDB)│   + Response
                                        └────┬────┘
                                             │
                                             ▼
                                        ┌─────────┐
                                        │  User   │
                                        │ Response│
                                        └─────────┘
```

---

## Integration Architecture

### Event Bus Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RABBITMQ TOPOLOGY                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     EXCHANGES                                │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   direct     │  │   topic      │  │    fanout        │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ system.direct│  │ system.topic │  │ system.broadcast │  │   │
│  │  │ (commands)   │  │ (events)     │  │ (notifications)  │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │   │
│  │         │                 │                   │            │   │
│  └─────────┼─────────────────┼───────────────────┼────────────┘   │
│            │                 │                   │                 │
│            ▼                 ▼                   ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      QUEUES                                    │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │ hr.events    │  │ crm.events   │  │ finance.events   │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ • employee.  │  │ • lead.      │  │ • invoice.       │  │   │
│  │  │   hired      │  │   converted  │  │   generated      │  │   │
│  │  │ • employee.  │  │ • deal.      │  │ • payment.       │  │   │
│  │  │   updated    │  │   won        │  │   received       │  │   │
│  │  │ • employee.  │  │ • deal.      │  │ • payroll.       │  │   │
│  │  │   terminated │  │   lost       │  │   processed      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │projects.events│ │brain.events  │  │notifications    │  │   │
│  │  │               │  │              │  │                 │  │   │
│  │  │ • project.    │  │ • policy.    │  │ • email.queue   │  │   │
│  │  │   created     │  │   published  │  │ • inapp.queue   │  │   │
│  │  │ • project.    │  │ • decision.  │  │ • sms.queue     │  │   │
│  │  │   completed   │  │   logged     │  │                 │  │   │
│  │  │ • task.       │  │ • search.    │  │                 │  │   │
│  │  │   completed   │  │   query      │  │                 │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────┐                                            │   │
│  │  │ dlq.events   │  (Dead Letter Queue)                      │   │
│  │  │              │  - Failed events after 3 retries            │   │
│  │  └──────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Routing Keys:                                                       │
│  • hr.employee.hired                                                │
│  • crm.deal.won                                                     │
│  • crm.deal.lost                                                    │
│  • projects.project.created                                         │
│  • finance.invoice.generated                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Module Integration Matrix

| Source Event | Subscribers | Action |
|-------------|-------------|--------|
| `hr.employee.hired` | Finance, Brain | Setup payroll, log pattern |
| `crm.deal.won` | Projects, Finance | Create project, generate invoice |
| `crm.deal.lost` | Brain | Log lesson learned |
| `projects.project.completed` | Finance | Recognize revenue |
| `finance.invoice.paid` | CRM | Update deal status |
| `brain.policy.published` | Notifications | Notify relevant users |

### API Integration Patterns

**Synchronous (Internal):**
```typescript
// Gateway pattern - aggregating from multiple modules
@Controller('dashboard')
class DashboardGateway {
  constructor(
    private hrService: HrGatewayService,
    private crmService: CrmGatewayService,
    private financeService: FinanceGatewayService,
  ) {}

  @Get('stats')
  async getDashboardStats() {
    // Parallel fetching
    const [hr, crm, finance] = await Promise.all([
      this.hrService.getStats(),
      this.crmService.getStats(),
      this.financeService.getStats(),
    ]);
    return { hr, crm, finance };
  }
}
```

**Asynchronous (Event-Driven):**
```typescript
// Publishing event
@Injectable()
class HrService {
  async hireEmployee(dto: CreateEmployeeDto) {
    const employee = await this.employeeRepo.create(dto);
    
    // Publish event
    this.eventBus.publish(new EmployeeHiredEvent({
      employeeId: employee.id,
      companyId: 'BLIH',
    }));
    
    return employee;
  }
}

// Subscribing to event
@Injectable()
class FinanceSubscriber {
  @OnEvent('hr.employee.hired')
  async handleEmployeeHired(event: EmployeeHiredEvent) {
    await this.payrollService.setupPayroll(event.employeeId);
  }
}
```

---

## Security Architecture

### Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Layer 6: Application                                                │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Input validation                                           │   │
│  │ • Output encoding                                            │   │
│  │ • CSRF tokens                                                │   │
│  │ • XSS protection                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Layer 5: API                                                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • JWT token validation                                       │   │
│  │ • RBAC permission checks                                     │   │
│  │ • Rate limiting                                              │   │
│  │ • API versioning                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Layer 4: Authentication                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Keycloak IAM                                               │   │
│  │ • Multi-factor auth (optional)                             │   │
│  │ • Session management                                         │   │
│  │ • Password policies                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Layer 3: Network                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • TLS 1.3 encryption                                         │   │
│  │ • Firewall rules                                             │   │
│  │ • VPN access (admin)                                         │   │
│  │ • DDoS protection                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Layer 2: Data                                                         │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Encryption at rest (AES-256)                               │   │
│  │ • Field-level encryption (PII)                               │   │
│  │ • Data classification                                        │   │
│  │ • Backup encryption                                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Layer 1: Infrastructure                                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ • Docker container isolation                                 │   │
│  │ • Network segmentation                                       │   │
│  │ • Secrets management                                         │   │
│  │ • OS hardening                                               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### RBAC Implementation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RBAC ARCHITECTURE                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Permission Format: MODULE:RESOURCE:ACTION                          │
│  Examples:                                                           │
│  • HR:employee:view                                                  │
│  • HR:employee:create                                                │
│  • CRM:deal:approve                                                  │
│  • FINANCE:invoice:delete                                            │
│  • BRAIN:policy:admin                                                │
│  • ADMIN:*:*                                                         │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   Default Roles                                │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │   │
│  │  │   Admin     │  │   Manager   │  │   Employee         │  │   │
│  │  │             │  │             │  │                    │  │   │
│  │  │ • Full      │  │ • Module    │  │ • Self-service     │  │   │
│  │  │   access    │  │   admin     │  │ • View data        │  │   │
│  │  │ • User mgmt │  │ • Approve   │  │ • Limited create   │  │   │
│  │  │ • Settings  │  │ • Reports   │  │ • No delete        │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────┘  │   │
│  │                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐                           │   │
│  │  │  Finance    │  │  Compliance │                           │   │
│  │  │   Officer   │  │   Officer   │                           │   │
│  │  │             │  │             │                           │   │
│  │  │ • All       │  │ • Risk mgmt │                           │   │
│  │  │   financial │  │ • CAPA      │                           │   │
│  │  │ • Payroll   │  │ • Audits    │                           │   │
│  │  │ • Invoicing │  │ • Reviews   │                           │   │
│  │  └─────────────┘  └─────────────┘                           │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Permission Check Flow                           │   │
│  │                                                              │   │
│  │  Request → JWT Verify → Extract Permissions → Check → Allow │   │
│  │     │                      │                     │        │    │   │
│  │     │                      │                     │        │    │   │
│  │     ▼                      ▼                     ▼        ▼    │   │
│  │  ┌─────────┐          ┌─────────┐         ┌────────┐ ┌──────┐│   │
│  │  │Invalid  │          │Cache    │         │Match?  │ │Proceed││   │
│  │  │Token?   │─────────▶│Lookup   │────────▶│Yes/No  │─│or 403 ││   │
│  │  │         │          │         │         │        │ │      ││   │
│  │  └─────────┘          └─────────┘         └────────┘ └──────┘│   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Audit Logging

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AUDIT LOGGING ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              What Gets Logged                                │   │
│  │                                                              │   │
│  │  • Authentication events (login, logout, refresh)            │   │
│  │  • Authorization failures (access denied)                    │   │
│  │  • All data modifications (create, update, delete)         │   │
│  │  • Sensitive data access (PII, financial)                    │   │
│  │  • RAG queries and responses                                 │   │
│  │  • Administrative actions (role changes, settings)           │   │
│  │  • System events (deployment, config changes)                │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Audit Log Schema                                │   │
│  │                                                              │   │
│  │  {                                                            │   │
│  │    _id: ObjectId,                                             │   │
│  │    timestamp: ISODate,        // When                         │   │
│  │    userId: String,            // Who                          │   │
│  │    userEmail: String,                                         │   │
│  │    action: String,            // What (e.g., "employee.create")│   │
│  │    module: String,            // Which module                 │   │
│  │    resourceId: String,        // Which resource              │   │
│  │    companyId: "BLIH",       // Always filtered             │   │
│  │    ipAddress: String,                                       │   │
│  │    userAgent: String,                                       │   │
│  │    requestId: String,         // Correlation ID              │   │
│  │    changes: {                                                 │   │
│  │      before: Object,         // Previous state              │   │
│  │      after: Object           // New state                    │   │
│  │    },                                                        │   │
│  │    metadata: Object          // Additional context           │   │
│  │  }                                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Audit Flow                                      │   │
│  │                                                              │   │
│  │  ┌─────────┐    ┌─────────────┐    ┌─────────────┐         │   │
│  │  │ Request │───▶│ Interceptor │───▶│ Audit Log  │         │   │
│  │  │         │    │             │    │ Service    │         │   │
│  │  └─────────┘    │ • Extract   │    │            │         │   │
│  │                 │   user      │    │ • Validate │         │   │
│  │                 │ • Capture   │    │ • Enrich   │         │   │
│  │                 │   changes   │    │ • Store    │         │   │
│  │                 │ • Log       │    │            │         │   │
│  │                 └─────────────┘    └──────┬─────┘         │   │
│  │                                          │                  │   │
│  │                                          ▼                  │   │
│  │                                   ┌─────────────┐            │   │
│  │                                   │  MongoDB   │            │   │
│  │                                   │ audit_logs │            │   │
│  │                                   │ (sharded)  │            │   │
│  │                                   └─────────────┘            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  Retention: 7 years (compliance requirement)                          │
│  Archival: After 1 year, move to cold storage                        │
│  Encryption: At rest (AES-256), in transit (TLS)                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Infrastructure Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL LAYER                            │   │
│  │                                                              │   │
│  │  ┌──────────────┐      ┌──────────────┐                   │   │
│  │  │   Users       │      │   Admins     │                   │   │
│  │  │   (Browser)   │      │   (VPN)      │                   │   │
│  │  └──────┬───────┘      └──────┬───────┘                   │   │
│  │         │                      │                           │   │
│  └─────────┼──────────────────────┼───────────────────────────┘   │
│            │                      │                               │
│            ▼                      ▼                               │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    NETWORK LAYER                             │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │               Load Balancer                          │   │   │
│  │  │  (Nginx / HAProxy / CloudFlare)                     │   │   │
│  │  │  • SSL termination                                   │   │   │
│  │  │  • Rate limiting                                     │   │   │
│  │  │  • DDoS protection                                   │   │   │
│  │  └──────────────────────┬──────────────────────────────┘   │   │
│  │                         │                                  │   │
│  └─────────────────────────┼──────────────────────────────────┘   │
│                            │                                      │
│            ┌───────────────┼───────────────┐                      │
│            │               │               │                      │
│            ▼               ▼               ▼                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                 APPLICATION LAYER                            │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   Frontend   │  │    Backend   │  │   RAG Service      │  │   │
│  │  │              │  │              │  │                   │  │   │
│  │  │ Next.js      │  │ NestJS API   │  │ NestJS + Python   │  │   │
│  │  │ (Port 3000)  │  │ (Port 4000)  │  │ (Port 4001)       │  │   │
│  │  │              │  │              │  │                   │  │   │
│  │  │ • SSR/SSG    │  │ • REST API   │  │ • Ingestion       │  │   │
│  │  │ • API proxy  │  │ • Auth       │  │ • Search          │  │   │
│  │  │ • Static     │  │ • Validation │  │ • Generation      │  │   │
│  │  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │   │
│  │         │                  │                   │            │   │
│  │         └──────────────────┼───────────────────┘            │   │
│  │                            │                                │   │
│  └────────────────────────────┼────────────────────────────────┘   │
│                                 │                                   │
│  ┌──────────────────────────────┼─────────────────────────────────┐   │
│  │                    SERVICE MESH  (Optional)                   │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   Keycloak   │  │  RabbitMQ    │  │      n8n         │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ (Port 8080)  │  │ (Port 5672)  │  │ (Port 5678)      │  │   │
│  │  │              │  │ (Mgmt 15672) │  │                  │  │   │
│  │  │ • Auth       │  │ • Events     │  │ • Workflows      │  │   │
│  │  │ • SSO        │  │ • Queues     │  │ • Automation     │  │   │
│  │  │ • Tokens     │  │ • Routing    │  │ • Integration    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐                        │   │
│  │  │    MinIO     │  │    Redis     │                        │   │
│  │  │              │  │              │                        │   │
│  │  │ (Port 9000)  │  │ (Port 6379)  │                        │   │
│  │  │ (Console 9001)│               │                        │   │
│  │  │              │  │              │                        │   │
│  │  │ • Files      │  │ • Cache      │                        │   │
│  │  │ • Backups    │  │ • Sessions   │                        │   │
│  │  │ • Versions   │  │ • Rate limit │                        │   │
│  │  └──────────────┘  └──────────────┘                        │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     DATA LAYER                               │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   MongoDB    │  │  PostgreSQL  │  │     Qdrant       │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ (Port 27017) │  │ (Port 5432)  │  │ (Port 6333)      │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ • Documents  │  │ • Financial  │  │ • Vectors        │  │   │
│  │  │ • Audit logs │  │ • ACID       │  │ • Embeddings     │  │   │
│  │  │ • Events     │  │ • Relations  │  │ • Search         │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌──────────────┐                                            │   │
│  │  │    Ollama    │                                            │   │
│  │  │              │                                            │   │
│  │  │ (Port 11434) │                                            │   │
│  │  │              │                                            │   │
│  │  │ • LLM        │                                            │   │
│  │  │ • Embeddings │                                            │   │
│  │  │ • CPU/GPU    │                                            │   │
│  │  └──────────────┘                                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Docker Compose Architecture

```yaml
# High-level service dependencies
services:
  # Data Layer (Foundation)
  mongodb:
    # All services depend on this
  postgres:
    # Finance + Keycloak depend on this
  qdrant:
    # RAG service depends on this
  
  # Service Mesh (Infrastructure)
  keycloak:
    depends_on: [postgres]
  rabbitmq:
    # All backend services use this
  redis:
    # Backend + API use this
  minio:
    # Brain + RAG use this
  ollama:
    # RAG service depends on this
  
  # Application Layer
  backend:
    depends_on: [mongodb, postgres, keycloak, rabbitmq, redis]
  rag-service:
    depends_on: [qdrant, ollama, mongodb, rabbitmq]
  frontend:
    depends_on: [backend]
  
  # Management
  n8n:
    depends_on: [backend]
```

---

## Technical Diagrams

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BLIH ENTERPRISE PLATFORM                     │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    PRESENTATION LAYER                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ Web Portal  │  │ Mobile App │  │ Admin Panel │ │ │
│  │  │ (Next.js)  │  │ (React)    │  │ (Next.js)  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   API GATEWAY LAYER                      │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Nginx    │  │   Rate      │  │   SSL       │ │ │
│  │  │  (Load      │  │   Limiter   │  │  Termination│ │ │
│  │  │  Balancer)  │  │             │  │             │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                  APPLICATION LAYER                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │  Frontend   │  │   Backend   │  │   AI/RAG    │ │ │
│  │  │ (Next.js)  │  │  (NestJS)  │  │ (Python)    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   SERVICE LAYER                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Auth      │  │   RBAC      │  │   Audit     │ │ │
│  │  │  Service    │  │   Service   │  │   Service   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   DATA LAYER                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ PostgreSQL  │  │   MongoDB   │  │   Qdrant    │ │ │
│  │  │ (Core)     │  │ (Modules)   │  │ (Vectors)   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 INFRASTRUCTURE LAYER                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Docker    │  │   RabbitMQ  │  │   Redis     │ │ │
│  │  │  Containers │  │ (Events)    │  │ (Cache)     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATA FLOW PATTERNS                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   User      │    │   Module    │    │   Core      │ │
│  │   Request   │───▶│   Event     │───▶│   Service   │ │
│  │             │    │   Publisher  │    │   Consumer   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│         │                   │                   │         │
│         ▼                   ▼                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Database   │    │   Event     │    │   Audit     │ │
│  │   Write     │    │   Queue     │    │   Log       │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │              EVENT-DRIVEN COMMUNICATION                │ │
│  │                                                              │
│  │  HR Module              Core Platform              CRM Module │
│  │     │                        │                        │     │
│  │     ├─ employee.created    ├─ auth.user.provision   ├─ customer.created │
│  │     ├─ employee.updated    ├─ rbac.role.assigned   ├─ deal.won        │
│  │     ├─ leave.requested     │                        │     │
│  │     └─ attendance.logged   └─ audit.log.created    └─ task.completed   │
│  │             │                        │                        │     │
│  └─────────────┴────────────────────┴────────────────────┴─────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Security Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 NETWORK SECURITY                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   WAF       │  │   DDoS      │  │   Firewall  │ │ │
│  │  │  Protection │  │  Protection │  │   Rules     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                APPLICATION SECURITY                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   RBAC      │  │   Input      │  │   Session    │ │ │
│  │  │   Controls   │  │   Validation │  │   Management │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                  DATA SECURITY                              │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ Encryption  │  │   Access    │  │   Audit      │ │ │
│  │  │ (AES-256)  │  │   Controls   │  │   Trails     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────────────────┐
│                 PRODUCTION DEPLOYMENT TOPOLOGY               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                   LOAD BALANCER                          │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Nginx    │  │   SSL       │  │   Health    │ │ │
│  │  │  (Primary)  │  │  Termination│  │   Checks    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                APPLICATION SERVERS (3x)                   │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Server 1  │  │   Server 2  │  │   Server 3  │ │ │
│  │  │ (Primary)   │  │ (Secondary) │  │ (Tertiary)  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 DATABASE CLUSTER                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ PostgreSQL  │  │   MongoDB   │  │   Redis     │ │ │
│  │  │ (Primary)   │  │ (Replica)  │  │ (Cluster)   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                MONITORING STACK                            │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ Prometheus  │  │   Grafana   │  │   AlertMgr  │ │ │
│  │  │ (Metrics)   │  │ (Dashboards)│  │ (Alerts)    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MICROSERVICES ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    API GATEWAY                             │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Auth      │  │   Rate      │  │   Router     │ │ │
│  │  │  Middleware │  │   Limiter   │  │   Service    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 BUSINESS SERVICES                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   HR        │  │   CRM       │  │   Finance    │ │ │
│  │  │  Service    │  │  Service    │  │  Service     │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • Employees │  │ • Customers │  │ • Ledger     │ │ │
│  │  │ • Payroll   │  │ • Deals     │  │ • Reports    │ │ │
│  │  │ • Leave     │  │ • Tasks     │  │ • Budget     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 PLATFORM SERVICES                       │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Auth      │  │   RBAC      │  │   Audit      │ │ │
│  │  │  Service    │  │  Service    │  │  Service     │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • JWT       │  │ • Roles     │  │ • Logs      │ │ │
│  │  │ • MFA       │  │ • Permissions│  │ • Events     │ │ │
│  │  │ • SSO       │  │ • Groups    │  │ • Compliance │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 SUPPORTING SERVICES                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Notify    │  │   Config    │  │   Search     │ │ │
│  │  │  Service    │  │  Service    │  │  Service     │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • Email     │  │ • Settings  │  │ • Full-text  │ │ │
│  │  │ • SMS       │  │ • Features   │  │ • Vectors    │ │ │
│  │  │ • Push      │  │ • Secrets   │  │ • Indexing   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    COMPONENT INTERACTION FLOW               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  User Request Flow:                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   User      │───▶│   Gateway   │───▶│   Auth      │ │
│  │   Browser   │    │   Service   │    │   Service   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                            │                   │         │
│                            ▼                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   RBAC      │───▶│   Business  │───▶│   Database  │ │
│  │  Service    │    │   Service   │    │   Service   │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                            │                   │         │
│                            ▼                   ▼         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│  │   Audit     │───▶│   Event     │───▶│   Notify    │ │
│  │  Service    │    │   Queue     │    │  Service    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                              │
│  Event-Driven Communication:                                      │
│  ┌─────────────┐    Events     ┌─────────────┐    Events     │
│  │   HR        │──────────────▶│   Core      │──────────────▶│   CRM       │
│  │  Service    │               │  Service    │               │  Service    │
│  └─────────────┘               └─────────────┘               └─────────────┘ │
│         ▲                             │                             ▲         │
│         │                             ▼                             │         │
│  ┌─────────────┐    Events     ┌─────────────┐    Events     │
│  │   Finance   │◀──────────────│   Event     │◀──────────────│   Projects  │
│  │  Service    │               │   Broker    │               │  Service    │
│  └─────────────┘               └─────────────┘               └─────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

### Data Persistence Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE ARCHITECTURE           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 POSTGRESQL CLUSTER                        │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Primary   │  │   Replica 1 │  │   Replica 2 │ │ │
│  │  │   (Write)   │  │  (Read)     │  │  (Read)     │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • Users     │  │ • Users     │  │ • Users     │ │ │
│  │  │ • Roles     │  │ • Roles     │  │ • Roles     │ │ │
│  │  │ • Audit     │  │ • Audit     │  │ • Audit     │ │ │
│  │  │ • Finance   │  │ • Finance   │  │ • Finance   │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 MONGODB CLUSTER                           │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Config    │  │   Shard 1   │  │   Shard 2   │ │ │
│  │  │   Server    │  │   (HR)      │  │   (CRM)     │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • Metadata  │  │ • Employees │  │ • Customers │ │ │
│  │  │ • Routing   │  │ • Leave     │  │ • Deals     │ │ │
│  │  │ • Balancing │  │ • Attendance│  │ • Tasks     │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                 VECTOR DATABASE                            │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │   Qdrant    │  │   Embeddings │  │   Index     │ │ │
│  │  │   Cluster   │  │   Service   │  │   Service   │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ • Vectors   │  │ • Text      │  │ • Search    │ │ │
│  │  │ • Metadata  │  │ • Images    │  │ • Ranking   │ │ │
│  │  │ • Collections│  │ • Documents │  │ • Filtering │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Scalability & Performance

### Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SCALABILITY STRATEGY                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Horizontal Scaling (Kubernetes)                 │   │
│  │                                                              │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │   │
│  │  │   Frontend   │  │   Backend    │  │   RAG Service    │  │   │
│  │  │              │  │              │  │                  │  │   │
│  │  │ Replicas: 3  │  │ Replicas: 5  │  │ Replicas: 2      │  │   │
│  │  │ Stateless    │  │ Stateless    │  │ CPU-intensive    │  │   │
│  │  │ CDN Cache    │  │ Shared Cache │  │ Queue-based      │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  │   │
│  │                                                              │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │                 Load Balancer                        │   │   │
│  │  │         (Round-robin / Least connections)            │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Vertical Scaling (Database)                       │   │
│  │                                                              │   │
│  │  MongoDB:                                                      │   │
│  │  • Replica set (1 primary, 2 secondaries)                     │   │
│  │  • Sharding for audit_logs (by month)                         │   │
│  │  • Read replicas for reporting                                │   │
│  │                                                              │   │
│  │  PostgreSQL:                                                   │   │
│  │  • Primary + Standby (streaming replication)                  │   │
│  │  • Read replica for reporting                                 │   │
│  │  • Connection pooling (PgBouncer)                             │   │
│  │                                                              │   │
│  │  Qdrant:                                                       │   │
│  │  • Distributed mode for large collections                     │   │
│  │  • HNSW index optimization                                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Caching Strategy                                │   │
│  │                                                              │   │
│  │  Layer 1: Browser Cache                                        │   │
│  │  • Static assets (JS, CSS, images)                            │   │
│  │  • CDN caching (if external CDN used)                         │   │
│  │                                                              │   │
│  │  Layer 2: Next.js Cache                                        │   │
│  │  • SSG pages (revalidate: 60s)                                │   │
│  │  • ISR for dynamic content                                    │   │
│  │                                                              │   │
│  │  Layer 3: Redis Cache                                          │   │
│  │  • API responses (5 min TTL)                                  │   │
│  │  • User permissions (1 hour TTL)                              │   │
│  │  • Session data (24 hour TTL)                                 │   │
│  │                                                              │   │
│  │  Layer 4: Database Cache                                       │   │
│  │  • MongoDB: query cache, index cache                          │   │
│  │  • PostgreSQL: shared_buffers, work_mem                       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Performance Targets

| Component | Metric | Target |
|-----------|--------|--------|
| **Frontend** | First Contentful Paint | < 1.5s |
| | Time to Interactive | < 3s |
| | Lighthouse Score | > 90 |
| **API** | Response Time (p95) | < 200ms |
| | Throughput | 1000 req/s |
| | Error Rate | < 0.1% |
| **Database** | Query Time | < 50ms |
| | Connections | < 100 active |
| | Replication Lag | < 1s |
| **RAG** | Query Latency | < 2s |
| | Embedding Speed | < 100ms |
| | Concurrent Users | 100+ |

### Bottleneck Mitigation

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOTTLENECK MITIGATION                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Database Bottlenecks                            │   │
│  │                                                              │   │
│  │  Problem: Audit log growth → Slow queries                     │   │
│  │  Solution:                                                    │   │
│  │  • Monthly sharding (separate collections)                   │   │
│  │  • TTL indexes (auto-delete after 7 years)                    │   │
│  │  • Archive to S3/MinIO after 1 year                          │   │
│  │  • Separate read replicas for analytics                       │   │
│  │                                                              │   │
│  │  Problem: High write volume → Lock contention                 │   │
│  │  Solution:                                                    │   │
│  │  • Write concern: w=1 (primary only)                         │   │
│  │  • Bulk operations for batch inserts                         │   │
│  │  • Queue-based async processing                              │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              API Bottlenecks                                 │   │
│  │                                                              │   │
│  │  Problem: Slow RAG queries → API timeout                      │   │
│  │  Solution:                                                    │   │
│  │  • Separate RAG service with longer timeout (60s)              │   │
│  │  • Streaming responses for chat                              │   │
│  │  • Queue-based processing for document ingestion               │   │
│  │  • Result caching for common queries                         │   │
│  │                                                              │   │
│  │  Problem: Permission checks → N+1 queries                   │   │
│  │  Solution:                                                    │   │
│  │  • Cache permissions in JWT token                            │   │
│  │  • Redis cache for permission lookup                         │   │
│  │  • Pre-computed permission matrix                            │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              Event Bus Bottlenecks                           │   │
│  │                                                              │   │
│  │  Problem: Event flood → Consumer lag                        │   │
│  │  Solution:                                                    │   │
│  │  • Multiple consumers per queue                              │   │
│  │  • Priority queues for critical events                        │   │
│  │  • Dead letter queue with retry backoff                       │   │
│  │  • Circuit breaker for failing consumers                      │   │
│  │                                                              │   │
│  │  Problem: Event loss during deployment                        │   │
│  │  Solution:                                                    │   │
│  │  • Persistent queues (durable)                                │   │
│  │  • Publisher confirms                                         │   │
│  │  • Idempotent consumers                                       │   │
│  │  • Event store for replay capability                          │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Appendix

### Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Frontend | Next.js | 16.x | React framework |
| | React | 18.x | UI library |
| | TypeScript | 5.x | Language |
| | Tailwind CSS | 3.x | Styling |
| | shadcn/ui | latest | Components |
| | TanStack Query | 5.x | Data fetching |
| Backend | NestJS | 10.x | API framework |
| | TypeScript | 5.x | Language |
| | Mongoose | 8.x | MongoDB ODM |
| | TypeORM | 0.3.x | PostgreSQL ORM |
| | Passport | latest | Auth middleware |
| Data | MongoDB | 7.x | Document DB |
| | PostgreSQL | 16.x | Relational DB |
| | Qdrant | latest | Vector DB |
| | Redis | 7.x | Cache |
| | MinIO | latest | Object storage |
| Infrastructure | Docker | 24.x | Containerization |
| | RabbitMQ | 3.12+ | Message broker |
| | Keycloak | 24.x | IAM |
| | Ollama | latest | Local LLM |
| | n8n | latest | Workflow |
| Testing | Jest | 29.x | Unit tests |
| | Playwright | 1.x | E2E tests |
| | k6 | latest | Load tests |

### Network Port Allocation

| Service | Port | Protocol | Notes |
|---------|------|----------|-------|
| Frontend (Next.js) | 3000 | HTTP | Dev mode |
| API Gateway | 4000 | HTTP | NestJS |
| RAG Service | 4001 | HTTP | AI service |
| MongoDB | 27017 | TCP | Database |
| PostgreSQL | 5432 | TCP | Database |
| Qdrant | 6333 | HTTP | Vector DB |
| Qdrant gRPC | 6334 | gRPC | Vector DB |
| Redis | 6379 | TCP | Cache |
| RabbitMQ | 5672 | AMQP | Message broker |
| RabbitMQ Mgmt | 15672 | HTTP | Web UI |
| Keycloak | 8080 | HTTP | IAM |
| MinIO API | 9000 | HTTP | Object storage |
| MinIO Console | 9001 | HTTP | Web UI |
| Ollama | 11434 | HTTP | LLM API |
| n8n | 5678 | HTTP | Workflow |

### Error Codes

| Code | Meaning | HTTP Status |
|------|---------|-------------|
| `AUTH001` | Invalid credentials | 401 |
| `AUTH002` | Token expired | 401 |
| `AUTH003` | Insufficient permissions | 403 |
| `VALID001` | Validation failed | 400 |
| `NOTFOUND001` | Resource not found | 404 |
| `CONFLICT001` | Resource already exists | 409 |
| `RATE001` | Rate limit exceeded | 429 |
| `SERVER001` | Internal server error | 500 |
| `RAG001` | LLM timeout | 504 |
| `RAG002` | No relevant documents found | 200 (with warning) |

### Service Dependencies Graph

```
                    ┌──────────────┐
                    │   Frontend   │
                    └──────┬───────┘
                           │
           ┌───────────────┼───────────────┐
           │               │               │
           ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │   Backend    │ │  Keycloak    │ │    n8n       │
    │   (API)      │ │   (Auth)     │ │  (Workflow)  │
    └──────┬───────┘ └──────────────┘ └──────────────┘
           │
    ┌──────┼──────┐
    │      │      │
    ▼      ▼      ▼
┌───────┐ ┌─────┐ ┌─────────┐
│MongoDB│ │Redis│ │RabbitMQ │
└───────┘ └─────┘ └────┬────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  RAG Svc │ │   HR     │ │   CRM    │
    │          │ │  Module  │ │  Module  │
    └────┬─────┘ └──────────┘ └──────────┘
         │
    ┌────┼────┐
    │    │    │
    ▼    ▼    ▼
┌───────┐ ┌────────┐ ┌────────┐
│Qdrant │ │MongoDB │ │ Ollama │
└───────┘ └────────┘ └────────┘
```

---

*Architecture Version: 1.0*  
*Last Updated: February 2026*
