# BLIH Detailed Documentation

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Module Specifications](#module-specifications)
5. [Implementation Timeline](#implementation-timeline)
6. [Deployment Guide](#deployment-guide)
7. [Security & Compliance](#security--compliance)
8. [Operations & Maintenance](#operations--maintenance)
9. [Appendix](#appendix)

---

## Executive Summary

**BLIH (Business Lifecycle Integrated Hub)** is an integrated business management platform designed for on-premises deployment with compliance-first architecture.

### Key Characteristics

- **Architecture**: Modular, event-driven, microservices-based
- **Deployment**: On-premises only, air-gapped compatible
- **Compliance**: ISO 9001/14001/45001 aligned with audit trails
- **AI Features**: Local LLM (Ollama) with RAG capabilities
- **Timeline**: 14 weeks (3.5 months) for v1.0

### Success Criteria

| Category    | Target                      |
| ----------- | --------------------------- |
| Modules     | Core + 2-3 business modules |
| Performance | API < 500ms p95             |
| Coverage    | > 70% test coverage         |
| Uptime      | 99.9% target                |

---

## System Architecture

### High-Level Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                     Users / Admins                           │
└─────────────────────┬──────────────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌────────┐     ┌──────────┐     ┌────────────┐
│Next.js │     │  NestJS  │     │  RAG Svc   │
│Frontend│────▶│ Backend  │────▶│ (AI/LLM)   │
└────────┘     └──────────┘     └────────────┘
                      │
    ┌─────────────────┼─────────────────┐
    │                 │                 │
    ▼                 ▼                 ▼
┌────────┐     ┌──────────┐     ┌────────────┐
│PostgreSQL│    │  Qdrant  │     │ PostgreSQL │
│(Primary)│    │(Vectors) │     │ (Finance)  │
└────────┘     └──────────┘     └────────────┘

Supporting: Keycloak (IAM), RabbitMQ (Events), MinIO (Files), n8n (Workflow)
```

### Module Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Core Platform                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │    RBAC     │  │    Audit    │  │     Event Bus       │  │
│  │   System    │  │   Logger    │  │   (RabbitMQ)        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
                              │
    ┌───────────┬───────────┬──┴────────┬───────────┬──────────┐
    │           │           │            │           │          │
    ▼           ▼           ▼            ▼           ▼          ▼
┌───────┐  ┌───────┐  ┌──────────┐ ┌────────┐ ┌──────────┐ ┌──────────┐
│  HR   │  │  CRM  │  │ Projects │ │ Finance│ │  Brain   │ │Compliance│
│Module │  │Module │  │ Module   │ │ Module │ │  (AI)    │ │(Risk/CAPA│
│       │  │       │  │          │ │        │ │          │ │/Review)  │
└───────┘  └───────┘  └──────────┘ └────────┘ └──────────┘ └──────────┘
```

### Data Flow Patterns

**Event-Driven Integration:**

```
CRM: Deal Won ──▶ Event: crm.deal.won
                      │
                      ▼
         ┌────────────┼────────────┐
         │            │            │
         ▼            ▼            ▼
    Projects    Finance       Brain
    (Create     (Generate     (Log
    Project)     Invoice)      Pattern)
```

---

## Technology Stack

### Complete Technology Matrix

| Category           | Technology            | Version | Purpose         |
| ------------------ | --------------------- | ------- | --------------- |
| **Backend**        | NestJS                | 10.x    | API Services    |
| **Frontend**       | Next.js               | 16.x    | Web Application |
| **Document DB**    | MongoDB               | 7.x     | Flexible data   |
| **Relational DB**  | PostgreSQL            | 16.x    | Financial data  |
| **Vector DB**      | Qdrant                | latest  | AI embeddings   |
| **Event Bus**      | RabbitMQ              | 3.12+   | Async messaging |
| **IAM**            | Keycloak              | 24.x    | Authentication  |
| **Object Storage** | MinIO                 | latest  | File storage    |
| **LLM**            | Ollama                | latest  | Local AI        |
| **Workflow**       | n8n                   | latest  | Automation      |
| **UI Library**     | shadcn/ui             | latest  | Components      |
| **State Mgmt**     | TanStack Query        | latest  | Data fetching   |
| **Forms**          | React Hook Form + Zod | latest  | Validation      |
| **Testing**        | Jest + Playwright     | latest  | Testing         |
| **Container**      | Docker + Compose      | latest  | Deployment      |

### Technology Selection Rationale

**NestJS:**

- Built-in dependency injection
- Modular architecture matches BLIH design
- Native TypeScript support
- Excellent Keycloak integration

**Next.js App Router:**

- Server-side rendering for performance
- API routes for backend integration
- Built-in authentication helpers

**MongoDB + PostgreSQL:**

- MongoDB: Flexible schemas for HR, CRM, Projects, Brain
- PostgreSQL: ACID guarantees for financial transactions

**Qdrant + Ollama:**

- On-premises vector search
- Air-gapped LLM capability
- No external API dependencies

---

## Module Specifications

### Core Platform Module

**Responsibilities:**

- RBAC system with permission management
- Centralized audit logging
- Event bus coordination
- Company context enforcement
- User/role management

**Database Schema (MongoDB):**

```typescript
// Audit Log Schema
@Schema()
class AuditLog {
  userId: string;
  module: string;
  action: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  companyId: string; // Always "BLIH"
  ipAddress: string;
}

// Permission Schema
@Schema()
class Permission {
  code: string; // MODULE:RESOURCE:ACTION
  name: string;
  description: string;
  module: string;
}

// Role Schema
@Schema()
class Role {
  name: string;
  permissions: string[];
  isDefault: boolean;
}
```

**RBAC Permission Format:**

```
Format: MODULE:RESOURCE:ACTION

Examples:
- HR:employee:view
- HR:employee:create
- HR:employee:edit
- HR:employee:delete
- CRM:deal:approve
- FINANCE:invoice:view
- BRAIN:policy:admin
```

**Key Endpoints:**

```
GET    /api/auth/me              - Current user info
POST   /api/auth/refresh         - Token refresh
GET    /api/permissions          - List permissions
POST   /api/roles                - Create role
GET    /api/audit-logs           - Query audit logs
GET    /api/audit-logs/export    - Export for compliance
```

---

### HR Module

**Responsibilities:**

- Employee management
- Contract tracking
- Onboarding workflows
- Department organization
- Event publishing for integrations

**Database Schema:**

```typescript
// Employee Schema
@Schema({ timestamps: true })
class Employee {
  employeeId: string; // "EMP-001"
  companyId: string; // Always "BLIH"
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  status: 'active' | 'inactive' | 'terminated';
  hireDate: Date;
  contractType: 'full-time' | 'part-time' | 'contractor';
  deleted: boolean; // Soft delete
}

// Contract Schema
@Schema()
class Contract {
  employeeId: string;
  contractType: string;
  startDate: Date;
  endDate?: Date;
  salary?: number;
  currency?: string;
  documents: string[]; // MinIO file keys
}
```

**Published Events:**

```typescript
EmployeeHiredEvent { employeeId, companyId, timestamp }
EmployeeUpdatedEvent { employeeId, changes, timestamp }
EmployeeTerminatedEvent { employeeId, reason, timestamp }
```

**Key Endpoints:**

```
GET    /api/hr/employees              - List employees
POST   /api/hr/employees              - Create employee
GET    /api/hr/employees/:id         - Get employee details
PUT    /api/hr/employees/:id         - Update employee
DELETE /api/hr/employees/:id         - Soft delete employee
GET    /api/hr/employees/:id/contracts - List contracts
```

---

### CRM Module

**Responsibilities:**

- Lead management
- Contact/organization tracking
- Deal pipeline management
- Activity logging
- Event publishing for deal lifecycle

**Database Schema:**

```typescript
// Lead Schema
@Schema()
class Lead {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string; // User ID
}

// Deal Schema
@Schema()
class Deal {
  name: string;
  value: number;
  currency: string;
  stage:
    | 'prospecting'
    | 'qualification'
    | 'proposal'
    | 'negotiation'
    | 'closed-won'
    | 'closed-lost';
  probability: number;
  expectedCloseDate: Date;
  actualCloseDate?: Date;
  organizationId: string;
  contactIds: string[];
}

// Organization Schema
@Schema()
class Organization {
  name: string;
  industry?: string;
  size?: string;
  website?: string;
  address?: Address;
}
```

**Published Events:**

```typescript
DealCreatedEvent { dealId, value, stage }
DealStageChangedEvent { dealId, fromStage, toStage }
DealWonEvent { dealId, value, organizationId }  // Triggers Projects
DealLostEvent { dealId, reason }
```

**Key Endpoints:**

```
GET    /api/crm/leads              - List leads
POST   /api/crm/leads              - Create lead
GET    /api/crm/deals              - List deals
POST   /api/crm/deals              - Create deal
PUT    /api/crm/deals/:id/stage    - Update deal stage
GET    /api/crm/pipeline           - Pipeline summary
GET    /api/crm/organizations      - List organizations
```

---

### Projects Module

**Responsibilities:**

- Project lifecycle management
- Task tracking
- Time logging
- Resource allocation
- Event subscription to CRM

**Database Schema:**

```typescript
// Project Schema
@Schema()
class Project {
  projectId: string; // "PRJ-001"
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on-hold' | 'completed' | 'cancelled';
  sourceDealId?: string; // From CRM
  managerId: string;
  startDate: Date;
  endDate?: Date;
  budget?: number;
  progress: number; // 0-100
}

// Task Schema
@Schema()
class Task {
  projectId: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  assigneeId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
}

// Time Log Schema
@Schema()
class TimeLog {
  taskId: string;
  userId: string;
  date: Date;
  hours: number;
  description: string;
  billable: boolean;
}
```

**Event Subscriptions:**

```typescript
// Subscribes to CRM events
@OnEvent('crm.deal.won')
async handleDealWon(event: DealWonEvent) {
  // Auto-create project from won deal
  await this.createProjectFromDeal(event.dealId);
}
```

**Key Endpoints:**

```
GET    /api/projects               - List projects
POST   /api/projects              - Create project
GET    /api/projects/:id          - Get project details
PUT    /api/projects/:id          - Update project
GET    /api/projects/:id/tasks    - List project tasks
POST   /api/projects/:id/tasks    - Create task
PUT    /api/tasks/:id/time        - Log time
```

---

### Finance Module

**Responsibilities:**

- Double-entry bookkeeping
- Invoice management
- Payroll processing
- Expense tracking
- Financial reporting

**Database Schema (PostgreSQL):**

```sql
-- Chart of Accounts
CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    parent_id UUID REFERENCES accounts(id)
);

-- Transactions (Double-Entry)
CREATE TABLE transactions (
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    description TEXT,
    reference VARCHAR(255),
    amount DECIMAL(15,2) NOT NULL,
    debit_account_id UUID REFERENCES accounts(id),
    credit_account_id UUID REFERENCES accounts(id),
    source_module VARCHAR(50),
    source_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(255),
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15,2),
    tax_amount DECIMAL(15,2),
    total_amount DECIMAL(15,2),
    status VARCHAR(50) -- draft, sent, paid, overdue, cancelled
);

-- Payroll
CREATE TABLE payroll_records (
    id UUID PRIMARY KEY,
    employee_id VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_salary DECIMAL(15,2),
    deductions DECIMAL(15,2),
    net_salary DECIMAL(15,2),
    status VARCHAR(50)
);
```

**Published Events:**

```typescript
InvoiceGeneratedEvent { invoiceId, customerId, amount }
PaymentReceivedEvent { invoiceId, amount, paymentDate }
PayrollProcessedEvent { period, totalAmount, employeeCount }
```

**Key Endpoints:**

```
GET    /api/finance/accounts       - Chart of accounts
POST   /api/finance/transactions    - Create journal entry
GET    /api/finance/invoices       - List invoices
POST   /api/finance/invoices       - Generate invoice
POST   /api/finance/invoices/:id/pay - Record payment
GET    /api/finance/payroll        - Payroll records
POST   /api/finance/payroll        - Process payroll
GET    /api/finance/reports/pnl    - P&L report
GET    /api/finance/reports/balance-sheet - Balance sheet
```

---

### Brain Module (AI + Knowledge)

**Responsibilities:**

- Knowledge base management
- Policy document storage
- Decision logging
- Lessons learned repository
- RAG data preparation
- Vector store management

**Database Schema:**

```typescript
// Policy Schema
@Schema()
class Policy {
  title: string;
  category: string;
  version: string;
  content: string;
  effectiveDate: Date;
  reviewDate?: Date;
  owner: string;
  status: 'draft' | 'active' | 'archived';
  attachments: string[]; // MinIO keys
}

// Decision Schema
@Schema()
class Decision {
  title: string;
  description: string;
  context: string;
  decision: string;
  rationale: string;
  outcome?: string;
  decisionMaker: string;
  date: Date;
  relatedTo?: { module: string; resourceId: string };
}

// Lesson Learned Schema
@Schema()
class LessonLearned {
  projectId?: string;
  category: string;
  description: string;
  impact: string;
  recommendation: string;
  date: Date;
  submittedBy: string;
}

// Document for RAG
@Schema()
class BrainDocument {
  title: string;
  content: string;
  source: string;
  chunkIndex: number;
  totalChunks: number;
  vectorId?: string; // Qdrant ID
  metadata: {
    department?: string;
    classification?: 'public' | 'internal' | 'confidential';
    createdBy: string;
    createdAt: Date;
  };
}
```

**Vector Store (Qdrant):**

```
Collection: brain_documents
- Vector size: 384 (all-MiniLM-L6-v2)
- Distance: Cosine
- HNSW config: m=16, ef_construct=128
```

**Key Endpoints:**

```
GET    /api/brain/policies         - List policies
POST   /api/brain/policies         - Create policy
GET    /api/brain/decisions        - List decisions
POST   /api/brain/decisions        - Log decision
GET    /api/brain/lessons          - List lessons learned
POST   /api/brain/documents        - Upload for RAG
POST   /api/brain/search           - Semantic search
```

---

### Compliance Extensions (Risk/CAPA/Review)

**Responsibilities:**

- Risk register management
- CAPA (Corrective/Preventive Action) lifecycle
- Management review tracking
- Compliance evidence generation

**Database Schema:**

```typescript
// Risk Schema
@Schema()
class Risk {
  riskId: string; // "RISK-001"
  description: string;
  category: 'strategic' | 'operational' | 'financial' | 'compliance' | 'safety';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // Calculated
  owner: string;
  mitigationPlan: string;
  status: 'identified' | 'assessed' | 'mitigating' | 'accepted' | 'closed';
  reviewDate: Date;
}

// CAPA Schema
@Schema()
class CAPA {
  capaId: string; // "CAPA-001"
  type: 'corrective' | 'preventive';
  source: string; // audit, incident, customer complaint, etc.
  description: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  responsible: string;
  dueDate: Date;
  status: 'open' | 'in-progress' | 'implemented' | 'verified' | 'closed';
  effectiveness?: string;
}

// Management Review Schema
@Schema()
class ManagementReview {
  reviewDate: Date;
  attendees: string[];
  agenda: string[];
  inputs: {
    auditResults?: string;
    customerFeedback?: string;
    processPerformance?: string;
    productConformity?: string;
    preventiveActions?: string;
  };
  decisions: string[];
  actionItems: { item: string; owner: string; dueDate: Date }[];
  minutes: string;
}
```

**Key Endpoints:**

```
GET    /api/compliance/risks       - Risk register
POST   /api/compliance/risks       - Add risk
GET    /api/compliance/capas      - CAPA list
POST   /api/compliance/capas      - Create CAPA
PUT    /api/compliance/capas/:id  - Update CAPA status
GET    /api/compliance/reviews    - Management reviews
POST   /api/compliance/reviews    - Schedule review
GET    /api/compliance/evidence   - Export evidence
```

---

### RAG Service (AI Module)

**Responsibilities:**

- Document ingestion and chunking
- Embedding generation
- Hybrid search (vector + keyword)
- LLM query processing
- Response generation with citations
- Permission-aware content filtering

**Architecture:**

```
┌─────────────────────────────────────────────────────┐
│                   RAG Service                        │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Document  │  │  Hybrid     │  │   LLM        │  │
│  │  Processor │──▶│  Search     │──▶│  Response    │  │
│  │            │  │  (Qdrant)   │  │  Generator   │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
│         │               │               │         │
│         ▼               ▼               ▼         │
│  ┌─────────────────────────────────────────────┐  │
│  │          Permission Filter                  │  │
│  │   (RBAC-aware content filtering)            │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**API Endpoints:**

```
POST /api/rag/ingest          - Ingest document
POST /api/rag/query           - Query with context
GET  /api/rag/documents       - List indexed documents
DELETE /api/rag/documents/:id - Remove document
POST /api/rag/chat            - Conversational query
GET  /api/rag/stats           - RAG metrics
```

**Query Flow:**

```typescript
async processQuery(userId: string, query: string) {
  // 1. Permission check
  if (!await this.hasPermission(userId, 'BRAIN:chatbot:use'))
    throw new ForbiddenException();

  // 2. Hybrid search
  const vectorResults = await this.qdrant.search(query, { limit: 5 });
  const keywordResults = await this.mongodb.textSearch(query, { limit: 5 });
  const combined = this.rerankResults(vectorResults, keywordResults);

  // 3. Filter by permissions
  const allowed = combined.filter(doc =>
    this.canAccess(userId, doc.metadata.classification)
  );

  // 4. Generate response
  const context = allowed.map(d => d.content).join('\n');
  const response = await this.ollama.generate(query, context);

  // 5. Log and return
  await this.audit.log({ userId, query, response });
  return { response, sources: allowed };
}
```

---

## Implementation Timeline

### 14-Week Development Plan

| Phase       | Weeks | Focus           | Deliverables                    |
| ----------- | ----- | --------------- | ------------------------------- |
| **Phase 0** | 1-2   | Foundation      | Docker, Keycloak, Audit, Events |
| **Phase 1** | 3-4   | Core Platform   | RBAC, Notifications, User Mgmt  |
| **Phase 2** | 5-6   | Brain + HR      | Knowledge base, Employee CRUD   |
| **Phase 3** | 7-8   | CRM + Projects  | Pipeline, Auto-project creation |
| **Phase 4** | 9-10  | Finance         | Invoicing, Payroll, Accounting  |
| **Phase 5** | 11-12 | AI + Compliance | Chatbot, Risk/CAPA              |
| **Phase 6** | 13-14 | Hardening       | Security, Testing, Pilot        |

### Team Allocation

```
Phase 0-1 (Foundation):
├── Backend Lead (Core)
├── DevOps Engineer
└── Frontend Dev (Login UI)

Phase 2-4 (Modules):
├── 2 Senior Backend (Core + Architecture)
├── 3 Mid Backend (HR, CRM, Projects, Finance)
├── 2 Frontend (UI + Dashboards)
└── 1 Product Specialist

Phase 5-6 (AI + Polish):
├── 1 AI Engineer (Chatbot)
├── 1 Backend (Compliance)
├── 1 Frontend
├── 1 QA Engineer
└── 1 DevOps
```

---

## Deployment Guide

### Prerequisites

**Hardware:**

```yaml
Minimum:
  CPU: 8 vCPUs (AVX-512 support)
  RAM: 32GB DDR4
  Storage: 1TB NVMe SSD
  Network: 1Gbps

Recommended:
  CPU: 16 vCPUs
  RAM: 64GB DDR4
  Storage: 2TB NVMe + 5TB SATA backup
  Network: 10Gbps
```

**Software:**

- Docker 24.x+
- Docker Compose 2.x+
- Git
- OpenSSL

### Environment Setup

**1. Clone Repository:**

```bash
git clone https://github.com/company/blih.git
cd blih
```

**2. Create Environment File:**

```bash
cp .env.example .env
# Edit with your secure values
```

**.env.example:**

```bash
# Core
NODE_ENV=production
COMPANY_ID=BLIH

# Databases
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=secure_random_password
POSTGRES_PASSWORD=secure_random_password

# Authentication
JWT_SECRET=64_char_random_string
KEYCLOAK_ADMIN=admin
KEYCLOAK_ADMIN_PASSWORD=secure_random_password
KEYCLOAK_DB_PASSWORD=secure_random_password

# Object Storage
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=secure_random_password

# Workflow
N8N_USER=admin
N8N_PASSWORD=secure_random_password

# SSL
SSL_EMAIL=admin@company.com
SSL_DOMAINS=api.company.com,app.company.com
```

**3. Initialize Infrastructure:**

```bash
# Start databases and core services
docker-compose up -d mongodb postgres keycloak rabbitmq minio qdrant

# Wait for services to be healthy
sleep 30

# Setup Keycloak realm
docker-compose exec keycloak /opt/keycloak/bin/kcadm.sh \
  config credentials --server http://localhost:8080 \
  --realm master --user admin --password $KEYCLOAK_ADMIN_PASSWORD

# Import realm configuration
docker-compose exec keycloak /opt/keycloak/bin/kcadm.sh \
  create realms -f /tmp/blih-realm.json
```

### Production Deployment

**Docker Compose Production:**

```yaml
version: '3.8'

services:
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.company.com
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '2.0'
          memory: 2G

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mongodb://mongodb:27017/blih
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - mongodb
      - keycloak
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '4.0'
          memory: 4G

  rag-service:
    build: ./rag-service
    environment:
      - NODE_ENV=production
      - QDRANT_URL=http://qdrant:6333
      - OLLAMA_URL=http://ollama:11434
      - CPU_AWARE=true
    depends_on:
      - qdrant
      - ollama
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '8.0'
          memory: 8G

  ollama:
    image: ollama/ollama:latest
    volumes:
      - ollama_data:/root/.ollama
    environment:
      - OLLAMA_GPU=0
      - OLLAMA_NUM_PARALLEL=2
      - OLLAMA_NUM_THREAD=8
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '8.0'
          memory: 32G

  qdrant:
    image: qdrant/qdrant:latest
    volumes:
      - qdrant_data:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__STORAGE__PERFORMANCE__MAX_SEARCH_THREADS=4
    restart: unless-stopped

  mongodb:
    image: mongo:7.0
    volumes:
      - mongodb_data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=${MONGO_ROOT_USERNAME}
      - MONGO_INITDB_ROOT_PASSWORD=${MONGO_ROOT_PASSWORD}
    restart: unless-stopped

volumes:
  qdrant_data:
  ollama_data:
  mongodb_data:
```

### SSL/TLS Configuration

**Let's Encrypt Setup:**

```bash
# Install certbot
certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email admin@company.com \
  --agree-tos \
  -d api.company.com \
  -d app.company.com

# Auto-renewal cron
echo "0 12 * * * certbot renew --quiet" | crontab -
```

### Health Checks

**Service Health Endpoints:**

```
GET /api/health          - Backend health
GET /api/rag/health      - RAG service health
GET /healthz            - General health
```

**Deployment Verification:**

```bash
#!/bin/bash
set -e

echo "Checking service health..."
curl -f http://localhost/api/health || exit 1
curl -f http://localhost/api/rag/health || exit 1
curl -f http://localhost:6333/healthz || exit 1

echo "All services healthy!"
```

---

## Security & Compliance

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
├─────────────────────────────────────────────────────────────┤
│  Layer 1: Network                                           │
│    - Firewall (UFW)                                         │
│    - TLS 1.3 encryption                                     │
│    - Rate limiting (nginx)                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 2: Authentication                                    │
│    - Keycloak IAM                                           │
│    - JWT tokens                                             │
│    - MFA support                                            │
├─────────────────────────────────────────────────────────────┤
│  Layer 3: Authorization                                     │
│    - RBAC enforcement                                       │
│    - Permission guards                                      │
│    - Company isolation                                      │
├─────────────────────────────────────────────────────────────┤
│  Layer 4: Data                                              │
│    - Encryption at rest                                     │
│    - Encryption in transit                                  │
│    - Field-level redaction                                  │
├─────────────────────────────────────────────────────────────┤
│  Layer 5: Audit                                             │
│    - Immutable audit logs                                   │
│    - Action tracking                                        │
│    - Compliance exports                                     │
└─────────────────────────────────────────────────────────────┘
```

### Security Checklist

| Category          | Control                           | Status   |
| ----------------- | --------------------------------- | -------- |
| **Network**       | TLS 1.3 enforced                  | Required |
|                   | HSTS headers                      | Required |
|                   | Rate limiting (100 req/min)       | Required |
| **Auth**          | JWT with 15min expiry             | Required |
|                   | Refresh token rotation            | Required |
|                   | Brute force protection            | Required |
| **Authorization** | RBAC on all endpoints             | Required |
|                   | Permission middleware             | Required |
|                   | Company context enforcement       | Required |
| **Data**          | AES-256 encryption at rest        | Required |
|                   | Field-level encryption (SSN, etc) | Required |
| **Audit**         | All actions logged                | Required |
|                   | Immutable logs (no updates)       | Required |
|                   | 7-year retention                  | Required |

### Compliance Mapping

**ISO 9001 (Quality Management):**
| Requirement | BLIH Implementation |
|-------------|---------------------|
| 7.1.5 Monitoring resources | Audit log service, Metrics dashboard |
| 7.5 Documented info | Brain module (policies, SOPs) |
| 9.1.1 Monitoring satisfaction | CRM feedback tracking |
| 9.3 Management review | Compliance module (reviews) |
| 10.2 Nonconformity | CAPA module |

**ISO 14001 (Environmental):**
| Requirement | Implementation |
|-------------|------------------|
| 6.1.2 Environmental aspects | Risk register (environmental category) |
| 7.5 Documented info | Policy management |

**ISO 45001 (Safety):**
| Requirement | Implementation |
|-------------|------------------|
| 6.1.2 Hazard identification | Risk register (safety category) |
| 10.1 Incident investigation | CAPA with incident source |

### Audit Trail Format

```typescript
{
  id: "audit-uuid",
  timestamp: "2024-01-15T10:30:00Z",
  userId: "user-uuid",
  userEmail: "user@company.com",
  action: "employee.create",
  module: "HR",
  resourceId: "emp-001",
  companyId: "BLIH",
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  changes: {
    before: null,
    after: { employeeId: "EMP-001", name: "John Doe" }
  },
  metadata: {
    requestId: "req-uuid",
    sessionId: "sess-uuid"
  }
}
```

---

## Operations & Maintenance

### Backup Strategy

**Automated Backup Script:**

```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR/$DATE

# MongoDB backup
docker exec mongodb mongodump --out /tmp/backup
docker cp mongodb:/tmp/backup $BACKUP_DIR/$DATE/mongodb

# Qdrant backup
curl -X POST http://localhost:6333/snapshots

# PostgreSQL backup
docker exec postgres pg_dump -U admin blih > $BACKUP_DIR/$DATE/postgres.sql

# Compress
tar -czf $BACKUP_DIR/blih_backup_$DATE.tar.gz -C $BACKUP_DIR $DATE
rm -rf $BACKUP_DIR/$DATE

# Cleanup old backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +$RETENTION_DAYS -delete
```

**Cron Schedule:**

```bash
# Daily backup at 2 AM
0 2 * * * /opt/blih/scripts/backup.sh

# Weekly maintenance (Sundays 3 AM)
0 3 * * 0 /opt/blih/scripts/maintenance.sh
```

### Monitoring Setup

**Prometheus Metrics:**

```yaml
scrape_configs:
  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'rag-service'
    static_configs:
      - targets: ['rag-service:3001']
    scrape_interval: 30s

  - job_name: 'qdrant'
    static_configs:
      - targets: ['qdrant:6333']
```

**Key Metrics to Monitor:**
| Metric | Warning | Critical |
|--------|---------|----------|
| API response time | > 500ms | > 1000ms |
| RAG query time | > 2000ms | > 5000ms |
| Memory usage | > 70% | > 85% |
| Disk usage | > 70% | > 85% |
| Error rate | > 1% | > 5% |
| Failed events | > 10/min | > 50/min |

### Troubleshooting Guide

**High Memory Usage:**

```bash
# Check container stats
docker stats

# Restart memory-heavy services
docker-compose restart rag-service ollama

# Clear Ollama cache
docker exec ollama ollama rm unused-model
```

**Slow Queries:**

```bash
# Check Qdrant telemetry
curl http://localhost:6333/telemetry

# Optimize vector search
curl -X PATCH http://localhost:6333/collections/brain_documents \
  -d '{"hnsw_config": {"m": 16, "ef": 128}}'
```

**Database Issues:**

```bash
# MongoDB health check
docker exec mongodb mongo --eval "db.adminCommand('ismaster')"

# PostgreSQL connections
docker exec postgres psql -U admin -c "SELECT * FROM pg_stat_activity;"
```

---

## Appendix

### Environment Variable Reference

| Variable                  | Description            | Required | Default                |
| ------------------------- | ---------------------- | -------- | ---------------------- |
| `NODE_ENV`                | Environment mode       | Yes      | `production`           |
| `COMPANY_ID`              | Company identifier     | Yes      | `BLIH`                 |
| `MONGO_ROOT_USERNAME`     | MongoDB admin user     | Yes      | `admin`                |
| `MONGO_ROOT_PASSWORD`     | MongoDB admin password | Yes      | -                      |
| `POSTGRES_PASSWORD`       | PostgreSQL password    | Yes      | -                      |
| `JWT_SECRET`              | JWT signing secret     | Yes      | -                      |
| `KEYCLOAK_ADMIN`          | Keycloak admin user    | Yes      | `admin`                |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin pass    | Yes      | -                      |
| `MINIO_ROOT_USER`         | MinIO admin user       | Yes      | `admin`                |
| `MINIO_ROOT_PASSWORD`     | MinIO admin password   | Yes      | -                      |
| `OLLAMA_URL`              | Ollama service URL     | No       | `http://ollama:11434`  |
| `QDRANT_URL`              | Qdrant service URL     | No       | `http://qdrant:6333`   |
| `RABBITMQ_URL`            | RabbitMQ URL           | No       | `amqp://rabbitmq:5672` |
| `CPU_AWARE`               | Optimize for CPU-only  | No       | `true`                 |

### API Endpoint Summary

**Core Platform:**

```
GET    /api/health
GET    /api/auth/me
POST   /api/auth/refresh
GET    /api/permissions
POST   /api/roles
GET    /api/audit-logs
```

**HR Module:**

```
GET    /api/hr/employees
POST   /api/hr/employees
GET    /api/hr/employees/:id
PUT    /api/hr/employees/:id
DELETE /api/hr/employees/:id
```

**CRM Module:**

```
GET    /api/crm/leads
POST   /api/crm/leads
GET    /api/crm/deals
POST   /api/crm/deals
GET    /api/crm/pipeline
```

**Projects Module:**

```
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
PUT    /api/tasks/:id/time
```

**Finance Module:**

```
GET    /api/finance/accounts
POST   /api/finance/transactions
GET    /api/finance/invoices
POST   /api/finance/invoices
GET    /api/finance/reports/pnl
```

**Brain Module:**

```
GET    /api/brain/policies
POST   /api/brain/policies
GET    /api/brain/search
POST   /api/brain/documents
```

**RAG Service:**

```
POST   /api/rag/ingest
POST   /api/rag/query
GET    /api/rag/documents
```

**Compliance Module:**

```
GET    /api/compliance/risks
POST   /api/compliance/risks
GET    /api/compliance/capas
GET    /api/compliance/evidence
```

### Common Commands

```bash
# Development
docker-compose up -d                    # Start all services
docker-compose logs -f backend          # Watch backend logs
docker-compose exec backend sh          # Shell into container

# Testing
npm run test                            # Unit tests
npm run test:e2e                        # E2E tests
npm run test:integration                # Integration tests

# Production
docker-compose -f docker-compose.prod.yml up -d
./scripts/backup.sh                     # Manual backup
./scripts/deploy.sh                     # Deploy update
./scripts/rollback.sh                   # Rollback to previous

# Database
mongodump --out ./backup               # MongoDB backup
pg_dump -U admin blih > backup.sql     # PostgreSQL backup
docker exec qdrant ./qdrant snapshot   # Qdrant backup

# Maintenance
docker system prune -f                  # Clean Docker
docker volume prune -f                  # Clean volumes
```

### Glossary

| Term         | Definition                          |
| ------------ | ----------------------------------- |
| **BLIH**     | Business Lifecycle Integrated Hub   |
| **RBAC**     | Role-Based Access Control           |
| **RAG**      | Retrieval-Augmented Generation (AI) |
| **CAPA**     | Corrective And Preventive Action    |
| **SOP**      | Standard Operating Procedure        |
| **Qdrant**   | Vector database for embeddings      |
| **Ollama**   | Local LLM runner                    |
| **n8n**      | Workflow automation tool            |
| **MinIO**    | S3-compatible object storage        |
| **Keycloak** | Identity and access management      |

---

_Documentation Version: 1.0_  
_Last Updated: February 2026_  
_For support contact: dev-team@company.com_
