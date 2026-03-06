import type { SkillLevel } from '../hr/training/skill.js';
import type { EmploymentType, Gender } from '../users/user-profile.js';

export type JobWorkflowStatus =
  | 'DRAFT'
  | 'PENDING_FINANCE'
  | 'PENDING_GM'
  | 'PENDING_HR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'REJECTED';

export type JobApprovalStage = 'FINANCE' | 'GM' | 'HR_REVIEW';

export type JobContractType =
  | 'PERMANENT'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export type WorkLocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export type RemoteScope = 'CITY' | 'COUNTRY' | 'REGION' | 'GLOBAL';

export type ExperienceLevel =
  | 'ENTRY'
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'PRINCIPAL';

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

/** Const array for validation/Swagger (Job workflow: DRAFT -> ... -> PUBLISHED) */
export const JOB_WORKFLOW_STATUSES = [
  'DRAFT',
  'PENDING_FINANCE',
  'PENDING_GM',
  'PENDING_HR_REVIEW',
  'APPROVED',
  'PUBLISHED',
  'CLOSED',
  'REJECTED',
] as const;

export const JOB_APPROVAL_STAGES = ['FINANCE', 'GM', 'HR_REVIEW'] as const;

export const APPROVAL_DECISIONS = ['PENDING', 'APPROVED', 'REJECTED'] as const;

export const JOB_CONTRACT_TYPES = [
  'PERMANENT',
  'CONTRACT',
  'INTERNSHIP',
  'FREELANCE',
] as const;

export const WORK_LOCATION_TYPES = ['ON_SITE', 'HYBRID', 'REMOTE'] as const;

export const REMOTE_SCOPES = ['CITY', 'COUNTRY', 'REGION', 'GLOBAL'] as const;

export const EXPERIENCE_LEVELS = [
  'ENTRY',
  'JUNIOR',
  'MID',
  'SENIOR',
  'LEAD',
  'PRINCIPAL',
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

export interface CreateJobDto {
  title: string;
  departmentId: string;
  positionId: string;
  description: string;
  summary?: string | null;
  experienceLevel: ExperienceLevel;
  contractType: JobContractType;
  employmentType?: EmploymentType | null;
  workLocationType: WorkLocationType;
  remoteScope?: RemoteScope | null;
  city?: string | null;
  country?: string | null;
  openings: number;
  salaryMin: number;
  salaryMax: number;
  currency: string;
  benefits?: string[];
  applicationDeadline: string;
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
  title: string;
  slug: string;
  departmentId: string;
  positionId: string;
  description: string;
  summary: string | null;
  experienceLevel: ExperienceLevel | null;
  contractType: JobContractType;
  employmentType: EmploymentType | null;
  workLocationType: WorkLocationType;
  remoteScope: RemoteScope | null;
  city: string | null;
  country: string | null;
  openings: number;
  salaryMin: string | null;
  salaryMax: string | null;
  currency: string | null;
  benefits: string[];
  status: JobWorkflowStatus;
  creatorIsHr: boolean;
  applicationDeadline: string | null;
  publishedAt: string | null;
  createdById: string | null;
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
