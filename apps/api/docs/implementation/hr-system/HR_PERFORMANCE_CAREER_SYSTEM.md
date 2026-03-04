# HR Performance & Career Development System Documentation

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

The HR Performance & Career Development System manages employee performance evaluation, goal setting, skill development, and career progression. This system provides comprehensive performance management with automated workflows, objective tracking, and personalized development planning while ensuring fair evaluation processes and career growth opportunities.

### Key Features

- **Performance Reviews:** Multi-source feedback with weighted ratings and calibration
- **OKR Management:** Goal cascading from company to individual levels
- **Training Needs Analysis:** Skill gap identification and personalized recommendations
- **Career Development:** Development plans, mentorship, and promotion tracking
- **Analytics Dashboard:** Performance trends, skill matrices, and career pathing

### Business Objectives

- Achieve 90%+ on-time performance review completion
- Maintain 85%+ OKR alignment across organization
- Identify and address 95%+ critical skill gaps
- Ensure 80%+ internal promotion rate for senior positions

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Employee Portal]
        B[Manager Dashboard]
        C[HR Analytics]
        D[Executive Dashboard]
    end

    subgraph "API Layer"
        E[Performance API]
        F[OKR API]
        G[Training API]
        H[Career API]
    end

    subgraph "Service Layer"
        I[Review Service]
        J[OKR Service]
        K[Training Service]
        L[Career Service]
        M[Analytics Service]
    end

    subgraph "Processing Layer"
        N[Rating Calculator]
        O[OKR Cascader]
        P[Skill Analyzer]
        Q[Career Pathing]
    end

    subgraph "Data Layer"
        R[PostgreSQL Database]
        S[Redis Cache]
        T[File Storage]
    end

    subgraph "External Services"
        U[Keycloak Auth]
        V[Email Service]
        W[Training LMS]
        X[Finance System]
    end

    A --> E
    B --> E
    C --> F
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
    H --> X
```

### Component Responsibilities

| Component         | Responsibility                      | Key Technologies                          |
| ----------------- | ----------------------------------- | ----------------------------------------- |
| Review Service    | Performance evaluation and feedback | Weighted Algorithms, Calibration          |
| OKR Service       | Goal setting and cascading          | Alignment Calculations, Progress Tracking |
| Training Service  | Skill analysis and recommendations  | Gap Analysis, ML Recommendations          |
| Career Service    | Development planning and promotions | Pathing Algorithms, Mentorship Matching   |
| Analytics Service | Performance insights and reporting  | Data Visualization, Trend Analysis        |

---

## Database Schema

### Core Tables

#### PerformanceReview

```sql
CREATE TABLE performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Review details
    review_type VARCHAR(50) NOT NULL,
    review_period VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Rating data
    overall_rating FLOAT,
    rating_breakdown JSONB,
    strengths TEXT[],
    areas_for_improvement TEXT[],
    achievements TEXT[],
    goals_met JSONB,

    -- Feedback
    self_assessment TEXT,
    manager_feedback TEXT,
    peer_feedback JSONB,
    feedback_summary TEXT,

    -- Status and workflow
    status VARCHAR(50) DEFAULT 'DRAFT',
    submitted_at TIMESTAMP,
    reviewed_at TIMESTAMP,
    calibrated_at TIMESTAMP,

    -- Metadata
    calibration_notes TEXT,
    development_recommendations JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_performance_reviews_user ON performance_reviews(user_id, review_period);
CREATE INDEX idx_performance_reviews_reviewer ON performance_reviews(reviewer_id, status);
CREATE INDEX idx_performance_reviews_period ON performance_reviews(review_period, status);
CREATE INDEX idx_performance_reviews_rating ON performance_reviews(overall_rating);
```

#### OKR

```sql
CREATE TABLE okrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    parent_okr_id UUID REFERENCES okrs(id),

    -- OKR details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    objective_type VARCHAR(50) NOT NULL,
    alignment_level VARCHAR(50) NOT NULL,

    -- Progress tracking
    progress_percentage FLOAT DEFAULT 0,
    target_value FLOAT,
    current_value FLOAT DEFAULT 0,
    unit VARCHAR(50),

    -- Timeline
    quarter VARCHAR(10) NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,

    -- Status and ownership
    status VARCHAR(50) DEFAULT 'ACTIVE',
    owner_id UUID REFERENCES users(id),
    stakeholder_ids UUID[],

    -- Key results
    key_results JSONB,
    milestones JSONB,

    -- Dependencies and alignment
    dependencies JSONB,
    alignment_score FLOAT,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_okrs_user ON okrs(user_id, year, quarter);
CREATE INDEX idx_okrs_parent ON okrs(parent_okr_id);
CREATE INDEX idx_okrs_status ON okrs(status, year, quarter);
CREATE INDEX idx_okrs_alignment ON okrs(alignment_level, status);
```

#### SkillAssessment

```sql
CREATE TABLE skill_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Assessment details
    skill_category VARCHAR(50) NOT NULL,
    skill_name VARCHAR(100) NOT NULL,
    current_level INTEGER NOT NULL,
    target_level INTEGER NOT NULL,
    proficiency_level VARCHAR(50),

    -- Assessment data
    self_rating INTEGER,
    manager_rating INTEGER,
    peer_rating FLOAT,
    assessment_date DATE NOT NULL,
    assessment_method VARCHAR(50),

    -- Gap analysis
    skill_gap INTEGER,
    priority_level VARCHAR(50),
    urgency_level VARCHAR(50),

    -- Development recommendations
    recommended_training JSONB,
    development_timeline VARCHAR(50),
    resources JSONB,

    -- Metadata
    assessed_by UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, skill_category, skill_name, assessment_date)
);

CREATE INDEX idx_skill_assessments_user ON skill_assessments(user_id, assessment_date);
CREATE INDEX idx_skill_assessments_gap ON skill_assessments(skill_gap, priority_level);
CREATE INDEX idx_skill_assessments_category ON skill_assessments(skill_category, skill_name);
```

#### CareerDevelopmentPlan

```sql
CREATE TABLE career_development_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Plan details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    career_goal VARCHAR(255) NOT NULL,
    target_position VARCHAR(255),
    target_timeline VARCHAR(50),

    -- Current state
    current_position VARCHAR(255),
    current_level VARCHAR(50),
    readiness_score FLOAT,

    -- Development activities
    development_activities JSONB,
    training_requirements JSONB,
    mentorship_needs JSONB,

    -- Milestones and progress
    milestones JSONB,
    progress_percentage FLOAT DEFAULT 0,
    last_review_date DATE,
    next_review_date DATE,

    -- Support and resources
    mentor_id UUID REFERENCES users(id),
    sponsor_id UUID REFERENCES users(id),
    budget_allocated DECIMAL(10,2),

    -- Status and workflow
    status VARCHAR(50) DEFAULT 'ACTIVE',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_career_plans_user ON career_development_plans(user_id, status);
CREATE INDEX idx_career_plans_mentor ON career_development_plans(mentor_id);
CREATE INDEX idx_career_plans_readiness ON career_development_plans(readiness_score, status);
```

#### PromotionRequest

```sql
CREATE TABLE promotion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Promotion details
    current_position VARCHAR(255) NOT NULL,
    target_position VARCHAR(255) NOT NULL,
    current_level VARCHAR(50),
    target_level VARCHAR(50),

    -- Justification
    promotion_reason TEXT NOT NULL,
    achievements JSONB,
    skills_demonstrated JSONB,
    impact_metrics JSONB,

    -- Readiness assessment
    readiness_score FLOAT,
    competency_scores JSONB,
    performance_history JSONB,

    -- Approval workflow
    status VARCHAR(50) DEFAULT 'PENDING',
    current_approver_id UUID REFERENCES users(id),
    approval_chain JSONB,

    -- Timeline
    requested_date DATE NOT NULL,
    effective_date DATE,
    decision_date DATE,

    -- Decision details
    decision VARCHAR(50),
    decision_reason TEXT,
    conditions JSONB,

    -- Metadata
    requested_by UUID REFERENCES users(id),
    reviewed_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promotion_requests_user ON promotion_requests(user_id, status);
CREATE INDEX idx_promotion_requests_approver ON promotion_requests(current_approver_id, status);
CREATE INDEX idx_promotion_requests_position ON promotion_requests(target_position, status);
```

### Entity Relationships

```mermaid
erDiagram
    PerformanceReview ||--o{ OKR : "evaluates"
    PerformanceReview }o--|| User : "reviews"
    PerformanceReview }o--|| User : "reviewed by"
    OKR ||--o{ OKR : "parent-child"
    OKR }o--|| User : "owned by"
    SkillAssessment }o--|| User : "assessed"
    SkillAssessment }o--|| User : "assessed by"
    CareerDevelopmentPlan }o--|| User : "belongs to"
    CareerDevelopmentPlan }o--|| User : "mentored by"
    CareerDevelopmentPlan }o--|| User : "sponsored by"
    PromotionRequest }o--|| User : "requested by"
    PromotionRequest }o--|| User : "approved by"
```

---

## API Endpoints

### Performance Review Endpoints

#### POST /api/hr/performance/reviews

Create new performance review.

**Request Body:**

```json
{
  "userId": "uuid",
  "reviewType": "QUARTERLY",
  "reviewPeriod": "Q1-2026",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "selfAssessment": "Successfully completed all assigned projects...",
  "goals": [
    {
      "id": "goal-1",
      "title": "Complete project X",
      "target": "100%",
      "achieved": "95%",
      "rating": 4
    }
  ]
}
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "reviewType": "QUARTERLY",
  "reviewPeriod": "Q1-2026",
  "status": "DRAFT",
  "overallRating": null,
  "ratingBreakdown": {
    "technical": 0,
    "leadership": 0,
    "communication": 0,
    "teamwork": 0
  },
  "createdAt": "2026-02-28T10:00:00Z"
}
```

#### GET /api/hr/performance/reviews/:id

Get performance review details.

#### PUT /api/hr/performance/reviews/:id/submit

Submit performance review for approval.

#### PUT /api/hr/performance/reviews/:id/calibrate

Calibrate performance review ratings.

#### GET /api/hr/performance/reviews/dashboard

Get performance review dashboard.

### OKR Endpoints

#### POST /api/hr/performance/okrs

Create new OKR.

**Request Body:**

```json
{
  "userId": "uuid",
  "title": "Increase Customer Satisfaction",
  "description": "Improve NPS score and reduce churn rate",
  "objectiveType": "BUSINESS",
  "alignmentLevel": "DEPARTMENT",
  "quarter": "Q1",
  "year": 2026,
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "keyResults": [
    {
      "title": "Increase NPS from 45 to 50",
      "targetValue": 50,
      "currentValue": 45,
      "unit": "score"
    },
    {
      "title": "Reduce churn rate by 10%",
      "targetValue": 10,
      "currentValue": 0,
      "unit": "percentage"
    }
  ]
}
```

#### GET /api/hr/performance/okrs/cascade/:id

Cascade OKR to team members.

#### PUT /api/hr/performance/okrs/:id/progress

Update OKR progress.

#### GET /api/hr/performance/okrs/alignment

Get OKR alignment analysis.

### Skill Assessment Endpoints

#### POST /api/hr/performance/skills/assess

Create skill assessment.

**Request Body:**

```json
{
  "userId": "uuid",
  "skillCategory": "TECHNICAL",
  "skillName": "JavaScript",
  "currentLevel": 3,
  "targetLevel": 4,
  "selfRating": 3,
  "assessmentMethod": "360_FEEDBACK",
  "notes": "Good foundation, needs advanced concepts"
}
```

#### GET /api/hr/performance/skills/gap-analysis

Get skill gap analysis.

#### GET /api/hr/performance/skills/recommendations

Get training recommendations.

### Career Development Endpoints

#### POST /api/hr/performance/career/plans

Create career development plan.

**Request Body:**

```json
{
  "userId": "uuid",
  "title": "Senior Software Engineer Path",
  "careerGoal": "Become Senior Software Engineer",
  "targetPosition": "Senior Software Engineer",
  "targetTimeline": "18 months",
  "developmentActivities": [
    {
      "activity": "Complete advanced JavaScript course",
      "deadline": "2026-06-30",
      "status": "PENDING"
    }
  ],
  "mentorId": "mentor-uuid"
}
```

#### GET /api/hr/performance/career/paths

Get available career paths.

#### POST /api/hr/performance/career/promotions

Submit promotion request.

#### GET /api/hr/performance/career/readiness

Get promotion readiness assessment.

---

## Business Logic & Workflows

### Performance Rating Calculation

```typescript
interface RatingCalculation {
  overallRating: number;
  breakdown: RatingBreakdown;
  confidence: number;
  calibrationAdjustment?: number;
}

interface RatingBreakdown {
  technical: number;
  leadership: number;
  communication: number;
  teamwork: number;
  innovation: number;
  results: number;
}

@Injectable()
export class PerformanceRatingService {
  async calculateOverallRating(
    review: PerformanceReview,
  ): Promise<RatingCalculation> {
    // Get all feedback sources
    const feedback = await this.gatherFeedback(review.id);

    // Calculate weighted ratings
    const weights = this.getRatingWeights(review.reviewType);
    const breakdown = this.calculateBreakdown(feedback, weights);

    // Calculate overall rating
    const overallRating = this.weightedAverage(breakdown, weights);

    // Apply calibration if needed
    const calibratedRating = await this.applyCalibration(
      overallRating,
      review.userId,
    );

    // Calculate confidence score
    const confidence = this.calculateConfidence(feedback);

    return {
      overallRating: calibratedRating.rating,
      breakdown,
      confidence,
      calibrationAdjustment: calibratedRating.adjustment,
    };
  }

  private async gatherFeedback(reviewId: string): Promise<FeedbackData> {
    const selfAssessment = await this.getSelfAssessment(reviewId);
    const managerFeedback = await this.getManagerFeedback(reviewId);
    const peerFeedback = await this.getPeerFeedback(reviewId);

    return {
      self: selfAssessment,
      manager: managerFeedback,
      peers: peerFeedback,
      metrics: await this.getPerformanceMetrics(reviewId),
    };
  }

  private calculateBreakdown(
    feedback: FeedbackData,
    weights: RatingWeights,
  ): RatingBreakdown {
    return {
      technical: this.calculateCategoryRating(feedback, 'technical', weights),
      leadership: this.calculateCategoryRating(feedback, 'leadership', weights),
      communication: this.calculateCategoryRating(
        feedback,
        'communication',
        weights,
      ),
      teamwork: this.calculateCategoryRating(feedback, 'teamwork', weights),
      innovation: this.calculateCategoryRating(feedback, 'innovation', weights),
      results: this.calculateCategoryRating(feedback, 'results', weights),
    };
  }

  private async applyCalibration(
    rating: number,
    userId: string,
  ): Promise<CalibratedRating> {
    // Get calibration curve for user's department/level
    const calibrationCurve = await this.getCalibrationCurve(userId);

    // Apply calibration adjustment
    const adjustment = calibrationCurve.adjustment(rating);
    const calibratedRating = Math.max(1, Math.min(5, rating + adjustment));

    return {
      rating: calibratedRating,
      adjustment,
      curve: calibrationCurve.name,
    };
  }
}
```

### OKR Cascading Logic

```typescript
@Injectable()
export class OKRCascadingService {
  async cascadeOKR(
    parentOKRId: string,
    cascadeLevel: string,
  ): Promise<CascadedOKR[]> {
    const parentOKR = await this.okrRepository.findById(parentOKRId);
    const teamMembers = await this.getTeamMembers(
      parentOKR.userId,
      cascadeLevel,
    );

    const cascadedOKRs = [];

    for (const member of teamMembers) {
      const cascaded = await this.createCascadedOKR(parentOKR, member);
      cascadedOKRs.push(cascaded);

      // Send notification
      await this.notificationService.send({
        recipientId: member.id,
        type: 'OKR_ASSIGNED',
        title: `New OKR: ${parentOKR.title}`,
        body: `You have been assigned a cascaded OKR from ${parentOKR.user.firstName}`,
        data: { okrId: cascaded.id },
      });
    }

    // Update alignment score
    await this.updateAlignmentScore(parentOKRId);

    return cascadedOKRs;
  }

  private async createCascadedOKR(parent: OKR, teamMember: User): Promise<OKR> {
    // Adapt OKR to individual level
    const adaptedOKR = this.adaptOKRForIndividual(parent, teamMember);

    // Create cascaded OKR
    const cascaded = await this.okrRepository.create({
      userId: teamMember.id,
      parentOkrId: parent.id,
      title: adaptedOKR.title,
      description: adaptedOKR.description,
      objectiveType: 'INDIVIDUAL',
      alignmentLevel: 'INDIVIDUAL',
      quarter: parent.quarter,
      year: parent.year,
      startDate: parent.startDate,
      endDate: parent.endDate,
      keyResults: adaptedOKR.keyResults,
      status: 'ACTIVE',
      ownerId: teamMember.id,
    });

    return await this.okrRepository.save(cascaded);
  }

  private adaptOKRForIndividual(parent: OKR, teamMember: User): AdaptedOKR {
    // Get individual's role and responsibilities
    const role = teamMember.jobTitle;
    const responsibilities = this.getRoleResponsibilities(role);

    // Adapt key results based on role
    const adaptedKeyResults = parent.keyResults.map((kr) => {
      return this.adaptKeyResultForRole(kr, responsibilities);
    });

    return {
      title: `${parent.title} - ${role} Contribution`,
      description: `Individual contribution to: ${parent.description}`,
      keyResults: adaptedKeyResults,
    };
  }

  async calculateAlignmentScore(okrId: string): Promise<AlignmentScore> {
    const okr = await this.okrRepository.findById(okrId);
    const childOKRs = await this.getChildOKRs(okrId);

    if (childOKRs.length === 0) {
      return { score: 100, aligned: 0, total: 0 };
    }

    const alignedCount = childOKRs.filter((child) =>
      this.isAligned(okr, child),
    ).length;

    const alignmentScore = (alignedCount / childOKRs.length) * 100;

    return {
      score: Math.round(alignmentScore),
      aligned: alignedCount,
      total: childOKRs.length,
    };
  }
}
```

### Skill Gap Analysis

```typescript
interface SkillGap {
  skill: string;
  currentLevel: number;
  requiredLevel: number;
  gap: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  urgency: 'IMMEDIATE' | 'SHORT_TERM' | 'LONG_TERM';
  recommendations: TrainingRecommendation[];
}

@Injectable()
export class SkillGapAnalysisService {
  async analyzeSkillGaps(
    userId: string,
    targetPosition?: string,
  ): Promise<SkillGap[]> {
    const user = await this.userService.findById(userId);
    const currentSkills = await this.getUserSkills(userId);
    const requiredSkills = await this.getRequiredSkills(
      targetPosition || user.jobTitle,
    );

    const gaps = [];

    for (const required of requiredSkills) {
      const current = currentSkills.find((s) => s.name === required.name);
      const gap = this.calculateSkillGap(current, required);

      if (gap.gap > 0) {
        const recommendations = await this.generateTrainingRecommendations(gap);
        gaps.push({
          ...gap,
          recommendations,
        });
      }
    }

    // Sort by priority and urgency
    return gaps.sort((a, b) => {
      const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const urgencyOrder = { IMMEDIATE: 3, SHORT_TERM: 2, LONG_TERM: 1 };

      const priorityDiff =
        priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;

      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  private calculateSkillGap(
    current: SkillAssessment,
    required: RequiredSkill,
  ): SkillGap {
    const currentLevel = current?.currentLevel || 0;
    const requiredLevel = required.level;
    const gap = requiredLevel - currentLevel;

    // Determine priority based on gap size and skill importance
    const priority = this.determinePriority(gap, required.importance);
    const urgency = this.determineUrgency(gap, required.timeline);

    return {
      skill: required.name,
      currentLevel,
      requiredLevel,
      gap,
      priority,
      urgency,
    };
  }

  private async generateTrainingRecommendations(
    gap: SkillGap,
  ): Promise<TrainingRecommendation[]> {
    // Find training courses for this skill gap
    const courses = await this.trainingService.findCourses({
      skill: gap.skill,
      targetLevel: gap.requiredLevel,
      currentLevel: gap.currentLevel,
    });

    // Score and rank courses
    const scoredCourses = courses.map((course) => ({
      ...course,
      score: this.scoreCourseForGap(course, gap),
    }));

    // Sort by score and return top recommendations
    return scoredCourses
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((course) => ({
        courseId: course.id,
        title: course.title,
        provider: course.provider,
        duration: course.duration,
        cost: course.cost,
        deliveryMethod: course.deliveryMethod,
        effectiveness: course.effectiveness,
        score: course.score,
      }));
  }

  private scoreCourseForGap(course: TrainingCourse, gap: SkillGap): number {
    let score = 0;

    // Skill relevance
    score += course.skillRelevance * 30;

    // Level match
    const levelMatch = 1 - Math.abs(course.targetLevel - gap.requiredLevel) / 5;
    score += levelMatch * 25;

    // Delivery preference match
    score += this.deliveryPreferenceMatch(course) * 20;

    // Cost effectiveness
    score += (1 - course.cost / 1000) * 15;

    // Success rate
    score += course.successRate * 10;

    return score;
  }
}
```

### Promotion Readiness Assessment

```typescript
interface PromotionReadiness {
  overallScore: number;
  readinessLevel: 'READY' | 'NEEDS_DEVELOPMENT' | 'NOT_READY';
  criteria: ReadinessCriteria;
  recommendations: string[];
  timeline: string;
}

interface ReadinessCriteria {
  performanceScore: number;
  skillScore: number;
  experienceScore: number;
  leadershipScore: number;
  potentialScore: number;
}

@Injectable()
export class PromotionReadinessService {
  async assessReadiness(
    userId: string,
    targetPosition: string,
  ): Promise<PromotionReadiness> {
    // Gather assessment data
    const performanceData = await this.getPerformanceData(userId);
    const skillData = await this.getSkillData(userId);
    const experienceData = await this.getExperienceData(userId);
    const leadershipData = await this.getLeadershipData(userId);
    const potentialData = await this.getPotentialData(userId);

    // Get target position requirements
    const positionRequirements =
      await this.getPositionRequirements(targetPosition);

    // Calculate individual criteria scores
    const criteria = {
      performanceScore: this.calculatePerformanceScore(
        performanceData,
        positionRequirements,
      ),
      skillScore: this.calculateSkillScore(skillData, positionRequirements),
      experienceScore: this.calculateExperienceScore(
        experienceData,
        positionRequirements,
      ),
      leadershipScore: this.calculateLeadershipScore(
        leadershipData,
        positionRequirements,
      ),
      potentialScore: this.calculatePotentialScore(
        potentialData,
        positionRequirements,
      ),
    };

    // Calculate overall readiness score
    const overallScore = this.calculateOverallScore(criteria);

    // Determine readiness level
    const readinessLevel = this.determineReadinessLevel(overallScore, criteria);

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      criteria,
      positionRequirements,
    );

    // Estimate timeline
    const timeline = this.estimateTimeline(criteria, overallScore);

    return {
      overallScore,
      readinessLevel,
      criteria,
      recommendations,
      timeline,
    };
  }

  private calculatePerformanceScore(
    performance: PerformanceData,
    requirements: PositionRequirements,
  ): number {
    const recentRatings = performance.recentRatings.slice(-4); // Last 4 quarters
    const averageRating =
      recentRatings.reduce((sum, r) => sum + r.rating, 0) /
      recentRatings.length;

    // Compare against target position requirements
    const ratingRequirement = requirements.minPerformanceRating;
    const score = Math.min(100, (averageRating / ratingRequirement) * 100);

    return Math.round(score);
  }

  private calculateSkillScore(
    skills: SkillAssessment[],
    requirements: PositionRequirements,
  ): number {
    const requiredSkills = requirements.requiredSkills;
    let totalScore = 0;
    let skillCount = 0;

    for (const required of requiredSkills) {
      const userSkill = skills.find((s) => s.name === required.name);
      const currentLevel = userSkill?.currentLevel || 0;
      const requiredLevel = required.level;

      const skillScore = Math.min(100, (currentLevel / requiredLevel) * 100);
      totalScore += skillScore * required.weight;
      skillCount += required.weight;
    }

    return Math.round(totalScore / skillCount);
  }

  private calculateExperienceScore(
    experience: ExperienceData,
    requirements: PositionRequirements,
  ): number {
    const currentExperience = experience.totalYears;
    const requiredExperience = requirements.minYearsExperience;
    const relevantExperience = experience.relevantYears;

    // Calculate experience score
    const yearsScore = Math.min(
      100,
      (currentExperience / requiredExperience) * 100,
    );
    const relevanceScore = Math.min(
      100,
      (relevantExperience / requiredExperience) * 100,
    );

    return Math.round(yearsScore * 0.6 + relevanceScore * 0.4);
  }

  private determineReadinessLevel(
    overallScore: number,
    criteria: ReadinessCriteria,
  ): 'READY' | 'NEEDS_DEVELOPMENT' | 'NOT_READY' {
    // Check minimum thresholds
    const minThresholds = {
      performanceScore: 80,
      skillScore: 75,
      experienceScore: 70,
      leadershipScore: 60,
      potentialScore: 70,
    };

    const meetsMinimums = Object.entries(criteria).every(
      ([key, value]) => value >= minThresholds[key],
    );

    if (!meetsMinimums) {
      return 'NOT_READY';
    }

    if (overallScore >= 85) {
      return 'READY';
    }

    return 'NEEDS_DEVELOPMENT';
  }

  private generateRecommendations(
    criteria: ReadinessCriteria,
    requirements: PositionRequirements,
  ): string[] {
    const recommendations = [];

    if (criteria.performanceScore < 80) {
      recommendations.push(
        'Focus on improving performance ratings in key areas',
      );
    }

    if (criteria.skillScore < 75) {
      recommendations.push(
        'Complete skill development programs for critical competencies',
      );
    }

    if (criteria.experienceScore < 70) {
      recommendations.push(
        'Gain more experience in relevant areas through stretch assignments',
      );
    }

    if (criteria.leadershipScore < 60) {
      recommendations.push(
        'Develop leadership skills through mentorship and training',
      );
    }

    if (criteria.potentialScore < 70) {
      recommendations.push(
        'Demonstrate higher potential through initiative and impact',
      );
    }

    return recommendations;
  }
}
```

---

## Integration Points

### Internal System Integrations

#### Employee Profile Integration

```typescript
@Injectable()
export class PerformanceEmployeeService {
  async syncEmployeeData(userId: string): Promise<void> {
    const employee = await this.employeeService.findById(userId);

    // Update performance data with latest employee info
    await this.updatePerformanceProfile(userId, {
      currentPosition: employee.jobTitle,
      department: employee.department.name,
      level: employee.jobGrade,
      manager: employee.manager.id,
      hireDate: employee.hireDate,
    });

    // Update career development plans if position changed
    if (this.positionChanged(userId, employee.jobTitle)) {
      await this.updateCareerPlansForPositionChange(userId, employee.jobTitle);
    }

    // Update skill requirements based on new role
    await this.updateSkillRequirements(userId, employee.jobTitle);
  }
}
```

#### Training System Integration

```typescript
@Injectable()
export class PerformanceTrainingService {
  async enrollInRecommendedTraining(userId: string): Promise<void> {
    const skillGaps = await this.skillGapService.analyzeSkillGaps(userId);

    for (const gap of skillGaps) {
      for (const recommendation of gap.recommendations) {
        if (recommendation.score > 80) {
          // High-quality recommendations
          await this.trainingService.enrollUser({
            userId,
            courseId: recommendation.courseId,
            reason: `Skill gap: ${gap.skill}`,
            priority: gap.priority,
            dueDate: this.calculateDueDate(gap.urgency),
          });
        }
      }
    }
  }

  async trackTrainingImpact(userId: string, courseId: string): Promise<void> {
    const course = await this.trainingService.getCourse(courseId);
    const assessment = await this.skillAssessmentService.getLatestAssessment(
      userId,
      course.skill,
    );

    // Measure skill improvement
    const improvement = assessment.currentLevel - assessment.previousLevel;

    if (improvement > 0) {
      await this.updateSkillAssessmentImpact(userId, course.skill, improvement);
      await this.updateTrainingEffectiveness(courseId, improvement);
    }
  }
}
```

### External System Integrations

#### Finance System Integration

```typescript
@Injectable()
export class PerformanceFinanceService {
  async processPromotionCompensation(promotionId: string): Promise<void> {
    const promotion = await this.promotionService.findById(promotionId);
    const user = await this.userService.findById(promotion.userId);

    // Get compensation data for new position
    const compensationData = await this.financeService.getPositionCompensation(
      promotion.targetPosition,
    );

    // Calculate new salary
    const newSalary = this.calculateNewSalary(
      user.currentSalary,
      compensationData,
    );

    // Update compensation in finance system
    await this.financeService.updateEmployeeCompensation({
      employeeId: promotion.userId,
      newSalary,
      effectiveDate: promotion.effectiveDate,
      reason: 'PROMOTION',
      previousSalary: user.currentSalary,
      newPosition: promotion.targetPosition,
    });

    // Update budget allocations
    await this.financeService.updateDepartmentBudget({
      departmentId: user.departmentId,
      salaryIncrease: newSalary - user.currentSalary,
      effectiveDate: promotion.effectiveDate,
    });
  }

  private calculateNewSalary(
    currentSalary: number,
    compensationData: CompensationData,
  ): number {
    const minSalary = compensationData.minSalary;
    const maxSalary = compensationData.maxSalary;
    const midpoint = (minSalary + maxSalary) / 2;

    // Calculate based on performance and experience
    const performanceMultiplier = 1.1; // 10% increase for good performance
    const experienceMultiplier = 1.05; // 5% increase for experience

    let newSalary =
      currentSalary * performanceMultiplier * experienceMultiplier;

    // Ensure within range
    return Math.max(minSalary, Math.min(maxSalary, newSalary));
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                 | Employee | Manager | HR Manager | Admin |
| -------------------------- | -------- | ------- | ---------- | ----- |
| `hr:performance:own`       | ✅       | ✅      | ✅         | ✅    |
| `hr:performance:team`      | ❌       | ✅      | ✅         | ✅    |
| `hr:performance:all`       | ❌       | ❌      | ✅         | ✅    |
| `hr:performance:calibrate` | ❌       | ❌      | ✅         | ✅    |
| `hr:okr:own`               | ✅       | ✅      | ✅         | ✅    |
| `hr:okr:team`              | ❌       | ✅      | ✅         | ✅    |
| `hr:okr:company`           | ❌       | ❌      | ✅         | ✅    |
| `hr:skills:own`            | ✅       | ✅      | ✅         | ✅    |
| `hr:skills:team`           | ❌       | ✅      | ✅         | ✅    |
| `hr:career:own`            | ✅       | ✅      | ✅         | ✅    |
| `hr:career:team`           | ❌       | ✅      | ✅         | ✅    |
| `hr:promotion:request`     | ✅       | ✅      | ✅         | ✅    |
| `hr:promotion:approve`     | ❌       | ✅      | ✅         | ✅    |

### Data Protection Measures

#### Performance Data Encryption

```typescript
@Injectable()
export class PerformanceDataProtection {
  async encryptSensitiveData(
    review: PerformanceReview,
  ): Promise<PerformanceReview> {
    const sensitiveFields = [
      'selfAssessment',
      'managerFeedback',
      'peerFeedback',
    ];
    const encrypted = { ...review };

    for (const field of sensitiveFields) {
      if (review[field]) {
        encrypted[field] = await this.encrypt(review[field]);
      }
    }

    return encrypted;
  }

  async decryptSensitiveData(
    encrypted: PerformanceReview,
  ): Promise<PerformanceReview> {
    const sensitiveFields = [
      'selfAssessment',
      'managerFeedback',
      'peerFeedback',
    ];
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

# Environment setup
cp .env.example .env
# Configure environment variables
```

#### Database Setup

```bash
# Create database
createdb blih_hr_performance

# Run migrations
npm run migration:run

# Seed data
npm run seed:performance
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class PerformanceReviewService {
  constructor(
    @InjectRepository(PerformanceReview)
    private reviewRepository: Repository<PerformanceReview>,
    private ratingService: PerformanceRatingService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  async createReview(
    createDto: CreateReviewDto,
    userId: string,
  ): Promise<PerformanceReview> {
    // Validate review period
    await this.validateReviewPeriod(createDto.reviewPeriod, createDto.userId);

    // Create review
    const review = this.reviewRepository.create({
      ...createDto,
      status: 'DRAFT',
      createdAt: new Date(),
    });

    const savedReview = await this.reviewRepository.save(review);

    // Send notifications
    await this.notificationService.sendReviewCreationNotification(savedReview);

    // Audit log
    await this.auditService.logAction('CREATE', savedReview.id, userId);

    return savedReview;
  }
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('PerformanceRatingService', () => {
  let service: PerformanceRatingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PerformanceRatingService],
    }).compile();

    service = module.get<PerformanceRatingService>(PerformanceRatingService);
  });

  describe('calculateOverallRating', () => {
    it('should calculate weighted rating correctly', async () => {
      const review = createMockReview();
      const result = await service.calculateOverallRating(review);

      expect(result.overallRating).toBeGreaterThan(0);
      expect(result.overallRating).toBeLessThanOrEqual(5);
      expect(result.breakdown).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0);
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
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_performance
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=performance-service

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# Security
PERFORMANCE_DATA_KEY=your-encryption-key
JWT_SECRET=your-jwt-secret

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

#### Rating Calculation Issues

**Problem:** Inconsistent rating calculations

```
Expected: 4.2, Actual: 3.8
```

**Solutions:**

1. Check weight configuration
2. Verify calibration curves
3. Review feedback data quality

#### OKR Alignment Issues

**Problem:** Low alignment scores

```
Expected: 85%, Actual: 45%
```

**Solutions:**

1. Review cascading logic
2. Check key result definitions
3. Update alignment criteria

#### Skill Gap Analysis Issues

**Problem:** Inaccurate skill recommendations

```
Expected: Relevant courses, Actual: Irrelevant courses
```

**Solutions:**

1. Update skill taxonomy
2. Improve course matching algorithm
3. Add user preference filtering

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_performance_reviews_user_period
ON performance_reviews(user_id, review_period);

CREATE INDEX CONCURRENTLY idx_okrs_user_quarter
ON okrs(user_id, year, quarter);

-- Partition large tables
CREATE TABLE performance_reviews_2026 PARTITION OF performance_reviews
FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

#### Caching Strategy

```typescript
@Injectable()
export class PerformanceCacheService {
  async getPerformanceData(userId: string): Promise<PerformanceData> {
    const cacheKey = `performance:data:${userId}`;

    let data = await this.cacheManager.get<PerformanceData>(cacheKey);
    if (!data) {
      data = await this.loadPerformanceData(userId);
      await this.cacheManager.set(cacheKey, data, 3600); // 1 hour
    }

    return data;
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Performance & Career Development System.
