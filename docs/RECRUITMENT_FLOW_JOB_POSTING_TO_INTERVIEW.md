# BLIH Recruitment Flow: Job Posting to Interview Stage

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Models](#database-models)
4. [Recruitment Workflow](#recruitment-workflow)
5. [API Endpoints](#api-endpoints)
6. [Business Logic](#business-logic)
7. [State Transitions](#state-transitions)
8. [RBAC Permissions](#rbac-permissions)
9. [Integration Points](#integration-points)
10. [Error Handling](#error-handling)

---

## Overview

The BLIH Recruitment System implements a comprehensive candidate management workflow from job posting through to interview stage. This documentation covers the post-approval phase where published jobs receive applications, candidates are screened, shortlisted, and scheduled for interviews.

**Workflow**: PUBLISHED → Application → APPLIED → SCREENING → SHORTLISTED → INTERVIEW

### Key Features

- **Public job application** with customizable forms
- **Application form validation** based on job-specific configuration
- **Applicant status tracking** with full audit history
- **Bulk status updates** for efficient candidate management
- **Multi-round interview scheduling** with flexible participant management
- **Interview feedback collection** with structured question responses
- **Profile scoring** for candidate quality assessment
- **Duplicate prevention** (job + email uniqueness)

---

## System Architecture

### Module Structure

```
apps/api/src/domains/hr/recruitment/
├── applicants.controller.ts              # Applicant CRUD and status management
├── interviews.controller.ts              # Interview scheduling and feedback
├── dto/
│   ├── applicant.dto.ts                  # Applicant-related DTOs
│   ├── interview.dto.ts                  # Interview-related DTOs
│   └── offer.dto.ts                      # Offer-related DTOs
├── use-cases/
│   ├── applicants.usecases.ts            # Applicant business logic
│   ├── interviews.usecases.ts            # Interview business logic
│   └── recruitment.usecase-helpers.ts    # Shared helper functions
└── recruitment-transition.service.ts     # Hiring transitions
```

### Technology Stack

- **Backend**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Keycloak
- **Authorization**: RBAC with role-based guards
- **API Documentation**: Swagger/OpenAPI

---

## Database Models

### Applicant

Stores candidate application data and status history.

```prisma
model Applicant {
  id                    String                   @id @default(uuid())
  jobId                 String                   @map("job_id")
  job                   Job                      @relation(fields: [jobId], references: [id])
  applicationFormId     String?                  @map("application_form_id")
  applicationForm       JobApplicationForm?      @relation("ApplicantForm", fields: [applicationFormId])
  firstName             String                   @map("first_name")
  lastName              String                   @map("last_name")
  email                 String
  emailNormalized       String                   @map("email_normalized")
  phone                 String?
  resumeUrl             String?                  @map("resume_url")
  linkedinUrl           String?                  @map("linkedin_url")
  portfolioUrl          String?                  @map("portfolio_url")
  githubUrl             String?                  @map("github_url")
  source                CandidateSource          @default(COMPANY_SITE)
  referredById          String?                  @map("referred_by_id")
  referredBy            User?                    @relation("ApplicantReferral")
  currentCompany        String?                  @map("current_company")
  currentPosition       String?                  @map("current_position")
  yearsExperience       Int?                     @map("years_experience")
  location              String?
  nationality           String?
  expectedSalary        Decimal?                 @map("expected_salary")
  currentSalary         Decimal?                 @map("current_salary")
  educationLevel        String?                  @map("education_level")
  highestDegree         String?                  @map("highest_degree")
  skills                String[]                 @default([])
  status                ApplicantStatus          @default(APPLIED)
  coverLetter           String?                  @map("cover_letter")
  sourceSnapshot        Json?                    @map("source_snapshot")
  customFieldValues     Json?                    @map("custom_field_values")
  appliedAt             DateTime                 @default(now()) @map("applied_at")
  screeningAt           DateTime?                @map("screening_at")
  shortlistedAt         DateTime?                @map("shortlisted_at")
  interviewAt           DateTime?                @map("interview_at")
  waitlistAt            DateTime?                @map("waitlist_at")
  offerAt               DateTime?                @map("offer_at")
  hiredAt               DateTime?                @map("hired_at")
  rejectedAt            DateTime?                @map("rejected_at")
  withdrawnAt           DateTime?                @map("withdrawn_at")
  lastActivityAt        DateTime?                @map("last_activity_at")
  profileScore          Float?                   @map("profile_score")
  createdAt             DateTime                 @default(now())
  updatedAt             DateTime                 @updatedAt
  educations            ApplicantEducation[]
  experiences           ApplicantExperience[]
  interviewParticipants InterviewParticipant[]
  offers                Offer[]
  statusHistory         ApplicantStatusHistory[]
  cvScreenings          CvScreening[]
  employee              Employee?
}
```

**Key Fields**:

- `status`: APPLIED, SCREENING, SHORTLISTED, INTERVIEW, OFFER, HIRED, REJECTED, WITHDRAWN, WAITLIST
- `source`: COMPANY_SITE, LINKEDIN, REFERRAL, PORTAL, AGENCY, OTHER
- `profileScore`: Computed quality score (0-100) based on experience, skills, links, resume
- Timestamp fields track status transition times

**Unique Constraint**: `jobId + emailNormalized` prevents duplicate applications

### ApplicantEducation

Stores applicant educational background.

```prisma
model ApplicantEducation {
  id          String    @id @default(uuid())
  applicantId String    @map("applicant_id")
  applicant   Applicant @relation(fields: [applicantId])
  institution String
  degree      String
  field       String
  startDate   DateTime? @map("start_date")
  endDate     DateTime? @map("end_date")
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### ApplicantExperience

Stores applicant work experience.

```prisma
model ApplicantExperience {
  id          String    @id @default(uuid())
  applicantId String    @map("applicant_id")
  applicant   Applicant @relation(fields: [applicantId])
  company     String
  title       String
  startDate   DateTime? @map("start_date")
  endDate     DateTime? @map("end_date")
  description String?   @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### ApplicantStatusHistory

Audit trail for applicant status changes.

```prisma
model ApplicantStatusHistory {
  id          String           @id @default(uuid())
  applicantId String           @map("applicant_id")
  applicant   Applicant        @relation(fields: [applicantId])
  changedById String?          @map("changed_by_id")
  changedBy   User?            @relation("ApplicantStatusChangedBy")
  fromStatus  ApplicantStatus? @map("from_status")
  toStatus    ApplicantStatus  @map("to_status")
  notes       String?          @db.Text
  changedAt   DateTime         @default(now()) @map("changed_at")
}
```

### InterviewSession

Manages interview sessions with multiple participants.

```prisma
model InterviewSession {
  id              String                  @id @default(uuid())
  jobId           String                  @map("job_id")
  job             Job                     @relation(fields: [jobId])
  type            InterviewType           // HR_SCREENING, TECHNICAL, BEHAVIORAL, PANEL, CULTURAL_FIT
  round           Int                     @default(1)
  status          InterviewStatus         @default(SCHEDULED)
  scheduledAt     DateTime                @map("scheduled_at")
  durationMinutes Int?                    @map("duration_minutes")
  location        String?                 @db.VarChar(255)
  meetingUrl      String?                 @map("meeting_url")
  createdById     String                  @map("created_by_id")
  createdBy       User                    @relation("InterviewSessionCreator")
  createdAt       DateTime                @default(now())
  updatedAt       DateTime                @updatedAt
  participants    InterviewParticipant[]
  interviewers    InterviewerAssignment[]
}
```

**Key Fields**:

- `type`: HR_SCREENING, TECHNICAL, BEHAVIORAL, PANEL, CULTURAL_FIT
- `status`: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
- `round`: Interview round number (1, 2, 3, etc.)

### InterviewParticipant

Links applicants to interview sessions with attendance tracking.

```prisma
model InterviewParticipant {
  id               String                    @id @default(uuid())
  sessionId        String                    @map("session_id")
  session          InterviewSession          @relation(fields: [sessionId])
  applicantId      String                    @map("applicant_id")
  applicant        Applicant                 @relation(fields: [applicantId])
  attendanceStatus InterviewAttendanceStatus @default(SCHEDULED)
  createdAt        DateTime                  @default(now())
  feedbacks        InterviewFeedback[]
}
```

**Attendance Status**: SCHEDULED, CANCELLED, NO_SHOW, COMPLETED

### InterviewerAssignment

Assigns interviewers to sessions with role definitions.

```prisma
model InterviewerAssignment {
  id            String              @id @default(uuid())
  sessionId     String              @map("session_id")
  session       InterviewSession    @relation(fields: [sessionId])
  interviewerId String              @map("interviewer_id")
  interviewer   User                @relation("InterviewSessionInterviewer")
  role          String?             @db.VarChar(100)
  createdAt     DateTime            @default(now())
  feedbacks     InterviewFeedback[]
}
```

### InterviewFeedback

Stores interviewer evaluation data.

```prisma
model InterviewFeedback {
  id                String                @id @default(uuid())
  participantId     String                @map("participant_id")
  participant       InterviewParticipant  @relation("InterviewFeedbackParticipant")
  assignmentId      String                @map("assignment_id")
  assignment        InterviewerAssignment @relation("InterviewFeedbackAssignment")
  score             Float?
  endorsement       EndorsementLevel?
  strengths         String[]              @default([])
  weaknesses        String[]              @default([])
  questionResponses Json?                 @map("question_responses")
  notes             String?               @db.Text
  isDraft           Boolean               @default(true)
  submittedAt       DateTime?             @map("submitted_at")
  createdAt         DateTime              @default(now())
  updatedAt         DateTime              @updatedAt
}
```

**Endorsement Level**: YES, STRONG_YES, NO, STRONG_NO

---

## Recruitment Workflow

### Phase 1: Job Posting (PUBLISHED)

**Trigger**: HR calls publish endpoint after all approvals complete

**Process**:

1. System validates job is READY_TO_POST
2. Sets `publishedAt` timestamp
3. Updates job status to PUBLISHED
4. Job becomes accessible via public API

**Public Job Listing Endpoint**:

```http
GET /api/v1/hr/recruitment/jobs?status=PUBLISHED
```

**Response Example**:

```json
{
  "id": "uuid-job-id",
  "title": "Senior Frontend Engineer",
  "slug": "senior-frontend-engineer",
  "status": "PUBLISHED",
  "description": {...},
  "requiredSkills": ["React", "TypeScript"],
  "salaryMin": 2000,
  "salaryMax": 3000,
  "currency": "USD",
  "publishedAt": "2026-05-06T10:00:00.000Z",
  "applicationDeadline": "2026-06-30T23:59:59.000Z"
}
```

### Phase 2: Candidate Application (APPLIED)

**Endpoint**: `POST /api/v1/hr/recruitment/jobs/{id}/apply` (Public)

**Request Example**:

```json
{
  "firstName": "Abel",
  "lastName": "Tesfaye",
  "email": "abel.tesfaye@example.com",
  "phone": "+251912345678",
  "resumeUrl": "https://cdn.example.com/cv/abel.pdf",
  "linkedinUrl": "https://linkedin.com/in/abeltesfaye",
  "portfolioUrl": "https://abel.dev",
  "githubUrl": "https://github.com/abeltesfaye",
  "source": "COMPANY_SITE",
  "currentCompany": "TechCorp",
  "currentPosition": "Senior Engineer",
  "yearsExperience": 6,
  "location": "Addis Ababa",
  "nationality": "Ethiopian",
  "expectedSalary": 2500,
  "currentSalary": 2000,
  "educationLevel": "Bachelor's",
  "highestDegree": "BSc Computer Science",
  "skills": ["React", "TypeScript", "Node.js", "GraphQL"],
  "coverLetter": "I am excited to apply...",
  "educations": [
    {
      "institution": "Addis Ababa University",
      "degree": "BSc",
      "field": "Computer Science",
      "startDate": "2015-09-01",
      "endDate": "2019-06-30"
    }
  ],
  "experiences": [
    {
      "company": "TechCorp",
      "title": "Senior Engineer",
      "startDate": "2022-01-01",
      "endDate": null,
      "description": "Leading frontend team..."
    }
  ],
  "customFieldValues": {
    "portfolioUrl": "https://abel.dev",
    "availabilityDate": "2026-06-01"
  }
}
```

**Validations**:

- Job must be PUBLISHED
- Core fields required: firstName, lastName, email, resumeUrl
- Application form fields validated based on job configuration
- Email normalized for duplicate detection
- Skills normalized (lowercase, trimmed, deduplicated)
- Profile score computed (0-100 based on experience, skills, links, resume)

**Profile Score Calculation**:

```typescript
function computeApplicantProfileScore({
  yearsExperience,
  hasResume,
  skillsCount,
  hasLinks,
}: {
  yearsExperience: number | null;
  hasResume: boolean;
  skillsCount: number;
  hasLinks: boolean;
}): number | null {
  let score = 0;

  // Experience: up to 30 points
  if (yearsExperience && yearsExperience > 0) {
    score += Math.min(yearsExperience * 3, 30);
  }

  // Resume: 20 points
  if (hasResume) score += 20;

  // Skills: up to 30 points (3 points per skill, max 10)
  score += Math.min(skillsCount * 3, 30);

  // Links: 20 points
  if (hasLinks) score += 20;

  return score;
}
```

**Response**:

```json
{
  "id": "uuid-applicant-id",
  "jobId": "uuid-job-id",
  "firstName": "Abel",
  "lastName": "Tesfaye",
  "email": "abel.tesfaye@example.com",
  "status": "APPLIED",
  "profileScore": 85,
  "appliedAt": "2026-05-06T11:30:00.000Z",
  "educations": [...],
  "experiences": [...],
  "statusHistory": [
    {
      "fromStatus": null,
      "toStatus": "APPLIED",
      "changedAt": "2026-05-06T11:30:00.000Z"
    }
  ]
}
```

**Business Rules**:

- Duplicate applications prevented (same job + email)
- Job metrics updated (applicationsCount incremented)
- Notification sent to job creator
- Application form configuration validated (required fields, sections, custom fields)

### Phase 3: Applicant Screening (SCREENING)

**Overview**: Screening is the initial HR review phase where applications are evaluated against job requirements to determine which candidates should proceed to the next stage. This phase involves reviewing resumes, cover letters, and application data to assess basic qualifications.

**Who Performs Screening**:

- HR Recruiters
- HR Managers
- Hiring Managers (for senior positions)

**Screening Criteria**:

- **Minimum Qualifications**: Education level, years of experience, required skills
- **Salary Expectations**: Alignment with job salary range
- **Location**: Geographic fit for the position
- **Resume Quality**: Completeness, formatting, professionalism
- **Cover Letter**: Relevance, writing quality, interest in the role
- **Profile Score**: Automated score (0-100) used as initial filter
- **Custom Fields**: Job-specific requirements (e.g., certifications, languages)

**Screening Workflow**:

```mermaid
flowchart TD
    A[APPLICANT - APPLIED] --> B{Profile Score >= Threshold?}
    B -->|No| C[Auto-REJECT or Manual Review]
    B -->|Yes| D[HR Screening Review]
    D --> E{Meets Minimum Qualifications?}
    E -->|No| F[REJECT with Reason]
    E -->|Yes| G{Salary Alignment?}
    G -->|No| H[REJECT or WAITLIST]
    G -->|Yes| I{Resume Quality Acceptable?}
    I -->|No| J[REJECT or Request Updated Resume]
    I -->|Yes| K[SHORTLIST or SCREENING]
    K --> L[Schedule Next Stage]
```

**Screening Process Steps**:

1. **Initial Triage** (Automated):
   - Filter by profile score threshold (configurable per job)
   - Check for duplicate applications
   - Validate required fields completeness

2. **Document Review** (Manual):
   - Review resume for experience relevance
   - Check education qualifications
   - Verify skills match job requirements
   - Assess cover letter quality and fit

3. **Qualification Check**:
   - Years of experience vs. job requirement
   - Education level vs. job requirement
   - Required skills presence
   - Industry experience relevance

4. **Salary Alignment**:
   - Compare expected salary with job range
   - Assess negotiation flexibility
   - Consider total compensation package

5. **Screening Decision**:
   - **SHORTLIST**: Pass screening, proceed to interview
   - **REJECT**: Does not meet requirements
   - **SCREENING**: Additional review needed
   - **WAITLIST**: Qualified but position filled/on hold

**Endpoint**: `POST /api/v1/hr/recruitment/applicants/{id}/status`

**Request**:

```json
{
  "status": "SCREENING",
  "notes": "Initial HR review in progress - checking qualifications and salary alignment"
}
```

**Process**:

1. Validates status transition (APPLIED → SCREENING)
2. Updates applicant status
3. Sets `screeningAt` timestamp
4. Records status history with notes
5. Updates job metrics
6. Triggers notification to hiring manager (if configured)

**Valid Transitions to SCREENING**:

- From: APPLIED

**Screening Notes Best Practices**:

- Document specific reasons for screening decisions
- Note which criteria were met/not met
- Record any concerns or red flags
- Include salary alignment assessment
- Note any follow-up actions needed

**Response**: Updated applicant with SCREENING status

**Screening Duration Metrics**:

- Average time to screen: 2-5 business days
- Target screening SLA: 10 business days from application
- Screening completion rate tracked per job

### Phase 4: Shortlisting (SHORTLISTED)

**Overview**: Shortlisting is the process of selecting qualified candidates from the screened pool to proceed to the interview stage. This is a critical decision point where HR and hiring managers collaborate to identify the most promising candidates.

**Who Performs Shortlisting**:

- HR Recruiters (initial shortlist)
- Hiring Managers (final approval)
- HR Managers (for senior/critical positions)

**Shortlisting Criteria**:

- **Qualification Match**: Meets or exceeds minimum requirements
- **Experience Relevance**: Direct industry or role experience
- **Skills Alignment**: Strong match with required and preferred skills
- **Cultural Fit Indicators**: Values, work style, company alignment
- **Career Progression**: Demonstrated growth and achievement
- **References/Portfolio**: Strong professional presence
- **Communication Quality**: Clear, professional communication
- **Availability**: Timeline alignment with hiring needs

**Shortlisting Workflow**:

```mermaid
flowchart TD
    A[SCREENING Complete] --> B{Candidate Meets Criteria?}
    B -->|No| C[REJECT with Detailed Feedback]
    B -->|Yes| D{Hiring Manager Review Needed?}
    D -->|No| E[Direct SHORTLIST]
    D -->|Yes| F[Send to Hiring Manager]
    F --> G{Hiring Manager Approval?}
    G -->|No| H[REJECT or Request More Info]
    G -->|Yes| I[SHORTLIST Candidate]
    I --> J[Rank Candidates by Priority]
    J --> K{Interview Slots Available?}
    K -->|Yes| L[Schedule Interviews]
    K -->|No| M[WAITLIST or Hold]
```

**Shortlisting Process Steps**:

1. **Candidate Evaluation**:
   - Compare against job requirements matrix
   - Assess experience depth and relevance
   - Evaluate skill proficiency level
   - Review portfolio/work samples
   - Check social media/professional profiles

2. **Comparative Analysis**:
   - Rank candidates against each other
   - Identify top performers
   - Note unique strengths of each candidate
   - Consider diversity and inclusion goals
   - Assess team fit potential

3. **Hiring Manager Review** (if required):
   - Present shortlist with rationale
   - Share candidate profiles and resumes
   - Discuss concerns or questions
   - Get approval for interview scheduling
   - Note any specific interview focus areas

4. **Shortlist Decision**:
   - **SHORTLIST**: Approved for interview
   - **WAITLIST**: Qualified but no immediate slot
   - **REJECT**: Not suitable for position
   - **SCREENING**: Needs additional review

5. **Prioritization**:
   - Rank shortlisted candidates by fit
   - Assign priority levels (High, Medium, Low)
   - Note interview scheduling preferences
   - Identify any scheduling constraints

**Endpoint**: `POST /api/v1/hr/recruitment/applicants/{id}/status`

**Request**:

```json
{
  "status": "SHORTLISTED",
  "notes": "Passed HR screening - 6 years experience, strong React/TypeScript skills, portfolio reviewed, salary within range. Hiring manager approved for technical interview."
}
```

**Process**:

1. Validates status transition (SCREENING → SHORTLISTED or APPLIED → SHORTLISTED)
2. Updates applicant status
3. Sets `shortlistedAt` timestamp
4. Records status history with detailed notes
5. Updates job metrics (shortlistedCount incremented)
6. Triggers notification to hiring manager (if configured)

**Valid Transitions to SHORTLISTED**:

- From: SCREENING, APPLIED

**Shortlisting Notes Best Practices**:

- Document specific strengths that led to shortlisting
- Note any concerns to address in interview
- Include hiring manager feedback
- Record ranking or priority level
- Note interview scheduling preferences

**Response**: Updated applicant with SHORTLISTED status

**Bulk Shortlisting**:

```http
POST /api/v1/hr/recruitment/applicants/bulk-status
```

**Use Cases for Bulk Shortlisting**:

- Batch processing after group screening session
- Multiple candidates meeting same criteria
- Rapid shortlisting for high-volume hiring
- Re-screening after job requirement changes

**Request**:

```json
{
  "applicantIds": ["uuid-1", "uuid-2", "uuid-3"],
  "status": "SHORTLISTED",
  "notes": "Batch shortlist after HR screening - all meet minimum qualifications, salary alignment confirmed, resumes reviewed"
}
```

**Response**:

```json
{
  "status": "SHORTLISTED",
  "requestedCount": 3,
  "updatedCount": 3,
  "applicants": [...]
}
```

**Bulk Update Constraints**:

- Only SHORTLISTED and REJECTED statuses allowed
- All applicants must exist
- All status transitions must be valid
- Atomic transaction (all or nothing)
- Individual validation for each applicant

**Bulk Rejection**:

```json
{
  "applicantIds": ["uuid-4", "uuid-5"],
  "status": "REJECTED",
  "notes": "Batch reject - insufficient experience, salary above range, missing required skills"
}
```

**Shortlisting Metrics**:

- Shortlist rate: (shortlisted / applications) × 100
- Average time to shortlist: 3-7 business days
- Target shortlist SLA: 10 business days from application
- Shortlist-to-interview conversion rate tracked per job

### Phase 5: Interview Scheduling (INTERVIEW)

**Overview**: Interview scheduling involves coordinating between shortlisted candidates, interviewers, and available time slots to arrange interview sessions. This phase includes determining interview types, rounds, participant assignments, and logistics.

**Who Schedules Interviews**:

- HR Recruiters (primary)
- HR Coordinators
- Hiring Managers (for direct scheduling)
- Interview Scheduling System (automated)

**Interview Types**:

- **HR_SCREENING**: Initial screening call with HR (30-45 min)
- **TECHNICAL**: Technical skills assessment (60-90 min)
- **BEHAVIORAL**: Behavioral/cultural fit interview (45-60 min)
- **PANEL**: Multiple interviewers (60-90 min)
- **CULTURAL_FIT**: Culture and values alignment (45-60 min)

**Interview Round Structure**:

- **Round 1**: HR Screening or Initial Technical
- **Round 2**: Deep Technical or Behavioral
- **Round 3**: Panel or Final Interview
- **Round 4+**: Additional rounds as needed (executive, presentation, etc.)

**Interview Scheduling Workflow**:

```mermaid
flowchart TD
    A[SHORTLISTED Candidate] --> B{Interview Stage Update}
    B --> C[Set Status to INTERVIEW]
    C --> D{Determine Interview Type}
    D --> E[Select Interview Type]
    E --> F{Determine Round}
    F --> G[Assign Round Number]
    G --> H{Select Interviewers}
    H --> I[Check Availability]
    I --> J{Check Candidate Availability}
    J --> K[Schedule Time Slot]
    K --> L[Reserve Room/Platform]
    L --> M[Send Invitations]
    M --> N[Create Interview Session]
    N --> O[Confirm with All Parties]
```

**Step 1: Move Applicant to Interview Stage**

**Endpoint**: `POST /api/v1/hr/recruitment/applicants/{id}/status`

**Request**:

```json
{
  "status": "INTERVIEW",
  "notes": "Shortlisted for technical interview - approved by hiring manager, scheduling Round 1 technical assessment"
}
```

**Process**:

1. Validates status transition (SHORTLISTED → INTERVIEW or SCREENING → INTERVIEW)
2. Updates applicant status
3. Sets `interviewAt` timestamp
4. Records status history with notes
5. Updates job metrics

**Valid Transitions to INTERVIEW**:

- From: SHORTLISTED, SCREENING

**Response**: Updated applicant with INTERVIEW status

**Step 2: Create Interview Session**

**Endpoint**: `POST /api/v1/hr/recruitment/interviews`

**Interview Scheduling Considerations**:

1. **Interview Type Selection**:
   - HR_SCREENING: For initial qualification check
   - TECHNICAL: For skills assessment
   - BEHAVIORAL: For soft skills evaluation
   - PANEL: For comprehensive evaluation
   - CULTURAL_FIT: For values alignment

2. **Round Assignment**:
   - Round 1: Initial screening/technical
   - Round 2: Deep dive/behavioral
   - Round 3: Final/panel
   - Round 4+: Specialized rounds

3. **Interviewer Selection**:
   - HR for screening interviews
   - Technical leads for technical interviews
   - Hiring managers for behavioral/panel
   - Team members for cultural fit
   - Cross-functional interviewers for senior roles

4. **Availability Coordination**:
   - Check interviewer calendar availability
   - Confirm candidate availability
   - Avoid scheduling conflicts
   - Consider time zones for remote interviews

5. **Logistics Planning**:
   - Reserve meeting room (in-person)
   - Set up video conference link (remote)
   - Prepare interview materials
   - Send calendar invitations

**Request Example**:

```json
{
  "jobId": "uuid-job-id",
  "type": "TECHNICAL",
  "round": 1,
  "scheduledAt": "2026-05-15T10:00:00.000Z",
  "durationMinutes": 60,
  "location": "Meeting Room A",
  "meetingUrl": "https://zoom.us/j/123456789",
  "applicantIds": ["uuid-applicant-1", "uuid-applicant-2"],
  "interviewers": [
    {
      "interviewerId": "uuid-interviewer-1",
      "role": "Panelist"
    },
    {
      "interviewerId": "uuid-interviewer-2",
      "role": "Technical Lead"
    }
  ]
}
```

**Validations**:

- At least one applicant required
- At least one interviewer required
- All applicants must belong to the job
- All interviewers must be active users linked to employee records
- No duplicate active round for same applicants (conflict prevention)
- Scheduled time must be in the future
- Duration must be reasonable (15-180 minutes)

**Response**:

```json
{
  "id": "uuid-session-id",
  "jobId": "uuid-job-id",
  "type": "TECHNICAL",
  "round": 1,
  "status": "SCHEDULED",
  "scheduledAt": "2026-05-15T10:00:00.000Z",
  "durationMinutes": 60,
  "location": "Meeting Room A",
  "meetingUrl": "https://zoom.us/j/123456789",
  "participants": [
    {
      "id": "uuid-participant-1",
      "applicantId": "uuid-applicant-1",
      "attendanceStatus": "SCHEDULED",
      "applicant": {
        "firstName": "Abel",
        "lastName": "Tesfaye",
        "email": "abel.tesfaye@example.com",
        "status": "INTERVIEW"
      }
    }
  ],
  "interviewers": [
    {
      "id": "uuid-assignment-1",
      "interviewerId": "uuid-interviewer-1",
      "role": "Panelist",
      "interviewer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@blih.com"
      }
    }
  ],
  "createdAt": "2026-05-06T12:00:00.000Z"
}
```

**Business Rules**:

- Interviewer deduplication (same interviewer can only have one role per session)
- Participant activity timestamp updated
- Job metrics updated (interviewsCount incremented)
- Session status defaults to SCHEDULED
- Conflict prevention for duplicate rounds

**Interview Scheduling Best Practices**:

- Schedule interviews 2-5 business days in advance
- Provide interview materials to interviewers beforehand
- Send confirmation to all participants
- Include interview agenda and focus areas
- Allow buffer time between interviews
- Consider candidate time zone for remote interviews
- Have backup interviewers available

**Scheduling Metrics**:

- Average scheduling lead time: 3-5 business days
- Interview confirmation rate: target 95%+
- No-show rate: target <10%
- Reschedule rate: target <15%

### Phase 6: Interview Execution

**Overview**: Interview execution is the actual conduct of the interview session, including managing attendance, handling reschedules, and tracking interview progress. This phase ensures interviews proceed smoothly and attendance is accurately recorded.

**Who Manages Interview Execution**:

- HR Recruiters (coordination)
- Interviewers (conducting interviews)
- HR Coordinators (logistics)
- Hiring Managers (oversight)

**Interview Execution Workflow**:

```mermaid
flowchart TD
    A[Interview Scheduled] --> B{Interview Day Arrives}
    B --> C[Send Reminders to All Parties]
    C --> D{Candidate Confirms Attendance?}
    D -->|No| E[Mark as NO_SHOW or Reschedule]
    D -->|Yes| F[Interview Conducted]
    F --> G[Update Session Status to IN_PROGRESS]
    G --> H[Interview Completed]
    H --> I[Update Session Status to COMPLETED]
    I --> J[Mark Participant Attendance as COMPLETED]
    J --> K{Interviewer Feedback Submitted?}
    K -->|No| L[Follow Up for Feedback]
    K -->|Yes| M[Proceed to Evaluation]
    E --> N[Reschedule Interview]
    N --> O[Update Session Details]
    O --> P[Send New Invitations]
```

**Update Interview Session**

**Endpoint**: `PATCH /api/v1/hr/recruitment/interviews/{id}`

**Use Cases**:

1. **Reschedule Interview**:
   - Change scheduled date/time
   - Adjust duration
   - Update location
   - Change meeting URL

2. **Modify Participants**:
   - Add additional candidates (if no feedback submitted)
   - Remove candidates (if no feedback submitted)
   - Handle candidate cancellations

3. **Modify Interviewers**:
   - Add replacement interviewers (if no feedback submitted)
   - Remove interviewers (if no feedback submitted)
   - Update interviewer roles

4. **Change Interview Type**:
   - Switch from TECHNICAL to PANEL
   - Adjust interview format

5. **Update Session Status**:
   - Mark as IN_PROGRESS when interview starts
   - Mark as COMPLETED when interview ends
   - Mark as CANCELLED if cancelled

**Request Example (Reschedule)**:

```json
{
  "scheduledAt": "2026-05-16T14:00:00.000Z",
  "durationMinutes": 75,
  "location": "Meeting Room B",
  "meetingUrl": "https://zoom.us/j/987654321"
}
```

**Request Example (Add Participant)**:

```json
{
  "applicantIds": ["uuid-applicant-1", "uuid-applicant-2", "uuid-applicant-3"]
}
```

**Request Example (Update Status)**:

```json
{
  "status": "IN_PROGRESS"
}
```

**Validations**:

- Cannot remove participants with submitted feedback
- Cannot remove interviewers with submitted feedback
- Round change validates no duplicate active round
- Status transition validated (SCHEDULED → IN_PROGRESS → COMPLETED)
- At least one participant required after removal
- At least one interviewer required after removal

**Response**: Updated interview session with new details

**Update Attendance**

**Endpoint**: `PATCH /api/v1/hr/recruitment/interviews/{id}/participants/{participantId}/attendance`

**Attendance Status Options**:

- **SCHEDULED**: Interview is scheduled (default)
- **COMPLETED**: Candidate attended and interview completed
- **NO_SHOW**: Candidate did not attend without prior notice
- **CANCELLED**: Interview cancelled (by candidate or company)

**Request**:

```json
{
  "attendanceStatus": "COMPLETED"
}
```

**Valid Transitions**:

- SCHEDULED → COMPLETED (candidate attended)
- SCHEDULED → CANCELLED (cancelled beforehand)
- SCHEDULED → NO_SHOW (candidate missed without notice)
- CANCELLED → SCHEDULED (rescheduled)

**Response**: Updated interview session with new attendance status

**Attendance Tracking Best Practices**:

- Mark attendance immediately after interview
- Document reason for NO_SHOW in notes
- Record cancellation reasons
- Track no-show patterns for candidates
- Update attendance if rescheduled

**Interview Execution Best Practices**:

- Send reminders 24 hours before interview
- Confirm attendance on interview day
- Have backup interviewers available
- Prepare interview materials in advance
- Test video conference setup before interview
- Start interviews on time
- Keep interviews within scheduled duration
- Document any interview deviations

**Rescheduling Process**:

1. Identify reason for reschedule (candidate request, interviewer conflict, etc.)
2. Check availability for new time slot
3. Confirm with all parties
4. Update interview session details
5. Send new invitations
6. Cancel old calendar events
7. Document reschedule reason

**No-Show Handling**:

1. Mark attendance as NO_SHOW
2. Attempt to contact candidate
3. Determine if reschedule needed
4. Document no-show in candidate notes
5. Consider impact on candidacy
6. Update job metrics

**Execution Metrics**:

- On-time start rate: target 90%+
- Attendance rate: target 95%+
- No-show rate: target <10%
- Reschedule rate: target <15%
- Average interview duration variance: ±10%

### Phase 7: Interview Feedback

**Overview**: Interview feedback is the structured evaluation of candidate performance during interviews. This phase involves collecting detailed assessments from interviewers, aggregating scores, and making hiring recommendations based on the collective feedback.

**Who Provides Feedback**:

- Assigned interviewers (primary)
- Hiring managers (review and final decision)
- HR coordinators (aggregation and follow-up)

**Feedback Components**:

- **Overall Score**: Numerical rating (0-100) of candidate performance
- **Endorsement Level**: YES, STRONG_YES, NO, STRONG_NO
- **Strengths**: Specific positive attributes demonstrated
- **Weaknesses**: Areas for improvement or concerns
- **Question Responses**: Detailed answers to structured questions with scores
- **Notes**: Qualitative assessment and recommendations

**Feedback Workflow**:

```mermaid
flowchart TD
    A[Interview Completed] --> B[Interviewer Prepares Feedback]
    B --> C{Use Draft Mode?}
    C -->|Yes| D[Save as Draft]
    C -->|No| E[Submit Final Feedback]
    D --> F[Review and Complete Draft]
    F --> E
    E --> G[Score Computed]
    G --> H{All Interviewers Submitted?}
    H -->|No| I[Follow Up with Pending Interviewers]
    H -->|Yes| J[Aggregate All Feedback]
    J --> K[Calculate Average Score]
    K --> L[Review Endorsements]
    L --> M{Decision Required?}
    M -->|Yes| N[Hiring Manager Review]
    M -->|No| O[Proceed to Next Stage]
    N --> P{Candidate Approved?}
    P -->|Yes| Q[Move to OFFER or Next Round]
    P -->|No| R[REJECT or WAITLIST]
```

**Feedback Submission Process**:

1. **Interviewer Preparation**:
   - Review interview notes immediately after session
   - Recall specific examples and responses
   - Reference interview questions and candidate answers
   - Consider job requirements alignment

2. **Draft Feedback** (Optional):
   - Save initial thoughts as draft
   - Take time to reflect on performance
   - Consult with other interviewers if needed
   - Refine assessment before final submission

3. **Final Feedback Submission**:
   - Provide overall score (0-100)
   - Select endorsement level
   - List specific strengths (3-5 recommended)
   - List specific weaknesses (2-3 recommended)
   - Document question responses with scores
   - Add qualitative notes and recommendations

4. **Question Response Evaluation**:
   - Use question bank questions when available
   - Score each response (0 to maxScore)
   - Assign weight to each question (default 1)
   - Provide notes on response quality
   - System computes weighted average score

5. **Feedback Aggregation**:
   - Collect all interviewer feedback
   - Calculate average score across interviewers
   - Review endorsement consensus
   - Identify common strengths/weaknesses
   - Note any significant discrepancies

**Endpoint**: `POST /api/v1/hr/recruitment/interviews/{id}/participants/{participantId}/feedback`

**Request Example**:

```json
{
  "score": 85,
  "endorsement": "YES",
  "strengths": [
    "Strong problem-solving skills",
    "Clear communication",
    "Good technical depth",
    "Practical experience with React",
    "Collaborative team approach"
  ],
  "weaknesses": [
    "Limited system design experience",
    "Could improve on documentation practices",
    "Less experience with GraphQL"
  ],
  "questionResponses": [
    {
      "questionId": "uuid-question-1",
      "question": "Explain REST API principles",
      "category": "TECHNICAL",
      "type": "TEXT",
      "answer": "REST is an architectural style...",
      "score": 8,
      "maxScore": 10,
      "weight": 1,
      "notes": "Good understanding of core concepts"
    },
    {
      "question": "Rate system design knowledge (1-5)",
      "category": "TECHNICAL",
      "type": "RATING",
      "answer": 3,
      "score": 3,
      "maxScore": 5,
      "weight": 1.5,
      "notes": "Basic understanding, needs more depth"
    },
    {
      "question": "Describe a challenging bug you fixed",
      "category": "BEHAVIORAL",
      "type": "TEXT",
      "answer": "I encountered a memory leak...",
      "score": 9,
      "maxScore": 10,
      "weight": 1.2,
      "notes": "Excellent debugging approach"
    }
  ],
  "notes": "Strong candidate for next round. Technical skills are solid, cultural fit appears good. Recommend advancing to final round with hiring manager.",
  "isDraft": false
}
```

**Validations**:

- Only assigned interviewers can submit feedback
- Question bank questions must exist if questionId provided
- Score must be 0-100
- Question response scores must be >= 0 and <= maxScore
- maxScore required when score provided
- weight must be > 0
- question type must match answer type (TEXT, RATING, BOOLEAN, etc.)

**Score Computation from Question Responses**:

```typescript
function computeScoreFromQuestionResponses(items) {
  const scored = items.filter(
    (item) => item.score != null && item.maxScore != null && item.maxScore > 0,
  );
  if (scored.length === 0) return null;

  let weightedScore = 0;
  let totalWeight = 0;

  for (const item of scored) {
    const weight = item.weight ?? 1;
    weightedScore += (item.score / item.maxScore) * weight;
    totalWeight += weight;
  }

  if (totalWeight <= 0) return null;
  const score = (weightedScore / totalWeight) * 100;
  return Math.round(score * 100) / 100;
}
```

**Draft Mode**:

- When `isDraft: true`, feedback saved without `submittedAt` timestamp
- Draft feedback can be updated multiple times
- Final submission requires `isDraft: false`
- Draft feedback does not count toward completion metrics

**Response**:

```json
{
  "id": "uuid-feedback-id",
  "participantId": "uuid-participant-id",
  "assignmentId": "uuid-assignment-id",
  "interviewerId": "uuid-interviewer-1",
  "score": 85,
  "endorsement": "YES",
  "strengths": [...],
  "weaknesses": [...],
  "questionResponses": [...],
  "notes": "Strong candidate for next round",
  "isDraft": false,
  "submittedAt": "2026-05-15T11:30:00.000Z",
  "createdAt": "2026-05-15T11:00:00.000Z",
  "updatedAt": "2026-05-15T11:30:00.000Z"
}
```

**List Feedback**

**Endpoint**: `GET /api/v1/hr/recruitment/interviews/{id}/participants/{participantId}/feedback`

**Response**: Array of all feedback for the participant (ordered by updatedAt desc)

**Feedback Evaluation Criteria**:

**Score Ranges**:

- **90-100**: Exceptional candidate, strongly recommend
- **80-89**: Strong candidate, recommend proceed
- **70-79**: Good candidate, consider with reservations
- **60-69**: Marginal candidate, significant concerns
- **0-59**: Not suitable, do not recommend

**Endorsement Levels**:

- **STRONG_YES**: Exceptional fit, immediate hire
- **YES**: Good fit, recommend proceeding
- **NO**: Not suitable, do not proceed
- **STRONG_NO**: Poor fit, immediate rejection

**Feedback Best Practices**:

- Submit feedback within 24 hours of interview
- Be specific and evidence-based
- Focus on job-relevant criteria
- Avoid bias and subjective judgments
- Provide balanced assessment (strengths and weaknesses)
- Include examples from interview
- Consider cultural fit alongside skills
- Collaborate with other interviewers before finalizing

**Feedback Aggregation Process**:

1. **Collect All Feedback**:
   - Wait for all assigned interviewers to submit
   - Follow up with pending interviewers after 48 hours
   - Ensure all feedback is submitted (not draft)

2. **Calculate Metrics**:
   - Average score across all interviewers
   - Endorsement consensus (count each level)
   - Common themes in strengths/weaknesses
   - Score variance (identify outliers)

3. **Review Discrepancies**:
   - Discuss significant score differences (>20 points)
   - Understand different perspectives
   - Consider interviewer bias
   - Resolve conflicts through discussion

4. **Make Recommendation**:
   - Based on aggregated feedback
   - Consider job requirements alignment
   - Factor in urgency and candidate availability
   - Document rationale for decision

**Decision Matrix**:

| Average Score | Endorsement Consensus | Recommendation              |
| ------------- | --------------------- | --------------------------- |
| 85+           | All YES/STRONG_YES    | Proceed to offer/next round |
| 75-84         | Majority YES          | Consider with discussion    |
| 65-74         | Mixed YES/NO          | Additional review needed    |
| <65           | Majority NO           | Reject candidate            |
| Any           | All NO/STRONG_NO      | Reject candidate            |

**Feedback Metrics**:

- Feedback submission rate: target 100%
- Average time to submit: target <24 hours
- Feedback completeness: all sections filled
- Score variance: <15 points between interviewers
- Endorsement consistency: >80% agreement

---

## API Endpoints

### Applicant Management Endpoints

| Method | Path                                     | Description        | Permission       | Auth     |
| ------ | ---------------------------------------- | ------------------ | ---------------- | -------- |
| GET    | `/hr/recruitment/applicants`             | List applicants    | applicant:view   | Required |
| GET    | `/hr/recruitment/applicants/{id}`        | Get applicant      | applicant:view   | Required |
| PATCH  | `/hr/recruitment/applicants/{id}`        | Update applicant   | applicant:update | Required |
| POST   | `/hr/recruitment/applicants/{id}/status` | Update status      | applicant:update | Required |
| POST   | `/hr/recruitment/applicants/bulk-status` | Bulk status update | applicant:update | Required |
| POST   | `/hr/recruitment/applicants/{id}/hire`   | Hire applicant     | applicant:update | Required |

**Public Endpoints**:
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/hr/recruitment/jobs/{id}/apply` | Apply to job | None |

### Interview Management Endpoints

| Method | Path                                                                      | Description       | Permission                |
| ------ | ------------------------------------------------------------------------- | ----------------- | ------------------------- |
| POST   | `/hr/recruitment/interviews`                                              | Create interview  | interview:create          |
| GET    | `/hr/recruitment/interviews`                                              | List interviews   | interview:view            |
| GET    | `/hr/recruitment/interviews/{id}`                                         | Get interview     | interview:view            |
| PATCH  | `/hr/recruitment/interviews/{id}`                                         | Update interview  | interview:update          |
| PATCH  | `/hr/recruitment/interviews/{id}/participants/{participantId}/attendance` | Update attendance | interview:update          |
| POST   | `/hr/recruitment/interviews/{id}/participants/{participantId}/feedback`   | Submit feedback   | interview:submit_feedback |
| GET    | `/hr/recruitment/interviews/{id}/participants/{participantId}/feedback`   | List feedback     | interview:view            |

### Query Parameters

**List Applicants**:

- `status`: Filter by applicant status
- `jobId`: Filter by job
- `email`: Filter by email (normalized)
- `search`: Search across firstName, lastName, email, phone, currentCompany, currentPosition

**List Interviews**:

- `jobId`: Filter by job
- `type`: Filter by interview type
- `status`: Filter by session status
- `round`: Filter by round number
- `applicantId`: Filter by applicant
- `interviewerId`: Filter by interviewer

---

## Business Logic

### Applicant Status Transitions

**Valid Transitions**:

```typescript
APPLIED → SCREENING → SHORTLISTED → INTERVIEW → OFFER → HIRED
                          ↓              ↓
                        REJECTED      WAITLIST
                          ↓
                    (from any active state)
                        WITHDRAWN
```

**Transition Validation**:

```typescript
assertApplicantTransition(currentStatus, nextStatus);
```

**Rules**:

- Only forward progression (except REJECTED/WITHDRAWN from active states)
- Cannot transition from terminal states (HIRED, REJECTED, WITHDRAWN)
- Bulk updates restricted to SHORTLISTED and REJECTED only

### Application Form Validation

**Field Configuration**:

- **Applicant Fields**: PHONE, LINKEDIN_URL, PORTFOLIO_URL, GITHUB_URL, EXPECTED_SALARY, COVER_LETTER
- **Sections**: EDUCATION, EXPERIENCE
- **Custom Fields**: Job-specific custom fields with types (TEXT, SELECT, CHECKBOX, etc.)

**Validation Logic**:

```typescript
assertRequiredFormFields({
  applicantFields: job.applicationForm.applicantFields,
  sections: job.applicationForm.sections,
  customFields: job.applicationForm.customFields,
  payload: applicantData,
});
```

**Checks**:

- Core fields always required: firstName, lastName, email, resumeUrl
- Enabled + required applicant fields must have values
- Enabled + required sections must have at least one entry
- Required custom fields must have values

### Interview Conflict Prevention

**Duplicate Round Check**:

```typescript
assertNoActiveDuplicateRound(prisma, {
  applicantIds,
  jobId,
  round,
  excludeSessionId,
});
```

**Rules**:

- Applicant cannot have active interview in same round
- Active = session not CANCELLED and participant not CANCELLED
- Allows rescheduling within same round (excludeSessionId)

### Interviewer Validation

**Active Employee Check**:

```typescript
assertInterviewersAreActiveEmployees(prisma, interviewerIds);
```

**Requirements**:

- User must have ACTIVE status
- User must be linked to employee record
- Prevents inactive/former employees from interviewing

### Job Metrics Recalculation

**Triggered On**:

- Applicant created/updated
- Applicant status changed
- Interview created/updated
- Participant attendance changed

**Metrics Updated**:

```typescript
recalculateJobMetrics(tx, jobId);
```

**Fields Recalculated**:

- applicationsCount
- shortlistedCount
- interviewsCount
- offersCount
- hiresCount

---

## State Transitions

### Applicant Status State Machine

```mermaid
stateDiagram-v2
    [*] --> APPLIED: Application Submitted
    APPLIED --> SCREENING: HR Review
    APPLIED --> SHORTLISTED: Direct Shortlist
    APPLIED --> REJECTED: Rejected
    SCREENING --> SHORTLISTED: Pass Screening
    SCREENING --> REJECTED: Fail Screening
    SHORTLISTED --> INTERVIEW: Schedule Interview
    SHORTLISTED --> WAITLIST: Hold for Later
    SHORTLISTED --> REJECTED: Rejected
    INTERVIEW --> OFFER: Make Offer
    INTERVIEW --> WAITLIST: Hold for Later
    INTERVIEW --> REJECTED: Rejected
    OFFER --> HIRED: Accept Offer
    OFFER --> REJECTED: Reject Offer
    [*] --> WITHDRAWN: Candidate Withdraws
```

### Interview Session State Machine

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Session Created
    SCHEDULED --> IN_PROGRESS: Interview Started
    SCHEDULED --> CANCELLED: Cancelled
    IN_PROGRESS --> COMPLETED: Interview Finished
    IN_PROGRESS --> CANCELLED: Cancelled Mid-Interview
    COMPLETED --> [*]: Session Complete
    CANCELLED --> [*]: Session Cancelled
```

### Interview Attendance State Machine

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Participant Added
    SCHEDULED --> COMPLETED: Attended
    SCHEDULED --> NO_SHOW: Missed Interview
    SCHEDULED --> CANCELLED: Cancelled
    COMPLETED --> [*]: Attendance Recorded
    NO_SHOW --> [*]: No Show Recorded
    CANCELLED --> [*]: Cancelled
```

### Transition Rules

| From Status | To Status   | Trigger              | Conditions         |
| ----------- | ----------- | -------------------- | ------------------ |
| APPLIED     | SCREENING   | Manual HR review     | Job published      |
| APPLIED     | SHORTLISTED | Bulk action          | Job published      |
| SCREENING   | SHORTLISTED | HR approval          | Screening complete |
| SHORTLISTED | INTERVIEW   | Interview scheduled  | Session created    |
| INTERVIEW   | OFFER       | Offer extended       | Interview passed   |
| OFFER       | HIRED       | Offer accepted       | Hire workflow      |
| Any active  | REJECTED    | Rejection decision   | Valid transition   |
| Any active  | WITHDRAWN   | Candidate withdrawal | Valid transition   |

### Timestamp Tracking

| Timestamp        | Set When             | Purpose                     |
| ---------------- | -------------------- | --------------------------- |
| `appliedAt`      | Application created  | Track submission time       |
| `screeningAt`    | Status → SCREENING   | Track screening start       |
| `shortlistedAt`  | Status → SHORTLISTED | Track shortlist time        |
| `interviewAt`    | Status → INTERVIEW   | Track interview stage entry |
| `offerAt`        | Status → OFFER       | Track offer time            |
| `hiredAt`        | Status → HIRED       | Track hire completion       |
| `rejectedAt`     | Status → REJECTED    | Track rejection time        |
| `withdrawnAt`    | Status → WITHDRAWN   | Track withdrawal time       |
| `lastActivityAt` | Any update           | Track recent activity       |

---

## RBAC Permissions

### Applicant Permissions

| Permission         | Description                     | Typical Roles                  |
| ------------------ | ------------------------------- | ------------------------------ |
| `applicant:view`   | View applicants                 | HR, HR_MANAGER, HIRING_MANAGER |
| `applicant:update` | Update applicant details/status | HR, HR_MANAGER, HIRING_MANAGER |

### Interview Permissions

| Permission                  | Description               | Typical Roles                               |
| --------------------------- | ------------------------- | ------------------------------------------- |
| `interview:view`            | View interviews           | HR, HR_MANAGER, HIRING_MANAGER, INTERVIEWER |
| `interview:create`          | Create interview sessions | HR, HR_MANAGER, HIRING_MANAGER              |
| `interview:update`          | Update interview sessions | HR, HR_MANAGER, HIRING_MANAGER              |
| `interview:submit_feedback` | Submit interview feedback | Assigned interviewers only                  |

### Permission Enforcement

**Feedback Submission**:

- Only assigned interviewers can submit feedback
- Validated via `sessionId_interviewerId` unique constraint check
- Returns ForbiddenException if not assigned

**Status Updates**:

- Requires `applicant:update` permission
- ChangedById recorded in status history
- Audit trail maintained

---

## Integration Points

**Employee System**:

- Interviewer validation (active employee requirement)
- Hiring transition (applicant → employee conversion)

**User System**:

- Referral validation (referredById must exist)
- Interviewer user validation
- Creator tracking

**Notification System**:

- New applicant notification to job creator
- Interview scheduling notifications (future enhancement)

**File Storage System**:

- Resume URL storage (external CDN integration)
- Portfolio/LinkedIn links

---

## Error Handling

### Common Errors

**Applicant Errors**:

- `ConflictException`: Duplicate applicant (job + email)
- `BadRequestException`: Invalid status transition, missing required fields
- `NotFoundException`: Applicant not found, job not published
- `ForbiddenException`: Missing required permission

**Interview Errors**:

- `BadRequestException`: Invalid interview type, duplicate round, interviewer not active employee
- `ConflictException`: Duplicate active round for applicant
- `NotFoundException`: Interview/participant not found
- `ForbiddenException`: Not assigned interviewer (feedback submission)

### Validation Messages

**Application Validation**:

- "Applications are allowed only for published jobs"
- "Missing required application fields (coreFields: firstName, lastName; applicantFields: PHONE)"
- "Applicant already exists for this job and email"

**Interview Validation**:

- "At least one applicant is required"
- "At least one interviewer is required"
- "All interviewers must be active users linked to employee records"
- "At least one applicant already has an active interview in this round"
- "Only assigned interviewers can submit feedback"

**Status Transition Validation**:

- "Invalid applicant status transition from APPLIED to HIRED"
- "Only draft or rejected jobs can be updated"

---

## Implementation Status

### Implemented Features ✅

- **Applicant Management**: Full CRUD with status tracking
- **Application Form Validation**: Configurable per job
- **Bulk Status Updates**: Efficient batch operations
- **Interview Scheduling**: Multi-participant, multi-interviewer
- **Interview Feedback**: Structured with question responses
- **Profile Scoring**: Automated quality assessment
- **Status History**: Complete audit trail
- **Job Metrics**: Automatic recalculation

### Not Implemented ❌

- **CV Screening**: Database schema exists but no API layer
- **Automated Screening**: AI-based CV parsing and matching
- **Interview Question Bank**: Limited implementation
- **Calendar Integration**: Interview scheduling automation
- **Candidate Portal**: Self-service interview management
- **Analytics Dashboard**: Recruitment funnel metrics
- **Email Notifications**: Automated candidate communications

### Future Enhancements

1. **CV Screening API**:
   - Implement CvScreeningController
   - AI-powered resume parsing
   - Skills extraction and matching
   - Screening workflow automation

2. **Interview Question Bank**:
   - Expand question categories
   - Difficulty levels
   - Randomization
   - Pre-built question sets

3. **Calendar Integration**:
   - Outlook/Google Calendar sync
   - Automated reminders
   - Conflict detection
   - Room booking

4. **Candidate Portal**:
   - Application status tracking
   - Interview schedule view
   - Document upload
   - Feedback viewing

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                  RECRUITMENT FLOW: POSTING → INTERVIEW           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PUBLISHED JOB                                                   │
│       │                                                          │
│       ▼                                                          │
│  CANDIDATE APPLIES (Public API)                                 │
│       │                                                          │
│       ├─► Validation (form fields, duplicates)                  │
│       ├─► Profile score computation                             │
│       ├─► Applicant record created                              │
│       └─► Notification to creator                               │
│       │                                                          │
│       ▼                                                          │
│  APPLICANT (APPLIED)                                             │
│       │                                                          │
│       ├─► HR Review → SCREENING                                 │
│       ├─► Bulk shortlist → SHORTLISTED                           │
│       └─► Reject → REJECTED                                     │
│       │                                                          │
│       ▼                                                          │
│  SHORTLISTED                                                     │
│       │                                                          │
│       ├─► Schedule interview → INTERVIEW                         │
│       └─► Hold → WAITLIST                                       │
│       │                                                          │
│       ▼                                                          │
│  INTERVIEW SESSION CREATED                                       │
│       │                                                          │
│       ├─► Add participants (applicants)                          │
│       ├─► Add interviewers (employees)                          │
│       └─► Validate no duplicate rounds                           │
│       │                                                          │
│       ▼                                                          │
│  INTERVIEW EXECUTION                                             │
│       │                                                          │
│       ├─► Update attendance (COMPLETED/NO_SHOW/CANCELLED)       │
│       └─► Submit feedback (score, endorsement, Q&A)            │
│       │                                                          │
│       ▼                                                          │
│  FEEDBACK AGGREGATION                                           │
│       │                                                          │
│       ├─► Calculate average scores                              │
│       ├─► Review endorsements                                    │
│       └─► Decision: OFFER or REJECT                             │
│       │                                                          │
│       ▼                                                          │
│  NEXT STAGE: OFFER → HIRED                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```
