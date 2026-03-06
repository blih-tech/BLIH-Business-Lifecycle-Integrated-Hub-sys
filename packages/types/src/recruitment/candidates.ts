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
}

export type UpdateCandidateDto = Partial<CreateCandidateDto>;

export interface CandidateSkillDto {
  id: string;
  name: string;
  level: SkillLevel | null;
  years: number | null;
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
  createdAt: string;
  updatedAt: string;
}
