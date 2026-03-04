# HR Employee Relations & Offboarding System Documentation

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

The HR Employee Relations & Offboarding System manages employee engagement, recognition, feedback mechanisms, and structured offboarding processes. This system ensures positive employee experiences throughout their lifecycle while maintaining compliance with labor regulations and providing valuable insights for organizational improvement.

### Key Features

- **Employee Recognition:** Multi-level recognition programs with peer nominations and automated rewards
- **Pulse Surveys:** Regular feedback collection with sentiment analysis and trend tracking
- **Complaint Management:** Confidential reporting and investigation workflows with resolution tracking
- **Offboarding Workflows:** Structured exit processes with task automation and knowledge transfer
- **Analytics Dashboard:** Engagement metrics, turnover analysis, and satisfaction trends

### Business Objectives

- Achieve 85%+ employee satisfaction scores
- Maintain 90%+ recognition program participation
- Resolve 95%+ complaints within 30 days
- Ensure 100% compliant offboarding processes

---

## Architecture

### System Components

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[Employee Portal]
        B[Manager Dashboard]
        C[HR Console]
        D[Analytics Dashboard]
    end

    subgraph "API Layer"
        E[Recognition API]
        F[Survey API]
        G[Complaint API]
        H[Offboarding API]
    end

    subgraph "Service Layer"
        I[Recognition Service]
        J[Survey Service]
        K[Complaint Service]
        L[Offboarding Service]
        M[Analytics Service]
    end

    subgraph "Processing Layer"
        N[Sentiment Analyzer]
        O[Recognition Engine]
        P[Investigation Tracker]
        Q[Task Generator]
    end

    subgraph "Data Layer"
        R[PostgreSQL Database]
        S[Redis Cache]
        T[File Storage]
    end

    subgraph "External Services"
        U[Keycloak Auth]
        V[Email Service]
        W[Finance System]
        X[Attendance System]
    end

    A --> E
    B --> F
    C --> G
    D --> H
    E --> I
    F --> J
    G --> K
    H --> L
    I --> O
    J --> N
    K --> P
    L --> Q
    O --> R
    N --> R
    P --> R
    Q --> R
    I --> U
    J --> V
    K --> V
    L --> W
    L --> X
```

### Component Responsibilities

| Component           | Responsibility                            | Key Technologies                 |
| ------------------- | ----------------------------------------- | -------------------------------- |
| Recognition Service | Employee recognition programs and rewards | Gamification, Points System      |
| Survey Service      | Pulse surveys and feedback collection     | Sentiment Analysis, Analytics    |
| Complaint Service   | Complaint handling and investigation      | Workflow Engine, Case Management |
| Offboarding Service | Exit processes and knowledge transfer     | Task Automation, Coordination    |
| Analytics Service   | Engagement insights and reporting         | Data Visualization, ML Analytics |

---

## Database Schema

### Core Tables

#### EmployeeRecognition

```sql
CREATE TABLE employee_recognitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nominator_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nominee_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Recognition details
    recognition_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Company values alignment
    values_aligned TEXT[],
    impact_level VARCHAR(50),
    business_impact TEXT,

    -- Approval workflow
    status VARCHAR(50) DEFAULT 'PENDING',
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP,
    rejection_reason TEXT,

    -- Rewards and points
    points_awarded INTEGER DEFAULT 0,
    reward_type VARCHAR(50),
    reward_value DECIMAL(10,2),
    reward_issued_at TIMESTAMP,

    -- Visibility and sharing
    is_public BOOLEAN DEFAULT true,
    shared_channels TEXT[],
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_recognitions_nominee ON employee_recognitions(nominee_id, created_at);
CREATE INDEX idx_recognitions_nominator ON employee_recognitions(nominator_id, created_at);
CREATE INDEX idx_recognitions_status ON employee_recognitions(status, created_at);
CREATE INDEX idx_recognitions_type ON employee_recognitions(recognition_type, created_at);
```

#### PulseSurvey

```sql
CREATE TABLE pulse_surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Survey details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    survey_type VARCHAR(50) NOT NULL,
    frequency VARCHAR(50),

    -- Target audience
    target_audience JSONB,
    department_filter UUID[],
    level_filter VARCHAR(50)[],

    -- Timeline
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    reminder_schedule JSONB,

    -- Questions and structure
    questions JSONB NOT NULL,
    question_categories JSONB,
    anonymous_allowed BOOLEAN DEFAULT true,

    -- Status and analytics
    status VARCHAR(50) DEFAULT 'DRAFT',
    response_count INTEGER DEFAULT 0,
    completion_rate FLOAT DEFAULT 0,
    average_score FLOAT,

    -- Sentiment analysis
    sentiment_score FLOAT,
    sentiment_breakdown JSONB,
    key_themes TEXT[],

    -- Metadata
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_surveys_status ON pulse_surveys(status, start_date);
CREATE INDEX idx_surveys_type ON pulse_surveys(survey_type, created_at);
CREATE INDEX idx_surveys_dates ON pulse_surveys(start_date, end_date);
```

#### SurveyResponse

```sql
CREATE TABLE survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID REFERENCES pulse_surveys(id) ON DELETE CASCADE,
    respondent_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Response data
    answers JSONB NOT NULL,
    response_time INTEGER, -- in seconds
    completion_percentage FLOAT DEFAULT 0,

    -- Sentiment and feedback
    sentiment_score FLOAT,
    emotional_tone VARCHAR(50),
    additional_feedback TEXT,

    -- Privacy and anonymity
    is_anonymous BOOLEAN DEFAULT false,
    anonymized_id VARCHAR(255),

    -- Metadata
    ip_address INET,
    user_agent TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(survey_id, respondent_id)
);

CREATE INDEX idx_survey_responses_survey ON survey_responses(survey_id, completed_at);
CREATE INDEX idx_survey_responses_respondent ON survey_responses(respondent_id, created_at);
CREATE INDEX idx_survey_responses_sentiment ON survey_responses(sentiment_score);
```

#### Complaint

```sql
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complainant_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Complaint details
    complaint_type VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    -- Parties involved
    accused_parties JSONB,
    witnesses JSONB,

    -- Evidence and documentation
    evidence_files TEXT[],
    supporting_documents TEXT[],

    -- Investigation workflow
    status VARCHAR(50) DEFAULT 'SUBMITTED',
    assigned_investigator UUID REFERENCES users(id),
    investigation_start_date TIMESTAMP,
    investigation_deadline TIMESTAMP,

    -- Resolution details
    findings TEXT,
    resolution VARCHAR(50),
    actions_taken JSONB,
    follow_up_required BOOLEAN DEFAULT false,

    -- Confidentiality and privacy
    confidentiality_level VARCHAR(50) DEFAULT 'CONFIDENTIAL',
    access_log JSONB,

    -- Timeline
    submitted_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_complaints_status ON complaints(status, submitted_at);
CREATE INDEX idx_complaints_complainant ON complaints(complainant_id, submitted_at);
CREATE INDEX idx_complaints_investigator ON complaints(assigned_investigator, status);
CREATE INDEX idx_complaints_severity ON complaints(severity, status);
```

#### OffboardingChecklist

```sql
CREATE TABLE offboarding_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Offboarding details
    resignation_date DATE NOT NULL,
    last_working_day DATE NOT NULL,
    reason_for_leaving VARCHAR(255),
    exit_type VARCHAR(50),

    -- Checklist items
    checklist_items JSONB NOT NULL,
    completed_items JSONB DEFAULT '[]',
    pending_items JSONB DEFAULT '[]',

    -- Department responsibilities
    hr_tasks JSONB,
    it_tasks JSONB,
    finance_tasks JSONB,
    manager_tasks JSONB,

    -- Knowledge transfer
    knowledge_transfer_plan JSONB,
    handover_documents TEXT[],
    replacement_training JSONB,

    -- Asset return
    assets_to_return JSONB,
    returned_assets JSONB,
    asset_return_status VARCHAR(50),

    -- Final settlements
    final_payroll_processed BOOLEAN DEFAULT false,
    benefits_termination JSONB,
    exit_interview_completed BOOLEAN DEFAULT false,

    -- Status and progress
    status VARCHAR(50) DEFAULT 'INITIATED',
    completion_percentage FLOAT DEFAULT 0,
    estimated_completion_date DATE,

    -- Metadata
    initiated_by UUID REFERENCES users(id),
    hr_coordinator UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_offboarding_employee ON offboarding_checklists(employee_id, status);
CREATE INDEX idx_offboarding_dates ON offboarding_checklists(last_working_day, status);
CREATE INDEX idx_offboarding_coordinator ON offboarding_checklists(hr_coordinator, status);
```

#### ExitInterview

```sql
CREATE TABLE exit_interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID REFERENCES users(id) ON DELETE CASCADE,

    -- Interview details
    interview_date TIMESTAMP NOT NULL,
    interviewer_id UUID REFERENCES users(id),
    interview_method VARCHAR(50),

    -- Interview responses
    departure_reasons JSONB,
    satisfaction_scores JSONB,
    improvement_suggestions TEXT[],
    would_recommend BOOLEAN,
    would_rehire BOOLEAN,

    -- Open feedback
    best_experience TEXT,
    worst_experience TEXT,
    management_feedback TEXT,
    culture_feedback TEXT,

    -- Follow-up actions
    action_items JSONB,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,

    -- Analytics and insights
    sentiment_analysis JSONB,
    key_themes TEXT[],
    risk_level VARCHAR(50),

    -- Privacy and consent
    feedback_sharing_consent BOOLEAN DEFAULT false,
    anonymous_feedback BOOLEAN DEFAULT true,

    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_exit_interviews_employee ON exit_interviews(employee_id, interview_date);
CREATE INDEX idx_exit_interviews_interviewer ON exit_interviews(interviewer_id, interview_date);
CREATE INDEX idx_exit_interviews_sentiment ON exit_interviews(sentiment_analysis);
```

### Entity Relationships

```mermaid
erDiagram
    EmployeeRecognition }o--|| User : "nominated by"
    EmployeeRecognition }o--|| User : "nominated"
    PulseSurvey ||--o{ SurveyResponse : "has responses"
    SurveyResponse }o--|| User : "responded by"
    Complaint }o--|| User : "filed by"
    Complaint }o--|| User : "investigated by"
    OffboardingChecklist }o--|| User : "belongs to"
    OffboardingChecklist }o--|| User : "coordinated by"
    ExitInterview }o--|| User : "interviewed"
    ExitInterview }o--|| User : "conducted by"
```

---

## API Endpoints

### Recognition Endpoints

#### POST /api/hr/relations/recognition/nominate

Submit recognition nomination.

**Request Body:**

```json
{
  "nomineeId": "uuid",
  "recognitionType": "PEER_TO_PEER",
  "category": "TEAMWORK",
  "title": "Excellent collaboration on project X",
  "description": "Went above and beyond to help team meet deadline",
  "valuesAligned": ["COLLABORATION", "EXCELLENCE"],
  "impactLevel": "TEAM",
  "businessImpact": "Helped secure client renewal through dedicated effort",
  "isPublic": true
}
```

**Response:**

```json
{
  "id": "uuid",
  "nominatorId": "uuid",
  "nomineeId": "uuid",
  "recognitionType": "PEER_TO_PEER",
  "category": "TEAMWORK",
  "title": "Excellent collaboration on project X",
  "status": "PENDING",
  "pointsAwarded": 50,
  "createdAt": "2026-02-28T10:00:00Z"
}
```

#### PUT /api/hr/relations/recognition/:id/approve

Approve recognition nomination.

#### GET /api/hr/relations/recognition/leaderboard

Get recognition leaderboard.

#### GET /api/hr/relations/recognition/history

Get recognition history.

### Survey Endpoints

#### POST /api/hr/relations/surveys

Create new pulse survey.

**Request Body:**

```json
{
  "title": "Q1 Employee Engagement Survey",
  "description": "Help us understand your experience and improve our workplace",
  "surveyType": "ENGAGEMENT",
  "frequency": "QUARTERLY",
  "targetAudience": {
    "departments": ["all"],
    "levels": ["all"]
  },
  "startDate": "2026-03-01T09:00:00Z",
  "endDate": "2026-03-15T17:00:00Z",
  "questions": [
    {
      "id": "q1",
      "type": "LIKERT",
      "question": "I feel valued at work",
      "scale": 5
    },
    {
      "id": "q2",
      "type": "MULTIPLE_CHOICE",
      "question": "What would improve your work experience?",
      "options": [
        "Better communication",
        "More training",
        "Flexible hours",
        "Other"
      ]
    }
  ],
  "anonymousAllowed": true
}
```

#### POST /api/hr/relations/surveys/:id/respond

Submit survey response.

#### GET /api/hr/relations/surveys/:id/analytics

Get survey analytics and insights.

#### GET /api/hr/relations/surveys/dashboard

Get survey dashboard with trends.

### Complaint Endpoints

#### POST /api/hr/relations/complaints

File new complaint.

**Request Body:**

```json
{
  "complaintType": "HARASSMENT",
  "category": "WORKPLACE_CONDUCT",
  "severity": "HIGH",
  "title": "Inappropriate behavior in team meetings",
  "description": "Detailed description of the incident...",
  "accusedParties": [
    {
      "userId": "uuid",
      "role": "PRIMARY"
    }
  ],
  "witnesses": [
    {
      "userId": "uuid",
      "relationship": "COLLEAGUE"
    }
  ],
  "confidentialityLevel": "CONFIDENTIAL"
}
```

#### PUT /api/hr/relations/complaints/:id/investigate

Start investigation process.

#### PUT /api/hr/relations/complaints/:id/resolve

Resolve complaint with findings.

#### GET /api/hr/relations/complaints/dashboard

Get complaint management dashboard.

### Offboarding Endpoints

#### POST /api/hr/relations/offboarding/initiate

Initiate offboarding process.

**Request Body:**

```json
{
  "employeeId": "uuid",
  "resignationDate": "2026-03-15",
  "lastWorkingDay": "2026-03-31",
  "reasonForLeaving": "CAREER_ADVANCEMENT",
  "exitType": "VOLUNTARY",
  "initiatedBy": "uuid"
}
```

**Response:**

```json
{
  "id": "uuid",
  "employeeId": "uuid",
  "resignationDate": "2026-03-15",
  "lastWorkingDay": "2026-03-31",
  "status": "INITIATED",
  "checklistItems": {
    "hr": [
      {
        "id": "hr-1",
        "task": "Conduct exit interview",
        "dueDate": "2026-03-28",
        "assignedTo": "hr-manager-uuid",
        "status": "PENDING"
      }
    ],
    "it": [
      {
        "id": "it-1",
        "task": "Revoke system access",
        "dueDate": "2026-04-01",
        "assignedTo": "it-admin-uuid",
        "status": "PENDING"
      }
    ]
  },
  "completionPercentage": 0,
  "createdAt": "2026-02-28T10:00:00Z"
}
```

#### PUT /api/hr/relations/offboarding/:id/tasks/:taskId/complete

Complete offboarding task.

#### POST /api/hr/relations/offboarding/:id/exit-interview

Conduct exit interview.

#### GET /api/hr/relations/offboarding/dashboard

Get offboarding dashboard.

---

## Business Logic & Workflows

### Recognition Scoring Algorithm

```typescript
interface RecognitionScore {
  basePoints: number;
  multiplier: number;
  totalPoints: number;
  level: string;
  badges: string[];
}

@Injectable()
export class RecognitionScoringService {
  async calculateRecognitionScore(
    nomination: RecognitionNomination,
  ): Promise<RecognitionScore> {
    // Base points by recognition type
    const basePoints = this.getBasePoints(nomination.recognitionType);

    // Apply multipliers
    const impactMultiplier = this.getImpactMultiplier(nomination.impactLevel);
    const valueMultiplier = this.getValueMultiplier(nomination.valuesAligned);
    const frequencyMultiplier = await this.getFrequencyMultiplier(
      nomination.nomineeId,
    );

    // Calculate total
    const totalPoints = Math.round(
      basePoints * impactMultiplier * valueMultiplier * frequencyMultiplier,
    );

    // Determine level and badges
    const level = this.getRecognitionLevel(totalPoints);
    const badges = this.calculateBadges(nomination, totalPoints);

    return {
      basePoints,
      multiplier: impactMultiplier * valueMultiplier * frequencyMultiplier,
      totalPoints,
      level,
      badges,
    };
  }

  private getBasePoints(recognitionType: string): number {
    const pointsMap = {
      PEER_TO_PEER: 50,
      MANAGER_TO_EMPLOYEE: 75,
      TEAM_ACHIEVEMENT: 100,
      COMPANY_VALUES: 125,
      INNOVATION: 150,
      LEADERSHIP: 200,
    };

    return pointsMap[recognitionType] || 50;
  }

  private getImpactMultiplier(impactLevel: string): number {
    const multipliers = {
      INDIVIDUAL: 1.0,
      TEAM: 1.2,
      DEPARTMENT: 1.5,
      COMPANY: 2.0,
    };

    return multipliers[impactLevel] || 1.0;
  }

  private getValueMultiplier(values: string[]): number {
    const valueWeights = {
      EXCELLENCE: 1.1,
      INTEGRITY: 1.2,
      COLLABORATION: 1.1,
      INNOVATION: 1.3,
      CUSTOMER_FOCUS: 1.2,
      LEADERSHIP: 1.4,
    };

    return values.reduce((multiplier, value) => {
      return multiplier * (valueWeights[value] || 1.0);
    }, 1.0);
  }

  private async getFrequencyMultiplier(nomineeId: string): Promise<number> {
    const recentRecognitions = await this.getRecentRecognitions(nomineeId, 30); // Last 30 days

    if (recentRecognitions.length === 0) return 1.2; // First time bonus
    if (recentRecognitions.length <= 2) return 1.0;
    if (recentRecognitions.length <= 5) return 0.8;
    return 0.6; // High frequency penalty
  }

  private getRecognitionLevel(points: number): string {
    if (points >= 500) return 'PLATINUM';
    if (points >= 300) return 'GOLD';
    if (points >= 200) return 'SILVER';
    if (points >= 100) return 'BRONZE';
    return 'STARTER';
  }
}
```

### Sentiment Analysis Engine

```typescript
interface SentimentAnalysis {
  overallScore: number;
  emotionalTone: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  keyThemes: string[];
  confidence: number;
  emotions: EmotionScore[];
}

interface EmotionScore {
  emotion: string;
  score: number;
  intensity: number;
}

@Injectable()
export class SentimentAnalysisService {
  async analyzeText(text: string, context: string): Promise<SentimentAnalysis> {
    // Preprocess text
    const cleanedText = this.preprocessText(text);

    // Get sentiment from ML model
    const mlSentiment = await this.getMLSentiment(cleanedText);

    // Extract key themes
    const themes = await this.extractThemes(cleanedText, context);

    // Analyze emotions
    const emotions = await this.analyzeEmotions(cleanedText);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(mlSentiment, emotions);

    // Determine emotional tone
    const emotionalTone = this.determineEmotionalTone(overallScore);

    return {
      overallScore,
      emotionalTone,
      keyThemes: themes,
      confidence: mlSentiment.confidence,
      emotions,
    };
  }

  private preprocessText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async getMLSentiment(text: string): Promise<MLSentimentResult> {
    // Call external sentiment analysis API
    const response = await this.sentimentAPI.analyze({
      text,
      language: 'en',
      model: 'v2',
    });

    return {
      score: response.sentiment.score,
      confidence: response.confidence,
      positive: response.sentiment.positive,
      negative: response.sentiment.negative,
      neutral: response.sentiment.neutral,
    };
  }

  private async extractThemes(
    text: string,
    context: string,
  ): Promise<string[]> {
    // Use NLP to extract key themes
    const keywords = await this.nlpService.extractKeywords(text);

    // Filter themes based on context
    const contextThemes = this.getContextualThemes(context);
    const relevantThemes = keywords.filter((keyword) =>
      contextThemes.some((theme) => this.isThemeRelated(keyword, theme)),
    );

    return relevantThemes.slice(0, 5); // Top 5 themes
  }

  private async analyzeEmotions(text: string): Promise<EmotionScore[]> {
    const emotionAnalysis = await this.emotionAPI.analyze({
      text,
      emotions: ['joy', 'anger', 'fear', 'sadness', 'surprise', 'disgust'],
    });

    return emotionAnalysis.emotions.map((emotion) => ({
      emotion: emotion.name,
      score: emotion.score,
      intensity: emotion.intensity,
    }));
  }

  private calculateOverallScore(
    sentiment: MLSentimentResult,
    emotions: EmotionScore[],
  ): number {
    // Weight sentiment more heavily than individual emotions
    const sentimentWeight = 0.7;
    const emotionWeight = 0.3;

    // Calculate emotion score (positive emotions - negative emotions)
    const positiveEmotions = emotions
      .filter((e) => ['joy', 'surprise'].includes(e.emotion))
      .reduce((sum, e) => sum + e.score, 0);

    const negativeEmotions = emotions
      .filter((e) =>
        ['anger', 'fear', 'sadness', 'disgust'].includes(e.emotion),
      )
      .reduce((sum, e) => sum + e.score, 0);

    const emotionScore =
      (positiveEmotions - negativeEmotions) / emotions.length;

    return sentiment.score * sentimentWeight + emotionScore * emotionWeight;
  }
}
```

### Complaint Investigation Workflow

```typescript
@Injectable()
export class ComplaintInvestigationService {
  async initiateInvestigation(
    complaintId: string,
    investigatorId: string,
  ): Promise<InvestigationPlan> {
    const complaint = await this.complaintRepository.findById(complaintId);

    // Validate investigator assignment
    await this.validateInvestigatorAssignment(investigatorId, complaint);

    // Create investigation plan
    const investigationPlan = await this.createInvestigationPlan(complaint);

    // Update complaint status
    await this.complaintRepository.update(complaintId, {
      status: 'UNDER_INVESTIGATION',
      assignedInvestigator: investigatorId,
      investigationStartDate: new Date(),
      investigationDeadline: this.calculateDeadline(complaint.severity),
    });

    // Notify parties
    await this.notifyInvestigationParties(complaint, investigatorId);

    // Schedule investigation tasks
    await this.scheduleInvestigationTasks(investigationPlan);

    return investigationPlan;
  }

  private async createInvestigationPlan(
    complaint: Complaint,
  ): Promise<InvestigationPlan> {
    const plan = new InvestigationPlan();

    // Evidence collection phase
    plan.addPhase({
      name: 'EVIDENCE_COLLECTION',
      duration: 7, // days
      tasks: [
        {
          title: 'Interview complainant',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 2),
        },
        {
          title: 'Interview accused parties',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 4),
        },
        {
          title: 'Interview witnesses',
          assignedTo: 'investigator',
          priority: 'MEDIUM',
          dueDate: addDays(new Date(), 6),
        },
        {
          title: 'Review documentary evidence',
          assignedTo: 'investigator',
          priority: 'MEDIUM',
          dueDate: addDays(new Date(), 7),
        },
      ],
    });

    // Analysis phase
    plan.addPhase({
      name: 'ANALYSIS',
      duration: 3,
      tasks: [
        {
          title: 'Analyze collected evidence',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 9),
        },
        {
          title: 'Prepare preliminary findings',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 10),
        },
      ],
    });

    // Resolution phase
    plan.addPhase({
      name: 'RESOLUTION',
      duration: 2,
      tasks: [
        {
          title: 'Finalize investigation report',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 11),
        },
        {
          title: 'Determine resolution actions',
          assignedTo: 'investigator',
          priority: 'HIGH',
          dueDate: addDays(new Date(), 12),
        },
      ],
    });

    return plan;
  }

  async completeInvestigation(
    complaintId: string,
    findings: InvestigationFindings,
  ): Promise<void> {
    const complaint = await this.complaintRepository.findById(complaintId);

    // Validate findings completeness
    await this.validateFindings(findings, complaint);

    // Determine resolution
    const resolution = await this.determineResolution(findings, complaint);

    // Update complaint with findings and resolution
    await this.complaintRepository.update(complaintId, {
      status: 'RESOLVED',
      findings: findings.summary,
      resolution: resolution.type,
      actionsTaken: resolution.actions,
      resolvedAt: new Date(),
    });

    // Implement resolution actions
    await this.implementResolutionActions(resolution.actions, complaint);

    // Schedule follow-up if required
    if (resolution.followUpRequired) {
      await this.scheduleFollowUp(complaintId, resolution.followUpDate);
    }

    // Notify all parties
    await this.notifyResolution(complaint, resolution);

    // Update analytics
    await this.updateComplaintAnalytics(complaint, resolution);
  }

  private async determineResolution(
    findings: InvestigationFindings,
    complaint: Complaint,
  ): Promise<Resolution> {
    const resolution = new Resolution();

    // Based on findings severity and evidence strength
    if (findings.evidenceStrength >= 0.8 && findings.severity === 'HIGH') {
      resolution.type = 'SUBSTANTIATED';
      resolution.actions = [
        'DISCIPLINARY_ACTION',
        'TRAINING_REQUIRED',
        'POLICY_REVIEW',
      ];
      resolution.followUpRequired = true;
      resolution.followUpDate = addMonths(new Date(), 3);
    } else if (findings.evidenceStrength >= 0.5) {
      resolution.type = 'PARTIALLY_SUBSTANTIATED';
      resolution.actions = ['COUNSELING', 'MONITORING'];
      resolution.followUpRequired = true;
      resolution.followUpDate = addMonths(new Date(), 1);
    } else {
      resolution.type = 'UNSUBSTANTIATED';
      resolution.actions = ['NO_ACTION'];
      resolution.followUpRequired = false;
    }

    return resolution;
  }
}
```

### Offboarding Task Generation

```typescript
@Injectable()
export class OffboardingTaskService {
  async generateOffboardingChecklist(
    employeeId: string,
  ): Promise<OffboardingChecklist> {
    const employee = await this.employeeService.findById(employeeId);

    // Generate department-specific tasks
    const hrTasks = await this.generateHRTasks(employee);
    const itTasks = await this.generateITTasks(employee);
    const financeTasks = await this.generateFinanceTasks(employee);
    const managerTasks = await this.generateManagerTasks(employee);

    // Create checklist
    const checklist = await this.offboardingRepository.create({
      employeeId,
      resignationDate: employee.resignationDate,
      lastWorkingDay: employee.lastWorkingDay,
      reasonForLeaving: employee.reasonForLeaving,
      exitType: employee.exitType,
      hrTasks,
      itTasks,
      financeTasks,
      managerTasks,
      status: 'INITIATED',
      initiatedBy: employee.initiatedBy,
      estimatedCompletionDate: this.calculateEstimatedCompletion(employee),
    });

    // Schedule automated reminders
    await this.scheduleTaskReminders(checklist);

    // Notify stakeholders
    await this.notifyOffboardingStakeholders(checklist);

    return checklist;
  }

  private async generateHRTasks(
    employee: Employee,
  ): Promise<OffboardingTask[]> {
    const tasks = [];

    // Exit interview
    tasks.push({
      id: 'hr-exit-interview',
      title: 'Conduct exit interview',
      description: 'Schedule and conduct exit interview with employee',
      assignedTo: this.getHRManagerId(),
      priority: 'HIGH',
      dueDate: addDays(employee.lastWorkingDay, -2),
      dependencies: [],
      automated: false,
    });

    // Final payroll
    tasks.push({
      id: 'hr-final-payroll',
      title: 'Process final payroll',
      description:
        'Calculate and process final salary, bonuses, and settlements',
      assignedTo: this.getPayrollProcessorId(),
      priority: 'HIGH',
      dueDate: employee.lastWorkingDay,
      dependencies: ['hr-timesheet-verification'],
      automated: true,
    });

    // Benefits termination
    tasks.push({
      id: 'hr-benefits-termination',
      title: 'Terminate benefits',
      description: 'Process health insurance, retirement, and other benefits',
      assignedTo: this.getBenefitsAdminId(),
      priority: 'MEDIUM',
      dueDate: addDays(employee.lastWorkingDay, 7),
      dependencies: ['hr-final-payroll'],
      automated: true,
    });

    // COBRA information
    if (employee.location === 'US') {
      tasks.push({
        id: 'hr-cobra-info',
        title: 'Send COBRA information',
        description: 'Provide COBRA continuation coverage information',
        assignedTo: this.getBenefitsAdminId(),
        priority: 'MEDIUM',
        dueDate: addDays(employee.lastWorkingDay, 14),
        dependencies: ['hr-benefits-termination'],
        automated: true,
      });
    }

    return tasks;
  }

  private async generateITTasks(
    employee: Employee,
  ): Promise<OffboardingTask[]> {
    const tasks = [];

    // Access revocation
    tasks.push({
      id: 'it-access-revocation',
      title: 'Revoke system access',
      description: 'Disable all system accounts and access permissions',
      assignedTo: this.getITAdminId(),
      priority: 'HIGH',
      dueDate: employee.lastWorkingDay,
      dependencies: [],
      automated: true,
    });

    // Email forwarding
    tasks.push({
      id: 'it-email-forwarding',
      title: 'Setup email forwarding',
      description: 'Forward employee email to manager or replacement',
      assignedTo: this.getITAdminId(),
      priority: 'MEDIUM',
      dueDate: employee.lastWorkingDay,
      dependencies: ['it-access-revocation'],
      automated: true,
    });

    // Device return
    tasks.push({
      id: 'it-device-return',
      title: 'Collect company devices',
      description: 'Retrieve laptop, phone, and other company equipment',
      assignedTo: this.getITAdminId(),
      priority: 'HIGH',
      dueDate: employee.lastWorkingDay,
      dependencies: [],
      automated: false,
    });

    // Data backup
    tasks.push({
      id: 'it-data-backup',
      title: 'Backup employee data',
      description: 'Backup important work files and documents',
      assignedTo: this.getITAdminId(),
      priority: 'MEDIUM',
      dueDate: addDays(employee.lastWorkingDay, -1),
      dependencies: [],
      automated: true,
    });

    return tasks;
  }

  private async generateFinanceTasks(
    employee: Employee,
  ): Promise<OffboardingTask[]> {
    const tasks = [];

    // Expense reconciliation
    tasks.push({
      id: 'finance-expense-reconciliation',
      title: 'Reconcile expenses',
      description: 'Process and approve any pending expense claims',
      assignedTo: this.getFinanceManagerId(),
      priority: 'MEDIUM',
      dueDate: addDays(employee.lastWorkingDay, -3),
      dependencies: [],
      automated: false,
    });

    // Company card cancellation
    if (employee.hasCompanyCard) {
      tasks.push({
        id: 'finance-card-cancellation',
        title: 'Cancel company credit card',
        description: 'Block and cancel company credit card',
        assignedTo: this.getFinanceAdminId(),
        priority: 'HIGH',
        dueDate: employee.lastWorkingDay,
        dependencies: [],
        automated: true,
      });
    }

    return tasks;
  }

  private async generateManagerTasks(
    employee: Employee,
  ): Promise<OffboardingTask[]> {
    const tasks = [];

    // Knowledge transfer
    tasks.push({
      id: 'mgr-knowledge-transfer',
      title: 'Facilitate knowledge transfer',
      description: 'Ensure proper handover of responsibilities and knowledge',
      assignedTo: employee.managerId,
      priority: 'HIGH',
      dueDate: addDays(employee.lastWorkingDay, -5),
      dependencies: [],
      automated: false,
    });

    // Team announcement
    tasks.push({
      id: 'mgr-team-announcement',
      title: 'Announce departure to team',
      description: 'Inform team about employee departure and transition plan',
      assignedTo: employee.managerId,
      priority: 'MEDIUM',
      dueDate: addDays(employee.lastWorkingDay, -7),
      dependencies: [],
      automated: false,
    });

    // Performance review
    tasks.push({
      id: 'mgr-final-review',
      title: 'Complete final performance review',
      description: 'Provide final performance feedback and evaluation',
      assignedTo: employee.managerId,
      priority: 'MEDIUM',
      dueDate: addDays(employee.lastWorkingDay, -2),
      dependencies: ['mgr-knowledge-transfer'],
      automated: false,
    });

    return tasks;
  }
}
```

---

## Integration Points

### Internal System Integrations

#### Employee Profile Integration

```typescript
@Injectable()
export class RelationsEmployeeService {
  async syncEmployeeData(userId: string): Promise<void> {
    const employee = await this.employeeService.findById(userId);

    // Update recognition eligibility
    await this.updateRecognitionEligibility(userId, employee);

    // Update survey participation
    await this.updateSurveyParticipation(userId, employee);

    // Update complaint access rights
    await this.updateComplaintAccess(userId, employee);

    // Update offboarding requirements
    await this.updateOffboardingRequirements(userId, employee);
  }

  private async updateRecognitionEligibility(
    userId: string,
    employee: Employee,
  ): Promise<void> {
    const eligibility = {
      canNominate: employee.status === 'ACTIVE',
      canBeNominated: employee.status === 'ACTIVE',
      nominationLimit: this.getNominationLimit(employee.level),
      recognitionTypes: this.getEligibleRecognitionTypes(employee.role),
    };

    await this.recognitionService.updateEligibility(userId, eligibility);
  }
}
```

#### Attendance System Integration

```typescript
@Injectable()
export class RelationsAttendanceService {
  async handleEmployeeResignation(
    userId: string,
    lastWorkingDay: Date,
  ): Promise<void> {
    // Update attendance records
    await this.attendanceService.markAsTerminated(userId, lastWorkingDay);

    // Cancel future attendance requirements
    await this.attendanceService.cancelFutureRequirements(userId);

    // Generate attendance report for final period
    const attendanceReport = await this.attendanceService.generateFinalReport(
      userId,
      lastWorkingDay,
    );

    // Attach to offboarding checklist
    await this.offboardingService.attachDocument(
      userId,
      'attendance-report',
      attendanceReport,
    );
  }
}
```

### External System Integrations

#### Email Service Integration

```typescript
@Injectable()
export class RelationsNotificationService {
  async sendRecognitionNotification(
    recognition: EmployeeRecognition,
  ): Promise<void> {
    const nominee = await this.userService.findById(recognition.nomineeId);
    const nominator = await this.userService.findById(recognition.nominatorId);

    // Send notification to nominee
    await this.emailService.send({
      to: nominee.email,
      template: 'RECOGNITION_RECEIVED',
      data: {
        nomineeName: nominee.firstName,
        nominatorName: `${nominator.firstName} ${nominator.lastName}`,
        recognitionTitle: recognition.title,
        pointsAwarded: recognition.pointsAwarded,
        recognitionUrl: this.getRecognitionUrl(recognition.id),
      },
    });

    // Send notification to nominee's manager
    if (nominee.managerId) {
      const manager = await this.userService.findById(nominee.managerId);
      await this.emailService.send({
        to: manager.email,
        template: 'TEAM_RECOGNITION',
        data: {
          managerName: manager.firstName,
          nomineeName: nominee.firstName,
          nominatorName: `${nominator.firstName} ${nominator.lastName}`,
          recognitionTitle: recognition.title,
        },
      });
    }

    // Post to company channels if public
    if (recognition.isPublic) {
      await this.postToRecognitionChannels(recognition);
    }
  }

  async sendSurveyInvitations(survey: PulseSurvey): Promise<void> {
    const targetEmployees = await this.getTargetEmployees(survey);

    for (const employee of targetEmployees) {
      await this.emailService.send({
        to: employee.email,
        template: 'SURVEY_INVITATION',
        data: {
          employeeName: employee.firstName,
          surveyTitle: survey.title,
          surveyDescription: survey.description,
          surveyUrl: this.getSurveyUrl(survey.id, employee.id),
          deadline: survey.endDate,
          estimatedTime: this.getEstimatedTime(survey.questions),
          isAnonymous: survey.anonymousAllowed,
        },
      });
    }

    // Schedule reminders
    await this.scheduleSurveyReminders(survey, targetEmployees);
  }
}
```

---

## Security & Permissions

### Permission Matrix

| Permission                           | Employee | Manager   | HR Manager | Admin |
| ------------------------------------ | -------- | --------- | ---------- | ----- |
| `hr:relations:recognition:nominate`  | ✅       | ✅        | ✅         | ✅    |
| `hr:relations:recognition:approve`   | ❌       | ✅        | ✅         | ✅    |
| `hr:relations:survey:respond`        | ✅       | ✅        | ✅         | ✅    |
| `hr:relations:survey:create`         | ❌       | ❌        | ✅         | ✅    |
| `hr:relations:survey:analytics`      | ❌       | ✅ (team) | ✅         | ✅    |
| `hr:relations:complaint:file`        | ✅       | ✅        | ✅         | ✅    |
| `hr:relations:complaint:investigate` | ❌       | ❌        | ✅         | ✅    |
| `hr:relations:complaint:access`      | ❌       | ❌        | ✅         | ✅    |
| `hr:relations:offboarding:initiate`  | ❌       | ✅        | ✅         | ✅    |
| `hr:relations:offboarding:manage`    | ❌       | ✅ (team) | ✅         | ✅    |

### Data Protection Measures

#### Anonymous Survey Handling

```typescript
@Injectable()
export class SurveyPrivacyService {
  async anonymizeResponse(
    response: SurveyResponse,
  ): Promise<AnonymousResponse> {
    // Generate anonymous ID
    const anonymousId = this.generateAnonymousId(
      response.surveyId,
      response.respondentId,
    );

    // Remove personally identifiable information
    const anonymized = {
      id: response.id,
      surveyId: response.surveyId,
      anonymousId,
      answers: response.answers,
      responseTime: response.responseTime,
      completionPercentage: response.completionPercentage,
      sentimentScore: response.sentimentScore,
      emotionalTone: response.emotionalTone,
      additionalFeedback: this.sanitizeFeedback(response.additionalFeedback),
      completedAt: response.completedAt,
    };

    return anonymized;
  }

  private generateAnonymousId(surveyId: string, respondentId: string): string {
    const combined = `${surveyId}:${respondentId}:${new Date().toISOString()}`;
    return crypto
      .createHash('sha256')
      .update(combined)
      .digest('hex')
      .substring(0, 16);
  }

  private sanitizeFeedback(feedback: string): string {
    // Remove potential PII
    return feedback
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]') // Phone numbers
      .replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL]',
      ) // Emails
      .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, '[DATE]'); // Dates
  }
}
```

#### Complaint Confidentiality

```typescript
@Injectable()
export class ComplaintSecurityService {
  async grantComplaintAccess(
    userId: string,
    complaintId: string,
    accessLevel: string,
  ): Promise<void> {
    const complaint = await this.complaintRepository.findById(complaintId);

    // Validate access request
    await this.validateAccessRequest(userId, complaint, accessLevel);

    // Log access
    await this.logComplaintAccess(userId, complaintId, accessLevel);

    // Grant temporary access
    const accessKey = this.generateAccessKey(userId, complaintId, accessLevel);
    await this.cacheManager.set(
      `complaint-access:${accessKey}`,
      { userId, complaintId, accessLevel, grantedAt: new Date() },
      3600, // 1 hour
    );

    return accessKey;
  }

  private async validateAccessRequest(
    userId: string,
    complaint: Complaint,
    accessLevel: string,
  ): Promise<void> {
    const user = await this.userService.findById(userId);

    // Check if user has permission
    const hasPermission = await this.permissionService.hasPermission(
      userId,
      `hr:relations:complaint:${accessLevel}`,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'Insufficient permissions for complaint access',
      );
    }

    // Check confidentiality level
    if (
      complaint.confidentialityLevel === 'HIGHLY_CONFIDENTIAL' &&
      !user.roles.includes('HR_DIRECTOR')
    ) {
      throw new ForbiddenException(
        'Access to highly confidential complaints restricted',
      );
    }

    // Check if user is involved
    const isInvolved = this.isUserInvolved(userId, complaint);
    if (isInvolved && accessLevel !== 'OWN') {
      throw new ForbiddenException('Involved parties have limited access');
    }
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
createdb blih_hr_relations

# Run migrations
npm run migration:run

# Seed data
npm run seed:relations
```

### Code Organization Patterns

#### Service Layer Structure

```typescript
@Injectable()
export class RecognitionService {
  constructor(
    @InjectRepository(EmployeeRecognition)
    private recognitionRepository: Repository<EmployeeRecognition>,
    private scoringService: RecognitionScoringService,
    private notificationService: NotificationService,
    private auditService: AuditService,
  ) {}

  async nominateEmployee(
    nominationDto: NominationDto,
    nominatorId: string,
  ): Promise<EmployeeRecognition> {
    // Validate nomination
    await this.validateNomination(nominationDto, nominatorId);

    // Calculate recognition score
    const score = await this.scoringService.calculateRecognitionScore({
      ...nominationDto,
      nominatorId,
    });

    // Create recognition
    const recognition = this.recognitionRepository.create({
      ...nominationDto,
      nominatorId,
      pointsAwarded: score.totalPoints,
      status: 'PENDING',
    });

    const savedRecognition = await this.recognitionRepository.save(recognition);

    // Send notifications
    await this.notificationService.sendNominationNotifications(
      savedRecognition,
    );

    // Audit log
    await this.auditService.logAction(
      'RECOGNITION_NOMINATED',
      savedRecognition.id,
      nominatorId,
    );

    return savedRecognition;
  }
}
```

---

## Testing Procedures

### Unit Testing Example

```typescript
describe('RecognitionScoringService', () => {
  let service: RecognitionScoringService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [RecognitionScoringService],
    }).compile();

    service = module.get<RecognitionScoringService>(RecognitionScoringService);
  });

  describe('calculateRecognitionScore', () => {
    it('should calculate correct points for peer recognition', async () => {
      const nomination = {
        recognitionType: 'PEER_TO_PEER',
        impactLevel: 'TEAM',
        valuesAligned: ['EXCELLENCE', 'COLLABORATION'],
      };

      const result = await service.calculateRecognitionScore(nomination);

      expect(result.basePoints).toBe(50);
      expect(result.totalPoints).toBeGreaterThan(50);
      expect(result.level).toBeDefined();
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
DATABASE_URL=postgresql://user:password@localhost:5432/blih_hr_relations
DATABASE_SSL=true

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Authentication
KEYCLOAK_URL=https://keycloak.example.com
KEYCLOAK_REALM=blih-hr
KEYCLOAK_CLIENT_ID=relations-service

# Email Service
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=hr@example.com
SMTP_PASS=smtp-password

# Sentiment Analysis
SENTIMENT_API_KEY=your-sentiment-api-key
SENTIMENT_API_URL=https://api.sentiment.com

# Security
COMPLAINT_ENCRYPTION_KEY=your-complaint-key
ANONYMIZATION_SALT=your-salt

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

#### Recognition Scoring Issues

**Problem:** Inconsistent point calculations

```
Expected: 75 points, Actual: 60 points
```

**Solutions:**

1. Check multiplier configurations
2. Verify frequency calculations
3. Review value alignment weights

#### Survey Response Issues

**Problem:** Low survey completion rates

```
Expected: 80%, Actual: 45%
```

**Solutions:**

1. Improve survey design
2. Send reminder notifications
3. Reduce survey length

#### Complaint Workflow Issues

**Problem:** Investigation delays

```
Expected: 14 days, Actual: 30+ days
```

**Solutions:**

1. Review investigator workload
2. Automate evidence collection
3. Set up escalation triggers

### Performance Optimization

#### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX CONCURRENTLY idx_recognitions_nominee_date
ON employee_recognitions(nominee_id, created_at);

CREATE INDEX CONCURRENTLY idx_complaints_status_severity
ON complaints(status, severity);

-- Partition large tables
CREATE TABLE survey_responses_2026_q1 PARTITION OF survey_responses
FOR VALUES FROM ('2026-01-01') TO ('2026-04-01');
```

#### Caching Strategy

```typescript
@Injectable()
export class RelationsCacheService {
  async getRecognitionLeaderboard(period: string): Promise<LeaderboardEntry[]> {
    const cacheKey = `recognition:leaderboard:${period}`;

    let leaderboard = await this.cacheManager.get<LeaderboardEntry[]>(cacheKey);
    if (!leaderboard) {
      leaderboard = await this.calculateLeaderboard(period);
      await this.cacheManager.set(cacheKey, leaderboard, 3600); // 1 hour
    }

    return leaderboard;
  }
}
```

This comprehensive documentation provides complete technical guidance for implementing and maintaining the HR Employee Relations & Offboarding System.
