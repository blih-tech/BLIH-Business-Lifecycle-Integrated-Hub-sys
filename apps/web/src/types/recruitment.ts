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

export type ApplicantStatus =
  | 'APPLIED'
  | 'SCREENING'
  | 'SHORTLISTED'
  | 'INTERVIEW'
  | 'WAITLIST'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface ApplicantResponseDto {
  id: string;
  jobId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  yearsExperience: number | null;
  expectedSalary: string | null;
  status: ApplicantStatus;
  profileScore: number | null;
  appliedAt: string;
}

export interface CreateApplicantDto {
  jobId: string;
  applicationFormId?: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  resumeUrl: string;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  source?: string;
  referredById?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  yearsExperience?: number | null;
  location?: string | null;
  nationality?: string | null;
  expectedSalary?: number | null;
  currentSalary?: number | null;
  educationLevel?: string | null;
  highestDegree?: string | null;
  skills?: string[];
  coverLetter?: string | null;
  sourceSnapshot?: Record<string, unknown> | null;
  customFieldValues?: Record<string, unknown> | null;
  educations?: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate?: string | null;
    endDate?: string | null;
  }>;
  experiences?: Array<{
    company: string;
    title: string;
    startDate?: string | null;
    endDate?: string | null;
    description?: string | null;
  }>;
}

export type ListApplicantsResponse = ApiSuccessEnvelope<ApplicantResponseDto[]>;

export type InterviewStatus =
  | 'SCHEDULED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';
export type InterviewAttendanceStatus =
  | 'SCHEDULED'
  | 'ATTENDING'
  | 'NO_SHOW'
  | 'COMPLETED'
  | 'CANCELLED';

export interface InterviewFeedbackResponseDto {
  score: number | null;
}

export interface InterviewParticipantDto {
  id: string;
  applicantId: string;
  attendanceStatus: InterviewAttendanceStatus;
}

export interface InterviewResponseDto {
  id: string;
  jobId: string;
  status: InterviewStatus;
  scheduledAt: string;
  participants: InterviewParticipantDto[];
  feedbacks: InterviewFeedbackResponseDto[];
}

export type ListInterviewsResponse = ApiSuccessEnvelope<InterviewResponseDto[]>;

export type OfferStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export interface OfferResponseDto {
  id: string;
  jobId: string;
  applicantId: string;
  status: OfferStatus;
}

export type ListOffersResponse = ApiSuccessEnvelope<OfferResponseDto[]>;

export interface RankedCandidateDto {
  candidateId: string;
  score: number;
  recommendation: string;
}

export interface ScreenCandidatesResponseDto {
  totalApplicants: number;
  rankedApplicants: RankedCandidateDto[];
}

export type ScreenCandidatesEnvelope =
  ApiSuccessEnvelope<ScreenCandidatesResponseDto>;

export type UpdateApplicantDto = Partial<CreateApplicantDto>;

export interface UpdateApplicantStatusDto {
  status: ApplicantStatus;
  notes?: string | null;
}

export interface BulkUpdateApplicantStatusDto {
  applicantIds: string[];
  status: ApplicantStatus;
  notes?: string | null;
}

export type InterviewType = 'PHONE' | 'VIDEO' | 'IN_PERSON' | 'TAKE_HOME';

export interface InterviewerAssignmentInputDto {
  interviewerId: string;
  role?: string | null;
}

export interface CreateInterviewDto {
  jobId: string;
  type: InterviewType;
  round?: number;
  status?: InterviewStatus;
  scheduledAt: string;
  durationMinutes?: number | null;
  location?: string | null;
  meetingUrl?: string | null;
  applicantIds: string[];
  interviewers: InterviewerAssignmentInputDto[];
}

export type UpdateInterviewDto = Partial<Omit<CreateInterviewDto, 'jobId'>>;

export interface SubmitFeedbackDto {
  score?: number | null;
  endorsement?: 'STRONG_HIRE' | 'HIRE' | 'MAYBE' | 'NO_HIRE' | null;
  strengths?: string[];
  weaknesses?: string[];
  notes?: string | null;
  isDraft?: boolean;
}

export interface UpdateAttendanceDto {
  attendanceStatus: InterviewAttendanceStatus;
}

export interface CreateOfferDto {
  jobId: string;
  applicantId: string;
  salary?: number | null;
  currency?: string | null;
  startDate?: string | null;
  payFrequency?:
    | 'HOURLY'
    | 'WEEKLY'
    | 'BI_WEEKLY'
    | 'MONTHLY'
    | 'YEARLY'
    | null;
  employmentType?: EmploymentType | null;
  bonus?: number | null;
  equity?: number | null;
  offerLetterUrl?: string | null;
  notes?: string | null;
  expiresAt?: string | null;
}

export type UpdateOfferDto = Partial<CreateOfferDto>;

export interface SendOfferDto {
  expiresAt?: string | null;
}

export interface RespondOfferDto {
  decision: 'ACCEPTED' | 'DECLINED';
}

export interface WithdrawOfferDto {
  reason?: string | null;
}

export interface InterviewQuestionResponseDto {
  id: string;
  question: string;
  description: string | null;
  category: string | null;
  type: string;
  options: string[];
  difficulty: number | null;
  tags: string[];
  createdById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInterviewQuestionDto {
  question: string;
  description?: string | null;
  category?: string | null;
  type: string;
  options?: string[];
  difficulty?: number | null;
  tags?: string[];
  isActive?: boolean;
}

export type UpdateInterviewQuestionDto = Partial<CreateInterviewQuestionDto>;

export type ProbationStatusValue =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED'
  | 'EXTENDED';

export interface CreateProbationDto {
  employeeId: string;
  startDate: string;
  endDate: string;
  status?: ProbationStatusValue;
  kpis?: Array<{ kpiId: string }>;
  checkpoints?: Array<{ name: string; checkpointDate: string }>;
}

export type UpdateProbationDto = Partial<CreateProbationDto>;

export interface ProbationKpiResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProbationKpiDto {
  name: string;
  description?: string | null;
}

export type UpdateProbationKpiDto = Partial<CreateProbationKpiDto>;

export interface EvaluationScoreDto {
  probationKpiId: string;
  score: number;
  comment?: string | null;
}

export interface CheckpointEvaluationResponseDto {
  id: string;
  checkpointId: string;
  checkpointName: string;
  comment: string | null;
  totalScore: number;
  scores: Array<{
    id: string;
    probationKpiId: string;
    kpiName: string;
    score: number;
    comment: string | null;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface CreateCheckpointEvaluationDto {
  checkpointId: string;
  comment?: string | null;
  scores: EvaluationScoreDto[];
}

export type UpdateCheckpointEvaluationDto =
  Partial<CreateCheckpointEvaluationDto>;

export type ProbationOutcomeValue =
  | 'CONFIRMED'
  | 'EXTENDED'
  | 'TERMINATED'
  | 'RESIGNED';

export interface FinalEvaluationResponseDto {
  id: string;
  probationId: string;
  outcome: ProbationOutcomeValue;
  comment: string | null;
  totalScore: number;
  scores: Array<{
    id: string;
    probationKpiId: string;
    kpiName: string;
    score: number;
    comment: string | null;
    createdAt: string;
  }>;
  createdAt: string;
}

export interface CreateFinalEvaluationDto {
  probationId: string;
  outcome: ProbationOutcomeValue;
  comment?: string | null;
  scores: EvaluationScoreDto[];
}
