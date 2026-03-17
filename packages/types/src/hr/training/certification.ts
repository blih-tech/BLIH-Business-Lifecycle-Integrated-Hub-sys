import type { CompletionStatus, SkillsAcquiredItem } from './completion.js';

export type CertificationStatus =
  | 'ACTIVE'
  | 'EXPIRING_SOON'
  | 'EXPIRED'
  | 'NO_EXPIRY';

export interface CertificationResponseDto {
  id: string;
  employeeId: string;
  trainingRequestId: string | null;
  title: string;
  provider: string | null;
  completionStatus: CompletionStatus;
  certificateNumber: string | null;
  certificateUrl: string | null;
  issuedAt: string | null;
  expiryDate: string | null;
  scoreOrGrade: string | null;
  status: CertificationStatus;
  daysUntilExpiry: number | null;
  skillsAcquired: SkillsAcquiredItem[] | null;
  syncedToProfile: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCertificationDto {
  employeeId: string;
  trainingRequestId?: string | null;
  title: string;
  provider?: string | null;
  issuedAt?: string | null;
  scoreOrGrade?: string | null;
  certificateNumber?: string | null;
  certificateUrl?: string | null;
  expiryDate?: string | null;
  skillsAcquired?: SkillsAcquiredItem[] | null;
  attestedAt?: string | null;
}

export interface UpdateCertificationDto {
  title?: string;
  provider?: string | null;
  issuedAt?: string | null;
  scoreOrGrade?: string | null;
  certificateNumber?: string | null;
  certificateUrl?: string | null;
  expiryDate?: string | null;
  skillsAcquired?: SkillsAcquiredItem[] | null;
  syncedToProfile?: boolean;
}

export interface RenewCertificationDto {
  renewalDate?: string | null;
  expiryDate: string;
  certificateNumber?: string | null;
  certificateUrl?: string | null;
  scoreOrGrade?: string | null;
  skillsAcquired?: SkillsAcquiredItem[] | null;
}
