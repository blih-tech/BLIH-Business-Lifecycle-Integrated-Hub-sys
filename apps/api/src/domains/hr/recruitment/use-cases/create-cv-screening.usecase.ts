import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CreateCvScreeningDto } from '@repo/types';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import { computeCandidateScreeningScore } from '../candidate-scoring.utils';
import { mapCvScreeningResponse } from '../cv-screening.mapper';
import { RecruitmentNotificationService } from '../recruitment-notification.service';

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

@Injectable()
export class CreateCvScreeningUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: RecruitmentNotificationService,
  ) {}

  async execute(dto: CreateCvScreeningDto, screenedById: string) {
    const candidate = await this.prisma.candidate.findUnique({
      where: { id: dto.candidateId },
      include: {
        jobPosting: {
          select: {
            id: true,
            recruitmentRequest: {
              select: {
                submittedById: true,
              },
            },
          },
        },
      },
    });
    if (!candidate) throw new NotFoundException('Candidate not found');
    if (candidate.jobPostingId !== dto.jobPostingId) {
      throw new BadRequestException(
        'Candidate must belong to the selected job posting',
      );
    }

    const existing = await this.prisma.cvScreening.findFirst({
      where: {
        candidateId: dto.candidateId,
        jobPostingId: dto.jobPostingId,
      },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(
        'Candidate already has a CV screening for this job posting',
      );
    }

    const scoring = computeCandidateScreeningScore(dto.assessments);
    const recommendation = dto.recommendation ?? scoring.recommendation;
    const screenedAt = new Date();
    const nextStatus =
      recommendation === 'SELECT'
        ? 'SHORTLISTED'
        : recommendation === 'PAUSE'
          ? 'SCREENING'
          : 'REJECTED';

    const screening = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cvScreening.create({
        data: {
          candidateId: dto.candidateId,
          jobPostingId: dto.jobPostingId,
          assessments: {
            items: dto.assessments,
            scoring,
          } as never,
          aggregateRating: scoring.score,
          recommendation,
          nextPhase:
            dto.nextPhase ??
            (recommendation === 'SELECT'
              ? 'INTERVIEW'
              : recommendation === 'PAUSE'
                ? 'REVIEW'
                : 'CLOSE'),
          screenedById,
          screenedAt,
          interviewScheduled:
            recommendation === 'SELECT' &&
            String(dto.nextPhase ?? '')
              .toUpperCase()
              .includes('INTERVIEW'),
          rejectionSent: recommendation === 'DECLINE',
        },
        include: {
          screenedBy: { select: { email: true } },
        },
      });

      const pipeline = asRecord(candidate.pipeline);
      const stageHistory = Array.isArray(pipeline.stageHistory)
        ? [...pipeline.stageHistory]
        : [];
      stageHistory.push({
        status: nextStatus,
        at: screenedAt.toISOString(),
        aggregateRating: scoring.score,
        recommendation,
      });

      await tx.candidate.update({
        where: { id: dto.candidateId },
        data: {
          status: nextStatus,
          pipeline: {
            ...pipeline,
            screenedAt: screenedAt.toISOString(),
            screenedById,
            screeningScore: scoring.score,
            screeningRecommendation: recommendation,
            stageHistory,
          },
          rejection:
            recommendation === 'DECLINE'
              ? ({
                  reason: 'Screening recommendation declined',
                  decidedAt: screenedAt.toISOString(),
                } as never)
              : undefined,
        },
      });

      return created;
    });

    await this.notifications.notifyUsers({
      userIds: [candidate.jobPosting.recruitmentRequest.submittedById],
      title: `CV screening completed for ${candidate.candidateId}`,
      body: `Candidate ${candidate.candidateId} received ${scoring.score}% with recommendation ${recommendation}.`,
      payload: {
        candidateId: candidate.id,
        jobPostingId: candidate.jobPosting.id,
        score: scoring.score,
        recommendation,
      },
    });

    return mapCvScreeningResponse(screening);
  }
}
