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
  mapInterview,
} from './recruitment.usecase-helpers';

@Injectable()
export class CreateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateInterviewDto) {
    await this.prisma.jobApplication.findUniqueOrThrow({
      where: { id: dto.applicationId },
      select: { id: true },
    });

    const round = dto.round ?? 1;
    const duplicate = await this.prisma.interview.findFirst({
      where: { applicationId: dto.applicationId, round },
      select: { id: true },
    });
    if (duplicate)
      throw new ConflictException('Interview round already exists');

    const created = await this.prisma.interview.create({
      data: {
        applicationId: dto.applicationId,
        type: dto.type,
        round,
        status: dto.status ?? 'SCHEDULED',
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        completedAt: dto.completedAt ? new Date(dto.completedAt) : undefined,
        interviewerId: dto.interviewerId ?? undefined,
        interviewers:
          dto.interviewers === undefined
            ? undefined
            : dto.interviewers === null
              ? Prisma.JsonNull
              : (dto.interviewers as Prisma.InputJsonValue),
        feedback: dto.feedback ?? undefined,
        endorsement: dto.endorsement ?? undefined,
        score: dto.score ?? undefined,
        nextAction: dto.nextAction ?? undefined,
      },
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
        ...(query.applicationId ? { applicationId: query.applicationId } : {}),
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
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }
    return mapInterview(interview);
  }
}

@Injectable()
export class UpdateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateInterviewDto) {
    const existing = await this.prisma.interview.findUniqueOrThrow({
      where: { id },
      select: { id: true, status: true },
    });
    if (dto.status !== undefined) {
      assertInterviewTransition(existing.status, dto.status);
    }
    const updated = await this.prisma.interview.update({
      where: { id },
      data: {
        ...(dto.applicationId !== undefined && {
          application: { connect: { id: dto.applicationId } },
        }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.round !== undefined && { round: dto.round }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.scheduledAt !== undefined && {
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        }),
        ...(dto.completedAt !== undefined && {
          completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
        }),
        ...(dto.interviewerId !== undefined && {
          interviewer: dto.interviewerId
            ? { connect: { id: dto.interviewerId } }
            : { disconnect: true },
        }),
        ...(dto.interviewers !== undefined && {
          interviewers:
            dto.interviewers === null
              ? Prisma.JsonNull
              : (dto.interviewers as Prisma.InputJsonValue),
        }),
        ...(dto.feedback !== undefined && { feedback: dto.feedback }),
        ...(dto.endorsement !== undefined && { endorsement: dto.endorsement }),
        ...(dto.score !== undefined && { score: dto.score }),
        ...(dto.nextAction !== undefined && { nextAction: dto.nextAction }),
      },
    });
    return mapInterview(updated);
  }
}
