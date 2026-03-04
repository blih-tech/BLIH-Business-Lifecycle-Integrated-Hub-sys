# HR Subsystem Implementation Plans

This folder contains **detailed implementation plans** for each of the 8 HR subsystems. Each plan is designed to be implemented **turn-by-turn** and includes schema design, API design, business rules, implementation phases, dependencies, and acceptance criteria.

---

## Plan Index and Implementation Order

| Order | Subsystem          | Document                                                                                 | Description                                                                                                 |
| ----- | ------------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| 1     | Employee (Records) | [HR_IMPLEMENTATION_01_EMPLOYEE_RECORDS.md](HR_IMPLEMENTATION_01_EMPLOYEE_RECORDS.md)     | Profile, documents, contracts, job descriptions, profile change approval, document expiry                   |
| 2     | _(Cross-cutting)_  | Approval Workflow + Notifications                                                        | Implement minimal approval engine and HR notification triggers first (see master plan)                      |
| 3     | Attendance & Leave | [HR_IMPLEMENTATION_04_ATTENDANCE_LEAVE.md](HR_IMPLEMENTATION_04_ATTENDANCE_LEAVE.md)     | Check-in/out, leave balance, leave request, timesheets, overtime, device validation                         |
| 4     | Onboarding         | [HR_IMPLEMENTATION_03_ONBOARDING.md](HR_IMPLEMENTATION_03_ONBOARDING.md)                 | Checklists, asset provisioning, policy acknowledgement, probation KPI, evaluation, confirm/extend/terminate |
| 5     | Recruitment        | [HR_IMPLEMENTATION_02_RECRUITMENT.md](HR_IMPLEMENTATION_02_RECRUITMENT.md)               | Request, job posting, application, CV screening, interview feedback, hiring decision & offer                |
| 6     | Performance & OKR  | [HR_IMPLEMENTATION_05_PERFORMANCE_OKR.md](HR_IMPLEMENTATION_05_PERFORMANCE_OKR.md)       | Review periods, self/manager review, OKRs, key results, rating, raise recommendation                        |
| 7     | Training           | [HR_IMPLEMENTATION_06_TRAINING.md](HR_IMPLEMENTATION_06_TRAINING.md)                     | Training request, completion & certification, skill gap assessment, budget allocation                       |
| 8     | Employee Relations | [HR_IMPLEMENTATION_07_EMPLOYEE_RELATIONS.md](HR_IMPLEMENTATION_07_EMPLOYEE_RELATIONS.md) | Incidents, disciplinary, grievances, recognition, surveys, conflict mediation                               |
| 9     | Offboarding        | [HR_IMPLEMENTATION_08_OFFBOARDING.md](HR_IMPLEMENTATION_08_OFFBOARDING.md)               | Resignation, notice validation, checklist, final settlement, exit interview, compliance                     |

---

## Reference Documentation

All plans reference the following module docs:

- **[HR_LOGIC.md](../modules/HR_LOGIC.md)** — Backend business rules and logic per subsystem
- **[MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md)** — 50 forms and workflows
- **[USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)** — User flows and UX
- **[DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md)** — Full HR schema reference (conceptual)

---

## How to Use These Plans

1. **Start with Employee Records (01)** to extend the existing User/Profile/Employment/Compensation/Lifecycle with documents, contracts, job descriptions, and profile change workflow.
2. **Implement a minimal Approval Workflow** (and HR notification triggers) so that Leave, Recruitment, Onboarding, and Offboarding can reuse it.
3. **Follow the order above** for dependencies (e.g. Recruitment → Onboarding → Employee; Leave needs Employee; Offboarding needs Leave and Employee).
4. **Within each plan:** execute phases in order (Schema → Types → Use cases → Endpoints → Notifications/Jobs → RBAC → Tests).
5. **Acceptance criteria** at the end of each plan define “done” for that subsystem.

---

## Master Plan

The overall HR implementation strategy and subsystem summary are in the **master plan** (e.g. in `.cursor/plans/` or project docs) — use that for architecture and cross-cutting concerns; use these 8 documents for per-subsystem, turn-by-turn implementation.
