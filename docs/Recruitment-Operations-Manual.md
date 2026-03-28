# Enterprise Recruitment Operations (Canonical)

Last updated: 2026-03-05

## Purpose

This document defines the only supported recruitment flow in the system.
Legacy recruitment request/job posting/cv screening/interview feedback flow is removed.

## Workflow States

`DRAFT -> PENDING_FINANCE -> PENDING_GM -> PENDING_HR_REVIEW -> APPROVED -> PUBLISHED -> CLOSED`

## Approval Policy

1. Finance stage (`PENDING_FINANCE`): approver role `finance_manager`.
2. GM stage (`PENDING_GM`): approver role `superadmin`.
3. HR review stage (`PENDING_HR_REVIEW`): approver role `hr_manager`.
4. HR auto-review guard:
   if job creator has HR role (`hr` or `hr_manager`), HR stage is auto-approved after GM approval with:

- `autoApproved = true`
- `autoApprovalReason = "CREATOR_HAS_HR_ROLE"`
- audit comment persisted.

## Canonical API Endpoints

Base path: `/api/v1/hr/recruitment`

### Jobs

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

### Candidates

- `POST /candidates`
- `GET /candidates`
- `GET /candidates/:id`
- `PATCH /candidates/:id`

### Applications

- `POST /applications`
- `GET /applications`
- `GET /applications/:id`
- `POST /applications/:id/status`

### Interviews

- `POST /interviews`
- `GET /interviews`
- `GET /interviews/:id`
- `PATCH /interviews/:id`

## Canonical Data Model

Recruitment data is represented by:

- `Job`
- `JobApproval`
- `JobSkill`
- `JobTool`
- `JobResponsibility`
- `Candidate`
- `CandidateSkill`
- `JobApplication`
- `Interview`

Hiring integration uses:

- `HiringDecision.jobApplicationId`

## Permissions

Canonical recruitment RBAC resources:

- `job:*`
- `job_approval:*`
- `candidate:*`
- `job_application:*`
- `interview:*`

## Swagger Contract Requirements

For all recruitment routes:

- Request bodies are class DTOs (`class-validator` + `@ApiProperty`).
- Request examples are provided.
- Response examples are provided.
- Domain response DTOs are used (no generic recruitment response DTO).
- Global response envelope is preserved.

## Database Reset Policy

This rollout assumes a hard reset:

- no data preservation,
- no backward compatibility,
- fresh baseline migration from canonical schema,
- core-only seed (RBAC/resources/roles/system defaults),
- no recruitment business fixtures.
