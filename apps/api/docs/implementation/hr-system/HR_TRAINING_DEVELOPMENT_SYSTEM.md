# HR Training & Skill Development System Documentation

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

The HR Training & Skill Development System manages employee learning and development programs with comprehensive course catalog, enrollment management, skill assessment, and certification tracking. This system ensures continuous skill development while aligning training initiatives with business objectives and career progression paths.

### Key Features

- **Course Management:** Comprehensive catalog with prerequisites, scheduling, and resource allocation
- **Enrollment System:** Automated enrollment with approval workflows and waitlist management
- **Skill Assessment:** Gap analysis, competency mapping, and development recommendations
- **Learning Paths:** Personalized learning journeys with milestone tracking
- **Certificate Management:** Automated generation, verification, and expiration tracking

### Business Objectives

- Achieve 90%+ training program completion rates
- Maintain 85%+ skill gap coverage through targeted training
- Ensure 100% certification compliance for regulated roles
- Reduce skill gaps by 75% within 12 months

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Employee Portal]
        B[Manager Dashboard]
        C[Trainer Console]
        D[Admin Panel]
    end

    subgraph "API Layer"
        E[Course API]
        F[Enrollment API]
        G[Assessment API]
        H[Certificate API]
    end

    subgraph "Service Layer"
        I[Course Service]
        J[Enrollment Service]
        K[Assessment Service]
        L[Certificate Service]
        M[Learning Path Service]
    end

    subgraph "Processing Layer"
        N[Skill Analyzer]
        O[Recommendation Engine]
        P[Content Processor]
        Q[Certificate Generator]
    end

    subgraph "Data Layer"
        R[PostgreSQL Database]
        S[Redis Cache]
        T[File Storage]
    end

    subgraph "External Services"
        U[Keycloak Auth]
        V[LMS Platforms]
        W[Payment Gateway]
        X[Email Service]
    end

    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> N
    J --> O
    K --> P
    L --> Q
    N --> R
    O --> R
    P --> R
    Q --> R
    I --> U
    J --> V
    K --> W
    L --> X
```

### Component Responsibilities

| Component             | Responsibility                          | Key Technologies                      |
| --------------------- | --------------------------------------- | ------------------------------------- |
| Course Service        | Course catalog and content management   | Content Delivery, Version Control     |
| Enrollment Service    | Registration and approval workflows     | Queue Management, Notifications       |
| Assessment Service    | Skill evaluation and gap analysis       | Psychometric Testing, Analytics       |
| Certificate Service   | Certificate generation and verification | Digital Signatures, Blockchain        |
| Learning Path Service | Personalized learning journeys          | ML Recommendations, Progress Tracking |

---

## Database Schema

### Core Tables

#### TrainingCourse

```sql
CREATE TABLE training_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Course details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(50),
    difficulty_level VARCHAR(50) NOT NULL,

    -- Duration and scheduling
    duration_hours INTEGER NOT NULL,
    duration_type VARCHAR(50) NOT NULL,
    is_self_paced BOOLEAN DEFAULT false,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 1,

    -- Delivery method
    delivery_method VARCHAR(50) NOT NULL,
    location VARCHAR(255),
    virtual_platform VARCHAR(100),
    timezone VARCHAR(50),

    -- Pricing and budget
    cost DECIMAL(10,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'ETB',
    budget_code VARCHAR(50),
    requires_approval BOOLEAN DEFAULT false,

    -- Prerequisites and requirements
    prerequisites JSONB,
    target_audience JSONB,
    learning_objectives TEXT[],
    skills_gained TEXT[],

    -- Content and resources
    content_url VARCHAR(500),
    materials JSONB,
    instructor_id UUID REFERENCES users(id),

    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'DRAFT',
    is_active BOOLEAN DEFAULT true,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    enrollment_deadline TIMESTAMP,

    -- Analytics and metrics
    enrollment_count INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0,
    average_rating FLOAT,
    rating_count INTEGER DEFAULT 0,

    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_courses_category ON training_courses(category, is_active);
CREATE INDEX idx_courses_status ON training_courses(status, start_date);
CREATE INDEX idx_courses_instructor ON training_courses(instructor_id, status);
CREATE INDEX idx_courses_dates ON training_courses(start_date, end_date);
```

#### TrainingEnrollment

```sql
CREATE TABLE training_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES training_courses(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Enrollment details
    enrollment_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'ENROLLED',
    enrollment_type VARCHAR(50) NOT NULL,

    -- Progress tracking
    progress_percentage FLOAT DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    total_modules INTEGER DEFAULT 0,
    current_module VARCHAR(255),
    last_accessed TIMESTAMP,

    -- Completion details
    completion_date TIMESTAMP,
    completion_percentage FLOAT DEFAULT 0,
    final_score FLOAT,
    grade VARCHAR(10),
    passed BOOLEAN DEFAULT false,

    -- Attendance and participation
    attendance_hours FLOAT DEFAULT 0,
    participation_score FLOAT DEFAULT 0,
    engagement_metrics JSONB,

    -- Approval workflow
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    approval_notes TEXT,
    waitlist_position INTEGER,

    -- Payment and budget
    payment_status VARCHAR(50),
    payment_amount DECIMAL(10,2),
    budget_approved BOOLEAN DEFAULT false,

    -- Feedback and evaluation
    feedback_rating INTEGER,
    feedback_comments TEXT,
    feedback_date TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(course_id, user_id)
);

CREATE INDEX idx_enrollments_user ON training_enrollments(user_id, status);
CREATE INDEX idx_enrollments_course ON training_enrollments(course_id, status);
CREATE INDEX idx_enrollments_status ON training_enrollments(status, enrollment_date);
CREATE INDEX idx_enrollments_completion ON training_enrollments(completion_date, passed);
```

#### SkillAssessment

```sql
CREATE TABLE skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Assessment details
    assessment_type VARCHAR(50) NOT NULL,
    skill_category VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    assessment_date DATE NOT NULL,

    -- Scoring
    current_level INTEGER NOT NULL,
    target_level INTEGER NOT NULL,
    proficiency_level VARCHAR(50),
    confidence_level VARCHAR(50),

    -- Assessment data
    assessment_method VARCHAR(50),
    assessor_id UUID REFERENCES users(id),
    assessment_results JSONB,
    raw_score FLOAT,
    max_score FLOAT,

    -- Gap analysis
    skill_gap INTEGER,
    priority_level VARCHAR(50),
    development_timeline VARCHAR(50),

    -- Recommendations
    recommended_courses JSONB,
    learning_resources JSONB,
    mentorship_suggestions JSONB,

    -- Progress tracking
    previous_assessment_id UUID REFERENCES skill_assessments(id),
    improvement_score FLOAT,

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_assessments_user ON skill_assessments(user_id, assessment_date);
CREATE INDEX idx_assessments_skill ON skill_assessments(skill_category, skill_name);
CREATE INDEX idx_assessments_gap ON skill_assessments(skill_gap, priority_level);
CREATE INDEX idx_assessments_type ON skill_assessments(assessment_type, assessment_date);
```

#### LearningPath

```sql
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Path details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    path_type VARCHAR(50) NOT NULL,
    target_role VARCHAR(255),
    difficulty_level VARCHAR(50),

    -- Duration and structure
    estimated_duration INTEGER,
    duration_unit VARCHAR(50),
    total_courses INTEGER DEFAULT 0,
    mandatory_courses INTEGER DEFAULT 0,
    elective_courses INTEGER DEFAULT 0,

    -- Prerequisites and requirements
    prerequisites JSONB,
    target_audience JSONB,
    learning_objectives TEXT[],
    career_outcomes TEXT[],

    -- Progress tracking
    enrollment_count INTEGER DEFAULT 0,
    completion_count INTEGER DEFAULT 0,
    average_completion_time INTEGER,
    success_rate FLOAT DEFAULT 0,

    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'DRAFT',
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_learning_paths_type ON learning_paths(path_type, is_active);
CREATE INDEX idx_learning_paths_role ON learning_paths(target_role, status);
CREATE INDEX idx_learning_paths_status ON learning_paths(status, created_at);
```

#### LearningPathEnrollment

```sql
CREATE TABLE learning_path_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Enrollment details
    enrollment_date TIMESTAMP DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    start_date DATE,
    target_completion_date DATE,

    -- Progress tracking
    courses_completed INTEGER DEFAULT 0,
    total_courses INTEGER DEFAULT 0,
    progress_percentage FLOAT DEFAULT 0,
    current_course_id UUID REFERENCES training_courses(id),

    -- Milestone tracking
    milestones_completed JSONB DEFAULT '[]',
    next_milestone JSONB,
    milestone_progress FLOAT DEFAULT 0,

    -- Completion details
    completion_date TIMESTAMP,
    final_score FLOAT,
    certificate_earned BOOLEAN DEFAULT false,

    -- Advisor and support
    mentor_id UUID REFERENCES users(id),
    advisor_id UUID REFERENCES users(id),
    support_notes TEXT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(learning_path_id, user_id)
);

CREATE INDEX idx_path_enrollments_user ON learning_path_enrollments(user_id, status);
CREATE INDEX idx_path_enrollments_path ON learning_path_enrollments(learning_path_id, status);
CREATE INDEX idx_path_enrollments_progress ON learning_path_enrollments(progress_percentage, status);
```

#### Certificate

```sql
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Certificate details
    certificate_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    issuing_organization VARCHAR(255),

    -- Achievement details
    course_id UUID REFERENCES training_courses(id),
    learning_path_id UUID REFERENCES learning_paths(id),
    skill_assessment_id UUID REFERENCES skill_assessments(id),
    achievement_date DATE NOT NULL,

    -- Certificate content
    certificate_content JSONB,
    digital_signature VARCHAR(500),
    blockchain_hash VARCHAR(255),

    -- Validity and expiration
    issue_date DATE NOT NULL,
    expiration_date DATE,
    is_valid BOOLEAN DEFAULT true,
    verification_code VARCHAR(100) UNIQUE,

    -- Skills and competencies
    skills_validated TEXT[],
    competency_level VARCHAR(50),
    credits_earned INTEGER DEFAULT 0,

    -- Status and lifecycle
    status VARCHAR(50) DEFAULT 'ISSUED',
    revoked_date TIMESTAMP,
    revocation_reason TEXT,

    -- Sharing and visibility
    is_public BOOLEAN DEFAULT false,
    sharing_url VARCHAR(500),
    download_count INTEGER DEFAULT 0,

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_certificates_user ON certificates(user_id, issue_date);
CREATE INDEX idx_certificates_type ON certificates(certificate_type, issue_date);
CREATE INDEX idx_certificates_verification ON certificates(verification_code);
CREATE INDEX idx_certificates_expiration ON certificates(expiration_date, is_valid);
```

### Entity Relationships

```mermaid
erDiagram
    TrainingCourse ||--o{ TrainingEnrollment : "has enrollments"
    TrainingCourse }o--|| User : "instructed by"
    SkillAssessment }o--|| User : "assessed"
    SkillAssessment }o--|| User : "assessed by"
    LearningPath ||--o{ LearningPathEnrollment : "has enrollments"
    LearningPath }o--|| User : "created by"
    LearningPathEnrollment }o--|| User : "enrolled by"
    LearningPathEnrollment }o--|| TrainingCourse : "current course"
    Certificate }o--|| User : "issued to"
    Certificate }o--|| TrainingCourse : "from course"
    Certificate }o--|| LearningPath : "from path"
    Certificate }o--|| SkillAssessment : "from assessment"
```

---

## API Endpoints

### Course Management Endpoints

#### POST /api/hr/training/courses

Create new training course.

**Request Body:**

```json
{
  "title": "Advanced JavaScript Development",
  "description": "Master advanced JavaScript concepts and patterns",
  "category": "TECHNICAL",
  "subcategory": "PROGRAMMING",
  "difficultyLevel": "ADVANCED",
  "durationHours": 40,
  "durationType": "HOURS",
  "deliveryMethod": "ONLINE",
  "cost": 5000,
  "currency": "ETB",
  "prerequisites": [
    {
      "type": "COURSE",
      "courseId": "basic-js-course",
      "title": "Basic JavaScript"
    },
    {
      "type": "SKILL",
      "skill": "JavaScript",
      "level": "INTERMEDIATE"
    }
  ],
  "learningObjectives": [
    "Understand advanced JavaScript patterns",
    "Master asynchronous programming",
    "Implement modern ES6+ features"
  ],
  "skillsGained": ["Advanced JavaScript", "Async Programming", "Modern ES6+"],
  "maxParticipants": 30,
  "startDate": "2026-03-15T09:00:00Z",
  "endDate": "2026-03-19T17:00:00Z",
  "enrollmentDeadline": "2026-03-10T23:59:59Z"
}
```

**Response:**

```json
{
  "id": "uuid",
  "title": "Advanced JavaScript Development",
  "category": "TECHNICAL",
  "difficultyLevel": "ADVANCED",
  "status": "DRAFT",
  "durationHours": 40,
  "cost": 5000,
  "currency": "ETB",
  "enrollmentCount": 0,
  "createdAt": "2026-02-28T10:00:00Z"
}
```

#### GET /api/hr/training/courses

List courses with filtering and search.

#### PUT /api/hr/training/courses/:id

Update course details.

#### POST /api/hr/training/courses/:id/publish

Publish course for enrollment.

#### GET /api/hr/training/courses/:id/analytics

Get course analytics and insights.

### Enrollment Endpoints

#### POST /api/hr/training/enrollments

Enroll in training course.

**Request Body:**

```json
{
  "courseId": "uuid",
  "enrollmentType": "COMPANY_SPONSORED",
  "notes": "Required for current project role"
}
```

#### GET /api/hr/training/enrollments

List user enrollments.

#### PUT /api/hr/training/enrollments/:id/progress

Update enrollment progress.

#### POST /api/hr/training/enrollments/:id/complete

Mark course as completed.

#### GET /api/hr/training/enrollments/waitlist

Get waitlist status.

### Assessment Endpoints

#### POST /api/hr/training/assessments

Create skill assessment.

**Request Body:**

```json
{
  "assessmentType": "TECHNICAL_SKILLS",
  "skillCategory": "PROGRAMMING",
  "skillName": "JavaScript",
  "assessmentMethod": "ONLINE_TEST",
  "assessmentResults": {
    "syntax": 85,
    "algorithms": 75,
    "debugging": 80,
    "bestPractices": 90
  },
  "rawScore": 82.5,
  "maxScore": 100,
  "notes": "Strong foundation in JavaScript fundamentals"
}
```

#### GET /api/hr/training/assessments/gap-analysis

Get skill gap analysis.

#### GET /api/hr/training/assessments/recommendations

Get training recommendations.

#### POST /api/hr/training/assessments/:id/evaluate

Submit assessment evaluation.

### Learning Path Endpoints

#### POST /api/hr/training/learning-paths

Create new learning path.

#### GET /api/hr/training/learning-paths

List available learning paths.

#### POST /api/hr/training/learning-paths/:id/enroll

Enroll in learning path.

#### GET /api/hr/training/learning-paths/:id/progress

Get learning path progress.

### Certificate Endpoints

#### GET /api/hr/training/certificates

List user certificates.

#### GET /api/hr/training/certificates/:id/verify

Verify certificate authenticity.

#### POST /api/hr/training/certificates/:id/share

Generate certificate sharing link.

#### GET /api/hr/training/certificates/:id/download

Download certificate PDF.

---

## Business Logic & Workflows

### Course Prerequisite Validation

```typescript
interface PrerequisiteValidation {
  isValid: boolean;
  missingPrerequisites: Prerequisite[];
  canEnroll: boolean;
  waiverRequired: boolean;
  alternativePaths: Course[];
}

@Injectable()
export class CoursePrerequisiteService {
  async validatePrerequisites(
    userId: string,
    courseId: string,
  ): Promise<PrerequisiteValidation> {
    const course = await this.courseRepository.findById(courseId);
    const user = await this.userService.findById(userId);

    if (!course.prerequisites || course.prerequisites.length === 0) {
      return {
        isValid: true,
        missingPrerequisites: [],
        canEnroll: true,
        waiverRequired: false,
        alternativePaths: [],
      };
    }

    const missingPrerequisites = [];
    const alternativePaths = [];

    for (const prereq of course.prerequisites) {
      const isValid = await this.validateSinglePrerequisite(userId, prereq);

      if (!isValid.valid) {
        missingPrerequisites.push(prereq);

        // Find alternative courses that satisfy this prerequisite
        const alternatives = await this.findAlternativeCourses(prereq);
        alternativePaths.push(...alternatives);
      }
    }

    const canEnroll = missingPrerequisites.length === 0;
    const waiverRequired =
      missingPrerequisites.length > 0 &&
      (await this.isWaiverEligible(userId, missingPrerequisites));

    return {
      isValid: canEnroll,
      missingPrerequisites,
      canEnroll: canEnroll || waiverRequired,
      waiverRequired,
      alternativePaths,
    };
  }

  private async validateSinglePrerequisite(
    userId: string,
    prerequisite: Prerequisite,
  ): Promise<PrerequisiteValidation> {
    switch (prerequisite.type) {
      case 'COURSE':
        return await this.validateCoursePrerequisite(userId, prerequisite);
      case 'SKILL':
        return await this.validateSkillPrerequisite(userId, prerequisite);
      case 'EXPERIENCE':
        return await this.validateExperiencePrerequisite(userId, prerequisite);
      case 'ROLE':
        return await this.validateRolePrerequisite(userId, prerequisite);
      default:
        return { valid: false, reason: 'Unknown prerequisite type' };
    }
  }

  private async validateCoursePrerequisite(
    userId: string,
    prerequisite: Prerequisite,
  ): Promise<PrerequisiteValidation> {
    // Check if user has completed the prerequisite course
    const enrollment = await this.enrollmentRepository.findOne({
      where: {
        userId,
        courseId: prerequisite.courseId,
        status: 'COMPLETED',
        passed: true,
      },
    });

    if (!enrollment) {
      return { valid: false, reason: 'Course not completed' };
    }

    // Check if completion is recent enough (within validity period)
    const validityPeriod = this.getCourseValidityPeriod(prerequisite.courseId);
    const timeSinceCompletion = this.differenceInDays(
      new Date(),
      enrollment.completionDate,
    );

    if (timeSinceCompletion > validityPeriod) {
      return {
        valid: false,
        reason: 'Course completion expired',
        requiresRetake: true,
      };
    }

    // Check minimum grade if specified
    if (
      prerequisite.minGrade &&
      enrollment.finalScore < prerequisite.minGrade
    ) {
      return {
        valid: false,
        reason: 'Minimum grade not met',
        currentGrade: enrollment.finalScore,
        requiredGrade: prerequisite.minGrade,
      };
    }

    return { valid: true };
  }

  private async validateSkillPrerequisite(
    userId: string,
    prerequisite: Prerequisite,
  ): Promise<PrerequisiteValidation> {
    // Get latest skill assessment for the required skill
    const assessment = await this.skillAssessmentRepository.findOne({
      where: {
        userId,
        skillName: prerequisite.skill,
        assessmentDate: {
          gte: this.subtractMonths(new Date(), 12), // Last 12 months
        },
      },
      order: { assessmentDate: 'DESC' },
    });

    if (!assessment) {
      return { valid: false, reason: 'No skill assessment found' };
    }

    // Check if skill level meets requirement
    if (assessment.currentLevel < prerequisite.level) {
      return {
        valid: false,
        reason: 'Skill level insufficient',
        currentLevel: assessment.currentLevel,
        requiredLevel: prerequisite.level,
        gap: prerequisite.level - assessment.currentLevel,
      };
    }

    return { valid: true };
  }
}
```

### Skill Gap Analysis Algorithm

```typescript
interface SkillGapAnalysis {
  userId: string;
  assessmentDate: Date;
  overallScore: number;
  skillGaps: SkillGap[];
  developmentPriorities: DevelopmentPriority[];
  recommendedActions: RecommendedAction[];
  timeline: DevelopmentTimeline;
}

interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  businessImpact: string;
  developmentOptions: DevelopmentOption[];
}

@Injectable()
export class SkillGapAnalysisService {
  async analyzeSkillGaps(
    userId: string,
    targetRole?: string,
  ): Promise<SkillGapAnalysis> {
    // Get current skill assessments
    const currentSkills = await this.getCurrentSkillAssessments(userId);

    // Get required skills for target role
    const requiredSkills = await this.getRequiredSkills(targetRole);

    // Calculate skill gaps
    const skillGaps = this.calculateSkillGaps(currentSkills, requiredSkills);

    // Prioritize development needs
    const developmentPriorities = this.prioritizeDevelopmentNeeds(skillGaps);

    // Generate recommended actions
    const recommendedActions = await this.generateRecommendedActions(
      userId,
      skillGaps,
      developmentPriorities,
    );

    // Create development timeline
    const timeline = this.createDevelopmentTimeline(
      skillGaps,
      developmentPriorities,
    );

    // Calculate overall score
    const overallScore = this.calculateOverallSkillScore(
      currentSkills,
      requiredSkills,
    );

    return {
      userId,
      assessmentDate: new Date(),
      overallScore,
      skillGaps,
      developmentPriorities,
      recommendedActions,
      timeline,
    };
  }

  private calculateSkillGaps(
    currentSkills: SkillAssessment[],
    requiredSkills: RequiredSkill[],
  ): SkillGap[] {
    const gaps = [];

    for (const required of requiredSkills) {
      const current = currentSkills.find((s) => s.skillName === required.name);
      const currentLevel = current?.currentLevel || 0;

      const gap = {
        skill: required.name,
        currentLevel,
        requiredLevel: required.level,
        gap: Math.max(0, required.level - currentLevel),
        priority: this.determineSkillPriority(required, currentLevel),
        businessImpact: required.businessImpact,
        developmentOptions: await this.getDevelopmentOptions(
          required,
          currentLevel,
        ),
      };

      if (gap.gap > 0) {
        gaps.push(gap);
      }
    }

    return gaps.sort((a, b) => {
      const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  private determineSkillPriority(
    required: RequiredSkill,
    currentLevel: number,
  ): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const gap = required.level - currentLevel;

    // Critical: Core skills with large gaps
    if (required.importance === 'CORE' && gap >= 3) {
      return 'CRITICAL';
    }

    // High: Important skills with moderate gaps
    if (required.importance === 'IMPORTANT' && gap >= 2) {
      return 'HIGH';
    }

    // Medium: Nice-to-have skills with any gap
    if (required.importance === 'NICE_TO_HAVE' && gap >= 1) {
      return 'MEDIUM';
    }

    // Low: Minor gaps or non-critical skills
    return 'LOW';
  }

  private async getDevelopmentOptions(
    required: RequiredSkill,
    currentLevel: number,
  ): Promise<DevelopmentOption[]> {
    const options = [];

    // Find courses that address this skill gap
    const courses = await this.courseRepository.find({
      where: {
        skillsGained: { contains: [required.name] },
        difficultyLevel: this.mapLevelToDifficulty(required.level),
        isActive: true,
      },
    });

    for (const course of courses) {
      const option = {
        type: 'COURSE',
        title: course.title,
        courseId: course.id,
        duration: course.durationHours,
        cost: course.cost,
        deliveryMethod: course.deliveryMethod,
        effectiveness: course.completionRate,
        prerequisites: course.prerequisites,
        startDate: course.startDate,
        enrollmentDeadline: course.enrollmentDeadline,
      };

      options.push(option);
    }

    // Add self-study options
    const selfStudyOptions = await this.getSelfStudyOptions(
      required,
      currentLevel,
    );
    options.push(...selfStudyOptions);

    // Add mentorship options
    const mentorshipOptions = await this.getMentorshipOptions(required);
    options.push(...mentorshipOptions);

    return options.sort((a, b) => {
      // Sort by effectiveness and cost
      const scoreA = a.effectiveness * 0.7 + (1 - a.cost / 10000) * 0.3;
      const scoreB = b.effectiveness * 0.7 + (1 - b.cost / 10000) * 0.3;
      return scoreB - scoreA;
    });
  }
}
```

### Learning Path Recommendation Engine

```typescript
interface LearningPathRecommendation {
  userId: string;
  targetRole: string;
  recommendedPaths: RecommendedPath[];
  personalizedPath: PersonalizedPath;
  confidence: number;
  reasoning: string;
}

interface RecommendedPath {
  pathId: string;
  title: string;
  matchScore: number;
  completionTime: number;
  cost: number;
  benefits: string[];
  alignmentScore: number;
}

@Injectable()
export class LearningPathRecommendationService {
  async recommendLearningPaths(
    userId: string,
    targetRole?: string,
  ): Promise<LearningPathRecommendation> {
    const user = await this.userService.findById(userId);
    const userSkills = await this.getUserSkills(userId);
    const careerGoals = await this.getUserCareerGoals(userId);

    // Get potential target roles if not specified
    const targetRoles = targetRole
      ? [targetRole]
      : await this.getPotentialTargetRoles(user, careerGoals);

    const recommendedPaths = [];

    for (const role of targetRoles) {
      const paths = await this.getPathsForRole(role);

      for (const path of paths) {
        const matchScore = await this.calculatePathMatchScore(
          user,
          userSkills,
          path,
          role,
        );

        if (matchScore > 0.6) {
          // Minimum threshold
          recommendedPaths.push({
            pathId: path.id,
            title: path.title,
            matchScore,
            completionTime: path.estimatedDuration,
            cost: await this.calculatePathCost(path),
            benefits: await this.getPathBenefits(path, role),
            alignmentScore: await this.calculateAlignmentScore(path, role),
          });
        }
      }
    }

    // Sort by match score and alignment
    recommendedPaths.sort((a, b) => {
      const scoreA = a.matchScore * 0.7 + a.alignmentScore * 0.3;
      const scoreB = b.matchScore * 0.7 + b.alignmentScore * 0.3;
      return scoreB - scoreA;
    });

    // Create personalized path if needed
    const personalizedPath = await this.createPersonalizedPath(
      user,
      userSkills,
      recommendedPaths,
    );

    // Calculate overall confidence
    const confidence = this.calculateRecommendationConfidence(
      recommendedPaths,
      userSkills,
    );

    return {
      userId,
      targetRole: targetRoles[0],
      recommendedPaths: recommendedPaths.slice(0, 5), // Top 5 recommendations
      personalizedPath,
      confidence,
      reasoning: this.generateReasoning(
        user,
        recommendedPaths,
        personalizedPath,
      ),
    };
  }

  private async calculatePathMatchScore(
    user: User,
    userSkills: SkillAssessment[],
    path: LearningPath,
    targetRole: string,
  ): Promise<number> {
    let score = 0;

    // Skill alignment (40% weight)
    const requiredSkills = await this.getRequiredSkills(targetRole);
    const skillAlignment = this.calculateSkillAlignment(
      userSkills,
      requiredSkills,
    );
    score += skillAlignment * 0.4;

    // Career goal alignment (25% weight)
    const careerAlignment = await this.calculateCareerAlignment(path, user);
    score += careerAlignment * 0.25;

    // Learning preference match (20% weight)
    const preferenceMatch = await this.calculatePreferenceMatch(path, user);
    score += preferenceMatch * 0.2;

    // Prerequisite satisfaction (15% weight)
    const prerequisiteSatisfaction = await this.checkPrerequisites(user, path);
    score += prerequisiteSatisfaction * 0.15;

    return Math.min(1, score);
  }

  private async createPersonalizedPath(
    user: User,
    userSkills: SkillAssessment[],
    recommendedPaths: RecommendedPath[],
  ): Promise<PersonalizedPath> {
    // Analyze gaps in recommended paths
    const gaps = await this.analyzePathGaps(userSkills, recommendedPaths);

    // Create custom path to fill gaps
    const customCourses = await this.selectCustomCourses(gaps, user);

    // Optimize sequence based on prerequisites and dependencies
    const optimizedSequence = await this.optimizeCourseSequence(customCourses);

    return {
      title: `Personalized Learning Path for ${user.firstName}`,
      description: `Custom path based on your skills and career goals`,
      courses: optimizedSequence,
      estimatedDuration: this.calculateTotalDuration(optimizedSequence),
      totalCost: this.calculateTotalCost(optimizedSequence),
      customizations: gaps,
      flexibility: this.calculateFlexibility(optimizedSequence),
    };
  }

  private async optimizeCourseSequence(courses: Course[]): Promise<Course[]> {
    // Build dependency graph
    const graph = this.buildDependencyGraph(courses);

    // Topological sort to determine valid sequence
    const sorted = this.topologicalSort(graph);

    // Optimize for parallel learning where possible
    const optimized = await this.optimizeForParallelLearning(sorted);

    return optimized;
  }
}
```

### Certificate Generation and Verification

```typescript
@Injectable()
export class CertificateService {
  async generateCertificate(
    userId: string,
    courseId: string,
    enrollmentId: string,
  ): Promise<Certificate> {
    const user = await this.userService.findById(userId);
    const course = await this.courseRepository.findById(courseId);
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);

    // Generate certificate content
    const certificateContent = await this.generateCertificateContent(
      user,
      course,
      enrollment,
    );

    // Generate digital signature
    const digitalSignature =
      await this.generateDigitalSignature(certificateContent);

    // Generate blockchain hash for verification
    const blockchainHash =
      await this.generateBlockchainHash(certificateContent);

    // Generate verification code
    const verificationCode = this.generateVerificationCode();

    // Create certificate record
    const certificate = await this.certificateRepository.create({
      userId,
      courseId,
      certificateType: 'COURSE_COMPLETION',
      title: `Certificate of Completion - ${course.title}`,
      description: `Successfully completed ${course.title}`,
      issuingOrganization: 'BLIH Company',
      achievementDate: enrollment.completionDate,
      certificateContent,
      digitalSignature,
      blockchainHash,
      issueDate: new Date(),
      expirationDate: this.calculateExpirationDate(course),
      verificationCode,
      skillsValidated: course.skillsGained,
      competencyLevel: this.determineCompetencyLevel(enrollment.finalScore),
      creditsEarned: course.credits || 0,
      status: 'ISSUED',
      createdBy: 'system',
    });

    const savedCertificate = await this.certificateRepository.save(certificate);

    // Generate PDF certificate
    await this.generateCertificatePDF(savedCertificate);

    // Send notification to user
    await this.notificationService.send({
      recipientId: userId,
      type: 'CERTIFICATE_ISSUED',
      title: 'Certificate Available',
      body: `You have earned a certificate for completing ${course.title}`,
      data: { certificateId: savedCertificate.id },
    });

    return savedCertificate;
  }

  async verifyCertificate(
    verificationCode: string,
  ): Promise<VerificationResult> {
    const certificate = await this.certificateRepository.findOne({
      where: { verificationCode },
    });

    if (!certificate) {
      return {
        isValid: false,
        reason: 'Certificate not found',
        verificationCode,
      };
    }

    // Check if certificate is valid
    if (!certificate.isValid) {
      return {
        isValid: false,
        reason: 'Certificate has been revoked',
        revokedDate: certificate.revokedDate,
        revocationReason: certificate.revocationReason,
        verificationCode,
      };
    }

    // Check if certificate has expired
    if (certificate.expirationDate && certificate.expirationDate < new Date()) {
      return {
        isValid: false,
        reason: 'Certificate has expired',
        expirationDate: certificate.expirationDate,
        verificationCode,
      };
    }

    // Verify digital signature
    const signatureValid = await this.verifyDigitalSignature(
      certificate.certificateContent,
      certificate.digitalSignature,
    );

    if (!signatureValid) {
      return {
        isValid: false,
        reason: 'Certificate signature is invalid',
        verificationCode,
      };
    }

    // Verify blockchain hash
    const blockchainValid = await this.verifyBlockchainHash(
      certificate.certificateContent,
      certificate.blockchainHash,
    );

    if (!blockchainValid) {
      return {
        isValid: false,
        reason: 'Certificate blockchain verification failed',
        verificationCode,
      };
    }

    // Get certificate details for verification
    const user = await this.userService.findById(certificate.userId);
    const course = certificate.courseId
      ? await this.courseRepository.findById(certificate.courseId)
      : null;

    return {
      isValid: true,
      certificate: {
        holderName: `${user.firstName} ${user.lastName}`,
        title: certificate.title,
        issuingOrganization: certificate.issuingOrganization,
        issueDate: certificate.issueDate,
        expirationDate: certificate.expirationDate,
        skillsValidated: certificate.skillsValidated,
        competencyLevel: certificate.competencyLevel,
        creditsEarned: certificate.creditsEarned,
        courseTitle: course?.title,
        verificationCode,
      },
      verificationCode,
    };
  }

  private async generateCertificateContent(
    user: User,
    course: TrainingCourse,
    enrollment: TrainingEnrollment,
  ): Promise<CertificateContent> {
    return {
      holder: {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        employeeId: user.employeeCode,
      },
      course: {
        title: course.title,
        description: course.description,
        duration: course.durationHours,
        completionDate: enrollment.completionDate,
        finalScore: enrollment.finalScore,
        grade: enrollment.grade,
        passed: enrollment.passed,
      },
      issuer: {
        name: 'BLIH Company',
        address: 'Addis Ababa, Ethiopia',
        contact: 'hr@blih.com',
        logo: 'https://blih.com/logo.png',
      },
      metadata: {
        certificateId: this.generateCertificateId(),
        generatedAt: new Date().toISOString(),
        version: '1.0',
      },
    };
  }

  private async generateDigitalSignature(
    content: CertificateContent,
  ): Promise<string> {
    const privateKey = await this.getSigningPrivateKey();
    const contentString = JSON.stringify(content);

    const signature = crypto.sign(
      'sha256',
      Buffer.from(contentString),
      privateKey,
    );
    return signature.toString('base64');
  }

  private async generateBlockchainHash(
    content: CertificateContent,
  ): Promise<string> {
    const contentString = JSON.stringify(content);
    const hash = crypto
      .createHash('sha256')
      .update(contentString)
      .digest('hex');

    // Submit to blockchain (simplified for this example)
    await this.blockchainService.submitHash(hash);

    return hash;
  }
}
```

---

## Integration Points

### Internal System Integrations

#### Employee Profile Integration

```typescript
@Injectable()
export class TrainingEmployeeService {
  async syncEmployeeData(userId: string): Promise<void> {
    const employee = await this.employeeService.findById(userId);

    // Update training eligibility
    await this.updateTrainingEligibility(userId, employee);

    // Update skill assessments
    await this.updateSkillAssessments(userId, employee);

    // Update career development plans
    await this.updateCareerPlans(userId, employee);
  }

  private async updateTrainingEligibility(
    userId: string,
    employee: Employee,
  ): Promise<void> {
    const eligibility = {
      canEnroll: employee.status === 'ACTIVE',
      budgetAvailable: await this.getTrainingBudget(employee.departmentId),
      managerApproval: await this.getManagerApprovalStatus(userId),
      prerequisitesMet: await this.checkPrerequisites(userId),
    };

    await this.trainingService.updateEligibility(userId, eligibility);
  }
}
```

#### Performance System Integration

```typescript
@Injectable()
export class TrainingPerformanceService {
  async syncPerformanceData(userId: string): Promise<void> {
    const performanceData =
      await this.performanceService.getPerformanceData(userId);

    // Update training recommendations based on performance
    await this.updateTrainingRecommendations(userId, performanceData);

    // Update skill assessments based on performance reviews
    await this.updateSkillAssessmentsFromPerformance(userId, performanceData);
  }

  private async updateTrainingRecommendations(
    userId: string,
    performanceData: PerformanceData,
  ): Promise<void> {
    // Identify skill gaps from performance reviews
    const skillGaps = this.extractSkillGaps(performanceData);

    // Recommend courses to address gaps
    for (const gap of skillGaps) {
      const courses = await this.findCoursesForSkillGap(gap);

      await this.recommendationService.createRecommendation({
        userId,
        type: 'PERFORMANCE_BASED',
        skill: gap.skill,
        currentLevel: gap.currentLevel,
        targetLevel: gap.targetLevel,
        recommendedCourses: courses,
        priority: gap.priority,
        reason: `Performance review indicates need for improvement in ${gap.skill}`,
      });
    }
  }
}
```

### External System Integrations

#### LMS Platform Integration

```typescript
@Injectable()
export class LMSIntegrationService {
  async syncCourseContent(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);

    // Sync to external LMS platforms
    for (const platform of this.config.lmsPlatforms) {
      try {
        await this.syncToPlatform(course, platform);
      } catch (error) {
        this.logger.error(
          `Failed to sync course ${courseId} to ${platform.name}: ${error.message}`,
        );
      }
    }
  }

  private async syncToPlatform(
    course: TrainingCourse,
    platform: LMSPlatform,
  ): Promise<void> {
    const platformCourse = this.mapCourseToPlatform(course, platform);

    switch (platform.type) {
      case 'MOODLE':
        await this.syncToMoodle(platformCourse, platform);
        break;
      case 'CORNERSTONE':
        await this.syncToCornerstone(platformCourse, platform);
        break;
      case 'COURsera':
        await this.syncToCoursera(platformCourse, platform);
        break;
      default:
        throw new Error(`Unsupported LMS platform: ${platform.type}`);
    }
  }

  async syncEnrollmentData(enrollmentId: string): Promise<void> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);

    // Sync enrollment progress to LMS
    for (const platform of this.config.lmsPlatforms) {
      await this.syncEnrollmentToPlatform(enrollment, platform);
    }

    // Update local progress from LMS
    const lmsProgress = await this.getProgressFromLMS(enrollment);
    await this.updateLocalProgress(enrollmentId, lmsProgress);
  }
}
```

#### Payment Gateway Integration

```typescript
@Injectable()
export class TrainingPaymentService {
  async processPayment(enrollmentId: string): Promise<PaymentResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);
    const course = await this.courseRepository.findById(enrollment.courseId);

    if (course.cost <= 0) {
      return { status: 'NO_PAYMENT_REQUIRED' };
    }

    // Create payment request
    const paymentRequest = {
      amount: course.cost,
      currency: course.currency,
      description: `Course enrollment: ${course.title}`,
      userId: enrollment.userId,
      enrollmentId,
      metadata: {
        courseId: course.id,
        courseTitle: course.title,
      },
    };

    // Process payment through gateway
    const paymentResult =
      await this.paymentGateway.processPayment(paymentRequest);

    if (paymentResult.status === 'SUCCESS') {
      // Update enrollment payment status
      await this.enrollmentRepository.update(enrollmentId, {
        paymentStatus: 'PAID',
        paymentAmount: paymentResult.amount,
        paymentDate: new Date(),
      });

      // Confirm enrollment
      await this.confirmEnrollment(enrollmentId);
    }

    return paymentResult;
  }

  async processRefund(
    enrollmentId: string,
    reason: string,
  ): Promise<RefundResult> {
    const enrollment = await this.enrollmentRepository.findById(enrollmentId);

    if (enrollment.paymentStatus !== 'PAID') {
      throw new BadRequestException('No payment found for refund');
    }

    // Process refund through payment gateway
    const refundResult = await this.paymentGateway.processRefund({
      originalPaymentId: enrollment.paymentId,
      amount: enrollment.paymentAmount,
      reason,
      metadata: {
        enrollmentId,
        courseId: enrollment.courseId,
      },
    });

    if (refundResult.status === 'SUCCESS') {
      // Update enrollment status
      await this.enrollmentRepository.update(enrollmentId, {
        paymentStatus: 'REFUNDED',
        refundDate: new Date(),
        refundReason: reason,
      });
    }

    return refundResult;
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                        | Employee | Manager   | HR Manager | Admin |
| --------------------------------- | -------- | --------- | ---------- | ----- |
| `hr:training:courses:view`        | ✅       | ✅        | ✅         | ✅    |
| `hr:training:courses:create`      | ❌       | ❌        | ✅         | ✅    |
| `hr:training:courses:manage`      | ❌       | ❌        | ✅         | ✅    |
| `hr:training:enroll:self`         | ✅       | ✅        | ✅         | ✅    |
| `hr:training:enroll:team`         | ❌       | ✅        | ✅         | ✅    |
| `hr:training:enroll:approve`      | ❌       | ✅        | ✅         | ✅    |
| `hr:training:assessments:view`    | ✅       | ✅        | ✅         | ✅    |
| `hr:training:assessments:create`  | ❌       | ✅        | ✅         | ✅    |
| `hr:training:certificates:view`   | ✅       | ✅        | ✅         | ✅    |
| `hr:training:certificates:verify` | ✅       | ✅        | ✅         | ✅    |
| `hr:training:analytics:view`      | ❌       | ✅ (team) | ✅         | ✅    |

### Data Protection Measures

#### Course Content Protection

```typescript
@Injectable()
export class CourseContentProtectionService {
  async protectCourseContent(courseId: string): Promise<void> {
    const course = await this.courseRepository.findById(courseId);

    // Encrypt sensitive content
    if (course.containsSensitiveData) {
      course.contentUrl = await this.encryptContent(course.contentUrl);
      course.materials = await this.encryptMaterials(course.materials);
    }

    // Add watermarks to downloadable content
    course.materials = await this.addWatermarks(course.materials);

    // Set access controls
    course.accessControls = await this.generateAccessControls(course);

    await this.courseRepository.save(course);
  }

  async grantContentAccess(
    userId: string,
    courseId: string,
    accessType: string,
  ): Promise<AccessGrant> {
    // Validate access rights
    const hasAccess = await this.validateAccessRights(
      userId,
      courseId,
      accessType,
    );

    if (!hasAccess) {
      throw new ForbiddenException('Insufficient access rights');
    }

    // Generate temporary access token
    const accessToken = this.generateAccessToken(userId, courseId, accessType);

    // Log access grant
    await this.logAccessGrant(userId, courseId, accessType);

    return {
      accessToken,
      expiresAt: this.calculateTokenExpiry(accessType),
      permissions: this.getPermissions(accessType),
    };
  }
}
```

#### Certificate Security

```typescript
@Injectable()
export class CertificateSecurityService {
  async generateSecureCertificate(
    certificateData: CertificateContent,
  ): Promise<SecureCertificate> {
    // Generate certificate with security features
    const certificate = {
      ...certificateData,
      securityFeatures: {
        digitalSignature: await this.generateDigitalSignature(certificateData),
        blockchainHash: await this.generateBlockchainHash(certificateData),
        qrCode: await this.generateQRCode(certificateData),
        watermark: await this.generateWatermark(certificateData),
        microtext: await this.generateMicrotext(certificateData),
      },
      metadata: {
        issuedAt: new Date(),
        version: '2.0',
        securityLevel: 'HIGH',
      },
    };

    return certificate;
  }

  async verifyCertificateIntegrity(
    certificateId: string,
    providedHash: string,
  ): Promise<IntegrityResult> {
    const certificate =
      await this.certificateRepository.findById(certificateId);

    if (!certificate) {
      return { isValid: false, reason: 'Certificate not found' };
    }

    // Verify blockchain hash
    const currentHash = await this.generateBlockchainHash(
      certificate.certificateContent,
    );
    const hashValid = currentHash === providedHash;

    // Verify digital signature
    const signatureValid = await this.verifyDigitalSignature(
      certificate.certificateContent,
      certificate.digitalSignature,
    );

    return {
      isValid: hashValid && signatureValid,
      hashValid,
      signatureValid,
      verificationDate: new Date(),
    };
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

# File storage (AWS S3 or similar)
aws --version

# Environment setup
cp .env.example .env
# Configure environment variables
```

#### Database Setup

```bash
# Create database
createdb blih_hr_training

# Run migrations
npm run migration:run

# Seed data
npm run seed:training
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(TrainingCourse)
    private courseRepository: Repository<TrainingCourse>,
    private prerequisiteService: CoursePrerequisiteService,
    private contentProtectionService: CourseContentProtectionService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  async createCourse(
    createDto: CreateCourseDto,
    userId: string,
  ): Promise<TrainingCourse> {
    // Validate course data
    await this.validateCourseData(createDto);

    // Create course
    const course = this.courseRepository.create({
      ...createDto,
      status: 'DRAFT',
      createdBy: userId,
      createdAt: new Date(),
    });

    const savedCourse = await this.courseRepository.save(course);

    // Protect course content
    await this.contentProtectionService.protectCourseContent(savedCourse.id);

    // Send notifications
    await this.notificationService.sendCourseCreationNotification(savedCourse);

    // Audit log
    await this.auditService.logAction('CREATE', savedCourse.id, userId);

    return savedCourse;
  }
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('CoursePrerequisiteService', () => {
  let service: CoursePrerequisiteService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CoursePrerequisiteService],
    }).compile();

    service = module.get<CoursePrerequisiteService>(CoursePrerequisiteService);
  });

  describe('validatePrerequisites', () => {
    it('should validate course prerequisites correctly', async () => {
      const userId = 'user-uuid';
      const courseId = 'course-uuid';

      const result = await service.validatePrerequisites(userId, courseId);

      expect(result).toHaveProperty('isValid');
      expect(result).toHaveProperty('missingPrerequisites');
      expect(result).toHaveProperty('canEnroll');
      expect(Array.isArray(result.missingPrerequisites)).toBe(true);
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
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_training
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=training-service

# File Storage
AWS_S3_BUCKET=blih-training-content
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Payment Gateway
PAYMENT_GATEWAY_URL=https://api.payment.com
PAYMENT_GATEWAY_API_KEY=your-api-key
PAYMENT_GATEWAY_SECRET=your-secret

# LMS Integration
LMS_PLATFORMS=moodle,cornerstone
MOODLE_URL=https://moodle.example.com
CORNERSTONE_URL=https://cornerstone.example.com

# Certificate Security
CERTIFICATE_PRIVATE_KEY_PATH=/path/to/private.key
CERTIFICATE_BLOCKCHAIN_API=https://blockchain.example.com

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=info
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main.js"]
```

---

## Troubleshooting Guide

### Common Issues and Solutions

#### Enrollment Validation Issues

**Problem:** Prerequisite validation failing

```
Expected: Prerequisites met, Actual: Prerequisites not met
```

**Solutions:**

1. Check course completion records
2. Verify skill assessment data
3. Review prerequisite configuration

#### Certificate Generation Issues

**Problem:** Certificate generation failing

```
Expected: Certificate generated, Actual: Generation error
```

**Solutions:**

1. Check digital signature keys
2. Verify blockchain connection
3. Review certificate template

#### Content Access Issues

**Problem:** Course content not accessible

```
Expected: Content accessible, Actual: Access denied
```

**Solutions:**

1. Verify enrollment status
2. Check access token validity
3. Review permission settings

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_enrollments_user_status
ON training_enrollments(user_id, status);

CREATE INDEX CONCURRENTLY idx_courses_category_active
ON training_courses(category, is_active);

-- Partition large tables
CREATE TABLE skill_assessments_2026 PARTITION OF skill_assessments
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### Caching Strategy

```typescript
@Injectable()
export class TrainingCacheService {
  async getCourseCatalog(filters: CourseFilters): Promise<Course[]> {
    const cacheKey = `courses:catalog:${JSON.stringify(filters)}`;

    let courses = await this.cacheManager.get<Course[]>(cacheKey);
    if (!courses) {
      courses = await this.loadCourseCatalog(filters);
      await this.cacheManager.set(cacheKey, courses, 1800); // 30 minutes
    }

    return courses;
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Training & Skill Development System.
