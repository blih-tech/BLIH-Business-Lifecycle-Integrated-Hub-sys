import type { SkillLevel } from '../hr/training/skill.js';
import type { Gender } from '../users/user-profile.js';
import type { CandidateSource } from './jobs.js';

/** Const array for validation/Swagger */
export const CANDIDATE_SOURCES = [
  'COMPANY_SITE',
  'LINKEDIN',
  'TELEGRAM',
  'REFERRAL',
  'AGENCY',
] as const;

export interface CreateCandidateDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  gender?: Gender | null;
  yearsExperience?: number | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  githubUrl?: string | null;
  source?: CandidateSource;
  referredById?: string | null;
  resumeUrl?: string | null;
  skills?: Array<{
    name: string;
    level?: SkillLevel | null;
    years?: number | null;
  }>;
  location?: string | null;
  country?: string | null;
  city?: string | null;
  nationality?: string | null;
  expectedSalary?: number | null;
  currentSalary?: number | null;
  educationLevel?: string | null;
  highestDegree?: string | null;
  educations?: CandidateEducationDto[];
  experiences?: CandidateExperienceDto[];
}

export type UpdateCandidateDto = Partial<CreateCandidateDto>;

export interface CandidateSkillDto {
  id: string;
  name: string;
  level: SkillLevel | null;
  years: number | null;
}

export interface CandidateEducationDto {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string | null;
  endDate: string | null;
}

export interface CandidateExperienceDto {
  id?: string;
  company: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface CandidateResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  gender: Gender | null;
  yearsExperience: number | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  githubUrl: string | null;
  source: CandidateSource;
  referredById: string | null;
  resumeUrl: string | null;
  skills: CandidateSkillDto[];
  location: string | null;
  country: string | null;
  city: string | null;
  nationality: string | null;
  expectedSalary: string | null;
  currentSalary: string | null;
  educationLevel: string | null;
  highestDegree: string | null;
  lastActivityAt: string | null;
  profileScore: number | null;
  educations: CandidateEducationDto[];
  experiences: CandidateExperienceDto[];
  createdAt: string;
  updatedAt: string;
}
