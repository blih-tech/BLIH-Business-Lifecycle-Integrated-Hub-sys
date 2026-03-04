# HR Training & Skill Development Subsystem Implementation Plan

**Purpose:** Comprehensive training management system including course catalog, enrollment, skill assessment, and development tracking.  
**Timeline:** 3 weeks development + 1 week testing  
**Priority:** Medium - Employee development and capability building

---

## Overview

The Training & Skill Development subsystem manages organizational learning capabilities, course delivery, skill assessment, and employee development tracking. This includes 4 core forms covering training needs assessment, course enrollment, skill evaluation, and development planning.

---

## Implementation Structure

### File Organization

```
src/domains/hr/training/
├── training.module.ts
├── training.controller.ts
├── training.service.ts
├── dto/
│   ├── training-needs.dto.ts
│   ├── course-enrollment.dto.ts
│   ├── skill-assessment.dto.ts
│   ├── training-plan.dto.ts
│   ├── course-creation.dto.ts
│   └── certificate-issuance.dto.ts
├── entities/
│   ├── training-course.entity.ts
│   ├── training-enrollment.entity.ts
│   ├── skill-assessment.entity.ts
│   ├── training-plan.entity.ts
│   ├── certificate.entity.ts
│   └── learning-path.entity.ts
├── use-cases/
│   ├── assess-training-needs.usecase.ts
│   ├── manage-course-enrollment.usecase.ts
│   ├── evaluate-skills.usecase.ts
│   ├── create-development-plan.usecase.ts
│   └── issue-certificate.usecase.ts
└── services/
    ├── course-catalog.service.ts
    ├── skill-matrix.service.ts
    ├── learning-analytics.service.ts
    ├── development-planner.service.ts
    └── certificate-generator.service.ts
```

---

## Database Schema Extensions

### New Models Required

```prisma
model TrainingCourse {
  id              String    @id @default(uuid()) @db.Uuid
  title           String
  description     String?

  // Course details
  category        String    // TECHNICAL/SOFT_SKILL/LEADERSHIP/COMPLIANCE/DOMAIN
  subcategory     String?
  level           String    // BEGINNER/INTERMEDIATE/ADVANCED/EXPERT
  format          String    // ONLINE/CLASSROOM/HYBRID/WORKSHOP/WEBINAR
  duration        Int       // Hours
  language        String    @default(EN)

  // Learning objectives
  objectives      Json      // Array of learning objectives
  prerequisites   Json?     // Required skills/knowledge
  targetAudience  Json?     // Target roles/departments

  // Content and materials
  content         Json?     // Course structure and modules
  materials       Json?     // Reading materials, videos, etc.
  assessments     Json?     // Quizzes, assignments, exams

  // Schedule and delivery
  scheduleType    String    // FLEXIBLE/FIXED/RECURRING
  schedule        Json?     // Specific schedule information
  instructorId    String?   @db.Uuid
  instructor      User?     @relation("CourseInstructor", fields: [instructorId], references: [id])
  maxCapacity     Int?
  minEnrollment   Int       @default(1)

  // Pricing and budget
  cost            Decimal?  @db.Decimal(10, 2)
  currency        String?   @default(ETB)
  budgetCode      String?

  // Accreditation and certification
  accreditedBy    String?
  certificateIssued Boolean @default(false)
  credits         Float?    // Continuing education credits

  // Status and lifecycle
  status          String    @default(DRAFT) // DRAFT/ACTIVE/SUSPENDED/ARCHIVED
  approvedBy      String?   @db.Uuid
  approvedAt      DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  enrollments     TrainingEnrollment[]
  skillMappings   CourseSkillMapping[]
  learningPaths   CourseLearningPath[]

  @@index([category, level])
  @@index([status, scheduleType])
}

model TrainingEnrollment {
  id            String    @id @default(uuid()) @db.Uuid
  courseId      String    @db.Uuid
  course        TrainingCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  userId        String    @db.Uuid
  user          User      @relation("TrainingEnrollment", fields: [userId], references: [id], onDelete: Cascade)

  // Enrollment details
  enrollmentType String    // MANDATORY/VOLUNTARY/RECOMMENDED
  requestedBy   String?   @db.Uuid // Manager who recommended/enrolled
  priority      String    @default(MEDIUM) // LOW/MEDIUM/HIGH/CRITICAL

  // Status tracking
  status        String    @default(ENROLLED) // ENROLLED/IN_PROGRESS/COMPLETED/DROPPED/SUSPENDED
  enrolledAt    DateTime  @default(now())
  startedAt     DateTime?
  completedAt   DateTime?
  droppedAt     DateTime?

  // Progress tracking
  progress      Float     @default(0) // 0-100 percentage
  modulesCompleted Json?  // Completed modules tracking
  timeSpent     Int       @default(0) // Minutes spent

  // Performance
  averageScore  Float?    // Average score across assessments
  finalScore    Float?    // Final assessment score
  grade         String?    // A/B/C/D/F or PASS/FAIL

  // Attendance and participation
  attendanceRate Float?    // For classroom courses
  participationScore Float? // Instructor-rated participation

  // Feedback and evaluation
  feedback      Json?     // Course feedback
  rating        Int?      // 1-5 star rating
  recommendations String? // What to study next

  // Certification
  certificateId  String?   @db.Uuid
  certificate   Certificate? @relation("EnrollmentCertificate", fields: [certificateId], references: [id])
  issuedAt      DateTime?

  // Metadata
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([courseId, userId])
  @@index([userId, status])
  @@index([courseId, status])
}

model SkillAssessment {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation("SkillAssessmentUser", fields: [userId], references: [id], onDelete: Cascade)

  // Assessment details
  skillName   String
  category    String    // TECHNICAL/SOFT_SKILL/LEADERSHIP/DOMAIN
  level       String    // BEGINNER/INTERMEDIATE/ADVANCED/EXPERT

  // Assessment results
  currentLevel Int      // 1-5 proficiency scale
  targetLevel  Int      // Desired proficiency level
  gap         Int       // Calculated gap

  // Assessment method
  method      String    // SELF_ASSESSMENT/MANAGER_ASSESSMENT/TEST/PROJECT_REVIEW/360_FEEDBACK
  assessedBy  String?   @db.Uuid
  assessor    User?     @relation("SkillAssessor", fields: [assessedBy], references: [id])
  assessmentDate DateTime @default(now())

  // Evidence and validation
  evidence    Json?     // Projects, certifications, work samples
  validationNotes String?
  nextAssessmentDate DateTime?

  // Development plan
  recommendedActions Json? // Specific development actions
  suggestedCourses Json?   // Recommended training courses
  timeline    String?    // Development timeline

  // Progress tracking
  lastUpdated DateTime  @default(now())
  progress    Float     @default(0) // Progress toward target level

  // Metadata
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([userId, skillName, assessmentDate])
  @@index([userId, category])
  @@index([skillName, level])
}

model TrainingPlan {
  id          String    @id @default(uuid()) @db.Uuid
  userId      String    @db.Uuid
  user        User      @relation("TrainingPlanUser", fields: [userId], references: [id], onDelete: Cascade)

  // Plan details
  title       String
  description String?
  period      String    // Q1-2026, ANNUAL-2025, etc.
  startDate   DateTime
  endDate     DateTime

  // Goals and objectives
  goals       Json      // Learning goals and objectives
  targetSkills Json?    // Target skills to develop
  careerGoals Json?     // Career development goals

  // Course and activity plan
  courses     Json      // Planned courses with timeline
  activities  Json?     // Other learning activities (projects, mentoring, etc.)
  milestones  Json?     // Learning milestones

  // Budget and resources
  budget      Decimal?  @db.Decimal(10, 2)
  currency    String    @default(ETB)
  resources   Json?     // Required resources (time, tools, support)

  // Progress tracking
  status      String    @default(DRAFT) // DRAFT/APPROVED/ACTIVE/COMPLETED/PAUSED
  approvedBy  String?   @db.Uuid
  approvedAt  DateTime?
  progress    Float     @default(0) // Overall progress 0-100

  // Outcomes
  completedCourses Json? // Completed courses tracking
  skillsAcquired Json?   // Skills developed
  certifications Json?  // Certifications earned

  // Evaluation
  effectivenessScore Float? // Plan effectiveness rating
  roi         Float?    // Return on investment calculation

  // Metadata
  createdBy   String    @db.Uuid
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, status])
  @@index([period, status])
}

model Certificate {
  id          String    @id @default(uuid()) @db.Uuid
  enrollmentId String    @unique @db.Uuid
  enrollment   TrainingEnrollment @relation("EnrollmentCertificate", fields: [enrollmentId], references: [id], onDelete: Cascade)
  userId      String    @db.Uuid
  user        User      @relation("CertificateUser", fields: [userId], references: [id])

  // Certificate details
  certificateNumber String @unique
  title       String
  description String?

  // Issuing information
  issuedBy    String    @db.Uuid
  issuer      User      @relation("CertificateIssuer", fields: [issuedBy], references: [id])
  issuedAt    DateTime  @default(now())

  // Validity
  validFrom   DateTime  @default(now())
  validUntil  DateTime?
  isPermanent Boolean   @default(false)

  // Verification
  verificationCode String @unique
  qrCode      String?   // Base64 encoded QR code
  digitalSignature String?

  // Content and design
  template    String    // Certificate template used
  content     Json?     // Certificate content and layout
  logoUrl     String?
  signatures  Json?     // Digital signatures

  // Status
  status      String    @default(ACTIVE) // ACTIVE/REVOKED/EXPIRED/SUSPENDED
  revokedAt   DateTime?
  revocationReason String?

  // Sharing and visibility
  isPublic    Boolean   @default(false)
  shareUrl    String?

  // Metadata
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([userId, status])
  @@index([verificationCode])
}

model LearningPath {
  id          String    @id @default(uuid()) @db.Uuid
  title       String
  description String?

  // Path configuration
  category    String    // TECHNICAL/SOFT_SKILL/LEADERSHIP/CAREER
  level       String    // BEGINNER/INTERMEDIATE/ADVANCED
  targetRole  String?   // Target job role
  duration    Int       // Estimated duration in hours

  // Path structure
  courses     Json      // Ordered list of courses with prerequisites
  milestones  Json?     // Learning milestones
  assessments Json?     // Path assessments

  // Enrollment and tracking
  isActive    Boolean   @default(true)
  maxEnrollment Int?
  currentEnrollment Int @default(0)

  // Outcomes
  skillsAcquired Json?  // Skills gained from this path
  careerPath  Json?     // Career progression supported

  // Status
  status      String    @default(DRAFT) // DRAFT/ACTIVE/ARCHIVED
  createdBy   String    @db.Uuid
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  courseMappings CourseLearningPath[]
  enrollments   LearningPathEnrollment[]
}

model CourseLearningPath {
  id          String   @id @default(uuid()) @db.Uuid
  courseId    String   @db.Uuid
  course      TrainingCourse @relation(fields: [courseId], references: [id], onDelete: Cascade)
  pathId      String   @db.Uuid
  path        LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)

  // Sequence and prerequisites
  sequence    Int
  isMandatory Boolean  @default(true)
  prerequisites Json?   // Prerequisites within the path

  createdAt   DateTime @default(now())

  @@unique([courseId, pathId])
  @@index([pathId, sequence])
}

model LearningPathEnrollment {
  id          String    @id @default(uuid()) @db.Uuid
  pathId      String    @db.Uuid
  path        LearningPath @relation(fields: [pathId], references: [id], onDelete: Cascade)
  userId      String    @db.Uuid
  user        User      @relation("LearningPathEnrollment", fields: [userId], references: [id], onDelete: Cascade)

  // Enrollment details
  enrolledAt  DateTime  @default(now())
  startedAt   DateTime?
  completedAt DateTime?

  // Progress tracking
  progress    Float     @default(0) // 0-100 percentage
  currentStep Int       @default(0)
  completedSteps Json?   // Completed course IDs

  // Status
  status      String    @default(ENROLLED) // ENROLLED/IN_PROGRESS/COMPLETED/DROPPED/PAUSED

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([pathId, userId])
}
```

---

## Core Implementation Components

### 1. Course Catalog Management

**Features:**

- Comprehensive course catalog
- Multi-format course support
- Prerequisite management
- Budget tracking

**Key Endpoints:**

```typescript
GET  /hr/training/courses              // List courses with filters
POST /hr/training/courses              // Create new course
GET  /hr/training/courses/:id          // Get course details
PUT  /hr/training/courses/:id          // Update course
POST /hr/training/courses/:id/enroll   // Enroll in course
GET  /hr/training/catalog              // Course catalog for employees
```

**Course Creation Logic:**

```typescript
async createCourse(dto: CreateCourseDto): Promise<TrainingCourse> {
  // 1. Validate course structure
  await this.validateCourseStructure(dto);

  // 2. Check for duplicates
  const existing = await this.findSimilarCourse(dto);
  if (existing && !dto.allowDuplicate) {
    throw new BadRequestException('Similar course already exists');
  }

  // 3. Calculate estimated duration
  const estimatedDuration = this.calculateDuration(dto.content);

  // 4. Determine skill mappings
  const skillMappings = await this.mapCourseToSkills(dto.objectives, dto.category);

  // 5. Create course
  const course = await this.create({
    ...dto,
    duration: estimatedDuration,
    status: 'DRAFT',
    skillMappings
  });

  // 6. Create learning path suggestions
  await this.suggestLearningPaths(course);

  // 7. Set up approval workflow if needed
  if (dto.cost > 1000) { // High-cost courses need approval
    await this.initiateApprovalWorkflow(course);
  }

  return course;
}

async mapCourseToSkills(objectives: string[], category: string): Promise<CourseSkillMapping[]> {
  const mappings = [];

  // Extract skills from objectives using NLP
  const extractedSkills = await this.extractSkillsFromText(objectives.join(' '));

  // Map to organizational skill framework
  for (const skill of extractedSkills) {
    const orgSkill = await this.findOrganizationalSkill(skill.name, category);
    if (orgSkill) {
      mappings.push({
        skillId: orgSkill.id,
        skillLevel: skill.level || this.determineSkillLevel(objectives),
        weight: skill.importance || 1.0
      });
    }
  }

  return mappings;
}
```

### 2. Enrollment Management

**Features:**

- Automated enrollment based on needs
- Prerequisite validation
- Capacity management
- Progress tracking

**Enrollment Processing Logic:**

```typescript
async processEnrollment(userId: string, courseId: string, options?: EnrollmentOptions): Promise<TrainingEnrollment> {
  const course = await this.findCourseById(courseId);
  const user = await this.userService.findById(userId);

  // 1. Validate prerequisites
  await this.validatePrerequisites(user, course);

  // 2. Check capacity
  await this.validateCapacity(course);

  // 3. Validate budget/authorization
  await this.validateEnrollmentAuthorization(user, course, options);

  // 4. Check for conflicts
  await this.validateScheduleConflicts(user, course);

  // 5. Create enrollment
  const enrollment = await this.create({
    userId,
    courseId,
    enrollmentType: options?.type || 'VOLUNTARY',
    requestedBy: options?.requestedBy,
    priority: options?.priority || 'MEDIUM',
    status: 'ENROLLED'
  });

  // 6. Update course capacity
  await this.updateCourseEnrollmentCount(courseId);

  // 7. Schedule initial activities
  await this.scheduleCourseActivities(enrollment);

  // 8. Send notifications
  await this.sendEnrollmentNotifications(enrollment);

  // 9. Update learning path progress if applicable
  await this.updateLearningPathProgress(userId, courseId);

  return enrollment;
}

async validatePrerequisites(user: User, course: TrainingCourse): Promise<void> {
  if (!course.prerequisites) return;

  const prerequisites = course.prerequisites;

  // Check completed courses
  if (prerequisites.courses?.length > 0) {
    const completedCourses = await this.getCompletedCourses(user.id);
    const missingCourses = prerequisites.courses.filter(
      courseId => !completedCourses.includes(courseId)
    );

    if (missingCourses.length > 0) {
      throw new BadRequestException(
        `Missing prerequisite courses: ${missingCourses.join(', ')}`
      );
    }
  }

  // Check skill level
  if (prerequisites.skills?.length > 0) {
    const userSkills = await this.getUserSkills(user.id);

    for (const prereq of prerequisites.skills) {
      const userSkill = userSkills.find(skill => skill.name === prereq.name);
      if (!userSkill || userSkill.level < prereq.level) {
        throw new BadRequestException(
          `Insufficient skill level for ${prereq.name}. Required: ${prereq.level}, Current: ${userSkill?.level || 0}`
        );
      }
    }
  }
}
```

### 3. Skill Assessment System

**Features:**

- Multi-method skill evaluation
- Gap analysis
- Progress tracking
- Development recommendations

**Skill Assessment Engine:**

```typescript
async assessSkills(userId: string, method: string, context?: SkillAssessmentContext): Promise<SkillAssessmentResult[]> {
  const user = await this.userService.findById(userId);

  switch (method) {
    case 'SELF_ASSESSMENT':
      return await this.conductSelfAssessment(userId, context);
    case 'MANAGER_ASSESSMENT':
      return await this.conductManagerAssessment(userId, context);
    case 'TEST':
      return await this.conductSkillTest(userId, context);
    case 'PROJECT_REVIEW':
      return await this.conductProjectReview(userId, context);
    case '360_FEEDBACK':
      return await this.conduct360Feedback(userId, context);
    default:
      throw new BadRequestException('Invalid assessment method');
  }
}

async conductSelfAssessment(userId: string, context?: SkillAssessmentContext): Promise<SkillAssessmentResult[]> {
  const user = await this.userService.findById(userId);
  const targetSkills = context?.targetSkills || await this.getRoleSkills(user.jobTitle);

  const assessments = [];

  for (const skill of targetSkills) {
    // Get existing assessment
    const existing = await this.getLatestAssessment(userId, skill.name);

    // Create new assessment
    const assessment = await this.create({
      userId,
      skillName: skill.name,
      category: skill.category,
      level: skill.level,
      method: 'SELF_ASSESSMENT',
      assessedBy: userId,
      assessmentDate: new Date(),
      currentLevel: context?.selfRating || existing?.currentLevel || 1,
      targetLevel: skill.targetLevel || 5,
      gap: 0 // Will be calculated
    });

    // Calculate gap
    assessment.gap = assessment.targetLevel - assessment.currentLevel;

    // Generate recommendations if gap exists
    if (assessment.gap > 0) {
      assessment.recommendedActions = await this.generateDevelopmentRecommendations(assessment);
      assessment.suggestedCourses = await this.findRelevantCourses(assessment);
    }

    await assessment.save();
    assessments.push(assessment);
  }

  return assessments;
}

async generateDevelopmentRecommendations(assessment: SkillAssessment): Promise<DevelopmentAction[]> {
  const actions = [];
  const gap = assessment.gap;

  // Based on gap size, recommend different intensity of actions
  if (gap >= 3) {
    // Large gap - comprehensive approach
    actions.push(
      {
        type: 'COURSE',
        description: `Complete foundational ${assessment.skillName} course`,
        priority: 'HIGH',
        estimatedDuration: '40 hours',
        timeline: '3 months'
      },
      {
        type: 'PROJECT',
        description: `Work on ${assessment.skillName} project with mentor`,
        priority: 'HIGH',
        estimatedDuration: '60 hours',
        timeline: '4 months'
      },
      {
        type: 'CERTIFICATION',
        description: `Obtain ${assessment.skillName} certification`,
        priority: 'MEDIUM',
        estimatedDuration: '80 hours',
        timeline: '6 months'
      }
    );
  } else if (gap >= 2) {
    // Medium gap - focused approach
    actions.push(
      {
        type: 'COURSE',
        description: `Complete intermediate ${assessment.skillName} course`,
        priority: 'HIGH',
        estimatedDuration: '24 hours',
        timeline: '2 months'
      },
      {
        type: 'PROJECT',
        description: `Apply ${assessment.skillName} in current role`,
        priority: 'MEDIUM',
        estimatedDuration: '40 hours',
        timeline: '3 months'
      }
    );
  } else {
    // Small gap - self-directed approach
    actions.push(
      {
        type: 'SELF_STUDY',
        description: `Self-study ${assessment.skillName} advanced topics`,
        priority: 'MEDIUM',
        estimatedDuration: '16 hours',
        timeline: '1 month'
      },
      {
        type: 'WORKSHOP',
        description: `Attend ${assessment.skillName} workshop`,
        priority: 'LOW',
        estimatedDuration: '8 hours',
        timeline: '2 months'
      }
    );
  }

  return actions;
}
```

### 4. Learning Analytics

**Features:**

- Training effectiveness analysis
- ROI calculation
- Skill gap analytics
- Learning path optimization

**Analytics Engine:**

```typescript
async analyzeTrainingEffectiveness(period: string): Promise<TrainingAnalytics> {
  const enrollments = await this.getEnrollmentsByPeriod(period);

  const analytics = {
    overview: {
      totalEnrollments: enrollments.length,
      uniqueParticipants: this.countUniqueParticipants(enrollments),
      completionRate: this.calculateCompletionRate(enrollments),
      averageScore: this.calculateAverageScore(enrollments),
      totalHours: this.calculateTotalHours(enrollments),
      totalCost: this.calculateTotalCost(enrollments)
    },

    effectiveness: await this.analyzeEffectiveness(enrollments),

    skillDevelopment: await this.analyzeSkillDevelopment(enrollments),

    departmentAnalysis: await this.analyzeByDepartment(enrollments),

    coursePerformance: await this.analyzeCoursePerformance(enrollments),

    roi: await this.calculateROI(enrollments),

    trends: await this.analyzeTrends(enrollments, period),

    recommendations: await this.generateAnalyticsRecommendations(enrollments)
  };

  return analytics;
}

async calculateROI(enrollments: TrainingEnrollment[]): Promise<ROIAnalysis> {
  let totalCost = 0;
  let totalBenefit = 0;
  const roiByCourse = [];

  for (const enrollment of enrollments) {
    const course = enrollment.course;
    const cost = course.cost || 0;
    totalCost += cost;

    // Calculate benefit based on performance improvement
    const benefit = await this.calculateCourseBenefit(enrollment);
    totalBenefit += benefit;

    roiByCourse.push({
      courseId: course.id,
      courseTitle: course.title,
      cost,
      benefit,
      roi: benefit > 0 ? ((benefit - cost) / cost) * 100 : 0,
      paybackPeriod: await this.calculatePaybackPeriod(enrollment)
    });
  }

  const overallROI = totalCost > 0 ? ((totalBenefit - totalCost) / totalCost) * 100 : 0;

  return {
    totalCost,
    totalBenefit,
    overallROI,
    paybackPeriod: await this.calculateAveragePaybackPeriod(enrollments),
    roiByCourse: roiByCourse.sort((a, b) => b.roi - a.roi),
    factors: {
      costSavings: await this.calculateCostSavings(enrollments),
      productivityGain: await this.calculateProductivityGain(enrollments),
      qualityImprovement: await this.calculateQualityImprovement(enrollments),
      employeeRetention: await this.calculateRetentionImpact(enrollments)
    }
  };
}
```

### 5. Certificate Management

**Features:**

- Automated certificate generation
- Digital verification
- QR code integration
- Certificate sharing

**Certificate Generation Logic:**

```typescript
async generateCertificate(enrollmentId: string): Promise<Certificate> {
  const enrollment = await this.findEnrollmentById(enrollmentId);

  // Validate eligibility
  if (!this.isEligibleForCertificate(enrollment)) {
    throw new BadRequestException('Not eligible for certificate');
  }

  // Generate certificate number
  const certificateNumber = await this.generateCertificateNumber();

  // Create certificate record
  const certificate = await this.create({
    enrollmentId,
    userId: enrollment.userId,
    certificateNumber,
    title: `Certificate of Completion - ${enrollment.course.title}`,
    description: `Successfully completed ${enrollment.course.title}`,
    issuedBy: this.getCurrentUserId(),
    validFrom: new Date(),
    validUntil: this.calculateValidity(enrollment.course),
    verificationCode: this.generateVerificationCode(),
    template: this.selectCertificateTemplate(enrollment.course),
    content: await this.generateCertificateContent(enrollment),
    status: 'ACTIVE'
  });

  // Generate QR code
  certificate.qrCode = await this.generateQRCode(certificate.verificationCode);

  // Generate digital signature
  certificate.digitalSignature = await this.generateDigitalSignature(certificate);

  await certificate.save();

  // Update enrollment
  await this.updateEnrollment(enrollmentId, { certificateId: certificate.id });

  // Send certificate to user
  await this.sendCertificate(certificate);

  return certificate;
}

async generateCertificateContent(enrollment: TrainingEnrollment): Promise<CertificateContent> {
  const user = enrollment.user;
  const course = enrollment.course;

  return {
    recipientName: `${user.firstName} ${user.lastName}`,
    courseTitle: course.title,
    completionDate: enrollment.completedAt,
    duration: course.duration,
    level: course.level,
    score: enrollment.finalScore,
    grade: enrollment.grade,
    instructorName: course.instructor?.name,
    instructorTitle: course.instructor?.jobTitle,
    organizationName: await this.getOrganizationName(),
    logoUrl: await this.getOrganizationLogo(),
    signatures: await this.getSignatures(course),
    achievements: await this.getCourseAchievements(enrollment),
    skills: await this.getCourseSkills(enrollment)
  };
}
```

---

## Implementation Phases

### Week 1: Foundation & Course Management

- Database schema creation
- Course catalog CRUD
- Enrollment validation
- Basic progress tracking

### Week 2: Assessment & Analytics

- Skill assessment system
- Learning analytics engine
- ROI calculation
- Effectiveness measurement

### Week 3: Certificates & Learning Paths

- Certificate generation
- Learning path creation
- Advanced analytics
- Integration with performance system

### Week 4: Testing & Integration

- End-to-end workflow testing
- Integration with other HR modules
- Performance optimization
- User acceptance testing

---

## Integration Points

### Internal Systems

- **Employee Management:** Profile and role data
- **Performance:** Skill development tracking
- **Career Development:** Learning path integration
- **Finance:** Budget and cost tracking

### External Systems

- **LMS Platforms:** Course content integration
- **Video Platforms:** Video content hosting
- **Assessment Tools:** External testing integration
- **Certificate Authorities:** External verification

---

## Security & Permissions

### Required Permissions

```typescript
const TRAINING_PERMISSIONS = {
  'hr:training:course:view': ['EMPLOYEE', 'MANAGER', 'HR_MANAGER'],
  'hr:training:course:create': ['HR_MANAGER', 'TRAINING_MANAGER'],
  'hr:training:enrollment:self': ['EMPLOYEE'],
  'hr:training:enrollment:team': ['MANAGER'],
  'hr:training:enrollment:all': ['HR_MANAGER'],
  'hr:training:assessment:conduct': ['EMPLOYEE', 'MANAGER', 'HR_MANAGER'],
  'hr:training:certificate:issue': ['HR_MANAGER', 'TRAINING_MANAGER'],
  'hr:training:analytics:view': ['HR_MANAGER', 'TRAINING_MANAGER'],
  'hr:training:budget:manage': ['HR_MANAGER', 'FINANCE_MANAGER'],
};
```

### Security Measures

- Course content protection
- Assessment integrity
- Certificate verification
- Budget authorization controls

---

## Success Metrics

### Operational Metrics

- **Course Completion:** 85%+ completion rate
- **Skill Improvement:** 80%+ show skill improvement
- **Training ROI:** Positive ROI within 6 months
- **User Satisfaction:** 4.5/5 course rating

### Technical Metrics

- **API Response Time:** < 300ms
- **System Availability:** 99.9%
- **Content Loading:** < 5 seconds
- **Assessment Processing:** < 10 seconds

---

## Testing Strategy

### Unit Tests

- Course validation logic
- Enrollment processing
- Skill assessment algorithms
- Certificate generation

### Integration Tests

- LMS platform integration
- Payment processing
- External assessment tools
- Analytics calculations

### E2E Tests

- Complete learning journey
- Certificate issuance workflow
- Analytics reporting
- Budget authorization

This subsystem enables organizational capability building and must provide engaging learning experiences while effectively tracking skill development and demonstrating training ROI.
