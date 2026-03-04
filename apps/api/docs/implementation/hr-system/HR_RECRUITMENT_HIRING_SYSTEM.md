# HR Recruitment & Hiring System Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Business Logic & Workflows](#business-logic--workflows)
6. [Integration Points](#integration-points)
7. [Security & Permissions](#security--permissions)
8. [Implementation Guidelines](#implementation-guidelines)
9. [Testing Procedures](#testing-procedures)
10. [Deployment Instructions](#deployment-instructions)
11. [Troubleshooting Guide](#troubleshooting-guide)

---

## System Overview

The HR Recruitment & Hiring System manages the complete talent acquisition workflow from job requisition to offer acceptance. This system automates candidate sourcing, application processing, interview scheduling, and offer management while providing comprehensive analytics and reporting capabilities.

### Key Features

- **Job Posting Management:** Create, approve, and publish job postings with budget validation
- **Application Processing:** AI-powered CV screening and automated candidate scoring
- **Interview Management:** Schedule interviews with conflict detection and calendar integration
- **Offer Management:** Generate offers with salary calculation and approval workflows
- **Candidate Analytics:** Comprehensive reporting on recruitment metrics and effectiveness

### Business Objectives

- Reduce time-to-hire from 45 to 30 days
- Achieve 70%+ qualified candidate rate
- Maintain 85%+ offer acceptance rate
- Reduce cost-per-hire by 20%

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Recruitment Portal]
        B[Manager Dashboard]
        C[Interviewer Interface]
    end

    subgraph "API Layer"
        D[Recruitment API]
        E[Application API]
        F[Interview API]
        G[Offer API]
    end

    subgraph "Service Layer"
        H[Job Posting Service]
        I[Candidate Scoring Service]
        J[Interview Scheduler Service]
        K[Offer Management Service]
        L[Budget Validator Service]
    end

    subgraph "Data Layer"
        M[PostgreSQL Database]
        N[File Storage]
        O[Cache Layer]
    end

    subgraph "External Services"
        P[Keycloak Auth]
        Q[Email Service]
        R[Calendar API]
        S[Job Boards API]
    end

    A --> D
    B --> D
    C --> F
    D --> H
    E --> I
    F --> J
    G --> K
    H --> M
    I --> M
    J --> M
    K --> M
    L --> M
    D --> P
    D --> Q
    F --> R
    H --> S
```

### Component Responsibilities

| Component           | Responsibility                              | Key Technologies        |
| ------------------- | ------------------------------------------- | ----------------------- |
| Recruitment API     | Job posting CRUD operations                 | NestJS, TypeScript      |
| Candidate Scoring   | AI-powered CV analysis                      | Python ML, NLP          |
| Interview Scheduler | Calendar integration and conflict detection | Google Calendar API     |
| Budget Validator    | Financial approval workflows                | Finance API integration |
| File Storage        | Resume and document management              | AWS S3, CloudFront      |

---

## Database Schema

### Core Tables

#### JobPosting

```sql
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    department_id UUID REFERENCES departments(id),
    description TEXT NOT NULL,
    requirements JSONB,
    salary_range JSONB,
    employment_type VARCHAR(50) NOT NULL,
    work_mode VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'DRAFT',
    priority VARCHAR(50) DEFAULT 'MEDIUM',
    target_start_date DATE,
    budget_approved BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_job_postings_status ON job_postings(status);
CREATE INDEX idx_job_postings_department ON job_postings(department_id);
CREATE INDEX idx_job_postings_published ON job_postings(published_at);
```

#### JobApplication

```sql
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    candidate_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    resume_url VARCHAR(500),
    cover_letter TEXT,
    linkedin_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    salary_expectation DECIMAL(15,2),
    availability TEXT,
    status VARCHAR(50) DEFAULT 'RECEIVED',
    source VARCHAR(50),
    score INTEGER,
    screening_data JSONB,
    feedback JSONB,
    applied_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_applications_posting ON job_applications(job_posting_id);
CREATE INDEX idx_applications_status ON job_applications(status);
CREATE INDEX idx_applications_score ON job_applications(score DESC);
```

#### Interview

```sql
CREATE TABLE interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    job_posting_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL,
    scheduled_for TIMESTAMP NOT NULL,
    duration INTEGER NOT NULL,
    location VARCHAR(255),
    interviewer_ids UUID[],
    status VARCHAR(50) DEFAULT 'SCHEDULED',
    feedback JSONB,
    overall_score INTEGER,
    recommendation VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interviews_application ON interviews(job_application_id);
CREATE INDEX idx_interviews_scheduled ON interviews(scheduled_for);
CREATE INDEX idx_interviews_status ON interviews(status);
```

#### HiringDecision

```sql
CREATE TABLE hiring_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_application_id UUID REFERENCES job_applications(id) ON DELETE CASCADE,
    decision VARCHAR(50) NOT NULL,
    offer_details JSONB,
    offer_status VARCHAR(50),
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_decisions_application ON hiring_decisions(job_application_id);
CREATE INDEX idx_decisions_status ON hiring_decisions(offer_status);
```

### Entity Relationships

```mermaid
erDiagram
    JobPosting ||--o{ JobApplication : "has many"
    JobApplication ||--o{ Interview : "has many"
    JobApplication ||--|| HiringDecision : "has one"
    JobPosting }o--|| Department : "belongs to"
    JobPosting }o--|| User : "created by"
    Interview }o--|| User : "interviewed by"
    HiringDecision }o--|| User : "approved by"
```

---

## API Endpoints

### Job Posting Endpoints

#### POST /api/hr/recruitment/jobs

Create a new job posting.

**Request Body:**

```json
{
  "title": "Senior Software Engineer",
  "departmentId": "uuid",
  "description": "Job description...",
  "requirements": {
    "skills": ["JavaScript", "Node.js", "React"],
    "experience": "5+ years",
    "education": "Bachelor's degree"
  },
  "salaryRange": {
    "min": 80000,
    "max": 120000,
    "currency": "ETB"
  },
  "employmentType": "FULL_TIME",
  "workMode": "HYBRID",
  "priority": "HIGH"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Senior Software Engineer",
  "status": "DRAFT",
  "createdAt": "2026-02-27T10:00:00Z",
  "approvalWorkflow": {
    "currentStep": "MANAGER_APPROVAL",
    "nextApprover": "manager@example.com"
  }
}
```

#### GET /api/hr/recruitment/jobs

List job postings with filtering.

**Query Parameters:**

- `status`: Filter by status (DRAFT, PUBLISHED, FILLED)
- `departmentId`: Filter by department
- `employmentType`: Filter by employment type
- `page`: Pagination page number
- `limit`: Items per page

#### PUT /api/hr/recruitment/jobs/:id

Update an existing job posting.

#### POST /api/hr/recruitment/jobs/:id/approve

Approve a job posting for publication.

#### POST /api/hr/recruitment/jobs/:id/publish

Publish an approved job posting.

### Application Endpoints

#### POST /api/hr/recruitment/applications

Submit a new job application.

**Request Body:**

```json
{
  "jobPostingId": "uuid",
  "candidateName": "John Doe",
  "email": "john@example.com",
  "phone": "+251911234567",
  "resumeUrl": "https://storage.example.com/resumes/john.pdf",
  "coverLetter": "Cover letter text...",
  "salaryExpectation": 90000,
  "availability": "Immediate"
}
```

#### GET /api/hr/recruitment/applications

List applications with filtering and scoring.

#### GET /api/hr/recruitment/applications/:id

Get application details with screening results.

#### POST /api/hr/recruitment/applications/:id/screen

Trigger AI screening for an application.

### Interview Endpoints

#### POST /api/hr/recruitment/interviews

Schedule a new interview.

**Request Body:**

```json
{
  "jobApplicationId": "uuid",
  "type": "TECHNICAL",
  "scheduledFor": "2026-03-15T14:00:00Z",
  "duration": 60,
  "location": "Conference Room A",
  "interviewerIds": ["uuid1", "uuid2"]
}
```

#### GET /api/hr/recruitment/interviews

List interviews with filtering.

#### PUT /api/hr/recruitment/interviews/:id/feedback

Submit interview feedback.

**Request Body:**

```json
{
  "feedback": {
    "technicalSkills": 4,
    "communication": 5,
    "problemSolving": 4,
    "culturalFit": 5
  },
  "recommendation": "STRONG_YES",
  "notes": "Excellent candidate with strong technical skills"
}
```

### Offer Endpoints

#### POST /api/hr/recruitment/offers

Generate a job offer.

**Request Body:**

```json
{
  "jobApplicationId": "uuid",
  "offerDetails": {
    "baseSalary": 95000,
    "bonus": 10000,
    "startDate": "2026-04-01",
    "benefits": ["Health insurance", "Stock options"]
  }
}
```

#### GET /api/hr/recruitment/offers/:id

Get offer details and status.

#### POST /api/hr/recruitment/offers/:id/approve

Approve a job offer.

---

## Business Logic & Workflows

### Job Posting Workflow

```mermaid
sequenceDiagram
    participant HM as Hiring Manager
    participant FM as Finance Manager
    participant CEO as CEO
    participant HR as HR Manager
    participant System as Recruitment System

    HM->>System: Create Job Posting
    System->>System: Validate Budget
    System->>FM: Budget Approval Request
    FM->>System: Budget Approved
    System->>HM: Manager Approval Request
    HM->>System: Manager Approved
    System->>CEO: CEO Approval Request
    CEO->>System: CEO Approved
    System->>HR: HR Review Request
    HR->>System: HR Approved
    System->>System: Auto-Publish Job
    System->>External: Post to Job Boards
```

### Candidate Scoring Algorithm

```typescript
interface CandidateScore {
  experience: number;
  skills: number;
  education: number;
  cultureFit: number;
  communication: number;
  total: number;
}

function calculateMatchScore(
  candidate: Candidate,
  jobRequirements: JobRequirements,
): CandidateScore {
  const weights = {
    experience: 0.3,
    skills: 0.35,
    education: 0.15,
    cultureFit: 0.1,
    communication: 0.1,
  };

  // Experience matching (0-100)
  const expScore = Math.min(
    (candidate.yearsExperience / jobRequirements.minYears) * 100,
    100,
  );

  // Skills matching (0-100)
  const requiredSkills = jobRequirements.requiredSkills;
  const candidateSkills = candidate.skills;
  const matchingSkills = candidateSkills.filter((skill) =>
    requiredSkills.includes(skill),
  );
  const skillScore = (matchingSkills.length / requiredSkills.length) * 100;

  // Education matching (binary)
  const eduScore = meetsEducationRequirement(
    candidate.education,
    jobRequirements.educationLevel,
  )
    ? 100
    : 0;

  // Culture fit assessment (AI-based)
  const cultureScore = assessCultureFit(candidate, jobRequirements);

  // Communication assessment (from resume/CV)
  const commScore = assessCommunicationSkills(candidate);

  const total = Math.round(
    expScore * weights.experience +
      skillScore * weights.skills +
      eduScore * weights.education +
      cultureScore * weights.cultureFit +
      commScore * weights.communication,
  );

  return {
    experience: expScore,
    skills: skillScore,
    education: eduScore,
    cultureFit: cultureScore,
    communication: commScore,
    total,
  };
}
```

### Interview Scheduling Logic

```typescript
interface ScheduleResult {
  canSchedule: boolean;
  reason?: string;
  suggestedTimes?: Date[];
  conflicts?: Conflict[];
}

async function canScheduleInterview(
  interviewerIds: string[],
  proposedTime: Date,
  duration: number,
): Promise<ScheduleResult> {
  const conflicts = [];

  for (const interviewerId of interviewerIds) {
    const availability = await checkInterviewerAvailability(
      interviewerId,
      proposedTime,
      duration,
    );

    if (availability.hasLeave) {
      conflicts.push({
        interviewerId,
        type: 'LEAVE',
        date: proposedTime,
      });
    }

    if (availability.hasMeeting) {
      conflicts.push({
        interviewerId,
        type: 'MEETING',
        date: proposedTime,
        conflictingMeeting: availability.meeting,
      });
    }

    if (availability.outsideWorkHours) {
      return {
        canSchedule: true,
        warning: 'OVERTIME',
        suggestedTimes: await findAlternativeTimes(proposedTime, duration),
      };
    }
  }

  if (conflicts.length > 0) {
    return {
      canSchedule: false,
      reason: 'CONFLICTS_DETECTED',
      conflicts,
      suggestedTimes: await findAlternativeTimes(proposedTime, duration),
    };
  }

  return { canSchedule: true };
}
```

### Offer Calculation Logic

```typescript
interface OfferCalculation {
  salary: number;
  bonus?: number;
  warning?: string;
  requiresApproval: boolean;
  marketData: MarketData;
}

function calculateOfferSalary(
  candidateScore: number,
  marketRate: number,
  budgetMax: number,
): OfferCalculation {
  let offer = marketRate;

  // Quality adjustments
  if (candidateScore >= 95)
    offer *= 1.1; // 10% premium
  else if (candidateScore >= 85)
    offer *= 1.05; // 5% premium
  else if (candidateScore < 60) offer *= 0.95; // 5% discount

  // Internal equity check
  const teamAverage = getTeamAverage(jobPosting.departmentId);
  if (offer > teamAverage * 1.2) {
    return {
      salary: Math.min(offer, budgetMax),
      warning: 'INTERNAL_EQUITY',
      requiresApproval: true,
      marketData: { marketRate, teamAverage },
    };
  }

  return {
    salary: Math.round(offer / 1000) * 1000,
    warning: null,
    requiresApproval: false,
    marketData: { marketRate, teamAverage },
  };
}
```

---

## Integration Points

### Internal System Integrations

#### Keycloak Authentication

```typescript
// Authentication integration
const keycloakConfig = {
  realm: 'blih-hr',
  clientId: 'recruitment-service',
  serverUrl: process.env.KEYCLOAK_URL,
};

// Role synchronization
async function syncRecruiterRoles(userId: string, roles: string[]) {
  const keycloakAdmin = await getKeycloakAdminClient();

  // Assign recruiter-specific roles
  if (roles.includes('HR_MANAGER')) {
    await keycloakAdmin.users.addToRealmRole({
      id: userId,
      realm: 'blih-hr',
      role: { name: 'recruitment:admin' },
    });
  }

  if (roles.includes('HIRING_MANAGER')) {
    await keycloakAdmin.users.addToRealmRole({
      id: userId,
      realm: 'blih-hr',
      role: { name: 'recruitment:manager' },
    });
  }
}
```

#### Finance System Integration

```typescript
// Budget validation
async function validateJobPostingBudget(
  jobPosting: JobPosting,
): Promise<BudgetValidation> {
  const financeResponse = await financeService.validateBudget({
    departmentId: jobPosting.departmentId,
    amount: jobPosting.salaryRange.max,
    type: 'NEW_HIRE',
    justification: jobPosting.description,
  });

  return {
    approved: financeResponse.approved,
    availableBudget: financeResponse.available,
    requiredApproval: financeResponse.requiresCEOApproval,
    reason: financeResponse.reason,
  };
}

// Salary processing
async function processNewHireSalary(
  employeeId: string,
  offerDetails: OfferDetails,
): Promise<void> {
  await financeService.createEmployee({
    employeeId,
    salary: offerDetails.baseSalary,
    bonus: offerDetails.bonus,
    startDate: offerDetails.startDate,
    departmentId: jobPosting.departmentId,
  });
}
```

### External System Integrations

#### Job Board APIs

```typescript
// LinkedIn integration
async function publishToLinkedIn(jobPosting: JobPosting): Promise<string> {
  const linkedInClient = new LinkedInClient({
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  });

  const posting = await linkedInClient.jobs.create({
    title: jobPosting.title,
    description: jobPosting.description,
    location: jobPosting.location,
    employmentType: jobPosting.employmentType,
    experienceLevel: mapExperienceLevel(jobPosting.requirements.experience),
    industries: [jobPosting.department.industry],
    applyMethod: {
      type: 'EXTERNAL',
      url: `${process.env.APPLICATION_PORTAL_URL}/${jobPosting.id}`,
    },
  });

  return posting.id;
}

// Telegram integration
async function publishToTelegram(jobPosting: JobPosting): Promise<void> {
  const telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

  const message = formatJobPostingMessage(jobPosting);

  await telegramBot.sendMessage({
    chatId: process.env.TELEGRAM_JOB_CHANNEL_ID,
    text: message,
    parseMode: 'HTML',
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: 'Apply Now',
            url: `${process.env.APPLICATION_PORTAL_URL}/${jobPosting.id}`,
          },
        ],
      ],
    },
  });
}
```

#### Calendar Integration

```typescript
// Google Calendar integration
async function scheduleInterviewCalendar(
  interview: Interview,
  interviewers: User[],
): Promise<string> {
  const calendarClient = new GoogleCalendarClient({
    credentials: process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS,
  });

  const event = {
    summary: `Interview: ${interview.jobApplication.candidateName}`,
    description: formatInterviewDescription(interview),
    start: {
      dateTime: interview.scheduledFor.toISOString(),
      timeZone: 'Africa/Addis_Ababa',
    },
    end: {
      dateTime: addMinutes(
        interview.scheduledFor,
        interview.duration,
      ).toISOString(),
      timeZone: 'Africa/Addis_Ababa',
    },
    attendees: interviewers.map((interviewer) => ({
      email: interviewer.email,
      responseStatus: 'needsAction',
    })),
    conferenceData: {
      createRequest: {
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
  };

  const calendarEvent = await calendarClient.events.insert({
    calendarId: 'primary',
    resource: event,
    sendUpdates: 'all',
  });

  return calendarEvent.id;
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                          | HR Manager | Hiring Manager | Interviewer   | Candidate |
| ----------------------------------- | ---------- | -------------- | ------------- | --------- |
| `hr:recruitment:job:create`         | ✅         | ✅             | ❌            | ❌        |
| `hr:recruitment:job:approve`        | ✅         | ✅ (own dept)  | ❌            | ❌        |
| `hr:recruitment:application:view`   | ✅         | ✅ (own jobs)  | ✅ (assigned) | ✅ (own)  |
| `hr:recruitment:interview:schedule` | ✅         | ✅             | ✅            | ❌        |
| `hr:recruitment:offer:create`       | ✅         | ✅ (own jobs)  | ❌            | ❌        |
| `hr:recruitment:offer:approve`      | ✅         | ❌             | ❌            | ❌        |
| `hr:recruitment:analytics:view`     | ✅         | ✅ (own dept)  | ❌            | ❌        |

### Data Protection Measures

#### Personal Data Encryption

```typescript
// Encrypt sensitive candidate data
class CandidateDataProtection {
  private encryptionKey = process.env.CANDIDATE_DATA_KEY;

  async encryptPersonalData(data: PersonalData): Promise<EncryptedData> {
    const sensitiveFields = ['email', 'phone', 'address'];
    const encrypted = { ...data };

    for (const field of sensitiveFields) {
      if (data[field]) {
        encrypted[field] = await this.encrypt(data[field]);
      }
    }

    return encrypted;
  }

  async decryptPersonalData(encrypted: EncryptedData): Promise<PersonalData> {
    const sensitiveFields = ['email', 'phone', 'address'];
    const decrypted = { ...encrypted };

    for (const field of sensitiveFields) {
      if (encrypted[field]) {
        decrypted[field] = await this.decrypt(encrypted[field]);
      }
    }

    return decrypted;
  }
}
```

#### Audit Logging

```typescript
// Comprehensive audit logging for recruitment actions
@Injectable()
export class RecruitmentAuditService {
  async logJobPostingAction(
    action: string,
    jobPostingId: string,
    userId: string,
    changes?: any,
  ): Promise<void> {
    await this.auditRepository.create({
      action,
      module: 'RECRUITMENT',
      resource: 'JobPosting',
      resourceId: jobPostingId,
      actorId: userId,
      before: changes?.before,
      after: changes?.after,
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent(),
      timestamp: new Date(),
    });
  }

  async logApplicationView(
    applicationId: string,
    viewerId: string,
    viewerRole: string,
  ): Promise<void> {
    // Log access to candidate applications for compliance
    await this.auditRepository.create({
      action: 'APPLICATION_VIEWED',
      module: 'RECRUITMENT',
      resource: 'JobApplication',
      resourceId: applicationId,
      actorId: viewerId,
      metadata: { viewerRole },
      timestamp: new Date(),
    });
  }
}
```

---

## Implementation Guidelines

### Development Environment Setup

#### Prerequisites

```bash
# Node.js 18+ required
node --version

# PostgreSQL 14+ required
psql --version

# Redis for caching
redis-server --version

# Environment variables
cp .env.example .env
# Edit .env with your configuration
```

#### Database Setup

```bash
# Create database
createdb blih_hr_recruitment

# Run migrations
npm run migration:run

# Seed data
npm run seed:recruitment
```

#### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm run test

# Run integration tests
npm run test:e2e
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
// Base service pattern
@Injectable()
export class BaseRecruitmentService<T> {
  constructor(
    protected repository: Repository<T>,
    protected auditService: AuditService,
    protected notificationService: NotificationService,
  ) {}

  async create(dto: CreateDto, userId: string): Promise<T> {
    await this.validateCreatePermissions(userId);
    const entity = await this.repository.save(dto);
    await this.auditService.logAction('CREATE', entity.id, userId);
    await this.notificationService.sendCreationNotification(entity);
    return entity;
  }

  async update(id: string, dto: UpdateDto, userId: string): Promise<T> {
    const existing = await this.findById(id);
    await this.validateUpdatePermissions(userId, existing);
    const updated = await this.repository.save({ ...existing, ...dto });
    await this.auditService.logAction('UPDATE', id, userId, {
      before: existing,
      after: updated,
    });
    return updated;
  }
}

// Specific service implementation
@Injectable()
export class JobPostingService extends BaseRecruitmentService<JobPosting> {
  async approveJobPosting(id: string, approverId: string): Promise<JobPosting> {
    const jobPosting = await this.findById(id);
    await this.validateApprovalPermissions(approverId, jobPosting);

    const updated = await this.update(
      id,
      {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedAt: new Date(),
      },
      approverId,
    );

    await this.workflowService.advanceWorkflow(jobPosting.workflowId);
    return updated;
  }
}
```

#### DTO Validation Patterns

```typescript
// Create DTO with validation
export class CreateJobPostingDto {
  @IsString()
  @MinLength(10)
  @MaxLength(255)
  title: string;

  @IsUUID()
  departmentId: string;

  @IsString()
  @MinLength(50)
  description: string;

  @IsObject()
  @ValidateNested()
  @Type(() => JobRequirementsDto)
  requirements: JobRequirementsDto;

  @IsObject()
  @ValidateNested()
  @Type(() => SalaryRangeDto)
  salaryRange: SalaryRangeDto;

  @IsEnum(EmploymentType)
  employmentType: EmploymentType;

  @IsEnum(WorkMode)
  workMode: WorkMode;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.MEDIUM;
}

// Custom validation decorator
export function IsValidSalaryRange(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidSalaryRange',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: SalaryRangeDto) {
          return value.min > 0 && value.max > value.min;
        },
        defaultMessage(): string {
          return 'Invalid salary range: max must be greater than min and both must be positive';
        },
      },
    });
  };
}
```

### Testing Strategies

#### Unit Testing Example

```typescript
describe('CandidateScoringService', () => {
  let service: CandidateScoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CandidateScoringService],
    }).compile();

    service = module.get<CandidateScoringService>(CandidateScoringService);
  });

  describe('calculateMatchScore', () => {
    it('should calculate perfect score for ideal candidate', () => {
      const candidate: Candidate = {
        yearsExperience: 10,
        skills: ['JavaScript', 'Node.js', 'React'],
        education: 'Bachelor',
        // ... other fields
      };

      const requirements: JobRequirements = {
        minYears: 5,
        requiredSkills: ['JavaScript', 'Node.js', 'React'],
        educationLevel: 'Bachelor',
      };

      const result = service.calculateMatchScore(candidate, requirements);

      expect(result.total).toBeGreaterThan(90);
      expect(result.skills).toBe(100);
      expect(result.experience).toBe(100);
    });

    it('should calculate low score for unqualified candidate', () => {
      const candidate: Candidate = {
        yearsExperience: 1,
        skills: ['HTML'],
        education: 'High School',
      };

      const requirements: JobRequirements = {
        minYears: 5,
        requiredSkills: ['JavaScript', 'Node.js', 'React'],
        educationLevel: 'Bachelor',
      };

      const result = service.calculateMatchScore(candidate, requirements);

      expect(result.total).toBeLessThan(50);
      expect(result.skills).toBeLessThan(50);
    });
  });
});
```

#### Integration Testing Example

```typescript
describe('JobPostingController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/api/hr/recruitment/jobs (POST)', () => {
    it('should create a new job posting', () => {
      return request(app.getHttpServer())
        .post('/api/hr/recruitment/jobs')
        .set('Authorization', 'Bearer valid-token')
        .send({
          title: 'Software Engineer',
          departmentId: 'valid-department-id',
          description: 'Job description...',
          requirements: { skills: ['JavaScript'] },
          salaryRange: { min: 50000, max: 80000 },
          employmentType: 'FULL_TIME',
          workMode: 'OFFICE',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined();
          expect(res.body.status).toBe('DRAFT');
        });
    });

    it('should validate required fields', () => {
      return request(app.getHttpServer())
        .post('/api/hr/recruitment/jobs')
        .set('Authorization', 'Bearer valid-token')
        .send({})
        .expect(400);
    });
  });
});
```

---

## Deployment Instructions

### Environment Configuration

#### Production Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_recruitment
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=recruitment-service

# External Services
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_JOB_CHANNEL_ID=@your-job-channel

# File Storage
AWS_S3_BUCKET=blih-hr-resumes
AWS_REGION=us-east-1

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=recruitment@example.com
SMTP_PASS=smtp-password

# Security
CANDIDATE_DATA_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "dist/main.js"]
```

#### Docker Compose

```yaml
version: '3.8'

services:
  recruitment-api:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/blih_hr_recruitment
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=blih_hr_recruitment
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - recruitment-api
    restart: unless-stopped

volumes:
  postgres_data:
```

### Kubernetes Deployment

#### Deployment Manifest

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: recruitment-api
  labels:
    app: recruitment-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: recruitment-api
  template:
    metadata:
      labels:
        app: recruitment-api
    spec:
      containers:
        - name: recruitment-api
          image: blih/recruitment-api:latest
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: app-config
                  key: redis-url
          resources:
            requests:
              memory: '256Mi'
              cpu: '250m'
            limits:
              memory: '512Mi'
              cpu: '500m'
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: recruitment-api-service
spec:
  selector:
    app: recruitment-api
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Database Connection Issues

**Problem:** Application fails to connect to PostgreSQL database

```
Error: getaddrinfo ENOTFOUND localhost
```

**Solutions:**

1. Check database server status

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check connection
psql -h localhost -U postgres -d blih_hr_recruitment
```

2. Verify connection string

```bash
# Test connection string
psql "postgresql://user:password@localhost:5432/blih_hr_recruitment"
```

3. Check network connectivity

```bash
# Test network connectivity
telnet localhost 5432
```

#### Performance Issues

**Problem:** Slow API response times (>2 seconds)

**Diagnosis:**

```sql
-- Check slow queries
SELECT query, mean_time, calls
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE tablename = 'job_applications';
```

**Solutions:**

1. Add missing indexes

```sql
-- Add index for application status filtering
CREATE INDEX CONCURRENTLY idx_applications_status_created
ON job_applications(status, created_at DESC);

-- Add index for candidate scoring
CREATE INDEX CONCURRENTLY idx_applications_score_desc
ON job_applications(score DESC) WHERE score IS NOT NULL;
```

2. Optimize queries

```typescript
// Before: N+1 query problem
const applications = await this.repository.find({
  where: { jobPostingId },
  relations: ['jobPosting', 'interviews'],
});

// After: Use query builder for better performance
const applications = await this.repository
  .createQueryBuilder('app')
  .leftJoinAndSelect('app.jobPosting', 'job')
  .leftJoinAndSelect('app.interviews', 'int')
  .where('app.jobPostingId = :jobId', { jobId })
  .orderBy('app.score', 'DESC')
  .getMany();
```

#### Memory Issues

**Problem:** Application crashes with out-of-memory error

**Diagnosis:**

```bash
# Check memory usage
docker stats recruitment-api

# Check Node.js heap
node --inspect dist/main.js
# Then connect Chrome DevTools to inspect memory
```

**Solutions:**

1. Optimize memory usage

```typescript
// Process large datasets in chunks
async function processLargeApplications(applications: JobApplication[]) {
  const CHUNK_SIZE = 100;

  for (let i = 0; i < applications.length; i += CHUNK_SIZE) {
    const chunk = applications.slice(i, i + CHUNK_SIZE);
    await processChunk(chunk);

    // Force garbage collection
    if (global.gc) {
      global.gc();
    }
  }
}
```

2. Configure Node.js memory limits

```bash
# Set memory limit in package.json
"scripts": {
  "start": "node --max-old-space-size=1024 dist/main.js"
}
```

#### External Service Integration Issues

**Problem:** LinkedIn API integration fails

**Diagnosis:**

```typescript
// Add logging for API calls
@Injectable()
export class LinkedInService {
  private logger = new Logger(LinkedInService.name);

  async publishJob(jobPosting: JobPosting): Promise<string> {
    try {
      this.logger.log(`Publishing job: ${jobPosting.title}`);

      const response = await this.linkedInClient.jobs.create({
        // ... job data
      });

      this.logger.log(`Successfully published to LinkedIn: ${response.id}`);
      return response.id;
    } catch (error) {
      this.logger.error(`LinkedIn API error: ${error.message}`, error.stack);

      if (error.response?.status === 401) {
        this.logger.error('LinkedIn authentication failed - check credentials');
      }

      throw error;
    }
  }
}
```

**Solutions:**

1. Implement retry logic with exponential backoff

```typescript
async publishWithRetry(jobPosting: JobPosting, maxRetries = 3): Promise<string> {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await this.publishJob(jobPosting);
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        this.logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
```

2. Add circuit breaker pattern

```typescript
@Injectable()
export class LinkedInCircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('LinkedIn circuit breaker is open');
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return (
      this.failures >= this.threshold &&
      Date.now() - this.lastFailureTime < this.timeout
    );
  }

  private onSuccess(): void {
    this.failures = 0;
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
  }
}
```

### Monitoring and Alerting

#### Health Check Endpoints

```typescript
@Controller('health')
export class HealthController {
  constructor(
    private dbService: DatabaseService,
    private redisService: RedisService,
    private linkedInService: LinkedInService,
  ) {}

  @Get()
  async health(): Promise<HealthStatus> {
    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkExternalServices(),
    ]);

    const status = checks.every((check) => check.status === 'fulfilled')
      ? 'healthy'
      : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      checks: {
        database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
        redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
        external: checks[2].status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  }

  @Get('ready')
  async ready(): Promise<ReadinessStatus> {
    // Check if application is ready to receive traffic
    const isReady = await this.isApplicationReady();

    return {
      ready: isReady,
      timestamp: new Date().toISOString(),
    };
  }
}
```

#### Logging Configuration

```typescript
// Winston logging configuration
export const loggerConfig = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
};
```

This comprehensive documentation provides all necessary information for implementing, deploying, and maintaining the HR Recruitment & Hiring System.
