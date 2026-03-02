# HR Recruitment & Hiring Subsystem Implementation Plan

**Purpose:** Detailed implementation plan for recruitment and hiring functionality including job posting, application processing, interview scheduling, and offer management.  
**Timeline:** 4 weeks development + 1 week testing  
**Priority:** High - Critical for business operations

---

## Overview

The Recruitment & Hiring subsystem manages the complete talent acquisition workflow from job requisition to offer acceptance. This subsystem includes 6 core forms and supports automated candidate scoring, interview scheduling, and budget validation.

---

## Implementation Structure

### File Organization

```
src/domains/hr/recruitment/
├── recruitment.module.ts
├── recruitment.controller.ts
├── recruitment.service.ts
├── dto/
│   ├── create-job-posting.dto.ts
│   ├── job-application.dto.ts
│   ├── cv-screening.dto.ts
│   ├── interview-feedback.dto.ts
│   └── hiring-decision.dto.ts
├── entities/
│   ├── job-posting.entity.ts
│   ├── job-application.entity.ts
│   ├── interview.entity.ts
│   └── hiring-decision.entity.ts
├── use-cases/
│   ├── create-job-posting.usecase.ts
│   ├── process-application.usecase.ts
│   ├── schedule-interview.usecase.ts
│   ├── screen-candidates.usecase.ts
│   └── generate-offer.usecase.ts
└── services/
    ├── candidate-scoring.service.ts
    ├── interview-scheduler.service.ts
    └── budget-validator.service.ts
```

---

## Database Schema Extensions

### New Models Required

```prisma
model JobPosting {
  id              String    @id @default(uuid()) @db.Uuid
  title           String
  departmentId    String    @db.Uuid
  department      Department @relation(fields: [departmentId], references: [id])
  description     String
  requirements    Json      // Skills, experience, education
  salaryRange     Json?     // min, max, currency
  employmentType  EmploymentType
  workMode        String    // OFFICE/HYBRID/REMOTE
  status          String    @default(DRAFT) // DRAFT/PENDING_APPROVAL/APPROVED/PUBLISHED/FILLED/EXPIRED
  priority        String    @default(MEDIUM) // LOW/MEDIUM/HIGH
  targetStartDate DateTime?
  budgetApproved  Boolean   @default(false)
  publishedAt     DateTime?
  expiresAt       DateTime?
  createdBy       String    @db.Uuid
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  applications    JobApplication[]
  interviews      Interview[]
}

model JobApplication {
  id            String   @id @default(uuid()) @db.Uuid
  jobPostingId  String   @db.Uuid
  jobPosting    JobPosting @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)
  candidateName String
  email         String
  phone         String?
  address       String?
  resumeUrl     String?
  coverLetter   String?
  linkedinUrl   String?
  portfolioUrl  String?
  salaryExpectation Decimal?
  availability  String?
  status        String   @default(RECEIVED) // RECEIVED/REVIEW/SCREENING/INTERVIEW/OFFER/REJECTED/HIRED
  source        String?  // WEBSITE/LINKEDIN/REFERRAL/INTERNAL
  score         Int?     // 0-100 automated score
  screeningData Json?    // AI screening results
  feedback      Json?    // Interview feedback
  appliedAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  interviews    Interview[]
}

model Interview {
  id              String    @id @default(uuid()) @db.Uuid
  jobApplicationId String   @db.Uuid
  jobApplication  JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)
  jobPostingId    String    @db.Uuid
  type            String    // PHONE/VIDEO/ONSITE/TECHNICAL/BEHAVIORAL
  scheduledFor    DateTime
  duration        Int       // minutes
  location        String?   // Physical location or meeting link
  interviewerIds  String[]  // Array of interviewer user IDs
  status          String    @default(SCHEDULED) // SCHEDULED/COMPLETED/CANCELLED/RESCHEDULED
  feedback        Json?     // Interviewer feedback
  overallScore    Int?      // 0-100
  recommendation  String?   // STRONG_YES/YES/MAYBE/NO/STRONG_NO
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model HiringDecision {
  id              String    @id @default(uuid()) @db.Uuid
  jobApplicationId String   @db.Uuid
  jobApplication  JobApplication @relation(fields: [jobApplicationId], references: [id], onDelete: Cascade)
  decision        String    // HIRE/REJECT/HOLD
  offerDetails    Json?     // Salary, benefits, start date
  offerStatus     String?   // PENDING/ACCEPTED/REJECTED/EXPIRED
  approvedBy      String?   @db.Uuid
  approvedAt      DateTime?
  reason          String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}
```

---

## Core Implementation Components

### 1. Job Posting Management

**Features:**

- Job requisition creation with budget validation
- Multi-level approval workflow (Manager → Finance → CEO → HR)
- Auto-publishing to multiple platforms
- Template library for common roles

**Key Endpoints:**

```typescript
POST /hr/recruitment/jobs              // Create job posting
GET  /hr/recruitment/jobs              // List job postings
PUT  /hr/recruitment/jobs/:id          // Update job posting
POST /hr/recruitment/jobs/:id/approve // Approve job posting
POST /hr/recruitment/jobs/:id/publish // Publish job posting
```

### 2. Application Processing

**Features:**

- Online application forms with document upload
- AI-powered CV parsing and screening
- Automated candidate scoring algorithm
- Application status tracking

**Scoring Algorithm:**

```typescript
calculateMatchScore(candidate: Candidate, jobRequirements: JobRequirements): number {
  const weights = {
    experience: 0.30,
    skills: 0.35,
    education: 0.15,
    cultureFit: 0.10,
    communication: 0.10
  };

  // Experience matching (0-100)
  const expScore = Math.min((candidate.yearsExperience / jobRequirements.minYears) * 100, 100);

  // Skills matching (0-100)
  const skillMatch = candidate.skills.filter(skill =>
    jobRequirements.requiredSkills.includes(skill)
  ).length / jobRequirements.requiredSkills.length * 100;

  // Education matching (binary)
  const eduScore = meetsEducationRequirement(candidate.education, jobRequirements.educationLevel) ? 100 : 0;

  return Math.round(
    expScore * weights.experience +
    skillMatch * weights.skills +
    eduScore * weights.education
  );
}
```

### 3. Interview Management

**Features:**

- Interview scheduling with conflict detection
- Calendar integration
- Automated interviewer notifications
- Structured feedback collection

**Conflict Detection Logic:**

```typescript
async canScheduleInterview(interviewerIds: string[], proposedTime: DateTime, duration: number): Promise<ScheduleResult> {
  for (const interviewerId of interviewerIds) {
    const conflicts = await this.checkConflicts(interviewerId, proposedTime, duration);

    if (conflicts.hasLeave) return { canSchedule: false, reason: 'LEAVE' };
    if (conflicts.hasMeeting) return { canSchedule: false, reason: 'MEETING' };
    if (conflicts.outsideWorkHours) return { canSchedule: true, warning: 'OVERTIME' };
  }

  return { canSchedule: true };
}
```

### 4. Offer Management

**Features:**

- Offer generation with salary calculation
- Budget validation and approval
- E-signature integration
- Offer tracking and analytics

**Salary Calculation:**

```typescript
calculateOfferSalary(candidateScore: number, marketRate: number, budgetMax: number): OfferCalculation {
  let offer = marketRate;

  // Quality adjustments
  if (candidateScore >= 95) offer *= 1.10; // 10% premium
  else if (candidateScore >= 85) offer *= 1.05; // 5% premium
  else if (candidateScore < 60) offer *= 0.95; // 5% discount

  // Internal equity check
  const teamAverage = await this.calculateTeamAverage(jobPosting.departmentId);
  if (offer > teamAverage * 1.20) {
    return {
      salary: Math.min(offer, budgetMax),
      warning: 'INTERNAL_EQUITY',
      requiresApproval: true
    };
  }

  return { salary: Math.round(offer / 1000) * 1000, warning: null };
}
```

---

## Implementation Phases

### Week 1: Foundation & Job Posting

- Database schema creation
- Job posting CRUD operations
- Approval workflow setup
- Basic DTOs and validation

### Week 2: Application Processing

- Application form creation
- CV parsing integration
- Scoring algorithm implementation
- Application status management

### Week 3: Interview Management

- Interview scheduling service
- Calendar integration
- Conflict detection logic
- Feedback collection system

### Week 4: Offer Management

- Offer generation system
- Budget validation
- E-signature integration
- Analytics and reporting

### Week 5: Testing & Integration

- End-to-end workflow testing
- Performance optimization
- Security testing
- Documentation completion

---

## Integration Points

### Internal Systems

- **Finance:** Budget validation and approval
- **HR:** Employee profile creation on hiring
- **Notifications:** Email and in-app alerts
- **Audit:** Complete action logging

### External Systems

- **Job Boards:** LinkedIn, Telegram, company website
- **Calendar:** Google/Outlook integration
- **E-signature:** DocuSign or similar
- **Email:** SMTP service for notifications

---

## Security & Permissions

### Required Permissions

```typescript
const RECRUITMENT_PERMISSIONS = {
  'hr:recruitment:job:create': ['HR_MANAGER', 'HIRING_MANAGER'],
  'hr:recruitment:job:approve': ['HR_MANAGER', 'DEPARTMENT_HEAD', 'CEO'],
  'hr:recruitment:application:view': ['HR_MANAGER', 'HIRING_MANAGER'],
  'hr:recruitment:interview:schedule': ['HR_MANAGER', 'HIRING_MANAGER'],
  'hr:recruitment:offer:create': ['HR_MANAGER', 'CEO'],
  'hr:recruitment:offer:approve': ['CEO', 'FINANCE_MANAGER'],
};
```

### Data Privacy

- Candidate data encryption
- Access logging for sensitive information
- GDPR compliance for applicant data
- Data retention policies

---

## Success Metrics

### Operational Metrics

- **Time to Hire:** Reduce from 45 to 30 days
- **Cost per Hire:** Reduce by 20%
- **Application Quality:** 70%+ qualified candidates
- **Offer Acceptance:** 85%+ acceptance rate

### Technical Metrics

- **API Response Time:** < 200ms
- **System Availability:** 99.9%
- **Data Accuracy:** 98%+ complete profiles
- **User Satisfaction:** 4.5/5 rating

---

## Testing Strategy

### Unit Tests

- Scoring algorithm validation
- Business logic verification
- DTO validation testing

### Integration Tests

- API endpoint testing
- Database operations
- Third-party integrations

### E2E Tests

- Complete recruitment workflow
- Multi-user scenarios
- Performance under load

---

## Deployment Considerations

### Feature Flags

- Enable gradual rollout
- A/B testing for scoring algorithm
- Controlled feature activation

### Migration Strategy

- Existing job posting data migration
- User training and onboarding
- Backward compatibility maintenance

This subsystem forms the foundation of the HR system and must be implemented with high quality and reliability to support critical business operations.
