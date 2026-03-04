# BLIH HR System - Comprehensive Implementation Plan

**Purpose:** Complete HR system implementation roadmap based on existing backend architecture and comprehensive HR module documentation  
**Version:** 1.0 | February 2026  
**Scope:** Employee lifecycle management from recruitment to offboarding across 8 sub-systems

---

## Executive Summary

Based on analysis of the existing BLIH system architecture, this plan provides a detailed roadmap to implement a comprehensive HR system leveraging the current NestJS backend, Prisma ORM, and modular domain structure. The system will support 50 integrated forms across 8 HR sub-systems with 85% automation capability.

### Current System State Assessment

**Existing Infrastructure:**

- **Backend:** NestJS with modular domain architecture
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Keycloak integration
- **Current HR Module:** Basic placeholder structure (`hr.module.ts`, `hr.service.ts`, `hr.controller.ts`)
- **User Management:** Complete user profiles, employment, compensation, and lifecycle models
- **RBAC:** Role-based access control system
- **Audit:** Comprehensive audit logging
- **Notifications:** Multi-channel notification system

**Foundation Strengths:**

- Solid user management foundation with profile, employment, compensation models
- Established RBAC and audit systems
- Modular architecture ready for domain expansion
- Existing notification infrastructure
- Keycloak authentication integration

---

## Implementation Roadmap

### Phase 1: Foundation & Core Employee Management (Weeks 1-4)

#### 1.1 Database Schema Extension

**New HR-Specific Models to Add:**

```prisma
// Recruitment Models
model JobPosting {
  id              String    @id @default(uuid()) @db.Uuid
  title           String
  departmentId    String    @db.Uuid
  department      Department @relation(fields: [departmentId], references: [id])
  description     String
  requirements    Json
  salaryRange     Json?
  employmentType  EmploymentType
  workMode        String    // OFFICE/HYBRID/REMOTE
  status          String    @default(DRAFT) // DRAFT/PUBLISHED/CLOSED
  publishedAt     DateTime?
  expiresAt       DateTime?
  createdBy       String    @db.Uuid
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  applications    JobApplication[]
}

model JobApplication {
  id            String   @id @default(uuid()) @db.Uuid
  jobPostingId  String   @db.Uuid
  jobPosting    JobPosting @relation(fields: [jobPostingId], references: [id], onDelete: Cascade)
  candidateName String
  email         String
  phone         String?
  resumeUrl     String?
  coverLetter   String?
  status        String   @default(RECEIVED) // RECEIVED/REVIEW/INTERVIEW/OFFER/REJECTED
  score         Int?
  feedback      Json?
  appliedAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Leave Management Models
model LeaveRequest {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  leaveType   String    // ANNUAL/SICK/MATERNITY/PATERNITY/BEREAVEMENT/STUDY
  startDate   DateTime
  endDate     DateTime
  daysCount   Float
  reason      String?
  status      String    @default(PENDING) // PENDING/APPROVED/REJECTED
  approvedBy  String?   @db.Uuid
  approver    User?     @relation("LeaveApprover", fields: [approvedBy], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model LeaveBalance {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  leaveType   String
  year        Int
  entitled    Float
  used        Float    @default(0)
  available   Float
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, leaveType, year])
}

// Attendance Models
model AttendanceLog {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  clockIn     DateTime?
  clockOut    DateTime?
  breakStart  DateTime?
  breakEnd    DateTime?
  totalHours  Float?
  overtime    Float     @default(0)
  location    Json?     // GPS coordinates, IP address
  method      String    // WIFI/GEO/QR/WEBAUTHN
  flagged     Boolean   @default(false)
  notes       String?
  date        DateTime  @default(now())
  createdAt   DateTime  @default(now())
}

// Performance Models
model PerformanceReview {
  id              String    @id @default(uuid()) @db.Uuid
  userId          String    @db.Uuid
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  reviewerId      String    @db.Uuid
  reviewer        User      @relation("PerformanceReviewer", fields: [reviewerId], references: [id])
  period          String    // Q1-2026, Q2-2026, etc.
  type            String    // QUARTERLY/ANNUAL/PROBATION
  selfRating      Float?
  managerRating   Float?
  finalRating     Float?
  goals           Json?
  achievements    Json?
  improvements   Json?
  status          String    @default(DRAFT) // DRAFT/SUBMITTED/APPROVED
  submittedAt     DateTime?
  approvedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model OKR {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  period      String    // Q1-2026, etc.
  objective   String
  keyResults  Json      // Array of KR objects
  progress    Float     @default(0)
  status      String    @default(ACTIVE) // ACTIVE/COMPLETED/CANCELLED
  parentId    String?   @db.Uuid // For cascading OKRs
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### 1.2 HR Domain Module Structure

**File Organization:**

```
src/domains/hr/
├── hr.module.ts
├── hr.controller.ts
├── hr.service.ts
├── recruitment/
│   ├── recruitment.module.ts
│   ├── recruitment.controller.ts
│   ├── recruitment.service.ts
│   ├── dto/
│   │   ├── create-job-posting.dto.ts
│   │   ├── job-application.dto.ts
│   │   └── hiring-decision.dto.ts
│   └── use-cases/
│       ├── create-job-posting.usecase.ts
│       ├── process-application.usecase.ts
│       └── schedule-interview.usecase.ts
├── employee/
│   ├── employee.module.ts
│   ├── employee.controller.ts
│   ├── employee.service.ts
│   ├── dto/
│   │   ├── onboarding-checklist.dto.ts
│   │   ├── employee-profile.dto.ts
│   │   └── contract-upload.dto.ts
│   └── use-cases/
│       ├── onboard-employee.usecase.ts
│       ├── update-profile.usecase.ts
│       └── manage-contract.usecase.ts
├── attendance/
│   ├── attendance.module.ts
│   ├── attendance.controller.ts
│   ├── attendance.service.ts
│   ├── dto/
│   │   ├── clock-in.dto.ts
│   │   ├── leave-request.dto.ts
│   │   └── timesheet.dto.ts
│   └── use-cases/
│       ├── clock-in-out.usecase.ts
│       ├── process-leave.usecase.ts
│       └── calculate-overtime.usecase.ts
├── performance/
│   ├── performance.module.ts
│   ├── performance.controller.ts
│   ├── performance.service.ts
│   ├── dto/
│   │   ├── performance-review.dto.ts
│   │   ├── okr-creation.dto.ts
│   │   └── training-needs.dto.ts
│   └── use-cases/
│       ├── create-review.usecase.ts
│       ├── manage-okrs.usecase.ts
│       └── assess-training.usecase.ts
└── shared/
    ├── hr-types.ts
    ├── hr-constants.ts
    └── hr-utils.ts
```

#### 1.3 Core Services Implementation

**HR Service Structure:**

```typescript
// hr.service.ts
@Injectable()
export class HrService {
  constructor(
    private recruitmentService: RecruitmentService,
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private performanceService: PerformanceService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  // Dashboard aggregations
  async getHrDashboard(userId: string): Promise<HrDashboardDto> {
    // Aggregate data from all sub-systems
  }

  // Employee lifecycle management
  async manageEmployeeLifecycle(
    userId: string,
    action: LifecycleAction,
  ): Promise<void> {
    // Handle status transitions with proper validation
  }
}
```

### Phase 2: Recruitment & Onboarding (Weeks 5-8)

#### 2.1 Recruitment System Implementation

**Key Features:**

- Job posting creation and approval workflow
- Application processing and AI-powered CV screening
- Interview scheduling with conflict detection
- Offer generation with budget validation
- Candidate scoring algorithm implementation

**Implementation Steps:**

1. **Job Posting Workflow**

   ```typescript
   // recruitment.service.ts
   async createJobPosting(dto: CreateJobPostingDto): Promise<JobPosting> {
     // 1. Validate budget availability
     // 2. Create approval workflow
     // 3. Send notifications to Finance → CEO → HR
     // 4. Auto-publish on approval
   }
   ```

2. **Candidate Scoring Algorithm**

   ```typescript
   // scoring.service.ts
   calculateMatchScore(candidate: Candidate, jobRequirements: JobRequirements): number {
     const weights = {
       experience: 0.30,
       skills: 0.35,
       education: 0.15,
       cultureFit: 0.10,
       communication: 0.10
     };
     // Implement scoring logic from HR_LOGIC.md
   }
   ```

3. **Interview Scheduling**
   ```typescript
   // interview.service.ts
   async scheduleInterview(dto: ScheduleInterviewDto): Promise<Interview> {
     // 1. Check interviewer availability
     // 2. Detect conflicts
     // 3. Send calendar invites
     // 4. Set up video conference links
   }
   ```

#### 2.2 Onboarding System

**Features:**

- Automated checklist generation based on role/department
- Probation tracking with automated alerts
- Document management and verification
- Asset provisioning integration

**Implementation:**

```typescript
// onboarding.service.ts
async generateChecklist(employeeId: string): Promise<OnboardingChecklist> {
  const employee = await this.employeeService.findById(employeeId);

  const tasks = [
    ...onboardingRules.all_employees,
    ...onboardingRules.by_employment_type[employee.employmentType] || [],
    ...onboardingRules.by_role[employee.jobTitle] || []
  ];

  return tasks.map(task => ({
    ...task,
    dueDate: addBusinessDays(employee.joinDate, task.dueDays),
    assignedTo: this.assignTaskToDepartment(task.dept)
  }));
}
```

### Phase 3: Attendance & Leave Management (Weeks 9-12)

#### 3.1 Attendance System

**Core Features:**

- Multi-method clock-in/out (WiFi, GPS, QR, WebAuthn)
- Real-time validation and fraud detection
- Automatic overtime calculation
- Device registration and management

**Implementation:**

```typescript
// attendance.service.ts
async clockIn(userId: string, dto: ClockInDto): Promise<AttendanceLog> {
  // 1. Validate time window
  // 2. Verify location/device
  // 3. Check for duplicates
  // 4. Create attendance record
  // 5. Send real-time notifications
  // 6. Handle timer integration
}

async calculateOvertime(employeeId: string, date: DateTime): Promise<OvertimeCalculation> {
  // Implement overtime rules from HR_LOGIC.md
  // - Weekday: First 2 hours @ 1.5x, beyond @ 2.0x
  // - Weekend: @ 2.0x
  // - Holiday: @ 2.5x
  // - Monthly cap: 40 hours
}
```

#### 3.2 Leave Management

**Features:**

- Automated balance calculation
- Approval workflow engine
- Blackout period enforcement
- Integration with attendance system

**Implementation:**

```typescript
// leave.service.ts
async requestLeave(userId: string, dto: LeaveRequestDto): Promise<LeaveRequest> {
  // 1. Validate leave balance
  // 2. Check notice period
  // 3. Check for overlapping requests
  // 4. Validate blackout dates
  // 5. Create approval workflow
  // 6. Update leave balance
}

async calculateLeaveBalance(userId: string, leaveType: string, asOfDate: DateTime): Promise<LeaveBalance> {
  const entitlement = getAnnualEntitlement(employmentType, leaveType);
  const monthsEmployed = differenceInMonths(asOfDate, hireDate);
  const accrualRate = entitlement / 12;
  const entitledToDate = Math.min(monthsEmployed * accrualRate, entitlement);

  // Calculate used and pending leave
  return {
    entitled: entitledToDate,
    used: usedLeave,
    pending: pendingLeave,
    available: entitledToDate - usedLeave - pendingLeave
  };
}
```

### Phase 4: Performance & Training (Weeks 13-16)

#### 4.1 Performance Management

**Features:**

- Quarterly and annual review cycles
- OKR management and cascading
- 360-degree feedback
- Compensation recommendations

**Implementation:**

```typescript
// performance.service.ts
async createReview(dto: CreateReviewDto): Promise<PerformanceReview> {
  // 1. Create review period
  // 2. Link to OKRs
  // 3. Set up workflow (Self → Manager → HR)
  // 4. Schedule notifications
}

async calculateFinalRating(reviewId: string): Promise<FinalRating> {
  const review = await this.findReviewById(reviewId);
  const selfAverage = this.calculateAverage(review.selfAssessment.goal_ratings);
  const managerAverage = this.calculateAverage(review.managerReview.goal_ratings);

  // Weighted final (manager has 60% weight)
  const finalRating = (selfAverage * 0.4) + (managerAverage * 0.6);

  return {
    finalRating,
    category: this.determineCategory(finalRating),
    compensationRecommendation: this.calculateRecommendation(finalRating)
  };
}
```

#### 4.2 Training & Development

**Features:**

- Training needs assessment
- Course catalog and enrollment
- Skill gap analysis
- Career development planning

### Phase 5: Employee Relations & Offboarding (Weeks 17-20)

#### 5.1 Employee Relations

**Features:**

- Employee recognition system
- Pulse surveys and feedback
- Complaint and grievance handling
- Wellness program integration

#### 5.2 Offboarding System

**Features:**

- Resignation processing
- Asset return tracking
- Knowledge transfer planning
- Exit interviews and analytics

---

## Technical Implementation Details

### API Design Patterns

#### RESTful API Structure

```typescript
// hr.controller.ts
@Controller('hr')
@ApiTags('HR Management')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class HrController {
  // Recruitment endpoints
  @Post('recruitment/jobs')
  @RequirePermissions('hr:recruitment:create')
  async createJobPosting(@Body() dto: CreateJobPostingDto) {}

  @Get('recruitment/jobs')
  async getJobPostings(@Query() query: JobPostingQueryDto) {}

  @Post('recruitment/applications')
  async submitApplication(@Body() dto: JobApplicationDto) {}

  // Employee endpoints
  @Get('employees')
  async getEmployees(@Query() query: EmployeeQueryDto) {}

  @Post('employees/:id/onboarding')
  async startOnboarding(@Param('id') id: string) {}

  // Attendance endpoints
  @Post('attendance/clock-in')
  async clockIn(@Body() dto: ClockInDto) {}

  @Post('attendance/clock-out')
  async clockOut(@Body() dto: ClockOutDto) {}

  @Post('leave/requests')
  async requestLeave(@Body() dto: LeaveRequestDto) {}

  // Performance endpoints
  @Post('performance/reviews')
  async createReview(@Body() dto: CreateReviewDto) {}

  @Post('performance/okrs')
  async createOKR(@Body() dto: CreateOKRDto) {}
}
```

### Integration Points

#### 1. Keycloak Integration

- User authentication and authorization
- Role synchronization
- Session management

#### 2. Notification System

- Email notifications for approvals
- In-app notifications for actions
- WebSocket for real-time updates

#### 3. Audit System

- All HR actions logged
- Data change tracking
- Compliance reporting

#### 4. Finance Integration

- Budget validation for hiring
- Payroll updates for compensation changes
- Overtime cost tracking

### Security & Compliance

#### Data Privacy

- Field-level access control
- GDPR compliance
- Audit trail for sensitive data

#### Access Control Matrix

```typescript
const HR_PERMISSIONS = {
  // Recruitment
  'hr:recruitment:create': ['HR_MANAGER', 'HIRING_MANAGER'],
  'hr:recruitment:approve': ['HR_MANAGER', 'DEPARTMENT_HEAD', 'CEO'],

  // Employee Management
  'hr:employee:read': ['HR_MANAGER', 'MANAGER', 'EMPLOYEE_OWN'],
  'hr:employee:update': ['HR_MANAGER', 'MANAGER'],
  'hr:employee:compensation': ['HR_MANAGER', 'FINANCE', 'CEO'],

  // Attendance
  'hr:attendance:own': ['EMPLOYEE'],
  'hr:attendance:team': ['MANAGER'],
  'hr:attendance:all': ['HR_MANAGER'],

  // Performance
  'hr:performance:review': ['MANAGER', 'HR_MANAGER'],
  'hr:performance:approve': ['HR_MANAGER', 'DEPARTMENT_HEAD'],
};
```

---

## Deployment Strategy

### Environment Setup

1. **Development Environment**
   - Local PostgreSQL with Docker
   - Mock Keycloak instance
   - Redis for caching

2. **Staging Environment**
   - Full Keycloak integration
   - Production-like data
   - Performance testing

3. **Production Deployment**
   - Gradual rollout by module
   - Feature flags for new functionality
   - Monitoring and alerting

### Migration Strategy

1. **Data Migration**
   - Existing user data preservation
   - New HR tables creation
   - Data validation scripts

2. **Feature Migration**
   - Phase-by-phase feature rollout
   - Backward compatibility
   - User training and documentation

---

## Testing Strategy

### Unit Testing

- Service layer business logic
- Use case implementations
- Utility functions

### Integration Testing

- API endpoint testing
- Database interactions
- Third-party integrations

### E2E Testing

- Complete user workflows
- Multi-user scenarios
- Performance testing

### Test Coverage Targets

- Unit tests: 90%+
- Integration tests: 80%+
- E2E tests: All critical workflows

---

## Success Metrics & KPIs

### Implementation Metrics

- **Timeline Adherence:** On-time delivery of each phase
- **Quality:** Bug count and defect density
- **Performance:** API response times < 200ms
- **Uptime:** 99.9% availability

### Business Metrics

- **User Adoption:** 90% employee usage within 3 months
- **Process Efficiency:** 50% reduction in manual HR tasks
- **Data Accuracy:** 95% data completeness
- **Compliance:** 100% audit trail coverage

---

## Risk Assessment & Mitigation

### Technical Risks

1. **Database Performance**
   - Risk: Large dataset affecting query performance
   - Mitigation: Proper indexing, query optimization

2. **Integration Complexity**
   - Risk: Third-party system failures
   - Mitigation: Circuit breakers, retry mechanisms

3. **Data Security**
   - Risk: Sensitive employee data exposure
   - Mitigation: Encryption, access controls, audit trails

### Business Risks

1. **User Adoption**
   - Risk: Low user adoption
   - Mitigation: User training, intuitive UI, gradual rollout

2. **Compliance**
   - Risk: Regulatory non-compliance
   - Mitigation: Legal review, compliance testing

---

## Conclusion

This comprehensive HR system implementation plan leverages the existing BLIH system architecture to deliver a full-featured HR management solution. The phased approach ensures manageable development cycles while delivering value incrementally. The modular design allows for future enhancements and maintains alignment with the existing technology stack.

**Key Success Factors:**

- Strong foundation with existing user management and RBAC systems
- Comprehensive documentation and business logic already defined
- Modular architecture supporting incremental development
- Integration with existing platform services

**Next Steps:**

1. Review and approve implementation plan
2. Allocate development resources
3. Set up development infrastructure
4. Begin Phase 1 implementation

This implementation will transform the current basic HR module into a comprehensive, automated HR management system supporting the full employee lifecycle from recruitment to offboarding.
