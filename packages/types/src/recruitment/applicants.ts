export type ApplicantStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'SCREENING'
  | 'INTERVIEW'
  | 'OFFER'
  | 'HIRED'
  | 'REJECTED';

export interface ApplicantEducationDto {
  institution: string;
  degree: string;
  field: string;
  startDate?: string | null;
  endDate?: string | null;
}

export interface ApplicantExperienceDto {
  company: string;
  title: string;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
}

export interface CreateApplicantDto {
  jobId: string;
  applicationFormId?: string | null;
  fullName: string;
  email: string;
  phone?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  source?: 'COMPANY_SITE' | 'LINKEDIN' | 'TELEGRAM' | 'REFERRAL' | 'AGENCY';
  referredById?: string | null;
  currentCompany?: string | null;
  currentPosition?: string | null;
  yearsExperience?: number | null;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  nationality?: string | null;
  expectedSalary?: number | null;
  currentSalary?: number | null;
  educationLevel?: string | null;
  highestDegree?: string | null;
  skills?: string[];
  coverLetter?: string | null;
  sourceSnapshot?: Record<string, unknown> | null;
  customFieldValues?: Record<string, unknown> | null;
  educations?: ApplicantEducationDto[];
  experiences?: ApplicantExperienceDto[];
}

export type UpdateApplicantDto = Partial<CreateApplicantDto>;

export interface UpdateApplicantStatusDto {
  status: ApplicantStatus;
  notes?: string | null;
}

export interface ApplicantResponseDto {
  id: string;
  jobId: string;
  applicationFormId: string | null;
  fullName: string;
  email: string;
  phone: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  source: 'COMPANY_SITE' | 'LINKEDIN' | 'TELEGRAM' | 'REFERRAL' | 'AGENCY';
  referredById: string | null;
  currentCompany: string | null;
  currentPosition: string | null;
  yearsExperience: number | null;
  location: string | null;
  country: string | null;
  city: string | null;
  nationality: string | null;
  expectedSalary: string | null;
  currentSalary: string | null;
  educationLevel: string | null;
  highestDegree: string | null;
  skills: string[];
  status: ApplicantStatus;
  coverLetter: string | null;
  sourceSnapshot: Record<string, unknown> | null;
  customFieldValues: Record<string, unknown> | null;
  appliedAt: string;
  shortlistedAt: string | null;
  interviewAt: string | null;
  offerAt: string | null;
  hiredAt: string | null;
  rejectedAt: string | null;
  lastActivityAt: string | null;
  profileScore: number | null;
  educations: Array<ApplicantEducationDto & { id: string }>;
  experiences: Array<ApplicantExperienceDto & { id: string }>;
  createdAt: string;
  updatedAt: string;
}
