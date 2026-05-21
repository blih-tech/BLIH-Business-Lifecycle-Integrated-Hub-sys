# BLIH HR Management System — Comprehensive Backend Development Documentation

**Version:** 1.0
**Last Updated:** 2026-05-21
**Target Audience:** Backend Developers, Tech Leads, QA, DevOps
**Scope:** Complete BLIH People Engine — 8 Subsystems, 50 Forms, ~100 Database Models

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture & Cross-Cutting Concerns](#2-architecture--cross-cutting-concerns)
3. [Identity, Authentication & Authorization](#3-identity-authentication--authorization)
4. [Organizational Structure](#4-organizational-structure)
5. [Subsystem 1 — Recruitment & Hiring](#5-subsystem-1--recruitment--hiring)
6. [Subsystem 2 — Onboarding & Probation](#6-subsystem-2--onboarding--probation)
7. [Subsystem 3 — Employee Profiles & Records](#7-subsystem-3--employee-profiles--records)
8. [Subsystem 4 — Attendance, Leave & Time Management](#8-subsystem-4--attendance-leave--time-management)
9. [Subsystem 5 — Performance, OKRs & Career Development](#9-subsystem-5--performance-okrs--career-development)
10. [Subsystem 6 — Training & Skill Development](#10-subsystem-6--training--skill-development)
11. [Subsystem 7 — Employee Relations](#11-subsystem-7--employee-relations)
12. [Subsystem 8 — Exit, Offboarding & Compliance](#12-subsystem-8--exit-offboarding--compliance)
13. [Cross-Cutting Modules](#13-cross-cutting-modules)
14. [Background Jobs & Automation](#14-background-jobs--automation)
15. [API Conventions & Catalog](#15-api-conventions--catalog)
16. [Implementation Roadmap](#16-implementation-roadmap)

---

# 1. System Overview

## 1.1 Purpose

BLIH HR Management System ("BLIH Team") is the central **People Engine** for BLIH Marketing & Communications. It manages the entire employee lifecycle — from candidate application to final settlement — while enforcing compliance with Ethiopian Labour Law and internal company policy.

The system is designed to **automate ≈ 85% of HR operations** within 3–6 months of deployment, transforming HR from an administrative function into a proactive, data-driven engine.

## 1.2 The 8 Subsystems

```
┌─────────────────────────────────────────────────────────────────┐
│                       BLIH HR SYSTEM                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ 1. Recruitment   │ ──────► │ 2. Onboarding    │              │
│  │    & Hiring      │         │    & Probation   │              │
│  │   (6 forms)      │         │    (7 forms)     │              │
│  └──────────────────┘         └─────────┬────────┘              │
│                                         │                       │
│                                         ▼                       │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ 3. Profiles &    │ ◄─────► │ 4. Attendance,   │              │
│  │    Records       │         │    Leave & Time  │              │
│  │   (5 forms)      │         │    (6 forms)     │              │
│  └────────┬─────────┘         └──────────────────┘              │
│           │                                                     │
│           ▼                                                     │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ 5. Performance,  │ ──────► │ 6. Training &    │              │
│  │    OKRs & Career │         │    Skills        │              │
│  │   (9 forms)      │         │    (4 forms)     │              │
│  └──────────────────┘         └──────────────────┘              │
│                                                                 │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │ 7. Employee      │         │ 8. Exit &        │              │
│  │    Relations     │ ──────► │    Offboarding   │              │
│  │   (7 forms)      │         │    (6 forms)     │              │
│  └──────────────────┘         └──────────────────┘              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

| #   | Subsystem                   | Forms | Primary Tables                                                                                                                              |
| --- | --------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Recruitment & Hiring        | 6     | `JobRequestForm`, `Job`, `Applicant`, `InterviewSession`, `CvScreening`, `Offer`                                                            |
| 2   | Onboarding & Probation      | 7     | `Onboarding`, `OnboardingChecklist`, `OnboardingTask`, `ProbationPlan`, `EvaluationScore`                                                   |
| 3   | Employee Profiles & Records | 5     | `Employee`, `UserProfile`, `EmployeeContract`, `EmployeeDocument`, `JobDescription`                                                         |
| 4   | Attendance, Leave & Time    | 6     | `LeaveRequest`, `AttendanceLog`, `Timesheet`, `OvertimeRequest`, `FlexWorkRequest`, `AttendanceCorrectionRequest`                           |
| 5   | Performance, OKRs & Career  | 9     | `PerformanceReview`, `Okr`, `KeyResult`, `PromotionProposal`, `CareerDevelopmentPlan`, `InternalTransferRequest`, `SalaryAdjustmentRequest` |
| 6   | Training & Skills           | 4     | `Skill`, `TrainingRequest`, `TrainingCompletion`, `SkillGapAssessment`, `TrainingFeedback`                                                  |
| 7   | Employee Relations          | 7     | `IncidentReport`, `DisciplinaryAction`, `Grievance`, `Recognition`, `Survey`, `ConflictMediation`                                           |
| 8   | Exit & Offboarding          | 6     | `Resignation`, `OffboardingChecklist`, `ExitInterview`, `FinalSettlement`, `AssetReturn`, `ComplianceChecklist`                             |

## 1.3 Technology Stack

| Layer     | Technology              | Notes                                 |
| --------- | ----------------------- | ------------------------------------- |
| Runtime   | Node.js (LTS)           |                                       |
| Framework | NestJS                  | Modular monolith                      |
| Language  | TypeScript              | Strict mode                           |
| ORM       | Prisma                  | Multi-file schema, PostgreSQL         |
| Database  | PostgreSQL 15+          | UUID PKs, JSONB for flexible payloads |
| Identity  | Keycloak                | Auth delegated; no local passwords    |
| Cache     | In-memory (per service) | No Redis required for v1              |
| Email     | SMTP (Nodemailer)       | MailHog for local dev                 |
| Realtime  | Socket.IO               | Namespace `/notifications`            |
| AI/RAG    | Qdrant + LLM            | "Blih Brain" — separate but related   |
| Scheduler | `@nestjs/schedule`      | Cron jobs for reconciliation/expiry   |
| Webhooks  | Outbound HTTP           | For Finance, IT, n8n integrations     |

## 1.4 Core Design Principles

1. **Modular Monolith** — One deployable, internal module boundaries enforced.
2. **Permission-based RBAC** — `@Roles('employee:view')` checks permission slugs, not role names.
3. **Append-only history** — Employment, compensation, applicant status — all changes write history rows; current state mutates only in transactions.
4. **State machine first** — Every workflow entity has explicit `status` enums and documented transitions.
5. **Two-stage approvals** — Workflows have `DRAFT → PENDING → APPROVED/REJECTED` skeletons; multi-stage approvals model each step as a row.
6. **Server-computed integrity** — Days, scores, balances, settlements are recomputed server-side; client-supplied values are validated against server math.
7. **Verification gates** — Personal data starts `PENDING_REVIEW`, HR moves to `VERIFIED` or `REJECTED` with feedback.
8. **Idempotent automation hooks** — Cron jobs and onSubmit/onApprove handlers must tolerate retries.

## 1.5 Operational Roles (Conceptual)

The system uses permission-based RBAC, but operationally the following role families exist:

| Role Family                   | Typical Users | Core Capabilities                                             |
| ----------------------------- | ------------- | ------------------------------------------------------------- |
| **System Admin**              | IT/Platform   | RBAC, system config, audit, user lifecycle                    |
| **HR Admin / HR Manager**     | HR Team       | Owns recruitment, onboarding, leave, exit, settlement         |
| **Finance**                   | Finance Team  | Approves budget-impacting requests (jobs, salary, training)   |
| **CEO / GM**                  | Executives    | Final approver for senior decisions, terminations, promotions |
| **Department Head / Manager** | Line managers | Approves leave, timesheets, performance, transfer requests    |
| **Employee (Self-Service)**   | All staff     | Leave requests, OKRs, training requests, grievances, surveys  |
| **Applicant (Public)**        | Candidates    | Public application form submission only                       |

---

# 2. Architecture & Cross-Cutting Concerns

## 2.1 Layered Architecture

```
┌────────────────────────────────────────────────────────────┐
│                     HTTP / WebSocket                       │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   Middleware: CorrelationId → ValidationPipe              │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   Guards: KeycloakAuthGuard → RbacGuard → ScopeGuard      │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   Controllers (thin) — DTO in/out                          │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   Use Cases / Domain Services (business rules)            │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   PrismaService — direct delegate calls (no repo layer)   │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   PostgreSQL (Prisma)   │  Keycloak Admin API  │  SMTP    │
└────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│   Interceptors: PreAudit → Audit → ResponseEnvelope       │
└────────────────────────────────────────────────────────────┘
```

## 2.2 Module Structure

```
apps/api/src/
├── main.ts                       # bootstrap, helmet, CORS, Swagger
├── app.module.ts                 # imports Platform + Core + Domains
├── platform/                     # infrastructure adapters
│   ├── prisma/                   # PrismaService
│   ├── keycloak/                 # admin + token + mapper services
│   ├── smtp/                     # mail adapter
│   └── websocket/                # NotificationsGateway
├── core/                         # cross-cutting
│   ├── auth/                     # /auth controller, guards
│   ├── rbac/                     # RbacGuard, permission snapshot
│   ├── users/                    # /users controller, use cases
│   ├── audit/                    # audit log + export
│   ├── notifications/            # /notifications controller + gateway
│   ├── health/                   # /health endpoint
│   └── system-config/            # /system-config controller
└── domains/
    └── hr/
        ├── recruitment/          # Subsystem 1
        ├── onboarding/           # Subsystem 2
        ├── employees/            # Subsystem 3
        ├── attendance/           # Subsystem 4
        ├── performance/          # Subsystem 5 (perf + okr + career)
        ├── training/             # Subsystem 6
        ├── relations/            # Subsystem 7
        └── offboarding/          # Subsystem 8
```

## 2.3 Request/Response Envelope

**All successful responses:**

```json
{
  "success": true,
  "message": "Resource fetched successfully",
  "data": {
    /* payload */
  },
  "error": null,
  "meta": {
    "timestamp": "2026-05-21T10:00:00.000Z",
    "requestId": "<correlation-id>",
    "version": "1.0.0",
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 187,
      "totalPages": 10
    }
  }
}
```

**All error responses:**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "BAD_REQUEST",
    "details": "One or more fields are invalid",
    "fieldErrors": [
      { "field": "startDate", "message": "startDate must be a valid date" }
    ]
  },
  "meta": {
    "timestamp": "2026-05-21T10:00:00.000Z",
    "requestId": "<correlation-id>",
    "version": "1.0.0"
  }
}
```

**HTTP status conventions:**

| Status                      | Use                                              |
| --------------------------- | ------------------------------------------------ |
| `200 OK`                    | Successful GET/PATCH/PUT/DELETE                  |
| `201 Created`               | Successful POST creating a resource              |
| `204 No Content`            | Successful DELETE with no body                   |
| `400 Bad Request`           | DTO validation, invalid state transition         |
| `401 Unauthorized`          | Missing/expired/invalid token                    |
| `403 Forbidden`             | Authenticated but no permission                  |
| `404 Not Found`             | Resource not found                               |
| `409 Conflict`              | Unique constraint, duplicate workflow record     |
| `422 Unprocessable Entity`  | Domain rule violation (e.g., headcount exceeded) |
| `500 Internal Server Error` | Unhandled error (logged with correlationId)      |

## 2.4 Audit Trail

Every state-changing endpoint MUST be decorated:

```ts
@Audit({ action: 'leave.approve', resource: 'LeaveRequest', loadBefore: true })
@Roles('leave:approve')
@Post('/:id/approve')
approve(@Param('id') id: string, @Body() dto: ApproveLeaveDto) { ... }
```

`AuditLog` captures:

- `action` — domain verb (`leave.approve`, `employee.update`)
- `resource` + `resourceId`
- `actorUserId` (Keycloak `sub`)
- `before` / `after` JSON snapshots
- `requestId`, `correlationId`, `sessionId`, `ipAddress`, `userAgent`
- `result` (`SUCCESS` | `FAILURE`), `statusCode`

Audit logs are retained per `AUDIT_RETENTION_DAYS` (default 365) and exported via `/audit/export`.

## 2.5 Notification Architecture

```
┌─────────────┐
│  Use Case   │
└──────┬──────┘
       │ NotifyEvent({ userId, type, channels })
       ▼
┌─────────────────────┐
│ SendNotificationUC  │
└──────┬──────────────┘
       │
       ├─► Notification row (persistent)
       │
       ├─► NotificationDelivery rows per channel
       │
       ├─► EMAIL: SMTP via SendEmailUseCase
       ├─► WEBHOOK: HTTP POST via SendWebhookUseCase
       └─► IN_APP: Socket.IO emit to room `user:<userId>`
```

Channels: `EMAIL`, `WEBHOOK`, `IN_APP`. All three can fire concurrently per event.

## 2.6 Cross-Cutting Tables

| Table                                                   | Purpose                             |
| ------------------------------------------------------- | ----------------------------------- |
| `AuditLog`                                              | Immutable action trail              |
| `AuditExport`                                           | Async export job tracking           |
| `Notification` + `NotificationDelivery`                 | In-app/email/webhook delivery       |
| `WebhookEndpoint`                                       | Registered external listeners       |
| `SystemConfig`                                          | Global key-value config             |
| `ModuleConfig`                                          | Per-module feature flags & settings |
| `SecurityPolicy`                                        | MFA, session, password rules        |
| `WorkSchedule` + `WorkScheduleDay` + `UserWorkSchedule` | Schedule engine for attendance      |
| `Holiday`                                               | Per-country / global holidays       |
| `CountryReference`                                      | Country master data                 |

---

# 3. Identity, Authentication & Authorization

## 3.1 Identity Boundary

```
┌──────────────────┐         ┌──────────────────┐
│   Keycloak       │         │   BLIH Backend   │
│                  │         │                  │
│  • Login form    │         │  • No login form │
│  • Password hash │         │  • No password   │
│  • MFA           │ ──JWT──►│    storage       │
│  • Token issue   │         │  • Token verify  │
│  • Session mgmt  │         │  • Local profile │
└──────────────────┘         └──────────────────┘
```

**Critical: The backend never stores passwords.** Keycloak is the sole credential authority.

## 3.2 Token Lifecycle

```
[Client] ─────login──────► [Keycloak] ─returns access+refresh JWT──┐
                                                                   │
[Client] ──Bearer token──► [BLIH API] ── KeycloakAuthGuard ────────┤
                              │                                    │
                              ▼                                    │
                  KeycloakTokenService.validateAccessToken()       │
                              │                                    │
                              ▼                                    │
                  Verify: signature, issuer, audience (azp)        │
                              │                                    │
                              ▼                                    │
                  KeycloakMapperService → internal principal       │
                              │                                    │
                              ▼                                    │
                  PrincipalEnrichmentService → local User load     │
                              │                                    │
                              ▼                                    │
                  UserPermissionSnapshotService → effective perms  │
                              │                                    │
                              ▼                                    │
                  request.user = enriched principal                │
                              │                                    │
                              ▼                                    │
                          RbacGuard ──────────────────────────────┘
```

## 3.3 Auth Endpoints

| Method | Path                   | Purpose                                             |
| ------ | ---------------------- | --------------------------------------------------- |
| POST   | `/auth/validate`       | Verify bearer token without invocation side-effects |
| POST   | `/auth/introspect`     | Keycloak introspection wrapper                      |
| POST   | `/auth/exchange`       | Token exchange (impersonation / downscope)          |
| POST   | `/auth/refresh`        | Refresh access token                                |
| POST   | `/auth/revoke-session` | Revoke session at Keycloak                          |
| GET    | `/auth/me`             | Resolved principal context                          |

`GET /auth/me` returns:

```json
{
  "id": "8a3...", // local User.id
  "keycloakId": "abc-keycloak-sub",
  "username": "jane.doe",
  "email": "jane.doe@blih.local",
  "firstName": "Jane",
  "lastName": "Doe",
  "roles": ["hr_manager"],
  "permissions": ["employee:view", "leave:approve", "..."],
  "scopes": ["openid", "profile", "email"],
  "sessionId": "session-uuid",
  "clientId": "blih-api",
  "employee": {
    "employeeId": "7c1...",
    "departmentId": "...",
    "positionId": "...",
    "lifecycleStatus": "ACTIVE"
  }
}
```

## 3.4 Permission-Based RBAC

### 3.4.1 Decorator Usage

```ts
// CORRECT — permission slugs
@UseGuards(KeycloakAuthGuard, RbacGuard)
@Roles('leave:approve')  // misleading name; this is a PERMISSION slug
@Post('/leave/:id/approve')

// Required scopes (in addition)
@Scopes('openid', 'profile')
```

### 3.4.2 Permission Slug Format

`<resource>:<action>` — e.g.:

- `employee:view`, `employee:create`, `employee:update`, `employee:delete`
- `leave:approve`, `leave:request`
- `recruitment_request:submit`, `recruitment_request:approve`
- `system_role:manage`

Wildcards: `*` (superadmin), `employee:*` (all employee actions).

### 3.4.3 Effective Permission Resolution

```
function getEffectivePermissions(userId):
    explicit = user.permissions[]                       # local override list
    rolesExpanded = expandRoleHierarchy(user.roles)     # parent role inheritance

    if 'superadmin' in rolesExpanded:
        return ['*']

    rolePerms = unionOf(role.permissions for role in rolesExpanded)

    # Intersection — explicit perms must also be granted via a role
    return explicit ∩ rolePerms
```

> ⚠️ **Critical:** Permissions are _role-constrained_. A user with `employee:view` in `User.permissions` who has no role granting that permission will be denied. This prevents privilege escalation via direct DB writes.

### 3.4.4 Permission Catalog (Initial)

| Resource              | Actions                                                      |
| --------------------- | ------------------------------------------------------------ |
| `employee`            | `view`, `create`, `update`, `delete`, `disable`              |
| `employee_document`   | `view`, `upload`, `verify`, `delete`                         |
| `recruitment_request` | `view`, `create`, `submit`, `approve`, `reject`, `delete`    |
| `job_posting`         | `view`, `create`, `publish`, `close`                         |
| `applicant`           | `view`, `screen`, `shortlist`, `reject`                      |
| `interview`           | `schedule`, `feedback`, `view`                               |
| `offer`               | `create`, `send`, `withdraw`, `view`                         |
| `hiring_decision`     | `create`, `finalize`, `accept`                               |
| `onboarding`          | `start`, `view`, `verify`, `complete`                        |
| `probation`           | `view`, `create_plan`, `evaluate`, `confirm`                 |
| `leave`               | `view`, `request`, `approve`, `reject`, `cancel`             |
| `attendance`          | `view`, `log`, `correct`, `approve_correction`               |
| `overtime`            | `request`, `approve`                                         |
| `flex_work`           | `request`, `approve`                                         |
| `timesheet`           | `view`, `submit`, `approve`                                  |
| `performance`         | `view`, `start`, `self_review`, `manager_review`, `complete` |
| `okr`                 | `view`, `create`, `update`, `manager_review`                 |
| `promotion_proposal`  | `view`, `create`, `approve`, `reject`                        |
| `succession_plan`     | `view`, `create`, `update`                                   |
| `career_plan`         | `view`, `create`, `update`                                   |
| `transfer_request`    | `view`, `create`, `approve`                                  |
| `salary_adjustment`   | `view`, `propose`, `approve`                                 |
| `training`            | `view`, `request`, `approve`, `complete`, `feedback`         |
| `skill`               | `view`, `manage`, `gap_assess`                               |
| `incident`            | `view`, `report`, `investigate`, `close`                     |
| `disciplinary`        | `view`, `create`, `approve`                                  |
| `grievance`           | `view`, `file`, `assign`, `resolve`                          |
| `recognition`         | `view`, `nominate`, `approve`                                |
| `survey`              | `view`, `create`, `respond`                                  |
| `mediation`           | `view`, `request`, `mediate`                                 |
| `resignation`         | `view`, `submit`, `approve`                                  |
| `offboarding`         | `view`, `task_update`, `complete`                            |
| `final_settlement`    | `view`, `compute`, `approve`                                 |
| `system_role`         | `view`, `manage`                                             |
| `system_audit`        | `view`, `export`                                             |
| `system_config`       | `view`, `update`                                             |

## 3.5 Password & Session Management

### 3.5.1 Admin Password Reset

`POST /users/:userId/reset-password` — HR-only action that calls Keycloak Admin API:

```json
{
  "type": "password",
  "temporary": true,
  "value": "S3curePassw0rd!"
}
```

User is forced to change password on next login through Keycloak's own UI.

### 3.5.2 Self-Service Password Change

**Not handled by backend.** Users change passwords via Keycloak Account Console (typically `https://auth.blih.local/realms/blih/account`).

### 3.5.3 Session Controls

| Control                              | Source                                                          |
| ------------------------------------ | --------------------------------------------------------------- |
| MFA enforcement for privileged roles | `ENFORCE_MFA_FOR_PRIVILEGED=true`                               |
| Session timeout                      | Keycloak realm + `SecurityPolicy.sessionTimeoutMinutes`         |
| Concurrent sessions                  | `SecurityPolicy.maxConcurrentSessions`                          |
| Lockout threshold                    | `SecurityPolicy.lockoutThreshold`                               |
| Internal proxy trust                 | `TRUST_PROXY_PRINCIPAL_HEADERS` + `INTERNAL_AUTH_SHARED_SECRET` |

---

# 4. Organizational Structure

## 4.1 Entities

```
┌─────────────────┐
│   Department    │ (self-referencing hierarchy: parentId)
│ • name (unique) │
│ • parentId      │
└────────┬────────┘
         │ 1:N
         ▼
┌─────────────────┐
│    Position     │ (unique per department: title)
│ • title         │
│ • departmentId  │
│ • gradeId       │
│ • headcountLimit│
│ • isActive      │
└────────┬────────┘
         │ N:1
         ▼
┌─────────────────┐
│    JobGrade     │ (e.g., "L3 - Senior")
│ • code (unique) │
│ • level         │
│ • minSalary     │
│ • maxSalary     │
└─────────────────┘
```

## 4.2 Department Module

**Endpoints:**

| Method | Path                             | Permission          |
| ------ | -------------------------------- | ------------------- |
| GET    | `/org/departments`               | `department:view`   |
| GET    | `/org/departments/:id`           | `department:view`   |
| POST   | `/org/departments`               | `department:manage` |
| PATCH  | `/org/departments/:id`           | `department:manage` |
| DELETE | `/org/departments/:id`           | `department:manage` |
| GET    | `/org/departments/:id/positions` | `position:view`     |
| GET    | `/org/departments/:id/employees` | `employee:view`     |
| GET    | `/org/departments/tree`          | `department:view`   |

**Business rules:**

- `name` must be unique (case-insensitive).
- `parentId` cannot create a cycle (validate via recursive parent walk before save).
- Cannot delete a department with active positions or employees → soft-disable instead (add `isActive` field).
- Department tree query returns nested children.

## 4.3 Position Module

**Endpoints:**

| Method | Path                                 | Permission        |
| ------ | ------------------------------------ | ----------------- |
| GET    | `/org/positions`                     | `position:view`   |
| GET    | `/org/positions/:id`                 | `position:view`   |
| POST   | `/org/positions`                     | `position:manage` |
| PATCH  | `/org/positions/:id`                 | `position:manage` |
| GET    | `/org/positions/:id/job-description` | `position:view`   |
| PUT    | `/org/positions/:id/job-description` | `position:manage` |

**Business rules:**

- Unique constraint: `(departmentId, title)`.
- `headcountLimit` is enforced during recruitment submit (Section 5).
- `gradeId` is optional; when set, salary band validation kicks in on compensation changes.
- `isActive=false` blocks new hiring against this position.

## 4.4 JobGrade Module

**Endpoints:**

| Method | Path                  | Permission         |
| ------ | --------------------- | ------------------ |
| GET    | `/org/job-grades`     | `job_grade:view`   |
| POST   | `/org/job-grades`     | `job_grade:manage` |
| PATCH  | `/org/job-grades/:id` | `job_grade:manage` |

**Business rules:**

- `code` (e.g., `L1`, `L2`, `L3-MGR`) must be unique.
- `minSalary <= maxSalary` enforced.
- Modifying a band warns of in-band-violating employees (computed, not blocking).

## 4.5 Reference Data: Country & Holiday

**`/org/countries`:**

- Master list. `code` ISO 3166-1 alpha-3 (e.g., `ETH`).
- Used by `UserProfile.nationality`, `EmployeeAddress.country`, `Holiday.country`.

**`/org/holidays`:**

- `(name, date, countryId)` unique.
- `isRecurringAnnual=true` → matches same MM-DD every year.
- Used by `AttendanceCalendarService` for working-day calculations.

---

# 5. Subsystem 1 — Recruitment & Hiring

**Purpose:** Manage the complete pipeline from opening a role to the candidate accepting the offer.
**Forms covered (6):** Recruitment Request, Job Posting, Application, CV Screening, Interview Feedback, Hiring Decision & Offer.

## 5.1 End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        RECRUITMENT PIPELINE                          │
└──────────────────────────────────────────────────────────────────────┘

  [Dept Head]
       │
       ▼
  ┌─────────────────┐
  │ JobRequestForm  │  DRAFT
  └────────┬────────┘
           │ submit
           ▼
  ┌─────────────────┐
  │ JobRequestForm  │  PENDING_FOR_APPROVAL
  └────────┬────────┘
           │
           ▼
  ┌────────────────────────────────────────┐
  │   JobApprovalStep Chain                │
  │   • FINANCE   (level 1)                │
  │   • GM        (level 2)                │
  │   • HR_REVIEW (level 3)                │
  └────────┬───────────────────────────────┘
           │ all APPROVED
           ▼
  ┌─────────────────┐
  │ JobRequestForm  │  READY_TO_POST
  └────────┬────────┘
           │ HR creates Job posting
           ▼
  ┌─────────────────┐  ┌────────────────────────┐
  │      Job        │──│ JobApplicationForm     │
  │  • DRAFT        │  │   + custom fields/     │
  │  • PUBLISHED    │  │     sections           │
  │  • CLOSED       │  └────────────────────────┘
  └────────┬────────┘
           │ public link
           ▼
  ┌─────────────────┐
  │   Applicant     │  APPLIED
  └────────┬────────┘
           │ HR / system
           ▼
  ┌─────────────────┐
  │  CvScreening    │  PENDING → IN_PROGRESS → COMPLETED
  │  + multi-stage  │
  │    workflow     │
  └────────┬────────┘
           │ SHORTLISTED
           ▼
  ┌─────────────────────────────────────────┐
  │   InterviewSession (rounds 1..N)        │
  │   + InterviewParticipant                │
  │   + InterviewerAssignment               │
  │   + InterviewFeedback per (P,A)         │
  └────────┬────────────────────────────────┘
           │
           ▼
  ┌─────────────────┐
  │     Offer       │  DRAFT → SENT → ACCEPTED/DECLINED
  └────────┬────────┘
           │ ACCEPTED
           ▼
  ┌─────────────────────────────────────────┐
  │  Employee record created                │
  │  Onboarding row created                 │
  │  Applicant.status = HIRED               │
  │  Job.hiresCount++                       │
  └─────────────────────────────────────────┘
```

## 5.2 Form 1 — Recruitment Request

### Endpoints

| Method | Path                                                    | Permission                    |
| ------ | ------------------------------------------------------- | ----------------------------- |
| POST   | `/hr/recruitment/requests`                              | `recruitment_request:create`  |
| GET    | `/hr/recruitment/requests`                              | `recruitment_request:view`    |
| GET    | `/hr/recruitment/requests/:id`                          | `recruitment_request:view`    |
| PATCH  | `/hr/recruitment/requests/:id`                          | `recruitment_request:update`  |
| POST   | `/hr/recruitment/requests/:id/submit`                   | `recruitment_request:submit`  |
| POST   | `/hr/recruitment/requests/:id/cancel`                   | `recruitment_request:update`  |
| GET    | `/hr/recruitment/requests/:id/approvals`                | `recruitment_request:view`    |
| POST   | `/hr/recruitment/requests/:id/approvals/:stepId/decide` | `recruitment_request:approve` |

### Request DTO (Create)

```json
{
  "jobTitle": "Senior Backend Engineer",
  "departmentId": "uuid",
  "positionId": "uuid",
  "requestType": "NEW", // NEW | REPLACEMENT
  "replaceForUserId": null, // required if REPLACEMENT
  "businessJustification": "Expand backend...",
  "employmentType": "FULL_TIME", // FULL_TIME|PART_TIME|CONTRACT|INTERN|TEMPORARY
  "workMode": "HYBRID", // ON_SITE|HYBRID|REMOTE
  "urgency": "MEDIUM", // HIGH|MEDIUM|LOW
  "neededByDate": "2026-08-01",
  "priority": "MEDIUM", // HIGH|MEDIUM|LOW
  "proposedSalaryMin": 25000,
  "proposedSalaryMax": 35000,
  "currency": "ETB"
}
```

### State Machine

```
   DRAFT ──submit──► PENDING_FOR_APPROVAL ──all approvers approve──► READY_TO_POST
     │                       │                                            │
     │                       │ any approver rejects                       │
     │                       ▼                                            │
     │                   REJECTED                                          │
     │                                                                    │
     └─────cancel─────► (deleted)                                         │
                                                                          │
                                              HR creates Job ──► PUBLISHED
                                                                          │
                                              ─────────────────► CLOSED
```

### Business Rules (Create / Update)

1. `departmentId` must exist and be active.
2. `positionId` must exist, be active, and belong to `departmentId`.
3. If `requestType=REPLACEMENT`:
   - `replaceForUserId` is required.
   - The replaced employee must currently hold the requested position in the same department.
4. `neededByDate` must be ≥ today + 7 days (configurable in `ModuleConfig`).
5. **Only `DRAFT` requests can be updated.** Editing in any other status → `400 Bad Request`.
6. **Headcount check on submit:**
   - Count employees with `UserLifecycle.status IN (ONBOARDING, ACTIVE, SUSPENDED, ON_LEAVE)` matching `positionId`.
   - If count + open requests ≥ `position.headcountLimit`, reject submit with `422`.
7. Salary band: if `position.gradeId` is set, the `proposedSalaryMin/Max` must overlap the grade's `[minSalary, maxSalary]`.

### Approval Chain (Form 1 Sub-flow)

On submit:

1. Create `JobApprovalStep` rows in deterministic order:
   - Level 1: `FINANCE`
   - Level 2: `GM`
   - Level 3: `HR_REVIEW`
2. Notify the level-1 approver (Finance). Subsequent levels notify on prior approval.
3. Each step:
   - `PENDING_FOR_APPROVAL` (initial)
   - Approver can `APPROVED`, `REJECTED`, or `REQUEST_REVIEW` (sends back to requester).
   - `currentNote` stores the latest comment; `JobApprovalHistory` keeps the full audit trail.
4. When all steps `APPROVED` → set `JobRequestForm.status = READY_TO_POST` and `readyToPostAt = now`.
5. Any `REJECTED` → set `status = REJECTED` and `rejectedAt = now`. Notify the requester.

### Approval Decision DTO

```json
{
  "decision": "APPROVED", // APPROVED | REJECTED | REQUEST_REVIEW
  "note": "Budget confirmed"
}
```

### Identifiers

- Internal job request ID format: `REQ-<year>-NNNN` (e.g., `REQ-2026-0042`).
- Generated via DB sequence on insert.

### Edge Cases

- **Stale state:** if request was submitted, then HR edits while approval is in-flight → block edits (return `409`).
- **Approver leaves:** If `JobApprovalStep.approverId` becomes inactive, allow reassignment by `recruitment_request:approve` admin.
- **Replacement turns active:** if `replaceForUser` returns from leave/resignation withdrawal, mark request as conflicting; HR must manually decide.

## 5.3 Form 2 — Job Posting

A `JobRequestForm` becomes a `Job` when HR creates the posting after approval.

### Endpoints

| Method | Path                               | Permission            |
| ------ | ---------------------------------- | --------------------- |
| POST   | `/hr/recruitment/jobs`             | `job_posting:create`  |
| GET    | `/hr/recruitment/jobs`             | `job_posting:view`    |
| GET    | `/hr/recruitment/jobs/:id`         | `job_posting:view`    |
| PATCH  | `/hr/recruitment/jobs/:id`         | `job_posting:update`  |
| POST   | `/hr/recruitment/jobs/:id/publish` | `job_posting:publish` |
| POST   | `/hr/recruitment/jobs/:id/close`   | `job_posting:close`   |
| GET    | `/public/jobs`                     | (no auth — public)    |
| GET    | `/public/jobs/:slug`               | (no auth — public)    |

### Create DTO

```json
{
  "jobRequestFormId": "uuid",                  // required link to approved request
  "title": "Senior Backend Engineer",
  "slug": "senior-backend-engineer-2026-q3",
  "description": { "summary": "...", "responsibilities": [...] },
  "experienceLevel": "SENIOR",
  "contractType": "PERMANENT",
  "employmentType": "FULL_TIME",
  "workLocationType": "HYBRID",
  "city": "Addis Ababa",
  "country": "Ethiopia",
  "openings": 2,
  "salaryMin": 25000,
  "salaryMax": 35000,
  "currency": "ETB",
  "salaryMode": "NEGOTIABLE",
  "benefits": ["Transport", "Mobile"],
  "requiredSkills": ["TypeScript", "PostgreSQL"],
  "preferredSkills": ["Prisma", "Keycloak"],
  "responsibilities": ["Design APIs", "Mentor juniors"],
  "tools": ["Git", "VS Code"],
  "hiringManagerId": "uuid",
  "applicationDeadline": "2026-07-15"
}
```

### Business Rules

1. The `JobRequestForm` must be in `READY_TO_POST` status; one Job per request.
2. `slug` is unique site-wide; auto-generated from title + year-quarter if not provided.
3. HR-created job (where `creatorIsHr=true`) **can auto-approve** the request and skip approval if `ModuleConfig.recruitment.allowHrAutoApprove=true`.
4. Publishing requires `applicationDeadline > now`.
5. Closing requires a `closingReason`.
6. Counters (`viewsCount`, `applicationsCount`, etc.) update via DB triggers or service-layer increments.

### Application Form Sub-Schema

Each Job has a customizable `JobApplicationForm`:

```
JobApplicationForm
├── JobApplicationFormField (toggleable standard fields)
│     • FIRST_NAME, LAST_NAME, EMAIL, PHONE, RESUME_URL,
│       LINKEDIN_URL, PORTFOLIO_URL, GITHUB_URL,
│       CURRENT_COMPANY, YEARS_OF_EXPERIENCE,
│       EXPECTED_SALARY, COVER_LETTER
├── JobApplicationFormSection (optional sections)
│     • EDUCATION, EXPERIENCE
└── JobApplicationCustomField (per-job custom questions)
      ├── type: TEXT/TEXTAREA/NUMBER/SELECT/FILE/DATE/CHECKBOX
      └── JobApplicationCustomFieldOption[] (for SELECT)
```

### Endpoints (form builder)

| Method | Path                                                                  | Permission           |
| ------ | --------------------------------------------------------------------- | -------------------- |
| GET    | `/hr/recruitment/jobs/:jobId/application-form`                        | `job_posting:view`   |
| PUT    | `/hr/recruitment/jobs/:jobId/application-form`                        | `job_posting:update` |
| POST   | `/hr/recruitment/jobs/:jobId/application-form/custom-fields`          | `job_posting:update` |
| DELETE | `/hr/recruitment/jobs/:jobId/application-form/custom-fields/:fieldId` | `job_posting:update` |

## 5.4 Form 3 — Application (Public)

### Public Endpoint

`POST /public/jobs/:slug/apply` — open form, no auth.

### DTO (dynamic, based on form definition)

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com",
  "phone": "+251911234567",
  "resumeUrl": "https://storage.../jane-cv.pdf",
  "linkedinUrl": "...",
  "portfolioUrl": "...",
  "yearsExperience": 7,
  "expectedSalary": 30000,
  "coverLetter": "...",
  "source": "LINKEDIN",
  "referredByEmail": null,
  "educations": [
    {
      "institution": "AAU",
      "degree": "BSc",
      "field": "CS",
      "startDate": "2014-09-01",
      "endDate": "2018-07-31"
    }
  ],
  "experiences": [
    {
      "company": "Acme",
      "title": "Backend Eng",
      "startDate": "2020-01-01",
      "endDate": null,
      "description": "..."
    }
  ],
  "customFieldValues": { "<customFieldId>": "<value>" }
}
```

### Business Rules

1. Job must be `PUBLISHED` and `applicationDeadline >= now`.
2. Validate against `JobApplicationForm` definition — required fields, enabled-only, custom field types.
3. **Anti-duplicate:** `emailNormalized` (lowercase, trimmed) unique per `jobId`. Duplicate → `409 Conflict` with a "you've already applied" message.
4. `sourceSnapshot` captures HTTP referrer, IP, user-agent for analytics.
5. On successful application:
   - Create `Applicant` row with `status=APPLIED`.
   - Push `ApplicantStatusHistory` row.
   - `Job.applicationsCount++`.
   - Send email confirmation to applicant.
   - Notify HR (`IN_APP` + `EMAIL`).
6. **Spam protection:** rate-limit by IP and email at edge / WAF; honeypot fields in form recommended.

### Status Machine

```
APPLIED ──► SCREENING ──► SHORTLISTED ──► INTERVIEW ──► OFFER ──► HIRED
   │             │              │              │           │
   └──► REJECTED │   WAITLIST   │              │           │
                 │              │              │           │
                 └──► REJECTED  └──► REJECTED  └──► REJECTED

   ───► WITHDRAWN (any state, applicant-driven)
```

Every transition writes `ApplicantStatusHistory` with `changedById` and `notes`.

## 5.5 Form 4 — CV Screening

A multi-stage workflow with criteria, questions, and approval stages.

### Models

```
Job
├── CvScreeningCriteria (per job — what to score)
│     • category: SKILLS/EXPERIENCE/EDUCATION/CERTIFICATIONS/
│                 LANGUAGES/SOFT_SKILLS/TECHNICAL_SKILLS/
│                 DOMAIN_KNOWLEDGE/CUSTOM
│     • weight, required, scoringMethod
│     └── CvScreeningQuestion[] (specific questions)
│
├── CvScreeningWorkflow (multi-stage)
│     └── CvScreeningWorkflowStage[] (ordered)
│           • stageType: INITIAL_SCREENING/TECHNICAL_REVIEW/
│                       HR_REVIEW/MANAGER_REVIEW/FINAL_DECISION/CUSTOM
│           • requiredRole, approverId, autoApprove, autoApproveRules
│           • timeLimitHours
│
CvScreening (per Applicant per Job)
├── overallScore, recommendation
│     • STRONG_RECOMMEND / RECOMMEND / CONSIDER / REJECT
├── skillsMatch, experienceMatch, educationMatch
├── strengths[], weaknesses[], qualifications[], disqualifications[]
├── aiAssisted, aiConfidence
├── CvScreeningResponse[]  (per question)
└── CvScreeningDecision[]  (per stage)
```

### Endpoints

| Method | Path                                                    | Permission         |
| ------ | ------------------------------------------------------- | ------------------ |
| POST   | `/hr/recruitment/jobs/:jobId/screening-criteria`        | `applicant:screen` |
| GET    | `/hr/recruitment/jobs/:jobId/screening-criteria`        | `applicant:view`   |
| POST   | `/hr/recruitment/jobs/:jobId/screening-workflows`       | `applicant:screen` |
| POST   | `/hr/recruitment/applicants/:applicantId/screening`     | `applicant:screen` |
| GET    | `/hr/recruitment/applicants/:applicantId/screening`     | `applicant:view`   |
| POST   | `/hr/recruitment/screenings/:id/responses`              | `applicant:screen` |
| POST   | `/hr/recruitment/screenings/:id/stages/:stageId/decide` | `applicant:screen` |
| GET    | `/hr/recruitment/jobs/:jobId/screening-summary`         | `applicant:view`   |

### Business Rules

1. One `CvScreening` per `(applicantId, jobId)` — enforced by unique index.
2. `overallScore` is computed as weighted average of category scores (server-side):
   ```
   overallScore = Σ (categoryScore_i × weight_i) / Σ weight_i
   ```
3. Recommendation derived from `overallScore`:
   - `>= 4.5` → `STRONG_RECOMMEND`
   - `>= 3.5` → `RECOMMEND`
   - `>= 2.5` → `CONSIDER`
   - `< 2.5` → `REJECT`
4. Required criteria with score < `minValue` flip recommendation to `REJECT` regardless.
5. **AI assistance:** when `aiAssisted=true`, persist `aiConfidence` for explainability. AI scores are suggestions only; human approver still records `CvScreeningDecision`.
6. Each `CvScreeningWorkflowStage` decision must be made by a user matching `requiredRole` (or the `approverId` if pinned).
7. `timeLimitHours` triggers a cron-based reminder/escalation.
8. After final-stage `APPROVE` → set `Applicant.status = SHORTLISTED`.
9. Final-stage `REJECT` → set `Applicant.status = REJECTED`, send rejection email.
10. `ESCALATE` or `HOLD` decision flags a separate review queue.

### Edge Cases

- Re-scoring after a decision: only allowed before all stages decided.
- Stage skip: not allowed by default; introduce `skippable` flag if HR needs.
- Workflow change mid-screening: pin to the workflow snapshot at screening start.

## 5.6 Form 5 — Interview Session & Feedback

### Models

```
InterviewSession
├── job, type (HR_SCREENING/TECHNICAL/BEHAVIORAL/PANEL/FINAL)
├── round (1, 2, 3...)
├── status: SCHEDULED/COMPLETED/CANCELLED/NO_SHOW
├── scheduledAt, durationMinutes, location, meetingUrl
├── InterviewParticipant[] (applicants in session)
└── InterviewerAssignment[] (interviewers in session)
     └── InterviewFeedback[] (per participant × interviewer)
```

### Endpoints

| Method | Path                                                       | Permission           |
| ------ | ---------------------------------------------------------- | -------------------- |
| POST   | `/hr/recruitment/interviews`                               | `interview:schedule` |
| GET    | `/hr/recruitment/interviews`                               | `interview:view`     |
| GET    | `/hr/recruitment/interviews/:id`                           | `interview:view`     |
| PATCH  | `/hr/recruitment/interviews/:id`                           | `interview:schedule` |
| POST   | `/hr/recruitment/interviews/:id/cancel`                    | `interview:schedule` |
| POST   | `/hr/recruitment/interviews/:id/participants`              | `interview:schedule` |
| POST   | `/hr/recruitment/interviews/:id/interviewers`              | `interview:schedule` |
| POST   | `/hr/recruitment/interviews/:id/feedback`                  | `interview:feedback` |
| GET    | `/hr/recruitment/applicants/:applicantId/feedback-summary` | `interview:view`     |
| GET    | `/hr/recruitment/interview-questions`                      | `interview:view`     |
| POST   | `/hr/recruitment/interview-questions`                      | `interview:schedule` |

### Schedule DTO

```json
{
  "jobId": "uuid",
  "type": "TECHNICAL",
  "round": 2,
  "scheduledAt": "2026-06-10T14:00:00Z",
  "durationMinutes": 60,
  "location": "Office Room B / Google Meet",
  "meetingUrl": "https://meet.google.com/...",
  "participantApplicantIds": ["..."],
  "interviewers": [
    { "interviewerId": "user-uuid", "role": "Tech Lead" },
    { "interviewerId": "user-uuid", "role": "Engineering Manager" }
  ]
}
```

### Feedback DTO

```json
{
  "participantId": "uuid",
  "assignmentId": "uuid",
  "score": 4.2,
  "endorsement": "YES", // STRONG_YES|YES|UNCERTAIN|NO
  "strengths": ["Problem solving", "Clear communication"],
  "weaknesses": ["Limited team-lead experience"],
  "questionResponses": {
    "<questionId>": { "rating": 4, "notes": "..." }
  },
  "notes": "Strong candidate, recommend hiring.",
  "isDraft": false
}
```

### Business Rules

1. Unique `(sessionId, applicantId)` for participants — no duplicates.
2. Unique `(sessionId, interviewerId)` for assignments.
3. Feedback unique per `(participantId, assignmentId)`.
4. `isDraft=true` saves are private; only the interviewer sees it. `isDraft=false` finalizes (sets `submittedAt=now`) and contributes to aggregated scores.
5. Auto-aggregation: applicant's `profileScore` = average of all submitted final feedbacks across all rounds.
6. Cannot edit a finalized feedback; submit a corrective one with a manager override (separate audited endpoint, optional).
7. Cancelling a session marks all participants `attendanceStatus=CANCELLED`.
8. `NO_SHOW` for applicant: HR can mark, optionally auto-reschedule once.
9. **Notification rules:**
   - On schedule: notify applicant via email with `.ics` calendar attachment; notify interviewers in-app + email.
   - 24 hours before: reminder cron.
   - On feedback finalize: notify hiring manager.

### Question Library

`InterviewQuestion` provides a reusable question bank. Categories: `TECHNICAL`, `BEHAVIORAL`, `SITUATIONAL`, `PROBLEM_SOLVING`, `LEADERSHIP`, `COMMUNICATION`, `DOMAIN_KNOWLEDGE`, `CULTURAL_FIT`, `GENERAL`. Tagged and filterable.

## 5.7 Form 6 — Hiring Decision & Offer

### Endpoints

| Method | Path                                  | Permission       |
| ------ | ------------------------------------- | ---------------- |
| POST   | `/hr/recruitment/offers`              | `offer:create`   |
| GET    | `/hr/recruitment/offers`              | `offer:view`     |
| GET    | `/hr/recruitment/offers/:id`          | `offer:view`     |
| PATCH  | `/hr/recruitment/offers/:id`          | `offer:create`   |
| POST   | `/hr/recruitment/offers/:id/send`     | `offer:send`     |
| POST   | `/hr/recruitment/offers/:id/withdraw` | `offer:withdraw` |
| POST   | `/public/offers/:token/respond`       | (token-authed)   |

### Offer State Machine

```
   DRAFT ──send──► SENT ──candidate accepts──► ACCEPTED ──► (triggers Employee creation)
     │              │
     │              ├──candidate declines──► DECLINED
     │              │
     │              ├──HR withdraws──────► WITHDRAWN
     │              │
     │              └──deadline passes──► EXPIRED
     │
     └──HR deletes draft─► (deleted)
```

### Create DTO

```json
{
  "jobId": "uuid",
  "applicantId": "uuid",
  "salary": 32000,
  "currency": "ETB",
  "startDate": "2026-07-15",
  "payFrequency": "MONTHLY",
  "employmentType": "FULL_TIME",
  "bonus": 5000,
  "equity": null,
  "offerLetterUrl": "https://storage.../offer-jane.pdf",
  "notes": "Probation 60 days as per Ethiopian Labour Law.",
  "expiresAt": "2026-06-20T23:59:59Z"
}
```

### Business Rules

1. One offer per `(jobId, applicantId)`.
2. Applicant must be in `INTERVIEW` or `OFFER` status to create an offer.
3. **Salary band check:** if `Job.position.gradeId` exists, `salary` must be within `[grade.minSalary, grade.maxSalary]`.
4. **Finance approval gate** (if `ModuleConfig.recruitment.requireFinanceApprovalForOffers=true`): offer cannot be sent until a finance approver records approval (similar mini-flow to recruitment request).
5. **Send action:**
   - Generates a signed acceptance URL with HMAC token.
   - Emails offer letter + acceptance link to applicant.
   - Sets `sentAt=now`, `status=SENT`.
   - Updates `Applicant.status=OFFER`, `Applicant.offerAt=now`, `Job.offersCount++`.
6. **Acceptance flow (public, token-authed):**
   - Validate token & expiry.
   - Mark `Offer.status=ACCEPTED`, `respondedAt=now`.
   - **In a single transaction:**
     - Create `User` in Keycloak (admin API).
     - Create local `User` record (mapped to Keycloak ID).
     - Create `Employee` record with `applicantId` link.
     - Create `Onboarding` row (`status=IN_PROGRESS`).
     - Create `UserEmployment` (positionId, employmentType, hiredAt=startDate, probationEndAt=startDate+60d).
     - Create `UserCompensation` (baseSalary, currency, payFrequency).
     - Upsert `UserLifecycle` (`status=ONBOARDING`, `onboardedAt=null` until checklist done).
     - Set `Applicant.status=HIRED`, `hiredAt=now`.
     - Set `Job.hiresCount++`. If `hiresCount >= openings`, set `Job.status=CLOSED`, `closedAt=now`.
     - Set `JobRequestForm.status` (closed).
   - Outside the transaction:
     - Send welcome email with onboarding link.
     - Notify HR + hiring manager.
     - Trigger onboarding checklist generation (best-effort).
7. **Decline:** `respondedAt=now`, `status=DECLINED`. Notify HR. Allow them to re-engage with next-best applicant.

### Identifiers

- Offer reference: `OFR-<year>-NNNN`.

### Edge Cases

- **Keycloak user already exists:** match by email; either link or fail with `409`.
- **Onboarding creation fails:** retry queue; the hire is still valid.
- **Multiple offers per job:** allowed only if `openings > 1`; otherwise the first acceptance closes the job for others (return `409` to subsequent accepts).
- **Offer expiry:** daily cron flips `SENT` offers past `expiresAt` to `EXPIRED`.

## 5.8 Public Pages (Careers Site)

| Method | Path                                          | Description                                 |
| ------ | --------------------------------------------- | ------------------------------------------- |
| GET    | `/public/jobs?department=...&type=...`        | Public list of `PUBLISHED` jobs             |
| GET    | `/public/jobs/:slug`                          | Single job detail + application form schema |
| POST   | `/public/jobs/:slug/apply`                    | Submit application                          |
| GET    | `/public/jobs/:slug/track?email=...&code=...` | Applicant self-service status (optional)    |

---

# 6. Subsystem 2 — Onboarding & Probation

**Purpose:** Drive every new hire to "fully onboarded, confirmed employee" status with all data, assets, and policies in place.
**Forms covered (7):** Onboarding Checklist, New Hire Profile Creation, Asset & Access Provisioning, Policy Acknowledgement, Probation KPI Plan, Probation Evaluation, Probation Confirmation/Termination.

## 6.1 The Two Phases

```
┌──────────────────────────────────────────────────────────────────────┐
│   PHASE A: ONBOARDING   (Day -7 to Day 7 of employment)              │
│                                                                       │
│   • Profile data (personal, address, bank, emergency, education)      │
│   • Contract signature                                                │
│   • Policy acknowledgements                                           │
│   • IT/Admin asset provisioning                                       │
│   • Team introductions                                                │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────┐
│   PHASE B: PROBATION   (Day 0 to Day 60+ as per Ethiopian Labour Law)│
│                                                                       │
│   • KPI plan within first 3 days                                      │
│   • Day-30 mid-review                                                 │
│   • Day-55 evaluation                                                 │
│   • Day-60 final decision: CONFIRM / EXTEND / TERMINATE               │
└──────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                ┌─────────────────────────────┐
                │  Employee.status = ACTIVE   │
                │  Onboarding.status=COMPLETED│
                └─────────────────────────────┘
```

## 6.2 Onboarding Model

```
Onboarding (1:1 with Employee)
├── status: IN_PROGRESS / COMPLETED / CANCELLED
├── startedAt, completedAt
├── offer (back-ref to triggering Offer)
└── OnboardingChecklist[] (specific task instances)
      ├── taskInstanceId → OnboardingTaskInstance (snapshot)
      ├── status: TODO / SUBMITTED / CHANGES_REQUESTED / COMPLETED
      ├── isRequired, dueDate
      └── verifiedAt, verifiedBy, rejectionReason

OnboardingTask (the library — managed by HR)
└── taskType: NON_CUSTOM (system form) | CUSTOM (free-form)
└── targetDataModel: USER_PROFILE / EMPLOYEE_ADDRESS / EMPLOYEE_BANK_DETAIL /
                     EMPLOYEE_EMERGENCY_CONTACT / EMPLOYEE_EDUCATION /
                     EMPLOYEE_CONTRACT / EMPLOYEE_POLICY_ACKNOWLEDGEMENT
└── requiresHrVerification

OnboardingTaskInstance (snapshot when HR starts onboarding —
                       so editing the library later doesn't mutate history)
```

### Task Routing Logic

When the frontend renders a checklist item:

```
if (task.taskType == 'NON_CUSTOM' and task.targetDataModel == 'USER_PROFILE')
    → render Personal Information form
if (task.targetDataModel == 'EMPLOYEE_ADDRESS')
    → render Address form
if (task.taskType == 'CUSTOM')
    → render a free-form task card (mark as completed checkbox)
```

The targetDataModel-to-form mapping is also enforced server-side.

## 6.3 Onboarding Endpoints

| Method | Path                                                 | Permission                  |
| ------ | ---------------------------------------------------- | --------------------------- |
| POST   | `/hr/onboarding/start`                               | `onboarding:start`          |
| GET    | `/hr/onboarding/checklists`                          | `onboarding:view`           |
| GET    | `/hr/onboarding/checklists/:id`                      | `onboarding:view`           |
| GET    | `/hr/onboarding/employees/:employeeId`               | `onboarding:view`           |
| PATCH  | `/hr/onboarding/checklists/:id/tasks/:taskId/submit` | `onboarding:view` (self)    |
| POST   | `/hr/onboarding/checklists/:id/tasks/:taskId/verify` | `onboarding:verify`         |
| POST   | `/hr/onboarding/checklists/:id/tasks/:taskId/reject` | `onboarding:verify`         |
| POST   | `/hr/onboarding/:id/complete`                        | `onboarding:complete`       |
| GET    | `/hr/onboarding-tasks`                               | `onboarding:view` (library) |
| POST   | `/hr/onboarding-tasks`                               | `onboarding:manage_tasks`   |
| PATCH  | `/hr/onboarding-tasks/:id`                           | `onboarding:manage_tasks`   |

## 6.4 Form 7 — Onboarding Checklist (Generation)

`POST /hr/onboarding/start` — HR explicitly starts onboarding for a new hire.

### Request DTO

```json
{
  "employeeId": "uuid",
  "joinDate": "2026-07-15",
  "templateTaskIds": ["uuid1", "uuid2", "..."],
  "additionalCustomTasks": [
    { "title": "Meet your manager", "dueOffsetDays": 3 }
  ],
  "overseerId": "manager-user-uuid"
}
```

### Algorithm

```
function startOnboarding(employeeId, joinDate, templateTaskIds, customTasks):
    transaction:
        # 1. Create or reuse onboarding row
        onboarding = upsert Onboarding where employeeId=employeeId
                     set status=IN_PROGRESS, startedAt=now

        # 2. Snapshot each task from the library
        for taskId in templateTaskIds:
            libTask = OnboardingTask.findById(taskId)
            instance = OnboardingTaskInstance.create({
                title: libTask.title,
                description: libTask.description,
                taskType: libTask.taskType,
                targetDataModel: libTask.targetDataModel,
                requiresHrVerification: libTask.requiresHrVerification
            })
            OnboardingChecklist.create({
                onboardingId: onboarding.id,
                taskInstanceId: instance.id,
                dueDate: joinDate + libTask.dueOffsetDays,
                status: 'TODO',
                isRequired: true
            })

        for ct in customTasks:
            instance = OnboardingTaskInstance.create({
                title: ct.title,
                taskType: 'CUSTOM',
                requiresHrVerification: false
            })
            OnboardingChecklist.create({...})

    # 3. Outside transaction
    sendWelcomeEmail(employee, onboardingPortalLink)
    notifyDepartmentHead, notifyIT, notifyAdmin (channels: IN_APP+EMAIL)
```

### Checklist Status Transitions

```
TODO ──employee submits──► SUBMITTED ──HR verifies──► COMPLETED
  │                            │
  │                            └──HR requests changes──► CHANGES_REQUESTED
  │                                                          │
  │                                                          └──employee resubmits──► SUBMITTED
  │
  └──(no verification required, direct submit)──► COMPLETED
```

### Verification Logic

`POST /hr/onboarding/checklists/:id/tasks/:taskId/verify`:

```ts
if (task.requiresHrVerification) {
  // HR must inspect the linked data (e.g., UserProfile, EmployeeAddress) and decide
  task.status = COMPLETED;
  task.verifiedAt = now;
  task.verifiedBy = actorUserId;
  // Also flip the linked profile sub-entity's status to VERIFIED
  if (task.targetDataModel === 'USER_PROFILE') {
    UserProfile.update({ status: 'VERIFIED' });
  }
}
```

`reject` sets `status=CHANGES_REQUESTED` and stores `rejectionReason`. The corresponding sub-entity flips to `REJECTED` with `hrFeedback`.

### Completion Rule

`POST /hr/onboarding/:id/complete`:

- All `isRequired=true` checklist items must be `COMPLETED`.
- Sets `Onboarding.status=COMPLETED`, `completedAt=now`.
- Sets `Employee.employeeStatus=ON_PROBATION`.
- Sets `UserLifecycle.status=ACTIVE` (with probation flag in `UserEmployment.probationEndAt`).
- Triggers Probation Plan creation if not already present.

## 6.5 Form 8 — New Hire Profile Creation

Wraps multiple sub-entities. Each has its own form/task in the checklist, but the "New Hire Profile" concept is the aggregate. Each sub-entity follows the **PENDING_REVIEW → VERIFIED / REJECTED** pattern.

### Sub-Entities

| Sub-entity                                                  | Linked Form Task       | Endpoint Group                              |
| ----------------------------------------------------------- | ---------------------- | ------------------------------------------- |
| `UserProfile`                                               | Personal Information   | `/hr/employees/:id/profile`                 |
| `EmployeeAddress`                                           | Address                | `/hr/employees/:id/address`                 |
| `EmployeeBankDetail` + `BankAccount[]`                      | Bank Details           | `/hr/employees/:id/bank`                    |
| `EmployeeEmergencyContact` + `EmergencyContact[]`           | Emergency Contacts     | `/hr/employees/:id/emergency-contacts`      |
| `EmployeeEducation` + `Education[]`                         | Education              | `/hr/employees/:id/education`               |
| `EmployeeContract` + `Contract[]` + `ContractSigner[]`      | Contract Signing       | `/hr/employees/:id/contract`                |
| `EmployeePolicyAcknowledgement` + `PolicyAcknowledgement[]` | Policy Acknowledgement | `/hr/employees/:id/policy-acknowledgements` |

### Generic CRUD Pattern (per sub-entity)

| Method | Path                                | Who            | Permission                           |
| ------ | ----------------------------------- | -------------- | ------------------------------------ |
| GET    | `/hr/employees/:id/<entity>`        | Employee or HR | `employee:view`                      |
| POST   | `/hr/employees/:id/<entity>`        | Employee       | `employee:update` (self via context) |
| PUT    | `/hr/employees/:id/<entity>`        | Employee       | `employee:update`                    |
| POST   | `/hr/employees/:id/<entity>/verify` | HR             | `employee_document:verify`           |
| POST   | `/hr/employees/:id/<entity>/reject` | HR             | `employee_document:verify`           |

### Personal Info Required Fields

From `UserProfile`:

- `dateOfBirth` (must be ≥ 18 years before hire)
- `gender`, `nationalityId`, `maritalStatus`
- `additionalEmail`, `additionalEmailType`, `additionalPhone`, `additionalPhoneType`
- `passportSizePhotoURL`, `governmentIdCard`, `governmentIdCardType` (KEBELE_ID / PASSPORT / FAYDA / OTHER)
- `faydaNumber` (if applicable to Ethiopia)
- `avatarUrl`

Self-service submission → `status=PENDING_REVIEW`. HR verify → `VERIFIED`. HR reject → `REJECTED` with `hrFeedback`.

### Bank Detail Rules

- At least one `BankAccount` required; one must be `isPrimary=true`.
- `accountNumber` validated by bank-specific patterns (configurable in `ModuleConfig.banks`).
- Multiple accounts allowed (e.g., one for salary, one for allowances).

### Emergency Contact Rules

- At least one contact required.
- Exactly one must be `isFirstToCall=true` (server-enforces — if two are marked, last write wins and others flip to false).
- Phone format validated against country code.

### Education Rules

- All records require `institution`, `degree`, `fieldOfStudy`, `level`.
- `documentUrl` (certificate) recommended; HR can flag missing certs.
- `isCompleted=false` allowed for in-progress studies.

## 6.6 Form 9 — Asset & Access Provisioning

The schema doesn't have a dedicated `AssetProvisioning` table (it was referenced in the source HR doc as "may exist"). For this design, **introduce it** as a new model:

### Proposed Model (recommended addition)

```prisma
model AssetProvisioning {
  id              String                  @id @default(uuid()) @db.Uuid
  employeeId      String                  @db.Uuid
  employee        Employee                @relation(...)
  assetType       String                  // LAPTOP / PHONE / SIM_CARD / ACCESS_CARD / OTHER
  serialNumber    String?
  condition       String?                 // NEW / GOOD / FAIR / DAMAGED
  assignedAt      DateTime?
  returnedAt      DateTime?
  status          AssetProvisioningStatus @default(PENDING)
  // approvals:
  itApprovedById      String? @db.Uuid
  itApprovedAt        DateTime?
  adminApprovedById   String? @db.Uuid
  adminApprovedAt     DateTime?
  financeApprovedById String? @db.Uuid          // when cost > threshold
  financeApprovedAt   DateTime?
  estimatedCost   Decimal?                @db.Decimal(15, 2)
  notes           String?                 @db.Text
}
```

(Enum `AssetProvisioningStatus` already exists: `PENDING / APPROVED / PROVISIONED / REJECTED / COMPLETED`.)

### Endpoints

| Method | Path                                         | Permission              |
| ------ | -------------------------------------------- | ----------------------- |
| POST   | `/hr/asset-provisioning`                     | `onboarding:start`      |
| GET    | `/hr/asset-provisioning?employeeId=...`      | `onboarding:view`       |
| POST   | `/hr/asset-provisioning/:id/it-approve`      | `asset:approve_it`      |
| POST   | `/hr/asset-provisioning/:id/admin-approve`   | `asset:approve_admin`   |
| POST   | `/hr/asset-provisioning/:id/finance-approve` | `asset:approve_finance` |
| POST   | `/hr/asset-provisioning/:id/provision`       | `asset:provision`       |
| POST   | `/hr/asset-provisioning/:id/complete`        | `asset:provision`       |

### State Machine

```
PENDING ──IT approves──► APPROVED ──Admin signs off──► PROVISIONED ──Employee acknowledges──► COMPLETED
   │
   └──any approver rejects──► REJECTED
```

### Business Rules

1. If `estimatedCost > ASSET_FINANCE_APPROVAL_THRESHOLD` (env), Finance approval is required.
2. `serialNumber` must be unique across all `PROVISIONED` assets.
3. On `COMPLETED`, link the asset for offboarding (`AssetReturn` reuses serial).

### Access (System Permissions, Not a Physical Asset)

System access (Email, CRM, Projects, etc.) is granted via:

- Keycloak roles (handled outside this module for SSO apps).
- BLIH-internal RBAC role assignment (`UserRole`).

Both should be triggered as side-effects of an onboarding task `requiresHrVerification=true` with `targetDataModel=null` and a system-access checklist.

## 6.7 Form 10 — Policy Acknowledgement

### Flow

```
1. Active Policies fetched (Policy.isActive=true) with currentVersion
2. Employee sees list, clicks each, reviews content
3. For each, employee checks "I have read and understood"
4. Per-policy PolicyAcknowledgement row created with acknowledgedAt
5. Aggregate EmployeePolicyAcknowledgement flips to VERIFIED when all mandatory
   policies acknowledged
6. System access is contingent on full acknowledgement (configurable)
```

### Endpoints

| Method | Path                                                  | Permission               |
| ------ | ----------------------------------------------------- | ------------------------ |
| GET    | `/hr/policies/active`                                 | `policy:view`            |
| GET    | `/hr/policies/:id`                                    | `policy:view`            |
| POST   | `/hr/employees/:id/policy-acknowledgements/:policyId` | `employee:update` (self) |
| GET    | `/hr/employees/:id/policy-acknowledgements`           | `employee:view`          |

### Business Rules

1. Acknowledgement is **versioned**: `PolicyAcknowledgement.policyVersionId` pins to the specific version reviewed.
2. When a `Policy` rolls out a new version (new `PolicyVersion.isActive=true`), all employees get a re-acknowledgement task.
3. `Policy.dependencies[]` allows ordering — Code of Conduct first, etc.
4. Audit trail: every acknowledgement is a permanent record.

## 6.8 Form 11 — Probation KPI Plan

### Model

```
ProbationPlan (1:1 Employee)
├── startDate, endDate
├── status: NOT_STARTED / IN_PROGRESS / COMPLETED / CANCELLED / FAILED / EXTENDED
├── ProbationKPI[] — links KPI library entries to this probation
├── ProbationCheckpoint[] — Day-30, Day-55, Day-60-final
└── FinalEvaluation? — set when probation ends

KPI (library, reusable)
└── name, description

ProbationKPI (junction)
└── probationId, kpiId — unique pair

ProbationCheckpoint
├── name (e.g., "Day 30 Review")
├── checkpointDate
└── CheckpointEvaluation[] — usually one per checkpoint
       └── EvaluationScore[] — per ProbationKPI

EvaluationScore
├── probationKpiId
├── checkpointEvaluationId? (or finalEvaluationId?)
├── score (0-100)
└── comment

FinalEvaluation (1:1 with ProbationPlan)
├── totalScore (0-100)
├── outcome: CONFIRMED / EXTENDED / TERMINATED / RESIGNED
└── EvaluationScore[]
```

### Endpoints

| Method | Path                                        | Permission              |
| ------ | ------------------------------------------- | ----------------------- |
| POST   | `/hr/probation/plans`                       | `probation:create_plan` |
| GET    | `/hr/probation/plans/:id`                   | `probation:view`        |
| GET    | `/hr/probation/employees/:employeeId/plan`  | `probation:view`        |
| PATCH  | `/hr/probation/plans/:id`                   | `probation:create_plan` |
| POST   | `/hr/probation/plans/:id/kpis`              | `probation:create_plan` |
| GET    | `/hr/probation/plans/:id/checkpoints`       | `probation:view`        |
| POST   | `/hr/probation/plans/:id/checkpoints`       | `probation:create_plan` |
| POST   | `/hr/probation/checkpoints/:id/evaluations` | `probation:evaluate`    |
| POST   | `/hr/probation/plans/:id/final-evaluation`  | `probation:evaluate`    |
| POST   | `/hr/probation/plans/:id/confirm`           | `probation:confirm`     |

### Create Plan DTO

```json
{
  "employeeId": "uuid",
  "startDate": "2026-07-15",
  "endDate": "2026-09-13",
  "kpis": [
    { "kpiId": "uuid-of-existing-kpi", "weight": 30 },
    { "kpiId": "uuid", "weight": 30 },
    { "kpiId": "uuid", "weight": 40 }
  ],
  "checkpoints": [
    { "name": "Day 30 Review", "checkpointDate": "2026-08-15" },
    { "name": "Day 55 Review", "checkpointDate": "2026-09-08" }
  ],
  "trainingPlan": "List of trainings...",
  "mentorUserId": "uuid"
}
```

### Business Rules

1. Plan must be created within **3 days** of `Employee.startDate` (warning, not blocking).
2. Minimum **3 KPIs**, maximum **5**.
3. KPI weights must sum to **100**.
4. `endDate - startDate` = 60 days (Ethiopian Labour Law default). Configurable per employment type via `ModuleConfig.probation.durationDaysByType`.
5. Checkpoints typically at day 30 and 55; final evaluation slot is reserved.
6. Notifications scheduled:
   - Day 25: reminder to manager for Day-30 review.
   - Day 50: reminder for Day-55 review.
   - Day 58: HR escalation if final not yet recorded.

## 6.9 Form 12 — Probation Evaluation (Day 30 / Day 55)

Each checkpoint has one `CheckpointEvaluation` (per manager). Multiple if you want peer/skip-level — but the schema supports one-per-checkpoint by design.

### Checkpoint Evaluation DTO

```json
{
  "checkpointId": "uuid",
  "scores": [
    { "probationKpiId": "uuid", "score": 85, "comment": "Met target" },
    { "probationKpiId": "uuid", "score": 70, "comment": "Needs more practice" }
  ],
  "comment": "Strong start. Need to improve on time management.",
  "totalScore": 78.5,
  "behaviorRatings": {
    "attendance": 5,
    "teamwork": 4,
    "initiative": 4,
    "communication": 4,
    "overallConduct": 5
  }
}
```

### Business Rules

1. `totalScore` is server-recomputed as weighted average:
   ```
   totalScore = Σ (score_i × probationKpi.weight_i) / 100
   ```
2. Behavior ratings stored as JSON in `CheckpointEvaluation.comment` payload (or extend schema with a JSONB field; recommended addition).
3. Each `probationKpiId` can appear at most once per checkpoint (unique constraint exists).
4. Submitting evaluation triggers notification to HR.

## 6.10 Form 13 — Probation Confirmation / Termination

The Day-60 final decision. Creates `FinalEvaluation` and the corresponding outcome.

### Final Evaluation DTO

```json
{
  "scores": [...],                // per-KPI final scores
  "totalScore": 82,
  "outcome": "CONFIRMED",         // CONFIRMED | EXTENDED | TERMINATED | RESIGNED
  "comment": "Confirmed.",
  "extension": {                  // only if outcome = EXTENDED
    "newEndDate": "2026-10-13",
    "reason": "Additional time needed for client onboarding"
  },
  "terminationDetails": {         // only if outcome = TERMINATED
    "reasonCode": "PERFORMANCE_BELOW_THRESHOLD",
    "lastWorkingDay": "2026-09-20"
  }
}
```

### Business Rules & Side-Effects

| Outcome      | Side Effects                                                                                                                                                    |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `CONFIRMED`  | `Employee.employeeStatus=ACTIVE`, `UserEmployment.confirmedAt=now`, generate confirmation letter, send to employee, notify Finance to remove probation flag     |
| `EXTENDED`   | `ProbationPlan.status=EXTENDED`, set new `endDate`, create new checkpoints, notify employee                                                                     |
| `TERMINATED` | Trigger offboarding flow with `terminationType=TERMINATION`, auto-create `Resignation`-like record, `UserLifecycle.status=TERMINATED`, deactivate Keycloak user |
| `RESIGNED`   | (Employee resigned mid-probation) — trigger normal offboarding                                                                                                  |

### Authorization Chain

- Manager submits decision.
- HR reviews.
- For `TERMINATED` outcome, CEO/GM approval required.
- Audit log captures every step.

## 6.11 KPI Library

A reusable catalog of KPIs across probation, OKR, and performance reviews.

| Method | Path           | Permission   |
| ------ | -------------- | ------------ |
| GET    | `/hr/kpis`     | `kpi:view`   |
| POST   | `/hr/kpis`     | `kpi:manage` |
| PATCH  | `/hr/kpis/:id` | `kpi:manage` |
| DELETE | `/hr/kpis/:id` | `kpi:manage` |

---

# 7. Subsystem 3 — Employee Profiles & Records

**Purpose:** Maintain a single source of truth for every employee — identity, employment, compensation, documents, contracts, and lifecycle state.
**Forms covered (5):** Employee Profile, Job Description & KPI Upload, Contract Upload, Salary History Update, Employee Document Update.

## 7.1 Aggregate Model

```
                    ┌──────────────┐
                    │     User     │  (Keycloak-linked identity)
                    └──────┬───────┘
                           │ 1:1
                           ▼
                    ┌──────────────┐
                    │   Employee   │  (HR aggregate root)
                    └──────┬───────┘
                           │
       ┌───────────────────┼───────────────────────────────────┐
       ▼                   ▼                                   ▼
┌─────────────┐    ┌─────────────────┐               ┌──────────────────┐
│ UserProfile │    │ UserEmployment  │               │ UserCompensation │
│ (1:1)       │    │ (1:1, current)  │               │ (1:1, current)   │
└─────────────┘    └────────┬────────┘               └────────┬─────────┘
                            │ N                              │ N
                            ▼                                ▼
                  ┌─────────────────────┐         ┌──────────────────────┐
                  │ UserEmployment      │         │ UserCompensation     │
                  │ History (append)    │         │ History (append)     │
                  └─────────────────────┘         └──────────────────────┘

       ┌──────────────────────┐    ┌──────────────────────┐
       │ EmployeeAddress      │    │ EmployeeBankDetail   │ ──► BankAccount[]
       │ (1:1, verified)      │    │ (1:1, verified)      │
       └──────────────────────┘    └──────────────────────┘

       ┌──────────────────────┐    ┌──────────────────────┐
       │ EmployeeEducation    │    │ EmployeeEmergency    │ ──► EmergencyContact[]
       │ + Education[]        │    │ Contact (1:1)        │
       └──────────────────────┘    └──────────────────────┘

       ┌──────────────────────┐    ┌──────────────────────┐
       │ EmployeeContract     │ ─► │ Contract + Signers   │
       │ + Contracts[]        │    └──────────────────────┘
       └──────────────────────┘

       ┌──────────────────────┐
       │ UserLifecycle        │  ONBOARDING → ACTIVE → SUSPENDED → ON_LEAVE → ...
       │ (1:1, state machine) │
       └──────────────────────┘

       ┌──────────────────────┐    ┌──────────────────────┐
       │ EmployeeDocument[]   │    │ JobDescription       │ ─► Position
       │ (any DocumentType)   │    │ (versioned)          │
       └──────────────────────┘    └──────────────────────┘

       ┌──────────────────────┐
       │ CompensationComponent│ (allowance/bonus/deduction/benefit)
       └──────────────────────┘
```

## 7.2 Lifecycle State Machine

`UserLifecycle.status` — the operational truth of an employee's status:

```
                    ┌──────────────┐
                    │  ONBOARDING  │  (from hire to checklist completion)
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    ACTIVE    │ ◄──────────────┐
                    └──┬───────────┘                │
                       │                            │
            ┌──────────┼────────────┐               │ (return)
            ▼          ▼            ▼               │
    ┌─────────────┐ ┌──────────┐ ┌──────────┐       │
    │  SUSPENDED  │ │ ON_LEAVE │ │   ...    │ ──────┘
    └──────┬──────┘ └──────────┘ └──────────┘
           │
           ▼
    ┌─────────────┐
    │ TERMINATED  │      (involuntary exit, includes probation termination)
    │   RESIGNED  │      (voluntary exit)
    │   RETIRED   │      (retirement)
    └─────────────┘
```

Transitions captured via `UserLifecycle` updates; significant ones audited.

## 7.3 Form 14 — Employee Profile (Core)

### Read Endpoints

| Method | Path                     | Permission                |
| ------ | ------------------------ | ------------------------- |
| GET    | `/hr/employees`          | `employee:view`           |
| GET    | `/hr/employees/:id`      | `employee:view`           |
| GET    | `/hr/employees/:id/full` | `employee:view`           |
| GET    | `/hr/employees/me`       | (any authenticated, self) |

### Filters on List

```
?departmentId=...
&positionId=...
&status=ACTIVE,ON_PROBATION
&lifecycleStatus=ACTIVE
&search=jane                  (matches firstName, lastName, email, employeeCode)
&hiredAfter=2025-01-01
&hiredBefore=2025-12-31
&hasPendingTasks=true         (computed)
&page=1&pageSize=20
&sort=lastName:asc
```

### Update Endpoints (Section-Scoped)

| Method | Path                                   | Permission            |
| ------ | -------------------------------------- | --------------------- |
| PUT    | `/hr/employees/:id/profile`            | `employee:update`     |
| PUT    | `/hr/employees/:id/address`            | `employee:update`     |
| PUT    | `/hr/employees/:id/bank`               | `employee:update`     |
| PUT    | `/hr/employees/:id/emergency-contacts` | `employee:update`     |
| PUT    | `/hr/employees/:id/education`          | `employee:update`     |
| PUT    | `/hr/employees/:id/employment`         | `employee:update`     |
| PUT    | `/hr/employees/:id/compensation`       | `compensation:update` |
| PUT    | `/hr/employees/:id/lifecycle`          | `employee:update`     |

### Employment Update DTO

```json
{
  "positionId": "uuid",
  "employmentType": "FULL_TIME",
  "managerEmploymentId": "uuid",
  "employeeCode": "BLIH-EMP-0042",
  "changeReason": "Promoted to senior role"
}
```

### Employment Update Algorithm

```
function updateEmployment(employeeId, dto, changedById):
    transaction:
        current = UserEmployment.findUnique({ employeeId })

        # Validations
        if dto.employeeCode and dto.employeeCode != current.employeeCode:
            assert unique across all employments

        if dto.positionId:
            pos = Position.findById(dto.positionId)
            assert pos exists and pos.isActive

        if dto.managerEmploymentId:
            assert manager exists
            assert manager.employeeId != employeeId            # no self-manager
            assert not creates manager cycle                   # recursive check

        # Close current history row
        UserEmploymentHistory.update(
            where { userEmploymentId: current.id, effectiveTo: null }
            data { effectiveTo: now }
        )

        # Create new history row
        UserEmploymentHistory.create({
            userEmploymentId: current.id,
            departmentId: pos?.departmentId ?? current....departmentId,
            positionId: dto.positionId,
            employmentType: dto.employmentType,
            managerEmploymentId: dto.managerEmploymentId,
            effectiveFrom: now,
            changeReason: dto.changeReason,
            changedById
        })

        # Update current row
        UserEmployment.update({ where: { id: current.id }, data: dto })
```

### Compensation Update DTO

```json
{
  "baseSalary": 35000,
  "currency": "ETB",
  "payFrequency": "MONTHLY",
  "bonusEligible": true,
  "bonusRate": 10.0,
  "effectiveFrom": "2026-08-01",
  "changeReason": "Annual merit increase"
}
```

### Compensation Algorithm

```
function updateCompensation(employeeId, dto, changedById):
    transaction:
        emp = Employee.findById(employeeId)
        current = UserCompensation.findUnique({ employeeId })

        # Validate salary band
        pos = UserEmployment.findById(...).position
        if pos.gradeId:
            grade = JobGrade.findById(pos.gradeId)
            if grade.minSalary and dto.baseSalary < grade.minSalary:
                throw 422 "Below grade min"
            if grade.maxSalary and dto.baseSalary > grade.maxSalary:
                throw 422 "Above grade max"

        # Validate no overlapping history windows
        overlapping = UserCompensationHistory.find({
            employeeId,
            validFrom: { lte: dto.effectiveFrom },
            OR: [{ validTo: null }, { validTo: { gte: dto.effectiveFrom } }]
        })
        if overlapping: assert validTo = effectiveFrom - 1 day

        # Close current open history row
        UserCompensationHistory.update(
            where { employeeId, validTo: null }
            data { validTo: dto.effectiveFrom }
        )

        # Insert new history
        UserCompensationHistory.create({
            employeeId,
            baseSalary, currency, payFrequency,
            bonusEligible, bonusRate,
            validFrom: dto.effectiveFrom,
            validTo: null,
            changeReason: dto.changeReason,
            changedById
        })

        # Update current
        UserCompensation.update({ where: { id: current.id }, data: dto })

        # Side effects
        notify Finance (webhook for payroll system sync)
```

### Compensation Components

`CompensationComponent` — allowances, bonuses, deductions, benefits per employee.

| Method | Path                                                     | Permission            |
| ------ | -------------------------------------------------------- | --------------------- |
| GET    | `/hr/employees/:id/compensation/components`              | `compensation:view`   |
| POST   | `/hr/employees/:id/compensation/components`              | `compensation:update` |
| PUT    | `/hr/employees/:id/compensation/components/:componentId` | `compensation:update` |
| DELETE | `/hr/employees/:id/compensation/components/:componentId` | `compensation:update` |

DTO:

```json
{
  "name": "Transport Allowance",
  "type": "ALLOWANCE", // ALLOWANCE | BONUS | DEDUCTION | BENEFIT
  "amount": 2000,
  "isRecurring": true,
  "effectiveFrom": "2026-08-01",
  "effectiveTo": null
}
```

## 7.4 Form 15 — Job Description & KPI Upload

`JobDescription` is versioned per `Position`.

### Endpoints

| Method | Path                                                | Permission               |
| ------ | --------------------------------------------------- | ------------------------ |
| GET    | `/hr/job-descriptions`                              | `job_description:view`   |
| GET    | `/hr/job-descriptions/:id`                          | `job_description:view`   |
| POST   | `/hr/job-descriptions`                              | `job_description:manage` |
| PATCH  | `/hr/job-descriptions/:id`                          | `job_description:manage` |
| GET    | `/hr/positions/:positionId/job-description/current` | `job_description:view`   |
| POST   | `/hr/positions/:positionId/job-description/publish` | `job_description:manage` |

### Create DTO

```json
{
  "positionId": "uuid",
  "title": "Senior Backend Engineer",
  "level": "Senior",
  "code": "JD-ENG-BE-SR-001",
  "summary": "Build and maintain core APIs...",
  "duties": ["Design RESTful APIs", "Mentor junior engineers", "..."],
  "skills": {
    "required": [{ "name": "TypeScript", "level": "ADVANCED" }],
    "preferred": [{ "name": "Prisma", "level": "INTERMEDIATE" }]
  },
  "kpis": [
    {
      "title": "API Uptime",
      "metric": "Monthly uptime %",
      "target": "99.9",
      "frequency": "MONTHLY",
      "weight": 30
    },
    {
      "title": "Code Review Throughput",
      "metric": "PRs reviewed",
      "target": "20",
      "frequency": "WEEKLY",
      "weight": 20
    }
  ],
  "documentUrl": "https://storage.../jd.pdf",
  "effectiveFrom": "2026-08-01"
}
```

### Versioning Rules

1. Each save creates a new `JobDescription` row with auto-incremented `version`.
2. "Current" JD for a position is the row with latest `effectiveFrom <= today`.
3. Linking to OKR system: KPIs in the JD seed personal OKR templates.

## 7.5 Form 16 — Contract Upload

`EmployeeContract` (1:1) is the gateway aggregate per employee. It contains many `Contract` rows (initial, renewals, addendums).

### Endpoints

| Method | Path                                           | Permission        |
| ------ | ---------------------------------------------- | ----------------- |
| GET    | `/hr/employees/:id/contracts`                  | `employee:view`   |
| POST   | `/hr/employees/:id/contracts`                  | `contract:manage` |
| GET    | `/hr/employees/:id/contracts/:contractId`      | `employee:view`   |
| POST   | `/hr/employees/:id/contracts/:contractId/sign` | `contract:sign`   |
| GET    | `/hr/contract-templates`                       | `contract:view`   |
| POST   | `/hr/contract-templates`                       | `contract:manage` |

### Models

```
ContractType (e.g., "Permanent", "NDA", "Internship")
└── ContractTemplate[] (with fileUrl blank template)
        └── Contract[] (per-employee instance)
                ├── signedFileUrl
                └── ContractSigner[] (per role: CEO, HR Director, Witness, Employee)
```

### Create Contract DTO

```json
{
  "templateId": "uuid",
  "signers": [
    { "userId": "ceo-uuid", "roleInContract": "CEO" },
    { "userId": "hr-uuid", "roleInContract": "HR Director" },
    { "userId": "emp-uuid", "roleInContract": "Employee" }
  ]
}
```

### Business Rules

1. Each signer is a unique `(contractId, userId)`.
2. `Contract.signedFileUrl` is populated only after **all** signers have `hasSigned=true`.
3. `signers[].signedAt` recorded when each signs.
4. Notification: when a signer's turn comes (configurable: parallel or sequential).
5. Contract expiry tracked by referencing `effectiveTo` (add field — recommended).
6. Cron: 30/60/90 days before expiry, notify HR + employee.

## 7.6 Form 17 — Salary History Update

This is **already covered** by `UserCompensation` + `UserCompensationHistory` (see §7.3). The "Salary History Update Form" is a UI projection of those endpoints with explicit `reason` field.

### Promotion / Adjustment Reasons

Captured in `UserCompensationHistory.changeReason` or via `SalaryAdjustmentRequest` (see §9 — Career Development).

## 7.7 Form 18 — Employee Document Update

Generic document store: ID renewals, certifications, medical, academic, portfolio.

### Endpoints

| Method | Path                                        | Permission                 |
| ------ | ------------------------------------------- | -------------------------- |
| GET    | `/hr/employees/:id/documents`               | `employee_document:view`   |
| GET    | `/hr/employees/:id/documents/:docId`        | `employee_document:view`   |
| POST   | `/hr/employees/:id/documents`               | `employee_document:upload` |
| PATCH  | `/hr/employees/:id/documents/:docId`        | `employee_document:upload` |
| DELETE | `/hr/employees/:id/documents/:docId`        | `employee_document:delete` |
| POST   | `/hr/employees/:id/documents/:docId/verify` | `employee_document:verify` |
| GET    | `/hr/documents/expiring?days=30`            | `employee_document:view`   |

### Upload DTO

```json
{
  "type": "ID", // CONTRACT | ID | CERTIFICATE | MEDICAL | RESUME | POLICY_ACK | QUALIFICATION | OTHER
  "typeOther": null, // free text when type=OTHER
  "fileUrl": "https://storage.../jane-id-renewed.pdf",
  "fileName": "jane-id-renewed.pdf",
  "fileSizeBytes": 245678,
  "mimeType": "application/pdf",
  "issueDate": "2026-05-15",
  "expiryDate": "2031-05-14",
  "isMandatory": true
}
```

### Business Rules

1. Upload sets `verified=false`. HR triggers `/verify`.
2. Mandatory documents (e.g., ID, contract) are tracked for completeness scoring.
3. Documents with `expiryDate` trigger reminders via `DocumentExpiryJob` (cron daily 09:00).
4. Versioning: replacing a document keeps old row (audit), creates new row. Add an `archivedAt` field (recommended) to softly retire.

## 7.8 Employee Status Snapshot

`Employee.employeeStatus` enum (`ONBOARDING / ON_PROBATION / ACTIVE`) is the high-level view; the detailed state is in `UserLifecycle.status`. Reconciled by:

| When                           | Action                                                                  |
| ------------------------------ | ----------------------------------------------------------------------- |
| Hiring offer accepted          | `Employee.employeeStatus=ONBOARDING`, `UserLifecycle.status=ONBOARDING` |
| Onboarding checklist completed | `Employee.employeeStatus=ON_PROBATION`, `UserLifecycle.status=ACTIVE`   |
| Probation `CONFIRMED`          | `Employee.employeeStatus=ACTIVE`                                        |
| Probation `TERMINATED`         | `UserLifecycle.status=TERMINATED`                                       |
| Offboarding completed          | `UserLifecycle.status=RESIGNED/TERMINATED/RETIRED`                      |

---
