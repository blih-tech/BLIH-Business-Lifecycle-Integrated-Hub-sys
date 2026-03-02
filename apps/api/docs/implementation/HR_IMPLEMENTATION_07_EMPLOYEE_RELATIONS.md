# HR Implementation Plan 7: Employee Relations Subsystem

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Ready for implementation  
**Implementation order:** 8 (after Approval Workflow; can parallel with others)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Employee Relations subsystem covers **disciplinary actions** (with escalation matrix), **incident reporting and investigation**, **grievances**, **employee recognition**, **satisfaction and pulse surveys**, and **conflict resolution/mediation**. It implements MODULE_HR_COMPLETE Forms 38–44 (Satisfaction Survey, Disciplinary/Grievance, Incident Report, Suggestion, Recognition, Pulse Survey, Conflict Mediation).

### 1.2 Goals

- Record incidents (safety, security, conflict) with severity; auto-assign investigator and SLA (e.g. critical 24h, high 72h, normal 7 days); track investigation and preventive actions
- Apply disciplinary matrix (attendance violation, performance issue, code of conduct) with escalation (verbal → written → final → termination); require HR/CEO for termination
- Support grievance and suggestion forms with workflow and status
- Record recognition/appreciation with category and approval (Supervisor → HR → CEO)
- Support satisfaction and pulse surveys: create, distribute, collect responses (anonymous option), aggregate results for HR/CEO
- Support conflict resolution: mediation request, assign mediator, record session and agreement

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §8 Employee Relations (disciplinary matrix, incident investigation)       |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Sub-System 7: Forms 38–44                                                 |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flows 13–14 (Recognition, Surveys)                                        |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | § Sub-System 7: incidents, disciplinary, grievances, recognition, surveys |

---

## 2. Current State and Gaps

- No IncidentReport, DisciplinaryAction, Grievance, Recognition, Survey, SurveyResponse, ConflictMediation models
- No disciplinary escalation logic or incident SLA assignment
- No survey aggregation or anonymity handling

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IncidentType {
  SAFETY
  SECURITY
  CONFLICT
  HARASSMENT
  OTHER
}

enum DisciplinaryIncidentType {
  ATTENDANCE_VIOLATION
  PERFORMANCE_ISSUE
  CODE_OF_CONDUCT
}

enum DisciplinaryActionType {
  VERBAL_WARNING
  WRITTEN_WARNING
  FINAL_WARNING
  PERFORMANCE_IMPROVEMENT_PLAN
  SUSPENSION
  TERMINATION
}

enum RecognitionCategory {
  EXCELLENCE
  TEAMWORK
  INNOVATION
  SERVICE
  OTHER
}

enum SurveyStatus {
  DRAFT
  ACTIVE
  CLOSED
}
```

### 3.2 New Models (Summary)

- **IncidentReport** — id, reportId (e.g. INC-2026-001), userId (reporter), incidentType, severity, description, location, occurredAt, peopleInvolved (JSON), immediateActions (JSON), investigatorId, slaHours, investigationDueAt, investigationNotes, rootCause, preventiveActions, status (OPEN/INVESTIGATING/RESOLVED), createdAt, updatedAt
- **DisciplinaryAction** — id, userId, incidentType, actionType, incidentReportId (optional), description, effectiveFrom, expiresAt (for warnings), durationDays (suspension), approvedById, status, createdAt
- **Grievance** — id, userId, subject, description, category, submittedAt, assignedToId, status (OPEN/INVESTIGATING/RESOLVED/CLOSED), resolutionNotes, closedAt
- **Recognition** — id, nominatorId, nomineeId, category, description, impact, suggestedAward (CERTIFICATE/GIFT/BONUS), publicRecognition, approvals (JSON), status, createdAt
- **Survey** — id, title, description, type (SATISFACTION/PULSE), questions (JSON), anonymous, status, opensAt, closesAt, createdById
- **SurveyResponse** — id, surveyId, userId (null if anonymous), responses (JSON), submittedAt
- **ConflictMediation** — id, requesterId, otherPartyId, nature, duration, attemptedResolutions, workImpact, desiredOutcome, mediatorId, sessionDates (JSON), agreementReached, agreementNotes, status, createdAt

---

## 4. API Design

### 4.1 Base Path

- `/api/v1/hr/relations`

### 4.2 Endpoints

| Method | Path                               | Description                                              |
| ------ | ---------------------------------- | -------------------------------------------------------- |
| POST   | /relations/incidents               | Report incident                                          |
| GET    | /relations/incidents               | List (filter: status, severity)                          |
| GET    | /relations/incidents/:id           | Get one                                                  |
| PATCH  | /relations/incidents/:id           | Update; assign investigator; complete investigation      |
| POST   | /relations/disciplinary            | Create disciplinary action (from incident or standalone) |
| GET    | /relations/disciplinary            | List by user or all (HR)                                 |
| GET    | /relations/disciplinary/:id        | Get one                                                  |
| POST   | /relations/grievances              | Submit grievance                                         |
| GET    | /relations/grievances              | List (userId or assignee)                                |
| PATCH  | /relations/grievances/:id          | Update status; resolve                                   |
| POST   | /relations/recognition             | Nominate for recognition                                 |
| GET    | /relations/recognition             | List (nominee, status)                                   |
| POST   | /relations/recognition/:id/approve | Approve (supervisor/HR/CEO)                              |
| POST   | /relations/surveys                 | Create survey                                            |
| GET    | /relations/surveys                 | List (status)                                            |
| GET    | /relations/surveys/:id             | Get (questions; no responses until closed)               |
| POST   | /relations/surveys/:id/responses   | Submit response (anonymous or not)                       |
| GET    | /relations/surveys/:id/results     | Aggregate results (when closed; HR/CEO)                  |
| PATCH  | /relations/surveys/:id             | Open/close survey                                        |
| POST   | /relations/mediation               | Request mediation                                        |
| GET    | /relations/mediation               | List (requester, mediator, status)                       |
| PATCH  | /relations/mediation/:id           | Assign mediator; record sessions; agreement              |

---

## 5. Business Logic (from HR_LOGIC §8)

- **Disciplinary matrix:** Attendance: 1st verbal (6m expiry), 2nd written (12m), 3rd final (12m), 4th termination. Performance: 1st PIP (3m), 2nd written, 3rd termination. Code of conduct: minor written; major suspension 3d; severe termination immediate. Termination requires HR + CEO.
- **Incident:** Critical → senior investigator, 24h SLA; High → HRBP, 72h; else HR generalist, 7 days. Notify HR manager; critical notify CEO.

---

## 6. Types and DTOs

- IncidentReport: Create, Update, Response
- DisciplinaryAction: Create, Response
- Grievance: Create, Update, Response
- Recognition: Create, Approve, Response
- Survey: Create, Update, Response; SurveyQuestion, SurveyResponseDto; AggregateResultsDto
- ConflictMediation: Create, Update, Response

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations

1. Add relations enums and models (IncidentReport, DisciplinaryAction, Grievance, Recognition, Survey, SurveyResponse, ConflictMediation).
2. Run migration.

### Phase 2: Types package

3. Add relations DTOs and enums.

### Phase 3: Incidents and disciplinary

4. Implement IncidentReport create; auto-assign investigator and SLA from severity; notifications.
5. Implement investigation update and resolution.
6. Implement DisciplinaryAction create; apply escalation matrix (count prior active actions by type); require approval for termination.
7. Expose incident and disciplinary endpoints.

### Phase 4: Grievances and recognition

8. Implement Grievance CRUD and assign/resolve workflow.
9. Implement Recognition create and approval chain (Supervisor → HR → CEO).
10. Expose grievance and recognition endpoints.

### Phase 5: Surveys

11. Implement Survey create with questions (JSON); open/close; anonymous flag.
12. Implement SurveyResponse submit (store userId only if not anonymous); aggregate results (averages, counts) when survey closed.
13. Expose survey and response endpoints; results only for closed surveys with permission.

### Phase 6: Conflict mediation

14. Implement ConflictMediation request; assign mediator; record sessions and agreement.
15. Expose mediation endpoints.

### Phase 7: Notifications and RBAC

16. Notifications: incident reported (investigator, HR); disciplinary (employee, HR); recognition approved; survey opened/reminder.
17. RBAC: incident, disciplinary, grievance, recognition, survey, mediation.
18. Integration tests: incident → investigation → disciplinary; survey create → responses → results.

---

## 8. Dependencies

- **Approval Workflow:** Recognition and disciplinary (termination) approvals.
- **Employee Records:** User for nominee/reporter; disciplinary may trigger termination (offboarding).
- **Notifications:** All relations events.

---

## 9. Testing

- Unit: Disciplinary escalation matrix; incident SLA assignment.
- Integration: Create incident → assign → resolve; create disciplinary with history; survey with anonymous responses and aggregation.
- E2E: Employee reports incident; HR investigates; disciplinary applied; employee submits survey response; HR views aggregate results.

---

## 10. Acceptance Criteria

- [ ] Incident reporting with severity and investigator assignment; investigation and resolution.
- [ ] Disciplinary actions with escalation matrix and termination approval.
- [ ] Grievances and recognition with workflows and approvals.
- [ ] Surveys with anonymous option and aggregated results when closed.
- [ ] Conflict mediation request and session/agreement recording.
