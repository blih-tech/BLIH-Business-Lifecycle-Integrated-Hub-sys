import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateHiringDecisionDto } from '@blih/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapHiringDecisionResponse } from '../hiring-decision.mapper';

@Injectable()
export class CreateHiringDecisionUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateHiringDecisionDto, submittedById: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
      select: { id: true, jobPostingId: true },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.jobPostingId !== dto.jobPostingId) {
      throw new BadRequestException(
        'Candidate must belong to the selected job posting',
      );
    }

    const posting = await this.prisma.jobPosting.findUnique({
      where: { id: dto.jobPostingId },
      select: { id: true, recruitmentRequestId: true, status: true },
    });
    if (!posting) throw new NotFoundException('Job posting not found');
    if (posting.recruitmentRequestId !== dto.recruitmentRequestId) {
      throw new BadRequestException(
        'Job posting must belong to the selected recruitment request',
      );
    }

    const request = await this.prisma.recruitmentRequest.findUnique({
      where: { id: dto.recruitmentRequestId },
      select: { id: true, status: true },
    });
    if (!request) throw new NotFoundException('Recruitment request not found');
    if (!['APPROVED', 'COMPLETED'].includes(request.status)) {
      throw new BadRequestException(
        'Hiring decisions can only be created for approved recruitment requests',
      );
    }

    const existingDecision = await this.prisma.hiringDecision.findFirst({
      where: { candidateId: dto.candidateId },
      select: { id: true },
    });
    if (existingDecision) {
      throw new ConflictException(
        'A hiring decision already exists for this candidate',
      );
    }

    const year = new Date().getFullYear();
    const count = await this.prisma.hiringDecision.count({
      where: { decisionId: { startsWith: `DEC-${year}-` } },
    });
    const decisionId = `DEC-${year}-${String(count + 1).padStart(3, '0')}`;

    const created = await this.prisma.hiringDecision.create({
      data: {
        decisionId,
        candidateId: dto.candidateId,
        recruitmentRequestId: dto.recruitmentRequestId,
        jobPostingId: dto.jobPostingId,
        candidateSummary: (dto.candidateSummary ?? undefined) as
          | object
          | undefined,
        offer: (dto.offer ?? undefined) as object | undefined,
        selectionReasoning: dto.selectionReasoning ?? undefined,
        keyAssets: (dto.keyAssets ?? undefined) as object | undefined,
        attachments: (dto.attachments ?? undefined) as object | undefined,
        submittedById,
        submittedAt: new Date(),
      },
      include: {
        submittedBy: { select: { email: true } },
        onboarding: { select: { status: true } },
      },
    });

    return mapHiringDecisionResponse(created);
  }
}
