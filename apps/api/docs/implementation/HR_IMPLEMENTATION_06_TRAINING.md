# HR Implementation Plan 6: Training Subsystem

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Ready for implementation  
**Implementation order:** 7 (after Performance; lighter dependency)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Training subsystem covers **training requests** (with approval and budget check), **training completion and certification** (with expiry alerts), **skill gap assessment** (team and individual), and **training budget allocation** by team. It supports MODULE_HR_COMPLETE Forms 34–37 (Training Request, Feedback, Skill Gap Assessment, Completion & Certification).

### 1.2 Goals

- Allow employees/supervisors to submit training requests with justification; approve via Team Lead → HR; check team training budget
- Record training completion and certifications; link to skills; trigger expiry notifications
- Support team-level skill gap assessment (required vs current levels); recommend trainings
- Calculate training budget by team (e.g. per head); adjust by prior year utilization (under-use reduce, over-use increase)
- Sync completed trainings/certifications to employee profile and Brain/knowledge base if applicable

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                                          |
| --------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §7 Training (budget allocation, skill gap analysis)                                    |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Sub-System 6: Forms 34–37                                                              |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flow 12 (Training Request & Development)                                               |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | § Sub-System 6: training_requests, training_completions, skills, skill_gap_assessments |

---

## 2. Current State and Gaps

### 2.1 What Exists

- **RBAC:** training resource in manifest
- No training or skill entities

### 2.2 Gaps

- No TrainingRequest, TrainingCompletion, Skill, EmployeeSkill, SkillGapAssessment, or TrainingBudget models
- No budget calculation or utilization tracking
- No skill gap algorithm (required vs current, recommended trainings)
- No certification expiry job

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum TrainingRequestStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

enum TrainingType {
  SKILL
  COMPLIANCE
  LEADERSHIP
  OTHER
}

enum CompletionStatus {
  COMPLETED
  PARTIAL
  DROPPED
}

enum SkillLevel {
  BEGINNER
  INTERMEDIATE
  ADVANCED
  EXPERT
}
```

### 3.2 New Models (Summary)

- **Skill** — id, name, category (optional), description; used in job descriptions and gap analysis.
- **EmployeeSkill** — userId, skillId, level, attestedAt, source (SELF/MANAGER/ASSESSMENT/TRAINING).
- **TrainingBudget** — teamId/departmentId, year, totalBudget, usedYtd, perPersonAmount; optional utilization history.
- **TrainingRequest** — id, userId, teamId, trainingType, title, provider, startDate, endDate, durationHours, justification, skillGapLink (skillId), cost, costPayer (COMPANY/SELF), status, submittedAt, approvedById, approvedAt, rejectionReason.
- **TrainingCompletion** — id, userId, trainingRequestId (optional), title, provider, startDate, endDate, completionStatus, scoreOrGrade, certificateNumber, certificateUrl, expiryDate, skillsAcquired (JSON: skillId, levelGain), attestedAt, syncedToProfile.
- **SkillGapAssessment** — id, teamId, assessedById, assessedAt, requiredSkills (JSON: skillId, requiredLevel, criticality), currentState (JSON: userId, skillId, currentLevel, gap), criticalGapsSummary, trainingRecommendations (JSON), hireRecommendations (JSON).

---

## 4. API Design

### 4.1 Base Path

- `/api/v1/hr/training`

### 4.2 Endpoints

| Method | Path                                  | Description                              |
| ------ | ------------------------------------- | ---------------------------------------- |
| GET    | /training/skills                      | List skills (filter: category)           |
| POST   | /training/skills                      | Create skill (admin)                     |
| GET    | /training/employees/:userId/skills    | Get employee skills                      |
| PATCH  | /training/employees/:userId/skills    | Upsert employee skills (self/manager)    |
| GET    | /training/budget                      | Get team budget (teamId, year)           |
| POST   | /training/requests                    | Create training request                  |
| GET    | /training/requests                    | List (userId, status)                    |
| GET    | /training/requests/:id                | Get one                                  |
| POST   | /training/requests/:id/approve        | Approve/reject                           |
| POST   | /training/completions                 | Record completion (and certification)    |
| GET    | /training/completions                 | List (userId, status)                    |
| PATCH  | /training/completions/:id             | Update; attach certificate expiry        |
| POST   | /training/skill-gap-assessments       | Create assessment for team               |
| GET    | /training/skill-gap-assessments       | List by team                             |
| GET    | /training/skill-gap-assessments/:id   | Get with recommendations                 |
| GET    | /training/employees/:userId/skill-gap | Individual gap vs target role (optional) |

---

## 5. Business Logic (from HR_LOGIC)

- **Budget:** Base = teamSize _ 10000 ETB; if prior year utilization < 50% then _ 0.8; if > 90% then \* 1.1. Track usedYtd from approved requests and completions (cost).
- **Skill gap:** Compare required skills (from role/job description) to current (EmployeeSkill); gap = requiredLevel - currentLevel; priority HIGH if gap >= 2; recommend trainings that target skillId; readiness score = 100 - (totalGap \* 10).

---

## 6. Types and DTOs

- Skill: Create, Response; EmployeeSkill: Upsert, Response
- TrainingBudget: Response
- TrainingRequest: Create, Approve, Response
- TrainingCompletion: Create, Update, Response
- SkillGapAssessment: Create, Response; RequiredSkill, CurrentState, Recommendation

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations

1. Add training and skill enums and models.
2. Relations to User, Department/Team; run migration.

### Phase 2: Types package

3. Add training and skill DTOs.

### Phase 3: Skills and employee skills

4. Implement Skill CRUD; EmployeeSkill list and upsert (with source).
5. Expose skill and employee-skill endpoints.

### Phase 4: Training budget

6. Implement TrainingBudget get/create for team and year; compute from config (per head, utilization factors).
7. On request approval, deduct or reserve from budget; on completion, record cost against budget.
8. Expose budget endpoint (read for requester; admin create/update).

### Phase 5: Training request and completion

9. Implement TrainingRequest create with justification; approval flow (Team Lead → HR); budget check.
10. Implement TrainingCompletion create; link to skills acquired; certificate expiry date.
11. Expiry job: notify employee and HR for certifications expiring in 30/7 days.
12. Expose request and completion endpoints.

### Phase 6: Skill gap assessment

13. Implement SkillGapAssessment create for team: required skills (from job descriptions or manual), current state from EmployeeSkill; compute gap and critical gaps; recommend trainings (from training catalog or manual).
14. Optional: individual gap vs target role (compare EmployeeSkill to JobDescription skills).
15. Expose assessment endpoints.

### Phase 7: Notifications and RBAC

16. Notifications: request submitted (approver), approved/rejected (requester); certification expiring.
17. RBAC: training, training_budget, skill_gap_assessment.
18. Integration tests: request → approve → complete → budget updated; skill gap with recommendations.

---

## 8. Dependencies

- **Employee Records:** User, JobDescription (for required skills in gap).
- **Approval Workflow:** Training request approval.
- **Notifications:** Request and certification expiry.

---

## 9. Testing

- Unit: Budget calculation; skill gap readiness score.
- Integration: Request → approve → completion → skills updated; gap assessment returns recommendations.
- E2E: Employee requests training; manager approves; HR records completion with certificate; expiry alert sent.

---

## 10. Acceptance Criteria

- [ ] Skills and employee skills CRUD; training budget by team with utilization logic.
- [ ] Training request with approval and budget check; completion with certification and expiry.
- [ ] Skill gap assessment with required vs current and training/hire recommendations.
- [ ] Certification expiry notifications; completions synced to profile/skills.
