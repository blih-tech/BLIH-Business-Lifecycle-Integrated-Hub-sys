import type { EmploymentType } from '../users/user-profile.js';

export type JobWorkflowStatus =
  | 'DRAFT'
  | 'PENDING_FOR_APPROVAL'
  | 'READY_TO_POST'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'REJECTED';

export type JobStageApprovalStatus =
  | 'PENDING_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export type JobApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';

export type WorkLocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type ExperienceLevel =
  | 'ENTRY'
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'PRINCIPAL';

export type JobRequestType = 'NEW' | 'REPLACEMENT';

export type JobUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export type JobSalaryMode =
  | 'NOT_SPECIFIED'
  | 'FIXED'
  | 'NEGOTIABLE'
  | 'COMPETITIVE';
export type JobPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type JobContractType =
  | 'PERMANENT'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export type RemoteScope = 'CITY' | 'COUNTRY' | 'REGION' | 'GLOBAL';

export type JobApplicationFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'FILE'
  | 'DATE'
  | 'CHECKBOX';

export type JobApplicantOptionalFieldKey =
  | 'PHONE'
  | 'LINKEDIN_URL'
  | 'PORTFOLIO_URL'
  | 'GITHUB_URL'
  | 'EXPECTED_SALARY'
  | 'COVER_LETTER';

export type JobApplicationFormSectionKey = 'EDUCATION' | 'EXPERIENCE';

export type CandidateSource =
  | 'COMPANY_SITE'
  | 'LINKEDIN'
  | 'TELEGRAM'
  | 'REFERRAL'
  | 'AGENCY';

export type InterviewType =
  | 'HR_SCREENING'
  | 'TECHNICAL'
  | 'BEHAVIORAL'
  | 'PANEL'
  | 'FINAL';

export type EndorsementLevel = 'STRONG_YES' | 'YES' | 'UNCERTAIN' | 'NO';

export const JOB_WORKFLOW_STATUSES = [
  'DRAFT',
  'PENDING_FOR_APPROVAL',
  'READY_TO_POST',
  'PUBLISHED',
  'CLOSED',
  'REJECTED',
] as const;

export const JOB_STAGE_STATUSES = [
  'PENDING_FOR_APPROVAL',
  'APPROVED',
  'REJECTED',
] as const;

export const JOB_APPROVAL_STAGES = ['FINANCE', 'GM', 'HR_REVIEW'] as const;

export const APPROVAL_DECISIONS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const WORK_LOCATION_TYPES = ['ON_SITE', 'HYBRID', 'REMOTE'] as const;

export const EXPERIENCE_LEVELS = [
  'ENTRY',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
] as const;

export const JOB_REQUEST_TYPES = ['NEW', 'REPLACEMENT'] as const;
export const JOB_URGENCY_LEVELS = ['HIGH', 'MEDIUM', 'LOW'] as const;
export const JOB_SALARY_MODES = [
  'NOT_SPECIFIED',
  'FIXED',
  'NEGOTIABLE',
  'COMPETITIVE',
] as const;

export interface JobApprovalDto {
  id: string;
  stage: JobApprovalStage;
  level: number;
  requiredRole: string;
  approverId?: string | null;
  decision: 'PENDING' | 'APPROVED' | 'REJECTED';
  autoApproved: boolean;
  autoApprovalReason?: string | null;
  comments?: string | null;
  decidedAt?: string | null;
  createdAt: string;
}

export interface JobRequestFormDto {
  jobTitle: string;
  department: string;
  requestedBy: string;
  position: string;
  requestType: JobRequestType;
  replaceForUserId?: string | null;
  businessJustification: string;
  employmentType: EmploymentType;
  workMode: WorkLocationType;
  urgency: JobUrgency;
  neededByDate: string;
  priority?: JobPriority;
}

export type RichTextJson = Record<string, unknown>;

export interface JobInputDto {
  title: string;
  departmentId: string;
  positionId: string;
  description: RichTextJson;
  summary?: RichTextJson | null;
  experienceLevel?: ExperienceLevel | null;
  contractType: JobContractType;
  employmentType?: EmploymentType | null;
  workLocationType: WorkLocationType;
  city?: string | null;
  country?: string | null;
  openings?: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  salaryMode?: JobSalaryMode;
  benefits?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  responsibilities?: string[];
  tools?: string[];
  hiringManagerId?: string | null;
  applicationDeadline?: string | null;
}

export interface JobApplicationCustomFieldDto {
  id: string;
  label: string;
  type: JobApplicationFieldType;
  required: boolean;
  helpText?: string | null;
  options?: string[];
}

export interface JobApplicationFormFieldDto {
  key: JobApplicantOptionalFieldKey;
  enabled: boolean;
  required: boolean;
  order?: number | null;
}

export interface JobApplicationFormSectionDto {
  key: JobApplicationFormSectionKey;
  enabled: boolean;
  required: boolean;
  order?: number | null;
}

export interface JobApplicationFormDto {
  applicantFields: JobApplicationFormFieldDto[];
  sections: JobApplicationFormSectionDto[];
  customFields: JobApplicationCustomFieldDto[];
}

export interface CreateJobDto {
  requestForm: JobRequestFormDto;
  job: JobInputDto;
  applicationForm: JobApplicationFormDto;
}

export type UpdateJobDto = Partial<CreateJobDto>;

export interface ApproveJobDto {
  decision: 'APPROVED' | 'REJECTED';
  comments?: string | null;
}

export interface CloseJobDto {
  reason?: string | null;
}

export interface UpsertJobSkillsDto {
  requiredSkills: string[];
  preferredSkills?: string[];
}

export interface UpsertJobToolsDto {
  tools: string[];
}

export interface UpsertJobResponsibilitiesDto {
  responsibilities: string[];
}

export interface JobResponseDto {
  requestForm: {
    id: string;
    jobTitle: string;
    department: string;
    requestedBy: string;
    position: string;
    requestType: JobRequestType;
    replaceForUserId: string | null;
    businessJustification: string;
    employmentType: EmploymentType;
    workMode: WorkLocationType;
    urgency: JobUrgency;
    neededByDate: string | null;
    status: JobWorkflowStatus;
    priority: JobPriority;
    financeApprovalStatus: JobStageApprovalStatus;
    gmApprovalStatus: JobStageApprovalStatus;
    hrApprovalStatus: JobStageApprovalStatus;
    draftedAt: string | null;
    pendingApprovalAt: string | null;
    readyToPostAt: string | null;
    rejectedAt: string | null;
  } | null;
  job: {
    id: string;
    title: string;
    slug: string;
    departmentId: string;
    positionId: string;
    description: RichTextJson;
    summary: RichTextJson | null;
    experienceLevel: ExperienceLevel | null;
    contractType: JobContractType;
    employmentType: EmploymentType | null;
    workLocationType: WorkLocationType;
    city: string | null;
    country: string | null;
    openings: number;
    salaryMin: string | null;
    salaryMax: string | null;
    currency: string | null;
    salaryMode: JobSalaryMode;
    benefits: string[];
    requiredSkills: string[];
    preferredSkills: string[];
    responsibilities: string[];
    tools: string[];
    hiringManagerId: string | null;
    applicationDeadline: string | null;
    creatorIsHr: boolean;
    publishedAt: string | null;
    closedAt: string | null;
    closingReason: string | null;
    viewsCount: number;
    applicationsCount: number;
    shortlistedCount: number;
    interviewsCount: number;
    offersCount: number;
    hiresCount: number;
    createdById: string | null;
    createdAt: string;
    updatedAt: string;
  };
  applicationForm: {
    id: string;
    jobId: string;
    applicantFields: Array<{
      id: string;
      key: JobApplicantOptionalFieldKey;
      label: string;
      type: JobApplicationFieldType;
      enabled: boolean;
      required: boolean;
      helpText: string | null;
      options: string[];
      order: number | null;
    }>;
    sections: Array<{
      id: string;
      key: JobApplicationFormSectionKey;
      label: string;
      type: 'SECTION';
      enabled: boolean;
      required: boolean;
      helpText: string | null;
      options: string[];
      order: number | null;
    }>;
    customFields: Array<{
      id: string;
      label: string;
      type: JobApplicationFieldType;
      required: boolean;
      helpText: string | null;
      options: string[];
    }>;
  } | null;
  approvals: JobApprovalDto[];
}
