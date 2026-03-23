# BLIH Core Logic - Complete Documentation

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Production Reference

---

## Table of Contents

1. [Executive Overview](#1-executive-overview)
2. [Core Architectural Principles](#2-core-architectural-principles)
3. [Global Constraints Engine](#3-global-constraints-engine)
4. [Entity Lifecycle State Machines](#4-entity-lifecycle-state-machines)
5. [Cross-Module Orchestration Patterns](#5-cross-module-orchestration-patterns)
6. [Data Synchronization Logic](#6-data-synchronization-logic)
7. [Business Rules by Module](#7-business-rules-by-module)
8. [Event Schema & Contracts](#8-event-schema--contracts)
9. [Validation & Business Rules](#9-validation--business-rules)
10. [Security & Permission Logic](#10-security--permission-logic)
11. [Audit & Compliance Logic](#11-audit--compliance-logic)
12. [Error Handling & Recovery](#12-error-handling--recovery)
13. [Configuration Management](#13-configuration-management)
14. [Performance & Optimization Rules](#14-performance--optimization-rules)

---

## 1. Executive Overview

### Purpose
This document defines the complete business logic layer of the BLIH system. It serves as the authoritative reference for:
- Business rule implementation
- Data flow orchestration
- System behavior and constraints
- Integration patterns between modules

### February 2026 Auth/Event Alignment

- Single-company SSO uses one Keycloak realm (`blih`) and one login/session across modules.
- Gateway/BFF-first token verification is supported via trusted `x-principal-*` headers (guarded by shared secret) for downstream module APIs.
- Authorization model is RBAC + data scope with role scope levels: `global`, `organization`, `department`, `self`.
- Core DB is canonical for role/permission policy writes.
- Core identity events are standardized with `core.*` names while legacy events remain during transition.
- Event envelope now requires both `metadata.version` and `metadata.schema`.

### Single Realm Implementation

- The system uses one Keycloak realm only (config: `KEYCLOAK_REALM`, default `blih`). No API query or body parameter is used to override realm.
- Realm resolution is centralized in **RealmContextService** (`getRealmName()`, `getRealmId()`). Event persistence, audit, and event consumers use this service; realm is not passed through event payloads for tenant resolution.
- Event `metadata.realm` is deprecated: producers omit it, consumers use the configured realm. See [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md).

### Core Philosophy
**Decentralized Logic / Centralized Governance**
- Business logic resides within domain modules
- Cross-cutting concerns (auth, audit, notifications) managed centrally
- Integration via event-driven patterns
- Compliance and security enforced globally

### System Context
```
┌─────────────────────────────────────────────────────────────┐
│                    BLIH CORE LOGIC LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Global Constraints Engine                     │  │
│  │  • Temporal Logic (UTC, Ethiopian Calendar)          │  │
│  │  • Monetary Logic (Integer Precision, Multi-Currency)│  │
│  │  • Company Context (Single Tenant Enforcement)       │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Module Business Logic Layer                   │  │
│  │  [HR] [CRM] [Projects] [Finance] [Brain]            │  │
│  └──────────────────────────────────────────────────────┘  │
│                          ↓                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Orchestration & Event Bus                     │  │
│  │  • RabbitMQ Event Routing                            │  │
│  │  • Saga Pattern Coordination                         │  │
│  │  • Cross-Module Workflows                            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles

### 2.1 Modularity & Bounded Contexts

Each module operates as a self-contained bounded context:

| Module | Bounded Context | Primary Entities |
|--------|----------------|------------------|
| **HR** | Employee Lifecycle | Employee, Recruitment, Onboarding, Attendance, Performance |
| **CRM** | Sales Pipeline | Lead, Deal, Contact, Organization, Activity |
| **Projects** | Delivery Management | Project, Task, Resource, Timesheet, Milestone |
| **Finance** | Financial Operations | Invoice, Payment, Payroll, Expense, Account |
| **Brain** | Knowledge & AI | Document, Decision, Policy, Lesson Learned, Chat |
| **Chatbot** | Conversation & RAG | Session, Message, Query, Response |

**Chatbot** is a domain module like HR, CRM, Finance, Brain, and Projects: it MUST NOT call other modules’ APIs; it consumes and publishes only via `blih.events` (e.g. `chatbot.query.received`, `chatbot.response.sent`, or Brain events for knowledge). See [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md) for event types.

### 2.2 Event-Driven Communication

**Rules:**
1. Modules MUST NOT directly call other modules' APIs
2. All cross-module communication happens via events
3. Events are published to RabbitMQ exchange: `blih.events`
4. Each module subscribes to relevant event patterns
5. Events are immutable and versioned

**Event Naming Convention:**
```
{module}.{entity}.{action}

Examples:
- hr.employee.hired
- crm.deal.won
- projects.project.completed
- finance.invoice.paid
```

### 2.3 Compliance-First Design

**Every operation follows this flow:**
```
┌──────────────┐
│ User Request │
└──────┬───────┘
       ↓
┌──────────────────┐
│ Authentication   │ ← JWT Token Validation
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Authorization    │ ← RBAC Permission Check
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Validation       │ ← Business Rules Validation
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Pre-Audit Hook   │ ← Capture "Before" State
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Business Logic   │ ← Execute Domain Logic
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Post-Audit Hook  │ ← Capture "After" State
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Event Publishing │ ← Notify Other Modules
└──────┬───────────┘
       ↓
┌──────────────────┐
│ Response         │
└──────────────────┘
```

### 2.4 Single Company Context

**Enforcement Levels:**

1. **Database Level:**
```sql
-- All tables include company_id with default
CREATE TABLE employees (
  id UUID PRIMARY KEY,
  company_id VARCHAR(50) DEFAULT 'BLIH' NOT NULL,
  -- other fields
  CONSTRAINT chk_company CHECK (company_id = 'BLIH')
);

CREATE INDEX idx_company ON employees(company_id);
```

2. **ORM Level:**
```typescript
// Global query filter
EntityManager.setGlobalFilter('company', {
  company_id: 'BLIH'
});
```

3. **API Level:**
```typescript
// Middleware injects company context
@Injectable()
export class CompanyContextMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.context = { companyId: 'BLIH' };
    next();
  }
}
```

---

## 3. Global Constraints Engine

### 3.1 Temporal Logic

#### 3.1.1 UTC Storage Standard
**Rule:** All timestamps MUST be stored in UTC in the database.

```typescript
// Storage Layer
const timestamp = new Date().toISOString(); // "2026-02-10T10:13:22.000Z"

// Display Layer
const userTimezone = 'Africa/Addis_Ababa';
const localTime = convertToTimezone(timestamp, userTimezone);
```

#### 3.1.2 Ethiopian Calendar Support

**Context:** Ethiopia uses a 13-month calendar (12 months of 30 days + 1 month of 5/6 days).

**Implementation:**
```typescript
class EthiopianCalendarService {
  /**
   * Converts Gregorian date to Ethiopian date
   * Algorithm accounts for 7-8 year offset and different month structure
   */
  gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
    // Implementation uses astronomical calculations
    // Accounts for leap years in both calendars
  }

  /**
   * Ethiopian → Gregorian conversion
   */
  ethiopianToGregorian(ethiopianDate: EthiopianDate): Date {
    // Reverse conversion
  }

  /**
   * Gets Ethiopian fiscal year
   * Ethiopian FY starts on Meskerem 1 (≈ Sep 11)
   */
  getFiscalYear(date: Date): number {
    const ethiopian = this.gregorianToEthiopian(date);
    return ethiopian.month >= 1 ? ethiopian.year : ethiopian.year - 1;
  }
}
```

**Usage in HR Module:**
- Attendance tracking uses Ethiopian dates for display
- Leave calculations respect Ethiopian month boundaries
- Payroll cycles can be configured for Ethiopian months

**Usage in Finance Module:**
- Ethiopian tax year calculations
- VAT reporting periods aligned with Ethiopian calendar

### 3.2 Monetary Logic

#### 3.2.1 Integer-Based Storage
**Rule:** Store all monetary values as integers (smallest currency unit).

```typescript
// ❌ WRONG - Floating point errors
const salary = 1500.50; // Can become 1500.4999999

// ✅ CORRECT - Integer cents/centimes
const salaryInCents = 150050; // $1,500.50 = 150050 cents

class Money {
  constructor(
    private readonly amount: number, // Integer
    private readonly currency: string
  ) {}

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    // Multiplication happens in integers
    return new Money(Math.round(this.amount * factor), this.currency);
  }

  divide(divisor: number): Money {
    // Division rounds to nearest integer
    return new Money(Math.round(this.amount / divisor), this.currency);
  }

  toDecimal(): number {
    return this.amount / 100;
  }
}
```

#### 3.2.2 Multi-Currency Logic

**Base Currency:** ETB (Ethiopian Birr)

**Exchange Rate Strategy:**
```typescript
interface ExchangeRate {
  from_currency: string;
  to_currency: string;
  rate: number; // Stored as integer (rate * 10000)
  effective_date: Date;
  source: 'MANUAL' | 'AUTO';
}

class CurrencyService {
  /**
   * Converts amount to base currency
   * Stores both original and converted amounts
   */
  async convertToBase(
    amount: Money,
    effectiveDate: Date
  ): Promise<MoneyConversion> {
    if (amount.currency === 'ETB') {
      return {
        original: amount,
        base: amount,
        rate: 1,
        effectiveDate
      };
    }

    const rate = await this.getRate(
      amount.currency,
      'ETB',
      effectiveDate
    );

    return {
      original: amount,
      base: amount.multiply(rate),
      rate,
      effectiveDate
    };
  }
}
```

**Transaction Storage:**
```typescript
interface FinancialTransaction {
  id: string;
  amount: number; // Original currency, integer
  currency: string;
  base_amount: number; // ETB equivalent, integer
  exchange_rate: number;
  rate_date: Date;
  // ... other fields
}
```

### 3.3 Precision Rules

#### Tax Calculations
```typescript
/**
 * Tax calculation order to maximize precision:
 * 1. Calculate all additions first
 * 2. Calculate all multiplications
 * 3. Division (rounding) happens last
 */
function calculateIncomeTax(grossSalary: Money): TaxBreakdown {
  const taxableIncome = grossSalary
    .subtract(STANDARD_DEDUCTION)
    .subtract(pensionContribution);

  // Progressive tax brackets
  const brackets = [
    { limit: 60000, rate: 0.00 },
    { limit: 165000, rate: 0.10 },
    { limit: 360000, rate: 0.15 },
    { limit: 660000, rate: 0.20 },
    { limit: 960000, rate: 0.25 },
    { limit: 1260000, rate: 0.30 },
    { limit: Infinity, rate: 0.35 }
  ];

  let tax = 0;
  let remaining = taxableIncome.amount;

  for (let i = 0; i < brackets.length; i++) {
    const bracket = brackets[i];
    const previousLimit = i > 0 ? brackets[i-1].limit : 0;
    const bracketSize = bracket.limit - previousLimit;
    
    if (remaining <= 0) break;
    
    const taxableInBracket = Math.min(remaining, bracketSize);
    const taxInBracket = Math.round(taxableInBracket * bracket.rate);
    
    tax += taxInBracket;
    remaining -= bracketSize;
  }

  return {
    grossSalary: grossSalary.amount,
    taxableIncome: taxableIncome.amount,
    totalTax: tax,
    netSalary: grossSalary.amount - tax
  };
}
```

---

## 4. Entity Lifecycle State Machines

### 4.1 Generic State Machine Pattern

All entities follow a standardized FSM pattern:

```typescript
interface StateMachine<S extends string> {
  currentState: S;
  allowedTransitions: Map<S, S[]>;
  validators: Map<S, TransitionValidator>;
  hooks: {
    beforeTransition: TransitionHook[];
    afterTransition: TransitionHook[];
  };
}

abstract class EntityLifecycle<T, S extends string> {
  abstract getStateMachine(): StateMachine<S>;

  async transition(
    entity: T,
    toState: S,
    context: TransitionContext
  ): Promise<T> {
    const sm = this.getStateMachine();
    
    // 1. Validate transition is allowed
    if (!this.isTransitionAllowed(entity, toState)) {
      throw new InvalidTransitionError(
        `Cannot transition from ${entity.status} to ${toState}`
      );
    }

    // 2. Run validators
    await this.runValidators(entity, toState, context);

    // 3. Before hooks
    await this.runBeforeHooks(entity, toState, context);

    // 4. Update state
    const previousState = entity.status;
    entity.status = toState;
    entity.statusChangedAt = new Date();
    entity.statusChangedBy = context.userId;

    // 5. Persist
    await this.repository.save(entity);

    // 6. After hooks (events, notifications)
    await this.runAfterHooks(entity, previousState, toState, context);

    return entity;
  }
}
```

### 4.2 Lead Lifecycle (CRM Module)

```typescript
enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  UNQUALIFIED = 'UNQUALIFIED',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

const LEAD_STATE_MACHINE: StateMachine<LeadStatus> = {
  currentState: LeadStatus.NEW,
  allowedTransitions: new Map([
    [LeadStatus.NEW, [LeadStatus.CONTACTED, LeadStatus.UNQUALIFIED]],
    [LeadStatus.CONTACTED, [LeadStatus.QUALIFIED, LeadStatus.UNQUALIFIED]],
    [LeadStatus.QUALIFIED, [LeadStatus.CONVERTED, LeadStatus.LOST]],
    [LeadStatus.UNQUALIFIED, [LeadStatus.CONTACTED]], // Can re-engage
    [LeadStatus.CONVERTED, []], // Terminal state
    [LeadStatus.LOST, [LeadStatus.CONTACTED]] // Can revive
  ]),
  validators: new Map([
    [LeadStatus.QUALIFIED, async (lead) => {
      if (!lead.estimatedValue || lead.estimatedValue < 1000) {
        throw new ValidationError('Qualified leads must have value >= $1000');
      }
      if (!lead.contactAttempts || lead.contactAttempts < 2) {
        throw new ValidationError('Must contact at least 2 times before qualifying');
      }
    }],
    [LeadStatus.CONVERTED, async (lead) => {
      if (lead.status !== LeadStatus.QUALIFIED) {
        throw new ValidationError('Only qualified leads can be converted');
      }
    }]
  ])
};
```

**Conversion Logic:**
```typescript
class LeadService {
  async convertToDeal(
    leadId: string,
    conversionData: LeadConversionDto,
    context: UserContext
  ): Promise<ConversionResult> {
    const lead = await this.repository.findById(leadId);
    
    await this.lifecycle.transition(lead, LeadStatus.CONVERTED, context);

    // Create related entities
    const organization = await this.createOrganization(lead, conversionData);
    const contact = await this.createContact(lead, organization);
    const deal = await this.createDeal(lead, organization, contact, conversionData);

    // Publish event
    await this.eventBus.publish({
      type: 'crm.lead.converted',
      data: {
        leadId: lead.id,
        dealId: deal.id,
        organizationId: organization.id,
        contactId: contact.id
      }
    });

    return { lead, deal, organization, contact };
  }
}
```

### 4.3 Employee Lifecycle (HR Module)

```typescript
enum EmployeeStatus {
  OFFER_PENDING = 'OFFER_PENDING',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  NOTICE_PERIOD = 'NOTICE_PERIOD',
  EXITED = 'EXITED'
}

const EMPLOYEE_STATE_MACHINE: StateMachine<EmployeeStatus> = {
  allowedTransitions: new Map([
    [EmployeeStatus.OFFER_PENDING, [
      EmployeeStatus.OFFER_ACCEPTED,
      EmployeeStatus.EXITED
    ]],
    [EmployeeStatus.OFFER_ACCEPTED, [
      EmployeeStatus.ONBOARDING
    ]],
    [EmployeeStatus.ONBOARDING, [
      EmployeeStatus.ACTIVE,
      EmployeeStatus.EXITED
    ]],
    [EmployeeStatus.ACTIVE, [
      EmployeeStatus.ON_LEAVE,
      EmployeeStatus.SUSPENDED,
      EmployeeStatus.NOTICE_PERIOD
    ]],
    [EmployeeStatus.ON_LEAVE, [
      EmployeeStatus.ACTIVE
    ]],
    [EmployeeStatus.SUSPENDED, [
      EmployeeStatus.ACTIVE,
      EmployeeStatus.EXITED
    ]],
    [EmployeeStatus.NOTICE_PERIOD, [
      EmployeeStatus.EXITED,
      EmployeeStatus.ACTIVE // Resignation withdrawn
    ]],
    [EmployeeStatus.EXITED, []] // Terminal
  ])
};
```

**Activation Logic (Onboarding → Active):**
```typescript
class EmployeeLifecycleService {
  async activate(
    employeeId: string,
    context: UserContext
  ): Promise<Employee> {
    const employee = await this.repository.findById(employeeId);

    // Validate onboarding completion
    const checklist = await this.onboardingService.getChecklist(employeeId);
    if (!checklist.isComplete) {
      throw new BusinessRuleError(
        'Cannot activate employee until onboarding is complete'
      );
    }

    // Transition to ACTIVE
    await this.lifecycle.transition(employee, EmployeeStatus.ACTIVE, context);

    // Trigger side effects via events
    await this.eventBus.publish({
      type: 'hr.employee.activated',
      data: {
        employeeId: employee.id,
        startDate: employee.startDate,
        department: employee.department,
        position: employee.position
      }
    });

    return employee;
  }
}
```

**Event Subscribers (Other modules listen):**
```typescript
// Finance Module - Subscribes to activation
@EventHandler('hr.employee.activated')
async handleEmployeeActivation(event: EmployeeActivatedEvent) {
  // Create payroll entry
  await this.payrollService.createEmployeePayroll({
    employeeId: event.data.employeeId,
    effectiveDate: event.data.startDate,
    status: 'PENDING_SETUP'
  });
}

// IT Module - Subscribes to activation
@EventHandler('hr.employee.activated')
async handleEmployeeActivation(event: EmployeeActivatedEvent) {
  // Provision IT resources
  await this.provisioningService.createTicket({
    type: 'NEW_HIRE',
    employeeId: event.data.employeeId,
    requests: ['EMAIL', 'LAPTOP', 'ACCESS_CARDS']
  });
}
```

### 4.4 Project Lifecycle (Projects Module)

```typescript
enum ProjectStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
  ARCHIVED = 'ARCHIVED'
}

const PROJECT_STATE_MACHINE: StateMachine<ProjectStatus> = {
  allowedTransitions: new Map([
    [ProjectStatus.DRAFT, [
      ProjectStatus.PLANNED,
      ProjectStatus.CANCELED
    ]],
    [ProjectStatus.PLANNED, [
      ProjectStatus.IN_PROGRESS,
      ProjectStatus.CANCELED
    ]],
    [ProjectStatus.IN_PROGRESS, [
      ProjectStatus.ON_HOLD,
      ProjectStatus.COMPLETED,
      ProjectStatus.CANCELED
    ]],
    [ProjectStatus.ON_HOLD, [
      ProjectStatus.IN_PROGRESS,
      ProjectStatus.CANCELED
    ]],
    [ProjectStatus.COMPLETED, [
      ProjectStatus.ARCHIVED
    ]],
    [ProjectStatus.CANCELED, [
      ProjectStatus.ARCHIVED
    ]],
    [ProjectStatus.ARCHIVED, []] // Terminal
  ]),
  validators: new Map([
    [ProjectStatus.IN_PROGRESS, async (project) => {
      // Must have at least one team member
      if (!project.teamMembers || project.teamMembers.length === 0) {
        throw new ValidationError('Cannot start project without team members');
      }
      // Must have defined milestones
      const milestones = await getMilestones(project.id);
      if (milestones.length === 0) {
        throw new ValidationError('Cannot start project without milestones');
      }
    }],
    [ProjectStatus.COMPLETED, async (project) => {
      // All milestones must be completed
      const milestones = await getMilestones(project.id);
      const incomplete = milestones.filter(m => m.status !== 'COMPLETED');
      if (incomplete.length > 0) {
        throw new ValidationError(
          `Cannot complete project with ${incomplete.length} incomplete milestones`
        );
      }
    }]
  ])
};
```

**Completion Logic:**
```typescript
class ProjectLifecycleService {
  async complete(
    projectId: string,
    completionData: ProjectCompletionDto,
    context: UserContext
  ): Promise<Project> {
    const project = await this.repository.findById(projectId);

    // Transition to COMPLETED
    await this.lifecycle.transition(project, ProjectStatus.COMPLETED, context);

    // Update completion metrics
    project.actualEndDate = new Date();
    project.completionNotes = completionData.notes;
    await this.repository.save(project);

    // Publish completion event
    await this.eventBus.publish({
      type: 'projects.project.completed',
      data: {
        projectId: project.id,
        crmDealId: project.sourceDealId,
        actualEndDate: project.actualEndDate,
        budgetUtilization: await this.calculateBudgetUtilization(project),
        teamPerformance: await this.calculateTeamMetrics(project)
      }
    });

    return project;
  }
}

// Brain Module - Extract lessons learned
@EventHandler('projects.project.completed')
async extractLessonsLearned(event: ProjectCompletedEvent) {
  const analysis = await this.aiService.generateLessonsLearned({
    projectId: event.data.projectId,
    metrics: event.data.teamPerformance,
    budget: event.data.budgetUtilization
  });

  await this.knowledgeService.createLessonLearned({
    projectId: event.data.projectId,
    content: analysis,
    category: 'PROJECT_RETROSPECTIVE',
    visibility: 'INTERNAL'
  });
}

// Finance Module - Finalize project financials
@EventHandler('projects.project.completed')
async finalizeProjectFinancials(event: ProjectCompletedEvent) {
  // Close project budget
  await this.budgetService.closeProjectBudget(event.data.projectId);
  
  // Generate final invoice if milestone-based
  const deal = await this.dealService.findById(event.data.crmDealId);
  if (deal.billingType === 'MILESTONE') {
    await this.invoiceService.generateFinalInvoice({
projectId: event.data.projectId,
      dealId: deal.id
    });
  }
}
```

### 4.5 Invoice Lifecycle (Finance Module)

```typescript
enum InvoiceStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  SENT = 'SENT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  OVERDUE = 'OVERDUE',
  CANCELED = 'CANCELED',
  VOID = 'VOID'
}

const INVOICE_STATE_MACHINE: StateMachine<InvoiceStatus> = {
  allowedTransitions: new Map([
    [InvoiceStatus.DRAFT, [
      InvoiceStatus.PENDING_APPROVAL,
      InvoiceStatus.CANCELED
    ]],
    [InvoiceStatus.PENDING_APPROVAL, [
      InvoiceStatus.APPROVED,
      InvoiceStatus.DRAFT // Send back for revision
    ]],
    [InvoiceStatus.APPROVED, [
      InvoiceStatus.SENT
    ]],
    [InvoiceStatus.SENT, [
      InvoiceStatus.PAYMENT_RECEIVED,
      InvoiceStatus.OVERDUE,
      InvoiceStatus.VOID
    ]],
    [InvoiceStatus.OVERDUE, [
      InvoiceStatus.PAYMENT_RECEIVED,
      InvoiceStatus.VOID
    ]],
    [InvoiceStatus.PAYMENT_RECEIVED, []], // Terminal
    [InvoiceStatus.CANCELED, []], // Terminal
    [InvoiceStatus.VOID, []] // Terminal
  ])
};
```

**Payment Logic:**
```typescript
class InvoiceService {
  async recordPayment(
    invoiceId: string,
    paymentData: PaymentDto,
    context: UserContext
  ): Promise<Invoice> {
    const invoice = await this.repository.findById(invoiceId);

    // Validate payment amount
    if (paymentData.amount !== invoice.totalAmount) {
      throw new ValidationError(
        `Payment amount ${paymentData.amount} does not match invoice total ${invoice.totalAmount}`
      );
    }

    // Record payment
    const payment = await this.paymentService.create({
      invoiceId: invoice.id,
      amount: paymentData.amount,
      currency: invoice.currency,
      paymentMethod: paymentData.method,
      paymentDate: paymentData.date,
      reference: paymentData.reference
    });

    // Update invoice status
    await this.lifecycle.transition(
      invoice,
      InvoiceStatus.PAYMENT_RECEIVED,
      context
    );

    invoice.paidAt = payment.paymentDate;
    invoice.paymentReference = payment.reference;
    await this.repository.save(invoice);

    // Publish event
    await this.eventBus.publish({
      type: 'finance.invoice.paid',
      data: {
        invoiceId: invoice.id,
        projectId: invoice.projectId,
        dealId: invoice.dealId,
        amount: payment.amount,
        paidAt: payment.paymentDate
      }
    });

    return invoice;
  }
}

// Projects Module - Update project budget
@EventHandler('finance.invoice.paid')
async updateProjectBudget(event: InvoicePaidEvent) {
  if (!event.data.projectId) return;

  await this.budgetService.recordRevenue({
    projectId: event.data.projectId,
    amount: event.data.amount,
    source: 'INVOICE_PAYMENT',
    reference: event.data.invoiceId
  });
}

// CRM Module - Update deal status
@EventHandler('finance.invoice.paid')
async updateDealRevenue(event: InvoicePaidEvent) {
  if (!event.data.dealId) return;

  const deal = await this.dealRepository.findById(event.data.dealId);
  deal.receivedRevenue += event.data.amount;
  
  if (deal.receivedRevenue >= deal.value) {
    deal.revenueStatus = 'FULLY_PAID';
  }
  
  await this.dealRepository.save(deal);
}
```

---

## 5. Cross-Module Orchestration Patterns

### 5.1 Saga Pattern Implementation

**Saga Coordinator:**
```typescript
abstract class Saga<T extends SagaState> {
  abstract steps: SagaStep[];
  
  async execute(input: T): Promise<SagaResult> {
    const context: SagaContext = {
      state: input,
      completedSteps: [],
      compensations: []
    };

    try {
      for (const step of this.steps) {
        await this.executeStep(step, context);
        context.completedSteps.push(step.name);
      }
      
      return { success: true, state: context.state };
    } catch (error) {
      // Compensate in reverse order
      for (const step of context.completedSteps.reverse()) {
        await this.compensate(step, context);
      }
      
      return { success: false, error, state: context.state };
    }
  }
}
```

### 5.2 Sales-to-Delivery Saga

```typescript
class SaleToDeliverySaga extends Saga<SaleToDeliveryState> {
  steps = [
    // Step 1: Create Project
    {
      name: 'CREATE_PROJECT',
      execute: async (ctx) => {
        const project = await this.projectService.create({
          name: ctx.state.deal.name,
          sourceDealId: ctx.state.deal.id,
          clientOrganizationId: ctx.state.deal.organizationId,
          estimatedValue: ctx.state.deal.value,
          startDate: ctx.state.deal.expectedStartDate
        });
        ctx.state.projectId = project.id;
      },
      compensate: async (ctx) => {
        await this.projectService.delete(ctx.state.projectId);
      }
    },

    // Step 2: Generate Milestones
    {
      name: 'GENERATE_MILESTONES',
      execute: async (ctx) => {
        const milestones = await this.milestoneGenerator.fromDealLineItems(
          ctx.state.deal.lineItems,
          ctx.state.projectId
        );
        ctx.state.milestoneIds = milestones.map(m => m.id);
      },
      compensate: async (ctx) => {
        await this.milestoneService.deleteBatch(ctx.state.milestoneIds);
      }
    },

    // Step 3: Create Project Workspace in Brain
    {
      name: 'CREATE_WORKSPACE',
      execute: async (ctx) => {
        const workspace = await this.brainService.createProjectWorkspace({
          projectId: ctx.state.projectId,
          name: ctx.state.deal.name,
          templates: this.getTemplatesForProjectType(ctx.state.projectType)
        });
        ctx.state.workspaceId = workspace.id;
      },
      compensate: async (ctx) => {
        await this.brainService.deleteWorkspace(ctx.state.workspaceId);
      }
    },

    // Step 4: Generate Invoices (if prepayment required)
    {
      name: 'GENERATE_INVOICES',
      execute: async (ctx) => {
        if (ctx.state.deal.requiresPrepayment) {
          const invoice = await this.invoiceService.generateDepositInvoice({
            dealId: ctx.state.deal.id,
            projectId: ctx.state.projectId,
            percentage: ctx.state.deal.prepaymentPercentage
          });
          ctx.state.invoiceIds = [invoice.id];
        }
      },
      compensate: async (ctx) => {
        if (ctx.state.invoiceIds) {
          await this.invoiceService.voidBatch(ctx.state.invoiceIds);
        }
      }
    },

    // Step 5: Assign Team (if auto-assignment enabled)
    {
      name: 'ASSIGN_TEAM',
      execute: async (ctx) => {
        if (ctx.state.autoAssignTeam) {
          const team = await this.teamAssignmentService.autoAssign({
            projectId: ctx.state.projectId,
            skills: ctx.state.requiredSkills,
            availability: ctx.state.projectDuration
          });
          ctx.state.teamMembers = team.map(t => t.employeeId);
        }
      },
      compensate: async (ctx) => {
        await this.projectService.clearTeam(ctx.state.projectId);
      }
    }
  ];
}
```

**Usage:**
```typescript
// CRM Module - Deal Won Handler
@EventHandler('crm.deal.won')
async handleDealWon(event: DealWonEvent) {
  const saga = new SaleToDeliverySaga(/* services */);
  
  const result = await saga.execute({
    deal: event.data.deal,
    projectType: event.data.projectType,
    requiredSkills: event.data.requiredSkills,
    autoAssignTeam: true
  });

  if (result.success) {
    await this.notificationService.send({
      to: event.data.deal.ownerId,
      title: 'Project Created Successfully',
      body: `Project ${result.state.projectId} created from deal ${event.data.deal.id}`
    });
  } else {
    log.error('Sale-to-delivery saga failed', result.error);
    await this.notificationService.sendAlert({
      to: 'SALES_MANAGER',
      title: 'Project Creation Failed',
      error: result.error
    });
  }
}
```

### 5.3 Employee Hire-to-Payroll Workflow

```typescript
class HireToPayrollSaga extends Saga<HireToPayrollState> {
  steps = [
    // Step 1: Create Employee Record
    {
      name: 'CREATE_EMPLOYEE',
      execute: async (ctx) => {
        const employee = await this.employeeService.create(ctx.state.employeeData);
        ctx.state.employeeId = employee.id;
      },
      compensate: async (ctx) => {
        await this.employeeService.delete(ctx.state.employeeId);
      }
    },

    // Step 2: Create User Account
    {
      name: 'CREATE_USER_ACCOUNT',
      execute: async (ctx) => {
        const user = await this.authService.createUser({
          email: ctx.state.employeeData.email,
          firstName: ctx.state.employeeData.firstName,
          lastName: ctx.state.employeeData.lastName,
          roles: ['EMPLOYEE']
        });
        ctx.state.userId = user.id;
      },
      compensate: async (ctx) => {
        await this.authService.deleteUser(ctx.state.userId);
      }
    },

    // Step 3: Generate Onboarding Checklist
    {
      name: 'CREATE_ONBOARDING',
      execute: async (ctx) => {
        const checklist = await this.onboardingService.generateChecklist({
          employeeId: ctx.state.employeeId,
          department: ctx.state.employeeData.department,
          position: ctx.state.employeeData.position
        });
        ctx.state.checklistId = checklist.id;
      },
      compensate: async (ctx) => {
        await this.onboardingService.deleteChecklist(ctx.state.checklistId);
      }
    },

    // Step 4: Setup Payroll
    {
      name: 'SETUP_PAYROLL',
      execute: async (ctx) => {
        const payroll = await this.payrollService.createEmployeePayroll({
          employeeId: ctx.state.employeeId,
          basicSalary: ctx.state.employeeData.salary,
          effectiveDate: ctx.state.employeeData.startDate,
          paymentMethod: ctx.state.employeeData.paymentMethod,
          bankAccount: ctx.state.employeeData.bankAccount
        });
        ctx.state.payrollId = payroll.id;
      },
      compensate: async (ctx) => {
        await this.payrollService.deletePayroll(ctx.state.payrollId);
      }
    },

    // Step 5: IT Provisioning Request
    {
      name: 'IT_PROVISIONING',
      execute: async (ctx) => {
        const ticket = await this.itService.createProvisioningTicket({
          employeeId: ctx.state.employeeId,
          startDate: ctx.state.employeeData.startDate,
          equipment: ctx.state.equipmentNeeds,
          access: ctx.state.systemAccess
        });
        ctx.state.itTicketId = ticket.id;
      },
      compensate: async (ctx) => {
        await this.itService.cancelTicket(ctx.state.itTicketId);
      }
    }
  ];
}
```

---

## 6. Data Synchronization Logic

### 6.1 Polyglot Persistence Strategy

**Database Usage Matrix:**

| Data Type | Primary DB | Secondary DB | Vector DB | Reason |
|-----------|-----------|--------------|-----------|---------|
| User/Auth | PostgreSQL | - | - | ACID transactions, FK constraints |
| Employee Records | PostgreSQL | MongoDB | - | Transactional integrity + Document flexibility |
| HR Forms | MongoDB | - | Qdrant | Complex nested data + AI search |
| CRM Entities | PostgreSQL | MongoDB | - | Relational queries + Fast reads |
| Projects | PostgreSQL | MongoDB | - | Budget tracking + Complex queries |
| Finance Transactions | PostgreSQL | - | - | Strong consistency required |
| Audit Logs | PostgreSQL | Elasticsearch | - | Compliance + Fast search |
| Knowledge Base | MongoDB | - | Qdrant | Document storage + Semantic search |
| Lessons Learned | MongoDB | - | Qdrant | RAG-powered retrieval |

### 6.2 PostgreSQL → MongoDB Projection

**Implementation:**
```typescript
class ProjectionService {
  // Subscribes to change data capture events
  @EventHandler('cdc.*.changed')
  async handleDataChange(event: CDCEvent) {
    const { table, operation, before, after } = event.data;

    switch (table) {
      case 'employees':
        await this.projectEmployee(after, operation);
        break;
      case 'deals':
        await this.projectDeal(after, operation);
        break;
      // ... other entities
    }
  }

  private async projectEmployee(data: any, operation: string) {
    if (operation === 'DELETE') {
      await this.mongoClient
        .db('blih')
        .collection('employees_view')
        .deleteOne({ _id: data.id });
      return;
    }

    // Enrich with related data for fast queries
    const enriched = {
      _id: data.id,
      employeeId: data.employee_id,
      fullName: `${data.first_name} ${data.last_name}`,
      email: data.email,
      department: await this.getDepartmentTree(data.department_id),
      manager: await this.getManagerInfo(data.manager_id),
      currentLeaveBalance: await this.getLeaveBalance(data.id),
      // Denormalized for dashboard performance
      recentActivities: await this.getRecentActivities(data.id, 5),
      performanceRating: await this.getLatestPerformanceRating(data.id),
      updatedAt: new Date()
    };

    await this.mongoClient
      .db('blih')
      .collection('employees_view')
      .updateOne(
        { _id: data.id },
        { $set: enriched },
        { upsert: true }
      );
  }
}
```

### 6.3 MongoDB → Qdrant Vector Embedding

**Implementation:**
```typescript
class EmbeddingService {
  @EventHandler('brain.document.finalized')
  async generateEmbedding(event: DocumentFinalizedEvent) {
    const document = await this.documentRepository.findById(
      event.data.documentId
    );

    // Extract text content
    const text = this.extractText(document);

    // Generate embedding using local LLM
    const embedding = await this.llmService.embed(text);

    // Store in Qdrant
    await this.vectorStore.upsert({
      collection: 'knowledge_base',
      points: [{
        id: document.id,
        vector: embedding,
        payload: {
          documentId: document.id,
          title: document.title,
          category: document.category,
          tags: document.tags,
          createdAt: document.createdAt,
          author: document.author,
          accessControl: document.visibility
        }
      }]
    });
  }

  private extractText(document: Document): string {
    // Combine title, content, and metadata
    const parts = [
      `Title: ${document.title}`,
      `Category: ${document.category}`,
      `Content: ${document.content}`,
      `Tags: ${document.tags.join(', ')}`
    ];

    if (document.metadata) {
      parts.push(`Context: ${JSON.stringify(document.metadata)}`);
    }

    return parts.join('\n\n');
  }
}
```

### 6.4 Cache Invalidation Strategy

```typescript
class CacheService {
  // Event-driven cache invalidation
  @EventHandler('*.*.updated')
  async invalidateCache(event: EntityUpdatedEvent) {
    const { entityType, entityId } = this.parseEventType(event.type);
    
    // Invalidate entity cache
    await this.redis.del(`${entityType}:${entityId}`);
    
    // Invalidate list caches that might include this entity
    await this.redis.del(`${entityType}:list:*`);
    
    // Invalidate computed caches
    const relatedCaches = this.getRelatedCaches(entityType, entityId);
    await Promise.all(
      relatedCaches.map(key => this.redis.del(key))
    );
  }

  private getRelatedCaches(entityType: string, entityId: string): string[] {
    const cacheMap = {
      'employee': [
        `org_chart:*`,
        `department:${entityType.departmentId}:employees`,
        `team:${entityType.teamId}:members`
      ],
      'project': [
        `dashboard:projects`,
        `portfolio:*`,
        `resource_utilization:*`
      ],
      // ... other mappings
    };

    return cacheMap[entityType] || [];
  }
}
```

---

This document continues with extensive sections on:
- **Business Rules by Module** (detailed validation logic for HR, CRM, Projects, Finance, Brain)
- **Event Schema & Contracts:** Envelope format and versioning rules, and a catalog of public event types and versions, are defined in [EVENT_CONTRACTS.md](./EVENT_CONTRACTS.md).
- **Validation & Business Rules** (comprehensive validation patterns)
- **Security & Permission Logic** (RBAC implementation details)
- **Audit & Compliance Logic** (immutable logging patterns). Retention is controlled by `AUDIT_RETENTION_DAYS` (default 2555); `CleanupAuditJob` purges older records. State-changing core endpoints use `@Audit()` for consistent logging.
- **Error Handling & Recovery** (retry logic, circuit breakers)
- **Configuration Management** (feature flags, environment-specific config)
- **Performance & Optimization Rules** (caching strategies, query optimization)

---

*Last Updated: February 2026*  
*Document Version: 1.0*  
*Status: Living Documentation - Updated with each major release*
