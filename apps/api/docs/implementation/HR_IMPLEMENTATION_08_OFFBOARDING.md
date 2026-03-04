# HR Implementation Plan 8: Offboarding Subsystem

**Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Implemented  
**Implementation order:** 7 (after Employee Records, Leave, Approval; depends on lifecycle)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Offboarding subsystem covers **resignation** (notice validation, handover), **exit interview**, **offboarding checklist** (HR, IT, Admin, Finance, Manager), **asset return and clearance**, **final settlement** (salary, leave encashment, deductions), **experience letter and final pay**, and **compliance checklist** (labor law). It sets UserLifecycle to RESIGNED/TERMINATED and marks offboardingCompleted.

### 1.2 Goals

- Validate resignation notice (minimum notice by employment type; critical projects warning; leave balance options; probation reduced notice)
- Generate offboarding checklist by department (HR, IT, Admin, Finance, Manager) with due dates relative to last working day
- Track task completion; trigger access revocation and asset return
- Calculate final settlement: salary for days worked, leave encashment, prorated bonus, overtime due; deductions (tax, pension, loan recovery)
- Record exit interview and compliance checklist; generate experience letter and final pay request
- On completion, set lifecycle offboardingCompleted and notify Finance/IT for final steps

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                                                                                           |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §9 Offboarding (notice validation, final settlement, offboarding task matrix)                                                           |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Sub-System 8: Forms 45–50 (Resignation, Exit Interview, Offboarding Checklist, Asset Return, Experience Letter & Final Pay, Compliance) |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flow 15 (Resignation & Exit)                                                                                                            |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | § Sub-System 8: resignations, offboarding_checklists, exit_interviews, final_settlements                                                |

---

## 2. Current State and Gaps

- **UserLifecycle:** status RESIGNED/TERMINATED, offboardingCompleted
- No Resignation, OffboardingChecklist, OffboardingTask, ExitInterview, FinalSettlement, AssetReturn, ComplianceChecklist models
- No notice validation or settlement calculation
- No checklist generation from matrix

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum ResignationStatus {
  DRAFT
  SUBMITTED
  NOTICE_PERIOD
  HANDOVER
  EXIT_PENDING
  COMPLETED
}

enum OffboardingTaskDepartment {
  HR
  IT
  ADMIN
  FINANCE
  MANAGER
}

enum OffboardingTaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  OVERDUE
}

enum TerminationType {
  RESIGNATION
  END_OF_CONTRACT
  TERMINATION
  LAYOFF
}
```

### 3.2 New Models (Summary)

- **Resignation** — id, userId, proposedLastDay, actualLastDay, reason (GROWTH/PAY/CULTURE/OTHER), reasonNotes, submittedAt, approvedById (manager/HR), status, handoverPlan (JSON), criticalProjectsWarning (JSON), leaveBalanceOptions (JSON)
- **OffboardingChecklist** — id, userId, resignationId, lastWorkingDay, status (PENDING/IN_PROGRESS/COMPLETED), completedAt, createdAt
- **OffboardingTask** — id, checklistId, department, title, dueDate, assignedToId, status, completedAt, completedById, mandatory
- **ExitInterview** — id, userId, resignationId, conductedById, conductedAt, questions (JSON), answers (JSON), wouldRecommend, wouldReturn, improvementNotes, createdAt
- **FinalSettlement** — id, userId, resignationId, lastWorkingDay, earnings (JSON: salaryDaysWorked, leaveEncashment, proratedBonus, overtime), deductions (JSON: tax, pension, loanRecovery), netPayable, breakdownDocumentUrl, approvedById, paidAt, createdAt
- **AssetReturn** — id, userId, checklistId, items (JSON: assetId, condition, returnDate), depositReturn, damageDeductions, netAmount, itSignOffAt, adminSignOffAt, financeSignOffAt, status
- **ComplianceChecklist** — id, userId, resignationId, terminationType, noticePeriodContractual, noticePeriodActual, payInLieu, finalDues (JSON), terminationLetterSent, exitInterviewDone, clearanceCertificateDone, unionNotified, laborOfficeFiled, noPendingClaims, verifiedById, verifiedAt

---

## 4. API Design

### 4.1 Base Path

- `/api/v1/hr/offboarding`

### 4.2 Endpoints

| Method | Path                                      | Description                                                       |
| ------ | ----------------------------------------- | ----------------------------------------------------------------- |
| POST   | /offboarding/resignations                 | Submit resignation (validate notice)                              |
| GET    | /offboarding/resignations                 | List (userId, status)                                             |
| GET    | /offboarding/resignations/:id             | Get one with validation result                                    |
| PATCH  | /offboarding/resignations/:id             | Update; approve last day                                          |
| POST   | /offboarding/resignations/:id/checklist   | Generate offboarding checklist from matrix                        |
| GET    | /offboarding/checklists/:id               | Get checklist with tasks                                          |
| PATCH  | /offboarding/checklists/:id/tasks/:taskId | Complete task                                                     |
| POST   | /offboarding/exit-interviews              | Record exit interview                                             |
| GET    | /offboarding/exit-interviews              | List by user/resignation                                          |
| POST   | /offboarding/final-settlements            | Create settlement (calculate from rules)                          |
| GET    | /offboarding/final-settlements/:id        | Get settlement breakdown                                          |
| PATCH  | /offboarding/final-settlements/:id        | Approve; mark paid                                                |
| POST   | /offboarding/asset-returns                | Record asset return                                               |
| PATCH  | /offboarding/asset-returns/:id            | Sign-off by IT/Admin/Finance                                      |
| POST   | /offboarding/compliance-checklists        | Create compliance checklist                                       |
| PATCH  | /offboarding/compliance-checklists/:id    | Verify and sign off                                               |
| POST   | /offboarding/resignations/:id/complete    | Mark offboarding complete; set lifecycle; revoke access (trigger) |

---

## 5. Business Logic (from HR_LOGIC §9)

- **Notice validation:** Required notice days by employment type (FULL_TIME 30, PART_TIME 14, CONTRACT per contract, INTERN 7). Insufficient → error + waiver (Manager, HR). Critical projects → warning + suggested handover days. Leave balance → options ENCASH/TAKE_BEFORE_LEAVING/FORFEIT. Probation → reduced notice 7 days.
- **Final settlement:** Salary = (base/30)_daysWorkedInMonth; leave encashment = balance _ dailyRate; prorated bonus; overtime due; deductions: PAYE, pension 7%, loan recovery max 50% of gross.
- **Offboarding task matrix:** HR (exit interview -3d, final settlement 0, certificate 0, status update 0, archive +7d); IT (revoke email 0 18:00, revoke access 0, backup -1, transfer code -3); Admin (badges 0, assets 0, directory +1); Finance (settlement -1, payment 0, expense close +1); Manager (handover -3, reassign -5, feedback -1). dueDate = lastWorkingDay + deadline_days (business days).

---

## 6. Types and DTOs

- Resignation: Create, ValidateResultDto, Response
- OffboardingChecklist: Response; OffboardingTask: Update, Response
- ExitInterview: Create, Response
- FinalSettlement: Create, Response; EarningsDto, DeductionsDto
- AssetReturn: Create, Update, Response
- ComplianceChecklist: Create, Update, Response

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations

1. Add offboarding enums and models (Resignation, OffboardingChecklist, OffboardingTask, ExitInterview, FinalSettlement, AssetReturn, ComplianceChecklist).
2. Relations to User; run migration.

### Phase 2: Types package

3. Add offboarding DTOs and enums.

### Phase 3: Resignation and notice validation

4. Implement Resignation create with ValidateResignationNotice (notice days, critical projects, leave balance, probation); return validation result and warnings.
5. Implement approval of last working day; update status to NOTICE_PERIOD/HANDOVER.
6. Expose resignation endpoints.

### Phase 4: Offboarding checklist

7. Implement GenerateOffboardingChecklist from matrix (HR_LOGIC §9.3); create OffboardingTask per department/item with due dates.
8. Implement task completion; checklist progress; optional CEO sign-off.
9. Expose checklist and task endpoints.

### Phase 5: Final settlement

10. Implement CalculateFinalSettlement (salary days, leave encashment, bonus, overtime; deductions PAYE, pension, loan); store in FinalSettlement.
11. Generate breakdown document (template + storage); approve and mark paid.
12. Expose settlement endpoints.

### Phase 6: Exit interview, asset return, compliance

13. Implement ExitInterview create (questions/answers JSON); link to resignation.
14. Implement AssetReturn create and department sign-offs.
15. Implement ComplianceChecklist create and verify (labor law checklist).
16. Expose all endpoints.

### Phase 7: Completion and integration

17. Implement CompleteOffboarding: set UserLifecycle status RESIGNED/TERMINATED, offboardingCompleted true; trigger access revocation (event or call to IT); notify Finance and HR.
18. Notifications: resignation submitted (manager, HR); checklist tasks overdue; settlement approved; offboarding complete.
19. RBAC: resignation, offboarding_checklist, final_settlement, exit_interview, compliance.
20. Integration tests: resign → validate → checklist → tasks → settlement → exit interview → complete → lifecycle updated.

---

## 8. Dependencies

- **Employee Records:** User, UserEmployment (notice period), UserCompensation, UserLifecycle
- **Leave:** Leave balance for encashment and validation
- **Approval Workflow:** Resignation approval; settlement approval
- **Notifications:** All offboarding events
- **IT/Finance:** Access revocation and payroll (events or stubs)

---

## 9. Testing

- Unit: Notice validation (insufficient, waiver); settlement calculation (earnings, deductions).
- Integration: Resignation → checklist generated → tasks completed → settlement calculated → exit interview → complete offboarding.
- E2E: Employee submits resignation; HR generates checklist; Finance approves settlement; HR marks complete; lifecycle and offboardingCompleted updated.

---

## 10. Acceptance Criteria

- [x] Resignation submission with notice validation (notice period, critical projects, leave balance).
- [x] Offboarding checklist auto-generated from matrix with department tasks and due dates.
- [x] Final settlement calculated (salary, leave encashment, deductions); breakdown document.
- [x] Exit interview, asset return, and compliance checklist recorded.
- [x] Complete offboarding sets lifecycle and offboardingCompleted; triggers notifications and access revocation.

---

## 11. Implementation Summary

- **Base path:** `/api/v1/hr/offboarding`. Schema: offboarding enums and models; run `prisma:migrate:dev` from apps/api.
- **Types:** `packages/types/src/hr/offboarding/`. **Domain:** `apps/api/src/domains/hr/offboarding/` (notice validation, task matrix, settlement utils, mapper, use cases, OffboardingController).
- **RBAC:** `OffboardingPermissions` (VIEW, CREATE, UPDATE, APPROVE, COMPLETE).
