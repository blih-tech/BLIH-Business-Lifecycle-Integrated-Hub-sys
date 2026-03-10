import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { UpsertOkrManagerReviewDto } from '@repo/types';
import { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { mapOkrManagerReview } from './okr-manager-review.mapper';

@Injectable()
export class OkrManagerReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async list(okrId: string) {
    await this.prisma.okr.findUniqueOrThrow({
      where: { id: okrId },
      select: { id: true },
    });

    const rows = await this.prisma.okrManagerReview.findMany({
      where: { okrId },
      orderBy: [{ reviewedAt: 'desc' }, { createdAt: 'desc' }],
    });

    return rows.map(mapOkrManagerReview);
  }

  async upsert(okrId: string, dto: UpsertOkrManagerReviewDto) {
    const okr = await this.prisma.okr.findUnique({
      where: { id: okrId },
      select: {
        id: true,
        scope: true,
        employeeId: true,
        employee: {
          select: {
            employment: {
              select: {
                managerEmployment: {
                  select: {
                    employee: {
                      select: {
                        userId: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!okr) {
      throw new NotFoundException('OKR not found');
    }

    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.reviewerId },
      select: { id: true },
    });

    if (okr.scope === 'USER' && okr.employeeId) {
      const managerUserId =
        okr.employee?.employment?.managerEmployment?.employee?.userId ?? null;
      if (managerUserId && managerUserId !== dto.reviewerId) {
        throw new BadRequestException(
          'Manager OKR reviews must be submitted by the employee manager',
        );
      }
    }

    if (
      dto.overallConfidence != null &&
      (dto.overallConfidence < 1 || dto.overallConfidence > 5)
    ) {
      throw new BadRequestException(
        'overallConfidence must be between 1 and 5',
      );
    }

    const row = await this.prisma.okrManagerReview.upsert({
      where: {
        okrId_reviewerId: {
          okrId,
          reviewerId: dto.reviewerId,
        },
      },
      update: {
        decision: dto.decision,
        overallConfidence: dto.overallConfidence ?? null,
        comments: dto.comments ?? null,
        strengths:
          dto.strengths === undefined
            ? undefined
            : dto.strengths === null
              ? Prisma.JsonNull
              : (dto.strengths as Prisma.InputJsonValue),
        risks:
          dto.risks === undefined
            ? undefined
            : dto.risks === null
              ? Prisma.JsonNull
              : (dto.risks as Prisma.InputJsonValue),
        supportActions:
          dto.supportActions === undefined
            ? undefined
            : dto.supportActions === null
              ? Prisma.JsonNull
              : (dto.supportActions as Prisma.InputJsonValue),
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : new Date(),
      },
      create: {
        okrId,
        reviewerId: dto.reviewerId,
        decision: dto.decision,
        overallConfidence: dto.overallConfidence ?? null,
        comments: dto.comments ?? null,
        strengths:
          dto.strengths === null
            ? Prisma.JsonNull
            : ((dto.strengths ?? []) as Prisma.InputJsonValue),
        risks:
          dto.risks === null
            ? Prisma.JsonNull
            : ((dto.risks ?? []) as Prisma.InputJsonValue),
        supportActions:
          dto.supportActions === null
            ? Prisma.JsonNull
            : ((dto.supportActions ?? []) as Prisma.InputJsonValue),
        reviewedAt: dto.reviewedAt ? new Date(dto.reviewedAt) : new Date(),
      },
    });

    return mapOkrManagerReview(row);
  }
}
