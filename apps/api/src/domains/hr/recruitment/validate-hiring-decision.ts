import { BadRequestException } from '@nestjs/common';
import type { HiringDecisionOutcome } from '@repo/types';

/**
 * Enforce: when finalDecision is OFFER_APPROVED, offer must be non-null and non-empty.
 * Call this from create/update hiring decision use cases.
 */
export function validateHiringDecisionOffer(
  finalDecision: HiringDecisionOutcome | null | undefined,
  offer: unknown,
): void {
  if (finalDecision !== 'OFFER_APPROVED') return;
  if (
    offer == null ||
    (typeof offer === 'object' && Object.keys(offer as object).length === 0)
  ) {
    throw new BadRequestException(
      'Offer is required when final decision is OFFER_APPROVED',
    );
  }
}
