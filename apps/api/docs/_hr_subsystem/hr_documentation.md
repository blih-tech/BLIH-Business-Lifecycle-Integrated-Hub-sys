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

# 8. Subsystem 4 — Attendance, Leave & Time Management

**Purpose:** Track who works when, who's off, and ensure compliance with schedules and labour law.
**Forms covered (6):** Leave Request, Punctuality Log/Exception, Timesheet, Attendance Correction, Overtime Request, Work-from-Home / Flex.

## 8.1 Subsystem Architecture

```
              ┌──────────────────────┐
              │   WorkSchedule       │   (named schedule, e.g., "Standard Mon-Fri")
              │   + WorkScheduleDay  │
              └──────────┬───────────┘
                         │
                         ▼
              ┌──────────────────────┐
              │  UserWorkSchedule    │   (effective-dated per employee)
              └──────────┬───────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │   AttendanceCalendarService            │
        │   • resolves working day, hours        │
        │   • applies Holiday + Leave            │
        └────────┬───────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────────────────┐
│   AttendanceLog  (one per employee per date)                 │
│   • checkInAt, checkOutAt, totalMinutes                      │
│   • status: PRESENT/ABSENT/LATE/EARLY_DEPARTURE/             │
│             ON_LEAVE/HALF_DAY/REMOTE/BUSINESS_TRIP           │
│   • isAutoCalculated, overtimeMinutes                        │
└──────────────────────────────────────────────────────────────┘
                 │
                 ▼
        ┌───────────────────────────┐
        │ AttendanceReconciliation  │  (cron 00:15 daily)
        │ Service                   │
        └───────────────────────────┘
```

## 8.2 Work Schedule Module

### Endpoints

| Method | Path                                   | Permission                   |
| ------ | -------------------------------------- | ---------------------------- |
| GET    | `/hr/attendance/schedules`             | `attendance:view`            |
| POST   | `/hr/attendance/schedules`             | `attendance:manage_schedule` |
| GET    | `/hr/attendance/schedules/:id`         | `attendance:view`            |
| PATCH  | `/hr/attendance/schedules/:id`         | `attendance:manage_schedule` |
| POST   | `/hr/attendance/schedules/:id/days`    | `attendance:manage_schedule` |
| GET    | `/hr/attendance/schedules/assignments` | `attendance:view`            |
| POST   | `/hr/attendance/schedules/assignments` | `attendance:manage_schedule` |

### Schedule DTO

```json
{
  "name": "Standard Mon-Fri 9-5",
  "description": "Default office schedule, Addis Ababa",
  "timezone": "Africa/Addis_Ababa",
  "isDefault": true,
  "lateThresholdMinutes": 15,
  "standardMinutesPerDay": 480,
  "days": [
    {
      "dayOfWeek": "MONDAY",
      "isWorkingDay": true,
      "startMinute": 540,
      "endMinute": 1020,
      "expectedMinutes": 480,
      "remoteAllowed": false
    },
    {
      "dayOfWeek": "TUESDAY",
      "isWorkingDay": true,
      "startMinute": 540,
      "endMinute": 1020,
      "expectedMinutes": 480,
      "remoteAllowed": false
    },
    {
      "dayOfWeek": "WEDNESDAY",
      "isWorkingDay": true,
      "startMinute": 540,
      "endMinute": 1020,
      "expectedMinutes": 480,
      "remoteAllowed": true
    },
    {
      "dayOfWeek": "THURSDAY",
      "isWorkingDay": true,
      "startMinute": 540,
      "endMinute": 1020,
      "expectedMinutes": 480,
      "remoteAllowed": false
    },
    {
      "dayOfWeek": "FRIDAY",
      "isWorkingDay": true,
      "startMinute": 540,
      "endMinute": 1020,
      "expectedMinutes": 480,
      "remoteAllowed": true
    },
    { "dayOfWeek": "SATURDAY", "isWorkingDay": false },
    { "dayOfWeek": "SUNDAY", "isWorkingDay": false }
  ]
}
```

`startMinute=540` = 540 minutes after midnight = 09:00.

### Resolution Algorithm

```
function resolveScheduleFor(employeeId, date):
    # 1. effective-dated user assignment
    uws = UserWorkSchedule.find({
        employeeId,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }]
    })
    if uws: return WorkSchedule.findById(uws.scheduleId)

    # 2. default schedule
    def = WorkSchedule.findFirst({ isDefault: true })
    if def: return def

    # 3. built-in fallback: Mon-Fri 09:00-17:00, 15min late threshold
    return BUILTIN_DEFAULT_SCHEDULE
```

## 8.3 Form 19 — Leave Request

### Endpoints

| Method | Path                                 | Permission                                |
| ------ | ------------------------------------ | ----------------------------------------- |
| GET    | `/hr/leave/requests`                 | `leave:view`                              |
| GET    | `/hr/leave/requests/:id`             | `leave:view`                              |
| POST   | `/hr/leave/requests`                 | `leave:request`                           |
| PATCH  | `/hr/leave/requests/:id`             | `leave:request` (only DRAFT)              |
| POST   | `/hr/leave/requests/:id/submit`      | `leave:request`                           |
| POST   | `/hr/leave/requests/:id/approve`     | `leave:approve`                           |
| POST   | `/hr/leave/requests/:id/reject`      | `leave:approve`                           |
| POST   | `/hr/leave/requests/:id/cancel`      | `leave:request` (self) or `leave:approve` |
| GET    | `/hr/leave/balance?leaveType=ANNUAL` | `leave:view` (self)                       |
| GET    | `/hr/leave/balance/:employeeId`      | `leave:view`                              |

### Request Create DTO

```json
{
  "leaveType": "ANNUAL", // ANNUAL/SICK/MATERNITY/PATERNITY/
  //  BEREAVEMENT/UNPAID/STUDY/EMERGENCY/COMPASSIONATE
  "startDate": "2026-08-10",
  "endDate": "2026-08-14",
  "daysRequested": 5, // server-recomputes; must match
  "startHalfDay": false,
  "endHalfDay": false,
  "reason": "Family vacation",
  "contactDuringLeave": {
    "phone": "+251911...",
    "email": "..."
  },
  "handoverDelegateId": "user-uuid",
  "handoverNotes": "Daily standup → delegate. Inbox → email rules.",
  "submit": true // shortcut: create + submit in one call
}
```

### State Machine

```
DRAFT ──submit──► PENDING ──approve──► APPROVED
   │                  │
   │                  └──reject──► REJECTED
   │
   └──cancel──► CANCELLED

PENDING ──cancel (by employee, if not yet approved)──► CANCELLED
```

### Algorithm — Create with Submit

```
function createLeave(dto, employeeId):
    transaction:
        # Lifecycle gate
        emp = Employee.findById(employeeId)
        if emp.lifecycle.status in [TERMINATED, RESIGNED, RETIRED]:
            throw 422 "Employee not active"

        # Date validation
        assert dto.startDate <= dto.endDate
        assert dto.startDate.year == dto.endDate.year       # no cross-year

        # Half-day rule
        if dto.startDate == dto.endDate:
            assert not (dto.startHalfDay and dto.endHalfDay)

        # Compute working days
        schedule = AttendanceCalendarService.resolveScheduleFor(employeeId, dto.startDate)
        workingDays = countWorkingDays(dto.startDate, dto.endDate, schedule, country)
        if dto.startHalfDay: workingDays -= 0.5
        if dto.endHalfDay: workingDays -= 0.5

        # Client must match server computation
        assert dto.daysRequested == workingDays

        # Delegate rule
        if workingDays >= 5:
            assert dto.handoverDelegateId
        if dto.handoverDelegateId:
            assert dto.handoverDelegateId != currentUser.id
            assert User.exists(dto.handoverDelegateId)

        # Overlap check
        overlapping = LeaveRequest.find({
            employeeId,
            status: { in: ['PENDING', 'APPROVED'] },
            startDate: { lte: dto.endDate },
            endDate: { gte: dto.startDate }
        })
        if overlapping: throw 409 "Overlaps with existing request"

        # Balance
        balance = LeaveBalance.findUnique({ employeeId, leaveType, year })
        if balance is null:
            balance = LeaveBalance.create({
                employeeId, leaveType,
                year: dto.startDate.year,
                totalDays: defaultEntitlement(leaveType, employmentType)
            })

        # Availability check (skipped for UNPAID)
        if dto.leaveType != 'UNPAID':
            available = balance.totalDays + balance.carriedOver
                       - balance.usedDays - balance.pendingDays
            assert available >= workingDays

        # Create request
        request = LeaveRequest.create({
            requestId: generateId('LV', year),
            employeeId, leaveType,
            startDate, endDate, daysRequested: workingDays,
            startHalfDay, endHalfDay,
            reason, contactDuringLeave,
            handoverDelegateId, handoverNotes,
            balanceSnapshot: { totalDays, usedDays, pendingDays, carriedOver },
            status: dto.submit ? 'PENDING' : 'DRAFT',
            submittedAt: dto.submit ? now : null
        })

        # Reserve balance if submitting
        if dto.submit:
            balance.pendingDays += workingDays
            LeaveBalance.update(...)
            # Pick approver (employee.manager)
            LeaveApproval.create({
                leaveRequestId: request.id,
                approverId: manager.userId,
                level: 1,
                decision: 'PENDING'
            })
            notify manager (IN_APP + EMAIL)

        return request
```

### Approve Algorithm

```
function approveLeave(requestId, approverUserId):
    transaction:
        req = LeaveRequest.findById(requestId)
        assert req.status == 'PENDING'

        balance = LeaveBalance.findUnique({ employeeId: req.employeeId, ... })

        # Move from pending to used (skip for UNPAID)
        if req.leaveType != 'UNPAID':
            balance.pendingDays -= req.daysRequested
            balance.usedDays += req.daysRequested
            LeaveBalance.update(...)

        LeaveApproval.update({
            where: { leaveRequestId: requestId, level: 1 },
            data: { decision: 'APPROVED', decidedAt: now, approverId: approverUserId, comments: dto.comments }
        })

        LeaveRequest.update({
            status: 'APPROVED',
            approvedAt: now,
            approvedById: approverUserId
        })

        # Update attendance for each day in range
        for date in range(startDate, endDate):
            AttendanceLog.upsert({
                where { employeeId_date },
                update { status: 'ON_LEAVE', isAutoCalculated: true },
                create { employeeId, date, status: 'ON_LEAVE', isAutoCalculated: true }
            })

    notify employee (IN_APP + EMAIL)
```

### Reject Algorithm

```
function rejectLeave(requestId, approverUserId, reason):
    transaction:
        req = LeaveRequest.findById(requestId)
        assert req.status == 'PENDING'

        # Return reserved balance
        if req.leaveType != 'UNPAID':
            balance.pendingDays -= req.daysRequested
            LeaveBalance.update(...)

        LeaveApproval.create({ ..., decision: 'REJECTED', ... })
        LeaveRequest.update({ status: 'REJECTED', rejectionReason: reason })

    notify employee
```

### Leave Balance Defaults (Ethiopian Labour Law-aware)

| Leave Type      | Default Days/Year                                  | Notes                                                   |
| --------------- | -------------------------------------------------- | ------------------------------------------------------- |
| `ANNUAL`        | 14 (years 1-3), 16 (year 4), then +1 every 2 years | Per Article 76, Ethiopian Labour Proclamation 1156/2019 |
| `SICK`          | 6 months max with reducing pay scale               | Per Article 86                                          |
| `MATERNITY`     | 120 days (30 pre + 90 post-natal)                  | Per Article 88                                          |
| `PATERNITY`     | 3 days                                             | Per Article 81(3)                                       |
| `BEREAVEMENT`   | 3 days                                             | Per Article 81                                          |
| `EMERGENCY`     | 5 days                                             |                                                         |
| `STUDY`         | configured per policy                              |                                                         |
| `COMPASSIONATE` | configured per policy                              |                                                         |
| `UNPAID`        | unlimited (skips balance)                          |                                                         |

These defaults are seedable via `ModuleConfig.leave.defaultEntitlements` and overridable per employment type.

### Identifiers

- `requestId`: `LV-<year>-NNNN`.

## 8.4 Form 20 — Punctuality Log / Exception

This maps to either:

- A normal `AttendanceLog` entry where the system already detected `LATE` or `EARLY_DEPARTURE`, OR
- An `AttendanceCorrectionRequest` (Form 22) when the employee wants to dispute or annotate.

Many systems use this for **manual log entry** by HR if hardware/software didn't capture.

### Endpoints (covered by AttendanceLog)

| Method | Path                       | Permission                         |
| ------ | -------------------------- | ---------------------------------- |
| GET    | `/hr/attendance/logs`      | `attendance:view`                  |
| POST   | `/hr/attendance/logs`      | `attendance:log` (HR manual entry) |
| GET    | `/hr/attendance/logs/:id`  | `attendance:view`                  |
| POST   | `/hr/attendance/check-in`  | (self, `attendance:log`)           |
| POST   | `/hr/attendance/check-out` | (self, `attendance:log`)           |

### Check-In/Out DTO

```json
{
  "method": "WEB", // WEB | BIOMETRIC | NFC | MOBILE_APP | HR_MANUAL
  "location": { "lat": 9.005, "lng": 38.763 },
  "ip": "10.0.0.42",
  "notes": "Working from home, network issue earlier"
}
```

### Auto-Calculation

`AttendanceReconciliationService` runs daily and on each upsert. Status rules:

```
if approvedLeave covers date:
    status = ON_LEAVE
elif date is not a working day for this employee:
    if any punches: keep PRESENT/REMOTE based on schedule.remoteAllowed
    else: no log written (or status=ABSENT skipped)
elif date is working day and no punches:
    status = ABSENT
elif worked minutes < (expectedMinutes / 2):
    status = HALF_DAY
elif checkInAt > scheduleStart + lateThresholdMinutes:
    status = LATE
elif checkOutAt < scheduleEnd - lateThresholdMinutes:
    status = EARLY_DEPARTURE
else:
    status = PRESENT
overtimeMinutes = max(0, totalMinutes - expectedMinutes)
```

`isAutoCalculated=true` flag protects from cron overwriting manual edits.

## 8.5 Form 21 — Weekly Timesheet

### Endpoints

| Method | Path                             | Permission          |
| ------ | -------------------------------- | ------------------- |
| GET    | `/hr/timesheets?period=2026-W21` | `timesheet:view`    |
| POST   | `/hr/timesheets`                 | `timesheet:submit`  |
| POST   | `/hr/timesheets/:id/submit`      | `timesheet:submit`  |
| POST   | `/hr/timesheets/:id/approve`     | `timesheet:approve` |
| POST   | `/hr/timesheets/:id/reject`      | `timesheet:approve` |

### Auto-Build from Attendance

`Timesheet` aggregates a week's `AttendanceLog` rows into computed metrics:

```
trackedDays, workedDays, leaveDays, absenceDays, remoteDays,
lateCount, earlyDepartureCount,
totalWorkedMinutes, overtimeMinutes,
attendanceRate %, punctualityRate %,
sourceSnapshot: { dates: [{ date, status, totalMinutes }, ...] }
```

### Workflow

```
DRAFT ──submit──► PENDING ──approve──► APPROVED
   │                            └──reject──► REJECTED
   │
   └──cancel──► CANCELLED
```

### Business Rules

1. One timesheet per `(employeeId, periodStart, periodEnd)`.
2. Period typically Mon-Sun; configurable.
3. Auto-generation cron (Sunday 23:30) pre-fills timesheets in `DRAFT`.
4. Approval pushes approved overtime minutes to Finance via webhook.

## 8.6 Form 22 — Attendance Correction Request

### Endpoints

| Method | Path                                     | Permission                      |
| ------ | ---------------------------------------- | ------------------------------- |
| POST   | `/hr/attendance/corrections`             | `attendance:correct` (self)     |
| GET    | `/hr/attendance/corrections`             | `attendance:view`               |
| POST   | `/hr/attendance/corrections/:id/submit`  | `attendance:correct`            |
| POST   | `/hr/attendance/corrections/:id/approve` | `attendance:approve_correction` |
| POST   | `/hr/attendance/corrections/:id/reject`  | `attendance:approve_correction` |

### DTO

```json
{
  "attendanceLogId": "uuid", // or null when no existing log
  "date": "2026-05-21",
  "requestedCheckInAt": "2026-05-21T09:00:00+03:00",
  "requestedCheckOutAt": "2026-05-21T17:30:00+03:00",
  "requestedStatus": "PRESENT",
  "reason": "Biometric system down, used paper signin",
  "notes": "Witnessed by team lead"
}
```

### Business Rules

1. Cannot correct dates older than 14 days (configurable).
2. Approval rewrites the `AttendanceLog` for that date with `isAutoCalculated=false` (so cron won't undo).
3. Audit trail captures `before`/`after` snapshots.
4. Identifier: `AC-<year>-NNNN`.

## 8.7 Form 23 — Overtime Request

### Endpoints

| Method | Path                                  | Permission         |
| ------ | ------------------------------------- | ------------------ |
| POST   | `/hr/attendance/overtime`             | `overtime:request` |
| GET    | `/hr/attendance/overtime`             | `attendance:view`  |
| POST   | `/hr/attendance/overtime/:id/submit`  | `overtime:request` |
| POST   | `/hr/attendance/overtime/:id/approve` | `overtime:approve` |

### DTO

```json
{
  "date": "2026-05-21",
  "attendanceLogId": "uuid", // optional auto-link
  "requestedMinutes": 120,
  "reason": "Client deadline - production deploy"
}
```

### Business Rules

1. Must be pre-approved OR submitted within 48 hours of the day.
2. On approval, `AttendanceLog.overtimeApproved=true` and minutes synced to `Timesheet.overtimeMinutes`.
3. Finance webhook fires on approval — pay multiplier applied per labour law.
4. Identifier: `OT-<year>-NNNN`.

## 8.8 Form 24 — Work-from-Home / Flex Request

### Endpoints

| Method | Path                                   | Permission          |
| ------ | -------------------------------------- | ------------------- |
| POST   | `/hr/attendance/flex-work`             | `flex_work:request` |
| GET    | `/hr/attendance/flex-work`             | `attendance:view`   |
| POST   | `/hr/attendance/flex-work/:id/submit`  | `flex_work:request` |
| POST   | `/hr/attendance/flex-work/:id/approve` | `flex_work:approve` |

### DTO

```json
{
  "requestType": "WORK_FROM_HOME", // WORK_FROM_HOME | FLEX_TIME
  "startDate": "2026-05-25",
  "endDate": "2026-05-29",
  "requestedStartMinute": null, // only for FLEX_TIME
  "requestedEndMinute": null,
  "reason": "Family commitments / focused work",
  "details": { "patternDescription": "Wed/Fri remote weekly" }
}
```

### Business Rules

1. `WORK_FROM_HOME` requires the date range; on approval, attendance status for those days becomes `REMOTE` (not `PRESENT`).
2. `FLEX_TIME` shifts the schedule window for those days (`requestedStartMinute` / `requestedEndMinute`).
3. Position/department may have a `remoteAllowed=false` policy — approval blocked.
4. Identifier: `FW-<year>-NNNN`.

## 8.9 Daily Attendance Reconciliation Job

```
CronJob: AttendanceReconciliationJob
Schedule: 0 15 0 * * *   (00:15 daily)

forEach employee where lifecycle.status != TERMINATED:
    forEach date in [yesterday, today]:
        reconcileAttendance(employeeId, date)

function reconcileAttendance(empId, date):
    log = AttendanceLog.find({ employeeId: empId, date })
    if log and log.isAutoCalculated == false:
        skip  # do not overwrite manual entries

    schedule = resolveScheduleFor(empId, date)
    leave = ApprovedLeave.covers(empId, date)
    holiday = Holiday.matches(date, country)

    if leave:
        upsert log with status=ON_LEAVE
    elif holiday or not schedule.isWorkingDay(date):
        if no punches: skip (no log)
        else: keep punches, mark as PRESENT/REMOTE
    elif no punches:
        upsert log with status=ABSENT
    else:
        compute totalMinutes, overtime, status (LATE / HALF_DAY / etc.)
        upsert log with isAutoCalculated=true
```

---

# 9. Subsystem 5 — Performance, OKRs & Career Development

**Purpose:** Drive performance through reviews, OKRs, training plans, promotions, transfers, and compensation.
**Forms covered (9):** Performance Review (Quarterly), Personal OKR Creation, Manager OKR Review, Annual Performance Summary, Training Needs Assessment, Career Development Plan, Internal Transfer Request, Promotion Request, Salary Adjustment.

## 9.1 Architecture

```
ReviewPeriodConfig (year, quarter, windows)
        │
        ├──► PerformanceReview (per employee per period)
        │      ├── selfAssessment (JSON)
        │      ├── managerReview (JSON)
        │      ├── PerformanceReviewFeedback[]  (SELF/MANAGER/PEER/SKIP_LEVEL/DIRECT_REPORT)
        │      ├── finalRating (computed)
        │      ├── category (computed: UNSATISFACTORY..OUTSTANDING)
        │      ├── raiseRecommendation (JSON)
        │      └── promotionEligible
        │
        └──► PerformanceCalibration (per department per period)

Okr (scope: COMPANY / DEPARTMENT / USER)
        ├── parentOkr → child OKR alignment
        ├── KeyResult[] (NUMERIC/PERCENTAGE/BOOLEAN/MILESTONE)
        │      └── KeyResultUpdate[] (check-in history)
        └── OkrManagerReview (per OKR per reviewer)
              └── decision: APPROVED | CHANGES_REQUESTED

TrainingNeedsAssessment (linked to PerformanceReview)

CareerDevelopmentPlan (goals, dev actions, success metrics, progress %)

PromotionProposal (fromPos → toPos, requires high perf + OKR progress)
SuccessionPlan (per Position: candidate + readiness + risk)

InternalTransferRequest (PROMOTION | TRANSFER)
SalaryAdjustmentRequest (linked to Review or Transfer)
```

## 9.2 Form 25 — Performance Review (Quarterly)

### Endpoints

| Method | Path                                        | Permission                       |
| ------ | ------------------------------------------- | -------------------------------- |
| GET    | `/hr/performance/periods`                   | `performance:view`               |
| POST   | `/hr/performance/periods`                   | `performance:manage_periods`     |
| GET    | `/hr/performance/reviews`                   | `performance:view`               |
| GET    | `/hr/performance/reviews/:id`               | `performance:view`               |
| POST   | `/hr/performance/reviews`                   | `performance:start`              |
| PATCH  | `/hr/performance/reviews/:id/self`          | `performance:self_review` (self) |
| PATCH  | `/hr/performance/reviews/:id/manager`       | `performance:manager_review`     |
| POST   | `/hr/performance/reviews/:id/complete`      | `performance:complete`           |
| GET    | `/hr/performance/reviews/:id/feedback`      | `performance:view`               |
| POST   | `/hr/performance/reviews/:id/feedback`      | `performance:peer_feedback`      |
| GET    | `/hr/performance/calibrations`              | `performance:view`               |
| POST   | `/hr/performance/calibrations`              | `performance:calibrate`          |
| GET    | `/hr/performance/summary/:employeeId/:year` | `performance:view`               |

### Period DTO

```json
{
  "year": 2026,
  "quarter": 2,
  "type": "QUARTERLY", // QUARTERLY | ANNUAL
  "windowOpensAt": "2026-06-25T00:00:00Z",
  "selfAssessmentDueAt": "2026-07-05T23:59:59Z",
  "managerReviewDueAt": "2026-07-15T23:59:59Z",
  "windowClosesAt": "2026-07-20T23:59:59Z"
}
```

Unique by `(year, quarter)`.

### Review Lifecycle

```
NOT_STARTED ──HR opens period & creates reviews──► SELF_PENDING
                                                       │
                                                       ▼
                                                 (employee files self-assessment)
                                                       │
                                                       ▼
                                                  SELF_SUBMITTED
                                                       │
                                                       ▼
                                                  MANAGER_PENDING
                                                       │
                                                       ▼
                                              (manager files review)
                                                       │
                                                       ▼
                                                  MANAGER_SUBMITTED
                                                       │
                                                       ▼
                                              (HR completes)
                                                       │
                                                       ▼
                                                   COMPLETED
```

### Self-Assessment DTO (PATCH /self)

```json
{
  "okrScore": {
    "<okrId>": { "selfRating": 4, "comment": "Exceeded targets" }
  },
  "achievements": "What went well... textarea",
  "improvementAreas": "What can improve... textarea",
  "trainingNeeds": ["Public speaking", "AWS Solutions Architect"],
  "selfRating": 4
}
```

Merged into `PerformanceReview.selfAssessment` (JSONB). Status moves `NOT_STARTED → SELF_SUBMITTED` (skipping `SELF_PENDING` if filled in one shot).

### Manager Review DTO (PATCH /manager)

```json
{
  "okrScore": {
    "<okrId>": { "managerRating": 4, "comment": "..." }
  },
  "achievements": "...",
  "challenges": "...",
  "managerRating": 4,
  "promotionEligible": false,
  "raiseRecommendation": {
    "recommended": true,
    "percentage": 10,
    "rationale": "..."
  }
}
```

Status: `SELF_SUBMITTED → MANAGER_SUBMITTED`. Only allowed when current status is `SELF_SUBMITTED` or `MANAGER_PENDING`.

### Peer / Skip-Level / Direct-Report Feedback

`POST /hr/performance/reviews/:id/feedback`:

```json
{
  "reviewerId": "user-uuid",
  "role": "PEER", // SELF/MANAGER/PEER/SKIP_LEVEL/DIRECT_REPORT
  "ratings": { "overall": 4, "teamwork": 5, "leadership": 3 },
  "comments": { "strengths": "...", "improvements": "..." }
}
```

Unique by `(reviewId, reviewerId, role)`.

### Complete Review — Computation Algorithm

```
function completeReview(reviewId):
    r = PerformanceReview.findById(reviewId)
    assert r.status == 'MANAGER_SUBMITTED'
    assert r.selfAssessment.selfRating != null
    assert r.managerReview.managerRating != null

    selfRating = r.selfAssessment.selfRating
    managerRating = r.managerReview.managerRating

    peerFeedbacks = r.feedbackEntries.filter(role='PEER' and submittedAt)
    drFeedbacks = r.feedbackEntries.filter(role='DIRECT_REPORT' and submittedAt)
    slFeedbacks = r.feedbackEntries.filter(role='SKIP_LEVEL' and submittedAt)

    peerAvg = avg(f.ratings.overall for f in peerFeedbacks) if any else null
    drAvg = avg(f.ratings.overall for f in drFeedbacks) if any else null
    slAvg = avg(f.ratings.overall for f in slFeedbacks) if any else null

    # Weighted average — normalize over present components
    weights = {
        self:     20,
        manager:  50,
        peer:     15,
        direct_report: 10,
        skip_level: 5
    }

    components = [
        (selfRating, weights.self),
        (managerRating, weights.manager)
    ]
    if peerAvg: components.append((peerAvg, weights.peer))
    if drAvg:   components.append((drAvg, weights.direct_report))
    if slAvg:   components.append((slAvg, weights.skip_level))

    totalWeight = sum(w for _, w in components)
    finalRating = sum(score * w for score, w in components) / totalWeight

    # Category mapping
    if finalRating >= 4.5: category = OUTSTANDING
    elif finalRating >= 4.0: category = EXCEEDS_EXPECTATIONS
    elif finalRating >= 3.0: category = MEETS_EXPECTATIONS
    elif finalRating >= 2.0: category = BELOW_EXPECTATIONS
    else: category = UNSATISFACTORY

    promotionEligible = (category in [EXCEEDS_EXPECTATIONS, OUTSTANDING])
                        and !hasActiveDisciplinaryAction(employeeId)

    update:
        finalRating, category, promotionEligible,
        status: 'COMPLETED', completedAt: now
```

### Calibration

`PerformanceCalibration` allows department-level adjustments to ratings. Pattern:

```json
{
  "periodId": "uuid",
  "departmentId": "uuid",
  "adjustments": [
    { "reviewId": "uuid", "originalRating": 4.2, "adjustedRating": 4.0, "rationale": "..." },
    ...
  ]
}
```

Unique by `(periodId, departmentId)`.

## 9.3 Form 26 — Personal OKR Creation

### Endpoints

| Method | Path                                     | Permission           |
| ------ | ---------------------------------------- | -------------------- |
| GET    | `/hr/okrs`                               | `okr:view`           |
| POST   | `/hr/okrs`                               | `okr:create`         |
| GET    | `/hr/okrs/:id`                           | `okr:view`           |
| PATCH  | `/hr/okrs/:id`                           | `okr:update`         |
| GET    | `/hr/okrs/:id/progress`                  | `okr:view`           |
| POST   | `/hr/okrs/:id/key-results`               | `okr:update`         |
| PATCH  | `/hr/okrs/:id/key-results/:krId`         | `okr:update`         |
| POST   | `/hr/okrs/:id/key-results/weights`       | `okr:update`         |
| POST   | `/hr/okrs/:id/key-results/:krId/updates` | `okr:update`         |
| GET    | `/hr/okrs/:id/key-results/:krId/updates` | `okr:view`           |
| POST   | `/hr/okrs/:id/manager-review`            | `okr:manager_review` |

### Create DTO

```json
{
  "scope": "USER", // COMPANY | DEPARTMENT | USER
  "employeeId": "uuid", // required if scope=USER
  "departmentId": "uuid", // required if scope=DEPARTMENT
  "parentOkrId": "uuid", // optional alignment to parent
  "periodYear": 2026,
  "periodQuarter": 2,
  "title": "Reduce API p95 latency by 40%",
  "description": "...",
  "startDate": "2026-04-01",
  "endDate": "2026-06-30",
  "keyResults": [
    {
      "title": "Cache hit ratio above 80%",
      "type": "PERCENTAGE", // NUMERIC | PERCENTAGE | BOOLEAN | MILESTONE
      "targetValue": 80,
      "weight": 40
    },
    {
      "title": "DB query count per request",
      "type": "NUMERIC",
      "targetValue": 5, // lower is better — semantic in title
      "weight": 30
    },
    {
      "title": "Tracing fully deployed",
      "type": "BOOLEAN",
      "targetValue": 1,
      "weight": 30
    }
  ]
}
```

### Business Rules

1. Date range validation: `startDate <= endDate`; both within the quarter window.
2. Scope-driven validation:
   - `USER`: `employeeId` required.
   - `DEPARTMENT`: `departmentId` required.
   - `COMPANY`: neither required.
3. Parent OKR compatibility: child cannot have a wider scope than parent (e.g., USER OKR can have DEPARTMENT or COMPANY parent, but not vice-versa).
4. KR weights must sum to **100**.
5. Status starts `DRAFT`; moves to `ACTIVE` on manager approval (via OKR Manager Review).
6. KR progress computed:
   - `NUMERIC`: `min(100, currentValue / targetValue * 100)`
   - `PERCENTAGE`: same formula with implicit 100 max
   - `BOOLEAN`: 0 or 100
   - `MILESTONE`: client-set integer 0–100
7. OKR overall progress = weighted average of KR progress.
8. Status auto-adjusts:
   - `ON_TRACK` if progress ≥ expected for time elapsed.
   - `AT_RISK` if progress < expected by 10%.
   - `DELAYED` if progress < expected by 25%.
   - `ACHIEVED` if progress ≥ 100 by endDate.
   - `PARTIALLY_ACHIEVED` if progress ≥ 70% but < 100% at endDate.
   - `MISSED` if progress < 70% at endDate.

### KR Update DTO

```json
{
  "newValue": 75,
  "comment": "Cache layer deployed, monitoring uptick in hits"
}
```

Algorithm:

```
function updateKeyResult(krId, dto, updatedById):
    transaction:
        kr = KeyResult.findById(krId)
        previousValue = kr.currentValue

        kr.currentValue = dto.newValue
        kr.progress = computeProgress(kr.type, dto.newValue, kr.targetValue)
        kr.status = computeStatus(kr.progress, kr.okr.endDate)
        KeyResult.update(...)

        KeyResultUpdate.create({
            keyResultId: krId,
            previousValue,
            newValue: dto.newValue,
            comment: dto.comment,
            updatedById
        })

        # Recompute parent OKR
        recomputeOkrAggregates(kr.okrId)
```

### Reweight KRs

`POST /hr/okrs/:id/key-results/weights`:

```json
{
  "weights": [
    { "keyResultId": "uuid", "weight": 35 },
    { "keyResultId": "uuid", "weight": 35 },
    { "keyResultId": "uuid", "weight": 30 }
  ]
}
```

Sum must equal 100; transaction-bound update.

## 9.4 Form 27 — Manager OKR Review

`OkrManagerReview` records a manager's review per OKR per period.

### DTO

```json
{
  "decision": "APPROVED", // APPROVED | CHANGES_REQUESTED
  "overallConfidence": 4, // 1-5
  "comments": "...",
  "strengths": ["Clear KRs", "Strong alignment"],
  "risks": ["Cache layer dependency on infra team"],
  "supportActions": ["Pair with infra weekly"],
  "reviewedAt": "2026-04-15T10:00:00Z"
}
```

Unique by `(okrId, reviewerId)`. `APPROVED` flips OKR.status from `DRAFT` → `ACTIVE`.

## 9.5 Form 28 — Annual Performance Summary

Computed view, not a form. Aggregates all reviews and OKRs of an employee for a year.

`GET /hr/performance/summary/:employeeId/:year` returns:

```json
{
  "employee": { "id": "...", "name": "...", "position": "..." },
  "year": 2026,
  "reviews": [
    { "quarter": 1, "category": "EXCEEDS_EXPECTATIONS", "finalRating": 4.3 },
    { "quarter": 2, "category": "MEETS_EXPECTATIONS", "finalRating": 3.8 }
  ],
  "averageRating": 4.05,
  "okrSummary": {
    "totalOkrs": 8,
    "averageProgress": 78,
    "achieved": 5,
    "partiallyAchieved": 2,
    "missed": 1
  },
  "trainingsCompleted": 4,
  "recognitionsReceived": 2,
  "promotionEligible": true,
  "raiseRecommendation": { ... }
}
```

## 9.6 Form 29 — Training Needs Assessment

Links to a `PerformanceReview` and feeds into Training subsystem.

### Endpoints

| Method | Path                                        | Permission         |
| ------ | ------------------------------------------- | ------------------ |
| POST   | `/hr/training-needs/assessments`            | `training:request` |
| GET    | `/hr/training-needs/assessments`            | `training:view`    |
| GET    | `/hr/training-needs/assessments/:id`        | `training:view`    |
| POST   | `/hr/training-needs/assessments/:id/submit` | `training:request` |
| POST   | `/hr/training-needs/assessments/:id/review` | `training:approve` |

### DTO

```json
{
  "employeeId": "uuid",
  "basedOnReviewId": "uuid",
  "periodYear": 2026,
  "developmentAreas": [
    {
      "skill": "AWS Architecture",
      "currentLevel": "BEGINNER",
      "targetLevel": "INTERMEDIATE"
    }
  ],
  "requestedTrainings": [
    { "title": "AWS SA Associate", "provider": "AWS", "estimatedCost": 15000 }
  ],
  "skillGapSummary": "...",
  "managerNotes": "...",
  "priority": "MEDIUM"
}
```

## 9.7 Form 30 — Career Development Plan

### Endpoints

| Method | Path                            | Permission           |
| ------ | ------------------------------- | -------------------- |
| GET    | `/hr/career-plans`              | `career_plan:view`   |
| POST   | `/hr/career-plans`              | `career_plan:create` |
| GET    | `/hr/career-plans/:id`          | `career_plan:view`   |
| PATCH  | `/hr/career-plans/:id`          | `career_plan:update` |
| POST   | `/hr/career-plans/:id/progress` | `career_plan:update` |
| POST   | `/hr/career-plans/:id/complete` | `career_plan:update` |

### DTO

```json
{
  "employeeId": "uuid",
  "currentPositionId": "uuid",
  "targetPositionId": "uuid",
  "planYear": 2026,
  "title": "Path to Engineering Manager",
  "summary": "...",
  "goals": [
    {
      "title": "Lead a feature delivery",
      "status": "IN_PROGRESS",
      "dueDate": "2026-09-30"
    },
    {
      "title": "Complete leadership training",
      "status": "NOT_STARTED",
      "dueDate": "2026-08-15"
    }
  ],
  "developmentActions": [
    { "action": "Pair with current EM weekly", "frequency": "weekly" }
  ],
  "successMetrics": [
    { "metric": "Feature delivered on time", "target": "Q3 2026" }
  ]
}
```

### Business Rules

1. `progressPercent` auto-recomputed from goals: `(completedGoals / totalGoals) * 100`.
2. `status: DRAFT → ACTIVE → COMPLETED / CANCELLED`.
3. On `COMPLETED`, sets `completedAt`.

## 9.8 Form 31 — Internal Transfer Request

### Endpoints

| Method | Path                                | Permission                 |
| ------ | ----------------------------------- | -------------------------- |
| POST   | `/hr/transfer-requests`             | `transfer_request:create`  |
| GET    | `/hr/transfer-requests`             | `transfer_request:view`    |
| GET    | `/hr/transfer-requests/:id`         | `transfer_request:view`    |
| POST   | `/hr/transfer-requests/:id/submit`  | `transfer_request:create`  |
| POST   | `/hr/transfer-requests/:id/approve` | `transfer_request:approve` |
| POST   | `/hr/transfer-requests/:id/reject`  | `transfer_request:approve` |

### DTO

```json
{
  "employeeId": "uuid",
  "requestType": "PROMOTION", // PROMOTION | TRANSFER
  "currentPositionId": "uuid",
  "targetPositionId": "uuid",
  "reason": "...",
  "businessCase": {
    "rationale": "...",
    "expectedImpact": "..."
  },
  "desiredEffectiveDate": "2026-09-01",
  "compensationChange": {
    "newBaseSalary": 40000,
    "currency": "ETB",
    "percentChange": 14.3
  }
}
```

### Approval Chain

`Department Head → HR → CEO` (for senior / cross-department) or `Department Head → HR` (for within-dept).
On approval:

1. Update `UserEmployment` to new position.
2. Append `UserEmploymentHistory` row with `changeReason="Transfer/Promotion"`.
3. If `compensationChange` provided, auto-create `SalaryAdjustmentRequest` (linked).
4. Identifier: `TR-<year>-NNNN`.

## 9.9 Form 32 — Promotion Request (Promotion Proposal)

Distinct from `InternalTransferRequest` — this is an HR-driven proposal grounded in performance.

### Endpoints

| Method | Path                                 | Permission                   |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/hr/promotion-proposals`            | `promotion_proposal:view`    |
| POST   | `/hr/promotion-proposals`            | `promotion_proposal:create`  |
| GET    | `/hr/promotion-proposals/:id`        | `promotion_proposal:view`    |
| POST   | `/hr/promotion-proposals/:id/review` | `promotion_proposal:approve` |

### DTO

```json
{
  "employeeId": "uuid",
  "fromPositionId": "uuid",
  "toPositionId": "uuid",
  "justification": {
    "summary": "...",
    "performanceHighlights": ["Q1 OUTSTANDING", "Q2 EXCEEDS_EXPECTATIONS"],
    "okrProgress": 87
  }
}
```

### Eligibility Rules (server-enforced)

1. Current employment position must exist and equal `fromPositionId`.
2. `toPositionId` must differ from current.
3. Latest **completed** `PerformanceReview` must have `promotionEligible=true`.
4. Average current-year OKR progress must be ≥ **70%**.
5. No active `DisciplinaryAction` with `status=ACTIVE`.

### Approval Side Effects

On approval:

1. Update `UserEmployment.positionId`.
2. Append `UserEmploymentHistory`.
3. Optionally trigger compensation update (validates against `JobGrade` band).
4. Notify employee + finance.
5. Generate promotion letter.

## 9.10 Form 33 — Salary Adjustment Request

### Endpoints

| Method | Path                                 | Permission                  |
| ------ | ------------------------------------ | --------------------------- |
| POST   | `/hr/salary-adjustments`             | `salary_adjustment:propose` |
| GET    | `/hr/salary-adjustments`             | `salary_adjustment:view`    |
| POST   | `/hr/salary-adjustments/:id/submit`  | `salary_adjustment:propose` |
| POST   | `/hr/salary-adjustments/:id/approve` | `salary_adjustment:approve` |

### DTO

```json
{
  "employeeId": "uuid",
  "linkedReviewId": "uuid", // optional
  "linkedTransferRequestId": "uuid", // optional
  "reason": "MERIT", // MERIT/EQUITY/PROMOTION/TRANSFER/RETENTION/MARKET
  "currentBaseSalary": 30000,
  "proposedBaseSalary": 33000,
  "percentChange": 10,
  "currency": "ETB",
  "effectiveFrom": "2026-08-01",
  "justification": {
    "rationale": "...",
    "marketBenchmark": { "source": "...", "p50": 32000, "p75": 35000 }
  }
}
```

### Business Rules

1. `percentChange` server-recomputed from `currentBaseSalary` and `proposedBaseSalary`.
2. Salary band check against `JobGrade` (if linked).
3. Approval triggers `UserCompensation` update via the algorithm in §7.3.
4. Identifier: `SA-<year>-NNNN`.

## 9.11 Succession Planning (Cross-Cutting)

### Endpoints

| Method | Path                       | Permission               |
| ------ | -------------------------- | ------------------------ |
| GET    | `/hr/succession-plans`     | `succession_plan:view`   |
| POST   | `/hr/succession-plans`     | `succession_plan:create` |
| GET    | `/hr/succession-plans/:id` | `succession_plan:view`   |
| PATCH  | `/hr/succession-plans/:id` | `succession_plan:update` |

### DTO

```json
{
  "positionId": "uuid",
  "candidateEmployeeId": "uuid",
  "readiness": "ONE_YEAR", // READY_NOW | ONE_YEAR | TWO_YEARS
  "riskLevel": "MEDIUM", // LOW | MEDIUM | HIGH | CRITICAL
  "notes": "Strong technical, needs management training"
}
```

Unique by `(positionId, candidateEmployeeId)`.

---

# 10. Subsystem 6 — Training & Skill Development

**Purpose:** Capture employee skills, identify gaps, approve trainings, track completion, and gather feedback to improve future offerings.
**Forms covered (4):** Training Request, Training Feedback, Skill Gap Assessment, Training Completion & Certification.

## 10.1 Architecture

```
Skill (library — global catalog)
   │
   ├─► EmployeeSkill (per employee × skill)
   │     ├── level: BEGINNER/INTERMEDIATE/ADVANCED/EXPERT
   │     ├── source: SELF/MANAGER/ASSESSMENT/TRAINING
   │     └── attestedAt
   │
   └─► SkillGapAssessment (per department)
         ├── requiredSkills (JSONB)
         ├── currentState (JSONB)
         ├── trainingRecommendations (JSONB)
         └── hireRecommendations (JSONB)

TrainingBudget (per department per year)
   │
   ▼
TrainingRequest ──approved──► TrainingCompletion ──► TrainingFeedback
   │                              │                      │
   │                              ├── certificate         └── TrainingFeedbackTemplate
   │                              ├── expiryDate
   │                              └── skillsAcquired (JSONB) ──► auto-update EmployeeSkill
```

## 10.2 Skill Library

### Endpoints

| Method | Path                    | Permission     |
| ------ | ----------------------- | -------------- |
| GET    | `/hr/skills`            | `skill:view`   |
| POST   | `/hr/skills`            | `skill:manage` |
| GET    | `/hr/skills/:id`        | `skill:view`   |
| PATCH  | `/hr/skills/:id`        | `skill:manage` |
| DELETE | `/hr/skills/:id`        | `skill:manage` |
| GET    | `/hr/skills/categories` | `skill:view`   |

### Skill DTO

```json
{
  "name": "TypeScript",
  "category": "Programming Languages",
  "description": "Statically typed superset of JavaScript"
}
```

`name` is unique site-wide; `category` enables grouping in UI.

## 10.3 Employee Skills (Per-Person)

### Endpoints

| Method | Path                                       | Permission                                 |
| ------ | ------------------------------------------ | ------------------------------------------ |
| GET    | `/hr/employees/:id/skills`                 | `employee:view`                            |
| POST   | `/hr/employees/:id/skills`                 | `employee:update` (self) or `skill:manage` |
| PATCH  | `/hr/employees/:id/skills/:skillId`        | `employee:update`                          |
| DELETE | `/hr/employees/:id/skills/:skillId`        | `employee:update`                          |
| POST   | `/hr/employees/:id/skills/:skillId/attest` | `skill:manage`                             |

### DTO

```json
{
  "skillId": "uuid",
  "level": "INTERMEDIATE",
  "source": "SELF"
}
```

### Business Rules

1. Unique `(employeeId, skillId)`.
2. When `source=TRAINING`, set `attestedAt=now` and trigger auto-population from a completed `TrainingCompletion.skillsAcquired`.
3. Self-claimed (`SELF`) skills are unattested until a manager attestation flips `source=MANAGER` and sets `attestedAt`.
4. `ASSESSMENT` source comes from `SkillGapAssessment` results.

## 10.4 Training Budget

### Endpoints

| Method | Path                                       | Permission               |
| ------ | ------------------------------------------ | ------------------------ |
| GET    | `/hr/training-budgets`                     | `training:view`          |
| POST   | `/hr/training-budgets`                     | `training:manage_budget` |
| PATCH  | `/hr/training-budgets/:id`                 | `training:manage_budget` |
| GET    | `/hr/training-budgets/:departmentId/:year` | `training:view`          |

### DTO

```json
{
  "departmentId": "uuid",
  "year": 2026,
  "totalBudget": 500000,
  "perPersonAmount": 25000
}
```

### Business Rules

1. Unique `(departmentId, year)`.
2. `usedYtd` auto-increments on `TrainingRequest` approval where `costPayer=COMPANY`.
3. Approval is blocked when `usedYtd + request.cost > totalBudget` (unless override permission).

## 10.5 Form 34 — Training Request

### Endpoints

| Method | Path                                | Permission                      |
| ------ | ----------------------------------- | ------------------------------- |
| POST   | `/hr/training/requests`             | `training:request`              |
| GET    | `/hr/training/requests`             | `training:view`                 |
| GET    | `/hr/training/requests/:id`         | `training:view`                 |
| PATCH  | `/hr/training/requests/:id`         | `training:request` (DRAFT only) |
| POST   | `/hr/training/requests/:id/submit`  | `training:request`              |
| POST   | `/hr/training/requests/:id/approve` | `training:approve`              |
| POST   | `/hr/training/requests/:id/reject`  | `training:approve`              |
| POST   | `/hr/training/requests/:id/cancel`  | `training:request`              |

### Create DTO

```json
{
  "employeeId": "uuid",
  "departmentId": "uuid",
  "trainingType": "SKILL", // SKILL/COMPLIANCE/LEADERSHIP/OTHER
  "title": "AWS Solutions Architect Associate",
  "provider": "AWS / Coursera",
  "startDate": "2026-07-01",
  "endDate": "2026-07-15",
  "durationHours": 40,
  "justification": "Needed to support new cloud projects",
  "skillGapLinkId": "uuid", // optional — links to Skill
  "cost": 15000,
  "costPayer": "COMPANY" // COMPANY | SELF
}
```

### State Machine

```
DRAFT ──submit──► PENDING ──approve──► APPROVED ──► (creates TrainingCompletion placeholder)
   │                  │
   │                  └──reject──► REJECTED
   │
   └──cancel──► CANCELLED
```

### Approval Algorithm

```
function approveTraining(requestId, approverId):
    transaction:
        req = TrainingRequest.findById(requestId)
        assert req.status == 'PENDING'

        if req.costPayer == 'COMPANY':
            budget = TrainingBudget.findUnique({
                departmentId: req.departmentId,
                year: req.startDate.year
            })
            if budget is null:
                throw 422 "No training budget for department/year"
            if budget.usedYtd + req.cost > budget.totalBudget:
                throw 422 "Exceeds annual budget"
            budget.usedYtd += req.cost
            TrainingBudget.update(...)

        req.status = 'APPROVED'
        req.approvedById = approverId
        req.approvedAt = now
        TrainingRequest.update(...)

    notify employee (training approved + calendar invite for start date)
```

### Approval Chain

`Employee → Department Head → HR Manager` (sequence enforced by client/process; the schema only tracks final approver, but extending with `ApprovalStep` is recommended for parity with Recruitment Form 1).

## 10.6 Form 37 — Training Completion & Certification

A `TrainingCompletion` row is created on `TrainingRequest` approval (or manually for unsanctioned trainings).

### Endpoints

| Method | Path                                        | Permission          |
| ------ | ------------------------------------------- | ------------------- |
| POST   | `/hr/training/completions`                  | `training:complete` |
| GET    | `/hr/training/completions`                  | `training:view`     |
| GET    | `/hr/training/completions/:id`              | `training:view`     |
| PATCH  | `/hr/training/completions/:id`              | `training:complete` |
| POST   | `/hr/training/completions/:id/attest`       | `training:complete` |
| GET    | `/hr/training/completions/expiring?days=60` | `training:view`     |

### DTO

```json
{
  "employeeId": "uuid",
  "trainingRequestId": "uuid", // optional
  "title": "AWS SA Associate",
  "provider": "AWS",
  "startDate": "2026-07-01",
  "endDate": "2026-07-15",
  "completionStatus": "COMPLETED", // COMPLETED | PARTIAL | DROPPED
  "scoreOrGrade": "920/1000",
  "certificateNumber": "AWS-SAA-12345",
  "certificateUrl": "https://storage.../cert.pdf",
  "expiryDate": "2029-07-15",
  "skillsAcquired": [{ "skillId": "uuid", "level": "INTERMEDIATE" }]
}
```

### Business Rules

1. On `COMPLETED` and attestation:
   - For each `skillsAcquired[i]`, upsert `EmployeeSkill` with `source=TRAINING`, `attestedAt=now`. Only upgrade level (never downgrade automatically).
   - Set `syncedToProfile=true`.
2. `expiryDate` non-null triggers reminders via `CertificationExpiryJob` at 60/30/7 days before.
3. `DROPPED` or `PARTIAL` does not push skills to profile.

## 10.7 Form 35 — Training Feedback

Feedback templates allow consistent feedback across many trainings.

### Endpoints

| Method | Path                                              | Permission                  |
| ------ | ------------------------------------------------- | --------------------------- |
| GET    | `/hr/training/feedback-templates`                 | `training:view`             |
| POST   | `/hr/training/feedback-templates`                 | `training:manage_templates` |
| PATCH  | `/hr/training/feedback-templates/:id`             | `training:manage_templates` |
| POST   | `/hr/training/completions/:completionId/feedback` | `training:feedback`         |
| GET    | `/hr/training/feedback`                           | `training:view`             |
| GET    | `/hr/training/feedback/:id`                       | `training:view`             |
| POST   | `/hr/training/feedback/:id/review`                | `training:approve`          |

### Template DTO

```json
{
  "name": "Course Feedback Standard v1",
  "description": "Standard course feedback",
  "feedbackType": "COURSE", // COURSE | TRAINER | PROVIDER
  "ratingScale": "ONE_TO_FIVE", // ONE_TO_FIVE | ONE_TO_TEN
  "questions": [
    { "id": "q1", "text": "How relevant was the content?", "type": "rating" },
    {
      "id": "q2",
      "text": "How well did the trainer explain?",
      "type": "rating"
    },
    {
      "id": "q3",
      "text": "Would you recommend to colleagues?",
      "type": "boolean"
    },
    { "id": "q4", "text": "What can be improved?", "type": "text" }
  ]
}
```

### Feedback Submission DTO

```json
{
  "templateId": "uuid",
  "submissionType": "IDENTIFIED", // ANONYMOUS | IDENTIFIED | MANAGER_ONLY
  "responses": {
    "q1": 5,
    "q2": 4,
    "q3": true,
    "q4": "More hands-on labs would help"
  },
  "overallRating": 4.5,
  "comments": "Excellent overall"
}
```

### Business Rules

1. `submissionType=ANONYMOUS` → strip `participantId` on read for non-HR users.
2. `submissionType=MANAGER_ONLY` → only the participant's manager + HR sees the response.
3. `overallRating` may be client-computed but server validates against responses.
4. `FeedbackStatus`: `DRAFT → SUBMITTED → REVIEWED`.
5. `reviewedById` + `actionTaken` capture HR's follow-up action.

## 10.8 Form 36 — Skill Gap Assessment

### Endpoints

| Method | Path                             | Permission         |
| ------ | -------------------------------- | ------------------ |
| GET    | `/hr/skills/gap-assessments`     | `skill:gap_assess` |
| POST   | `/hr/skills/gap-assessments`     | `skill:gap_assess` |
| GET    | `/hr/skills/gap-assessments/:id` | `skill:gap_assess` |
| PATCH  | `/hr/skills/gap-assessments/:id` | `skill:gap_assess` |

### DTO

```json
{
  "departmentId": "uuid",
  "assessedAt": "2026-05-15T10:00:00Z",
  "requiredSkills": [
    {
      "skillId": "uuid",
      "name": "TypeScript",
      "neededLevel": "ADVANCED",
      "headcount": 5
    },
    {
      "skillId": "uuid",
      "name": "AWS",
      "neededLevel": "INTERMEDIATE",
      "headcount": 8
    }
  ],
  "currentState": [
    {
      "skillId": "uuid",
      "actualCount": 3,
      "byLevel": { "INTERMEDIATE": 1, "ADVANCED": 2 }
    }
  ],
  "criticalGapsSummary": "AWS expertise concentrated in 1 team; bus-factor risk.",
  "trainingRecommendations": [
    {
      "skillId": "uuid",
      "targetHires": 4,
      "estimatedCost": 60000,
      "priority": "HIGH"
    }
  ],
  "hireRecommendations": [
    { "role": "Senior AWS Engineer", "headcount": 1, "justification": "..." }
  ]
}
```

### Algorithm — Auto-Compute Current State

```
function autoCurrentState(departmentId, requiredSkills):
    employees = Employee.find({ departmentId, lifecycle.status: 'ACTIVE' })
    result = []
    for req in requiredSkills:
        skills = EmployeeSkill.find({
            employeeId: { in: employees.map(e => e.id) },
            skillId: req.skillId,
            level: { in: levelsAtOrAbove(req.neededLevel) }
        })
        result.push({
            skillId: req.skillId,
            actualCount: skills.length,
            byLevel: groupByLevel(skills)
        })
    return result
```

### Business Rules

1. `trainingRecommendations` can be one-click converted into `TrainingRequest` rows.
2. `hireRecommendations` can be one-click converted into `JobRequestForm` rows.

---

# 11. Subsystem 7 — Employee Relations

**Purpose:** Maintain a healthy culture by tracking incidents, disciplinary actions, grievances, recognitions, surveys, and conflicts.
**Forms covered (7):** Satisfaction Survey, Disciplinary Action / Grievance, Incident Report, Employee Suggestion, Recognition, Culture Pulse Survey, Conflict Mediation.

## 11.1 Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      EMPLOYEE RELATIONS                          │
└──────────────────────────────────────────────────────────────────┘

  POSITIVE          ┌─► Recognition (nominator → nominee)
  ────────────      └─► Survey (Satisfaction, Pulse, Suggestion)

  CORRECTIVE        ┌─► IncidentReport ── escalates ──► DisciplinaryAction
  ────────────      ├─► Grievance (employee files complaint)
                    └─► ConflictMediation (third-party mediated)
```

## 11.2 Form 40 — Incident Report

Operational record of a workplace incident. Drives investigations and may escalate to disciplinary action.

### Endpoints

| Method | Path                                              | Permission             |
| ------ | ------------------------------------------------- | ---------------------- |
| POST   | `/hr/relations/incidents`                         | `incident:report`      |
| GET    | `/hr/relations/incidents`                         | `incident:view`        |
| GET    | `/hr/relations/incidents/:id`                     | `incident:view`        |
| PATCH  | `/hr/relations/incidents/:id`                     | `incident:investigate` |
| POST   | `/hr/relations/incidents/:id/assign-investigator` | `incident:investigate` |
| POST   | `/hr/relations/incidents/:id/resolve`             | `incident:investigate` |

### DTO

```json
{
  "incidentType": "HARASSMENT", // SAFETY/SECURITY/CONFLICT/HARASSMENT/OTHER
  "severity": "HIGH", // LOW/MEDIUM/HIGH/CRITICAL
  "description": "Witnessed inappropriate language in team chat",
  "location": "Slack #engineering channel",
  "occurredAt": "2026-05-20T15:30:00Z",
  "peopleInvolved": [
    { "employeeId": "uuid", "role": "REPORTER" },
    { "employeeId": "uuid", "role": "SUBJECT" },
    { "employeeId": "uuid", "role": "WITNESS" }
  ],
  "immediateActions": ["Pulled affected channel logs", "Notified HR"]
}
```

### State Machine

```
OPEN ──assign──► INVESTIGATING ──resolve──► RESOLVED
                       │
                       └──escalate──► (creates DisciplinaryAction or Mediation)
```

### Business Rules

1. **SLA computation (server-side):**
   - `CRITICAL` → 24h
   - `HIGH` → 72h
   - `MEDIUM` → 7 days
   - `LOW` → 14 days
   - `investigationDueAt = createdAt + slaHours`
2. Identifier: `INC-<year>-NNNN`.
3. Cron `IncidentSlaJob` (every hour) escalates breaches.
4. Resolution requires `rootCause` and `preventiveActions`.
5. Confidential — `incident:view` is HR-only by default; reporter can see their own report status only.

## 11.3 Form 39 — Disciplinary Action / Grievance

### 11.3.1 Disciplinary Action

Issued by management following misconduct (often referencing an `IncidentReport`).

### Endpoints

| Method | Path                                             | Permission                         |
| ------ | ------------------------------------------------ | ---------------------------------- |
| POST   | `/hr/relations/disciplinary-actions`             | `disciplinary:create`              |
| GET    | `/hr/relations/disciplinary-actions`             | `disciplinary:view`                |
| GET    | `/hr/relations/disciplinary-actions/:id`         | `disciplinary:view`                |
| POST   | `/hr/relations/disciplinary-actions/:id/approve` | `disciplinary:approve`             |
| POST   | `/hr/relations/disciplinary-actions/:id/appeal`  | `disciplinary:view` (subject only) |

### DTO

```json
{
  "employeeId": "uuid",
  "incidentType": "ATTENDANCE_VIOLATION", // ATTENDANCE_VIOLATION/PERFORMANCE_ISSUE/CODE_OF_CONDUCT
  "actionType": "WRITTEN_WARNING", // VERBAL_WARNING/WRITTEN_WARNING/FINAL_WARNING/PERFORMANCE_IMPROVEMENT_PLAN/SUSPENSION/TERMINATION
  "incidentReportId": "uuid", // optional
  "description": "Repeated late arrivals: 5 within 30 days",
  "effectiveFrom": "2026-05-22",
  "expiresAt": "2026-08-22", // expiration of disciplinary record
  "durationDays": 90
}
```

### State Machine

```
PENDING ──approve──► ACTIVE ──(time passes)──► EXPIRED
              │
              └──employee appeals──► APPEALED
                                          │
                                          └──HR decides──► ACTIVE / EXPIRED
```

### Side Effects

| Action Type                    | Side Effect                                                               |
| ------------------------------ | ------------------------------------------------------------------------- |
| `VERBAL_WARNING`               | Notification only                                                         |
| `WRITTEN_WARNING`              | Generates document, mailed to employee                                    |
| `FINAL_WARNING`                | Blocks promotions; triggers HR review                                     |
| `PERFORMANCE_IMPROVEMENT_PLAN` | Creates a sub-plan tracker (similar to probation)                         |
| `SUSPENSION`                   | `UserLifecycle.status=SUSPENSED`, `suspendedAt=now`, blocks system access |
| `TERMINATION`                  | Triggers offboarding flow with `terminationType=TERMINATION`              |

### Business Rules

1. `TERMINATION` requires CEO/GM approval (separate `approvedById` step).
2. Active disciplinary actions block promotion eligibility (referenced in §9.9).
3. Disciplinary records auto-expire on `expiresAt`; soft-archive after expiry.

### 11.3.2 Grievance

Employee-filed complaint.

### Endpoints

| Method | Path                                   | Permission          |
| ------ | -------------------------------------- | ------------------- |
| POST   | `/hr/relations/grievances`             | `grievance:file`    |
| GET    | `/hr/relations/grievances`             | `grievance:view`    |
| GET    | `/hr/relations/grievances/:id`         | `grievance:view`    |
| POST   | `/hr/relations/grievances/:id/assign`  | `grievance:assign`  |
| POST   | `/hr/relations/grievances/:id/resolve` | `grievance:resolve` |
| POST   | `/hr/relations/grievances/:id/close`   | `grievance:resolve` |

### DTO

```json
{
  "subject": "Unfair workload distribution",
  "description": "...",
  "category": "WORKLOAD"
}
```

### State Machine

```
OPEN ──HR assigns──► INVESTIGATING ──resolve──► RESOLVED ──close──► CLOSED
```

### Business Rules

1. Subject (the employee being complained about) is **not** notified during `INVESTIGATING` — only after resolution decision.
2. Visibility: only the reporter, HR, and assigned investigator can read.
3. SLA: HR must assign within 24h of `OPEN`.

## 11.4 Form 38 — Employee Satisfaction Survey & Form 43 — Culture Pulse Survey

Both use the same `Survey` model with different `type` values.

### Endpoints

| Method | Path                                  | Permission       |
| ------ | ------------------------------------- | ---------------- |
| GET    | `/hr/relations/surveys`               | `survey:view`    |
| POST   | `/hr/relations/surveys`               | `survey:create`  |
| GET    | `/hr/relations/surveys/:id`           | `survey:view`    |
| POST   | `/hr/relations/surveys/:id/publish`   | `survey:create`  |
| POST   | `/hr/relations/surveys/:id/close`     | `survey:create`  |
| POST   | `/hr/relations/surveys/:id/responses` | `survey:respond` |
| GET    | `/hr/relations/surveys/:id/results`   | `survey:view`    |

### Survey DTO

```json
{
  "title": "Q2 2026 Satisfaction Survey",
  "description": "Quarterly check-in on workplace satisfaction",
  "type": "SATISFACTION", // SATISFACTION | PULSE
  "anonymous": true,
  "questions": [
    { "id": "q1", "text": "I am satisfied with my role", "type": "rating_1_5" },
    {
      "id": "q2",
      "text": "I feel supported by my manager",
      "type": "rating_1_5"
    },
    {
      "id": "q3",
      "text": "What would improve your day-to-day?",
      "type": "text"
    },
    {
      "id": "q4",
      "text": "Would you recommend BLIH as a workplace?",
      "type": "nps_1_10"
    }
  ],
  "opensAt": "2026-06-25T00:00:00Z",
  "closesAt": "2026-07-05T23:59:59Z"
}
```

### State Machine

```
DRAFT ──publish──► ACTIVE ──close (manual or auto)──► CLOSED
```

### Response DTO

```json
{
  "responses": {
    "q1": 4,
    "q2": 5,
    "q3": "More flexibility on remote days",
    "q4": 9
  }
}
```

### Business Rules

1. `anonymous=true` → `SurveyResponse.employeeId` is set to `null`.
2. Auto-close when `closesAt` passes (cron `SurveyAutoCloseJob`).
3. Results endpoint returns:
   - Per-question averages, distribution, NPS.
   - Departmental cuts if non-anonymous.
   - Text response sampling (anonymised).
4. Unique constraint not enforced — a user can update responses if not anonymous.

## 11.5 Form 41 — Employee Suggestion

The `Survey` model is reused with `type=PULSE` + an open-ended-only questions list, OR a dedicated `EmployeeSuggestion` model (not in current schema — recommended addition).

### Recommended Addition

```prisma
model EmployeeSuggestion {
  id          String   @id @default(uuid()) @db.Uuid
  employeeId  String?  @db.Uuid             // null if anonymous
  category    String                        // PROCESS / TOOL / CULTURE / OTHER
  title       String
  description String   @db.Text
  status      String   @default("OPEN")     // OPEN / UNDER_REVIEW / ACCEPTED / IMPLEMENTED / DECLINED
  upvotes     Int      @default(0)
  reviewedById String? @db.Uuid
  reviewedAt   DateTime?
  responseNotes String? @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Endpoints under `/hr/relations/suggestions`.

## 11.6 Form 42 — Employee Recognition

### Endpoints

| Method | Path                                     | Permission             |
| ------ | ---------------------------------------- | ---------------------- |
| POST   | `/hr/relations/recognitions`             | `recognition:nominate` |
| GET    | `/hr/relations/recognitions`             | `recognition:view`     |
| GET    | `/hr/relations/recognitions/:id`         | `recognition:view`     |
| POST   | `/hr/relations/recognitions/:id/approve` | `recognition:approve`  |
| POST   | `/hr/relations/recognitions/:id/reject`  | `recognition:approve`  |
| GET    | `/hr/relations/recognitions/wall`        | `recognition:view`     |

### DTO

```json
{
  "nomineeEmployeeId": "uuid",
  "category": "INNOVATION", // EXCELLENCE/TEAMWORK/INNOVATION/SERVICE/OTHER
  "description": "Built the new caching layer that reduced costs by 30%",
  "impact": "Estimated $5K/mo savings",
  "suggestedAward": "GIFT_CARD_3000",
  "publicRecognition": true
}
```

### State Machine

```
PENDING ──HR approves──► APPROVED ──► (broadcast to wall if publicRecognition=true)
   │
   └──HR rejects──► REJECTED
```

### Business Rules

1. Nominator cannot be the same as nominee (self-recognition blocked).
2. `approvals` JSONB stores multi-level reviewers if needed (`{ manager: { decision, at }, hr: { ... } }`).
3. On approval with `publicRecognition=true`, broadcast via WebSocket to a `recognition-wall` room.
4. Recognitions feed into annual performance reviews as a positive signal.

## 11.7 Form 44 — Conflict Mediation

### Endpoints

| Method | Path                                           | Permission          |
| ------ | ---------------------------------------------- | ------------------- |
| POST   | `/hr/relations/mediations`                     | `mediation:request` |
| GET    | `/hr/relations/mediations`                     | `mediation:view`    |
| GET    | `/hr/relations/mediations/:id`                 | `mediation:view`    |
| POST   | `/hr/relations/mediations/:id/assign-mediator` | `mediation:mediate` |
| POST   | `/hr/relations/mediations/:id/log-session`     | `mediation:mediate` |
| POST   | `/hr/relations/mediations/:id/close`           | `mediation:mediate` |

### DTO

```json
{
  "otherPartyEmployeeId": "uuid",
  "nature": "Disagreement on project ownership and credit",
  "duration": "Past 3 months",
  "attemptedResolutions": "Direct conversations had limited success",
  "workImpact": "Slowed sprint velocity, team tension",
  "desiredOutcome": "Clear roles + shared ownership agreement"
}
```

### State Machine

```
PENDING ──mediator assigned──► IN_PROGRESS ──agreement──► AGREEMENT_REACHED ──close──► CLOSED
                                      │
                                      └──no agreement──► CLOSED
```

### Business Rules

1. Mediator must be neutral — neither manager of involved parties; HR or external.
2. `sessionDates` JSONB: array of session metadata `{ date, durationMinutes, summary }`.
3. Confidentiality: only requester, other party, mediator, and HR see records.

---

# 12. Subsystem 8 — Exit, Offboarding & Compliance

**Purpose:** Cleanly close out an employee's tenure: collect notice, run offboarding tasks, return assets, conduct exit interview, compute final settlement, and meet labour-law compliance.
**Forms covered (6):** Resignation, Exit Interview, Offboarding Checklist, Asset Return & Clearance, Experience Letter & Final Pay Request, Compliance Checklist.

## 12.1 End-to-End Offboarding Flow

```
[Employee]
   │  submits resignation
   ▼
┌──────────────────────────┐
│  Resignation (DRAFT)     │
└─────────┬────────────────┘
          │ submit
          ▼
┌──────────────────────────┐
│  Resignation (SUBMITTED) │ ──► Manager + HR notified
└─────────┬────────────────┘
          │ Manager + HR approves
          ▼
┌──────────────────────────┐
│  Resignation             │
│   (NOTICE_PERIOD)        │ ──► OffboardingChecklist + tasks created
└─────────┬────────────────┘                   │
          │                                    ▼
          ▼                          ┌─────────────────────┐
┌─────────────────────────┐          │ OffboardingTask×N   │
│  Resignation            │          │  (HR/IT/ADMIN/FIN/  │
│   (HANDOVER)            │          │   MANAGER)          │
└─────────┬───────────────┘          └─────────────────────┘
          │
          ▼
┌─────────────────────────┐
│  Resignation            │ ──► ExitInterview scheduled
│   (EXIT_PENDING)        │
└─────────┬───────────────┘                    │
          │ all tasks done                     ▼
          │                              ┌─────────────────────┐
          ▼                              │  AssetReturn        │
┌─────────────────────────┐              │   IT→Admin→Finance  │
│  Resignation            │ ◄────────────┤   signoff chain     │
│   (COMPLETED)           │              └─────────────────────┘
└─────────┬───────────────┘
          │
          ├─► FinalSettlement (computed + approved + paid)
          ├─► ComplianceChecklist (verified)
          ├─► UserLifecycle.status = RESIGNED/TERMINATED/RETIRED
          ├─► Keycloak user deactivated
          └─► Experience Letter generated
```

## 12.2 Form 45 — Employee Resignation

### Endpoints

| Method | Path                                        | Permission                           |
| ------ | ------------------------------------------- | ------------------------------------ |
| POST   | `/hr/offboarding/resignations`              | `resignation:submit` (self)          |
| GET    | `/hr/offboarding/resignations`              | `resignation:view`                   |
| GET    | `/hr/offboarding/resignations/:id`          | `resignation:view`                   |
| PATCH  | `/hr/offboarding/resignations/:id`          | `resignation:submit` (DRAFT only)    |
| POST   | `/hr/offboarding/resignations/:id/submit`   | `resignation:submit`                 |
| POST   | `/hr/offboarding/resignations/:id/approve`  | `resignation:approve`                |
| POST   | `/hr/offboarding/resignations/:id/withdraw` | `resignation:submit` (within window) |
| POST   | `/hr/offboarding/resignations/:id/complete` | `offboarding:complete`               |

### DTO

```json
{
  "proposedLastDay": "2026-07-20",
  "reason": "CAREER_GROWTH", // CAREER_GROWTH / SALARY / FAMILY / HEALTH / OTHER
  "reasonNotes": "Joining a senior role at a fintech startup",
  "handoverPlan": {
    "projects": [
      { "name": "Migration", "currentStatus": "70%", "handoverTo": "user-uuid" }
    ],
    "documentation": "Will draft runbook for cron jobs",
    "knowledgeTransfer": "2 sessions with team scheduled"
  }
}
```

### State Machine

```
DRAFT ──submit──► SUBMITTED ──HR/Mgr approve──► NOTICE_PERIOD ──► HANDOVER ──► EXIT_PENDING ──► COMPLETED
   │                  │
   │                  └──HR rejects (rare)──► (stays SUBMITTED for revision)
   │
   └──withdraw (within 24h after submit)──► (deleted)
```

### Notice Period & Validation Algorithm

```
function validateResignation(employeeId, proposedLastDay):
    emp = Employee.findById(employeeId)
    employment = emp.employment

    today = startOfDay(now)
    daysNotice = workingDaysBetween(today, proposedLastDay)

    # Ethiopian Labour Law notice periods (Article 35)
    requiredNotice = 0
    if onProbation(emp):
        requiredNotice = 7          # 1 week during probation
    elif employment.tenureYears < 1:
        requiredNotice = 30         # 1 month
    elif employment.tenureYears < 5:
        requiredNotice = 60         # 2 months
    else:
        requiredNotice = 90         # 3 months

    # Stored on Resignation as a validationResult JSON snapshot
    return {
        ok: daysNotice >= requiredNotice,
        daysNotice,
        requiredNotice,
        warnings: [...],
        criticalProjectsWarning: pendingCriticalProjects(employeeId),
        leaveBalanceOptions: {
          accruedLeaveDays: balance.unused,
          options: ['ENCASHMENT', 'USE_AS_NOTICE']
        }
    }
```

### Side Effects on Approval

`NOTICE_PERIOD` transition triggers:

1. Create `OffboardingChecklist` (see §12.4).
2. Auto-create department-segmented `OffboardingTask` rows.
3. Notify IT/Admin/Finance/Manager.
4. Block role/salary changes via guard.
5. Mark `Employee.employeeStatus` unchanged but `UserLifecycle` marked with `terminationReason`.

## 12.3 Form 46 — Exit Interview

### Endpoints

| Method | Path                                          | Permission                |
| ------ | --------------------------------------------- | ------------------------- |
| POST   | `/hr/offboarding/exit-interviews`             | `offboarding:task_update` |
| GET    | `/hr/offboarding/exit-interviews`             | `offboarding:view`        |
| GET    | `/hr/offboarding/exit-interviews/:id`         | `offboarding:view`        |
| POST   | `/hr/offboarding/exit-interviews/:id/conduct` | `offboarding:task_update` |

### Conduct DTO

```json
{
  "conductedAt": "2026-07-18T14:00:00Z",
  "questions": [
    { "id": "q1", "text": "Primary reason for leaving?" },
    { "id": "q2", "text": "What would have made you stay?" },
    { "id": "q3", "text": "Rate your overall experience (1-10)" }
  ],
  "answers": {
    "q1": "Career growth opportunities",
    "q2": "Clearer promotion path",
    "q3": 8
  },
  "wouldRecommend": true,
  "wouldReturn": true,
  "improvementNotes": "More structured 1:1s with manager"
}
```

### Business Rules

1. Mandatory before resignation can reach `COMPLETED` (configurable via `ModuleConfig.offboarding.requireExitInterview`).
2. Conducted by HR; recorded answers stored as JSONB.
3. Aggregated reports for trends (separate analytics endpoint).
4. Confidentiality: only HR sees individual answers; aggregates anonymized.

## 12.4 Form 47 — Offboarding Checklist

### Endpoints

| Method | Path                                                    | Permission                |
| ------ | ------------------------------------------------------- | ------------------------- |
| GET    | `/hr/offboarding/checklists`                            | `offboarding:view`        |
| GET    | `/hr/offboarding/checklists/:id`                        | `offboarding:view`        |
| POST   | `/hr/offboarding/checklists`                            | `offboarding:complete`    |
| POST   | `/hr/offboarding/checklists/:id/tasks/:taskId/complete` | `offboarding:task_update` |
| POST   | `/hr/offboarding/checklists/:id/complete`               | `offboarding:complete`    |

### Task Generation

On `Resignation.approve`, the system auto-creates tasks segmented by department:

| Department | Typical Tasks                                                            |
| ---------- | ------------------------------------------------------------------------ |
| `HR`       | Final paperwork, exit interview, experience letter, compliance checklist |
| `IT`       | Disable email, revoke system access, archive accounts, collect laptop    |
| `ADMIN`    | Recover access card, office key, parking permit                          |
| `FINANCE`  | Compute final settlement, pension/loan recovery, tax filing              |
| `MANAGER`  | Knowledge transfer sessions, project handover documentation              |

Each task has `dueDate` (typically `lastWorkingDay - N days`).

### Task State Machine

```
PENDING ──assignee starts──► IN_PROGRESS ──complete──► COMPLETED
                                  │
                                  └──missed deadline──► OVERDUE
```

### Business Rules

1. **Mandatory tasks** (`mandatory=true`) must be `COMPLETED` before checklist completes.
2. `OffboardingChecklistStatus`:
   - `PENDING` (no tasks done)
   - `IN_PROGRESS` (some done)
   - `COMPLETED` (all mandatory done)
3. Cron `OffboardingOverdueJob` flags tasks past `dueDate`.

## 12.5 Form 48 — Asset Return & Clearance

### Endpoints

| Method | Path                                                 | Permission                |
| ------ | ---------------------------------------------------- | ------------------------- |
| POST   | `/hr/offboarding/asset-returns`                      | `offboarding:task_update` |
| GET    | `/hr/offboarding/asset-returns/:id`                  | `offboarding:view`        |
| POST   | `/hr/offboarding/asset-returns/:id/it-sign-off`      | `asset:approve_it`        |
| POST   | `/hr/offboarding/asset-returns/:id/admin-sign-off`   | `asset:approve_admin`     |
| POST   | `/hr/offboarding/asset-returns/:id/finance-sign-off` | `asset:approve_finance`   |

### DTO

```json
{
  "checklistId": "uuid",
  "items": [
    {
      "assetType": "LAPTOP",
      "serialNumber": "BLIH-LAP-0042",
      "condition": "GOOD",
      "returnedAt": "2026-07-19",
      "notes": "Charger included"
    },
    {
      "assetType": "ACCESS_CARD",
      "serialNumber": "AC-1234",
      "condition": "DAMAGED",
      "notes": "Strap missing"
    }
  ],
  "depositReturn": 5000,
  "damageDeductions": 1500
}
```

### State Machine (Sequential Sign-Off)

```
PENDING ──IT signs off──► IT_SIGNED ──Admin signs off──► ADMIN_SIGNED ──Finance signs off──► FINANCE_SIGNED ──► COMPLETED
```

### Business Rules

1. `netAmount = depositReturn - damageDeductions`.
2. Each sign-off records `signedAt`; previous step must be complete.
3. On `COMPLETED`, link to `FinalSettlement` so deductions flow through.

## 12.6 Form 49 — Final Settlement & Experience Letter

### Endpoints

| Method | Path                                               | Permission                 |
| ------ | -------------------------------------------------- | -------------------------- |
| POST   | `/hr/offboarding/final-settlements`                | `final_settlement:compute` |
| GET    | `/hr/offboarding/final-settlements/:id`            | `final_settlement:view`    |
| POST   | `/hr/offboarding/final-settlements/:id/approve`    | `final_settlement:approve` |
| POST   | `/hr/offboarding/final-settlements/:id/mark-paid`  | `final_settlement:approve` |
| POST   | `/hr/offboarding/:resignationId/experience-letter` | `offboarding:complete`     |

### Final Settlement Computation Algorithm

```
function computeFinalSettlement(employeeId, resignationId, lastWorkingDay):
    emp = Employee.findById(employeeId)
    comp = emp.compensation

    # Earnings
    daysWorkedInLastMonth = workingDaysBetween(monthStart, lastWorkingDay)
    daysInLastMonth = workingDaysBetween(monthStart, monthEnd)
    proratedSalary = comp.baseSalary * (daysWorkedInLastMonth / daysInLastMonth)

    # Leave encashment (unused annual leave)
    leaveBalance = LeaveBalance.findUnique({ employeeId, leaveType: 'ANNUAL', year })
    unusedDays = leaveBalance.totalDays + leaveBalance.carriedOver - leaveBalance.usedDays
    dailyRate = comp.baseSalary / 22                # 22 working days standard
    leaveEncashment = unusedDays * dailyRate

    # Pro-rated bonus
    monthsServedThisYear = monthsBetween(jan1, lastWorkingDay)
    proratedBonus = (comp.bonusEligible && comp.bonusRate)
                    ? (comp.baseSalary * comp.bonusRate / 100 * monthsServedThisYear / 12)
                    : 0

    # Approved unpaid overtime in last cycle
    unpaidOvertimeMinutes = OvertimeRequest.sum where status='APPROVED' and not yet paid
    overtimePay = unpaidOvertimeMinutes / 60 * (dailyRate / 8) * 1.25       # 25% OT multiplier (Ethiopian Labour Law base; nights 50%, holidays 200%)

    # Allowances pro-rated
    allowances = sum(CompensationComponent where type='ALLOWANCE' and active)
                 * (daysWorkedInLastMonth / daysInLastMonth)

    grossEarnings = proratedSalary + leaveEncashment + proratedBonus + overtimePay + allowances

    # Deductions
    incomeTax = computeProgressiveTax(grossEarnings)         # Ethiopian PIT brackets
    pension = comp.baseSalary * 0.07                          # Employee 7%
    loanRecovery = sum(EmployeeLoanBalance.outstanding for employeeId)
    assetDeductions = assetReturn.damageDeductions ?? 0

    totalDeductions = incomeTax + pension + loanRecovery + assetDeductions

    netPayable = grossEarnings - totalDeductions

    return {
        earnings: {
            proratedSalary, leaveEncashment, proratedBonus,
            overtimePay, allowances, grossEarnings
        },
        deductions: {
            incomeTax, pension, loanRecovery, assetDeductions, totalDeductions
        },
        netPayable
    }
```

Result persisted as `FinalSettlement.earnings` and `FinalSettlement.deductions` (JSONB).

### Settlement Workflow

```
COMPUTED ──HR submits──► PENDING_APPROVAL ──Finance approves──► APPROVED ──paid out──► PAID
```

### Experience Letter

`POST /hr/offboarding/:resignationId/experience-letter`:

- Generates a templated PDF with:
  - Employee name, position, department, hire date, last working day
  - Brief role description
  - HR/CEO signature placeholders
- Stores in `EmployeeDocument` (type=`OTHER`, typeOther=`EXPERIENCE_LETTER`).
- Emails to employee's personal email.

## 12.7 Form 50 — Compliance Checklist (Labour Law)

### Endpoints

| Method | Path                                               | Permission             |
| ------ | -------------------------------------------------- | ---------------------- |
| POST   | `/hr/offboarding/compliance-checklists`            | `offboarding:complete` |
| GET    | `/hr/offboarding/compliance-checklists/:id`        | `offboarding:view`     |
| POST   | `/hr/offboarding/compliance-checklists/:id/verify` | `offboarding:complete` |

### DTO

```json
{
  "resignationId": "uuid",
  "terminationType": "RESIGNATION", // RESIGNATION | END_OF_CONTRACT | TERMINATION | LAYOFF
  "noticePeriodContractual": 60,
  "noticePeriodActual": 45,
  "payInLieu": true, // pay for shortfall
  "finalDues": {
    "noticePayInLieu": 15000,
    "severance": null
  },
  "terminationLetterSent": true,
  "exitInterviewDone": true,
  "clearanceCertificateDone": true,
  "unionNotified": false,
  "laborOfficeFiled": false,
  "noPendingClaims": true
}
```

### Verification Rules

Cannot mark resignation `COMPLETED` until:

- All `mandatory=true` offboarding tasks `COMPLETED`.
- `AssetReturn.status = COMPLETED`.
- `FinalSettlement.paidAt != null`.
- `ComplianceChecklist`:
  - `terminationLetterSent = true`
  - `exitInterviewDone = true` (if required by `ModuleConfig`)
  - `clearanceCertificateDone = true`
  - `noPendingClaims = true`
- `verifiedBy` set by HR.

### Side Effects on Completion

```
function completeResignation(resignationId):
    transaction:
        res = Resignation.findById(resignationId)
        assert allComplianceMet(res)

        res.status = 'COMPLETED'
        res.actualLastDay = ... (set from compliance)
        Resignation.update(...)

        # UserLifecycle update
        lifecycle = res.employee.lifecycle
        lifecycle.status = mapTerminationToLifecycle(compliance.terminationType)
        # RESIGNATION → RESIGNED
        # END_OF_CONTRACT or TERMINATION → TERMINATED
        # (RETIRED set manually elsewhere)
        lifecycle.terminatedAt = now
        lifecycle.terminationReason = res.reason
        lifecycle.offboardingCompleted = true
        lifecycle.noPendingClaims = compliance.noPendingClaims
        lifecycle.verifiedById = verifierId
        lifecycle.verifiedAt = now
        UserLifecycle.update(...)

        # Disable accounts
        KeycloakAdminService.disableUser(emp.user.keycloakId)
        User.update({ status: 'DISABLED' })

    notify HR + finance + manager (offboarding complete)
```

## 12.8 Notification Schedule

| Event                    | Channels     | Recipients                   |
| ------------------------ | ------------ | ---------------------------- |
| Resignation submitted    | IN_APP+EMAIL | Direct manager, HR           |
| Resignation approved     | IN_APP+EMAIL | Employee, IT, Admin, Finance |
| Task overdue             | IN_APP+EMAIL | Task assignee, HR            |
| Asset return signed-off  | IN_APP       | Next sign-off role           |
| Settlement approved      | IN_APP+EMAIL | Employee                     |
| Compliance verified      | IN_APP+EMAIL | HR + CEO                     |
| Last working day reached | IN_APP+EMAIL | All stakeholders             |

---

# 13. Cross-Cutting Modules

## 13.1 Audit Log

`AuditLog` is the immutable record of every state change.

### Endpoints

| Method | Path                          | Permission            |
| ------ | ----------------------------- | --------------------- |
| GET    | `/audit/records`              | `system_audit:view`   |
| GET    | `/audit/records/:id`          | `system_audit:view`   |
| POST   | `/audit/export`               | `system_audit:export` |
| GET    | `/audit/exports/:id`          | `system_audit:export` |
| GET    | `/audit/exports/:id/download` | `system_audit:export` |

### Filters

```
?action=leave.approve
&module=attendance
&resource=LeaveRequest
&resourceId=<uuid>
&actorUserId=<uuid>
&result=SUCCESS|FAILURE
&fromDate=2026-05-01
&toDate=2026-05-31
&page=1&pageSize=50
```

### Auto-Capture Decorator

```ts
@Audit({
  action: 'leave.approve',
  resource: 'LeaveRequest',
  loadBefore: true,           // snapshot state before mutation
  loadAfter: true,            // snapshot state after mutation
  metadata: (req) => ({ approverNotes: req.body.comments })
})
```

The interceptor:

1. **Pre-handler**: fetches `before` state if `loadBefore=true`.
2. **Post-handler**: fetches `after` state, builds the audit row, persists asynchronously.
3. **On exception**: persists row with `result=FAILURE`, `statusCode=4xx/5xx`, and error message.

### Export

`POST /audit/export` enqueues an async export job:

```json
{
  "format": "CSV",                     // CSV | JSON | PDF
  "filters": { ... }                   // same as list filters
}
```

Returns an `AuditExport` row with `status=PROCESSING`. Cron processes and updates `filePath` + `status=COMPLETED`.

### Retention

`AUDIT_RETENTION_DAYS` (env, default 365) — `CleanupAuditJob` purges older rows daily at 02:00.

## 13.2 Notifications

### Endpoints

| Method | Path                             | Permission                |
| ------ | -------------------------------- | ------------------------- |
| GET    | `/notifications`                 | (self)                    |
| GET    | `/notifications/:id`             | (self)                    |
| POST   | `/notifications/:id/read`        | (self)                    |
| POST   | `/notifications/read-all`        | (self)                    |
| GET    | `/notifications/unread-count`    | (self)                    |
| GET    | `/notifications/admin`           | `notifications:admin`     |
| POST   | `/notifications/admin/broadcast` | `notifications:broadcast` |
| GET    | `/webhooks`                      | `webhook:manage`          |
| POST   | `/webhooks`                      | `webhook:manage`          |
| PATCH  | `/webhooks/:id`                  | `webhook:manage`          |
| DELETE | `/webhooks/:id`                  | `webhook:manage`          |

### Notification DTO (admin broadcast)

```json
{
  "userIds": ["uuid", "uuid"], // or "all", or "byRole:hr_manager"
  "type": "ANNOUNCEMENT",
  "priority": "MEDIUM", // LOW | MEDIUM | HIGH | URGENT
  "title": "System maintenance Sunday 02:00",
  "body": "Brief downtime expected...",
  "payload": { "linkUrl": "/announcements/12" },
  "channels": ["IN_APP", "EMAIL"]
}
```

### Socket.IO Namespace

```
Namespace: /notifications
Auth: JWT in handshake.auth.token
Rooms: user:<userId>

Events emitted by server:
  - notification:new        { id, type, priority, title, body, createdAt }
  - notification:updated    { id, readAt }

Events from client:
  - mark-read               { id }
  - mark-all-read
```

### Webhook Endpoint Registry

`WebhookEndpoint` stores subscribed external listeners:

```json
{
  "name": "Finance Payroll Sync",
  "url": "https://finance.blih.local/hooks/payroll",
  "secret": "shared-hmac-secret",
  "enabled": true,
  "events": [
    "compensation.changed",
    "overtime.approved",
    "leave.approved",
    "resignation.completed"
  ]
}
```

On event publish, the system POSTs:

```json
{
  "event": "compensation.changed",
  "timestamp": "2026-05-21T10:00:00Z",
  "data": { ... },
  "signature": "sha256=hmac..."
}
```

Retry strategy: 3 attempts with exponential backoff (1m, 5m, 30m). Failures logged in `NotificationDelivery` (channel=`WEBHOOK`).

## 13.3 System Configuration

### Endpoints

| Method | Path                             | Permission             |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/system-config`                 | `system_config:view`   |
| GET    | `/system-config/:key`            | `system_config:view`   |
| PUT    | `/system-config/:key`            | `system_config:update` |
| GET    | `/system-config/modules`         | `system_config:view`   |
| PATCH  | `/system-config/modules/:module` | `system_config:update` |
| GET    | `/system-config/security`        | `system_config:view`   |
| PATCH  | `/system-config/security`        | `system_config:update` |

### Conventions

- `SystemConfig.key` is a dot-namespaced string (`recruitment.allowHrAutoApprove`, `leave.defaultEntitlements.ANNUAL`, etc.).
- Values are JSON (always — even primitives wrapped).
- `ModuleConfig.module` is the module name (`recruitment`, `onboarding`, `attendance`, etc.). `enabled` toggles entire module. `settings` is the module's config JSON.
- `SecurityPolicy` is a single row managed via `/security`.

### Key Module Settings (Recommended Initial)

```json
{
  "recruitment": {
    "allowHrAutoApprove": true,
    "requireFinanceApprovalForOffers": true,
    "minDaysToNeededBy": 7
  },
  "onboarding": {
    "requireExitInterview": true
  },
  "leave": {
    "defaultEntitlements": {
      "ANNUAL": { "FULL_TIME": 14 },
      "SICK": { "FULL_TIME": 180 },
      "MATERNITY": { "FULL_TIME": 120 },
      "PATERNITY": { "FULL_TIME": 3 },
      "BEREAVEMENT": { "FULL_TIME": 3 },
      "EMERGENCY": { "FULL_TIME": 5 }
    },
    "minHandoverDelegateThresholdDays": 5
  },
  "attendance": {
    "correctionWindowDays": 14
  },
  "probation": {
    "durationDaysByType": { "FULL_TIME": 60, "CONTRACT": 30, "INTERN": 30 }
  },
  "training": {
    "financeApprovalThreshold": 10000
  },
  "asset": {
    "financeApprovalThreshold": 5000
  },
  "audit": {
    "retentionDays": 365
  }
}
```

## 13.4 Policy Management

### Endpoints

| Method | Path                                            | Permission      |
| ------ | ----------------------------------------------- | --------------- |
| GET    | `/hr/policies`                                  | `policy:view`   |
| GET    | `/hr/policies/:id`                              | `policy:view`   |
| POST   | `/hr/policies`                                  | `policy:manage` |
| PATCH  | `/hr/policies/:id`                              | `policy:manage` |
| POST   | `/hr/policies/:id/versions`                     | `policy:manage` |
| POST   | `/hr/policies/:id/versions/:versionId/activate` | `policy:manage` |
| GET    | `/hr/policies/active`                           | `policy:view`   |

### Policy DTO

```json
{
  "title": "Code of Conduct",
  "description": "Behavioural standards for all employees",
  "isMandatory": true,
  "isActive": true,
  "effectiveDate": "2026-01-01",
  "expiryDate": null,
  "dependencies": [],
  "priority": 1
}
```

### Version DTO

```json
{
  "version": 2,
  "content": "Markdown body or plain text...",
  "fileId": "uuid" // optional reference to PolicyFile
}
```

### Business Rules

1. Only one `PolicyVersion.isActive=true` per policy at a time (enforced in `activate` transaction — flips others to `false`).
2. Activating a new version creates a re-acknowledgement task for every active employee.
3. `priority` orders the acknowledgement screen.

## 13.5 RBAC Management

### Endpoints

| Method | Path                                        | Permission           |
| ------ | ------------------------------------------- | -------------------- |
| GET    | `/rbac/roles`                               | `system_role:view`   |
| POST   | `/rbac/roles`                               | `system_role:manage` |
| PATCH  | `/rbac/roles/:id`                           | `system_role:manage` |
| DELETE | `/rbac/roles/:id`                           | `system_role:manage` |
| POST   | `/rbac/roles/:id/permissions`               | `system_role:manage` |
| DELETE | `/rbac/roles/:id/permissions/:permissionId` | `system_role:manage` |
| GET    | `/rbac/permissions`                         | `system_role:view`   |
| GET    | `/rbac/users/:userId/roles`                 | `system_role:view`   |
| POST   | `/rbac/users/:userId/roles`                 | `system_role:manage` |
| DELETE | `/rbac/users/:userId/roles/:roleId`         | `system_role:manage` |
| GET    | `/rbac/users/:userId/effective-permissions` | `system_role:view`   |

### Business Rules

1. `Role.isSystem=true` rows are immutable (cannot delete or rename, only edit permission set).
2. Role hierarchy (`parentRoleId`) enables permission inheritance with cycle detection.
3. `UserRole.expiresAt` enables time-bound role grants (e.g., temporary admin during cover).
4. Permissions are seeded by `seed:rbac` migration with the catalog in §3.4.4.

---

# 14. Background Jobs & Automation

## 14.1 Cron Job Catalog

| Job                            | Schedule             | Purpose                                                      |
| ------------------------------ | -------------------- | ------------------------------------------------------------ |
| `SyncUsersJob`                 | every 15 min         | Pull Keycloak users → upsert local `User` rows               |
| `SyncRolesJob`                 | every 30 min (gated) | Pull Keycloak realm roles if `SYNC_ROLES_FROM_KEYCLOAK=true` |
| `RotateClientSecretsJob`       | daily 03:00          | (stub) — rotate service account secrets                      |
| `CleanupAuditJob`              | daily 02:00          | Purge `AuditLog` older than `AUDIT_RETENTION_DAYS`           |
| `AttendanceReconciliationJob`  | daily 00:15          | Reconcile yesterday's attendance, mark ABSENT/HALF_DAY       |
| `DocumentExpiryJob`            | daily 09:00          | Notify on `EmployeeDocument.expiryDate` within 60/30/7 days  |
| `CertificationExpiryJob`       | daily 09:00          | Same for `TrainingCompletion.expiryDate`                     |
| `TimesheetGenerationJob`       | Sunday 23:30         | Pre-fill weekly timesheets in `DRAFT`                        |
| `OfferExpiryJob`               | daily 08:00          | Move `SENT` offers past `expiresAt` to `EXPIRED`             |
| `ProbationCheckpointReminders` | daily 08:00          | Day 25 (heads-up), Day 50 (urgent), Day 58 (escalation)      |
| `LeaveReminderJob`             | daily 08:00          | Remind approvers of pending leave > 24h                      |
| `OkrStatusRefreshJob`          | hourly               | Recompute OKR/KR `status` based on time-vs-progress          |
| `SurveyAutoCloseJob`           | hourly               | Close surveys past `closesAt`                                |
| `IncidentSlaJob`               | hourly               | Escalate incidents past `investigationDueAt`                 |
| `OffboardingOverdueJob`        | daily 09:00          | Flag tasks past `dueDate` as `OVERDUE`                       |
| `BalanceCarryoverJob`          | yearly 1 Jan 00:30   | Carry over unused annual leave per policy                    |
| `ContractRenewalReminders`     | daily 09:00          | 90/60/30/7 days before contract `effectiveTo`                |

## 14.2 Job Implementation Pattern

```ts
@Injectable()
export class AttendanceReconciliationJob {
  constructor(
    private prisma: PrismaService,
    private reconciler: AttendanceReconciliationService,
    private logger: Logger,
  ) {}

  @Cron('0 15 0 * * *', { name: 'attendance-reconciliation' })
  async handleCron() {
    const correlationId = randomUUID();
    this.logger.log(
      { correlationId, job: 'AttendanceReconciliationJob' },
      'Start',
    );
    try {
      const yesterday = subDays(startOfDay(new Date()), 1);
      const employees = await this.prisma.employee.findMany({
        where: {
          lifecycle: {
            status: { notIn: ['TERMINATED', 'RESIGNED', 'RETIRED'] },
          },
        },
        select: { id: true },
      });
      for (const e of employees) {
        await this.reconciler.reconcile(e.id, yesterday);
      }
      this.logger.log(
        { correlationId, processed: employees.length },
        'Complete',
      );
    } catch (err) {
      this.logger.error({ correlationId, err }, 'Job failed');
      // Never throw — cron should keep running
    }
  }
}
```

## 14.3 HR Automation Opportunities (Per Source Spec)

| #   | Process                  | What's Automated                           | Trigger                             | Potential                 |
| --- | ------------------------ | ------------------------------------------ | ----------------------------------- | ------------------------- |
| 1   | Leave Management         | Balance deduction on approval              | `LeaveRequest.approve`              | 95%                       |
| 2   | Attendance & Punctuality | Late detection, exception generation       | Punch-in event                      | 85%                       |
| 3   | Overtime Tracking        | Pull approved minutes to payroll           | `OvertimeRequest.approve` → webhook | 90%                       |
| 4   | Recruitment Request      | Multi-level approval w/ deadlines          | `JobRequestForm.submit`             | 80%                       |
| 5   | Job Application          | Scoring, invite, rejection emails          | `Applicant.create`                  | 75% (95% with AI parsing) |
| 6   | Interview Evaluation     | Real-time ranking                          | `InterviewFeedback.submit`          | 85%                       |
| 7   | Onboarding               | Account setup, checklist, doc verification | `Offer.accept`                      | 90%                       |
| 8   | Probation Reviews        | Day 30/55 auto-schedule                    | `ProbationPlan.start`               | 95%                       |
| 9   | Performance Reviews      | Pull OKRs, average scores                  | `Review.complete`                   | 80%                       |
| 10  | Training Requests        | Calendar + reminders                       | `TrainingRequest.approve`           | 85%                       |
| 11  | Satisfaction Surveys     | Aggregate to dashboard                     | `SurveyResponse.create`             | 90%                       |
| 12  | Promotion / Transfer     | Sync profile, salary, role                 | `InternalTransferRequest.approve`   | 85%                       |
| 13  | Resignation / Exit       | Handover + access deactivation             | `Resignation.complete`              | 95%                       |
| 14  | Payroll Generation       | Payslips + email                           | Approved timesheets + adjustments   | 90%                       |
| 15  | Employee Analytics       | Weekly/monthly summaries                   | Cron                                | 80%                       |
| 16  | Knowledge Capture        | Lessons to BLIH Brain                      | Post-exit + performance             | 70%                       |

**Target:** ≈ 85% of HR operations automated within 3–6 months of go-live.

---

# 15. API Conventions & Catalog

## 15.1 URL Conventions

- All endpoints prefixed with `/api/v1`.
- Resource paths use kebab-case (`/training-needs/assessments`).
- Domain prefixes: `/auth/...`, `/users/...`, `/rbac/...`, `/audit/...`, `/notifications/...`, `/system-config/...`, `/org/...`, `/hr/...`, `/public/...`.

## 15.2 Standard Verbs

| HTTP   | Pattern                  | Use                                                             |
| ------ | ------------------------ | --------------------------------------------------------------- |
| GET    | `/resource`              | List with filters + pagination                                  |
| GET    | `/resource/:id`          | Fetch one                                                       |
| POST   | `/resource`              | Create                                                          |
| PATCH  | `/resource/:id`          | Partial update                                                  |
| PUT    | `/resource/:id`          | Full replace (rare; prefer PATCH)                               |
| DELETE | `/resource/:id`          | Delete (soft when supported)                                    |
| POST   | `/resource/:id/<action>` | Domain action (submit, approve, reject, cancel, complete, etc.) |

## 15.3 Pagination

Standard query params:

```
?page=1&pageSize=20&sort=createdAt:desc
```

Response `meta.pagination`:

```json
{ "page": 1, "pageSize": 20, "total": 187, "totalPages": 10 }
```

`pageSize` capped at 100.

## 15.4 Filtering Conventions

- Equality: `?status=APPROVED`
- Multiple values: `?status=PENDING,APPROVED`
- Date range: `?fromDate=2026-01-01&toDate=2026-12-31`
- Full-text search: `?search=<term>`
- Nested association: `?departmentId=<uuid>` (server resolves the join)

## 15.5 Endpoint Catalog (Domain Index)

| Domain          | Path Root                                                                                                                                                                                                                 | Permission Prefix                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Authentication  | `/auth/*`                                                                                                                                                                                                                 | —                                                                                                         |
| Identity & RBAC | `/users/*`, `/rbac/*`                                                                                                                                                                                                     | `employee:*`, `system_role:*`                                                                             |
| Audit           | `/audit/*`                                                                                                                                                                                                                | `system_audit:*`                                                                                          |
| Notifications   | `/notifications/*`, `/webhooks/*`                                                                                                                                                                                         | —                                                                                                         |
| System Config   | `/system-config/*`                                                                                                                                                                                                        | `system_config:*`                                                                                         |
| Organization    | `/org/departments/*`, `/org/positions/*`, `/org/job-grades/*`, `/org/countries/*`, `/org/holidays/*`                                                                                                                      | `department:*`, `position:*`, `job_grade:*`                                                               |
| Recruitment     | `/hr/recruitment/*`                                                                                                                                                                                                       | `recruitment_request:*`, `job_posting:*`, `applicant:*`, `interview:*`, `offer:*`                         |
| Public Careers  | `/public/jobs/*`                                                                                                                                                                                                          | —                                                                                                         |
| Onboarding      | `/hr/onboarding/*`, `/hr/onboarding-tasks/*`                                                                                                                                                                              | `onboarding:*`                                                                                            |
| Probation       | `/hr/probation/*`, `/hr/kpis/*`                                                                                                                                                                                           | `probation:*`, `kpi:*`                                                                                    |
| Employees       | `/hr/employees/*`, `/hr/job-descriptions/*`, `/hr/contract-templates/*`                                                                                                                                                   | `employee:*`, `job_description:*`, `contract:*`                                                           |
| Attendance      | `/hr/attendance/*`, `/hr/leave/*`, `/hr/timesheets/*`                                                                                                                                                                     | `attendance:*`, `leave:*`, `timesheet:*`, `overtime:*`, `flex_work:*`                                     |
| Performance     | `/hr/performance/*`, `/hr/okrs/*`                                                                                                                                                                                         | `performance:*`, `okr:*`                                                                                  |
| Career          | `/hr/career-plans/*`, `/hr/transfer-requests/*`, `/hr/promotion-proposals/*`, `/hr/salary-adjustments/*`, `/hr/succession-plans/*`, `/hr/training-needs/*`                                                                | `career_plan:*`, `transfer_request:*`, `promotion_proposal:*`, `salary_adjustment:*`, `succession_plan:*` |
| Training        | `/hr/training/*`, `/hr/skills/*`, `/hr/training-budgets/*`                                                                                                                                                                | `training:*`, `skill:*`                                                                                   |
| Relations       | `/hr/relations/incidents/*`, `/hr/relations/disciplinary-actions/*`, `/hr/relations/grievances/*`, `/hr/relations/recognitions/*`, `/hr/relations/surveys/*`, `/hr/relations/mediations/*`, `/hr/relations/suggestions/*` | `incident:*`, `disciplinary:*`, `grievance:*`, `recognition:*`, `survey:*`, `mediation:*`                 |
| Offboarding     | `/hr/offboarding/*`                                                                                                                                                                                                       | `resignation:*`, `offboarding:*`, `final_settlement:*`                                                    |
| Policies        | `/hr/policies/*`                                                                                                                                                                                                          | `policy:*`                                                                                                |

---

# 16. Implementation Roadmap

## 16.1 Phased Delivery

```
PHASE 1 — Foundation (Weeks 1–3)
├── Identity + Keycloak integration
├── RBAC + permissions catalog seed
├── Organization (Departments, Positions, JobGrades)
├── Employee core model + lifecycle
└── Audit + notifications + system config skeleton

PHASE 2 — People Pipeline (Weeks 4–6)
├── Recruitment subsystem (forms 1-6)
├── Onboarding (forms 7-10)
├── Profile sub-entities + verification flow
└── Document store + contract module

PHASE 3 — Time & Attendance (Weeks 7–9)
├── Work schedules + holidays
├── Leave (form 19) with balance + Ethiopian Labour Law defaults
├── Attendance reconciliation + timesheet (forms 20-22)
├── Overtime + flex work (forms 23-24)
└── Probation (forms 11-13)

PHASE 4 — Growth & Development (Weeks 10–12)
├── Performance reviews + calibration (form 25)
├── OKR + key results + manager review (forms 26-28)
├── Training catalog + requests + budget (forms 34-37)
├── Career planning + skill gap (forms 29-30, 36)
├── Internal transfers + promotions + salary adjustment (forms 31-33)
└── Succession planning

PHASE 5 — Culture & Exit (Weeks 13–14)
├── Surveys + recognitions + incidents + grievances (forms 38-44)
├── Resignation + offboarding checklists (forms 45-47)
├── Asset return + final settlement + compliance (forms 48-50)
└── End-to-end smoke tests, performance load tests

PHASE 6 — Automation Layer (Weeks 15–16)
├── Webhook integration with Finance/IT
├── n8n workflow stitching
├── Cron jobs hardened
├── Dashboard + analytics endpoints
└── Production cutover + change management
```

**Total estimate:** 12–16 weeks (matches gap analysis in `Recruitment-Onboarding-Flow-Analysis.md`).

## 16.2 Definition of Done (Per Subsystem)

A subsystem is "done" when:

1. **Schema migration** committed & rollback-safe.
2. **Seed data** provided (KPI library, default schedules, policies, holidays).
3. **All endpoints** documented in OpenAPI, accessible at `/docs`.
4. **Permission slugs** seeded in `Permission` table and assigned to default roles.
5. **State machine** tested with unit tests for every transition (valid + invalid).
6. **Audit** decorator applied to every state-changing endpoint.
7. **Notifications** for state changes implemented (at minimum `IN_APP`).
8. **Integration tests** cover happy path + 2 edge cases per main entity.
9. **Cron jobs** registered and idempotent.
10. **README** in `domains/hr/<subsystem>/README.md` with quickstart.

## 16.3 Cross-Cutting Standards

### Naming

- DTOs: `Create<Resource>Dto`, `Update<Resource>Dto`, `<Action><Resource>Dto`.
- Services: `<Resource>Service`, `<UseCase>UseCase`.
- Controllers: `<Resource>Controller`.

### Error Handling

- Use `HttpException` subclasses (`BadRequestException`, `UnprocessableEntityException`, etc.).
- Custom `DomainRuleViolationException` (422) for business-rule failures.
- Never expose stack traces to clients.

### Logging

- Use structured logger (`pino` or NestJS Logger configured for JSON).
- Always include `correlationId`.
- Levels: `error`, `warn`, `info`, `debug`. Use `info` for state changes.

### Testing

- Unit tests: business logic, state machines, validation.
- Integration tests: Prisma + service composition with test DB.
- E2E tests: real HTTP requests with Keycloak token stubs.
- Target ≥ 80% coverage on domain modules.

### Performance

- Index every foreign key (`@@index` in Prisma — already comprehensive).
- Avoid N+1 queries: use Prisma's `include`/`select` carefully.
- Pagination is mandatory on list endpoints (no unbounded fetches).
- Heavy aggregations (audit exports, payroll calc) run as async jobs.

### Security Checklist

- All endpoints require `KeycloakAuthGuard` except `/public/*` and `/auth/*`.
- All state-changing endpoints have explicit `@Roles(...)` permission.
- DTO validation via `class-validator`; whitelist mode on (`ValidationPipe { whitelist: true, forbidNonWhitelisted: true }`).
- File uploads validated for mime type and size limits.
- Rate-limiting at edge (NGINX/CloudFront) for public endpoints.
- SQL injection: not possible via Prisma; raw queries forbidden.
- CSRF: handled by token-based auth (no cookies for state-changing requests).

---

## Appendix A — Enum Reference

A consolidated cheat-sheet of enums used across the system:

**Workflow / Generic:**

- `RequestWorkflowStatus`: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
- `ApprovalDecision`: PENDING, APPROVED, REJECTED
- `VerificationStatus`: PENDING_REVIEW, VERIFIED, REJECTED

**User / Employee:**

- `UserStatus`: ACTIVE, DISABLED, PENDING
- `LifecycleStatus`: ONBOARDING, ACTIVE, SUSPENDED, ON_LEAVE, TERMINATED, RESIGNED, RETIRED
- `EmployeeStatus`: ONBOARDING, ON_PROBATION, ACTIVE
- `EmploymentType`: FULL_TIME, PART_TIME, CONTRACT, INTERN, TEMPORARY
- `PayFrequency`: MONTHLY, BIWEEKLY, WEEKLY, ANNUAL
- `Gender`: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
- `MaritalStatus`: SINGLE, MARRIED, DIVORCED, WIDOWED, SEPARATED
- `GovernmentIdCardType`: KEBELE_ID, PASSPORT, FAYDA, OTHER

**Recruitment:**

- `JobWorkflowStatus`: DRAFT, PENDING_FOR_APPROVAL, READY_TO_POST, PUBLISHED, CLOSED, REJECTED
- `JobApprovalStage`: FINANCE, GM, HR_REVIEW
- `ApplicantStatus`: APPLIED, SCREENING, SHORTLISTED, INTERVIEW, WAITLIST, OFFER, HIRED, REJECTED, WITHDRAWN
- `OfferStatus`: DRAFT, SENT, ACCEPTED, DECLINED, EXPIRED, WITHDRAWN
- `InterviewStatus`: SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
- `EndorsementLevel`: STRONG_YES, YES, UNCERTAIN, NO
- `CvScreeningRecommendation`: STRONG_RECOMMEND, RECOMMEND, CONSIDER, REJECT
- `CvScreeningStageType`: INITIAL_SCREENING, TECHNICAL_REVIEW, HR_REVIEW, MANAGER_REVIEW, FINAL_DECISION, CUSTOM

**Probation:**

- `ProbationStatus`: NOT_STARTED, IN_PROGRESS, COMPLETED, CANCELLED, FAILED, EXTENDED
- `ProbationOutcome`: CONFIRMED, EXTENDED, TERMINATED, RESIGNED

**Attendance / Leave:**

- `LeaveType`: ANNUAL, SICK, MATERNITY, PATERNITY, BEREAVEMENT, UNPAID, STUDY, EMERGENCY, COMPASSIONATE
- `LeaveRequestStatus`: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
- `AttendanceStatus`: PRESENT, ABSENT, LATE, EARLY_DEPARTURE, ON_LEAVE, HALF_DAY, REMOTE, BUSINESS_TRIP
- `FlexWorkRequestType`: WORK_FROM_HOME, FLEX_TIME

**Performance / OKR:**

- `ReviewStatus`: NOT_STARTED, SELF_PENDING, SELF_SUBMITTED, MANAGER_PENDING, MANAGER_SUBMITTED, COMPLETED
- `PerformanceCategory`: UNSATISFACTORY, BELOW_EXPECTATIONS, MEETS_EXPECTATIONS, EXCEEDS_EXPECTATIONS, OUTSTANDING
- `PerformanceFeedbackRole`: SELF, MANAGER, PEER, SKIP_LEVEL, DIRECT_REPORT
- `OkrStatus`: DRAFT, ACTIVE, AT_RISK, DELAYED, ACHIEVED, PARTIALLY_ACHIEVED, MISSED, COMPLETED
- `KeyResultType`: NUMERIC, PERCENTAGE, BOOLEAN, MILESTONE
- `OkrScope`: COMPANY, DEPARTMENT, USER

**Training:**

- `TrainingRequestStatus`: DRAFT, PENDING, APPROVED, REJECTED, CANCELLED
- `TrainingType`: SKILL, COMPLIANCE, LEADERSHIP, OTHER
- `CompletionStatus`: COMPLETED, PARTIAL, DROPPED
- `SkillLevel`: BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
- `SkillSource`: SELF, MANAGER, ASSESSMENT, TRAINING
- `CostPayer`: COMPANY, SELF
- `FeedbackType`: COURSE, TRAINER, PROVIDER
- `FeedbackRatingScale`: ONE_TO_FIVE, ONE_TO_TEN
- `FeedbackSubmissionType`: ANONYMOUS, IDENTIFIED, MANAGER_ONLY

**Talent / Career:**

- `SuccessionReadiness`: READY_NOW, ONE_YEAR, TWO_YEARS
- `SuccessionRiskLevel`: LOW, MEDIUM, HIGH, CRITICAL
- `PromotionProposalStatus`: PENDING, APPROVED, REJECTED
- `CareerDevelopmentPlanStatus`: DRAFT, ACTIVE, COMPLETED, CANCELLED
- `InternalTransferType`: PROMOTION, TRANSFER
- `SalaryAdjustmentReason`: MERIT, EQUITY, PROMOTION, TRANSFER, RETENTION, MARKET

**Relations:**

- `IncidentType`: SAFETY, SECURITY, CONFLICT, HARASSMENT, OTHER
- `IncidentSeverity`: LOW, MEDIUM, HIGH, CRITICAL
- `IncidentReportStatus`: OPEN, INVESTIGATING, RESOLVED
- `DisciplinaryIncidentType`: ATTENDANCE_VIOLATION, PERFORMANCE_ISSUE, CODE_OF_CONDUCT
- `DisciplinaryActionType`: VERBAL_WARNING, WRITTEN_WARNING, FINAL_WARNING, PERFORMANCE_IMPROVEMENT_PLAN, SUSPENSION, TERMINATION
- `DisciplinaryStatus`: PENDING, ACTIVE, EXPIRED, APPEALED
- `GrievanceStatus`: OPEN, INVESTIGATING, RESOLVED, CLOSED
- `RecognitionCategory`: EXCELLENCE, TEAMWORK, INNOVATION, SERVICE, OTHER
- `RecognitionStatus`: PENDING, APPROVED, REJECTED
- `SurveyType`: SATISFACTION, PULSE
- `SurveyStatus`: DRAFT, ACTIVE, CLOSED
- `MediationStatus`: PENDING, IN_PROGRESS, AGREEMENT_REACHED, CLOSED

**Offboarding:**

- `ResignationStatus`: DRAFT, SUBMITTED, NOTICE_PERIOD, HANDOVER, EXIT_PENDING, COMPLETED
- `OffboardingTaskDepartment`: HR, IT, ADMIN, FINANCE, MANAGER
- `OffboardingTaskStatus`: PENDING, IN_PROGRESS, COMPLETED, OVERDUE
- `OffboardingChecklistStatus`: PENDING, IN_PROGRESS, COMPLETED
- `TerminationType`: RESIGNATION, END_OF_CONTRACT, TERMINATION, LAYOFF
- `AssetReturnStatus`: PENDING, IT_SIGNED, ADMIN_SIGNED, FINANCE_SIGNED, COMPLETED

---

## Appendix B — Identifier Formats

| Entity                | Format                   | Example                           |
| --------------------- | ------------------------ | --------------------------------- |
| Job Request           | `REQ-<year>-NNNN`        | `REQ-2026-0042`                   |
| Job Posting           | `slug` (unique URL key)  | `senior-backend-engineer-2026-q3` |
| Offer                 | `OFR-<year>-NNNN`        | `OFR-2026-0017`                   |
| Employee Code         | `BLIH-EMP-NNNN`          | `BLIH-EMP-0042`                   |
| Leave Request         | `LV-<year>-NNNN`         | `LV-2026-0123`                    |
| Attendance Correction | `AC-<year>-NNNN`         | `AC-2026-0045`                    |
| Overtime Request      | `OT-<year>-NNNN`         | `OT-2026-0089`                    |
| Flex Work Request     | `FW-<year>-NNNN`         | `FW-2026-0012`                    |
| Internal Transfer     | `TR-<year>-NNNN`         | `TR-2026-0008`                    |
| Salary Adjustment     | `SA-<year>-NNNN`         | `SA-2026-0014`                    |
| Timesheet             | `TS-<year>-WW-<empCode>` | `TS-2026-21-BLIH-EMP-0042`        |
| Incident Report       | `INC-<year>-NNN`         | `INC-2026-007`                    |

---

## Appendix C — Ethiopian Labour Law Defaults

The system encodes these defaults; all overridable per `ModuleConfig`.

| Area                            | Default                             | Source                                       |
| ------------------------------- | ----------------------------------- | -------------------------------------------- |
| Probation period                | 60 days                             | Article 11(3), Labour Proclamation 1156/2019 |
| Notice during probation         | 7 days                              | Article 35                                   |
| Notice for <1 year service      | 30 days                             | Article 35                                   |
| Notice for 1–5 years service    | 60 days                             | Article 35                                   |
| Notice for 5+ years service     | 90 days                             | Article 35                                   |
| Annual leave (years 1–3)        | 14 working days                     | Article 76                                   |
| Annual leave year 4             | 16 working days                     | Article 76                                   |
| Annual leave year 6+            | 16 + 1 day per 2 years thereafter   | Article 76                                   |
| Sick leave                      | 6 months max with sliding pay scale | Article 86                                   |
| Maternity leave                 | 120 days (30 pre + 90 post)         | Article 88                                   |
| Paternity leave                 | 3 days                              | Article 81(3)                                |
| Bereavement leave               | 3 days                              | Article 81                                   |
| Overtime — base                 | +25%                                | Article 68                                   |
| Overtime — nights               | +50%                                | Article 68                                   |
| Overtime — public holidays      | +100% (i.e., 200% total)            | Article 68                                   |
| Pension contribution (employee) | 7%                                  | Pension proclamation                         |
| Pension contribution (employer) | 11%                                 | Pension proclamation                         |

---

## Appendix D — Glossary

| Term                  | Meaning                                                                                  |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Aggregate Root**    | The primary entity controlling a domain (e.g., `Employee`, `Resignation`)                |
| **Approval Step**     | One row in a multi-stage approval chain                                                  |
| **Checklist**         | Collection of `OnboardingTaskInstance` or `OffboardingTask` rows assigned to an employee |
| **Effective Date**    | When a change becomes operationally true                                                 |
| **History Row**       | Append-only record of a past state                                                       |
| **Lifecycle State**   | The operational employee status (`UserLifecycle.status`)                                 |
| **Permission Slug**   | `<resource>:<action>` string used in `@Roles()`                                          |
| **Snapshot Pattern**  | Cloning a library template into an instance to preserve historical accuracy              |
| **State Machine**     | Explicit enumerated states with documented transitions                                   |
| **Sub-Entity**        | Profile section that goes through PENDING_REVIEW → VERIFIED/REJECTED                     |
| **Verification Gate** | HR step required before personal data is treated as truth                                |

---

## End of Document

> **Total scope covered:** 8 subsystems · 50 forms · ~100 models · ~250+ endpoints · Ethiopian Labour Law compliance · ≈85% automation target.
>
> Maintain this document alongside the Prisma schema. When you add a new model or endpoint, add the corresponding section here and bump the version at the top.
