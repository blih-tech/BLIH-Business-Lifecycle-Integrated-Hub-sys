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
CREATE TYPE "ContractType" AS ENUM ('INITIAL', 'RENEWAL', 'AMENDMENT', 'ADDENDUM');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED');

-- CreateEnum
CREATE TYPE "JobWorkflowStatus" AS ENUM ('DRAFT', 'PENDING_FINANCE', 'PENDING_GM', 'PENDING_HR_REVIEW', 'APPROVED', 'PUBLISHED', 'CLOSED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "JobApprovalStage" AS ENUM ('FINANCE', 'GM', 'HR_REVIEW');

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
CREATE TYPE "JobApplicationStatus" AS ENUM ('NEW', 'SCREENING', 'SHORTLISTED', 'INTERVIEW_STAGE', 'OFFER_PENDING', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('HR_SCREENING', 'TECHNICAL', 'BEHAVIORAL', 'PANEL', 'FINAL');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "EndorsementLevel" AS ENUM ('STRONG_YES', 'YES', 'UNCERTAIN', 'NO');

-- CreateEnum
CREATE TYPE "HiringDecisionOutcome" AS ENUM ('OFFER_APPROVED', 'OFFER_DECLINED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OnboardingChecklistStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "OnboardingTaskDepartment" AS ENUM ('HR', 'IT', 'ADMIN', 'TEAM');

-- CreateEnum
CREATE TYPE "OnboardingTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ProbationPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProbationEvaluationRound" AS ENUM ('DAY_30', 'DAY_55', 'DAY_60_FINAL');

-- CreateEnum
CREATE TYPE "ProbationRecommendation" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

-- CreateEnum
CREATE TYPE "ProbationConfirmationVerdict" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

-- CreateEnum
CREATE TYPE "ApprovalDecision" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

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
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "AssetProvisioningStatus" AS ENUM ('PENDING', 'APPROVED', 'PROVISIONED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProbationFinalDecision" AS ENUM ('CONFIRM', 'EXTEND', 'TERMINATE');

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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "UserProfile" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "gender" "Gender",
    "nationalityId" UUID,
    "maritalStatus" "MaritalStatus",
    "avatarUrl" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "countryId" UUID,
    "postalCode" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLifecycle_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Contract" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "contract_type" "ContractType" NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "trial_applies" BOOLEAN NOT NULL DEFAULT false,
    "trial_end_date" DATE,
    "trial_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "document_url" TEXT,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "synced_to_finance" BOOLEAN NOT NULL DEFAULT false,
    "synced_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Job" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "department_id" UUID,
    "position_id" UUID,
    "description" TEXT NOT NULL,
    "summary" TEXT,
    "experience_level" "ExperienceLevel",
    "contract_type" "JobContractType" NOT NULL,
    "employment_type" "EmploymentType",
    "work_location_type" "WorkLocationType" NOT NULL,
    "remote_scope" "RemoteScope",
    "city" VARCHAR(128),
    "country" VARCHAR(128),
    "openings" INTEGER NOT NULL DEFAULT 1,
    "salary_min" DECIMAL(12,2),
    "salary_max" DECIMAL(12,2),
    "currency" VARCHAR(8),
    "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "JobWorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "creator_is_hr" BOOLEAN NOT NULL DEFAULT false,
    "application_deadline" TIMESTAMP(3),
    "published_at" TIMESTAMP(3),
    "created_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApproval" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "stage" "JobApprovalStage" NOT NULL,
    "required_role" VARCHAR(64) NOT NULL,
    "approver_id" UUID,
    "decision" "ApprovalDecision" NOT NULL DEFAULT 'PENDING',
    "auto_approved" BOOLEAN NOT NULL DEFAULT false,
    "auto_approval_reason" VARCHAR(128),
    "comments" TEXT,
    "decided_at" TIMESTAMP(3),
    "level" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobApproval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobSkill" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "level" "SkillLevel",
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobTool" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobTool_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobResponsibility" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobResponsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Candidate" (
    "id" UUID NOT NULL,
    "first_name" VARCHAR(120) NOT NULL,
    "last_name" VARCHAR(120) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "email_normalized" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(64),
    "gender" "Gender",
    "years_experience" INTEGER,
    "linkedin_url" TEXT,
    "portfolio_url" TEXT,
    "github_url" TEXT,
    "source" "CandidateSource" NOT NULL DEFAULT 'COMPANY_SITE',
    "referred_by_id" UUID,
    "resume_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandidateSkill" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "name" VARCHAR(128) NOT NULL,
    "level" "SkillLevel",
    "years" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CandidateSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'NEW',
    "cover_letter" TEXT,
    "expected_salary" DECIMAL(12,2),
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source_snapshot" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "type" "InterviewType" NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "interviewer_id" UUID,
    "interviewers" JSONB,
    "feedback" TEXT,
    "endorsement" "EndorsementLevel",
    "score" DECIMAL(5,2),
    "next_action" VARCHAR(64),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HiringDecision" (
    "id" UUID NOT NULL,
    "decision_id" VARCHAR(32) NOT NULL,
    "job_application_id" UUID NOT NULL,
    "candidate_summary" JSONB,
    "offer" JSONB,
    "selection_reasoning" TEXT,
    "key_assets" JSONB,
    "attachments" JSONB,
    "submitted_by_id" UUID NOT NULL,
    "submitted_at" TIMESTAMP(3),
    "final_decision" "HiringDecisionOutcome",
    "offer_document_url" TEXT,
    "candidate_notified_at" TIMESTAMP(3),
    "offer_accepted" BOOLEAN NOT NULL DEFAULT false,
    "accepted_at" TIMESTAMP(3),
    "offer_expires_at" TIMESTAMP(3),
    "employee_id" UUID,
    "onboarding_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiringDecision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Onboarding" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'PENDING',
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingChecklist" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "onboarding_id" UUID,
    "hiring_decision_id" UUID,
    "join_date" DATE NOT NULL,
    "overseer_id" UUID,
    "total_items" INTEGER NOT NULL DEFAULT 0,
    "completed_items" INTEGER NOT NULL DEFAULT 0,
    "status" "OnboardingChecklistStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "team_lead_verified_at" TIMESTAMP(3),
    "ceo_sign_off_required" BOOLEAN NOT NULL DEFAULT false,
    "ceo_sign_off_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OnboardingTask" (
    "id" UUID NOT NULL,
    "checklist_id" UUID NOT NULL,
    "department" "OnboardingTaskDepartment" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "due_date" DATE,
    "assigned_to_id" UUID,
    "status" "OnboardingTaskStatus" NOT NULL DEFAULT 'PENDING',
    "completed_at" TIMESTAMP(3),
    "completed_by_id" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OnboardingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssetProvisioning" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "equipment" JSONB,
    "platform_permissions" JSONB,
    "it_supervisor_approved_at" TIMESTAMP(3),
    "admin_approved_at" TIMESTAMP(3),
    "finance_approval_required" BOOLEAN NOT NULL DEFAULT false,
    "status" "AssetProvisioningStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetProvisioning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolicyAcknowledgement" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "policies" JSONB,
    "all_acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "confirmed_at" TIMESTAMP(3),
    "system_access_granted_at" TIMESTAMP(3),
    "verified_by_id" UUID,
    "verified_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PolicyAcknowledgement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationKpiPlan" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "supervisor_id" UUID,
    "probation_start" DATE NOT NULL,
    "probation_end" DATE NOT NULL,
    "goals" JSONB,
    "development" JSONB,
    "employee_endorsed_at" TIMESTAMP(3),
    "supervisor_endorsed_at" TIMESTAMP(3),
    "hr_endorsed_at" TIMESTAMP(3),
    "status" "ProbationPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationKpiPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationEvaluation" (
    "id" UUID NOT NULL,
    "kpi_plan_id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "evaluation_round" "ProbationEvaluationRound" NOT NULL,
    "evaluation_date" DATE NOT NULL,
    "goal_reviews" JSONB,
    "conduct" JSONB,
    "average_rating" DECIMAL(5,2),
    "supervisor_recommendation" "ProbationRecommendation",
    "hr_remarks" TEXT,
    "hr_verdict" "ProbationRecommendation",
    "employee_acknowledged_at" TIMESTAMP(3),
    "supervisor_approved_at" TIMESTAMP(3),
    "hr_approved_at" TIMESTAMP(3),
    "ceo_approved_at" TIMESTAMP(3),
    "final_decision" "ProbationFinalDecision",
    "extension_days" INTEGER,
    "new_end_date" DATE,
    "employee_status_updated_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProbationConfirmation" (
    "id" UUID NOT NULL,
    "employee_id" UUID NOT NULL,
    "review_summary" JSONB,
    "verdict" "ProbationConfirmationVerdict" NOT NULL,
    "extension" JSONB,
    "termination" JSONB,
    "confirmation" JSONB,
    "hr_checked_at" TIMESTAMP(3),
    "ceo_sign_off_at" TIMESTAMP(3),
    "employee_notified_at" TIMESTAMP(3),
    "archived_in_employee_file" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProbationConfirmation_pkey" PRIMARY KEY ("id")
);

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
CREATE INDEX "Employee_user_id_idx" ON "Employee"("user_id");

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
CREATE UNIQUE INDEX "UserProfile_employee_id_key" ON "UserProfile"("employee_id");

-- CreateIndex
CREATE INDEX "UserProfile_nationalityId_idx" ON "UserProfile"("nationalityId");

-- CreateIndex
CREATE INDEX "UserProfile_countryId_idx" ON "UserProfile"("countryId");

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
CREATE INDEX "Holiday_date_idx" ON "Holiday"("date");

-- CreateIndex
CREATE INDEX "Holiday_country_id_idx" ON "Holiday"("country_id");

-- CreateIndex
CREATE UNIQUE INDEX "Holiday_name_date_country_id_key" ON "Holiday"("name", "date", "country_id");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_idx" ON "EmployeeDocument"("employee_id");

-- CreateIndex
CREATE INDEX "EmployeeDocument_employee_id_type_idx" ON "EmployeeDocument"("employee_id", "type");

-- CreateIndex
CREATE INDEX "EmployeeDocument_expiry_date_idx" ON "EmployeeDocument"("expiry_date");

-- CreateIndex
CREATE INDEX "EmployeeDocument_verified_by_id_idx" ON "EmployeeDocument"("verified_by_id");

-- CreateIndex
CREATE INDEX "Contract_employee_id_idx" ON "Contract"("employee_id");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_end_date_idx" ON "Contract"("end_date");

-- CreateIndex
CREATE UNIQUE INDEX "Contract_employee_id_sequence_number_key" ON "Contract"("employee_id", "sequence_number");

-- CreateIndex
CREATE UNIQUE INDEX "JobDescription_code_key" ON "JobDescription"("code");

-- CreateIndex
CREATE INDEX "JobDescription_position_id_idx" ON "JobDescription"("position_id");

-- CreateIndex
CREATE INDEX "JobDescription_title_idx" ON "JobDescription"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_department_id_idx" ON "Job"("department_id");

-- CreateIndex
CREATE INDEX "Job_position_id_idx" ON "Job"("position_id");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_created_by_id_idx" ON "Job"("created_by_id");

-- CreateIndex
CREATE INDEX "JobApproval_job_id_idx" ON "JobApproval"("job_id");

-- CreateIndex
CREATE INDEX "JobApproval_approver_id_idx" ON "JobApproval"("approver_id");

-- CreateIndex
CREATE UNIQUE INDEX "JobApproval_job_id_stage_key" ON "JobApproval"("job_id", "stage");

-- CreateIndex
CREATE UNIQUE INDEX "JobApproval_job_id_level_key" ON "JobApproval"("job_id", "level");

-- CreateIndex
CREATE INDEX "JobSkill_job_id_idx" ON "JobSkill"("job_id");

-- CreateIndex
CREATE INDEX "JobSkill_job_id_order_idx" ON "JobSkill"("job_id", "order");

-- CreateIndex
CREATE INDEX "JobTool_job_id_idx" ON "JobTool"("job_id");

-- CreateIndex
CREATE INDEX "JobTool_job_id_order_idx" ON "JobTool"("job_id", "order");

-- CreateIndex
CREATE INDEX "JobResponsibility_job_id_idx" ON "JobResponsibility"("job_id");

-- CreateIndex
CREATE INDEX "JobResponsibility_job_id_order_idx" ON "JobResponsibility"("job_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Candidate_email_normalized_key" ON "Candidate"("email_normalized");

-- CreateIndex
CREATE INDEX "Candidate_referred_by_id_idx" ON "Candidate"("referred_by_id");

-- CreateIndex
CREATE INDEX "Candidate_email_idx" ON "Candidate"("email");

-- CreateIndex
CREATE INDEX "CandidateSkill_candidate_id_idx" ON "CandidateSkill"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "CandidateSkill_candidate_id_name_key" ON "CandidateSkill"("candidate_id", "name");

-- CreateIndex
CREATE INDEX "JobApplication_job_id_idx" ON "JobApplication"("job_id");

-- CreateIndex
CREATE INDEX "JobApplication_candidate_id_idx" ON "JobApplication"("candidate_id");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_job_id_candidate_id_key" ON "JobApplication"("job_id", "candidate_id");

-- CreateIndex
CREATE INDEX "Interview_application_id_idx" ON "Interview"("application_id");

-- CreateIndex
CREATE INDEX "Interview_interviewer_id_idx" ON "Interview"("interviewer_id");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Interview_application_id_round_key" ON "Interview"("application_id", "round");

-- CreateIndex
CREATE UNIQUE INDEX "HiringDecision_decision_id_key" ON "HiringDecision"("decision_id");

-- CreateIndex
CREATE UNIQUE INDEX "HiringDecision_onboarding_id_key" ON "HiringDecision"("onboarding_id");

-- CreateIndex
CREATE INDEX "HiringDecision_job_application_id_idx" ON "HiringDecision"("job_application_id");

-- CreateIndex
CREATE INDEX "HiringDecision_submitted_by_id_idx" ON "HiringDecision"("submitted_by_id");

-- CreateIndex
CREATE INDEX "HiringDecision_final_decision_idx" ON "HiringDecision"("final_decision");

-- CreateIndex
CREATE INDEX "HiringDecision_offer_accepted_idx" ON "HiringDecision"("offer_accepted");

-- CreateIndex
CREATE INDEX "Onboarding_employee_id_idx" ON "Onboarding"("employee_id");

-- CreateIndex
CREATE INDEX "Onboarding_status_idx" ON "Onboarding"("status");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_employee_id_idx" ON "OnboardingChecklist"("employee_id");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_onboarding_id_idx" ON "OnboardingChecklist"("onboarding_id");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_hiring_decision_id_idx" ON "OnboardingChecklist"("hiring_decision_id");

-- CreateIndex
CREATE INDEX "OnboardingChecklist_status_idx" ON "OnboardingChecklist"("status");

-- CreateIndex
CREATE INDEX "OnboardingTask_checklist_id_idx" ON "OnboardingTask"("checklist_id");

-- CreateIndex
CREATE INDEX "OnboardingTask_assigned_to_id_idx" ON "OnboardingTask"("assigned_to_id");

-- CreateIndex
CREATE INDEX "OnboardingTask_status_idx" ON "OnboardingTask"("status");

-- CreateIndex
CREATE INDEX "AssetProvisioning_employee_id_idx" ON "AssetProvisioning"("employee_id");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgement_employee_id_idx" ON "PolicyAcknowledgement"("employee_id");

-- CreateIndex
CREATE INDEX "PolicyAcknowledgement_verified_by_id_idx" ON "PolicyAcknowledgement"("verified_by_id");

-- CreateIndex
CREATE INDEX "ProbationKpiPlan_employee_id_idx" ON "ProbationKpiPlan"("employee_id");

-- CreateIndex
CREATE INDEX "ProbationKpiPlan_status_idx" ON "ProbationKpiPlan"("status");

-- CreateIndex
CREATE INDEX "ProbationEvaluation_kpi_plan_id_idx" ON "ProbationEvaluation"("kpi_plan_id");

-- CreateIndex
CREATE INDEX "ProbationEvaluation_employee_id_idx" ON "ProbationEvaluation"("employee_id");

-- CreateIndex
CREATE INDEX "ProbationEvaluation_evaluation_round_idx" ON "ProbationEvaluation"("evaluation_round");

-- CreateIndex
CREATE INDEX "ProbationConfirmation_employee_id_idx" ON "ProbationConfirmation"("employee_id");

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
CREATE INDEX "OkrManagerReview_okr_id_idx" ON "OkrManagerReview"("okr_id");

-- CreateIndex
CREATE INDEX "OkrManagerReview_reviewer_id_idx" ON "OkrManagerReview"("reviewer_id");

-- CreateIndex
CREATE INDEX "OkrManagerReview_decision_idx" ON "OkrManagerReview"("decision");

-- CreateIndex
CREATE UNIQUE INDEX "OkrManagerReview_okr_id_reviewer_id_key" ON "OkrManagerReview"("okr_id", "reviewer_id");

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

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Position" ADD CONSTRAINT "Position_grade_id_fkey" FOREIGN KEY ("grade_id") REFERENCES "JobGrade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_nationalityId_fkey" FOREIGN KEY ("nationalityId") REFERENCES "CountryReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProfile" ADD CONSTRAINT "UserProfile_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "CountryReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "NotificationDelivery" ADD CONSTRAINT "NotificationDelivery_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkScheduleDay" ADD CONSTRAINT "WorkScheduleDay_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkSchedule" ADD CONSTRAINT "UserWorkSchedule_schedule_id_fkey" FOREIGN KEY ("schedule_id") REFERENCES "WorkSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "CountryReference"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeDocument" ADD CONSTRAINT "EmployeeDocument_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobDescription" ADD CONSTRAINT "JobDescription_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_position_id_fkey" FOREIGN KEY ("position_id") REFERENCES "Position"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApproval" ADD CONSTRAINT "JobApproval_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApproval" ADD CONSTRAINT "JobApproval_approver_id_fkey" FOREIGN KEY ("approver_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobSkill" ADD CONSTRAINT "JobSkill_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobTool" ADD CONSTRAINT "JobTool_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobResponsibility" ADD CONSTRAINT "JobResponsibility_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Candidate" ADD CONSTRAINT "Candidate_referred_by_id_fkey" FOREIGN KEY ("referred_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandidateSkill" ADD CONSTRAINT "CandidateSkill_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "Candidate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "JobApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_job_application_id_fkey" FOREIGN KEY ("job_application_id") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_submitted_by_id_fkey" FOREIGN KEY ("submitted_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HiringDecision" ADD CONSTRAINT "HiringDecision_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Onboarding" ADD CONSTRAINT "Onboarding_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_onboarding_id_fkey" FOREIGN KEY ("onboarding_id") REFERENCES "Onboarding"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_hiring_decision_id_fkey" FOREIGN KEY ("hiring_decision_id") REFERENCES "HiringDecision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingChecklist" ADD CONSTRAINT "OnboardingChecklist_overseer_id_fkey" FOREIGN KEY ("overseer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_checklist_id_fkey" FOREIGN KEY ("checklist_id") REFERENCES "OnboardingChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OnboardingTask" ADD CONSTRAINT "OnboardingTask_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssetProvisioning" ADD CONSTRAINT "AssetProvisioning_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolicyAcknowledgement" ADD CONSTRAINT "PolicyAcknowledgement_verified_by_id_fkey" FOREIGN KEY ("verified_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationKpiPlan" ADD CONSTRAINT "ProbationKpiPlan_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationEvaluation" ADD CONSTRAINT "ProbationEvaluation_kpi_plan_id_fkey" FOREIGN KEY ("kpi_plan_id") REFERENCES "ProbationKpiPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationEvaluation" ADD CONSTRAINT "ProbationEvaluation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProbationConfirmation" ADD CONSTRAINT "ProbationConfirmation_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "OkrManagerReview" ADD CONSTRAINT "OkrManagerReview_okr_id_fkey" FOREIGN KEY ("okr_id") REFERENCES "Okr"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OkrManagerReview" ADD CONSTRAINT "OkrManagerReview_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
