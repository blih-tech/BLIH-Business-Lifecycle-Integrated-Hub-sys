# Recruitment Module – Architecture Fixes Applied

This document summarizes the **critical fixes**, **structural improvements**, **enterprise enhancements**, and **data integrity** changes applied to the recruitment schema and related HR core.

---

## 1. Critical Fixes (Schema)

### 1.1 Contract version integrity

- **Before:** `@@index([userId, sequenceNumber])`
- **After:** `@@unique([userId, sequenceNumber])` (index removed; unique constraint ensures no duplicate sequence numbers per user).

### 1.2 Department hierarchy

- **Added:** `parentId`, `parent` (self-relation), `children`, `@@index([parentId])`.
- Enables division-level headcount and department-level approval flows.

### 1.3 RecruitmentRequest → replacementUser

- **Added:** `replacementUser User? @relation(..., fields: [replacementUserId], references: [id], onDelete: SetNull)`.
- FK and relation for replacement validation.

### 1.4 HiringDecision.employeeId → User

- **Added:** `employee User? @relation("HiringDecisionEmployee", ...)`.
- **Added:** `offerExpiresAt DateTime?` for offer expiry.
- Referential integrity for hired employee.

---

## 2. Structural Improvements

### 2.1 JobPosting position (relational + snapshot)

- **Before:** `position Json?`
- **After:** `positionId String?`, `position Position? @relation(...)`, `positionSnapshot Json?`.
- Position is relational; snapshot kept for audit. Create-job-posting use case sets `positionId` from request and `positionSnapshot` from payload.

### 2.2 Candidate structured fields

- **Added:** `email`, `phone`, `firstName`, `lastName` (all optional).
- **Kept:** `personalInfo Json?` for extra attributes.
- **Added:** `@@unique([jobPostingId, email])` to prevent duplicate applications per posting when email is set.

### 2.3 CvScreening uniqueness

- **Added:** `@@unique([candidateId, jobPostingId])` – one screening per candidate per posting.

### 2.4 InterviewFeedback uniqueness

- **Added:** `@@unique([candidateId, interviewRound])` – one feedback per candidate per round.

### 2.5 RecruitmentRequest.linkedJobPostingId

- **Removed:** `@unique` from `linkedJobPostingId`.
- **Updated:** JobPosting back-relation to `linkedFromRequests RecruitmentRequest[]` (one posting can be linked from multiple requests).

---

## 3. Enterprise Improvements

### 3.1 Position headcount control

- **Added:** `headcountLimit Int?` on Position.
- Enforce in service layer: current filled employments &lt; headcountLimit when creating/approving recruitment or hiring.

### 3.2 Offer expiry

- **Added:** `HiringDecision.offerExpiresAt DateTime?`.

### 3.3 Onboarding entity

- **Added:** `Onboarding` model: `id`, `userId`, `status`, `startedAt`, `completedAt`, `hiringDecisions HiringDecision[]`.
- **HiringDecision:** `onboarding Onboarding? @relation(...)` (replacing scalar-only reference).

### 3.4 RecruitmentApproval (audit trail)

- **Added:** `RecruitmentApproval` model: `recruitmentRequestId`, `approverId` (User), `level`, `role`, `decision`, `comments`, `decidedAt`.
- **RecruitmentRequest:** `approvalSteps RecruitmentApproval[]`; kept `approvals Json?` for backward compatibility.
- Approve use case now creates a `RecruitmentApproval` row in the same transaction as the request update.

---

## 4. Data Integrity

### 4.1 CHECK constraints (PostgreSQL)

Prisma does not support CHECK constraints in the schema. Add them in a **one-off migration** or run manually after the main migration:

```sql
-- Compensation: validTo IS NULL OR validTo > validFrom
ALTER TABLE "UserCompensationHistory" ADD CONSTRAINT "UserCompensationHistory_validTo_after_validFrom"
  CHECK ("validTo" IS NULL OR "validTo" > "validFrom");

-- Contract: endDate IS NULL OR endDate > startDate
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_endDate_after_startDate"
  CHECK ("end_date" IS NULL OR "end_date" > "start_date");
```

### 4.2 HiringDecision consistency (service layer)

When `finalDecision = OFFER_APPROVED`, enforce `offer IS NOT NULL` in the use case that creates or updates the hiring decision (e.g. create-hiring-decision or approve-hiring-decision).

A shared validator is available: `validateHiringDecisionOffer(finalDecision, offer)` in `apps/api/src/domains/hr/recruitment/validate-hiring-decision.ts`. Call it before persisting; it throws `BadRequestException` when offer is missing for OFFER_APPROVED.

---

## 5. Applying the changes

1. **Schema already updated** in `apps/api/prisma/schema.prisma`.
2. Run migration:
   ```bash
   cd apps/api && npx prisma migrate dev --name recruitment_architecture_fixes
   ```
3. If the migration is already applied and you only need CHECK constraints, run the SQL in §4.1 in a new migration or manually against the DB.
4. Implement headcount validation in recruitment/hiring use cases (compare current employments count to `Position.headcountLimit`).
5. In the hiring-decision create/update use case, call `validateHiringDecisionOffer(finalDecision, offer)` (see §4.2).
