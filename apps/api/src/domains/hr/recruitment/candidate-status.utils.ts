import { BadRequestException } from '@nestjs/common';
import type { CandidateStatus } from '@repo/types';

const ALLOWED_TRANSITIONS: Record<CandidateStatus, CandidateStatus[]> = {
  NEW: ['SCREENING', 'REJECTED', 'WITHDRAWN'],
  SCREENING: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_STAGE', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_STAGE: ['OFFER_PENDING', 'REJECTED', 'WITHDRAWN'],
  OFFER_PENDING: ['HIRED', 'REJECTED', 'WITHDRAWN'],
  HIRED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export function assertCandidateStatusTransition(
  currentStatus: CandidateStatus,
  nextStatus: CandidateStatus,
) {
  if (currentStatus === nextStatus) return;

  if (!ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) {
    throw new BadRequestException(
      `Candidate status cannot transition from ${currentStatus} to ${nextStatus}`,
    );
  }
}
