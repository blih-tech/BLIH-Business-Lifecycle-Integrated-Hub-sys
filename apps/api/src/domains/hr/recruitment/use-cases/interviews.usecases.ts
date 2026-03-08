import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateInterviewDto,
  InterviewListQueryDto,
  UpdateInterviewDto,
} from '../dto/interview.dto';
import {
  buildInterviewMetadata,
  assertInterviewTransition,
  mapInterview,
  parseInterviewMetadata,
} from './recruitment.usecase-helpers';
import {
  recalculateJobMetrics,
  touchCandidateActivity,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateInterviewDto) {
    const application = await this.prisma.jobApplication.findUniqueOrThrow({
      where: { id: dto.applicationId },
      select: { id: true, jobId: true, candidateId: true },
    });
    const interviewerId = dto.interviewerId;
    if (!interviewerId) {
      throw new ConflictException('interviewerId is required');
    }

    const round = dto.round ?? 1;
    const existing = await this.prisma.interview.findMany({
      where: {
        jobId: application.jobId,
        candidateId: application.candidateId,
      },
      select: { id: true, feedback: true },
    });
    const duplicate = existing.find(
      (interview) => parseInterviewMetadata(interview.feedback).round === round,
    );
    if (duplicate)
      throw new ConflictException('Interview round already exists');

    const now = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.interview.create({
        data: {
          jobId: application.jobId,
          candidateId: application.candidateId,
          type: dto.type,
          status: dto.status ?? 'SCHEDULED',
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
          interviewerId,
          feedback: buildInterviewMetadata({
            applicationId: dto.applicationId,
            round,
            interviewers: dto.interviewers,
            feedback: dto.feedback,
            endorsement: dto.endorsement ?? null,
            score: dto.score ?? null,
            nextAction: dto.nextAction ?? null,
          }) as Prisma.InputJsonValue,
        },
      });

      await touchCandidateActivity(tx, application.candidateId, now);
      await recalculateJobMetrics(tx, application.jobId);

      return row;
    });
    return mapInterview({ ...created, applicationId: dto.applicationId });
  }
}

@Injectable()
export class ListInterviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: InterviewListQueryDto) {
    const application = query.applicationId
      ? await this.prisma.jobApplication.findUnique({
          where: { id: query.applicationId },
          select: { id: true, jobId: true, candidateId: true },
        })
      : null;
    const list = await this.prisma.interview.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(application
          ? {
              jobId: application.jobId,
              candidateId: application.candidateId,
            }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((interview) =>
      mapInterview({
        ...interview,
        applicationId:
          query.applicationId ||
          parseInterviewMetadata(interview.feedback).applicationId,
      }),
    );
  }
}

@Injectable()
export class GetInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const application = await this.prisma.jobApplication.findUnique({
      where: {
        jobId_candidateId: {
          jobId: interview.jobId,
          candidateId: interview.candidateId,
        },
      },
      select: { id: true },
    });

    return mapInterview({
      ...interview,
      applicationId:
        application?.id ??
        parseInterviewMetadata(interview.feedback).applicationId,
    });
  }
}

@Injectable()
export class UpdateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateInterviewDto) {
    const existing = await this.prisma.interview.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        status: true,
        jobId: true,
        candidateId: true,
        feedback: true,
      },
    });
    if (dto.status !== undefined) {
      assertInterviewTransition(existing.status, dto.status);
    }
    if (dto.interviewerId === null) {
      throw new ConflictException('interviewerId cannot be null');
    }
    const interviewerIdForUpdate =
      dto.interviewerId === undefined ? undefined : dto.interviewerId;

    const currentMetadata = parseInterviewMetadata(existing.feedback);
    const application = dto.applicationId
      ? await this.prisma.jobApplication.findUniqueOrThrow({
          where: { id: dto.applicationId },
          select: { id: true, jobId: true, candidateId: true },
        })
      : null;
    const nextApplicationId =
      dto.applicationId ?? currentMetadata.applicationId;
    const nextRound = dto.round ?? currentMetadata.round;
    const nextFeedbackPayload = buildInterviewMetadata({
      applicationId: nextApplicationId,
      round: nextRound,
      interviewers:
        dto.interviewers === undefined
          ? currentMetadata.interviewers
          : dto.interviewers,
      feedback:
        dto.feedback === undefined ? currentMetadata.feedback : dto.feedback,
      endorsement:
        dto.endorsement === undefined
          ? currentMetadata.endorsement
          : dto.endorsement,
      score: dto.score === undefined ? currentMetadata.score : dto.score,
      nextAction:
        dto.nextAction === undefined
          ? currentMetadata.nextAction
          : dto.nextAction,
    });

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.InterviewUncheckedUpdateInput = {
        feedback: nextFeedbackPayload as Prisma.InputJsonValue,
      };

      if (application) {
        updateData.jobId = application.jobId;
        updateData.candidateId = application.candidateId;
      }
      if (dto.type !== undefined) {
        updateData.type = dto.type;
      }
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }
      if (dto.scheduledAt !== undefined) {
        updateData.scheduledAt = dto.scheduledAt
          ? new Date(dto.scheduledAt)
          : null;
      }
      if (dto.completedAt !== undefined) {
        updateData.completedAt = dto.completedAt
          ? new Date(dto.completedAt)
          : null;
      }
      if (interviewerIdForUpdate !== undefined) {
        updateData.interviewerId = interviewerIdForUpdate;
      }

      const row = await tx.interview.update({
        where: { id },
        data: updateData,
      });

      await touchCandidateActivity(
        tx,
        application?.candidateId ?? existing.candidateId,
        now,
      );
      await recalculateJobMetrics(tx, application?.jobId ?? existing.jobId);

      return row;
    });
    return mapInterview({ ...updated, applicationId: nextApplicationId });
  }
}
