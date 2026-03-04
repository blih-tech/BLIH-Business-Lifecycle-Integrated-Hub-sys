# HR Implementation Plan 2: Recruitment Subsystem

**Version:** 1.0  
**Last Updated:** February 2026  
**Status:** Partially implemented (Phase 1–3 + recruitment requests API)  
**Implementation order:** 5 (after Employee Records, Approval Workflow, Onboarding, Attendance & Leave)

---

## 1. Overview and Objectives

### 1.1 Purpose

The Recruitment subsystem covers the full hiring pipeline from **Recruitment Request** through **Job Posting**, **Application**, **CV Screening**, **Interview Feedback**, and **Hiring Decision & Offer**. It implements approval chains, candidate scoring, interview scheduling, and offer generation rules.

### 1.2 Goals

- Authorize hiring via recruitment request (Finance → CEO → HR) and create job posting from approved request
- Publish job postings with validity and auto-expiry logic
- Accept and track candidate applications with pipeline status
- Support CV screening with weighted ratings and recommendation (Select/Pause/Decline)
- Schedule interviews and collect standardized feedback with ranking
- Conclude with hiring decision and offer approval (Finance → CEO); generate offer document and trigger onboarding

### 1.3 Reference Documentation

| Document                                                  | Section / Use                                                                                                                        |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| [HR_LOGIC.md](../modules/HR_LOGIC.md)                     | §2 Recruitment Logic (job posting workflow, candidate scoring, interview scheduling, offer generation)                               |
| [MODULE_HR_COMPLETE.md](../modules/MODULE_HR_COMPLETE.md) | Sub-System 1: Forms 01–06 (Recruitment Request, Job Posting, Application, CV Screening, Interview Feedback, Hiring Decision & Offer) |
| [USER_FLOW_HR.md](../modules/USER_FLOW_HR.md)             | Flows 1–5 (Recruitment Request, Job Posting, Application, CV Screening & Interview, Hiring Decision)                                 |
| [DATABASE_SCHEMA_HR.md](../modules/DATABASE_SCHEMA_HR.md) | § Sub-System 1: recruitment_requests, job_postings, candidates, cv_screenings, interview_feedback, hiring_decisions                  |

---

## 2. Current State and Gaps

### 2.1 What Exists

- **Core:** User, Department; no recruitment entities
- **HR domain:** Placeholder only
- **RBAC:** No recruitment-specific resources yet (to be added: e.g. `recruitment_request`, `job_posting`, `candidate`)

### 2.2 Gaps

- No RecruitmentRequest, JobPosting, Candidate, CvScreening, InterviewFeedback, HiringDecision models
- No approval workflow integration for multi-level approvals
- No candidate scoring algorithm or interview scheduling conflict checks
- No offer salary calculation or internal-equity checks
- No notification triggers (e.g. application received, interview scheduled, offer extended)

---

## 3. Schema Design (Prisma)

### 3.1 New Enums

```prisma
enum RecruitmentRequestStatus {
  DRAFT
  PENDING
  APPROVED
  REJECTED
  COMPLETED
}

enum RecruitmentRequestType {
  NEW
  REPLACEMENT
}

enum JobPostingStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PUBLISHED
  FILLED
  EXPIRED
  CANCELLED
}

enum CandidateStatus {
  NEW
  SCREENING
  SHORTLISTED
  INTERVIEW_STAGE
  OFFER_PENDING
  HIRED
  REJECTED
  WITHDRAWN
}

enum ScreeningRecommendation {
  SELECT
  PAUSE
  DECLINE
}

enum InterviewType {
  HR_SCREENING
  TECHNICAL
  BEHAVIORAL
  PANEL
  FINAL
}

enum EndorsementLevel {
  STRONG_YES
  YES
  UNCERTAIN
  NO
}

enum HiringDecisionOutcome {
  OFFER_APPROVED
  OFFER_DECLINED
  SUSPENDED
}
```

### 3.2 New Models (Summary)

- **RecruitmentRequest** — requestId, position (jobName, teamId, supervisorId, type, replacementUserId), rationale (motivation, roleOverview, impact), staffing (currentCount, neededCount, salaryBracketMin/Max, currency, perks), schedule (targetJoinDate, priority), submittedBy, submittedAt, approvals (JSON or separate ApprovalStep table), status, linkedJobPostingId, linkedUserId
- **JobPosting** — postingId, recruitmentRequestId, position (jobName, teamId, workType, workMode), description (synopsis, duties, qualifications), prerequisites (education, experienceYears, languages, techSkills), kpis (JSON), platforms (string[]), status, postedAt, expiresAt, closedAt, approvedBy (array)
- **Candidate** — candidateId, jobPostingId, source (enum), referralUserId, personalInfo (JSON), career (JSON), applicationResponses (JSON), status, pipeline (appliedAt, screenedAt, screenedBy, screeningScore, interviews JSON, offerExtendedAt, hiredAt), rejection (JSON), created/updated
- **CvScreening** — candidateId, jobPostingId, assessments (factor, importance, rating, notes)[], aggregateRating, recommendation, nextPhase, screenedBy, screenedAt, approvedBy, approvedAt, interviewScheduled, rejectionSent
- **InterviewFeedback** — candidateId, interviewRound, interviewType, scheduledAt, completedAt, interviewers (JSON), ratings (JSON), totalRating, endorsement, remarks, nextAction, compiledBy, compiledAt, ranking
- **HiringDecision** — decisionId, candidateId, recruitmentRequestId, jobPostingId, candidateSummary (JSON), offer (totalPay, currency, perks, probationDays, targetStartDate, workType), selectionReasoning, keyAssets, attachments (JSON), submittedBy, approvals (JSON), finalDecision, offerDocumentUrl, candidateNotifiedAt, offerAccepted, acceptedAt, employeeId, onboardingId, created/updated

(Full Prisma field definitions should mirror DATABASE_SCHEMA_HR.md with PostgreSQL types; use Json for nested objects where appropriate.)

---

## 4. API Design

### 4.1 Base Path

- `/api/v1/hr/recruitment` (or `/api/v1/recruitment`)

### 4.2 Endpoints

| Method | Path                                           | Description                                              |
| ------ | ---------------------------------------------- | -------------------------------------------------------- |
| POST   | /recruitment/requests                          | Create recruitment request                               |
| GET    | /recruitment/requests                          | List (filter: status, teamId)                            |
| GET    | /recruitment/requests/:id                      | Get one with approvals                                   |
| PATCH  | /recruitment/requests/:id                      | Update draft; submit for approval                        |
| POST   | /recruitment/requests/:id/approve              | Record approval step (Finance/CEO/HR)                    |
| POST   | /recruitment/requests/:id/job-posting          | Create job posting from approved request                 |
| GET    | /recruitment/job-postings                      | List (filter: status, teamId)                            |
| GET    | /recruitment/job-postings/:id                  | Get one                                                  |
| PATCH  | /recruitment/job-postings/:id                  | Update; publish/close                                    |
| GET    | /recruitment/job-postings/:id/candidates       | List candidates for posting                              |
| POST   | /recruitment/job-postings/:id/applications     | Submit application (candidate or HR)                     |
| GET    | /recruitment/candidates/:id                    | Get candidate full                                       |
| PATCH  | /recruitment/candidates/:id/status             | Update pipeline status                                   |
| POST   | /recruitment/candidates/:id/screenings         | Create CV screening                                      |
| GET    | /recruitment/candidates/:id/screenings         | List screenings                                          |
| POST   | /recruitment/candidates/:id/interview-feedback | Submit interview feedback                                |
| GET    | /recruitment/candidates/:id/interview-feedback | List feedback                                            |
| POST   | /recruitment/hiring-decisions                  | Create hiring decision (select candidate, offer details) |
| GET    | /recruitment/hiring-decisions                  | List (filter: status)                                    |
| GET    | /recruitment/hiring-decisions/:id              | Get one                                                  |
| POST   | /recruitment/hiring-decisions/:id/approve      | Finance/CEO approval                                     |
| POST   | /recruitment/hiring-decisions/:id/accept-offer | Record candidate acceptance (or external callback)       |

---

## 5. Business Logic (from HR_LOGIC)

- **Request approval:** Team Lead → Finance → Executive Director → HR; budget > ETB 100K/month may require additional Finance approval.
- **Job posting:** Auto-publish when all approvals received, valid salary range, min 3 skills. Default expiry 30 days; auto-extend if < 5 applications at day 25 (notify HR); auto-close at 90 days.
- **Candidate scoring:** Weighted: experience 30%, skills 35%, education 15%, culture_fit 10%, communication 10%. Score 90–100 auto-shortlist; 75–89 shortlist; 50–74 review; <50 optional auto-decline.
- **Interview scheduling:** Conflict detection (leave, meetings); soft warnings for tentative or outside work hours.
- **Offer salary:** Base market rate; adjust by candidate score (e.g. 95+ 10% premium); internal equity check (flag if > 20% above team average); cap at budget max.

---

## 6. Types and DTOs

- RecruitmentRequest: Create, Update, Response, ApprovalStep
- JobPosting: Create, Update, Response
- Candidate: Create (application), Update, Response, PipelineUpdate
- CvScreening: Create, Response
- InterviewFeedback: Create, Response
- HiringDecision: Create, OfferDto, Approval, AcceptOffer

---

## 7. Implementation Phases (Turn-by-Turn)

### Phase 1: Schema and migrations

1. Add all recruitment enums and models to Prisma.
2. Add relations (RecruitmentRequest → Department/User; JobPosting → RecruitmentRequest; Candidate → JobPosting; etc.).
3. Run migration.

### Phase 2: Types package

4. Add recruitment enums and DTOs under `packages/types/src/hr/recruitment/`.
5. Export from package index.

### Phase 3: Recruitment request and job posting

6. Implement RecruitmentRequest CRUD and state machine (draft → submit → approve/reject).
7. Integrate with Approval Workflow (or inline approvals JSON).
8. Implement Create Job Posting from approved request.
9. Implement JobPosting CRUD and publish/expire logic; scheduled job for expiry and extension rules.
10. Expose request and job posting endpoints.

### Phase 4: Applications and candidates

11. Implement Candidate create (application) and update status.
12. Implement list candidates by posting with filters.
13. Expose application and candidate endpoints; file upload for resume.

### Phase 5: CV screening

14. Implement CvScreening create with aggregate rating calculation.
15. Implement candidate scoring algorithm (configurable weights); optional auto-shortlist/decline by score.
16. Expose screening endpoints; link to interview scheduling.

### Phase 6: Interview feedback

17. Implement InterviewFeedback create; compute total rating and ranking.
18. Implement interview scheduling (calendar conflict check if calendar service exists).
19. Expose interview feedback endpoints.

### Phase 7: Hiring decision and offer

20. Implement HiringDecision create with offer details; approval chain (Finance → CEO).
21. Implement offer salary calculation (market rate, score adjustment, internal equity flag).
22. Generate offer document (template + storage); notify candidate.
23. Implement accept-offer (create User/Employee, trigger onboarding); expose hiring decision endpoints.

### Phase 8: Notifications and RBAC

24. Add notifications: application received, screening done, interview scheduled, offer extended, offer accepted.
25. Register RBAC resources: recruitment_request, job_posting, candidate; assign to HR and hiring manager roles.
26. Integration tests and API docs.

---

## 8. Dependencies

- **Approval Workflow:** Reuse for request and hiring decision approvals.
- **Notifications:** Core Notifications for all recruitment events.
- **Storage:** Resumes, offer documents.
- **Onboarding:** Hiring decision acceptance triggers onboarding checklist creation (see Implementation Plan 3).

---

## 9. Testing

- Unit: Scoring algorithm; offer salary calculation; expiry rules.
- Integration: Full flow: request → approve → job posting → application → screening → interview feedback → hiring decision → approve → accept → employee created.
- E2E: Submit application as candidate; HR screens and schedules interview; hiring manager submits feedback; HR creates decision and CEO approves; offer accepted and onboarding created.

---

## 10. Acceptance Criteria

- [x] Recruitment request lifecycle with approvals and job posting creation (requests CRUD, submit, approve, create job posting from request).
- [ ] Job posting publish/expire/extension rules and candidate application submission.
- [ ] CV screening with ratings and recommendation; candidate status progression.
- [ ] Interview feedback with ranking; hiring decision with offer and approval.
- [ ] Offer acceptance creates user and triggers onboarding; notifications sent at each stage.

---

## 11. Implemented (Current System)

- **Schema:** All recruitment enums and models added to `apps/api/prisma/schema.prisma` (RecruitmentRequest, JobPosting, Candidate, CvScreening, InterviewFeedback, HiringDecision); relations to User, Department, Position.
- **Types:** `packages/types/src/recruitment/` (request, job-posting, candidate, cv-screening, interview-feedback, hiring-decision) and export from package index.
- **RBAC:** RecruitmentRequestPermissions, JobPostingPermissions, CandidatePermissions, HiringDecisionPermissions in `permissions.constants.ts`.
- **API:** `GET/POST /api/v1/hr/recruitment/requests`, `GET/PATCH /api/v1/hr/recruitment/requests/:id`, `POST .../requests/:id/submit`, `POST .../requests/:id/approve`, `POST .../requests/:id/job-posting`. Current user for create/approve from request principal (Keycloak).

**Remaining:** Job postings list/get/update and list candidates/create application; candidate get/update status; CV screenings and interview feedback create/list; hiring decisions create/list/get/approve/accept-offer; scheduled job for posting expiry; notifications.
