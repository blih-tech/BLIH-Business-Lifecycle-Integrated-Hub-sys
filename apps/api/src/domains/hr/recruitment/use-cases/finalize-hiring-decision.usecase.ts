import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FinalizeHiringDecisionDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHiringDecisionResponse } from '../hiring-decision.mapper';
import { validateHiringDecisionOffer } from '../validate-hiring-decision';

@Injectable()
export class FinalizeHiringDecisionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: FinalizeHiringDecisionDto) {
    const existing = await this.prisma.hiringDecision.findUnique({
      where: { id },
      include: {
        submittedBy: { select: { email: true } },
        onboarding: { select: { status: true } },
      },
    });
    if (!existing) throw new NotFoundException('Hiring decision not found');

    validateHiringDecisionOffer(dto.finalDecision, dto.offer ?? existing.offer);

    if (dto.finalDecision === 'OFFER_APPROVED') {
      const duplicateApproved = await this.prisma.hiringDecision.findFirst({
        where: {
          recruitmentRequestId: existing.recruitmentRequestId,
          finalDecision: 'OFFER_APPROVED',
          id: { not: id },
        },
        select: { id: true },
      });
      if (duplicateApproved) {
        throw new ConflictException(
          'Only one approved hiring decision is allowed per recruitment request',
        );
      }
    }

    const finalized = await this.prisma.$transaction(async (tx) => {
      if (dto.finalDecision === 'OFFER_APPROVED') {
        await tx.candidate.update({
          where: { id: existing.candidateId },
          data: { status: 'OFFER_PENDING' },
        });
      } else if (dto.finalDecision === 'OFFER_DECLINED') {
        await tx.candidate.update({
          where: { id: existing.candidateId },
          data: { status: 'REJECTED' },
        });
      }

      return tx.hiringDecision.update({
        where: { id },
        data: {
          finalDecision: dto.finalDecision,
          offer: (dto.offer ?? existing.offer ?? undefined) as
            | object
            | undefined,
          offerExpiresAt:
            dto.offerExpiresAt === undefined
              ? undefined
              : dto.offerExpiresAt
                ? new Date(dto.offerExpiresAt)
                : null,
          offerDocumentUrl:
            dto.offerDocumentUrl === undefined
              ? undefined
              : dto.offerDocumentUrl,
          candidateNotifiedAt:
            dto.candidateNotifiedAt === undefined
              ? undefined
              : dto.candidateNotifiedAt
                ? new Date(dto.candidateNotifiedAt)
                : null,
        },
        include: {
          submittedBy: { select: { email: true } },
          onboarding: { select: { status: true } },
        },
      });
    });

    return mapHiringDecisionResponse(finalized);
  }
}
