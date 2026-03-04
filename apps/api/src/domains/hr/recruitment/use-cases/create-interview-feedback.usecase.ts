import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateInterviewFeedbackDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { mapInterviewFeedbackResponse } from '../interview-feedback.mapper';
import { enrichInterviewersWithSchedulingWarnings } from '../interview-scheduling.utils';
import { RecruitmentNotificationService } from '../recruitment-notification.service';

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readRatingsAverage(
  ratings: Record<string, unknown> | null | undefined,
) {
  if (!ratings) return null;
  const values = Object.values(ratings)
    .map((value) => (typeof value === 'number' ? value : Number(value)))
    .filter((value) => Number.isFinite(value));

  if (values.length === 0) return null;
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
  );
}

@Injectable()
export class CreateInterviewFeedbackUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(dto: CreateInterviewFeedbackDto, compiledById: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
      include: {
        jobPosting: {
          select: {
            id: true,
            recruitmentRequest: { select: { submittedById: true } },
          },
        },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (
      !['SHORTLISTED', 'INTERVIEW_STAGE', 'OFFER_PENDING'].includes(
        candidate.status,
      )
    ) {
      throw new BadRequestException(
        'Candidate must be shortlisted before interview feedback can be recorded',
      );
    }

    const existing = await this.prisma.interviewFeedback.findFirst({
      where: {
        candidateId: dto.candidateId,
        interviewRound: dto.interviewRound,
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Interview feedback already exists for this round',
      );
    }

    const scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
    const completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
    const { interviewers, warnings } =
      await enrichInterviewersWithSchedulingWarnings(
        this.prisma,
        Array.isArray(dto.interviewers) ? dto.interviewers : [],
        scheduledAt,
      );

    const totalRating =
      dto.totalRating ??
      readRatingsAverage(
        (dto.ratings ?? null) as Record<string, unknown> | null,
      );
    const compiledAt = new Date();
    const nextStatus =
      dto.endorsement === 'NO'
        ? 'REJECTED'
        : String(dto.nextAction ?? '')
              .toUpperCase()
              .includes('OFFER')
          ? 'OFFER_PENDING'
          : 'INTERVIEW_STAGE';

    const feedback = await this.prisma.$transaction(async (tx) => {
      const created = await tx.interviewFeedback.create({
        data: {
          candidateId: dto.candidateId,
          interviewRound: dto.interviewRound,
          interviewType: dto.interviewType,
          scheduledAt,
          completedAt,
          interviewers: {
            participants: interviewers,
            warnings,
          } as never,
          ratings: (dto.ratings ?? undefined) as never,
          totalRating: totalRating ?? undefined,
          endorsement: dto.endorsement ?? undefined,
          remarks: dto.remarks ?? undefined,
          nextAction: dto.nextAction ?? undefined,
          compiledById,
          compiledAt,
          ranking: dto.ranking ?? dto.interviewRound,
        },
        include: {
          compiledBy: { select: { email: true } },
        },
      });

      const pipeline = asRecord(candidate.pipeline);
      const stageHistory = Array.isArray(pipeline.stageHistory)
        ? [...pipeline.stageHistory]
        : [];
      stageHistory.push({
        status: nextStatus,
        at: compiledAt.toISOString(),
        interviewRound: dto.interviewRound,
        interviewType: dto.interviewType,
        endorsement: dto.endorsement ?? null,
      });

      await tx.candidate.update({
        where: { id: dto.candidateId },
        data: {
          status: nextStatus,
          pipeline: {
            ...pipeline,
            lastInterviewAt: compiledAt.toISOString(),
            stageHistory,
          },
          rejection:
            nextStatus === 'REJECTED'
              ? ({
                  reason:
                    dto.remarks ?? 'Interview panel rejected the candidate',
                  decidedAt: compiledAt.toISOString(),
                } as never)
              : undefined,
        },
      });

      return created;
    });

    await this.notifications.notifyUsers({
      userIds: [candidate.jobPosting.recruitmentRequest.submittedById],
      title: `Interview feedback recorded for ${candidate.candidateId}`,
      body: `Round ${dto.interviewRound} feedback submitted with ${dto.endorsement ?? 'no'} endorsement.`,
      payload: {
        candidateId: candidate.id,
        interviewRound: dto.interviewRound,
        nextStatus,
        schedulingWarnings: warnings,
      },
    });

    return mapInterviewFeedbackResponse(feedback);
  }
}
