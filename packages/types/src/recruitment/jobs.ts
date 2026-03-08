import type { SkillLevel } from '../hr/training/skill.js';
import type { EmploymentType, Gender } from '../users/user-profile.js';

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

export type JobSalaryMode = 'NOT_SPECIFIED' | 'NEGOTIABLE' | 'COMPETITIVE';
export type JobPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type JobApplicationFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'FILE'
  | 'DATE'
  | 'CHECKBOX';

export type JobPredefinedFieldKey =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'resume'
  | 'coverLetter'
  | 'linkedin'
  | 'portfolio'
  | 'github'
  | 'currentCompany'
  | 'currentPosition'
  | 'yearsExperience';

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
  'NEGOTIABLE',
  'COMPETITIVE',
] as const;

export interface JobSkillDto {
  id: string;
  name: string;
  level?: SkillLevel | null;
  required: boolean;
  order?: number | null;
}

export interface JobToolDto {
  id: string;
  name: string;
  order?: number | null;
}

export interface JobResponsibilityDto {
  id: string;
  description: string;
  order?: number | null;
}

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
}

export type RichTextJson = Record<string, unknown>;

export interface JobDetailsFormDto {
  jobTitle: string;
  location: string;
  workMode: WorkLocationType;
  employmentType: EmploymentType;
  jobSummary: RichTextJson;
  whyJoinUs?: RichTextJson | null;
  keyResponsibilities: string;
  skills: Array<{
    name: string;
    level?: SkillLevel | null;
    required?: boolean;
    order?: number | null;
  }>;
  preferredSkills?: string | null;
  experienceLevel: ExperienceLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryMode: JobSalaryMode;
  benefits?: string[];
  openings: number;
  applicationDeadline: string;
}

export interface JobApplicationPredefinedFieldDto {
  key: JobPredefinedFieldKey;
  enabled: boolean;
  required: boolean;
}

export interface JobApplicationCustomFieldDto {
  id: string;
  label: string;
  type: JobApplicationFieldType;
  required: boolean;
  helpText?: string | null;
  options?: string[];
}

export interface JobApplicationFormDto {
  predefinedFields: JobApplicationPredefinedFieldDto[];
  customFields: JobApplicationCustomFieldDto[];
}

export interface CreateJobDto {
  requestForm: JobRequestFormDto;
  jobDetailsForm: JobDetailsFormDto;
  applicationForm: JobApplicationFormDto;
  hiringManagerId?: string | null;
  priority?: JobPriority | null;
}

export type UpdateJobDto = Partial<CreateJobDto>;

export interface ApproveJobDto {
  decision: 'APPROVED' | 'REJECTED';
  stage?: JobApprovalStage | null;
  comments?: string | null;
}

export interface CloseJobDto {
  reason?: string | null;
}

export interface UpsertJobSkillsDto {
  skills: Array<{
    name: string;
    level?: SkillLevel | null;
    required?: boolean;
    order?: number | null;
  }>;
}

export interface UpsertJobToolsDto {
  tools: Array<{
    name: string;
    order?: number | null;
  }>;
}

export interface UpsertJobResponsibilitiesDto {
  responsibilities: Array<{
    description: string;
    order?: number | null;
  }>;
}

export interface JobResponseDto {
  id: string;
  slug: string;
  status: JobWorkflowStatus;
  financeApprovalStatus: JobStageApprovalStatus;
  gmApprovalStatus: JobStageApprovalStatus;
  hrApprovalStatus: JobStageApprovalStatus;
  creatorIsHr: boolean;
  priority: JobPriority | null;
  hiringManagerId: string | null;
  draftedAt: string | null;
  pendingApprovalAt: string | null;
  readyToPostAt: string | null;
  publishedAt: string | null;
  closedAt: string | null;
  rejectedAt: string | null;
  closingReason: string | null;
  viewsCount: number;
  applicationsCount: number;
  shortlistedCount: number;
  interviewsCount: number;
  offersCount: number;
  hiresCount: number;
  createdById: string | null;
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
  } | null;
  jobDetailsForm: {
    id: string;
    jobTitle: string;
    location: string;
    workMode: WorkLocationType;
    employmentType: EmploymentType;
    jobSummary: RichTextJson;
    whyJoinUs: RichTextJson | null;
    keyResponsibilities: string;
    skills: JobSkillDto[];
    preferredSkills: string | null;
    experienceLevel: ExperienceLevel;
    salaryMin: string | null;
    salaryMax: string | null;
    salaryCurrency: string | null;
    salaryMode: JobSalaryMode;
    benefits: string[];
    openings: number;
    applicationDeadline: string | null;
  } | null;
  applicationForm: {
    id: string;
    predefinedFields: Array<{
      id: string;
      key: JobPredefinedFieldKey;
      label: string;
      type: JobApplicationFieldType;
      enabled: boolean;
      required: boolean;
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
  skills: JobSkillDto[];
  tools: JobToolDto[];
  responsibilities: JobResponsibilityDto[];
  createdAt: string;
  updatedAt: string;
}

export interface CandidateLiteDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: Gender | null;
  yearsExperience?: number | null;
}
