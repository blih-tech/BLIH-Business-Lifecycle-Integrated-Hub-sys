# BLIH HR Management System - Technical Documentation

## Table of Contents

1. [System Overview](#system-overview)
2. [Authentication & Security Layer](#authentication--security-layer)
3. [System Architecture](#system-architecture)
4. [Core HR Modules](#core-hr-modules)
5. [Database Documentation](#database-documentation)
6. [API Documentation](#api-documentation)
7. [User Role Workflows](#user-role-workflows)
8. [Security & Compliance](#security--compliance)
9. [Operational Documentation](#operational-documentation)

---

## System Overview

The BLIH HR Management System is a comprehensive enterprise-grade Human Resources management platform built with modern technologies:

### Technology Stack

- **Backend Framework**: NestJS (Node.js/TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Keycloak (OAuth2/OIDC)
- **Architecture**: Clean Architecture with DDD principles
- **API**: RESTful with OpenAPI/Swagger documentation

### System Capabilities

- Employee lifecycle management (onboarding to offboarding)
- Recruitment and hiring workflows
- Leave management and approval chains
- Attendance tracking and reconciliation
- Performance reviews and calibration
- Training and skills management
- Employee relations and compliance
- Document management with expiry tracking

---

## Authentication & Security Layer

### Authentication Flow

#### Keycloak Integration

The system uses Keycloak as the identity provider with comprehensive OAuth2/OIDC implementation:

**Token Validation Process:**

1. Client sends Bearer token in Authorization header
2. `KeycloakAuthGuard` extracts and validates token
3. JWT signature verification using JWKS caching
4. Token payload extraction and claims validation
5. User info fallback if required claims missing
6. Principal enrichment with database context
7. Permission resolution and caching

**Key Components:**

- `KeycloakTokenService`: Token validation, refresh, revocation
- `KeycloakAuthGuard`: Authentication guard with MFA enforcement
- `PrincipalEnrichmentService`: User context enrichment
- `UserPermissionSnapshotService`: Permission caching (5-minute TTL)

#### Authentication Endpoints

**POST /api/v1/auth/validate**

```typescript
// Request
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// Response
{
  "active": true,
  "policyVersion": "2026.1",
  "sub": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
  "email": "admin@blih.local",
  "scopes": ["openid", "profile", "email"],
  "roles": ["superadmin"],
  "permissions": ["user:view", "user:update"]
}
```

**POST /api/v1/auth/introspect**
Performs Keycloak token introspection and returns normalized token metadata.

**POST /api/v1/auth/exchange**
Token exchange with optional subject impersonation for new access/refresh token pair.

**POST /api/v1/auth/refresh**
Refreshes access token using refresh token.

**POST /api/v1/auth/revoke-session**
Revokes access or refresh token with session metadata.

**GET /api/v1/auth/me**
Returns authenticated user profile and access context:

```typescript
{
  "id": "0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374",
  "keycloakId": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
  "username": "admin1",
  "email": "admin@blih.local",
  "firstName": "Admin",
  "lastName": "User",
  "status": "ACTIVE",
  "departmentId": "1f31a301-dfb8-4071-aab1-ad6bc4891da7",
  "sub": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
  "roles": ["superadmin"],
  "permissions": ["user:view", "user:update"],
  "scopes": ["openid", "profile", "email"],
  "sessionId": "4f5c57c7-4f17-4171-a23a-53f38eb9f7c8",
  "clientId": "blih-system-api"
}
```

### Authorization Model (RBAC)

#### Role-Based Access Control

The system implements a sophisticated RBAC model with hierarchical roles and granular permissions:

**Permission Structure:**

- **Resource**: Entity being accessed (user, employee, leave, etc.)
- **Action**: Operation being performed (view, create, update, delete)
- **Permission**: Resource + Action combination (e.g., "employee:view")
- **Role**: Collection of permissions with hierarchical inheritance
- **Wildcard Permissions**: Superadmin gets "\*" for full access

**Permission Resolution Process:**

1. Extract user roles from JWT token
2. Expand role hierarchy (include parent roles)
3. Query role permissions from database
4. Merge with direct user permissions
5. Apply wildcard permissions for superadmin
6. Cache result for 5 minutes

**Key Permission Groups:**

```typescript
// Employee Management
EmployeePermissions = {
  VIEW: 'employee:view',
  CREATE: 'employee:create',
  UPDATE: 'employee:update',
  TERMINATE: 'employee:terminate',
};

// Leave Management
LeavePermissions = {
  VIEW: 'leave:view',
  CREATE: 'leave:create',
  APPROVE: 'leave:approve',
  REJECT: 'leave:reject',
};

// Performance Management
PerformancePermissions = {
  VIEW: 'performance:view',
  CREATE: 'performance:create',
  UPDATE_SELF: 'performance:update_self',
  UPDATE_MANAGER: 'performance:update_manager',
  COMPLETE: 'performance:complete',
};
```

#### Security Controls

**MFA Enforcement:**

- Required for privileged roles (superadmin, hr_manager, etc.)
- Validated against `amr` (Authentication Methods Reference) claim
- Blocks access if MFA not present for privileged operations

**Session Management:**

- JWT access tokens with configurable expiration
- Refresh tokens for session renewal
- Session tracking with unique identifiers
- Concurrent session limits (configurable, default: 3)

**Trusted Principal Headers:**

- Internal service-to-service authentication
- Requires shared secret validation
- Bypasses token validation for trusted services
- Used by background jobs and internal APIs

---

## System Architecture

### Layered Architecture

The system follows Clean Architecture principles with clear separation of concerns:

#### 1. Controller Layer

**Location**: `src/domains/*/controllers/`

- **Responsibility**: HTTP request handling and response formatting
- **Decorators**: `@ApiTags`, `@ApiOperation`, `@Roles`, `@ApiProtected`
- **Validation**: DTO validation with class-validator
- **Example**: `EmployeesController`, `LeaveController`, `RecruitmentRequestsController`

#### 2. Use Case Layer

**Location**: `src/domains/*/use-cases/`

- **Responsibility**: Business logic implementation
- **Pattern**: Single responsibility per use case
- **Dependencies**: Services and repositories
- **Example**: `CreateLeaveRequestUseCase`, `ApproveRecruitmentRequestUseCase`

#### 3. Service Layer

**Location**: `src/domains/*/services/` and `src/platform/*/services/`

- **Responsibility**: Cross-cutting concerns and complex operations
- **Types**: Domain services and infrastructure services
- **Example**: `LeaveBalanceService`, `AttendanceCalendarService`, `KeycloakTokenService`

#### 4. Repository Layer

**Location**: Prisma ORM (abstracted)

- **Responsibility**: Database access and data persistence
- **Implementation**: PrismaClient with generated types
- **Transactions**: Automatic and manual transaction support

### Dependency Injection Patterns

**Module Structure:**

```typescript
@Module({
  controllers: [EmployeesController],
  providers: [
    ListEmployeesUseCase,
    GetEmployeeFullUseCase,
    // ... other use cases
  ],
})
export class HrModule {}
```

**Provider Registration:**

- Use cases registered as providers
- Services injected via constructor
- Circular dependency prevention
- Lifetime management (singleton by default)

### Middleware & Interceptors

**Request Processing Pipeline:**

1. **CorrelationIdMiddleware**: Adds unique request ID
2. **KeycloakAuthGuard**: Authentication validation
3. **RbacGuard**: Authorization checks
4. **LoggingInterceptor**: Request/response logging
5. **PreAuditInterceptor**: Audit trail preparation
6. **AuditInterceptor**: Final audit logging
7. **ResponseEnvelopeInterceptor**: Standardized response format

**Error Handling:**

- **HttpExceptionFilter**: Global exception handling
- **Standardized Error Format**: Consistent error responses
- **Validation Errors**: Detailed field-level errors
- **Audit Logging**: All errors logged for compliance

### Background Jobs & Schedulers

**System-Level Jobs:**

- **SyncUsersJob**: Keycloak user synchronization (every 5 minutes)
- **SyncRolesJob**: Role and permission synchronization (every 10 minutes)
- **RotateClientSecretsJob**: Security credential rotation (daily)
- **CleanupAuditJob**: Audit log maintenance (weekly)

**HR-Specific Jobs:**

- **DocumentExpiryJob**: Document expiration monitoring (daily)
- **AttendanceReconciliationJob**: Daily attendance processing (nightly)
- **CertificationExpiryJob**: Certification expiration alerts (daily)

**Job Implementation Pattern:**

```typescript
@Injectable()
export class SyncUsersJob {
  private readonly logger = new Logger(SyncUsersJob.name);

  @Cron('0 */5 * * * *') // Every 5 minutes
  async handleCron() {
    this.logger.log('Starting user synchronization...');
    // Implementation
  }
}
```

---

## Core HR Modules

### Employee Management

#### User Lifecycle States

```typescript
enum LifecycleStatus {
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  ON_LEAVE = 'ON_LEAVE',
  TERMINATED = 'TERMINATED',
  RESIGNED = 'RESIGNED',
  RETIRED = 'RETIRED',
}
```

#### Employee Data Model

**Core Entities:**

- **User**: Base user record with Keycloak integration
- **UserProfile**: Personal information and contact details
- **UserEmployment**: Employment details, position, manager
- **UserCompensation**: Salary and compensation components
- **UserLifecycle**: Status tracking and transitions
- **EmployeeDocument**: Document management with verification

#### Key Workflows

**Employee Creation Flow:**

1. User created in Keycloak (external)
2. SyncUsersJob detects new user
3. User record created in database
4. UserProfile populated with basic info
5. UserEmployment record created
6. UserLifecycle set to ONBOARDING
7. Onboarding checklist generated

**Employee Profile Update:**

1. Employee requests profile changes
2. Validation of business rules
3. Update UserProfile record
4. Audit log entry created
5. Notification sent to manager (if applicable)

**Employee Termination:**

1. Termination date and reason recorded
2. UserLifecycle status changed to TERMINATED
3. Access revoked in Keycloak
4. Offboarding checklist generated
5. Final settlement calculated
6. Document archive process initiated

#### API Endpoints

**GET /api/v1/hr/employees**

- **Purpose**: List employees with filtering and pagination
- **Permissions**: `employee:view`
- **Filters**: departmentId, lifecycleStatus, employmentType, search
- **Response**: Paginated employee list with basic details

**GET /api/v1/hr/employees/:id**

- **Purpose**: Get complete employee record
- **Permissions**: `employee:view`
- **Response**: Full employee profile with all related data

#### Business Rules

- Employees cannot be deleted, only terminated
- Profile changes require manager approval for certain fields
- Document verification required for compliance
- Lifecycle transitions follow state machine pattern

### Recruitment Module

#### Recruitment Workflow States

```typescript
enum RecruitmentRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED',
}

enum HiringDecisionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  HIRED = 'HIRED',
}
```

#### Recruitment Process Flow

**1. Recruitment Request Creation:**

```typescript
// POST /api/v1/hr/recruitment/requests
{
  "departmentId": "dept-uuid",
  "positionId": "position-uuid",
  "type": "NEW" | "REPLACEMENT",
  "replacementUserId": "user-uuid", // for REPLACEMENT type
  "rationale": {
    "businessNeed": "Growing team workload",
    "budgetApproval": "Approved in Q3 budget"
  },
  "staffing": {
    "headcountImpact": 1,
    "budgetImpact": 75000
  },
  "schedule": {
    "targetStartDate": "2024-03-01",
    "urgency": "HIGH"
  }
}
```

**2. Approval Workflow:**

- Request submitted → Department Manager review
- Budget validation and headcount check
- HR review for compliance
- Final approval → Job posting creation

**3. Job Posting Generation:**

- Auto-generated from approved request
- Published to internal/external job boards
- Application tracking and screening

**4. Hiring Decision Process:**

- Candidate screening and interviews
- Background checks and assessments
- Hiring decision with offer details
- Offer acceptance and onboarding trigger

#### Key Data Models

**RecruitmentRequest:**

- requestId: Auto-generated (REQ-2024-001)
- departmentId, positionId: Foreign keys
- type: NEW | REPLACEMENT | CONTRACT
- status: Workflow state tracking
- rationale: Business justification (JSON)
- staffing: Budget and headcount impact (JSON)

**HiringDecision:**

- recruitmentRequestId: Link to request
- candidateId: Selected candidate
- decision: APPROVE | REJECT
- offerDetails: Compensation and terms
- status: Decision workflow state

#### API Endpoints

**Recruitment Requests:**

- `POST /api/v1/hr/recruitment/requests` - Create request
- `GET /api/v1/hr/recruitment/requests` - List with filters
- `GET /api/v1/hr/recruitment/requests/:id` - Get details
- `PATCH /api/v1/hr/recruitment/requests/:id` - Update request
- `POST /api/v1/hr/recruitment/requests/:id/submit` - Submit for approval
- `POST /api/v1/hr/recruitment/requests/:id/approve` - Approve request

**Hiring Decisions:**

- `POST /api/v1/hr/recruitment/hiring-decisions` - Create decision
- `GET /api/v1/hr/recruitment/hiring-decisions/:id` - Get decision
- `PATCH /api/v1/hr/recruitment/hiring-decisions/:id/finalize` - Finalize decision
- `POST /api/v1/hr/recruitment/hiring-decisions/:id/accept` - Accept offer

#### Business Rules

- Headcount enforcement for departments
- Budget validation before approval
- Replacement requires valid employee reference
- Auto-generates job postings from approved requests

### Leave Management

#### Leave Types and Entitlements

```typescript
enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  COMPASSIONATE = 'COMPASSIONATE',
  UNPAID = 'UNPAID',
  STUDY = 'STUDY',
}

enum LeaveRequestStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}
```

#### Leave Request Process

**1. Leave Request Creation:**

```typescript
// POST /api/v1/hr/leave/requests
{
  "userId": "employee-uuid",
  "leaveType": "ANNUAL",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "startHalfDay": false,
  "endHalfDay": false,
  "reason": "Family vacation",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567890"
  }
}
```

**2. Validation Rules:**

- Date range validation (end ≥ start, same year)
- Half-day logic for single-day requests
- Leave balance sufficiency check
- Overlap prevention with existing requests
- Business day calculation (excludes holidays/weekends)

**3. Approval Workflow:**

- Single-level approval for standard leave
- Multi-level approval for extended periods
- Automatic approval for certain conditions
- Rejection with reason requirement

**4. Leave Balance Management:**

- Annual accrual based on employment type
- Carry-forward rules with limits
- Pro-rated calculation for new joiners
- Negative balance prevention

#### Key Services

**LeaveBalanceService:**

- Calculates available leave days
- Handles accrual and consumption
- Manages carry-forward balances
- Generates balance reports

**AttendanceCalendarService:**

- Business day calculations
- Holiday integration
- Work schedule consideration
- Leave impact analysis

#### API Endpoints

**Leave Requests:**

- `POST /api/v1/hr/leave/requests` - Create request
- `GET /api/v1/hr/leave/requests` - List with filters
- `GET /api/v1/hr/leave/requests/:id` - Get details
- `POST /api/v1/hr/leave/requests/:id/submit` - Submit for approval
- `POST /api/v1/hr/leave/requests/:id/approve` - Approve request
- `POST /api/v1/hr/leave/requests/:id/reject` - Reject request

**Leave Balance:**

- `GET /api/v1/hr/leave/balance/:userId` - Get current balance
- `GET /api/v1/hr/leave/balance/:userId/:year` - Get yearly balance

#### Business Rules

- Leave requests must stay within single calendar year
- Minimum notice periods for certain leave types
- Maximum consecutive days limits
- Manager self-approval prevention
- Termination block for leave requests

### Attendance Tracking

#### Attendance Data Model

```typescript
enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EARLY_DEPARTURE = 'EARLY_DEPARTURE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
}

interface AttendanceLog {
  userId: string;
  date: Date;
  checkInAt?: Date;
  checkOutAt?: Date;
  totalMinutes?: number;
  status: AttendanceStatus;
  notes?: string;
  workScheduleId?: string;
}
```

#### Attendance Management Process

**1. Work Schedule Configuration:**

```typescript
// POST /api/v1/hr/attendance/work-schedules
{
  "name": "Standard Office Hours",
  "description": "Monday-Friday 9AM-6PM",
  "isDefault": true,
  "days": [
    {
      "dayOfWeek": "MONDAY",
      "startTime": "09:00",
      "endTime": "18:00",
      "breakMinutes": 60,
      "isWorkingDay": true
    }
    // ... other days
  ]
}
```

**2. Attendance Logging:**

- Manual check-in/check-out recording
- Automatic integration with time clocks
- Mobile app check-in capability
- GPS/location validation (optional)

**3. Daily Reconciliation:**

- Automated nightly processing
- Missing attendance detection
- Overtime calculation
- Exception flagging for review

**4. Holiday Management:**

- Company-wide holiday calendar
- Country-specific holidays
- Department-specific additions
- Attendance impact calculation

#### Key Services

**AttendanceReconciliationService:**

- Daily automated processing
- Exception detection and reporting
- Overtime calculation rules
- Attendance pattern analysis

**WorkScheduleAssignment:**

- Employee schedule assignment
- Temporary schedule overrides
- Shift pattern management
- Schedule change tracking

#### API Endpoints

**Attendance Logs:**

- `POST /api/v1/hr/attendance/logs` - Create/update log
- `GET /api/v1/hr/attendance/logs` - List with filters
- `GET /api/v1/hr/attendance/logs/:id` - Get details

**Work Schedules:**

- `POST /api/v1/hr/attendance/work-schedules` - Create schedule
- `GET /api/v1/hr/attendance/work-schedules` - List schedules
- `POST /api/v1/hr/attendance/users/:userId/schedule` - Assign schedule

**Holidays:**

- `POST /api/v1/hr/attendance/holidays` - Create holiday
- `GET /api/v1/hr/attendance/holidays` - List holidays

#### Business Rules

- Attendance blocked for terminated employees
- Check-out must be after check-in
- Automatic overtime calculation based on schedule
- Holiday exclusion from working day calculations

### Performance Management

#### Performance Review Process

```typescript
enum PerformanceReviewStatus {
  NOT_STARTED = 'NOT_STARTED',
  SELF_ASSESSMENT = 'SELF_ASSESSMENT',
  MANAGER_REVIEW = 'MANAGER_REVIEW',
  CALIBRATION = 'CALIBRATION',
  COMPLETED = 'COMPLETED',
}

enum ReviewRating {
  OUTSTANDING = 5,
  EXCEEDS_EXPECTATIONS = 4,
  MEETS_EXPECTATIONS = 3,
  NEEDS_IMPROVEMENT = 2,
  UNSATISFACTORY = 1,
}
```

#### Performance Review Workflow

**1. Review Period Configuration:**

```typescript
// POST /api/v1/hr/performance/review-periods
{
  "name": "2024 Annual Review",
  "year": 2024,
  "type": "ANNUAL",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "selfAssessmentDeadline": "2024-03-31",
  "managerReviewDeadline": "2024-04-30",
  "calibrationDate": "2024-05-15"
}
```

**2. Performance Review Creation:**

- Auto-generated for eligible employees
- Based on review period configuration
- Initial status: NOT_STARTED
- Notification to employee and manager

**3. Self-Assessment Phase:**

- Employee completes self-assessment
- Goal achievement documentation
- Skills and competencies rating
- Evidence and examples provided

**4. Manager Review Phase:**

- Manager evaluates employee performance
- Compares with self-assessment
- Provides specific feedback
- Recommends development areas

**5. Calibration Process:**

- Cross-team rating consistency
- Manager calibration meetings
- Final rating adjustments
- Bias prevention measures

**6. Final Completion:**

- Overall rating calculation
- Development plan creation
- Employee acknowledgment
- HR sign-off and archiving

#### OKR (Objectives and Key Results)

**OKR Structure:**

```typescript
interface Objective {
  id: string;
  title: string;
  description: string;
  userId: string;
  periodConfigId: string;
  progress: number; // 0-100
  keyResults: KeyResult[];
}

interface KeyResult {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  weight: number; // Relative importance
  progress: number; // 0-100
}
```

**OKR Management Process:**

- Quarterly objective setting
- Key result definition with measurable targets
- Regular progress updates
- Mid-quarter reviews and adjustments
- End-of-quarter scoring

#### API Endpoints

**Performance Reviews:**

- `POST /api/v1/hr/performance/reviews` - Create review
- `GET /api/v1/hr/performance/reviews` - List with filters
- `GET /api/v1/hr/performance/reviews/:id` - Get details
- `PATCH /api/v1/hr/performance/reviews/:id/self-assessment` - Update self-assessment
- `PATCH /api/v1/hr/performance/reviews/:id/manager-review` - Update manager review
- `POST /api/v1/hr/performance/reviews/:id/complete` - Complete review

**Review Periods:**

- `POST /api/v1/hr/performance/review-periods` - Create period
- `GET /api/v1/hr/performance/review-periods` - List periods
- `GET /api/v1/hr/performance/annual-summary/:userId/:year` - Get summary

**OKRs:**

- `POST /api/v1/hr/performance/okrs` - Create OKR
- `GET /api/v1/hr/performance/okrs` - List OKRs
- `GET /api/v1/hr/performance/okrs/:id` - Get details
- `PATCH /api/v1/hr/performance/okrs/:id` - Update OKR
- `PATCH /api/v1/hr/performance/okrs/:id/key-results/:krId` - Update key result

#### Business Rules

- One review per employee per period
- Manager cannot review direct reports without calibration
- Self-assessment required before manager review
- Final rating requires calibration committee approval

### Training & Development

#### Training Management Process

```typescript
enum TrainingRequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

enum SkillLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}
```

**1. Training Request Workflow:**

```typescript
// POST /api/v1/hr/training/requests
{
  "userId": "employee-uuid",
  "trainingName": "Advanced JavaScript Programming",
  "provider": "Tech Academy",
  "startDate": "2024-04-01",
  "endDate": "2024-04-05",
  "cost": 2500,
  "currency": "USD",
  "description": "Modern JavaScript frameworks and best practices",
  "skills": ["javascript", "react", "nodejs"],
  "businessJustification": "Required for new project assignment"
}
```

**2. Approval Process:**

- Manager review for business relevance
- Budget availability check
- HR approval for compliance
- Learning & Development coordination

**3. Skills Management:**

- Skill taxonomy with proficiency levels
- Employee skill assessment and gap analysis
- Training recommendation engine
- Career path integration

**4. Training Budget Management:**

- Annual budget allocation per department
- Budget tracking and consumption
- Cost-benefit analysis
- ROI measurement

#### Key Services

**SkillGapAssessmentService:**

- Current skill inventory analysis
- Required skill comparison
- Gap identification and prioritization
- Training recommendation generation

**TrainingBudgetService:**

- Budget allocation and tracking
- Cost center management
- Expense approval workflows
- Financial reporting

#### API Endpoints

**Training Requests:**

- `POST /api/v1/hr/training/requests` - Create request
- `GET /api/v1/hr/training/requests` - List with filters
- `GET /api/v1/hr/training/requests/:id` - Get details
- `POST /api/v1/hr/training/requests/:id/approve` - Approve request

**Skills Management:**

- `POST /api/v1/hr/training/skills` - Create skill
- `GET /api/v1/hr/training/skills` - List skills
- `GET /api/v1/hr/training/employees/:userId/skills` - Get employee skills
- `POST /api/v1/hr/training/employees/:userId/skills` - Update employee skills

**Training Completion:**

- `POST /api/v1/hr/training/completions` - Record completion
- `GET /api/v1/hr/training/completions` - List completions
- `PATCH /api/v1/hr/training/completions/:id` - Update completion

#### Business Rules

- Training budget limits per employee/year
- Skill assessment required for personalized recommendations
- Certification expiry tracking and alerts
- Mandatory training compliance monitoring

### Employee Relations

#### Employee Relations Management

```typescript
enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

enum DisciplinaryActionType {
  VERBAL_WARNING = 'VERBAL_WARNING',
  WRITTEN_WARNING = 'WRITTEN_WARNING',
  SUSPENSION = 'SUSPENSION',
  DEMOTION = 'DEMOTION',
  TERMINATION = 'TERMINATION',
}
```

**1. Incident Reporting:**

```typescript
// POST /api/v1/hr/relations/incidents
{
  "userId": "employee-uuid",
  "reporterId": "manager-uuid",
  "incidentDate": "2024-03-15",
  "severity": "MEDIUM",
  "category": "POLICY_VIOLATION",
  "description": "Violation of remote work policy",
  "witnesses": ["colleague-uuid"],
  "evidence": ["document-uuid"],
  "immediateAction": "Verbal counseling provided"
}
```

**2. Disciplinary Actions:**

- Progressive discipline process
- Documentation requirements
- Appeal process
- HR oversight and approval

**3. Grievance Handling:**

- Formal grievance submission
- Investigation process
- Resolution tracking
- Escalation procedures

**4. Employee Recognition:**

- Achievement recognition
- Peer nomination system
- Manager endorsements
- Reward and badge system

**5. Survey Management:**

- Employee satisfaction surveys
- 360-degree feedback
- Pulse surveys
- Anonymous response collection

#### API Endpoints

**Incidents:**

- `POST /api/v1/hr/relations/incidents` - Report incident
- `GET /api/v1/hr/relations/incidents` - List incidents
- `GET /api/v1/hr/relations/incidents/:id` - Get details
- `PATCH /api/v1/hr/relations/incidents/:id` - Update incident

**Disciplinary Actions:**

- `POST /api/v1/hr/relations/disciplinary-actions` - Create action
- `GET /api/v1/hr/relations/disciplinary-actions` - List actions
- `GET /api/v1/hr/relations/disciplinary-actions/:id` - Get details

**Grievances:**

- `POST /api/v1/hr/relations/grievances` - Submit grievance
- `GET /api/v1/hr/relations/grievances` - List grievances
- `PATCH /api/v1/hr/relations/grievances/:id` - Update grievance

**Recognition:**

- `POST /api/v1/hr/relations/recognition` - Create recognition
- `GET /api/v1/hr/relations/recognition` - List recognition
- `POST /api/v1/hr/relations/recognition/:id/approve` - Approve recognition

#### Business Rules

- Incident reporting confidentiality requirements
- Progressive discipline policy enforcement
- Grievance response time limits
- Recognition approval workflow

### Offboarding Process

#### Offboarding Workflow

```typescript
enum ResignationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

enum OffboardingTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  SKIPPED = 'SKIPPED',
}
```

**1. Resignation Submission:**

```typescript
// POST /api/v1/hr/offboarding/resignations
{
  "userId": "employee-uuid",
  "proposedLastDay": "2024-04-30",
  "reason": "CAREER_ADVANCEMENT",
  "reasonNotes": "Accepted new position with better growth opportunities",
  "handoverPlan": {
    "responsibilities": "Documented in handover wiki",
    "contacts": "Client list provided to successor",
    "projects": "Project status reports completed"
  },
  "leaveBalanceOptions": {
    "encashment": true,
    "carryForward": false
  }
}
```

**2. Notice Period Validation:**

- Employment type specific notice periods
- Probation period considerations
- Leave balance encashment calculation
- Final settlement preparation

**3. Offboarding Checklist Generation:**

- Role-specific task lists
- Departmental requirements
- Legal and compliance items
- IT and security procedures

**4. Exit Interview Process:**

- Structured interview questionnaire
- Feedback collection and analysis
- Exit reason categorization
- Retention opportunity identification

**5. Asset Return & Settlement:**

- Company asset tracking
- Return confirmation process
- Final salary calculation
- Benefits and entitlements settlement

#### API Endpoints

**Resignations:**

- `POST /api/v1/hr/offboarding/resignations` - Submit resignation
- `GET /api/v1/hr/offboarding/resignations` - List resignations
- `GET /api/v1/hr/offboarding/resignations/:id` - Get details
- `PATCH /api/v1/hr/offboarding/resignations/:id` - Update resignation

**Offboarding Checklists:**

- `GET /api/v1/hr/offboarding/checklists/:userId` - Get checklist
- `POST /api/v1/hr/offboarding/checklists/:userId/tasks/:taskId/complete` - Complete task
- `POST /api/v1/hr/offboarding/checklists/:userId/complete` - Complete offboarding

**Exit Interviews:**

- `POST /api/v1/hr/offboarding/exit-interviews` - Create interview
- `GET /api/v1/hr/offboarding/exit-interviews` - List interviews
- `GET /api/v1/hr/offboarding/exit-interviews/:id` - Get details

**Final Settlement:**

- `POST /api/v1/hr/offboarding/final-settlements` - Create settlement
- `GET /api/v1/hr/offboarding/final-settlements/:id` - Get details
- `PATCH /api/v1/hr/offboarding/final-settlements/:id` - Update settlement

#### Business Rules

- Minimum notice periods based on employment type
- Probation period special handling
- Asset return required for final settlement
- Exit interview confidentiality maintained

---

## Database Documentation

### Database Schema Overview

The system uses PostgreSQL as the primary database with Prisma ORM for type-safe database access. The schema consists of 40+ models organized into logical domains.

### Core Entity Relationships

#### User Management Domain

```
User (1:1) UserProfile
User (1:1) UserEmployment
User (1:1) UserCompensation
User (1:1) UserLifecycle
User (1:N) UserRole
User (1:N) UserPermission
User (1:N) EmployeeDocument
User (1:N) Contract
```

#### Recruitment Domain

```
RecruitmentRequest (1:N) RecruitmentApproval
RecruitmentRequest (1:1) HiringDecision
Department (1:N) RecruitmentRequest
Position (1:N) RecruitmentRequest
User (1:1) RecruitmentRequest (submittedBy)
```

#### Leave Domain

```
LeaveRequest (1:N) LeaveApproval
LeaveRequest (N:1) User
LeaveBalance (N:1) User
Holiday (1:N) CountryReference
```

#### Performance Domain

```
PerformanceReview (1:N) PerformanceReviewFeedback
PerformanceReview (N:1) ReviewPeriodConfig
PerformanceReview (N:1) User
PerformanceCalibration (N:1) ReviewPeriodConfig
```

### Key Tables and Relationships

#### User Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keycloakId VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_keycloakId ON users(keycloakId);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_status ON users(status);
```

#### UserProfile Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  userId UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  firstName VARCHAR(100),
  lastName VARCHAR(100),
  phone VARCHAR(20),
  dateOfBirth DATE,
  gender VARCHAR(20),
  maritalStatus VARCHAR(20),
  address JSONB,
  emergencyContact JSONB,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_user_profiles_userId ON user_profiles(userId);
CREATE INDEX idx_user_profiles_gender ON user_profiles(gender);
```

#### RecruitmentRequest Table

```sql
CREATE TABLE recruitment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requestId VARCHAR(32) UNIQUE NOT NULL,
  departmentId UUID NOT NULL REFERENCES departments(id),
  positionId UUID REFERENCES positions(id),
  type VARCHAR(20) NOT NULL DEFAULT 'NEW',
  replacementUserId UUID REFERENCES users(id),
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  rationale JSONB,
  staffing JSONB,
  schedule JSONB,
  submittedById UUID NOT NULL REFERENCES users(id),
  submittedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_recruitment_requests_requestId ON recruitment_requests(requestId);
CREATE INDEX idx_recruitment_requests_departmentId ON recruitment_requests(departmentId);
CREATE INDEX idx_recruitment_requests_status ON recruitment_requests(status);
CREATE INDEX idx_recruitment_requests_submittedAt ON recruitment_requests(submittedAt);
```

#### LeaveRequest Table

```sql
CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requestId VARCHAR(32) UNIQUE NOT NULL,
  userId UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leaveType VARCHAR(20) NOT NULL,
  startDate DATE NOT NULL,
  endDate DATE NOT NULL,
  startHalfDay BOOLEAN DEFAULT FALSE,
  endHalfDay BOOLEAN DEFAULT FALSE,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  submittedAt TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_leave_requests_requestId ON leave_requests(requestId);
CREATE INDEX idx_leave_requests_userId ON leave_requests(userId);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_dates ON leave_requests(startDate, endDate);
```

### Database Constraints and Validation

#### Foreign Key Constraints

- All relationships maintain referential integrity
- ON DELETE CASCADE for dependent entities
- ON DELETE RESTRICT for critical references

#### Check Constraints

```sql
-- Leave request date validation
ALTER TABLE leave_requests ADD CONSTRAINT check_leave_dates
  CHECK (endDate >= startDate);

-- User status validation
ALTER TABLE users ADD CONSTRAINT check_user_status
  CHECK (status IN ('ACTIVE', 'DISABLED', 'PENDING'));

-- Performance rating range
ALTER TABLE performance_reviews ADD CONSTRAINT check_rating_range
  CHECK (overallRating >= 1 AND overallRating <= 5);
```

#### Unique Constraints

- User keycloakId and username uniqueness
- Recruitment request ID uniqueness
- Leave request ID uniqueness
- Performance review uniqueness per user/period

### Indexing Strategy

#### Performance-Critical Indexes

```sql
-- Authentication and authorization
CREATE INDEX idx_user_roles_userId ON user_roles(userId);
CREATE INDEX idx_user_roles_roleId ON user_roles(roleId);
CREATE INDEX idx_role_permissions_roleId ON role_permissions(roleId);

-- Attendance queries
CREATE INDEX idx_attendance_logs_user_date ON attendance_logs(userId, date);
CREATE INDEX idx_attendance_logs_status ON attendance_logs(status);

-- Leave balance queries
CREATE INDEX idx_leave_balance_user_type ON leave_balances(userId, leaveType);
CREATE INDEX idx_leave_balance_year ON leave_balances(year);
```

#### JSONB Indexes

```sql
-- Searchable JSON fields
CREATE INDEX idx_user_profiles_address_gin ON user_profiles USING GIN(address);
CREATE INDEX idx_recruitment_requests_rationale_gin ON recruitment_requests USING GIN(rationale);
CREATE INDEX idx_user_employment_history_gin ON user_employment_history USING GIN(changes);
```

### Database Security

#### Row-Level Security

- User access limited to their own data
- Manager access to direct reports
- HR admin access to all employee data
- Audit trail for all data modifications

#### Data Encryption

- PII fields encrypted at rest
- Encryption key management
- Secure data transmission
- Backup encryption

---

## API Documentation

### API Architecture Overview

The API follows RESTful principles with consistent patterns across all modules:

#### Standard Response Format

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  correlationId?: string;
}
```

#### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: {
    field: string;
    message: string;
    code?: string;
  }[];
  correlationId: string;
  timestamp: string;
  path: string;
}
```

### Authentication Endpoints

#### POST /api/v1/auth/validate

**Purpose**: Validate access token and return principal context
**Authentication**: None (public endpoint)
**Request**:

```json
{
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "active": true,
    "policyVersion": "2026.1",
    "sub": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
    "email": "admin@blih.local",
    "scopes": ["openid", "profile", "email"],
    "roles": ["superadmin"],
    "permissions": ["user:view", "user:update"]
  }
}
```

#### GET /api/v1/auth/me

**Purpose**: Get authenticated user profile and permissions
**Authentication**: Required (Bearer token)
**Permissions**: None (uses current user context)
**Response**:

```json
{
  "success": true,
  "data": {
    "id": "0d9ff3b3-0a4a-42c5-a5b6-d4f809ec4374",
    "keycloakId": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
    "username": "admin1",
    "email": "admin@blih.local",
    "firstName": "Admin",
    "lastName": "User",
    "status": "ACTIVE",
    "departmentId": "1f31a301-dfb8-4071-aab1-ad6bc4891da7",
    "sub": "65c827f5-96d6-4ad7-8f4a-80df9794ac2d",
    "roles": ["superadmin"],
    "permissions": ["user:view", "user:update"],
    "scopes": ["openid", "profile", "email"],
    "sessionId": "4f5c57c7-4f17-4171-a23a-53f38eb9f7c8",
    "clientId": "blih-system-api"
  }
}
```

### Employee Management Endpoints

#### GET /api/v1/hr/employees

**Purpose**: List employees with filtering and pagination
**Authentication**: Required
**Permissions**: `employee:view`
**Query Parameters**:

- `departmentId` (string, optional): Filter by department
- `lifecycleStatus` (string, optional): Filter by lifecycle status
- `employmentType` (string, optional): Filter by employment type
- `search` (string, optional): Search in name, email
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20, max: 100)

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "user-uuid",
      "keycloakId": "kc-uuid",
      "username": "jdoe",
      "email": "john.doe@company.com",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "departmentId": "dept-uuid",
      "departmentName": "Engineering",
      "positionTitle": "Senior Developer",
      "employmentType": "FULL_TIME",
      "lifecycleStatus": "ACTIVE"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

#### GET /api/v1/hr/employees/:id

**Purpose**: Get complete employee record
**Authentication**: Required
**Permissions**: `employee:view`
**Response**: Full employee profile including:

- User profile information
- Employment details and history
- Compensation information
- Documents and contracts
- Performance summary
- Leave balances

### Leave Management Endpoints

#### POST /api/v1/hr/leave/requests

**Purpose**: Create new leave request
**Authentication**: Required
**Permissions**: `leave:create`
**Request**:

```json
{
  "userId": "employee-uuid",
  "leaveType": "ANNUAL",
  "startDate": "2024-03-15",
  "endDate": "2024-03-20",
  "startHalfDay": false,
  "endHalfDay": false,
  "reason": "Family vacation"
}
```

**Response**:

```json
{
  "success": true,
  "data": {
    "id": "leave-request-uuid",
    "requestId": "LR-2024-001",
    "userId": "employee-uuid",
    "leaveType": "ANNUAL",
    "startDate": "2024-03-15",
    "endDate": "2024-03-20",
    "daysRequested": 4,
    "status": "DRAFT",
    "createdAt": "2024-03-01T10:00:00Z"
  }
}
```

#### POST /api/v1/hr/leave/requests/:id/approve

**Purpose**: Approve leave request
**Authentication**: Required
**Permissions**: `leave:approve`
**Request**:

```json
{
  "approverComments": "Approved as requested dates are within available balance"
}
```

### Status Codes

#### Success Codes

- `200 OK`: Successful request with data
- `201 Created`: Resource created successfully
- `204 No Content`: Successful request with no response body

#### Client Error Codes

- `400 Bad Request`: Validation errors or malformed request
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource conflict or duplicate
- `422 Unprocessable Entity`: Business rule violations

#### Server Error Codes

- `500 Internal Server Error`: Unexpected server error
- `502 Bad Gateway`: Upstream service error
- `503 Service Unavailable`: Service temporarily unavailable

---

## User Role Workflows

### Superadmin Role

#### Capabilities

- Full system access with wildcard permissions
- User and role management
- System configuration and maintenance
- Audit log access and management
- Cross-department data access

#### Key Workflows

1. **System Configuration**: Access all system settings
2. **User Management**: Create, update, disable users
3. **Role Management**: Define roles and permissions
4. **Audit Oversight**: Review all system activity
5. **Emergency Access**: Bypass normal restrictions

#### API Access Pattern

```typescript
// Superadmin can access any endpoint
const permissions = await userPermissionSnapshot.getPersistedPermissions(principal.sub);
// Returns: ['*'] - wildcard permission

// Can impersonate other users
POST /api/v1/auth/exchange
{
  "token": "admin-token",
  "requestedSubject": "target-user-uuid"
}
```

### HR Manager Role

#### Capabilities

- Employee lifecycle management
- Recruitment request approval
- Leave request approval
- Performance review management
- Departmental reporting
- Document verification

#### Key Workflows

1. **Recruitment Approval**: Review and approve hiring requests
2. **Employee Onboarding**: Manage new hire process
3. **Performance Management**: Conduct reviews and calibrations
4. **Leave Oversight**: Approve/reject leave requests
5. **Department Reporting**: Generate HR analytics

#### API Access Pattern

```typescript
// HR Manager permissions
const permissions = [
  'employee:view', 'employee:create', 'employee:update',
  'recruitment_request:approve',
  'leave:approve', 'leave:view',
  'performance:view', 'performance:update_manager'
];

// Can access department-specific data
GET /api/v1/hr/employees?departmentId=dept-uuid
GET /api/v1/hr/leave/requests?departmentId=dept-uuid
```

### Manager Role

#### Capabilities

- Direct report management
- Performance review completion
- Leave approval for team
- Team attendance oversight
- Limited employee data access

#### Key Workflows

1. **Team Management**: View and update direct reports
2. **Performance Reviews**: Complete manager assessments
3. **Leave Approval**: Approve team leave requests
4. **Attendance Oversight**: Monitor team attendance
5. **Resource Allocation**: Manage team resources

#### API Access Pattern

```typescript
// Manager permissions (limited to direct reports)
const permissions = [
  'employee:view', // limited to direct reports
  'performance:update_manager',
  'leave:approve', // limited to team
  'attendance:view'
];

// Filtered data access
GET /api/v1/hr/employees?managerId=manager-uuid
GET /api/v1/hr/performance/reviews?managerId=manager-uuid
```

### Employee Role

#### Capabilities

- Self-service profile management
- Leave request submission
- Training requests
- Performance self-assessment
- Document upload

#### Key Workflows

1. **Profile Management**: Update personal information
2. **Leave Requests**: Submit and track leave
3. **Training Development**: Request training programs
4. **Performance Participation**: Complete self-assessments
5. **Document Management**: Upload personal documents

#### API Access Pattern

```typescript
// Employee permissions (self-service only)
const permissions = [
  'user_profile:update', // own profile only
  'leave:create', // own requests only
  'training:create', // own requests only
  'performance:update_self' // own reviews only
];

// Self-filtered data access
GET /api/v1/hr/leave/requests?userId=self
GET /api/v1/hr/performance/reviews?userId=self
POST /api/v1/hr/leave/requests (userId must match authenticated user)
```

---

## Security & Compliance

### Authentication Security

#### Token Security

- **JWT Tokens**: RS256 signing algorithm
- **Key Rotation**: Automatic JWKS refresh
- **Token Expiration**: Configurable (default: 1 hour)
- **Refresh Tokens**: Secure storage and rotation

#### Password Security (Keycloak Managed)

- **Password Policy**: Minimum length, complexity requirements
- **Hashing Strategy**: PBKDF2 with salt
- **Failed Login Lockout**: Configurable threshold
- **Password History**: Prevent reuse

#### Session Security

- **Concurrent Sessions**: Limited (default: 3)
- **Session Timeout**: Inactivity-based expiration
- **Secure Storage**: HttpOnly, Secure cookies
- **CSRF Protection**: Token-based mitigation

### Authorization Security

#### Permission Enforcement

- **Granular Permissions**: Resource-action model
- **Role Hierarchy**: Inherited permissions
- **Permission Caching**: 5-minute TTL with invalidation
- **Audit Logging**: All authorization decisions

#### Access Control Patterns

```typescript
// Method-level protection
@Roles(EmployeePermissions.VIEW)
@UseGuards(KeycloakAuthGuard, RbacGuard)
async getEmployee(@Param('id') id: string) {
  // Automatic permission check before execution
}

// Programmatic permission checks
if (!this.hasPermission(user, 'employee:update', employeeId)) {
  throw new ForbiddenException('Insufficient permissions');
}
```

### Data Protection

#### PII Encryption

- **Field-Level Encryption**: Sensitive data columns
- **Encryption Keys**: AWS KMS or similar
- **Key Rotation**: Automated key management
- **Data Masking**: Non-production environments

#### Audit Trail

```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  result: 'SUCCESS' | 'FAILURE';
}
```

#### Compliance Features

- **GDPR Compliance**: Right to be forgotten
- **Data Retention**: Automated cleanup policies
- **Consent Management**: Explicit user consent
- **Privacy Controls**: Data access restrictions

### Security Monitoring

#### Threat Detection

- **Brute Force Protection**: Rate limiting on auth
- **Anomaly Detection**: Unusual access patterns
- **Security Headers**: HSTS, CSP, X-Frame-Options
- **Input Validation**: SQL injection prevention

#### Incident Response

- **Security Events**: Real-time alerting
- **Log Aggregation**: Centralized security logging
- **Incident Escalation**: Automated response procedures
- **Forensic Capabilities**: Detailed audit trails

---

## Operational Documentation

### Environment Configuration

#### Required Environment Variables

```bash
# Database Configuration
DATABASE_URL="postgresql://user:pass@localhost:5432/blih_hr"

# Keycloak Configuration
KEYCLOAK_REALM="blih-system"
KEYCLOAK_CLIENT_ID="blih-system-api"
KEYCLOAK_CLIENT_SECRET="client-secret"
KEYCLOAK_AUTH_SERVER_URL="https://keycloak.company.com/auth"

# Application Configuration
NODE_ENV="production"
PORT=3000
LOG_LEVEL="info"

# Security Configuration
INTERNAL_AUTH_SHARED_SECRET="internal-service-secret"
ENFORCE_MFA_FOR_PRIVILEGED=true
MAX_CONCURRENT_SESSIONS=3

# Feature Flags
ENABLE_AUDIT_LOGGING=true
ENABLE_BACKGROUND_JOBS=true
ENABLE_DOCUMENT_EXPIRY=true
```

#### Configuration Management

- **Environment-Specific**: Separate configs per environment
- **Secret Management**: AWS Secrets Manager or HashiCorp Vault
- **Configuration Validation**: Schema validation at startup
- **Hot Reload**: Configuration changes without restart

### Deployment Process

#### Container Deployment

```dockerfile
# Multi-stage build for production
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Database Migrations

```bash
# Prisma migration process
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

#### Health Checks

```typescript
// /health endpoint
{
  "status": "healthy",
  "timestamp": "2024-03-01T12:00:00Z",
  "version": "1.0.0",
  "checks": {
    "database": "healthy",
    "keycloak": "healthy",
    "backgroundJobs": "running"
  }
}
```

### Logging Strategy

#### Structured Logging

```typescript
// Log format
{
  "timestamp": "2024-03-01T12:00:00Z",
  "level": "info",
  "correlationId": "req-uuid",
  "userId": "user-uuid",
  "action": "employee.update",
  "resource": "employee",
  "resourceId": "emp-uuid",
  "duration": 150,
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "message": "Employee profile updated successfully"
}
```

#### Log Levels

- **ERROR**: System errors and exceptions
- **WARN**: Warning conditions and degraded performance
- **INFO**: General information and business events
- **DEBUG**: Detailed debugging information
- **TRACE**: Fine-grained execution tracing

#### Log Destinations

- **Application Logs**: File system with rotation
- **Access Logs**: Web server access logs
- **Audit Logs**: Database with retention policies
- **Error Logs**: Error tracking service integration

### Monitoring & Alerting

#### Application Metrics

```typescript
// Key performance indicators
{
  "http_requests_total": 10000,
  "http_request_duration_seconds": 0.150,
  "database_connections_active": 25,
  "database_query_duration_seconds": 0.050,
  "authentication_success_total": 950,
  "authentication_failure_total": 50,
  "background_jobs_success_total": 100,
  "background_jobs_failure_total": 2
}
```

#### Health Monitoring

- **Application Health**: Custom health endpoints
- **Database Health**: Connection pool monitoring
- **External Service Health**: Keycloak availability
- **Background Job Health**: Job execution monitoring

#### Alerting Rules

- **Error Rate**: >5% triggers alert
- **Response Time**: >2 seconds triggers alert
- **Database Connections**: >80% utilization triggers alert
- **Authentication Failures**: >10 per minute triggers alert

### Backup & Recovery

#### Database Backup Strategy

- **Daily Backups**: Automated daily snapshots
- **Point-in-Time Recovery**: 15-minute RPO
- **Cross-Region Replication**: Disaster recovery
- **Backup Retention**: 30-day retention policy

#### Application Recovery

- **Graceful Degradation**: Feature flags for partial outages
- **Circuit Breakers**: External service failure handling
- **Retry Logic**: Exponential backoff for transient failures
- **Data Consistency**: Transaction rollback capabilities

---

## Conclusion

This technical documentation provides a comprehensive overview of the BLIH HR Management System's architecture, implementation details, and operational procedures. The system follows modern software engineering practices with:

- **Clean Architecture**: Clear separation of concerns
- **Security-First Design**: Comprehensive authentication and authorization
- **Scalable Patterns**: Horizontal scaling capabilities
- **Maintainable Code**: Modular structure with clear interfaces
- **Production-Ready**: Monitoring, logging, and deployment automation

For specific implementation details or troubleshooting procedures, refer to the module-specific documentation and API reference materials.
