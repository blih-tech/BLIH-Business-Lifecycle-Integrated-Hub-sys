# HR Implementation Plan 3: Onboarding Subsystem

**Version:** 1.1  
**Last Updated:** March 2026  
**Status:** Phase 1–3 implemented; Phase 4–7 scaffolded (schema + types)  
**Implementation order:** 4 (after Employee Records and Approval; can parallel with Attendance)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Onboarding subsystem ensures new hires are integrated through **checklists** (HR, IT, Admin, Team), **asset and access provisioning**, **policy acknowledgement**, and **probation** (KPI plan, evaluations, confirm/extend/terminate). It connects hiring decision (recruitment) to employee activation and lifecycle (ONBOARDING → ACTIVE).

### 1.2 Goals

- Auto-generate onboarding checklist from templates (by employment type and role) with due dates relative to join date
- Track task completion by department (HR, IT, Admin, Team) and assignee
- Support asset provisioning and policy acknowledgement workflows
- Manage probation: 60-day KPI plan, 30-day check, 55-day evaluation, confirm/extend/terminate with approvals
- Notify HR and manager at probation milestones; escalate overdue reviews
- On completion, update UserLifecycle to ACTIVE and sync to other systems

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                                                                                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §3 Onboarding Logic (checklist generation, probation tracking, probation decision)                                                                                         |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Sub-System 2: Forms 07–13 (Onboarding Checklist, New Hire Profile, Asset Provisioning, Policy Acknowledgement, Probation KPI, Evaluation, Confirmation/Termination)        |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flows 7–8 (New Hire Onboarding, Probation Management)                                                                                                                      |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | § Sub-System 2: onboarding_checklists, new_hire_profiles, asset_provisioning, policy_acknowledgements, probation_kpi_plans, probation_evaluations, probation_confirmations |

---

## 2. Current State and Gaps

### 2.1 What Exists

- **UserEmployment:** hiredAt, probationEndAt, confirmedAt
- **UserLifecycle:** status ONBOARDING, ACTIVE; onboardedAt
- **Core users:** create user, update employment/lifecycle
- No onboarding checklist, probation plan, or evaluation entities

### 2.2 Gaps

- No OnboardingChecklist or OnboardingTask models
- No AssetProvisioning or PolicyAcknowledgement entities
- No ProbationKpiPlan, ProbationEvaluation, ProbationConfirmation
- No checklist generation from template (by role/employment type)
- No probation milestone notifications or escalation
- No link from HiringDecision to onboarding (employee creation + checklist creation)

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum OnboardingChecklistStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

enum OnboardingTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

enum ProbationPlanStatus {
  DRAFT
  ACTIVE
  COMPLETED
  CANCELLED
}

enum ProbationEvaluationRound {
  DAY_30
  DAY_55
  DAY_60_FINAL
}

enum ProbationRecommendation {
  CONFIRM
  EXTEND
  TERMINATE
}

enum ProbationConfirmationVerdict {
  CONFIRM
  EXTEND
  TERMINATE
}
```

### 3.2 New Models (Summary)

- **OnboardingChecklist** — id, userId, hiringDecisionId (optional), joinDate, overseerId (manager), totalItems, completedItems, status, teamLeadVerifiedAt, ceoSignOffRequired, ceoSignOffAt, createdAt, updatedAt. Tasks stored in related table or JSON by department (hr_duties, it_duties, admin_duties, team_duties).
- **OnboardingTask** — id, checklistId, department (HR/IT/ADMIN/TEAM), title, description, dueDate, assignedToId, status, completedAt, completedById. (Alternative: single JSON column on checklist.)
- **AssetProvisioning** — id, userId, equipment (JSON array: item, assetId, serialNumber, status, allocatedAt), platformPermissions (JSON), itSupervisorApprovedAt, adminApprovedAt, financeApprovalRequired, status.
- **PolicyAcknowledgement** — id, userId, policies (JSON: policyId, name, version, acknowledgedAt, ipAddress), allAcknowledged, confirmedAt, systemAccessGrantedAt, verifiedById, verifiedAt.
- **ProbationKpiPlan** — id, userId, supervisorId, probationStart, probationEnd, goals (JSON: goalId, goal, measure, targetValue, importancePercent, notes), development (sessions, mentorId, milestones JSON), employeeEndorsedAt, supervisorEndorsedAt, hrEndorsedAt, status.
- **ProbationEvaluation** — id, kpiPlanId, userId, evaluationRound, evaluationDate, goalReviews (JSON), conduct (JSON: timekeeping, collaboration, drive, communication scores), averageRating, supervisorRecommendation, hrRemarks, hrVerdict, employeeAcknowledgedAt, supervisorApprovedAt, hrApprovedAt, ceoApprovedAt, finalDecision (CONFIRMED/EXTENDED/TERMINATED), extensionDays, newEndDate, employeeStatusUpdatedAt.
- **ProbationConfirmation** — id, userId, reviewSummary (JSON), verdict, extension (JSON), termination (JSON), confirmation (letterUrl, statusUpdatedTo), hrCheckedAt, ceoSignOffAt, employeeNotifiedAt, archivedInEmployeeFile.

---

## 4. API Design

### 4.1 Base Path

- `/api/v1/hr/onboarding`

### 4.2 Endpoints

| Method | Path                                     | Description                                                                                          |
| ------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| POST   | /onboarding/checklists                   | Create checklist (e.g. from hiring decision or manual); optionally auto-generate tasks from template |
| GET    | /onboarding/checklists                   | List (filter: userId, status)                                                                        |
| GET    | /onboarding/checklists/:id               | Get checklist with tasks                                                                             |
| PATCH  | /onboarding/checklists/:id               | Update checklist (e.g. status, CEO sign-off)                                                         |
| PATCH  | /onboarding/checklists/:id/tasks/:taskId | Complete task                                                                                        |
| POST   | /onboarding/asset-provisioning           | Create for user                                                                                      |
| GET    | /onboarding/asset-provisioning           | List by user                                                                                         |
| PATCH  | /onboarding/asset-provisioning/:id       | Update equipment/permissions and approvals                                                           |
| POST   | /onboarding/policy-acknowledgements      | Record acknowledgement (employee or HR)                                                              |
| GET    | /onboarding/policy-acknowledgements      | List by user                                                                                         |
| POST   | /onboarding/probation-plans              | Create 60-day KPI plan                                                                               |
| GET    | /onboarding/probation-plans              | List by user/supervisor                                                                              |
| GET    | /onboarding/probation-plans/:id          | Get with goals and milestones                                                                        |
| PATCH  | /onboarding/probation-plans/:id          | Update; endorse (employee/supervisor/HR)                                                             |
| POST   | /onboarding/probation-evaluations        | Create evaluation (30/55/60-day)                                                                     |
| GET    | /onboarding/probation-evaluations        | List by user/plan                                                                                    |
| PATCH  | /onboarding/probation-evaluations/:id    | Approve; set final decision                                                                          |
| POST   | /onboarding/probation-confirmations      | Create confirmation record (confirm/extend/terminate)                                                |
| GET    | /onboarding/probation-confirmations      | List by user                                                                                         |
| PATCH  | /onboarding/probation-confirmations/:id  | HR/CEO sign-off; trigger status update and notifications                                             |

---

## 5. Business Logic (from HR_LOGIC)

- **Checklist generation:** All: email account, workstation, payroll, access card. By type: FULL_TIME (benefits, mentor); CONTRACT (contract docs, end-date reminder). By role: MANAGER (approval permissions, team calendar); ENGINEER (dev environment, repo access). Due dates = join date + due_days (business days).
- **Probation:** Notify at 30 and 7 days before end; at end if no review, create task for HR and escalate after +14 days. Pass: set ACTIVE, convert permanent, notify. Extend: max 6 months extension, 2nd-level approval if > 3 months. Fail: initiate termination, settlement, exit interview, disable access.

---

## 6. Types and DTOs

- OnboardingChecklist: Create, Update, Response; OnboardingTask: Update, Response
- AssetProvisioning: Create, Update, Response
- PolicyAcknowledgement: Create, Response
- ProbationKpiPlan: Create, Update, Response; Goal, Development, Milestone
- ProbationEvaluation: Create, Update, Response; GoalReview, Conduct
- ProbationConfirmation: Create, Update, Response

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations

1. Add onboarding and probation enums and models.
2. Relations: OnboardingChecklist → User; OnboardingTask → OnboardingChecklist; AssetProvisioning, PolicyAcknowledgement, ProbationKpiPlan, ProbationEvaluation, ProbationConfirmation → User.
3. Run migration.

### Phase 2: Types package

4. Add onboarding/probation DTOs and enums under `packages/types/src/hr/onboarding/`.

### Phase 3: Checklist and tasks

5. Define checklist template (config or code): tasks by department, employment type, role; due_days from join date.
6. Implement CreateOnboardingChecklistUseCase (from template or from hiring decision).
7. Implement task completion and checklist progress; team lead and CEO sign-off.
8. Expose checklist and task endpoints.

### Phase 4: Asset provisioning and policy acknowledgement

9. Implement AssetProvisioning CRUD and approval flow (IT, Admin, Finance if over limit).
10. Implement PolicyAcknowledgement create and verify; link to access activation if needed.
11. Expose endpoints.

### Phase 5: Probation KPI plan

12. Implement ProbationKpiPlan create with 3–5 goals and development milestones.
13. Implement endorsements (employee, supervisor, HR); status transitions.
14. Expose probation plan endpoints.

### Phase 6: Probation evaluation and confirmation

15. Implement ProbationEvaluation create (round 30/55/60); goal reviews and conduct ratings; average and recommendation.
16. Implement approve chain (supervisor, HR, CEO if senior); final decision CONFIRMED/EXTENDED/TERMINATED.
17. Implement ProbationConfirmation; on CONFIRM update UserLifecycle to ACTIVE and UserEmployment confirmedAt; on EXTEND update probationEndAt; on TERMINATE trigger offboarding.
18. Expose evaluation and confirmation endpoints.

### Phase 7: Notifications and scheduled jobs

19. Probation job: daily check for 30-day and 7-day warnings, end date passed without review (escalate); send notifications to HR and manager.
20. Onboarding overdue task job: notify assignee and HR.
21. Integration with HiringDecision: on accept offer, create User and OnboardingChecklist (and optionally NewHireProfile if separate from User).

### Phase 8: RBAC and tests

22. RBAC resources: onboarding_checklist, asset_provisioning, policy_acknowledgement, probation_plan, probation_evaluation, probation_confirmation.
23. Integration and E2E tests for full onboarding and probation flow.

---

## 8. Dependencies

- **Recruitment:** Hiring decision acceptance creates User and triggers onboarding checklist.
- **Employee Records:** User, UserEmployment, UserLifecycle updated on probation confirm/extend/terminate.
- **Approval Workflow:** Optional for asset and probation approvals.
- **Offboarding:** Probation TERMINATE triggers offboarding flow.

---

## 9. Testing

- Unit: Checklist template generation; probation date calculations; escalation rules.
- Integration: Create checklist → complete tasks → verify progress; create probation plan → evaluation → confirm → lifecycle ACTIVE.
- E2E: New hire onboarding from offer acceptance to active employee with probation confirmed.

---

## 10. Acceptance Criteria

- [x] Onboarding checklist created from template; tasks by department with due dates; completion tracked.
- [ ] Asset provisioning and policy acknowledgement workflows with approvals (schema + types ready).
- [ ] Probation KPI plan with goals and endorsements; evaluations at 30/55/60 days (schema + types ready).
- [ ] Confirm/Extend/Terminate updates lifecycle and employment; terminate triggers offboarding.
- [ ] Notifications at probation milestones; escalation when review overdue.

---

## 11. Implementation Status (March 2026)

### Done

- **Schema (Phase 1):** All onboarding and probation enums and models added to `schema.prisma`: `OnboardingChecklist`, `OnboardingTask`, `AssetProvisioning`, `PolicyAcknowledgement`, `ProbationKpiPlan`, `ProbationEvaluation`, `ProbationConfirmation`. Relations to `User`, `Onboarding`, `HiringDecision`.
- **Types (Phase 2):** `packages/types/src/hr/onboarding/` — checklist, asset-provisioning, policy-acknowledgement, probation DTOs and enums; exported via `@blih/types`.
- **Checklist and tasks (Phase 3):**
  - Template: `onboarding-checklist.template.ts` — base tasks (email, workstation, payroll, access card); by employment type (FULL_TIME, CONTRACT); by role (Manager, Engineer) from position title.
  - Use cases: Create (with optional task generation), List, Get, Update checklist; Update task (complete and recalc progress).
  - Controller: `hr/onboarding` — POST/GET/PATCH checklists, PATCH checklist/:id/tasks/:taskId.
  - **Accept-offer integration:** When an offer is accepted, an onboarding checklist is auto-created with `generateTasksFromTemplate: true`, linked to the new onboarding and hiring decision.
- **RBAC:** `OnboardingChecklistPermissions` (VIEW, CREATE, UPDATE) in permissions constants and controller.

### Migration

- Run after DB is in a state where existing migrations apply cleanly:  
  `cd apps/api && npx prisma migrate dev --name onboarding_subsystem`  
  If shadow DB fails due to prior migrations, fix migration history or apply the new model changes manually.

### Not yet implemented

- Phase 4: Asset provisioning and policy acknowledgement API (create/list/update endpoints).
- Phase 5–6: Probation plan, evaluation, and confirmation API and business logic.
- Phase 7: Probation and overdue task notifications; scheduled jobs.
- Phase 8: RBAC for asset/probation resources; E2E tests.
