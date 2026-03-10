import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../../platform/prisma/prisma.service';
import type {
  CreateInterviewDto,
  InterviewListQueryDto,
  UpdateInterviewDto,
  UpdateInterviewParticipantAttendanceDto,
  UpsertInterviewFeedbackDto,
} from '../dto/interview.dto';
import {
  assertInterviewAttendanceTransition,
  assertInterviewTransition,
  mapInterview,
  mapInterviewFeedback,
  recalculateJobMetrics,
  touchApplicantActivity,
} from './recruitment.usecase-helpers';

const sessionInclude = {
  participants: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      applicant: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      },
    },
  },
  interviewers: {
    orderBy: { createdAt: 'asc' as const },
    include: {
      interviewer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          status: true,
        },
      },
    },
  },
  feedbacks: {
    orderBy: { updatedAt: 'desc' as const },
    include: {
      assignment: {
        select: {
          interviewerId: true,
        },
      },
    },
  },
} satisfies Prisma.InterviewSessionInclude;

function uniqueIds(ids: string[]) {
  return [...new Set(ids)];
}

function normalizeInterviewerPayload(
  interviewers: CreateInterviewDto['interviewers'],
) {
  const map = new Map<string, { interviewerId: string; role: string | null }>();
  for (const item of interviewers) {
    if (!map.has(item.interviewerId)) {
      map.set(item.interviewerId, {
        interviewerId: item.interviewerId,
        role: item.role ?? null,
      });
    }
  }
  return [...map.values()];
}

async function assertApplicantsBelongToJob(
  prisma: PrismaService,
  jobId: string,
  applicantIds: string[],
) {
  const applicants = await prisma.applicant.findMany({
    where: { id: { in: applicantIds } },
    select: { id: true, jobId: true },
  });

  if (applicants.length !== applicantIds.length) {
    throw new NotFoundException('One or more applicants were not found');
  }

  const invalid = applicants.find((applicant) => applicant.jobId !== jobId);
  if (invalid) {
    throw new BadRequestException(
      'All applicants must belong to the session job',
    );
  }
}

async function assertInterviewersAreActiveEmployees(
  prisma: PrismaService,
  interviewerIds: string[],
) {
  const interviewers = await prisma.user.findMany({
    where: {
      id: { in: interviewerIds },
      status: 'ACTIVE',
      employee: { isNot: null },
    },
    select: { id: true },
  });

  if (interviewers.length !== interviewerIds.length) {
    throw new BadRequestException(
      'All interviewers must be active users linked to employee records',
    );
  }
}

async function assertNoActiveDuplicateRound(
  prisma: PrismaService,
  params: {
    applicantIds: string[];
    jobId: string;
    round: number;
    excludeSessionId?: string;
  },
) {
  const duplicate = await prisma.interviewParticipant.findFirst({
    where: {
      applicantId: { in: params.applicantIds },
      session: {
        jobId: params.jobId,
        round: params.round,
        status: { not: 'CANCELLED' },
        ...(params.excludeSessionId
          ? { id: { not: params.excludeSessionId } }
          : {}),
      },
      attendanceStatus: { not: 'CANCELLED' },
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new ConflictException(
      'At least one applicant already has an active interview in this round',
    );
  }
}

@Injectable()
export class CreateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateInterviewDto, createdById: string) {
    const applicantIds = uniqueIds(dto.applicantIds);
    if (applicantIds.length === 0) {
      throw new BadRequestException('At least one applicant is required');
    }

    const interviewerPayload = normalizeInterviewerPayload(dto.interviewers);
    if (interviewerPayload.length === 0) {
      throw new BadRequestException('At least one interviewer is required');
    }

    const round = dto.round ?? 1;
    await this.prisma.job.findUniqueOrThrow({
      where: { id: dto.jobId },
      select: { id: true },
    });
    await assertApplicantsBelongToJob(this.prisma, dto.jobId, applicantIds);
    await assertNoActiveDuplicateRound(this.prisma, {
      applicantIds,
      jobId: dto.jobId,
      round,
    });

    const interviewerIds = interviewerPayload.map((item) => item.interviewerId);
    await assertInterviewersAreActiveEmployees(this.prisma, interviewerIds);

    const now = new Date();
    const created = await this.prisma.$transaction(async (tx) => {
      const row = await tx.interviewSession.create({
        data: {
          jobId: dto.jobId,
          type: dto.type,
          round,
          status: dto.status ?? 'SCHEDULED',
          scheduledAt: new Date(dto.scheduledAt),
          durationMinutes: dto.durationMinutes ?? undefined,
          location: dto.location ?? undefined,
          meetingUrl: dto.meetingUrl ?? undefined,
          createdById,
          participants: {
            create: applicantIds.map((applicantId) => ({
              applicantId,
              attendanceStatus: 'SCHEDULED',
            })),
          },
          interviewers: {
            create: interviewerPayload.map((interviewer) => ({
              interviewerId: interviewer.interviewerId,
              role: interviewer.role ?? undefined,
            })),
          },
        },
        include: sessionInclude,
      });

      await Promise.all(
        applicantIds.map((applicantId) =>
          touchApplicantActivity(tx, applicantId, now),
        ),
      );
      await recalculateJobMetrics(tx, dto.jobId);
      return row;
    });

    return mapInterview(created);
  }
}

@Injectable()
export class ListInterviewsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: InterviewListQueryDto) {
    const list = await this.prisma.interviewSession.findMany({
      where: {
        ...(query.jobId ? { jobId: query.jobId } : {}),
        ...(query.status ? { status: query.status } : {}),
        ...(query.type ? { type: query.type } : {}),
        ...(query.round ? { round: query.round } : {}),
        ...(query.applicantId
          ? {
              participants: {
                some: { applicantId: query.applicantId },
              },
            }
          : {}),
        ...(query.interviewerId
          ? {
              interviewers: {
                some: { interviewerId: query.interviewerId },
              },
            }
          : {}),
      },
      include: sessionInclude,
      orderBy: { createdAt: 'desc' },
    });

    return list.map((session) => mapInterview(session));
  }
}

@Injectable()
export class GetInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const session = await this.prisma.interviewSession.findUnique({
      where: { id },
      include: sessionInclude,
    });
    if (!session) throw new NotFoundException('Interview session not found');
    return mapInterview(session);
  }
}

@Injectable()
export class UpdateInterviewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string, dto: UpdateInterviewDto) {
    const existing = await this.prisma.interviewSession.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            feedbacks: {
              select: { id: true },
            },
          },
        },
        interviewers: {
          include: {
            feedbacks: {
              select: { id: true },
            },
          },
        },
      },
    });
    if (!existing) throw new NotFoundException('Interview session not found');

    if (dto.status !== undefined) {
      assertInterviewTransition(existing.status, dto.status);
    }

    const round = dto.round ?? existing.round;
    if (dto.round !== undefined && dto.applicantIds === undefined) {
      const currentApplicantIds = existing.participants.map(
        (participant) => participant.applicantId,
      );
      if (currentApplicantIds.length > 0) {
        await assertNoActiveDuplicateRound(this.prisma, {
          applicantIds: currentApplicantIds,
          jobId: existing.jobId,
          round,
          excludeSessionId: existing.id,
        });
      }
    }

    const now = new Date();

    const updated = await this.prisma.$transaction(async (tx) => {
      if (dto.applicantIds !== undefined) {
        const applicantIds = uniqueIds(dto.applicantIds);
        if (applicantIds.length === 0) {
          throw new BadRequestException('At least one applicant is required');
        }

        await assertApplicantsBelongToJob(
          tx as PrismaService,
          existing.jobId,
          applicantIds,
        );
        await assertNoActiveDuplicateRound(tx as PrismaService, {
          applicantIds,
          jobId: existing.jobId,
          round,
          excludeSessionId: existing.id,
        });

        const currentByApplicant = new Map(
          existing.participants.map((participant) => [
            participant.applicantId,
            participant,
          ]),
        );

        const removeParticipants = existing.participants.filter(
          (participant) => !applicantIds.includes(participant.applicantId),
        );
        if (
          removeParticipants.some(
            (participant) => (participant.feedbacks?.length ?? 0) > 0,
          )
        ) {
          throw new BadRequestException(
            'Cannot remove participants with submitted feedback',
          );
        }

        if (removeParticipants.length > 0) {
          await tx.interviewParticipant.deleteMany({
            where: {
              id: {
                in: removeParticipants.map((participant) => participant.id),
              },
            },
          });
        }

        const addApplicantIds = applicantIds.filter(
          (applicantId) => !currentByApplicant.has(applicantId),
        );
        if (addApplicantIds.length > 0) {
          await tx.interviewParticipant.createMany({
            data: addApplicantIds.map((applicantId) => ({
              sessionId: existing.id,
              applicantId,
              attendanceStatus: 'SCHEDULED',
            })),
          });
        }
      }

      if (dto.interviewers !== undefined) {
        const interviewers = normalizeInterviewerPayload(dto.interviewers);
        if (interviewers.length === 0) {
          throw new BadRequestException('At least one interviewer is required');
        }

        const interviewerIds = interviewers.map((item) => item.interviewerId);
        await assertInterviewersAreActiveEmployees(
          tx as PrismaService,
          interviewerIds,
        );

        const interviewerById = new Map(
          interviewers.map((item) => [item.interviewerId, item]),
        );

        const removeAssignments = existing.interviewers.filter(
          (assignment) => !interviewerById.has(assignment.interviewerId),
        );
        if (
          removeAssignments.some(
            (assignment) => (assignment.feedbacks?.length ?? 0) > 0,
          )
        ) {
          throw new BadRequestException(
            'Cannot remove interviewer assignments with submitted feedback',
          );
        }

        if (removeAssignments.length > 0) {
          await tx.interviewerAssignment.deleteMany({
            where: {
              id: { in: removeAssignments.map((assignment) => assignment.id) },
            },
          });
        }

        const currentByInterviewerId = new Map(
          existing.interviewers.map((assignment) => [
            assignment.interviewerId,
            assignment,
          ]),
        );

        const addAssignments = interviewers.filter(
          (assignment) => !currentByInterviewerId.has(assignment.interviewerId),
        );

        if (addAssignments.length > 0) {
          await tx.interviewerAssignment.createMany({
            data: addAssignments.map((assignment) => ({
              sessionId: existing.id,
              interviewerId: assignment.interviewerId,
              role: assignment.role ?? undefined,
            })),
          });
        }

        const retainedAssignments = existing.interviewers.filter((assignment) =>
          interviewerById.has(assignment.interviewerId),
        );

        for (const retained of retainedAssignments) {
          const payload = interviewerById.get(retained.interviewerId);
          await tx.interviewerAssignment.update({
            where: { id: retained.id },
            data: { role: payload?.role ?? null },
          });
        }
      }

      await tx.interviewSession.update({
        where: { id },
        data: {
          ...(dto.type !== undefined ? { type: dto.type } : {}),
          ...(dto.round !== undefined ? { round: dto.round } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.scheduledAt !== undefined
            ? { scheduledAt: new Date(dto.scheduledAt) }
            : {}),
          ...(dto.durationMinutes !== undefined
            ? { durationMinutes: dto.durationMinutes }
            : {}),
          ...(dto.location !== undefined ? { location: dto.location } : {}),
          ...(dto.meetingUrl !== undefined
            ? { meetingUrl: dto.meetingUrl }
            : {}),
        },
      });

      const row = await tx.interviewSession.findUniqueOrThrow({
        where: { id },
        include: sessionInclude,
      });

      await Promise.all(
        row.participants.map((participant) =>
          touchApplicantActivity(tx, participant.applicantId, now),
        ),
      );
      await recalculateJobMetrics(tx, row.jobId);
      return row;
    });

    return mapInterview(updated);
  }
}

@Injectable()
export class UpdateInterviewParticipantAttendanceUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    sessionId: string,
    participantId: string,
    dto: UpdateInterviewParticipantAttendanceDto,
  ) {
    const participant = await this.prisma.interviewParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
      include: {
        session: {
          select: {
            id: true,
            jobId: true,
          },
        },
      },
    });

    if (!participant) {
      throw new NotFoundException('Interview participant not found');
    }

    assertInterviewAttendanceTransition(
      participant.attendanceStatus,
      dto.attendanceStatus,
    );

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.interviewParticipant.update({
        where: { id: participant.id },
        data: { attendanceStatus: dto.attendanceStatus },
      });

      await touchApplicantActivity(tx, participant.applicantId, now);
      await recalculateJobMetrics(tx, participant.session.jobId);

      return tx.interviewSession.findUniqueOrThrow({
        where: { id: sessionId },
        include: sessionInclude,
      });
    });

    return mapInterview(updated);
  }
}

@Injectable()
export class UpsertInterviewFeedbackUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    sessionId: string,
    participantId: string,
    interviewerUserId: string,
    dto: UpsertInterviewFeedbackDto,
  ) {
    const participant = await this.prisma.interviewParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
      select: {
        id: true,
        applicantId: true,
      },
    });

    if (!participant) {
      throw new NotFoundException('Interview participant not found');
    }

    const assignment = await this.prisma.interviewerAssignment.findUnique({
      where: {
        sessionId_interviewerId: {
          sessionId,
          interviewerId: interviewerUserId,
        },
      },
      select: {
        id: true,
      },
    });

    if (!assignment) {
      throw new ForbiddenException(
        'Only assigned interviewers can submit feedback',
      );
    }

    const now = new Date();
    const feedback = await this.prisma.$transaction(async (tx) => {
      const row = await tx.interviewFeedback.upsert({
        where: {
          participantId_assignmentId: {
            participantId,
            assignmentId: assignment.id,
          },
        },
        create: {
          sessionId,
          participantId,
          assignmentId: assignment.id,
          score: dto.score ?? undefined,
          endorsement: dto.endorsement ?? undefined,
          strengths: dto.strengths ?? [],
          weaknesses: dto.weaknesses ?? [],
          notes: dto.notes ?? undefined,
          submittedAt: now,
        },
        update: {
          ...(dto.score !== undefined ? { score: dto.score } : {}),
          ...(dto.endorsement !== undefined
            ? { endorsement: dto.endorsement }
            : {}),
          ...(dto.strengths !== undefined ? { strengths: dto.strengths } : {}),
          ...(dto.weaknesses !== undefined
            ? { weaknesses: dto.weaknesses }
            : {}),
          ...(dto.notes !== undefined ? { notes: dto.notes } : {}),
          submittedAt: now,
        },
        include: {
          assignment: {
            select: {
              interviewerId: true,
            },
          },
        },
      });

      await touchApplicantActivity(tx, participant.applicantId, now);
      return row;
    });

    return mapInterviewFeedback(feedback);
  }
}

@Injectable()
export class ListInterviewParticipantFeedbackUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(sessionId: string, participantId: string) {
    const participant = await this.prisma.interviewParticipant.findFirst({
      where: {
        id: participantId,
        sessionId,
      },
      select: { id: true },
    });

    if (!participant) {
      throw new NotFoundException('Interview participant not found');
    }

    const feedback = await this.prisma.interviewFeedback.findMany({
      where: {
        sessionId,
        participantId,
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        assignment: {
          select: {
            interviewerId: true,
          },
        },
      },
    });

    return feedback.map((row) => mapInterviewFeedback(row));
  }
}
