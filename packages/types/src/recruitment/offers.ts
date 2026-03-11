import type { EmploymentType, PayFrequency } from '../users/user-profile.js';

export type OfferStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export const OFFER_STATUSES = [
  'DRAFT',
  'SENT',
  'ACCEPTED',
  'DECLINED',
  'EXPIRED',
  'WITHDRAWN',
] as const;

export interface CreateOfferDto {
  jobId: string;
  applicantId: string;
  salary?: number | null;
  currency?: string | null;
  startDate?: string | null;
  payFrequency?: PayFrequency | null;
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

export interface OfferResponseDto {
  id: string;
  jobId: string;
  applicantId: string;
  createdById: string;
  status: OfferStatus;
  salary: string | null;
  currency: string | null;
  startDate: string | null;
  payFrequency: PayFrequency | null;
  employmentType: EmploymentType | null;
  bonus: string | null;
  equity: string | null;
  offerLetterUrl: string | null;
  notes: string | null;
  sentAt: string | null;
  respondedAt: string | null;
  expiresAt: string | null;
  onboardingId: string | null;
  createdAt: string;
  updatedAt: string;
}

