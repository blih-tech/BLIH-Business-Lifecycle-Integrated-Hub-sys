# HR Recruitment Implementation (Canonical Enterprise Flow)

Last updated: 2026-03-05

## Scope

This is the only supported recruitment implementation in the codebase.
Legacy recruitment request/job posting/cv screening/interview feedback flows are removed.

## Workflow

`DRAFT -> PENDING_FINANCE -> PENDING_GM -> PENDING_HR_REVIEW -> APPROVED -> PUBLISHED -> CLOSED`

Approval actor policy:

- `PENDING_FINANCE`: `finance_manager`
- `PENDING_GM`: `superadmin`
- `PENDING_HR_REVIEW`: `hr_manager`

HR auto-review guard:

- If job creator has `hr` or `hr_manager`, HR stage is auto-approved after GM approval.
- Audit fields are populated:
  - `autoApproved = true`
  - `autoApprovalReason = "CREATOR_HAS_HR_ROLE"`
  - approval comment persisted.

## Canonical Prisma Models

- `Job`
- `JobApproval`
- `JobSkill`
- `JobTool`
- `JobResponsibility`
- `Candidate`
- `CandidateSkill`
- `JobApplication`
- `Interview`

Onboarding handoff:

- `HiringDecision.jobApplicationId` is the canonical hiring link.

## Canonical API

Base path: `/api/v1/hr/recruitment`

Jobs:

- `POST /jobs`
- `GET /jobs`
- `GET /jobs/:id`
- `PATCH /jobs/:id`
- `POST /jobs/:id/submit`
- `POST /jobs/:id/approve`
- `POST /jobs/:id/publish`
- `POST /jobs/:id/close`
- `POST /jobs/:id/skills`
- `POST /jobs/:id/tools`
- `POST /jobs/:id/responsibilities`

Candidates:

- `POST /candidates`
- `GET /candidates`
- `GET /candidates/:id`
- `PATCH /candidates/:id`

Applications:

- `POST /applications`
- `GET /applications`
- `GET /applications/:id`
- `POST /applications/:id/status`

Interviews:

- `POST /interviews`
- `GET /interviews`
- `GET /interviews/:id`
- `PATCH /interviews/:id`

## RBAC Resources

- `job:*`
- `job_approval:*`
- `candidate:*`
- `job_application:*`
- `interview:*`

## Swagger Contract Rules

- Use class DTOs only in request bodies (`class-validator` + `@ApiProperty`).
- Every recruitment endpoint has request and success response examples.
- Use domain-specific response DTOs (no generic recruitment response DTO).
- Keep global response envelope format unchanged.

## Database Reset Rules

- Full reset only (no legacy data preservation).
- Single baseline migration from canonical schema.
- Seed core platform data only (RBAC/resources/roles/system defaults).
