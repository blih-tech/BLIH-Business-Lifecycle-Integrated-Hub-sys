-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED', 'PENDING');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('EMAIL', 'WEBHOOK', 'IN_APP');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY');

-- CreateEnum
CREATE TYPE "PayFrequency" AS ENUM ('MONTHLY', 'BIWEEKLY', 'WEEKLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "LifecycleStatus" AS ENUM ('ONBOARDING', 'ACTIVE', 'SUSPENDED', 'ON_LEAVE', 'TERMINATED', 'RESIGNED', 'RETIRED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "MaritalStatus" AS ENUM ('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CONTRACT', 'ID', 'CERTIFICATE', 'MEDICAL', 'RESUME', 'POLICY_ACK', 'QUALIFICATION', 'OTHER');

-- CreateEnum
CREATE TYPE "JobWorkflowStatus" AS ENUM ('DRAFT', 'PENDING_FOR_APPROVAL', 'READY_TO_POST', 'PUBLISHED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobPriority" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "JobStageApprovalStatus" AS ENUM ('PENDING_FOR_APPROVAL', 'REQUEST_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "JobApprovalDepartment" AS ENUM ('FINANCE', 'GM', 'HR');

-- CreateEnum
CREATE TYPE "JobApprovalStage" AS ENUM ('FINANCE', 'GM', 'HR_REVIEW');

-- CreateEnum
CREATE TYPE "JobSalaryMode" AS ENUM ('NOT_SPECIFIED', 'FIXED', 'NEGOTIABLE', 'COMPETITIVE');

-- CreateEnum
CREATE TYPE "JobRequestType" AS ENUM ('NEW', 'REPLACEMENT');

-- CreateEnum
CREATE TYPE "JobUrgency" AS ENUM ('HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "JobApplicationFieldType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'FILE', 'DATE', 'CHECKBOX');

-- CreateEnum
CREATE TYPE "JobApplicantOptionalFieldKey" AS ENUM ('FIRST_NAME', 'LAST_NAME', 'EMAIL', 'PHONE', 'RESUME_URL', 'LINKEDIN_URL', 'PORTFOLIO_URL', 'GITHUB_URL', 'CURRENT_COMPANY', 'YEARS_OF_EXPERIENCE', 'EXPECTED_SALARY', 'COVER_LETTER');

-- CreateEnum
CREATE TYPE "JobApplicationFormSectionKey" AS ENUM ('EDUCATION', 'EXPERIENCE');

-- CreateEnum
CREATE TYPE "JobContractType" AS ENUM ('PERMANENT', 'CONTRACT', 'INTERNSHIP', 'FREELANCE');

-- CreateEnum
CREATE TYPE "WorkLocationType" AS ENUM ('ON_SITE', 'HYBRID', 'REMOTE');

-- CreateEnum
CREATE TYPE "RemoteScope" AS ENUM ('CITY', 'COUNTRY', 'REGION', 'GLOBAL');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL');

-- CreateEnum
CREATE TYPE "CandidateSource" AS ENUM ('COMPANY_SITE', 'LINKEDIN', 'TELEGRAM', 'REFERRAL', 'AGENCY');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('APPLIED', 'SCREENING', 'SHORTLISTED', 'INTERVIEW', 'WAITLIST', 'OFFER', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('HR_SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'FINAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "InterviewAttendanceStatus" AS ENUM ('SCHEDULED', 'ATTENDING', 'NO_SHOW', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EndorsementLevel" AS ENUM ('STRONG_YES', 'YES', 'UNCERTAIN', 'NO');

-- CreateEnum
CREATE TYPE "InterviewQuestionCategory" AS ENUM ('TECHNICAL', 'BEHAVIORAL', 'SITUATIONAL', 'PROBLEM_SOLVING', 'LEADERSHIP', 'COMMUNICATION', 'DOMAIN_KNOWLEDGE', 'CULTURAL_FIT', 'GENERAL');

-- CreateEnum
CREATE TYPE "InterviewQuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'BOOLEAN', 'RATING', 'SINGLE_SELECT', 'MULTI_SELECT');

-- CreateEnum
CREATE TYPE "CvScreeningRecommendation" AS ENUM ('STRONG_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'REJECT');

-- CreateEnum
CREATE TYPE "CvScreeningStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CvScreeningCriteriaType" AS ENUM ('SKILLS', 'EXPERIENCE', 'EDUCATION', 'CERTIFICATIONS', 'LANGUAGES', 'SOFT_SKILLS', 'TECHNICAL_SKILLS', 'DOMAIN_KNOWLEDGE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CvScoringMethod" AS ENUM ('MANUAL', 'AUTOMATIC', 'HYBRID');

-- CreateEnum
CREATE TYPE "CvScreeningQuestionType" AS ENUM ('TEXT', 'TEXTAREA', 'NUMBER', 'SELECT', 'MULTI_SELECT', 'CHECKBOX', 'RADIO', 'RATING', 'BOOLEAN', 'DATE', 'FILE');

-- CreateEnum
CREATE TYPE "CvScreeningStageType" AS ENUM ('INITIAL_SCREENING', 'TECHNICAL_REVIEW', 'HR_REVIEW', 'MANAGER_REVIEW', 'FINAL_DECISION', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CvScreeningDecisionType" AS ENUM ('APPROVE', 'REJECT', 'REQUEST_CHANGES', 'ESCALATE', 'HOLD');

-- CreateEnum
CREATE TYPE "ProbationEvaluationRound" AS ENUM ('DAY_30', 'DAY_55', 'DAY_60_FINAL');

-- CreateEnum
CREATE TYPE "ProbationRecommendation" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

-- CreateEnum
CREATE TYPE "ProbationConfirmationVerdict" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

-- CreateEnum
CREATE TYPE "ProbationFinalDecision" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

-- CreateEnum
CREATE TYPE "ProbationEvaluationStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AssetProvisioningStatus" AS ENUM ('PENDING', 'APPROVED', 'PROVISIONED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'BEREAVEMENT', 'UNPAID', 'STUDY', 'EMERGENCY', 'COMPASSIONATE');

-- CreateEnum
CREATE TYPE "LeaveRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'LATE', 'EARLY_DEPARTURE', 'ON_LEAVE', 'HALF_DAY', 'REMOTE', 'BUSINESS_TRIP');

-- CreateEnum
CREATE TYPE "RequestWorkflowStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "FlexWorkRequestType" AS ENUM ('WORK_FROM_HOME', 'FLEX_TIME');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "ReviewPeriodType" AS ENUM ('QUARTERLY', 'ANNUAL');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('NOT_STARTED', 'SELF_PENDING', 'SELF_SUBMITTED', 'MANAGER_PENDING', 'MANAGER_SUBMITTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PerformanceCategory" AS ENUM ('UNSATISFACTORY', 'BELOW_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'EXCEEDS_EXPECTATIONS', 'OUTSTANDING');

-- CreateEnum
CREATE TYPE "PerformanceFeedbackRole" AS ENUM ('SELF', 'MANAGER', 'PEER', 'SKIP_LEVEL', 'DIRECT_REPORT');

-- CreateEnum
CREATE TYPE "OkrStatus" AS ENUM ('DRAFT', 'ACTIVE', 'AT_RISK', 'DELAYED', 'ACHIEVED', 'PARTIALLY_ACHIEVED', 'MISSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "KeyResultType" AS ENUM ('NUMERIC', 'PERCENTAGE', 'BOOLEAN', 'MILESTONE');

-- CreateEnum
CREATE TYPE "KeyResultStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'AT_RISK', 'DELAYED', 'ACHIEVED');

-- CreateEnum
CREATE TYPE "OkrScope" AS ENUM ('COMPANY', 'DEPARTMENT', 'USER');

-- CreateEnum
CREATE TYPE "CompensationComponentType" AS ENUM ('ALLOWANCE', 'BONUS', 'DEDUCTION', 'BENEFIT');

-- CreateEnum
CREATE TYPE "SuccessionReadiness" AS ENUM ('READY_NOW', 'ONE_YEAR', 'TWO_YEARS');

-- CreateEnum
CREATE TYPE "SuccessionRiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "PromotionProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CareerDevelopmentPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CareerGoalStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "InternalTransferType" AS ENUM ('PROMOTION', 'TRANSFER');

-- CreateEnum
CREATE TYPE "SalaryAdjustmentReason" AS ENUM ('MERIT', 'EQUITY', 'PROMOTION', 'TRANSFER', 'RETENTION', 'MARKET');

-- CreateEnum
CREATE TYPE "OkrManagerReviewDecision" AS ENUM ('APPROVED', 'CHANGES_REQUESTED');

-- CreateEnum
CREATE TYPE "TrainingRequestStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TrainingType" AS ENUM ('SKILL', 'COMPLIANCE', 'LEADERSHIP', 'OTHER');

-- CreateEnum
CREATE TYPE "CompletionStatus" AS ENUM ('COMPLETED', 'PARTIAL', 'DROPPED');

-- CreateEnum
CREATE TYPE "SkillLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "SkillSource" AS ENUM ('SELF', 'MANAGER', 'ASSESSMENT', 'TRAINING');

-- CreateEnum
CREATE TYPE "CostPayer" AS ENUM ('COMPANY', 'SELF');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('COURSE', 'TRAINER', 'PROVIDER');

-- CreateEnum
CREATE TYPE "FeedbackStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWED');

-- CreateEnum
CREATE TYPE "FeedbackRatingScale" AS ENUM ('ONE_TO_FIVE', 'ONE_TO_TEN');

-- CreateEnum
CREATE TYPE "FeedbackSubmissionType" AS ENUM ('ANONYMOUS', 'IDENTIFIED', 'MANAGER_ONLY');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentType" AS ENUM ('SAFETY', 'SECURITY', 'CONFLICT', 'HARASSMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "IncidentReportStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED');

-- CreateEnum
CREATE TYPE "DisciplinaryIncidentType" AS ENUM ('ATTENDANCE_VIOLATION', 'PERFORMANCE_ISSUE', 'CODE_OF_CONDUCT');

-- CreateEnum
CREATE TYPE "DisciplinaryActionType" AS ENUM ('VERBAL_WARNING', 'WRITTEN_WARNING', 'FINAL_WARNING', 'PERFORMANCE_IMPROVEMENT_PLAN', 'SUSPENSION', 'TERMINATION');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('PENDING', 'ACTIVE', 'EXPIRED', 'APPEALED');

-- CreateEnum
CREATE TYPE "GrievanceStatus" AS ENUM ('OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "RecognitionCategory" AS ENUM ('EXCELLENCE', 'TEAMWORK', 'INNOVATION', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "RecognitionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('SATISFACTION', 'PULSE');

-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED');

-- CreateEnum
CREATE TYPE "MediationStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'AGREEMENT_REACHED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ResignationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'NOTICE_PERIOD', 'HANDOVER', 'EXIT_PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "OffboardingTaskDepartment" AS ENUM ('HR', 'IT', 'ADMIN', 'FINANCE', 'MANAGER');

-- CreateEnum
CREATE TYPE "OffboardingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "OffboardingChecklistStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TerminationType" AS ENUM ('RESIGNATION', 'END_OF_CONTRACT', 'TERMINATION', 'LAYOFF');

-- CreateEnum
CREATE TYPE "AssetReturnStatus" AS ENUM ('PENDING', 'IT_SIGNED', 'ADMIN_SIGNED', 'FINANCE_SIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ScreeningRecommendation" AS ENUM ('STRONG_RECOMMEND', 'RECOMMEND', 'CONSIDER', 'REJECT');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OnboardingChecklistStatus" AS ENUM ('TODO', 'SUBMITTED', 'CHANGES_REQUESTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('NON_CUSTOM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "TargetDataModel" AS ENUM ('USER_PROFILE', 'EMPLOYEE_ADDRESS', 'EMPLOYEE_BANK_DETAIL', 'EMPLOYEE_EMERGENCY_CONTACT', 'EMPLOYEE_EDUCATION', 'EMPLOYEE_CONTRACT', 'EMPLOYEE_POLICY_ACKNOWLEDGEMENT');

-- CreateEnum
CREATE TYPE "ProbationStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED', 'EXTENDED');

-- CreateEnum
CREATE TYPE "ProbationOutcome" AS ENUM ('CONFIRMED', 'EXTENDED', 'TERMINATED', 'RESIGNED');

-- CreateEnum
CREATE TYPE "EmailType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "PhoneType" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "GovernmentIdCardType" AS ENUM ('KEBELE_ID', 'PASSPORT', 'FAYDA', 'OTHER');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "EducationLevel" AS ENUM ('HIGH_SCHOOL', 'DIPLOMA', 'BACHELOR', 'MASTER', 'PHD', 'CERTIFICATION');

-- CreateEnum
CREATE TYPE "EmployeeStatus" AS ENUM ('ONBOARDING', 'ON_PROBATION', 'ACTIVE');

-- CreateTable
CREATE TABLE "LeaveRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "days_requested" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "description" TEXT,
    "contact_during_leave" JSONB,
    "handover_delegate_id" UUID,
    "handover_notes" TEXT,
    "start_half_day" BOOLEAN NOT NULL DEFAULT false,
    "end_half_day" BOOLEAN NOT NULL DEFAULT false,
    "balance_snapshot" JSONB,
    "submitted_at" TIMESTAMP(3),
    "status" "LeaveRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveApproval" (
    "id" UUID NOT NULL,
    "leave_request_id" UUID NOT NULL,
    "approver_id" UUID NOT NULL,
    "level" INTEGER NOT NULL,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "comments" TEXT,
    "decided_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeaveApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaveBalance" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "leave_type" "LeaveType" NOT NULL,
    "year" INTEGER NOT NULL,
    "total_days" DECIMAL(5,2) NOT NULL,
    "used_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "pending_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "carried_over" DECIMAL(5,2) DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaveBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceLog" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "check_in_at" TIMESTAMP(3),
    "check_out_at" TIMESTAMP(3),
    "total_minutes" INTEGER,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "is_auto_calculated" BOOLEAN NOT NULL DEFAULT true,
    "overtime_minutes" INTEGER,
    "overtime_approved" BOOLEAN NOT NULL DEFAULT false,
    "check_in_method" VARCHAR(32),
    "check_out_method" VARCHAR(32),
    "check_in_ip" VARCHAR(64),
    "check_in_location" JSONB,
    "reconciled_at" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttendanceCorrectionRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_log_id" UUID,
    "date" DATE NOT NULL,
    "requested_check_in_at" TIMESTAMP(3),
    "requested_check_out_at" TIMESTAMP(3),
    "requested_status" "AttendanceStatus",
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceCorrectionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OvertimeRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "attendance_log_id" UUID,
    "date" DATE NOT NULL,
    "requested_minutes" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlexWorkRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "request_type" "FlexWorkRequestType" NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "requested_start_minute" INTEGER,
    "requested_end_minute" INTEGER,
    "reason" TEXT NOT NULL,
    "details" JSONB,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FlexWorkRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Timesheet" (
    "id" UUID NOT NULL,
    "timesheet_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "period_start" DATE NOT NULL,
    "period_end" DATE NOT NULL,
    "tracked_days" INTEGER NOT NULL DEFAULT 0,
    "worked_days" INTEGER NOT NULL DEFAULT 0,
    "leave_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "absence_days" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "remote_days" INTEGER NOT NULL DEFAULT 0,
    "late_count" INTEGER NOT NULL DEFAULT 0,
    "early_departure_count" INTEGER NOT NULL DEFAULT 0,
    "total_worked_minutes" INTEGER NOT NULL DEFAULT 0,
    "overtime_minutes" INTEGER NOT NULL DEFAULT 0,
    "attendance_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "punctuality_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "source_snapshot" JSONB,
    "notes" TEXT,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timesheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "parentRoleId" UUID,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionResource" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermissionAction" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PermissionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "actionId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedBy" UUID,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "permissionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDocument" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "fileUrl" TEXT,
    "content" TEXT,
    "uploadedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChunk" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER,
    "qdrantId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "departmentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatSession" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT,
    "module" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiChatMessage" (
    "id" UUID NOT NULL,
    "sessionId" UUID NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCvAnalysis" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "screeningId" UUID,
    "score" DOUBLE PRECISION NOT NULL,
    "recommendation" "ScreeningRecommendation" NOT NULL,
    "strengths" TEXT[],
    "weaknesses" TEXT[],
    "aiSummary" TEXT NOT NULL,
    "detailedAnalysis" JSONB,
    "skillMatches" JSONB,
    "experienceMatches" JSONB,
    "educationMatches" JSONB,
    "confidence" DOUBLE PRECISION NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiCvAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCvScreeningInsight" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "screeningId" UUID,
    "insightType" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "priority" TEXT NOT NULL,
    "actionable" BOOLEAN NOT NULL DEFAULT false,
    "suggestedAction" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCvScreeningInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSkillExtraction" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "documentType" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "skillCategory" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "context" TEXT,
    "source" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSkillExtraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiExperienceAnalysis" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "duration" INTEGER,
    "relevanceScore" DOUBLE PRECISION,
    "skills" TEXT[],
    "achievements" TEXT[],
    "responsibilities" TEXT[],
    "level" TEXT,
    "industry" TEXT,
    "summary" TEXT,
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiExperienceAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiEducationAnalysis" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "level" TEXT,
    "relevanceScore" DOUBLE PRECISION,
    "gpa" DOUBLE PRECISION,
    "honors" TEXT[],
    "coursework" TEXT[],
    "confidence" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiEducationAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiCvComparison" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "jobId" UUID NOT NULL,
    "comparisonType" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "matchPercentage" DOUBLE PRECISION NOT NULL,
    "gaps" TEXT[],
    "strengths" TEXT[],
    "recommendations" TEXT[],
    "detailedBreakdown" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiCvComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiExtractedSkill" (
    "id" UUID NOT NULL,
    "applicantId" UUID NOT NULL,
    "skillId" UUID,
    "extractedName" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "context" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" UUID,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiExtractedSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiPerformanceInsight" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "reviewId" UUID,
    "insights" JSONB NOT NULL,
    "recommendations" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiPerformanceInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiTrainingRecommendation" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "recommendedSkills" JSONB NOT NULL,
    "recommendedCourses" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiTrainingRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiDecisionLog" (
    "id" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "referenceId" TEXT,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiDecisionLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrainKnowledgeSource" (
    "id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "sourceId" TEXT,
    "lastSynced" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrainKnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractTemplate" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "contractTypeId" UUID NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "templateId" UUID NOT NULL,
    "signedFileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeContractId" UUID,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractSigner" (
    "id" UUID NOT NULL,
    "contractId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleInContract" TEXT NOT NULL,
    "hasSigned" BOOLEAN NOT NULL DEFAULT false,
    "signedAt" TIMESTAMP(3),

    CONSTRAINT "ContractSigner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractType" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContractType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDocument" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "type" "DocumentType" NOT NULL,
    "type_other" TEXT,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size_bytes" INTEGER,
    "mime_type" TEXT,
    "issue_date" DATE,
    "expiry_date" DATE,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDescription" (
    "id" UUID NOT NULL,
    "position_id" UUID,
    "title" TEXT NOT NULL,
    "level" TEXT,
    "code" TEXT,
    "summary" TEXT,
    "duties" JSONB,
    "skills" JSONB,
    "kpis" JSONB,
    "document_url" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_from" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IncidentReport" (
    "id" UUID NOT NULL,
    "report_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "incident_type" "IncidentType" NOT NULL,
    "severity" "IncidentSeverity" NOT NULL,
    "description" TEXT NOT NULL,
    "location" VARCHAR(256),
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "people_involved" JSONB,
    "immediate_actions" JSONB,
    "investigator_id" UUID,
    "sla_hours" INTEGER,
    "investigation_due_at" TIMESTAMP(3),
    "investigation_notes" TEXT,
    "root_cause" TEXT,
    "preventive_actions" JSONB,
    "status" "IncidentReportStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IncidentReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryAction" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "incident_type" "DisciplinaryIncidentType" NOT NULL,
    "action_type" "DisciplinaryActionType" NOT NULL,
    "incident_report_id" UUID,
    "description" TEXT NOT NULL,
    "effective_from" DATE NOT NULL,
    "expires_at" DATE,
    "duration_days" INTEGER,
    "approved_by_id" UUID,
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplinaryAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Grievance" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "subject" VARCHAR(512) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(128),
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "assigned_to_id" UUID,
    "status" "GrievanceStatus" NOT NULL DEFAULT 'OPEN',
    "resolution_notes" TEXT,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Grievance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recognition" (
    "id" UUID NOT NULL,
    "nominator_id" UUID NOT NULL,
    "nominee_employee_id" UUID NOT NULL,
    "category" "RecognitionCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "impact" TEXT,
    "suggested_award" VARCHAR(64),
    "public_recognition" BOOLEAN NOT NULL DEFAULT true,
    "approvals" JSONB,
    "status" "RecognitionStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recognition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" UUID NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "type" "SurveyType" NOT NULL DEFAULT 'SATISFACTION',
    "questions" JSONB NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "SurveyStatus" NOT NULL DEFAULT 'DRAFT',
    "opens_at" TIMESTAMP,
    "closes_at" TIMESTAMP,
    "created_by_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyResponse" (
    "id" UUID NOT NULL,
    "survey_id" UUID NOT NULL,
    "employee_id" UUID,
    "responses" JSONB NOT NULL,
    "submitted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SurveyResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConflictMediation" (
    "id" UUID NOT NULL,
    "requester_employee_id" UUID NOT NULL,
    "other_party_employee_id" UUID NOT NULL,
    "nature" TEXT NOT NULL,
    "duration" VARCHAR(128),
    "attempted_resolutions" TEXT,
    "work_impact" TEXT,
    "desired_outcome" TEXT,
    "mediator_id" UUID,
    "session_dates" JSONB,
    "agreement_reached" BOOLEAN,
    "agreement_notes" TEXT,
    "status" "MediationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConflictMediation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(128),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeSkill" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "skill_id" UUID NOT NULL,
    "level" "SkillLevel" NOT NULL,
    "attested_at" TIMESTAMP(3),
    "source" "SkillSource" NOT NULL DEFAULT 'SELF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingBudget" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "total_budget" DECIMAL(15,2) NOT NULL,
    "used_ytd" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "per_person_amount" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingBudget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingRequest" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "training_type" "TrainingType" NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "provider" VARCHAR(256),
    "start_date" DATE,
    "end_date" DATE,
    "duration_hours" INTEGER,
    "justification" TEXT,
    "skill_gap_link_id" UUID,
    "cost" DECIMAL(15,2),
    "cost_payer" "CostPayer",
    "status" "TrainingRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingCompletion" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "training_request_id" UUID,
    "title" VARCHAR(512) NOT NULL,
    "provider" VARCHAR(256),
    "start_date" DATE,
    "end_date" DATE,
    "completion_status" "CompletionStatus" NOT NULL,
    "score_or_grade" VARCHAR(64),
    "certificate_number" VARCHAR(128),
    "certificate_url" VARCHAR(1024),
    "expiry_date" DATE,
    "skills_acquired" JSONB,
    "attested_at" TIMESTAMP(3),
    "synced_to_profile" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingFeedbackTemplate" (
    "id" UUID NOT NULL,
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "feedback_type" "FeedbackType" NOT NULL,
    "rating_scale" "FeedbackRatingScale" NOT NULL,
    "questions" JSONB NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingFeedbackTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingFeedback" (
    "id" UUID NOT NULL,
    "training_completion_id" UUID NOT NULL,
    "template_id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "submission_type" "FeedbackSubmissionType" NOT NULL,
    "status" "FeedbackStatus" NOT NULL DEFAULT 'DRAFT',
    "responses" JSONB NOT NULL,
    "overall_rating" DECIMAL(3,2),
    "comments" TEXT,
    "submitted_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "action_taken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkillGapAssessment" (
    "id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "assessed_by_id" UUID NOT NULL,
    "assessed_at" TIMESTAMP(3) NOT NULL,
    "required_skills" JSONB NOT NULL,
    "current_state" JSONB NOT NULL,
    "critical_gaps_summary" TEXT,
    "training_recommendations" JSONB,
    "hire_recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkillGapAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resignation" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "proposed_last_day" DATE NOT NULL,
    "actual_last_day" DATE,
    "reason" VARCHAR(64),
    "reason_notes" TEXT,
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "status" "ResignationStatus" NOT NULL DEFAULT 'DRAFT',
    "handover_plan" JSONB,
    "critical_projects_warning" JSONB,
    "leave_balance_options" JSONB,
    "validation_result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resignation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingChecklist" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_id" UUID NOT NULL,
    "last_working_day" DATE NOT NULL,
    "status" "OffboardingChecklistStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OffboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffboardingTask" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "department" "OffboardingTaskDepartment" NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "due_date" DATE NOT NULL,
    "assigned_to_id" UUID,
    "status" "OffboardingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "completed_by_id" UUID,
    "mandatory" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "OffboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExitInterview" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_id" UUID NOT NULL,
    "conducted_by_id" UUID,
    "conducted_at" TIMESTAMP(3),
    "questions" JSONB,
    "answers" JSONB,
    "would_recommend" BOOLEAN,
    "would_return" BOOLEAN,
    "improvement_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExitInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalSettlement" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_id" UUID NOT NULL,
    "last_working_day" DATE NOT NULL,
    "earnings" JSONB NOT NULL,
    "deductions" JSONB NOT NULL,
    "net_payable" DECIMAL(15,2) NOT NULL,
    "breakdown_document_url" VARCHAR(1024),
    "approved_by_id" UUID,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalSettlement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetReturn" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "items" JSONB,
    "deposit_return" DECIMAL(15,2),
    "damage_deductions" DECIMAL(15,2),
    "net_amount" DECIMAL(15,2),
    "it_sign_off_at" TIMESTAMP(3),
    "admin_sign_off_at" TIMESTAMP(3),
    "finance_sign_off_at" TIMESTAMP(3),
    "status" "AssetReturnStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceChecklist" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "resignation_id" UUID NOT NULL,
    "termination_type" "TerminationType" NOT NULL,
    "notice_period_contractual" INTEGER,
    "notice_period_actual" INTEGER,
    "pay_in_lieu" BOOLEAN,
    "final_dues" JSONB,
    "termination_letter_sent" BOOLEAN NOT NULL DEFAULT false,
    "exit_interview_done" BOOLEAN NOT NULL DEFAULT false,
    "clearance_certificate_done" BOOLEAN NOT NULL DEFAULT false,
    "union_notified" BOOLEAN NOT NULL DEFAULT false,
    "labor_office_filed" BOOLEAN NOT NULL DEFAULT false,
    "no_pending_claims" BOOLEAN NOT NULL DEFAULT false,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ComplianceChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" UUID NOT NULL,
    "onboarding_id" UUID NOT NULL,
    "task_instance_id" UUID NOT NULL,
    "status" "OnboardingChecklistStatus" NOT NULL DEFAULT 'TODO',
    "due_date" TIMESTAMP(3),
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "verified_at" TIMESTAMP(3),
    "verified_by" UUID,
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "targetDataModel" "TargetDataModel",
    "requiresHrVerification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTaskInstance" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "targetDataModel" "TargetDataModel",
    "requiresHrVerification" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTaskInstance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobGrade" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "min_salary" DECIMAL(15,2),
    "max_salary" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobGrade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Position" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "departmentId" UUID NOT NULL,
    "grade_id" UUID,
    "headcount_limit" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CountryReference" (
    "id" UUID NOT NULL,
    "code" VARCHAR(3),
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CountryReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "country_id" UUID,
    "is_recurring_annual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewPeriodConfig" (
    "id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "quarter" INTEGER NOT NULL,
    "type" "ReviewPeriodType" NOT NULL DEFAULT 'QUARTERLY',
    "window_opens_at" TIMESTAMP(3) NOT NULL,
    "self_assessment_due_at" TIMESTAMP(3) NOT NULL,
    "manager_review_due_at" TIMESTAMP(3) NOT NULL,
    "window_closes_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewPeriodConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReview" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "period_config_id" UUID NOT NULL,
    "self_assessment" JSONB,
    "manager_review" JSONB,
    "final_rating" DECIMAL(3,2),
    "category" "PerformanceCategory",
    "raise_recommendation" JSONB,
    "promotion_eligible" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "status" "ReviewStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceReviewFeedback" (
    "id" UUID NOT NULL,
    "review_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "role" "PerformanceFeedbackRole" NOT NULL,
    "ratings" JSONB,
    "comments" JSONB,
    "submitted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceReviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerformanceCalibration" (
    "id" UUID NOT NULL,
    "period_id" UUID NOT NULL,
    "department_id" UUID,
    "adjustments" JSONB,
    "finalized_by_id" UUID,
    "finalized_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PerformanceCalibration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Okr" (
    "id" UUID NOT NULL,
    "employee_id" UUID,
    "scope" "OkrScope" NOT NULL DEFAULT 'USER',
    "department_id" UUID,
    "parent_okr_id" UUID,
    "period_year" INTEGER NOT NULL,
    "period_quarter" INTEGER NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "description" TEXT,
    "status" "OkrStatus" NOT NULL DEFAULT 'DRAFT',
    "overall_progress" INTEGER NOT NULL DEFAULT 0,
    "overall_status" "OkrStatus" NOT NULL DEFAULT 'ACTIVE',
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Okr_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" UUID NOT NULL,
    "okr_id" UUID NOT NULL,
    "title" VARCHAR(512) NOT NULL,
    "type" "KeyResultType" NOT NULL,
    "target_value" DECIMAL(15,4) NOT NULL,
    "current_value" DECIMAL(15,4),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "status" "KeyResultStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "weight" INTEGER NOT NULL DEFAULT 100,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResultUpdate" (
    "id" UUID NOT NULL,
    "key_result_id" UUID NOT NULL,
    "previous_value" DECIMAL(15,4),
    "new_value" DECIMAL(15,4) NOT NULL,
    "comment" TEXT,
    "updated_by_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyResultUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OkrManagerReview" (
    "id" UUID NOT NULL,
    "okr_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "decision" "OkrManagerReviewDecision" NOT NULL,
    "overall_confidence" INTEGER,
    "comments" TEXT,
    "strengths" JSONB,
    "risks" JSONB,
    "support_actions" JSONB,
    "reviewed_at" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OkrManagerReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isMandatory" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "effectiveDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3),
    "dependencies" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 1,
    "currentVersionId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyVersion" (
    "id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "fileId" UUID,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyFile" (
    "id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PolicyFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAcknowledgement" (
    "id" UUID NOT NULL,
    "employee_policy_acknowledgement_id" UUID NOT NULL,
    "policyId" UUID NOT NULL,
    "policyVersionId" UUID NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationPlan" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "ProbationStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationKPI" (
    "id" UUID NOT NULL,
    "probationId" UUID NOT NULL,
    "kpiId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProbationKPI_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationCheckpoint" (
    "id" UUID NOT NULL,
    "probationId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "checkpointDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProbationCheckpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckpointEvaluation" (
    "id" UUID NOT NULL,
    "checkpointId" UUID NOT NULL,
    "comment" TEXT,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckpointEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvaluationScore" (
    "id" UUID NOT NULL,
    "probationKpiId" UUID NOT NULL,
    "checkpointEvaluationId" UUID,
    "finalEvaluationId" UUID,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvaluationScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalEvaluation" (
    "id" UUID NOT NULL,
    "probationId" UUID NOT NULL,
    "comment" TEXT,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "outcome" "ProbationOutcome" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinalEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRequestForm" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "job_title" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "requested_by" VARCHAR(255) NOT NULL,
    "request_type" "JobRequestType" NOT NULL,
    "replace_for_user_id" UUID,
    "business_justification" TEXT NOT NULL,
    "employment_type" "EmploymentType" NOT NULL,
    "work_mode" "WorkLocationType" NOT NULL,
    "urgency" "JobUrgency" NOT NULL,
    "needed_by_date" DATE NOT NULL,
    "status" "JobWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" "JobPriority" NOT NULL DEFAULT 'MEDIUM',
    "drafted_at" TIMESTAMP(3),
    "pending_approval_at" TIMESTAMP(3),
    "ready_to_post_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobRequestForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department_id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "description" JSONB NOT NULL,
    "summary" JSONB,
    "experience_level" "ExperienceLevel",
    "contract_type" "JobContractType" NOT NULL,
    "employment_type" "EmploymentType",
    "work_location_type" "WorkLocationType" NOT NULL,
    "city" VARCHAR(128),
    "country" VARCHAR(128),
    "openings" INTEGER NOT NULL DEFAULT 1,
    "salary_min" DECIMAL(12,2),
    "salary_max" DECIMAL(12,2),
    "currency" VARCHAR(8),
    "salary_mode" "JobSalaryMode" NOT NULL DEFAULT 'NOT_SPECIFIED',
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preferred_skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "responsibilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "creator_is_hr" BOOLEAN NOT NULL DEFAULT false,
    "hiring_manager_id" UUID,
    "application_deadline" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "closing_reason" TEXT,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "applications_count" INTEGER NOT NULL DEFAULT 0,
    "shortlisted_count" INTEGER NOT NULL DEFAULT 0,
    "interviews_count" INTEGER NOT NULL DEFAULT 0,
    "offers_count" INTEGER NOT NULL DEFAULT 0,
    "hires_count" INTEGER NOT NULL DEFAULT 0,
    "created_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tools" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationForm" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationFormField" (
    "id" UUID NOT NULL,
    "job_application_form_id" UUID NOT NULL,
    "key" "JobApplicantOptionalFieldKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationFormField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationFormSection" (
    "id" UUID NOT NULL,
    "job_application_form_id" UUID NOT NULL,
    "key" "JobApplicationFormSectionKey" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationFormSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationCustomField" (
    "id" UUID NOT NULL,
    "job_application_form_id" UUID NOT NULL,
    "custom_field_id" VARCHAR(64) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "type" "JobApplicationFieldType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "help_text" TEXT,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplicationCustomFieldOption" (
    "id" UUID NOT NULL,
    "custom_field_row_id" UUID NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplicationCustomFieldOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApprovalStep" (
    "id" UUID NOT NULL,
    "job_request_form_id" UUID NOT NULL,
    "department" "JobApprovalDepartment" NOT NULL,
    "level" INTEGER NOT NULL,
    "status" "JobStageApprovalStatus" NOT NULL DEFAULT 'PENDING_FOR_APPROVAL',
    "approver_id" UUID,
    "currentNote" TEXT,
    "decided_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApprovalStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApprovalHistory" (
    "id" UUID NOT NULL,
    "approval_step_id" UUID NOT NULL,
    "fromStatus" "JobStageApprovalStatus",
    "toStatus" "JobStageApprovalStatus" NOT NULL,
    "changed_by_id" UUID,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApprovalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "application_form_id" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_normalized" TEXT NOT NULL,
    "phone" TEXT,
    "resume_url" TEXT,
    "linkedin_url" TEXT,
    "portfolio_url" TEXT,
    "github_url" TEXT,
    "source" "CandidateSource" NOT NULL DEFAULT 'COMPANY_SITE',
    "referred_by_id" UUID,
    "current_company" TEXT,
    "current_position" TEXT,
    "years_experience" INTEGER,
    "location" TEXT,
    "nationality" TEXT,
    "expected_salary" DECIMAL(12,2),
    "current_salary" DECIMAL(12,2),
    "education_level" TEXT,
    "highest_degree" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "ApplicantStatus" NOT NULL DEFAULT 'APPLIED',
    "cover_letter" TEXT,
    "source_snapshot" JSONB,
    "custom_field_values" JSONB,
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "screening_at" TIMESTAMP(3),
    "shortlisted_at" TIMESTAMP(3),
    "interview_at" TIMESTAMP(3),
    "waitlist_at" TIMESTAMP(3),
    "offer_at" TIMESTAMP(3),
    "hired_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "withdrawn_at" TIMESTAMP(3),
    "last_activity_at" TIMESTAMP(3),
    "profile_score" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantStatusHistory" (
    "id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "changed_by_id" UUID,
    "from_status" "ApplicantStatus",
    "to_status" "ApplicantStatus" NOT NULL,
    "notes" TEXT,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApplicantStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantEducation" (
    "id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplicantExperience" (
    "id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "company" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApplicantExperience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewSession" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "type" "InterviewType" NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "duration_minutes" INTEGER,
    "location" VARCHAR(255),
    "meeting_url" TEXT,
    "created_by_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewParticipant" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "attendance_status" "InterviewAttendanceStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewParticipant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewerAssignment" (
    "id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "interviewer_id" UUID NOT NULL,
    "role" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewerAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewFeedback" (
    "id" UUID NOT NULL,
    "participant_id" UUID NOT NULL,
    "assignment_id" UUID NOT NULL,
    "score" DOUBLE PRECISION,
    "endorsement" "EndorsementLevel",
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "question_responses" JSONB,
    "notes" TEXT,
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "submitted_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "description" TEXT,
    "category" "InterviewQuestionCategory",
    "type" "InterviewQuestionType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "difficulty" INTEGER,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by_id" UUID NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "onboarding_id" UUID,
    "created_by_id" UUID NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "salary" DECIMAL(12,2),
    "currency" VARCHAR(8),
    "start_date" DATE,
    "payFrequency" "PayFrequency",
    "employmentType" "EmploymentType",
    "bonus" DECIMAL(12,2),
    "equity" DECIMAL(12,2),
    "offer_letter_url" TEXT,
    "notes" TEXT,
    "sent_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Offer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreening" (
    "id" UUID NOT NULL,
    "applicant_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "screened_by_id" UUID NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "recommendation" "CvScreeningRecommendation" NOT NULL,
    "skills_match" DOUBLE PRECISION,
    "experience_match" DOUBLE PRECISION,
    "education_match" DOUBLE PRECISION,
    "qualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "disqualifications" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "strengths" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "weaknesses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "screening_notes" TEXT,
    "ai_assisted" BOOLEAN NOT NULL DEFAULT false,
    "ai_confidence" DOUBLE PRECISION,
    "status" "CvScreeningStatus" NOT NULL DEFAULT 'PENDING',
    "screening_duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreening_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningCriteria" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "category" "CvScreeningCriteriaType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "min_value" INTEGER,
    "max_value" INTEGER,
    "acceptable_values" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "scoringMethod" "CvScoringMethod" NOT NULL DEFAULT 'MANUAL',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreeningCriteria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningQuestion" (
    "id" UUID NOT NULL,
    "criteria_id" UUID NOT NULL,
    "question" TEXT NOT NULL,
    "questionType" "CvScreeningQuestionType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "required" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreeningQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningResponse" (
    "id" UUID NOT NULL,
    "screening_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "response" TEXT NOT NULL,
    "score" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreeningResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningWorkflow" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreeningWorkflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningWorkflowStage" (
    "id" UUID NOT NULL,
    "workflow_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stageType" "CvScreeningStageType" NOT NULL,
    "required_role" VARCHAR(64) NOT NULL,
    "approver_id" UUID,
    "order" INTEGER NOT NULL,
    "auto_approve" BOOLEAN NOT NULL DEFAULT false,
    "auto_approve_rules" JSONB,
    "time_limit_hours" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CvScreeningWorkflowStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvScreeningDecision" (
    "id" UUID NOT NULL,
    "screening_id" UUID NOT NULL,
    "stage_id" UUID NOT NULL,
    "decision" "CvScreeningDecisionType" NOT NULL,
    "decision_maker_id" UUID NOT NULL,
    "comments" TEXT,
    "decided_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CvScreeningDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "actorUserId" TEXT,
    "actorEmail" TEXT,
    "requestId" TEXT NOT NULL,
    "correlationId" TEXT NOT NULL,
    "sessionId" TEXT,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "result" "AuditResult" NOT NULL DEFAULT 'SUCCESS',
    "statusCode" INTEGER,
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditExport" (
    "id" UUID NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "filters" JSONB,
    "status" TEXT NOT NULL,
    "filePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AuditExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "payload" JSONB,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationDelivery" (
    "id" UUID NOT NULL,
    "notificationId" UUID NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "recipient" TEXT NOT NULL,
    "response" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "events" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemConfig" (
    "id" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedBy" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleConfig" (
    "id" UUID NOT NULL,
    "module" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "licenseKey" TEXT,
    "settings" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecurityPolicy" (
    "id" UUID NOT NULL,
    "requireMfa" BOOLEAN NOT NULL DEFAULT true,
    "maxConcurrentSessions" INTEGER NOT NULL DEFAULT 3,
    "sessionTimeoutMinutes" INTEGER NOT NULL DEFAULT 480,
    "passwordMinLength" INTEGER NOT NULL DEFAULT 12,
    "lockoutThreshold" INTEGER NOT NULL DEFAULT 5,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SecurityPolicy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkSchedule" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "timezone" VARCHAR(64),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "late_threshold_minutes" INTEGER NOT NULL DEFAULT 15,
    "standard_minutes_per_day" INTEGER NOT NULL DEFAULT 480,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkScheduleDay" (
    "id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "day_of_week" "DayOfWeek" NOT NULL,
    "is_working_day" BOOLEAN NOT NULL DEFAULT true,
    "start_minute" INTEGER,
    "end_minute" INTEGER,
    "expected_minutes" INTEGER,
    "remote_allowed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkScheduleDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWorkSchedule" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "schedule_id" UUID NOT NULL,
    "effective_from" DATE NOT NULL,
    "effective_to" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessionPlan" (
    "id" UUID NOT NULL,
    "position_id" UUID NOT NULL,
    "candidate_employee_id" UUID NOT NULL,
    "readiness" "SuccessionReadiness" NOT NULL,
    "risk_level" "SuccessionRiskLevel" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionProposal" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "from_position_id" UUID,
    "to_position_id" UUID,
    "proposed_by_id" UUID NOT NULL,
    "justification" JSONB,
    "status" "PromotionProposalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromotionProposal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CareerDevelopmentPlan" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "current_position_id" UUID,
    "target_position_id" UUID,
    "plan_year" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "summary" TEXT,
    "goals" JSONB NOT NULL,
    "development_actions" JSONB,
    "success_metrics" JSONB,
    "progress_percent" INTEGER NOT NULL DEFAULT 0,
    "last_progress_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "CareerDevelopmentPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "created_by_id" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareerDevelopmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingNeedsAssessment" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "based_on_review_id" UUID,
    "period_year" INTEGER NOT NULL,
    "assessed_by_id" UUID NOT NULL,
    "development_areas" JSONB NOT NULL,
    "requested_trainings" JSONB NOT NULL,
    "skill_gap_summary" TEXT,
    "manager_notes" TEXT,
    "priority" VARCHAR(32),
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "reviewed_by_id" UUID,
    "reviewed_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingNeedsAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalTransferRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "request_type" "InternalTransferType" NOT NULL,
    "current_position_id" UUID,
    "target_position_id" UUID NOT NULL,
    "requested_by_id" UUID NOT NULL,
    "reason" TEXT NOT NULL,
    "business_case" JSONB,
    "desired_effective_date" DATE,
    "compensation_change" JSONB,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalTransferRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryAdjustmentRequest" (
    "id" UUID NOT NULL,
    "request_id" VARCHAR(32) NOT NULL,
    "employee_id" UUID NOT NULL,
    "proposed_by_id" UUID NOT NULL,
    "linked_review_id" UUID,
    "linked_transfer_request_id" UUID,
    "reason" "SalaryAdjustmentReason" NOT NULL,
    "current_base_salary" DECIMAL(15,2),
    "proposed_base_salary" DECIMAL(15,2) NOT NULL,
    "percent_change" DECIMAL(6,2) NOT NULL,
    "currency" VARCHAR(3),
    "effective_from" DATE NOT NULL,
    "justification" JSONB,
    "status" "RequestWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "submitted_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalaryAdjustmentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "keycloakId" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastLoginAt" TIMESTAMP(3),
    "metadata" JSONB,
    "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "applicant_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeStatus" "EmployeeStatus" NOT NULL DEFAULT 'ONBOARDING',

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "additionalEmail" TEXT,
    "additionalEmailType" "EmailType",
    "additionalPhone" TEXT,
    "additionalPhoneType" "PhoneType" NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "nationalityId" UUID,
    "maritalStatus" "MaritalStatus",
    "avatarUrl" TEXT,
    "passportSizePhotoURL" TEXT,
    "faydaNumber" TEXT,
    "governmentIdCard" TEXT,
    "governmentIdCardType" "GovernmentIdCardType",
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeAddress" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "countryId" UUID NOT NULL,
    "region" TEXT,
    "city" TEXT NOT NULL,
    "subCity" TEXT,
    "woreda" TEXT,
    "kebele" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "postalCode" TEXT,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,

    CONSTRAINT "EmployeeAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeBankDetail" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,

    CONSTRAINT "EmployeeBankDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" UUID NOT NULL,
    "employeeBankDetailId" UUID NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "branchName" TEXT,
    "swiftCode" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEmergencyContact" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,

    CONSTRAINT "EmployeeEmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" UUID NOT NULL,
    "employeeEmergencyContactId" UUID NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relationship" TEXT NOT NULL,
    "primaryPhone" TEXT NOT NULL,
    "email" TEXT,
    "isFirstToCall" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "countryId" UUID,
    "city" TEXT,
    "subCity" TEXT,
    "woreda" TEXT,
    "kebele" TEXT,
    "street" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeEducation" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,

    CONSTRAINT "EmployeeEducation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Education" (
    "id" UUID NOT NULL,
    "employeeEducationId" UUID NOT NULL,
    "institution" TEXT NOT NULL,
    "degree" TEXT NOT NULL,
    "fieldOfStudy" TEXT NOT NULL,
    "level" "EducationLevel" NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "grade" TEXT,
    "description" TEXT,
    "isCompleted" BOOLEAN NOT NULL DEFAULT true,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeContract" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,

    CONSTRAINT "EmployeeContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePolicyAcknowledgement" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "hrFeedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePolicyAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmployment" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "employeeCode" TEXT,
    "positionId" UUID,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "managerEmploymentId" UUID,
    "hiredAt" TIMESTAMP(3),
    "probationEndAt" TIMESTAMP(3),
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserEmployment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserEmploymentHistory" (
    "id" UUID NOT NULL,
    "userEmploymentId" UUID NOT NULL,
    "employeeCode" TEXT,
    "departmentId" UUID,
    "positionId" UUID,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'FULL_TIME',
    "managerEmploymentId" UUID,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "changeReason" TEXT,
    "changedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserEmploymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompensation" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "baseSalary" DECIMAL(15,2),
    "currency" TEXT,
    "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "bonusEligible" BOOLEAN NOT NULL DEFAULT false,
    "bonusRate" DECIMAL(5,2),
    "effectiveFrom" TIMESTAMP(3),
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCompensation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCompensationHistory" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "baseSalary" DECIMAL(15,2),
    "currency" TEXT,
    "payFrequency" "PayFrequency" NOT NULL DEFAULT 'MONTHLY',
    "bonusEligible" BOOLEAN NOT NULL DEFAULT false,
    "bonusRate" DECIMAL(5,2),
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "changeReason" TEXT,
    "changedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCompensationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompensationComponent" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "CompensationComponentType" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompensationComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLifecycle" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "LifecycleStatus" NOT NULL DEFAULT 'ONBOARDING',
    "onboardedAt" TIMESTAMP(3),
    "suspendedAt" TIMESTAMP(3),
    "terminatedAt" TIMESTAMP(3),
    "terminationReason" TEXT,
    "offboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "no_pending_claims" BOOLEAN NOT NULL DEFAULT false,
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLifecycle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeaveRequest_request_id_key" ON "LeaveRequest"("request_id");

-- CreateIndex
CREATE INDEX "LeaveRequest_employee_id_idx" ON "LeaveRequest"("employee_id");

-- CreateIndex
CREATE INDEX "LeaveRequest_status_idx" ON "LeaveRequest"("status");

-- CreateIndex
CREATE INDEX "LeaveRequest_start_date_end_date_idx" ON "LeaveRequest"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "LeaveRequest_approved_by_id_idx" ON "LeaveRequest"("approved_by_id");

-- CreateIndex
CREATE INDEX "LeaveRequest_submitted_at_idx" ON "LeaveRequest"("submitted_at");

-- CreateIndex
CREATE INDEX "LeaveApproval_leave_request_id_idx" ON "LeaveApproval"("leave_request_id");

-- CreateIndex
CREATE INDEX "LeaveApproval_approver_id_idx" ON "LeaveApproval"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveApproval_leave_request_id_level_key" ON "LeaveApproval"("leave_request_id", "level");

-- CreateIndex
CREATE INDEX "LeaveBalance_employee_id_idx" ON "LeaveBalance"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "LeaveBalance_employee_id_leave_type_year_key" ON "LeaveBalance"("employee_id", "leave_type", "year");

-- CreateIndex
CREATE INDEX "AttendanceLog_employee_id_idx" ON "AttendanceLog"("employee_id");

-- CreateIndex
CREATE INDEX "AttendanceLog_employee_id_date_idx" ON "AttendanceLog"("employee_id", "date");

-- CreateIndex
CREATE INDEX "AttendanceLog_date_idx" ON "AttendanceLog"("date");

-- CreateIndex
CREATE INDEX "AttendanceLog_status_idx" ON "AttendanceLog"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceLog_employee_id_date_key" ON "AttendanceLog"("employee_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceCorrectionRequest_request_id_key" ON "AttendanceCorrectionRequest"("request_id");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_employee_id_idx" ON "AttendanceCorrectionRequest"("employee_id");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_attendance_log_id_idx" ON "AttendanceCorrectionRequest"("attendance_log_id");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_date_idx" ON "AttendanceCorrectionRequest"("date");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_status_idx" ON "AttendanceCorrectionRequest"("status");

-- CreateIndex
CREATE INDEX "AttendanceCorrectionRequest_approved_by_id_idx" ON "AttendanceCorrectionRequest"("approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "OvertimeRequest_request_id_key" ON "OvertimeRequest"("request_id");

-- CreateIndex
CREATE INDEX "OvertimeRequest_employee_id_idx" ON "OvertimeRequest"("employee_id");

-- CreateIndex
CREATE INDEX "OvertimeRequest_attendance_log_id_idx" ON "OvertimeRequest"("attendance_log_id");

-- CreateIndex
CREATE INDEX "OvertimeRequest_date_idx" ON "OvertimeRequest"("date");

-- CreateIndex
CREATE INDEX "OvertimeRequest_status_idx" ON "OvertimeRequest"("status");

-- CreateIndex
CREATE INDEX "OvertimeRequest_approved_by_id_idx" ON "OvertimeRequest"("approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "FlexWorkRequest_request_id_key" ON "FlexWorkRequest"("request_id");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_employee_id_idx" ON "FlexWorkRequest"("employee_id");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_request_type_idx" ON "FlexWorkRequest"("request_type");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_start_date_end_date_idx" ON "FlexWorkRequest"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_status_idx" ON "FlexWorkRequest"("status");

-- CreateIndex
CREATE INDEX "FlexWorkRequest_approved_by_id_idx" ON "FlexWorkRequest"("approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_timesheet_id_key" ON "Timesheet"("timesheet_id");

-- CreateIndex
CREATE INDEX "Timesheet_employee_id_idx" ON "Timesheet"("employee_id");

-- CreateIndex
CREATE INDEX "Timesheet_period_start_period_end_idx" ON "Timesheet"("period_start", "period_end");

-- CreateIndex
CREATE INDEX "Timesheet_status_idx" ON "Timesheet"("status");

-- CreateIndex
CREATE INDEX "Timesheet_approved_by_id_idx" ON "Timesheet"("approved_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Timesheet_employee_id_period_start_period_end_key" ON "Timesheet"("employee_id", "period_start", "period_end");

-- CreateIndex
CREATE INDEX "Role_parentRoleId_idx" ON "Role"("parentRoleId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionResource_name_key" ON "PermissionResource"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PermissionAction_name_key" ON "PermissionAction"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_slug_key" ON "Permission"("slug");

-- CreateIndex
CREATE INDEX "Permission_resourceId_idx" ON "Permission"("resourceId");

-- CreateIndex
CREATE INDEX "Permission_actionId_idx" ON "Permission"("actionId");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_resourceId_actionId_key" ON "Permission"("resourceId", "actionId");

-- CreateIndex
CREATE INDEX "UserRole_roleId_idx" ON "UserRole"("roleId");

-- CreateIndex
CREATE INDEX "UserRole_userId_roleId_idx" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");

-- CreateIndex
CREATE INDEX "RolePermission_permissionId_idx" ON "RolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RolePermission_roleId_permissionId_key" ON "RolePermission"("roleId", "permissionId");

-- CreateIndex
CREATE INDEX "AiDocument_module_idx" ON "AiDocument"("module");

-- CreateIndex
CREATE INDEX "AiDocument_uploadedById_idx" ON "AiDocument"("uploadedById");

-- CreateIndex
CREATE INDEX "AiChunk_documentId_idx" ON "AiChunk"("documentId");

-- CreateIndex
CREATE INDEX "AiChunk_module_idx" ON "AiChunk"("module");

-- CreateIndex
CREATE INDEX "AiChunk_departmentId_idx" ON "AiChunk"("departmentId");

-- CreateIndex
CREATE INDEX "AiChatSession_userId_idx" ON "AiChatSession"("userId");

-- CreateIndex
CREATE INDEX "AiChatSession_module_idx" ON "AiChatSession"("module");

-- CreateIndex
CREATE INDEX "AiChatMessage_sessionId_idx" ON "AiChatMessage"("sessionId");

-- CreateIndex
CREATE INDEX "AiCvAnalysis_applicantId_idx" ON "AiCvAnalysis"("applicantId");

-- CreateIndex
CREATE INDEX "AiCvAnalysis_jobId_idx" ON "AiCvAnalysis"("jobId");

-- CreateIndex
CREATE INDEX "AiCvAnalysis_screeningId_idx" ON "AiCvAnalysis"("screeningId");

-- CreateIndex
CREATE INDEX "AiCvAnalysis_recommendation_idx" ON "AiCvAnalysis"("recommendation");

-- CreateIndex
CREATE INDEX "AiCvScreeningInsight_applicantId_idx" ON "AiCvScreeningInsight"("applicantId");

-- CreateIndex
CREATE INDEX "AiCvScreeningInsight_jobId_idx" ON "AiCvScreeningInsight"("jobId");

-- CreateIndex
CREATE INDEX "AiCvScreeningInsight_screeningId_idx" ON "AiCvScreeningInsight"("screeningId");

-- CreateIndex
CREATE INDEX "AiCvScreeningInsight_insightType_idx" ON "AiCvScreeningInsight"("insightType");

-- CreateIndex
CREATE INDEX "AiCvScreeningInsight_category_idx" ON "AiCvScreeningInsight"("category");

-- CreateIndex
CREATE INDEX "AiSkillExtraction_applicantId_idx" ON "AiSkillExtraction"("applicantId");

-- CreateIndex
CREATE INDEX "AiSkillExtraction_skillName_idx" ON "AiSkillExtraction"("skillName");

-- CreateIndex
CREATE INDEX "AiSkillExtraction_skillCategory_idx" ON "AiSkillExtraction"("skillCategory");

-- CreateIndex
CREATE INDEX "AiSkillExtraction_verified_idx" ON "AiSkillExtraction"("verified");

-- CreateIndex
CREATE INDEX "AiExperienceAnalysis_applicantId_idx" ON "AiExperienceAnalysis"("applicantId");

-- CreateIndex
CREATE INDEX "AiExperienceAnalysis_company_idx" ON "AiExperienceAnalysis"("company");

-- CreateIndex
CREATE INDEX "AiExperienceAnalysis_position_idx" ON "AiExperienceAnalysis"("position");

-- CreateIndex
CREATE INDEX "AiExperienceAnalysis_relevanceScore_idx" ON "AiExperienceAnalysis"("relevanceScore");

-- CreateIndex
CREATE INDEX "AiEducationAnalysis_applicantId_idx" ON "AiEducationAnalysis"("applicantId");

-- CreateIndex
CREATE INDEX "AiEducationAnalysis_institution_idx" ON "AiEducationAnalysis"("institution");

-- CreateIndex
CREATE INDEX "AiEducationAnalysis_degree_idx" ON "AiEducationAnalysis"("degree");

-- CreateIndex
CREATE INDEX "AiEducationAnalysis_relevanceScore_idx" ON "AiEducationAnalysis"("relevanceScore");

-- CreateIndex
CREATE INDEX "AiCvComparison_applicantId_idx" ON "AiCvComparison"("applicantId");

-- CreateIndex
CREATE INDEX "AiCvComparison_jobId_idx" ON "AiCvComparison"("jobId");

-- CreateIndex
CREATE INDEX "AiCvComparison_comparisonType_idx" ON "AiCvComparison"("comparisonType");

-- CreateIndex
CREATE INDEX "AiCvComparison_score_idx" ON "AiCvComparison"("score");

-- CreateIndex
CREATE INDEX "AiExtractedSkill_applicantId_idx" ON "AiExtractedSkill"("applicantId");

-- CreateIndex
CREATE INDEX "AiExtractedSkill_skillId_idx" ON "AiExtractedSkill"("skillId");

-- CreateIndex
CREATE INDEX "AiExtractedSkill_verified_idx" ON "AiExtractedSkill"("verified");

-- CreateIndex
CREATE INDEX "AiPerformanceInsight_employeeId_idx" ON "AiPerformanceInsight"("employeeId");

-- CreateIndex
CREATE INDEX "AiPerformanceInsight_reviewId_idx" ON "AiPerformanceInsight"("reviewId");

-- CreateIndex
CREATE INDEX "AiTrainingRecommendation_employeeId_idx" ON "AiTrainingRecommendation"("employeeId");

-- CreateIndex
CREATE INDEX "AiDecisionLog_type_idx" ON "AiDecisionLog"("type");

-- CreateIndex
CREATE INDEX "AiDecisionLog_referenceId_idx" ON "AiDecisionLog"("referenceId");

-- CreateIndex
CREATE INDEX "AiDecisionLog_createdAt_idx" ON "AiDecisionLog"("createdAt");

-- CreateIndex
CREATE INDEX "BrainKnowledgeSource_module_idx" ON "BrainKnowledgeSource"("module");

-- CreateIndex
CREATE INDEX "BrainKnowledgeSource_sourceType_idx" ON "BrainKnowledgeSource"("sourceType");

-- CreateIndex
CREATE INDEX "BrainKnowledgeSource_lastSynced_idx" ON "BrainKnowledgeSource"("lastSynced");

-- CreateIndex
CREATE UNIQUE INDEX "ContractSigner_contractId_userId_key" ON "ContractSigner"("contractId", "userId");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_idx" ON "EmployeeDocument"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_type_idx" ON "EmployeeDocument"("employee_id", "type");

-- CreateIndex
CREATE INDEX "EmployeeDocument_expiry_date_idx" ON "EmployeeDocument"("expiry_date");

-- CreateIndex
CREATE INDEX "EmployeeDocument_verified_by_id_idx" ON "EmployeeDocument"("verified_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobDescription_code_key" ON "JobDescription"("code");

-- CreateIndex
CREATE INDEX "JobDescription_position_id_idx" ON "JobDescription"("position_id");

-- CreateIndex
CREATE INDEX "JobDescription_title_idx" ON "JobDescription"("title");

-- CreateIndex
CREATE UNIQUE INDEX "IncidentReport_report_id_key" ON "IncidentReport"("report_id");

-- CreateIndex
CREATE INDEX "IncidentReport_employee_id_idx" ON "IncidentReport"("employee_id");

-- CreateIndex
CREATE INDEX "IncidentReport_status_idx" ON "IncidentReport"("status");

-- CreateIndex
CREATE INDEX "IncidentReport_severity_idx" ON "IncidentReport"("severity");

-- CreateIndex
CREATE INDEX "IncidentReport_investigator_id_idx" ON "IncidentReport"("investigator_id");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_employee_id_idx" ON "DisciplinaryAction"("employee_id");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_incident_type_idx" ON "DisciplinaryAction"("incident_type");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_status_idx" ON "DisciplinaryAction"("status");

-- CreateIndex
CREATE INDEX "DisciplinaryAction_effective_from_idx" ON "DisciplinaryAction"("effective_from");

-- CreateIndex
CREATE INDEX "Grievance_employee_id_idx" ON "Grievance"("employee_id");

-- CreateIndex
CREATE INDEX "Grievance_assigned_to_id_idx" ON "Grievance"("assigned_to_id");

-- CreateIndex
CREATE INDEX "Grievance_status_idx" ON "Grievance"("status");

-- CreateIndex
CREATE INDEX "Recognition_nominee_employee_id_idx" ON "Recognition"("nominee_employee_id");

-- CreateIndex
CREATE INDEX "Recognition_nominator_id_idx" ON "Recognition"("nominator_id");

-- CreateIndex
CREATE INDEX "Recognition_status_idx" ON "Recognition"("status");

-- CreateIndex
CREATE INDEX "Survey_status_idx" ON "Survey"("status");

-- CreateIndex
CREATE INDEX "Survey_created_by_id_idx" ON "Survey"("created_by_id");

-- CreateIndex
CREATE INDEX "SurveyResponse_survey_id_idx" ON "SurveyResponse"("survey_id");

-- CreateIndex
CREATE INDEX "SurveyResponse_employee_id_idx" ON "SurveyResponse"("employee_id");

-- CreateIndex
CREATE INDEX "ConflictMediation_requester_employee_id_idx" ON "ConflictMediation"("requester_employee_id");

-- CreateIndex
CREATE INDEX "ConflictMediation_other_party_employee_id_idx" ON "ConflictMediation"("other_party_employee_id");

-- CreateIndex
CREATE INDEX "ConflictMediation_mediator_id_idx" ON "ConflictMediation"("mediator_id");

-- CreateIndex
CREATE INDEX "ConflictMediation_status_idx" ON "ConflictMediation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE INDEX "Skill_category_idx" ON "Skill"("category");

-- CreateIndex
CREATE INDEX "EmployeeSkill_employee_id_idx" ON "EmployeeSkill"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeSkill_skill_id_idx" ON "EmployeeSkill"("skill_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeSkill_employee_id_skill_id_key" ON "EmployeeSkill"("employee_id", "skill_id");

-- CreateIndex
CREATE INDEX "TrainingBudget_department_id_idx" ON "TrainingBudget"("department_id");

-- CreateIndex
CREATE INDEX "TrainingBudget_year_idx" ON "TrainingBudget"("year");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingBudget_department_id_year_key" ON "TrainingBudget"("department_id", "year");

-- CreateIndex
CREATE INDEX "TrainingRequest_employee_id_idx" ON "TrainingRequest"("employee_id");

-- CreateIndex
CREATE INDEX "TrainingRequest_department_id_idx" ON "TrainingRequest"("department_id");

-- CreateIndex
CREATE INDEX "TrainingRequest_status_idx" ON "TrainingRequest"("status");

-- CreateIndex
CREATE INDEX "TrainingRequest_submitted_at_idx" ON "TrainingRequest"("submitted_at");

-- CreateIndex
CREATE INDEX "TrainingCompletion_employee_id_idx" ON "TrainingCompletion"("employee_id");

-- CreateIndex
CREATE INDEX "TrainingCompletion_training_request_id_idx" ON "TrainingCompletion"("training_request_id");

-- CreateIndex
CREATE INDEX "TrainingCompletion_expiry_date_idx" ON "TrainingCompletion"("expiry_date");

-- CreateIndex
CREATE INDEX "TrainingFeedbackTemplate_feedback_type_idx" ON "TrainingFeedbackTemplate"("feedback_type");

-- CreateIndex
CREATE INDEX "TrainingFeedbackTemplate_is_active_idx" ON "TrainingFeedbackTemplate"("is_active");

-- CreateIndex
CREATE INDEX "TrainingFeedbackTemplate_created_by_id_idx" ON "TrainingFeedbackTemplate"("created_by_id");

-- CreateIndex
CREATE INDEX "TrainingFeedback_training_completion_id_idx" ON "TrainingFeedback"("training_completion_id");

-- CreateIndex
CREATE INDEX "TrainingFeedback_template_id_idx" ON "TrainingFeedback"("template_id");

-- CreateIndex
CREATE INDEX "TrainingFeedback_participant_id_idx" ON "TrainingFeedback"("participant_id");

-- CreateIndex
CREATE INDEX "TrainingFeedback_status_idx" ON "TrainingFeedback"("status");

-- CreateIndex
CREATE INDEX "TrainingFeedback_submitted_at_idx" ON "TrainingFeedback"("submitted_at");

-- CreateIndex
CREATE INDEX "SkillGapAssessment_department_id_idx" ON "SkillGapAssessment"("department_id");

-- CreateIndex
CREATE INDEX "SkillGapAssessment_assessed_by_id_idx" ON "SkillGapAssessment"("assessed_by_id");

-- CreateIndex
CREATE INDEX "SkillGapAssessment_assessed_at_idx" ON "SkillGapAssessment"("assessed_at");

-- CreateIndex
CREATE INDEX "Resignation_employee_id_idx" ON "Resignation"("employee_id");

-- CreateIndex
CREATE INDEX "Resignation_status_idx" ON "Resignation"("status");

-- CreateIndex
CREATE INDEX "Resignation_proposed_last_day_idx" ON "Resignation"("proposed_last_day");

-- CreateIndex
CREATE INDEX "OffboardingChecklist_employee_id_idx" ON "OffboardingChecklist"("employee_id");

-- CreateIndex
CREATE INDEX "OffboardingChecklist_resignation_id_idx" ON "OffboardingChecklist"("resignation_id");

-- CreateIndex
CREATE INDEX "OffboardingChecklist_status_idx" ON "OffboardingChecklist"("status");

-- CreateIndex
CREATE INDEX "OffboardingTask_checklist_id_idx" ON "OffboardingTask"("checklist_id");

-- CreateIndex
CREATE INDEX "OffboardingTask_department_idx" ON "OffboardingTask"("department");

-- CreateIndex
CREATE INDEX "OffboardingTask_assigned_to_id_idx" ON "OffboardingTask"("assigned_to_id");

-- CreateIndex
CREATE INDEX "OffboardingTask_status_idx" ON "OffboardingTask"("status");

-- CreateIndex
CREATE INDEX "ExitInterview_employee_id_idx" ON "ExitInterview"("employee_id");

-- CreateIndex
CREATE INDEX "ExitInterview_resignation_id_idx" ON "ExitInterview"("resignation_id");

-- CreateIndex
CREATE INDEX "FinalSettlement_employee_id_idx" ON "FinalSettlement"("employee_id");

-- CreateIndex
CREATE INDEX "FinalSettlement_resignation_id_idx" ON "FinalSettlement"("resignation_id");

-- CreateIndex
CREATE INDEX "AssetReturn_employee_id_idx" ON "AssetReturn"("employee_id");

-- CreateIndex
CREATE INDEX "AssetReturn_checklist_id_idx" ON "AssetReturn"("checklist_id");

-- CreateIndex
CREATE INDEX "AssetReturn_status_idx" ON "AssetReturn"("status");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_employee_id_idx" ON "ComplianceChecklist"("employee_id");

-- CreateIndex
CREATE INDEX "ComplianceChecklist_resignation_id_idx" ON "ComplianceChecklist"("resignation_id");

-- CreateIndex
CREATE UNIQUE INDEX "Onboarding_employee_id_key" ON "Onboarding"("employee_id");

-- CreateIndex
CREATE INDEX "Onboarding_employee_id_idx" ON "Onboarding"("employee_id");

-- CreateIndex
CREATE INDEX "Onboarding_status_idx" ON "Onboarding"("status");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_onboarding_id_idx" ON "OnboardingChecklist"("onboarding_id");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_status_idx" ON "OnboardingChecklist"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingChecklist_onboarding_id_task_instance_id_key" ON "OnboardingChecklist"("onboarding_id", "task_instance_id");

-- CreateIndex
CREATE UNIQUE INDEX "Department_name_key" ON "Department"("name");

-- CreateIndex
CREATE INDEX "Department_parent_id_idx" ON "Department"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobGrade_code_key" ON "JobGrade"("code");

-- CreateIndex
CREATE INDEX "JobGrade_level_idx" ON "JobGrade"("level");

-- CreateIndex
CREATE INDEX "Position_departmentId_idx" ON "Position"("departmentId");

-- CreateIndex
CREATE INDEX "Position_grade_id_idx" ON "Position"("grade_id");

-- CreateIndex
CREATE INDEX "Position_isActive_idx" ON "Position"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Position_departmentId_title_key" ON "Position"("departmentId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "CountryReference_code_key" ON "CountryReference"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CountryReference_name_key" ON "CountryReference"("name");

-- CreateIndex
CREATE INDEX "CountryReference_isActive_idx" ON "CountryReference"("isActive");

-- CreateIndex
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "Holiday_country_id_idx" ON "Holiday"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_name_date_country_id_key" ON "Holiday"("name", "date", "country_id");

-- CreateIndex
CREATE INDEX "ReviewPeriodConfig_year_idx" ON "ReviewPeriodConfig"("year");

-- CreateIndex
CREATE UNIQUE INDEX "ReviewPeriodConfig_year_quarter_key" ON "ReviewPeriodConfig"("year", "quarter");

-- CreateIndex
CREATE INDEX "PerformanceReview_employee_id_idx" ON "PerformanceReview"("employee_id");

-- CreateIndex
CREATE INDEX "PerformanceReview_period_config_id_idx" ON "PerformanceReview"("period_config_id");

-- CreateIndex
CREATE INDEX "PerformanceReview_status_idx" ON "PerformanceReview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceReview_employee_id_period_config_id_key" ON "PerformanceReview"("employee_id", "period_config_id");

-- CreateIndex
CREATE INDEX "PerformanceReviewFeedback_review_id_idx" ON "PerformanceReviewFeedback"("review_id");

-- CreateIndex
CREATE INDEX "PerformanceReviewFeedback_reviewer_id_idx" ON "PerformanceReviewFeedback"("reviewer_id");

-- CreateIndex
CREATE INDEX "PerformanceReviewFeedback_role_idx" ON "PerformanceReviewFeedback"("role");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceReviewFeedback_review_id_reviewer_id_role_key" ON "PerformanceReviewFeedback"("review_id", "reviewer_id", "role");

-- CreateIndex
CREATE INDEX "PerformanceCalibration_period_id_idx" ON "PerformanceCalibration"("period_id");

-- CreateIndex
CREATE INDEX "PerformanceCalibration_department_id_idx" ON "PerformanceCalibration"("department_id");

-- CreateIndex
CREATE INDEX "PerformanceCalibration_finalized_by_id_idx" ON "PerformanceCalibration"("finalized_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "PerformanceCalibration_period_id_department_id_key" ON "PerformanceCalibration"("period_id", "department_id");

-- CreateIndex
CREATE INDEX "Okr_employee_id_idx" ON "Okr"("employee_id");

-- CreateIndex
CREATE INDEX "Okr_scope_idx" ON "Okr"("scope");

-- CreateIndex
CREATE INDEX "Okr_department_id_idx" ON "Okr"("department_id");

-- CreateIndex
CREATE INDEX "Okr_parent_okr_id_idx" ON "Okr"("parent_okr_id");

-- CreateIndex
CREATE INDEX "Okr_period_year_period_quarter_idx" ON "Okr"("period_year", "period_quarter");

-- CreateIndex
CREATE INDEX "Okr_status_idx" ON "Okr"("status");

-- CreateIndex
CREATE INDEX "KeyResult_okr_id_idx" ON "KeyResult"("okr_id");

-- CreateIndex
CREATE INDEX "KeyResultUpdate_key_result_id_idx" ON "KeyResultUpdate"("key_result_id");

-- CreateIndex
CREATE INDEX "KeyResultUpdate_updated_by_id_idx" ON "KeyResultUpdate"("updated_by_id");

-- CreateIndex
CREATE INDEX "KeyResultUpdate_createdAt_idx" ON "KeyResultUpdate"("createdAt");

-- CreateIndex
CREATE INDEX "OkrManagerReview_okr_id_idx" ON "OkrManagerReview"("okr_id");

-- CreateIndex
CREATE INDEX "OkrManagerReview_reviewer_id_idx" ON "OkrManagerReview"("reviewer_id");

-- CreateIndex
CREATE INDEX "OkrManagerReview_decision_idx" ON "OkrManagerReview"("decision");

-- CreateIndex
CREATE UNIQUE INDEX "OkrManagerReview_okr_id_reviewer_id_key" ON "OkrManagerReview"("okr_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyVersion_policyId_version_key" ON "PolicyVersion"("policyId", "version");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgement_employee_policy_acknowledgement_id_idx" ON "PolicyAcknowledgement"("employee_policy_acknowledgement_id");

-- CreateIndex
CREATE UNIQUE INDEX "PolicyAcknowledgement_employee_policy_acknowledgement_id_po_key" ON "PolicyAcknowledgement"("employee_policy_acknowledgement_id", "policyVersionId");

-- CreateIndex
CREATE UNIQUE INDEX "ProbationPlan_employeeId_key" ON "ProbationPlan"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "KPI_name_key" ON "KPI"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProbationKPI_probationId_kpiId_key" ON "ProbationKPI"("probationId", "kpiId");

-- CreateIndex
CREATE UNIQUE INDEX "EvaluationScore_probationKpiId_checkpointEvaluationId_key" ON "EvaluationScore"("probationKpiId", "checkpointEvaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalEvaluation_probationId_key" ON "FinalEvaluation"("probationId");

-- CreateIndex
CREATE UNIQUE INDEX "JobRequestForm_job_id_key" ON "JobRequestForm"("job_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_department_id_idx" ON "JobRequestForm"("department_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_position_id_idx" ON "JobRequestForm"("position_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_replace_for_user_id_idx" ON "JobRequestForm"("replace_for_user_id");

-- CreateIndex
CREATE INDEX "JobRequestForm_status_idx" ON "JobRequestForm"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_department_id_idx" ON "Job"("department_id");

-- CreateIndex
CREATE INDEX "Job_position_id_idx" ON "Job"("position_id");

-- CreateIndex
CREATE INDEX "Job_created_by_id_idx" ON "Job"("created_by_id");

-- CreateIndex
CREATE INDEX "Job_hiring_manager_id_idx" ON "Job"("hiring_manager_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationForm_job_id_key" ON "JobApplicationForm"("job_id");

-- CreateIndex
CREATE INDEX "JobApplicationFormField_job_application_form_id_idx" ON "JobApplicationFormField"("job_application_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationFormField_job_application_form_id_order_idx" ON "JobApplicationFormField"("job_application_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationFormField_job_application_form_id_key_key" ON "JobApplicationFormField"("job_application_form_id", "key");

-- CreateIndex
CREATE INDEX "JobApplicationFormSection_job_application_form_id_idx" ON "JobApplicationFormSection"("job_application_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationFormSection_job_application_form_id_order_idx" ON "JobApplicationFormSection"("job_application_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationFormSection_job_application_form_id_key_key" ON "JobApplicationFormSection"("job_application_form_id", "key");

-- CreateIndex
CREATE INDEX "JobApplicationCustomField_job_application_form_id_idx" ON "JobApplicationCustomField"("job_application_form_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomField_job_application_form_id_order_idx" ON "JobApplicationCustomField"("job_application_form_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplicationCustomField_job_application_form_id_custom_fi_key" ON "JobApplicationCustomField"("job_application_form_id", "custom_field_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomFieldOption_custom_field_row_id_idx" ON "JobApplicationCustomFieldOption"("custom_field_row_id");

-- CreateIndex
CREATE INDEX "JobApplicationCustomFieldOption_custom_field_row_id_order_idx" ON "JobApplicationCustomFieldOption"("custom_field_row_id", "order");

-- CreateIndex
CREATE INDEX "JobApprovalStep_job_request_form_id_idx" ON "JobApprovalStep"("job_request_form_id");

-- CreateIndex
CREATE INDEX "JobApprovalStep_approver_id_idx" ON "JobApprovalStep"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobApprovalStep_job_request_form_id_department_key" ON "JobApprovalStep"("job_request_form_id", "department");

-- CreateIndex
CREATE INDEX "JobApprovalHistory_approval_step_id_idx" ON "JobApprovalHistory"("approval_step_id");

-- CreateIndex
CREATE INDEX "JobApprovalHistory_changed_by_id_idx" ON "JobApprovalHistory"("changed_by_id");

-- CreateIndex
CREATE INDEX "Applicant_job_id_idx" ON "Applicant"("job_id");

-- CreateIndex
CREATE INDEX "Applicant_status_idx" ON "Applicant"("status");

-- CreateIndex
CREATE INDEX "Applicant_email_idx" ON "Applicant"("email");

-- CreateIndex
CREATE INDEX "Applicant_email_normalized_idx" ON "Applicant"("email_normalized");

-- CreateIndex
CREATE INDEX "Applicant_referred_by_id_idx" ON "Applicant"("referred_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_job_id_email_normalized_key" ON "Applicant"("job_id", "email_normalized");

-- CreateIndex
CREATE INDEX "ApplicantStatusHistory_applicant_id_idx" ON "ApplicantStatusHistory"("applicant_id");

-- CreateIndex
CREATE INDEX "ApplicantStatusHistory_applicant_id_changed_at_idx" ON "ApplicantStatusHistory"("applicant_id", "changed_at");

-- CreateIndex
CREATE INDEX "ApplicantStatusHistory_changed_by_id_idx" ON "ApplicantStatusHistory"("changed_by_id");

-- CreateIndex
CREATE INDEX "ApplicantEducation_applicant_id_idx" ON "ApplicantEducation"("applicant_id");

-- CreateIndex
CREATE INDEX "ApplicantExperience_applicant_id_idx" ON "ApplicantExperience"("applicant_id");

-- CreateIndex
CREATE INDEX "InterviewSession_job_id_idx" ON "InterviewSession"("job_id");

-- CreateIndex
CREATE INDEX "InterviewSession_status_idx" ON "InterviewSession"("status");

-- CreateIndex
CREATE INDEX "InterviewSession_scheduled_at_idx" ON "InterviewSession"("scheduled_at");

-- CreateIndex
CREATE INDEX "InterviewSession_job_id_round_idx" ON "InterviewSession"("job_id", "round");

-- CreateIndex
CREATE INDEX "InterviewSession_created_by_id_idx" ON "InterviewSession"("created_by_id");

-- CreateIndex
CREATE INDEX "InterviewParticipant_session_id_idx" ON "InterviewParticipant"("session_id");

-- CreateIndex
CREATE INDEX "InterviewParticipant_applicant_id_idx" ON "InterviewParticipant"("applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewParticipant_session_id_applicant_id_key" ON "InterviewParticipant"("session_id", "applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewParticipant_id_session_id_key" ON "InterviewParticipant"("id", "session_id");

-- CreateIndex
CREATE INDEX "InterviewerAssignment_session_id_idx" ON "InterviewerAssignment"("session_id");

-- CreateIndex
CREATE INDEX "InterviewerAssignment_interviewer_id_idx" ON "InterviewerAssignment"("interviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewerAssignment_session_id_interviewer_id_key" ON "InterviewerAssignment"("session_id", "interviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewerAssignment_id_session_id_key" ON "InterviewerAssignment"("id", "session_id");

-- CreateIndex
CREATE INDEX "InterviewFeedback_participant_id_idx" ON "InterviewFeedback"("participant_id");

-- CreateIndex
CREATE INDEX "InterviewFeedback_assignment_id_idx" ON "InterviewFeedback"("assignment_id");

-- CreateIndex
CREATE INDEX "InterviewFeedback_participant_id_assignment_id_idx" ON "InterviewFeedback"("participant_id", "assignment_id");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewFeedback_participant_id_assignment_id_key" ON "InterviewFeedback"("participant_id", "assignment_id");

-- CreateIndex
CREATE INDEX "InterviewQuestion_created_by_id_idx" ON "InterviewQuestion"("created_by_id");

-- CreateIndex
CREATE INDEX "InterviewQuestion_category_idx" ON "InterviewQuestion"("category");

-- CreateIndex
CREATE INDEX "InterviewQuestion_type_idx" ON "InterviewQuestion"("type");

-- CreateIndex
CREATE INDEX "InterviewQuestion_is_active_idx" ON "InterviewQuestion"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_onboarding_id_key" ON "Offer"("onboarding_id");

-- CreateIndex
CREATE INDEX "Offer_job_id_idx" ON "Offer"("job_id");

-- CreateIndex
CREATE INDEX "Offer_applicant_id_idx" ON "Offer"("applicant_id");

-- CreateIndex
CREATE INDEX "Offer_status_idx" ON "Offer"("status");

-- CreateIndex
CREATE INDEX "Offer_created_by_id_idx" ON "Offer"("created_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_job_id_applicant_id_key" ON "Offer"("job_id", "applicant_id");

-- CreateIndex
CREATE INDEX "CvScreening_applicant_id_idx" ON "CvScreening"("applicant_id");

-- CreateIndex
CREATE INDEX "CvScreening_job_id_idx" ON "CvScreening"("job_id");

-- CreateIndex
CREATE INDEX "CvScreening_screened_by_id_idx" ON "CvScreening"("screened_by_id");

-- CreateIndex
CREATE INDEX "CvScreening_status_idx" ON "CvScreening"("status");

-- CreateIndex
CREATE INDEX "CvScreening_recommendation_idx" ON "CvScreening"("recommendation");

-- CreateIndex
CREATE UNIQUE INDEX "CvScreening_applicant_id_job_id_key" ON "CvScreening"("applicant_id", "job_id");

-- CreateIndex
CREATE INDEX "CvScreeningCriteria_job_id_idx" ON "CvScreeningCriteria"("job_id");

-- CreateIndex
CREATE INDEX "CvScreeningCriteria_category_idx" ON "CvScreeningCriteria"("category");

-- CreateIndex
CREATE INDEX "CvScreeningCriteria_job_id_category_idx" ON "CvScreeningCriteria"("job_id", "category");

-- CreateIndex
CREATE INDEX "CvScreeningCriteria_job_id_order_idx" ON "CvScreeningCriteria"("job_id", "order");

-- CreateIndex
CREATE INDEX "CvScreeningQuestion_criteria_id_idx" ON "CvScreeningQuestion"("criteria_id");

-- CreateIndex
CREATE INDEX "CvScreeningQuestion_criteria_id_order_idx" ON "CvScreeningQuestion"("criteria_id", "order");

-- CreateIndex
CREATE INDEX "CvScreeningResponse_screening_id_idx" ON "CvScreeningResponse"("screening_id");

-- CreateIndex
CREATE INDEX "CvScreeningResponse_question_id_idx" ON "CvScreeningResponse"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "CvScreeningResponse_screening_id_question_id_key" ON "CvScreeningResponse"("screening_id", "question_id");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflow_job_id_idx" ON "CvScreeningWorkflow"("job_id");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflow_created_by_id_idx" ON "CvScreeningWorkflow"("created_by_id");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflow_is_active_idx" ON "CvScreeningWorkflow"("is_active");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflowStage_workflow_id_idx" ON "CvScreeningWorkflowStage"("workflow_id");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflowStage_approver_id_idx" ON "CvScreeningWorkflowStage"("approver_id");

-- CreateIndex
CREATE INDEX "CvScreeningWorkflowStage_workflow_id_order_idx" ON "CvScreeningWorkflowStage"("workflow_id", "order");

-- CreateIndex
CREATE INDEX "CvScreeningDecision_screening_id_idx" ON "CvScreeningDecision"("screening_id");

-- CreateIndex
CREATE INDEX "CvScreeningDecision_stage_id_idx" ON "CvScreeningDecision"("stage_id");

-- CreateIndex
CREATE INDEX "CvScreeningDecision_decision_maker_id_idx" ON "CvScreeningDecision"("decision_maker_id");

-- CreateIndex
CREATE UNIQUE INDEX "CvScreeningDecision_screening_id_stage_id_key" ON "CvScreeningDecision"("screening_id", "stage_id");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_result_createdAt_idx" ON "AuditLog"("result", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");

-- CreateIndex
CREATE INDEX "AuditLog_action_resource_idx" ON "AuditLog"("action", "resource");

-- CreateIndex
CREATE INDEX "AuditExport_createdAt_idx" ON "AuditExport"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_status_createdAt_idx" ON "NotificationDelivery"("status", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationDelivery_notificationId_idx" ON "NotificationDelivery"("notificationId");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_enabled_idx" ON "WebhookEndpoint"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "SystemConfig_key_key" ON "SystemConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleConfig_module_key" ON "ModuleConfig"("module");

-- CreateIndex
CREATE UNIQUE INDEX "WorkSchedule_name_key" ON "WorkSchedule"("name");

-- CreateIndex
CREATE INDEX "WorkSchedule_is_default_idx" ON "WorkSchedule"("is_default");

-- CreateIndex
CREATE INDEX "WorkScheduleDay_schedule_id_idx" ON "WorkScheduleDay"("schedule_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkScheduleDay_schedule_id_day_of_week_key" ON "WorkScheduleDay"("schedule_id", "day_of_week");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_employee_id_idx" ON "UserWorkSchedule"("employee_id");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_schedule_id_idx" ON "UserWorkSchedule"("schedule_id");

-- CreateIndex
CREATE INDEX "UserWorkSchedule_employee_id_effective_from_idx" ON "UserWorkSchedule"("employee_id", "effective_from");

-- CreateIndex
CREATE INDEX "SuccessionPlan_position_id_idx" ON "SuccessionPlan"("position_id");

-- CreateIndex
CREATE INDEX "SuccessionPlan_candidate_employee_id_idx" ON "SuccessionPlan"("candidate_employee_id");

-- CreateIndex
CREATE INDEX "SuccessionPlan_readiness_idx" ON "SuccessionPlan"("readiness");

-- CreateIndex
CREATE UNIQUE INDEX "SuccessionPlan_position_id_candidate_employee_id_key" ON "SuccessionPlan"("position_id", "candidate_employee_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_employee_id_idx" ON "PromotionProposal"("employee_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_from_position_id_idx" ON "PromotionProposal"("from_position_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_to_position_id_idx" ON "PromotionProposal"("to_position_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_proposed_by_id_idx" ON "PromotionProposal"("proposed_by_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_approved_by_id_idx" ON "PromotionProposal"("approved_by_id");

-- CreateIndex
CREATE INDEX "PromotionProposal_status_idx" ON "PromotionProposal"("status");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_employee_id_idx" ON "CareerDevelopmentPlan"("employee_id");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_current_position_id_idx" ON "CareerDevelopmentPlan"("current_position_id");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_target_position_id_idx" ON "CareerDevelopmentPlan"("target_position_id");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_plan_year_idx" ON "CareerDevelopmentPlan"("plan_year");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_status_idx" ON "CareerDevelopmentPlan"("status");

-- CreateIndex
CREATE INDEX "CareerDevelopmentPlan_created_by_id_idx" ON "CareerDevelopmentPlan"("created_by_id");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_employee_id_idx" ON "TrainingNeedsAssessment"("employee_id");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_based_on_review_id_idx" ON "TrainingNeedsAssessment"("based_on_review_id");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_period_year_idx" ON "TrainingNeedsAssessment"("period_year");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_assessed_by_id_idx" ON "TrainingNeedsAssessment"("assessed_by_id");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_reviewed_by_id_idx" ON "TrainingNeedsAssessment"("reviewed_by_id");

-- CreateIndex
CREATE INDEX "TrainingNeedsAssessment_status_idx" ON "TrainingNeedsAssessment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "InternalTransferRequest_request_id_key" ON "InternalTransferRequest"("request_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_employee_id_idx" ON "InternalTransferRequest"("employee_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_request_type_idx" ON "InternalTransferRequest"("request_type");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_current_position_id_idx" ON "InternalTransferRequest"("current_position_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_target_position_id_idx" ON "InternalTransferRequest"("target_position_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_requested_by_id_idx" ON "InternalTransferRequest"("requested_by_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_approved_by_id_idx" ON "InternalTransferRequest"("approved_by_id");

-- CreateIndex
CREATE INDEX "InternalTransferRequest_status_idx" ON "InternalTransferRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "SalaryAdjustmentRequest_request_id_key" ON "SalaryAdjustmentRequest"("request_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_employee_id_idx" ON "SalaryAdjustmentRequest"("employee_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_proposed_by_id_idx" ON "SalaryAdjustmentRequest"("proposed_by_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_linked_review_id_idx" ON "SalaryAdjustmentRequest"("linked_review_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_linked_transfer_request_id_idx" ON "SalaryAdjustmentRequest"("linked_transfer_request_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_approved_by_id_idx" ON "SalaryAdjustmentRequest"("approved_by_id");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_effective_from_idx" ON "SalaryAdjustmentRequest"("effective_from");

-- CreateIndex
CREATE INDEX "SalaryAdjustmentRequest_status_idx" ON "SalaryAdjustmentRequest"("status");

-- CreateIndex
CREATE UNIQUE INDEX "User_keycloakId_key" ON "User"("keycloakId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_user_id_key" ON "Employee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_applicant_id_key" ON "Employee"("applicant_id");

-- CreateIndex
CREATE INDEX "Employee_user_id_idx" ON "Employee"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_employee_id_key" ON "UserProfile"("employee_id");

-- CreateIndex
CREATE INDEX "UserProfile_nationalityId_idx" ON "UserProfile"("nationalityId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeAddress_employee_id_key" ON "EmployeeAddress"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeBankDetail_employee_id_key" ON "EmployeeBankDetail"("employee_id");

-- CreateIndex
CREATE INDEX "BankAccount_employeeBankDetailId_idx" ON "BankAccount"("employeeBankDetailId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEmergencyContact_employee_id_key" ON "EmployeeEmergencyContact"("employee_id");

-- CreateIndex
CREATE INDEX "EmergencyContact_employeeEmergencyContactId_idx" ON "EmergencyContact"("employeeEmergencyContactId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeEducation_employee_id_key" ON "EmployeeEducation"("employee_id");

-- CreateIndex
CREATE INDEX "Education_employeeEducationId_idx" ON "Education"("employeeEducationId");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeContract_employee_id_key" ON "EmployeeContract"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeePolicyAcknowledgement_employee_id_key" ON "EmployeePolicyAcknowledgement"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmployment_employee_id_key" ON "UserEmployment"("employee_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserEmployment_employeeCode_key" ON "UserEmployment"("employeeCode");

-- CreateIndex
CREATE INDEX "UserEmployment_positionId_idx" ON "UserEmployment"("positionId");

-- CreateIndex
CREATE INDEX "UserEmployment_managerEmploymentId_idx" ON "UserEmployment"("managerEmploymentId");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_userEmploymentId_idx" ON "UserEmploymentHistory"("userEmploymentId");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_departmentId_idx" ON "UserEmploymentHistory"("departmentId");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_positionId_idx" ON "UserEmploymentHistory"("positionId");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_managerEmploymentId_idx" ON "UserEmploymentHistory"("managerEmploymentId");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_changedById_idx" ON "UserEmploymentHistory"("changedById");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_effectiveFrom_idx" ON "UserEmploymentHistory"("effectiveFrom");

-- CreateIndex
CREATE INDEX "UserEmploymentHistory_userEmploymentId_effectiveFrom_idx" ON "UserEmploymentHistory"("userEmploymentId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "UserCompensation_employee_id_key" ON "UserCompensation"("employee_id");

-- CreateIndex
CREATE INDEX "UserCompensationHistory_employee_id_idx" ON "UserCompensationHistory"("employee_id");

-- CreateIndex
CREATE INDEX "UserCompensationHistory_employee_id_validFrom_idx" ON "UserCompensationHistory"("employee_id", "validFrom");

-- CreateIndex
CREATE INDEX "UserCompensationHistory_employee_id_validTo_idx" ON "UserCompensationHistory"("employee_id", "validTo");

-- CreateIndex
CREATE INDEX "UserCompensationHistory_changedById_idx" ON "UserCompensationHistory"("changedById");

-- CreateIndex
CREATE INDEX "CompensationComponent_employee_id_idx" ON "CompensationComponent"("employee_id");

-- CreateIndex
CREATE INDEX "CompensationComponent_type_idx" ON "CompensationComponent"("type");

-- CreateIndex
CREATE INDEX "CompensationComponent_effective_from_idx" ON "CompensationComponent"("effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "UserLifecycle_employee_id_key" ON "UserLifecycle"("employee_id");

-- CreateIndex
CREATE INDEX "UserLifecycle_employee_id_idx" ON "UserLifecycle"("employee_id");

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_handover_delegate_id_fkey" FOREIGN KEY ("handover_delegate_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_leave_request_id_fkey" FOREIGN KEY ("leave_request_id") REFERENCES "LeaveRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveApproval" ADD CONSTRAINT "LeaveApproval_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaveBalance" ADD CONSTRAINT "LeaveBalance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceLog" ADD CONSTRAINT "AttendanceLog_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_attendance_log_id_fkey" FOREIGN KEY ("attendance_log_id") REFERENCES "AttendanceLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttendanceCorrectionRequest" ADD CONSTRAINT "AttendanceCorrectionRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_attendance_log_id_fkey" FOREIGN KEY ("attendance_log_id") REFERENCES "AttendanceLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OvertimeRequest" ADD CONSTRAINT "OvertimeRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlexWorkRequest" ADD CONSTRAINT "FlexWorkRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlexWorkRequest" ADD CONSTRAINT "FlexWorkRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timesheet" ADD CONSTRAINT "Timesheet_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Role" ADD CONSTRAINT "Role_parentRoleId_fkey" FOREIGN KEY ("parentRoleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "PermissionResource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES "PermissionAction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChunk" ADD CONSTRAINT "AiChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "AiDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiChatMessage" ADD CONSTRAINT "AiChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AiChatSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractTemplate" ADD CONSTRAINT "ContractTemplate_contractTypeId_fkey" FOREIGN KEY ("contractTypeId") REFERENCES "ContractType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ContractTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_employeeContractId_fkey" FOREIGN KEY ("employeeContractId") REFERENCES "EmployeeContract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSigner" ADD CONSTRAINT "ContractSigner_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractSigner" ADD CONSTRAINT "ContractSigner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentReport" ADD CONSTRAINT "IncidentReport_investigator_id_fkey" FOREIGN KEY ("investigator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryAction" ADD CONSTRAINT "DisciplinaryAction_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryAction" ADD CONSTRAINT "DisciplinaryAction_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Grievance" ADD CONSTRAINT "Grievance_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_nominator_id_fkey" FOREIGN KEY ("nominator_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_nominee_employee_id_fkey" FOREIGN KEY ("nominee_employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recognition" ADD CONSTRAINT "Recognition_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyResponse" ADD CONSTRAINT "SurveyResponse_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConflictMediation" ADD CONSTRAINT "ConflictMediation_requester_employee_id_fkey" FOREIGN KEY ("requester_employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConflictMediation" ADD CONSTRAINT "ConflictMediation_other_party_employee_id_fkey" FOREIGN KEY ("other_party_employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConflictMediation" ADD CONSTRAINT "ConflictMediation_mediator_id_fkey" FOREIGN KEY ("mediator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeSkill" ADD CONSTRAINT "EmployeeSkill_skill_id_fkey" FOREIGN KEY ("skill_id") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingBudget" ADD CONSTRAINT "TrainingBudget_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequest" ADD CONSTRAINT "TrainingRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequest" ADD CONSTRAINT "TrainingRequest_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequest" ADD CONSTRAINT "TrainingRequest_skill_gap_link_id_fkey" FOREIGN KEY ("skill_gap_link_id") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingRequest" ADD CONSTRAINT "TrainingRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCompletion" ADD CONSTRAINT "TrainingCompletion_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingCompletion" ADD CONSTRAINT "TrainingCompletion_training_request_id_fkey" FOREIGN KEY ("training_request_id") REFERENCES "TrainingRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingFeedbackTemplate" ADD CONSTRAINT "TrainingFeedbackTemplate_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingFeedback" ADD CONSTRAINT "TrainingFeedback_training_completion_id_fkey" FOREIGN KEY ("training_completion_id") REFERENCES "TrainingCompletion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingFeedback" ADD CONSTRAINT "TrainingFeedback_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "TrainingFeedbackTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingFeedback" ADD CONSTRAINT "TrainingFeedback_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingFeedback" ADD CONSTRAINT "TrainingFeedback_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGapAssessment" ADD CONSTRAINT "SkillGapAssessment_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillGapAssessment" ADD CONSTRAINT "SkillGapAssessment_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resignation" ADD CONSTRAINT "Resignation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resignation" ADD CONSTRAINT "Resignation_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingChecklist" ADD CONSTRAINT "OffboardingChecklist_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingChecklist" ADD CONSTRAINT "OffboardingChecklist_resignation_id_fkey" FOREIGN KEY ("resignation_id") REFERENCES "Resignation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingTask" ADD CONSTRAINT "OffboardingTask_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "OffboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingTask" ADD CONSTRAINT "OffboardingTask_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffboardingTask" ADD CONSTRAINT "OffboardingTask_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitInterview" ADD CONSTRAINT "ExitInterview_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitInterview" ADD CONSTRAINT "ExitInterview_resignation_id_fkey" FOREIGN KEY ("resignation_id") REFERENCES "Resignation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitInterview" ADD CONSTRAINT "ExitInterview_conducted_by_id_fkey" FOREIGN KEY ("conducted_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_resignation_id_fkey" FOREIGN KEY ("resignation_id") REFERENCES "Resignation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalSettlement" ADD CONSTRAINT "FinalSettlement_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReturn" ADD CONSTRAINT "AssetReturn_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetReturn" ADD CONSTRAINT "AssetReturn_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "OffboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_resignation_id_fkey" FOREIGN KEY ("resignation_id") REFERENCES "Resignation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceChecklist" ADD CONSTRAINT "ComplianceChecklist_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_task_instance_id_fkey" FOREIGN KEY ("task_instance_id") REFERENCES "OnboardingTaskInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "JobGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "CountryReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReview" ADD CONSTRAINT "PerformanceReview_period_config_id_fkey" FOREIGN KEY ("period_config_id") REFERENCES "ReviewPeriodConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReviewFeedback" ADD CONSTRAINT "PerformanceReviewFeedback_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "PerformanceReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceReviewFeedback" ADD CONSTRAINT "PerformanceReviewFeedback_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceCalibration" ADD CONSTRAINT "PerformanceCalibration_period_id_fkey" FOREIGN KEY ("period_id") REFERENCES "ReviewPeriodConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceCalibration" ADD CONSTRAINT "PerformanceCalibration_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerformanceCalibration" ADD CONSTRAINT "PerformanceCalibration_finalized_by_id_fkey" FOREIGN KEY ("finalized_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okr" ADD CONSTRAINT "Okr_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okr" ADD CONSTRAINT "Okr_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Okr" ADD CONSTRAINT "Okr_parent_okr_id_fkey" FOREIGN KEY ("parent_okr_id") REFERENCES "Okr"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_okr_id_fkey" FOREIGN KEY ("okr_id") REFERENCES "Okr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultUpdate" ADD CONSTRAINT "KeyResultUpdate_key_result_id_fkey" FOREIGN KEY ("key_result_id") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultUpdate" ADD CONSTRAINT "KeyResultUpdate_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrManagerReview" ADD CONSTRAINT "OkrManagerReview_okr_id_fkey" FOREIGN KEY ("okr_id") REFERENCES "Okr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrManagerReview" ADD CONSTRAINT "OkrManagerReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_currentVersionId_fkey" FOREIGN KEY ("currentVersionId") REFERENCES "PolicyVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyVersion" ADD CONSTRAINT "PolicyVersion_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "PolicyFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_employee_policy_acknowledgement_id_fkey" FOREIGN KEY ("employee_policy_acknowledgement_id") REFERENCES "EmployeePolicyAcknowledgement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "Policy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_policyVersionId_fkey" FOREIGN KEY ("policyVersionId") REFERENCES "PolicyVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationPlan" ADD CONSTRAINT "ProbationPlan_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationKPI" ADD CONSTRAINT "ProbationKPI_probationId_fkey" FOREIGN KEY ("probationId") REFERENCES "ProbationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationKPI" ADD CONSTRAINT "ProbationKPI_kpiId_fkey" FOREIGN KEY ("kpiId") REFERENCES "KPI"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationCheckpoint" ADD CONSTRAINT "ProbationCheckpoint_probationId_fkey" FOREIGN KEY ("probationId") REFERENCES "ProbationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckpointEvaluation" ADD CONSTRAINT "CheckpointEvaluation_checkpointId_fkey" FOREIGN KEY ("checkpointId") REFERENCES "ProbationCheckpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_probationKpiId_fkey" FOREIGN KEY ("probationKpiId") REFERENCES "ProbationKPI"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_checkpointEvaluationId_fkey" FOREIGN KEY ("checkpointEvaluationId") REFERENCES "CheckpointEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvaluationScore" ADD CONSTRAINT "EvaluationScore_finalEvaluationId_fkey" FOREIGN KEY ("finalEvaluationId") REFERENCES "FinalEvaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalEvaluation" ADD CONSTRAINT "FinalEvaluation_probationId_fkey" FOREIGN KEY ("probationId") REFERENCES "ProbationPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm" ADD CONSTRAINT "JobRequestForm_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm" ADD CONSTRAINT "JobRequestForm_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm" ADD CONSTRAINT "JobRequestForm_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobRequestForm" ADD CONSTRAINT "JobRequestForm_replace_for_user_id_fkey" FOREIGN KEY ("replace_for_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_hiring_manager_id_fkey" FOREIGN KEY ("hiring_manager_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationForm" ADD CONSTRAINT "JobApplicationForm_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationFormField" ADD CONSTRAINT "JobApplicationFormField_job_application_form_id_fkey" FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationFormSection" ADD CONSTRAINT "JobApplicationFormSection_job_application_form_id_fkey" FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationCustomField" ADD CONSTRAINT "JobApplicationCustomField_job_application_form_id_fkey" FOREIGN KEY ("job_application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplicationCustomFieldOption" ADD CONSTRAINT "JobApplicationCustomFieldOption_custom_field_row_id_fkey" FOREIGN KEY ("custom_field_row_id") REFERENCES "JobApplicationCustomField"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApprovalStep" ADD CONSTRAINT "JobApprovalStep_job_request_form_id_fkey" FOREIGN KEY ("job_request_form_id") REFERENCES "JobRequestForm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApprovalStep" ADD CONSTRAINT "JobApprovalStep_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApprovalHistory" ADD CONSTRAINT "JobApprovalHistory_approval_step_id_fkey" FOREIGN KEY ("approval_step_id") REFERENCES "JobApprovalStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApprovalHistory" ADD CONSTRAINT "JobApprovalHistory_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_application_form_id_fkey" FOREIGN KEY ("application_form_id") REFERENCES "JobApplicationForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantStatusHistory" ADD CONSTRAINT "ApplicantStatusHistory_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantStatusHistory" ADD CONSTRAINT "ApplicantStatusHistory_changed_by_id_fkey" FOREIGN KEY ("changed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantEducation" ADD CONSTRAINT "ApplicantEducation_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApplicantExperience" ADD CONSTRAINT "ApplicantExperience_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSession" ADD CONSTRAINT "InterviewSession_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewParticipant" ADD CONSTRAINT "InterviewParticipant_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewParticipant" ADD CONSTRAINT "InterviewParticipant_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerAssignment" ADD CONSTRAINT "InterviewerAssignment_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewerAssignment" ADD CONSTRAINT "InterviewerAssignment_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "InterviewParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewFeedback" ADD CONSTRAINT "InterviewFeedback_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "InterviewerAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreening" ADD CONSTRAINT "CvScreening_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreening" ADD CONSTRAINT "CvScreening_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreening" ADD CONSTRAINT "CvScreening_screened_by_id_fkey" FOREIGN KEY ("screened_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningCriteria" ADD CONSTRAINT "CvScreeningCriteria_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningQuestion" ADD CONSTRAINT "CvScreeningQuestion_criteria_id_fkey" FOREIGN KEY ("criteria_id") REFERENCES "CvScreeningCriteria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningResponse" ADD CONSTRAINT "CvScreeningResponse_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "CvScreening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningResponse" ADD CONSTRAINT "CvScreeningResponse_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "CvScreeningQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningWorkflow" ADD CONSTRAINT "CvScreeningWorkflow_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningWorkflow" ADD CONSTRAINT "CvScreeningWorkflow_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningWorkflowStage" ADD CONSTRAINT "CvScreeningWorkflowStage_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "CvScreeningWorkflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningWorkflowStage" ADD CONSTRAINT "CvScreeningWorkflowStage_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningDecision" ADD CONSTRAINT "CvScreeningDecision_screening_id_fkey" FOREIGN KEY ("screening_id") REFERENCES "CvScreening"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningDecision" ADD CONSTRAINT "CvScreeningDecision_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "CvScreeningWorkflowStage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvScreeningDecision" ADD CONSTRAINT "CvScreeningDecision_decision_maker_id_fkey" FOREIGN KEY ("decision_maker_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkScheduleDay" ADD CONSTRAINT "WorkScheduleDay_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessionPlan" ADD CONSTRAINT "SuccessionPlan_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessionPlan" ADD CONSTRAINT "SuccessionPlan_candidate_employee_id_fkey" FOREIGN KEY ("candidate_employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProposal" ADD CONSTRAINT "PromotionProposal_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProposal" ADD CONSTRAINT "PromotionProposal_from_position_id_fkey" FOREIGN KEY ("from_position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProposal" ADD CONSTRAINT "PromotionProposal_to_position_id_fkey" FOREIGN KEY ("to_position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProposal" ADD CONSTRAINT "PromotionProposal_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProposal" ADD CONSTRAINT "PromotionProposal_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDevelopmentPlan" ADD CONSTRAINT "CareerDevelopmentPlan_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDevelopmentPlan" ADD CONSTRAINT "CareerDevelopmentPlan_current_position_id_fkey" FOREIGN KEY ("current_position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDevelopmentPlan" ADD CONSTRAINT "CareerDevelopmentPlan_target_position_id_fkey" FOREIGN KEY ("target_position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareerDevelopmentPlan" ADD CONSTRAINT "CareerDevelopmentPlan_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeedsAssessment" ADD CONSTRAINT "TrainingNeedsAssessment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeedsAssessment" ADD CONSTRAINT "TrainingNeedsAssessment_based_on_review_id_fkey" FOREIGN KEY ("based_on_review_id") REFERENCES "PerformanceReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeedsAssessment" ADD CONSTRAINT "TrainingNeedsAssessment_assessed_by_id_fkey" FOREIGN KEY ("assessed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingNeedsAssessment" ADD CONSTRAINT "TrainingNeedsAssessment_reviewed_by_id_fkey" FOREIGN KEY ("reviewed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransferRequest" ADD CONSTRAINT "InternalTransferRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransferRequest" ADD CONSTRAINT "InternalTransferRequest_current_position_id_fkey" FOREIGN KEY ("current_position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransferRequest" ADD CONSTRAINT "InternalTransferRequest_target_position_id_fkey" FOREIGN KEY ("target_position_id") REFERENCES "Position"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransferRequest" ADD CONSTRAINT "InternalTransferRequest_requested_by_id_fkey" FOREIGN KEY ("requested_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternalTransferRequest" ADD CONSTRAINT "InternalTransferRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustmentRequest" ADD CONSTRAINT "SalaryAdjustmentRequest_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustmentRequest" ADD CONSTRAINT "SalaryAdjustmentRequest_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustmentRequest" ADD CONSTRAINT "SalaryAdjustmentRequest_linked_review_id_fkey" FOREIGN KEY ("linked_review_id") REFERENCES "PerformanceReview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustmentRequest" ADD CONSTRAINT "SalaryAdjustmentRequest_linked_transfer_request_id_fkey" FOREIGN KEY ("linked_transfer_request_id") REFERENCES "InternalTransferRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalaryAdjustmentRequest" ADD CONSTRAINT "SalaryAdjustmentRequest_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_applicant_id_fkey" FOREIGN KEY ("applicant_id") REFERENCES "Applicant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "CountryReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAddress" ADD CONSTRAINT "EmployeeAddress_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAddress" ADD CONSTRAINT "EmployeeAddress_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeBankDetail" ADD CONSTRAINT "EmployeeBankDetail_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_employeeBankDetailId_fkey" FOREIGN KEY ("employeeBankDetailId") REFERENCES "EmployeeBankDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEmergencyContact" ADD CONSTRAINT "EmployeeEmergencyContact_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_employeeEmergencyContactId_fkey" FOREIGN KEY ("employeeEmergencyContactId") REFERENCES "EmployeeEmergencyContact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryReference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeEducation" ADD CONSTRAINT "EmployeeEducation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Education" ADD CONSTRAINT "Education_employeeEducationId_fkey" FOREIGN KEY ("employeeEducationId") REFERENCES "EmployeeEducation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeContract" ADD CONSTRAINT "EmployeeContract_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePolicyAcknowledgement" ADD CONSTRAINT "EmployeePolicyAcknowledgement_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmployment" ADD CONSTRAINT "UserEmployment_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmployment" ADD CONSTRAINT "UserEmployment_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmployment" ADD CONSTRAINT "UserEmployment_managerEmploymentId_fkey" FOREIGN KEY ("managerEmploymentId") REFERENCES "UserEmployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmploymentHistory" ADD CONSTRAINT "UserEmploymentHistory_userEmploymentId_fkey" FOREIGN KEY ("userEmploymentId") REFERENCES "UserEmployment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmploymentHistory" ADD CONSTRAINT "UserEmploymentHistory_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmploymentHistory" ADD CONSTRAINT "UserEmploymentHistory_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmploymentHistory" ADD CONSTRAINT "UserEmploymentHistory_managerEmploymentId_fkey" FOREIGN KEY ("managerEmploymentId") REFERENCES "UserEmployment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserEmploymentHistory" ADD CONSTRAINT "UserEmploymentHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompensation" ADD CONSTRAINT "UserCompensation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompensationHistory" ADD CONSTRAINT "UserCompensationHistory_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCompensationHistory" ADD CONSTRAINT "UserCompensationHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompensationComponent" ADD CONSTRAINT "CompensationComponent_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifecycle" ADD CONSTRAINT "UserLifecycle_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLifecycle" ADD CONSTRAINT "UserLifecycle_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
