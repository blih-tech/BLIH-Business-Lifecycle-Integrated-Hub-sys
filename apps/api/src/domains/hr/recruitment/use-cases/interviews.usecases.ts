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
  assertInterviewTransition,
  buildInterviewMetadata,
  mapInterview,
  parseInterviewMetadata,
  recalculateJobMetrics,
  touchApplicantActivity,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateInterviewDto) {
    const applicant = await this.prisma.applicant.findUniqueOrThrow({
      where: { id: dto.applicantId },
      select: { id: true, jobId: true },
    });

    const round = dto.round ?? 1;
    const existing = await this.prisma.interview.findMany({
      where: {
        jobId: applicant.jobId,
        applicantId: applicant.id,
      },
      select: { id: true, feedback: true },
    });
    const duplicate = existing.find(
      (interview) => parseInterviewMetadata(interview.feedback).round === round,
    );
    if (duplicate) {
      throw new ConflictException('Interview round already exists');
    }

    const now = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.interview.create({
        data: {
          jobId: applicant.jobId,
          applicantId: applicant.id,
          type: dto.type,
          status: dto.status ?? 'SCHEDULED',
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
          startedAt: dto.startedAt ? new Date(dto.startedAt) : undefined,
          completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
          durationMinutes: dto.durationMinutes ?? undefined,
          interviewerId: dto.interviewerId,
          location: dto.location ?? undefined,
          meetingUrl: dto.meetingUrl ?? undefined,
          notes: dto.notes ?? undefined,
          feedback: buildInterviewMetadata({
            applicantId: dto.applicantId,
            round,
            interviewers: dto.interviewers,
            feedback: dto.feedback,
            endorsement: dto.endorsement ?? null,
            score: dto.score ?? null,
            nextAction: dto.nextAction ?? null,
          }) as Prisma.InputJsonValue,
        },
      });

      await touchApplicantActivity(tx, applicant.id, now);
      await recalculateJobMetrics(tx, applicant.jobId);
      return row;
    });

    return mapInterview(created);
  }
}

@Injectable()
export class ListInterviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: InterviewListQueryDto) {
    const list = await this.prisma.interview.findMany({
      where: {
        ...(query.status ? { status: query.status } : {}),
        ...(query.applicantId ? { applicantId: query.applicantId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((interview) => mapInterview(interview));
  }
}

@Injectable()
export class GetInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const interview = await this.prisma.interview.findUnique({ where: { id } });
    if (!interview) throw new NotFoundException('Interview not found');
    return mapInterview(interview);
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
        applicantId: true,
        feedback: true,
      },
    });

    if (dto.status !== undefined) {
      assertInterviewTransition(existing.status, dto.status);
    }
    const currentMetadata = parseInterviewMetadata(existing.feedback);
    const applicant = dto.applicantId
      ? await this.prisma.applicant.findUniqueOrThrow({
          where: { id: dto.applicantId },
          select: { id: true, jobId: true },
        })
      : null;

    const nextMetadata = buildInterviewMetadata({
      applicantId: dto.applicantId ?? currentMetadata.applicantId,
      round: dto.round ?? currentMetadata.round,
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
      const data: Prisma.InterviewUncheckedUpdateInput = {
        feedback: nextMetadata as Prisma.InputJsonValue,
      };

      if (applicant) {
        data.jobId = applicant.jobId;
        data.applicantId = applicant.id;
      }
      if (dto.type !== undefined) data.type = dto.type;
      if (dto.status !== undefined) data.status = dto.status;
      if (dto.scheduledAt !== undefined) {
        data.scheduledAt = dto.scheduledAt ? new Date(dto.scheduledAt) : null;
      }
      if (dto.startedAt !== undefined) {
        data.startedAt = dto.startedAt ? new Date(dto.startedAt) : null;
      }
      if (dto.completedAt !== undefined) {
        data.completedAt = dto.completedAt ? new Date(dto.completedAt) : null;
      }
      if (dto.durationMinutes !== undefined) {
        data.durationMinutes = dto.durationMinutes;
      }
      if (dto.interviewerId !== undefined)
        data.interviewerId = dto.interviewerId;
      if (dto.location !== undefined) data.location = dto.location;
      if (dto.meetingUrl !== undefined) data.meetingUrl = dto.meetingUrl;
      if (dto.notes !== undefined) data.notes = dto.notes;

      const row = await tx.interview.update({
        where: { id },
        data,
      });

      await touchApplicantActivity(
        tx,
        applicant?.id ?? existing.applicantId,
        now,
      );
      await recalculateJobMetrics(tx, applicant?.jobId ?? existing.jobId);
      return row;
    });

    return mapInterview(updated);
  }
}
