export const JobRequestType = {
  NEW: 'NEW',
  REPLACEMENT: 'REPLACEMENT',
} as const;
export type JobRequestType = 'NEW' | 'REPLACEMENT';

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERN: 'INTERN',
  TEMPORARY: 'TEMPORARY',
} as const;
export type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY';

export const WorkLocationType = {
  ON_SITE: 'ON_SITE',
  HYBRID: 'HYBRID',
  REMOTE: 'REMOTE',
} as const;
export type WorkLocationType = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export const JobUrgency = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type JobUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export const JobPriority = {
  HIGH: 'HIGH',
  MEDIUM: 'MEDIUM',
  LOW: 'LOW',
} as const;
export type JobPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export const ExperienceLevel = {
  ENTRY: 'ENTRY',
  JUNIOR: 'JUNIOR',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  PRINCIPAL: 'PRINCIPAL',
} as const;
export type ExperienceLevel =
  | 'ENTRY'
  | 'JUNIOR'
  | 'MID'
  | 'SENIOR'
  | 'LEAD'
  | 'PRINCIPAL';

export const JobContractType = {
  PERMANENT: 'PERMANENT',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  FREELANCE: 'FREELANCE',
} as const;
export type JobContractType =
  | 'PERMANENT'
  | 'CONTRACT'
  | 'INTERNSHIP'
  | 'FREELANCE';

export const JobSalaryMode = {
  NOT_SPECIFIED: 'NOT_SPECIFIED',
  FIXED: 'FIXED',
  NEGOTIABLE: 'NEGOTIABLE',
  COMPETITIVE: 'COMPETITIVE',
} as const;
export type JobSalaryMode =
  | 'NOT_SPECIFIED'
  | 'FIXED'
  | 'NEGOTIABLE'
  | 'COMPETITIVE';

export const JobApplicationFieldType = {
  TEXT: 'TEXT',
  TEXTAREA: 'TEXTAREA',
  NUMBER: 'NUMBER',
  SELECT: 'SELECT',
  FILE: 'FILE',
  DATE: 'DATE',
  CHECKBOX: 'CHECKBOX',
} as const;
export type JobApplicationFieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'NUMBER'
  | 'SELECT'
  | 'FILE'
  | 'DATE'
  | 'CHECKBOX';

export const JobApplicantOptionalFieldKey = {
  FIRST_NAME: 'FIRST_NAME',
  LAST_NAME: 'LAST_NAME',
  EMAIL: 'EMAIL',
  PHONE: 'PHONE',
  RESUME_URL: 'RESUME_URL',
  LINKEDIN_URL: 'LINKEDIN_URL',
  PORTFOLIO_URL: 'PORTFOLIO_URL',
  GITHUB_URL: 'GITHUB_URL',
  CURRENT_COMPANY: 'CURRENT_COMPANY',
  YEARS_OF_EXPERIENCE: 'YEARS_OF_EXPERIENCE',
  EXPECTED_SALARY: 'EXPECTED_SALARY',
  COVER_LETTER: 'COVER_LETTER',
} as const;
export type JobApplicantOptionalFieldKey =
  | 'FIRST_NAME'
  | 'LAST_NAME'
  | 'EMAIL'
  | 'PHONE'
  | 'RESUME_URL'
  | 'LINKEDIN_URL'
  | 'PORTFOLIO_URL'
  | 'GITHUB_URL'
  | 'CURRENT_COMPANY'
  | 'YEARS_OF_EXPERIENCE'
  | 'EXPECTED_SALARY'
  | 'COVER_LETTER';

export const JobApplicationFormSectionKey = {
  EDUCATION: 'EDUCATION',
  EXPERIENCE: 'EXPERIENCE',
} as const;
export type JobApplicationFormSectionKey = 'EDUCATION' | 'EXPERIENCE';

export const JobWorkflowStatus = {
  DRAFT: 'DRAFT',
  PENDING_FOR_APPROVAL: 'PENDING_FOR_APPROVAL',
  READY_TO_POST: 'READY_TO_POST',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  REJECTED: 'REJECTED',
} as const;
export type JobWorkflowStatus =
  | 'DRAFT'
  | 'PENDING_FOR_APPROVAL'
  | 'READY_TO_POST'
  | 'PUBLISHED'
  | 'CLOSED'
  | 'REJECTED';

export const JobApprovalStatus = {
  PENDING_FOR_APPROVAL: 'PENDING_FOR_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type JobApprovalStatus =
  | 'PENDING_FOR_APPROVAL'
  | 'APPROVED'
  | 'REJECTED';

export const JobApprovalDepartment = {
  FINANCE: 'FINANCE',
  GM: 'GM',
  HR: 'HR',
} as const;
export type JobApprovalDepartment = 'FINANCE' | 'GM' | 'HR';

export const ApprovalDecision = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED';

export const ApproveJobDecision = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;
export type ApproveJobDecision = 'APPROVED' | 'REJECTED';

export type RichTextJson = Record<string, unknown>;

export interface JobApprovalDto {
  id: string;
  department: JobApprovalDepartment;
  level: number;
  requiredRole: string;
  approverId?: string | null;
  decision: ApprovalDecision;
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
  decision: ApproveJobDecision;
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

export interface JobSkillsResponseDto {
  requiredSkills: string[];
  preferredSkills: string[];
}

export interface JobToolsResponseDto {
  tools: string[];
}

export type JobResponsibilitiesResponseDto = string[];

export interface JobListQueryDto {
  status?: JobWorkflowStatus;
  financeApprovalStatus?: JobApprovalStatus;
  gmApprovalStatus?: JobApprovalStatus;
  hrApprovalStatus?: JobApprovalStatus;
  departmentId?: string;
}

export interface JobApprovalResponseDto {
  id: string;
  department: JobApprovalDepartment;
  level: number;
  requiredRole: string;
  approverId: string | null;
  decision: ApprovalDecision;
  autoApproved: boolean;
  autoApprovalReason: string | null;
  comments: string | null;
  decidedAt: string | null;
  createdAt: string;
}

export interface JobRequestFormStatusApprovalsDto {
  finance: JobApprovalStatus;
  gm: JobApprovalStatus;
  hr: JobApprovalStatus;
}

export interface JobRequestFormStatusDto {
  workflow: JobWorkflowStatus;
  approvals: JobRequestFormStatusApprovalsDto;
}

export interface JobRequestFormResponseDto {
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
  status: JobRequestFormStatusDto;
  priority: JobPriority;
  draftedAt: string | null;
  pendingApprovalAt: string | null;
  readyToPostAt: string | null;
  rejectedAt: string | null;
}

export interface JobDataResponseDto {
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
}

export interface JobApplicationFormFieldResponseDto {
  id: string;
  key: JobApplicantOptionalFieldKey;
  label: string;
  type: JobApplicationFieldType;
  enabled: boolean;
  required: boolean;
  helpText: string | null;
  options: string[];
  order: number | null;
}

export interface JobApplicationFormSectionFieldResponseDto {
  key: string;
  label: string;
  type: JobApplicationFieldType;
  required: boolean;
  helpText: string | null;
  options: string[];
  order: number;
}

export interface JobApplicationFormSectionResponseDto {
  id: string;
  key: JobApplicationFormSectionKey;
  label: string;
  type: 'SECTION';
  enabled: boolean;
  required: boolean;
  helpText: string | null;
  options: string[];
  fields: JobApplicationFormSectionFieldResponseDto[];
  order: number | null;
}

export interface JobApplicationFormResponseDto {
  id: string;
  jobId: string;
  applicantFields: JobApplicationFormFieldResponseDto[];
  sections: JobApplicationFormSectionResponseDto[];
  customFields: JobApplicationCustomFieldDto[];
}

export interface JobResponseDto {
  requestForm: JobRequestFormResponseDto | null;
  job: JobDataResponseDto;
  applicationForm: JobApplicationFormResponseDto | null;
  approvals: JobApprovalResponseDto[];
}

export interface ApiSuccessEnvelopeMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface ApiSuccessEnvelope<T> {
  success: true;
  message: string;
  data: T;
  error: null;
  meta: ApiSuccessEnvelopeMeta;
}

export type ListJobsResponse = ApiSuccessEnvelope<JobResponseDto[]>;
