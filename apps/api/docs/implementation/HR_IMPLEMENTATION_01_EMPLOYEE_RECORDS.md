# HR Implementation Plan 1: Employee (Records) Subsystem

**Version:** 1.1  
**Last Updated:** February 2026  
**Status:** Implemented (Phase 1)  
**Implementation order:** 1 (after cross-cutting Approval/Notifications if any)

**Note:** Employees **do not** require approval to change or update their own profile. Profile updates use the existing **PUT /users/:userId/profile** (and employment/compensation/lifecycle) endpoints with RBAC; no ProfileChangeRequest workflow is implemented.

---

## 1. Overview and Objectives

### 1.1 Purpose

The Employee Records subsystem is the central registry for all staff data. It builds on the existing **User**, **UserProfile**, **UserEmployment**, **UserCompensation**, **UserCompensationHistory**, and **UserLifecycle** models to deliver:

- Full employee profile management (employees may update their own profile directly; no approval workflow)
- Document and contract lifecycle (upload, expiry tracking, archival)
- Salary history and compensation change workflow (existing endpoints)
- Job descriptions and KPI linkage
- Integration point for onboarding, attendance, performance, and offboarding

### 1.2 Goals

- Extend current schema only where necessary (documents, contracts, job descriptions); **no** ProfileChangeRequest
- Document expiry tracking and notifications (scheduled job)
- Expose employee directory/list with filters (department, lifecycle, employment type)
- Align with HR_LOGIC field-level access via existing RBAC

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                                                                  |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §1 Global Business Rules, §4 Employee Records Logic (profile change, document expiry)                          |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Forms 14–18 (Employee Profile, Job Description & KPI, Contract, Salary History, Document Update)               |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flow 9: Employee Profile Management                                                                            |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | Core employees, §3 Employee Profiles & Records (job descriptions, contracts, salary history, document updates) |

---

## 2. Current State and Gaps

### 2.1 What Exists

- **Prisma:** `User`, `UserProfile`, `UserEmployment`, `UserCompensation`, `UserCompensationHistory`, `UserLifecycle`, `Department`, `CountryReference`
- **Core API:** `GET/PATCH /users/:id/profile`, employment, compensation, compensation history, lifecycle (see [apps/api/src/core/users](https://github.com/blih/blih-system/tree/main/apps/api/src/core/users))
- **Types:** [packages/types/src/users/user-profile.ts](https://github.com/blih/blih-system/tree/main/packages/types/src/users) — DTOs for profile, employment, compensation, lifecycle
- **RBAC:** Resources `user`, `employee`, `user_profile`, `user_employment`, `user_compensation`, `user_compensation_history`, `user_lifecycle` in seed manifest

### 2.2 Gaps

- No **EmployeeDocument** (or equivalent) for document types, file ref, issue/expiry, mandatory flag
- No **Contract** entity (type, start/end, document ref, trial period, sync to finance)
- No **JobDescription** (position, duties, KPIs, skills, link to performance)
- ~~Profile change approval workflow~~ **Not implemented:** employees update profile directly (no approval).
- ~~Document expiry job~~ **Implemented:** DocumentExpiryJob runs daily; creates notifications for 30-day and 7-day expiry.
- No **employee list/search** API with filters (department, lifecycle, employment type, job title)
- Optional: **DRAFT** lifecycle status for “new record not yet verified” (or use User status PENDING)

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum DocumentType {
  CONTRACT
  ID
  CERTIFICATE
  MEDICAL
  RESUME
  POLICY_ACK
  QUALIFICATION
  OTHER
}

enum ContractType {
  INITIAL
  RENEWAL
  AMENDMENT
  ADDENDUM
}

enum ContractStatus {
  DRAFT
  ACTIVE
  EXPIRED
  TERMINATED
  RENEWED
}

```

**Note:** `ProfileChangeStatus` and `ProfileChangeRequest` model are **not** implemented; employees update their profile directly without approval.

### 3.2 New Models

```prisma
model EmployeeDocument {
  id            String       @id @default(uuid()) @db.Uuid
  userId        String       @db.Uuid
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  type         DocumentType
  typeOther     String?      @map("type_other")
  fileUrl      String       @map("file_url")
  fileName     String?      @map("file_name")
  fileSizeBytes Int?        @map("file_size_bytes")
  mimeType     String?      @map("mime_type")
  issueDate    DateTime?    @map("issue_date") @db.Date
  expiryDate   DateTime?   @map("expiry_date") @db.Date
  isMandatory  Boolean     @default(false) @map("is_mandatory")
  verified     Boolean     @default(false)
  verifiedById  String?     @map("verified_by_id") @db.Uuid
  verifiedAt   DateTime?   @map("verified_at")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@index([userId])
  @@index([userId, type])
  @@index([expiryDate])
}

model Contract {
  id              String        @id @default(uuid()) @db.Uuid
  userId          String        @map("user_id") @db.Uuid
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  contractType    ContractType  @map("contract_type")
  sequenceNumber  Int           @map("sequence_number")
  startDate       DateTime      @map("start_date") @db.Date
  endDate         DateTime?     @map("end_date") @db.Date
  trialApplies    Boolean       @default(false) @map("trial_applies")
  trialEndDate    DateTime?     @map("trial_end_date") @db.Date
  trialConfirmed  Boolean       @default(false) @map("trial_confirmed")
  documentUrl     String?       @map("document_url")
  status          ContractStatus @default(DRAFT)
  syncedToFinance Boolean       @default(false) @map("synced_to_finance")
  syncedAt        DateTime?     @map("synced_at")
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([userId])
  @@index([userId, sequenceNumber])
  @@index([status])
  @@index([endDate])
}

model JobDescription {
  id          String   @id @default(uuid()) @db.Uuid
  departmentId String? @map("department_id") @db.Uuid
  department  Department? @relation(fields: [departmentId], references: [id], onDelete: SetNull)
  title       String
  level       String?  // JUNIOR, MID, SENIOR, LEAD, PRINCIPAL
  code        String?  @unique
  summary     String?  @db.Text
  duties      Json?    // string[]
  skills      Json?    // { skill, level }[]
  kpis        Json?    // { title, metric, target, frequency, weight }[]
  documentUrl String?  @map("document_url")
  version     Int      @default(1)
  effectiveFrom DateTime? @map("effective_from") @db.Date
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([departmentId])
  @@index([title])
}

```

**Omitted:** `ProfileChangeRequest` — not used; employees update profile directly.

### 3.3 Changes to Existing Models

- **User:** Add relations: `EmployeeDocument[]`, `Contract[]` (implemented; no ProfileChangeRequest).
- **Department:** Add `JobDescription[]` relation.
- **UserLifecycle:** Optionally add `DRAFT` to enum if product requires “unverified” state before ONBOARDING.

---

## 4. API Design

### 4.1 Base Path

- All under existing **Core** or under **HR domain**: e.g. `/api/v1/employees` (or keep `/api/v1/users` for core and add `/api/v1/hr/employees` for HR-specific list/search).

### 4.2 Endpoints

| Method | Path                                 | Description                                                                                    | Permission           |
| ------ | ------------------------------------ | ---------------------------------------------------------------------------------------------- | -------------------- |
| GET    | /employees                           | List employees (filter: departmentId, lifecycleStatus, employmentType, search)                 | employee:read / hr   |
| GET    | /employees/:id                       | Get full employee record (profile + employment + compensation + lifecycle + documents summary) | employee:read / self |
| GET    | /employees/:id/documents             | List documents                                                                                 | employee:read        |
| POST   | /employees/:id/documents             | Upload document                                                                                | employee:update / hr |
| PATCH  | /employees/:id/documents/:docId      | Update document (e.g. expiry, verify)                                                          | hr                   |
| GET    | /employees/:id/contracts             | List contracts                                                                                 | employee:read        |
| POST   | /employees/:id/contracts             | Create contract                                                                                | hr                   |
| PATCH  | /employees/:id/contracts/:contractId | Update contract status, sync to finance                                                        | hr                   |
| GET    | /job-descriptions                    | List job descriptions (filter: departmentId)                                                   | employee:read        |
| GET    | /job-descriptions/:id                | Get one                                                                                        | employee:read        |
| POST   | /job-descriptions                    | Create (HR)                                                                                    | hr                   |
| PATCH  | /job-descriptions/:id                | Update                                                                                         | hr                   |

Profile and employment updates use existing **PUT /users/:userId/profile** and **PUT /users/:userId/employment** (no approval workflow).

### 4.3 Use Cases (Backend)

- **ListEmployeesUseCase** — filters, pagination, RBAC (employee:view).
- **GetEmployeeFullUseCase** — aggregate profile, employment, compensation, lifecycle, documents count, contract summary.
- **CreateEmployeeDocumentUseCase** — validate type, store file ref, set expiry dates.
- **UpdateEmployeeDocumentUseCase** — update metadata, verification, expiry.
- **DocumentExpiryJob** — daily cron: find documents expiring in 30 and 7 days; create in-app notifications for employee.
- **CreateContractUseCase** — create contract, link document, set trial dates.
- **UpdateContractUseCase** — status, sync to finance webhook/config.
- **ListJobDescriptionsUseCase** / **GetJobDescriptionUseCase** / **CreateJobDescriptionUseCase** / **UpdateJobDescriptionUseCase** — CRUD with optional link to performance/OKR later.

---

## 5. Types and DTOs (packages/types)

### 5.1 New Exports

- **Enums:** `DocumentType`, `ContractType`, `ContractStatus`, `ProfileChangeStatus`
- **EmployeeDocument:** `CreateEmployeeDocumentDto`, `UpdateEmployeeDocumentDto`, `EmployeeDocumentResponseDto`
- **Contract:** `CreateContractDto`, `UpdateContractDto`, `ContractResponseDto`
- **JobDescription:** `CreateJobDescriptionDto`, `UpdateJobDescriptionDto`, `JobDescriptionResponseDto`
- **Employee list:** `ListEmployeesQueryDto`, `EmployeeListItemDto`, `EmployeeFullResponseDto` (or extend existing user DTOs)

---

## 6. Business Rules (from HR_LOGIC)

- **Profile change:** Not implemented; employees update their own profile directly via existing user profile endpoints (no approval matrix).
- **Document expiry:** Notify at 30 and 7 days via DocumentExpiryJob; on expiry document remains stored (optional: set status or suggest SUSPENDED for mandatory later).
- **Audit:** Use existing audit interceptor for API actions.

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations — **Done**

1. Added enums `DocumentType`, `ContractType`, `ContractStatus` and models `EmployeeDocument`, `Contract`, `JobDescription` to `schema.prisma` (no ProfileChangeRequest).
2. Added relations on `User` (employeeDocuments, contracts) and `Department` (jobDescriptions).
3. Run `npx prisma migrate dev` when DB is ready (migration may need to be created manually if shadow DB has issues).

### Phase 2: Types package — **Done**

4. Added `packages/types/src/employees/` (document, contract, job-description, employee-list); export from package index.

### Phase 3: Documents and contracts — **Done**

5. Implemented List/Create/Update employee documents and List/Create/Update contracts under `domains/hr`.
6. Exposed under `/hr/employees/:userId/documents` and `/hr/employees/:userId/contracts`. File URL is stored as provided (upload handled by client or separate storage service).

### Phase 4: Profile change workflow — **Skipped**

7. Employees update profile directly; no ProfileChangeRequest or approval workflow.

### Phase 5: Job descriptions — **Done**

8. Implemented JobDescription CRUD under `/hr/job-descriptions`.

### Phase 6: Employee list and full view — **Done**

9. Implemented ListEmployeesUseCase (filters: departmentId, lifecycleStatus, employmentType, search, page, limit) and GetEmployeeFullUseCase.
10. Exposed GET /hr/employees and GET /hr/employees/:id.

### Phase 7: Document expiry and notifications — **Done**

11. Implemented DocumentExpiryJob (daily 09:00): documents expiring in 30 and 7 days; creates in-app Notification for employee.

### Phase 8: RBAC and polish

12. Use existing `employee:view`, `employee:update`, `user_profile:view`, `user_profile:update`. Add integration tests and OpenAPI as needed.

---

## 8. Dependencies and Integration

- **Core Users:** Reuse User, UserProfile, UserEmployment, UserCompensation, UserLifecycle; no duplication.
- **Storage:** Use existing file/storage service for document and contract URLs.
- **Notifications:** Use Core Notifications for document expiry and profile change decisions.
- **Finance:** Contract “sync to finance” can be webhook or event; define contract payload later.
- **RBAC:** Enforce employee:read, employee:update, hr:\* as per existing manifest.

---

## 9. Testing

- Unit: Profile change rules (auto vs HR vs manager vs forbidden); document expiry logic.
- Integration: Create document, contract, profile change request; approve and verify user profile updated; list employees with filters.
- E2E: Employee uploads document, HR verifies; employee requests address change, HR approves; document expiry job creates notification.

---

## 10. Acceptance Criteria

- [x] Employee list and full view APIs work with filters and RBAC.
- [x] Profile updates remain direct (no approval); existing user profile endpoints used.
- [x] Documents and contracts can be created/updated; expiry dates stored.
- [x] Document expiry job runs daily and creates notifications at 30/7 days.
- [x] Job descriptions CRUD works; linked to department.
- [x] New entities use createdAt/updatedAt (optional createdBy/updatedBy can be added later).
