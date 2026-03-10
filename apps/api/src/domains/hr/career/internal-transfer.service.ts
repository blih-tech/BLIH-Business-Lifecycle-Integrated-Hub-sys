import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  ApproveInternalTransferRequestDto,
  CreateInternalTransferRequestDto,
  RejectInternalTransferRequestDto,
  UpdateInternalTransferRequestDto,
} from '@repo/types';
import type { Prisma } from '../../../platform/prisma/prisma-client';
import { PrismaService } from '../../../platform/prisma/prisma.service';
import { resolveEmployeeSubjectOrThrow } from '../employees/employee-subject.utils';
import { mapInternalTransferRequest } from './career.mapper';
import {
  assertRequestPending,
  assertRequestSubmittable,
  assertRequestUpdatable,
  buildCareerRequestId,
  parseOptionalDateOnly,
  toPrismaNullableJsonValue,
} from './career.utils';

@Injectable()
export class InternalTransferService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateInternalTransferRequestDto) {
    const employee = await resolveEmployeeSubjectOrThrow(
      this.prisma,
      dto.employeeId,
    );
    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.requestedById },
      select: { id: true },
    });

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: employee.id },
      select: {
        id: true,
        positionId: true,
        hiredAt: true,
        position: {
          select: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });
    if (!employment?.positionId) {
      throw new BadRequestException(
        'Internal transfers require an active employment position',
      );
    }

    const targetPosition = await this.prisma.position.findUniqueOrThrow({
      where: { id: dto.targetPositionId },
      select: {
        id: true,
        departmentId: true,
        grade: {
          select: {
            level: true,
          },
        },
      },
    });

    await this.assertTransferEligibility(
      employee.id,
      {
        positionId: employment.positionId,
        hiredAt: employment.hiredAt,
        position: employment.position,
      },
      targetPosition,
      dto.requestType,
    );

    const year = new Date().getUTCFullYear();
    const count = await this.prisma.internalTransferRequest.count({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(year, 0, 1)),
          lt: new Date(Date.UTC(year + 1, 0, 1)),
        },
      },
    });

    const data: Prisma.InternalTransferRequestUncheckedCreateInput = {
      requestId: buildCareerRequestId('ITR', year, count + 1),
      employeeId: employee.id,
      requestType: dto.requestType,
      currentPositionId: employment.positionId,
      targetPositionId: dto.targetPositionId,
      requestedById: dto.requestedById,
      reason: dto.reason.trim(),
      businessCase: toPrismaNullableJsonValue(dto.businessCase),
      desiredEffectiveDate: parseOptionalDateOnly(dto.desiredEffectiveDate),
      compensationChange: toPrismaNullableJsonValue(dto.compensationChange),
      status: dto.submit ? 'PENDING' : 'DRAFT',
      submittedAt: dto.submit ? new Date() : null,
    };

    const row = await this.prisma.internalTransferRequest.create({
      data,
    });

    return mapInternalTransferRequest(row);
  }

  async list(filters: {
    employeeId?: string;
    status?: string;
    requestType?: string;
  }) {
    const employeeId = filters.employeeId
      ? (await resolveEmployeeSubjectOrThrow(this.prisma, filters.employeeId))
          .id
      : undefined;

    const rows = await this.prisma.internalTransferRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.requestType
          ? { requestType: filters.requestType as never }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    return rows.map(mapInternalTransferRequest);
  }

  async get(id: string) {
    const row = await this.prisma.internalTransferRequest.findUnique({
      where: { id },
    });
    if (!row) {
      throw new NotFoundException('Internal transfer request not found');
    }
    return mapInternalTransferRequest(row);
  }

  async update(id: string, dto: UpdateInternalTransferRequestDto) {
    const existing = await this.prisma.internalTransferRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Internal transfer request not found');
    }
    assertRequestUpdatable(existing.status, 'internal transfer requests');

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: existing.employeeId },
      select: {
        positionId: true,
        hiredAt: true,
        position: {
          select: {
            grade: {
              select: {
                level: true,
              },
            },
          },
        },
      },
    });
    if (!employment?.positionId) {
      throw new BadRequestException(
        'Internal transfers require an active employment position',
      );
    }

    const targetPosition = await this.prisma.position.findUniqueOrThrow({
      where: { id: dto.targetPositionId ?? existing.targetPositionId },
      select: {
        id: true,
        departmentId: true,
        grade: {
          select: {
            level: true,
          },
        },
      },
    });

    await this.assertTransferEligibility(
      existing.employeeId,
      {
        positionId: employment.positionId,
        hiredAt: employment.hiredAt,
        position: employment.position,
      },
      targetPosition,
      dto.requestType ?? existing.requestType,
    );

    const data: Prisma.InternalTransferRequestUncheckedUpdateInput = {
      ...(dto.requestType !== undefined
        ? { requestType: dto.requestType }
        : {}),
      ...(dto.targetPositionId !== undefined
        ? { targetPositionId: dto.targetPositionId }
        : {}),
      ...(dto.reason !== undefined ? { reason: dto.reason.trim() } : {}),
      ...(dto.businessCase !== undefined
        ? { businessCase: toPrismaNullableJsonValue(dto.businessCase) }
        : {}),
      ...(dto.desiredEffectiveDate !== undefined
        ? {
            desiredEffectiveDate: parseOptionalDateOnly(
              dto.desiredEffectiveDate,
            ),
          }
        : {}),
      ...(dto.compensationChange !== undefined
        ? {
            compensationChange: toPrismaNullableJsonValue(
              dto.compensationChange,
            ),
          }
        : {}),
    };

    const row = await this.prisma.internalTransferRequest.update({
      where: { id },
      data,
    });

    return mapInternalTransferRequest(row);
  }

  async submit(id: string) {
    const existing = await this.prisma.internalTransferRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Internal transfer request not found');
    }
    assertRequestSubmittable(existing.status, 'internal transfer requests');

    const row = await this.prisma.internalTransferRequest.update({
      where: { id },
      data: {
        status: 'PENDING',
        submittedAt: existing.submittedAt ?? new Date(),
        approvedById: null,
        approvedAt: null,
        rejectionReason: null,
      },
    });

    return mapInternalTransferRequest(row);
  }

  async approve(id: string, dto: ApproveInternalTransferRequestDto) {
    const existing = await this.prisma.internalTransferRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Internal transfer request not found');
    }
    assertRequestPending(existing.status, 'internal transfer requests');

    await this.prisma.user.findUniqueOrThrow({
      where: { id: dto.approvedById },
      select: { id: true },
    });

    const employment = await this.prisma.userEmployment.findUnique({
      where: { employeeId: existing.employeeId },
      select: {
        id: true,
        employeeCode: true,
        employmentType: true,
        managerEmploymentId: true,
      },
    });
    if (!employment) {
      throw new BadRequestException(
        'Internal transfer approval requires an employment record',
      );
    }

    const targetPosition = await this.prisma.position.findUnique({
      where: { id: existing.targetPositionId },
      select: {
        id: true,
        departmentId: true,
      },
    });
    if (!targetPosition) {
      throw new NotFoundException('Target position not found');
    }

    const effectiveFrom =
      parseOptionalDateOnly(dto.effectiveFrom) ??
      existing.desiredEffectiveDate ??
      new Date();

    const row = await this.prisma.$transaction(async (tx) => {
      await this.applyEmploymentMovement(tx, employment, targetPosition, {
        approvedById: dto.approvedById,
        effectiveFrom,
        requestType: existing.requestType,
        changeReason: dto.changeReason ?? `${existing.requestType} approved`,
      });

      return tx.internalTransferRequest.update({
        where: { id },
        data: {
          status: 'APPROVED',
          approvedById: dto.approvedById,
          approvedAt: new Date(),
          rejectionReason: null,
        },
      });
    });

    return mapInternalTransferRequest(row);
  }

  async reject(
    id: string,
    dto: RejectInternalTransferRequestDto,
    approvedById: string,
  ) {
    const existing = await this.prisma.internalTransferRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Internal transfer request not found');
    }
    assertRequestPending(existing.status, 'internal transfer requests');

    await this.prisma.user.findUniqueOrThrow({
      where: { id: approvedById },
      select: { id: true },
    });

    const row = await this.prisma.internalTransferRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        approvedById,
        approvedAt: new Date(),
        rejectionReason: dto.rejectionReason.trim(),
      },
    });

    return mapInternalTransferRequest(row);
  }

  private async assertTransferEligibility(
    employeeId: string,
    employment: {
      positionId: string | null;
      hiredAt: Date | null;
      position: { grade: { level: number } | null } | null;
    },
    targetPosition: {
      id: string;
      grade: { level: number } | null;
    },
    requestType: CreateInternalTransferRequestDto['requestType'],
  ) {
    if (employment.positionId === targetPosition.id) {
      throw new BadRequestException(
        'Target position must differ from the current position',
      );
    }

    const currentLevel = employment.position?.grade?.level ?? null;
    const targetLevel = targetPosition.grade?.level ?? null;

    if (
      requestType === 'PROMOTION' &&
      currentLevel != null &&
      targetLevel != null &&
      targetLevel <= currentLevel
    ) {
      throw new BadRequestException(
        'Promotion requests require a higher target grade level',
      );
    }

    if (
      requestType === 'TRANSFER' &&
      currentLevel != null &&
      targetLevel != null &&
      targetLevel > currentLevel
    ) {
      throw new BadRequestException(
        'Use a promotion request for upward grade changes',
      );
    }

    if (
      requestType === 'TRANSFER' &&
      employment.hiredAt &&
      employment.hiredAt.getTime() > Date.now() - 90 * 24 * 60 * 60 * 1000
    ) {
      throw new BadRequestException(
        'Transfers require at least 90 days of tenure',
      );
    }

    if (requestType === 'PROMOTION') {
      const latestReview = await this.prisma.performanceReview.findFirst({
        where: { employeeId, status: 'COMPLETED' },
        orderBy: [{ completedAt: 'desc' }],
        select: { promotionEligible: true },
      });
      if (!latestReview?.promotionEligible) {
        throw new BadRequestException(
          'Promotion transfer requests require a promotion-eligible performance review',
        );
      }

      const currentYear = new Date().getUTCFullYear();
      const okrAggregate = await this.prisma.okr.aggregate({
        where: {
          employeeId,
          scope: 'USER',
          periodYear: currentYear,
        },
        _avg: {
          overallProgress: true,
        },
      });

      if ((okrAggregate._avg.overallProgress ?? 0) < 70) {
        throw new BadRequestException(
          'Promotion transfer requests require average current-year user OKR progress of at least 70%',
        );
      }
    }
  }

  private async applyEmploymentMovement(
    tx: Prisma.TransactionClient,
    employment: {
      id: string;
      employeeCode: string | null;
      employmentType: string;
      managerEmploymentId: string | null;
    },
    targetPosition: {
      id: string;
      departmentId: string;
    },
    input: {
      approvedById: string;
      effectiveFrom: Date;
      requestType: string;
      changeReason: string;
    },
  ) {
    await tx.userEmployment.update({
      where: { id: employment.id },
      data: {
        positionId: targetPosition.id,
      },
    });

    await tx.userEmploymentHistory.updateMany({
      where: {
        userEmploymentId: employment.id,
        effectiveTo: null,
      },
      data: {
        effectiveTo: input.effectiveFrom,
      },
    });

    await tx.userEmploymentHistory.create({
      data: {
        userEmploymentId: employment.id,
        employeeCode: employment.employeeCode,
        departmentId: targetPosition.departmentId,
        positionId: targetPosition.id,
        employmentType: employment.employmentType as never,
        managerEmploymentId: employment.managerEmploymentId,
        effectiveFrom: input.effectiveFrom,
        changeReason: input.changeReason,
        changedById: input.approvedById,
      },
    });
  }
}
